#!/usr/bin/env node
// 🛡️ CENSIMENTO DEI GUARDIANI — chi sorveglia la macchina, e cosa succede quando dice no.
//
// Il difetto, misurato il 29/7: alla domanda «parlami dei guardiani» la risposta più onesta che la
// macchina sapeva dare era un numero — 54 — e quel numero era **vecchio di un lotto**. 54 è il
// conteggio di quelli chiamati con la forma `node "$SCRIPT_DIR/….mjs"`; gli undici entrati dopo
// passano dall'helper `guardiano()` e nessuno li contava. `RADIOGRAFIA-MACCHINA.md` ne dichiarava
// 55, il che rende tre numeri diversi per la stessa cosa nello stesso repo.
//
// La causa non è la distrazione: è che **l'elenco dei guardiani non aveva una casa**. Viveva nella
// testa di chi aveva letto `giro.sh` di recente. Un elenco scritto a mano si stacca dalla realtà al
// primo lotto, e un elenco che mente su chi ti sta proteggendo è peggio di nessun elenco.
//
// Quindi qui l'elenco non si scrive: si MISURA da `giro.sh` a ogni giro. Delle due metà —
//   · **come è cablato** (cancello o riga informativa, quale vincolo produce) → letta dal codice;
//   · **cosa controlla, detto a voce** → scritta a mano in DESCRIZIONI, perché nessun parser sa
//     spiegare a Nicola perché quel controllo esiste;
// solo la seconda può invecchiare. Per questo un guardiano nuovo senza descrizione fa uscire 1: la
// descrizione va scritta nello stesso giro in cui il guardiano nasce, non «poi».
//
// Nessuna dipendenza e nessun I/O: si esegue su testo passato da fuori. Il lato che tocca i file è
// `guardiani-check.mjs`.

/** Come `giro.sh` chiama un guardiano: forma diretta o helper `guardiano()` (AR-165). */
const RE_DIRETTA = /node\s+"?\$\{?SCRIPT_DIR\}?\/([a-z0-9-]+)\.mjs/g;
const RE_HELPER = /\bguardiano\s+"?([a-z0-9-]+)\.mjs/g;

/** L'esito buttato via: la pipe e poi `|| true`. Chi finisce così parla, non ferma. */
const RE_SCARTATO = /\|\|\s*true\s*$/;

// Le forme in cui `giro.sh` PRENDE il codice d'uscita invece di ingoiarlo: lo salva in una variabile
// (`_x_rc=$?`) o lo usa come condizione (`! node …`).
//
// `$(node …)` da solo NON basta, ed è l'errore in cui sono cascato alla prima scrittura: cattura il
// TESTO, non il giudizio. `contesto-lezioni` finiva così tra i bloccanti mentre la sua riga termina
// con `|| true` dentro le parentesi — un guardiano dichiarato «può fermare il giro» che in realtà non
// ferma niente è esattamente la bugia che questa bacheca esiste per non raccontare.
const RE_PRESO = /_rc=\$\?|!\s+node\s+"?\$\{?SCRIPT_DIR/;

/** Un vincolo che viene davvero riempito (non l'inizializzazione a vuoto in cima al file). */
const RE_VINCOLO = /^\s*([A-Z_]+)_VINCOLO="(?!"\s*$)/;

/** La riga che decide quali vincoli vengono CONTATI (`GATE_ROSSI`) — non tutti quelli scritti ci sono. */
const RE_ELENCO_CONTATI = /^\s*for\s+_vnome\s+in\s+([A-Z_ ]+);\s*do/;

/**
 * La forma DERIVATA (lotto 33, AR-379/AR-387): il giro non enumera più i vincoli, li chiede alla
 * shell con `compgen -v | grep _VINCOLO$`. Quando compare questa riga la risposta alla domanda
 * «quali vincoli sono contati?» è **tutti**, e va detto qui: se questo censimento continuasse a
 * cercare la vecchia lista non la troverebbe più e direbbe che nessun vincolo conta — la stessa
 * bugia di prima, rovesciata. Un metro che non segue la cura misura il mondo di ieri.
 */
const RE_DERIVA_CONTATI = /compgen\s+-v\s*\|\s*grep\s+[^|\n]*_VINCOLO/;

/** «Tutti»: un insieme che risponde sì a qualunque nome. Vale quando il giro deriva l'elenco. */
const TUTTI_CONTATI = { has: () => true, size: Infinity, derivato: true };

/** Quante righe sopra un vincolo si cerca il guardiano che l'ha prodotto, quando non è nominato. */
export const RIGHE_RISALITA = 20;

/** Quante righe sotto un'invocazione si guarda per capire se quel verdetto spegne il motore AI. */
export const RIGHE_DISCESA = 12;

/**
 * Cosa controlla ogni guardiano, detto come lo diresti a voce (`cervello/scrittura-umana.md`).
 *
 * `famiglia` serve solo a raggruppare in bacheca: senza, sessantacinque righe in fila sono un muro
 * che nessuno legge. `cosa` è la frase che compare a Nicola — niente sigle AR, niente nomi di file:
 * quelli stanno nel codice, per chi ripara.
 */
export const DESCRIZIONI = {
  // ── I numeri sono veri? ────────────────────────────────────────────────────
  "verifica-sensori": { famiglia: "numeri-veri", cosa: "Controlla che gli occhi sui dati reali siano aperti: se il marketplace non risponde, il giro non può scrivere numeri nuovi." },
  "sensore-cassa": { famiglia: "numeri-veri", cosa: "Guarda cassa e autonomia: quanto è entrato davvero, quanto brucia al mese, quanti mesi restano." },
  "sentinella-fonti": { famiglia: "numeri-veri", cosa: "Prova le fonti web da cui la macchina si informa: una fonte morta smette di portare notizie senza dirlo." },
  "onesta-check": { famiglia: "numeri-veri", cosa: "Cerca i numeri orfani: una cifra scritta in memoria senza una fonte accanto non deve uscire." },
  "coerenza-fatti": { famiglia: "numeri-veri", cosa: "Un fatto cambia in un posto solo. Se una copia vecchia resta in giro, la trova e ferma la pubblicazione." },
  "coerenza-rischi": { famiglia: "numeri-veri", cosa: "Lo stesso per i rischi: il registro è la casa, gli altri file lo citano invece di ricopiarlo." },
  "peso-file-cabina": { famiglia: "numeri-veri", cosa: "Pesa i file che la Cabina rilegge di continuo: quando uno cresce troppo GitHub smette di servirlo e la schermata si svuota fingendo che vada tutto bene." },
  "valida-contratti": { famiglia: "numeri-veri", cosa: "Verifica che i file di memoria abbiano la forma che il Pannello si aspetta — un campo rinominato spegne una schermata in silenzio." },
  "sensori-spenti-check": { famiglia: "numeri-veri", cosa: "Uno strumento costruito e mai acceso è un buco, non uno stato: pretende un perché scritto." },
  "freschezza-segnali": { famiglia: "numeri-veri", cosa: "Controlla i controllori: se un guardiano è morto a metà giro, il suo verde è vecchio e non vale." },
  "guardiani-check": { famiglia: "numeri-veri", cosa: "Tiene questa tabella agganciata al codice: se nasce un controllo e nessuno spiega cosa fa, il giro non si chiude." },
  "freschezza-intelligence": { famiglia: "numeri-veri", cosa: "Misura quanto è vecchia ogni analisi mostrata nella Cabina: un'analisi di tre settimane esposta come se fosse di stamattina fa decidere su una fotografia scaduta." },
  "errore-motore": { famiglia: "numeri-veri", cosa: "Porta fuori dal server il motivo per cui il motore si è fermato: senza, da fuori si vede che qualcosa è fallito ma mai il perché, e il guasto resta muto per giorni." },
  "mappa-macchina": { famiglia: "numeri-veri", cosa: "Tiene aggiornata la mappa «Com'è fatta la macchina»: i numeri li riconta a ogni giro, e se nasce un pezzo nuovo (skill, sensore, mano, servizio, area) senza una riga che dica cosa fa, il giro non si chiude." },
  "percorsi-git": { famiglia: "numeri-veri", cosa: "Un nome di file con l'accento va chiesto a git nel modo giusto, o la macchina lavora su file che non esistono senza accorgersene." },
  "esito-cadenza": { famiglia: "numeri-veri", cosa: "La testa unica delle tre cadenze: decide se il motore si può spegnere e se il lavoro è andato bene, con le stesse regole per tutte e tre." },

  // ── Stiamo andando dove volevamo? ─────────────────────────────────────────
  "north-star-check": { famiglia: "rotta", cosa: "Tiene l'occhio sul numero che conta — ordini pagati, negozi vivi, margine — e alza la voce se il primo ordine è fermo da giorni." },
  "allocazione-check": { famiglia: "rotta", cosa: "Impedisce che lo sforzo pesante vada su un negozio che non ha ancora firmato mentre quello reale resta a zero." },
  "freschezza-okr": { famiglia: "rotta", cosa: "Gli obiettivi della squadra scadono: se il documento è stantio o i target sono passati, lo dice." },
  "freschezza-checklist": { famiglia: "rotta", cosa: "La checklist di Nicola invecchia in due giorni; oltre, il giro deve rifarla prima di proporre altro." },
  "piani-data": { famiglia: "rotta", cosa: "Scrive in cima a ogni piano quando è stato aggiornato l'ultima volta, contando solo le modifiche al testo vero: un piano fermo da un mese si vede a colpo d'occhio invece di sembrare vivo perché la macchina gli tocca il fondo a ogni giro." },
  "piani-verita": { famiglia: "numeri-veri", cosa: "Legge i piani e ci cerca le frasi che il registro-fatti smentisce — un bando chiuso dato per aperto, la commissione vecchia, il negozio-faro sbagliato — e scrive l'avviso in cima al piano, senza toccare il testo di Nicola. Risponde alla domanda che viene dopo «da quanto è fermo»: cosa dice di falso mentre è fermo." },
  "freschezza-cadenze": { famiglia: "rotta", cosa: "Controlla che il piano del mattino, il report della sera e il monitoraggio ESCANO davvero: una sveglia che suona su una stanza vuota sembrava un successo." },
  "registro-scelte-check": { famiglia: "rotta", cosa: "Ogni prospect nominato in un dossier deve stare anche nel registro, o il Pannello mostra una lista incompleta." },
  "supervisione-negozi": { famiglia: "rotta", cosa: "Passa in rassegna ogni negozio e ogni prodotto, trova i dati mancanti e prepara il riempimento come proposta da firmare." },
  "intelligence-agenda": { famiglia: "rotta", cosa: "Prepara la lista di cosa guardare fuori oggi — concorrenti, eventi, meteo — senza svegliare l'AI." },
  "bilancio-vivo": { famiglia: "rotta", cosa: "Dice quanto rende ogni ordine al centesimo, con le commissioni e i costi reali dentro." },
  "sblocco-capacita": { famiglia: "rotta", cosa: "Veglia i cancelli di realtà: quando arriva il primo ordine o il quinto negozio, avvisa che una capacità nuova è ora costruibile." },
  capacita: { famiglia: "rotta", cosa: "Il cruscotto di cosa la macchina sa fare davvero oggi, contro cosa è ancora solo un'intelaiatura." },

  // ── La macchina impara o accumula? ────────────────────────────────────────
  "chiusura-loop": { famiglia: "apprendimento", cosa: "Un reparto che dice FATTO deve lasciare l'esito nel suo quaderno: senza, il lavoro non ha insegnato niente." },
  "apprendimento-guardiano": { famiglia: "apprendimento", cosa: "Misura se le lezioni diventano regole o restano un archivio: accumulare non è imparare." },
  "cristallizza-apprendimento": { famiglia: "apprendimento", cosa: "Prende le lezioni mature e le trasforma in principi scritti nei mansionari, dove valgono sempre." },
  "pota-apprendimento": { famiglia: "apprendimento", cosa: "Tiene l'archivio delle lezioni sotto il tetto di lettura potando SOLO copie e morti, mai le lezioni vive: senza, il file supera il muro e la scheda Apprendimento smette di leggersi (successo l'11/8)." },
  "tasso-lezioni": { famiglia: "apprendimento", cosa: "Conta quante lezioni la macchina ha davvero applicato in questo giro, non quante ne ha in magazzino." },
  "tasso-chiusura": { famiglia: "apprendimento", cosa: "Il voto della macchina su sé stessa: quanti difetti chiude diviso quanti ne apre nel mese. Sotto 1 il giro smette di cercare e spende il turno a chiudere, perché ogni ricerca in più allungherebbe la lista invece di accorciarla." },
  "contesto-lezioni": { famiglia: "apprendimento", cosa: "Rimette in testa alla macchina, all'inizio di ogni sessione, i fatti-chiave e gli errori da non ripetere." },
  calibrazione: { famiglia: "apprendimento", cosa: "Costringe a dire prima cosa ci si aspetta, e poi a confrontarlo col reale: previsioni mai chiuse sono debito." },
  "sonda-volano": { famiglia: "apprendimento", cosa: "Controlla che l'anello impara→correggi giri davvero, invece di sembrare che giri." },
  "macchina-del-tempo": { famiglia: "apprendimento", cosa: "Ricostruisce la giornata della macchina in ordine: cosa è successo, quando, e perché è stato deciso." },
  "taste-file": { famiglia: "apprendimento", cosa: "Registra i verdetti di Nicola — cosa gli è piaciuto e cosa no — perché il gusto non si reinventa ogni volta." },

  // ── I difetti si chiudono davvero? ────────────────────────────────────────
  "cantiere-prove": { famiglia: "cantiere", cosa: "Smaschera i difetti che nessun controllo automatico potrà mai chiudere: un difetto senza prova resta aperto per sempre." },
  "prove-oneste": { famiglia: "cantiere", cosa: "Impedisce a un difetto di nascere già chiuso, con una prova scritta apposta per essere verde." },
  "gate-veri": { famiglia: "cantiere", cosa: "Impedisce di far salire il punteggio delle lezioni con freni finti: un gate dichiarato vale solo se esiste una mutazione che lo fa scattare davvero." },
  // `forma-json` NON sta qui apposta: vive nel cancello del lotto, non nel giro. Sul VPS il giro
  // committa su main, quindi `origin/main...HEAD` sarebbe sempre vuoto e il guardiano non
  // misurerebbe mai niente — un verde che non copre nulla è peggio di un'assenza. La bacheca elenca
  // chi sorveglia il giro; questo sorveglia le PR.
  "auto-fix": { famiglia: "cantiere", cosa: "Chiude i difetti la cui prova è diventata verde per un fix vero, e lascia gli altri aperti." },
  "allinea-scan-cantiere": { famiglia: "cantiere", cosa: "Riallinea la vecchia foto della radiografia al cantiere di adesso, così la lista non mostra roba già riparata." },
  "sincronizza-proposte": { famiglia: "cantiere", cosa: "Tiene le proposte di auto-riscrittura agganciate allo stato vero del cantiere." },
  "spazzata-fratelli": { famiglia: "cantiere", cosa: "Chiede «l'hai risolto o hai curato una copia sola?»: cerca la stessa malattia nei punti accanto." },
  "esperimenti-check": { famiglia: "cantiere", cosa: "Senza almeno un esperimento aperto non si misura niente: pretende che ce ne sia uno vivo e chiude quelli scaduti." },
  "pagella-intelligenza": { famiglia: "cantiere", cosa: "I cinque voti che dicono se la macchina è pronta per il business o sta solo girando a vuoto." },
  "sistema-immunitario": { famiglia: "cantiere", cosa: "Fa il red team su sé stessa: verifica che le difese di base siano ancora in piedi." },

  // ── Niente esce che non deve uscire ───────────────────────────────────────
  "scan-segreti": { famiglia: "sicurezza", cosa: "Cerca chiavi e password nei file che stanno per essere pubblicati, e blocca tutto se ne trova una." },
  "vault-sanita": { famiglia: "sicurezza", cosa: "Ultima visita alla memoria prima che finisca online: file troncati, link rotti, roba che non deve uscire." },
  "porte-check": { famiglia: "sicurezza", cosa: "Trova i punti che pubblicano scavalcando il cancello: una porta scoperta non si vede, pubblica e basta." },
  "uscite-check": { famiglia: "sicurezza", cosa: "Elenca ogni punto in cui la macchina tocca il mondo — email, messaggi, pagamenti — e pretende che ognuno abbia un controllo." },
  "firma-check": { famiglia: "sicurezza", cosa: "Nessuno script può scriversi da solo la firma di Nicola: chi esegue non firma sé stesso." },
  "rotte-scriventi-check": { famiglia: "sicurezza", cosa: "Trova le pagine del Pannello che cambiano qualcosa mentre fingono di leggere: se una tocca lo stato, deve chiedere il permesso come le altre." },
  "peso-contesto": { famiglia: "sicurezza", cosa: "Sorveglia quanto testo la macchina si porta dietro: un contesto gonfio costa soldi e fa perdere il filo." },

  // ── I 120 senior sono a posto? ────────────────────────────────────────────
  "agent-registry-check": { famiglia: "squadra", cosa: "Confronta i senior che esistono davvero con quelli elencati nei documenti: nessun agente orfano, nessun doppione." },
  "deferral-agenti": { famiglia: "squadra", cosa: "L'organigramma è scritto in due posti: la mappa che leggi tu e la scheda che legge chi smista il lavoro. Se un rimando esiste in uno solo dei due, il lavoro finisce da un senior che non lo rivendica." },
  "percorsi-git": { famiglia: "sicurezza", cosa: "I nomi dei file con l'accento tornano storpiati se li si chiede nel modo sbagliato: controlla che nessuno strumento lavori su file che non esistono, credendo di averli letti." },
  "keyword-owner-check": { famiglia: "squadra", cosa: "Ogni mandato ha un padrone solo: se due senior rivendicano la stessa cosa, il lavoro va a chi capita." },
  "stampo-check": { famiglia: "squadra", cosa: "Controlla la qualità dei mansionari: kit fotocopia, quaderni mai scritti, senior più sottili della media." },
  "guardiano-capacita": { famiglia: "squadra", cosa: "Verifica che i comandi e le capacità promesse nei documenti esistano davvero come file eseguibili." },

  // ── Quanto costa tenere accesa la macchina ────────────────────────────────
  "freno-costi": { famiglia: "soldi-macchina", cosa: "Il freno a mano sulla spesa AI: se non sa quanto è stato speso oggi, non finge che sia zero." },
  "costo-ai": { famiglia: "soldi-macchina", cosa: "Segna il consumo di ogni giro — quanto tempo, quanti token — e tiene il totale del giorno." },
  metabolismo: { famiglia: "soldi-macchina", cosa: "Dice dove finiscono i soldi dell'AI: quale tipo di lavoro consuma di più e se conviene ancora." },
  "sentinella-budget": { famiglia: "soldi-macchina", cosa: "Un reparto che sfora il suo budget viene fermato con una proposta di STOP da firmare." },

  // ── Il tempo, le code, le scadenze ────────────────────────────────────────
  "scadenzario-check": { famiglia: "tempo", cosa: "Nessuna scadenza esterna arriva a sorpresa, e nessun conto alla rovescia trascritto resta a mentire." },
  "pausa-check": { famiglia: "tempo", cosa: "Una card messa in pausa deve avere una sveglia: senza, dorme per sempre e nessuno se ne accorge." },
  "housekeeping-azioni": { famiglia: "tempo", cosa: "Sposta in archivio le azioni già fatte o rifiutate, così la coda da firmare resta corta e vera." },
  "guardiano-tempo": { famiglia: "tempo", cosa: "Misura quanto lavoro sta aspettando la firma di Nicola e da quanti giorni: la coda è un costo." },
  letargo: { famiglia: "tempo", cosa: "Se quota, cassa o sensori calano, spegne il superfluo in ordine e tiene vivo solo il nucleo." },
  "midollo-spinale": { famiglia: "tempo", cosa: "I riflessi rapidi: per ogni allarme delle sentinelle propone la reazione pronta, con il suo limite." },
  "delta-gate": { famiglia: "tempo", cosa: "Se dall'ultimo giro non è cambiato niente, evita di svegliare l'AI per riscrivere le stesse righe." },

  // ── Il codice regge? ──────────────────────────────────────────────────────
  "test-cervello": { famiglia: "test", cosa: "Lancia tutti i test del cervello a ogni giro: un test che nessuno esegue non è una rete, è un file." },
  "test-pannello": { famiglia: "test", cosa: "Lo stesso per i test del Pannello, la parte che Nicola guarda davvero." },
  "verifica-avversariale": { famiglia: "test", cosa: "Smaschera l'auto-verifica finta: se il lavoro dice «verificato» senza che nessuno abbia provato a smontarlo, non vale." },
  "ci-stato": { famiglia: "test", cosa: "Guarda come sono finite le prove sulle richieste di unione già aperte, e dice se il guasto l'ha portato quel lavoro o se era già nel ramo principale." },

  // ── Le mani: non giudicano, agiscono ──────────────────────────────────────
  "notifica-approvazioni": { famiglia: "mani", cosa: "Manda a Nicola le cose da firmare invece di aspettare che apra il Pannello.", mano: true },
  "avviso-telegram": { famiglia: "mani", cosa: "Il canale per un messaggio urgente su Telegram quando qualcosa non può aspettare il prossimo giro.", mano: true },
  "retry-policy": { famiglia: "mani", cosa: "Decide se un lavoro fallito va ritentato e quando: una sola regola per il worker e per le sentinelle.", mano: true },
  "sync-worker-plugins": { famiglia: "mani", cosa: "Tiene aggiornati sul server i pezzi approvati, così il worker gira sempre la versione firmata.", mano: true },
};

/** Titolo umano di ogni famiglia, nell'ordine in cui compaiono in bacheca. */
export const FAMIGLIE = [
  ["numeri-veri", "🔍 I numeri sono veri?"],
  ["rotta", "🎯 Stiamo andando dove volevamo?"],
  ["apprendimento", "🧠 La macchina impara o accumula?"],
  ["cantiere", "🔧 I difetti si chiudono davvero?"],
  ["sicurezza", "🛡️ Niente esce che non deve uscire"],
  ["squadra", "👥 I 120 senior sono a posto?"],
  ["soldi-macchina", "💶 Quanto costa tenerla accesa"],
  ["tempo", "⏰ Tempo, code e scadenze"],
  ["test", "🧪 Il codice regge?"],
  ["mani", "📲 Le mani (non giudicano: agiscono)"],
];

/**
 * Chi gira nel giro, come è cablato, e cosa succede DAVVERO quando dice no.
 *
 * La prima versione di questa funzione rispondeva sì/no — «bloccante o informativo» — e diceva due
 * cose false: che `onesta-check` ferma il giro (ferma solo con `ONESTA_BLOCCA=1`, che di default non
 * c'è) e che `delta-gate` lo ferma (non lo ferma: salta la parte AI). Una bacheca che promette una
 * protezione più forte di quella vera è peggio di nessuna bacheca, quindi ogni effetto qui sotto è
 * misurato su un segnale diverso del codice — vincolo scritto, vincolo contato, cancello di
 * pubblicazione, motore spento — e non su un'impressione di lettura.
 */
export function guardianiDiGiro(testoGiro = "", testoGate = "") {
  const righe = String(testoGiro || "").split("\n");
  const trovati = new Map();
  const segna = (nome, i, preso) => {
    const g = trovati.get(nome) || { nome, righe: [], esitoPreso: false };
    g.righe.push(i + 1);
    g.esitoPreso = g.esitoPreso || preso;
    trovati.set(nome, g);
  };
  righe.forEach((riga, i) => {
    if (/^\s*#/.test(riga)) return; // un'invocazione dentro un commento non gira
    for (const m of riga.matchAll(RE_DIRETTA)) segna(m[1], i, !RE_SCARTATO.test(riga) && RE_PRESO.test(riga));
    for (const m of riga.matchAll(RE_HELPER)) segna(m[1], i, true); // l'helper esiste per NON perdere l'esito
  });
  const perVincolo = vincoliPerGuardiano(righe, trovati);
  const contati = vincoliContati(righe);
  const pubblicazione = guardianiDelCancello(testoGate);
  return [...trovati.values()]
    .map((g) => {
      const vincolo = perVincolo.get(g.nome) || null;
      return {
        ...g,
        vincolo,
        vincoloContato: vincolo ? contati.has(vincolo.replace(/_VINCOLO$/, "")) : false,
        bloccaPubblicazione: pubblicazione.has(g.nome),
        spegneMotore: g.righe.some((r) => spegneIlMotore(righe, r - 1)),
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * I vincoli che finiscono in `GATE_ROSSI`. Non sono tutti quelli scritti: al 29/7 cinque su ventinove
 * (firma, stampo, pause, sensori spenti, porte) vengono messi nel prompt e mai contati, quindi il
 * giro può uscire «pulito» mentre quei cinque sono rossi — ed è la ragione per cui questa colonna
 * esiste invece di dire «vincolo, quindi ferma».
 */
function vincoliContati(righe) {
  for (const riga of righe) {
    if (/^\s*#/.test(riga)) continue; // la forma spiegata in un commento non è la forma eseguita
    if (RE_DERIVA_CONTATI.test(riga)) return TUTTI_CONTATI;
    const m = riga.match(RE_ELENCO_CONTATI);
    if (m) return new Set(m[1].trim().split(/\s+/));
  }
  return new Set();
}

/** Il verdetto di un guardiano spegne il motore AI (throttle), invece di bocciare il giro? */
function spegneIlMotore(righe, i) {
  return righe.slice(i + 1, i + 1 + RIGHE_DISCESA).some((r) => /^\s*RUN_AI=0/.test(r));
}

/**
 * Chi entra nel verdetto del cancello di pubblicazione condiviso (`gate-pubblicazione.sh`).
 *
 * Non basta guardare «quali node girano lì dentro»: conta se il loro codice d'uscita arriva fino a
 * `gate_verdetto`. Oggi il cancello ha quattro posti nel verdetto e ne riempie tre — `rc_one`
 * (onestà) resta a zero perché quel guardiano lì non viene proprio eseguito: ha falsi positivi noti
 * sui log append-only, e la rinuncia è scritta in un commento accanto.
 *
 * Il filtro `usate` esiste per il caso in cui qualcuno cabli un guardiano su una variabile che nel
 * verdetto non compare: girerebbe, fallirebbe, e non fermerebbe niente. Sarebbe il difetto degli
 * allarmi non contati, di nuovo, in un altro file.
 */
function guardianiDelCancello(testoGate = "") {
  const righe = String(testoGate || "").split("\n");
  const verdetto = righe.find((r) => /gate_verdetto\s+"\$/.test(r) && !/^\s*#/.test(r)) || "";
  const usate = new Set([...verdetto.matchAll(/\$\{?(rc_[a-z]+)\}?/g)].map((m) => m[1]));
  const dentro = new Set();
  for (const riga of righe) {
    if (/^\s*#/.test(riga)) continue;
    const m = riga.match(/node\s+"\$dir\/([a-z0-9-]+)\.mjs".*\|\|\s*(rc_[a-z]+)=\$\?/);
    if (m && usate.has(m[2])) dentro.add(m[1]);
  }
  return dentro;
}

/**
 * Quale variabile di vincolo produce ogni guardiano.
 *
 * Due strade perché `giro.sh` ne usa due: quasi tutti i vincoli nominano il guardiano dentro il
 * proprio testo, ma un paio passano da una variabile intermedia (`$_checklist_out`) e lì il nome non
 * c'è. Per quelli si risale all'invocazione più vicina sopra — che è anche il modo in cui un umano
 * leggerebbe il file.
 */
function vincoliPerGuardiano(righe, trovati) {
  const nomi = [...trovati.keys()];
  const mappa = new Map();
  righe.forEach((riga, i) => {
    if (/^\s*#/.test(riga)) return;
    const m = riga.match(RE_VINCOLO);
    if (!m) return;
    const nominato = nomi.filter((n) => riga.includes(n)).sort((a, b) => b.length - a.length)[0];
    let scelto = nominato;
    if (!scelto) {
      for (let j = i - 1; j >= Math.max(0, i - RIGHE_RISALITA); j--) {
        const sopra = righe[j];
        if (/^\s*#/.test(sopra)) continue;
        const inv = [...sopra.matchAll(RE_DIRETTA), ...sopra.matchAll(RE_HELPER)].map((x) => x[1])[0];
        if (inv) { scelto = inv; break; }
      }
    }
    if (scelto && !mappa.has(scelto)) mappa.set(scelto, `${m[1]}_VINCOLO`);
  });
  return mappa;
}

/**
 * Il censimento completo: chi gira, cosa controlla, chi è rimasto senza descrizione.
 *
 * `senzaDescrizione` e `fantasmi` sono le due direzioni in cui l'elenco può staccarsi dalla realtà —
 * un guardiano nuovo mai descritto, e una descrizione rimasta di uno che non gira più. Tenerle
 * entrambe è il motivo per cui questa bacheca non può invecchiare in silenzio.
 */
export function censimento(testoGiro = "", { descrizioni = DESCRIZIONI, testoGate = "" } = {}) {
  const elenco = guardianiDiGiro(testoGiro, testoGate).map((g) => {
    const d = descrizioni[g.nome] || {};
    return { ...g, ...d, effetti: d.mano ? [] : effettiDi(g) };
  });
  const nomi = new Set(elenco.map((g) => g.nome));
  return {
    elenco,
    totale: elenco.length,
    fermano: elenco.filter((g) => g.effetti.includes("ferma")).length,
    nonContati: elenco.filter((g) => g.effetti.includes("non-contato")).map((g) => g.nome),
    senzaDescrizione: elenco.filter((g) => !g.cosa).map((g) => g.nome),
    fantasmi: Object.keys(descrizioni).filter((n) => !nomi.has(n)),
  };
}

/**
 * Cosa succede quando questo guardiano dice no. Più di uno alla volta è possibile e non è un errore:
 * il freno sui costi, per dirne uno, spegne il motore su un codice e scrive un vincolo su un altro.
 */
export function effettiDi(g) {
  const e = [];
  if (g.vincolo) e.push(g.vincoloContato ? "ferma" : "non-contato");
  if (g.bloccaPubblicazione) e.push("pubblicazione");
  if (g.spegneMotore) e.push("motore");
  if (!e.length && g.esitoPreso) e.push("avvisa");
  if (!e.length) e.push("nota");
  return e;
}

/** Come si dice a voce ogni effetto, in bacheca. */
export const EFFETTI = {
  ferma: "⛔ ferma il giro",
  "non-contato": "⚠️ allarme **non contato** (il giro può chiudersi lo stesso)",
  pubblicazione: "🚧 blocca la pubblicazione",
  motore: "⏭️ spegne il motore AI",
  avvisa: "⚠️ avvisa, non ferma",
  nota: "ℹ️ scrive e basta",
};

/**
 * 0 = l'elenco combacia col codice · 1 = una descrizione manca, è di troppo, o un allarme non conta.
 *
 * `nonContati` è entrato qui col lotto 33 (AR-387). Prima veniva MISURATO e scritto in bacheca, ma
 * restava fuori dal codice d'uscita: il rilevatore vedeva cinque guardiani i cui «no» non fermavano
 * niente — fra cui quello sulla firma e quello sulle porte di pubblicazione — e usciva 0 lo stesso.
 * Un difetto raccontato bene non è un difetto chiuso: finché il numero non entra in un'uscita,
 * nessun cancello lo può usare, e resta una riga che si impara a scorrere.
 */
export function codiceUscita({ senzaDescrizione = [], fantasmi = [], nonContati = [] } = {}) {
  return senzaDescrizione.length || fantasmi.length || nonContati.length ? 1 : 0;
}

/** Il titolo del blocco in bacheca. Fisso: è la chiave con cui il blocco si ritrova e si sostituisce. */
export const TITOLO_BACHECA = "🛡️ I guardiani della macchina";

const escapePipe = (s) => String(s).replace(/\|/g, "\\|");

/**
 * Il blocco markdown per BACHECA.md, nel formato che il Pannello sa leggere
 * (`## <titolo> · AAAA-MM-GG HH:MM` + corpo).
 */
export function bloccoBacheca(cens, quando = "") {
  const r = [];
  r.push(`## ${TITOLO_BACHECA} · ${quando}`);
  r.push("");
  r.push(
    `A ogni giro, prima che l'AI scriva una riga, girano **${cens.totale} controlli automatici**. ` +
      `**${cens.fermano}** hanno il potere di fermare il giro: se uno dice no, il lavoro non si chiude ` +
      "pulito e il motivo arriva scritto. Gli altri osservano, avvisano o frenano senza bloccare."
  );
  r.push("");
  r.push(
    "Rispondono tutti con la stessa lingua: **verde** (passato), **rosso** (bocciato), **cieco** " +
      "(non ha potuto misurare). Un guardiano cieco *non* vale come verde — è uno strumento rotto, e " +
      "la macchina si ferma lo stesso: meglio memoria vecchia che memoria che mente."
  );
  r.push("");
  if (cens.nonContati.length) {
    r.push(
      `> ⚠️ **${cens.nonContati.length} allarmi si scrivono ma non si contano.** ` +
        `${cens.nonContati.map((n) => `\`${n}\``).join(", ")} mettono il loro «no» davanti all'AI, ma ` +
        "non entrano nel conteggio che decide se il giro è pulito: il giro può chiudersi verde con " +
        "quei controlli rossi. È un difetto vero, misurato qui sopra e non stimato."
    );
    r.push("");
  }
  for (const [chiave, titolo] of FAMIGLIE) {
    const gruppo = cens.elenco.filter((g) => g.famiglia === chiave);
    if (!gruppo.length) continue;
    r.push(`### ${titolo}`);
    r.push("");
    r.push("| Controllo | Cosa guarda | Se dice no |");
    r.push("| --- | --- | --- |");
    for (const g of gruppo) {
      const effetto = g.mano ? "—" : g.effetti.map((e) => EFFETTI[e]).join(" · ");
      r.push(`| \`${g.nome}\` | ${escapePipe(g.cosa)} | ${escapePipe(effetto)} |`);
    }
    r.push("");
  }
  r.push(
    "Questa tabella non è scritta a mano: la ricava `cervello/guardiani-check.mjs` leggendo " +
      "`cervello/giro.sh` a ogni giro. Se ne nasce uno nuovo compare qui da solo, e finché nessuno ha " +
      "scritto cosa fa il giro resta rosso."
  );
  return r.join("\n");
}

/**
 * Rimette il blocco in BACHECA.md al posto del precedente, o lo aggiunge in fondo la prima volta.
 *
 * Sostituisce per TITOLO, non per data: la data cambia a ogni riscrittura e cercare per riga intera
 * lascerebbe un doppione a ogni giro. Il resto del file — gli avvisi scritti da Nicola — non si
 * tocca: qui dentro passa solo il blocco dei guardiani.
 */
export function sostituisciBlocco(bacheca = "", blocco = "", titolo = TITOLO_BACHECA) {
  const righe = String(bacheca).split("\n");
  const inizio = righe.findIndex((r) => r.startsWith(`## ${titolo} ·`));
  if (inizio < 0) return `${bacheca.replace(/\s*$/, "")}\n\n---\n\n${blocco}\n`;
  let fine = righe.length;
  for (let i = inizio + 1; i < righe.length; i++) {
    if (/^##\s+\S/.test(righe[i])) { fine = i; break; }
  }
  // Il separatore `---` che precede il prossimo avviso appartiene a lui: non va inghiottito.
  const coda = righe.slice(fine);
  while (coda.length && coda[0].trim() === "") coda.shift();
  const testa = righe.slice(0, inizio);
  while (testa.length && testa[testa.length - 1].trim() === "") testa.pop();
  return [...testa, "", blocco, "", ...coda].join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Il corpo del blocco senza la riga del titolo: serve a capire se è cambiato QUALCOSA sui guardiani,
 * ignorando l'orologio.
 *
 * Senza questo confronto la bacheca si riscriverebbe a ogni giro con una data nuova, e siccome il
 * Pannello ordina per data più recente questo blocco starebbe **sempre** in cima, spingendo giù il
 * registro dei fatti — più un commit ogni due ore che non dice niente. La data deve muoversi quando
 * cambiano i guardiani, non quando passa il tempo.
 */
export function corpoDi(blocco = "") {
  // Il `---` finale NON è corpo: appartiene all'avviso che viene dopo (lo dice già
  // `sostituisciBlocco`, che si guarda bene dall'inghiottirlo). Tenerlo dentro il confronto
  // significherebbe che un blocco cambia identità a seconda di CHI gli sta sotto: finché è l'ultimo
  // della bacheca il confronto funziona, ma il giorno in cui qualcuno ne appende un altro sotto, il
  // corpo «cambia» a ogni giro senza che sia cambiata una parola — e la riscrittura porta con sé una
  // data nuova, che in una bacheca ordinata per data vuol dire vivere in cima per sempre.
  return String(blocco).split("\n").slice(1).join("\n").replace(/\n*-{3,}\s*$/, "").trim();
}
