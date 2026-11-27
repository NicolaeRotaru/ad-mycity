#!/usr/bin/env node
/**
 * PUBBLICA IL SITO DEL CAFFÈ DI PIACENZA SU VERCEL — 27/11/2026.
 *
 * Carica la cartella sito/ (statica, così com'è) e crea la pubblicazione di produzione nel progetto
 * «caffe-di-piacenza» della squadra di Nicola; se il progetto non c'è, Vercel lo crea col primo invio.
 * Serve un token Vercel: o in VERCEL_TOKEN, o come «Network secret» dell'ambiente cloud per l'host
 * api.vercel.com (in quel caso il proxy mette la chiave da solo e qui basta un valore finto).
 *
 * Uso:  node consegne/clienti/caffe-di-piacenza/pubblica-vercel.mjs [--anteprima]
 * Il via a pubblicare: Nicola in chat, 27/11 verso le 17:05 («entrambi i siti web devono già essere su Vercel»).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITO = join(dirname(fileURLToPath(import.meta.url)), 'sito');
const SQUADRA = process.env.VERCEL_TEAM_ID || 'team_O5b1EUNnEQWvcXSNlos567lo';
const PROGETTO = process.env.VERCEL_PROGETTO || 'caffe-di-piacenza';
const API = 'https://api.vercel.com';
const CHIAVE = process.env.VERCEL_TOKEN || 'segnaposto-messo-dal-proxy';
const intestazioni = { Authorization: `Bearer ${CHIAVE}` };

const tutti = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? tutti(join(d, n)) : [join(d, n)]));

async function chiama(percorso, opzioni) {
  const r = await fetch(`${API}${percorso}${percorso.includes('?') ? '&' : '?'}teamId=${SQUADRA}`, opzioni);
  const testo = await r.text();
  if (!r.ok) throw new Error(`${opzioni?.method ?? 'GET'} ${percorso} → ${r.status}: ${testo.slice(0, 400)}`);
  return testo ? JSON.parse(testo) : {};
}

const files = [];
for (const f of tutti(SITO)) {
  const dati = readFileSync(f);
  const sha = createHash('sha1').update(dati).digest('hex');
  await chiama('/v2/files', { method: 'POST', headers: { ...intestazioni, 'Content-Type': 'application/octet-stream', 'x-vercel-digest': sha, 'Content-Length': String(dati.length) }, body: dati });
  files.push({ file: relative(SITO, f).split('\\').join('/'), sha, size: dati.length });
}
const anteprima = process.argv.includes('--anteprima');
const d = await chiama('/v13/deployments?skipAutoDetectionConfirmation=1', {
  method: 'POST',
  headers: { ...intestazioni, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: PROGETTO, project: PROGETTO, files, target: anteprima ? undefined : 'production', projectSettings: { framework: null, buildCommand: null, outputDirectory: null, installCommand: null } }),
});
console.log(JSON.stringify({ id: d.id, url: d.url ? `https://${d.url}` : null, stato: d.readyState, alias: d.alias ?? [], file: files.length }, null, 2));
