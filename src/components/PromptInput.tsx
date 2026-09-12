// src/components/PromptInput.tsx
import React from 'react';
import { TargetEngine, InputMode } from '../types/prompt';
import { STYLE_PRESETS, TARGET_ENGINES, SAMPLE_IDEAS } from '../data/presets';
import { KeywordExpanderWidget } from './KeywordExpanderWidget';
import { CheckSquare, Square, Layers, Terminal, Sparkles, ListPlus } from 'lucide-react';

interface PromptInputProps {
  rawIdea: string;
  setRawIdea: (val: string) => void;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  batchCount: number;
  setBatchCount: (count: number) => void;
  selectedEngine: TargetEngine;
  setSelectedEngine: (val: TargetEngine) => void;
  selectedPreset: string;
  setSelectedPreset: (val: string) => void;
  isBlackAndWhite: boolean;
  setIsBlackAndWhite: (val: boolean) => void;
  tokenCount: number;
  showConceptExpander?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  rawIdea,
  setRawIdea,
  inputMode,
  setInputMode,
  batchCount,
  setBatchCount,
  selectedEngine,
  setSelectedEngine,
  selectedPreset,
  setSelectedPreset,
  isBlackAndWhite,
  setIsBlackAndWhite,
  tokenCount,
  showConceptExpander = true,
}) => {
  // Multi-line concept count helper
  const lineConcepts = rawIdea
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const activeCount = inputMode === 'multi-keyword' ? Math.max(1, lineConcepts.length) : batchCount;

  const handleApplySingleConcept = (concept: string) => {
    setRawIdea(concept);
  };

  const handleAppendMultipleConcepts = (concepts: string[]) => {
    if (inputMode === 'multi-keyword') {
      const existing = rawIdea.trim();
      const newLines = concepts.join('\n');
      setRawIdea(existing ? `${existing}\n${newLines}` : newLines);
    } else {
      setRawIdea(concepts[0]);
    }
  };

  return (
    <div className="bg-white border border-stone-200 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-stone-900" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900">
            1. Masukkan Ide Konsep & Konfigurasi Batch Multi-Design
          </h2>
        </div>

        {/* Input Mode Selector Tabs */}
        <div className="flex items-center border border-stone-300 bg-stone-50 p-0.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setInputMode('variations')}
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              inputMode === 'variations'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Multi-Variasi Gaya</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('multi-keyword')}
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              inputMode === 'multi-keyword'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListPlus className="w-3 h-3" />
            <span>Multi-Keyword / Pack</span>
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
            {inputMode === 'variations'
              ? 'Ide Dasar (Satu Konsep -> Diekspansi Jadi Beragam Variasi Prompt & Desain)'
              : 'Daftar Keyword / Konsep (Satu Baris = Satu Item Desain Siap Vektor)'}
          </label>
          <span className="text-[10px] font-mono text-stone-500">
            {rawIdea.length} kark • ~{tokenCount} user tokens
          </span>
        </div>

        <div className="relative">
          <textarea
            rows={inputMode === 'multi-keyword' ? 5 : 3}
            value={rawIdea}
            onChange={(e) => setRawIdea(e.target.value)}
            placeholder={
              inputMode === 'variations'
                ? 'Ketik ide visual... Contoh: maskot rubah mekanik, vintage coffee emblem...'
                : 'Ketik satu konsep per baris. Contoh:\nmaskot rubah mekanik\nserigala cyberpunk neon\nburung hantu steampunk\nberuang armor robotik'
            }
            className="w-full bg-stone-50 border border-stone-300 p-3.5 text-sm font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors resize-y"
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

        {/* AI Concept Expander Widget (1-2 Words -> 5 Natural Subject Concepts 3-4 Words) */}
        {showConceptExpander && (
          <KeywordExpanderWidget
            currentRawIdea={rawIdea}
            onApplySingleConcept={handleApplySingleConcept}
            onAppendMultipleConcepts={handleAppendMultipleConcepts}
            inputMode={inputMode}
          />
        )}

        {/* Quick Sample Tags (Original samples remain 100% intact) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-mono text-stone-400">Contoh Cepat:</span>
          {inputMode === 'variations' ? (
            SAMPLE_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setRawIdea(idea)}
                className="text-[10px] font-mono px-2 py-0.5 border border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors cursor-pointer"
              >
                + {idea}
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={() =>
                setRawIdea(
                  'maskot rubah mekanik\nserigala cyberpunk neon\nburung hantu steampunk\nberuang robot armor'
                )
              }
              className="text-[10px] font-mono px-2 py-0.5 border border-stone-300 bg-stone-100 text-stone-800 hover:border-stone-900 transition-colors cursor-pointer"
            >
              + Contoh 4 Konsep (Animal Cyberpunk Pack)
            </button>
          )}
        </div>
      </div>

      {/* Batch Quantity Selector (Only in Variations Mode) */}
      {inputMode === 'variations' && (
        <div className="bg-stone-50 border border-stone-200 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-700" />
              <span>Jumlah Variasi Prompt & Desain yang Dibuat Sekaligus</span>
            </div>
            <p className="text-[11px] text-stone-500 font-mono mt-0.5">
              Setiap variasi menggunakan sudut pandang visual, komposisi, dan style kontur yang berbeda.
            </p>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            {[1, 3, 5, 8].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setBatchCount(count)}
                className={`px-3 py-1.5 text-xs font-bold uppercase border transition-all ${
                  batchCount === count
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                }`}
              >
                {count} {count === 1 ? 'Prompt' : 'Variasi'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode Hitam Putih (B&W Vector) Checklist - Highlighted */}
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
            <span className="text-xs font-bold uppercase tracking-wider">
              Mode Hitam Putih (B&W Monochrome Vector)
            </span>
            <span
              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 font-bold ${
                isBlackAndWhite ? 'bg-white text-stone-900' : 'bg-stone-200 text-stone-700'
              }`}
            >
              SVG Autotrace Ready
            </span>
          </div>
          <p className={`text-[11px] ${isBlackAndWhite ? 'text-stone-300' : 'text-stone-500'}`}>
            Menghasilkan grafis kontras tinggi tinta hitam di atas putih polos (zero grayscale, zero shading). Sangat mudah dikonversi jadi kurva vektor tunggal di Illustrator atau Inkscape.
          </p>
        </div>
      </div>

      {/* Grid: Vector Style Presets & Target Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Style Presets */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
            Gaya Grafis 2D Siap Vektor
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {STYLE_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-2 text-left border text-[11px] font-mono transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div className="font-semibold truncate">{preset.name}</div>
                  <div
                    className={`text-[9px] uppercase tracking-wider truncate ${
                      isSelected ? 'text-stone-300' : 'text-stone-400'
                    }`}
                  >
                    {preset.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Engine & Aspect Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Target Engine Visual
            </label>
            <span className="text-[10px] font-mono text-stone-500 uppercase px-1.5 py-0.5 border border-stone-200 bg-stone-50">
              Rasio: 1:1 (Stock Asset)
            </span>
          </div>
          <div className="space-y-1.5">
            {TARGET_ENGINES.map((engine) => {
              const isSelected = selectedEngine === engine.id;
              return (
                <div
                  key={engine.id}
                  className="p-3 text-left border bg-stone-900 text-white border-stone-900 text-xs font-mono flex items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 inline-block"></span>
                      <span>{engine.name}</span>
                    </div>
                    <p className="text-[11px] text-stone-300 font-sans mt-0.5">
                      {engine.description}
                    </p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 border border-stone-600 bg-stone-800 text-emerald-300 font-bold shrink-0">
                    {engine.badge}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-stone-400 font-mono italic">
            * Rasio standar 1:1 (square canvas 1024x1024) siap ekspor & tracing vektor.
          </p>
        </div>
      </div>
    </div>
  );
};
