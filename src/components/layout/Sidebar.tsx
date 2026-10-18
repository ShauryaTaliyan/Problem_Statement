// ============================================================================
// MSOT Clubs — Staff & Leadership Navigation Sidebar / Drawer
// ============================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  FileCheck,
  Users,
  Layers,
  Activity,
  X,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const isPresident = user?.roles.includes('president');
  const isAdvisor = user?.roles.includes('advisor');
  const isManager = user?.roles.includes('campus_manager');
  const isAdmin = user?.roles.includes('admin');

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 25, 47, 0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 90,
        }}
      />

      {/* Drawer */}
      <aside
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '300px',
          backgroundColor: '#FFFFFF',
          zIndex: 100,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-glass-lg)',
          borderRadius: '0 20px 20px 0',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-glass-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--color-blue-700)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
              Leadership Suite
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-navy-muted)',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Scope Banner */}
        <div
          style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-blue-50)',
            border: '1px solid var(--color-blue-200)',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--color-blue-700)' }}>
            {user?.fullName}
          </div>
          <div style={{ color: 'var(--text-navy-muted)', marginTop: '2px' }}>
            Campus: <strong>{user?.campusName || 'MSOT'}</strong>
          </div>
          <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {user?.roles.map((r) => (
              <Badge key={r} variant="navy" size="sm">
                {r.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Navigation Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section: Coordinator & Club Day Ops */}
          <div>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-navy-muted)',
                marginBottom: '0.4rem',
              }}
            >
              Coordinator Workspace
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <NavLink
                to="/coordinator"
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-blue-700)' : 'var(--text-navy-secondary)',
                  backgroundColor: isActive ? 'var(--color-blue-100)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Activity size={16} />
                <span>Club Workspace</span>
              </NavLink>

              <NavLink
                to="/coordinator/delegations"
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-blue-700)' : 'var(--text-navy-secondary)',
                  backgroundColor: isActive ? 'var(--color-blue-100)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Layers size={16} />
                <span>Delegations Manager</span>
              </NavLink>
            </div>
          </div>

          {/* Section: President Governance (Visible if President or Admin) */}
          {(isPresident || isAdmin) && (
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-cyan-700)',
                  marginBottom: '0.4rem',
                }}
              >
                Club President Powers
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <NavLink
                  to="/coordinator/applications"
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-blue-700)' : 'var(--text-navy-secondary)',
                    backgroundColor: isActive ? 'var(--color-blue-100)' : 'transparent',
                    textDecoration: 'none',
                  })}
                >
                  <Users size={16} />
                  <span>Review Applications</span>
                </NavLink>

                <NavLink
                  to="/coordinator/delegations"
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-blue-700)' : 'var(--text-navy-secondary)',
                    backgroundColor: isActive ? 'var(--color-blue-100)' : 'transparent',
                    textDecoration: 'none',
                  })}
                >
                  <Shield size={16} />
                  <span>Grant / Revoke Powers</span>
                </NavLink>
              </div>
            </div>
          )}

          {/* Section: Advisor Reviews */}
          {(isAdvisor || isAdmin) && (
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-teal-700)',
                  marginBottom: '0.4rem',
                }}
              >
                Faculty Advisor
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-navy-secondary)',
                  }}
                >
                  <FileCheck size={16} />
                  <span>Plan Review Queue (P1/P2)</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Campus Manager & Admin */}
          {(isManager || isAdmin) && (
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-navy-800)',
                  marginBottom: '0.4rem',
                }}
              >
                Campus Administration
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-navy-secondary)',
                  }}
                >
                  <Layers size={16} />
                  <span>Campus Clubs Registry</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
