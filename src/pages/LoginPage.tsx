import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { BsGoogle, BsApple, BsMeta } from 'react-icons/bs';
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle, loginWithApple, loginWithMeta } = useAuth();
  const { refreshSubscription } = useSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await login(email, password);
      if (error) throw error;

      // Wait a bit for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh subscription data
      await refreshSubscription();

      // Check subscription status from localStorage or make a quick check
      const { data: userData } = await (await import('../config/supabase')).supabase.auth.getUser();
      if (userData.user) {
        const { data: subData } = await (await import('../config/supabase')).supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', userData.user.id)
          .single();

        // Redirect based on subscription status
        if (subData && subData.plan) {
          window.location.href = '/dashboard';
        } else {
          // No subscription - redirect to auth callback to start trial
          window.location.href = '/auth/callback';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'meta') => {
    setLoading(true);
    setError('');

    try {
      let result;
      if (provider === 'google') {
        result = await loginWithGoogle();
      } else if (provider === 'apple') {
        result = await loginWithApple();
      } else if (provider === 'meta') {
        result = await loginWithMeta();
      }



      // Supabase handles the redirect
    } catch (err: any) {
      setError(err.message || `Failed to login with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="p-2 bg-lime-accent rounded-lg">
              <TrendingUp className="w-6 h-6 text-light-base dark:text-dark-base" />
            </div>
            <span className="text-2xl font-bold text-lime-accent font-editorial">FinoraX</span>
          </Link>

          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
            Welcome back
          </h2>
          <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            Sign in to your account to continue
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-glass"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-lime-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-light-border dark:border-dark-border"></div>
            <span className="px-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">Or continue with</span>
            <div className="flex-1 border-t border-light-border dark:border-dark-border"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border py-3 rounded-xl hover:border-lime-accent/30 transition-all disabled:opacity-50"
            >
              <span className="text-xl"><BsGoogle className='mb-1' /></span>
              <span className="text-light-text dark:text-dark-text">Continue with Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border py-3 rounded-xl hover:border-lime-accent/30 transition-all disabled:opacity-50"
            >
              <span className="text-xl"><BsApple className='mb-1' /></span>
              <span className="text-light-text dark:text-dark-text">Continue with Apple</span>
            </button>

            <button
              onClick={() => handleSocialLogin('meta')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border py-3 rounded-xl hover:border-lime-accent/30 transition-all disabled:opacity-50"
            >
              <span className="text-xl"><BsMeta className='mb-1' /></span>
              <span className="text-light-text dark:text-dark-text">Continue with Meta</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="text-lime-accent hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
