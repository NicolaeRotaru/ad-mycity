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

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json");
const JSON_MODE = process.argv.includes("--json");
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
  writeFileSync(PATH, JSON.stringify(dati, null, 2) + "\n", "utf8");
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

  const esperimenti = Array.isArray(dati.esperimenti) ? dati.esperimenti : [];
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
  dati.meta_esperimenti = {
    aggiornato: quando,
    totale: esperimenti.length,
    aperti: aperti.length,
    in_scadenza: inScadenza.length,
    misurati: esperimenti.filter((e) => e.stato === "misurato").length,
    chiusi: esperimenti.filter((e) => e.stato === "chiuso").length,
  };
  writeFileSync(PATH, JSON.stringify(dati, null, 2) + "\n", "utf8");

  const sintesi = `${aperti.length} aperti · ${inScadenza.length} in scadenza${datati ? ` · ${datati} datati d'ufficio (+${GIORNI_DEFAULT}g)` : ""}`;
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
  }
  // AR-041: array vuoto = volano spento → exit 1 (giro.sh può farne vincolo hard al motore).
  process.exit(inScadenza.length > 0 || aperti.length === 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("ERRORE esperimenti-check:", e.message || e);
  await stampSegnale("esperimenti", "errore", `crash: ${(e.message || e).toString().slice(0, 180)}`);
  process.exit(1);
});
