import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { hasActiveSubscription, loading } = useSubscription();

  // Show loading while checking subscription
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking subscription...
      </div>
    );
  }

  // If no active subscription, redirect to pricing
  if (!hasActiveSubscription) {
    return <Navigate to="/pricing" replace />;
  }

  // User has active subscription, render children
  return <>{children}</>;
};
