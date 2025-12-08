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
            walletId,
            amount,
            userId,
        } = await req.json()

        // Validate inputs
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            throw new Error('Missing payment verification data')
        }

        if (!walletId || !amount || !userId) {
            throw new Error('Missing deposit data')
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

        // Get current wallet balance
        const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('id', walletId)
            .eq('user_id', userId)
            .single()

        if (walletError || !wallet) {
            console.error('Error fetching wallet:', walletError)
            throw new Error('Wallet not found')
        }

        const newBalance = wallet.balance + amount

        // Update wallet balance
        const { error: updateError } = await supabase
            .from('wallets')
            .update({ balance: newBalance })
            .eq('id', walletId)
            .eq('user_id', userId)

        if (updateError) {
            console.error('Error updating wallet:', updateError)
            throw new Error('Failed to update wallet balance')
        }

        // Record the transaction
        const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
                wallet_id: walletId,
                user_id: userId,
                amount: amount,
                type: 'deposit',
                status: 'completed',
                description: `Deposit via Razorpay`,
                razorpay_payment_id: razorpay_payment_id,
                razorpay_order_id: razorpay_order_id,
            })

        if (transactionError) {
            console.error('Error recording transaction:', transactionError)
            // Don't throw - wallet already updated, just log the error
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Deposit successful',
                newBalance: newBalance,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error verifying deposit:', error)
        return new Response(
            JSON.stringify({
                success: false,
                message: error.message || 'Deposit verification failed',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
