import React, { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../config/supabase';

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [validSession, setValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        // Check if user came from a valid reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setValidSession(true);
            }
            setCheckingSession(false);
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking session
    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-base dark:bg-dark-base">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
            </div>
        );
    }

    // Show error if no valid session
    if (!validSession) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-light-base dark:bg-dark-base">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
                        <div className="p-2 bg-lime-accent rounded-lg">
                            <TrendingUp className="w-6 h-6 text-gray-900" />
                        </div>
                        <span className="text-2xl font-bold text-lime-accent font-editorial">FinoraX</span>
                    </Link>

                    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-glass">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Invalid or Expired Link
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>

                        <Link
                            to="/forgot-password"
                            className="inline-block w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
                        >
                            Request New Link
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Show success message
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-light-base dark:bg-dark-base">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
                        <div className="p-2 bg-lime-accent rounded-lg">
                            <TrendingUp className="w-6 h-6 text-gray-900" />
                        </div>
                        <span className="text-2xl font-bold text-lime-accent font-editorial">FinoraX</span>
                    </Link>

                    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-glass">
                        <div className="w-16 h-16 mx-auto mb-4 bg-lime-accent/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-lime-accent" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Password Reset Successful!
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your password has been updated. Redirecting to login...
                        </p>

                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lime-accent mx-auto"></div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-light-base dark:bg-dark-base">
            <div className="max-w-md w-full space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
                        <div className="p-2 bg-lime-accent rounded-lg">
                            <TrendingUp className="w-6 h-6 text-gray-900" />
                        </div>
                        <span className="text-2xl font-bold text-lime-accent font-editorial">FinoraX</span>
                    </Link>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-editorial">
                        Set New Password
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Enter your new password below
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50 focus:ring-2 focus:ring-lime-accent/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50 focus:ring-2 focus:ring-lime-accent/20"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};
