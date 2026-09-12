// src/hooks/useAppSettings.ts
import { useState, useEffect } from 'react';
import { AppFeatureSettings } from '../components/VersionChangelogModal';

const APP_SETTINGS_KEY = 'gpt_image_app_features_v1';

const DEFAULT_SETTINGS: AppFeatureSettings = {
  showConceptExpander: true,
  showAutoRunner: true,
  showSeoMetadata: true,
};

export function useAppSettings() {
  const [features, setFeatures] = useState<AppFeatureSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(APP_SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(features));
    } catch (e) {
      console.warn('Failed to persist app features:', e);
    }
  }, [features]);

  const updateFeatures = (updated: Partial<AppFeatureSettings>) => {
    setFeatures((prev) => ({ ...prev, ...updated }));
  };

  const resetToClassic = () => {
    setFeatures({
      showConceptExpander: false,
      showAutoRunner: false,
      showSeoMetadata: false,
    });
  };

  const enableAllFeatures = () => {
    setFeatures({
      showConceptExpander: true,
      showAutoRunner: true,
      showSeoMetadata: true,
    });
  };

  return {
    features,
    updateFeatures,
    resetToClassic,
    enableAllFeatures,
    isVersionModalOpen,
    openVersionModal: () => setIsVersionModalOpen(true),
    closeVersionModal: () => setIsVersionModalOpen(false),
  };
}
