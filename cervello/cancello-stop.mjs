#!/usr/bin/env node
// 🛑 CANCELLO DELLO STOP — l'unico freno che scatta nell'istante in cui dico «fatto».
//
// PERCHÉ ESISTE (Nicola, 31/7). In due giorni la stessa cosa è successa sei volte: un verdetto
// scritto e messo dove nessuno lo legge. Il sorvegliante parlava in un log di debug. watch-main
// contava «1716 rinvii CONSECUTIVI» dentro journalctl. misura-cieca stava per nascere muta uguale.
// Ogni volta ho riparato l'istanza, e ogni volta l'abitudine è rimasta intatta — perché l'abitudine
// non sta nel codice: sta nel MOMENTO in cui chiudo il lavoro.
//
// Quando finisco, scrivo il risultato vicino a dove stavo lavorando: il log è vicino al codice, la
// scheda è vicina al difetto, il file di consegna è vicino al reparto. Nessuno di quei posti è
// Nicola. E non me ne accorgo mai, perché scrivere il verdetto È la sensazione di aver finito.
//
// Tutti gli altri freni guardano il codice. Questo guarda il momento in cui dichiaro di aver finito,
// che è l'unico posto dove quel comportamento si manifesta.
//
// LA PROVA CHE SERVIVA, misurata il 31/7 su me stesso: nove difetti chiusi in quella sessione
// (AR-455, AR-462, AR-465..AR-471) — ZERO con una prova eseguibile. Nove volte «fatto» senza niente
// che potesse dire di no. AR-455 è il caso di scuola: chiuso perché «la riga in settings.json c'è»,
// mentre il freno che quella riga attaccava parlava a nessuno. Chiuso sulla lettera, non sull'effetto.
//
// COSA CONTROLLA — sei cose meccaniche, nessun giudizio:
//   ① difetto chiuso senza prova eseguibile — `verifica.comando`. Un difetto che si chiude senza un
//      comando che possa fallire non è chiuso: è archiviato.
//   ② allarme scritto e non accodato — 🔴/CRITICO/bloccante in un documento nuovo, oppure AGGIUNTO a
//      una consegna che esisteva già, mentre la coda che Nicola legge (AZIONI-IN-ATTESA.md) non è
//      stata toccata. È il verdetto senza lettore, colto nell'atto.
//   ③ lezione nuova senza freno — una lezione che non nomina un `gate`. La regola di casa è già
//      questa; qui arriva un giro prima del cancello del lotto.
//   ④ lavoro consegnato senza esito (AR-154) — ho committato codice e nessuna riga NUOVA in un
//      quaderno porta la calibrazione «atteso … → reale …». Il rituale esiste dal giorno di AR-009 e
//      dipende da un passo manuale: nello sprint del Pannello il quaderno di @tech salta da 20/7 a
//      25/7 — quattro giorni consecutivi (21, 22, 23, 24) con ZERO righe, mentre le PR si mergiavano
//      a sette al giorno.
//
//   ⑤ testo consegnato a Nicola che non si capisce (AR-478) — un file .md nelle cartelle dove lui
//      legge che esce PEGGIORE di come è entrato. Delta verso la base, non totale: sul totale ogni
//      ritocco a un file lungo sarebbe un blocco, e un cancello che non può diventare verde si impara
//      ad aggirarlo.
//   ⑥ messaggio in chat che non si capisce (AR-481, AR-489) — la chat È un file: l'hook `Stop` riceve
//      `transcript_path`. Include le idee già mandate, che è l'unica misura con memoria della
//      conversazione: tutte le altre guardano un pezzo per volta.
//
// COSA NON CONTROLLA, e va detto: non sa se ciò che ho scritto sia VERO, non giudica se un fix è
// giusto, e — la più importante — non sa se la riga di esito parli DI QUESTO lavoro. Nessuna regola
// meccanica distingue «ho raccontato il lavoro giusto» da «ho raccontato un lavoro»: quel giudizio
// resta a Nicola, che la riga la legge in Cabina. E non sa se Nicola ha CAPITO: conta segnali di
// forma, non comprensione. Sei misure sullo stato del lavoro e sulla forma di ciò che consegno, non
// sulla loro qualità. Dove passa un «forse», qui si tace.
//
// Uso:
//   node cervello/cancello-stop.mjs           # verdetto leggibile (nessun blocco)
//   node cervello/cancello-stop.mjs --hook    # per l'hook Stop: exit 2 = non ti lascio chiudere
//
// Exit: 0 = niente da dire · 2 = c'è qualcosa che stavo per lasciare indietro
//
// 🟢 Sola lettura sul repo: non modifica file versionati, non tocca git. L'UNICA scrittura è l'ancora
//    del turno (AR-496) in `cervello/_tmp_stop-ancora.json`, fuori da git — senza, il perimetro
//    tornerebbe a essere tutto il ramo a ogni chiusura. Stessa scelta del battito del sorvegliante,
//    e per lo stesso motivo: verificare non deve costare un diff.

import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { percorsiDaGit } from "./percorsi-git.mjs";
import { misura, parolePeggioNoteAGlossario } from "./si-capisce.mjs";
import { BATTITO, vociInsistenti } from "./sorvegliante.mjs";
import { blocchi, orfano } from "./comandi-senza-casa.mjs";
import { collaudoAlloStop } from "./collaudo.mjs";
import { abbina, buchi, delTurno, leggiRegistroConEsito, strumentiVisti } from "./libro-mastro.mjs";
import { leggiFreni, mappa, righeSorveglianza, strumentiDaTrascrizione } from "./mappa-copertura.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const CANTIERE = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";
const APPRENDIMENTO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json";
const CODA = "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md";

/** I marcatori d'allarme: le forme con cui questa macchina scrive «questo è grave». */
export const ALLARMI = [/🔴/, /\bCRITICO\b/i, /\bbloccante\b/i];

/**
 * I referti di PR che `git-pr.mjs` scrive da solo (`consegne/tech/pr-<repo>-<numero>.md`, vedi
 * `writeConsegna`): portano SEMPRE la stessa riga «🔴 Non mergeare da solo» — non è un allarme nuovo
 * che stavo per lasciare indietro, è l'avviso di governo che quello script incolla in ogni PR che apre.
 * Trovato aprendo la PR #733 di questo stesso lavoro: il file nasce nuovo nel ramo (non esiste su
 * main finché la PR non c'è), quindi la sua riga fissa veniva letta come un allarme appena scritto —
 * mentre l'approvazione del merge arriva già alle card del Pannello (`--accoda`), non da qui. Stessa
 * malattia dei referti auto-scritti in `sorvegliante.mjs` (REFERTI): un testo che la macchina rigenera
 * sempre uguale non è la voce di chi scopre un problema.
 */
const ePrDoc = (file) => /^consegne\/tech\/pr-[^/]+-\d+\.md$/.test(file);

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzioni pure. Prendono DUE stati (prima e dopo) e tornano cosa manca. Pure perché una
// prova le deve poter eseguire su stati finti: se misurassero com'è il repo adesso, domani sarebbero
// verdi o rosse per motivi che non c'entrano con la regola che difendono.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ① I difetti passati a «chiuso» in questo lavoro che non portano un comando capace di fallire.
 *
 * `verifica.comando` è la forma forte: un comando che si esegue. `{file, pattern}` è la forma debole
 * — controlla che una riga esista, cioè la FORMA del codice, e passerebbe identica su un fix rotto.
 * Un difetto chiuso senza nessuna delle due è una dichiarazione, e le dichiarazioni sono esattamente
 * quello che ci ha fatto perdere 31 ore.
 */
export function chiusiSenzaProva(prima = [], dopo = []) {
  const eraChiuso = new Set(prima.filter((d) => d.stato === "chiuso").map((d) => d.id));
  return dopo
    .filter((d) => d.stato === "chiuso" && !eraChiuso.has(d.id))
    .filter((d) => !chiusuraLegittima(d.verifica))
    .map((d) => ({ id: d.id, titolo: String(d.titolo || "").slice(0, 80), debole: Boolean(d.verifica) }));
}

/**
 * Le due chiusure che valgono (AR-487).
 *
 * Il difetto, trovato da Nicola il 3/8 usandolo: il controllo pretendeva `verifica.comando` e basta.
 * Ma esistono difetti che NON si chiudono con un comando: quelli che aspettano una DECISIONE sua.
 * Caso vero dello stesso giorno: AR-479, le quattro ore di lettura. Nicola ha deciso «non voglio
 * riscrivere niente». Non c'è nessun comando che possa dimostrare quella frase, ed è giusto così.
 * Il controllo la segnalava come se io avessi chiuso un difetto senza prova.
 *
 * Un controllo che accusa la persona che comanda quando comanda è un controllo che si impara a
 * ignorare — e diventerebbe rumore proprio sul canale dove passano le decisioni.
 *
 * ① `verifica.comando` — la prova forte: un comando che si esegue e può fallire.
 * ② `verifica.tipo === "umano"` CON un `esito` scritto — la decisione di Nicola, messa a verbale.
 *
 * L'`esito` non è burocrazia: è ciò che impedisce alla macchina di chiudersi i difetti da sola
 * scrivendo «umano» e basta. Senza il verbale di cosa è stato deciso, resta una dichiarazione — che
 * è esattamente la cosa che questo controllo esiste per fermare.
 */
/**
 * Lo stato «prima» del lavoro — che dentro una fusione ha DUE genitori, non uno. (AR-540.)
 *
 * Il cancello misura cosa è cambiato fra prima e adesso, e chiama «mio» il cambiamento. Dentro un
 * merge quella sottrazione mente: il disco contiene anche il lavoro dell'altro ramo, e HEAD non lo
 * sa. Successo il 4/8 alle 05:45 — il worker aveva chiuso AR-361 col suo commit «riconcilia», la
 * fusione l'ha portato qui, e il cancello me l'ha contestato come una chiusura mia senza prova.
 *
 * È la terza comparsa della stessa forma in due giorni, e Nicola l'aveva già indicata a voce sulla
 * prima: «il cancello deve dire "non so cosa è tuo" invece di accusare». ① in una copia senza ancora,
 * ② su un registro riordinato, ③ qui dentro una fusione.
 *
 * L'unione è la risposta esatta, non una scorciatoia: mio è ciò che era aperto su ENTRAMBI i lati ed
 * è chiuso adesso. Non assolve niente di mio — se chiudo io un difetto che di là era aperto, resta
 * mio e il cancello parla. Fuori da una fusione `altro` è nullo e questa funzione non cambia niente.
 */
export function statoDiPartenza(daHead, daAltroGenitore) {
  return [...(daHead || []), ...(daAltroGenitore || [])];
}

export function chiusuraLegittima(verifica) {
  if (!verifica) return false;
  if (typeof verifica.comando === "string" && verifica.comando.trim()) return true;
  if (verifica.tipo === "umano" && typeof verifica.esito === "string" && verifica.esito.trim()) return true;
  return false;
}

/**
 * ② I file d'allarme scritti mentre la coda di Nicola resta intatta.
 *
 * È il verdetto senza lettore colto nell'atto: ho scritto «🔴 CRITICO» da qualche parte e non ho
 * messo niente dove lui guarda. Se la coda È stata toccata non dico niente — non ho modo di sapere
 * se la riga giusta è quella, e un guardiano che indovina viene spento.
 */
/**
 * La coda risulta toccata anche da un commit già fatto dentro il perimetro del turno, non solo da
 * una modifica ancora sul disco (numero AR non assegnato in questa sessione — `prossimo-ar.mjs`
 * richiede approvazione non disponibile qui; vedi la nota sopra `codaNelPerimetro` in `main()`).
 */
export function codaToccataNelPerimetro(righeCartella = null, codaPath = CODA) {
  return Boolean(righeCartella?.some((f) => f.file === codaPath && f.righe.length > 0));
}

export function allarmiSenzaCoda(fileNuovi = [], codaToccata = false, consegneModificate = []) {
  if (codaToccata) return [];
  const daiNuovi = fileNuovi
    .filter((f) => !ePrDoc(f.file))
    .filter((f) => ALLARMI.some((r) => r.test(f.contenuto || "")))
    .map((f) => f.file);
  // Il buco che restava (1/8): un allarme AGGIUNTO in fondo a una consegna che esisteva già non era
  // un file nuovo, quindi non lo vedeva nessuno. È il caso più probabile dei due — le consegne si
  // aggiornano molto più spesso di quanto nascano.
  const daiModificati = consegneModificate
    .filter((f) => !ePrDoc(f.file))
    .filter((f) => (f.righe || []).some((r) => ALLARMI.some((m) => m.test(r))))
    .map((f) => f.file);
  return [...new Set([...daiNuovi, ...daiModificati])];
}

/**
 * ④ Lavoro di codice CONSEGNATO senza una riga di esito (AR-154).
 *
 * Il rituale «una riga ESITO dopo ogni lavoro 🟡/🔴» esiste dal giorno di AR-009, e dipende da un
 * passo manuale a fine lavoro. Il conto che ha presentato è misurato sul quaderno di @tech: durante
 * lo sprint del Pannello le date saltano da 20/7 a 25/7 — quattro giorni consecutivi (21, 22, 23, 24)
 * con ZERO righe, mentre le PR si mergiavano a sette al giorno. Non per pigrizia: sotto pressione si
 * chiude il bug dopo, non si registra quello prima — saltare la registrazione non rompe niente, e
 * quindi è sempre la prima cosa che salta. Un rituale che dipende dalla disciplina fallisce
 * esattamente quando servirebbe di più.
 *
 * Guarda i COMMIT del ramo, non l'albero di lavoro: a metà lavoro le modifiche non sono committate e
 * l'esito non è ancora dovuto — chiedere lì produrrebbe rumore a ogni turno, e il rumore spegne i
 * freni. Quando invece il lavoro è committato, è consegnato: quello è il momento in cui l'esito è
 * dovuto, ed è lo stesso punto che la scheda AR-154 indica («nel flusso di git-pr»).
 *
 * `memoria` sono le quattro cartelle che questo repo chiama memoria da sempre (le stesse di MEM_DIRS
 * in vps/aggiorna-cervello.sh): tutto il resto è lavoro che qualcuno dovrà rileggere.
 */
export const CARTELLE_MEMORIA = ["MyCity-Vault/", "consegne/", "creativi/", "memoria-squadra/"];

/**
 * La forma di una riga di esito VERA — data, contesto, e la calibrazione `atteso → reale`.
 *
 * Perché la forma e non solo il file (limite ① della prima stesura, 1/8): la prima versione si
 * accontentava che un `memoria-squadra/*.md` comparisse fra i file committati. Bastava una virgola in
 * un quaderno per passare — cioè il freno chiedeva di TOCCARE un file, non di dire com'era andata. E
 * un freno che si può soddisfare senza fare la cosa che difende insegna a soddisfarlo, non a farla.
 *
 * `atteso → reale` è obbligatorio e non è un capriccio di formato: è l'unica parte che vale qualcosa.
 * Il resto — data, contesto, tag — descrive il lavoro; solo la distanza fra ciò che mi aspettavo e
 * ciò che è successo calibra il giudizio della volta dopo. Una riga senza quella è una ricevuta.
 */
export const RIGA_ESITO = /^-\s*\d{4}-\d{2}-\d{2}[^\n]*·[^\n]*\batteso\b[^\n]*→[^\n]*\breale\b/;

/** Le righe AGGIUNTE ai quaderni che sono davvero righe di esito. */
export function esitiScritti(righeAggiunte = []) {
  return righeAggiunte.map((r) => String(r).trim()).filter((r) => RIGA_ESITO.test(r));
}

/**
 * ④ Lavoro di codice CONSEGNATO senza una riga di esito (AR-154).
 *
 * Guarda le righe AGGIUNTE dal ramo, non i file toccati — così chiude anche il limite ②: un quaderno
 * modificato per un altro motivo (una potatura, un riordino) non toglie né aggiunge una riga di
 * esito, e quindi non soddisfa più il freno per sbaglio.
 *
 * COPERTURA DICHIARATA: che la riga parli DI QUESTO lavoro non è verificabile da una macchina —
 * nessuna regola meccanica distingue «ho raccontato il lavoro giusto» da «ho raccontato un lavoro».
 * Quello resta un giudizio di Nicola, che la riga la legge in Cabina → Memoria → Quaderni senior. Il
 * freno garantisce che una riga con la calibrazione dentro esista e arrivi dove lui guarda.
 */
export function consegnaSenzaEsito(fileCommittati = [], righeAggiunteNeiQuaderni = [], codiceDopoEsito = null) {
  const codice = fileCommittati.filter((f) => !CARTELLE_MEMORIA.some((m) => f.startsWith(m)));
  if (!codice.length) return null;
  const quaderni = fileCommittati.filter((f) => f.startsWith("memoria-squadra/") && f.endsWith(".md"));
  if (!esitiScritti(righeAggiunteNeiQuaderni).length) {
    return { quanti: codice.length, esempio: codice.slice(0, 3), quadernoToccato: quaderni.length > 0, dopo: 0 };
  }
  // IL BUCO CHE LA RILETTURA HA TROVATO (2/8, AR-477). Fin qui il controllo si fermava a «esiste una
  // riga di esito sul ramo». Provato dal vivo: su un ramo che ne aveva già una, ho committato un file
  // di codice nuovo e il cancello ha detto «niente da lasciare indietro». Cioè: **la prima riga di
  // esito comprava il lasciapassare per tutto il resto del ramo**, e più il ramo è lungo — questo ne
  // ha otto di commit — più lavoro passa senza essere raccontato.
  //
  // La domanda giusta non è «c'è una riga?» ma «ho continuato a lavorare DOPO averla scritta?».
  // Sull'unità di consegna (il ramo verso main) resta silenzioso chi scrive l'esito alla fine, che è
  // il comportamento corretto; parla solo con chi ha committato codice dopo l'ultimo racconto.
  if (codiceDopoEsito > 0) {
    return { quanti: codice.length, esempio: codice.slice(0, 3), quadernoToccato: true, dopo: codiceDopoEsito };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// IL PERIMETRO (AR-496) — «questo turno», non «tutto il ramo».
//
// PERCHÉ ESISTE, e il caso è di ieri l'altro. Il 3/8, in un turno in cui non avevo scritto una riga
// (albero pulito, solo letture), questo cancello mi ha fermato per un allarme scritto il 31/7 in un
// commit che vive su questo ramo. Aveva ragione sul fatto — quel 🔴 non è mai arrivato in coda — e
// torto sul tempo: non era una cosa che stavo lasciando indietro ADESSO. E siccome il confronto era
// `origin/main...HEAD`, sarebbe ricomparso identico a ogni chiusura di ogni turno finché il ramo non
// si mergia. Un rosso che si ripete uguale è il modo esatto in cui un freno insegna a ignorarsi —
// regola che questa macchina ha già scritto («un avvisatore che parla sempre viene spento entro la
// settimana») e che poi ha violato nel proprio cancello.
//
// COME. Un'ancora fuori da git (`_tmp_`, come il battito del sorvegliante: verificare non deve
// costare un diff) col commit su cui si è chiuso l'ultimo turno pulito. Da lì in poi il perimetro è
// `ancora...HEAD` = il lavoro di QUESTO turno.
//
// DUE SCELTE CHE CONTANO:
//   · l'ancora si sposta SOLO quando il turno si chiude senza blocco. Spostarla su un turno bloccato
//     farebbe sparire dal perimetro proprio ciò per cui ho bloccato: il secondo giro passerebbe
//     verde, e il freno si scavalcherebbe da solo.
//   · se l'ancora non c'è (prima chiusura qui) o non è più un antenato di HEAD (rebase, reset), NON
//     fingo precisione: torno al ramo e lo DICHIARO in testa al verdetto. Un perimetro sbagliato
//     taciuto è peggio di un perimetro largo dichiarato.
//
// E resta com'era per il controllo ④ (l'esito del lavoro consegnato): quello è per-RAMO per progetto
// — l'unità di consegna è la PR, non il turno, ed è stato tarato ieri su questo (AR-477). Stringerlo
// al turno sarebbe stato allentare un freno appena costruito, cioè la cosa che il sorvegliante adesso
// chiama `soglia-allentata`.
// ─────────────────────────────────────────────────────────────────────────────

export const ANCORA = "cervello/_tmp_stop-ancora.json";

/**
 * Da dove guardo. Pura: prende ciò che l'I/O ha già accertato e torna il perimetro + cosa dichiarare.
 * @returns {{da:string|null, turno:boolean, nota:string|null}}
 */
/**
 * HEAD è lo stesso commit della base? Torna la risposta E la cecità, mai solo la risposta.
 *
 * ⚠️ AR-821 — QUI IL PRIMO GIRO AVEVA INGOIATO L'ERRORE. Era `catch { return false; }`: se git non
 * rispondeva, il confronto risultava «diverso» e nessuno sapeva che non era stato fatto. È la
 * malattia «una fonte letta a metà produce un verdetto intero», e l'ha vista la spazzata dei
 * fratelli, non io. Il `false` va bene come scelta — tenere l'ancora è la strada stretta — ma va
 * DICHIARATO: chi legge il verdetto deve poter distinguere «ho guardato e sono diversi» da «non ho
 * potuto guardare».
 *
 * Pura rispetto a git: `leggi` è la porta, così una prova la esegue senza un repo vero.
 * @returns {{uguale: boolean, cieco: string|null}}
 */
export function confrontaHeadConBase(base, leggi) {
  try {
    const dellaBase = String(leggi(["rev-parse", "--verify", "--quiet", base]) ?? "").trim();
    const diHead = String(leggi(["rev-parse", "HEAD"]) ?? "").trim();
    return { uguale: Boolean(dellaBase) && dellaBase === diHead, cieco: null };
  } catch (e) {
    const motivo = String(e?.message || "git non ha detto perché").split("\n")[0];
    return {
      uguale: false,
      cieco: `non ho potuto confrontare HEAD con «${base}» (${motivo}): tengo l'ancora del turno, che è la scelta stretta — ma il confronto non l'ho fatto.`,
    };
  }
}

export function scegliPerimetro({ ancora = null, ancoraUsabile = false, base = null, headUgualeABase = false } = {}) {
  // 🔁 IL CICLO CHE NON SI ROMPEVA MAI DA SOLO (AR-819 · 46 conferme in memoria, dal 10 al 16/8).
  //
  // L'ancora si sposta solo sui turni che si chiudono PULITI (regola ① di `siPiantaAncora`), ed è
  // giusto: spostarla su un turno bloccato farebbe sparire dal perimetro proprio ciò per cui ho
  // bloccato. Ma se HEAD è già identico a `base` (origin/main), non esiste NIENTE di non
  // pubblicato: tutto ciò che il diff ancora-vecchia…HEAD contiene è già sul ramo principale.
  // Allora il cancello trova sempre «lavoro» che nessuna sessione ha aperto, il turno risulta
  // sporco per costruzione, l'ancora non si sposta mai, e il giro dopo vede un diff ancora più
  // grande. All'infinito: 46 volte in sei giorni, con `git status --short` che intanto mostrava
  // zero o quasi.
  //
  // Qui, PRIMA di fidarsi dell'ancora, si chiede se serva ancora: HEAD pubblicato = niente da
  // lasciare indietro. Il perimetro riparte da lì e `turno: false` fa ripiantare l'ancora
  // (regola ② di `siPiantaAncora`), che è il gesto che rompe il ciclo invece di raccontarlo.
  if (headUgualeABase && base) {
    return {
      da: base,
      turno: false,
      nota: `HEAD è già uguale a «${base}»: nessun commit da pubblicare, quindi riparto da qui invece che da un'ancora rimasta indietro. Il lavoro non ancora committato, se c'è, resta dentro questo perimetro.`,
    };
  }
  if (ancora && ancoraUsabile) return { da: ancora, turno: true, nota: null };
  if (!base) return { da: null, turno: false, nota: null };
  return {
    da: base,
    turno: false,
    nota:
      ancora
        ? `l'ancora del turno precedente non è più un antenato di HEAD (rebase o reset): guardo tutto il ramo verso ${base}, quindi qui sotto può comparire lavoro di altri turni.`
        : `è la prima volta che mi fermo qui: non ho un'ancora del turno, guardo tutto il ramo verso ${base}. Il prossimo giro sarà preciso.`,
  };
}

/**
 * Si sposta l'ancora? Pura, perché è una DECISIONE: dentro `main()` nessun test la potrebbe eseguire,
 * e resterebbe provata solo dal fatto che il codice «sembra giusto» — che è come è nato AR-455.
 *
 * ① turno chiuso pulito → sì. Non basta «non ho bloccato»: la valvola anti-cappio lascia passare un
 *    secondo giro che ha ancora tutti i suoi ❌, e spostare lì farebbe sparire dal perimetro proprio
 *    ciò per cui avevo bloccato — il freno si scavalcherebbe da solo.
 * ② nessun perimetro valido (prima volta qui, o ancora invalidata da un rebase) → sì lo stesso, anche
 *    con dei ❌ aperti. Senza, il primo giro si morde la coda: debito vecchio sul ramo → ❌ → non
 *    pianto → il giro dopo è di nuovo tutto il ramo → lo stesso ❌, per sempre. Cioè esattamente il
 *    rosso ripetuto che questo intervento esiste per spegnere. Trovato collaudando, non rileggendo.
 */
/**
 * Il codice d'uscita fuori dall'hook, cioè quello che la CI legge (AR-506). Pura: è una decisione, e
 * questa è la terza volta oggi che una decisione lasciata dentro `main()` mi è costata un giro.
 *
 * Tre esiti, e il terzo è quello che mancava:
 *   2 — non ho misurato (⚪): cieco non è verde, e chi legge deve saperlo.
 *   1 — ho trovato qualcosa che va sistemato.
 *   0 — non ho trovato niente. Le righe ℹ️ non sono un problema: dicono COME ho guardato, non che
 *       ho guardato male. Prima finivano nel ramo «1», e bastava una nota — che in CI c'è SEMPRE,
 *       perché l'ancora vive fuori da git — per tenere la pipeline rossa a vita.
 */
export function uscitaFuoriDallHook({ cieco = false, righe = [] } = {}) {
  const sostanza = righe.filter((r) => !String(r).startsWith("ℹ️"));
  if (!sostanza.length) return 0;
  // ⚠️ 22/8 — QUI UN ⚪ DIVENTAVA UN ❌, e il ramo che lo impediva era spento su metà dei casi.
  //
  // Il ramo chiedeva `cieco && …`, cioè si fidava della BANDIERA invece che delle righe. Ma le
  // «incerte» — fra cui il ⚪ scritto quel giorno stesso per il file oltre il tetto — sono
  // dichiarate NON cieche apposta (vedi il commento a `noteCieche`: «si leggono, non bloccano»).
  // Quindi un verdetto fatto di quel solo ⚪ arrivava qui con `cieco: false` e usciva 1: la CI
  // bocciava, dicendo come unica ragione una riga che comincia per ⚪. Successo davvero sulla PR
  // #831: bastava aggiungere una card in cima ad AZIONI-IN-ATTESA.md — il file che Nicola legge di
  // più, e che sta sopra il tetto — perché il cancello diventasse rosso senza nessuna accusa dentro.
  //
  // La regola non ha bisogno della bandiera: **se ogni riga di sostanza è un ⚪, non ho visto tutto,
  // e un giudizio su una parte non è un giudizio sul tutto.** Basta una riga vera (❌ o 🛑) e si
  // torna a 1, che è l'unico caso in cui bloccare significa qualcosa.
  if (sostanza.every((r) => String(r).startsWith("⚪"))) return 2;
  return 1;
}

export function siPiantaAncora(righe = [], perimetroTurno = false) {
  return !righe.some((r) => String(r).startsWith("❌")) || !perimetroTurno;
}

/**
 * ⑤ I testi che Nicola leggerà e che non si capiscono (AR-478).
 *
 * Nicola, 2/8: «ho perso 2 ore solo per capire due botta e risposta nelle ultime 5 PR» e poi
 * «attacca il misuratore così viene chiamato in automatico, così non lo salti mai quando c'è
 * pressione». Prima di questo, `si-capisce.mjs` esisteva e non lo chiamava NESSUNO: era una buona
 * intenzione, cioè esattamente il tipo di rituale che salta per primo sotto pressione (AR-154).
 *
 * Sta qui e non in un guardiano nuovo per un motivo pratico: questo file gira già in due canali —
 * l'evento `Stop` (l'istante in cui dico «fatto») e il cancello del lotto, che la CI esegue su ogni
 * PR. Un aggancio solo, due porte.
 *
 * PERIMETRO: le cartelle dove Nicola legge, esclusa la storia. Briefing, DECISIONI e Sala Operativa
 * sono il registro di cosa è successo: riscriverli sarebbe cambiare il passato, non spiegarsi meglio.
 */
export const CARTELLE_DI_NICOLA = ["MyCity-Vault/90-Memoria-AI/", "consegne/"];
// `Archivio/` con la maiuscola è entrato il 23/8, e non è un allargamento: è la stessa intenzione
// scritta sopra («esclusa la storia») applicata alla cartella che si chiama archivio. Prima passava
// solo `STATO-archivio.md`, e per caso — perché quel nome contiene «archivio» minuscolo, non perché
// qualcuno avesse esentato la cartella. Quando le card chiuse della coda ci sono finite (AR-807), il
// guardiano le ha lette come un testo nuovo di 115 punti difficili scritto per Nicola. Non lo è: è
// testo già scritto mesi fa, già risposto, spostato lì proprio per toglierlo dalla lettura di tutti i
// giorni. Riscriverlo sarebbe cambiare il passato, che è esattamente ciò che l'esenzione protegge.
export const STORIA_ESENTE = /(Briefing\/|DECISIONI\.md|SALA-OPERATIVA\.md|[Aa]rchivio|quaderni\/)/;

export function testiIlleggibili(testi = [], noteAGlossario = null) {
  const fuori = [];
  for (const t of testi) {
    if (!CARTELLE_DI_NICOLA.some((c) => t.file.startsWith(c))) continue;
    if (STORIA_ESENTE.test(t.file)) continue;
    const m = misura(t.contenuto, { noteAGlossario });

    // SI MISURA IL PEGGIORAMENTO, NON IL TOTALE.
    //
    // Il primo giro dal vivo ha bocciato il GLOSSARIO per 48 punti: un file di 500 righe scritto
    // mesi fa, che avevo sfiorato per aggiungerci una parte. Con la regola sul totale, ogni ritocco
    // a un testo lungo diventa un blocco — e un cancello che non può diventare verde viene aggirato
    // al secondo giro. È scritto nella casa, ed è successo davvero al typecheck del Pannello.
    //
    // Il debito vecchio resta debito (misurato, e si riscrive a mano, un testo per volta). Quello che
    // qui NON deve passare è il debito NUOVO: un file che esce peggiore di come è entrato.
    // Un file nuovo entra da zero, quindi ogni suo problema è nuovo: lì la soglia è 0, come deve.
    // AR-755 — il livello «già pubblicato» è il peggiore fra inizio turno e main: dopo una fusione
    // le card nuove del worker sono entrate nel file senza che le abbia scritte io, e contarle come
    // mie vorrebbe dire chiedermi di riscrivere il testo di un altro per consegnare una riga.
    const contaPunti = (testo) => (testo == null ? null : misura(testo, { noteAGlossario }).problemi.length);
    const aInizioTurno = contaPunti(t.contenutoPrima);
    const suMain = contaPunti(t.contenutoSuMain);
    const prima = Math.max(aInizioTurno ?? 0, suMain ?? 0);
    if (m.problemi.length <= prima) continue;

    fuori.push({
      file: t.file,
      quanti: m.problemi.length,
      prima,
      nuovi: m.problemi.length - prima,
      primi: m.problemi.slice(0, 3),
      troncato: t.troncato === true,
    });
  }
  return fuori;
}

/**
 * ⑥-bis IL COMANDO CHE GLI SCRIVO IN CHAT E CHE NON DICE DA DOVE SI LANCIA (21/8).
 *
 * Stessa malattia di `comandi-senza-casa.mjs`, altra superficie. Quel guardiano nasce oggi per le
 * card, e le card le ha sistemate. Poi gliel'ho rifatta TRE VOLTE in chat, l'ultima un'ora dopo
 * averlo costruito: `node cervello/plugin-acceso.mjs` senza il `cd`, Nicola nella sua home, e uno
 * stack trace di Node al posto di una risposta.
 *
 * È la lezione L-2026-0810-03 pagata di nuovo: quando la malattia riguarda un COMPORTAMENTO, il
 * freno va messo su TUTTE le corsie che quel comportamento ce l'hanno, non solo su quella che ha
 * bruciato per prima. La chat è una corsia come le altre: è un file, e questo cancello lo legge già.
 *
 * Riuso `blocchi` e `orfano` invece di riscriverli: due copie della stessa regola divergono al primo
 * ritocco, ed è un difetto che questa casa ha già censito.
 */
export function comandoSenzaCasaInChat(testo) {
  if (!testo || !testo.trim()) return null;
  const trovati = [];
  for (const b of blocchi(testo)) {
    const cmd = orfano(b);
    if (cmd) trovati.push(cmd);
  }
  return trovati.length ? { quanti: trovati.length, primi: trovati.slice(0, 3) } : null;
}

/**
 * ⑥ IL MESSAGGIO CHE STO PER MANDARE A NICOLA IN CHAT (AR-481).
 *
 * Era il buco dichiarato di AR-478: «la chat non è misurabile, non è un file, nessun controllo può
 * girarci sopra». Era falso, e l'ho scoperto guardando cosa riceve l'hook `Stop`: insieme a
 * `stop_hook_active` arriva anche `transcript_path`, cioè il percorso del file dove Claude Code
 * scrive tutta la conversazione, i miei messaggi compresi.
 *
 * Quindi la chat È un file — solo, non era il file che stavo guardando. Ed è il posto dove Nicola
 * legge di più: le due ore che ha perso non erano sulle consegne, erano su cinque PR e sulla chat.
 *
 * SOLO I MESSAGGI LUNGHI. Un «fatto, il sito è tornato online» non deve avere tre blocchi e un
 * esempio: chiederglielo sarebbe rumore a ogni turno, e il rumore spegne i freni.
 */
export function messaggioIlleggibile(testo, noteAGlossario = null, precedenti = []) {
  if (!testo || !testo.trim()) return null; // niente da misurare: non accuso nessuno
  const m = misura(testo, { noteAGlossario, precedenti });
  // Le ripetizioni contano anche sui messaggi CORTI: un messaggio breve che ridice una cosa già
  // detta è il caso più frequente, ed è quello che è successo davvero il 3/8.
  //
  // Dal 4/8 (AR-532) contano allo stesso modo le ripetizioni DENTRO il messaggio e i quattro titoli
  // messi sopra due righe. Sono i due difetti che Nicola ha fotografato, e nessuno dei due ha
  // bisogno che il messaggio sia lungo per costargli tempo: il suo era di media lunghezza.
  const SEMPRE = new Set(["gia-detto", "gia-detto-qui", "blocchi-su-testo-corto"]);
  const ripetute = m.problemi.filter((p) => SEMPRE.has(p.tipo));
  if (!m.testoLungo && !ripetute.length) return null;
  const problemi = m.testoLungo ? m.problemi : ripetute;
  if (!problemi.length) return null;
  return { quanti: problemi.length, minuti: m.minuti, primi: problemi.slice(0, 4) };
}

/** ③ Le lezioni nuove che non nominano un freno: una lezione senza gate è una frase. */
export function lezioniSenzaGate(prima = [], dopo = []) {
  const gia = new Set(prima.map((l) => l.id));
  return dopo.filter((l) => !gia.has(l.id) && !String(l.gate || "").trim()).map((l) => l.id);
}

/**
 * Il verdetto. Torna le righe da dire e se si blocca.
 *
 * `giaBloccato` è la valvola anti-cappio: Claude Code passa `stop_hook_active: true` quando sta già
 * ripartendo per colpa di un blocco precedente. Bloccare di nuovo lì significherebbe un turno che non
 * finisce mai — e un freno che incastra viene spento entro il giorno, che è il peggiore degli esiti.
 */
export function verdetto({
  sorveglianza = [],
  chiusi = [],
  allarmi = [],
  lezioni = [],
  senzaEsito = null,
  insistenti = [],
  illeggibili = [],
  messaggio = null,
  comandiInChat = null,
  collaudo = [],
  ciechi = [],
  note = [],
  giaBloccato = false,
  attribuzione = { certa: true, nota: null },
} = {}) {
  const righe = [];
  // ⑦ IL COLLAUDO DEL LAVORO FINITO (AR-532, Nicola 4/8: «ricontrolla il lavoro fatto, analizzalo
  // più e più volte e completalo al 100%, così non devo dirtelo io»). Le righe arrivano già pronte
  // da cervello/collaudo.mjs — chi decide QUANDO chiederle è quel file, con la sua impronta e il suo
  // registro; qui si mettono in testa perché il ricontrollo dell'intero lavoro è l'ombrello sotto
  // cui tutti gli altri ❌ si sistemano nello stesso giro.
  for (const r of collaudo) righe.push(r);
  // Le righe della sorveglianza stanno accanto al collaudo perché rispondono alla stessa domanda —
  // «cosa è passato senza che nessuno guardasse» — solo che il collaudo guarda il lavoro e queste
  // guardano le guardie.
  for (const r of sorveglianza) righe.push(r);
  // ⚪ «NON SO COSA È TUO» (AR-507, Nicola 3/8) — l'accusa che parte prima dell'attribuzione.
  //
  // COSA È SUCCESSO. Prima chiusura di una sessione cloud: nessuna ancora del turno (vive fuori da
  // git, e il container parte da un clone fresco), quindi perimetro = tutto il ramo. Il cancello ha
  // elencato sette ❌ su 194 file e 10 commit di sessioni precedenti. In quel turno io avevo scritto
  // ZERO file del repo — l'albero era pulito, verificato con `git status`.
  //
  // PERCHÉ NON BASTAVA LA NOTA. La riga ℹ️ in fondo diceva la verità («guardo tutto il ramo»), ma
  // sopra c'erano sette ❌ scritti in prima persona: «ho scritto un allarme», «questo lavoro gli ha
  // aggiunto 29 punti difficili». Un cancello che accusa di cose non tue è la definizione operativa
  // del rosso che si impara ad aggirare — la stessa taratura che il sorvegliante si è dato guardando
  // solo il delta, «così parte verde per costruzione», e che questo cancello non si era dato.
  //
  // LA CURA, e i suoi confini. Quando l'attribuzione NON è certa, i due controlli che leggono il
  // perimetro (l'allarme non accodato, il testo peggiorato) non spariscono e non accusano: escono ⚪
  // «non so cosa è tuo», si leggono, e non bloccano il turno. Gli altri restano ❌ perché non
  // dipendono dall'ancora — ① e ③ confrontano HEAD col disco (sono modifiche non committate, cioè
  // mie per definizione), ⑤ e ⑥ vivono nella sessione (il battito, la chat), ④ è per-RAMO per scelta
  // dichiarata (AR-477: l'unità di consegna è la PR, non il turno).
  //
  // NON è un'esenzione permanente: chi chiama passa `certa: false` solo dentro l'hook `Stop` e solo
  // finché l'ancora manca. L'ancora si pianta alla fine di questo stesso giro, quindi il turno dopo
  // il freno è pieno. Fuori dall'hook — CI, comando a mano — resta tutto ❌: lì il perimetro-ramo è
  // quello giusto, perché l'unità di consegna è la PR.
  const incerte = [];
  const accusa = (riga, attribuita = false) => {
    if (attribuita && !attribuzione.certa) {
      incerte.push(`⚪ non so cosa è tuo: ${riga.split("\n")[0].replace(/^❌ /, "")}`);
      return;
    }
    righe.push(riga);
  };
  // ⑤ L'AVVISO CHE HO IGNORATO (AR-497). Il sorvegliante parla a ogni modifica; fino al 3/8 nessuno
  // guardava se avessi fatto qualcosa. Una voce grave tornata tre volte e ancora viva all'ultimo
  // scatto non è più un avviso: è una decisione presa senza dirlo.
  for (const v of insistenti) {
    righe.push(
      `❌ il sorvegliante me l'ha detto ${v.n} volte e sta ancora lì: ${v.file}` +
        `\n   → ${v.cosa}` +
        `\n   → o la riparo, o la dichiaro esente con il perché scritto. Ignorarla in silenzio è la terza via che non esiste.`,
    );
  }
  for (const d of chiusi) {
    righe.push(
      `❌ ${d.id} l'ho chiuso senza una prova che possa fallire${d.debole ? " (c'è solo la forma debole file+pattern)" : ""}` +
        `\n   → ${d.titolo}\n   → aggiungi "verifica": { "comando": "node cervello/test/…" }, oppure riaprilo: chiuso senza prova è archiviato, non riparato.`,
    );
  }
  for (const f of allarmi) {
    accusa(
      `❌ ho scritto un allarme in ${f} e non ho messo niente in AZIONI-IN-ATTESA.md` +
        `\n   → chi lo legge, e quando? Se la risposta è «nessuno, se non va a cercarlo», non ho finito.`,
      true,
    );
  }
  for (const id of lezioni) {
    righe.push(`❌ la lezione ${id} non nomina nessun freno\n   → una lezione senza gate è una frase: quale comando fallisce se viene violata?`);
  }
  if (senzaEsito) {
    righe.push(
      (senzaEsito.dopo > 0
        ? `❌ ho committato codice DOPO l'ultima riga di esito: ${senzaEsito.dopo} commit di lavoro che nessuna riga racconta (AR-477)` +
          `\n   → una riga c'è, ma parla del lavoro di prima: la prima riga non compra il lasciapassare per tutto il ramo.`
        : `❌ ho committato ${senzaEsito.quanti} file di lavoro e non ho lasciato una riga di esito in nessun quaderno (AR-154)` +
          (senzaEsito.quadernoToccato
            ? `\n   → un quaderno l'ho toccato, ma non c'è nessuna riga nuova con «atteso … → reale …»: quella è la parte che vale.`
            : "")) +
        `\n   → ${senzaEsito.esempio.join(", ")}${senzaEsito.quanti > senzaEsito.esempio.length ? ", …" : ""}` +
        `\n   → node cervello/chiusura-loop.mjs registra <reparto> "<contesto>" "<scorecard>" "<atteso>" "<reale>" "#tag"` +
        `\n   → atteso→reale è la calibrazione: senza, il lavoro è fatto e nessuno impara niente da com'è andato.`,
    );
  }
  for (const t of illeggibili) {
    // ⚠️ 22/8 — UN FILE TAGLIATO NON PUÒ ACCUSARE NESSUNO, e questo cancello lo faceva.
    //
    // Il testo si misura tagliato al tetto. Su un file che il tetto lo supera, le due versioni
    // confrontate coprono PORZIONI DIVERSE: basta aggiungere un paragrafo in cima perché un pezzo
    // che prima stava fuori dalla finestra ci entri, e i suoi problemi risultino «aggiunti da te».
    //
    // È successo davvero. Su AZIONI-IN-ATTESA.md (250.809 caratteri, tetto 200.000) il cancello ha
    // detto «+3 punti difficili» e poi «+2»: **nessuno dei nove punti era nel mio testo** — stavano
    // alle righe 1, 1428 e 1445, dentro carte scritte giorni prima. Misurato sul file INTERO, il
    // delta era ZERO. Due giri di riscrittura spesi a limare un testo che non era il problema.
    //
    // È esattamente la malattia già scritta in questo file per un altro caso: «un cancello che
    // accusa di cose non tue è la definizione operativa del rosso che si impara ad aggirare».
    // Quindi: se il testo è tagliato, il verdetto NON è ❌ ma ⚪ — non ho visto tutto, e un giudizio
    // su una parte non è un giudizio sul tutto. Il tetto intanto è salito abbastanza da contenere i
    // file veri (vedi TETTO_TESTO). Oggi ⚪ NON è l'eccezione: tre testi vivi lo sfondano, e quanto
    // testo resti fuori lo dice `cervello/campo-visivo-memoria.mjs` a ogni lotto (AR-807).
    if (t.troncato) {
      incerte.push(
        `⚪ ${t.file} supera i ${TETTO_TESTO} caratteri: ho potuto leggerne solo la prima parte.` +
          `\n   → Su un testo tagliato le due versioni coprono porzioni diverse, quindi un «hai peggiorato di ${t.nuovi}»` +
          ` sarebbe un'accusa che non ho misurato: non la faccio.` +
          `\n   → La cura vera è accorciare il file (archiviare le carte chiuse), non riscrivere righe a caso.` +
          `\n   → node cervello/si-capisce.mjs ${t.file}`,
      );
      continue;
    }
    accusa(
      `❌ ${t.file} lo leggerà Nicola e questo lavoro gli ha aggiunto ${t.nuovi} punti difficili` +
        ` (era ${t.prima}, adesso ${t.quanti} — AR-478)` +
        t.primi.map((p) => `\n   → ${p.dico}${p.frase ? `\n     «${p.frase}»` : ` (riga ${p.riga})`}`).join("") +
        `\n   → node cervello/si-capisce.mjs ${t.file}` +
        `\n   → la sostanza NON si toglie: i termini tecnici e i ragionamenti restano, si spiegano dove servono.`,
      true,
    );
  }
  if (messaggio) {
    righe.push(
      `❌ il messaggio che sto per mandarti in chat ha ${messaggio.quanti} punti che ti costringono a rileggere` +
        ` (~${messaggio.minuti} min di lettura — AR-481)` +
        messaggio.primi.map((p) => `\n   → ${p.dico}${p.frase ? `\n     «${p.frase}»` : ""}`).join("") +
        `\n   → riscrivilo PRIMA di chiudere il turno: la chat è il posto dove Nicola legge di più.` +
        `\n   → la sostanza resta tutta: si riscrive la forma, non si toglie il contenuto.`,
    );
  }
  if (comandiInChat) {
    righe.push(
      `❌ sto per dargli ${comandiInChat.quanti} comando/i senza dire da QUALE cartella si lanciano` +
        comandiInChat.primi.map((c) => `\n   → ${c}`).join("") +
        `\n   → quei percorsi esistono solo dentro la cartella del progetto, e lui lancia dal server.` +
        `\n   → metti il \`cd\` nello stesso blocco: è successo il 4/8 e due volte il 21/8, e ogni` +
        `\n     volta lui riceve uno stack trace di Node al posto di una risposta.`,
    );
  }
  // ⚪ CIECO NON È VERDE (limite ③ della prima stesura). Quando non trovo un ramo con cui confrontarmi
  // — clone superficiale, `origin/main` assente — il controllo ④ non gira. Prima quel caso taceva, e
  // un silenzio è indistinguibile da un «va tutto bene»: esattamente la malattia che questo file cura.
  //
  // MA ⚪ NON È NEMMENO UN CESTINO (AR-506, trovato dalla CI il 3/8). «Non ho potuto misurare» e «ho
  // misurato, in modo diverso da come farei a casa» sono due cose diverse, e io le avevo messe nello
  // stesso posto: l'ancora del turno assente e il registro del sorvegliante assente finivano fra i
  // ciechi. In CI quei due file NON POSSONO esistere — vivono fuori da git apposta — quindi il
  // cancello usciva 2 a ogni giro, per costruzione, e la CI restava rossa per sempre. Un cancello che
  // non può diventare verde viene aggirato al secondo giro: è scritto in questa stessa casa, ed è
  // successo davvero al typecheck del Pannello.
  //
  // Quindi due canali: `ciechi` = non ho guardato (esce 2), `note` = ho guardato così (si legge e
  // basta). La differenza la decide chi CHIAMA, che è l'unico a sapere se la misura è avvenuta.
  // Le incerte stanno con le ⚪ e non con le ❌: si leggono, non bloccano, e NON contano come
  // «cieco» — cieco vuol dire «non ho guardato», mentre qui ho guardato e non so di chi sia. La
  // riga che lo spiega arriva da `attribuzione.nota`, così il ⚪ non resta senza il suo perché.
  const notaDaSola = incerte.length && attribuzione.nota && !note.includes(attribuzione.nota);
  const noteCieche = [
    ...incerte,
    ...(notaDaSola ? [`ℹ️  ${attribuzione.nota}`] : []),
    ...ciechi.map((c) => `⚪ ${c}`),
    ...note.map((n) => `ℹ️  ${n}`),
  ];
  if (!righe.length) return { blocca: false, cieco: ciechi.length > 0, righe: noteCieche };
  if (giaBloccato) {
    return {
      blocca: false,
      cieco: ciechi.length > 0,
      righe: ["🛑 il cancello dello stop aveva già fermato questo turno: non blocco una seconda volta.", ...righe, ...noteCieche],
    };
  }
  return { blocca: true, cieco: ciechi.length > 0, righe: ["🛑 CANCELLO DELLO STOP — stavo per lasciare indietro questo:", ...righe, ...noteCieche] };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — git e filesystem. Sottile per scelta: tutto ciò che decide sta sopra.
// ─────────────────────────────────────────────────────────────────────────────

// `stderr: "pipe"` NON è cosmetico: senza, il «fatal: path … exists on disk, but not in origin/main»
// di git finiva dentro il verdetto che leggo io, sopra il messaggio vero. Un verdetto sporco si
// legge peggio, ed è esattamente il difetto che questo file esiste per combattere.
const git = (args) =>
  execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });

/** Il file com'era all'ultimo commit. `null` = non c'era (e allora «prima» è vuoto, non un errore). */
function daHead(percorso) {
  return daRif("HEAD", percorso);
}

/** Lo stesso file com'era in un qualsiasi commit. Serve al secondo genitore di una fusione. */
function daRif(rif, percorso) {
  try {
    return JSON.parse(git(["show", `${rif}:${percorso}`]));
  } catch {
    return null;
  }
}

/**
 * L'ALTRO lato di una fusione in corso, se ce n'è una. `null` fuori da un merge (il caso normale).
 *
 * `.git/MERGE_HEAD` esiste solo fra `git merge` e il commit che lo chiude: è la finestra in cui il
 * disco contiene il lavoro di due rami e HEAD ne conosce uno solo. Fuori da quella finestra questa
 * funzione non cambia niente, ed è il motivo per cui la si può aggiungere senza allargare nulla.
 */
function altroGenitoreDelMerge() {
  try {
    const rif = readFileSync(join(REPO, ".git", "MERGE_HEAD"), "utf8").trim().split("\n")[0];
    return /^[0-9a-f]{7,40}$/.test(rif) ? rif : null;
  } catch {
    return null; // nessuna fusione in corso: il caso normale
  }
}

function daDisco(percorso) {
  try {
    return JSON.parse(readFileSync(join(REPO, percorso), "utf8"));
  } catch {
    return null;
  }
}

/**
 * I documenti NUOVI che questo lavoro ha scritto, col loro contenuto.
 *
 * Solo i file appena creati, e solo `.md`. Non è pigrizia, è la lezione «menzione ≠ istanza» pagata
 * due volte in questo repo: alla prima prova dal vivo il cancello ha accusato `cantiere-difetti.json`
 * di essere un allarme non accodato — mentre quel file NOMINA i bloccanti per mestiere, è il registro.
 * Un guardiano che grida sul proprio registro viene spento entro il giorno.
 *
 * Nessun elenco di file esenti: sarebbe il perimetro letterale di AR-347, e domani un registro nuovo
 * rimetterebbe il falso positivo. La regola è generale — un allarme è un DOCUMENTO che nasce adesso,
 * non un registro che si aggiorna.
 *
 * Il buco che restava — «un allarme aggiunto in fondo a un documento che esisteva già non viene
 * visto» — lo chiude `righeAggiunteNelle()` qui sotto, sulle consegne committate.
 */
function fileDelLavoro() {
  let righe = [];
  try {
    righe = git(["status", "--porcelain"]).split("\n").filter(Boolean);
  } catch {
    return { file: [], codaToccata: false };
  }
  const codaToccata = righe.some((r) => r.slice(3).trim() === CODA);
  const nuovi = righe.filter((r) => /^(\?\?|A |AM)/.test(r)).map((r) => r.slice(3).trim());
  const file = [];
  for (const p of nuovi) {
    if (!/\.md$/.test(p) || p === CODA) continue;
    try {
      const abs = join(REPO, p);
      if (!existsSync(abs)) continue;
      file.push({ file: p, contenuto: alTetto(readFileSync(abs, "utf8")) });
    } catch {
      // Illeggibile: non è una colpa, è un file che non posso guardare. Taccio invece di accusare.
    }
  }
  return { file, codaToccata };
}

/**
 * AR-642 — QUALI controlli dichiarare ciechi quando un diff non è calcolabile. Pura ed esportata:
 * un test la esegue passando i `null` che il catch di git produce davvero, invece di rileggerla.
 *
 * Il buco, in una sessione cloud (clone superficiale): la base `origin/main` ESISTE come riferimento,
 * ma `git diff origin/main...HEAD` fallisce («no merge base»). Prima di questa funzione succedevano
 * due cose sbagliate insieme: ① l'unico cieco dichiarato MENTIVA («non ho trovato un ramo con cui
 * confrontarmi») mentre il ramo c'era — era il diff a non essere calcolabile; ② due controlli
 * venivano SALTATI in silenzio, senza nemmeno un ⚪: l'allarme nelle consegne già committate
 * (`consegneModificate` → allarmiSenzaCoda) e la coda già toccata nel perimetro
 * (`codaNelPerimetro`). In più il controllo sui testi peggiorati ripiegava in silenzio sui soli file
 * non committati. Un metro che non può misurare dev'essere CIECO (e dirlo), non tacere.
 *
 * `null` = «git non ha risposto» (è ciò che i catch tornano); un array — anche vuoto — = misurato.
 */
export function ciechiPerDiffNonCalcolabile({
  base = null,
  committati = null,
  righeQuaderni = null,
  perimetroDa = null,
  consegneModificate = null,
  codaNelPerimetro = null,
  testiSoloDisco = false,
} = {}) {
  const ciechi = [];
  // AR-821: se il confronto HEAD/base non si è potuto fare, il verdetto lo deve sapere.
  if (confrontoHead.cieco) ciechi.push(confrontoHead.cieco);
  if (!base) {
    ciechi.push(
      "non ho trovato un ramo con cui confrontarmi (né origin/main né main): il controllo sull'esito del lavoro consegnato NON ha misurato. Il verde qui sotto non copre quella parte.",
    );
  } else if (committati === null || righeQuaderni === null) {
    ciechi.push(
      `il diff con «${base}» non è calcolabile (clone superficiale senza merge base?): il controllo sull'esito del lavoro consegnato NON ha misurato. Il verde qui sotto non copre quella parte (AR-642).`,
    );
  }
  if (perimetroDa) {
    const saltati = [];
    if (consegneModificate === null) saltati.push("gli allarmi nelle consegne già committate");
    if (codaNelPerimetro === null) saltati.push("la coda già toccata nel perimetro");
    if (saltati.length) {
      ciechi.push(
        `il diff con «${perimetroDa}» non è calcolabile: cieco su ${saltati.join(" e ")} — prima questi controlli venivano saltati in silenzio (AR-642).`,
      );
    }
  }
  if (testiSoloDisco) {
    ciechi.push(
      "nessuna base è diffabile da qui: il controllo sui testi che leggerà Nicola copre SOLO i file non ancora committati, non quelli già sul ramo (AR-642).",
    );
  }
  return ciechi;
}

/** La base con cui confrontarsi. `null` = non l'ho trovata, e allora il controllo ④ è CIECO. */
function baseDelRamo() {
  for (const base of ["origin/main", "main"]) {
    try {
      git(["rev-parse", "--verify", "--quiet", base]);
      return base;
    } catch {
      // provo la base successiva: un riferimento assente non e' un verdetto.
    }
  }
  return null;
}

/** L'ancora dell'ultimo turno chiuso pulito, se è ancora un antenato di HEAD. */
function ancoraDelTurno() {
  let commit = null;
  try {
    commit = JSON.parse(readFileSync(join(REPO, ANCORA), "utf8")).commit || null;
  } catch {
    return { ancora: null, ancoraUsabile: false };
  }
  if (!commit) return { ancora: null, ancoraUsabile: false };
  try {
    // Antenato di HEAD, non solo esistente: dopo un rebase il vecchio commit c'è ancora ma non
    // racconta più niente di questo ramo, e un `diff` da lì darebbe un perimetro inventato.
    git(["merge-base", "--is-ancestor", commit, "HEAD"]);
    return { ancora: commit, ancoraUsabile: true };
  } catch {
    return { ancora: commit, ancoraUsabile: false };
  }
}

/** C'è del lavoro non committato in questa copia? Distingue «nessuno ha scritto qui» (un clone
 *  fresco, la CI) da «qualcuno ha scritto e la guardia non ha parlato» — vedi AR-506. */
function alberoSporco() {
  try {
    return execFileSync("git", ["status", "--porcelain"], { cwd: REPO, encoding: "utf8" }).trim().length > 0;
  } catch {
    // Se git non risponde non deduco «pulito»: senza quella misura non posso distinguere i due casi,
    // e il caso che costa di più è dichiarare pulito ciò che non ho guardato.
    return true;
  }
}

/** Pianta l'ancora sul turno appena chiuso. Solo sui turni PULITI: vedi il perché in testa. */
function piantaAncora() {
  try {
    const commit = git(["rev-parse", "HEAD"]).trim();
    writeFileSync(join(REPO, ANCORA), JSON.stringify({ commit, quando: new Date().toISOString() }));
  } catch {
    // Un'ancora che non si scrive non deve rompere la chiusura del turno: il giro dopo il perimetro
    // sarà il ramo, dichiarato. Peggiore, non falso.
  }
}

/** I file che questo ramo ha COMMITTATO rispetto alla base: il lavoro consegnato, non quello in corso. */
function fileCommittatiSulRamo(base) {
  // Dalla PORTA, non da git a mano (AR-339): con un nome accentato git restituisce il percorso citato
  // in ottali, e un quaderno con l'accento smetterebbe di contare come esito scritto. Preso dal
  // guardiano che quella regola la fa rispettare — la seconda volta oggi, sullo stesso errore.
  try {
    return percorsiDaGit(["diff", `${base}...HEAD`, "--name-only"], { cwd: REPO });
  } catch {
    return null;
  }
}

/**
 * Quanti commit di CODICE stanno dopo l'ultimo commit che ha aggiunto una riga di esito (AR-477).
 *
 * `null` = non ho potuto misurare, e allora non accuso nessuno. Il criterio per git è lo stesso di
 * `RIGA_ESITO` scritto nel dialetto delle espressioni regolari di base (`\d`, `\b`, `\s` lì non
 * esistono): la coerenza fra le due scritture è difesa da una prova, non dalla buona volontà.
 */
export const CERCA_ESITO_IN_GIT = "atteso .*→ .*reale";

/**
 * Gli argomenti per cercare l'ultimo esito nella storia — fusioni COMPRESE. (AR-505.)
 *
 * `git log -G` non calcola i diff dei commit di merge: li salta per costruzione. Quindi chi risolve
 * un conflitto e registra l'esito nello stesso commit — cioè il flusso naturale, e stanotte l'ho
 * fatto tre volte — risulta muto, e il freno accusa proprio chi ha appena obbedito.
 *
 * `--diff-merges=first-parent` è la risposta esatta: mostra il diff della fusione rispetto a DOVE
 * ERO IO, cioè quello che quel commit ha davvero aggiunto al mio ramo. Non allarga niente — su un
 * commit normale non cambia nulla — e non guarda dentro il ramo che arriva, che è lavoro di altri.
 *
 * Sta qui fuori, esportata e pura, perché una prova possa ESEGUIRE la scelta invece di rileggerla:
 * la scheda diceva «con una prova che parta ROSSA su un ramo dove l'unica riga di esito vive in un
 * commit di merge», ed è così che è stata chiusa.
 */
export const ARGOMENTI_CERCA_ESITO = ["log", "-1", "--format=%H", "-G", CERCA_ESITO_IN_GIT, "--diff-merges=first-parent"];

function codiceDopoUltimoEsito(base) {
  const esclusioni = CARTELLE_MEMORIA.map((c) => `:(exclude)${c.replace(/\/$/, "")}`);
  try {
    const ultimoEsito = git([...ARGOMENTI_CERCA_ESITO, `${base}..HEAD`, "--", "memoria-squadra"]).trim();
    if (!ultimoEsito) return null; // nessun esito sul ramo: lo gestisce il caso base, non questo
    return Number(git(["rev-list", "--count", `${ultimoEsito}..HEAD`, "--", ".", ...esclusioni]).trim());
  } catch {
    return null;
  }
}

/**
 * Le righe AGGIUNTE dal ramo nei file che stanno sotto una certa cartella.
 *
 * Il contenuto di un diff, non i suoi percorsi: qui la porta di AR-339 non serve (quella difende dai
 * NOMI citati in ottali), e infatti i nomi qui non si usano per decidere — si usano per raggruppare.
 * `-U0` perché il contesto non è stato aggiunto da questo lavoro: contarlo darebbe allarmi che c'erano
 * già, cioè un guardiano che accusa il passato.
 */
function righeAggiunteNelle(base, cartella, soloMd = true) {
  let grezzo;
  try {
    grezzo = git(["diff", "-U0", "--no-color", `${base}...HEAD`, "--", cartella]);
  } catch {
    return null;
  }
  const perFile = new Map();
  let corrente = null;
  for (const riga of grezzo.split("\n")) {
    const m = /^\+\+\+ b\/(.+)$/.exec(riga);
    if (m) {
      corrente = m[1] === "/dev/null" || (soloMd && !m[1].endsWith(".md")) ? null : m[1];
      if (corrente && !perFile.has(corrente)) perFile.set(corrente, []);
      continue;
    }
    if (corrente && riga.startsWith("+") && !riga.startsWith("+++")) perFile.get(corrente).push(riga.slice(1));
  }
  return [...perFile.entries()].map(([file, righe]) => ({ file, righe }));
}

/**
 * Da dove si guarda un testo: l'ancora del turno per prima, poi le basi del ramo (AR-507).
 *
 * Sta qui fuori — pura, esportata, provata — per una ragione precisa: dentro `testoDiBase` sarebbe
 * stata una riga che «sembra giusta» e nessun test avrebbe potuto eseguirla, cioè il modo esatto in
 * cui è nato AR-455 (chiuso sulla lettera, non sull'effetto). L'ordine È la regola: se l'ancora
 * scivola dopo `origin/main`, il confronto torna silenziosamente a tutto il ramo e il fix sparisce
 * senza che niente diventi rosso.
 */
export function basiPerIlTesto(da = null) {
  return [da, "origin/main", "main"].filter(Boolean);
}

/**
 * Quali testi del perimetro del turno sono DAVVERO miei (AR-657).
 *
 * Il perimetro del turno è `ancora...HEAD`. Se in mezzo ho fuso il ramo di base — cosa che capita a
 * ogni PR lunga, perché `main` si muove — dentro quel perimetro finisce anche tutto ciò che main ha
 * portato: il 13/8 erano i piani, la bacheca e lo STATO riscritto dal giro delle 19:20, e il cancello
 * me ne ha accusato («questo lavoro gli ha aggiunto 10 punti difficili») bloccando la consegna.
 * È la forma di AR-507 — accusare di cose non tue — per la strada che quel fix non guardava.
 *
 * La cura è un'intersezione: mio = nel turno E non già dentro il ramo di base. Se ciò che c'è sul
 * ramo non è calcolabile, NON si filtra (meglio accusare troppo che assolvere in silenzio) e chi
 * chiama lo dichiara fra i ciechi.
 */
export function testiMiei({ disco = [], nelTurno = [], sulRamo = null } = {}) {
  const commessi = Array.isArray(sulRamo) ? nelTurno.filter((p) => sulRamo.includes(p)) : nelTurno;
  return [...new Set([...disco, ...commessi])];
}

/**
 * Il testo com'era prima. `null` = non c'era, quindi è tutto nuovo.
 *
 * `da` è l'ancora del turno quando c'è (AR-507): senza, il «prima» era sempre la punta di main, e il
 * peggioramento di un testo scritto tre turni fa tornava a carico di questo. Con l'ancora il confronto
 * parte da dove ho cominciato IO, ed è la stessa domanda ristretta al perimetro giusto.
 */
function testoDiBase(percorso, da = null) {
  for (const base of basiPerIlTesto(da)) {
    try {
      return git(["show", `${base}:${percorso}`]);
    } catch {
      // il file non c'era su quella base, oppure la base non esiste: provo la prossima
    }
  }
  return null;
}

/**
 * Un file da misurare, o `null` se non è lavoro di questo lotto.
 *
 * UN FILE IDENTICO A `origin/main` NON È LAVORO DI QUESTO TURNO, ED È IL CASO DEL MERGE.
 *
 * Il ramo fonde main a ogni giro del worker (la coda, lo STATO e il RITMO li riscrive lui): il
 * merge porta dentro decine di file che non ho toccato, e il perimetro `ancora...HEAD` li vede
 * come «cambiati adesso». Il 13/8 il verdetto diceva «questo lavoro gli ha aggiunto 13 punti
 * difficili» su STATO.md e RITMO.md — identici a `origin/main` riga per riga, scritti dal worker,
 * già pubblicati. È la stessa malattia dichiarata più sopra («un cancello che accusa di cose non
 * tue»), curata lì per il perimetro incerto e rimasta aperta qui per il merge.
 *
 * Non è silenzio sul debito: quel debito resta, ed è del lotto che l'ha scritto. Qui si misura
 * solo ciò che questo lotto consegna DI SUO — un file che su main non c'è, o che rispetto a main
 * è cambiato, torna a essere misurato per intero.
 *
 * ⚠️ AR-755 — «identico a main» era un confine troppo stretto, e il 16/8 l'ha mostrato: la coda
 * delle azioni differiva da main per UNA riga (una card rinumerata, per togliere un numero doppio) e
 * l'intero file — ventunmila parole scritte dal worker — è tornato a essere mio. Il verdetto diceva
 * «questo lavoro gli ha aggiunto 33 punti difficili»: quei 33 li aveva scritti il worker su main,
 * misurati lì valgono identici. Un cancello che chiede di riscrivere il testo di un altro per poter
 * consegnare una riga cambiata è un cancello che si impara ad aggirare.
 *
 * Perciò il termine di paragone non è solo «com'era a inizio turno», ma **il peggiore fra inizio
 * turno e main**: entrambi sono testo già pubblicato, e nessuno dei due l'ha scritto questo lavoro.
 * Resta un buco, e lo dichiaro invece di tacerlo: se un ramo avesse MIGLIORATO un file sotto il
 * livello di main, potrebbe poi riportarlo a quel livello senza che qui scatti niente. Chiuderlo
 * richiede confrontare le frasi una per una invece dei totali — è il passo dopo, non questo.
 *
 * I tre lettori si passano da fuori perché la regola si possa provare senza un repo git.
 */
/**
 * Quanti caratteri di un testo si misurano. Oltre, si taglia — e chi legge il verdetto lo deve sapere.
 * Il numero vive QUI e non dentro chi legge il file: era in due posti e uno solo dei due lo applicava.
 */
// Il tetto serve a non far esplodere il tempo di misura su un file gigante.
//
// 22/8 — L'AVEVO ALZATO A 400.000 E HO FATTO MARCIA INDIETRO. Il motivo era buono sulla carta (il
// file che Nicola legge di più ne fa 250.809, quindi finiva sempre nel ramo tagliato dove il
// confronto non è valido) e l'argomento pure: questa soglia è un campo visivo, non una tolleranza,
// e alzarla rende il cancello più severo. Misurato: 229 punti a 200.000, 311 a 400.000.
//
// Il sorvegliante me l'ha contestato sette volte di fila, e aveva ragione LUI. Non perché
// l'argomento fosse falso, ma perché **una soglia che sale è la mossa che nasconde i problemi**, e
// un lettore fra sei mesi non può distinguere la mia buona ragione da una scusa. Un freno che si
// piega davanti a un ragionamento convincente non è un freno.
//
// La cura vera non è il tetto: è il file. E NON È FATTA — questa riga il 22/8 diceva «il file è
// tornato sotto misura», e il 23/8 non era più vero: la coda è di nuovo a 269.658 caratteri, e con
// lei SALA-OPERATIVA e RADIOGRAFIA-MACCHINA. Il ⚪ è tornato a essere la regola su tre testi vivi.
// Da qui in poi quel buco non si scopre più di rimbalzo: `cervello/campo-visivo-memoria.mjs` lo
// somma a ogni lotto sotto un tetto che scende e non risale (AR-807).
export const TETTO_TESTO = 200_000;

/** Taglia al tetto. `null` resta `null`: «il file non c'è» non diventa «il file è vuoto». */
const alTetto = (t) => (typeof t === "string" ? t.slice(0, TETTO_TESTO) : t);

/**
 * ⚠️ IL TETTO SI APPLICA A TUTTI E TRE, e la ragione è un rosso che nessuno poteva far diventare verde.
 *
 * Il 21/8 questo cancello ha bocciato una PR con «la coda ti ha aggiunto 1 punti difficili (era 273,
 * adesso 274)» — su un file che riga per riga era identico a quello pubblicato più una card nuova che
 * di punti difficili non ne aveva nemmeno uno. Il conto non tornava per un motivo solo: il testo di
 * ADESSO arrivava tagliato a 200.000 caratteri (lo tagliava chi lo leggeva dal disco) e i due testi di
 * confronto arrivavano INTERI (chi li tira fuori da git non taglia niente). La coda ne ha 203.000.
 *
 * Quindi si misuravano due testi diversi e si chiamava «peggioramento» la differenza fra loro. Per
 * ogni file oltre il tetto il verdetto era +1 fisso, e nessuna riscrittura poteva toglierlo: un rosso
 * che non può diventare verde è un rosso che si impara ad aggirare, che è il modo in cui un cancello
 * muore.
 *
 * Peggio: la scorciatoia qui sotto — «identico a quello pubblicato, quindi non è lavoro mio» — su un
 * file oltre il tetto non poteva scattare MAI, perché confrontava un testo tagliato con uno intero.
 * La difesa scritta apposta per il caso della fusione era spenta proprio sui file grossi, cioè quelli
 * che la fusione tocca sempre.
 *
 * È la malattia che il repo ha già in elenco: *una fonte letta a metà produce un verdetto intero*.
 * Qui stava dentro il guardiano.
 */
export function testoDaMisurare(file, { ora, pubblicato, prima }) {
  const contenuto = alTetto(ora());
  const suMain = alTetto(pubblicato());
  if (contenuto === suMain) return null;
  return {
    file,
    contenuto,
    contenutoPrima: alTetto(prima()),
    contenutoSuMain: suMain,
    // Il taglio non si nasconde: chi scrive il verdetto lo dice, perché di quel testo una parte non
    // l'ho guardata e un giudizio su una parte non è un giudizio sul tutto.
    troncato: typeof contenuto === "string" && contenuto.length >= TETTO_TESTO,
  };
}

/**
 * I testi che questo lavoro sta consegnando a Nicola: modificati nell'albero di lavoro OPPURE già
 * committati sul ramo. Servono entrambi — il primo prende il testo che sto scrivendo adesso, il
 * secondo quello che ho scritto tre commit fa e che uscirà lo stesso con la PR.
 *
 * Non usa `fileDelLavoro()` perché quello guarda solo i file NUOVI: un testo peggiorato riscrivendolo
 * è il caso più probabile, ed era proprio quello che sfuggiva.
 */
function testiToccati(da = null) {
  const percorsi = new Set();
  try {
    for (const r of git(["status", "--porcelain"]).split("\n").filter(Boolean)) {
      const p = r.slice(3).trim().split(" -> ").pop();
      if (p.endsWith(".md")) percorsi.add(p);
    }
  } catch {
    // niente git: resta l'elenco vuoto, e un elenco vuoto non accusa nessuno
  }
  // AR-507: l'ancora del turno PRIMA delle basi del ramo. Questa riga è il difetto vero trovato il
  // 3/8 — il perimetro del turno esisteva già (AR-496) e questa funzione non lo chiedeva a nessuno,
  // quindi i .md venivano presi da tutto il ramo A OGNI turno, non solo al primo. Il verdetto che ha
  // fermato la sessione del 3/8 elencava sei testi: BACHECA, GLOSSARIO, STATO e tre consegne, gli
  // ultimi tocchi datati 31/7 e 1/8, in commit di sessioni chiuse giorni prima.
  // AR-642: se NESSUNA base è diffabile (clone superficiale), prima si ripiegava in silenzio sui
  // soli file del disco. La perdita ora si dichiara: `soloDisco` finisce fra i ciechi del verdetto.
  let baseLetta = null;
  const nelTurno = [];
  for (const base of basiPerIlTesto(da)) {
    try {
      for (const p of percorsiDaGit(["diff", `${base}...HEAD`, "--name-only"], { cwd: REPO })) {
        if (p.endsWith(".md")) nelTurno.push(p);
      }
      baseLetta = base;
      break;
    } catch {
      // provo la base successiva
    }
  }
  // AR-657: se il perimetro viene dall'ancora del turno, va intersecato con ciò che il ramo aggiunge
  // a `main` — altrimenti una fusione del ramo di base mi fa carico dei suoi file. Quando il
  // perimetro è già il ramo (baseLetta è una delle basi), l'intersezione non serve.
  let sulRamo = null;
  if (baseLetta && !["origin/main", "main"].includes(baseLetta)) {
    for (const b of ["origin/main", "main"]) {
      try {
        sulRamo = percorsiDaGit(["diff", `${b}...HEAD`, "--name-only"], { cwd: REPO });
        break;
      } catch {
        // provo l'altra base: senza, `sulRamo` resta null e non si filtra niente
      }
    }
  }
  for (const p of testiMiei({ disco: [...percorsi], nelTurno, sulRamo })) percorsi.add(p);
  const testi = [];
  for (const p of percorsi) {
    try {
      const abs = join(REPO, p);
      if (!existsSync(abs)) continue;
      const t = testoDaMisurare(p, {
        ora: () => readFileSync(abs, "utf8"),
        pubblicato: () => testoDiBase(p, "origin/main"),
        prima: () => testoDiBase(p, da),
      });
      if (t) testi.push(t);
    } catch {
      // illeggibile: taccio invece di accusare
    }
  }
  return { testi, soloDisco: baseLetta === null };
}

/**
 * L'ultimo messaggio che ho scritto in chat, preso dalla trascrizione della sessione.
 *
 * Legge solo la CODA del file: una sessione lunga arriva a decine di MB, e l'hook ha 20 secondi.
 * La prima riga letta è quasi sempre spezzata a metà, quindi si scarta.
 */
/** Tutti i miei messaggi di testo nella coda letta, dal più vecchio al più recente. */
export function testiAssistente(righeJsonl = []) {
  const fuori = [];
  for (const riga of righeJsonl) {
    let ev;
    try {
      ev = JSON.parse(riga);
    } catch {
      continue;
    }
    if (ev?.type !== "assistant") continue;
    const pezzi = ev?.message?.content;
    if (!Array.isArray(pezzi)) continue;
    const testo = pezzi
      .filter((p) => p?.type === "text" && String(p.text || "").trim())
      .map((p) => p.text)
      .join("\n");
    if (testo.trim()) fuori.push(testo);
  }
  return fuori;
}

export function ultimoTestoAssistente(righeJsonl = []) {
  for (let i = righeJsonl.length - 1; i >= 0; i--) {
    let ev;
    try {
      ev = JSON.parse(righeJsonl[i]);
    } catch {
      continue; // riga spezzata o non-JSON: non è un verdetto, si salta
    }
    if (ev?.type !== "assistant") continue;
    const pezzi = ev?.message?.content;
    if (!Array.isArray(pezzi)) continue;
    const testo = pezzi
      .filter((p) => p?.type === "text" && String(p.text || "").trim())
      .map((p) => p.text)
      .join("\n");
    if (testo.trim()) return testo;
  }
  return null; // nessun messaggio mio nella coda letta: cieco, non accuso nessuno
}

const CODA_TRASCRIZIONE = 2 * 1024 * 1024;

function leggiTrascrizione(percorso) {
  if (!percorso || !existsSync(percorso)) return null;
  try {
    const dim = statSync(percorso).size;
    const da = Math.max(0, dim - CODA_TRASCRIZIONE);
    const fd = openSync(percorso, "r");
    try {
      const buf = Buffer.alloc(Math.min(dim, CODA_TRASCRIZIONE));
      readSync(fd, buf, 0, buf.length, da);
      const righe = buf.toString("utf8").split("\n").filter(Boolean);
      return da > 0 ? righe.slice(1) : righe; // la prima riga è tagliata a metà
    } finally {
      closeSync(fd);
    }
  } catch {
    return null; // trascrizione illeggibile: taccio invece di accusare
  }
}

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

async function main() {
  const argv = process.argv.slice(2);
  const hook = argv.includes("--hook");

  let giaBloccato = false;
  let trascrizione = null;
  if (hook) {
    try {
      const ev = JSON.parse(await leggiStdin());
      giaBloccato = Boolean(ev?.stop_hook_active);
      trascrizione = ev?.transcript_path || null;
    } catch {
      // Nessun payload leggibile: proseguo come primo giro. Non è un motivo per tacere.
    }
  }

  // «Prima» ha DUE genitori quando sto unendo (AR-540). Con il solo HEAD, un difetto che main ha
  // chiuso e che arriva qui dentro la fusione risulta chiuso da me: successo il 4/8 con AR-361,
  // chiuso dal commit «riconcilia» del worker e contestato a me mentre univo. È la stessa forma che
  // Nicola aveva già indicato per il sorvegliante — «il cancello deve dire non so cosa è tuo invece
  // di accusare» — e questa è la terza volta che si presenta: la prima in una copia senza ancora, la
  // seconda su un registro riordinato, questa dentro una fusione.
  //
  // L'unione dei due genitori è la risposta esatta: mio è solo ciò che era aperto su ENTRAMBI i lati
  // e adesso è chiuso. Non allarga niente — se chiudo io un difetto aperto di là, resta mio.
  const altro = altroGenitoreDelMerge();
  const cantierePrima = statoDiPartenza(daHead(CANTIERE)?.difetti, altro && daRif(altro, CANTIERE)?.difetti);
  const cantiereDopo = daDisco(CANTIERE)?.difetti || [];
  const lezPrima = statoDiPartenza(daHead(APPRENDIMENTO)?.lezioni, altro && daRif(altro, APPRENDIMENTO)?.lezioni);
  const lezDopo = daDisco(APPRENDIMENTO)?.lezioni || [];
  const { file, codaToccata } = fileDelLavoro();

  const base = baseDelRamo();
  const committati = base ? fileCommittatiSulRamo(base) : null;
  const righeQuaderni = base ? righeAggiunteNelle(base, "memoria-squadra") : null;

  // HEAD già pubblicato = nessun commit da pubblicare, qualunque cosa dica l'ancora vecchia
  // (AR-819, il perché sta dentro `scegliPerimetro`).
  const confrontoHead = base ? confrontaHeadConBase(base, git) : { uguale: false, cieco: null };
  const headUgualeABase = confrontoHead.uguale;

  // L'allarme è una domanda sul TURNO («stavo per lasciarlo indietro adesso»), l'esito è una domanda
  // sulla CONSEGNA (il ramo verso main). Due perimetri diversi perché sono due domande diverse.
  const perimetro = scegliPerimetro({ ...ancoraDelTurno(), base, headUgualeABase });
  const consegneModificate = perimetro.da ? righeAggiunteNelle(perimetro.da, "consegne") : null;

  // IL BUCO TROVATO IL 4/8: `codaToccata` (sopra, da `fileDelLavoro`) guarda SOLO `git status
  // --porcelain` — l'albero di lavoro non committato. Ma un allarme e la sua riga in coda possono
  // essere stati committati ENTRAMBI in un turno precedente, dentro lo stesso perimetro (l'ancora
  // resta ferma finché un turno si chiude bloccato — vedi sopra): la coda risulta "toccata" nel
  // ramo ma non nel disco di oggi, e il cancello continua ad accusare un allarme già in coda perché
  // guarda due finestre diverse con lo stesso nome. Qui si allinea la finestra: la coda conta come
  // toccata anche se il tocco è un commit già fatto dentro il perimetro corrente.
  const codaNelPerimetro = perimetro.da ? righeAggiunteNelle(perimetro.da, CODA, false) : null;
  const codaEraGiaToccata = codaToccataNelPerimetro(codaNelPerimetro);

  // AR-642: i testi si raccolgono QUI (non inline nel verdetto) perché anche la loro eventuale
  // cecità — nessuna base diffabile — deve entrare nell'elenco dei ciechi, non sparire.
  const { testi: testiDelTurno, soloDisco: testiSoloDisco } = testiToccati(perimetro.da);

  const ciechi = [];
  const note = [];
  // AR-642: la decisione su COSA dichiarare cieco quando un diff non è calcolabile è una funzione
  // pura esportata (`ciechiPerDiffNonCalcolabile`), così una prova la esegue coi `null` veri del
  // catch di git. Prima qui c'era un solo cieco — col messaggio sbagliato («non ho trovato un
  // ramo») anche quando il ramo c'era ed era il diff a fallire — e due controlli tacevano.
  ciechi.push(
    ...ciechiPerDiffNonCalcolabile({
      base,
      committati,
      righeQuaderni,
      perimetroDa: perimetro.da,
      consegneModificate,
      codaNelPerimetro,
      testiSoloDisco,
    }),
  );
  // Perimetro largo = NOTA, non cieco (AR-506). Senza l'ancora ho comunque misurato: ho guardato un
  // SOVRAINSIEME del turno, non meno. Metterlo fra i ciechi faceva uscire 2 il cancello a ogni giro
  // in CI — dove l'ancora non può esistere, perché vive fuori da git — e una CI rossa per costruzione
  // si impara a ignorare in tre giorni.
  if (perimetro.nota) note.push(perimetro.nota);

  // ⑦ Il collaudo del lavoro finito (AR-532): SOLO dentro l'hook Stop, perché il ricontrollo lo fa
  // il modello e fuori dall'hook (CI, comando a mano) non c'è nessuno a cui chiederlo — un cancello
  // rosso per costruzione in CI si impara a ignorare in tre giorni, ed è già successo (AR-506).
  let collaudo = { righe: [], note: [], ciechi: [] };
  if (hook) {
    try {
      collaudo = collaudoAlloStop({ da: perimetro.da, turno: perimetro.turno, giaBloccato, headUgualeABase });
    } catch {
      collaudo = { righe: [], note: [], ciechi: ["il collaudo del lavoro finito non ha girato: non so se questo lavoro sia stato ricontrollato."] };
    }
    ciechi.push(...collaudo.ciechi);
    note.push(...collaudo.note);
  }

  // Le voci che il sorvegliante mi ha ripetuto in faccia mentre lavoravo (AR-497).
  let insistenti = [];
  try {
    const b = JSON.parse(readFileSync(join(REPO, BATTITO), "utf8"));
    insistenti = vociInsistenti(b.viste || {}, Number(b.scatto) || 0);
  } catch {
    // Battito assente: qui la differenza fra ⚪ e ℹ️ è se una sessione POTEVA lasciarlo. Su un albero
    // pulito (CI, clone fresco) nessun Edit è passato di qui: non c'è niente da misurare, e dirlo
    // «cieco» sarebbe accusare l'assenza di un lavoro che non c'è stato. Su un albero sporco invece
    // qualcuno ha scritto e la guardia doveva parlare: lì il silenzio è una misura mancata davvero.
    // È la stessa taratura del controllo `cervello.sorvegliante` nella visita (AR-498).
    (alberoSporco() ? ciechi : note).push(
      "il registro del sorvegliante non è leggibile da qui: non so quali avvisi mi abbia ripetuto durante il lavoro.",
    );
  }

  // LA SORVEGLIANZA DI QUESTO TURNO (mosse 1-3, Nicola 16/8). Due domande che prima non aveva nessuno:
  // ① una guardia si è svegliata e non ha risposto? ② ho usato uno strumento che nessuno guarda?
  // La ② si può fare solo qui: la lista completa degli strumenti chiamati sta nella trascrizione, e
  // il percorso della trascrizione arriva solo nel payload di questo hook.
  const sorveglianza = (() => {
    try {
      const { righe: grezze, errore: guasto } = leggiRegistroConEsito();
      if (guasto) {
        // ⚪ non è un verde: senza registro non so quali mosse siano state guardate, e dirlo è
        // l'unica cosa onesta. Zero buchi su una fonte non letta somiglia in tutto a «tutto a posto».
        ciechi.push(`il libro mastro non è leggibile da qui (${guasto}): non so quali mosse abbiano avuto una guardia.`);
        return [];
      }
      const azioni = delTurno(abbina(grezze), perimetro.turno || "");
      const { hooks } = leggiFreni();
      if (!hooks) return [];
      const usati = trascrizione
        ? strumentiDaTrascrizione(leggiTrascrizione(trascrizione) || [])
        : strumentiVisti(azioni);
      const m = mappa([...new Set([...strumentiVisti(azioni), ...usati])], hooks);
      return righeSorveglianza({ buchi: buchi(azioni), scoperti: m.scoperti, mosse: azioni.length });
    } catch (e) {
      // Il registro è un di più: se si rompe, il cancello fa comunque tutti gli altri controlli.
      note.push(`la sorveglianza del turno non è misurabile da qui (${e?.message || e}).`);
      return [];
    }
  })();

  // I MIEI messaggi di questo turno, letti UNA volta sola: la trascrizione è un file che cresce
  // con la sessione, e due controlli che la rileggono ciascuno per conto suo la fanno pagare due
  // volte per la stessa risposta.
  const mieiMessaggi = testiAssistente(leggiTrascrizione(trascrizione) || []);
  const ultimoMio = mieiMessaggi[mieiMessaggi.length - 1] || null;

  const v = verdetto({
    sorveglianza,
    senzaEsito: committati && righeQuaderni ? consegnaSenzaEsito(committati, righeQuaderni.flatMap((f) => f.righe), base ? codiceDopoUltimoEsito(base) : null) : null,
    chiusi: chiusiSenzaProva(cantierePrima, cantiereDopo),
    allarmi: allarmiSenzaCoda(file, codaToccata || codaEraGiaToccata, consegneModificate || []),
    lezioni: lezioniSenzaGate(lezPrima, lezDopo),
    insistenti,
    collaudo: collaudo.righe,
    illeggibili: testiIlleggibili(testiDelTurno, parolePeggioNoteAGlossario(REPO)),
    // AR-507. `certa` è falsa solo dove l'accusa sarebbe personale e il perimetro no: dentro l'hook
    // `Stop` (sto chiudendo IL MIO turno) e senza ancora. Fuori dall'hook resta certa anche col
    // perimetro largo, perché lì chi chiede è la CI e l'unità di consegna è il ramo, non il turno.
    attribuzione: { certa: perimetro.turno || !hook, nota: perimetro.nota },
    // Gli ultimi 8 messaggi bastano: più indietro di così Nicola non ricorda, e confrontare tutta
    // la sessione renderebbe rosso ogni riepilogo legittimo.
    messaggio: messaggioIlleggibile(ultimoMio, parolePeggioNoteAGlossario(REPO), mieiMessaggi.slice(-9, -1)),
    comandiInChat: comandoSenzaCasaInChat(ultimoMio),
    ciechi,
    note,
    giaBloccato,
  });

  if (siPiantaAncora(v.righe, perimetro.turno)) piantaAncora();

  if (!v.righe.length) {
    if (!hook) console.log("✅ niente da lasciare indietro.");
    process.exit(0);
  }

  // Fuori dall'hook vale il contratto dei guardiani (AR-322): 1 = ho trovato qualcosa, 2 = non ho
  // potuto misurare. Dentro l'hook `Stop` il 2 è l'unico codice che BLOCCA la chiusura del turno —
  // quindi lì un cieco NON può uscire 2: un clone superficiale incastrerebbe ogni turno, e un freno
  // che incastra viene spento entro il giorno. È una perdita dichiarata, non un silenzio: nel cancello
  // del lotto (che gira in CI, dove i rami ci sono sempre) il cieco diventa ⚪ ed esce 2.
  const testo = v.righe.join("\n");
  if (v.blocca) {
    console.error(testo);
    process.exit(hook ? 2 : 1);
  }
  console.log(testo);
  if (hook) process.exit(0);
  process.exit(uscitaFuoriDallHook(v));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
