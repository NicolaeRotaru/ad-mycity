#!/usr/bin/env node
// 🚪 GUARDIANO DELLE USCITE — «quali punti di questa macchina toccano il mondo, e chi li controlla?»
//
// Nasce dal punto (c) di AR-272, ed è la radice comune dei tre bloccanti sulla sicurezza:
//
//   AR-206 ⑤ — «i controlli sono stati messi al PUNTO DI CHIAMATA invece che al confine»
//   AR-226 ③ — «nessuna route mutante guarda chi chiama: non c'è uno strato comune»
//   AR-272 ④ — «il merge non è stato RICONOSCIUTO come una mano»
//
// Tre difetti, una frase sola: **il cancello sta dentro ogni singolo esecutore, non al confine.**
// Quindi ogni uscita nuova nasce senza cancello, e nessuno se ne accorge — perché non esisteva un
// elenco di cosa sia un'uscita. Il merge è rimasto scoperto per mesi mentre un'email a un cliente
// passava da PAUSA + firma + allowlist: non per svista, ma perché nessuno l'aveva mai chiamato «mano».
//
// Questo guardiano non decide se un'uscita sia pericolosa: pretende che sia DICHIARATA. Una
// dichiarazione si può discutere e rivedere; un'omissione no, perché nessuno la vede.
//
// Parte VERDE per costruzione: le uscite di oggi sono nel registro. Becca la prossima.
//
// 🟢 Sola lettura: non scrive niente, non tocca il vault, non fa rete.
//
// Uso:
//   node cervello/uscite-check.mjs           -> rapporto
//   node cervello/uscite-check.mjs --json    -> JSON
//
// Exit (contratto AR-322): 0 = tutte dichiarate e col cancello giusto · 1 = uscita scoperta · 2 = cieco

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { leggiPerimetro } from "./perimetro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
const REGISTRO = join(QUI, "uscite-reali.json");
const JSON_MODE = process.argv.includes("--json");

// Le forme in cui questa macchina scrive o manda qualcosa FUORI da sé. Non è una lista di sospetti:
// è la definizione operativa di «uscita».
const FORME_USCITA = [
  { re: /method:\s*"(POST|PUT|PATCH|DELETE)"/, cosa: "scrittura HTTP" },
  { re: /api\.telegram\.org\/bot[^/]*\/sendMessage/, cosa: "invio Telegram" },
  { re: /resend\.[a-z]+\.send|sendMail/i, cosa: "invio email" },
  // Lotto 33 (AR-381). Le tre forme sopra erano scritte guardando le uscite note nel 2026-07: tutte
  // costruivano il fetch a mano, nello stesso file, con `method: "POST"` letterale. Quando i
  // publisher hanno estratto quella riga in una funzione condivisa (`postJSON` di
  // publishers/_comune.mjs) le loro uscite sono diventate invisibili — non perché nascoste, ma
  // perché la forma cercata era la SCRITTURA A MANO invece del FATTO di uscire. Da qui in poi si
  // cerca il bene da proteggere: chi manda qualcosa fuori, comunque scriva la riga.
  { re: /\bpostJSON\s*\(/, cosa: "POST via helper condiviso" },
  { re: /graph\.facebook\.com/, cosa: "pubblicazione Facebook/Instagram" },
  { re: /api\.resend\.com/, cosa: "invio email (Resend HTTP)" },
  { re: /mybusiness[a-z]*\.googleapis\.com/, cosa: "pubblicazione Google Business Profile" },
  { re: /api\.anthropic\.com|api\.openai\.com/, cosa: "motore AI a pagamento" },
];

// I test CITANO queste forme per vietarle: contarli come uscite farebbe crescere il numero proprio
// quando qualcuno scrive la prova. Stessa ragione della spazzata dei fratelli.
const SALTA = ["cervello/test/", "cervello/uscite-check.mjs", "cervello/uscite-reali.json"];

/** Toglie i commenti: una forma citata in un commento non è un'uscita, è la sua spiegazione. */
function senzaCommenti(testo) {
  return testo
    .split("\n")
    .map((r) => {
      const t = r.trimStart();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return "";
      const i = r.indexOf(" // ");
      return i >= 0 ? r.slice(0, i) : r;
    })
    .join("\n");
}

function scansiona() {
  // AR-381: il perimetro si MISURA. Prima era `readdirSync(QUI)` — un livello solo — quindi
  // `publishers/` (Facebook, Instagram, email, Google Business Profile) non esisteva come luogo dove
  // può esserci un'uscita: otto mani che pubblicano davvero non erano mai state contate come mani.
  // Il guardiano usciva verde, e un verde non fa domande.
  const letti = leggiPerimetro(QUI, { estensioni: [".mjs"], escludi: ["test", "stato"] });
  if (letti == null) return null;
  const trovate = [];
  for (const { file, testo: grezzo } of letti) {
    const rel = `cervello/${file}`;
    if (SALTA.some((s) => rel.startsWith(s) || rel === s)) continue;
    const testo = senzaCommenti(grezzo);
    const forme = FORME_USCITA.filter((f) => f.re.test(testo)).map((f) => f.cosa);
    if (forme.length) trovate.push({ file: rel, forme, haCancello: /consenso-azione\.mjs/.test(testo) });
  }
  return trovate;
}

function main() {
  if (!existsSync(REGISTRO)) {
    console.error("⚠️  GUARDIANO CIECO: manca cervello/uscite-reali.json — non so quali uscite sono dichiarate.");
    process.exit(2);
  }
  let reg;
  try {
    reg = JSON.parse(readFileSync(REGISTRO, "utf8"));
  } catch (e) {
    console.error(`⚠️  GUARDIANO CIECO: uscite-reali.json non è JSON valido (${e.message}).`);
    process.exit(2);
  }
  const dichiarate = new Map((reg.uscite || []).map((u) => [u.file, u]));
  if (dichiarate.size === 0) {
    console.error("⚠️  GUARDIANO CIECO: registro vuoto — un guardiano che non cerca niente non è un verde.");
    process.exit(2);
  }

  const trovate = scansiona();
  if (trovate == null) {
    console.error("⚠️  GUARDIANO CIECO: non riesco a leggere la cartella cervello/.");
    process.exit(2);
  }

  const scoperte = []; // uscita vera, mai dichiarata
  const senzaCancello = []; // dichiarata come «serve il cancello», ma non lo importa
  const esentiSenzaMotivo = []; // dichiarata «non-serve» senza spiegare perché

  for (const t of trovate) {
    const d = dichiarate.get(t.file);
    if (!d) {
      scoperte.push(t);
      continue;
    }
    if (d.cancello === "consenso" && !t.haCancello) senzaCancello.push(t.file);
  }
  for (const u of reg.uscite || []) {
    if (u.cancello === "non-serve" && String(u.perche || "").length < 40) esentiSenzaMotivo.push(u.file);
  }

  const problemi = scoperte.length + senzaCancello.length + esentiSenzaMotivo.length;
  const out = {
    ok: problemi === 0,
    uscite_trovate: trovate.length,
    uscite_dichiarate: dichiarate.size,
    scoperte: scoperte.map((s) => ({ file: s.file, forme: s.forme })),
    dichiarate_senza_cancello: senzaCancello,
    esenti_senza_motivo: esentiSenzaMotivo,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log("🚪 USCITE VERSO IL MONDO REALE\n");
    console.log(`   Trovate nel codice: ${trovate.length} · dichiarate nel registro: ${dichiarate.size}`);
    for (const t of trovate) {
      const d = dichiarate.get(t.file);
      const stato = !d ? "❌ MAI DICHIARATA" : d.cancello === "consenso" ? (t.haCancello ? "🔒 cancello" : "❌ cancello MANCANTE") : "🔓 esente (dichiarata)";
      console.log(`     ${stato}  ${t.file}  — ${t.forme.join(", ")}`);
    }
    if (scoperte.length) {
      console.log(`\n   ❌ ${scoperte.length} USCITA/E SCOPERTA/E: tocca il mondo e nessuno l'ha dichiarata.`);
      console.log("      Aggiungila a cervello/uscite-reali.json dicendo se serve il cancello e, se non serve, perché.");
    }
    if (senzaCancello.length) console.log(`\n   ❌ dichiarate «serve il cancello» ma non lo importano: ${senzaCancello.join(", ")}`);
    if (esentiSenzaMotivo.length) console.log(`\n   ❌ esenzioni senza un perché di sostanza: ${esentiSenzaMotivo.join(", ")}`);
    if (problemi === 0) console.log("\n   ✅ ogni uscita è dichiarata, e chi deve avere il cancello ce l'ha.");
  }

  process.exit(problemi === 0 ? 0 : 1);
}

main();
