// Mutazioni sul codice di produzione del flusso 16, nella COPIA del repo. Per ognuna: applica, lancia le prove del 16,
// rimette il file com'era. Dopo ognuna controlla che il repo vero non sia cambiato.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync, execSync } from 'node:child_process';
const COPIA = process.argv[2];
const VERO = '/home/user/N8N';
const impronta = () => execSync(`cd ${VERO} && git status --short && git diff | sha1sum && find flussi/16-attivita-da-visitare flussi/test/16-attivita-da-visitare.test.mjs -type f -exec sha1sum {} + | sort | sha1sum`).toString();
const prima = impronta();
const C = 'flussi/16-attivita-da-visitare/codice/';
const M = [
  ['M1 tetto dei 64 KB contato in caratteri invece che in byte', C + 'prepara-lavoro.js', "const byte = (s) => (typeof Buffer !== 'undefined' ? Buffer.byteLength(s, 'utf8') : unescape(encodeURIComponent(s)).length);", 'const byte = (s) => s.length;'],
  ['M2 tetto alzato oltre la routine (50.000 → 66.000)', C + 'prepara-lavoro.js', '> 50000 &&', '> 66000 &&'],
  ['M3 tolta l\'esclusione delle già proposte', C + 'metti-in-fila.js', '  if (proposte.has(osm)) { conti.gia_proposte++; continue; }\n', ''],
  ['M4 mappa: ignorato il codice di risposta (429/504 trattati come buoni)', C + 'metti-in-fila.js', "  if (r.statusCode && r.statusCode !== 200) motivo = `la mappa ha risposto ${r.statusCode}`;\n  else if", '  if'],
  ['M5 mappa: tolta la lettura del campo «data» (la forma VERA della risposta in n8n)', C + 'metti-in-fila.js', " : (r.data || ''));", " : '');"],
  ['M6 righe nella tabella anche in prova', C + 'righe-tabella.js', 'if (!VERO || !f.letta', 'if (!f.letta'],
  ['M7 tolto il taglio dei blocchi oltre 3800 caratteri', C + 'componi.js', "const pezzo = b.length > 3800 ? `${b.slice(0, 3780).replace(/&[a-z]*$/i, '')}…` : b;", 'const pezzo = b;'],
  ['M8 tetto del messaggio alzato (3900 → 4300)', C + 'componi.js', '+ 2 > 3900)', '+ 2 > 4300)'],
  ['M9 «Leggi le attività già proposte» senza alwaysOutputData', 'flussi/16-attivita-da-visitare/costruisci.mjs', "position: pos(5), alwaysOutputData: true, executeOnce: true,", 'position: pos(5), executeOnce: true,'],
  ['M10 lettura della tabella senza returnAll (n8n ne dà 50)', 'flussi/16-attivita-da-visitare/costruisci.mjs', "dataTableId: tabella(), returnAll: true }", 'dataTableId: tabella(), returnAll: false }'],
  ['M11 catene: tolta la barriera del tag brand (resta brand:wikidata e il nome)', C + 'metti-in-fila.js', "if (t.brand || t['brand:wikidata']", "if (t['brand:wikidata']"],
  ['M12 componi manda anche in prova', C + 'componi.js', 'const manda = VERO;', 'const manda = true;'],
  ['M13 tolta l\'esclusione dei negozi già su MyCity', C + 'metti-in-fila.js', '  if (giaSuMyCity(nome)) { conti.gia_su_mycity++; continue; }\n', ''],
];
for (const [nome, file, da, a] of M) {
  const p = `${COPIA}/${file}`;
  const orig = readFileSync(p, 'utf8');
  const volte = orig.split(da).length - 1;
  if (volte !== 1) { console.log(`${nome}: SALTATA, testo da mutare trovato ${volte} volte`); continue; }
  writeFileSync(p, orig.replace(da, a));
  const r = spawnSync('node', ['--test', 'flussi/test/16-attivita-da-visitare.test.mjs'], { cwd: COPIA, encoding: 'utf8' });
  writeFileSync(p, orig);
  const pass = /# pass (\d+)/.exec(r.stdout)?.[1], fail = /# fail (\d+)/.exec(r.stdout)?.[1];
  const rossi = [...r.stdout.matchAll(/^not ok \d+ - (.*)$/gm)].map((x) => x[1]);
  console.log(`${nome}: ${fail === '0' ? 'VERDE (la suite NON se ne accorge)' : 'ROSSA'} · pass ${pass} fail ${fail}${rossi.length ? ' · ' + rossi.join(' / ') : ''}`);
  if (impronta() !== prima) { console.log('ATTENZIONE: il repo vero è cambiato'); process.exit(2); }
}
console.log('repo vero intatto dopo tutte le mutazioni');
