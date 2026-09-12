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
  const [authorName, setAuthorName] = useState(profile.authorName);
  const [softwareName, setSoftwareName] = useState(profile.softwareName);
  const [credit, setCredit] = useState(profile.credit);
  const [source, setSource] = useState(profile.source);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuthorName(profile.authorName);
      setSoftwareName(profile.softwareName);
      setCredit(profile.credit);
      setSource(profile.source);
      setSavedSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      authorName: authorName.trim() || DEFAULT_CONTRIBUTOR_PROFILE.authorName,
      softwareName: softwareName.trim() || DEFAULT_CONTRIBUTOR_PROFILE.softwareName,
      credit: credit.trim() || authorName.trim() || DEFAULT_CONTRIBUTOR_PROFILE.credit,
      source: source.trim() || DEFAULT_CONTRIBUTOR_PROFILE.source,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setAuthorName(DEFAULT_CONTRIBUTOR_PROFILE.authorName);
    setSoftwareName(DEFAULT_CONTRIBUTOR_PROFILE.softwareName);
    setCredit(DEFAULT_CONTRIBUTOR_PROFILE.credit);
    setSource(DEFAULT_CONTRIBUTOR_PROFILE.source);
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
              Metadata biner (IPTC, EXIF, XMP) akan diselaraskan dengan data di bawah ini tanpa memuat kata <em>"AI"</em> atau <em>"Generator"</em> demi menjaga kelayakan aset saat proses review kurator.
            </p>
          </div>

          {/* ================================================================ */}
          {/* 1. AUTHOR / ARTIST / CREATOR                                     */}
          {/* ================================================================ */}
          <div className="space-y-1.5 p-3 bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-900 uppercase flex items-center gap-1.5">
                <span>1. Nama Author / Artist / Creator:</span>
              </label>
              <span className="text-[10px] bg-stone-900 text-white px-1.5 py-0.2 font-bold">WAJIB</span>
            </div>

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
              required
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
              <p className="text-stone-500 text-[9px] pt-0.5">
                ↳ <em>Penjelasan:</em> Diisi nama asli Anda, nama akun kontributor Adobe Stock, atau nama studio/brand Anda.
              </p>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 2. SOFTWARE / TOOL TAG                                           */}
          {/* ================================================================ */}
          <div className="space-y-1.5 p-3 bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-900 uppercase flex items-center gap-1.5">
                <span>2. Tag Software / Tool Editor:</span>
              </label>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 font-bold">
                BERSIH (NON-AI)
              </span>
            </div>

            <input
              type="text"
              value={softwareName}
              onChange={(e) => setSoftwareName(e.target.value)}
              placeholder="Contoh: Adobe Illustrator"
              className="w-full p-2.5 bg-white border-2 border-stone-300 focus:border-stone-900 outline-hidden font-mono text-xs transition-colors"
              required
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
              <p className="text-stone-500 text-[9px] pt-0.5">
                ↳ <em>Penjelasan:</em> Gunakan software editor vektor standar. Jangan mengisi nama generator AI agar tidak terfilter oleh kurator.
              </p>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 3. CREDIT / COPYRIGHT HOLDER                                     */}
          {/* ================================================================ */}
          <div className="space-y-1.5 p-3 bg-stone-50 border border-stone-200">
            <label className="font-bold text-stone-900 uppercase">
              3. Credit / Copyright Holder:
            </label>

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
              <p className="text-stone-500 text-[9px]">
                ↳ <em>Penjelasan:</em> Pemegang hak cipta karya. Otomatis membentuk teks <code>Copyright © {new Date().getFullYear()} {credit || authorName || 'Author'}. All rights reserved.</code>
              </p>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 4. SOURCE / ASAL KARYA                                           */}
          {/* ================================================================ */}
          <div className="space-y-1.5 p-3 bg-stone-50 border border-stone-200">
            <label className="font-bold text-stone-900 uppercase">
              4. Source / Asal Karya:
            </label>

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
                <span>💡 Contoh Isian (Klik untuk mengisi cepat):</span>
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
              <p className="text-stone-500 text-[9px] pt-0.5">
                ↳ <em>Penjelasan:</em> Keterangan portofolio atau arsip asal aset vektor Anda.
              </p>
            </div>
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
