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
//
// Comunque vada dice anche CHI OCCUPA IL POSTO che non ha saputo togliere: senza quella riga un
// disco pieno di roba che non conosco e un disco pulito danno lo stesso identico verde.

import { readdirSync, readFileSync, statSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

/**
 * I prefissi scritti a mano. Restano perché due o tre nascono fuori dal codice del cervello, ma NON
 * sono più l'elenco: quello lo legge `prefissiDalCodice()` qui sotto.
 *
 * IL CONTO CHE HA UCCISO L'ELENCO A MANO. Il 21/8, sul server, /tmp era pieno per la seconda volta.
 * Le cartelle che lo riempivano si chiamavano `porta-lezioni-*` — circa duemila, quasi un mega
 * l'una — e questo elenco non le conteneva. Sotto c'erano `due-versi` (4142), `mut-mancante` (2826),
 * `cronicita-giro` (1236) e altre: nessuna qui dentro. **Dieci prefissi dichiarati su
 * centocinquantacinque usati davvero, cioè il 6%.**
 *
 * Un elenco a mano non è una difesa che sta indietro: è una difesa che non c'è. Chi scrive una prova
 * nuova sceglie un nome nuovo e non passa mai di qui — e non ha nessun motivo per passarci.
 */
export const PREFISSI = [
  "mycity-campo-", // finte dei test: sono queste che hanno riempito il disco la prima volta
  "mycity-banco-", // la sabbiera di un giro di prove morto a metà, che non ha fatto in tempo a sgomberarsi
  "cancello-",
  "cadenza-ai-",
  "repo-finto-",
  "non-repo-",
  "allineamento-",
  "sabbiera-",
  "riconcilia-",
  "ripesca-",
];

/** Da dove si legge il codice che crea cartelle temporanee. */
const QUI = dirname(fileURLToPath(import.meta.url));

/** Un prefisso troppo corto matcherebbe mezzo /tmp: sotto questa lunghezza non lo prendo. */
const MINIMO = 4;

/**
 * I prefissi LETTI DAL CODICE che li crea, invece che da un elenco che qualcuno deve ricordarsi di
 * aggiornare.
 *
 * Cerca le due forme con cui in questa casa si crea una cartella temporanea:
 *   · `mkdtempSync(join(tmpdir(), "qualcosa-"))` nei file .mjs
 *   · `mktemp -d -t qualcosa.XXXXXX` negli script .sh
 *
 * Così una prova nuova è coperta il giorno stesso in cui viene scritta, senza che nessuno tocchi
 * questo file. È l'unico modo perché la difesa non stia indietro rispetto a chi la riempie.
 */
export function prefissiDalCodice(radice = QUI) {
  const trovati = new Set();
  const daJs = /mkdtempSync\(\s*join\(\s*tmpdir\(\)\s*,\s*["'`]([^"'`]+)["'`]/g;
  const daSh = /mktemp\s+-d\s+-t\s+"?([A-Za-z0-9._-]+)/g;
  const visita = (dir, resta = { file: 3000 }) => {
    let voci = [];
    try {
      voci = readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // cartella illeggibile: quello che non posso leggere non lo invento
    }
    for (const v of voci) {
      if (resta.file <= 0) return;
      const percorso = join(dir, v.name);
      if (v.isDirectory()) {
        if (v.name === "node_modules" || v.name.startsWith(".")) continue;
        visita(percorso, resta);
        continue;
      }
      if (!/\.(mjs|js|sh)$/.test(v.name)) continue;
      resta.file -= 1;
      let testo = "";
      try {
        testo = readFileSync(percorso, "utf8");
      } catch {
        continue;
      }
      for (const re of [daJs, daSh]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(testo)) !== null) {
          // `mycity-auth.XXXXXX` → `mycity-auth.`: le X sono il segnaposto di mktemp, non il nome.
          const nome = m[1].replace(/X{3,}$/, "");
          if (nome.length >= MINIMO) trovati.add(nome);
        }
      }
    }
  };
  visita(radice);
  return trovati;
}

/** L'elenco vero: quello scritto a mano più quello letto dal codice. */
export function prefissiEffettivi(radice = QUI) {
  return [...new Set([...PREFISSI, ...prefissiDalCodice(radice)])];
}

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

/** Quanti file guardare al massimo dentro una cartella. Oltre, si smette — e LO SI DICE. */
export const TETTO_FILE = 40_000;

/**
 * Quanto pesa davvero una cartella, contando quello che ha dentro.
 *
 * `statSync(cartella).size` NON è questo: su Linux dà la dimensione della VOCE di directory —
 * 4096 byte, sempre uguali, che ci sia dentro un file da 2 KB o un giro di prove da 6 MB. Il
 * referto di prima sommava proprio quel numero e lo chiamava «byte liberati»: una cifra che si
 * muoveva col NUMERO delle cartelle e mai con lo spazio vero. Su un disco pieno è la differenza
 * fra sapere e credere di sapere.
 *
 * ⚠️ IL TETTO SI DICHIARA. C'è un limite di file oltre il quale smetto di contare, perché su una
 * cartella temporanea gonfia potrei restarci dentro dieci minuti. La prima versione, quando lo
 * raggiungeva, usciva dal ciclo e restituiva il totale parziale COME SE FOSSE INTERO: avrei
 * scritto «roba d'altri — 300 MB» su tre giga. È lo stesso difetto che sto riparando da due
 * giorni, scritto da me mentre lo riparavo — e a trovarlo non sono stata io, è stato il guardiano
 * delle malattie ripetute. Adesso il troncamento risale fino alla riga stampata, che dice «almeno».
 *
 * `stato.troncata` diventa vero se il tetto è scattato: chi chiama lo legge e ne parla.
 */
export function pesa(percorso, stato = { file: TETTO_FILE, troncata: false }) {
  let st;
  try {
    st = statSync(percorso);
  } catch {
    // Zero qui vorrebbe dire «pesa niente». La verità è «non sono riuscita a guardarla»: due cose
    // diverse che nel totale hanno la stessa faccia, se non lo dico.
    stato.troncata = true;
    return 0;
  }
  if (!st.isDirectory()) return st.size || 0;
  let tot = 0;
  let voci = [];
  try {
    voci = readdirSync(percorso);
  } catch {
    stato.troncata = true; // permessi di un altro: quello che non posso leggere non lo conto, e lo dico
    return tot;
  }
  for (const v of voci) {
    if (stato.file <= 0) {
      stato.troncata = true;
      break;
    }
    stato.file -= 1;
    tot += pesa(join(percorso, v), stato);
  }
  return tot;
}

/** Il peso di una cartella insieme alla dichiarazione se l'ho contata tutta. */
export function pesaCompleto(percorso, tetto = TETTO_FILE) {
  const stato = { file: tetto, troncata: false };
  const byte = pesa(percorso, stato);
  return { byte, troncata: stato.troncata };
}

/** Quante voci nominare nel referto di chi occupa il posto. Oltre diventa un elenco che nessuno legge. */
export const QUANTE_SCONOSCIUTE = 8;

/**
 * Spazza le cartelle orfane e ritorna il referto.
 *
 * `esegui: false` è la modalità prova: guarda e non tocca. La uso nel test per misurare la
 * SELEZIONE senza dipendere dal fatto che il filesystem cancelli davvero.
 */
export function spazza({ dir = tmpdir(), prefissi = null, oreMin = ORE_DEFAULT, adesso = null, esegui = true, tetto = TETTO_FILE } = {}) {
  // `null` non è «nessun prefisso»: è «chiedili al codice». Un elenco passato a mano resta possibile,
  // e le prove lo usano per misurare la selezione senza dipendere da com'è fatto il repo oggi.
  prefissi = prefissi ?? prefissiEffettivi();
  const ora = adesso ?? Date.now();
  const limite = ora - oreMin * 3600_000;
  const tolte = [];
  const tenute = [];
  const sconosciute = [];
  let byte = 0;
  let troncato = false; // «ho smesso di contare»: non è un dettaglio, cambia il senso di ogni cifra qui sotto

  let voci = [];
  try {
    voci = readdirSync(dir);
  } catch {
    return { dir, tolte, tenute, sconosciute, byte, byteSconosciuti: 0, troncato: false, leggibile: false };
  }

  for (const nome of voci) {
    if (MAI_TOCCARE.some((p) => nome.startsWith(p))) continue; // roba viva: prima di tutto il resto
    if (!prefissi.some((p) => nome.startsWith(p))) {
      // NON è mia, quindi non la tocco — ma la CONTO e la dico. È il buco che ho appena visto sul
      // server: /tmp al 100% e questo attrezzo che stampava «niente da spazzare», cioè un verde
      // perfetto sopra un disco pieno. Quello che non riconosco non sparisce solo perché lo salto.
      sconosciute.push({ nome, ...pesaCompleto(join(dir, nome), tetto) });
      continue;
    }
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
    // Pesata PRIMA di cancellare: dopo non c'è più niente da misurare.
    const suo = pesaCompleto(percorso, tetto);
    if (suo.troncata) troncato = true;
    if (esegui) {
      try {
        rmSync(percorso, { recursive: true, force: true });
      } catch {
        continue; // permessi di un altro utente: la salto, non fingo di averla tolta
      }
    }
    byte += suo.byte;
    tolte.push(nome);
  }

  sconosciute.sort((a, b) => b.byte - a.byte);
  const byteSconosciuti = sconosciute.reduce((t, v) => t + v.byte, 0);
  if (sconosciute.some((v) => v.troncata)) troncato = true;
  return { dir, tolte, tenute, sconosciute, byte, byteSconosciuti, troncato, leggibile: true };
}

const eseguitoDaSolo = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (eseguitoDaSolo) {
  const prova = process.argv.includes("--prova");
  const r = spazza({ esegui: !prova });
  // Un peso si scrive nell'unità in cui si legge: «0.0 MB» su 50 KB è un numero che mente per
  // arrotondamento, ed è proprio il caso in cui vuoi vedere che qualcosa c'era.
  const peso = (b, tronca = false) =>
    `${tronca ? "almeno " : ""}${b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`}`;
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(r, null, 2));
  } else if (!r.leggibile) {
    console.log(`⚪ non ho potuto leggere ${r.dir}`);
  } else {
    if (r.tolte.length === 0) {
      console.log(`✅ niente di mio da spazzare in ${r.dir} (${r.tenute.length} cartelle nostre ancora fresche)`);
    } else {
      console.log(`🧹 ${prova ? "toglierei" : "tolte"} ${r.tolte.length} ${r.tolte.length === 1 ? "cartella orfana" : "cartelle orfane"} da ${r.dir} — ${peso(r.byte, r.troncato)}`);
    }
    // La riga che mancava. Sopra ho detto cosa ho tolto; qui dico cosa RESTA e non è mio, perché è
    // quello che decide se il disco si libera davvero o se la spazzata è stata un gesto a vuoto.
    if (r.sconosciute.length > 0) {
      console.log(`👀 e non è mio, quindi resta lì: ${r.sconosciute.length} ${r.sconosciute.length === 1 ? "voce" : "voci"} per ${peso(r.byteSconosciuti, r.troncato)}`);
      for (const v of r.sconosciute.slice(0, QUANTE_SCONOSCIUTE)) {
        console.log(`   · ${v.nome} — ${peso(v.byte, v.troncata)}`);
      }
    }
  }
}
