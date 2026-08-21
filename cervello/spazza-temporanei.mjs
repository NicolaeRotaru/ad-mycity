#!/usr/bin/env node
// 🧹 SPAZZA LE CARTELLE TEMPORANEE ORFANE. 🟢 Reversibile: cancella solo roba scaduta e nostra.
//
// IL GUASTO CHE CHIUDE, e chi l'ha causato. Il 20/8 la macchina è rimasta ferma quasi tre giorni.
// Causa ultima: /tmp pieno al 100%. Senza spazio `c4-segreti.sh` non riusciva a scrivere la chiave
// della memoria; senza chiave il worker non poteva leggere lo stato di pausa; e sul dubbio si ferma
// apposta (fail-closed). Un disco pieno si era travestito da kill-switch.
//
// A riempirlo NON è stato il worker: sono state **le prove**. Trentadue file di `cervello/test/`
// creano una cartella con `mkdtempSync` e non la cancellano mai. Il banco gira a ogni giro, quindi
// ogni giro lascia indietro una trentina di cartelle da qualche mega. In mesi: 1,9 GB, cioè tutto
// il disco temporaneo del server.
//
// Esisteva già una prova che pretendeva una spazzata — e mentre il disco si riempiva era ROSSA da
// mesi. Cercava due parole dentro worker.sh (`mycity-worker.*`, `mycity-allegati`): due famiglie
// che non c'entravano niente col guasto vero. È la lezione dell'asticella, vista dal vivo: *una
// ricerca di parole non può fallire nel modo in cui fallisce la realtà.*
//
// COSA FA. Cancella dalla cartella temporanea le sottocartelle che ① portano uno dei nostri
// prefissi e ② non vengono toccate da più di `oreMin` ore. Le due condizioni insieme sono la
// sicurezza: mai roba di altri, mai roba di un banco che sta girando adesso.
//
// Uso:
//   node cervello/spazza-temporanei.mjs            -> spazza e stampa cosa ha tolto
//   node cervello/spazza-temporanei.mjs --prova    -> dice cosa toglierebbe, senza toccare niente
//   node cervello/spazza-temporanei.mjs --json

import { readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * I prefissi che nascono da noi. Chi ne aggiunge uno nuovo lo mette qui: la prova
 * `spazza-temporanei.test.mjs` misura che ogni famiglia dichiarata venga davvero spazzata.
 */
export const PREFISSI = [
  "mycity-campo-", // finte dei test: sono queste che hanno riempito il disco
  "cancello-",
  "cadenza-ai-",
  "repo-finto-",
  "non-repo-",
  "allineamento-",
  "sabbiera-",
  "riconcilia-",
  "ripesca-",
];

/**
 * Le cartelle che NON si toccano mai, per quanto vecchie sembrino. È la lista che mi sono scritta
 * dopo aver riletto la mia stessa prima versione, dove il prefisso era il generico `mycity-`:
 *
 *   · `mycity-auth.*` tiene le intestazioni autenticate di un processo VIVO. Cancellarla mentre il
 *     worker gira gli toglie la chiave della memoria di sotto — cioè ricrea con le mie mani esattamente
 *     il guasto del 20/8, questa volta senza nemmeno il disco pieno come scusa.
 *   · `mycity-allegati` non è una cartella usa-e-getta: è la casa degli allegati, e deve restare.
 *     Dentro ci si spazza (lo fa `worker.sh`), la casa no.
 *   · `mycity-worker.*` sono i temporanei del worker in esecuzione: li pulisce `worker.sh` all'avvio,
 *     quando è sicuro perché è lui che sta ripartendo.
 *
 * Una spazzata che si porta via roba viva è peggio del disco pieno: il disco pieno almeno si vede.
 */
export const MAI_TOCCARE = ["mycity-auth.", "mycity-allegati", "mycity-worker."];

/** Ore dopo le quali una cartella temporanea è considerata orfana. */
export const ORE_DEFAULT = 24;

/**
 * Spazza le cartelle orfane e ritorna il referto.
 *
 * `esegui: false` è la modalità prova: guarda e non tocca. La uso nel test per misurare la
 * SELEZIONE senza dipendere dal fatto che il filesystem cancelli davvero.
 */
export function spazza({ dir = tmpdir(), prefissi = PREFISSI, oreMin = ORE_DEFAULT, adesso = null, esegui = true } = {}) {
  const ora = adesso ?? Date.now();
  const limite = ora - oreMin * 3600_000;
  const tolte = [];
  const tenute = [];
  let byte = 0;

  let voci = [];
  try {
    voci = readdirSync(dir);
  } catch {
    return { dir, tolte, tenute, byte, leggibile: false };
  }

  for (const nome of voci) {
    if (MAI_TOCCARE.some((p) => nome.startsWith(p))) continue; // roba viva: prima di tutto il resto
    if (!prefissi.some((p) => nome.startsWith(p))) continue;
    const percorso = join(dir, nome);
    let st;
    try {
      st = statSync(percorso);
    } catch {
      continue; // sparita mentre guardavo: non è un problema mio
    }
    // SOLO mtime, e la ragione è un errore che ho fatto e che la prova ha preso. Avevo scritto
    // `Math.max(mtimeMs, ctimeMs)` pensando «prendo il più recente dei due, così sto sicura». Ma
    // ctime non è «l'ultima volta che l'hanno usata»: è l'ultima volta che è cambiato l'inode, e
    // NON si può spostare indietro. Risultato: ogni cartella risultava toccata adesso, e la
    // spazzata non toglieva mai niente pur girando. Sarebbe passata per verde in ogni prova che
    // guarda il codice invece del disco.
    //
    // L'mtime di una CARTELLA si aggiorna quando dentro nasce o sparisce un file: è esattamente il
    // segnale «qualcuno la sta usando» che serve qui.
    const toccata = st.mtimeMs;
    if (toccata > limite) {
      tenute.push(nome);
      continue;
    }
    if (esegui) {
      try {
        rmSync(percorso, { recursive: true, force: true });
      } catch {
        continue; // permessi di un altro utente: la salto, non fingo di averla tolta
      }
    }
    byte += st.size || 0;
    tolte.push(nome);
  }

  return { dir, tolte, tenute, byte, leggibile: true };
}

const eseguitoDaSolo = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (eseguitoDaSolo) {
  const prova = process.argv.includes("--prova");
  const r = spazza({ esegui: !prova });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(r, null, 2));
  } else if (!r.leggibile) {
    console.log(`⚪ non ho potuto leggere ${r.dir}`);
  } else if (r.tolte.length === 0) {
    console.log(`✅ niente da spazzare in ${r.dir} (${r.tenute.length} cartelle nostre ancora fresche)`);
  } else {
    console.log(`🧹 ${prova ? "toglierei" : "tolte"} ${r.tolte.length} cartelle orfane da ${r.dir}`);
  }
}
