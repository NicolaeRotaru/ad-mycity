import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const COPIA = process.argv[2];
const C = 'flussi/16-attivita-da-visitare/codice/';
const K = 'flussi/16-attivita-da-visitare/costruisci.mjs';
const M = [
  ['M1 byte→caratteri', C + 'prepara-lavoro.js', "const byte = (s) => (typeof Buffer !== 'undefined' ? Buffer.byteLength(s, 'utf8') : unescape(encodeURIComponent(s)).length);", 'const byte = (s) => s.length;'],
  ['M2 tetto 66.000', C + 'prepara-lavoro.js', '> 50000 &&', '> 66000 &&'],
  ['M3 senza già proposte', C + 'metti-in-fila.js', '  if (proposte.has(osm)) { conti.gia_proposte++; continue; }\n', ''],
  ['M4 codice di risposta ignorato', C + 'metti-in-fila.js', "  if (r.statusCode && r.statusCode !== 200) motivo = `la mappa ha risposto ${r.statusCode}`;\n  else if", '  if'],
  ['M5 senza il campo data', C + 'metti-in-fila.js', 'const grezzo = r.data !== undefined ? r.data : r.body;', 'const grezzo = r.body;'],
  ['M6 righe anche in prova', C + 'righe-tabella.js', 'if (!VERO || !f.letta', 'if (!f.letta'],
  ['M7a senza il ripiego dei blocchi lunghi', C + 'componi.js', 'blocchi.push(b.length <= 3800 ? b : bloccoDi(a, i, false));', 'blocchi.push(b);'],
  ['M7b senza accorciare i campi', C + 'componi.js', "const corto = (v, n) => { const t = String(v ?? '').replace(/\\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };", "const corto = (v) => String(v ?? '');"],
  ['M8 tetto 4.300', C + 'componi.js', '+ 2 > 3900)', '+ 2 > 4300)'],
  ['M9 senza alwaysOutputData', K, 'position: pos(5), alwaysOutputData: true, executeOnce: true,', 'position: pos(5), executeOnce: true,'],
  ['M10 senza returnAll', K, 'dataTableId: tabella(), returnAll: true }', 'dataTableId: tabella(), returnAll: false }'],
  ['M11 senza la barriera del marchio', C + 'metti-in-fila.js', "|| marchioAltrui ||", '||'],
  ['M12 manda in prova', C + 'componi.js', 'const manda = VERO;', 'const manda = true;'],
  ['M13 senza già su MyCity', C + 'metti-in-fila.js', '  if (giaSuMyCity(nome)) { conti.gia_su_mycity++; continue; }\n', ''],
  ['G1 stati letti alla lettera', C + 'metti-in-fila.js', 'const s = leggiStato(j.stato);', "const s = String(j.stato || 'da_visitare').trim().toLowerCase() || 'da_visitare';"],
  ['m1 senza il nome dentro l\'altro', C + 'metti-in-fila.js', "if (d < 30 && v.chiave.length >= 5", 'if (false && v.chiave.length >= 5'],
  ['m1c senza i nomi generici', C + 'metti-in-fila.js', 'return d < 15 && v.tipo === tipoGrezzo && (generico || v.generico);', 'return false;'],
  ['m1d nomi generici senza guardare il tipo', C + 'metti-in-fila.js', 'return d < 15 && v.tipo === tipoGrezzo && (generico || v.generico);', 'return d < 15 && (generico || v.generico);'],
  ['m1e civici diversi ignorati', C + 'metti-in-fila.js', 'if (civico && v.civico && civico !== v.civico) return false;', ''],
  ['m1f stesso tipo vicino = doppione', C + 'metti-in-fila.js', 'return d < 15 && v.tipo === tipoGrezzo && (generico || v.generico);', 'return d < 15 && v.tipo === tipoGrezzo;'],
  ['m1b apostrofo con lo spazio', C + 'metti-in-fila.js', "const chiaveNome = (s) => norm(s).replace(/ /g, '');", 'const chiaveNome = (s) => norm(s);'],
  ['m2 senza i nomi esclusi', C + 'metti-in-fila.js', '|| NOME_ESCLUSO.test(norm(nome))) { conti.categorie_escluse++', ') { conti.categorie_escluse++'],
  ['m4 marchio uguale al nome = catena', C + 'metti-in-fila.js', 'const marchioAltrui = t.brand && !chiaveNome(nome).includes(chiaveNome(t.brand));', 'const marchioAltrui = !!t.brand;'],
  ['m5 shop=yes escluso', C + 'metti-in-fila.js', "const ESCLUSE = new Set(['vacant', ", "const ESCLUSE = new Set(['yes', 'vacant', "],
  ['m7 tabella rotta presa per vuota', C + 'metti-in-fila.js', 'if (tabellaRotta) return', 'if (false) return'],
  ['m8 neverError rimesso', K, 'neverError: false', 'neverError: true'],
];
for (const [nome, file, da, a] of M) {
  const p = `${COPIA}/${file}`;
  const orig = readFileSync(p, 'utf8');
  const volte = orig.split(da).length - 1;
  if (volte !== 1) { console.log(`${nome}: SALTATA (${volte})`); continue; }
  writeFileSync(p, orig.replace(da, a));
  let esito;
  try { execSync('node --test flussi/test/16-attivita-da-visitare.test.mjs', { cwd: COPIA, stdio: 'pipe' }); esito = 'VERDE (sopravvive)'; } catch { esito = 'rossa'; }
  writeFileSync(p, orig);
  console.log(`${nome}: ${esito}`);
}
