import { useState, useEffect, useCallback } from 'react';
import { exchangeService, ExchangeRatePair } from '../services';

interface UseExchangeRatesReturn {
    rates: ExchangeRatePair[];
    loading: boolean;
    error: string | null;
    lastUpdate: Date | null;
    refreshing: boolean;
    refetch: () => Promise<void>;
    forceRefresh: () => Promise<{ success: boolean; updated: number }>;
    convert: (amount: number, from: string, to: string) => Promise<number>;
    supportedCurrencies: string[];
}

export const useExchangeRates = (): UseExchangeRatesReturn => {
    const [rates, setRates] = useState<ExchangeRatePair[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchRates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await exchangeService.getDisplayRates();
            setRates(data);

            const updateTime = await exchangeService.getLastUpdateTime();
            setLastUpdate(updateTime);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch exchange rates');
        } finally {
            setLoading(false);
        }
    }, []);

    // Force refresh from live API
    const forceRefresh = useCallback(async (): Promise<{ success: boolean; updated: number }> => {
        setRefreshing(true);
        setError(null);
        try {
            const result = await exchangeService.fetchLiveRates();

            if (result.success) {
                // Reload display rates after refresh
                const data = await exchangeService.getDisplayRates();
                setRates(data);

                const updateTime = await exchangeService.getLastUpdateTime();
                setLastUpdate(updateTime);
            } else {
                setError(result.error || 'Failed to refresh rates');
            }

            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to refresh exchange rates');
            return { success: false, updated: 0 };
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();

        // Auto-refresh every 5 minutes
        const interval = setInterval(() => {
            fetchRates();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchRates]);

    const convert = async (amount: number, from: string, to: string): Promise<number> => {
        return exchangeService.convert(amount, from, to);
    };

    return {
        rates,
        loading,
        error,
        lastUpdate,
        refreshing,
        refetch: fetchRates,
        forceRefresh,
        convert,
        supportedCurrencies: exchangeService.getSupportedCurrencies(),
    };
};
