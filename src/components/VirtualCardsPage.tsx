import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Sparkles, Bell } from 'lucide-react';

export const VirtualCardsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-editorial">Virtual Cards</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Generate secure virtual cards for online payments
                </p>
            </motion.div>

            {/* Coming Soon Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center relative overflow-hidden shadow-lg"
            >
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    {/* Card Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-2xl"
                    >
                        <CreditCard className="w-12 h-12 text-lime-accent" />
                    </motion.div>

                    {/* Coming Soon Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center space-x-2 bg-lime-accent/20 text-lime-600 dark:text-lime-accent px-4 py-2 rounded-full mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium">Coming Soon</span>
                    </motion.div>

                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
                    >
                        Virtual Cards Are On The Way
                    </motion.h3>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8"
                    >
                        We're building something amazing! Soon you'll be able to generate unlimited virtual cards
                        for secure online shopping, set spending limits, and more.
                    </motion.p>

                    {/* Features Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8"
                    >
                        {[
                            { title: 'Instant Generation', desc: 'Create cards in seconds' },
                            { title: 'Spending Limits', desc: 'Control your budget' },
                            { title: 'Single-Use Option', desc: 'Extra security for purchases' },
                        ].map((feature, index) => (
                            <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                                <p className="font-medium text-gray-900 dark:text-white">{feature.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Notify Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="inline-flex items-center space-x-2 bg-lime-accent text-gray-900 px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
                    >
                        <Bell className="w-5 h-5" />
                        <span>Notify Me When Ready</span>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};
