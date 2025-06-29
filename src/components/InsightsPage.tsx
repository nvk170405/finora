import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Lock, Crown } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

type Insight = {
  title: string;
  value: string;
  change: string;
  color: string;
};

export const InsightsPage: React.FC = () => {
  const { plan, isFeatureUnlocked } = useSubscription();
  const navigate = useNavigate();

  const hasAdvancedAnalytics = isFeatureUnlocked?.('advanced-analytics') ?? false;

  const basicInsights: Insight[] = [
    { title: 'Monthly Spending', value: '$2,847.32', change: '+12%', color: 'text-blue-400' },
    { title: 'Top Category', value: 'Food & Dining', change: '34%', color: 'text-lime-accent' },
    { title: 'Avg. Transaction', value: '$89.45', change: '-5%', color: 'text-orange-400' },
  ];

  const premiumInsights: Insight[] = [
    { title: 'Spending Velocity', value: '1.2x', change: 'vs last month', color: 'text-purple-400' },
    { title: 'Savings Rate', value: '23.4%', change: '+2.1%', color: 'text-lime-accent' },
    { title: 'Investment ROI', value: '8.7%', change: 'YTD', color: 'text-blue-400' },
    { title: 'Budget Efficiency', value: '87%', change: '+5%', color: 'text-green-400' },
  ];

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
            Upgrade to Premium to unlock AI-powered insights, spending predictions, and advanced analytics.
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
          description="Chart visualization"
        />
        <ChartCard
          title="Growth Analysis"
          icon={<TrendingUp className="w-6 h-6 text-lime-accent" />}
          description="Trend analysis"
        />
      </div>
    </div>
  );
};
