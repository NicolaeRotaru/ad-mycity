#!/usr/bin/env node
// 🛟 LE SCRITTURE A RISCHIO — cosa si perde se adesso passa un comando distruttivo (AR-388).
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «il freno sta dentro il comando invece che sul lavoro»
// ─────────────────────────────────────────────────────────────────────────────
// In `cervello/vps/aggiorna-cervello.sh` c'è un `git checkout -f -B` che riporta il worktree su
// main. È il comando più distruttivo della macchina: tutto ciò che è scritto e non committato
// sparisce. Sopra di lui, novanta righe più in su, c'è il recupero delle scritture pendenti — e in
// quel punto sono nati DUE rami che se ne vanno via senza committare niente:
//
//   · il cancello di pubblicazione dice no  → `git reset HEAD -- .` e si prosegue (AR-314);
//   · c'è già un arretrato non pubblicato   → non si committa affatto (AR-467).
//
// Tutti e due stampano una riga rassicurante — «restano sul server», «prima si pubblica, poi si
// committa» — e tutti e due proseguono fino al `checkout -f`, che le scritture le butta. La frase
// era falsa nel momento in cui è stata scritta, e nessuno se n'è accorto perché nessun test
// percorreva lo script fino in fondo su un albero sporco.
//
// LA CURA NON È UN TERZO `if` NEI DUE RAMI. Sarebbe la stessa malattia spostata di dieci righe: il
// terzo ramo che nascerà domani non lo erediterebbe. Il freno va **al confine dell'atto**, sul DATO
// («c'è memoria scritta e non salvata?»), dove vale per chiunque arrivi lì — compreso chi arriverà
// per una strada che oggi non esiste.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun git, nessun orologio. È l'unico modo perché una
// prova esegua la decisione invece di rileggerla.
//
// Prova comportamentale: node cervello/test/checkout-che-butta-la-memoria.test.mjs

/** Le cartelle che contengono memoria: quello che ci sta dentro non si perde mai. */
export const DIRS_MEMORIA = Object.freeze(["MyCity-Vault", "consegne", "creativi", "memoria-squadra"]);

/**
 * Il percorso dichiarato da una riga di `git status --porcelain` (formato v1).
 *
 * Le forme che arrivano davvero: `XY percorso`, `R  vecchio -> nuovo` per i rinominati, e i nomi con
 * lo spazio o l'accento che git consegna fra virgolette. Di un rinominato conta la DESTINAZIONE: è
 * lì che sta il contenuto che si perderebbe.
 */
export function percorsoDaRiga(riga) {
  const r = String(riga ?? "");
  if (r.length < 4) return "";
  let resto = r.slice(3);
  const freccia = resto.indexOf(" -> ");
  if (freccia >= 0) resto = resto.slice(freccia + 4);
  resto = resto.trim();
  if (resto.startsWith('"') && resto.endsWith('"') && resto.length > 1) resto = resto.slice(1, -1);
  return resto;
}

/** Questo percorso vive dentro una cartella di memoria? (un nome che COMINCIA come una non basta) */
export function eMemoria(percorso, dirs = DIRS_MEMORIA) {
  const p = String(percorso ?? "").trim();
  return dirs.some((d) => p === d || p.startsWith(`${d}/`));
}

/**
 * LA DECISIONE, al confine dell'atto distruttivo.
 *
 * Riceve l'uscita grezza di `git status --porcelain` e risponde una cosa sola: prima di lasciar
 * passare un comando che riscrive il worktree, c'è del lavoro da mettere al sicuro?
 *
 *   azione = "metti-da-parte" → c'è memoria scritta e non committata: si salva PRIMA di proseguire
 *   azione = "procedi"        → niente da perdere
 *
 * Nota sul silenzio: un porcelain vuoto vuol dire «albero pulito», e va bene. Un porcelain che non
 * arriva affatto (chi chiama non è riuscito a leggerlo) NON deve passare da qui come «pulito» — chi
 * chiama lo tratta come cieco e mette da parte lo stesso, perché un salvataggio inutile costa una
 * voce di stash e un checkout di troppo costa il lavoro di una notte.
 */
export function decidiPrimaDelCheckout({ porcelain = "", dirsMemoria = DIRS_MEMORIA } = {}) {
  const file = String(porcelain ?? "")
    .split("\n")
    .map((r) => percorsoDaRiga(r))
    .filter((p) => p && eMemoria(p, dirsMemoria));
  const unici = [...new Set(file)];
  if (unici.length === 0) {
    return { azione: "procedi", file: [], motivo: "nessuna memoria scritta e non salvata: il checkout non porta via niente" };
  }
  return {
    azione: "metti-da-parte",
    file: unici,
    motivo: `${unici.length} file di memoria scritti e NON salvati: il checkout li cancellerebbe (${unici.slice(0, 3).join(", ")}${unici.length > 3 ? ", …" : ""})`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI — è così che lo script bash chiede, invece di decidere da sé.
//   git status --porcelain -- MyCity-Vault … | node cervello/scritture-a-rischio.mjs decidi
// Stampa UNA parola su stdout (`metti-da-parte` o `procedi`) e il motivo su stderr: stdout è il
// valore che il chiamante cattura, e ogni chiacchiera lì dentro finirebbe dentro il valore.
// ─────────────────────────────────────────────────────────────────────────────
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const cmd = process.argv[2] || "decidi";
  if (cmd !== "decidi") {
    process.stderr.write("Uso: scritture-a-rischio.mjs decidi   (il porcelain arriva su stdin)\n");
    process.exit(64);
  }
  let porcelain = "";
  process.stdin.setEncoding("utf8");
  for await (const pezzo of process.stdin) porcelain += pezzo;
  const r = decidiPrimaDelCheckout({ porcelain });
  process.stdout.write(`${r.azione}\n`);
  process.stderr.write(`${r.motivo}\n`);
}
