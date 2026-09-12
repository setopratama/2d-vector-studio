// src/utils/costCalculator.ts
import { PreImageEstimate, PrePromptEstimate, TotalCostEstimate } from '../types/prompt';

export const PRICING_CONFIG = {
  // DeepSeek v4 Flash (Chat Completions)
  PROMPT_INPUT_PER_TOKEN_USD: 0.00000014, // $0.14 per 1M tokens
  PROMPT_OUTPUT_PER_TOKEN_USD: 0.00000056, // $0.56 per 1M tokens
  SYSTEM_PROMPT_BASE_TOKENS: 260, // Base tokens for 2D vector system prompt
  
  // GPT Image 2.5 Sunburst (Text-to-Image 1:1)
  IMAGE_FLAT_COST_PER_UNIT_USD: 0.020000, // $0.020 per 1:1 image
  
  // Exchange Rate (Fallback / Initial Default)
  USD_TO_IDR_RATE: 17500,
};

/**
 * Fast character-based token estimator (~3.8 characters per token for English & prompt engineering)
 */
export function estimateTextTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return Math.max(1, Math.ceil(text.trim().length / 3.8));
}

/**
 * Pre-prompt calculation: estimates input tokens, expected output tokens, and cost in USD & IDR for single or batch runs
 */
export function estimatePromptCost(
  rawIdea: string,
  batchCount: number = 1,
  isMultiLineMode: boolean = false,
  includeMetadata: boolean = false
): PrePromptEstimate {
  const safeBatch = Math.max(1, batchCount);
  const userTokens = estimateTextTokens(rawIdea);
  
  // In multi-line mode each line is a separate concept
  const baseTokens = isMultiLineMode
    ? PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS + (safeBatch * 15)
    : PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS;

  // If includeMetadata is enabled, system prompt includes extra metadata guidelines (~40 tokens)
  const effectiveBaseTokens = includeMetadata ? baseTokens + 40 : baseTokens;
  const estimatedInputTokens = userTokens === 0 ? 0 : effectiveBaseTokens + userTokens;
  
  // Output tokens: ~60 tokens for pure visual prompt, ~200 tokens if Adobe Stock SEO title & 25-45 keywords are included
  const tokensPerVariation = includeMetadata ? 200 : 60;
  const estimatedOutputTokens = userTokens === 0 ? 0 : safeBatch * tokensPerVariation;

  const costUsd =
    estimatedInputTokens * PRICING_CONFIG.PROMPT_INPUT_PER_TOKEN_USD +
    estimatedOutputTokens * PRICING_CONFIG.PROMPT_OUTPUT_PER_TOKEN_USD;

  return {
    batchCount: safeBatch,
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedPromptCostUsd: Number(costUsd.toFixed(6)),
    estimatedPromptCostIdr: Math.round(costUsd * PRICING_CONFIG.USD_TO_IDR_RATE * 100) / 100,
    formula: `(${estimatedInputTokens} in × $0.00000014) + (${estimatedOutputTokens} out [${safeBatch}x @~${tokensPerVariation}tok] × $0.00000056)`,
  };
}

/**
 * Pre-image calculation: estimates cost for visual generation ($0.02 per 1:1 image * total images)
 */
export function estimateImageCost(totalImageCount: number = 1): PreImageEstimate {
  const count = Math.max(0, totalImageCount);
  const costUsd = count * PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD;
  return {
    imageCount: count,
    costPerImageUsd: PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD,
    estimatedImageCostUsd: Number(costUsd.toFixed(6)),
    estimatedImageCostIdr: Math.round(costUsd * PRICING_CONFIG.USD_TO_IDR_RATE),
  };
}

/**
 * Full pipeline breakdown separating prompt expansion and image rendering
 */
export function calculateFullPipelineCost(
  rawIdea: string,
  batchCount: number = 1,
  imagesPerPrompt: number = 1,
  isMultiLineMode: boolean = false,
  includeMetadata: boolean = false
): TotalCostEstimate {
  const promptEst = estimatePromptCost(rawIdea, batchCount, isMultiLineMode, includeMetadata);
  const totalImages = promptEst.batchCount * imagesPerPrompt;
  const imageEst = estimateImageCost(totalImages);

  const totalUsd = Number((promptEst.estimatedPromptCostUsd + imageEst.estimatedImageCostUsd).toFixed(6));
  const totalIdr = Math.round((promptEst.estimatedPromptCostIdr + imageEst.estimatedImageCostIdr) * 100) / 100;

  return {
    promptEstimate: promptEst,
    imageEstimate: imageEst,
    totalCostUsd: totalUsd,
    totalCostIdr: totalIdr,
  };
}

/**
 * Currency formatters
 */
export function formatUsd(amount: number | string, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.000000';
  return `$${num.toFixed(decimals)}`;
}

export function formatIdr(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0,00';
  return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
