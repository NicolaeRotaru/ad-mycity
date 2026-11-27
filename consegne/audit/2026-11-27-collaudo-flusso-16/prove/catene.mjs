// Le 117 «catene»: per ognuna il motivo (tag o parola dell'elenco). Riusa SOLO l'elenco CATENE del file come dato.
import { readFileSync } from 'node:fs';
const [repo, D] = process.argv.slice(2);
const src = readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/metti-in-fila.js`, 'utf8');
const CATENE = new RegExp(src.match(/const CATENE = \/(.*)\/;/)[1]);
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const els = JSON.parse(readFileSync(`${D}/mappa-grezza.json`, 'utf8')).elements;
let n = 0; const per = {};
for (const e of els) {
  const t = e.tags || {}; const nome = String(t.name || t['name:it'] || '').trim(); if (!nome) continue;
  if (/^closed$/i.test(String(t.opening_hours || '').trim()) || t['disused:shop'] || t.disused === 'yes' || t.abandoned === 'yes') continue;
  const motivi = [];
  if (t.brand) motivi.push(`brand=${t.brand}`);
  if (t['brand:wikidata']) motivi.push(`brand:wikidata`);
  if (t['operator:wikidata']) motivi.push(`operator:wikidata=${t['operator:wikidata']}`);
  const m = norm(nome).match(CATENE); if (m) motivi.push(`nome~«${m[0]}»`);
  if (!motivi.length) continue;
  n++;
  const solo = motivi.length === 1 ? motivi[0].split('=')[0].split('~')[0] : 'più motivi';
  per[solo] = (per[solo] || 0) + 1;
  console.log(`${n}. ${e.type}/${e.id} «${nome}» ${t.shop ? 'shop=' + t.shop : t.amenity ? 'amenity=' + t.amenity : 'craft=' + t.craft} :: ${motivi.join(' ; ')}${t.operator ? ' operator=' + t.operator : ''}`);
}
console.log('totale', n, JSON.stringify(per));
