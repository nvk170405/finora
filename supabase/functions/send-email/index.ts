import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email templates
const templates = {
    deposit: (name: string, amount: string, currency: string) => ({
        subject: `💰 Deposit Confirmed - ${currency} ${amount}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <h1 style="color: #a3e635; text-align: center;">FinoraX</h1>
                <h2 style="color: #ffffff;">Deposit Confirmed! 🎉</h2>
                <p style="color: #a0a0a0;">Hi ${name},</p>
                <p style="color: #a0a0a0;">Your deposit of <strong style="color: #a3e635;">${currency} ${amount}</strong> has been successfully processed.</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email from FinoraX.</p>
            </div>
        `
    }),
    withdrawal: (name: string, amount: string, currency: string, status: string) => ({
        subject: `🏦 Withdrawal ${status === 'pending' ? 'Initiated' : 'Processed'} - ${currency} ${amount}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <h1 style="color: #a3e635; text-align: center;">FinoraX</h1>
                <h2 style="color: #ffffff;">Withdrawal ${status === 'pending' ? 'Initiated' : 'Completed'}</h2>
                <p style="color: #a0a0a0;">Hi ${name},</p>
                <p style="color: #a0a0a0;">Your withdrawal of <strong style="color: #f59e0b;">${currency} ${amount}</strong> has been ${status}.</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email from FinoraX.</p>
            </div>
        `
    }),
    trialExpiring: (name: string, daysLeft: number) => ({
        subject: `⏰ Your FinoraX trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
        html: `<div style="font-family: Arial;"><h1>FinoraX</h1><p>Hi ${name}, your trial expires in ${daysLeft} days!</p></div>`
    }),
    trialExpired: (name: string) => ({
        subject: `😢 Your FinoraX trial has expired`,
        html: `<div style="font-family: Arial;"><h1>FinoraX</h1><p>Hi ${name}, your trial has expired. Subscribe to continue!</p></div>`
    }),
}

// Simple SMTP client using Deno.connect (Deno v2 compatible)
async function sendGmailSMTP(
    user: string,
    password: string,
    to: string,
    subject: string,
    html: string
) {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Connect to Gmail SMTP
    const conn = await Deno.connectTls({
        hostname: "smtp.gmail.com",
        port: 465,
    })

    const read = async () => {
        const buf = new Uint8Array(1024)
        const n = await conn.read(buf)
        return n ? decoder.decode(buf.subarray(0, n)) : ""
    }

    const write = async (data: string) => {
        await conn.write(encoder.encode(data + "\r\n"))
    }

    // SMTP conversation
    await read() // 220 greeting

    await write(`EHLO localhost`)
    await read() // 250 capabilities

    await write(`AUTH LOGIN`)
    await read() // 334

    await write(encodeBase64(user))
    await read() // 334

    await write(encodeBase64(password))
    const authResponse = await read()
    if (!authResponse.includes("235")) {
        throw new Error("SMTP authentication failed")
    }

    await write(`MAIL FROM:<${user}>`)
    await read() // 250

    await write(`RCPT TO:<${to}>`)
    await read() // 250

    await write(`DATA`)
    await read() // 354

    // Construct email with proper headers
    const email = [
        `From: FinoraX <${user}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        html,
        `.`
    ].join("\r\n")

    await write(email)
    await read() // 250 OK

    await write(`QUIT`)
    conn.close()
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const GMAIL_USER = Deno.env.get('GMAIL_USER')
        const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            throw new Error('Gmail credentials not configured')
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
                emailContent = templates.withdrawal(name, data.amount, data.currency, data.status || 'pending')
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

        // Send email via Gmail SMTP
        await sendGmailSMTP(
            GMAIL_USER,
            GMAIL_APP_PASSWORD,
            email,
            emailContent.subject,
            emailContent.html
        )

        console.log('Email sent successfully to:', email)

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Email error:', errorMessage)
        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
