// src/data/presets.ts
import { StylePreset, TargetEngine, CommercialDirection, CompositionPreset } from '../types/prompt';

export const COMPOSITION_PRESETS: CompositionPreset[] = [
  {
    id: 'auto',
    name: 'Auto (Art Director Choice)',
    tagline: 'Layout Otomatis Berdasarkan Pembeli',
    description: 'Art Director secara otomatis memilih tata letak terbaik (isolated, grouped, scene, atau badge) berdasarkan analisis target pembeli & kegunaan komersial',
    promptSnippet: 'dynamically selected optimal commercial spatial composition based on target buyer utility',
    isIsolated: true,
    iconName: 'Wand2',
  },
  {
    id: 'isolated-object',
    name: 'Isolated Object',
    tagline: 'Asset Terisolasi White BG',
    description: 'Satu objek utama terpusat, siluet batas tegas, zero clutter, siap autotrace SVG & icon',
    promptSnippet: 'single centered isolated subject, clear negative space framing, pristine outer boundary silhouette, zero background clutter, isolated on solid pure white background',
    isIsolated: true,
    iconName: 'Maximize2',
  },
  {
    id: 'object-group',
    name: 'Object Group',
    tagline: 'Grouped Still Life / Set',
    description: 'Rangkaian 2–3 objek komplementer yang tersusun harmonis dengan separasi jelas',
    promptSnippet: 'balanced grouped arrangement of related objects, compact still life composition, distinct silhouette separations, clean visual hierarchy, isolated on solid pure white background',
    isIsolated: true,
    iconName: 'Layers',
  },
  {
    id: 'minimal-context',
    name: 'Minimal Context',
    tagline: 'Subjek + Grounding Aksen',
    description: 'Subjek utama dengan elemen pijakan atau aksen pendukung minimalis tanpa mengaburkan fokus subjek',
    promptSnippet: 'central subject with subtle minimalist contextual grounding, clean vector props, restrained negative space, balanced geometric environment accents',
    isIsolated: false,
    iconName: 'Sparkles',
  },
  {
    id: 'commercial-scene',
    name: 'Commercial Scene',
    tagline: 'Scene Vektor Komersial Utuh',
    description: 'Scene vektor kontekstual komersial utuh (interior modern, workspace, smart home, aktivitas urban) untuk web hero & editorial',
    promptSnippet: 'full 2D commercial vector scene, flat architectural environment, modern interior or workspace setting, layered flat shapes, balanced editorial vector illustration',
    isIsolated: false,
    iconName: 'Layout',
  },
  {
    id: 'decorative-composition',
    name: 'Decorative Composition',
    tagline: 'Emblem, Frame & Border',
    description: 'Komposisi dekoratif simetris atau berbingkai cincin geometris, badge/crest stempel retro, border ornamen',
    promptSnippet: 'symmetrical decorative vector composition, circular emblem crest framing, clean ornamental geometric border, balanced vintage badge layout',
    isIsolated: true,
    iconName: 'Award',
  },
];

// Helper to resolve composition preset by ID with legacy backwards compatibility
export function resolveCompositionPreset(id?: string): CompositionPreset {
  if (!id) return COMPOSITION_PRESETS[1]; // default to isolated-object for legacy
  const exact = COMPOSITION_PRESETS.find((c) => c.id === id);
  if (exact) return exact;

  // Legacy mappings
  if (id === 'single-isolated') return COMPOSITION_PRESETS[1]; // isolated-object
  if (id === 'grouped-still-life' || id === 'mini-icon-set') return COMPOSITION_PRESETS[2]; // object-group
  if (id === 'hero-with-accents' || id === 'dynamic-diagonal') return COMPOSITION_PRESETS[3]; // minimal-context
  if (id === 'circular-badge') return COMPOSITION_PRESETS[5]; // decorative-composition

  return COMPOSITION_PRESETS[1];
}

export const COMMERCIAL_DIRECTIONS: CommercialDirection[] = [
  {
    id: 'evergreen-utility',
    label: 'Evergreen Utility',
    tagline: 'Simbol & Navigasi Esensial',
    description: 'Kebutuhan esensial sehari-hari, navigasi UI, signage, dan simbol universal dengan penjualan stabil sepanjang tahun.',
    iconName: 'Compass',
    marketTrend2026: 'Universal Utility & Core Icons',
  },
  {
    id: 'business-tech',
    label: 'Business & Technology',
    tagline: 'FinTech, AI & Workspace',
    description: 'FinTech, modern workspace, cloud computing, AI visual concept, dan produktivitas digital.',
    iconName: 'Cpu',
    marketTrend2026: 'Connectioneering & Next-Gen Enterprise',
  },
  {
    id: 'wellness-lifestyle',
    label: 'Wellness & Lifestyle',
    tagline: 'Mindful, Self-Care & Kebugaran',
    description: 'Kesehatan mental, yoga, mindful living, nutrisi seimbang, ketenangan batin, dan kebugaran holistik.',
    iconName: 'HeartPulse',
    marketTrend2026: 'Mindful Balance & Human Vitality',
  },
  {
    id: 'sustainability',
    label: 'Sustainability & Eco',
    tagline: 'Zero Waste & Energi Hijau',
    description: 'Energi terbarukan, zero waste, daur ulang, ekologi hijau, perlindungan satwa, dan climate action.',
    iconName: 'Leaf',
    marketTrend2026: 'Circular Economy & Climate Tech',
  },
  {
    id: 'education-learning',
    label: 'Education & Science',
    tagline: 'STEM, Worksheet & Infografis',
    description: 'Edukasi STEM, e-learning, printable worksheet anak, laboratorium sains, dan infografis akademis.',
    iconName: 'GraduationCap',
    marketTrend2026: 'Visual STEM & Micro-Learning Assets',
  },
  {
    id: 'food-beverage',
    label: 'Food & Beverage',
    tagline: 'Kafe, Kuliner & Packaging',
    description: 'Specialty coffee, bakery artisanal, menu restoran, kemasan makanan, dan merchandising kuliner.',
    iconName: 'UtensilsCrossed',
    marketTrend2026: 'Artisanal Gastronomy & Craft F&B',
  },
  {
    id: 'seasonal-holidays',
    label: 'Seasonal & Holidays',
    tagline: 'Event Kalender & Perayaan',
    description: 'Event musiman kalender global (Ramadhan, Natal, New Year, Halloween, Spring/Summer campaign).',
    iconName: 'CalendarDays',
    marketTrend2026: 'High-Spike Seasonal Event Campaigns',
  },
  {
    id: 'local-cultural',
    label: 'Local & Cultural',
    tagline: 'Tradisi, Etnik & Pariwisata',
    description: 'Warisan budaya lokal, seni tradisi, kerajinan tangan khas, motif etnik, dan destinasi wisata otentik.',
    iconName: 'MapPin',
    marketTrend2026: 'Local Flavor & Cultural Identity',
  },
  {
    id: 'emotional-human',
    label: 'Emotional / Human',
    tagline: 'Empati, Komunitas & Ekspresi',
    description: 'Hubungan antarmanusia, empati sosial, kehangatan keluarga, ekspresi emosional mendalam.',
    iconName: 'Smile',
    marketTrend2026: 'All the Feels & Empathetic Storytelling',
  },
  {
    id: 'playful-surreal',
    label: 'Playful / Surreal',
    tagline: 'Humor Visual & Eksentrik',
    description: 'Humor visual segar, maskot pop-art eksentrik, ilustrasi absurd jenaka, dan karakter penuh imajinasi.',
    iconName: 'Sparkles',
    marketTrend2026: 'Surreal Silliness & Dopamine Pop',
  },
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'flat-vector',
    name: 'Flat Vector Art',
    category: 'vector',
    description: 'Minimalist screen-print, bold outlines, vibrant flat colors, 100% vector autotrace ready',
    promptSnippet: 'crisp 2D flat vector art, sharp geometric contours, bold solid lines, clean screen-print aesthetic, isolated on pure white background, svg graphic ready',
  },
  {
    id: 'mascot-logo',
    name: 'Mascot Character',
    category: 'vector',
    description: 'Iconic character mascot logo, crisp thick outlines, high contrast, no sticker border, perfect for branding & merchandise',
    promptSnippet: 'bold 2D vector mascot character logo, crisp thick black outlines, sharp silhouette contours, vibrant solid fill colors, zero sticker outline, zero white die-cut border, isolated on pure white background, svg autotrace friendly',
  },
  {
    id: 'monoline-ink',
    name: 'Monoline Line Art',
    category: 'monochrome',
    description: 'Uniform stroke width, single-color ink curves, minimal vector nodes, zero clutter',
    promptSnippet: 'monoline 2D vector graphic, uniform stroke weight, crisp minimalist vector paths, isolated on pure white background, clean line art vector',
  },
  {
    id: 'sticker-decal',
    name: 'Sticker Decal',
    category: 'sticker',
    description: 'Die-cut border, white outline offset, graphic sticker asset for digital & physical print',
    promptSnippet: 'vector sticker decal, clean white border contour, flat graphic fills, modern pop vector aesthetic, isolated on pure white background',
  },
  {
    id: 'vintage-emblem',
    name: 'Vintage Badge / Emblem',
    category: 'badge',
    description: 'Geometric symmetry, retro typography frame, clean solid vector stamps',
    promptSnippet: 'vintage 2D vector badge emblem, clean geometric symmetry, bold retro stencil lines, solid color blocks, isolated on pure white background',
  },
  {
    id: 'stencil-silhouette',
    name: 'Stencil Silhouette',
    category: 'monochrome',
    description: 'High-contrast negative space cutout, solid bold shapes, zero shading',
    promptSnippet: 'high-contrast stencil silhouette, sharp negative space cutouts, solid black vector shapes, isolated on pure white background, instant svg trace',
  },
  {
    id: 'premium-line-art',
    name: 'Premium Line Art Icon',
    category: 'monochrome',
    description: 'Clean monoline SVG style, uniform stroke, 85-90% detail simplification, generous negative space, coloring book & printable ready',
    promptSnippet: 'minimal premium line art icon of [subject], clean uniform black monoline stroke, 85% simplified essential silhouette, zero color fill, 75% negative white space, smooth vector outlines, isolated on pure white background, svg coloring page printable ready',
  },
];

export interface StyleVariationAngle {
  style: string;
  suffix: string;
}

export const PRESET_VARIATIONS: Record<string, StyleVariationAngle[]> = {
  'flat-vector': [
    { style: 'Dynamic Front View', suffix: 'dynamic front perspective, crisp geometric contours, bold flat color blocking, clean screen-print aesthetic' },
    { style: 'Side Profile Silhouette', suffix: 'sleek side profile silhouette, layered 2D vector planes, sharp clean outlines, vibrant flat tones' },
    { style: 'Isometric 2D Angle', suffix: 'isometric angled vector composition, sharp solid polygonal facets, modern minimalist flat art' },
    { style: 'Symmetrical Composition', suffix: 'balanced symmetrical composition, bold solid fills, sharp vector path contours' },
    { style: '3/4 Dynamic Angle', suffix: 'three-quarter action perspective, crisp vector edges, high-contrast solid flat colors' },
    { style: 'Close-Up Focal Crop', suffix: 'close-up dramatic vector framing, simplified flat shapes, bold solid outlines' },
    { style: 'Full-Body Geometric Layout', suffix: 'full-body geometric vector layout, clean line hierarchy, sharp flat vector shapes' },
    { style: 'Minimalist Deconstructed', suffix: 'minimalist deconstructed flat vector forms, essential geometric lines, pure solid fills' },
  ],
  'mascot-logo': [
    { style: 'Aggressive Front View', suffix: 'intense frontal mascot stance, bold thick clean outer strokes, sharp mascot contours, no sticker outline' },
    { style: 'Dynamic 3/4 Action Pose', suffix: 'dynamic three-quarter action pose, athletic mascot curves, sharp contour lines' },
    { style: 'Side Profile Mascot Head', suffix: 'fierce side profile mascot head, sharp geometric jawline, heavy black outlines' },
    { style: 'Shield Framed Mascot', suffix: 'mascot centerpiece inside clean geometric shield outline, bold vector badge lines' },
    { style: 'Expressive Head Icon', suffix: 'expressive mascot head icon, clean rounded vector paths, bold character stroke' },
    { style: 'Esports Stance', suffix: 'angular esports mascot stance, sharp angular vector cuts, solid color fills' },
  ],
  'monoline-ink': [
    { style: 'Continuous Single Line', suffix: 'continuous monoline vector path, uniform clean stroke weight, elegant minimalist curves' },
    { style: 'Geometric Wireframe Monoline', suffix: 'geometric monoline construction, single-weight ink lines, precision vector nodes' },
    { style: 'Symmetrical Monoline Icon', suffix: 'symmetrical monoline line art, perfectly balanced curves, uniform line width' },
    { style: 'Circular Monoline Motif', suffix: 'circular monoline composition, delicate uniform ink contours, clean vector paths' },
    { style: 'Isometric Monoline Wireframe', suffix: 'isometric monoline wireframe design, consistent single line thickness, zero shading' },
    { style: 'Minimalist Profile Monoline', suffix: 'minimalist side profile line art, unbroken monoline stroke, pure minimalist ink' },
  ],
  'sticker-decal': [
    { style: 'Die-Cut White Border', suffix: 'pop art sticker decal, thick die-cut white offset border, bold solid graphic fills' },
    { style: 'Holographic Style Sticker', suffix: 'modern graphic sticker decal, crisp outer boundary stroke, punchy high-contrast flat colors' },
    { style: 'Chibi Stylized Sticker', suffix: 'compact stylized sticker asset, thick outer contour line, vibrant solid fills' },
    { style: 'Angled Decal Patch', suffix: 'tilted dynamic decal graphic, clean peel border offset, bold screen-print vector fills' },
    { style: 'Emblem Sticker Decal', suffix: 'clean sticker decal emblem, heavy outer die-cut border, solid vector shapes' },
  ],
  'vintage-emblem': [
    { style: 'Circular Retro Seal', suffix: 'circular vintage badge seal, outer decorative vector ring, retro linework, solid stamp fills' },
    { style: 'Shield Heritage Crest', suffix: 'vintage shield crest emblem, symmetrical retro vector banner, bold engraved lines' },
    { style: 'Diamond Retro Stamp', suffix: 'diamond-shaped vintage vector stamp, heritage linework, clean geometric symmetry' },
    { style: 'Hexagonal Industrial Badge', suffix: 'hexagonal retro badge frame, clean mechanical vector stamp lines, solid colors' },
    { style: 'Curved Banner Emblem', suffix: 'vintage emblem with curved ribbon banner silhouette, classic vector engraving style' },
  ],
  'stencil-silhouette': [
    { style: 'High-Contrast Negative Space', suffix: 'high-contrast stencil cutout, bold negative space bridges, solid black silhouette shapes' },
    { style: 'Urban Stencil Silhouette', suffix: 'sharp stencil art silhouette, clean cutout islands, solid vector forms' },
    { style: 'Minimalist Shadow Cutout', suffix: 'simplified stencil cutout silhouette, stark black and white contrast, zero halftone' },
    { style: 'Geometric Stencil Mask', suffix: 'geometric stencil cutout lines, bold solid black positive shapes, instant svg trace' },
    { style: 'Dual-Layer Stencil', suffix: 'two-tone solid stencil cutout, sharp vector edges, distinct negative space separations' },
  ],
  'premium-line-art': [
    { style: 'Minimalist Icon Silhouette', suffix: 'minimalist line art icon silhouette, clean uniform monoline outlines, 85% detail reduction, generous negative space, svg icon ready' },
    { style: 'Coloring Book Printable', suffix: 'coloring book printable line art outline, crisp uniform stroke thickness, zero fill, clean closed vector paths, white background' },
    { style: 'Architectural / Object Monoline', suffix: 'architectural editorial line art icon, essential structural outlines, precision vector geometry, pure white background' },
    { style: 'Laser Cut / Cricut Ready', suffix: 'laser cut ready vector line art, continuous unbroken clean contours, uniform medium stroke, zero shading, svg asset' },
    { style: 'Museum / Editorial Guide Icon', suffix: 'heritage editorial guide icon, elegant minimalist monoline drawing, centered composition, 75% negative space' },
    { style: 'Sticker Line Art Outline', suffix: 'minimal line art sticker outline, bold uniform contour line, clean vector intersections, instant svg trace ready' },
  ],
};

export const TARGET_ENGINES: { id: TargetEngine; name: string; badge: string; description: string }[] = [
  {
    id: 'gpt-image',
    name: 'GPT Image 2.5 Sunburst',
    badge: 'OPTIMIZED // 1:1 VECTOR',
    description: 'OpenAI 2.5 Sunburst via OpenRouter - optimized 1:1 image stock generator ($0.020 / visual)',
  },
];

export const SAMPLE_IDEAS = [
  'maskot rubah mekanik',
  'vintage coffee badge emblem',
  'cyberpunk ramen bowl icon',
  'minimalist mountain pine badge',
  'retro space astronaut sticker',
  'origami bird monoline logo',
  'minimalist architectural landmark icon',
  'botanical monstera line art icon',
];

export const DEFAULT_NEGATIVE_PROMPT_COLOR =
  'photorealistic, 3d render, realistic shadows, photography, depth of field blur, noise, grain, complex messy background, realistic skin pores, lens flare, micro-gradients';

export const DEFAULT_NEGATIVE_PROMPT_BW =
  'color, colors, colorful, grayscale, gray tones, shading, soft shadows, gradients, realistic texture, 3d, photorealistic, noise, blur, photographic render';
