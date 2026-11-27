// m7 con la forma VERA dell'errore del nodo Data Table in n8n (router.ts, da n8n 1.113 a master):
// con «continua in caso di errore» esce { json: <l'elemento in ingresso>, error } — l'errore sta FUORI da json,
// e json è l'uscita di «Leggi i negozi di MyCity». Confronto con la forma comoda della prova ({ json: { error } }).
import { readFileSync } from 'node:fs';
const [repo, D] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const L = (n) => readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/${n}`, 'utf8');
const negozi = JSON.parse(readFileSync(`${D}/negozi-3460.json`, 'utf8'));
const scritte = JSON.parse(readFileSync(`${D}/righe-vere-3460.json`, 'utf8')).map((r) => r.json.osm);
const errore = Object.assign(new Error('Data table not found'), { name: 'NodeOperationError' });
for (const [nome, lettura] of [
  ['forma della prova  { json: { error } }', [{ json: { error: { message: 'Data table not found' } } }]],
  ['forma vera di n8n  { json: <ingresso>, error }', [{ json: negozi[0].json, error: errore, pairedItem: { item: 0 } }]],
]) {
  const nodi = {
    Config: [{ json: { MODALITA: 'vero', ...CONFIG_16 } }],
    'Chiedi alla mappa': [{ json: { statusCode: 200, statusMessage: 'OK', data: readFileSync(`${D}/mappa-grezza-3460.json`, 'utf8') } }],
    'Leggi i negozi di MyCity': negozi,
    'Leggi le attività già proposte': lettura,
  };
  nodi['Metti in fila'] = await eseguiCodice(L('metti-in-fila.js'), { nodi });
  nodi['Prepara il lavoro'] = await eseguiCodice(L('prepara-lavoro.js'), { nodi });
  const msg = await eseguiCodice(L('componi.js'), { nodi });
  nodi['Componi i messaggi'] = msg;
  const righe = await eseguiCodice(L('righe-tabella.js'), { nodi });
  const f = nodi['Metti in fila'][0].json;
  const rifatte = (f.fila || []).filter((a) => scritte.includes(a.osm)).length;
  console.log(`\n${nome}`);
  console.log(`  letta: ${f.letta} · motivo: ${JSON.stringify(f.motivo)} · già proposte: ${f.conti ? f.conti.gia_proposte : '-'}`);
  console.log(`  delle 10 già scritte nella tabella dalla 3460, tornate in fila: ${rifatte} · righe che si riscriverebbero: ${righe.length}`);
  console.log(`  il messaggio parla della tabella? ${/tabella «Attività da visitare» non ha risposto/.test(msg[0].json.messaggio) ? 'sì' : 'no'} · riga del conto: ${(msg[0].json.messaggio.match(/Il conto finora:[^\n]*/) || ['nessuna'])[0]}`);
}
