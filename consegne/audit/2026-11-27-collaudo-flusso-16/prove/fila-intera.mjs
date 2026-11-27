// La fila intera (655) col codice di produzione intatto: giri da 30, segnando ogni volta le uscite come già proposte.
import { readFileSync, writeFileSync } from 'node:fs';
const repo = process.argv[2], D = process.argv[3];
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const grezza = readFileSync(`${D}/mappa-grezza.json`, 'utf8');
const FILA = readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/metti-in-fila.js`, 'utf8');
const righe = []; const tutte = [];
for (let k = 0; k < 40; k++) {
  const [{ json: r }] = await eseguiCodice(FILA, { nodi: {
    Config: [{ json: { MODALITA: 'vero', ...CONFIG_16, QUANTE_A_SETTIMANA: 30 } }],
    'Chiedi alla mappa': [{ json: { statusCode: 200, data: grezza } }],
    'Leggi i negozi di MyCity': [{ json: { statusCode: 200, body: ['Pane Quotidiano', 'Casa Linda'].map((store_name, i) => ({ id: `u${i}`, store_name })) } }],
    'Leggi le attività già proposte': righe.length ? righe.map((json) => ({ json })) : [{ json: {} }],
  } });
  if (!r.fila.length) { console.log('giri', k, 'ultimo conto', JSON.stringify(r.conti)); break; }
  tutte.push(...r.fila); righe.push(...r.fila.map((x) => ({ osm: x.osm, stato: 'da_visitare' })));
}
console.log('totale in fila', tutte.length, 'unici', new Set(tutte.map((x) => x.osm)).size);
writeFileSync(`${D}/fila-intera.json`, JSON.stringify(tutte));
