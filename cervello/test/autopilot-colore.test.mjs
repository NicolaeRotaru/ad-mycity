// AR-109 — test del cancello SEMAFORO dell'autopilot (node --test, nessuna rete).
//
// Il difetto che questo test pinza: fino al 2026-07-25 il cancello LIVE guardava solo il campo
// `colore` scritto dentro calendario-editoriale.json. Una voce {canale:"email",
// to:"cliente@reale.it", colore:"verde"} con AUTOPILOT_LIVE=1 e la chiave Resend collegata
// PARTIVA DA SOLA verso un cliente reale. La funzione coloreMinimo() esisteva in email.mjs dal
// 16/7 col commento «l'autopilot deve usare max(coloreMinimo, colore della voce)» — e nessun
// file la chiamava.
//
// Le prove qui sotto sono due, e la seconda è quella che conta: fa girare l'autopilot VERO in
// LIVE, su un calendario e una coda temporanei, e verifica che l'email non parta.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { normalizzaColore, coloreMax, coloreEffettivo } from "../autopilot.mjs";
import { coloreMinimoPer, destinatarioPer } from "../publishers/index.mjs";

const AUTOPILOT = fileURLToPath(new URL("../autopilot.mjs", import.meta.url));

test("normalizzaColore(): parole, emoji e il fail-closed sui colori che non si capiscono", () => {
  assert.equal(normalizzaColore("verde"), "🟢");
  assert.equal(normalizzaColore("giallo"), "🟡");
  assert.equal(normalizzaColore("rosso"), "🔴");
  assert.equal(normalizzaColore(" Verde "), "🟢", "spazi e maiuscole non cambiano il colore");
  assert.equal(normalizzaColore("🟡"), "🟡", "accetta anche l'emoji");
  // Il punto di AR-073: un colore mancante o scritto male NON è un permesso.
  assert.equal(normalizzaColore(""), "🔴");
  assert.equal(normalizzaColore(undefined), "🔴");
  assert.equal(normalizzaColore("verdino"), "🔴");
});

test("coloreMax(): si può solo peggiorare, mai migliorare", () => {
  assert.equal(coloreMax("🟢", "🟢"), "🟢");
  assert.equal(coloreMax("🟢", "giallo"), "🟡");
  assert.equal(coloreMax("giallo", "🟢"), "🟡", "l'ordine degli argomenti non conta");
  assert.equal(coloreMax("🔴", "verde"), "🔴");
});

test("coloreMinimoPer(): il rischio lo dichiara il CANALE, non la voce", () => {
  // Email verso un indirizzo reale = clienti veri, consenso GDPR, irreversibile.
  assert.equal(coloreMinimoPer("email", { to: "cliente@reale.it" }), "🔴");
  // Canali pubblici: cancellabili, ma mai automatici.
  assert.equal(coloreMinimoPer("facebook", {}), "🟡");
  assert.equal(coloreMinimoPer("instagram", {}), "🟡");
  assert.equal(coloreMinimoPer("gbp", {}), "🟡");
  assert.equal(coloreMinimoPer("google-business", {}), "🟡", "l'alias del canale vale come il canale");
  // Chat dell'owner (l'env punta alla chat di Nicola): l'unico canale davvero interno.
  assert.equal(coloreMinimoPer("telegram", {}), "🟢");
  // Fail-closed: un canale che nessun publisher dichiara vale 🔴.
  assert.equal(coloreMinimoPer("piccione-viaggiatore", {}), "🔴");
  assert.equal(destinatarioPer("piccione-viaggiatore", {}), "", "canale ignoto → nessun destinatario noto");
});

test("coloreEffettivo(): la voce non può auto-dichiararsi più sicura del suo canale", () => {
  // ⬇️ Il caso esatto della radiografia del 16/7.
  const pericolosa = { canale: "email", to: "cliente@reale.it", colore: "verde" };
  assert.equal(coloreEffettivo(pericolosa), "🔴", "email a un cliente reale resta 🔴 anche se si dichiara verde");

  const postPubblico = { canale: "facebook", colore: "verde" };
  assert.equal(coloreEffettivo(postPubblico), "🟡");

  // E il verde legittimo resta verde: il freno non blocca tutto per principio.
  assert.equal(coloreEffettivo({ canale: "telegram", colore: "verde" }), "🟢");
  // Ma una voce 🔴 su canale interno resta 🔴: il peggiore dei due vince sempre.
  assert.equal(coloreEffettivo({ canale: "telegram", colore: "rosso" }), "🔴");
});

// ─────────────────────────────────────────────────────────────────────────────
// La prova che conta: l'autopilot VERO, in LIVE, non manda l'email al cliente.
function giroFinto(voci, env = {}) {
  const dir = mkdtempSync(join(tmpdir(), "autopilot-ar109-"));
  const calendario = join(dir, "calendario.json");
  const coda = join(dir, "coda.md");
  writeFileSync(calendario, JSON.stringify({ voci }, null, 2));
  writeFileSync(coda, "# ⏳ AZIONI IN ATTESA (firma di Nicola)\n");
  const r = spawnSync(process.execPath, [AUTOPILOT, "giro", "--tutto"], {
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOPILOT_LIVE: "1",
      AUTOPILOT_CALENDARIO: calendario,
      AUTOPILOT_CODA: coda,
      AUTOPILOT_LOG_DIR: join(dir, "log"),
      // Chiavi "collegate": senza il fix, questo basterebbe a far partire l'invio davvero.
      RESEND_API_KEY: "re_finta_per_il_test",
      RESEND_FROM: "MyCity <no-reply@test.invalid>",
      EMAIL_TEST_TO: "nicola@test.invalid",
      TELEGRAM_BOT_TOKEN: "finto",
      TELEGRAM_CHAT_ID: "12345",
      // Nessuna chiave Supabase: la PAUSA non è verificabile → fail-closed (AR-100).
      SUPABASE_URL: "",
      SUPABASE_SERVICE_KEY: "",
      ...env,
    },
  });
  return { out: `${r.stdout || ""}${r.stderr || ""}`, coda: existsSync(coda) ? readFileSync(coda, "utf8") : "" };
}

test("end-to-end: voce 'verde' + destinatario reale ⇒ ACCODATA, mai inviata", () => {
  const { out, coda } = giroFinto([
    {
      id: "prova-ar109",
      data: "2026-01-01",
      canale: "email",
      titolo: "Newsletter ai clienti",
      testo: "Ciao! Novità da MyCity.",
      to: "cliente@reale.it",
      colore: "verde", // ⬅️ la bugia che prima passava
      stato: "programmato",
    },
  ]);

  assert.match(out, /ACCODATO per firma di Nicola/, "la voce dev'essere accodata, non pubblicata");
  assert.match(out, /il canale "email" vale almeno 🔴/, "il motivo dev'essere il canale, non il colore dichiarato");
  assert.doesNotMatch(out, /\[LIVE\] EMAIL/, "NESSUN invio reale può comparire nel log");
  assert.match(coda, /prova-ar109|Newsletter ai clienti/, "il blocco dev'essere finito nella coda da firmare");
});

test("end-to-end: anche il verde legittimo non parte se il destinatario non è in allowlist", () => {
  // Telegram è 🟢 per canale, quindi supera il semaforo: qui a fermarlo dev'essere il cancello
  // di consenso (AR-103) — senza chiavi Supabase la PAUSA non è verificabile → fail-closed.
  const { out } = giroFinto([
    {
      id: "prova-verde",
      data: "2026-01-01",
      canale: "telegram",
      titolo: "Promemoria interno",
      testo: "Nota per Nicola.",
      colore: "verde",
      stato: "programmato",
    },
  ]);

  assert.match(out, /LIVE bloccato → DRY-RUN/, "il verde passa il semaforo ma non il cancello di consenso");
  assert.match(out, /PAUSA non verificabile/, "senza chiavi Supabase il kill-switch è fail-closed");
  assert.doesNotMatch(out, /\[LIVE\] TELEGRAM/, "nessun invio reale");
});
