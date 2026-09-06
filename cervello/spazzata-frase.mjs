#!/usr/bin/env node
// LA SPAZZATA — dove sta scritta davvero una frase, senza fidarsi dell'elenco della scheda.
//
// PERCHE' ESISTE. Misurato il 23/8/2026 riparando il gruppo delle promesse del sito: le schede
// nominavano DUE posti per «carta o contanti alla consegna» e i posti veri erano SETTE. Le schede
// coprivano il 29%. Chi ripara una frase fidandosi della scheda ne ripara un terzo e dichiara
// chiuso il resto — ed e' cosi' che una promessa falsa resta in piedi dopo essere stata «chiusa».
//
// Il grep semplice non basta per due motivi, tutti e due visti sul codice vero:
//   1) nelle pagine il testo va a capo dentro il JSX, quindi la frase e' spezzata su piu' righe;
//   2) le maiuscole, gli apostrofi tipografici e gli spazi doppi cambiano da un file all'altro.
// Qui il file viene appiattito (a capo e spazi multipli diventano uno spazio solo) e gli apostrofi
// e le virgolette curve diventano dritti, prima di cercare.
//
// USO
//   node cervello/spazzata-frase.mjs "consegna gratis"                  # elenca i posti veri
//   node cervello/spazzata-frase.mjs "consegna gratis" --attese 2       # ROSSO se i posti sono piu' di 2
//
// USCITA: 0 se il conto torna (o se non era chiesto nessun conto), 2 se i posti veri sono piu' di
// quelli attesi — cioe' se la scheda ne stava mancando qualcuno. 3 se non ha potuto misurare.
// Un errore di misura non esce mai 0: un verde muto e' peggio di un rosso.

import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const CARTELLE = ['app', 'components', 'lib', 'messages'];
const ESTENSIONI = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx']);
const SALTA = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'coverage', 'tests']);

export function appiattisci(testo) {
  return testo
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// Una frase si cerca a spazi liberi: fra una parola e l'altra puo' esserci un a capo, un tag, uno
// spazio in piu'. Le parole restano in ordine e attaccate: non e' una ricerca «a parole sparse».
//
// ⚠️ NON con un'espressione regolare. La prima versione univa le parole con `[\s\S]{0,40}?` e su un
// file da 1,3 KB il tempo esplodeva: 7 parole 0,07 s, 9 parole 0,28 s, 11 parole 4,33 s, 13 parole
// ancora appesa dopo trenta secondi. Un cancello che non torna piu' e' peggio di un cancello rosso:
// nessuno capisce se sta pensando o se e' morto. Qui le parole si cercano una dopo l'altra con
// indexOf, dentro una finestra: il tempo cresce in modo prevedibile e non torna mai indietro.
export const DISTANZA_MASSIMA = 40;

/** Le parole della frase, in ordine. `null` se non c'e' nessuna parola: una ricerca vuota si dichiara. */
export function comeRegola(frase) {
  const parole = appiattisci(frase).trim().split(' ').filter(Boolean);
  return parole.length ? parole : null;
}

/** Dove comincia ogni occorrenza della frase dentro il testo gia' appiattito. */
export function posizioni(piatto, parole) {
  const trovate = [];
  let da = 0;
  for (;;) {
    const inizio = piatto.indexOf(parole[0], da);
    if (inizio < 0) return trovate;
    let fine = inizio + parole[0].length;
    let ok = true;
    for (let i = 1; i < parole.length; i++) {
      const dove = piatto.indexOf(parole[i], fine);
      if (dove < 0 || dove - fine > DISTANZA_MASSIMA) { ok = false; break; }
      fine = dove + parole[i].length;
    }
    if (ok) trovate.push(inizio);
    da = inizio + 1;
  }
}

function* fileDi(radice) {
  let voci;
  try { voci = readdirSync(radice); } catch { return; }
  for (const v of voci) {
    if (SALTA.has(v)) continue;
    const p = join(radice, v);
    let st;
    try { st = lstatSync(p); } catch { continue; }
    // I collegamenti simbolici non si seguono: uno solo dentro app/ faceva contare 41 volte lo
    // stesso posto, e faceva leggere file fuori dal repo con un percorso che sembrava interno.
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) yield* fileDi(p);
    else if (ESTENSIONI.has(extname(v))) yield p;
  }
}

export function spazza(repo, frase) {
  const parole = comeRegola(frase);
  if (!parole) return { errore: 'frase vuota' };
  const posti = [];
  const nei_commenti = [];
  let cartelle_lette = 0;
  let file_letti = 0;
  const mancanti = [];
  for (const cartella of CARTELLE) {
    const radice = join(repo, cartella);
    if (!existsSync(radice)) { mancanti.push(cartella); continue; }
    // Anche la cartella di partenza puo' essere un collegamento: saltarli solo dentro voleva dire
    // che `app -> /altrove` veniva seguito lo stesso, e si leggevano file fuori dal repo.
    try { if (lstatSync(radice).isSymbolicLink()) { mancanti.push(cartella + ' (collegamento)'); continue; } } catch { mancanti.push(cartella); continue; }
    // Una cartella che c'e' ma non si apre (permessi) contava come letta: il conto diceva
    // «4 cartelle su 4» avendone guardate 3. Si conta dopo aver davvero potuto leggerla.
    try { readdirSync(radice); } catch { mancanti.push(cartella + ' (non si apre)'); continue; }
    cartelle_lette += 1;
    for (const file of fileDi(radice)) {
      let grezzo;
      try { grezzo = readFileSync(file, 'utf8'); } catch { continue; }
      file_letti += 1;
      const righe = grezzo.split('\n');
      // Appiattisco TUTTO il file in una stringa sola, tenendo da parte dove comincia ogni riga:
      // cosi' una frase spezzata su tre righe di JSX si trova, e ogni posto si conta UNA volta.
      let piatto = '';
      const inizi = [];
      for (const riga of righe) {
        inizi.push(piatto.length);
        piatto += appiattisci(riga) + ' ';
      }
      const rigaDi = (pos) => {
        let a = 0, b = inizi.length - 1, r = 0;
        while (a <= b) { const m = (a + b) >> 1; if (inizi[m] <= pos) { r = m; a = m + 1; } else b = m - 1; }
        return r;
      };
      for (const dove of posizioni(piatto, parole)) {
        const n = rigaDi(dove);
        const testo = (righe[n] || '').trim();
        const commento = /^(\/\/|\*|\/\*|\{\s*\/\*)/.test(testo);
        const voce = { file: relative(repo, file), riga: n + 1, testo: testo.slice(0, 160), commento };
        (commento ? nei_commenti : posti).push(voce);
      }
    }
  }
  return { frase, posti, nei_commenti, cartelle_lette, file_letti, mancanti };
}

function main() {
  const argv = process.argv.slice(2);
  const repo = (() => {
    const i = argv.indexOf('--repo');
    if (i >= 0 && argv[i + 1]) return argv[i + 1];
    return process.env.MARKETPLACE_REPO || '../mycity';
  })();
  const attese = (() => {
    const i = argv.indexOf('--attese');
    if (i < 0) return null;
    const grezzo = argv[i + 1];
    const n = Number(grezzo);
    if (grezzo === undefined || !Number.isInteger(n) || n < 0) {
      console.error(`⛔ --attese vuole un numero intero, non «${grezzo}». Un conto che non si puo' fare non e' un verde.`);
      process.exit(3);
    }
    return n;
  })();
  const frasi = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--repo' && argv[i - 1] !== '--attese');

  if (!existsSync(repo)) {
    console.error(`⛔ Non trovo il repo del sito in «${repo}». Passa --repo o imposta MARKETPLACE_REPO.`);
    process.exit(3);
  }
  if (!frasi.length) {
    console.error('⛔ Dimmi che frase cercare. Esempio: node cervello/spazzata-frase.mjs "consegna gratis" --attese 2');
    process.exit(3);
  }

  let rosso = false;
  for (const frase of frasi) {
    const esito = spazza(repo, frase);
    // UN VERDE MUTO E' PEGGIO DI UN ROSSO. Se in quel repo non c'era nessuna delle cartelle da
    // spazzare, «zero posti» non vuol dire «la frase non c'e'»: vuol dire che non ho guardato.
    if (!esito.cartelle_lette || !esito.file_letti) {
      console.error(`⛔ In «${repo}» non ho trovato niente da leggere (cartelle: ${CARTELLE.join(', ')}). Zero posti qui vorrebbe dire «non ho guardato», non «non c'e'».`);
      process.exit(3);
    }
    if (attese !== null && esito.mancanti.length) {
      console.error(`⛔ Non ho potuto leggere ${esito.mancanti.join(', ')}: un conto fatto su una parte del sito non e' un conto. Le cartelle da spazzare sono ${CARTELLE.join(', ')}.`);
      process.exit(3);
    }
    const dove = `letti ${esito.file_letti} file in ${esito.cartelle_lette} cartelle su ${CARTELLE.length}` + (esito.mancanti.length ? ` (non lette: ${esito.mancanti.join(', ')})` : '');
    console.log(`\n🧹 «${frase}» — posti veri: ${esito.posti.length} (piu' ${esito.nei_commenti.length} dentro commenti, che l'utente non legge) — ${dove}`);
    for (const p of esito.posti) console.log(`   · ${p.file}:${p.riga}  ${p.testo}`);
    if (esito.nei_commenti.length && argv.includes('--commenti')) {
      console.log('   — nei commenti:');
      for (const p of esito.nei_commenti) console.log(`     · ${p.file}:${p.riga}  ${p.testo}`);
    }
    if (attese !== null) {
      if (esito.posti.length > attese) {
        console.log(`   ⛔ La scheda ne nominava ${attese}. Ne mancano ${esito.posti.length - attese}: chiuderla adesso vuol dire lasciare la frase in piedi altrove.`);
        rosso = true;
      } else {
        console.log(`   ✅ La scheda ne nominava ${attese} e non ne sono usciti altri.`);
      }
    }
  }
  process.exit(rosso ? 2 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
