import { supabase } from '../config/supabase';
import { userService } from './userService';

export type EmailType =
    | 'transaction'
    | 'goal_reached'
    | 'bill_due'
    | 'welcome'
    | 'deposit'
    | 'withdrawal'
    | 'trial_expiring'
    | 'trial_expired'
    | 'subscription_confirmed';

interface EmailData {
    // Transaction
    transactionType?: string;
    amount?: string;
    currency?: string;
    category?: string;
    // Goal
    goalName?: string;
    targetAmount?: string;
    // Bill
    billName?: string;
    dueDate?: string;
    // Other
    status?: string;
    daysLeft?: number;
    // Subscription
    plan?: string;
    billingCycle?: string;
    nextBillingDate?: string;
}

export const emailNotificationService = {
    /**
     * Check if user has email notifications enabled
     */
    async isEmailEnabled(): Promise<boolean> {
        try {
            const settings = await userService.getSettings();
            return settings?.notifications_email ?? false;
        } catch (err) {
            console.error('Error checking email settings:', err);
            return false;
        }
    },

    /**
     * Send email notification via Supabase Edge Function
     */
    async sendEmail(type: EmailType, data: EmailData): Promise<boolean> {
        try {
            // Check if user has email notifications enabled (skip for welcome emails)
            if (type !== 'welcome') {
                const isEnabled = await this.isEmailEnabled();
                if (!isEnabled) {
                    console.log('Email notifications disabled for user');
                    return false;
                }
            }

            // Get current user
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                console.error('No authenticated user');
                return false;
            }

            // Call the send-email Edge Function
            const { data: result, error } = await supabase.functions.invoke('send-email', {
                body: {
                    type,
                    userId: userData.user.id,
                    data
                }
            });

            if (error) {
                console.error('Error sending email:', error);
                return false;
            }

            console.log('Email sent successfully:', result);
            return true;
        } catch (err) {
            console.error('Email notification error:', err);
            return false;
        }
    },

    /**
     * Send transaction notification email
     */
    async notifyTransaction(
        transactionType: 'income' | 'expense' | 'deposit' | 'withdrawal',
        amount: number,
        currency: string,
        category: string
    ): Promise<boolean> {
        return this.sendEmail('transaction', {
            transactionType,
            amount: amount.toLocaleString(),
            currency,
            category
        });
    },

    /**
     * Send goal reached notification email
     */
    async notifyGoalReached(goalName: string, targetAmount: number, currency: string): Promise<boolean> {
        return this.sendEmail('goal_reached', {
            goalName,
            targetAmount: targetAmount.toLocaleString(),
            currency
        });
    },

    /**
     * Send bill due reminder email
     */
    async notifyBillDue(billName: string, amount: number, currency: string, dueDate: string): Promise<boolean> {
        return this.sendEmail('bill_due', {
            billName,
            amount: amount.toLocaleString(),
            currency,
            dueDate
        });
    },

    /**
     * Send welcome email to new user
     */
    async notifyWelcome(): Promise<boolean> {
        return this.sendEmail('welcome', {});
    },

    /**
     * Send deposit confirmation email
     */
    async notifyDeposit(amount: number, currency: string): Promise<boolean> {
        return this.sendEmail('deposit', {
            amount: amount.toLocaleString(),
            currency
        });
    },

    /**
     * Send withdrawal notification email
     */
    async notifyWithdrawal(amount: number, currency: string, status: string = 'pending'): Promise<boolean> {
        return this.sendEmail('withdrawal', {
            amount: amount.toLocaleString(),
            currency,
            status
        });
    },

    /**
     * Send trial expiring warning email
     */
    async notifyTrialExpiring(daysLeft: number): Promise<boolean> {
        return this.sendEmail('trial_expiring', { daysLeft });
    },

    /**
     * Send trial expired email
     */
    async notifyTrialExpired(): Promise<boolean> {
        return this.sendEmail('trial_expired', {});
    },

    /**
     * Send subscription confirmation email
     */
    async notifySubscription(plan: string, billingCycle: string): Promise<boolean> {
        // Calculate next billing date
        const nextDate = new Date();
        if (billingCycle === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        const nextBillingDate = nextDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return this.sendEmail('subscription_confirmed', {
            plan,
            billingCycle,
            nextBillingDate
        });
    }
};
