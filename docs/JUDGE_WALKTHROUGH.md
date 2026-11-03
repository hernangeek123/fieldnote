# FieldNote Judge Walkthrough

## November 3 Submission Preflight

The owner confirmed all remaining testing was complete, including the fresh-user
and physical-phone checks discussed immediately beforehand. This is an owner
report, separate from the dated agent-observed evidence below; device metadata
and an itemized fresh-user trace were not supplied.

A new recorded desktop run verified uploaded sample audio, live transcription,
transcript correction, three AI matches totaling USD 320, approval, and actual
PayPal Sandbox draft creation. The final video's new invoice remains Draft and
was not sent or paid. The October 9 paid example is clearly identified as a
separate prior payment. The final public video is https://youtu.be/Gh-7FGhkBLE.

All 44 regression tests, lint, and the production build passed after the targeted
dependency updates to Next.js 16.4.4, Zod 4.6.7, and Undici 7.30.1. The production
dependency audit reports no known vulnerabilities. Seven hosted HTTP checks
passed again after production deployment `dpl_CpxazV7Kh5gXxZ8MiX5c5ogKUkUx`,
commit `e0285c9`, reached Ready on the live alias.

The project story, nine technology tags, app/source links, three captioned
screenshots, video link, and judge instructions have been saved in Devpost.
Entrant details and eligibility were confirmed directly by the owner. The entry
was submitted on November 3 after explicit owner approval of public repository
release and final terms acceptance. GitHub confirmed public visibility and Devpost
displayed “Project submitted!” at https://devpost.com/software/fieldnote.

This is a reproducible acceptance-test recipe, not a claim that every step has
already passed in production. All invoices in this walkthrough use PayPal
Sandbox; there are no real-money payments.

Judges should start with the shorter [judge instructions](JUDGE_INSTRUCTIONS.md).
The dated sections below preserve verification history; older pending findings
describe that run and may be superseded by later entries.

## Access

Open [FieldNote](https://fieldnote-lime.vercel.app/login), choose **Continue with
Google**, and use your own Google account. Consent requests only name, email,
and profile information for `hhawqwpdljfdookbzagz.supabase.co`. A new account starts
with an isolated workspace, not the owner's sample data. General email delivery
is not configured; it is not the judge access route.

Hosted Google login, existing-account linking, the return path, and sign-out
were verified on November 2 with the second account outside Google's test-user
list. A completely new Google account's first workspace/setup flow remains a
separate pre-submission check. Do not publish mailbox passwords, API secrets,
or sign-in links in the repository or testing copy.

## Sample Customer

In **Customers**, add **Demo Plumbing Customer** with the synthetic Sandbox
recipient `sb-jhla153143388@personal.example.com` for an unsent draft-only test.
For optional independent payment testing, create a separate customer using a
Sandbox Personal buyer you control before creating that invoice. Phone and
service address may be left blank. Do not use a real customer's details.

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

Customer and service pencil buttons open editors with **Save changes** and
**Cancel**. A service's **Active service** checkbox controls whether it is
available for new matches. Editing the price book does not reprice saved line
items. Customer changes do not update a reserved PayPal invoice or its recipient.

1. Choose **New note**, select **Demo Plumbing Customer**, and use today's date.
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
7. Correct the review if needed, then choose **Approve note**.

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

1. After approval, choose **Create PayPal draft**.
2. Confirm the invoice number and draft status appear in FieldNote; check the
   recipient, three reviewed items, USD currency, and $320.00 total.
3. Merchant inspection through **Open in PayPal** is optional and requires
   separate Sandbox merchant access. Judges can inspect the result in FieldNote.
4. Choose **Refresh status** and reload the note. The same invoice number should
   remain; no second draft should be created and the review editor should be locked.
5. Return to the workspace and confirm the saved note is still present.

Creating a draft should not send the invoice. The note remains reviewed at this
stage; it becomes invoiced after sending. Keep **Send invoice** untouched during a
draft-only acceptance test.

## Optional Send Test

Use a new invoice addressed to a Sandbox buyer you control. Choose **Send
invoice**, cancel the first confirmation, and check that the draft remains
unchanged. Then choose **Send invoice** again and confirm the intended Sandbox
recipient. Verify sent status and the note's invoiced state in FieldNote.

Sending invokes PayPal's Sandbox delivery flow. Do not present this as a real
customer receiving a live invoice. For payment, choose **View payment page** and
complete checkout yourself with your Sandbox buyer. The hosted webhook is
configured and has verified paid-status updates. Reload the note to inspect
webhook-driven status before using **Refresh status**, which is manual
reconciliation. No Sandbox credentials are needed for the main draft-only test.

## Acceptance Record

For each run, record the date, deployment/commit, browser, outcome, and redacted
evidence. Do not include email links, access tokens, passwords, or customer PII.

- [x] Google login, existing-account linking, return path, and sign-out work for a second account outside Google's test-user list (November 2).
- [ ] A completely new Google account can sign up and complete the empty-workspace setup and sample draft flow.
- [ ] Complete physical-phone acceptance using Google sign-in (MOBILE_ACCEPTANCE.md).
- [x] Customer and price-book entries persist after reload (October 10 hosted editing check).
- [x] Recording or upload produces an editable transcript (synthetic WAV upload and owner-recorded microphone WebM both verified).
- [x] Saved note preserves the selected customer and corrected text.
- [x] AI suggestions match the catalog or clearly require review (October 9 GPT-4.1 Mini retry).
- [x] Review persists and the approved total is $320.00.
- [x] PayPal Sandbox draft matches the reviewed data.
- [x] Refresh preserves one invoice ID and locks the review editor.
- [x] Workspace shows the saved note and correct state.
- [x] Optional confirmed send succeeds (user completed the confirmation; agent verified the result).
- [x] Sandbox payment completes and a verified PAID webhook updates FieldNote before manual status refresh.
- [x] Send cancellation does not send (October 10 owner-operated local Chrome check; unchanged database state verified afterward).
- [x] A second account cannot view the first account's records (October 10 browser checks against the same database; hosted tester and local owner sessions).
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

### October 10 Customer And Price-Book Editing

Local changes over commit `573c1c4` add authenticated customer/service editing,
service deactivation/reactivation, validation with retained form values, and
timestamp-based protection against stale updates. The invoice panel and send
confirmation now use the recipient saved in the reserved invoice payload, not
the customer's current email. Legacy missing snapshots display no recipient
rather than guessing. Existing line-item prices and descriptions remain saved
values; an inactive linked service stays visible on its existing review row.

All 31 regression tests, lint, and the production build passed. The expanded
rollback-only database suite passed against FieldNote: owner contact/catalog
updates, deactivate/reactivate, preserved catalog links and USD 320.00 saved
total, unchanged frozen recipient/payload, and blocked cross-owner updates.
No schema changes or permanent database test-suite changes were required.

Chrome signed in locally through the owner's email-link flow. Browser checks
verified customer name/email/phone/address edits and service
name/description/unit/price edits persisted after reload. Customer Cancel
discarded changes, a server validation error retained the editor's fields, and
a stale second-tab save could not overwrite a newer customer version. Service
deactivation and reactivation persisted. Both open editors fit a 320-pixel
viewport without horizontal overflow; screenshots were saved outside Git and
the viewport override was reset. These are local desktop-Chrome viewport checks,
not hosted deployment or physical-phone certification.

Two clearly named synthetic records remain in the owner's workspace:
**Editor verification customer updated** and **Editor verification service
updated**. The service is inactive at USD 23.45 per hour. Existing demo records
and invoices were not edited. No note or PayPal invoice was created or sent.
These source changes were subsequently committed and pushed as `a5a1fce`.

### October 10 Hosted Acceptance

Vercel deployment `dpl_Hq4ENn8szpUef2QJzWQui7CAA4to` is READY on the public
FieldNote alias and reports source commit `a5a1fce`. All four hosted HTTP smoke
tests passed. Its recent runtime error/fatal scan returned no records.

In the second account's hosted Chrome session, the demo customer's email, phone,
and address were temporarily edited, saved, and checked after reload. The paid
note displayed the updated contact details while its PayPal panel retained the
original reserved Sandbox recipient. The original customer fields were restored.

The Chrome kitchen faucet service was temporarily changed from USD 120.00 to
USD 125.00 and made inactive. Both changes persisted after reload. The existing
paid note retained its USD 120.00 saved unit price, USD 320.00 total, locked
review, and existing inactive catalog link. The service was restored to
USD 120.00 and active. No PayPal send, draft creation, or status refresh was used.

Cross-account browser checks used two authenticated sessions against the same
Supabase database: the hosted second account and the owner's local app. Each
could render its own existing note, and each received a not-found page for the
other account's note. These are real browser read-isolation checks, not two
production-origin sessions; rollback-only database tests separately cover writes.

An unsaved new note triggered the workspace-link warning, and **Keep editing**
preserved its text. The owner reported no native refresh/close warning during
the first manual attempt. The original dirty tab still retained its text, and
an empty duplicate tab had been open during that attempt; the duplicate was
closed before requesting a focused retest with manual typing. At that point,
native refresh/close protection was not certified. Browser dialogs also require
user activation and are not reliable on every platform. No note was saved for
this test.

During that focused retest, the owner reported **No warning; nothing happened**.
The next browser inspection showed the new-note text field empty and no pending
JavaScript dialog. The test text was therefore no longer retained; the agent
could not establish why the warning was absent. A further check was requested in
a new tab opened entirely by the owner, using Chrome's reload button rather than
the keyboard shortcut and without agent control of that tab. The owner reported
**Warning appeared; cancelled**. This verifies the native refresh warning and
its cancellation through the owner's manual production check. It does not
independently verify retained text after cancellation, tab-close cancellation,
or other browsers. The result suggests the earlier failure was specific to the
controlled-tab test conditions; its exact cause was not established. No
application-source change was required for the successful manual refresh check.

The owner then tried closing that independently opened tab and reported
**Warning appeared; cancelled; text intact**. Native tab-close warning,
cancellation, and text retention are now owner-verified in desktop Chrome.
This is not certification for physical mobile devices or every browser.

Supabase's **Enable custom SMTP** switch was observed off. The default email
service restricts delivery to project-team addresses, so existing-account login
does not certify unrelated judge access. The owner has no mail provider or domain
yet. No provider account, domain purchase, authentication change, or team-access
workaround was performed. Configure a verified sender with custom SMTP, or choose
and verify an alternative sign-in method, before certifying judge access.

Independent send-cancellation testing remains pending and was paused during the
warning investigation. No new note, invoice, send, or payment was initiated in
this hosted acceptance run.

### October 10 Final Safety Checks And Demo Preparation

The owner independently verified tab-close cancellation in a normal production
Chrome tab: the warning appeared, cancellation kept the tab open, and the unsaved
text remained intact. Together with the earlier reload-button check, this covers
the native desktop-Chrome warnings without agent control of the tested tab.

Send cancellation used an existing USD 416.50 Sandbox draft,
`INV2-MYZS-X4Y5-UN4X-4NX8`, for note
`0c94e3ae-c835-489f-a37f-224a993e19b6`. In a separately opened local Chrome tab
using the owner's session, the owner clicked **Send invoice**, chose **Cancel**,
and reported that the invoice remained Draft. Read-only database checks before
and after confirmed `DRAFT`, note state `reviewed`, no active operation token,
zero SENT webhook events, and the unchanged invoice timestamp from October 6.
No new invoice, send, or payment was initiated. This is an owner-operated local
browser check with database verification, not an automated hosted cancellation
test or a fresh PayPal API reconciliation.

All 31 regression tests and four hosted HTTP smoke checks passed again.
Application code and deployment configuration were unchanged. Demo narration,
shot planning, submission copy, and a physical-phone checklist were prepared as
local documents only. No video was recorded or published, no Devpost submission
was saved or submitted, and the repository remains private.

Remaining release gates include physical-phone acceptance, unrelated judge email
delivery after SMTP setup, final footage, source/history review before public
release, and owner-approved repository/video publication.

References: [Supabase SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp),
[browser warning limitations](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event),
[Resend verified domains](https://resend.com/docs/dashboard/domains/introduction).

### November 2 Google Sign-In Implementation

The owner deferred buying a domain and explicitly requested Google sign-in.
The live Supabase configuration was inspected: email sign-in and email
confirmation are enabled, custom SMTP is off, and the Google provider is disabled.
Those settings have not yet been changed by this implementation.

The owner approved creating a dedicated Google Cloud project named FieldNote,
with no organization, no billing account selected, and no paid services enabled.
Google confirmed creation of `fieldnote-513517`. The owner also approved using
their existing Google account address for support and developer contact. The
consent wizard was prepared with FieldNote branding and an External audience,
then handed to the owner at Google's User Data Policy agreement step. The owner
completed the agreement and creation; Google displayed **OAuth configuration
created!**. A Web application client form named **FieldNote Web** was prepared
with the hosted and localhost origins and the exact Supabase callback. The
Google provider form was opened in Supabase, with no credentials entered by
the agent. Credential creation and entry were handed to the owner.

Local application changes add **Continue with Google**, preserving email links.
The server action uses the existing SSR cookie client and callback, requests
only basic identity scopes, validates return paths, and handles provider/network
errors without displaying provider details. Google cancellation returns safely
to the login page. Buttons expose pending/disabled states and use Google's
official branding asset.

All 40 regression tests, lint, and the production build including TypeScript
passed. Five authentication HTTP checks passed against localhost. The full
local smoke suite additionally returned 503 rather than 401 for the unsigned
webhook because local webhook credentials are not configured; this is the
expected fail-closed local configuration, not a Google sign-in failure. The
hosted webhook check passed earlier on November 2 before these source changes.

OAuth credentials, Supabase Google enablement, real Google
account sign-in, responsive checks, and deployment remain pending. No sign-in
email, invoice, payment, repository-visibility change, or publication was made.
Do not certify unrelated judge access from the implementation checks alone.

The owner subsequently entered OAuth credentials directly in Supabase. A refreshed
provider list still showed Google disabled; credential-presence checks confirmed
both fields were saved without displaying either value. With the owner's
explicit approval, the agent enabled the provider and turned **Skip nonce checks**
off before saving. Supabase displayed **Google Enabled**. Allowing users without
an email remained off; no other providers, ownership policies, or email settings
were changed.

Google showed an External audience in Testing with zero test users. The existing
Vercel homepage was added to Branding and Google confirmed it was saved. Google's
audience documentation explicitly exempts basic identity-only sign-in requests
from the usual testing allowlist rule. No additional API scopes or users were
added. The local button reached Google's real account chooser, requesting only
email, profile, and OpenID identity scopes. The owner was asked to select the
existing second-account tester, outside the Google project/test-user list, and
complete consent. Actual callback/session verification remains pending.

Two narrow-viewport override attempts did not change the observed page width
(1280 pixels); one full-page screenshot also timed out. Overrides were reset and
the duplicate test tab closed. These attempts do not certify the new login page
at phone widths. Desktop rendering and the Google branding image were observed,
but physical-phone acceptance remains pending.

The first owner-reported completion landed on the public homepage and did not
create a Google identity. The flow was repeated from localhost with the safe
return path `/app/notes`. The account chooser selected the approved second
account, and Google's consent screen showed only name, profile picture, and
email. After continuation, FieldNote opened the intended notes page displaying
that account and its existing three notes. Supabase confirmed both `email` and
`google` identities on the existing account and a fresh sign-in at
2026-11-02 17:43:22 UTC. Sign-out was followed by a private-page visit that
returned to the login form. No customer, note, or invoice records were changed.
This verifies local OAuth, account linking, return-path handling, and sign-out;
the hosted release check remains pending.

Commit `e7b94dc` was pushed to the private repository and Vercel's Git
integration released production deployment `dpl_HgR6hzUzctvUWyeZVMfuhHMYFh4U`
to `https://fieldnote-lime.vercel.app`. All six hosted HTTP checks passed,
including both login methods rendering, private-route protection, safe callback
errors, Google cancellation, external-redirect rejection, and unsigned webhook
rejection. A real Google login on the hosted site returned to `/app/notes`
displaying the approved second account and its existing three notes. Supabase
recorded the hosted sign-in at 2026-11-02 17:46:38 UTC. After sign-out, revisiting
the private notes URL returned to login. The deployment's error/fatal runtime-log
query returned no groups during this verification window. Screenshots were kept
outside the repository; no authentication secrets were added to source.

Google access is verified for this non-test-list account with the basic identity
exception while the Google app remains External/Testing. This does not certify
every organization's managed Google accounts, physical-phone behavior, or general
email delivery. No invoice, payment, customer, or note was created or modified,
and repository visibility remains private.

### November 2 Judge Instructions Update

Added JUDGE_INSTRUCTIONS.md as the short judge-facing entry point and updated
the README, Devpost draft, submission checklist, phone checklist, and demo
preflight to use Google sign-in. The guide explicitly explains empty workspaces,
manual sample setup, the reviewed USD 320.00 job, and the primary unsent-draft
test without a merchant login. A read-only lookup confirmed the existing
synthetic Demo Plumbing Customer recipient used in that example. No Sandbox
passwords, API keys, or sign-in links are included.

Optional sending/payment uses a separate invoice for a Sandbox buyer controlled
by the tester. The instructions distinguish webhook updates from manual status
refresh and retain the fresh-Google-account and physical-phone checks as pending.
This documentation update did not create an account, customer, service, note,
invoice, or payment. The Devpost text remains a draft; no entry, video, or
repository-visibility change was published.
