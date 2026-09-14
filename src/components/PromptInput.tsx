// src/components/PromptInput.tsx
import React from 'react';
import { TargetEngine, InputMode } from '../types/prompt';
import { STYLE_PRESETS, TARGET_ENGINES, SAMPLE_IDEAS, COMMERCIAL_DIRECTIONS, COMPOSITION_PRESETS } from '../data/presets';
import { KeywordExpanderWidget } from './KeywordExpanderWidget';
import {
  CheckSquare,
  Square,
  Layers,
  Terminal,
  Sparkles,
  ListPlus,
  Compass,
  Cpu,
  HeartPulse,
  Leaf,
  GraduationCap,
  UtensilsCrossed,
  CalendarDays,
  MapPin,
  Smile,
  Target,
  Maximize2,
  Award,
  LayoutGrid,
  TrendingUp,
  Palette,
  Layout,
} from 'lucide-react';

const DIRECTION_ICONS: Record<string, any> = {
  'evergreen-utility': Compass,
  'business-tech': Cpu,
  'wellness-lifestyle': HeartPulse,
  'sustainability': Leaf,
  'education-learning': GraduationCap,
  'food-beverage': UtensilsCrossed,
  'seasonal-holidays': CalendarDays,
  'local-cultural': MapPin,
  'emotional-human': Smile,
  'playful-surreal': Sparkles,
};

const COMPOSITION_ICONS: Record<string, any> = {
  'isolated-object': Maximize2,
  'object-group': Layers,
  'minimal-context': Sparkles,
  'commercial-scene': Layout,
  'decorative-composition': Award,
  // Legacy aliases
  'single-isolated': Maximize2,
  'grouped-still-life': Layers,
  'circular-badge': Award,
  'mini-icon-set': LayoutGrid,
  'hero-with-accents': Sparkles,
  'dynamic-diagonal': TrendingUp,
};

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
  selectedCommercialDirection?: string;
  setSelectedCommercialDirection?: (val: string) => void;
  selectedComposition?: string;
  setSelectedComposition?: (val: string) => void;
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
  selectedCommercialDirection = 'evergreen-utility',
  setSelectedCommercialDirection,
  selectedComposition = 'single-isolated',
  setSelectedComposition,
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
            1. Masukkan Ide Konsep &amp; Konfigurasi Batch Multi-Design
          </h2>
        </div>

        {/* Input Mode Selector Tabs */}
        <div className="flex items-center border border-stone-300 bg-stone-50 p-0.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setInputMode('variations')}
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
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
              ? 'Ide / Kata Kunci Utama'
              : 'Daftar Kata Kunci Batch (1 Ide per Baris)'}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-stone-500 uppercase">
              Estimasi: ~{tokenCount} tokens input
            </span>
            <span className="text-[10px] font-mono text-stone-400">•</span>
            <span className="text-[10px] font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 border border-stone-200">
              {activeCount} Asset Desain
            </span>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={inputMode === 'multi-keyword' ? 5 : 3}
            value={rawIdea}
            onChange={(e) => setRawIdea(e.target.value)}
            placeholder={
              inputMode === 'variations'
                ? 'Ketik ide Anda, misal: maskot rubah mekanik, vintage coffee emblem, burung hantu steampunk...'
                : 'Ketik 1 ide per baris, contoh:\nburung hantu steampunk\nrobot pelayan kafe\nrubah mekanik cyber\nkucing astronaut pop'
            }
            className="w-full bg-stone-50 border border-stone-300 p-3.5 text-sm font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 leading-relaxed"
          />
          {rawIdea && (
            <button
              onClick={() => setRawIdea('')}
              className="absolute right-3 top-3 text-[10px] uppercase font-mono text-stone-400 hover:text-stone-700 px-1.5 py-0.5 border border-stone-200 bg-white"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Quick Sample Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase font-mono text-stone-400">Contoh Cepat:</span>
          {SAMPLE_IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => setRawIdea(idea)}
              className="text-[10px] font-mono px-2 py-0.5 border border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors cursor-pointer"
            >
              + {idea}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Slider for Multi-Variasi Mode */}
      {inputMode === 'variations' && (
        <div className="space-y-1.5 bg-stone-50 border border-stone-200 p-3.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-600" />
              <span>Jumlah Variasi Sudut Pandang Batch:</span>
            </span>
            <span className="font-bold text-stone-900 bg-white px-2 py-0.5 border border-stone-300 text-xs">
              {batchCount} Variasi Unik
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="range"
              min={1}
              max={10}
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value, 10))}
              className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded-none"
            />
            <div className="flex gap-1 shrink-0">
              {[3, 5, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setBatchCount(num)}
                  className={`text-[10px] font-mono px-2 py-0.5 border transition-colors ${
                    batchCount === num
                      ? 'bg-stone-900 text-white border-stone-900 font-bold'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optional AI Concept Expander Widget */}
      {showConceptExpander && (
        <div className="pt-1">
          <KeywordExpanderWidget
            currentRawIdea={rawIdea}
            onApplySingleConcept={handleApplySingleConcept}
            onAppendMultipleConcepts={handleAppendMultipleConcepts}
            inputMode={inputMode}
          />
        </div>
      )}

      {/* Mode Hitam Putih (B&W Vector) Checklist */}
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
              Mode Hitam Putih (B&amp;W Monochrome Vector)
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

      {/* ================================================================== */}
      {/* 2. COMMERCIAL DIRECTION SELECTOR (WHY - 10 Market Pillars 2026)    */}
      {/* ================================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-stone-900" />
            <label className="text-xs font-bold uppercase tracking-wider text-stone-900">
              2. Commercial Direction (MENGAPA Dibuat: 10 Pilar Pasar Microstock 2026)
            </label>
          </div>
          <span className="text-[10px] font-mono text-stone-500 uppercase">
            Pilar Segmen &amp; Target Pembeli
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
          {COMMERCIAL_DIRECTIONS.map((dir) => {
            const isSelected = (selectedCommercialDirection || 'evergreen-utility') === dir.id;
            const Icon = DIRECTION_ICONS[dir.id] || Compass;
            return (
              <button
                key={dir.id}
                type="button"
                onClick={() => setSelectedCommercialDirection && setSelectedCommercialDirection(dir.id)}
                title={dir.description}
                className={`p-2.5 text-left border text-xs font-mono transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-stone-600'}`} />
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-[11px] leading-tight truncate">{dir.label}</div>
                  <div className={`text-[9px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {dir.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. VISUAL STYLE SELECTOR (HOW IT LOOKS - 7 Vector Presets)         */}
      {/* ================================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-stone-900" />
            <label className="text-xs font-bold uppercase tracking-wider text-stone-900">
              3. Visual Style Preset (BAGAIMANA TERLIHAT: Teknik Garis &amp; Warna 2D)
            </label>
          </div>
          <span className="text-[10px] font-mono text-stone-500 uppercase">
            Terkunci 100% Konsisten
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset.id)}
                title={preset.description}
                className={`p-2.5 text-left border text-[11px] font-mono transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white'
                }`}
              >
                <div className="font-bold truncate">{preset.name}</div>
                <div
                  className={`text-[9px] uppercase tracking-wider truncate ${
                    isSelected ? 'text-amber-300' : 'text-stone-400'
                  }`}
                >
                  {preset.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* 4. COMPOSITION STRATEGY (HOW IT IS ARRANGED - Spatial Layouts)     */}
      {/* ================================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-stone-900" />
            <label className="text-xs font-bold uppercase tracking-wider text-stone-900">
              4. Composition Strategy (BAGAIMANA STRUKTUR TATA LETAK: Penataan Ruang)
            </label>
          </div>
          <span className="text-[10px] font-mono text-stone-500 uppercase">
            Isolated vs Contextual Scene
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
          {COMPOSITION_PRESETS.map((comp) => {
            const isSelected = (selectedComposition || 'isolated-object') === comp.id || (selectedComposition === 'single-isolated' && comp.id === 'isolated-object');
            const Icon = COMPOSITION_ICONS[comp.id] || Maximize2;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedComposition && setSelectedComposition(comp.id)}
                title={comp.description}
                className={`p-2.5 text-left border text-xs font-mono transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-stone-600'}`} />
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
                    {comp.isIsolated ? 'White BG' : 'Scene Context'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-[11px] leading-tight truncate">{comp.name}</div>
                  <div className={`text-[9px] mt-0.5 truncate ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {comp.tagline || comp.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* 5. TARGET ENGINE & CANVAS RATIO                                    */}
      {/* ================================================================== */}
      <div className="pt-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
              5. Target Engine Visual &amp; Rasio Kanvas
            </label>
            <span className="text-[10px] font-mono text-stone-500 uppercase px-1.5 py-0.5 border border-stone-200 bg-stone-50">
              Rasio: 1:1 (Stock Asset 1024x1024)
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
            * Rasio standar 1:1 (square canvas 1024x1024) siap ekspor &amp; tracing vektor.
          </p>
        </div>
      </div>
    </div>
  );
};
