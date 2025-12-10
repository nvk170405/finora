import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

type Plan = 'basic' | 'premium' | 'trial';
type BillingCycle = 'monthly' | 'yearly' | null;

interface SubscriptionContextType {
  plan: Plan | null;
  billingCycle: BillingCycle | null;
  loading: boolean;
  updateSubscription: (plan: Plan, billingCycle: BillingCycle) => Promise<void>;
  hasActiveSubscription: boolean;
  refreshSubscription: () => Promise<void>;
  isFeatureUnlocked: (feature: string) => boolean;
  startTrial: () => Promise<void>;
  trialDaysRemaining: number | null;
  isTrialExpired: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);

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
      .select('plan, billing_cycle, trial_end_date, end_date')
      .eq('user_id', userData.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error.message);
    }

    if (data) {
      setPlan(data.plan);
      setBillingCycle(data.billing_cycle);
      if (data.trial_end_date) {
        setTrialEndDate(new Date(data.trial_end_date));
      }
    }

    setLoading(false);
  };

  const startTrial = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 7); // 7-day trial

    const { error } = await supabase
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

    if (error) {
      console.error('Error starting trial:', error.message);
      throw new Error(error.message);
    }

    // Update local state
    setPlan('trial');
    setBillingCycle(null);
    setTrialEndDate(trialEnd);
    console.log('Trial started successfully, ends:', trialEnd);
  };

  const updateSubscription = async (plan: Plan, billingCycle: BillingCycle) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    const now = new Date();
    const endDate = new Date(now);
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userData.user.id,
        plan,
        billing_cycle: billingCycle,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        trial_end_date: null, // Clear trial when upgrading
      });

    if (error) {
      console.error('Error updating subscription:', error.message);
      throw new Error(error.message);
    }

    // Update local state immediately
    setPlan(plan);
    setBillingCycle(billingCycle);
    setTrialEndDate(null);
    console.log('Subscription updated successfully:', plan, billingCycle);
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Calculate trial days remaining
  const trialDaysRemaining = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isTrialExpired = plan === 'trial' && trialDaysRemaining !== null && trialDaysRemaining <= 0;

  const isFeatureUnlocked = (feature: string): boolean => {
    // Trial users get premium features
    if (plan === 'trial' && !isTrialExpired) return true;
    if (plan === 'premium') return true;

    const basicFeatures = [
      'basic-analytics',
      'dashboard',
      'voice-recording',
      'themes'
    ];

    return basicFeatures.includes(feature);
  };

  // Trial or paid subscription counts as active (unless expired)
  const hasActiveSubscription = (plan === 'trial' && !isTrialExpired) || plan === 'basic' || plan === 'premium';

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        billingCycle,
        loading,
        hasActiveSubscription,
        updateSubscription,
        refreshSubscription: fetchSubscription,
        isFeatureUnlocked,
        startTrial,
        trialDaysRemaining,
        isTrialExpired,
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
