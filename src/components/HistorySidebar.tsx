// src/components/HistorySidebar.tsx
import React, { useState } from 'react';
import { PromptItem } from '../types/prompt';
import { X, Search, Trash2, Calendar, Star, Layers, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';
import { formatUsd, formatIdr, PRICING_CONFIG } from '../utils/costCalculator';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: PromptItem[];
  onSelectPrompt: (item: PromptItem) => void;
  onClearHistory: () => void;
  onDeletePrompt: (id: string) => void;
  activePromptId?: string;
  usdToIdrRate?: number;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelectPrompt,
  onClearHistory,
  onDeletePrompt,
  activePromptId,
  usdToIdrRate = PRICING_CONFIG.USD_TO_IDR_RATE || 17525,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'bw' | 'color' | 'favorite'>('all');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.rawIdea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.optimizedPrompt.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'bw') return item.isBlackAndWhite;
    if (filterMode === 'color') return !item.isBlackAndWhite;
    if (filterMode === 'favorite') return item.isFavorite;
    return true;
  });

  const totalHistorySpendUsd = history.reduce(
    (acc, curr) => acc + parseFloat(curr.totalCostUsd || '0'),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white border-l border-stone-300 shadow-2xl h-full flex flex-col z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-stone-900 inline-block"></span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900">
                Riwayat Pembuatan (SQLite Local)
              </h2>
            </div>
            <p className="text-[11px] font-mono text-stone-500 mt-0.5">
              {history.length} Item Tersimpan • Total: {formatUsd(totalHistorySpendUsd, 4)} (~{formatIdr(totalHistorySpendUsd * usdToIdrRate)})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-stone-200 hover:border-stone-900 text-stone-600 hover:text-stone-900 bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-stone-200 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari ide, prompt, atau judul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-stone-300 bg-stone-50 text-xs font-mono focus:outline-none focus:border-stone-900 text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 uppercase border transition-colors ${
                filterMode === 'all'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              Semua ({history.length})
            </button>
            <button
              onClick={() => setFilterMode('bw')}
              className={`px-2 py-1 uppercase border transition-colors ${
                filterMode === 'bw'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              B&W Mode
            </button>
            <button
              onClick={() => setFilterMode('color')}
              className={`px-2 py-1 uppercase border transition-colors ${
                filterMode === 'color'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              Flat Color
            </button>
            <button
              onClick={() => setFilterMode('favorite')}
              className={`px-2 py-1 uppercase border transition-colors ${
                filterMode === 'favorite'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              Favorit
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Layers className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-mono text-stone-500 uppercase">
                {searchTerm ? 'Tidak ada hasil yang sesuai' : 'Belum ada riwayat generate'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isActive = item.id === activePromptId;
              const hasImages = item.images && item.images.length > 0;
              const latestImg = hasImages ? item.images[item.images.length - 1] : undefined;
              const dateFormatted = new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className={`p-3.5 border transition-all text-xs font-sans relative ${
                    isActive
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail preview if available */}
                    {latestImg ? (
                      <div className="w-14 h-14 bg-stone-100 border border-stone-300 shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={latestImg.dataUrl || `/${latestImg.imagePath}`}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center font-mono text-[9px] text-stone-400">
                        TEXT ONLY
                      </div>
                    )}

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-stone-900 truncate">
                          {item.title || item.rawIdea}
                        </span>
                        {item.isFavorite && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-stone-500 line-clamp-2 italic font-mono">
                        "{item.rawIdea}"
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] font-mono">
                        {item.isBlackAndWhite ? (
                          <span className="bg-stone-900 text-white px-1.5 py-0.2">B&W</span>
                        ) : (
                          <span className="bg-stone-100 border border-stone-300 px-1.5 py-0.2 text-stone-700">COLOR</span>
                        )}
                        <span className="text-stone-500 uppercase">{item.targetEngine}</span>
                        {hasImages && (
                          <span className="text-stone-700 font-bold bg-stone-100 border border-stone-200 px-1 py-0.2">
                            {item.generationCount}x render
                          </span>
                        )}
                      </div>

                      {/* Cost Ledger Pill */}
                      <div className="border-t border-stone-200 pt-1.5 mt-1.5 flex items-center justify-between font-mono text-[10px]">
                        <span className="text-stone-500">{dateFormatted}</span>
                        <div className="text-right">
                          <span className="font-bold text-stone-900">
                            {formatUsd(item.totalCostUsd, 5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between">
                    <button
                      onClick={() => onSelectPrompt(item)}
                      className="text-[10px] font-mono uppercase font-bold text-stone-900 hover:underline flex items-center gap-1"
                    >
                      <span>Buka di Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onDeletePrompt(item.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      title="Hapus item ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Clear All */}
        {history.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50">
            <button
              onClick={onClearHistory}
              className="w-full py-2 border border-stone-300 hover:border-red-500 text-stone-600 hover:text-red-600 font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Seluruh Riwayat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
