import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, Zap } from 'lucide-react';
import { achievementService, SpendingStreak } from '../services/achievementService';

interface StreakCounterProps {
    compact?: boolean;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ compact = false }) => {
    const [streak, setStreak] = useState<SpendingStreak>({
        current_streak: 0,
        best_streak: 0,
        last_no_spend_date: null,
        streak_started_at: null,
    });
    const [loading, setLoading] = useState(true);
    const [logging, setLogging] = useState(false);

    useEffect(() => {
        loadStreak();
    }, []);

    const loadStreak = async () => {
        setLoading(true);
        const data = await achievementService.getStreak();
        setStreak(data);
        setLoading(false);
    };

    const handleLogNoSpendDay = async () => {
        setLogging(true);
        const updated = await achievementService.logNoSpendDay();
        setStreak(updated);
        setLogging(false);
    };

    const today = new Date().toISOString().split('T')[0];
    const alreadyLogged = streak.last_no_spend_date === today;

    // Get streak milestone
    const getStreakMilestone = (days: number) => {
        if (days >= 30) return { label: '🔥 Monthly Master!', color: 'from-orange-500 to-red-600' };
        if (days >= 14) return { label: '⚔️ Fortnight Fighter!', color: 'from-purple-500 to-pink-600' };
        if (days >= 7) return { label: '🛡️ Week Warrior!', color: 'from-blue-500 to-cyan-500' };
        if (days >= 3) return { label: '✨ Mindful Spender', color: 'from-lime-400 to-green-500' };
        return { label: 'Build your streak!', color: 'from-gray-400 to-gray-500' };
    };

    const milestone = getStreakMilestone(streak.current_streak);

    if (loading) {
        return (
            <div className="bg-light-surface/50 dark:bg-dark-surface/50 rounded-xl p-4 animate-pulse">
                <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/2 mb-2"></div>
                <div className="h-12 bg-light-glass dark:bg-dark-glass rounded"></div>
            </div>
        );
    }

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Flame className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                No-Spend Streak
                            </p>
                            <p className="text-2xl font-bold text-orange-500">
                                {streak.current_streak} days
                            </p>
                        </div>
                    </div>
                    {!alreadyLogged && (
                        <button
                            onClick={handleLogNoSpendDay}
                            disabled={logging}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {logging ? '...' : '+1 Day'}
                        </button>
                    )}
                    {alreadyLogged && (
                        <span className="text-green-500 text-sm">✓ Today logged!</span>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 overflow-hidden relative"
        >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${milestone.color} opacity-10`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <motion.div
                            animate={{ scale: streak.current_streak > 0 ? [1, 1.1, 1] : 1 }}
                            transition={{ duration: 0.5, repeat: streak.current_streak > 0 ? Infinity : 0, repeatDelay: 2 }}
                            className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl"
                        >
                            <Flame className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
                                No-Spend Streak
                            </h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {milestone.label}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current Streak */}
                <div className="flex items-center justify-center mb-6">
                    <motion.div
                        key={streak.current_streak}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <span className="text-6xl font-bold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent">
                            {streak.current_streak}
                        </span>
                        <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            consecutive days
                        </p>
                    </motion.div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-light-glass dark:bg-dark-glass rounded-xl">
                        <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Best</p>
                        <p className="text-lg font-bold text-light-text dark:text-dark-text">{streak.best_streak}</p>
                    </div>
                    <div className="text-center p-3 bg-light-glass dark:bg-dark-glass rounded-xl">
                        <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Started</p>
                        <p className="text-lg font-bold text-light-text dark:text-dark-text">
                            {streak.streak_started_at
                                ? new Date(streak.streak_started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : '-'
                            }
                        </p>
                    </div>
                    <div className="text-center p-3 bg-light-glass dark:bg-dark-glass rounded-xl">
                        <Zap className="w-5 h-5 text-lime-accent mx-auto mb-1" />
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Next</p>
                        <p className="text-lg font-bold text-light-text dark:text-dark-text">
                            {streak.current_streak < 3 ? '3 🔥' :
                                streak.current_streak < 7 ? '7 ⚔️' :
                                    streak.current_streak < 14 ? '14 🛡️' :
                                        streak.current_streak < 30 ? '30 👑' : '∞'}
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                {!alreadyLogged ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogNoSpendDay}
                        disabled={logging}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {logging ? 'Logging...' : '🎯 Log No-Spend Day'}
                    </motion.button>
                ) : (
                    <div className="w-full py-4 bg-green-500/20 text-green-500 font-bold rounded-xl text-center">
                        ✓ Today already logged! Keep it up! 🎉
                    </div>
                )}

                {/* Streak Tips */}
                <p className="text-xs text-center text-light-text-secondary dark:text-dark-text-secondary mt-4">
                    Log each day you don't make unnecessary purchases
                </p>
            </div>
        </motion.div>
    );
};
