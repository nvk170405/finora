import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Calendar, Clock, Trash2, Play, Pause, Bell,
    RefreshCw, X, CreditCard, Home, Zap, Wifi, Car,
    Smartphone, Music, Film, ShoppingBag, AlertTriangle, CheckCircle
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWalletContext } from '../contexts/WalletContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { CountingNumber } from './ui/AnimatedNumber';
import { PremiumGate } from './PremiumGate';

interface RecurringExpense {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    currency: string;
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    due_day?: number;
    next_due_date: string;
    is_active: boolean;
    auto_log: boolean;
    reminder_days: number;
    notes?: string;
    created_at: string;
}

const expenseCategories = [
    { value: 'rent', label: 'Rent/Mortgage', icon: Home, color: 'text-orange-500' },
    { value: 'utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-500' },
    { value: 'internet', label: 'Internet/Phone', icon: Wifi, color: 'text-blue-500' },
    { value: 'insurance', label: 'Insurance', icon: ShoppingBag, color: 'text-purple-500' },
    { value: 'subscriptions', label: 'Subscriptions', icon: Music, color: 'text-pink-500' },
    { value: 'streaming', label: 'Streaming', icon: Film, color: 'text-red-500' },
    { value: 'transport', label: 'Transport/EMI', icon: Car, color: 'text-cyan-500' },
    { value: 'phone', label: 'Phone Bill', icon: Smartphone, color: 'text-green-500' },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard, color: 'text-red-400' },
    { value: 'other', label: 'Other', icon: Bell, color: 'text-gray-500' },
];

const frequencyLabels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
};

export const RecurringDepositsPage: React.FC = () => {
    const { user } = useAuth();
    const { wallets, refreshAll } = useWalletContext();
    const { currencySymbol, defaultCurrency } = usePreferences();

    const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [successToast, setSuccessToast] = useState<{ show: boolean; name: string; amount: number } | null>(null);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [newExpense, setNewExpense] = useState({
        name: '',
        amount: '',
        category: 'rent',
        frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
        dueDay: 1,
        autoLog: true,
        reminderDays: 3,
        notes: ''
    });

    useEffect(() => {
        if (user) fetchExpenses();
    }, [user]);

    const fetchExpenses = async () => {
        try {
            // Try the new table first, fall back to old table
            let { data, error } = await supabase
                .from('recurring_expenses')
                .select('*')
                .eq('user_id', user?.id)
                .order('next_due_date', { ascending: true });

            if (error) {
                // Fall back to old recurring_deposits table
                const oldData = await supabase
                    .from('recurring_deposits')
                    .select('*')
                    .eq('user_id', user?.id);

                // Map old data to new format
                data = oldData.data?.map(d => ({
                    ...d,
                    name: d.description || 'Recurring Expense',
                    next_due_date: d.next_execution_date,
                    category: 'other',
                    auto_log: false,
                    reminder_days: 3
                })) || [];
            }

            setExpenses(data || []);
        } catch (err) {
            console.error('Error fetching recurring expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totals = useMemo(() => {
        const monthly = expenses
            .filter(e => e.is_active)
            .reduce((sum, e) => {
                switch (e.frequency) {
                    case 'daily': return sum + e.amount * 30;
                    case 'weekly': return sum + e.amount * 4;
                    case 'monthly': return sum + e.amount;
                    case 'yearly': return sum + e.amount / 12;
                    default: return sum + e.amount;
                }
            }, 0);

        const upcoming = expenses.filter(e => {
            const dueDate = new Date(e.next_due_date);
            const today = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return e.is_active && diffDays >= 0 && diffDays <= 7;
        });

        return { monthly: Math.round(monthly), upcoming };
    }, [expenses]);

    const handleCreate = async () => {
        if (!newExpense.name || !newExpense.amount) return;

        const nextDue = new Date();
        if (newExpense.frequency === 'monthly') {
            nextDue.setDate(newExpense.dueDay);
            if (nextDue <= new Date()) nextDue.setMonth(nextDue.getMonth() + 1);
        } else if (newExpense.frequency === 'yearly') {
            nextDue.setMonth(nextDue.getMonth() + 12);
        } else if (newExpense.frequency === 'weekly') {
            nextDue.setDate(nextDue.getDate() + 7);
        } else {
            nextDue.setDate(nextDue.getDate() + 1);
        }

        try {
            // Try new table first
            const { error } = await supabase.from('recurring_expenses').insert({
                user_id: user?.id,
                name: newExpense.name,
                amount: parseFloat(newExpense.amount),
                currency: defaultCurrency,
                category: newExpense.category,
                frequency: newExpense.frequency,
                due_day: newExpense.dueDay,
                next_due_date: nextDue.toISOString(),
                is_active: true,
                auto_log: newExpense.autoLog,
                reminder_days: newExpense.reminderDays,
                notes: newExpense.notes
            });

            if (error) {
                // Fall back to old table
                await supabase.from('recurring_deposits').insert({
                    user_id: user?.id,
                    wallet_id: wallets[0]?.id,
                    amount: parseFloat(newExpense.amount),
                    currency: defaultCurrency,
                    frequency: newExpense.frequency,
                    day_of_month: newExpense.dueDay,
                    next_execution_date: nextDue.toISOString(),
                    is_active: true,
                    description: newExpense.name
                });
            }

            setShowCreateModal(false);
            setNewExpense({
                name: '', amount: '', category: 'rent', frequency: 'monthly',
                dueDay: 1, autoLog: true, reminderDays: 3, notes: ''
            });
            fetchExpenses();
        } catch (err) {
            console.error('Error creating recurring expense:', err);
        }
    };

    const logExpenseNow = async (expense: RecurringExpense) => {
        if (!user || wallets.length === 0 || payingId) return;

        setPayingId(expense.id);
        try {
            await supabase.from('transactions').insert({
                user_id: user.id,
                wallet_id: wallets[0].id,
                amount: -Math.abs(expense.amount),
                type: 'withdrawal',
                description: `${expense.name} (Recurring)`,
                category: 'utilities',
                currency: expense.currency || defaultCurrency
            });

            // Update next due date
            const nextDue = new Date(expense.next_due_date);
            if (expense.frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
            else if (expense.frequency === 'yearly') nextDue.setFullYear(nextDue.getFullYear() + 1);
            else if (expense.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
            else nextDue.setDate(nextDue.getDate() + 1);

            await supabase.from('recurring_expenses')
                .update({ next_due_date: nextDue.toISOString() })
                .eq('id', expense.id);

            await refreshAll();
            fetchExpenses();

            // Show success toast
            setSuccessToast({ show: true, name: expense.name, amount: expense.amount });
            setTimeout(() => setSuccessToast(null), 3000);
        } catch (err) {
            console.error('Error logging expense:', err);
        } finally {
            setPayingId(null);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await supabase.from('recurring_expenses')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            fetchExpenses();
        } catch (err) {
            console.error('Error toggling expense:', err);
        }
    };

    const deleteExpense = async (id: string) => {
        if (!confirm('Delete this recurring expense?')) return;
        try {
            await supabase.from('recurring_expenses').delete().eq('id', id);
            fetchExpenses();
        } catch (err) {
            console.error('Error deleting expense:', err);
        }
    };

    const getDaysUntilDue = (dateStr: string) => {
        const due = new Date(dateStr);
        const today = new Date();
        return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
            </div>
        );
    }

    return (
        <PremiumGate
            feature="recurring-expenses"
            requiredPlan="basic"
            title="Recurring Expenses"
            description="Track your bills, subscriptions and regular payments. Upgrade to basic plan to unlock."
        >
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
                            🔄 Recurring Expenses
                        </h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Track bills, subscriptions & regular payments
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-lime-accent text-gray-900 rounded-xl font-medium hover:shadow-glow transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Expense</span>
                    </motion.button>
                </motion.div>

                {/* Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-5">
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide mb-1">Monthly Total</p>
                        <p className="text-3xl font-bold text-red-500">
                            <CountingNumber value={totals.monthly} prefix={currencySymbol} />
                        </p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{expenses.filter(e => e.is_active).length} active expenses</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-5">
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide mb-1">Due This Week</p>
                        <p className="text-3xl font-bold text-yellow-500">{totals.upcoming.length}</p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            {totals.upcoming.length > 0 ? `${currencySymbol}${totals.upcoming.reduce((s, e) => s + e.amount, 0).toLocaleString()} due` : 'Nothing due'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-5">
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide mb-1">Yearly Estimate</p>
                        <p className="text-3xl font-bold text-blue-500">
                            <CountingNumber value={totals.monthly * 12} prefix={currencySymbol} />
                        </p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">Based on current expenses</p>
                    </div>
                </motion.div>

                {/* Expenses List */}
                {expenses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-12 text-center"
                    >
                        <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No Recurring Expenses</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                            Add your bills and subscriptions to track them
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-lime-accent text-gray-900 rounded-xl font-medium hover:shadow-glow transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add First Expense</span>
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {expenses.map((expense, index) => {
                            const cat = expenseCategories.find(c => c.value === expense.category);
                            const Icon = cat?.icon || Bell;
                            const daysUntil = getDaysUntilDue(expense.next_due_date);
                            const isOverdue = daysUntil < 0;
                            const isDueSoon = daysUntil >= 0 && daysUntil <= 3;

                            return (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-light-surface dark:bg-dark-surface border rounded-xl p-5 ${isOverdue ? 'border-red-500/50' :
                                        isDueSoon ? 'border-yellow-500/50' :
                                            'border-light-border dark:border-dark-border'
                                        } ${!expense.is_active ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOverdue ? 'bg-red-500/20' :
                                                isDueSoon ? 'bg-yellow-500/20' :
                                                    'bg-lime-accent/20'
                                                }`}>
                                                <Icon className={`w-6 h-6 ${cat?.color || 'text-lime-accent'}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-light-text dark:text-dark-text">{expense.name}</p>
                                                <div className="flex items-center space-x-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                    <span>{frequencyLabels[expense.frequency]}</span>
                                                    <span>•</span>
                                                    <span>{cat?.label}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-red-500">
                                                    -{currencySymbol}{expense.amount.toLocaleString()}
                                                </p>
                                                <div className={`flex items-center space-x-1 text-xs ${isOverdue ? 'text-red-500' :
                                                    isDueSoon ? 'text-yellow-500' :
                                                        'text-light-text-secondary dark:text-dark-text-secondary'
                                                    }`}>
                                                    {isOverdue ? (
                                                        <>
                                                            <AlertTriangle className="w-3 h-3" />
                                                            <span>Overdue by {Math.abs(daysUntil)} days</span>
                                                        </>
                                                    ) : isDueSoon ? (
                                                        <>
                                                            <Clock className="w-3 h-3" />
                                                            <span>Due in {daysUntil} days</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{new Date(expense.next_due_date).toLocaleDateString()}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => logExpenseNow(expense)}
                                                disabled={payingId === expense.id}
                                                className={`p-2 rounded-lg transition-colors ${payingId === expense.id ? 'bg-gray-500/20 text-gray-400 cursor-wait' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                                                title="Mark as paid"
                                            >
                                                {payingId === expense.id ? (
                                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-5 h-5" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => toggleActive(expense.id, expense.is_active)}
                                                className={`p-2 rounded-lg transition-colors ${expense.is_active
                                                    ? 'bg-lime-accent/20 text-lime-accent hover:bg-lime-accent/30'
                                                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                                    }`}
                                            >
                                                {expense.is_active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                            </button>

                                            <button
                                                onClick={() => deleteExpense(expense.id)}
                                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
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
                                className="bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text">➕ Add Recurring Expense</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Expense Name</label>
                                        <input
                                            type="text"
                                            value={newExpense.name}
                                            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                                            placeholder="e.g., Netflix, Rent, Electricity"
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                        />
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                                            <input
                                                type="number"
                                                value={newExpense.amount}
                                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                placeholder="0"
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Category</label>
                                        <select
                                            value={newExpense.category}
                                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                        >
                                            {expenseCategories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Frequency */}
                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Frequency</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(freq => (
                                                <button
                                                    key={freq}
                                                    type="button"
                                                    onClick={() => setNewExpense({ ...newExpense, frequency: freq })}
                                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${newExpense.frequency === freq
                                                        ? 'bg-lime-accent text-gray-900'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Due Day */}
                                    {newExpense.frequency === 'monthly' && (
                                        <div>
                                            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Due Day of Month</label>
                                            <select
                                                value={newExpense.dueDay}
                                                onChange={(e) => setNewExpense({ ...newExpense, dueDay: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                            >
                                                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Auto-log toggle */}
                                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl">
                                        <div>
                                            <p className="font-medium text-light-text dark:text-dark-text">Auto-log when paid</p>
                                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Automatically add to transactions</p>
                                        </div>
                                        <button
                                            onClick={() => setNewExpense({ ...newExpense, autoLog: !newExpense.autoLog })}
                                            className={`w-12 h-6 rounded-full transition-colors ${newExpense.autoLog ? 'bg-lime-accent' : 'bg-gray-400'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${newExpense.autoLog ? 'translate-x-6' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={handleCreate}
                                        disabled={!newExpense.name || !newExpense.amount}
                                        className="w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Add Recurring Expense</span>
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Toast */}
                <AnimatePresence>
                    {successToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                        >
                            <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                                >
                                    <CheckCircle className="w-7 h-7" />
                                </motion.div>
                                <div>
                                    <p className="font-bold text-lg">✅ Bill Paid!</p>
                                    <p className="text-green-100">
                                        {successToast.name} • {currencySymbol}{successToast.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-200 mt-1">Logged to transactions</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PremiumGate>
    );
};
