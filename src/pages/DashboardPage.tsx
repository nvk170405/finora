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
import { NetWorthPage } from '../components/NetWorthPage';

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
      case 'networth':
        return <NetWorthPage />;
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
    <div className="flex min-h-screen bg-gradient-to-br from-light-base via-light-base to-light-surface dark:from-dark-base dark:via-dark-base dark:to-dark-surface">
      {/* Sidebar - flex child */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content Area - takes remaining space */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
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