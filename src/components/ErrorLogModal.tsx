// src/components/ErrorLogModal.tsx
import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileCode,
  ImageIcon,
  Sparkles,
  Info,
} from 'lucide-react';
import { ErrorLogItem } from '../types/errorLog';

interface ErrorLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorLogs: ErrorLogItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onClear: () => void;
}

export const ErrorLogModal: React.FC<ErrorLogModalProps> = ({
  isOpen,
  onClose,
  errorLogs,
  isLoading,
  onRefresh,
  onClear,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredLogs = errorLogs.filter((log) => {
    if (filterType === 'all') return true;
    if (filterType === 'render-image') return log.type === 'render-image';
    if (filterType === 'prompt-expansion') return log.type === 'prompt-expansion';
    return true;
  });

  const handleCopySingle = (log: ErrorLogItem) => {
    const text = `[ERROR LOG - ${log.timeFormatted}]\n` +
      `Type: ${log.type}\n` +
      `Status: ${log.statusCode || 'N/A'}\n` +
      `Model: ${log.model || 'N/A'}\n` +
      `Message: ${log.message}\n` +
      (log.promptSnippet ? `Prompt: ${log.promptSnippet}\n` : '') +
      (log.details ? `Details: ${typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}\n` : '') +
      (log.stack ? `Stack: ${log.stack}\n` : '');

    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (errorLogs.length === 0) return;
    const allText = errorLogs
      .map(
        (log, idx) =>
          `=== LOG #${idx + 1} [${log.timeFormatted}] ===\n` +
          `Type: ${log.type}\n` +
          `Status: ${log.statusCode || 'N/A'}\n` +
          `Model: ${log.model || 'N/A'}\n` +
          `Message: ${log.message}\n` +
          (log.promptSnippet ? `Prompt: ${log.promptSnippet}\n` : '') +
          (log.details ? `Details: ${typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}\n` : '') +
          (log.stack ? `Stack: ${log.stack}\n` : '')
      )
      .join('\n------------------------------------------------------------\n\n');

    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border-2 border-stone-900 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 text-white border-b-2 border-stone-900">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-600 text-white font-mono text-xs font-bold flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold uppercase font-mono tracking-tight text-white">
                  Log Kegagalan Render & API Sistem
                </h2>
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-mono font-bold">
                  {errorLogs.length} ERROR
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-mono tracking-wide">
                Disimpan otomatis di disk lokal: <code className="text-amber-300">data/logs/error_YYYY-MM-DD.log</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Filters & Actions */}
        <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-stone-900 text-white border border-stone-900'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              Semua ({errorLogs.length})
            </button>
            <button
              onClick={() => setFilterType('render-image')}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'render-image'
                  ? 'bg-stone-900 text-white border border-stone-900'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Gambar ({errorLogs.filter((l) => l.type === 'render-image').length})</span>
            </button>
            <button
              onClick={() => setFilterType('prompt-expansion')}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'prompt-expansion'
                  ? 'bg-stone-900 text-white border border-stone-900'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Prompt AI ({errorLogs.filter((l) => l.type === 'prompt-expansion').length})</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh daftar log error"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {errorLogs.length > 0 && (
              <>
                <button
                  onClick={handleCopyAll}
                  className="px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Salin seluruh log error ke clipboard"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Tersalin!' : 'Salin Semua'}</span>
                </button>

                <button
                  onClick={onClear}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Bersihkan daftar error di memori"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Bersihkan</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Body: Log List */}
        <div className="flex-1 p-5 overflow-y-auto bg-stone-50 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white border border-stone-200 p-8">
              <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-600 border border-emerald-300 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div className="font-mono text-sm font-bold text-stone-900 uppercase">
                Tidak Ada Catatan Error
              </div>
              <p className="font-mono text-xs text-stone-500 max-w-md mx-auto">
                Semua proses ekspansi prompt dan pembuatan gambar 2D berjalan normal tanpa kegagalan sistem.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedIds.has(log.id);
              const isRender = log.type === 'render-image';

              return (
                <div
                  key={log.id}
                  className="border-2 border-stone-300 bg-white shadow-2xs hover:border-stone-900 transition-colors"
                >
                  {/* Item Header */}
                  <div className="p-3.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          log.statusCode && log.statusCode >= 500
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-500 text-stone-900'
                        }`}
                      >
                        HTTP {log.statusCode || 'ERR'}
                      </span>

                      <span className="px-2 py-0.5 bg-stone-900 text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                        {isRender ? <ImageIcon className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        <span>{isRender ? 'RENDER IMAGE' : 'PROMPT EXPANSION'}</span>
                      </span>

                      {log.model && (
                        <span className="px-2 py-0.5 bg-stone-200 text-stone-800 font-mono text-[10px] border border-stone-300">
                          {log.model}
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-stone-500">
                        {log.timeFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopySingle(log)}
                        className="px-2 py-1 bg-white hover:bg-stone-200 text-stone-800 border border-stone-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Salin log error ini"
                      >
                        {copiedId === log.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-stone-600" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="px-2 py-1 bg-white hover:bg-stone-200 text-stone-800 border border-stone-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <span>{isExpanded ? 'Tutup Detail' : 'Detail'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className="p-3.5 space-y-2.5 font-mono">
                    {/* Error message highlight box */}
                    <div className="p-2.5 bg-red-50 border-l-4 border-red-600 text-red-900 text-xs font-bold break-words">
                      {log.message}
                    </div>

                    {/* Prompt snippet if available */}
                    {log.promptSnippet && (
                      <div className="text-xs text-stone-700 bg-stone-50 p-2 border border-stone-200">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">
                          Prompt / Input Terkait:
                        </span>
                        <p className="line-clamp-2 text-stone-900">{log.promptSnippet}</p>
                      </div>
                    )}

                    {/* Expanded Technical Details & Stack */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-stone-200 space-y-2">
                        {log.details && (
                          <div>
                            <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1 mb-1">
                              <Terminal className="w-3 h-3 text-stone-600" />
                              <span>Response Body / Detail Payload:</span>
                            </span>
                            <pre className="p-2.5 bg-stone-900 text-emerald-400 text-[11px] overflow-x-auto max-h-48 border border-stone-950">
                              {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
                            </pre>
                          </div>
                        )}

                        {log.stack && (
                          <div>
                            <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1 mb-1">
                              <FileCode className="w-3 h-3 text-stone-600" />
                              <span>Stack Trace:</span>
                            </span>
                            <pre className="p-2.5 bg-stone-900 text-stone-300 text-[10px] overflow-x-auto max-h-36 border border-stone-950">
                              {log.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-300 flex items-center justify-between font-mono text-xs">
          <div className="text-stone-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-600" />
            <span>Jika error berulang, periksa API Key OpenRouter, kuota akun, atau koneksi proxy.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
