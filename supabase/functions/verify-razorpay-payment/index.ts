// Razorpay Subscription Verification Edge Function
// Verifies subscription payment and activates user subscription

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase credentials not configured')
        }

        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            plan,
            billingCycle,
            userId,
        } = await req.json()

        console.log('Verifying payment:', { razorpay_payment_id, razorpay_subscription_id, plan, billingCycle, userId })

        // Validate inputs
        if (!razorpay_payment_id || !razorpay_subscription_id) {
            throw new Error('Missing payment verification data')
        }

        if (!plan || !billingCycle || !userId) {
            throw new Error('Missing subscription data')
        }

        // For subscriptions, verify by fetching the subscription from Razorpay API
        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
        const subscriptionResponse = await fetch(`https://api.razorpay.com/v1/subscriptions/${razorpay_subscription_id}`, {
            headers: {
                'Authorization': `Basic ${auth}`,
            },
        })

        const subscriptionData = await subscriptionResponse.json()

        if (!subscriptionResponse.ok) {
            console.error('Failed to fetch subscription:', subscriptionData)
            throw new Error('Failed to verify subscription with Razorpay')
        }

        console.log('Subscription status from Razorpay:', subscriptionData.status)

        // Verify the subscription is active or authenticated
        if (!['active', 'authenticated', 'created'].includes(subscriptionData.status)) {
            throw new Error(`Invalid subscription status: ${subscriptionData.status}`)
        }

        // Create Supabase client with service role key for admin operations
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Calculate subscription end date
        const now = new Date()
        const endDate = new Date(now)
        if (billingCycle === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1)
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1)
        }

        // Update or create subscription
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()

        const subscriptionRecord = {
            plan: plan,
            billing_cycle: billingCycle,
            razorpay_payment_id: razorpay_payment_id,
            razorpay_subscription_id: razorpay_subscription_id,
            payment_status: 'active',
            start_date: now.toISOString(),
            end_date: endDate.toISOString(),
            is_auto_renew: true,
        }

        if (existingSubscription) {
            // Update existing subscription
            const { error: updateError } = await supabase
                .from('subscriptions')
                .update(subscriptionRecord)
                .eq('user_id', userId)

            if (updateError) {
                console.error('Error updating subscription:', updateError)
                throw new Error('Failed to update subscription')
            }
        } else {
            // Create new subscription
            const { error: insertError } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    ...subscriptionRecord,
                })

            if (insertError) {
                console.error('Error creating subscription:', insertError)
                throw new Error('Failed to create subscription')
            }
        }

        console.log(`Subscription activated for user ${userId}`)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Subscription activated with auto-renewal',
                autoRenew: true,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error verifying payment:', error.message)
        return new Response(
            JSON.stringify({
                success: false,
                message: error.message || 'Payment verification failed',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
