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
