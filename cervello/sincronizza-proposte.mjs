#!/usr/bin/env node
// Sincronizza le proposte di miglioramento con lo stato reale del cantiere (AR-055 · AR-581).
// 🟢 Sola lettura del cantiere + aggiornamento di auto-miglioramento.json.
//
// ① AR-055 — le proposte di auto-riscrittura restavano senza stato valido anche quando il difetto
//    omonimo era già chiuso. Qui si riallineano al cantiere.
//
// ② AR-581 — IL QUADERNO DEI PEZZI NUOVI ERA MORTO. `cantiere-pezzi.json` tiene 14 proposte di
//    CAPACITÀ da costruire (guardiani, sensori, adattatori): fermo al 5 luglio e con ZERO lettori in
//    tutto il codice — nessun file di `cervello/`, `pannello/` o `.claude/` lo apriva. Quattordici
//    idee pensate, scritte e mai più guardate, più un file che inganna chi esplora la memoria
//    facendosi passare per vivo.
//    Da qui in poi il suo lettore è questo programma, che a ogni giro dice tre cose:
//      · quanti pezzi restano da costruire (e quali), così tornano davanti agli occhi;
//      · quali sono già FATTI perché il file che promettevano adesso esiste in `cervello/` — lo
//        stato si deduce dal mondo, non dalla parola scritta nel file;
//      · quanto è vecchio il quaderno, col verdetto a tre esiti (fresco · stantio · non l'ho potuto
//        vedere): un quaderno oltre la sua scadenza non è un quaderno a posto.
//
// Uso:
//   node cervello/sincronizza-proposte.mjs
//   node cervello/sincronizza-proposte.mjs --json

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";
import { NON_VISTO, STANTIO, etaReferto } from "./eta-referto.mjs";

const JSON_MODE = process.argv.includes("--json");
const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");
const MIG = join(VAULT, "auto-miglioramento.json");
const CANTIERE = join(VAULT, "cantiere-difetti.json");
const PEZZI = join(VAULT, "cantiere-pezzi.json");
/** Un quaderno di proposte che nessuno tocca da un mese è un quaderno abbandonato, non stabile. */
export const PEZZI_SCADENZA_ORE = 24 * 30;

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function statoValido(s) {
  return s === "proposta" || s === "firmata" || s === "implementata" || s === "rifiutata";
}

/**
 * AR-581 — I PEZZI ANCORA DA COSTRUIRE, e quali sono già in piedi senza che il file lo dica.
 *
 * PURA apposta: `esiste` (il pezzo è già sul disco?) arriva da fuori, così una prova può eseguire
 * questa decisione senza dipendere da com'è fatta la cartella `cervello/` oggi. È anche il motivo
 * per cui la regola si può provare in entrambi i versi — pezzo costruito e pezzo ancora da fare.
 *
 * Il titolo dei pezzi comincia spesso col nome del file promesso («keyword-owner-check.mjs — …»):
 * quando quel file esiste, il pezzo è FATTO nel mondo anche se il quaderno lo chiama ancora
 * «proposto». È la differenza fra leggere lo stato e verificarlo.
 */
export function sincronizzaPezzi(pezzi, esiste = () => false) {
  const lista = Array.isArray(pezzi) ? pezzi : [];
  const righe = lista.map((p) => {
    const file = String(p?.titolo ?? "").match(/^([\w.-]+\.(?:mjs|sh|ts|js))/)?.[1] ?? null;
    const costruito = Boolean(file && esiste(file));
    const dichiarato = String(p?.stato ?? "proposto");
    return {
      id: p?.id ?? "?",
      titolo: String(p?.titolo ?? "").slice(0, 80),
      owner: p?.owner ?? null,
      stato: dichiarato,
      file,
      costruito,
      // Lo scarto fra quello che il quaderno dice e quello che c'è davvero sul disco.
      da_aggiornare: costruito && dichiarato !== "fatto",
    };
  });
  return {
    totale: righe.length,
    fatti: righe.filter((r) => r.stato === "fatto").length,
    da_costruire: righe.filter((r) => r.stato !== "fatto"),
    da_aggiornare: righe.filter((r) => r.da_aggiornare),
    righe,
  };
}

async function main() {
  const quando = nowPiacenza();
  const mig = readJson(MIG, { proposte_auto_riscrittura: [] });
  const cantiere = readJson(CANTIERE, { difetti: [] });
  const byId = Object.fromEntries(
    (cantiere.difetti || []).filter((d) => d.id).map((d) => [d.id, d])
  );

  const proposte = Array.isArray(mig.proposte_auto_riscrittura) ? mig.proposte_auto_riscrittura : [];
  let aggiornate = 0;

  for (const p of proposte) {
    const prev = p.stato;
    if (!statoValido(prev)) {
      const d = p.finding_id ? byId[p.finding_id] : null;
      if (d?.stato === "chiuso") {
        p.stato = "implementata";
        p.sincronizzato_il = quando;
      } else if (d?.stato === "in-corso") {
        p.stato = "firmata";
        p.sincronizzato_il = quando;
      } else {
        p.stato = "proposta";
      }
      if (p.stato !== prev) aggiornate++;
    }
  }

  // ── AR-581: il quaderno dei pezzi nuovi, finalmente letto da qualcuno ────────────────────────
  const quadernoPezzi = readJson(PEZZI, null);
  const eta = etaReferto({
    dato: quadernoPezzi,
    scadenzaOre: PEZZI_SCADENZA_ORE,
    adessoMs: Date.now(),
    nome: "Il quaderno dei pezzi nuovi",
  });
  const pezzi = sincronizzaPezzi(quadernoPezzi?.pezzi, (f) => existsSync(join(AD_ROOT, "cervello", f)));

  mig.aggiornato = quando;
  mig.proposte_sync = { aggiornato: quando, totale: proposte.length, aggiornate };
  // Lo specchio del quaderno dentro il file che la macchina guarda davvero: da qui le 14 idee
  // tornano visibili invece di dormire in un file senza lettori.
  mig.pezzi_sync = {
    aggiornato: quando,
    fonte: "auto-coscienza/cantiere-pezzi.json",
    freschezza: eta.stato,
    perche: eta.perche,
    totale: pezzi.totale,
    fatti: pezzi.fatti,
    da_costruire: pezzi.da_costruire.map((r) => ({ id: r.id, titolo: r.titolo, owner: r.owner })),
    da_aggiornare: pezzi.da_aggiornare.map((r) => r.id),
  };
  writeJson(MIG, mig);

  const vecchio = eta.stato === STANTIO || eta.stato === NON_VISTO;
  const sintesi =
    `${proposte.length} proposte · ${aggiornate} allineate al cantiere · ` +
    `pezzi: ${pezzi.da_costruire.length}/${pezzi.totale} ancora da costruire${vecchio ? ` · ⚠️ ${eta.perche}` : ""}`;
  await stampSegnale("sincronizza-proposte", vecchio ? "warn" : "ok", `${sintesi} · ${quando}`);

  const out = { quando, sintesi, aggiornate, totale: proposte.length, pezzi: mig.pezzi_sync };
  if (JSON_MODE) console.log(JSON.stringify(out, null, 2));
  else {
    console.log(`🔄 sincronizza-proposte — ${sintesi}`);
    for (const r of pezzi.da_costruire) console.log(`   🧩 da costruire: ${r.id} ${r.titolo} (${r.owner || "senza owner"})`);
    for (const r of pezzi.da_aggiornare) console.log(`   ✅ già in piedi ma segnato «${r.stato}»: ${r.id} → ${r.file}`);
    if (vecchio) console.log(`   ⚠️  ${eta.perche}`);
  }
}

// AR-445 — il programma parte solo se lanciato, non al solo essere importato: chi importa questo
// file per provarne una funzione non deve ritrovarsi auto-miglioramento.json riscritto sotto i piedi.
const lanciato = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lanciato) {
  main().catch(async (e) => {
    await stampSegnale("sincronizza-proposte", "errore", (e.message || e).toString().slice(0, 160));
    console.error("ERRORE sincronizza-proposte:", e.message || e);
    process.exit(1);
  });
}
