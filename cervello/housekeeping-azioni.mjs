#!/usr/bin/env node
// 🧹 housekeeping-azioni.mjs — sposta le card ✅/❌ di AZIONI-IN-ATTESA.md in archivio
//
// Uso:
//   node cervello/housekeeping-azioni.mjs            → esegue la pulizia
//   node cervello/housekeeping-azioni.mjs --dry-run  → mostra cosa farebbe, non tocca niente
//
// Quando gira: chiamato da giro.sh ogni SOGLIA_CARD_CHIUSE card accumulate.
// Non produce errori: se il file non esiste o è già pulito, esce in silenzio.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

// RISPOSTA AL SORVEGLIANTE, che su questo file ha alzato la voce del RAGGIO quattro volte.
//
// La domanda era giusta: 72 file poggiano su questo, e cambiargli sotto il significato è la forma di
// AR-338, AR-344 e AR-415. Sono andato a guardare invece di scrollare le spalle, e la risposta è che
// nessuno legge la FORMA del rimando tranne uno:
//   · `cervello/mutanti.json` — la mutazione di AR-807 («la coda smette di dire dove sono finite le
//     carte chiuse») era puntata sulla riga vecchia. Ri-puntata in questo stesso lotto: 13 su 13
//     tornano rosse quando devono.
//   · `cervello/giro.sh` — invoca lo script e legge due righe di log, la cui forma non ho toccato.
//   · `cervello/censimento-guardiani.mjs` — una riga di descrizione, ancora vera.
//   · `senzaRimandoFinale` è nata adesso: non la chiama ancora nessun altro.
// Cercato con grep su cervello/ e .claude/ il 26/8: fuori da qui e dalle sue prove, «Le card chiuse»
// compare solo dentro un commento di `validazione-congelata.test.mjs`, che non lo analizza.
//
// sorvegliante: ok raggio fino al 2026-09-30 — verificato uno per uno chi legge la forma del rimando: solo la mutazione di AR-807, gia' ri-puntata in questo lotto

/** Il rimando all'archivio in fondo alla coda: si rigenera a ogni passata, non si conserva. */
const RIMANDO_ARCHIVIO = /^> 🗄️ Le card chiuse/;
const RIGA_DEL_FILE = /^> Il file è /;

/**
 * Stacca dalla FINE del testo il rimando all'archivio, così non rientra fra i blocchi.
 *
 * PERCHÉ DALLA FINE E NON OVUNQUE. Il primo tentativo faceva del rimando un confine di blocco, come
 * `## `. Funzionava, e apriva un buco peggiore del difetto: quella riga sarebbe diventata un confine
 * ANCHE dentro il corpo di una card, e tutto quello che veniva dopo sarebbe stato classificato come
 * rimando e buttato via in silenzio. Non è un caso di scuola — la prima card che cita questa riga è
 * quella che racconta questa riparazione. L'ho visto riguardando il mio stesso lavoro con la lente
 * «cosa succede se», dopo averlo già dichiarato finito.
 *
 * Qui invece si guarda solo la coda del file, dove il rimando sta per costruzione: un corpo di card
 * non viene toccato nemmeno se contiene quelle parole.
 */
export function senzaRimandoFinale(testo = "") {
  const righe = String(testo).split("\n");
  const vuota = (r) => !r.trim();

  // ① le righe vuote in fondo: non dicono niente in nessun caso.
  while (righe.length && vuota(righe[righe.length - 1])) righe.pop();

  // ② il rimando vero e proprio, se c'è.
  let trovato = false;
  while (righe.length) {
    const ultima = righe[righe.length - 1];
    if (RIMANDO_ARCHIVIO.test(ultima) || RIGA_DEL_FILE.test(ultima)) {
      righe.pop();
      trovato = true;
      continue;
    }
    break;
  }

  // ③ il separatore che lo introduceva — SOLO se il rimando c'era davvero.
  //
  // Il `---` non si tocca quando il rimando manca, e non è pignoleria: senza questa condizione un
  // file che finisce con una card il cui corpo si chiude con una riga orizzontale se la vedrebbe
  // mangiare a ogni passata. Visto riguardando questa funzione con la lente «cosa succede se»,
  // dopo che le prove erano già verdi — la stessa lente che poche righe fa ha trovato AR-836.
  if (trovato) {
    while (righe.length && (vuota(righe[righe.length - 1]) || righe[righe.length - 1].trim() === "---")) righe.pop();
  }
  return righe.join("\n");
}


// AR-445 — il corpo sta dentro `main()` e parte solo se questo file è il programma lanciato.
// Senza la guardia, `import`arlo lo ESEGUE: chi volesse provarne una funzione si ritroverebbe la
// coda di Nicola riscritta sotto i piedi. È la regola che il cancello fa rispettare a ogni lotto,
// e questo file la mancava da prima che la regola fosse scritta: toccandolo oggi diventa mia.
function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const VAULT = path.resolve(__dirname, '../MyCity-Vault/90-Memoria-AI');
  // Le due case si possono spostare da fuori SOLO per poterle provare. Senza, il freno sulla perdita
  // resta una promessa scritta in un commento: l'unico modo di vederlo scattare sarebbe perdere
  // delle carte vere di Nicola. Una prova che non si può eseguire non è una prova — ed è la regola
  // che questa casa fa rispettare a ogni lotto. I valori di partenza non cambiano.
  const FILE = process.env.CODA_FILE || path.join(VAULT, 'AZIONI-IN-ATTESA.md');
  // L'archivio vive in un FILE SUO, non in fondo alla coda. Misurato il 24/8: tenendolo dentro, la
  // coda arriva a 264.386 caratteri e `cancello-stop.mjs` — che la legge per sapere se un allarme è
  // arrivato a Nicola — si ferma al suo tetto di 200.000 e si dichiara ⚪ CIECO. In CI un ⚪ blocca:
  // la CI resta rossa a ogni consegna, e un rosso che non può diventare verde si impara ad aggirare.
  // La cura NON è alzare il tetto (provato il 22/8 e rimesso indietro: una soglia che sale nasconde i
  // problemi). La cura è il file: tolte le carte chiuse, la coda scende a ~167.000 e il guardiano la
  // legge tutta. Chi ha bisogno delle carte chiuse legge ANCHE questo file — vedi CODA_E_ARCHIVIO.
  const ARCHIVIO = process.env.CODA_ARCHIVIO || path.join(VAULT, 'Archivio', 'AZIONI-archivio.md');
  const DRY_RUN = process.argv.includes('--dry-run');
  const SOGLIA_CARD_CHIUSE = 20; // sopra questa soglia il giro fa housekeeping in automatico

  // Riconosce l'inizio di una card (emoji di stato)
  const CARD_START = /^(### )?(🔴|🟡|🟢|🩻|✅|❌)/;
  const CARD_CHIUSA = /^### (✅|❌)/;
  // Card aperte senza ### (es. "🩻 R4", "🟡 Metti «nuovo»...")
  const CARD_APERTA_BARE = /^(🔴|🟡|🟢|🩻)/;

  let content;
  try {
    content = readFileSync(FILE, 'utf8');
  } catch {
    console.error('housekeeping-azioni: file non trovato, skip.');
    process.exit(0);
  }

  const lines = senzaRimandoFinale(content).split('\n');

  // --- Separa header dal body ---
  let headerEnd = 0;
  for (let i = 0; i < lines.length; i++) {
    if (CARD_START.test(lines[i])) {
      headerEnd = i;
      break;
    }
  }
  if (headerEnd === 0) {
    console.log('housekeeping-azioni: nessuna card trovata, skip.');
    process.exit(0);
  }

  const headerLines = lines.slice(0, headerEnd);
  const bodyLines = lines.slice(headerEnd);

  // --- Splitta in blocchi (ogni blocco = una card + il suo separatore ---) ---
  // Confini: una card (### emoji) O una sezione (## …). Senza il confine `## `, l'intestazione
  // dell'archivio veniva assorbita nella coda della card precedente e a ogni giro ne rinasceva
  // una copia: contate il 13/8, erano 101 identiche. L'ancora `<!-- slug -->` che precede una
  // card viaggia CON la card (tenuta in un buffer), non con la coda del blocco prima.
  const rawBlocks = [];
  let cur = [];
  let ancora = []; // righe `<!-- … -->` (e vuote) in attesa della card a cui appartengono
  for (const line of bodyLines) {
    if (/^<!--.*-->\s*$/.test(line)) {
      ancora.push(line);
      continue;
    }
    if (!line.trim() && ancora.length > 0) {
      ancora.push(line);
      continue;
    }
    if ((CARD_START.test(line) || /^## /.test(line)) && cur.length > 0) {
      rawBlocks.push(cur.join('\n'));
      cur = [];
    }
    if (ancora.length > 0) {
      cur.push(...ancora);
      ancora = [];
    }
    cur.push(line);
  }
  if (ancora.length > 0) cur.push(...ancora);
  if (cur.length > 0) rawBlocks.push(cur.join('\n'));

  // --- Classifica ---
  const openBlocks = [];
  const closedBlocks = [];

  for (const raw of rawBlocks) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    // La prima riga UTILE: un blocco può aprirsi con la sua ancora `<!-- slug -->`,
    // che è un'etichetta, non il titolo.
    const firstLine = trimmed.split('\n').find((l) => l.trim() && !/^<!--.*-->\s*$/.test(l.trim())) || '';

    // L'intestazione dell'archivio non si conserva: si rigenera sotto, UNA sola.
    // (Tenere la vecchia era il meccanismo con cui le copie si accumulavano.)
    if (firstLine.startsWith('## 🗄️ Archivio')) continue;

    // 26/8 (AR-835) — E NEMMENO IL RIMANDO IN FONDO, per la stessa identica ragione.
    //
    // Questa cura era già scritta due righe più su, ma solo per l'intestazione: il rimando finale
    // era rimasto fuori. Sta DOPO l'ultimo separatore, quindi al giro successivo veniva raccolto
    // come se fosse una card e riemesso insieme alle altre — mentre sotto se ne scriveva uno nuovo.
    // Uno in più a ogni passata, in silenzio.
    //
    // Misurato sul file vero il 26/8: su `main` ce n'erano già DUE, uno che diceva 23 e uno 24, e
    // la mia passata ha fatto il terzo con 25. Cioè la coda diceva a Nicola tre numeri diversi
    // sulla stessa cosa, e solo l'ultimo era vero. Il danno non è la riga sprecata: è che il file
    // che serve a fargli sapere lo stato conteneva tre stati.

    // Rimuovi il separatore --- finale dal testo del blocco (lo riaggiungiamo noi)
    const blockClean = trimmed.endsWith('\n---')
      ? trimmed.slice(0, -4).trimEnd()
      : trimmed.replace(/\n---$/, '').trimEnd();

    if (CARD_CHIUSA.test(firstLine)) {
      closedBlocks.push(blockClean);
    } else if (firstLine.startsWith('## ')) {
      // Le altre sezioni `##` (es. Supervisione negozi) restano al loro posto tra le aperte.
      openBlocks.push(blockClean);
    } else if (CARD_START.test(firstLine) || CARD_APERTA_BARE.test(firstLine)) {
      openBlocks.push(blockClean);
    }
  }

  // Con le intestazioni-archivio scartate, le card già archiviate arrivano come blocchi chiusi
  // normali: il conteggio è unico, niente doppia contabilità.
  // Le carte già archiviate NON stanno più nella coda: stanno nel file dell'archivio, e vanno rilette
  // da lì. Senza questa lettura la pulizia successiva riscriverebbe l'archivio con le sole carte
  // nuove, cancellando le precedenti — la pulizia diventerebbe una perdita di memoria.
  const archivioVecchio = existsSync(ARCHIVIO) ? readFileSync(ARCHIVIO, 'utf8') : '';
  const blocchiArchiviati = archivioVecchio
    .split(/\n---\n/)
    .map((b) => b.trim())
    .filter((b) => /^###?\s/m.test(b) && !/^tipo:\s*archivio-azioni/m.test(b));
  const archivedAlready = blocchiArchiviati.length;

  // ⛔ IL FRENO SULLA PERDITA. L'archivio si RISCRIVE da zero, ricomponendolo dai blocchi appena
  // letti. Se il divisore non ne riconosce nemmeno uno — un file rovinato da una fusione, un
  // formato cambiato, un divisore che non c'è più — riscriverlo vuol dire cancellarlo per intero,
  // e in silenzio. Qui non si scrive: si dice cosa sarebbe sparito e si esce con un errore.
  //
  // Non è teoria: questo freno ha fermato una perdita vera mentre lo scrivevo. La prima versione
  // dava al divisore anche l'intestazione dell'archivio, e alla SECONDA pulizia quella testa
  // sarebbe sparita senza che nessuno se ne accorgesse. Il freno ha detto «332 caratteri
  // sparirebbero» e non ha scritto.
  //
  // Vale anche nel dry-run, e non è un dettaglio: un'anteprima che mostra tutto verde e poi si
  // ferma davvero è peggio di nessuna anteprima — l'anteprima si guarda proprio per decidere.
  const testoArchivio = archivioVecchio.replace(/^---[\s\S]*?^---$/m, '').trim();
  if (testoArchivio && archivedAlready === 0) {
    console.error('⛔ housekeeping-azioni: NON scrivo.');
    console.error(`   L'archivio ha ${testoArchivio.length} caratteri ma non ci riconosco nessuna card.`);
    console.error(`   Riscriverlo vorrebbe dire cancellarli tutti. File: ${ARCHIVIO}`);
    process.exit(1);
  }

  // Dry-run: stampa solo il sommario
  if (DRY_RUN) {
    const totalClosed = closedBlocks.length + archivedAlready;
    console.log(`DRY-RUN housekeeping-azioni:`);
    console.log(`  Card aperte:  ${openBlocks.length}`);
    console.log(`  Card chiuse (da spostare): ${closedBlocks.length}`);
    console.log(`  Già in archivio: ${archivedAlready}`);
    console.log(`  Totale archivio dopo: ${totalClosed}`);
    process.exit(0);
  }

  // Niente da fare?
  if (closedBlocks.length === 0) {
    console.log(`housekeeping-azioni: nessuna card chiusa fuori archivio, skip (${archivedAlready} già archiviate).`);
    process.exit(0);
  }

  // --- Aggiorna il banner nell'header ---
  const now = new Date();
  const dateStr = now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').reverse().join('-');
  const timeStr = now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });
  const newBanner = `> 🧹 **Housekeeping ${dateStr} ${timeStr}** — Automatico: **${openBlocks.length} aperte · ${closedBlocks.length + archivedAlready} chiuse in archivio**.`;

  const newHeaderLines = headerLines.map(l =>
    l.startsWith('> 🧹 **Housekeeping') ? newBanner : l
  );

  // --- Ricostruisci la sezione archivio (tutte le card chiuse, sotto UNA intestazione) ---
  const allClosedBlocks = [...blocchiArchiviati, ...closedBlocks];
  const archivedSection = [
    '---',
    'tipo: archivio-azioni',
    `aggiornato: ${dateStr} ${timeStr}`,
    'fonte: cervello/housekeeping-azioni.mjs',
    '---',
    '',
    '# 🗄️ Archivio — le card già chiuse',
    '',
    '> Le card approvate o annullate finiscono qui, per tenere la coda viva sotto il tetto di lettura',
    '> del cancello (200.000 caratteri). La coda viva è in [[AZIONI-IN-ATTESA]].',
    `> Ultima pulizia: ${dateStr} ${timeStr} · ${allClosedBlocks.length} card totali.`,
    '> Le card non si buttano: si spostano. Chi cerca una card chiusa la cerca QUI.',
    '',
    allClosedBlocks.join('\n\n---\n\n'),
    '',
  ].join('\n');

  // --- Scrivi il file ---
  const newContent = [
    newHeaderLines.join('\n').trimEnd(),
    '',
    openBlocks.join('\n\n---\n\n'),
    '',
    '---',
    '',
    // Due frasi, non una. La riga di prima ne impilava due per volta — il numero fra parentesi e il
    // percorso dopo il trattino — e valeva un punto difficile in `si-capisce.mjs` OGNI VOLTA che
    // questo script girava. Cioè lo strumento che alleggerisce la coda di Nicola la appesantiva di
    // un punto a ogni passata, e il cancello lo contava contro chi aveva solo chiuso una card.
    `> 🗄️ Le card chiuse stanno in [[AZIONI-archivio]]. Adesso sono ${allClosedBlocks.length}.`,
    "> Il file è `MyCity-Vault/90-Memoria-AI/Archivio/AZIONI-archivio.md`.",
    '',
  ].join('\n');

  mkdirSync(path.dirname(ARCHIVIO), { recursive: true });
  writeFileSync(ARCHIVIO, archivedSection, 'utf8');
  writeFileSync(FILE, newContent, 'utf8');
  console.log(`✅ housekeeping-azioni: ${openBlocks.length} aperte · ${allClosedBlocks.length} archiviate (erano ${archivedAlready} + ${closedBlocks.length} nuove).`);

}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();