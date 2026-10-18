-- ============================================================================
-- MSOT Clubs — P0 Security & Invariant Hardening Migration
-- Migration: 20261018000003_p0_security_fixes.sql
-- Description:
--   1. Prevent former coordinators from retaining delegated permissions.
--   2. Automatically end a president's active status and revoke delegations on coordinator departure.
--   3. Prevent students from tampering with protected profile fields (campus_id, student_id, year, section).
--   4. Validate delegations on both INSERT and UPDATE (make core attributes immutable).
--   5. Prevent duplicate pending applications and duplicate active delegations.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Require active coordinator membership for delegated club permissions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_club_permission(target_club_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- 1. System Admin has all permissions
    IF public.is_admin() THEN
        RETURN true;
    END IF;

    -- 2. Active Club President inherently holds all club-level powers
    IF public.is_club_president(target_club_id) THEN
        RETURN true;
    END IF;

    -- 3. Check for active (non-revoked) delegation granted to this user
    -- CRITICAL FIX: Explicitly require recipient to currently hold active coordinator status in club_memberships
    RETURN EXISTS (
        SELECT 1 FROM public.club_permission_delegations d
        JOIN public.club_memberships m
          ON m.club_id = d.club_id
         AND m.user_id = d.recipient_id
         AND m.status = 'active'
        WHERE d.club_id = target_club_id
          AND d.recipient_id = auth.uid()
          AND d.permission = required_permission
          AND d.is_revoked = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ----------------------------------------------------------------------------
-- 2. Automatically retire presidency and revoke delegations on coordinator removal
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_coordinator_removal()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger on membership deletion or status transition away from 'active'
    IF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status <> 'active' AND OLD.status = 'active')) THEN
        -- 1. If user was active president of this club, end active presidency
        UPDATE public.club_presidencies
        SET status = 'past', ended_at = now()
        WHERE club_id = OLD.club_id
          AND user_id = OLD.user_id
          AND status = 'active';

        -- 2. Revoke all active delegations granted to or by this coordinator
        UPDATE public.club_permission_delegations
        SET is_revoked = true,
            revoked_at = now(),
            revoke_reason = 'Coordinator membership terminated'
        WHERE club_id = OLD.club_id
          AND (recipient_id = OLD.user_id OR grantor_id = OLD.user_id)
          AND is_revoked = false;

        -- 3. Append immutable audit record
        INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, reason)
        VALUES (
            OLD.user_id,
            'COORDINATOR_REMOVAL_CLEANUP',
            'club_memberships',
            OLD.id,
            'Automatically retired active presidency and revoked delegations due to coordinator status change or deletion'
        );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_coordinator_removal ON public.club_memberships;
CREATE TRIGGER trg_handle_coordinator_removal
    AFTER UPDATE OR DELETE ON public.club_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_coordinator_removal();


-- ----------------------------------------------------------------------------
-- 3. Prevent students from changing protected profile fields (campus_id, student_id, cohort)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- If actor is NOT a system admin, forbid tampering with protected fields
    IF NOT public.is_admin() THEN
        IF NEW.campus_id IS DISTINCT FROM OLD.campus_id THEN
            RAISE EXCEPTION 'Unauthorized: Students cannot change their campus assignment directly.';
        END IF;

        IF NEW.student_id IS DISTINCT FROM OLD.student_id THEN
            RAISE EXCEPTION 'Unauthorized: Students cannot change their student ID directly.';
        END IF;

        IF NEW.year IS DISTINCT FROM OLD.year OR NEW.section IS DISTINCT FROM OLD.section THEN
            RAISE EXCEPTION 'Unauthorized: Academic cohort (year/section) must be updated by an administrator.';
        END IF;
    END IF;

    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_fields();


-- ----------------------------------------------------------------------------
-- 4. Validate delegations on BOTH INSERT and UPDATE (make core attributes immutable)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_club_delegation()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Check grantor is active president of club
    IF NOT EXISTS (
        SELECT 1 FROM public.club_presidencies
        WHERE club_id = NEW.club_id
          AND user_id = NEW.grantor_id
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Only the active Club President can grant or modify club permissions (grantor: %, club: %).',
            NEW.grantor_id, NEW.club_id;
    END IF;

    -- 2. Check recipient is an active coordinator of club
    IF NOT EXISTS (
        SELECT 1 FROM public.club_memberships
        WHERE club_id = NEW.club_id
          AND user_id = NEW.recipient_id
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Delegated permissions can only be granted to active Student Coordinators of the same club (recipient: %, club: %).',
            NEW.recipient_id, NEW.club_id;
    END IF;

    -- 3. On UPDATE: Ensure core delegation attributes are strictly immutable
    IF TG_OP = 'UPDATE' THEN
        IF NEW.club_id <> OLD.club_id OR
           NEW.grantor_id <> OLD.grantor_id OR
           NEW.recipient_id <> OLD.recipient_id OR
           NEW.permission <> OLD.permission THEN
            RAISE EXCEPTION 'Core delegation attributes (club, grantor, recipient, permission) are immutable once created. Revoke and issue a new delegation instead.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_club_delegation ON public.club_permission_delegations;
CREATE TRIGGER trg_validate_club_delegation
    BEFORE INSERT OR UPDATE ON public.club_permission_delegations
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_club_delegation();


-- ----------------------------------------------------------------------------
-- 5. Prevent duplicate pending applications and duplicate active delegations
-- ----------------------------------------------------------------------------

-- Prevent duplicate pending applications for the same student in the same club
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_pending_app_per_user_club
    ON public.club_coordinator_applications (club_id, user_id)
    WHERE status = 'pending';

-- Prevent duplicate active (non-revoked) delegations for the same club, recipient, and permission
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_delegation_per_permission
    ON public.club_permission_delegations (club_id, recipient_id, permission)
    WHERE is_revoked = false;
