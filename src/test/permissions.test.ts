// ============================================================================
// MSOT Clubs — Permissions & Governance Unit Tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  hasRole,
  hasAnyRole,
  isClubCoordinator,
  isClubPresident,
  hasClubPermission,
  validateDelegationAttempt,
  validatePresidentAppointment,
} from '../lib/permissions';
import { DEMO_PROFILES, DEMO_CLUBS } from '../lib/demoData';

describe('Role & Permission Checker', () => {
  const student = DEMO_PROFILES.student;
  const coordinator = DEMO_PROFILES.coordinator;
  const president = DEMO_PROFILES.president;
  const admin = DEMO_PROFILES.admin;
  const codingClubId = DEMO_CLUBS[0].id;
  const roboticsClubId = DEMO_CLUBS[1].id;

  it('correctly checks global roles', () => {
    expect(hasRole(student, 'student')).toBe(true);
    expect(hasRole(student, 'admin')).toBe(false);
    expect(hasRole(coordinator, 'coordinator')).toBe(true);
    expect(hasRole(president, 'president')).toBe(true);
    expect(hasRole(admin, 'admin')).toBe(true);

    expect(hasAnyRole(student, ['advisor', 'student'])).toBe(true);
    expect(hasAnyRole(student, ['advisor', 'admin'])).toBe(false);
  });

  it('correctly checks club coordinator status', () => {
    // Diya Patel is coordinator in Coding Club
    expect(isClubCoordinator(coordinator, codingClubId)).toBe(true);
    // Student Ananya Das is not a coordinator
    expect(isClubCoordinator(student, codingClubId)).toBe(false);
    // Diya is NOT coordinator in Robotics Club
    expect(isClubCoordinator(coordinator, roboticsClubId)).toBe(false);
  });

  it('correctly checks club president status', () => {
    // Aarav Sharma is President of Coding Club
    expect(isClubPresident(president, codingClubId)).toBe(true);
    // Diya Patel is coordinator, but NOT president
    expect(isClubPresident(coordinator, codingClubId)).toBe(false);
    // Aarav is NOT president of Robotics Club
    expect(isClubPresident(president, roboticsClubId)).toBe(false);
  });

  it('enforces granular club permissions correctly', () => {
    // President holds all permissions for their club
    expect(hasClubPermission(president, codingClubId, 'run_checkin')).toBe(true);
    expect(hasClubPermission(president, codingClubId, 'review_applications')).toBe(true);

    // Coordinator holds ONLY explicitly delegated permissions
    expect(hasClubPermission(coordinator, codingClubId, 'run_checkin')).toBe(true);
    expect(hasClubPermission(coordinator, codingClubId, 'manage_submissions')).toBe(true);
    // Coordinator has NOT been delegated 'review_applications' or 'issue_certificates'
    expect(hasClubPermission(coordinator, codingClubId, 'review_applications')).toBe(false);
    expect(hasClubPermission(coordinator, codingClubId, 'issue_certificates')).toBe(false);

    // Student has NO club permissions
    expect(hasClubPermission(student, codingClubId, 'run_checkin')).toBe(false);

    // Coordinator cannot use their Coding Club permissions on Robotics Club
    expect(hasClubPermission(coordinator, roboticsClubId, 'run_checkin')).toBe(false);

    // Admin has cross-cutting permissions
    expect(hasClubPermission(admin, codingClubId, 'run_checkin')).toBe(true);
    expect(hasClubPermission(admin, roboticsClubId, 'run_checkin')).toBe(true);
  });

  it('validates delegation invariants', () => {
    // 1. Valid delegation: President delegating to approved coordinator of same club
    const validResult = validateDelegationAttempt(
      president,
      coordinator,
      codingClubId,
      'create_activity_plan'
    );
    expect(validResult.valid).toBe(true);

    // 2. Invalid: Non-president attempting to delegate
    const nonPresResult = validateDelegationAttempt(
      coordinator,
      student,
      codingClubId,
      'run_checkin'
    );
    expect(nonPresResult.valid).toBe(false);
    expect(nonPresResult.error).toContain('Only the active Club President can grant');

    // 3. Invalid: Delegating to non-member / non-coordinator
    const nonMemberResult = validateDelegationAttempt(
      president,
      student,
      codingClubId,
      'run_checkin'
    );
    expect(nonMemberResult.valid).toBe(false);
    expect(nonMemberResult.error).toContain('approved Student Coordinators');

    // 4. Invalid: Delegating to self
    const selfResult = validateDelegationAttempt(
      president,
      president,
      codingClubId,
      'run_checkin'
    );
    expect(selfResult.valid).toBe(false);
    expect(selfResult.error).toContain('cannot delegate to themselves');
  });

  it('validates president appointment invariants', () => {
    // Approved coordinator can be appointed president
    const validAppt = validatePresidentAppointment(coordinator, codingClubId);
    expect(validAppt.valid).toBe(true);

    // Non-member cannot be appointed president
    const invalidAppt = validatePresidentAppointment(student, codingClubId);
    expect(invalidAppt.valid).toBe(false);
    expect(invalidAppt.error).toContain('must be an approved Student Coordinator');
  });
});
