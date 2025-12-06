import { supabase } from '../config/supabase';

export interface UserProfile {
    id: string;
    user_id: string;
    full_name: string | null;
    display_name: string | null;
    phone: string | null;
    location: string | null;
    avatar_url: string | null;
    default_currency: string;
    created_at: string;
    updated_at: string;
}

export interface UserSettings {
    id: string;
    user_id: string;
    notifications_email: boolean;
    notifications_push: boolean;
    notifications_sms: boolean;
    two_factor_enabled: boolean;
    theme: 'light' | 'dark' | 'system';
    created_at: string;
    updated_at: string;
}

export interface UpdateProfileInput {
    full_name?: string;
    display_name?: string;
    phone?: string;
    location?: string;
    avatar_url?: string;
    default_currency?: string;
}

export interface UpdateSettingsInput {
    notifications_email?: boolean;
    notifications_push?: boolean;
    notifications_sms?: boolean;
    two_factor_enabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
}

export const userService = {
    /**
     * Get user profile
     */
    async getProfile(): Promise<UserProfile | null> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return null;

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data;
    },

    /**
     * Create or update user profile
     */
    async upsertProfile(input: UpdateProfileInput): Promise<UserProfile | null> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: user.user.id,
                ...input,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Get user settings
     */
    async getSettings(): Promise<UserSettings | null> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return null;

        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error);
            return null;
        }

        return data;
    },

    /**
     * Create or update user settings
     */
    async upsertSettings(input: UpdateSettingsInput): Promise<UserSettings | null> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: user.user.id,
                ...input,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Get account statistics from transactions
     */
    async getAccountStats(): Promise<{
        totalTransactions: number;
        activeCurrencies: number;
        memberSince: Date | null;
    }> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return { totalTransactions: 0, activeCurrencies: 0, memberSince: null };

        // Get total transactions count
        const { count: txCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.user.id);

        // Get unique currencies from wallets
        const { data: wallets } = await supabase
            .from('wallets')
            .select('currency')
            .eq('user_id', user.user.id);

        const uniqueCurrencies = new Set(wallets?.map(w => w.currency) || []);

        return {
            totalTransactions: txCount || 0,
            activeCurrencies: uniqueCurrencies.size,
            memberSince: user.user.created_at ? new Date(user.user.created_at) : null,
        };
    },

    /**
     * Initialize default profile and settings for new user
     */
    async initializeUserData(): Promise<void> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        // Check if profile exists
        const profile = await this.getProfile();
        if (!profile) {
            await this.upsertProfile({
                full_name: user.user.user_metadata?.full_name || null,
                display_name: user.user.email?.split('@')[0] || null,
                default_currency: 'USD',
            });
        }

        // Check if settings exist
        const settings = await this.getSettings();
        if (!settings) {
            await this.upsertSettings({
                notifications_email: true,
                notifications_push: true,
                notifications_sms: false,
                theme: 'system',
            });
        }
    },
};
