import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Filter, Search, Calendar, ArrowUpDown } from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { exportService } from '../services/exportService';

export const TransactionsPage: React.FC = () => {
    const { transactions } = useWalletContext();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'deposit' | 'expense' | 'transfer'>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

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

                {/* Export Buttons */}
                <div className="flex space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportCSV}
                        className="flex items-center space-x-2 px-4 py-2 bg-lime-accent/20 text-lime-accent border border-lime-accent/30 rounded-xl hover:bg-lime-accent/30 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Export PDF</span>
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
                        <p className="text-gray-500">No transactions found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-light-border dark:divide-dark-border">
                        {filteredTransactions.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="p-4 hover:bg-light-glass dark:hover:bg-dark-glass transition-colors"
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
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.amount >= 0 ? '+' : ''}{tx.currency} {tx.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(tx.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
