-- =============================================================
-- Dexlab — Traçabilité (historique complet) + profils
-- À exécuter dans Supabase → SQL Editor (après schema.sql).
-- Idempotent : ré-exécutable sans risque.
-- =============================================================

-- ----------------------------------------------------------------
-- PROFILES : id utilisateur → nom affiché (pour « modifié par X »
-- et base des futurs rôles éditeur/lecteur).
-- ----------------------------------------------------------------
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at   timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_read" on profiles;
create policy "profiles_read" on profiles for select to authenticated using (true);

drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Création automatique du profil à l'inscription
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- Backfill des comptes déjà existants
insert into public.profiles (id, display_name)
  select id, coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)) from auth.users
  on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- Colonnes auteur (résumé « modifié par … le … » sans requêter le log)
-- ----------------------------------------------------------------
alter table materiel  add column if not exists created_by uuid default auth.uid();
alter table materiel  add column if not exists updated_by uuid;
alter table documents add column if not exists created_by uuid default auth.uid();
alter table documents add column if not exists updated_by uuid;

-- set_updated_at met aussi à jour updated_by
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------
-- AUDIT_LOG : journal complet insert / update / delete
-- ----------------------------------------------------------------
create table if not exists audit_log (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  row_id      uuid not null,
  action      text not null,                 -- INSERT | UPDATE | DELETE
  changed_by  uuid default auth.uid(),
  changed_at  timestamptz not null default now(),
  old_data    jsonb,
  new_data    jsonb
);
create index if not exists idx_audit_row on audit_log(table_name, row_id, changed_at desc);

alter table audit_log enable row level security;
drop policy if exists "audit_read" on audit_log;
create policy "audit_read" on audit_log for select to authenticated using (true);
-- aucune policy d'écriture : seul le trigger (security definer) écrit

create or replace function audit_trigger() returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    insert into audit_log(table_name, row_id, action, old_data)
      values (tg_table_name, old.id, 'DELETE', to_jsonb(old));
    return old;
  elsif (tg_op = 'UPDATE') then
    insert into audit_log(table_name, row_id, action, old_data, new_data)
      values (tg_table_name, new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
    return new;
  else
    insert into audit_log(table_name, row_id, action, new_data)
      values (tg_table_name, new.id, 'INSERT', to_jsonb(new));
    return new;
  end if;
end;
$$ language plpgsql security definer;

drop trigger if exists audit_materiel on materiel;
create trigger audit_materiel after insert or update or delete on materiel
  for each row execute function audit_trigger();

drop trigger if exists audit_documents on documents;
create trigger audit_documents after insert or update or delete on documents
  for each row execute function audit_trigger();
