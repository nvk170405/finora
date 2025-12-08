import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Globe,
  Download,
  Smartphone,
  Monitor,
  Crown,
  Loader2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { ThemeToggle } from './ThemeToggle';
import { userService, UserSettings } from '../services';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

export const SettingsPage: React.FC = () => {
  const { plan, billingCycle } = useSubscription();
  const { user } = useAuth();
  const { defaultCurrency, setDefaultCurrency } = usePreferences();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const [settingsData, profileData] = await Promise.all([
          userService.getSettings(),
          userService.getProfile(),
        ]);

        if (!settingsData) {
          const defaultSettings = await userService.upsertSettings({
            notifications_email: true,
            notifications_push: true,
            notifications_sms: false,
            two_factor_enabled: false,
            theme: 'system',
          });
          setSettings(defaultSettings);
        } else {
          setSettings(settingsData);
        }

        setDisplayName(profileData?.display_name || user?.email?.split('@')[0] || '');
      } catch (err) {
        console.error('Error loading settings:', err);
        setSettings({
          id: '',
          user_id: '',
          notifications_email: true,
          notifications_push: true,
          notifications_sms: false,
          two_factor_enabled: false,
          theme: 'system',
          created_at: '',
          updated_at: '',
        });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user]);

  const handleNotificationToggle = async (key: 'notifications_email' | 'notifications_push' | 'notifications_sms') => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await userService.upsertSettings({ [key]: newSettings[key] });
      const label = key.replace('notifications_', '');
      showToast(`${label.charAt(0).toUpperCase() + label.slice(1)} notifications ${newSettings[key] ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Error updating setting:', err);
      setSettings(settings);
      showToast('Failed to update setting');
    }
  };

  const handleDisplayNameSave = async () => {
    setSaving(true);
    try {
      await userService.upsertProfile({ display_name: displayName });
      showToast('Display name updated!');
    } catch (err) {
      console.error('Error saving display name:', err);
      showToast('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    setDefaultCurrency(currency);
    try {
      await userService.upsertProfile({ default_currency: currency });
      showToast(`Default currency set to ${currency}`);
    } catch (err) {
      console.error('Error saving currency:', err);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setShowPasswordModal(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully!');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handle2FAToggle = async () => {
    if (!settings) return;

    const newValue = !settings.two_factor_enabled;

    try {
      await userService.upsertSettings({ two_factor_enabled: newValue });
      setSettings({ ...settings, two_factor_enabled: newValue });
      setShow2FAModal(false);
      showToast(`Two-factor authentication ${newValue ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Error updating 2FA:', err);
      showToast('Failed to update 2FA setting');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-8 z-50 bg-lime-accent text-dark-base px-4 py-3 rounded-xl flex items-center space-x-2 shadow-glow"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Settings</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Profile */}
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
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Display Name</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="flex-1 px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                  />
                  <button
                    onClick={handleDisplayNameSave}
                    disabled={saving}
                    className="px-4 py-3 bg-lime-accent text-dark-base rounded-xl font-medium hover:shadow-glow disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Default Currency */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-lime-accent" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Default Currency</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                This currency will be used as the default across the app for displaying amounts.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
                  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
                  { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
                  { code: 'INR', flag: '🇮🇳', name: 'Indian Rupee' },
                  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen' },
                  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar' },
                  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar' },
                ].map((currency) => (
                  <button
                    key={currency.code}
                    onClick={async () => {
                      setDefaultCurrency(currency.code);
                      try {
                        await userService.upsertProfile({ default_currency: currency.code });
                        showToast(`Default currency set to ${currency.code}`);
                      } catch (err) {
                        console.error('Error saving currency:', err);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${defaultCurrency === currency.code
                      ? 'border-lime-accent bg-lime-accent/10'
                      : 'border-light-border dark:border-dark-border hover:border-lime-accent/50'
                      }`}
                  >
                    <span className="text-2xl mb-1 block">{currency.flag}</span>
                    <span className="font-bold text-light-text dark:text-dark-text">{currency.code}</span>
                  </button>
                ))}
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
              {/* Email Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-light-text dark:text-dark-text font-medium">Email notifications</span>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Receive updates via email</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('notifications_email')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${settings?.notifications_email ? 'bg-lime-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${settings?.notifications_email ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Push Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-light-text dark:text-dark-text font-medium">Push notifications</span>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Browser push notifications</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('notifications_push')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${settings?.notifications_push ? 'bg-lime-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${settings?.notifications_push ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* SMS Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-light-text dark:text-dark-text font-medium">SMS notifications</span>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Text message alerts</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('notifications_sms')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${settings?.notifications_sms ? 'bg-lime-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${settings?.notifications_sms ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-lime-accent" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Security</h3>
            </div>

            <div className="space-y-4">
              <button onClick={() => setShowPasswordModal(true)} className="w-full text-left p-4 bg-light-glass dark:bg-dark-glass rounded-xl hover:bg-lime-accent/10 transition-colors">
                <div className="font-medium text-light-text dark:text-dark-text">Change Password</div>
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Update your account password</div>
              </button>

              <button onClick={() => setShow2FAModal(true)} className="w-full text-left p-4 bg-light-glass dark:bg-dark-glass rounded-xl hover:bg-lime-accent/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-light-text dark:text-dark-text">Two-Factor Authentication</div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {settings?.two_factor_enabled ? 'Currently enabled' : 'Add extra security'}
                    </div>
                  </div>
                  {settings?.two_factor_enabled && (
                    <span className="px-2 py-1 bg-lime-accent/20 text-lime-accent text-xs rounded-full font-medium">Enabled</span>
                  )}
                </div>
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
                <div>
                  <span className="text-light-text dark:text-dark-text font-medium">Theme</span>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Toggle dark/light mode</p>
                </div>
                <ThemeToggle />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-light-text dark:text-dark-text font-medium">Default Currency</span>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Your preferred currency</p>
                </div>
                <select
                  value={defaultCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-gray-900 dark:text-white cursor-pointer"
                  style={{ colorScheme: 'light dark' }}
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>INR</option>
                  <option>JPY</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          {/* Subscription */}
          <div className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Crown className="w-6 h-6 text-lime-accent" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Subscription</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Current Plan</span>
                <span className="font-bold text-lime-accent capitalize">{plan || 'Free Trial'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Billing Cycle</span>
                <span className="font-medium text-light-text dark:text-dark-text capitalize">{billingCycle || 'N/A'}</span>
              </div>
              {plan && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Status</span>
                  <span className="flex items-center space-x-1 text-green-500">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </span>
                </div>
              )}
              <div className="pt-2 space-y-2">
                {plan === 'basic' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full bg-lime-accent text-dark-base py-2 rounded-lg font-medium hover:shadow-glow"
                  >
                    Upgrade to Premium
                  </button>
                )}
                {plan === 'premium' && (
                  <div className="text-center py-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    You're on the best plan! 🎉
                  </div>
                )}
                {!plan && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full bg-lime-accent text-dark-base py-2 rounded-lg font-medium hover:shadow-glow"
                  >
                    Choose a Plan
                  </button>
                )}
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full border border-light-border dark:border-dark-border text-light-text dark:text-dark-text py-2 rounded-lg font-medium hover:border-lime-accent/50 transition-colors"
                >
                  View All Plans
                </button>
              </div>
            </div>
          </div>

          {/* Download Apps */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-6 h-6 text-lime-accent" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Download Apps</h3>
            </div>
            <div className="space-y-3">
              <button onClick={() => showToast('Mobile app coming soon!')} className="w-full flex items-center space-x-3 p-3 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/10">
                <Smartphone className="w-5 h-5 text-light-text dark:text-dark-text" />
                <span className="text-light-text dark:text-dark-text">Mobile App</span>
              </button>
              <button onClick={() => showToast('Desktop app coming soon!')} className="w-full flex items-center space-x-3 p-3 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/10">
                <Monitor className="w-5 h-5 text-light-text dark:text-dark-text" />
                <span className="text-light-text dark:text-dark-text">Desktop App</span>
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Support</h3>
            <div className="space-y-3">
              <button onClick={() => showToast('Opening Help Center...')} className="w-full text-left p-3 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/10">
                <div className="font-medium text-light-text dark:text-dark-text">Help Center</div>
              </button>
              <button onClick={() => showToast('Opening email client...')} className="w-full text-left p-3 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/10">
                <div className="font-medium text-light-text dark:text-dark-text">Contact Support</div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-light-text-secondary hover:text-light-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">{passwordError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-3 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text rounded-xl font-medium">Cancel</button>
                  <button onClick={handlePasswordChange} disabled={passwordLoading} className="flex-1 px-4 py-3 bg-lime-accent text-dark-base rounded-xl font-medium disabled:opacity-50">
                    {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Password'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShow2FAModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Two-Factor Authentication</h3>
                <button onClick={() => setShow2FAModal(false)} className="text-light-text-secondary hover:text-light-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${settings?.two_factor_enabled ? 'bg-lime-accent/20' : 'bg-light-glass dark:bg-dark-glass'}`}>
                  <Shield className={`w-8 h-8 ${settings?.two_factor_enabled ? 'text-lime-accent' : 'text-light-text-secondary'}`} />
                </div>
                <p className="text-light-text dark:text-dark-text mb-2">
                  {settings?.two_factor_enabled ? '2FA is currently enabled' : 'Add an extra layer of security'}
                </p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                  {settings?.two_factor_enabled ? 'Disabling will make your account less secure' : 'Verify your identity when logging in'}
                </p>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setShow2FAModal(false)} className="flex-1 px-4 py-3 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text rounded-xl font-medium">Cancel</button>
                <button
                  onClick={handle2FAToggle}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium ${settings?.two_factor_enabled ? 'bg-red-500 text-white' : 'bg-lime-accent text-dark-base'}`}
                >
                  {settings?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};