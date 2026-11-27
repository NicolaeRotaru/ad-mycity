// La tabella che non risponde (onError continue: n8n passa un elemento con «error»), con 10 righe già scritte.
import { readFileSync } from 'node:fs';
const [repo, D] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const L = (n) => readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/${n}`, 'utf8');
const nodi = { Config: [{ json: { MODALITA: 'vero', ...CONFIG_16 } }], 'Chiedi alla mappa': [{ json: { statusCode: 200, data: readFileSync(`${D}/mappa-grezza.json`, 'utf8') } }],
  'Leggi i negozi di MyCity': [{ json: { statusCode: 200, body: [{ id: 'u0', store_name: 'Pane Quotidiano' }] } }],
  'Leggi le attività già proposte': [{ json: { error: 'Data table not found' } }] };
nodi['Metti in fila'] = await eseguiCodice(L('metti-in-fila.js'), { nodi });
nodi['Prepara il lavoro'] = await eseguiCodice(L('prepara-lavoro.js'), { nodi });
nodi['Chiedi all’AD i dossier'] = [{ json: { ok: false, errore: 'x' } }];
const m = await eseguiCodice(L('componi.js'), { nodi });
const f = nodi['Metti in fila'][0].json;
console.log('prime 3 in fila:', f.fila.slice(0, 3).map((a) => a.osm).join(' '), '· gia_proposte', f.conti.gia_proposte, '· proposte_finora', f.conti.proposte_finora);
console.log('il messaggio parla della tabella?', /tabella[^«]*non|non ha risposto/.test(m[0].json.messaggio.split('\n').slice(0, 4).join(' ')) ? 'sì' : 'no');
console.log(m[0].json.messaggio.split('\n').slice(0, 4).join('\n'));
