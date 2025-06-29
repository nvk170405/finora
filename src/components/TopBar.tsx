import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Globe } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

export const TopBar: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { plan } = useSubscription();
  const navigate = useNavigate();

  

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'New transaction received',
      message: 'You received $1,250 from Sarah Johnson',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Exchange rate alert',
      message: 'EUR/USD reached your target rate of 1.0900',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Monthly report ready',
      message: 'Your financial summary for November is available',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;
  
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
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan` : 'Trial Plan'} • Last login: Today
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-6">
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
            className="relative p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
          >
            <Bell className="w-5 h-5 text-light-text dark:text-dark-text" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-lime-accent rounded-full flex items-center justify-center"
              >
                <span className="text-xs font-bold text-light-base dark:text-dark-base">{unreadCount}</span>
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
                className="absolute right-0 mt-2 w-80 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-glass overflow-hidden z-50"
              >
                <div className="p-4 border-b border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-light-text dark:text-dark-text">Notifications</h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {unreadCount} unread notifications
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      whileHover={{ backgroundColor: 'rgba(101, 163, 13, 0.05)' }}
                      className={`p-4 border-b border-light-border dark:border-dark-border last:border-b-0 cursor-pointer ${
                        notification.unread ? 'bg-lime-accent/5' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? 'bg-lime-accent' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-light-text dark:text-dark-text text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 border-t border-light-border dark:border-dark-border">
                  <button className="w-full text-center text-lime-accent hover:text-lime-accent/80 transition-colors text-sm font-medium">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            handleLogout();
            setIsMenuOpen(false);
          }}
          className="text-light-text dark:text-dark-text hover:text-lime-accent transition-colors text-left"
        >
          Logout
        </button>

        {/* User Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 bg-lime-accent rounded-full flex items-center justify-center cursor-pointer shadow-glow"
        >
          <span className="text-light-base dark:text-dark-base font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};
