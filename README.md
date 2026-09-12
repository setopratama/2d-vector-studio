# ⚡ Agentic AI 2D Vector Studio

[![Version](https://img.shields.io/badge/version-v1.3.0-amber.svg?style=flat-square)](docs/VERSION_CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Proprietary-stone.svg?style=flat-square)](#-lisensi)
[![Stack](https://img.shields.io/badge/stack-React_19_+_Fastify_+_SQLite-blue.svg?style=flat-square)](docs/ARCHITECTURE.md)
[![Metadata](https://img.shields.io/badge/metadata-IPTC_%7C_EXIF_%7C_XMP-emerald.svg?style=flat-square)](docs/METADATA_SPECIFICATION.md)

Studio pembuatan prompt dan aset visual **2D Siap Vektor (Vector-Ready Assets)** berbasis AI lokal mandiri (*local-first / self-hosted*). Dirancang khusus untuk desainer, ilustrator, dan kontributor microstock (**Adobe Stock**, **Shutterstock**, **Freepik**) dengan sistem **Pra-Estimasi Biaya Transparan (Prompt vs Gambar)**, **AI Concept Expander**, **Auto-Runner Wizard**, dan **Injektor Metadata Biner 3-Lapisan Tanpa Dependensi Luar**.

---

## 📚 Pusat Dokumentasi Resmi (`docs/`)

Untuk panduan mendalam dan spesifikasi teknis lengkap, silakan merujuk ke dokumen berikut:

| Dokumen | Deskripsi Singkat |
|---|---|
| 📖 **[Panduan Pengguna (User Guide)](docs/USER_GUIDE.md)** | Panduan alur kerja dari input 1–2 kata dasar, pemilihan gaya 2D, kalkulasi biaya, Auto-Runner, hingga ekspor PNG ber-metadata. |
| 🏗️ **[Arsitektur & Spesifikasi Sistem](docs/ARCHITECTURE.md)** | Desain monorepo terpadu (Vite + React 19 + Fastify + SQLite `better-sqlite3`), FIFO queue worker, dan alur API AI. |
| 🔒 **[Spesifikasi Injeksi Metadata Biner](docs/METADATA_SPECIFICATION.md)** | Penjelasan teknis injektor biner 3-lapisan (*IPTC IIM 8BIM, EXIF IFD0 UCS-2, Adobe XMP*) murni tanpa `exiftool`/`sharp`. |
| 📜 **[Riwayat Versi & Catatan Rilis (Changelog)](docs/VERSION_CHANGELOG.md)** | Catatan pembaruan dari `v1.0.0` hingga `v1.3.0`, saklar mode UI, dan panduan rollback Git Tag. |

---

## 🌟 Fitur Utama

### 1. 🧠 AI Concept Expander (1–2 Kata Dasar → 4 Ide Subjek 3–4 Kata)
- **Solusi Buntu Ide**: Cukup ketik 1 atau 2 kata dasar (misal: *"kopi susu"*, *"rubah mekanik"*, *"mobil"*).
- **Subjek Murni & Netral**: Menghasilkan 4 ide konsep subjek/objek imajinatif (tepat 3–4 kata) tanpa embel-embel label gaya teknis (*flat, stencil, badge*), sehingga bebas dipadukan dengan gaya grafis 2D apa pun tanpa bentrok kata.
- **Transparansi Biaya & Token**: Pra-estimasi dan biaya riil aktual (~$0.000030 / ~Rp 0,50 per 1x eksekusi).
- **1-Klik Terapkan**: Klik kartu konsep untuk mengisi input utama atau masukkan sekaligus ke list pack.

### 2. ⚡ Auto-Runner Wizard (Batch Pipeline Kelipatan 10 & Bebas)
- **Input 1 Keyword**: Masukkan ide subjek singkat.
- **Kuantitas Fleksibel**: Pilihan cepat kelipatan 10 (`10`, `20`, `30`, `50`, `100`), slider, dan input manual.
- **Eksekusi Sekuensial Otomatis**: Menghasilkan Prompt AI unik $\rightarrow$ render gambar 1:1 $\rightarrow$ simpan ke SQLite DB & folder disk.
- **Kontrol Penuh**: Tombol **Jeda (Pause)**, **Lanjutkan (Resume)**, dan **Berhenti (Stop)** dengan akumulasi biaya riil.
- **Batch Download**: Unduh semua gambar ber-metadata dengan penamaan file SEO bersih.

### 3. 🎨 6 Preset Gaya 2D Siap Vektor (Terkunci Konsisten)
1. **Flat Vector Art**: Minimalist screen-print, garis tegas, warna datar padat, siap autotrace SVG.
2. **Mascot Character**: Maskot karakter die-cut dengan garis kontur tebal untuk merchandise & esport.
3. **Monoline Line Art**: Garis tunggal presisi dengan ketebalan seragam (*uniform stroke width*).
4. **Sticker Decal**: Stiker grafis dengan border offset putih die-cut.
5. **Vintage Badge / Emblem**: Segel retro geometris simetris dengan linework stempel klasik.
6. **Stencil Silhouette**: Siluet kontras tinggi dengan jembatan *negative space*.

### 4. ⬛ Mode Hitam Putih (B&W Monochrome Vector)
- Menghasilkan tinta hitam pekat 100% di atas latar belakang putih bersih (*zero grayscale, zero shadows*).
- Format paling hemat dan paling sempurna untuk proses *autotrace* vektor menjadi kurva path tunggal di Adobe Illustrator atau Inkscape.

### 5. 💰 Pra-Estimasi Biaya Transparan (Prompt vs Gambar Dipisah)
- **Tahap 1 (Prompt Expansion)**: `deepseek/deepseek-v4-flash-0731` ($0.14 / 1M token input & $0.56 / 1M token output).
- **Tahap 2 (Visual Render 1:1)**: `openai/gpt-image-2.5-sunburst` ($0.020 / visual 1:1).
- Kalkulasi live dalam **USD** dan **IDR** sebelum pengguna menekan tombol generate.

### 6. 🏷️ Injeksi Metadata 3-Lapisan (Zero External Dependencies) & SEO Microstock
- **100% Native Pure JS / Zero Dependencies**: Tanpa `exiftool`, `sharp`, atau `piexifjs`. Dibangun manual menggunakan TypedArray native (`Uint8Array`, `ArrayBuffer`, `DataView`) dan tabel bitwise CRC32.
- **Sinkronisasi Serentak 3 Lapisan (Adobe Stock / Shutterstock / Freepik)**:
  1. **IPTC IIM**: Segmen APP13 Photoshop 8BIM (`0x0404`), Record 2 (`2:05`, `2:25`, `2:120`, `2:80`) dengan deklarasi charset UTF-8 (`\x1b%G`).
  2. **EXIF IFD0**: Tag standar (`ImageDescription`, `Artist`, `Software`) dan Tag Windows XP Extended (`XPTitle`, `XPKeywords`, `XPComment`, `XPAuthor`, `XPSubject`) berformat UCS-2 / UTF-16LE.
  3. **Adobe XMP Packet**: Chunk PNG `iTXt` & JPEG APP1 memuat RDF XML Dublin Core (`dc:title`, `dc:description`, `dc:subject`, `dc:creator`) & Photoshop Headline/Credit.
- **AI Agent Auto SEO Title**: Judul Stock bahasa Inggris teroptimasi dengan batas ketat **maksimal 120 karakter**.
- **10–48 Keywords Microstock**: AI mengekspansi 25–45 kata kunci (*tags*) berbahasa Inggris dengan batasan **maksimal 2 kata per tag**.
- **Profil Kontributor & Pembersihan Tag (Anti-Reject Microstock)**:
  - Modal pengaturan **`[ 👤 Author / Profil Kontributor ]`** untuk mengisi nama Author/Artist/Brand.
  - Tag Software default: **`Adobe Illustrator`** (tanpa kata "AI" atau "AI Generator") agar aman saat lolos review kurasi.
- **Nama File SEO Bersih (Tanpa `1x1`)**: File unduhan otomatis dinamai sesuai judul SEO yang disanitasi (misal: `vintage_coffee_roastery_badge_isolated_on_white_background.png`).

### 7. ⏳ Background Task Queue Worker & Offline Auto-Cancellation
- **FIFO Background Execution**: Mengantrekan permintaan dan mengeksekusinya secara berurutan dengan jeda aman 600ms untuk mencegah rate limiting (HTTP 429).
- **🛡️ Auto-Cancel Saat Offline**: Jika koneksi terputus di tengah jalan, seluruh antrean pending otomatis dibatalkan seketika.

### 8. 📜 Multi-Version Prompt Timeline & History Switcher
- **Riwayat Versi Prompt (`v1`, `v2`, `v3`...)**: Prompt lama tersimpan saat pengguna meregenerasi prompt.
- **Scrollable Timeline**: Ketinggian dibatasi container scroll vertikal agar kartu tetap rapi.
- **Quick Switch**: Tombol **`[ ↺ Gunakan ]`** untuk beralih ke versi lama kapan saja.

### 9. 🌐 Kurs Real-Time Harian & 💾 SQLite Lokal
- Sinkronisasi kurs USD ke IDR dinamis via `api.co.id` dengan caching 1x per hari di SQLite lokal.
- Database lokal di `data/prompt_studio.db` via `better-sqlite3` + `Drizzle ORM`.
- File visual tersimpan rapi per tanggal di folder `data/outputs/YYYY-MM-DD/`.

### 10. 📋 Diagnostic Error Logger & System Log Modal
- Pencatatan otomatis ke `data/logs/error_YYYY-MM-DD.log` lengkap dengan Timestamp, HTTP Status, Nama Model, dan Error Message.
- Modal Error Log untuk inspeksi status code dan salin laporan sistem 1-klik.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Runtime & Tooling** | Node.js (v20+ LTS), TypeScript, tsx |
| **Frontend (FE)** | React 19, Vite, Tailwind CSS, Lucide React |
| **Backend (BE)** | Fastify v5 (Port 3001, BodyLimit 50MB) |
| **Database** | SQLite Lokal (`better-sqlite3`), Drizzle ORM |
| **Metadata Injector** | Pure JS Binary Injector (IPTC 8BIM, EXIF UCS-2, Adobe XMP) |
| **AI LLM Engine** | OpenRouter API (`deepseek/deepseek-v4-flash-0731`) |
| **AI Image Engine** | OpenRouter API (`openai/gpt-image-2.5-sunburst`) |
| **Currency API** | api.co.id Exchange Rates (Cached Daily) |

---

## 📁 Struktur Direktori

```text
GPTIMAGEGENERATE/
├── .env                        # Konfigurasi environment lokal & API Key
├── .env.example                # Template konfigurasi environment
├── AGENTS.md                   # Panduan AI Agent & operasional teknis
├── DESIGN.md                   # Panduan desain Industrial Minimalism
├── README.md                   # Dokumentasi proyek utama ini
├── docs/                       # Dokumentasi Resmi Mendalam
│   ├── README.md               # Portal indeks dokumentasi
│   ├── USER_GUIDE.md           # Panduan pengguna langkah demi langkah
│   ├── ARCHITECTURE.md         # Arsitektur sistem, Fastify & SQLite
│   ├── METADATA_SPECIFICATION.md # Spesifikasi biner IPTC/EXIF/XMP
│   └── VERSION_CHANGELOG.md    # Riwayat rilis v1.0.0 s/d v1.3.0 & rollback
├── package.json                # Dependencies gabungan & npm scripts
├── vite.config.ts              # Konfigurasi Vite & API proxy ke Fastify (:3001)
├── data/                       # Direktori Data Lokal Disk
│   ├── prompt_studio.db        # File Database SQLite Lokal (Drizzle ORM)
│   ├── logs/                   # Log error sistem harian (error_YYYY-MM-DD.log)
│   └── outputs/                # File gambar tersimpan berdasarkan tanggal generate
│       └── YYYY-MM-DD/         # Subfolder tanggal (misal: 2026-09-12/img_xxx_v1.png)
├── server/                     # Backend Fastify + SQLite
│   ├── index.ts                # Server entry point (Port 3001, BodyLimit 50MB)
│   ├── db/
│   │   ├── client.ts           # Inisialisasi better-sqlite3 & Drizzle
│   │   └── schema.ts           # Skema tabel prompts & exchange_rates
│   ├── routes/
│   │   └── prompts.route.ts    # REST API endpoints & error log routes
│   └── services/
│       ├── prompt-engine.service.ts # DeepSeek v4 expansion & keyword expander
│       ├── image-generator.service.ts # GPT Image 2.5 generator & file storage
│       ├── currency.service.ts # Kurs dinamis real-time via api.co.id + cache
│       └── error-logger.service.ts # Sistem logging kegagalan render & API
└── src/                        # Frontend React 19 + Vite
    ├── App.tsx                 # Main application layout, state & modals
    ├── components/
    │   ├── Navbar.tsx          # Top bar, live kurs, profil author, badge versi v1.3.0
    │   ├── PromptInput.tsx     # Form ide, mode batch, & checklist B&W
    │   ├── KeywordExpanderWidget.tsx # AI Concept Expander (1-2 kata -> 4 ide subjek)
    │   ├── CostEstimationCard.tsx # Pra-estimasi token & biaya terpisah
    │   ├── UnifiedVariationCard.tsx # Kartu mandiri side-by-side (Prompt Kiri, Gambar Kanan)
    │   ├── BatchCardsGrid.tsx  # Grid galeri hasil batch & master actions
    │   ├── AutoRunnerWizardModal.tsx # Modal Wizard 3 langkah (Batch 1-50)
    │   ├── MetadataSettingsModal.tsx # Modal pengaturan profil kontributor
    │   ├── VersionChangelogModal.tsx # Modal versi rilis & saklar mode antarmuka
    │   ├── ErrorLogModal.tsx   # Modal inspeksi log error & salin laporan
    │   └── HistorySidebar.tsx  # Drawer riwayat prompt dari SQLite
    ├── hooks/
    │   ├── usePromptGenerator.ts # Hook request generate prompt, gambar, & sync SQLite
    │   ├── useAutoRunner.ts    # Engine loop sekuensial batch 1-50
    │   ├── useAppSettings.ts   # Manajemen fitur & mode tampilan (localStorage)
    │   ├── useContributorProfile.ts # Manajemen profil kontributor (localStorage)
    │   ├── useCostEstimator.ts # Hook live token counter dinamis
    │   ├── useExchangeRate.ts  # Hook kurs harian USD -> IDR
    │   └── useErrorLogs.ts     # Hook manajemen & sinkronisasi log error sistem
    ├── utils/
    │   ├── imageMetadataInjector.ts # Injektor biner 3-layer murni (IPTC/EXIF/XMP)
    │   ├── downloadHelper.ts   # Helper unduh single & sequential batch ber-metadata
    │   ├── costCalculator.ts   # Formula kalkulasi tarif token & visual
    │   └── vectorGraphicGenerator.ts # Generator fallback visual 2D vektor
    └── types/
        ├── prompt.ts           # Tipe data prompt, images, & biaya
        └── errorLog.ts         # Tipe data log error sistem
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi **20+ LTS** terinstal di komputer.

### 2. Clone & Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Buka file `.env` dan masukkan API Key OpenRouter Anda:
```env
# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Model AI (Default)
OPENROUTER_PROMPT_MODEL=deepseek/deepseek-v4-flash-0731
OPENROUTER_IMAGE_MODEL=openai/gpt-image-2.5-sunburst

# Kurs Default USD ke IDR
USD_TO_IDR_RATE=16000
ENABLE_DYNAMIC_EXCHANGE_RATE=true

# Port Server
PORT=3001
NODE_ENV=development
```

### 4. Jalankan Aplikasi
Jalankan Frontend (Vite) dan Backend (Fastify) secara bersamaan dengan satu perintah:
```bash
npm run dev
```

Buka browser di:
```text
http://localhost:5173
```

---

## 🔌 Spesifikasi REST API

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/prompts` | Mengambil seluruh riwayat kartu dari SQLite |
| `POST` | `/api/prompts` | Menyimpan / memperbarui (*upsert*) kartu variasi |
| `POST` | `/api/prompts/batch` | Menyimpan banyak kartu variasi sekaligus ke SQLite |
| `POST` | `/api/expand-keywords` | Mengembangkan 1–2 kata dasar menjadi 4 ide subjek netral (3–4 kata) |
| `POST` | `/api/generate-prompt` | Ekspansi Prompt AI via DeepSeek v4 Flash + Adobe Stock SEO Title & Keywords |
| `POST` | `/api/generate-image` | Generate visual 1:1 via GPT Image 2.5 Sunburst & simpan file disk |
| `GET` | `/api/currency/exchange-rate` | Ambil kurs USD $\rightarrow$ IDR harian dari `api.co.id` |
| `GET` | `/api/currency/history` | Riwayat catatan kurs harian di SQLite |
| `GET` | `/api/logs/errors` | Mengambil riwayat log kegagalan render & API sistem |
| `DELETE` | `/api/logs/errors` | Membersihkan riwayat log error di memori |
| `DELETE` | `/api/prompts/:id` | Menghapus kartu tertentu dari database SQLite |
| `DELETE` | `/api/prompts` | Membersihkan seluruh riwayat SQLite |

---

## 📄 Lisensi
Private & Proprietary — Dikembangkan khusus untuk alur kerja pembuatan aset 2D siap vektor profesional.
