// server/services/currency.service.ts
import { db } from '../db/client';
import { exchangeRates } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export interface ExchangeRateResponse {
  success: boolean;
  updated_at?: string | number;
  rates?: Array<{
    base: string;
    rates: Record<string, number>;
  }>;
}

export interface CachedRateData {
  date: string; // YYYY-MM-DD
  usdToIdr: number;
  updatedAt: string;
  source: 'api.co.id' | 'fallback' | 'cache' | 'sqlite_history';
}

export async function fetchDailyExchangeRate(): Promise<CachedRateData> {
  const today = new Date().toISOString().split('T')[0];
  const fallbackRate = parseFloat(process.env.USD_TO_IDR_RATE || '17500');

  // 1. Cek apakah kurs hari ini sudah pernah disimpan di SQLite
  try {
    const existingForToday = db
      .select()
      .from(exchangeRates)
      .where(eq(exchangeRates.date, today))
      .orderBy(desc(exchangeRates.fetchedAt))
      .get();

    if (existingForToday && typeof existingForToday.rate === 'number' && existingForToday.rate > 0) {
      return {
        date: existingForToday.date,
        usdToIdr: existingForToday.rate,
        updatedAt: existingForToday.updatedAt,
        source: 'cache',
      };
    }
  } catch (dbErr) {
    console.warn('[Currency Service] Warning saat membaca SQLite:', dbErr);
  }

  // 2. Jika belum ada untuk hari ini, fetch dari API (api.co.id)
  const isEnabled = process.env.ENABLE_DYNAMIC_EXCHANGE_RATE !== 'false';
  if (!isEnabled) {
    return {
      date: today,
      usdToIdr: fallbackRate,
      updatedAt: new Date().toISOString(),
      source: 'fallback',
    };
  }

  const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://use.api.co.id/api/exchange-rates';
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error from exchange rate API: ${response.status}`);
    }

    const data: any = await response.json();

    if (data.success && Array.isArray(data.rates)) {
      const usdEntry = data.rates.find((r: any) => r.base?.toUpperCase() === 'USD');
      const idrRate = usdEntry?.rates?.IDR;

      if (typeof idrRate === 'number' && idrRate > 0) {
        let updatedIso = new Date().toISOString();
        if (typeof data.updated_at === 'number') {
          updatedIso = new Date(data.updated_at).toISOString();
        } else if (typeof data.updated_at === 'string') {
          updatedIso = data.updated_at;
        }

        const now = Date.now();
        const recordId = `rate_${today}_${now.toString(36)}`;

        // SIMPAN KE SQLITE SEBAGAI LOG HISTORIS PER HARI (APPEND, TIDAK OVERWRITE HARI-HARI SEBELUMNYA)
        try {
          db.insert(exchangeRates)
            .values({
              id: recordId,
              date: today,
              baseCurrency: 'USD',
              targetCurrency: 'IDR',
              rate: idrRate,
              source: 'api.co.id',
              updatedAt: updatedIso,
              fetchedAt: now,
            })
            .run();
          console.log(`[Currency Service] Kurs hari ini (${today}) berhasil disimpan ke SQLite: 1 USD = Rp ${idrRate.toLocaleString('id-ID')}`);
        } catch (insertErr) {
          console.error('[Currency Service] Gagal insert kurs ke SQLite:', insertErr);
        }

        return {
          date: today,
          usdToIdr: idrRate,
          updatedAt: updatedIso,
          source: 'api.co.id',
        };
      }
    }

    throw new Error('Could not find USD to IDR rate in API response');
  } catch (error) {
    console.warn('[Exchange Rate Service] Gagal mengambil kurs real-time, mencari data SQLite terakhir:', error);

    // Ambil data kurs terakhir yang tersimpan di SQLite jika fetch gagal
    try {
      const latestSaved = db
        .select()
        .from(exchangeRates)
        .orderBy(desc(exchangeRates.fetchedAt))
        .get();

      if (latestSaved && latestSaved.rate > 0) {
        return {
          date: latestSaved.date,
          usdToIdr: latestSaved.rate,
          updatedAt: latestSaved.updatedAt,
          source: 'sqlite_history',
        };
      }
    } catch (e) {}

    return {
      date: today,
      usdToIdr: fallbackRate,
      updatedAt: new Date().toISOString(),
      source: 'fallback',
    };
  }
}

/**
 * Mengambil seluruh riwayat log kurs yang pernah disimpan di SQLite
 */
export async function getExchangeRateHistory() {
  try {
    const history = db
      .select()
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.fetchedAt))
      .all();
    return history;
  } catch (err: any) {
    console.error('Error fetching exchange rate history from SQLite:', err);
    return [];
  }
}
