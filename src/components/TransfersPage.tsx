import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowRight, CheckCircle, AlertCircle, Loader2, Mail, User, FileText } from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const currencyFlags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    INR: '🇮🇳',
};

const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
};

export const TransfersPage: React.FC = () => {
    const { wallets, refreshWallets, refreshTransactions } = useWalletContext();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fromWallet: '',
        amount: '',
        recipientEmail: '',
        description: '',
    });

    const selectedWallet = wallets.find(w => w.id === formData.fromWallet);

    const handleSubmit = async () => {
        if (!formData.fromWallet || !formData.amount || !formData.recipientEmail) {
            setError('Please fill in all required fields');
            return;
        }

        if (!user) {
            setError('Please log in to make transfers');
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (selectedWallet && amount > selectedWallet.balance) {
            setError('Insufficient funds');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.recipientEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: transferError } = await supabase.functions.invoke('transfer-to-user', {
                body: {
                    senderUserId: user.id,
                    recipientEmail: formData.recipientEmail.toLowerCase().trim(),
                    amount: amount,
                    currency: selectedWallet?.currency || 'USD',
                    description: formData.description || `Transfer to ${formData.recipientEmail}`,
                },
            });

            if (transferError) {
                throw new Error(transferError.message || 'Transfer failed');
            }

            if (data.success) {
                setSuccess(true);
                await refreshWallets();
                await refreshTransactions();
            } else {
                setError(data.message || 'Transfer failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Transfer error:', err);
            setError(err.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fromWallet: '',
            amount: '',
            recipientEmail: '',
            description: '',
        });
        setStep(1);
        setSuccess(false);
        setError(null);
    };

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
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Transfer Complete!</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        {currencySymbols[selectedWallet?.currency || 'USD']}{parseFloat(formData.amount).toLocaleString()} sent to
                    </p>
                    <p className="text-lime-accent font-medium mb-8">{formData.recipientEmail}</p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-8">
                        The recipient will see this in their wallet immediately.
                    </p>
                    <button
                        onClick={resetForm}
                        className="bg-lime-accent text-light-base dark:text-dark-base px-8 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
                    >
                        Send Another Transfer
                    </button>
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
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Send Money</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Transfer funds instantly to other FinoraX users
                </p>
            </motion.div>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start space-x-3"
            >
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-blue-500 text-sm font-medium">Internal Transfers Only</p>
                    <p className="text-blue-400 text-sm">
                        You can send money to any FinoraX user by entering their email address.
                        They must have an active account to receive funds.
                    </p>
                </div>
            </motion.div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-lime-accent text-dark-base' : 'bg-light-glass dark:bg-dark-glass text-light-text-secondary'
                                }`}
                        >
                            {s}
                        </div>
                        {s < 3 && (
                            <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-lime-accent' : 'bg-light-glass dark:bg-dark-glass'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-8 max-w-2xl mx-auto"
            >
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <span className="text-red-400">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">×</button>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Select Wallet & Amount</h3>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">From Wallet</label>
                            <select
                                value={formData.fromWallet}
                                onChange={(e) => setFormData({ ...formData, fromWallet: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-lime-accent/50 appearance-none cursor-pointer"
                                style={{ colorScheme: 'light dark' }}
                            >
                                <option value="" className="bg-white dark:bg-dark-surface text-gray-900 dark:text-white">Select a wallet</option>
                                {wallets.map((wallet) => (
                                    <option key={wallet.id} value={wallet.id} className="bg-white dark:bg-dark-surface text-gray-900 dark:text-white">
                                        {currencyFlags[wallet.currency] || '💰'} {wallet.currency} - {currencySymbols[wallet.currency]}{wallet.balance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text-secondary">
                                    {currencySymbols[selectedWallet?.currency || 'USD']}
                                </span>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                />
                            </div>
                            {selectedWallet && (
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    Available: {currencySymbols[selectedWallet.currency]}{selectedWallet.balance.toLocaleString()}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.fromWallet || !formData.amount || parseFloat(formData.amount) <= 0}
                            className="w-full bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <span>Continue</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Recipient Details</h3>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Recipient's Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.recipientEmail}
                                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                            />
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                The recipient must have a FinoraX account with this email
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                <FileText className="w-4 h-4 inline mr-2" />
                                Note (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Payment for lunch, birthday gift, etc."
                                className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text py-3 rounded-xl font-medium hover:bg-lime-accent/10 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!formData.recipientEmail}
                                className="flex-1 bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                <span>Review</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Review Transfer</h3>

                        <div className="bg-light-glass dark:bg-dark-glass rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Amount</span>
                                <span className="font-bold text-lime-accent text-xl">
                                    {currencySymbols[selectedWallet?.currency || 'USD']}{parseFloat(formData.amount).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">From</span>
                                <span className="text-light-text dark:text-dark-text">
                                    {currencyFlags[selectedWallet?.currency || 'USD']} {selectedWallet?.currency}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">To</span>
                                <span className="text-light-text dark:text-dark-text">{formData.recipientEmail}</span>
                            </div>
                            {formData.description && (
                                <div className="flex justify-between">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Note</span>
                                    <span className="text-light-text dark:text-dark-text text-right max-w-[200px] truncate">
                                        {formData.description}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Fee</span>
                                <span className="text-lime-accent font-medium">Free</span>
                            </div>
                            <div className="border-t border-light-border dark:border-dark-border pt-4 flex justify-between">
                                <span className="font-bold text-light-text dark:text-dark-text">Total</span>
                                <span className="font-bold text-light-text dark:text-dark-text">
                                    {currencySymbols[selectedWallet?.currency || 'USD']}{parseFloat(formData.amount).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-yellow-500 text-sm">
                                Please verify the recipient's email address. Transfers cannot be reversed once confirmed.
                            </p>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setStep(2)}
                                disabled={loading}
                                className="flex-1 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text py-3 rounded-xl font-medium hover:bg-lime-accent/10 transition-all disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Confirm & Send</span>
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
