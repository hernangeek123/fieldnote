# FieldNote Devpost Draft

Updated November 2, 2026. This is editable submission copy, not a published
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
Supabase provides Google sign-in, email-link authentication, and Postgres, with row-level
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

Google sign-in and sign-out were verified on the hosted app with an existing
second account outside Google's test-user list, preserving its workspace.

Regression and rollback-only database tests cover invoice safeguards, webhook
handling, and ownership protection. Browser viewport checks cover narrow layouts;
they are not a substitute for physical-phone testing.

## What We Learned

AI is most useful here when it reduces interpretation work while leaving business
decisions visible. Human review, clear invoice states, safe retries, and accurate
recipient handling matter as much as generating the initial suggestions.

## What's Next

Before submission, finish physical-phone acceptance and a completely new Google
account's setup and sample draft test. Future work could include general email
delivery, tax and discount support, additional currencies, and better draft recovery.
These are planned improvements, not current capabilities.

## Built With

Next.js, React, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Vercel,
Vercel AI Gateway, OpenAI, PayPal Invoicing API v2.

## Links And Testing Instructions

- App: https://fieldnote-lime.vercel.app
- Repository: https://github.com/hernangeek123/fieldnote (private until owner-approved publication).
- Video: pending recording and owner-approved public YouTube upload.
- Judge instructions: [JUDGE_INSTRUCTIONS.md](JUDGE_INSTRUCTIONS.md).
- Technical setup: [README.md](../README.md). Dated verification: [JUDGE_WALKTHROUGH.md](JUDGE_WALKTHROUGH.md).

### Testing Instructions For The Submission Form

Open https://fieldnote-lime.vercel.app/login and choose **Continue with Google**
using your own Google account. Google may display
`hhawqwpdljfdookbzagz.supabase.co`, FieldNote's authentication service. Consent
requests name, email, and profile picture. Use Google rather than the email-link
option; general email delivery is not configured.

Your account has an isolated workspace with no automatic sample data. In
**Customers**, add **Demo Plumbing Customer**, using
`sb-jhla153143388@personal.example.com` as the synthetic PayPal Sandbox recipient.
Leave phone and address blank. In **Price book**, add **Chrome kitchen faucet**
at **$120.00 per each**, **Supply line** at **$15.00 per each**, and **Plumbing
labor** at **$85.00 per hour**.

Choose **New note**, select the customer, and record this example:
"Replaced the kitchen faucet. Used one chrome kitchen faucet and two supply
lines. Completed two hours of plumbing labor." Stop and transcribe the recording,
correct the text, and choose **Save draft**. You can also upload short audio or
type the example to exercise the text path.

Choose **Generate with AI** and review all rows. The expected reviewed quantities
are one faucet, two supply lines, and two hours of labor, totaling **USD 320.00**.
Correct suggestions if needed, choose **Approve note**, then **Create PayPal
draft**. Check the recipient, invoice number, draft status, and total in
FieldNote. **Refresh status** and reload should preserve the invoice number and
locked review. Stop here for the main test; creating a draft does not send it
and requires no PayPal login.

Optional sending/payment uses a new invoice addressed to a Sandbox Personal
buyer you control. **Send invoice** asks for confirmation; **View payment page**
opens checkout after sending. Use Sandbox test funds. Reload FieldNote afterward
to inspect paid status; **Refresh status** is manual reconciliation. Detailed
steps and troubleshooting are in the repository's judge instructions. For access
problems, contact the submitter through Devpost with the visible error.

### Submission Preflight

This copy is prepared, not posted to Devpost. Google login was verified with an
existing second account outside Google's test-user list; a brand-new account's
complete setup run and physical-phone acceptance remain pending. Confirm those
results, add the final public repository/video links, and review before submission.
