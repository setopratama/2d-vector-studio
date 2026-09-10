// src/components/BatchCardsGrid.tsx
import React from 'react';
import { PromptItem } from '../types/prompt';
import { UnifiedVariationCard } from './UnifiedVariationCard';
import { Sparkles, Download, Image as ImageIcon, Database, Layers, Hourglass, XCircle } from 'lucide-react';
import { formatUsd, formatIdr, PRICING_CONFIG } from '../utils/costCalculator';
import { QueueTask } from '../hooks/usePromptGenerator';

interface BatchCardsGridProps {
  promptItems: PromptItem[];
  taskQueue: QueueTask[];
  getCardQueueStatus: (promptId: string) => {
    isProcessing: boolean;
    isQueued: boolean;
    queuePosition: number | null;
    taskType: string | null;
  };
  onGenerateImageForPrompt: (promptId: string) => void;
  onGenerateAllBatchImages: () => void;
  onRegenerateImage: (promptId: string) => void;
  onRegeneratePrompt?: (promptId: string) => void;
  onSelectPromptVersion?: (promptId: string, versionIndex: number) => void;
  onCancelQueueTask: (promptId: string) => void;
  onCancelAllQueueTasks: () => void;
  onToggleFavorite?: (promptId: string) => void;
  onDownloadAllImages: () => void;
}

export const BatchCardsGrid: React.FC<BatchCardsGridProps> = ({
  promptItems,
  taskQueue,
  getCardQueueStatus,
  onGenerateImageForPrompt,
  onGenerateAllBatchImages,
  onRegenerateImage,
  onRegeneratePrompt,
  onSelectPromptVersion,
  onCancelQueueTask,
  onCancelAllQueueTasks,
  onToggleFavorite,
  onDownloadAllImages,
}) => {
  if (promptItems.length === 0) return null;

  const totalCards = promptItems.length;
  const itemsWithImages = promptItems.filter((p) => p.images.length > 0);
  const ungeneratedCount = totalCards - itemsWithImages.length;
  const isQueueActive = taskQueue.length > 0;

  const imageTariffUsd = PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD;
  const totalBatchImagesCostUsd = totalCards * imageTariffUsd;
  const totalBatchImagesCostIdr = totalBatchImagesCostUsd * PRICING_CONFIG.USD_TO_IDR_RATE;

  // Total batch cumulative spend (Prompt + all image renders)
  const totalBatchSpendUsd = promptItems.reduce(
    (acc, curr) => acc + parseFloat(curr.totalCostUsd || '0'),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ==================================================================== */}
      {/* BATCH MASTER HEADER                                                  */}
      {/* ==================================================================== */}
      <div className="bg-white border-2 border-stone-900 shadow-sm p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-stone-900 inline-block"></span>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-stone-900">
              Hasil Optimasi Prompt 2D ({totalCards} Variasi Desain Mandiri)
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-stone-600 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-800 font-bold">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>{totalCards} Card Tersimpan di SQLite DB</span>
            </span>
            <span>•</span>
            <span>
              Total Biaya Batch: <strong className="text-stone-900">{formatUsd(totalBatchSpendUsd, 6)}</strong> (~{formatIdr(totalBatchSpendUsd * 16000)})
            </span>

            {/* Live Queue Indicator */}
            {isQueueActive && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-900 px-2 py-0.5 font-bold border border-indigo-300 animate-pulse">
                  <Hourglass className="w-3 h-3 text-indigo-700 animate-spin" />
                  <span>{taskQueue.length} Antrean AI Menunggu</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cancel all queue button if queue active */}
          {isQueueActive && (
            <button
              onClick={onCancelAllQueueTasks}
              className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-500 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Batalkan seluruh antrean yang sedang menunggu"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>BATALKAN SEMUA ANTREAN ({taskQueue.length})</span>
            </button>
          )}

          {/* Action 1: Generate All Images if any ungenerated */}
          {ungeneratedCount > 0 && (
            <button
              onClick={onGenerateAllBatchImages}
              title="Masukkan semua kartu yang belum digenerate ke dalam antrean AI"
              className="py-2 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center gap-2 bg-stone-900 text-white hover:bg-stone-800 border-2 border-stone-900 active:translate-y-[1px] cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>
                GENERATE SEMUA {totalCards} GAMBAR (+{formatUsd(totalBatchImagesCostUsd, 4)} / ~{formatIdr(totalBatchImagesCostIdr)})
              </span>
            </button>
          )}

          {/* Action 2: Download All PNGs (if images exist) */}
          {itemsWithImages.length > 0 && (
            <button
              onClick={onDownloadAllImages}
              className="py-2 px-3.5 bg-white hover:bg-stone-100 text-stone-900 border-2 border-stone-900 font-mono text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD SEMUA PNG ({itemsWithImages.length} GAMBAR)</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5 STANDALONE CARDS (EACH WITH PROMPT ON LEFT & IMAGE/TABLE ON RIGHT) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 gap-6">
        {promptItems.map((item, idx) => (
          <UnifiedVariationCard
            key={item.id}
            item={item}
            index={idx}
            onGenerateImage={onGenerateImageForPrompt}
            onRegenerateImage={onRegenerateImage}
            onRegeneratePrompt={onRegeneratePrompt}
            onSelectPromptVersion={onSelectPromptVersion}
            onCancelQueueTask={onCancelQueueTask}
            queueStatus={getCardQueueStatus(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

