import React, { useState } from 'react';
import { PromptItem, TargetEngine } from '../types/prompt';
import { STYLE_PRESETS, SAMPLE_IDEAS, COMMERCIAL_DIRECTIONS, COMPOSITION_PRESETS } from '../data/presets';
import { PRICING_CONFIG, formatUsd, formatIdr, estimateTextTokens } from '../utils/costCalculator';
import { useAutoRunner, RunnerStatus, RunnerPhase } from '../hooks/useAutoRunner';
import {
  X,
  Sparkles,
  Zap,
  Play,
  Pause,
  Square,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  Layers,
  Clock,
  Coins,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Image as ImageIcon,
  Compass,
  Layout
} from 'lucide-react';

import { ContributorProfile } from '../hooks/useContributorProfile';
import { sanitizeSeoFileName } from '../utils/pngMetadataHelper';

interface AutoRunnerWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  usdToIdrRate?: number;
  contributorProfile?: ContributorProfile;
  onItemsGenerated?: (items: PromptItem[]) => void;
}

export const AutoRunnerWizardModal: React.FC<AutoRunnerWizardModalProps> = ({
  isOpen,
  onClose,
  usdToIdrRate = 16000,
  contributorProfile,
  onItemsGenerated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rawIdea, setRawIdea] = useState('maskot rubah mekanik');
  const [selectedPreset, setSelectedPreset] = useState('flat-vector');
  const [selectedCommercialDirection, setSelectedCommercialDirection] = useState('evergreen-utility');
  const [selectedComposition, setSelectedComposition] = useState('isolated-object');
  const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [targetQuantity, setTargetQuantity] = useState<number>(10);
  const [qualityGateEnabled, setQualityGateEnabled] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
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
  } = useAutoRunner();

  if (!isOpen) return null;

  // Cost calculations for Step 2
  const userTok = estimateTextTokens(rawIdea);
  const baseSysTokens = includeMetadata ? PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS + 40 : PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS;
  const estPromptInputTok = (baseSysTokens + userTok) * targetQuantity;
  const estPromptOutputTok = (includeMetadata ? 200 : 60) * targetQuantity;
  const estPromptCostUsd = (
    estPromptInputTok * PRICING_CONFIG.PROMPT_INPUT_PER_TOKEN_USD +
    estPromptOutputTok * PRICING_CONFIG.PROMPT_OUTPUT_PER_TOKEN_USD
  );
  const estImageCostUsd = targetQuantity * PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD;
  const estTotalCostUsd = estPromptCostUsd + estImageCostUsd;
  const estTotalCostIdr = estTotalCostUsd * usdToIdrRate;

  // Selected preset object
  const presetObj = STYLE_PRESETS.find((p) => p.id === selectedPreset) || STYLE_PRESETS[0];

  const handleStart = () => {
    setStep(3);
    startRunner({
      rawIdea,
      selectedPreset,
      commercialDirection: selectedCommercialDirection,
      composition: selectedComposition,
      isBlackAndWhite,
      includeMetadata,
      targetQuantity,
      qualityGateEnabled,
      selectedEngine: 'gpt-image',
      onItemComplete: (item) => {
        if (onItemsGenerated) {
          onItemsGenerated([item]);
        }
      },
    });
  };

  const handleClose = () => {
    if (status === 'running') {
      if (!window.confirm('Auto-Runner sedang berjalan. Ingin menghentikan dan menutup wizard?')) {
        return;
      }
      stopRunner();
    }
    onClose();
  };

  const handleDownloadAll = async () => {
    const itemsWithImages = generatedItems.filter((p) => p.images.length > 0);
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
          author: contributorProfile?.includeAuthor ? (contributorProfile.authorName || undefined) : undefined,
          software: contributorProfile?.includeSoftware ? (contributorProfile.softwareName || undefined) : undefined,
          credit: contributorProfile?.includeCredit ? (contributorProfile.credit || undefined) : undefined,
          source: contributorProfile?.includeSource ? (contributorProfile.source || undefined) : undefined,
        },
      };
    }).filter((d) => Boolean(d.url));

    const { downloadMultipleImagesSequentially } = await import('../utils/downloadHelper');
    await downloadMultipleImagesSequentially(downloadList, 400);
  };

  const handleDownloadSingleItem = async (item: PromptItem) => {
    const activeImg = item.images[0];
    if (!activeImg) return;
    const seoTitle = item.adobeStockTitle || item.title;
    const fileName = sanitizeSeoFileName(seoTitle);
    const url = activeImg.dataUrl || (activeImg.imagePath ? (activeImg.imagePath.startsWith('/') ? activeImg.imagePath : `/${activeImg.imagePath}`) : '');

    const { downloadSingleImage } = await import('../utils/downloadHelper');
    await downloadSingleImage(url, fileName, {
      title: seoTitle,
      keywords: item.keywords || [],
      description: seoTitle,
      author: contributorProfile?.includeAuthor ? (contributorProfile.authorName || undefined) : undefined,
      software: contributorProfile?.includeSoftware ? (contributorProfile.softwareName || undefined) : undefined,
      credit: contributorProfile?.includeCredit ? (contributorProfile.credit || undefined) : undefined,
      source: contributorProfile?.includeSource ? (contributorProfile.source || undefined) : undefined,
    });
  };

  const copyPromptText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const percentComplete = totalTarget > 0 ? Math.round((currentIndex / totalTarget) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border-2 border-stone-900 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-900 text-white px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
                  Auto-Runner Wizard (Batch Pipeline)
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-400 text-stone-900 font-bold uppercase">
                  Sequential Loop
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-mono">
                1 Keyword → Generate Prompt &amp; Render Gambar Otomatis Item per Item (Pilihan Kelipatan 10)
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50 text-xs font-mono shrink-0">
          <div
            className={`p-2.5 text-center border-r border-stone-200 transition-colors ${
              step === 1
                ? 'bg-white text-stone-900 font-bold border-b-2 border-b-stone-900'
                : 'text-stone-400'
            }`}
          >
            1. Ide & Gaya Visual
          </div>
          <div
            className={`p-2.5 text-center border-r border-stone-200 transition-colors ${
              step === 2
                ? 'bg-white text-stone-900 font-bold border-b-2 border-b-stone-900'
                : 'text-stone-400'
            }`}
          >
            2. Kuantitas (Kelipatan 10) & Biaya
          </div>
          <div
            className={`p-2.5 text-center transition-colors ${
              step === 3
                ? 'bg-white text-stone-900 font-bold border-b-2 border-b-stone-900'
                : 'text-stone-400'
            }`}
          >
            3. Live Auto-Runner
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* =============================================================== */}
          {/* STEP 1: SETUP IDE, PRESET & BLACK/WHITE                         */}
          {/* =============================================================== */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Keyword Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                  1. Masukkan 1 Ide / Keyword Subjek
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={rawIdea}
                    onChange={(e) => setRawIdea(e.target.value)}
                    placeholder="Contoh: maskot rubah mekanik, vintage coffee emblem, burung hantu steampunk..."
                    className="w-full bg-stone-50 border border-stone-300 p-3 text-sm font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                  />
                  {rawIdea && (
                    <button
                      onClick={() => setRawIdea('')}
                      className="absolute right-2.5 top-2.5 text-[10px] uppercase font-mono text-stone-400 hover:text-stone-700 px-1.5 py-0.5 border border-stone-200 bg-white"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Quick Samples */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-mono text-stone-400">Contoh Cepat:</span>
                  {SAMPLE_IDEAS.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setRawIdea(idea)}
                      className="text-[10px] font-mono px-2 py-0.5 border border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors"
                    >
                      + {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commercial Direction Pillar Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-stone-900" />
                    <span>2. Pilih Commercial Direction (Pilar Pasar Microstock 2026)</span>
                  </label>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    Decision-First Engine
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {COMMERCIAL_DIRECTIONS.map((dir) => {
                    const isSelected = selectedCommercialDirection === dir.id;
                    return (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => setSelectedCommercialDirection(dir.id)}
                        className={`p-2.5 text-left border transition-all text-xs font-mono flex flex-col justify-between ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm ring-2 ring-stone-900'
                            : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div className="font-bold text-[11px] truncate">{dir.label}</div>
                        <div
                          className={`text-[9px] mt-1 line-clamp-2 ${
                            isSelected ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          {dir.tagline}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vector Style Presets Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                  3. Pilih Gaya Grafis 2D Siap Vektor (Terkunci 100% Konsisten)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {STYLE_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`p-3 text-left border transition-all text-xs font-mono flex flex-col justify-between ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm ring-2 ring-stone-900'
                            : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center justify-between">
                            <span>{preset.name}</span>
                            <span
                              className={`text-[9px] uppercase px-1 py-0.2 ${
                                isSelected ? 'bg-stone-800 text-amber-300' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {preset.category}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] font-sans mt-1 leading-snug ${
                              isSelected ? 'text-stone-300' : 'text-stone-500'
                            }`}
                          >
                            {preset.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Composition Strategy Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 font-mono flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-stone-900" />
                    <span>4. Pilih Composition Strategy (Penataan Ruang Visual)</span>
                  </label>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    Isolated vs Contextual Scene
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {COMPOSITION_PRESETS.map((comp) => {
                    const isSelected = selectedComposition === comp.id || (selectedComposition === 'single-isolated' && comp.id === 'isolated-object');
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setSelectedComposition(comp.id)}
                        className={`p-2.5 text-left border transition-all text-xs font-mono flex flex-col justify-between ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900 shadow-sm'
                            : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="font-bold text-[11px] truncate">{comp.name}</div>
                          <span
                            className={`text-[8px] font-mono uppercase px-1 py-0.2 font-bold ${
                              comp.isIsolated
                                ? isSelected
                                  ? 'bg-stone-800 text-emerald-300'
                                  : 'bg-stone-200 text-stone-600'
                                : isSelected
                                ? 'bg-amber-400 text-stone-950'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {comp.isIsolated ? 'White BG' : 'Scene'}
                          </span>
                        </div>
                        <div
                          className={`text-[9px] line-clamp-2 ${
                            isSelected ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          {comp.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Hitam Putih (B&W) */}
              <div
                onClick={() => setIsBlackAndWhite(!isBlackAndWhite)}
                className={`border p-3.5 cursor-pointer transition-all select-none flex items-start gap-3 ${
                  isBlackAndWhite
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-800 border-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isBlackAndWhite ? (
                    <CheckSquare className="w-4 h-4 text-white" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      Mode Hitam Putih (B&W Monochrome Vector)
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 font-bold ${
                        isBlackAndWhite ? 'bg-white text-stone-900' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      Zero Color • Pure Ink
                    </span>
                  </div>
                  <p className={`text-[11px] ${isBlackAndWhite ? 'text-stone-300' : 'text-stone-500'}`}>
                    Tinta hitam pekat di atas putih murni tanpa bayangan abu-abu (paling mudah ditracing ke kurva SVG tunggal).
                  </p>
                </div>
              </div>

              {/* Checklist Pembuatan Metadata SEO (Default Non-Aktif) */}
              <div
                onClick={() => setIncludeMetadata(!includeMetadata)}
                className={`border p-3.5 cursor-pointer transition-all select-none flex items-start gap-3 ${
                  includeMetadata
                    ? 'bg-amber-950/20 text-stone-900 border-amber-400'
                    : 'bg-stone-50 text-stone-800 border-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {includeMetadata ? (
                    <CheckSquare className="w-4 h-4 text-amber-800" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      Buat Sekaligus Metadata (Title & Keywords)
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 font-bold ${
                        includeMetadata ? 'bg-amber-200 text-amber-950 border border-amber-300' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {includeMetadata ? 'Aktif (+SEO Tags)' : 'Non-Aktif (Hemat Token)'}
                    </span>
                  </div>
                  <p className={`text-[11px] ${includeMetadata ? 'text-amber-900' : 'text-stone-500'}`}>
                    {includeMetadata
                      ? 'Membuat Judul SEO Adobe Stock & 25–45 keywords tags microstock (~200 tokens output/item).'
                      : 'Hanya membuat prompt visual 2D murni (~60 tokens output/item). Lebih cepat & hemat biaya kuota LLM.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 2: KUANTITAS & ESTIMASI BIAYA TRANSPARAN                   */}
          {/* =============================================================== */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="bg-stone-50 border border-stone-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-stone-600" />
                    <span>Tentukan Jumlah Generate Otomatis (Kelipatan 10 / Bebas)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={targetQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setTargetQuantity(Math.max(1, Math.min(100, val)));
                      }}
                      className="w-16 bg-white border border-stone-400 text-center font-mono font-bold text-sm text-stone-900 p-1 focus:outline-none focus:border-stone-900"
                    />
                    <span className="text-xs font-mono text-stone-600 font-bold">Gambar</span>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(parseInt(e.target.value, 10))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>1</span>
                    <span>10</span>
                    <span>30</span>
                    <span>50</span>
                    <span>70</span>
                    <span>100 Max</span>
                  </div>
                </div>

                {/* Quick Multiples of 10 Buttons */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-stone-700">
                    <span className="uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-400 inline-block"></span>
                      Pilihan Cepat Kelipatan 10:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTargetQuantity((prev) => Math.max(1, prev - 10))}
                        className="px-2 py-0.5 text-[10px] border border-stone-300 bg-white hover:border-stone-900 text-stone-700"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetQuantity((prev) => Math.min(100, prev + 10))}
                        className="px-2 py-0.5 text-[10px] border border-stone-300 bg-white hover:border-stone-900 text-stone-700 font-bold"
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 font-mono">
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setTargetQuantity(count)}
                        className={`py-1.5 text-xs font-bold border transition-all text-center ${
                          targetQuantity === count
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-600'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Small Batch Options */}
                <div className="flex items-center gap-2 pt-1 border-t border-stone-200 text-[11px] font-mono text-stone-500">
                  <span>Batch Kecil:</span>
                  {[3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTargetQuantity(count)}
                      className={`px-2 py-0.5 border text-xs ${
                        targetQuantity === count
                          ? 'bg-stone-900 text-white border-stone-900 font-bold'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-500'
                      }`}
                    >
                      {count} Item
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary of Configuration */}
              <div className="p-3.5 border border-stone-200 bg-white text-xs font-mono space-y-1">
                <div className="font-bold text-stone-900 uppercase">Ringkasan Konfigurasi:</div>
                <div className="text-stone-600">
                  • Subjek: <span className="text-stone-900 font-semibold">"{rawIdea}"</span>
                </div>
                <div className="text-stone-600">
                  • Gaya: <span className="text-stone-900 font-semibold">{presetObj.name}</span> (1:1 Square Canvas)
                </div>
                <div className="text-stone-600">
                  • Mode Warna: <span className="text-stone-900 font-semibold">{isBlackAndWhite ? 'Hitam Putih (Pure B&W)' : 'Flat Color Blocking'}</span>
                </div>
              </div>

              {/* Commercial Quality Gate Toggle Card */}
              <div
                onClick={() => setQualityGateEnabled(!qualityGateEnabled)}
                className={`border p-3.5 cursor-pointer transition-all select-none flex items-start gap-3 ${
                  qualityGateEnabled
                    ? 'bg-emerald-50 text-stone-900 border-emerald-500 ring-1 ring-emerald-400'
                    : 'bg-stone-50 text-stone-800 border-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {qualityGateEnabled ? (
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-950">
                      Commercial Quality Gate (Hemat Biaya Render)
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 font-bold ${
                        qualityGateEnabled ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {qualityGateEnabled ? 'Proteksi Aktif' : 'Non-Aktif'}
                    </span>
                  </div>
                  <p className={`text-[11px] ${qualityGateEnabled ? 'text-emerald-900' : 'text-stone-500'}`}>
                    {qualityGateEnabled
                      ? 'Otomatis melewati (skip) render gambar ($0.020 / ~Rp 320) jika konsep AI mendapat skor < 7.0 (REWORK). Mencegah pemborosan kuota pada aset yang kurang layak jual.'
                      : 'Merender gambar untuk semua konsep tanpa memedulikan skor evaluasi komersial.'}
                  </p>
                </div>
              </div>

              {/* Transparent Cost Breakdown Table */}
              <div className="border border-stone-300 bg-stone-50 p-4 space-y-3 font-mono">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase border-b border-stone-200 pb-2">
                  <Coins className="w-4 h-4 text-stone-700" />
                  <span>Pra-Estimasi Biaya Transparan ({targetQuantity} Item)</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-700">
                    <span>1. Prompt Expansion DeepSeek v4 ({targetQuantity} prompt):</span>
                    <span className="font-bold">{formatUsd(estPromptCostUsd, 6)} ({formatIdr(estPromptCostUsd * usdToIdrRate)})</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-700">
                    <span>2. Image Generation GPT Image 2.5 ({targetQuantity} visual 1:1 @ $0.020):</span>
                    <span className="font-bold">{formatUsd(estImageCostUsd, 4)} ({formatIdr(estImageCostUsd * usdToIdrRate)})</span>
                  </div>

                  <div className="pt-2 border-t border-stone-300 flex justify-between items-center text-sm font-bold text-stone-900">
                    <span>TOTAL ESTIMASI INVESTASI:</span>
                    <span className="text-emerald-700">
                      {formatUsd(estTotalCostUsd, 4)} <span className="text-xs font-normal">({formatIdr(estTotalCostIdr)})</span>
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-stone-500 italic pt-1">
                  * Sistem akan mengeksekusi secara otomatis 1 per 1 (Prompt → Render → Simpan DB) dan biaya riil akan dihitung berdasarkan token aktual.
                </p>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 3: LIVE AUTO-RUNNER DASHBOARD                              */}
          {/* =============================================================== */}
          {step === 3 && (
            <div className="space-y-5 font-mono">
              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-500 text-red-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Live Status & Progress Box */}
              <div className="bg-stone-900 text-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        status === 'running'
                          ? 'bg-emerald-400 animate-pulse'
                          : status === 'paused'
                          ? 'bg-amber-400'
                          : status === 'completed'
                          ? 'bg-emerald-400'
                          : 'bg-red-400'
                      }`}
                    ></span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Status: {status.toUpperCase()}
                    </span>
                  </div>

                  {/* Active Phase Pill */}
                  <div className="text-[11px] px-2 py-0.5 bg-stone-800 border border-stone-700 text-stone-300">
                    {currentPhase === 'generating-prompt' && (
                      <span className="text-amber-300">⚡ Menulis Prompt AI #{currentIndex}...</span>
                    )}
                    {currentPhase === 'rendering-image' && (
                      <span className="text-emerald-300">🎨 Merender Gambar 1:1 #{currentIndex}...</span>
                    )}
                    {currentPhase === 'saving' && (
                      <span className="text-blue-300">💾 Menyimpan ke SQLite #{currentIndex}...</span>
                    )}
                    {currentPhase === 'idle' && status === 'completed' && (
                      <span className="text-emerald-400">🎉 Selesai Semua {totalTarget} Item!</span>
                    )}
                    {currentPhase === 'idle' && status === 'paused' && (
                      <span className="text-amber-400">⏸️ Auto-Runner Dijeda</span>
                    )}
                    {currentPhase === 'idle' && status === 'stopped' && (
                      <span className="text-red-400">🛑 Auto-Runner Dihentikan</span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-300">
                    <span>Progres: {currentIndex} dari {totalTarget} Item</span>
                    <span className="font-bold">{percentComplete}%</span>
                  </div>
                  <div className="w-full bg-stone-800 h-3 border border-stone-700 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${percentComplete}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-stone-800">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Akumulasi Biaya Riil:</span>
                    <span className="font-bold text-white">
                      {formatUsd(accumulatedCostUsd, 4)} ({formatIdr(accumulatedCostUsd * usdToIdrRate)})
                    </span>
                  </div>

                  {/* Runner Control Buttons */}
                  <div className="flex items-center gap-2">
                    {status === 'running' && (
                      <button
                        onClick={pauseRunner}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-amber-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Pause className="w-3 h-3" />
                        <span>Jeda</span>
                      </button>
                    )}

                    {status === 'paused' && (
                      <button
                        onClick={resumeRunner}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>Lanjutkan</span>
                      </button>
                    )}

                    {(status === 'running' || status === 'paused') && (
                      <button
                        onClick={stopRunner}
                        className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-white text-xs flex items-center gap-1 transition-colors"
                      >
                        <Square className="w-3 h-3" />
                        <span>Berhenti</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Completion Banner & Download Action */}
              {status === 'completed' && (
                <div className="p-4 bg-emerald-50 border border-emerald-500 text-emerald-900 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold uppercase">Proses Batch Auto-Runner Sukses!</div>
                      <div className="text-[11px] text-emerald-700">
                        {generatedItems.length} gambar 2D siap-vektor telah disimpan ke database SQLite dan folder outputs.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadAll}
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Semua ({generatedItems.length} PNG)</span>
                  </button>
                </div>
              )}

              {/* Live Generated Items Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase text-stone-700">
                    Hasil Visual yang Sudah Selesai ({generatedItems.length} Item):
                  </div>
                  {generatedItems.length > 0 && status !== 'completed' && (
                    <button
                      onClick={handleDownloadAll}
                      className="text-[11px] text-stone-600 hover:text-stone-900 underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Parsial ({generatedItems.length})</span>
                    </button>
                  )}
                </div>

                {generatedItems.length === 0 ? (
                  <div className="p-8 border border-dashed border-stone-300 text-center text-stone-400 text-xs">
                    {status === 'running'
                      ? 'Sedang memproses item pertama... Gambar akan otomatis muncul di sini begitu selesai.'
                      : 'Belum ada item yang digenerate.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 border border-stone-200 bg-stone-50">
                    {generatedItems.map((item) => {
                      const img = item.images[0];
                      const seoTitle = item.adobeStockTitle || item.title;
                      const keywordCount = item.keywords?.length || 0;
                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-stone-200 p-2 space-y-1.5 shadow-2xs group relative flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            {/* Image Box */}
                            <div className="aspect-square bg-stone-50 border border-stone-100 flex items-center justify-center overflow-hidden relative">
                              {img?.dataUrl ? (
                                <img
                                  src={img.dataUrl}
                                  alt={seoTitle}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-stone-300" />
                              )}
                              {keywordCount > 0 && (
                                <span className="absolute bottom-1 right-1 bg-stone-900/80 text-white text-[8px] font-mono px-1 py-0.2 rounded-xs">
                                  {keywordCount} tags
                                </span>
                              )}
                            </div>

                            {/* Title & Style */}
                            <div className="text-[10px] leading-tight font-bold text-stone-800 line-clamp-2" title={seoTitle}>
                              {seoTitle}
                            </div>
                            <div className="text-[9px] text-stone-400 truncate">
                              {item.vectorStyle}
                            </div>
                          </div>

                          {/* Actions: Download with Metadata & Copy Prompt */}
                          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleItem(item)}
                              title="Download PNG dengan metadata IPTC/EXIF/XMP"
                              className="text-[9px] py-1 px-1 border border-stone-200 hover:border-stone-900 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                            >
                              <Download className="w-2.5 h-2.5" />
                              <span>PNG</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => copyPromptText(item.id, item.optimizedPrompt)}
                              className="text-[9px] py-1 px-1 border border-stone-200 hover:border-stone-900 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                  <span className="text-emerald-700">OK</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Prompt</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="border-t border-stone-200 bg-stone-50 px-5 py-3.5 flex items-center justify-between shrink-0 font-mono text-xs">
          <div>
            {step === 1 && (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 border border-stone-300 text-stone-600 hover:text-stone-900 transition-colors uppercase font-bold"
              >
                Batal
              </button>
            )}
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:border-stone-900 transition-colors flex items-center gap-1 uppercase font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            )}
            {step === 3 && (
              <button
                onClick={() => {
                  if (status === 'completed' || status === 'stopped') {
                    resetRunner();
                    setStep(1);
                  }
                }}
                disabled={status === 'running'}
                className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:border-stone-900 disabled:opacity-40 transition-colors uppercase font-bold"
              >
                Buat Batch Baru
              </button>
            )}
          </div>

          <div>
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                disabled={!rawIdea.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider disabled:opacity-40 flex items-center gap-1.5 transition-colors"
              >
                <span>Lanjut: Tentukan Kuantitas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleStart}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
              >
                <Zap className="w-4 h-4 fill-stone-900" />
                <span>START AUTO-RUNNER ({targetQuantity} GAMBAR)</span>
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider transition-colors"
              >
                {status === 'completed' ? 'Tutup & Lihat di Galeri' : 'Tutup Wizard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
