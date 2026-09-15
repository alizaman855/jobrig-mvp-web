# Jobrig MVP

A multi-tenant web app for local service businesses (HVAC, plumbing, roofing, electrical, land clearing) covering instant on-site quoting with e-signature, job dispatch & scheduling, and automated post-payment review requests.

See [JOBRIG_MVP_TASKS.md](./JOBRIG_MVP_TASKS.md) for the full build spec and phase-by-phase task list.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- PostgreSQL + Prisma ORM
- NextAuth.js (Phase 2)
- Twilio for SMS (Phase 7)
- Vercel for hosting, Neon/Supabase for hosted Postgres

## Project structure

```
app/            Next.js App Router routes, layouts, and pages
components/     React components
  ui/           shadcn/ui primitives (generated, don't hand-edit)
lib/            Shared utilities, server helpers, env validation, tenant scoping
  env.ts        Validates required env vars at boot (see instrumentation.ts)
  db.ts         Prisma client singleton (uses the pg driver adapter)
  tenant.ts     forTenant({ businessId }) — the only sanctioned way to query tenant-scoped models
prisma/         Prisma schema, migrations, seed script
types/          Shared TypeScript types
emails/         Transactional email templates
instrumentation.ts   Runs once on server boot — validates required env vars
```

## Getting started

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL`.
2. Install dependencies: `npm install --legacy-peer-deps` (a known npm/arborist bug in this environment requires `--legacy-peer-deps`; see note below).
3. Apply migrations: `npx prisma migrate dev`
4. Seed demo data (one business, one owner, one tech, a few customers): `npx prisma db seed`
5. Run the dev server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000).

Demo login (once auth ships in Phase 2): `owner@acmehvac.test` / `password123` (owner), `tech@acmehvac.test` / `password123` (tech).

Run tests with `npm test` (Vitest). `lib/tenant.test.ts` proves cross-tenant data isolation against a real database — it creates and cleans up its own throwaway businesses.

### Note on installs

`npm install` without `--legacy-peer-deps` currently fails with `Cannot read properties of null (reading 'edgesOut')` due to an npm arborist bug triggered by this dependency graph. Always pass `--legacy-peer-deps` when adding packages.

## Environment variables

Required vars are validated at server boot via `lib/env.ts` (invoked from `instrumentation.ts`). The app throws a clear error immediately if a required var is missing. See `.env.example` for the full list.
