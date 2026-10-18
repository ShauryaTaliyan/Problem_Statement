// ============================================================================
// MSOT Clubs — Authentication & Role Types
// ============================================================================

export type UserRole =
  | 'student'
  | 'coordinator'
  | 'president'
  | 'advisor'
  | 'campus_manager'
  | 'admin';

export type ClubPermission =
  | 'review_applications'
  | 'manage_club_profile'
  | 'create_activity_plan'
  | 'submit_activity_plan'
  | 'run_checkin'
  | 'correct_attendance'
  | 'manage_submissions'
  | 'evaluate_submissions'
  | 'manage_events'
  | 'view_reports'
  | 'issue_certificates';

export interface ClubMembershipSummary {
  clubId: string;
  clubName: string;
  clubCode: string;
  role: 'coordinator';
  isPresident: boolean;
  status: 'active' | 'inactive' | 'resigned';
  delegatedPermissions: ClubPermission[];
}

export interface UserProfile {
  id: string;
  studentId?: string;
  fullName: string;
  email: string;
  campusId: string;
  campusName: string;
  campusCode: string;
  year?: string;
  section?: string;
  phone?: string;
  avatarUrl?: string;
  roles: UserRole[];
  memberships: ClubMembershipSummary[];
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isDemoMode: boolean;
}
