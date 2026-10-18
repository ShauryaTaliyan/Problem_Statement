# MSOT Club Activities Tracker
## Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Implementation specification for Antigravity  
**Date:** 18 October 2026  
**Product type:** Mobile-first Progressive Web App (PWA)  
**Primary users:** Students, Student Coordinators, Club Presidents, Faculty Advisors, Campus Managers, Admin / Program Managers

---

## 1. Purpose and source of truth

Build a production-oriented, mobile-first platform that manages MSOT club operations and co-curricular participation across campuses. It replaces fragmented WhatsApp groups, forms, and spreadsheets with one auditable system for club leadership, Club Days, attendance, submissions, evaluations, events, certificates, and student transcripts.

The primary requirements source is **Student Challenge 2.pdf, Problem 3, pages 11–15**. This PRD preserves its mandatory workflows and evaluation requirements, while incorporating the product decisions explicitly made by the user.

### Requirement labels

- **[CHALLENGE-MANDATORY]** Explicitly required in Problem 3, pages 11–15.
- **[USER-DECISION]** Explicitly chosen by the user.
- **[IMPLEMENTATION]** Technical/product detail needed to implement the requirements safely.
- **[FUTURE]** Optional enhancement to deliver after the core product works.

Do not silently turn unresolved institutional policies into hardcoded rules. Make them configurable or mark them as requiring confirmation.

---

## 2. Product vision

**Working name:** MSOT Clubs  
**Tagline:** Every activity. Every achievement. One verified record.

Create a single source of truth for club participation and leadership. Students should be able to discover opportunities, apply to join a club as a Student Coordinator, participate in activities, submit work, attend events, and download a verified co-curricular transcript. Club leadership should be able to run activities from a phone. Institutional staff should be able to monitor participation and verify records across campuses.

### Product principles

1. **Verified:** participation and achievements must be supported by a check-in, submission, result, or authorized approval.
2. **Low effort:** coordinators must be able to run a Club Day from a phone in a few taps.
3. **Student-owned record:** students can access and download their own verified co-curricular transcript.
4. **Mobile-first:** core student and coordinator tasks work on Android and iOS browsers.
5. **Permission-safe:** all authorization is enforced by the backend, not only by hiding UI elements.
6. **Traceable:** corrections and privileged actions have an audit trail.
7. **Accessible:** interface contrast, text, focus, and touch targets remain usable despite glass effects.

---

## 3. Platform, stack, and deployment

### Chosen platform

- **Development machine:** MacBook, using VS Code and Antigravity.
- **Frontend:** React + TypeScript + Vite.
- **Routing:** React Router or an equivalent maintained routing library.
- **Backend:** Supabase.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth.
- **File storage:** Supabase Storage.
- **Privileged operations:** Supabase Edge Functions or another secure server-side layer.
- **Frontend hosting:** Netlify.
- **Target devices:** Android phones, iPhones, tablets, and desktop browsers.
- **Distribution:** installable, responsive PWA; native App Store / Play Store apps are not in the initial scope.

Develop on the MacBook, but deploy the frontend online and connect it to the hosted Supabase backend so people can use it on their phones. Localhost is a development environment, not the final service.

### Environment configuration

Use environment variables such as:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use the current Supabase-recommended publishable/anonymous frontend key. Never expose a service-role key or other server secret in browser code or any `VITE_` variable.

Keep development and production environments separate where practical. Store `.env.local` in `.gitignore`; commit only a `.env.example` with placeholders.

---

## 4. Visual direction and design system

### Chosen visual direction

**Light Glassmorphism + 3D Immersive UI**, using only the colours visible in the supplied logo:

- Navy / very dark blue
- Blue
- Cyan
- Teal
- White

Do not introduce purple, pink, orange, yellow, green, or unrelated accent colours. Use opacity and tints of the allowed palette only.

### Visual references from the approved concept

The approved direction includes:
- Light blue-white backgrounds with translucent glass panels.
- Navy text and dark navy navigation elements.
- Blue-to-cyan/teal gradients for primary actions and highlights.
- Soft blur, subtle borders, layered depth, and restrained glow.
- Isometric / 3D campus illustrations and dimensional club/event illustrations.
- Rounded cards, clear typography, and a premium, immersive feel.
- A desktop dashboard, plus mobile screens for Home, Clubs, Event Details, QR Check-In, Achievements, Profile, and Calendar.

Treat generated mockups as visual inspiration, not as a source of exact data or working behavior. Build real responsive UI components rather than embedding the mockup as a static image.

### Design rules

- **Background:** white or pale blue derived from the approved palette.
- **Glass surfaces:** translucent white/blue panels with restrained backdrop blur and fine blue borders.
- **Primary text:** navy for contrast.
- **Primary action:** blue or blue-to-cyan gradient.
- **Secondary highlight:** cyan/teal.
- **Status:** use text and icons as well as colour; use only allowed palette shades.
- **3D art:** use sparingly in hero areas, club cards, and event cards. Do not let it obscure essential data.
- **Forms, tables, QR check-in and evaluation screens:** prioritize solid/light surfaces and high readability over decorative glass.
- **Mobile:** touch-friendly controls, compact bottom navigation for student screens, responsive menus for administration.
- **Motion:** subtle transitions only; respect reduced-motion settings and avoid animation that delays urgent tasks.
- **Accessibility:** maintain readable contrast, visible keyboard focus, labels, screen-reader names, and sufficiently large touch targets.

---

## 5. Roles, club governance, and authorization

### 5.1 Global roles

1. **Student:** browses clubs and events, applies to become a Student Coordinator, participates in eligible activities/events, checks in, submits work, views scores, and downloads certificates/transcript.
2. **Student Coordinator:** an approved member of a club. Can perform club tasks allowed by their granted permissions.
3. **Club President:** exactly one Student Coordinator designated as president for each active club. The president can delegate specific powers to other members of that club.
4. **Faculty Advisor:** reviews activity plans, evaluates submissions, and issues authorized certificates for assigned clubs.
5. **Campus Manager:** approves clubs for their campus, reviews campus participation, and handles authorized campus workflows including Duty Leave if that future feature is enabled.
6. **Admin / Program Manager:** system-wide administration across campuses, clubs, and events; can view all dashboards and export authorized reports.

A person may have more than one role or club assignment where explicitly permitted. Authorization must always be evaluated for the relevant campus, club, event, and record.

### 5.2 Critical membership rule — user decision

**There is no separate ordinary-member tier within a club. Every approved club member is a Student Coordinator.**

The UI should still use a friendly **“Apply to Join Club”** or **“Apply to Become a Student Coordinator”** action, with the explanatory copy making it clear that approval makes the applicant a Student Coordinator of that club.

- A student applies to join a club as a Student Coordinator.
- The application is reviewed by an authorized club authority, using the configured approval workflow.
- When approved, the student becomes a Student Coordinator of that club.
- A pending or rejected applicant is not a club member and cannot access coordinator tools.
- An approved coordinator does not automatically become president.
- Multiple Student Coordinators are allowed in one club.
- Membership capacity and any per-student club limit are configurable; do not invent an institutional limit.
- Each club can have its own application questions and optional eligibility requirements if configured.

### 5.3 Club President rule — user decision

Each active club must have **exactly one Club President**, chosen from that club’s approved Student Coordinators.

The Club President:
- Has the club-level powers granted by the system.
- Can delegate specific powers to any other approved member / Student Coordinator of the same club.
- Can revoke delegated powers, subject to audit logging.
- Cannot grant global admin or campus-manager privileges.
- Cannot delegate powers beyond their own authority.
- Cannot delegate authority over another club.
- Cannot remove or replace the president role unless the user is authorized under the configured succession/appointment process.

The product must support president appointment, replacement, and transition without leaving a club with two active presidents. The precise institutional authority that appoints or replaces the president is **unresolved** and must be configurable/confirmed; do not assume the president self-appoints.

### 5.4 Delegated permissions

Implement **granular, club-scoped permissions**, not a single unrestricted “admin” switch. Examples:
- Review coordinator applications.
- Manage club profile.
- Create/edit activity plans.
- Submit activity plans for advisor approval.
- Run check-in sessions.
- Correct attendance with a reason.
- Manage submissions and deadlines.
- Evaluate submissions, only if explicitly granted and allowed by policy.
- Manage event registration/teams/results for events organized by the club.
- View/export club reports.
- Issue a particular class of certificate, only if explicitly authorized and permitted by policy.

Delegation rules:
- Delegations belong to one club and one recipient.
- Each delegation records the granting president, permission(s), start/end or revocation state, creation time, and revocation time.
- Delegated permissions are no broader than the president’s own permissions.
- The backend checks permission on every privileged action.
- A member cannot delegate a power merely because they received it, unless a separate “may delegate” permission is explicitly designed and approved.
- All grant/revoke actions are logged.
- When a coordinator leaves a club, their club-scoped permissions and delegations are revoked.
- The president cannot delegate global administration or campus-level powers.

### 5.5 Role and permission matrix

| Capability | Student / applicant | Student Coordinator | Club President | Faculty Advisor | Campus Manager | Admin |
|---|---|---|---|---|---|---|
| Browse published clubs/events | Yes | Yes | Yes | Yes | Yes | Yes |
| Apply to become coordinator | Yes | No duplicate active application | No duplicate active application | Optional | Optional | Optional |
| Review applications | No | Only if delegated/authorized | Yes, by default for own club unless configured otherwise | As configured | Campus oversight if configured | All campuses |
| Edit club profile | No | Only if delegated | Yes, own club | View/limited as configured | Campus oversight | All |
| Plan activities | No | Yes if granted | Yes, own club | Review/approve | View | All |
| Approve activity plan | No | No, unless explicitly authorized by institutional policy | Not automatically; advisor approval remains required by default | Assigned clubs | Not by default | Override only if policy permits |
| Run check-in | No | If granted | Yes, own club | View/authorized | View | All |
| Correct attendance | No | If granted, reason required | Yes, reason required | If authorized | If authorized | Authorized oversight |
| Evaluate submissions | No | Only if explicitly authorized | Only if explicitly authorized | Assigned clubs by default | View | Oversight |
| Manage club event | No | If granted | Yes, own club | View/approval as configured | Campus scope | All |
| Delegate club powers | No | No by default | Yes, own club, within own authority | No by default | No | Can configure role policy |
| Issue certificates | Own certificates only | Only if specifically authorized | Only if specifically authorized | Assigned clubs, subject to policy | View/oversight | Authorized system-wide |
| View own transcript | Yes | Yes | Yes | Own record if applicable | Own record if applicable | Own record if applicable |
| View campus/all reports | No | Own club if authorized | Own club | Assigned clubs | Own campus | All campuses |

“By default” behavior must be implemented as a clear policy and be configurable where the challenge does not define the exact institutional authority. Do not give every coordinator every president power.

---

## 6. Event audience and eligibility rules

### 6.1 Default event visibility — user decision

**A club-organized event is open to all students of the organizing campus by default.**

Organizers can narrow eligibility. Supported examples:
- All students of the campus.
- Students of a particular year (e.g. first year).
- Students in a particular section (e.g. Section A).
- Members / Student Coordinators of a specific club.
- A combination of configured conditions, such as first-year students who are members of a particular club, if the organizer has permission to define that rule.

Inter-campus events can be explicitly marked as open to multiple campuses. Do not assume every event is limited to the organizing campus.

### 6.2 Eligibility implementation

An event should have:
- Organizer club and creator.
- Event scope: campus or inter-campus.
- Eligible campus list / scope.
- Audience rule, with default `all_students_of_organizing_campus`.
- Optional year, section, and club-membership constraints.
- Registration open/close times.
- Capacity and optional waitlist setting.
- Team rules, if applicable.
- Event status and cancellation state.

The backend must validate eligibility when a student views/registers for an event and again when registration is committed. Do not rely only on filtering the event list in the frontend.

If student year/section data is missing or uncertain, do not silently treat the student as eligible for a restricted event. Show a useful error and provide an administrative correction path.

### 6.3 Events are integrated with the campus population

Club events are not only for club members. The event may be campus-wide by default, while eligibility restrictions are optional and explicitly configured. The event registration flow must make eligibility and restrictions visible to students before they register.

---

## 7. Personas and primary user journeys

### Student / prospective coordinator
1. Sign in.
2. Browse clubs and their descriptions, advisor, campus, current president, coordinator team, capacity, and eligibility/application rules.
3. Apply to become a Student Coordinator.
4. View application status and any review comments.
5. Once approved, access that club’s coordinator workspace and permissions.
6. Discover campus events and see eligibility before registering.
7. Register for events and join teams if allowed.
8. Check in to an activity using a rotating QR.
9. Submit deliverables.
10. View published evaluation scores and comments.
11. Download participation/achievement certificates and the co-curricular transcript.

### Student Coordinator
1. Open the dashboard for the relevant club.
2. See upcoming Club Days, pending approvals, attendance sessions, submission deadlines, and event tasks allowed by their permissions.
3. Create or edit an activity plan.
4. Submit the plan for Faculty Advisor approval.
5. Run the QR check-in session.
6. Mark presenters and authorized on-the-spot results.
7. Review submissions only if they have the required permission.
8. View club participation/reporting data within their scope.

### Club President
1. Use all normal coordinator workflows.
2. Review coordinator applications under the club’s configured policy.
3. Grant or revoke specific club permissions for another coordinator.
4. View active delegations and audit history.
5. Manage club leadership transition only through the authorized process.
6. Never gain cross-club or system-wide access merely by being president.

### Faculty Advisor
1. See assigned clubs and pending activity plans.
2. Approve a plan or request changes with a comment.
3. Review submissions and score them with a rubric.
4. Publish evaluations.
5. Issue authorized certificates.
6. Review activity and participation history for assigned clubs.

### Campus Manager
1. Review club approval requests for their campus.
2. See campus participation, inactive clubs, students with zero recorded participation, and monthly reports.
3. Review eligible event/Duty Leave workflows when implemented.
4. Export authorized campus reports.

### Admin / Program Manager
1. Manage campuses, clubs, events, and user-role assignments.
2. See system-wide dashboards.
3. Configure institutional rules and supported eligibility options.
4. Import/export data.
5. Review audit logs and operational status.
6. Manage seeded demo data in development only.

---

## 8. Information architecture and screen inventory

### 8.1 Shared screens
- Sign in / session recovery.
- Demo access (development/demo environment only).
- Notifications.
- Search.
- Access denied / not eligible / not found.
- Loading, empty, offline, and error states.
- Profile and settings.

### 8.2 Student navigation
Recommended mobile bottom navigation:
- **Home**
- **Clubs**
- **Events**
- **Calendar**
- **Profile**

“My Activities,” “Submissions,” “Certificates,” “Transcript,” and “Notifications” are accessible from Home/Profile or relevant detail screens.

#### Student screens
1. **Home dashboard:** greeting, today’s activity, upcoming events, pending submissions, recent achievements.
2. **Explore Clubs:** search, categories, campus, coordinator team, president, eligibility, capacity, application status, apply button.
3. **Club detail:** description, advisor, president, coordinator roster, upcoming activities, history, application status, relevant public information.
4. **Coordinator application:** configured questions, eligibility acknowledgement, submit, status, review outcome.
5. **My Clubs:** approved coordinator memberships and permission/role labels.
6. **Event discovery:** campus events, filters, eligibility labels, registration status.
7. **Event detail:** organizer club, campus scope, eligibility, schedule, venue, capacity, registration, teams, deliverables, results.
8. **Calendar:** Club Days, activities, events, deadlines.
9. **Check-in confirmation:** result of QR scan and timestamp; do not show the coordinator QR as if it were the student scanner.
10. **My Submissions:** required work, deadlines, upload status, feedback.
11. **Evaluation detail:** published rubric scores and comments.
12. **My Achievements:** certificates, participation history, event results, transcript.
13. **Certificate detail / verification:** view, download PDF, share verification link.
14. **Transcript preview/export:** clear distinction between participation, roles, evaluated work, and achievements.
15. **Profile:** student identity, campus/year/section where available, privacy/settings.

### 8.3 Coordinator / President screens
- Role-aware dashboard with active club selector if the user belongs to multiple clubs.
- Club workspace and settings (permission-gated).
- Coordinator application queue.
- President and coordinator roster.
- Delegation / permissions manager (president-only, club-scoped).
- Club Day calendar and activity planner.
- Activity approval status.
- Live QR check-in screen with timer, attendance count, and exception handling.
- Attendance list and correction flow with mandatory reason.
- Presenter/result manager.
- Deliverable configuration and deadline manager.
- Submission review/evaluation queue, only for authorized evaluators.
- Club event builder and event management.
- Registration/team management.
- Club dashboard and report export.
- Audit history for permitted users.

### 8.4 Faculty Advisor screens
- Assigned-club dashboard.
- Activity plan review queue.
- Plan detail with approve/request changes and comments.
- Submission evaluation queue.
- Rubric editor/viewer as authorized.
- Published score history.
- Certificate issuance screen.
- Club activity history.

### 8.5 Campus Manager / Admin screens
- Campus/system overview dashboard.
- Club registry and club approval workflow.
- User and role assignment.
- Campus/year/section data configuration.
- Event oversight.
- Participation and monthly report pages.
- Students with zero participation.
- Inactive club view.
- Top contributor report with documented metric.
- CSV import preview/errors/results.
- CSV export centre.
- Audit log.
- System settings.

### 8.6 Mobile design requirements
- Core workflows must work on a phone without needing a desktop.
- Use a compact bottom navigation for students and responsive menus for staff tools.
- Tables become cards or safely scrollable tables on narrow screens.
- Camera permission denial has a clear recovery path.
- Avoid hover-only interactions.
- Keep check-in and submission actions easy to find.
- Do not use decorative glass behind small, dense text.

---

## 9. Mandatory Club Day workflow

The challenge defines this standard flow. Timings may be adjusted only with a documented justification and configuration.

| When | Step | Required behavior |
|---|---|---|
| 7 days before | Plan | Coordinator submits activity plan; Faculty Advisor approves or requests changes. |
| 3 days before | Announce | Members are notified of topic, venue, deliverable, and deadline. |
| On the day, at start | Check-in | Time-limited QR/code check-in opens; late check-ins are flagged. |
| During | Run | Coordinator marks presenters and any on-the-spot activity results. |
| Within 48 hours | Submit | Students upload deliverables; reminders go to students who have not submitted. |
| Within 5 days | Evaluate | Authorized coordinator/advisor evaluates; scores become visible to students. |
| End of month | Report | Automatic report to Campus Manager with attendance %, submissions, average scores, and highlights. |

### Activity lifecycle states

Suggested states:
- Draft
- Submitted for approval
- Changes requested
- Approved
- Announced
- Check-in open
- In progress
- Submission window open
- Evaluation in progress
- Completed
- Cancelled

Do not permit unauthorized state transitions. Preserve the activity’s status history where relevant.

### Activity plan fields
- Club and Club Day reference.
- Title/topic.
- Format (presentation, assignment-based, workshop, other configurable type).
- Description and expected outcomes.
- Venue or online location.
- Start/end time.
- Deliverable description and accepted submission types.
- Submission deadline.
- Evaluation rubric or scoring method.
- Advisor and assigned coordinators.
- Approval comments/history.
- Eligibility, if the activity itself is restricted.
- Announcements and notification schedule.

---

## 10. Rotating QR attendance

### 10.1 Flow
1. Authorized coordinator opens a check-in session for a specific activity.
2. Server creates a short-lived opaque token.
3. UI displays the QR and countdown; token rotates according to a configurable interval.
4. Authenticated student scans it in the app or follows a secure URL.
5. Server validates user, activity/session, token, expiry, check-in window, eligibility, and duplicate status.
6. Server inserts the attendance record transactionally.
7. Student sees confirmation; coordinator sees the count and attendance list.
8. Authorized corrections require a reason and create an audit record.

### 10.2 Security and integrity rules
- Never encode student passwords, access tokens, or sensitive personal data in QR contents.
- QR token creation and validation must be server-side.
- Do not trust client timestamps or client-side eligibility checks.
- Expired/replayed tokens must fail.
- One student may have only one effective attendance record per session.
- Repeated requests must be idempotent and must not create duplicate records.
- Mark late check-ins according to configured session rules.
- Coordinator corrections record actor, timestamp, reason, previous state, and new state.
- QR rotation reduces screenshot reuse but does not eliminate collusion; test replay and screenshot scenarios.
- Geolocation is **not mandatory**. If added, it requires explicit policy, privacy handling, and testing.

### 10.3 Attendance fallback
The challenge describes QR or one-time code check-in and requires integrity testing. The chosen primary method is rotating QR. A secure one-time code or coordinator-assisted exception flow may be added as a fallback, but any manual correction must be authorized and audited. Do not silently mark attendance when a scan fails.

---

## 11. Submissions and evaluations

### 11.1 Submission requirements
- Each activity may define one or more deliverables.
- Students upload PPTs, assignments, links, photos, or other explicitly allowed types.
- Store files in private Supabase Storage.
- Record owner, activity, file path or external URL, submitted timestamp, status, and version where versioning is supported.
- Validate file size, allowed extension, ownership, and access.
- Use signed URLs or another secure method for private downloads.
- Show deadlines and late/missing status clearly.
- Send reminders to students who have not submitted within the configured window.

### 11.2 Evaluation requirements
- Coordinators/advisors evaluate only when authorized.
- Support a configurable rubric (examples in challenge: content, presentation, participation).
- Rubric dimensions, scoring ranges, and weights are configurable; do not invent one universal grading scale.
- Record evaluator, score per dimension, total, comments, timestamp, and publication status.
- Students see scores only when published.
- Students cannot edit scores or evaluations.
- Corrections to published evaluations must retain history.
- Attendance does not automatically imply a score or skill achievement.

---

## 12. Integrated event management

### 12.1 Event lifecycle
1. Authorized organizer creates event.
2. Event scope and eligibility are configured.
3. Registration opens.
4. Students browse and register if eligible.
5. Optional teams are created/joined under event-specific rules.
6. Event attendance is recorded.
7. Results are entered and published by authorized organizers.
8. Eligible certificates and transcript entries are generated.
9. Event reports are available to authorized users.

### 12.2 Event fields
- Title, description, organizer club, organizer user.
- Campus/inter-campus scope.
- Campus list or audience scope.
- Default eligibility: all students of organizing campus.
- Optional year, section, and club membership filters.
- Registration opening/closing times.
- Start/end time, venue, and schedule.
- Capacity and optional waitlist.
- Team formation enabled/disabled and configured team-size rules.
- Deliverables and deadlines, if applicable.
- Event check-in settings.
- Result categories and publication status.
- Certificate rules.
- Event status: draft, published, registration open, registration closed, in progress, completed, cancelled.

### 12.3 Integrity rules
- Eligibility must be checked server-side on registration.
- Capacity must be enforced transactionally to prevent oversubscription.
- A student can have only one active registration per event unless the event explicitly models multiple registration types.
- A student cannot join the same team twice.
- Team size and event-specific rules are configurable.
- Event cancellation and registration changes must be visible and audited.
- Events can be campus-wide by default; they are not automatically limited to club members.
- Inter-campus events must support eligible participants from multiple campuses.

---

## 13. Certificates and co-curricular transcript

### 13.1 Certificate types
- **Participation certificate:** issued when the configured participation criteria are met.
- **Achievement certificate:** issued for an approved result/achievement.

Certificate issuance may be manual by an authorized person or automated only when explicit rules and authorization have been configured.

### 13.2 Certificate fields
- Unique certificate ID.
- Student identity.
- Certificate type.
- Activity/event and issuing club.
- Achievement/participation statement.
- Issuer and issue timestamp.
- Verification token/URL/QR.
- Revocation timestamp and reason, if revoked.

### 13.3 Verification
- Public verification page shows minimal information needed to validate authenticity.
- Verification token is unguessable and not derived from a student ID.
- Revoked/invalid certificates are clearly marked.
- PDF tampering must be detected by a verification design that validates the server-side record and, where implemented, a signed document hash/signature. A QR code alone does not prove that a PDF has not been altered.
- Private submissions and sensitive records are never exposed through public verification.

### 13.4 Student transcript
Provide a downloadable PDF transcript containing verified records such as:
- Club names and approved roles (including Student Coordinator and Club President periods where applicable).
- Activities and event participation.
- Published evaluation/achievement records where appropriate.
- Certificates and verification references.
- Issue date and verification method.

Separate participation from assessed achievement. Do not claim a skill was mastered simply because a student attended an event. Students can access their own transcript at any time; access to another student’s transcript is restricted unless the student explicitly shares a permitted public verification/export.

---

## 14. Dashboards, reports, import/export

### 14.1 Student dashboard
- Upcoming Club Days/events.
- Membership application status.
- Pending deliverables and deadlines.
- Recent published scores.
- Certificates and transcript access.
- Participation history.

### 14.2 Club dashboard
- Upcoming activities.
- Pending activity approval.
- Coordinator application queue.
- Check-in status and attendance count.
- Missing submissions and evaluation backlog.
- Event registration/team status.
- Participation and activity history.
- President and delegation overview, restricted to authorized users.

### 14.3 Campus/admin dashboard
Required challenge views:
- Participation by student, club, and campus.
- Inactive clubs.
- Students with zero recorded participation.
- Top contributors, with the ranking metric explicitly defined.
- Exportable reports for academic reviews.
- Monthly club report: attendance percentage, submissions, average scores, highlights.

### 14.4 Metric definitions
Do not ship unexplained numbers. Document each formula and filter.

- **Attendance percentage:** define the denominator as eligible attendance records for the selected activities/sessions and period; handle excused/late status according to configurable policy.
- **Submission rate:** submitted required deliverables divided by required deliverables, with missing/late/excused states shown separately.
- **Average score:** average of eligible published scores, specifying the rubric and date range.
- **Inactive club:** configurable inactivity threshold; do not hardcode an unconfirmed policy.
- **Zero participation:** no qualifying recorded participation in the selected period, not merely missing data.
- **Top contributors:** use a documented metric such as verified participation or approved achievements; do not conflate attendance and mastery.

### 14.5 Import
- Support CSV import for relevant institutional data and Club Day calendar records.
- Preview rows before committing.
- Validate required fields and foreign-key references.
- Detect duplicates and conflicts.
- Show row-level errors and offer an error report.
- Never silently drop invalid rows or create duplicate identities.
- Record import job status and actor.

### 14.6 Export
- CSV reports within the user’s authorized scope.
- Student transcript PDF.
- Certificate PDF and verification link.
- Event registrations, team rosters, and results where authorized.
- Monthly club reports.
- Respect the same access controls as on-screen data.

---

## 15. Notifications and scheduled workflows

### Required/default notifications
- Coordinator application received and decision recorded.
- Activity plan approved or returned for changes.
- Club Day announcement.
- Upcoming deliverable deadline.
- Missing submission reminder.
- Evaluation published.
- Event registration confirmation and relevant changes.
- Certificate issued.
- Monthly report ready.

Start with in-app notifications and email where configured. WhatsApp/Telegram are future integrations.

### Reliability rules
- Store notification records.
- Track queued/sent/failed state where supported.
- Retry transient failures safely.
- Prevent duplicate sends when scheduled jobs are rerun.
- Keep notification delivery separate from the authoritative activity/submission state.
- Do not assume a notification was read simply because it was delivered.

### Timing
Use the Club Day timing in Section 9. Timezone for scheduling/display should be configurable per campus. Store timestamps consistently (UTC) and convert for local display.

---

## 16. Database model

Use PostgreSQL as the source of truth. Generate versioned SQL migrations with constraints, indexes, and RLS policies. The following is a logical model; implementation may normalize it further, but must preserve these relationships.

### 16.1 Identity and access
- `profiles`: user id, name, student/staff identifier, campus, year, section, status.
- `campuses`: campus identity and timezone.
- `user_roles`: global/system role assignments.
- `club_staff_assignments`: user-to-club role/assignment data.
- `club_permission_delegations`: club-scoped permissions granted by a president, grantor, recipient, dates, and revocation metadata.

### 16.2 Club governance
- `clubs`: campus, name, description, capacity, status, advisor references.
- `club_coordinator_applications`: applicant, club, answers, status, reviewer, decision timestamps/comments.
- `club_memberships`: approved coordinator membership, status, dates, and club-specific role.
- `club_presidencies` or equivalent constrained fields: active president per club with history.
- `club_days`: imported or configured Club Day dates.
- `activities`: club, Club Day, title, topic, format, venue, times, deliverable rules, deadline, eligibility, status.
- `activity_approvals`: approver, decision, comment, timestamp, revision.

### 16.3 Attendance and work
- `attendance_sessions`: activity, open/close times, status, token metadata kept server-side.
- `attendance_records`: session, student, check-in timestamp/method, late/status fields.
- `attendance_audit_logs`: actor, reason, previous/new state, target record, timestamp.
- `deliverables`: activity, description, allowed types, deadline, required/optional flag.
- `submissions`: activity/deliverable, student, storage path/external URL, timestamp, status, version.
- `rubrics`: name, version, dimensions, scoring configuration.
- `evaluations`: submission, evaluator, score, comments, publication state/timestamps.
- `rubric_scores`: per-dimension scores and comments.

### 16.4 Events and achievement
- `events`: organizer club, event scope, eligibility rules, dates, capacity, status.
- `event_registrations`: event, student, status, timestamps.
- `teams`: event, name, leader if applicable.
- `team_members`: team and student.
- `event_results`: event/team/student, result type, details, publication state.
- `certificates`: student, source record, type, verification token, issue/revocation details.
- `achievements`: normalized achievement entries for transcript/report use.

### 16.5 Platform operations
- `notifications`
- `audit_logs`
- `import_jobs` and import error rows
- `system_settings`
- optional `media_assets` in the future

### 16.6 Data integrity requirements
- Use UUIDs or equivalent stable identifiers.
- Use foreign keys for relationships.
- Unique constraint: one active president per club; application must support safe replacement and history.
- Unique constraint: one effective attendance record per student/session.
- Unique constraint: one active registration per student/event unless explicitly configured otherwise.
- Unique constraint: no duplicate membership for the same student/club.
- Unique constraint: certificate ID and verification token.
- Enforce capacity and team-size rules transactionally.
- Restrict destructive deletion of records referenced by evaluations, certificates, or audit history; prefer archival/revocation.
- Index common filters such as campus, club, event, student, status, and timestamps.
- Reports must derive from authoritative records rather than independently maintained totals.

---

## 17. Security and privacy

### 17.1 Authentication
- Use Supabase Auth for real accounts.
- Demo accounts and seeded data are allowed in the demo environment.
- Demo role switching must be explicitly labelled and disabled or tightly controlled in production.
- Do not allow users to assign themselves a role by changing a frontend value.
- Staff SSO and student OTP/ID-login methods require institutional confirmation; do not assume the institution has configured them.

### 17.2 Row Level Security
Enable RLS for every private or privileged table.

Policy intent:
- Students can view/edit only their own profile fields that are editable and their own applications, submissions, attendance records, evaluations when published, certificates, and transcript.
- Approved coordinators can access only clubs and actions within their assignments and delegated permissions.
- Presidents can manage only their own club’s governance and delegations.
- Faculty Advisors can review assigned clubs.
- Campus Managers are scoped to their campus.
- Admins have system-wide access only through authorized accounts.
- Public certificate verification exposes only minimal verification fields.
- Private Storage objects are not publicly readable.

Test policies with users across different roles and campuses. Never treat UI hiding as security.

### 17.3 Secure server operations
Server-side validation is required for:
- QR token creation/validation and attendance insertion.
- Capacity-sensitive registration and team operations.
- President appointment and permission delegation.
- Certificate issuance, verification and revocation.
- Privileged imports and exports where needed.
- Scheduled notifications.

### 17.4 Privacy and audit
- Collect only required data.
- Keep contact details and submissions private.
- Record actor, action, target, timestamp, and reason for sensitive changes.
- Restrict audit-log access and prevent ordinary users from editing logs.
- Establish retention/deletion policies before institutional production use.
- Photo/media gallery requires consent controls and is future scope.
- Geolocation is optional and must not be silently enabled.

---

## 18. Non-functional requirements

### Performance and scale — challenge requirements
- Support **4 campuses, 30+ clubs, and 1,000+ students**.
- Handle **500 students checking in within the same 5 minutes on a Saturday morning**.
- Target **p95 response time under 1 second** for the specified check-in workload.
- Submit load tests at **100, 300, and 500 concurrent check-ins**, including p95 latency and error rate.

### Reliability
- Prevent lost or duplicate attendance, registrations, and team membership.
- Use database constraints and transactions for concurrency-sensitive operations.
- Handle retried requests idempotently.
- Display clear error states and allow safe retry where appropriate.

### Maintainability
- Strict TypeScript; avoid `any` unless justified and isolated.
- Reusable UI components and domain types.
- Versioned database migrations.
- Seed scripts that can be rerun safely in development.
- Separate data access, business logic, and presentation.
- Centralized authorization helpers and documented RLS policies.
- No hardcoded production credentials or secret keys.

### PWA and mobile
- Responsive on Android/iOS and desktop.
- Installable manifest and icons.
- HTTPS in production.
- Camera permission handling for QR scanning.
- No offline attendance claim unless offline validation and reconciliation are explicitly implemented and tested.

---

## 19. Testing plan and mandatory evidence

The challenge explicitly states that **submissions without a Test Report are not evaluated**.

### 19.1 Mandatory test areas

| Test area | Required evidence |
|---|---|
| End-to-end Club Day | Full flow for 3 clubs: plan → approve → check-in → submit → evaluate → report |
| Check-in integrity | Screenshot/replay, late check-in, and out-of-campus scenarios if geolocation is used |
| Certificates | Generate 20 certificates; each verification link opens the correct record; tampered PDF fails verification |
| Events | Event with 200 registrations and team formation runs without duplicate or lost entries |
| Permissions | Coordinators see only their authorized club(s); students cannot edit attendance or scores |
| Reports | Monthly report figures match raw attendance and submission data |
| Scalability | Load tests at 100, 300, and 500 concurrent check-ins, reporting p95 latency and error rate |

### 19.2 Additional recommended tests
- Multiple coordinators in the same club.
- Exactly one active president per club.
- President grants/revokes individual permissions.
- Delegated user cannot exceed grantor’s permissions or access another club.
- Coordinator removed from club loses club-scoped access.
- Membership capacity race.
- Event audience eligibility by campus/year/section/club membership.
- Event capacity race and duplicate registration.
- Team size limit and duplicate team membership.
- Activity approval and revision history.
- Submission deadline and invalid file.
- Evaluation publishing and correction history.
- Certificate revocation.
- RLS across all roles and campuses.
- CSV import duplicates and invalid rows.
- Notification retries and duplicate prevention.
- Mobile camera denial and responsive layouts.

### 19.3 Load test reporting
Use k6, Locust, or an equivalent tool. Record:
- Test environment and deployment region.
- Number of virtual/concurrent users.
- Workload and request mix.
- p50, p95, p99 latency.
- Error rate.
- Duplicate/missing records.
- Database contention and connection errors.
- Test duration and limitations.

Define exactly which operation is measured (e.g. server-side QR validation + attendance insertion). Do not claim the target passed unless test output supports it. Local-only tests are not sufficient evidence of hosted production performance.

---

## 20. Acceptance criteria

The solution is ready for challenge submission when all of the following are demonstrated:

1. Four campuses, at least 30 clubs, and sample data for at least three clubs can be represented.
2. A club supports multiple Student Coordinators and exactly one active Club President.
3. Applying to join a club is clearly an application to become a Student Coordinator.
4. A president can grant and revoke specific club-scoped powers; the backend enforces them.
5. Events are campus-wide by default and can be restricted by campus/year/section/club membership.
6. Club Day planning and approval work end-to-end.
7. Rotating QR check-in expires and rejects replay/duplicates, with audited corrections.
8. Students can upload deliverables and authorized reviewers can score with rubrics and publish results.
9. Events support registrations, teams, check-ins, and results.
10. Participation/achievement certificates can be generated and verified.
11. Students can download their own co-curricular transcript.
12. Dashboards and monthly reports reconcile with underlying data.
13. CSV import/export works with validation and error reporting.
14. Role-based permissions and RLS tests pass.
15. The mobile interface works on Android and iOS browsers.
16. The required 20-certificate, 200-registration, and load-test evidence is included.
17. Repository, README, architecture/design document (≤3 pages), sample data, Test Report, and load-test results are supplied.
18. The live deployment is tested; no feature is described as complete unless verified.

---

## 21. Delivery phases

Build sequentially. Do not create all screens with mock data and call the application complete.

### P0 — Foundation
- Inspect/create Vite React TypeScript project.
- Establish routes, design tokens, glassmorphism components, responsive layout.
- Create Supabase project configuration and SQL migrations.
- Implement Auth, profiles, role assignments, RLS, seed scripts, demo mode.
- Build role-specific navigation and access-denied states.

**Exit gate:** each role can sign in/demo and access only its permitted routes and records.

### P1 — Club governance and applications
- Club registry.
- Club detail and coordinator roster.
- Student Coordinator applications.
- Application review/approval.
- Multiple coordinators per club.
- President assignment with exactly-one-active-president constraint.
- Granular club permission delegation and audit history.

**Exit gate:** multiple coordinators operate within one club; president delegation is enforced server-side.

### P2 — Club Day and attendance
- Calendar import/configuration.
- Activity planning and advisor approval.
- Announcements and deadline reminders.
- Rotating QR session and server validation.
- Attendance list and audited corrections.
- Presenter/results capture.

**Exit gate:** Club Day check-in and activity status work with real data.

### P3 — Submissions and evaluation
- Deliverables/deadlines.
- Private file upload.
- Submission queue.
- Rubric configuration and evaluation.
- Publish scores and preserve correction history.

**Exit gate:** full plan → approve → check-in → submit → evaluate flow passes.

### P4 — Integrated events
- Event creation.
- Campus/inter-campus scope.
- Campus-wide default eligibility.
- Year/section/club-member restrictions.
- Registration and capacity controls.
- Team formation.
- Check-in and results.

**Exit gate:** 200-registration test succeeds without lost or duplicate entries.

### P5 — Certificates, transcript, reports
- Participation and achievement certificates.
- PDF generation and verification.
- Revocation.
- Student transcript PDF.
- Campus and admin dashboards.
- Monthly reports and CSV import/export.

**Exit gate:** 20 certificates pass verification and reports reconcile with raw records.

### P6 — Quality and launch
- Automated tests and RLS tests.
- Mobile QA on Android/iOS.
- Accessibility and responsive polish.
- Load testing.
- README, architecture diagram/design document, sample data, Test Report.
- Netlify frontend deployment and production Supabase configuration.

**Exit gate:** all challenge acceptance criteria are evidenced.

### P7 — Optional enhancements
Deliver only after the core solution is stable:
- Club budget and expense approvals.
- Duty Leave requests for approved inter-college events.
- Consent-managed photo/media gallery.
- WhatsApp/Telegram announcements.

---

## 22. Coding-agent execution rules

When Antigravity works on this repository:

1. Inspect existing files and preserve working behavior before editing.
2. Read this PRD first and treat it as the product specification.
3. Do not invent conflicting role, club, or event rules.
4. Build a working end-to-end feature at a time.
5. Before each phase, state the files/schema/workflows to be changed and the acceptance criteria.
6. Use migrations for schema changes; never rely on undocumented manual database edits.
7. Do not put secrets in frontend code.
8. Do not weaken RLS to make a feature work.
9. Do not use static mock numbers in production dashboards.
10. Use seeded demo data only for demo/test accounts; live users must use real database records.
11. Run TypeScript checks, linting, production build, and relevant tests after each phase.
12. Verify real database reads/writes and authorization with different roles.
13. Do not claim a migration, test, or deployment succeeded unless it was actually run and verified.
14. If a requirement is ambiguous, preserve the current behavior in this PRD and surface the unresolved decision instead of silently inventing an institutional policy.
15. Keep visual design within the approved navy, blue, cyan, teal, and white palette. Use light glassmorphism and 3D immersive elements, but keep operational screens readable and fast.

---

## 23. Unresolved institutional decisions

These should be configurable or confirmed before institutional production use. They must not block the initial foundation unless a dependency requires them.

1. **Who appoints/replaces the Club President?** The user requires one president per club and president delegation powers; the formal appointment authority is not yet specified.
2. **Who approves Student Coordinator applications?** Configure the approval workflow; confirm whether this is the current president, an authorized coordinator, the Faculty Advisor, the Campus Manager, or a combination.
3. **Membership limits:** maximum clubs per student and coordinator capacity per club.
4. **Staff authentication:** whether MSOT requires Google Workspace SSO.
5. **Student authentication:** institutional ID/OTP or another approved method.
6. **Year/section source:** authoritative data source and correction process.
7. **Evaluation rubric:** dimensions, score ranges, weights, and who can evaluate.
8. **Late work and attendance exceptions:** deadlines, excused cases, and late-status rules.
9. **Report formulas:** attendance denominator, inactive-club threshold, and contributor ranking metric.
10. **Certificate policy:** exact issuance authority, approval requirements, and revocation rules.
11. **Retention/deletion:** institutional rules for student records, files, and audit logs.
12. **Notifications:** approved email provider and whether WhatsApp/Telegram can be used.
13. **Geolocation:** optional, not enabled by default.
14. **Offline behavior:** whether any workflow must work without connectivity; do not claim verified offline check-in unless designed and tested.

---

## 24. Definition of done

The product is done for the challenge only when:
- The mandatory workflows are functional and database-backed.
- The clarified club governance and event eligibility rules are implemented.
- Security policies are tested, not merely written.
- The approved light glassmorphism + 3D immersive visual system is consistently applied using only the logo palette.
- Android/iOS mobile browser workflows work.
- The required test report and load-test results exist.
- The repository and deployment instructions allow another developer to run the project.
- Any incomplete feature or unresolved institutional decision is clearly documented.

**Final product promise:** one mobile-first, visually immersive platform where club participation is managed, permissions are trustworthy, events reach the right students, and each student’s co-curricular record is verifiable and portable.
