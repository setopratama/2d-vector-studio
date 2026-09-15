# Arsitektur Sistem & Spesifikasi Teknis: Agentic AI 2D Vector Studio

Dokumen ini menjelaskan arsitektur perangkat lunak, tumpukan teknologi (*tech stack*), skema basis data SQLite, antrean tugas FIFO, dan sistem integrasi AI pada **Agentic AI 2D Vector Studio**.

---

## 1. Arsitektur Umum (Monorepo Ringkas)

Aplikasi dibangun menggunakan arsitektur monorepo lokal (*Unified Monorepo*) berbasis Node.js yang menggabungkan frontend SPA dan server backend berkinerja tinggi:

```text
GPTIMAGEGENERATE/
├── server/                         # BACKEND (Fastify + SQLite + AI Services)
│   ├── index.ts                    # Fastify Server Entry Point (Port 3001, BodyLimit 50MB)
│   ├── db/
│   │   ├── client.ts               # Inisialisasi better-sqlite3 & Drizzle ORM
│   │   └── schema.ts               # Definisi Tabel SQLite (prompts & exchange_rates)
│   ├── routes/
│   │   └── prompts.route.ts        # REST API Endpoints (CRUD, AI Expansion, Images, Currency, Logs)
│   └── services/
│       ├── prompt-engine.service.ts    # DeepSeek v4 Flash Expansion & Keyword Expander
│       ├── image-generator.service.ts  # GPT Image 2.5 Sunburst Generator & File Storing
│       ├── currency.service.ts         # Live Kurs USD->IDR (api.co.id) & SQLite Daily Cache
│       └── error-logger.service.ts     # Sistem Logging Kegagalan Render & API
├── src/                            # FRONTEND (React 19 + Vite + Tailwind CSS)
│   ├── components/                 # Komponen UI Modular
│   │   ├── Navbar.tsx              # Header Studio, Kurs Live, Profil Author, Version Trigger
│   │   ├── PromptInput.tsx         # Form Ide, Tabs Mode, Style Selector, B&W Toggle
│   │   ├── KeywordExpanderWidget.tsx # AI Concept Expander (1-2 kata -> 4 ide subjek)
│   │   ├── CostEstimationCard.tsx  # Pra-estimasi Token & Biaya Batch Dinamis
│   │   ├── UnifiedVariationCard.tsx # Kartu Side-by-Side (Prompt Kiri, Gambar Kanan)
│   │   ├── BatchCardsGrid.tsx      # Grid Kontainer Kartu Batch & Master Actions
│   │   ├── AutoRunnerWizardModal.tsx # Wizard Batch Otomatis 1-50 Item
│   │   ├── MetadataSettingsModal.tsx # Pengaturan Profil Kontributor Microstock
│   │   ├── VersionChangelogModal.tsx # Modal Riwayat Versi & Saklar Mode UI
│   │   ├── ErrorLogModal.tsx       # Modal Inspeksi & Salin Log Error
│   │   └── HistorySidebar.tsx      # Drawer Riwayat SQLite Lokal
│   ├── hooks/                      # Custom State & Worker Hooks
│   │   ├── usePromptGenerator.ts   # FIFO Task Queue Worker & Sinkronisasi DB
│   │   ├── useAutoRunner.ts        # Engine Loop Sekuensial Auto-Runner
│   │   ├── useAppSettings.ts       # Manajemen Fitur & Mode UI (localStorage)
│   │   ├── useContributorProfile.ts # Profil Kontributor (localStorage)
│   │   ├── useCostEstimator.ts     # Live Token Estimator Dinamis
│   │   ├── useExchangeRate.ts      # Kurs Dinamis 1x per hari
│   │   └── useErrorLogs.ts         # Sinkronisasi Log Error Sistem
│   └── utils/
│       ├── imageMetadataInjector.ts # Injektor Biner 3-Lapisan (IPTC/EXIF/XMP) Murni
│       ├── downloadHelper.ts       # Helper Unduh Tunggal & Sekuensial Ber-metadata
│       ├── costCalculator.ts       # Formula Tarif Token & Biaya Terpisah
│       └── vectorGraphicGenerator.ts # Generator Visual 2D Vektor Cadangan
└── data/                           # Direktori Penyimpanan Lokal Disk
    ├── prompt_studio.db            # SQLite Database File
    ├── logs/                       # File Log Error Harian (error_YYYY-MM-DD.log)
    └── outputs/YYYY-MM-DD/         # Folder Gambar Berdasarkan Tanggal Generate
```

---

## 2. Tech Stack & Alasan Pemilihan

| Layer | Teknologi | Rincian / Alasan |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript + Vite | Build ultra-cepat (HMR sub-detik), modern state management, minim overhead memori. |
| **Styling** | Tailwind CSS | Industrial minimalism design system, layout responsif, warna HSL presisi. |
| **Backend Framework** | Fastify v5 | Overhead router terkecil di ekosistem Node.js, native JSON schema support, async body limit hingga 50MB. |
| **Database Lokal** | SQLite via `better-sqlite3` | Zero network latency (in-process C++ binding), 100% file lokal di disk (`data/prompt_studio.db`), tanpa instalasi server database eksternal. |
| **ORM / Query Builder** | Drizzle ORM | Zero-cost abstraction, type safety penuh dari backend ke frontend, performa SQL mentah. |
| **AI LLM Engine** | `deepseek/deepseek-v4-flash-0731` | Model LLM dengan rasio performa dan efisiensi token terbaik (Input: $0.14/1M, Output: $0.56/1M). |
| **AI Image Engine** | `openai/gpt-image-2.5-sunburst` | Generator visual 1:1 tajam dengan kemampuan rendering garis tegas dan latar belakang putih terisolasi ($0.020/gambar). |

---

## 3. Skema Basis Data SQLite (`server/db/schema.ts`)

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(), // UUID / prompt ID
  batchId: text('batch_id'), // Group ID untuk multi-prompt / batch runs
  variationIndex: integer('variation_index').default(1),
  title: text('title').notNull(),
  rawIdea: text('raw_idea').notNull(),
  optimizedPrompt: text('optimized_prompt').notNull(),
  negativePrompt: text('negative_prompt'),
  targetEngine: text('target_engine').notNull().default('gpt-image'),
  aspectRatio: text('aspect_ratio').notNull().default('1:1'),
  stylePreset: text('style_preset'),
  vectorStyle: text('vector_style'),
  commercialDirection: text('commercial_direction'), // 1 dari 10 Pilar Pasar 2026
  composition: text('composition').default('single-isolated'), // 1 dari 5 Mode Komposisi
  isBlackAndWhite: integer('is_black_and_white', { mode: 'boolean' }).notNull().default(false),
  
  // Adobe Stock SEO Metadata
  adobeStockTitle: text('adobe_stock_title'), // Judul SEO Adobe Stock (≤120 karakter)
  keywords: text('keywords'), // JSON array string (10-48 tags microstock berperingkat 4-tier)
  
  // Commercial Art Director & Quality Gate Brief
  commercialBrief: text('commercial_brief'), // JSON string dari CommercialBrief (analisis pasar & skor)
  
  // Multi-Version Prompt Timeline
  promptVersionsData: text('prompt_versions_data'), // JSON string array versi prompt
  activePromptVersionIndex: integer('active_prompt_version_index').default(0),
  
  // File Path & Versi Gambar (Hanya metadata path, TANPA base64 di DB)
  imagePath: text('image_path'), // Path gambar aktif
  allImagePaths: text('all_image_paths'), // JSON string array path gambar
  imagesData: text('images_data'), // JSON string array GeneratedImageVersion[]
  generationCount: integer('generation_count').notNull().default(0),
  
  // Tracking Token & Akumulasi Biaya Terpisah
  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  promptCostUsd: text('prompt_cost_usd').default('0.000000'),
  imageCostUsd: text('image_cost_usd').default('0.000000'),
  totalCostUsd: text('total_cost_usd').default('0.000000'),
  
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
});

export const exchangeRates = sqliteTable('exchange_rates', {
  id: text('id').primaryKey(), // misal: 'rate_2026-09-15'
  date: text('date').notNull(), // Format YYYY-MM-DD
  baseCurrency: text('base_currency').notNull().default('USD'),
  targetCurrency: text('target_currency').notNull().default('IDR'),
  rate: real('rate').notNull(), // Nilai kurs riil (misal: 16250.00)
  source: text('source').notNull().default('api.co.id'),
  updatedAt: text('updated_at').notNull(),
  fetchedAt: integer('fetched_at').notNull(),
});
```

---

## 4. Antrean Tugas FIFO (Queue Worker)

Untuk mencegah lonjakan request API bersamaan (*rate limiting*) dan memastikan stabilitas eksekusi saat pengguna menekan tombol generate di banyak kartu sekaligus:
- `usePromptGenerator.ts` mengimplementasikan **FIFO Task Queue Worker**.
- Setiap permintaan *Render Gambar* atau *Re-generate* dimasukkan ke dalam antrean `taskQueue`.
- Worker mengeksekusi tugas satu per satu secara sekuensial dengan jeda aman (*safety delay* 300–600ms).
- Status kartu aktif ditandai secara visual di UI (*Menunggu Giliran Antrean*, *Sedang Merender*, *Selesai*).

