// ============================================================================
// MSOT Clubs — Responsive Application Shell
// Light glassmorphic layout container
// ============================================================================

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { StatusBanner } from '../ui/StatusBanner';
import { useAuth } from '../../context/AuthContext';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDemoMode, configMessage } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      {/* Configuration Status Notice in Demo Mode */}
      {isDemoMode && configMessage && (
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0.5rem 1rem 0' }}>
          <StatusBanner
            type="info"
            title="Development / Demo Mode"
            message={configMessage}
          />
        </div>
      )}

      {/* Top Application Header */}
      <Header onToggleSidebar={() => setSidebarOpen(true)} />

      {/* Sidebar Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '1.5rem 1rem 5rem 1rem', // Extra bottom padding for mobile nav
        }}
      >
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
