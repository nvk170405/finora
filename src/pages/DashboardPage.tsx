import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { WalletOverview } from '../components/WalletOverview';
import { TransactionTimeline } from '../components/TransactionTimeline';
import { InsightsPage } from '../components/InsightsPage';
import { SettingsPage } from '../components/SettingsPage';
import { ProfilePage } from '../components/ProfilePage';
import { SavingsGoalsPage } from '../components/SavingsGoalsPage';
import { FinanceScorePage } from '../components/FinanceScorePage';
import { TransactionsPage } from '../components/TransactionsPage';
import { RecurringDepositsPage } from '../components/RecurringDepositsPage';
import { AchievementsPage } from '../components/AchievementsPage';
import { ImpulseWishlist } from '../components/ImpulseWishlist';
import { MoodJournal } from '../components/MoodJournal';
import { ChallengesPage } from '../components/ChallengesPage';

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
      case 'transactions':
        return <TransactionsPage />;
      case 'goals':
        return <SavingsGoalsPage />;
      case 'recurring':
        return <RecurringDepositsPage />;
      case 'impulse':
        return <ImpulseWishlist />;
      case 'mood':
        return <MoodJournal />;
      case 'challenges':
        return <ChallengesPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'score':
        return <FinanceScorePage />;
      case 'insights':
        return <InsightsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <WalletOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-base via-light-base to-light-surface dark:from-dark-base dark:via-dark-base dark:to-dark-surface">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="lg:ml-64 min-h-screen">
        <TopBar />

        <main className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};