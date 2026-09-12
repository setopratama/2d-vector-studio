// src/components/CardLoadingBar.tsx
import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface CardLoadingBarProps {
  isLoading: boolean;
  label?: string;
  completedLabel?: string;
  estimatedDurationMs?: number;
  className?: string;
  colorScheme?: 'amber' | 'stone' | 'emerald' | 'indigo';
}

export const CardLoadingBar: React.FC<CardLoadingBarProps> = ({
  isLoading,
  label = 'MEMPROSES...',
  completedLabel = 'SELESAI 100%',
  estimatedDurationMs = 3500,
  className = '',
  colorScheme = 'amber',
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let intervalId: any;
    let timerId: any;

    if (isLoading) {
      setIsVisible(true);
      setIsCompleted(false);
      setProgress((prev) => (prev > 0 && prev < 95 ? prev : 3));

      const startTime = Date.now();

      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        // Kurva eksponensial alami: cepat di awal, melambat di 85-95%
        const factor = 1 - Math.exp((-2.5 * elapsed) / estimatedDurationMs);
        const calculated = Math.min(95, Math.floor(factor * 96));
        setProgress((prev) => Math.max(prev, calculated));
      }, 60);
    } else if (isVisible) {
      // Selesai diproses -> lompat ke 100%
      setProgress(100);
      setIsCompleted(true);

      timerId = setTimeout(() => {
        setIsVisible(false);
        setIsCompleted(false);
        setProgress(0);
      }, 700);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timerId);
    };
  }, [isLoading, estimatedDurationMs, isVisible]);

  if (!isVisible) return null;

  // Warna aksen bar sesuai skema
  const getBarColor = () => {
    if (isCompleted) return 'bg-emerald-500';
    switch (colorScheme) {
      case 'indigo':
        return 'bg-indigo-600';
      case 'stone':
        return 'bg-stone-900';
      case 'emerald':
        return 'bg-emerald-600';
      case 'amber':
      default:
        return 'bg-amber-500';
    }
  };

  const getTextColor = () => {
    if (isCompleted) return 'text-emerald-700';
    switch (colorScheme) {
      case 'indigo':
        return 'text-indigo-700';
      case 'stone':
        return 'text-stone-800';
      case 'emerald':
        return 'text-emerald-700';
      case 'amber':
      default:
        return 'text-amber-700';
    }
  };

  return (
    <div
      className={`border-t border-stone-200 bg-stone-50 px-4 py-2 transition-all duration-300 animate-fadeIn ${className}`}
    >
      {/* Baris Informasi & Angka Persentase */}
      <div className="flex items-center justify-between font-mono text-[10px] mb-1.5">
        <div className={`flex items-center gap-1.5 font-bold uppercase tracking-wider ${getTextColor()}`}>
          {isCompleted ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          <span>{isCompleted ? completedLabel : label}</span>
        </div>

        {/* Counter Hitungan 0 - 100% di Sebelah Kanan */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-stone-400 font-normal">STATUS:</span>
          <span
            className={`font-bold px-1.5 py-0.5 border ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-white text-stone-900 border-stone-300'
            }`}
          >
            {Math.min(100, Math.max(0, progress))}%
          </span>
        </div>
      </div>

      {/* Track & Line Progress yang Berjalan */}
      <div className="relative w-full h-1.5 bg-stone-200 overflow-hidden rounded-none">
        <div
          className={`h-full transition-all duration-150 ease-out ${getBarColor()}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
        {!isCompleted && (
          // Efek kilau / sweep animasi tambahan
          <div
            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{
              animation: 'shimmer 1.5s infinite linear',
            }}
          />
        )}
      </div>
    </div>
  );
};
