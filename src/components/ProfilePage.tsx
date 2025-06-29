import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, MapPin, Phone, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { plan } = useSubscription();

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
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-1">John Doe</h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">{user?.email}</p>
          
          <div className="inline-flex items-center space-x-2 bg-lime-accent/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-lime-accent rounded-full"></span>
            <span className="text-sm text-lime-accent font-medium capitalize">{plan || 'Free'} Plan</span>
          </div>
          
          <button className="w-full mt-6 bg-lime-accent text-light-base dark:text-dark-base py-2 rounded-lg font-medium hover:shadow-glow transition-all">
            Edit Profile
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
            <button className="flex items-center space-x-2 text-lime-accent hover:text-lime-accent/80 transition-colors">
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-lg">
                <User className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <div>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Full Name</p>
                  <p className="font-medium text-light-text dark:text-dark-text">John Doe</p>
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
                <div>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Phone</p>
                  <p className="font-medium text-light-text dark:text-dark-text">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-lg">
                <MapPin className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <div>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Location</p>
                  <p className="font-medium text-light-text dark:text-dark-text">San Francisco, CA</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-light-glass dark:bg-dark-glass rounded-lg">
                <Calendar className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <div>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Member Since</p>
                  <p className="font-medium text-light-text dark:text-dark-text">January 2024</p>
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
            <p className="text-2xl font-bold text-lime-accent mb-1">247</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Transactions</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400 mb-1">12</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Currencies</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400 mb-1">8</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Countries</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400 mb-1">94%</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Satisfaction Score</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};