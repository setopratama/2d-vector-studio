# Riwayat Versi & Catatan Rilis (Version Changelog)

Dokumen ini mencatat seluruh riwayat versi, pembaruan fitur, perbaikan bug, dan petunjuk rollback Git untuk **Commercial Art Director & 2D Vector-Ready Studio**.

---

## 📌 Ringkasan Versi Rilis

| Versi Tag | Tanggal Rilis | Status | Sorotan Utama |
|---|---|---|---|
| **`v2.0.0`** | September 2026 | **Aktif (Latest)** | **5-Tier Commercial Architecture** (*Idea → Direction → Concept → Style → Composition → Prompt*), **Commercial Score Quality Gate** (< 7.0 Rework / >= 7.0 Pass), **5 Komposisi Mandiri & Dynamic Isolation**, **Adobe Stock Official SEO Hierarchy & 4-Tier Ranked Keywords**, Auto SQLite DB Migration. |
| **`v1.3.1`** | September 2026 | Stabil | Gaya ke-7 **Premium Line Art Icon** (Mandat Zero-Color Fill & Coloring Book Printable), **On-Demand SEO Metadata Generator** per kartu, Sinkronisasi Title/Description biner. |
| **`v1.3.0`** | September 2026 | Stabil | AI Concept Expander (1–2 kata → 5 ide subjek 3–4 kata), Pembersihan nama file spasi alami tanpa underscore `_` & `1x1`, Modal Versi & Feature Switcher. |
| **`v1.2.0`** | September 2026 | Stabil | Auto-Runner Wizard (batch sekuensial 1–50), Logging Error harian terpusat, Kurs USD/IDR dinamis via API. |
| **`v1.1.0`** | September 2026 | Stabil | Judul SEO Adobe Stock (120 char), 10–48 Keywords microstock, Injektor metadata biner 3-layer murni (IPTC/EXIF/XMP), Profil Kontributor. |
| **`v1.0.0`** | September 2026 | Stabil | Initial Release: Studio lokal Fastify + SQLite, 5 Card Batch Grid, Pra-estimasi token terpisah. |

---

## 🚀 Rincian Catatan Rilis per Versi

### Versi 2.0.0 — *Commercial Art Director & 5-Tier Decision Engine Edition* (Versi Aktif)
- **🏛️ 5-Tier Commercial Decision Architecture (`Idea → Direction → Concept → Style → Composition → Prompt`)**:
  - Mengubah paradigma dari sekadar generator prompt teks biasa menjadi **Art Director Decision Engine** terstruktur.
  - DeepSeek menganalisis konsep sebelum menyintesis visual prompt: *marketCategory*, *targetBuyer*, *primaryUseCases*, *commercialConcept*, *visualHook*, *differentiation*, dan *searchIntent*.
  - Menghasilkan prompt visual 2D ringkas (30–50 kata) berorientasi autotrace vektor murni.
- **🧭 10 Commercial Directions (Pilar Pasar Microstock 2026)**:
  - Selector arah komersial di UI: *Evergreen Utility, Business & Technology, Wellness & Lifestyle, Sustainability, Education, Food & Beverage, Seasonal, Local & Cultural, Emotional / Human, Playful / Surreal*.
  - AI mendapatkan konteks komersial mendalam sehingga hasil kreasi memiliki *commercial intent* yang jelas.
- **⚖️ 5-Dimension Commercial Scoring & Cost-Saving Quality Gate**:
  - Evaluasi kelayakan komersial otomatis dengan 5 metrik (skala 1–10): *Commercial Usefulness*, *Uniqueness*, *Searchability*, *Vector Suitability*, *Visual Clarity*, dan *Overall Score*.
  - **Quality Gate Cost Protection**: Status kelayakan objektif (`PASS` jika skor >= 7.0, `REWORK` jika skor < 7.0).
  - Pada pipeline batch auto-runner, konsep yang `REWORK` otomatis dilewati untuk mencegah pemborosan biaya render gambar GPT Image 2.5 ($0.020).
- **📐 Pemisahan Independen Style vs Composition & Dynamic Isolation Mode**:
  - Memisahkan secara tegas antara gaya visual (*Flat Vector, Mascot, Monoline, Sticker, Vintage Emblem, Stencil, Premium Line Art*) dan tata letak spasial.
  - 5 Mode Komposisi: *Isolated Object, Object Group, Minimal Context, Commercial Scene, Decorative Composition*.
  - Saklar isolasi dinamis: latar belakang putih murni terisolasi tidak lagi dipaksakan secara kaku bila mode *Commercial Scene* atau *Minimal Context* dipilih.
- **🏷️ Adobe Stock Official SEO Hierarchy & 4-Tier Ranked Keywords**:
  - **Title Hierarchy Faktual**: `[Commercial Concept] + [Primary Subject] + [Key Attributes / Use Case] + [Vector / Silhouette / Line Art / Style]` (maksimal 120 karakter, tanpa keyword stuffing).
  - **4-Tier Ranked Keywords (10–48 tags)**:
    - *Rank 1–10*: Strongest Search Intent (kata kunci pencarian utama pembeli).
    - *Rank 11–20*: Subject & Core Context.
    - *Rank 21–30*: Style & Primary Use Case.
    - *Rank 31–48*: Secondary Relevance & Variations.
  - On-Demand SEO Metadata Engine memanfaatkan seluruh data `commercialBrief` untuk menghasilkan metadata yang sangat relevan.
- **🗄️ Auto SQLite DB Schema Migration**:
  - Penambahan kolom `commercial_brief`, `commercial_direction`, dan `composition` pada tabel SQLite dengan fallback auto-migration runtime (`ALTER TABLE`) yang aman tanpa kehilangan data lama.

---

### Versi 1.3.1 — *Premium Line Art Icon, On-Demand SEO Generator & Binary Metadata Precision*
- **🎨 Penambahan Preset Gaya ke-7: Premium Line Art Icon (`premium-line-art`)**:
  - Menyediakan preset gaya ke-7 yang dirancang khusus untuk icon vektor SVG minimalis, aset komersial microstock, stiker line art, dan buku mewarnai (*coloring page printable*).
  - **Mandat Mutlak Zero-Color Fill**: Otomatis meng-override mode warna menjadi uncolored line art pada backend prompt engine, mencegah kebocoran istilah warna (seperti *"vibrant flat solid green fill"*).
  - **Karakteristik Visual Terkunci**: Garis monoline hitam pekat murni (*pure black outlines*), interior putih bersih tanpa warna (*uncolored coloring-book interior*), 85–90% simplifikasi siluet, dan ~70–75% *negative white space*.
  - **6 Variasi Sudut Komposisi**: *Minimalist Icon Silhouette*, *Detailed Structural Outline*, *Bold Geometric Monoline*, *Symmetrical Centered Icon*, *Dynamic Diagonal Angle*, dan *Minimalist Emblem Crest*.
  - **Dedicated Anti-Color Negative Prompt & Post-Sanitizer**: Filter regex otomatis yang mensterilkan kata pengisi warna menjadi `zero color fill, uncolored white interior`.
- **⚡ Tombol Generate SEO Metadata On-Demand per Kartu**:
  - Jika pembuatan prompt awal dilakukan dengan saklar metadata non-aktif, setiap kartu variasi kini menampilkan banner rapi dengan tombol **`[ ⚡ Generate SEO Metadata (Title + 48 Tags) ]`** (~Rp 0,3).
  - Tombol ini memanggil endpoint `/api/generate-prompt` dengan `includeMetadata: true` untuk mengisi Title bahasa Inggris dan 48 tags keyword microstock secara mandiri tanpa menimpa atau merusak teks prompt visual 2D yang sudah ada.
- **🔒 Presisi Injeksi Metadata Biner & Sinkronisasi Title/Description**:
  - Title dan Description disinkronkan secara presisi langsung ke Judul SEO Adobe Stock bahasa Inggris pada metadata IPTC, EXIF XPTitle/XPComment, dan XMP `dc:title`/`dc:description`.
  - Pembersihan (*stripping*) segmen lama pada file PNG (`tEXt`/`iTXt`) dan JPEG (`APP1`/`APP13`) sebelum injeksi baru untuk mencegah bentrok metadata.
- **🧹 Penyempurnaan Aksi Salin Keywords**:
  - Membersihkan tombol salin keyword pada kartu: mempertahankan tombol tunggal **`[ 📋 Salin Koma ]`** yang rapi dan menghapus tombol duplikat.
- **🏷️ Perbaikan Bug Export Nama File Gambar SEO Terpotong**:
  - Memperbaiki fungsi sanitasi nama file (`sanitizeSeoFileName`) agar tidak lagi membatasi panjang nama file secara kaku pada 80 karakter.
  - Mendukung nama file utuh hingga 200 karakter dengan algoritma *word-boundary safe truncation* (tidak memotong kata di tengah huruf).
  - Menghapus pemotongan elipsis `...` dari backend prompt engine agar judul Adobe Stock SEO tersimpan utuh dan bersih.

---

### Versi 1.3.0 — *Smart Concept Expander, Clean Naming & Granular Metadata Controls*
- **🔲 Opsi Checklist Pengosongan/Pengabaian Metadata Gambar (Author, Software, Credit, Source)**:
  - Menyediakan saklar checklist mandiri pada Modal Pengaturan Profil Kontributor untuk 4 field: *Nama Author/Artist*, *Tag Software*, *Credit/Copyright*, dan *Source/Asal Karya*.
  - Jika checklist dinonaktifkan / dikosongkan, tag-tag tersebut **tidak akan disuntikkan sama sekali ke dalam metadata biner file gambar (IPTC, EXIF, XMP)** tanpa memaksa nilai default (*zero fallback injection*).
  - Dilengkapi tombol cepat: *"Centang Semua"* dan *"Kosongkan Semua"*.
- **📋 Saklar / Checklist Metadata SEO Opsional (Default Non-Aktif)**:
  - Menyediakan opsi checklist interaktif pada *Card Kalkulasi & Pra-Estimasi Biaya Batch*: *"Buat Sekaligus Metadata (Title, Deskripsi/Stock Title & Keywords)"*.
  - **Status Default: Non-Aktif** untuk menghemat token output LLM (~60 tokens output/variasi vs ~200 tokens) dan mempercepat eksekusi prompt visual 2D murni.
  - Perhitungan live estimasi token & biaya langsung menyesuaikan secara reaktif saat checklist diaktifkan/dinonaktifkan.
- **🧠 Fitur AI Concept Expander**:
  - Menyediakan kotak input khusus 1–2 kata dasar (misal: *"kopi susu"*, *"rubah mekanik"*, *"mobil"*) yang otomatis dikembangkan AI menjadi **5 ide subjek/karakter imajinatif netral** (masing-masing tepat 3–4 kata).
  - Ide subjek dibuat netral dan bebas label gaya teknis (*flat, stencil, badge*) agar tidak bertabrakan saat dipadukan dengan gaya grafis 2D apa pun.
  - Perhitungan token & biaya transparan (~$0.000030 / Rp 0,48 - Rp 0,55 per run).
- **🏷️ Pembersihan Nama File (Format Spasi Bersih, Hapus Underscore `_` & Rasio `1x1`/`1:1`)**:
  - Menghapus seluruh karakter underscore `_` dari nama file hasil unduhan maupun penyimpanan disk lokal.
  - Mengubah penamaan file unduhan menjadi format **spasi bersih alami (*natural spacing*)** yang rapi, mudah dibaca langsung di File Explorer/Finder, dan ramah SEO microstock tanpa double space, tanpa trailing/leading space, serta tanpa sisa teks `1:1` atau `1x1` (misal: `vintage coffee badge isolated on white background.png`).
- **⚙️ Modal Versi & Saklar Mode UI (*Feature Switcher*)**:
  - Menambahkan tombol badge versi `v2.0.0` di Navbar dan Footer.
  - Pengguna dapat beralih antara **Mode Lengkap (v2.0.0)** dan **Mode Klasik Bersih (v1.0.0)** sesuai selera.

---

### Versi 1.2.0 — *Pipeline Automation & Error Center*
- **⚡ Auto-Runner Wizard (1–50 Batch Sequential Loop)**:
  - Wizard 3 langkah untuk generate prompt, render visual 1:1, dan menyimpan ke SQLite DB secara otomatis per item.
  - Dilengkapi kontrol *Pause*, *Resume*, *Stop*, progress bar interaktif, dan akumulator biaya riil.
- **🛡️ Sistem Logging Error Harian**:
  - Mencatat kegagalan koneksi API, timeout, atau render error ke file log harian (`data/logs/error_YYYY-MM-DD.log`).
  - Modal Error Log untuk inspeksi status code, snippet prompt, dan salin laporan sistem.
- **💱 Kurs Harian Dinamis**:
  - Pengambilan kurs USD → IDR secara otomatis via API harian dengan penyimpanan cache di SQLite.

---

### Versi 1.1.0 — *Adobe Stock SEO & Zero-Dependency Metadata*
- **📈 Optimasi SEO Microstock**:
  - Prompt engine menghasilkan **Judul SEO Adobe Stock** dalam bahasa Inggris (70–120 karakter) dan **10–48 Tags Keyword** (maksimal 2 kata per tag).
- **🔒 Injektor Metadata Biner 3-Lapisan (Zero-Dependency)**:
  - Menyuntikkan metadata biner serentak ke **IPTC IIM (Photoshop 8BIM APP13)**, **EXIF IFD0 (Windows XP UCS-2)**, dan **Adobe XMP**.
  - 100% JavaScript native (TypedArray / ArrayBuffer / DataView) tanpa `exiftool` atau `sharp`.
- **👤 Pengaturan Profil Kontributor**:
  - Kustomisasi nama *Author*, *Software* (default: *Adobe Illustrator* tanpa kata AI), *Credit*, dan *Source*.

---

### Versi 1.0.0 — *Initial Release: 2D Vector Studio*
- **🏗️ Arsitektur Monorepo Ringkas**: React 19 SPA + Fastify BE + SQLite lokal (`better-sqlite3` & Drizzle ORM).
- **🃏 Sistem Kartu Batch Mandiri (Side-by-Side Layout)**: Sisi kiri untuk Prompt & Metrik Token, sisi kanan untuk Visual 1:1 & Tabel Biaya Akumulatif.
- **💰 Sistem Pra-Estimasi Biaya Terpisah**: Pemisahan biaya token prompt (DeepSeek v4 Flash) dan biaya visual gambar (GPT Image 2.5 Sunburst).

---

## ⏪ Petunjuk Rollback Versi via Git

Jika Anda ingin kembali ke versi rilis tertentu:

```bash
# 1. Kembali ke Versi 1.1.0 (Sebelum ada Auto-Runner dan AI Expander)
git checkout v1.1.0

# 2. Kembali ke Versi 1.2.0 (Sebelum ada AI Expander)
git checkout v1.2.0

# 3. Kembali ke Versi 1.3.0 (Smart Concept Expander & Granular Metadata)
git checkout v1.3.0

# 4. Kembali ke Versi 1.3.1 (Premium Line Art Icon & On-Demand SEO)
git checkout v1.3.1

# 5. Kembali ke Versi Terkini (v2.0.0)
git checkout main
# atau
git checkout v2.0.0
```

