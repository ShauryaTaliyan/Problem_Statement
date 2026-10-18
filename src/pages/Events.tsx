// ============================================================================
// MSOT Clubs — Campus Events Page
// Default: Open to all students of the organizing campus
// ============================================================================

import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Badge } from '../components/ui/Badge';
import { Calendar, MapPin, Shield, CheckCircle2 } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  organizerClubName: string;
  campusCode: string;
  scope: 'campus' | 'inter-campus';
  date: string;
  time: string;
  venue: string;
  eligibilityDescription: string;
  isCampusWideDefault: boolean;
  registeredCount: number;
  capacity: number;
  isRegistered: boolean;
}

const DEMO_EVENTS: EventItem[] = [
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

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(DEMO_EVENTS);

  const toggleRegister = (id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              isRegistered: !e.isRegistered,
              registeredCount: e.isRegistered ? e.registeredCount - 1 : e.registeredCount + 1,
            }
          : e
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Badge variant="cyan" size="sm">
            Campus Activities
          </Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-navy-muted)' }}>
            Integrated Events
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
          Campus & Inter-Campus Events
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-navy-secondary)', maxWidth: '720px' }}>
          Club-organized events are <strong>open to all students of the organizing campus by default</strong>.
          Specific events may offer multi-campus participation or targeted cohort eligibility.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {events.map((ev) => (
          <GlassCard key={ev.id} variant="glass" elevation="standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <Badge variant={ev.scope === 'inter-campus' ? 'teal' : 'blue'} size="sm">
                {ev.scope === 'inter-campus' ? 'Inter-Campus Event' : `${ev.campusCode} Campus Event`}
              </Badge>
              {ev.isCampusWideDefault ? (
                <Badge variant="cyan" size="sm">
                  Campus-Wide Default
                </Badge>
              ) : (
                <Badge variant="navy" size="sm">
                  Restricted Cohort
                </Badge>
              )}
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.35rem' }}>
              {ev.title}
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-cyan-700)', fontWeight: 600, marginBottom: '0.75rem' }}>
              Organized by {ev.organizerClubName}
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid var(--border-glass-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-navy-secondary)' }}>
                <Calendar size={14} color="var(--color-blue-700)" />
                <span>{ev.date} &bull; {ev.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-navy-secondary)' }}>
                <MapPin size={14} color="var(--color-blue-700)" />
                <span>{ev.venue}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-teal-700)' }}>
                <Shield size={14} />
                <span>{ev.eligibilityDescription}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-navy-muted)' }}>
                <strong>{ev.registeredCount}</strong> / {ev.capacity} registered
              </span>

              <GlassButton
                variant={ev.isRegistered ? 'teal' : 'primary'}
                size="sm"
                onClick={() => toggleRegister(ev.id)}
                icon={ev.isRegistered ? <CheckCircle2 size={14} /> : undefined}
              >
                {ev.isRegistered ? 'Registered' : 'Register Now'}
              </GlassButton>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
