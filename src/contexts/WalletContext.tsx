import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { walletService, Wallet, transactionService, Transaction, CreateTransactionInput } from '../services';

interface WalletContextType {
    wallets: Wallet[];
    transactions: Transaction[];
    recurringExpenses: any[];
    loading: boolean;
    error: string | null;
    totalPortfolioValue: number;
    refreshWallets: () => Promise<void>;
    refreshTransactions: () => Promise<void>;
    refreshRecurringExpenses: () => Promise<void>;
    refreshAll: () => Promise<void>;
    createWallet: (currency: string) => Promise<Wallet | null>;
    deposit: (walletId: string, amount: number, description?: string) => Promise<boolean>;
    withdraw: (walletId: string, amount: number, recipient: string, description?: string) => Promise<boolean>;
    getWalletByCurrency: (currency: string) => Wallet | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);

    const refreshWallets = useCallback(async () => {
        try {
            const data = await walletService.getWallets();
            setWallets(data);

            const total = await walletService.getTotalPortfolioValue();
            setTotalPortfolioValue(total);
        } catch (err: any) {
            console.error('Failed to refresh wallets:', err);
            setError(err.message);
        }
    }, []);

    const refreshTransactions = useCallback(async () => {
        try {
            // Fetch more transactions for accurate portfolio calculations
            const data = await transactionService.getRecentTransactions(100);
            setTransactions(data);
        } catch (err: any) {
            console.error('Failed to refresh transactions:', err);
        }
    }, []);

    const refreshRecurringExpenses = useCallback(async () => {
        try {
            const { supabase } = await import('../config/supabase');
            const { data } = await supabase
                .from('recurring_expenses')
                .select('*')
                .eq('is_active', true);
            setRecurringExpenses(data || []);
        } catch (err: any) {
            console.error('Failed to refresh recurring expenses:', err);
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([refreshWallets(), refreshTransactions(), refreshRecurringExpenses()]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [refreshWallets, refreshTransactions, refreshRecurringExpenses]);

    const refreshAll = useCallback(async () => {
        await Promise.all([refreshWallets(), refreshTransactions(), refreshRecurringExpenses()]);
    }, [refreshWallets, refreshTransactions, refreshRecurringExpenses]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const createWallet = async (currency: string): Promise<Wallet | null> => {
        try {
            const wallet = await walletService.createWallet({ currency });
            await refreshWallets();

            // Check for multi_currency achievement (3+ wallets)
            const { achievementService } = await import('../services/achievementService');
            const updatedWallets = await walletService.getWallets();
            if (updatedWallets.length >= 3) {
                await achievementService.unlockAchievement('multi_currency');
            }

            return wallet;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    };

    const deposit = async (walletId: string, amount: number, description?: string): Promise<boolean> => {
        try {
            const wallet = wallets.find(w => w.id === walletId);
            if (!wallet) throw new Error('Wallet not found');

            // Create transaction
            await transactionService.createTransaction({
                wallet_id: walletId,
                type: 'deposit',
                amount: amount,
                currency: wallet.currency,
                description: description || 'Deposit',
                category: 'income',
            });

            // Update wallet balance
            const newBalance = wallet.balance + amount;
            await walletService.updateBalance(walletId, newBalance);

            await refreshWallets();
            await refreshTransactions();
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const withdraw = async (
        walletId: string,
        amount: number,
        recipient: string,
        description?: string
    ): Promise<boolean> => {
        try {
            const wallet = wallets.find(w => w.id === walletId);
            if (!wallet) throw new Error('Wallet not found');
            if (wallet.balance < amount) throw new Error('Insufficient funds');

            // Create transaction
            await transactionService.createTransaction({
                wallet_id: walletId,
                type: 'withdrawal',
                amount: -amount, // Negative for withdrawal
                currency: wallet.currency,
                recipient_name: recipient,
                description: description || 'Withdrawal',
                category: 'other',
            });

            // Update wallet balance
            const newBalance = wallet.balance - amount;
            await walletService.updateBalance(walletId, newBalance);

            await refreshWallets();
            await refreshTransactions();
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const getWalletByCurrency = (currency: string): Wallet | undefined => {
        return wallets.find(w => w.currency === currency);
    };

    return (
        <WalletContext.Provider
            value={{
                wallets,
                transactions,
                recurringExpenses,
                loading,
                error,
                totalPortfolioValue,
                refreshWallets,
                refreshTransactions,
                refreshRecurringExpenses,
                refreshAll,
                createWallet,
                deposit,
                withdraw,
                getWalletByCurrency,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWalletContext = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWalletContext must be used within a WalletProvider');
    }
    return context;
};
