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
//   - colore della voce decide il comportamento anche in LIVE:
//       🟢 verde  -> puo' partire da solo (canale interno / a te stesso);
//       🟡 giallo -> parte in LIVE ma e' un contenuto pubblico: "fai e avvisa";
//       🔴 rosso  -> NON parte mai in automatico (clienti reali/soldi): viene ACCODATO per la firma di Nicola.
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
import { publisherPer, CANALI_DISPONIBILI } from "./publishers/index.mjs";
import { verificaEsecuzione } from "./guardrail-semaforo.mjs";

const LIVE = process.env.AUTOPILOT_LIVE === "1";
const QUI = dirname(fileURLToPath(import.meta.url));
const ROOT = join(QUI, "..");
const CALENDARIO = join(QUI, "calendario-editoriale.json");
const LOG_DIR = join(ROOT, "creativi", "output");
const LOG_FILE = join(LOG_DIR, "autopilot-log.jsonl");
const CODA = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "AZIONI-IN-ATTESA.md");

const oggiISO = () => new Date().toISOString().slice(0, 10);

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
    for (const v of scad) console.log(`   - [${v.colore}] ${v.data} ${v.canale}: ${v.titolo || v.id}`);
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

  let pubblicate = 0, accodate = 0, saltate = 0;
  for (const voce of daFare) {
    const pub = publisherPer(voce.canale);
    if (!pub) {
      console.log(`⚠️  Canale sconosciuto "${voce.canale}" per ${voce.id} — salto. (disponibili: ${CANALI_DISPONIBILI.join(", ")})`);
      saltate++; continue;
    }

    // CANCELLO 🔴: in LIVE le voci rosse non partono mai da sole → si accodano per la firma.
    if (LIVE && voce.colore === "rosso") {
      const ok = accoda(voce);
      console.log(`🔴 ${voce.id} (${voce.canale}) ACCODATO per firma di Nicola${ok ? "" : " (coda non scrivibile)"}.`);
      logga({ id: voce.id, canale: voce.canale, esito: "accodato-rosso" });
      accodate++; continue;
    }

    const gate = verificaEsecuzione({
      live: LIVE,
      livello: voce.colore,
      automatico: true,
      canale: voce.canale,
      testo: voce.testo,
      titolo: voce.titolo,
    });
    if (LIVE && !gate.ok) {
      console.log(`🛑 ${voce.id} (${voce.canale}) BLOCCATO dal guardrail: ${gate.motivo}`);
      logga({ id: voce.id, canale: voce.canale, esito: "bloccato-guardrail", codice: gate.codice });
      saltate++; continue;
    }

    // Esegue il publisher (in dry-run stampa solo cosa farebbe).
    const r = await pub(voce, { live: LIVE, log: console.log });
    logga({ id: voce.id, canale: voce.canale, colore: voce.colore, live: LIVE, ...r });

    if (LIVE && r.stato === "inviato") {
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

  console.log(`\n✅ Fatto. ${LIVE ? `pubblicate: ${pubblicate} · ` : ""}accodate(🔴): ${accodate} · saltate: ${saltate}`);
  console.log(`   log: creativi/output/autopilot-log.jsonl${!LIVE ? "  (DRY-RUN: niente e' partito davvero)" : ""}`);
}

const [cmd, flag] = process.argv.slice(2);
if (!cmd) stato();
else if (cmd === "giro") await giro(flag === "--tutto");
else { console.log("Comando sconosciuto. Uso: (niente)=stato | giro [--tutto]"); }
