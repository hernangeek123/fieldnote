# FieldNote

**Speak the job. Send the invoice. Get paid.**

FieldNote is a mobile-first web app for solo service businesses. Record a rough
job note, turn it into editable text, review AI suggestions against your own
price book, and create a PayPal Sandbox invoice. Prices come from the owner's
catalog, not from the model.

[Live app](https://fieldnote-lime.vercel.app) |
[Judge walkthrough](docs/JUDGE_WALKTHROUGH.md) |
[Submission checklist](docs/HACKATHON_SUBMISSION.md)

## Workflow

1. Add a customer and the services in your price book.
2. Select the customer and record, upload, or type a field note.
3. Transcribe audio and correct the text before saving a draft.
4. Generate suggested line items with AI.
5. Review catalog matches, quantities, and prices; approve the note.
6. Create a draft using PayPal Invoicing API v2.
7. Send the invoice only after a separate confirmation.

Creating a draft does not send it. The hackathon deployment uses PayPal Sandbox,
not real-money payments.

## Try the demo

Open the [sign-in page](https://fieldnote-lime.vercel.app/login). Authentication
uses an email link; open it in the same browser and profile that requested it.
Each account has its own workspace. Sample customers and prices are not
automatically copied into new accounts.

The [walkthrough](docs/JUDGE_WALKTHROUGH.md) includes a small plumbing price book,
a sample note, and a $320 expected invoice after review. Judge email delivery and
the complete production workflow still need a fresh pre-submission test. See the
submission checklist for the access preflight; no shared credentials or secrets
are published here.

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS
- Supabase Postgres and passwordless Auth
- Vercel AI Gateway with OpenAI transcription and structured output
- PayPal Invoicing API v2
- Vercel hosting

## Local development

Use Node.js 24 and npm. Clone the repository, then install the locked dependencies:

```bash
git clone https://github.com/hernangeek123/fieldnote.git
cd fieldnote
npm ci
cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.
Fill in the values below before running:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). While this repository is
private, cloning requires repository access.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `NEXT_PUBLIC_SITE_URL` | App origin; `http://localhost:3000` locally |
| `PAYPAL_CLIENT_ID` | Sandbox REST app client ID; server only |
| `PAYPAL_CLIENT_SECRET` | Sandbox REST app secret; server only |
| `PAYPAL_API_BASE` | Keep `https://api-m.sandbox.paypal.com` |
| `PAYPAL_BUSINESS_NAME` | Merchant name on draft invoices |
| `AI_GATEWAY_API_KEY` | Local AI Gateway authentication, unless using Vercel OIDC |
| `AI_GATEWAY_MODEL` | Extraction model; defaults to `openai/gpt-5.4-mini` |
| `AI_GATEWAY_TRANSCRIPTION_MODEL` | Defaults to `openai/gpt-4o-mini-transcribe` |

Real credentials belong in uncommitted `.env.local` or the deployment's server
environment. Never publish PayPal secrets, gateway keys, or Supabase service-role
keys. Only the Supabase project URL, publishable key, and site URL use the
`NEXT_PUBLIC_` prefix.

### Supabase

1. Create a dedicated project and enable email sign-in.
2. Apply all SQL files in [supabase/migrations](supabase/migrations) in filename
   order: foundation, foreign-key indexes, then PayPal invoices.
3. Set the project URL and publishable key in your environment.
4. Set the Auth site URL to your app origin and allow
   `http://localhost:3000/auth/callback` for local development.
5. For the hosted app, allow
   `https://fieldnote-lime.vercel.app/auth/callback` and use the hosted origin as
   the site URL. Use your own domain when deploying a separate copy.
6. Verify email delivery to a new tester before sharing access. Configure
   appropriate email delivery or approved test recipients if the project's mail
   configuration limits who can receive sign-in links.

Database row-level security restricts customers, catalog items, notes, line
items, and invoice records to their owner. Customer selection is manual; AI does
not choose the invoice recipient.

### PayPal Sandbox

Create a Sandbox REST app in the
[PayPal developer dashboard](https://developer.paypal.com/dashboard/). Its
Sandbox business account is the merchant. Configure the client ID and secret in
the server environment and keep the Sandbox API base.

Use a Sandbox Personal account as the test invoice recipient. To inspect a
merchant invoice, sign in to [PayPal Sandbox](https://sandbox.paypal.com) with the
associated Sandbox business account, not your developer account credentials.
Do not use real customer data or switch this demo to live credentials.

### AI Gateway

Vercel deployments use OIDC when enabled for the project. For local development,
use Vercel's linked project environment with a current OIDC token, or configure
an uncommitted `AI_GATEWAY_API_KEY`. Ensure the gateway account can fund the
selected models. No direct OpenAI key is required by this implementation.

### Deploying a separate copy

Import the repository into Vercel, configure the variables above, enable OIDC if
using it instead of a gateway key, and deploy. Update `NEXT_PUBLIC_SITE_URL` and
Supabase Auth's site URL and callback allowlist to that deployment's origin.
Verify sign-in before running the invoice walkthrough.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

There is currently no automated end-to-end test suite. Use the walkthrough for
production acceptance testing; successful deployment alone does not establish
that authentication, AI, and PayPal work together.

## Current limits

- USD invoices; no tax, discount, or multi-currency interface.
- Browser recordings stop at two minutes; audio uploads must be at most 4 MB.
- AI output can be uncertain and always needs owner review.
- Sending is supported, but payment-status webhooks and automatic paid-status
  updates are not implemented.
- Shared judge accounts, one-click sample-data provisioning, and general email
  delivery readiness have not yet been verified for submission.

## License

[MIT](LICENSE). Third-party dependencies remain covered by their own licenses.
