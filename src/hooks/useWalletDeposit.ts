import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { loadRazorpayScript } from '../services/razorpayService';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface UseWalletDepositReturn {
    initiateDeposit: (walletId: string, amount: number, currency: string) => Promise<void>;
    loading: boolean;
    error: string | null;
    success: boolean;
    resetState: () => void;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export const useWalletDeposit = (): UseWalletDepositReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { user } = useAuth();

    const resetState = useCallback(() => {
        setLoading(false);
        setError(null);
        setSuccess(false);
    }, []);

    const initiateDeposit = useCallback(
        async (walletId: string, amount: number, currency: string) => {
            if (!user) {
                setError('Please log in to deposit');
                return;
            }

            if (amount <= 0) {
                setError('Amount must be greater than 0');
                return;
            }

            setLoading(true);
            setError(null);
            setSuccess(false);

            try {
                console.log('🔄 Starting deposit flow for:', { walletId, amount, currency });

                // Load Razorpay script
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    throw new Error('Failed to load payment gateway. Please try again.');
                }

                // Create deposit order via Edge Function
                console.log('📦 Creating deposit order...');
                const { data: orderData, error: orderError } = await supabase.functions.invoke('create-deposit-order', {
                    body: { amount, currency, walletId, userId: user.id },
                });

                if (orderError) {
                    throw new Error(orderError.message || 'Failed to create order');
                }

                console.log('✅ Order created:', orderData);

                // Open Razorpay checkout
                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: 'INR',
                    name: 'FinoraX',
                    description: `Wallet Deposit - $${amount}`,
                    order_id: orderData.orderId,
                    handler: async (response: RazorpayResponse) => {
                        try {
                            console.log('💳 Payment completed, verifying...');

                            // Verify deposit
                            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-deposit', {
                                body: {
                                    ...response,
                                    walletId,
                                    amount,
                                    userId: user.id,
                                },
                            });

                            if (verifyError) {
                                throw new Error(verifyError.message || 'Verification failed');
                            }

                            if (verifyData.success) {
                                console.log('✅ Deposit successful!');
                                setSuccess(true);
                            } else {
                                setError(verifyData.message || 'Deposit verification failed');
                            }
                        } catch (err: any) {
                            console.error('Deposit verification error:', err);
                            setError(err.message || 'Deposit verification failed');
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: user.user_metadata?.full_name || user.email || '',
                        email: user.email || '',
                    },
                    theme: {
                        color: '#BFFF00',
                    },
                    modal: {
                        ondismiss: () => {
                            setLoading(false);
                        },
                    },
                    notes: {
                        amountInINR: orderData.amountInINR,
                        originalAmount: amount,
                        originalCurrency: currency,
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } catch (err: any) {
                console.error('Deposit initiation error:', err);
                setError(err.message || 'Failed to initiate deposit');
                setLoading(false);
            }
        },
        [user]
    );

    return { initiateDeposit, loading, error, success, resetState };
};
