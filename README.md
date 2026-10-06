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

## PayPal setup

Create a PayPal Sandbox REST app and set `PAYPAL_CLIENT_ID` and
`PAYPAL_CLIENT_SECRET` in the server environment. Keep
`PAYPAL_API_BASE=https://api-m.sandbox.paypal.com` for development and the
hackathon demo. `PAYPAL_BUSINESS_NAME` controls the merchant name shown on new
invoice drafts.

FieldNote creates a PayPal draft first. Sending the invoice is a separate,
confirmed action so creating a draft never emails the customer.

## Supabase setup

1. Create a dedicated Supabase project for FieldNote.
2. Run the migration in `supabase/migrations` against that project.
3. Add the project URL and publishable key to `.env.local`.
4. In Supabase Auth URL Configuration, add `http://localhost:3000/auth/callback`
   as an allowed redirect URL for local development.

The browser only receives the Supabase publishable key. Database row-level
security restricts customers, catalog items, notes, and line items to their
owner.

## AI setup

FieldNote uses Vercel AI Gateway and structured outputs. Vercel deployments
authenticate with OIDC automatically. For local development, link the Vercel
project and pull its environment, or set an uncommitted `AI_GATEWAY_API_KEY`.
The model defaults to `openai/gpt-5.4-mini` and can be changed with
`AI_GATEWAY_MODEL`.

## Current milestone

- Passwordless email authentication and protected workspace
- Customer and price catalog creation
- Manual field-note drafts
- AI-generated price-book suggestions with review flags
- Editable line-item review with price-book matching and approval
- PayPal Sandbox invoice creation and sending
- Per-user row-level security

Voice capture and payment-status webhooks are the next milestones.
