-- =============================================================
-- Dexlab — schéma Supabase (v1, à relire)
-- Domaines :
--   • materiel           : items structurés (tubes élargis : consommables, contenants…)
--   • documents          : notes / mémos / procédures (markdown, tags, épinglage)
--   • materiel_document  : références croisées (N-N)
-- Accès : MUR D'AUTHENTIFICATION
--   → lecture ET écriture réservées aux utilisateurs connectés (authenticated).
--   → 'anon' (non connecté) n'a aucune policy ⇒ aucun accès. Login obligatoire.
-- Pas de données confidentielles/RGPD stockées (décision projet).
-- =============================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ----------------------------------------------------------------
-- MATÉRIEL
-- ----------------------------------------------------------------
create table if not exists materiel (
  id                    uuid primary key default gen_random_uuid(),
  type                  text not null default 'tube',   -- 'tube' | 'consommable' | 'contenant' | …
  nom                   text not null,
  sous_titre            text not null default '',
  etiquette             text not null default '',
  couleur               text not null default '',       -- hex de la pastille
  centrifugation        text not null default 'na',     -- oui|obligatoire|non|variable|na
  centrifugation_detail text not null default '',
  code_exces            text not null default '',
  code_sans_analyse     text not null default '',
  code_reserve          text not null default '',
  destinations          jsonb not null default '[]'::jsonb,  -- [{ "label": "...", "detail": "..." }]
  notes                 text[] not null default '{}',
  alertes               text[] not null default '{}',
  cas_particuliers      text[] not null default '{}',
  position              int  not null default 0,         -- ordre d'affichage
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- DOCUMENTS (notes / mémos / procédures)
-- ----------------------------------------------------------------
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  type        text not null default 'note',  -- 'note' | 'memo' | 'procedure'
  titre       text not null,
  contenu     text not null default '',      -- markdown
  tags        text[] not null default '{}',
  epingle     boolean not null default false,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- LIAISON Matériel <-> Document (références croisées)
-- ----------------------------------------------------------------
create table if not exists materiel_document (
  materiel_id uuid not null references materiel(id)  on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  primary key (materiel_id, document_id)
);

create index if not exists idx_md_materiel  on materiel_document(materiel_id);
create index if not exists idx_md_document  on materiel_document(document_id);

-- ----------------------------------------------------------------
-- updated_at automatique
-- ----------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_materiel_updated on materiel;
create trigger trg_materiel_updated  before update on materiel  for each row execute function set_updated_at();

drop trigger if exists trg_documents_updated on documents;
create trigger trg_documents_updated before update on documents for each row execute function set_updated_at();

-- ----------------------------------------------------------------
-- RLS — mur d'authentification (tout réservé aux connectés)
-- v1 : tout utilisateur authentifié peut lire ET écrire (personnel de labo,
--      comptes créés par l'admin). Rôles éditeur/lecteur ajoutables plus tard
--      via une table profiles + check de rôle.
-- ----------------------------------------------------------------
alter table materiel          enable row level security;
alter table documents         enable row level security;
alter table materiel_document enable row level security;

create policy "materiel_rw"  on materiel          for all to authenticated using (true) with check (true);
create policy "documents_rw" on documents         for all to authenticated using (true) with check (true);
create policy "link_rw"      on materiel_document  for all to authenticated using (true) with check (true);
