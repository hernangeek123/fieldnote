-- Database-path verification only: no email, AI call, or PayPal request is made.
-- Run as the database owner on a project with an Auth user. All changes roll back.
begin;
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from auth.users order by created_at limit 1), 'role', 'authenticated'
)::text, true);
set local role authenticated;

do $$
declare
  owner uuid := auth.uid();
  customer uuid; note uuid; faucet uuid; supply uuid; labor uuid;
  invoice public.paypal_invoices; retry public.paypal_invoices;
  items jsonb; total numeric; affected integer; protected boolean := false;
begin
  if owner is null then raise exception 'An Auth user is required.'; end if;
  insert into public.customers(name, email)
    values ('Workflow regression customer', 'sandbox@example.com') returning id into customer;
  insert into public.catalog_items(name, unit, unit_price_cents)
    values ('Chrome kitchen faucet', 'each', 12000) returning id into faucet;
  insert into public.catalog_items(name, unit, unit_price_cents)
    values ('Supply line', 'each', 1500) returning id into supply;
  insert into public.catalog_items(name, unit, unit_price_cents)
    values ('Plumbing labor', 'hour', 8500) returning id into labor;
  insert into public.field_notes(customer_id, raw_note, occurred_on)
    values (customer, 'Replaced the kitchen faucet. Used one chrome kitchen faucet and two supply lines. Completed two hours of plumbing labor.', current_date)
    returning id into note;

  if not exists (select 1 from public.field_notes
      where id = note and customer_id = customer and status = 'draft'
        and raw_note like '%two supply lines%') then
    raise exception 'Saved draft did not preserve its customer and text.';
  end if;
  items := jsonb_build_array(
    jsonb_build_object('id', null, 'catalog_item_id', faucet, 'description', 'Chrome kitchen faucet', 'quantity', 1, 'unit_price_cents', 12000),
    jsonb_build_object('id', null, 'catalog_item_id', supply, 'description', 'Supply line', 'quantity', 2, 'unit_price_cents', 1500),
    jsonb_build_object('id', null, 'catalog_item_id', labor, 'description', 'Plumbing labor', 'quantity', 2, 'unit_price_cents', 8500)
  );
  perform public.save_note_review(note, items, true);
  select sum(quantity * unit_price_cents) into total from public.note_line_items where field_note_id = note;
  if total <> 32000 or (select count(*) from public.note_line_items where field_note_id = note) <> 3
      or (select status from public.field_notes where id = note) <> 'reviewed' then
    raise exception 'Reviewed sample job did not total USD 320.00.';
  end if;

  -- Use the same atomic review RPC as the application, not a direct table edit.
  perform public.save_note_review(note, jsonb_set(items, '{2,unit_price_cents}', '8600'), false);
  if (select status from public.field_notes where id = note) <> 'draft' then
    raise exception 'Changing a reviewed price did not reset approval.';
  end if;
  perform public.save_note_review(note, items, true);
  invoice := public.reserve_paypal_invoice(note, 'Workflow regression merchant');
  retry := public.reserve_paypal_invoice(note, 'Different merchant');
  if invoice.id <> retry.id or invoice.draft_payload <> retry.draft_payload
      or jsonb_array_length(invoice.draft_payload->'items') <> 3 then
    raise exception 'Reservation did not preserve one frozen three-item invoice.';
  end if;

  update public.customers set name = 'Updated customer', email = 'updated@example.com',
    phone = '555-0100', address = 'Updated service address' where id = customer;
  update public.catalog_items set name = 'Updated faucet', unit_price_cents = 14000, active = false where id = faucet;
  if not exists (select 1 from public.customers where id = customer and email = 'updated@example.com'
      and phone = '555-0100' and address = 'Updated service address')
      or not exists (select 1 from public.catalog_items where id = faucet and not active and unit_price_cents = 14000) then
    raise exception 'Owner customer or catalog update did not persist.';
  end if;
  if exists (select 1 from public.catalog_items where id = faucet and active) then
    raise exception 'Inactive catalog entry remained available for new matches.';
  end if;
  select sum(quantity * unit_price_cents) into total from public.note_line_items where field_note_id = note;
  retry := public.reserve_paypal_invoice(note, 'Different merchant');
  if total <> 32000 or retry.draft_payload <> invoice.draft_payload
      or retry.draft_payload #>> '{primary_recipients,0,billing_info,email_address}' <> 'sandbox@example.com'
      or not exists (select 1 from public.note_line_items where field_note_id = note
        and catalog_item_id = faucet and description = 'Chrome kitchen faucet' and unit_price_cents = 12000) then
    raise exception 'Master-data edits changed saved prices, links or the frozen invoice recipient.';
  end if;
  update public.catalog_items set active = true where id = faucet;
  if not exists (select 1 from public.catalog_items where id = faucet and active) then
    raise exception 'Reactivating a service failed.';
  end if;

  -- A simulated different authenticated subject exercises RLS, not browser sign-in.
  perform set_config('request.jwt.claims', jsonb_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  if exists(select 1 from public.customers where id = customer)
      or exists(select 1 from public.catalog_items where id in (faucet, supply, labor))
      or exists(select 1 from public.field_notes where id = note)
      or exists(select 1 from public.note_line_items where field_note_id = note)
      or exists(select 1 from public.paypal_invoices where id = invoice.id) then
    raise exception 'Another authenticated subject could read owner records.';
  end if;
  update public.customers set name = 'Not allowed' where id = customer;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Another subject could update the customer.'; end if;
  update public.catalog_items set unit_price_cents = 1, active = false where id = faucet;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Another subject could edit or deactivate the service.'; end if;
  begin
    insert into public.field_notes(owner_id, customer_id, raw_note)
      values (owner, customer, 'Forbidden cross-owner insert');
  exception when insufficient_privilege then
    protected := true;
  end;
  if not protected then raise exception 'Another subject could insert an owner note.'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', owner, 'role', 'authenticated')::text, true);
end;
$$;

reset role;
select 'Database-path sample job, master-data edits, deactivation/reactivation, preserved USD 320.00 review and invoice snapshot, and cross-owner read/write protection passed.' as result;
rollback;
