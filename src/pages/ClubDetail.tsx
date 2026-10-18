// ============================================================================
// MSOT Clubs — Club Detail & Coordinator Roster Page (P1 Real Data)
// ============================================================================

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClubDetail } from '../hooks/useClubDetail';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBanner } from '../components/ui/StatusBanner';
import {
  Crown,
  CheckCircle,
  Clock,
  ArrowLeft,
  Key,
  Send,
  Info,
  RefreshCw,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export const ClubDetail: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user } = useAuth();
  const {
    club,
    userApplication,
    isLoading,
    isSubmitting,
    error,
    isDemoFixture,
    applyToClub,
    refetch,
  } = useClubDetail(clubId);

  const [isApplying, setIsApplying] = useState(false);
  const [statement, setStatement] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const isAlreadyMember = Boolean(
    user &&
      club &&
      (club.coordinators.some((c) => c.userId === user.id) ||
        user.memberships.some((m) => m.clubId === club.id && m.status === 'active'))
  );

  const hasPendingApplication = userApplication?.status === 'pending';
  const hasRejectedApplication = userApplication?.status === 'rejected';

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    const res = await applyToClub(statement);
    if (!res.success) {
      setSubmissionError(res.error?.message || 'Failed to submit application.');
    } else {
      setSubmissionSuccess(true);
      setIsApplying(false);
      setStatement('');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
        <GlassCard variant="glass">
          <LoadingSpinner label="Loading club details from database..." />
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
        <StatusBanner
          type="warning"
          title="Failed to Load Club"
          message={`Unable to retrieve club details: ${error.message}`}
          actionText="Retry"
          onAction={refetch}
        />
      </div>
    );
  }

  if (!club) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
        <GlassCard variant="glass" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <AlertTriangle size={36} color="var(--color-cyan-600)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
            Club Not Found
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', marginBottom: '1.25rem' }}>
            The requested club record could not be found in the database.
          </p>
          <Link to="/clubs" className="btn-primary-gradient" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Explore Registered Clubs
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        {isDemoFixture && (
          <Badge variant="blue" size="sm">
            Demo Fixture
          </Badge>
        )}
      </div>

      {submissionSuccess && (
        <StatusBanner
          type="success"
          title="Application Submitted"
          message="Your application to become a Student Coordinator has been submitted to the database and is pending review by the club leadership."
        />
      )}

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
            ) : hasPendingApplication ? (
              <Badge variant="blue" size="md">
                <Clock size={14} /> Application Submitted (Pending Review)
              </Badge>
            ) : hasRejectedApplication ? (
              <Badge variant="navy" size="md">
                <XCircle size={14} /> Application Not Approved
              </Badge>
            ) : user ? (
              <GlassButton
                variant="primary"
                onClick={() => setIsApplying(true)}
                icon={<Send size={16} />}
              >
                Apply to Join as Student Coordinator
              </GlassButton>
            ) : (
              <Link to="/sign-in" className="btn-primary-gradient" style={{ fontSize: '0.875rem' }}>
                Sign in to Apply
              </Link>
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
              {club.coordinators.length} Student Coordinator{club.coordinators.length === 1 ? '' : 's'}
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

          {submissionError && (
            <div style={{ marginBottom: '1rem' }}>
              <StatusBanner
                type="warning"
                title="Application Error"
                message={submissionError}
              />
            </div>
          )}

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
                disabled={isSubmitting}
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
              <GlassButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Application...' : 'Submit Application for Review'}
              </GlassButton>
              <GlassButton
                type="button"
                variant="ghost"
                onClick={() => setIsApplying(false)}
                disabled={isSubmitting}
              >
                Cancel
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Student Coordinator Roster Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
              Student Coordinator Roster
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-muted)' }}>
              The approved student leadership team for this club. Each member is an approved Student Coordinator.
            </p>
          </div>
          <button
            onClick={refetch}
            className="btn-secondary-glass"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem', cursor: 'pointer' }}
          >
            <RefreshCw size={12} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {club.coordinators.length === 0 ? (
          <GlassCard variant="solid">
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-navy-muted)', fontSize: '0.875rem' }}>
              No approved coordinators are currently listed for this club in the database.
            </div>
          </GlassCard>
        ) : (
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
                        {coord.studentId ? `ID: ${coord.studentId}` : 'ID: Verified'}
                        {coord.year && ` • ${coord.year}`}
                        {coord.section && ` (${coord.section})`}
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
        )}
      </div>
    </div>
  );
};
