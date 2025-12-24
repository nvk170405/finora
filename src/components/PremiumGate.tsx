import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface PremiumGateProps {
    feature: string;
    requiredPlan: 'basic' | 'premium';
    title: string;
    description: string;
    children: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
    feature,
    requiredPlan,
    title,
    description,
    children
}) => {
    const { isFeatureUnlocked, plan } = useSubscription();

    const isUnlocked = isFeatureUnlocked(feature);

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 text-center"
            >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-orange-400" />
                </div>

                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">
                    {title}
                </h2>

                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                    {description}
                </p>

                <div className="bg-light-glass dark:bg-dark-glass rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <Crown className="w-5 h-5 text-lime-accent" />
                        <span className="font-semibold text-light-text dark:text-dark-text">
                            {requiredPlan === 'premium' ? 'Premium' : 'Basic'} Plan Required
                        </span>
                    </div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {plan ? `You're on the ${plan} plan` : 'You have no active subscription'}
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/pricing'}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-lime-accent to-emerald-500 text-dark-background font-bold rounded-xl hover:shadow-lg hover:shadow-lime-accent/20 transition-all"
                >
                    <span>Upgrade Now</span>
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </motion.div>
        </div>
    );
};
