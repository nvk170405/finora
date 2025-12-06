import { useState, useEffect, useCallback } from 'react';
import { exchangeService, ExchangeRatePair } from '../services';

interface UseExchangeRatesReturn {
    rates: ExchangeRatePair[];
    loading: boolean;
    error: string | null;
    lastUpdate: Date | null;
    refetch: () => Promise<void>;
    convert: (amount: number, from: string, to: string) => Promise<number>;
}

export const useExchangeRates = (): UseExchangeRatesReturn => {
    const [rates, setRates] = useState<ExchangeRatePair[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    const convert = async (amount: number, from: string, to: string): Promise<number> => {
        return exchangeService.convert(amount, from, to);
    };

    return {
        rates,
        loading,
        error,
        lastUpdate,
        refetch: fetchRates,
        convert,
    };
};
