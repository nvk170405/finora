import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    CreditCard,
    Building,
    Wallet,
    CheckCircle,
    ArrowRight,
    Loader2,
    DollarSign
} from 'lucide-react';
import { useWalletContext } from '../contexts/WalletContext';

const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
};

const currencyFlags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
};

const depositMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, fee: '2.9%', time: 'Instant' },
    { id: 'bank', name: 'Bank Transfer', icon: Building, fee: 'Free', time: '1-3 days' },
    { id: 'wallet', name: 'External Wallet', icon: Wallet, fee: '1%', time: 'Instant' },
];

const quickAmounts = [100, 250, 500, 1000, 2500, 5000];

export const DepositPage: React.FC = () => {
    const { wallets, deposit, refreshWallets } = useWalletContext();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        walletId: '',
        amount: '',
        method: 'card',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
    });

    const selectedWallet = wallets.find(w => w.id === formData.walletId);
    const selectedMethod = depositMethods.find(m => m.id === formData.method);

    const handleDeposit = async () => {
        if (!formData.walletId || !formData.amount) return;

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) return;

        setLoading(true);
        try {
            const result = await deposit(
                formData.walletId,
                amount,
                `Deposit via ${selectedMethod?.name || 'Card'}`
            );

            if (result) {
                setSuccess(true);
                await refreshWallets();
            }
        } catch (err) {
            console.error('Deposit failed:', err);
            alert('Deposit failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            walletId: '',
            amount: '',
            method: 'card',
            cardNumber: '',
            cardExpiry: '',
            cardCvc: '',
        });
        setStep(1);
        setSuccess(false);
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
                        {currencySymbols[selectedWallet?.currency || 'USD']}{parseFloat(formData.amount).toLocaleString()} added to your {selectedWallet?.currency} wallet
                    </p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-8">
                        New balance: {currencySymbols[selectedWallet?.currency || 'USD']}{((selectedWallet?.balance || 0) + parseFloat(formData.amount)).toLocaleString()}
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
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Deposit money into your wallets</p>
            </motion.div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-lime-accent text-dark-base' : 'bg-light-glass dark:bg-dark-glass text-light-text-secondary'
                                }`}
                        >
                            {s}
                        </div>
                        {s < 3 && (
                            <div className={`w-16 h-1 mx-2 transition-all ${step > s ? 'bg-lime-accent' : 'bg-light-glass dark:bg-dark-glass'}`} />
                        )}
                    </div>
                ))}
            </div>

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
                            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-3">Amount</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
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
                                        ${amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.walletId || !formData.amount || parseFloat(formData.amount) <= 0}
                            className="w-full bg-lime-accent text-light-base dark:text-dark-base py-4 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <span>Continue</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Payment Method</h3>

                        <div className="space-y-3">
                            {depositMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setFormData({ ...formData, method: method.id })}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${formData.method === method.id
                                                ? 'border-lime-accent bg-lime-accent/10'
                                                : 'border-light-border dark:border-dark-border hover:border-lime-accent/50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-lg ${formData.method === method.id ? 'bg-lime-accent/20' : 'bg-light-glass dark:bg-dark-glass'}`}>
                                                <Icon className={`w-6 h-6 ${formData.method === method.id ? 'text-lime-accent' : 'text-light-text dark:text-dark-text'}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-light-text dark:text-dark-text">{method.name}</p>
                                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{method.time}</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-medium ${method.fee === 'Free' ? 'text-lime-accent' : 'text-light-text-secondary'}`}>
                                            {method.fee}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Card Details (for card method) */}
                        {formData.method === 'card' && (
                            <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                                <div>
                                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Card Number</label>
                                    <input
                                        type="text"
                                        value={formData.cardNumber}
                                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                        placeholder="4242 4242 4242 4242"
                                        className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Expiry</label>
                                        <input
                                            type="text"
                                            value={formData.cardExpiry}
                                            onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">CVC</label>
                                        <input
                                            type="text"
                                            value={formData.cardCvc}
                                            onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                            placeholder="123"
                                            className="w-full px-4 py-3 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text py-3 rounded-xl font-medium hover:bg-lime-accent/10 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all flex items-center justify-center space-x-2"
                            >
                                <span>Review</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Review & Confirm */}
                {step === 3 && (
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
                                    {currencySymbols[selectedWallet?.currency || 'USD']}{parseFloat(formData.amount).toLocaleString()}
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
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Method</span>
                                <span className="text-light-text dark:text-dark-text">{selectedMethod?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">Fee</span>
                                <span className={selectedMethod?.fee === 'Free' ? 'text-lime-accent' : 'text-light-text dark:text-dark-text'}>
                                    {selectedMethod?.fee === 'Free' ? 'Free' : selectedMethod?.fee}
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
                                        {currencySymbols[selectedWallet?.currency || 'USD']}{((selectedWallet?.balance || 0) + parseFloat(formData.amount)).toLocaleString()}
                                    </span>
                                </div>
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
                                onClick={handleDeposit}
                                disabled={loading}
                                className="flex-1 bg-lime-accent text-light-base dark:text-dark-base py-3 rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        <span>Confirm Deposit</span>
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
