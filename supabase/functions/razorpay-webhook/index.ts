// Razorpay Webhook Handler - Auto-Recurring Subscription Events
// Handles subscription charged/halted/cancelled events for auto-renewal

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!RAZORPAY_WEBHOOK_SECRET) {
            console.error('Webhook secret not configured')
            throw new Error('Webhook secret not configured')
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase credentials not configured')
        }

        // Get the raw body and signature
        const body = await req.text()
        const signature = req.headers.get('x-razorpay-signature')

        if (!signature) {
            throw new Error('Missing webhook signature')
        }

        // Verify the webhook signature
        const expectedSignature = createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex')

        if (expectedSignature !== signature) {
            console.error('Invalid webhook signature')
            throw new Error('Invalid webhook signature')
        }

        // Parse the webhook payload
        const payload = JSON.parse(body)
        const event = payload.event
        const paymentEntity = payload.payload?.payment?.entity
        const subscriptionEntity = payload.payload?.subscription?.entity

        console.log('Received webhook event:', event)

        // Create Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Handle different event types
        switch (event) {
            case 'subscription.authenticated':
                // First payment authorized but not charged yet
                console.log('Subscription authenticated:', subscriptionEntity?.id)
                break

            case 'subscription.activated':
                // Subscription is now active
                console.log('Subscription activated:', subscriptionEntity?.id)
                // This is handled by verify-razorpay-payment
                break

            case 'subscription.charged':
                // Recurring payment successful - EXTEND SUBSCRIPTION
                console.log('Subscription charged (auto-renewal):', subscriptionEntity?.id)

                if (subscriptionEntity?.notes?.userId) {
                    const userId = subscriptionEntity.notes.userId
                    const billingCycle = subscriptionEntity.notes.billingCycle
                    const plan = subscriptionEntity.notes.plan

                    // Calculate new end date
                    const endDate = new Date()
                    if (billingCycle === 'monthly') {
                        endDate.setMonth(endDate.getMonth() + 1)
                    } else {
                        endDate.setFullYear(endDate.getFullYear() + 1)
                    }

                    // Extend subscription in database
                    const { error: updateError } = await supabase
                        .from('subscriptions')
                        .update({
                            end_date: endDate.toISOString(),
                            payment_status: 'active',
                            razorpay_payment_id: paymentEntity?.id,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', userId)

                    if (updateError) {
                        console.error('Error extending subscription:', updateError)
                    } else {
                        console.log(`Subscription extended for user ${userId} until ${endDate.toISOString()}`)
                    }

                    // Log the payment
                    await supabase.from('payment_logs').insert({
                        event_type: 'subscription.charged',
                        payment_id: paymentEntity?.id,
                        subscription_id: subscriptionEntity?.id,
                        amount: paymentEntity?.amount / 100,
                        currency: paymentEntity?.currency || 'INR',
                        status: 'charged',
                        user_id: userId,
                        raw_payload: payload,
                        created_at: new Date().toISOString(),
                    })
                }
                break

            case 'subscription.halted':
                // Payment failed after retries - subscription halted
                console.log('Subscription halted (payment failed):', subscriptionEntity?.id)

                if (subscriptionEntity?.notes?.userId) {
                    const userId = subscriptionEntity.notes.userId

                    // Mark subscription as halted
                    await supabase
                        .from('subscriptions')
                        .update({
                            payment_status: 'halted',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', userId)

                    console.log(`Subscription halted for user ${userId}`)
                }
                break

            case 'subscription.cancelled':
                // User cancelled the subscription
                console.log('Subscription cancelled:', subscriptionEntity?.id)

                if (subscriptionEntity?.notes?.userId) {
                    const userId = subscriptionEntity.notes.userId

                    // Mark subscription as cancelled but keep end_date for access until expiry
                    await supabase
                        .from('subscriptions')
                        .update({
                            payment_status: 'cancelled',
                            is_auto_renew: false,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', userId)

                    console.log(`Subscription cancelled for user ${userId}`)
                }
                break

            case 'subscription.completed':
                // Subscription reached total_count
                console.log('Subscription completed:', subscriptionEntity?.id)
                break

            case 'subscription.pending':
                // Subscription is pending (awaiting payment)
                console.log('Subscription pending:', subscriptionEntity?.id)
                break

            case 'payment.captured':
                console.log('Payment captured:', paymentEntity?.id)

                // Log the successful payment
                await supabase
                    .from('payment_logs')
                    .insert({
                        event_type: 'payment.captured',
                        payment_id: paymentEntity?.id,
                        order_id: paymentEntity?.order_id,
                        amount: paymentEntity?.amount / 100,
                        currency: paymentEntity?.currency,
                        status: 'captured',
                        raw_payload: payload,
                        created_at: new Date().toISOString(),
                    })
                break

            case 'payment.failed':
                console.log('Payment failed:', paymentEntity?.id)

                // Log the failed payment
                await supabase
                    .from('payment_logs')
                    .insert({
                        event_type: 'payment.failed',
                        payment_id: paymentEntity?.id,
                        order_id: paymentEntity?.order_id,
                        amount: paymentEntity?.amount / 100,
                        currency: paymentEntity?.currency,
                        status: 'failed',
                        error_code: paymentEntity?.error_code,
                        error_description: paymentEntity?.error_description,
                        raw_payload: payload,
                        created_at: new Date().toISOString(),
                    })
                break

            case 'refund.created':
                console.log('Refund created:', payload.payload?.refund?.entity?.id)
                break

            default:
                console.log('Unhandled webhook event:', event)
        }

        return new Response(
            JSON.stringify({ success: true, received: true }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Webhook error:', error.message)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
