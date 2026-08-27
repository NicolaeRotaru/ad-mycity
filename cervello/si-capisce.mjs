#!/usr/bin/env node
// AR-478 — misura se un testo si capisce, PRIMA che Nicola ci perda le ore.
//
// ⚠️ Questo strumento nasce sbagliato e viene corretto due volte da Nicola. La storia conta, perché
// la seconda correzione ribalta la prima:
//
//   1ª stesura (parole-difficili.mjs) — diagnosi: «il problema sono le parole tecniche» → vietarle
//      sopra la riga dei dettagli.
//   Nicola: «molte parole che usi sono parole tecniche e le voglio imparare … mi va bene che le usi».
//      → La diagnosi era sbagliata. Vietare il vocabolario gli toglie proprio la cosa che sta studiando.
//   Nicola, di nuovo: «però il modo in cui mi spieghi mi viene difficile da capire».
//      → Il difetto non è MAI stato il vocabolario: è la COSTRUZIONE della spiegazione.
//
// Da qui le due regole di questo strumento:
//
//   ① Le parole della macchina si usano. Ma o stanno nel GLOSSARIO che Nicola sta studiando, oppure
//      sono spiegate sul momento. Una parola nuova inventata al volo (potatore, spazzata, cricchetto)
//      è un debito che non entra in nessuno studio: la invento più in fretta di quanto lui possa
//      impararla. Il glossario è la fonte di verità, non una mia lista privata.
//
//   ② Si misura la FORMA della spiegazione, che è il difetto vero: frasi lunghe, incisi dentro
//      incisi, nessun esempio concreto, nessun passo indietro, numeri senza un metro, sottintesi
//      su cose che ho visto solo io.
//
// Il costo misurato del difetto: ~2 ore di Nicola per capire due scambi su cinque PR.
//
//   exit 0 → si capisce · exit 1 → va riscritto · exit 2 → non ho potuto misurare (AR-322)
//
// Uso:
//   node cervello/si-capisce.mjs <file.md>        misura un testo
//   … | node cervello/si-capisce.mjs              misura ciò che arriva da stdin
//   node cervello/si-capisce.mjs --scansione      classifica per difficoltà tutto ciò che Nicola legge
//   node cervello/si-capisce.mjs --parole         le parole della macchina che uso e NON sono nel glossario

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { timbroOra } from "./ora-piacenza.mjs";

export const GLOSSARIO = "MyCity-Vault/90-Memoria-AI/GLOSSARIO.md";

/**
 * Le parole della macchina che uso davvero, raccolte dai miei testi veri (PR, consegne, briefing).
 * NON è un elenco di parole vietate: è l'elenco delle parole da CONTROLLARE contro il glossario.
 * Una parola qui dentro va bene se Nicola può studiarla; va male se me la sono inventata ieri.
 */
export const PAROLE_MACCHINA = [
  "sensore", "sentinella", "radar", "guardiano", "cancello", "freno", "sonda", "pavimento", "tetto",
  "cricchetto", "cantiere", "difetto", "mutazione", "mutante", "spazzata", "potatore", "quaderno",
  "lotto", "perimetro", "baseline", "regressione", "vacuità", "denominatore", "fixture", "pathspec",
  "typecheck", "runtime", "deferral", "hook", "gate", "guardrail", "fail-closed", "commit", "branch",
  "merge", "deploy", "rollback", "webhook", "endpoint", "payout", "churn", "onboarding", "pipeline",
  "verdetto", "referto", "cieco", "orfano",
];

/**
 * Le QUATTRO risposte che un testo lungo deve dare prima di ogni dettaglio.
 *
 * Il quarto è nato da una proposta mia e da un sì di Nicola (3/8). Serve a una cosa sola: dire di
 * quanto fidarsi. Prima quella roba la infilavo in fondo o la dimenticavo, e un verde che non
 * dichiara cosa NON copre è una bugia gentile.
 * Misurato prima di renderlo obbligatorio: sui 417 testi lunghi del vault, i bloccati in più sono
 * ZERO — sono già tutti rossi per altro. Costo oggi nessuno, valore da domani.
 */
export const BLOCCHI = ["In parole semplici", "Cosa cambia per te", "Cosa devi fare", "Cosa non ho verificato"];

/** Sotto questa soglia è un messaggio breve: la struttura sarebbe burocrazia. */
export const RIGHE_TESTO_LUNGO = 15;

/**
 * Sotto questa soglia il testo è CORTO davvero, e i quattro blocchi pesano più di quello che
 * introducono (AR-530).
 *
 * Nicola, 4/8: «quando è corta la risposta che mi dai penso che non abbiano senso, ma tante volte
 * il riassunto che mi dai mi fa capire meglio la risposta».
 *
 * Le due metà della sua frase chiedono due cose diverse, e la cura è una sola: la struttura si
 * SCALA sulla lunghezza invece di essere accesa o spenta.
 *   sotto le 8 righe   → nessun blocco: la risposta è già corta quanto un blocco
 *   da 8 a 15 righe    → i blocchi se il testo risponde a domande numerate
 *   sopra le 15 righe  → i quattro blocchi, sempre
 *   sopra i 4 minuti   → i quattro blocchi più due righe di riassunto in cima
 * Il livello sotto non toglie niente al livello sopra: toglie l'impalcatura dove non regge niente.
 */
export const RIGHE_TESTO_CORTO = 8;

/**
 * Oltre questi minuti di lettura serve un RIASSUNTO in cima (AR-488).
 *
 * Nicola, 3/8: «inserisci il riassunto dei 4 blocchi se è troppo lungo». Quattro blocchi vanno bene
 * su due minuti di lettura. Su cinque, prima di arrivare al terzo blocco ha già perso il filo del
 * primo — e i quattro blocchi diventano quattro cose da tenere a mente invece che una scorciatoia.
 * Il riassunto è quella scorciatoia: due righe che dicono tutto, e il resto si legge se serve.
 */
export const MINUTI_CHE_VOGLIONO_UN_RIASSUNTO = 4;

/** Le forme con cui apro un riassunto: basta che ci sia, non conta come lo chiamo. */
const SEGNI_DI_RIASSUNTO = /(in due righe|in breve|riassunto|in sintesi|la versione corta)/i;

/** Oltre questa lunghezza una frase va spezzata: non è stile, è memoria di chi legge. */
export const PAROLE_FRASE_AVVISO = 20;
export const PAROLE_FRASE_ROSSA = 30;

/** I segni che sto spiegando una parola sul momento, invece di darla per scontata. */
// Accenti tolleranti: nei messaggi di commit scrivo «cioe'» senza accento, e senza questo la
// spiegazione data sul momento non veniva riconosciuta.
const SEGNI_DI_SPIEGAZIONE = /(cio[eè]'?|ovvero|vale a dire|che sarebbe|si chiama|—|\(|:)/;

/** Le frasi che danno per scontato un contesto che Nicola non ha mai visto. */
const SOTTINTESI = [
  "come dicevo", "come sopra", "come già detto", "come sai", "ovviamente", "com'è noto",
  "di stamattina", "di ieri sera", "la seconda volta oggi", "la terza volta oggi", "lo stesso di prima",
];

/** Quanti sottintesi sono sorvegliati: serve alla prova che impedisce di svuotare l'elenco. */
export const SOTTINTESI_CONTATI = SOTTINTESI.length;

/** Le parole che dimostrano che sto facendo un esempio invece di enunciare una regola. */
// AR-493 — niente `\b` intorno a una parola che finisce con l'accento. In JavaScript `\b` conta come
// «parola» solo le lettere ASCII: dopo la «è» di «cioè» non c'è nessun confine, quindi `\bcioè\b` non
// ha MAI potuto trovare niente. Il segno di esempio più usato in italiano era spento da sempre, e la
// misura accusava «manca l'esempio» su testi che l'esempio ce l'avevano — cioè mi mandava a
// riscrivere la cosa giusta. Stessa forma dell'accento già trovato in «piu'» e «cioe'»: le regole
// scritte in ASCII non leggono l'italiano.
const SEGNI_DI_ESEMPIO = /(per esempio|ad esempio|un esempio|esempio concreto|esempio:|facciamo un caso|mettiamo che|cioè|cioe')/i;

/** Le unità che danno un metro a un numero: senza, «253» non dice se è tanto o poco. */
const UNITA = new RegExp(
  "(%|€|euro|giorni?|ore|minuti?|secondi?|settimane?|mesi?|anni?|volte|negozi?|ordini?|clienti?|" +
    "file|righe|parole|prove|difetti|guardiani|agenti|senior|km|kg|byte|kb|mb|su\\s+\\d)",
  "i",
);

/** Dove finisce la parte per Nicola e cominciano i dettagli per chi esegue. */
const MARCATORE_TECNICO = /^#{1,4}\s.*dettagl\w*\s+tecnic/i;

/** Una riga che è solo il titolo di un blocco: è impalcatura, non contenuto. */
export function eTitoloDiBlocco(riga) {
  const pulito = String(riga).replace(/[#*_`:]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  return BLOCCHI.some((b) => pulito === b.toLowerCase());
}

/** Legge le parole che il glossario definisce davvero. Se il glossario non c'è, si dichiara cieco. */
export function parolePeggioNoteAGlossario(radice = ".") {
  const f = join(radice, GLOSSARIO);
  if (!existsSync(f)) return null; // cieco: non invento un verde né un rosso (AR-322)
  const testo = readFileSync(f, "utf8").toLowerCase();
  return new Set(PAROLE_MACCHINA.filter((p) => testo.includes(p.toLowerCase())));
}

/** Il testo che Nicola legge davvero: sotto «Dettagli tecnici» scrivo per chi esegue. */
export function parteDiNicola(testo) {
  const righe = String(testo).split("\n");
  const taglio = righe.findIndex((r) => MARCATORE_TECNICO.test(r));
  return taglio === -1 ? righe : righe.slice(0, taglio);
}

/** Dentro un blocco di codice il gergo è al suo posto: quello non lo legge come prosa. */
function senzaCodice(righe) {
  const fuori = [];
  let dentro = false;
  for (const r of righe) {
    if (/^\s*```/.test(r)) {
      dentro = !dentro;
      continue;
    }
    fuori.push(dentro ? "" : r);
  }
  return fuori;
}

/** Le abbreviazioni che finiscono col punto ma non finiscono la frase. */
const ABBREVIAZIONI = /\b(sig|sig\.ra|dott|dr|prof|es|n|pag|art|ecc|etc|vs|ca)\.\s/gi;

/**
 * Spezza in frasi vere, senza rompere sulle abbreviazioni e sui numeri con la virgola.
 *
 * LE TABELLE SI SPEZZANO PER CELLA. Il primo giro dal vivo ha accusato la riga di tabella
 * `| commit | Un salvataggio del lavoro | Ogni volta che finisco... |` di essere una frase da 34
 * parole. Non lo e: sono tre celle corte, e chi legge una tabella non le legge di fila. Erano 7
 * accuse su 9, cioe quasi tutte false — e un misuratore che accusa a torto viene spento entro il
 * giorno, che e il modo peggiore di perderlo.
 */
export function frasi(testo) {
  return testo
    .replace(ABBREVIAZIONI, (m) => m.replace(".", "\u0000"))
    .replace(/\b([A-Z])\.\s/g, "$1 ")
    .replace(/^[ \t]*\|(.+)\|[ \t]*$/gm, (_, riga) => riga.split("|").join(".\n"))
    .split(/(?<=[.!?:])\s+|\n{2,}/)
    .map((f) => f.replace(/\u0000/g, ".").replace(/[#*>|`_-]/g, " ").trim())
    .filter((f) => f.split(/\s+/).filter(Boolean).length >= 4);
}


/**
 * ARIA FRITTA — le parole che sembrano una spiegazione e non dicono niente (AR-483).
 *
 * Nicola: «aggiungi il controllo che capisce il senso, non la forma». Un controllo che capisce
 * davvero servirebbe un modello AI, e qui non c'e' nessuna chiave collegata: sarebbe una spesa e
 * una decisione sua. Ma un pezzo di senso si misura senza AI, ed e' il pezzo che fa perdere tempo:
 * le frasi che occupano una riga e non lasciano niente in testa.
 *
 * Il caso che l'ha generata, mio: «serve a rendere il sistema piu robusto». La parola «serve a»
 * faceva passare il controllo del passo indietro, e quella frase non dice ne cosa fa, ne per chi,
 * ne quanto. Il controllo vedeva la formula e non il vuoto.
 *
 * NON e' comprensione: e' assenza di contenuto. Un testo pieno di queste parole quasi sempre non si
 * capisce; un testo senza puo' comunque restare oscuro. Va detto, e sta scritto nel verdetto.
 */
export const ARIA_FRITTA = [
  { re: /\bpi[uù]'? robust\w*/gi, invece: "cosa non si rompe più, e in quale caso" },
  // Solo le AFFERMAZIONI, non la parola in sé: «se una cosa è migliorata o peggiorata» è la
  // definizione di baseline, non una vanteria. Preso dal glossario stesso, primo falso positivo.
  { re: /\b(ho|abbiamo|è stat[oa]|sono stat[ei]|viene|l'ho)\s+migliorat\w+/gi, invece: "da quanto a quanto" },
  { re: /\b(ho|abbiamo|è stat[oa]|sono stat[ei]|viene|l'ho)\s+ottimizzat\w+/gi, invece: "quale numero è cambiato e di quanto" },
  { re: /\bottimizzazion\w+/gi, invece: "quale numero è cambiato e di quanto" },
  { re: /\bpi[uù]'? efficient\w*/gi, invece: "quanto tempo o quanti soldi in meno" },
  { re: /\bin modo (corretto|adeguato|appropriato|opportuno)\b/gi, invece: "cosa fa esattamente" },
  { re: /\b(varie|vari|alcune|alcuni) (cose|aspetti|elementi|punti|modifiche)\b/gi, invece: "quali, per nome" },
  { re: /\bqualcosa che\b/gi, invece: "la cosa precisa" },
  { re: /\bgestisce meglio\b/gi, invece: "cosa succedeva prima e cosa succede adesso" },
  { re: /\bin generale\b/gi, invece: "il caso concreto" },
  { re: /\bnon c'?[eè]'? problema\b/gi, invece: "cosa hai verificato" },
  { re: /\btutto (a posto|ok|bene)\b/gi, invece: "quali controlli sono passati" },
  { re: /\bcome previsto\b/gi, invece: "cosa ti aspettavi, con il numero" },
  { re: /\bpi[uù]'? (chiaro|semplice|leggibile)\b/gi, invece: "misurato come, da quanto a quanto" },
  { re: /\bdovrebbe (funzionare|andare|essere)\b/gi, invece: "l'ho provato oppure no: dillo" },
  { re: /\bin sostanza\b/gi, invece: "la cosa, senza preamboli" },
];

/**
 * Quanta struttura pretende un testo: `corta` · `media` · `lunga` (AR-530).
 *
 * ESISTE PERCHÉ DEVE ESSERE UNA SOLA. Il freno (`si-capisce.mjs`) e il contatore
 * (`conta-blocco-mancante.mjs`) devono rispondere alla stessa domanda con la stessa regola: se il
 * contatore misura messaggi che il freno non pretende, conta dimenticanze che non sono tali. Prima
 * la condizione era scritta due volte, in due file, con due sfumature diverse — ed è il modo in cui
 * due controlli gemelli smettono di esserlo senza che nessuno se ne accorga.
 *
 * I TITOLI DEI BLOCCHI NON SONO CONTENUTO. Quattro titoli sopra quattro frasi sono otto righe piene
 * e due frasi di sostanza: contando le righe grezze quel testo risultava «medio» e i blocchi
 * restavano obbligatori — cioè la misura si autogiustificava con la propria impalcatura.
 */
export function livelloDiStruttura(testo) {
  const righe = senzaCodice(parteDiNicola(testo));
  const piene = righe.filter((r) => r.trim()).length;
  const contenuto = righe.filter((r) => r.trim() && !eTitoloDiBlocco(r)).length;
  if (piene >= RIGHE_TESTO_LUNGO) return "lunga";
  if (contenuto < RIGHE_TESTO_CORTO) return "corta";
  return "media";
}

/** Trova le frasi vuote in un testo. Pura: si prova su una stringa. */
export function ariaFritta(testo) {
  const fuori = [];
  // L'APOSTROFO NON È UNA VIRGOLETTA. In italiano «e'», «piu'», «perche'» sono apostrofi usati al
  // posto dell'accento, e leggerli come citazione cancellava mezza frase: la mia stessa prova su
  // «piu' robusto» è diventata rossa. Contano solo «», "" e le virgolette tipografiche.
  // CITARE NON È USARE, anche qui. Il caso vero: stavo spiegando a Nicola quali frasi sono vuote,
  // e il controllo ha accusato la riga che le elencava. La stessa esenzione già valeva sui
  // sottintesi e non era stata estesa qui: mezza cura è una cura che torna indietro.
  const righe = senzaCodice(parteDiNicola(testo)).map((r) =>
    r.replace(/[«"“][^«»"“”]{0,80}[»"”]/g, " "),
  );
  righe.forEach((riga, i) => {
    // Una cella di tabella che contiene SOLO il termine è un'etichetta, non una frase che lo usa:
    // è la colonna di sinistra di ogni tabella che spiega quali frasi sono vuote. Trovato mentre le
    // elencavo a Nicola: il controllo accusava la riga che insegnava la regola.
    const celleEtichetta = new Set(
      (riga.match(/\|([^|]*)\|/g) || []).map((c) => c.replace(/[|*`]/g, "").trim().toLowerCase()),
    );
    for (const { re, invece } of ARIA_FRITTA) {
      for (const m of riga.matchAll(re)) {
        if (celleEtichetta.has(m[0].trim().toLowerCase())) continue;
        fuori.push({ riga: i + 1, trovato: m[0], dico: `non dice niente: di' ${invece}` });
      }
    }
  });
  return fuori;
}


/**
 * PAROLE NUOVE — il rilevamento automatico del gergo che non ho ancora spiegato (AR-486).
 *
 * Nicola, 3/8: «da adesso in poi quando un senior, la macchina o tu usate una nuova parola tecnica
 * verrà spiegata ed inserita in automatico dentro il glossario?».
 *
 * IL BUCO CHE CHIUDE. Fino a qui il controllo confrontava i testi con `PAROLE_MACCHINA`, un elenco
 * scritto a mano da me. Una parola che invento domani non è in quell'elenco, quindi nessuno la vede:
 * il controllo si difendeva dalle parole che già conoscevo, non da quelle nuove. È il difetto del
 * perimetro letterale, applicato al vocabolario.
 *
 * COME LE TROVA, senza elenchi. In italiano quasi ogni parola finisce per vocale. Una parola di
 * prosa che finisce per consonante è quasi sempre straniera o tecnica: `push`, `token`, `webhook`,
 * `rollback`. Non serve sapere quali sono: serve la forma.
 *
 * COSA NON FA, e va detto: non scrive da sola la voce del glossario. Una definizione sbagliata
 * dentro il materiale che Nicola studia è peggio di una parola mancante. La macchina la SEGNALA e
 * blocca; la definizione la scrive chi consegna, e Nicola la legge.
 */
const CODA_ITALIANA = /[aeiouàèéìòù]$/i;

/** Parole che finiscono per consonante ma sono italiane comuni: non sono gergo. */
const ITALIANE_TRONCHE = new Set([
  "non", "per", "con", "del", "dal", "nel", "col", "sul", "il", "un", "che", "chi", "cui", "gli",
  "ben", "gran", "san", "qual", "tal", "pur", "poi", "mai", "più", "già", "però", "perciò", "cioè",
  "così", "quasi", "ogni", "alcun", "nessun", "ciascun", "buon", "gran", "gli", "gia", "piu", "puo",
  "gennaio", "gioved", "marted", "mercoled", "venerd", "sabat",
  // Nomi propri e parole entrate nell'italiano di tutti i giorni: non sono gergo da spiegare.
  "mycity", "ad-mycity", "nicola", "piacenza", "stripe", "supabase", "vercel", "render", "posthog",
  "telegram", "whatsapp", "instagram", "facebook", "google", "marketing", "social", "brand", "web",
  "email", "online", "internet", "manager", "test", "budget", "partner", "standard", "sport", "bar",
  "hotel", "shop", "staff", "leader", "trend", "target", "format", "gap", "top", "flop", "ok",
]);

/** Trova le parole tecniche non spiegate e non presenti nel glossario. Pura: si prova su una stringa. */
export function paroleNuove(testo, testoGlossario = "") {
  const glo = String(testoGlossario).toLowerCase();
  const trovate = new Map();
  const righe = senzaCodice(parteDiNicola(testo))
    .map((r) => r.replace(/`[^`]*`/g, " ")) // dentro l'apice è codice, non prosa
    .map((r) => r.replace(/\[[^\]]*\]\([^)]*\)/g, " ")) // i link non sono parole da imparare
    .map((r) => r.replace(/[\w./-]+\.(mjs|json|md|ts|tsx|sh|yml|com|it)\b/g, " ")) // né i nomi di file
    .map((r) => r.replace(/https?:\/\/\S+/g, " "));
  righe.forEach((riga, i) => {
    for (const m of riga.matchAll(/[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ-]{3,17}/g)) {
      const w = m[0].toLowerCase();
      if (CODA_ITALIANA.test(w) || ITALIANE_TRONCHE.has(w)) continue;
      if (glo.includes(w)) continue; // Nicola la può già studiare
      if (SEGNI_DI_SPIEGAZIONE.test(riga)) continue; // la sto spiegando qui
      if (!trovate.has(w)) trovate.set(w, i + 1);
    }
  });
  return [...trovate].map(([parola, riga]) => ({ parola, riga }));
}


/**
 * IDEE GIÀ DETTE — il controllo che guarda la conversazione, non il singolo messaggio (AR-489).
 *
 * Il difetto, misurato sui sette messaggi dopo la foto di Nicola del 3/8: SEI idee su sette dette
 * più di una volta, e una detta quattro volte. Il costo è tutto suo: rilegge per scoprire se c'è
 * qualcosa di nuovo, e spesso non c'è.
 *
 * PERCHÉ NASCE, e la causa è questo strumento. Quando il cancello ferma un messaggio, io ne scrivo
 * un altro. Lo scrivo intero, perché «si regga da solo» — e quel reggersi da solo è esattamente il
 * contesto già detto due righe sopra. Ogni blocco genera un doppione.
 *
 * COME LE TROVA, senza modelli scritti a mano. Confrontare le frasi parola per parola non serve: io
 * riformulo. Misurato: sulle 6 idee ripetute davvero, il confronto letterale ne trovava UNA.
 * Quindi si confrontano le PAROLE PIENE — quelle che portano il significato, tolte le paroline di
 * servizio. Due frasi che condividono la maggior parte delle parole piene dicono la stessa cosa,
 * anche se sono scritte diverse.
 *
 * COSA NON VEDE, dichiarato: una ripetizione fatta con sinonimi diversi («controlli verdi» → «tutto
 * a posto») non viene presa. Serve un modello che capisce il senso, e qui non c'è nessuna chiave AI.
 */

/** Le paroline di servizio: non portano significato, quindi non contano nel confronto. */
const PAROLE_VUOTE = new Set([
  "il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "di", "a", "da", "in", "con", "su", "per",
  "tra", "fra", "del", "dello", "della", "dei", "degli", "delle", "al", "allo", "alla", "ai", "agli",
  "alle", "dal", "dalla", "nel", "nella", "nei", "sul", "sulla", "che", "chi", "cui", "non", "più",
  "meno", "come", "quando", "dove", "perché", "perche", "se", "ma", "però", "pero", "anche", "ancora",
  "già", "gia", "solo", "tutto", "tutti", "tutte", "questo", "questa", "questi", "queste", "quello",
  "quella", "essere", "sono", "è", "e", "ho", "hai", "ha", "hanno", "era", "erano", "sarà", "sara",
  "ti", "te", "mi", "me", "si", "ci", "vi", "ne", "lui", "lei", "loro", "io", "tu", "noi", "voi",
  "quindi", "poi", "adesso", "ora", "oggi", "ieri", "domani", "cosa", "cose", "fare", "fatto", "detto",
]);

/** Le parole che portano il significato di una frase. */
function paroleP1ene(frase) {
  return new Set(
    String(frase)
      .toLowerCase()
      .replace(/[^a-zà-ÿ0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !PAROLE_VUOTE.has(w)),
  );
}

/** Quanto si somigliano due insiemi di parole piene già calcolati. */
function somiglianzaFraInsiemi(pa, pb) {
  if (pa.size < 3 || pb.size < 3) return 0; // frasi troppo povere: non si giudica
  let comuni = 0;
  for (const w of pa) if (pb.has(w)) comuni++;
  return comuni / Math.min(pa.size, pb.size);
}

/** Quanto due frasi dicono la stessa cosa: 1 = identiche nelle parole piene, 0 = niente in comune. */
export function quantoSiSomigliano(a, b) {
  return somiglianzaFraInsiemi(paroleP1ene(a), paroleP1ene(b));
}

/** Sopra questa somiglianza due frasi dicono la stessa cosa. Tarato sui casi veri del 3/8. */
export const SOGLIA_STESSA_IDEA = 0.6;

/**
 * Le frasi del messaggio nuovo che ripetono qualcosa già detto nei messaggi precedenti.
 * Pura: prende i testi già letti, così una prova la può eseguire su una conversazione finta.
 */
export function ideeRipetute(nuovo, precedenti = []) {
  const frasiPrima = precedenti.flatMap((t) => frasi(senzaCodice(parteDiNicola(t)).join("\n")));
  const fuori = [];
  for (const f of frasi(senzaCodice(parteDiNicola(nuovo)).join("\n"))) {
    let peggiore = null;
    for (const g of frasiPrima) {
      const q = quantoSiSomigliano(f, g);
      if (q >= SOGLIA_STESSA_IDEA && (!peggiore || q > peggiore.quanto)) {
        peggiore = { quanto: Math.round(q * 100), gia: g.slice(0, 60) };
      }
    }
    if (peggiore) fuori.push({ frase: f.slice(0, 60), ...peggiore });
  }
  return fuori;
}


/**
 * RIPETUTO DENTRO LO STESSO MESSAGGIO — il cieco di `ideeRipetute` (AR-530).
 *
 * IL DIFETTO, con la sua foto. Nicola, 4/8: «stai ancora ripetendo la stessa cosa due volte». Il
 * messaggio che gli ho mandato aveva DUE volte i quattro blocchi, due volte lo stesso comando da
 * copiare, e le stesse tre frasi riscritte con parole diverse. Passato dal controllo con zero
 * segnalazioni di ripetizione.
 *
 * PERCHÉ PASSAVA. `ideeRipetute` confronta il messaggio nuovo con i messaggi PRECEDENTI. Un
 * messaggio che ripete sé stesso non ha nessun precedente da confrontare: il paragone non parte, e
 * il verdetto esce verde. La misura contro le ripetizioni era cieca proprio alla forma più visibile
 * di ripetizione — quella che sta tutta sotto gli occhi di Nicola nella stessa schermata.
 *
 * TRE MISURE, PERCHÉ SONO TRE DIFETTI DIVERSI:
 *   ① un titolo dei quattro blocchi che compare due volte → il testo si è raddoppiato di struttura
 *   ② lo stesso blocco di comandi due volte               → il copia-incolla che si duplica da solo
 *   ③ due frasi che dicono la stessa cosa, LONTANE        → l'idea ridetta invece che ripresa
 *
 * COSA NON DEVE PRENDERE, e qui sta la taratura vera. Il **ripasso** — la cosa importante detta due
 * volte con parole diverse — è una regola scritta (`scrittura-umana.md`, Regola 2, mossa 3) e serve
 * a Nicola: se si perde una parola ha perso tutto. Quindi la vicinanza è il discrimine: una
 * riformulazione entro poche frasi è ripasso e passa; la stessa idea che torna dieci frasi dopo non
 * è un ripasso, è il testo che ricomincia da capo. Detta tre volte non è più ripasso a nessuna
 * distanza.
 */

/** Entro quante frasi una riformulazione è ancora ripasso e non doppione. */
export const DISTANZA_RIPASSO = 4;

/** Oltre questo numero di volte la stessa idea non è ripasso a nessuna distanza. */
export const VOLTE_CHE_NON_SONO_RIPASSO = 3;

/**
 * Dentro UN testo la soglia è più alta che fra due messaggi (0,85 contro 0,6), e il motivo è
 * misurato, non stimato.
 *
 * Con la soglia bassa, sui 692 testi del vault uscivano 6.077 segnalazioni: guardandole una per una,
 * la maggior parte erano ELENCHI CON LA STESSA INTELAIATURA — «Costo: poche ore» sotto ogni opzione,
 * «Rischio: medio» sotto ogni altra. Stesse parole, contenuto opposto. Fra due messaggi diversi
 * quella forma non capita quasi mai; dentro un documento è la norma, e un controllo che accusa a
 * torto viene spento entro il giorno.
 *
 * Qui serve la stessa frase ridetta, non una cugina con lo stesso scheletro.
 */
export const SOGLIA_STESSA_FRASE_QUI = 0.85;

/** L'etichetta con cui si apre una voce di elenco: «Costo:», «Rischio:», «Chi:». */
const ETICHETTA = /^\s*\*{0,2}([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ']{0,24}):/;

/** Due voci dello stesso elenco non sono una ripetizione: cambia proprio quello che c'è dopo. */
function stessaIntelaiatura(a, b) {
  const ea = ETICHETTA.exec(a);
  const eb = ETICHETTA.exec(b);
  if (ea && eb && ea[1].trim().toLowerCase() === eb[1].trim().toLowerCase()) return true;
  // Numeri diversi = righe che dicono cose diverse con le stesse parole («3.942 alle 18:23» vs
  // «4.006 alle 22:26»): è una tabella, non un doppione.
  const na = (a.match(/\d[\d.,]*/g) || []).join("|");
  const nb = (b.match(/\d[\d.,]*/g) || []).join("|");
  return Boolean(na || nb) && na !== nb;
}

/** I blocchi di comandi di un testo, normalizzati: due blocchi uguali sono un copia-incolla doppio. */
function blocchiDiComandi(righe) {
  const fuori = [];
  let dentro = null;
  let daRiga = 0;
  righe.forEach((r, i) => {
    if (!/^\s*```/.test(r)) {
      if (dentro) dentro.push(r.trim());
      return;
    }
    if (dentro) {
      const testo = dentro.filter(Boolean).join("\n");
      if (testo) fuori.push({ testo, riga: daRiga });
      dentro = null;
    } else {
      dentro = [];
      daRiga = i + 1;
    }
  });
  return fuori;
}

/** Le ripetizioni dentro un solo testo. Pura: si prova su una stringa. */
export function ripetizioniInterne(testo) {
  const righe = parteDiNicola(testo);
  const fuori = [];

  // ① I titoli dei quattro blocchi: ognuno vale una volta sola per testo.
  const titoli = new Map();
  righe.forEach((r, i) => {
    const pulito = r.replace(/[#*_`:]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    for (const b of BLOCCHI) {
      if (pulito !== b.toLowerCase()) continue;
      titoli.set(b, [...(titoli.get(b) || []), i + 1]);
    }
  });
  for (const [blocco, righeViste] of titoli) {
    if (righeViste.length < 2) continue;
    fuori.push({
      riga: righeViste[righeViste.length - 1],
      trovato: `«${blocco}» ${righeViste.length} volte`,
      frase: blocco,
      dico: `il testo riparte da capo: «${blocco}» c'è già alla riga ${righeViste[0]} — tieni un blocco solo e mettici dentro tutto`,
    });
  }

  // ② Lo stesso blocco di comandi due volte: Nicola lo copia una volta, non due.
  const comandi = new Map();
  for (const b of blocchiDiComandi(righe)) {
    comandi.set(b.testo, [...(comandi.get(b.testo) || []), b.riga]);
  }
  for (const [testoComando, righeViste] of comandi) {
    if (righeViste.length < 2) continue;
    fuori.push({
      riga: righeViste[righeViste.length - 1],
      trovato: `stesso comando ${righeViste.length} volte`,
      frase: testoComando.split("\n")[0].slice(0, 60),
      dico: `lo stesso blocco di comandi è già alla riga ${righeViste[0]}: chi legge non sa se sono due passi o uno solo`,
    });
  }

  // ③ Le frasi che ridicono la stessa cosa lontano dalla prima volta.
  //
  // CONFRONTATE PER INDICE, NON TUTTE CONTRO TUTTE. Il primo giro confrontava ogni frase con ogni
  // altra: su un documento del vault sono milioni di paragoni e il controllo non finiva più. Un
  // controllo che gira a ogni turno e ci mette due minuti viene spento, quindi non è un dettaglio.
  //
  // Il filtro è ESATTO, non un taglio: due frasi che si somigliano almeno quanto la soglia (0,85) su
  // insiemi di almeno 3 parole piene devono avere per forza 3 parole piene in comune (0,85 × 3 =
  // 2,55, e le parole non si contano a metà). Quindi confronto solo le frasi che condividono almeno
  // tre parole piene: quelle che scarto non avrebbero potuto superare la soglia comunque.
  const elenco = frasi(senzaCodice(righe).join("\n"));
  const insiemi = elenco.map(paroleP1ene);
  const doveCompare = new Map(); // parola piena → le frasi che la contengono
  insiemi.forEach((s, i) => {
    for (const w of s) doveCompare.set(w, [...(doveCompare.get(w) || []), i]);
  });
  const gruppi = []; // ogni gruppo = una idea, con le posizioni in cui compare
  const gruppoDi = new Map(); // frase → il gruppo in cui è già finita
  const abbinata = new Map(); // frase → la frase che ha DAVVERO fatto scattare il confronto
  elenco.forEach((f, i) => {
    const vicini = new Map(); // frase precedente → quante parole piene in comune
    for (const w of insiemi[i]) {
      for (const j of doveCompare.get(w) || []) {
        if (j >= i) continue;
        vicini.set(j, (vicini.get(j) || 0) + 1);
      }
    }
    for (const [j, comuni] of vicini) {
      if (comuni < 3) continue; // sotto la soglia per costruzione: non c'è niente da calcolare
      if (somiglianzaFraInsiemi(insiemi[i], insiemi[j]) < SOGLIA_STESSA_FRASE_QUI) continue;
      if (stessaIntelaiatura(elenco[i], elenco[j])) continue; // due voci dello stesso elenco
      const g = gruppoDi.get(j);
      if (g === undefined) continue;
      gruppi[g].dove.push(i);
      gruppoDi.set(i, g);
      abbinata.set(i, j);
      return;
    }
    gruppoDi.set(i, gruppi.length);
    gruppi.push({ dove: [i] });
  });
  for (const g of gruppi) {
    if (g.dove.length < 2) continue;
    const primo = g.dove[0];
    const ultimo = g.dove[g.dove.length - 1];
    const lontane = ultimo - primo > DISTANZA_RIPASSO;
    const troppe = g.dove.length >= VOLTE_CHE_NON_SONO_RIPASSO;
    if (!lontane && !troppe) continue; // ripasso vicino: è la regola, non il difetto
    const f = elenco[ultimo];
    // CITO LA FRASE CHE HA DAVVERO FATTO SCATTARE IL CONFRONTO, non la prima del gruppo. Le idee si
    // agganciano a catena — A somiglia a B, B somiglia a C — e la prima della catena può non
    // somigliare per niente all'ultima. Nel primo giro dal vivo il verdetto accusava una frase
    // mostrandone un'altra che non c'entrava: un'accusa che chi legge non può verificare vale zero.
    const gia = elenco[abbinata.get(ultimo) ?? primo];
    fuori.push({
      riga: righe.findIndex((r) => r.includes(f.slice(0, 25))) + 1 || 1,
      trovato: troppe ? `stessa idea ${g.dove.length} volte` : `stessa idea a ${ultimo - primo} frasi di distanza`,
      frase: f.slice(0, 60).trim() + (f.length > 60 ? "…" : ""),
      dico: `l'hai già detto qui dentro: «${gia.slice(0, 60)}» — un ripasso sta accanto alla frase, non dieci frasi dopo`,
    });
  }

  return fuori;
}


/**
 * COPERTURA — cosa guarda ogni misura, e cosa NON può vedere (AR-490).
 *
 * Il difetto di FORMA, trovato quattro volte in un giorno solo: ogni misura guardava il pezzo e non
 * l'insieme, e ogni volta il buco si è visto solo usandola sul lavoro vero.
 *   ① leggeva una riga di tabella come se fosse una frase   → 7 accuse false su 9
 *   ② leggeva una frase citata come se la stessi usando     → 2 accuse false su 3
 *   ③ leggeva un elenco come se fosse un periodo            → 3 accuse false su 7
 *   ④ leggeva un messaggio senza sapere cosa c'era prima    → 6 idee ripetute su 7
 * Le prime tre le ho riparate una per una. La quarta è la stessa malattia, e ripararla di nuovo
 * non chiude niente: la prossima misura nascerà cieca allo stesso modo.
 *
 * LA CURA È QUESTA TABELLA. Ogni misura dichiara la sua UNITÀ (cosa guarda) e il suo CIECO (cosa
 * quell'unità non può vedere per costruzione). Una misura nuova senza le due dichiarazioni non
 * passa: la prova `si-capisce.test.mjs` diventa rossa.
 *
 * Non impedisce di nascere ciechi — impedisce di nascere ciechi IN SILENZIO, che è la differenza
 * fra un limite dichiarato e una bugia gentile.
 */
/**
 * Dove comincia la risposta a domande numerate — o -1 se il testo non ne è una.
 *
 * Serve una definizione stretta, perché un elenco puntato non è una risposta numerata e accusarlo
 * sarebbe il solito controllo che grida al lupo. Chiedo tre cose insieme: una riga che ATTACCA col
 * numero (non un «nel 2026» in mezzo alla frase), che il primo numero visto sia 1, e che ce ne sia
 * almeno un secondo dopo. Un elenco «1. 2. 3.» dentro i dettagli tecnici le soddisfa e viene preso:
 * è il prezzo di una regola semplice, e il rimedio (mettere i blocchi sopra) è giusto lo stesso.
 */
export function indiceDellaPrimaRispostaNumerata(righe = []) {
  const NUMERATA = /^\s*(?:\*\*|__)?(\d{1,2})\s*[).]\s*\S/;
  let primo = -1;
  let visti = 0;
  for (let i = 0; i < righe.length; i++) {
    const m = NUMERATA.exec(righe[i]);
    if (!m) continue;
    if (primo === -1) {
      if (m[1] !== "1") continue; // un «3)» senza il suo «1)» sopra è un frammento, non una risposta
      primo = i;
    }
    visti++;
    if (visti >= 2) return primo;
  }
  return -1;
}

export const COPERTURA = {
  "parola-mia": { unita: "la parola", cieco: "una parola nuova che non è in nessun elenco: la prende `paroleNuove`" },
  "frase-lunga": { unita: "la frase", cieco: "un testo fatto di frasi corte che nell'insieme non dice niente" },
  incisi: { unita: "la frase", cieco: "due idee messe in due frasi vicine invece che in una sola" },
  sottinteso: { unita: "la riga", cieco: "un sottinteso scritto con parole che non sono nell'elenco" },
  "aria-fritta": { unita: "la riga", cieco: "una frase vuota costruita con parole diverse da quelle sorvegliate" },
  "sostanza-nascosta": { unita: "il testo intero", cieco: "sostanza presente ma sbagliata: qui non si giudica la verità" },
  "manca-una-risposta": { unita: "il testo intero", cieco: "un blocco presente col titolo giusto e vuoto dentro" },
  "risposte-prima-dei-blocchi": {
    unita: "l'ordine delle righe",
    cieco: "una risposta a domande poste senza numeri («e la seconda cosa che ti ho chiesto?»): lì l'ordine non lo vedo",
  },
  "manca-esempio": { unita: "il testo intero", cieco: "un esempio che c'è ma è inventato o non c'entra" },
  "manca-riassunto": { unita: "il testo intero", cieco: "un riassunto che c'è e non riassume niente" },
  "gia-detto": { unita: "la conversazione", cieco: "una ripetizione fatta con sinonimi: servirebbe un modello che capisce il senso" },
  "gia-detto-qui": {
    unita: "il testo intero, a coppie di frasi",
    cieco: "un ripasso legittimo scritto lontano dalla frase di partenza: da qui lo leggo come doppione, perché la distanza è l'unico segno che ho",
  },
  "blocchi-su-testo-corto": {
    unita: "il testo intero",
    cieco: "un testo corto di righe ma denso di idee, dove i blocchi servirebbero lo stesso",
  },
};

/**
 * Misura un testo. Non giudica il contenuto: guarda com'è costruita la spiegazione.
 * Pura: non tocca rete né disco (il glossario arriva da fuori), quindi si prova in un test.
 */
export function misura(testo, { noteAGlossario = null, testoGlossario = null, precedenti = [] } = {}) {
  const righeNicola = senzaCodice(parteDiNicola(testo));
  const corpo = righeNicola.join("\n");
  const parole = corpo.split(/\s+/).filter(Boolean).length;
  const righePiene = righeNicola.filter((r) => r.trim()).length;
  const livello = livelloDiStruttura(testo);
  const testoLungo = livello === "lunga";
  const testoCorto = livello === "corta";
  const minutiStimati = Math.max(1, Math.round(parole / 180));
  const problemi = [];
  const avvisi = [];

  // ① Le parole della macchina: nel glossario si studiano, fuori dal glossario vanno spiegate.
  //
  // ⛔ 27/8 · AR-854 — SE IL GLOSSARIO NON SI LEGGE, QUESTO CONTROLLO NON PARLA.
  //
  // Prima c'era `noteAGlossario?.has(parola)`, e quel `?.` faceva sparire la differenza fra «non è
  // nel glossario» e «il glossario non l'ho potuto leggere»: senza elenco l'espressione vale
  // `undefined`, cioè falso, e OGNI parola della macchina diventava un problema. Misurato sullo
  // stesso testo il 27/8: dalla radice del repo «✅ si capisce», da un'altra cartella «❌ 2 punti
  // che costringono Nicola a rileggere» — e le due parole accusate stanno nel glossario da agosto.
  //
  // È il ⚪ letto come ❌, sullo strumento che si lancia PRIMA di ogni consegna. Un misuratore che
  // accusa quando non ha misurato si impara a ignorarlo, ed è il modo in cui muore un freno: ho
  // riscritto due volte un testo che andava già bene, prima di andare a guardarlo.
  //
  // Il fratello a dieci righe da qui — `if (testoGlossario != null)` — la domanda la faceva giusta.
  // La cecità NON diventa un avviso qui dentro: `misura` è pura e la chiamano decine di prove
  // senza glossario, che è un caso legittimo — «non me l'hai passato» non è «non l'ho trovato».
  // Esce come un CAMPO del referto, e a dirlo è chi ha provato a leggerlo: il comando qui sotto.
  const fuoriGlossario = new Map();
  const glossarioCieco = noteAGlossario == null;
  righeNicola.forEach((riga, i) => {
    if (glossarioCieco) return;
    for (const parola of PAROLE_MACCHINA) {
      const re = new RegExp(`(?<![\\w-])${parola.replace(/-/g, "[- ]")}[aeio]?(?![\\w-])`, "gi");
      if (!re.test(riga)) continue;
      if (noteAGlossario.has(parola)) continue; // Nicola la può studiare: la uso e va bene così
      const spiegataQui = SEGNI_DI_SPIEGAZIONE.test(riga);
      if (spiegataQui) continue;
      if (!fuoriGlossario.has(parola)) fuoriGlossario.set(parola, i + 1);
    }
  });
  for (const [parola, riga] of fuoriGlossario) {
    problemi.push({
      riga,
      tipo: "parola-mia",
      trovato: parola,
      dico: "non è nel glossario che Nicola sta studiando: spiegala dove la usi, o non usarla",
    });
  }

  // ② La forma della spiegazione — il difetto vero.
  for (const f of frasi(corpo)) {
    // UN ELENCO NON È UNA FRASE. «i numeri con la fonte · il ragionamento · le alternative · gli
    // errori · i limiti» sono cinque voci separate, non un periodo da 30 parole: chi legge le prende
    // una per volta. Trovato sul mio stesso messaggio a Nicola, due accuse su sette.
    // Il segno: molti separatori e pochi verbi coniugati.
    const separatori = (f.match(/·/g) || []).length + (f.match(/,/g) || []).length;
    if (separatori >= 4 && !/\b(è|sono|ha|hanno|viene|vengono|deve|devono|fa|fanno)\b/i.test(f)) continue;

    const n = f.split(/\s+/).filter(Boolean).length;
    // IL NUMERO DI RIGA NON BASTA, e spesso è pure sbagliato: una frase che va a capo non si trova
    // in nessuna riga singola, e il locatore ripiega sulla riga 1. Scoperto usandolo: il cancello mi
    // ha detto «spezzala» quattro volte senza dirmi QUALE frase, ed è la specie di verdetto che non
    // si può eseguire. Da qui in poi il verdetto porta la frase, e la riga resta un di più.
    const riga = righeNicola.findIndex((r) => r.includes(f.slice(0, 25))) + 1 || 1;
    const inizio = f.slice(0, 60).trim() + (f.length > 60 ? "…" : "");
    if (n > PAROLE_FRASE_ROSSA) {
      problemi.push({ riga, tipo: "frase-lunga", trovato: `${n} parole`, frase: inizio, dico: "spezzala: una frase, un'idea" });
    } else if (n > PAROLE_FRASE_AVVISO) {
      avvisi.push({ riga, dico: `frase da ${n} parole: sta al limite`, frase: inizio });
    }
    // Due incisi in una frase sola è il difetto che si vede di più nei testi che Nicola non ha capito:
    // un'idea si apre, ne entra un'altra, e la prima si chiude tre righe dopo. È un problema, non un vezzo.
    const incisi = (f.match(/[(—;]/g) || []).length;
    if (incisi >= 2) {
      problemi.push({
        riga,
        tipo: "incisi",
        trovato: `${incisi} incisi in una frase`,
        frase: inizio,
        dico: "chi legge deve tenere in sospeso l'idea di partenza: spezza in frasi separate",
      });
    }
  }

  // CITARE NON È USARE. Il secondo blocco dal vivo ha accusato la riga di tabella che SPIEGA la
  // regola: «niente "come dicevo", "la terza volta oggi"». Le stavo citando come esempi di cosa non
  // fare, e il controllo le ha lette come se le stessi usando. Due accuse su tre erano false.
  // Regola: dentro le virgolette è una citazione. Si può aggirare virgolettando apposta, ma nessuno
  // scrive «come dicevo» fra virgolette per davvero — e un controllo che accusa a torto viene spento.
  const senzaCitazioni = righeNicola.map((r) => r.replace(/[«"“][^«»"“”]{0,80}[»"”]/g, " "));
  for (const s of SOTTINTESI) {
    const i = senzaCitazioni.findIndex((r) => r.toLowerCase().includes(s));
    if (i !== -1) {
      problemi.push({
        riga: i + 1,
        tipo: "sottinteso",
        trovato: s,
        dico: "dà per scontato un contesto che ha visto solo la macchina: dillo per esteso",
      });
    }
  }

  righeNicola.forEach((riga, i) => {
    for (const m of riga.matchAll(/(?<![\w.,:/€#-])(\d{2,})(?![\w.,:/%-])/g)) {
      const coda = riga.slice(m.index + m[0].length, m.index + m[0].length + 20);
      const testa = riga.slice(Math.max(0, m.index - 12), m.index);
      if (UNITA.test(coda) || UNITA.test(testa) || /^\s*(su|di|e)\s/.test(coda)) continue;
      if (/^(19|20)\d{2}$/.test(m[1])) continue; // un anno è già un metro
      avvisi.push({ riga: i + 1, dico: `«${m[1]}» senza metro: di' di quanto su quanto, o cosa conta` });
    }
  });

  // ③ LA SOSTANZA NON SI SEMPLIFICA — la settima regola, chiesta da Nicola il 2/8:
  //    «non tralasciare mai i termini tecnici, mi aiutano a capire come ragiona e agisce la macchina;
  //     e non solo i termini, anche i ragionamenti e le azioni».
  //
  // Il rischio l'ho creato io con la riga «Dettagli tecnici»: diventa la discarica dove finisce
  // proprio ciò che lui vuole studiare, e sopra resta una versione annacquata. Qui si misura il
  // difetto opposto a tutti gli altri: non «troppo difficile», ma «troppo vuoto».
  //
  // Restano AVVISI e non bocciature, per un motivo dichiarato: una lettera a un negoziante non parla
  // di strumenti e non deve. Un rosso lì sarebbe un falso positivo, e un cancello che accusa a torto
  // viene spento entro il giorno.
  const sottoLaRiga = String(testo).split("\n").length - righeNicola.length;
  const paroleTecnicheSopra = PAROLE_MACCHINA.filter((p) =>
    new RegExp(`(?<![\\w-])${p.replace(/-/g, "[- ]")}[aeio]?(?![\\w-])`, "i").test(corpo),
  ).length;
  // BLOCCA, non avvisa (deciso il 3/8 dopo averlo misurato). Nicola: «se la regola bloccasse invece
  // di avvisare, cosa cambierebbe?». Misurato sui 689 testi veri: **zero** testi nuovi bloccati,
  // perché i 19 che hanno questo difetto sono già rossi per altro. Costo di oggi: nessuno.
  // Valore di domani: è l'unico caso in cui un testo può essere pulito in tutto e vuoto dentro,
  // ed è esattamente il difetto che avrei creato io con la riga «Dettagli tecnici».
  // AR-519 — «sostanza» non vuol dire «gergo». Questa regola cercava SOLO le parole della macchina, e
  // la sua gemella due righe più sotto sa già che un numero è sostanza quanto una parola tecnica: due
  // metri diversi per la stessa domanda, dentro la stessa funzione. Il caso che l'ha scoperto: il
  // referto della visita, che sopra la riga dice «112 ore», «2026-07-30 11:19» e «sentinella-dati.json»
  // — cioè tutto ciò che serve a capire — e veniva chiamato «forma pulita, contenuto svuotato».
  // Riscrivere quel referto per infilarci una parola dell'elenco sarebbe stato scrivere per il metro.
  const fattiSopra =
    /\d{4}-\d{2}-\d{2}/.test(corpo) ||
    /\d+\s*(ore|giorni?|minuti?|settimane?|mesi|volte|%|€|euro)\b/i.test(corpo) ||
    /\bsu\s+\d/.test(corpo) ||
    /[\w-]+\.(mjs|json|md|sh|ts|tsx|yml)\b/.test(corpo);
  if (sottoLaRiga > 3 && paroleTecnicheSopra === 0 && !fattiSopra) {
    problemi.push({
      riga: righeNicola.length,
      tipo: "sostanza-nascosta",
      trovato: "tutta la sostanza è sotto la riga",
      dico: "i termini e i ragionamenti servono a Nicola per capire come ragiona la macchina: spiegali dove servono, non nasconderli in fondo",
    });
  }
  if (testoLungo && paroleTecnicheSopra === 0 && !/\d/.test(corpo)) {
    problemi.push({
      riga: 1,
      tipo: "sostanza-nascosta",
      trovato: "nessun fatto verificabile",
      dico: "spiegazione senza sostanza: nessuno strumento, nessun numero, nessun nome proprio",
    });
  }

  // Le parole nuove sono un AVVISO, mai un blocco. Misurato prima di decidere: 484 consegne su 601
  // ne contengono almeno una, e 782 parole diverse. Bloccare vorrebbe dire fermare quattro consegne
  // su cinque — e un cancello sempre rosso viene aggirato al secondo giro. Qui serve un pungolo che
  // riempie una fila di lavoro, non una porta chiusa.
  if (testoGlossario != null) {
    for (const n of paroleNuove(testo, testoGlossario).slice(0, 3)) {
      avvisi.push({ riga: n.riga, dico: `«${n.parola}» non è nel glossario: spiegala qui, o mettila in fila` });
    }
  }

  // ③-ter Le idee già dette: guarda la CONVERSAZIONE, non il messaggio. È l'unica misura qui dentro
  // che ha memoria, ed esiste perché tutte le altre non ne hanno.
  for (const r of ideeRipetute(testo, precedenti)) {
    problemi.push({
      riga: 1,
      tipo: "gia-detto",
      trovato: `${r.quanto}% uguale a una frase già mandata`,
      frase: r.frase,
      dico: `l'hai già detto: «${r.gia}» — manda solo il pezzo nuovo`,
    });
  }

  // ③-quater Le ripetizioni DENTRO questo stesso testo. Vale su qualunque lunghezza: la foto di
  // Nicola del 4/8 è un messaggio di media lunghezza che si è raddoppiato, non un documento.
  for (const r of ripetizioniInterne(testo)) {
    problemi.push({ riga: r.riga, tipo: "gia-detto-qui", trovato: r.trovato, frase: r.frase, dico: r.dico });
  }

  // ③-bis L'aria fritta: parole che sembrano spiegare e non dicono niente. Blocca, perché è
  // esattamente il tipo di riga che costringe Nicola a rileggere per capire che non c'era niente.
  for (const a of ariaFritta(testo)) {
    problemi.push({ riga: a.riga, tipo: "aria-fritta", trovato: a.trovato, dico: a.dico });
  }

  // ④ Le tre risposte, l'esempio e il passo indietro: solo sui testi lunghi, dove servono davvero.
  if (testoLungo) {
    // Il PASSO INDIETRO è una misura debole e va detto: cerco i segni che sto dicendo *di cosa* parlo
    // e *a cosa serve* prima del merito. Un testo può passare questa e non fare il passo indietro
    // davvero — è un pungolo, non una prova. L'unico giudice vero resta Nicola.
    const apertura = righeNicola.slice(0, 12).join(" ");
    if (!/(serve a|a cosa serve|vuol dire|si occupa|parlo di|prima di cosa|cioè)/i.test(apertura)) {
      avvisi.push({ riga: 1, dico: "manca il passo indietro: nelle prime righe non dico di cosa parlo e a cosa serve" });
    }
  }
  // ④-bis LE RISPOSTE NUMERATE — la forma in cui il blocco spariva davvero (AR-517).
  //
  // Misurato sulla sessione del 3/8: i quattro blocchi mancavano in 11 messaggi lunghi su 20, ma
  // fra le RISPOSTE a domande numerate mancavano in 6 su 8. Non è distrazione: è la struttura. Quando
  // Nicola scrive «1) … 2) … 3)», la mia risposta parte da «1)» perché è lì che cade l'occhio, e i
  // blocchi non trovano più un posto dove stare. Un promemoria non lo cura — la seconda volta lo
  // salti lo stesso. Quello che lo cura è cambiare l'ordine: prima le quattro risposte, poi i numeri.
  const primaRisposta = indiceDellaPrimaRispostaNumerata(righeNicola);
  const rispondeAiNumeri = primaRisposta !== -1;
  if (rispondeAiNumeri) {
    const sopra = righeNicola.slice(0, primaRisposta).join("\n");
    for (const blocco of BLOCCHI) {
      const cerca = new RegExp(blocco.replace(/\s+/g, "\\s+"), "i");
      if (cerca.test(corpo) && !cerca.test(sopra)) {
        problemi.push({
          riga: primaRisposta + 1,
          tipo: "risposte-prima-dei-blocchi",
          trovato: blocco,
          dico: `«${blocco}» arriva DOPO il primo punto numerato: chi legge deve arrivare in fondo per sapere cosa cambia per lui`,
        });
      }
    }
  }
  // LA STRUTTURA SI SCALA SULLA LUNGHEZZA (AR-530). Nicola, 4/8: «quando è corta la risposta che mi
  // dai penso che non abbiano senso, ma tante volte il riassunto che mi dai mi fa capire meglio la
  // risposta». Le due metà della frase non si contraddicono: i blocchi aiutano quando c'è qualcosa
  // da attraversare, e diventano quattro intestazioni sopra sei righe quando non c'è.
  // Le domande numerate da sole non bastano più a pretenderli: una risposta di tre righe a «1) 2)»
  // resta una risposta di tre righe. L'ORDINE invece resta preteso sempre — se i blocchi ci sono,
  // vanno sopra i numeri (AR-517): quel controllo è qui sopra e non si tocca.
  const bloccoPresente = (b) => new RegExp(b.replace(/\s+/g, "\\s+"), "i").test(corpo);
  if (testoLungo || (rispondeAiNumeri && !testoCorto)) {
    for (const blocco of BLOCCHI) {
      if (!bloccoPresente(blocco)) {
        problemi.push({
          riga: 1,
          tipo: "manca-una-risposta",
          trovato: blocco,
          dico: `senza «${blocco}» Nicola deve cercarsi da solo la risposta che gli serve`,
        });
      }
    }
  } else if (testoCorto) {
    const quanti = BLOCCHI.filter(bloccoPresente).length;
    if (quanti >= 3) {
      problemi.push({
        riga: 1,
        tipo: "blocchi-su-testo-corto",
        trovato: `${quanti} blocchi sopra ${righePiene} righe di testo`,
        dico: "l'impalcatura pesa più di quello che regge: su una risposta così corta di' la cosa e basta",
      });
    }
  }
  // Riassunto ed esempio restano legati alla LUNGHEZZA, non alle domande numerate: pretenderli anche
  // su una risposta corta a due punti sarebbe una casella in più da riempire, cioè un'accusa falsa —
  // e un controllo che accusa a torto viene spento (è la storia di AR-490 e AR-493).
  if (testoLungo) {
    // Il riassunto: solo sui testi davvero lunghi. Su un testo da 2 minuti sarebbe una casella in più.
    if (minutiStimati >= MINUTI_CHE_VOGLIONO_UN_RIASSUNTO && !SEGNI_DI_RIASSUNTO.test(corpo)) {
      problemi.push({
        riga: 1,
        tipo: "manca-riassunto",
        trovato: `${minutiStimati} minuti di lettura`,
        dico: "un testo così lungo apre con due righe di riassunto: il resto si legge solo se serve",
      });
    }
    if (!SEGNI_DI_ESEMPIO.test(corpo)) {
      problemi.push({
        riga: 1,
        tipo: "manca-esempio",
        trovato: "nessun esempio concreto",
        dico: "una regola astratta senza un caso vero costa venti minuti a chi legge",
      });
    }
  }

  return { problemi, avvisi, testoLungo, parole, minuti: minutiStimati, glossarioCieco, fuoriGlossario: [...fuoriGlossario.keys()] };
}

/** Il voto di difficoltà: problemi per 100 parole. Confrontabile fra testi di lunghezza diversa. */
export function difficolta({ problemi, avvisi, parole }) {
  if (!parole) return 0;
  return Math.round(((problemi.length * 2 + avvisi.length) / parole) * 1000) / 10;
}


// ── LA MISURA CHE CONTA DAVVERO: quante volte Nicola ha dovuto chiedere (AR-482) ────────────────
//
// Tutte le altre misure di questo file guardano ME: quanto sono lunghe le mie frasi, se ho messo un
// esempio, se ho aperto con le tre risposte. Sono misure di forma, e possono essere tutte verdi
// mentre Nicola continua a non capire. Il limite dichiarato in AR-478 era esattamente questo:
// «il misuratore non sa se hai capito».
//
// Questa invece guarda LUI: quante volte, in una conversazione, ha dovuto fermarsi e chiedere cosa
// intendevo. È un segnale indiretto — un «perché?» può essere curiosità, non fatica — ma è l'unico
// numero disponibile che parli del suo tempo invece che del mio stile. E il costo che stiamo
// cercando di abbattere è il suo tempo: «ho perso 2 ore», «mi fa perdere ore di tempo».

/** Le forme con cui Nicola dice «non ci sono arrivato»: prese dalle sue frasi vere, non inventate. */
export const RICHIESTE_DI_AIUTO = [
  /non ho capito/i, /non capisco/i, /non si capisce/i, /cosa vuol dire/i, /che cosa vuol dire/i,
  /spiegami/i, /rispiegami/i, /mi spieghi/i, /che cos'?è/i, /in che senso/i, /non mi è chiaro/i,
  /perdo (tanto |tantissimo )?tempo/i, /difficile da capire/i, /mi sono perso/i, /cosa intendi/i,
];

/** Estrae i messaggi di Nicola da una trascrizione di Claude Code (una riga JSON per evento). */
export function messaggiDiNicola(righeJsonl = []) {
  const fuori = [];
  for (const riga of righeJsonl) {
    let ev;
    try {
      ev = JSON.parse(riga);
    } catch {
      continue; // riga spezzata: non è un verdetto, si salta
    }
    if (ev?.type !== "user") continue;
    const c = ev?.message?.content;
    const testo = typeof c === "string" ? c : Array.isArray(c) ? c.filter((p) => p?.type === "text").map((p) => p.text).join(" ") : "";
    // I risultati degli strumenti arrivano come messaggi "user" ma non li scrive Nicola.
    if (!testo.trim() || /^\s*<(tool|system|command)/.test(testo)) continue;
    fuori.push(testo);
  }
  return fuori;
}

/**
 * Quante volte Nicola ha dovuto chiedere spiegazioni. Meno è, meglio è.
 * Pura: prende le righe già lette, così una prova la può eseguire su una conversazione finta.
 */
export function quanteVolteHaChiesto(righeJsonl = []) {
  const suoi = messaggiDiNicola(righeJsonl);
  const chieste = suoi.filter((t) => RICHIESTE_DI_AIUTO.some((r) => r.test(t)));
  return {
    messaggi: suoi.length,
    chieste: chieste.length,
    quota: suoi.length ? Math.round((chieste.length / suoi.length) * 100) : null,
    ultime: chieste.slice(-3).map((t) => t.slice(0, 90).replace(/\s+/g, " ")),
  };
}

// ── Dove Nicola legge ───────────────────────────────────────────────────────────────────────────
// Due CARTELLE, non un elenco di file: un file nuovo che nasce lì dentro entra da solo nella misura.
// Un elenco scritto a mano avrebbe smesso di misurare il giorno dopo, alla prima consegna nuova.
const CORPUS = ["MyCity-Vault/90-Memoria-AI", "consegne"];

/** Le cartelle di sola storia: lì dentro non si riscrive niente, misurarle sarebbe rumore. */
const STORIA = /(^|\/)(archivio|storico|_archivio|node_modules)(\/|$)/;

function fileDelCorpus(radice) {
  const out = [];
  const aggiungi = (p) => {
    if (!existsSync(p) || STORIA.test(p)) return;
    const st = statSync(p);
    if (st.isFile() && p.endsWith(".md")) out.push(p);
    else if (st.isDirectory()) for (const f of readdirSync(p)) aggiungi(join(p, f));
  };
  for (const c of CORPUS) aggiungi(join(radice, c));
  // NIENTE TAGLIO AI PIU' RECENTI. Il primo giro ne prendeva 60 e i tre file che Nicola apre ogni
  // giorno — STATO, BACHECA, AZIONI-IN-ATTESA — erano fuori dalla misura, perche' l'ultima modifica
  // era del 30/7 e nel frattempo erano nate 60 consegne. Il numero in cima diceva "52.008 parole"
  // saltando le 43.000 che pesano di piu'. Una misura che esclude i casi grossi non e' una misura.
  return out.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
}

function scansione(radice) {
  const note = parolePeggioNoteAGlossario(radice);
  if (!note) {
    console.log("⚪ non trovo il glossario: non posso dire quali parole Nicola può studiare");
    return 2;
  }
  const file = fileDelCorpus(radice);
  if (!file.length) {
    console.log("⚪ nessun testo da misurare");
    return 2;
  }

  const righe = file.map((f) => {
    const m = misura(readFileSync(f, "utf8"), { noteAGlossario: note });
    return { file: relative(radice, f), voto: difficolta(m), ...m };
  });
  righe.sort((a, b) => b.voto - a.voto);

  console.log(`📏 Quanto è difficile leggermi — ${righe.length} testi che Nicola legge davvero\n`);
  console.log("   voto  problemi  parole  testo");
  for (const r of righe.slice(0, 15)) {
    console.log(
      `   ${String(r.voto).padStart(4)}  ${String(r.problemi.length).padStart(8)}  ${String(r.parole).padStart(6)}  ${r.file}`,
    );
  }

  const tot = righe.reduce((a, r) => a + r.problemi.length, 0);
  const parole = righe.reduce((a, r) => a + r.parole, 0);
  const perTipo = {};
  for (const r of righe) for (const p of r.problemi) perTipo[p.tipo] = (perTipo[p.tipo] || 0) + 1;

  const minutiTotali = Math.round(parole / 180);
  console.log(`\n   totale: ${tot} problemi su ${parole} parole (${(tot / righe.length).toFixed(1)} per testo)`);
  console.log(`   quanto ci mette Nicola a leggerli tutti: ~${minutiTotali} minuti (${(minutiTotali / 60).toFixed(1)} ore)`);
  console.log("\n   per tipo:");
  for (const [t, n] of Object.entries(perTipo).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${String(n).padStart(4)}  ${t}`);
  }

  const mie = new Map();
  for (const r of righe) for (const p of r.fuoriGlossario) mie.set(p, (mie.get(p) || 0) + 1);
  if (mie.size) {
    console.log("\n   parole mie che NON sono nel glossario (Nicola non le può studiare):");
    for (const [p, n] of [...mie].sort((a, b) => b[1] - a[1])) console.log(`     ${String(n).padStart(4)}× ${p}`);
  }

  // Il referto resta su disco: senza un punto di partenza scritto, «sto migliorando» è un'opinione.
  const dove = join(radice, "MyCity-Vault/90-Memoria-AI/auto-coscienza/si-capisce.json");
  writeFileSync(
    dove,
    JSON.stringify(
      {
        _cosa_e: "Quanto è difficile leggere quello che scrivo a Nicola. Meno è, meglio è.",
        misurato: timbroOra(),
        testi: righe.length,
        parole,
        problemi: tot,
        minuti_di_lettura: Math.round(parole / 180),
        per_testo: Number((tot / righe.length).toFixed(1)),
        per_tipo: perTipo,
        parole_fuori_glossario: Object.fromEntries(mie),
        peggiori: righe.slice(0, 10).map((r) => ({ file: r.file, voto: r.voto, problemi: r.problemi.length })),
        // I piu' LUNGHI, non i piu' difficili: un testo da un'ora non si aggiusta spezzando le frasi.
        piu_lunghi: [...righe]
          .sort((a, b) => b.minuti - a.minuti)
          .slice(0, 5)
          .map((r) => ({ file: r.file, minuti: r.minuti, parole: r.parole })),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`\n   referto: ${relative(radice, dove)}`);
  return 0;
}

/**
 * QUALI DELLE QUATTRO RISPOSTE MANCANO — la domanda che il worker deve poter fare da bash.
 *
 * 2026-08-21. La regola dei quattro blocchi ha un freno per la chat: il cancello dello Stop misura
 * il messaggio prima che parta. Ma il worker sul server NON passa da lì — è una porta laterale
 * senza i freni della principale, che è una malattia con un nome nel registro. Il conto è nel
 * mansionario: «Cosa non ho verificato» mancava nel 100% dei 26 messaggi del VPS, mentre gli altri
 * tre c'erano sempre. Il blocco che sparisce è sempre lo stesso, ed è quello che dice a Nicola di
 * quanto fidarsi.
 *
 * `conta-blocco-mancante.mjs` lo MISURA, ma misura il passato: dice quanti messaggi erano fatti
 * male dopo che sono partiti. Questa funzione serve prima, sul messaggio in mano.
 *
 * Non è un misuratore nuovo: chiede a `misura()`, la stessa che usa il cancello. Due misuratori
 * della stessa cosa divergono al primo ritocco, e questo file lo dice già di sé stesso.
 *
 * `mancanti` è vuoto anche per i testi corti, dove i blocchi NON si pretendono (AR-530): la regola
 * su quando servono vive in un posto solo, dentro `misura`.
 *
 * ⚠️ `misurato` NON è un dettaglio. Se la misura non riesce, «non manca niente» sarebbe un verde
 * uscito da un controllo che non è avvenuto — la malattia che questo repo chiama
 * «fonte-troncata-letta-per-intera», e che il guardiano dei fratelli mi ha giustamente contestato
 * alla prima stesura di questa funzione. Non misurabile e a posto sono due risposte diverse, e chi
 * chiama deve poterle distinguere: ⚪ non è mai ✅.
 */
export function blocchiMancanti(testo) {
  if (!testo || !String(testo).trim()) return { misurato: true, mancanti: [] }; // niente testo, niente accusa
  try {
    return {
      misurato: true,
      mancanti: misura(String(testo)).problemi.filter((p) => p.tipo === "manca-una-risposta").map((p) => p.trovato),
    };
  } catch (e) {
    return { misurato: false, mancanti: [], perche: e?.message || String(e) };
  }
}

function main() {
  const argv = process.argv.slice(2);
  // `--blocchi <file>` — stampa i titoli mancanti, uno per riga.
  //   uscita 0 = misurato (stdout vuoto significa: non manca niente)
  //   uscita 2 = NON ho potuto misurare — che non è «va bene», ed è il motivo per cui i due casi
  //              hanno due codici diversi invece di un `[]` buono per entrambi.
  // Nessuno dei due è 1: chi chiama è il worker, che ha già in mano la risposta per Nicola. Un
  // rosso lì farebbe buttare via la risposta, e un freno che perde il lavoro viene spento entro la
  // settimana. Il freno qui è la VISIBILITÀ: il buco arriva a Nicola insieme al testo.
  if (argv.includes("--blocchi")) {
    const file = argv.find((a) => !a.startsWith("--"));
    if (!file || !existsSync(file)) return 2; // il file non c'è: non ho misurato niente
    const esito = blocchiMancanti(readFileSync(file, "utf8"));
    if (!esito.misurato) return 2;
    for (const b of esito.mancanti) console.log(b);
    return 0;
  }
  const radice = process.env.RADICE_REPO || ".";

  if (argv.includes("--scansione")) return scansione(radice);

  // AR-486 — la fila delle parole da spiegare, ordinata per quante volte Nicola le ha incontrate.
  // Non scrive da sola la voce del glossario: una definizione sbagliata dentro il materiale che lui
  // studia è peggio di una parola mancante. Prepara il lavoro, non lo esegue.
  if (argv.includes("--nuove")) {
    const gFile = join(radice, GLOSSARIO);
    if (!existsSync(gFile)) {
      console.log("⚪ glossario non trovato: non so quali parole Nicola può già studiare");
      return 2;
    }
    const glo = readFileSync(gFile, "utf8");
    const file = fileDelCorpus(radice);
    const conta = new Map();
    for (const f of file) {
      for (const n of paroleNuove(readFileSync(f, "utf8"), glo)) {
        conta.set(n.parola, (conta.get(n.parola) || 0) + 1);
      }
    }
    const ord = [...conta].sort((a, b) => b[1] - a[1]);
    console.log(`📚 ${ord.length} parole tecniche che uso e che Nicola non può studiare\n`);
    console.log("   Le 25 che incontra di più:");
    for (const [w, n] of ord.slice(0, 25)) console.log(`     ${String(n).padStart(4)}×  ${w}`);
    const dove = join(radice, "MyCity-Vault/90-Memoria-AI/auto-coscienza/parole-da-spiegare.json");
    writeFileSync(
      dove,
      JSON.stringify(
        {
          _cosa_e: "Le parole tecniche che compaiono nei testi di Nicola e non sono nel GLOSSARIO. La fila da smaltire.",
          misurato: timbroOra(),
          testi_letti: file.length,
          parole_diverse: ord.length,
          fila: ord.slice(0, 100).map(([parola, volte]) => ({ parola, volte })),
        },
        null,
        2,
      ) + "\n",
    );
    console.log(`\n   fila completa: ${relative(radice, dove)}`);
    return 0;
  }

  // AR-482 — la misura che guarda Nicola invece di me, con la sua storia su file.
  // Senza storia, «l'82% è sceso» sarebbe una mia impressione: è esattamente il difetto dei numeri
  // senza fonte. Ogni sessione lascia una riga, e la riga di ieri non si riscrive.
  if (argv.includes("--capito")) {
    const file = argv.find((a) => !a.startsWith("--"));
    if (!file || !existsSync(file)) {
      console.log("⚪ nessuna trascrizione da leggere: passa il percorso del file della conversazione");
      return 2;
    }
    const r = quanteVolteHaChiesto(readFileSync(file, "utf8").split("\n").filter(Boolean));
    if (!r.messaggi) {
      console.log("⚪ nessun messaggio di Nicola in questa conversazione: non misuro niente");
      return 2;
    }
    console.log(`🙋 Quante volte Nicola ha dovuto chiedere spiegazioni\n`);
    console.log(`   messaggi suoi:        ${r.messaggi}`);
    console.log(`   richieste di aiuto:   ${r.chieste}  (${r.quota}%)`);
    for (const u of r.ultime) console.log(`     · ${u}`);

    const dove = join(radice, "MyCity-Vault/90-Memoria-AI/auto-coscienza/capito.json");
    let storia = { _cosa_e: "Quante volte Nicola ha dovuto chiedere spiegazioni, sessione per sessione. Meno è, meglio è.", sessioni: [] };
    if (existsSync(dove)) {
      try {
        storia = JSON.parse(readFileSync(dove, "utf8"));
      } catch {
        // referto illeggibile: riparto pulito invece di perdere la misura di oggi
      }
    }
    storia.sessioni.push({ quando: timbroOra(), ...r, ultime: undefined });
    storia.sessioni = storia.sessioni.slice(-60); // due mesi di storia bastano a vedere una tendenza
    const q = storia.sessioni.map((x) => x.quota).filter((x) => x != null);
    storia.media_ultime_5 = q.length ? Math.round(q.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, q.length)) : null;
    writeFileSync(dove, JSON.stringify(storia, null, 2) + "\n");
    console.log(`\n   media delle ultime 5 sessioni: ${storia.media_ultime_5}%`);
    console.log(`   storia: ${relative(radice, dove)}`);
    return 0;
  }

  if (argv.includes("--parole")) {
    const note = parolePeggioNoteAGlossario(radice);
    if (!note) {
      console.log("⚪ glossario non trovato");
      return 2;
    }
    const fuori = PAROLE_MACCHINA.filter((p) => !note.has(p));
    console.log(`📖 ${note.size} parole sono nel glossario · ${fuori.length} no\n`);
    console.log("   Da spiegare ogni volta che le uso (o da smettere di usare):");
    for (const p of fuori) console.log(`     · ${p}`);
    return fuori.length ? 1 : 0;
  }

  let testo;
  try {
    const file = argv.find((a) => !a.startsWith("--"));
    testo = file ? readFileSync(file, "utf8") : process.stdin.isTTY ? null : readFileSync(0, "utf8");
  } catch (e) {
    console.log(`⚪ non ho potuto leggere il testo: ${e.message}`);
    return 2;
  }
  if (testo == null || !testo.trim()) {
    console.log("⚪ nessun testo da misurare (passa un file o mandalo da stdin)");
    return 2;
  }

  const note = parolePeggioNoteAGlossario(radice);
  const gFile = join(radice, GLOSSARIO);
  const m = misura(testo, {
    noteAGlossario: note,
    testoGlossario: existsSync(gFile) ? readFileSync(gFile, "utf8") : null,
  });
  const { problemi, avvisi, minuti, parole } = m;

  console.log(`📏 ${parole} parole · ~${minuti} min di lettura · voto di difficoltà ${difficolta(m)}\n`);

  // ⚪ AR-854 — chi ha PROVATO a leggere il glossario è questo comando, e quindi tocca a lui dirlo.
  // Un controllo che non ha misurato deve dichiararlo: il silenzio si legge come «ho guardato e va
  // bene», ed è la bugia più comoda che uno strumento possa raccontare.
  if (m.glossarioCieco) {
    console.log(`⚪ non ho letto il glossario (${gFile}): le parole della macchina in questo testo NON le ho controllate.`);
    console.log("   Rimedio: lancia dalla radice del repo, oppure passa RADICE_REPO=<cartella>.\n");
  }

  if (!problemi.length) {
    console.log("✅ si capisce" + (m.testoLungo ? " (tre risposte in cima, e c'è un esempio)" : ""));
    for (const a of avvisi.slice(0, 8)) console.log(`   ⚠️  riga ${a.riga}: ${a.dico}`);
    return 0;
  }

  const etichette = {
    "manca-una-risposta": "🧱 manca una delle tre risposte",
    "risposte-prima-dei-blocchi": "🔢 i numeri prima delle risposte",
    "manca-esempio": "🔎 manca l'esempio concreto",
    "manca-riassunto": "📄 troppo lungo senza due righe di riassunto in cima",
    "gia-detto": "🔁 cose che gli ho già mandato",
    "gia-detto-qui": "🔂 cose ripetute due volte dentro questo stesso testo",
    "blocchi-su-testo-corto": "🏗️  quattro titoli sopra una risposta corta",
    "aria-fritta": "💨 parole che sembrano spiegare e non dicono niente",
    "sostanza-nascosta": "🫙 forma pulita, contenuto svuotato",
    "frase-lunga": "🧵 frasi troppo lunghe",
    "parola-mia": "🗣️  parole mie, fuori dal glossario",
    incisi: "🧩 due idee dentro una frase sola",
    sottinteso: "🕳️  do per scontato quello che ha visto solo la macchina",
  };
  console.log(`❌ ${problemi.length} punti che costringono Nicola a rileggere\n`);
  for (const tipo of Object.keys(etichette)) {
    const g = problemi.filter((p) => p.tipo === tipo);
    if (!g.length) continue;
    console.log(etichette[tipo]);
    for (const p of g) {
      console.log(`   «${p.trovato}» → ${p.dico}`);
      if (p.frase) console.log(`      ${p.frase}`);
    }
    console.log("");
  }
  for (const a of avvisi.slice(0, 10)) console.log(`⚠️  riga ${a.riga}: ${a.dico}`);
  console.log("\n→ le sei regole: cervello/scrittura-umana.md");
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(main());
