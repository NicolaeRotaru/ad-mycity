#!/usr/bin/env node
// 🧪 ESPERIMENTI-CHECK (PZ-010, piano "chiudi i loop") — lo sweep che NON lascia esperimenti aperti all'infinito.
// 🟢 Sola lettura del mondo: scrive solo auto-coscienza/auto-miglioramento.json (bookkeeping) + segnale.
//
// Problema (AR-054): lo schema impone che ogni esperimento nasca `stato:aperto` e DEVE chiudersi
// (`misurato`/`chiuso`) con la sua `data_misura` — ma la chiusura era delegata alla memoria dell'LLM
// nel ciclo settimanale (= non succede). Gemello di `calibrazione.mjs scadute`, per gli esperimenti.
//
// Cosa fa a ogni giro (deterministico, 0 token):
//   1. esperimenti `aperto` con `data_misura` <= oggi   → IN SCADENZA: vanno misurati IN QUESTO giro
//      (li elenca; il motore AI riceve la lista e deve scrivere `delta` + stato `misurato`).
//   2. esperimenti `aperto` SENZA `data_misura`         → flag "senza data": lo sweep gliela mette
//      a +7 giorni da oggi (un esperimento senza scadenza non è un esperimento, è un desiderio).
//   3. aggiorna `meta_esperimenti` nel file (contatori per il Pannello/sonda) + stampSegnale.
//
// Uso:
//   node cervello/esperimenti-check.mjs           -> report + bookkeeping
//   node cervello/esperimenti-check.mjs --json    -> output JSON (per giro / sentinelle)
//
// Exit: 0 = nessun esperimento in scadenza · 1 = almeno uno da misurare ORA (giro.sh può farne vincolo)

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
// AR-668 — la TERZA porta annidata. `sentinella-dati` lancia il tick, il tick lancia questo, e questo
// riscriveva la memoria con un `writeFileSync` crudo: un freno sulla prima porta non arrivava mai
// fin qui. Ora la scrittura passa dal writer atomico condiviso, che consulta `casa-memoria.mjs`.
import { scriviJsonAtomico } from "./scrivi-json.mjs";
// AR-150 — «misurato» era una parola che il motore si scriveva da solo. Nove esperimenti su quindici
// la portavano mentre la loro stessa nota diceva «mai testata: il gate non è mai partito». Qui il
// conto passa dallo stato EFFETTIVO, e i non-testati diventano un numero invece di sparire nei misurati.
import { contaEsperimenti, correggiStati, esperimentiNonTestati, statoEffettivo } from "./esperimenti-regole.mjs";

const PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json");
const JSON_MODE = process.argv.includes("--json");
const SOLO_BOOKKEEPING = process.argv.includes("--solo-bookkeeping");
const GIORNI_DEFAULT = Number(process.env.ESPERIMENTI_GIORNI || 7);

// --apri: apre un nuovo esperimento dalla CLI (AR-041 — il motore chiama questo invece di scrivere a mano).
//   node cervello/esperimenti-check.mjs --apri --ambito=onboarding --metrica=negozi_live --atteso=1 [--giorni=14]
function argVal(name) {
  const a = process.argv.find((v) => v.startsWith(`--${name}=`));
  return a ? a.split("=").slice(1).join("=") : null;
}
if (process.argv.includes("--apri")) {
  const ambito = argVal("ambito") || "generico";
  const metrica = argVal("metrica") || "non specificata";
  const atteso = argVal("atteso") || "1";
  const giorni = Number(argVal("giorni") || GIORNI_DEFAULT);
  const id = `EXP-${Date.now().toString(36).toUpperCase()}`;
  const data_misura = isoPiu(giorni);
  let dati = existsSync(PATH) ? JSON.parse(readFileSync(PATH, "utf8")) : {};
  if (!Array.isArray(dati.esperimenti)) dati.esperimenti = [];
  dati.esperimenti.push({ id, stato: "aperto", ambito, metrica, atteso, data_misura, aperto_il: nowPiacenza() });
  scriviJsonAtomico(PATH, dati);
  console.log(`✅ Esperimento ${id} aperto: ${metrica} atteso ${atteso} entro ${data_misura}`);
  process.exit(0);
}

function isoPiu(giorni) {
  const d = new Date(Date.now() + giorni * 86400000);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const quando = nowPiacenza();
  const oggi = quando.slice(0, 10);

  if (!existsSync(PATH)) {
    const out = { quando, esperimenti: 0, in_scadenza: [], nota: "auto-miglioramento.json assente — nulla da controllare" };
    await stampSegnale("esperimenti", "ok", `nessun file · ${quando}`);
    console.log(JSON_MODE ? JSON.stringify(out, null, 2) : "🧪 esperimenti-check: auto-miglioramento.json assente — nulla da controllare.");
    process.exit(0);
  }

  let dati;
  try {
    dati = JSON.parse(readFileSync(PATH, "utf8"));
  } catch (e) {
    await stampSegnale("esperimenti", "errore", `JSON non parsabile: ${String(e.message).slice(0, 120)}`);
    console.error(`❌ esperimenti-check: ${PATH} non parsabile (${e.message}).`);
    process.exit(1);
  }

  let esperimenti = Array.isArray(dati.esperimenti) ? dati.esperimenti : [];
  const aperti = esperimenti.filter((e) => e.stato === "aperto");
  let datati = 0;

  // (2) Un aperto senza data_misura riceve la scadenza di default: senza data non chiuderà mai.
  for (const e of aperti) {
    if (!e.data_misura) {
      e.data_misura = isoPiu(GIORNI_DEFAULT);
      datati += 1;
    }
  }

  // (1) In scadenza = aperto con data_misura raggiunta: va misurato in questo giro.
  const inScadenza = aperti.filter((e) => e.data_misura && e.data_misura <= oggi);

  // (3) Bookkeeping per Pannello/sonda (contatori, non tocca gli stati: la MISURA resta al motore/AD).
  // AR-150 — `misurati` era il conto di chi si dichiarava misurato. Ora è il conto di chi lo è
  // davvero, e accanto compare `non_testati`: gli esperimenti scaduti col gate mai partito. Il numero
  // che prima si nascondeva dentro «misurati» adesso ha un nome suo, e il Pannello lo può mostrare.
  // (2b) AR-744 — l'etichetta smentita dal proprio racconto viene CORRETTA, non solo contata.
  //
  // Fino al 22/8 questo file sapeva riconoscerli (`statoEffettivo` dal 15/8) e li lasciava sbagliati
  // sul disco: nove schede su dieci dicevano `misurato` mentre la loro stessa nota diceva che il gate
  // non era mai partito. Chi leggeva il registro senza passare da qui — il Pannello, un giro futuro,
  // una radiografia — leggeva nove esperimenti misurati. Il rilevatore era un LETTORE.
  //
  // Questo NON viola il confine dichiarato sopra («la MISURA resta al motore/AD»): non si decide
  // nessun esito, non si legge nessun numero. Si toglie una contraddizione fra due campi della stessa
  // scheda, usando come fonte il campo che descrive un fatto accaduto (la nota) contro quello che
  // dichiara un'etichetta. La parola di prima resta in `stato_dichiarato`, la nota non si tocca.
  //
  // E sta QUI, sul dato, invece che dentro un comando a mano: la correzione fatta una volta a mano il
  // 22/8 avrebbe rimesso le stesse nove schede nella stessa condizione al primo esperimento nuovo
  // scritto con la stessa bugia. Un freno dentro il comando non lo eredita nessun altro scrittore.
  const corretta = correggiStati(esperimenti);
  if (corretta.corretti.length) {
    esperimenti = corretta.esperimenti;
    dati.esperimenti = esperimenti;
  }

  const conto = contaEsperimenti(esperimenti);
  const nonTestati = esperimentiNonTestati(esperimenti);
  dati.meta_esperimenti = {
    aggiornato: quando,
    totale: esperimenti.length,
    aperti: aperti.length,
    in_scadenza: inScadenza.length,
    misurati: conto.misurati,
    chiusi: conto.chiusi,
    non_testati: conto.non_testati,
    non_testati_ids: nonTestati.map((e) => e.id).filter(Boolean),
    resa_esperimenti: conto.resa,
    etichette_corrette: corretta.corretti,
    _cosa_significa_non_testati:
      "esperimenti che si dichiarano misurati/chiusi mentre la loro stessa nota dice che il gate non è mai partito: l'ipotesi non è stata respinta, non è mai stata provata (AR-150).",
  };
  dati.aggiornato = quando;
  scriviJsonAtomico(PATH, dati);

  const sintesi = `${aperti.length} aperti · ${inScadenza.length} in scadenza · ${conto.misurati} misurati davvero · ${conto.non_testati} mai testati${datati ? ` · ${datati} datati d'ufficio (+${GIORNI_DEFAULT}g)` : ""}`;
  await stampSegnale("esperimenti", inScadenza.length ? "warn" : "ok", `${sintesi} · ${quando}`);

  const out = {
    quando,
    sintesi,
    in_scadenza: inScadenza.map((e) => ({ id: e.id, ambito: e.ambito, metrica: e.metrica, atteso: e.atteso, data_misura: e.data_misura })),
    meta: dati.meta_esperimenti,
  };
  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`\n🧪 ESPERIMENTI-CHECK — ${quando} · ${sintesi}`);
    if (inScadenza.length) {
      console.log(`   Da MISURARE in questo giro (scrivi delta + stato 'misurato' in auto-miglioramento.json):`);
      for (const e of inScadenza) console.log(`   • [${e.id}] ${e.ambito}: ${e.metrica} atteso ${e.atteso} — misura entro ${e.data_misura}`);
    } else if (aperti.length === 0) {
      console.log("⛔ AR-041: NESSUN ESPERIMENTO APERTO — il ciclo osserva→impara non misura mai nulla.");
      console.log("   VINCOLO: in questo giro apri ≥1 esperimento sull'ambito col divario più alto.");
      console.log("   Es: node cervello/esperimenti-check.mjs --apri --ambito=onboarding --metrica=negozi_live --atteso=1 --giorni=7");
    } else {
      console.log("   ✅ Tutti gli esperimenti aperti hanno una scadenza futura.");
    }
    if (nonTestati.length) {
      console.log(`   ⚠️  ${nonTestati.length} dichiarati misurati e MAI TESTATI (il gate non è mai partito): ${nonTestati.map((e) => e.id).join(", ")}`);
      console.log(`      Non contano come prova che la macchina impara. Vanno riscritti stato "non-testato" o riaperti col gate legato all'esecuzione, non a un timer.`);
    }
  }
  // AR-041: array vuoto = volano spento → exit 1 (giro.sh può farne vincolo hard al motore).
  // --solo-bookkeeping: chiamato dal tick leggero ogni ~10 min — solo contatori, niente gate.
  if (SOLO_BOOKKEEPING) process.exit(0);
  process.exit(inScadenza.length > 0 || aperti.length === 0 ? 1 : 0);
}

// AR-680 — il programma parte solo se qualcuno LANCIA questo file, non se qualcuno lo importa.
// Senza questa guardia, importare il modulo per leggerne una funzione ne esegue il gate: è la
// malattia censita `programma-che-parte-importando`. La forma con `pathToFileURL` è quella robusta:
// `file://${process.argv[1]}` si rompe sotto un percorso con uno spazio o un accento, e si rompe
// uscendo 0 — cioè il comando non parte e sembra andato bene.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (e) => {
    console.error("ERRORE esperimenti-check:", e.message || e);
    await stampSegnale("esperimenti", "errore", `crash: ${(e.message || e).toString().slice(0, 180)}`);
    process.exit(1);
  });
}
