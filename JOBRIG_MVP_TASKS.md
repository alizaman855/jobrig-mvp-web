# Jobrig MVP — Build Task List (Next.js Web App)

**Goal:** A multi-tenant web app for local service businesses (HVAC, plumbing, roofing, electrical, land clearing) covering three core MVP features:
1. Instant on-site quoting with e-signature
2. Job dispatch & scheduling
3. Automated post-payment review requests

**Stack:**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma ORM
- NextAuth.js (email/password + optional Google login)
- Twilio (SMS for review requests + optional job notifications)
- Stripe (payment status webhook — optional for MVP, can start with manual "mark paid")
- Vercel for hosting, Neon/Supabase for hosted Postgres

**How to use this doc:** Work through phases in order. Each phase has tasks with clear "Definition of Done" so Claude Code can self-check before moving to the next task. Do not skip ahead — later phases depend on earlier data models.

---

## Phase 0 — Project Foundation

- [ ] **0.1** Initialize Next.js 14 project with TypeScript, App Router, Tailwind CSS, ESLint.
  - DoD: `npm run dev` runs a working default homepage with Tailwind styles applied.
- [ ] **0.2** Install and configure shadcn/ui component library.
  - DoD: At least one shadcn component (e.g. Button) renders correctly on the homepage.
- [ ] **0.3** Set up project folder structure: `/app`, `/components`, `/lib`, `/prisma`, `/types`, `/emails` (if using React Email later).
  - DoD: Structure documented in a `README.md` at project root.
- [ ] **0.4** Set up environment variable handling (`.env.local`, `.env.example`) and a `lib/env.ts` that validates required vars at startup (e.g. using `zod`).
  - DoD: App throws a clear error on boot if a required env var is missing.
- [ ] **0.5** Set up Postgres database (Neon or Supabase free tier) and connect Prisma.
  - DoD: `npx prisma studio` connects successfully to the live database.
- [ ] **0.6** Push project to a GitHub repo, connect to Vercel for auto-deploy on push to `main`.
  - DoD: A live Vercel preview URL loads the default homepage.

---

## Phase 1 — Data Model & Multi-Tenancy

- [ ] **1.1** Design Prisma schema for core entities: `Business` (tenant), `User` (belongs to Business, role: OWNER/DISPATCHER/TECH), `Customer`, `Job`, `Quote`, `QuoteLineItem`, `Invoice`, `ReviewRequest`.
  - DoD: `schema.prisma` written and reviewed; every table has a `businessId` foreign key (except `Business` itself) to enforce tenant isolation.
- [ ] **1.2** Run initial migration and seed script with one demo business, one owner, one tech, a few demo customers.
  - DoD: `npx prisma db seed` populates the DB; visible in Prisma Studio.
- [ ] **1.3** Build a `lib/tenant.ts` helper that scopes every DB query to the logged-in user's `businessId` (prevents cross-tenant data leaks).
  - DoD: A unit test proves a user from Business A cannot fetch Business B's records.

---

## Phase 2 — Authentication & User Management

- [ ] **2.1** Set up NextAuth.js with email/password (credentials provider) using hashed passwords (bcrypt).
  - DoD: A user can sign up, log out, log back in.
- [ ] **2.2** Build the Business signup flow: creating an account creates a new `Business` + first `User` as OWNER.
  - DoD: New signup produces a business with exactly one owner user, isolated from all other businesses.
- [ ] **2.3** Build role-based access control (OWNER can manage techs/settings; DISPATCHER can assign jobs; TECH can only see their own assigned jobs).
  - DoD: A TECH-role user is blocked (redirected/403) from admin-only routes.
- [ ] **2.4** Build "Invite a technician" flow (owner enters tech's email → invite link → tech sets password).
  - DoD: Invited tech appears in the team list and can log in.
- [ ] **2.5** Build basic account settings page (business name, logo upload, contact info).
  - DoD: Changes persist and reflect on the dashboard header.

---

## Phase 3 — Customer & Job Management

- [ ] **3.1** Build Customer CRUD (create/edit/list/search customers: name, phone, email, address).
  - DoD: Owner/dispatcher can add, edit, and search customers.
- [ ] **3.2** Build Job CRUD (a job belongs to a customer; fields: service type, address, status [NEW/QUOTED/SCHEDULED/IN_PROGRESS/COMPLETED/PAID], notes).
  - DoD: Jobs can be created against an existing customer and their status updated.
- [ ] **3.3** Build a Jobs list/board view (Kanban-style columns by status, or filterable table) for dispatchers.
  - DoD: Dispatcher can see all jobs grouped/filtered by status at a glance.
- [ ] **3.4** Build a "My Jobs" mobile-friendly view for techs (jobs assigned to them only, today/upcoming).
  - DoD: Logged in as TECH, only assigned jobs are visible, sorted by date.

---

## Phase 4 — Instant Quoting Module (Core MVP Feature #1)

- [ ] **4.1** Build a `PricingTemplate` model (business-defined line items with unit price, e.g. "AC unit install — $X per ton", "Fence — $X per linear ft").
  - DoD: Owner can create/edit pricing templates in settings.
- [ ] **4.2** Build the on-site Quote Builder screen (mobile-first): tech selects a job, adds line items from pricing templates (or custom line items), enters quantities/dimensions, sees live total calculate.
  - DoD: Tech can build a quote in under 60 seconds on a phone-sized screen; total updates live.
- [ ] **4.3** Build Quote PDF/preview generation (clean, branded with business logo, itemized breakdown, total, terms).
  - DoD: Generated quote preview looks professional and matches line items entered.
- [ ] **4.4** Build e-signature capture (canvas-based signature pad) on a customer-facing quote approval screen.
  - DoD: Customer can draw a signature on the tech's device (or via a shareable link) and it's saved with a timestamp.
- [ ] **4.5** On signature, mark Quote as SIGNED, auto-update linked Job status to SCHEDULED, and store a locked, uneditable snapshot of the signed quote.
  - DoD: Signed quotes cannot be edited afterward; job status changes automatically.
- [ ] **4.6** Send the customer a copy of the signed quote via email (and/or SMS link) automatically.
  - DoD: Customer receives an email with the PDF/link immediately after signing.

---

## Phase 5 — Dispatch & Scheduling Module (Core MVP Feature #2 — simplified for MVP)

- [ ] **5.1** Add a scheduled date/time and assigned-technician field to Job.
  - DoD: Dispatcher can assign any job to any tech with a date/time.
- [ ] **5.2** Build a calendar/day view for dispatchers showing all techs' schedules side by side.
  - DoD: Dispatcher can see, at a glance, which techs are booked when.
- [ ] **5.3** Build a simple "closest available tech" suggestion: given a job's address and each tech's last known location/next open slot, rank techs by suggested fit.
  - _MVP simplification: use zip-code/area matching or a static "service zone" per tech rather than live GPS + real routing algorithms. Full route optimization is a v2 feature._
  - DoD: When assigning a job, the UI highlights a suggested tech with a brief reason (e.g. "closest service zone, free at 2pm").
- [ ] **5.4** Send the assigned tech a notification (email or SMS) when a job is assigned/rescheduled.
  - DoD: Tech receives a notification with job details when assigned.
- [ ] **5.5** Allow techs to update job status from their device (En Route → In Progress → Completed).
  - DoD: Status updates reflect instantly on the dispatcher's board.

---

## Phase 6 — Invoicing & Payment Status

- [ ] **6.1** Auto-generate an Invoice from a signed Quote once Job status = COMPLETED.
  - DoD: Completing a job creates a linked invoice with the same line items/total.
- [ ] **6.2** Build a simple "Mark as Paid" action (manual, for MVP) with payment method note (cash/check/card).
  - DoD: Marking paid updates Invoice status and timestamps it.
- [ ] **6.3 (optional, if time allows)** Integrate Stripe Payment Links so customers can pay online; listen for Stripe webhook to auto-mark invoice paid.
  - DoD: A real Stripe test-mode payment auto-updates the invoice to PAID without manual action.

---

## Phase 7 — Automated Review Request (Core MVP Feature #3)

- [ ] **7.1** Set up Twilio account/integration in the app (`lib/twilio.ts`).
  - DoD: A test SMS can be sent successfully from the app to a real phone number.
- [ ] **7.2** Build a trigger: the moment an Invoice status changes to PAID, automatically fire an SMS to the customer with a short thank-you + direct Google Review link.
  - DoD: Marking an invoice paid (manually or via Stripe webhook) sends the SMS within seconds.
- [ ] **7.3** Add a per-business setting for the Google Review link (owner pastes their own Google Business review URL).
  - DoD: The correct business-specific review link appears in the sent SMS.
- [ ] **7.4** Log every review request sent (ReviewRequest model: job, customer, sent timestamp, delivery status from Twilio).
  - DoD: Owner can see a log/list of all review requests sent and their delivery status.
- [ ] **7.5** Add a simple delay/timing option (send immediately vs. send next morning at 9am) — optional polish.
  - DoD: Owner can toggle immediate vs. delayed sending in settings.

---

## Phase 8 — Owner Dashboard & Reporting

- [ ] **8.1** Build a dashboard home page: jobs this week, quotes pending signature, revenue this month (from paid invoices), review requests sent.
  - DoD: Dashboard loads real numbers from the DB, scoped to the logged-in business.
- [ ] **8.2** Build a simple jobs/revenue chart (weekly or monthly).
  - DoD: Chart renders correctly with real seed/test data.

---

## Phase 9 — Polish, Testing & Launch Readiness

- [ ] **9.1** Responsive/mobile QA pass on Quote Builder, Job list, and Tech "My Jobs" view (these are used in the field on phones).
  - DoD: No layout breakage at 375px width on the three field-facing screens.
- [ ] **9.2** Add basic error handling/toasts for all forms (failed saves, validation errors).
  - DoD: Every form shows a clear success/error message.
- [ ] **9.3** Add loading and empty states across all list views.
  - DoD: No blank white screens while data loads or when a list has zero items.
- [ ] **9.4** Write a minimal onboarding checklist for new businesses (add first tech, set pricing template, add Google review link) shown on first login.
  - DoD: A brand-new business account sees a clear "get started" checklist.
- [ ] **9.5** Deploy final MVP to production Vercel + production database; do a full manual end-to-end test: signup → add customer → create job → quote → sign → assign tech → complete → invoice → mark paid → review SMS sent.
  - DoD: The entire flow works start-to-finish with no manual DB edits needed.

---

## After MVP (v2 — not in this build)
- Real GPS-based route optimization across multiple jobs/day
- Native mobile app (React Native/Expo) — reuses this same Prisma/API backend
- Stripe subscription billing for the businesses using your platform (if this becomes a SaaS product)
- In-app chat between dispatcher and tech
- Customer self-service portal to view quote/invoice history
