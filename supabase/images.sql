-- =============================================================
-- Dexlab — Images / pièces jointes (Storage privé + table media)
-- À exécuter dans Supabase → SQL Editor (après schema.sql).
-- Idempotent.
-- =============================================================

-- ----------------------------------------------------------------
-- Bucket Storage PRIVÉ « media » (accès via URLs signées, derrière l'auth)
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- Policies sur les objets du bucket : lecture + écriture réservées aux connectés
drop policy if exists "media_obj_read" on storage.objects;
create policy "media_obj_read" on storage.objects for select to authenticated
  using (bucket_id = 'media');

drop policy if exists "media_obj_insert" on storage.objects;
create policy "media_obj_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media_obj_delete" on storage.objects;
create policy "media_obj_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media');

-- ----------------------------------------------------------------
-- Table media : métadonnées des images, rattachées à UN matériel OU UN document
-- ----------------------------------------------------------------
create table if not exists media (
  id          uuid primary key default gen_random_uuid(),
  materiel_id uuid references materiel(id)  on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  path        text not null,                 -- chemin de l'objet dans le bucket
  caption     text not null default '',
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  constraint media_one_parent check (num_nonnulls(materiel_id, document_id) = 1)
);
create index if not exists idx_media_materiel on media(materiel_id);
create index if not exists idx_media_document on media(document_id);

alter table media enable row level security;
drop policy if exists "media_rw" on media;
create policy "media_rw" on media for all to authenticated using (true) with check (true);
