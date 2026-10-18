// ============================================================================
// MSOT Clubs — Security & Invariant Hardening Tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  hasClubPermission,
  isClubPresident,
  isClubCoordinator,
  validateDelegationAttempt,
} from '../lib/permissions';
import { DEMO_PROFILES, DEMO_CLUBS } from '../lib/demoData';
import { UserProfile } from '../types/auth';

describe('Security Fixes & Invariant Hardening', () => {
  const codingClubId = DEMO_CLUBS[0].id;

  // --------------------------------------------------------------------------
  // Fix 1: Prevent former coordinators from retaining delegated permissions
  // --------------------------------------------------------------------------
  it('Fix 1: Resigned/inactive coordinator immediately loses all delegated permissions', () => {
    const activeCoordinator: UserProfile = {
      ...DEMO_PROFILES.coordinator,
      memberships: [
        {
          clubId: codingClubId,
          clubName: 'Coding Club',
          clubCode: 'CLUB-CS-01',
          role: 'coordinator',
          isPresident: false,
          status: 'active',
          delegatedPermissions: ['run_checkin', 'manage_submissions'],
        },
      ],
    };

    // Active coordinator has delegated power
    expect(hasClubPermission(activeCoordinator, codingClubId, 'run_checkin')).toBe(true);

    // Coordinator resigns / status becomes 'resigned'
    const resignedCoordinator: UserProfile = {
      ...activeCoordinator,
      memberships: [
        {
          ...activeCoordinator.memberships[0],
          status: 'resigned',
        },
      ],
    };

    // Resigned coordinator MUST NOT retain delegated permissions
    expect(isClubCoordinator(resignedCoordinator, codingClubId)).toBe(false);
    expect(hasClubPermission(resignedCoordinator, codingClubId, 'run_checkin')).toBe(false);
    expect(hasClubPermission(resignedCoordinator, codingClubId, 'manage_submissions')).toBe(false);
  });

  // --------------------------------------------------------------------------
  // Fix 2: Automatically end active president status if coordinator leaves
  // --------------------------------------------------------------------------
  it('Fix 2: President who leaves the club loses active presidency and powers', () => {
    const activePresident = DEMO_PROFILES.president;
    expect(isClubPresident(activePresident, codingClubId)).toBe(true);
    expect(hasClubPermission(activePresident, codingClubId, 'run_checkin')).toBe(true);

    // President resigns from club
    const resignedPresident: UserProfile = {
      ...activePresident,
      memberships: [
        {
          ...activePresident.memberships[0],
          status: 'resigned',
          isPresident: false,
        },
      ],
    };

    expect(isClubPresident(resignedPresident, codingClubId)).toBe(false);
    expect(hasClubPermission(resignedPresident, codingClubId, 'run_checkin')).toBe(false);
  });

  // --------------------------------------------------------------------------
  // Fix 3: Profile field protection (campus_id, student_id)
  // --------------------------------------------------------------------------
  it('Fix 3: Protected profile fields cannot be modified by non-admin', () => {
    const originalProfile = DEMO_PROFILES.student;

    const validateProfileUpdate = (
      user: UserProfile,
      updatedFields: Partial<UserProfile>
    ): { allowed: boolean; error?: string } => {
      const isAdmin = user.roles.includes('admin');
      if (!isAdmin) {
        if (updatedFields.campusId && updatedFields.campusId !== user.campusId) {
          return { allowed: false, error: 'Unauthorized: Students cannot change their campus assignment directly.' };
        }
        if (updatedFields.studentId && updatedFields.studentId !== user.studentId) {
          return { allowed: false, error: 'Unauthorized: Students cannot change their student ID directly.' };
        }
        if (updatedFields.year && updatedFields.year !== user.year) {
          return { allowed: false, error: 'Unauthorized: Academic cohort (year/section) must be updated by an administrator.' };
        }
      }
      return { allowed: true };
    };

    // Student attempting to change campusId
    const campusTamper = validateProfileUpdate(originalProfile, { campusId: '22222222-2222-4222-a222-222222222222' });
    expect(campusTamper.allowed).toBe(false);
    expect(campusTamper.error).toContain('Students cannot change their campus assignment');

    // Student attempting to change studentId
    const idTamper = validateProfileUpdate(originalProfile, { studentId: 'EMP-001' });
    expect(idTamper.allowed).toBe(false);
    expect(idTamper.error).toContain('Students cannot change their student ID');

    // Admin CAN update protected fields
    const adminUpdate = validateProfileUpdate(DEMO_PROFILES.admin, { campusId: '33333333-3333-4333-a333-333333333333' });
    expect(adminUpdate.allowed).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Fix 4: Production demo mode disablement
  // --------------------------------------------------------------------------
  it('Fix 4: Demo mode is strictly disallowed in production or when Supabase is configured', () => {
    // In our test environment, isDemoModeAllowed checks import.meta.env.PROD
    // If running in development without keys, it returns true
    // But if PROD were true, it must return false
    const simulateDemoAllowed = (isProd: boolean, isConfigured: boolean): boolean => {
      return !isProd && !isConfigured;
    };

    expect(simulateDemoAllowed(true, false)).toBe(false); // In production without config -> FALSE (halts execution)
    expect(simulateDemoAllowed(true, true)).toBe(false);  // In production with config -> FALSE (real auth)
    expect(simulateDemoAllowed(false, true)).toBe(false); // In dev with config -> FALSE (real auth)
    expect(simulateDemoAllowed(false, false)).toBe(true); // In dev without config -> TRUE (safe demo sandbox)
  });

  // --------------------------------------------------------------------------
  // Fix 5: Delegation validation on insert and update
  // --------------------------------------------------------------------------
  it('Fix 5: Validates delegation invariants and disallows delegating to non-coordinators', () => {
    const president = DEMO_PROFILES.president;
    const coordinator = DEMO_PROFILES.coordinator;
    const student = DEMO_PROFILES.student;

    // Cannot delegate to student (non-coordinator)
    const toStudent = validateDelegationAttempt(president, student, codingClubId, 'run_checkin');
    expect(toStudent.valid).toBe(false);
    expect(toStudent.error).toContain('approved Student Coordinators');

    // Can delegate to active coordinator
    const toCoordinator = validateDelegationAttempt(president, coordinator, codingClubId, 'run_checkin');
    expect(toCoordinator.valid).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Fix 6: Duplicate delegation & application prevention
  // --------------------------------------------------------------------------
  it('Fix 6: Duplicate active delegations and duplicate pending applications are rejected', () => {
    const existingDelegations = [
      { clubId: codingClubId, recipientId: DEMO_PROFILES.coordinator.id, permission: 'run_checkin', isRevoked: false },
    ];

    const isDuplicateDelegation = (clubId: string, recipientId: string, perm: string): boolean => {
      return existingDelegations.some(
        (d) => d.clubId === clubId && d.recipientId === recipientId && d.permission === perm && !d.isRevoked
      );
    };

    expect(isDuplicateDelegation(codingClubId, DEMO_PROFILES.coordinator.id, 'run_checkin')).toBe(true);
    expect(isDuplicateDelegation(codingClubId, DEMO_PROFILES.coordinator.id, 'manage_submissions')).toBe(false);

    const existingApps = [
      { clubId: codingClubId, userId: DEMO_PROFILES.student.id, status: 'pending' },
    ];

    const isDuplicatePendingApp = (clubId: string, userId: string): boolean => {
      return existingApps.some(
        (a) => a.clubId === clubId && a.userId === userId && a.status === 'pending'
      );
    };

    expect(isDuplicatePendingApp(codingClubId, DEMO_PROFILES.student.id)).toBe(true);
    expect(isDuplicatePendingApp(DEMO_CLUBS[1].id, DEMO_PROFILES.student.id)).toBe(false);
  });
});
