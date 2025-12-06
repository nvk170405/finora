import { supabase } from '../config/supabase';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'exchange';
export type TransactionCategory = 'business' | 'income' | 'travel' | 'shopping' | 'food' | 'entertainment' | 'utilities' | 'other';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
    id: string;
    user_id: string;
    wallet_id: string;
    type: TransactionType;
    amount: number;
    currency: string;
    fee: number;
    recipient_name: string | null;
    recipient_location: string | null;
    description: string | null;
    category: TransactionCategory | null;
    status: TransactionStatus;
    reference_id: string | null;
    created_at: string;
}

export interface CreateTransactionInput {
    wallet_id: string;
    type: TransactionType;
    amount: number;
    currency: string;
    fee?: number;
    recipient_name?: string;
    recipient_location?: string;
    description?: string;
    category?: TransactionCategory;
}

export const transactionService = {
    /**
     * Get all transactions for the current user
     */
    async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Get transactions for a specific wallet
     */
    async getWalletTransactions(walletId: string, limit = 20): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('wallet_id', walletId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Get recent transactions (last 7 days)
     */
    async getRecentTransactions(limit = 10): Promise<Transaction[]> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.user.id)
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Create a new transaction
     */
    async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: user.user.id,
                wallet_id: input.wallet_id,
                type: input.type,
                amount: input.amount,
                currency: input.currency,
                fee: input.fee || 0,
                recipient_name: input.recipient_name || null,
                recipient_location: input.recipient_location || null,
                description: input.description || null,
                category: input.category || 'other',
                status: 'completed',
                reference_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Get transaction by ID
     */
    async getTransaction(transactionId: string): Promise<Transaction | null> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Get transactions by category
     */
    async getTransactionsByCategory(category: TransactionCategory): Promise<Transaction[]> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.user.id)
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Get monthly spending summary
     */
    async getMonthlySummary(): Promise<{ income: number; expenses: number }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const firstOfMonth = new Date();
        firstOfMonth.setDate(1);
        firstOfMonth.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('transactions')
            .select('type, amount')
            .eq('user_id', user.user.id)
            .gte('created_at', firstOfMonth.toISOString());

        if (error) throw new Error(error.message);

        let income = 0;
        let expenses = 0;

        (data || []).forEach((tx) => {
            if (tx.type === 'deposit' || tx.type === 'transfer_in') {
                income += Math.abs(tx.amount);
            } else if (tx.type === 'withdrawal' || tx.type === 'transfer_out') {
                expenses += Math.abs(tx.amount);
            }
        });

        return { income, expenses };
    },

    /**
     * Format relative time for transaction display
     */
    formatRelativeTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    },
};
