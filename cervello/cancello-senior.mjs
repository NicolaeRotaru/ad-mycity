#!/usr/bin/env node
// 👔 IL CANCELLO DEI SENIOR (AR-527) — i 120 consegnano, e finora non li controllava nessuno.
//
// PERCHÉ ESISTE. Questa macchina ha tre freni sul lavoro, e tutti e tre guardano ME: il sorvegliante
// mentre modifico, il cancello del lotto quando consegno, quello dello Stop quando dico «ho finito».
// Nessuno dei tre guarda il canale che produce più lavoro di tutti: i senior.
//
// Quando delego a un senior, quello scrive file, tocca registri, prepara consegne — e poi finisce.
// Il momento in cui finisce è un evento vero (`SubagentStop`) e fino a oggi non c'era attaccato
// niente. Il freno dello Stop scatta solo alla fine del turno INTERO: se in un turno mando tre
// senior, i primi due consegnano senza che nessuno guardi, e quando finalmente il freno parla il
// lavoro dei tre è già impastato in un delta solo, dove non si distingue più chi ha lasciato cosa.
//
// E c'è la parte peggiore: se il sorvegliante parla mentre un senior lavora, il suo verdetto arriva
// nel contesto del SENIOR — che chiude e sparisce. Io leggo la sintesi finale, non i suoi ❌. Cioè la
// guardia parlava, ma a qualcuno che di lì a poco non sarebbe più esistito: è AR-465 («il verdetto
// finiva in un log che non leggo») nella sua forma più difficile da vedere, perché stavolta un
// lettore c'era davvero — solo, era di passaggio.
//
// COSA CONTROLLA — tre cose, sul perimetro del senior e non su tutto il turno:
//   ① le voci GRAVI che il sorvegliante ha alzato MENTRE il senior lavorava (dallo scatto in cui è
//      partito a quello di adesso). Queste bloccano: il senior torna e le sistema.
//   ② gli allarmi scritti e non accodati — 🔴/CRITICO/bloccante finiti in una consegna mentre la coda
//      che Nicola legge non è stata toccata. Stessi marcatori del cancello dello Stop, importati da
//      lì: due elenchi della stessa cosa divergono sempre.
//   ③ il quadro: quali file il senior ha toccato. Informativo, ma è l'unica riga che mi dice cosa ha
//      fatto davvero invece di cosa dice di aver fatto.
//
// IL PERIMETRO, e qui c'è un limite che dichiaro invece di nasconderlo. L'ancora la pianta
// `pre-scrittura.mjs` quando parte un senior, e conta QUANTI sono in volo, non QUALI. L'evento di fine
// porta `agent_id` e `agent_type` (lo dice la documentazione degli hook), ma l'ancora non li registra:
// qui non so abbinare chi finisce a chi è partito. Con un senior solo in volo il perimetro è esatto.
// Con più senior in parallelo — cosa che faccio spesso, ed è giusto farla — il perimetro è CONDIVISO:
// so cosa è successo, non da quale mano. In quel caso il cancello NON blocca: racconta e basta.
// Punire il senior sbagliato è peggio che non punire nessuno, perché insegna che il verdetto non
// c'entra con quello che hai fatto. Limite aperto, dedotto e non osservato: il contatore scende a OGNI
// fine di agente, anche di chi non l'ha alzato (un agente di workflow, un agente interno della
// piattaforma), e quello si prende il perimetro del senior vero.
// Lo stesso «racconto e non blocco» vale, più forte, quando l'ancora non c'è affatto: il perimetro
// diventa tutto il lavoro non committato (`perimetroSenior`, dove sta anche il perché manca).
//
// COSA NON FA. Non giudica la qualità del lavoro del senior, non legge la sua risposta, non sa se ha
// consegnato ciò che gli avevo chiesto. Tre misure meccaniche su ciò che ha lasciato per terra.
//
// Uso:
//   node cervello/cancello-senior.mjs --hook   # per l'hook SubagentStop: exit 2 = il senior non chiude
//   node cervello/cancello-senior.mjs          # cosa direbbe adesso
//
// Uscita: 0 = niente da dire · 2 (in hook) = il senior torna e sistema · 1 (fuori) = ho trovato roba
//
// 🟢 Sola lettura sul repo. L'unica scrittura è la chiusura dell'ancora del senior, fuori da git.

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BATTITO, vociDaScatto } from "./sorvegliante.mjs";
import { ALLARMI } from "./cancello-stop.mjs";
import { ANCORA_SENIOR } from "./pre-scrittura.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
// L'override serve alle prove: fanno girare il cancello vero, col suo exit, su un repo finto in /tmp
// invece che su questo, dove l'ancora e il battito sono quelli del lavoro in corso.
const REPO = process.env.CANCELLO_SENIOR_REPO || dirname(QUI);
const CODA = "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md";

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — puro.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chiude un senior: torna l'ancora aggiornata e se il perimetro è finito.
 *
 * Quando l'ultimo senior in volo chiude, l'ancora va tolta: lasciarla vorrebbe dire che il prossimo
 * senior eredita il perimetro del precedente e si prende in faccia le sue voci. È lo stesso errore
 * del perimetro largo, un piano più sotto.
 */
export function chiudiSenior(precedente = null) {
  const aperti = Number(precedente?.aperti) || 0;
  if (aperti <= 1) return { ancora: null, ultimo: true, condiviso: aperti > 1 };
  return { ancora: { ...precedente, aperti: aperti - 1 }, ultimo: false, condiviso: true };
}

/**
 * Di chi è il perimetro che sto per giudicare: l'ancora decide se posso attribuire, e quindi bloccare.
 *
 * Tre casi, e solo il primo è di un senior solo:
 *   - ancora con un senior in volo → perimetro esatto, il blocco è giusto;
 *   - ancora con più senior in volo → perimetro condiviso, racconto senza bloccare;
 *   - NESSUNA ancora → il perimetro è tutto il lavoro non committato e tutte le voci vive del
 *     sorvegliante, cioè anche quelle lasciate da me o da chi è passato prima. Bloccare qui è la
 *     stessa ingiustizia del perimetro condiviso, solo più larga — e costa cara: un turno in più di
 *     un agente rilegge da capo tutto il suo contesto, 50-150 mila token, per una voce che magari
 *     non è sua.
 *
 * PERCHÉ L'ANCORA MANCAVA — cosa è verificato e cosa no (AR-1009, 25/10):
 *   verificato · la delega arriva all'hook col nome «Agent». Il libro mastro lo registra: il 25/10
 *     alle 12:01:20 pre-scrittura ha visto «Agent», sulla delega a security.
 *   verificato · la causa era UNA: `pre-scrittura.mjs` piantava l'ancora solo su «Task». Su quella
 *     delega la riga del libro mastro chiude «ok» con motivo vuoto, cioè il ramo dei comandi e non
 *     quello dell'ancora. Adesso il codice riconosce i due nomi (`STRUMENTI_DI_DELEGA`).
 *   verificato · il filtro dell'hook NON c'entra. In `.claude/settings.json` è «Bash|Monitor|Task|mcp__.*»,
 *     fermo dal 26/08, ed è lui che alle 12:01:20 ha fatto partire pre-scrittura su «Agent». Claude
 *     Code 2.1.310 tratta «Task» come altro nome di Agent, come diceva anthropics/claude-code#29677.
 *     Controprova che il filtro filtra davvero: alle 11:56 è passato lo strumento Skill, e pre-scrittura
 *     non l'ha visto. La prova che il filtro di oggi porta la delega sta in `test/pre-scrittura.test.mjs`.
 *   ne segue, dedotto dalla catena · il freno blocca già adesso, perché l'hook esegue il file della
 *     copia di lavoro; su main bloccherà dall'unione. Da lì è vivo anche il limite del contatore scritto
 *     in testa al file: dipende dall'unione, non dal filtro. Aggiungere «Agent» al filtro non accende
 *     niente: è una cintura per il giorno in cui una versione nuova togliesse l'alias.
 *   non osservato · la catena intera dal vivo (delega → ancora sul disco → blocco). Si vede alla
 *     prossima delega: la riga di pre-scrittura nel libro mastro deve dire «ancora piantata».
 *   dedotto · l'alias l'ho visto su un evento solo e su questa versione: non è un contratto scritto.
 *     Se sparisse, nessuna prova offline se ne accorge; lo dice solo il libro mastro.
 *   dedotto · gli agenti dei workflow partono dallo strumento `Workflow`, non da `Agent`: non piantano
 *     l'ancora, filtro o no. Torna col codice e con la documentazione, non l'ho osservato su un
 *     evento vero.
 *
 * `attribuibile: false` non vuol dire tacere: le righe si dicono lo stesso, cambia solo l'exit.
 */
export function perimetroSenior(ancora = null) {
  const { ancora: rimasta, condiviso } = chiudiSenior(ancora);
  if (!ancora) {
    return {
      rimasta,
      attribuibile: false,
      nota: "nessuna ancora del senior in questa copia: guardo tutto il lavoro non committato, quindi qui sotto può comparire roba di prima. Non so di chi è, quindi non blocco.",
    };
  }
  if (condiviso) {
    return {
      rimasta,
      attribuibile: false,
      nota: "più senior in volo insieme: il perimetro qui sotto è condiviso, quindi dico cosa è successo ma non a chi. Non blocco nessuno.",
    };
  }
  return { rimasta, attribuibile: true, nota: null };
}

/**
 * Gli allarmi scritti in una consegna senza che la coda di Nicola sia stata toccata.
 *
 * @param {Array<{file:string, testo:string}>} consegne  i file di consegna toccati dal senior
 * @param {boolean} codaToccata  la coda che Nicola legge è cambiata in questo perimetro?
 */
export function allarmiDelSenior(consegne = [], codaToccata = false) {
  if (codaToccata) return [];
  return consegne.filter((c) => ALLARMI.some((re) => re.test(c.testo || ""))).map((c) => c.file);
}

/**
 * Il verdetto. Righe da dire + se il senior deve tornare indietro.
 *
 * `condiviso` è la valvola dell'onestà: quando il perimetro non è di un senior solo (più senior in
 * volo, oppure nessuna ancora: vedi `perimetroSenior`) non attribuisco, quindi non blocco.
 * `giaBloccato` è la valvola anti-cappio, la stessa del cancello dello Stop: se il senior sta già
 * ripartendo per colpa mia, bloccarlo di nuovo è un senior che non finisce mai.
 */
export function verdettoSenior({
  voci = [],
  allarmi = [],
  fileToccati = [],
  condiviso = false,
  giaBloccato = false,
  nota = null,
} = {}) {
  const righe = [];
  const gravi = voci.filter((v) => v.gravita === "grave");

  for (const v of gravi.slice(0, 4)) {
    righe.push(`❌ il senior ha lasciato una voce grave: ${v.file}\n   → ${v.cosa}\n   → sistemala prima di consegnare: dopo finisce impastata col lavoro di tutti gli altri.`);
  }
  if (gravi.length > 4) righe.push(`   …e altre ${gravi.length - 4}: node cervello/sorvegliante.mjs`);

  for (const v of voci.filter((v) => v.gravita === "media").slice(0, 2)) {
    righe.push(`⚠️  ${v.file} → ${v.cosa}`);
  }

  for (const f of allarmi) {
    righe.push(
      `❌ il senior ha scritto un allarme in ${f} e non ha messo niente in ${CODA}` +
        `\n   → chi lo legge, e quando? Un 🔴 che resta dentro una consegna è un verdetto senza lettore.`,
    );
  }

  if (fileToccati.length) {
    righe.push(`🔭 file toccati mentre il senior lavorava: ${fileToccati.slice(0, 8).join(", ")}${fileToccati.length > 8 ? ` (+${fileToccati.length - 8})` : ""}`);
  }
  if (nota) righe.push(`ℹ️  ${nota}`);

  const sostanza = righe.some((r) => r.startsWith("❌"));
  return { righe, blocca: sostanza && !condiviso && !giaBloccato };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O
// ─────────────────────────────────────────────────────────────────────────────

function git(args) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8" });
}

function leggiJson(percorso) {
  try {
    return JSON.parse(readFileSync(join(REPO, percorso), "utf8"));
  } catch {
    return null;
  }
}

/** I file cambiati da un commit in poi, più quelli mai visti da git. Dalla PORTA (AR-339): con un
 *  nome accentato git cita il percorso in ottali e il file sparirebbe dal conto in silenzio. */
function fileDa(commit) {
  const fuori = new Set();
  if (commit) {
    try {
      for (const f of percorsiDaGit(["diff", "--name-only", commit], { cwd: REPO })) fuori.add(f);
    } catch {
      return null;
    }
  } else {
    try {
      for (const f of percorsiDaGit(["diff", "--name-only", "HEAD"], { cwd: REPO })) fuori.add(f);
    } catch {
      return null;
    }
  }
  try {
    for (const f of percorsiDaGit(["ls-files", "--others", "--exclude-standard"], { cwd: REPO })) fuori.add(f);
  } catch {
    // I file mai visti da git sono un di più: senza, il quadro è più povero, non falso.
  }
  return [...fuori].sort();
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
  if (hook) {
    try {
      const ev = JSON.parse(await leggiStdin());
      giaBloccato = Boolean(ev?.stop_hook_active);
    } catch {
      // Nessun payload: proseguo come primo giro.
    }
  }

  const ancora = leggiJson(ANCORA_SENIOR);
  const { rimasta, attribuibile, nota } = perimetroSenior(ancora);

  const toccati = fileDa(ancora?.commit || null);

  let voci = [];
  const b = leggiJson(BATTITO);
  if (b) voci = vociDaScatto(b.viste || {}, Number(ancora?.scatto) || 0, Number(b.scatto) || 0);

  const consegne = (toccati || [])
    .filter((f) => f.startsWith("consegne/") && f.endsWith(".md"))
    .map((f) => {
      try {
        return { file: f, testo: readFileSync(join(REPO, f), "utf8") };
      } catch {
        return { file: f, testo: "" };
      }
    });
  const codaToccata = (toccati || []).includes(CODA);

  const v = verdettoSenior({
    voci,
    allarmi: allarmiDelSenior(consegne, codaToccata),
    fileToccati: toccati || [],
    condiviso: !attribuibile,
    giaBloccato,
    nota,
  });

  // L'ancora si aggiorna SEMPRE, anche quando blocco: il senior che torna indietro sta ancora
  // lavorando nello stesso perimetro, e riaprirlo da zero gli farebbe sparire di vista proprio ciò
  // per cui l'ho fermato.
  try {
    if (rimasta) writeFileSync(join(REPO, ANCORA_SENIOR), JSON.stringify(rimasta));
    else if (existsSync(join(REPO, ANCORA_SENIOR)) && !v.blocca) unlinkSync(join(REPO, ANCORA_SENIOR));
  } catch {
    // Un'ancora che non si chiude non deve fermare il senior: al giro dopo il perimetro sarà largo
    // e dichiarato.
  }

  if (!v.righe.length) {
    if (!hook) console.log("✅ il senior non ha lasciato niente per terra.");
    process.exit(0);
  }

  const testo = ["👔 CANCELLO DEI SENIOR", ...v.righe].join("\n");
  if (v.blocca) {
    console.error(testo);
    process.exit(hook ? 2 : 1);
  }
  console.log(testo);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
