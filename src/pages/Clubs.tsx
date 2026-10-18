// ============================================================================
// MSOT Clubs — Explore Clubs Page
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_CLUBS, DEMO_CAMPUSES } from '../lib/demoData';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Search, ArrowRight } from 'lucide-react';

export const Clubs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredClubs = DEMO_CLUBS.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCampus =
      selectedCampus === 'all' || club.campusId === selectedCampus;

    const matchesCategory =
      selectedCategory === 'all' || club.category === selectedCategory;

    return matchesSearch && matchesCampus && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Badge variant="cyan" size="sm">
            Campus Clubs
          </Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-navy-muted)' }}>
            {DEMO_CLUBS.length} Registered Clubs
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
          Explore Student Clubs
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-navy-secondary)', maxWidth: '720px' }}>
          Join an active student club to collaborate, organize Club Days, and build verified leadership credentials.
          <strong> Every approved club member is a Student Coordinator.</strong>
        </p>
      </div>

      {/* Filter & Search Bar */}
      <GlassCard variant="glass" elevation="standard" style={{ padding: '1rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-glass-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              flex: '1 1 260px',
            }}
          >
            <Search size={16} color="var(--text-navy-muted)" />
            <input
              type="text"
              placeholder="Search by club name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.875rem',
                color: 'var(--text-navy-primary)',
              }}
            />
          </div>

          {/* Campus Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-navy-secondary)' }}>
              Campus:
            </span>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass-light)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem',
                color: 'var(--text-navy-primary)',
                outline: 'none',
              }}
            >
              <option value="all">All Campuses</option>
              {DEMO_CAMPUSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name.replace('MSOT ', '')}
                </option>
              ))}
            </select>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass-light)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem',
                color: 'var(--text-navy-primary)',
                outline: 'none',
              }}
            >
              <option value="all">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Engineering">Engineering</option>
              <option value="Creative Arts">Creative Arts</option>
              <option value="Leadership">Leadership</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Clubs Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filteredClubs.map((club) => (
          <GlassCard key={club.id} variant="glass" elevation="standard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <Badge variant="cyan" size="sm">
                {club.category}
              </Badge>
              <Badge variant="blue" size="sm">
                {club.campusCode} Campus
              </Badge>
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.4rem' }}>
              {club.name}
            </h2>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan-700)', marginBottom: '0.6rem' }}>
              {club.code}
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', lineHeight: 1.45, marginBottom: '1rem', minHeight: '3.5rem' }}>
              {club.description}
            </p>

            {/* Leadership Box */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid var(--border-glass-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-navy-muted)' }}>Club President:</span>
                <strong style={{ color: 'var(--color-blue-700)' }}>
                  {club.activePresidentName || 'To be appointed'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-navy-muted)' }}>Faculty Advisor:</span>
                <span>{club.facultyAdvisorName || 'Assigned'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-navy-muted)' }}>Coordinator Team:</span>
                <strong>{club.coordinators.length} Student Coordinators</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-navy-muted)' }}>
                Capacity: {club.capacity} max
              </span>
              <Link
                to={`/clubs/${club.id}`}
                className="btn-primary-gradient"
                style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
              >
                <span>View Club & Roster</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
