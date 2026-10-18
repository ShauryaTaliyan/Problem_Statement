// ============================================================================
// MSOT Clubs — User Profile Page
// ============================================================================

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { CheckCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <GlassCard variant="glass" elevation="elevated3D">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-blue-700)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              boxShadow: 'var(--shadow-glass-md)',
              border: '2px solid var(--border-glass-cyan)',
            }}
          >
            {user.fullName.charAt(0)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                {user.fullName}
              </h1>
              {user.roles.map((r) => (
                <Badge key={r} variant="navy" size="sm">
                  {r.replace('_', ' ')}
                </Badge>
              ))}
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-navy-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span>ID: <strong>{user.studentId || 'N/A'}</strong></span>
              <span>&bull;</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Academic Profile Details */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-glass-light)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              CAMPUS
            </span>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-navy-900)', marginTop: '2px' }}>
              {user.campusName} ({user.campusCode})
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              ACADEMIC COHORT
            </span>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-navy-900)', marginTop: '2px' }}>
              {user.year || 'Staff'} &bull; {user.section || 'General'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              VERIFIED RECORD STATUS
            </span>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-teal-700)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Active
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Approved Coordinator Memberships */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.75rem' }}>
          Approved Club Coordinator Memberships
        </h2>

        {user.memberships.length === 0 ? (
          <GlassCard variant="solid">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-muted)' }}>
              You are not currently an approved Student Coordinator in any club. Explore clubs to apply!
            </p>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {user.memberships.map((m) => (
              <GlassCard key={m.clubId} variant="glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--color-navy-900)' }}>
                        {m.clubName}
                      </strong>
                      {m.isPresident && (
                        <Badge variant="navy" size="sm">
                          Club President
                        </Badge>
                      )}
                      <Badge variant="blue" size="sm">
                        Approved Coordinator
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-cyan-700)', marginTop: '2px' }}>
                      Code: {m.clubCode}
                    </div>
                  </div>

                  {/* Delegated powers */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', display: 'block', marginBottom: '4px' }}>
                      Authorized Powers:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {m.delegatedPermissions.map((p) => (
                        <Badge key={p} variant="teal" size="sm">
                          {p.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
