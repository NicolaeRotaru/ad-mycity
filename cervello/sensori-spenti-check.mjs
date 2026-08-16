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
import { fileURLToPath, pathToFileURL } from "node:url";
import { MOTIVO, codiceUscita, laCardChiedeDi, motivoDi, quadroSpenti, serveNicola } from "./sensore-spento.mjs";
import { prossimoNumero } from "./pausa-coda.mjs";
import { timbroOra } from "./ora-piacenza.mjs";
// AR-568 — anche una CARD è memoria: la coda delle approvazioni è il file che Nicola legge nel
// Pannello. La penna passa dal writer condiviso, così una prova che esercita `--accoda` non gli
// infila una domanda vera nella coda vera.
import { scriviTestoAtomico } from "./scrivi-json.mjs";

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
    // Una card «già chiesta» vale solo se esiste DAVVERO nella coda E se in quella card il nome
    // del sensore c'è scritto: altrimenti il registro dichiarerebbe una domanda che nessuno vede,
    // che è il silenzio di prima con un'etichetta sopra. Il registro scrive «#slug»; dal 13/8 lo
    // slug vive nell'ancora `<!-- slug -->` (il titolo porta il numero).
    const cardInCoda = laCardChiedeDi(testoCoda, card, nome);
    const g = serveNicola({ stato: sensori[nome]?.stato, motivo, cardInCoda });
    if (g.serve) buchi.push({ sensore: nome, motivo, perche: g.perche });
    else if (motivo === MOTIVO.DA_CHIEDERE && !cardInCoda) {
      buchi.push({ sensore: nome, motivo, perche: `dichiarato «da-chiedere» ma la card ${card || "(nessuna)"} non chiede di ${nome}: la domanda non esiste` });
    }
  }

  const rapporto = {
    ok: buchi.length === 0,
    quando: timbroOra(),
    fonte: `${CECITA} + ${MOTIVI}`,
    accesi: quadro.accesi,
    totale: quadro.totale,
    per_decisione: quadro.decisione,
    da_chiedere: quadro["da-chiedere"],
    per_inerzia: quadro.inerzia,
    guasti_non_di_qui: quadro.guasti,
    buchi,
  };

  // La card deve nominare TUTTI quelli che aspettano una risposta, non solo i buchi di oggi:
  // rinfrescarla coi soli buchi cancellerebbe dalla domanda chi era già in attesa, e al giro dopo
  // quello tornerebbe buco perché la card non lo nomina più. Un'altalena, non un guardiano.
  const inAttesa = [...quadro.inerzia, ...quadro["da-chiedere"]];
  if (ACCODA && buchi.length) rapporto.accodata = accoda(testoCoda, buchi, inAttesa);

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
 *
 * Ma «una sola» non vuol dire «ferma». Il 16/8 la card c'era dal 10/8 e chiedeva di `telegram_bot`;
 * intanto si era spento anche `mcp_supabase`, e qui si usciva subito con `[]`: il guardiano restava
 * rosso per sempre e a Nicola quella seconda domanda non arrivava mai. Una card sola che dice metà
 * verità è peggio di una card in più. Quindi: se c'è già e l'elenco è cambiato, si **riscrive
 * l'elenco dentro la stessa card** — stesso numero, stessa posizione, timbro `🔄 refresh`.
 */
function accoda(testoCoda, buchi, inAttesa = buchi.map((b) => b.sensore)) {
  const marca = "<!-- sensori-spenti-senza-motivo -->";
  const elenco = [...new Set(inAttesa)].sort().map((s) => `\`${s}\``).join(", ");
  if (testoCoda.includes(marca)) return rinfresca(testoCoda, marca, buchi, elenco);
  const adesso = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 16);
  const card = [
    "",
    marca,
    "",
    `### 🟡 #${prossimoNumero(testoCoda)} — Dimmi se questi occhi della macchina li vuoi accesi o no · ⏳ accodata ${adesso}`,
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
  scriviTestoAtomico(via(CODA), nuovo);
  return buchi.map((b) => b.sensore);
}

/**
 * La card c'è già: le si rimette dentro l'elenco vero, senza spostarla e senza cambiarle numero.
 * Se l'elenco è identico non si scrive niente — un file riscritto uguale è rumore nel diff, e a
 * ogni giro farebbe sembrare successo qualcosa che non è successo.
 */
function rinfresca(testoCoda, marca, buchi, elenco) {
  const dove = testoCoda.indexOf(marca);
  const resto = testoCoda.slice(dove);
  const taglio = resto.slice(marca.length).search(/\n<!-- [a-z0-9-]+ -->/);
  const fine = taglio < 0 ? testoCoda.length : dove + marca.length + taglio;
  const blocco = testoCoda.slice(dove, fine);

  let nuovoBlocco = blocco.replace(
    /(non stanno guardando niente: )([^.]*)(\.)/,
    (_t, a, _vecchio, z) => `${a}${elenco}${z}`,
  );
  if (nuovoBlocco === blocco) return []; // la frase non c'è più: non indovino dove scrivere

  const adesso = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 16);
  nuovoBlocco = nuovoBlocco.replace(/^(### .*?)(?: · 🔄 refresh [\d -:]+)?$/m, `$1 · 🔄 refresh ${adesso}`);

  const senzaTimbro = (t) => t.replace(/ · 🔄 refresh [\d -:]+/g, "");
  if (senzaTimbro(nuovoBlocco) === senzaTimbro(blocco)) return []; // stessi sensori: niente da dire

  scriviTestoAtomico(via(CODA), testoCoda.slice(0, dove) + nuovoBlocco + testoCoda.slice(fine));
  return buchi.map((b) => b.sensore);
}

// Un modulo che parte da solo quando lo importi non si può interrogare: chi volesse provare
// `rinfresca` o `accoda` senza far girare tutto il guardiano si ritroverebbe il programma addosso,
// e in una prova anche una scrittura. Il file girava così da prima; toccandolo, il tetto non lo
// assolve più.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
