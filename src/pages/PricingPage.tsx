import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const plans = {
  monthly: {
    basic: { price: 9.99 },
    premium: { price: 24.99 }
  },
  yearly: {
    basic: { price: 149, monthlyEquivalent: 12.42 },
    premium: { price: 349, monthlyEquivalent: 29.08 }
  }
} as const;

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const { updateSubscription } = useSubscription();
  const navigate = useNavigate();

  const handleSubscribe = async (plan: 'basic' | 'premium') => {
    setLoading(plan);
    try {
      // Simulate billing for now
      setTimeout(() => {
        updateSubscription(plan, billingCycle);
        navigate('/dashboard');
        setLoading(null);
      }, 1500);
    } catch (error) {
      console.error('Subscription error:', error);
      setLoading(null);
    }
  };

  const currentBasic = plans[billingCycle].basic;
  const currentPremium = plans[billingCycle].premium;

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-light-text dark:text-dark-text font-editorial mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
            Select a subscription to unlock the full power of FinoraX
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center mb-12"
        >
          <div className="bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-lime-accent text-light-base dark:text-dark-base shadow-glow'
                  : 'text-light-text dark:text-dark-text hover:text-lime-accent'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-lime-accent text-light-base dark:text-dark-base shadow-glow'
                  : 'text-light-text dark:text-dark-text hover:text-lime-accent'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 hover:border-lime-accent/30 transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text font-editorial">Basic</h3>
            </div>

            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Perfect for personal financial management
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-lime-accent">
                ${currentBasic.price}
              </span>
              <span className="text-light-text-secondary dark:text-dark-text-secondary">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
              {billingCycle === 'yearly' && 'monthlyEquivalent' in currentBasic && (
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  ${(currentBasic as { monthlyEquivalent: number }).monthlyEquivalent}/month billed annually
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Up to 5 currencies</span></li>
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Basic analytics</span></li>
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Standard support</span></li>
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Mobile & desktop apps</span></li>
            </ul>

            <button
              onClick={() => handleSubscribe('basic')}
              disabled={loading === 'basic'}
              className="w-full bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border text-light-text dark:text-dark-text py-3 rounded-xl font-medium hover:border-lime-accent/30 transition-all disabled:opacity-50"
            >
              {loading === 'basic' ? 'Processing...' : 'Choose Basic'}
            </button>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border-2 border-lime-accent rounded-2xl p-8 relative"
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-lime-accent text-light-base dark:text-dark-base px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-lime-accent/20 rounded-lg">
                <Crown className="w-6 h-6 text-lime-accent" />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text font-editorial">Premium</h3>
            </div>

            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              For power users and businesses
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-lime-accent">
                ${currentPremium.price}
              </span>
              <span className="text-light-text-secondary dark:text-dark-text-secondary">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
              {billingCycle === 'yearly' && 'monthlyEquivalent' in currentPremium && (
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  ${(currentPremium as { monthlyEquivalent: number }).monthlyEquivalent}/month billed annually
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Unlimited currencies</span></li>
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Advanced analytics & AI insights</span></li>
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Priority support</span></li>
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>API access</span></li>
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Custom reports</span></li>
              <li className="flex items-center space-x-3"><Check className="w-5 h-5 text-lime-accent" /><span>Multi-account management</span></li>
            </ul>

            <button
              onClick={() => handleSubscribe('premium')}
              disabled={loading === 'premium'}
              className="w-full bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50"
            >
              {loading === 'premium' ? 'Processing...' : 'Choose Premium'}
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12 p-6 bg-light-surface/50 dark:bg-dark-surface/50 rounded-xl border border-light-border dark:border-dark-border"
        >
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            All plans include a 14-day free trial. Cancel anytime. No hidden fees.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
