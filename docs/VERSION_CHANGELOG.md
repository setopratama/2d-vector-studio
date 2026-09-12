# Riwayat Versi & Catatan Rilis (Version Changelog)

Dokumen ini mencatat seluruh riwayat versi, pembaruan fitur, perbaikan bug, dan petunjuk rollback Git untuk **Agentic AI 2D Vector Studio**.

---

## 📌 Ringkasan Versi Rilis

| Versi Tag | Tanggal Rilis | Status | Sorotan Utama |
|---|---|---|---|
| **`v1.3.0`** | September 2026 | **Aktif (Latest)** | AI Concept Expander (1–2 kata → 4 ide subjek 3–4 kata), Pembersihan nama file tanpa `1x1`, Modal Versi & Feature Switcher. |
| **`v1.2.0`** | September 2026 | Stabil | Auto-Runner Wizard (batch sekuensial 1–50), Logging Error harian terpusat, Kurs USD/IDR dinamis via API. |
| **`v1.1.0`** | September 2026 | Stabil | Judul SEO Adobe Stock (120 char), 10–48 Keywords microstock, Injektor metadata biner 3-layer murni (IPTC/EXIF/XMP), Profil Kontributor. |
| **`v1.0.0`** | September 2026 | Stabil | Initial Release: Studio lokal Fastify + SQLite, 5 Card Batch Grid, Pra-estimasi token terpisah. |

---

## 🚀 Rincian Catatan Rilis per Versi

### Versi 1.3.0 — *Smart Concept Expander & Clean Naming* (Versi Aktif)
- **🧠 Fitur AI Concept Expander**:
  - Menyediakan kotak input khusus 1–2 kata dasar (misal: *"kopi susu"*, *"rubah mekanik"*, *"mobil"*) yang otomatis dikembangkan AI menjadi **4 ide subjek/karakter imajinatif netral** (masing-masing tepat 3–4 kata).
  - Ide subjek dibuat netral dan bebas label gaya teknis (*flat, stencil, badge*) agar tidak bertabrakan saat dipadukan dengan gaya grafis 2D apa pun.
  - Perhitungan token & biaya transparan (~$0.000030 / Rp 0,48 - Rp 0,55 per run).
- **🏷️ Pembersihan Nama File**:
  - Menghapus akhiran dan pola `1x1` / `1:1` dari seluruh file unduhan dan simpanan gambar menjadi murni judul SEO Adobe Stock yang rapi.
- **⚙️ Modal Versi & Saklar Mode UI (*Feature Switcher*)**:
  - Menambahkan tombol badge versi `v1.3.0` di Navbar dan Footer.
  - Pengguna dapat beralih antara **Mode Lengkap (v1.3.0)** dan **Mode Klasik Bersih (v1.0.0)** sesuai selera.

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

# 3. Kembali ke Versi Terkini (v1.3.0)
git checkout main
# atau
git checkout v1.3.0
```
