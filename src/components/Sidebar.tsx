import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Crown,
  Plus,
  Building2,
  Target,
  Activity,
  Clock,
  Trophy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'deposit', label: 'Deposit', icon: Plus },
  { id: 'withdrawal', label: 'Withdraw', icon: Building2 },
  { id: 'transactions', label: 'Transactions', icon: BarChart3 },
  { id: 'recurring', label: 'Recurring', icon: Clock },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'score', label: 'Finance Score', icon: Activity },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'admin-withdrawals', label: 'Admin', icon: Settings, adminOnly: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth(); // ✅ Corrected from currentUser
  const { plan } = useSubscription();

  const initials = user?.email?.charAt(0).toUpperCase() || 'U';
  const username = user?.email?.split('@')[0] || 'User';
  const planLabel = plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Member` : 'Free Trial';

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-glass border-r border-light-border dark:border-dark-border flex flex-col h-full transition-colors duration-300"
    >
      {/* Header */}
      <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center justify-between">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center"
        >
          {!isCollapsed && (
            <div>
              <Link to="/" className="flex items-center space-x-2">
                <div className="p-1 bg-lime-accent rounded-lg">
                  <TrendingUp className="w-6 h-6 font-montserrat text-light-base dark:text-dark-base" />
                </div>
                <span className="text-xl font-montserrat font-bold text-lime-accent font-editorial">FinoraX</span>
              </Link>


            </div>
          )}
        </motion.div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded-full hover:bg-light-glass dark:hover:bg-dark-glass transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation
          .filter((item) => {
            // Only show admin items to admin email
            if (item.adminOnly) {
              const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
              return user?.email === ADMIN_EMAIL;
            }
            return true;
          })
          .map((item) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all relative group ${isActive
                  ? 'bg-lime-accent/10 text-lime-accent'
                  : 'text-light-text font-montserrat dark:text-dark-text hover:bg-light-glass dark:hover:bg-dark-glass hover:text-lime-accent'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`relative ${isActive ? 'drop-shadow-glow' : ''}`}>
                  <item.icon className="w-6 h-6" />
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-lime-accent/20 rounded-full blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isCollapsed ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium font-montserrat font-editorial"
                  >
                    {item.label}
                  </motion.span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-lime-accent rounded-l-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center space-x-3 p-3 bg-light-glass dark:bg-dark-glass rounded-xl">
          <div className="w-8 h-8 bg-lime-accent rounded-full flex items-center justify-center">
            <span className="text-light-base dark:text-dark-base font-bold text-sm">{initials}</span>
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <p className="text-sm font-medium text-light-text dark:text-dark-text">{username}</p>
              <div className="flex items-center space-x-1">
                {plan && <Crown className="w-3 h-3 text-lime-accent" />}
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {planLabel}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
