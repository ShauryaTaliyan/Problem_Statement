// ============================================================================
// MSOT Clubs — useCampuses Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Campus } from '../types/club';
import { fetchCampuses } from '../services/clubService';
import { useAuth } from '../context/AuthContext';
import { DEMO_CAMPUSES } from '../lib/demoData';

export interface UseCampusesResult {
  campuses: Campus[];
  isLoading: boolean;
  error: Error | null;
  isDemoFixture: boolean;
  refetch: () => Promise<void>;
}

export function useCampuses(): UseCampusesResult {
  const { isDemoMode } = useAuth();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCampuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (isDemoMode) {
      setCampuses(DEMO_CAMPUSES);
      setIsLoading(false);
      return;
    }

    const { data, error: fetchErr } = await fetchCampuses();
    if (fetchErr) {
      setError(fetchErr);
      setCampuses([]);
    } else {
      setCampuses(data);
    }
    setIsLoading(false);
  }, [isDemoMode]);

  useEffect(() => {
    loadCampuses();
  }, [loadCampuses]);

  return {
    campuses,
    isLoading,
    error,
    isDemoFixture: isDemoMode,
    refetch: loadCampuses,
  };
}
