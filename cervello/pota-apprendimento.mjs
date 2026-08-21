#!/usr/bin/env node
// 🌿 POTATORE DELL'ARCHIVIO — AR-254 (metà b) / AR-199.
//
// Il fix di AR-254 ha due metà. La prima è nel Pannello: un `.json` non si tronca mai, e se non entra
// lo si DICE. Questa è la seconda: il file deve rientrare davvero, altrimenti la Cabina dirà per
// sempre «archivio non leggibile» — meglio del silenzio di prima, ma non è ancora imparare.
//
// Misurato il 28/7: `apprendimento.json` = 1.111.673 caratteri contro un tetto di lettura di
// 1.000.000. Togliere le 211 chiavi di servizio `_*` recupera 114.047 byte e porta a 1.017.222 —
// **non basta**. Servono anche le lezioni decadute, che oggi restano nel file per sempre.
//
// Regola: **si pota solo ciò che è già morto o è rumore di servizio.** Una lezione ATTIVA non si
// tocca — potare la memoria viva per far entrare un file è esattamente il difetto che AR-182 stava
// per causare da solo. E ogni potatura dichiara cosa ha tolto: un archivio che si sfoltisce in
// silenzio è indistinguibile da uno che perde pezzi.
//
// 🟢 Sola lettura senza `--applica`. Con `--applica` scrive SOLO nella memoria dell'AI
// (MyCity-Vault/90-Memoria-AI/), che è la sua, e tiene lo storico di ciò che ha tolto.
//
// Uso:
//   node cervello/pota-apprendimento.mjs             -> cosa toglierebbe (nessuna scrittura)
//   node cervello/pota-apprendimento.mjs --json      -> report JSON
//   node cervello/pota-apprendimento.mjs --applica   -> pota davvero (🟡)
//   node cervello/pota-apprendimento.mjs --se-serve  -> pota SOLO se l'archivio è vicino al muro
//                                                       (sopra il 95% del tetto); sotto, non scrive.
//                                                       È la forma per il giro (AR-416): il potatore
//                                                       esisteva e non lo lanciava nessuno — l'11/8 il
//                                                       muro è arrivato davvero (1.070.609 > 1.048.576)
//                                                       e il test del cervello è diventato rosso in
//                                                       entrambe le case. Potare PRIMA del muro evita
//                                                       che la scheda Apprendimento smetta di leggersi
//                                                       fra un giro e l'altro.
//
// Exit: 0 = sotto il tetto (o già a posto) · 1 = ancora sopra il tetto dopo la potatura · 2 = cieco

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { timbroOra } from "./ora-piacenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
const FILE = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
const STORICO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento-potato.json");
// Lo stesso tetto che usa chi legge (pannello/src/lib/obsidian.ts::MAX_LETTURA): il limite VERO
// della Contents API di GitHub. Due numeri diversi qui e là sarebbero due metri per la stessa cosa.
const TETTO = Number(process.env.APPRENDIMENTO_TETTO || 1_048_576);
const JSON_MODE = process.argv.includes("--json");
const SE_SERVE = process.argv.includes("--se-serve");
const APPLICA = process.argv.includes("--applica");

/**
 * La potatura preventiva scatta ORA? Sopra il 95% del tetto sì, sotto no.
 *
 * Il margine non è estetica: fra il momento in cui il file supera il muro e il giro successivo la
 * Cabina non riesce più a leggere l'archivio (è successo l'11/8). Il 5% del tetto (~52 KB, una
 * ventina di lezioni) è il cuscino perché la potatura arrivi sempre PRIMA del muro, mai dopo.
 */
export function serveOra(prima, tetto = TETTO) {
  return Number(prima) > tetto * 0.95;
}

/**
 * L'indentazione VERA del file servito (AR-471).
 *
 * Il potatore misurava sempre `JSON.stringify(…, null, 2)`, ma `apprendimento.json` è scritto a UNO
 * spazio: su un file da un mega la differenza è ~40 KB, cioè il 4% del tetto. Il 31/7 il file reale
 * pesava 1.008.675 byte — quarantamila sotto il limite — e il potatore diceva «non entra, mancano 129
 * byte», dando un verdetto su un file che non esiste. Una misura che non guarda la cosa misurata è la
 * stessa malattia del canale muto, vista dall'altro lato: lì il verdetto non arrivava, qui arriva ma
 * riguarda qualcos'altro.
 */
export function indentazioneDi(testo = "") {
  const m = /^\{\r?\n([ \t]+)"/.exec(String(testo));
  return m ? m[1].length : 2;
}

/**
 * LA COPIA, non la memoria — 4/8/2026.
 *
 * Misurato quella sera, mentre l'archivio sforava il tetto di 718 byte: **86 dei 87 `principi`
 * ripetono parola per parola il `testo` della lezione con lo stesso id, che è già nel file due righe
 * più su.** Novantottomila caratteri di copia, cioè 137 volte lo sforamento. Quando una lezione viene
 * promossa, `cristallizza-apprendimento.mjs` la marca `stato: "principio"` E ne appende una copia in
 * `principi`: due case per la stessa verità, dentro lo stesso file.
 *
 * Perché questa è la potatura giusta e non tradisce la regola di sopra («una lezione ATTIVA non si
 * tocca»): non si toglie nessuna lezione. Si toglie il DOPPIONE, e resta il riferimento — id, data di
 * promozione, reparto, tag. Il testo si ritrova dov'era già: nella lezione con quell'id. Chi serve i
 * principi lo rimette al suo posto leggendolo da lì (`api/memoria/auto-coscienza/route.ts`), e chi li
 * conta li conta uguale.
 *
 * Il confronto è per uguaglianza esatta, di proposito. Se un principio è stato riscritto dopo la
 * promozione, il suo testo NON è più quello della lezione: quella è una versione diversa, e buttarla
 * via sarebbe perdere memoria per far entrare un file. Resta dov'è (1 su 87, il 4/8).
 */
export function principiSenzaCopia(principi = [], lezioni = []) {
  const perId = new Map();
  for (const l of lezioni) if (l && l.id) perId.set(String(l.id), l);
  let caratteri = 0;
  let quanti = 0;
  const nuovi = (Array.isArray(principi) ? principi : []).map((p) => {
    if (!p || typeof p !== "object" || !p.id || typeof p.testo !== "string") return p;
    const lezione = perId.get(String(p.id));
    if (!lezione || lezione.testo !== p.testo) return p;
    quanti++;
    caratteri += p.testo.length;
    const { testo, ...senzaTesto } = p;
    return senzaTesto;
  });
  return { principi: nuovi, quanti, caratteri };
}

export function pianoPotatura(dati, tetto = TETTO, indent = 2) {
  const j = dati && typeof dati === "object" ? dati : {};
  const lezioni = Array.isArray(j.lezioni) ? j.lezioni.filter(Boolean) : [];
  const chiaviServizio = Object.keys(j).filter((k) => k.startsWith("_") && k !== "_cosa_e");
  // Le decadute hanno già smesso di contare: restano nel file solo perché nessuno le toglie.
  const decadute = lezioni.filter((l) => l.stato === "decaduta");
  const vive = lezioni.filter((l) => l.stato !== "decaduta");
  const prima = Buffer.byteLength(JSON.stringify(j, null, indent));
  const copie = principiSenzaCopia(j.principi, vive);
  const dopoObj = { ...j, lezioni: vive };
  if (Array.isArray(j.principi)) dopoObj.principi = copie.principi;
  for (const k of chiaviServizio) delete dopoObj[k];
  const dopo = Buffer.byteLength(JSON.stringify(dopoObj, null, indent));
  return {
    prima,
    dopo,
    tetto,
    entra: dopo <= tetto,
    chiavi_servizio: chiaviServizio.length,
    lezioni_totali: lezioni.length,
    lezioni_decadute: decadute.length,
    lezioni_vive: vive.length,
    principi_deduplicati: copie.quanti,
    principi_caratteri_liberati: copie.caratteri,
    // Le vive NON si toccano: se anche togliendo tutto il resto non si entra, lo si dice e basta.
    residuo: Math.max(0, dopo - tetto),
    nuovo: dopoObj,
    tolte: {
      chiavi: chiaviServizio,
      lezioni: decadute.map((l) => ({ id: l.id, testo: String(l.testo || "").slice(0, 90) })),
      // Non è una perdita ed è giusto che si veda lo stesso: chi legge lo storico deve poter
      // ricostruire cosa conteneva il file prima, senza fidarsi di questa riga di commento.
      copie_di_principi: copie.quanti,
    },
  };
}

function main() {
  if (!existsSync(FILE)) {
    console.error("⚠️  POTATORE CIECO: apprendimento.json non trovato.");
    process.exit(2);
  }
  let j, grezzo;
  try {
    grezzo = readFileSync(FILE, "utf8");
    j = JSON.parse(grezzo);
  } catch (e) {
    console.error(`⚠️  POTATORE CIECO: apprendimento.json non è JSON valido (${e.message}).`);
    process.exit(2);
  }

  // Misuro con l'indentazione VERA del file, non con una a caso (AR-471).
  const p = pianoPotatura(j, TETTO, indentazioneDi(grezzo));
  const fmt = (n) => n.toLocaleString("it");

  // --se-serve: la strada del giro. Sotto la soglia non si scrive un byte e non si sporca lo
  // storico; sopra, si pota come con --applica. Un ramo esplicito, non un default cambiato:
  // chi chiama --applica a mano continua ad avere esattamente il comportamento di prima.
  const applicaOra = APPLICA || (SE_SERVE && serveOra(p.prima, TETTO));
  if (SE_SERVE && !applicaOra) {
    console.log(
      `🌿 POTATURA — non serve: ${fmt(p.prima)} byte, sotto la soglia del 95% del tetto (${fmt(Math.round(TETTO * 0.95))}). Nessuna scrittura.`,
    );
    process.exit(0);
  }

  if (JSON_MODE) {
    const { nuovo, ...senzaDati } = p;
    console.log(JSON.stringify(senzaDati, null, 2));
  } else {
    console.log(`🌿 POTATURA DELL'ARCHIVIO — ${applicaOra ? "APPLICO" : "cosa toglierei"}\n`);
    console.log(`   Adesso:            ${fmt(p.prima)} byte   (tetto di lettura ${fmt(p.tetto)})`);
    console.log(`   Chiavi di servizio: ${p.chiavi_servizio} (note di metabolizzazione, gate, consolidamenti — nessuna schermata le mostra)`);
    console.log(`   Lezioni:            ${p.lezioni_totali} totali · ${p.lezioni_decadute} decadute (si tolgono) · ${p.lezioni_vive} vive (NON si toccano)`);
    console.log(`   Principi in copia:  ${p.principi_deduplicati} ripetevano il testo della loro lezione (${fmt(p.principi_caratteri_liberati)} caratteri) — resta il riferimento, il testo si legge dalla lezione`);
    console.log(`   Dopo:              ${fmt(p.dopo)} byte`);
    console.log(
      p.entra
        ? `   ✅ rientra sotto il tetto: la scheda Apprendimento torna a leggersi.`
        : `   ❌ NON rientra: mancano ancora ${fmt(p.residuo)} byte. Le lezioni vive non si potano per far entrare un file — serve alzare il tetto di lettura o spostare l'archivio fuori dal JSON servito.`
    );
  }

  if (applicaOra) {
    // La storia non si perde: ciò che tolgo finisce in un file suo, con la data.
    const precedente = existsSync(STORICO) ? JSON.parse(readFileSync(STORICO, "utf8")) : { potature: [] };
    precedente.potature = precedente.potature || [];
    precedente.potature.unshift({
      quando: timbroOra(),
      byte_prima: p.prima,
      byte_dopo: p.dopo,
      tolte: p.tolte,
    });
    scriviJsonAtomico(STORICO, precedente);
    // Il potatore è l'unico che toglie APPOSTA, e lo dichiara: senza questo permesso il freno di
    // AR-296 metà ② gli rimetterebbe dentro tutto ciò che ha appena potato (memoria-senza-perdite.mjs).
    scriviJsonAtomico(FILE, p.nuovo, process.env, { dichiaraRimozioni: true });
    console.log(`\n   Scritto: ${FILE}\n   Storico di ciò che ho tolto: ${STORICO}`);
  }

  process.exit(p.entra ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
