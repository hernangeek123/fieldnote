alter table public.paypal_invoices
  add column draft_payload jsonb,
  add column operation_token uuid,
  add column operation_started_at timestamptz,
  add column last_synced_at timestamptz;

create schema if not exists fieldnote_private;
revoke all on schema fieldnote_private from public, anon, authenticated;
grant usage on schema fieldnote_private to service_role;
create table fieldnote_private.paypal_webhook_events (
  event_id text primary key,
  invoice_id uuid not null references public.paypal_invoices(id) on delete cascade,
  event_type text not null,
  received_at timestamptz not null default now()
);
create index paypal_webhook_events_invoice_id_idx
  on fieldnote_private.paypal_webhook_events(invoice_id);
alter table fieldnote_private.paypal_webhook_events enable row level security;
revoke all on fieldnote_private.paypal_webhook_events from public, anon, authenticated;
grant select, insert on fieldnote_private.paypal_webhook_events to service_role;

-- All review writes and invoice reservations serialize on the parent note.
create function public.guard_invoice_line_items() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare note_id uuid;
begin
  note_id := case when tg_op = 'DELETE' then old.field_note_id else new.field_note_id end;
  if tg_op = 'UPDATE' and (new.field_note_id <> old.field_note_id or new.owner_id <> old.owner_id) then
    raise exception 'Line item ownership cannot be changed.';
  end if;
  perform 1 from public.field_notes where id = note_id for update;
  if exists (select 1 from public.paypal_invoices where field_note_id = note_id) then
    raise exception 'Invoice creation has started. Line items are locked.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.guard_invoice_line_items() from public, anon, authenticated;
create trigger guard_invoice_line_items before insert or update or delete
  on public.note_line_items for each row execute function public.guard_invoice_line_items();

create function public.guard_invoice_note() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if exists (select 1 from public.paypal_invoices where field_note_id = old.id) then
    if tg_op = 'DELETE' then raise exception 'Notes with invoices cannot be deleted.'; end if;
    if row(new.id, new.owner_id, new.customer_id, new.raw_note, new.occurred_on)
       is distinct from row(old.id, old.owner_id, old.customer_id, old.raw_note, old.occurred_on)
       or new.status = 'draft' then
      raise exception 'Invoice creation has started. The note is locked.';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.guard_invoice_note() from public, anon, authenticated;
create trigger guard_invoice_note before update or delete on public.field_notes
  for each row execute function public.guard_invoice_note();

create function public.guard_invoice_identity() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform 1 from public.field_notes where id = new.field_note_id for update;
  elsif row(new.id, new.owner_id, new.field_note_id, new.create_request_id, new.send_request_id, new.draft_payload)
    is distinct from row(old.id, old.owner_id, old.field_note_id, old.create_request_id, old.send_request_id, old.draft_payload) then
    raise exception 'Invoice identity and retry data cannot be changed.';
  end if;
  if tg_op = 'UPDATE' and old.paypal_invoice_id is not null
     and new.paypal_invoice_id is distinct from old.paypal_invoice_id then
    raise exception 'The PayPal invoice ID cannot be changed.';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_invoice_identity() from public, anon, authenticated;
create trigger guard_invoice_identity before insert or update on public.paypal_invoices
  for each row execute function public.guard_invoice_identity();

create function public.reserve_paypal_invoice(p_note_id uuid, p_business_name text)
returns public.paypal_invoices language plpgsql security invoker set search_path = '' as $$
declare
  note public.field_notes;
  invoice public.paypal_invoices;
  customer public.customers;
  items jsonb;
begin
  select * into note from public.field_notes
    where id = p_note_id and owner_id = (select auth.uid()) for update;
  if not found then raise exception 'Field note not found.'; end if;
  select * into invoice from public.paypal_invoices where field_note_id = p_note_id;
  if found then
    if invoice.paypal_invoice_id is null and invoice.draft_payload is null then
      raise exception 'This older invoice attempt needs reconciliation in PayPal before retrying.';
    end if;
    return invoice;
  end if;
  if note.status <> 'reviewed' then raise exception 'Approve the field note before creating an invoice.'; end if;
  select * into customer from public.customers where id = note.customer_id;
  if not found or customer.email is null or customer.email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Choose a customer with a valid email before creating an invoice.';
  end if;
  if exists (select 1 from public.note_line_items where field_note_id = p_note_id and unit_price_cents <= 0) then
    raise exception 'Every invoice item needs a price greater than zero.';
  end if;
  select jsonb_agg(jsonb_build_object(
    'name', left(description, 200), 'quantity', quantity::text,
    'unit_amount', jsonb_build_object('currency_code', 'USD', 'value', to_char(unit_price_cents::numeric / 100, 'FM9999999990.00')),
    'unit_of_measure', 'QUANTITY'
  ) order by created_at, id) into items from public.note_line_items where field_note_id = p_note_id;
  if items is null or jsonb_array_length(items) > 100 then raise exception 'An invoice needs between 1 and 100 line items.'; end if;
  insert into public.paypal_invoices(field_note_id, draft_payload) values (p_note_id,
    jsonb_build_object(
      'detail', jsonb_build_object(
        'currency_code', 'USD', 'invoice_date', (now() at time zone 'UTC')::date::text,
        'invoice_number', 'FN-' || left(replace(p_note_id::text, '-', ''), 20),
        'reference', 'FieldNote ' || left(p_note_id::text, 8),
        'note', 'Thank you for your business.', 'payment_term', jsonb_build_object('term_type', 'DUE_ON_RECEIPT')
      ),
      'invoicer', jsonb_build_object('business_name', left(coalesce(nullif(trim(p_business_name), ''), 'FieldNote Services'), 100)),
      'primary_recipients', jsonb_build_array(jsonb_build_object('billing_info', jsonb_build_object('business_name', customer.name, 'email_address', customer.email))),
      'items', items
    )
  ) returning * into invoice;
  return invoice;
end;
$$;
revoke all on function public.reserve_paypal_invoice(uuid, text) from public, anon;
grant execute on function public.reserve_paypal_invoice(uuid, text) to authenticated;

create function public.save_note_review(p_note_id uuid, p_items jsonb, p_approve boolean)
returns void language plpgsql security invoker set search_path = '' as $$
declare note public.field_notes;
begin
  select * into note from public.field_notes
    where id = p_note_id and owner_id = (select auth.uid()) for update;
  if not found then raise exception 'Field note not found.'; end if;
  if note.status = 'invoiced' or exists (select 1 from public.paypal_invoices where field_note_id = p_note_id) then
    raise exception 'Invoice creation has started. Line items are locked.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 100 then
    raise exception 'A review needs between 1 and 100 line items.';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items) as i(id uuid, catalog_item_id uuid, description text, quantity numeric, unit_price_cents integer)
    where i.description is null or char_length(trim(i.description)) not between 1 and 240
      or i.quantity is null or i.quantity <= 0 or i.quantity > 1000000
      or i.quantity <> round(i.quantity, 2) or i.unit_price_cents is null or i.unit_price_cents < 0 or i.unit_price_cents > 100000000
      or (i.id is not null and not exists (select 1 from public.note_line_items where id = i.id and field_note_id = p_note_id))
      or (i.catalog_item_id is not null and not exists (select 1 from public.catalog_items where id = i.catalog_item_id))
  ) then raise exception 'Check every line item and selected price-book entry.'; end if;
  if exists (select 1 from jsonb_to_recordset(p_items) as i(id uuid) where id is not null group by id having count(*) > 1) then
    raise exception 'Duplicate line item IDs are not allowed.';
  end if;
  delete from public.note_line_items where field_note_id = p_note_id
    and id not in (select i.id from jsonb_to_recordset(p_items) as i(id uuid) where i.id is not null);
  insert into public.note_line_items(id, field_note_id, catalog_item_id, description, quantity, unit_price_cents)
    select coalesce(i.id, gen_random_uuid()), p_note_id, i.catalog_item_id, trim(i.description), i.quantity, i.unit_price_cents
    from jsonb_to_recordset(p_items) as i(id uuid, catalog_item_id uuid, description text, quantity numeric, unit_price_cents integer)
    on conflict (id) do update set catalog_item_id = excluded.catalog_item_id,
      description = excluded.description, quantity = excluded.quantity, unit_price_cents = excluded.unit_price_cents;
  update public.field_notes set status = case when p_approve then 'reviewed' else 'draft' end, updated_at = now() where id = p_note_id;
end;
$$;
revoke all on function public.save_note_review(uuid, jsonb, boolean) from public, anon;
grant execute on function public.save_note_review(uuid, jsonb, boolean) to authenticated;

create function public.sync_paypal_invoice(p_invoice_id uuid, p_details jsonb, p_observed_at timestamptz,
  p_event_id text default null, p_event_type text default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare invoice public.paypal_invoices; next_status text;
begin
  if p_event_id is not null and current_user <> 'service_role' then raise exception 'Webhook access denied.'; end if;
  -- Match the reservation/review lock order to avoid deadlocks.
  perform 1 from public.field_notes where id = (select field_note_id from public.paypal_invoices where id = p_invoice_id) for update;
  select * into invoice from public.paypal_invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found.'; end if;
  if invoice.paypal_invoice_id is not null and invoice.paypal_invoice_id is distinct from (p_details->>'id') then
    raise exception 'PayPal invoice ID mismatch.';
  end if;
  next_status := upper(p_details->>'status');
  if next_status is null or next_status !~ '^[A-Z_]{1,40}$' then raise exception 'Invalid invoice status.'; end if;
  if p_event_id is not null then
    insert into fieldnote_private.paypal_webhook_events(event_id, invoice_id, event_type)
      values (p_event_id, invoice.id, p_event_type) on conflict (event_id) do nothing;
    if not found then return invoice.field_note_id; end if;
  end if;
  if invoice.last_synced_at is not null and p_observed_at < invoice.last_synced_at then return invoice.field_note_id; end if;
  update public.paypal_invoices set paypal_invoice_id = p_details->>'id',
    invoice_number = p_details#>>'{detail,invoice_number}', status = next_status,
    recipient_view_url = p_details#>>'{detail,metadata,recipient_view_url}',
    invoicer_view_url = p_details#>>'{detail,metadata,invoicer_view_url}',
    last_synced_at = p_observed_at, last_error = null, updated_at = now() where id = invoice.id;
  if next_status in ('SENT', 'UNPAID', 'PAYMENT_PENDING', 'PARTIALLY_PAID', 'PAID', 'MARKED_AS_PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'MARKED_AS_REFUNDED') then
    update public.field_notes set status = 'invoiced', updated_at = now() where id = invoice.field_note_id;
  end if;
  return invoice.field_note_id;
end;
$$;
revoke all on function public.sync_paypal_invoice(uuid, jsonb, timestamptz, text, text) from public, anon;
grant execute on function public.sync_paypal_invoice(uuid, jsonb, timestamptz, text, text) to authenticated, service_role;
