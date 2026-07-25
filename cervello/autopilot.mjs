// autopilot.mjs — SCHEDULER della "Marketing Autopilot" di MyCity.
//
// COSA FA:
//   (a) legge il calendario editoriale (cervello/calendario-editoriale.json);
//   (b) trova i contenuti "in scadenza" (data <= oggi e stato "programmato");
//   (c) per ognuno sceglie il publisher del canale e PREPARA l'azione di pubblicazione;
//   (d) la esegue (DRY-RUN di default), la LOGGA in creativi/output/autopilot-log.jsonl
//       e ACCODA le azioni 🔴 (es. email a clienti) in AZIONI-IN-ATTESA.md.
//
// SICUREZZA / IL CANCELLO 🟢🟡🔴 (vedi CLAUDE.md):
//   - DRY-RUN di default: niente parte. Per pubblicare DAVVERO serve AUTOPILOT_LIVE=1 + le chiavi del canale.
//   - il colore che decide NON e' quello auto-dichiarato nella voce (AR-109), ma il PEGGIORE fra
//     quello dichiarato e il colore MINIMO del canale, che il publisher deriva dal mondo reale:
//       🟢 verde  -> puo' partire da solo (chat dell'owner, email al solo EMAIL_TEST_TO);
//       🟡 giallo -> contenuto pubblico (Facebook/Instagram/Google): ACCODATO per la firma;
//       🔴 rosso  -> clienti reali/soldi, o canale sconosciuto: ACCODATO per la firma di Nicola.
//     Una voce non puo' abbassarsi il colore da sola: puo' solo peggiorarlo.
//   - anche il verde passa dal cancello di consenso (AR-103): PAUSA dal Pannello (fail-closed) +
//     destinatario in cervello/mani-allowlist.json. Se nega, l'invio degrada a DRY-RUN col motivo.
//   In dry-run TUTTO viene solo simulato e loggato, qualunque sia il colore.
//
// USO:
//   node cervello/autopilot.mjs                 -> stato + anteprima delle voci in scadenza (dry-run)
//   node cervello/autopilot.mjs giro            -> processa le voci in scadenza (dry-run salvo AUTOPILOT_LIVE=1)
//   node cervello/autopilot.mjs giro --tutto    -> processa TUTTE le voci programmate (ignora la data)
//   AUTOPILOT_LIVE=1 node cervello/autopilot.mjs giro   -> pubblica davvero le voci 🟢/🟡 con chiavi pronte
//
// Lo scheduler NON tocca mai mycity-live: agisce solo su canali esterni via i publisher.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { publisherPer, coloreMinimoPer, destinatarioPer, CANALI_DISPONIBILI } from "./publishers/index.mjs";
import { pausaAttiva, destinatarioAmmesso, consensoInvio } from "./consenso-azione.mjs";

const LIVE = process.env.AUTOPILOT_LIVE === "1";
const QUI = dirname(fileURLToPath(import.meta.url));
const ROOT = join(QUI, "..");
// I percorsi reali. Gli override AUTOPILOT_* esistono per UNA ragione: poter provare il cancello
// del semaforo end-to-end senza scrivere nel calendario e nella coda veri (cervello/test/
// autopilot-colore.test.mjs). Un freno che non si può provare è esattamente come sono nati AR-109
// e AR-074: scritti come commento, mai verificati. In produzione nessuno li imposta.
const CALENDARIO = process.env.AUTOPILOT_CALENDARIO || join(QUI, "calendario-editoriale.json");
const LOG_DIR = process.env.AUTOPILOT_LOG_DIR || join(ROOT, "creativi", "output");
const LOG_FILE = join(LOG_DIR, "autopilot-log.jsonl");
const CODA = process.env.AUTOPILOT_CODA || join(ROOT, "MyCity-Vault", "90-Memoria-AI", "AZIONI-IN-ATTESA.md");

const oggiISO = () => new Date().toISOString().slice(0, 10);

// ─────────────────────────────────────────────────────────────────────────────
// AR-109/AR-074 — IL COLORE NON SE LO DÀ PIÙ LA VOCE DA SOLA.
//
// Prima il cancello LIVE guardava solo `voce.colore`, un campo scritto dentro
// calendario-editoriale.json: chiunque (o l'AI stessa, generando il calendario) poteva marcare
// "verde" un'email a un cliente reale e vederla partire da sola. Il colore auto-dichiarato è una
// promessa, non un fatto verificabile.
// Ora il colore che conta è il PEGGIORE fra due: quello dichiarato dalla voce e quello MINIMO del
// canale, che il publisher deriva dal mondo reale (email a un indirizzo ≠ EMAIL_TEST_TO = 🔴,
// post pubblico = 🟡, chat dell'owner = 🟢). Alzare non si può auto-dichiarare via: si può solo
// peggiorare, mai migliorare. Un canale senza colore minimo dichiarato vale 🔴.

const SCALA = { "🟢": 0, "🟡": 1, "🔴": 2 };
const PAROLA_A_EMOJI = { verde: "🟢", giallo: "🟡", rosso: "🔴" };
const EMOJI_A_PAROLA = { "🟢": "verde", "🟡": "giallo", "🔴": "rosso" };

// Normalizza il colore di una voce ("verde" | "🟢" | "  Verde ") → emoji.
// Mancante o scritto male → 🔴: un colore che non si capisce non è un permesso (fail-closed, AR-073).
export function normalizzaColore(c) {
  const s = String(c ?? "").trim().toLowerCase();
  if (SCALA[s] !== undefined) return s;
  return PAROLA_A_EMOJI[s] || "🔴";
}

// Il peggiore (= più restrittivo) fra due colori.
export function coloreMax(a, b) {
  const na = normalizzaColore(a);
  const nb = normalizzaColore(b);
  return SCALA[na] >= SCALA[nb] ? na : nb;
}

// Colore EFFETTIVO di una voce = max(colore minimo del canale, colore dichiarato).
export function coloreEffettivo(voce = {}) {
  return coloreMax(coloreMinimoPer(voce.canale, voce), voce.colore);
}

// Cancello di invio prima di un LIVE reale (AR-109 + AR-103).
// Anche una voce 🟢 non parte "al buio": la PAUSA dal Pannello vale anche qui (fail-closed) e il
// destinatario deve stare nella allowlist. Se la voce cita una casella firmata in coda
// (campo `azioneId`), si passa dal cancello pieno di consenso-azione.mjs, lo stesso che usa
// esegui-azione.mjs. Ritorna { live, motivo }.
async function cancelloInvio(voce) {
  const dest = destinatarioPer(voce.canale, voce);

  // 1) PAUSA (kill-switch dal Pannello) — fail-closed, vale per ogni canale.
  const p = await pausaAttiva();
  if (p.bloccante) return { live: false, motivo: p.motivo };

  // 2) Voce agganciata a una casella firmata → cancello pieno AR-103 (firma + allowlist).
  if (voce.azioneId) {
    return consensoInvio({ azioneId: voce.azioneId, canale: voce.canale, destinatario: dest });
  }

  // 3) Nessuna casella firmata: può passare solo il verde-per-canale, e solo verso un
  //    destinatario esplicitamente sbloccato in mani-allowlist.json.
  const a = destinatarioAmmesso(voce.canale, dest);
  if (!a.ok) return { live: false, motivo: a.motivo };
  return { live: true, motivo: `consenso OK (canale 🟢, destinatario "${dest}" sbloccato, pausa off)` };
}

function caricaCalendario() {
  try {
    const dati = JSON.parse(readFileSync(CALENDARIO, "utf8"));
    return Array.isArray(dati.voci) ? dati.voci : [];
  } catch (e) {
    console.error(`Impossibile leggere il calendario (${CALENDARIO}): ${e.message}`);
    return [];
  }
}

// Una voce e' "in scadenza" se programmata e con data <= oggi.
function inScadenza(voce, tutto) {
  if (voce.stato !== "programmato") return false;
  if (tutto) return true;
  return voce.data <= oggiISO();
}

function logga(record) {
  mkdirSync(LOG_DIR, { recursive: true });
  appendFileSync(LOG_FILE, JSON.stringify({ ts: new Date().toISOString(), ...record }) + "\n");
}

// Accoda in AZIONI-IN-ATTESA.md un'azione 🔴 pronta per la firma di Nicola.
function accoda(voce) {
  const blocco =
    `\n## [AUTOPILOT] 🔴 Pubblicare "${voce.titolo || voce.id}" su ${voce.canale} (${voce.data})\n` +
    `- **Canale:** ${voce.canale}\n` +
    `- **Testo:** ${voce.testo}\n` +
    (voce.subject ? `- **Oggetto:** ${voce.subject}\n` : "") +
    (voce.mediaRef ? `- **Media:** ${voce.mediaRef}\n` : "") +
    `- **UTM:** ${JSON.stringify(voce.utm || {})}\n` +
    `- **Perche' 🔴:** tocca clienti reali / canale a rischio consenso → serve firma di Nicola.\n` +
    `- **Come far partire:** \`AUTOPILOT_LIVE=1 node cervello/autopilot.mjs giro --tutto\` (con le chiavi del canale) oppure approva qui.\n`;
  try {
    if (!existsSync(CODA)) {
      mkdirSync(dirname(CODA), { recursive: true });
      writeFileSync(CODA, "# ⏳ AZIONI IN ATTESA (firma di Nicola)\n");
    }
    appendFileSync(CODA, blocco);
    return true;
  } catch (e) {
    console.warn(`(nota) non ho potuto scrivere in AZIONI-IN-ATTESA.md: ${e.message}`);
    return false;
  }
}

function stato() {
  const voci = caricaCalendario();
  const scad = voci.filter((v) => inScadenza(v, false));
  console.log("🛰️  Marketing Autopilot — stato");
  console.log(`  modalita':         ${LIVE ? "LIVE (pubblica davvero le 🟢/🟡 con chiavi)" : "DRY-RUN (non pubblica nulla)"}`);
  console.log(`  canali disponibili: ${CANALI_DISPONIBILI.join(", ")}`);
  console.log(`  voci nel calendario: ${voci.length} · in scadenza oggi (${oggiISO()}): ${scad.length}`);
  if (scad.length) {
    console.log("\n  In scadenza:");
    for (const v of scad) {
      // Si mostra il colore EFFETTIVO (quello che decide davvero), e se il canale ha alzato
      // l'asticella lo si dice: è l'informazione che prima non compariva da nessuna parte.
      const eff = coloreEffettivo(v);
      const dich = normalizzaColore(v.colore);
      const alzato = SCALA[eff] > SCALA[dich] ? ` ⬆ alzato dal canale (si dichiarava ${dich})` : "";
      console.log(`   - [${eff} ${EMOJI_A_PAROLA[eff]}] ${v.data} ${v.canale}: ${v.titolo || v.id}${alzato}`);
    }
  }
  console.log("\n  Per processarle:  node cervello/autopilot.mjs giro");
  console.log("  Per l'invio reale: collega le chiavi (cervello/collega-le-mani.md) + AUTOPILOT_LIVE=1");
}

async function giro(tutto) {
  const voci = caricaCalendario();
  const daFare = voci.filter((v) => inScadenza(v, tutto));
  if (!daFare.length) {
    console.log(`Nessuna voce in scadenza (oggi ${oggiISO()}). Tutto a posto.`);
    return;
  }
  console.log(`🛰️  Autopilot: ${daFare.length} voci da processare — ${LIVE ? "LIVE" : "DRY-RUN"}\n`);

  let pubblicate = 0, accodate = 0, saltate = 0, bloccate = 0;
  for (const voce of daFare) {
    const pub = publisherPer(voce.canale);
    if (!pub) {
      console.log(`⚠️  Canale sconosciuto "${voce.canale}" per ${voce.id} — salto. (disponibili: ${CANALI_DISPONIBILI.join(", ")})`);
      saltate++; continue;
    }

    // CANCELLO SEMAFORO — FAIL-CLOSED (AR-072/AR-073/AR-109): in LIVE parte da solo SOLO il verde,
    // e il verde deve reggere anche dal lato del CANALE, non solo dichiararsi tale nel file-dati.
    // Giallo, rosso, colore mancante o scritto male → si accoda per la firma di Nicola. Mai sorprese.
    const minimo = coloreMinimoPer(voce.canale, voce);
    const effettivo = coloreEffettivo(voce);
    if (LIVE && effettivo !== "🟢") {
      const dichiarato = normalizzaColore(voce.colore);
      // Se il canale ha alzato il colore, dillo: è l'informazione che prima mancava del tutto.
      const perche = SCALA[minimo] > SCALA[dichiarato]
        ? `il canale "${voce.canale}" vale almeno ${minimo} (la voce si dichiarava ${dichiarato})`
        : `colore ${dichiarato}`;
      const ok = accoda(voce);
      console.log(`🚦 ${voce.id} (${voce.canale}) → ${EMOJI_A_PAROLA[effettivo]} ${effettivo}: ${perche} → ACCODATO per firma di Nicola${ok ? "" : " (coda non scrivibile)"}.`);
      logga({ id: voce.id, canale: voce.canale, colore: voce.colore, colore_minimo: minimo, colore_effettivo: effettivo, esito: "accodato-non-verde" });
      accodate++; continue;
    }

    // AR-109 + AR-103: anche il verde non parte "al buio". PAUSA (fail-closed) + destinatario in
    // allowlist — e cancello pieno di consenso se la voce cita una casella firmata. Se nega,
    // l'invio degrada a DRY-RUN col motivo stampato: nulla parte in silenzio.
    let modo = LIVE;
    if (LIVE) {
      const g = await cancelloInvio(voce);
      if (!g.live) {
        modo = false;
        bloccate++;
        console.log(`🔒 ${voce.id} (${voce.canale}) LIVE bloccato → DRY-RUN: ${g.motivo}`);
        logga({ id: voce.id, canale: voce.canale, colore_effettivo: effettivo, esito: "bloccato-consenso", motivo: g.motivo });
      }
    }

    // Esegue il publisher (in dry-run stampa solo cosa farebbe).
    const r = await pub(voce, { live: modo, log: console.log });
    logga({ id: voce.id, canale: voce.canale, colore: voce.colore, colore_effettivo: effettivo, live: modo, ...r });

    // `modo`, non LIVE: se il cancello ha degradato a DRY-RUN, la voce NON è stata pubblicata e
    // non va marcata come tale (altrimenti sparirebbe dal calendario senza essere mai uscita).
    if (modo && r.stato === "inviato") {
      pubblicate++;
      // In LIVE marca la voce come pubblicata (riscrive il calendario).
      voce.stato = "pubblicato";
      voce.pubblicatoIl = new Date().toISOString();
    }
  }

  // Se in LIVE abbiamo pubblicato qualcosa, persistiamo lo stato aggiornato del calendario.
  if (LIVE && pubblicate) {
    const dati = JSON.parse(readFileSync(CALENDARIO, "utf8"));
    for (const v of dati.voci) {
      const agg = daFare.find((x) => x.id === v.id && x.stato === "pubblicato");
      if (agg) { v.stato = "pubblicato"; v.pubblicatoIl = agg.pubblicatoIl; }
    }
    writeFileSync(CALENDARIO, JSON.stringify(dati, null, 2));
  }

  console.log(`\n✅ Fatto. ${LIVE ? `pubblicate: ${pubblicate} · bloccate dal consenso: ${bloccate} · ` : ""}accodate(🔴): ${accodate} · saltate: ${saltate}`);
  console.log(`   log: creativi/output/autopilot-log.jsonl${!LIVE ? "  (DRY-RUN: niente e' partito davvero)" : ""}`);
}

// Il CLI parte solo se questo file è LANCIATO, non quando lo importa un test (che deve poter
// leggere normalizzaColore/coloreMax/coloreEffettivo senza far girare lo scheduler).
if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, flag] = process.argv.slice(2);
  if (!cmd) stato();
  else if (cmd === "giro") await giro(flag === "--tutto");
  else { console.log("Comando sconosciuto. Uso: (niente)=stato | giro [--tutto]"); }
}
