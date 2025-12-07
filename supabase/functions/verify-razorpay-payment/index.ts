import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

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
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay secret not configured')
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase credentials not configured')
        }

        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            plan,
            billingCycle,
            userId,
        } = await req.json()

        // Validate inputs
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            throw new Error('Missing payment verification data')
        }

        if (!plan || !billingCycle || !userId) {
            throw new Error('Missing subscription data')
        }

        // Verify the payment signature
        const generatedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (generatedSignature !== razorpay_signature) {
            throw new Error('Payment verification failed: Invalid signature')
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
        const { data: existingSubscription, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (existingSubscription) {
            // Update existing subscription
            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    plan: plan,
                    billing_cycle: billingCycle,
                    razorpay_payment_id: razorpay_payment_id,
                    razorpay_order_id: razorpay_order_id,
                    payment_status: 'completed',
                    start_date: now.toISOString(),
                    end_date: endDate.toISOString(),
                })
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
                    plan: plan,
                    billing_cycle: billingCycle,
                    razorpay_payment_id: razorpay_payment_id,
                    razorpay_order_id: razorpay_order_id,
                    payment_status: 'completed',
                    start_date: now.toISOString(),
                    end_date: endDate.toISOString(),
                })

            if (insertError) {
                console.error('Error creating subscription:', insertError)
                throw new Error('Failed to create subscription')
            }
        }

        // Get user email for confirmation
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

        if (userData?.user?.email) {
            // Send confirmation email using Supabase Auth email (or custom email service)
            // Note: For production, you might want to use a proper email service like Resend, SendGrid, etc.
            console.log(`Payment confirmation for ${userData.user.email}:`, {
                plan,
                billingCycle,
                paymentId: razorpay_payment_id,
            })

            // You can integrate with Resend, SendGrid, or other email services here
            // For now, we'll just log it
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Payment verified and subscription activated',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error verifying payment:', error)
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
