// Dossier finti lunghi sui 10 posti veri della 3460: testo italiano normale, testo pieno di & < > ", emoji a cavallo
// del taglio dei 500, campi da 100 a 3000 caratteri. Ogni messaggio passa da tg-html.mjs.
import { readFileSync } from 'node:fs';
const [repo, D, SC] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const { controllaTg } = await import(`${SC}/tg-html.mjs`);
const COMPONI = readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/componi.js`, 'utf8');
const f = JSON.parse(readFileSync(`${D}/fila-3460.json`, 'utf8'));
const frase = 'La bottega è in centro dal 1987, «pane & focacce» per il quartiere. ';
const tipi = {
  normale: (n) => frase.repeat(Math.ceil(n / frase.length)).slice(0, n),
  simboli: (n) => 'Pane & co. <vero> "buono" '.repeat(Math.ceil(n / 26)).slice(0, n),
  emoji_al_taglio: (n) => 'a'.repeat(498) + '🍞'.repeat(Math.max(1, Math.ceil((n - 498) / 2))),
  emoji_ovunque: (n) => '🍞 pane '.repeat(Math.ceil(n / 8)).slice(0, n),
};
const visti = {};
let casi = 0, rotti = 0, lunghi = 0, persi = 0, max = 0;
for (const [nome, gen] of Object.entries(tipi)) for (const n of [100, 300, 450, 499, 500, 501, 520, 700, 1000, 3000]) {
  const ad = [{ json: { ok: true, risultato: { schede: f.fila.map((a) => ({ osm: a.osm, chi_e: gen(n), cosa_vende: gen(n), cosa_ci_guadagna: gen(n), come_convincerlo: gen(n), cosa_proporre: gen(n), attenzione: gen(n) })) } } }];
  const out = await eseguiCodice(COMPONI, { nodi: { Config: [{ json: { MODALITA: 'vero', ...CONFIG_16 } }], 'Metti in fila': [{ json: f }], 'Prepara il lavoro': [{ json: {} }], 'Chiedi all’AD i dossier': ad } });
  const link = out.map((o) => o.json.messaggio).join('').match(/Apri su Google Maps/g)?.length || 0;
  if (link !== 10) persi++;
  for (const o of out) {
    casi++; max = Math.max(max, o.json.messaggio.length);
    if (o.json.messaggio.length > 4096) lunghi++;
    const p = controllaTg(o.json.messaggio);
    if (p.length) { rotti++; const k = `${nome} ${p[0].slice(0, 40)}`; visti[k] = (visti[k] || []).concat(n); }
  }
}
console.log(`messaggi ${casi} · oltre 4096: ${lunghi} · con problemi HTML: ${rotti} · giri con link persi: ${persi} · il più lungo ${max}`);
for (const [k, v] of Object.entries(visti)) console.log('  ', k, '→ campi da', [...new Set(v)].join(','));
