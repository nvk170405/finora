// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Plan pricing in paise (smallest currency unit)
const PLAN_PRICING = {
    basic: {
        monthly: 79900,    // ₹799
        yearly: 799000,    // ₹7,990
    },
    premium: {
        monthly: 199900,   // ₹1,999
        yearly: 1999000,   // ₹19,990
    },
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured')
        }

        const { plan, billingCycle, userId } = await req.json()

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

        // Get the amount based on plan and billing cycle
        const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle as 'monthly' | 'yearly']

        // Create Razorpay order - receipt must be max 40 chars
        const shortUserId = userId.substring(0, 8)
        const timestamp = Date.now().toString().slice(-8)
        const receipt = `${shortUserId}_${plan}_${billingCycle.charAt(0)}_${timestamp}`

        const orderData = {
            amount: amount,
            currency: 'INR',
            receipt: receipt,
            notes: {
                userId: userId,
                plan: plan,
                billingCycle: billingCycle,
            }
        }

        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Razorpay error:', errorData)
            throw new Error(`Razorpay order creation failed: ${errorData.error?.description || 'Unknown error'}`)
        }

        const order = await response.json()

        return new Response(
            JSON.stringify({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error creating order:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
