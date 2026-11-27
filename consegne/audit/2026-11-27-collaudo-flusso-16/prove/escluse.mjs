// Le 84 «categorie escluse»: valore di shop e nomi. Riusa solo l'elenco ESCLUSE e CATENE del file come dato.
import { readFileSync } from 'node:fs';
const [repo, D] = process.argv.slice(2);
const src = readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/metti-in-fila.js`, 'utf8');
const ESCLUSE = new Set([...src.match(/const ESCLUSE = new Set\(\[([\s\S]*?)\]\);/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
const CATENE = new RegExp(src.match(/const CATENE = \/(.*)\/;/)[1]);
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const per = {};
for (const e of JSON.parse(readFileSync(`${D}/mappa-grezza.json`, 'utf8')).elements) {
  const t = e.tags || {}; const nome = String(t.name || t['name:it'] || '').trim(); if (!nome) continue;
  if (t.brand || t['brand:wikidata'] || t['operator:wikidata'] || CATENE.test(norm(nome))) continue;
  if (t.shop && ESCLUSE.has(t.shop)) (per[t.shop] ||= []).push(nome);
}
let n = 0; for (const [k, v] of Object.entries(per).sort((a, b) => b[1].length - a[1].length)) { n += v.length; console.log(`${k} ${v.length}: ${v.join(' | ')}`); }
console.log('totale', n);
