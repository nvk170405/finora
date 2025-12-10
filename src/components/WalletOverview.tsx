import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, EyeOff, Plus, RefreshCw } from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { usePreferences } from '../contexts/PreferencesContext';

// Currency metadata
const currencyMeta: Record<string, { symbol: string; flag: string }> = {
  USD: { symbol: '$', flag: '🇺🇸' },
  EUR: { symbol: '€', flag: '🇪🇺' },
  GBP: { symbol: '£', flag: '🇬🇧' },
  JPY: { symbol: '¥', flag: '🇯🇵' },
  CAD: { symbol: 'C$', flag: '🇨🇦' },
  AUD: { symbol: 'A$', flag: '🇦🇺' },
  CHF: { symbol: 'Fr', flag: '🇨🇭' },
  INR: { symbol: '₹', flag: '🇮🇳' },
};

// Exchange rates TO USD (base currency for conversion)
// These are approximate rates - in production, use a real API
const toUSDRates: Record<string, number> = {
  USD: 1,
  EUR: 1.09,    // 1 EUR = 1.09 USD
  GBP: 1.27,    // 1 GBP = 1.27 USD
  JPY: 0.0067,  // 1 JPY = 0.0067 USD
  CAD: 0.74,    // 1 CAD = 0.74 USD
  AUD: 0.65,    // 1 AUD = 0.65 USD
  CHF: 1.13,    // 1 CHF = 1.13 USD
  INR: 0.012,   // 1 INR = 0.012 USD
};

// Exchange rates FROM USD to other currencies
const fromUSDRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,    // 1 USD = 0.92 EUR
  GBP: 0.79,    // 1 USD = 0.79 GBP
  JPY: 149,     // 1 USD = 149 JPY
  CAD: 1.36,    // 1 USD = 1.36 CAD
  AUD: 1.53,    // 1 USD = 1.53 AUD
  CHF: 0.88,    // 1 USD = 0.88 CHF
  INR: 83,      // 1 USD = 83 INR
};

export const WalletOverview: React.FC = () => {
  const [showBalances, setShowBalances] = React.useState(true);
  const { wallets, loading, refreshWallets, createWallet } = useWalletContext();
  const { defaultCurrency, currencySymbol } = usePreferences();

  // Calculate accurate portfolio value in the default currency
  const convertedTotal = useMemo(() => {
    if (!wallets.length) return 0;

    // Step 1: Convert all wallet balances to USD first
    const totalInUSD = wallets.reduce((sum, wallet) => {
      const rateToUSD = toUSDRates[wallet.currency] || 0.012; // Default to INR rate if unknown
      return sum + (wallet.balance * rateToUSD);
    }, 0);

    // Step 2: Convert USD total to the user's default currency
    const rateFromUSD = fromUSDRates[defaultCurrency] || 1;
    return totalInUSD * rateFromUSD;
  }, [wallets, defaultCurrency]);

  const handleAddWallet = async () => {
    const currency = prompt('Enter currency code (e.g., USD, EUR, GBP):');
    if (currency && currency.length === 3) {
      await createWallet(currency.toUpperCase());
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-light-glass dark:bg-dark-glass rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
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
          <h2 className="text-3xl font-montserrat font-bold text-light-text dark:text-dark-text font-editorial">Portfolio Overview</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Your global currency positions</p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refreshWallets()}
            className="p-3 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
          >
            <RefreshCw className="w-5 h-5 text-light-text dark:text-dark-text" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBalances(!showBalances)}
            className="p-3 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
          >
            {showBalances ? (
              <Eye className="w-5 h-5 text-light-text dark:text-dark-text" />
            ) : (
              <EyeOff className="w-5 h-5 text-light-text dark:text-dark-text" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-light-surface to-light-glass dark:from-dark-surface dark:to-dark-glass border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-glass relative overflow-hidden transition-colors duration-300"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-accent/5 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-light-text-secondary font-montserrat dark:text-dark-text-secondary text-sm uppercase tracking-wider">Total Portfolio Value</p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
            className="flex items-baseline space-x-2 mt-2"
          >
            <span className="text-4xl font-bold font-montserrat text-lime-accent font-editorial">
              {showBalances ? `${currencySymbol}${convertedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••'}
            </span>
            <span className="text-lg text-light-text-secondary dark:text-dark-text-secondary">{defaultCurrency}</span>
          </motion.div>
          <div className="flex items-center space-x-2 mt-3">
            <TrendingUp className="w-4 h-4 text-lime-accent" />
            <span className="text-lime-accent text-sm">
              {wallets.length > 0 ? `${wallets.length} wallet${wallets.length > 1 ? 's' : ''} active` : 'No wallets yet'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Currency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 font-montserrat lg:grid-cols-4 gap-6">
        {wallets.map((wallet, index) => {
          const meta = currencyMeta[wallet.currency] || { symbol: wallet.currency, flag: '💰' };
          const change = 0; // Will be calculated from transactions later

          return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6 hover:border-lime-accent/30 transition-all hover:shadow-glow group duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-montserrat">{meta.flag}</span>
                  <div>
                    <h3 className="font-bold font-montserrat text-light-text dark:text-dark-text font-editorial">{wallet.currency}</h3>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {wallet.is_primary ? 'Primary' : 'Balance'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-lime-accent' : 'text-red-400'}`}>
                  {change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-montserrat">{change > 0 ? '+' : ''}{change}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="text-2xl font-montserrat font-bold text-light-text dark:text-dark-text font-editorial"
                >
                  {showBalances ? `${meta.symbol}${wallet.balance.toLocaleString()}` : '••••••'}
                </motion.p>
                <div className="w-full bg-light-glass dark:bg-dark-glass rounded-full h-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(wallet.balance / 20000 * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                    className="h-1 bg-lime-accent rounded-full opacity-70"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add Wallet Card */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + wallets.length * 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={handleAddWallet}
          className="bg-light-surface/30 dark:bg-dark-surface/30 backdrop-blur-sm border border-dashed border-light-border dark:border-dark-border rounded-xl p-6 hover:border-lime-accent/50 transition-all hover:shadow-glow flex flex-col items-center justify-center min-h-[140px] duration-300"
        >
          <Plus className="w-8 h-8 text-light-text-secondary dark:text-dark-text-secondary mb-2" />
          <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Add Wallet</span>
        </motion.button>
      </div>
    </div>
  );
};