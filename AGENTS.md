# AGENTS.md

Panduan teknis dan operasional untuk AI Agent & Pengembang dalam membangun dan mengembangkan aplikasi **Image Prompt Generator** otomatis berbasis Node.js, Vite + React, Local SQLite, dan Local Server.

---

## 1. Ringkasan Proyek & Tujuan

Aplikasi ini adalah **Agentic AI 2D Vector-Ready Studio** lokal mandiri dengan sistem **Pra-Estimasi Token & Biaya Terpisah** yang dirancang untuk:
1. **Menerima ide konsep singkat / keyword** dari pengguna (misal: *"maskot rubah mekanik"*, *"vintage coffee badge"*).
2. **Kalkulasi & Pra-Estimasi Biaya Transparan Sebelum Generate**:
   - **Estimasi Tahap 1 (Prompt)**: Menghitung jumlah token input yang dikirim dan perkiraan token output yang diterima oleh LLM (`deepseek/deepseek-v4-flash-0731`), lengkap dengan estimasi harga dalam USD & IDR.
   - **Estimasi Tahap 2 (Gambar 2D)**: Menghitung biaya pembuatan visual (`openai/gpt-image-2.5-sunburst`) per gambar 1:1.
   - **Pemisahan Harga Nyata**: Biaya prompt dan biaya gambar **dipisah secara transparan** agar pengguna tidak bingung dan dapat memperkirakan pengeluaran sebelum menekan tombol generate.
3. **Mengekspansi & Merekayasa Prompt (Agentic Prompt Engineering)** secara otomatis menjadi prompt visual **2D kelas tinggi yang terisolasi dan ramah vektor** (garis tegas, flat colors, tanpa noise fotografis).
4. **Menghasilkan gambar 2D siap-vektor** berasio standar **1:1** dengan latar belakang bersih (solid/white background) atau mode **Hitam Putih (B&W)** sehingga **sangat mudah dikonversi/ditracing menjadi format Vektor (SVG, EPS, Illustrator)**.
5. **Menyimpan riwayat lengkap ke SQLite lokal**: Termasuk teks prompt, path gambar per tanggal (`data/outputs/YYYY-MM-DD/`), rincian pemakaian token aktual (input/output), serta catatan biaya riil per tahap.

---

## 2. Tech Stack & Rekomendasi Arsitektur

### 2.1 Ringkasan Stack

| Layer | Teknologi | Rincian / Alasan |
|---|---|---|
| **Runtime & Tooling** | Node.js (v20+ LTS) | Standar industri, performa I/O tinggi, kompatibel di semua platform. |
| **Frontend (FE)** | React 19 / 18 + Vite | Pure React SPA, build super cepat dengan Vite HMR, minim overhead. |
| **Styling** | Tailwind CSS | Mengikuti pedoman industrial minimalism di [DESIGN.md](file:///D:/GPTIMAGEGENERATE/DESIGN.md). |
| **Backend (BE)** *(Rekomendasi)* | **Fastify** (atau **Express.js**) + TypeScript | Sangat ringan, performa tinggi, native support untuk **Server-Sent Events (SSE) / Streaming** response prompt LLM, dan schema validation yang ketat. |
| **Database** | **SQLite (Local)** via `better-sqlite3` | Zero-latency (in-process, synchronous C++ binding), tanpa network overhead, 100% file lokal (`data/prompt_studio.db`). |
| **ORM / Query Builder** | **Drizzle ORM** | Type-safe, sangat cepat, migrations otomatis, dan overhead nyaris nol dibanding Prisma. |
| **AI LLM Engine** | **OpenRouter API** (`deepseek/deepseek-v4-flash-0731` & `openai/gpt-image-2.5-sunburst`) | Dual-engine via OpenRouter: DeepSeek v4 Flash untuk prompt engineering/expansion cerdas, dan GPT Image 2.5 Sunburst untuk visual generation. |
| **Icons & UI Utilities** | `lucide-react`, `clsx`, `tailwind-merge` | Ikon minimalis dan penanganan class Tailwind. |

---

### 2.2 Rationale Rekomendasi Backend: Fastify + better-sqlite3 + Drizzle ORM

Mengapa **Fastify** dipilih untuk generator prompt gambar otomatis?

1. **Streaming & SSE (Server-Sent Events) Real-time**:
   Ketika LLM membuat variasi prompt visual atau deskripsi detail, Fastify mampu melakukan streaming token langsung ke React UI tanpa latency.
2. **Validasi Schema Ketat (TypeBox / Zod)**:
   Prompt image membutuhkan banyak metadata terstruktur (`aspectRatio`, `targetEngine`, `stylePreset`, `keywords`, `adobeStockTitle`).
3. **Performa & Jejak Memori Rendah**:
   Fastify memiliki overhead router terkecil di ekosistem Node.js, menjaga aplikasi lokal tetap ringan.
4. **`better-sqlite3` + Drizzle**:
   SQLite berjalan di file lokal disk (`data/prompt_studio.db`). `better-sqlite3` adalah driver SQLite tercepat di Node.js karena synchronous tanpa thread context-switching yang sia-sia. Drizzle memberikan type safety penuh end-to-end dari backend ke frontend.

---

## 3. Struktur Direktori Proyek

```text
GPTIMAGEGENERATE/
├── .env                        # Environment variable lokal & API keys (di-ignore oleh git)
├── .env.example                # Template konfigurasi env
├── AGENTS.md                   # Panduan AI Agent ini
├── AGENTS.html                 # Dynamic reader AGENTS.md responsif
├── DESIGN.md                   # Spesifikasi Industrial Minimalism UI
├── README.md                   # Dokumentasi umum & panduan instalasi
├── docs/                       # Dokumentasi Resmi Mendalam
│   ├── README.md               # Indeks pusat dokumentasi
│   ├── USER_GUIDE.md           # Panduan pengguna langkah demi langkah
│   ├── ARCHITECTURE.md         # Arsitektur sistem, Fastify & SQLite
│   ├── METADATA_SPECIFICATION.md # Spesifikasi biner IPTC/EXIF/XMP
│   └── VERSION_CHANGELOG.md    # Riwayat rilis v1.0.0 s/d v1.3.1
├── package.json                # Dependencies gabungan & npm scripts
├── tsconfig.json               # Konfigurasi TypeScript
├── vite.config.ts              # Konfigurasi Vite (termasuk proxy API ke localhost:3001)
├── data/                       # Direktori data lokal (SQLite & Hasil Gambar)
│   ├── prompt_studio.db        # File SQLite Lokal (better-sqlite3 + Drizzle)
│   ├── logs/                   # Log error sistem harian (error_YYYY-MM-DD.log)
│   └── outputs/                # Folder penyimpanan gambar khusus berdasarkan tanggal generate
│       └── YYYY-MM-DD/         # Subfolder tanggal (misal: 2026-09-12/img_xxx_v1.png)
├── server/                     # BACKEND (Fastify + SQLite)
│   ├── index.ts                # Server entry point & setup port (3001, BodyLimit 50MB)
│   ├── db/
│   │   ├── client.ts           # Inisialisasi better-sqlite3 & Drizzle
│   │   └── schema.ts           # Definisi tabel SQLite prompts & exchange_rates
│   ├── routes/
│   │   └── prompts.route.ts    # CRUD SQLite, AI routes, Currency, & Error Log routes
│   └── services/
│       ├── prompt-engine.service.ts # DeepSeek v4 prompt expansion & 7 style locking
│       ├── image-generator.service.ts # GPT Image 2.5 Sunburst generator & storage
│       ├── currency.service.ts # Kurs dinamis real-time via api.co.id + cache
│       └── error-logger.service.ts # Sistem logging kegagalan render & API sistem
└── src/                        # FRONTEND (React + Vite)
    ├── main.tsx                # React root
    ├── App.tsx                 # Main layout alur batch, error banner, & master controls
    ├── index.css               # Tailwind & font imports (Inter, IBM Plex Mono)
    ├── components/
    │   ├── Navbar.tsx          # Top bar minimalis, live exchange rate, profil author & badge versi
    │   ├── ErrorLogModal.tsx   # Modal inspeksi log error & salin laporan sistem
    │   ├── AutoRunnerWizardModal.tsx # Modal Wizard 3 langkah (1-50 Batch Auto Pipeline)
    │   ├── MetadataSettingsModal.tsx # Modal konfigurasi granular profil kontributor
    │   ├── VersionChangelogModal.tsx # Modal riwayat versi & saklar fitur
    │   ├── PromptInput.tsx     # Form ide + mode Multi-Variasi/Multi-Keyword + checklist B&W
    │   ├── KeywordExpanderWidget.tsx # AI Concept Expander (1-2 kata -> 5 konsep subjek)
    │   ├── CostEstimationCard.tsx # Pra-estimasi token & biaya batch terpisah
    │   ├── CardLoadingBar.tsx  # Bar progress linier animasi shimmer (0-100%)
    │   ├── UnifiedVariationCard.tsx # Kartu mandiri side-by-side: Prompt KIRI, Gambar & Tabel KANAN
    │   ├── BatchCardsGrid.tsx  # Kontainer grid card mandiri + master batch actions
    │   └── HistorySidebar.tsx  # Drawer riwayat prompt dari SQLite + filter pencarian
    ├── hooks/
    │   ├── usePromptGenerator.ts # Hook request generate prompt, gambar, dan sync ke SQLite DB
    │   ├── useAutoRunner.ts      # Engine eksekusi sekuensial batch 1-50 dengan pause/stop
    │   ├── useAppSettings.ts     # Hook pengaturan aplikasi & preferensi UI
    │   ├── useContributorProfile.ts # Hook manajemen profil kontributor microstock
    │   ├── useCostEstimator.ts   # Hook live token counter & kalkulator biaya batch dinamis
    │   ├── useExchangeRate.ts    # Hook kurs harian dinamis USD -> IDR
    │   └── useErrorLogs.ts       # Hook manajemen & sinkronisasi log error sistem
    ├── utils/
    │   ├── costCalculator.ts     # Formula kalkulasi token & tarif DeepSeek + GPT Image 2.5
    │   ├── imageMetadataInjector.ts # Injektor biner 3-layer murni (IPTC 8BIM, EXIF UCS-2, XMP)
    │   ├── downloadHelper.ts     # Helper unduhan single & sequential batch ber-metadata
    │   └── vectorGraphicGenerator.ts # Engine visual 2D vector 1:1 multi-style (7 presets) & konverter PNG
    ├── data/
    │   └── presets.ts            # 7 Presets gaya vektor, engine target, negative prompts, variations
    └── types/
        ├── prompt.ts           # Shared TypeScript interfaces & cost types
        └── errorLog.ts         # Tipe data log error sistem
```

---

## 4. Skema Database SQLite (Drizzle ORM)

File: `server/db/schema.ts`

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(), // UUID / prompt ID
  batchId: text('batch_id'), // Group ID untuk multi-prompt / batch runs
  variationIndex: integer('variation_index').default(1), // Indeks variasi ke-N
  title: text('title').notNull(), // Ringkasan singkat prompt
  adobeStockTitle: text('adobe_stock_title'), // Judul SEO Adobe Stock bahasa Inggris (maksimal 120 karakter)
  keywords: text('keywords'), // JSON array string daftar keywords microstock (10-48 tags, max 2 kata per tag)
  rawIdea: text('raw_idea').notNull(), // Input mentah pengguna
  optimizedPrompt: text('optimized_prompt').notNull(), // Hasil prompt visual 2D lengkap
  negativePrompt: text('negative_prompt'), // Negative prompt pencegah foto & 3D
  targetEngine: text('target_engine').notNull().default('gpt-image'), // gpt-image, flux, midjourney, sdxl
  aspectRatio: text('aspect_ratio').notNull().default('1:1'), // Standar 1:1 untuk microstock & vector assets
  stylePreset: text('style_preset'), // flat-vector, mascot-logo, monoline-ink, sticker-decal, vintage-emblem, stencil-silhouette, premium-line-art
  vectorStyle: text('vector_style'), // misal: Geometric Mascot, Monoline Line Art, Premium Line Art Icon
  isBlackAndWhite: integer('is_black_and_white', { mode: 'boolean' }).notNull().default(false), // Mode B&W
  
  // Multi-Version Prompt Timeline
  activePromptVersionIndex: integer('active_prompt_version_index').default(0),
  promptVersionsData: text('prompt_versions_data'), // JSON string array PromptVersion[]
  
  // Penyimpanan Gambar Multi-Versi
  imagePath: text('image_path'), // Path file gambar aktif (outputs/YYYY-MM-DD/img_xxx_v1.png)
  allImagePaths: text('all_image_paths'), // JSON string array semua versi: ["outputs/.../v1.png", "outputs/.../v2.png"]
  imagesData: text('images_data'), // JSON string array GeneratedImageVersion[]
  generationCount: integer('generation_count').notNull().default(0), // Berapa kali gambar ini di-generate ulang
  
  // Tracking Token & Biaya Terpisah (Akumulatif jika Generate Ulang)
  inputTokens: integer('input_tokens').default(0), // Token input dikirim ke DeepSeek
  outputTokens: integer('output_tokens').default(0), // Token output diterima dari DeepSeek
  promptCostUsd: text('prompt_cost_usd').default('0.000000'), // Biaya ekspansi prompt (DeepSeek)
  imageCostUsd: text('image_cost_usd').default('0.000000'), // Total biaya render gambar (N x $0.020)
  totalCostUsd: text('total_cost_usd').default('0.000000'), // Total akumulasi riil (Prompt + Seluruh Image Render)
  
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
});
```

---

## 5. 7 Preset Gaya Grafis 2D Siap Vektor

Sistem menyediakan **7 preset gaya 2D terkunci** yang dioptimalkan untuk autotrace vektor (SVG / EPS) dan microstock:

| No | ID Preset | Nama Gaya | Kategori | Karakteristik Visual Utama |
|---|---|---|---|---|
| 1 | `flat-vector` | **Flat Vector Art** | `vector` | Minimalist screen-print, garis tegas, warna solid tanpa gradasi. |
| 2 | `mascot-logo` | **Mascot Character** | `sticker` | Maskot karakter die-cut, kontur tebal, ekspresi dinamis. |
| 3 | `monoline-ink` | **Monoline Line Art** | `monochrome` | Garis tunggal dengan ketebalan seragam (*uniform stroke weight*), minim node kurva. |
| 4 | `sticker-decal` | **Sticker Decal** | `sticker` | Stiker pop art dengan offset border putih die-cut bersih. |
| 5 | `vintage-emblem` | **Vintage Badge / Emblem** | `badge` | Simetri geometris, frame stempel retro, linework klasik. |
| 6 | `stencil-silhouette` | **Stencil Silhouette** | `monochrome` | Siluet kontras tinggi dengan jembatan *negative space*, zero shading. |
| 7 | `premium-line-art` | **Premium Line Art Icon** | `monochrome` | **Mandat Zero-Color Fill**: Monoline hitam pekat murni, simplifikasi 85–90%, ~70–75% *negative white space*, siap untuk buku mewarnai (*coloring page printable*) & icon SVG microstock. |

### 5.1 Mandat Khusus Premium Line Art Icon (`premium-line-art`)
Untuk preset `premium-line-art` (dan varian line art lainnya), sistem menerapkan aturan ketat:
1. **Zero Color Fill**: Tidak boleh ada istilah warna atau pengisi warna apa pun (`zero color fill, uncolored coloring-book interior, pure black outlines only`).
2. **Dedicated Anti-Color Negative Prompt**: Otomatis menyertakan kata pencegah warna: `color, colors, colorful, green fill, red fill, blue fill, yellow fill, solid color fill, color fills, vibrant fills, shading, gradients...`.
3. **Prompt Post-Processing Sanitizer**: Regex filter yang membersihkan bila ada kata warna yang tidak sengaja terbentuk oleh LLM.

---

## 6. Alur Metadata SEO Microstock & On-Demand Generator

1. **Saklar Opsional di Awal**: Secara default, pembuatan prompt visual 2D murni dapat menonaktifkan metadata SEO untuk menghemat token output LLM hingga ~70%.
2. **On-Demand SEO Generator per Kartu**: Jika metadata SEO kosong, kartu menampilkan banner rapi dengan tombol **`[ ⚡ Generate SEO Metadata (Title + 48 Tags) ]`** (~Rp 0,3). Tombol ini memanggil `/api/generate-prompt` dengan `includeMetadata: true` untuk mengisi Title bahasa Inggris dan 48 tags keyword secara mandiri tanpa menimpa teks prompt visual yang sudah ada.
3. **Penyematan Biner 3-Lapisan Native**:
   - Title dan Description disinkronkan langsung ke judul SEO Adobe Stock.
   - Tag Keywords (10–48 tags) disuntikkan ke IPTC Record 2:25, EXIF XPKeywords, dan XMP `dc:subject`.
   - Nama file unduhan otomatis disanitasi menjadi format spasi alami yang rapi tanpa karakter underscore `_` (misal: `monstera leaf line icon isolated on white background.png`).

---

## 7. Workflow Menjalankan Aplikasi

```bash
# Menjalankan Frontend (Vite) & Backend (Fastify) secara bersamaan
npm run dev

# Kompilasi & validasi build penuh
npm run build
```