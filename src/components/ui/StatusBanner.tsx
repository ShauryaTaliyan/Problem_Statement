// ============================================================================
// MSOT Clubs — StatusBanner Component
// Non-intrusive operational notice banner
// ============================================================================

import React from 'react';
import { Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface StatusBannerProps {
  type?: 'info' | 'warning' | 'success';
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  type = 'info',
  title,
  message,
  actionText,
  onAction,
  className = '',
}) => {
  const getBannerConfig = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'rgba(239, 246, 255, 0.95)',
          border: 'var(--color-blue-400)',
          textColor: 'var(--color-navy-900)',
          icon: <ShieldAlert size={18} color="var(--color-blue-700)" />,
        };
      case 'success':
        return {
          bg: 'rgba(240, 253, 250, 0.95)',
          border: 'var(--color-teal-400)',
          textColor: 'var(--color-teal-700)',
          icon: <CheckCircle2 size={18} color="var(--color-teal-600)" />,
        };
      case 'info':
      default:
        return {
          bg: 'rgba(236, 254, 255, 0.95)',
          border: 'var(--color-cyan-400)',
          textColor: 'var(--color-cyan-700)',
          icon: <Info size={18} color="var(--color-cyan-600)" />,
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div
      className={`status-banner ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        boxShadow: 'var(--shadow-glass-sm)',
        color: config.textColor,
        fontSize: '0.875rem',
        backdropFilter: 'var(--backdrop-blur-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{config.icon}</span>
        <div>
          {title && <strong style={{ display: 'block', fontWeight: 600 }}>{title}</strong>}
          <span>{message}</span>
        </div>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            fontWeight: 700,
            color: 'var(--color-blue-700)',
            cursor: 'pointer',
            textDecoration: 'underline',
            flexShrink: 0,
            fontSize: '0.8125rem',
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
