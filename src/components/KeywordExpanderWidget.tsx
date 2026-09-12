// src/components/KeywordExpanderWidget.tsx
import React, { useState } from 'react';
import { Sparkles, Zap, Copy, Check, Plus, RefreshCw, AlertCircle, CornerDownLeft, Layers } from 'lucide-react';
import { InputMode } from '../types/prompt';

interface KeywordExpanderWidgetProps {
  currentRawIdea: string;
  onApplySingleConcept: (concept: string) => void;
  onAppendMultipleConcepts: (concepts: string[]) => void;
  inputMode: InputMode;
  usdToIdrRate?: number;
}

interface ExpanderUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptCostUsd: string;
  promptCostIdr: string;
}

export const KeywordExpanderWidget: React.FC<KeywordExpanderWidgetProps> = ({
  currentRawIdea,
  onApplySingleConcept,
  onAppendMultipleConcepts,
  inputMode,
  usdToIdrRate = 16000,
}) => {
  // Extract first 1 or 2 words if rawIdea has simple text
  const initialKeyword = currentRawIdea
    ? currentRawIdea.trim().split(/\s+/).slice(0, 2).join(' ')
    : '';

  const [inputKeyword, setInputKeyword] = useState<string>(initialKeyword);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [usage, setUsage] = useState<ExpanderUsage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  const handleExpand = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setAppliedIndex(null);

    const targetKeyword = inputKeyword.trim() || currentRawIdea.trim().split(/\s+/).slice(0, 2).join(' ');

    try {
      const res = await fetch('/api/expand-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: targetKeyword }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.concepts) && data.concepts.length > 0) {
        setConcepts(data.concepts);
        if (data.usage) {
          setUsage(data.usage);
        }
      } else {
        throw new Error('Tidak ada konsep yang dikembalikan oleh AI.');
      }
    } catch (err: any) {
      console.warn('AI Keyword Expander Error:', err);
      setErrorMessage(err.message || 'Gagal mengembangkan keyword.');
      // Fallback 4 natural subject concepts
      const kw = targetKeyword || 'kopi';
      setConcepts([
        `${kw} hangat cangkir keramik`,
        `${kw} dingin gelas kaca`,
        `${kw} kemasan botol modern`,
        `${kw} aromatik racikan barista`,
      ]);
      setUsage({
        promptTokens: 75,
        completionTokens: 35,
        totalTokens: 110,
        promptCostUsd: '0.000030',
        promptCostIdr: 'Rp 0,48',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExpand();
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleApplySingle = (concept: string, index: number) => {
    onApplySingleConcept(concept);
    setAppliedIndex(index);
    setTimeout(() => setAppliedIndex(null), 1800);
  };

  const handleApplyAll = () => {
    if (concepts.length === 0) return;
    onAppendMultipleConcepts(concepts);
  };

  return (
    <div className="border border-stone-200 bg-stone-50/80 p-3.5 sm:p-4 space-y-3 font-mono">
      {/* Top Header & Context Description */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
            <Sparkles className="w-3 h-3 fill-stone-900" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
              AI Concept Expander (1–2 Kata → 4 Ide Subjek 3–4 Kata)
            </span>
            <span className="hidden sm:inline text-[10px] text-stone-500 ml-2">
              • Murni tema/objek tanpa bentrok gaya
            </span>
          </div>
        </div>

        <div className="text-[10px] text-stone-500 font-mono">
          Model: <span className="font-semibold text-stone-700">DeepSeek v4 Flash (~$0.00003 / Rp 0,5)</span>
        </div>
      </div>

      {/* Dedicated 1-2 Words Input Box + Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik 1 atau 2 kata dasar... (misal: kopi susu, rubah mekanik, kucing, mobil)"
            className="w-full bg-white border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 pr-16"
          />
          {inputKeyword && (
            <button
              type="button"
              onClick={() => setInputKeyword('')}
              className="absolute right-2 top-2 text-[10px] uppercase font-mono text-stone-400 hover:text-stone-700 px-1 py-0.5"
            >
              Hapus
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleExpand}
          disabled={isLoading}
          className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-2xs"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>Membuat 4 Ide...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>
                {inputKeyword.trim()
                  ? `Buat 4 Ide: "${inputKeyword.slice(0, 14)}..."`
                  : '⚡ Buat 4 Ide Subjek (~Rp 0,5)'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>{errorMessage} (Menggunakan konsep rekomendasi cadangan).</span>
        </div>
      )}

      {/* 4 Generated Concepts Cards Grid */}
      {concepts.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-stone-800 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 inline-block"></span>
              4 Referensi Subjek Alami Siap Pakai:
            </span>
            <button
              type="button"
              onClick={handleExpand}
              disabled={isLoading}
              className="text-[10px] text-stone-600 hover:text-stone-900 underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Acak 4 Ide Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {concepts.map((concept, idx) => {
              const wordCount = concept.trim().split(/\s+/).filter(Boolean).length;
              const isApplied = appliedIndex === idx;
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={idx}
                  className="bg-white border border-stone-300 hover:border-stone-900 p-2.5 space-y-2 shadow-2xs transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900 leading-snug">
                      "{concept}"
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-stone-100 text-stone-600 border border-stone-200 shrink-0 font-semibold">
                      {wordCount} Kata
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-stone-100 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleApplySingle(concept, idx)}
                      className={`py-1 px-2 border flex items-center justify-center gap-1 font-bold uppercase transition-colors cursor-pointer ${
                        isApplied
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-900'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>Dipakai!</span>
                        </>
                      ) : (
                        <>
                          <CornerDownLeft className="w-2.5 h-2.5" />
                          <span>+ Pakai ke Input</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(concept, idx)}
                      className="py-1 px-2 border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5 text-stone-500" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Metrics & Pack Bulk Action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200 text-[10px] text-stone-500">
            {inputMode === 'multi-keyword' && (
              <button
                type="button"
                onClick={handleApplyAll}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Masukkan Semua 4 Ide ke List Pack</span>
              </button>
            )}

            {usage && (
              <div className="flex items-center gap-2 ml-auto text-stone-600">
                <span>Token: {usage.promptTokens} in / {usage.completionTokens} out</span>
                <span>•</span>
                <span>Biaya: <strong className="text-stone-900">${usage.promptCostUsd} ({usage.promptCostIdr})</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
