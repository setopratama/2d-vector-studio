import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(), // UUID / prompt ID
  batchId: text('batch_id'), // Group ID for batch multi-prompt
  variationIndex: integer('variation_index').default(1),
  title: text('title').notNull(),
  rawIdea: text('raw_idea').notNull(),
  optimizedPrompt: text('optimized_prompt').notNull(),
  negativePrompt: text('negative_prompt'),
  targetEngine: text('target_engine').notNull().default('gpt-image'),
  aspectRatio: text('aspect_ratio').notNull().default('1:1'),
  stylePreset: text('style_preset'),
  vectorStyle: text('vector_style'),
  isBlackAndWhite: integer('is_black_and_white', { mode: 'boolean' }).notNull().default(false),
  
  // Adobe Stock SEO Metadata
  adobeStockTitle: text('adobe_stock_title'), // English SEO Title <= 120 chars
  keywords: text('keywords'), // JSON array string or comma separated keywords (10-48 tags)
  
  // Multi-Version Prompt Timeline
  promptVersionsData: text('prompt_versions_data'), // JSON string of PromptVersion[]
  activePromptVersionIndex: integer('active_prompt_version_index').default(0),
  
  // Storage & Images
  imagePath: text('image_path'), // Active image path
  allImagePaths: text('all_image_paths'), // JSON array of all iterations
  imagesData: text('images_data'), // JSON string of GeneratedImageVersion[]
  generationCount: integer('generation_count').notNull().default(0),
  
  // Separated Token & Cost Ledger
  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  promptCostUsd: text('prompt_cost_usd').default('0.000000'),
  imageCostUsd: text('image_cost_usd').default('0.000000'),
  totalCostUsd: text('total_cost_usd').default('0.000000'),
  
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
});

// Tabel Riwayat Kurs Harian (Setiap tanggal disimpan permanen sebagai history)
export const exchangeRates = sqliteTable('exchange_rates', {
  id: text('id').primaryKey(), // e.g. 'rate_2026-09-10'
  date: text('date').notNull(), // 'YYYY-MM-DD'
  baseCurrency: text('base_currency').notNull().default('USD'),
  targetCurrency: text('target_currency').notNull().default('IDR'),
  rate: real('rate').notNull(), // e.g. 17525.00
  source: text('source').notNull().default('api.co.id'),
  updatedAt: text('updated_at').notNull(),
  fetchedAt: integer('fetched_at').notNull(),
});
