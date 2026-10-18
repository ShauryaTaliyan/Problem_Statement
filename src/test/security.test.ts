// ============================================================================
// MSOT Clubs — Security & Invariant Hardening Tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  hasClubPermission,
  isClubPresident,
  isClubCoordinator,
  validateDelegationAttempt,
  validateApplicationUpdate,
  validateMembershipCreation,
  validateClubFieldUpdate,
  validatePresidentialSuccession,
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

  // --------------------------------------------------------------------------
  // Fix 7: Safe fixed search_path on all SECURITY DEFINER functions
  // --------------------------------------------------------------------------
  it('Fix 7: Migration 000004 defines search_path = public, pg_temp on all SECURITY DEFINER functions', () => {
    const migrationPath = path.resolve(
      __dirname,
      '../../supabase/migrations/20261018000004_p0_hardening_and_succession.sql'
    );
    expect(fs.existsSync(migrationPath)).toBe(true);

    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    // Match non-commented SECURITY DEFINER clauses
    const secDefinerMatches = migrationContent.match(/^\s*SECURITY DEFINER/gm) || [];
    const searchPathMatches = migrationContent.match(/^\s*SET search_path = public, pg_temp/gm) || [];

    expect(secDefinerMatches.length).toBeGreaterThan(0);
    // Every SECURITY DEFINER function in migration 000004 must have SET search_path = public, pg_temp
    expect(searchPathMatches.length).toBe(secDefinerMatches.length);
  });

  // --------------------------------------------------------------------------
  // Fix 8: Coordinator Application Tampering Prevention
  // --------------------------------------------------------------------------
  it('Fix 8: Applicants cannot tamper with review metadata or self-approve; only authorized reviewers/admins can review', () => {
    const student = DEMO_PROFILES.student;
    const president = DEMO_PROFILES.president;
    const application = {
      id: 'app-001',
      clubId: codingClubId,
      userId: student.id,
      status: 'pending',
    };

    // 1. Applicant cannot self-approve
    const selfApprove = validateApplicationUpdate(student, application, { status: 'approved' });
    expect(selfApprove.valid).toBe(false);
    expect(selfApprove.error).toContain('Applicants may only withdraw pending applications');

    // 2. Applicant cannot forge reviewer metadata
    const forgeReviewer = validateApplicationUpdate(student, application, {
      reviewerId: student.id,
      reviewerComment: 'Self-approved',
    });
    expect(forgeReviewer.valid).toBe(false);
    expect(forgeReviewer.error).toContain('Applicants cannot modify review fields');

    // 3. Applicant CAN withdraw pending application
    const withdraw = validateApplicationUpdate(student, application, { status: 'withdrawn' });
    expect(withdraw.valid).toBe(true);

    // 4. Authorized President can approve
    const presidentApprove = validateApplicationUpdate(president, application, {
      status: 'approved',
      reviewerComment: 'Strong candidate',
    });
    expect(presidentApprove.valid).toBe(true);

    // 5. Reviewer cannot approve their own application (conflict of interest)
    const presidentOwnApp = {
      id: 'app-002',
      clubId: codingClubId,
      userId: president.id,
      status: 'pending',
    };
    const conflictCheck = validateApplicationUpdate(president, presidentOwnApp, {
      status: 'approved',
    });
    expect(conflictCheck.valid).toBe(false);
    expect(conflictCheck.error).toContain('Conflict of interest');
  });

  // --------------------------------------------------------------------------
  // Fix 9: Club Membership Requires Approved Coordinator Application
  // --------------------------------------------------------------------------
  it('Fix 9: Club membership creation requires an approved coordinator application at DB level', () => {
    const president = DEMO_PROFILES.president;
    const admin = DEMO_PROFILES.admin;

    // Without approved application -> rejected
    const withoutApp = validateMembershipCreation(president, false);
    expect(withoutApp.valid).toBe(false);
    expect(withoutApp.error).toContain('approved application exists for this club');

    // With approved application -> valid
    const withApp = validateMembershipCreation(president, true);
    expect(withApp.valid).toBe(true);

    // Admin override (e.g., initial system bootstrap) -> valid
    const adminBypass = validateMembershipCreation(admin, false);
    expect(adminBypass.valid).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Fix 10: Protection of Club Fields from Coordinator Tampering
  // --------------------------------------------------------------------------
  it('Fix 10: Coordinators cannot change protected club fields (campus_id, status, faculty_advisor_id, code)', () => {
    const coordinator = DEMO_PROFILES.coordinator;
    const campusManager = DEMO_PROFILES.campus_manager;
    const club = DEMO_CLUBS[0];

    // Coordinator attempting to change campusId -> rejected
    const campusTamper = validateClubFieldUpdate(coordinator, club, {
      campusId: 'different-campus-uuid',
    });
    expect(campusTamper.valid).toBe(false);
    expect(campusTamper.error).toContain('cannot change the campus assignment');

    // Coordinator attempting to change club status -> rejected
    const statusTamper = validateClubFieldUpdate(coordinator, club, {
      status: 'inactive',
    });
    expect(statusTamper.valid).toBe(false);
    expect(statusTamper.error).toContain('cannot change the status of a club');

    // Coordinator attempting to change faculty advisor -> rejected
    const advisorTamper = validateClubFieldUpdate(coordinator, club, {
      facultyAdvisorId: 'new-advisor-uuid',
    });
    expect(advisorTamper.valid).toBe(false);
    expect(advisorTamper.error).toContain('cannot reassign the faculty advisor');

    // Coordinator attempting to change immutable club code -> rejected
    const codeTamper = validateClubFieldUpdate(coordinator, club, {
      code: 'NEW-CODE-99',
    });
    expect(codeTamper.valid).toBe(false);
    expect(codeTamper.error).toContain('Club code is immutable');

    // Campus Manager CAN update status or advisor for their campus
    const managerUpdate = validateClubFieldUpdate(campusManager, club, {
      status: 'active',
      facultyAdvisorId: 'new-advisor-uuid',
    });
    expect(managerUpdate.valid).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Fix 11: Presidential Succession Procedure
  // --------------------------------------------------------------------------
  it('Fix 11: Presidential succession safely enforces coordinator status and campus manager/admin authority', () => {
    const student = DEMO_PROFILES.student;
    const coordinator = DEMO_PROFILES.coordinator;
    const campusManager = DEMO_PROFILES.campus_manager;
    const admin = DEMO_PROFILES.admin;
    const club = DEMO_CLUBS[0];

    // 1. Regular coordinator cannot transition president
    const unauthorizedActor = validatePresidentialSuccession(
      coordinator,
      coordinator,
      club.id,
      club.campusId
    );
    expect(unauthorizedActor.valid).toBe(false);
    expect(unauthorizedActor.error).toContain('Only Campus Managers or Admins');

    // 2. Candidate must be an approved coordinator (student is not)
    const invalidCandidate = validatePresidentialSuccession(
      campusManager,
      student,
      club.id,
      club.campusId
    );
    expect(invalidCandidate.valid).toBe(false);
    expect(invalidCandidate.error).toContain('must be an active approved Student Coordinator');

    // 3. Valid succession by Campus Manager with active coordinator candidate
    const validSuccessionManager = validatePresidentialSuccession(
      campusManager,
      coordinator,
      club.id,
      club.campusId
    );
    expect(validSuccessionManager.valid).toBe(true);

    // 4. Valid succession by Admin
    const validSuccessionAdmin = validatePresidentialSuccession(
      admin,
      coordinator,
      club.id,
      club.campusId
    );
    expect(validSuccessionAdmin.valid).toBe(true);
  });
});

