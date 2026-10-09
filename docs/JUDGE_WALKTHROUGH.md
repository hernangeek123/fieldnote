# FieldNote Judge Walkthrough

This is a reproducible acceptance-test recipe, not a claim that every step has
already passed in production. All invoices in this walkthrough use PayPal
Sandbox; there are no real-money payments.

## Access

Open [FieldNote](https://fieldnote-lime.vercel.app/login) and request an email
sign-in link. Open the latest link in the same browser and profile. A new account
starts with an isolated workspace, not the owner's sample data.

Before submission, the owner must verify delivery to an unrelated test email
address. If access requires an approved recipient or a dedicated judge account,
provide the approved access method in Devpost's testing instructions. Do not
publish mailbox passwords, API secrets, or a sign-in link in this repository.
Hosted judge access is not yet certified by this checklist.

## Sample Customer

In **Customers**, add a customer named **Demo Plumbing Customer**. For the email,
use a PayPal Sandbox Personal account you control. Phone and service address may
be left blank. Do not use a real customer's details.

The sign-in email belongs to the FieldNote tester; the customer email belongs to
the Sandbox invoice recipient. They serve different purposes.

## Sample Price Book

In **Price book**, add these services with the exact names and prices:

| Service name | Price | Per |
| --- | ---: | --- |
| Chrome kitchen faucet | $120.00 | each |
| Supply line | $15.00 | each |
| Plumbing labor | $85.00 | hour |

Existing accounts may already have services. For this example, select the entries
above during review rather than similarly named entries at different prices.

## Capture And Review

1. Open **New field note**, select **Demo Plumbing Customer**, and use today's date.
2. Choose **Record note**, allow microphone access, and speak the example below;
   then choose **Stop recording**. Alternatively, upload a short supported audio
   file under 4 MB.
3. Choose **Transcribe recording**. Listen to the audio and correct the resulting
   text, particularly the quantities.
4. Choose **Save draft**. A successful save opens the saved note with a success
   notice. If saving fails, correct the error or retry in the same capture form.
5. Choose **Generate with AI**.
6. Review every row. If an item is unmatched or flagged, choose its price-book
   entry and correct its description, quantity, and price.
7. Save the review if needed, then choose the approval action.

Example note:

> Replaced the kitchen faucet. Used one chrome kitchen faucet and two supply
> lines. Completed two hours of plumbing labor.

The expected reviewed rows are:

| Item | Quantity | Unit price | Line total |
| --- | ---: | ---: | ---: |
| Chrome kitchen faucet | 1 | $120.00 | $120.00 |
| Supply line | 2 | $15.00 | $30.00 |
| Plumbing labor | 2 | $85.00 | $170.00 |
| **Total** | | | **$320.00** |

AI suggestions may vary; the table is the human-reviewed target, not a promised
deterministic model response. Typing the example is a fallback for microphone
problems, but does not count as testing transcription.

## PayPal Draft

1. After approval, use the PayPal panel to create the Sandbox invoice draft.
2. Confirm an invoice ID and **DRAFT** status appear.
3. Open the invoice in PayPal using the Sandbox merchant account. Check the
   recipient, three reviewed items, USD currency, and $320.00 total.
4. Refresh the FieldNote note. The same invoice ID should remain; no second draft
   should be created and the review editor should be locked.
5. Return to the workspace and confirm the saved note is still present.

Creating a draft should not send the invoice. The note remains reviewed at this
stage; it becomes invoiced after sending. Keep **Send** untouched during a
draft-only acceptance test.

## Optional Send Test

Use only the controlled Sandbox recipient. Choose **Send**, cancel the first
confirmation, and check that the draft remains unchanged. Then choose **Send**
again and confirm. Verify the invoice's resulting status in PayPal and the
note's invoiced state in FieldNote.

Sending invokes PayPal's Sandbox delivery flow. Do not present this as a real
customer receiving a live invoice. Automatic payment-status updates require a
configured and verified webhook. Use **Refresh
status** to reconcile the invoice manually, and inspect payment results in PayPal
if testing Sandbox payment.

## Acceptance Record

For each run, record the date, deployment/commit, browser, outcome, and redacted
evidence. Do not include email links, access tokens, passwords, or customer PII.

- [ ] New tester can receive a sign-in link and enter the workspace.
- [ ] Customer and price-book entries persist after reload.
- [x] Recording or upload produces an editable transcript (synthetic WAV upload and owner-recorded microphone WebM both verified).
- [x] Saved note preserves the selected customer and corrected text.
- [x] AI suggestions match the catalog or clearly require review (October 9 GPT-4.1 Mini retry).
- [x] Review persists and the approved total is $320.00.
- [x] PayPal Sandbox draft matches the reviewed data.
- [x] Refresh preserves one invoice ID and locks the review editor.
- [x] Workspace shows the saved note and correct state.
- [x] Optional confirmed send succeeds (user completed the confirmation; agent verified the result).
- [x] Sandbox payment completes and a verified PAID webhook updates FieldNote before manual status refresh.
- [ ] Send cancellation does not send (native-dialog automation was interrupted; not independently certified).
- [ ] A second account cannot view the first account's records.
- [x] Checked desktop and mobile views are usable without clipped controls (Chrome viewport checks, not physical-device certification).

Prior verification run, October 7, 2026: production deployment was reported
READY, and a connector fetch of the sign-in page returned HTTP 200. Local terminal
and browser-control startup failed, so this session did not execute the complete
workflow, verify new-tester email delivery, or create/send an invoice. The boxes
above were intentionally left unchecked at that time.

Invoice safeguards and status-sync implementation checks: 16 local regression
tests, rollback-only database checks, lint, TypeScript, and the production build
passed. Browser control remained unavailable, so authenticated end-to-end flows
and real Sandbox webhook delivery still require verification. The implementation
is now deployed and its Sandbox webhook is configured; hosted HTTP checks passed.
Later backend checks passed all 20 regression tests and recorded actual signed
Sandbox CREATED, UPDATED, SENT, and PAID events. After the buyer completed checkout,
read-only checks confirmed USD 320.00 paid, USD 0.00 due, and automatic PAID status
in FieldNote before any manual refresh. The owner subsequently confirmed the
displayed result. The full authenticated browser flow and manual-refresh parity
remain pending. See `INVOICE_STATUS_SYNC.md` for the detailed test record.

### October 9 Verification

- Production commit `a525931` is READY on the public FieldNote alias.
- All 20 regression tests and four hosted HTTP checks passed. Lint and the
  production build, including TypeScript, passed.
- Both rollback-only database suites passed. The added workflow suite checks
  customer/catalog/note readback, the three-item USD 320.00 review, approval reset
  through the application's review RPC, stable reservations, and cross-owner
  reads/writes. Its alternate subject is simulated; it does not test a browser
  session or replace live AI extraction.
- The existing paid Sandbox invoice remains PAID, with one verified PAID event.
- A second owner-controlled account was created and successfully authenticated
  on October 9, confirmed through Auth records. It initially had no customers,
  catalog entries, or notes. Mailbox delivery and the rendered workspace were
  not directly observed by the agent.
- One Demo Plumbing Customer, using the controlled Sandbox buyer, and the three
  price-book entries above were added only to that account. The seed is
  idempotent. No note or invoice was created for it, and no email was sent by
  the verification scripts.
- Browser control failed before startup. Recording, live transcription, live AI
  extraction, review UI, mobile layout, and the full new-tester invoice flow
  remain unverified in this session. Local AI credentials were absent; this does
  not establish that hosted AI is unconfigured.

Next browser step: reload the second account, open **New field note**, choose
**Demo Plumbing Customer**, record the example, transcribe it, and save the draft.
Continue from **Capture And Review** above. Keep all payment testing in Sandbox.

### October 9 Browser Retry

Browser control recovered. In Chrome, the agent observed the signed-in second
account, the Sandbox customer, and all three exact catalog prices. The account
had no notes before this run.

A 439,844-byte WAV generated with Windows text-to-speech was uploaded through
FieldNote's audio chooser. Live transcription returned the job description with
the correct quantities; "Replace" was corrected to "Replaced" in the editable
transcript. The draft was saved through the UI and reopened from the Notes list.
Customer, date, and corrected text persisted. This verifies audio upload and live
transcription, not microphone recording or recognition of a human speaker.

Saved note: `eb4eba07-844a-4b9c-b20f-e1aa290924e3`.

The subsequent **Generate with AI** action failed safely without changing stored
line items. Production logs reported that free-tier users do not have access to
the selected model and must add paid AI Gateway credits. Transcription access
does not establish access to the extraction model. No credits were purchased,
model configuration changed, review approved, or new invoice created/sent.

Verification stopped at this boundary. Resume AI extraction from the saved draft
after the owner resolves model access. Full review, invoice creation, and payment
for this second-account browser run remain pending.

### October 9 Free-Credit Model Retry

The owner authorized trying a credit-eligible extraction model without buying
credits. Vercel's model directory identified `openai/gpt-4.1-mini` as eligible
for Free AI Gateway Credit, with structured output support and no prompt
training. The existing `AI_GATEWAY_MODEL` environment variable was changed to
that model, preserving its production, preview, and development targets.
Transcription, PayPal credentials, authentication, and budgets were unchanged.

Production redeployment `dpl_C4oBvrV4mb2rTyvzoZdBDMETXJLn` reached READY on
`fieldnote-lime.vercel.app`, using the same source commit `a525931`. In Chrome,
**Generate with AI** on the saved note returned three matched catalog rows:
one Chrome kitchen faucet at USD 120.00, two Supply lines at USD 15.00 each,
and two hours of Plumbing labor at USD 85.00 each. The total was USD 320.00.
All three rows and prices persisted after reloading the page. The new
deployment's recent runtime error scan returned no errors.

The note remains a draft awaiting human approval. No new invoice was created,
sent, or paid, and no credits were purchased. This verifies one live structured
extraction using the available credit allowance, not unlimited free access or
general extraction accuracy. Full review approval and the second-account
invoice flow remain pending.

### October 9 Approved Sandbox Draft

On the same production deployment, the owner authorized review and Sandbox
draft creation. The agent checked the three rows against the original note and
catalog, then chose **Approve note** in Chrome. FieldNote displayed
**Field note approved** and the note became `reviewed` at USD 320.00.

**Create PayPal draft** created `INV2-S3G4-2VKF-QPR7-ALZB`, invoice number
`FN-eb4eba07844a4b9cb20f`. A read-only PayPal Sandbox API check confirmed `DRAFT`,
USD currency, the controlled Sandbox buyer, and the correct three item names,
quantities, and unit prices. Total and amount due were both USD 320.00, with
no paid amount returned.

The agent used **Refresh status** and reloaded the note. The same PayPal ID
remained, the invoice was still a draft, and all line-item controls were locked.
Read-only database checks confirmed exactly one invoice record for this note
and its `reviewed` state. The workspace overview showed one field note with the
correct customer, original text, and reviewed badge. The deployment's recent
runtime error scan returned no errors.

**Send invoice** was not used. No invoice email or payment was initiated.
The fresh-account upload, live transcription, AI extraction, review approval,
and Sandbox draft workflow have now passed. Microphone recording, mobile layout,
and send/payment for this new invoice remain untested.

### October 9 Sandbox Send

The owner authorized the Sandbox send/payment test. Browser automation opened
the native send confirmation but could not reliably control it. No successful
cancel action was established by those attempts. The agent handed the
confirmation to the owner, who reported **Sent successfully**.

The agent then directly observed **Invoice sent through PayPal Sandbox**,
invoice status `sent`, note state `invoiced`, and locked line items in Chrome.
A read-only PayPal API check confirmed `INV2-S3G4-2VKF-QPR7-ALZB` was `SENT`,
with USD 320.00 total and USD 320.00 due. The database retained exactly one
invoice record and recorded a verified `INVOICING.INVOICE.SENT` event at
`2026-10-09T18:00:34.751704Z`. Recent deployment error logs were empty.

The recipient payment page was opened and displayed the correct Sandbox buyer,
invoice number, three line items, and USD 320.00 due. Payment was handed to the
owner; the agent did not pay or initiate a live transaction. Payment and the
new invoice's PAID webhook verification remain pending. Do not infer mailbox
delivery or successful cancellation from the observed SENT state.

### October 9 Sandbox Payment

The owner completed checkout and reported **paid**. A read-only PayPal Sandbox
API request confirmed invoice `INV2-S3G4-2VKF-QPR7-ALZB` was `PAID`, with
USD 320.00 paid and USD 0.00 due. Before any **Refresh status** action, a
read-only database query showed invoice status `PAID`, note state `invoiced`,
exactly one invoice record, and a verified `INVOICING.INVOICE.PAID` event
received at `2026-10-09T18:07:47.362196Z`.

The agent reloaded the FieldNote page without choosing **Refresh status**.
Chrome displayed the `paid` invoice badge and locked line items at USD 320.00.
A screenshot was saved outside the repository. The deployment's recent error
scan returned no errors.

The fresh-account workflow is verified from synthetic audio upload through
live transcription, AI extraction, approval, Sandbox draft creation, owner-
confirmed sending and payment, and automatic PAID status sync. This is not a
live-money payment test. Microphone recording, mobile layout, mailbox delivery,
and independent confirmation of send cancellation remain outside this proof.

### October 9 Responsive Checks

Chrome viewport checks covered the overview, Customers, Price book, Notes,
new-note capture form, and paid-note review. Narrow-phone testing at 320 pixels
found that a long customer email forced the Customers grid wider than the
screen. The customer sections now allow shrinking, and names and contact
details wrap within their available width; contact icons retain their size.

The scoped customer-page fix was deployed from reviewed local source through
Vercel as `dpl_GVbKQxKx24K37KAhbfHVGM2rCz4o`, READY on the production alias.
This deployment includes an uncommitted layout change over `a525931`; do not
treat the base commit alone as its exact source. No credentials or local
environment files were uploaded. AI and PayPal configuration were unchanged.

After deployment, Customers had no horizontal overflow at 320, 390, or 1280
pixels, and screenshots showed the complete email within the list. The other
checked mobile pages had no horizontal overflow, the bottom navigation worked,
and the capture buttons, catalog prices, and paid-state badge were visible.
These are browser viewport checks, not tests on a physical phone or its virtual
keyboard. Temporary viewport overrides were reset.

All 20 regression tests, four hosted HTTP checks, lint, and the production build
including TypeScript passed. Recent runtime error logs were empty. A new-note
form with the sample customer selected was left open for an owner-recorded
microphone sample. No recording was started, transcript submitted, or new draft
saved by the agent during responsive testing. Real microphone verification
remains pending until the owner captures the sample and live transcription is
checked.

### October 9 Real Microphone Sample

The owner used **Record note** and **Stop recording** in Chrome and reported
that the audio player was visible. The agent observed `field-note.webm`,
approximately 202 KB, with an audio duration of 12.779 seconds, a ready audio
element, and no playback error. **Transcribe recording** returned editable
text through the live transcription service:

> Replace the leaking kitchen faucet for Maria. Use one chrome fixture and
> two supply lines. Two hours of labor.

The returned wording differed from the earlier exact-catalog sample, but
contained the expected one fixture, two supply lines, and two hours of labor.
The agent preserved it as returned rather than replacing it with the scripted
sample. The audio itself was not independently listened to or archived.

The page navigated to Price book before **Save draft** could be used, and the
Notes list still contained only the paid test note. The agent restored the
exact observed transcript into a new form with the sample customer, saved it,
reopened it from Notes, and reloaded it. Customer, date, and text persisted in
draft `ae644b82-7975-4938-8599-a29c394f628c`. This proves live microphone capture
and transcription, plus subsequent transcript persistence; saving directly
from that original audio session was interrupted by navigation. At the time of
this test, unsaved audio and transcript were lost when leaving the capture form;
the navigation warning added afterward is documented below.

The new draft was not run through AI extraction, approved, or invoiced. The
existing paid invoice was unchanged. A screenshot of the reopened draft was
saved outside the repository. Real microphone testing was performed in desktop
Chrome, not on a physical mobile device.

### October 9 Unsaved Capture Protection

The new-note form now marks unsaved text, selected audio, active recording,
customer selection, and an edited job date as dirty. Workspace links and sign-
out ask **Keep editing** or **Leave without saving**. The dialog focuses Keep
editing, supports Escape, and fits the 320-pixel viewport without overflow.
Same-page links do not discard the form or show an unnecessary warning.

Back and Forward were verified in desktop Chrome. An initial implementation
could not cancel Chrome's history traversal; the final version restores the
original history entry before prompting when direct cancellation is unavailable.
This fallback preserves Next's page and does not add duplicate history entries.
History protection depends on the browser exposing the Navigation API; older
browsers without it do not receive this same-document history guard.

An audio-only capture triggered the warning, and Keep editing retained the audio
player. Discarding that audio with otherwise-empty fields allowed navigation
without prompting. Workspace-link and sign-out cancellation preserved the form;
confirmed Back navigation left it as requested. Actual sign-out was not executed.

Submitting whitespace-only text produced a server validation error. In the final
deployment, the selected customer, keyboard-edited job date, exact text, and ready
audio player survived. Database failures, missing insert IDs, invalid fields,
and network exceptions were covered by focused save-helper tests, not by forcing
a production database outage. The capture form uses explicit submission to avoid
React's automatic reset after a rejected save. Editing is disabled during saving.

A corrected non-billable test note was saved as
`6e91890c-8f39-4fa7-8da5-42186aca3321`. Success opened that saved draft directly;
reloading retained its text and customer, and subsequent navigation did not warn.
It was not AI-extracted, approved, or invoiced. No invoice action was performed.

A dirty-only `beforeunload` listener adds the native refresh/close warning.
Browser-controlled reload did not expose a confirmation during automation, so
manual refresh and close cancellation remain unverified. This is warning-based
protection, not autosave: leaving intentionally loses unsaved data, and raw audio
is not stored with the saved transcript.

Final deployment `dpl_AUXjCHHKFNA5CwNZ9x9xURm6SHrd` was READY on the production
alias. It was deployed from reviewed uncommitted source over `a525931`, not from
that base commit alone; credentials and local environment files were excluded.
All 25 regression tests, four hosted HTTP checks, lint, and the production build
passed. Recent runtime error/fatal logs were empty. Screenshots of the mobile
warning, retained failed-save form, and saved test draft were kept outside Git.
