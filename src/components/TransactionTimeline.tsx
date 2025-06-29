import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Plane, Briefcase } from 'lucide-react';

const transactions = [
  {
    id: 1,
    type: 'sent',
    amount: -2500,
    currency: 'USD',
    recipient: 'Sarah Johnson',
    location: 'New York, US',
    flag: '🇺🇸',
    category: 'Business',
    icon: Briefcase,
    time: '2 hours ago',
    description: 'Consulting payment'
  },
  {
    id: 2,
    type: 'received',
    amount: +1840,
    currency: 'EUR',
    recipient: 'Freelance Client',
    location: 'Berlin, DE',
    flag: '🇩🇪',
    category: 'Income',
    icon: ArrowDownLeft,
    time: '5 hours ago',
    description: 'Web development project'
  },
  {
    id: 3,
    type: 'sent',
    amount: -89.99,
    currency: 'GBP',
    recipient: 'British Airways',
    location: 'London, UK',
    flag: '🇬🇧',
    category: 'Travel',
    icon: Plane,
    time: '1 day ago',
    description: 'Flight booking'
  },
  {
    id: 4,
    type: 'sent',
    amount: -45.20,
    currency: 'USD',
    recipient: 'Amazon',
    location: 'Seattle, US',
    flag: '🇺🇸',
    category: 'Shopping',
    icon: ShoppingBag,
    time: '2 days ago',
    description: 'Office supplies'
  },
  {
    id: 5,
    type: 'sent',
    amount: -12.50,
    currency: 'USD',
    recipient: 'Starbucks Coffee',
    location: 'San Francisco, US',
    flag: '🇺🇸',
    category: 'Food',
    icon: Coffee,
    time: '3 days ago',
    description: 'Coffee & pastries'
  },
];

const categoryColors = {
  Business: 'bg-blue-500/20 text-blue-400',
  Income: 'bg-lime-accent/20 text-lime-accent',
  Travel: 'bg-purple-500/20 text-purple-400',
  Shopping: 'bg-orange-500/20 text-orange-400',
  Food: 'bg-pink-500/20 text-pink-400',
};

export const TransactionTimeline: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold font-montserrat text-light-text dark:text-dark-text font-editorial">Recent Activity</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Your latest transactions across all currencies</p>
      </motion.div>

      {/* Transaction List */}
      <div className="bg-light-surface/50 font-montserrat dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass transition-colors duration-300">
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.01, x: 5 }}
              className="flex items-center space-x-4 p-4 rounded-xl hover:bg-light-glass dark:hover:bg-dark-glass transition-all group relative duration-300"
            >
              {/* Transaction Icon */}
              <div className={`p-3 rounded-full ${transaction.type === 'sent' ? 'bg-red-500/20' : 'bg-lime-accent/20'}`}>
                {transaction.type === 'sent' ? (
                  <ArrowUpRight className={`w-5 h-5 ${transaction.type === 'sent' ? 'text-red-400' : 'text-lime-accent'}`} />
                ) : (
                  <transaction.icon className="w-5 h-5 text-lime-accent" />
                )}
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-medium font-montserrat text-light-text dark:text-dark-text font-editorial truncate">{transaction.recipient}</p>
                  <span className="text-lg">{transaction.flag}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{transaction.location}</p>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[transaction.category as keyof typeof categoryColors]}`}>
                    {transaction.category}
                  </span>
                </div>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{transaction.description}</p>
              </div>

              {/* Amount and Time */}
              <div className="text-right">
                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  className={`font-bold font-editorial text-lg ${
                    transaction.amount > 0 ? 'text-lime-accent' : 'text-light-text dark:text-dark-text'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} {transaction.currency}
                </motion.p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{transaction.time}</p>
              </div>

              {/* Hover effect line */}
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                className="absolute bottom-0 left-0 h-px bg-lime-accent/30"
              />
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text hover:border-lime-accent/30 hover:text-lime-accent transition-all font-medium duration-300"
        >
          View All Transactions
        </motion.button>
      </div>
    </div>
  );
};