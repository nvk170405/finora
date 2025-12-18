import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    CreditCard,
    CheckCircle,
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { useWalletDeposit } from '../hooks/useWalletDeposit';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
};

const currencyFlags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    INR: '🇮🇳',
};

const quickAmounts = [50, 100, 250, 500, 1000, 2500];

export const DepositPage: React.FC = () => {
    const { wallets, refreshWallets } = useWalletContext();
    const { initiateDeposit, loading, error, success, resetState } = useWalletDeposit();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [emailSent, setEmailSent] = useState(false);

    const [formData, setFormData] = useState({
        walletId: '',
        amount: '',
    });

    const selectedWallet = wallets.find(w => w.id === formData.walletId);
    const amountNum = parseFloat(formData.amount) || 0;

    // Auto-select wallet matching default currency on load
    useEffect(() => {
        if (wallets.length > 0 && !formData.walletId) {
            // Try to get default currency from localStorage (preferences)
            const savedCurrency = localStorage.getItem('finora_default_currency') || 'USD';
            const defaultWallet = wallets.find(w => w.currency === savedCurrency);
            if (defaultWallet) {
                setFormData(prev => ({ ...prev, walletId: defaultWallet.id }));
            }
        }
    }, [wallets, formData.walletId]);

    // Refresh wallets and send email when deposit is successful
    useEffect(() => {
        if (success && !emailSent) {
            refreshWallets();

            // Send email notification
            const sendEmail = async () => {
                console.log('Attempting to send email...', { userId: user?.id, amount: formData.amount, currency: selectedWallet?.currency });
                try {
                    const result = await supabase.functions.invoke('send-email', {
                        body: {
                            type: 'deposit',
                            userId: user?.id,
                            data: {
                                amount: formData.amount,
                                currency: selectedWallet?.currency || 'USD'
                            }
                        }
                    });
                    console.log('Email send result:', result);
                    setEmailSent(true);
                } catch (err) {
                    console.error('Failed to send email:', err);
                }
            };
            sendEmail();

            // Unlock achievements
            const unlockAchievements = async () => {
                const { achievementService } = await import('../services/achievementService');

                // First deposit achievement
                await achievementService.unlockAchievement('first_deposit');

                // Time-based achievements
                const hour = new Date().getHours();
                if (hour < 8) {
                    await achievementService.unlockAchievement('early_bird');
                }
                if (hour >= 22) {
                    await achievementService.unlockAchievement('night_owl');
                }
            };
            unlockAchievements();
        }
    }, [success, emailSent, user?.id, formData.amount, selectedWallet?.currency, refreshWallets]);

    const handleDeposit = async () => {
        if (!formData.walletId || !formData.amount) return;
        if (amountNum <= 0) return;

        await initiateDeposit(
            formData.walletId,
            amountNum,
            selectedWallet?.currency || 'USD'
        );
    };

    const resetForm = () => {
        setFormData({
            walletId: '',
            amount: '',
        });
        setStep(1);
        resetState();
    };

    // Success State
    if (success) {
        return (
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-24 h-24 bg-lime-accent/20 rounded-full flex items-center justify-center mb-6"
                    >
                        <CheckCircle className="w-12 h-12 text-lime-accent" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Deposit Successful!</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        {currencySymbols[selectedWallet?.currency || 'USD']}{amountNum.toLocaleString()} added to your {selectedWallet?.currency} wallet
                    </p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-8">
                        Your wallet will be updated shortly.
                    </p>
                    <div className="flex space-x-4">
                        <button
                            onClick={resetForm}
                            className="bg-lime-accent text-light-base dark:text-dark-base px-8 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
                        >
                            Make Another Deposit
                        </button>
                    </div>
                </motion.div>
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
            >
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Add Funds</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Add funds to your multi-currency wallets securely</p>
            </motion.div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-8">
                {[1, 2].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-lime-accent text-dark-base' : 'bg-light-glass dark:bg-dark-glass text-light-text-secondary'
                                }`}
                        >
                            {s}
                        </div>
                        {s < 2 && (
                            <div className={`w-16 h-1 mx-2 transition-all ${step > s ? 'bg-lime-accent' : 'bg-light-glass dark:bg-dark-glass'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-500">{error}</p>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-8 max-w-2xl mx-auto"
            >
                {/* Step 1: Select Wallet & Amount */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Select Wallet & Amount</h3>

                        {/* Wallet Selection */}
                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-3">Deposit To</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {wallets.map((wallet) => (
                                    <button
                                        key={wallet.id}
                                        onClick={() => setFormData({ ...formData, walletId: wallet.id })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${formData.walletId === wallet.id
                                            ? 'border-lime-accent bg-lime-accent/10'
                                            : 'border-light-border dark:border-dark-border hover:border-lime-accent/50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{currencyFlags[wallet.currency] || '💰'}</span>
                                            <div>
                                                <p className="font-bold text-light-text dark:text-dark-text">{wallet.currency}</p>
                                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                    Balance: {currencySymbols[wallet.currency] || ''}{wallet.balance.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {wallets.length === 0 && (
                                <p className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                                    No wallets found. Create a wallet first from the Wallet page.
                                </p>
                            )}
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-3">
                                Amount ({selectedWallet?.currency || 'Select a wallet'})
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-light-text-secondary">
                                    {currencySymbols[selectedWallet?.currency || 'USD'] || '$'}
                                </span>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    min="1"
                                    className="w-full pl-12 pr-4 py-4 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-2xl font-bold text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                />
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.amount === amt.toString()
                                            ? 'bg-lime-accent text-dark-base'
                                            : 'bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text hover:bg-lime-accent/20'
                                            }`}
                                    >
                                        {currencySymbols[selectedWallet?.currency || 'USD']}{amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            {/* Deposit Preview */}
                            {amountNum > 0 && (
                                <div className="mt-3 flex items-center space-x-2 text-sm text-lime-accent">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{currencySymbols[selectedWallet?.currency || 'USD']}{amountNum.toLocaleString()} {selectedWallet?.currency} will be added to your wallet</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.walletId || !formData.amount || amountNum <= 0}
                            className="w-full bg-lime-accent text-light-base dark:text-dark-base py-4 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <span>Continue</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Review & Pay */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Review Deposit</h3>

                        <div className="bg-light-glass dark:bg-dark-glass rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Amount</span>
                                <span className="font-bold text-lime-accent text-2xl">
                                    {currencySymbols[selectedWallet?.currency || 'USD']}{amountNum.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">To Wallet</span>
                                <span className="text-light-text dark:text-dark-text flex items-center space-x-2">
                                    <span>{currencyFlags[selectedWallet?.currency || 'USD']}</span>
                                    <span>{selectedWallet?.currency}</span>
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Payment Method</span>
                                <span className="text-light-text dark:text-dark-text flex items-center space-x-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Secure Payment</span>
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Deposit Amount</span>
                                <span className="text-light-text dark:text-dark-text font-semibold">
                                    {currencySymbols[selectedWallet?.currency || 'USD']}{amountNum.toLocaleString()} {selectedWallet?.currency}
                                </span>
                            </div>
                            <div className="border-t border-light-border dark:border-dark-border pt-4">
                                <div className="flex justify-between">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Current Balance</span>
                                    <span className="text-light-text dark:text-dark-text">
                                        {currencySymbols[selectedWallet?.currency || 'USD']}{(selectedWallet?.balance || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="font-bold text-light-text dark:text-dark-text">New Balance</span>
                                    <span className="font-bold text-lime-accent">
                                        {currencySymbols[selectedWallet?.currency || 'USD']}{((selectedWallet?.balance || 0) + amountNum).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-lime-accent/10 border border-lime-accent/30 rounded-xl p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-lime-accent flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-lime-accent text-sm">
                                    You'll be directed to our secure payment page. All major payment methods are accepted.
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setStep(1)}
                                disabled={loading}
                                className="flex-1 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text py-3 rounded-xl font-medium hover:bg-lime-accent/10 transition-all disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleDeposit}
                                disabled={loading}
                                className="flex-1 bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        <span>Complete Deposit</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
