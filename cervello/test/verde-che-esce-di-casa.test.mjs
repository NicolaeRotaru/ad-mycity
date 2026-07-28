#!/usr/bin/env node
// AR-140 — il colore che decide l'esecuzione automatica è testo libero.
//
// L'autopilota esegue da solo tutto ciò che risulta 🟢, e il 🟢 è l'emoji che un senior ha scritto
// nel markdown della card mentre la accodava. È una dichiarazione di intenti, non un fatto. Un verde
// di troppo su una card che manda una mail = una mail vera a una persona vera, partita da sola.
//
// Misurato il 28/7 sulla coda reale: **zero** card verdi con un canale verso il mondo — e la misura
// è servita, perché il primo conteggio ne trovava due. Erano due card `🔴 (bozze 🟢)`: il 🟢 stava
// in una parentesi, e cercavo l'emoji in tutta la riga invece che nella colonna del colore.
// `livelloDi` fa già la cosa giusta (vince il colore più restrittivo presente), il mio grep no.
//
// Quindi il cancello nasce VERDE, ed è il punto: uno che nasce rosso su mezza coda viene disattivato
// entro la settimana. Questo serve per il primo che comparirà.
//
// Il verso della regola conta: **può solo ALZARE il colore, mai abbassarlo.** Un modulo che potesse
// anche abbassare sarebbe un modo nuovo per far partire una cosa rossa.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { almeno, autoEseguibile, livelloEffettivo, versoIlMondo } = await import(
  join(REPO, "pannello/src/lib/livello-effettivo.ts")
);

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: 🟢 + email non è auto-eseguibile", () => {
  assert.equal(autoEseguibile("verde", "email cliente@example.com"), false);
  assert.equal(livelloEffettivo("verde", "email"), "giallo");
});

prova("la regola può solo ALZARE: un 🔴 su canale interno resta 🔴", () => {
  assert.equal(livelloEffettivo("rosso", "memoria"), "rosso");
  assert.equal(livelloEffettivo("rosso", "email"), "rosso", "non scende a giallo perché il minimo è giallo");
  assert.equal(almeno("rosso", "giallo"), "rosso");
  assert.equal(almeno("verde", "giallo"), "giallo");
});

prova("un canale di casa non alza niente: il verde resta verde", () => {
  assert.equal(versoIlMondo("memoria"), false);
  assert.equal(versoIlMondo("git"), false);
  assert.equal(autoEseguibile("verde", "memoria"), true, "altrimenti l'autopilota non farebbe più niente e verrebbe spento");
});

prova("canale non dichiarato = esterno, non innocuo", () => {
  // Fail-closed: «non so dove va» non è un motivo per farla partire da sola.
  assert.equal(versoIlMondo(""), true);
  assert.equal(autoEseguibile("verde", ""), false);
});

prova("colore sconosciuto su canale esterno diventa giallo", () => {
  assert.equal(livelloEffettivo("?", "whatsapp"), "giallo");
  assert.equal(livelloEffettivo("?", "memoria"), "?", "in casa un «?» resta un «?»: non è questo controllo a doverlo risolvere");
});

prova("i canali verso il mondo sono quelli che raggiungono una persona", () => {
  for (const c of ["email", "e-mail", "Telegram", "WhatsApp 348 642 1766", "SMS", "notifica in-app", "push", "IG feed @mycity.piacenza", "telefono 0523 388601", "PEC", "stampa"]) {
    assert.equal(versoIlMondo(c), true, `«${c}» dovrebbe contare come esterno`);
  }
});

prova("telegram conta come esterno anche se oggi va solo a Nicola", () => {
  // Il giorno che punterà altrove, la regola dev'essere già in piedi — non aggiunta dopo.
  assert.equal(versoIlMondo("telegram"), true);
});

// ── La coda VERA ────────────────────────────────────────────────────────────

prova("sulla coda di oggi il cancello non toglie niente a nessuno", () => {
  // Il numero che rende il cancello adottabile: se togliesse dieci card a Nicola, verrebbe spento.
  const md = readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"), "utf8");
  const righe = md.split("\n").filter((r) => /^\s*\|/.test(r));
  let verdiEsterne = 0;
  for (const r of righe) {
    const c = r.split("|").map((x) => x.trim());
    if (c.length < 8) continue;
    const colore = c[5] || "";
    // la stessa regola di livelloDi: vince il più restrittivo PRESENTE
    const liv = colore.includes("🔴") ? "rosso" : colore.includes("🟡") ? "giallo" : colore.includes("🟢") ? "verde" : "?";
    if (liv === "verde" && versoIlMondo(c[7] || "")) verdiEsterne++;
  }
  assert.equal(verdiEsterne, 0,
    `atteso 0 card verdi con canale esterno (il cancello deve nascere verde), trovate ${verdiEsterne}`);
});

// ── Gli innesti ─────────────────────────────────────────────────────────────

prova("l'autopilota decide col livello effettivo, non con l'emoji", () => {
  const a = readFileSync(join(REPO, "pannello/src/lib/autopilota.ts"), "utf8");
  assert.match(a, /autoEseguibile\(b\.livello, b\.canale\)/);
  assert.doesNotMatch(a, /b\.livello === "verde"/, "il confronto diretto con l'emoji non deve più esistere");
});

prova("e il Pannello MOSTRA lo stesso livello che l'autopilota userà", () => {
  // Due verità diverse sullo stesso colore sarebbero il difetto di prima con un nome nuovo: Nicola
  // vedrebbe 🟢 su una card che la macchina non eseguirà, o peggio il contrario.
  const p = readFileSync(join(REPO, "pannello/src/lib/azioni-pronte.ts"), "utf8");
  assert.match(p, /livelloEffettivo\(b\.livello, b\.canale\)/);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
