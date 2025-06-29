import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { hasActiveSubscription, loading } = useSubscription();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setChecked(true);
    }
  }, [loading]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking subscription...
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
