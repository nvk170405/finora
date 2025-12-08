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
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase credentials not configured')
        }

        const {
            userId,
            walletId,
            amount,
            currency,
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
        } = await req.json()

        // Validate inputs
        if (!userId || !walletId || !amount || !accountHolderName || !accountNumber || !ifscCode) {
            throw new Error('Missing required fields')
        }

        if (amount < 100) {
            throw new Error('Minimum withdrawal amount is ₹100')
        }

        // Create Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Get wallet and verify balance
        const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('id', walletId)
            .eq('user_id', userId)
            .single()

        if (walletError || !wallet) {
            throw new Error('Wallet not found')
        }

        if (wallet.balance < amount) {
            throw new Error(`Insufficient balance. Available: ${wallet.currency} ${wallet.balance.toFixed(2)}`)
        }

        // Check for pending withdrawal requests (prevent duplicate requests)
        const { data: pendingRequests, error: pendingError } = await supabase
            .from('withdrawal_requests')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'pending')

        if (pendingRequests && pendingRequests.length >= 3) {
            throw new Error('You have too many pending withdrawal requests. Please wait for them to be processed.')
        }

        // Deduct from wallet immediately (hold funds)
        const newBalance = wallet.balance - amount
        const { error: updateError } = await supabase
            .from('wallets')
            .update({ balance: newBalance })
            .eq('id', walletId)

        if (updateError) {
            throw new Error('Failed to hold funds')
        }

        // Create withdrawal request
        const { data: request, error: requestError } = await supabase
            .from('withdrawal_requests')
            .insert({
                user_id: userId,
                wallet_id: walletId,
                amount: amount,
                currency: currency || wallet.currency,
                account_holder_name: accountHolderName,
                account_number: accountNumber,
                ifsc_code: ifscCode,
                bank_name: bankName || null,
                status: 'pending',
            })
            .select()
            .single()

        if (requestError) {
            // Rollback wallet balance
            await supabase
                .from('wallets')
                .update({ balance: wallet.balance })
                .eq('id', walletId)

            console.error('Error creating withdrawal request:', requestError)
            throw new Error('Failed to create withdrawal request')
        }

        // Record transaction
        await supabase
            .from('transactions')
            .insert({
                wallet_id: walletId,
                user_id: userId,
                type: 'withdrawal',
                amount: -amount,
                currency: currency || wallet.currency,
                description: `Withdrawal to bank A/C ****${accountNumber.slice(-4)}`,
                status: 'pending',
                category: 'other',
            })

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Withdrawal request submitted successfully',
                requestId: request.id,
                estimatedTime: '1-3 business days',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Withdrawal request error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                message: error.message || 'Withdrawal request failed',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
