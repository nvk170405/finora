import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, MapPin, Phone, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { userService, UserProfile } from '../services';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { plan } = useSubscription();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ totalTransactions: 0, activeCurrencies: 0, memberSince: null as Date | null });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, statsData] = await Promise.all([
          userService.getProfile(),
          userService.getAccountStats(),
        ]);
        setProfile(profileData);
        setStats(statsData);
        if (profileData) {
          setFormData({
            full_name: profileData.full_name || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      const updated = await userService.upsertProfile(formData);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
          <div className="lg:col-span-2 h-64 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Profile</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Manage your personal information</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-6 text-center"
        >
          <div className="w-24 h-24 bg-lime-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-light-base dark:text-dark-base">
              {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>

          <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-1">
            {profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'User'}
          </h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">{user?.email}</p>

          <div className="inline-flex items-center space-x-2 bg-lime-accent/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-lime-accent rounded-full"></span>
            <span className="text-sm text-lime-accent font-medium capitalize">{plan || 'Free'} Plan</span>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="w-full mt-6 bg-lime-accent text-light-base dark:text-dark-base py-2 rounded-lg font-medium hover:shadow-glow transition-all flex items-center justify-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>{editing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Personal Information</h3>
            {editing && (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 text-lime-accent hover:text-lime-accent/80 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-lg">
                <User className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <div className="flex-1">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Full Name</p>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-transparent border-b border-lime-accent/50 text-light-text dark:text-dark-text focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-light-text dark:text-dark-text">{profile?.full_name || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-lg">
                <Mail className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <div>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Email</p>
                  <p className="font-medium text-light-text dark:text-dark-text">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-lg">
                <Phone className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <div className="flex-1">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Phone</p>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full bg-transparent border-b border-lime-accent/50 text-light-text dark:text-dark-text focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-light-text dark:text-dark-text">{profile?.phone || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-lg">
                <MapPin className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <div className="flex-1">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Location</p>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      className="w-full bg-transparent border-b border-lime-accent/50 text-light-text dark:text-dark-text focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-light-text dark:text-dark-text">{profile?.location || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-lg">
                <Calendar className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <div>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Member Since</p>
                  <p className="font-medium text-light-text dark:text-dark-text">{formatDate(stats.memberSince)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Account Activity</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-lime-accent mb-1">{stats.totalTransactions}</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Transactions</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400 mb-1">{stats.activeCurrencies}</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Currencies</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400 mb-1">{plan ? '1' : '0'}</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Subscriptions</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400 mb-1">Active</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Account Status</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};