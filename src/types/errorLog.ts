// src/types/errorLog.ts
export interface ErrorLogItem {
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
