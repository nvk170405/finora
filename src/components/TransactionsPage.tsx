import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Filter, Search, Calendar, ArrowUpDown, Plus, X, Smile, Trash2 } from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { exportService } from '../services/exportService';
import { emailNotificationService } from '../services/emailNotificationService';
import { supabase } from '../config/supabase';

const moodOptions = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'necessary', emoji: '🤷', label: 'Necessary' },
    { id: 'regret', emoji: '😔', label: 'Regret' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'excited', emoji: '🎉', label: 'Excited' },
    { id: 'guilty', emoji: '😬', label: 'Guilty' },
];

// Database-compatible categories
const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'travel', label: 'Travel' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Bills & Utilities' },
    { value: 'business', label: 'Business' },
    { value: 'income', label: 'Income/Salary' },
    { value: 'other', label: 'Other' },
];

export const TransactionsPage: React.FC = () => {
    const { transactions, wallets, refreshAll } = useWalletContext();
    const { user } = useAuth();
    const { currencySymbol, defaultCurrency } = usePreferences();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'deposit' | 'expense' | 'transfer'>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        type: 'withdrawal' as 'deposit' | 'withdrawal',
        amount: '',
        description: '',
        category: 'other',
        walletId: '',
        mood: '' as string,
    });

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(tx =>
                tx.description?.toLowerCase().includes(term) ||
                tx.category?.toLowerCase().includes(term) ||
                tx.currency?.toLowerCase().includes(term)
            );
        }

        // Filter by type
        if (filterType !== 'all') {
            result = result.filter(tx => tx.type === filterType);
        }

        // Filter by date range
        if (dateRange.start) {
            result = result.filter(tx => new Date(tx.created_at) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            result = result.filter(tx => new Date(tx.created_at) <= new Date(dateRange.end));
        }

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [transactions, searchTerm, filterType, sortOrder, dateRange]);

    const handleExportCSV = () => {
        exportService.exportToCSV(filteredTransactions, 'finorax_transactions');
    };

    const handleExportPDF = () => {
        exportService.exportToPDF(filteredTransactions, user?.email || 'User', 'finorax_transactions');
    };

    const handleAddTransaction = async () => {
        if (!newTransaction.amount || !newTransaction.walletId) return;

        setSaving(true);
        try {
            const wallet = wallets.find(w => w.id === newTransaction.walletId);
            const amount = parseFloat(newTransaction.amount);
            const finalAmount = newTransaction.type === 'withdrawal' ? -Math.abs(amount) : Math.abs(amount);

            const { data: txData, error } = await supabase.from('transactions').insert({
                user_id: user?.id,
                wallet_id: newTransaction.walletId,
                amount: finalAmount,
                type: newTransaction.type,
                description: newTransaction.description || `Manual ${newTransaction.type}`,
                category: newTransaction.category,
                currency: wallet?.currency || defaultCurrency,
            }).select('id').single();

            if (error) throw error;

            // Save mood if selected
            if (newTransaction.mood && txData?.id) {
                await supabase.from('transaction_moods').insert({
                    transaction_id: txData.id,
                    user_id: user?.id,
                    mood: newTransaction.mood,
                });
            }

            // Send email notification (async, don't block)
            const txType = newTransaction.type === 'deposit' ? 'income' : 'expense';
            emailNotificationService.notifyTransaction(
                txType,
                Math.abs(parseFloat(newTransaction.amount)),
                wallet?.currency || defaultCurrency,
                newTransaction.category || 'other'
            ).catch(err => console.log('Email notification skipped:', err));

            setShowAddModal(false);
            setNewTransaction({ type: 'withdrawal', amount: '', description: '', category: 'other', walletId: '', mood: '' });
            await refreshAll();
        } catch (err) {
            console.error('Error adding transaction:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-editorial">Transactions</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and export your transaction history
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-lime-accent text-gray-900 rounded-xl font-medium hover:shadow-glow transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Transaction</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportCSV}
                        className="flex items-center space-x-2 px-4 py-2 bg-lime-accent/20 text-lime-accent border border-lime-accent/30 rounded-xl hover:bg-lime-accent/30 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        <span>CSV</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all"
                    >
                        <FileText className="w-4 h-4" />
                        <span>PDF</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50 appearance-none"
                        >
                            <option value="all">All Types</option>
                            <option value="deposit">Deposits</option>
                            <option value="expense">Expenses</option>
                            <option value="transfer">Transfers</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Transaction Count & Sort */}
            <div className="flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">
                    Showing <strong className="text-gray-900 dark:text-white">{filteredTransactions.length}</strong> transactions
                </p>
                <button
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-lime-accent transition-colors"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                </button>
            </div>

            {/* Transactions List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl overflow-hidden"
            >
                {filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 mb-4">No transactions found</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-lime-accent text-gray-900 rounded-xl font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Transaction</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-light-border dark:divide-dark-border">
                        {filteredTransactions.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="p-4 hover:bg-light-glass dark:hover:bg-dark-glass transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount >= 0
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {tx.amount >= 0 ? '↑' : '↓'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {tx.category || 'Uncategorized'} • {new Date(tx.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.amount >= 0 ? '+' : ''}{tx.currency} {tx.amount.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(tx.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!confirm('Delete this transaction? This cannot be undone.')) return;
                                                try {
                                                    const { error } = await supabase
                                                        .from('transactions')
                                                        .delete()
                                                        .eq('id', tx.id);

                                                    if (error) {
                                                        console.error('Supabase delete error:', error);
                                                        alert('Failed to delete transaction: ' + error.message);
                                                        return;
                                                    }

                                                    await refreshAll();
                                                } catch (err) {
                                                    console.error('Error deleting transaction:', err);
                                                    alert('Error deleting transaction');
                                                }
                                            }}
                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete transaction"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Add Transaction Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Add Transaction</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Type Toggle */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['withdrawal', 'deposit'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewTransaction({ ...newTransaction, type })}
                                                className={`py-2 px-4 rounded-lg font-medium transition-colors ${newTransaction.type === type
                                                    ? type === 'withdrawal'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-green-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {type === 'withdrawal' ? '↓ Expense' : '↑ Income'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Wallet Select */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Wallet
                                    </label>
                                    <select
                                        value={newTransaction.walletId}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, walletId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
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
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                                        <input
                                            type="number"
                                            value={newTransaction.amount}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={newTransaction.description}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        placeholder="e.g., Grocery shopping"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={newTransaction.category}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mood Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        <Smile className="inline w-4 h-4 mr-1" />
                                        How do you feel about this? (optional)
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {moodOptions.map(mood => (
                                            <button
                                                key={mood.id}
                                                type="button"
                                                onClick={() => setNewTransaction({
                                                    ...newTransaction,
                                                    mood: newTransaction.mood === mood.id ? '' : mood.id
                                                })}
                                                className={`p-2 rounded-xl text-center transition-all ${newTransaction.mood === mood.id
                                                    ? 'bg-lime-accent/30 border-2 border-lime-accent scale-105'
                                                    : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300'
                                                    }`}
                                                title={mood.label}
                                            >
                                                <span className="text-xl">{mood.emoji}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {newTransaction.mood && (
                                        <p className="text-xs text-lime-accent mt-1">
                                            Feeling: {moodOptions.find(m => m.id === newTransaction.mood)?.label}
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleAddTransaction}
                                    disabled={saving || !newTransaction.amount || !newTransaction.walletId}
                                    className="w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {saving ? (
                                        <span>Saving...</span>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            <span>Add Transaction</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
