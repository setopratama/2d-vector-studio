# Spesifikasi Injeksi Metadata Biner 3-Lapisan (Zero-Dependency)

Dokumen ini mendokumentasikan spesifikasi teknis modul injeksi metadata gambar biner murni (`src/utils/imageMetadataInjector.ts`) yang dirancang khusus untuk memenuhi standar agensi microstock internasional (**Adobe Stock**, **Shutterstock**, **Freepik**, **iStock**).

---

## 1. Prinsip Utama: Zero External Dependencies

Modul ini dibangun **100% menggunakan API native JavaScript (TypedArray, ArrayBuffer, DataView, dan Bitwise Operations)**:
- ❌ **Tidak bergantung pada tool eksternal**: Tanpa `exiftool`, tanpa `sharp`, tanpa `piexifjs`, tanpa `libvips`.
- ⚡ **Berjalan di browser dan Node.js**: Pemrosesan biner murni tanpa instalasi C++ runtime tambahan atau overhead I/O eksternal.
- 🔒 **Injeksi Langsung ke Chunk Biner**:
  - Pada format **PNG**: Menyisipkan chunk `eXIf` dan `tEXt` / `iTXt` (XMP) lengkap dengan rekalkulasi tabel **CRC32**.
  - Pada format **JPEG**: Menyisipkan segmen `APP1` (EXIF TIFF & XMP) dan segmen `APP13` (Photoshop 8BIM IPTC IIM).

---

## 2. Struktur Sinkronisasi 3 Lapisan Metadata

Ketika pengguna menekan tombol unduh gambar, metadata diselaraskan serentak ke dalam 3 lapisan standar:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PAYLOAD METADATA (Title, Keywords, Author, Software)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  1. IPTC IIM     │          │  2. EXIF IFD0    │          │  3. ADOBE XMP    │
│  (Photoshop 8BIM)│          │  (TIFF Header)   │          │  (XML Packet)    │
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│ • 2:05 (Title)   │          │ • Tag 0x010E     │          │ • dc:title       │
│ • 2:25 (Keywords)│          │ • Tag 0x013B     │          │ • dc:subject     │
│ • 2:120 (Caption)│          │ • Tag 0x0131     │          │ • dc:description │
│ • 2:80 (Author)  │          │ • XPTitle        │          │ • dc:creator     │
│ • UTF-8 (\x1b%G) │          │ • XPKeywords     │          │ • xmp:CreatorTool│
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

---

### Lapisan 1: IPTC IIM (Photoshop 8BIM APP13)
- **Struktur Segmen**: Photoshop Resource Block 8BIM (`0x38 0x42 0x49 0x4D`), Resource ID `0x0404` (IPTC-NAA record).
- **Deklarasi Charset UTF-8**: Record 1 Dataset `0x5A` dengan urutan escape sequence `\x1b%G` untuk memastikan aksen dan karakter internasional terbaca sempurna tanpa corrupt encoding.
- **Datasets yang Diselaraskan**:
  - `Record 2:05`: Object Name (*Title / Judul SEO Gambar*)
  - `Record 2:25`: Keywords (Setiap tag disimpan berurutan sebagai record dataset terpisah)
  - `Record 2:120`: Caption / Abstract (*Dedicated English SEO Description / Rangkuman Komersial*)
  - `Record 2:80`: By-line (*Author / Nama Pembuat*)
  - `Record 2:110`: Credit (*Hak Cipta / Credit*)
  - `Record 2:115`: Source (*Sumber Aset*)

---

### Lapisan 2: EXIF IFD0 & Windows XP Extended Tags
- **Header Standar TIFF**: Little-Endian (`II` / `0x49 0x49 0x2A 0x00`).
- **Tag Standar IFD0**:
  - `0x010E` (`ImageDescription`): ASCII string teks deskripsi komersial bahasa Inggris (`adobeStockDescription`).
  - `0x013B` (`Artist`): Nama Author / Creator.
  - `0x0131` (`Software`): Nama perangkat lunak (default: *"Adobe Illustrator"*).
- **Tag Ekstensi Windows XP (Encoding UCS-2 / UTF-16LE)**:
  - `0x9C9B` (`XPTitle`): Judul gambar (dibaca langsung oleh Windows Explorer Properties).
  - `0x9C9E` (`XPKeywords`): Daftar kata kunci dipisahkan dengan tanda titik koma (`;`).
  - `0x9C9C` (`XPComment`): Deskripsi gambar komersial bahasa Inggris (`adobeStockDescription`).
  - `0x9C9D` (`XPAuthor`): Nama Author.
  - `0x9C9F` (`XPSubject`): Subjek gambar.

---

### Lapisan 3: Adobe XMP Data Packet (Dublin Core & Photoshop)
- Menyisipkan paket XMP berstandar W3C RDF/XML yang dibungkus header `<?xpacket begin="..." id="W5M0MpCehiHzreSzNTczkc9d"?>`.
- **Skema yang Ditanam**:
  - `dc:title`: `<rdf:Alt><rdf:li xml:lang="x-default">{Title}</rdf:li></rdf:Alt>`
  - `dc:description`: `<rdf:Alt><rdf:li xml:lang="x-default">{adobeStockDescription}</rdf:li></rdf:Alt>`
  - `dc:creator`: `<rdf:Seq><rdf:li>{Author}</rdf:li></rdf:Seq>`
  - `dc:subject`: `<rdf:Bag><rdf:li>{Keyword 1}</rdf:li><rdf:li>{Keyword 2}</rdf:li>...</rdf:Bag>`
  - `photoshop:Headline`: `{Title}`
  - `photoshop:Credit`: `{Credit}`
  - `photoshop:Source`: `{Source}`
  - `xmp:CreatorTool`: `{Software}`

---

## 3. Rekalkulasi Bitwise CRC32 untuk PNG Chunks

Setiap penyisipan chunk biner ke dalam format PNG wajib memiliki nilai checksum CRC32 yang valid di 4 byte terakhir chunk:
- Modul mengimplementasikan tabel precomputed 256-entri bitwise CRC32 (`0xedb88320`).
- Checksum dihitung pada `Chunk Type` + `Chunk Data` (sesuai standar ISO/IEC 15948:2004).

---

## 4. Penamaan File SEO Adobe Stock (`sanitizeSeoFileName`)

Untuk memenuhi kemudahan pembacaan (*human-readable*) dan kompatibilitas microstock:
1. Mengubah tanda underscore (`_`) dan simbol terlarang menjadi spasi bersih (` `).
2. Menghapus pola resolusi/rasio teknis seperti `1x1`, `1:1`, `1-1`, `_1x1_`.
3. Membatasi panjang maksimal nama file hingga 80 karakter.
4. Akhiran file bersih: `.png` (misal: `vintage coffee badge isolated on white background.png`).
