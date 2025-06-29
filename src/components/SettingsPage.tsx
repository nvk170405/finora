import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Download,
  Smartphone,
  Monitor,
  Crown
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export const SettingsPage: React.FC = () => {
  const { plan, billingCycle } = useSubscription();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Settings</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Profile Section */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-lime-accent" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Profile Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Email</label>
                <input
                  type="email"
                  value={ user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Display Name</label>
                <input
                  type="text"
                  placeholder="Enter your display name"
                  className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-lime-accent" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-light-text dark:text-dark-text capitalize">{key} notifications</span>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-lime-accent' : 'bg-light-glass dark:bg-dark-glass'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-lime-accent" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Security</h3>
            </div>
            
            <div className="space-y-4">
              <button className="w-full text-left p-4 bg-light-glass dark:bg-dark-glass rounded-xl hover:bg-lime-accent/10 transition-colors">
                <div className="font-medium text-light-text dark:text-dark-text">Change Password</div>
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Update your account password</div>
              </button>
              
              <button className="w-full text-left p-4 bg-light-glass dark:bg-dark-glass rounded-xl hover:bg-lime-accent/10 transition-colors">
                <div className="font-medium text-light-text dark:text-dark-text">Two-Factor Authentication</div>
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Add an extra layer of security</div>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-lime-accent" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-light-text dark:text-dark-text">Theme</span>
                <ThemeToggle />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-light-text dark:text-dark-text">Default Currency</span>
                <select className="bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-light-text dark:text-dark-text">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>JPY</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Subscription Status */}
          <div className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Crown className="w-6 h-6 text-lime-accent" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Subscription</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Current Plan</span>
                <p className="font-bold text-lime-accent capitalize">{plan || 'Free Trial'}</p>
              </div>
              
              <div>
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Billing</span>
                <p className="font-medium text-light-text dark:text-dark-text capitalize">{billingCycle}</p>
              </div>
              
              <button className="w-full bg-lime-accent text-light-base dark:text-dark-base py-2 rounded-lg font-medium hover:shadow-glow transition-all">
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Download Apps */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-6 h-6 text-lime-accent" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Download Apps</h3>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/10 transition-colors">
                <Smartphone className="w-5 h-5 text-light-text dark:text-dark-text" />
                <span className="text-light-text dark:text-dark-text">Mobile App</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/10 transition-colors">
                <Monitor className="w-5 h-5 text-light-text dark:text-dark-text" />
                <span className="text-light-text dark:text-dark-text">Desktop App</span>
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Support</h3>
            
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/10 transition-colors">
                <div className="font-medium text-light-text dark:text-dark-text">Help Center</div>
              </button>
              
              <button className="w-full text-left p-3 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/10 transition-colors">
                <div className="font-medium text-light-text dark:text-dark-text">Contact Support</div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};