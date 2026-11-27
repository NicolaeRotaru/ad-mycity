import { readFileSync } from 'node:fs';
const { controllaTg } = await import(process.argv[2] + '/tg-html.mjs');
const c = JSON.parse(readFileSync(process.argv[3] + '/componi-3458.json', 'utf8'));
for (const m of c) console.log(`parte ${m.json.parte}/${m.json.parti}: ${m.json.messaggio.length} caratteri, problemi: ${JSON.stringify(controllaTg(m.json.messaggio))}`);
console.log('--- primo messaggio dell\'esecuzione 3458 ---');
console.log(c[0].json.messaggio.slice(0, 1400));
