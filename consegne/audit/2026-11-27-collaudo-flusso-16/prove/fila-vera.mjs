// Fa girare metti-in-fila.js (del repo indicato) sulla risposta grezza vera della mappa (esecuzione 3458).
import { readFileSync, writeFileSync } from 'node:fs';
const repo = process.argv[2];
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const D = process.argv[3];
const grezza = readFileSync(`${D}/mappa-grezza.json`, 'utf8');
const FILA = readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/metti-in-fila.js`, 'utf8');
const negozi = ['Pane Quotidiano', 'Casa Linda'];
const [{ json: r }] = await eseguiCodice(FILA, { nodi: {
  Config: [{ json: { MODALITA: 'vero', ...CONFIG_16, QUANTE_A_SETTIMANA: Number(process.argv[4] || 30) } }],
  'Chiedi alla mappa': [{ json: { statusCode: 200, data: grezza } }],
  'Leggi i negozi di MyCity': [{ json: { statusCode: 200, body: negozi.map((store_name, i) => ({ id: `u${i}`, store_name })) } }],
  'Leggi le attività già proposte': [{ json: {} }],
} });
console.log(JSON.stringify(r.conti));
writeFileSync(`${D}/fila-mia.json`, JSON.stringify(r));
