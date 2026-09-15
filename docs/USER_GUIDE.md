# Panduan Pengguna (User Guide): Commercial Art Director & 2D Vector Studio

Panduan lengkap langkah demi langkah untuk menggunakan **Commercial Art Director & 2D Vector-Ready Studio (v2.0.0)** dalam menghasilkan aset grafis 2D siap vektor komersial, lengkap dengan analisis pilar pasar 2026, quality gate scoring, 5 mode komposisi spasial, metadata microstock 3-layer, dan efisiensi biaya.

---

## 1. Arsitektur Alur Kerja 5-Tier (5-Tier Commercial Workflow)

```text
[1. IDEA / SUBJEK DASAR]
   │ (Input langsung atau gunakan AI Concept Expander 1-2 kata -> 4 ide subjek 3-4 kata)
   ▼
[2. COMMERCIAL DIRECTION]
   │ (Pilih 1 dari 10 Pilar Pasar Microstock 2026: Evergreen, Business, Wellness, Edu, dll.)
   ▼
[3. STYLE & COMPOSITION INDEPENDENCE]
   │ ├── Style: 1 dari 7 Preset 2D Siap Vektor (Flat, Mascot, Monoline, Sticker, Badge, Stencil, Premium Line Art)
   │ ├── Composition: 1 dari 5 Mode Spasial (Single Isolated, Grouped, Minimal Context, Scene, Badge)
   │ └── Dynamic Isolation / B&W Mode: Saklar latar putih murni & monokrom
   ▼
[4. COMMERCIAL CONCEPT & QUALITY GATE SCORING]
   │ ├── Analisis Pasar: Market Category, Target Buyer, Primary Use Cases, Visual Hook
   │ └── Quality Gate (5 Dimensi): PASS (Skor >= 7.0) atau REWORK (Skor < 7.0)
   ▼
[5. VISUAL PROMPT SYNTHESIS (30–50 Kata)]
   │ ├── Sintesis teks prompt visual 2D ringkas siap autotrace
   │ └── On-Demand SEO Generator: Judul Adobe Stock (120 char) & 4-Tier 10-48 Tags
   ▼
[6. GENERATE IMAGE (GPT Image 2.5 Sunburst)]
   │ (Render 1:1, multi-versi v1/v2, per-card queue)
   ▼
[7. DOWNLOAD PNG BER-METADATA]
   └── Injeksi Biner 3-Lapisan (IPTC, EXIF, XMP) + Sanitasi Nama File Spasi Alami
```

---

## 2. Langkah Demi Langkah Penggunaan

### Langkah 1: Memasukkan Ide Konsep & Menggunakan AI Concept Expander
1. Di kolom **Ide Subjek / Konsep**, Anda bisa langsung mengetik ide visual.
2. Jika Anda hanya memiliki **1 atau 2 kata dasar** (misal: *"kopi"*, *"kopi susu"*, *"rubah"*, *"mobil"*):
   - Masukkan kata tersebut di kotak **AI Concept Expander** di bawah textarea.
   - Klik tombol **`[ ⚡ Buat 4 Ide Subjek (~Rp 0,5) ]`** atau tekan **Enter**.
   - AI akan menyajikan 4 kartu ide subjek komersial (masing-masing 3–4 kata).
   - Klik tombol **`[ + Pakai ke Input ]`** pada ide yang Anda sukai.
3. Anda juga dapat memilih **Contoh Cepat** bawaan sistem di bagian bawah (*+ maskot rubah mekanik, + vintage coffee emblem*, dll.).

---

### Langkah 2: Memilih Commercial Direction (10 Pilar Pasar 2026)
Pilih pilar segmen pasar yang menjadi target pembeli aset visual Anda:
1. **Evergreen Utility**: Kebutuhan esensial sehari-hari, navigasi UI, signage, dan simbol universal.
2. **Business & Technology**: FinTech, modern workspace, cloud computing, AI visual concept, digital productivity.
3. **Wellness & Lifestyle**: Kesehatan mental, yoga, mindful living, nutrisi seimbang, kebugaran holistik.
4. **Sustainability & Eco**: Energi terbarukan, zero waste, daur ulang, ekologi hijau, climate action.
5. **Education & Science**: Edukasi STEM, e-learning, printable worksheet anak, infografis akademik.
6. **Food & Beverage**: Specialty coffee, bakery artisanal, menu restoran, kemasan makanan.
7. **Seasonal & Holidays**: Event musiman global (Ramadhan, Natal, New Year, Halloween, Summer).
8. **Local & Cultural**: Warisan budaya lokal, seni tradisi, kerajinan tangan, destinasi wisata otentik.
9. **Emotional / Human**: Hubungan antarmanusia, empati sosial, kehangatan keluarga, ekspresi emosional.
10. **Playful / Surreal**: Humor visual segar, maskot pop-art eksentrik, ilustrasi absurd jenaka.

---

### Langkah 3: Memilih Gaya Grafis 2D (7 Presets) & Mode Komposisi
1. **7 Gaya Grafis 2D Siap Vektor**:
   - **Flat Vector Art**: Warna datar kontras tinggi, garis tegas, gaya screen-print.
   - **Mascot Character**: Maskot karakter die-cut tebal, ekspresif untuk merchandise & branding.
   - **Monoline Line Art**: Garis berbobot seragam (*uniform stroke*), kurva minimal, bersih.
   - **Sticker Decal**: Stiker pop-art die-cut dengan outline border putih kontras.
   - **Vintage Badge / Emblem**: Simetri geometris, stempel retro klasik, linework heritage.
   - **Stencil Silhouette**: Ruang negatif kontras tinggi, solid black, instan autotrace kurva tunggal.
   - **Premium Line Art Icon**: **Mandat Zero-Color Fill**, monoline hitam pekat murni, simplifikasi 85–90%, ~70–75% *negative white space*, siap untuk buku mewarnai (*coloring book*) & printable SVG.
2. **5 Mode Komposisi Spasial**:
   - *Single Isolated Object*: Subjek tunggal terpusat tanpa latar belakang pengganggu.
   - *Grouped Still Life*: Susunan 2–4 objek saling melengkapi dalam satu frame harmonis.
   - *Minimal Context*: Subjek dengan latar kontekstual minimalis dan bersih.
   - *Commercial Scene*: Adegan komersial lengkap bernarasi visual tajam.
   - *Decorative Badge / Frame*: Bingkai simetris, pita, dan ornamen tipografi.
3. **Mode Hitam Putih (B&W Vector)**:
   - Centang opsi `[x] Mode Hitam Putih (B&W Vector)` jika ingin hasil 100% monokrom hitam-putih murni (zero grayscale, zero color) untuk autotrace SVG paling murah dan ringan.

---

### Langkah 4: Meninjau Pra-Estimasi Biaya & Quality Gate Scoring
- Widget **Pra-Estimasi Biaya Transparan** menghitung perkiraan token input dan output serta biaya DeepSeek v4 Flash dan GPT Image 2.5 secara terpisah dalam satuan USD dan Rupiah (kurs dinamis).
- **Checklist Metadata SEO (Default: Non-Aktif)**:
   - Centang jika ingin langsung menyertakan Title Adobe Stock dan 10–48 Keywords saat generate awal.
   - Biarkan tidak dicentang untuk menghemat ~70% token output LLM.
- Tekan **`[ GENERATE PROMPT ]`**:
   - Art Director Engine mengevaluasi konsep dalam 5 dimensi scoring (skala 1–10): *Commercial Usefulness, Uniqueness, Searchability, Vector Suitability, Visual Clarity*.
   - Status **PASS** (skor >= 7.0) atau **REWORK** (skor < 7.0) ditampilkan di kartu hasil.

---

### Langkah 5: Generate Gambar & On-Demand SEO Metadata per Kartu
1. **On-Demand SEO Generator**: Jika metadata awal tidak dibuat, klik tombol **`[ ⚡ Generate SEO Metadata (Title + 48 Tags) ]`** (~Rp 0,3) pada kartu untuk membuat metadata SEO bahasa Inggris tanpa menimpa prompt visual.
2. **Render Gambar**: Klik tombol **`[ GENERATE IMAGE ]`** pada kartu hasil di sisi kanan (GPT Image 2.5 Sunburst, $0.020).
3. **Multi-Versi Visual**: Jika ingin mencoba visual lain tanpa kehilangan gambar sebelumnya, klik tombol **`[ RE-GENERATE ]`**. Anda bisa bebas beralih versi melalui switcher `[ v1 | v2 | v3 ]`.

---

### Langkah 6: Profil Kontributor & Unduh Ber-Metadata
1. Klik tombol **`[ 👤 Author: ... ]`** di Navbar atas untuk mengatur profil kontributor:
   - Saklar granular untuk *Author/Artist*, *Software*, *Credit*, dan *Source*.
   - **Zero-Injection**: Field yang dinonaktifkan tidak akan disuntikkan sama sekali ke dalam metadata gambar.
2. Klik tombol **`[ ⬇️ PNG ]`** pada kartu untuk mengunduh:
   - File PNG terinjeksi **metadata 3-lapisan (IPTC IIM 8BIM, EXIF IFD0/UCS-2, Adobe XMP)**.
   - Nama file diformat dengan **spasi bersih alami (*natural spacing*)** tanpa underscore `_` dan tanpa label `1x1` (misal: `vintage coffee badge isolated on white background.png`).
3. Anda juga dapat menggunakan tombol **`[ DOWNLOAD SEMUA PNG ]`** untuk mengunduh seluruh hasil batch secara sekuensial.

---

## 3. Menggunakan Auto-Runner Wizard (Batch Pipeline 1–50)

Untuk memproduksi aset visual dalam jumlah besar secara otomatis:
1. Klik tombol **`[ ⚡ Auto-Runner ]`** di Navbar atas.
2. **Step 1**: Tentukan ide dasar, Commercial Direction, gaya 2D, komposisi, dan opsi B&W.
3. **Step 2**: Tentukan jumlah item (pilihan cepat: 5, 10, 20, 30, 50) dan tinjau pra-estimasi biaya total.
4. **Step 3**: Klik **START AUTO-RUNNER**.
   - Sistem menjalankan siklus otomatis: *Prompt AI → Quality Gate Check (hanya konsep PASS yang dirender) → Render Gambar 1:1 → Simpan SQLite DB*.
   - Tersedia tombol kontrol **Pause (Jeda)**, **Resume (Lanjutkan)**, dan **Stop (Berhenti)**.
   - Setelah selesai, klik **Download Semua (N PNG)** untuk mengunduh seluruh aset ber-metadata.
