// Legge (solo GET) l'esecuzione n8n 3458 del flusso 16 e salva nella cartella data: la risposta grezza della mappa,
// i negozi letti da MyCity, la fila e i messaggi di quel giro. Il proxy mette la chiave vera; qui una finta.
// Uso: NODE_USE_ENV_PROXY=1 node estrai-3458.mjs <cartella-dati>
import { writeFileSync } from 'node:fs';
const D = process.argv[2];
const r = await fetch('https://n8n-shdy.sliplane.app/api/v1/executions/3458?includeData=true', { headers: { 'X-N8N-API-KEY': 'x' } });
const j = await r.json();
const rd = j.data.resultData.runData;
const out = (n) => rd[n][0].data?.main?.[0] || [];
writeFileSync(`${D}/mappa-grezza.json`, out('Chiedi alla mappa')[0].json.data);
writeFileSync(`${D}/negozi.json`, JSON.stringify(out('Leggi i negozi di MyCity')));
writeFileSync(`${D}/fila-3458.json`, JSON.stringify(out('Metti in fila')[0].json));
writeFileSync(`${D}/componi-3458.json`, JSON.stringify(out('Componi i messaggi')));
console.log('http', r.status, 'esecuzione', j.id, j.status, 'elementi', JSON.parse(out('Chiedi alla mappa')[0].json.data).elements.length);
