// src/types/prompt.ts

export type TargetEngine = 'flux' | 'midjourney' | 'sdxl' | 'dall-e' | 'gpt-image';

export type InputMode = 'variations' | 'multi-keyword';

export interface StylePreset {
  id: string;
  name: string;
  category: 'vector' | 'minimalist' | 'sticker' | 'monochrome' | 'badge';
  description: string;
  promptSnippet: string;
}

export interface CommercialDirection {
  id: string;
  label: string;
  tagline: string;
  description: string;
  iconName: string;
  marketTrend2026: string;
}

export interface CompositionPreset {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  promptSnippet: string;
  isIsolated: boolean;
  iconName?: string;
}

export interface GeneratedImageVersion {
  version: number;
  imagePath: string; // e.g. "outputs/2026-09-10/img-1725940000000-0.png"
  dataUrl?: string;  // Data URL (SVG/PNG) for immediate browser rendering & downloading
  timestamp: number;
  costUsd: number;   // e.g. 0.02
}

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
    commercial: number;        // Commercial Usefulness (1-10)
    uniqueness: number;        // Visual Uniqueness (1-10)
    searchability: number;     // Searchability & Demand (1-10)
    vectorSuitability: number; // Vector Autotrace Suitability (1-10)
    visualClarity: number;     // Visual Clarity & Readability (1-10)
    overall: number;           // Composite Overall Score (1-10)
  };
  decision: 'PASS' | 'REWORK';
}

export interface PromptVersion {
  version: number;           // 1, 2, 3...
  title: string;             // Judul variasi sudut pandang
  optimizedPrompt: string;   // Teks prompt visual 2D
  negativePrompt?: string;   // Negative prompt
  vectorStyle?: string;      // Gaya vektor
  commercialDirection?: string; // e.g. "Food & Beverage"
  composition?: string;      // e.g. "single-isolated", "grouped-still-life"
  adobeStockTitle?: string;  // English Adobe Stock SEO Title <= 120 chars
  adobeStockDescription?: string; // English Adobe Stock SEO Description ~120-250 chars
  keywords?: string[];       // 10-48 Stock Keywords (max 2 words per tag)
  commercialBrief?: CommercialBrief;
  inputTokens: number;       // Token input
  outputTokens: number;      // Token output
  promptCostUsd: string;     // Biaya prompt versi ini
  timestamp: number;         // Waktu generate
}

export interface PromptItem {
  id: string;
  batchId?: string; // Group ID for multi-prompt / batch runs
  title: string;
  rawIdea: string;
  optimizedPrompt: string;
  negativePrompt?: string;
  vectorStyle?: string;
  commercialDirection?: string;
  composition?: string;
  colorPalette?: string;
  adobeStockTitle?: string;  // English Adobe Stock SEO Title <= 120 chars
  adobeStockDescription?: string; // English Adobe Stock SEO Description ~120-250 chars
  keywords?: string[];       // 10-48 Stock Keywords (max 2 words per tag)
  commercialBrief?: CommercialBrief;
  targetEngine: TargetEngine;
  aspectRatio: string; // '1:1'
  stylePreset: string;
  isBlackAndWhite: boolean;
  variationIndex?: number; // 1 of N
  
  // Multi-Version Prompt Timeline
  activePromptVersionIndex?: number;
  promptVersions?: PromptVersion[];
  
  // Token & Cost Metrics (Separated)
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  promptCostUsd: string;  // e.g. "0.000079"
  promptCostIdr: string;  // e.g. "Rp 1,26"
  
  // Image Metrics
  generationCount: number; // 1, 2, 3...
  imageCostUsd: string;   // e.g. "0.020000", "0.040000"
  totalCostUsd: string;   // promptCostUsd + imageCostUsd e.g. "0.020079"
  totalCostIdr: string;
  
  // Images
  imagePath?: string;
  allImagePaths?: string[];
  activeImageIndex: number;
  images: GeneratedImageVersion[];
  
  isFavorite: boolean;
  createdAt: number;
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

export interface PrePromptEstimate {
  batchCount: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedPromptCostUsd: number;
  estimatedPromptCostIdr: number;
  formula: string;
}

export interface PreImageEstimate {
  imageCount: number;
  costPerImageUsd: number;
  estimatedImageCostUsd: number;
  estimatedImageCostIdr: number;
}

export interface TotalCostEstimate {
  promptEstimate: PrePromptEstimate;
  imageEstimate: PreImageEstimate;
  totalCostUsd: number;
  totalCostIdr: number;
}
