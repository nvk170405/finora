import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    loadRazorpayScript,
    createOrder,
    verifyPayment,
    openRazorpayCheckout,
} from '../services/razorpayService';
import { useSubscription } from '../contexts/SubscriptionContext';

interface UseRazorpayReturn {
    initiatePayment: (plan: 'basic' | 'premium', billingCycle: 'monthly' | 'yearly') => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useRazorpay = (): UseRazorpayReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { refreshSubscription } = useSubscription();
    const navigate = useNavigate();

    const initiatePayment = useCallback(
        async (plan: 'basic' | 'premium', billingCycle: 'monthly' | 'yearly') => {
            if (!user) {
                setError('Please log in to subscribe');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                console.log('🔄 Starting payment flow for:', plan, billingCycle);

                // Load Razorpay script
                console.log('📜 Loading Razorpay script...');
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    throw new Error('Failed to load payment gateway. Please try again.');
                }
                console.log('✅ Razorpay script loaded');

                // Create order via Edge Function
                console.log('📦 Creating order via Edge Function...');
                const { orderId, amount } = await createOrder(plan, billingCycle, user.id);
                console.log('✅ Order created:', { orderId, amount });

                // Open Razorpay checkout
                openRazorpayCheckout(
                    orderId,
                    amount,
                    plan,
                    billingCycle,
                    user.email || '',
                    user.user_metadata?.full_name || user.email || '',
                    async (response) => {
                        try {
                            console.log('💳 Payment completed, verifying...', response);
                            // Verify payment
                            const result = await verifyPayment(response, plan, billingCycle, user.id);
                            console.log('✅ Verification result:', result);

                            if (result.success) {
                                console.log('🔄 Refreshing subscription...');
                                // Refresh subscription state
                                await refreshSubscription();
                                console.log('🏠 Redirecting to dashboard...');
                                // Redirect to dashboard
                                navigate('/dashboard');
                            } else {
                                console.error('❌ Verification failed:', result.message);
                                setError(result.message || 'Payment verification failed');
                            }
                        } catch (err: any) {
                            console.error('Payment verification error:', err);
                            setError(err.message || 'Payment verification failed');
                        } finally {
                            setLoading(false);
                        }
                    },
                    () => {
                        // User dismissed the popup
                        setLoading(false);
                    }
                );
            } catch (err: any) {
                console.error('Payment initiation error:', err);
                setError(err.message || 'Failed to initiate payment');
                setLoading(false);
            }
        },
        [user, navigate, refreshSubscription]
    );

    return { initiatePayment, loading, error };
};
