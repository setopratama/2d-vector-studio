// src/utils/downloadHelper.ts
import { injectImageMetadata, sanitizeSeoFileName, ImageMetadataPayload } from './imageMetadataInjector';

export interface MetadataOptions {
  title?: string;
  keywords?: string[];
  description?: string;
  author?: string;
  software?: string;
  credit?: string;
  source?: string;
}

/**
 * Download a single image file safely.
 * Injects 3 synchronized microstock metadata layers (IPTC IIM 8BIM, EXIF IFD0 Windows XP UCS-2, Adobe XMP)
 * directly into binary chunks without external dependencies, and names the file with the SEO title.
 */
export async function downloadSingleImage(
  imageUrl: string,
  fileName: string,
  metadata?: MetadataOptions
): Promise<void> {
  if (!imageUrl) return;

  try {
    let finalBlob: Blob;
    let effectiveFileName = fileName;

    // Determine clean file name from SEO title if available
    if (metadata?.title) {
      effectiveFileName = sanitizeSeoFileName(metadata.title);
    } else if (!effectiveFileName.endsWith('.png') && !effectiveFileName.endsWith('.jpg') && !effectiveFileName.endsWith('.jpeg')) {
      effectiveFileName = `${effectiveFileName}.png`;
    }

    // Convert imageUrl (dataUrl or HTTP URL) to ArrayBuffer
    let arrayBuffer: ArrayBuffer;
    if (imageUrl.startsWith('data:')) {
      const byteString = atob(imageUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      arrayBuffer = ab;
    } else {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      arrayBuffer = await response.arrayBuffer();
    }

    const isJpeg = effectiveFileName.endsWith('.jpg') || effectiveFileName.endsWith('.jpeg');
    const mimeType = isJpeg ? 'image/jpeg' : 'image/png';

    // Inject 3-layer microstock metadata if title or keywords exist
    if (metadata && (metadata.title || (metadata.keywords && metadata.keywords.length > 0))) {
      const payload: ImageMetadataPayload = {
        title: metadata.title || '2D Vector Art',
        keywords: metadata.keywords || [],
        description: metadata.description || metadata.title,
        author: metadata.author?.trim() || undefined,
        software: metadata.software?.trim() || undefined,
        credit: metadata.credit?.trim() || undefined,
        source: metadata.source?.trim() || undefined,
      };
      const injectedBytes = injectImageMetadata(new Uint8Array(arrayBuffer), payload);
      finalBlob = new Blob([injectedBytes.buffer as ArrayBuffer], { type: mimeType });
    } else {
      finalBlob = new Blob([arrayBuffer], { type: mimeType });
    }

    const blobUrl = URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = effectiveFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (err) {
    console.error(`[Download Error] Gagal mengunduh file ${fileName}:`, err);
    // Fallback: direct anchor trigger
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export interface BatchDownloadItem {
  url: string;
  fileName: string;
  metadata?: MetadataOptions;
}

/**
 * Download multiple images sequentially with a safe delay to prevent browser throttling/popup blocking
 */
export async function downloadMultipleImagesSequentially(
  items: BatchDownloadItem[],
  staggerMs: number = 400
): Promise<void> {
  if (!items || items.length === 0) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.url) continue;

    await downloadSingleImage(item.url, item.fileName, item.metadata);

    if (i < items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, staggerMs));
    }
  }
}
