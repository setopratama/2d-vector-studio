# Panduan Pengguna (User Guide): Agentic AI 2D Vector Studio

Panduan lengkap langkah demi langkah untuk menggunakan **Agentic AI 2D Vector Studio** dalam menghasilkan aset grafis 2D siap vektor komersial, lengkap dengan metadata microstock dan efisiensi biaya.

---

## 1. Alur Kerja Utama (Workflow)

```text
[1. Input 1-2 Kata] ──> [AI Concept Expander] ──> [Pilih 1 dari 4 Ide Subjek 3-4 Kata]
                                                              │
                                                              ▼
[4. Pra-Estimasi Biaya] <── [3. Mode B&W (Opsional)] <── [2. Pilih Gaya Grafis 2D]
         │
         ▼
[5. Klik "GENERATE PROMPT"] ──> [DeepSeek v4 Flash Expansion + Adobe Stock SEO & Keywords]
                                                              │
                                                              ▼
[6. Review Kartu Hasil & Prompt 2D] ──> [Klik "GENERATE IMAGE" (GPT Image 2.5 Sunburst)]
                                                              │
                                                              ▼
[7. Download PNG Ber-Metadata (IPTC / EXIF / XMP + Nama File SEO Bersih)]
```

---

## 2. Langkah Demi Langkah Penggunaan

### Langkah 1: Memasukkan Ide Konsep & Menggunakan AI Concept Expander
1. Di kolom **Ide Dasar**, Anda bisa langsung mengetik ide visual.
2. Jika Anda hanya memiliki **1 atau 2 kata dasar** (misal: *"kopi"*, *"kopi susu"*, *"rubah"*, *"mobil"*):
   - Masukkan kata tersebut di kotak **AI Concept Expander** di bawah textarea.
   - Klik tombol **`[ ⚡ Buat 4 Ide Subjek (~Rp 0,5) ]`** atau tekan **Enter**.
   - AI akan menyajikan 4 kartu ide subjek imajinatif (masing-masing 3–4 kata).
   - Klik tombol **`[ + Pakai ke Input ]`** pada ide yang Anda sukai.
3. Anda juga dapat memilih **Contoh Cepat** bawaan sistem di bagian bawah (*+ maskot rubah mekanik, + vintage coffee emblem*, dll.).

---

### Langkah 2: Memilih Mode Input (Multi-Variasi vs Multi-Keyword Pack)
- **Mode Multi-Variasi Gaya** (*Default*):
  - Satu konsep ide akan dibuatkan beberapa variasi prompt visual dengan sudut pandang dan komposisi berbeda (1, 3, 5, atau 8 variasi).
- **Mode Multi-Keyword / Pack**:
  - Anda dapat memasukkan daftar subjek per baris untuk membuat satu paket aset microstock (misal: *Cyberpunk Animal Pack*).
  - Anda dapat menggunakan tombol **`[ + Masukkan Semua 4 Ide ke List Pack ]`** di AI Expander untuk mengisi 4 baris sekaligus.

---

### Langkah 3: Konfigurasi Gaya 2D & Mode Hitam Putih (B&W)
1. **Pilih Gaya Grafis 2D Siap Vektor**:
   - **Flat Vector Art**: Warna datar kontras tinggi, garis tegas, gaya screen-print.
   - **Mascot Character**: Maskot karakter die-cut tebal, sangat cocok untuk merchandise & esport.
   - **Monoline Line Art**: Garis berbobot seragam, kurva minimal, bersih tanpa clutter.
   - **Sticker Decal**: Stiker die-cut dengan outline putih kontras.
   - **Vintage Badge / Emblem**: Simetri geometris, stempel retro klasik, logo microstock.
   - **Stencil Silhouette**: Ruang negatif kontras tinggi, solid black, instan autotrace kurva tunggal.
2. **Mode Hitam Putih (B&W Vector)**:
   - Centang opsi `[x] Mode Hitam Putih (B&W Vector)` jika ingin hasil 100% monokrom hitam-putih murni (zero grayscale, zero color) untuk autotrace SVG paling murah dan ringan.

---

### Langkah 4: Meninjau Pra-Estimasi Token & Biaya
- Widget **Pra-Estimasi Biaya Transparan** akan menghitung perkiraan token input dan output serta biaya DeepSeek v4 Flash dan GPT Image 2.5 secara terpisah dalam satuan USD dan Rupiah (kurs dinamis).
- Tekan tombol **`[ GENERATE PROMPT ]`** untuk memulai ekspansi prompt.

---

### Langkah 5: Generate Gambar & Multi-Versi Visual
1. Pada kartu hasil di sisi kanan, klik tombol **`[ GENERATE IMAGE ]`**.
2. Sistem akan memproses gambar berasio standar **1:1** dengan latar belakang terisolasi putih bersih.
3. Jika ingin mencoba visual lain tanpa kehilangan gambar sebelumnya, klik tombol **`[ RE-GENERATE ]`**. Gambar baru akan tersimpan sebagai versi baru (`v2`, `v3`) dan Anda bisa bebas beralih versi melalui tombol `[ v1 | v2 ]`.

---

### Langkah 6: Mengatur Profil Kontributor & Download Ber-metadata
1. Klik tombol **`[ 👤 Author: ... ]`** di Navbar atas untuk mengatur:
   - **Nama Pembuat (Author / Artist)**: Nama Anda atau brand studio (misal: *Seto Pratama Studio*).
   - **Nama Perangkat Lunak (Software)**: Default *Adobe Illustrator* (tanpa kata AI).
   - **Credit / Copyright**: Hak cipta aset.
2. Klik tombol **`[ ⬇️ PNG ]`** pada kartu untuk mengunduh gambar:
   - File PNG otomatis terinjeksi **metadata 3-lapisan (IPTC IIM, EXIF IFD0, Adobe XMP)**.
   - Nama file otomatis menggunakan **Judul SEO Adobe Stock** yang bersih tanpa suffix `1x1` (misal: `vintage_coffee_roastery_badge_isolated_on_white_background.png`).
3. Anda juga dapat menggunakan tombol **`[ DOWNLOAD SEMUA PNG ]`** untuk mengunduh seluruh hasil batch sekaligus secara sekuensial.

---

## 3. Menggunakan Auto-Runner Wizard (Batch Pipeline)

Untuk memproduksi 10 hingga 50 aset visual secara otomatis:
1. Klik tombol **`[ ⚡ Auto-Runner ]`** di Navbar atas.
2. **Step 1**: Tentukan 1 ide dasar, pilih gaya grafis 2D, dan opsi B&W.
3. **Step 2**: Tentukan jumlah item (pilihan cepat kelipatan 10: 10, 20, 30, ... 100) dan tinjau pra-estimasi biaya total.
4. **Step 3**: Klik **START AUTO-RUNNER**.
   - Sistem akan mengeksekusi siklus sekuensial otomatis: *Prompt AI → Render Gambar 1:1 → Simpan SQLite DB*.
   - Tersedia tombol **Pause (Jeda)**, **Resume (Lanjutkan)**, dan **Stop (Berhenti)**.
   - Setelah selesai, klik **Download Semua (N PNG)** untuk mengunduh seluruh aset ber-metadata.
