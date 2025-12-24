import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    loadRazorpayScript,
    createSubscription,
    verifySubscriptionPayment,
    openRazorpaySubscriptionCheckout,
} from '../services/razorpayService';
import { emailNotificationService } from '../services';
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
                console.log('🔄 Starting subscription flow for:', plan, billingCycle);

                // Load Razorpay script
                console.log('📜 Loading Razorpay script...');
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    throw new Error('Failed to load payment gateway. Please try again.');
                }
                console.log('✅ Razorpay script loaded');

                // Create subscription via Edge Function
                console.log('📦 Creating subscription via Edge Function...');
                const { subscriptionId } = await createSubscription(plan, billingCycle, user.id);
                console.log('✅ Subscription created:', subscriptionId);

                // Open Razorpay checkout for subscription
                // Pass subscriptionId to the callback so we can use it for verification
                openRazorpaySubscriptionCheckout(
                    subscriptionId,
                    plan,
                    billingCycle,
                    user.email || '',
                    user.user_metadata?.full_name || user.email || '',
                    async (response) => {
                        try {
                            console.log('💳 Payment completed, verifying...', response);

                            // Add the subscription_id to the response since Razorpay only returns payment_id
                            const fullResponse = {
                                ...response,
                                razorpay_subscription_id: subscriptionId,
                            };

                            // Verify subscription payment
                            const result = await verifySubscriptionPayment(fullResponse, plan, billingCycle, user.id);
                            console.log('✅ Verification result:', result);

                            if (result.success) {
                                console.log('🔄 Refreshing subscription...');
                                console.log('🔁 Auto-renewal enabled:', result.autoRenew);

                                // Send subscription confirmation email
                                emailNotificationService.notifySubscription(plan, billingCycle)
                                    .then(() => console.log('📧 Subscription confirmation email sent'))
                                    .catch(err => console.error('Email error:', err));

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
                console.error('Subscription initiation error:', err);
                setError(err.message || 'Failed to initiate subscription');
                setLoading(false);
            }
        },
        [user, navigate, refreshSubscription]
    );

    return { initiatePayment, loading, error };
};
