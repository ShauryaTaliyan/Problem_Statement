// ============================================================================
// MSOT Clubs — Isometric 3D Icons
// Palette: Navy, Blue, Cyan, Teal, White ONLY
// ============================================================================

import React from 'react';

interface IsometricIconProps {
  type: 'campus' | 'club' | 'governance' | 'events';
  size?: number;
  className?: string;
}

export const IsometricIcon: React.FC<IsometricIconProps> = ({
  type,
  size = 48,
  className = '',
}) => {
  switch (type) {
    case 'campus':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="topFace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#CFFAFE" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="leftFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="rightFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891B2" />
              <stop offset="100%" stopColor="#0E7490" />
            </linearGradient>
          </defs>
          {/* Main Tower Isometric Faces */}
          <polygon points="32,6 52,17 32,28 12,17" fill="url(#topFace)" stroke="#93C5FD" strokeWidth="1" />
          <polygon points="12,17 32,28 32,54 12,43" fill="url(#leftFace)" />
          <polygon points="32,28 52,17 52,43 32,54" fill="url(#rightFace)" />
          {/* Glass Architectural Windows */}
          <polygon points="17,25 27,31 27,38 17,32" fill="#BAE6FD" opacity="0.6" />
          <polygon points="37,31 47,25 47,32 37,38" fill="#CFFAFE" opacity="0.7" />
          {/* Base Platform Shadow */}
          <ellipse cx="32" cy="56" rx="22" ry="6" fill="#0A192F" fillOpacity="0.12" />
        </svg>
      );

    case 'club':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="clubTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#A5F3FC" />
            </linearGradient>
            <linearGradient id="clubLeft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="clubRight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          {/* Isometric Diamond / Club Node */}
          <polygon points="32,8 54,20 32,32 10,20" fill="url(#clubTop)" stroke="#FFFFFF" strokeWidth="1.5" />
          <polygon points="10,20 32,32 32,52 10,40" fill="url(#clubLeft)" />
          <polygon points="32,32 54,20 54,40 32,52" fill="url(#clubRight)" />
          {/* Inner Light Core */}
          <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
        </svg>
      );

    case 'governance':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="govShield" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          {/* 3D Shield */}
          <path
            d="M32 8L50 16V34C50 46 32 56 32 56C32 56 14 46 14 34V16L32 8Z"
            fill="url(#govShield)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          {/* Inner Crown Nodes */}
          <polygon points="32,20 36,28 44,24 40,36 24,36 20,24 28,28" fill="#FFFFFF" opacity="0.9" />
          <circle cx="32" cy="42" r="3" fill="#67E8F9" />
        </svg>
      );

    case 'events':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="podiumTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#CFFAFE" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id="podiumSide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891B2" />
              <stop offset="100%" stopColor="#0A192F" />
            </linearGradient>
          </defs>
          {/* Isometric Calendar / Podium */}
          <polygon points="32,12 50,22 32,32 14,22" fill="url(#podiumTop)" stroke="#93C5FD" strokeWidth="1" />
          <polygon points="14,22 32,32 32,48 14,38" fill="#2563EB" />
          <polygon points="32,32 50,22 50,38 32,48" fill="url(#podiumSide)" />
          {/* Event Star */}
          <polygon points="32,18 34,22 38,22 35,24 36,28 32,25 28,28 29,24 26,22 30,22" fill="#0E7490" />
        </svg>
      );
  }
};
