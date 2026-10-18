-- ============================================================================
-- MSOT Clubs — P0 Row Level Security (RLS) Policies
-- Migration: 20261018000002_p0_rls_policies.sql
-- Description: Enable RLS on all P0 tables and define strict access control policies.
-- Invariants enforced:
--   1. Users cannot assign themselves privileged roles.
--   2. Students cannot read or modify other students' private records without authorization.
--   3. Coordinators cannot access unrelated clubs merely by changing IDs.
--   4. Presidents can manage only their own club's delegated powers.
--   5. Campus and system-wide permissions are enforced strictly.
--   6. Audit logs are immutable (no updates or deletes).
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_coordinator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_presidencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_permission_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Security Helper Functions
-- ----------------------------------------------------------------------------

-- Check if authenticated user is System Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if authenticated user is Campus Manager for the given campus
CREATE OR REPLACE FUNCTION public.is_campus_manager(target_campus_id UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if authenticated user is active President of the given club
CREATE OR REPLACE FUNCTION public.is_club_president(target_club_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.club_presidencies
        WHERE club_id = target_club_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if authenticated user is active Coordinator of the given club
CREATE OR REPLACE FUNCTION public.is_club_coordinator(target_club_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.club_memberships
        WHERE club_id = target_club_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if authenticated user has a specific delegated permission for a club
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
    RETURN EXISTS (
        SELECT 1 FROM public.club_permission_delegations
        WHERE club_id = target_club_id
          AND recipient_id = auth.uid()
          AND permission = required_permission
          AND is_revoked = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ----------------------------------------------------------------------------
-- 1. Campuses Policies
-- ----------------------------------------------------------------------------
-- Any authenticated user can view active campuses
CREATE POLICY "campuses_select_policy"
    ON public.campuses FOR SELECT
    TO authenticated
    USING (is_active = true OR public.is_admin());

-- Only Admins can insert/update campuses
CREATE POLICY "campuses_admin_modify_policy"
    ON public.campuses FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ----------------------------------------------------------------------------
-- 2. Profiles Policies
-- ----------------------------------------------------------------------------
-- Users can view their own profile, or profiles in their campus
CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
        OR campus_id IN (SELECT campus_id FROM public.profiles WHERE id = auth.uid())
        OR public.is_admin()
    );

-- Users can update only their own profile details
CREATE POLICY "profiles_update_own_policy"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());


-- ----------------------------------------------------------------------------
-- 3. User Roles Policies
-- ----------------------------------------------------------------------------
-- Users can view their own roles; Campus Managers and Admins can view roles
CREATE POLICY "user_roles_select_policy"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_campus_manager(campus_id)
        OR public.is_admin()
    );

-- Only Admins can modify global roles (users CANNOT self-assign roles)
CREATE POLICY "user_roles_admin_modify_policy"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ----------------------------------------------------------------------------
-- 4. Clubs Policies
-- ----------------------------------------------------------------------------
-- Authenticated users can view all active clubs
CREATE POLICY "clubs_select_policy"
    ON public.clubs FOR SELECT
    TO authenticated
    USING (status = 'active' OR public.is_admin() OR public.is_campus_manager(campus_id));

-- Campus Manager / Admin can create clubs
CREATE POLICY "clubs_insert_policy"
    ON public.clubs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_campus_manager(campus_id) OR public.is_admin());

-- Club profile can be edited by President or delegated coordinator or Campus Manager
CREATE POLICY "clubs_update_policy"
    ON public.clubs FOR UPDATE
    TO authenticated
    USING (
        public.is_club_president(id)
        OR public.has_club_permission(id, 'manage_club_profile')
        OR public.is_campus_manager(campus_id)
        OR public.is_admin()
    );


-- ----------------------------------------------------------------------------
-- 5. Coordinator Applications Policies
-- ----------------------------------------------------------------------------
-- Applicants can view their own applications; authorized club leadership can view applications for their club
CREATE POLICY "applications_select_policy"
    ON public.club_coordinator_applications FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_club_president(club_id)
        OR public.has_club_permission(club_id, 'review_applications')
        OR public.is_admin()
    );

-- Any student can submit an application for themselves
CREATE POLICY "applications_insert_policy"
    ON public.club_coordinator_applications FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND status = 'pending'
    );

-- Reviewers can update application status (approve / reject)
CREATE POLICY "applications_update_policy"
    ON public.club_coordinator_applications FOR UPDATE
    TO authenticated
    USING (
        public.is_club_president(club_id)
        OR public.has_club_permission(club_id, 'review_applications')
        OR public.is_admin()
    );


-- ----------------------------------------------------------------------------
-- 6. Club Memberships Policies
-- ----------------------------------------------------------------------------
-- Anyone authenticated can view active club coordinators
CREATE POLICY "memberships_select_policy"
    ON public.club_memberships FOR SELECT
    TO authenticated
    USING (true);

-- Membership updates (adding approved coordinators) restricted to President / Admin
CREATE POLICY "memberships_modify_policy"
    ON public.club_memberships FOR ALL
    TO authenticated
    USING (
        public.is_club_president(club_id)
        OR public.is_admin()
    )
    WITH CHECK (
        public.is_club_president(club_id)
        OR public.is_admin()
    );


-- ----------------------------------------------------------------------------
-- 7. Club Presidencies Policies
-- ----------------------------------------------------------------------------
-- Anyone authenticated can view club presidents
CREATE POLICY "presidencies_select_policy"
    ON public.club_presidencies FOR SELECT
    TO authenticated
    USING (true);

-- President appointments restricted to Campus Manager / Admin
CREATE POLICY "presidencies_modify_policy"
    ON public.club_presidencies FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clubs c
            WHERE c.id = club_id AND public.is_campus_manager(c.campus_id)
        )
        OR public.is_admin()
    );


-- ----------------------------------------------------------------------------
-- 8. Club Permission Delegations Policies
-- ----------------------------------------------------------------------------
-- Coordinators can view delegations for their club; recipients can see their own
CREATE POLICY "delegations_select_policy"
    ON public.club_permission_delegations FOR SELECT
    TO authenticated
    USING (
        recipient_id = auth.uid()
        OR public.is_club_president(club_id)
        OR public.is_club_coordinator(club_id)
        OR public.is_admin()
    );

-- ONLY the active Club President can grant delegations for their club
CREATE POLICY "delegations_insert_policy"
    ON public.club_permission_delegations FOR INSERT
    TO authenticated
    WITH CHECK (
        grantor_id = auth.uid()
        AND public.is_club_president(club_id)
    );

-- ONLY the active Club President can revoke delegations for their club
CREATE POLICY "delegations_update_policy"
    ON public.club_permission_delegations FOR UPDATE
    TO authenticated
    USING (
        public.is_club_president(club_id)
    )
    WITH CHECK (
        public.is_club_president(club_id)
    );


-- ----------------------------------------------------------------------------
-- 9. Audit Logs Policies
-- ----------------------------------------------------------------------------
-- Campus Managers and Admins can view audit logs
CREATE POLICY "audit_logs_select_policy"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- System components and authorized actors can append audit records
CREATE POLICY "audit_logs_insert_policy"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- UPDATE and DELETE policies are omitted intentionally: table is append-only.
