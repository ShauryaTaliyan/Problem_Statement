-- ============================================================================
-- MSOT Clubs — P0 Seed Data
-- File: supabase/seed.sql
-- Description: Fictional demonstration data for development & verification.
-- Rules demonstrated:
--   1. 4 Campuses
--   2. >= 3 Clubs
--   3. Multiple Student Coordinators in at least one club
--   4. Exactly one active President per active club
--   5. President is an approved Student Coordinator of the same club
--   6. Delegated club-scoped permissions (grantor is President, recipient is Coordinator)
--   7. Faculty Advisors and Campus Managers properly associated
-- ============================================================================

-- Clean up any existing demo records in reverse dependency order
TRUNCATE TABLE public.audit_logs CASCADE;
TRUNCATE TABLE public.club_permission_delegations CASCADE;
TRUNCATE TABLE public.club_presidencies CASCADE;
TRUNCATE TABLE public.club_memberships CASCADE;
TRUNCATE TABLE public.club_coordinator_applications CASCADE;
TRUNCATE TABLE public.clubs CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.campuses CASCADE;

-- 1. Campuses (4 Campuses)
INSERT INTO public.campuses (id, code, name, timezone, address, is_active) VALUES
('11111111-1111-4111-a111-111111111111', 'BLR', 'MSOT Main Campus (Bengaluru)', 'Asia/Kolkata', 'Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100', true),
('22222222-2222-4222-a222-222222222222', 'DEL', 'MSOT North Campus (Delhi NCR)', 'Asia/Kolkata', 'Knowledge Park III, Greater Noida, Uttar Pradesh 201306', true),
('33333333-3333-4333-a333-333333333333', 'HYD', 'MSOT Tech Campus (Hyderabad)', 'Asia/Kolkata', 'Hitech City, Madhapur, Hyderabad, Telangana 500081', true),
('44444444-4444-4444-a444-444444444444', 'PUN', 'MSOT West Campus (Pune)', 'Asia/Kolkata', 'Hinjawadi Phase 2, Pune, Maharashtra 411057', true);

-- 2. Mock Auth Users & Profiles
-- Note: In a live Supabase environment, user IDs correspond to auth.users.
-- For local seed scripts and demo fixtures, we insert into public.profiles directly.
INSERT INTO public.profiles (id, student_id, full_name, email, campus_id, year, section, phone) VALUES
-- System Admin
('a0000000-0000-4000-8000-000000000001', 'EMP-001', 'Prof. K. V. Ramanathan', 'admin.ramanathan@msot.ac.in', '11111111-1111-4111-a111-111111111111', 'Staff', 'Administration', '+91 98450 11001'),
-- Campus Managers
('b0000000-0000-4000-8000-000000000001', 'EMP-101', 'Vikram Malhotra', 'cm.malhotra@msot.ac.in', '11111111-1111-4111-a111-111111111111', 'Staff', 'Campus Operations', '+91 98450 11101'),
('b0000000-0000-4000-8000-000000000002', 'EMP-102', 'Sunita Rao', 'cm.rao@msot.ac.in', '22222222-2222-4222-a222-222222222222', 'Staff', 'Campus Operations', '+91 98110 22102'),
-- Faculty Advisors
('c0000000-0000-4000-8000-000000000001', 'EMP-201', 'Dr. Rajesh Kumar', 'fa.kumar@msot.ac.in', '11111111-1111-4111-a111-111111111111', 'Faculty', 'CSE Department', '+91 98450 11201'),
('c0000000-0000-4000-8000-000000000002', 'EMP-202', 'Prof. Ananya Iyer', 'fa.iyer@msot.ac.in', '11111111-1111-4111-a111-111111111111', 'Faculty', 'ECE Department', '+91 98450 11202'),
('c0000000-0000-4000-8000-000000000003', 'EMP-203', 'Prof. Meera Nair', 'fa.nair@msot.ac.in', '22222222-2222-4222-a222-222222222222', 'Faculty', 'Design Department', '+91 98110 22203'),
-- Students & Coordinators
('d0000000-0000-4000-8000-000000000001', 'MSOT-24-CS-042', 'Aarav Sharma', 'aarav.sharma@student.msot.ac.in', '11111111-1111-4111-a111-111111111111', '3rd Year', 'CS-A', '+91 99001 00001'),
('d0000000-0000-4000-8000-000000000002', 'MSOT-24-CS-088', 'Diya Patel', 'diya.patel@student.msot.ac.in', '11111111-1111-4111-a111-111111111111', '3rd Year', 'CS-B', '+91 99001 00002'),
('d0000000-0000-4000-8000-000000000003', 'MSOT-24-EC-015', 'Rohan Verma', 'rohan.verma@student.msot.ac.in', '11111111-1111-4111-a111-111111111111', '2nd Year', 'EC-A', '+91 99001 00003'),
('d0000000-0000-4000-8000-000000000004', 'MSOT-24-EC-054', 'Priya Sundaram', 'priya.sundaram@student.msot.ac.in', '11111111-1111-4111-a111-111111111111', '3rd Year', 'EC-B', '+91 99001 00004'),
('d0000000-0000-4000-8000-000000000005', 'MSOT-24-DS-012', 'Vikram Sengupta', 'vikram.sengupta@student.msot.ac.in', '22222222-2222-4222-a222-222222222222', '3rd Year', 'DS-A', '+91 99001 00005'),
('d0000000-0000-4000-8000-000000000006', 'MSOT-25-CS-102', 'Ananya Das', 'ananya.das@student.msot.ac.in', '11111111-1111-4111-a111-111111111111', '1st Year', 'CS-C', '+91 99001 00006'),
('d0000000-0000-4000-8000-000000000007', 'MSOT-25-ME-020', 'Kabir Mehta', 'kabir.mehta@student.msot.ac.in', '11111111-1111-4111-a111-111111111111', '1st Year', 'ME-A', '+91 99001 00007');

-- 3. Global Roles
INSERT INTO public.user_roles (user_id, role, campus_id) VALUES
('a0000000-0000-4000-8000-000000000001', 'admin', '11111111-1111-4111-a111-111111111111'),
('b0000000-0000-4000-8000-000000000001', 'campus_manager', '11111111-1111-4111-a111-111111111111'),
('b0000000-0000-4000-8000-000000000002', 'campus_manager', '22222222-2222-4222-a222-222222222222'),
('c0000000-0000-4000-8000-000000000001', 'advisor', '11111111-1111-4111-a111-111111111111'),
('c0000000-0000-4000-8000-000000000002', 'advisor', '11111111-1111-4111-a111-111111111111'),
('c0000000-0000-4000-8000-000000000003', 'advisor', '22222222-2222-4222-a222-222222222222'),
('d0000000-0000-4000-8000-000000000001', 'president', '11111111-1111-4111-a111-111111111111'),
('d0000000-0000-4000-8000-000000000002', 'coordinator', '11111111-1111-4111-a111-111111111111'),
('d0000000-0000-4000-8000-000000000003', 'coordinator', '11111111-1111-4111-a111-111111111111'),
('d0000000-0000-4000-8000-000000000004', 'president', '11111111-1111-4111-a111-111111111111'),
('d0000000-0000-4000-8000-000000000005', 'president', '22222222-2222-4222-a222-222222222222'),
('d0000000-0000-4000-8000-000000000006', 'student', '11111111-1111-4111-a111-111111111111'),
('d0000000-0000-4000-8000-000000000007', 'student', '11111111-1111-4111-a111-111111111111');

-- 4. Clubs (At least 3 Clubs)
INSERT INTO public.clubs (id, campus_id, name, code, category, description, capacity, status, faculty_advisor_id) VALUES
('e0000000-0000-4000-8000-000000000001', '11111111-1111-4111-a111-111111111111', 'Coding & Open Source Club', 'CLUB-CS-01', 'Technical', 'Fosters software craftsmanship, open-source contributions, hackathons, and web/systems engineering across all years.', 60, 'active', 'c0000000-0000-4000-8000-000000000001'),
('e0000000-0000-4000-8000-000000000002', '11111111-1111-4111-a111-111111111111', 'Robotics & Autonomous Systems', 'CLUB-ROB-01', 'Engineering', 'Dedicated to embedded systems, aerial drones, ROS autonomous navigation, and inter-college competitions.', 45, 'active', 'c0000000-0000-4000-8000-000000000002'),
('e0000000-0000-4000-8000-000000000003', '22222222-2222-4222-a222-222222222222', 'Design & Creative Media Club', 'CLUB-DES-01', 'Creative Arts', 'User experience design, 3D visualization, campus branding, video storytelling, and design sprints.', 40, 'active', 'c0000000-0000-4000-8000-000000000003'),
('e0000000-0000-4000-8000-000000000004', '33333333-3333-4333-a333-333333333333', 'Entrepreneurship & Innovation Cell', 'CLUB-ECELL-01', 'Leadership', 'Startup incubation, venture capital talks, pitch days, and product prototyping for student founders.', 50, 'active', NULL);

-- 5. Coordinator Applications (Multiple States)
INSERT INTO public.club_coordinator_applications (id, club_id, user_id, answers, statement_of_purpose, status, reviewer_id, reviewer_comment, reviewed_at) VALUES
-- Approved application for Diya Patel
('f0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', '{"experience": "2 years React and Node.js", "hours_per_week": 8}'::jsonb, 'Passionate about organizing coding meetups and guiding first-year students in web development.', 'approved', 'd0000000-0000-4000-8000-000000000001', 'Excellent technical and communication background. Approved as Student Coordinator.', now() - interval '14 days'),
-- Approved application for Rohan Verma
('f0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003', '{"experience": "Systems and Linux enthusiast", "hours_per_week": 6}'::jsonb, 'Eager to coordinate infrastructure, server workshops, and devops challenges for club members.', 'approved', 'd0000000-0000-4000-8000-000000000001', 'Strong enthusiasm and organizational skills. Approved.', now() - interval '10 days'),
-- Pending application for Ananya Das
('f0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000006', '{"experience": "Python beginner, GitHub active", "hours_per_week": 5}'::jsonb, 'I want to help organize the weekly algorithm problem-solving sessions and learn coordination.', 'pending', NULL, NULL, NULL),
-- Rejected application for Kabir Mehta
('f0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000007', '{"experience": "None", "hours_per_week": 1}'::jsonb, 'Want certificate.', 'rejected', 'd0000000-0000-4000-8000-000000000001', 'Minimum 4 hours/week commitment required for Student Coordinator role. You are welcome to participate in club events.', now() - interval '5 days');

-- 6. Club Memberships (Approved Student Coordinators)
-- Invariant: "Every approved club member is a Student Coordinator. Multiple coordinators allowed."
INSERT INTO public.club_memberships (id, club_id, user_id, role, status, joined_at) VALUES
-- Coding Club (3 Student Coordinators!)
('10000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'coordinator', 'active', now() - interval '60 days'), -- Aarav Sharma
('10000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'coordinator', 'active', now() - interval '14 days'), -- Diya Patel
('10000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003', 'coordinator', 'active', now() - interval '10 days'), -- Rohan Verma
-- Robotics Club
('10000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000004', 'coordinator', 'active', now() - interval '50 days'), -- Priya Sundaram
-- Design Club
('10000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000005', 'coordinator', 'active', now() - interval '45 days'); -- Vikram Sengupta

-- 7. Club Presidencies (Exactly ONE active president per active club)
-- Note: Trigger verifies that user is an approved active coordinator of the same club.
INSERT INTO public.club_presidencies (id, club_id, user_id, status, appointed_by, appointed_at) VALUES
-- Coding Club: Aarav Sharma is Active President
('20000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'active', 'b0000000-0000-4000-8000-000000000001', now() - interval '60 days'),
-- Robotics Club: Priya Sundaram is Active President
('20000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000004', 'active', 'b0000000-0000-4000-8000-000000000001', now() - interval '50 days'),
-- Design Club: Vikram Sengupta is Active President
('20000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000005', 'active', 'b0000000-0000-4000-8000-000000000002', now() - interval '45 days');

-- 8. Granular Permission Delegations
-- Aarav Sharma (President of Coding Club) delegates specific powers to Diya Patel (Coordinator)
INSERT INTO public.club_permission_delegations (id, club_id, grantor_id, recipient_id, permission, is_revoked, granted_at) VALUES
('30000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'run_checkin', false, now() - interval '12 days'),
('30000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'manage_submissions', false, now() - interval '12 days'),
('30000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003', 'create_activity_plan', false, now() - interval '8 days');

-- 9. Initial Audit Log Entries
INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, previous_state, new_state, reason) VALUES
('b0000000-0000-4000-8000-000000000001', 'APPOINT_PRESIDENT', 'club_presidencies', '20000000-0000-4000-8000-000000000001', NULL, '{"president": "Aarav Sharma", "club": "Coding & Open Source Club"}'::jsonb, 'Campus Manager appointment for Academic Year 2026-2027'),
('d0000000-0000-4000-8000-000000000001', 'GRANT_DELEGATION', 'club_permission_delegations', '30000000-0000-4000-8000-000000000001', NULL, '{"permission": "run_checkin", "recipient": "Diya Patel"}'::jsonb, 'President delegation to Lead Coordinator for upcoming Club Day check-ins');
