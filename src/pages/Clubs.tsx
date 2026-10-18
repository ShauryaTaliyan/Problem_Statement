// ============================================================================
// MSOT Clubs — Explore Clubs Page (P1 Real Data Integration)
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClubs } from '../hooks/useClubs';
import { useCampuses } from '../hooks/useCampuses';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBanner } from '../components/ui/StatusBanner';
import { Search, ArrowRight, RefreshCw, Layers } from 'lucide-react';

export const Clubs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    clubs,
    isLoading: isClubsLoading,
    error: clubsError,
    isDemoFixture: isClubsDemo,
    refetch: refetchClubs,
  } = useClubs(selectedCampus);

  const {
    campuses,
    isLoading: isCampusesLoading,
  } = useCampuses();

  // Extract unique categories from clubs or predefined standard set
  const availableCategories = useMemo(() => {
    const defaultCategories = ['Technical', 'Engineering', 'Creative Arts', 'Leadership'];
    const dynamic = clubs.map((c) => c.category).filter(Boolean);
    return Array.from(new Set([...defaultCategories, ...dynamic]));
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch =
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || club.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [clubs, searchTerm, selectedCategory]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCampus('all');
    setSelectedCategory('all');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Badge variant="cyan" size="sm">
            Campus Clubs
          </Badge>
          {!isClubsLoading && !clubsError && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-navy-muted)' }}>
              {clubs.length} Registered Club{clubs.length === 1 ? '' : 's'}
            </span>
          )}
          {isClubsDemo && (
            <Badge variant="blue" size="sm">
              Demo Fixtures
            </Badge>
          )}
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
              disabled={isCampusesLoading}
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
              {campuses.map((c) => (
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
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Loading State */}
      {isClubsLoading && (
        <GlassCard variant="glass">
          <LoadingSpinner label="Loading student clubs from database..." />
        </GlassCard>
      )}

      {/* Error State */}
      {!isClubsLoading && clubsError && (
        <StatusBanner
          type="warning"
          title="Database Query Error"
          message={`Unable to load clubs from the database: ${clubsError.message}`}
          actionText="Retry Query"
          onAction={refetchClubs}
        />
      )}

      {/* Empty State: Database has 0 clubs */}
      {!isClubsLoading && !clubsError && clubs.length === 0 && (
        <GlassCard variant="glass" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Layers size={44} color="var(--color-blue-400)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
            No Registered Clubs Found
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', maxWidth: '500px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
            No club records were found in the database. Ensure database migrations and seeds have been executed in your Supabase project.
          </p>
          <button
            onClick={refetchClubs}
            className="btn-secondary-glass"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
          >
            <RefreshCw size={14} />
            <span>Reload Clubs</span>
          </button>
        </GlassCard>
      )}

      {/* Empty State: Search/filter returned 0 matches */}
      {!isClubsLoading && !clubsError && clubs.length > 0 && filteredClubs.length === 0 && (
        <GlassCard variant="glass" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
            No clubs match your current filter
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-navy-secondary)', marginBottom: '1rem' }}>
            No clubs found matching &ldquo;{searchTerm}&rdquo; in the selected campus or category.
          </p>
          <button
            onClick={resetFilters}
            className="btn-secondary-glass"
            style={{ cursor: 'pointer', fontSize: '0.8125rem' }}
          >
            Reset Filters
          </button>
        </GlassCard>
      )}

      {/* Clubs Grid */}
      {!isClubsLoading && !clubsError && filteredClubs.length > 0 && (
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
                  <strong>{club.coordinators.length} Student Coordinator{club.coordinators.length === 1 ? '' : 's'}</strong>
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
      )}
    </div>
  );
};
