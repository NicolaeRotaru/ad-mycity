// I 10 dossier veri dell'esecuzione 3460 passati da metti-in-fila.js e componi.js RIPARATI (copia), sulla mappa vera
// della 3460 e coi negozi veri; ogni messaggio passa dal controllo HTML di Telegram (tg-html.mjs del primo collaudo).
import { readFileSync } from 'node:fs';
const [repo, D, SC] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const { controllaTg } = await import(`${SC}/tg-html.mjs`);
const L = (n) => readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/${n}`, 'utf8');
const nodi = {
  Config: [{ json: { MODALITA: 'vero', ...CONFIG_16 } }],
  'Chiedi alla mappa': [{ json: { statusCode: 200, statusMessage: 'OK', data: readFileSync(`${D}/mappa-grezza-3460.json`, 'utf8') } }],
  'Leggi i negozi di MyCity': JSON.parse(readFileSync(`${D}/negozi-3460.json`, 'utf8')),
  'Leggi le attività già proposte': JSON.parse(readFileSync(`${D}/proposte-3460.json`, 'utf8')),
};
nodi['Metti in fila'] = await eseguiCodice(L('metti-in-fila.js'), { nodi });
nodi['Prepara il lavoro'] = await eseguiCodice(L('prepara-lavoro.js'), { nodi });
nodi['Chiedi all’AD i dossier'] = JSON.parse(readFileSync(`${D}/ad-3460.json`, 'utf8'));
const f = nodi['Metti in fila'][0].json;
const vecchia = JSON.parse(readFileSync(`${D}/fila-3460.json`, 'utf8'));
console.log('stessa fila di 10 della 3460:', JSON.stringify(f.fila.map((a) => a.osm)) === JSON.stringify(vecchia.fila.map((a) => a.osm)));
const out = await eseguiCodice(L('componi.js'), { nodi });
const veri = JSON.parse(readFileSync(`${D}/componi-3460.json`, 'utf8'));
for (const o of out) console.log(`riparato parte ${o.json.parte}/${o.json.parti}: ${o.json.messaggio.length} car., problemi: ${JSON.stringify(controllaTg(o.json.messaggio))}`);
for (const o of veri) console.log(`mandato davvero nella 3460 parte ${o.json.parte}/${o.json.parti}: ${o.json.messaggio.length} car., problemi: ${JSON.stringify(controllaTg(o.json.messaggio))}`);
const sch = nodi['Chiedi all’AD i dossier'][0].json.risultato.schede;
const tutto = out.map((o) => o.json.messaggio).join('\n');
const persi = sch.filter((s) => !tutto.includes(s.chi_e.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\s+/g, ' ').trim()));
console.log('link a Maps', (tutto.match(/Apri su Google Maps/g) || []).length, '· dossier «Chi è» arrivati interi', sch.length - persi.length, 'su', sch.length, '· righe «Dossier troppo lungo»', (tutto.match(/Dossier troppo lungo/g) || []).length);
const conto = (tutto.match(/Il conto finora:[^\n]*/) || ['(nessuna riga del conto: tabella vuota)'])[0];
console.log(conto);
