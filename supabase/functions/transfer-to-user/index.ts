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
            senderUserId,
            recipientEmail,
            amount,
            currency,
            description,
        } = await req.json()

        // Validate inputs
        if (!senderUserId || !recipientEmail || !amount || !currency) {
            throw new Error('Missing required fields')
        }

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0')
        }

        // Create Supabase client with service role key
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Find recipient user by email
        const { data: recipientUserData, error: recipientLookupError } = await supabase.auth.admin.listUsers()

        if (recipientLookupError) {
            throw new Error('Failed to look up recipient')
        }

        const recipientUser = recipientUserData.users.find(u => u.email?.toLowerCase() === recipientEmail.toLowerCase())

        if (!recipientUser) {
            throw new Error('Recipient not found. Make sure they have a FinoraX account.')
        }

        if (recipientUser.id === senderUserId) {
            throw new Error('Cannot transfer to yourself')
        }

        // Get sender's wallet
        const { data: senderWallet, error: senderWalletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', senderUserId)
            .eq('currency', currency)
            .single()

        if (senderWalletError || !senderWallet) {
            throw new Error(`You don't have a ${currency} wallet`)
        }

        if (senderWallet.balance < amount) {
            throw new Error(`Insufficient balance. You have ${currency} ${senderWallet.balance.toFixed(2)}`)
        }

        // Get or create recipient's wallet
        let recipientWallet
        const { data: existingRecipientWallet, error: recipientWalletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', recipientUser.id)
            .eq('currency', currency)
            .single()

        if (recipientWalletError && recipientWalletError.code !== 'PGRST116') {
            throw new Error('Failed to find recipient wallet')
        }

        if (!existingRecipientWallet) {
            // Create wallet for recipient
            const { data: newWallet, error: createError } = await supabase
                .from('wallets')
                .insert({
                    user_id: recipientUser.id,
                    currency: currency,
                    balance: 0,
                })
                .select()
                .single()

            if (createError) {
                throw new Error('Failed to create recipient wallet')
            }
            recipientWallet = newWallet
        } else {
            recipientWallet = existingRecipientWallet
        }

        // Perform the transfer
        // 1. Deduct from sender
        const { error: deductError } = await supabase
            .from('wallets')
            .update({ balance: senderWallet.balance - amount })
            .eq('id', senderWallet.id)

        if (deductError) {
            throw new Error('Failed to deduct from sender wallet')
        }

        // 2. Credit to recipient
        const { error: creditError } = await supabase
            .from('wallets')
            .update({ balance: recipientWallet.balance + amount })
            .eq('id', recipientWallet.id)

        if (creditError) {
            // Try to rollback sender deduction
            await supabase
                .from('wallets')
                .update({ balance: senderWallet.balance })
                .eq('id', senderWallet.id)
            throw new Error('Failed to credit recipient wallet')
        }

        // 3. Record sender transaction (debit)
        await supabase
            .from('transactions')
            .insert({
                wallet_id: senderWallet.id,
                user_id: senderUserId,
                type: 'transfer',
                amount: -amount,
                currency: currency,
                description: description || `Transfer to ${recipientEmail}`,
                recipient_name: recipientEmail,
                status: 'completed',
                category: 'other',
            })

        // 4. Record recipient transaction (credit)
        await supabase
            .from('transactions')
            .insert({
                wallet_id: recipientWallet.id,
                user_id: recipientUser.id,
                type: 'transfer',
                amount: amount,
                currency: currency,
                description: `Received from ${senderUserId}`,
                status: 'completed',
                category: 'income',
            })

        return new Response(
            JSON.stringify({
                success: true,
                message: `Successfully transferred ${currency} ${amount} to ${recipientEmail}`,
                recipientEmail: recipientEmail,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Transfer error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                message: error.message || 'Transfer failed',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
