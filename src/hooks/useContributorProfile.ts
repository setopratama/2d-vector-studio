// src/hooks/useContributorProfile.ts
import { useState, useEffect, useCallback } from 'react';

export interface ContributorProfile {
  authorName: string;
  softwareName: string;
  credit: string;
  source: string;
}

const STORAGE_KEY = 'microstock_contributor_profile_v1';

export const DEFAULT_CONTRIBUTOR_PROFILE: ContributorProfile = {
  authorName: 'Vector Artist',
  softwareName: 'Adobe Illustrator',
  credit: 'Vector Artist',
  source: 'Original Vector Artwork',
};

export function useContributorProfile() {
  const [profile, setProfile] = useState<ContributorProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          authorName: parsed.authorName || DEFAULT_CONTRIBUTOR_PROFILE.authorName,
          softwareName: parsed.softwareName || DEFAULT_CONTRIBUTOR_PROFILE.softwareName,
          credit: parsed.credit || parsed.authorName || DEFAULT_CONTRIBUTOR_PROFILE.credit,
          source: parsed.source || DEFAULT_CONTRIBUTOR_PROFILE.source,
        };
      }
    } catch (e) {
      console.warn('Failed to read contributor profile from localStorage', e);
    }
    return DEFAULT_CONTRIBUTOR_PROFILE;
  });

  const updateProfile = useCallback((newProfile: Partial<ContributorProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...newProfile };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save contributor profile to localStorage', e);
      }
      return updated;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setProfile(DEFAULT_CONTRIBUTOR_PROFILE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTRIBUTOR_PROFILE));
    } catch (e) {
      console.warn('Failed to reset contributor profile in localStorage', e);
    }
  }, []);

  return {
    profile,
    updateProfile,
    resetToDefault,
  };
}
