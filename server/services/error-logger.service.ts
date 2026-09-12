// server/services/error-logger.service.ts
import fs from 'node:fs/promises';
import path from 'node:path';

export interface ErrorLogEntry {
  id: string;
  timestamp: number;
  timeFormatted: string;
  type: 'render-image' | 'prompt-expansion' | 'currency-api' | 'server';
  model?: string;
  statusCode?: number;
  message: string;
  details?: string | Record<string, any>;
  promptSnippet?: string;
  stack?: string;
}

// In-memory buffer of latest 100 errors for instant UI retrieval
const recentErrors: ErrorLogEntry[] = [];
const MAX_IN_MEMORY_LOGS = 100;

/**
 * Catat error ke file disk lokal (data/logs/error_YYYY-MM-DD.log) & memori
 */
export async function logSystemError(entry: Omit<ErrorLogEntry, 'id' | 'timestamp' | 'timeFormatted'>): Promise<ErrorLogEntry> {
  const now = Date.now();
  const dateStr = new Date(now).toISOString().split('T')[0];
  const timeFormatted = new Date(now).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const fullEntry: ErrorLogEntry = {
    id: `err_${now}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    timeFormatted: `${dateStr} ${timeFormatted}`,
    ...entry,
  };

  // 1. Simpan ke in-memory cache
  recentErrors.unshift(fullEntry);
  if (recentErrors.length > MAX_IN_MEMORY_LOGS) {
    recentErrors.pop();
  }

  // 2. Simpan ke file log teks di data/logs/error_YYYY-MM-DD.log
  try {
    const logsDir = path.join(process.cwd(), 'data', 'logs');
    await fs.mkdir(logsDir, { recursive: true });

    const logFilePath = path.join(logsDir, `error_${dateStr}.log`);
    const logLine = `[${fullEntry.timeFormatted}] [${fullEntry.type.toUpperCase()}] [HTTP ${fullEntry.statusCode || 'N/A'}] [Model: ${fullEntry.model || 'N/A'}]\n` +
      `Message: ${fullEntry.message}\n` +
      (fullEntry.promptSnippet ? `Prompt: ${fullEntry.promptSnippet}\n` : '') +
      (fullEntry.details ? `Details: ${typeof fullEntry.details === 'object' ? JSON.stringify(fullEntry.details, null, 2) : fullEntry.details}\n` : '') +
      (fullEntry.stack ? `Stack: ${fullEntry.stack}\n` : '') +
      '--------------------------------------------------------------------------------\n';

    await fs.appendFile(logFilePath, logLine, 'utf-8');
  } catch (fsErr) {
    console.error('[ErrorLogger] Gagal menulis ke file log disk:', fsErr);
  }

  return fullEntry;
}

/**
 * Dapatkan daftar log error terbaru
 */
export function getRecentErrorLogs(): ErrorLogEntry[] {
  return [...recentErrors];
}

/**
 * Bersihkan daftar log error di memori
 */
export function clearInMemoryErrorLogs(): void {
  recentErrors.length = 0;
}
