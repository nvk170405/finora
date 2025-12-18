import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Check, X, Trash2, ShoppingBag, Timer, DollarSign } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ImpulseItem {
    id: string;
    name: string;
    price: number;
    currency: string;
    category: string;
    notes: string;
    timer_hours: number;
    created_at: string;
    unlock_at: string;
    status: 'waiting' | 'approved' | 'rejected';
}

const categories = ['Electronics', 'Clothing', 'Food', 'Entertainment', 'Home', 'Other'];

export const ImpulseWishlist: React.FC = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<ImpulseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        currency: 'USD',
        category: 'Other',
        notes: '',
        timer_hours: 24,
    });
    const [, setTick] = useState(0);

    // Force re-render every minute for countdown
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user) fetchItems();
    }, [user]);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('impulse_items')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            console.error('Error fetching impulse items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.name || !newItem.price) return;

        const unlockAt = new Date();
        unlockAt.setHours(unlockAt.getHours() + newItem.timer_hours);

        try {
            const { error } = await supabase.from('impulse_items').insert({
                user_id: user?.id,
                name: newItem.name,
                price: parseFloat(newItem.price),
                currency: newItem.currency,
                category: newItem.category,
                notes: newItem.notes,
                timer_hours: newItem.timer_hours,
                unlock_at: unlockAt.toISOString(),
                status: 'waiting',
            });

            if (error) throw error;
            setShowAddModal(false);
            setNewItem({ name: '', price: '', currency: 'USD', category: 'Other', notes: '', timer_hours: 24 });
            fetchItems();
        } catch (err) {
            console.error('Error adding item:', err);
        }
    };

    const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('impulse_items')
                .update({ status: decision })
                .eq('id', id);

            if (error) throw error;
            fetchItems();
        } catch (err) {
            console.error('Error updating item:', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('impulse_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchItems();
        } catch (err) {
            console.error('Error deleting item:', err);
        }
    };

    const getTimeRemaining = (unlockAt: string): { hours: number; minutes: number; isReady: boolean } => {
        const now = new Date().getTime();
        const unlock = new Date(unlockAt).getTime();
        const diff = unlock - now;

        if (diff <= 0) return { hours: 0, minutes: 0, isReady: true };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes, isReady: false };
    };

    const waitingItems = items.filter(i => i.status === 'waiting');
    const decidedItems = items.filter(i => i.status !== 'waiting');
    const totalSaved = items
        .filter(i => i.status === 'rejected')
        .reduce((sum, i) => sum + i.price, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-accent"></div>
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
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
                        Impulse Timer
                    </h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Add a 24hr delay before buying — avoid regret purchases
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-lime-accent text-gray-900 rounded-xl font-medium hover:shadow-glow transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Item</span>
                </motion.button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Timer className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Waiting</p>
                            <p className="text-2xl font-bold text-light-text dark:text-dark-text">{waitingItems.length}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Money Saved</p>
                            <p className="text-2xl font-bold text-green-500">${totalSaved.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Items</p>
                            <p className="text-2xl font-bold text-light-text dark:text-dark-text">{items.length}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Waiting Items */}
            {waitingItems.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                        Cooling Off ({waitingItems.length})
                    </h3>
                    <div className="grid gap-4">
                        {waitingItems.map((item, index) => {
                            const time = getTimeRemaining(item.unlock_at);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                                <ShoppingBag className="w-6 h-6 text-yellow-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-light-text dark:text-dark-text">
                                                    {item.name}
                                                </h4>
                                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                    {item.category} • ${item.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            {!time.isReady ? (
                                                <div className="text-center px-4">
                                                    <div className="text-2xl font-bold text-yellow-500">
                                                        {time.hours}h {time.minutes}m
                                                    </div>
                                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                        until decision
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDecision(item.id, 'approved')}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center space-x-1"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        <span>Buy It</span>
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDecision(item.id, 'rejected')}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center space-x-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>Skip</span>
                                                    </motion.button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Past Decisions */}
            {decidedItems.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
                        Past Decisions ({decidedItems.length})
                    </h3>
                    <div className="grid gap-2">
                        {decidedItems.slice(0, 5).map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between p-4 rounded-xl border ${item.status === 'approved'
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-red-500/10 border-red-500/30'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    {item.status === 'approved' ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <X className="w-5 h-5 text-red-500" />
                                    )}
                                    <span className="text-light-text dark:text-dark-text">{item.name}</span>
                                </div>
                                <span className={item.status === 'approved' ? 'text-green-500' : 'text-red-500'}>
                                    ${item.price.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-12 text-center"
                >
                    <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No Impulse Items</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                        Add items you want to buy and wait 24 hours before deciding
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-lime-accent text-gray-900 rounded-xl font-medium hover:shadow-glow transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add First Item</span>
                    </button>
                </motion.div>
            )}

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
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                                Add Impulse Item
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        What do you want to buy?
                                    </label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        placeholder="e.g., New Headphones"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                            Price
                                        </label>
                                        <input
                                            type="number"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            placeholder="99.99"
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={newItem.category}
                                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-lime-accent/50"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                                        Cooling Off Period
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[24, 48, 72].map(hours => (
                                            <button
                                                key={hours}
                                                type="button"
                                                onClick={() => setNewItem({ ...newItem, timer_hours: hours })}
                                                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${newItem.timer_hours === hours
                                                        ? 'bg-lime-accent text-gray-900'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {hours}h
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAdd}
                                    className="w-full bg-lime-accent text-gray-900 py-3 rounded-xl font-medium hover:shadow-glow transition-all flex items-center justify-center space-x-2"
                                >
                                    <Timer className="w-5 h-5" />
                                    <span>Start Timer</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
