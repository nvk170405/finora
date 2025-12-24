// Cancel Razorpay Subscription Edge Function
// Allows users to cancel their auto-renewing subscription

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured')
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase credentials not configured')
        }

        const { userId, cancelAtCycleEnd } = await req.json()

        console.log('Cancel subscription request:', { userId, cancelAtCycleEnd })

        if (!userId) {
            throw new Error('Missing required field: userId')
        }

        // Get user's subscription from database
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const { data: subscription, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (fetchError || !subscription) {
            throw new Error('No active subscription found')
        }

        if (!subscription.razorpay_subscription_id) {
            throw new Error('No Razorpay subscription ID found')
        }

        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

        // Cancel the subscription via Razorpay API
        const cancelResponse = await fetch(
            `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/cancel`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cancel_at_cycle_end: cancelAtCycleEnd !== false, // Default: cancel at cycle end
                }),
            }
        )

        const cancelData = await cancelResponse.json()

        if (!cancelResponse.ok) {
            console.error('Failed to cancel subscription:', cancelData)
            throw new Error(`Failed to cancel subscription: ${cancelData.error?.description || 'Unknown error'}`)
        }

        // Update database - keep end_date so user can use until end of billing period
        await supabase
            .from('subscriptions')
            .update({
                payment_status: 'cancelled',
                is_auto_renew: false,
            })
            .eq('user_id', userId)

        console.log(`Subscription cancelled for user ${userId}. Cancel at cycle end: ${cancelAtCycleEnd !== false}`)

        return new Response(
            JSON.stringify({
                success: true,
                message: cancelAtCycleEnd !== false
                    ? 'Subscription will be cancelled at the end of your billing period'
                    : 'Subscription cancelled immediately',
                endDate: subscription.end_date,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        console.error('Error cancelling subscription:', error.message)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
