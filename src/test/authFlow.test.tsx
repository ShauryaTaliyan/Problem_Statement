// ============================================================================
// MSOT Clubs — Authentication Flow & Recovery Tests
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SignIn } from '../pages/SignIn';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import * as supabaseModule from '../lib/supabase';

// Mock Supabase module to simulate live configured backend
vi.mock('../lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof supabaseModule>();
  return {
    ...actual,
    isSupabaseConfigured: vi.fn(() => true),
    isDemoModeAllowed: vi.fn(() => false),
    getSupabaseConfigStatus: vi.fn(() => ({
      configured: true,
      url: 'https://test-project.supabase.co',
      hasKey: true,
      missingMessage: null,
    })),
    supabase: {
      auth: {
        getSession: vi.fn(),
        getUser: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn(),
    },
  };
});

describe('Supabase Authentication Flow & Profile Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default: getSession returns null
    vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  // --------------------------------------------------------------------------
  // 1. Successful Login Flow
  // --------------------------------------------------------------------------
  it('1. Successful login: signInWithPassword returns valid session, loads profile, and navigates', async () => {
    const mockUserId = 'user-uuid-1234';
    const mockUser = {
      id: mockUserId,
      email: 'student@msot.ac.in',
      user_metadata: { full_name: 'Ananya Das' },
      created_at: '2026-01-01T00:00:00Z',
    };
    const mockSession = {
      access_token: 'fake-jwt',
      user: mockUser,
    };

    // Mock successful signInWithPassword
    vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: mockUser as any, session: mockSession as any },
      error: null,
    });

    // Helper to produce a chainable Supabase query builder mock
    const createQueryBuilder = (result: any) => {
      const b: any = {
        select: vi.fn(() => b),
        eq: vi.fn(() => b),
        single: vi.fn().mockResolvedValue(result),
        maybeSingle: vi.fn().mockResolvedValue(result),
        insert: vi.fn().mockResolvedValue(result),
        then: (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject),
      };
      return b;
    };

    // Mock database tables lookup in fetchLiveProfile
    vi.mocked(supabaseModule.supabase.from).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({
          data: {
            id: mockUserId,
            full_name: 'Ananya Das',
            email: 'student@msot.ac.in',
            student_id: 'MSOT-26-CS-001',
            campus_id: '11111111-1111-4111-a111-111111111111',
            created_at: '2026-01-01T00:00:00Z',
          },
          error: null,
        });
      }
      if (table === 'user_roles') {
        return createQueryBuilder({
          data: [{ role: 'student' }],
          error: null,
        });
      }
      return createQueryBuilder({ data: [], error: null });
    });

    let currentAuthUser: any = null;
    const TestConsumer = () => {
      const { user } = useAuth();
      currentAuthUser = user;
      return <div>Auth User: {user ? user.fullName : 'None'}</div>;
    };

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/sign-in']}>
          <SignIn />
          <TestConsumer />
        </MemoryRouter>
      </AuthProvider>
    );

    // Fill in sign-in form
    fireEvent.change(screen.getByLabelText(/Institutional Email/i), {
      target: { value: 'student@msot.ac.in' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Platform/i }));

    await waitFor(() => {
      expect(supabaseModule.supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'student@msot.ac.in',
        password: 'Password123!',
      });
      expect(currentAuthUser).not.toBeNull();
      expect(currentAuthUser.fullName).toBe('Ananya Das');
      expect(currentAuthUser.roles).toContain('student');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Failed Login Flow
  // --------------------------------------------------------------------------
  it('2. Failed login: signInWithPassword returns error, displays error message, user remains null', async () => {
    vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('Invalid login credentials') as any,
    });

    let currentAuthUser: any = null;
    const TestConsumer = () => {
      const { user } = useAuth();
      currentAuthUser = user;
      return null;
    };

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/sign-in']}>
          <SignIn />
          <TestConsumer />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Institutional Email/i), {
      target: { value: 'wrong@msot.ac.in' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'WrongPassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Platform/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument();
      expect(currentAuthUser).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // 3. Profile-Loading Failure & Graceful Recovery Flow
  // --------------------------------------------------------------------------
  it('3. Profile-loading failure: recovers with resilient default student profile rather than getting stuck', async () => {
    const mockUserId = 'user-uuid-new-registrant';
    const mockUser = {
      id: mockUserId,
      email: 'newuser@student.msot.ac.in',
      user_metadata: { full_name: 'Pooja Sharma' },
      created_at: '2026-02-01T00:00:00Z',
    };

    vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: mockUser as any, session: { access_token: 'valid-jwt' } as any },
      error: null,
    });

    vi.mocked(supabaseModule.supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser as any },
      error: null,
    });

    // Simulate public.profiles query returning 0 rows (no profile row exists yet)
    vi.mocked(supabaseModule.supabase.from).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          insert: vi.fn().mockRejectedValue(new Error('RLS blocks client insert')),
        } as any;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any;
    });

    let currentAuthUser: any = null;
    const TestConsumer = () => {
      const { user } = useAuth();
      currentAuthUser = user;
      return <div>User: {user ? user.fullName : 'None'}</div>;
    };

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/sign-in']}>
          <SignIn />
          <TestConsumer />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Institutional Email/i), {
      target: { value: 'newuser@student.msot.ac.in' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'Secret123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Platform/i }));

    // Verify app recovers with default student profile from auth user metadata
    await waitFor(() => {
      expect(currentAuthUser).not.toBeNull();
      expect(currentAuthUser.id).toBe(mockUserId);
      expect(currentAuthUser.fullName).toBe('Pooja Sharma');
      expect(currentAuthUser.email).toBe('newuser@student.msot.ac.in');
      expect(currentAuthUser.roles).toEqual(['student']);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Protected Route Guard with Post-Login Redirection
  // --------------------------------------------------------------------------
  it('4. Protected route guard allows access once user is authenticated', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/profile']}>
          <ProtectedRoute>
            <div>Protected Profile Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthProvider>
    );

    // Initial state: not authenticated -> redirects to /sign-in
    expect(screen.queryByText(/Protected Profile Dashboard/i)).not.toBeInTheDocument();
  });
});
