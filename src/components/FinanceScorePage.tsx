import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Award, Target, Wallet,
    PiggyBank, Shield, Zap, ChevronRight, Info, Star
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWalletContext } from '../contexts/WalletContext';

interface ScoreBreakdown {
    savingsRate: number;
    budgetAdherence: number;
    goalProgress: number;
    diversification: number;
    consistency: number;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt?: string;
}

const badges: Badge[] = [
    { id: 'first_deposit', name: 'First Steps', description: 'Made your first deposit', icon: '🌱', earned: false },
    { id: 'goal_setter', name: 'Goal Setter', description: 'Created a savings goal', icon: '🎯', earned: false },
    { id: 'consistent', name: 'Consistent Saver', description: '4 deposits in a row', icon: '⚡', earned: false },
    { id: 'diversified', name: 'Diversified', description: '3+ different currencies', icon: '🌍', earned: false },
    { id: 'goal_crusher', name: 'Goal Crusher', description: 'Completed a savings goal', icon: '🏆', earned: false },
    { id: 'big_saver', name: 'Big Saver', description: 'Saved $1000+', icon: '💰', earned: false },
];

const getScoreColor = (score: number): string => {
    if (score >= 80) return '#CAFF40'; // Excellent - Lime
    if (score >= 60) return '#4ECDC4'; // Good - Teal
    if (score >= 40) return '#FFE66D'; // Fair - Yellow
    return '#FF6B6B'; // Needs Work - Red
};

const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
};

export const FinanceScorePage: React.FC = () => {
    const { user } = useAuth();
    const { wallets } = useWalletContext();
    const [loading, setLoading] = useState(true);
    const [overallScore, setOverallScore] = useState(0);
    const [breakdown, setBreakdown] = useState<ScoreBreakdown>({
        savingsRate: 0,
        budgetAdherence: 0,
        goalProgress: 0,
        diversification: 0,
        consistency: 0,
    });
    const [earnedBadges, setEarnedBadges] = useState<Badge[]>(badges);
    const [tips, setTips] = useState<string[]>([]);
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        if (user) {
            calculateScore();
        }
    }, [user, wallets]);

    useEffect(() => {
        // Animate score counting
        if (overallScore > 0) {
            const duration = 1500;
            const steps = 60;
            const increment = overallScore / steps;
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= overallScore) {
                    setAnimatedScore(overallScore);
                    clearInterval(timer);
                } else {
                    setAnimatedScore(Math.floor(current));
                }
            }, duration / steps);
            return () => clearInterval(timer);
        }
    }, [overallScore]);

    const calculateScore = async () => {
        try {
            // Fetch transactions for analysis
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(100);

            // Fetch savings goals
            const { data: goals } = await supabase
                .from('savings_goals')
                .select('*')
                .eq('user_id', user?.id);

            const txns = transactions || [];
            const savingsGoals = goals || [];

            // Calculate each factor

            // 1. Savings Rate (30%) - Income vs Expenses
            const deposits = txns.filter(t => t.type === 'deposit' || t.amount > 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const expenses = txns.filter(t => t.type === 'expense' || (t.type === 'withdrawal' && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const savingsRate = deposits > 0 ? Math.min(((deposits - expenses) / deposits) * 100, 100) : 0;
            const savingsScore = Math.max(0, Math.min(savingsRate, 100));

            // 2. Budget Adherence (25%) - Based on transaction regularity
            const monthlyExpenses: Record<string, number> = {};
            txns.forEach(t => {
                if (t.amount < 0) {
                    const month = new Date(t.created_at).toISOString().slice(0, 7);
                    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + Math.abs(t.amount);
                }
            });
            const months = Object.values(monthlyExpenses);
            const avgExpense = months.length > 0 ? months.reduce((a, b) => a + b, 0) / months.length : 0;
            const variance = months.length > 1
                ? months.reduce((sum, m) => sum + Math.pow(m - avgExpense, 2), 0) / months.length
                : 0;
            const budgetScore = Math.max(0, 100 - Math.min(Math.sqrt(variance) / (avgExpense || 1) * 100, 100));

            // 3. Goal Progress (20%) - Average progress across all goals
            const goalProgress = savingsGoals.length > 0
                ? savingsGoals.reduce((sum, g) => sum + Math.min((g.current_amount / g.target_amount) * 100, 100), 0) / savingsGoals.length
                : 50; // Default if no goals

            // 4. Diversification (15%) - Number of different currencies/categories
            const currencies = new Set(wallets.map(w => w.currency));
            const categories = new Set(txns.map(t => t.category).filter(Boolean));
            const diversificationScore = Math.min((currencies.size * 15) + (categories.size * 5), 100);

            // 5. Consistency (10%) - Regular deposit streak
            const depositDates = txns
                .filter(t => t.type === 'deposit' || t.amount > 0)
                .map(t => new Date(t.created_at).toDateString());
            const uniqueDepositDays = new Set(depositDates).size;
            const consistencyScore = Math.min(uniqueDepositDays * 10, 100);

            // Calculate overall score (weighted average)
            const overall = Math.round(
                (savingsScore * 0.30) +
                (budgetScore * 0.25) +
                (goalProgress * 0.20) +
                (diversificationScore * 0.15) +
                (consistencyScore * 0.10)
            );

            setBreakdown({
                savingsRate: Math.round(savingsScore),
                budgetAdherence: Math.round(budgetScore),
                goalProgress: Math.round(goalProgress),
                diversification: Math.round(diversificationScore),
                consistency: Math.round(consistencyScore),
            });

            setOverallScore(overall);

            // Update badges
            const updatedBadges = [...badges];
            if (txns.some(t => t.type === 'deposit')) {
                updatedBadges.find(b => b.id === 'first_deposit')!.earned = true;
            }
            if (savingsGoals.length > 0) {
                updatedBadges.find(b => b.id === 'goal_setter')!.earned = true;
            }
            if (currencies.size >= 3) {
                updatedBadges.find(b => b.id === 'diversified')!.earned = true;
            }
            if (savingsGoals.some(g => g.status === 'completed')) {
                updatedBadges.find(b => b.id === 'goal_crusher')!.earned = true;
            }
            if (deposits >= 1000) {
                updatedBadges.find(b => b.id === 'big_saver')!.earned = true;
            }
            if (uniqueDepositDays >= 4) {
                updatedBadges.find(b => b.id === 'consistent')!.earned = true;
            }
            setEarnedBadges(updatedBadges);

            // Generate tips based on weak areas
            const newTips: string[] = [];
            if (savingsScore < 50) {
                newTips.push('Try setting aside 20% of each deposit into savings');
            }
            if (budgetScore < 50) {
                newTips.push('Your spending varies each month. Create a budget to stay consistent');
            }
            if (goalProgress < 50 && savingsGoals.length === 0) {
                newTips.push('Create a savings goal to track your progress');
            }
            if (diversificationScore < 30) {
                newTips.push('Consider diversifying into multiple currencies');
            }
            if (consistencyScore < 50) {
                newTips.push('Make regular deposits to build a healthy financial habit');
            }
            if (newTips.length === 0) {
                newTips.push("Great job! Keep up the excellent financial habits! 🎉");
            }
            setTips(newTips);

        } catch (err) {
            console.error('Error calculating score:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
            </div>
        );
    }

    const scoreColor = getScoreColor(overallScore);
    const scoreLabel = getScoreLabel(overallScore);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-editorial">Finance Health Score</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Track and improve your financial wellness
                </p>
            </motion.div>

            {/* Main Score Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-light-surface/80 to-light-surface/40 dark:from-dark-surface/80 dark:to-dark-surface/40 border border-light-border dark:border-dark-border rounded-2xl p-8"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Score Gauge */}
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-light-border dark:text-dark-border"
                            />
                            {/* Progress circle */}
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke={scoreColor}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - animatedScore / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                className="text-5xl font-bold"
                                style={{ color: scoreColor }}
                            >
                                {animatedScore}
                            </motion.span>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">out of 100</span>
                        </div>
                    </div>

                    {/* Score Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                            <Star className="w-6 h-6" style={{ color: scoreColor }} />
                            <span className="text-2xl font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                            Your finance score is calculated based on your savings habits, spending patterns,
                            goal progress, diversification, and consistency.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Score Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
                {[
                    { label: 'Savings Rate', value: breakdown.savingsRate, icon: PiggyBank, weight: '30%' },
                    { label: 'Budget', value: breakdown.budgetAdherence, icon: Wallet, weight: '25%' },
                    { label: 'Goals', value: breakdown.goalProgress, icon: Target, weight: '20%' },
                    { label: 'Diversity', value: breakdown.diversification, icon: Shield, weight: '15%' },
                    { label: 'Consistency', value: breakdown.consistency, icon: Zap, weight: '10%' },
                ].map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <item.icon className="w-5 h-5 text-lime-accent" />
                            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{item.weight}</span>
                        </div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">{item.label}</p>
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-light-text dark:text-dark-text">{item.value}</span>
                            <div className="flex-1 h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: getScoreColor(item.value) }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6"
            >
                <div className="flex items-center space-x-2 mb-4">
                    <Info className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Improvement Tips</h3>
                </div>
                <ul className="space-y-2">
                    {tips.map((tip, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex items-start space-x-2"
                        >
                            <ChevronRight className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">{tip}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>

            {/* Badges Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-2xl p-6"
            >
                <div className="flex items-center space-x-2 mb-6">
                    <Award className="w-5 h-5 text-lime-accent" />
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Achievement Badges</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {earnedBadges.map((badge, index) => (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + index * 0.05 }}
                            className={`relative text-center p-4 rounded-xl transition-all ${badge.earned
                                ? 'bg-lime-accent/20 border-2 border-lime-accent/50'
                                : 'bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border opacity-50'
                                }`}
                        >
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <p className={`text-sm font-medium ${badge.earned ? 'text-light-text dark:text-dark-text' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                                {badge.name}
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                {badge.description}
                            </p>
                            {badge.earned && (
                                <div className="absolute -top-1 -right-1 bg-lime-accent rounded-full p-1">
                                    <Star className="w-3 h-3 text-dark-base" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
