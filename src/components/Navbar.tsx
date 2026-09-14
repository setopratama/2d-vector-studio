import React from 'react';
import { History, RefreshCw, Zap, User } from 'lucide-react';
import { formatUsd, formatIdr } from '../utils/costCalculator';

interface NavbarProps {
  totalSessionCostUsd: number;
  historyCount: number;
  onToggleHistory: () => void;
  onResetWorkspace: () => void;
  onOpenWizard: () => void;
  onOpenProfileSettings: () => void;
  onOpenVersionModal?: () => void;
  authorName: string;
  isHistoryOpen: boolean;
  usdToIdrRate?: number;
  showAutoRunner?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalSessionCostUsd,
  historyCount,
  onToggleHistory,
  onResetWorkspace,
  onOpenWizard,
  onOpenProfileSettings,
  onOpenVersionModal,
  authorName,
  isHistoryOpen,
  usdToIdrRate = 16000,
  showAutoRunner = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Studio Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-stone-900 text-white flex items-center justify-center font-mono font-bold text-sm tracking-tighter">
              2D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base uppercase tracking-tight text-stone-900">
                  Vector Studio
                </span>
                <button
                  type="button"
                  onClick={onOpenVersionModal}
                  title="Lihat Catatan Rilis Versi & Pengaturan Mode (v2.0.0)"
                  className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 border border-stone-400 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 transition-colors font-bold cursor-pointer flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>v2.0.0</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500 font-mono tracking-wide hidden sm:block">
                DEEPSEEK V4 FLASH • GPT IMAGE 2.5 SUNBURST
              </p>
            </div>
          </div>

          {/* Session Ledger & Main Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Contributor Profile / Metadata Settings Button */}
            <button
              onClick={onOpenProfileSettings}
              title="Atur Nama Author / Artist dan Tag Software untuk Metadata Microstock"
              className="px-2.5 py-1.5 border border-stone-300 hover:border-stone-900 bg-stone-50 hover:bg-stone-100 text-stone-900 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden md:inline text-[11px]">Author:</span>
              <span className="text-amber-800 font-bold max-w-[120px] truncate">{authorName}</span>
            </button>

            {/* Auto-Runner Wizard Button (Highlighted) */}
            {showAutoRunner && (
              <button
                onClick={onOpenWizard}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 border border-amber-500 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:translate-y-0.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-stone-900" />
                <span>Auto-Runner</span>
              </button>
            )}

            {/* Total Session Spend Tracker */}
            <div className="flex items-center gap-2 px-3 py-1 border border-stone-200 bg-white text-xs">
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">
                  Sesi Total
                </div>
                <div className="font-mono font-semibold text-stone-900 flex items-center gap-1">
                  <span>{formatUsd(totalSessionCostUsd, 4)}</span>
                  <span className="text-stone-400 font-normal hidden xl:inline">
                    ({formatIdr(totalSessionCostUsd * usdToIdrRate)})
                  </span>
                </div>
              </div>
            </div>

            {/* Reset / New Canvas Button */}
            <button
              onClick={onResetWorkspace}
              title="Reset Workspace"
              className="px-2.5 py-1.5 border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 text-xs uppercase font-mono tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baru</span>
            </button>

            {/* History Toggle Button */}
            <button
              onClick={onToggleHistory}
              className={`px-3 py-1.5 border text-xs uppercase font-mono tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                isHistoryOpen
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-900 border-stone-300 hover:border-stone-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat</span>
              {historyCount > 0 && (
                <span className="px-1 py-0.2 bg-stone-100 text-stone-900 border border-stone-300 text-[10px] font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
