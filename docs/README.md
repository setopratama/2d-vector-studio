# Dokumentasi Resmi: Agentic AI 2D Vector Studio

Selamat datang di pusat dokumentasi resmi **Agentic AI 2D Vector Studio** (Versi `v1.3.0`).

Aplikasi ini adalah studio generator prompt dan visual 2D siap-vektor mandiri (*self-hosted / local-first*) yang dilengkapi sistem kalkulasi token & biaya transparan, injektor metadata biner 3-lapisan tanpa dependensi luar, optimasi SEO microstock (Adobe Stock / Shutterstock / Freepik), dan pipeline otomasi batch.

---

## 📚 Daftar Isi Dokumentasi

| Dokumen | Topik / Pembahasan | Tautan |
|---|---|---|
| **1. Panduan Pengguna (*User Guide*)** | Panduan alur kerja dari input 1–2 kata dasar, AI Concept Expander, konfigurasi gaya 2D, saklar metadata opsional, checklist profil kontributor, hingga ekspor aset ber-metadata dengan penamaan kebab-case bersih. | [USER_GUIDE.md](file:///D:/GPTIMAGEGENERATE/docs/USER_GUIDE.md) |
| **2. Arsitektur Sistem (*Architecture & Tech Stack*)** | Desain monorepo terpadu (Vite + React 19 + Fastify + SQLite lokal via `better-sqlite3` & Drizzle ORM), antrean FIFO queue worker, auto-migration database, dan alur integrasi OpenRouter API. | [ARCHITECTURE.md](file:///D:/GPTIMAGEGENERATE/docs/ARCHITECTURE.md) |
| **3. Spesifikasi Injeksi Metadata Biner (*Metadata Specification*)** | Dokumentasi teknis injektor biner 3-layer murni (IPTC IIM 8BIM APP13, EXIF IFD0 Windows XP UCS-2, Adobe XMP) standar agensi microstock dengan dukungan checklist pengabaian (*zero-injection*) tanpa dependensi eksternal (`exiftool`/`sharp`). | [METADATA_SPECIFICATION.md](file:///D:/GPTIMAGEGENERATE/docs/METADATA_SPECIFICATION.md) |
| **4. Riwayat Versi & Catatan Rilis (*Version Changelog*)** | Riwayat evolusi rilis aplikasi (`v1.0.0` s/d `v1.3.0`), daftar fitur baru per versi, saklar mode UI, dan panduan rollback Git Tag. | [VERSION_CHANGELOG.md](file:///D:/GPTIMAGEGENERATE/docs/VERSION_CHANGELOG.md) |

---

## ⚡ Ringkasan Cepat Fitur Utama

- 🧠 **AI Concept Expander**: Mengembangkan 1–2 kata dasar (misal: *"kopi susu"*, *"rubah mekanik"*) menjadi 4 ide subjek alami 3–4 kata yang netral dan bebas bentrok gaya.
- 🎨 **Gaya Grafis 2D Siap Vektor**: 6 preset terkunci (*Flat Vector, Mascot Character, Monoline Line Art, Sticker Decal, Vintage Badge / Emblem, Stencil Silhouette*) + Mode Hitam Putih (B&W) dengan latar belakang polos kontras tinggi untuk autotrace instan (SVG / EPS).
- 🏷️ **Pembersihan Nama File Bersih (Kebab-Case Tanpa Underscore `_`)**: Menghilangkan seluruh karakter underscore `_` dan pola `1:1`/`1x1` dari nama file unduhan dan penyimpanan server disk, menghasilkan format kebab-case (`-`) rapi dan optimal untuk SEO microstock (misal: `vintage-coffee-badge-vector-illustration.png`).
- 📋 **Saklar Metadata SEO Opsional (Default Non-Aktif)**: Opsi checklist untuk membuat Judul SEO Adobe Stock (120 char) dan 10–48 Tags Keyword hanya saat dibutuhkan, menghemat token output LLM hingga ~70% pada mode prompt visual 2D murni.
- 👤 **Checklist Granular Pengabaian Metadata Kontributor**: Opsi checklist individual untuk *Author/Artist*, *Software*, *Credit*, dan *Source*. Jika checklist dinonaktifkan, metadata tersebut tidak akan disuntikkan sama sekali ke dalam biner gambar (*zero fallback injection*).
- 🛡️ **Injektor Metadata 3-Lapisan Biner (Zero-Dependency)**: Menanam Title, Keywords, Description, Author, dan Software clean ke dalam file PNG/JPEG secara native tanpa `exiftool`/`sharp`.
- ⚡ **Auto-Runner Wizard**: Pipeline otomasi sekuensial batch 1–50 item dengan kontrol Pause, Resume, Stop, dan live cost accumulator.
- 💾 **Penyimpanan Lokal Mandiri & Auto-Migration**: Seluruh riwayat prompt dan log tersimpan di file SQLite lokal (`data/prompt_studio.db`), dan file gambar tersimpan rapi per tanggal (`data/outputs/YYYY-MM-DD/img-timestamp-index.png`).
