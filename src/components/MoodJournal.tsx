import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smile, Frown, Meh, Heart, AlertCircle, Sparkles,
    TrendingUp, TrendingDown, PieChart, Calendar
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';

interface TransactionMood {
    id: string;
    transaction_id: string;
    mood: 'happy' | 'necessary' | 'regret' | 'neutral' | 'excited' | 'guilty';
    note: string;
    created_at: string;
    transaction?: {
        amount: number;
        description: string;
        type: string;
        created_at: string;
    };
}

const moodConfig = {
    happy: { icon: Smile, color: 'text-green-500', bg: 'bg-green-500/20', label: 'Happy', emoji: '😊' },
    necessary: { icon: Meh, color: 'text-blue-500', bg: 'bg-blue-500/20', label: 'Necessary', emoji: '🤷' },
    regret: { icon: Frown, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Regret', emoji: '😔' },
    neutral: { icon: Meh, color: 'text-gray-500', bg: 'bg-gray-500/20', label: 'Neutral', emoji: '😐' },
    excited: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/20', label: 'Excited', emoji: '🎉' },
    guilty: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/20', label: 'Guilty', emoji: '😬' },
};

export const MoodJournal: React.FC = () => {
    const { user } = useAuth();
    const { currencySymbol } = usePreferences();
    const [moods, setMoods] = useState<TransactionMood[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Record<string, number>>({});

    useEffect(() => {
        if (user) fetchMoods();
    }, [user]);

    const fetchMoods = async () => {
        try {
            const { data, error } = await supabase
                .from('transaction_moods')
                .select(`
                    *,
                    transaction:transactions(amount, description, type, created_at)
                `)
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setMoods(data || []);

            // Calculate stats
            const moodCounts: Record<string, number> = {};
            (data || []).forEach(m => {
                moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
            });
            setStats(moodCounts);
        } catch (err) {
            console.error('Error fetching moods:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalMoods = Object.values(stats).reduce((a, b) => a + b, 0);
    const regretSpending = moods
        .filter(m => m.mood === 'regret' && m.transaction?.type === 'withdrawal')
        .reduce((sum, m) => sum + (m.transaction?.amount || 0), 0);
    const happySpending = moods
        .filter(m => m.mood === 'happy' && m.transaction?.type === 'withdrawal')
        .reduce((sum, m) => sum + (m.transaction?.amount || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
                    Money Mood Journal
                </h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Track how you feel about your spending decisions
                </p>
            </motion.div>

            {/* Mood Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lime-accent/20 rounded-lg">
                            <PieChart className="w-6 h-6 text-lime-accent" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Tagged</p>
                            <p className="text-2xl font-bold text-light-text dark:text-dark-text">{totalMoods}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Smile className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Happy Spending</p>
                            <p className="text-2xl font-bold text-green-500">{currencySymbol}{happySpending.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Frown className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Regret Spending</p>
                            <p className="text-2xl font-bold text-red-500">{currencySymbol}{regretSpending.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Sparkles className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Mood Score</p>
                            <p className="text-2xl font-bold text-purple-500">
                                {totalMoods > 0
                                    ? Math.round(((stats.happy || 0) + (stats.excited || 0)) / totalMoods * 100)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Mood Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
            >
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
                    Mood Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(moodConfig).map(([mood, config]) => {
                        const count = stats[mood] || 0;
                        const percentage = totalMoods > 0 ? (count / totalMoods) * 100 : 0;
                        return (
                            <div key={mood} className={`p-4 rounded-xl ${config.bg} text-center`}>
                                <span className="text-3xl block mb-2">{config.emoji}</span>
                                <p className={`font-bold ${config.color}`}>{count}</p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                    {config.label} ({percentage.toFixed(0)}%)
                                </p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Moods */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
            >
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
                    Recent Tagged Transactions
                </h3>

                {moods.length === 0 ? (
                    <div className="text-center py-8">
                        <Meh className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">No moods yet</h4>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            Tag your transactions with moods to see insights here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {moods.slice(0, 10).map((mood, idx) => {
                            const config = moodConfig[mood.mood];
                            return (
                                <motion.div
                                    key={mood.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-light-glass dark:bg-dark-glass rounded-xl"
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-2xl">{config.emoji}</span>
                                        <div>
                                            <p className="font-medium text-light-text dark:text-dark-text">
                                                {mood.transaction?.description || 'Transaction'}
                                            </p>
                                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                {new Date(mood.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${mood.transaction?.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                            {mood.transaction?.type === 'deposit' ? '+' : '-'}
                                            {currencySymbol}{mood.transaction?.amount?.toLocaleString()}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Insights Tip */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
            >
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-light-text dark:text-dark-text mb-1">
                            💡 Insight Tip
                        </h4>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            Track your emotions when making purchases to identify patterns.
                            If you notice many "regret" tags, consider using the Impulse Timer before buying!
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
