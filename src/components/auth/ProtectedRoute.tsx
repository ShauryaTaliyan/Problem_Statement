// ============================================================================
// MSOT Clubs — Protected Route Guard
// ============================================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole, ClubPermission } from '../../types/auth';
import { hasAnyRole, hasClubPermission } from '../../lib/permissions';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AccessDenied } from '../../pages/AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredClubPermission?: {
    clubId: string;
    permission: ClubPermission;
  };
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredClubPermission,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner label="Authenticating session..." fullScreen />;
  }

  // Not authenticated -> redirect to sign-in
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check global role requirement
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = hasAnyRole(user, allowedRoles);
    if (!hasRole) {
      return (
        <AccessDenied
          reason={`This page requires one of the following roles: ${allowedRoles.join(', ')}.`}
          userRoles={user.roles}
        />
      );
    }
  }

  // Check club permission requirement
  if (requiredClubPermission) {
    const hasPerm = hasClubPermission(
      user,
      requiredClubPermission.clubId,
      requiredClubPermission.permission
    );
    if (!hasPerm) {
      return (
        <AccessDenied
          reason={`You do not possess the required club power ("${requiredClubPermission.permission}") for this club.`}
          userRoles={user.roles}
        />
      );
    }
  }

  return <>{children}</>;
};
