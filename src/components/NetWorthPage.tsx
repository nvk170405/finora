import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Minus, TrendingUp, TrendingDown, Building2, Car,
    CreditCard, GraduationCap, Heart, DollarSign, PiggyBank,
    Briefcase, Gem, Home, X, Trash2
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { CountingNumber } from './ui/AnimatedNumber';
import { PremiumGate } from './PremiumGate';

interface Asset {
    id: string;
    name: string;
    category: string;
    current_value: number;
    currency: string;
    notes?: string;
}

interface Liability {
    id: string;
    name: string;
    category: string;
    remaining_amount: number;
    interest_rate?: number;
    currency: string;
    monthly_payment?: number;
    notes?: string;
}

const assetCategories = [
    { value: 'cash', label: 'Cash & Savings', icon: PiggyBank, color: 'text-green-500' },
    { value: 'investments', label: 'Investments', icon: TrendingUp, color: 'text-blue-500' },
    { value: 'retirement', label: 'Retirement', icon: Briefcase, color: 'text-purple-500' },
    { value: 'real_estate', label: 'Real Estate', icon: Home, color: 'text-orange-500' },
    { value: 'vehicles', label: 'Vehicles', icon: Car, color: 'text-cyan-500' },
    { value: 'valuables', label: 'Valuables', icon: Gem, color: 'text-pink-500' },
    { value: 'business', label: 'Business', icon: Building2, color: 'text-yellow-500' },
    { value: 'other_asset', label: 'Other', icon: DollarSign, color: 'text-gray-500' },
];

const liabilityCategories = [
    { value: 'mortgage', label: 'Mortgage', icon: Home, color: 'text-red-500' },
    { value: 'car_loan', label: 'Car Loan', icon: Car, color: 'text-red-400' },
    { value: 'student_loan', label: 'Student Loan', icon: GraduationCap, color: 'text-orange-500' },
    { value: 'personal_loan', label: 'Personal Loan', icon: DollarSign, color: 'text-yellow-500' },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard, color: 'text-purple-500' },
    { value: 'taxes', label: 'Taxes', icon: Building2, color: 'text-blue-500' },
    { value: 'medical', label: 'Medical Bills', icon: Heart, color: 'text-pink-500' },
    { value: 'other_debt', label: 'Other Debt', icon: Minus, color: 'text-gray-500' },
];

export const NetWorthPage: React.FC = () => {
    const { user } = useAuth();
    const { currencySymbol, defaultCurrency } = usePreferences();

    const [assets, setAssets] = useState<Asset[]>([]);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [modalType, setModalType] = useState<'asset' | 'liability'>('asset');
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        value: '',
        interest_rate: '',
        monthly_payment: '',
        notes: ''
    });

    // Fetch assets and liabilities
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [assetsRes, liabilitiesRes] = await Promise.all([
                supabase.from('user_assets').select('*').eq('user_id', user.id),
                supabase.from('user_liabilities').select('*').eq('user_id', user.id)
            ]);

            if (assetsRes.data) setAssets(assetsRes.data);
            if (liabilitiesRes.data) setLiabilities(liabilitiesRes.data);
        } catch (err) {
            console.error('Error fetching net worth data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totals = useMemo(() => {
        const totalAssets = assets.reduce((sum, a) => sum + (a.current_value || 0), 0);
        const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.remaining_amount || 0), 0);
        const netWorth = totalAssets - totalLiabilities;

        // Group by category
        const assetsByCategory = assetCategories.map(cat => ({
            ...cat,
            total: assets.filter(a => a.category === cat.value).reduce((sum, a) => sum + (a.current_value || 0), 0)
        })).filter(c => c.total > 0);

        const liabilitiesByCategory = liabilityCategories.map(cat => ({
            ...cat,
            total: liabilities.filter(l => l.category === cat.value).reduce((sum, l) => sum + (l.remaining_amount || 0), 0)
        })).filter(c => c.total > 0);

        return { totalAssets, totalLiabilities, netWorth, assetsByCategory, liabilitiesByCategory };
    }, [assets, liabilities]);

    const handleAdd = async () => {
        if (!formData.name || !formData.value || !formData.category || !user) return;

        setSaving(true);
        try {
            if (modalType === 'asset') {
                await supabase.from('user_assets').insert({
                    user_id: user.id,
                    name: formData.name,
                    category: formData.category,
                    current_value: parseFloat(formData.value),
                    currency: defaultCurrency,
                    notes: formData.notes
                });
            } else {
                await supabase.from('user_liabilities').insert({
                    user_id: user.id,
                    name: formData.name,
                    category: formData.category,
                    total_amount: parseFloat(formData.value),
                    remaining_amount: parseFloat(formData.value),
                    interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
                    monthly_payment: formData.monthly_payment ? parseFloat(formData.monthly_payment) : null,
                    currency: defaultCurrency,
                    notes: formData.notes
                });
            }

            setShowAddModal(false);
            setFormData({ name: '', category: '', value: '', interest_rate: '', monthly_payment: '', notes: '' });
            await fetchData();
        } catch (err) {
            console.error('Error adding:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, type: 'asset' | 'liability') => {
        if (!confirm('Are you sure you want to delete this?')) return;

        try {
            const table = type === 'asset' ? 'user_assets' : 'user_liabilities';
            await supabase.from(table).delete().eq('id', id);
            await fetchData();
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
            </div>
        );
    }

    return (
        <PremiumGate
            feature="networth"
            requiredPlan="premium"
            title="Net Worth Tracking"
            description="Track your assets and liabilities to calculate your net worth. Upgrade to premium to unlock this feature."
        >
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
                        📊 Net Worth Calculator
                    </h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Track your assets and liabilities
                    </p>
                </motion.div>

                {/* Net Worth Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-lime-accent/20 via-green-500/20 to-blue-500/20 border border-lime-accent/30 rounded-2xl p-6"
                >
                    <div className="text-center mb-6">
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide mb-2">
                            Your Estimated Net Worth
                        </p>
                        <p className={`text-5xl font-bold ${totals.netWorth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totals.netWorth >= 0 ? '' : '-'}
                            <CountingNumber value={Math.abs(totals.netWorth)} prefix={currencySymbol} duration={2} />
                        </p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
                            Total Assets - Total Liabilities
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/10 dark:bg-black/20 rounded-xl p-4">
                            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                            <p className="text-lg font-bold text-green-500">
                                <CountingNumber value={totals.totalAssets} prefix={currencySymbol} />
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Total Assets</p>
                        </div>
                        <div className="bg-white/10 dark:bg-black/20 rounded-xl p-4">
                            <Minus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-lg font-bold text-gray-400">-</p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Minus</p>
                        </div>
                        <div className="bg-white/10 dark:bg-black/20 rounded-xl p-4">
                            <TrendingDown className="w-6 h-6 text-red-500 mx-auto mb-2" />
                            <p className="text-lg font-bold text-red-500">
                                <CountingNumber value={totals.totalLiabilities} prefix={currencySymbol} />
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Total Liabilities</p>
                        </div>
                    </div>
                </motion.div>

                {/* Add Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setModalType('asset'); setFormData({ ...formData, category: 'cash' }); setShowAddModal(true); }}
                        className="flex items-center justify-center space-x-2 p-4 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all"
                    >
                        <Plus className="w-5 h-5 text-green-500" />
                        <span className="font-bold text-green-500">Add Asset</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setModalType('liability'); setFormData({ ...formData, category: 'personal_loan' }); setShowAddModal(true); }}
                        className="flex items-center justify-center space-x-2 p-4 bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all"
                    >
                        <Minus className="w-5 h-5 text-red-500" />
                        <span className="font-bold text-red-500">Add Liability</span>
                    </motion.button>
                </motion.div>

                {/* Assets Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-xl font-bold text-green-500 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Assets (What You Own)
                    </h3>

                    {assets.length === 0 ? (
                        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 text-center">
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">No assets added yet. Add your first asset!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {assets.map(asset => {
                                const cat = assetCategories.find(c => c.value === asset.category);
                                const Icon = cat?.icon || DollarSign;
                                return (
                                    <motion.div
                                        key={asset.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg bg-green-500/20`}>
                                                <Icon className={`w-5 h-5 ${cat?.color || 'text-green-500'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-light-text dark:text-dark-text">{asset.name}</p>
                                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{cat?.label}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <p className="font-bold text-green-500">{currencySymbol}{asset.current_value.toLocaleString()}</p>
                                            <button
                                                onClick={() => handleDelete(asset.id, 'asset')}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/20 rounded transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Liabilities Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2" />
                        Liabilities (What You Owe)
                    </h3>

                    {liabilities.length === 0 ? (
                        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6 text-center">
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">No liabilities added yet. That's good! 🎉</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {liabilities.map(liability => {
                                const cat = liabilityCategories.find(c => c.value === liability.category);
                                const Icon = cat?.icon || Minus;
                                return (
                                    <motion.div
                                        key={liability.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg bg-red-500/20`}>
                                                <Icon className={`w-5 h-5 ${cat?.color || 'text-red-500'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-light-text dark:text-dark-text">{liability.name}</p>
                                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                    {cat?.label}
                                                    {liability.interest_rate && ` • ${liability.interest_rate}% APR`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <p className="font-bold text-red-500">-{currencySymbol}{liability.remaining_amount.toLocaleString()}</p>
                                            <button
                                                onClick={() => handleDelete(liability.id, 'liability')}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/20 rounded transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Add Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowAddModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                className="bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className={`text-xl font-bold ${modalType === 'asset' ? 'text-green-500' : 'text-red-500'}`}>
                                        {modalType === 'asset' ? '➕ Add Asset' : '➖ Add Liability'}
                                    </h3>
                                    <button onClick={() => setShowAddModal(false)}>
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder={modalType === 'asset' ? 'e.g., Savings Account, My Car' : 'e.g., Home Loan, Credit Card'}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                        >
                                            {(modalType === 'asset' ? assetCategories : liabilityCategories).map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                            {modalType === 'asset' ? 'Current Value' : 'Amount Owed'}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                                            <input
                                                type="number"
                                                value={formData.value}
                                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                                placeholder="0"
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                            />
                                        </div>
                                    </div>

                                    {modalType === 'liability' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Interest Rate (% APR)</label>
                                                <input
                                                    type="number"
                                                    value={formData.interest_rate}
                                                    onChange={e => setFormData({ ...formData, interest_rate: e.target.value })}
                                                    placeholder="e.g., 12.5"
                                                    step="0.1"
                                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Monthly Payment</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                                                    <input
                                                        type="number"
                                                        value={formData.monthly_payment}
                                                        onChange={e => setFormData({ ...formData, monthly_payment: e.target.value })}
                                                        placeholder="0"
                                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <button
                                        onClick={handleAdd}
                                        disabled={saving || !formData.name || !formData.value}
                                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 ${modalType === 'asset'
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                            }`}
                                    >
                                        {saving ? 'Saving...' : `Add ${modalType === 'asset' ? 'Asset' : 'Liability'}`}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PremiumGate>
    );
};
