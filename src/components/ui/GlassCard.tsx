// ============================================================================
// MSOT Clubs — GlassCard Component
// Light Glassmorphism surface with optional 3D elevation
// ============================================================================

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: 'flat' | 'standard' | 'elevated3D';
  variant?: 'glass' | 'solid' | 'interactive';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  elevation = 'standard',
  variant = 'glass',
  className = '',
  style,
  ...props
}) => {
  const getCardStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      ...style,
    };

    if (variant === 'solid') {
      return {
        ...baseStyle,
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-glass-light)',
        boxShadow: 'var(--shadow-glass-sm)',
      };
    }

    if (elevation === 'elevated3D') {
      return {
        ...baseStyle,
        backgroundColor: 'var(--bg-glass-card)',
        backdropFilter: 'var(--backdrop-blur)',
        WebkitBackdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--border-glass-cyan)',
        boxShadow: 'var(--shadow-3d-elevated)',
      };
    }

    return {
      ...baseStyle,
      backgroundColor: 'var(--bg-glass-card)',
      backdropFilter: 'var(--backdrop-blur)',
      WebkitBackdropFilter: 'var(--backdrop-blur)',
      border: '1px solid var(--border-glass-light)',
      boxShadow: 'var(--shadow-glass-md)',
    };
  };

  return (
    <div
      className={`glass-card ${variant === 'interactive' ? 'cursor-pointer hover:border-cyan-500' : ''} ${className}`}
      style={getCardStyle()}
      {...props}
    >
      {/* Top subtle highlight reflection line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
};
