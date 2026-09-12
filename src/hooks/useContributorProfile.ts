// src/hooks/useContributorProfile.ts
import { useState, useEffect, useCallback } from 'react';

export interface ContributorProfile {
  includeAuthor: boolean;
  authorName: string;
  includeSoftware: boolean;
  softwareName: string;
  includeCredit: boolean;
  credit: string;
  includeSource: boolean;
  source: string;
}

const STORAGE_KEY = 'microstock_contributor_profile_v2';

export const DEFAULT_CONTRIBUTOR_PROFILE: ContributorProfile = {
  includeAuthor: true,
  authorName: 'Vector Artist',
  includeSoftware: true,
  softwareName: 'Adobe Illustrator',
  includeCredit: true,
  credit: 'Vector Artist',
  includeSource: true,
  source: 'Original Vector Artwork',
};

export function useContributorProfile() {
  const [profile, setProfile] = useState<ContributorProfile>(() => {
    try {
      // Try v2 first, fallback to v1
      const savedV2 = localStorage.getItem(STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        return {
          includeAuthor: parsed.includeAuthor !== undefined ? Boolean(parsed.includeAuthor) : true,
          authorName: parsed.authorName || DEFAULT_CONTRIBUTOR_PROFILE.authorName,
          includeSoftware: parsed.includeSoftware !== undefined ? Boolean(parsed.includeSoftware) : true,
          softwareName: parsed.softwareName || DEFAULT_CONTRIBUTOR_PROFILE.softwareName,
          includeCredit: parsed.includeCredit !== undefined ? Boolean(parsed.includeCredit) : true,
          credit: parsed.credit || parsed.authorName || DEFAULT_CONTRIBUTOR_PROFILE.credit,
          includeSource: parsed.includeSource !== undefined ? Boolean(parsed.includeSource) : true,
          source: parsed.source || DEFAULT_CONTRIBUTOR_PROFILE.source,
        };
      }

      const savedV1 = localStorage.getItem('microstock_contributor_profile_v1');
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        return {
          includeAuthor: Boolean(parsed.authorName),
          authorName: parsed.authorName || DEFAULT_CONTRIBUTOR_PROFILE.authorName,
          includeSoftware: Boolean(parsed.softwareName),
          softwareName: parsed.softwareName || DEFAULT_CONTRIBUTOR_PROFILE.softwareName,
          includeCredit: Boolean(parsed.credit),
          credit: parsed.credit || parsed.authorName || DEFAULT_CONTRIBUTOR_PROFILE.credit,
          includeSource: Boolean(parsed.source),
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
