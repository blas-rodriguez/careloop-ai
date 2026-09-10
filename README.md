# CareLoop AI

AI-powered post-care follow-up for clinics. CareLoop schedules consented phone calls after a consultation, captures structured patient-reported outcomes, routes concerns to clinic staff, and helps coordinate a new appointment when requested.

> CareLoop does not diagnose, prescribe, or replace clinical judgment. It is not an emergency service.

## Demo scope

The current first milestone includes:

- Hackathon-ready operations dashboard
- Patient list and detailed patient timeline
- Follow-up queue and visual outcome states
- Supabase schema, RLS policies, and fictional seed data
- Supabase email/password authentication with cookie-based SSR sessions
- Provider-neutral call interface with a safe mock implementation and an opt-in CALL-E REST adapter
- Responsive Next.js UI

Authenticated pages read isolated workspace records from Supabase. The public showcase is read-only and uses fictional presentation data. Live CALL-E execution remains opt-in and must use a supported destination, explicit consent, and server-side credentials.

## Stack

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- Supabase (Postgres, Auth, Row-Level Security)
- Recharts
- Vercel

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To connect Supabase, fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Create a demo staff account from the login page and confirm its email before signing in.

## Database

The initial schema lives in `supabase/migrations` and fictional records live in `supabase/seed.sql`. With a linked Supabase project, apply migrations using the Supabase CLI workflow appropriate to your environment.

Never add real patient data to demo or development environments.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Call-provider safety

`src/lib/calls/provider.ts` defaults to a mock provider. A real call must only be enabled after:

1. The patient has explicitly consented to automated calls.
2. Credentials and webhook verification are configured.
3. The script clearly identifies the automated system.
4. Medical and emergency boundaries are present in the prompt and UI.

The spoken language follows `CALL_E_LOCALE`: locales beginning with `en` use
English; all other configured locales use Spanish. For the official
English-language US test hotline, temporarily set `CALL_E_REGION=US` and
`CALL_E_LOCALE=en-US`, then return to mock mode after verification.

## License

MIT
