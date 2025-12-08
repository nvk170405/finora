import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Loader2,
    CreditCard,
    Clock,
    Shield
} from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const currencyFlags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: 'C$',
    AUD: 'A$',
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

export const WithdrawalPage: React.FC = () => {
    const { wallets, refreshWallets, refreshTransactions } = useWalletContext();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fromWallet: '',
        amount: '',
        accountHolderName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        bankName: '',
    });

    const selectedWallet = wallets.find(w => w.id === formData.fromWallet);

    const validateBankDetails = () => {
        if (formData.accountNumber !== formData.confirmAccountNumber) {
            setError('Account numbers do not match');
            return false;
        }
        if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
            setError('Please enter a valid account number');
            return false;
        }
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
            setError('Please enter a valid IFSC code (e.g., SBIN0001234)');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!formData.fromWallet || !formData.amount || !formData.accountNumber || !formData.ifscCode) {
            setError('Please fill in all required fields');
            return;
        }

        if (!user) {
            setError('Please log in to withdraw');
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (amount < 100) {
            setError('Minimum withdrawal amount is ₹100');
            return;
        }

        if (selectedWallet && amount > selectedWallet.balance) {
            setError('Insufficient funds');
            return;
        }

        if (!validateBankDetails()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Submit withdrawal request via Edge Function
            const { data, error: submitError } = await supabase.functions.invoke('submit-withdrawal', {
                body: {
                    userId: user.id,
                    walletId: formData.fromWallet,
                    amount: amount,
                    currency: selectedWallet?.currency || 'INR',
                    accountHolderName: formData.accountHolderName,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode.toUpperCase(),
                    bankName: formData.bankName || null,
                },
            });

            if (submitError) {
                throw new Error(submitError.message || 'Withdrawal request failed');
            }

            if (data.success) {
                setRequestId(data.requestId);
                setSuccess(true);
                await refreshWallets();
                await refreshTransactions();
            } else {
                setError(data.message || 'Withdrawal request failed');
            }
        } catch (err: any) {
            console.error('Withdrawal error:', err);
            setError(err.message || 'Withdrawal failed');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fromWallet: '',
            amount: '',
            accountHolderName: '',
            accountNumber: '',
            confirmAccountNumber: '',
            ifscCode: '',
            bankName: '',
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
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Withdrawal Initiated!</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        {currencySymbols[selectedWallet?.currency || 'INR']}{parseFloat(formData.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        To account ending in ****{formData.accountNumber.slice(-4)}
                    </p>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 max-w-md text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-yellow-500 font-medium">Processing Time</span>
                        </div>
                        <p className="text-yellow-400 text-sm mb-2">
                            Your withdrawal request has been submitted and will be processed within 1-3 business days.
                        </p>
                        {requestId && (
                            <p className="text-xs text-yellow-400/70">
                                Request ID: {requestId.slice(0, 8)}...
                            </p>
                        )}
                    </div>

                    <button
                        onClick={resetForm}
                        className="bg-lime-accent text-light-base dark:text-dark-base px-8 py-3 rounded-xl font-medium hover:shadow-glow transition-all"
                    >
                        Make Another Withdrawal
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
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">Withdraw to Bank</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Transfer funds from your wallet to your bank account
                </p>
            </motion.div>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <div className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl p-4 flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-lime-accent" />
                    <div>
                        <p className="font-medium text-light-text dark:text-dark-text">1-3 Business Days</p>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Processing time</p>
                    </div>
                </div>
                <div className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl p-4 flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-lime-accent" />
                    <div>
                        <p className="font-medium text-light-text dark:text-dark-text">Bank-Level Security</p>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">256-bit encryption</p>
                    </div>
                </div>
                <div className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl p-4 flex items-center space-x-3">
                    <CreditCard className="w-8 h-8 text-lime-accent" />
                    <div>
                        <p className="font-medium text-light-text dark:text-dark-text">₹0 Fee</p>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No withdrawal charges</p>
                    </div>
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
                                <option value="">Select a wallet</option>
                                {wallets.map((wallet) => (
                                    <option key={wallet.id} value={wallet.id}>
                                        {currencyFlags[wallet.currency] || '💰'} {wallet.currency} - {currencySymbols[wallet.currency]}{wallet.balance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Withdrawal Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text-secondary">
                                    {currencySymbols[selectedWallet?.currency || 'INR']}
                                </span>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    min="100"
                                    className="w-full pl-8 pr-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                />
                            </div>
                            <div className="flex justify-between mt-1">
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Min: {currencySymbols[selectedWallet?.currency || 'INR']}100
                                </p>
                                {selectedWallet && (
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        Available: {currencySymbols[selectedWallet.currency]}{selectedWallet.balance.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.fromWallet || !formData.amount || parseFloat(formData.amount) < 100}
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
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Bank Account Details</h3>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                Account Holder Name
                            </label>
                            <input
                                type="text"
                                value={formData.accountHolderName}
                                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value.toUpperCase() })}
                                placeholder="JOHN DOE"
                                className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                Account Number
                            </label>
                            <input
                                type="text"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                                placeholder="Enter account number"
                                maxLength={18}
                                className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                Confirm Account Number
                            </label>
                            <input
                                type="text"
                                value={formData.confirmAccountNumber}
                                onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                                placeholder="Re-enter account number"
                                maxLength={18}
                                className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                            />
                            {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                                <p className="text-red-400 text-sm mt-1">Account numbers don't match</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.ifscCode}
                                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                                    placeholder="SBIN0001234"
                                    maxLength={11}
                                    className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50 uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                    Bank Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    placeholder="State Bank of India"
                                    className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text py-3 rounded-xl font-medium hover:bg-lime-accent/10 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => {
                                    if (validateBankDetails()) {
                                        setStep(3);
                                    }
                                }}
                                disabled={!formData.accountHolderName || !formData.accountNumber || !formData.confirmAccountNumber || !formData.ifscCode}
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
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Review Withdrawal</h3>

                        <div className="bg-light-glass dark:bg-dark-glass rounded-xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Amount</span>
                                <span className="font-bold text-lime-accent text-xl">
                                    {currencySymbols[selectedWallet?.currency || 'INR']}{parseFloat(formData.amount).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">From Wallet</span>
                                <span className="text-light-text dark:text-dark-text">
                                    {currencyFlags[selectedWallet?.currency || 'INR']} {selectedWallet?.currency}
                                </span>
                            </div>
                            <div className="border-t border-light-border dark:border-dark-border pt-4">
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Bank Details</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Account Holder</span>
                                        <span className="text-light-text dark:text-dark-text">{formData.accountHolderName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Account Number</span>
                                        <span className="text-light-text dark:text-dark-text">****{formData.accountNumber.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">IFSC Code</span>
                                        <span className="text-light-text dark:text-dark-text">{formData.ifscCode}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-light-border dark:border-dark-border pt-4">
                                <div className="flex justify-between">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Fee</span>
                                    <span className="text-lime-accent font-medium">Free</span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Processing Time</span>
                                    <span className="text-light-text dark:text-dark-text">1-3 Business Days</span>
                                </div>
                            </div>
                            <div className="border-t border-light-border dark:border-dark-border pt-4 flex justify-between">
                                <span className="font-bold text-light-text dark:text-dark-text">You'll Receive</span>
                                <span className="font-bold text-lime-accent">
                                    {currencySymbols[selectedWallet?.currency || 'INR']}{parseFloat(formData.amount).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-yellow-500 text-sm">
                                Please verify your bank details carefully. Incorrect details may result in delayed or failed transfers.
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
                                        <Building2 className="w-5 h-5" />
                                        <span>Confirm Withdrawal</span>
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
