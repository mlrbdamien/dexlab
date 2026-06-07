-- =============================================================
-- Dexlab — seed (généré depuis src/data/*). NE PAS éditer à la main.
-- Prérequis : avoir exécuté supabase/schema.sql.
-- Idempotent : vide les tables puis ré-insère.
-- =============================================================
begin;
truncate materiel_document, documents, materiel restart identity cascade;

insert into materiel
  (type, nom, sous_titre, etiquette, couleur, centrifugation, centrifugation_detail,
   code_exces, code_sans_analyse, code_reserve, destinations, notes, alertes, cas_particuliers, position)
values
  ('tube', 'Brun', 'Sérum', '1 ou 1XXX', '#6D4C2A', 'oui', 'Peut être centrifugé', 'S-SUP / S-SUP2', 'S-TUB', 'SRES', '[{"label":"8100","detail":"Centrifugé → tiroir Centrifugés"},{"label":"8100","detail":"Non centrifugé → tiroir Non-Centrifugés"},{"label":"Statif bleu","detail":"Non conforme ou étiq. secondaire"}]'::jsonb, ARRAY['Plusieurs S-SUP/S-SUP2 → « D » sur chaque tube', 'Faux-fond + brun même patient → faux-fond chaîne, brun statif jaune']::text[], ARRAY[]::text[], ARRAY[]::text[], 0),
  ('tube', 'Corail / Blanc', 'Sérum sans gel', '80 ou 1', '#C0623A', 'oui', 'Peut être centrifugé', 'S-SUPSG (pédia→S-SUP)', 'S-TUBSG (pédia→S-TUB)', '', '[{"label":"8100","detail":"Centrifugé → tiroir Centrifugés"},{"label":"8100","detail":"Non centrifugé → tiroir Non-Centrifugés"},{"label":"Statif bleu","detail":"Non conforme ou étiq. secondaire"}]'::jsonb, ARRAY['Plusieurs S-SUPSG → « D »', 'Tube abri lumière → TAB chimie']::text[], ARRAY[]::text[], ARRAY[]::text[], 1),
  ('tube', 'Vert', 'Plasma hépariné', '80 ou 1', '#2E7D32', 'oui', 'Peut être centrifugé', 'PHSUP (tox→BHTOX)', 'PHTUB', '', '[{"label":"8100","detail":"Étiq. chiffre blanc sans sec."},{"label":"Statif bleu","detail":"Étiq. chiffre noir ou sec."},{"label":"Hémato","detail":""},{"label":"Envoi","detail":""}]'::jsonb, ARRAY['Plusieurs PHSUP → « D »']::text[], ARRAY[]::text[], ARRAY[]::text[], 2),
  ('tube', 'Gris clair', 'Plasma fluoré', '4 ou 4TXX', '#7B8C98', 'obligatoire', 'Obligatoirement centrifugé', 'PFSUP', 'PFTUB', '', '[{"label":"8100","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 3),
  ('tube', 'Violet petit', 'EDTA 2,6 mL', '6', '#6A1B9A', 'oui', 'Peut être centrifugé', 'BESUP', 'BETUB', '', '[{"label":"8100","detail":"Étiq. chiffre blanc sans sec."},{"label":"Statif bleu","detail":"Étiq. chiffre noir ou sec."},{"label":"Hémato","detail":"Rouleau (pas sec.) · Statif rouge sinon"},{"label":"Génétique","detail":""},{"label":"Envoi","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY['1 tube hémato+chimie/tox → en hémato, noter « hémato » sur étiq. chimie → statif bleu', '1 EDTA + 1 thromboexact → les 2 en hémato + même marquage', '1 EDTA + autres labos → voir TABs, sinon contacter requérant']::text[], 4),
  ('tube', 'Violet grand', 'EDTA 7,5 mL', '7', '#4A148C', 'variable', 'Selon destination et volume', 'BESUP (urg/ext)', 'CE-00', '', '[{"label":"Hémato","detail":""},{"label":"MM","detail":"Statif violet"},{"label":"Envoi","detail":"Bac/Frigo/Congélateur"}]'::jsonb, ARRAY['Feuilles lecteur optique → signature préleveur', 'Étiq. 6 collable sur grand si pas petit EDTA']::text[], ARRAY['Urgences/externes → BESUP (pas CE-00) si déjà petit EDTA/BETUB']::text[], ARRAY['Envoi Cery 7,5ml → 8100 ok', 'Envoi Cery 2,6ml → centrifuger+décanter manuellement']::text[], 5),
  ('tube', 'Rouge foncé', 'Thromboexact', '6', '#7F0000', 'non', 'Ne peut pas être centrifugé', '', '', '', '[{"label":"Hémato","detail":""}]'::jsonb, ARRAY['Thromboexact + petit EDTA chimie+hémato → 2 en hémato, indiquer chimie']::text[], ARRAY[]::text[], ARRAY[]::text[], 6),
  ('tube', 'Bleu', 'Plasma citraté', '5', '#1565C0', 'non', 'Ne peut pas être centrifugé', 'PCSUP', 'PCTUB', '', '[{"label":"Hémato","detail":"Statif rouge"}]'::jsonb, ARRAY['Plusieurs PCSUP → marque bouchons', 'Fenêtre visible au collage']::text[], ARRAY[]::text[], ARRAY[]::text[], 7),
  ('tube', 'Gris foncé / Noir', 'Sang citraté (VS)', '8', '#37474F', 'non', 'Ne peut pas être centrifugé', 'BCSUP', 'BCTUB', '', '[{"label":"Hémato","detail":"Rouleau"}]'::jsonb, ARRAY[]::text[], ARRAY['NE PAS coller étiq. « 8 ». Donner « 8 » + « Hv » en hémato.']::text[], ARRAY[]::text[], 8),
  ('tube', 'LCR', 'céphalo-rachidien', '10', '#00695C', 'non', 'Ne peut pas être centrifugé', 'LQRES', '', 'LQRES', '[{"label":"Chimie","detail":"Tube N°1"},{"label":"Bactério/MM/IS","detail":"Tube N°2"},{"label":"Hémato","detail":"Tube N°3"},{"label":"Immunochimie","detail":"N°4 (« C Pl> ») → statif bleu"},{"label":"IS","detail":"Tube N°5"},{"label":"Statif violet","detail":"Suppl. → LQRES"}]'::jsonb, ARRAY['Tube stérile PP → FP-7711', 'Répartition → FP-11538']::text[], ARRAY['Cytologie 07h30-16h30 → téléphoner', 'Après 16h30 → feuille+tube en hémato', 'Tube abri lumière → TAB chimie rapidement']::text[], ARRAY[]::text[], 9),
  ('tube', 'Urine (Vacutainer)', '', '30', '#827717', 'oui', 'Peut être centrifugé', 'U-SUP', 'U-TUB', '', '[{"label":"8100","detail":"Si centrifugeable"},{"label":"Statif bleu","detail":"Début 8100"},{"label":"MM","detail":"Statif violet"},{"label":"Bactério","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY['Sédiment (30 SED) → statif bleu + étiq. réserve', 'Dosages+sédiment → répartir selon étiquettes', '1 tube / étiq. pH → statif bleu', 'Commun chimie+bactério → si rapide sinon 2ème tube', 'Urines 24h → volume+période. Clearance → poids+taille → table 8100']::text[], 10),
  ('tube', 'Urine (Flacon stérile)', '', '30', '#5D4037', 'na', 'Non applicable', '', '', '', '[{"label":"Chimie","detail":"Statif bleu"},{"label":"MM","detail":"Statif violet"},{"label":"Bactério","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 11),
  ('tube', 'Urine 24h', 'Flacon brun', '39', '#4E342E', 'na', 'Non applicable', '', '', '', '[{"label":"Chimie","detail":"Statif bleu"}]'::jsonb, ARRAY['Vérifier volume+période', 'Clearance → poids+taille']::text[], ARRAY[]::text[], ARRAY[]::text[], 12),
  ('tube', 'Urine ac. borique', 'Vacutrainer', '65', '#E65100', 'na', 'Non applicable', '', '', '', '[{"label":"Bactério","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 13),
  ('tube', 'Pot à selles', 'Selles', '45', '#6D4C41', 'na', 'Non applicable', '', '', '', '[{"label":"MM","detail":"Statif violet"},{"label":"Bactério","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 14),
  ('tube', 'Sang occulte', 'Selles', '50', '#4E342E', 'na', 'Non applicable', '', '', '', '[{"label":"MM","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 15),
  ('tube', 'Buvard', 'Spot sang séché', '60', '#BF360C', 'na', 'Non applicable', '', '', '', '[{"label":"Envoi","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 16),
  ('tube', 'JC Virus', 'Sang', '49', '#880E4F', 'na', 'Non applicable', '', '', '', '[{"label":"Envoi","detail":""}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 17),
  ('tube', 'Sang perchloré', 'Tube pyr/lac', '3', '#B71C1C', 'na', 'Non applicable', '', '', '', '[{"label":"Envoi","detail":"Chambre froide"}]'::jsonb, ARRAY['Protocole+tube chambre froide']::text[], ARRAY[]::text[], ARRAY[]::text[], 18),
  ('tube', 'Azathioprine', 'Sg hép+DTT+Hémogr.', '12', '#311B92', 'na', 'Non applicable', '', '', '', '[{"label":"Envoi","detail":"Congélateur"}]'::jsonb, ARRAY['Imurek']::text[], ARRAY[]::text[], ARRAY[]::text[], 19),
  ('tube', 'Streck Cell-Free DNA', 'Sang Streck', '70', '#1A237E', 'na', 'Non applicable', '', '', '', '[{"label":"Envoi","detail":"Pour DPNI"}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 20),
  ('tube', 'Protéine Tau/14-3-3', 'LCR (tube PP)', '22', '#004D40', 'na', 'Non applicable', '', '', '', '[{"label":"Envoi","detail":"FP-7711 · TAB pour microtubes"}]'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 21);

insert into documents (type, titre, contenu, tags, position) values
  ('procedure', 'Enregistrement', '## 1.1 Demande des hôpitaux

Un dito doit être lu informatiquement. Si ce n''est pas le cas :

- Vérifier que l''établissement soit correct 
- Si incorrect → dérouler le menu, chercher l''établissement correct, doucher le n° d''admission

## 1.2 Demande requérant privé

- Ligne de cas existe déjà (écran 309) → sélectionner celle-là
- Petits ditos (liste dans Établissements) → sélectionner établissement, doucher code-barre ou N° patient
- N°admission avec # → modifier et changer avec N° patient du dito
- Labo privé avec N° référence → écran 100, Généralité → Référence

## 1.4 Rajout d''analyses

Feuilles sans prélèvement = rajout. Toujours sur demande contenant le matériel.

      **Non facturée :**

- Prescr. connectée : ajouter codes, enregistrer, imprimer étoile, tracer NLab, coller
- Lecteur optique : cocher « B », passer au lecteur, choisir demande avec matériel

      **Facturée :**

- Nouvelle demande, même date prélèvement
- « rajout sur NLAB XXX-XXXXX » dans Données cliniques > Libellé
- Transmettre étiquettes au labo

      *Requérant différent → mettre en copie. Étiq. « rajout » pour hémato et MM uniquement.*

## 1.5 Demande activée ou inexistante

1. Pré-demandes (écran 114) ou effacées (écran 117)
2. Appeler service : 5-6 → nouvelle feuille ou tubes en réserve
3. Requérant injoignable → sérum `S-TUB`, tube hémato → voir hématologie

## 1.6 Copies

- **Par mail** : Diffusion → croix jaune → « + ». Introuvable → copies libres
- **Privé → méd. hospitalier** : copie libre + mail annuaire
- **Service → méd. hospitalier** : pas nécessaire
- **Service → privé** : « + ». Introuvable → bac feuilles à problème
- **Copie patient** : « 1 » sous Patient, onglet Diffusion
- **Patient par mail** : écran 310, Transmission résultats, Diffusion 1 = mail

      *Introuvable → enregistrer sans copie + bac vert feuilles à problème.*

## ⚠ Demandes à NE PAS enregistrer

- Bactériologie (sauf codes GeneXpert)
- Produits sanguins sans tube → Immunohématologie

      *Doute requérant → temporaire 02 + bac vert. Attention multiples feuilles.*', ARRAY['enregistrement']::text[], 0),
  ('procedure', 'Feuilles à transmettre', '| Labo | Condition | Lieu | Action spéciale |
| --- | --- | --- | --- |
| HÉMATO | Commande produits sanguins | Entrée labo hémato | Pas de tube → transmettre sans enregistrer |
| HÉMATO | Étiquette He> | Entrée labo hémato | Copie + originale en hémato |
| HÉMATO | Immunohémato + commande PSL | Entrée labo hémato | ⚠ Vérifier signature ! Sinon copie + renvoyer + incident |
| CHIMIE | LCR, micro-tubes, temps prélèv., tests spéciaux | Table du 8100 | Micro-tubes : dans pochette |
| MM | Toujours | Bac sous statif violet | — |
| IS | Toujours | Bac sous statif orange | — |
| TOXICOLOGIE | Étiq. « C Copie> » « Tox ! » | Bac Toxicologie | — |
| FERTILITÉ | Dépistages prénataux 1er+2ème trim. | Bac prénataux | Copie → bac feuilles à contrôler |
| GÉNÉTIQUE | Toujours | Bac génétique frigo côté 8100 | T° ambiante → panier blanc. Commun → copie |', ARRAY['feuilles', 'transmission']::text[], 1),
  ('procedure', 'Statifs de tri', '- 🔵 **Bleu** — Non 8100 → table du 8100
- 🟣 **Violet** — MM → poste 1 enreg.
- 🟠 **Orange** — IS → poste 1 enreg.
- 🔴 **Rouge** — Hémato → entrée labo
- 🟡 **Jaune** — Archivage → table poste 1
- ⚪ **Gris** — Envois → frigo côté 8100', ARRAY['statifs', 'tri']::text[], 2),
  ('procedure', 'Étiquettes', '## Descriptions

- **Chiffre → Tube primaire** — Les tubes mères sont étiquetés avec des étiquettes commençant par un chiffre (1, 4, 5, 6, 7, 8…)
- **Lettre → Tube secondaire** — Indique le labo destinataire : H Hémato · C Chimie · IS Immuno · MM MM · G Génétique
- **Avec > → Ne pas décanter** — Transférer l''étiquette à l''unité concernée .
- **Avec ! → Avertir** — Avertir le laboratoire concerné oralement ou par téléphone immédiatement.
- **Transferts par labo** — C XXX> Chimie · H XXX> Hémato · IS XXX> IS · MM XXX> MM · G XXX> Génétique
- **LSITE** — Site exécutant des analyses liées à cette étiquette.
- **Infos diverses** — Au fond à gauche : textes d''info (LCR, Pas_8100, etc.)

## Formats

- ✅ **À centrifuger** — Format standard, chiffres sur fond blanc.
- ⛔ **Ne pas centrifuger** — N° d''étiquette sur fond noir.
- ❄ **Centrifuger à froid** — *** visible sur l''étiquette.
- 🌑 **Abri de la lumière** — Identité sur fond noir.
- 🌑⛔ **Ne pas centri. + Abri lumière** — Identité + N° d''étiquette sur fond noir.
- 🔄 **Décantage** — Étiquette spécifique de décantage.
- 📦 **Envois** — Étiquette spécifique pour les envois externes.
- ℹ️ **Information** — Étiquette d''information (ex : FORMULAIRE/COPIE).

## Ré-impression (écran 105 DGLab)

| Étiquette | N° |
| --- | --- |
| 1 | 101 |
| 1'' | 115 |
| 2 | 102 |
| 5 | 150 |
| 6 non centri | 161 |
| 6 centri | 160 |
| SERO 9 | 909 |
| IS AUT | 901 |
| IS PRUN | 902 |
| IS IF | 903 |
| M-AER | 951 |
| M-ANA | 952 |

_Cocher « Seul. suppl. » et saisir le N° dans le champ « Supplémentaires »._

## Règles de collage

- 📌 **Positionnement** — Coller en laissant visibles le nom et prénom inscrits sur le tube. Tubes bleu clair → laisser une fenêtre visible.
- ✱ **Feuille lecteur optique** — Coller une étiquette ✱ sur la demande (verticalement en haut à gauche).
- ∅ **Échantillon manquant** — Prévenir immédiatement le requérant → imprimer l''étiquette du tube manquant, inscrire « ∅ » → transmettre au labo concerné.
- 🗑 **Confidentialité** — Étiquettes surnuméraires + ruban encreur → poubelles jaunes.
- ✓ **Vérifications** — Concordance nom, prénom et NLab entre étiquettes, feuille et tube. Vérifier le remplissage. Viser la feuille de demande.', ARRAY['etiquettes']::text[], 3),
  ('procedure', 'Check-in', '- ✓ **Automatique** — Tubes conformes 8100 sans pré-analytique particulière.
- ✋ **Manuel** — Tous les autres tubes.
- ❄ **Congelés IS/MM/Tox** — Sortir sagex → congélateur poste envois → étiq. au labo.
- ❄ **Congelés Chimie/Hémato** — Laisser dans sagex → statif du labo.', ARRAY['checkin']::text[], 4),
  ('procedure', 'Sérothèque', '- **Sérum réserve** — `SRES`
- **LCR réserve** — `LQRES`
- **Tous tubes sérum** — `SREST` · (Neuro, Hôp. jour) Étiq. « 1 » + feuille/étiq/tubes → poste 8100.', ARRAY['serotheque']::text[], 5),
  ('procedure', 'Gestion par labo', '### 🔬 Chimie

- Conformes → 8100 (sauf: pas centri., pré-analytique spéc., étiq. sec., matériel insuffisant)
- Non conformes → statif bleu
- Micro-tubes : étiq. « 1 » (ne PAS coller), pochette côté statif bleu, avertir 8100
- Thermos → statif bleu + avertir TAB chimie
- Pas sur 8100 si : matériel insuffisant, surnageant rougeâtre, gel oblique, étiq. fond noir, non conforme, étiq. secondaire
- Tiroirs : Non centri. → « Non-Centrifugés » · Centri. → « Centrifugés » · Faux-fond → « B-lines avec bouchons »
- Faux-fond + brun même patient → faux-fond chaîne, brun statif jaune

### 🩸 Hématologie

- EDTA sans étiq. sec. + gris foncés → rouleau
- Bleu clair, stérile, autres → statif rouge

### 🧫 Immuno-sérologie

- Sérum conforme → 8100 si assez matériel
- Autres sérum → statif bleu · Autre tube → statif orange

### 🧬 MM

- Tous → statif violet

### 🦠 Bactério

- Pochette+feuille → bac noir · LCR → tél. (heures ouverture)

### 🧪 Génétique

- T° ambiante → panier blanc · Sinon → chambre froide · « Tel gen » → contacter

### 📦 Envois

- Selon étiq.: chaîne, frigo, congélateur ou T° ambiante · ANASPB si besoin
- WE/nuit : frigo statif gris · Congelés → congélateur envois · T° amb. → bac Centralisation', ARRAY['gestion']::text[], 6),
  ('procedure', 'Cas particuliers', '- 🔬 **Cytologie** — Tubes coniques jaunes → codes CXXX (pas FXXX).
- 🏥 **CHUV neuro-immuno** — Si seul → pochette frigo + message bac feuilles à problème.
- 💰 **LAI, LAA, LAM** — Maternité, invalidité, accident, militaire → enregistrer + bac feuilles à problème.
- 🚑 **Accidents professionnels** — → Procédure Wiki', ARRAY['cas']::text[], 7),
  ('memo', 'Checklist enregistrement', '- [ ] Vérifier identité tubes = feuille (y.c. micro-tubes)
- [ ] Lecteur optique : nb codes = nb coches
- [ ] Prescr. connectée : nb tubes = nb écran, étiquettes OK, NLab OK
- [ ] Post-it actif (billet jaune) ?
- [ ] Annotations → Données cliniques > Libellé
- [ ] Codes manuscrits → ajouter manuellement
- [ ] Code introuvable DGLab → fichier ANASPB
- [ ] Visa HAUT = étiquetage · Visa BAS = enregistrement
- [ ] Vérifier remplissage des tubes
- [ ] Échantillon manquant → prévenir requérant, inscrire ∅', ARRAY['checklist', 'rappels']::text[], 8);

commit;
