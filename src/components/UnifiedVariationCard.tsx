// src/components/UnifiedVariationCard.tsx
import React, { useState } from 'react';
import { PromptItem, GeneratedImageVersion } from '../types/prompt';
import {
  Copy,
  Check,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Sparkles,
  Zap,
  Maximize2,
  Database,
  Star,
  ArrowRight,
  Folder,
  Layers,
  Hourglass,
  XCircle,
  Tag,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Target,
  TrendingUp,
  Award,
  Lightbulb,
  AlertTriangle,
  Compass,
  ChevronDown,
  ChevronUp,
  Layout,
} from 'lucide-react';
import { formatUsd, formatIdr, PRICING_CONFIG } from '../utils/costCalculator';
import { CardLoadingBar } from './CardLoadingBar';
import { sanitizeSeoFileName } from '../utils/pngMetadataHelper';
import { ContributorProfile } from '../hooks/useContributorProfile';
import { COMMERCIAL_DIRECTIONS, COMPOSITION_PRESETS, resolveCompositionPreset } from '../data/presets';

interface UnifiedVariationCardProps {
  item: PromptItem;
  index: number;
  contributorProfile?: ContributorProfile;
  onOpenProfileSettings?: () => void;
  onGenerateImage: (promptId: string) => void;
  onRegenerateImage: (promptId: string) => void;
  onRegeneratePrompt?: (promptId: string, reworkInstruction?: string) => void;
  onGenerateSeoMetadata?: (promptId: string) => void;
  isGeneratingSeo?: boolean;
  onSelectPromptVersion?: (promptId: string, versionIndex: number) => void;
  onCancelQueueTask?: (promptId: string) => void;
  queueStatus?: {
    isProcessing: boolean;
    isQueued: boolean;
    queuePosition: number | null;
    taskType: string | null;
  };
  onToggleFavorite?: (promptId: string) => void;
}

export const UnifiedVariationCard: React.FC<UnifiedVariationCardProps> = ({
  item,
  index,
  contributorProfile,
  onOpenProfileSettings,
  onGenerateImage,
  onRegenerateImage,
  onRegeneratePrompt,
  onGenerateSeoMetadata,
  isGeneratingSeo = false,
  onSelectPromptVersion,
  onCancelQueueTask,
  queueStatus,
  onToggleFavorite,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedKeywordsComma, setCopiedKeywordsComma] = useState(false);
  const [copiedVersionIdx, setCopiedVersionIdx] = useState<number | null>(null);
  const [isDownloadingWithMeta, setIsDownloadingWithMeta] = useState(false);
  const [isBriefExpanded, setIsBriefExpanded] = useState(false);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(
    item.images.length > 0 ? item.images.length - 1 : 0
  );
  const [isZoomed, setIsZoomed] = useState(false);

  // Sync activeVersionIndex when images array updates
  React.useEffect(() => {
    if (item.images.length > 0) {
      setActiveVersionIndex(item.images.length - 1);
    }
  }, [item.images.length]);

  const hasImage = item.images.length > 0;
  const activeImage: GeneratedImageVersion | undefined = item.images[activeVersionIndex];

  const isProcessing = Boolean(queueStatus?.isProcessing);
  const isQueued = Boolean(queueStatus?.isQueued);
  const queuePosition = queueStatus?.queuePosition || null;

  const promptVersions = item.promptVersions && item.promptVersions.length > 0
    ? item.promptVersions
    : [
        {
          version: 1,
          title: item.title,
          adobeStockTitle: item.adobeStockTitle,
          adobeStockDescription: item.adobeStockDescription,
          keywords: item.keywords,
          commercialBrief: item.commercialBrief,
          optimizedPrompt: item.optimizedPrompt,
          negativePrompt: item.negativePrompt,
          vectorStyle: item.vectorStyle,
          inputTokens: item.inputTokens,
          outputTokens: item.outputTokens,
          promptCostUsd: item.promptCostUsd,
          timestamp: item.createdAt,
        },
      ];

  const activePromptVersionIndex = typeof item.activePromptVersionIndex === 'number'
    ? Math.min(item.activePromptVersionIndex, promptVersions.length - 1)
    : promptVersions.length - 1;

  const activePromptVersion = promptVersions[activePromptVersionIndex] || promptVersions[0];
  const commercialBrief = activePromptVersion.commercialBrief || item.commercialBrief;

  // Active SEO Title, Description & Keywords
  const activeStockTitle = activePromptVersion.adobeStockTitle || item.adobeStockTitle || '';
  const activeStockDescription = activePromptVersion.adobeStockDescription || item.adobeStockDescription || '';
  const activeKeywords = (activePromptVersion.keywords || item.keywords || []) as string[];
  const hasSeoMetadata = Boolean(
    activeStockTitle.trim() &&
    Array.isArray(activeKeywords) &&
    activeKeywords.length > 0
  );

  const finalDescription = activeStockDescription.trim() ? activeStockDescription.trim() : activeStockTitle;
  const titleLength = activeStockTitle.length;
  const isTitleValidLength = titleLength <= 120;

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(activePromptVersion.optimizedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyTitle = async () => {
    if (!activeStockTitle) return;
    await navigator.clipboard.writeText(activeStockTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyDesc = async () => {
    const textToCopy = finalDescription;
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const handleCopyKeywordsComma = async () => {
    if (activeKeywords.length === 0) return;
    const commaSeparated = activeKeywords.join(', ');
    await navigator.clipboard.writeText(commaSeparated);
    setCopiedKeywordsComma(false);
    setTimeout(() => setCopiedKeywordsComma(false), 2000);
  };

  const handleCopySpecificVersion = async (text: string, vIdx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedVersionIdx(vIdx);
    setTimeout(() => setCopiedVersionIdx(null), 2000);
  };

  // Download with binary metadata injection and SEO Title naming
  const handleDownloadWithMetadata = async () => {
    if (!activeImage || !hasSeoMetadata) return;
    setIsDownloadingWithMeta(true);
    try {
      const downloadUrl = activeImage.dataUrl || (activeImage.imagePath ? (activeImage.imagePath.startsWith('/') ? activeImage.imagePath : `/${activeImage.imagePath}`) : '');
      const fileName = sanitizeSeoFileName(activeStockTitle || item.title);

      const { downloadSingleImage } = await import('../utils/downloadHelper');
      await downloadSingleImage(downloadUrl, fileName, {
        title: activeStockTitle,
        keywords: activeKeywords,
        description: finalDescription,
        author: contributorProfile?.includeAuthor ? (contributorProfile.authorName || undefined) : undefined,
        software: contributorProfile?.includeSoftware ? (contributorProfile.softwareName || undefined) : undefined,
        credit: contributorProfile?.includeCredit ? (contributorProfile.credit || undefined) : undefined,
        source: contributorProfile?.includeSource ? (contributorProfile.source || undefined) : undefined,
      });
    } finally {
      setTimeout(() => setIsDownloadingWithMeta(false), 800);
    }
  };

  const handleStandardDownload = async () => {
    if (!activeImage) return;
    const downloadUrl = activeImage.dataUrl || (activeImage.imagePath ? (activeImage.imagePath.startsWith('/') ? activeImage.imagePath : `/${activeImage.imagePath}`) : '');
    const seoTitle = activeStockTitle || item.title || item.rawIdea;
    const fileName = sanitizeSeoFileName(seoTitle);

    const { downloadSingleImage } = await import('../utils/downloadHelper');
    await downloadSingleImage(downloadUrl, fileName, {
      title: seoTitle,
      keywords: activeKeywords.length > 0 ? activeKeywords : undefined,
      description: finalDescription || seoTitle,
      author: contributorProfile?.includeAuthor ? (contributorProfile.authorName || undefined) : undefined,
      software: contributorProfile?.includeSoftware ? (contributorProfile.softwareName || undefined) : undefined,
      credit: contributorProfile?.includeCredit ? (contributorProfile.credit || undefined) : undefined,
      source: contributorProfile?.includeSource ? (contributorProfile.source || undefined) : undefined,
    });
  };

  const imageTariffUsd = PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD;
  const imageTariffIdr = imageTariffUsd * PRICING_CONFIG.USD_TO_IDR_RATE;
  const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
  const activeDirectionId = item.commercialDirection || activePromptVersion.commercialDirection;
  const directionObj = COMMERCIAL_DIRECTIONS.find((d) => d.id === activeDirectionId);
  const activeCompositionId = item.composition || activePromptVersion.composition;
  const compositionObj = resolveCompositionPreset(activeCompositionId);

  return (
    <div className={`bg-white border-2 transition-all overflow-hidden ${
      isProcessing
        ? 'border-amber-500 shadow-md ring-2 ring-amber-400'
        : isQueued
        ? 'border-indigo-400 shadow-sm'
        : 'border-stone-900 shadow-sm'
    }`}>
      {/* ==================================================================== */}
      {/* 1. TOP HEADER BAR: Card Index, Title, Style & DB Status             */}
      {/* ==================================================================== */}
      <div className="p-3.5 sm:p-4 border-b border-stone-300 bg-stone-50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="bg-stone-900 text-white text-xs font-mono font-bold px-2.5 py-0.5 tracking-wider">
            CARD #{index + 1}
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
            {item.vectorStyle || '2D Vector'}
          </span>
          {directionObj && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-200 text-stone-800 font-bold uppercase flex items-center gap-1 border border-stone-300">
              <Compass className="w-3 h-3 text-stone-600" />
              <span>{directionObj.label}</span>
            </span>
          )}
          {compositionObj && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-100 text-stone-700 font-bold uppercase flex items-center gap-1 border border-stone-300">
              <Layout className="w-3 h-3 text-stone-500" />
              <span>{compositionObj.name}</span>
              <span
                className={`text-[8px] font-mono uppercase px-1 py-0.2 font-bold ${
                  compositionObj.isIsolated
                    ? 'bg-stone-200 text-stone-700'
                    : 'bg-amber-300 text-stone-900'
                }`}
              >
                {compositionObj.isIsolated ? 'White BG' : 'Scene Context'}
              </span>
            </span>
          )}
          <span className="text-[11px] text-stone-500 font-sans hidden sm:inline">
            • {item.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Processing Badge */}
          {isProcessing && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-400 text-stone-900 font-bold flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-stone-900"></span>
              <span>SEDANG MEMPROSES...</span>
            </span>
          )}

          {/* Queued Waiting Badge */}
          {isQueued && !isProcessing && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold flex items-center gap-1">
              <Hourglass className="w-3 h-3 text-indigo-700 animate-spin" />
              <span>ANTREAN KE-#{queuePosition}</span>
            </span>
          )}

          {/* SQLite DB Status Badge */}
          <span className="text-[10px] font-mono px-2 py-0.5 border border-stone-300 bg-white text-emerald-800 flex items-center gap-1 font-bold">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>SQLite DB</span>
          </span>

          {/* Canvas & Mode Badge */}
          <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-200 text-stone-800 font-bold uppercase">
            {item.isBlackAndWhite ? 'B&W INK' : 'FLAT COLOR'} • 1:1
          </span>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(item.id)}
              className="p-1 border border-stone-300 hover:border-stone-900 text-stone-500 bg-white transition-colors cursor-pointer"
              title="Favoritkan Kartu Ini"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  item.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. DUA KOLOM: KIRI (PROMPT, SEO META & TOKEN) | KANAN (GAMBAR & TABEL)*/}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-300">
        {/* ------------------------------------------------------------------ */}
        {/* KOLOM KIRI: PROMPT, SEO METADATA & TOKEN (7 COLS)                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Active Prompt Box (Top Highlighted) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-stone-900 inline-block"></span>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono flex items-center gap-1.5">
                    <span>Prompt Terpilih:</span>
                    <span className="bg-stone-900 text-white text-[10px] px-1.5 py-0.2 font-mono">
                      v{activePromptVersion.version} AKTIF
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  {onRegeneratePrompt && (
                    <button
                      onClick={() => onRegeneratePrompt(item.id)}
                      disabled={isProcessing || isQueued}
                      title={isProcessing ? "Sedang diproses..." : isQueued ? "Sedang dalam antrean..." : "Generate variasi prompt baru (prompt lama tetap tersimpan di bawah)"}
                      aria-label="Generate AI Prompt Baru"
                      className="h-7 px-2 border border-stone-300 hover:border-stone-900 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer text-[11px] font-mono group"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          isProcessing ? 'animate-spin text-amber-600' : 'text-stone-600 group-hover:text-stone-900'
                        }`}
                      />
                      <span className="font-bold hidden sm:inline">+ Prompt Baru</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopyPrompt}
                    className="text-[10px] font-mono uppercase px-2.5 py-1 h-7 border border-stone-300 hover:border-stone-900 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-500" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Prompt Text Display */}
              <div className="p-3.5 bg-stone-900 text-stone-50 border-2 border-stone-900 font-mono text-xs leading-relaxed select-all shadow-xs">
                "{activePromptVersion.optimizedPrompt}"
              </div>
            </div>

            {/* ============================================================== */}
            {/* COMMERCIAL ART DIRECTOR & QUALITY GATE BRIEF                    */}
            {/* ============================================================== */}
            {commercialBrief && (
              <div className="p-3.5 bg-stone-50 border-2 border-stone-900 space-y-3 font-mono shadow-xs">
                {/* Header ribbon with Quality Gate decision badge */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-300">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-stone-900" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Commercial Art Director Brief
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {commercialBrief.decision === 'PASS' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                        <span>PASS (QUALITY GATE)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-200" />
                        <span>REWORK (&lt; 7.0)</span>
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-2 py-0.5 ${
                      Number(commercialBrief.scores?.overall || 0) >= 8.0
                        ? 'bg-emerald-700 text-white'
                        : Number(commercialBrief.scores?.overall || 0) >= 7.0
                        ? 'bg-stone-900 text-amber-300'
                        : 'bg-rose-700 text-white'
                    }`}>
                      SCORE: {commercialBrief.scores?.overall ? Number(commercialBrief.scores.overall).toFixed(2) : '8.86'}/10
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsBriefExpanded(!isBriefExpanded)}
                      className="text-[10px] px-1.5 py-0.5 border border-stone-400 hover:border-stone-900 bg-white text-stone-800 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                      title="Lihat detail strategi komersial dan risiko visual"
                    >
                      <span>{isBriefExpanded ? 'Tutup' : 'Detail'}</span>
                      {isBriefExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* REWORK Cost-Saving Advisory Banner & 1-Step Actionable Recommendation */}
                {commercialBrief.decision === 'REWORK' && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-300 text-rose-950 text-[11px] space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <div className="font-bold uppercase tracking-wider text-rose-900">
                          Art Director REWORK Recommendation:
                        </div>
                        <p className="text-rose-800 leading-relaxed font-sans text-xs">
                          "{commercialBrief.reworkInstruction || `Differentiate visual subject of "${item.rawIdea}", expand buyer utility versatility across media, and apply clear copy-space framing.`}"
                        </p>
                      </div>
                    </div>

                    {onRegeneratePrompt && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => onRegeneratePrompt(item.id, commercialBrief.reworkInstruction)}
                          disabled={isProcessing || isQueued}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-white" />
                          <span>⚡ Apply Art Director REWORK Recommendation (1-Click)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 6 Score Metrics Grid (Includes Buyer Utility) */}
                {commercialBrief.scores && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 pt-1 text-[10px]">
                    {/* 1. Commercial Usefulness */}
                    <div className="p-2 bg-white border border-stone-300 space-y-1">
                      <div className="text-stone-500 font-bold uppercase truncate" title="Commercial Usefulness">1. Commercial</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{Number(commercialBrief.scores.commercial).toFixed(1)}</span>
                        <div className="w-8 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${Number(commercialBrief.scores.commercial) >= 8.0 ? 'bg-emerald-600' : Number(commercialBrief.scores.commercial) >= 7.0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${(Number(commercialBrief.scores.commercial) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Buyer Utility & Versatility */}
                    <div className="p-2 bg-white border border-stone-300 space-y-1">
                      <div className="text-stone-500 font-bold uppercase truncate" title="Buyer Utility & Versatility">2. Utility</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{Number(commercialBrief.scores.buyerUtility || 8.4).toFixed(1)}</span>
                        <div className="w-8 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${Number(commercialBrief.scores.buyerUtility || 8.4) >= 8.0 ? 'bg-emerald-600' : Number(commercialBrief.scores.buyerUtility || 8.4) >= 7.0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${(Number(commercialBrief.scores.buyerUtility || 8.4) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Visual Uniqueness */}
                    <div className="p-2 bg-white border border-stone-300 space-y-1">
                      <div className="text-stone-500 font-bold uppercase truncate" title="Visual Uniqueness & Non-Redundancy">3. Uniqueness</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{Number(commercialBrief.scores.uniqueness).toFixed(1)}</span>
                        <div className="w-8 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${Number(commercialBrief.scores.uniqueness) >= 8.0 ? 'bg-indigo-600' : Number(commercialBrief.scores.uniqueness) >= 7.0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${(Number(commercialBrief.scores.uniqueness) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Searchability & Demand */}
                    <div className="p-2 bg-white border border-stone-300 space-y-1">
                      <div className="text-stone-500 font-bold uppercase truncate" title="Searchability & Market Demand">4. Search</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{Number(commercialBrief.scores.searchability).toFixed(1)}</span>
                        <div className="w-8 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${Number(commercialBrief.scores.searchability) >= 8.0 ? 'bg-amber-500' : Number(commercialBrief.scores.searchability) >= 7.0 ? 'bg-amber-600' : 'bg-rose-500'}`}
                            style={{ width: `${(Number(commercialBrief.scores.searchability) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Vector Suitability */}
                    <div className="p-2 bg-white border border-stone-300 space-y-1">
                      <div className="text-stone-500 font-bold uppercase truncate" title="Vector Autotrace Suitability">5. Vector Ready</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{Number(commercialBrief.scores.vectorSuitability).toFixed(1)}</span>
                        <div className="w-8 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${Number(commercialBrief.scores.vectorSuitability) >= 8.0 ? 'bg-emerald-600' : Number(commercialBrief.scores.vectorSuitability) >= 7.0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${(Number(commercialBrief.scores.vectorSuitability) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* 6. Visual Clarity */}
                    <div className="p-2 bg-white border border-stone-300 space-y-1">
                      <div className="text-stone-500 font-bold uppercase truncate" title="Visual Clarity & Readability">6. Clarity</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{Number(commercialBrief.scores.visualClarity || 9.0).toFixed(1)}</span>
                        <div className="w-8 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${Number(commercialBrief.scores.visualClarity || 9.0) >= 8.0 ? 'bg-purple-600' : Number(commercialBrief.scores.visualClarity || 9.0) >= 7.0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${(Number(commercialBrief.scores.visualClarity || 9.0) / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Market & Target Buyer Info + Concept Family */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 bg-white border border-stone-300 space-y-0.5">
                    <div className="text-stone-500 font-bold text-[10px] uppercase flex items-center gap-1">
                      <Target className="w-3 h-3 text-stone-700" />
                      <span>Target Buyer:</span>
                    </div>
                    <div className="text-stone-900 font-medium">{commercialBrief.targetBuyer}</div>
                  </div>

                  <div className="p-2 bg-white border border-stone-300 space-y-0.5">
                    <div className="text-stone-500 font-bold text-[10px] uppercase flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-stone-700" />
                      <span>Market Category &amp; Family:</span>
                    </div>
                    <div className="text-stone-900 font-medium flex items-center gap-1.5 flex-wrap">
                      <span>{commercialBrief.marketCategory}</span>
                      {commercialBrief.conceptFamily && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-900 px-1.5 py-0.2 font-bold border border-indigo-200">
                          {commercialBrief.conceptFamily}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Use cases pills */}
                {Array.isArray(commercialBrief.primaryUseCases) && commercialBrief.primaryUseCases.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase">Primary Use Cases:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {commercialBrief.primaryUseCases.map((uc, uIdx) => (
                        <span key={uIdx} className="text-[10px] px-2 py-0.5 bg-white border border-stone-300 text-stone-800">
                          🎯 {uc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expandable Strategic Deep Dive */}
                {isBriefExpanded && (
                  <div className="pt-2 border-t border-stone-300 space-y-2.5 text-[11px] bg-white p-3 border border-stone-200">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-600 uppercase flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-600" />
                        <span>Visual Hook &amp; Diferensiasi:</span>
                      </span>
                      <p className="text-stone-800 leading-relaxed text-[11px]">
                        <strong>Hook:</strong> {commercialBrief.visualHook}
                      </p>
                      <p className="text-stone-700 leading-relaxed text-[11px]">
                        <strong>Diferensiasi:</strong> {commercialBrief.differentiation}
                      </p>
                    </div>

                    <div className="space-y-1 pt-1.5 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-stone-600 uppercase flex items-center gap-1">
                        <Compass className="w-3 h-3 text-indigo-600" />
                        <span>Strategi Komposisi, Copy-Space &amp; Vektor:</span>
                      </span>
                      <p className="text-stone-800 text-[11px]">
                        <strong>Komposisi:</strong> {commercialBrief.compositionStrategy}
                      </p>
                      {commercialBrief.copySpaceStrategy && (
                        <p className="text-stone-800 text-[11px]">
                          <strong>Copy-Space:</strong> {commercialBrief.copySpaceStrategy}
                        </p>
                      )}
                      <p className="text-stone-700 text-[11px]">
                        <strong>Vector Tracing:</strong> {commercialBrief.vectorStrategy}
                      </p>
                    </div>

                    {Array.isArray(commercialBrief.risks) && commercialBrief.risks.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-stone-100">
                        <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Identifikasi Risiko &amp; Larangan:</span>
                        </span>
                        <ul className="list-disc list-inside text-stone-600 text-[10px] space-y-0.5">
                          {commercialBrief.risks.map((r, rIdx) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Negative Prompt */}
            {activePromptVersion.negativePrompt && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-600 font-bold uppercase tracking-wider">
                  <span>Negative Prompt (Pencegah Foto / 3D / Sprawl):</span>
                </div>
                <div className="p-2.5 bg-stone-100 border border-stone-300 text-stone-700 font-mono text-[11px] leading-snug select-all">
                  {activePromptVersion.negativePrompt}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* FITUR METADATA: ADOBE STOCK SEO TITLE & KEYWORDS               */}
            {/* ============================================================== */}
            {hasSeoMetadata ? (
              <div className="p-3.5 bg-amber-50/50 border-2 border-amber-300/80 space-y-3 shadow-2xs">
                {/* Author Info Bar */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-200 text-[11px] font-mono text-amber-950 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold uppercase">Author:</span>
                    <span className="bg-white px-2 py-0.5 border border-amber-300 font-bold text-stone-900">
                      {contributorProfile?.includeAuthor && contributorProfile.authorName?.trim() ? contributorProfile.authorName.trim() : '(Dikosongkan)'}
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-600">
                      Tool: <strong>{contributorProfile?.includeSoftware && contributorProfile.softwareName?.trim() ? contributorProfile.softwareName.trim() : '(Dikosongkan)'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onGenerateSeoMetadata && (
                      <button
                        type="button"
                        onClick={() => onGenerateSeoMetadata(item.id)}
                        disabled={isGeneratingSeo || isProcessing || isQueued}
                        className="text-[10px] text-amber-900 hover:text-stone-900 font-bold flex items-center gap-1 transition-colors cursor-pointer border border-amber-300 bg-white px-1.5 py-0.5 hover:bg-amber-100"
                        title="Re-generate SEO metadata kartu ini"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isGeneratingSeo ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingSeo ? 'Memproses...' : '🔄 Perbarui SEO'}</span>
                      </button>
                    )}

                    {onOpenProfileSettings && (
                      <button
                        type="button"
                        onClick={onOpenProfileSettings}
                        className="text-[10px] text-amber-900 hover:text-stone-900 underline font-bold transition-colors cursor-pointer"
                        title="Ubah nama author dan setting metadata kontributor"
                      >
                        Profil ⚙️
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. Adobe Stock Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-amber-950">
                        Adobe Stock SEO Title (English):
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 font-bold ${
                          isTitleValidLength
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {titleLength}/120 CHARS
                      </span>
                    </div>

                    <button
                      onClick={handleCopyTitle}
                      className="text-[10px] font-mono uppercase px-2 py-0.5 border border-amber-400 hover:border-amber-700 bg-white hover:bg-amber-100 text-amber-950 transition-colors flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedTitle ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-amber-700" />
                          <span>Salin Title</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 bg-white border border-amber-300 text-stone-900 font-mono text-xs font-medium select-all leading-relaxed">
                    {activeStockTitle}
                  </div>
                </div>

                {/* 2. Metadata Description / Caption */}
                <div className="space-y-1.5 pt-1 border-t border-amber-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-amber-950">
                        Metadata Description (English):
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 font-bold ${
                        activeStockDescription ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {activeStockDescription ? `${activeStockDescription.length} CHARS • CUSTOM` : 'SESUAI TITLE'}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyDesc}
                      className="text-[10px] font-mono uppercase px-2 py-0.5 border border-amber-400 hover:border-amber-700 bg-white hover:bg-amber-100 text-amber-950 transition-colors flex items-center gap-1 cursor-pointer font-bold"
                      title="Salin teks description yang disematkan ke IPTC/EXIF/XMP"
                    >
                      {copiedDesc ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-amber-700" />
                          <span>Salin Deskripsi</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 bg-white border border-amber-300 text-stone-800 font-mono text-xs font-medium select-all leading-relaxed">
                    {finalDescription}
                  </div>
                </div>

                {/* 3. Adobe Stock Keywords Cloud */}
                <div className="space-y-2 pt-1 border-t border-amber-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-amber-950">
                        Keywords Microstock:
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        {activeKeywords.length} TAGS • URUT PRIORITAS ADOBE
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopyKeywordsComma}
                        className="text-[10px] font-mono uppercase px-2 py-0.5 border border-amber-400 hover:border-amber-700 bg-white hover:bg-amber-100 text-amber-950 transition-colors flex items-center gap-1 cursor-pointer font-bold"
                        title="Salin semua keyword berurutan dipisahkan koma untuk form upload microstock"
                      >
                        {copiedKeywordsComma ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-amber-700" />
                            <span>Salin Koma</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Keywords Tag Cloud with Top 10 Importance Ranking Highlight */}
                  <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2 bg-white border border-amber-300">
                    {activeKeywords.map((tag, tIdx) => {
                      const isTop10 = tIdx < 10;
                      const isTier2 = tIdx >= 10 && tIdx < 20;
                      return (
                        <span
                          key={tIdx}
                          title={isTop10 ? `Rank #${tIdx + 1} (Tier 1: Strongest Search Intent)` : isTier2 ? `Rank #${tIdx + 1} (Tier 2: Components & Props)` : `Rank #${tIdx + 1}`}
                          className={`text-[10px] font-mono px-2 py-0.5 flex items-center gap-1 cursor-default select-all transition-colors ${
                            isTop10
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400 font-bold shadow-2xs'
                              : isTier2
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 font-medium'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          <span className={`text-[8px] font-bold ${isTop10 ? 'text-amber-800' : 'text-stone-400'}`}>
                            #{tIdx + 1}
                          </span>
                          <span>{tag}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-stone-500 pt-0.5">
                    <span className="flex items-center gap-1 text-amber-800 font-bold">
                      <span>🔥 #1–10: Strongest Buyer Search Intent</span>
                    </span>
                    <span>#11–20: Props • #21–30: Style • #31+: Themes</span>
                  </div>
                </div>
              </div>
            ) : (
              /* State Kosong (Mode Hemat Token): Banner Rapi + Tombol On-Demand Generator */
              <div className="p-3.5 bg-amber-50/40 border-2 border-dashed border-amber-300 space-y-2.5 shadow-2xs font-mono">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-200 text-[11px] text-amber-950 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold uppercase">Metadata SEO Adobe Stock (Hierarki Faktual &amp; Tags Berperingkat)</span>
                  </div>
                  <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 font-bold uppercase">
                    Belum Dibuat (Mode Hemat Token)
                  </span>
                </div>

                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Mode hemat token aktif. Generate Judul Faktual &amp; 25–40 Tags berperingkat (diurutkan berdasarkan bobot algoritma Adobe Stock) untuk kartu ini.
                </p>

                {onGenerateSeoMetadata && (
                  <button
                    type="button"
                    onClick={() => onGenerateSeoMetadata(item.id)}
                    disabled={isGeneratingSeo || isProcessing || isQueued}
                    className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-amber-300 border border-stone-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    {isGeneratingSeo ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                        <span>Menyusun Judul Faktual &amp; Ranked Keywords...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>⚡ Generate SEO Metadata (Title + Ranked Keywords) (~Rp 0,3)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Riwayat Timeline Versi Prompt (Scrollable Container) */}
            {promptVersions.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-600 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-stone-500" />
                    <span>Riwayat Generate Prompt ({promptVersions.length} Versi Tersimpan):</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal lowercase">
                    scroll untuk melihat semua
                  </span>
                </div>

                <div className="max-h-48 sm:max-h-52 overflow-y-auto space-y-2 p-2 border border-stone-300 bg-stone-50/70 rounded-none divide-y divide-stone-200">
                  {promptVersions.map((v, vIdx) => {
                    const isActive = vIdx === activePromptVersionIndex;
                    const timeStr = new Date(v.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <div
                        key={v.version}
                        className={`pt-2 first:pt-0 transition-all font-mono text-[11px] ${
                          isActive
                            ? 'opacity-100 bg-white p-2 border border-stone-900 shadow-xs'
                            : 'opacity-65 hover:opacity-100 bg-white/70 hover:bg-white p-2 border border-dashed border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 ${
                                isActive
                                  ? 'bg-stone-900 text-white'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              v{v.version} {isActive ? '(AKTIF)' : ''}
                            </span>
                            <span className="text-[10px] font-bold text-stone-800 truncate max-w-[180px] sm:max-w-[220px]">
                              {v.title || `Versi ${v.version}`}
                            </span>
                            <span className="text-[9px] text-stone-400">
                              • {timeStr}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {!isActive && onSelectPromptVersion && (
                              <button
                                onClick={() => onSelectPromptVersion(item.id, vIdx)}
                                className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 border border-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Jadikan versi ini sebagai prompt aktif terpilih"
                              >
                                <span>↺ Gunakan</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleCopySpecificVersion(v.optimizedPrompt, vIdx)}
                              className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-stone-50 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                              title="Salin teks prompt versi ini"
                            >
                              {copiedVersionIdx === vIdx ? (
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 text-stone-500" />
                              )}
                              <span>{copiedVersionIdx === vIdx ? 'Disalin' : 'Salin'}</span>
                            </button>
                          </div>
                        </div>

                        <p className={`text-[10px] leading-relaxed select-all line-clamp-2 ${
                          isActive ? 'text-stone-900' : 'text-stone-600'
                        }`}>
                          "{v.optimizedPrompt}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Token & Prompt Cost Bar */}
          <div className="pt-2">
            <div className="p-3 bg-stone-50 border border-stone-200 font-mono text-xs space-y-1">
              <div className="text-[10px] font-bold uppercase text-stone-500 border-b border-stone-200 pb-1 flex justify-between">
                <span>Rincian Token DeepSeek v4 Flash (v{activePromptVersion.version})</span>
                <span>Tarif: $0.14 in / $0.56 out per 1M</span>
              </div>
              <div className="flex justify-between text-stone-600 pt-0.5">
                <span>• Token Input: <strong className="text-stone-900">{activePromptVersion.inputTokens} tok</strong></span>
                <span>• Token Output: <strong className="text-stone-900">{activePromptVersion.outputTokens} tok</strong></span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-stone-200">
                <span className="font-bold text-stone-900 uppercase text-[11px]">
                  Biaya Riil Prompt Ini:
                </span>
                <div className="text-right">
                  <span className="font-bold text-sm text-stone-900">
                    {formatUsd(activePromptVersion.promptCostUsd, 6)}
                  </span>
                  <span className="text-[11px] text-stone-500 ml-1">
                    ({formatIdr(parseFloat(activePromptVersion.promptCostUsd) * PRICING_CONFIG.USD_TO_IDR_RATE)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* KOLOM KANAN: GAMBAR & TABEL BIAYA (5 COLS)                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-[#fafaf9] space-y-4 flex flex-col justify-between">
          {!hasImage ? (
            /* STATE A: BELUM GENERATE GAMBAR */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-300 pb-1.5">
                  <span className="text-xs font-bold uppercase font-mono tracking-wider text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-stone-700" />
                    <span>Visual 2D Siap Vektor (1:1)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-200 text-stone-700 font-bold">
                    BELUM DIBUAT
                  </span>
                </div>

                <div className="aspect-square w-full max-w-[280px] mx-auto border-2 border-dashed border-stone-300 bg-white flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <ImageIcon className="w-10 h-10 text-stone-300" />
                  <div className="font-mono text-xs font-bold text-stone-700 uppercase">
                    1:1 Square Microstock
                  </div>
                  <p className="font-mono text-[11px] text-stone-500">
                    Tarif render: <strong className="text-stone-900">+{formatUsd(imageTariffUsd, 4)} (~{formatIdr(imageTariffIdr)})</strong>
                  </p>
                </div>
              </div>

              {/* Action Button: Regular vs Processing vs Queued */}
              {isProcessing ? (
                <div className="w-full py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider bg-amber-500 text-stone-900 border-2 border-amber-600 shadow-xs flex items-center justify-center gap-2 animate-pulse">
                  <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent animate-spin inline-block"></span>
                  <span>MEMBUAT VISUAL 1:1...</span>
                </div>
              ) : isQueued ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-3 px-3 text-xs font-mono uppercase font-bold tracking-wider bg-indigo-50 text-indigo-900 border-2 border-indigo-400 flex items-center justify-center gap-2">
                    <Hourglass className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    <span>ANTREAN KE-#{queuePosition} (MENUNGGU)</span>
                  </div>
                  {onCancelQueueTask && (
                    <button
                      onClick={() => onCancelQueueTask(item.id)}
                      title="Batalkan dari antrean"
                      className="py-3 px-3 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 border-2 border-stone-300 hover:border-red-400 font-mono text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onGenerateImage(item.id)}
                  title="Klik untuk memasukkan ke antrean render gambar"
                  className="w-full py-3 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 bg-stone-900 text-white hover:bg-stone-800 border-2 border-stone-900 active:translate-y-[1px] cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-stone-300" />
                  <span>
                    GENERATE GAMBAR (CARD #{index + 1}) (+{formatUsd(imageTariffUsd, 4)})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              )}
            </div>
          ) : (
            /* STATE B: GAMBAR SUDAH DIGENERATE */
            <div className="space-y-4">
              {/* Version Switcher Bar */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-300 pb-2">
                <span className="text-xs font-bold font-mono uppercase text-stone-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-700" />
                  <span>Visual 1:1 (Versi v{activeImage?.version || 1}):</span>
                </span>
                <div className="flex items-center border border-stone-300 bg-white p-0.5 text-[10px] font-mono">
                  {item.images.map((img, vIdx) => (
                    <button
                      key={img.version}
                      type="button"
                      onClick={() => setActiveVersionIndex(vIdx)}
                      className={`px-2 py-0.5 font-bold transition-all cursor-pointer ${
                        vIdx === activeVersionIndex
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      v{img.version}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1:1 Canvas Preview */}
              <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-white border-2 border-stone-900 flex items-center justify-center overflow-hidden group">
                {activeImage ? (
                  <img
                    src={activeImage.dataUrl || `/${activeImage.imagePath}`}
                    alt={item.title}
                    className={`w-full h-full object-contain p-2 select-none transition-transform duration-200 ${
                      isZoomed ? 'scale-125' : 'scale-100'
                    }`}
                  />
                ) : null}

                {/* Badges on preview */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="bg-stone-900 text-white text-[9px] font-mono px-1.5 py-0.2 uppercase font-bold">
                    1:1
                  </span>
                  <span className="bg-white text-stone-900 border border-stone-900 text-[9px] font-mono px-1.5 py-0.2 uppercase font-bold">
                    v{activeImage?.version || 1}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-1 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 cursor-pointer"
                    title="Perbesar Preview"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* File Path Indicator */}
              <div className="bg-white border border-stone-200 p-2 font-mono text-[9px] text-stone-600 truncate select-all flex items-center gap-1">
                <Folder className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">
                  data/{activeImage?.imagePath || `outputs/${dateStr}/${sanitizeSeoFileName(activeStockTitle)}`}
                </span>
              </div>

              {/* TABEL RINCIAN BIAYA CARD INI */}
              <div className="border border-stone-300 font-mono text-[11px] bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-[9px] uppercase font-bold text-stone-600">
                      <th className="py-1.5 px-2.5">Komponen Card #{index + 1}</th>
                      <th className="py-1.5 px-2 text-center">Qty</th>
                      <th className="py-1.5 px-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    <tr>
                      <td className="py-1.5 px-2.5 text-stone-700">1. Prompt Expansion</td>
                      <td className="py-1.5 px-2 text-center text-stone-500">1x</td>
                      <td className="py-1.5 px-2.5 text-right text-stone-900 font-medium">
                        {formatUsd(item.promptCostUsd, 6)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 text-stone-700">2. Visual Render 1:1</td>
                      <td className="py-1.5 px-2 text-center font-bold text-stone-900">
                        {item.generationCount}x
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-medium text-stone-900">
                        {formatUsd(item.generationCount * imageTariffUsd, 4)}
                      </td>
                    </tr>
                    <tr className="bg-stone-900 text-white font-bold">
                      <td colSpan={2} className="py-1.5 px-2.5 uppercase text-[10px]">
                        TOTAL CARD #{index + 1}:
                      </td>
                      <td className="py-1.5 px-2.5 text-right text-xs">
                        <div>
                          {formatUsd(
                            parseFloat(item.promptCostUsd) + item.generationCount * imageTariffUsd,
                            6
                          )}
                        </div>
                        <div className="text-[9px] font-normal text-stone-300">
                          (~{formatIdr(
                            (parseFloat(item.promptCostUsd) + item.generationCount * imageTariffUsd) *
                              PRICING_CONFIG.USD_TO_IDR_RATE
                          )})
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ACTION BUTTONS: Download With Metadata SEO & Regenerate */}
              <div className="space-y-2 pt-1">
                {/* Primary Button: Download + Embed Metadata SEO */}
                <button
                  onClick={handleDownloadWithMetadata}
                  disabled={isDownloadingWithMeta}
                  className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-stone-950 border-2 border-stone-900 font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 active:translate-y-[1px] cursor-pointer shadow-2xs"
                  title="Download PNG dan sematkan Title & Keywords ke metadata binary chunk (IPTC/XMP) otomatis"
                >
                  {isDownloadingWithMeta ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent animate-spin inline-block"></span>
                      <span>MENYEMATKAN METADATA...</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-3.5 h-3.5 text-stone-950" />
                      <span>DOWNLOAD PNG + SEMATKAN METADATA SEO</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleStandardDownload}
                    className="py-2 px-3 bg-white hover:bg-stone-100 text-stone-900 border-2 border-stone-900 font-mono text-[11px] uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5 active:translate-y-[1px] cursor-pointer"
                    title="Download PNG dengan nama file SEO"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD PNG</span>
                  </button>

                  {isProcessing ? (
                    <div className="py-2 px-3 bg-amber-500 text-stone-900 border-2 border-amber-600 font-mono text-[11px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                      <span className="w-3 h-3 border-2 border-stone-900 border-t-transparent animate-spin inline-block"></span>
                      <span>RENDER...</span>
                    </div>
                  ) : isQueued ? (
                    <div className="flex items-center gap-1">
                      <div className="flex-1 py-2 px-2 bg-indigo-50 text-indigo-900 border-2 border-indigo-400 font-mono text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                        <Hourglass className="w-3 h-3 text-indigo-600 animate-spin" />
                        <span>ANTREAN #{queuePosition}</span>
                      </div>
                      {onCancelQueueTask && (
                        <button
                          onClick={() => onCancelQueueTask(item.id)}
                          title="Batalkan dari antrean"
                          className="p-2 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 border-2 border-stone-300 hover:border-red-400 font-mono transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onRegenerateImage(item.id)}
                      title="Render versi baru (+ $0.020)"
                      className="py-2 px-3 text-[11px] font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 bg-stone-900 text-white hover:bg-stone-800 border-2 border-stone-900 active:translate-y-[1px] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>REGENERATE (+{formatUsd(imageTariffUsd, 4)})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Loading Bar Kecil di Bawah Card dengan Hitungan 0-100% */}
      <CardLoadingBar
        isLoading={isProcessing}
        label={
          queueStatus?.taskType === 'regenerate-prompt'
            ? `MEREGENERASI PROMPT VARIATION #${index + 1}...`
            : `RENDERING GAMBAR 2D VECTOR CARD #${index + 1}...`
        }
        completedLabel={`CARD #${index + 1} SELESAI DIPROSES!`}
        estimatedDurationMs={queueStatus?.taskType === 'regenerate-prompt' ? 3500 : 20000}
        colorScheme="amber"
      />
    </div>
  );
};
