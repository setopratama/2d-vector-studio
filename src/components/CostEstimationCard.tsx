import React from 'react';
import { Calculator, ArrowRight, Info, Zap, Layers, Sparkles } from 'lucide-react';
import { PrePromptEstimate, PreImageEstimate } from '../types/prompt';
import { formatUsd, formatIdr, PRICING_CONFIG } from '../utils/costCalculator';
import { CardLoadingBar } from './CardLoadingBar';

interface CostEstimationCardProps {
  rawIdea: string;
  batchCount: number;
  promptEstimate: PrePromptEstimate;
  imageEstimate: PreImageEstimate;
  isLoading: boolean;
  onGeneratePrompts: () => void;
  isBlackAndWhite: boolean;
  includeMetadata: boolean;
  onToggleIncludeMetadata: (val: boolean) => void;
}

export const CostEstimationCard: React.FC<CostEstimationCardProps> = ({
  rawIdea,
  batchCount,
  promptEstimate,
  imageEstimate,
  isLoading,
  onGeneratePrompts,
  isBlackAndWhite,
  includeMetadata,
  onToggleIncludeMetadata,
}) => {
  const hasKeyword = rawIdea.trim().length > 0;
  const wordCount = rawIdea.trim() ? rawIdea.trim().split(/\s+/).length : 0;
  const charCount = rawIdea.length;
  const safeBatch = Math.max(1, batchCount);

  return (
    <div className="bg-white border border-stone-200 shadow-sm transition-all overflow-hidden flex flex-col">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-stone-900" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900">
              Kalkulasi & Pra-Estimasi Biaya Batch ({safeBatch} {safeBatch === 1 ? 'Prompt' : 'Variasi'})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-stone-300 text-stone-600 bg-stone-50">
              DeepSeek v4 Flash
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-900 text-white font-bold">
              PRA-EKSEKUSI
            </span>
          </div>
        </div>

        {/* Checklist Pembuatan Metadata SEO (Default Non-Aktif) */}
        <div className="bg-stone-50 border border-stone-200 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors hover:bg-stone-100/70">
          <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none flex-1">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => onToggleIncludeMetadata(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 mt-0.5 sm:mt-0 rounded-none border-stone-400 text-stone-900 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-stone-900"
            />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-900">
                  Buat Sekaligus Metadata (Title, Deskripsi/Stock Title & Keywords)
                </span>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border font-semibold ${
                    includeMetadata
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-200 text-stone-700 border-stone-300'
                  }`}
                >
                  {includeMetadata ? 'AKTIF (+SEO TAGS)' : 'NON-AKTIF (HEMAT TOKEN)'}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                {includeMetadata
                  ? 'Membuat Judul SEO Adobe Stock (≤120 kark) & 25–45 keywords tags microstock (~200 output tokens/variasi).'
                  : 'Hanya membuat prompt visual 2D murni (~60 output tokens/variasi). Lebih cepat & hemat token LLM.'}
              </span>
            </div>
          </label>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Left Col: Token Calculation Details */}
          <div className="space-y-3 bg-stone-50 border border-stone-200 p-4">
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500 flex items-center justify-between">
              <span>Rincian Token Batch Input & Output</span>
              <span className="font-mono text-stone-700">~3.8 chars/tok</span>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center text-stone-600">
                <span>• Keyword Pengguna ({wordCount} kata, {charCount} kark):</span>
                <span className="font-semibold text-stone-900">
                  ~{Math.max(0, promptEstimate.estimatedInputTokens - (includeMetadata ? PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS + 40 : PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS))} tokens
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-600">
                <span>• System Prompt 2D Vector Template:</span>
                <span className="text-stone-700">
                  +{includeMetadata ? PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS + 40 : PRICING_CONFIG.SYSTEM_PROMPT_BASE_TOKENS} tokens
                </span>
              </div>

              <div className="border-t border-stone-300 pt-1.5 flex justify-between items-center text-stone-800 font-bold">
                <span>Total Token Kirim (Input):</span>
                <span className="text-stone-900 bg-white px-1.5 py-0.5 border border-stone-300">
                  ~{promptEstimate.estimatedInputTokens} tokens
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-600 pt-1">
                <span>• Target Output ({safeBatch} variasi × ~{includeMetadata ? 200 : 60} tok):</span>
                <span className="font-semibold text-stone-900">
                  ~{promptEstimate.estimatedOutputTokens} tokens
                </span>
              </div>
            </div>

            <div className="text-[10px] text-stone-500 border-t border-stone-200 pt-2 font-mono flex items-center gap-1">
              <Info className="w-3 h-3 text-stone-400 shrink-0" />
              <span>Tarif: In $0.14/1M ($0.00000014) | Out $0.56/1M ($0.00000056)</span>
            </div>
          </div>

          {/* Right Col: Cost Estimation & Formula */}
          <div className="space-y-3 bg-stone-50 border border-stone-200 p-4 flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-2">
                Estimasi Biaya Tahap 1 ({safeBatch} Variasi Prompt {includeMetadata ? '+ Metadata' : 'Murni'})
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-stone-600">
                  <span>Biaya Input ({promptEstimate.estimatedInputTokens} tok):</span>
                  <span>
                    {formatUsd(
                      promptEstimate.estimatedInputTokens * PRICING_CONFIG.PROMPT_INPUT_PER_TOKEN_USD,
                      6
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Biaya Output ({promptEstimate.estimatedOutputTokens} tok):</span>
                  <span>
                    {formatUsd(
                      promptEstimate.estimatedOutputTokens * PRICING_CONFIG.PROMPT_OUTPUT_PER_TOKEN_USD,
                      6
                    )}
                  </span>
                </div>

                <div className="border-t border-stone-300 pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-stone-900 uppercase text-[11px] tracking-wide">
                    Total Biaya {safeBatch} Prompt:
                  </span>
                  <div className="text-right">
                    <div className="text-base font-bold text-stone-900">
                      {formatUsd(promptEstimate.estimatedPromptCostUsd, 6)}
                    </div>
                    <div className="text-[11px] text-stone-500 font-semibold">
                      ~{formatIdr(promptEstimate.estimatedPromptCostIdr)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Step Batch Teaser (Image Cost Preview) */}
            <div className="border-t border-stone-200 pt-2 text-[11px] text-stone-600 font-mono flex items-center justify-between">
              <span className="text-stone-500">Estimasi Tahap 2 ({safeBatch} Gambar 1:1):</span>
              <span className="font-semibold text-stone-800">
                +{formatUsd(imageEstimate.estimatedImageCostUsd, 4)} (~{formatIdr(imageEstimate.estimatedImageCostIdr)})
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button with live batch price in label */}
        <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-stone-700" />
            <span>
              {isBlackAndWhite
                ? 'Mode Aktif: Hitam & Putih Murni (Optimal Autotrace Monokrom)'
                : 'Mode Aktif: Flat Solid Colors (2D Solid Vektor)'}
            </span>
          </div>

          <button
            onClick={onGeneratePrompts}
            disabled={!hasKeyword || isLoading}
            className={`px-6 py-3 text-xs uppercase font-mono tracking-widest font-semibold transition-all flex items-center justify-center gap-2 ${
              !hasKeyword || isLoading
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200'
                : 'bg-stone-900 text-white hover:bg-stone-800 border border-stone-900 active:translate-y-[1px]'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin inline-block"></span>
                <span>MEMPROSES {safeBatch} PROMPT...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-stone-300" />
                <span>
                  GENERATE {safeBatch} {safeBatch === 1 ? 'PROMPT' : 'VARIASI PROMPT'} (Estimasi ~{formatUsd(promptEstimate.estimatedPromptCostUsd, 5)} / ~{formatIdr(promptEstimate.estimatedPromptCostIdr)})
                </span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Loading Bar Kecil di Bawah Card dengan Hitungan 0-100% */}
      <CardLoadingBar
        isLoading={isLoading}
        label={`MEMPROSES & EKSPANSI ${safeBatch} PROMPT 2D...`}
        completedLabel={`PROMPT ${safeBatch} VARIASI SELESAI DIBUAT!`}
        estimatedDurationMs={2800}
        colorScheme="amber"
      />
    </div>
  );
};

