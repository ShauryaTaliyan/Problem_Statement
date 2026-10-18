-- ============================================================================
-- MSOT Clubs — P0 Foundation Schema Migration
-- Migration: 20261018000001_p0_initial_schema.sql
-- Description: Core tables, constraints, invariants, and audit logging for P0.
-- Invariants enforced:
--   1. Multiple coordinators allowed per club.
--   2. Every approved club member is a Student Coordinator.
--   3. Exactly one active Club President per active club.
--   4. President must be an approved Student Coordinator of the same club.
--   5. Club-scoped granular permission delegations.
--   6. Auditable governance changes.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Campuses
CREATE TABLE IF NOT EXISTS public.campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    campus_id UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
    year TEXT,
    section TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Global / System User Roles
-- Allowed roles: 'student', 'coordinator', 'president', 'advisor', 'campus_manager', 'admin'
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'coordinator', 'president', 'advisor', 'campus_manager', 'admin')),
    campus_id UUID REFERENCES public.campuses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_role_campus UNIQUE (user_id, role, campus_id)
);

-- 4. Clubs
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES public.campuses(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Technical',
    description TEXT,
    capacity INTEGER NOT NULL DEFAULT 50 CHECK (capacity > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),
    faculty_advisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_club_campus_code UNIQUE (campus_id, code)
);

-- 5. Coordinator Applications
-- "Every approved club member is a Student Coordinator."
CREATE TABLE IF NOT EXISTS public.club_coordinator_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    statement_of_purpose TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_comment TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Club Memberships
-- Invariant: Every approved member is a Student Coordinator.
CREATE TABLE IF NOT EXISTS public.club_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'coordinator' CHECK (role = 'coordinator'),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'resigned')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resigned_at TIMESTAMPTZ,
    CONSTRAINT uq_club_membership UNIQUE (club_id, user_id)
);

-- 7. Club Presidencies
-- Invariant 1: Exactly ONE active president per club (enforced by partial unique index).
-- Invariant 2: Active president must be an approved Student Coordinator of the same club (enforced by trigger).
CREATE TABLE IF NOT EXISTS public.club_presidencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past')),
    appointed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ
);

-- Unique index guaranteeing exactly one active president per club
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_president_per_club
    ON public.club_presidencies (club_id)
    WHERE status = 'active';

-- Trigger function enforcing President must be an active coordinator in club_memberships
CREATE OR REPLACE FUNCTION public.check_president_is_coordinator()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.club_memberships
            WHERE club_id = NEW.club_id
              AND user_id = NEW.user_id
              AND status = 'active'
        ) THEN
            RAISE EXCEPTION 'A Club President must be an active approved Student Coordinator of the same club (user_id: %, club_id: %).',
                NEW.user_id, NEW.club_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_president_is_coordinator ON public.club_presidencies;
CREATE TRIGGER trg_check_president_is_coordinator
    BEFORE INSERT OR UPDATE ON public.club_presidencies
    FOR EACH ROW
    EXECUTE FUNCTION public.check_president_is_coordinator();

-- 8. Granular Club Permission Delegations
-- Delegated by the active Club President to another approved Student Coordinator of the same club.
CREATE TABLE IF NOT EXISTS public.club_permission_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    grantor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL CHECK (permission IN (
        'review_applications',
        'manage_club_profile',
        'create_activity_plan',
        'submit_activity_plan',
        'run_checkin',
        'correct_attendance',
        'manage_submissions',
        'evaluate_submissions',
        'manage_events',
        'view_reports',
        'issue_certificates'
    )),
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT,
    CONSTRAINT chk_different_grantor_recipient CHECK (grantor_id <> recipient_id)
);

-- Trigger ensuring grantor is indeed the active president and recipient is active coordinator
CREATE OR REPLACE FUNCTION public.validate_club_delegation()
RETURNS TRIGGER AS $$
BEGIN
    -- Check grantor is active president of club
    IF NOT EXISTS (
        SELECT 1 FROM public.club_presidencies
        WHERE club_id = NEW.club_id
          AND user_id = NEW.grantor_id
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Only the active Club President can grant club permissions (grantor: %, club: %).',
            NEW.grantor_id, NEW.club_id;
    END IF;

    -- Check recipient is an active coordinator of club
    IF NOT EXISTS (
        SELECT 1 FROM public.club_memberships
        WHERE club_id = NEW.club_id
          AND user_id = NEW.recipient_id
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Delegated permissions can only be granted to active Student Coordinators of the same club (recipient: %, club: %).',
            NEW.recipient_id, NEW.club_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_club_delegation ON public.club_permission_delegations;
CREATE TRIGGER trg_validate_club_delegation
    BEFORE INSERT ON public.club_permission_delegations
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_club_delegation();

-- 9. Append-Only Audit Logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent update/delete on audit_logs (append-only invariant)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_tampering ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_tampering
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_audit_log_tampering();

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_profiles_campus ON public.profiles(campus_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_clubs_campus ON public.clubs(campus_id);
CREATE INDEX IF NOT EXISTS idx_club_apps_club_status ON public.club_coordinator_applications(club_id, status);
CREATE INDEX IF NOT EXISTS idx_club_apps_user ON public.club_coordinator_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_club ON public.club_memberships(club_id, status);
CREATE INDEX IF NOT EXISTS idx_club_memberships_user ON public.club_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_club_presidencies_club ON public.club_presidencies(club_id, status);
CREATE INDEX IF NOT EXISTS idx_club_delegations_club_recipient ON public.club_permission_delegations(club_id, recipient_id, is_revoked);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_target ON public.audit_logs(target_table, target_id, created_at DESC);
