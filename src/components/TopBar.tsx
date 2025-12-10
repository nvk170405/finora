import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Globe, LogOut, X, Check, Settings, User, Clock, Crown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useWalletContext } from '../contexts/WalletContext';
import { supabase } from '../config/supabase';

interface TopBarProps {
  onNavigate?: (section: string) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'transaction' | 'alert' | 'info';
}

export const TopBar: React.FC<TopBarProps> = ({ onNavigate }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [markedReadAt, setMarkedReadAt] = useState<Date | null>(null);
  const { user, logout } = useAuth();
  const { plan, trialDaysRemaining, isTrialExpired } = useSubscription();
  const { transactions } = useWalletContext();

  // Load the user's "marked read at" timestamp from database
  useEffect(() => {
    const loadReadTimestamp = async () => {
      if (!user || !supabase) return;

      try {
        const { data, error } = await supabase
          .from('notification_read_timestamps')
          .select('marked_read_at')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setMarkedReadAt(new Date(data.marked_read_at));
        }
      } catch (err) {
        console.error('Failed to load notification read timestamp:', err);
      }
    };

    loadReadTimestamp();
  }, [user, supabase]);

  // Generate notifications from recent transactions
  useEffect(() => {
    const recentNotifications: Notification[] = [];

    // Add transaction-based notifications
    if (transactions.length > 0) {
      const recent = transactions.slice(0, 3);
      recent.forEach((tx) => {
        const isDeposit = tx.type === 'deposit';
        const txDate = new Date(tx.created_at);
        // Mark as read if created before the "marked read at" timestamp
        const isRead = markedReadAt ? txDate <= markedReadAt : false;

        recentNotifications.push({
          id: tx.id,
          title: isDeposit ? 'Deposit received' : 'Transaction completed',
          message: `${isDeposit ? '+' : '-'}$${Math.abs(tx.amount).toLocaleString()} ${tx.description || tx.category || ''}`,
          time: txDate.toLocaleString(),
          unread: !isRead,
          type: 'transaction',
        });
      });
    }

    // Add default notifications if none
    if (recentNotifications.length === 0) {
      // Only show these if user hasn't marked all as read
      if (!markedReadAt) {
        recentNotifications.push(
          {
            id: 'welcome',
            title: 'Welcome to FinoraX!',
            message: 'Your account is set up and ready to use.',
            time: 'Just now',
            unread: true,
            type: 'info',
          },
          {
            id: 'rates',
            title: 'Exchange rates updated',
            message: 'Live rates are now available in the Exchange section.',
            time: '5 minutes ago',
            unread: true,
            type: 'alert',
          }
        );
      }
    }

    setNotifications(recentNotifications);
  }, [transactions, markedReadAt]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = async () => {
    // Update local state immediately
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setMarkedReadAt(new Date());

    // Persist to database
    if (user && supabase) {
      try {
        await supabase
          .from('notification_read_timestamps')
          .upsert({
            user_id: user.id,
            marked_read_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (err) {
        console.error('Failed to save notification read timestamp:', err);
      }
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-btn')) {
        setShowNotifications(false);
      }
      if (!target.closest('.user-menu') && !target.closest('.user-avatar')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-glass border-b border-light-border dark:border-dark-border px-8 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300"
    >
      {/* Left section */}
      <div className="flex items-center space-x-6">
        <div>
          <h1 className="text-lg font-bold text-light-text dark:text-dark-text">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <div className="flex items-center space-x-3">
            {plan === 'trial' && trialDaysRemaining !== null && !isTrialExpired ? (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-400 font-medium">
                  {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left in trial
                </span>
                <a
                  href="/pricing"
                  className="text-xs bg-lime-accent text-dark-base px-2 py-1 rounded-full font-medium hover:shadow-glow transition-all"
                >
                  Upgrade Now
                </a>
              </div>
            ) : plan === 'trial' && isTrialExpired ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-red-400 font-medium">Trial expired</span>
                <a
                  href="/pricing"
                  className="text-xs bg-lime-accent text-dark-base px-2 py-1 rounded-full font-medium hover:shadow-glow transition-all"
                >
                  Subscribe Now
                </a>
              </div>
            ) : (
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <Crown className="w-4 h-4 inline mr-1 text-lime-accent" />
                {plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan` : 'Free Plan'} • Last login: Today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 bg-light-glass dark:bg-dark-glass px-3 py-2 rounded-full transition-colors duration-300"
        >
          <Globe className="w-4 h-4 text-lime-accent" />
          <span className="text-xs text-light-text dark:text-dark-text">Encrypted</span>
        </motion.div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="notification-btn relative p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
          >
            <Bell className="w-5 h-5 text-light-text dark:text-dark-text" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-lime-accent rounded-full flex items-center justify-center"
              >
                <span className="text-xs font-bold text-dark-base">{unreadCount}</span>
              </motion.div>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="notification-dropdown absolute right-0 mt-2 w-80 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-glass overflow-hidden z-50"
              >
                <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-light-text dark:text-dark-text">Notifications</h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {unreadCount} unread
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-lime-accent hover:text-lime-accent/80 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-light-text-secondary dark:text-dark-text-secondary">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        whileHover={{ backgroundColor: 'rgba(101, 163, 13, 0.05)' }}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-light-border dark:border-dark-border last:border-b-0 cursor-pointer ${notification.unread ? 'bg-lime-accent/5' : ''
                          }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.unread ? 'bg-lime-accent' : 'bg-transparent'
                              }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-light-text dark:text-dark-text text-sm truncate">
                              {notification.title}
                            </h4>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1 truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-light-border dark:border-dark-border flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate?.('settings');
                    }}
                    className="text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-lime-accent transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-red-500/10 text-light-text dark:text-dark-text hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </motion.button>

        {/* User Avatar with Menu */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="user-avatar w-10 h-10 bg-lime-accent rounded-full flex items-center justify-center cursor-pointer shadow-glow"
          >
            <span className="text-dark-base font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </motion.div>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="user-menu absolute right-0 mt-2 w-48 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-glass overflow-hidden z-50"
              >
                <div className="p-3 border-b border-light-border dark:border-dark-border">
                  <p className="font-medium text-light-text dark:text-dark-text text-sm truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-lime-accent capitalize">{plan || 'Free'} Plan</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate?.('profile');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-light-text dark:text-dark-text hover:bg-lime-accent/10 transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate?.('settings');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-light-text dark:text-dark-text hover:bg-lime-accent/10 transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="py-1 border-t border-light-border dark:border-dark-border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
