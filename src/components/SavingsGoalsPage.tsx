import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Plus, Coins, Calendar, TrendingUp, Check,
    Sparkles, ChevronRight, X, Wallet, ArrowRight
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWalletContext } from '../contexts/WalletContext';

interface SavingsGoal {
    id: string;
    name: string;
    description: string | null;
    target_amount: number;
    current_amount: number;
    currency: string;
    deadline: string | null;
    icon: string;
    color: string;
    status: string;
    created_at: string;
}

const goalIcons = ['🎯', '🏠', '🚗', '✈️', '💎', '📱', '🎓', '💰', '🏖️', '🎁', '💍', '🏋️'];
const goalColors = ['#CAFF40', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];

const currencySymbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$'
};

export const SavingsGoalsPage: React.FC = () => {
    const { user } = useAuth();
    const { wallets, refreshAll } = useWalletContext();
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [newGoal, setNewGoal] = useState({
        name: '',
        description: '',
        target_amount: '',
        currency: 'USD',
        deadline: '',
        icon: '🎯',
        color: '#CAFF40',
    });

    const [contribution, setContribution] = useState({
        amount: '',
        walletId: '',
        note: '',
    });

    useEffect(() => {
        if (user) {
            fetchGoals();
        }
    }, [user]);

    const fetchGoals = async () => {
        try {
            const { data, error } = await supabase
                .from('savings_goals')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGoals(data || []);
        } catch (err) {
            console.error('Error fetching goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async () => {
        if (!newGoal.name || !newGoal.target_amount) {
            setError('Please fill in goal name and target amount');
            return;
        }

        try {
            const { error } = await supabase
                .from('savings_goals')
                .insert({
                    user_id: user?.id,
                    name: newGoal.name,
                    description: newGoal.description || null,
                    target_amount: parseFloat(newGoal.target_amount),
                    currency: newGoal.currency,
                    deadline: newGoal.deadline || null,
                    icon: newGoal.icon,
                    color: newGoal.color,
                });

            if (error) throw error;

            setSuccess('Goal created successfully! 🎉');
            setShowCreateModal(false);
            setNewGoal({ name: '', description: '', target_amount: '', currency: 'USD', deadline: '', icon: '🎯', color: '#CAFF40' });
            fetchGoals();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to create goal');
        }
    };

    const handleContribute = async () => {
        if (!selectedGoal || !contribution.amount || !contribution.walletId) {
            setError('Please select a wallet and enter an amount');
            return;
        }

        const amount = parseFloat(contribution.amount);
        const wallet = wallets.find(w => w.id === contribution.walletId);

        if (!wallet || wallet.balance < amount) {
            setError('Insufficient wallet balance');
            return;
        }

        try {
            // Deduct from wallet
            const { error: walletError } = await supabase
                .from('wallets')
                .update({ balance: wallet.balance - amount })
                .eq('id', wallet.id);

            if (walletError) throw walletError;

            // Add to goal
            const newAmount = selectedGoal.current_amount + amount;
            const isCompleted = newAmount >= selectedGoal.target_amount;

            const { error: goalError } = await supabase
                .from('savings_goals')
                .update({
                    current_amount: newAmount,
                    status: isCompleted ? 'completed' : 'active',
                    completed_at: isCompleted ? new Date().toISOString() : null,
                })
                .eq('id', selectedGoal.id);

            if (goalError) throw goalError;

            // Record contribution
            await supabase.from('savings_contributions').insert({
                goal_id: selectedGoal.id,
                user_id: user?.id,
                wallet_id: wallet.id,
                amount: amount,
                currency: wallet.currency,
                note: contribution.note || null,
            });

            // Record transaction
            await supabase.from('transactions').insert({
                wallet_id: wallet.id,
                user_id: user?.id,
                type: 'expense',
                amount: -amount,
                currency: wallet.currency,
                description: `Savings: ${selectedGoal.name}`,
                status: 'completed',
                category: 'savings',
            });

            setSuccess(isCompleted ? '🎉 Goal completed! Congratulations!' : 'Contribution added! 💰');
            setShowContributeModal(false);
            setContribution({ amount: '', walletId: '', note: '' });
            setSelectedGoal(null);
            fetchGoals();
            refreshAll();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to contribute');
        }
    };

    const getProgress = (goal: SavingsGoal) => {
        return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    };

    const getDaysLeft = (deadline: string | null) => {
        if (!deadline) return null;
        const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

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
                className="flex items-center justify-between"
            >
                <div>
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Savings Goals</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Track your progress towards financial milestones
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 bg-lime-accent text-dark-base px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Goal</span>
                </button>
            </motion.div>

            {/* Success/Error Messages */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl"
                    >
                        {success}
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex justify-between items-center"
                    >
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-2xl p-12 text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-lime-accent/20 rounded-full flex items-center justify-center">
                        <Target className="w-10 h-10 text-lime-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No savings goals yet</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                        Start your journey by creating your first savings goal
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-lime-accent text-dark-base px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
                    >
                        Create Your First Goal
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-2xl p-6 overflow-hidden ${goal.status === 'completed' ? 'ring-2 ring-lime-accent' : ''}`}
                        >
                            {/* Progress bar background */}
                            <div
                                className="absolute bottom-0 left-0 h-1 transition-all duration-500"
                                style={{
                                    width: `${getProgress(goal)}%`,
                                    backgroundColor: goal.color
                                }}
                            />

                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${goal.color}20` }}
                                    >
                                        {goal.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-light-text dark:text-dark-text">{goal.name}</h3>
                                        {goal.deadline && (
                                            <div className="flex items-center space-x-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                <Calendar className="w-3 h-3" />
                                                <span>{getDaysLeft(goal.deadline)} days left</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {goal.status === 'completed' && (
                                    <div className="bg-lime-accent rounded-full p-1">
                                        <Check className="w-4 h-4 text-dark-base" />
                                    </div>
                                )}
                            </div>

                            {/* Amount */}
                            <div className="mb-4">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-2xl font-bold text-light-text dark:text-dark-text">
                                        {currencySymbols[goal.currency] || '$'}{goal.current_amount.toLocaleString()}
                                    </span>
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                                        / {currencySymbols[goal.currency] || '$'}{goal.target_amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <div className="flex-1 h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: goal.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getProgress(goal)}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: goal.color }}>
                                        {getProgress(goal).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {goal.status !== 'completed' && (
                                <button
                                    onClick={() => {
                                        setSelectedGoal(goal);
                                        setShowContributeModal(true);
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border py-2 rounded-xl hover:bg-lime-accent/10 transition-all"
                                >
                                    <Coins className="w-4 h-4 text-lime-accent" />
                                    <span className="text-light-text dark:text-dark-text text-sm font-medium">Add Money</span>
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Goal Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Create Savings Goal</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Goal Name</label>
                                    <input
                                        type="text"
                                        value={newGoal.name}
                                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                        placeholder="e.g., Dream Vacation"
                                        className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Target Amount</label>
                                        <input
                                            type="number"
                                            value={newGoal.target_amount}
                                            onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                                            placeholder="5000"
                                            className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Currency</label>
                                        <select
                                            value={newGoal.currency}
                                            onChange={(e) => setNewGoal({ ...newGoal, currency: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-light-border dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                                        >
                                            <option value="USD" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">USD ($)</option>
                                            <option value="EUR" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">EUR (€)</option>
                                            <option value="GBP" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">GBP (£)</option>
                                            <option value="INR" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">INR (₹)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Target Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={newGoal.deadline}
                                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                        className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Icon</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {goalIcons.map((icon) => (
                                            <button
                                                key={icon}
                                                onClick={() => setNewGoal({ ...newGoal, icon })}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-all ${newGoal.icon === icon ? 'bg-lime-accent/30 ring-2 ring-lime-accent' : 'bg-light-glass dark:bg-dark-glass hover:bg-lime-accent/10'}`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Color</label>
                                    <div className="flex space-x-2">
                                        {goalColors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setNewGoal({ ...newGoal, color })}
                                                className={`w-8 h-8 rounded-full transition-all ${newGoal.color === color ? 'ring-2 ring-offset-2 ring-offset-dark-base ring-white' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateGoal}
                                    className="w-full bg-lime-accent text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all flex items-center justify-center space-x-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span>Create Goal</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contribute Modal */}
            <AnimatePresence>
                {showContributeModal && selectedGoal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => { setShowContributeModal(false); setSelectedGoal(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Add to {selectedGoal.name}</h3>
                                <button onClick={() => { setShowContributeModal(false); setSelectedGoal(null); }} className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Goal Progress */}
                            <div className="bg-light-glass dark:bg-dark-glass rounded-xl p-4 mb-6">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="text-2xl">{selectedGoal.icon}</div>
                                    <div>
                                        <p className="font-medium text-light-text dark:text-dark-text">{selectedGoal.name}</p>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                            {currencySymbols[selectedGoal.currency]}{selectedGoal.current_amount.toLocaleString()} of {currencySymbols[selectedGoal.currency]}{selectedGoal.target_amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${getProgress(selectedGoal)}%`, backgroundColor: selectedGoal.color }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">From Wallet</label>
                                    <select
                                        value={contribution.walletId}
                                        onChange={(e) => setContribution({ ...contribution, walletId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-light-border dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                                    >
                                        <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Select wallet</option>
                                        {wallets.map((wallet) => (
                                            <option key={wallet.id} value={wallet.id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                {wallet.currency} - {currencySymbols[wallet.currency]}{wallet.balance.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Amount</label>
                                    <input
                                        type="number"
                                        value={contribution.amount}
                                        onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
                                        placeholder="100"
                                        className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                    />
                                </div>

                                <button
                                    onClick={handleContribute}
                                    className="w-full bg-lime-accent text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all flex items-center justify-center space-x-2"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                    <span>Add to Goal</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
