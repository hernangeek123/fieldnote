# FieldNote

**Speak the job. Send the invoice. Get paid.**

FieldNote is a mobile-first web app for solo service businesses. A contractor
records a rough field note, reviews AI-structured line items matched against
their own price list, and creates a PayPal sandbox invoice draft.

## Planned workflow

1. Record a field note from a phone or desktop browser.
2. Transcribe the recording.
3. Extract services, quantities, customer details, and uncertainties.
4. Match services against the business-owned price catalog.
5. Require the owner to review and approve the result.
6. Create a draft with PayPal Invoicing API v2.
7. Send the invoice only after a separate owner confirmation.

## Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS
- Supabase Postgres and Auth
- OpenAI transcription and structured outputs
- PayPal Invoicing API v2
- Vercel deployment

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Real credentials belong in `.env.local` and must never be committed.

## Supabase setup

1. Create a dedicated Supabase project for FieldNote.
2. Run the migration in `supabase/migrations` against that project.
3. Add the project URL and publishable key to `.env.local`.
4. In Supabase Auth URL Configuration, add `http://localhost:3000/auth/callback`
   as an allowed redirect URL for local development.

The browser only receives the Supabase publishable key. Database row-level
security restricts customers, catalog items, notes, and line items to their
owner.

## Current milestone

- Passwordless email authentication and protected workspace
- Customer and price catalog creation
- Manual field-note drafts
- Per-user row-level security

Voice capture, AI extraction, and PayPal invoice creation are the next milestones.
