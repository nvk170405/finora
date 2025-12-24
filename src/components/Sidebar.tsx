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
  Target,
  Activity,
  Clock,
  Trophy,
  Timer,
  Smile,
  Zap,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: 'wallet', label: 'Dashboard', icon: Wallet, tier: 'free' },
  { id: 'networth', label: 'Net Worth', icon: TrendingUp, tier: 'premium' },
  { id: 'transactions', label: 'Transactions', icon: BarChart3, tier: 'free' },
  { id: 'recurring', label: 'Bills & Subs', icon: Clock, tier: 'basic' },
  { id: 'goals', label: 'Goals', icon: Target, tier: 'basic' },
  { id: 'impulse', label: 'Impulse Timer', icon: Timer, tier: 'premium' },
  { id: 'mood', label: 'Mood Journal', icon: Smile, tier: 'premium' },
  { id: 'challenges', label: 'Challenges', icon: Zap, tier: 'premium' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, tier: 'basic' },
  { id: 'score', label: 'Finance Score', icon: Activity, tier: 'premium' },
  { id: 'insights', label: 'Insights', icon: BarChart3, tier: 'premium' },
  { id: 'profile', label: 'Profile', icon: User, tier: 'free' },
  { id: 'settings', label: 'Settings', icon: Settings, tier: 'free' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { plan, isFeatureUnlocked } = useSubscription();
  const { displayName } = usePreferences();

  const username = displayName || user?.email?.split('@')[0] || 'User';
  const initials = username.charAt(0).toUpperCase();
  const planLabel = plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Member` : 'Free Trial';

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-shrink-0 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-glass border-r border-light-border dark:border-dark-border flex-col h-screen sticky top-0 transition-colors duration-300 z-40"
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
        {navigation.map((item) => {
          const isActive = activeSection === item.id;
          // Map navigation id to feature id
          const featureMap: Record<string, string> = {
            'wallet': 'dashboard',
            'networth': 'networth',
            'transactions': 'transactions',
            'recurring': 'recurring-expenses',
            'goals': 'goals',
            'impulse': 'impulse-timer',
            'mood': 'mood-journal',
            'challenges': 'challenges',
            'achievements': 'achievements',
            'score': 'finance-score',
            'insights': 'advanced-analytics',
            'profile': 'profile',
            'settings': 'settings'
          };
          const featureId = featureMap[item.id] || item.id;
          const isLocked = !isFeatureUnlocked(featureId);

          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all relative group ${isActive
                ? 'bg-lime-accent/10 text-lime-accent'
                : isLocked
                  ? 'text-light-text-secondary dark:text-dark-text-secondary opacity-60 hover:opacity-80'
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
                  className="font-medium font-montserrat font-editorial flex-1 text-left"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Show lock/crown for premium features */}
              {!isCollapsed && isLocked && (
                <Lock className="w-4 h-4 text-orange-400" />
              )}
              {!isCollapsed && !isLocked && item.tier === 'premium' && (
                <Crown className="w-4 h-4 text-lime-accent" />
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
