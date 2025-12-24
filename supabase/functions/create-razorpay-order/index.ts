// Razorpay Subscription Creation Edge Function
// Creates auto-recurring subscriptions using Razorpay Subscriptions API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

        // Plan IDs from environment variables (secrets)
        const PLAN_IDS = {
            basic_monthly: Deno.env.get('RAZORPAY_PLAN_BASIC_MONTHLY'),
            basic_yearly: Deno.env.get('RAZORPAY_PLAN_BASIC_YEARLY'),
            premium_monthly: Deno.env.get('RAZORPAY_PLAN_PREMIUM_MONTHLY'),
            premium_yearly: Deno.env.get('RAZORPAY_PLAN_PREMIUM_YEARLY'),
        }

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            console.error('Missing Razorpay credentials')
            throw new Error('Razorpay credentials not configured')
        }

        const { plan, billingCycle, userId } = await req.json()

        console.log('Received request:', { plan, billingCycle, userId })

        // Validate inputs
        if (!plan || !billingCycle || !userId) {
            throw new Error('Missing required fields: plan, billingCycle, userId')
        }

        if (!['basic', 'premium'].includes(plan)) {
            throw new Error('Invalid plan')
        }

        if (!['monthly', 'yearly'].includes(billingCycle)) {
            throw new Error('Invalid billing cycle')
        }

        // Get the plan ID based on plan and billing cycle
        const planKey = `${plan}_${billingCycle}` as keyof typeof PLAN_IDS
        const planId = PLAN_IDS[planKey]

        if (!planId) {
            console.error('Plan ID not configured for:', planKey)
            throw new Error(`Plan ID not configured: ${planKey}. Please set RAZORPAY_PLAN_${plan.toUpperCase()}_${billingCycle.toUpperCase()} secret.`)
        }

        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

        // Total billing cycles (max 120 for monthly = 10 years, or 10 for yearly)
        const totalCount = billingCycle === 'monthly' ? 120 : 10

        // Create Razorpay Subscription
        const subscriptionData = {
            plan_id: planId,
            total_count: totalCount,
            customer_notify: 1,
            notes: {
                userId: userId,
                plan: plan,
                billingCycle: billingCycle,
            }
        }

        console.log('Creating subscription with:', { planId, planKey, totalCount })

        const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData),
        })

        const responseData = await response.json()

        if (!response.ok) {
            console.error('Razorpay error:', responseData)
            throw new Error(`Razorpay subscription creation failed: ${responseData.error?.description || JSON.stringify(responseData)}`)
        }

        console.log('Subscription created:', responseData.id)

        return new Response(
            JSON.stringify({
                subscriptionId: responseData.id,
                shortUrl: responseData.short_url,
                status: responseData.status,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error creating subscription:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
