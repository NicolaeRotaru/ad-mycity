#!/usr/bin/env node
// 🩸 UNA MUTAZIONE LASCIATA IN GIRO — il codice che il banco rompe APPOSTA e che, se il banco muore,
// resta rotto nell'albero di lavoro. 🟢 Sola lettura: non scrive niente, non tocca git.
//
// IL DIFETTO CHE CHIUDE (AR-757, bloccante). È successo due volte, e la seconda l'ho fatta io.
//   · 16/8 — il banco viene ammazzato dal timeout a metà corsa e lascia un bottone finto dentro il
//     Pannello. Trovato a mano, prima di consegnare, per fortuna.
//   · 22/8 — committo l'unione mentre una corsa gira ancora in sottofondo. Fotografo l'albero nel
//     mezzo, e `cervello/salute.mjs` entra nella storia senza la riga che stampa le quattro risposte
//     del referto. L'ha trovato il cancello, DOPO che avevo già spinto.
//
// PERCHÉ NON BASTAVA QUELLO CHE C'ERA.
//   · AR-523 ha messo i gestori di segnale e il foglietto su disco: coprono il processo che muore di
//     SIGTERM, non il processo che è ancora VIVO mentre qualcun altro committa. Il 22/8 nessuno era
//     morto: erano in due a scrivere.
//   · `mutazioni-orfane.mjs` fa la domanda giusta e l'avrebbe presa (provato: exit 1). Ma gira nel
//     CANCELLO, cioè all'ultima porta. Il commit è la prima. Fra le due c'è il push.
//   · Il gancio del commit guarda sintassi, segreti e ramo. Una riga cancellata da una mutazione è
//     JavaScript validissimo: passa liscia.
//
// PERCHÉ NON LA PROPOSTA SCRITTA SULLA SCHEDA. La scheda proponeva di cercare nell'albero le stringhe
// di `sostituisci`. Misurato: la mutazione del 22/8 ha `sostituisci: ""` — CANCELLA una riga. Cercare
// la stringa vuota non trova niente e trova tutto. Quella proposta non avrebbe preso il caso vero.
//
// LA DOMANDA GIUSTA È PIÙ STRETTA, E NON HA SCAMPO: **l'albero è ESATTAMENTE ciò che il banco avrebbe
// scritto?** Cioè: applicando la mutazione alla versione già in archivio si riottiene, carattere per
// carattere, la versione sul disco. Se sì, quello non è un tuo lavoro: è la sabotatura della macchina
// rimasta accesa. Se `cerca` è sparito ma il testo NON combacia, allora hai spostato tu il codice —
// ed è il mestiere di `mutazioni-orfane.mjs`, non di questo: qui non si blocca niente.
//
// Uso:
//   node cervello/mutazione-vagante.mjs                 # i file in scena per il commit
//   node cervello/mutazione-vagante.mjs --tutti         # ogni file che una mutazione sorveglia
//   node cervello/mutazione-vagante.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = nessuna mutazione lasciata in giro
//   1 = almeno una: l'albero porta la sabotatura del banco → NON si committa
//   2 = non ho potuto misurare (mutanti.json assente/illeggibile, o git non risponde)

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

/**
 * Applica la mutazione al testo. Torna null se il pezzo non c'è (puntatore rotto o fix cambiato).
 *
 * ⚠️ CASA UNICA (la lezione del lotto 46): questa decisione stava dentro `non-vacuita.mjs`, che
 * all'import registra i gestori di segnale — importarlo da un gancio di commit vorrebbe dire
 * accendere quei gestori in un processo che non muta niente. Quindi la funzione si sposta qui e
 * `non-vacuita.mjs` la importa. Una copia in più sarebbe un freno in meno.
 */
export function muta(testo, cerca, sostituisci) {
  if (!testo.includes(cerca)) return null;
  return testo.split(cerca).join(sostituisci);
}

/**
 * LA DOMANDA, in una funzione pura che un test può ESEGUIRE.
 *
 * @param archivio  il testo del file com'è nell'ultimo commit (`git show HEAD:<file>`)
 * @param albero    il testo del file com'è adesso sul disco
 * @param mutante   la voce di mutanti.json (serve `cerca` e `sostituisci`)
 * @returns true SOLO se l'albero è esattamente l'archivio con la mutazione addosso.
 *
 * Tre casi che NON sono vaganti, e vanno detti perché è lì che un freno troppo largo diventa un
 * fastidio che qualcuno spegne:
 *   · l'albero è identico all'archivio → non hai toccato niente;
 *   · `cerca` non c'era già nell'archivio → la mutazione è vecchia, non è colpa di questo commit;
 *   · `cerca` è sparito ma il testo non combacia → l'hai spostato TU, ed è un'altra domanda.
 */
/** Il file non esiste nell'ultimo commit: e' nuovo. Non e' un cieco. */
export const NUOVO = Symbol("file-nuovo");

export function eVagante(archivio, albero, mutante) {
  if (typeof archivio !== "string" || typeof albero !== "string") return false;
  if (archivio === albero) return false;
  const rotto = muta(archivio, String(mutante?.cerca ?? ""), String(mutante?.sostituisci ?? ""));
  if (rotto === null) return false;
  return rotto === albero;
}

/**
 * Passa in rassegna le mutazioni e torna quelle che l'albero porta addosso.
 *
 * Un file che non si legge NON è «pulito»: finisce nei ciechi. Un ⚪ contato come verde è la bugia
 * che tutto questo esiste per togliere di mezzo.
 */
export function mutazioniVaganti(mutanti = [], leggiArchivio = () => null, leggiAlbero = () => null, soloQuesti = null) {
  const cercati = soloQuesti ? new Set(soloQuesti.map((f) => String(f).replace(/^\.\//, ""))) : null;
  const vaganti = [];
  const ciechi = [];
  const nuovi = [];
  let controllate = 0;
  const cacheA = new Map();
  const cacheB = new Map();
  for (const m of mutanti) {
    const file = String(m?.file || "").replace(/^\.\//, "");
    if (!file || (cercati && !cercati.has(file))) continue;
    controllate++;
    if (!cacheA.has(file)) cacheA.set(file, leggiArchivio(file));
    if (!cacheB.has(file)) cacheB.set(file, leggiAlbero(file));
    const archivio = cacheA.get(file);
    const albero = cacheB.get(file);
    // Un file NUOVO non sta in archivio: non e' un cieco, e' un file che non puo' portare la
    // mutazione di una versione precedente perche' una versione precedente non c'e'. Confonderlo con
    // un cieco bloccherebbe ogni commit che aggiunge un file — cioe' spegnerebbe il freno per uso.
    if (archivio === NUOVO) { nuovi.push(file); continue; }
    if (archivio === null || archivio === undefined || albero === null || albero === undefined) {
      ciechi.push(`${file}: non ho potuto leggerne le due versioni, quindi non so se porta una mutazione`);
      continue;
    }
    if (eVagante(archivio, albero, m)) vaganti.push({ file, mutante: m });
  }
  return { vaganti, controllate, ciechi, nuovi };
}

/** Il testo che chi committa deve leggere: dice cosa fare, non solo che c'è un problema. */
export function referto({ vaganti, controllate, ciechi }) {
  const righe = [];
  if (vaganti.length) {
    righe.push("⛔ COMMIT BLOCCATO — l'albero porta una mutazione che il banco ha lasciato in giro:");
    for (const v of vaganti) {
      righe.push(`   · ${v.file} — la mutazione «${String(v.mutante?.nome || "senza nome").slice(0, 90)}»`);
    }
    righe.push("");
    righe.push("   Non è lavoro tuo: è il codice che la macchina rompe apposta per controllare che una prova");
    righe.push("   diventi rossa, e che è rimasto rotto perché il banco è morto o sta ancora girando.");
    righe.push("   Rimettilo a posto e ricommitta:");
    for (const v of vaganti) righe.push(`     git checkout -- ${v.file}`);
    righe.push("   Se un banco sta ancora girando, aspetta che finisca: due motori sullo stesso albero si rubano i file.");
  }
  for (const c of ciechi) righe.push(`⚪ ${c}`);
  if (!vaganti.length && !ciechi.length) righe.push(`✅ nessuna mutazione lasciata in giro (${controllate} controllate)`);
  return righe.join("\n");
}

function main() {
  const JSON_MODE = process.argv.includes("--json");
  const TUTTI = process.argv.includes("--tutti");
  const MUTANTI = process.env.MUTANTI_FILE || join(AD_ROOT, "cervello/mutanti.json");
  if (!existsSync(MUTANTI)) {
    console.error("mutazione-vagante: cervello/mutanti.json assente → non posso misurare");
    process.exit(2);
  }
  let mutanti;
  try {
    mutanti = JSON.parse(readFileSync(MUTANTI, "utf8")).mutanti || [];
  } catch (e) {
    console.error(`mutazione-vagante: mutanti.json illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }

  const git = (args) => spawnSync("git", args, { cwd: AD_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

  let soloQuesti = null;
  if (!TUTTI) {
    // AR-340 — l'elenco dei file si chiede alla PORTA (percorsi-git.mjs), non a git a mano. Ci ero
    // cascato scrivendo questo file: un `--name-only` mio, che su un nome con l'accento torna il
    // percorso fra virgolette e con le sequenze di fuga, e quel file non verrebbe mai controllato.
    // E' la stessa malattia del lotto 46 — una decisione con piu' di una casa — fatta da me mentre
    // la curavo. L'ha trovata la prova che quel difetto ha lasciato in piedi.
    try {
      soloQuesti = percorsiDaGit(["diff", "--cached", "--name-only", "--diff-filter=ACM"], { cwd: AD_ROOT });
    } catch (e) {
      console.error(`mutazione-vagante: ${e.message} → non posso misurare`);
      process.exit(2);
    }
    if (!soloQuesti.length) {
      if (JSON_MODE) console.log(JSON.stringify({ vaganti: [], controllate: 0, ciechi: [] }));
      else console.log("✅ niente in scena per il commit: nessuna mutazione da cercare");
      process.exit(0);
    }
  }

  const leggiArchivio = (f) => {
    const c = git(["cat-file", "-e", `HEAD:${f}`]);
    if (c && c.status !== 0) return NUOVO;
    const r = git(["show", `HEAD:${f}`]);
    return r && r.status === 0 ? String(r.stdout) : null;
  };
  const leggiAlbero = (f) => {
    try {
      return readFileSync(join(AD_ROOT, f), "utf8");
    } catch {
      return null;
    }
  };

  const esito = mutazioniVaganti(mutanti, leggiArchivio, leggiAlbero, soloQuesti);
  if (JSON_MODE) console.log(JSON.stringify(esito));
  else console.log(referto(esito));
  process.exit(esito.vaganti.length ? 1 : esito.ciechi.length ? 2 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
