// src/components/MetadataSettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User, Cpu, ShieldCheck, Check, RotateCcw, Sparkles, HelpCircle, Info } from 'lucide-react';
import { ContributorProfile, DEFAULT_CONTRIBUTOR_PROFILE } from '../hooks/useContributorProfile';

interface MetadataSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ContributorProfile;
  onSaveProfile: (profile: ContributorProfile) => void;
}

export const MetadataSettingsModal: React.FC<MetadataSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [includeAuthor, setIncludeAuthor] = useState(profile.includeAuthor ?? true);
  const [authorName, setAuthorName] = useState(profile.authorName);
  const [includeSoftware, setIncludeSoftware] = useState(profile.includeSoftware ?? true);
  const [softwareName, setSoftwareName] = useState(profile.softwareName);
  const [includeCredit, setIncludeCredit] = useState(profile.includeCredit ?? true);
  const [credit, setCredit] = useState(profile.credit);
  const [includeSource, setIncludeSource] = useState(profile.includeSource ?? true);
  const [source, setSource] = useState(profile.source);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIncludeAuthor(profile.includeAuthor ?? true);
      setAuthorName(profile.authorName);
      setIncludeSoftware(profile.includeSoftware ?? true);
      setSoftwareName(profile.softwareName);
      setIncludeCredit(profile.includeCredit ?? true);
      setCredit(profile.credit);
      setIncludeSource(profile.includeSource ?? true);
      setSource(profile.source);
      setSavedSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      includeAuthor,
      authorName: authorName.trim(),
      includeSoftware,
      softwareName: softwareName.trim(),
      includeCredit,
      credit: credit.trim(),
      includeSource,
      source: source.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setIncludeAuthor(DEFAULT_CONTRIBUTOR_PROFILE.includeAuthor);
    setAuthorName(DEFAULT_CONTRIBUTOR_PROFILE.authorName);
    setIncludeSoftware(DEFAULT_CONTRIBUTOR_PROFILE.includeSoftware);
    setSoftwareName(DEFAULT_CONTRIBUTOR_PROFILE.softwareName);
    setIncludeCredit(DEFAULT_CONTRIBUTOR_PROFILE.includeCredit);
    setCredit(DEFAULT_CONTRIBUTOR_PROFILE.credit);
    setIncludeSource(DEFAULT_CONTRIBUTOR_PROFILE.includeSource);
    setSource(DEFAULT_CONTRIBUTOR_PROFILE.source);
  };

  const handleClearAll = () => {
    setIncludeAuthor(false);
    setIncludeSoftware(false);
    setIncludeCredit(false);
    setIncludeSource(false);
  };

  const handleSelectAll = () => {
    setIncludeAuthor(true);
    setIncludeSoftware(true);
    setIncludeCredit(true);
    setIncludeSource(true);
  };

  const authorExamples = [
    'Seto Pratama',
    'Nusantara Graphic Studio',
    'VectorCraft Studio',
    'Creative Line Art',
  ];

  const softwareExamples = [
    'Adobe Illustrator',
    'Adobe Illustrator 28.0',
    'CorelDRAW',
    'Affinity Designer',
    'Inkscape',
  ];

  const sourceExamples = [
    'Original Vector Artwork',
    'Vector Studio Portfolio',
    'Personal Stock Collection',
  ];

  const activeCount = [includeAuthor, includeSoftware, includeCredit, includeSource].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border-2 border-stone-900 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span className="font-bold uppercase tracking-wider text-xs sm:text-sm">
              Profil Metadata Kontributor Microstock
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Microstock Safety Notice */}
          <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 space-y-1 text-[11px] leading-relaxed">
            <div className="font-bold uppercase flex items-center gap-1 text-amber-900">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Standar Aman Agensi Microstock (Adobe Stock / Shutterstock / Freepik)</span>
            </div>
            <p className="text-stone-700">
              Data yang dicentang akan disuntikkan ke metadata biner (IPTC, EXIF, XMP). Jika <strong>dikosongkan / unchecked</strong>, data tersebut <strong>tidak akan disuntikkan sama sekali</strong> ke dalam file gambar.
            </p>
          </div>

          {/* Quick Toolbar (Centang Semua / Kosongkan Semua) */}
          <div className="flex items-center justify-between bg-stone-100 p-2.5 border border-stone-300 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <span>Status Injeksi:</span>
              <span className={`px-1.5 py-0.5 border text-[10px] ${activeCount === 0 ? 'bg-stone-200 text-stone-600 border-stone-400' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                {activeCount === 0 ? 'SEMUA KOSONG (0/4 AKTIF)' : `${activeCount}/4 DATA AKTIF`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-300 font-bold text-[10px] uppercase text-stone-800 transition-colors cursor-pointer"
              >
                Centang Semua
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-300 font-bold text-[10px] uppercase text-stone-800 transition-colors cursor-pointer"
              >
                Kosongkan Semua
              </button>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 1. AUTHOR / ARTIST / CREATOR                                     */}
          {/* ================================================================ */}
          <div className={`space-y-1.5 p-3 border transition-colors ${includeAuthor ? 'bg-stone-50 border-stone-300' : 'bg-stone-100/60 border-stone-200 opacity-75'}`}>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeAuthor}
                  onChange={(e) => setIncludeAuthor(e.target.checked)}
                  className="w-4 h-4 rounded-none border-stone-400 text-stone-900 accent-stone-900 cursor-pointer"
                />
                <span className="font-bold text-stone-900 uppercase">
                  1. Nama Author / Artist / Creator
                </span>
              </label>
              <span className={`text-[10px] px-1.5 py-0.2 font-bold ${includeAuthor ? 'bg-stone-900 text-white' : 'bg-stone-300 text-stone-600'}`}>
                {includeAuthor ? 'AKTIF' : 'DIABAIKAN'}
              </span>
            </div>

            {includeAuthor ? (
              <>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => {
                    setAuthorName(e.target.value);
                    if (!credit || credit === authorName) {
                      setCredit(e.target.value);
                    }
                  }}
                  placeholder="Ketik nama Anda / nama toko microstock Anda..."
                  className="w-full p-2.5 bg-white border-2 border-stone-300 focus:border-stone-900 outline-hidden font-mono text-xs transition-colors"
                />

                {/* Example Box */}
                <div className="p-2 bg-white border border-stone-200 text-[10px] space-y-1">
                  <div className="text-stone-600 flex items-center gap-1 font-bold">
                    <Info className="w-3 h-3 text-stone-500" />
                    <span>💡 Contoh Isian (Klik untuk mengisi cepat):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {authorExamples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => {
                          setAuthorName(ex);
                          if (!credit || credit === authorName) setCredit(ex);
                        }}
                        className="px-2 py-0.5 bg-stone-100 hover:bg-amber-100 hover:border-amber-400 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
                      >
                        + {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-2 bg-stone-200/60 text-stone-600 text-[11px] italic font-mono border border-stone-300">
                ⚠️ Data Author tidak akan disertakan/disuntikkan ke file gambar (Kosong).
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* 2. SOFTWARE / TOOL TAG                                           */}
          {/* ================================================================ */}
          <div className={`space-y-1.5 p-3 border transition-colors ${includeSoftware ? 'bg-stone-50 border-stone-300' : 'bg-stone-100/60 border-stone-200 opacity-75'}`}>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSoftware}
                  onChange={(e) => setIncludeSoftware(e.target.checked)}
                  className="w-4 h-4 rounded-none border-stone-400 text-stone-900 accent-stone-900 cursor-pointer"
                />
                <span className="font-bold text-stone-900 uppercase">
                  2. Tag Software / Tool Editor
                </span>
              </label>
              <span className={`text-[10px] px-1.5 py-0.2 font-bold ${includeSoftware ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-300 text-stone-600'}`}>
                {includeSoftware ? 'BERSIH (NON-AI)' : 'DIABAIKAN'}
              </span>
            </div>

            {includeSoftware ? (
              <>
                <input
                  type="text"
                  value={softwareName}
                  onChange={(e) => setSoftwareName(e.target.value)}
                  placeholder="Contoh: Adobe Illustrator"
                  className="w-full p-2.5 bg-white border-2 border-stone-300 focus:border-stone-900 outline-hidden font-mono text-xs transition-colors"
                />

                {/* Example Box */}
                <div className="p-2 bg-white border border-stone-200 text-[10px] space-y-1">
                  <div className="text-stone-600 flex items-center gap-1 font-bold">
                    <Info className="w-3 h-3 text-stone-500" />
                    <span>💡 Pilihan Cepat Software Populer (Klik untuk memilih):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {softwareExamples.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSoftwareName(preset)}
                        className={`px-2 py-0.5 border transition-colors cursor-pointer ${
                          softwareName === preset
                            ? 'bg-stone-900 text-white border-stone-900 font-bold'
                            : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-amber-100 hover:border-amber-400'
                        }`}
                      >
                        {softwareName === preset ? '✓ ' : '+ '}{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-2 bg-stone-200/60 text-stone-600 text-[11px] italic font-mono border border-stone-300">
                ⚠️ Tag Software tidak akan disertakan/disuntikkan ke file gambar (Kosong).
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* 3. CREDIT / COPYRIGHT HOLDER                                     */}
          {/* ================================================================ */}
          <div className={`space-y-1.5 p-3 border transition-colors ${includeCredit ? 'bg-stone-50 border-stone-300' : 'bg-stone-100/60 border-stone-200 opacity-75'}`}>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCredit}
                  onChange={(e) => setIncludeCredit(e.target.checked)}
                  className="w-4 h-4 rounded-none border-stone-400 text-stone-900 accent-stone-900 cursor-pointer"
                />
                <span className="font-bold text-stone-900 uppercase">
                  3. Credit / Copyright Holder
                </span>
              </label>
              <span className={`text-[10px] px-1.5 py-0.2 font-bold ${includeCredit ? 'bg-stone-900 text-white' : 'bg-stone-300 text-stone-600'}`}>
                {includeCredit ? 'AKTIF' : 'DIABAIKAN'}
              </span>
            </div>

            {includeCredit ? (
              <>
                <input
                  type="text"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="Contoh: Seto Pratama atau Nama Studio Anda"
                  className="w-full p-2.5 bg-white border-2 border-stone-300 focus:border-stone-900 outline-hidden font-mono text-xs transition-colors"
                />

                <div className="p-2 bg-white border border-stone-200 text-[10px] space-y-0.5">
                  <p className="text-stone-600 font-medium">
                    💡 <em>Contoh:</em> <code>{authorName || 'Seto Pratama'}</code> atau <code>Nusantara Graphic Studio</code>
                  </p>
                </div>
              </>
            ) : (
              <div className="p-2 bg-stone-200/60 text-stone-600 text-[11px] italic font-mono border border-stone-300">
                ⚠️ Tag Credit / Copyright tidak akan disertakan ke file gambar (Kosong).
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* 4. SOURCE / ASAL KARYA                                           */}
          {/* ================================================================ */}
          <div className={`space-y-1.5 p-3 border transition-colors ${includeSource ? 'bg-stone-50 border-stone-300' : 'bg-stone-100/60 border-stone-200 opacity-75'}`}>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSource}
                  onChange={(e) => setIncludeSource(e.target.checked)}
                  className="w-4 h-4 rounded-none border-stone-400 text-stone-900 accent-stone-900 cursor-pointer"
                />
                <span className="font-bold text-stone-900 uppercase">
                  4. Source / Asal Karya
                </span>
              </label>
              <span className={`text-[10px] px-1.5 py-0.2 font-bold ${includeSource ? 'bg-stone-900 text-white' : 'bg-stone-300 text-stone-600'}`}>
                {includeSource ? 'AKTIF' : 'DIABAIKAN'}
              </span>
            </div>

            {includeSource ? (
              <>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Contoh: Original Vector Artwork"
                  className="w-full p-2.5 bg-white border-2 border-stone-300 focus:border-stone-900 outline-hidden font-mono text-xs transition-colors"
                />

                <div className="p-2 bg-white border border-stone-200 text-[10px] space-y-1">
                  <div className="text-stone-600 flex items-center gap-1 font-bold">
                    <Info className="w-3 h-3 text-stone-500" />
                    <span>💡 Contoh Isian:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sourceExamples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setSource(ex)}
                        className="px-2 py-0.5 bg-stone-100 hover:bg-amber-100 hover:border-amber-400 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
                      >
                        + {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-2 bg-stone-200/60 text-stone-600 text-[11px] italic font-mono border border-stone-300">
                ⚠️ Tag Source tidak akan disertakan ke file gambar (Kosong).
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 border border-stone-300 hover:border-stone-900 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold uppercase transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <span>Simpan Pengaturan</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
