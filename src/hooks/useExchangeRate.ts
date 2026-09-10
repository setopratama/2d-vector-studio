// src/hooks/useExchangeRate.ts
import { useState, useEffect } from 'react';
import { getOrFetchDailyExchangeRate, ExchangeRateCache, setGlobalUsdToIdrRate } from '../utils/exchangeRate';
import { PRICING_CONFIG } from '../utils/costCalculator';

export function useExchangeRate() {
  const [exchangeData, setExchangeData] = useState<ExchangeRateCache>(() => ({
    date: new Date().toISOString().split('T')[0],
    rate: PRICING_CONFIG.USD_TO_IDR_RATE,
    updatedAt: new Date().toISOString(),
    source: 'fallback',
  }));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRate() {
      setIsLoading(true);
      try {
        const result = await getOrFetchDailyExchangeRate();
        if (isMounted) {
          setExchangeData(result);
          setGlobalUsdToIdrRate(result.rate);
        }
      } catch (err) {
        console.error('Error in useExchangeRate hook', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRate();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    usdToIdrRate: exchangeData.rate,
    exchangeDate: exchangeData.date,
    updatedAt: exchangeData.updatedAt,
    source: exchangeData.source,
    isLoading,
  };
}
