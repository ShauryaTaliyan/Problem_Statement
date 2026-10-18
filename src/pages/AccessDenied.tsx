// ============================================================================
// MSOT Clubs — Access Denied (403) Page
// High contrast operational access control screen
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types/auth';

interface AccessDeniedProps {
  reason?: string;
  userRoles?: UserRole[];
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  reason = 'You do not have the required role or delegated club permissions to view this resource.',
  userRoles = [],
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '1rem',
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <GlassCard variant="solid" elevation="elevated3D">
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-blue-50)',
                border: '2px solid var(--color-blue-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <ShieldAlert size={32} color="var(--color-blue-700)" />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
              Access Restricted (403)
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', marginTop: '6px' }}>
              MSOT Governance & Role-Based Access Control
            </p>
          </div>

          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 246, 255, 0.8)',
              border: '1px solid var(--color-blue-200)',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              color: 'var(--color-navy-900)',
              lineHeight: 1.5,
            }}
          >
            <strong>Requirement:</strong> {reason}
          </div>

          {userRoles.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', display: 'block', marginBottom: '4px' }}>
                Your current active roles:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {userRoles.map((r) => (
                  <Badge key={r} variant="navy" size="sm">
                    {r.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Link to="/" className="btn-primary-gradient" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={16} />
              <span>Return to Home</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
