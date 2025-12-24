import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email templates
const templates = {
    // Transaction notification
    transaction: (name: string, type: string, amount: string, currency: string, category: string) => ({
        subject: `📊 Transaction Recorded - ${type === 'deposit' ? '+' : '-'}${currency}${amount}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <h1 style="color: #a3e635; text-align: center;">FinoraX</h1>
                <h2 style="color: #ffffff;">Transaction Recorded 📊</h2>
                <p style="color: #a0a0a0;">Hi ${name},</p>
                <p style="color: #a0a0a0;">A new ${type} has been recorded in your account:</p>
                <div style="background: #2a2a4e; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong style="color: #a3e635;">Amount:</strong> <span style="color: ${type === 'deposit' ? '#22c55e' : '#ef4444'};">${type === 'deposit' ? '+' : '-'}${currency}${amount}</span></p>
                    <p style="margin: 8px 0;"><strong style="color: #a3e635;">Category:</strong> ${category}</p>
                    <p style="margin: 8px 0;"><strong style="color: #a3e635;">Type:</strong> ${type}</p>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email from FinoraX.</p>
            </div>
        `
    }),

    // Savings goal reached
    goalReached: (name: string, goalName: string, targetAmount: string, currency: string) => ({
        subject: `🎯 Goal Achieved! - ${goalName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <h1 style="color: #a3e635; text-align: center;">FinoraX</h1>
                <h2 style="color: #ffffff;">🎉 Congratulations!</h2>
                <p style="color: #a0a0a0;">Hi ${name},</p>
                <p style="color: #a0a0a0;">You've reached your savings goal!</p>
                <div style="background: linear-gradient(135deg, #a3e635 0%, #22c55e 100%); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #1a1a2e; margin: 0;">${goalName}</h3>
                    <p style="color: #1a1a2e; font-size: 28px; font-weight: bold; margin: 10px 0;">${currency}${targetAmount}</p>
                    <p style="color: #1a1a2e;">Goal Complete! 🎯</p>
                </div>
                <p style="color: #a0a0a0;">Keep up the great work with your financial goals!</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email from FinoraX.</p>
            </div>
        `
    }),

    // Bill due reminder
    billDue: (name: string, billName: string, amount: string, currency: string, dueDate: string) => ({
        subject: `⏰ Bill Due Reminder - ${billName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <h1 style="color: #a3e635; text-align: center;">FinoraX</h1>
                <h2 style="color: #ffffff;">📅 Bill Due Reminder</h2>
                <p style="color: #a0a0a0;">Hi ${name},</p>
                <p style="color: #a0a0a0;">You have a bill coming up:</p>
                <div style="background: #2a2a4e; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <p style="margin: 8px 0;"><strong style="color: #f59e0b;">Bill:</strong> ${billName}</p>
                    <p style="margin: 8px 0;"><strong style="color: #f59e0b;">Amount:</strong> ${currency}${amount}</p>
                    <p style="margin: 8px 0;"><strong style="color: #f59e0b;">Due Date:</strong> ${dueDate}</p>
                </div>
                <p style="color: #a0a0a0;">Don't forget to pay on time to avoid late fees!</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email from FinoraX.</p>
            </div>
        `
    }),

    // Welcome email
    welcome: (name: string) => ({
        subject: `🎉 Welcome to FinoraX!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <h1 style="color: #a3e635; text-align: center;">FinoraX</h1>
                <h2 style="color: #ffffff;">Welcome aboard! 🚀</h2>
                <p style="color: #a0a0a0;">Hi ${name},</p>
                <p style="color: #a0a0a0;">Thank you for joining FinoraX! We're excited to help you take control of your finances.</p>
                <div style="background: linear-gradient(135deg, #a3e635 0%, #22c55e 100%); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #1a1a2e; margin: 0;">Get Started</h3>
                    <p style="color: #1a1a2e;">Track expenses • Set goals • Build wealth</p>
                </div>
                <p style="color: #a0a0a0;">Here's what you can do:</p>
                <ul style="color: #a0a0a0;">
                    <li>📊 Track your daily transactions</li>
                    <li>🎯 Set and achieve savings goals</li>
                    <li>📅 Manage recurring bills</li>
                    <li>📈 Get insights on your spending</li>
                </ul>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email from FinoraX.</p>
            </div>
        `
    }),

    // Legacy templates
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

    // Subscription confirmed
    subscriptionConfirmed: (name: string, plan: string, billingCycle: string, nextBillingDate: string) => ({
        subject: `🎉 Welcome to FinoraX ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 16px;">
                <h1 style="color: #a3e635; text-align: center;">FinoraX</h1>
                <h2 style="color: #ffffff;">Thank You for Subscribing! 🎉</h2>
                <p style="color: #a0a0a0;">Hi ${name},</p>
                <p style="color: #a0a0a0;">Your subscription is now active. Here are your plan details:</p>
                <div style="background: linear-gradient(135deg, #a3e635 0%, #22c55e 100%); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #1a1a2e; margin: 0; text-transform: capitalize;">${plan} Plan</h3>
                    <p style="color: #1a1a2e; font-size: 18px; margin: 10px 0; text-transform: capitalize;">Billed ${billingCycle}</p>
                </div>
                <div style="background: #2a2a4e; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 8px 0;"><strong style="color: #a3e635;">Status:</strong> <span style="color: #22c55e;">Active</span></p>
                    <p style="margin: 8px 0;"><strong style="color: #a3e635;">Next Billing:</strong> ${nextBillingDate}</p>
                    <p style="margin: 8px 0;"><strong style="color: #a3e635;">Auto-Renewal:</strong> Enabled</p>
                </div>
                <p style="color: #a0a0a0;">Thank you for choosing FinoraX for your financial management needs!</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email from FinoraX. You can manage your subscription in the Settings page.</p>
            </div>
        `
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
            case 'transaction':
                emailContent = templates.transaction(name, data.transactionType, data.amount, data.currency, data.category || 'Other')
                break
            case 'goal_reached':
                emailContent = templates.goalReached(name, data.goalName, data.targetAmount, data.currency)
                break
            case 'bill_due':
                emailContent = templates.billDue(name, data.billName, data.amount, data.currency, data.dueDate)
                break
            case 'welcome':
                emailContent = templates.welcome(name)
                break
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
            case 'subscription_confirmed':
                emailContent = templates.subscriptionConfirmed(name, data.plan, data.billingCycle, data.nextBillingDate)
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
