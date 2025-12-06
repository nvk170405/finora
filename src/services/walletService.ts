import { supabase } from '../config/supabase';

export interface Wallet {
    id: string;
    user_id: string;
    currency: string;
    balance: number;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateWalletInput {
    currency: string;
    is_primary?: boolean;
}

export const walletService = {
    /**
     * Get all wallets for the current user
     */
    async getWallets(): Promise<Wallet[]> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.user.id)
            .order('is_primary', { ascending: false })
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Get a single wallet by ID
     */
    async getWallet(walletId: string): Promise<Wallet | null> {
        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('id', walletId)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Get wallet by currency
     */
    async getWalletByCurrency(currency: string): Promise<Wallet | null> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.user.id)
            .eq('currency', currency)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    },

    /**
     * Create a new wallet
     */
    async createWallet(input: CreateWalletInput): Promise<Wallet> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('wallets')
            .insert({
                user_id: user.user.id,
                currency: input.currency.toUpperCase(),
                balance: 0,
                is_primary: input.is_primary || false,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Update wallet balance (internal use)
     */
    async updateBalance(walletId: string, newBalance: number): Promise<Wallet> {
        const { data, error } = await supabase
            .from('wallets')
            .update({
                balance: newBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', walletId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Set a wallet as primary
     */
    async setPrimaryWallet(walletId: string): Promise<void> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        // First, unset all primary wallets
        await supabase
            .from('wallets')
            .update({ is_primary: false })
            .eq('user_id', user.user.id);

        // Then set the selected one as primary
        const { error } = await supabase
            .from('wallets')
            .update({ is_primary: true })
            .eq('id', walletId);

        if (error) throw new Error(error.message);
    },

    /**
     * Delete a wallet (only if balance is 0)
     */
    async deleteWallet(walletId: string): Promise<void> {
        const wallet = await this.getWallet(walletId);
        if (wallet && wallet.balance > 0) {
            throw new Error('Cannot delete wallet with positive balance');
        }

        const { error } = await supabase
            .from('wallets')
            .delete()
            .eq('id', walletId);

        if (error) throw new Error(error.message);
    },

    /**
     * Get total portfolio value in USD
     */
    async getTotalPortfolioValue(): Promise<number> {
        const wallets = await this.getWallets();

        // For now, use simple conversion (will be improved with real exchange rates)
        const usdRates: Record<string, number> = {
            USD: 1,
            EUR: 1.09,
            GBP: 1.26,
            JPY: 0.0067,
        };

        let total = 0;
        for (const wallet of wallets) {
            const rate = usdRates[wallet.currency] || 1;
            total += wallet.balance * rate;
        }

        return Math.round(total * 100) / 100;
    },

    /**
     * Create default wallets for a new user
     */
    async createDefaultWallets(): Promise<Wallet[]> {
        const defaultCurrencies = ['USD', 'EUR', 'GBP'];
        const wallets: Wallet[] = [];

        for (let i = 0; i < defaultCurrencies.length; i++) {
            try {
                const wallet = await this.createWallet({
                    currency: defaultCurrencies[i],
                    is_primary: i === 0, // USD is primary
                });
                wallets.push(wallet);
            } catch (e) {
                // Wallet might already exist, continue
                console.log(`Wallet ${defaultCurrencies[i]} might already exist`);
            }
        }

        return wallets;
    },
};
