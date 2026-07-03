#!/usr/bin/env node
// sensore-cassa.mjs — sensore del rischio esistenziale n.1: CASSA / RUNWAY.
// 🟢 Sola lettura verso l'esterno. NON scrive sul DB marketplace: scrive solo cassa-runway.json nel vault.
//
// Risolve AR-016: "la cassa uccide prima del conto economico" non aveva né KPI, né sensore, né sentinella.
// Stima il runway (mesi di autonomia) = cassa disponibile / burn mensile, e lascia un artefatto + segnale
// così la sentinella "runway < 3 mesi" può allertare finanza/Nicola.
//
// Uso:
//   node cervello/sensore-cassa.mjs            -> report leggibile
//   node cervello/sensore-cassa.mjs --json     -> output JSON (per giro.sh / sentinelle)
//
// Exit: 0 = ok/attenzione/sconosciuto · 1 = runway critico (< soglia)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const RETRIES = 3;
const RETRY_MS = 2000;
const SOGLIA_ALLERTA_MESI = 3;

const OUT_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cassa-runway.json");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function conRetry(fn) {
  let last = "";
  for (let i = 1; i <= RETRIES; i++) {
    try {
      const r = await fn();
      if (r.ok) return r;
      last = r.dettaglio || "fallito";
    } catch (e) {
      last = e.message || String(e);
    }
    if (i < RETRIES) await sleep(RETRY_MS);
  }
  return { ok: false, dettaglio: `${last} (dopo ${RETRIES} tentativi)` };
}

// Cassa disponibile da Stripe balance (available + pending), in euro. null se la chiave manca.
async function cassaStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return { eur: null, nota: "STRIPE_SECRET_KEY assente — cassa Stripe non leggibile" };
  const r = await conRetry(async () => {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, dettaglio: `HTTP ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true, data: await res.json() };
  });
  if (!r.ok) return { eur: null, nota: r.dettaglio };
  const somma = (arr) => (Array.isArray(arr) ? arr.reduce((s, x) => s + (x.amount || 0), 0) : 0);
  const centesimi = somma(r.data.available) + somma(r.data.pending);
  return { eur: Math.round(centesimi) / 100, nota: "Stripe balance (available + pending)" };
}

async function main() {
  const quando = nowPiacenza();

  const cassa = await cassaStripe();
  const cassaEur = cassa.eur;

  const burnRaw = process.env.BURN_MENSILE_EUR?.trim();
  const burnEur = burnRaw && !Number.isNaN(Number(burnRaw)) ? Number(burnRaw) : null;

  let runwayMesi = null;
  if (cassaEur != null && burnEur != null && burnEur > 0) {
    runwayMesi = Math.round((cassaEur / burnEur) * 10) / 10;
  }

  let stato = "sconosciuto";
  if (runwayMesi != null) {
    stato = runwayMesi < SOGLIA_ALLERTA_MESI ? "critico" : runwayMesi < 6 ? "attenzione" : "ok";
  }

  // AR-039: contatore di cecità del sensore-cassa. Persiste per quanti giri consecutivi la cassa
  // è "sconosciuta" (Stripe non collegato o BURN_MENSILE_EUR non impostato), così la non-funzionalità
  // del sensore non resta invisibile e una sentinella può allertare 🟡 sotto soglia.
  let giriSconosciuto = 0;
  if (existsSync(OUT_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(OUT_PATH, "utf8"));
      giriSconosciuto = Number(prev.giri_sconosciuto) || 0;
    } catch {
      giriSconosciuto = 0;
    }
  }
  giriSconosciuto = stato === "sconosciuto" ? giriSconosciuto + 1 : 0; // AR-039

  const note = [
    cassa.nota,
    burnEur == null ? "burn mensile non impostato (env BURN_MENSILE_EUR): runway non calcolabile" : `burn ${burnEur}€/mese`,
  ]
    .filter(Boolean)
    .join(" · ");

  const istruzioni =
    stato === "critico"
      ? "RUNWAY CRITICO: allerta finanza/Nicola. Priorità assoluta a incasso/riduzione burn."
      : stato === "sconosciuto"
        ? `Runway non calcolabile da ${giriSconosciuto} giri (AR-039): collega STRIPE_SECRET_KEY e imposta BURN_MENSILE_EUR nel .env del VPS.`
        : "Runway sotto controllo: rivedi al prossimo giro.";

  const doc = {
    _cosa_e:
      "💶 CASSA / RUNWAY — mesi di autonomia = cassa disponibile / burn mensile. Rischio esistenziale n.1 (AR-016). Lo scrive cervello/sensore-cassa.mjs; una sentinella allerta sotto soglia. Sola lettura verso Stripe.",
    data: quando,
    cassa_disponibile_eur: cassaEur,
    fonte_cassa: cassaEur != null ? "Stripe balance" : "non disponibile",
    burn_mensile_eur: burnEur,
    runway_mesi: runwayMesi,
    soglia_allerta_mesi: SOGLIA_ALLERTA_MESI,
    stato,
    giri_sconosciuto: giriSconosciuto, // AR-039: da quanti giri consecutivi la cassa è "sconosciuta"
    note,
    istruzioni,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(doc, null, 2) + "\n", "utf8");

  const sintesi =
    runwayMesi != null ? `runway ${runwayMesi} mesi (${stato})` : `runway sconosciuto da ${giriSconosciuto} giri (${note})`; // AR-039
  await stampSegnale(
    "cassa-runway",
    stato === "critico" ? "errore" : stato === "sconosciuto" ? "warn" : "ok",
    `${sintesi} · ${quando}`
  ).catch(() => {});

  if (JSON_MODE) {
    console.log(JSON.stringify(doc, null, 2));
  } else {
    console.log(`\n💶 SENSORE CASSA / RUNWAY — ${quando}\n`);
    console.log(`Cassa disponibile: ${cassaEur != null ? cassaEur + " €" : "— (non leggibile)"}`);
    console.log(`Burn mensile:      ${burnEur != null ? burnEur + " €" : "— (non impostato)"}`);
    console.log(`Runway:            ${runwayMesi != null ? runwayMesi + " mesi" : "— (sconosciuto)"}  [${stato}]`);
    console.log(`\n${istruzioni}`);
    console.log(`\nScritto: ${OUT_PATH}`);
  }

  process.exit(stato === "critico" ? 1 : 0);
}

main().catch(async (e) => {
  console.error("ERRORE sensore-cassa:", e.message || e);
  await stampSegnale("cassa-runway", "errore", `crash: ${(e.message || e).toString().slice(0, 200)}`).catch(() => {});
  process.exit(1);
});
