// server/services/prompt-engine.service.ts

export const SERVER_STYLE_PRESETS: Record<
  string,
  { name: string; category: string; description: string; promptSnippet: string }
> = {
  'flat-vector': {
    name: 'Flat Vector Art',
    category: 'vector',
    description: 'Minimalist screen-print, bold outlines, vibrant flat colors, 100% vector autotrace ready',
    promptSnippet: 'crisp 2D flat vector art, sharp geometric contours, bold solid lines, clean screen-print aesthetic, isolated on pure white background, svg graphic ready',
  },
  'mascot-logo': {
    name: 'Mascot Character',
    category: 'sticker',
    description: 'Iconic die-cut character mascot, clean thick strokes, high contrast, perfect for merchandise',
    promptSnippet: 'bold 2D vector mascot, thick black outer stroke, die-cut sticker silhouette, vibrant solid fill colors, isolated on pure white background, svg autotrace friendly',
  },
  'monoline-ink': {
    name: 'Monoline Line Art',
    category: 'monochrome',
    description: 'Uniform stroke width, single-color ink curves, minimal vector nodes, zero clutter',
    promptSnippet: 'monoline 2D vector graphic, uniform stroke weight, crisp minimalist vector paths, isolated on pure white background, clean line art vector',
  },
  'sticker-decal': {
    name: 'Sticker Decal',
    category: 'sticker',
    description: 'Die-cut border, white outline offset, graphic sticker asset for digital & physical print',
    promptSnippet: 'vector sticker decal, clean white border contour, flat graphic fills, modern pop vector aesthetic, isolated on pure white background',
  },
  'vintage-emblem': {
    name: 'Vintage Badge / Emblem',
    category: 'badge',
    description: 'Geometric symmetry, retro typography frame, clean solid vector stamps',
    promptSnippet: 'vintage 2D vector badge emblem, clean geometric symmetry, bold retro stencil lines, solid color blocks, isolated on pure white background',
  },
  'stencil-silhouette': {
    name: 'Stencil Silhouette',
    category: 'monochrome',
    description: 'High-contrast negative space cutout, solid bold shapes, zero shading',
    promptSnippet: 'high-contrast stencil silhouette, sharp negative space cutouts, solid black vector shapes, isolated on pure white background, instant svg trace',
  },
};

export interface PromptExpansionParams {
  rawIdea: string;
  targetEngine?: string;
  aspectRatio?: string;
  stylePreset?: string;
  variationStyle?: string;
  variationIndex?: number;
  isBlackAndWhite?: boolean;
}

export interface PromptExpansionResult {
  title: string;
  optimizedPrompt: string;
  negativePrompt?: string;
  vectorStyle?: string;
  colorPalette?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    promptCostUsd: string;
    promptCostIdr: string;
  };
}

export async function generateOptimizedPrompt(
  params: PromptExpansionParams,
  model: string = process.env.OPENROUTER_PROMPT_MODEL || 'deepseek/deepseek-chat'
): Promise<PromptExpansionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY belum disetel di file environment (.env)');
  }

  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const promptEndpoint = process.env.OPENROUTER_PROMPT_ENDPOINT || `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const presetKey = params.stylePreset || 'flat-vector';
  const presetInfo = SERVER_STYLE_PRESETS[presetKey] || {
    name: params.stylePreset || 'Flat Vector Art',
    category: 'vector',
    description: 'Flat vector graphics',
    promptSnippet: 'crisp 2D flat vector art, sharp geometric contours, bold solid lines, clean screen-print aesthetic, isolated on pure white background, svg graphic ready',
  };

  const variationAngle = params.variationStyle || 'Dynamic Angle';
  const variationIndexStr = params.variationIndex ? ` (Variation #${params.variationIndex})` : '';

  const systemPrompt = `You are an expert prompt engineer specializing in 2D vector graphic assets, icons, and sticker art optimized for SVG autotracing and cost-effective image generation.
Convert the user's raw idea into a concise, token-efficient, high-contrast 2D visual prompt (strictly 30-50 words maximum).

CRITICAL STRICT RULES:
1. STRICT STYLE CONSISTENCY: The user has selected the style preset: "${presetInfo.name}".
   - You MUST STAY 100% FAITHFUL to "${presetInfo.name}".
   - DO NOT introduce, mix, or cross over into other art categories (e.g. if "${presetInfo.name}" is "Flat Vector Art", DO NOT create badges, circular stamps, stencils, stickers, or vintage emblems).
   - The variation angle ("${variationAngle}") represents composition, perspective, camera angle, or pose WITHIN the "${presetInfo.name}" style.
2. Token Efficiency: Zero filler words (no "masterpiece", "trending", "ultra high quality"). Direct, high-density visual descriptors only.
3. 2D Vector Look: Sharp vector contours, bold solid lines, clean solid color fills, isolated on pure white background.
4. Black & White Mode: If ENABLED, enforce pure black ink line art/silhouette on solid white background with zero grays, zero shadows, zero gradients, and zero colors.
5. Absolute Prohibitions: No photorealism, no 3D renders, no realistic skin or textures, no complex background scenes, no photographic noise.

Respond strictly in JSON format with keys:
- title: (short 3-5 word summary)
- optimizedPrompt: (concise 30-50 words vector prompt in English)
- negativePrompt: (concise negative keywords)
- vectorStyle: (must be "${presetInfo.name} - ${variationAngle}")
- colorPalette: (e.g., "Pure Black & White Ink" or "Flat Solid Colors")`;

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

  const userContent = `Raw idea: "${params.rawIdea}".
Selected Style Preset: "${presetInfo.name}" (Style guideline: ${presetInfo.promptSnippet}).
Variation Angle: "${variationAngle}"${variationIndexStr}.
Target Engine: ${params.targetEngine || 'gpt-image'}. Aspect Ratio: ${params.aspectRatio || '1:1'}.
Black & White Mode: ${params.isBlackAndWhite ? 'ENABLED (Pure Black Ink Art on solid white, zero color, zero grayscale)' : 'DISABLED (Vibrant Flat Solid Colors)'}.
Requirement: Generate a 30-50 words 2D prompt strictly adhering to "${presetInfo.name}" with the "${variationAngle}" angle, isolated on pure white background.`;

  const response = await fetch(promptEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Custom / OpenRouter Prompt Engine Error [${response.status}]: ${errorBody}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  let parsed: any = {};
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    parsed = {
      title: params.rawIdea.slice(0, 30),
      optimizedPrompt: content || params.rawIdea,
      negativePrompt: params.isBlackAndWhite
        ? 'color, grayscale, shading, 3d, photo'
        : 'photorealistic, 3d, shadows, gradients, noise',
      vectorStyle: `${presetInfo.name} - ${variationAngle}`,
      colorPalette: params.isBlackAndWhite ? 'Pure Black & White' : 'Flat Solid Colors',
    };
  }

  const promptTokens = result.usage?.prompt_tokens ?? 0;
  const completionTokens = result.usage?.completion_tokens ?? 0;
  const totalTokens = result.usage?.total_tokens ?? (promptTokens + completionTokens);

  const inputRate = parseFloat(process.env.PROMPT_INPUT_PER_TOKEN_USD || '0.00000014');
  const outputRate = parseFloat(process.env.PROMPT_OUTPUT_PER_TOKEN_USD || '0.00000056');
  const usdToIdr = parseFloat(process.env.USD_TO_IDR_RATE || '16000');

  const costUsd = (promptTokens * inputRate) + (completionTokens * outputRate);
  const costIdr = costUsd * usdToIdr;

  return {
    ...parsed,
    vectorStyle: parsed.vectorStyle || `${presetInfo.name} - ${variationAngle}`,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
      promptCostUsd: costUsd.toFixed(6),
      promptCostIdr: `Rp ${costIdr.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  };
}
