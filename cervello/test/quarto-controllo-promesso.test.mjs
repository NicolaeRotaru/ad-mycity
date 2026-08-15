#!/usr/bin/env node
// 🚧 AR-394 — «Il cancello comune promette quattro controlli e ne fa tre: il quarto è un parametro
// morto.»
//
// IL FATTO. `gate_verdetto` (cervello/gate-pubblicazione.sh) ha quattro posti: segreti, fatti,
// onestà, sanità. Il terzo riceveva una variabile nata a zero e mai più toccata, perché il controllo
// d'onestà non veniva eseguito affatto. Per il verdetto uno zero mai scritto e un guardiano passato
// sono identici — e la firma della funzione continuava a rassicurare chi legge molto dopo che la
// sostanza era sparita. Quando un controllo dà fastidio lo si degrada a informativo lasciandone in
// piedi la FORMA: il nome nella lista, il parametro, il commento.
//
// PERCHÉ QUESTO FILE. Il fix è di due pezzi — l'AMBITO (`parteViva`, che toglie il diario
// append-only) e il MODO (`esitoOnesta`, che classifica e fa entrare l'rc nel verdetto). Il secondo
// pezzo, cioè il CABLAGGIO nel cancello, era verificato solo contando quante volte la parola
// `rc_one` compare nel file: un conteggio, non un comportamento. Qui il cancello VERO viene
// eseguito, con guardiani finti che dicono quello che serve, e si guarda se pubblica o no.
//
// COSA PROVA, eseguendo `gate_pubblicazione`:
//   ① IL CASO CHE HA ROTTO: in modo BLOCCA, con l'onestà che segnala una violazione, il cancello
//      NON fa pubblicare. Col parametro morto lasciava passare.
//   ② in modo AVVISA non blocca — ma il valore è MISURATO e la frase lo dice: il terzo caso, quello
//      del posto che nessuno riempie, non esiste più.
//   ③ onestà pulita → si pubblica (la prova non è vacua: il cancello non rifiuta sempre).
//   ④ il metro assente in modo BLOCCA è CIECO, e cieco non è verde (AR-322).
//
// NON-VACUITÀ (verificata rompendo il fix apposta): sostituendo in gate-pubblicazione.sh la riga che
// legge `rcVerdetto` con un `rc_one=0` fisso — cioè rimettendo il parametro morto — il caso ①
// diventa ROSSO: il cancello lascia pubblicare una memoria che il controllo d'onestà ha bocciato.

import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GATE = join(REPO, "cervello", "gate-pubblicazione.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/**
 * Fa girare il cancello VERO con guardiani finti.
 * `onesta` = rc del controllo d'onestà · `modo` = blocca | avvisa · `metroAssente` = il metro non c'è.
 */
function cancello({ onesta = 0, modo = "blocca", metroAssente = false } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "ar394-"));
  const dir = join(tmp, "cervello");
  const repo = join(tmp, "repo");
  const bin = join(tmp, "bin");
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(repo, "MyCity-Vault", "90-Memoria-AI", "Briefing"), { recursive: true });
  mkdirSync(bin, { recursive: true });

  // I tre guardiani storici: passano, così l'unica variabile in gioco è il quarto.
  for (const g of ["scan-segreti.mjs", "coerenza-fatti.mjs", "vault-sanita.mjs"]) {
    writeFileSync(join(dir, g), "process.exit(0);\n");
  }
  if (!metroAssente) {
    // Il metro dell'onestà è finto (dice quello che serve al caso); la TESTA che classifica è quella
    // vera, copiata dal repo: è lei il pezzo sotto esame.
    writeFileSync(join(dir, "onesta-check.mjs"), `process.exit(${onesta});\n`);
    writeFileSync(join(dir, "istante-cancello.mjs"), readFileSync(join(REPO, "cervello", "istante-cancello.mjs"), "utf8"));
  }
  writeFileSync(join(repo, "MyCity-Vault", "90-Memoria-AI", "STATO.md"), "# Stato\n\nOrdini pagati: 3 (fonte: REST 15/8).\n");

  writeFileSync(
    join(bin, "git"),
    `#!/usr/bin/env bash
case "$*" in
  *"rev-parse --abbrev-ref HEAD"*) echo main ;;
  *"diff --cached --name-only"*) echo "MyCity-Vault/90-Memoria-AI/STATO.md" ;;
esac
exit 0
`,
  );
  chmodSync(join(bin, "git"), 0o755);

  const r = spawnSync("bash", ["-c", `. '${GATE}'; gate_pubblicazione '${dir}' '${repo}' main 1`], {
    encoding: "utf8",
    timeout: 60_000,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, GATE_ONESTA: modo },
  });
  return { pubblica: r.status === 0, testo: `${r.stdout || ""}${r.stderr || ""}` };
}

prova("① IL CASO CHE HA ROTTO: onestà bocciata e modo BLOCCA → il cancello NON fa pubblicare", () => {
  const r = cancello({ onesta: 1, modo: "blocca" });
  assert.equal(r.pubblica, false, "il quarto posto del verdetto è di nuovo uno zero muto: quattro controlli promessi, tre fatti");
  assert.match(r.testo, /onestà=/, "il verdetto deve dire il valore misurato, non nasconderlo");
});

prova("② in modo AVVISA non blocca, ma il valore è MISURATO e detto", () => {
  const r = cancello({ onesta: 1, modo: "avvisa" });
  assert.equal(r.pubblica, true, "in modo avvisa la memoria deve continuare a uscire");
  assert.match(r.testo, /GATE/, "un controllo che non blocca deve almeno dire cosa ha visto: il silenzio è il difetto");
});

prova("③ onestà pulita → si pubblica (la prova non è vacua)", () => {
  const r = cancello({ onesta: 0, modo: "blocca" });
  assert.equal(r.pubblica, true, `il cancello rifiuta anche quando è tutto a posto: ${r.testo.slice(-300)}`);
});

prova("④ il metro assente in modo BLOCCA è CIECO, e cieco non è verde", () => {
  const cieco = cancello({ metroAssente: true, modo: "blocca" });
  assert.equal(cieco.pubblica, false, "un metro che non c'è non compra il via libera (AR-322)");
  // …ma non spegne gli altri tre: in modo avvisa la memoria esce lo stesso.
  const avvisa = cancello({ metroAssente: true, modo: "avvisa" });
  assert.equal(avvisa.pubblica, true, "la difesa deve restare proporzionata: un clone parziale non deve restare muto");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
