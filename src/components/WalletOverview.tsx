import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Eye, EyeOff, Plus, Minus,
  RefreshCw, PieChart, Calendar, ArrowUpRight, ArrowDownRight,
  X, Briefcase
} from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { CountingNumber } from './ui/AnimatedNumber';

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

const investmentCategories = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'fixed_deposit', label: 'Fixed Deposit' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'other_investment', label: 'Other Investment' },
];

export const WalletOverview: React.FC = () => {
  const [showBalances, setShowBalances] = React.useState(true);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [logType, setLogType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [logData, setLogData] = useState({
    amount: '',
    description: '',
    category: 'other',
  });

  const { wallets, transactions, recurringExpenses, loading, refreshAll, createWallet } = useWalletContext();
  const { defaultCurrency, currencySymbol } = usePreferences();
  const { user } = useAuth();

  // State for estimated net worth from assets/liabilities
  const [estimatedNetWorth, setEstimatedNetWorth] = useState<number | null>(null);

  // Fetch assets and liabilities to calculate estimated net worth
  useEffect(() => {
    const fetchNetWorth = async () => {
      if (!user) return;
      try {
        const [assetsRes, liabilitiesRes] = await Promise.all([
          supabase.from('user_assets').select('current_value').eq('user_id', user.id),
          supabase.from('user_liabilities').select('remaining_amount').eq('user_id', user.id)
        ]);

        const totalAssets = assetsRes.data?.reduce((sum, a) => sum + (a.current_value || 0), 0) || 0;
        const totalLiabilities = liabilitiesRes.data?.reduce((sum, l) => sum + (l.remaining_amount || 0), 0) || 0;
        setEstimatedNetWorth(totalAssets - totalLiabilities);
      } catch (err) {
        console.error('Error fetching net worth:', err);
      }
    };
    fetchNetWorth();
  }, [user, transactions]); // Re-run when transactions change

  // Calculate monthly recurring expenses
  const monthlyBills = useMemo(() => {
    return recurringExpenses.reduce((sum, exp) => {
      if (!exp.is_active) return sum;
      switch (exp.frequency) {
        case 'daily': return sum + exp.amount * 30;
        case 'weekly': return sum + exp.amount * 4;
        case 'monthly': return sum + exp.amount;
        case 'yearly': return sum + exp.amount / 12;
        default: return sum + exp.amount;
      }
    }, 0);
  }, [recurringExpenses]);

  // Calculate portfolio based on logged transactions
  const portfolioStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // All time totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalInvestments = 0;

    // This month totals
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let monthlyInvestments = 0;

    // Last month totals (for comparison)
    let lastMonthIncome = 0;
    let lastMonthExpenses = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.created_at);
      const isThisMonth = txDate >= startOfMonth;
      const isLastMonth = txDate >= startOfLastMonth && txDate <= endOfLastMonth;

      // Better investment detection - use [INVESTMENT] prefix
      const isInvestment = tx.description?.startsWith('[INVESTMENT]') ||
        tx.description?.toLowerCase().includes('invest');

      if (tx.amount > 0) {
        totalIncome += tx.amount;
        if (isThisMonth) monthlyIncome += tx.amount;
        if (isLastMonth) lastMonthIncome += tx.amount;
      } else if (isInvestment) {
        const absAmount = Math.abs(tx.amount);
        totalInvestments += absAmount;
        if (isThisMonth) monthlyInvestments += absAmount;
      } else {
        const absAmount = Math.abs(tx.amount);
        totalExpenses += absAmount;
        if (isThisMonth) monthlyExpenses += absAmount;
        if (isLastMonth) lastMonthExpenses += absAmount;
      }
    });

    // Core calculations
    const availableBalance = totalIncome - totalExpenses - totalInvestments;
    const totalPortfolio = availableBalance + totalInvestments;
    const monthlyNet = monthlyIncome - monthlyExpenses - monthlyInvestments;

    // Percentage calculations
    const expenseRate = monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0;
    const investmentRate = monthlyIncome > 0 ? Math.round((monthlyInvestments / monthlyIncome) * 100) : 0;
    const savingsRate = monthlyIncome > 0 ? Math.round((monthlyNet / monthlyIncome) * 100) : 0;

    // Trend vs last month
    const incomeTrend = lastMonthIncome > 0
      ? Math.round(((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100) : 0;
    const expenseTrend = lastMonthExpenses > 0
      ? Math.round(((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100) : 0;

    // Financial health score (0-100)
    const savingsScore = Math.min(savingsRate > 0 ? savingsRate * 2 : 0, 40);
    const expenseScore = Math.max(30 - expenseRate * 0.5, 0);
    const investScore = Math.min(investmentRate * 1.5, 30);
    const healthScore = Math.round(savingsScore + expenseScore + investScore);

    return {
      totalIncome, totalExpenses, totalInvestments, availableBalance, totalPortfolio,
      monthlyIncome, monthlyExpenses, monthlyInvestments, monthlyNet,
      expenseRate, investmentRate, savingsRate, incomeTrend, expenseTrend, healthScore
    };
  }, [transactions]);

  const handleQuickLog = async () => {
    if (!logData.amount || !user) return;

    setSaving(true);
    try {
      // Find existing wallet or create one
      let wallet = wallets.find(w => w.currency === defaultCurrency);
      if (!wallet && wallets.length > 0) {
        wallet = wallets[0];
      }

      if (!wallet) {
        // Create wallet and use the returned wallet directly
        const newWallet = await createWallet(defaultCurrency);
        if (newWallet) {
          wallet = newWallet;
        } else {
          console.error('Failed to create wallet');
          return;
        }
      }

      const amount = parseFloat(logData.amount);

      // Income is positive, Expense and Investment are negative
      let finalAmount = amount;
      let transactionType = 'deposit';
      let finalCategory = logData.category;
      let finalDescription = logData.description;

      if (logType === 'expense') {
        finalAmount = -Math.abs(amount);
        transactionType = 'withdrawal';
      } else if (logType === 'investment') {
        finalAmount = -Math.abs(amount);
        transactionType = 'withdrawal';
        // For investments, use 'other' as category (DB constraint) and add type to description
        const investmentType = investmentCategories.find(c => c.value === logData.category)?.label || 'Investment';
        finalCategory = 'other';
        finalDescription = `[INVESTMENT] ${investmentType}${logData.description ? ': ' + logData.description : ''}`;
      }

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        wallet_id: wallet.id,
        amount: finalAmount,
        type: transactionType,
        description: finalDescription || `${logType.charAt(0).toUpperCase() + logType.slice(1)}`,
        category: finalCategory,
        currency: wallet.currency || defaultCurrency,
      });

      if (error) {
        console.error('Supabase insert error:', error);
        return;
      }

      setShowQuickLog(false);
      setLogData({ amount: '', description: '', category: 'other' });
      await refreshAll();
    } catch (err) {
      console.error('Error logging transaction:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-light-glass dark:bg-dark-glass rounded-2xl mb-6"></div>
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
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
            💰 Your Portfolio
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Track income, expenses & investments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              setRefreshing(true);
              await refreshAll();
              setRefreshing(false);
            }}
            disabled={refreshing}
            className="p-3 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-light-text dark:text-dark-text ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBalances(!showBalances)}
            className="p-3 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors"
          >
            {showBalances ? (
              <Eye className="w-5 h-5 text-light-text dark:text-dark-text" />
            ) : (
              <EyeOff className="w-5 h-5 text-light-text dark:text-dark-text" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Action Buttons - 3 options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setLogType('income'); setLogData({ ...logData, category: 'income' }); setShowQuickLog(true); }}
          className="flex flex-col items-center justify-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all"
        >
          <Plus className="w-6 h-6 text-green-500 mb-1" />
          <span className="font-bold text-green-500 text-sm">Income</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setLogType('expense'); setLogData({ ...logData, category: 'other' }); setShowQuickLog(true); }}
          className="flex flex-col items-center justify-center p-4 bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all"
        >
          <Minus className="w-6 h-6 text-red-500 mb-1" />
          <span className="font-bold text-red-500 text-sm">Expense</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setLogType('investment'); setLogData({ ...logData, category: 'stocks' }); setShowQuickLog(true); }}
          className="flex flex-col items-center justify-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all"
        >
          <Briefcase className="w-6 h-6 text-blue-500 mb-1" />
          <span className="font-bold text-blue-500 text-sm">Investment</span>
        </motion.button>
      </motion.div>

      {/* Portfolio Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-lime-accent/20 to-green-500/20 border border-lime-accent/30 rounded-2xl p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Available Balance */}
          <div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Available</p>
            <p className={`text-2xl font-bold ${portfolioStats.availableBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {showBalances ? (
                <CountingNumber value={portfolioStats.availableBalance} prefix={currencySymbol} />
              ) : '••••'}
            </p>
          </div>

          {/* Invested */}
          <div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Invested</p>
            <p className="text-2xl font-bold text-blue-500">
              {showBalances ? (
                <CountingNumber value={portfolioStats.totalInvestments} prefix={currencySymbol} />
              ) : '••••'}
            </p>
          </div>

          {/* Total Spent */}
          <div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Spent</p>
            <p className="text-2xl font-bold text-red-500">
              {showBalances ? (
                <CountingNumber value={portfolioStats.totalExpenses} prefix={currencySymbol} />
              ) : '••••'}
            </p>
          </div>

          {/* Monthly Bills */}
          <div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Monthly Bills</p>
            <p className="text-2xl font-bold text-orange-500">
              {showBalances ? (
                <CountingNumber value={Math.round(monthlyBills)} prefix={currencySymbol} />
              ) : '••••'}
            </p>
            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">{recurringExpenses.length} active</p>
          </div>

          {/* Estimated Net Worth */}
          <div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide">Est. Net Worth</p>
            <p className={`text-2xl font-bold ${(estimatedNetWorth ?? portfolioStats.totalPortfolio) >= 0 ? 'text-lime-accent' : 'text-red-500'}`}>
              {showBalances ? (
                <CountingNumber value={estimatedNetWorth ?? portfolioStats.totalPortfolio} prefix={currencySymbol} />
              ) : '••••'}
            </p>
            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">From Assets - Liabilities</p>
          </div>
        </div>
      </motion.div>

      {/* This Month Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Month Income</span>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-green-500">
            {showBalances ? `${currencySymbol}${portfolioStats.monthlyIncome.toLocaleString()}` : '••••'}
          </p>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Month Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-500">
            {showBalances ? `${currencySymbol}${portfolioStats.monthlyExpenses.toLocaleString()}` : '••••'}
          </p>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Month Invested</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-500">
            {showBalances ? `${currencySymbol}${portfolioStats.monthlyInvestments.toLocaleString()}` : '••••'}
          </p>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Month Savings</span>
            <PieChart className="w-4 h-4 text-lime-accent" />
          </div>
          <p className={`text-xl font-bold ${portfolioStats.monthlyNet >= 0 ? 'text-lime-accent' : 'text-red-500'}`}>
            {showBalances ? `${portfolioStats.monthlyNet >= 0 ? '+' : ''}${currencySymbol}${portfolioStats.monthlyNet.toLocaleString()}` : '••••'}
          </p>
        </div>
      </motion.div>

      {/* Financial Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Health Score Card */}
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-purple-400">💪 Financial Health</h4>
            <span className={`text-3xl font-bold ${portfolioStats.healthScore >= 70 ? 'text-green-500' :
              portfolioStats.healthScore >= 40 ? 'text-yellow-500' : 'text-red-500'
              }`}>
              {portfolioStats.healthScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all ${portfolioStats.healthScore >= 70 ? 'bg-green-500' :
                portfolioStats.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              style={{ width: `${portfolioStats.healthScore}%` }}
            />
          </div>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {portfolioStats.healthScore >= 70 ? '🎉 Excellent! Keep it up!' :
              portfolioStats.healthScore >= 40 ? '📈 Good progress, room to improve' :
                '⚠️ Focus on saving more and investing'}
          </p>
        </div>

        {/* Rates Card */}
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-5">
          <h4 className="font-bold text-light-text dark:text-dark-text mb-3">📊 This Month Rates</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Expense Rate</span>
              <span className="font-bold text-red-500">{portfolioStats.expenseRate}%</span>
            </div>
            <div className="w-full bg-gray-700/30 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(portfolioStats.expenseRate, 100)}%` }} />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Investment Rate</span>
              <span className="font-bold text-blue-500">{portfolioStats.investmentRate}%</span>
            </div>
            <div className="w-full bg-gray-700/30 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(portfolioStats.investmentRate, 100)}%` }} />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Savings Rate</span>
              <span className={`font-bold ${portfolioStats.savingsRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioStats.savingsRate}%
              </span>
            </div>
            <div className="w-full bg-gray-700/30 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${portfolioStats.savingsRate >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(Math.abs(portfolioStats.savingsRate), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Log Modal */}
      <AnimatePresence>
        {showQuickLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickLog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
                  {logType === 'income' && '➕ Log Income'}
                  {logType === 'expense' && '➖ Log Expense'}
                  {logType === 'investment' && '📈 Log Investment'}
                </h3>
                <button onClick={() => setShowQuickLog(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">{currencySymbol}</span>
                    <input
                      type="number"
                      value={logData.amount}
                      onChange={(e) => setLogData({ ...logData, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-2xl font-bold text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent"
                      autoFocus
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
                    value={logData.description}
                    onChange={(e) => setLogData({ ...logData, description: e.target.value })}
                    placeholder={
                      logType === 'income' ? 'e.g., Monthly Salary' :
                        logType === 'investment' ? 'e.g., NIFTY 50 Index Fund' :
                          'e.g., Grocery Shopping'
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Category
                  </label>
                  <select
                    value={logData.category}
                    onChange={(e) => setLogData({ ...logData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent"
                  >
                    {logType === 'investment' ? (
                      investmentCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))
                    ) : (
                      categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Info */}
                {logType === 'investment' && (
                  <p className="text-xs text-blue-400 bg-blue-500/10 p-3 rounded-lg">
                    💡 This will deduct from your Available balance but add to your Invested amount. Your Net Worth remains the same.
                  </p>
                )}

                {/* Submit */}
                <button
                  onClick={handleQuickLog}
                  disabled={saving || !logData.amount}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2 ${logType === 'income' ? 'bg-green-500 text-white hover:bg-green-600' :
                    logType === 'investment' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                      'bg-red-500 text-white hover:bg-red-600'
                    }`}
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      {logType === 'income' && <Plus className="w-5 h-5" />}
                      {logType === 'expense' && <Minus className="w-5 h-5" />}
                      {logType === 'investment' && <Briefcase className="w-5 h-5" />}
                      <span>
                        Save {logType.charAt(0).toUpperCase() + logType.slice(1)}
                      </span>
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