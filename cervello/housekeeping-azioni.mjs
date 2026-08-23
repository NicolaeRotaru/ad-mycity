#!/usr/bin/env node
// 🧹 housekeeping-azioni.mjs — sposta le card ✅/❌ della coda in un archivio A PARTE
//
// Uso:
//   node cervello/housekeeping-azioni.mjs            → esegue la pulizia
//   node cervello/housekeeping-azioni.mjs --dry-run  → mostra cosa farebbe, non tocca niente
//
// Quando gira: chiamato da giro.sh ogni SOGLIA_CARD_CHIUSE card accumulate.
// Non produce errori: se il file non esiste o è già pulito, esce in silenzio.
//
// ⚠️ PERCHÉ L'ARCHIVIO È USCITO DAL FILE (AR-807, clausola a). Fino al 23/8 questa pulizia spostava
// le carte chiuse in una SEZIONE della coda stessa. Cioè non alleggeriva niente: le teneva nello
// stesso file, in fondo. Il conto del 23/8: la coda a 269.658 caratteri, di cui 88.741 di sole carte
// chiuse. Il controllo che cerca i testi peggiorati ne legge 200.000 e poi taglia, quindi su quel
// file diceva ⚪ invece di misurare — e il 22/8 era già successo, curato a mano, e si era disfatto in
// un mese. Un rimedio che sposta la roba dentro lo stesso contenitore non è un rimedio.
//
// Adesso le carte chiuse vanno in `Archivio/AZIONI-CHIUSE.md` e la coda tiene una riga che ci punta.
// La coda torna a 180.916 caratteri, cioè dentro il campo visivo del controllo.
//
// ⚠️ E PERCHÉ C'È UN FRENO SULLA PERDITA. Questa è l'operazione più delicata della memoria: sposta
// testo che Nicola usa per decidere. Il 22/8, improvvisandola, ho portato via carte che altri
// guardiani cercavano ancora e due prove sono diventate rosse. Quindi la scrittura non parte se il
// conto delle carte chiuse dopo è più basso di prima: meglio una pulizia che non fa niente di una
// che perde una carta per strada.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../MyCity-Vault/90-Memoria-AI');
// Le due case si possono spostare da fuori SOLO per poterle provare: senza, il freno sulla perdita
// resterebbe una promessa scritta in un commento, e l'unico modo di vederlo scattare sarebbe
// perdere delle carte vere. Una prova che non si può eseguire non è una prova.
const FILE = process.env.CODA_FILE || path.join(VAULT, 'AZIONI-IN-ATTESA.md');
const ARCHIVIO = process.env.CODA_ARCHIVIO || path.join(VAULT, 'Archivio', 'AZIONI-CHIUSE.md');
const ARCHIVIO_DIR = path.dirname(ARCHIVIO);
// La riga che resta nella coda al posto delle carte chiuse: un umano che scorre fino in fondo deve
// sapere DOVE sono finite, o l'archiviazione somiglia a una cancellazione.
const RIGA_PUNTATORE = '> 🗄️ Le card chiuse stanno in [[Archivio/AZIONI-CHIUSE]] — fuori da questo file, perché qui ci si legge solo quello che aspetta una tua firma.';
const DRY_RUN = process.argv.includes('--dry-run');
const SOGLIA_CARD_CHIUSE = 20; // sopra questa soglia il giro fa housekeeping in automatico

// Riconosce l'inizio di una card (emoji di stato)
const CARD_START = /^(### )?(🔴|🟡|🟢|🩻|✅|❌)/;
const CARD_CHIUSA = /^### (✅|❌)/;
// Card aperte senza ### (es. "🩻 R4", "🟡 Metti «nuovo»...")
const CARD_APERTA_BARE = /^(🔴|🟡|🟢|🩻)/;

// ⚠️ TUTTO IL LAVORO STA DENTRO main(), E NON È PIGNOLERIA. Prima era codice al primo livello: chi
// importava questo file per riusarne una funzione si ritrovava la coda RISCRITTA e il processo
// ucciso da un process.exit. Su uno script che sposta il testo che Nicola legge, «lo importo per
// guardarci dentro» non deve poter voler dire «l'ho eseguito».
function main() {
  let content;
  try {
    content = readFileSync(FILE, 'utf8');
  } catch {
    console.error('housekeeping-azioni: file non trovato, skip.');
    process.exit(0);
  }

  const lines = content.split('\n');

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
  // Il cartello che punta all'archivio si rigenera a ogni pulizia, quindi il vecchio va tolto PRIMA di
  // dividere in blocchi. Senza questa riga non spariva: non apre un blocco suo, quindi si incollava
  // alla coda dell'ultima card e usciva insieme a lei, mentre sotto ne veniva scritto uno nuovo. La
  // coda cresceva di 150 caratteri a ogni pulizia — misurato su tre corse di fila, 172.263 → 172.413 →
  // 172.563. Una pulizia che allunga il file a ogni giro è la malattia che questo lavoro cura.
  const bodyLines = lines.slice(headerEnd).filter((l) => !l.startsWith('> 🗄️ Le card chiuse stanno in'));

  // --- Splitta in blocchi (ogni blocco = una card + il suo separatore ---) ---
  // Confini: una card (### emoji) O una sezione (## …). Senza il confine `## `, l'intestazione
  // dell'archivio veniva assorbita nella coda della card precedente e a ogni giro ne rinasceva
  // una copia: contate il 13/8, erano 101 identiche. L'ancora `<!-- slug -->` che precede una
  // card viaggia CON la card (tenuta in un buffer), non con la coda del blocco prima.
  function dividiInBlocchi(righe) {
    const blocchi = [];
    let cur = [];
    let ancora = []; // righe `<!-- … -->` (e vuote) in attesa della card a cui appartengono
    for (const line of righe) {
      if (/^<!--.*-->\s*$/.test(line)) {
        ancora.push(line);
        continue;
      }
      if (!line.trim() && ancora.length > 0) {
        ancora.push(line);
        continue;
      }
      if ((CARD_START.test(line) || /^## /.test(line)) && cur.length > 0) {
        blocchi.push(cur.join('\n'));
        cur = [];
      }
      if (ancora.length > 0) {
        cur.push(...ancora);
        ancora = [];
      }
      cur.push(line);
    }
    if (ancora.length > 0) cur.push(...ancora);
    if (cur.length > 0) blocchi.push(cur.join('\n'));
    return blocchi;
  }

  // Le carte gia' archiviate nel file a parte tornano dentro con lo stesso divisore: due modi di
  // tagliare le stesse carte sono due tagli che prima o poi non coincidono piu'.
  // Dell'archivio si prendono le CARTE, non la sua intestazione: quella si rigenera a ogni pulizia.
  // Il taglio è lo stesso che si fa sulla coda — dalla prima card in giù — e non è un dettaglio: la
  // prima versione dava al divisore anche il frontmatter, che non somiglia a nessuna card, e il freno
  // sulla perdita si è fermato dicendo «332 caratteri sparirebbero». Aveva ragione: alla seconda
  // pulizia l'archivio avrebbe perso la propria testa, in silenzio.
  function carteDi(testo) {
    const righe = testo.split('\n');
    const inizio = righe.findIndex((l) => CARD_START.test(l));
    // ⚠️ UN ARCHIVIO SENZA CARD RICONOSCIBILI NON È UN ARCHIVIO VUOTO. Se qui si tornasse un elenco
    // vuoto in silenzio, tutto il testo di quel file finirebbe sovrascritto alla prima pulizia — e
    // sarebbe la perdita più grossa possibile, l'archivio intero, senza una riga di avviso. Quindi
    // «non ci ho capito niente» esce come tale, e chi chiama si ferma.
    if (inizio === -1) return { righe: [], illeggibile: testo.trim().length > 0, caratteri: testo.length };
    return { righe: righe.slice(inizio), illeggibile: false, caratteri: testo.length };
  }

  let righeArchivio = [];
  let archivioIlleggibile = null;
  try {
    const letto = carteDi(readFileSync(ARCHIVIO, 'utf8'));
    righeArchivio = letto.righe;
    if (letto.illeggibile) archivioIlleggibile = letto.caratteri;
  } catch {
    // Prima volta: l'archivio non c'e' ancora. Un file assente non e' un archivio vuoto da
    // sovrascrivere — e' semplicemente il giorno in cui nasce.
  }

  const rawBlocks = [...dividiInBlocchi(bodyLines), ...dividiInBlocchi(righeArchivio)];

  // --- Classifica ---
  const openBlocks = [];
  const closedBlocks = [];
  // Gli scarti VOLUTI: le intestazioni e i cartelli, che si rigenerano. Tutto il resto che entra deve
  // uscire, e il conto qui sotto è quello che lo pretende.
  const scartatiApposta = [];
  const scartatiSenzaVolerlo = [];

  for (const raw of rawBlocks) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    // La prima riga UTILE: un blocco può aprirsi con la sua ancora `<!-- slug -->`,
    // che è un'etichetta, non il titolo.
    const firstLine = trimmed.split('\n').find((l) => l.trim() && !/^<!--.*-->\s*$/.test(l.trim())) || '';

    // L'intestazione dell'archivio non si conserva: si rigenera sotto, UNA sola.
    // (Tenere la vecchia era il meccanismo con cui le copie si accumulavano.)
    if (firstLine.startsWith('## 🗄️ Archivio') || firstLine.startsWith('# 🗄️')) { scartatiApposta.push(firstLine); continue; }
    // Il puntatore che la coda tiene al posto delle carte: e' un cartello, non una card.
    if (firstLine.startsWith('> 🗄️') || firstLine.startsWith('> Ultima pulizia:')) { scartatiApposta.push(firstLine); continue; }

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
    } else {
      // ⚠️ QUI CADEVA LA ROBA NEL VUOTO. Un blocco che nessun ramo riconosce non finiva né fra le
      // aperte né fra le chiuse: spariva, e la scrittura andava avanti lo stesso. È il modo in cui
      // il 22/8 ho perso delle carte senza accorgermene. Adesso si conta, e il conto ferma tutto.
      scartatiSenzaVolerlo.push({ prima: firstLine.slice(0, 80), caratteri: blockClean.length });
    }
  }

  // Con le intestazioni-archivio scartate, le card già archiviate arrivano come blocchi chiusi
  // normali: il conteggio è unico, niente doppia contabilità.
  const archivedAlready = 0;

  // IL FRENO SULLA PERDITA. La regola è secca: ogni blocco che entra deve uscire, o fra le aperte o
  // fra le chiuse. Gli unici scarti ammessi sono le intestazioni e i cartelli, che si rigenerano —
  // e sono contati anche loro, così «ammesso» resta un elenco corto e visibile invece di un silenzio.
  //
  // Non conta le CARD (`### ✅`) ma i BLOCCHI, ed è la differenza che fa scattare il freno per davvero:
  // un blocco può non somigliare a nessuna card conosciuta — una carta scritta senza emoji, un testo
  // che comincia con un simbolo che qui vale come cartello — e sono proprio quelli che sparivano.

  // Dry-run: stampa solo il sommario
  if (DRY_RUN) {
    const totalClosed = closedBlocks.length + archivedAlready;
    console.log(`DRY-RUN housekeeping-azioni:`);
    console.log(`  Card aperte:  ${openBlocks.length}`);
    console.log(`  Card chiuse (da spostare): ${closedBlocks.length}`);
    console.log(`  Già in archivio: ${archivedAlready}`);
    console.log(`  Totale archivio dopo: ${totalClosed}`);
    console.log(`  Intestazioni rigenerate: ${scartatiApposta.length}`);
    // Un'anteprima che tace il pericolo è peggio di nessuna anteprima: se la pulizia vera si
    // fermerebbe, deve dirlo QUI, dove si va a guardare prima di lanciarla.
    if (archivioIlleggibile !== null) console.log(`  ⛔ archivio di ${archivioIlleggibile} caratteri senza nessuna card riconoscibile: la pulizia vera si fermerebbe.`);
    if (scartatiSenzaVolerlo.length > 0) {
      console.log(`  ⛔ ${scartatiSenzaVolerlo.length} blocco/i sparirebbero: la pulizia vera si fermerebbe senza scrivere.`);
      for (const x of scartatiSenzaVolerlo) console.log(`     · «${x.prima}» (${x.caratteri} caratteri)`);
    }
    process.exit(scartatiSenzaVolerlo.length > 0 || archivioIlleggibile !== null ? 1 : 0);
  }

  // Niente da fare?
  if (closedBlocks.length === 0) {
    console.log(`housekeeping-azioni: nessuna card chiusa fuori archivio, skip (${archivedAlready} già archiviate).`);
    process.exit(0);
  }

  if (archivioIlleggibile !== null) {
    console.error(
      `housekeeping-azioni: NON scrivo. L'archivio esiste e fa ${archivioIlleggibile} caratteri, ma dentro non ` +
        "riconosco nessuna card: riscriverlo vorrebbe dire cancellarlo tutto. Guardalo a mano prima di rilanciare.",
    );
    process.exit(1);
  }

  // --- Aggiorna il banner nell'header ---
  const now = new Date();
  const dateStr = now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').reverse().join('-');
  const timeStr = now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });
  const newBanner = `> 🧹 **Housekeeping ${dateStr} ${timeStr}** — Automatico: **${openBlocks.length} aperte · ${closedBlocks.length + archivedAlready} chiuse in archivio**.`;

  const newHeaderLines = headerLines.map(l =>
    l.startsWith('> 🧹 **Housekeeping') ? newBanner : l
  );

  // --- L'archivio: un file suo, non una sezione di questo ---
  const allClosedBlocks = [...closedBlocks];

  if (scartatiSenzaVolerlo.length > 0) {
    const quali = scartatiSenzaVolerlo.map((x) => `«${x.prima}» (${x.caratteri} caratteri)`).join(' · ');
    console.error(
      `housekeeping-azioni: NON scrivo. ${scartatiSenzaVolerlo.length} blocco/i non finirebbero né fra le aperte né ` +
        `fra le chiuse, quindi sparirebbero: ${quali}. Un archivio che perde del testo è una cancellazione con un altro nome.`,
    );
    process.exit(1);
  }

  const archivio = [
    '---',
    'tipo: archivio-azioni',
    'fonte: housekeeping-azioni.mjs',
    '---',
    '',
    '# 🗄️ Card chiuse — archivio della coda',
    '',
    `> Ultima pulizia: ${dateStr} ${timeStr} · ${allClosedBlocks.length} card totali`,
    '>',
    '> Qui finiscono le card di [[AZIONI-IN-ATTESA]] che hanno gia\' avuto la loro risposta. Restano',
    '> intere: si archivia per togliere peso alla coda, non per cancellare la storia.',
    '',
    allClosedBlocks.join('\n\n---\n\n'),
    '',
  ].join('\n');

  // --- La coda: solo le aperte, piu' il cartello che dice dove sono finite le altre ---
  const newContent = [
    newHeaderLines.join('\n').trimEnd(),
    '',
    openBlocks.join('\n\n---\n\n'),
    '',
    '---',
    '',
    RIGA_PUNTATORE,
    '',
  ].join('\n');

  mkdirSync(ARCHIVIO_DIR, { recursive: true });
  writeFileSync(ARCHIVIO, archivio, 'utf8');
  writeFileSync(FILE, newContent, 'utf8');
  console.log(
    `✅ housekeeping-azioni: ${openBlocks.length} aperte nella coda · ${allClosedBlocks.length} chiuse in ${path.relative(process.cwd(), ARCHIVIO)} ` +
      `(${newContent.length} caratteri di coda, erano ${content.length}).`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) main();
