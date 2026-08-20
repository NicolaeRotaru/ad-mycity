#!/usr/bin/env node
// =============================================================================
// 🧠 RIVEDI UNA LEZIONE — rinnovarla o ritirarla di proposito
// =============================================================================
// PERCHE' ESISTE. La macchina sapeva fare una cosa sola con le sue lezioni:
// dimenticarle da sola. `cristallizza-apprendimento.mjs` abbassa la fiducia di
// chi non viene riconfermato, e sotto una soglia la lezione muore. Non c'era
// nessun modo di dire «questa vale ancora, ecco dove si vede» ne' «questa e'
// superata, la ritiro». Il risultato misurato il 20/8: diciotto lezioni a un
// passo dalla morte per sola anzianita', fra cui «il segnale piu' prezioso e'
// cosa Nicola approva vs ignora».
//
// Dimenticare per inerzia e ritirare per decisione sono due cose diverse, e
// devono lasciare due tracce diverse. Da qui i due verbi.
//
// LA REGOLA CHE NON SI PIEGA: una conferma vuole un PERCHE' e una PROVA — dove
// si vede che la regola e' ancora in vigore. Senza, il comando rifiuta. Una
// riconferma a vuoto non ripara la memoria: spegne la spia che dice che si sta
// perdendo, ed e' peggio del rosso.
//
// Uso (🟢 anteprima senza --applica · 🟡 con --applica scrive la memoria AI):
//   node cervello/rivedi-lezione.mjs conferma <id> "<perche'>" --prova "<dove si vede>"
//   node cervello/rivedi-lezione.mjs ritira   <id> "<perche' e' superata>"
//   node cervello/rivedi-lezione.mjs stato    <id>
// =============================================================================

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
// Il freno della memoria (AR-446/AR-639): la penna non scrive dove le pare. In
// sabbiera la scrittura viene deviata e la memoria vera non si muove. Senza
// questa riga il mio strumento sarebbe il cinquantesimo «scrittore crudo del
// vault» contro un tetto di 49, e la prova `misura-che-non-sporca` lo ha visto
// subito — giustamente: uno strumento che ripara la memoria non puo' essere
// quello che aggira la guardia della memoria.
import { fileMemoria, fileMemoriaDaLeggere } from "./casa-memoria.mjs";
// ✍️ La penna condivisa (AR-639/AR-530). Porta dentro due regole che avrei
// altrimenti riscritto qui: il freno della memoria, e l'indentazione LETTA dal
// file invece che scelta da chi scrive. La seconda l'ho imparata sbagliando,
// venti minuti fa: riscrivendo questo stesso archivio a due spazi invece di uno
// l'ho portato da 996 KB a 1.048 KB, oltre il tetto. Il commento dentro
// `scrivi-json.mjs` cita `apprendimento.json` per nome — la regola c'era gia',
// e ne avevo scritta una seconda copia. Due copie della stessa regola divergono
// sempre: e' la lezione L-2026-0702-03, che ho appena riconfermato.
import { scriviJsonAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ARCHIVIO_NOMINALE = "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json";
export const ARCHIVIO_DA_LEGGERE = fileMemoriaDaLeggere(ARCHIVIO_NOMINALE, { env: process.env, esiste: existsSync });
export const ARCHIVIO_DA_SCRIVERE = fileMemoria(ARCHIVIO_NOMINALE, { env: process.env });

/** La fiducia a cui torna una lezione riconfermata con una prova. Non 1: una
 *  conferma e' una prova d'uso, non una dimostrazione. */
export const FIDUCIA_RICONFERMATA = 0.8;


/**
 * Decide cosa fare, senza toccare il disco. È qui che vive la regola, così la
 * prova può interrogarla senza scrivere niente.
 */
export function decidi({ verbo, lezione, perche, prova, adesso }) {
  if (!lezione) return { ok: false, motivo: "lezione inesistente" };
  const p = String(perche || "").trim();
  if (p.length < 15) {
    return { ok: false, motivo: "serve un perche' scritto: una riga che dica cosa rende vera (o superata) questa lezione oggi" };
  }
  if (verbo === "conferma") {
    const pr = String(prova || "").trim();
    if (pr.length < 5) {
      return { ok: false, motivo: "una conferma senza prova non e' una conferma: dichiara DOVE si vede che la regola e' in vigore (--prova)" };
    }
    return {
      ok: true,
      patch: {
        stato: "attiva",
        confidenza: FIDUCIA_RICONFERMATA,
        ultima_conferma: adesso,
        decaduto_step_il: null,
      },
      revisione: { quando: adesso, verbo, perche: p, prova: pr },
    };
  }
  if (verbo === "ritira") {
    return {
      ok: true,
      patch: { stato: "ritirata", ritirata_il: adesso },
      revisione: { quando: adesso, verbo, perche: p },
    };
  }
  return { ok: false, motivo: `verbo sconosciuto: ${verbo}` };
}

/** Applica la decisione alla lezione (oggetto in memoria). Ritorna la lezione. */
export function applica(lezione, esito) {
  Object.assign(lezione, esito.patch);
  lezione.revisioni = Array.isArray(lezione.revisioni) ? lezione.revisioni : [];
  lezione.revisioni.push(esito.revisione);
  return lezione;
}

function main() {
  const args = process.argv.slice(2);
  const APPLICA = args.includes("--applica");
  const iProva = args.indexOf("--prova");
  const prova = iProva >= 0 ? args[iProva + 1] : null;
  // Attenzione all'indice: senza `--prova` iProva vale -1, e `i !== iProva + 1`
  // scarterebbe l'argomento in posizione 0 — cioe' il verbo. Il valore di
  // --prova si salta solo se --prova c'e' davvero.
  const liberi = args.filter((a, i) => !a.startsWith("--") && !(iProva >= 0 && i === iProva + 1));
  const [verbo, id, perche] = liberi;

  if (!verbo || !id) {
    console.error('Uso: node cervello/rivedi-lezione.mjs conferma|ritira|stato <id> "<perche\'>" [--prova "<dove si vede>"] [--applica]');
    process.exit(2);
  }

  const grezzo = readFileSync(ARCHIVIO_DA_LEGGERE, "utf8");
  const j = JSON.parse(grezzo);
  const lezione = (j.lezioni || []).find((l) => l && l.id === id);

  if (verbo === "stato") {
    if (!lezione) { console.error(`✗ ${id}: non esiste`); process.exit(1); }
    console.log(`${lezione.id} · stato ${lezione.stato} · fiducia ${lezione.confidenza} · confermata ${lezione.ultima_conferma || lezione.nato}`);
    console.log(String(lezione.testo || "").slice(0, 300));
    process.exit(0);
  }

  const esito = decidi({ verbo, lezione, perche, prova, adesso: new Date().toISOString() });
  if (!esito.ok) { console.error(`✗ ${id}: ${esito.motivo}`); process.exit(1); }

  if (!APPLICA) {
    console.log(`🟢 anteprima — ${verbo} ${id}`);
    console.log(`   diventerebbe: ${JSON.stringify(esito.patch)}`);
    console.log("   (nessun byte scritto: aggiungi --applica)");
    process.exit(0);
  }

  applica(lezione, esito);
  scriviJsonAtomico(ARCHIVIO_DA_SCRIVERE, j);
  console.log(`✅ ${verbo} ${id} — ${verbo === "conferma" ? `fiducia a ${FIDUCIA_RICONFERMATA}` : "ritirata"}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) main();
