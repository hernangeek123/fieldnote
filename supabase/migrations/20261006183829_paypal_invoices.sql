create table public.paypal_invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  field_note_id uuid not null unique references public.field_notes(id) on delete cascade,
  paypal_invoice_id text unique,
  invoice_number text,
  status text not null default 'CREATING'
    check (status ~ '^[A-Z_]{1,40}$'),
  create_request_id uuid not null default gen_random_uuid(),
  send_request_id uuid not null default gen_random_uuid(),
  recipient_view_url text check (recipient_view_url is null or char_length(recipient_view_url) <= 2000),
  invoicer_view_url text check (invoicer_view_url is null or char_length(invoicer_view_url) <= 2000),
  last_error text check (last_error is null or char_length(last_error) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index paypal_invoices_owner_id_idx on public.paypal_invoices(owner_id);

alter table public.paypal_invoices enable row level security;

create policy "paypal_invoices_select_own" on public.paypal_invoices
  for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "paypal_invoices_insert_own" on public.paypal_invoices
  for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.field_notes
      where field_notes.id = field_note_id
        and field_notes.owner_id = (select auth.uid())
        and field_notes.status = 'reviewed'
    )
  );

create policy "paypal_invoices_update_own" on public.paypal_invoices
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.field_notes
      where field_notes.id = field_note_id
        and field_notes.owner_id = (select auth.uid())
    )
  );

revoke all on table public.paypal_invoices from anon, authenticated;
grant select, insert, update on table public.paypal_invoices to authenticated;
