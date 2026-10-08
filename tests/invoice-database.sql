-- Run as the database owner. All fixtures and mutations are rolled back.
begin;
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from auth.users order by created_at limit 1), 'role', 'authenticated'
)::text, true);
set local role authenticated;
do $$
declare
  owner uuid := auth.uid(); customer_id uuid; note_id uuid;
  first_invoice public.paypal_invoices; second_invoice public.paypal_invoices;
  protected boolean; item_count integer; affected integer;
begin
  if owner is null then raise exception 'A test project with at least one auth user is required.'; end if;
  insert into public.customers(name, email) values ('Regression fixture', 'sandbox@example.com') returning id into customer_id;
  insert into public.field_notes(customer_id, raw_note) values (customer_id, 'Regression test only') returning id into note_id;
  perform public.save_note_review(note_id, '[{"id":null,"catalog_item_id":null,"description":"Labor","quantity":2,"unit_price_cents":8500}]', true);
  begin
    perform public.save_note_review(note_id, '[{"id":null,"catalog_item_id":null,"description":"Invalid","quantity":0,"unit_price_cents":100}]', true);
    raise exception 'Invalid review was accepted';
  exception when raise_exception then
    if sqlerrm <> 'Check every line item and selected price-book entry.' then raise; end if;
  end;
  select count(*) into item_count from public.note_line_items where field_note_id = note_id;
  if item_count <> 1 then raise exception 'Invalid review changed line items'; end if;
  first_invoice := public.reserve_paypal_invoice(note_id, 'Test merchant');
  if first_invoice.draft_payload->'detail' ? 'invoice_date' then
    raise exception 'New reservation must let PayPal choose its current issue date';
  end if;
  second_invoice := public.reserve_paypal_invoice(note_id, 'Changed merchant');
  if first_invoice.id <> second_invoice.id or first_invoice.draft_payload <> second_invoice.draft_payload
     or first_invoice.create_request_id <> second_invoice.create_request_id then raise exception 'Reservation changed retry data'; end if;
  protected := false;
  begin
    update public.note_line_items set unit_price_cents = 1 where field_note_id = note_id;
  exception when raise_exception then
    if sqlerrm <> 'Invoice creation has started. Line items are locked.' then raise; end if;
    protected := true;
  end;
  if not protected then raise exception 'Invoice line items were editable'; end if;
  protected := false;
  begin
    perform public.save_note_review(note_id, '[{"id":null,"catalog_item_id":null,"description":"Changed","quantity":1,"unit_price_cents":100}]', true);
  exception when raise_exception then
    if sqlerrm <> 'Invoice creation has started. Line items are locked.' then raise; end if;
    protected := true;
  end;
  if not protected then raise exception 'Stale review was accepted'; end if;
  protected := false;
  begin
    update public.paypal_invoices set create_request_id = gen_random_uuid() where id = first_invoice.id;
  exception when raise_exception then
    if sqlerrm <> 'Invoice identity and retry data cannot be changed.' then raise; end if;
    protected := true;
  end;
  if not protected then raise exception 'Retry identity was editable'; end if;
  update public.paypal_invoices set operation_token = gen_random_uuid(), operation_started_at = now()
    where id = first_invoice.id and (operation_started_at is null or operation_started_at < now() - interval '2 minutes');
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'First operation was not claimed'; end if;
  update public.paypal_invoices set operation_token = gen_random_uuid(), operation_started_at = now()
    where id = first_invoice.id and (operation_started_at is null or operation_started_at < now() - interval '2 minutes');
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Duplicate operation was claimed'; end if;
  perform public.sync_paypal_invoice(first_invoice.id, '{"id":"INV2-REGRESSION","status":"PAID"}', '2026-10-07T12:00:00Z');
  perform public.sync_paypal_invoice(first_invoice.id, '{"id":"INV2-REGRESSION","status":"UNPAID"}', '2026-10-07T11:00:00Z');
  if (select status from public.paypal_invoices where id = first_invoice.id) <> 'PAID' then raise exception 'Stale status overwrote payment'; end if;
  if (select status from public.field_notes where id = note_id) <> 'invoiced' then raise exception 'Paid note was not invoiced'; end if;
  protected := false;
  begin
    perform public.sync_paypal_invoice(first_invoice.id, '{"id":"INV2-REGRESSION","status":"PAID"}', now(), 'WH-FORGED', 'INVOICING.INVOICE.PAID');
  exception when raise_exception then
    if sqlerrm <> 'Webhook access denied.' then raise; end if;
    protected := true;
  end;
  if not protected then raise exception 'Authenticated user could submit a webhook event'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  if exists (select 1 from public.paypal_invoices where id = first_invoice.id) then raise exception 'Another owner could read invoice'; end if;
  protected := false;
  begin
    perform public.reserve_paypal_invoice(note_id, 'Other owner');
  exception when raise_exception then
    if sqlerrm <> 'Field note not found.' then raise; end if;
    protected := true;
  end;
  if not protected then raise exception 'Another owner could reserve invoice'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', owner, 'role', 'authenticated')::text, true);
  perform set_config('fieldnote.test_invoice', first_invoice.id::text, true);
end;
$$;
set local role service_role;
do $$
declare invoice_id uuid := current_setting('fieldnote.test_invoice')::uuid; event_count integer;
begin
  perform public.sync_paypal_invoice(invoice_id, '{"id":"INV2-REGRESSION","status":"PARTIALLY_REFUNDED"}', '2026-10-07T13:00:00Z', 'WH-REGRESSION', 'INVOICING.INVOICE.REFUNDED');
  perform public.sync_paypal_invoice(invoice_id, '{"id":"INV2-REGRESSION","status":"UNPAID"}', '2026-10-07T14:00:00Z', 'WH-REGRESSION', 'INVOICING.INVOICE.REFUNDED');
  select count(*) into event_count from fieldnote_private.paypal_webhook_events where event_id = 'WH-REGRESSION';
  if event_count <> 1 then raise exception 'Duplicate webhook was recorded twice'; end if;
  if (select status from public.paypal_invoices where id = invoice_id) <> 'PARTIALLY_REFUNDED' then raise exception 'Duplicate webhook changed invoice'; end if;
end;
$$;
reset role;
select 'Invoice locking, atomic review, stable retry identity, operation claims, stale-event protection, deduplication, and owner isolation passed.' as result;
rollback;
