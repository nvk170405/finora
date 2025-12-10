import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email templates
const templates = {
    deposit: (name: string, amount: string, currency: string) => ({
        subject: `💰 Deposit Confirmed - ${currency} ${amount}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #a3e635; margin: 0;">FinoraX</h1>
                </div>
                <h2 style="color: #ffffff; margin-bottom: 20px;">Deposit Confirmed! 🎉</h2>
                <p style="color: #a0a0a0; line-height: 1.6;">Hi ${name},</p>
                <p style="color: #a0a0a0; line-height: 1.6;">Your deposit has been successfully processed:</p>
                <div style="background: #252545; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 24px; color: #a3e635; font-weight: bold;">${currency} ${amount}</p>
                    <p style="margin: 10px 0 0 0; color: #a0a0a0; font-size: 14px;">Added to your wallet</p>
                </div>
                <p style="color: #a0a0a0; line-height: 1.6;">Your funds are now available in your dashboard.</p>
                <a href="https://finorax.com/dashboard" style="display: inline-block; background: #a3e635; color: #1a1a2e; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">View Dashboard</a>
                <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated email from FinoraX. Please do not reply.</p>
            </div>
        `
    }),

    withdrawal: (name: string, amount: string, currency: string, status: string) => ({
        subject: `🏦 Withdrawal ${status === 'pending' ? 'Initiated' : 'Processed'} - ${currency} ${amount}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #a3e635; margin: 0;">FinoraX</h1>
                </div>
                <h2 style="color: #ffffff; margin-bottom: 20px;">Withdrawal ${status === 'pending' ? 'Initiated' : 'Completed'}</h2>
                <p style="color: #a0a0a0; line-height: 1.6;">Hi ${name},</p>
                <p style="color: #a0a0a0; line-height: 1.6;">Your withdrawal request has been ${status === 'pending' ? 'initiated' : 'processed'}:</p>
                <div style="background: #252545; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 24px; color: #f59e0b; font-weight: bold;">${currency} ${amount}</p>
                    <p style="margin: 10px 0 0 0; color: #a0a0a0; font-size: 14px;">Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
                </div>
                <p style="color: #a0a0a0; line-height: 1.6;">${status === 'pending' ? 'Your withdrawal is being processed and will be credited to your bank account within 1-3 business days.' : 'Your funds have been transferred to your bank account.'}</p>
                <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated email from FinoraX. Please do not reply.</p>
            </div>
        `
    }),

    trialExpiring: (name: string, daysLeft: number) => ({
        subject: `⏰ Your FinoraX trial expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #a3e635; margin: 0;">FinoraX</h1>
                </div>
                <h2 style="color: #ffffff; margin-bottom: 20px;">Your Trial is Ending Soon! ⏰</h2>
                <p style="color: #a0a0a0; line-height: 1.6;">Hi ${name},</p>
                <p style="color: #a0a0a0; line-height: 1.6;">Your 7-day free trial expires in <strong style="color: #f59e0b;">${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}</strong>.</p>
                <div style="background: #252545; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; color: #a0a0a0;">Don't lose access to:</p>
                    <ul style="color: #a3e635; margin: 15px 0;">
                        <li>Multi-currency wallets</li>
                        <li>AI-powered insights</li>
                        <li>Smart savings goals</li>
                        <li>Finance health score</li>
                    </ul>
                </div>
                <a href="https://finorax.com/pricing" style="display: inline-block; background: #a3e635; color: #1a1a2e; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Upgrade Now</a>
                <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated email from FinoraX. Please do not reply.</p>
            </div>
        `
    }),

    trialExpired: (name: string) => ({
        subject: `😢 Your FinoraX trial has expired`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #a3e635; margin: 0;">FinoraX</h1>
                </div>
                <h2 style="color: #ffffff; margin-bottom: 20px;">Your Trial Has Expired</h2>
                <p style="color: #a0a0a0; line-height: 1.6;">Hi ${name},</p>
                <p style="color: #a0a0a0; line-height: 1.6;">Your 7-day free trial has ended. Subscribe now to continue using all premium features!</p>
                <div style="background: #252545; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; font-size: 18px; color: #a3e635;">Get 20% off your first month!</p>
                    <p style="margin: 10px 0 0 0; color: #a0a0a0; font-size: 14px;">Use code: <strong>COMEBACK20</strong></p>
                </div>
                <a href="https://finorax.com/pricing" style="display: inline-block; background: #a3e635; color: #1a1a2e; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Subscribe Now</a>
                <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated email from FinoraX. Please do not reply.</p>
            </div>
        `
    }),
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!RESEND_API_KEY) {
            throw new Error('Resend API key not configured')
        }

        const { type, userId, data } = await req.json()

        // Create Supabase client
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
        if (userError || !userData.user?.email) {
            throw new Error('User not found')
        }

        const email = userData.user.email
        const name = userData.user.user_metadata?.full_name || email.split('@')[0]

        let emailContent
        switch (type) {
            case 'deposit':
                emailContent = templates.deposit(name, data.amount, data.currency)
                break
            case 'withdrawal':
                emailContent = templates.withdrawal(name, data.amount, data.currency, data.status)
                break
            case 'trial_expiring':
                emailContent = templates.trialExpiring(name, data.daysLeft)
                break
            case 'trial_expired':
                emailContent = templates.trialExpired(name)
                break
            default:
                throw new Error('Invalid email type')
        }

        // Send email via Resend
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'FinoraX <notifications@finorax.com>',
                to: [email],
                subject: emailContent.subject,
                html: emailContent.html,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to send email: ${error}`)
        }

        const result = await response.json()
        console.log('Email sent:', result.id)

        return new Response(
            JSON.stringify({ success: true, emailId: result.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        console.error('Email error:', error.message)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
