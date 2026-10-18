// ============================================================================
// MSOT Clubs — useClubDetail Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Club, CoordinatorApplication } from '../types/club';
import {
  fetchClubById,
  fetchUserApplication,
  submitCoordinatorApplication,
} from '../services/clubService';
import { useAuth } from '../context/AuthContext';
import { DEMO_CLUBS, DEMO_APPLICATIONS } from '../lib/demoData';

export interface UseClubDetailResult {
  club: Club | null;
  userApplication: CoordinatorApplication | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: Error | null;
  isDemoFixture: boolean;
  applyToClub: (statement: string) => Promise<{ success: boolean; error: Error | null }>;
  refetch: () => Promise<void>;
}

export function useClubDetail(clubId?: string): UseClubDetailResult {
  const { user, isDemoMode } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [userApplication, setUserApplication] = useState<CoordinatorApplication | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const loadClub = useCallback(async () => {
    if (!clubId) {
      setIsLoading(false);
      setClub(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (isDemoMode) {
      const found = DEMO_CLUBS.find((c) => c.id === clubId) || null;
      setClub(found);

      if (user && found) {
        const existingApp = DEMO_APPLICATIONS.find(
          (a) => a.clubId === found.id && a.userId === user.id
        ) || null;
        setUserApplication(existingApp);
      }
      setIsLoading(false);
      return;
    }

    const { data: clubData, error: clubErr } = await fetchClubById(clubId);
    if (clubErr) {
      setError(clubErr);
      setClub(null);
    } else {
      setClub(clubData);

      // Check current user's application if authenticated
      if (user?.id && clubData) {
        const { data: appData } = await fetchUserApplication(clubData.id, user.id);
        setUserApplication(appData);
      }
    }
    setIsLoading(false);
  }, [clubId, isDemoMode, user]);

  useEffect(() => {
    loadClub();
  }, [loadClub]);

  const applyToClub = async (statement: string): Promise<{ success: boolean; error: Error | null }> => {
    if (!club || !user) {
      return { success: false, error: new Error('You must be signed in to submit an application.') };
    }

    setIsSubmitting(true);

    if (isDemoMode) {
      const mockApp: CoordinatorApplication = {
        id: `demo-app-${Date.now()}`,
        clubId: club.id,
        clubName: club.name,
        userId: user.id,
        applicantName: user.fullName,
        applicantEmail: user.email,
        statementOfPurpose: statement,
        answers: {},
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setUserApplication(mockApp);
      setIsSubmitting(false);
      return { success: true, error: null };
    }

    const res = await submitCoordinatorApplication(club.id, user.id, statement);
    if (res.success) {
      // Reload application status
      const { data: reloadedApp } = await fetchUserApplication(club.id, user.id);
      setUserApplication(reloadedApp);
    }
    setIsSubmitting(false);
    return res;
  };

  return {
    club,
    userApplication,
    isLoading,
    isSubmitting,
    error,
    isDemoFixture: isDemoMode,
    applyToClub,
    refetch: loadClub,
  };
}
