// ============================================================================
// MSOT Clubs — Club, Campus & Application Domain Types
// ============================================================================

import { ClubPermission } from './auth';

export interface Campus {
  id: string;
  code: string;
  name: string;
  timezone: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClubCoordinatorRosterItem {
  id: string;
  userId: string;
  fullName: string;
  studentId?: string;
  year?: string;
  section?: string;
  isPresident: boolean;
  joinedAt: string;
  delegatedPermissions: ClubPermission[];
}

export interface Club {
  id: string;
  campusId: string;
  campusName: string;
  campusCode: string;
  name: string;
  code: string;
  category: string;
  description: string;
  capacity: number;
  status: 'active' | 'inactive' | 'pending_approval';
  facultyAdvisorId?: string;
  facultyAdvisorName?: string;
  activePresidentId?: string;
  activePresidentName?: string;
  coordinators: ClubCoordinatorRosterItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CoordinatorApplication {
  id: string;
  clubId: string;
  clubName: string;
  userId: string;
  applicantName: string;
  applicantStudentId?: string;
  applicantEmail: string;
  applicantYear?: string;
  applicantSection?: string;
  statementOfPurpose: string;
  answers: Record<string, string | number>;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  reviewerId?: string;
  reviewerName?: string;
  reviewerComment?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PermissionDelegation {
  id: string;
  clubId: string;
  grantorId: string;
  grantorName: string;
  recipientId: string;
  recipientName: string;
  permission: ClubPermission;
  isRevoked: boolean;
  grantedAt: string;
  revokedAt?: string;
  revokeReason?: string;
}

export interface AuditLogItem {
  id: string;
  actorId?: string;
  actorName?: string;
  action: string;
  targetTable: string;
  targetId?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}
