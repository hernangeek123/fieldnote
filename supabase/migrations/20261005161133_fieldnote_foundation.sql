create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  unit text not null default 'job' check (char_length(unit) between 1 and 40),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.field_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  raw_note text not null check (char_length(raw_note) between 1 and 10000),
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'invoiced')),
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.note_line_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  field_note_id uuid not null references public.field_notes(id) on delete cascade,
  catalog_item_id uuid references public.catalog_items(id) on delete set null,
  description text not null check (char_length(description) between 1 and 240),
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now()
);

create index customers_owner_id_idx on public.customers(owner_id);
create index catalog_items_owner_id_idx on public.catalog_items(owner_id);
create index field_notes_owner_id_created_at_idx on public.field_notes(owner_id, created_at desc);
create index field_notes_customer_id_idx on public.field_notes(customer_id);
create index note_line_items_field_note_id_idx on public.note_line_items(field_note_id);

alter table public.customers enable row level security;
alter table public.catalog_items enable row level security;
alter table public.field_notes enable row level security;
alter table public.note_line_items enable row level security;

create policy "customers_select_own" on public.customers
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "customers_insert_own" on public.customers
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "customers_update_own" on public.customers
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "customers_delete_own" on public.customers
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "catalog_items_select_own" on public.catalog_items
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "catalog_items_insert_own" on public.catalog_items
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "catalog_items_update_own" on public.catalog_items
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "catalog_items_delete_own" on public.catalog_items
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "field_notes_select_own" on public.field_notes
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "field_notes_insert_own" on public.field_notes
  for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and (
      customer_id is null
      or exists (
        select 1 from public.customers
        where customers.id = customer_id
          and customers.owner_id = (select auth.uid())
      )
    )
  );
create policy "field_notes_update_own" on public.field_notes
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and (
      customer_id is null
      or exists (
        select 1 from public.customers
        where customers.id = customer_id
          and customers.owner_id = (select auth.uid())
      )
    )
  );
create policy "field_notes_delete_own" on public.field_notes
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "note_line_items_select_own" on public.note_line_items
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "note_line_items_insert_own" on public.note_line_items
  for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.field_notes
      where field_notes.id = field_note_id
        and field_notes.owner_id = (select auth.uid())
    )
    and (
      catalog_item_id is null
      or exists (
        select 1 from public.catalog_items
        where catalog_items.id = catalog_item_id
          and catalog_items.owner_id = (select auth.uid())
      )
    )
  );
create policy "note_line_items_update_own" on public.note_line_items
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.field_notes
      where field_notes.id = field_note_id
        and field_notes.owner_id = (select auth.uid())
    )
    and (
      catalog_item_id is null
      or exists (
        select 1 from public.catalog_items
        where catalog_items.id = catalog_item_id
          and catalog_items.owner_id = (select auth.uid())
      )
    )
  );
create policy "note_line_items_delete_own" on public.note_line_items
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

revoke all on table public.customers from anon;
revoke all on table public.catalog_items from anon;
revoke all on table public.field_notes from anon;
revoke all on table public.note_line_items from anon;

grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert, update, delete on table public.catalog_items to authenticated;
grant select, insert, update, delete on table public.field_notes to authenticated;
grant select, insert, update, delete on table public.note_line_items to authenticated;
