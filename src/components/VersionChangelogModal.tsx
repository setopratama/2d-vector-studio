// src/components/VersionChangelogModal.tsx
import React from 'react';
import { X, GitCommit, Check, Sparkles, Tag, Sliders, Layers, Zap, Info, ShieldCheck } from 'lucide-react';

export interface AppFeatureSettings {
  showConceptExpander: boolean;
  showAutoRunner: boolean;
  showSeoMetadata: boolean;
}

interface VersionChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: AppFeatureSettings;
  onUpdateFeatures: (updated: Partial<AppFeatureSettings>) => void;
  onResetToClassic: () => void;
  onEnableAllFeatures: () => void;
}

export const APP_VERSION = 'v1.3.0';

export const VersionChangelogModal: React.FC<VersionChangelogModalProps> = ({
  isOpen,
  onClose,
  features,
  onUpdateFeatures,
  onResetToClassic,
  onEnableAllFeatures,
}) => {
  if (!isOpen) return null;

  const isClassicMode = !features.showConceptExpander && !features.showAutoRunner && !features.showSeoMetadata;
  const isFullMode = features.showConceptExpander && features.showAutoRunner && features.showSeoMetadata;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto font-mono">
      <div className="relative w-full max-w-2xl bg-white border-2 border-stone-900 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-900 text-white px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4 fill-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
                  Versi &amp; Riwayat Rilis ({APP_VERSION})
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-400 text-stone-900 font-bold uppercase">
                  Active Release
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Pilih mode antarmuka (Klasik / Lengkap) atau tinjau catatan pembaruan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Feature Mode Switcher Box */}
          <div className="border border-stone-300 bg-stone-50 p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-stone-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Mode Tampilan Antarmuka (Feature Switcher)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={onEnableAllFeatures}
                  className={`px-2 py-0.5 border font-bold uppercase transition-colors cursor-pointer ${
                    isFullMode
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
                  }`}
                >
                  Mode Lengkap (v1.3.0)
                </button>
                <button
                  type="button"
                  onClick={onResetToClassic}
                  className={`px-2 py-0.5 border font-bold uppercase transition-colors cursor-pointer ${
                    isClassicMode
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
                  }`}
                >
                  Mode Klasik (v1.0.0)
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-600 font-sans">
              Anda bebas menyalakan atau mematikan fitur baru jika menyukai tampilan sederhana seperti versi awal:
            </p>

            {/* Individual Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-start gap-2 p-2 bg-white border border-stone-200 cursor-pointer hover:border-stone-400 select-none">
                <input
                  type="checkbox"
                  checked={features.showConceptExpander}
                  onChange={(e) => onUpdateFeatures({ showConceptExpander: e.target.checked })}
                  className="mt-0.5 accent-stone-900"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-[11px]">AI Concept Expander</div>
                  <p className="text-[10px] text-stone-500 font-sans leading-tight">
                    Widget pembuat 4 ide subjek 3–4 kata di bawah input.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 bg-white border border-stone-200 cursor-pointer hover:border-stone-400 select-none">
                <input
                  type="checkbox"
                  checked={features.showAutoRunner}
                  onChange={(e) => onUpdateFeatures({ showAutoRunner: e.target.checked })}
                  className="mt-0.5 accent-stone-900"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-[11px]">Auto-Runner Wizard</div>
                  <p className="text-[10px] text-stone-500 font-sans leading-tight">
                    Tombol wizard batch 1–50 loop di navbar &amp; header.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2 bg-white border border-stone-200 cursor-pointer hover:border-stone-400 select-none">
                <input
                  type="checkbox"
                  checked={features.showSeoMetadata}
                  onChange={(e) => onUpdateFeatures({ showSeoMetadata: e.target.checked })}
                  className="mt-0.5 accent-stone-900"
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-[11px]">Metadata &amp; SEO Title</div>
                  <p className="text-[10px] text-stone-500 font-sans leading-tight">
                    Judul Adobe Stock 120 char &amp; injeksi metadata biner.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Release History (Changelog) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1.5">
              <GitCommit className="w-4 h-4 text-stone-700" />
              <span>Riwayat Rilis &amp; Catatan Pembaruan (Changelog)</span>
            </div>

            {/* Version 1.3.0 */}
            <div className="border border-stone-900 bg-white p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-stone-900 text-white text-xs font-bold">
                    v1.3.0
                  </span>
                  <span className="text-xs font-bold text-stone-900">
                    Smart Concept Expander &amp; Clean Naming
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">September 2026</span>
              </div>
              <ul className="text-[11px] text-stone-700 space-y-1 font-sans list-disc list-inside">
                <li>
                  <strong>AI Concept &amp; Keyword Expander:</strong> Mengembangkan 1–2 kata dasar menjadi 4 ide subjek netral (3–4 kata) tanpa bertabrakan dengan gaya vektor.
                </li>
                <li>
                  <strong>Pembersihan Penamaan File:</strong> Menghapus teks <code className="bg-stone-100 px-1">1x1</code> secara menyeluruh dari nama file download &amp; simpanan.
                </li>
                <li>
                  <strong>Modal Versi &amp; Feature Switcher:</strong> Kemudahan beralih antara Mode Lengkap vs Mode Klasik v1.0.0.
                </li>
              </ul>
            </div>

            {/* Version 1.2.0 */}
            <div className="border border-stone-200 bg-stone-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-stone-700 text-white text-xs font-bold">
                    v1.2.0
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    Auto-Runner Wizard &amp; Error Center
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">September 2026</span>
              </div>
              <ul className="text-[11px] text-stone-600 space-y-1 font-sans list-disc list-inside">
                <li>
                  <strong>Auto-Runner Wizard (Batch Pipeline):</strong> Eksekusi sekuensial otomatis 1–50 item dengan kontrol Pause, Resume, Stop, dan live cost tracker.
                </li>
                <li>
                  <strong>Error Logging System:</strong> Pencatatan log kegagalan render &amp; API harian ke SQLite dan modal inspeksi log sistem.
                </li>
                <li>
                  <strong>Kurs Harian Real-time:</strong> Integrasi kurs USD → IDR dinamis via API dengan fallback SQLite cache harian.
                </li>
              </ul>
            </div>

            {/* Version 1.1.0 */}
            <div className="border border-stone-200 bg-stone-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-stone-600 text-white text-xs font-bold">
                    v1.1.0
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    Adobe Stock SEO &amp; Zero-Dependency Metadata
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">September 2026</span>
              </div>
              <ul className="text-[11px] text-stone-600 space-y-1 font-sans list-disc list-inside">
                <li>
                  <strong>Adobe Stock SEO Title (≤120 Karakter) &amp; 10–48 Keywords:</strong> Optimasi metadata microstock otomatis dari prompt engine.
                </li>
                <li>
                  <strong>Injektor Metadata Biner 3-Lapisan (IPTC IIM 8BIM, EXIF IFD0 UCS-2, Adobe XMP):</strong> 100% native JavaScript tanpa library luar.
                </li>
                <li>
                  <strong>Contributor Profile Settings:</strong> Kustomisasi nama Author, Software, Credit, dan Source yang bersih dari label "AI".
                </li>
              </ul>
            </div>

            {/* Version 1.0.0 */}
            <div className="border border-stone-200 bg-stone-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-stone-500 text-white text-xs font-bold">
                    v1.0.0
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    Initial Vector Studio Release
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">September 2026</span>
              </div>
              <ul className="text-[11px] text-stone-600 space-y-1 font-sans list-disc list-inside">
                <li>Arsitektur mandiri: React 19 + Fastify + SQLite lokal (<code className="bg-stone-200 px-1 text-[10px]">data/prompt_studio.db</code>).</li>
                <li>Sistem kartu batch mandiri side-by-side (Prompt di kiri, Visual 1:1 di kanan).</li>
                <li>Pra-estimasi token &amp; pemisahan biaya riil terpisah (DeepSeek v4 &amp; GPT Image 2.5).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-stone-200 bg-stone-50 px-5 py-3.5 flex items-center justify-between shrink-0 text-xs">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Semua konfigurasi &amp; mode tersimpan aman di browser lokal Anda.</span>
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
