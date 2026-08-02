#!/usr/bin/env node
// AR-478 — il testo che Nicola legge non deve avere bisogno di un glossario.
//
// Il difetto, col suo conto: Nicola ha perso ~2 ore per capire due scambi sulle ultime 5 PR.
// La regola di scrittura umana esisteva già (`cervello/scrittura-umana.md`) ma il suo perimetro
// copriva SOLO i titoli delle card del Pannello. I due posti dove Nicola legge davvero — la chat
// e il corpo delle PR — erano fuori dalla regola, e infatti lì il gergo è al massimo:
//
//   PR #654, titolo:  «AR-474 + AR-477: il contatore dell'abitudine, i limiti del freno sull'esito,
//                      e i due canali»
//   PR #653, corpo:   «il cancello del lotto», «la spazzata-fratelli», «12 mutazioni → non-vacuita»,
//                      «exit 2 fuori dall'hook», «⚪ non è mai un verde»
//
// Nessuna di quelle parole significa niente per chi non ha letto le 40 PR precedenti. E la prova
// che il problema è strutturale e non estetico: per leggere la macchina è servito scrivere un
// GLOSSARIO in 11 parti (PR #651). Un vocabolario privato che richiede un dizionario NON è una
// lingua: è un costo che pago io e paga Nicola ogni volta.
//
// Questo strumento misura un testo PRIMA che Nicola lo legga. Non giudica il contenuto: guarda
// solo se le parole sono quelle di tutti, e se il testo risponde alle tre domande che gli servono.
//
//   exit 0 → si legge · exit 1 → serve una traduzione · exit 2 → non ho potuto misurare (AR-322)
//
// Uso:
//   node cervello/parole-difficili.mjs <file.md>          misura un file
//   … | node cervello/parole-difficili.mjs                misura ciò che arriva da stdin
//   node cervello/parole-difficili.mjs --dizionario       stampa le traduzioni

import { readFileSync } from "node:fs";

/**
 * Il vocabolario privato della macchina → come si dice in alto, dove legge Nicola.
 * Sotto la riga dei dettagli tecnici queste parole sono legittime: lì scrivo per chi esegue.
 */
export const DIZIONARIO = {
  cancello: "il controllo che blocca",
  gate: "il controllo che blocca",
  freno: "il blocco automatico",
  guardiano: "il controllo automatico",
  sentinella: "l'allarme",
  sonda: "il controllo veloce",
  potatore: "la pulizia automatica",
  spazzata: "il controllo su tutti i casi uguali",
  tetto: "il limite massimo",
  pavimento: "il limite minimo",
  lotto: "il gruppo di riparazioni",
  mutante: "la prova che il test funziona davvero",
  mutazione: "la prova che il test funziona davvero",
  "non-vacuità": "test che non provano niente",
  vacuità: "test che non provano niente",
  cantiere: "l'elenco dei difetti da riparare",
  radiografia: "l'analisi completa",
  quaderno: "il diario del reparto",
  cabina: "il Pannello",
  perimetro: "dove vale la regola",
  baseline: "il punto di partenza",
  regressione: "un difetto che torna",
  "fail-closed": "nel dubbio blocca",
  hook: "il comando che parte da solo",
  deferral: "a chi passa il lavoro",
  churn: "i negozi che se ne vanno",
  "health score": "il voto di salute del negozio",
  pipeline: "la catena di lavoro",
  runtime: "mentre gira davvero",
  "exit 0": "passato",
  "exit 1": "bocciato",
  "exit 2": "non ho potuto vedere",
  typecheck: "il controllo del codice",
  fixture: "un caso finto di prova",
  pathspec: "il filtro sui file",
  denominatore: "su quanti casi ho misurato",
  cricchetto: "il limite che scende e non risale",
  "verdetto muto": "lavoro consegnato senza dire com'è andato",
};

/** I codici che non devono comparire dove legge Nicola: non aggiungono senso, tolgono tempo. */
const CODICI = [
  { re: /\bAR-\d+/g, che: "un codice difetto (AR-…)" },
  { re: /\bL-\d{4}-\d+/g, che: "un codice lezione (L-…)" },
  { re: /(?<![\w#])#\d{2,}/g, che: "un numero di PR o di riga (#…)" },
  { re: /\b[\w./-]+\.(mjs|json|sh|ts|tsx|js)\b/g, che: "un percorso di file" },
  { re: /\bexit\s+\d\b/gi, che: "un codice di uscita (exit …)" },
  { re: /\bgit\s+[a-z-]+/gi, che: "un comando git" },
  { re: /\b(sk_live|phc_|github_pat)_?\w*/g, che: "una chiave o un ID" },
];

/** Le tre domande a cui un testo lungo deve rispondere, nell'ordine, prima dei dettagli. */
export const BLOCCHI = ["In parole semplici", "Cosa cambia per te", "Cosa devi fare"];

/** Sotto questa lunghezza è un messaggio breve: bastano le parole giuste, non serve la struttura. */
export const RIGHE_TESTO_LUNGO = 15;

/** Dove finisce la parte per Nicola e cominciano i dettagli per chi esegue. */
const MARCATORE_TECNICO = /^#{1,4}\s.*dettagl\w*\s+tecnic/i;

/**
 * Taglia il testo nel punto in cui smette di essere per Nicola.
 * Senza marcatore il testo è tutto "per Nicola": è il caso della chat, ed è il default severo.
 */
export function parteDiNicola(testo) {
  const righe = String(testo).split("\n");
  const taglio = righe.findIndex((r) => MARCATORE_TECNICO.test(r));
  return taglio === -1 ? righe : righe.slice(0, taglio);
}

/**
 * Le varianti italiane di una parola, scritte a mano e non indovinate con un suffisso libero.
 * Un suffisso libero su «gate» pescherebbe «gatto»: un misuratore che accusa a torto viene spento
 * entro il giorno, quindi qui si preferisce perdere un plurale strano che inventarne uno.
 */
export function regolaParola(parola) {
  const varianti = new Set([parola]);
  if (/o$/.test(parola)) varianti.add(parola.replace(/o$/, "i"));
  if (/e$/.test(parola)) varianti.add(parola.replace(/e$/, "i"));
  if (/a$/.test(parola)) varianti.add(parola.replace(/a$/, "e"));
  if (/à$/.test(parola)) varianti.add(parola); // le parole tronche non cambiano al plurale
  const alternative = [...varianti]
    .sort((a, b) => b.length - a.length)
    .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[-\s]/g, "[-\\s]"));
  // L'apostrofo NON esclude: in italiano «dall'hook» e «l'esito» sono l'inizio della parola, ed è
  // la forma in cui il gergo compare più spesso. Escluderlo lasciava passare il caso più frequente.
  return new RegExp(`(?<![\\w-])(?:${alternative.join("|")})(?![\\w-])`, "gi");
}

/** Le righe di codice non si traducono: dentro un blocco ``` il gergo è al suo posto. */
function senzaCodice(righe) {
  const fuori = [];
  let dentro = false;
  for (const r of righe) {
    if (/^\s*```/.test(r)) {
      dentro = !dentro;
      continue;
    }
    fuori.push(dentro ? "" : r.replace(/`[^`]*`/g, " "));
  }
  return fuori;
}

/**
 * Misura un testo. Torna i problemi trovati, ognuno con la riga e come si dice invece.
 * Non tocca disco né rete: si esegue in un test su una stringa.
 */
export function misura(testo) {
  const righeNicola = parteDiNicola(testo);
  const righe = senzaCodice(righeNicola);
  const problemi = [];

  righe.forEach((riga, i) => {
    const n = i + 1;

    for (const { re, che } of CODICI) {
      for (const m of riga.matchAll(re)) {
        problemi.push({
          riga: n,
          tipo: "codice",
          trovato: m[0],
          dico: `${che} — toglilo da qui, mettilo sotto «Dettagli tecnici»`,
        });
      }
    }

    for (const [parola, traduzione] of Object.entries(DIZIONARIO)) {
      for (const m of riga.matchAll(regolaParola(parola))) {
        problemi.push({ riga: n, tipo: "gergo", trovato: m[0], dico: `di' invece: «${traduzione}»` });
      }
    }
  });

  // Le tre domande valgono solo per un testo lungo: su due righe di chat sarebbero burocrazia.
  const testoLungo = righe.filter((r) => r.trim()).length >= RIGHE_TESTO_LUNGO;
  if (testoLungo) {
    const corpo = righe.join("\n");
    for (const blocco of BLOCCHI) {
      if (!new RegExp(blocco.replace(/\s+/g, "\\s+"), "i").test(corpo)) {
        problemi.push({
          riga: 1,
          tipo: "struttura",
          trovato: blocco,
          dico: `manca il blocco «${blocco}»: senza, Nicola deve cercarsi la risposta da solo`,
        });
      }
    }
  }

  // Avvisi, non bocciature: una frase lunga si legge, un codice no.
  const avvisi = [];
  righe.forEach((riga, i) => {
    for (const frase of riga.split(/(?<=[.!?])\s+/)) {
      const parole = frase.trim().split(/\s+/).filter(Boolean).length;
      if (parole > 30) avvisi.push({ riga: i + 1, dico: `frase da ${parole} parole: spezzala in due` });
    }
  });

  return { problemi, avvisi, testoLungo, righeMisurate: righe.length };
}

function leggiIngresso(argv) {
  const file = argv.find((a) => !a.startsWith("--"));
  if (file) return readFileSync(file, "utf8");
  if (process.stdin.isTTY) return null; // niente file e niente stdin: non ho nulla da misurare
  return readFileSync(0, "utf8");
}

function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--dizionario")) {
    console.log("📖 Come si dice, dove legge Nicola\n");
    for (const [k, v] of Object.entries(DIZIONARIO)) console.log(`   ${k.padEnd(18)} → ${v}`);
    return 0;
  }

  let testo;
  try {
    testo = leggiIngresso(argv);
  } catch (e) {
    console.log(`⚪ non ho potuto leggere il testo: ${e.message}`);
    return 2;
  }
  if (testo == null || !testo.trim()) {
    console.log("⚪ nessun testo da misurare (passa un file o mandalo da stdin)");
    return 2;
  }

  const { problemi, avvisi, testoLungo } = misura(testo);

  if (!problemi.length) {
    console.log(`✅ si legge senza glossario${testoLungo ? " (e risponde alle tre domande)" : ""}`);
    for (const a of avvisi) console.log(`   ⚠️  riga ${a.riga}: ${a.dico}`);
    return 0;
  }

  console.log(`❌ ${problemi.length} punti dove Nicola deve tradurre invece di capire\n`);
  const per = { struttura: "🧱 manca una risposta", codice: "🔢 codici", gergo: "🗣️  parole mie" };
  for (const tipo of ["struttura", "codice", "gergo"]) {
    const gruppo = problemi.filter((p) => p.tipo === tipo);
    if (!gruppo.length) continue;
    console.log(`${per[tipo]}`);
    for (const p of gruppo) console.log(`   riga ${String(p.riga).padStart(3)}  «${p.trovato}» → ${p.dico}`);
    console.log("");
  }
  for (const a of avvisi) console.log(`⚠️  riga ${a.riga}: ${a.dico}`);
  console.log("\n→ regola completa: cervello/scrittura-umana.md");
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(main());
