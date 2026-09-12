// src/utils/imageMetadataInjector.ts
/**
 * 3-Layer Image Metadata Injector for Microstock Compliance (Adobe Stock / Shutterstock / Freepik)
 * 
 * 100% ZERO EXTERNAL DEPENDENCIES (Pure native TypedArray / ArrayBuffer / DataView).
 * No exiftool, sharp, piexifjs, or any external binary parsers.
 * 
 * Synchronizes metadata across 3 complete standard layers:
 * 1. IPTC IIM: Photoshop 8BIM APP13 segment (Resource ID 0x0404) with UTF-8 charset (\x1b%G),
 *    Datasets 2:05 (Title), 2:25 (Keywords), 2:120 (Caption/Description), 2:80 (Author).
 * 2. EXIF IFD0: Tag ImageDescription (0x010E), Artist (0x013B), Software (0x0131), and Windows XP
 *    Extended Tags in UCS-2 / UTF-16LE: XPTitle (0x9C9B), XPKeywords (0x9C9E), XPComment (0x9C9C),
 *    XPAuthor (0x9C9D), XPSubject (0x9C9F).
 * 3. Adobe XMP Packet: Dublin Core (dc:title, dc:description, dc:subject, dc:creator), Photoshop
 *    (Headline, Credit, Source), and XMP CreatorTool.
 */

export interface ImageMetadata {
  title: string;
  keywords: string[];
  description?: string;
  author?: string;
  software?: string;
  credit?: string;
  source?: string;
}

export type ImageMetadataPayload = ImageMetadata;

// ============================================================================
// BITWISE CRC32 PRECOMPUTED TABLE (For PNG Chunks)
// ============================================================================
let crcTable: Uint32Array | null = null;
function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c >>> 0;
  }
  crcTable = table;
  return crcTable;
}

export function calculateCrc32(bytes: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ============================================================================
// STRING ENCODING HELPERS (UTF-8 & UTF-16LE)
// ============================================================================
function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function encodeUtf16LE(str: string, nullTerminate = true): Uint8Array {
  const codePoints = [];
  for (let i = 0; i < str.length; i++) {
    codePoints.push(str.charCodeAt(i));
  }
  if (nullTerminate) {
    codePoints.push(0);
  }
  const buf = new Uint8Array(codePoints.length * 2);
  const view = new DataView(buf.buffer);
  for (let i = 0; i < codePoints.length; i++) {
    view.setUint16(i * 2, codePoints[i], true); // Little endian
  }
  return buf;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// ============================================================================
// LAYER 1: IPTC IIM SERIALIZER (Photoshop 8BIM Resource 0x0404)
// ============================================================================
function createIptcDataset(recordNum: number, datasetNum: number, dataBytes: Uint8Array): Uint8Array {
  const len = dataBytes.length;
  const chunk = new Uint8Array(5 + len);
  chunk[0] = 0x1c; // Tag marker
  chunk[1] = recordNum;
  chunk[2] = datasetNum;
  chunk[3] = (len >> 8) & 0xff; // Length high byte
  chunk[4] = len & 0xff;        // Length low byte
  chunk.set(dataBytes, 5);
  return chunk;
}

export function buildIptcIimBuffer(meta: ImageMetadata): Uint8Array {
  const author = meta.author || 'Vector Artist';
  const desc = meta.description || meta.title;
  const credit = meta.credit || author;
  const source = meta.source || 'Original Vector Artwork';

  const datasets: Uint8Array[] = [
    // Record 1: Coded Character Set -> \x1b%G (UTF-8)
    createIptcDataset(1, 0x5a, new Uint8Array([0x1b, 0x25, 0x47])),

    // Record 2: Object Name / Title (2:05)
    createIptcDataset(2, 0x05, encodeUtf8(meta.title.slice(0, 256))),

    // Record 2: Caption / Abstract / Description (2:120)
    createIptcDataset(2, 0x78, encodeUtf8(desc.slice(0, 2000))),

    // Record 2: By-line / Author (2:80)
    createIptcDataset(2, 0x50, encodeUtf8(author.slice(0, 128))),

    // Record 2: Headline (2:105)
    createIptcDataset(2, 0x69, encodeUtf8(meta.title.slice(0, 256))),

    // Record 2: Credit (2:110)
    createIptcDataset(2, 0x74, encodeUtf8(credit.slice(0, 128))),

    // Record 2: Source (2:115)
    createIptcDataset(2, 0x73, encodeUtf8(source.slice(0, 128))),
  ];

  // Record 2: Keywords (2:25) - Repeated tag for each keyword
  for (const kw of meta.keywords) {
    if (kw.trim()) {
      datasets.push(createIptcDataset(2, 0x19, encodeUtf8(kw.trim().slice(0, 64))));
    }
  }

  const totalIptcLen = datasets.reduce((sum, d) => sum + d.length, 0);
  const iptcBytes = new Uint8Array(totalIptcLen);
  let offset = 0;
  for (const d of datasets) {
    iptcBytes.set(d, offset);
    offset += d.length;
  }

  return iptcBytes;
}

export function buildPhotoshop8bimBlock(iptcBytes: Uint8Array): Uint8Array {
  // 8BIM Resource Format:
  // Signature '8BIM' (4 bytes) + Resource ID (2 bytes 0x0404) + Name (Pascal string, empty = 2 zero bytes) + Size (4 bytes) + Data (even padded)
  const iptcLen = iptcBytes.length;
  const padByte = iptcLen % 2 === 1 ? 1 : 0;
  const blockTotal = 4 + 2 + 2 + 4 + iptcLen + padByte;

  const buf = new Uint8Array(blockTotal);
  const view = new DataView(buf.buffer);

  // '8BIM'
  buf[0] = 0x38; buf[1] = 0x42; buf[2] = 0x49; buf[3] = 0x4d;

  // Resource ID: 0x0404 (IPTC-NAA)
  view.setUint16(4, 0x0404, false);

  // Name (2 bytes: 0x00, 0x00)
  buf[6] = 0x00; buf[7] = 0x00;

  // Size
  view.setUint32(8, iptcLen, false);

  // Payload
  buf.set(iptcBytes, 12);
  if (padByte) {
    buf[12 + iptcLen] = 0x00;
  }

  return buf;
}

// ============================================================================
// LAYER 2: EXIF IFD0 SERIALIZER WITH WINDOWS XP TAGS (UCS-2 / UTF-16LE)
// ============================================================================
export function buildExifTiffBuffer(meta: ImageMetadata): Uint8Array {
  const author = meta.author || 'Vector Artist';
  const software = meta.software || 'Adobe Illustrator';
  const desc = meta.description || meta.title;
  const keywordsSemicolon = meta.keywords.join(';');

  // Prepare string payloads
  const asciiDesc = encodeUtf8(desc + '\0');
  const asciiAuthor = encodeUtf8(author + '\0');
  const asciiSoftware = encodeUtf8(software + '\0');

  const xpTitle = encodeUtf16LE(meta.title, true);
  const xpKeywords = encodeUtf16LE(keywordsSemicolon, true);
  const xpComment = encodeUtf16LE(desc, true);
  const xpAuthor = encodeUtf16LE(author, true);
  const xpSubject = encodeUtf16LE(meta.title, true);

  // IFD Entries definition:
  // Tag ID, Type (1=BYTE, 2=ASCII, 3=SHORT, 4=LONG), Count, Raw Data bytes
  const entries: Array<{ tag: number; type: number; count: number; data: Uint8Array }> = [
    { tag: 0x010e, type: 2, count: asciiDesc.length, data: asciiDesc },         // ImageDescription (ASCII)
    { tag: 0x0131, type: 2, count: asciiSoftware.length, data: asciiSoftware }, // Software (ASCII)
    { tag: 0x013b, type: 2, count: asciiAuthor.length, data: asciiAuthor },     // Artist / Author (ASCII)
    { tag: 0x9c9b, type: 1, count: xpTitle.length, data: xpTitle },             // XPTitle (BYTE / UTF-16LE)
    { tag: 0x9c9c, type: 1, count: xpComment.length, data: xpComment },         // XPComment (BYTE / UTF-16LE)
    { tag: 0x9c9d, type: 1, count: xpAuthor.length, data: xpAuthor },           // XPAuthor (BYTE / UTF-16LE)
    { tag: 0x9c9e, type: 1, count: xpKeywords.length, data: xpKeywords },       // XPKeywords (BYTE / UTF-16LE)
    { tag: 0x9c9f, type: 1, count: xpSubject.length, data: xpSubject },         // XPSubject (BYTE / UTF-16LE)
  ];

  // Sort entries ascending by Tag ID (Required by TIFF specification)
  entries.sort((a, b) => a.tag - b.tag);

  // Layout calculation:
  // 8 bytes TIFF header ('II', 0x002A, offset 8)
  // 2 bytes entry count
  // N * 12 bytes entry records
  // 4 bytes next IFD offset (0)
  // Values payload area
  const tiffHeaderSize = 8;
  const ifdEntriesHeader = 2;
  const ifdTableSize = entries.length * 12;
  const nextIfdOffsetSize = 4;
  const ifdStart = tiffHeaderSize;
  const valuePayloadStart = ifdStart + ifdEntriesHeader + ifdTableSize + nextIfdOffsetSize;

  let totalPayloadSize = 0;
  for (const e of entries) {
    if (e.data.length > 4) {
      totalPayloadSize += e.data.length;
    }
  }

  const tiffBuffer = new Uint8Array(valuePayloadStart + totalPayloadSize);
  const view = new DataView(tiffBuffer.buffer);

  // TIFF Header: 'II' (Little Endian), 0x002A, IFD0 Offset = 8
  tiffBuffer[0] = 0x49; tiffBuffer[1] = 0x49; // 'II'
  view.setUint16(2, 0x002a, true);
  view.setUint32(4, 0x00000008, true); // IFD0 offset is 8

  // IFD0 Entry count
  view.setUint16(ifdStart, entries.length, true);

  // Write Entries
  let currentEntryOffset = ifdStart + 2;
  let currentValueOffset = valuePayloadStart;

  for (const e of entries) {
    view.setUint16(currentEntryOffset, e.tag, true);
    view.setUint16(currentEntryOffset + 2, e.type, true);
    view.setUint32(currentEntryOffset + 4, e.count, true);

    if (e.data.length <= 4) {
      // Inlined value (padded to 4 bytes)
      for (let i = 0; i < e.data.length; i++) {
        tiffBuffer[currentEntryOffset + 8 + i] = e.data[i];
      }
    } else {
      // Offset pointer
      view.setUint32(currentEntryOffset + 8, currentValueOffset, true);
      tiffBuffer.set(e.data, currentValueOffset);
      currentValueOffset += e.data.length;
    }

    currentEntryOffset += 12;
  }

  // Next IFD Offset = 0
  view.setUint32(currentEntryOffset, 0, true);

  return tiffBuffer;
}

// ============================================================================
// LAYER 3: ADOBE XMP PACKET SERIALIZER (RDF XML DUBLIN CORE)
// ============================================================================
export function buildAdobeXmpPacket(meta: ImageMetadata): string {
  const author = escapeXml(meta.author || 'Vector Artist');
  const software = escapeXml(meta.software || 'Adobe Illustrator');
  const credit = escapeXml(meta.credit || author);
  const source = escapeXml(meta.source || 'Original Vector Artwork');
  const desc = escapeXml(meta.description || meta.title);
  const title = escapeXml(meta.title);

  const keywordsXml = meta.keywords
    .filter((k) => k.trim())
    .map((k) => `            <rdf:li>${escapeXml(k.trim())}</rdf:li>`)
    .join('\n');

  return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.0-c000 1.000000">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"
        xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${title}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${desc}</rdf:li>
        </rdf:Alt>
      </dc:description>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>${author}</rdf:li>
        </rdf:Seq>
      </dc:creator>
      <dc:rights>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">Copyright © ${new Date().getFullYear()} ${author}. All rights reserved.</rdf:li>
        </rdf:Alt>
      </dc:rights>
      <dc:subject>
        <rdf:Bag>
${keywordsXml}
        </rdf:Bag>
      </dc:subject>
      <photoshop:Headline>${title}</photoshop:Headline>
      <photoshop:Credit>${credit}</photoshop:Credit>
      <photoshop:Source>${source}</photoshop:Source>
      <photoshop:AuthorsPosition>Artist / Creator</photoshop:AuthorsPosition>
      <photoshop:CaptionWriter>${author}</photoshop:CaptionWriter>
      <xmp:CreatorTool>${software}</xmp:CreatorTool>
      <xmpRights:Marked>True</xmpRights:Marked>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

// ============================================================================
// PNG CHUNK HELPERS & 3-LAYER PNG INJECTOR
// ============================================================================
function createPngChunk(type: string, data: Uint8Array): Uint8Array {
  const length = data.length;
  const chunk = new Uint8Array(4 + 4 + length + 4);
  const view = new DataView(chunk.buffer);

  // 4 bytes length
  view.setUint32(0, length, false);

  // 4 bytes type
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }

  // N bytes data
  chunk.set(data, 8);

  // 4 bytes CRC32 calculated over Type + Data
  const typeAndData = chunk.subarray(4, 8 + length);
  const crc = calculateCrc32(typeAndData);
  view.setUint32(8 + length, crc, false);

  return chunk;
}

function createPngTextChunk(keyword: string, text: string): Uint8Array {
  const keyBytes = encodeUtf8(keyword);
  const textBytes = encodeUtf8(text);
  const data = new Uint8Array(keyBytes.length + 1 + textBytes.length);
  data.set(keyBytes, 0);
  data[keyBytes.length] = 0; // Null separator
  data.set(textBytes, keyBytes.length + 1);
  return createPngChunk('tEXt', data);
}

function createPngItxtChunk(xmpXml: string): Uint8Array {
  const keyBytes = encodeUtf8('XML:com.adobe.xmp');
  const textBytes = encodeUtf8(xmpXml);
  // iTXt: keyword + \0 + compression_flag(0) + compression_method(0) + lang_tag("") + \0 + trans_key("") + \0 + text
  const headerLen = keyBytes.length + 1 + 1 + 1 + 0 + 1 + 0 + 1;
  const data = new Uint8Array(headerLen + textBytes.length);

  let offset = 0;
  data.set(keyBytes, offset); offset += keyBytes.length;
  data[offset++] = 0; // null
  data[offset++] = 0; // uncompressed
  data[offset++] = 0; // compression method 0
  data[offset++] = 0; // null for empty lang tag
  data[offset++] = 0; // null for empty trans key
  data.set(textBytes, offset);

  return createPngChunk('iTXt', data);
}

/**
 * Standard PNG eXIf chunk containing raw TIFF header + IFD0 table
 */
function createPngExifChunk(tiffBytes: Uint8Array): Uint8Array {
  return createPngChunk('eXIf', tiffBytes);
}

/**
 * Injects 3 synchronized metadata layers into a PNG binary byte buffer:
 * - Layer 1: IPTC IIM text chunks + XMP
 * - Layer 2: eXIf chunk with standard IFD0 & Windows XP Tags (UCS-2)
 * - Layer 3: iTXt chunk with Adobe XMP Packet & tEXt chunks
 */
export function injectMetadataIntoPng(pngBytes: Uint8Array, meta: ImageMetadata): Uint8Array {
  // Validate PNG Signature: [137, 80, 78, 71, 13, 10, 26, 10]
  if (
    pngBytes.length < 8 ||
    pngBytes[0] !== 137 ||
    pngBytes[1] !== 80 ||
    pngBytes[2] !== 78 ||
    pngBytes[3] !== 71
  ) {
    return pngBytes;
  }

  // End of IHDR chunk is always at offset 33 (8 sig + 4 len + 4 type + 13 data + 4 crc)
  const ihdrEndOffset = 33;
  const author = meta.author || '2D Vector Studio';
  const software = meta.software || '2D Vector Studio AI Generator';
  const desc = meta.description || meta.title;
  const keywordsComma = meta.keywords.join(', ');

  // 1. Layer 3: Adobe XMP XML
  const xmpXml = buildAdobeXmpPacket(meta);

  // 2. Layer 2: EXIF IFD0 TIFF with Windows XP UCS-2 tags
  const tiffBytes = buildExifTiffBuffer(meta);

  // 3. Construct all metadata chunks to inject right after IHDR
  const chunksToInsert: Uint8Array[] = [
    createPngTextChunk('Title', meta.title),
    createPngTextChunk('Description', desc),
    createPngTextChunk('Keywords', keywordsComma),
    createPngTextChunk('Author', author),
    createPngTextChunk('Software', software),
    createPngTextChunk('Comment', desc),
    createPngExifChunk(tiffBytes), // Layer 2: eXIf chunk
    createPngItxtChunk(xmpXml),    // Layer 3: Adobe XMP packet
  ];

  const totalExtraBytes = chunksToInsert.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(pngBytes.length + totalExtraBytes);

  // Copy signature + IHDR
  result.set(pngBytes.subarray(0, ihdrEndOffset), 0);

  // Copy injected chunks
  let currentOffset = ihdrEndOffset;
  for (const chunk of chunksToInsert) {
    result.set(chunk, currentOffset);
    currentOffset += chunk.length;
  }

  // Copy remaining original PNG chunks
  result.set(pngBytes.subarray(ihdrEndOffset), currentOffset);

  return result;
}

// ============================================================================
// JPEG 3-LAYER INJECTOR (APP1 EXIF, APP13 PHOTOSHOP 8BIM, APP1 XMP)
// ============================================================================
/**
 * Injects 3 synchronized metadata layers into a JPEG binary byte buffer:
 * - Layer 1: APP13 Photoshop 8BIM segment (0xFFED) with IPTC-NAA 0x0404 & UTF-8 declaration
 * - Layer 2: APP1 Exif segment (0xFFE1) with TIFF IFD0 & Windows XP Tags (UCS-2)
 * - Layer 3: APP1 Adobe XMP segment (0xFFE1) with full Dublin Core RDF XML
 */
export function injectMetadataIntoJpeg(jpegBytes: Uint8Array, meta: ImageMetadata): Uint8Array {
  // Validate JPEG SOI marker [0xFF, 0xD8]
  if (jpegBytes.length < 2 || jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
    return jpegBytes;
  }

  const segmentsToInsert: Uint8Array[] = [];

  // 1. Layer 2: APP1 EXIF segment [0xFF, 0xE1, len(2), 'Exif\0\0', tiffBytes]
  const tiffBytes = buildExifTiffBuffer(meta);
  const exifHeader = encodeUtf8('Exif\0\0');
  const exifPayloadLen = exifHeader.length + tiffBytes.length;
  const app1Exif = new Uint8Array(2 + 2 + exifPayloadLen);
  const app1ExifView = new DataView(app1Exif.buffer);
  app1Exif[0] = 0xff; app1Exif[1] = 0xe1;
  app1ExifView.setUint16(2, 2 + exifPayloadLen, false); // Big endian length
  app1Exif.set(exifHeader, 4);
  app1Exif.set(tiffBytes, 4 + exifHeader.length);
  segmentsToInsert.push(app1Exif);

  // 2. Layer 1: APP13 Photoshop 8BIM segment [0xFF, 0xED, len(2), 'Photoshop 3.0\0', 8bimBytes]
  const iptcBytes = buildIptcIimBuffer(meta);
  const bimBytes = buildPhotoshop8bimBlock(iptcBytes);
  const psHeader = encodeUtf8('Photoshop 3.0\0');
  const psPayloadLen = psHeader.length + bimBytes.length;
  const app13Bim = new Uint8Array(2 + 2 + psPayloadLen);
  const app13View = new DataView(app13Bim.buffer);
  app13Bim[0] = 0xff; app13Bim[1] = 0xed;
  app13View.setUint16(2, 2 + psPayloadLen, false);
  app13Bim.set(psHeader, 4);
  app13Bim.set(bimBytes, 4 + psHeader.length);
  segmentsToInsert.push(app13Bim);

  // 3. Layer 3: APP1 Adobe XMP segment [0xFF, 0xE1, len(2), 'http://ns.adobe.com/xap/1.0/\0', xmpBytes]
  const xmpXml = buildAdobeXmpPacket(meta);
  const xmpHeader = encodeUtf8('http://ns.adobe.com/xap/1.0/\0');
  const xmpTextBytes = encodeUtf8(xmpXml);
  const xmpPayloadLen = xmpHeader.length + xmpTextBytes.length;
  const app1Xmp = new Uint8Array(2 + 2 + xmpPayloadLen);
  const app1XmpView = new DataView(app1Xmp.buffer);
  app1Xmp[0] = 0xff; app1Xmp[1] = 0xe1;
  app1XmpView.setUint16(2, 2 + xmpPayloadLen, false);
  app1Xmp.set(xmpHeader, 4);
  app1Xmp.set(xmpTextBytes, 4 + xmpHeader.length);
  segmentsToInsert.push(app1Xmp);

  // Construct new JPEG binary right after SOI marker (offset 2)
  const totalExtraBytes = segmentsToInsert.reduce((sum, s) => sum + s.length, 0);
  const result = new Uint8Array(jpegBytes.length + totalExtraBytes);

  result.set(jpegBytes.subarray(0, 2), 0); // SOI

  let currentOffset = 2;
  for (const seg of segmentsToInsert) {
    result.set(seg, currentOffset);
    currentOffset += seg.length;
  }

  result.set(jpegBytes.subarray(2), currentOffset);

  return result;
}

/**
 * Universal Image Metadata Injector: Auto-detects PNG or JPEG and injects 3-layer microstock metadata.
 */
export function injectImageMetadata(imageBytes: Uint8Array, meta: ImageMetadata): Uint8Array {
  // Check PNG signature
  if (
    imageBytes.length >= 8 &&
    imageBytes[0] === 137 &&
    imageBytes[1] === 80 &&
    imageBytes[2] === 78 &&
    imageBytes[3] === 71
  ) {
    return injectMetadataIntoPng(imageBytes, meta);
  }

  // Check JPEG SOI marker
  if (imageBytes.length >= 2 && imageBytes[0] === 0xff && imageBytes[1] === 0xd8) {
    return injectMetadataIntoJpeg(imageBytes, meta);
  }

  return imageBytes;
}

/**
 * Sanitizes a title into a clean, SEO-friendly file name for microstock portals (without 1x1).
 */
export function sanitizeSeoFileName(title: string, suffix: string = '.png'): string {
  if (!title) return `vector_asset_${Date.now()}${suffix}`;

  const clean = title
    .toLowerCase()
    .replace(/\b1\s*[:xX\-]\s*1\b/gi, '') // remove 1:1, 1x1, 1-1
    .replace(/_1x1(?=_|$)/gi, '')
    .replace(/_1_1(?=_|$)/gi, '')
    .replace(/1x1/gi, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_1x1_/gi, '_')
    .replace(/_1x1$/gi, '')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

  const finalBase = clean || 'vector_graphic';
  return finalBase.endsWith(suffix) ? finalBase : `${finalBase}${suffix}`;
}
