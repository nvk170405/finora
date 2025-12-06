import { useState, useEffect, useCallback } from 'react';
import { walletService, Wallet } from '../services';

interface UseWalletsReturn {
    wallets: Wallet[];
    loading: boolean;
    error: string | null;
    totalValue: number;
    refetch: () => Promise<void>;
    createWallet: (currency: string) => Promise<Wallet | null>;
    setPrimary: (walletId: string) => Promise<void>;
}

export const useWallets = (): UseWalletsReturn => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalValue, setTotalValue] = useState(0);

    const fetchWallets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await walletService.getWallets();
            setWallets(data);

            const total = await walletService.getTotalPortfolioValue();
            setTotalValue(total);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch wallets');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWallets();
    }, [fetchWallets]);

    const createWallet = async (currency: string): Promise<Wallet | null> => {
        try {
            const wallet = await walletService.createWallet({ currency });
            await fetchWallets(); // Refetch to update list
            return wallet;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    };

    const setPrimary = async (walletId: string): Promise<void> => {
        try {
            await walletService.setPrimaryWallet(walletId);
            await fetchWallets();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return {
        wallets,
        loading,
        error,
        totalValue,
        refetch: fetchWallets,
        createWallet,
        setPrimary,
    };
};
