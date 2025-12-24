// Subscription Management Service
// Handles upgrade, downgrade, and cancellation of subscriptions

import { supabase } from '../config/supabase';

interface UpdateSubscriptionResult {
    success: boolean;
    requiresPayment?: boolean;
    subscriptionId?: string;
    message?: string;
    error?: string;
}

interface CancelSubscriptionResult {
    success: boolean;
    message?: string;
    endDate?: string;
    error?: string;
}

export const subscriptionManagementService = {
    /**
     * Upgrade or downgrade subscription plan
     * @param newPlan - 'basic' or 'premium'
     * @param newBillingCycle - 'monthly' or 'yearly'
     * @param scheduleChange - 'now' or 'cycle_end' (default: cycle_end)
     */
    async updatePlan(
        newPlan: 'basic' | 'premium',
        newBillingCycle: 'monthly' | 'yearly',
        scheduleChange: 'now' | 'cycle_end' = 'cycle_end'
    ): Promise<UpdateSubscriptionResult> {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                return { success: false, error: 'User not authenticated' };
            }

            const { data, error } = await supabase.functions.invoke('update-subscription', {
                body: {
                    userId: userData.user.id,
                    newPlan,
                    newBillingCycle,
                    scheduleChange,
                },
            });

            if (error) {
                console.error('Error updating subscription:', error);
                return { success: false, error: error.message || 'Failed to update subscription' };
            }

            return data;
        } catch (err: any) {
            console.error('Subscription update error:', err);
            return { success: false, error: err.message || 'Failed to update subscription' };
        }
    },

    /**
     * Cancel subscription
     * @param cancelAtCycleEnd - If true, access continues until end of billing period
     */
    async cancel(cancelAtCycleEnd: boolean = true): Promise<CancelSubscriptionResult> {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                return { success: false, error: 'User not authenticated' };
            }

            const { data, error } = await supabase.functions.invoke('cancel-subscription', {
                body: {
                    userId: userData.user.id,
                    cancelAtCycleEnd,
                },
            });

            if (error) {
                console.error('Error cancelling subscription:', error);
                return { success: false, error: error.message || 'Failed to cancel subscription' };
            }

            return data;
        } catch (err: any) {
            console.error('Subscription cancellation error:', err);
            return { success: false, error: err.message || 'Failed to cancel subscription' };
        }
    },

    /**
     * Get current subscription details
     */
    async getCurrentSubscription() {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                return null;
            }

            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', userData.user.id)
                .single();

            if (error) {
                console.error('Error fetching subscription:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Error getting subscription:', err);
            return null;
        }
    },
};
