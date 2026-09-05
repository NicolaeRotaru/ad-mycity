#!/usr/bin/env node
// AR-075 — GUARDIANO MACHINE-CHECKABLE DELL'ONESTÀ nel percorso di pubblicazione (ONESTA-RULES strumentato).
// 🟡 Sola lettura sui file/testo che gli passi. Esce ≠0 se trova violazioni → blocca accodamento/pubblicazione.
//
// Problema (AR-075): il valore fondante del brand (la VERITÀ) era affidato a una checklist umana
// (ONESTA-RULES.md), non a una forcing-function deterministica agganciata al percorso di pubblicazione.
// Il cancello di serietà 🔬 era descritto ma non strumentato per l'onestà: un testo con segnaposto non
// risolti o un numero senza fonte poteva finire in AZIONI-IN-ATTESA / consegne/content e uscire.
//
// Fix: questo pezzo scansiona il testo IN USCITA e blocca (exit≠0) se trova:
//   - segnaposto non risolti: [ ... ], [ESEMPIO], [NOME], {{...}}, XXX, TODO, «…»
//   - numeri "spia" senza tag-fonte vicino: "già 500 famiglie", "3.000 clienti", "N negozi"
//     → un numero è OK solo se ha una fonte esplicita accanto (es. "fonte: Supabase", "(fonte …)", "[dati]")
//   - parole-spia di claim gonfiati non verificati: "già N", "centinaia di", "migliaia di"
//
// Uso:
//   node cervello/onesta-check.mjs <file1> [file2 …]     -> scansiona i file
//   echo "testo…" | node cervello/onesta-check.mjs --stdin
//   node cervello/onesta-check.mjs --testo "già 500 famiglie su MyCity"
//   ... aggiungi --json per output machine-readable
//   ... e --audit / --contenuto / --lettera per dire CHE COSA stai misurando (AR-433, AR-791):
//       un audit interno, un contenuto in uscita, o una lettera a un cliente.
//
// Exit: 0 = ho guardato ed è a posto · 1 = ho guardato e ho TROVATO (blocca)
//       2 = NON HO POTUTO GUARDARE (errore d'uso, oppure testo oltre il tetto di AR-870). Il 2 non
//           è mai un verde: chi chiama non deve trattarlo come «onesto».

import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
// 🚧 AR-394 — L'AMBITO e le ESENZIONI DICHIARATE, in un modulo puro e senza dipendenze, perché una
// prova possa ESEGUIRE la decisione invece di cercarla con un grep. Vedi cervello/onesta-ambito.mjs:
// è il pezzo che mancava perché il quarto posto del verdetto potesse bocciare senza bocciare tutto.
import { esenzioneDelRilievo, parteVivaDelFile } from "./onesta-ambito.mjs";

const args = process.argv.slice(2);
const JSON_MODE = args.includes("--json");
const STDIN = args.includes("--stdin");
const testoFlag = args.includes("--testo") ? args[args.indexOf("--testo") + 1] : null;
const files = args.filter((a) => !a.startsWith("--") && a !== testoFlag);

// --- Regole (ogni regola: nome, regex, come spiegarla) ---
// Segnaposto non risolti.
const RE_SEGNAPOSTO = [
  { nome: "segnaposto [ESEMPIO]", re: /\[ESEMPIO\]/gi },
  { nome: "segnaposto [ ... ]", re: /\[[^\]\n]{2,40}\]/g }, // [NOME], [DATA], [X]… (esclude riferimenti tipo [[wikilink]] gestiti sotto)
  { nome: "segnaposto {{ ... }}", re: /\{\{[^}\n]+\}\}/g },
  { nome: "segnaposto XXX/TODO/TBD", re: /\b(XXX|TODO|TBD|PLACEHOLDER|LOREM)\b/gi },
  { nome: "segnaposto «…»", re: /«\s*…\s*»|<\s*inserire[^>]*>/gi },
];

// Parole-spia di claim gonfiati.
//
// 🚧 AR-873 — I NUMERI SCRITTI A PAROLE ERANO INVISIBILI. Le due regole qui sopra guardano cifre
// («già 500») o tre parole sole seguite da «di» («centinaia di»). Misurato il 28/8 sul banco delle
// 41 mail: «siamo già duemila famiglie», «un migliaio di noi», «qualche centinaio di persone»
// passavano tutte e tre — «già duemila» scavalca la prima perché dopo «già» non c'è una cifra, e
// «migliaio/centinaio» al singolare scavalcano la seconda perché l'elenco era chiuso a tre parole.
// Una comunità inventata scritta in lettere costa esattamente quanto una scritta in cifre.
const RE_SPIA = [
  { nome: "claim 'già N'", re: /\bgià\s+\d[\d.\s]*/gi },
  { nome: "claim vago 'centinaia/migliaia di'", re: /\b(centinaia|migliaia|decine)\s+di\b/gi },
  {
    nome: "claim scritto a parole ('duemila famiglie', 'un migliaio di')",
    re: /\b(?:(?:due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|dodici|venti|trenta|quaranta|cinquanta|sessanta|settanta|ottanta|novanta)?(?:mila|mille|cento)|centinai[oa]|migliai[oa])\b/gi,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AR-875 — LA SCARSITÀ FABBRICATA: non è un numero sbagliato, è una regola di POLITICA
// ─────────────────────────────────────────────────────────────────────────────
// «Restano 9 posti nel giro di consegna, poi passiamo a sabato» non contiene nessun numero falso:
// contiene una pressione inventata. Il metro guardava solo le cifre e non aveva niente da dire.
//
// La regola non me la invento io: sta già scritta in CONTESTO_BUSINESS.md §7, nella lista delle
// cose da NON costruire in nessuna fase — «dynamic pricing aggressivo» (i prezzi che ballano) e
// «notifiche beacon di prossimità» (la spinta a chi passa davanti al negozio). Sono la stessa
// famiglia: urgenza fabbricata per far comprare adesso. Qui quella lista smette di essere una
// pagina da ricordare e diventa un rilievo che ferma la mail.
//
// ⚠️ COME SONO SCRITTE, e perché non bastava una parola sola. Sul banco delle 41 mail «restano»,
// «ultimi», «adesso», «prima che» e «scade» compaiono in 15 mail ONESTE («gli ordini restano
// spenti fino a mercoledì», «il buono scade il 30 novembre»). Una regola su quelle parole avrebbe
// fermato mezzo banco: cancello che suona su tutto = cancello spento (AR-433). Servono le forme
// COMPOSTE — il posto che si esaurisce, il numero chiuso, chi resta fuori — che una bottega onesta
// non ha motivo di scrivere.
//
// E due forme sono state TOLTE dopo averle misurate sulla memoria della macchina, non sul banco:
//   · «a esaurimento» — in RITMO.md descrive un bando vero della Camera di Commercio («sportello a
//     esaurimento posti»): è la formula standard di un fatto pubblico, non una pressione inventata;
//   · «decine/dozzine» senza «di» — «si ripeteva decine di volte» è un conto di lavori, e la regola
//     vecchia («centinaia|migliaia|decine di») lo copriva già: il ramo nuovo aggiungeva solo rumore.
// Restano le forme singolari che la regola vecchia non vedeva («un migliaio di», «qualche centinaio
// di») e i numeri composti a parole («duemila»), che sono il difetto di AR-873.
const RE_POLITICA = [
  // ⚠️ ALLARGATE IL 31/8 dopo un collaudo indipendente. La regola di prima voleva un NUMERO e un
  // sostantivo dalla lista: la scarsità come la scrive davvero chi vende non ha né l'uno né l'altro.
  // MISURATO: su dieci frasi di scarsità normalissime, NOVE passavano senza una violazione —
  // «ultimi posti», «posti limitati», «fino a esaurimento posti», «ne restano pochissimi», «solo per
  // i primi venti», «offerta valida solo oggi», «le adesioni chiudono venerdì», «posti quasi
  // esauriti», e perfino «restano nove posti», che la regola voleva prendere e non prendeva perché
  // «nove» non era nella lista dei numeri scritti a parole.
  // La scarsità inventata è nella lista delle cose da non costruire mai: qui non è una questione di
  // forma, è una regola di politica, ed è per questo che vive fra le regole e non fra le espressioni.
  {
    nome: "scarsità fabbricata: posti che si esauriscono",
    re: /\b(?:restano|rimangono|ne\s+restano|sono\s+rimasti|ultimi|ultime|ancora)\s+(?:sol[oi]\s+|soltanto\s+|pochi\s+|poche\s+|pochissim\w+\s+)?(?:\d+|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|venti|pochi|poche|pochissim\w+)?\s*(?:post[oi]|slot|pezz[oi]|consegne|carrell[oi]|copert[oi]|abbonament[oi]|adesion[ie])\b/gi,
  },
  {
    nome: "scarsità fabbricata: quantità dichiarata scarsa senza un registro che lo dica",
    re: /\b(?:post[oi]|slot|pezz[oi]|consegne|copert[oi]|abbonament[oi]|adesion[ie])\s+(?:sono\s+|erano\s+|restano\s+|rimangono\s+)?(?:limitat\w+|contat\w+|quasi\s+esaurit\w+|in\s+esaurimento)\b|\bfino\s+a\s+esaurimento\b|\bne\s+restano\s+pochissim\w+\b/gi,
  },
  {
    nome: "scarsità fabbricata: solo per i primi N",
    re: /\bsol(?:o|tanto)\s+(?:per\s+)?(?:i|le)\s+prim[ie]\s+(?:\d+|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|venti|trenta|cinquanta|cento)\b/gi,
  },
  {
    nome: "scadenza inventata: vale solo oggi, o le adesioni chiudono",
    re: /\b(?:offerta|promozione|sconto|prezzo)\s+valid[oa]\s+(?:solo|soltanto)\s+(?:oggi|stasera|fino\s+a\s+stasera)\b|\b(?:le\s+)?(?:adesioni|iscrizioni|prenotazioni)\s+(?:si\s+)?chiudon[oa]\b/gi,
  },
  { nome: "scarsità fabbricata: numero chiuso / chi resta fuori", re: /\b(?:numero\s+chiuso|chi\s+resta\s+fuori)\b/gi },
  { nome: "scarsità fabbricata: si sono esauriti", re: /\bsi\s+(?:sono\s+)?esaurit\w+\b/gi },
  {
    nome: "urgenza fabbricata: affrettati / ultima chiamata",
    re: /\b(?:affrettati|sbrigati|ultima\s+chiamata|non\s+perdere\s+l['’]occasione|prima\s+che\s+finiscano|finché\s+ci\s+sono\s+post[oi])\b/gi,
  },
];

// Un numero significativo (≥2 cifre, o cifra + unità/soggetto). Consideriamo "numero da fondare"
// una cifra ≥ 2 come "500", "3.000", "12 negozi", percentuali, euro.
// 🚧 AR-869 — «3000 famiglie» ERA INVISIBILE, «3.000 famiglie» no. La testa dell'espressione era
// `\d{1,3}`: su «3000» prendeva «300», poi pretendeva il confine di parola e trovava un altro «0»,
// quindi rinunciava — e su tutta la mail nessun rilievo. Cioè il metro chiedeva al bugiardo di
// scrivere il punto delle migliaia per essere fermato. Con `\d+` la testa non ha più quel limite.
// Misurato sul banco delle 41 mail: la mail «3000 famiglie / 1200 / 1400 botteghe» passa a essere
// fermata, e le mail oneste fermate NON aumentano (l'unico numero a 4 cifre nelle oneste è l'anno
// «2026», che la clausola degli anni salta come prima).
const RE_NUMERO = /\b\d+(?:[.,]\d{3})*(?:[.,]\d+)?\s?(?:€|euro|%|negozi|famiglie|clienti|ordini|utenti|iscritti|follower)?\b/gi;

// Marcatori di fonte strutturati (no parole generiche da sole — AR-075 guardrail).
const RE_FONTE = /(fonte\s*:|\(fonte|\[dati\]|\[fonte|supabase|stripe|posthog|registro-fatti|registro-realt|\{fonte:)/i;

// Il soggetto che trasforma una cifra in un CLAIM DI BUSINESS: «3.000 clienti» è una promessa da
// fondare, «3,50 €» e «dalle 9 alle 13» no. Serve al profilo «lettera al cliente» (vedi regolePer).
// 🚧 AR-876 — LA LISTA AVEVA DUE BUCHI, e ci passavano le sole due mail che il metro severo ferma
// e quello dei claim no. ① «nuclei familiari» è «famiglie» detto con un sinonimo: «480 nuclei
// familiari a Piacenza» è la stessa bugia di «480 famiglie», e usciva dalla lista cambiando parola.
// ② la percentuale che promette un RISULTATO — «tagli il 30% della spesa», «butti il 40% in meno
// di roba scaduta», «risparmi il 90% del tempo» — non tocca nessun soggetto di business, quindi
// nessuna di quelle tre percentuali chiedeva una prova. Ed è la forma con cui si promette di più.
// Chiudere i due buchi toglie il costo di allentare il metro un giorno: per questo si fa adesso,
// anche col metro severo acceso, quando ancora non cambia nessun verdetto.
const RE_SOGGETTO = /\b(negozi|botteghe|famiglie|nucle[oi]\s+famigliar[ei]|nucle[oi]\s+familiar[ei]|clienti|utenti|iscritti|follower|recensioni|ordini|consegne)\b/i;

// Le parole che trasformano una PERCENTUALE in un risultato promesso al cliente. «20% di sconto
// sulla focaccia» resta fuori — è il prezzo che il carrello mantiene fra due clic, e se è falso se
// ne accorge chi paga. «30% della spesa» invece è una misura che nessuno ha fatto.
const RE_RISULTATO_PROMESSO = /\b(spesa|spese|tempo|sprec\w+|scadut\w+|risparmi\w+|fatica|attesa|cod[ae]|bolletta|costi)\b/i;

// ─────────────────────────────────────────────────────────────────────────────
// AR-791 — LE REGOLE SCRITTE UNA VOLTA SOLA PER MONDO, IN UNA TABELLA CONFRONTABILE
// ─────────────────────────────────────────────────────────────────────────────
// Il metro dell'onestà ha due esecutori che vivono in due mondi diversi: questo (Node, sul VPS,
// giudica la memoria che il giro sta per pubblicare) e `pannello/src/lib/onesta-check.ts` (dentro
// il Pannello su Vercel, giudica il testo di una mail che sta per partire verso un cliente vero).
// Le regole erano COPIATE riga per riga fra i due file, e in un lotto precedente l'ambito ristretto
// e le esenzioni dichiarate sono atterrati solo qui: da allora le due copie divergevano in silenzio.
//
// PERCHÉ NON C'È UNA CASA SOLA, e non è pigrizia — sono due muri misurati, scritti qui perché il
// prossimo non ci sbatta di nuovo:
//   ① il Pannello si costruisce su Vercel con Root Directory = `pannello` (pannello/README.md:54),
//      quindi al suo build `cervello/` NON ESISTE: un import da qui romperebbe il deploy. È la stessa
//      ragione già scritta in `pannello/src/lib/cantiere-snello.ts` e `radiografia-marketplace-conti.ts`.
//   ② al contrario, questo metro deve saper girare in un clone PARZIALE — solo `onesta-check.mjs` +
//      `onesta-ambito.mjs` — ed è una proprietà provata da `cervello/test/quarto-controllo-promesso.mjs`
//      (caso `metroVero`), che copia esattamente quei due file in una cartella temporanea. Un import
//      da `pannello/` lì dentro non si risolve, e il cancello morirebbe invece di dare un verdetto.
//
// COSA SI FA ALLORA. Le regole smettono di essere espressioni sparse nel codice e diventano UNA
// TABELLA di sorgenti (stringhe), uguale nei due mondi, che una prova CONFRONTA campo per campo ed
// ESEGUE sugli stessi testi: `cervello/test/due-metri-una-regola.test.mjs`. Il giorno che una delle
// due cambia senza l'altra, la prova diventa rossa lo stesso giorno — non mesi dopo, per caso.
/**
 * La stessa tabella, ricavata dalle espressioni qui sopra: `sorgente` è il TESTO della regola e
 * `flag` le sue opzioni. Non è una seconda copia — è la prima letta in un modo che si può
 * confrontare: il gemello nel Pannello espone la stessa tabella, e la prova le mette una accanto
 * all'altra. Una regola cambiata da un lato e non dall'altro si vede come una differenza di stringa.
 */
const voce = (classe, nome, re) => ({ classe, nome, sorgente: re.source, flag: re.flags });

export const SORGENTI_REGOLE = Object.freeze([
  ...RE_SEGNAPOSTO.map((r) => voce("segnaposto", r.nome, r.re)),
  ...RE_SPIA.map((r) => voce("claim", r.nome, r.re)),
  ...RE_POLITICA.map((r) => voce("politica", r.nome, r.re)),
  voce("numero", "numero significativo", RE_NUMERO),
  voce("fonte", "marcatore di fonte", RE_FONTE),
  voce("soggetto", "numero attaccato a un soggetto di business", RE_SOGGETTO),
  voce("risultato", "percentuale che promette un risultato", RE_RISULTATO_PROMESSO),
]);


// ─────────────────────────────────────────────────────────────────────────────
// AR-433 — UN CANCELLO CHE SUONA SU TUTTO È UN CANCELLO SPENTO
// ─────────────────────────────────────────────────────────────────────────────
// La regola «ogni numero deve avere una fonte» cerca un marcatore di fonte entro 60 caratteri da
// OGNI numero. In un report tecnico i numeri sono quasi tutti RIFERIMENTI: `giro.sh:664` è un
// indirizzo, `AR-365` è una sigla, e nessuno dei due è un numero di business orfano — SONO la
// fonte. Risultato: la radiografia usciva rossa sempre, veniva pubblicata lo stesso, e chi scrive
// ha imparato a scavalcare il cancello. Una volta imparato, lo scavalca anche quando ha ragione.
//
// Due mosse, come da scheda: ① i pattern che SONO una fonte escono dal conto dei numeri;
// ② il verdetto cambia per TIPO di documento — un audit non è un contenuto che esce verso i
// clienti, e va misurato con le regole dei claim, non con quella dei numeri di business.
// 🚧 AR-870 — QUESTA RIGA COSTAVA 4,7 SECONDI SU 80.000 CARATTERI SENZA SPAZI, e il verso del
// danno non è «il cancello si apre»: è «il canale si pianta». `[\w./-]+` senza ancora poteva
// PARTIRE da ogni carattere di un blocco lungo e, per ognuno, risalire all'indietro un carattere
// alla volta cercando il punto dell'estensione: n partenze × n passi = tempo al quadrato. Misurato
// prima del fix: 10k → 81 ms · 20k → 281 ms · 40k → 1.160 ms · 80k → 4.319 ms.
// Il lookbehind toglie le partenze finte: dentro una parola di quel tipo non si comincia più, si
// comincia solo dove la parola comincia davvero. Il costo torna lineare, stesso risultato.
export const RE_RIFERIMENTO_CODICE = /(?<![\w./-])[\w./-]+\.(?:mjs|sh|ts|tsx|js|jsx|json|md|ps1|bats|py):\d+(?:-\d+)?/g;
export const RE_SIGLA_DIFETTO = /\bAR-\d+\b/g;
export const RE_SIGLA_LEZIONE = /\bL-\d{4}-\d+(?:-\d+)?\b/g;
export const RE_CODICE_INLINE = /`[^`\n]*`/g;
export const RE_BLOCCO_CODICE = /```[\s\S]*?```/g;

/**
 * Toglie dal testo i pezzi che SONO una fonte, sostituendoli con spazi della stessa lunghezza:
 * così gli indici restano quelli del testo originale e il contesto dei numeri veri non si sposta.
 * (Cancellarli e basta incollerebbe due frasi lontane, creando falsi «numero senza fonte».)
 */
export function mascheraRiferimenti(testo, { codice = true } = {}) {
  let t = String(testo ?? "");
  // ⚠️ `codice: false` SUL CANALE CLIENTI — regressione trovata dalla radiografia del 28/8, e
  // introdotta da questo stesso lotto. Mascherare il codice fra apici serve su un documento
  // interno, dove `file.mjs:12` è una fonte e non un numero orfano. In una MAIL A UN CLIENTE non
  // serve a niente e apre il cancello: basta scrivere «siamo scelti da `3.000 clienti`» e il numero
  // sparisce dagli occhi del metro. Misurato: con gli apici passa, senza apici viene fermato.
  // In una lettera a una persona vera non c'è codice da proteggere — c'è solo un modo in più di
  // nascondere un numero, ed è esattamente ciò da cui questo cancello dovrebbe difendere.
  const regole = codice
    ? [RE_BLOCCO_CODICE, RE_CODICE_INLINE, RE_RIFERIMENTO_CODICE, RE_SIGLA_DIFETTO, RE_SIGLA_LEZIONE]
    : [RE_RIFERIMENTO_CODICE, RE_SIGLA_DIFETTO, RE_SIGLA_LEZIONE];
  for (const re of regole) {
    t = t.replace(re, (m) => " ".repeat(m.length));
  }
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-870 — IL TETTO: oltre il quale il metro DICHIARA di non aver guardato (⚪)
// ─────────────────────────────────────────────────────────────────────────────
// Ancorare l'espressione toglie il costo al quadrato, ma non toglie il fatto che un testo enorme
// costi comunque tempo, e che una mail vera non sia mai enorme (la più lunga del banco: 1.400
// caratteri). Oltre il tetto il metro non macina: DICHIARA di non aver potuto giudicare.
//
// ⚪ non è verde e non è rosso — è la terza risposta della casa. Qui viaggia come un rilievo
// esplicito, non come un silenzio, e proprio per questo blocca lo stesso: sul canale clienti chi
// legge il verdetto vede «violazioni: 1» e la mail non parte (AR-871), mentre il comando esce 2
// invece di 0. Un metro che non ha guardato non ha il diritto di dire «onesto». Il 2 è già la
// parola che il resto della casa capisce: `istante-cancello.mjs onesta --rc=2` risponde «NON
// misurabile — cieco non è verde», e in modo `blocca` non pubblica.
//
// ⚠️ DUE TETTI, NON UNO, e il secondo è una lezione pagata subito. Con un tetto solo a 100.000 il
// primo file vero che ci è finito sotto è STATO.md — 103.604 caratteri il 28/8 — cioè il cancello
// del giro avrebbe cominciato a dire ⚪ sulla memoria di tutti i giorni. È la scorciatoia n.15 del
// catalogo, «nasce rosso»: un limite calibrato su un albero che non contiene i file veri.
// Una mail di 100.000 caratteri non è una mail; un file di memoria di 100.000 caratteri è martedì.
export const LIMITE_TESTO = 100000; // canale clienti: oltre, non è più una lettera a una persona
export const LIMITE_TESTO_MEMORIA = 2000000; // memoria e audit: DECISIONI.md da solo pesa 856 KB
export const TIPO_NON_GIUDICABILE = "non-giudicabile";

/** Il tetto che vale per questo canale. Il Pannello serve solo la lettera, e porta solo quello. */
export function limitePer(tipo) {
  return tipo === "lettera" ? LIMITE_TESTO : LIMITE_TESTO_MEMORIA;
}

/** Il rilievo ⚪: uguale nei due mondi, così i due metri non divergono proprio sul caso limite. */
export function rilievoTroppoLungo(lunghezza, limite = LIMITE_TESTO) {
  return {
    tipo: TIPO_NON_GIUDICABILE,
    regola: `testo troppo lungo per essere giudicato (${lunghezza} caratteri, il tetto è ${limite}): ⚪ non l'ho guardato, e ⚪ non è verde`,
    esempi: [],
  };
}

/**
 * Che documento è. Un audit/radiografia è lavoro interno di diagnosi: si misura sull'onestà dei
 * claim (segnaposto, affermazioni gonfiate), non sulla regola dei numeri di business — che è nata
 * per i testi che escono verso i clienti.
 */
export function tipoDocumento(nome) {
  const n = String(nome ?? "").replace(/\\/g, "/");
  if (/consegne\/audit\//i.test(n)) return "audit";
  if (/90-Memoria-AI\/RADIOGRAFIA[^/]*\.md$/i.test(n)) return "audit";
  if (/radiografia[^/]*\.md$/i.test(n)) return "audit";
  return "contenuto";
}

/**
 * Quali regole valgono per quel tipo. Una sola casa, così il verdetto non si sdoppia.
 *
 * `numeri` ha TRE valori, non due:
 *   true          → ogni numero deve portare la sua fonte (memoria e contenuti che escono da qui)
 *   false         → la regola non si applica (audit: i numeri sono riferimenti a codice)
 *   "solo-claim"  → solo i numeri attaccati a un soggetto di business (AR-791, canale clienti)
 *
 * 🚧 AR-791 — PERCHÉ ESISTE IL TERZO VALORE. Il gemello nel Pannello giudica il testo di una mail
 * che parte verso un cliente vero, e lì la regola «ogni numero porta la sua fonte» sbaglia bersaglio:
 * i marcatori che cerca (fonte:, supabase, stripe, registro-fatti) sono vocabolario INTERNO della
 * macchina, e in una lettera a un cliente non ci possono stare. Misurato il 28/8 su otto mail
 * realistiche: sette bocciate, e sei per ragioni che non sono disonestà — gli orari di apertura, il
 * prezzo del pane, lo sconto del 10%, i minuti di consegna. È esattamente AR-433 un piano più in là:
 * un cancello che suona su tutto è un cancello spento, con l'aggravante che sembra acceso.
 *
 * Sulla lettera il numero che va fondato è il CLAIM: «3.000 clienti», «500 famiglie», «12 negozi».
 * Un prezzo, una percentuale di sconto, un orario e una data non promettono niente sul mondo, e
 * pretendere una fonte accanto vuol dire solo insegnare a scavalcare il controllo.
 */
export function regolePer(tipo) {
  if (tipo === "lettera") {
    return {
      segnaposto: true,
      claim: true,
      // ⚖️ DECISO DA NICOLA il 2026-08-28: il metro sulle mail ai clienti resta SEVERO.
      // La corsia di AR-791 aveva proposto "solo-claim" con la misura qui sopra (otto mail, sette
      // bocciate, sei per ragioni che non sono disonestà). La proposta è buona e resta in piedi:
      // il macchinario che la esegue — `numeroDaFondare` e il valore "solo-claim" — è costruito,
      // provato e pronto. Ma allentare il cancello che guarda cosa esce verso una persona vera non
      // è una decisione che si prende dentro un lotto che parlava d'altro. Nicola vuole prima
      // vedere le otto mail coi due verdetti accanto. Finché non le ha viste: `true`.
      // Per accendere la proposta basta rimettere "solo-claim" qui e nel gemello del Pannello —
      // e `due-metri-una-regola.test.mjs` obbliga a farlo in tutte e due lo stesso giorno.
      numeri: true,
      // 🚧 AR-875 — la lista «NON COSTRUIRE» di CONTESTO_BUSINESS.md §7 vale anche per quello che
      // SCRIVIAMO, non solo per quello che costruiamo: la scarsità inventata è la stessa spinta dei
      // prezzi che ballano e delle notifiche a chi passa davanti al negozio, detta a parole.
      politica: true,
      perche_numeri:
        "lettera a un cliente vero: ogni numero porta la sua fonte (metro severo, confermato da Nicola il 2026-08-28 — la proposta di fondare solo i claim aspetta che veda le otto mail di prova)",
    };
  }
  return {
    segnaposto: true,
    claim: true,
    numeri: tipo !== "audit",
    // Su un audit no: un documento di diagnosi CITA le frasi disoneste per farle vedere, e punirlo
    // perché nomina la bugia che ha appena trovato è il modo più veloce per spegnere il cancello.
    politica: tipo !== "audit",
    perche_numeri:
      tipo === "audit"
        ? "documento di diagnosi interna: i numeri sono riferimenti a codice e sigle di difetto, non claim di business"
        : "testo che può uscire verso l'esterno: ogni numero deve portare la sua fonte",
  };
}

/**
 * Questo numero va fondato, dato il profilo? Funzione PURA e senza I/O: è la decisione, e una prova
 * la ESEGUE (`cervello/test/due-metri-una-regola.test.mjs`) invece di cercarla con un grep.
 *
 *   raw  → il numero come l'ha trovato la regola («3.000 clienti», «10%», «45»)
 *   dopo → i caratteri subito dopo (bastano una trentina): è lì che vive il soggetto, quando il
 *          numero e la parola non finiscono nello stesso pezzo («12 negozi convenzionati»)
 */
export function numeroDaFondare(raw, dopo, modo) {
  if (modo === false) return false;
  if (modo !== "solo-claim") return true;
  const contorno = `${raw} ${String(dopo ?? "").slice(0, 30)}`;
  // 🚧 AR-876 — la percentuale che promette un risultato è un claim anche senza soggetto: «taglia
  // il 30% della spesa» non nomina né clienti né negozi, ma promette al lettore un numero che
  // nessuno ha misurato. Lo sconto no: «20% di sconto sulla focaccia» lo verifica il carrello alla
  // cassa fra due clic.
  if (/%/.test(raw) && RE_RISULTATO_PROMESSO.test(contorno)) return true;
  RE_SOGGETTO.lastIndex = 0;
  return RE_SOGGETTO.test(contorno);
}

/**
 * IL GIUDIZIO — funzione pura: entra un nome e un testo, esce il verdetto. Nessun I/O, nessun
 * process.exit: quelli stanno nel comando qui sotto. Esportata (AR-791) perché la prova che
 * confronta i due metri debba ESEGUIRLA, non descriverla.
 */
export function giudica(nome, testo, tipoForzato = null) {
  return esamina(nome, testo, tipoForzato);
}

function esamina(nome, testo, tipoForzato = null) {
  const violazioni = [];
  // Ciò che il metro ha visto e ha messo da parte, col PERCHÉ accanto. Un'esenzione muta è la
  // malattia che AR-394 cura: qui viaggia sempre insieme al suo motivo, e finisce nel referto.
  const esentati = [];
  const tipo = tipoForzato || tipoDocumento(nome);
  const regole = regolePer(tipo);

  // 🚧 AR-394 — L'AMBITO, prima di ogni regola. La memoria della macchina ha due tempi: la storia
  // append-only, che per contratto non si riscrive, e la parte che il giro riscrive ADESSO. Fino a
  // qui il metro li giudicava insieme, quindi chiedeva di riscrivere giugno per poter pubblicare
  // oggi — ed è la ragione per cui il controllo era stato staccato del tutto invece che ristretto.
  const ambito = parteVivaDelFile(nome, testo);
  if (ambito.natura === "storico") {
    return {
      file: nome,
      tipo,
      natura: ambito.natura,
      ambito: ambito.motivo,
      regole_applicate: regole,
      violazioni: [],
      esentati: [{ id: "file-storico", regola: "tutte", motivo: ambito.motivo, esempi: [] }],
    };
  }
  const daGiudicare = ambito.vivo;

  // 🚧 AR-870 — il tetto, PRIMA di ogni regola ma DOPO l'ambito: si misura su quello che si sta per
  // giudicare davvero, non sul file intero. La differenza non è teorica: la parte viva di STATO.md
  // è 2.435 caratteri su 103.604, e col tetto messo sul file intero il cancello del giro avrebbe
  // dichiarato ⚪ su una memoria che invece si può leggere benissimo.
  const limite = limitePer(tipo);
  if (daGiudicare.length > limite) {
    return {
      file: nome,
      tipo,
      natura: "non-giudicabile",
      ambito: `${daGiudicare.length} caratteri da giudicare: oltre il tetto di ${limite}, il metro non li macina`,
      regole_applicate: regole,
      violazioni: [rilievoTroppoLungo(daGiudicare.length, limite)],
      esentati: [],
    };
  }

  // Rimuovi i wikilink [[...]] dal controllo segnaposto (sono link interni legittimi, non placeholder).
  const senzaWikilink = daGiudicare.replace(/\[\[[^\]]+\]\]/g, "");

  const scarta = (regola, rilievo) => {
    const es = esenzioneDelRilievo({ regola, ...rilievo });
    if (es.esente) esentati.push({ id: es.id, regola, motivo: es.motivo, esempio: rilievo.raw });
    return es.esente;
  };

  for (const { nome: rn, re } of RE_SEGNAPOSTO) {
    re.lastIndex = 0;
    const m = senzaWikilink.match(re);
    const veri = (m || []).filter((s) => !scarta("segnaposto", { raw: s }));
    if (veri.length) violazioni.push({ tipo: "segnaposto", regola: rn, esempi: [...new Set(veri)].slice(0, 3) });
  }
  for (const { nome: rn, re } of RE_SPIA) {
    re.lastIndex = 0;
    const m = daGiudicare.match(re);
    const veri = (m || []).filter((s) => !scarta("claim-non-verificato", { raw: s }));
    if (veri.length) violazioni.push({ tipo: "claim-non-verificato", regola: rn, esempi: [...new Set(veri)].slice(0, 3) });
  }
  // 🚧 AR-875 — la regola di POLITICA (scarsità e urgenza fabbricate). Non guarda se il numero è
  // vero: guarda se la frase mette fretta con una scarsità che non esiste.
  for (const { nome: rn, re } of regole.politica ? RE_POLITICA : []) {
    re.lastIndex = 0;
    const m = daGiudicare.match(re);
    const veri = (m || []).filter((s) => !scarta("scarsita-fabbricata", { raw: s }));
    if (veri.length) violazioni.push({ tipo: "scarsita-fabbricata", regola: rn, esempi: [...new Set(veri)].slice(0, 3) });
  }

  // Numeri senza fonte: per ogni numero significativo, controlla se c'è un marcatore di fonte vicino.
  // AR-433: si guarda il testo MASCHERATO — i riferimenti a codice, le sigle e il codice fra apici
  // non sono numeri orfani, sono la fonte. E su un documento di audit la regola non si applica.
  const testoNumeri = regole.numeri ? mascheraRiferimenti(daGiudicare, { codice: tipo !== "lettera" }) : "";
  RE_NUMERO.lastIndex = 0;
  let mm;
  const orfani = new Set();
  while (regole.numeri && (mm = RE_NUMERO.exec(testoNumeri)) !== null) {
    const raw = mm[0].trim();
    // ignora numeri "innocui": anni (1900-2099), numeri singola cifra senza unità, orari
    const soloNum = raw.replace(/[^\d]/g, "");
    if (!soloNum) continue;
    if (/^(19|20)\d{2}$/.test(soloNum) && !/[€%]|euro|negozi|famiglie|clienti|ordini/i.test(raw)) continue;
    if (soloNum.length < 2 && !/[€%]/.test(raw)) continue;
    const ctx = daGiudicare.slice(Math.max(0, mm.index - 60), mm.index + raw.length + 60);
    if (RE_FONTE.test(ctx)) continue;
    // 🚧 AR-791 — quali numeri vanno fondati lo decide il PROFILO del canale, non il caso. Su una
    // lettera al cliente («solo-claim») restano dentro «3.000 clienti» e «12 negozi», escono il
    // prezzo, lo sconto, i minuti di consegna e l'orario: fondare quelli non è onestà, è rumore.
    if (!numeroDaFondare(raw, daGiudicare.slice(mm.index + raw.length, mm.index + raw.length + 30), regole.numeri)) continue;
    // 🚧 AR-394 — QUI il metro smetteva di poter essere acceso. Sulla parte VIVA di STATO.md (misura
    // del 22/8) 33 dei 35 «numeri senza fonte» erano pezzi di data o di orario: con quel rumore il
    // quarto controllo non poteva bloccare senza fermare per sempre la pubblicazione della memoria.
    // I falsi positivi noti diventano ESENZIONI DICHIARATE COL MOTIVO (cervello/onesta-ambito.mjs),
    // non un guardiano staccato in silenzio.
    // Il contorno si misura sul numero VERO (`raw`), non sul match grezzo: `\s?` davanti all'unità
    // fa sì che «21 agosto» esca come «21 » con lo spazio dentro, e chi legge il contorno dal fondo
    // del match si perde proprio la parola che dice che quel 21 è un giorno.
    const prima = daGiudicare.slice(Math.max(0, mm.index - 16), mm.index);
    const dopo = daGiudicare.slice(mm.index + raw.length, mm.index + raw.length + 16);
    if (scarta("numero-senza-fonte", { raw, prima, dopo })) continue;
    orfani.add(raw);
  }
  if (orfani.size) {
    violazioni.push({ tipo: "numero-senza-fonte", regola: "ogni numero deve avere una fonte", esempi: [...orfani].slice(0, 5) });
  }

  return { file: nome, tipo, natura: ambito.natura, ambito: ambito.motivo, regole_applicate: regole, violazioni, esentati };
}

async function leggiStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const risultati = [];

  // AR-433: da stdin il nome non c'è, quindi il tipo lo si dichiara con --audit (o --contenuto).
  // AR-791: `--lettera` è il profilo del canale clienti, quello che il Pannello applica alle mail.
  // Serve anche da qui, perché il metro della lettera si possa provare a mano con lo stesso comando.
  const tipoForzato = args.includes("--audit")
    ? "audit"
    : args.includes("--lettera")
      ? "lettera"
      : args.includes("--contenuto")
        ? "contenuto"
        : null;
  if (testoFlag != null) risultati.push(esamina("(--testo)", testoFlag, tipoForzato));
  if (STDIN) risultati.push(esamina("(stdin)", await leggiStdin(), tipoForzato));
  for (const f of files) {
    if (!existsSync(f)) {
      risultati.push({ file: f, violazioni: [{ tipo: "errore", regola: "file inesistente", esempi: [] }] });
      continue;
    }
    risultati.push(esamina(f, readFileSync(f, "utf8")));
  }

  if (!risultati.length) {
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: "nessun input: passa file, --stdin o --testo" }));
    else console.error("Uso: node cervello/onesta-check.mjs <file…> | --stdin | --testo \"…\"");
    process.exit(2);
  }

  const totali = risultati.reduce((n, r) => n + r.violazioni.length, 0);
  const esentatiTotali = risultati.reduce((n, r) => n + (r.esentati ? r.esentati.length : 0), 0);
  const ok = totali === 0;
  // 🚧 AR-870 — il terzo esito. Un testo oltre il tetto non è «onesto» e non è «disonesto»: è
  // roba che non ho guardato, e il codice d'uscita lo deve dire con un numero suo.
  const nonGiudicato = risultati.some((r) => (r.violazioni || []).some((v) => v.tipo === TIPO_NON_GIUDICABILE));

  // 🚧 AR-394 — un'esenzione si DICE. Il difetto di partenza non era esentare: era esentare in
  // silenzio, lasciando in piedi la forma del controllo. Qui ogni rilievo messo da parte esce col
  // suo motivo, raggruppato per esenzione, sia a schermo sia in JSON.
  const perEsenzione = (esentati = []) => {
    const m = new Map();
    for (const e of esentati) {
      const v = m.get(e.id) || { id: e.id, motivo: e.motivo, quanti: 0, esempi: [] };
      v.quanti++;
      if (e.esempio && v.esempi.length < 3 && !v.esempi.includes(e.esempio)) v.esempi.push(e.esempio);
      m.set(e.id, v);
    }
    return [...m.values()];
  };

  if (JSON_MODE) {
    const conEsenzioni = risultati.map((r) => ({ ...r, esenzioni_applicate: perEsenzione(r.esentati) }));
    console.log(JSON.stringify({ ok, violazioni_totali: totali, esentati_totali: esentatiTotali, risultati: conEsenzioni }, null, 2));
  } else {
    for (const r of risultati) {
      const comeMisurato = r.tipo === "audit" ? " [audit: regole dei claim, non quella dei numeri di business]" : "";
      const dilloAncheSeVerde = () => {
        for (const e of perEsenzione(r.esentati)) {
          const quanti = e.quanti === 1 ? "1 rilievo esentato" : `${e.quanti} rilievi esentati`;
          console.log(`   ↩︎ ${quanti} [${e.id}]${e.esempi.length ? " → " + e.esempi.join(" · ") : ""}`);
          console.log(`      perché: ${e.motivo}`);
        }
      };
      if (r.natura === "storico") {
        // Non «onesto»: NON GIUDICATO, e col perché. Dire verde su ciò che non si è misurato è la
        // forma esatta del difetto che AR-394 cura.
        console.log(`↩︎ ${r.file}: non giudicato — ${r.ambito}`);
        continue;
      }
      if (!r.violazioni.length) {
        console.log(`✅ ${r.file}: onesto (nessun segnaposto, nessun numero senza fonte)${comeMisurato}`);
        dilloAncheSeVerde();
        continue;
      }
      console.log(`❌ ${r.file}: ${r.violazioni.length} violazione/i${comeMisurato}`);
      for (const v of r.violazioni) {
        console.log(`   [${v.tipo}] ${v.regola}${v.esempi.length ? " → " + v.esempi.join(" · ") : ""}`);
      }
      dilloAncheSeVerde();
    }
    if (nonGiudicato) console.log("\n⚪ Non l'ho potuto guardare (testo oltre il tetto): non è un verde, e non pubblicare come se lo fosse.");
    else console.log(ok ? "\n🟢 Testo pubblicabile." : `\n🔴 ${totali} problema/i: NON pubblicare finché non risolvi (segnaposto/[ESEMPIO]/numeri senza fonte).`);
  }

  process.exit(nonGiudicato ? 2 : ok ? 0 : 1);
}

// Main-guard: eseguito come comando parte; IMPORTATO da un test no. Senza questa riga il solo
// `import` di questo file faceva partire il programma e usciva con 2 («nessun input»), quindi le
// funzioni pure qui dentro non erano provabili — ed è una delle ragioni per cui AR-433 è vissuto
// tanto a lungo: la regola sbagliata non aveva un test che potesse contraddirla.
if (process.argv[1] && process.argv[1].endsWith("onesta-check.mjs")) main();
