// ============================================================================
// MSOT Clubs — Coordinator & Leadership Workspace
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CLUBS } from '../../lib/demoData';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import {
  Shield,
  Crown,
  Users,
  QrCode,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Find club(s) where user is member or default to Coding Club for demonstration
  const userClubs = DEMO_CLUBS.filter(
    (c) =>
      user?.memberships.some((m) => m.clubId === c.id && m.status === 'active') ||
      user?.roles.includes('admin')
  );

  const activeClub = userClubs[0] || DEMO_CLUBS[0];
  const isPresident =
    user?.memberships.some((m) => m.clubId === activeClub.id && m.isPresident) ||
    user?.roles.includes('president');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Workspace Header Card */}
      <GlassCard variant="glass" elevation="elevated3D">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Badge variant="navy" size="sm">
                <Shield size={12} color="var(--color-cyan-400)" />
                Coordinator Workspace
              </Badge>
              {isPresident && (
                <Badge variant="cyan" size="sm">
                  <Crown size={12} />
                  Active President
                </Badge>
              )}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
              {activeClub.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)' }}>
              Campus: {activeClub.campusName} &bull; Code: {activeClub.code}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isPresident && (
              <Link to="/coordinator/delegations" className="btn-primary-gradient">
                <Layers size={16} />
                <span>Manage Delegations</span>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Operational Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid var(--border-glass-light)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              COORDINATORS
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginTop: '2px' }}>
              {activeClub.coordinators.length}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              PENDING APPLICATIONS
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-blue-700)', marginTop: '2px' }}>
              1 applicant
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              NEXT CLUB DAY
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-teal-700)', marginTop: '4px' }}>
              Oct 24, 2026
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              YOUR AUTHORIZED POWERS
            </span>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-navy-900)', marginTop: '4px' }}>
              {isPresident
                ? 'All Club Powers (President)'
                : 'Check-in, Submissions'}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Operational Modules Grid */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '1rem' }}>
          Club Operations & Activity Lifecycle
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Module 1: Coordinator Applications Queue */}
          <GlassCard variant="solid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Users size={20} color="var(--color-blue-700)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                Coordinator Applications
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
              Review student applications to join the club. Approving an applicant inducts them as a Student Coordinator.
            </p>
            <Link
              to="/coordinator/applications"
              className="btn-secondary-glass"
              style={{ fontSize: '0.8125rem', width: '100%' }}
            >
              <span>Open Applications Queue (1 Pending)</span>
              <ArrowRight size={14} />
            </Link>
          </GlassCard>

          {/* Module 2: Delegations Manager */}
          <GlassCard variant="solid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={20} color="var(--color-cyan-700)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                Permission Delegations
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
              The Club President can grant and revoke specific club-scoped powers to approved coordinators with audit trails.
            </p>
            <Link
              to="/coordinator/delegations"
              className="btn-secondary-glass"
              style={{ fontSize: '0.8125rem', width: '100%' }}
            >
              <span>Manage Delegated Powers</span>
              <ArrowRight size={14} />
            </Link>
          </GlassCard>

          {/* Module 3: Club Day Plan & Check-in (P2 Preview) */}
          <GlassCard variant="solid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <QrCode size={20} color="var(--color-teal-700)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                Club Day Check-In & Ops
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
              Standard Club Day lifecycle: 7-day plan, advisor sign-off, rotating QR attendance, and evaluation rubrics.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', padding: '0.5rem', backgroundColor: 'var(--color-blue-50)', borderRadius: 'var(--radius-sm)' }}>
              Scheduled for Phase P2 (Club Day and Attendance)
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
