// Solo GET: legge le esecuzioni n8n 3458 e 3460 del flusso 16 e salva nella cartella dati la risposta grezza della
// mappa, i negozi, la lettura della tabella, la fila, i dossier dell'AD, i messaggi e le righe scritte (3460).
// Il proxy mette la chiave vera; qui una finta. Uso: NODE_USE_ENV_PROXY=1 node estrai.mjs <cartella-dati>
import { writeFileSync } from 'node:fs';
const D = process.argv[2];
for (const id of [3458, 3460]) {
  const r = await fetch(`https://n8n-shdy.sliplane.app/api/v1/executions/${id}?includeData=true`, { headers: { 'X-N8N-API-KEY': 'x' } });
  const t = await r.text(); writeFileSync(`${D}/esec-${id}.json`, t);
  const j = JSON.parse(t); const rd = j.data.resultData.runData;
  const out = (n) => rd[n]?.[0]?.data?.main?.[0] || [];
  writeFileSync(`${D}/mappa-grezza-${id}.json`, out('Chiedi alla mappa')[0].json.data);
  writeFileSync(`${D}/negozi-${id}.json`, JSON.stringify(out('Leggi i negozi di MyCity')));
  writeFileSync(`${D}/proposte-${id}.json`, JSON.stringify(out('Leggi le attività già proposte')));
  writeFileSync(`${D}/fila-${id}.json`, JSON.stringify(out('Metti in fila')[0].json));
  writeFileSync(`${D}/ad-${id}.json`, JSON.stringify(out('Chiedi all’AD i dossier')));
  writeFileSync(`${D}/componi-${id}.json`, JSON.stringify(out('Componi i messaggi')));
  if (rd['Scrivi nella tabella']) writeFileSync(`${D}/righe-vere-${id}.json`, JSON.stringify(out('Scrivi nella tabella').map((x) => ({ json: x.json }))));
  console.log(id, 'http', r.status, j.status, 'MODALITA', out('Config')[0].json.MODALITA, 'nodi', Object.keys(rd).length);
}
