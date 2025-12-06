import { supabase } from '../config/supabase';

export interface ExchangeRate {
    id: string;
    base_currency: string;
    target_currency: string;
    rate: number;
    high_24h: number | null;
    low_24h: number | null;
    change_24h: number | null;
    change_percent_24h: number | null;
    updated_at: string;
}

export interface ExchangeRatePair {
    pair: string;
    rate: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    bankRate: number;
    spread: number;
}

// Free exchange rate API (exchangerate-api.com - 1500 free requests/month)
const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest';

export const exchangeService = {
    /**
     * Get all cached exchange rates from database
     */
    async getCachedRates(): Promise<ExchangeRate[]> {
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('*')
            .order('base_currency', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Get exchange rate for a specific pair
     */
    async getRate(baseCurrency: string, targetCurrency: string): Promise<number | null> {
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('rate')
            .eq('base_currency', baseCurrency.toUpperCase())
            .eq('target_currency', targetCurrency.toUpperCase())
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data?.rate || null;
    },

    /**
     * Convert amount between currencies
     */
    async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
        if (fromCurrency === toCurrency) return amount;

        const rate = await this.getRate(fromCurrency, toCurrency);
        if (!rate) {
            // Try reverse rate
            const reverseRate = await this.getRate(toCurrency, fromCurrency);
            if (reverseRate) {
                return amount / reverseRate;
            }
            throw new Error(`Exchange rate not found for ${fromCurrency}/${toCurrency}`);
        }

        return amount * rate;
    },

    /**
     * Fetch live rates from external API and update cache
     */
    async fetchLiveRates(baseCurrency = 'USD'): Promise<void> {
        try {
            const response = await fetch(`${EXCHANGE_RATE_API_URL}/${baseCurrency}`);
            const data = await response.json();

            if (!data.rates) {
                throw new Error('Invalid response from exchange rate API');
            }

            const currencies = ['EUR', 'GBP', 'JPY', 'USD'];
            const updates: Partial<ExchangeRate>[] = [];

            for (const target of currencies) {
                if (target === baseCurrency) continue;

                const rate = data.rates[target];
                if (rate) {
                    updates.push({
                        base_currency: baseCurrency,
                        target_currency: target,
                        rate: rate,
                        updated_at: new Date().toISOString(),
                    });
                }
            }

            // Upsert rates
            for (const update of updates) {
                await supabase
                    .from('exchange_rates')
                    .upsert(update, { onConflict: 'base_currency,target_currency' });
            }

            console.log(`Updated ${updates.length} exchange rates`);
        } catch (error) {
            console.error('Failed to fetch live rates:', error);
            throw error;
        }
    },

    /**
     * Get formatted exchange rate pairs for display
     */
    async getDisplayRates(): Promise<ExchangeRatePair[]> {
        const rates = await this.getCachedRates();

        const pairs: ExchangeRatePair[] = [
            { pair: 'EUR/USD', base: 'EUR', target: 'USD' },
            { pair: 'GBP/USD', base: 'GBP', target: 'USD' },
            { pair: 'USD/JPY', base: 'USD', target: 'JPY' },
            { pair: 'EUR/GBP', base: 'EUR', target: 'GBP' },
        ].map((p) => {
            const rateData = rates.find(
                (r) => r.base_currency === p.base && r.target_currency === p.target
            );

            const rate = rateData?.rate || 1;
            const change = rateData?.change_24h || 0;
            const changePercent = rateData?.change_percent_24h || 0;
            const high = rateData?.high_24h || rate;
            const low = rateData?.low_24h || rate;

            // Simulate bank rate (typically worse by 0.3-0.5%)
            const bankRate = rate * 0.995;
            const spread = rate - bankRate;

            return {
                pair: p.pair,
                rate,
                change,
                changePercent,
                high,
                low,
                bankRate,
                spread,
            };
        });

        return pairs;
    },

    /**
     * Get last update time
     */
    async getLastUpdateTime(): Promise<Date | null> {
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('updated_at')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data ? new Date(data.updated_at) : null;
    },
};
