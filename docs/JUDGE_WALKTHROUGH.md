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
4. Choose **Save draft**, then open the saved note from the workspace's recent
   notes. Saving currently leaves you on the new-note page with a success notice.
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
- [ ] Recording or upload produces an editable transcript.
- [ ] Saved note preserves the selected customer and corrected text.
- [ ] AI suggestions match the catalog or clearly require review.
- [ ] Review persists and the approved total is $320.00.
- [ ] PayPal Sandbox draft matches the reviewed data.
- [ ] Refresh preserves one invoice ID and locks the review editor.
- [ ] Workspace shows the saved note and correct state.
- [ ] Optional confirmed send succeeds; cancellation does not send.
- [ ] A second account cannot view the first account's records.
- [ ] Desktop and mobile views are usable without clipped controls.

Prior verification run, October 7, 2026: production deployment was reported
READY, and a connector fetch of the sign-in page returned HTTP 200. Local terminal
and browser-control startup failed, so this session did not execute the complete
workflow, verify new-tester email delivery, or create/send an invoice. The boxes
above intentionally remain unchecked.

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
