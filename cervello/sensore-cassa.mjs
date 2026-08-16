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
import { segnaleDa } from "./misura-o-cieco.mjs"; // una mappa esaustiva: chi non è nominato non prende il verde
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { scriviStatoSensore } from "./stato-sensori.mjs";
import { STATO_ALLARME, firmaCausa, verdettoAllarme } from "./presa-in-carico.mjs";

const JSON_MODE = process.argv.includes("--json");
const RETRIES = 3;
const RETRY_MS = 2000;
const SOGLIA_ALLERTA_MESI = 3;

const OUT_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cassa-runway.json");

// ═════════════════════════════════════════════════════════════
// 💶 AR-282 — LA CASSA NON È «IL SALDO CHE SO LEGGERE»
//
// Fino a oggi «cassa disponibile» voleva dire una cosa sola: i soldi fermi su Stripe. Non perché
// fosse la definizione giusta, ma perché era l'unica API già collegata — la DISPONIBILITÀ DEL DATO
// aveva deciso il KPI. Il numero sbagliava in tutte e due le direzioni: sottostima oggi (ignora i
// soldi in banca) e sovrastimerebbe domani (conta i soldi che sono dei negozi, non nostri).
//
// Il danno vero non è l'imprecisione: è che il PRIMO allarme rosso sul rischio numero uno sarebbe
// stato un falso allarme, e sarebbe arrivato proprio nel giorno in cui Nicola avesse finalmente
// collegato il burn. La lezione che avrebbe imparato: «quando collego un sensore, la macchina si
// mette a urlare». È il modo più rapido per far spegnere un sensore.
//
// La regola che ne esce, e che vale per ogni sensore di questa casa:
//   ⛔ UN SENSORE INCOMPLETO NON PUÒ EMETTERE UN ROSSO.
// Finché una componente della formula manca, lo stato è «parziale» — mai «critico» — e l'output
// dice sempre quali pezzi ci sono e quali no.
// ═════════════════════════════════════════════════════════════

/**
 * Le tre componenti della cassa disponibile, ciascuna con la sua fonte e il suo «manca».
 * PURA: le si passano i valori già letti, non li va a prendere.
 *
 * cassa disponibile = liquidità in banca (dichiarata da Nicola) + saldo Stripe AL NETTO dei payout
 * dovuti ai negozi. I soldi dei negozi transitano da noi: non sono nostri e non fanno runway.
 */
export function componentiCassa({ stripeEur = null, bancaEur = null, payoutDovutiEur = null } = {}) {
  const componenti = [
    { nome: "stripe", eur: num(stripeEur), incluso: num(stripeEur) !== null, perche: "saldo Stripe (available + pending)" },
    { nome: "banca", eur: num(bancaEur), incluso: num(bancaEur) !== null, perche: "liquidità aziendale, la dichiara Nicola (CASSA_BANCA_EUR)" },
    { nome: "payout_dovuti", eur: num(payoutDovutiEur), incluso: num(payoutDovutiEur) !== null, perche: "quanto dobbiamo ai negozi: si SOTTRAE, perché non sono soldi nostri" },
  ];
  const mancanti = componenti.filter((c) => !c.incluso).map((c) => c.nome);
  const completa = mancanti.length === 0;

  let totale = null;
  if (num(stripeEur) !== null || num(bancaEur) !== null) {
    totale = (num(stripeEur) ?? 0) + (num(bancaEur) ?? 0) - (num(payoutDovutiEur) ?? 0);
    totale = Math.round(totale * 100) / 100;
  }
  return { totale_eur: totale, componenti, mancanti, completa };
}

/**
 * Lo STATO della cassa. È qui, e non dentro `main`, perché un test lo deve poter eseguire: la
 * clausola «un sensore incompleto non emette un rosso» è la difesa, e una difesa che vive dentro
 * una funzione async che fa rete non la prova nessuno.
 */
export function statoCassa({ cassa, burnEur = null, soglia = SOGLIA_ALLERTA_MESI } = {}) {
  const burn = num(burnEur);
  const cassaEur = cassa?.totale_eur ?? null;
  const runway = cassaEur !== null && burn !== null && burn > 0 ? Math.round((cassaEur / burn) * 10) / 10 : null;

  if (runway === null) {
    return { stato: "sconosciuto", runway_mesi: null, motivo: `runway non calcolabile: manca ${cassaEur === null ? "la cassa" : "il burn mensile"}` };
  }
  if (!cassa.completa) {
    // ⛔ LA CLAUSOLA. Con una componente mancante il numero è per costruzione sbagliato: può
    // sembrare critico senza esserlo. Si dice «parziale» e si dichiara cosa manca.
    return {
      stato: "parziale",
      runway_mesi: runway,
      motivo: `runway ${runway} mesi calcolato SENZA ${cassa.mancanti.join(" e ")}: un sensore incompleto non può emettere un rosso, quindi non lo emette`,
    };
  }
  return {
    stato: runway < soglia ? "critico" : runway < 6 ? "attenzione" : "ok",
    runway_mesi: runway,
    motivo: `runway ${runway} mesi su tutte e tre le componenti (banca + Stripe − payout dovuti)`,
  };
}

function num(x) {
  if (x === null || x === undefined || String(x).trim() === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

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

  const stripe = await cassaStripe();

  // AR-282 — le tre componenti, ognuna con la sua fonte. Nessuna scrittura: sola lettura, sempre.
  const cassa = componentiCassa({
    stripeEur: stripe.eur,
    bancaEur: process.env.CASSA_BANCA_EUR,       // la dichiara Nicola: è l'unica fonte che ce l'ha
    payoutDovutiEur: process.env.PAYOUT_DOVUTI_EUR,
  });
  const cassaEur = cassa.totale_eur;

  const burnRaw = process.env.BURN_MENSILE_EUR?.trim();
  const burnEur = burnRaw && !Number.isNaN(Number(burnRaw)) ? Number(burnRaw) : null;

  const verdetto = statoCassa({ cassa, burnEur, soglia: SOGLIA_ALLERTA_MESI });
  const runwayMesi = verdetto.runway_mesi;
  const stato = verdetto.stato;

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

  // ── AR-285 — LA PRESA IN CARICO ────────────────────────────────────────────────────────────────
  // Questa sentinella suona da 256 giri sulla stessa identica cosa. Adesso c'è un modo dichiarato
  // di chiuderla — «lo so, ci penso, entro il …» — e un modo di riaprirla da sola quando quella
  // data passa. Si scrive con:
  //   node cervello/sensore-cassa.mjs --prendo-in-carico "chiedo il saldo in banca" --fino 2026-09-15
  const presaSalvata = presaInCaricoDaFile(OUT_PATH);
  const presa = presaInCaricoDaArgv() || presaSalvata;
  const allarme = verdettoAllarme({
    acceso: stato === "sconosciuto" || stato === "critico" || stato === "parziale",
    giriConsecutivi: giriSconosciuto,
    presaInCarico: presa,
    adessoMs: Date.now(),
    // AR-285 ④: la firma è la CAUSA, non il contatore. Con «cieco da 256 giri» dentro, la firma
    // cambiava a ogni giro e il dedup non agganciava mai — per questo la card si duplicava.
    firma: firmaCausa({ sensore: "cassa-runway", causa: `${stato}: mancano ${cassa.mancanti.join("+") || "niente"}${burnEur == null ? "+burn" : ""}` }),
  });

  const note = [
    stripe.nota,
    `componenti incluse: ${cassa.componenti.filter((c) => c.incluso).map((c) => c.nome).join(", ") || "nessuna"}`,
    cassa.mancanti.length ? `componenti MANCANTI: ${cassa.mancanti.join(", ")}` : null,
    burnEur == null ? "burn mensile non impostato (env BURN_MENSILE_EUR): runway non calcolabile" : `burn ${burnEur}€/mese`,
    allarme.stato === STATO_ALLARME.IN_CARICO ? `preso in carico: ${allarme.motivo}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const stripeOk = cassaEur != null;
  const burnOk = burnEur != null && burnEur > 0;
  const istruzioni =
    stato === "critico"
      ? "RUNWAY CRITICO: allerta finanza/Nicola. Priorità assoluta a incasso/riduzione burn."
      : stato === "sconosciuto"
        ? stripeOk && !burnOk
          ? `Runway non calcolabile da ${giriSconosciuto} giri (AR-039): Stripe ok (cassa ${cassaEur}€), manca solo BURN_MENSILE_EUR nel .env del VPS — Nicola deve indicare il burn mensile netto (€/mese).`
          : !stripeOk && burnOk
            ? `Runway non calcolabile da ${giriSconosciuto} giri (AR-039): collega STRIPE_SECRET_KEY nel .env del VPS (burn già impostato: ${burnEur}€/mese).`
            : `Runway non calcolabile da ${giriSconosciuto} giri (AR-039): collega STRIPE_SECRET_KEY e imposta BURN_MENSILE_EUR nel .env del VPS.`
        : "Runway sotto controllo: rivedi al prossimo giro.";

  const doc = {
    _cosa_e:
      "💶 CASSA / RUNWAY — mesi di autonomia = cassa disponibile / burn mensile. Rischio esistenziale n.1 (AR-016). Lo scrive cervello/sensore-cassa.mjs; una sentinella allerta sotto soglia. Sola lettura verso Stripe.",
    data: quando,
    cassa_disponibile_eur: cassaEur,
    // AR-282: la formula non è più «il saldo che so leggere». Chi legge questo file vede sempre
    // quali pezzi ci sono e quali mancano, senza doverli dedurre.
    formula: "cassa disponibile = banca (dichiarata da Nicola) + Stripe − payout dovuti ai negozi",
    componenti_cassa: cassa.componenti,
    componenti_mancanti: cassa.mancanti,
    misura_completa: cassa.completa,
    fonte_cassa: cassa.componenti.filter((c) => c.incluso).map((c) => c.nome).join(" + ") || "non disponibile",
    burn_mensile_eur: burnEur,
    runway_mesi: runwayMesi,
    soglia_allerta_mesi: SOGLIA_ALLERTA_MESI,
    stato,
    stato_perche: verdetto.motivo,
    giri_sconosciuto: giriSconosciuto, // AR-039: da quanti giri consecutivi la cassa è "sconosciuta"
    // AR-285: l'allarme adesso ha una via d'uscita dichiarata, e una scadenza che lo riapre.
    allarme: { stato: allarme.stato, suona: allarme.suona, priorita: allarme.priorita, giorni_in_attesa: allarme.giorni_in_attesa, giorni_alla_scadenza: allarme.giorni_alla_scadenza, firma: allarme.firma, motivo: allarme.motivo },
    presa_in_carico: presa || null,
    note,
    istruzioni,
  };

  // AR-281 — la cassa si scrive solo dove la si può MISURARE. Senza STRIPE_SECRET_KEY questo script
  // produce comunque un documento ("cassa sconosciuta"): scriverlo da una sessione cloud senza chiavi
  // significa spegnere in git il runway misurato sul VPS e far suonare una sentinella per finta.
  const esitoScrittura = scriviStatoSensore(OUT_PATH, doc, {
    ambienteConfigurato: Boolean(process.env.STRIPE_SECRET_KEY),
    motivo: "STRIPE_SECRET_KEY assente: questo ambiente non può misurare la cassa",
  });

  const sintesi =
    runwayMesi != null ? `runway ${runwayMesi} mesi (${stato})` : `runway sconosciuto da ${giriSconosciuto} giri (${note})`; // AR-039
  if (esitoScrittura.scritto) {
    await stampSegnale(
      "cassa-runway",
      // La catena di ternari mandava al Pannello «ok» per lo stato «attenzione» — cioè runway sotto
      // i sei mesi, il rischio numero uno di questa azienda, letto come tutto a posto. La mappa qui
      // sotto è esaustiva e chi non è nominato non prende il verde.
      // AR-285: un allarme PRESO IN CARICO, con una scadenza scritta, smette di squillare — ma non
      // diventa verde: resta «warn» silenziato, e alla scadenza torna da solo.
      allarme.stato === STATO_ALLARME.IN_CARICO
        ? "warn"
        : segnaleDa(stato, { critico: "errore", attenzione: "warn", sconosciuto: "warn", parziale: "warn", ok: "ok" }),
      `${sintesi} · ${quando}`
    ).catch(() => {});
  }

  if (JSON_MODE) {
    console.log(JSON.stringify(doc, null, 2));
  } else {
    console.log(`\n💶 SENSORE CASSA / RUNWAY — ${quando}\n`);
    console.log(`Cassa disponibile: ${cassaEur != null ? cassaEur + " €" : "— (non leggibile)"}`);
    console.log(`  formula:         ${doc.formula}`);
    for (const c of cassa.componenti) console.log(`   ${c.incluso ? "✅" : "⚪"} ${c.nome.padEnd(14)} ${c.incluso ? c.eur + " €" : "— manca"}  (${c.perche})`);
    console.log(`Burn mensile:      ${burnEur != null ? burnEur + " €" : "— (non impostato)"}`);
    console.log(`Runway:            ${runwayMesi != null ? runwayMesi + " mesi" : "— (sconosciuto)"}  [${stato}] — ${verdetto.motivo}`);
    console.log(`Allarme:           ${allarme.suona ? "🔔 suona" : "🤫 zitto"} [${allarme.stato}] — ${allarme.motivo}`);
    console.log(`\n${istruzioni}`);
    console.log(`\n${esitoScrittura.spiegazione}`);
  }

  // AR-282: «critico» adesso può nascere SOLO da una misura completa (vedi `statoCassa`), quindi
  // questo 1 non è più il falso allarme che aspettava il giorno in cui Nicola collega un sensore.
  process.exit(stato === "critico" ? 1 : 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-285 — dove vive la presa in carico, e come la si scrive
// ─────────────────────────────────────────────────────────────────────────────
// Sta dentro cassa-runway.json, il file che questo sensore possiede già: nessun registro nuovo da
// tenere allineato. `--fino` è OBBLIGATORIA — senza scadenza non è una presa in carico, è un
// interruttore, e `verdettoAllarme` la rifiuta.
function presaInCaricoDaArgv(argv = process.argv.slice(2)) {
  const i = argv.indexOf("--prendo-in-carico");
  if (i === -1) return null;
  const j = argv.indexOf("--fino");
  const fino = j !== -1 ? argv[j + 1] : "";
  return { da: nowPiacenza().slice(0, 10), motivo: argv[i + 1] || "", fino: fino || "" };
}

function presaInCaricoDaFile(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"))?.presa_in_carico || null;
  } catch (e) {
    // Un file illeggibile non è «nessuna presa in carico»: è un buco, e va detto ad alta voce.
    console.error(`⚠️  cassa-runway.json illeggibile (${e?.message || e}): la presa in carico salvata non l'ho potuta rileggere.`);
    return null;
  }
}

// Import-safe (AR-282/AR-285): un test deve poter importare `componentiCassa` e `statoCassa` senza
// far partire una lettura di rete e una scrittura nel vault. Prima `main()` girava al solo import.
if (import.meta.url === `file://${process.argv[1]}`) main().catch(async (e) => {
  console.error("ERRORE sensore-cassa:", e.message || e);
  await stampSegnale("cassa-runway", "errore", `crash: ${(e.message || e).toString().slice(0, 200)}`).catch(() => {});
  process.exit(1);
});
