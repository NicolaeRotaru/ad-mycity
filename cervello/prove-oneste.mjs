#!/usr/bin/env node
// 🛡️ PROVE-ONESTE — il guardiano che impedisce a un difetto di nascere già chiuso (AR-330).
//
// 🟢 Sola lettura: legge il cantiere e la storia di git, non scrive niente.
//
// Cosa controlla: per ogni difetto NON chiuso con una prova file+pattern, ricostruisce il file
// com'era alla data di nascita del difetto e verifica se la prova era GIÀ soddisfatta allora.
// Se lo era, quella riga descrive il sintomo, non la cura: il difetto potrebbe chiudersi da solo
// senza che nessuno abbia riparato niente. È successo il 27/7 alle 12:15 con 91 difetti su 173.
//
// Uso:
//   node cervello/prove-oneste.mjs            # verdetto + elenco delle prove sospette
//   node cervello/prove-oneste.mjs --elenco   # solo gli id, uno per riga (per gli script)
//
// Uscita (contratto guardiani, AR-322):
//   0 = tutte le prove controllabili sono oneste
//   1 = almeno una prova era già soddisfatta alla nascita  → violazione di dominio
//   2 = non ho potuto misurare (cantiere illeggibile, git muto) → cieco, non «verde»

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
import { istanteNascita, nataGiaSoddisfatta, provaControllabile } from "./prove-regole.mjs";
import { storiaDelRepo } from "./storia-git.mjs";
import { verdettoCopertura } from "./misura-parziale.mjs";

const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");

function git(args) {
  const r = spawnSync("git", args, { cwd: AD_ROOT, encoding: "utf8", timeout: 20000, maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? String(r.stdout) : null;
}

/**
 * Il file com'era alla data di nascita del difetto.
 *
 * `--before` su una data secca prende l'ultimo commit PRIMA di quel momento: è la fotografia che
 * l'autore della radiografia aveva davanti quando ha scritto la prova. Se il file a quel commit non
 * esisteva ancora, torna null → il guardiano dirà «cieco» su quel difetto, non «sospetto».
 *
 * AR-419 — la cecità c'era già ma era MUTA. Con una storia troncata `rev-list --before` di una data
 * anteriore al taglio non trova niente, questa funzione tornava null e il guardiano stampava
 * «impossibile ricostruire il file alla data di nascita»: vero, ma chi legge capisce «file nato
 * dopo», non «in questa sessione non posso ricostruire NIENTE». Sono due frasi che portano a due
 * decisioni diverse, e la seconda è quella giusta. Ora la storia si chiede prima e il motivo si
 * dice, che è tutta la differenza fra essere ciechi e saperlo.
 */
export function testoAllaNascita(file, nato, run = git, storia = null) {
  const s = storia || storiaDelRepo(AD_ROOT);
  if (!s.intera) return null;
  const istante = istanteNascita(nato);
  if (!file || !istante) return null;
  // L'istante DEVE essere completo: con una data secca l'approxidate di git riempie l'ora con quella
  // corrente e la «fotografia alla nascita» diventa il file di adesso. Vedi istanteNascita().
  const sha = run(["rev-list", "-1", `--before=${istante}`, "HEAD"]);
  if (!sha || !sha.trim()) return null;
  return run(["show", `${sha.trim()}:${file}`]);
}

function main() {
  if (!existsSync(CANTIERE)) {
    console.error("prove-oneste: cantiere-difetti.json assente → non posso misurare");
    process.exit(2);
  }
  let cantiere;
  try {
    cantiere = JSON.parse(readFileSync(CANTIERE, "utf8"));
  } catch (e) {
    console.error(`prove-oneste: cantiere illeggibile (${e.message}) → non posso misurare`);
    process.exit(2);
  }

  // Una volta sola per esecuzione: la risposta non cambia dentro un giro, e chiederla per ognuno
  // dei ~200 difetti significherebbe lanciare git 200 volte per sapere la stessa cosa.
  const storia = storiaDelRepo(AD_ROOT);

  const aperti = (cantiere.difetti || []).filter((d) => d && d.stato !== "chiuso");
  const sospette = [];
  const ciechi = [];
  let controllate = 0;

  for (const d of aperti) {
    if (!provaControllabile(d.verifica)) continue;
    controllate++;
    const testo = testoAllaNascita(d.verifica.file, d.nato, git, storia);
    const r = nataGiaSoddisfatta(d.verifica, testo);
    if (r.esito === "sospetta") sospette.push({ d, motivo: r.motivo });
    else if (r.esito === "cieco") ciechi.push({ d, motivo: r.motivo });
  }

  const soloElenco = process.argv.includes("--elenco");
  if (soloElenco) {
    for (const s of sospette) console.log(s.d.id);
    // AR-353: anche qui un elenco vuoto può voler dire «niente da segnalare» oppure «non ho
    // guardato». Chi consuma questo output negli script deve poter distinguere i due casi.
    process.exit(verdettoCopertura({ controllate, misurate: controllate - ciechi.length, violazioni: sospette.length }).codice);
  }

  // AR-353 — il verdetto NON guarda più solo `sospette.length`.
  //
  // Il difetto, misurato il 29/7 in questa stessa sessione: 145 prove controllate, ZERO misurate
  // (clone superficiale: il passato non c'è), e questa riga stampava «✅ nessuna era già soddisfatta
  // alla nascita» uscendo 0. «Non ho trovato niente» e «non ho potuto guardare» producevano la stessa
  // frase e lo stesso codice d'uscita — quindi il vincolo di cecità già scritto in giro.sh (che
  // scatta su rc≥2) non si alzava mai, e il giro riceveva un verde per una misura mai fatta.
  //
  // La decisione sta in `verdettoCopertura` (misura-parziale.mjs), fuori di qui e pura: tre esiti,
  // 0 misurato e pulito · 1 violazione · 2 cieco, secondo il contratto dei guardiani (AR-322).
  const misurate = controllate - ciechi.length;
  const verdetto = verdettoCopertura({ controllate, misurate, violazioni: sospette.length });

  // Contratto AR-307: prima riga = verdetto in una riga, poi il dettaglio.
  if (verdetto.esito === "violazione") {
    console.log(
      `❌ PROVE DISONESTE: ${sospette.length} difetti su ${misurate} misurati (di ${controllate} controllati) hanno una prova già soddisfatta alla nascita — si chiuderebbero da soli senza che nessuno ripari niente (AR-330).`,
    );
  } else if (verdetto.esito === "cieco") {
    console.log(`⚪ PROVE NON MISURATE: ${verdetto.motivo} — questo NON è un verde (AR-353).`);
  } else {
    console.log(`✅ Prove oneste: ${misurate} prove misurate su ${controllate} controllate, nessuna era già soddisfatta alla nascita.`);
  }
  for (const s of sospette) {
    console.log(`  · ${s.d.id} [${s.d.gravita}] ${String(s.d.titolo).slice(0, 80)}`);
    console.log(`      ${s.motivo}`);
  }
  if (!storia.intera) {
    // AR-419: dirlo UNA volta, in cima all'elenco dei ciechi, invece di lasciare che ogni riga
    // suggerisca «file nato dopo». Il motivo cambia cosa deve fare chi legge.
    console.log(`\n⚪ NESSUNA prova è ricostruibile in questa sessione — ${storia.motivo}.`);
    console.log(`   Non è che i file siano nati dopo: è che il passato non c'è. Per misurare: git fetch --unshallow.`);
  }
  if (ciechi.length) {
    console.log(`\n👁️  ${ciechi.length} non misurabili (file nato dopo, o storia non ricostruibile): non contano come verdi né come rossi.`);
    for (const c of ciechi.slice(0, 5)) console.log(`  · ${c.d.id}: ${c.motivo}`);
    if (ciechi.length > 5) console.log(`  · …e altri ${ciechi.length - 5}`);
  }
  if (sospette.length) {
    console.log(
      `\n→ Come si ripara: la prova deve citare qualcosa che esisterà SOLO col fix installato. Meglio ancora, sostituiscila con una prova comportamentale: {"comando":"node cervello/test/<nome>.test.mjs"}.`,
    );
  }
  if (verdetto.esito === "cieco") {
    console.log(`\n→ Copertura ${Math.round(verdetto.copertura * 100)}%: esco 2 (cieco), non 0. Per misurare davvero: git fetch --unshallow.`);
  }
  process.exit(verdetto.codice);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
