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

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
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

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface CreateOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
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
 * Create Razorpay order via Supabase Edge Function
 */
export const createOrder = async (
    plan: 'basic' | 'premium',
    billingCycle: 'monthly' | 'yearly',
    userId: string
): Promise<CreateOrderResponse> => {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { plan, billingCycle, userId },
    });

    if (error) {
        console.error('Error creating order:', error);
        throw new Error(error.message || 'Failed to create order');
    }

    return data;
};

/**
 * Verify payment via Supabase Edge Function
 */
export const verifyPayment = async (
    paymentData: RazorpayResponse,
    plan: 'basic' | 'premium',
    billingCycle: 'monthly' | 'yearly',
    userId: string
): Promise<{ success: boolean; message: string }> => {
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
 * Open Razorpay checkout
 */
export const openRazorpayCheckout = (
    orderId: string,
    amount: number,
    plan: 'basic' | 'premium',
    billingCycle: 'monthly' | 'yearly',
    userEmail: string,
    userName: string,
    onSuccess: (response: RazorpayResponse) => void,
    onDismiss?: () => void
): void => {
    const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'FinoraX',
        description: `${PLAN_NAMES[plan]} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        order_id: orderId,
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
