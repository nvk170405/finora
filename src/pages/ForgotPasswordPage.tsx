import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../config/supabase';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setEmailSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    // Show success message after email sent
    if (emailSent) {
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
                            Check Your Email
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            We've sent a password reset link to:
                        </p>

                        <p className="text-lime-accent font-medium mb-6">
                            {email}
                        </p>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                            <p className="text-blue-400 text-sm">
                                📧 Click the link in the email to reset your password. The link expires in 1 hour.
                            </p>
                        </div>

                        <Link
                            to="/login"
                            className="inline-block w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
                        >
                            Back to Login
                        </Link>
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
                        Forgot Password?
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Enter your email and we'll send you a reset link
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
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50 focus:ring-2 focus:ring-lime-accent/20"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-lime-accent transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
