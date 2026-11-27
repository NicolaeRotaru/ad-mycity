// Tutte le 655 attività vere passate da componi.js, 30 alla volta (il massimo del Config), con e senza un dossier
// dell'AD pieno di caratteri da proteggere; ogni messaggio passa dal controllo HTML di Telegram.
import { readFileSync } from 'node:fs';
const [repo, D, SC] = process.argv.slice(2);
const { eseguiCodice } = await import(`${repo}/flussi/test/esegui-codice.mjs`);
const { CONFIG_16 } = await import(`${repo}/flussi/16-attivita-da-visitare/costruisci.mjs`);
const { controllaTg } = await import(`${SC}/tg-html.mjs`);
const COMPONI = readFileSync(`${repo}/flussi/16-attivita-da-visitare/codice/componi.js`, 'utf8');
const base = JSON.parse(readFileSync(`${D}/fila-mia.json`, 'utf8'));
const tutte = JSON.parse(readFileSync(`${D}/fila-intera.json`, 'utf8'));
const brutto = 'Pane & focacce <artigianali> "vere", l’80% a km 0 → «Bottega» 🍞 & co. ';
let msg = 0, rotti = 0, max = 0;
for (let k = 0; k < tutte.length; k += 30) {
  const f = { ...base, fila: tutte.slice(k, k + 30) };
  for (const conAd of [false, true]) {
    const ad = conAd ? [{ json: { ok: true, risultato: { schede: f.fila.map((a) => ({ osm: a.osm, chi_e: brutto.repeat(4).slice(0, 300), cosa_vende: brutto.repeat(4).slice(0, 300), cosa_ci_guadagna: brutto.repeat(4).slice(0, 300), come_convincerlo: brutto.repeat(4).slice(0, 300), cosa_proporre: brutto.repeat(4).slice(0, 300), attenzione: brutto.repeat(4).slice(0, 300) })) } } }] : [{ json: { ok: false, errore: 'l’AD non ha risposto <in tempo> & basta' } }];
    const out = await eseguiCodice(COMPONI, { nodi: { Config: [{ json: { MODALITA: 'vero', ...CONFIG_16 } }], 'Metti in fila': [{ json: f }], 'Prepara il lavoro': [{ json: {} }], 'Chiedi all’AD i dossier': ad } });
    for (const o of out) { msg++; max = Math.max(max, o.json.messaggio.length); const p = controllaTg(o.json.messaggio); if (p.length) { rotti++; if (rotti <= 3) console.log('ROTTO', p); } }
  }
}
console.log(`messaggi controllati ${msg}, con HTML rotto o troppo lunghi ${rotti}, il più lungo ${max} caratteri`);
