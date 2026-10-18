// ============================================================================
// MSOT Clubs — P1 Real-Data Integration Tests
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { Home } from '../pages/Home';
import { Clubs } from '../pages/Clubs';
import { ClubDetail } from '../pages/ClubDetail';
import { Events } from '../pages/Events';
import * as clubService from '../services/clubService';
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

describe('P1 Real-Data Integration — Service Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    vi.mocked(supabaseModule.supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);
  });

  // --------------------------------------------------------------------------
  // 1. fetchCampuses
  // --------------------------------------------------------------------------
  it('fetchCampuses: successfully maps database rows to Campus objects', async () => {
    const mockDbCampuses = [
      {
        id: 'camp-1',
        code: 'BLR',
        name: 'MSOT Main Campus (Bengaluru)',
        timezone: 'Asia/Kolkata',
        address: 'Electronic City, Bengaluru',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'camp-2',
        code: 'DEL',
        name: 'MSOT North Campus (Delhi NCR)',
        timezone: 'Asia/Kolkata',
        address: 'Knowledge Park, Greater Noida',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
    ];

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockDbCampuses, error: null }),
    };
    vi.mocked(supabaseModule.supabase.from).mockReturnValue(mockQuery as any);

    const result = await clubService.fetchCampuses();

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      id: 'camp-1',
      code: 'BLR',
      name: 'MSOT Main Campus (Bengaluru)',
      timezone: 'Asia/Kolkata',
      address: 'Electronic City, Bengaluru',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    });
  });

  it('fetchCampuses: handles query error cleanly without throwing', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'permission denied for table campuses' },
      }),
    };
    vi.mocked(supabaseModule.supabase.from).mockReturnValue(mockQuery as any);

    const result = await clubService.fetchCampuses();

    expect(result.data).toEqual([]);
    expect(result.error?.message).toContain('permission denied');
  });

  // --------------------------------------------------------------------------
  // 2. fetchClubs
  // --------------------------------------------------------------------------
  it('fetchClubs: maps joined clubs, campuses, active president, and coordinator count', async () => {
    const mockClubsData = [
      {
        id: 'club-1',
        campus_id: 'camp-1',
        name: 'Coding & Open Source Club',
        code: 'CLUB-CS-01',
        category: 'Technical',
        description: 'Systems and open source.',
        capacity: 60,
        status: 'active',
        faculty_advisor_id: 'adv-1',
        created_at: '2026-01-10T00:00:00Z',
        updated_at: '2026-01-10T00:00:00Z',
        campuses: { id: 'camp-1', code: 'BLR', name: 'MSOT Bengaluru' },
      },
    ];

    const mockPresData = [
      {
        club_id: 'club-1',
        user_id: 'user-pres-1',
        profiles: { id: 'user-pres-1', full_name: 'Aarav Sharma' },
      },
    ];

    const mockMembersData = [
      { club_id: 'club-1', user_id: 'user-pres-1' },
      { club_id: 'club-1', user_id: 'user-coord-2' },
    ];

    const mockAdvData = [{ id: 'adv-1', full_name: 'Dr. Rajesh Kumar' }];

    vi.mocked(supabaseModule.supabase.from).mockImplementation((table: string) => {
      if (table === 'clubs') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockClubsData, error: null }),
        } as any;
      }
      if (table === 'club_presidencies') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: mockPresData, error: null }),
        } as any;
      }
      if (table === 'club_memberships') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: mockMembersData, error: null }),
        } as any;
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: mockAdvData, error: null }),
        } as any;
      }
      return { select: vi.fn().mockReturnThis() } as any;
    });

    const result = await clubService.fetchClubs();

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    const club = result.data[0];
    expect(club.id).toBe('club-1');
    expect(club.name).toBe('Coding & Open Source Club');
    expect(club.campusCode).toBe('BLR');
    expect(club.activePresidentName).toBe('Aarav Sharma');
    expect(club.facultyAdvisorName).toBe('Dr. Rajesh Kumar');
    expect(club.coordinators).toHaveLength(2);
  });

  it('fetchClubs: returns empty data when database has 0 clubs', async () => {
    vi.mocked(supabaseModule.supabase.from).mockImplementation((table: string) => {
      if (table === 'clubs') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        } as any;
      }
      return { select: vi.fn().mockReturnThis() } as any;
    });

    const result = await clubService.fetchClubs();

    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
  });

  it('fetchClubs: returns error and does NOT silently fall back to mock data', async () => {
    vi.mocked(supabaseModule.supabase.from).mockImplementation((table: string) => {
      if (table === 'clubs') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'relation "public.clubs" does not exist' },
          }),
        } as any;
      }
      return { select: vi.fn().mockReturnThis() } as any;
    });

    const result = await clubService.fetchClubs();

    expect(result.data).toEqual([]);
    expect(result.error?.message).toContain('relation "public.clubs" does not exist');
  });

  // --------------------------------------------------------------------------
  // 3. fetchClubById
  // --------------------------------------------------------------------------
  it('fetchClubById: returns full details, coordinator roster, and delegations', async () => {
    const mockClub = {
      id: 'club-1',
      campus_id: 'camp-1',
      name: 'Coding Club',
      code: 'CLUB-CS-01',
      category: 'Technical',
      description: 'Code and build.',
      capacity: 50,
      status: 'active',
      faculty_advisor_id: 'adv-1',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      campuses: { id: 'camp-1', code: 'BLR', name: 'MSOT Bengaluru' },
    };

    const mockPres = {
      user_id: 'user-1',
      profiles: { id: 'user-1', full_name: 'Aarav Sharma' },
    };

    const mockMembers = [
      {
        id: 'mem-1',
        user_id: 'user-1',
        role: 'coordinator',
        status: 'active',
        joined_at: '2026-01-01T00:00:00Z',
        profiles: {
          id: 'user-1',
          full_name: 'Aarav Sharma',
          student_id: 'MSOT-24-001',
          year: '3rd Year',
          section: 'CS-A',
        },
      },
      {
        id: 'mem-2',
        user_id: 'user-2',
        role: 'coordinator',
        status: 'active',
        joined_at: '2026-01-15T00:00:00Z',
        profiles: {
          id: 'user-2',
          full_name: 'Diya Patel',
          student_id: 'MSOT-24-002',
          year: '3rd Year',
          section: 'CS-B',
        },
      },
    ];

    const mockDeleg = [
      {
        recipient_id: 'user-2',
        permission: 'run_checkin',
      },
    ];

    vi.mocked(supabaseModule.supabase.from).mockImplementation((table: string) => {
      if (table === 'clubs') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockClub, error: null }),
        } as any;
      }
      if (table === 'club_presidencies') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockPres, error: null }),
        } as any;
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'adv-1', full_name: 'Dr. Kumar' },
            error: null,
          }),
        } as any;
      }
      if (table === 'club_memberships') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        } as any;
      }
      if (table === 'club_permission_delegations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        } as any;
      }
      return { select: vi.fn().mockReturnThis() } as any;
    });

    // Handle chained query for club_memberships
    const memQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((col: string) => {
        if (col === 'status') {
          return Promise.resolve({ data: mockMembers, error: null });
        }
        return memQuery;
      }),
    };
    const delegQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((col: string) => {
        if (col === 'is_revoked') {
          return Promise.resolve({ data: mockDeleg, error: null });
        }
        return delegQuery;
      }),
    };

    vi.mocked(supabaseModule.supabase.from).mockImplementation((table: string) => {
      if (table === 'clubs') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockClub, error: null }),
        } as any;
      }
      if (table === 'club_presidencies') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockPres, error: null }),
        } as any;
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'adv-1', full_name: 'Dr. Kumar' },
            error: null,
          }),
        } as any;
      }
      if (table === 'club_memberships') return memQuery as any;
      if (table === 'club_permission_delegations') return delegQuery as any;
      return { select: vi.fn().mockReturnThis() } as any;
    });

    const result = await clubService.fetchClubById('club-1');

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data?.name).toBe('Coding Club');
    expect(result.data?.activePresidentName).toBe('Aarav Sharma');
    expect(result.data?.coordinators).toHaveLength(2);
    // Diya Patel has delegated 'run_checkin'
    const diya = result.data?.coordinators.find((c) => c.userId === 'user-2');
    expect(diya?.delegatedPermissions).toContain('run_checkin');
  });

  it('fetchClubById: returns null when club does not exist', async () => {
    vi.mocked(supabaseModule.supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as any);

    const result = await clubService.fetchClubById('non-existent-club');

    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  // --------------------------------------------------------------------------
  // 4. submitCoordinatorApplication
  // --------------------------------------------------------------------------
  it('submitCoordinatorApplication: inserts application into database', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabaseModule.supabase.from).mockReturnValue({
      insert: insertMock,
    } as any);

    const res = await clubService.submitCoordinatorApplication(
      'club-1',
      'user-1',
      'I want to coordinate hackathons.'
    );

    expect(res.success).toBe(true);
    expect(res.error).toBeNull();
    expect(insertMock).toHaveBeenCalledWith({
      club_id: 'club-1',
      user_id: 'user-1',
      statement_of_purpose: 'I want to coordinate hackathons.',
      status: 'pending',
      answers: {},
    });
  });

  // --------------------------------------------------------------------------
  // 5. fetchEvents
  // --------------------------------------------------------------------------
  it('fetchEvents: detects missing table in database schema and reports tableExists: false', async () => {
    vi.mocked(supabaseModule.supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'PGRST204',
          message: "Could not find the table 'public.events' in the schema cache",
        },
      }),
    } as any);

    const res = await clubService.fetchEvents();

    expect(res.data).toEqual([]);
    expect(res.error).toBeNull();
    expect(res.tableExists).toBe(false);
    expect(res.schemaNotice).toContain('events` table is not provisioned');
  });
});

describe('P1 Real-Data Integration — UI Page States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabaseModule.supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    vi.mocked(supabaseModule.supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);
  });

  it('Home page: renders real clubs and campuses fetched from database', async () => {
    vi.spyOn(clubService, 'fetchClubs').mockResolvedValue({
      data: [
        {
          id: 'club-live-1',
          campusId: 'camp-1',
          campusName: 'MSOT Main Campus (Bengaluru)',
          campusCode: 'BLR',
          name: 'Real Coding Club',
          code: 'CLUB-LIVE-01',
          category: 'Technical',
          description: 'Live database club description.',
          capacity: 50,
          status: 'active',
          activePresidentName: 'Live President',
          coordinators: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
      error: null,
    });

    vi.spyOn(clubService, 'fetchCampuses').mockResolvedValue({
      data: [
        {
          id: 'camp-1',
          code: 'BLR',
          name: 'MSOT Main Campus (Bengaluru)',
          timezone: 'Asia/Kolkata',
          address: 'Electronic City',
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      error: null,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Real Coding Club')).toBeInTheDocument();
      expect(screen.getByText('Live President')).toBeInTheDocument();
      expect(screen.getByText('BLR Campus')).toBeInTheDocument();
    });
  });

  it('Home page: renders error banner when club fetch fails (no silent mock fallback)', async () => {
    vi.spyOn(clubService, 'fetchClubs').mockResolvedValue({
      data: [],
      error: new Error('Network timeout connecting to Supabase'),
    });
    vi.spyOn(clubService, 'fetchCampuses').mockResolvedValue({
      data: [],
      error: null,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Network timeout connecting to Supabase/i)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.queryByText('Real Coding Club')).not.toBeInTheDocument();
    });
  });

  it('Clubs page: renders empty state when database has 0 clubs', async () => {
    vi.spyOn(clubService, 'fetchClubs').mockResolvedValue({
      data: [],
      error: null,
    });
    vi.spyOn(clubService, 'fetchCampuses').mockResolvedValue({
      data: [],
      error: null,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Clubs />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Registered Clubs Found')).toBeInTheDocument();
      expect(screen.getByText('Reload Clubs')).toBeInTheDocument();
    });
  });

  it('ClubDetail page: renders "Club Not Found" state when club ID is invalid', async () => {
    vi.spyOn(clubService, 'fetchClubById').mockResolvedValue({
      data: null,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/clubs/non-existent-id']}>
        <AuthProvider>
          <Routes>
            <Route path="/clubs/:clubId" element={<ClubDetail />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Club Not Found')).toBeInTheDocument();
    });
  });

  it('Events page: transparently displays missing schema notice when events table is not provisioned', async () => {
    vi.spyOn(clubService, 'fetchEvents').mockResolvedValue({
      data: [],
      error: null,
      tableExists: false,
      schemaNotice:
        'The `events` table is not provisioned in the current database schema migrations. Per Phase P0/P1 scope, event management is scheduled for Phase P2. No live database events can be loaded.',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Events />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Database Schema Notice: Events Table Not Provisioned')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/The `events` table is not provisioned in the current database schema migrations/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/The application does not silently invent an unauthorized table/i)
      ).toBeInTheDocument();
    });
  });
});
