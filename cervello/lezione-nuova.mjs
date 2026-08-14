#!/usr/bin/env node
// 📓 LA PORTA DELLE LEZIONI — l'unico punto da cui una lezione entra in memoria. Nato per AR-651.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────────
// IL DIFETTO, in una riga: le lezioni non avevano NESSUN punto di scrittura nel codice.
// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Cercando `lezioni.push` in tutto il repo si trovava zero. Cinquecentodiciotto lezioni scritte, e
// nessuno script che ne scriva una: a scriverle era l'LLM in sessione, aprendo il file e coniando
// l'identificativo **a mano**. Da lì i quattro doppioni di AR-580 — due lezioni diverse con lo stesso
// numero, e alla prima unione dei rami una delle due sparisce senza che nessun conteggio cali.
//
// LA RADICE, che è il motivo per cui il tappo non bastava: il guardiano che LEGGE e segnala gli id
// doppi (lotto 37) arriva dopo. Trova il danno fatto, non lo impedisce. Finché coniare un numero è
// un gesto a mano, l'errore non è un incidente: è la forma normale del lavoro, e si ripeterà ogni
// volta che due sessioni scrivono lo stesso giorno senza vedersi. È la stessa storia di
// `prossimo-ar.mjs` per le schede del cantiere — questo file è il suo gemello per le lezioni.
//
// 🟢 La parte che DECIDE è pura: conia, valida, compone, inserisce. Il disco lo tocca solo la riga di
// comando in fondo, e lo tocca in modo atomico (`scriviJsonAtomico`) conservando l'indentazione che
// il file ha già — questo file ne ha UNO di spazio, e riscriverlo a due lo riscriverebbe tutto.
//
// Uso:
//   node cervello/lezione-nuova.mjs --fonte "correzione di Nicola" \
//        --testo "**Titolo grassetto.** Cosa è successo e cosa è costato." \
//        --regola "la regola riusabile, in una frase" [--gate "node cervello/test/x.test.mjs"]
//   node cervello/lezione-nuova.mjs --prossimo-id      # solo il numero libero, senza scrivere
//   node cervello/lezione-nuova.mjs --secco            # scrive niente e stampa cosa scriverebbe
//
// Uscita (contratto guardiani, AR-322): 0 = scritta · 1 = rifiutata (campi mancanti o id già usato)
// · 2 = non ho potuto leggere l'archivio, quindi NON ho scritto niente.
//
// Prova comportamentale: node cervello/test/porta-delle-lezioni.test.mjs

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { giornoPiacenza, timbroOra } from "./ora-piacenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
export const ARCHIVIO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json";

/** I campi senza i quali una lezione non è una lezione: cosa è successo, cosa se ne impara, da dove. */
export const CAMPI_OBBLIGATORI = Object.freeze(["fonte", "testo", "regola"]);

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ① CONIARE L'IDENTIFICATIVO — il gesto che era a mano, ed è la causa radice
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/** La forma dell'id: `L-<anno>-<mesegiorno>-<progressivo>`, come le 518 che ci sono già. */
export function formaId(giorno, n) {
  const [anno, mese, dì] = String(giorno).split("-");
  return `L-${anno}-${mese}${dì}-${String(n).padStart(2, "0")}`;
}

/**
 * IL NUMERO LIBERO, chiesto e non scelto.
 *
 * Tre regole, e ognuna è un modo in cui il gesto a mano sbagliava:
 *  ① si guarda il progressivo PIÙ ALTO del giorno, non quante lezioni ci sono. Se una sessione ha
 *     scritto la 01 e la 03, «quante ce ne sono» risponde 2 e conia di nuovo la 03.
 *  ② l'id coniato si controlla contro TUTTI gli id esistenti, non solo quelli di oggi: se per
 *     qualsiasi ragione fosse già preso, si sale finché è libero invece di scriverci sopra.
 *  ③ se l'elenco non è una lista, NON si conia: `L-…-01` su una lettura fallita sarebbe il numero
 *     più sbagliato possibile, perché è esattamente quello che esiste già.
 */
export function coniaId(lezioni, giorno) {
  if (!Array.isArray(lezioni)) {
    return { id: null, motivo: "non mi è arrivato un elenco di lezioni: non conio un numero al buio" };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(giorno))) {
    return { id: null, motivo: `«${giorno}» non è un giorno nella forma AAAA-MM-GG: senza il giorno l'id non si può comporre` };
  }
  const presi = new Set(lezioni.map((l) => String(l?.id ?? "")));
  const [anno, mese, dì] = String(giorno).split("-");
  const prefisso = `L-${anno}-${mese}${dì}-`;
  let massimo = 0;
  for (const id of presi) {
    if (!id.startsWith(prefisso)) continue;
    const n = Number(id.slice(prefisso.length));
    if (Number.isFinite(n) && n > massimo) massimo = n;
  }
  let n = massimo + 1;
  let id = formaId(giorno, n);
  while (presi.has(id)) id = formaId(giorno, ++n);
  return { id, motivo: null };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ② COMPORRE LA LEZIONE — e rifiutarla se non è una lezione
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/** Cosa manca perché questa sia una lezione e non un appunto. Torna la lista, non un sì/no. */
export function campiMancanti(campi = {}) {
  return CAMPI_OBBLIGATORI.filter((c) => !String(campi?.[c] ?? "").trim());
}

/**
 * La lezione pronta da inserire, oppure il rifiuto col motivo.
 *
 * Il `gate` non è obbligatorio ma è la differenza fra una lezione e una promessa: CLAUDE.md dice che
 * una correzione di Nicola si chiude con un freno che può fallire, non con una frase. Qui non lo si
 * impone — ci sono lezioni che non hanno un freno scrivibile — ma quando la fonte è una correzione
 * di Nicola la mancanza si DICE, così resta debito dichiarato invece di sparire.
 */
export function componiLezione(campi = {}, lezioni = [], adesso = new Date()) {
  const manca = campiMancanti(campi);
  if (manca.length) {
    return { ok: false, lezione: null, motivo: `manca ${manca.join(", ")}: una lezione senza questo non insegna niente a nessuno` };
  }
  const giorno = campi.giorno || giornoPiacenza(adesso);
  const { id, motivo } = coniaId(lezioni, giorno);
  if (!id) return { ok: false, lezione: null, motivo };
  const lezione = {
    id,
    data: campi.data || timbroOra(adesso),
    fonte: String(campi.fonte).trim(),
    testo: String(campi.testo).trim(),
    regola: String(campi.regola).trim(),
  };
  if (String(campi.gate ?? "").trim()) lezione.gate = String(campi.gate).trim();
  const avvisi = [];
  if (!lezione.gate && /nicola/i.test(lezione.fonte)) {
    avvisi.push("una correzione di Nicola senza `gate` resta una frase: se il freno non è scrivibile, dillo — è debito dichiarato, non lavoro finito");
  }
  return { ok: true, lezione, avvisi, motivo: null };
}

/**
 * L'INSERIMENTO, puro: entra l'archivio, esce l'archivio nuovo. Non tocca quello di partenza.
 *
 * Rifiuta un id già presente invece di sovrascriverlo. Non è teoria: è il difetto di AR-580 — due
 * lezioni diverse con lo stesso numero, e alla fusione dei rami una delle due sparisce mentre il
 * conteggio resta identico, quindi non se ne accorge nessuno.
 */
export function inserisci(archivio, lezione, adesso = new Date()) {
  if (!archivio || typeof archivio !== "object" || !Array.isArray(archivio.lezioni)) {
    return { ok: false, archivio: null, motivo: "l'archivio non ha la forma attesa (serve un oggetto con `lezioni` lista): non ci scrivo dentro" };
  }
  if (archivio.lezioni.some((l) => String(l?.id) === String(lezione?.id))) {
    return { ok: false, archivio: null, motivo: `${lezione?.id} è già usato da un'altra lezione: due lezioni con lo stesso numero fanno sparire una delle due alla prima unione` };
  }
  return {
    ok: true,
    motivo: null,
    archivio: { ...archivio, lezioni: [...archivio.lezioni, lezione], aggiornato: timbroOra(adesso) },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ③ LA RIGA DI COMANDO — l'unico pezzo che tocca il disco
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * L'archivio letto, con l'esito attaccato. Un `catch → {lezioni: []}` qui sarebbe il difetto
 * peggiore di tutti: un file illeggibile diventerebbe «non c'è nessuna lezione», l'id coniato
 * sarebbe il primo del giorno — cioè uno già preso — e la scrittura cancellerebbe 518 lezioni.
 */
export function caricaArchivio(percorso) {
  let testo;
  try {
    testo = readFileSync(percorso, "utf8");
  } catch (e) {
    return { letto: false, archivio: null, motivo: `non sono riuscito a leggere ${percorso}: ${e?.code || e?.message || e}` };
  }
  try {
    const j = JSON.parse(testo);
    if (!j || typeof j !== "object" || !Array.isArray(j.lezioni)) {
      return { letto: false, archivio: null, motivo: `${percorso} non ha la forma attesa: manca la lista delle lezioni` };
    }
    return { letto: true, archivio: j, motivo: null };
  } catch (e) {
    return { letto: false, archivio: null, motivo: `${percorso} non è JSON valido: ${e?.message}` };
  }
}

function main() {
  const argv = process.argv.slice(2);
  const arg = (nome) => {
    const i = argv.indexOf(`--${nome}`);
    return i !== -1 ? argv[i + 1] : "";
  };
  const percorso = process.env.APPRENDIMENTO_FILE || join(REPO, ARCHIVIO);

  const letto = caricaArchivio(percorso);
  if (!letto.letto) {
    console.error(`⚪ ${letto.motivo}`);
    console.error("   NON ho scritto niente: su un archivio che non so leggere, coniare un numero vuol dire riusarne uno.");
    process.exit(2);
  }

  if (argv.includes("--prossimo-id")) {
    const { id, motivo } = coniaId(letto.archivio.lezioni, giornoPiacenza());
    if (!id) {
      console.error(`⚪ ${motivo}`);
      process.exit(2);
    }
    console.log(id);
    console.error(`   (libero fra le ${letto.archivio.lezioni.length} lezioni già scritte)`);
    process.exit(0);
  }

  const composta = componiLezione(
    { fonte: arg("fonte"), testo: arg("testo"), regola: arg("regola"), gate: arg("gate") },
    letto.archivio.lezioni
  );
  if (!composta.ok) {
    console.error(`❌ ${composta.motivo}`);
    console.error("   Uso: node cervello/lezione-nuova.mjs --fonte \"…\" --testo \"…\" --regola \"…\" [--gate \"node cervello/test/x.test.mjs\"]");
    process.exit(1);
  }
  for (const a of composta.avvisi || []) console.error(`⚠️  ${a}`);

  const dopo = inserisci(letto.archivio, composta.lezione);
  if (!dopo.ok) {
    console.error(`❌ ${dopo.motivo}`);
    process.exit(1);
  }

  if (argv.includes("--secco")) {
    console.log(JSON.stringify(composta.lezione, null, 2));
    console.error(`   (prova a vuoto: non ho scritto in ${percorso})`);
    process.exit(0);
  }

  scriviJsonAtomico(percorso, dopo.archivio);
  console.log(composta.lezione.id);
  console.error(`   scritta in ${percorso} — ora sono ${dopo.archivio.lezioni.length} lezioni.`);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
