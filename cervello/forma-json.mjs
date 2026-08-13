#!/usr/bin/env node
// 📐 UN FILE RISCRITTO TUTTO PER CAMBIARE UNA RIGA.
//
// PERCHÉ ESISTE. Il 30/7, per aggiungere un campo `gate` a ventuno lezioni, ho riscritto
// `apprendimento.json` con `JSON.stringify(…, null, 1)` mentre il file era indentato a due spazi.
// Diff: +12.147 / −12.124. Stessa cosa su `cantiere-difetti.json`: +7.438 / −7.406 per aggiungere
// un difetto. Il contenuto era giusto — è la FORMA che è cambiata su ogni riga.
//
// Perché è grave e non estetico:
//   · una PR così non la rilegge nessuno, e «si mergia per fiducia» — che non è una prova;
//   · ogni altra sessione che tocchi quel file va in conflitto TOTALE, non su una riga;
//   · e sono proprio i file che il worker riscrive di continuo, cioè la famiglia di errori che
//     ventuno correzioni di Nicola avevano già segnalato. L'ho commessa mentre la chiudevo.
//
// COSA CONTROLLA. Per ogni JSON che il ramo tocca, confronta l'indentazione con quella su
// `origin/main`. Non impone uno stile: impone di NON cambiarlo. Chi scrive un file nuovo sceglie
// quello che vuole; chi ne modifica uno esistente lo lascia com'era.
//
// 🟢 Sola lettura.
//
// Uso:
//   node cervello/forma-json.mjs           -> controlla i JSON toccati dal ramo (verso origin/main)
//   node cervello/forma-json.mjs --staged  -> quelli che sto per committare ADESSO (verso HEAD)
//   node cervello/forma-json.mjs --json
// Exit: 0 = nessuna riformattazione · 1 = un file ha cambiato forma · 2 = non ho potuto misurare
//
// PERCHÉ ESISTE `--staged` (AR-511, 3/8). Questo guardiano è nato giusto e piazzato tardi: girava solo
// nel cancello del lotto, cioè in CI, quando la PR è già scritta e già illeggibile. Il 3/8 l'errore è
// tornato identico — il cantiere riscritto tutto (+8.975/−8.895) per aggiungere quattro schede — e a
// vederlo per primo è stato di nuovo Nicola, non la macchina. Agganciandolo al pre-commit è saltato
// fuori il secondo strato del difetto: guardando `origin/main...HEAD` vede i COMMIT del ramo, mentre
// al momento del commit ciò che conta è in staging e non è ancora un commit. Cioè come freno al
// commit era cieco per costruzione, e sarebbe stato un cancello verde che non guarda niente — la
// malattia esatta che questa casa chiama «cieco spacciato per verde».

// AR-473 / AR-460 — E POI IL GUARDIANO HA SMESSO DI GUARDARE, SENZA DIRLO.
//
// Due situazioni opposte lo rendevano cieco, e in tutte e due usciva 0 e veniva stampato come ✅:
//   · a metà lavoro, col working tree sporco, `origin/main...HEAD` vede i COMMIT del ramo e non le
//     modifiche sul disco: stampava «nessun JSON toccato da questo ramo» proprio nel momento in cui
//     lo si lancia. Misurato l'1/8 su `cantiere-difetti.json` riformattato (+8235/−8217): verde.
//   · in una sessione cloud il clone è superficiale, `origin/main` non è raggiungibile e il
//     confronto non ha un riferimento: una riscrittura completa di due JSON è passata in locale e
//     l'ha trovata solo la CI, a PR già aperta e diff già illeggibile.
// Ora: il perimetro comprende il working tree (così misura ciò che hai sotto le mani), e quando un
// riferimento non c'è il verdetto è ⚪ exit 2 — «non ho misurato» — mai un verde.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";
import { verdettoCopertura, CIECO } from "./misura-o-cieco.mjs";

const JSON_MODE = process.argv.includes("--json");
const STAGED = process.argv.includes("--staged");

/**
 * L'indentazione di un JSON, letta dalla prima riga annidata.
 *
 * Pura: prende il testo e torna il numero di spazi (o `\t`), oppure null se il file è su una riga
 * sola — nel qual caso non c'è una forma da conservare e non si dice niente.
 */
export function indentazione(testo = "") {
  for (const riga of String(testo).split("\n").slice(1, 40)) {
    const m = riga.match(/^([ \t]+)\S/);
    if (m) return m[1] === "\t" ? "tab" : String(m[1].length);
  }
  return null;
}

/** I file che hanno cambiato FORMA pur restando validi: stesso contenuto, ogni riga diversa. */
export function riformattati(coppie = []) {
  const fuori = [];
  for (const { file, prima, dopo } of coppie) {
    const a = indentazione(prima);
    const b = indentazione(dopo);
    if (a === null || b === null || a === b) continue;
    fuori.push({ file, prima: a, dopo: b });
  }
  return fuori;
}

/** Un riferimento git esiste davvero? Senza risposta a questa domanda ogni «file nuovo» è un forse. */
function risolvibile(spec) {
  return spawnSync("git", ["rev-parse", "--verify", "--quiet", `${spec}^{commit}`], { cwd: AD_ROOT, encoding: "utf8" }).status === 0;
}

/**
 * Con cosa mi confronto e cosa guardo.
 *
 * Tre domande diverse, tre perimetri — e il terzo è quello che mancava:
 *   · `--staged`: «questa modifica cambia la forma rispetto a com'era un attimo fa?» → base HEAD.
 *   · ramo intero: «questo ramo cambia la forma rispetto a main?» → base origin/main, PIÙ il
 *     working tree, perché il lavoro di adesso non è ancora un commit e senza di lui il guardiano
 *     è cieco proprio nel momento in cui serve.
 *   · clone superficiale: `origin/main` non c'è. Non ci si ferma e non si finge: si misura ciò che
 *     si può — il non ancora committato — e si dichiara che il resto è rimasto fuori.
 */
function riferimento() {
  if (STAGED) return { base: "HEAD", ramo: ["diff", "--cached", "--name-only"], workingTree: false, fuori: [] };

  const mb = spawnSync("git", ["merge-base", "HEAD", "origin/main"], { cwd: AD_ROOT, encoding: "utf8" });
  if (mb.status === 0 && mb.stdout.trim() && risolvibile("origin/main")) {
    return { base: "origin/main", ramo: ["diff", "--name-only", "origin/main...HEAD"], workingTree: true, fuori: [] };
  }
  return {
    base: "HEAD",
    ramo: null,
    workingTree: true,
    fuori: ["origin/main non raggiungibile (clone superficiale): i JSON già committati sul ramo non li ho confrontati con nessuno"],
  };
}

function main() {
  const rif = riferimento();
  const fuori0 = [...rif.fuori];
  let toccati;
  try {
    const dal = rif.ramo ? percorsiDaGit(rif.ramo, { cwd: AD_ROOT }) : [];
    // Il working tree: modificati non committati + non tracciati. È la metà che mancava — quella che
    // hai sotto le mani mentre lanci il comando.
    const sporchi = rif.workingTree
      ? [...percorsiDaGit(["diff", "--name-only"], { cwd: AD_ROOT }), ...percorsiDaGit(["ls-files", "--others", "--exclude-standard"], { cwd: AD_ROOT })]
      : [];
    toccati = [...new Set([...dal, ...sporchi])].filter((f) => f.endsWith(".json")).sort();
  } catch (e) {
    return esci(2, `non riesco a chiedere a git i file ${STAGED ? "in staging" : "del ramo"} (${e.message})`);
  }

  // Il riferimento non c'è: ogni `git show` fallirebbe e ogni file sembrerebbe «nuovo», cioè il
  // guardiano direbbe verde per la ragione peggiore. Cieco dichiarato, non verde.
  if (!risolvibile(rif.base)) {
    return esci(2, `il riferimento «${rif.base}» non esiste in questo clone: non ho niente con cui confrontare la forma`);
  }

  if (!toccati.length) {
    const v = verdettoCopertura({ misurati: 0, daMisurare: 0, nonMisurati: fuori0 });
    if (v.esito === CIECO) return esci(2, `nessun JSON da confrontare, e ${v.non_misurati.join(" · ")}`);
    if (!JSON_MODE) console.log(`📐 nessun JSON toccato ${STAGED ? "da questo commit" : "dal ramo né dal lavoro in corso"}.`);
    process.exit(0);
  }

  const coppie = [];
  let nuovi = 0;
  for (const file of toccati) {
    const r = spawnSync("git", ["show", `${rif.base}:${file}`], { cwd: AD_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) {
      nuovi++;
      continue; // file nuovo: nessuna forma da conservare (e il riferimento c'è, quindi «nuovo» è vero)
    }
    let dopo;
    try {
      // In staging il contenuto che conta è quello INDICIZZATO, non quello sul disco: sono due cose
      // diverse quando si fa `git add -p` o si modifica un file dopo averlo messo in staging.
      if (STAGED) {
        const idx = spawnSync("git", ["show", `:${file}`], { cwd: AD_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
        if (idx.status !== 0) continue;
        dopo = idx.stdout;
      } else dopo = readFileSync(join(AD_ROOT, file), "utf8");
    } catch {
      continue; // cancellato dal ramo: non è una riformattazione
    }
    coppie.push({ file, prima: r.stdout, dopo });
  }

  // IL RITORNO A CASA (AR-511). Se sto committando la forma che il file ha su `origin/main`, non sto
  // riformattando: sto RIPARANDO una riformattazione precedente — ed è esattamente il commit con cui
  // questo controllo è nato. Senza questa riga il freno impedirebbe di rimettere le cose a posto, e un
  // cancello che non si può soddisfare si aggira: la prima cosa che si impara è `--no-verify`.
  let fuori = riformattati(coppie);
  if (STAGED && fuori.length) {
    fuori = fuori.filter((f) => {
      const r = spawnSync("git", ["show", `origin/main:${f.file}`], { cwd: AD_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
      if (r.status !== 0) return true; // nessuna forma di casa con cui confrontarsi: resta un rosso
      return indentazione(r.stdout) !== f.dopo;
    });
  }
  // IL VERDETTO PASSA DAL METRO DELLA COPERTURA. `daMisurare` sono i file che una forma di prima ce
  // l'avevano: i nuovi non contano, perché su di loro non c'è niente da conservare e dichiararli
  // «non misurati» sarebbe un ⚪ finto. Se invece c'era qualcosa da confrontare e non ho confrontato
  // niente, il verdetto è ⚪ — ed è il caso che fino a oggi stampava ✅.
  const v = verdettoCopertura({
    misurati: coppie.length,
    daMisurare: toccati.length - nuovi,
    violazioni: fuori.length,
    nonMisurati: fuori0,
  });

  if (JSON_MODE) {
    console.log(JSON.stringify({ quando: nowPiacenza(), esito: v.esito, controllati: coppie.length, non_misurati: v.non_misurati, riformattati: fuori }, null, 2));
    process.exit(v.codice);
  }

  console.log(`\n📐 FORMA DEI JSON — ${nowPiacenza()}\n`);
  console.log(`  JSON toccati ${STAGED ? "da questo commit" : "dal ramo o dal lavoro in corso"} e già presenti su ${rif.base}: ${coppie.length}`);
  for (const r of v.non_misurati) console.log(`  ⚪ ${r}`);
  if (v.esito === CIECO) {
    console.log(`\n⚪ NON HO MISURATO: ${v.perche}. Il verde qui non coprirebbe niente.`);
    process.exit(2);
  }
  if (!fuori.length) {
    console.log(`\n✅ nessuno ha cambiato indentazione: i diff mostrano solo le righe cambiate davvero.`);
    process.exit(0);
  }
  for (const f of fuori) console.log(`  ❌ ${f.file}: era ${f.prima} spazi, ora ${f.dopo}`);
  console.log(`\n❌ ${fuori.length} file riscritti tutti per cambiarne una parte.`);
  console.log(`   Il contenuto può essere giusto: è la forma che rende la PR illeggibile e il`);
  console.log(`   conflitto totale per chiunque altro tocchi quel file. Riscrivilo con`);
  console.log(`   l'indentazione di prima — JSON.stringify(dati, null, <spazi di origin/main>).`);
  process.exit(1);
}

function esci(codice, messaggio) {
  if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: codice === 2, motivo: messaggio }));
  else console.error(`forma-json: ${messaggio}`);
  process.exit(codice);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
