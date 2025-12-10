import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';

export const VerificationSuccessPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-light-base dark:bg-dark-base">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center"
            >
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
                    <div className="p-2 bg-lime-accent rounded-lg">
                        <TrendingUp className="w-6 h-6 text-light-base dark:text-dark-base" />
                    </div>
                    <span className="text-2xl font-bold text-lime-accent font-editorial">FinoraX</span>
                </Link>

                {/* Success Card */}
                <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-glass">
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 mx-auto mb-6 bg-lime-accent/20 rounded-full flex items-center justify-center"
                    >
                        <CheckCircle className="w-10 h-10 text-lime-accent" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
                    >
                        Email Verified!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 dark:text-gray-400 mb-6"
                    >
                        Your email has been successfully verified. You can now log in to start your 7-day free trial!
                    </motion.p>

                    {/* Login Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center space-x-2 w-full bg-lime-accent text-gray-900 py-3 px-6 rounded-xl font-medium hover:shadow-glow transition-all"
                        >
                            <span>Login to Dashboard</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>

                    {/* Trial Info */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-sm text-gray-500 dark:text-gray-500 mt-4"
                    >
                        🎁 Your 7-day premium trial starts when you log in
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};
