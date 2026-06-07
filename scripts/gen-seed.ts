/**
 * Génère supabase/seed.sql à partir des données actuelles (src/data/*).
 * Lancer : npx tsx scripts/gen-seed.ts
 * Puis coller le contenu de supabase/seed.sql dans Supabase → SQL Editor → Run
 * (après avoir exécuté supabase/schema.sql). Le SQL Editor s'exécute en rôle
 * postgres → contourne la RLS, pas besoin de la service_role.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { tubes } from '../src/data/tubes'
import {
  etapesEnregistrement, reglesTransmission, statifs, reglesCheckin,
  codesSerotheque, gestionParLabo, casParticuliers, checklist,
} from '../src/data/protocoles'
import {
  etiquettesDescription, etiquettesFormat, etiquettesReimpression,
  reglesCollage, reimpressionNote,
} from '../src/data/etiquettes'

// ---------- helpers SQL ----------
const q = (s: string) => `'${String(s ?? '').replace(/'/g, "''")}'`
const arr = (a: string[]) => a.length ? `ARRAY[${a.map(q).join(', ')}]::text[]` : `ARRAY[]::text[]`
const jsonb = (o: unknown) => `${q(JSON.stringify(o))}::jsonb`

// ---------- HTML → Markdown (tags simples présents dans les données) ----------
function htmlToMd(html: string): string {
  let s = html.replace(/\r/g, '')
  s = s.replace(/<strong>(.*?)<\/strong>/gs, '**$1**')
  s = s.replace(/<em>(.*?)<\/em>/gs, '*$1*')
  s = s.replace(/<code>(.*?)<\/code>/gs, '`$1`')
  s = s.replace(/<ul>(.*?)<\/ul>/gs, (_m, inner: string) =>
    '\n' + inner.replace(/\s*<li>(.*?)<\/li>\s*/gs, (_x: string, t: string) => `- ${t.trim()}\n`) + '\n')
  s = s.replace(/<ol>(.*?)<\/ol>/gs, (_m, inner: string) => {
    let n = 0
    return '\n' + inner.replace(/\s*<li>(.*?)<\/li>\s*/gs, (_x: string, t: string) => { n++; return `${n}. ${t.trim()}\n` }) + '\n'
  })
  s = s.replace(/<p>(.*?)<\/p>/gs, (_m, t: string) => `${t.trim()}\n\n`)
  s = s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  s = s.replace(/<[^>]+>/g, '')
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  return s
}

const mdTable = (headers: string[], rows: string[][]) =>
  `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n` +
  rows.map(r => `| ${r.map(c => (c || '').replace(/\n/g, ' ')).join(' | ')} |`).join('\n')

// ---------- Documents (notes / mémos / procédures) ----------
type Doc = { type: 'note' | 'memo' | 'procedure'; titre: string; contenu: string; tags: string[] }
const docs: Doc[] = []

// 1. Enregistrement
docs.push({
  type: 'procedure', titre: 'Enregistrement', tags: ['enregistrement'],
  contenu: etapesEnregistrement.map(e => `## ${e.titre}\n\n${htmlToMd(e.contenuHtml)}`).join('\n\n'),
})

// 2. Feuilles à transmettre
docs.push({
  type: 'procedure', titre: 'Feuilles à transmettre', tags: ['feuilles', 'transmission'],
  contenu: mdTable(['Labo', 'Condition', 'Lieu', 'Action spéciale'],
    reglesTransmission.map(r => [r.labo, r.condition, r.lieu, r.actionSpeciale])),
})

// 3. Statifs de tri
docs.push({
  type: 'procedure', titre: 'Statifs de tri', tags: ['statifs', 'tri'],
  contenu: statifs.map(s => `- ${s.emoji} **${s.nom}** — ${s.destination}`).join('\n'),
})

// 4. Étiquettes
docs.push({
  type: 'procedure', titre: 'Étiquettes', tags: ['etiquettes'],
  contenu: [
    '## Descriptions',
    etiquettesDescription.map(e => `- **${e.titre}** — ${e.description}`).join('\n'),
    '## Formats',
    etiquettesFormat.map(e => `- ${e.icone} **${e.titre}** — ${e.description}`).join('\n'),
    '## Ré-impression (écran 105 DGLab)',
    mdTable(['Étiquette', 'N°'], etiquettesReimpression.map(e => [e.etiquette, e.numero])),
    `_${reimpressionNote}_`,
    '## Règles de collage',
    reglesCollage.map(r => `- ${r.icone} **${r.titre}** — ${r.description}`).join('\n'),
  ].join('\n\n'),
})

// 5. Check-in
docs.push({
  type: 'procedure', titre: 'Check-in', tags: ['checkin'],
  contenu: reglesCheckin.map(r => `- ${r.icone} **${r.titre}** — ${r.description}`).join('\n'),
})

// 6. Sérothèque
docs.push({
  type: 'procedure', titre: 'Sérothèque', tags: ['serotheque'],
  contenu: codesSerotheque.map(c => `- **${c.nom}** — \`${c.code}\`${c.detail ? ` · ${c.detail}` : ''}`).join('\n'),
})

// 7. Gestion par labo
docs.push({
  type: 'procedure', titre: 'Gestion par labo', tags: ['gestion'],
  contenu: gestionParLabo.map(g => `### ${g.icone} ${g.labo}\n\n${g.regles.map(r => `- ${r}`).join('\n')}`).join('\n\n'),
})

// 8. Cas particuliers
docs.push({
  type: 'procedure', titre: 'Cas particuliers', tags: ['cas'],
  contenu: casParticuliers.map(c => `- ${c.icone} **${c.titre}** — ${c.description}`).join('\n'),
})

// 9. Checklist enregistrement (mémo, ex-ticker)
docs.push({
  type: 'memo', titre: 'Checklist enregistrement', tags: ['checklist', 'rappels'],
  contenu: checklist.map(c => `- [ ] ${c}`).join('\n'),
})

// ---------- Génération SQL ----------
let sql = `-- =============================================================
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
`
sql += tubes.map((t, i) => `  ('tube', ${q(t.nom)}, ${q(t.sousTitre)}, ${q(t.etiquette)}, ${q(t.couleur)}, ${q(t.centrifugation)}, ${q(t.centrifugationDetail)}, ${q(t.codeExces)}, ${q(t.codeSansAnalyse)}, ${q(t.codeReserve)}, ${jsonb(t.destinations.map(d => ({ label: d.label, detail: d.detail })))}, ${arr(t.notes)}, ${arr(t.alertes)}, ${arr(t.casParticuliers)}, ${i})`).join(',\n')
sql += `;\n\ninsert into documents (type, titre, contenu, tags, position) values\n`
sql += docs.map((d, i) => `  (${q(d.type)}, ${q(d.titre)}, ${q(d.contenu)}, ${arr(d.tags)}, ${i})`).join(',\n')
sql += `;\n\ncommit;\n`

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../supabase/seed.sql')
writeFileSync(out, sql, 'utf8')
console.log(`✅ seed.sql généré : ${out}`)
console.log(`   ${tubes.length} matériels · ${docs.length} documents`)
