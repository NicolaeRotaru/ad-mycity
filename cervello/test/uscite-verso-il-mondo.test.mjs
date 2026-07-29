#!/usr/bin/env node
// AR-272 · AR-206 — le uscite verso il mondo reale, e chi non passa dal cancello.
//
// I tre bloccanti sulla sicurezza dicono la stessa cosa con parole diverse:
//
//   AR-206 ⑤ — «i controlli sono stati messi al PUNTO DI CHIAMATA invece che al confine»
//   AR-226 ③ — «nessuna route mutante guarda chi chiama: non c'è uno strato comune»
//   AR-272 ④ — «il merge non è stato RICONOSCIUTO come una mano»
//
// **Il cancello sta dentro ogni singolo esecutore, non al confine.** Quindi ogni uscita nuova nasce
// scoperta e nessuno se ne accorge, perché non esisteva un elenco di cosa sia un'uscita.
//
// Il caso che fa più impressione: mandare codice in produzione — su `main` un merge fa partire il
// Deploy Hook — era l'UNICA mano senza cancello, mentre un'email a un cliente passa da PAUSA + firma
// di Nicola + allowlist. E `--force` era un'opzione documentata per saltare anche il poco che c'era.
//
// AR-226 non è in questo lotto: il suo lato codice è già fatto (middleware.ts, lotto C) e quello che
// manca è il click di Nicola su Vercel Authentication — per questo ha `verifica: {tipo:"umano"}`.

import { execFileSync } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Esegue un comando e torna {rc, out} senza lanciare. */
function esegui(args) {
  try {
    return { rc: 0, out: execFileSync("node", args, { cwd: REPO, encoding: "utf8" }) };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

// ── AR-272: il merge è una mano ──────────────────────────────────────────────
prova("il caso che ha rotto: il merge passa dal cancello di consenso", () => {
  const src = leggi("cervello/git-merge.mjs");
  assert.match(src, /from "\.\/consenso-azione\.mjs"/, "il merge dev'essere una mano come le altre");
  assert.match(src, /consensoInvio\(\{/);
  assert.match(src, /canale: "github"/, "il canale esisteva già nel cancello, pronto e mai chiamato");
  assert.doesNotMatch(src, /const canMerge = \(LIVE \|\| force\)/, "era la riga che saltava il freno");
  assert.match(src, /const canMerge = LIVE && consenso\.live/, "servono ENTRAMBI");
});

prova("il caso che ha rotto: --force non esiste più, e lo dice", () => {
  // Un cancello con accanto l'interruttore per spegnerlo non è un cancello. Era pure documentato.
  const r = esegui([join(REPO, "cervello/git-merge.mjs"), "--repo", "ad-mycity", "--pr", "1", "--force"]);
  assert.equal(r.rc, 1, "--force deve far uscire con errore, non essere ignorato in silenzio");
  assert.match(r.out, /--force non esiste più/);
  assert.match(r.out, /AR-272/);
  const src = leggi("cervello/git-merge.mjs");
  assert.doesNotMatch(src, /Merge anche se AZIONI_LIVE=0/, "e non dev'essere più documentato");
});

prova("--dry-run resta: provare senza mergiare va nella direzione sicura", () => {
  const src = leggi("cervello/git-merge.mjs");
  assert.match(src, /--dry-run/, "serve un modo di provare che NON pubblica");
  assert.match(src, /Per provare senza mergiare: --dry-run/, "e il messaggio d'errore deve indicarlo");
});

// ── la radice: l'elenco delle uscite ─────────────────────────────────────────
prova("il registro delle uscite non è vuoto e ogni voce dice cosa fa", () => {
  const reg = JSON.parse(leggi("cervello/uscite-reali.json"));
  assert.ok(Array.isArray(reg.uscite) && reg.uscite.length >= 8, `solo ${reg.uscite?.length} uscite dichiarate`);
  for (const u of reg.uscite) {
    assert.ok(u.file && u.cosa_fa, `voce incompleta: ${u.file || "?"}`);
    assert.ok(["consenso", "non-serve"].includes(u.cancello), `${u.file}: cancello non dichiarato`);
  }
});

prova("ogni esenzione porta un PERCHÉ di sostanza, non una formula", () => {
  // Un'esenzione senza motivo è un silenzio, ed è la cosa che questo registro cura.
  const reg = JSON.parse(leggi("cervello/uscite-reali.json"));
  const esenti = reg.uscite.filter((u) => u.cancello === "non-serve");
  assert.ok(esenti.length > 0);
  for (const u of esenti) {
    assert.ok((u.perche || "").length > 60, `${u.file}: esenzione senza un perché vero`);
  }
});

prova("il guardiano gira davvero, ed è verde adesso", () => {
  const r = esegui([join(REPO, "cervello/uscite-check.mjs"), "--json"]);
  const j = JSON.parse(r.out);
  assert.equal(j.ok, true, `uscite scoperte: ${JSON.stringify(j.scoperte)}`);
  assert.ok(j.uscite_trovate >= 8, "un guardiano che non trova nessuna uscita è finto");
  assert.equal(r.rc, 0);
});

prova("il caso che ha rotto: un'uscita NUOVA e non dichiarata fa fallire il giro", () => {
  // È tutto il valore di questo guardiano: non giudica se un'uscita sia pericolosa — pretende che
  // sia DICHIARATA. Una dichiarazione si discute; un'omissione non la vede nessuno.
  const reg = JSON.parse(leggi("cervello/uscite-reali.json"));
  const senzaUna = { ...reg, uscite: reg.uscite.filter((u) => u.file !== "cervello/esegui-azione.mjs") };
  // Simulo togliendo una voce dal registro: il guardiano deve accorgersene.
  const orig = leggi("cervello/uscite-reali.json");
  try {
    writeFileSync(join(REPO, "cervello/uscite-reali.json"), JSON.stringify(senzaUna, null, 2));
    const r = esegui([join(REPO, "cervello/uscite-check.mjs"), "--json"]);
    const j = JSON.parse(r.out);
    assert.equal(j.ok, false, "un'uscita tolta dal registro dev'essere segnalata");
    assert.ok(j.scoperte.some((s) => s.file === "cervello/esegui-azione.mjs"));
    assert.equal(r.rc, 1, "e il giro deve riceverne il vincolo");
  } finally {
    writeFileSync(join(REPO, "cervello/uscite-reali.json"), orig);
  }
});

prova("il guardiano non conta le forme citate nei commenti", () => {
  // Stessa lezione della spazzata dei fratelli: contare le MENZIONI farebbe crescere il numero
  // proprio quando qualcuno documenta il difetto.
  const src = leggi("cervello/uscite-check.mjs");
  assert.match(src, /senzaCommenti/);
  assert.match(src, /SALTA/, "e i file di test, che citano le forme per vietarle");
});

prova("il guardiano è agganciato al giro come cancello", () => {
  const src = leggi("cervello/giro.sh");
  assert.match(src, /guardiano uscite-check\.mjs/, "deve girare a ogni giro");
  assert.match(src, /USCITE_VINCOLO=/, "e il suo esito dev'essere un vincolo");
  // AR-379/AR-387 (lotto 33): l'elenco dei vincoli non si enumera più a mano, si deriva dalle
  // variabili che esistono davvero. Cercare qui il nome dentro una lista significherebbe rimettere
  // in piedi proprio la lista che poteva restare indietro. La domanda giusta è se la variabile
  // esiste ed è derivabile — e allora è contata per costruzione.
  assert.match(src, /compgen -v[^\n]*_VINCOLO/, "i vincoli vanno derivati: una lista a mano prima o poi resta indietro");
});

// ── AR-206 (b): niente jolly su una cartella scrivibile ──────────────────────
prova("il caso che ha rotto: un jolly nel PERCORSO di esecuzione è vietato", () => {
  const src = leggi("cervello/permessi-check.mjs");
  assert.match(src, /no-jolly-su-cartella-scrivibile/);
  const r = esegui([join(REPO, "cervello/permessi-check.mjs")]);
  assert.match(r.out, /Bash\(node cervello\/\*\.mjs:\*\)/, "il permesso jolly vero dev'essere segnalato");
  assert.match(r.out, /Bash\(bash cervello\/\*\.sh:\*\)/, "entrambe le forme, non una sola");
});

prova("…ma un permesso su UN programma preciso NON viene bocciato", () => {
  // La prima versione di questa regola bocciava anche `Bash(node cervello/auto-fix.mjs:*)`, dove il
  // jolly sta sugli ARGOMENTI. Un cancello che boccia ciò che va bene viene disattivato entro la
  // settimana — e allora non protegge più nemmeno dal caso vero.
  const r = esegui([join(REPO, "cervello/permessi-check.mjs")]);
  assert.doesNotMatch(r.out, /permesso troppo largo: Bash\(node cervello\/auto-fix\.mjs/);
  assert.doesNotMatch(r.out, /permesso troppo largo: Bash\(node --test/);
});

prova("la correzione resta a Nicola, e il guardiano lo dice", () => {
  // .claude/settings.json è negato in Edit/Write alla macchina, apposta: è il file che decide cosa
  // la macchina può eseguire. Un guardiano che potesse ripararlo da sé non sarebbe un guardiano.
  const r = esegui([join(REPO, "cervello/permessi-check.mjs")]);
  assert.match(r.out, /le fa NICOLA/i, "dev'essere chiaro chi esegue la correzione");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
