// Update Razorpay Subscription Edge Function
// Handles plan upgrades/downgrades using Razorpay's Update Subscription API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
        const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        // Plan IDs from environment
        const PLAN_IDS: Record<string, string | undefined> = {
            basic_monthly: Deno.env.get('RAZORPAY_PLAN_BASIC_MONTHLY'),
            basic_yearly: Deno.env.get('RAZORPAY_PLAN_BASIC_YEARLY'),
            premium_monthly: Deno.env.get('RAZORPAY_PLAN_PREMIUM_MONTHLY'),
            premium_yearly: Deno.env.get('RAZORPAY_PLAN_PREMIUM_YEARLY'),
        }

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured')
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase credentials not configured')
        }

        const { userId, newPlan, newBillingCycle, scheduleChange } = await req.json()

        console.log('Update subscription request:', { userId, newPlan, newBillingCycle, scheduleChange })

        if (!userId || !newPlan || !newBillingCycle) {
            throw new Error('Missing required fields: userId, newPlan, newBillingCycle')
        }

        // Get the new plan ID
        const planKey = `${newPlan}_${newBillingCycle}`
        const newPlanId = PLAN_IDS[planKey]

        if (!newPlanId) {
            throw new Error(`Plan not found: ${planKey}`)
        }

        // Get user's current subscription from database
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const { data: subscription, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (fetchError || !subscription) {
            throw new Error('No active subscription found')
        }

        if (!subscription.razorpay_subscription_id) {
            throw new Error('No Razorpay subscription ID found')
        }

        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

        // Check if billing cycle is changing (monthly <-> yearly)
        // If so, we need to cancel old subscription and create new one
        if (subscription.billing_cycle !== newBillingCycle) {
            console.log('Billing cycle changing, need to cancel and recreate')

            // Cancel old subscription at cycle end
            const cancelResponse = await fetch(
                `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/cancel`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ cancel_at_cycle_end: false }), // Cancel immediately for upgrade
                }
            )

            if (!cancelResponse.ok) {
                const cancelError = await cancelResponse.json()
                console.error('Failed to cancel old subscription:', cancelError)
                // Don't throw, continue to create new subscription
            }

            // Create new subscription with new plan
            const createResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: newPlanId,
                    total_count: newBillingCycle === 'monthly' ? 120 : 10,
                    customer_notify: 1,
                    notes: {
                        userId,
                        plan: newPlan,
                        billingCycle: newBillingCycle,
                    },
                }),
            })

            const newSubscription = await createResponse.json()

            if (!createResponse.ok) {
                console.error('Failed to create new subscription:', newSubscription)
                throw new Error('Failed to create new subscription')
            }

            // Return the new subscription ID for checkout
            return new Response(
                JSON.stringify({
                    success: true,
                    requiresPayment: true,
                    subscriptionId: newSubscription.id,
                    message: 'New subscription created, please complete payment',
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // Same billing cycle, just update the plan (upgrade/downgrade within same cycle)
        const updateResponse = await fetch(
            `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: newPlanId,
                    schedule_change_at: scheduleChange || 'cycle_end', // 'now' or 'cycle_end'
                }),
            }
        )

        const updateData = await updateResponse.json()

        if (!updateResponse.ok) {
            console.error('Failed to update subscription:', updateData)
            throw new Error(`Failed to update subscription: ${updateData.error?.description || 'Unknown error'}`)
        }

        // Update database
        const now = new Date()
        const endDate = new Date(now)
        if (newBillingCycle === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1)
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1)
        }

        await supabase
            .from('subscriptions')
            .update({
                plan: newPlan,
                billing_cycle: newBillingCycle,
                end_date: endDate.toISOString(),
            })
            .eq('user_id', userId)

        console.log(`Subscription updated for user ${userId} to ${newPlan} ${newBillingCycle}`)

        return new Response(
            JSON.stringify({
                success: true,
                requiresPayment: false,
                message: `Subscription updated to ${newPlan} ${newBillingCycle}`,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        console.error('Error updating subscription:', error.message)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
