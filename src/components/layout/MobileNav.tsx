// ============================================================================
// MSOT Clubs — Mobile Bottom Navigation
// Mobile-first PWA bottom bar for students & coordinators
// ============================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Calendar, Award, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: <Home size={20} /> },
    { label: 'Clubs', path: '/clubs', icon: <Compass size={20} /> },
    { label: 'Events', path: '/events', icon: <Award size={20} /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { label: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-glass-nav)',
        backdropFilter: 'var(--backdrop-blur)',
        WebkitBackdropFilter: 'var(--backdrop-blur)',
        borderTop: '1px solid var(--border-glass-light)',
        boxShadow: '0 -4px 16px rgba(10, 25, 47, 0.06)',
        display: 'none',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: '56px',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-blue-700)' : 'var(--text-navy-muted)',
              fontSize: '0.6875rem',
              fontWeight: isActive ? 700 : 500,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              transition: 'color 0.15s ease',
              minWidth: '56px',
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};
