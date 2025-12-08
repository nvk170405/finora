import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Minimum withdrawal amounts by currency
const MIN_WITHDRAWAL: Record<string, number> = {
    USD: 10,
    EUR: 10,
    GBP: 10,
    INR: 100,
    JPY: 1000,
    CAD: 15,
    AUD: 15,
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
            country,
            accountHolderName,
            accountNumber,
            bankCode,        // IFSC, Routing Number, Sort Code, IBAN, or SWIFT
            bankCodeType,    // Type of bank code: IFSC, ROUTING, SORT, IBAN, SWIFT
            swiftCode,       // Optional SWIFT/BIC for international transfers
            bankName,
        } = await req.json()

        // Validate inputs
        if (!userId || !walletId || !amount || !accountHolderName || !accountNumber || !bankCode) {
            throw new Error('Missing required fields')
        }

        // Get minimum amount for currency
        const minAmount = MIN_WITHDRAWAL[currency] || 10
        if (amount < minAmount) {
            throw new Error(`Minimum withdrawal amount is ${currency} ${minAmount}`)
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

        // Create withdrawal request with international bank details
        const { data: request, error: requestError } = await supabase
            .from('withdrawal_requests')
            .insert({
                user_id: userId,
                wallet_id: walletId,
                amount: amount,
                currency: currency || wallet.currency,
                country: country || 'IN',
                account_holder_name: accountHolderName,
                account_number: accountNumber,
                bank_code: bankCode,
                bank_code_type: bankCodeType || 'IFSC',
                swift_code: swiftCode || null,
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

        // Get country name for description
        const countryNames: Record<string, string> = {
            IN: 'India',
            US: 'USA',
            GB: 'UK',
            EU: 'Europe',
            OTHER: 'International',
        }
        const countryLabel = countryNames[country] || 'International'

        // Record transaction
        await supabase
            .from('transactions')
            .insert({
                wallet_id: walletId,
                user_id: userId,
                type: 'withdrawal',
                amount: -amount,
                currency: currency || wallet.currency,
                description: `Withdrawal to ${countryLabel} bank A/C ****${accountNumber.slice(-4)}`,
                status: 'pending',
                category: 'other',
            })

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Withdrawal request submitted successfully',
                requestId: request.id,
                estimatedTime: country === 'IN' ? '1-3 business days' : '3-5 business days',
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
