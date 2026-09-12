// src/components/ImageResultCard.tsx
import React, { useState } from 'react';
import { PromptItem, GeneratedImageVersion } from '../types/prompt';
import { Download, RefreshCw, Copy, Check, Folder, Calendar, Star, Maximize2, Layers, Grid, LayoutList } from 'lucide-react';
import { formatUsd, formatIdr, PRICING_CONFIG } from '../utils/costCalculator';

interface ImageResultCardProps {
  promptItems: PromptItem[];
  onRegenerateImage: (promptId: string) => void;
  isRegeneratingId: string | null;
  onToggleFavorite?: (promptId: string) => void;
  onDownloadAllImages: () => void;
}

export const ImageResultCard: React.FC<ImageResultCardProps> = ({
  promptItems,
  onRegenerateImage,
  isRegeneratingId,
  onToggleFavorite,
  onDownloadAllImages,
}) => {
  // Filter only items that have at least one generated image
  const itemsWithImages = promptItems.filter((p) => p.images.length > 0);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'focus'>('grid');
  const [focusedId, setFocusedId] = useState<string>(
    itemsWithImages[0]?.id || ''
  );
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [zoomedId, setZoomedId] = useState<string | null>(null);

  // Active version index per item
  const [versionMap, setVersionMap] = useState<{ [key: string]: number }>({});

  if (itemsWithImages.length === 0) return null;

  const handleCopyPrompt = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleDownloadSingle = async (item: PromptItem, img: GeneratedImageVersion) => {
    const downloadUrl = img.dataUrl || (img.imagePath ? (img.imagePath.startsWith('/') ? img.imagePath : `/${img.imagePath}`) : '');
    const { sanitizeSeoFileName } = await import('../utils/imageMetadataInjector');
    const fileName = sanitizeSeoFileName(item.adobeStockTitle || item.title);

    const { downloadSingleImage } = await import('../utils/downloadHelper');
    await downloadSingleImage(downloadUrl, fileName, {
      title: item.adobeStockTitle || item.title,
      keywords: item.keywords || [],
      description: item.optimizedPrompt,
    });
  };

  const imageTariffUsd = PRICING_CONFIG.IMAGE_FLAT_COST_PER_UNIT_USD;
  const imageTariffIdr = imageTariffUsd * PRICING_CONFIG.USD_TO_IDR_RATE;

  // Cumulative batch metrics
  const totalBatchCostUsd = itemsWithImages.reduce(
    (acc, curr) => acc + parseFloat(curr.totalCostUsd || '0'),
    0
  );
  const totalRenders = itemsWithImages.reduce(
    (acc, curr) => acc + curr.generationCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Batch Header Bar */}
      <div className="bg-white border-2 border-stone-900 shadow-sm p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-stone-900 inline-block"></span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900">
              3. Galeri Desain 2D Siap Vektor ({itemsWithImages.length} Desain Dibuat • {totalRenders}x Render)
            </h3>
          </div>
          <p className="text-[11px] font-mono text-stone-500 mt-0.5">
            Total Pengeluaran Batch Ini: <span className="font-bold text-stone-900">{formatUsd(totalBatchCostUsd, 6)}</span> (~{formatIdr(totalBatchCostUsd * 16000)})
          </p>
        </div>

        {/* Master Batch Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layout Toggle */}
          {itemsWithImages.length > 1 && (
            <div className="flex items-center border border-stone-300 bg-stone-50 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 transition-colors ${
                  layoutMode === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Tampilan Grid 2 Kolom"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('focus')}
                className={`p-1.5 transition-colors ${
                  layoutMode === 'focus' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Tampilan Fokus 1 Kolom"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Download All PNGs */}
          <button
            onClick={onDownloadAllImages}
            className="py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-2 border border-stone-900 active:translate-y-[1px]"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD SEMUA PNG ({itemsWithImages.length} DESAIN)</span>
          </button>
        </div>
      </div>

      {/* Multi-Design Cards Grid */}
      <div
        className={`grid gap-6 ${
          layoutMode === 'grid' && itemsWithImages.length > 1
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1'
        }`}
      >
        {itemsWithImages.map((item, itemIdx) => {
          const currentVersionIdx =
            versionMap[item.id] !== undefined
              ? versionMap[item.id]
              : item.images.length - 1;
          const activeImg = item.images[currentVersionIdx] || item.images[item.images.length - 1];
          const isRegenThis = isRegeneratingId === item.id;
          const dateStr = new Date(item.createdAt).toISOString().split('T')[0];

          return (
            <div
              key={item.id}
              className="bg-white border-2 border-stone-900 shadow-sm p-5 space-y-5 flex flex-col justify-between"
            >
              {/* Card Top Title & Version Switcher */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        #{itemIdx + 1}
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 truncate max-w-[220px]">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500">
                      Rasio 1:1 • {item.isBlackAndWhite ? 'B&W Ink' : 'Flat Solid'}
                    </span>
                  </div>

                  {/* Version switcher */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center border border-stone-300 bg-stone-50 p-0.5 text-[10px] font-mono">
                      {item.images.map((img, vIdx) => (
                        <button
                          key={img.version}
                          type="button"
                          onClick={() =>
                            setVersionMap((prev) => ({ ...prev, [item.id]: vIdx }))
                          }
                          className={`px-2 py-0.5 font-bold transition-all ${
                            vIdx === currentVersionIdx
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          v{img.version}
                        </button>
                      ))}
                    </div>

                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className="p-1 border border-stone-200 text-stone-600 hover:text-stone-900"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            item.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* 1:1 Canvas Preview */}
                <div className="relative aspect-square w-full bg-[#f8f8f7] border-2 border-stone-900 flex items-center justify-center overflow-hidden group">
                  {activeImg ? (
                    <img
                      src={activeImg.dataUrl || `/${activeImg.imagePath}`}
                      alt={item.title}
                      className={`w-full h-full object-contain p-2 select-none transition-transform duration-200 ${
                        zoomedId === item.id ? 'scale-125' : 'scale-100'
                      }`}
                    />
                  ) : (
                    <p className="text-xs font-mono text-stone-500">Memuat preview 1:1...</p>
                  )}

                  {/* Corner Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="bg-stone-900 text-white text-[9px] font-mono px-1.5 py-0.2 uppercase font-bold">
                      1:1 STOCK
                    </span>
                    <span className="bg-white text-stone-900 border border-stone-900 text-[9px] font-mono px-1.5 py-0.2 uppercase font-bold">
                      v{activeImg?.version || 1}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setZoomedId(zoomedId === item.id ? null : item.id)}
                      className="p-1 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* File Path Indicator */}
                <div className="bg-stone-50 border border-stone-200 p-2 font-mono text-[9px] text-stone-600 truncate select-all">
                  <span className="font-bold text-stone-800">File: </span>
                  data/{activeImg?.imagePath || `outputs/${dateStr}/img-${item.id}-v${activeImg?.version || 1}.png`}
                </div>

                {/* Prompt Used */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase text-stone-600">
                    <span>Prompt yang Digunakan:</span>
                    <button
                      onClick={() => handleCopyPrompt(item.id, item.optimizedPrompt)}
                      className="text-stone-500 hover:text-stone-900 font-mono flex items-center gap-1"
                    >
                      {copiedStates[item.id] ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-stone-800 line-clamp-3 bg-stone-50 p-2 border border-stone-200">
                    "{item.optimizedPrompt}"
                  </p>
                </div>

                {/* Cost Ledger Table for this specific design */}
                <div className="border border-stone-300 font-mono text-[11px]">
                  <div className="bg-stone-100 p-1.5 text-[9px] uppercase font-bold text-stone-600 flex justify-between border-b border-stone-200">
                    <span>Rincian Biaya Desain Ini</span>
                    <span>{item.generationCount}x Render</span>
                  </div>
                  <div className="p-2 space-y-1 bg-white">
                    <div className="flex justify-between text-stone-600">
                      <span>• Prompt Expansion:</span>
                      <span>{formatUsd(item.promptCostUsd, 6)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>• Render Visual ({item.generationCount}x):</span>
                      <span className="font-semibold text-stone-900">
                        {formatUsd(item.generationCount * imageTariffUsd, 4)}
                      </span>
                    </div>
                    <div className="border-t border-stone-300 pt-1 flex justify-between items-baseline font-bold text-stone-900">
                      <span className="text-[10px] uppercase">Total Desain #{itemIdx + 1}:</span>
                      <div className="text-right">
                        <span>
                          {formatUsd(
                            parseFloat(item.promptCostUsd) + item.generationCount * imageTariffUsd,
                            6
                          )}
                        </span>
                        <span className="text-[9px] text-stone-500 ml-1">
                          (~{formatIdr(
                            (parseFloat(item.promptCostUsd) + item.generationCount * imageTariffUsd) *
                              PRICING_CONFIG.USD_TO_IDR_RATE
                          )})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Download & Regenerate */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => activeImg && handleDownloadSingle(item, activeImg)}
                    className="py-2 px-3 bg-white hover:bg-stone-100 text-stone-900 border-2 border-stone-900 font-mono text-[11px] uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD PNG</span>
                  </button>

                  <button
                    onClick={() => onRegenerateImage(item.id)}
                    disabled={isRegenThis}
                    className={`py-2 px-3 text-[11px] font-mono uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      isRegenThis
                        ? 'bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300'
                        : 'bg-stone-900 text-white hover:bg-stone-800 border-2 border-stone-900 active:translate-y-[1px]'
                    }`}
                  >
                    {isRegenThis ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent animate-spin inline-block"></span>
                        <span>RENDER...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        <span>RE-GENERATE (+{formatUsd(imageTariffUsd, 4)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
