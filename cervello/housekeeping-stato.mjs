#!/usr/bin/env node
// 🗄️ housekeeping-stato.mjs — sposta le voci più vecchie di STATO.md nell'archivio, da solo.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE CURA: «me ne accorgo dal cancello, a lavoro finito» (AR-847)
// ─────────────────────────────────────────────────────────────────────────────
// Il controllo che tiene leggibili i testi legge ogni file fino a `TETTO_TESTO` caratteri e poi
// taglia: sopra quella soglia, su quel file, smette di proteggere. `STATO.md` cresce di una voce a
// ogni lotto, e l'unico modo in cui qualcuno se ne accorgeva era il cancello che diventava rosso —
// cioè a lavoro finito, quando la voce era già scritta.
//
// La cadenza è MISURATA, non stimata: primo spostamento il 22/8 (il file era a 345.000 caratteri),
// secondo il 27/8 (200.864). Cinque giorni. E ogni volta lo spostamento era a mano: scegliere il
// taglio, controllare di non perdere niente, riscrivere il rimando. Il lavoro a mano su un file di
// memoria è il posto in cui sbagliare costa di più — e infatti la prima volta ho sbagliato.
//
// Uso:
//   node cervello/housekeeping-stato.mjs            → sposta se serve
//   node cervello/housekeeping-stato.mjs --dry-run  → dice cosa farebbe, non tocca niente
//   node cervello/housekeeping-stato.mjs --json     → l'esito in JSON, per il giro e il Pannello
//
// 🟢 Riversibile: le voci si SPOSTANO, non si cancellano. Niente si riscrive.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { scriviTestoAtomico } from "./scrivi-json.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TETTO_TESTO } from "./cancello-stop.mjs";

const AD_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VIVO = process.env.STATO_FILE || join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");
const ARCHIVIO = process.env.STATO_ARCHIVIO || join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/Archivio/STATO-archivio.md");

/**
 * SOTTO QUESTA SOGLIA NON SI TOCCA NIENTE, e non è il tetto.
 *
 * Si sposta all'80% del campo visivo, non al 100%: arrivare al tetto e poi spostare è esattamente
 * il comportamento di prima — te ne accorgi quando è già tardi. Il margine è lo spazio per le voci
 * che nasceranno prima della prossima passata.
 */
export const SOGLIA = Math.floor(TETTO_TESTO * 0.8);

/** Dove si mira quando si sposta: metà campo, così non si ritorna sotto soglia al lotto dopo. */
export const BERSAGLIO = Math.floor(TETTO_TESTO * 0.5);

/** L'intestazione della sezione sotto cui vivono le voci storiche. */
export const SEZIONE = "## Passaggi precedenti";

/** Il rimando all'archivio in fondo: si rigenera a ogni passata, non si conserva. */
const APRE_RIMANDO = /^>\s*📦\s*\*\*Le voci piu/;

/**
 * Una VOCE comincia con una riga di citazione che apre con un'emoji e una data in grassetto.
 *
 * Perché non i separatori `---`: nel file vero ce ne sono due in tutta la sezione, e tagliare lì
 * darebbe blocchi da 45.000 caratteri l'uno. Misurato il 27/8: 54 voci contro 3 blocchi.
 */
const APRE_VOCE = /^>\s*\p{Extended_Pictographic}️?\s*\*\*/u;

/**
 * SPACCA IL FILE IN TRE: la testa che non si tocca mai, le voci, il rimando finale.
 *
 * La testa contiene il frontmatter e «I numeri chiave», che stanno in cima APPOSTA — il file stesso
 * lo dice: prima erano in fondo dentro una voce di agosto, e archiviando sarebbero spariti
 * portandosi dietro il numero che tre controlli usano per capire se l'attività è ferma. Qui la
 * testa è tutto ciò che precede `## Passaggi precedenti`, intestazione compresa.
 *
 * 🟢 Pura: riceve il testo, non legge niente. Una prova la può eseguire su un file finto.
 *
 * @param {string} testo il contenuto di STATO.md
 * @returns {{testa: string[], voci: string[][], rimando: string[], leggibile: boolean, motivo: string|null}}
 */
export function spaccaStato(testo = "") {
  const righe = String(testo).split("\n");
  const i = righe.findIndex((r) => r.trim() === SEZIONE);
  if (i === -1) {
    // ⚪ non è un verde e non è un rosso: se non riconosco la forma del file, non ci metto le mani.
    return { testa: righe, voci: [], rimando: [], leggibile: false, motivo: `non trovo «${SEZIONE}»: non riconosco la forma del file e non lo tocco` };
  }
  const testa = righe.slice(0, i + 1);
  const coda = righe.slice(i + 1);
  const inizi = coda.map((r, n) => (APRE_VOCE.test(r) ? n : -1)).filter((n) => n >= 0);
  if (!inizi.length) return { testa: righe, voci: [], rimando: [], leggibile: false, motivo: "nessuna voce riconosciuta sotto la sezione: non tocco niente" };

  const voci = [];
  let rimando = [];
  inizi.forEach((n, k) => {
    const fine = k + 1 < inizi.length ? inizi[k + 1] : coda.length;
    const blocco = coda.slice(n, fine);
    if (APRE_RIMANDO.test(coda[n])) rimando = blocco;
    else voci.push(blocco);
  });
  // Ciò che sta fra l'intestazione e la prima voce (righe vuote, un `---`) resta con la testa.
  testa.push(...coda.slice(0, inizi[0]));
  return { testa, voci, rimando, leggibile: true, motivo: null };
}

/**
 * QUANTE VOCI SPOSTARE: le più vecchie, cioè quelle in fondo, finché si torna sotto il bersaglio.
 *
 * Non si sposta «un numero fisso»: si sposta finché serve. Un numero fisso o sposta troppo poco
 * (e al lotto dopo si è di nuovo sopra) o troppo, e in un file di memoria «troppo» vuol dire
 * togliere dagli occhi di Nicola qualcosa che gli serviva ieri.
 *
 * SI LASCIA SEMPRE ALMENO UNA VOCE. Un file di stato senza nessun passaggio recente non è un file
 * pulito: è un file che ha perso il suo contenuto, e il rimando all'archivio non lo sostituisce.
 *
 * 🟢 Pura: riceve i pezzi, decide, non scrive.
 *
 * @param {{testa: string[], voci: string[][], rimando: string[]}} pezzi
 * @param {{soglia?: number, bersaglio?: number}} tetti
 * @returns {{quante: number, perche: string, dimensione: number}}
 */
export function vociDaSpostare({ testa = [], voci = [], rimando = [] } = {}, { soglia = SOGLIA, bersaglio = BERSAGLIO } = {}) {
  const misura = (n) => [...testa, ...voci.slice(0, voci.length - n).flat(), ...rimando].join("\n").length;
  const ora = misura(0);
  if (ora < soglia) return { quante: 0, perche: `${ora} caratteri, sotto la soglia di ${soglia}: non c'è niente da spostare`, dimensione: ora };
  let n = 0;
  while (n < voci.length - 1 && misura(n) > bersaglio) n++;
  return { quante: n, perche: `${ora} caratteri sopra la soglia di ${soglia}: sposto ${n} voci per tornare intorno a ${bersaglio}`, dimensione: misura(n) };
}

/** Il rimando che va in fondo al file vivo. Si rigenera: non conserva quello di prima. */
export function rimandoDa(quante, dimensionePrima) {
  return [
    "",
    "---",
    "",
    "> 📦 **Le voci piu' vecchie sono nell'archivio.** Questo file era arrivato a",
    `> ${dimensionePrima.toLocaleString("it-IT")} caratteri. Sopra i ${TETTO_TESTO.toLocaleString("it-IT")} il controllo che tiene leggibili`,
    "> i testi non riesce a leggerlo intero, quindi su questo file smetteva di",
    `> proteggerlo. Le ${quante} voci piu' vecchie stanno in`,
    "> `MyCity-Vault/90-Memoria-AI/Archivio/STATO-archivio.md`, spostate senza",
    "> riscrivere niente.",
  ];
}

/**
 * Che cosa dire dopo le due scritture — funzione PURA: riceve da fuori la risposta del mondo
 * (che cosa ha scritto davvero il freno della memoria) invece di andarsela a prendere.
 *
 * Serve perche' lo stato interessante — l'archivio scritto e il file vivo no — si raggiunge solo
 * con una combinazione di percorsi e interruttori che da un test non si puo' allestire: il freno
 * decide guardando la radice VERA del repo, e quella non si sposta da un env. Una prova che
 * provasse a montarla dovrebbe scrivere dentro il vault vero, o dipendere da quanto e' lungo
 * STATO.md oggi — cioe' sarebbe una prova che passa o fallisce a seconda del mondo, non del codice.
 * Cosi' invece i quattro casi si scrivono tutti, e nessuno tocca niente.
 *
 * I tre esiti, e perche' sono diversi:
 *   · il freno ha detto no subito       → ⚪ non ho spostato niente, ed e' giusto cosi' (uscita 0)
 *   · archivio scritto, vivo no         → le voci sono DOPPIE: non e' una perdita, ma non e' un
 *                                          lavoro fatto, e va tolto a mano (uscita 2)
 *   · tutt'e due scritti                → spostate davvero (uscita 0)
 */
export function esitoScritture({ scrittoArchivio, scrittoVivo, quante = 0, prima = 0, dimensione = 0 } = {}) {
  if (!scrittoArchivio) {
    return { ok: true, secco: true, spostate: 0, dimensione: prima, messaggio: "⚪ il freno di scrittura dice di no (sola lettura o memoria deviata): non ho spostato niente", codice: 0 };
  }
  if (!scrittoVivo) {
    return { ok: false, spostate: 0, dimensione: prima, prima, messaggio: `⚠️ le voci sono finite in archivio ma STATO.md non si e' lasciato riscrivere: adesso sono DOPPIE, non spostate. Togli a mano le ${quante} voci piu' vecchie da STATO.md, oppure l'ultimo blocco dall'archivio.`, codice: 2 };
  }
  return { ok: true, spostate: quante, dimensione, prima, messaggio: `🗄️ spostate ${quante} voci in archivio: STATO.md da ${prima} a ${dimensione} caratteri`, codice: 0 };
}

function main() {
  const argv = process.argv.slice(2);
  const secco = argv.includes("--dry-run");
  const json = argv.includes("--json");
  const dillo = (o) => {
    if (json) console.log(JSON.stringify(o, null, 2));
    else console.log(o.messaggio);
    process.exitCode = o.codice ?? 0;
  };

  if (!existsSync(VIVO)) return dillo({ ok: true, spostate: 0, messaggio: `⚪ ${VIVO} non c'è: niente da fare`, codice: 0 });

  const testo = readFileSync(VIVO, "utf8");
  const pezzi = spaccaStato(testo);
  if (!pezzi.leggibile) return dillo({ ok: true, cieco: true, spostate: 0, messaggio: `⚪ ${pezzi.motivo}`, codice: 2 });

  const d = vociDaSpostare(pezzi);
  if (!d.quante) return dillo({ ok: true, spostate: 0, dimensione: d.dimensione, messaggio: `✅ STATO.md ${d.perche}`, codice: 0 });

  const vecchie = pezzi.voci.slice(pezzi.voci.length - d.quante);
  const restano = pezzi.voci.slice(0, pezzi.voci.length - d.quante);
  const prima = [...pezzi.testa, ...pezzi.voci.flat(), ...pezzi.rimando].join("\n").length;
  const nuovo = [...pezzi.testa, ...restano.flat(), ...rimandoDa(d.quante, prima)].join("\n");

  if (secco) return dillo({ ok: true, secco: true, spostate: d.quante, dimensione: d.dimensione, messaggio: `🔍 sposterei ${d.quante} voci: ${d.perche}`, codice: 0 });

  // ⚠️ L'ORDINE DI SCRITTURA È UNA SCELTA: prima l'archivio, poi il file vivo.
  //
  // Se il processo muore in mezzo — il server che si spegne, il disco pieno — le voci stanno in
  // tutt'e due i file: duplicate, non perse. È il verso giusto in cui rompersi. Scrivendo prima il
  // vivo, la stessa morte le farebbe sparire, e su un file di memoria sparire è irreversibile.
  mkdirSync(dirname(ARCHIVIO), { recursive: true });
  // In coda all'archivio, nell'ordine in cui stavano: l'archivio è storia, e la storia non si
  // riscrive. Se non c'è ancora, nasce con la sua intestazione.
  const testa = existsSync(ARCHIVIO)
    ? readFileSync(ARCHIVIO, "utf8").replace(/\s*$/, "")
    : "# STATO — voci archiviate\n\n> Le voci uscite da STATO.md quando il file superava il campo visivo del\n> controllo di leggibilità. Spostate senza riscrivere niente.";
  // La penna condivisa, non un writeFileSync crudo: scrive su un temporaneo e poi rinomina, cosi
  // una morte a meta' non lascia uno STATO.md tagliato in due. E fa passare le due scritture dal
  // freno di AR-668, che e' quello che decide se e dove si scrive davvero (in sola lettura: da
  // nessuna parte). Torna null quando il freno dice di no, e allora non abbiamo spostato niente.
  const scrittoArchivio = scriviTestoAtomico(
    ARCHIVIO,
    `${testa}\n\n${vecchie.map((v) => v.join("\n").replace(/\s*$/, "")).join("\n\n")}\n`,
  );
  const scrittoVivo = scrittoArchivio ? scriviTestoAtomico(VIVO, `${nuovo.replace(/\s*$/, "")}\n`) : null;
  dillo(esitoScritture({ scrittoArchivio, scrittoVivo, quante: d.quante, prima, dimensione: d.dimensione }));
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) main();
