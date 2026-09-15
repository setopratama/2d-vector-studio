// src/hooks/useAutoRunner.ts
import { useState, useRef, useCallback } from 'react';
import { PromptItem, TargetEngine, GeneratedImageVersion } from '../types/prompt';
import { PRICING_CONFIG, estimateTextTokens, formatIdr } from '../utils/costCalculator';
import { STYLE_PRESETS, PRESET_VARIATIONS, DEFAULT_NEGATIVE_PROMPT_BW, DEFAULT_NEGATIVE_PROMPT_COLOR } from '../data/presets';
import { generate2DVectorSvgDataUrl, convertSvgToPngDataUrl } from '../utils/vectorGraphicGenerator';

export type RunnerStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'completed';
export type RunnerPhase = 'generating-prompt' | 'rendering-image' | 'saving' | 'idle';

export interface AutoRunnerConfig {
  rawIdea: string;
  selectedPreset: string;
  commercialDirection?: string;
  composition?: string;
  isBlackAndWhite: boolean;
  targetQuantity: number;
  qualityGateEnabled?: boolean;
  selectedEngine?: TargetEngine;
  includeMetadata?: boolean;
  onItemComplete?: (item: PromptItem) => void;
}

export function useAutoRunner() {
  const [status, setStatus] = useState<RunnerStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [totalTarget, setTotalTarget] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<RunnerPhase>('idle');
  const [accumulatedCostUsd, setAccumulatedCostUsd] = useState<number>(0);
  const [generatedItems, setGeneratedItems] = useState<PromptItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Control refs to handle asynchronous loops reliably
  const isPausedRef = useRef<boolean>(false);
  const isStoppedRef = useRef<boolean>(false);
  const activeConfigRef = useRef<AutoRunnerConfig | null>(null);

  /**
   * Helper to sync single item to SQLite DB
   */
  const saveToDb = async (item: PromptItem) => {
    try {
      const cleanItem = {
        ...item,
        images: item.images.map(({ version, imagePath, timestamp, costUsd }) => ({
          version,
          imagePath,
          timestamp,
          costUsd,
        })),
      };
      await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanItem),
      });
    } catch (e) {
      console.warn('SQLite DB sync fallback in Auto-Runner:', e);
    }
  };

  /**
   * Execute the loop starting from a given index
   */
  const runLoop = async (startIndex: number, config: AutoRunnerConfig, currentItems: PromptItem[]) => {
    const { rawIdea, selectedPreset, isBlackAndWhite, targetQuantity, selectedEngine = 'gpt-image', onItemComplete } = config;
    const now = Date.now();
    const batchId = `wizard_${now.toString(36)}`;
    const selectedPresetObj = STYLE_PRESETS.find((p) => p.id === selectedPreset) || STYLE_PRESETS[0];
    const presetVariations = PRESET_VARIATIONS[selectedPreset] || PRESET_VARIATIONS['flat-vector'];

    let runningItems = [...currentItems];
    let totalCost = accumulatedCostUsd;

    for (let i = startIndex; i < targetQuantity; i++) {
      // Check if stopped
      if (isStoppedRef.current) {
        setStatus('stopped');
        setCurrentPhase('idle');
        return;
      }

      // Check if paused
      while (isPausedRef.current) {
        setStatus('paused');
        setCurrentPhase('idle');
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (isStoppedRef.current) {
          setStatus('stopped');
          setCurrentPhase('idle');
          return;
        }
      }

      setStatus('running');
      setCurrentIndex(i + 1);

      const angle = presetVariations[i % presetVariations.length];
      const promptId = `pr_wiz_${now.toString(36)}_${i}_${Math.random().toString(36).substring(2, 5)}`;

      // -------------------------------------------------------------
      // 1. TAHAP PROMPT EXPANSION
      // -------------------------------------------------------------
      setCurrentPhase('generating-prompt');

      let title = `${rawIdea.slice(0, 22)} [#${i + 1}: ${angle.style}]`;
      let optimizedPrompt = isBlackAndWhite
        ? `Pure black and white 2D vector art of ${rawIdea}, ${angle.suffix}, ${selectedPresetObj.promptSnippet}, bold black ink contours, solid black silhouette fills, zero grayscale, no shading, sharp geometric outlines, isolated on pure white background, svg autotrace ready.`
        : `Crisp 2D flat vector graphic of ${rawIdea}, ${angle.suffix}, ${selectedPresetObj.promptSnippet}, square 1:1 composition, sharp geometric contours, bold solid lines, vibrant screen-print solid color fills, isolated on pure white background, stock asset SVG ready.`;

      let negativePrompt = isBlackAndWhite ? DEFAULT_NEGATIVE_PROMPT_BW : DEFAULT_NEGATIVE_PROMPT_COLOR;
      let vectorStyle = `${selectedPresetObj.name} - ${angle.style}`;

      const userTok = estimateTextTokens(rawIdea);
      let inputTokens = PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS + userTok;
      let outputTokens = Math.max(50, Math.ceil(optimizedPrompt.length / 3.8));
      let promptCostUsd = ((inputTokens * PRICING_CONFIG.PROMPT_INPUT_PER_TOKEN_USD) + (outputTokens * PRICING_CONFIG.PROMPT_OUTPUT_PER_TOKEN_USD)).toFixed(6);
      let promptCostIdr = formatIdr(parseFloat(promptCostUsd) * PRICING_CONFIG.USD_TO_IDR_RATE);

      let adobeStockTitle = `${rawIdea.trim()} 2D Vector Illustration Icon Isolated on White Background`;
      let adobeStockDescription = `Clean 2D vector graphic illustration of ${rawIdea.trim()}, featuring crisp contours and commercial aesthetics for digital design and branding.`;
      let keywords: string[] = [
        ...rawIdea.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
        'vector', 'illustration', 'icon', 'graphic', 'design', 'flat design',
        'isolated', 'white background', 'clipart', '2d vector', 'stock asset'
      ];

      let commercialBrief: any = undefined;

      try {
        const aiRes = await fetch('/api/generate-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawIdea,
            targetEngine: selectedEngine,
            stylePreset: selectedPreset,
            composition: config.composition,
            variationStyle: angle.style,
            variationIndex: i + 1,
            commercialDirection: config.commercialDirection,
            isBlackAndWhite,
            includeMetadata: activeConfigRef.current?.includeMetadata ?? false,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData.optimizedPrompt) {
            optimizedPrompt = aiData.optimizedPrompt;
            if (aiData.title) title = `${aiData.title} [#${i + 1}]`;
            if (aiData.commercialBrief) commercialBrief = aiData.commercialBrief;
            if (aiData.adobeStockTitle) adobeStockTitle = aiData.adobeStockTitle;
            if (aiData.adobeStockDescription) adobeStockDescription = aiData.adobeStockDescription;
            if (Array.isArray(aiData.keywords) && aiData.keywords.length > 0) keywords = aiData.keywords;
            if (aiData.negativePrompt) negativePrompt = aiData.negativePrompt;
            if (aiData.vectorStyle) vectorStyle = aiData.vectorStyle;
            if (aiData.usage) {
              inputTokens = aiData.usage.promptTokens || inputTokens;
              outputTokens = aiData.usage.completionTokens || outputTokens;
              promptCostUsd = aiData.usage.promptCostUsd || promptCostUsd;
              promptCostIdr = aiData.usage.promptCostIdr || promptCostIdr;
            }
          }
        }
      } catch (err) {
        console.warn('AutoRunner prompt expansion fallback:', err);
      }

      // Check if user paused or stopped right after prompt
      if (isStoppedRef.current) {
        setStatus('stopped');
        setCurrentPhase('idle');
        return;
      }

      // -------------------------------------------------------------
      // 2. TAHAP IMAGE RENDERING (Dengan Commercial Quality Gate)
      // -------------------------------------------------------------
      const isQualityGateActive = config.qualityGateEnabled ?? true;
      const isRework = commercialBrief?.decision === 'REWORK';

      const dateDir = new Date().toISOString().split('T')[0];
      const versionNum = 1;
      const fileName = `img-wiz-${now}-${i}-v${versionNum}.png`;
      let relativePath = `outputs/${dateDir}/${fileName}`;
      let pngDataUrl = '';
      let realApiSuccess = false;

      if (isQualityGateActive && isRework) {
        // QUALITY GATE TRIGGERED: Skip costly GPT Image 2.5 ($0.020) render for low scoring/rework concepts
        setCurrentPhase('saving');

        const newItem: PromptItem = {
          id: promptId,
          batchId,
          title,
          adobeStockTitle,
          adobeStockDescription,
          keywords,
          commercialBrief,
          commercialDirection: config.commercialDirection,
          composition: config.composition || 'isolated-object',
          rawIdea,
          optimizedPrompt,
          negativePrompt,
          vectorStyle,
          targetEngine: selectedEngine,
          aspectRatio: '1:1',
          stylePreset: selectedPreset,
          isBlackAndWhite,
          variationIndex: i + 1,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          promptCostUsd,
          promptCostIdr,
          generationCount: 0,
          imageCostUsd: '0.000000',
          totalCostUsd: promptCostUsd,
          totalCostIdr: promptCostIdr,
          activeImageIndex: 0,
          images: [],
          isFavorite: false,
          createdAt: Date.now(),
        };

        // Save to SQLite
        await saveToDb(newItem);

        // Update state
        runningItems = [newItem, ...runningItems];
        setGeneratedItems([...runningItems]);
        totalCost += parseFloat(promptCostUsd);
        setAccumulatedCostUsd(totalCost);

        if (onItemComplete) {
          onItemComplete(newItem);
        }

        // Delay between items
        await new Promise((resolve) => setTimeout(resolve, 400));
        continue;
      }

      setCurrentPhase('rendering-image');

      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: optimizedPrompt }),
        });

        if (res.ok) {
          const imgData = await res.json();
          if (imgData.images && imgData.images.length > 0) {
            const firstImg = imgData.images[0];
            relativePath = firstImg.relativePath;
            pngDataUrl = `/${firstImg.relativePath}`;
            realApiSuccess = true;
          }
        }
      } catch (apiErr) {
        console.warn('API Image render fallback:', apiErr);
      }

      // Fallback to high-quality SVG vector graphic if offline or API failure
      if (!realApiSuccess) {
        const svgString = generate2DVectorSvgDataUrl(rawIdea, isBlackAndWhite, selectedPreset, i + 1);
        pngDataUrl = await convertSvgToPngDataUrl(svgString, 1024);
      }

      // -------------------------------------------------------------
      // 3. TAHAP PENYIMPANAN & KALKULASI BIAYA ITEM
      // -------------------------------------------------------------
      setCurrentPhase('saving');

      const initialVersion: GeneratedImageVersion = {
        version: versionNum,
        imagePath: relativePath,
        dataUrl: pngDataUrl,
        timestamp: Date.now(),
        costUsd: PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD,
      };

      const imageCostUsd = PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD.toFixed(6);
      const itemTotalUsd = (parseFloat(promptCostUsd) + PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD).toFixed(6);
      const itemTotalIdr = formatIdr(parseFloat(itemTotalUsd) * PRICING_CONFIG.USD_TO_IDR_RATE);

      const newItem: PromptItem = {
        id: promptId,
        batchId,
        title,
        adobeStockTitle,
        adobeStockDescription,
        keywords,
        commercialBrief,
        commercialDirection: config.commercialDirection,
        composition: config.composition || 'isolated-object',
        rawIdea,
        optimizedPrompt,
        negativePrompt,
        vectorStyle,
        targetEngine: selectedEngine,
        aspectRatio: '1:1',
        stylePreset: selectedPreset,
        isBlackAndWhite,
        variationIndex: i + 1,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        promptCostUsd,
        promptCostIdr,
        generationCount: 1,
        imageCostUsd,
        totalCostUsd: itemTotalUsd,
        totalCostIdr: itemTotalIdr,
        activeImageIndex: 0,
        images: [initialVersion],
        isFavorite: false,
        createdAt: Date.now(),
      };

      // Save to SQLite
      await saveToDb(newItem);

      // Update state
      runningItems = [newItem, ...runningItems];
      setGeneratedItems([...runningItems]);
      totalCost += parseFloat(itemTotalUsd);
      setAccumulatedCostUsd(totalCost);

      if (onItemComplete) {
        onItemComplete(newItem);
      }

      // Safe delay between items to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setStatus('completed');
    setCurrentPhase('idle');
  };

  /**
   * Start Wizard Auto-Runner from scratch
   */
  const startRunner = useCallback(async (config: AutoRunnerConfig) => {
    isPausedRef.current = false;
    isStoppedRef.current = false;
    activeConfigRef.current = config;

    setTotalTarget(config.targetQuantity);
    setCurrentIndex(0);
    setAccumulatedCostUsd(0);
    setGeneratedItems([]);
    setErrorMessage(null);
    setStatus('running');

    try {
      await runLoop(0, config, []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Auto-runner encountered an error');
      setStatus('stopped');
      setCurrentPhase('idle');
    }
  }, []);

  /**
   * Pause the runner
   */
  const pauseRunner = useCallback(() => {
    isPausedRef.current = true;
    setStatus('paused');
  }, []);

  /**
   * Resume the runner
   */
  const resumeRunner = useCallback(() => {
    if (!activeConfigRef.current) return;
    isPausedRef.current = false;
    setStatus('running');
  }, []);

  /**
   * Stop / Abort the runner
   */
  const stopRunner = useCallback(() => {
    isStoppedRef.current = true;
    isPausedRef.current = false;
    setStatus('stopped');
    setCurrentPhase('idle');
  }, []);

  /**
   * Reset runner state
   */
  const resetRunner = useCallback(() => {
    isPausedRef.current = false;
    isStoppedRef.current = false;
    activeConfigRef.current = null;
    setStatus('idle');
    setCurrentIndex(0);
    setTotalTarget(0);
    setCurrentPhase('idle');
    setAccumulatedCostUsd(0);
    setGeneratedItems([]);
    setErrorMessage(null);
  }, []);

  return {
    status,
    currentIndex,
    totalTarget,
    currentPhase,
    accumulatedCostUsd,
    generatedItems,
    errorMessage,
    startRunner,
    pauseRunner,
    resumeRunner,
    stopRunner,
    resetRunner,
  };
}
