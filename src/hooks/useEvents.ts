// ============================================================================
// MSOT Clubs — useEvents Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { EventItem, fetchEvents } from '../services/clubService';
import { useAuth } from '../context/AuthContext';

const DEMO_EVENTS_FALLBACK: EventItem[] = [
  {
    id: 'ev-01',
    title: 'Autumn 2026 Inter-Campus Hackathon',
    organizerClubName: 'Coding & Open Source Club',
    campusCode: 'BLR',
    scope: 'inter-campus',
    date: 'Saturday, Nov 7, 2026',
    time: '09:00 AM – 06:00 PM IST',
    venue: 'Main Auditorium & Innovation Lab',
    eligibilityDescription: 'Open to All Students (All Campuses)',
    isCampusWideDefault: true,
    registeredCount: 142,
    capacity: 200,
    isRegistered: true,
  },
  {
    id: 'ev-02',
    title: 'Autonomous Drone Flight & ROS Simulation',
    organizerClubName: 'Robotics & Autonomous Systems',
    campusCode: 'BLR',
    scope: 'campus',
    date: 'Saturday, Nov 14, 2026',
    time: '10:00 AM – 01:00 PM IST',
    venue: 'Outdoor Ground & Robotics Arena',
    eligibilityDescription: 'All Students of BLR Campus (Default)',
    isCampusWideDefault: true,
    registeredCount: 38,
    capacity: 60,
    isRegistered: false,
  },
  {
    id: 'ev-03',
    title: 'Design Sprint: 3D Spatial Interfaces in Figma',
    organizerClubName: 'Design & Creative Media Club',
    campusCode: 'DEL',
    scope: 'campus',
    date: 'Wednesday, Nov 18, 2026',
    time: '02:00 PM – 05:00 PM IST',
    venue: 'Design Studio 204, North Campus',
    eligibilityDescription: 'Restricted: 1st & 2nd Year Students',
    isCampusWideDefault: false,
    registeredCount: 28,
    capacity: 40,
    isRegistered: false,
  },
];

export interface UseEventsResult {
  events: EventItem[];
  isLoading: boolean;
  error: Error | null;
  tableExists: boolean;
  schemaNotice?: string;
  isDemoFixture: boolean;
  refetch: () => Promise<void>;
}

export function useEvents(): UseEventsResult {
  const { isDemoMode } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [tableExists, setTableExists] = useState<boolean>(true);
  const [schemaNotice, setSchemaNotice] = useState<string | undefined>(undefined);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (isDemoMode) {
      setEvents(DEMO_EVENTS_FALLBACK);
      setTableExists(true);
      setIsLoading(false);
      return;
    }

    const res = await fetchEvents();
    setTableExists(res.tableExists);
    setSchemaNotice(res.schemaNotice);
    setError(res.error);
    setEvents(res.data);
    setIsLoading(false);
  }, [isDemoMode]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
    tableExists,
    schemaNotice,
    isDemoFixture: isDemoMode,
    refetch: loadEvents,
  };
}
