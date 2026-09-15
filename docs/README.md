# Dokumentasi Resmi: Commercial Art Director & 2D Vector Studio

Selamat datang di pusat dokumentasi resmi **Commercial Art Director & 2D Vector-Ready Studio** (Versi `v2.0.1`).

Aplikasi ini adalah studio generator prompt dan visual 2D siap-vektor mandiri (*self-hosted / local-first*) dengan **Arsitektur 5-Tier Commercial Decision**, sistem kalkulasi token & biaya transparan, 5-Dimension Commercial Scoring Quality Gate, injektor metadata biner 3-lapisan tanpa dependensi luar, optimasi SEO microstock (Adobe Stock / Shutterstock / Freepik), dan pipeline otomasi batch.

---

## 📚 Daftar Isi Dokumentasi

| Dokumen | Topik / Pembahasan | Tautan |
|---|---|---|
| **1. Panduan Pengguna (*User Guide*)** | Panduan alur kerja dari Commercial Direction, AI Concept Expander, konfigurasi 7 gaya 2D, saklar metadata opsional & generate SEO on-demand per kartu, checklist profil kontributor, hingga ekspor aset ber-metadata dengan penamaan bersih. | [USER_GUIDE.md](file:///D:/GPTIMAGEGENERATE/docs/USER_GUIDE.md) |
| **2. Arsitektur Sistem (*Architecture & Tech Stack*)** | Desain monorepo terpadu (Vite + React 19 + Fastify + SQLite lokal via `better-sqlite3` & Drizzle ORM), antrean FIFO queue worker, auto-migration database, dan alur integrasi OpenRouter API. | [ARCHITECTURE.md](file:///D:/GPTIMAGEGENERATE/docs/ARCHITECTURE.md) |
| **3. Spesifikasi Injeksi Metadata Biner (*Metadata Specification*)** | Dokumentasi teknis injektor biner 3-layer murni (IPTC IIM 8BIM APP13, EXIF IFD0 Windows XP UCS-2, Adobe XMP) standar agensi microstock dengan dukungan Title & Dedicated English Description. | [METADATA_SPECIFICATION.md](file:///D:/GPTIMAGEGENERATE/docs/METADATA_SPECIFICATION.md) |
| **4. Riwayat Versi & Catatan Rilis (*Version Changelog*)** | Riwayat evolusi rilis aplikasi (`v1.0.0` s/d `v2.0.1`), daftar fitur baru per versi, penambahan gaya Premium Line Art Icon, saklar mode UI, dan panduan rollback Git Tag. | [VERSION_CHANGELOG.md](file:///D:/GPTIMAGEGENERATE/docs/VERSION_CHANGELOG.md) |

---

## ⚡ Ringkasan Cepat Fitur Utama

- 🧠 **AI Concept Expander**: Mengembangkan 1–2 kata dasar (misal: *"kopi susu"*, *"rubah mekanik"*) menjadi 4–5 ide subjek alami 3–4 kata yang netral dan bebas bentrok gaya.
- 🎨 **7 Gaya Grafis 2D Siap Vektor**: 
  1. *Flat Vector Art*
  2. *Mascot Character*
  3. *Monoline Line Art*
  4. *Sticker Decal*
  5. *Vintage Badge / Emblem*
  6. *Stencil Silhouette*
  7. **Premium Line Art Icon** (*Mandat Zero-Color Fill*, monoline hitam pekat murni, 85–90% simplifikasi siluet, ~70–75% *negative white space*, siap untuk buku mewarnai / *coloring book* & printable SVG).
- 🏷️ **Pembersihan Nama File Bersih**: Menghilangkan seluruh karakter underscore `_` dan pola `1:1`/`1x1` dari nama file unduhan, menghasilkan format spasi alami yang rapi dan optimal untuk SEO microstock (misal: `vintage coffee badge isolated on white background.png`).
- 📋 **Saklar Metadata SEO Opsional & Generator On-Demand**: Opsi checklist untuk membuat Judul SEO Adobe Stock (120 char) dan 10–48 Tags Keyword hanya saat dibutuhkan. Jika awal generate dinonaktifkan, kartu menyediakan tombol **`[ ⚡ Generate SEO Metadata (Title + 48 Tags) ]`** per kartu untuk membuat metadata SEO secara mandiri tanpa membuat ulang prompt visual.
- 👤 **Checklist Granular Pengabaian Metadata Kontributor**: Opsi checklist individual untuk *Author/Artist*, *Software*, *Credit*, dan *Source*. Jika checklist dinonaktifkan, metadata tersebut tidak akan disuntikkan sama sekali ke dalam biner gambar (*zero fallback injection*).
- 🛡️ **Injektor Metadata 3-Lapisan Biner (Zero-Dependency)**: Menanam Title, Keywords, Description, Author, dan Software clean ke dalam file PNG/JPEG secara native tanpa `exiftool`/`sharp`, dengan Title dan Description yang tersinkronisasi presisi dengan judul SEO bahasa Inggris.
- ⚡ **Auto-Runner Wizard**: Pipeline otomasi sekuensial batch 1–50 item dengan kontrol Pause, Resume, Stop, dan live cost accumulator.
- 💾 **Penyimpanan Lokal Mandiri & Auto-Migration**: Seluruh riwayat prompt dan log tersimpan di file SQLite lokal (`data/prompt_studio.db`), dan file gambar tersimpan rapi per tanggal (`data/outputs/YYYY-MM-DD/img-timestamp-index.png`).
