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

  // Find active coordinator membership for this specific club
  const membership = user.memberships.find(
    (m) => m.clubId === clubId && m.status === 'active' && m.role === 'coordinator'
  );

  // If coordinator is inactive, resigned, or removed, ALL delegated powers are denied!
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

/**
 * Validates updates to coordinator applications.
 * Rule: Applicants cannot modify reviewer metadata or approve themselves.
 */
export function validateApplicationUpdate(
  actor: UserProfile,
  application: { id: string; clubId: string; userId: string; status: string },
  updates: {
    reviewerId?: string;
    reviewerComment?: string;
    reviewedAt?: string;
    status?: string;
  }
): { valid: boolean; error?: string } {
  const isOwner = actor.id === application.userId;
  const isReviewer =
    actor.roles.includes('admin') ||
    isClubPresident(actor, application.clubId) ||
    hasClubPermission(actor, application.clubId, 'review_applications');

  // If applicant is updating their own application
  if (isOwner && !isReviewer) {
    if (
      updates.reviewerId !== undefined ||
      updates.reviewerComment !== undefined ||
      updates.reviewedAt !== undefined
    ) {
      return {
        valid: false,
        error: 'Unauthorized: Applicants cannot modify review fields.',
      };
    }
    if (updates.status && updates.status !== application.status) {
      if (application.status !== 'pending' || updates.status !== 'withdrawn') {
        return {
          valid: false,
          error: 'Unauthorized: Applicants may only withdraw pending applications.',
        };
      }
    }
    return { valid: true };
  }

  // If non-reviewer and non-owner
  if (!isReviewer) {
    return {
      valid: false,
      error: 'Unauthorized: Only authorized reviewers or administrators can review applications.',
    };
  }

  // Conflict of interest: reviewer cannot review their own application unless admin
  if (isOwner && !actor.roles.includes('admin')) {
    return {
      valid: false,
      error: 'Conflict of interest: You cannot review or approve your own application.',
    };
  }

  return { valid: true };
}

/**
 * Validates that club membership creation has an approved application prerequisite.
 */
export function validateMembershipCreation(
  actor: UserProfile,
  hasApprovedApplication: boolean
): { valid: boolean; error?: string } {
  if (actor.roles.includes('admin')) {
    return { valid: true };
  }

  if (!hasApprovedApplication) {
    return {
      valid: false,
      error: 'Database Invariant Violated: A club coordinator membership can only be created after an approved application exists for this club.',
    };
  }

  return { valid: true };
}

/**
 * Validates updates to club attributes to prevent coordinators from modifying protected fields.
 */
export function validateClubFieldUpdate(
  actor: UserProfile,
  club: { campusId: string; status: string; facultyAdvisorId?: string; code: string },
  updates: {
    campusId?: string;
    status?: string;
    facultyAdvisorId?: string;
    code?: string;
  }
): { valid: boolean; error?: string } {
  const isAdmin = actor.roles.includes('admin');
  const isCampusManager =
    actor.roles.includes('campus_manager') && actor.campusId === club.campusId;

  if (!isAdmin && !isCampusManager) {
    if (updates.campusId && updates.campusId !== club.campusId) {
      return {
        valid: false,
        error: 'Unauthorized: Coordinators cannot change the campus assignment of a club.',
      };
    }
    if (updates.status && updates.status !== club.status) {
      return {
        valid: false,
        error: 'Unauthorized: Coordinators cannot change the status of a club.',
      };
    }
    if (updates.facultyAdvisorId && updates.facultyAdvisorId !== club.facultyAdvisorId) {
      return {
        valid: false,
        error: 'Unauthorized: Coordinators cannot reassign the faculty advisor.',
      };
    }
    if (updates.code && updates.code !== club.code) {
      return {
        valid: false,
        error: 'Unauthorized: Club code is immutable.',
      };
    }
  }

  return { valid: true };
}

/**
 * Validates presidential succession transaction.
 */
export function validatePresidentialSuccession(
  actor: UserProfile,
  candidate: UserProfile,
  clubId: string,
  clubCampusId: string
): { valid: boolean; error?: string } {
  const isAdmin = actor.roles.includes('admin');
  const isCampusManager =
    actor.roles.includes('campus_manager') && actor.campusId === clubCampusId;

  if (!isAdmin && !isCampusManager) {
    return {
      valid: false,
      error: 'Unauthorized: Only Campus Managers or Admins can appoint or transition a Club President.',
    };
  }

  if (!isClubCoordinator(candidate, clubId)) {
    return {
      valid: false,
      error: 'A Club President must be an active approved Student Coordinator of the same club.',
    };
  }

  return { valid: true };
}

