// server/services/image-generator.service.ts
import fs from 'node:fs/promises';
import path from 'node:path';

export interface OpenRouterImagePayload {
  model: string;
  prompt: string;
  response_format?: 'b64_json' | 'url';
  aspect_ratio?: string;
  n?: number;
  size?: string;
}

export interface OpenRouterImageItem {
  b64_json?: string;
  url?: string;
}

export interface OpenRouterImageResponse {
  created?: number;
  data: OpenRouterImageItem[];
}

export interface SavedImageResult {
  fileName: string;
  relativePath: string;
  absolutePath: string;
  dataUrl?: string;
}

export async function generateOpenRouterImage(
  prompt: string,
  model: string = process.env.OPENROUTER_IMAGE_MODEL || 'openai/gpt-image-2.5-sunburst'
): Promise<OpenRouterImageResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY belum disetel di file environment (.env)');
  }

  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const imageEndpoint = process.env.OPENROUTER_IMAGE_ENDPOINT || `${baseUrl.replace(/\/$/, '')}/images`;

  const payload: OpenRouterImagePayload = {
    model,
    prompt,
    response_format: 'b64_json',
    aspect_ratio: '1:1',
    n: 1,
    size: '1024x1024',
  };

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  if (process.env.OPENROUTER_HTTP_REFERER) {
    headers['HTTP-Referer'] = process.env.OPENROUTER_HTTP_REFERER;
  }
  if (process.env.OPENROUTER_SITE_NAME) {
    headers['X-Title'] = process.env.OPENROUTER_SITE_NAME;
  }

  const response = await fetch(imageEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Custom / OpenRouter Image API Error [${response.status}]: ${errorBody}`);
  }

  const result: OpenRouterImageResponse = await response.json();
  return result;
}

/**
 * Menyimpan buffer base64 gambar ke folder khusus per tanggal: data/outputs/YYYY-MM-DD/
 */
export async function saveGeneratedImagesByDate(
  images: OpenRouterImageItem[]
): Promise<SavedImageResult[]> {
  const today = new Date().toISOString().split('T')[0];
  const dateDir = path.join(process.cwd(), 'data', 'outputs', today);

  await fs.mkdir(dateDir, { recursive: true });

  const savedResults: SavedImageResult[] = [];
  const timestamp = Date.now();

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    if (!item.b64_json && !item.url) continue;

    const fileName = `img-${timestamp}-${i}.png`;
    const absolutePath = path.join(dateDir, fileName);
    const relativePath = path.posix.join('outputs', today, fileName);

    let dataUrl = '';
    if (item.b64_json) {
      const buffer = Buffer.from(item.b64_json, 'base64');
      await fs.writeFile(absolutePath, buffer);
      dataUrl = `data:image/png;base64,${item.b64_json}`;
    } else if (item.url) {
      // Unduh dari URL jika provider mengembalikan format url
      const imgRes = await fetch(item.url);
      const arrayBuf = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      await fs.writeFile(absolutePath, buffer);
      dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    }

    savedResults.push({
      fileName,
      relativePath,
      absolutePath,
      dataUrl,
    });
  }

  return savedResults;
}
