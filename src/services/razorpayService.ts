import { supabase } from '../config/supabase';

// Razorpay Key ID from environment
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Plan pricing in paise (Razorpay uses smallest currency unit)
export const PLAN_PRICING = {
    basic: {
        monthly: 79900,    // ₹799
        yearly: 799000,    // ₹7,990
    },
    premium: {
        monthly: 199900,   // ₹1,999
        yearly: 1999000,   // ₹19,990
    },
} as const;

// Plan display names
export const PLAN_NAMES = {
    basic: 'Basic Plan',
    premium: 'Premium Plan',
} as const;

interface RazorpaySubscriptionOptions {
    key: string;
    subscription_id: string;
    name: string;
    description: string;
    handler: (response: RazorpaySubscriptionResponse) => void;
    prefill: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme: {
        color: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpaySubscriptionResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
}

interface CreateSubscriptionResponse {
    subscriptionId: string;
    shortUrl?: string;
    status: string;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpaySubscriptionOptions) => {
            open: () => void;
            close: () => void;
        };
    }
}

/**
 * Dynamically load Razorpay checkout script
 */
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // Check if already loaded
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Create Razorpay Subscription via Supabase Edge Function
 * This creates an auto-recurring subscription instead of a one-time order
 */
export const createSubscription = async (
    plan: 'basic' | 'premium',
    billingCycle: 'monthly' | 'yearly',
    userId: string
): Promise<CreateSubscriptionResponse> => {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { plan, billingCycle, userId },
    });

    if (error) {
        console.error('Error creating subscription:', error);
        throw new Error(error.message || 'Failed to create subscription');
    }

    return data;
};

/**
 * Verify subscription payment via Supabase Edge Function
 */
export const verifySubscriptionPayment = async (
    paymentData: RazorpaySubscriptionResponse,
    plan: 'basic' | 'premium',
    billingCycle: 'monthly' | 'yearly',
    userId: string
): Promise<{ success: boolean; message: string; autoRenew?: boolean }> => {
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
            ...paymentData,
            plan,
            billingCycle,
            userId,
        },
    });

    if (error) {
        console.error('Error verifying payment:', error);
        throw new Error(error.message || 'Payment verification failed');
    }

    return data;
};

/**
 * Open Razorpay checkout for subscription
 * Uses subscription_id instead of order_id for auto-recurring billing
 */
export const openRazorpaySubscriptionCheckout = (
    subscriptionId: string,
    plan: 'basic' | 'premium',
    billingCycle: 'monthly' | 'yearly',
    userEmail: string,
    userName: string,
    onSuccess: (response: RazorpaySubscriptionResponse) => void,
    onDismiss?: () => void
): void => {
    const options: RazorpaySubscriptionOptions = {
        key: RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: 'FinoraX',
        description: `${PLAN_NAMES[plan]} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Auto-Renewing Subscription`,
        handler: onSuccess,
        prefill: {
            name: userName,
            email: userEmail,
        },
        theme: {
            color: '#BFFF00', // lime-accent
        },
        modal: {
            ondismiss: onDismiss,
        },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
};

// Legacy exports for backward compatibility (deprecated)
export const createOrder = createSubscription;
export const verifyPayment = verifySubscriptionPayment;
export const openRazorpayCheckout = openRazorpaySubscriptionCheckout;
