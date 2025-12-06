import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Lock, Crown, DollarSign, ShoppingBag, Plane, Coffee, Briefcase } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../services';

type Insight = {
  title: string;
  value: string;
  change: string;
  color: string;
};

export const InsightsPage: React.FC = () => {
  const { plan, isFeatureUnlocked } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [basicInsights, setBasicInsights] = useState<Insight[]>([]);
  const [monthlySummary, setMonthlySummary] = useState({ income: 0, expenses: 0 });

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

        // Find top category
        const categoryCounts: Record<string, number> = {};
        transactions.forEach(t => {
          const cat = t.category || 'other';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + Math.abs(t.amount);
        });
        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

        setBasicInsights([
          {
            title: 'Monthly Spending',
            value: `$${summary.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            change: transactions.length > 0 ? 'This month' : 'No data',
            color: 'text-blue-400'
          },
          {
            title: 'Top Category',
            value: topCategory ? topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1) : 'N/A',
            change: topCategory ? `$${topCategory[1].toLocaleString()}` : '',
            color: 'text-lime-accent'
          },
          {
            title: 'Avg. Transaction',
            value: `$${avgTransaction.toFixed(2)}`,
            change: `${transactions.length} transactions`,
            color: 'text-orange-400'
          },
        ]);
      } catch (err) {
        console.error('Error loading insights:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, []);

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
      value: `$${monthlySummary.income.toLocaleString()}`,
      change: 'This month',
      color: 'text-green-400'
    },
    {
      title: 'Net Flow',
      value: `$${(monthlySummary.income - monthlySummary.expenses).toLocaleString()}`,
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Spending Trends"
          icon={<BarChart3 className="w-6 h-6 text-lime-accent" />}
          description="Chart visualization coming soon"
        />
        <ChartCard
          title="Growth Analysis"
          icon={<TrendingUp className="w-6 h-6 text-lime-accent" />}
          description="Trend analysis coming soon"
        />
      </div>
    </div>
  );
};
