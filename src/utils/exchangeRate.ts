// src/utils/exchangeRate.ts
import { PRICING_CONFIG } from './costCalculator';

const STORAGE_CACHE_KEY = 'api_co_id_daily_rate_cache_v2';

export interface ExchangeRateCache {
  date: string; // YYYY-MM-DD
  rate: number;
  updatedAt: string;
  source: 'api.co.id' | 'fallback' | 'cache' | 'sqlite_history';
}

/**
 * Update global rate in PRICING_CONFIG
 */
export function setGlobalUsdToIdrRate(rate: number) {
  if (typeof rate === 'number' && rate > 0) {
    PRICING_CONFIG.USD_TO_IDR_RATE = rate;
  }
}

/**
 * Get cached rate from localStorage
 */
export function getStoredExchangeRate(): ExchangeRateCache | null {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExchangeRateCache;
    if (parsed && typeof parsed.rate === 'number' && parsed.date && parsed.rate > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse exchange rate cache', e);
  }
  return null;
}

/**
 * Save rate to localStorage cache
 */
export function saveExchangeRateCache(data: ExchangeRateCache) {
  try {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save exchange rate cache', e);
  }
}

/**
 * Fetches exchange rate from backend SQLite endpoint (/api/currency/exchange-rate)
 * The backend manages daily persistence to SQLite table `exchange_rates` and daily caching.
 */
export async function getOrFetchDailyExchangeRate(): Promise<ExchangeRateCache> {
  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Ambil dari endpoint server lokal Fastify + SQLite
    const serverRes = await fetch('/api/currency/exchange-rate');
    if (serverRes.ok) {
      const json = await serverRes.json();
      if (json && typeof json.usdToIdr === 'number' && json.usdToIdr > 0) {
        const freshData: ExchangeRateCache = {
          date: json.date || today,
          rate: json.usdToIdr,
          updatedAt: json.updatedAt || new Date().toISOString(),
          source: json.source || 'api.co.id',
        };
        setGlobalUsdToIdrRate(json.usdToIdr);
        saveExchangeRateCache(freshData);
        return freshData;
      }
    }
  } catch (e) {
    // Server belum siap atau offline
  }

  // 2. Direct fetch fallback ke api.co.id jika backend proxy offline
  try {
    const directRes = await fetch('https://use.api.co.id/api/exchange-rates', {
      headers: { Accept: 'application/json' },
    });
    if (directRes.ok) {
      const data = await directRes.json();
      if (data.success && Array.isArray(data.rates)) {
        const usdItem = data.rates.find((r: any) => r.base?.toUpperCase() === 'USD');
        const idrVal = usdItem?.rates?.IDR;
        if (typeof idrVal === 'number' && idrVal > 0) {
          const freshData: ExchangeRateCache = {
            date: today,
            rate: idrVal,
            updatedAt: typeof data.updated_at === 'number' ? new Date(data.updated_at).toISOString() : (data.updated_at || new Date().toISOString()),
            source: 'api.co.id',
          };
          setGlobalUsdToIdrRate(idrVal);
          saveExchangeRateCache(freshData);
          return freshData;
        }
      }
    }
  } catch (directErr) {
    console.warn('[Exchange Rate] Direct fetch fallback error:', directErr);
  }

  // 3. Gunakan cache localStorage jika ada
  const cached = getStoredExchangeRate();
  if (cached && cached.rate > 0) {
    setGlobalUsdToIdrRate(cached.rate);
    return { ...cached, source: 'cache' };
  }

  // 4. Fallback default
  const fallbackRate = PRICING_CONFIG.USD_TO_IDR_RATE || 17500;
  const fallbackData: ExchangeRateCache = {
    date: today,
    rate: fallbackRate,
    updatedAt: new Date().toISOString(),
    source: 'fallback',
  };
  setGlobalUsdToIdrRate(fallbackRate);
  return fallbackData;
}
