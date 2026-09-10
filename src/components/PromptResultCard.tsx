// src/components/PromptResultCard.tsx
import React, { useState } from 'react';
import { PromptItem } from '../types/prompt';
import { Copy, Check, Image as ImageIcon, ArrowRight, Sparkles, ShieldAlert, Layers } from 'lucide-react';
import { formatUsd, formatIdr, PRICING_CONFIG } from '../utils/costCalculator';

interface PromptResultCardProps {
  promptItems: PromptItem[];
  isGeneratingImage: boolean;
  batchImageProgress: { current: number; total: number } | null;
  onGenerateImageForPrompt: (promptId: string) => void;
  onGenerateAllBatchImages: () => void;
}

export const PromptResultCard: React.FC<PromptResultCardProps> = ({
  promptItems,
  isGeneratingImage,
  batchImageProgress,
  onGenerateImageForPrompt,
  onGenerateAllBatchImages,
}) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  if (promptItems.length === 0) return null;

  const activePrompt = promptItems[selectedPromptIndex] || promptItems[0];

  const handleCopyPrompt = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const imageTariffUsd = PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD;
  const imageTariffIdr = imageTariffUsd * PRICING_CONFIG.USD_TO_IDR_RATE;

  // Batch Image calculation
  const totalBatchImagesCostUsd = promptItems.length * imageTariffUsd;
  const totalBatchImagesCostIdr = totalBatchImagesCostUsd * PRICING_CONFIG.USD_TO_IDR_RATE;

  const totalBatchPromptCostUsd = promptItems.reduce(
    (acc, curr) => acc + parseFloat(curr.promptCostUsd || '0'),
    0
  );

  return (
    <div className="bg-white border-2 border-stone-900 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Top Header & Batch Overview */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stone-900" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900">
              2. Hasil Optimasi Prompt 2D ({promptItems.length} {promptItems.length === 1 ? 'Prompt' : 'Variasi Desain'})
            </h2>
          </div>
          <p className="text-[11px] font-mono text-stone-500 mt-0.5">
            Total Biaya Prompt Batch: {formatUsd(totalBatchPromptCostUsd, 6)} (~{formatIdr(totalBatchPromptCostUsd * 16000)})
          </p>
        </div>

        {/* Global Batch Action: Generate ALL images at once */}
        {promptItems.length > 1 && (
          <button
            onClick={onGenerateAllBatchImages}
            disabled={isGeneratingImage}
            className={`py-2 px-4 text-xs font-mono uppercase font-bold tracking-wider transition-all flex items-center gap-2 ${
              isGeneratingImage
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300'
                : 'bg-stone-900 text-white hover:bg-stone-800 border border-stone-900 active:translate-y-[1px]'
            }`}
          >
            {isGeneratingImage ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin inline-block"></span>
                <span>
                  MEMBUAT SEMUA GAMBAR ({batchImageProgress ? `${batchImageProgress.current}/${batchImageProgress.total}` : '...'})
                </span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                <span>
                  GENERATE SEMUA {promptItems.length} GAMBAR (+{formatUsd(totalBatchImagesCostUsd, 4)} / ~{formatIdr(totalBatchImagesCostIdr)})
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Multi-Prompt Tabs if > 1 */}
      {promptItems.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-stone-400 mr-1 shrink-0">
            PILIH VARIASI:
          </span>
          {promptItems.map((p, idx) => {
            const isSelected = idx === selectedPromptIndex;
            const hasImage = p.images.length > 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPromptIndex(idx)}
                className={`px-3 py-1.5 uppercase font-semibold border transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                }`}
              >
                <span>#{idx + 1} {p.vectorStyle || 'Variasi'}</span>
                {hasImage && (
                  <span className="w-1.5 h-1.5 bg-emerald-400 inline-block" title="Gambar sudah siap"></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Selected Prompt Detail Box */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-900 font-sans">
              {activePrompt.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-stone-500">
              <span className="uppercase">{activePrompt.vectorStyle || '2D Vector'}</span>
              <span>•</span>
              <span>{activePrompt.targetEngine.toUpperCase()}</span>
              <span>•</span>
              <span>1:1 SQUARE MICROSTOCK</span>
            </div>
          </div>

          <button
            onClick={() => handleCopyPrompt(activePrompt.id, activePrompt.optimizedPrompt)}
            className="text-[10px] font-mono uppercase px-2.5 py-1 border border-stone-300 hover:border-stone-900 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors flex items-center gap-1.5"
          >
            {copiedStates[activePrompt.id] ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Disalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-stone-600" />
                <span>Salin Prompt Ini</span>
              </>
            )}
          </button>
        </div>

        {/* Prompt Text Box */}
        <div className="p-4 bg-stone-50 border border-stone-300 font-mono text-xs text-stone-900 leading-relaxed select-all">
          "{activePrompt.optimizedPrompt}"
        </div>

        {/* Ledger for this prompt item */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-stone-50 border border-stone-200 p-3.5 space-y-1.5 font-mono text-xs">
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500 border-b border-stone-200 pb-1">
              Metrik Token Prompt #{selectedPromptIndex + 1}
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Token In / Out :</span>
              <span className="font-semibold text-stone-900">
                {activePrompt.inputTokens} in / {activePrompt.outputTokens} out
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Biaya Prompt Ini:</span>
              <span className="font-bold text-stone-900">
                {formatUsd(activePrompt.promptCostUsd, 6)} ({activePrompt.promptCostIdr})
              </span>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-3.5 space-y-1.5 font-mono text-xs flex flex-col justify-between">
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500 border-b border-stone-200 pb-1">
              Estimasi Gambar Varian Ini (1:1)
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Tarif Render Gambar:</span>
              <span className="font-bold text-stone-900">
                +{formatUsd(imageTariffUsd, 4)} (~{formatIdr(imageTariffIdr)})
              </span>
            </div>
          </div>
        </div>

        {/* Single Generate Button for this specific prompt */}
        <div className="pt-2">
          <button
            onClick={() => onGenerateImageForPrompt(activePrompt.id)}
            disabled={isGeneratingImage}
            className={`w-full py-3 px-6 text-xs uppercase font-mono tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
              isGeneratingImage
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-stone-800 border border-stone-900 active:translate-y-[1px]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-stone-300" />
            <span>
              GENERATE GAMBAR UNTUK VARIASI #{selectedPromptIndex + 1} (+{formatUsd(imageTariffUsd, 4)} / ~{formatIdr(imageTariffIdr)})
            </span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
