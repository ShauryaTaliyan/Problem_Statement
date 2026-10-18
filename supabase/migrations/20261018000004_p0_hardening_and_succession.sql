-- ============================================================================
-- MSOT Clubs — P0 Security Hardening, Application Controls & Succession
-- Migration: 20261018000004_p0_hardening_and_succession.sql
-- Description:
--   1. Fix search_path = public, pg_temp on all SECURITY DEFINER functions.
--   2. Enforce coordinator applications integrity (prevent self-approval/tampering).
--   3. Require approved application at DB level before club membership creation.
--   4. Prevent coordinators from changing protected club fields (campus_id, status, faculty_advisor_id, code).
--   5. Provide atomic, safe presidential succession procedure.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Safe fixed search_path on all SECURITY DEFINER security functions
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_campus_manager(target_campus_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND (
              (role = 'campus_manager' AND campus_id = target_campus_id)
              OR role = 'admin'
          )
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_club_president(target_club_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.club_presidencies
        WHERE club_id = target_club_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_club_coordinator(target_club_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.club_memberships
        WHERE club_id = target_club_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_club_permission(target_club_id UUID, required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- 1. System Admin has all permissions
    IF public.is_admin() THEN
        RETURN true;
    END IF;

    -- 2. Active Club President inherently holds all club-level powers
    IF public.is_club_president(target_club_id) THEN
        RETURN true;
    END IF;

    -- 3. Check for active delegation AND verify recipient is active coordinator in club_memberships
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
$$;

CREATE OR REPLACE FUNCTION public.handle_coordinator_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status <> 'active' AND OLD.status = 'active')) THEN
        -- 1. Retire active presidency if user was president
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

        -- 3. Append audit record
        INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, reason)
        VALUES (
            OLD.user_id,
            'COORDINATOR_REMOVAL_CLEANUP',
            'club_memberships',
            OLD.id,
            'Automatically retired active presidency and revoked delegations due to coordinator status change'
        );
    END IF;

    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
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
$$;


-- ----------------------------------------------------------------------------
-- 2. Prevent applicants from approving/tampering with coordinator applications
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_coordinator_applications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_reviewer BOOLEAN;
BEGIN
    -- ON INSERT: sanitize applicant input
    IF TG_OP = 'INSERT' THEN
        NEW.status := 'pending';
        NEW.reviewer_id := NULL;
        NEW.reviewer_comment := NULL;
        NEW.reviewed_at := NULL;
        NEW.created_at := now();
        NEW.updated_at := now();
        RETURN NEW;
    END IF;

    -- ON UPDATE:
    IF TG_OP = 'UPDATE' THEN
        -- Prevent changing applicant or club
        IF NEW.club_id <> OLD.club_id THEN
            RAISE EXCEPTION 'Unauthorized: Cannot transfer application to another club.';
        END IF;

        IF NEW.user_id <> OLD.user_id THEN
            RAISE EXCEPTION 'Unauthorized: Cannot change application ownership.';
        END IF;

        -- Check if current user is authorized reviewer or admin
        v_is_reviewer := public.is_admin()
                      OR public.is_club_president(OLD.club_id)
                      OR public.has_club_permission(OLD.club_id, 'review_applications');

        -- If applicant is updating their own application
        IF auth.uid() = OLD.user_id AND NOT v_is_reviewer THEN
            -- Applicant CANNOT change review metadata
            IF NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id OR
               NEW.reviewer_comment IS DISTINCT FROM OLD.reviewer_comment OR
               NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
                RAISE EXCEPTION 'Unauthorized: Applicants cannot modify review fields.';
            END IF;

            -- Applicant can only change status from 'pending' to 'withdrawn'
            IF NEW.status IS DISTINCT FROM OLD.status THEN
                IF OLD.status <> 'pending' OR NEW.status <> 'withdrawn' THEN
                    RAISE EXCEPTION 'Unauthorized: Applicants may only withdraw pending applications.';
                END IF;
            END IF;
        ELSE
            -- Reviewer is updating:
            IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
                -- Reviewer CANNOT review/approve their own application
                IF OLD.user_id = auth.uid() AND NOT public.is_admin() THEN
                    RAISE EXCEPTION 'Conflict of interest: You cannot review or approve your own application.';
                END IF;

                NEW.reviewer_id := auth.uid();
                NEW.reviewed_at := now();
            END IF;
        END IF;

        NEW.updated_at := now();
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_coordinator_applications ON public.club_coordinator_applications;
CREATE TRIGGER trg_protect_coordinator_applications
    BEFORE INSERT OR UPDATE ON public.club_coordinator_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_coordinator_applications();

-- Update RLS policy on club_coordinator_applications
DROP POLICY IF EXISTS "applications_update_policy" ON public.club_coordinator_applications;
CREATE POLICY "applications_update_policy"
    ON public.club_coordinator_applications FOR UPDATE
    TO authenticated
    USING (
        public.is_club_president(club_id)
        OR public.has_club_permission(club_id, 'review_applications')
        OR public.is_admin()
        OR (user_id = auth.uid() AND status = 'pending')
    )
    WITH CHECK (
        public.is_club_president(club_id)
        OR public.has_club_permission(club_id, 'review_applications')
        OR public.is_admin()
        OR (user_id = auth.uid() AND status = 'withdrawn')
    );


-- ----------------------------------------------------------------------------
-- 3. Enforce membership creation requires an approved application
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_membership_requires_approved_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Check that an approved coordinator application exists for this user and club
    IF NOT EXISTS (
        SELECT 1 FROM public.club_coordinator_applications
        WHERE club_id = NEW.club_id
          AND user_id = NEW.user_id
          AND status = 'approved'
    ) AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Database Invariant Violated: A club coordinator membership can only be created after an approved application exists for this club (user_id: %, club_id: %).',
            NEW.user_id, NEW.club_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_membership_requires_approved_application ON public.club_memberships;
CREATE TRIGGER trg_check_membership_requires_approved_application
    BEFORE INSERT ON public.club_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.check_membership_requires_approved_application();


-- ----------------------------------------------------------------------------
-- 4. Prevent coordinators from changing protected club fields
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_club_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Only Campus Manager or Admin can alter campus_id, status, faculty_advisor_id, or code
    IF NOT (public.is_admin() OR public.is_campus_manager(OLD.campus_id)) THEN
        IF NEW.campus_id IS DISTINCT FROM OLD.campus_id THEN
            RAISE EXCEPTION 'Unauthorized: Coordinators cannot change the campus assignment of a club.';
        END IF;

        IF NEW.status IS DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION 'Unauthorized: Coordinators cannot change the status of a club (active/inactive/pending).';
        END IF;

        IF NEW.faculty_advisor_id IS DISTINCT FROM OLD.faculty_advisor_id THEN
            RAISE EXCEPTION 'Unauthorized: Coordinators cannot reassign the faculty advisor.';
        END IF;

        IF NEW.code IS DISTINCT FROM OLD.code THEN
            RAISE EXCEPTION 'Unauthorized: Club code is immutable.';
        END IF;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_club_fields ON public.clubs;
CREATE TRIGGER trg_protect_club_fields
    BEFORE UPDATE ON public.clubs
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_club_fields();


-- ----------------------------------------------------------------------------
-- 5. Safe, atomic presidential succession procedure
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.transition_club_president(
    p_club_id UUID,
    p_new_president_user_id UUID,
    p_appointed_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_new_presidency_id UUID;
    v_campus_id UUID;
BEGIN
    -- 1. Authorization check: caller must be Admin or Campus Manager of the club's campus
    SELECT campus_id INTO v_campus_id FROM public.clubs WHERE id = p_club_id;
    IF v_campus_id IS NULL THEN
        RAISE EXCEPTION 'Club with ID % not found.', p_club_id;
    END IF;

    IF NOT (public.is_admin() OR public.is_campus_manager(v_campus_id)) THEN
        RAISE EXCEPTION 'Unauthorized: Only Campus Managers or Admins can appoint or transition a Club President.';
    END IF;

    -- 2. Verify candidate is an approved active coordinator of that club
    IF NOT EXISTS (
        SELECT 1 FROM public.club_memberships
        WHERE club_id = p_club_id
          AND user_id = p_new_president_user_id
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'A Club President must be an active approved Student Coordinator of the same club (user_id: %, club_id: %).',
            p_new_president_user_id, p_club_id;
    END IF;

    -- 3. Atomically retire existing active president to 'past'
    UPDATE public.club_presidencies
    SET status = 'past',
        ended_at = now()
    WHERE club_id = p_club_id
      AND status = 'active';

    -- 4. Insert the new active president
    INSERT INTO public.club_presidencies (
        club_id,
        user_id,
        status,
        appointed_by,
        appointed_at
    ) VALUES (
        p_club_id,
        p_new_president_user_id,
        'active',
        p_appointed_by,
        now()
    )
    RETURNING id INTO v_new_presidency_id;

    -- 5. Audit log entry
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        target_table,
        target_id,
        new_state,
        reason
    ) VALUES (
        p_appointed_by,
        'PRESIDENT_SUCCESSION',
        'club_presidencies',
        v_new_presidency_id,
        jsonb_build_object('club_id', p_club_id, 'new_president', p_new_president_user_id),
        'President succession transaction completed'
    );

    RETURN v_new_presidency_id;
END;
$$;
