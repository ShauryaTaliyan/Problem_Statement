// ============================================================================
// MSOT Clubs — Route & UI Integration Tests
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

describe('App Routing & Route Guards', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Home page on default route "/"', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Welcome,/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Student Clubs/i)).toBeInTheDocument();
  });

  it('renders Explore Clubs on "/clubs"', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/clubs']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Coding & Open Source Club/i)).toBeInTheDocument();
  });

  it('renders Campus Events on "/events"', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/events']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Campus & Inter-Campus Events/i)).toBeInTheDocument();
  });

  it('renders 404 page for unknown routes', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/non-existent-route']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Page Not Found \(404\)/i)).toBeInTheDocument();
  });

  it('denies access to President delegations when logged in as ordinary student', async () => {
    // Set demo role to ordinary student
    localStorage.setItem('msot_demo_role', 'student');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/coordinator/delegations']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Access Restricted \(403\)/i)).toBeInTheDocument();
  });

  it('allows access to President delegations when logged in as Club President', async () => {
    // Set demo role to club president
    localStorage.setItem('msot_demo_role', 'president');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/coordinator/delegations']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Club Permission Delegations/i)).toBeInTheDocument();
    expect(screen.getByText(/Delegate a Club Power/i)).toBeInTheDocument();
  });

  it('renders Sign In page with Create account link and Quick Test Persona in demo mode', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/sign-in']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/MSOT Clubs Sign In/i)).toBeInTheDocument();
    expect(screen.getByText(/Create account/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Test Persona/i)).toBeInTheDocument();
  });

  it('renders Sign Up registration form on "/sign-up"', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/sign-up']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Create Student Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Institutional Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
  });
});
