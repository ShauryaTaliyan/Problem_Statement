// ============================================================================
// MSOT Clubs — LoadingSpinner Component
// ============================================================================

import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading MSOT Clubs...',
  fullScreen = false,
}) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: '3px solid rgba(147, 197, 253, 0.4)',
          borderTopColor: 'var(--color-cyan-500)',
          borderRightColor: 'var(--color-blue-600)',
          animation: 'spin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
        }}
      />
      {label && (
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-navy-secondary)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-canvas)',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem 3.5rem',
            boxShadow: 'var(--shadow-3d-elevated)',
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
};
