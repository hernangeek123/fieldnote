# FieldNote Devpost Draft

Prepared October 10, 2026. This is editable submission copy, not a published
entry. Verify the final wording against the footage and acceptance record.

## Project Name

FieldNote

## Elevator Pitch

Speak the job. Review the details. Send a PayPal invoice. FieldNote turns rough
field notes into price-book-linked invoice suggestions for solo service businesses.

## Inspiration

For a solo service professional, finishing the physical job is not the end of
the work. Notes about materials and labor still need to become an invoice.
FieldNote explores a simple question: can the contractor describe the job while
it is fresh, then turn that description into a bill without surrendering control
over prices, quantities, or the customer who receives it?

## What It Does

FieldNote is a mobile-first web app for capturing work and preparing invoices.
Users maintain their own customers and price book, then record, upload, or type
a rough job note. Audio transcription produces text they can correct before
saving. AI suggests line items and catalog matches for human review.

The user checks descriptions, quantities, and prices before approving the note.
FieldNote then creates a PayPal Sandbox invoice draft. Sending requires a
separate confirmation. Verified PayPal webhooks update invoice status, including
paid status after a Sandbox buyer completes checkout.

Customer and service editors keep the workspace useful as a business changes.
Services can be deactivated without changing saved line-item prices. An existing
PayPal invoice retains its reserved data and recipient even if the customer or
price book changes later. Each signed-in account has an isolated workspace.

## How We Built It

The application uses Next.js App Router, React, TypeScript, and Tailwind CSS.
Supabase provides passwordless authentication and Postgres, with row-level
security enforcing record ownership. Server-side application actions handle
authenticated mutations and invoice operations.

Vercel AI Gateway connects the app to OpenAI transcription and structured
extraction models. The verified hosted extraction configuration uses GPT-4.1
Mini; transcription uses GPT-4o Mini Transcribe. AI output is treated as a
suggestion, not authorization to invoice. The user selects the customer and
reviews the result against the business's own catalog.

PayPal Invoicing API v2 supplies Sandbox draft creation and sending. Stable
request IDs and reserved invoice data support retries. The webhook endpoint
verifies PayPal notifications before privileged status updates. Vercel hosts
the web application and server-side routes.

## Challenges

The difficult part was keeping a useful AI-assisted workflow predictable at the
boundaries. A transcript may need correction; a catalog match may be uncertain;
a payment request may have an ambiguous network result. We added explicit review
and approval, stable invoice reservations, send reconciliation, and verified
webhook processing rather than treating every request as an immediate success.

We also tested what happens when users change data later. Saved invoice details
must not silently change when a customer email or catalog price is edited.
Timestamp checks reject stale editor updates, and failed saves preserve input.

## Accomplishments

We verified a hosted second-account workflow from audio upload through live
transcription, AI extraction, human approval, PayPal Sandbox draft creation,
owner-confirmed sending and payment, and automatic paid-status sync. A separate
desktop microphone recording was transcribed and its text saved. Hosted editing
checks preserved the original paid invoice while customer and catalog details
were temporarily changed and restored.

Regression and rollback-only database tests cover invoice safeguards, webhook
handling, and ownership protection. Browser viewport checks cover narrow layouts;
they are not a substitute for physical-phone testing.

## What We Learned

AI is most useful here when it reduces interpretation work while leaving business
decisions visible. Human review, clear invoice states, safe retries, and accurate
recipient handling matter as much as generating the initial suggestions.

## What's Next

Before submission, finish physical-phone acceptance and general judge sign-in
email delivery. Future work could include
tax and discount support, additional currencies, and better draft recovery.
These are planned improvements, not current capabilities.

## Built With

Next.js, React, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Vercel,
Vercel AI Gateway, OpenAI, PayPal Invoicing API v2.

## Links And Testing Instructions

- App: https://fieldnote-lime.vercel.app
- Repository: https://github.com/hernangeek123/fieldnote (private until owner-approved publication).
- Video: pending recording and owner-approved public YouTube upload.
- Detailed setup and sample USD 320.00 job: README.md and JUDGE_WALKTHROUGH.md.

Judge-access text is not ready for publication. Custom SMTP is not configured;
unrelated judges cannot yet be assumed to receive sign-in links. Once configured
and tested, explain email-link sign-in in the same browser/profile and the
isolated empty workspace. Supply any necessary controlled Sandbox testing access
through an approved private channel, never public production secrets or personal
mailbox credentials. Do not submit until a judge can actually test the build.
