// ============================================================================
// MSOT Clubs — Campus Events Page (P1 Real Data Integration)
// Default: Open to all students of the organizing campus
// ============================================================================

import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBanner } from '../components/ui/StatusBanner';
import {
  Calendar,
  MapPin,
  Shield,
  CheckCircle2,
  Info,
  CalendarX2,
  RefreshCw,
  Database,
} from 'lucide-react';

export const Events: React.FC = () => {
  const {
    events,
    isLoading,
    error,
    tableExists,
    schemaNotice,
    isDemoFixture,
    refetch,
  } = useEvents();

  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  const toggleRegister = (id: string) => {
    setRegisteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Badge variant="cyan" size="sm">
            Campus Activities
          </Badge>
          {isDemoFixture ? (
            <Badge variant="blue" size="sm">
              Demo Fixtures (Offline Mode)
            </Badge>
          ) : tableExists ? (
            <Badge variant="teal" size="sm">
              <Database size={12} style={{ marginRight: '3px' }} />
              Live Database
            </Badge>
          ) : (
            <Badge variant="navy" size="sm">
              Schema Notice
            </Badge>
          )}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
          Campus & Inter-Campus Events
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-navy-secondary)', maxWidth: '720px' }}>
          Club-organized events are <strong>open to all students of the organizing campus by default</strong>.
          Specific events may offer multi-campus participation or targeted cohort eligibility.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <GlassCard variant="glass">
          <LoadingSpinner label="Querying events from Supabase database..." />
        </GlassCard>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <StatusBanner
          type="warning"
          title="Events Query Error"
          message={`Unable to query events from the database: ${error.message}`}
          actionText="Retry"
          onAction={refetch}
        />
      )}

      {/* Missing Events Table State (Real schema transparency) */}
      {!isLoading && !error && !tableExists && (
        <GlassCard variant="glass" elevation="standard" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-cyan-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-cyan-300)',
                flexShrink: 0,
              }}
            >
              <Info size={22} color="var(--color-blue-700)" />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.35rem' }}>
                Database Schema Notice: Events Table Not Provisioned
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {schemaNotice ||
                  'The `events` table is not included in the current database schema migrations. Per Phase P0/P1 scope, event management, check-in, and attendance tracking are slated for Phase P2.'}
              </p>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-blue-800)',
                  backgroundColor: 'rgba(239, 246, 255, 0.7)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-blue-200)',
                }}
              >
                <strong>System Governance Rule:</strong> The application does not silently invent an unauthorized table or fabricate mock events when connected to a live database. Live event listings will activate once the Phase P2 migrations are applied.
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Empty State: Table exists but 0 events */}
      {!isLoading && !error && tableExists && events.length === 0 && (
        <GlassCard variant="glass" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <CalendarX2 size={44} color="var(--color-blue-400)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
            No Upcoming Events Scheduled
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', maxWidth: '480px', margin: '0 auto 1.25rem auto' }}>
            There are currently no scheduled events in the events registry. Check back later or explore active campus clubs.
          </p>
          <button
            onClick={refetch}
            className="btn-secondary-glass"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
          >
            <RefreshCw size={14} />
            <span>Check for Events</span>
          </button>
        </GlassCard>
      )}

      {/* Events Grid (When events are present) */}
      {!isLoading && !error && events.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {events.map((ev) => {
            const isReg = registeredIds.has(ev.id) || ev.isRegistered;
            const regCount = ev.registeredCount + (registeredIds.has(ev.id) && !ev.isRegistered ? 1 : 0);

            return (
              <GlassCard key={ev.id} variant="glass" elevation="standard">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <Badge variant={ev.scope === 'inter-campus' ? 'teal' : 'blue'} size="sm">
                    {ev.scope === 'inter-campus' ? 'Inter-Campus Event' : `${ev.campusCode} Campus Event`}
                  </Badge>
                  {ev.isCampusWideDefault ? (
                    <Badge variant="cyan" size="sm">
                      Campus-Wide Default
                    </Badge>
                  ) : (
                    <Badge variant="navy" size="sm">
                      Restricted Cohort
                    </Badge>
                  )}
                </div>

                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.35rem' }}>
                  {ev.title}
                </h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-cyan-700)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Organized by {ev.organizerClubName}
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    border: '1px solid var(--border-glass-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.8125rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-navy-secondary)' }}>
                    <Calendar size={14} color="var(--color-blue-700)" />
                    <span>{ev.date} &bull; {ev.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-navy-secondary)' }}>
                    <MapPin size={14} color="var(--color-blue-700)" />
                    <span>{ev.venue}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-teal-700)' }}>
                    <Shield size={14} />
                    <span>{ev.eligibilityDescription}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-navy-muted)' }}>
                    <strong>{regCount}</strong> / {ev.capacity} registered
                  </span>

                  <GlassButton
                    variant={isReg ? 'teal' : 'primary'}
                    size="sm"
                    onClick={() => toggleRegister(ev.id)}
                    icon={isReg ? <CheckCircle2 size={14} /> : undefined}
                  >
                    {isReg ? 'Registered' : 'Register Now'}
                  </GlassButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
