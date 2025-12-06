import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Plane, Briefcase, Wallet, RefreshCw } from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { Transaction } from '../services';

const categoryColors: Record<string, string> = {
  business: 'bg-blue-500/20 text-blue-400',
  income: 'bg-lime-accent/20 text-lime-accent',
  travel: 'bg-purple-500/20 text-purple-400',
  shopping: 'bg-orange-500/20 text-orange-400',
  food: 'bg-pink-500/20 text-pink-400',
  entertainment: 'bg-cyan-500/20 text-cyan-400',
  utilities: 'bg-yellow-500/20 text-yellow-400',
  other: 'bg-gray-500/20 text-gray-400',
};

const categoryIcons: Record<string, React.ElementType> = {
  business: Briefcase,
  income: ArrowDownLeft,
  travel: Plane,
  shopping: ShoppingBag,
  food: Coffee,
  other: Wallet,
};

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export const TransactionTimeline: React.FC = () => {
  const { transactions, loading, refreshTransactions } = useWalletContext();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold font-montserrat text-light-text dark:text-dark-text font-editorial">Recent Activity</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Your latest transactions across all currencies</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refreshTransactions()}
          className="p-3 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
        >
          <RefreshCw className="w-5 h-5 text-light-text dark:text-dark-text" />
        </motion.button>
      </motion.div>

      {/* Transaction List */}
      <div className="bg-light-surface/50 font-montserrat dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass transition-colors duration-300">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">No transactions yet</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => {
              const isCredit = transaction.type === 'deposit' || transaction.type === 'transfer_in';
              const category = transaction.category || 'other';
              const IconComponent = categoryIcons[category] || Wallet;

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-light-glass dark:hover:bg-dark-glass transition-all group relative duration-300"
                >
                  {/* Transaction Icon */}
                  <div className={`p-3 rounded-full ${isCredit ? 'bg-lime-accent/20' : 'bg-red-500/20'}`}>
                    {isCredit ? (
                      <ArrowDownLeft className="w-5 h-5 text-lime-accent" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium font-montserrat text-light-text dark:text-dark-text font-editorial truncate">
                        {transaction.recipient_name || (isCredit ? 'Deposit' : 'Withdrawal')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {transaction.recipient_location || transaction.type}
                      </p>
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">•</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category]}`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      {transaction.description || 'No description'}
                    </p>
                  </div>

                  {/* Amount and Time */}
                  <div className="text-right">
                    <motion.p
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                      className={`font-bold font-editorial text-lg ${isCredit ? 'text-lime-accent' : 'text-light-text dark:text-dark-text'
                        }`}
                    >
                      {isCredit ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()} {transaction.currency}
                    </motion.p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      {formatRelativeTime(transaction.created_at)}
                    </p>
                  </div>

                  {/* Hover effect line */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    className="absolute bottom-0 left-0 h-px bg-lime-accent/30"
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View More Button */}
        {transactions.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text hover:border-lime-accent/30 hover:text-lime-accent transition-all font-medium duration-300"
          >
            View All Transactions
          </motion.button>
        )}
      </div>
    </div>
  );
};