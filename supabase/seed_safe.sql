-- ============================================================================
-- MSOT Clubs — Minimal Safe Idempotent Seed Script
-- File: supabase/seed_safe.sql
--
-- Scope:
--   - Seeds or updates only the 4 participating campuses and 4 student clubs.
--   - Zero destructive operations (NO TRUNCATE, NO DELETE, NO CASCADE).
--   - Does NOT touch profiles, user_roles, auth.users, applications,
--     memberships, presidencies, delegations, or audit logs.
--   - For clubs, strictly preserves existing campus_id, code, faculty_advisor_id,
--     and status on conflict.
--   - Updates only name, category, description, capacity, and updated_at on conflict,
--     fully respecting all invariants enforced by trg_protect_club_fields.
--   - Uses standard deterministic UUIDs consistent with application domain logic.
--   - Safe to rerun multiple times without duplicating rows or causing trigger errors.
-- ============================================================================

-- ============================================================================
-- 1. Participating Campuses (4 Campuses)
-- ============================================================================

INSERT INTO public.campuses (id, code, name, timezone, address, is_active)
VALUES
    (
        '11111111-1111-4111-a111-111111111111',
        'BLR',
        'MSOT Main Campus (Bengaluru)',
        'Asia/Kolkata',
        'Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100',
        true
    ),
    (
        '22222222-2222-4222-a222-222222222222',
        'DEL',
        'MSOT North Campus (Delhi NCR)',
        'Asia/Kolkata',
        'Knowledge Park III, Greater Noida, Uttar Pradesh 201306',
        true
    ),
    (
        '33333333-3333-4333-a333-333333333333',
        'HYD',
        'MSOT Tech Campus (Hyderabad)',
        'Asia/Kolkata',
        'Hitech City, Madhapur, Hyderabad, Telangana 500081',
        true
    ),
    (
        '44444444-4444-4444-a444-444444444444',
        'PUN',
        'MSOT West Campus (Pune)',
        'Asia/Kolkata',
        'Hinjawadi Phase 2, Pune, Maharashtra 411057',
        true
    )
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    timezone = EXCLUDED.timezone,
    address = EXCLUDED.address,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- 2. Registered Student Clubs (4 Clubs)
--
-- Safety and Invariant Rules:
--   - On initial insert: faculty_advisor_id is set to NULL to avoid foreign key
--     errors against non-existent fictional profiles.
--   - On conflict: strictly preserves existing campus_id, code, faculty_advisor_id,
--     and status.
--   - On conflict: updates ONLY name, category, description, capacity, and updated_at.
--     This guarantees that trg_protect_club_fields will never encounter unauthorized
--     changes to protected fields on rerun.
-- ============================================================================

INSERT INTO public.clubs (
    id,
    campus_id,
    name,
    code,
    category,
    description,
    capacity,
    status,
    faculty_advisor_id
)
VALUES
    (
        'e0000000-0000-4000-8000-000000000001',
        '11111111-1111-4111-a111-111111111111',
        'Coding & Open Source Club',
        'CLUB-CS-01',
        'Technical',
        'Fosters software craftsmanship, open-source contributions, hackathons, and web/systems engineering across all years.',
        60,
        'active',
        NULL
    ),
    (
        'e0000000-0000-4000-8000-000000000002',
        '11111111-1111-4111-a111-111111111111',
        'Robotics & Autonomous Systems',
        'CLUB-ROB-01',
        'Engineering',
        'Dedicated to embedded systems, aerial drones, ROS autonomous navigation, and inter-college competitions.',
        45,
        'active',
        NULL
    ),
    (
        'e0000000-0000-4000-8000-000000000003',
        '22222222-2222-4222-a222-222222222222',
        'Design & Creative Media Club',
        'CLUB-DES-01',
        'Creative Arts',
        'User experience design, 3D visualization, campus branding, video storytelling, and design sprints.',
        40,
        'active',
        NULL
    ),
    (
        'e0000000-0000-4000-8000-000000000004',
        '33333333-3333-4333-a333-333333333333',
        'Entrepreneurship & Innovation Cell',
        'CLUB-ECELL-01',
        'Leadership',
        'Startup incubation, venture capital talks, pitch days, and product prototyping for student founders.',
        50,
        'active',
        NULL
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    capacity = EXCLUDED.capacity,
    updated_at = now();
