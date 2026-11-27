// Le prime 60 della fila vera con il codice di produzione intatto: 30 + (le stesse 30 segnate come già proposte) 30.
import { readFileSync, writeFileSync } from 'node:fs';
const repo = process.argv[2], D = process.argv[3];
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const grezza = readFileSync(`${D}/mappa-grezza.json`, 'utf8');
const els = new Map(JSON.parse(grezza).elements.map((e) => [`${e.type}/${e.id}`, e]));
const FILA = readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/metti-in-fila.js`, 'utf8');
const giro = async (righe) => (await eseguiCodice(FILA, { nodi: {
  Config: [{ json: { MODALITA: 'vero', ...CONFIG_16, QUANTE_A_SETTIMANA: 30 } }],
  'Chiedi alla mappa': [{ json: { statusCode: 200, data: grezza } }],
  'Leggi i negozi di MyCity': [{ json: { statusCode: 200, body: ['Pane Quotidiano', 'Casa Linda'].map((store_name, i) => ({ id: `u${i}`, store_name })) } }],
  'Leggi le attività già proposte': righe.length ? righe.map((json) => ({ json })) : [{ json: {} }],
} }))[0].json;
const a = await giro([]);
const b = await giro(a.fila.map((x) => ({ osm: x.osm, stato: 'da_visitare' })));
console.log('secondo giro gia_proposte', b.conti.gia_proposte, 'in_fila', b.conti.in_fila);
const tutte = [...a.fila, ...b.fila];
writeFileSync(`${D}/prime60.json`, JSON.stringify(tutte));
tutte.forEach((x, i) => {
  const t = els.get(x.osm).tags;
  const tagchiave = ['shop', 'amenity', 'craft', 'brand', 'operator', 'opening_hours', 'website', 'check_date', 'survey:date'].filter((k) => t[k]).map((k) => `${k}=${t[k]}`).join(' ');
  console.log(`${String(i + 1).padStart(2)} ${x.punteggio} ${x.distanza_m}m ${x.osm} «${x.nome}» [${x.segmento}] ${tagchiave}`);
});
