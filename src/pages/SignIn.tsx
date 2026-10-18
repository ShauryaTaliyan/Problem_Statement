// ============================================================================
// MSOT Clubs — Sign In Page
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Badge } from '../components/ui/Badge';
import { IsometricIcon } from '../components/ui/IsometricIcon';
import { DEMO_PROFILES } from '../lib/demoData';
import { UserRole } from '../types/auth';
import { Sparkles, LogIn } from 'lucide-react';

export const SignIn: React.FC = () => {
  const { signIn, switchDemoRole, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemoSelect = (role: UserRole) => {
    switchDemoRole(role);
    navigate(from, { replace: true });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        padding: '1rem',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <GlassCard variant="glass" elevation="elevated3D">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glass-sm)',
                  border: '1px solid var(--border-glass-cyan)',
                }}
              >
                <IsometricIcon type="campus" size={36} />
              </div>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
              MSOT Clubs Sign In
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', marginTop: '4px' }}>
              Access your club workspaces, activities, and verified credentials.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(254, 242, 242, 0.9)',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-navy-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Institutional Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@student.msot.ac.in"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass-light)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9375rem',
                  color: 'var(--text-navy-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-navy-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass-light)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9375rem',
                  color: 'var(--text-navy-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', marginTop: '0.5rem' }}
              icon={<LogIn size={18} />}
            >
              Sign In to Platform
            </GlassButton>
          </form>

          {/* Create Account Link */}
          <div
            style={{
              marginTop: '1.25rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-navy-secondary)',
            }}
          >
            Don&apos;t have an account?{' '}
            <Link
              to="/sign-up"
              style={{
                fontWeight: 700,
                color: 'var(--color-blue-700)',
                textDecoration: 'none',
              }}
            >
              Create account
            </Link>
          </div>

          {/* Quick Persona Selector for Testing (Only in unconfigured Dev/Demo mode) */}
          {isDemoMode && (
            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-glass-light)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-navy-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Sparkles size={14} color="var(--color-cyan-600)" />
                  Quick Test Persona
                </span>
                <Badge variant="cyan" size="sm">
                  Dev Mode
                </Badge>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                }}
              >
                {(['student', 'coordinator', 'president', 'advisor', 'campus_manager', 'admin'] as UserRole[]).map(
                  (role) => {
                    const p = DEMO_PROFILES[role];
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleQuickDemoSelect(role)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid var(--border-glass-light)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-blue-700)' }}>
                          {role.replace('_', ' ')}
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-navy-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {p.fullName.split(' ')[0]}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
