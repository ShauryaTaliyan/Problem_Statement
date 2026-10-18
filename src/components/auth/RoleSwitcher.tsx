// ============================================================================
// MSOT Clubs — RoleSwitcher Component (Demo & Verification Mode)
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { DEMO_PROFILES } from '../../lib/demoData';
import { Users, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const RoleSwitcher: React.FC = () => {
  const { user, isDemoMode, currentRole, switchDemoRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isDemoMode) {
    return null;
  }

  const roleLabels: Record<UserRole, { title: string; desc: string }> = {
    student: {
      title: 'Student (Applicant)',
      desc: 'Ananya Das — 1st Year CSE (Can browse, apply to clubs, attend campus events)',
    },
    coordinator: {
      title: 'Student Coordinator',
      desc: 'Diya Patel — 3rd Year CSE (Approved coordinator with delegated checkin & submission rights)',
    },
    president: {
      title: 'Club President',
      desc: 'Aarav Sharma — 3rd Year CSE (Coding Club President with delegation powers)',
    },
    advisor: {
      title: 'Faculty Advisor',
      desc: 'Dr. Rajesh Kumar — CSE Dept (Reviews activity plans and evaluations)',
    },
    campus_manager: {
      title: 'Campus Manager',
      desc: 'Vikram Malhotra — BLR Operations (Campus-wide club approvals and reports)',
    },
    admin: {
      title: 'Admin / Program Manager',
      desc: 'Prof. K. V. Ramanathan — Program Directorate (Full cross-campus oversight)',
    },
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid var(--border-glass-cyan)',
          color: 'var(--text-navy-primary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-glass-sm)',
        }}
        title="Switch persona for testing"
      >
        <Sparkles size={14} color="var(--color-cyan-600)" />
        <span>Demo: <strong>{user?.fullName.split(' ')[0]}</strong></span>
        <Badge variant="cyan" size="sm">
          {currentRole.replace('_', ' ')}
        </Badge>
        <ChevronDown size={14} color="var(--color-navy-700)" />
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
          />
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              zIndex: 999,
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-glass-lg)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                paddingBottom: '0.5rem',
                marginBottom: '0.5rem',
                borderBottom: '1px solid var(--border-glass-light)',
                fontSize: '0.75rem',
                color: 'var(--text-navy-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Users size={14} />
              <span>Switch Testing Role</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {(Object.keys(roleLabels) as UserRole[]).map((r) => {
                const isSelected = currentRole === r;
                const profile = DEMO_PROFILES[r];
                return (
                  <button
                    key={r}
                    onClick={() => {
                      switchDemoRole(r);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--color-blue-50)' : 'transparent',
                      border: isSelected
                        ? '1px solid var(--color-blue-300)'
                        : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: isSelected
                            ? 'var(--color-blue-700)'
                            : 'var(--text-navy-primary)',
                        }}
                      >
                        {roleLabels[r].title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-navy-muted)',
                          marginTop: '2px',
                          lineHeight: 1.3,
                        }}
                      >
                        {profile.fullName} ({profile.studentId})
                      </div>
                    </div>
                    {isSelected && <Check size={16} color="var(--color-blue-600)" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
