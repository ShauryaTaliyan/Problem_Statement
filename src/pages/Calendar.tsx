// ============================================================================
// MSOT Clubs — Calendar Page
// Club Days and Activity Schedule
// ============================================================================

import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle } from 'lucide-react';

export const Calendar: React.FC = () => {
  const scheduleItems = [
    {
      date: 'Saturday, Oct 24, 2026',
      type: 'Club Day',
      club: 'Coding & Open Source Club',
      topic: 'Full-Stack Performance Optimization & Edge Functions',
      time: '10:00 AM – 01:00 PM',
      venue: 'Lab 4, Bengaluru Campus',
      status: 'Approved by Advisor',
    },
    {
      date: 'Saturday, Oct 31, 2026',
      type: 'Club Day',
      club: 'Robotics & Autonomous Systems',
      topic: 'ROS2 Navigation Stack & Sensor Fusion',
      time: '02:00 PM – 05:00 PM',
      venue: 'Robotics Center, Bengaluru Campus',
      status: 'Approved by Advisor',
    },
    {
      date: 'Saturday, Nov 7, 2026',
      type: 'Inter-Campus Event',
      club: 'MSOT Clubs Directorate',
      topic: 'Autumn 2026 Multi-Campus Hackathon',
      time: '09:00 AM – 06:00 PM',
      venue: 'Main Auditorium & Online Hub',
      status: 'Registration Open',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Badge variant="cyan" size="sm">
            Schedule
          </Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-navy-muted)' }}>
            Academic Year 2026–2027
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
          Club Days & Calendar
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-navy-secondary)', maxWidth: '720px' }}>
          Official Club Day schedule across campuses. Activity plans are submitted 7 days prior and approved by Faculty Advisors.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {scheduleItems.map((item, idx) => (
          <GlassCard key={idx} variant="glass">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarIcon size={18} color="var(--color-blue-700)" />
                <strong style={{ fontSize: '1.05rem', color: 'var(--color-navy-900)' }}>
                  {item.date}
                </strong>
                <Badge variant={item.type === 'Club Day' ? 'blue' : 'teal'} size="sm">
                  {item.type}
                </Badge>
              </div>

              <Badge variant="cyan" size="sm">
                <CheckCircle size={12} />
                {item.status}
              </Badge>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.35rem' }}>
              {item.topic}
            </h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-cyan-700)', fontWeight: 600, marginBottom: '0.5rem' }}>
              {item.club}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-navy-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} />
                <span>{item.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} />
                <span>{item.venue}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
