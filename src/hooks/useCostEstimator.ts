// src/hooks/useCostEstimator.ts
import { useMemo } from 'react';
import {
  estimatePromptCost,
  estimateImageCost,
  estimateTextTokens,
  calculateFullPipelineCost,
} from '../utils/costCalculator';
import { PrePromptEstimate, PreImageEstimate, TotalCostEstimate } from '../types/prompt';

export function useCostEstimator(
  rawIdea: string,
  batchCount: number = 1,
  imagesPerPrompt: number = 1,
  isMultiLineMode: boolean = false,
  includeMetadata: boolean = false
) {
  const userTokens = useMemo(() => {
    return estimateTextTokens(rawIdea);
  }, [rawIdea]);

  const promptEstimate: PrePromptEstimate = useMemo(() => {
    return estimatePromptCost(rawIdea, batchCount, isMultiLineMode, includeMetadata);
  }, [rawIdea, batchCount, isMultiLineMode, includeMetadata]);

  const totalImageCount = useMemo(() => {
    return Math.max(1, batchCount) * Math.max(1, imagesPerPrompt);
  }, [batchCount, imagesPerPrompt]);

  const imageEstimate: PreImageEstimate = useMemo(() => {
    return estimateImageCost(totalImageCount);
  }, [totalImageCount]);

  const fullPipelineEstimate: TotalCostEstimate = useMemo(() => {
    return calculateFullPipelineCost(rawIdea, batchCount, imagesPerPrompt, isMultiLineMode, includeMetadata);
  }, [rawIdea, batchCount, imagesPerPrompt, isMultiLineMode, includeMetadata]);

  return {
    userTokens,
    promptEstimate,
    imageEstimate,
    totalImageCount,
    fullPipelineEstimate,
  };
}
