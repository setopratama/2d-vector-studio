// server/db/client.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import * as schema from './schema';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'prompt_studio.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for high performance
sqlite.pragma('journal_mode = WAL');

// Ensure tables exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    batch_id TEXT,
    variation_index INTEGER DEFAULT 1,
    title TEXT NOT NULL,
    adobe_stock_title TEXT,
    keywords TEXT,
    raw_idea TEXT NOT NULL,
    optimized_prompt TEXT NOT NULL,
    negative_prompt TEXT,
    target_engine TEXT NOT NULL DEFAULT 'gpt-image',
    aspect_ratio TEXT NOT NULL DEFAULT '1:1',
    style_preset TEXT,
    vector_style TEXT,
    is_black_and_white INTEGER NOT NULL DEFAULT 0,
    prompt_versions_data TEXT,
    active_prompt_version_index INTEGER DEFAULT 0,
    image_path TEXT,
    all_image_paths TEXT,
    images_data TEXT,
    generation_count INTEGER NOT NULL DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    prompt_cost_usd TEXT DEFAULT '0.000000',
    image_cost_usd TEXT DEFAULT '0.000000',
    total_cost_usd TEXT DEFAULT '0.000000',
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exchange_rates (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    base_currency TEXT NOT NULL DEFAULT 'USD',
    target_currency TEXT NOT NULL DEFAULT 'IDR',
    rate REAL NOT NULL,
    source TEXT NOT NULL DEFAULT 'api.co.id',
    updated_at TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  );
`);

// Auto-migration helper: Add missing columns if database was created with an older schema
try {
  const existingCols = (sqlite.pragma('table_info(prompts)') as Array<{ name: string }>).map((c) => c.name);
  if (!existingCols.includes('adobe_stock_title')) {
    sqlite.exec('ALTER TABLE prompts ADD COLUMN adobe_stock_title TEXT;');
  }
  if (!existingCols.includes('keywords')) {
    sqlite.exec('ALTER TABLE prompts ADD COLUMN keywords TEXT;');
  }
  if (!existingCols.includes('prompt_versions_data')) {
    sqlite.exec('ALTER TABLE prompts ADD COLUMN prompt_versions_data TEXT;');
  }
  if (!existingCols.includes('active_prompt_version_index')) {
    sqlite.exec('ALTER TABLE prompts ADD COLUMN active_prompt_version_index INTEGER DEFAULT 0;');
  }
} catch (migErr) {
  console.warn('[DB AutoMigration] Migration check warning:', migErr);
}

export const db = drizzle(sqlite, { schema });
export { sqlite };

