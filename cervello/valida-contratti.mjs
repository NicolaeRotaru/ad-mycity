#!/usr/bin/env node
// AR-043 — Validatore di CONTRATTO dei file auto-coscienza/*.json.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Verifica che i JSON di memoria-macchina
// rispettino lo schema canonico ("una sola verità" dei campi) e FALLISCE se un file ha campi
// fuori contratto o manca un campo obbligatorio.
//
// Perché (AR-043): il contratto viveva come prosa in un .md, non come schema eseguibile. Così
// auto-analisi.json poteva scrivere `supabase_marketplace/supabase_memoria` mentre il Pannello
// legge `salute_macchina.supabase` / `.stripe` → i due tile restavano sempre spenti. Questo
// validatore rende il contratto CODICE, cablabile in giro.sh come gate prima del commit.
//
// Uso:
//   node cervello/valida-contratti.mjs           -> report leggibile
//   node cervello/valida-contratti.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = tutti i file conformi · 1 = almeno una violazione di contratto

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const DIR = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");

// CONTRATTO: per ogni file, i campi obbligatori e i campi VIETATI (alias non canonici).
// `salute` descrive lo schema canonico del blocco salute_macchina letto dal Pannello.
const CONTRATTO = {
  "auto-analisi.json": {
    obbligatori: ["data"],
    // AR-212 — gli alias che SPENGONO informazione nella Cabina. Il giro scriveva
    // `domande_bloccanti` mentre il Pannello legge `domande_per_nicola`: risultato, «nessuna domanda»
    // in Cabina mentre nel file ce n'erano tre, una sul bando in scadenza. Nessuno se n'è accorto
    // perché il numero mostrato era plausibile — zero domande è uno stato normale.
    // Il modello che scrive il file segue la prosa dello spec e sotto pressione sceglie sinonimi
    // plausibili: l'unico rimedio è che il contratto li VIETI, così il giro riceve un vincolo hard.
    vietati: {
      domande_bloccanti: "domande_per_nicola",
      errori_giro: "errori",
      domande: "domande_per_nicola",
      problemi: "errori",
    },
    // il blocco salute_macchina, se presente, deve usare i nomi canonici del Pannello
    salute_macchina: {
      canonici: ["supabase", "stripe", "dati_freschi", "sensori_attivi"],
      vietati: ["supabase_marketplace", "supabase_memoria"], // AR-043: alias che spengono i tile
    },
  },
  "storico-salute.json": { obbligatori: ["serie"] },
  "cantiere-difetti.json": { obbligatori: ["difetti"] },
  // AR-213 — il contratto copriva TRE file su venticinque, e gli altri ventidue passavano in
  // silenzio (`if (!regola) continue`). È il motivo per cui AR-212 è arrivato fino alla Cabina: il
  // cancello che doveva intercettarlo non guardava quel campo, e nemmeno quel file.
  // Qui ci sono i file che il Pannello LEGGE DAVVERO — ricavati grepando pannello/src, non a memoria.
  "auto-radiografia.json": { obbligatori: ["data", "dimensioni"] },
  "apprendimento.json": { obbligatori: ["lezioni"], vietati: { insegnamenti: "lezioni", regole: "principi" } },
  "auto-miglioramento.json": { obbligatori: [] },
  "calibrazione.json": { obbligatori: ["registro"], vietati: { previsioni: "registro" } },
  "registro-realta.json": { obbligatori: ["entita"], vietati: { entità: "entita", soggetti: "entita" } },
  "sensori-cecita.json": { obbligatori: ["sensori"] },
  "coerenza-fatti.json": { obbligatori: ["esito"] },
  "chiusura-loop.json": { obbligatori: [] },
  "costo-ai.json": { obbligatori: [] },
  "radiografia-marketplace.json": { obbligatori: [] },
  "watchlist-riferimenti.json": { obbligatori: [] },
};

// AR-213 — i file che il PANNELLO legge. Un file letto dalla Cabina e senza contratto dichiarato non
// è «minimale»: è una sezione che può spegnersi in silenzio al primo sinonimo. L'elenco è ricavato
// grepando pannello/src, non scritto a memoria — ed è per questo che il gate può pretenderlo.
const LETTI_DAL_PANNELLO = [
  "apprendimento.json", "auto-analisi.json", "auto-miglioramento.json", "auto-radiografia.json",
  "calibrazione.json", "cantiere-difetti.json", "chiusura-loop.json", "coerenza-fatti.json",
  "costo-ai.json", "radiografia-marketplace.json", "registro-realta.json", "sensori-cecita.json",
  "storico-salute.json", "watchlist-riferimenti.json",
];

function valida(nomeFile, dati, regola) {
  const problemi = [];
  for (const req of regola.obbligatori || []) {
    if (!(req in dati)) problemi.push(`campo obbligatorio mancante: "${req}"`);
  }
  // AR-212: un alias non è un dettaglio di stile — è informazione che sparisce dalla Cabina.
  for (const [alias, canonico] of Object.entries(regola.vietati || {})) {
    if (alias in dati) {
      const n = Array.isArray(dati[alias]) ? dati[alias].length : "?";
      problemi.push(
        `"${alias}" è un alias non canonico di "${canonico}": il Pannello legge "${canonico}" e mostrerebbe ZERO invece di ${n}. Rinomina il campo.`,
      );
    }
  }
  if (regola.salute_macchina && dati.salute_macchina && typeof dati.salute_macchina === "object") {
    const sm = dati.salute_macchina;
    for (const vietato of regola.salute_macchina.vietati) {
      if (vietato in sm)
        problemi.push(`salute_macchina."${vietato}" è un alias non canonico (usa "supabase"/"stripe")`);
    }
    const chiaviCanoniche = regola.salute_macchina.canonici;
    for (const k of Object.keys(sm)) {
      if (!chiaviCanoniche.includes(k))
        problemi.push(`salute_macchina."${k}" fuori contratto (ammessi: ${chiaviCanoniche.join(", ")})`);
    }
  }
  return problemi;
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(DIR)) {
    const out = { ok: false, quando, errore: "cartella auto-coscienza mancante" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ auto-coscienza/ non trovata");
    process.exit(1);
  }

  const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  const violazioni = [];
  const nonDichiarati = []; // AR-213: contati e mostrati, non più invisibili
  for (const f of files) {
    const regola = CONTRATTO[f];
    if (!regola) {
      // AR-213 — un file che la Cabina LEGGE e che nessuno ha dichiarato è un buco nel cancello:
      // può cambiare nome a un campo e spegnere una sezione senza che nulla protesti. Chi invece
      // non è letto da nessuno resta fuori senza far fallire il gate — un cancello che parte rosso
      // su ventidue file verrebbe disattivato entro la settimana, e non proteggerebbe più niente.
      if (LETTI_DAL_PANNELLO.includes(f)) {
        violazioni.push({ file: f, problemi: [`letto dal Pannello ma SENZA contratto dichiarato: una sezione può spegnersi in silenzio (AR-213). Dichiaralo in CONTRATTO.`] });
      } else {
        nonDichiarati.push(f);
      }
      continue;
    }
    let dati;
    try {
      dati = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    } catch (e) {
      violazioni.push({ file: f, problemi: [`JSON non parsabile: ${String(e.message || e)}`] });
      continue;
    }
    const problemi = valida(f, dati, regola);
    if (problemi.length) violazioni.push({ file: f, problemi });
  }

  const out = {
    ok: violazioni.length === 0,
    quando,
    file_controllati: files.filter((f) => CONTRATTO[f]).length,
    file_totali: files.length,                       // AR-213: il denominatore, che prima non c'era
    non_dichiarati: nonDichiarati,                   // AR-213: contati e mostrati, non più invisibili
    violazioni,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else if (out.ok) {
    console.log(`✅ contratti: ${out.file_controllati}/${out.file_totali} file auto-coscienza conformi — ${quando}`);
    if (nonDichiarati.length) {
      // Non è un errore: sono file che nessuna schermata legge. Ma il numero si vede, così «22 file
      // non giudicati» smette di essere un fatto invisibile e diventa una scelta consapevole.
      console.log(`   ${nonDichiarati.length} senza contratto (nessuna schermata li legge): ${nonDichiarati.join(", ")}`);
    }
  } else {
    console.log(`❌ contratti: ${violazioni.length} file fuori contratto — ${quando}`);
    for (const v of violazioni) {
      console.log(`  · ${v.file}`);
      for (const p of v.problemi) console.log(`      - ${p}`);
    }
  }
  process.exit(out.ok ? 0 : 1);
}

main();
