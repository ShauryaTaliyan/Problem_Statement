// ============================================================================
// MSOT Clubs — useClubs Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Club } from '../types/club';
import { fetchClubs } from '../services/clubService';
import { useAuth } from '../context/AuthContext';
import { DEMO_CLUBS } from '../lib/demoData';

export interface UseClubsResult {
  clubs: Club[];
  isLoading: boolean;
  error: Error | null;
  isDemoFixture: boolean;
  refetch: () => Promise<void>;
}

export function useClubs(campusId?: string): UseClubsResult {
  const { isDemoMode } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadClubs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (isDemoMode) {
      const filtered = campusId && campusId !== 'all'
        ? DEMO_CLUBS.filter((c) => c.campusId === campusId)
        : DEMO_CLUBS;
      setClubs(filtered);
      setIsLoading(false);
      return;
    }

    const { data, error: fetchErr } = await fetchClubs(campusId);
    if (fetchErr) {
      setError(fetchErr);
      setClubs([]);
    } else {
      setClubs(data);
    }
    setIsLoading(false);
  }, [isDemoMode, campusId]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  return {
    clubs,
    isLoading,
    error,
    isDemoFixture: isDemoMode,
    refetch: loadClubs,
  };
}
