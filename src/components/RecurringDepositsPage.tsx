import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock, Trash2, Play, Pause, DollarSign, RefreshCw, X } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWalletContext } from '../contexts/WalletContext';

interface RecurringDeposit {
    id: string;
    wallet_id: string;
    amount: number;
    currency: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    day_of_week?: number;
    day_of_month?: number;
    next_execution_date: string;
    is_active: boolean;
}

const frequencyLabels: Record<string, string> = {
    daily: 'Every Day',
    weekly: 'Every Week',
    monthly: 'Every Month'
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const RecurringDepositsPage: React.FC = () => {
    const { user } = useAuth();
    const { wallets } = useWalletContext();
    const [deposits, setDeposits] = useState<RecurringDeposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newDeposit, setNewDeposit] = useState({
        walletId: '',
        amount: '',
        frequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
        dayOfWeek: 1,
        dayOfMonth: 1,
    });

    useEffect(() => {
        if (user) fetchDeposits();
    }, [user]);

    const fetchDeposits = async () => {
        try {
            const { data, error } = await supabase
                .from('recurring_deposits')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDeposits(data || []);
        } catch (err) {
            console.error('Error fetching recurring deposits:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateNextExecution = (frequency: string, dayOfWeek: number, dayOfMonth: number): Date => {
        const now = new Date();
        const next = new Date(now);

        switch (frequency) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                const daysUntil = (dayOfWeek - now.getDay() + 7) % 7 || 7;
                next.setDate(next.getDate() + daysUntil);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
                break;
        }

        return next;
    };

    const handleCreate = async () => {
        if (!newDeposit.walletId || !newDeposit.amount) return;

        const wallet = wallets.find(w => w.id === newDeposit.walletId);
        if (!wallet) return;

        const nextExecution = calculateNextExecution(
            newDeposit.frequency,
            newDeposit.dayOfWeek,
            newDeposit.dayOfMonth
        );

        try {
            const { error } = await supabase.from('recurring_deposits').insert({
                user_id: user?.id,
                wallet_id: newDeposit.walletId,
                amount: parseFloat(newDeposit.amount),
                currency: wallet.currency,
                frequency: newDeposit.frequency,
                day_of_week: newDeposit.frequency === 'weekly' ? newDeposit.dayOfWeek : null,
                day_of_month: newDeposit.frequency === 'monthly' ? newDeposit.dayOfMonth : null,
                next_execution_date: nextExecution.toISOString(),
                is_active: true,
            });

            if (error) throw error;

            // Unlock recurring setup achievement
            const { achievementService } = await import('../services/achievementService');
            await achievementService.unlockAchievement('recurring_setup');

            setShowCreateModal(false);
            setNewDeposit({ walletId: '', amount: '', frequency: 'monthly', dayOfWeek: 1, dayOfMonth: 1 });
            fetchDeposits();
        } catch (err) {
            console.error('Error creating recurring deposit:', err);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('recurring_deposits')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchDeposits();
        } catch (err) {
            console.error('Error toggling deposit:', err);
        }
    };

    const deleteDeposit = async (id: string) => {
        if (!confirm('Delete this recurring deposit?')) return;

        try {
            const { error } = await supabase
                .from('recurring_deposits')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchDeposits();
        } catch (err) {
            console.error('Error deleting deposit:', err);
        }
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
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-editorial">Recurring Deposits</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Set up automatic scheduled deposits
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-lime-accent text-gray-900 rounded-xl font-medium hover:shadow-glow transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Schedule</span>
                </motion.button>
            </motion.div>

            {/* Deposits List */}
            {deposits.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-12 text-center"
                >
                    <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Recurring Deposits</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Set up automatic deposits to build savings effortlessly
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-lime-accent text-gray-900 rounded-xl font-medium hover:shadow-glow transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create First Schedule</span>
                    </button>
                </motion.div>
            ) : (
                <div className="grid gap-4">
                    {deposits.map((deposit, index) => (
                        <motion.div
                            key={deposit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 ${!deposit.is_active ? 'opacity-60' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${deposit.is_active ? 'bg-lime-accent/20' : 'bg-gray-500/20'}`}>
                                        <DollarSign className={`w-6 h-6 ${deposit.is_active ? 'text-lime-accent' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {deposit.currency} {deposit.amount.toLocaleString()}
                                        </p>
                                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>{frequencyLabels[deposit.frequency]}</span>
                                            {deposit.frequency === 'weekly' && deposit.day_of_week !== undefined && (
                                                <span>on {dayNames[deposit.day_of_week]}</span>
                                            )}
                                            {deposit.frequency === 'monthly' && deposit.day_of_month && (
                                                <span>on day {deposit.day_of_month}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="text-right mr-4">
                                        <p className="text-xs text-gray-500">Next execution</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {new Date(deposit.next_execution_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleActive(deposit.id, deposit.is_active)}
                                        className={`p-2 rounded-lg transition-colors ${deposit.is_active ? 'bg-lime-accent/20 text-lime-accent hover:bg-lime-accent/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'}`}
                                    >
                                        {deposit.is_active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => deleteDeposit(deposit.id)}
                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
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
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Recurring Deposit</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Wallet Select */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wallet</label>
                                    <select
                                        value={newDeposit.walletId}
                                        onChange={(e) => setNewDeposit({ ...newDeposit, walletId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                                    >
                                        <option value="">Select wallet</option>
                                        {wallets.map(wallet => (
                                            <option key={wallet.id} value={wallet.id}>
                                                {wallet.currency} - Balance: {wallet.balance.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                                    <input
                                        type="number"
                                        value={newDeposit.amount}
                                        onChange={(e) => setNewDeposit({ ...newDeposit, amount: e.target.value })}
                                        placeholder="100"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                                    />
                                </div>

                                {/* Frequency */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                                            <button
                                                key={freq}
                                                type="button"
                                                onClick={() => setNewDeposit({ ...newDeposit, frequency: freq })}
                                                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${newDeposit.frequency === freq ? 'bg-lime-accent text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                            >
                                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Day Selection */}
                                {newDeposit.frequency === 'weekly' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Day of Week</label>
                                        <select
                                            value={newDeposit.dayOfWeek}
                                            onChange={(e) => setNewDeposit({ ...newDeposit, dayOfWeek: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                                        >
                                            {dayNames.map((day, index) => (
                                                <option key={day} value={index}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {newDeposit.frequency === 'monthly' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Day of Month</label>
                                        <select
                                            value={newDeposit.dayOfMonth}
                                            onChange={(e) => setNewDeposit({ ...newDeposit, dayOfMonth: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                                        >
                                            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    onClick={handleCreate}
                                    className="w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all flex items-center justify-center space-x-2"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Create Schedule</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
