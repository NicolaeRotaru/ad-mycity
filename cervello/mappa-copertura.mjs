#!/usr/bin/env node
// 🗺️ LA MAPPA STRUMENTO → GUARDIA — chi sorveglia ogni tipo di azione, e chi non lo sorveglia nessuno.
//
// PERCHÉ ESISTE (mossa 2 concordata con Nicola il 16/8). La copertura delle guardie oggi non vive in
// nessun elenco: vive dentro due righe di filtro in `.claude/settings.json`. Per sapere se un tipo di
// azione è sorvegliato bisogna leggere quelle righe e tenerle a mente — e una cosa che si tiene a
// mente si stacca dalla realtà al primo lotto. È la stessa malattia che ha reso necessario
// `censimento-guardiani.mjs`: l'elenco dei guardiani viveva nella testa di chi aveva letto `giro.sh`
// di recente, e nello stesso repo c'erano tre numeri diversi per la stessa cosa.
//
// LA SCELTA CHE RENDE QUESTA MAPPA DIVERSA DA UN ELENCO: non è scritta a mano. Gli strumenti da
// coprire arrivano dal LIBRO MASTRO, cioè da quello che ho fatto davvero. Uno strumento nuovo entra
// nella mappa il giorno in cui lo uso per la prima volta, non il giorno in cui qualcuno si ricorda di
// aggiungerlo. Un elenco dichiarato mente appena la realtà cambia; uno derivato no.
//
// TRE STATI, e la differenza fra i primi due è tutto:
//   · sorvegliato  — una guardia lo guarda E può dire di no.
//   · solo-avviso  — una guardia lo guarda ma non può fermarmi. È il caso delle modifiche fatte da un
//                    comando di shell: la guardia parla, esce comunque 0, e la strada più comoda per
//                    cambiare il repo resta la meno difesa.
//   · scoperto     — nessuno lo guarda. Rosso, a meno che non sia dichiarato in `esenzioni` col perché.
//
// PERCHÉ L'ESENZIONE VUOLE UN PERCHÉ SCRITTO. Leggere un file non cambia niente e non ha bisogno di
// una guardia: è vero, ed è per questo che l'esenzione esiste. Ma un'esenzione senza motivo è il modo
// in cui un buco si traveste da scelta — la stessa regola che `guardiano-mai-messo-di-guardia.mjs`
// applica agli hook in attesa di aggancio. Qui il motivo è obbligatorio e finisce a schermo.
//
// IL PUNTO CIECO DICHIARATO. Il potere di ogni guardia (può bloccare? avvisa e basta?) non si ricava
// dal file dei freni: sta nel codice della guardia. Quindi vive nella tabella `POTERI` qui sotto — ed
// è l'unico pezzo scritto a mano di tutto il file. Per non lasciarlo marcire c'è la regola ①: una
// guardia agganciata e NON censita in `POTERI` fa uscire rosso. Così la tabella non può restare
// indietro in silenzio: il prossimo che aggancia un freno è costretto a dire cosa sa fare.
//
// USO:
//   node cervello/mappa-copertura.mjs           → la mappa a schermo (esce 1 se c'è uno scoperto)
//   node cervello/mappa-copertura.mjs --json     → in forma di dati
//   node cervello/mappa-copertura.mjs --tutti    → sugli strumenti di sempre, non solo di questo turno

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { abbina, delTurno, leggiRegistro, strumentiVisti, turnoCorrente } from "./libro-mastro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
export const REPO = join(QUI, "..");
const FRENI = ".claude/settings.json";

/**
 * Cosa sa fare ogni guardia agganciata. `blocca: true` = può dire di no e la mossa non parte (o il
 * turno non si chiude). `blocca: false` = parla e basta.
 *
 * Chiave = il pezzo di comando che identifica la guardia. Si confronta per inclusione perché nel file
 * dei freni il comando porta anche il percorso e le opzioni.
 */
export const POTERI = {
  "mano-fermata.mjs": { blocca: true, come: "rifiuta la scrittura (deny)" },
  "pre-scrittura.mjs": { blocca: false, come: "gira la decisione a Nicola (ask)" },
  "sorvegliante.mjs": { blocca: true, come: "rimanda indietro la modifica" },
  "misura-cieca.mjs": { blocca: false, come: "avvisa sul comando" },
  "cancello-senior.mjs": { blocca: true, come: "ferma la consegna del senior" },
  "cancello-stop.mjs": { blocca: true, come: "non fa chiudere il turno" },
  "intento-turno.mjs": { blocca: false, come: "pianta l'ancora e salva l'intento" },
  "contesto-lezioni.mjs": { blocca: false, come: "inietta le lezioni sul tema" },
  "memoria-guardia.mjs": { blocca: false, come: "porta la memoria oltre la sessione" },
  "installa-hooks.sh": { blocca: false, come: "attacca i cancelli del commit" },
  "libro-mastro.mjs": { blocca: false, come: "registra la mossa" },
  "mappa-copertura.mjs": { blocca: false, come: "misura la copertura" },
};

/**
 * Gli strumenti che non hanno bisogno di una guardia, col motivo. Un'esenzione senza motivo non è
 * un'esenzione: è un buco con una bella etichetta, e vale come se non ci fosse.
 */
export const ESENZIONI = {
  Read: "legge e basta: non cambia niente nel mondo né nel repo",
  Grep: "cerca dentro i file: sola lettura",
  Glob: "elenca percorsi: sola lettura",
  ToolSearch: "carica la definizione di uno strumento: non tocca niente",
  TodoWrite: "lista di lavoro della sessione, muore con la sessione",
  ListMcpResourcesTool: "elenca risorse esterne: sola lettura",
  // Trovato dal cancello dello Stop il 16/8, ed è la prima cosa che questa mappa ha scoperto da sola.
  // Aprire una skill non tocca niente: carica un mansionario nel turno. Quello che poi FACCIO
  // leggendolo passa dalle guardie come qualsiasi altra mossa — è lì che va guardato, non qui.
  // L'esenzione vale per il caricamento, non per le conseguenze.
  Skill: "carica un mansionario nel turno: non scrive e non tocca il mondo. Le mosse che ne seguono le guardano le guardie di sempre",
};

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — puro: niente disco, così le prove possono girare ogni caso.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le guardie agganciate a un evento, dal file dei freni già letto.
 * Torna [{matcher, comandi:[...]}].
 */
export function agganci(hooks, evento) {
  const gruppi = Array.isArray(hooks?.[evento]) ? hooks[evento] : [];
  return gruppi.map((g) => ({
    matcher: typeof g?.matcher === "string" ? g.matcher : "",
    comandi: (Array.isArray(g?.hooks) ? g.hooks : []).map((h) => String(h?.command || "")),
  }));
}

/**
 * Un matcher copre uno strumento?
 *
 * LA TARATURA, ed è una scelta: ancoro il confronto (`^…$`). Senza ancora `Edit|Write|MultiEdit`
 * risulterebbe coprire anche `NotebookEdit`, perché «Edit» ci sta dentro come pezzo di parola. Fra
 * dichiarare una copertura che forse non c'è e dichiararne una in meno di quelle vere, una mappa
 * della sorveglianza deve sbagliare dalla seconda parte: un falso ✅ qui è esattamente il danno che
 * questo file esiste per impedire.
 */
export function copre(matcher, strumento) {
  if (!matcher) return true; // matcher assente = tutti gli strumenti
  try {
    return new RegExp(`^(?:${matcher})$`).test(strumento);
  } catch {
    return false; // matcher che non compila: non copre niente, e la mappa lo mostra come scoperto
  }
}

/** Il nome della guardia dentro un comando del file dei freni. */
export function guardiaDelComando(comando, poteri = POTERI) {
  return Object.keys(poteri).find((nome) => comando.includes(nome)) || "";
}

/**
 * REGOLA ① — le guardie agganciate e mai censite in POTERI.
 * Sono il modo in cui la tabella scritta a mano resterebbe indietro senza che nessuno se ne accorga.
 */
export function guardieIgnote(hooks, poteri = POTERI) {
  const fuori = new Set();
  for (const evento of Object.keys(hooks || {})) {
    for (const a of agganci(hooks, evento)) {
      for (const c of a.comandi) {
        if (!guardiaDelComando(c, poteri)) fuori.add(c.split(/\s+/).slice(0, 2).join(" "));
      }
    }
  }
  return [...fuori].sort();
}

/** La riga di mappa per UNO strumento: chi lo guarda prima, chi dopo, e se qualcuno può fermarlo. */
export function coperturaDi(strumento, hooks, { poteri = POTERI, esenzioni = ESENZIONI } = {}) {
  const guardieSu = (evento) =>
    agganci(hooks, evento)
      .filter((a) => copre(a.matcher, strumento))
      .flatMap((a) => a.comandi.map((c) => guardiaDelComando(c, poteri)).filter(Boolean));

  const prima = [...new Set(guardieSu("PreToolUse"))];
  const dopo = [...new Set(guardieSu("PostToolUse"))];
  const tutte = [...new Set([...prima, ...dopo])];
  const puoFermare = tutte.some((g) => poteri[g]?.blocca);
  const esente = Object.prototype.hasOwnProperty.call(esenzioni, strumento) && String(esenzioni[strumento] || "").trim().length > 0;

  let stato = "scoperto";
  if (tutte.length && puoFermare) stato = "sorvegliato";
  else if (tutte.length) stato = "solo-avviso";

  return {
    strumento,
    prima,
    dopo,
    stato,
    esente,
    perche_esente: esente ? esenzioni[strumento] : "",
    // Un esente resta scoperto nei fatti: l'esenzione dice che va bene così, non che qualcuno guarda.
    problema: stato === "scoperto" && !esente,
  };
}

/**
 * Gli strumenti usati davvero, letti dalla TRASCRIZIONE della sessione.
 *
 * PERCHÉ SERVE, ed è il difetto che questa funzione ripara nella mappa stessa. Il libro mastro sa
 * solo di ciò che una guardia ha annotato. Uno strumento che NESSUNO guarda non lascia nessuna riga —
 * quindi la mappa costruita sul solo registro non potrebbe mai vederlo, ed è cieca esattamente sul
 * caso per cui esiste. È un cane che si morde la coda: «trovo gli scoperti guardando le cose che
 * qualcuno ha guardato».
 *
 * La trascrizione no: lì c'è ogni strumento chiamato, guardato o meno. Confrontare le due liste è
 * ciò che rende «scoperto» una cosa misurabile invece che immaginabile.
 */
export function strumentiDaTrascrizione(righe) {
  const visti = new Set();
  for (const riga of righe || []) {
    let j = null;
    try {
      j = typeof riga === "string" ? JSON.parse(riga) : riga;
    } catch {
      continue; // riga tagliata a metà dalla coda del file: si salta, le altre valgono lo stesso
    }
    const contenuto = j?.message?.content;
    for (const p of Array.isArray(contenuto) ? contenuto : []) {
      if (p?.type === "tool_use" && p?.name) visti.add(String(p.name));
    }
  }
  return [...visti].sort();
}

/** La mappa intera, più le due regole che la tengono onesta. */
export function mappa(strumenti, hooks, opzioni = {}) {
  const righe = strumenti.map((s) => coperturaDi(s, hooks, opzioni));
  const ignote = guardieIgnote(hooks, opzioni.poteri || POTERI);
  return {
    righe,
    guardie_ignote: ignote,
    scoperti: righe.filter((r) => r.problema).map((r) => r.strumento),
    solo_avviso: righe.filter((r) => r.stato === "solo-avviso").map((r) => r.strumento),
    ok: righe.every((r) => !r.problema) && ignote.length === 0,
  };
}

/**
 * Le righe che il cancello dello Stop mette davanti a Nicola. Pura: il testo di un'accusa è una
 * decisione, e una decisione dentro `main()` non la può eseguire nessuna prova.
 *
 * Sono due accuse diverse e non vanno confuse:
 *   · i BUCHI — una guardia si è svegliata e non ha mai risposto. Non è un ok: è una mossa passata
 *     senza giudizio, e finché non lo si scrive somiglia in tutto a un ✅.
 *   · gli SCOPERTI — uno strumento che ho usato e che nessuno sorveglia. Qui il silenzio è onesto:
 *     nessuno ha promesso niente. Il difetto è che finora non lo sapeva nemmeno chi decide.
 */
export function righeSorveglianza({ buchi = [], scoperti = [], mosse = 0 } = {}) {
  const righe = [];
  if (buchi.length) {
    righe.push(
      `❌ ${buchi.length} mosse su ${mosse} sono passate senza che la guardia rispondesse` +
        buchi.slice(0, 5).map((b) => `\n   → ${b.guardia} non ha chiuso su ${b.strumento || "(strumento ignoto)"}: ${String(b.bersaglio || "").slice(0, 60)}`).join("") +
        `\n   → una guardia che tace per un guasto NON sta dicendo ok: qui non ha guardato nessuno.` +
        `\n   → guardale con \`node cervello/libro-mastro.mjs --buchi\`.`,
    );
  }
  if (scoperti.length) {
    righe.push(
      `❌ ho usato ${scoperti.length} strumenti che nessuna guardia sorveglia: ${scoperti.join(", ")}` +
        `\n   → o li aggancia un freno in .claude/settings.json (lo incolla Nicola), o vanno dichiarati` +
        ` in ESENZIONI col motivo scritto.` +
        `\n   → la mappa intera: \`node cervello/mappa-copertura.mjs\`.`,
    );
  }
  return righe;
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O
// ─────────────────────────────────────────────────────────────────────────────

export function leggiFreni() {
  const p = join(REPO, FRENI);
  if (!existsSync(p)) return { errore: `manca ${FRENI}` };
  try {
    return { hooks: JSON.parse(readFileSync(p, "utf8"))?.hooks || {} };
  } catch (e) {
    return { errore: `${FRENI} illeggibile: ${e?.message || e}` };
  }
}

function main() {
  const argv = process.argv.slice(2);
  const { hooks, errore } = leggiFreni();

  if (errore) {
    // ⚪ non è un verde: se non riesco a leggere i freni non so cosa sia sorvegliato, e lo dico.
    console.error(`⚪ non posso misurare la copertura — ${errore}`);
    process.exit(2);
  }

  const turno = argv.includes("--tutti") ? "" : turnoCorrente();
  const azioni = delTurno(abbina(leggiRegistro()), turno);

  // Le due liste: quello che una guardia ha annotato, e quello che ho DAVVERO chiamato. La seconda
  // arriva dalla trascrizione ed è l'unica che può contenere uno strumento senza nessuna guardia.
  const iT = argv.indexOf("--trascrizione");
  const percorso = iT >= 0 ? argv[iT + 1] : "";
  let dallaTrascrizione = [];
  if (percorso) {
    try {
      dallaTrascrizione = strumentiDaTrascrizione(readFileSync(percorso, "utf8").split("\n").filter(Boolean));
    } catch (e) {
      console.error(`⚪ trascrizione non leggibile (${e?.message || e}): la mappa vede solo ciò che le guardie hanno annotato.`);
    }
  }
  const strumenti = [...new Set([...strumentiVisti(azioni), ...dallaTrascrizione])].sort();

  if (!strumenti.length) {
    console.log("📭 il libro mastro non ha ancora visto nessuno strumento: la mappa si riempie usando la macchina.");
    console.log("   (prova con --tutti, oppure lascia che il turno finisca)");
    process.exit(0);
  }

  const m = mappa(strumenti, hooks);

  if (argv.includes("--json")) {
    console.log(JSON.stringify(m, null, 2));
    process.exit(m.ok ? 0 : 1);
  }

  const segno = { sorvegliato: "✅", "solo-avviso": "🟡", scoperto: "❌" };
  console.log(`🗺️  COPERTURA — ${strumenti.length} strumenti visti${turno ? " in questo turno" : ""}\n`);
  for (const r of m.righe) {
    const chi = [...new Set([...r.prima, ...r.dopo])].join(" + ") || "nessuno";
    const nota = r.esente ? `  (esente: ${r.perche_esente})` : "";
    console.log(`${r.esente && r.stato === "scoperto" ? "⚪" : segno[r.stato]} ${r.strumento.padEnd(26)} ${chi}${nota}`);
  }

  if (m.solo_avviso.length) {
    console.log(`\n🟡 guardati ma non fermabili: ${m.solo_avviso.join(", ")}`);
    console.log("   qui la guardia parla e la mossa passa comunque.");
  }
  if (m.guardie_ignote.length) {
    console.log(`\n❌ guardie agganciate e mai censite: ${m.guardie_ignote.join(", ")}`);
    console.log("   → aggiungile a POTERI dicendo se possono bloccare: finché non lo dicono, la mappa non sa cosa promettono.");
  }
  if (m.scoperti.length) {
    console.log(`\n❌ scoperti: ${m.scoperti.join(", ")}`);
    console.log("   → o li aggancia una guardia, o vanno dichiarati in ESENZIONI col motivo scritto.");
  }
  if (m.ok) console.log("\n✅ ogni strumento usato ha una guardia, o un'esenzione con il perché.");

  process.exit(m.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
