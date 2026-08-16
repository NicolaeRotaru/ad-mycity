#!/usr/bin/env node
// 📒 IL LIBRO MASTRO DELLE AZIONI — la prova che una guardia ha davvero guardato.
//
// PERCHÉ ESISTE (Nicola, 16/8: «deve essere capace di analizzare ogni minima azione che fai e
// assicurarsi che la stai facendo giusto»). Dentro un turno ci sono otto guardie agganciate agli
// eventi della sessione. Nessuna di loro lascia scritto COSA ha guardato. Il battito del
// sorvegliante conta gli scatti — 51 in una sessione misurata il 16/8 — e il campo `viste` accanto
// era `{}`. Cioè il numero c'è e il contenuto no.
//
// La conseguenza non è cosmetica. «Ho guardato tutte le mosse» oggi non è né vera né falsa: non
// esiste il posto dove si potrebbe smentirla. E una frase che non si può smentire non è una misura,
// è una rassicurazione — esattamente la forma che questa casa ha già pagato con `misura-cieca.mjs`
// (un verdetto che il canale nasconde) e con AR-455 (un difetto chiuso sulla lettera, non sull'effetto).
//
// LE DUE DOMANDE A CUI QUESTO FILE RISPONDE, e sono diverse:
//   ① quali azioni ho fatto in questo turno, e chi le ha viste → il registro.
//   ② una guardia che TACE ha detto «ok», oppure non è mai arrivata a parlare? → le coppie.
//
// La ② è la mossa 3 concordata con Nicola, e senza la ① non è scrivibile. Il modo per distinguerle
// è uno solo: la guardia apre la sua riga PRIMA di giudicare e la chiude DOPO. Se la riga resta
// aperta, quella guardia è morta a metà — tempo scaduto, processo ucciso, eccezione — e il suo
// silenzio NON vale come via libera. Prima di questo file quel silenzio era indistinguibile da un ✅,
// che è il modo più educato che ha un sistema di mentire.
//
// DOVE VIVE, e perché fuori da git. `cervello/_tmp_libro-mastro.jsonl`, ignorato come il battito
// (AR-464: verificare non deve costare un diff, o l'incentivo diventa non verificare). Il prezzo
// dichiarato è che muore con la copia: la memoria lunga è mestiere di `memoria-guardia.mjs`, non di
// questo file. Una riga per evento, mai riscritta: due hook possono girare insieme, e l'unica
// scrittura che regge la concorrenza senza un lock è l'aggiunta in coda di una riga sola.
//
// COSA NON FA, per scelta. Non giudica. Non blocca. Non decide se una mossa era giusta: registra chi
// l'ha vista e cosa ha risposto. Mettere il giudizio qui dentro vorrebbe dire avere due posti che
// decidono la stessa cosa, e due copie della stessa regola divergono sempre.
//
// USO:
//   node cervello/libro-mastro.mjs              → il riepilogo del turno
//   node cervello/libro-mastro.mjs --buchi       → esce 1 se una guardia non ha chiuso la sua riga
//   node cervello/libro-mastro.mjs --json        → il registro in forma di dati
//   node cervello/libro-mastro.mjs --strumenti   → gli strumenti visti (li legge mappa-copertura.mjs)

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
export const REPO = join(QUI, "..");
export const REGISTRO = "cervello/_tmp_libro-mastro.jsonl";
const ANCORA = "cervello/_tmp_stop-ancora.json";

/**
 * I verdetti che una guardia può dare. Sono cinque e non di più: un elenco chiuso è l'unica cosa che
 * rende contabile il registro. `non_guardata` NON è un verdetto — è l'assenza di verdetto, e la
 * calcola `abbina()`: nessuna guardia può dichiararsi morta da sola.
 */
export const VERDETTI = ["ok", "avvisa", "chiede", "nega", "blocca"];

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzioni pure. Nessuna tocca il disco, così una prova le può eseguire tutte.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La riga con cui una guardia dichiara di essersi svegliata su una mossa.
 * `bersaglio` è il pezzo di mossa che serve a ritrovarla dopo: il file per una modifica, il comando
 * per una shell. Si taglia a 200 caratteri — il registro serve a sapere COSA è stato guardato, non a
 * essere una seconda copia del lavoro.
 */
export function rigaApertura({ id, guardia, evento, strumento, bersaglio = "", turno = "", quando }) {
  return {
    id: String(id),
    fase: "apre",
    guardia: String(guardia),
    evento: String(evento || ""),
    strumento: String(strumento || ""),
    bersaglio: String(bersaglio || "").slice(0, 200),
    turno: String(turno || ""),
    t: quando,
  };
}

/** La riga con cui la stessa guardia dichiara come è finita. Senza questa, la mossa risulta non guardata. */
export function rigaChiusura({ id, verdetto, motivo = "", quando }) {
  return {
    id: String(id),
    fase: "chiude",
    verdetto: VERDETTI.includes(verdetto) ? verdetto : "ok",
    motivo: String(motivo || "").slice(0, 300),
    t: quando,
  };
}

/**
 * Da righe grezze ad azioni. Il campo che conta è `guardata`: falso quando l'apertura non ha trovato
 * la sua chiusura.
 *
 * UNA CHIUSURA ORFANA NON SI BUTTA. Se arriva un `chiude` senza il suo `apre` vuol dire che il
 * registro è stato tagliato o che una guardia sbaglia a chiamare: diventa un'azione con
 * `apertura_mancante`, visibile. Scartarla in silenzio sarebbe la stessa malattia che questo file cura.
 */
export function abbina(righe) {
  const perId = new Map();
  const ordine = [];
  for (const r of righe) {
    if (!r || !r.id) continue;
    if (!perId.has(r.id)) {
      perId.set(r.id, { id: r.id });
      ordine.push(r.id);
    }
    const a = perId.get(r.id);
    if (r.fase === "apre") {
      Object.assign(a, {
        guardia: r.guardia,
        evento: r.evento,
        strumento: r.strumento,
        bersaglio: r.bersaglio,
        turno: r.turno,
        aperta: r.t,
      });
    } else if (r.fase === "chiude") {
      Object.assign(a, { verdetto: r.verdetto, motivo: r.motivo, chiusa: r.t });
    }
  }
  return ordine.map((id) => {
    const a = perId.get(id);
    return {
      ...a,
      guardata: Boolean(a.aperta && a.chiusa),
      apertura_mancante: Boolean(a.chiusa && !a.aperta),
    };
  });
}

/** Solo le azioni di UN turno. Turno vuoto = tutte: un filtro che non sa filtrare non deve svuotare. */
export function delTurno(azioni, turno) {
  if (!turno) return azioni;
  return azioni.filter((a) => a.turno === turno);
}

/**
 * I buchi: le mosse su cui una guardia si è svegliata e non ha mai risposto. È la mossa 3 in una
 * funzione — e il motivo per cui vale la pena avere il registro.
 */
export function buchi(azioni) {
  return azioni.filter((a) => a.aperta && !a.chiusa);
}

/** Il conto che va a schermo: per guardia, per verdetto, e i buchi. */
export function riepilogo(azioni) {
  const perGuardia = {};
  const perVerdetto = {};
  for (const a of azioni) {
    const g = a.guardia || "(ignota)";
    perGuardia[g] = (perGuardia[g] || 0) + 1;
    const v = a.guardata ? a.verdetto || "ok" : "non_guardata";
    perVerdetto[v] = (perVerdetto[v] || 0) + 1;
  }
  return { azioni: azioni.length, per_guardia: perGuardia, per_verdetto: perVerdetto, buchi: buchi(azioni).length };
}

/** Gli strumenti che sono stati usati davvero. È la materia prima di `mappa-copertura.mjs`. */
export function strumentiVisti(azioni) {
  return [...new Set(azioni.map((a) => a.strumento).filter(Boolean))].sort();
}

/**
 * Le righe da un testo JSONL. Una riga illeggibile si SALTA e non porta giù le altre: un registro
 * che si rifiuta di aprirsi per un carattere storto è un registro che nessuno consulta.
 */
export function righeDaTesto(testo) {
  const fuori = [];
  for (const riga of String(testo || "").split("\n")) {
    const t = riga.trim();
    if (!t) continue;
    try {
      fuori.push(JSON.parse(t));
    } catch {
      // Riga corrotta: la salto e vado avanti. Il conto delle azioni sarà più corto del vero, ed è
      // il verso giusto in cui sbagliare — meglio dichiarare meno di quello che ho visto che fingere.
    }
  }
  return fuori;
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — tutto fail-open: una guardia non deve MAI rompersi per colpa del suo registro.
// ─────────────────────────────────────────────────────────────────────────────

let contatore = 0;

/** Il turno corrente, letto dall'ancora che pianta `intento-turno.mjs`. Vuoto se non c'è: non lo invento. */
export function turnoCorrente() {
  try {
    const j = JSON.parse(readFileSync(join(REPO, ANCORA), "utf8"));
    return String(j?.commit || "");
  } catch {
    return ""; // senza ancora le righe restano senza turno: visibili lo stesso, solo non raggruppabili
  }
}

function scrivi(oggetto) {
  try {
    appendFileSync(join(REPO, REGISTRO), JSON.stringify(oggetto) + "\n", "utf8");
    return true;
  } catch {
    return false; // disco pieno o sola lettura: la guardia continua a fare il suo mestiere senza registro
  }
}

/**
 * Apre la riga di una mossa e torna l'id da passare a `chiudi()`. L'id porta il pid perché due hook
 * possono girare nello stesso istante e un contatore da solo li farebbe collidere.
 */
export function annota({ guardia, evento, strumento, bersaglio = "", turno = turnoCorrente() }) {
  const id = `${process.pid}-${++contatore}`;
  scrivi(rigaApertura({ id, guardia, evento, strumento, bersaglio, turno, quando: new Date().toISOString() }));
  return id;
}

/** Chiude la riga aperta da `annota()`. Chiamarla è ciò che distingue un ✅ da un silenzio. */
export function chiudi(id, verdetto, motivo = "") {
  if (!id) return false;
  return scrivi(rigaChiusura({ id, verdetto, motivo, quando: new Date().toISOString() }));
}

/**
 * La scorciatoia per le guardie: fa il lavoro dentro `fn`, e comunque vada chiude la riga.
 * Se `fn` lancia, la riga si chiude con `blocca` e il motivo dell'eccezione — un guasto della guardia
 * resta scritto invece di sparire.
 */
export async function sorvegliata({ guardia, evento, strumento, bersaglio }, fn) {
  const id = annota({ guardia, evento, strumento, bersaglio });
  try {
    const esito = await fn();
    chiudi(id, esito?.verdetto || "ok", esito?.motivo || "");
    return esito;
  } catch (e) {
    chiudi(id, "blocca", `guardia in errore: ${e?.message || e}`);
    throw e;
  }
}

/**
 * Il registro dal disco, CON l'esito della lettura.
 *
 * PERCHÉ NON TORNA UNA LISTA E BASTA. Una lista vuota qui direbbe «zero mosse, zero buchi»: un verde
 * costruito su una fonte che non ho letto, cioè la malattia `fonte-troncata-letta-per-intera`
 * censita in casa. Chi legge deve poter distinguere «non è ancora successo niente» da «non riesco a
 * guardare» — sono due frasi diverse e solo la prima è tranquillizzante.
 */
export function leggiRegistroConEsito() {
  const p = join(REPO, REGISTRO);
  if (!existsSync(p)) return { righe: [], errore: null }; // non ancora nato: non è un guasto
  try {
    return { righe: righeDaTesto(readFileSync(p, "utf8")), errore: null };
  } catch (e) {
    return { righe: [], errore: `registro illeggibile: ${e?.message || e}` };
  }
}

/** La forma comoda per chi il guasto lo gestisce altrove. Chi decide un verdetto usi quella sopra. */
export function leggiRegistro() {
  return leggiRegistroConEsito().righe;
}

// ─────────────────────────────────────────────────────────────────────────────
// LA BOCCA
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const argv = process.argv.slice(2);
  const turno = argv.includes("--tutti") ? "" : turnoCorrente();
  const azioni = delTurno(abbina(leggiRegistro()), turno);

  if (argv.includes("--strumenti")) {
    console.log(strumentiVisti(azioni).join("\n"));
    process.exit(0);
  }

  if (argv.includes("--json")) {
    console.log(JSON.stringify({ turno, azioni, riepilogo: riepilogo(azioni) }, null, 2));
    process.exit(0);
  }

  const r = riepilogo(azioni);
  const vuoti = buchi(azioni);

  if (argv.includes("--buchi")) {
    if (!vuoti.length) {
      console.log(`✅ nessuna guardia rimasta a bocca aperta: ${r.azioni} mosse, tutte con un verdetto.`);
      process.exit(0);
    }
    console.error(`❌ ${vuoti.length} mosse su ${r.azioni} sono passate senza che la guardia rispondesse:`);
    for (const b of vuoti.slice(0, 12)) {
      console.error(`   · ${b.guardia} non ha chiuso su ${b.strumento} → ${b.bersaglio.slice(0, 70)}`);
    }
    console.error("   → una guardia che non risponde NON è una guardia che dice ok: qui non ha guardato nessuno.");
    process.exit(1);
  }

  console.log(`📒 LIBRO MASTRO — ${r.azioni} mosse${turno ? ` in questo turno` : " (tutte)"}`);
  if (!r.azioni) {
    console.log("   (registro vuoto: nessuna guardia ha ancora annotato niente)");
    process.exit(0);
  }
  console.log(`   per guardia:  ${Object.entries(r.per_guardia).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  console.log(`   per verdetto: ${Object.entries(r.per_verdetto).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  console.log(`   strumenti:    ${strumentiVisti(azioni).join(", ") || "(nessuno)"}`);
  if (r.buchi) console.log(`   ⚠️  ${r.buchi} mosse senza verdetto — guardale con --buchi`);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
