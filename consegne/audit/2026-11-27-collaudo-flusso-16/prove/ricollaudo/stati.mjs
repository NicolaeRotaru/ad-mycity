// Settimana 2 con le 10 righe VERE che la 3460 ha scritto nella tabella (forma vera: id, createdAt, updatedAt),
// con lo stato riscritto a mano in modi diversi. Codice riparato (copia): metti-in-fila.js → componi.js.
import { readFileSync } from 'node:fs';
const [repo, D] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const L = (n) => readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/${n}`, 'utf8');
const righe = JSON.parse(readFileSync(`${D}/righe-vere-3460.json`, 'utf8'));
const base = {
  Config: [{ json: { MODALITA: 'vero', ...CONFIG_16 } }],
  'Chiedi alla mappa': [{ json: { statusCode: 200, statusMessage: 'OK', data: readFileSync(`${D}/mappa-grezza-3460.json`, 'utf8') } }],
  'Leggi i negozi di MyCity': JSON.parse(readFileSync(`${D}/negozi-3460.json`, 'utf8')),
};
const giro = async (stati) => {
  const nodi = { ...base, 'Leggi le attività già proposte': righe.map((r, i) => ({ json: { ...r.json, stato: stati[i] ?? r.json.stato } })) };
  nodi['Metti in fila'] = await eseguiCodice(L('metti-in-fila.js'), { nodi });
  nodi['Prepara il lavoro'] = [{ json: { non_mandare: 'prova' } }];
  const msg = await eseguiCodice(L('componi.js'), { nodi });
  const f = nodi['Metti in fila'][0].json;
  return { f, conto: (msg[0].json.messaggio.match(/Il conto finora:[^\n]*/) || ['(nessuna riga del conto)'])[0] };
};
const s0 = await giro([]);
console.log('righe vere lette:', righe.length, '· già proposte:', s0.f.conti.gia_proposte, '· tornate in fila:', s0.f.fila.filter((a) => righe.some((r) => r.json.osm === a.osm)).length);
console.log('  ', s0.conto);
const casi = [
  ['come dice la nota', ['visitata', 'si', 'no', 'iscritta']],
  ['i casi del primo collaudo', ['Visitata', 'sì', ' si ', 'iscritto', 'no grazie', 'visitata ✓', 'Sì, iscritta']],
  ['sì ma non ancora iscritta', ['sì, non ancora iscritta', 'si - non iscritta', 'visitata, non iscritta', 'no, non iscritta']],
  ['non visitata', ['non visitata', 'non ancora visitata', 'non visitato (chiuso)']],
  ['esito dopo la visita', ['visitata, sì', 'visitata - ha detto sì', 'visitata: si', 'visitata, no']],
  ['con un segno', ['✅', '👍', '✓', '❌']],
  ['altre parole naturali', ['interessato', 'non interessato', 'rifiuta', 'da richiamare', 'chiuso', 'okay', 'sì!']],
];
for (const [nome, stati] of casi) {
  const r = await giro(stati);
  console.log(`\n${nome}: ${stati.map((s) => JSON.stringify(s)).join(', ')}\n  stati letti: ${JSON.stringify(r.f.conti.stati_finora)}\n  ${r.conto}`);
}
