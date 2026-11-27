// Per ogni elemento della mappa, il motivo per cui esce (o «in_fila») — vecchio e riparato a confronto.
// Il codice di produzione si strumenta SOLO in memoria: ogni «conti.X++; continue;» registra l'elemento e il motivo.
// Per i doppioni del riparato registro anche con chi è stato fuso (visti.some → visti.find, stessa condizione).
import { readFileSync, writeFileSync } from 'node:fs';
const [repo, vecchioF, nuovoF, mappaF, negoziF, outF] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const grezza = readFileSync(mappaF, 'utf8');
const negozi = JSON.parse(readFileSync(negoziF, 'utf8'));
const strumenta = (src, nuovo) => {
  let s = src.replace('Math.min(30, Number(cfg.QUANTE_A_SETTIMANA) || 10)', 'Number(cfg.QUANTE_A_SETTIMANA)');
  s = s.replace(/\{ conti\.(\w+)\+\+; continue; \}/g, (m, k) => `{ conti.${k}++; __m.push({ osm: e.type + '/' + e.id, motivo: '${k}', nome: String((e.tags||{}).name||''), con: typeof __con !== 'undefined' ? __con : null }); continue; }`);
  if (nuovo) {
    const da = 'const doppio = visti.some((v) => {';
    if (s.split(da).length !== 2) throw new Error('some non trovato');
    s = s.replace(da, 'const __v = visti.find((v) => {');
    s = s.replace('  visti.push({ chiave, pos, tipo: tipoGrezzo, civico, generico });', '  const doppio = !!__v; var __con = __v ? __v.osm : null;\n  visti.push({ chiave, pos, tipo: tipoGrezzo, civico, generico, osm: e.type + "/" + e.id, nome });');
  }
  s = s.replace('const candidate = [];', 'const candidate = []; const __m = [];');
  s = s.replace("return [{ json: { letta: true, motivo: '', fila: candidate.slice(0, QUANTE), conti } }];", "return [{ json: { letta: true, fila: candidate, conti, motivi: __m } }];");
  return s;
};
const gira = async (f, nuovo) => (await eseguiCodice(strumenta(readFileSync(f, 'utf8'), nuovo), { nodi: {
  Config: [{ json: { MODALITA: 'vero', ...CONFIG_16, QUANTE_A_SETTIMANA: 100000 } }],
  'Chiedi alla mappa': [{ json: { statusCode: 200, data: grezza } }],
  'Leggi i negozi di MyCity': negozi,
  'Leggi le attività già proposte': [{ json: {} }],
} }))[0].json;
const V = await gira(vecchioF, false), N = await gira(nuovoF, true);
const mappaEl = Object.fromEntries(JSON.parse(grezza).elements.map((e) => [`${e.type}/${e.id}`, e]));
const motivo = (r) => { const m = {}; for (const x of r.motivi) m[x.osm] = x; r.fila.forEach((a, i) => { m[a.osm] = { osm: a.osm, motivo: 'in_fila', posto: i + 1, nome: a.nome, segmento: a.segmento }; }); return m; };
const mv = motivo(V), mn = motivo(N);
const diff = [];
for (const osm of Object.keys(mappaEl)) {
  const a = mv[osm], b = mn[osm];
  if (!a || !b) { diff.push({ osm, prima: a?.motivo, dopo: b?.motivo }); continue; }
  if (a.motivo !== b.motivo || (a.motivo === 'in_fila' && a.segmento !== b.segmento)) {
    const t = mappaEl[osm].tags || {};
    diff.push({ osm, nome: t.name, tag: Object.entries(t).filter(([k]) => /^(shop|amenity|craft|brand|addr:housenumber|addr:street)$/.test(k)).map(([k, v]) => `${k}=${v}`).join(' '), prima: a.motivo + (a.posto ? `#${a.posto}` : '') + (a.segmento ? `(${a.segmento})` : ''), dopo: b.motivo + (b.posto ? `#${b.posto}` : '') + (b.segmento ? `(${b.segmento})` : ''), con: b.con });
  }
}
writeFileSync(outF, JSON.stringify({ diff, nuovo: N, vecchio: V }));
const per = {}; for (const d of diff) { const k = `${d.prima.replace(/#\d+/, '')} → ${d.dopo.replace(/#\d+/, '')}`; per[k] = (per[k] || 0) + 1; }
console.log('differenze', diff.length); console.log(per);
// Una riga per attività cambiata; «fuso con» solo per i doppioni (per le altre la variabile è quella del giro prima).
const P = (e) => (e.type === 'node' ? e : e.center);
const dist = (a, b) => { const R = 6371000, r = (x) => (x * Math.PI) / 180; const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h))); };
for (const d of diff) {
  let extra = '';
  if (d.dopo === 'doppioni' && d.con) { const o = mappaEl[d.con], t = o.tags || {}; extra = `  <== fuso con ${d.con} «${t.name}» ${t.shop || t.amenity || t.craft || ''} civ=${t['addr:housenumber'] || '-'} a ${dist(P(o), P(mappaEl[d.osm]))} m`; }
  console.log(`${d.prima} → ${d.dopo} ${d.osm} «${d.nome}» [${d.tag}]${extra}`);
}
