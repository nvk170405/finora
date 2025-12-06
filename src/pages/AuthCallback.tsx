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
                    .select('plan')
                    .eq('user_id', userData.user.id)
                    .single();

                // Redirect based on subscription status
                if (subData && subData.plan) {
                    // User has subscription, go to dashboard
                    window.location.href = '/dashboard';
                } else {
                    // No subscription, go to pricing
                    window.location.href = '/pricing';
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
                <p className="text-light-text dark:text-dark-text">Completing authentication...</p>
            </div>
        </div>
    );
};
