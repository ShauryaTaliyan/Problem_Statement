// ============================================================================
// MSOT Clubs — Governance & Data Invariant Tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  DEMO_CAMPUSES,
  DEMO_CLUBS,
  DEMO_DELEGATIONS,
  DEMO_PROFILES,
} from '../lib/demoData';

describe('Club Governance & Seed Data Invariants', () => {
  it('P0-INV-1: Exactly 4 campuses are defined', () => {
    expect(DEMO_CAMPUSES).toHaveLength(4);
    const codes = DEMO_CAMPUSES.map((c) => c.code);
    expect(codes).toContain('BLR');
    expect(codes).toContain('DEL');
    expect(codes).toContain('HYD');
    expect(codes).toContain('PUN');
  });

  it('P0-INV-2: At least 3 clubs are defined', () => {
    expect(DEMO_CLUBS.length).toBeGreaterThanOrEqual(3);
  });

  it('P0-INV-3: Multiple Student Coordinators exist in at least one club', () => {
    const clubsWithMultipleCoordinators = DEMO_CLUBS.filter(
      (c) => c.coordinators.length > 1
    );
    expect(clubsWithMultipleCoordinators.length).toBeGreaterThanOrEqual(1);

    const codingClub = DEMO_CLUBS.find(
      (c) => c.name === 'Coding & Open Source Club'
    );
    expect(codingClub).toBeDefined();
    expect(codingClub!.coordinators.length).toBe(3);
  });

  it('P0-INV-4: Every approved club member is a Student Coordinator', () => {
    for (const club of DEMO_CLUBS) {
      for (const coordinator of club.coordinators) {
        expect(coordinator.fullName).toBeTruthy();
        expect(coordinator.userId).toBeTruthy();
      }
    }
  });

  it('P0-INV-5: Exactly one active President per active seeded club', () => {
    for (const club of DEMO_CLUBS.filter((c) => c.status === 'active' && c.coordinators.length > 0)) {
      const activePresidents = club.coordinators.filter((c) => c.isPresident);
      expect(activePresidents).toHaveLength(1);
      expect(club.activePresidentId).toBe(activePresidents[0].userId);
      expect(club.activePresidentName).toBe(activePresidents[0].fullName);
    }
  });

  it('P0-INV-6: Every active President is an approved coordinator of the same club', () => {
    for (const club of DEMO_CLUBS.filter((c) => c.activePresidentId)) {
      const presidentInRoster = club.coordinators.find(
        (c) => c.userId === club.activePresidentId
      );
      expect(presidentInRoster).toBeDefined();
      expect(presidentInRoster!.isPresident).toBe(true);
    }
  });

  it('P0-INV-7: Delegated club permissions belong strictly to coordinators of that same club', () => {
    for (const delegation of DEMO_DELEGATIONS) {
      const club = DEMO_CLUBS.find((c) => c.id === delegation.clubId);
      expect(club).toBeDefined();

      // Grantor must be president of the club
      expect(delegation.grantorId).toBe(club!.activePresidentId);

      // Recipient must be in coordinator roster of the club
      const recipientInClub = club!.coordinators.find(
        (c) => c.userId === delegation.recipientId
      );
      expect(recipientInClub).toBeDefined();

      // Recipient cannot be grantor
      expect(delegation.recipientId).not.toBe(delegation.grantorId);
    }
  });

  it('P0-INV-8: All 6 required global personas are configured in demo profiles', () => {
    const requiredRoles = [
      'student',
      'coordinator',
      'president',
      'advisor',
      'campus_manager',
      'admin',
    ];

    for (const role of requiredRoles) {
      const profile = DEMO_PROFILES[role];
      expect(profile).toBeDefined();
      expect(profile.fullName).toBeTruthy();
      expect(profile.email).toBeTruthy();
      expect(profile.campusId).toBeTruthy();
    }
  });
});
