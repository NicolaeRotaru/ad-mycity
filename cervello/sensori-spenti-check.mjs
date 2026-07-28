#!/usr/bin/env node
// 🔌 GUARDIANO DEI SENSORI SPENTI — AR-105 / AR-108.
//
// I sensori uptime del sito e della Cabina sono rimasti spenti **163 giri**. Non per una decisione:
// mancava una variabile d'ambiente, e nessuna card l'ha mai chiesta a Nicola. Il motivo per cui
// nessuno se n'è accorto è che il registro scriveva `non_configurato` — una parola che sembra uno
// stato normale, e che copre due situazioni opposte:
//
//   · Nicola ha deciso di non usarlo → sano, finale, non se ne parla più
//   · nessuno gliel'ha mai chiesto  → un buco che la macchina non sa di avere
//
// Questo guardiano pretende che ogni sensore spento dica QUALE delle due. Uno spento senza un perché
// dichiarato è un buco, e diventa una card — **una sola volta**: una card che si ripete a ogni giro
// è una card che si impara a ignorare.
//
// 🟢 Sola lettura. Con `--accoda` scrive UNA card nella coda dell'AD, mai nel mondo.
//
// Uso:
//   node cervello/sensori-spenti-check.mjs            -> rapporto
//   node cervello/sensori-spenti-check.mjs --json     -> JSON
//   node cervello/sensori-spenti-check.mjs --accoda   -> accoda la card per i sensori senza motivo
//
// Exit (AR-322): 0 = ogni spento ha il suo perché · 1 = c'è un buco · 2 = cieco (non ho potuto leggere)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MOTIVO, codiceUscita, motivoDi, quadroSpenti, serveNicola } from "./sensore-spento.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
const JSON_MODE = process.argv.includes("--json");
const ACCODA = process.argv.includes("--accoda");

// Puntabili altrove per il test: senza, l'unico modo di provare il rilevatore sarebbe spegnere un
// sensore vero — e una prova che guarda com'è il mondo adesso resta verde anche a fix rimosso.
const CECITA = process.env.SENSORI_CECITA_FILE || "MyCity-Vault/90-Memoria-AI/auto-coscienza/sensori-cecita.json";
const MOTIVI = process.env.SENSORI_MOTIVI_FILE || "cervello/sensori-motivi.json";
const CODA = process.env.SENSORI_CODA_FILE || "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md";

const via = (p) => (isAbsolute(p) ? p : join(REPO, p));

function leggi(p, dove) {
  if (!existsSync(via(p))) {
    console.error(`⚠️  GUARDIANO CIECO: manca ${p} — senza ${dove} non so cosa giudicare.`);
    process.exit(2);
  }
  try {
    return JSON.parse(readFileSync(via(p), "utf8"));
  } catch (e) {
    console.error(`⚠️  GUARDIANO CIECO: ${p} illeggibile (${e.message}).`);
    process.exit(2);
  }
}

function main() {
  const cecita = leggi(CECITA, "lo stato dei sensori");
  const registro = leggi(MOTIVI, "i motivi dichiarati").motivi || {};
  const sensori = cecita.sensori || {};
  const testoCoda = existsSync(via(CODA)) ? readFileSync(via(CODA), "utf8") : "";

  const quadro = quadroSpenti(sensori, registro);
  const buchi = [];
  for (const nome of [...quadro.inerzia, ...quadro["da-chiedere"]]) {
    const motivo = motivoDi(nome, registro);
    const card = registro[nome]?.card;
    // Una card «già chiesta» vale solo se esiste DAVVERO nella coda: altrimenti il registro
    // dichiarerebbe una domanda che nessuno vede, che è il silenzio di prima con un'etichetta sopra.
    const cardInCoda = Boolean(card && testoCoda.includes(card));
    const g = serveNicola({ stato: sensori[nome]?.stato, motivo, cardInCoda });
    if (g.serve) buchi.push({ sensore: nome, motivo, perche: g.perche });
    else if (motivo === MOTIVO.DA_CHIEDERE && !cardInCoda) {
      buchi.push({ sensore: nome, motivo, perche: `dichiarato «da-chiedere» ma la card ${card || "(nessuna)"} non è in coda: la domanda non esiste` });
    }
  }

  const rapporto = {
    ok: buchi.length === 0,
    quando: new Date().toISOString().slice(0, 16).replace("T", " "),
    fonte: `${CECITA} + ${MOTIVI}`,
    accesi: quadro.accesi,
    totale: quadro.totale,
    per_decisione: quadro.decisione,
    da_chiedere: quadro["da-chiedere"],
    per_inerzia: quadro.inerzia,
    guasti_non_di_qui: quadro.guasti,
    buchi,
  };

  if (ACCODA && buchi.length) rapporto.accodata = accoda(testoCoda, buchi);

  const rc = codiceUscita({ senzaMotivo: rapporto.accodata ? 0 : buchi.length });

  if (JSON_MODE) {
    console.log(JSON.stringify(rapporto, null, 2));
    process.exit(rc);
  }

  console.log(`🔌 Sensori spenti — ${rapporto.quando}`);
  console.log(`   ${quadro.accesi}/${quadro.totale} accesi\n`);
  if (quadro.decisione.length) console.log(`   ✅ spenti per SCELTA di Nicola: ${quadro.decisione.join(", ")}`);
  if (quadro["da-chiedere"].length) console.log(`   ⏳ glielo stiamo chiedendo: ${quadro["da-chiedere"].join(", ")}`);
  if (quadro.guasti.length) console.log(`   🔴 ciechi (guasto, non configurazione — li vede la sentinella cecità): ${quadro.guasti.join(", ")}`);
  if (buchi.length) {
    console.log(`\n   🕳️  ${buchi.length} spenti senza un perché dichiarato:`);
    for (const b of buchi) console.log(`      · ${b.sensore} — ${b.perche}`);
    console.log(`\n   Dichiarali in ${MOTIVI}, oppure: node cervello/sensori-spenti-check.mjs --accoda`);
  } else {
    console.log("\n   ✅ Ogni sensore spento dice PERCHÉ lo è.");
  }
  process.exit(rc);
}

/**
 * AR-108 ② — UNA card, una volta sola. Se c'è già, non se ne accoda un'altra: una domanda ripetuta a
 * ogni giro è una domanda che si impara a saltare, ed è così che i due uptime sono rimasti spenti
 * mezzo anno pur essendo «segnalati».
 */
function accoda(testoCoda, buchi) {
  const marca = "<!-- sensori-spenti-senza-motivo -->";
  if (testoCoda.includes(marca)) return [];
  const elenco = buchi.map((b) => `\`${b.sensore}\``).join(", ");
  const card = [
    "",
    marca,
    "",
    `### 🟡 #sensori-spenti-senza-motivo — Dimmi se questi occhi della macchina li vuoi accesi o no`,
    "",
    `**Cosa cambia:** ci sono strumenti già costruiti che non stanno guardando niente: ${elenco}. Non sono rotti — non sono mai stati accesi, e non risulta che tu abbia deciso di lasciarli spenti: semplicemente nessuno te l'ha chiesto. È già successo: i controlli che dicono se il sito e il Pannello sono in piedi sono rimasti spenti per 163 giri di fila, e nessuna card te l'ha mai detto.`,
    "",
    `**Se va bene:** mi dici per ognuno «acceso» o «lasciamolo spento». Se dici spento lo scrivo come una tua decisione e non te lo richiedo mai più. Se dici acceso ti dico l'unica riga che serve per farlo partire.`,
    "",
    "**Nota tecnica:** difetti AR-105 e AR-108. I motivi vivono in `cervello/sensori-motivi.json` e il guardiano `sensori-spenti-check.mjs` resta rosso finché uno spento non dice perché. Questa card non si ripete: se c'è già, non se ne accoda un'altra.",
    "- **Colore:** 🟡 (accende un controllo in sola lettura, non manda niente a nessuno)",
    "- **Reparto:** devops-sre",
    "- **Origine:** `{origine:auto-radiografia, difetti:AR-105+AR-108}`",
    "",
    "---",
    "",
  ].join("\n");
  const punto = testoCoda.indexOf("\n### ");
  const nuovo = punto < 0 ? `${testoCoda}\n${card}` : `${testoCoda.slice(0, punto)}\n${card}${testoCoda.slice(punto)}`;
  writeFileSync(via(CODA), nuovo);
  return buchi.map((b) => b.sensore);
}

main();
