# Invoice Safeguards And Status Sync

## Implemented

- Review saves are one database transaction. Saving changes resets approval.
- Reviews and invoice reservations lock the same note row to prevent races.
- Any invoice reservation locks the note and its line items in the database,
  including stale browser requests and direct writes through the Data API.
- The invoice payload, invoice date, merchant name, and request IDs are frozen.
- A stable invoice number provides another duplicate guard if request-ID retention
  has expired. Duplicate-number responses are reconciled through invoice search.
- Concurrent create/send requests use a two-minute recoverable operation lease.
- Sending checks PayPal's current status first. Cancelled, scheduled, failed, and
  unknown statuses are not reported as already sent.
- **Refresh status** reads PayPal and updates the local invoice status.
- The signed webhook reads current PayPal state, then records the event and status
  in one transaction. Duplicate IDs and older observations cannot overwrite it.
- The webhook event ledger is private and accessible only to the service role.

An invoiced note and a paid invoice are different states. The note remains
invoiced; the PayPal badge distinguishes unpaid, partial payment, paid, marked as
paid, cancellation, and refund states. A paid notification alone does not prove
full payment; the current invoice response is authoritative.

## Deployment And Webhook Setup

1. Apply `supabase/migrations/20261008004921_invoice_safeguards_and_status_sync.sql`
   if it is not already in that project's migration history. It has been applied
   to the FieldNote project.
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
