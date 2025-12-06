import { useState, useEffect, useCallback } from 'react';
import { transactionService, Transaction } from '../services';

interface UseTransactionsReturn {
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    getRelativeTime: (dateString: string) => string;
}

export const useTransactions = (limit = 10): UseTransactionsReturn => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await transactionService.getRecentTransactions(limit);
            setTransactions(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        loading,
        error,
        refetch: fetchTransactions,
        getRelativeTime: transactionService.formatRelativeTime,
    };
};
