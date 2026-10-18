-- ============================================================================
-- MSOT Clubs — Safe & Idempotent Production/Dev Seed Script
-- File: supabase/seed_safe.sql
--
-- Safety Guarantees:
--   1. NEVER uses TRUNCATE, DELETE, CASCADE, or destructive clearing operations.
--   2. All inserts are fully idempotent (rerunning will not create duplicates).
--   3. Seeds the 4 Campuses and 4 Clubs with valid foreign keys (no broken references).
--   4. Does NOT insert fictional profiles into public.profiles (which would fail
--      foreign key constraints against auth.users).
--   5. Automatically synchronizes real existing auth.users accounts into public.profiles
--      and assigns default 'student' user roles.
--   6. Provides a safe, optional trigger-compliant block to appoint a real user
--      as Club Coordinator / President if desired.
--   7. Preserves all existing real user data, profiles, and audit history.
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
-- Note: faculty_advisor_id is set to NULL to prevent foreign key errors against
-- non-existent fictional profiles. Real faculty advisors can be assigned once registered.
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
    campus_id = EXCLUDED.campus_id,
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    capacity = EXCLUDED.capacity,
    status = EXCLUDED.status;

-- ============================================================================
-- 3. Synchronize Existing Real Auth Users to public.profiles
-- Safe: Inserts profiles only for real accounts that exist in auth.users.
-- Preserves existing profile information if already created.
-- ============================================================================

INSERT INTO public.profiles (
    id,
    full_name,
    email,
    campus_id,
    created_at,
    updated_at
)
SELECT
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        split_part(u.email, '@', 1),
        'Student'
    ) AS full_name,
    COALESCE(u.email, 'student@msot.ac.in') AS email,
    '11111111-1111-4111-a111-111111111111'::UUID AS campus_id, -- Default: MSOT Main Campus (BLR)
    u.created_at,
    now()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    campus_id = COALESCE(public.profiles.campus_id, EXCLUDED.campus_id);

-- ============================================================================
-- 4. Assign Default 'student' Role to Real User Profiles
-- Idempotent: Skips if role already exists for that user and campus.
-- ============================================================================

INSERT INTO public.user_roles (user_id, role, campus_id)
SELECT
    p.id,
    'student',
    p.campus_id
FROM public.profiles p
WHERE p.campus_id IS NOT NULL
ON CONFLICT (user_id, role, campus_id) DO NOTHING;

-- ============================================================================
-- 5. Optional Real User Leadership Provisioning
-- 
-- If you want your existing authenticated user to be an active Coordinator
-- or President of 'Coding & Open Source Club' for testing, replace the email
-- below with your real Supabase Auth email.
--
-- This block executes through all security triggers in exact order:
--   1. Ensures an approved coordinator application exists.
--   2. Inserts an active club_memberships coordinator record.
--   3. Appoints the user as active president in club_presidencies.
--   4. Grants 'coordinator' and 'president' in user_roles.
-- ============================================================================

DO $$
DECLARE
    -- Set to your real email if you wish to auto-provision leadership, or leave NULL
    v_user_email TEXT := NULL; -- Example: 'your-email@student.msot.ac.in';
    v_user_id UUID;
    v_club_id UUID := 'e0000000-0000-4000-8000-000000000001'; -- Coding & Open Source Club
    v_campus_id UUID := '11111111-1111-4111-a111-111111111111';
    v_app_id UUID;
BEGIN
    -- If no email is provided, gracefully exit without making changes
    IF v_user_email IS NULL OR v_user_email = '' THEN
        RAISE NOTICE 'seed_safe: No real user email specified for leadership role. Standard campuses and clubs seeded safely.';
        RETURN;
    END IF;

    -- Lookup user ID from real auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'seed_safe: User with email % was not found in auth.users. Skipping leadership assignment.', v_user_email;
        RETURN;
    END IF;

    -- 1. Create approved application (Satisfies trg_check_membership_requires_approved_application)
    SELECT id INTO v_app_id
    FROM public.club_coordinator_applications
    WHERE club_id = v_club_id AND user_id = v_user_id;

    IF v_app_id IS NULL THEN
        INSERT INTO public.club_coordinator_applications (
            club_id,
            user_id,
            statement_of_purpose,
            status,
            reviewer_comment,
            reviewed_at
        )
        VALUES (
            v_club_id,
            v_user_id,
            'Initial club coordinator appointment.',
            'approved',
            'Approved by Campus Manager',
            now()
        )
        RETURNING id INTO v_app_id;
    ELSE
        UPDATE public.club_coordinator_applications
        SET status = 'approved',
            reviewed_at = now()
        WHERE id = v_app_id;
    END IF;

    -- 2. Create active membership in club_memberships
    INSERT INTO public.club_memberships (
        club_id,
        user_id,
        role,
        status,
        joined_at
    )
    VALUES (
        v_club_id,
        v_user_id,
        'coordinator',
        'active',
        now()
    )
    ON CONFLICT (club_id, user_id) DO UPDATE SET
        status = 'active';

    -- 3. Appoint as active president in club_presidencies (Satisfies trg_check_president_is_coordinator)
    INSERT INTO public.club_presidencies (
        club_id,
        user_id,
        status,
        appointed_at
    )
    VALUES (
        v_club_id,
        v_user_id,
        'active',
        now()
    )
    ON CONFLICT (club_id) WHERE status = 'active'
    DO UPDATE SET
        user_id = EXCLUDED.user_id,
        appointed_at = now();

    -- 4. Add roles in user_roles
    INSERT INTO public.user_roles (user_id, role, campus_id)
    VALUES
        (v_user_id, 'coordinator', v_campus_id),
        (v_user_id, 'president', v_campus_id)
    ON CONFLICT (user_id, role, campus_id) DO NOTHING;

    RAISE NOTICE 'seed_safe: Successfully appointed % as active President of Coding & Open Source Club.', v_user_email;
END;
$$;
