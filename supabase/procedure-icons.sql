-- =============================================================
-- Dexlab — Icône par document (procédures notamment)
-- À exécuter dans Supabase → SQL Editor (après schema.sql). Idempotent.
-- =============================================================
-- Stocke le nom d'une icône (lucide-react) choisie par l'utilisateur dans
-- une bibliothèque. Nullable → repli sur l'icône par défaut côté app.
alter table documents add column if not exists icon text;
