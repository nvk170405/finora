import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { WalletOverview } from '../components/WalletOverview';
import { TransactionTimeline } from '../components/TransactionTimeline';
import { InsightsPage } from '../components/InsightsPage';
import { SettingsPage } from '../components/SettingsPage';
import { ProfilePage } from '../components/ProfilePage';
import { DepositPage } from '../components/DepositPage';
import { WithdrawalPage } from '../components/WithdrawalPage';
import { AdminWithdrawals } from '../components/AdminWithdrawals';
import { SavingsGoalsPage } from '../components/SavingsGoalsPage';
import { FinanceScorePage } from '../components/FinanceScorePage';
import { TransactionsPage } from '../components/TransactionsPage';
import { RecurringDepositsPage } from '../components/RecurringDepositsPage';

export const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('wallet');

  const renderMainContent = () => {
    switch (activeSection) {
      case 'wallet':
        return (
          <div className="space-y-8">
            <WalletOverview />
            <TransactionTimeline />
          </div>
        );
      case 'deposit':
        return <DepositPage />;
      case 'withdrawal':
        return <WithdrawalPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'goals':
        return <SavingsGoalsPage />;
      case 'recurring':
        return <RecurringDepositsPage />;
      case 'score':
        return <FinanceScorePage />;
      case 'insights':
        return <InsightsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin-withdrawals':
        return <AdminWithdrawals />;
      default:
        return <WalletOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-light-base font-montserrat dark:bg-dark-base text-light-text dark:text-dark-text font-editorial transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-accent/5 dark:bg-lime-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-lime-accent/3 dark:bg-lime-accent/3 rounded-full blur-3xl"></div>
      </div>

      <div className="flex h-screen relative font-montserrat">
        {/* Sidebar */}
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Main Content */}
        <div className="flex-1 font-montserrat flex flex-col min-w-0">
          <TopBar onNavigate={setActiveSection} />

          {/* Content Area */}
          <div className="flex-1 font-montserrat overflow-auto">
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {renderMainContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Strip */}

    </div>
  );
};