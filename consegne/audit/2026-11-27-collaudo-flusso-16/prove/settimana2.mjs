// Settimana 1 → righe vere di righe-tabella.js → forma del nodo Data Table (id, createdAt, updatedAt) → settimana 2.
import { readFileSync } from 'node:fs';
const [repo, D] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const L = (n) => readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/${n}`, 'utf8');
const grezza = readFileSync(`${D}/mappa-grezza.json`, 'utf8');
const Config = [{ json: { MODALITA: 'vero', ...CONFIG_16 } }];
const mappa = [{ json: { statusCode: 200, data: grezza } }];
const negozi = [{ json: { statusCode: 200, body: ['Pane Quotidiano', 'Casa Linda'].map((store_name, i) => ({ id: `u${i}`, store_name })) } }];
const giro = async (tabella) => {
  const nodi = { Config, 'Chiedi alla mappa': mappa, 'Leggi i negozi di MyCity': negozi, 'Leggi le attività già proposte': tabella.length ? tabella : [{ json: {} }] };
  nodi['Metti in fila'] = await eseguiCodice(L('metti-in-fila.js'), { nodi });
  nodi['Prepara il lavoro'] = await eseguiCodice(L('prepara-lavoro.js'), { nodi });
  const f = nodi['Metti in fila'][0].json;
  nodi['Chiedi all’AD i dossier'] = [{ json: { ok: true, flusso: '16 · Attività da visitare', risultato: { schede: f.fila.map((a) => ({ osm: a.osm, chi_e: 'Bottega di quartiere.', cosa_vende: 'non trovato', cosa_ci_guadagna: 'clienti nuovi', come_convincerlo: 'canone sospeso', cosa_proporre: 'vetrina', attenzione: '' })) }, avvisi: [], errore: '', dalla_memoria: false, prova: false } }];
  nodi['Componi i messaggi'] = await eseguiCodice(L('componi.js'), { nodi });
  const righe = await eseguiCodice(L('righe-tabella.js'), { nodi });
  return { f, msg: nodi['Componi i messaggi'].map((m) => m.json.messaggio), righe };
};
const comeDataTable = (righe, primoId = 1) => righe.map((r, i) => ({ json: { id: primoId + i, ...r.json, createdAt: '2026-11-30T06:10:12.345Z', updatedAt: '2026-11-30T06:10:12.345Z' } }));
const s1 = await giro([]);
console.log('S1 fila:', s1.f.fila.map((a) => a.osm).join(' '));
console.log('S1 righe scritte:', s1.righe.length, 'campi:', Object.keys(s1.righe[0].json).join(','));
const tab = comeDataTable(s1.righe);
const s2 = await giro(tab);
const dentro = s2.f.fila.filter((a) => tab.some((t) => t.json.osm === a.osm));
console.log('S2 gia_proposte:', s2.f.conti.gia_proposte, '· delle 10 di S1 tornate in fila:', dentro.length, '· proposte_finora:', s2.f.conti.proposte_finora, '· stati:', JSON.stringify(s2.f.conti.stati_finora));
console.log('S2 conto nel messaggio:', (s2.msg[0].match(/Il conto finora:[^\n]*/) || ['(nessuna riga del conto)'])[0]);
console.log('S2 «tolte»:', (s2.msg[0].match(/Tolte [^\n]*?in fila/) || [''])[0]);
// Stati scritti a mano da chi visita.
const prova = async (stati) => {
  const t = tab.map((r, i) => ({ json: { ...r.json, stato: stati[i] ?? r.json.stato } }));
  const g = await giro(t);
  return { stati_finora: g.f.conti.stati_finora, conto: (g.msg[0].match(/Il conto finora:[^\n]*/) || [''])[0] };
};
for (const [nome, stati] of [
  ['come dice la nota (visitata, si, no, iscritta)', ['visitata', 'si', 'no', 'iscritta']],
  ['«Visitata», «sì», « si », «iscritto»', ['Visitata', 'sì', ' si ', 'iscritto']],
  ['«Sì», «SI», «Iscritta», «visitato»', ['Sì', 'SI', 'Iscritta', 'visitato']],
  ['«sì, iscritta», «no grazie», «visitata ✓», «da visitare»', ['sì, iscritta', 'no grazie', 'visitata ✓', 'da visitare']],
]) {
  const r = await prova(stati);
  console.log(`\n${nome}\n  stati letti: ${JSON.stringify(r.stati_finora)}\n  ${r.conto}`);
}
