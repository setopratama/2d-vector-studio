// src/utils/pngMetadataHelper.ts
/**
 * PNG & Image Metadata Helper
 * Re-exports the 3-layer zero-dependency microstock metadata injector.
 * 100% pure client-side Native JavaScript (TypedArray / ArrayBuffer / DataView).
 * Strictly compliant with Adobe Stock, Shutterstock, and Freepik requirements.
 */

import {
  ImageMetadata,
  injectImageMetadata,
  injectMetadataIntoPng,
  injectMetadataIntoJpeg,
  sanitizeSeoFileName,
  calculateCrc32,
  buildExifTiffBuffer,
  buildIptcIimBuffer,
  buildPhotoshop8bimBlock,
  buildAdobeXmpPacket,
} from './imageMetadataInjector';

export type ImageMetadataPayload = ImageMetadata;

export {
  injectImageMetadata,
  injectMetadataIntoPng,
  injectMetadataIntoJpeg,
  sanitizeSeoFileName,
  calculateCrc32,
  buildExifTiffBuffer,
  buildIptcIimBuffer,
  buildPhotoshop8bimBlock,
  buildAdobeXmpPacket,
};

/**
 * Backward compatibility alias for injectMetadataIntoPng
 */
export function injectPngMetadata(pngBytes: Uint8Array, metadata: ImageMetadataPayload): Uint8Array {
  return injectMetadataIntoPng(pngBytes, metadata);
}
