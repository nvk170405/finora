import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Exchange rates TO INR (Razorpay only accepts INR)
const TO_INR_RATES: Record<string, number> = {
    USD: 83,
    EUR: 90,
    GBP: 105,
    JPY: 0.56,
    CAD: 61,
    AUD: 54,
    INR: 1, // No conversion needed
}

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
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

        // Get conversion rate for the currency (or default to USD rate)
        const currencyCode = currency || 'USD'
        const conversionRate = TO_INR_RATES[currencyCode] || TO_INR_RATES.USD
        const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || '$'

        // Convert to INR (Razorpay only accepts INR for Indian accounts)
        // If the currency IS INR, no conversion needed
        const amountInINR = currencyCode === 'INR'
            ? Math.round(amount)  // Already in INR
            : Math.round(amount * conversionRate)  // Convert to INR

        // Convert to paise (smallest currency unit)
        const amountInPaise = amountInINR * 100

        console.log(`Deposit: ${currencySymbol}${amount} ${currencyCode} = ₹${amountInINR} (${amountInPaise} paise)`)

        // Create short receipt (max 40 chars)
        const shortUserId = userId.substring(0, 8)
        const timestamp = Date.now().toString().slice(-8)
        const receipt = `dep_${shortUserId}_${timestamp}`

        const orderData = {
            amount: amountInPaise,
            currency: 'INR', // Razorpay only accepts INR for Indian merchant accounts
            receipt: receipt,
            notes: {
                userId: userId,
                walletId: walletId,
                originalAmount: amount,
                originalCurrency: currencyCode,
                amountInINR: amountInINR,
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
                originalCurrency: currencyCode,
                currencySymbol: currencySymbol,
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
