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
 */
export function testoAllaNascita(file, nato, run = git) {
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

  const aperti = (cantiere.difetti || []).filter((d) => d && d.stato !== "chiuso");
  const sospette = [];
  const ciechi = [];
  let controllate = 0;

  for (const d of aperti) {
    if (!provaControllabile(d.verifica)) continue;
    controllate++;
    const testo = testoAllaNascita(d.verifica.file, d.nato);
    const r = nataGiaSoddisfatta(d.verifica, testo);
    if (r.esito === "sospetta") sospette.push({ d, motivo: r.motivo });
    else if (r.esito === "cieco") ciechi.push({ d, motivo: r.motivo });
  }

  const soloElenco = process.argv.includes("--elenco");
  if (soloElenco) {
    for (const s of sospette) console.log(s.d.id);
    process.exit(sospette.length ? 1 : 0);
  }

  // Contratto AR-307: prima riga = verdetto in una riga, poi il dettaglio.
  if (sospette.length) {
    console.log(
      `❌ PROVE DISONESTE: ${sospette.length} difetti su ${controllate} controllati hanno una prova già soddisfatta alla nascita — si chiuderebbero da soli senza che nessuno ripari niente (AR-330).`,
    );
  } else {
    console.log(`✅ Prove oneste: ${controllate} prove controllate, nessuna era già soddisfatta alla nascita.`);
  }
  for (const s of sospette) {
    console.log(`  · ${s.d.id} [${s.d.gravita}] ${String(s.d.titolo).slice(0, 80)}`);
    console.log(`      ${s.motivo}`);
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
  process.exit(sospette.length ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
