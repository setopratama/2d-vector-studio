// src/hooks/usePromptGenerator.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { PromptItem, TargetEngine, GeneratedImageVersion, InputMode } from '../types/prompt';
import { PRICING_CONFIG, estimateTextTokens, formatIdr } from '../utils/costCalculator';
import { STYLE_PRESETS, PRESET_VARIATIONS, DEFAULT_NEGATIVE_PROMPT_BW, DEFAULT_NEGATIVE_PROMPT_COLOR } from '../data/presets';
import { generate2DVectorSvgDataUrl, convertSvgToPngDataUrl } from '../utils/vectorGraphicGenerator';
import { sanitizeSeoFileName } from '../utils/imageMetadataInjector';

const STORAGE_KEY = 'gpt_vector_studio_history_v1';

export interface QueueTask {
  id: string;
  promptId: string;
  type: 'generate-image' | 'regenerate-image' | 'regenerate-prompt';
  reworkInstruction?: string;
  addedAt: number;
}

export function usePromptGenerator() {
  const [history, setHistory] = useState<PromptItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activePrompts, setActivePrompts] = useState<PromptItem[]>([]);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronized refs to avoid stale closure state during async FIFO queue execution
  const activePromptsRef = useRef<PromptItem[]>(activePrompts);
  const historyRef = useRef<PromptItem[]>(history);

  useEffect(() => {
    activePromptsRef.current = activePrompts;
  }, [activePrompts]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // FIFO Task Queue State & Refs
  const [taskQueue, setTaskQueue] = useState<QueueTask[]>([]);
  const taskQueueRef = useRef<QueueTask[]>([]);
  const isWorkerRunningRef = useRef<boolean>(false);
  const [activeGeneratingCardId, setActiveGeneratingCardId] = useState<string | null>(null);
  const [activeTaskType, setActiveTaskType] = useState<QueueTask['type'] | null>(null);
  const [generatingSeoCardId, setGeneratingSeoCardId] = useState<string | null>(null);

  // Sync ref with queue state
  useEffect(() => {
    taskQueueRef.current = taskQueue;
  }, [taskQueue]);

  // Load from SQLite on mount
  useEffect(() => {
    async function loadFromDb() {
      try {
        const res = await fetch('/api/prompts');
        if (res.ok) {
          const dbItems: PromptItem[] = await res.json();
          if (Array.isArray(dbItems) && dbItems.length > 0) {
            setHistory(dbItems);
            // Auto populate active canvas with latest batch from SQLite if empty
            setActivePrompts((currentActive) => {
              if (currentActive.length === 0) {
                const latestBatchId = dbItems[0]?.batchId;
                if (latestBatchId) {
                  const latestBatch = dbItems.filter((p) => p.batchId === latestBatchId);
                  return latestBatch.length > 0 ? latestBatch : [dbItems[0]];
                }
                return dbItems.slice(0, 5);
              }
              return currentActive;
            });
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(dbItems));
            } catch (e) {}
          }
        }
      } catch (err) {
        // Fallback to localStorage if server not yet started
      }
    }
    loadFromDb();
  }, []);

  // Sync history to localStorage (strip heavy base64 data to prevent QuotaExceededError)
  useEffect(() => {
    try {
      const cleanHistory = history.map(cleanItemForDb);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanHistory));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  /**
   * Helper to strip heavy image dataUrl before sending to SQLite
   */
  const cleanItemForDb = (item: PromptItem) => {
    return {
      ...item,
      images: item.images.map(({ version, imagePath, timestamp, costUsd }) => ({
        version,
        imagePath,
        timestamp,
        costUsd,
      })),
    };
  };

  /**
   * Helper to sync single item to SQLite DB
   */
  const saveCardToDb = async (item: PromptItem) => {
    try {
      await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanItemForDb(item)),
      });
    } catch (err) {
      console.warn('SQLite DB sync fallback', err);
    }
  };

  /**
   * Helper to sync multiple items to SQLite DB
   */
  const saveBatchCardsToDb = async (items: PromptItem[]) => {
    try {
      await fetch('/api/prompts/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(cleanItemForDb) }),
      });
    } catch (err) {
      console.warn('SQLite batch sync fallback', err);
    }
  };

  /**
   * Helper to update prompt in activePrompts, history, and SQLite DB
   */
  const updatePromptInStateAndHistory = (updated: PromptItem) => {
    setActivePrompts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      activePromptsRef.current = next;
      return next;
    });
    setHistory((prev) => {
      const idx = prev.findIndex((p) => p.id === updated.id);
      let next: PromptItem[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = updated;
      } else {
        next = [updated, ...prev];
      }
      historyRef.current = next;
      return next;
    });

    // Save to SQLite
    saveCardToDb(updated);
  };

  /**
   * Helper to bulk upsert multiple prompts
   */
  const setBulkPromptsInStateAndHistory = (newItems: PromptItem[]) => {
    activePromptsRef.current = newItems;
    setActivePrompts(newItems);
    setHistory((prev) => {
      const map = new Map<string, PromptItem>();
      newItems.forEach((item) => map.set(item.id, item));
      prev.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      });
      const next = Array.from(map.values());
      historyRef.current = next;
      return next;
    });

    // Save all to SQLite
    saveBatchCardsToDb(newItems);
  };

  /**
   * Cancel all pending queue tasks with optional reason
   */
  const cancelAllQueueTasks = useCallback((reason?: string) => {
    const count = taskQueueRef.current.length;
    taskQueueRef.current = [];
    setTaskQueue([]);
    if (reason) {
      setErrorMessage(reason);
    } else if (count > 0) {
      setErrorMessage(`Semua antrean (${count} tugas) telah dibatalkan.`);
    }
  }, []);

  /**
   * Cancel a specific task from queue
   */
  const cancelQueueTask = useCallback((promptId: string) => {
    taskQueueRef.current = taskQueueRef.current.filter((t) => t.promptId !== promptId);
    setTaskQueue([...taskQueueRef.current]);
  }, []);

  /**
   * OFFLINE NETWORK DETECTOR:
   * Auto-cancel all pending queue tasks immediately when internet disconnects
   */
  useEffect(() => {
    const handleOffline = () => {
      const count = taskQueueRef.current.length;
      if (count > 0 || isWorkerRunningRef.current) {
        taskQueueRef.current = [];
        setTaskQueue([]);
        setErrorMessage(
          `⚠️ Koneksi internet terputus! ${count} antrean render gambar telah dibatalkan secara otomatis demi keamanan & kuota.`
        );
      } else {
        setErrorMessage('⚠️ Koneksi internet terputus. Harap periksa jaringan internet Anda.');
      }
    };

    const handleOnline = () => {
      setErrorMessage(null);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  /**
   * Helper to get queue status for a specific card
   */
  const getCardQueueStatus = useCallback(
    (promptId: string) => {
      const isProcessing = activeGeneratingCardId === promptId;
      const queueIndex = taskQueue.findIndex((t) => t.promptId === promptId);
      const queuePosition = queueIndex >= 0 ? queueIndex + 1 : null;
      const queuedTask = queueIndex >= 0 ? taskQueue[queueIndex] : null;

      return {
        isProcessing,
        isQueued: queuePosition !== null,
        queuePosition,
        taskType: isProcessing ? activeTaskType : queuedTask?.type || null,
      };
    },
    [activeGeneratingCardId, activeTaskType, taskQueue]
  );

  /**
   * Core execution: Generate Image for a prompt item
   */
  const executeGenerateImage = async (promptId: string) => {
    // Check if network is offline before executing
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      cancelAllQueueTasks('⚠️ Koneksi internet mati. Pembuatan gambar dibatalkan.');
      return;
    }

    const target = activePromptsRef.current.find((p) => p.id === promptId) || historyRef.current.find((p) => p.id === promptId);
    if (!target) return;

    const now = Date.now();
    const dateDir = new Date().toISOString().split('T')[0];
    const versionNum = target.images.length > 0 ? target.images.length + 1 : 1;
    const fileName = `img-${now}-v${versionNum}.png`;
    let relativePath = `outputs/${dateDir}/${fileName}`;
    let pngDataUrl = '';

    try {
      let realApiSuccess = false;
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: target.optimizedPrompt }),
        });

        if (res.ok) {
          const imgData = await res.json();
          if (imgData.images && imgData.images.length > 0) {
            const firstImg = imgData.images[0];
            relativePath = firstImg.relativePath;
            pngDataUrl = `/${firstImg.relativePath}`;
            realApiSuccess = true;
          }
        } else {
          const errData = await res.json().catch(() => ({ error: res.statusText }));
          console.error('[API Generate Image Error]:', errData);
          setErrorMessage(`API Image Error [${res.status}]: ${errData.error || res.statusText}`);
        }
      } catch (apiErr: any) {
        console.warn('Real AI Image generation API error:', apiErr);
      }

      // Fallback to client-side vector generator if offline or API failed
      if (!realApiSuccess) {
        const styleVariantIndex = target.variationIndex ? target.variationIndex - 1 : 0;
        const svgUrl = generate2DVectorSvgDataUrl(
          target.rawIdea,
          target.isBlackAndWhite,
          target.stylePreset || 'flat-vector',
          versionNum,
          styleVariantIndex
        );
        pngDataUrl = await convertSvgToPngDataUrl(svgUrl, 1024);
      }

      const newVersion: GeneratedImageVersion = {
        version: versionNum,
        imagePath: relativePath,
        dataUrl: pngDataUrl,
        timestamp: now,
        costUsd: PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD,
      };

      const newGenCount = (target.generationCount || 0) + 1;
      const totalImageCostUsd = (newGenCount * PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD).toFixed(6);
      const totalCombinedUsd = (
        parseFloat(target.promptCostUsd || '0') +
        newGenCount * PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD
      ).toFixed(6);
      const totalCombinedIdr = formatIdr(
        parseFloat(totalCombinedUsd) * PRICING_CONFIG.USD_TO_IDR_RATE
      );

      const updatedPrompt: PromptItem = {
        ...target,
        generationCount: newGenCount,
        imagePath: relativePath,
        imageCostUsd: totalImageCostUsd,
        totalCostUsd: totalCombinedUsd,
        totalCostIdr: totalCombinedIdr,
        activeImageIndex: versionNum - 1,
        images: [...target.images, newVersion],
      };

      updatePromptInStateAndHistory(updatedPrompt);
    } catch (err: any) {
      setErrorMessage(`Gagal membuat gambar untuk "${target.title}": ${err.message}`);
    }
  };

  /**
   * Core execution: Regenerate Prompt for a prompt item (Preserves history timeline)
   */
  const executeRegeneratePrompt = async (promptId: string, customReworkInstruction?: string) => {
    // Check if network is offline before executing
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      cancelAllQueueTasks('⚠️ Koneksi internet mati. Pembuatan prompt dibatalkan.');
      return;
    }

    const target = activePromptsRef.current.find((p) => p.id === promptId) || historyRef.current.find((p) => p.id === promptId);
    if (!target) return;

    try {
      const presetVariations = PRESET_VARIATIONS[target.stylePreset || 'flat-vector'] || PRESET_VARIATIONS['flat-vector'];
      // Cycle through angles based on total prompt versions generated
      const existingVersions = target.promptVersions && target.promptVersions.length > 0
        ? target.promptVersions
        : [{
            version: 1,
            title: target.title,
            optimizedPrompt: target.optimizedPrompt,
            negativePrompt: target.negativePrompt,
            vectorStyle: target.vectorStyle,
            inputTokens: target.inputTokens,
            outputTokens: target.outputTokens,
            promptCostUsd: target.promptCostUsd,
            timestamp: target.createdAt,
          }];

      const nextVersionNum = existingVersions.length + 1;
      const angleIndex = (nextVersionNum - 1) % presetVariations.length;
      const angle = presetVariations[angleIndex];
      const hasExistingSeo = Boolean(
        target.adobeStockTitle || (Array.isArray(target.keywords) && target.keywords.length > 0)
      );

      const reworkToUse = customReworkInstruction || target.commercialBrief?.reworkInstruction;

      const aiRes = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawIdea: target.rawIdea,
          targetEngine: target.targetEngine,
          stylePreset: target.stylePreset,
          composition: target.composition,
          variationStyle: angle.style,
          variationIndex: target.variationIndex || 1,
          commercialDirection: target.commercialDirection,
          isBlackAndWhite: target.isBlackAndWhite,
          includeMetadata: hasExistingSeo,
          reworkInstruction: reworkToUse,
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (aiData.optimizedPrompt) {
          const inputTokens = aiData.usage?.promptTokens || target.inputTokens;
          const outputTokens = aiData.usage?.completionTokens || target.outputTokens;
          const newPromptCostUsd = aiData.usage?.promptCostUsd || target.promptCostUsd;
          const newPromptCostIdr = aiData.usage?.promptCostIdr || target.promptCostIdr;

          const newTitle = aiData.title ? `${aiData.title} [v${nextVersionNum}: ${angle.style}]` : `${target.title} (v${nextVersionNum})`;
          const newAdobeStockTitle = aiData.adobeStockTitle !== undefined ? aiData.adobeStockTitle : target.adobeStockTitle;
          const newAdobeStockDescription = aiData.adobeStockDescription !== undefined ? aiData.adobeStockDescription : target.adobeStockDescription;
          const newKeywords = Array.isArray(aiData.keywords) ? aiData.keywords : target.keywords;
          const newNegativePrompt = aiData.negativePrompt || target.negativePrompt;
          const newVectorStyle = aiData.vectorStyle || target.vectorStyle;
          const newCommercialDirection = aiData.commercialDirection || target.commercialDirection;
          const newComposition = aiData.composition || target.composition;

          const newVersionObj = {
            version: nextVersionNum,
            title: newTitle,
            adobeStockTitle: newAdobeStockTitle,
            adobeStockDescription: newAdobeStockDescription,
            keywords: newKeywords,
            commercialDirection: newCommercialDirection,
            composition: newComposition,
            commercialBrief: aiData.commercialBrief || target.commercialBrief,
            optimizedPrompt: aiData.optimizedPrompt,
            negativePrompt: newNegativePrompt,
            vectorStyle: newVectorStyle,
            inputTokens,
            outputTokens,
            promptCostUsd: newPromptCostUsd,
            timestamp: Date.now(),
          };

          const updatedPromptVersions = [...existingVersions, newVersionObj];
          const newActiveVersionIndex = updatedPromptVersions.length - 1;

          // Cumulative total cost
          const totalCostUsd = (parseFloat(newPromptCostUsd) + parseFloat(target.imageCostUsd || '0')).toFixed(6);
          const totalCostIdr = formatIdr(parseFloat(totalCostUsd) * PRICING_CONFIG.USD_TO_IDR_RATE);

          const updated: PromptItem = {
            ...target,
            title: newTitle,
            adobeStockTitle: newAdobeStockTitle,
            adobeStockDescription: newAdobeStockDescription,
            keywords: newKeywords,
            commercialDirection: newCommercialDirection,
            composition: newComposition,
            commercialBrief: aiData.commercialBrief || target.commercialBrief,
            optimizedPrompt: aiData.optimizedPrompt,
            negativePrompt: newNegativePrompt,
            vectorStyle: newVectorStyle,
            promptVersions: updatedPromptVersions,
            activePromptVersionIndex: newActiveVersionIndex,
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            promptCostUsd: newPromptCostUsd,
            promptCostIdr: newPromptCostIdr,
            totalCostUsd,
            totalCostIdr,
          };

          updatePromptInStateAndHistory(updated);
        }
      }
    } catch (err: any) {
      setErrorMessage(`Gagal memperbarui prompt: ${err.message}`);
    }
  };

  /**
   * FIFO QUEUE WORKER: Processes tasks sequentially one-by-one with safety delay
   */
  const runQueueWorker = async () => {
    if (isWorkerRunningRef.current) return;
    isWorkerRunningRef.current = true;

    while (taskQueueRef.current.length > 0) {
      // Check network connectivity before picking next task
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        cancelAllQueueTasks('⚠️ Koneksi internet mati. Seluruh antrean tersisa dibatalkan.');
        break;
      }

      // Dequeue first task (FIFO)
      const currentTask = taskQueueRef.current.shift()!;
      setTaskQueue([...taskQueueRef.current]);

      setActiveGeneratingCardId(currentTask.promptId);
      setActiveTaskType(currentTask.type);

      try {
        if (currentTask.type === 'generate-image' || currentTask.type === 'regenerate-image') {
          await executeGenerateImage(currentTask.promptId);
        } else if (currentTask.type === 'regenerate-prompt') {
          await executeRegeneratePrompt(currentTask.promptId, currentTask.reworkInstruction);
        }
      } catch (err: any) {
        console.error('Queue task execution error:', err);
      } finally {
        setActiveGeneratingCardId(null);
        setActiveTaskType(null);
      }

      // Safe worker delay between AI calls to prevent 429 rate limit
      if (taskQueueRef.current.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    isWorkerRunningRef.current = false;
  };

  /**
   * Enqueue a new task into the FIFO queue worker
   */
  const enqueueTask = useCallback((promptId: string, type: QueueTask['type'], reworkInstruction?: string) => {
    // Check if network is offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage('⚠️ Tidak ada koneksi internet. Tidak dapat menambahkan antrean.');
      return;
    }

    // Check if task for this card already exists in queue or currently executing
    const alreadyQueued = taskQueueRef.current.some((t) => t.promptId === promptId);
    const currentlyActive = activeGeneratingCardId === promptId;

    if (alreadyQueued || currentlyActive) {
      return; // Prevent duplicate queuing of same card
    }

    const newTask: QueueTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      promptId,
      type,
      reworkInstruction,
      addedAt: Date.now(),
    };

    taskQueueRef.current = [...taskQueueRef.current, newTask];
    setTaskQueue([...taskQueueRef.current]);

    // Start worker loop if not already running
    if (!isWorkerRunningRef.current) {
      runQueueWorker();
    }
  }, [activeGeneratingCardId]);

  /**
   * Action: Enqueue generate image for a single card
   */
  const handleGenerateImageForPrompt = (promptId: string) => {
    enqueueTask(promptId, 'generate-image');
  };

  /**
   * Action: Enqueue regenerate image for a single card
   */
  const handleRegenerateImage = (promptId: string) => {
    enqueueTask(promptId, 'regenerate-image');
  };

  /**
   * Action: Enqueue regenerate prompt for a single card with optional 1-step REWORK instruction
   */
  const handleRegeneratePrompt = (promptId: string, reworkInstruction?: string) => {
    enqueueTask(promptId, 'regenerate-prompt', reworkInstruction);
  };

  /**
   * Action: Enqueue all ungenerated cards into the FIFO queue worker
   * @param onlyPass If true, only queues cards with Commercial Quality Gate PASS status (skips REWORK)
   */
  const handleGenerateAllBatchImages = (onlyPass: boolean = false) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage('⚠️ Tidak ada koneksi internet. Tidak dapat memproses antrean batch.');
      return;
    }

    let ungeneratedItems = activePrompts.filter((p) => p.images.length === 0);
    if (onlyPass) {
      ungeneratedItems = ungeneratedItems.filter((p) => p.commercialBrief?.decision !== 'REWORK');
    }
    if (ungeneratedItems.length === 0) return;

    const newTasks: QueueTask[] = [];
    for (const item of ungeneratedItems) {
      const alreadyQueued = taskQueueRef.current.some((t) => t.promptId === item.id);
      const currentlyActive = activeGeneratingCardId === item.id;
      if (!alreadyQueued && !currentlyActive) {
        newTasks.push({
          id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          promptId: item.id,
          type: 'generate-image',
          addedAt: Date.now(),
        });
      }
    }

    if (newTasks.length > 0) {
      taskQueueRef.current = [...taskQueueRef.current, ...newTasks];
      setTaskQueue([...taskQueueRef.current]);

      if (!isWorkerRunningRef.current) {
        runQueueWorker();
      }
    }
  };

  /**
   * Tahap 1: Batch / Multi-Prompt Generation (Creates N cards & saves to SQLite)
   */
  const handleGeneratePrompts = async ({
    rawIdea,
    inputMode,
    batchCount,
    selectedEngine,
    selectedPreset,
    commercialDirection = 'Evergreen Utility',
    composition = 'single-isolated',
    isBlackAndWhite,
    includeMetadata = false,
  }: {
    rawIdea: string;
    inputMode: InputMode;
    batchCount: number;
    selectedEngine: TargetEngine;
    selectedPreset: string;
    commercialDirection?: string;
    composition?: string;
    isBlackAndWhite: boolean;
    includeMetadata?: boolean;
  }) => {
    if (!rawIdea.trim() || isGeneratingPrompt) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage('⚠️ Tidak ada koneksi internet. Harap periksa jaringan Anda.');
      return;
    }

    setIsGeneratingPrompt(true);
    setErrorMessage(null);

    const now = Date.now();
    const batchId = `batch_${now.toString(36)}`;

    // Parse concepts based on input mode
    let concepts: string[] = [];
    if (inputMode === 'multi-keyword') {
      concepts = rawIdea
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (concepts.length === 0) concepts = [rawIdea.trim()];
    } else {
      const base = rawIdea.trim();
      for (let i = 0; i < batchCount; i++) {
        concepts.push(base);
      }
    }

    try {
      const selectedPresetObj = STYLE_PRESETS.find((p) => p.id === selectedPreset) || STYLE_PRESETS[0];
      const presetVariations = PRESET_VARIATIONS[selectedPreset] || PRESET_VARIATIONS['flat-vector'];

      const promptPromises = concepts.map(async (concept, idx) => {
        const angle = presetVariations[idx % presetVariations.length];
        const promptId = `pr_${now.toString(36)}_${idx}_${Math.random().toString(36).substring(2, 5)}`;

        let title = inputMode === 'multi-keyword'
          ? `${concept.slice(0, 25)} [Item #${idx + 1}]`
          : `${concept.slice(0, 22)} [Var #${idx + 1}: ${angle.style}]`;

        let optimizedPrompt = isBlackAndWhite
          ? `Pure black and white 2D vector art of ${concept}, ${angle.suffix}, ${selectedPresetObj.promptSnippet}, bold black ink contours, solid black silhouette fills, zero grayscale, no shading, sharp geometric outlines, isolated on pure white background, svg autotrace ready.`
          : `Crisp 2D flat vector graphic of ${concept}, ${angle.suffix}, ${selectedPresetObj.promptSnippet}, square 1:1 composition, sharp geometric contours, bold solid lines, vibrant screen-print solid color fills, isolated on pure white background, stock asset SVG ready.`;

        let negativePrompt = isBlackAndWhite ? DEFAULT_NEGATIVE_PROMPT_BW : DEFAULT_NEGATIVE_PROMPT_COLOR;
        let vectorStyle = `${selectedPresetObj.name} - ${angle.style}`;
        let promptComposition = composition;

        const userTok = estimateTextTokens(concept);
        let inputTokens = PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS + userTok;
        let outputTokens = Math.max(50, Math.ceil(optimizedPrompt.length / 3.8));
        let promptCostUsd = ((inputTokens * PRICING_CONFIG.PROMPT_INPUT_PER_TOKEN_USD) + (outputTokens * PRICING_CONFIG.PROMPT_OUTPUT_PER_TOKEN_USD)).toFixed(6);
        let promptCostIdr = formatIdr(parseFloat(promptCostUsd) * PRICING_CONFIG.USD_TO_IDR_RATE);

        let adobeStockTitle: string | undefined = includeMetadata
          ? `${concept.trim()} 2D Vector Illustration Icon Isolated on White Background`
          : undefined;
        let adobeStockDescription: string | undefined = includeMetadata
          ? `Clean 2D vector graphic illustration of ${concept.trim()}, featuring crisp contours and commercial aesthetics for digital design and branding.`
          : undefined;
        let keywords: string[] | undefined = includeMetadata
          ? [
              ...concept.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
              'vector', 'illustration', 'icon', 'graphic', 'design', 'flat design',
              'isolated', 'white background', 'clipart', '2d vector', 'stock asset'
            ]
          : undefined;

        let commercialBrief: any = undefined;

        try {
          const aiRes = await fetch('/api/generate-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rawIdea: concept,
              targetEngine: selectedEngine,
              stylePreset: selectedPreset,
              composition,
              variationStyle: angle.style,
              variationIndex: idx + 1,
              commercialDirection,
              isBlackAndWhite,
              includeMetadata,
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (aiData.optimizedPrompt) {
              optimizedPrompt = aiData.optimizedPrompt;
              if (aiData.title) {
                title = inputMode === 'multi-keyword'
                  ? `${aiData.title} [Item #${idx + 1}]`
                  : `${aiData.title} [Var #${idx + 1}]`;
              }
              if (aiData.commercialBrief) commercialBrief = aiData.commercialBrief;
              if (aiData.composition) promptComposition = aiData.composition;
              if (aiData.adobeStockTitle !== undefined) adobeStockTitle = aiData.adobeStockTitle;
              if (aiData.adobeStockDescription !== undefined) adobeStockDescription = aiData.adobeStockDescription;
              if (Array.isArray(aiData.keywords)) keywords = aiData.keywords;
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
        } catch (apiErr) {
          console.warn('Real AI Prompt expansion fallback:', apiErr);
        }

        const initialPromptVersion = {
          version: 1,
          title,
          adobeStockTitle,
          adobeStockDescription,
          keywords,
          commercialBrief,
          commercialDirection,
          composition: promptComposition,
          optimizedPrompt,
          negativePrompt,
          vectorStyle,
          inputTokens,
          outputTokens,
          promptCostUsd,
          timestamp: now + idx,
        };

        const item: PromptItem = {
          id: promptId,
          batchId,
          title,
          adobeStockTitle,
          adobeStockDescription,
          keywords,
          commercialBrief,
          commercialDirection,
          composition: promptComposition,
          rawIdea: concept,
          optimizedPrompt,
          negativePrompt,
          vectorStyle,
          targetEngine: selectedEngine,
          aspectRatio: '1:1',
          stylePreset: selectedPreset,
          isBlackAndWhite,
          variationIndex: idx + 1,
          activePromptVersionIndex: 0,
          promptVersions: [initialPromptVersion],
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
          createdAt: now + idx,
        };

        return item;
      });

      const newPrompts = await Promise.all(promptPromises);
      setBulkPromptsInStateAndHistory(newPrompts);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghasilkan batch prompt');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  /**
   * Switch active prompt version for a card
   */
  const handleSelectPromptVersion = (promptId: string, versionIndex: number) => {
    const target = activePrompts.find((p) => p.id === promptId) || history.find((p) => p.id === promptId);
    if (!target || !target.promptVersions || !target.promptVersions[versionIndex]) return;

    const selectedVersion = target.promptVersions[versionIndex];
    const updated: PromptItem = {
      ...target,
      activePromptVersionIndex: versionIndex,
      title: selectedVersion.title || target.title,
      commercialBrief: selectedVersion.commercialBrief || target.commercialBrief,
      commercialDirection: selectedVersion.commercialDirection || target.commercialDirection,
      composition: selectedVersion.composition || target.composition,
      optimizedPrompt: selectedVersion.optimizedPrompt,
      negativePrompt: selectedVersion.negativePrompt || target.negativePrompt,
      vectorStyle: selectedVersion.vectorStyle || target.vectorStyle,
      inputTokens: selectedVersion.inputTokens,
      outputTokens: selectedVersion.outputTokens,
      totalTokens: selectedVersion.inputTokens + selectedVersion.outputTokens,
      promptCostUsd: selectedVersion.promptCostUsd,
      promptCostIdr: formatIdr(parseFloat(selectedVersion.promptCostUsd) * PRICING_CONFIG.USD_TO_IDR_RATE),
    };

    updatePromptInStateAndHistory(updated);
  };

  /**
   * Action: Batch Download all generated PNGs with metadata injection
   */
  const handleDownloadAllImages = async (profile?: {
    includeAuthor?: boolean;
    authorName?: string;
    includeSoftware?: boolean;
    softwareName?: string;
    includeCredit?: boolean;
    credit?: string;
    includeSource?: boolean;
    source?: string;
  }) => {
    const itemsWithImages = activePrompts.filter((p) => p.images.length > 0);
    if (itemsWithImages.length === 0) return;

    const downloadList = itemsWithImages.map((item) => {
      const activeImg = item.images[item.images.length - 1];
      const seoTitle = item.adobeStockTitle || item.title;
      const fileName = sanitizeSeoFileName(seoTitle);
      const url = activeImg.dataUrl || (activeImg.imagePath ? (activeImg.imagePath.startsWith('/') ? activeImg.imagePath : `/${activeImg.imagePath}`) : '');
      return {
        url,
        fileName,
        metadata: {
          title: seoTitle,
          keywords: item.keywords || [],
          description: seoTitle,
          author: profile?.includeAuthor ? (profile.authorName || undefined) : undefined,
          software: profile?.includeSoftware ? (profile.softwareName || undefined) : undefined,
          credit: profile?.includeCredit ? (profile.credit || undefined) : undefined,
          source: profile?.includeSource ? (profile.source || undefined) : undefined,
        },
      };
    }).filter((d) => Boolean(d.url));

    const { downloadMultipleImagesSequentially } = await import('../utils/downloadHelper');
    await downloadMultipleImagesSequentially(downloadList, 400);
  };

  /**
   * Toggle favorite
   */
  const handleToggleFavorite = (promptId: string) => {
    const updater = (item: PromptItem) => {
      if (item.id === promptId) {
        const updated = { ...item, isFavorite: !item.isFavorite };
        saveCardToDb(updated);
        return updated;
      }
      return item;
    };

    setHistory((prev) => prev.map(updater));
    setActivePrompts((prev) => prev.map(updater));
  };

  /**
   * Delete prompt card from state, localStorage, and SQLite
   */
  const handleDeletePrompt = (id: string) => {
    cancelQueueTask(id);
    setHistory((prev) => prev.filter((p) => p.id !== id));
    setActivePrompts((prev) => prev.filter((p) => p.id !== id));

    fetch(`/api/prompts/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  /**
   * On-Demand SEO Metadata Generator for a single card
   */
  const handleGenerateSeoMetadataForCard = async (promptId: string) => {
    const target = activePromptsRef.current.find((p) => p.id === promptId) || historyRef.current.find((p) => p.id === promptId);
    if (!target) return;

    setGeneratingSeoCardId(promptId);
    try {
      const activeVIdx = typeof target.activePromptVersionIndex === 'number'
        ? target.activePromptVersionIndex
        : (target.promptVersions && target.promptVersions.length > 0 ? target.promptVersions.length - 1 : 0);
      const activePromptObj = target.promptVersions?.[activeVIdx];
      const activePromptText = activePromptObj?.optimizedPrompt || target.optimizedPrompt;
      const activeBrief = activePromptObj?.commercialBrief || target.commercialBrief;
      const activeDirection = activePromptObj?.commercialDirection || target.commercialDirection;
      const activeComposition = activePromptObj?.composition || target.composition;

      const res = await fetch('/api/generate-seo-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawIdea: target.rawIdea,
          optimizedPrompt: activePromptText,
          vectorStyle: target.vectorStyle,
          stylePreset: target.stylePreset,
          isBlackAndWhite: target.isBlackAndWhite,
          commercialDirection: activeDirection,
          composition: activeComposition,
          commercialConcept: activeBrief?.commercialConcept,
          targetBuyer: activeBrief?.targetBuyer,
          primaryUseCases: activeBrief?.primaryUseCases,
          visualHook: activeBrief?.visualHook,
          differentiation: activeBrief?.differentiation,
          searchIntent: activeBrief?.searchIntent,
          commercialBrief: activeBrief,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal menghasilkan metadata SEO');
      }

      const data = await res.json();
      if (data.adobeStockTitle && Array.isArray(data.keywords)) {
        const addedCostUsd = parseFloat(data.usage?.promptCostUsd || '0.000030');
        const updatedPromptCostUsd = (parseFloat(target.promptCostUsd || '0') + addedCostUsd).toFixed(6);
        const updatedPromptCostIdr = formatIdr(parseFloat(updatedPromptCostUsd) * PRICING_CONFIG.USD_TO_IDR_RATE);
        const updatedTotalCostUsd = (parseFloat(target.totalCostUsd || '0') + addedCostUsd).toFixed(6);
        const updatedTotalCostIdr = formatIdr(parseFloat(updatedTotalCostUsd) * PRICING_CONFIG.USD_TO_IDR_RATE);

        const updatedVersions = (target.promptVersions || []).map((v, idx) => {
          if (idx === activeVIdx) {
            return {
              ...v,
              adobeStockTitle: data.adobeStockTitle,
              adobeStockDescription: data.adobeStockDescription,
              keywords: data.keywords,
            };
          }
          return v;
        });

        const updated: PromptItem = {
          ...target,
          adobeStockTitle: data.adobeStockTitle,
          adobeStockDescription: data.adobeStockDescription,
          keywords: data.keywords,
          promptVersions: updatedVersions.length > 0 ? updatedVersions : [{
            version: 1,
            title: target.title,
            adobeStockTitle: data.adobeStockTitle,
            adobeStockDescription: data.adobeStockDescription,
            keywords: data.keywords,
            optimizedPrompt: target.optimizedPrompt,
            negativePrompt: target.negativePrompt,
            vectorStyle: target.vectorStyle,
            inputTokens: target.inputTokens,
            outputTokens: target.outputTokens,
            promptCostUsd: target.promptCostUsd,
            timestamp: target.createdAt,
          }],
          inputTokens: target.inputTokens + (data.usage?.promptTokens || 0),
          outputTokens: target.outputTokens + (data.usage?.completionTokens || 0),
          promptCostUsd: updatedPromptCostUsd,
          promptCostIdr: updatedPromptCostIdr,
          totalCostUsd: updatedTotalCostUsd,
          totalCostIdr: updatedTotalCostIdr,
        };

        updatePromptInStateAndHistory(updated);
        saveCardToDb(updated);
      }
    } catch (err: any) {
      console.error('Error generating SEO metadata for card:', err);
      setErrorMessage(err.message || 'Gagal menghasilkan metadata SEO');
    } finally {
      setGeneratingSeoCardId(null);
    }
  };

  /**
   * Clear all cards
   */
  const handleClearHistory = () => {
    if (window.confirm('Bersihkan seluruh riwayat lokal dan database SQLite?')) {
      cancelAllQueueTasks();
      setHistory([]);
      setActivePrompts([]);
      localStorage.removeItem(STORAGE_KEY);
      fetch('/api/prompts', { method: 'DELETE' }).catch(() => {});
    }
  };

  return {
    history,
    activePrompts,
    setActivePrompts,
    isGeneratingPrompt,
    taskQueue,
    activeGeneratingCardId,
    activeTaskType,
    generatingSeoCardId,
    getCardQueueStatus,
    cancelQueueTask,
    cancelAllQueueTasks,
    errorMessage,
    setErrorMessage,
    handleGeneratePrompts,
    handleRegeneratePrompt,
    handleSelectPromptVersion,
    handleGenerateSeoMetadataForCard,
    handleGenerateImageForPrompt,
    handleGenerateAllBatchImages,
    handleRegenerateImage,
    handleDownloadAllImages,
    handleToggleFavorite,
    handleDeletePrompt,
    handleClearHistory,
  };
}

