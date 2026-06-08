-- =============================================================
-- Dexlab — contraintes CHECK optionnelles (défense en profondeur)
-- L'UI contraint déjà ces valeurs (selects) ; ceci verrouille au niveau base.
-- À exécuter dans Supabase → SQL Editor si souhaité.
-- =============================================================

alter table materiel drop constraint if exists materiel_centrifugation_chk;
alter table materiel add constraint materiel_centrifugation_chk
  check (centrifugation in ('oui', 'obligatoire', 'non', 'variable', 'na'));

alter table materiel drop constraint if exists materiel_couleur_chk;
alter table materiel add constraint materiel_couleur_chk
  check (couleur ~ '^#[0-9A-Fa-f]{6}$' or couleur = '');

alter table documents drop constraint if exists documents_type_chk;
alter table documents add constraint documents_type_chk
  check (type in ('note', 'memo', 'procedure'));
