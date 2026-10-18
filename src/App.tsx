// ============================================================================
// MSOT Clubs — Application Routes
// ============================================================================

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { Clubs } from './pages/Clubs';
import { ClubDetail } from './pages/ClubDetail';
import { Events } from './pages/Events';
import { Calendar } from './pages/Calendar';
import { Profile } from './pages/Profile';
import { AccessDenied } from './pages/AccessDenied';
import { NotFound } from './pages/NotFound';
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { DelegationsManager } from './pages/coordinator/DelegationsManager';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        {/* Public / Student Accessible Routes */}
        <Route index element={<Home />} />
        <Route path="clubs" element={<Clubs />} />
        <Route path="clubs/:clubId" element={<ClubDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="sign-in" element={<SignIn />} />

        {/* Authenticated Student Routes */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Coordinator Workspace Routes (Coordinator, President, Admin) */}
        <Route
          path="coordinator"
          element={
            <ProtectedRoute allowedRoles={['coordinator', 'president', 'admin']}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Delegations Manager Route (President, Admin) */}
        <Route
          path="coordinator/delegations"
          element={
            <ProtectedRoute allowedRoles={['president', 'admin']}>
              <DelegationsManager />
            </ProtectedRoute>
          }
        />

        {/* Access Denied */}
        <Route path="access-denied" element={<AccessDenied />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
