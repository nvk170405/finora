import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, CheckCircle, Sparkles } from 'lucide-react';
import { achievementService, Achievement } from '../services/achievementService';
import { StreakCounter } from './StreakCounter';
import { PremiumGate } from './PremiumGate';

interface AchievementWithStatus extends Achievement {
    unlocked: boolean;
    unlocked_at?: string;
}

export const AchievementsPage: React.FC = () => {
    const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        setLoading(true);
        const data = await achievementService.getAllAchievementsWithStatus();
        setAchievements(data);
        setLoading(false);
    };

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    // Group achievements by category
    const categories = [
        { id: 'streaks', label: '🔥 Streaks', description: 'No-spend day achievements' },
        { id: 'deposits', label: '💰 Deposits', description: 'Saving milestones' },
        { id: 'goals', label: '🎯 Goals', description: 'Savings goals' },
        { id: 'special', label: '✨ Special', description: 'Hidden achievements' },
        { id: 'wallets', label: '🌍 Global', description: 'Multi-currency milestones' },
        { id: 'recurring', label: '🔄 Automation', description: 'Recurring setup' },
        { id: 'withdrawals', label: '💸 Cash Flow', description: 'Withdrawal milestones' },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/3 mb-4"></div>
                    <div className="h-48 bg-light-glass dark:bg-dark-glass rounded-2xl mb-6"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PremiumGate
            feature="achievements"
            requiredPlan="basic"
            title="Achievements & Streaks"
            description="Unlock badges by building good financial habits. Upgrade to basic plan to unlock."
        >
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
                        Achievements & Streaks
                    </h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Unlock badges by building good financial habits
                    </p>
                </motion.div>

                {/* Streak Counter */}
                <StreakCounter />

                {/* Progress Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-lime-accent/20 rounded-xl">
                                <Trophy className="w-8 h-8 text-lime-accent" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
                                    Achievement Progress
                                </h3>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    {unlockedCount} of {totalCount} unlocked
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-lime-accent">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-4 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-gradient-to-r from-lime-accent to-green-500 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Achievements by Category */}
                {categories.map((category, catIdx) => {
                    const categoryAchievements = achievements.filter(a => a.category === category.id);
                    if (categoryAchievements.length === 0) return null;

                    return (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + catIdx * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
                                        {category.label}
                                    </h3>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        {category.description}
                                    </p>
                                </div>
                                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    {categoryAchievements.filter(a => a.unlocked).length}/{categoryAchievements.length}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {categoryAchievements.map((achievement, idx) => (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                        className={`relative p-4 rounded-xl border transition-all ${achievement.unlocked
                                            ? 'bg-lime-accent/10 border-lime-accent/30'
                                            : 'bg-light-glass dark:bg-dark-glass border-light-border dark:border-dark-border opacity-60'
                                            }`}
                                    >
                                        {/* Status Icon */}
                                        <div className="absolute top-2 right-2">
                                            {achievement.unlocked ? (
                                                <CheckCircle className="w-5 h-5 text-lime-accent" />
                                            ) : (
                                                <Lock className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                                            )}
                                        </div>

                                        {/* Icon */}
                                        <div className={`text-4xl mb-3 ${!achievement.unlocked && 'grayscale'}`}>
                                            {achievement.icon}
                                        </div>

                                        {/* Info */}
                                        <h4 className="font-bold text-light-text dark:text-dark-text mb-1">
                                            {achievement.name}
                                        </h4>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            {achievement.description}
                                        </p>

                                        {/* Unlock Date */}
                                        {achievement.unlocked && achievement.unlocked_at && (
                                            <p className="text-xs text-lime-accent mt-2 flex items-center">
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                {new Date(achievement.unlocked_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </PremiumGate>
    );
};
