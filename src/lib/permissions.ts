// ============================================================================
// MSOT Clubs — Role-Aware Authorization & Governance Invariants
// ============================================================================

import { UserProfile, UserRole, ClubPermission } from '../types/auth';

/**
 * Checks if the user holds a specific global role.
 */
export function hasRole(user: UserProfile | null, role: UserRole): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/**
 * Checks if the user holds at least one of the specified roles.
 */
export function hasAnyRole(user: UserProfile | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.some((r) => user.roles.includes(r));
}

/**
 * Checks if the user is an approved Student Coordinator of the specified club.
 * Rule: "Every approved club member is a Student Coordinator."
 */
export function isClubCoordinator(user: UserProfile | null, clubId: string): boolean {
  if (!user) return false;
  return user.memberships.some(
    (m) => m.clubId === clubId && m.status === 'active' && m.role === 'coordinator'
  );
}

/**
 * Checks if the user is the active Club President of the specified club.
 * Rule: "Each active club must have exactly one Club President, chosen from its approved Student Coordinators."
 */
export function isClubPresident(user: UserProfile | null, clubId: string): boolean {
  if (!user) return false;
  return user.memberships.some(
    (m) => m.clubId === clubId && m.status === 'active' && m.isPresident === true
  );
}

/**
 * Checks if the user holds a specific club-scoped permission.
 * Invariants:
 * 1. Admins have cross-cutting authorization.
 * 2. Active Club President possesses all club-level powers for their club.
 * 3. Approved Student Coordinators have the power ONLY if explicitly delegated.
 * 4. A user cannot access another club's powers.
 */
export function hasClubPermission(
  user: UserProfile | null,
  clubId: string,
  permission: ClubPermission
): boolean {
  if (!user) return false;

  // Global Admin override
  if (user.roles.includes('admin')) {
    return true;
  }

  // Active Club President holds all permissions for their club
  if (isClubPresident(user, clubId)) {
    return true;
  }

  // Find membership for this specific club
  const membership = user.memberships.find(
    (m) => m.clubId === clubId && m.status === 'active'
  );

  if (!membership) return false;

  // Check delegated permissions
  return membership.delegatedPermissions.includes(permission);
}

/**
 * Validates whether a delegation of authority is valid under governance rules.
 * Throws or returns an error message if invalid.
 */
export function validateDelegationAttempt(
  grantor: UserProfile,
  recipient: UserProfile,
  clubId: string,
  permission: ClubPermission
): { valid: boolean; error?: string } {
  // 1. Grantor must be the active President of the club
  if (!isClubPresident(grantor, clubId)) {
    return {
      valid: false,
      error: 'Only the active Club President can grant club-scoped permissions.',
    };
  }

  // 2. Recipient must be an approved Student Coordinator of the same club
  if (!isClubCoordinator(recipient, clubId)) {
    return {
      valid: false,
      error: 'Permissions can only be delegated to approved Student Coordinators of the same club.',
    };
  }

  // 3. Grantor cannot delegate to themselves
  if (grantor.id === recipient.id) {
    return {
      valid: false,
      error: 'Presidents already possess all club powers and cannot delegate to themselves.',
    };
  }

  // 4. Valid permission check
  const validPermissions: ClubPermission[] = [
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

  if (!validPermissions.includes(permission)) {
    return {
      valid: false,
      error: `Invalid permission: "${permission}".`,
    };
  }

  return { valid: true };
}

/**
 * Validates appointment of a Club President.
 * Rule: Candidate must be an approved Student Coordinator of that club.
 */
export function validatePresidentAppointment(
  candidate: UserProfile,
  clubId: string
): { valid: boolean; error?: string } {
  if (!isClubCoordinator(candidate, clubId)) {
    return {
      valid: false,
      error: 'A Club President must be an approved Student Coordinator of the same club.',
    };
  }
  return { valid: true };
}
