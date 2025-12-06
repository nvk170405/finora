import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowRight, Globe, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';

const currencyFlags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
};

export const TransfersPage: React.FC = () => {
    const { wallets, withdraw, refreshWallets } = useWalletContext();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fromWallet: '',
        amount: '',
        recipientName: '',
        recipientEmail: '',
        description: '',
    });

    const selectedWallet = wallets.find(w => w.id === formData.fromWallet);

    const handleSubmit = async () => {
        if (!formData.fromWallet || !formData.amount || !formData.recipientName) {
            setError('Please fill in all required fields');
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

        setLoading(true);
        setError(null);

        try {
            const result = await withdraw(
                formData.fromWallet,
                amount,
                formData.recipientName,
                formData.description || `Transfer to ${formData.recipientName}`
            );

            if (result) {
                setSuccess(true);
                await refreshWallets();
            } else {
                setError('Transfer failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fromWallet: '',
            amount: '',
            recipientName: '',
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
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
                        ${formData.amount} sent to {formData.recipientName}
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
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Transfer funds globally with low fees</p>
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
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">{error}</span>
                    </div>
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
                                className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                            >
                                <option value="">Select a wallet</option>
                                {wallets.map((wallet) => (
                                    <option key={wallet.id} value={wallet.id}>
                                        {currencyFlags[wallet.currency] || '💰'} {wallet.currency} - ${wallet.balance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text-secondary">$</span>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                />
                            </div>
                            {selectedWallet && (
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    Available: ${selectedWallet.balance.toLocaleString()}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.fromWallet || !formData.amount}
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
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Recipient Name</label>
                            <input
                                type="text"
                                value={formData.recipientName}
                                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Recipient Email (Optional)</label>
                            <input
                                type="email"
                                value={formData.recipientEmail}
                                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Description (Optional)</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Payment for services"
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
                                disabled={!formData.recipientName}
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
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Amount</span>
                                <span className="font-bold text-lime-accent text-xl">${parseFloat(formData.amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">From</span>
                                <span className="text-light-text dark:text-dark-text">{selectedWallet?.currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">To</span>
                                <span className="text-light-text dark:text-dark-text">{formData.recipientName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Fee</span>
                                <span className="text-lime-accent">$0.00</span>
                            </div>
                            <div className="border-t border-light-border dark:border-dark-border pt-4 flex justify-between">
                                <span className="font-bold text-light-text dark:text-dark-text">Total</span>
                                <span className="font-bold text-light-text dark:text-dark-text">${parseFloat(formData.amount).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text py-3 rounded-xl font-medium hover:bg-lime-accent/10 transition-all"
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
                                        <span>Send Transfer</span>
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
