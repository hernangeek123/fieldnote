create index note_line_items_owner_id_idx
  on public.note_line_items(owner_id);

create index note_line_items_catalog_item_id_idx
  on public.note_line_items(catalog_item_id);
