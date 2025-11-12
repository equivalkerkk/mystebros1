import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, currencyConfig } from '../types/translations';

interface ExchangeRates {
  [key: string]: number;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations[Language];
  currency: { code: string; symbol: string };
  exchangeRates: ExchangeRates;
  convertPrice: (usdPrice: number) => string;
  formatPrice: (price: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const defaultExchangeRates: ExchangeRates = {
  USD: 1,
  TRY: 34.50,
  EUR: 0.92,
  RUB: 92.00,
  SAR: 3.75,
  CNY: 7.24,
  INR: 83.12
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language] = useState<Language>('en'); // Fixed to English only
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(defaultExchangeRates);

  // Language setter kept for compatibility but does nothing
  const setLanguage = (lang: Language) => {
    // No-op: Language is fixed to English
    console.log('⚠️ Language switching is disabled. Using English only.');
  };

  useEffect(() => {
    // Fetch live exchange rates
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(response => response.json())
      .then(data => {
        setExchangeRates(data.rates);
        console.log('✅ Live exchange rates loaded:', data.rates);
      })
      .catch(error => {
        console.warn('⚠️ Failed to fetch live rates, using fallback rates:', error);
      });
  }, []);

  const t = translations[language];
  const currency = currencyConfig[language];

  const convertPrice = (usdPrice: number): string => {
    if (currency.code === 'USD') return usdPrice.toFixed(2);
    const rate = exchangeRates[currency.code];
    if (!rate) return usdPrice.toFixed(2);
    return (usdPrice * rate).toFixed(2);
  };

  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    const currencyCode = currency.code as string;
    if (currencyCode === 'EUR' || currencyCode === 'RUB') {
      return numPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      currency,
      exchangeRates,
      convertPrice,
      formatPrice
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
