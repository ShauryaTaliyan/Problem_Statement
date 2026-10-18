// ============================================================================
// MSOT Clubs — Club Detail & Coordinator Roster Page
// ============================================================================

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DEMO_CLUBS } from '../lib/demoData';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Badge } from '../components/ui/Badge';
import {
  Crown,
  CheckCircle,
  Clock,
  ArrowLeft,
  Key,
  Send,
  Info,
} from 'lucide-react';

export const ClubDetail: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user } = useAuth();

  const club = DEMO_CLUBS.find((c) => c.id === clubId) || DEMO_CLUBS[0];

  const [isApplying, setIsApplying] = useState(false);
  const [statement, setStatement] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  const isAlreadyMember = user?.memberships.some(
    (m) => m.clubId === club.id && m.status === 'active'
  );

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setHasApplied(true);
    setIsApplying(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button */}
      <div>
        <Link
          to="/clubs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-blue-700)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Clubs</span>
        </Link>
      </div>

      {/* Club Hero Card */}
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
              <Badge variant="cyan" size="sm">
                {club.category}
              </Badge>
              <Badge variant="blue" size="sm">
                {club.campusCode} Campus
              </Badge>
              <Badge variant="navy" size="sm">
                Status: {club.status}
              </Badge>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
              {club.name}
            </h1>
            <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-700)' }}>
              Code: {club.code}
            </div>
          </div>

          <div>
            {isAlreadyMember ? (
              <Badge variant="teal" size="md">
                <CheckCircle size={14} /> You are an Approved Coordinator
              </Badge>
            ) : hasApplied ? (
              <Badge variant="blue" size="md">
                <Clock size={14} /> Application Submitted (Pending Review)
              </Badge>
            ) : (
              <GlassButton
                variant="primary"
                onClick={() => setIsApplying(true)}
                icon={<Send size={16} />}
              >
                Apply to Join as Student Coordinator
              </GlassButton>
            )}
          </div>
        </div>

        <p style={{ fontSize: '1rem', color: 'var(--text-navy-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {club.description}
        </p>

        {/* Operational Overview Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid var(--border-glass-light)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              ACTIVE CLUB PRESIDENT
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-blue-700)', marginTop: '2px' }}>
              {club.activePresidentName || 'Unassigned'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              FACULTY ADVISOR
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy-900)', marginTop: '2px' }}>
              {club.facultyAdvisorName || 'Assigned by Campus'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              APPROVED COORDINATOR ROSTER
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-teal-700)', marginTop: '2px' }}>
              {club.coordinators.length} Student Coordinators
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontWeight: 600 }}>
              MEMBERSHIP CAPACITY
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-navy-900)', marginTop: '2px' }}>
              {club.capacity} members max
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Application Modal / Form */}
      {isApplying && (
        <GlassCard variant="solid" elevation="elevated3D">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Send size={20} color="var(--color-blue-700)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
              Apply to Become a Student Coordinator
            </h2>
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-cyan-50)',
              border: '1px solid var(--color-cyan-300)',
              color: 'var(--color-cyan-700)',
              fontSize: '0.8125rem',
              lineHeight: 1.4,
              marginBottom: '1rem',
            }}
          >
            <Info size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            <strong>Institutional Governance Rule:</strong> Every approved club member is a Student Coordinator;
            there is no separate ordinary-member tier. Approval grants you coordinator status and club participation rights.
          </div>

          <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-navy-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Why do you want to coordinate {club.name}? (Statement of Purpose)
              </label>
              <textarea
                required
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Share your technical experience, workshop ideas, and availability to run Club Day sessions..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass-light)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <GlassButton type="submit" variant="primary">
                Submit Application for Review
              </GlassButton>
              <GlassButton type="button" variant="ghost" onClick={() => setIsApplying(false)}>
                Cancel
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Student Coordinator Roster Section */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
            Student Coordinator Roster
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-muted)' }}>
            The approved student leadership team for this club. Each member is an approved Student Coordinator.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {club.coordinators.map((coord) => (
            <GlassCard key={coord.id} variant="solid">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: coord.isPresident
                        ? 'var(--color-blue-700)'
                        : 'var(--color-cyan-700)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                    }}
                  >
                    {coord.fullName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                        {coord.fullName}
                      </span>
                      {coord.isPresident && (
                        <Badge variant="navy" size="sm">
                          <Crown size={12} color="var(--color-cyan-400)" />
                          Club President
                        </Badge>
                      )}
                      <Badge variant="blue" size="sm">
                        Student Coordinator
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', marginTop: '2px' }}>
                      ID: {coord.studentId || 'N/A'} &bull; {coord.year} ({coord.section})
                    </div>
                  </div>
                </div>

                {/* Delegated Powers Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', marginRight: '4px' }}>
                    <Key size={12} style={{ display: 'inline', marginRight: '2px' }} />
                    Powers:
                  </span>
                  {coord.isPresident ? (
                    <Badge variant="cyan" size="sm">
                      All Club Powers (President)
                    </Badge>
                  ) : coord.delegatedPermissions.length > 0 ? (
                    coord.delegatedPermissions.map((perm) => (
                      <Badge key={perm} variant="teal" size="sm">
                        {perm.replace(/_/g, ' ')}
                      </Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', fontStyle: 'italic' }}>
                      Standard Coordinator Tasks
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
