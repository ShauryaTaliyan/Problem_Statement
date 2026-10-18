// ============================================================================
// MSOT Clubs — Club & Campus Database Services (P1 Real-Data Integration)
// ============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Campus, Club, ClubCoordinatorRosterItem, CoordinatorApplication } from '../types/club';
import { ClubPermission } from '../types/auth';
import type { Database } from '../types/database';

type CampusRow = Database['public']['Tables']['campuses']['Row'];
type ClubRow = Database['public']['Tables']['clubs']['Row'];
type ApplicationRow = Database['public']['Tables']['club_coordinator_applications']['Row'];

const ALL_CLUB_PERMISSIONS: ClubPermission[] = [
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
];

/**
 * Fetch all active campuses from the database.
 */
export async function fetchCampuses(): Promise<{ data: Campus[]; error: Error | null }> {
  try {
    const { data: rawData, error } = await supabase
      .from('campuses')
      .select('id, code, name, timezone, address, is_active, created_at')
      .eq('is_active', true)
      .order('name');

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    const rows = (rawData || []) as unknown as CampusRow[];

    const campuses: Campus[] = rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      timezone: row.timezone,
      address: row.address || undefined,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));

    return { data: campuses, error: null };
  } catch (err: unknown) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch all active clubs with joined campus names, active president, and coordinator counts.
 */
export async function fetchClubs(campusId?: string): Promise<{ data: Club[]; error: Error | null }> {
  try {
    let query = supabase
      .from('clubs')
      .select(`
        id,
        campus_id,
        name,
        code,
        category,
        description,
        capacity,
        status,
        faculty_advisor_id,
        created_at,
        updated_at,
        campuses ( id, code, name )
      `)
      .eq('status', 'active')
      .order('name');

    if (campusId && campusId !== 'all') {
      query = query.eq('campus_id', campusId);
    }

    const { data: rawClubs, error: clubsErr } = await query;

    if (clubsErr) {
      return { data: [], error: new Error(clubsErr.message) };
    }

    const clubsData = (rawClubs || []) as unknown as (ClubRow & {
      campuses: { id: string; code: string; name: string } | { id: string; code: string; name: string }[] | null;
    })[];

    if (clubsData.length === 0) {
      return { data: [], error: null };
    }

    const clubIds = clubsData.map((c) => c.id);

    // Fetch active presidencies for these clubs
    const { data: rawPres } = await supabase
      .from('club_presidencies')
      .select(`
        club_id,
        user_id,
        profiles ( id, full_name )
      `)
      .in('club_id', clubIds)
      .eq('status', 'active');

    const presData = (rawPres || []) as unknown as {
      club_id: string;
      user_id: string;
      profiles: { id: string; full_name: string } | null;
    }[];

    // Fetch active coordinators count
    const { data: rawMembers } = await supabase
      .from('club_memberships')
      .select('club_id, user_id')
      .in('club_id', clubIds)
      .eq('status', 'active');

    const memberData = (rawMembers || []) as unknown as {
      club_id: string;
      user_id: string;
    }[];

    // Fetch faculty advisor names
    const advisorIds = clubsData
      .map((c) => c.faculty_advisor_id)
      .filter((id): id is string => Boolean(id));

    const advisorMap = new Map<string, string>();
    if (advisorIds.length > 0) {
      const { data: rawAdv } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', advisorIds);

      const advData = (rawAdv || []) as unknown as { id: string; full_name: string }[];
      advData.forEach((adv) => {
        advisorMap.set(adv.id, adv.full_name);
      });
    }

    // Build map for active presidencies
    const presMap = new Map<string, { id: string; name: string }>();
    presData.forEach((p) => {
      presMap.set(p.club_id, { id: p.user_id, name: p.profiles?.full_name || 'Active President' });
    });

    // Build map for coordinator user IDs
    const coordMap = new Map<string, string[]>();
    memberData.forEach((m) => {
      const existing = coordMap.get(m.club_id) || [];
      existing.push(m.user_id);
      coordMap.set(m.club_id, existing);
    });

    // Construct domain Club items
    const clubs: Club[] = clubsData.map((row) => {
      const campusObj = Array.isArray(row.campuses) ? row.campuses[0] : row.campuses;
      const pres = presMap.get(row.id);
      const coordUserIds = coordMap.get(row.id) || [];
      const advisorId = row.faculty_advisor_id || undefined;

      const coordinators: ClubCoordinatorRosterItem[] = coordUserIds.map((uid) => ({
        id: uid,
        userId: uid,
        fullName: uid === pres?.id ? (pres.name || 'President') : 'Student Coordinator',
        isPresident: uid === pres?.id,
        joinedAt: row.created_at,
        delegatedPermissions: uid === pres?.id ? ALL_CLUB_PERMISSIONS : [],
      }));

      return {
        id: row.id,
        campusId: row.campus_id,
        campusName: campusObj?.name || 'Campus',
        campusCode: campusObj?.code || '',
        name: row.name,
        code: row.code,
        category: row.category,
        description: row.description || '',
        capacity: row.capacity,
        status: row.status,
        facultyAdvisorId: advisorId,
        facultyAdvisorName: advisorId ? advisorMap.get(advisorId) : undefined,
        activePresidentId: pres?.id,
        activePresidentName: pres?.name,
        coordinators,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return { data: clubs, error: null };
  } catch (err: unknown) {
    return { data: [], error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch complete club details by club ID, including coordinator roster and delegated permissions.
 */
export async function fetchClubById(clubId: string): Promise<{ data: Club | null; error: Error | null }> {
  try {
    const { data: rawRow, error: clubErr } = await supabase
      .from('clubs')
      .select(`
        id,
        campus_id,
        name,
        code,
        category,
        description,
        capacity,
        status,
        faculty_advisor_id,
        created_at,
        updated_at,
        campuses ( id, code, name )
      `)
      .eq('id', clubId)
      .maybeSingle();

    if (clubErr) {
      return { data: null, error: new Error(clubErr.message) };
    }

    if (!rawRow) {
      return { data: null, error: null };
    }

    const row = rawRow as unknown as ClubRow & {
      campuses: { id: string; code: string; name: string } | { id: string; code: string; name: string }[] | null;
    };
    const campusObj = Array.isArray(row.campuses) ? row.campuses[0] : row.campuses;

    // Fetch active president
    const { data: rawPres } = await supabase
      .from('club_presidencies')
      .select(`
        user_id,
        profiles ( id, full_name )
      `)
      .eq('club_id', clubId)
      .eq('status', 'active')
      .maybeSingle();

    const presRow = rawPres as unknown as {
      user_id: string;
      profiles: { id: string; full_name: string } | null;
    } | null;

    const presUserId = presRow?.user_id;
    const presName = presRow?.profiles?.full_name;

    // Fetch faculty advisor profile
    let advisorName: string | undefined = undefined;
    if (row.faculty_advisor_id) {
      const { data: rawAdv } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', row.faculty_advisor_id)
        .maybeSingle();

      const advProfile = rawAdv as unknown as { id: string; full_name: string } | null;
      if (advProfile) {
        advisorName = advProfile.full_name;
      }
    }

    // Fetch approved coordinators from club_memberships
    const { data: rawMembers } = await supabase
      .from('club_memberships')
      .select(`
        id,
        user_id,
        role,
        status,
        joined_at,
        profiles (
          id,
          student_id,
          full_name,
          year,
          section
        )
      `)
      .eq('club_id', clubId)
      .eq('status', 'active');

    const membersData = (rawMembers || []) as unknown as {
      id: string;
      user_id: string;
      role: string;
      status: string;
      joined_at: string;
      profiles: {
        id?: string;
        student_id?: string;
        full_name?: string;
        year?: string;
        section?: string;
      } | null;
    }[];

    // Fetch active permission delegations for this club
    const { data: rawDeleg } = await supabase
      .from('club_permission_delegations')
      .select('recipient_id, permission')
      .eq('club_id', clubId)
      .eq('is_revoked', false);

    const delegData = (rawDeleg || []) as unknown as {
      recipient_id: string;
      permission: string;
    }[];

    const delegMap = new Map<string, ClubPermission[]>();
    delegData.forEach((d) => {
      const existing = delegMap.get(d.recipient_id) || [];
      existing.push(d.permission as ClubPermission);
      delegMap.set(d.recipient_id, existing);
    });

    const coordinators: ClubCoordinatorRosterItem[] = membersData.map((m) => {
      const prof = m.profiles;
      const isPresident = m.user_id === presUserId;
      const delegated = isPresident
        ? ALL_CLUB_PERMISSIONS
        : (delegMap.get(m.user_id) || []);

      return {
        id: m.id,
        userId: m.user_id,
        fullName: prof?.full_name || (isPresident ? (presName || 'Club President') : 'Student Coordinator'),
        studentId: prof?.student_id || undefined,
        year: prof?.year || undefined,
        section: prof?.section || undefined,
        isPresident,
        joinedAt: m.joined_at,
        delegatedPermissions: delegated,
      };
    });

    const club: Club = {
      id: row.id,
      campusId: row.campus_id,
      campusName: campusObj?.name || 'Campus',
      campusCode: campusObj?.code || '',
      name: row.name,
      code: row.code,
      category: row.category,
      description: row.description || '',
      capacity: row.capacity,
      status: row.status,
      facultyAdvisorId: row.faculty_advisor_id || undefined,
      facultyAdvisorName: advisorName,
      activePresidentId: presUserId,
      activePresidentName: presName,
      coordinators,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return { data: club, error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Fetch coordinator application status for the current user in a specific club.
 */
export async function fetchUserApplication(
  clubId: string,
  userId: string
): Promise<{ data: CoordinatorApplication | null; error: Error | null }> {
  try {
    const { data: rawData, error } = await supabase
      .from('club_coordinator_applications')
      .select('*')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!rawData) {
      return { data: null, error: null };
    }

    const data = rawData as unknown as ApplicationRow;

    const application: CoordinatorApplication = {
      id: data.id,
      clubId: data.club_id,
      clubName: '',
      userId: data.user_id,
      applicantName: '',
      applicantEmail: '',
      statementOfPurpose: data.statement_of_purpose || '',
      answers: (data.answers as Record<string, string | number>) || {},
      status: data.status,
      reviewerId: data.reviewer_id || undefined,
      reviewerComment: data.reviewer_comment || undefined,
      reviewedAt: data.reviewed_at || undefined,
      createdAt: data.created_at,
    };

    return { data: application, error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Submit a real coordinator application to club_coordinator_applications table.
 */
export async function submitCoordinatorApplication(
  clubId: string,
  userId: string,
  statement: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    type AppInsert = Database['public']['Tables']['club_coordinator_applications']['Insert'];
    const payload: AppInsert = {
      club_id: clubId,
      user_id: userId,
      statement_of_purpose: statement,
      status: 'pending',
      answers: {},
    };

    const { error } = await (supabase.from('club_coordinator_applications') as unknown as {
      insert: (p: AppInsert) => Promise<{ error: { message: string } | null }>;
    }).insert(payload);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Event domain item definition
 */
export interface EventItem {
  id: string;
  title: string;
  organizerClubName: string;
  campusCode: string;
  scope: 'campus' | 'inter-campus';
  date: string;
  time: string;
  venue: string;
  eligibilityDescription: string;
  isCampusWideDefault: boolean;
  registeredCount: number;
  capacity: number;
  isRegistered: boolean;
}

export interface EventsFetchResult {
  data: EventItem[];
  error: Error | null;
  tableExists: boolean;
  schemaNotice?: string;
}

/**
 * Fetch events from Supabase.
 * If the events table does not exist in the database migrations, reports tableExists: false
 * rather than inventing a schema or silently fabricating data.
 */
export async function fetchEvents(): Promise<EventsFetchResult> {
  if (!isSupabaseConfigured()) {
    return {
      data: [],
      error: null,
      tableExists: false,
      schemaNotice: 'Supabase credentials are not configured.',
    };
  }

  try {
    // Attempt live fetch from events table
    const { data, error } = await (supabase as unknown as {
      from: (tbl: string) => {
        select: (cols: string) => Promise<{ data: unknown[] | null; error: { code?: string; message: string } | null }>;
      };
    })
      .from('events')
      .select('*');

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      const isMissingTable =
        msg.includes('could not find the table') ||
        msg.includes('does not exist') ||
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST200';

      if (isMissingTable) {
        return {
          data: [],
          error: null,
          tableExists: false,
          schemaNotice:
            'The `events` table is not provisioned in the current database schema migrations. Per Phase P0/P1 scope, event management is scheduled for Phase P2. No live database events can be loaded.',
        };
      }

      return {
        data: [],
        error: new Error(error.message),
        tableExists: true,
      };
    }

    const events: EventItem[] = ((data as Record<string, unknown>[]) || []).map((row) => ({
      id: String(row.id || ''),
      title: String(row.title || 'Untitled Event'),
      organizerClubName: String(row.organizer_club_name || row.club_name || 'Campus Club'),
      campusCode: String(row.campus_code || 'ALL'),
      scope: (row.scope as 'campus' | 'inter-campus') || 'campus',
      date: String(row.date || ''),
      time: String(row.time || ''),
      venue: String(row.venue || ''),
      eligibilityDescription: String(row.eligibility_description || 'Open to all students by default'),
      isCampusWideDefault: row.is_campus_wide_default !== false,
      registeredCount: Number(row.registered_count) || 0,
      capacity: Number(row.capacity) || 100,
      isRegistered: Boolean(row.is_registered),
    }));

    return {
      data: events,
      error: null,
      tableExists: true,
    };
  } catch (err: unknown) {
    return {
      data: [],
      error: err instanceof Error ? err : new Error(String(err)),
      tableExists: false,
    };
  }
}
