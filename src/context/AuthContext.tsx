// ============================================================================
// MSOT Clubs — Auth Context & Session Management
// ============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, UserRole } from '../types/auth';
import { supabase, isSupabaseConfigured, isDemoModeAllowed, getSupabaseConfigStatus } from '../lib/supabase';
import { DEMO_PROFILES } from '../lib/demoData';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  currentRole: UserRole;
  configMessage: string | null;
  switchDemoRole: (role: UserRole) => void;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (
    fullName: string,
    email: string,
    pass: string
  ) => Promise<{
    user: import('@supabase/supabase-js').User | null;
    session: import('@supabase/supabase-js').Session | null;
    needsEmailConfirmation: boolean;
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(isDemoModeAllowed());

  const status = getSupabaseConfigStatus();

  // Load user profile from Supabase if live credentials exist
  const fetchLiveProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile with maybeSingle() to prevent PGRST116 errors on missing rows
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let profileData = data as unknown as import('../types/database').Database['public']['Tables']['profiles']['Row'] | null;

      // Profile recovery flow: Handle unseeded/newly registered users without profiles
      if (profileErr || !profileData) {
        console.warn('Profile record not found in public.profiles for user:', userId, profileErr?.message);

        let authUser: import('@supabase/supabase-js').User | null = null;
        try {
          const { data: authUserData } = await supabase.auth.getUser();
          authUser = authUserData?.user || null;
        } catch {
          // Ignore
        }

        const fullName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Student';
        const userEmail = authUser?.email || '';

        // Attempt to insert missing profile row into public.profiles
        try {
          type ProfileInsert = import('../types/database').Database['public']['Tables']['profiles']['Insert'];
          const profilePayload: ProfileInsert = {
            id: userId,
            full_name: fullName,
            email: userEmail,
          };
          await (supabase.from('profiles') as unknown as { insert: (row: ProfileInsert) => Promise<unknown> }).insert(profilePayload);

          const { data: reloaded } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          profileData = reloaded as unknown as typeof profileData;
        } catch (insertErr) {
          console.warn('Could not auto-insert profile into table:', insertErr);
        }

        // If database profile still could not be created/fetched (e.g. client insert blocked by RLS),
        // provide a safe, resilient default student profile so the user is never stuck in limbo:
        if (!profileData) {
          const fallbackUser: UserProfile = {
            id: userId,
            fullName,
            email: userEmail,
            campusId: '',
            campusName: 'MSOT Campus',
            campusCode: 'MSOT',
            roles: ['student'],
            memberships: [],
            createdAt: authUser?.created_at || new Date().toISOString(),
          };
          setUser(fallbackUser);
          setCurrentRole('student');
          return;
        }
      }

      // 2. Fetch User Roles
      const { data: rawRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const rolesData = rawRoles as unknown as { role: UserRole }[] | null;
      const roles = (rolesData && rolesData.length > 0)
        ? rolesData.map((r) => r.role)
        : (['student'] as UserRole[]);

      // 3. Fetch Club Memberships & Delegations
      const { data: rawMembers } = await supabase
        .from('club_memberships')
        .select(`
          club_id,
          role,
          status,
          clubs ( id, name, code )
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      const memberData = rawMembers as unknown as {
        club_id: string;
        role: string;
        status: string;
        clubs: { id: string; name: string; code: string } | null;
      }[] | null;

      const { data: rawPres } = await supabase
        .from('club_presidencies')
        .select('club_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      const presData = rawPres as unknown as { club_id: string }[] | null;
      const activePresClubIds = new Set(presData?.map((p) => p.club_id) || []);

      const { data: rawDeleg } = await supabase
        .from('club_permission_delegations')
        .select('club_id, permission')
        .eq('recipient_id', userId)
        .eq('is_revoked', false);

      const delegData = rawDeleg as unknown as { club_id: string; permission: string }[] | null;

      const memberships = (memberData || []).map((m) => {
        const club = m.clubs;
        const clubId = m.club_id;
        const isPres = activePresClubIds.has(clubId);
        const delegated = (delegData || [])
          .filter((d) => d.club_id === clubId)
          .map((d) => d.permission as unknown as import('../types/auth').ClubPermission);

        return {
          clubId,
          clubName: club?.name || 'Club',
          clubCode: club?.code || 'CLUB',
          role: 'coordinator' as const,
          isPresident: isPres,
          status: 'active' as const,
          delegatedPermissions: isPres
            ? [
                'review_applications',
                'manage_club_profile',
                'create_activity_plan',
                'submit_activity_plan',
                'run_checkin',
                'correct_attendance',
                'manage_submissions',
                'evaluate_submissions',
                'manage_events',
                'view_reports',
                'issue_certificates',
              ] as import('../types/auth').ClubPermission[]
            : delegated,
        };
      });

      const loadedUser: UserProfile = {
        id: profileData.id,
        studentId: profileData.student_id || undefined,
        fullName: profileData.full_name || 'Student',
        email: profileData.email || '',
        campusId: profileData.campus_id || '',
        campusName: 'MSOT Campus',
        campusCode: 'MSOT',
        year: profileData.year || undefined,
        section: profileData.section || undefined,
        phone: profileData.phone || undefined,
        avatarUrl: profileData.avatar_url || undefined,
        roles,
        memberships,
        createdAt: profileData.created_at,
      };

      setUser(loadedUser);
      setCurrentRole(roles[0] || 'student');
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Fallback on unexpected error if user is authenticated:
      try {
        const { data: authUserData } = await supabase.auth.getUser();
        if (authUserData?.user) {
          const authUser = authUserData.user;
          const fallbackUser: UserProfile = {
            id: userId,
            fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
            email: authUser.email || '',
            campusId: '',
            campusName: 'MSOT Campus',
            campusCode: 'MSOT',
            roles: ['student'],
            memberships: [],
            createdAt: authUser.created_at || new Date().toISOString(),
          };
          setUser(fallbackUser);
          setCurrentRole('student');
          return;
        }
      } catch {
        // Fallback failed
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      if (import.meta.env.PROD) {
        // In production build, do NOT permit demo mode or dummy logins!
        setIsDemoMode(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Development only: Demo Mode
      setIsDemoMode(true);
      const savedRole = (localStorage.getItem('msot_demo_role') as UserRole) || 'student';
      const initialProfile = DEMO_PROFILES[savedRole] || DEMO_PROFILES.student;
      setUser(initialProfile);
      setCurrentRole(savedRole);
      setIsLoading(false);
      return;
    }

    // Live Supabase Auth Flow
    setIsDemoMode(false);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchLiveProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchLiveProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchLiveProfile]);

  // Demo Mode Persona Switcher
  const switchDemoRole = useCallback((role: UserRole) => {
    // Security check: Disallow demo switching if live Supabase is configured or running in production
    if (isSupabaseConfigured() || import.meta.env.PROD) {
      console.warn('Unauthorized attempt: Demo role switching is strictly disabled in production or live Supabase mode.');
      return;
    }
    localStorage.setItem('msot_demo_role', role);
    setCurrentRole(role);
    const profile = DEMO_PROFILES[role] || DEMO_PROFILES.student;
    setUser(profile);
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      if (import.meta.env.PROD) {
        return {
          error: new Error(
            'Authentication service is not configured. Live Supabase credentials are required in production.'
          ),
        };
      }

      // In development demo mode only:
      const matched = Object.values(DEMO_PROFILES).find((p) => p.email === email);
      if (matched) {
        setUser(matched);
        setCurrentRole(matched.roles[0]);
        return { error: null };
      }
      setUser(DEMO_PROFILES.student);
      setCurrentRole('student');
      return { error: null };
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setIsLoading(false);
      return { error };
    }

    if (data?.user) {
      await fetchLiveProfile(data.user.id);
    } else {
      setIsLoading(false);
    }

    return { error: null };
  };

  const signUp = async (
    fullName: string,
    email: string,
    pass: string
  ): Promise<{
    user: import('@supabase/supabase-js').User | null;
    session: import('@supabase/supabase-js').Session | null;
    needsEmailConfirmation: boolean;
    error: Error | null;
  }> => {
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        session: null,
        needsEmailConfirmation: false,
        error: new Error(
          'Supabase credentials are not configured in .env.local. Live backend connection is required to create a new account.'
        ),
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return {
        user: null,
        session: null,
        needsEmailConfirmation: false,
        error,
      };
    }

    const createdUser = data.user;
    const session = data.session;
    const needsEmailConfirmation = !session;

    // Check database profile creation flow:
    // If a session was immediately established, check if a profile already exists
    // (e.g. created by a database trigger on auth.users).
    // Avoid creating duplicate profiles if a trigger already handles this!
    if (session && createdUser) {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', createdUser.id)
          .maybeSingle();

        if (!existingProfile) {
          type ProfileInsert = import('../types/database').Database['public']['Tables']['profiles']['Insert'];
          const profilePayload: ProfileInsert = {
            id: createdUser.id,
            full_name: fullName,
            email: createdUser.email || email,
          };
          await (supabase.from('profiles') as unknown as { insert: (row: ProfileInsert) => Promise<unknown> }).insert(profilePayload);
        }
      } catch (profileErr) {
        // Ignored or logged if already handled concurrently by trigger
        console.warn('Profile initialization note:', profileErr);
      }
    }

    return {
      user: createdUser,
      session,
      needsEmailConfirmation,
      error: null,
    };
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured: status.configured,
        isDemoMode,
        currentRole,
        configMessage: status.missingMessage,
        switchDemoRole,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
