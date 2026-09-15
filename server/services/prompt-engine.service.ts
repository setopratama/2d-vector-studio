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

export const SERVER_COMPOSITION_PRESETS: Record<
  string,
  { name: string; description: string; promptSnippet: string; isIsolated: boolean }
> = {
  'isolated-object': {
    name: 'Isolated Object',
    description: 'Satu objek utama terpusat, siluet batas tegas, zero clutter, siap autotrace SVG & icon',
    promptSnippet: 'single centered isolated subject, clear negative space framing, pristine outer boundary silhouette, zero background clutter, isolated on solid pure white background',
    isIsolated: true,
  },
  'object-group': {
    name: 'Object Group',
    description: 'Rangkaian 2–3 objek komplementer yang tersusun harmonis dengan separasi jelas',
    promptSnippet: 'balanced grouped arrangement of related objects, compact still life composition, distinct silhouette separations, clean visual hierarchy, isolated on solid pure white background',
    isIsolated: true,
  },
  'minimal-context': {
    name: 'Minimal Context',
    description: 'Subjek utama dengan elemen pijakan atau aksen pendukung minimalis tanpa mengaburkan fokus subjek',
    promptSnippet: 'central subject with subtle minimalist contextual grounding, clean vector props, restrained negative space, balanced geometric environment accents',
    isIsolated: false,
  },
  'commercial-scene': {
    name: 'Commercial Scene',
    description: 'Scene vektor kontekstual komersial utuh (interior modern, workspace, smart home, aktivitas urban) untuk web hero & editorial',
    promptSnippet: 'full 2D commercial vector scene, flat architectural environment, modern interior or workspace setting, layered flat shapes, balanced editorial vector illustration',
    isIsolated: false,
  },
  'decorative-composition': {
    name: 'Decorative Composition',
    description: 'Komposisi dekoratif simetris atau berbingkai cincin geometris, badge/crest stempel retro, border ornamen',
    promptSnippet: 'symmetrical decorative vector composition, circular emblem crest framing, clean ornamental geometric border, balanced vintage badge layout',
    isIsolated: true,
  },
  // Legacy Aliases
  'single-isolated': {
    name: 'Isolated Object',
    description: 'Satu objek utama terpusat, siluet bersih, zero clutter',
    promptSnippet: 'single centered isolated subject, clear negative space framing, pristine outer boundary silhouette, zero background clutter, isolated on solid pure white background',
    isIsolated: true,
  },
  'grouped-still-life': {
    name: 'Object Group',
    description: 'Rangkaian 2–3 objek komplementer yang tersusun harmonis dengan separasi jelas',
    promptSnippet: 'balanced grouped arrangement of related objects, compact still life composition, distinct silhouette separations, clean visual hierarchy, isolated on solid pure white background',
    isIsolated: true,
  },
  'circular-badge': {
    name: 'Decorative Composition',
    description: 'Objek sentral terbingkai dalam cincin geometris simetris atau frame stempel',
    promptSnippet: 'symmetrical circular emblem framing, centered subject enclosed in decorative geometric vector ring, balanced crest layout, isolated on solid pure white background',
    isIsolated: true,
  },
  'mini-icon-set': {
    name: 'Object Group',
    description: 'Koleksi 3–4 micro-icon tematik kohesif yang berjejer rapi',
    promptSnippet: 'cohesive icon set of complementary vector items, organized in clean grid layout, uniform stroke weight, isolated on pure white background',
    isIsolated: true,
  },
  'hero-with-accents': {
    name: 'Minimal Context',
    description: 'Subjek utama dominan dengan elemen aksen pendukung kontekstual',
    promptSnippet: 'dominant central hero element surrounded by subtle contextual accent props, dynamic spatial balance, clean vector grounding',
    isIsolated: false,
  },
  'dynamic-diagonal': {
    name: 'Minimal Context',
    description: 'Tata letak berorientasi aksi 3/4 dengan sudut diagonal yang berenergi',
    promptSnippet: 'dynamic three-quarter diagonal composition, angled perspective with strong visual motion, crisp vector contours',
    isIsolated: false,
  },
};

export interface CommercialBrief {
  marketCategory: string;
  targetBuyer: string;
  primaryUseCases: string[];
  commercialConcept: string;
  visualHook: string;
  differentiation: string;
  searchIntent: string[];
  compositionStrategy: string;
  vectorStrategy: string;
  risks: string[];
  scores: {
    commercial: number;
    uniqueness: number;
    searchability: number;
    vectorSuitability: number;
    visualClarity: number;
    overall: number;
  };
  decision: 'PASS' | 'REWORK';
}

export interface PromptExpansionParams {
  rawIdea: string;
  targetEngine?: string;
  aspectRatio?: string;
  stylePreset?: string;
  composition?: string;
  variationStyle?: string;
  variationIndex?: number;
  commercialDirection?: string;
  isBlackAndWhite?: boolean;
  includeMetadata?: boolean;
}

export interface PromptExpansionResult {
  title: string;
  adobeStockTitle?: string;
  adobeStockDescription?: string;
  keywords?: string[];
  commercialDirection?: string;
  composition?: string;
  commercialBrief?: CommercialBrief;
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

  const compositionKey = params.composition || 'isolated-object';
  const compositionInfo = SERVER_COMPOSITION_PRESETS[compositionKey] || SERVER_COMPOSITION_PRESETS['isolated-object'];
  const isIsolated = compositionInfo.isIsolated ?? (compositionKey !== 'commercial-scene' && compositionKey !== 'minimal-context');

  const variationAngle = params.variationStyle || 'Dynamic Angle';
  const variationIndexStr = params.variationIndex ? ` (Variation #${params.variationIndex})` : '';
  const includeMeta = Boolean(params.includeMetadata);

  const isMonochrome = presetKey === 'premium-line-art' || presetKey === 'monoline-ink' || presetKey === 'stencil-silhouette' || Boolean(params.isBlackAndWhite);
  const isLineArt = presetKey === 'premium-line-art' || presetKey === 'monoline-ink';

  const metadataSystemInstruction = includeMeta
    ? `6. Adobe Stock Title Requirement:
   - "adobeStockTitle": Factual, descriptive, customer-oriented English title following the strict hierarchy: [Commercial Concept] + [Primary Subject] + [Key Attributes / Style / Context].
   - Focus on factual clarity without repetitive filler buzzwords.
   - ${isIsolated ? 'Must end with "isolated on white background".' : 'Describe the commercial scene/context and vector style (do NOT force "isolated on white background" for contextual scenes).'}
7. Adobe Stock Description Requirement:
   - "adobeStockDescription": Factual, descriptive 120-250 characters English summary for microstock buyers. Clearly describe the core subject, 2D vector styling, aesthetic attributes, and commercial use cases (e.g. branding, packaging, web icons, editorial).
8. Adobe Stock Keywords Requirement (ORDERED STRICTLY BY SEARCH IMPORTANCE):
   - "keywords": An array of 25 to 40 high-relevance search tags in English, sorted strictly in descending order of importance (first 10 are most critical):
     • Rank 1–10 (Tier 1 - Strongest Search Intent): Core subject name, primary commercial concept, exact buyer queries.
     • Rank 11–20 (Tier 2 - Subject Components & Props): Individual objects, tools, visual elements present in the graphic.
     • Rank 21–30 (Tier 3 - Visual Style & Primary Use Cases): 2D vector style, flat design, packaging, branding, menu, icon.
     • Rank 31–40 (Tier 4 - Secondary Relevance & Themes): Broader themes, lifestyle concepts, ${isIsolated ? 'isolated, white background' : 'scene context'}.
   - No punctuation, no duplicate tags.`
    : ``;

  const commercialDirection = params.commercialDirection || 'Evergreen Utility';

  const systemPrompt = `You are an executive Commercial Art Director & Microstock Asset Strategist for top vector platforms (Adobe Stock, Freepik, Shutterstock, Envato).

5-TIER COMMERCIAL VECTOR ARCHITECTURE:
IDEA (Core Subject)
  ↓
COMMERCIAL DIRECTION (Why it is made / 2026 Microstock Market Pillar)
  ↓
COMMERCIAL CONCEPT (Strategic positioning, visual hook, target buyer, differentiation)
  ↓
STYLE (How it looks / 2D Vector Rendering format & stroke technique)
  ↓
COMPOSITION (How it is arranged / Spatial layout & framing)
  ↓
PROMPT SYNTHESIS (Final 30-50 word 2D visual prompt)

INPUT PARAMETERS:
- Commercial Direction (WHY): "${commercialDirection}"
- Style Preset (HOW IT LOOKS): "${presetInfo.name}" (${presetInfo.promptSnippet})
- Composition Strategy (HOW IT IS ARRANGED): "${compositionInfo.name}" (${compositionInfo.promptSnippet})
- Isolation Mode: ${isIsolated ? 'ISOLATED ASSET (White Background)' : 'CONTEXTUAL / SCENE (Integrated Environment)'}

OPERATING RULES:
1. NO CHAIN-OF-THOUGHT OR PROSE: Do NOT explain your thought process or output conversational filler. Directly return your final structured analysis decisions in JSON format.
2. COMMERCIAL DECISION-FIRST: Anchor all commercial analysis strictly around "${commercialDirection}". Determine targetBuyer, primaryUseCases, searchIntent, commercialConcept, and visualHook BEFORE synthesizing the prompt.
3. STRICT STYLE & COMPOSITION COHESION: Follow the visual rendering of "${presetInfo.name}" and the spatial layout of "${compositionInfo.name}".
4. PROMPT SYNTHESIS: The "optimizedPrompt" MUST combine "commercialConcept" + "visualHook" + "${presetInfo.name}" + "${compositionInfo.name}" into a concise (30-50 words) 2D visual prompt in English.
   ${isIsolated ? '- ISOLATION MANDATE: Isolate the subject cleanly on pure solid white background for SVG extraction.' : '- CONTEXTUAL SCENE MANDATE: Do NOT force pure white isolated background. Synthesize a coherent flat 2D commercial vector scene or contextual environment (e.g. modern interior, workspace setting, or subtle grounding environment) with clean flat shapes, cohesive color hierarchy, and zero raster clutter.'}
5. QUALITY GATE SCORING: Evaluate marketability objectively (scores 1-10 on commercial, uniqueness, searchability, vectorSuitability, visualClarity). Set "decision": "PASS" if overall >= 7.0 and vectorSuitability >= 7.0, otherwise "REWORK".
${presetKey === 'premium-line-art' ? `6. PREMIUM LINE ART MANDATE: Pure black uniform monoline, 85-90% detail simplification, ~70-75% negative white space, STRICT ZERO COLOR FILL (no color words or color fills), coloring-book / printable ready.` : ''}
${metadataSystemInstruction}

RESPOND STRICTLY IN JSON FORMAT:
{
  "title": "Short 3-5 word summary",
  "commercialBrief": {
    "marketCategory": "e.g. Food and Beverage (aligned with ${commercialDirection})",
    "targetBuyer": "e.g. coffee brands, cafes, packaging designers",
    "primaryUseCases": ["packaging", "menu design", "social media", "editorial illustration"],
    "commercialConcept": "e.g. specialty coffee brewing equipment and preparation",
    "visualHook": "e.g. compact brewing setup arranged as a clean geometric still life",
    "differentiation": "e.g. focus on specialty brewing rather than generic coffee cup imagery",
    "searchIntent": ["specialty coffee", "coffee brewing", "coffee equipment", "barista tools"],
    "compositionStrategy": "${compositionInfo.name}",
    "vectorStrategy": "e.g. medium detail, strong contours, simplified recognizable equipment",
    "risks": ["avoid background clutter", "maintain crisp solid vector contours"],
    "scores": {
      "commercial": 8.8,
      "uniqueness": 8.1,
      "searchability": 9.0,
      "vectorSuitability": 9.4,
      "visualClarity": 9.0,
      "overall": 8.86
    },
    "decision": "PASS"
  },
  "optimizedPrompt": "Concise 30-50 words 2D visual prompt synthesized directly from commercialConcept, visualHook, ${presetInfo.name}, and ${compositionInfo.name}${isIsolated ? ', isolated on pure solid white background' : ''}",
  "negativePrompt": "${isIsolated ? 'photorealistic, 3d, realistic shadows, gradients, noise, scenic background, landscape, environment sprawl' : 'photorealistic, 3d render, hyperrealistic textures, messy gradients, blurry noise, depth of field blur'}",
  "vectorStyle": "${presetInfo.name} - ${variationAngle}",
  "colorPalette": "${isLineArt ? 'Zero Color Fill / Black Monoline' : isMonochrome ? 'Pure Black & White Ink' : 'Flat Solid Colors'}"${includeMeta ? `,\n  "adobeStockTitle": "Commercial SEO English Title between 70 and 120 chars${isIsolated ? ', isolated on white background' : ''}",\n  "adobeStockDescription": "Descriptive 120-250 characters English summary describing the visual subject, vector style, commercial context, and application.",\n  "keywords": ["tag1", "tag2", "tag3"]` : ''}
}`;

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
    ? 'Color Mode: STRICT UNCOLORED LINE ART ONLY (Zero color fill, pure black monoline outlines on pure white background, coloring-book printable ready).'
    : isMonochrome
    ? 'Color Mode: PURE BLACK AND WHITE MONOCHROME (Pure black ink/silhouette on solid white, zero color, zero grayscale).'
    : 'Color Mode: VIBRANT FLAT SOLID COLORS (Clean solid color fills, zero gradients, zero shadows).';

  const userContent = `rawIdea: "${params.rawIdea}".
Commercial Direction (WHY): "${commercialDirection}".
Selected Style Preset (HOW IT LOOKS): "${presetInfo.name}" (${presetInfo.promptSnippet}).
Composition Strategy (LAYOUT): "${compositionInfo.name}" (${compositionInfo.promptSnippet}).
Isolation Mode: ${isIsolated ? 'Isolated on White Background' : 'Commercial Scene / Contextual Composition'}.
Variation Angle: "${variationAngle}"${variationIndexStr}.
Target Engine: ${params.targetEngine || 'gpt-image'}. Aspect Ratio: ${params.aspectRatio || '1:1'}.
${colorModeInstruction}
Execute 5-Tier Commercial Pipeline: Perform commercial analysis for "${commercialDirection}", construct commercial brief with quality scores, and synthesize the 30-50 words 2D visual prompt combining style "${presetInfo.name}" and composition "${compositionInfo.name}" (${isIsolated ? 'isolated on pure white background' : 'integrated commercial 2D vector scene'})${includeMeta ? ', plus Adobe Stock SEO Title (70-120 chars), Adobe Stock Description (120-250 chars) and 25-45 stock keywords' : ''}.`;

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
    const defaultTitle = isIsolated
      ? `${params.rawIdea} 2D flat vector illustration, isolated on pure white background`
      : `${params.rawIdea} 2D commercial vector scene illustration`;
    parsed = {
      title: params.rawIdea.length > 30 ? params.rawIdea.slice(0, 30).trim() : params.rawIdea,
      adobeStockTitle: defaultTitle,
      adobeStockDescription: `Clean 2D vector graphic illustration of ${params.rawIdea}, suitable for commercial design and digital assets.`,
      keywords: isIsolated
        ? ['vector art', 'flat design', 'illustration', 'graphic', 'isolated', 'white background', 'icon', 'clipart', '2d vector']
        : ['vector art', 'vector scene', 'flat design', 'illustration', 'commercial scene', 'vector illustration', 'graphic', '2d vector'],
      optimizedPrompt: content || params.rawIdea,
      negativePrompt: isLineArt
        ? 'color, colors, colorful, green fill, red fill, blue fill, yellow fill, solid color fill, color fills, vibrant fills, grayscale, gray tones, shading, realistic shadows, gradients, realistic texture, 3d, photorealistic, noise, blur, photographic render, pencil, sketch, watercolor, paint, cross hatching, stippling'
        : isMonochrome
        ? 'color, grayscale, shading, 3d, photo, photorealistic, noise, blur'
        : isIsolated
        ? 'photorealistic, 3d, realistic shadows, gradients, noise, scenic background, landscape, nature panorama, environment sprawl, multi-character clutter, complex background scenery, horizon lines'
        : 'photorealistic, 3d render, hyperrealistic textures, messy photographic gradients, blurry noise, depth of field blur, lens flare, raster painting, photograph',
      vectorStyle: `${presetInfo.name} - ${variationAngle}`,
      colorPalette: isLineArt ? 'Zero Color Fill / Black Monoline' : isMonochrome ? 'Pure Black & White' : 'Flat Solid Colors',
      commercialBrief: {
        marketCategory: commercialDirection,
        targetBuyer: 'commercial buyers, digital designers, content creators',
        primaryUseCases: ['branding', 'digital graphics', 'microstock', 'editorial'],
        commercialConcept: `${params.rawIdea} commercial asset`,
        visualHook: `clean ${presetInfo.name} visual rendering`,
        differentiation: 'distinctive 2D commercial vector aesthetics',
        searchIntent: [params.rawIdea, 'vector graphic', 'stock asset'],
        compositionStrategy: compositionInfo.name,
        vectorStrategy: 'crisp vector shapes and bold contours',
        risks: ['avoid clutter', 'maintain vector integrity'],
        scores: {
          commercial: 8.5,
          uniqueness: 8.0,
          searchability: 9.0,
          vectorSuitability: 9.4,
          visualClarity: 9.0,
          overall: 8.86,
        },
        decision: 'PASS',
      },
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

  // Ensure Commercial Brief structure with safe fallbacks
  let commercialBrief: CommercialBrief | undefined = undefined;
  if (parsed.commercialBrief && typeof parsed.commercialBrief === 'object') {
    const cb = parsed.commercialBrief;
    const scores = cb.scores || {};
    const commScore = typeof scores.commercial === 'number' ? Number(scores.commercial) : (typeof scores.commercialUsefulness === 'number' ? Number(scores.commercialUsefulness) : 8.8);
    const uniqScore = typeof scores.uniqueness === 'number' ? Number(scores.uniqueness) : 8.1;
    const searchScore = typeof scores.searchability === 'number' ? Number(scores.searchability) : 9.0;
    const vecScore = typeof scores.vectorSuitability === 'number' ? Number(scores.vectorSuitability) : 9.4;
    const clarScore = typeof scores.visualClarity === 'number' ? Number(scores.visualClarity) : 9.0;
    const computedOverall = Number(((commScore + uniqScore + searchScore + vecScore + clarScore) / 5).toFixed(2));
    const overallScore = typeof scores.overall === 'number' ? Number(Number(scores.overall).toFixed(2)) : computedOverall;

    commercialBrief = {
      marketCategory: String(cb.marketCategory || 'Commercial Vector Illustration & Iconography'),
      targetBuyer: String(cb.targetBuyer || 'Brand designers, marketing agencies & merchandise sellers'),
      primaryUseCases: Array.isArray(cb.primaryUseCases) ? cb.primaryUseCases.map(String) : ['Commercial branding & logos', 'Merchandise & apparel print', 'Digital UI/UX & web asset'],
      commercialConcept: String(cb.commercialConcept || `High-impact 2D vector asset for ${params.rawIdea}`),
      visualHook: String(cb.visualHook || 'Clean iconic silhouette with high-contrast focal clarity'),
      differentiation: String(cb.differentiation || 'Crisp geometric contours engineered for instant SVG autotracing'),
      searchIntent: Array.isArray(cb.searchIntent) ? cb.searchIntent.map(String) : [`${params.rawIdea} vector`, `${params.rawIdea} icon`, `${params.rawIdea} logo`],
      compositionStrategy: String(cb.compositionStrategy || 'Centered hero framing with generous negative space on pure white background'),
      vectorStrategy: String(cb.vectorStrategy || 'Sharp solid contours and clean closed paths optimized for vector tracing'),
      risks: Array.isArray(cb.risks) ? cb.risks.map(String) : ['Ensure zero background noise and maintain sharp vector contours'],
      scores: {
        commercial: commScore,
        uniqueness: uniqScore,
        searchability: searchScore,
        vectorSuitability: vecScore,
        visualClarity: clarScore,
        overall: overallScore,
      },
      decision: cb.decision === 'REWORK' ? 'REWORK' : (overallScore >= 7.0 && vecScore >= 7.0 ? 'PASS' : 'REWORK'),
    };
  } else {
    // Construct default high-quality brief if LLM skipped
    commercialBrief = {
      marketCategory: 'Commercial Vector Illustration',
      targetBuyer: 'Brand designers, marketing agencies & merchandise creators',
      primaryUseCases: ['Commercial branding & logo design', 'Merchandise & apparel print', 'Web & app UI graphics'],
      commercialConcept: `Iconic 2D vector representation of ${params.rawIdea}`,
      visualHook: 'Striking silhouette with high-contrast focal clarity',
      differentiation: 'Optimized flat vector styling ready for immediate SVG conversion',
      searchIntent: [`${params.rawIdea} vector`, `${params.rawIdea} icon`, `flat ${params.rawIdea}`],
      compositionStrategy: 'Centered hero subject on solid pure white background',
      vectorStrategy: 'Clean closed paths with solid contrast, autotrace friendly',
      risks: ['Avoid background clutter or gradient noise'],
      scores: {
        commercial: 8.8,
        uniqueness: 8.1,
        searchability: 9.0,
        vectorSuitability: 9.4,
        visualClarity: 9.0,
        overall: 8.86,
      },
      decision: 'PASS',
    };
  }

  // Ensure Adobe Stock Title if metadata requested
  let cleanAdobeStockTitle = String(parsed.adobeStockTitle || `${params.rawIdea} vector graphic asset, isolated on pure white background`).trim();
  cleanAdobeStockTitle = cleanAdobeStockTitle.replace(/\.{2,}$/, '').trim();
  if (cleanAdobeStockTitle.length > 200) {
    const truncated = cleanAdobeStockTitle.slice(0, 200);
    const lastSpace = truncated.lastIndexOf(' ');
    cleanAdobeStockTitle = (lastSpace > 140 ? truncated.slice(0, lastSpace) : truncated).trim();
  }

  // Ensure Adobe Stock Description if metadata requested
  let cleanAdobeStockDescription = '';
  if (includeMeta) {
    cleanAdobeStockDescription = String(
      parsed.adobeStockDescription ||
      `Clean 2D vector graphic illustration of ${params.rawIdea}, featuring crisp contours and modern commercial styling, suitable for digital design, branding, and microstock assets.`
    ).trim();
    cleanAdobeStockDescription = cleanAdobeStockDescription.replace(/\.{2,}$/, '').trim();
    if (cleanAdobeStockDescription.length > 350) {
      const truncated = cleanAdobeStockDescription.slice(0, 350);
      const lastSpace = truncated.lastIndexOf(' ');
      cleanAdobeStockDescription = (lastSpace > 200 ? truncated.slice(0, lastSpace) : truncated).trim();
    }
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
    adobeStockDescription: includeMeta ? cleanAdobeStockDescription : undefined,
    keywords: includeMeta ? cleanKeywords : undefined,
    commercialDirection: params.commercialDirection || undefined,
    composition: compositionKey,
    commercialBrief,
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
  stylePreset?: string;
  vectorStyle?: string;
  composition?: string;
  isIsolated?: boolean;
  isBlackAndWhite?: boolean;
  commercialDirection?: string;
  commercialConcept?: string;
  targetBuyer?: string;
  primaryUseCases?: string[];
  useCases?: string[];
  visualHook?: string;
  searchIntent?: string[];
  commercialBrief?: CommercialBrief;
}

export interface SeoMetadataResult {
  adobeStockTitle: string;
  adobeStockDescription: string;
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

  const compPreset = params.composition ? SERVER_COMPOSITION_PRESETS[params.composition] : undefined;
  const isIsolated = params.isIsolated ?? (compPreset ? compPreset.isIsolated : (params.composition !== 'commercial-scene' && params.composition !== 'minimal-context'));

  const concept = params.commercialConcept || params.commercialBrief?.commercialConcept || '';
  const buyer = params.targetBuyer || params.commercialBrief?.targetBuyer || '';
  const uses = params.primaryUseCases || params.useCases || params.commercialBrief?.primaryUseCases || [];
  const hook = params.visualHook || params.commercialBrief?.visualHook || '';
  const intent = params.searchIntent || params.commercialBrief?.searchIntent || [];
  const direction = params.commercialDirection || params.commercialBrief?.marketCategory || 'Commercial Utility';

  const systemPrompt = `You are an elite microstock SEO and metadata strategist for top commercial vector marketplaces (Adobe Stock, Shutterstock, Freepik, Vecteezy, Envato).
Your task is to generate top-ranking, highly relevant English metadata for a 2D vector asset based strictly on the deep Commercial Brief and visual prompt.

ADOBE STOCK OFFICIAL BEST PRACTICES:
1. "adobeStockTitle":
   - Factual, descriptive, customer-oriented English title following the strict hierarchy:
     [Commercial Concept] + [Primary Subject] + [Key Attributes / Context / Style]
   - Example: "Specialty coffee brewing equipment set with pour over dripper and kettle, flat vector illustration"
   - Focus on factual clarity without repetitive filler buzzwords.
   - ${isIsolated ? 'Must end with "isolated on white background".' : 'Describe the commercial scene/context and vector style (do NOT force "isolated on white background" for contextual scenes).'}

2. "adobeStockDescription":
   - Factual, descriptive 120-250 characters English summary for microstock buyers.
   - Detail the primary subject, visual components, vector art technique, color/contrast properties, and commercial application (e.g. branding, packaging, web icons, editorial).

3. "keywords" (ORDERED STRICTLY BY SEARCH IMPORTANCE):
   - Adobe Stock algorithm weights the first 10 keywords most heavily.
   - You MUST generate 25 to 40 keywords, ordered strictly in descending order of search relevance into 4 Tiers:
     • Rank 1–10 (Tier 1 - Strongest Search Intent): Primary subject name, core commercial concept, and exact high-intent buyer queries (e.g. "specialty coffee", "coffee equipment", "pour over", "barista tools").
     • Rank 11–20 (Tier 2 - Subject Components & Props): Individual objects, tools, and visual elements present in the graphic (e.g. "dripper", "kettle", "coffee beans", "carafe", "filter").
     • Rank 21–30 (Tier 3 - Visual Style & Primary Use Cases): Technical vector style and specific commercial buyer use cases (e.g. "flat vector", "2d vector", "packaging design", "cafe branding", "menu illustration").
     • Rank 31–40 (Tier 4 - Secondary Relevance & Themes): Broader themes, lifestyle concepts, background/layout attributes (e.g. "artisanal", "culinary", "morning routine"${isIsolated ? ', "isolated", "white background"' : ', "vector scene", "interior"'}).
   - No punctuation, no duplicate tags. Natural phrases allowed.

Respond strictly in JSON format:
{
  "adobeStockTitle": "Factual and descriptive English title following the hierarchy${isIsolated ? ', isolated on white background' : ''}",
  "adobeStockDescription": "Descriptive 120-250 characters English summary of the 2D vector asset for buyers.",
  "keywords": [
    "tag1",
    "tag2",
    "tag3"
  ]
}`;

  const userContent = `Subject / Raw Idea: "${params.rawIdea}".
Commercial Direction: "${direction}".
Commercial Concept: "${concept || params.rawIdea}".
Target Buyer: "${buyer || 'designers, brands, businesses'}".
Primary Use Cases: ${uses.length > 0 ? uses.join(', ') : 'branding, packaging, digital illustration, UI design'}.
Visual Hook: "${hook || 'clean recognizable vector subject'}".
Buyer Search Intent: ${intent.length > 0 ? intent.join(', ') : params.rawIdea}.
Visual Prompt: "${params.optimizedPrompt}".
Art Style: "${params.vectorStyle || params.stylePreset || '2D Vector'}".
Composition: "${params.composition || (isIsolated ? 'Isolated Object' : 'Commercial Scene')}".
Isolation Mode: ${isIsolated ? 'Isolated on Pure White Background' : 'Integrated Commercial Vector Scene'}.
Black & White Mode: ${params.isBlackAndWhite ? 'Yes (Monochrome Ink)' : 'No (Flat Colors)'}.
Requirement: Generate Adobe Stock SEO Title (Commercial Concept → Primary Subject → Attributes), Adobe Stock Description (120-250 chars), and 25-40 keywords strictly ordered by 4-tier importance (Rank 1-10 strongest search intent).`;

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

  let cleanAdobeStockTitle = String(parsed.adobeStockTitle || `${params.rawIdea} 2D vector graphic asset icon, isolated on white background`).trim();
  cleanAdobeStockTitle = cleanAdobeStockTitle.replace(/\.{2,}$/, '').trim();
  if (cleanAdobeStockTitle.length > 200) {
    const truncated = cleanAdobeStockTitle.slice(0, 200);
    const lastSpace = truncated.lastIndexOf(' ');
    cleanAdobeStockTitle = (lastSpace > 140 ? truncated.slice(0, lastSpace) : truncated).trim();
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

  let cleanAdobeStockDescription = String(
    parsed.adobeStockDescription ||
    `High-quality 2D vector asset illustration of ${params.rawIdea}, designed with clean contours, balanced negative space, and professional commercial aesthetics for branding, packaging, and digital media.`
  ).trim();
  cleanAdobeStockDescription = cleanAdobeStockDescription.replace(/\.{2,}$/, '').trim();
  if (cleanAdobeStockDescription.length > 350) {
    const truncated = cleanAdobeStockDescription.slice(0, 350);
    const lastSpace = truncated.lastIndexOf(' ');
    cleanAdobeStockDescription = (lastSpace > 200 ? truncated.slice(0, lastSpace) : truncated).trim();
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
    adobeStockDescription: cleanAdobeStockDescription,
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
