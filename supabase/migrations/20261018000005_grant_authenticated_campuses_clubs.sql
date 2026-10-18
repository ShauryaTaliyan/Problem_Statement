-- ============================================================================
-- MSOT Clubs — P1 Migration: Grant Authenticated Read Access to Campuses & Clubs
-- Migration: 20261018000005_grant_authenticated_campuses_clubs.sql
-- Description:
--   Grants schema usage and table-level SELECT permissions on public.campuses
--   and public.clubs to the authenticated database role.
--   Row Level Security (RLS) policies continue to filter records strictly
--   (is_active = true on campuses, status = 'active' on clubs).
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON public.campuses TO authenticated;

GRANT SELECT ON public.clubs TO authenticated;
