// src/components/BatchCardsGrid.tsx
import React from 'react';
import { PromptItem } from '../types/prompt';
import { UnifiedVariationCard } from './UnifiedVariationCard';
import { Sparkles, Download, Image as ImageIcon, Database, Layers, Hourglass, XCircle } from 'lucide-react';
import { formatUsd, formatIdr, PRICING_CONFIG } from '../utils/costCalculator';
import { QueueTask } from '../hooks/usePromptGenerator';
import { CardLoadingBar } from './CardLoadingBar';

import { ContributorProfile } from '../hooks/useContributorProfile';

interface BatchCardsGridProps {
  promptItems: PromptItem[];
  taskQueue: QueueTask[];
  contributorProfile?: ContributorProfile;
  onOpenProfileSettings?: () => void;
  getCardQueueStatus: (promptId: string) => {
    isProcessing: boolean;
    isQueued: boolean;
    queuePosition: number | null;
    taskType: string | null;
  };
  onGenerateImageForPrompt: (promptId: string) => void;
  onGenerateAllBatchImages: (onlyPass?: boolean) => void;
  onRegenerateImage: (promptId: string) => void;
  onRegeneratePrompt?: (promptId: string) => void;
  onGenerateSeoMetadata?: (promptId: string) => void;
  generatingSeoCardId?: string | null;
  onSelectPromptVersion?: (promptId: string, versionIndex: number) => void;
  onCancelQueueTask: (promptId: string) => void;
  onCancelAllQueueTasks: () => void;
  onToggleFavorite?: (promptId: string) => void;
  onDownloadAllImages: () => void;
}

export const BatchCardsGrid: React.FC<BatchCardsGridProps> = ({
  promptItems,
  taskQueue,
  contributorProfile,
  onOpenProfileSettings,
  getCardQueueStatus,
  onGenerateImageForPrompt,
  onGenerateAllBatchImages,
  onRegenerateImage,
  onRegeneratePrompt,
  onGenerateSeoMetadata,
  generatingSeoCardId,
  onSelectPromptVersion,
  onCancelQueueTask,
  onCancelAllQueueTasks,
  onToggleFavorite,
  onDownloadAllImages,
}) => {
  if (promptItems.length === 0) return null;

  const totalCards = promptItems.length;
  const itemsWithImages = promptItems.filter((p) => p.images.length > 0);
  const ungeneratedItems = promptItems.filter((p) => p.images.length === 0);
  const ungeneratedCount = ungeneratedItems.length;
  const ungeneratedPassCount = ungeneratedItems.filter(
    (p) => p.commercialBrief?.decision === 'PASS'
  ).length;
  const ungeneratedReworkCount = ungeneratedItems.filter(
    (p) => p.commercialBrief?.decision === 'REWORK'
  ).length;

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
      <div className="bg-white border-2 border-stone-900 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
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

          {/* Master Batch Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Generate Batch Visuals: Quality Gate PASS only vs All */}
            {ungeneratedCount > 0 && (
              <>
                {ungeneratedReworkCount > 0 && ungeneratedPassCount > 0 ? (
                  <>
                    <button
                      onClick={() => onGenerateAllBatchImages(true)}
                      disabled={isQueueActive}
                      title={`Hanya render ${ungeneratedPassCount} card yang PASS Quality Gate (hemat ${formatUsd(ungeneratedReworkCount * imageTariffUsd, 3)})`}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:translate-y-[1px]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        ⚡ Render {ungeneratedPassCount} PASS ({formatUsd(ungeneratedPassCount * imageTariffUsd, 3)})
                      </span>
                    </button>
                    <button
                      onClick={() => onGenerateAllBatchImages(false)}
                      disabled={isQueueActive}
                      title={`Render seluruh ${ungeneratedCount} gambar termasuk yang bertanda REWORK`}
                      className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 border border-stone-400 font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:translate-y-[1px]"
                    >
                      <span>Semua ({ungeneratedCount})</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onGenerateAllBatchImages(false)}
                    disabled={isQueueActive}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:translate-y-[1px]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      ⚡ Render Semua {ungeneratedCount} Gambar ({formatUsd(ungeneratedCount * imageTariffUsd, 3)})
                    </span>
                  </button>
                )}
              </>
            )}

            {/* Download All Generated Images */}
            {itemsWithImages.length > 0 && (
              <button
                onClick={onDownloadAllImages}
                className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 border border-stone-900 font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:translate-y-[1px]"
                title="Download seluruh gambar yang sudah siap dalam bentuk batch ZIP"
              >
                <Download className="w-4 h-4 text-stone-950" />
                <span>Unduh ZIP ({itemsWithImages.length} Gambar)</span>
              </button>
            )}

            {/* Cancel Active Queue */}
            {isQueueActive && (
              <button
                onClick={onCancelAllQueueTasks}
                className="px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Batalkan seluruh tugas antrean AI yang sedang berjalan"
              >
                <XCircle className="w-4 h-4" />
                <span>Hentikan Antrean</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Loading Bar Kecil di Bawah Master Batch Header */}
        <CardLoadingBar
          isLoading={isQueueActive}
          label={`MEMPROSES ANTREAN BATCH AI (${taskQueue.length} TUGAS MENUNGGU)...`}
          completedLabel="SEMUA TUGAS BATCH SELESAI!"
          estimatedDurationMs={20000 * Math.max(1, taskQueue.length)}
          colorScheme="indigo"
        />
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
            contributorProfile={contributorProfile}
            onOpenProfileSettings={onOpenProfileSettings}
            onGenerateImage={onGenerateImageForPrompt}
            onRegenerateImage={onRegenerateImage}
            onRegeneratePrompt={onRegeneratePrompt}
            onGenerateSeoMetadata={onGenerateSeoMetadata}
            isGeneratingSeo={generatingSeoCardId === item.id}
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
