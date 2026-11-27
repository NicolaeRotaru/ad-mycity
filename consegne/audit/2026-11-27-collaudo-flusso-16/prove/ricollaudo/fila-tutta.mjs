// La fila intera, un solo giro con QUANTE alzato via codice: il tetto 30 lo tolgo solo nella copia letta in memoria.
// Uso: node fila-tutta.mjs <repo> <file metti-in-fila.js> <mappa grezza> <negozi.json> <uscita.json>
import { readFileSync, writeFileSync } from 'node:fs';
const [repo, file, mappaF, negoziF, outF] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
let FILA = readFileSync(file, 'utf8');
const tetto = 'Math.min(30, Number(cfg.QUANTE_A_SETTIMANA) || 10)';
if (FILA.split(tetto).length !== 2) throw new Error('tetto non trovato');
FILA = FILA.replace(tetto, 'Number(cfg.QUANTE_A_SETTIMANA)');
const grezza = readFileSync(mappaF, 'utf8');
const negozi = JSON.parse(readFileSync(negoziF, 'utf8'));
const [{ json: r }] = await eseguiCodice(FILA, { nodi: {
  Config: [{ json: { MODALITA: 'vero', ...CONFIG_16, QUANTE_A_SETTIMANA: 100000 } }],
  'Chiedi alla mappa': [{ json: { statusCode: 200, statusMessage: 'OK', data: grezza } }],
  'Leggi i negozi di MyCity': negozi,
  'Leggi le attività già proposte': [{ json: {} }],
} });
const c = r.conti;
const somma = c.senza_nome + c.senza_posizione + c.chiuse + c.catene + c.categorie_escluse + c.doppioni + c.gia_su_mycity + c.gia_proposte + c.fuori_raggio + c.in_fila;
console.log(JSON.stringify(c));
console.log('somma', somma, 'letti', c.letti, 'fila', r.fila.length);
writeFileSync(outF, JSON.stringify(r));
