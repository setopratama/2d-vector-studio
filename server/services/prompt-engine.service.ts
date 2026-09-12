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
  includeMetadata?: boolean;
}

export interface PromptExpansionResult {
  title: string;
  adobeStockTitle?: string;
  keywords?: string[];
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
  const includeMeta = Boolean(params.includeMetadata);

  const metadataSystemInstruction = includeMeta
    ? `5. Adobe Stock Title Requirement:
   - "adobeStockTitle": A commercial, SEO-optimized title in English describing the vector asset.
   - Character count MUST be between 70 to 120 characters (STRICT MAXIMUM 120 characters).
   - Must include the main subject, 2D vector style, and "isolated on white background".
6. Adobe Stock Keywords Requirement:
   - "keywords": An array of 25 to 45 high-relevance microstock search tags in English.
   - Each keyword must be MAXIMUM 2 words (e.g. "vector art", "fox mascot", "flat design", "emblem", "isolated", "white background", "logo icon").
   - No punctuation, no duplicate tags.`
    : ``;

  const jsonKeysInstruction = includeMeta
    ? `Respond strictly in JSON format with keys:
- title: (short 3-5 word summary)
- adobeStockTitle: (commercial English SEO title, 70-120 characters max)
- keywords: (array of 25-45 stock keywords in English, max 2 words per tag)
- optimizedPrompt: (concise 30-50 words vector prompt in English)
- negativePrompt: (concise negative keywords)
- vectorStyle: (must be "${presetInfo.name} - ${variationAngle}")
- colorPalette: (e.g., "Pure Black & White Ink" or "Flat Solid Colors")`
    : `Respond strictly in JSON format with keys:
- title: (short 3-5 word summary)
- optimizedPrompt: (concise 30-50 words vector prompt in English)
- negativePrompt: (concise negative keywords)
- vectorStyle: (must be "${presetInfo.name} - ${variationAngle}")
- colorPalette: (e.g., "Pure Black & White Ink" or "Flat Solid Colors")`;

  const systemPrompt = `You are an expert prompt engineer specializing in 2D vector graphic assets, icons, and sticker art optimized for SVG autotracing and image generation.
Convert the user's raw idea into a concise 2D visual prompt (strictly 30-50 words).

CRITICAL STRICT RULES:
1. STRICT STYLE CONSISTENCY: The user has selected the style preset: "${presetInfo.name}".
   - You MUST STAY 100% FAITHFUL to "${presetInfo.name}".
   - DO NOT introduce, mix, or cross over into other art categories.
   - The variation angle ("${variationAngle}") represents composition, perspective, camera angle, or pose WITHIN the "${presetInfo.name}" style.
2. Token Efficiency: Zero filler words (no "masterpiece", "trending", "ultra high quality"). Direct, high-density visual descriptors only.
3. 2D Vector Look: Sharp vector contours, bold solid lines, clean solid color fills, isolated on pure white background.
4. Black & White Mode: If ENABLED, enforce pure black ink line art/silhouette on solid white background with zero grays, zero shadows, zero gradients, and zero colors.
${metadataSystemInstruction}

${jsonKeysInstruction}`;

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
Requirement: Generate a 30-50 words 2D prompt strictly adhering to "${presetInfo.name}" with the "${variationAngle}" angle, isolated on pure white background${includeMeta ? ', plus Adobe Stock SEO Title (70-120 chars) and 25-45 stock keywords' : ''}.`;

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
    const defaultTitle = `${params.rawIdea} 2D flat vector illustration, isolated on pure white background`;
    parsed = {
      title: params.rawIdea.slice(0, 30),
      adobeStockTitle: defaultTitle.length > 120 ? defaultTitle.slice(0, 120) : defaultTitle,
      keywords: ['vector art', 'flat design', 'illustration', 'graphic', 'isolated', 'white background', 'icon', 'clipart', '2d vector'],
      optimizedPrompt: content || params.rawIdea,
      negativePrompt: params.isBlackAndWhite
        ? 'color, grayscale, shading, 3d, photo'
        : 'photorealistic, 3d, shadows, gradients, noise',
      vectorStyle: `${presetInfo.name} - ${variationAngle}`,
      colorPalette: params.isBlackAndWhite ? 'Pure Black & White' : 'Flat Solid Colors',
    };
  }

  // Ensure Adobe Stock Title if metadata requested
  let cleanAdobeStockTitle = parsed.adobeStockTitle || `${params.rawIdea} vector graphic asset, isolated on pure white background`;
  if (cleanAdobeStockTitle.length > 120) {
    cleanAdobeStockTitle = cleanAdobeStockTitle.slice(0, 117) + '...';
  }

  // Ensure Keywords
  let cleanKeywords: string[] = [];
  if (Array.isArray(parsed.keywords)) {
    cleanKeywords = parsed.keywords
      .map((k: any) => String(k).trim().toLowerCase())
      .filter((k: string) => k.length > 0 && k.split(/\s+/).length <= 2)
      .slice(0, 48);
  }
  if (cleanKeywords.length === 0) {
    cleanKeywords = ['vector art', 'flat design', 'illustration', 'graphic', 'isolated', 'white background', 'stock asset'];
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
    adobeStockTitle: includeMeta ? cleanAdobeStockTitle : (parsed.adobeStockTitle || cleanAdobeStockTitle),
    keywords: includeMeta ? cleanKeywords : (parsed.keywords?.length ? cleanKeywords : ['vector', 'illustration', 'isolated', 'white background']),
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

export interface KeywordExpanderParams {
  keyword: string;
}

export interface KeywordExpanderResult {
  concepts: string[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    promptCostUsd: string;
    promptCostIdr: string;
  };
}

export async function expandSingleKeywordToConcepts(
  params: KeywordExpanderParams,
  model: string = process.env.OPENROUTER_PROMPT_MODEL || 'deepseek/deepseek-chat'
): Promise<KeywordExpanderResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const rawKeyword = (params.keyword || '').trim();

  if (!apiKey) {
    // Fallback if no API key is set
    const kw = rawKeyword || 'kopi';
    const fallbackConcepts = [
      `${kw} hangat cangkir keramik`,
      `${kw} dingin gelas kaca`,
      `${kw} kemasan botol modern`,
      `${kw} aromatik racikan barista`,
    ];
    return {
      concepts: fallbackConcepts,
      usage: {
        promptTokens: 75,
        completionTokens: 35,
        totalTokens: 110,
        promptCostUsd: '0.000030',
        promptCostIdr: 'Rp 0,48',
      },
    };
  }

  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const promptEndpoint = process.env.OPENROUTER_PROMPT_ENDPOINT || `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const systemPrompt = `You are a creative commercial concept generator for visual design assets.
The user provides 1 or 2 root words (e.g. "kopi", "kopi susu", "rubah", "rubah mekanik", "kucing", "mobil"). If the input is empty or vague, pick a popular imaginative subject.
Your task is to expand it into EXACTLY 4 distinct, imaginative, and concrete subject/character/object concepts.

CRITICAL RULES:
1. PURE SUBJECT/OBJECT FOCUS: Focus strictly on the subject matter, character action, animal trait, or physical object (e.g. "gelas es kopi susu", "cangkir kopi panas aromatik", "rubah mekanik lapis baja", "kucing astronot luar angkasa", "mobil balap retro klasik").
2. DO NOT INCLUDE STYLE LABELS: Do NOT add graphic style descriptors like "flat vector", "monoline", "stencil", "die-cut", "black and white", or "clipart", so that the user can freely choose any art style later without keyword collision.
3. STRICT WORD COUNT: Each of the 4 concepts MUST be STRICTLY 3 to 4 descriptive words.
4. NATURAL LANGUAGE: Output in the same natural language as the user input (Indonesian if input is Indonesian, English if input is English).

Respond strictly in JSON format:
{
  "concepts": [
    "concept 1 (strictly 3-4 words)",
    "concept 2 (strictly 3-4 words)",
    "concept 3 (strictly 3-4 words)",
    "concept 4 (strictly 3-4 words)"
  ]
}`;

  const userContent = rawKeyword
    ? `Root keyword: "${rawKeyword}". Generate 4 creative, concrete 3-4 word subject concepts in the same language.`
    : `Generate 4 popular creative, concrete 3-4 word subject concepts in Indonesian.`;

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

  const response = await fetch(promptEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Keyword Expander Error [${response.status}]: ${errorBody}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  let parsed: any = {};
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    parsed = {
      concepts: [
        `${rawKeyword || 'kopi'} hangat cangkir keramik`,
        `${rawKeyword || 'kopi'} dingin gelas kaca`,
        `${rawKeyword || 'kopi'} kemasan botol modern`,
        `${rawKeyword || 'kopi'} aromatik racikan barista`,
      ],
    };
  }

  let cleanConcepts: string[] = [];
  if (Array.isArray(parsed.concepts)) {
    cleanConcepts = parsed.concepts
      .map((c: any) => String(c).trim())
      .filter((c: string) => c.length > 0)
      .slice(0, 4);
  }

  if (cleanConcepts.length === 0) {
    cleanConcepts = [
      `${rawKeyword || 'kopi'} hangat cangkir keramik`,
      `${rawKeyword || 'kopi'} dingin gelas kaca`,
      `${rawKeyword || 'kopi'} kemasan botol modern`,
      `${rawKeyword || 'kopi'} aromatik racikan barista`,
    ];
  }

  const promptTokens = result.usage?.prompt_tokens ?? 70;
  const completionTokens = result.usage?.completion_tokens ?? 35;
  const totalTokens = result.usage?.total_tokens ?? (promptTokens + completionTokens);

  const inputRate = parseFloat(process.env.PROMPT_INPUT_PER_TOKEN_USD || '0.00000014');
  const outputRate = parseFloat(process.env.PROMPT_OUTPUT_PER_TOKEN_USD || '0.00000056');
  const usdToIdr = parseFloat(process.env.USD_TO_IDR_RATE || '16000');

  const costUsd = (promptTokens * inputRate) + (completionTokens * outputRate);
  const costIdr = costUsd * usdToIdr;

  return {
    concepts: cleanConcepts,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
      promptCostUsd: costUsd.toFixed(6),
      promptCostIdr: `Rp ${costIdr.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  };
}
