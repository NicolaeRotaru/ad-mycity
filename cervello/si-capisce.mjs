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

/** Le tre risposte che un testo lungo deve dare prima di ogni dettaglio. */
export const BLOCCHI = ["In parole semplici", "Cosa cambia per te", "Cosa devi fare"];

/** Sotto questa soglia è un messaggio breve: la struttura sarebbe burocrazia. */
export const RIGHE_TESTO_LUNGO = 15;

/** Oltre questa lunghezza una frase va spezzata: non è stile, è memoria di chi legge. */
export const PAROLE_FRASE_AVVISO = 20;
export const PAROLE_FRASE_ROSSA = 30;

/** I segni che sto spiegando una parola sul momento, invece di darla per scontata. */
const SEGNI_DI_SPIEGAZIONE = /(cioè|ovvero|vale a dire|che sarebbe|si chiama|—|\(|:)/;

/** Le frasi che danno per scontato un contesto che Nicola non ha mai visto. */
const SOTTINTESI = [
  "come dicevo", "come sopra", "come già detto", "come sai", "ovviamente", "com'è noto",
  "di stamattina", "di ieri sera", "la seconda volta oggi", "la terza volta oggi", "lo stesso di prima",
];

/** Le parole che dimostrano che sto facendo un esempio invece di enunciare una regola. */
const SEGNI_DI_ESEMPIO = /(per esempio|ad esempio|esempio concreto|esempio:|facciamo un caso|mettiamo che|\bcioè\b)/i;

/** Le unità che danno un metro a un numero: senza, «253» non dice se è tanto o poco. */
const UNITA = new RegExp(
  "(%|€|euro|giorni?|ore|minuti?|secondi?|settimane?|mesi?|anni?|volte|negozi?|ordini?|clienti?|" +
    "file|righe|parole|prove|difetti|guardiani|agenti|senior|km|kg|byte|kb|mb|su\\s+\\d)",
  "i",
);

/** Dove finisce la parte per Nicola e cominciano i dettagli per chi esegue. */
const MARCATORE_TECNICO = /^#{1,4}\s.*dettagl\w*\s+tecnic/i;

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
 * Misura un testo. Non giudica il contenuto: guarda com'è costruita la spiegazione.
 * Pura: non tocca rete né disco (il glossario arriva da fuori), quindi si prova in un test.
 */
export function misura(testo, { noteAGlossario = null } = {}) {
  const righeNicola = senzaCodice(parteDiNicola(testo));
  const corpo = righeNicola.join("\n");
  const parole = corpo.split(/\s+/).filter(Boolean).length;
  const testoLungo = righeNicola.filter((r) => r.trim()).length >= RIGHE_TESTO_LUNGO;
  const problemi = [];
  const avvisi = [];

  // ① Le parole della macchina: nel glossario si studiano, fuori dal glossario vanno spiegate.
  const fuoriGlossario = new Map();
  righeNicola.forEach((riga, i) => {
    for (const parola of PAROLE_MACCHINA) {
      const re = new RegExp(`(?<![\\w-])${parola.replace(/-/g, "[- ]")}[aeio]?(?![\\w-])`, "gi");
      if (!re.test(riga)) continue;
      const nota = noteAGlossario?.has(parola);
      if (nota) continue; // Nicola la può studiare: la uso e va bene così
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

  for (const s of SOTTINTESI) {
    const i = righeNicola.findIndex((r) => r.toLowerCase().includes(s));
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
  if (sottoLaRiga > 3 && paroleTecnicheSopra === 0) {
    avvisi.push({
      riga: righeNicola.length,
      dico: "tutta la sostanza tecnica è finita sotto la riga: i termini e i ragionamenti servono a Nicola per capire come ragiona la macchina, spiegali dove servono",
    });
  }
  if (testoLungo && paroleTecnicheSopra === 0 && !/\d/.test(corpo)) {
    avvisi.push({ riga: 1, dico: "spiegazione senza sostanza: nessuno strumento, nessun numero, nessun fatto verificabile" });
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
  if (testoLungo) {
    for (const blocco of BLOCCHI) {
      if (!new RegExp(blocco.replace(/\s+/g, "\\s+"), "i").test(corpo)) {
        problemi.push({
          riga: 1,
          tipo: "manca-una-risposta",
          trovato: blocco,
          dico: `senza «${blocco}» Nicola deve cercarsi da solo la risposta che gli serve`,
        });
      }
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

  const minuti = Math.max(1, Math.round(parole / 180));
  return { problemi, avvisi, testoLungo, parole, minuti, fuoriGlossario: [...fuoriGlossario.keys()] };
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
        misurato: new Date().toISOString().slice(0, 16).replace("T", " "),
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

function main() {
  const argv = process.argv.slice(2);
  const radice = process.env.RADICE_REPO || ".";

  if (argv.includes("--scansione")) return scansione(radice);

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
  const m = misura(testo, { noteAGlossario: note });
  const { problemi, avvisi, minuti, parole } = m;

  console.log(`📏 ${parole} parole · ~${minuti} min di lettura · voto di difficoltà ${difficolta(m)}\n`);

  if (!problemi.length) {
    console.log("✅ si capisce" + (m.testoLungo ? " (tre risposte in cima, e c'è un esempio)" : ""));
    for (const a of avvisi.slice(0, 8)) console.log(`   ⚠️  riga ${a.riga}: ${a.dico}`);
    return 0;
  }

  const etichette = {
    "manca-una-risposta": "🧱 manca una delle tre risposte",
    "manca-esempio": "🔎 manca l'esempio concreto",
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
