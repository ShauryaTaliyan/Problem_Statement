// ============================================================================
// MSOT Clubs — Club President Permission Delegation Manager
// Invariant: President delegates granular club-scoped powers with audit logging.
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CLUBS, DEMO_DELEGATIONS, DEMO_AUDIT_LOGS } from '../../lib/demoData';
import { ClubPermission } from '../../types/auth';
import { PermissionDelegation, AuditLogItem } from '../../types/club';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { Badge } from '../../components/ui/Badge';
import {
  Shield,
  Key,
  PlusCircle,
  XCircle,
  History,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const DelegationsManager: React.FC = () => {
  const { user } = useAuth();
  const club = DEMO_CLUBS[0]; // Coding Club

  const [delegations, setDelegations] = useState<PermissionDelegation[]>(DEMO_DELEGATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(DEMO_AUDIT_LOGS);

  // Granting form state
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    club.coordinators.find((c) => !c.isPresident)?.userId || ''
  );
  const [selectedPermission, setSelectedPermission] = useState<ClubPermission>('run_checkin');

  // Revocation state
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('');

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const availableCoordinators = club.coordinators.filter((c) => !c.isPresident);

  const permissionOptions: { value: ClubPermission; label: string; desc: string }[] = [
    { value: 'run_checkin', label: 'Run Check-In', desc: 'Display rotating QR session and verify attendee check-ins' },
    { value: 'manage_submissions', label: 'Manage Submissions', desc: 'Configure activity deliverables and deadlines' },
    { value: 'create_activity_plan', label: 'Create Activity Plan', desc: 'Draft and edit 7-day Club Day plans' },
    { value: 'submit_activity_plan', label: 'Submit Plan to Advisor', desc: 'Formally submit activity plan for advisor sign-off' },
    { value: 'review_applications', label: 'Review Applications', desc: 'Screen and approve prospective Student Coordinators' },
    { value: 'correct_attendance', label: 'Correct Attendance', desc: 'Authorized manual attendance adjustments with reason' },
    { value: 'manage_events', label: 'Manage Club Events', desc: 'Configure club-organized events, teams, and eligibility' },
    { value: 'view_reports', label: 'View Club Reports', desc: 'Export monthly attendance and submission analytics' },
  ];

  const handleGrantDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId) {
      setFeedbackMessage({ type: 'error', text: 'Please select an approved Student Coordinator.' });
      return;
    }

    const recipient = club.coordinators.find((c) => c.userId === selectedRecipientId);
    if (!recipient) return;

    // Check if duplicate delegation
    const exists = delegations.some(
      (d) => d.recipientId === selectedRecipientId && d.permission === selectedPermission && !d.isRevoked
    );
    if (exists) {
      setFeedbackMessage({
        type: 'error',
        text: `${recipient.fullName} already holds active delegated power "${selectedPermission}".`,
      });
      return;
    }

    const newDelegation: PermissionDelegation = {
      id: `deleg-${Date.now()}`,
      clubId: club.id,
      grantorId: user?.id || 'd0000000-0000-4000-8000-000000000001',
      grantorName: `${user?.fullName || 'Aarav Sharma'} (President)`,
      recipientId: recipient.userId,
      recipientName: `${recipient.fullName} (Coordinator)`,
      permission: selectedPermission,
      isRevoked: false,
      grantedAt: new Date().toISOString(),
    };

    const newAuditLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      actorName: `${user?.fullName || 'Aarav Sharma'} (President)`,
      action: 'GRANT_DELEGATION',
      targetTable: 'club_permission_delegations',
      targetId: newDelegation.id,
      reason: `President delegated power "${selectedPermission}" to ${recipient.fullName}`,
      createdAt: new Date().toISOString(),
    };

    setDelegations([newDelegation, ...delegations]);
    setAuditLogs([newAuditLog, ...auditLogs]);
    setFeedbackMessage({
      type: 'success',
      text: `Successfully granted "${selectedPermission}" to ${recipient.fullName}. Logged to audit trail.`,
    });
  };

  const handleRevoke = (delegationId: string) => {
    if (!revokeReason) {
      setFeedbackMessage({ type: 'error', text: 'A mandatory reason is required to revoke a delegated power.' });
      return;
    }

    const target = delegations.find((d) => d.id === delegationId);
    if (!target) return;

    const updatedDelegations = delegations.map((d) =>
      d.id === delegationId
        ? {
            ...d,
            isRevoked: true,
            revokedAt: new Date().toISOString(),
            revokeReason,
          }
        : d
    );

    const newAuditLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      actorName: `${user?.fullName || 'Aarav Sharma'} (President)`,
      action: 'REVOKE_DELEGATION',
      targetTable: 'club_permission_delegations',
      targetId: delegationId,
      reason: `Revocation Reason: ${revokeReason}`,
      createdAt: new Date().toISOString(),
    };

    setDelegations(updatedDelegations);
    setAuditLogs([newAuditLog, ...auditLogs]);
    setRevokingId(null);
    setRevokeReason('');
    setFeedbackMessage({
      type: 'success',
      text: `Revoked power "${target.permission}" from ${target.recipientName}. Recorded in audit history.`,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Badge variant="navy" size="sm">
            <Shield size={12} color="var(--color-cyan-400)" />
            President Powers
          </Badge>
          <Badge variant="cyan" size="sm">
            {club.name}
          </Badge>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
          Club Permission Delegations
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-navy-secondary)', maxWidth: '760px' }}>
          As Club President, you can grant specific club-scoped powers to approved Student Coordinators.
          <strong> Delegated permissions are granular and cannot exceed your club authority. Every grant and revocation is recorded in the immutable audit log.</strong>
        </p>
      </div>

      {feedbackMessage && (
        <div
          style={{
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: feedbackMessage.type === 'success' ? 'var(--color-teal-50)' : '#FEF2F2',
            border: `1px solid ${feedbackMessage.type === 'success' ? 'var(--color-teal-300)' : '#FCA5A5'}`,
            color: feedbackMessage.type === 'success' ? 'var(--color-teal-700)' : '#991B1B',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Grant New Permission Card */}
      <GlassCard variant="solid" elevation="standard">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <PlusCircle size={20} color="var(--color-blue-700)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
            Delegate a Club Power
          </h2>
        </div>

        <form onSubmit={handleGrantDelegation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-navy-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Recipient Coordinator (Must be approved member):
              </label>
              <select
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass-light)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  color: 'var(--text-navy-primary)',
                  outline: 'none',
                }}
              >
                {availableCoordinators.map((c) => (
                  <option key={c.userId} value={c.userId}>
                    {c.fullName} — {c.year} ({c.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-navy-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Granular Club Permission:
              </label>
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value as ClubPermission)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass-light)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  color: 'var(--text-navy-primary)',
                  outline: 'none',
                }}
              >
                {permissionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <GlassButton type="submit" variant="primary" icon={<Key size={16} />}>
              Grant Delegated Permission
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* Active Delegations Table */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.75rem' }}>
          Current Club Delegations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {delegations.map((d) => (
            <GlassCard key={d.id} variant="solid">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant={d.isRevoked ? 'navy' : 'teal'} size="sm">
                      {d.permission.replace(/_/g, ' ')}
                    </Badge>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                      {d.recipientName}
                    </span>
                    {d.isRevoked && (
                      <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 600 }}>
                        (Revoked)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)', marginTop: '4px' }}>
                    Granted by {d.grantorName} &bull; {new Date(d.grantedAt).toLocaleDateString()}
                    {d.revokedAt && ` • Revoked on ${new Date(d.revokedAt).toLocaleDateString()}`}
                  </div>
                  {d.revokeReason && (
                    <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '2px' }}>
                      Reason: {d.revokeReason}
                    </div>
                  )}
                </div>

                {!d.isRevoked && (
                  <div>
                    {revokingId === d.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Mandatory audit reason..."
                          value={revokeReason}
                          onChange={(e) => setRevokeReason(e.target.value)}
                          style={{
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.8125rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-glass-light)',
                            outline: 'none',
                          }}
                        />
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(d.id)}
                          style={{ color: '#991B1B', fontWeight: 700 }}
                        >
                          Confirm Revoke
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokingId(null)}
                        >
                          Cancel
                        </GlassButton>
                      </div>
                    ) : (
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRevokingId(d.id);
                          setRevokeReason('');
                        }}
                        style={{ color: '#991B1B', fontSize: '0.8125rem' }}
                        icon={<XCircle size={14} />}
                      >
                        Revoke Power
                      </GlassButton>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Immutable Audit Log Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <History size={18} color="var(--color-navy-700)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
            Immutable Governance Audit Log
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {auditLogs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-glass-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-blue-700)', marginRight: '6px' }}>
                  {log.action}
                </strong>
                <span style={{ color: 'var(--text-navy-primary)' }}>
                  {log.reason || 'Governance change recorded'}
                </span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-navy-muted)', marginTop: '2px' }}>
                  Actor: {log.actorName || 'System'}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)' }}>
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
