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

export interface LiveRateResponse {
    result: string;
    base_code: string;
    rates: Record<string, number>;
    time_last_update_utc: string;
}

// Free exchange rate API (exchangerate-api.com - 1500 free requests/month)
// No API key needed for the free tier
const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest';

// Supported currencies for the app
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD'];

// Popular currency pairs to display
const DISPLAY_PAIRS = [
    { pair: 'EUR/USD', base: 'EUR', target: 'USD' },
    { pair: 'GBP/USD', base: 'GBP', target: 'USD' },
    { pair: 'USD/JPY', base: 'USD', target: 'JPY' },
    { pair: 'USD/INR', base: 'USD', target: 'INR' },
    { pair: 'EUR/GBP', base: 'EUR', target: 'GBP' },
    { pair: 'EUR/INR', base: 'EUR', target: 'INR' },
];

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
        if (rate) {
            return amount * rate;
        }

        // Try reverse rate
        const reverseRate = await this.getRate(toCurrency, fromCurrency);
        if (reverseRate) {
            return amount / reverseRate;
        }

        // Try to compute through USD
        const fromToUsd = await this.getRate(fromCurrency, 'USD');
        const usdToTarget = await this.getRate('USD', toCurrency);
        if (fromToUsd && usdToTarget) {
            return amount * fromToUsd * usdToTarget;
        }

        throw new Error(`Exchange rate not found for ${fromCurrency}/${toCurrency}`);
    },

    /**
     * Fetch live rates from exchangerate-api.com and update database
     */
    async fetchLiveRates(): Promise<{ success: boolean; updated: number; error?: string }> {
        try {
            console.log('Fetching live exchange rates...');

            // Fetch rates for multiple base currencies
            const baseCurrencies = ['USD', 'EUR', 'GBP'];
            const updates: Array<{ base_currency: string; target_currency: string; rate: number }> = [];

            for (const base of baseCurrencies) {
                const response = await fetch(`${EXCHANGE_RATE_API_URL}/${base}`);

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const data: LiveRateResponse = await response.json();

                if (!data.rates) {
                    throw new Error('Invalid response from exchange rate API');
                }

                // Get rates for all supported currencies
                for (const target of SUPPORTED_CURRENCIES) {
                    if (target === base) continue;

                    const rate = data.rates[target];
                    if (rate) {
                        // Calculate simulated 24h stats (for demo purposes)
                        const variance = 0.005; // 0.5% variance
                        const change = (Math.random() - 0.5) * 2 * variance * rate;
                        const changePercent = (change / rate) * 100;

                        updates.push({
                            base_currency: base,
                            target_currency: target,
                            rate: rate,
                        });
                    }
                }
            }

            // Batch upsert all rates
            for (const update of updates) {
                // Get existing rate for comparison
                const { data: existing } = await supabase
                    .from('exchange_rates')
                    .select('rate')
                    .eq('base_currency', update.base_currency)
                    .eq('target_currency', update.target_currency)
                    .single();

                const previousRate = existing?.rate || update.rate;
                const change = update.rate - previousRate;
                const changePercent = previousRate > 0 ? (change / previousRate) * 100 : 0;

                await supabase
                    .from('exchange_rates')
                    .upsert({
                        base_currency: update.base_currency,
                        target_currency: update.target_currency,
                        rate: update.rate,
                        change_24h: change,
                        change_percent_24h: changePercent,
                        high_24h: Math.max(update.rate, previousRate),
                        low_24h: Math.min(update.rate, previousRate),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'base_currency,target_currency' });
            }

            console.log(`✅ Updated ${updates.length} exchange rates`);
            return { success: true, updated: updates.length };

        } catch (error: any) {
            console.error('❌ Failed to fetch live rates:', error);
            return { success: false, updated: 0, error: error.message };
        }
    },

    /**
     * Check if rates need refresh (older than 1 hour)
     */
    async needsRefresh(): Promise<boolean> {
        const lastUpdate = await this.getLastUpdateTime();
        if (!lastUpdate) return true;

        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return lastUpdate < hourAgo;
    },

    /**
     * Get formatted exchange rate pairs for display
     */
    async getDisplayRates(): Promise<ExchangeRatePair[]> {
        // Check if we need to refresh rates
        const needsRefresh = await this.needsRefresh();
        if (needsRefresh) {
            await this.fetchLiveRates();
        }

        const rates = await this.getCachedRates();

        const pairs: ExchangeRatePair[] = DISPLAY_PAIRS.map((p) => {
            const rateData = rates.find(
                (r) => r.base_currency === p.base && r.target_currency === p.target
            );

            const rate = rateData?.rate || 1;
            const change = rateData?.change_24h || 0;
            const changePercent = rateData?.change_percent_24h || 0;
            const high = rateData?.high_24h || rate;
            const low = rateData?.low_24h || rate;

            // Bank rate (typically 2-3% worse than mid-market rate)
            const bankSpread = 0.025; // 2.5%
            const bankRate = rate * (1 - bankSpread);
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
     * Get all available currency rates for a base currency
     */
    async getRatesForCurrency(baseCurrency: string): Promise<Record<string, number>> {
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('target_currency, rate')
            .eq('base_currency', baseCurrency.toUpperCase());

        if (error) throw new Error(error.message);

        const rates: Record<string, number> = {};
        (data || []).forEach((r) => {
            rates[r.target_currency] = r.rate;
        });

        return rates;
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

    /**
     * Get supported currencies
     */
    getSupportedCurrencies(): string[] {
        return SUPPORTED_CURRENCIES;
    },
};
