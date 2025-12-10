import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

export const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the current user
                const { data: userData, error: userError } = await supabase.auth.getUser();

                if (userError || !userData.user) {
                    // If no user, redirect to login
                    window.location.href = '/login';
                    return;
                }

                // Check if user has an active subscription
                const { data: subData, error: subError } = await supabase
                    .from('subscriptions')
                    .select('plan, trial_end_date')
                    .eq('user_id', userData.user.id)
                    .single();

                if (subData && subData.plan) {
                    // Check if trial has expired
                    if (subData.plan === 'trial' && subData.trial_end_date) {
                        const trialEnd = new Date(subData.trial_end_date);
                        if (trialEnd < new Date()) {
                            // Trial expired, go to pricing
                            window.location.href = '/pricing';
                            return;
                        }
                    }
                    // User has active subscription (or trial), go to dashboard
                    window.location.href = '/dashboard';
                } else {
                    // No subscription - auto-start 7-day trial!
                    const now = new Date();
                    const trialEnd = new Date(now);
                    trialEnd.setDate(trialEnd.getDate() + 7);

                    const { error: trialError } = await supabase
                        .from('subscriptions')
                        .upsert({
                            user_id: userData.user.id,
                            plan: 'trial',
                            billing_cycle: null,
                            trial_end_date: trialEnd.toISOString(),
                            start_date: now.toISOString(),
                            end_date: trialEnd.toISOString(),
                            payment_status: 'trial',
                        });

                    if (trialError) {
                        console.error('Error starting trial:', trialError);
                        window.location.href = '/pricing';
                        return;
                    }

                    // Trial started! Go to dashboard
                    window.location.href = '/dashboard';
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                window.location.href = '/login';
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-light-base dark:bg-dark-base">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-accent mx-auto mb-4"></div>
                <p className="text-light-text dark:text-dark-text">Setting up your account...</p>
                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-2">Starting your 7-day free trial...</p>
            </div>
        </div>
    );
};
