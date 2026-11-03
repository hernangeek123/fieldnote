# Physical-Phone Acceptance

Status: pending. Desktop responsive viewport checks passed, but do not certify
microphone permission, device audio formats, the virtual keyboard, or mobile
browser lifecycle behavior.

## Setup

Use a phone you control and synthetic demo data. Record the phone model, OS,
browser/version, date, and tested deployment. Open the hosted app, not localhost.
Choose **Continue with Google** and use an existing owner-controlled test account
to inspect its prepared sample data. Consent requests name, email, and profile
information for FieldNote's Supabase service. General email delivery is not the
test route. For a fresh workspace, follow [the judge instructions](JUDGE_INSTRUCTIONS.md)
to add the sample customer and price book. Do not share sign-in links or passwords.

## Capture And Review

Use the footer's **Appearance** selector to check Light, Dark, and System. Confirm
text, fields, status badges, and the selector fit in each mode. Reload after an
explicit choice to check it persists when browser storage is enabled.

1. Open Customers and Price book. Check that contact details, prices, and pencil
   buttons fit without sideways scrolling. Open an editor, then cancel without
   saving so the demo data stays unchanged.
2. Open New note and select Demo Plumbing Customer. Allow the microphone only
   when intentionally recording for FieldNote.
3. Record the sample job from DEMO_SCRIPT.md, stop, and play it back. Confirm
   speech is audible and the duration looks reasonable.
4. Transcribe it. Open the keyboard and correct a word. Check that the field,
   recording controls, and Save draft button remain reachable.
5. Try a workspace link, then Keep editing. Confirm text and the audio player
   remain. Browser close/refresh warnings are platform-dependent, not autosave.
6. Save the draft. Reopen it from Notes and reload. Confirm the customer, date,
   and transcript persisted. Raw audio is not stored with the transcript.
7. Generate with AI and check the catalog matches. Correct quantities and prices
   to the sample's reviewed USD 320.00 total. Save review changes if needed.

## Invoice Inspection

Open the existing paid Sandbox note and check that its badge, total, invoice
links, and locked line items fit. Do not create, send, or pay another invoice as
part of this phone-layout test. A new phone-captured note can remain a draft.

An optional full phone checkout is a separate owner-authorized Sandbox test.
Never use real customer details, live PayPal credentials, or real-money payment.

## Result Record

| Check | Result / evidence |
| --- | --- |
| Device, OS, browser, deployment | Pending |
| Phone sign-in | Pending |
| Light / Dark / System, readability and saved choice | Pending |
| Customer and price-book editors | Pending |
| Microphone capture and playback | Pending |
| Live transcription | Pending |
| Keyboard editing and navigation cancellation | Pending |
| Draft persistence after reload | Pending |
| AI extraction and review controls | Pending |
| Existing paid-invoice layout | Pending |

Keep screenshots free of credentials and private customer data. Record failures
as failures, with the exact step and visible message; do not substitute desktop
viewport evidence for an untested device step.
