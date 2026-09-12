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
| **Database** | **SQLite (Local)** via `better-sqlite3` | Zero-latency (in-process, synchronous C++ binding), tanpa network overhead, 100% file lokal (`data/prompts.db`). |
| **ORM / Query Builder** | **Drizzle ORM** | Type-safe, sangat cepat, migrations otomatis, dan overhead nyaris nol dibanding Prisma. |
| **AI LLM Engine** | **OpenRouter API** (`deepseek/deepseek-v4-flash-0731` & `openai/gpt-image-2.5-sunburst`) | Dual-engine via OpenRouter: DeepSeek v4 Flash untuk prompt engineering/expansion cerdas, dan GPT Image 2.5 Sunburst untuk visual generation. |
| **Icons & UI Utilities** | `lucide-react`, `clsx`, `tailwind-merge` | Ikon minimalis dan penanganan class Tailwind. |

---

### 2.2 Rationale Rekomendasi Backend: Fastify + better-sqlite3 + Drizzle ORM

Mengapa **Fastify** dipilih untuk generator prompt gambar otomatis?

1. **Streaming & SSE (Server-Sent Events) Real-time**:
   Ketika LLM membuat 4-5 variasi prompt visual atau deskripsi detail, Fastify mampu melakukan streaming token langsung ke React UI tanpa latency. Pengguna langsung melihat teks terbentuk kata demi kata.
2. **Validasi Schema Ketat (TypeBox / Zod)**:
   Prompt image membutuhkan banyak metadata terstruktur:
   - `aspectRatio` (misal: `16:9`, `9:16`, `1:1`)
   - `targetEngine` (`midjourney`, `flux`, `sdxl`, `dall-e`)
   - `parameters` (`--stylize`, `--chaos`, `steps`, `cfg_scale`, negative prompt)
   - Fastify memvalidasi payload ini secara otomatis sebelum masuk ke database.
3. **Performa & Jejak Memori Rendah**:
   Fastify memiliki overhead router terkecil di ekosistem Node.js, menjaga aplikasi lokal tetap ringan saat dijalankan bersamaan dengan browser dan aplikasi lainnya.
4. **`better-sqlite3` + Drizzle**:
   SQLite berjalan di file lokal disk (`local.db`). `better-sqlite3` adalah driver SQLite tercepat di Node.js karena synchronous tanpa thread context-switching yang sia-sia. Drizzle memberikan type safety penuh end-to-end dari backend ke frontend.

---

## 3. Struktur Direktori Proyek

Struktur terpadu (Unified Monorepo ringkas) memudahkan satu perintah `npm run dev` untuk menjalankan Vite FE dan Fastify BE secara bersamaan:

```text
GPTIMAGEGENERATE/
├── .env                        # Environment variable lokal & API keys (di-ignore oleh git)
├── .env.example                # Template konfigurasi env
├── AGENTS.md                   # Panduan AI Agent ini
├── AGENTS.html                 # Dynamic reader AGENTS.md responsif
├── DESIGN.md                   # Spesifikasi Industrial Minimalism UI
├── README.md                   # Dokumentasi umum & panduan instalasi
├── package.json                # Dependencies gabungan & npm scripts
├── tsconfig.json               # Konfigurasi TypeScript
├── vite.config.ts              # Konfigurasi Vite (termasuk proxy API ke localhost:3001)
├── data/                       # Direktori data lokal (SQLite & Hasil Gambar)
│   ├── prompt_studio.db        # File SQLite Lokal (better-sqlite3 + Drizzle)
│   ├── logs/                   # Log error sistem harian (error_YYYY-MM-DD.log)
│   └── outputs/                # Folder penyimpanan gambar khusus berdasarkan tanggal generate
│       └── YYYY-MM-DD/         # Subfolder tanggal (misal: 2026-09-10/img_xxx_v1.png)
├── server/                     # BACKEND (Fastify + SQLite)
│   ├── index.ts                # Server entry point & setup port (3001, BodyLimit 50MB)
│   ├── db/
│   │   ├── client.ts           # Inisialisasi better-sqlite3 & Drizzle
│   │   └── schema.ts           # Definisi tabel SQLite prompts & exchange_rates
│   ├── routes/
│   │   └── prompts.route.ts    # CRUD SQLite, AI routes, Currency, & Error Log routes
│   └── services/
│       ├── prompt-engine.service.ts # DeepSeek v4 prompt expansion & style locking
│       ├── image-generator.service.ts # GPT Image 2.5 Sunburst generator & storage
│       ├── currency.service.ts # Kurs dinamis real-time via api.co.id + cache
│       └── error-logger.service.ts # Sistem logging kegagalan render & API sistem
└── src/                        # FRONTEND (React + Vite)
    ├── main.tsx                # React root
    ├── App.tsx                 # Main layout alur batch, error banner, & master controls
    ├── index.css               # Tailwind & font imports (Inter, IBM Plex Mono)
    ├── components/
    │   ├── Navbar.tsx          # Top bar minimalis, live exchange rate, tombol Auto-Runner & badge Log Error
    │   ├── ErrorLogModal.tsx   # Modal inspeksi log error & salin laporan sistem
    │   ├── AutoRunnerWizardModal.tsx # Modal Wizard 3 langkah (1-50 Batch Auto Pipeline)
    │   ├── PromptInput.tsx     # Form ide + mode Multi-Variasi/Multi-Keyword + checklist B&W
    │   ├── CostEstimationCard.tsx # Pra-estimasi token & biaya batch terpisah
    │   ├── CardLoadingBar.tsx  # Bar progress linier animasi shimmer (0-100%)
    │   ├── UnifiedVariationCard.tsx # Kartu mandiri side-by-side: Prompt KIRI, Gambar & Tabel KANAN
    │   ├── BatchCardsGrid.tsx  # Kontainer grid card mandiri + master batch actions
    │   └── HistorySidebar.tsx  # Drawer riwayat prompt dari SQLite + filter pencarian
    ├── hooks/
    │   ├── usePromptGenerator.ts # Hook request generate prompt, gambar, dan sync ke SQLite DB
    │   ├── useAutoRunner.ts      # Engine eksekusi sekuensial batch 1-50 dengan pause/stop
    │   ├── useCostEstimator.ts   # Hook live token counter & kalkulator biaya batch dinamis
    │   ├── useExchangeRate.ts    # Hook kurs harian dinamis USD -> IDR
    │   └── useErrorLogs.ts       # Hook manajemen & sinkronisasi log error sistem
    ├── utils/
    │   ├── costCalculator.ts     # Formula kalkulasi token & tarif DeepSeek + GPT Image 2.5
    │   └── vectorGraphicGenerator.ts # Engine visual 2D vector 1:1 multi-style & konverter PNG
    ├── data/
    │   └── presets.ts            # Presets gaya vektor, engine target, negative prompts, variations
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
  stylePreset: text('style_preset'), // flat, mascot, sticker, monoline, badge
  vectorStyle: text('vector_style'), // misal: Geometric Mascot, Monoline Line Art
  isBlackAndWhite: integer('is_black_and_white', { mode: 'boolean' }).notNull().default(false), // Mode B&W
  
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

## 5. Workflow Script & Menjalankan Aplikasi

Script di dalam `package.json` dirancang agar developer cukup menjalankan:

```bash
npm run dev
```

### Konfigurasi `package.json` yang disarankan:

```json
{
  "name": "gpt-image-generate",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently -k -p \"[{name}]\" -n \"VITE,FASTIFY\" -c \"blue,green\" \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "tsc && vite build && tsc -p tsconfig.server.json",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "better-sqlite3": "^11.8.1",
    "clsx": "^2.1.1",
    "drizzle-orm": "^0.38.4",
    "fastify": "^5.2.1",
    "@fastify/cors": "^10.0.2",
    "lucide-react": "^1.16.0",
    "nanoid": "^5.0.9",
    "openai": "^4.85.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.1"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/node": "^22.13.4",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "concurrently": "^9.1.2",
    "drizzle-kit": "^0.30.4",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
```

### Proxy Vite (`vite.config.ts`)
Vite dikonfigurasi untuk mem-proxy permintaan `/api` ke Fastify server di port `3001`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 6. Logika Prompt Engineering Khusus Gambar 2D & Siap Dikonversi ke Vektor

Tujuan utama prompt engineering pada proyek ini adalah menghasilkan gambar 2D yang **optimal untuk proses vektorisasi (autotrace ke format SVG / EPS)**. AI Agent wajib menerapkan aturan berikut:

### 6.1 Prinsip Utama Desain 2D Siap Vektor (Vector-Ready)
1. **Siluet & Kontur Tegas (Clean Outlines)**: Garis batas subjek harus jelas, tajam, dan tidak kabur (*bold strokes, sharp contours*) agar algoritma vektorisasi (seperti Potrace/VTracer) menghasilkan kurva path yang rapi.
2. **Isolasi Background Bersih (Isolated Background)**: Selalu sertakan perintah latar belakang polos kontras tinggi, idealnya: `isolated on pure white background` atau `die-cut sticker with clean border` agar subjek mudah dipisahkan tanpa artefak.
3. **Pewarnaan Flat & Padat (Solid Color Blocks)**: Prioritaskan warna datar (*flat design, screen-print, limited color palette*). Hindari gradasi warna lembut atau *halftone* mikro yang akan membuat file SVG menjadi sangat berat dengan ribuan layer kecil tak perlu.
4. **Tanpa Noise Fotografis / Efek 3D**: Hilangkan tekstur realistis, bayangan kompleks (*ambient occlusion*), efek blur kamera, atau pantulan metalik fotorealistik.

### 6.2 Negative Prompt Wajib untuk Vektor
Setiap prompt 2D wajib menyertakan negative prompt untuk mencegah munculnya elemen 3D atau foto:
```text
photorealistic, 3d render, realistic shadows, photography, depth of field blur, noise, grain, complex messy background, realistic skin pores, lens flare, micro-gradients
```

### 6.3 Formula Penyesuaian Engine (Engine Tailoring)
- **FLUX.1**:
  `"clean 2d flat vector illustration of [subjek], sharp vector contours, bold solid lines, vibrant flat colors, minimalist screen-print aesthetic, isolated on pure white background, svg graphic ready"`
- **Midjourney v6**:
  `"[subjek], 2d vector art, flat design, clean black outlines, sticker decal, isolated on white background --ar 1:1 --style raw --v 6.1 --no photorealistic 3d shadows gradients"`
- **Stable Diffusion XL**:
  - *Positive:* `"vector illustration, 2d flat graphic, svg style asset, clean vector lines, bold sharp silhouette, solid colors, isolated white background, 1:1 square canvas"`
  - *Negative:* `"photo, 3d, realistic, blurry, shadows, noisy background, gradient, photographic render"`
- **GPT Image 2.5 Sunburst**:
  `"Crisp 2D vector graphic of [subjek], square 1:1 composition, sharp outlines, flat solid colors, isolated on pure white background, stock asset SVG ready."`

### 6.4 Aturan Efisiensi & Hemat Token (Cost-Effective Image Generation)
Untuk menjaga biaya API tetap murah dan eksekusi generate di `openai/gpt-image-2.5-sunburst` efisien:
1. **Panjang Prompt Padat (30–50 Kata)**: Hindari deskripsi puitis atau kata pengisi (*filler words* seperti *"photographed with passion, stunning masterpiece"*). Cukup langsung ke esensi visual: Subjek + Gaya 2D + Siluet/Warna + Isolasi Background.
2. **Kepadatan Informasi (High-Density Keywords)**: Gunakan istilah teknis ringkas seperti `flat vector`, `sharp outlines`, `solid fills`, `white background`.
3. **Menghemat Token Chat & Token Gambar**: Prompt yang ringkas menghemat kuota token input pada DeepSeek v4 Flash sekaligus memastikan prompt yang dikirim ke GPT Image 2.5 tidak terpotong dan dieksekusi secara akurat tanpa biaya berlebih.

### 6.5 Checklist Mode Hitam Putih (Black & White / Monochrome Mode)
Pada UI disediakan kontrol checklist: `[x] Mode Hitam Putih (B&W Vector)`:
- **Tujuan**: Menghasilkan grafis monokrom dengan kontras 100% ekstrem (tinta hitam pekat di atas latar belakang putih murni), yang merupakan format paling murah dan paling sempurna untuk proses *autotrace* vektor (menghasilkan path kurva tunggal tanpa layer warna).
- **Formula Prompt B&W Otomatis**:
  `"Pure black and white 2D vector art of [subjek], bold black ink contours, solid black silhouette fills, zero grayscale, no shading, isolated on pure white background."`
- **Negative Prompt Wajib B&W**:
  `"color, colors, grayscale, gray tones, shading, shadows, gradients, realistic texture, 3d, photorealistic, noise"`

### 6.6 Alur Kerja Agentic AI 2-Tahap (Two-Stage Agentic Workflow)
Aplikasi memisahkan eksekusi ke dalam dua tahapan independen agar pengguna memiliki kontrol biaya penuh:

```text
[Input Keyword] ───> [Live Token Counter] ───> [Estimasi Biaya Prompt] ───> [Klik "GENERATE PROMPT"]
                                                                                    │
                                                                                    ▼
[Preview Prompt 2D] <────────────────────────────────────────── [DeepSeek v4 Flash Expansion]
       │
       ▼
[Estimasi Biaya Gambar (1:1)] ───> [Review Breakdown Biaya Terpisah] ───> [Klik "GENERATE IMAGE"]
                                                                                  │
                                                                                  ▼
[Output 2D Vector-Ready] <───────────────────────────────────── [GPT Image 2.5 Sunburst]
       │
       ▼
[Simpan ke data/outputs/YYYY-MM-DD/ & SQLite]
```

### 6.7 Kalkulasi Token & Pemisahan Biaya Terpisah (Transparent Cost Breakdown)
Sebelum user mengklik tombol eksekusi, sistem wajib menampilkan **kalkulasi token dan rincian harga yang dipisah**:

#### 1. Tabel Tarif Referensi OpenRouter
| Komponen | Model | Tarif Input | Tarif Output | Satuan |
|---|---|---|---|---|
| **Tahap 1: Prompt Expansion** | `deepseek/deepseek-v4-flash-0731` | $0.14 / 1M token ($0.00000014/tok) | $0.56 / 1M token ($0.00000056/tok) | Per token |
| **Tahap 2: Image Generation** | `openai/gpt-image-2.5-sunburst` | - | - | $0.0200 / gambar (1:1) |

*Konversi Kurs Default: $1.00 = Rp 16.000,- (dapat dikonfigurasi).*

#### 2. Estimasi Sebelum Generate Prompt (Pre-Prompt Estimate)
- **Token Input yang Dikirim**: Diestimasi dari panjang karakter `rawIdea` + *system prompt template* (~280 - 350 token).
- **Token Output yang Diterima**: Target hasil prompt padat 30–50 kata (~50 - 80 token).
- **Perkiraan Biaya Prompt**:
  $$\text{Biaya Prompt} = (\text{Input Token} \times 0.00000014) + (\text{Output Token} \times 0.00000056)$$
  *Rata-rata berkisar antara $0.00005 – $0.00009 (sekitar Rp 0,8 – Rp 1,4 per prompt).*

#### 3. Alur Card Bertahap & Rincian Biaya di UI

Sistem UI membagi alur menjadi **Alur Batch & Card Mandiri (Side-by-Side Layout)** di mana setiap tahapan dan setiap kartu memunculkan rincian token dan biayanya secara langsung:

##### A. Card 1: Input Keyword & Estimasi Biaya Batch Pra-Generate
Saat pengguna mengetik ide kasar di input area, widget live counter langsung menampilkan pra-estimasi batch secara dinamis:
```text
┌────────────────────────────────────────────────────────────────────────┐
│ [CARD ESTIMASI PROMPT PRA-GENERATE]                                    │
├────────────────────────────────────────────────────────────────────────┤
│ • Keyword: "maskot rubah mekanik" (~4 kata)                           │
│ • Batch Terpilih: 5 Variasi Prompt Visual Mandiri                      │
│ • Perkiraan Token Kirim (Input) : ~320 tokens  --> $0.000045           │
│ • Perkiraan Token Terima (Output): ~325 tokens  --> $0.000182           │
│ • Estimasi Biaya 5 Prompt        : $0.000227 (~Rp 3,63)                │
│                                                                        │
│ [ TOMBOL: GENERATE 5 VARIASI PROMPT (Estimasi ~$0.00023 / Rp 3,63) ]   │
└────────────────────────────────────────────────────────────────────────┘
```

##### B. Master Batch Header & Grid 5 Card Mandiri (Side-by-Side Layout)
Setelah tombol generate prompt ditekan, sistem menghasilkan **5 Card Mandiri** yang otomatis tersimpan ke database SQLite lokal (`data/prompt_studio.db`). Setiap kartu memanjang (*full-width*) dengan pembagian dua kolom: **Prompt di Kiri**, dan **Visual Gambar 1:1 beserta Tabel Akumulasi Biaya di Kanan**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [CARD #1]  GEOMETRIC MASCOT • maskot rubah mekanik [Var #1]         [ SQLite DB ] [ B&W INK • 1:1 ] [★]│
├──────────────────────────────────────────────────────┬─────────────────────────────────────────────────┤
│ [ SISI KIRI: PROMPT & METRIK TOKEN ]                 │ [ SISI KANAN: GAMBAR 1:1 & TABEL BIAYA ]        │
│                                                      │                                                 │
│ • OPTIMIZED 2D VECTOR PROMPT:    [ Tombol: Salin ]   │ • Visual 1:1 (Versi v1):     [ Versi: v1 | v2 ] │
│   "Pure black and white 2D vector art of mechanical  │                                                 │
│   fox, mascot emblem profile with sharp geometric    │   ┌─────────────────────────────────────────┐   │
│   contours, bold solid lines, isolated on pure white │   │                                         │   │
│   background, svg autotrace ready."                  │   │      [ KANVAS GAMBAR 1:1 SQUARE ]       │   │
│                                                      │   │      (Resolusi 1024x1024, Zoom)         │   │
│ • NEGATIVE PROMPT:              [ Tombol: Salin ]    │   │                                         │   │
│   "photorealistic, 3d, shadows, noise, gradient..."  │   └─────────────────────────────────────────┘   │
│                                                      │                                                 │
│ • RINCIAN TOKEN DEEPSEEK V4 FLASH:                   │ • File: data/outputs/2026-09-10/img_fox_v1.png  │
│   - Token Input : 315 tok                            │                                                 │
│   - Token Output: 65 tok                             │ • TABEL RINCIAN BIAYA CARD #1:                  │
│   - Biaya Riil Prompt Ini: $0.000081 (~Rp 1,30)      │   ┌───────────────────────┬────────────┬──────┐ │
│                                                      │   │ Komponen              │ Qty        │ Biaya│ │
│                                                      │   ├───────────────────────┼────────────┼──────┤ │
│                                                      │   │ 1. Prompt Expansion   │ 1x         │$0.000│ │
│                                                      │   │ 2. Visual Render 1:1  │ 1x         │$0.020│ │
│                                                      │   ├───────────────────────┼────────────┼──────┤ │
│                                                      │   │ TOTAL CARD #1         │            │$0.020│ │
│                                                      │   │                       │            │(~Rp32│ │
│                                                      │   └───────────────────────┴────────────┴──────┘ │
│                                                      │                                                 │
│                                                      │   [ DOWNLOAD PNG ]  [ REGENERATE (+$0.020000) ] │
└──────────────────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

#### 4. Mekanisme Generate Gambar & Akumulasi Biaya Otomatis di Card yang Sama
1. **Muncul di Card yang Sama**: Tombol generate gambar berada langsung di dalam kartu variasi tersebut. Saat diklik, kanvas visual 1:1 langsung me-render tepat di sisi kanan kartu yang sama tanpa berpindah halaman.
2. **Tombol Master Generate Semua**: Pada bilah atas (*master banner*), tersedia tombol `[ GENERATE SEMUA 5 GAMBAR (+$0.100000 / ~Rp 1.600) ]` untuk memproses seluruh kartu sekaligus.
3. **Pencegahan Kejutan Biaya**: Pada tombol *"REGENERATE"*, tarif baru **wajib selalu tertera di label tombol** (`+$0.020000 / ~Rp 320,00`) sebelum pengguna mengkliknya.
4. **Akumulasi Total Biaya Otomatis**:
   - Render Awal (1x): Biaya Gambar = `$0.020000`, Total = `$0.020081` (~Rp 321,30).
   - Generate Ulang ke-1 (2x): Biaya Gambar = `$0.040000`, Total = `$0.040081` (~Rp 641,30).
   - Generate Ulang ke-2 (3x): Biaya Gambar = `$0.060000`, Total = `$0.060081` (~Rp 961,30).
5. **Penyimpanan SQLite Otomatis**: Setiap perubahan gambar atau re-roll langsung disinkronkan ke file database `data/prompt_studio.db` melalui endpoint `/api/prompts`.

---

### 6.8 Batch Multi-Prompt & Multi-Design Engine (Produksi Massal & Koleksi Vektor)

Untuk menjawab kebutuhan microstock dan produksi massal (seperti icon pack, sticker set, dan variasi gaya desain), sistem menyediakan kapabilitas **Batch Multi-Prompt & Multi-Design**:

#### 1. Dua Mode Input Batch Fleksibel
1. **Mode A: Single Concept Multi-Style Variations**:
   - Pengguna memasukkan 1 ide dasar (misal: *"maskot rubah mekanik"*), lalu memilih jumlah variasi: `1`, `3`, `5`, atau `8` variasi prompt.
   - DeepSeek v4 Flash secara cerdas mengekspansi keyword menjadi variasi sudut pandang/gaya visual yang berbeda:
     - Variasi 1: *Geometric Shield Mascot*
     - Variasi 2: *Monoline Minimalist Line Art*
     - Variasi 3: *Die-Cut Sticker Decal*
     - Variasi 4: *Circular Vintage Badge Emblem*
     - Variasi 5: *High-Contrast Stencil Cutout*
     - Variasi 6: *Pop Art Screen-Print Flat Vector*
2. **Mode B: Multi-Keyword Pack Mode (1 Baris = 1 Konsep)**:
   - Pengguna mengetik daftar keyword konsep sekaligus (satu per baris):
     ```text
     maskot rubah mekanik
     serigala cyberpunk neon
     burung hantu steampunk
     beruang robot armor
     ```
   - Sistem mendeteksi jumlah baris secara otomatis dan memprosesnya sebagai 1 paket koleksi aset vektor.

#### 2. Kalkulasi Token & Pra-Estimasi Biaya Batch Presisi
- **Token Output Terestimasi**: `Jumlah Variasi (N) × ~65 token`.
- **Biaya Prompt Batch**: Diestimasi dan ditampilkan secara transparan sebelum eksekusi:
  $$\text{Biaya Prompt Batch} = (\text{Input Token} \times 0.00000014) + (N \times 65 \times 0.00000056)$$
  *(Contoh: 3 variasi prompt berkisar ~$0.000148 atau ~Rp 2,37).*
- **Estimasi Biaya Gambar Batch**:
  $$\text{Biaya Gambar Batch} = N \times \$0.020000$$
  *(Contoh: 3 gambar 1:1 = $0.060000 atau ~Rp 960,00).*

#### 3. Fleksibilitas Eksekusi & Tata Letak Kartu Mandiri (Side-by-Side Layout)
1. **Pilihan Eksekusi Gambar**:
   - **Per-Desain**: Pengguna dapat memilih salah satu variasi prompt dan merender gambar hanya untuk kartu tersebut (`+$0.020000`).
   - **Batch All**: Pengguna dapat menekan tombol `GENERATE SEMUA GAMBAR (N Gambar = +$0.0XXXXX)` untuk merender gambar pada seluruh kartu secara serentak.
2. **Tata Letak Kartu Mandiri (Prompt di Kiri, Gambar & Tabel di Kanan)**:
   - Setiap kartu hasil generate tampil memanjang (*full-width industrial card*) yang dibagi menjadi dua kolom berdampingan:
     - **Kolom KIRI**:
       - Judul variasi & badge style (e.g. *Geometric Mascot, Monoline Line Art*).
       - Teks lengkap *Optimized 2D Vector Prompt* dengan tombol salin.
       - *Negative Prompt* pencegah foto & 3D render.
       - Rincian token aktual DeepSeek v4 Flash (input/output) dan biaya riil prompt.
       - Lencana status sinkronisasi ke SQLite DB lokal.
     - **Kolom KANAN**:
       - Preview visual 1:1 Square (Microstock standard) dengan zoom viewer.
       - Tab pemilih versi iterasi (`v1`, `v2`, `v3`).
       - Path file lokal otomatis berdasarkan tanggal (`data/outputs/YYYY-MM-DD/...`).
       - **Tabel Rincian Biaya Mandiri**: Biaya prompt awal + biaya akumulasi render gambar (N x $0.020) = Total biaya kartu tersebut.
       - Tombol **[DOWNLOAD PNG]** untuk kartu tersebut.
       - Tombol **[GENERATE ULANG (+$0.020000)]** yang merender ulang varian tersebut secara mandiri.
3. **Master Action: Download Semua PNG (Batch)**:
   - Tombol unduh massal pada bilah atas untuk mengunduh seluruh file PNG 1:1 dari semua kartu secara berurutan ke komputer pengguna dalam satu kali klik, lengkap dengan penyematan metadata SEO otomatis dan penamaan file SEO.

### 6.8 Otomatisasi Metadata SEO Microstock & Injeksi Binary 3-Lapisan (Zero External Dependencies)
Untuk memaksimalkan nilai jual dan penerimaan aset di seluruh platform microstock internasional (Adobe Stock, Shutterstock, Freepik, Getty Images, Vecteezy), sistem menerapkan aturan biner ketat tanpa dependensi pihak ketiga:

#### 1. Aturan Zero External Dependencies (100% Native Pure JS / Node.js Buffer)
- **Tanpa Library Eksternal**: Tidak menggunakan pustaka pihak ketiga seperti `exiftool`, `sharp`, `piexifjs`, atau `glob`.
- **Parser & Serializer Biner Mandiri**: Seluruh *parser*, *serializer*, dan *injector* format biner (JPEG, PNG, TIFF/EXIF, IPTC IIM Photoshop 8BIM, Adobe XMP, dan tabel bitwise CRC32 `0xEDB88320`) dibangun manual dari nol menggunakan API native TypedArray (`Uint8Array`, `ArrayBuffer`, `DataView`) pada [imageMetadataInjector.ts](file:///d:/GPTIMAGEGENERATE/src/utils/imageMetadataInjector.ts).

#### 2. Kesesuaian Standar Agensi Microstock (Sinkronisasi Serentak 3 Lapisan)
Saat memasukkan judul (*Title*), kata kunci (*Keywords*), deskripsi (*Caption/Description*), dan pembuat (*Author*), metadata diselaraskan serentak ke **3 lapisan standar industri**:
1. **Lapisan 1: IPTC IIM (Photoshop 8BIM Resource `0x0404`)**:
   - Segmen APP13 Photoshop 8BIM (ID `0x0404` untuk IPTC-NAA).
   - Deklarasi Charset UTF-8: Record 1 Dataset `0x5A` (Escape sequence `\x1b%G`).
   - Dataset Record 2:
     - `2:05` (Object Name / Title)
     - `2:25` (Keywords - repeated dataset tag per keyword)
     - `2:120` (Caption / Abstract / Description)
     - `2:80` (By-line / Author / Creator)
     - `2:105` (Headline), `2:110` (Credit), `2:115` (Source).
2. **Lapisan 2: EXIF IFD0 (TIFF Header & Windows XP Tags UCS-2 / UTF-16LE)**:
   - Tag standar ASCII: `ImageDescription` (`0x010E`), `Artist` (`0x013B`), `Software` (`0x0131`).
   - Tag Windows XP Extended (format UCS-2 / UTF-16LE null-terminated):
     - `XPTitle` (`0x9C9B`)
     - `XPKeywords` (`0x9C9E` - format pemisah titik koma `tag1;tag2;tag3`)
     - `XPComment` (`0x9C9C`)
     - `XPAuthor` (`0x9C9D`)
     - `XPSubject` (`0x9C9F`)
   - Disematkan ke chunk PNG `eXIf` atau segmen JPEG APP1 `Exif\0\0`.
3. **Lapisan 3: Adobe XMP Packet (Dublin Core RDF XML)**:
   - Disematkan ke chunk PNG `iTXt` (`XML:com.adobe.xmp`) & segmen JPEG APP1 (`http://ns.adobe.com/xap/1.0/\0`).
   - Memuat skema lengkap:
     - `<dc:title><rdf:Alt><rdf:li xml:lang="x-default">...`
     - `<dc:description><rdf:Alt><rdf:li xml:lang="x-default">...`
     - `<dc:creator><rdf:Seq><rdf:li>...`
     - `<dc:subject><rdf:Bag><rdf:li>tag 1</rdf:li>...`
     - `<photoshop:Headline>`, `<photoshop:Credit>`, `<photoshop:Source>`, `<xmp:CreatorTool>`.

#### 3. Spesifikasi Konten Metadata Microstock
- **Adobe Stock Title (SEO)**:
  - Wajib dalam Bahasa Inggris (*English*), maksimal **120 karakter**.
  - Dilengkapi *live character counter badge* di UI (`114/120 CHARS`).
- **Keywords / Tags**:
  - **10 hingga 48 kata kunci** relevan.
  - Batasan ketat **maksimal 2 kata per tag** (misal: `"flat vector"`, `"fox mascot"`, bukan kalimat panjang).
- **Penamaan File SEO Otomatis**:
  - File yang diunduh otomatis dinamai sesuai judul SEO yang disanitasi (misal: `vintage_coffee_emblem_mascot_with_ribbon_banner_1x1.png`).

#### 4. Profil Kontributor & Pembersihan Tag Anti-Reject
- **Nama Author / Artist Mandiri**: Pengguna dapat menentukan nama author/brand sendiri via modal profil (tersimpan di `localStorage`) yang otomatis disematkan ke IPTC `By-line 2:80`, EXIF `Artist`/`XPAuthor`, dan XMP `dc:creator`.
- **Pembersihan Kata "AI" & "Generator"**: Seluruh metadata binary diatur bebas dari kata "AI" atau "AI Generator". Tag default software disetel menjadi `"Adobe Illustrator"`, credit menjadi nama author, dan source menjadi `"Original Vector Artwork"` agar terhindar dari auto-reject oleh sistem filter agensi microstock.

---

## 7. Aturan UI/UX (Wajib Patuh pada [DESIGN.md](file:///D:/GPTIMAGEGENERATE/DESIGN.md))

Setiap agen yang membuat atau mengedit komponen UI frontend wajib mematuhi aturan berikut:
1. **Gaya**: Industrial minimalism, fungsional, tanpa elemen dekoratif berlebih.
2. **Borders & Corners**: Tidak menggunakan sudut membulat (`rounded-none` atau tanpa radius sudut) kecuali sangat esensial.
3. **Warna**:
   - Background aplikasi: `stone-50` (`#fafaf9`).
   - Card/Surface: `white` dengan border halus `stone-200` (`#e7e5e4`).
   - Teks utama & tombol primer: `stone-900` (`#1c1917`).
   - Teks sekunder: `stone-400` / `stone-500`.
4. **Tipografi & Angka Biaya**:
   - `Inter` untuk body teks dan heading.
   - `IBM Plex Mono` untuk angka biaya (`$0.040079`), counter generate ulang (`v1`, `v2`), token counts, ID prompt, parameter teknis (`--ar 1:1`), dan snippet prompt.
5. **Labels & Tombol**: Uppercase dengan tracking lebar (`tracking-wider` atau `tracking-widest`).
6. **Menu & Fitur Card Per-Gambar (`ImageResultCard.tsx`)**:
   - **Menu Download Langsung**: Tombol primer atau sekunder untuk mengunduh file PNG 1:1 langsung ke penyimpanan lokal pengguna.
   - **Tombol Generate Ulang Bertarif**: Tombol re-roll wajib mencantumkan kenaikan harga (`+$0.020000 / ~Rp 320`) di dalam tombol.
   - **Tabel Akumulasi Biaya Real-time**: Menampilkan biaya prompt awal, biaya kumulatif semua render gambar, dan total biaya keseluruhan item tersebut.
   - **Pemilih Versi Gambar**: Jika di-generate ulang, sediakan tab/pill versi (misal: `[v1] [v2 - Aktif]`) dengan tombol download untuk masing-masing versi.

---

## 8. Panduan untuk AI Agent saat Menulis Kode

- **No Premature Complexity**: Buat fitur esensial terlebih dahulu: Input ide -> Generate prompt -> Simpan ke SQLite -> Copy to clipboard -> Lihat history.
- **Always Keep SQLite Local**: Lokasi file database disimpan di folder `data/prompt_studio.db`. Pastikan folder `data/` dibuat secara otomatis jika belum ada.
- **Environment Safety**: Simpan semua kredensial dan API Key (`OPENROUTER_API_KEY`, dll) di file `.env`. Jangan pernah mencatat API key ke dalam file repositori atau database secara hardcoded. Sediakan selalu template variabel di `.env.example`.
- **Organisasi Folder Gambar Berdasarkan Tanggal**: Setiap file gambar yang digenerate wajib disimpan secara lokal ke dalam folder khusus per tanggal generate: `data/outputs/YYYY-MM-DD/img_[timestamp]_[index].png`. Pastikan subdirektori tanggal otomatis dibuat menggunakan `fs.mkdir(dir, { recursive: true })`, lalu catat path file tersebut ke kolom `image_path` di SQLite.
- **Fail Gracefully**: Jika API key belum dikonfigurasi, berikan notifikasi validasi yang jelas dan cegah pemanggilan API eksternal secara sia-sia.

## 9. Spesifikasi Integrasi OpenRouter API (TypeScript)

Aplikasi ini menggunakan integrasi **Dual-Model OpenRouter**:
1. **Prompt Generator Engine**: `deepseek/deepseek-v4-flash-0731` (mengeksplorasi, mengekspansi ide kasar menjadi prompt visual artistik terstruktur).
2. **Image Generator Engine**: `openai/gpt-image-2.5-sunburst` (menghasilkan gambar dari prompt visual).

---

### 9.1 Konfigurasi Environment Variable (`.env`)

Semua kredensial dan model OpenRouter disimpan di file `.env` pada root direktori:

```env
# ==============================================================================
# OPENROUTER API CREDENTIALS & MODELS
# ==============================================================================
# Dapatkan API key di https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Model untuk Prompt Expansion / Engineering (Chat Completion)
OPENROUTER_PROMPT_MODEL=deepseek/deepseek-v4-flash-0731

# Model untuk Image Generation (Text-to-Image)
OPENROUTER_IMAGE_MODEL=openai/gpt-image-2.5-sunburst

# ==============================================================================
# SERVER & APP CONFIGURATION
# ==============================================================================
PORT=3001
NODE_ENV=development
```

---

### 9.2 Service 1: Prompt Generator Engine (`deepseek/deepseek-v4-flash-0731`)

Service ini memanggil endpoint OpenRouter Chat Completions untuk mengubah ide kasar pengguna menjadi prompt visual siap pakai yang sangat detail dan terstruktur:

```typescript
// server/services/prompt-engine.service.ts

export interface PromptExpansionParams {
  rawIdea: string;
  targetEngine?: 'flux' | 'midjourney' | 'sdxl' | 'dall-e';
  aspectRatio?: string;
  stylePreset?: string;
  isBlackAndWhite?: boolean; // Checklist mode hitam putih
}

export interface PromptExpansionResult {
  title: string;
  optimizedPrompt: string;
  negativePrompt?: string;
  vectorStyle?: string; // misal: Flat Design, Mascot, Sticker Decal, Monoline, Pop Art
  colorPalette?: string; // misal: Pure Black & White, atau 3-color solid
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    promptCostUsd: string;
    promptCostIdr: string;
  };
}

export async function generateOptimizedPrompt(
  params: PromptExpansionParams,
  model: string = process.env.OPENROUTER_PROMPT_MODEL || 'deepseek/deepseek-v4-flash-0731'
): Promise<PromptExpansionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY belum disetel di file environment (.env)');
  }

  const systemPrompt = `You are an expert prompt engineer specializing in 2D vector graphic assets, icons, and sticker art optimized for SVG autotracing and cost-effective generation.
Convert the user's raw idea into a concise, token-efficient, high-contrast 2D prompt (strictly 30-50 words maximum).
Strict rules:
1. Token Efficiency: Zero filler words. High-density visual descriptors only.
2. 2D Vector Look: Flat vector art, sharp outlines, solid fills, isolated on pure white background.
3. Black & White Mode Handling: If requested, enforce pure black ink line art/silhouette on solid white background with zero grays, zero shadows, and zero colors.
4. Prohibit photorealism, 3D renders, metallic highlights, and complex gradients.
Respond strictly in JSON format with keys:
- title: (short 3-5 word summary)
- optimizedPrompt: (concise 30-50 words vector prompt in English)
- negativePrompt: (concise negative keywords)
- vectorStyle: (e.g., Monoline B&W, Flat Vector Art, Stencil Decal)
- colorPalette: (e.g., Pure Black on White, or 3-color solid)`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Raw idea: "${params.rawIdea}". Target Engine: ${params.targetEngine || 'flux'}. Aspect Ratio: ${params.aspectRatio || '1:1'}. Style: ${params.stylePreset || 'default'}. Black & White Mode: ${params.isBlackAndWhite ? 'ENABLED (Pure Black and White Ink Art only, no color)' : 'DISABLED (Flat Solid Color)'}.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter Prompt Engine Error [${response.status}]: ${errorBody}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  // Ambil token aktual dari response OpenRouter
  const promptTokens = result.usage?.prompt_tokens ?? 0;
  const completionTokens = result.usage?.completion_tokens ?? 0;
  const totalTokens = result.usage?.total_tokens ?? (promptTokens + completionTokens);

  // Tarif DeepSeek v4 Flash: Input $0.14/1M, Output $0.56/1M
  const costUsd = (promptTokens * 0.00000014) + (completionTokens * 0.00000056);
  const costIdr = costUsd * 16000;

  return {
    ...parsed,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
      promptCostUsd: costUsd.toFixed(6),
      promptCostIdr: `Rp ${costIdr.toFixed(2)}`,
    },
  } as PromptExpansionResult;
}
```

---

### 9.3 Service 2: Image Generator Engine (`openai/gpt-image-2.5-sunburst`)

Service ini memanggil OpenRouter Image Generation API untuk membuat visual berbasis prompt yang telah dioptimasi:

```typescript
// server/services/image-generator.service.ts
import fs from 'node:fs/promises';
import path from 'node:path';

export interface OpenRouterImagePayload {
  model: string;
  prompt: string;
  response_format?: 'b64_json' | 'url';
  aspect_ratio?: string; // Standard 1:1 untuk microstock
}

export interface OpenRouterImageItem {
  b64_json?: string;
  url?: string;
}

export interface OpenRouterImageResponse {
  created?: number;
  data: OpenRouterImageItem[];
}

export interface SavedImageResult {
  fileName: string;
  relativePath: string; // misal: "outputs/2026-09-10/img_1725940000000_0.png"
  absolutePath: string;
}

export async function generateOpenRouterImage(
  prompt: string,
  model: string = process.env.OPENROUTER_IMAGE_MODEL || 'openai/gpt-image-2.5-sunburst'
): Promise<OpenRouterImageResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY belum disetel di file environment (.env)');
  }

  const payload: OpenRouterImagePayload = {
    model,
    prompt,
    response_format: 'b64_json',
    aspect_ratio: '1:1', // Standard 1:1 square canvas untuk image stock
  };

  const response = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter Image API Error [${response.status}]: ${errorBody}`);
  }

  const result: OpenRouterImageResponse = await response.json();
  return result;
}

/**
 * Menyimpan buffer base64 gambar ke folder khusus per tanggal: data/outputs/YYYY-MM-DD/
 */
export async function saveGeneratedImagesByDate(
  images: OpenRouterImageItem[]
): Promise<SavedImageResult[]> {
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const dateDir = path.join(process.cwd(), 'data', 'outputs', today);

  // Buat folder tanggal otomatis secara rekursif jika belum ada
  await fs.mkdir(dateDir, { recursive: true });

  const savedResults: SavedImageResult[] = [];
  const timestamp = Date.now();

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    if (!item.b64_json) continue;

    const fileName = `img_${timestamp}_${i}.png`;
    const absolutePath = path.join(dateDir, fileName);
    const relativePath = path.posix.join('outputs', today, fileName);

    const buffer = Buffer.from(item.b64_json, 'base64');
    await fs.writeFile(absolutePath, buffer);

    savedResults.push({
      fileName,
      relativePath,
      absolutePath,
    });
  }

  return savedResults;
}
```

---

### 9.4 Service 3: Cost Calculator & Live Token Estimator

Service ini digunakan oleh backend dan frontend untuk menghitung token input/output secara pra-eksekusi (*pre-flight*) serta memisahkan perhitungan biaya prompt dan gambar:

```typescript
// server/services/cost-calculator.service.ts

export interface PrePromptEstimate {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedPromptCostUsd: number;
  estimatedPromptCostIdr: number;
  formula: string;
}

export interface PreImageEstimate {
  imageCount: number;
  costPerImageUsd: number;
  estimatedImageCostUsd: number;
  estimatedImageCostIdr: number;
}

export interface TotalCostEstimate {
  promptEstimate: PrePromptEstimate;
  imageEstimate: PreImageEstimate;
  totalCostUsd: number;
  totalCostIdr: number;
}

export const PRICING_CONFIG = {
  // DeepSeek v4 Flash (Chat Completions)
  PROMPT_INPUT_PER_TOKEN_USD: 0.00000014, // $0.14 per 1M tokens
  PROMPT_OUTPUT_PER_TOKEN_USD: 0.00000056, // $0.56 per 1M tokens
  SYSTEM_PROMPT_BASE_TOKENS: 260, // Estimasi token system prompt 2D vector
  
  // GPT Image 2.5 Sunburst (Text-to-Image 1:1)
  IMAGE_FLAT_COST_PER_UNIT_USD: 0.020000, // $0.02 per gambar 1:1
  
  // Kurs konversi
  USD_TO_IDR_RATE: 16000,
};

/**
 * Mengestimasi jumlah token secara cepat (~3.8 karakter per token)
 */
export function estimateTextTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.trim().length / 3.8);
}

/**
 * Menghitung estimasi token dan biaya sebelum memanggil LLM Prompt Expansion
 */
export function estimatePromptCost(rawIdea: string): PrePromptEstimate {
  const userTokens = estimateTextTokens(rawIdea);
  const estimatedInputTokens = PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS + userTokens;
  // Prompt 2D vector padat ditargetkan 30-50 kata (~65 token output)
  const estimatedOutputTokens = 65;

  const costUsd = (estimatedInputTokens * PRICING_CONFIG.PROMPT_INPUT_PER_TOKEN_USD) +
                  (estimatedOutputTokens * PRICING_CONFIG.PROMPT_OUTPUT_PER_TOKEN_USD);

  return {
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedPromptCostUsd: Number(costUsd.toFixed(6)),
    estimatedPromptCostIdr: Math.round(costUsd * PRICING_CONFIG.USD_TO_IDR_RATE * 100) / 100,
    formula: `(${estimatedInputTokens} in × $0.00000014) + (${estimatedOutputTokens} out × $0.00000056)`,
  };
}

/**
 * Menghitung estimasi biaya pembuatan visual gambar 1:1
 */
export function estimateImageCost(imageCount: number = 1): PreImageEstimate {
  const costUsd = imageCount * PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD;
  return {
    imageCount,
    costPerImageUsd: PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD,
    estimatedImageCostUsd: Number(costUsd.toFixed(6)),
    estimatedImageCostIdr: Math.round(costUsd * PRICING_CONFIG.USD_TO_IDR_RATE),
  };
}

/**
 * Menggabungkan rincian biaya terpisah (Prompt + Image) sebelum pengguna menekan tombol
 */
export function calculateFullPipelineCost(rawIdea: string, imageCount: number = 1): TotalCostEstimate {
  const promptEst = estimatePromptCost(rawIdea);
  const imageEst = estimateImageCost(imageCount);

  const totalUsd = Number((promptEst.estimatedPromptCostUsd + imageEst.estimatedImageCostUsd).toFixed(6));
  const totalIdr = Math.round((promptEst.estimatedPromptCostIdr + imageEst.estimatedImageCostIdr) * 100) / 100;

  return {
    promptEstimate: promptEst,
    imageEstimate: imageEst,
    totalCostUsd: totalUsd,
    totalCostIdr: totalIdr,
  };
}
```

---

### 9.5 Spesifikasi REST API Backend (Fastify + SQLite)

Backend Fastify berjalan di port `3001` dan melayani rute-rute berikut:

| Method | Endpoint | Deskripsi | Payload / Parameter |
|---|---|---|---|
| `GET` | `/api/prompts` | Mengambil seluruh riwayat kartu yang tersimpan di SQLite | - |
| `POST` | `/api/prompts` | Menyimpan / memperbarui (*upsert*) satu kartu variasi | JSON objek `PromptItem` |
| `POST` | `/api/prompts/batch` | Menyimpan banyak kartu variasi sekaligus ke SQLite | `{ items: PromptItem[] }` |
| `POST` | `/api/generate-prompt` | AI Prompt Expansion via DeepSeek v4 Flash dengan style lock | `{ rawIdea, stylePreset, variationStyle, variationIndex, isBlackAndWhite }` |
| `POST` | `/api/generate-image` | AI Image Generation via GPT Image 2.5 Sunburst & simpan disk | `{ prompt: string, model?: string }` |
| `GET` | `/api/currency/exchange-rate` | Ambil kurs USD -> IDR dari api.co.id (cached 1x/hari di SQLite) | - |
| `GET` | `/api/currency/history` | Riwayat catatan kurs harian di SQLite | - |
| `DELETE` | `/api/prompts/:id` | Menghapus kartu tertentu dari database SQLite | Parameter URL `:id` |
| `DELETE` | `/api/prompts` | Menghapus seluruh riwayat di database SQLite | - |
| `GET` | `/api/health` | Pemeriksaan kesehatan server dan status environment | - |

---

## 10. Fitur Auto-Runner Wizard (Batch Pipeline Kelipatan 10 & Bebas)

Fitur **Auto-Runner Wizard** adalah alur otomatisasi batch fleksibel yang memungkinkan pengguna menghasilkan aset 2D siap vektor secara sekuensial hanya dari 1 keyword/subjek ide dengan pilihan kelipatan 10 (10, 20, 30, 40, 50, 60, 70, 80, 90, 100) atau input kuantitas bebas.

### 10.1 Alur Wizard 3 Langkah
1. **Langkah 1: Setup Ide & Gaya Visual**
   - 1 Keyword input (misal: *"maskot rubah mekanik"*).
   - Pemilihan dari 6 Preset Gaya Grafis 2D Siap Vektor.
   - Checklist Mode Hitam Putih (*Pure B&W Monochrome Vector*).
2. **Langkah 2: Kuantitas (Pilihan Kelipatan 10 & Bebas) & Pra-Estimasi Biaya Transparan**
   - Tombol cepat kelipatan 10: `[10] [20] [30] [40] [50] [60] [70] [80] [90] [100]`.
   - Tombol penyesuaian cepat `[-10]` / `[+10]` serta direct number input & range slider.
   - Perhitungan pra-estimasi biaya sebelum start:
     - Biaya Prompt: $N \times (\text{Input Token} \times \$0.00000014 + \text{Output Token} \times \$0.00000056)$
     - Biaya Visual: $N \times \$0.02000$ (GPT Image 2.5 Sunburst 1:1)
     - Total dalam USD & IDR berdasarkan kurs real-time harian.
3. **Langkah 3: Live Auto-Runner Dashboard**
   - **Progres Bar Real-time**: Menampilkan `Item X dari Y Selesai (%)`.
   - **Active Phase Indicator**:
     - `⚡ Menulis Prompt AI #N (DeepSeek v4 Flash)...`
     - `🎨 Merender Gambar 1:1 #N (GPT Image 2.5)...`
     - `💾 Menyimpan ke SQLite & Disk #N...`
   - **Live Spend Counter**: Akumulasi biaya riil aktual per detik.
   - **Kontrol Antrean Penuh**: Tombol `Jeda (Pause)`, `Lanjutkan (Resume)`, dan `Berhenti (Stop)`.
   - **Live Stream Gallery**: Hasil gambar langsung muncul satu per satu di layar tanpa harus menunggu ke-50 item selesai.
   - **Batch Download**: Tombol unduh semua hasil gambar PNG sekaligus.

### 10.2 Siklus Eksekusi Mesin Antrean (`useAutoRunner.ts`)
```text
[Loop i = 1 .. N]
  ├── 1. Generate Prompt AI Unik (Variasi Sudut / Komposisi ke-i dari Preset yang Dipilih)
  ├── 2. Render Gambar 1:1 via OpenRouter GPT Image 2.5 Sunburst
  ├── 3. Simpan File PNG ke data/outputs/YYYY-MM-DD/img_wiz_timestamp_i_v1.png
  ├── 4. Simpan Metadata & Biaya Riil ke SQLite data/prompt_studio.db
  ├── 5. Update State Real-time & Munculkan di Grid Preview
  └── 6. Delay Aman (600ms) untuk Mencegah HTTP 429 Rate Limit
```

---

## 11. Garansi Konsistensi Gaya Preset (Preset Style Locking)

Untuk menjamin bahwa ketika pengguna memilih salah satu dari 6 kategori gaya (misal: **Flat Vector Art**), seluruh variasi (1 s/d 50) tidak pernah tercampur atau melenceng menjadi gaya lain (*seperti badge, stencil, sticker decal, atau monoline*):

1. **Preset-Specific Variation Dictionary (`src/data/presets.ts`)**:
   Setiap preset memiliki array variasi sudut pandang internalnya sendiri (`PRESET_VARIATIONS`):
   - *Flat Vector Art*: Dynamic Front View, Side Profile Silhouette, Isometric 2D Angle, Symmetrical Composition, 3/4 Dynamic Angle, Close-Up Focal Crop, Full-Body Geometric Layout, Minimalist Deconstructed.
   - *Mascot Character*: Aggressive Front View, Dynamic 3/4 Action Pose, Side Profile Mascot Head, Shield Framed Mascot, Expressive Head Icon, Esports Stance.
   - *Monoline Line Art*: Continuous Single Line, Geometric Wireframe, Symmetrical Monoline, Circular Motif, Isometric Wireframe, Minimalist Profile.
   - *Sticker Decal*: Die-Cut White Border, Holographic Decal, Chibi Stylized, Angled Decal Patch, Emblem Sticker.
   - *Vintage Emblem*: Circular Retro Seal, Shield Heritage Crest, Diamond Stamp, Hexagonal Badge, Curved Banner.
   - *Stencil Silhouette*: High-Contrast Negative Space, Urban Stencil, Minimalist Cutout, Geometric Mask, Dual-Layer Stencil.
2. **Instruksi Restriktif di Prompt Engine Backend (`server/services/prompt-engine.service.ts`)**:
   Sistem menyertakan aturan mutlak `STRICT STYLE CONSISTENCY` yang melarang AI berpindah genre visual selain yang dipilih oleh pengguna.
3. **Fallback Vector SVG Generator (`src/utils/vectorGraphicGenerator.ts`)**:
   Engine fallback SVG lokal secara spesifik merender bentuk geometris sesuai `stylePreset` yang aktif.

---

## 12. Arsitektur FIFO Task Queue Worker & Offline Auto-Cancellation

Untuk memberikan fleksibilitas maksimal kepada pengguna dalam mengklik tombol render pada beberapa kartu sekaligus tanpa membebani sistem AI atau melanggar batas rate limit (HTTP 429), sistem menerapkan **FIFO Background Task Queue Worker** yang dipadukan dengan **Proteksi Pembatalan Otomatis saat Jaringan Terputus (Offline)**:

### 12.1 Logika FIFO Queue Worker (`src/hooks/usePromptGenerator.ts`)
1. **Multi-Card Enqueuing**: Pengguna bebas mengklik tombol render pada kartu mana pun. Permintaan tersebut tidak ditolak, melainkan dimasukkan ke dalam antrean `taskQueue: QueueTask[]`.
2. **Dynamic Card State**:
   - **Sedang Diproses**: `[ 🎨 MERENDER VISUAL 1:1... ]` (Badge kuning amber berkedip).
   - **Mengantre**: `[ ⏳ ANTREAN KE-#N (MENUNGGU) ]` + Tombol `[ ✕ Batal ]` untuk membatalkan kartu tertentu.
   - **Idle**: Tombol render normal aktif.
3. **Pemberian Jeda Aman (Safety Throttle)**: Worker mengeksekusi antrean secara berurutan (*sequential FIFO*) dengan jeda aman 600ms antar panggilan AI.
4. **Master Batch Controls**: Header batch menyediakan tombol `[ BATALKAN SEMUA ANTREAN ]` untuk membersihkan seluruh antrean pending dalam 1 klik.

### 12.2 Proteksi Koneksi Terputus (Offline Network Auto-Cancellation)
Untuk mencegah *request ghosting*, error berulang (*network timeout*), atau inkonsistensi database saat koneksi internet mati:
1. **Network Event Listener**: Terhubung langsung ke `window.addEventListener('offline')` dan `navigator.onLine`.
2. **Seketika Mengosongkan Antrean**: Saat event `offline` terpicu atau sebelum task berikutnya dieksekusi saat koneksi tidak aktif, seluruh item yang masih menunggu di antrean seketika dibatalkan (`taskQueueRef.current = []`).
3. **Alert Banner Informatif**: Menampilkan notifikasi visual: `"⚠️ Koneksi internet terputus! N antrean render gambar telah dibatalkan secara otomatis demi keamanan & kuota."`

---

## 13. Arsitektur Multi-Version Prompt Timeline & History Switcher (SQLite Persisted)

Fitur ini menjamin bahwa setiap kali pengguna melakukan regenerasi prompt AI pada suatu kartu, prompt-prompt sebelumnya **tidak akan hilang**, melainkan disimpan sebagai **riwayat timeline versi (`v1`, `v2`, `v3`...)**:

### 13.1 Struktur & Pola Penyimpanan Data
- **`PromptVersion` Interface**:
  - `version`: Nomor versi urut (1, 2, 3...)
  - `optimizedPrompt`: Teks prompt visual 2D
  - `negativePrompt`: Negative prompt pencegah foto & 3D
  - `title` & `vectorStyle`: Metadata sudut pandang / komposisi
  - `inputTokens`, `outputTokens`, `promptCostUsd`: Ledger biaya per versi
  - `timestamp`: Waktu generate versi tersebut
- **Database SQLite**:
  - Kolom `prompt_versions_data`: String JSON array `PromptVersion[]`
  - Kolom `active_prompt_version_index`: Indeks integer versi yang sedang aktif

### 13.2 Perilaku UI & Ergonomi Desain (Industrial Minimalism)
1. **Highlight Versi Aktif di Bagian Atas**: Prompt terpilih diletakkan di kotak paling atas dengan latar gelap solid dan badge `[ vN AKTIF ]`.
2. **Scrollable Compact Container (Anti-Panjang Kebawah)**:
   - Timeline riwayat lama dibungkus dalam container dengan tinggi tetap (`max-h-48 sm:max-h-52`) dan scrollbar vertikal halus.
   - Kartu tetap proporsional dan rapi meskipun dilakukan regenerasi hingga puluhan kali.
3. **Status Semi-Transparan (Dimmed)**:
   - Versi lama yang tidak aktif ditampilkan dengan `opacity-65 hover:opacity-100` dan garis batas putus-putus.
   - Dilengkapi tombol cepat **`[ ↺ Gunakan ]`** untuk beralih kembali ke versi tersebut dan tombol **`[ 📋 Salin ]`** per versi.

---

## 14. Arsitektur Diagnostic Error Logger, Recovery System & Performance Reliability

Untuk memastikan seluruh kegagalan eksekusi render gambar atau API tercatat secara transparan dan mudah didiagnosis:

### 14.1 Pencatatan Ganda (Disk Log & In-Memory Ring Buffer)
1. **Pencatatan ke Disk Lokal (`server/services/error-logger.service.ts`)**:
   - Setiap kali terjadi exception pada pembuatan gambar 1:1 (`openai/gpt-image-2.5-sunburst`), ekspansi prompt (`deepseek/deepseek-v4.1-flash`), atau kurs harian, backend otomatis mencatat entri ke:
     ```text
     data/logs/error_YYYY-MM-DD.log
     ```
   - Format log mencakup: Timestamp harian, HTTP Status Code, Tipe Operasi, Model AI, Pesan Error, Snippet Prompt, Response Body mentah, dan Stack Trace.
2. **In-Memory Buffer (Maksimal 100 Entri)**:
   - Server menyimpan 100 entri error terbaru di RAM untuk diakses secara instan oleh frontend tanpa overhead pembacaan disk berulang.
3. **REST API Endpoints**:
   - `GET /api/logs/errors`: Mengambil seluruh riwayat error sistem terbaru.
   - `DELETE /api/logs/errors`: Membersihkan riwayat error di memori.

### 14.2 Fastify Server BodyLimit & Proteksi Payload Besar
- **Masalah**: Gambar 1024x1024 berformat PNG Base64 berukuran sekitar **1.1 MB – 1.5 MB**. Batas default Fastify adalah 1MB (`1,048,576 bytes`), yang dapat memicu `FST_ERR_CTP_BODY_TOO_LARGE` atau pemutusan koneksi sepihak.
- **Solusi**: Server Fastify dikonfigurasi dengan:
  ```typescript
  const server = Fastify({
    logger: true,
    bodyLimit: 50 * 1024 * 1024, // 50 MB
  });
  ```
- **Pengiriman Berbasis URL File Lokal**: Backend langsung menulis buffer gambar ke `data/outputs/YYYY-MM-DD/img_xxx.png` dan mengirimkan URL relatif `/${relativePath}` ke browser. Hal ini mencegah browser menyimpan string Base64 raksasa dan menghindari error kuota penyimpanan `localStorage` (`QuotaExceededError`).

### 14.3 Kalibrasi Durasi Progress Bar (`CardLoadingBar.tsx`)
- **Fase Prompt Expansion**: Estimasi `3500ms` (3.5 detik).
- **Fase Render Gambar 1:1**: Estimasi `20000ms` (20 detik) per gambar agar pergerakan persentase 0–100% bergerak proporsional dan realistis terhadap waktu respon riil OpenRouter.

### 14.4 UI Error Log Modal & Akses Cepat
- **Navbar Indicator**: Tombol `[ ⚠️ Log Error ]` dengan badge merah aktif di header atas.
- **Kartu & Banner Shortcut**: Tombol langsung `[ 📋 Lihat Detail Log Error ]` di banner notifikasi kegagalan render.
- **Modal Interaktif (`src/components/ErrorLogModal.tsx`)**:
  - Filter tab per kategori (*Semua*, *Gambar*, *Prompt AI*).
  - Collapsible viewer untuk raw JSON payload dan stack trace.
  - Tombol 1-klik untuk menyalin laporan error ke clipboard untuk kemudahan debugging.