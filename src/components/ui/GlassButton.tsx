// ============================================================================
// MSOT Clubs — GlassButton Component
// Palette: Navy, Blue, Cyan, Teal, White ONLY
// ============================================================================

import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const getStyles = (): React.CSSProperties => {
    const sizePadding = {
      sm: '0.4rem 0.85rem',
      md: '0.625rem 1.25rem',
      lg: '0.8rem 1.6rem',
    }[size];

    const fontSize = {
      sm: '0.8125rem',
      md: '0.9375rem',
      lg: '1.0625rem',
    }[size];

    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 600,
      borderRadius: 'var(--radius-md)',
      padding: sizePadding,
      fontSize,
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      border: 'none',
      textDecoration: 'none',
      ...style,
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          background: 'linear-gradient(135deg, var(--color-blue-700) 0%, var(--color-cyan-600) 100%)',
          color: 'var(--text-white)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.35)',
        };
      case 'teal':
        return {
          ...base,
          background: 'linear-gradient(135deg, var(--color-teal-700) 0%, var(--color-teal-500) 100%)',
          color: 'var(--text-white)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 4px 14px 0 rgba(20, 184, 166, 0.3)',
        };
      case 'secondary':
        return {
          ...base,
          background: 'rgba(255, 255, 255, 0.8)',
          color: 'var(--text-navy-primary)',
          border: '1px solid var(--border-glass-light)',
          boxShadow: 'var(--shadow-glass-sm)',
        };
      case 'outline':
        return {
          ...base,
          background: 'transparent',
          color: 'var(--color-blue-700)',
          border: '1.5px solid var(--color-blue-500)',
        };
      case 'ghost':
        return {
          ...base,
          background: 'transparent',
          color: 'var(--text-navy-secondary)',
        };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`glass-btn ${className}`}
      style={getStyles()}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        icon && <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
      {children}
    </button>
  );
};
