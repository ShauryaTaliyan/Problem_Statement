// ============================================================================
// MSOT Clubs — Application Header
// Light glassmorphic header with campus indicator & role switcher
// ============================================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcher } from '../auth/RoleSwitcher';
import { MapPin, Bell, LogOut, Shield } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isCoordinatorOrStaff =
    user?.roles.some((r) =>
      ['coordinator', 'president', 'advisor', 'campus_manager', 'admin'].includes(r)
    );

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-glass-nav)',
        backdropFilter: 'var(--backdrop-blur)',
        WebkitBackdropFilter: 'var(--backdrop-blur)',
        borderBottom: '1px solid var(--border-glass-light)',
        boxShadow: 'var(--shadow-glass-sm)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Logo & Campus */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onToggleSidebar && isCoordinatorOrStaff && (
            <button
              onClick={onToggleSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid var(--border-glass-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem',
                cursor: 'pointer',
                color: 'var(--text-navy-primary)',
              }}
              aria-label="Toggle Navigation Drawer"
            >
              <Shield size={18} color="var(--color-blue-700)" />
            </button>
          )}

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
            }}
          >
            {/* SVG Logo mark */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--color-navy-900) 0%, var(--color-blue-700) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glass-sm)',
                border: '1px solid var(--color-cyan-400)',
              }}
            >
              <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1rem' }}>M</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--color-navy-900)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                MSOT Clubs
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'var(--color-cyan-600)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Activities Tracker
              </div>
            </div>
          </Link>

          {/* Campus Tag */}
          {user?.campusCode && (
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-navy-700)',
                backgroundColor: 'var(--color-blue-50)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-blue-200)',
              }}
              className="desktop-campus-badge"
            >
              <MapPin size={12} color="var(--color-blue-600)" />
              <span>{user.campusCode}</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
          className="desktop-nav"
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: location.pathname === '/' ? 700 : 500,
              color: location.pathname === '/' ? 'var(--color-blue-700)' : 'var(--text-navy-secondary)',
            }}
          >
            Home
          </Link>
          <Link
            to="/clubs"
            style={{
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: location.pathname.startsWith('/clubs') ? 700 : 500,
              color: location.pathname.startsWith('/clubs') ? 'var(--color-blue-700)' : 'var(--text-navy-secondary)',
            }}
          >
            Clubs
          </Link>
          <Link
            to="/events"
            style={{
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: location.pathname === '/events' ? 700 : 500,
              color: location.pathname === '/events' ? 'var(--color-blue-700)' : 'var(--text-navy-secondary)',
            }}
          >
            Events
          </Link>
          <Link
            to="/calendar"
            style={{
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: location.pathname === '/calendar' ? 700 : 500,
              color: location.pathname === '/calendar' ? 'var(--color-blue-700)' : 'var(--text-navy-secondary)',
            }}
          >
            Calendar
          </Link>
          {isCoordinatorOrStaff && (
            <Link
              to="/coordinator"
              style={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: location.pathname.startsWith('/coordinator') ? 700 : 600,
                color: 'var(--color-cyan-700)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Shield size={14} />
              <span>Workspace</span>
            </Link>
          )}
        </nav>

        {/* Right Controls: Role Switcher & User Profile Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <RoleSwitcher />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-navy-700)',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Notifications"
              >
                <Bell size={18} />
              </button>

              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid var(--border-glass-light)',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-blue-600)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {user.fullName.charAt(0)}
                </div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-navy-primary)',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.fullName.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={() => signOut()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-navy-muted)',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/sign-in"
              className="btn-primary-gradient"
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.9rem' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-campus-badge {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .desktop-campus-badge {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
