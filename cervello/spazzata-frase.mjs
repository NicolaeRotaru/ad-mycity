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
//   node cervello/spazzata-frase.mjs --da-file frasi.json --repo ../mycity
//
// USCITA: 0 se il conto torna (o se non era chiesto nessun conto), 2 se i posti veri sono piu' di
// quelli attesi — cioe' se la scheda ne stava mancando qualcuno. 3 se non ha potuto misurare.
// Un errore di misura non esce mai 0: un verde muto e' peggio di un rosso.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
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
export function comeRegola(frase) {
  const parole = appiattisci(frase).trim().split(' ').filter(Boolean);
  if (!parole.length) return null;
  const scappa = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(parole.map(scappa).join('[\\s\\S]{0,40}?'), 'g');
}

function* fileDi(radice) {
  let voci;
  try { voci = readdirSync(radice); } catch { return; }
  for (const v of voci) {
    if (SALTA.has(v)) continue;
    const p = join(radice, v);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) yield* fileDi(p);
    else if (ESTENSIONI.has(extname(v))) yield p;
  }
}

export function spazza(repo, frase) {
  const regola = comeRegola(frase);
  if (!regola) return { errore: 'frase vuota' };
  const posti = [];
  const nei_commenti = [];
  for (const cartella of CARTELLE) {
    const radice = join(repo, cartella);
    if (!existsSync(radice)) continue;
    for (const file of fileDi(radice)) {
      let grezzo;
      try { grezzo = readFileSync(file, 'utf8'); } catch { continue; }
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
      regola.lastIndex = 0;
      let m;
      while ((m = regola.exec(piatto)) !== null) {
        const n = rigaDi(m.index);
        const testo = (righe[n] || '').trim();
        const commento = /^(\/\/|\*|\/\*)/.test(testo);
        const voce = { file: relative(repo, file), riga: n + 1, testo: testo.slice(0, 160), commento };
        (commento ? nei_commenti : posti).push(voce);
        if (m.index === regola.lastIndex) regola.lastIndex++;
      }
    }
  }
  return { frase, posti, nei_commenti };
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
    return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : null;
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
    console.log(`\n🧹 «${frase}» — posti veri: ${esito.posti.length} (piu' ${esito.nei_commenti.length} dentro commenti, che l'utente non legge)`);
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
