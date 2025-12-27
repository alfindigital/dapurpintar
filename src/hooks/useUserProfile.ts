import { useState, useEffect, useCallback } from 'react';
import { UserProfile, FamilyMember, DEFAULT_PROFILE, getKategoriUsia } from '@/types/profile';

const STORAGE_KEY = 'user_profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
      } catch {
        setProfile(DEFAULT_PROFILE);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save profile to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, isLoaded]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const addFamilyMember = useCallback((member: Omit<FamilyMember, 'id' | 'kategoriUsia'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
      kategoriUsia: getKategoriUsia(member.usia),
    };
    setProfile(prev => ({
      ...prev,
      anggotaKeluarga: [...prev.anggotaKeluarga, newMember],
    }));
  }, []);

  const updateFamilyMember = useCallback((id: string, updates: Partial<Omit<FamilyMember, 'id'>>) => {
    setProfile(prev => ({
      ...prev,
      anggotaKeluarga: prev.anggotaKeluarga.map(member => {
        if (member.id !== id) return member;
        const updated = { ...member, ...updates };
        if (updates.usia !== undefined) {
          updated.kategoriUsia = getKategoriUsia(updates.usia);
        }
        return updated;
      }),
    }));
  }, []);

  const removeFamilyMember = useCallback((id: string) => {
    setProfile(prev => ({
      ...prev,
      anggotaKeluarga: prev.anggotaKeluarga.filter(member => member.id !== id),
    }));
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
  }, []);

  const hasProfile = profile.nama.trim().length > 0;

  return {
    profile,
    isLoaded,
    hasProfile,
    updateProfile,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    resetProfile,
  };
}
