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

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured')
        }

        const { amount, currency, walletId, userId } = await req.json()

        // Validate inputs
        if (!amount || !walletId || !userId) {
            throw new Error('Missing required fields: amount, walletId, userId')
        }

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0')
        }

        // Convert to paise (smallest currency unit)
        // For simplicity, we'll convert USD to INR at a fixed rate for now
        // In production, you'd want to use real-time exchange rates
        const USD_TO_INR_RATE = 83; // Approximate rate
        const amountInINR = Math.round(amount * USD_TO_INR_RATE);
        const amountInPaise = amountInINR * 100;

        // Create short receipt (max 40 chars)
        const shortUserId = userId.substring(0, 8)
        const timestamp = Date.now().toString().slice(-8)
        const receipt = `dep_${shortUserId}_${timestamp}`

        const orderData = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receipt,
            notes: {
                userId: userId,
                walletId: walletId,
                originalAmount: amount,
                originalCurrency: currency || 'USD',
                type: 'wallet_deposit'
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
                amountInINR: amountInINR,
                originalAmount: amount,
                currency: order.currency,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error creating deposit order:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
