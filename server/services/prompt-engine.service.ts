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
  'premium-line-art': {
    name: 'Premium Line Art Icon',
    category: 'monochrome',
    description: 'Clean monoline SVG style, uniform stroke, 85-90% detail simplification, generous negative space, coloring book & printable ready',
    promptSnippet: 'minimal premium line art icon of [subject], clean uniform black monoline stroke, 85% simplified essential silhouette, zero color fill, 75% negative white space, smooth vector outlines, isolated on pure white background, svg coloring page printable ready',
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

  const isMonochrome = presetKey === 'premium-line-art' || presetKey === 'monoline-ink' || presetKey === 'stencil-silhouette' || Boolean(params.isBlackAndWhite);
  const isLineArt = presetKey === 'premium-line-art' || presetKey === 'monoline-ink';

  const metadataSystemInstruction = includeMeta
    ? `6. Adobe Stock Title Requirement:
   - "adobeStockTitle": A commercial, SEO-optimized title in English describing the vector asset.
   - Character count MUST be between 70 to 120 characters (STRICT MAXIMUM 120 characters).
   - Must include the main subject, 2D vector style, and "isolated on white background".
7. Adobe Stock Keywords Requirement:
   - "keywords": An array of 25 to 45 high-relevance microstock search tags in English.
   - Each keyword must be MAXIMUM 2 words (e.g. "vector art", "fox mascot", "flat design", "emblem", "isolated", "white background", "logo icon").
   - No punctuation, no duplicate tags.`
    : ``;

  const jsonKeysInstruction = includeMeta
    ? `Respond strictly in JSON format with keys:
- title: (short 3-5 word summary)
- adobeStockTitle: (commercial English SEO title, 70-120 characters max)
- keywords: (array of 25-45 stock keywords in English, max 2 words per tag)
- optimizedPrompt: (concise 30-50 words vector prompt in English focusing on detailed single object)
- negativePrompt: (concise negative keywords including anti-photo, anti-3d, anti-landscape, anti-scenic background)
- vectorStyle: (must be "${presetInfo.name} - ${variationAngle}")
- colorPalette: (e.g., "${isLineArt ? 'Zero Color Fill / Black Monoline' : isMonochrome ? 'Pure Black & White Ink' : 'Flat Solid Colors'}")`
    : `Respond strictly in JSON format with keys:
- title: (short 3-5 word summary)
- optimizedPrompt: (concise 30-50 words vector prompt in English focusing on detailed single object)
- negativePrompt: (concise negative keywords including anti-photo, anti-3d, anti-landscape, anti-scenic background)
- vectorStyle: (must be "${presetInfo.name} - ${variationAngle}")
- colorPalette: (e.g., "${isLineArt ? 'Zero Color Fill / Black Monoline' : isMonochrome ? 'Pure Black & White Ink' : 'Flat Solid Colors'}")`;

  const systemPrompt = `You are an expert prompt engineer specializing in 2D vector graphic assets, icons, and sticker art optimized for SVG autotracing and image generation.
Convert the user's raw idea into a concise 2D visual prompt (strictly 30-50 words).

CRITICAL STRICT RULES:
1. STRICT STYLE CONSISTENCY: The user has selected the style preset: "${presetInfo.name}".
   - You MUST STAY 100% FAITHFUL to "${presetInfo.name}".
   - DO NOT introduce, mix, or cross over into other art categories.
   - The variation angle ("${variationAngle}") represents composition, perspective, camera angle, or pose WITHIN the "${presetInfo.name}" style.
2. STRICT FOCAL HERO OBJECT & DETAIL CONTAINMENT (ANTI-SPRAWL FOR 2D VECTOR):
   - Focus strictly and tightly on ONE primary hero subject/object/character/emblem with rich, crisp physical details (e.g., sharp geometric contours, distinct anatomy/accessory details, clean mechanical segments).
   - ABSOLUTELY NO panoramic backgrounds, no landscapes, no horizon lines, no environmental scenery (no forests, no rooms, no cities, no mountains), and no multi-character crowds.
   - The subject must remain 100% isolated on pure solid white background, perfectly framed and ready for seamless 2D vectorization and SVG autotracing.
3. Token Efficiency: Zero filler words (no "masterpiece", "trending", "ultra high quality"). Direct, high-density visual descriptors only.
4. 2D Vector Look: Sharp vector contours, bold solid lines, ${isLineArt ? 'zero color fill, uncolored coloring-book white interior, pure black outlines only' : isMonochrome ? 'pure black silhouettes, zero color' : 'clean solid color fills'}, isolated on pure white background.
5. Color Mode: ${isLineArt ? 'STRICT ZERO COLOR FILL: Enforce pure black ink line art on solid white background with ZERO color fills (NEVER write "green fill", "solid color fill", or any color names), zero grayscale, zero shadows, zero gradients.' : isMonochrome ? 'Pure black ink / silhouette on solid white, zero color, zero grayscale, zero shadows.' : 'Flat solid colors with no gradients and no realistic shading.'}
${presetKey === 'premium-line-art' ? `6. PREMIUM LINE ART ICON MANDATE:
   - Embody an Award-Winning Vector Line Artist & Minimal Icon Designer.
   - UNIFORM MONOLINE: Clean single-weight outline, smooth curves, intentional angles, zero sketch wobble, zero texture, zero brush effects, zero cross-hatching/shading.
   - 85-90% SIMPLIFICATION: Keep only the main silhouette and essential recognizable structure. Remove tiny textures, wood grain, brick textures, foliage detail, people, vehicles, and background clutter.
   - COMPOSITION: Center the subject occupying ~25-30% of canvas with ~70-75% clean negative white space.
   - ZERO FILL / NO COLOR: STRICTLY NO COLOR FILLS. NEVER output words like 'green fill', 'solid color fill', 'vibrant fill', or any color names. The artwork is an uncolored coloring-book outline with pure black ink lines on 100% pure white space.
   - Microstock SVG ready for coloring books, educational worksheets, laser cut / Cricut, stickers, and Adobe Stock.` : ''}
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

  const colorModeInstruction = isLineArt
    ? 'Color Mode: STRICT UNCOLORED LINE ART ONLY (Zero color fill, zero green/blue/red/yellow fills, uncolored coloring-book interior, pure black monoline outlines on pure white background, coloring-book printable ready).'
    : isMonochrome
    ? 'Color Mode: PURE BLACK AND WHITE MONOCHROME (Pure black ink/silhouette on solid white, zero color, zero grayscale).'
    : 'Color Mode: VIBRANT FLAT SOLID COLORS (Clean solid color fills, zero gradients, zero shadows).';

  const userContent = `Raw idea: "${params.rawIdea}".
Selected Style Preset: "${presetInfo.name}" (Style guideline: ${presetInfo.promptSnippet}).
Variation Angle: "${variationAngle}"${variationIndexStr}.
Target Engine: ${params.targetEngine || 'gpt-image'}. Aspect Ratio: ${params.aspectRatio || '1:1'}.
${colorModeInstruction}
Requirement: Generate a 30-50 words 2D prompt strictly adhering to "${presetInfo.name}" with the "${variationAngle}" angle, focusing strictly on the detailed isolated hero object, isolated on pure white background${includeMeta ? ', plus Adobe Stock SEO Title (70-120 chars) and 25-45 stock keywords' : ''}.`;

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
      negativePrompt: isLineArt
        ? 'color, colors, colorful, green fill, red fill, blue fill, yellow fill, solid color fill, color fills, vibrant fills, grayscale, gray tones, shading, realistic shadows, gradients, realistic texture, 3d, photorealistic, noise, blur, photographic render, pencil, sketch, watercolor, paint, cross hatching, stippling, scenic background, landscape, environment sprawl'
        : isMonochrome
        ? 'color, grayscale, shading, 3d, photo, scenic background, landscape, environment sprawl'
        : 'photorealistic, 3d, realistic shadows, gradients, noise, scenic background, landscape, nature panorama, environment sprawl, multi-character clutter, complex background scenery, horizon lines',
      vectorStyle: `${presetInfo.name} - ${variationAngle}`,
      colorPalette: isLineArt ? 'Zero Color Fill / Black Monoline' : isMonochrome ? 'Pure Black & White' : 'Flat Solid Colors',
    };
  }

  // Sanitize optimizedPrompt for line art styles to guarantee zero color fill
  let sanitizedPrompt = String(parsed.optimizedPrompt || params.rawIdea).trim();
  if (isLineArt) {
    sanitizedPrompt = sanitizedPrompt
      .replace(/vibrant flat solid [a-z]+ fill/gi, 'zero color fill, uncolored white interior')
      .replace(/flat solid [a-z]+ fill/gi, 'zero color fill, uncolored white interior')
      .replace(/solid [a-z]+ fill/gi, 'zero color fill')
      .replace(/\b[a-z]+ color fill\b/gi, 'zero color fill')
      .replace(/vibrant flat solid colors/gi, 'zero color fill, pure black monoline')
      .replace(/vibrant flat colors/gi, 'pure black monoline')
      .replace(/vibrant color fills/gi, 'zero color fill')
      .replace(/solid color fills/gi, 'zero color fill')
      .replace(/solid fills/gi, 'clean uncolored outlines')
      .replace(/\b(green|red|blue|yellow|orange|purple|pink)\s+fill\b/gi, 'zero color fill');
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
    cleanKeywords = [
      ...params.rawIdea.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2),
      'vector art', 'flat design', 'illustration', 'graphic', 'isolated', 'white background',
      'stock asset', 'icon', 'clipart', '2d vector', 'commercial asset', 'vector illustration',
      'digital art', 'creative', 'modern design', 'symbol', 'element', 'sticker', 'badge'
    ].slice(0, 48);
  }

  const promptTokens = result.usage?.prompt_tokens ?? 0;
  const completionTokens = result.usage?.completion_tokens ?? 0;
  const totalTokens = result.usage?.total_tokens ?? (promptTokens + completionTokens);

  const inputRate = parseFloat(process.env.PROMPT_INPUT_PER_TOKEN_USD || '0.00000014');
  const outputRate = parseFloat(process.env.PROMPT_OUTPUT_PER_TOKEN_USD || '0.00000056');
  const usdToIdr = parseFloat(process.env.USD_TO_IDR_RATE || '16000');

  const costUsd = (promptTokens * inputRate) + (completionTokens * outputRate);
  const costIdr = costUsd * usdToIdr;

  const defaultNegativePrompt = isLineArt
    ? 'color, colors, colorful, green fill, red fill, blue fill, yellow fill, solid color fill, color fills, vibrant fills, grayscale, gray tones, shading, realistic shadows, gradients, realistic texture, 3d, photorealistic, noise, blur, photographic render, pencil, sketch, watercolor, paint, cross hatching, stippling, scenic background, landscape, environment sprawl'
    : isMonochrome
    ? 'color, colors, colorful, grayscale, gray tones, shading, soft shadows, gradients, realistic texture, 3d, photorealistic, noise, blur, photographic render, landscape, scenic background'
    : 'photorealistic, 3d render, realistic shadows, photography, depth of field blur, noise, grain, complex messy background, realistic skin pores, lens flare, micro-gradients, landscape, scenic background, environment sprawl';

  return {
    title: parsed.title || params.rawIdea.slice(0, 30),
    adobeStockTitle: includeMeta ? cleanAdobeStockTitle : undefined,
    keywords: includeMeta ? cleanKeywords : undefined,
    optimizedPrompt: sanitizedPrompt,
    negativePrompt: parsed.negativePrompt || defaultNegativePrompt,
    vectorStyle: parsed.vectorStyle || `${presetInfo.name} - ${variationAngle}`,
    colorPalette: parsed.colorPalette || (isLineArt ? 'Zero Color Fill / Black Monoline' : isMonochrome ? 'Pure Black & White' : 'Flat Solid Colors'),
    usage: {
      promptTokens,
      completionTokens,
      totalTokens,
      promptCostUsd: costUsd.toFixed(6),
      promptCostIdr: `Rp ${costIdr.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  };
}

export interface SeoMetadataParams {
  rawIdea: string;
  optimizedPrompt: string;
  vectorStyle?: string;
  stylePreset?: string;
  isBlackAndWhite?: boolean;
}

export interface SeoMetadataResult {
  adobeStockTitle: string;
  keywords: string[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    promptCostUsd: string;
    promptCostIdr: string;
  };
}

export async function generateCardSeoMetadata(
  params: SeoMetadataParams,
  model: string = process.env.OPENROUTER_PROMPT_MODEL || 'deepseek/deepseek-chat'
): Promise<SeoMetadataResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY belum disetel di file environment (.env)');
  }

  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const promptEndpoint = process.env.OPENROUTER_PROMPT_ENDPOINT || `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const systemPrompt = `You are a microstock SEO and metadata expert for commercial vector assets (Adobe Stock, Shutterstock, Freepik, Vecteezy).
Your task is to generate top-ranking English metadata for a 2D vector asset based on the provided concept and visual prompt.

CRITICAL REQUIREMENTS:
1. "adobeStockTitle":
   - A commercial, SEO-optimized title in English describing the vector asset.
   - Character count MUST be between 70 to 120 characters (STRICT MAXIMUM 120 characters).
   - Must include the core subject, style, and end with "isolated on white background".
2. "keywords":
   - An array of EXACTLY 30 to 48 high-relevance microstock search tags in English.
   - Each keyword must be MAXIMUM 2 words (e.g. "vector art", "fox mascot", "flat design", "emblem", "isolated", "white background", "logo icon").
   - No punctuation, no duplicate tags.

Respond strictly in JSON format:
{
  "adobeStockTitle": "Descriptive English title between 70 and 120 characters isolated on white background",
  "keywords": [
    "tag1",
    "tag2",
    "tag3"
  ]
}`;

  const userContent = `Subject / Raw Idea: "${params.rawIdea}".
Visual Prompt: "${params.optimizedPrompt}".
Art Style: "${params.vectorStyle || params.stylePreset || '2D Vector'}".
Black & White Mode: ${params.isBlackAndWhite ? 'Yes (Monochrome Ink)' : 'No (Flat Colors)'}.
Requirement: Generate commercial Adobe Stock SEO Title (70-120 chars) and 30-48 English tags in JSON.`;

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
    throw new Error(`SEO Metadata Generation Error [${response.status}]: ${errorBody}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  let parsed: any = {};
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    parsed = {};
  }

  let cleanAdobeStockTitle = parsed.adobeStockTitle || `${params.rawIdea} 2D vector graphic asset icon, isolated on white background`;
  if (cleanAdobeStockTitle.length > 120) {
    cleanAdobeStockTitle = cleanAdobeStockTitle.slice(0, 117) + '...';
  }

  let cleanKeywords: string[] = [];
  if (Array.isArray(parsed.keywords)) {
    cleanKeywords = parsed.keywords
      .map((k: any) => String(k).trim().toLowerCase())
      .filter((k: string) => k.length > 0 && k.split(/\s+/).length <= 2)
      .slice(0, 48);
  }

  // If parsed keywords is less than 25, enrich with contextual tags
  if (cleanKeywords.length < 25) {
    const fallbackBase = [
      ...params.rawIdea.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      'vector', 'illustration', 'graphic', 'design', 'flat design', 'isolated',
      'white background', 'icon', 'clipart', '2d vector', 'stock asset', 'commercial use',
      'sticker', 'badge', 'emblem', 'silhouette', 'logo', 'symbol', 'element',
      'sign', 'modern', 'digital art', 'creative', 'visual', 'art', 'isolated background'
    ];
    for (const tag of fallbackBase) {
      if (!cleanKeywords.includes(tag) && cleanKeywords.length < 48) {
        cleanKeywords.push(tag);
      }
    }
  }

  const promptTokens = result.usage?.prompt_tokens ?? 80;
  const completionTokens = result.usage?.completion_tokens ?? 120;
  const totalTokens = result.usage?.total_tokens ?? (promptTokens + completionTokens);

  const inputRate = parseFloat(process.env.PROMPT_INPUT_PER_TOKEN_USD || '0.00000014');
  const outputRate = parseFloat(process.env.PROMPT_OUTPUT_PER_TOKEN_USD || '0.00000056');
  const usdToIdr = parseFloat(process.env.USD_TO_IDR_RATE || '16000');

  const costUsd = (promptTokens * inputRate) + (completionTokens * outputRate);
  const costIdr = costUsd * usdToIdr;

  return {
    adobeStockTitle: cleanAdobeStockTitle,
    keywords: cleanKeywords,
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
    // Fallback if no API key is set (5 concrete natural subject concepts)
    const kw = rawKeyword || 'kopi';
    const fallbackConcepts = [
      `${kw} hangat cangkir keramik`,
      `${kw} dingin gelas kaca`,
      `${kw} kemasan botol modern`,
      `${kw} aromatik biji sangrai`,
      `${kw} racikan barista klasik`,
    ];
    return {
      concepts: fallbackConcepts,
      usage: {
        promptTokens: 75,
        completionTokens: 45,
        totalTokens: 120,
        promptCostUsd: '0.000035',
        promptCostIdr: 'Rp 0,56',
      },
    };
  }

  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const promptEndpoint = process.env.OPENROUTER_PROMPT_ENDPOINT || `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const systemPrompt = `You are a creative commercial concept generator for 2D visual design assets, mascots, and icons.
The user provides 1 or 2 root words (e.g. "kopi", "kopi susu", "rubah", "rubah mekanik", "kucing", "mobil"). If the input is empty or vague, pick a popular imaginative subject.
Your task is to expand it into EXACTLY 5 distinct, imaginative, and concrete subject/character/object concepts.

CRITICAL STRICT RULES:
1. STRICT SINGLE OBJECT/CHARACTER DETAIL FOCUS: Focus strictly on a single concrete physical subject, character item, animal trait, mechanical part, or accessory with specific physical detail (e.g., "gelas es kopi susu", "cangkir keramik uap kopi", "rubah mekanik helm baja", "kucing astronot visor kaca", "mobil balap velg retro", "biji kopi sangrai emas").
2. ABSOLUTELY NO SCENIC/ENVIRONMENT SPRAWL: Do NOT include backgrounds, rooms, landscapes, scenes, or broad environments (NEVER output concepts like "di dalam hutan", "alam luas", "pemandangan kafe", "kota malam", "ruang angkasa luas"). The concept must be a standalone physical object or isolated character asset.
3. DO NOT INCLUDE STYLE LABELS: Do NOT add graphic style descriptors like "flat vector", "monoline", "stencil", "die-cut", "black and white", or "clipart", so that the user can freely choose any art style later without keyword collision.
4. STRICT WORD COUNT: Each of the 5 concepts MUST be STRICTLY 3 to 4 descriptive words.
5. NATURAL LANGUAGE: Output in the same natural language as the user input (Indonesian if input is Indonesian, English if input is English).

Respond strictly in JSON format:
{
  "concepts": [
    "concept 1 (strictly 3-4 words)",
    "concept 2 (strictly 3-4 words)",
    "concept 3 (strictly 3-4 words)",
    "concept 4 (strictly 3-4 words)",
    "concept 5 (strictly 3-4 words)"
  ]
}`;

  const userContent = rawKeyword
    ? `Root keyword: "${rawKeyword}". Generate 5 creative, concrete 3-4 word subject concepts focused on object details in the same language.`
    : `Generate 5 popular creative, concrete 3-4 word subject concepts focused on object details in Indonesian.`;

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
        `${rawKeyword || 'kopi'} aromatik biji sangrai`,
        `${rawKeyword || 'kopi'} racikan barista klasik`,
      ],
    };
  }

  let cleanConcepts: string[] = [];
  if (Array.isArray(parsed.concepts)) {
    cleanConcepts = parsed.concepts
      .map((c: any) => String(c).trim())
      .filter((c: string) => c.length > 0)
      .slice(0, 5);
  }

  if (cleanConcepts.length === 0) {
    cleanConcepts = [
      `${rawKeyword || 'kopi'} hangat cangkir keramik`,
      `${rawKeyword || 'kopi'} dingin gelas kaca`,
      `${rawKeyword || 'kopi'} kemasan botol modern`,
      `${rawKeyword || 'kopi'} aromatik biji sangrai`,
      `${rawKeyword || 'kopi'} racikan barista klasik`,
    ];
  }

  const promptTokens = result.usage?.prompt_tokens ?? 70;
  const completionTokens = result.usage?.completion_tokens ?? 45;
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
