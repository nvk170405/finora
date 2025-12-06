import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

type Plan = 'basic' | 'premium';
type BillingCycle = 'monthly' | 'yearly';

interface SubscriptionContextType {
  plan: Plan | null;
  billingCycle: BillingCycle | null;
  loading: boolean;
  updateSubscription: (plan: Plan, billingCycle: BillingCycle) => Promise<void>;
  hasActiveSubscription: boolean;
  refreshSubscription: () => Promise<void>;
  isFeatureUnlocked: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.warn('No user signed in');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan, billing_cycle')
      .eq('user_id', userData.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error.message);
    }

    if (data) {
      setPlan(data.plan);
      setBillingCycle(data.billing_cycle);
    }

    setLoading(false);
  };

  const updateSubscription = async (plan: Plan, billingCycle: BillingCycle) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userData.user.id,
        plan,
        billing_cycle: billingCycle,
      });

    if (error) {
      console.error('Error updating subscription:', error.message);
      throw new Error(error.message);
    }

    // Update local state immediately
    setPlan(plan);
    setBillingCycle(billingCycle);
    console.log('Subscription updated successfully:', plan, billingCycle);
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isFeatureUnlocked = (feature: string): boolean => {
    if (plan === 'premium') return true;

    const basicFeatures = [
      'basic-analytics',
      'dashboard',
      'voice-recording',
      'themes'
    ];

    return basicFeatures.includes(feature);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        billingCycle,
        loading,
        hasActiveSubscription: !!plan,
        updateSubscription,
        refreshSubscription: fetchSubscription,
        isFeatureUnlocked
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
