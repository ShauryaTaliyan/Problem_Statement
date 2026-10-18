# MSOT Clubs — Club Activities Tracker

A mobile-first, multi-campus club management and co-curricular tracking platform for MSOT. The application is designed to manage club coordinator applications, club leadership and delegated permissions, Club Days, rotating QR attendance, submissions, evaluations, campus events, certificates, and student transcripts.

> **Product specification:** See [`MSOT_Club_Activities_Tracker_PRD_Antigravity.md`](./MSOT_Club_Activities_Tracker_PRD_Antigravity.md) for the complete requirements, workflows, data model, security rules, acceptance criteria, and build phases.

## Product goals

- Give students one place to discover clubs and events and access their verified participation records.
- Let club teams plan activities and manage attendance, submissions, and evaluations from mobile devices.
- Provide auditable club governance with multiple Student Coordinators and exactly one active Club President per club.
- Make club-organized events campus-wide by default, with optional eligibility restrictions.
- Generate verifiable certificates and downloadable co-curricular transcripts.
- Provide authorized campus and program administrators with reliable dashboards and reports.

## Key product rules

- **Every approved club member is a Student Coordinator.** There is no separate ordinary-member tier within a club.
- A club can have multiple Student Coordinators.
- Each active club has exactly one Club President, chosen from its approved Student Coordinators.
- The Club President can grant and revoke specific club-scoped permissions, but cannot grant powers beyond their own authority or give global admin access.
- Club-organized events are open to all students of the organizing campus by default. Organizers can narrow eligibility by campus, year, section, or club membership.
- Essential student and coordinator workflows must work on Android and iOS mobile browsers.
- Public certificate verification must expose only the minimum information needed to verify authenticity.

## Approved UI direction

**Light Glassmorphism + 3D Immersive UI**, using only the colours visible in the supplied logo:

- Navy / dark blue
- Blue
- Cyan
- Teal
- White

Use pale blue-white backgrounds, translucent glass panels, subtle blur, fine borders, restrained glow, 3D/isometric campus illustrations, rounded cards, and clear navy text. Avoid unrelated accent colours. Operational screens—especially QR check-in, forms, tables, and evaluations—must prioritize readability over decoration.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build tooling | Vite |
| Backend and database | Supabase + PostgreSQL |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| Privileged operations | Supabase Edge Functions or secure server-side endpoints |
| Hosting | Netlify |
| Mobile delivery | Responsive Progressive Web App (PWA) |

The app is developed on a MacBook, but the deployed frontend and hosted Supabase backend make it accessible online from phones and computers. The initial deliverable is a PWA, not a native App Store or Play Store application.

## Core functionality

1. Role-specific dashboards for Students, Student Coordinators, Club Presidents, Faculty Advisors, Campus Managers, and Admin / Program Managers.
2. Club discovery and applications to become a Student Coordinator.
3. Multiple coordinators per club, president appointment, and granular permission delegation.
4. Club Day planning, advisor approval, announcements, and deadlines.
5. Rotating QR attendance, duplicate/replay protection, and audited attendance corrections.
6. Deliverable uploads, configurable evaluation rubrics, published scores, and feedback.
7. Campus and inter-campus events, eligibility restrictions, registrations, teams, check-in, and results.
8. Participation and achievement certificates with verification and revocation.
9. Student co-curricular transcript PDF.
10. Campus/admin dashboards, monthly reports, and CSV import/export.
11. In-app notifications and scheduled reminders.
12. Seeded demo data and role-specific test accounts for development.

## Development setup

These instructions assume a new project created with Vite. If the repository already exists, inspect its files and follow the existing scripts rather than recreating it.

### Prerequisites

- A recent supported Node.js LTS release and npm.
- Git.
- A Supabase project.
- A Netlify account for deployment.
- VS Code or another editor; Antigravity can be used as the coding agent.

### 1. Create the frontend (new project only)

```bash
npm create vite@latest msot-club-tracker -- --template react-ts
cd msot-club-tracker
npm install
npm run dev
```

Open the local URL printed by Vite.

### 2. Install and configure Supabase

Install the Supabase JavaScript client if it is not already installed:

```bash
npm install @supabase/supabase-js
```

Create a Supabase project. Add a `.env.local` file at the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use the current Supabase-recommended frontend publishable/anonymous key. **Never expose a service-role key or other server secret in browser code or a `VITE_` environment variable.**

Add `.env.local` to `.gitignore`. Commit an `.env.example` containing placeholders only.

### 3. Database and storage

Before implementing feature screens:

1. Create versioned SQL migrations for the schema described in the PRD.
2. Configure authentication and profile creation.
3. Enable and test Row Level Security (RLS) for every private or privileged table.
4. Create private Storage buckets for student submissions.
5. Implement server-side functions for sensitive operations, including QR validation, permission delegation, capacity-sensitive registration, and certificate issuance/verification.
6. Add repeatable development seed scripts.

Do not disable RLS to make the UI work. Test access with different roles and campus assignments.

## Environment variables

Frontend variables may include:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Add server-side secrets only in the appropriate server/Edge Function environment, never in the frontend bundle. Keep production and development credentials separate where practical.

## Recommended implementation order

Follow the phases in the PRD. Do not build all screens with mock data and call the product complete.

- **P0 — Foundation:** app shell, design tokens, routing, Supabase Auth, schema, RLS, seeded demo data, role-aware navigation.
- **P1 — Club governance:** clubs, Student Coordinator applications, multiple coordinators, one president per club, granular delegated permissions.
- **P2 — Club Day and attendance:** calendar, activity planning/approval, announcements, rotating QR, audited corrections.
- **P3 — Submissions and evaluations:** private file uploads, deadlines, rubrics, publication, correction history.
- **P4 — Events:** eligibility rules, registrations, capacity, teams, check-in, results.
- **P5 — Certificates and reporting:** certificate generation/verification/revocation, transcript PDF, dashboards, imports/exports.
- **P6 — Quality and deployment:** tests, mobile QA, accessibility, load tests, documentation, Netlify deployment.
- **P7 — Optional enhancements:** club budgets, Duty Leave, consent-managed media gallery, WhatsApp/Telegram announcements.

After each phase, run type checks, linting, a production build, relevant automated tests, and role/RLS checks.

## Running the app

Use the scripts defined in `package.json`. A standard Vite project commonly supports:

```bash
npm run dev
npm run build
npm run preview
```

If linting is configured:

```bash
npm run lint
```

Do not assume a script exists without checking `package.json`.

## Mobile testing

Test on:
- Desktop browsers.
- Android phone browsers.
- iPhone Safari.

Verify responsive layouts, navigation, form input, camera permission prompts, QR scanning, event registration, file uploads, session expiry, and error recovery. A PWA may be installable from the browser, but it is not a native mobile app.

## Testing and challenge evidence

The challenge requires a Test Report. The submission should include:

- End-to-end Club Day lifecycle for three clubs.
- Check-in integrity tests, including screenshot/replay and late check-ins; test out-of-campus checks if geolocation is implemented.
- Twenty generated certificates with valid verification; a tampered PDF must fail verification.
- An event with 200 registrations and team formation without lost or duplicate records.
- Authorization tests showing coordinators cannot access unauthorized clubs and students cannot edit attendance or scores.
- Monthly report reconciliation against raw attendance/submission data.
- Load tests at 100, 300, and 500 concurrent check-ins, reporting p95 latency and error rate.

The challenge performance target is p95 response time below one second for the defined check-in workload, with 500 students checking in within five minutes. Define exactly what the measured endpoint covers and include test environment, workload, results, and limitations. Do not claim tests passed unless they were actually run.

## Deployment to Netlify

1. Push the repository to GitHub.
2. Create/connect a Netlify site from the repository.
3. Configure the build command (`npm run build`) and publish directory (`dist`) for a standard Vite setup.
4. Set the frontend environment variables in Netlify.
5. Apply reviewed SQL migrations to the intended Supabase environment.
6. Configure Supabase authentication redirect URLs and production site URLs.
7. Deploy and test the live URL on Android, iOS, and desktop.
8. Verify RLS, Storage access, certificate verification, and scheduled jobs in the deployed environment.

A frontend deployment does not deploy or configure the Supabase database automatically. Configure backend functions and scheduled jobs separately.

## Security checklist

- [ ] No service-role key in frontend code.
- [ ] RLS enabled and tested on all private/privileged tables.
- [ ] Role assignment is server-controlled.
- [ ] President delegation is club-scoped and cannot exceed the grantor’s permissions.
- [ ] Exactly one active president per club is enforced.
- [ ] QR token creation/validation is server-side and expiry/replay is tested.
- [ ] Attendance corrections create audit records.
- [ ] Event eligibility and capacity are checked server-side.
- [ ] Student submissions use private storage and authorized download access.
- [ ] Certificate verification reveals minimal public data.
- [ ] CSV imports/exports respect authorization.
- [ ] Demo role switching is not an unrestricted production bypass.
- [ ] Environment secrets are excluded from version control.

## Repository deliverables

Keep these files in the project repository:

- `README.md` — setup, architecture overview, environment configuration, test and deployment instructions.
- `MSOT_Club_Activities_Tracker_PRD_Antigravity.md` — complete product specification.
- `.env.example` — placeholders only.
- Versioned SQL migrations and seed scripts.
- Architecture/design document.
- Automated tests and a Test Report.
- Load-test scripts and results.
- Clear list of incomplete features and unresolved institutional decisions.

## Antigravity instructions

Before editing code, read the complete PRD. Inspect the existing repository and preserve working features. Implement one complete, database-backed phase at a time. Do not invent institutional policies, hardcode dashboard statistics, weaken RLS, or report success without verification. Use migrations for schema changes and test with multiple roles. Keep the UI within the approved navy, blue, cyan, teal, and white palette.

## Unresolved decisions

The PRD records institutional decisions that need confirmation, including who appoints/replaces the Club President, who approves coordinator applications, membership limits, authentication method, official year/section data, grading rules, report formulas, certificate authority, retention policy, notification providers, and whether geolocation is used. Keep these configurable until confirmed.

---

**Start here:** read `MSOT_Club_Activities_Tracker_PRD_Antigravity.md`, then implement P0 and demonstrate its acceptance criteria before moving to P1.
