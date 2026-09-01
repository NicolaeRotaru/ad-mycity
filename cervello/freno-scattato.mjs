#!/usr/bin/env node
// 🛑 IL FRENO CHE SCATTA — segna una lezione come usata QUANDO MI HA FERMATA, non quando te l'ho mostrata.
//
// PERCHÉ ESISTE. Nicola, 18/8, guardando la Cabina: «perché c'è solo il 12% delle lezioni citate?».
// Misurato: 61 lezioni su 521 contano come applicate, e di quelle 61 solo SEI portano una traccia
// esplicita. Le altre 55 contano perché il loro codice capita di comparire in un file recente. Cioè
// il numero misurava le CITAZIONI, non gli inciampi evitati — e la marcatura vera era un comando a
// mano (`tasso-lezioni.mjs applica`) che quasi nessuno lanciava.
//
// LA SCORCIATOIA CHE NON PRENDIAMO, scritta qui perché non venga presa domani: far segnare ogni
// lezione che la scheda CONSEGNA. Il numero salirebbe a quasi 100% in un giorno e sarebbe una bugia
// — misurerebbe «te l'ho mostrata», non «mi ha fermata». È l'asticella di Nicola del 10/8: «fatto»
// vuol dire che un comportamento è cambiato, non che una parola compare in un file.
//
// IL SEGNALE ONESTO. Ogni lezione seria porta un freno: un comando che diventa ROSSO se l'errore
// torna. Quando quel comando fallisce, quella lezione mi ha appena fermata — è un fatto osservabile,
// non un'opinione. Questo modulo marca l'uso SOLO su quel fallimento. Su verde non scrive niente.
//
// LA CHIAVE, e il suo limite dichiarato. Un freno è quasi sempre una PROVA (`cervello/test/X.test.mjs`)
// mentre chi mi blocca in faccia è il GUARDIANO (`cervello/X.mjs`). Sono due file, un mestiere solo:
// la chiave è il nome dello script senza `test/` e senza `.test`. Quindi il sorvegliante che rifiuta
// una modifica marca le lezioni il cui freno è la prova del sorvegliante. È un'euristica, ed è per
// questo che sta scritta: può unire due file che si chiamano uguale e fanno cose diverse.
//
// COSA NON PUÒ VEDERE, per non spacciarlo per completo. Due buchi, dichiarati:
//   ① la volta in cui una lezione mi ha evitato l'errore in silenzio, senza che nessun freno
//      scattasse. Invisibile per costruzione, e va bene così: meglio un numero piccolo e vero.
//   ② i blocchi che arrivano dagli HOOK (`mano-fermata` prima di una scrittura, `sorvegliante` sul
//      delta, `cancello-stop` a fine turno). Sono i più frequenti — in una sola sessione mi hanno
//      fermata una decina di volte — e NON passano da qui: girano fuori da `guardiano()` e da
//      `esegui()`. Agganciarli vorrebbe dire scrivere nell'archivio a ogni singola modifica di file,
//      sul percorso più caldo della macchina: latenza su ogni gesto e due processi che scrivono lo
//      stesso file insieme. Scelta: non li aggancio adesso, e lo scrivo qui invece di lasciar
//      credere che il conto li comprenda. Il sorvegliante è coperto solo quando gira come controllo
//      del cancello (riga «sorvegliante del delta»), non quando rifiuta una modifica in faccia.
//
// Uso:
//   node cervello/freno-scattato.mjs "<comando o script>" --rc <n> [--ref "<perché>"]
//   node cervello/freno-scattato.mjs "<comando>" --rc 1 --secco   # mostra chi marcherebbe, non scrive
//
// 🟢 Su rc 0 non tocca niente. Su rc≠0 scrive solo dentro `usi` delle lezioni interessate.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { scriviJsonAtomico } from "./scrivi-json.mjs";

export const APPR_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

/**
 * La chiave di un freno: il nome dello script, senza cartella `test/` e senza `.test`.
 * `node --test cervello/test/sorvegliante.test.mjs` e `cervello/sorvegliante.mjs` → «sorvegliante».
 * Torna null se nel comando non c'è nessuno script riconoscibile: senza chiave non si marca niente.
 */
export function chiaveFreno(comando) {
  const c = String(comando || "");
  const m = c.match(/([\w./-]*\/)?([\w.-]+?)\.(?:m?js|cjs|sh)\b/);
  if (!m) return null;
  const nome = m[2].replace(/\.test$/, "").trim();
  return nome || null;
}

/** Le lezioni il cui freno ha la stessa chiave del comando fallito. */
export function lezioniDelFreno(lezioni = [], comando = "") {
  const chiave = chiaveFreno(comando);
  if (!chiave) return [];
  return lezioni.filter((l) => {
    const g = typeof l?.gate === "string" ? l.gate : "";
    return g && chiaveFreno(g) === chiave;
  });
}

/** Quante volte serve vedere lo STESSO riferimento su una lezione perché il diario dica qualcosa:
 *  la prima volta (quando ha cominciato a fermarci) e l'ultima (se ci ferma ancora). Le trecento
 *  in mezzo non aggiungono niente che qualcuno legga, e pesano. */
const USI_PER_RIFERIMENTO = 2;

/**
 * Il diario `usi` di una lezione, ridotto a ciò che qualcuno legge davvero.
 *
 * ⚠️ Perché esiste. Questo diario cresceva SENZA TETTO dentro un file che il tetto ce l'ha
 * (`apprendimento.json`, un mega). Ogni giro in cui un freno diventa rosso ci scrive una riga, e
 * la difesa contro i doppioni guarda (riferimento, minuto): due rossi dello stesso guardiano a due
 * minuti di distanza sono due righe. Misurato il 30/8: tre lezioni ne portavano 42 a testa, quasi
 * tutte con lo stesso `ref`, e il file ha sforato il tetto di 279 byte — a quel punto il potatore
 * esce 1 e la prova che difende sei schede chiuse diventa rossa. Compattando: 1.048.855 → 1.015.857.
 *
 * Di ogni riferimento restano il PRIMO uso e l'ULTIMO, e l'ultimo porta `volte` col conto vero.
 * Così i quattro che leggono questo campo trovano ancora quello che cercano:
 *   · `lezione-viva.ultimoUsoDi` vuole la data più recente → l'ultimo c'è;
 *   · `tasso-lezioni` chiede «c'è un uso con questo ref?» → il ref c'è;
 *   · `volano-numeri` guarda `usi.length` → non va mai a zero;
 *   · qui dentro, la difesa contro i doppioni confronta (ref, quando) → l'ultimo è quello di adesso.
 * Quello che si perde sono le ripetizioni in mezzo, e il conto `volte` le dichiara invece di
 * fingere che non ci siano mai state.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 🔢 TRE COSE SBAGLIATE NELLA PRIMA STESURA — AR-898, trovate dal collaudo di sicurezza il 31/8
 * ─────────────────────────────────────────────────────────────────────────────
 * ① `volte` MENTIVA, e per il ~50%. Il primo uso veniva tenuto in lista E contato dentro il
 *    `volte` dell'ultimo, quindi la somma era sempre il vero + 1 — e siccome si ricompatta a ogni
 *    scrittura, l'errore si SOMMAVA. Misurato: ventuno usi veri, trentadue dichiarate. In una casa
 *    dove il metro è «nessun numero senza fonte», il commento qui sopra prometteva «il conto vero»
 *    e nel file vivo c'erano già numeri gonfiati. Adesso `volte` conta solo da `lista[1]` in poi,
 *    perché `lista[0]` sta lì e si conta da sé.
 *
 * ② L'ORDINE si faceva confrontando testo. Una riga con un `quando` che non è una data — «in
 *    corso», una stringa vuota, un formato diverso — finiva per sempre in fondo, cioè diventava
 *    «l'ultimo uso» per sempre, e da lì in poi ogni uso NUOVO veniva potato appena scritto: la
 *    difesa contro i doppioni non sarebbe più scattata, il comando avrebbe continuato a dire
 *    «marcata» e sul disco non sarebbe rimasto niente. ⚪ Nel file vero i `quando` sono tutti date
 *    valide e non ho trovato una strada che ne produca uno storto senza costruirlo a mano — quindi
 *    questa metà è una porta chiusa prima che qualcuno ci passi, non un incendio spento. Adesso si
 *    ordina per data vera, e ciò che non è una data vale «vecchissimo»: sta in fondo alla coda, non
 *    in testa al futuro.
 *
 * ③ UN USO-STRINGA si CORROMPEVA: `{ ...lista[ultimo] }` su una primitiva dà `{0:"a",1:"b",…}`.
 *    Nel file vero ci sono due usi-stringa, tutti e due in gruppi da uno, quindi oggi non ci si
 *    arriva — ma «oggi non ci si arriva» non è «non succede». Adesso una primitiva diventa una voce
 *    onesta invece di sbriciolarsi.
 */

/** Quando è successo, in millisecondi. Ciò che non è una data vale «prima di tutto»: una riga
 *  illeggibile non deve poter diventare «l'ultima volta» e potare tutto quello che viene dopo. */
function quandoInNumeri(u) {
  const t = Date.parse(String((u && typeof u === "object" ? u.quando : u) ?? "").replace(" ", "T"));
  return Number.isFinite(t) ? t : -Infinity;
}

/** Un uso tenuto come ULTIMO, col suo conto. Se non è un oggetto non lo si sbriciola: lo si
 *  ricostruisce, perché uno spread su una stringa la trasforma in un dizionario di lettere. */
function ultimoConIlConto(u, ref, volte) {
  if (u && typeof u === "object") return { ...u, volte };
  return { ref, quando: String(u ?? ""), volte };
}

export function compattaUsi(usi) {
  if (!Array.isArray(usi)) return [];
  const perRiferimento = new Map();
  for (const u of usi) {
    const ref = u && typeof u === "object" ? String(u.ref ?? "") : String(u ?? "");
    if (!perRiferimento.has(ref)) perRiferimento.set(ref, []);
    perRiferimento.get(ref).push(u);
  }
  const tenuti = [];
  for (const [ref, lista] of perRiferimento) {
    lista.sort((a, b) => quandoInNumeri(a) - quandoInNumeri(b));
    if (lista.length <= USI_PER_RIFERIMENTO) { tenuti.push(...lista); continue; }
    // AR-898 ①: da `lista[1]` in poi. `lista[0]` resta in lista e si conta da sé — contarlo anche
    // qui vorrebbe dire dichiararlo due volte, a ogni compattazione, per sempre.
    const volte = lista.slice(1).reduce((n, u) => n + (Number(u?.volte) > 0 ? Number(u.volte) : 1), 0);
    tenuti.push(lista[0], ultimoConIlConto(lista[lista.length - 1], ref, volte));
  }
  return tenuti.sort((a, b) => quandoInNumeri(a) - quandoInNumeri(b));
}

/**
 * Puro: torna quante lezioni marcherebbe e quali, senza toccare il disco.
 * Su rc 0 torna sempre lista vuota — un freno verde non è un inciampo evitato.
 */
export function marcatura(dati, comando, { rc = 1, ref = "", quando = "" } = {}) {
  if (Number(rc) === 0) return { marcate: [], motivo: "il freno è verde: non ha fermato niente" };
  const lezioni = Array.isArray(dati?.lezioni) ? dati.lezioni : [];
  const colpite = lezioniDelFreno(lezioni, comando);
  if (!colpite.length) return { marcate: [], motivo: "nessuna lezione ha questo freno" };
  const riferimento = ref || `freno rosso: ${String(comando).trim()}`;
  const marcate = [];
  for (const l of colpite) {
    l.usi = Array.isArray(l.usi) ? l.usi : [];
    // Stessa forma di `tasso-lezioni.mjs applica`, e stessa difesa: due rossi identici nello stesso
    // momento non contano due volte — altrimenti un guardiano rumoroso gonfia il numero da solo.
    const gia = l.usi.some((u) => u && typeof u === "object" && u.ref === riferimento && u.quando === quando);
    if (!gia) {
      l.usi.push({ quando, ref: riferimento });
      // 🔒 Il tetto si applica QUI, nello stesso gesto della scrittura: un diario potato
      // «ogni tanto» torna a sforare fra una potatura e l'altra, e lo scopre il potatore
      // quando non può più farci niente.
      l.usi = compattaUsi(l.usi);
      marcate.push(l.id);
    }
  }
  return { marcate, motivo: marcate.length ? "" : "già marcate in questo istante" };
}

function main(argv) {
  const comando = argv[2] || "";
  const i = argv.indexOf("--rc");
  const rc = i >= 0 ? Number(argv[i + 1]) : 1;
  const j = argv.indexOf("--ref");
  const ref = j >= 0 ? String(argv[j + 1] || "") : "";
  const secco = argv.includes("--secco");
  if (!comando) {
    console.error('Uso: node cervello/freno-scattato.mjs "<comando>" --rc <n> [--ref "<perché>"] [--secco]');
    return 2;
  }
  // Un archivio assente o illeggibile NON diventa un silenzioso «tutto a posto»: si DICE, e si esce
  // con 2, che in questa casa vuol dire «non ho potuto misurare». Chi mi chiama (guardiano() nel giro,
  // esegui() nel cancello) stampa l'avviso e tira dritto col suo verdetto, che resta l'unica cosa che
  // conta per lui. Ingoiare qui sarebbe la malattia `fonte-troncata-letta-per-intera` commessa dentro
  // il pezzo che serve a rendere onesto un numero — e la spazzata dei fratelli me l'ha contestata.
  if (!existsSync(APPR_PATH)) {
    console.error(`⚠️  archivio delle lezioni non trovato (${APPR_PATH}): nessun uso marcato`);
    return 2;
  }
  let dati;
  try {
    dati = JSON.parse(readFileSync(APPR_PATH, "utf8"));
  } catch (e) {
    console.error(`⚠️  archivio delle lezioni illeggibile: ${e?.message || e} — nessun uso marcato`);
    return 2;
  }
  const quando = nowPiacenza();
  const { marcate, motivo } = marcatura(dati, comando, { rc, ref, quando });
  if (!marcate.length) {
    if (secco) console.log(`(niente da marcare: ${motivo})`);
    return 0;
  }
  if (secco) {
    console.log(`marcherebbe ${marcate.length}: ${marcate.join(", ")}`);
    return 0;
  }
  dati.aggiornato = quando;
  scriviJsonAtomico(APPR_PATH, dati); // indentazione conservata dal file (AR-522)
  console.log(`🛑 freno rosso → ${marcate.length} lezione/i marcate usate: ${marcate.join(", ")}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  process.exit(main(process.argv));
}
