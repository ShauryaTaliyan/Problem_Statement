// ============================================================================
// MSOT Clubs — Sign Up / Account Registration Page
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { IsometricIcon } from '../components/ui/IsometricIcon';
import { UserPlus, CheckCircle, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export const SignUp: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(trimmedName, trimmedEmail, password);
      setIsLoading(false);

      if (result.error) {
        setErrorMessage(result.error.message);
        return;
      }

      setIsSuccess(true);
      setNeedsEmailConfirmation(result.needsEmailConfirmation);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      setErrorMessage(msg);
    }
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
      <div style={{ maxWidth: '460px', width: '100%' }}>
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
              Create Student Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', marginTop: '4px' }}>
              Register to explore clubs, apply for coordinator roles, and earn verified credentials.
            </p>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-teal-50)',
                  border: '1px solid var(--color-teal-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                {needsEmailConfirmation ? (
                  <Mail size={28} color="var(--color-teal-600)" />
                ) : (
                  <CheckCircle size={28} color="var(--color-teal-600)" />
                )}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
                {needsEmailConfirmation ? 'Verify Your Email' : 'Account Created Successfully!'}
              </h2>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {needsEmailConfirmation ? (
                  <>
                    We have sent a verification email to <strong>{email}</strong>. Please check your inbox and click the confirmation link to activate your account.
                  </>
                ) : (
                  'Your student profile has been created. You can now sign in to access your clubs dashboard.'
                )}
              </p>

              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/sign-in')}
                style={{ width: '100%' }}
                icon={<ArrowRight size={18} />}
              >
                Proceed to Sign In
              </GlassButton>
            </div>
          ) : (
            <>
              {/* Error Alert */}
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
                    lineHeight: 1.4,
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label
                    htmlFor="fullName"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-navy-primary)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Das"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass-light)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--text-navy-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                  />
                </div>

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
                    Institutional Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@student.msot.ac.in"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass-light)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--text-navy-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass-light)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--text-navy-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-navy-primary)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass-light)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--text-navy-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                  />
                </div>

                {/* Default Role Info */}
                <div
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-blue-50)',
                    border: '1px solid var(--color-blue-200)',
                    fontSize: '0.725rem',
                    color: 'var(--color-navy-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    lineHeight: 1.35,
                  }}
                >
                  <ShieldCheck size={16} color="var(--color-blue-600)" style={{ flexShrink: 0 }} />
                  <span>
                    New accounts automatically receive standard <strong>Student</strong> access. Coordinator and leadership roles are club-specific and granted only after application approval.
                  </span>
                </div>

                <GlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  style={{ width: '100%', marginTop: '0.35rem' }}
                  icon={<UserPlus size={18} />}
                >
                  Create Account
                </GlassButton>
              </form>

              {/* Navigation back to Sign In */}
              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-glass-light)',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: 'var(--text-navy-secondary)',
                }}
              >
                Already have an account?{' '}
                <Link
                  to="/sign-in"
                  style={{
                    fontWeight: 700,
                    color: 'var(--color-blue-700)',
                    textDecoration: 'none',
                  }}
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
