-- PayPal chooses its merchant-local current date; UTC can be tomorrow locally.
-- Existing reservations keep their exact original retry payload.
create or replace function public.reserve_paypal_invoice(p_note_id uuid, p_business_name text)
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
        'currency_code', 'USD',
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
