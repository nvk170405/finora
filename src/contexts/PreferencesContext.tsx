import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services';

interface PreferencesContextType {
    defaultCurrency: string;
    setDefaultCurrency: (currency: string) => void;
    displayName: string;
    setDisplayName: (name: string) => void;
    loading: boolean;
    currencySymbol: string;
    currencyFlag: string;
}

const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
};

const currencyFlags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
    INR: '🇮🇳',
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [defaultCurrency, setDefaultCurrencyState] = useState('USD');
    const [displayName, setDisplayNameState] = useState('');
    const [loading, setLoading] = useState(true);

    // Load user preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            // First check localStorage for quick loading
            const savedCurrency = localStorage.getItem('finora_default_currency');
            if (savedCurrency) {
                setDefaultCurrencyState(savedCurrency);
            }

            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const profile = await userService.getProfile();
                if (profile?.default_currency) {
                    setDefaultCurrencyState(profile.default_currency);
                    localStorage.setItem('finora_default_currency', profile.default_currency);
                }
                // Load display name from profile
                const name = profile?.display_name || user?.email?.split('@')[0] || '';
                setDisplayNameState(name);
                localStorage.setItem('finora_display_name', name);
            } catch (err) {
                console.error('Error loading preferences:', err);
                // Fallback to email
                setDisplayNameState(user?.email?.split('@')[0] || '');
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, [user]);

    const setDefaultCurrency = useCallback(async (currency: string) => {
        setDefaultCurrencyState(currency);
        localStorage.setItem('finora_default_currency', currency);

        // Also save to database
        try {
            await userService.upsertProfile({ default_currency: currency });
        } catch (err) {
            console.error('Error saving currency preference:', err);
        }
    }, []);

    const setDisplayName = useCallback(async (name: string) => {
        setDisplayNameState(name);
        localStorage.setItem('finora_display_name', name);

        // Also save to database
        try {
            await userService.upsertProfile({ display_name: name });
        } catch (err) {
            console.error('Error saving display name:', err);
        }
    }, []);

    const currencySymbol = currencySymbols[defaultCurrency] || '$';
    const currencyFlag = currencyFlags[defaultCurrency] || '💰';

    return (
        <PreferencesContext.Provider value={{
            defaultCurrency,
            setDefaultCurrency,
            displayName,
            setDisplayName,
            loading,
            currencySymbol,
            currencyFlag,
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};

// Export symbols and flags for use in components
export { currencySymbols, currencyFlags };
