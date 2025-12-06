import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, Zap, ArrowRightLeft } from 'lucide-react';
import { useExchangeRates } from '../hooks';

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF'];
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr',
};

export const ExchangeRates: React.FC = () => {
  const { rates, loading, lastUpdate, forceRefresh, refreshing, convert } = useExchangeRates();

  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [fromAmount, setFromAmount] = useState('1000');
  const [toAmount, setToAmount] = useState('');
  const [converting, setConverting] = useState(false);

  const doConvert = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      return;
    }
    setConverting(true);
    try {
      const result = await convert(parseFloat(fromAmount), fromCurrency, toCurrency);
      setToAmount(result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } catch {
      setToAmount('N/A');
    } finally {
      setConverting(false);
    }
  }, [fromAmount, fromCurrency, toCurrency, convert]);

  const handleAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount('...');
    const timer = setTimeout(async () => {
      if (!value || parseFloat(value) <= 0) {
        setToAmount('');
        return;
      }
      setConverting(true);
      try {
        const result = await convert(parseFloat(value), fromCurrency, toCurrency);
        setToAmount(result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      } catch {
        setToAmount('N/A');
      } finally {
        setConverting(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleCurrencyChange = async (type: 'from' | 'to', value: string) => {
    if (type === 'from') setFromCurrency(value);
    else setToCurrency(value);

    const from = type === 'from' ? value : fromCurrency;
    const to = type === 'to' ? value : toCurrency;
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    setConverting(true);
    try {
      const result = await convert(parseFloat(fromAmount), from, to);
      setToAmount(result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } catch {
      setToAmount('N/A');
    } finally {
      setConverting(false);
    }
  };

  const handleRefresh = async () => {
    const result = await forceRefresh();
    if (result.success) doConvert();
  };

  const swapCurrencies = async () => {
    const tempFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    setConverting(true);
    try {
      const result = await convert(parseFloat(fromAmount), toCurrency, tempFrom);
      setToAmount(result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } catch {
      setToAmount('N/A');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-light-glass dark:bg-dark-glass rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-light-glass dark:bg-dark-glass rounded-xl"></div>
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
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Live Exchange Rates</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Real-time rates from exchangerate-api.com
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {refreshing && (
            <span className="text-sm text-lime-accent flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>Fetching...</span>
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-light-text dark:text-dark-text ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Rates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rates.map((rate, index) => (
          <motion.div
            key={rate.pair}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-xl p-6 hover:border-lime-accent/30 hover:shadow-glow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">{rate.pair}</h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              <div className={`flex items-center space-x-1 ${rate.changePercent >= 0 ? 'text-lime-accent' : 'text-red-400'}`}>
                {rate.changePercent >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="font-medium">{rate.changePercent > 0 ? '+' : ''}{rate.changePercent.toFixed(2)}%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-lime-accent">{rate.rate.toFixed(4)}</span>
                <span className={`text-sm ${rate.change >= 0 ? 'text-lime-accent' : 'text-red-400'}`}>
                  {rate.change > 0 ? '+' : ''}{rate.change.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">High: <span className="text-light-text dark:text-dark-text">{rate.high.toFixed(4)}</span></span>
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Low: <span className="text-light-text dark:text-dark-text">{rate.low.toFixed(4)}</span></span>
              </div>
              <div className="pt-3 border-t border-light-border dark:border-dark-border">
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Bank Rate:</span>
                  <span className="text-light-text dark:text-dark-text">{rate.bankRate.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Our Advantage:</span>
                  <span className="text-lime-accent font-medium">+{rate.spread.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Exchange */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-light-surface/80 to-light-glass dark:from-dark-surface/80 dark:to-dark-glass border border-light-border dark:border-dark-border rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Quick Exchange</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          {/* From */}
          <div className="md:col-span-3">
            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">From</label>
            <div className="flex">
              <select
                value={fromCurrency}
                onChange={(e) => handleCurrencyChange('from', e.target.value)}
                className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-l-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                style={{ colorScheme: 'light dark' }}
              >
                {currencies.map(c => (
                  <option key={c} value={c} className="bg-white dark:bg-dark-surface text-gray-900 dark:text-white">{c}</option>
                ))}
              </select>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="bg-light-glass dark:bg-dark-glass border border-l-0 border-light-border dark:border-dark-border rounded-r-xl px-3 py-3 text-light-text dark:text-dark-text flex-1"
              />
            </div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{currencySymbols[fromCurrency]} {fromCurrency}</p>
          </div>

          {/* Swap */}
          <div className="flex justify-center md:col-span-1">
            <motion.button whileHover={{ scale: 1.1, rotate: 180 }} onClick={swapCurrencies} className="p-3 bg-lime-accent/20 rounded-full hover:bg-lime-accent/30">
              <ArrowRightLeft className="w-5 h-5 text-lime-accent" />
            </motion.button>
          </div>

          {/* To */}
          <div className="md:col-span-3">
            <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">To</label>
            <div className="flex">
              <select
                value={toCurrency}
                onChange={(e) => handleCurrencyChange('to', e.target.value)}
                className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-l-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                style={{ colorScheme: 'light dark' }}
              >
                {currencies.map(c => (
                  <option key={c} value={c} className="bg-white dark:bg-dark-surface text-gray-900 dark:text-white">{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={converting ? 'Converting...' : toAmount}
                readOnly
                className="bg-light-glass dark:bg-dark-glass border border-l-0 border-light-border dark:border-dark-border rounded-r-xl px-3 py-3 text-lime-accent font-bold flex-1"
              />
            </div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{currencySymbols[toCurrency]} {toCurrency}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-light-text-secondary dark:text-dark-text-secondary">
            1 {fromCurrency} ≈ {toAmount && fromAmount && !converting ? (parseFloat(toAmount.replace(/,/g, '')) / parseFloat(fromAmount)).toFixed(4) : '...'} {toCurrency}
          </span>
          <motion.button whileHover={{ scale: 1.05 }} className="bg-lime-accent text-dark-base px-6 py-2 rounded-xl font-medium hover:shadow-glow">
            Exchange Now
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};