#!/usr/bin/env node
// 🔧 APPLICA IL ROUND 5 (2026-07-25) — AR-123, l'ultimo bloccante. Idempotente.
//
// Perché uno script e non un diff: cantiere-difetti.json pesa 141 KB e non passa dall'API GitHub,
// che è l'unico canale di pubblicazione della sessione cloud. Stessa ragione dei round 2 e 4.
//
// COSA FA
//
// ① AR-123 (il Pannello cancella la chat aperta) → prova AUTOMATICA al posto di «verifica umana».
//    Il difetto è stato RIPRODOTTO nel browser vero prima di toccare una riga:
//      chat del Worker con 2 messaggi → click su «💬 Parla con questa casella» → riapro → vuota.
//    Causa: aprire una casella mai usata pubblica sull'evento della chat unificata un thread
//    VUOTO (msgs=[] e convId=null), e chi ascolta — l'Assistente — si allinea, cioè si svuota.
//    Fix: `nienteDaDire()` in pannello/src/lib/chat-unificata.ts rifiuta di pubblicare un thread
//    senza id e senza messaggi. Dopo il fix, stesso driver: "OK — la chat resta".
//    La prova qui è il pattern su quel file: punta all'ARTEFATTO CHE FA la cosa, non alla prosa
//    (l'errore di AR-008), ed è coperta da un test che senza il fix FALLISCE — controprova
//    eseguita, non promessa. Il driver del browser resta nel repo:
//    cervello/test/ar123-parla-casella.mjs
//
// ② AR-156 (nuovo) — i test del Pannello non li lanciava nessuno, e uno non parte nemmeno.
//    Trovato mentre agganciavo il test di AR-123 al verificatore: `pannello/src/lib/*.test.mts`
//    esisteva da settimane senza uno script che li eseguisse. Peggio: `lavori-gruppo.annulla.test.mts`
//    è INESEGUIBILE (import senza estensione), e sbloccandolo 2 asserzioni falliscono davvero.
//    Non l'ho sistemato di straforo dentro un lavoro su AR-123: è un difetto suo.
//
// Uso:
//   node cervello/round5-applica.mjs --dry   -> dice cosa farebbe, non tocca nulla
//   node cervello/round5-applica.mjs         -> applica e ristampa lo stato

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");

const PROVA_AR123 = {
  file: "pannello/src/lib/chat-unificata.ts",
  pattern: "function nienteDaDire",
  presente: true,
};

const NOTA_AR123 =
  "Round 5 (25/7 ~05:30). RIPRODOTTO nel browser prima del fix (Chromium su Pannello locale, driver " +
  "cervello/test/ar123-parla-casella.mjs): chat del Worker con 2 messaggi → click su «Parla con questa " +
  "casella» → riapro il Worker → 0 messaggi. Causa-radice: aprire una casella MAI usata pubblica " +
  "sull'evento della chat unificata un thread vuoto (msgs=[] e convId=null) e l'Assistente si allinea, " +
  "cioè si svuota; ParlaCasella aveva già il guardo sul percorso di CHIUSURA e non su quello di " +
  "APERTURA — la disparità era il bug. Fix: nienteDaDire() in pannello/src/lib/chat-unificata.ts " +
  "rifiuta di pubblicare un thread senza id e senza messaggi (il rifiuto sta nel protocollo, non nel " +
  "componente, così nessuna superficie futura rifà l'errore). Dopo il fix, stesso driver: «OK — la chat " +
  "resta» (2 messaggi → 2). Rete anti-ritorno: pannello/src/lib/chat-unificata.test.mts, che SENZA il " +
  "fix fallisce (controprova eseguita disattivando il guardo).";

const AR156 = {
  id: "AR-156",
  titolo: "I test del Pannello non li lanciava nessuno, e uno non parte nemmeno",
  dimensione: "verifica-che-non-verifica",
  gravita: "grave",
  impatto_crescita: "medio",
  causa_radice:
    "pannello/src/lib/*.test.mts esisteva da settimane senza nessuno script o CI che li eseguisse: " +
    "un test che non gira non è una rete, è un file. Sotto ci si è nascosto un secondo difetto: " +
    "lavori-gruppo.annulla.test.mts è INESEGUIBILE perché lavori-gruppo.ts importa " +
    "'./chat-thread-merge' senza estensione (il bundler la indovina, Node ESM no); aggiungendo '.ts' " +
    "il test parte ma rompe tsc (serve allowImportingTsExtensions) e allora 2 asserzioni falliscono " +
    "per davvero: messaggiDaLavoro() su un lavoro ANNULLATO chiude con un messaggio 'user' invece " +
    "del '🚫 Messaggio annullato.' dell'assistente.",
  fix_proposto:
    "🟡 Due passi separati: (a) decidere come rendere eseguibile lavori-gruppo.annulla.test.mts " +
    "(allowImportingTsExtensions nel tsconfig + build Next verificata, oppure spostare la funzione " +
    "condivisa); (b) capire se le 2 asserzioni rosse sono una regressione dell'annullo o un test che " +
    "fotografa un comportamento vecchio — e sistemare quella giusta delle due.",
  colore: "🟡",
  stato: "aperto",
  nato: "2026-07-25 05:30",
  origine: "round 5 — emerso agganciando i test del Pannello a round3-verifica.mjs",
  verifica: { comando: "node cervello/test-pannello.mjs" },
  nota:
    "La prova è il GUARDIANO cervello/test-pannello.mjs: scopre i test dalla cartella (un elenco si " +
    "dimentica di aggiornare) e esce 0 solo se girano TUTTI e passano tutti. Oggi esce 1 e dice " +
    "perché: «import non risolvibile da Node — manca l'estensione». Si chiuderà da sola quando " +
    "l'ultimo test rotto sarà sistemato. Prima versione di questa prova: un pattern " +
    "«ESCLUSI_PANNELLO = []» su round3-verifica.mjs — scartata perché dipendeva da come qualcuno " +
    "formatta una riga, cioè la trappola di AR-037 (un pattern che può non scattare mai). " +
    "I 4 test eseguibili sono già agganciati al verificatore (13 passati) e l'escluso è dichiarato " +
    "ad alta voce, non tolto in silenzio.",
  chiuso_il: "",
};

if (!existsSync(CANTIERE)) {
  console.error(`❌ cantiere non trovato: ${CANTIERE}`);
  process.exit(1);
}
const cant = JSON.parse(readFileSync(CANTIERE, "utf8"));
const fatto = [], saltato = [];

// ① AR-123
const d123 = (cant.difetti || []).find((x) => x.id === "AR-123");
if (!d123) {
  saltato.push("AR-123: non trovato nel cantiere");
} else if (
  d123.verifica &&
  JSON.stringify(d123.verifica) === JSON.stringify(PROVA_AR123) &&
  d123.nota_round5 === NOTA_AR123
) {
  saltato.push("AR-123: prova già aggiornata");
} else {
  if (!DRY) {
    d123.verifica = PROVA_AR123;
    d123.nota_round5 = NOTA_AR123;
  }
  fatto.push(`AR-123: prova «umana» → ${PROVA_AR123.file} /${PROVA_AR123.pattern}/`);
}

// ② AR-156
const g156 = (cant.difetti || []).find((x) => x.id === "AR-156");
if (g156) {
  saltato.push("AR-156: già presente nel cantiere");
} else {
  if (!DRY) cant.difetti.push(AR156);
  fatto.push("AR-156: aggiunto (test del Pannello mai eseguiti + uno ineseguibile)");
}

if (DRY) {
  console.log("→ DRY-RUN, niente scritto.");
  fatto.forEach((x) => console.log("   farebbe: " + x));
  saltato.forEach((x) => console.log("   salta:   " + x));
  process.exit(0);
}

if (fatto.length) writeFileSync(CANTIERE, JSON.stringify(cant, null, 2) + "\n", "utf8");
fatto.forEach((x) => console.log("✅ " + x));
saltato.forEach((x) => console.log("• " + x));

const bloccanti = (cant.difetti || []).filter((d) => d.gravita === "bloccante" && d.stato !== "chiuso");
console.log(`\nBloccanti ancora aperti: ${bloccanti.length}${bloccanti.length ? " — " + bloccanti.map((d) => d.id).join(", ") : " 🎉"}`);
console.log(`\nOra:  node cervello/auto-fix.mjs verifica --applica   (chiude ciò che risulta risolto)`);
console.log(`Poi:  node cervello/pagella-intelligenza.mjs --gate    (rimisura, deve restare 0 peggiorate)`);
