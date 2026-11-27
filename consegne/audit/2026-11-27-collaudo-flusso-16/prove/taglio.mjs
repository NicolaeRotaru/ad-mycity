// Il taglio dei blocchi oltre 3800 caratteri: con dossier dell'AD più lunghi dei 300 caratteri chiesti.
import { readFileSync } from 'node:fs';
const [repo, D, SC] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const { controllaTg } = await import(`${SC}/tg-html.mjs`);
const COMPONI = readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/componi.js`, 'utf8');
const f = JSON.parse(readFileSync(`${D}/fila-mia.json`, 'utf8'));
f.fila = f.fila.slice(0, 10);
const frase = 'La bottega è in centro dal 1987 e lavora con clienti affezionati del quartiere. ';
const testo = (n) => (frase.repeat(Math.ceil(n / frase.length))).slice(0, n);
let trovato = false;
for (let n = 300; n <= 800; n += 1) {
  const ad = [{ json: { ok: true, risultato: { schede: f.fila.map((a) => ({ osm: a.osm, chi_e: testo(n), cosa_vende: testo(n), cosa_ci_guadagna: testo(n), come_convincerlo: testo(n), cosa_proporre: testo(n), attenzione: '' })) } } }];
  const out = await eseguiCodice(COMPONI, { nodi: { Config: [{ json: { MODALITA: 'vero', ...CONFIG_16 } }], 'Metti in fila': [{ json: f }], 'Prepara il lavoro': [{ json: {} }], 'Chiedi all’AD i dossier': ad } });
  const rotti = out.map((o) => ({ p: o.json.parte, len: o.json.messaggio.length, pr: controllaTg(o.json.messaggio) })).filter((x) => x.pr.length);
  const link = out.map((o) => o.json.messaggio).join('').match(/Apri su Google Maps/g)?.length || 0;
  if (n === 300 || n === 500 || (rotti.length && !trovato) || n === 700) {
    console.log(`campi di ${n} caratteri: ${out.length} messaggi, lunghezze ${out.map((o) => o.json.messaggio.length).join('/')}, link a Maps arrivati ${link} su 10, messaggi con HTML rotto: ${rotti.length}`);
    for (const r of rotti.slice(0, 2)) console.log(`   parte ${r.p} (${r.len} car.): ${r.pr.join(' | ')}`);
    if (rotti.length && !trovato) { trovato = true; const m = out.find((o) => o.json.parte === rotti[0].p).json.messaggio; console.log('   coda del messaggio: …' + JSON.stringify(m.slice(-160))); }
  }
}
