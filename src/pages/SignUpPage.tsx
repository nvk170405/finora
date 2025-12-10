import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BsGoogle, BsApple, BsMeta } from "react-icons/bs";

export const SignUpPage: React.FC = () => {
  const { signup, loginWithGoogle, loginWithApple, loginWithMeta } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signup(email, password, name);
      if (error) throw error;
      // Show verification message instead of redirecting
      setVerificationSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      if (provider === 'google') await loginWithGoogle();
      else if (provider === 'facebook') await loginWithMeta();
      else if (provider === 'apple') await loginWithApple();
    } catch (err: any) {
      setError(err.message || 'Social signup failed');
    }
  };

  // Show verification message after signup
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-light-base dark:bg-dark-base">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="p-2 bg-lime-accent rounded-lg">
              <TrendingUp className="w-6 h-6 text-light-base dark:text-dark-base" />
            </div>
            <span className="text-2xl font-bold text-lime-accent font-editorial">FinoraX</span>
          </Link>

          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-glass">
            <div className="w-16 h-16 mx-auto mb-4 bg-lime-accent/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-lime-accent" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Verify Your Email
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We've sent a verification email to:
            </p>

            <p className="text-lime-accent font-medium mb-6">
              {email}
            </p>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-blue-400 text-sm">
                📧 Please check your inbox and click the verification link to activate your account.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-block w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
            >
              Go to Login
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

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
            Create an Account
          </h2>
          <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            Start your financial journey with FinoraX
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

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Email Address
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 transition-colors"
                  placeholder="Enter your password"
                />

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-light-border dark:border-dark-border"></div>
            <span className="px-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">Or continue with</span>
            <div className="flex-1 border-t border-light-border dark:border-dark-border"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSocialSignup('google')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border py-3 rounded-xl hover:border-lime-accent/30 transition-all disabled:opacity-50"
            >
              <span className="text-xl"><BsGoogle className='mb-1' /></span>
              <span className="text-light-text dark:text-dark-text">Continue with Google</span>
            </button>

            <button
              onClick={() => handleSocialSignup('apple')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border py-3 rounded-xl hover:border-lime-accent/30 transition-all disabled:opacity-50"
            >
              <span className="text-xl"><BsApple className='z-10 mb-1' /></span>
              <span className="text-light-text dark:text-dark-text">Continue with Apple</span>
            </button>

            <button
              onClick={() => handleSocialSignup('facebook')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border py-3 rounded-xl hover:border-lime-accent/30 transition-all disabled:opacity-50"
            >
              <span className="text-xl"><BsMeta className='mb-1' /></span>
              <span className="text-light-text dark:text-dark-text">Continue with Meta</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-lime-accent hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
