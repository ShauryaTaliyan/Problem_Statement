// ============================================================================
// MSOT Clubs — Not Found (404) Page
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '1rem',
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <GlassCard variant="solid" elevation="standard">
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-blue-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <Compass size={32} color="var(--color-blue-700)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
            Page Not Found (404)
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
            The requested page does not exist or has been moved.
          </p>
          <Link to="/" className="btn-primary-gradient">
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
};
