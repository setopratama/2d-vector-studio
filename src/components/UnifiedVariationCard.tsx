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
} from 'lucide-react';
import { formatUsd, formatIdr, PRICING_CONFIG } from '../utils/costCalculator';
import { CardLoadingBar } from './CardLoadingBar';
import { sanitizeSeoFileName } from '../utils/pngMetadataHelper';
import { ContributorProfile } from '../hooks/useContributorProfile';

interface UnifiedVariationCardProps {
  item: PromptItem;
  index: number;
  contributorProfile?: ContributorProfile;
  onOpenProfileSettings?: () => void;
  onGenerateImage: (promptId: string) => void;
  onRegenerateImage: (promptId: string) => void;
  onRegeneratePrompt?: (promptId: string) => void;
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
          keywords: item.keywords,
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

  // Active SEO Title & Keywords
  const activeStockTitle = activePromptVersion.adobeStockTitle || item.adobeStockTitle || '';
  const activeKeywords = (activePromptVersion.keywords || item.keywords || []) as string[];
  const hasSeoMetadata = Boolean(
    activeStockTitle.trim() &&
    Array.isArray(activeKeywords) &&
    activeKeywords.length > 0
  );

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
    if (!activeStockTitle) return;
    await navigator.clipboard.writeText(activeStockTitle);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const handleCopyKeywordsComma = async () => {
    if (activeKeywords.length === 0) return;
    const commaSeparated = activeKeywords.join(', ');
    await navigator.clipboard.writeText(commaSeparated);
    setCopiedKeywordsComma(true);
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
        description: activeStockTitle,
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
      description: seoTitle,
      author: contributorProfile?.includeAuthor ? (contributorProfile.authorName || undefined) : undefined,
      software: contributorProfile?.includeSoftware ? (contributorProfile.softwareName || undefined) : undefined,
      credit: contributorProfile?.includeCredit ? (contributorProfile.credit || undefined) : undefined,
      source: contributorProfile?.includeSource ? (contributorProfile.source || undefined) : undefined,
    });
  };

  const imageTariffUsd = PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD;
  const imageTariffIdr = imageTariffUsd * PRICING_CONFIG.USD_TO_IDR_RATE;
  const dateStr = new Date(item.createdAt).toISOString().split('T')[0];

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
        <div className="flex items-center gap-2.5">
          <span className="bg-stone-900 text-white text-xs font-mono font-bold px-2.5 py-0.5 tracking-wider">
            CARD #{index + 1}
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
            {item.vectorStyle || '2D Vector'}
          </span>
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
                      <span className="text-[10px] font-mono px-1.5 py-0.2 font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        SESUAI TITLE
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
                    {activeStockTitle}
                  </div>
                </div>

                {/* 3. Adobe Stock Keywords Cloud */}
                <div className="space-y-2 pt-1 border-t border-amber-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-amber-950">
                        Keywords Microstock:
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 font-bold bg-amber-200 text-amber-900">
                        {activeKeywords.length} TAGS • MAX 2 KATA
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopyKeywordsComma}
                        className="text-[10px] font-mono uppercase px-2 py-0.5 border border-amber-400 hover:border-amber-700 bg-white hover:bg-amber-100 text-amber-950 transition-colors flex items-center gap-1 cursor-pointer font-bold"
                        title="Salin semua keyword dipisahkan koma untuk form upload microstock"
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

                  {/* Keywords Tag Cloud */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white border border-amber-300">
                    {activeKeywords.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 bg-stone-100 hover:bg-amber-100 text-stone-800 border border-stone-200 rounded-none cursor-default select-all"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* State Kosong (Mode Hemat Token): Banner Rapi + Tombol On-Demand Generator */
              <div className="p-3.5 bg-amber-50/40 border-2 border-dashed border-amber-300 space-y-2.5 shadow-2xs font-mono">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-200 text-[11px] text-amber-950 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold uppercase">Metadata SEO Adobe Stock &amp; Tags Microstock</span>
                  </div>
                  <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 font-bold uppercase">
                    Belum Dibuat (Mode Hemat Token)
                  </span>
                </div>

                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Mode hemat token aktif. Generate Judul SEO (≤120 kark) &amp; 30–48 Tags Microstock khusus kartu ini saat Anda membutuhkannya.
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
                        <span>Membuat Judul SEO &amp; 48 Tags...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>⚡ Generate SEO Metadata (Title + 48 Tags) (~Rp 0,3)</span>
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
