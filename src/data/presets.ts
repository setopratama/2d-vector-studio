// src/data/presets.ts
import { StylePreset, TargetEngine } from '../types/prompt';

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
    category: 'sticker',
    description: 'Iconic die-cut character mascot, clean thick strokes, high contrast, perfect for merchandise',
    promptSnippet: 'bold 2D vector mascot, thick black outer stroke, die-cut sticker silhouette, vibrant solid fill colors, isolated on pure white background, svg autotrace friendly',
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
    { style: 'Aggressive Front View', suffix: 'intense frontal mascot stance, bold thick outer strokes, die-cut vector contours' },
    { style: 'Dynamic 3/4 Action Pose', suffix: 'dynamic three-quarter action pose, athletic mascot curves, sharp contour lines' },
    { style: 'Side Profile Mascot Head', suffix: 'fierce side profile mascot head, sharp geometric jawline, heavy black outlines' },
    { style: 'Shield Framed Mascot', suffix: 'mascot centerpiece inside clean geometric shield outline, bold vector badge lines' },
    { style: 'Expressive Head Icon', suffix: 'expressive mascot head icon, clean rounded vector paths, thick sticker stroke border' },
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
];

export const DEFAULT_NEGATIVE_PROMPT_COLOR =
  'photorealistic, 3d render, realistic shadows, photography, depth of field blur, noise, grain, complex messy background, realistic skin pores, lens flare, micro-gradients';

export const DEFAULT_NEGATIVE_PROMPT_BW =
  'color, colors, colorful, grayscale, gray tones, shading, soft shadows, gradients, realistic texture, 3d, photorealistic, noise, blur, photographic render';
