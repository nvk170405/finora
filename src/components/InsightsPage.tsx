import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Lock, Crown, DollarSign, ShoppingBag, Plane, Coffee, Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../services';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type Insight = {
  title: string;
  value: string;
  change: string;
  color: string;
};

type ChartData = {
  name: string;
  value: number;
  income?: number;
  expense?: number;
};

// Conversion rates FROM USD to other currencies
const fromUSDRates: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149, CAD: 1.36, AUD: 1.53, INR: 83,
};

const CHART_COLORS = ['#CAFF40', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

export const InsightsPage: React.FC = () => {
  const { plan, isFeatureUnlocked } = useSubscription();
  const { defaultCurrency, currencySymbol } = usePreferences();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [basicInsights, setBasicInsights] = useState<Insight[]>([]);
  const [monthlySummary, setMonthlySummary] = useState({ income: 0, expenses: 0 });
  const [spendingData, setSpendingData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [growthData, setGrowthData] = useState<ChartData[]>([]);
  const [transferCount, setTransferCount] = useState(0);
  const [exchangeCount, setExchangeCount] = useState(0);

  const hasAdvancedAnalytics = isFeatureUnlocked?.('advanced-analytics') ?? false;

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      try {
        const [summary, transactions] = await Promise.all([
          transactionService.getMonthlySummary(),
          transactionService.getTransactions(100),
        ]);

        setMonthlySummary(summary);

        // Calculate insights from real data
        const avgTransaction = transactions.length > 0
          ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
          : 0;

        // Find top category and count transaction types
        const categoryCounts: Record<string, number> = {};
        let transfers = 0;
        let exchanges = 0;

        transactions.forEach(t => {
          const cat = t.category || 'other';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + Math.abs(t.amount);

          // Count transfers and exchanges based on description
          const desc = (t.description || '').toLowerCase();
          if (desc.includes('transfer') || desc.includes('sent to')) transfers++;
          if (desc.includes('exchange') || desc.includes('converted')) exchanges++;
        });

        setTransferCount(transfers);
        setExchangeCount(exchanges);

        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

        // Convert values to default currency
        const rate = fromUSDRates[defaultCurrency] || 1;
        const convertedExpenses = summary.expenses * rate;
        const convertedAvg = avgTransaction * rate;
        const convertedTopCat = topCategory ? topCategory[1] * rate : 0;

        setBasicInsights([
          {
            title: 'Monthly Spending',
            value: `${currencySymbol}${convertedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            change: transactions.length > 0 ? 'This month' : 'No data',
            color: 'text-blue-400'
          },
          {
            title: 'Top Category',
            value: topCategory ? topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1) : 'N/A',
            change: topCategory ? `${currencySymbol}${convertedTopCat.toLocaleString()}` : '',
            color: 'text-lime-accent'
          },
          {
            title: 'Avg. Transaction',
            value: `${currencySymbol}${convertedAvg.toFixed(2)}`,
            change: `${transactions.length} transactions`,
            color: 'text-orange-400'
          },
        ]);

        // Generate chart data for premium features using REAL transaction data

        // Group transactions by month for spending trends
        const monthlyData: Record<string, { income: number; expense: number }> = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleString('default', { month: 'short' });
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }

        // Process transactions into monthly buckets
        transactions.forEach(t => {
          const txDate = new Date(t.created_at);
          const monthKey = txDate.toLocaleString('default', { month: 'short' });

          if (monthlyData[monthKey]) {
            if (t.type === 'deposit' || (t.amount > 0 && t.type !== 'withdrawal')) {
              monthlyData[monthKey].income += Math.abs(t.amount);
            } else {
              monthlyData[monthKey].expense += Math.abs(t.amount);
            }
          }
        });

        // Convert to chart format
        const spendingTrend = Object.entries(monthlyData).map(([month, data]) => ({
          name: month,
          value: Math.round(data.expense * rate),
          income: Math.round(data.income * rate),
          expense: Math.round(data.expense * rate),
        }));
        setSpendingData(spendingTrend);

        // Category breakdown for pie chart - using REAL category data
        const categories = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: Math.round(value * rate),
          }));
        setCategoryData(categories.length > 0 ? categories : [{ name: 'No Data', value: 0 }]);

        // Growth data - cumulative balance over time from transactions
        let runningTotal = 0;
        const growthByMonth: Record<string, number> = {};

        // Sort transactions by date ascending
        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        sortedTransactions.forEach(t => {
          runningTotal += t.amount; // Positive for deposits, negative for withdrawals
          const txDate = new Date(t.created_at);
          const monthKey = txDate.toLocaleString('default', { month: 'short' });
          growthByMonth[monthKey] = runningTotal;
        });

        // Convert to chart format
        const growthChartData = Object.entries(monthlyData).map(([month]) => ({
          name: month,
          value: Math.round((growthByMonth[month] || runningTotal) * rate),
        }));
        setGrowthData(growthChartData);

      } catch (err) {
        console.error('Error loading insights:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, [defaultCurrency, currencySymbol]);

  const rate = fromUSDRates[defaultCurrency] || 1;
  const convertedIncome = monthlySummary.income * rate;
  const convertedExpenses = monthlySummary.expenses * rate;
  const netFlow = (monthlySummary.income - monthlySummary.expenses) * rate;

  const premiumInsights: Insight[] = [
    {
      title: 'Savings Rate',
      value: monthlySummary.income > 0
        ? `${((monthlySummary.income - monthlySummary.expenses) / monthlySummary.income * 100).toFixed(1)}%`
        : 'N/A',
      change: 'of income saved',
      color: 'text-lime-accent'
    },
    {
      title: 'Monthly Income',
      value: `${currencySymbol}${convertedIncome.toLocaleString()}`,
      change: 'This month',
      color: 'text-green-400'
    },
    {
      title: 'Net Flow',
      value: `${currencySymbol}${netFlow.toLocaleString()}`,
      change: monthlySummary.income > monthlySummary.expenses ? 'Positive' : 'Negative',
      color: 'text-blue-400'
    },
    {
      title: 'Budget Status',
      value: monthlySummary.expenses < monthlySummary.income ? 'On Track' : 'Over Budget',
      change: monthlySummary.expenses < monthlySummary.income ? '✓' : '⚠️',
      color: monthlySummary.expenses < monthlySummary.income ? 'text-green-400' : 'text-red-400'
    },
  ];

  const categoryIcons: Record<string, React.ElementType> = {
    business: Briefcase,
    income: DollarSign,
    shopping: ShoppingBag,
    travel: Plane,
    food: Coffee,
  };

  const ChartCard = ({
    title,
    icon,
    description,
  }: {
    title: string;
    icon: React.ReactNode;
    description: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        {icon}
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text">{title}</h3>
      </div>
      <div className="h-48 flex items-center justify-center text-center">
        {icon}
        <p className="text-light-text-secondary dark:text-dark-text-secondary ml-4">{description}</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
          ))}
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
          <h2 className="text-3xl font-bold font-montserrat text-light-text dark:text-dark-text font-editorial">
            Financial Insights
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            {hasAdvancedAnalytics ? 'AI-powered analytics and predictions' : 'Basic spending overview'}
          </p>
        </div>
        {!hasAdvancedAnalytics && (
          <div className="flex items-center space-x-2 bg-lime-accent/10 px-4 py-2 rounded-lg">
            <Crown className="w-5 h-5 text-lime-accent" />
            <span className="text-lime-accent font-medium">Premium Feature</span>
          </div>
        )}
      </motion.div>

      {/* Basic Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {basicInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6"
          >
            <h3 className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-2">{insight.title}</h3>
            <p className={`text-2xl font-bold ${insight.color} mb-1`}>{insight.value}</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{insight.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Premium Insights */}
      {hasAdvancedAnalytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {premiumInsights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-6"
            >
              <h3 className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-2">{insight.title}</h3>
              <p className={`text-2xl font-bold ${insight.color} mb-1`}>{insight.value}</p>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{insight.change}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-12 text-center"
        >
          <Lock className="w-16 h-16 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Advanced Analytics Locked</h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            Upgrade to Premium to unlock savings rate, income tracking, and budget analysis.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-lime-accent text-light-base dark:text-dark-base px-6 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
          >
            Upgrade to Premium
          </button>
        </motion.div>
      )}

      {/* Charts Section - Premium Only */}
      {hasAdvancedAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-lime-accent" />
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Spending Trends</h3>
              </div>
              <span className="text-xs bg-lime-accent/20 text-lime-accent px-2 py-1 rounded-full">6 Months</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F9FAFB' }}
                    formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Growth Analysis Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-lime-accent" />
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Portfolio Growth</h3>
              </div>
              <div className="flex items-center space-x-1 text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">+48%</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CAFF40" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#CAFF40" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F9FAFB' }}
                    formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Portfolio']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#CAFF40" strokeWidth={3} dot={{ fill: '#CAFF40', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Breakdown Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="w-6 h-6 text-lime-accent" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Spending by Category</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                    labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                    itemStyle={{ color: '#F9FAFB' }}
                    formatter={(value: number, name: string) => [`${currencySymbol}${value.toLocaleString()}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Monthly Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="w-6 h-6 text-lime-accent" />
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Monthly Comparison</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F9FAFB' }}
                    formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-12 text-center relative overflow-hidden"
        >
          {/* Blurred preview charts */}
          <div className="absolute inset-0 opacity-20 blur-sm">
            <div className="grid grid-cols-2 gap-4 p-4 h-full">
              <div className="bg-gradient-to-br from-lime-accent/30 to-transparent rounded-lg"></div>
              <div className="bg-gradient-to-br from-blue-500/30 to-transparent rounded-lg"></div>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Lock className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary" />
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Premium Charts & Analytics</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2 max-w-md mx-auto">
              Unlock powerful visualization tools:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="bg-light-glass dark:bg-dark-glass px-3 py-1 rounded-full text-sm">📊 Spending Trends</span>
              <span className="bg-light-glass dark:bg-dark-glass px-3 py-1 rounded-full text-sm">📈 Portfolio Growth</span>
              <span className="bg-light-glass dark:bg-dark-glass px-3 py-1 rounded-full text-sm">🥧 Category Breakdown</span>
              <span className="bg-light-glass dark:bg-dark-glass px-3 py-1 rounded-full text-sm">📉 Monthly Comparison</span>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-lime-accent text-light-base dark:text-dark-base px-8 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
            >
              Upgrade to Premium
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
