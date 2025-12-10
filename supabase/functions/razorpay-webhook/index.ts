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

        console.log('Received webhook event:', event)

        // Create Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Handle different event types
        switch (event) {
            case 'payment.captured':
                console.log('Payment captured:', paymentEntity?.id)

                // Log the successful payment
                await supabase
                    .from('payment_logs')
                    .insert({
                        event_type: 'payment.captured',
                        payment_id: paymentEntity?.id,
                        order_id: paymentEntity?.order_id,
                        amount: paymentEntity?.amount / 100, // Convert from paise to rupees
                        currency: paymentEntity?.currency,
                        status: 'captured',
                        raw_payload: payload,
                        created_at: new Date().toISOString(),
                    })
                    .then(({ error }) => {
                        if (error) console.error('Error logging payment:', error)
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
                    .then(({ error }) => {
                        if (error) console.error('Error logging failed payment:', error)
                    })
                break

            case 'subscription.activated':
            case 'subscription.charged':
                console.log('Subscription event:', event, paymentEntity?.id)
                // Handle subscription events if using Razorpay Subscriptions
                break

            case 'refund.created':
                console.log('Refund created:', payload.payload?.refund?.entity?.id)
                // Handle refunds
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
