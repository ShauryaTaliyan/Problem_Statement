// ============================================================================
// MSOT Clubs — Home Dashboard Page
// Light glassmorphic home with 3D isometric accents
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_CLUBS, DEMO_CAMPUSES } from '../lib/demoData';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { IsometricIcon } from '../components/ui/IsometricIcon';
import {
  Compass,
  Award,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user, isDemoMode } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 3D Immersive Hero Banner */}
      <div
        className="glass-panel-3d"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(236, 254, 255, 0.75) 100%)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-3d-elevated)',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Badge variant="cyan" size="sm">
              <Sparkles size={12} /> MSOT Multi-Campus Platform
            </Badge>
            {isDemoMode && (
              <Badge variant="blue" size="sm">
                P0 Foundation Verified
              </Badge>
            )}
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 800,
              color: 'var(--color-navy-900)',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome, {user?.fullName || 'Student'}!
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-navy-secondary)',
              lineHeight: 1.5,
              marginBottom: '1.25rem',
            }}
          >
            Every activity. Every achievement. One verified co-curricular record. Discover
            student-led clubs, participate in campus events, and track verifiable leadership credentials.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link to="/clubs" className="btn-primary-gradient">
              <Compass size={18} />
              <span>Explore Clubs</span>
            </Link>
            <Link to="/events" className="btn-secondary-glass">
              <Award size={18} />
              <span>Campus Events</span>
            </Link>
          </div>
        </div>

        {/* 3D Isometric Accent Art */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem',
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              boxShadow: 'var(--shadow-glass-md)',
              border: '1px solid var(--border-glass-light)',
            }}
          >
            <IsometricIcon type="campus" size={72} />
          </div>
        </div>
      </div>

      {/* Core Platform Rules Banner */}
      <GlassCard variant="glass" elevation="standard">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--color-teal-600)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
            Governance Invariants Enforced in P0
          </h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', lineHeight: 1.5 }}>
          <strong>Multiple Coordinators:</strong> Clubs support multiple Student Coordinators. &bull;{' '}
          <strong>Approved Members:</strong> Every approved club member is a Student Coordinator; there is no separate ordinary-member tier. &bull;{' '}
          <strong>One President:</strong> Each active club has exactly one active President, selected from its approved coordinators. &bull;{' '}
          <strong>Granular Delegation:</strong> The President can delegate specific club powers with audit logging.
        </p>
      </GlassCard>

      {/* Featured Clubs Grid */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
              Active Student Clubs
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-muted)' }}>
              Explore technical, engineering, and creative clubs across all campuses.
            </p>
          </div>
          <Link
            to="/clubs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-blue-700)',
              textDecoration: 'none',
            }}
          >
            <span>View all</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {DEMO_CLUBS.map((club) => (
            <GlassCard key={club.id} variant="glass" elevation="standard">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <Badge variant="cyan" size="sm">
                  {club.category}
                </Badge>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-navy-muted)',
                  }}
                >
                  {club.campusCode} Campus
                </span>
              </div>

              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--color-navy-900)',
                  marginBottom: '0.4rem',
                }}
              >
                {club.name}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-navy-secondary)',
                  lineHeight: 1.4,
                  marginBottom: '1rem',
                  minHeight: '2.8rem',
                }}
              >
                {club.description}
              </p>

              {/* Roster & President summary */}
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid var(--border-glass-light)',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-navy-muted)' }}>Club President:</span>
                  <strong style={{ color: 'var(--color-blue-700)' }}>
                    {club.activePresidentName || 'To be appointed'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-navy-muted)' }}>Coordinators:</span>
                  <strong>{club.coordinators.length} active</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link
                  to={`/clubs/${club.id}`}
                  className="btn-primary-gradient"
                  style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
                >
                  <span>Apply / View Roster</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Campuses Overview */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.75rem' }}>
          Participating Campuses
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {DEMO_CAMPUSES.map((campus) => (
            <GlassCard key={campus.id} variant="solid">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-blue-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-blue-200)',
                  }}
                >
                  <IsometricIcon type="campus" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-cyan-700)' }}>
                    {campus.code}
                  </div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                    {campus.name.replace('MSOT ', '')}
                  </h4>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', lineHeight: 1.3 }}>
                {campus.address}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
