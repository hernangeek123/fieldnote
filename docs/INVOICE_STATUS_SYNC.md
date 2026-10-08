# Invoice Safeguards And Status Sync

## Implemented

- Review saves are one database transaction. Saving changes resets approval.
- Reviews and invoice reservations lock the same note row to prevent races.
- Any invoice reservation locks the note and its line items in the database,
  including stale browser requests and direct writes through the Data API.
- The invoice payload, merchant name, and request IDs are frozen. New reservations
  omit the optional issue date so PayPal chooses its current merchant-local day,
  avoiding unintended scheduling across a UTC date boundary. Existing reservations
  keep their original payload, including any explicit issue date.
- A stable invoice number provides another duplicate guard if request-ID retention
  has expired. Duplicate-number responses are reconciled through invoice search.
- Concurrent create/send requests use a two-minute recoverable operation lease.
- Sending checks PayPal's current status first. Cancelled, scheduled, failed, and
  unknown statuses are not reported as already sent.
- **Refresh status** reads PayPal and updates the local invoice status.
- The signed webhook reads current PayPal state, then records the event and status
  in one transaction. Duplicate IDs and older observations cannot overwrite it.
- Both `resource.invoice.id` (observed in actual Sandbox delivery) and the flat
  `resource.id` shape are supported. The complete original event is forwarded for
  signature verification; invoice references are never used before verification.
- The webhook event ledger is private and accessible only to the service role.

An invoiced note and a paid invoice are different states. The note remains
invoiced; the PayPal badge distinguishes unpaid, partial payment, paid, marked as
paid, cancellation, and refund states. A paid notification alone does not prove
full payment; the current invoice response is authoritative.

## Deployment And Webhook Setup

1. Apply `supabase/migrations/20261008004921_invoice_safeguards_and_status_sync.sql`
   if it is not already in that project's migration history. It has been applied
   to the FieldNote project. Apply the subsequent `paypal_invoice_date_defaults`
   migration as well, after updating the application to accept an omitted date.
2. Deploy the updated source. Browser testing is still required before submission.
3. In the same PayPal Sandbox REST app used by FieldNote, register an HTTPS webhook
   at `https://fieldnote-lime.vercel.app/api/paypal/webhook`. For a separate copy,
   use its own origin.
4. Subscribe to the available `INVOICING.INVOICE.*` events, including sent, paid,
   cancelled, refunded, and updated events.
5. Set the resulting webhook ID as server-only `PAYPAL_WEBHOOK_ID`.
6. Set a Supabase secret API key as server-only `SUPABASE_SECRET_KEY`. Do not use
   the publishable key here or add a `NEXT_PUBLIC_` prefix. A legacy service-role
   key is also supported by Supabase, but the current secret key is preferred.
7. Redeploy after changing environment variables. Keep
   `PAYPAL_API_BASE=https://api-m.sandbox.paypal.com` and do not use live credentials.

The endpoint returns 503 when configuration is missing, 401 for an invalid
signature, and 200 only after a verified event is safely handled or ignored.
Database/API failures return 503 so PayPal can retry delivery. The public webhook
route does not require a FieldNote browser session. Database credentials are not
accessed until the PayPal signature has been verified.

Signature verification uses PayPal's postback verification endpoint. The generic
webhook simulator's mock events are not supported by postback verification; use
events from the registered app's actual Sandbox invoices.

## Verification

### Hosted Setup Record

October 7, 2026 (Eastern): implementation commit `d810d83` was pushed to the private
repository and its production deployment reached READY at
`https://fieldnote-lime.vercel.app`. The Sandbox REST app has a webhook registered
at `/api/paypal/webhook` for all nine available invoice event types. Its webhook
ID and the Supabase secret key are stored as server-only production secrets.

Production checks confirmed HTTP 200 for login, an unauthenticated redirect for
the customer page, HTTP 405 for webhook GET, and HTTP 401 for an unsigned invoice
event. No production runtime errors were returned by the deployment-scoped log
check, although no webhook delivery logs were available.

A temporary unsent Sandbox draft was created and updated with both email
notifications disabled. PayPal's event listing returned no notification for it
during this check. The draft was deleted (HTTP 204), and its subsequent lookup
returned HTTP 404. Existing FieldNote invoices were unchanged. At that stage,
actual signed delivery and the authenticated browser flow were unverified. No
invoice email was sent or payment taken during this initial setup check.

### Signed Sandbox Event Test

Later on October 7 (Eastern), a separate acceptance customer and reviewed plumbing
note were prepared through the database/API path in the owner's workspace. The
three reviewed items total $320.00. The original placeholder-customer invoice was
left unchanged. This tests the backend path, not browser capture, AI extraction,
or the review interface.

The real notification used `resource.invoice.id`, unlike the flat example in the
invoicing guide. Commit `52e2665` added support for both shapes while preserving
the full signed event. All 20 regression tests, lint, TypeScript, and the production
build passed. The date-default migration was applied as version
`20261008012825`; rollback-only database checks passed, including omitted-date
reservations, frozen retries, ownership, locking, and duplicate protection.

The test invoice was initially scheduled because its UTC issue date was October 8
while PayPal's current day was October 7. An unsent temporary probe confirmed
PayPal chooses October 7 when the date is omitted; the probe was deleted. The
isolated acceptance invoice's issue date was corrected in PayPal without changing
its buyer, items, or total; its original frozen creation payload was preserved.
The same invoice and send request ID were then used for sending.

Actual signature-verified CREATED, UPDATED, and SENT events reached production
and were recorded in the private ledger. FieldNote automatically changed the note
to invoiced and the invoice to SENT, without a manual status write after sending.
PayPal accepted a SENT-event redelivery request (HTTP 202); a subsequent database
read still showed one record for that event, three events total, and the unchanged
status/sync timestamp. PayPal's event-details API did not expose transmission logs,
so transport confirmation for the duplicate attempt is unavailable.

The acceptance note is `a4a5b255-43fe-4acc-ac8e-511c02f403e2`; its Sandbox invoice is
`INV2-F3EJ-FSH5-ZUCF-FLYK`. The buyer was given its Sandbox payment link. Buyer
checkout, the signed PAID event, manual-refresh parity, and authenticated browser
reload are pending. No payment was taken during preparation, and no payment was
artificially marked as received.

Run:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Run `tests/invoice-database.sql` as the database owner on a test project with an
Auth user. The script impersonates database roles to test ownership and service
access, creates temporary fixtures, and rolls everything back. It sends no email
and calls no PayPal payment endpoint.

The application tests use mocked PayPal responses. They verify stable payloads,
duplicate-number recovery, ambiguous send recovery, signature forwarding, rejected
signatures, bounded request bodies, partial-payment status, and retryable errors.
They do not establish that actual webhook delivery or the full browser flow works.

Before enabling the demo, verify an actual Sandbox invoice event reaches the
deployed endpoint, updates its financial status, survives reload, and produces no
duplicate update on redelivery. Confirm that **Refresh status** produces the same
state. Do not mark a real invoice paid solely for a test.

## References

- [PayPal invoicing webhooks](https://developer.paypal.com/api/invoicing/webhooks/)
- [PayPal signature verification and delivery retries](https://developer.paypal.com/api/rest/webhooks/rest/)
- [PayPal request-ID idempotency](https://developer.paypal.com/api/rest/reference/idempotency/)
