// ============================================================================
// MSOT Clubs — Badge Component
// Palette: Navy, Blue, Cyan, Teal, White ONLY
// ============================================================================

import React from 'react';

export type BadgeVariant = 'navy' | 'blue' | 'cyan' | 'teal' | 'glass';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  icon,
  className = '',
}) => {
  const getBadgeStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      borderRadius: 'var(--radius-full)',
      fontWeight: 600,
      fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
      padding: size === 'sm' ? '0.2rem 0.6rem' : '0.3rem 0.75rem',
      lineHeight: 1.2,
      letterSpacing: '0.01em',
    };

    switch (variant) {
      case 'navy':
        return {
          ...base,
          backgroundColor: 'var(--color-navy-900)',
          color: 'var(--text-white)',
          border: '1px solid var(--color-navy-700)',
        };
      case 'blue':
        return {
          ...base,
          backgroundColor: 'var(--color-blue-50)',
          color: 'var(--color-blue-700)',
          border: '1px solid var(--color-blue-300)',
        };
      case 'cyan':
        return {
          ...base,
          backgroundColor: 'var(--color-cyan-50)',
          color: 'var(--color-cyan-700)',
          border: '1px solid var(--color-cyan-300)',
        };
      case 'teal':
        return {
          ...base,
          backgroundColor: 'var(--color-teal-50)',
          color: 'var(--color-teal-700)',
          border: '1px solid var(--color-teal-300)',
        };
      case 'glass':
        return {
          ...base,
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'var(--backdrop-blur-sm)',
          WebkitBackdropFilter: 'var(--backdrop-blur-sm)',
          color: 'var(--text-navy-primary)',
          border: '1px solid var(--border-glass-light)',
          boxShadow: 'var(--shadow-glass-sm)',
        };
    }
  };

  return (
    <span className={`badge ${className}`} style={getBadgeStyle()}>
      {icon && <span style={{ display: 'inline-flex', fontSize: '0.9em' }}>{icon}</span>}
      {children}
    </span>
  );
};
