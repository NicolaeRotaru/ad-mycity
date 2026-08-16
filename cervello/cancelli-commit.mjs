#!/usr/bin/env node
// I DUE FRENI DEL COMMIT CHE NON FRENAVANO — AR-345 e AR-645.
//
// Le decisioni stanno qui, pure, perché nel `pre-commit` (uno script di shell) una prova può solo
// rileggere il testo dell'hook e cercarci una parola. Una parola in un file non fallisce nel modo
// in cui fallisce la realtà: è per questo che questi due difetti sono sopravvissuti.
//
// ── AR-345 · LA SKILL CHE SEMBRA CANCELLATA ─────────────────────────────────
// Per misurare la porta d'ingresso della skill `cantiere`, `prova-trigger.mjs` la SPOSTA fuori
// dall'albero (se restasse lì il modello aprirebbe quella vera e ogni frase risulterebbe «non
// scattata»). Per ~35 minuti `git status` mostra `D .claude/skills/cantiere/SKILL.md`, e una
// cancellazione temporanea è indistinguibile da una voluta. L'hook di fine turno chiede di
// committare le modifiche pendenti a ogni giro: una sessione che obbedisce alla lettera con
// `git add -A` cancella la skill per davvero, e il commit riesce, perché nessun cancello guarda
// se un commit sta cancellando una skill.
// La difesa, il 29/7, è stata l'attenzione di chi lavorava. L'attenzione non si ripete.
//
// ── AR-645 · IL BLOCCO CHE INSEGNA LA SCAPPATOIA ────────────────────────────
// Tutti e sette i messaggi di blocco del `pre-commit` finivano regalando il comando per aggirarli
// — compreso quello sui segreti reali. E nessun sensore contava quante volte veniva usato: un
// commit passato saltando i cancelli era indistinguibile da uno controllato. Il bypass costava
// zero ed era invisibile; peggio, l'hook di piattaforma di fine turno pretende commit+push di
// ogni modifica, quindi su un blocco i due freni spingono in direzioni opposte e l'unica uscita
// scritta era proprio quella.
// Due cure insieme, perché una sola non basta: il messaggio non insegna più il comando, **e** il
// passaggio viene contato. Togliere l'istruzione senza contare sposterebbe solo il problema.

import { existsSync, appendFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Il marcatore che dice «sto misurando il trigger: la skill è spostata, non cancellata». */
export const NOME_MARCATORE_MISURA = "MISURA-TRIGGER-IN-CORSO";
/** Il marcatore che il pre-commit lascia per dire «i cancelli sono passati di qui». */
export const NOME_MARCATORE_CANCELLI = "CANCELLI-PASSATI";
/** Il registro dei passaggi: una riga per commit, controllato o forzato. */
export const NOME_REGISTRO = "registro-cancelli.log";

/** Un marcatore vecchio non è un marcatore: cinque minuti fra il pre-commit e il commit bastano. */
export const FRESCHEZZA_SEC = 300;

// ─────────────────────────────────────────────────────────────────────────────
// AR-345 — la decisione: questo commit sta cancellando una skill mentre una misura è in corso?

/**
 * @param {{misuraInCorso:boolean, percorsoCopia:string, cancellati:string[]}} x
 * @returns {{blocca:boolean, motivo:string, file:string[]}}
 */
export function bloccaSkillCancellata({ misuraInCorso = false, percorsoCopia = "", cancellati = [] } = {}) {
  const skill = (cancellati || []).map(String).filter((f) => f.replace(/^\.\//, "").startsWith(".claude/skills/"));
  if (!skill.length) return { blocca: false, motivo: "questo commit non cancella nessuna skill", file: [] };
  if (!misuraInCorso) {
    // Senza misura in corso una cancellazione è una scelta: non è compito di questo cancello.
    return { blocca: false, motivo: "nessuna misura del trigger in corso: la cancellazione è voluta", file: skill };
  }
  return {
    blocca: true,
    motivo:
      `una misura della porta d'ingresso è IN CORSO: la skill non è cancellata, è spostata` +
      (percorsoCopia ? ` in ${percorsoCopia}` : "") +
      `. Aspetta che la misura finisca — rimette tutto da sola — oppure riportala a posto a mano da lì. ` +
      `Committare adesso la cancellerebbe davvero.`,
    file: skill,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-645 — la decisione: questo commit è passato dai cancelli, o li ha saltati?

/**
 * Tre esiti, non due. «non-applicabile» esiste perché git NON chiama il pre-commit durante un
 * rebase né su un commit di unione: contarli come forzature riempirebbe il registro di rumore, e
 * un registro rumoroso è un registro che nessuno guarda — cioè di nuovo nessun sensore.
 *
 * @returns {{esito:"controllato"|"bypass"|"non-applicabile", motivo:string}}
 */
export function classificaPassaggio({ marcatoreMs = null, adessoMs = Date.now(), parenti = 1, rebaseInCorso = false, freschezzaSec = FRESCHEZZA_SEC } = {}) {
  if (rebaseInCorso) return { esito: "non-applicabile", motivo: "rebase in corso: git non chiama i cancelli" };
  if (Number(parenti) >= 2) return { esito: "non-applicabile", motivo: "commit di unione: git non chiama i cancelli" };
  // `Number(null)` vale 0, che è finito: senza il controllo esplicito sul nulla questo ramo non
  // scatterebbe MAI e il caso «marcatore assente» finirebbe in quello sotto, che risponde giusto
  // ma dà il motivo sbagliato («è vecchio» invece di «non c'è»). L'ha trovato la mutazione: rotto
  // questo ramo, il test restava verde — cioè il ramo non lo eseguiva nessuno.
  if (marcatoreMs == null || !Number.isFinite(Number(marcatoreMs))) return { esito: "bypass", motivo: "i cancelli non sono passati di qui" };
  const eta = (Number(adessoMs) - Number(marcatoreMs)) / 1000;
  if (eta > Number(freschezzaSec)) return { esito: "bypass", motivo: `il segno dei cancelli è vecchio di ${Math.round(eta)}s: non è di questo commit` };
  return { esito: "controllato", motivo: "i cancelli sono passati" };
}

/** Una riga di registro: leggibile da una persona e ri-leggibile da una macchina. */
export function rigaRegistro({ quando, sha, esito, motivo }) {
  return [quando, sha || "?", esito, motivo || ""].join("\t");
}

/** Il conto: quante forzature, e quali. È il numero che AR-645 dice che non esisteva. */
export function contaBypass(testo) {
  // `null` = il registro non si è potuto leggere. Il conto non è zero: non c'è. Chi legge deve
  // vedere `letto: false` e dire «non lo so» invece di stampare una fila di zeri rassicuranti.
  if (testo === null || testo === undefined) {
    return { letto: false, totale: null, controllati: null, bypass: null, non_applicabili: null, ultimi_bypass: [] };
  }
  const righe = String(testo).split("\n").filter((r) => r.trim());
  const voci = righe.map((r) => {
    const [quando, sha, esito, motivo] = r.split("\t");
    return { quando, sha, esito, motivo };
  });
  return {
    letto: true,
    totale: voci.length,
    controllati: voci.filter((v) => v.esito === "controllato").length,
    bypass: voci.filter((v) => v.esito === "bypass").length,
    non_applicabili: voci.filter((v) => v.esito === "non-applicabile").length,
    ultimi_bypass: voci.filter((v) => v.esito === "bypass").slice(-5),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-645 — il MESSAGGIO. Un blocco dice cosa riparare, non come non ripararlo.

/** Il pezzo che chiude ogni messaggio di blocco al posto dell'istruzione di aggiramento. */
export const CHIUSA_ONESTA =
  "Forzare questo cancello si può, ma viene CONTATO e finisce nel referto: se è un'emergenza vera, dillo a Nicola.";

/**
 * Il testo insegna a saltare i cancelli?
 * È la domanda che un test fa al `pre-commit` vero: un messaggio di blocco non deve contenere il
 * comando che lo annulla. Riconosce le due forme che git accetta.
 */
export function insegnaLaScappatoia(testo) {
  const t = String(testo || "");
  return /--no-verify/.test(t) || /\bgit\s+commit\b[^\n]*\s-\w*n\b/.test(t);
}

/** Le righe di un file che insegnano la scappatoia, col numero: serve al test per dire DOVE. */
export function righeCheInsegnano(testo) {
  return String(testo || "")
    .split("\n")
    .map((r, i) => ({ riga: i + 1, testo: r }))
    .filter((x) => insegnaLaScappatoia(x.testo));
}

// ─────────────────────────────────────────────────────────────────────────────
// La parte con gli effetti: usata dagli hook, tenuta sottile apposta.

const g = (gitDir, nome) => join(gitDir, nome);

export function segnaCancelliPassati(gitDir, adessoMs = Date.now()) {
  writeFileSync(g(gitDir, NOME_MARCATORE_CANCELLI), `${adessoMs}\n`);
}

export function leggiMarcatoreCancelli(gitDir) {
  const p = g(gitDir, NOME_MARCATORE_CANCELLI);
  if (!existsSync(p)) return null;
  try {
    const n = Number(String(readFileSync(p, "utf8")).trim());
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function togliMarcatoreCancelli(gitDir) {
  try {
    rmSync(g(gitDir, NOME_MARCATORE_CANCELLI), { force: true });
  } catch {
    /* niente da togliere */
  }
}

export function registra(gitDir, voce) {
  try {
    appendFileSync(g(gitDir, NOME_REGISTRO), rigaRegistro(voce) + "\n");
  } catch {
    /* il registro non deve mai far fallire un commit */
  }
}

/**
 * Il testo del registro, oppure `null` se non si è potuto leggere.
 *
 * ⚠️ `null` e `""` sono due cose diverse e la differenza è tutta: il vuoto vuol dire «nessuno ha
 * ancora forzato un commit», il null vuol dire «non lo so». Con `catch { return "" }` il conto dei
 * bypass usciva ZERO su un registro illeggibile, cioè la notizia più rassicurante possibile proprio
 * nel caso in cui non si è guardato niente. È la malattia `fonte-troncata-letta-per-intera`, e
 * questo file l'aveva appena aggiunta.
 */
export function leggiRegistro(gitDir) {
  const p = g(gitDir, NOME_REGISTRO);
  if (!existsSync(p)) return "";
  try {
    return readFileSync(p, "utf8");
  } catch (e) {
    return null;
  }
}

/** Il percorso della copia messa da parte durante la misura, o "" se nessuna misura è in corso. */
export function copiaDellaMisura(gitDir) {
  const p = g(gitDir, NOME_MARCATORE_MISURA);
  if (!existsSync(p)) return "";
  try {
    return String(readFileSync(p, "utf8")).trim();
  } catch {
    return "(marcatore presente ma illeggibile)";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI, chiamata dagli hook. Contratto d'uscita: 0 = passa · 1 = blocca.

function gitDirDa(argv) {
  const i = argv.indexOf("--git-dir");
  return i >= 0 && argv[i + 1] ? argv[i + 1] : ".git";
}

function main(argv) {
  const cmd = argv[2] || "rapporto";
  const gitDir = gitDirDa(argv);

  if (cmd === "skill-cancellata") {
    // I file cancellati arrivano su stdin (un percorso per riga): l'hook li ha già chiesti a git.
    let dati = "";
    try {
      dati = readFileSync(0, "utf8");
    } catch {
      dati = "";
    }
    const copia = copiaDellaMisura(gitDir);
    const v = bloccaSkillCancellata({
      misuraInCorso: Boolean(copia),
      percorsoCopia: copia,
      cancellati: dati.split("\n").map((r) => r.trim()).filter(Boolean),
    });
    if (v.blocca) {
      console.error(`⛔ COMMIT BLOCCATO — stai per cancellare una skill (AR-345):`);
      for (const f of v.file) console.error(`  → ${f}`);
      console.error(`\n${v.motivo}`);
      return 1;
    }
    return 0;
  }

  if (cmd === "segna") {
    segnaCancelliPassati(gitDir);
    return 0;
  }

  if (cmd === "post-commit") {
    const marcatore = leggiMarcatoreCancelli(gitDir);
    togliMarcatoreCancelli(gitDir);
    const parenti = Number(argv[3] || 1);
    const rebase = existsSync(join(gitDir, "rebase-merge")) || existsSync(join(gitDir, "rebase-apply"));
    const sha = argv[4] || "?";
    const quando = new Date().toISOString().slice(0, 16).replace("T", " ");
    const v = classificaPassaggio({ marcatoreMs: marcatore, parenti, rebaseInCorso: rebase });
    registra(gitDir, { quando, sha, esito: v.esito, motivo: v.motivo });
    if (v.esito === "bypass") {
      const c = contaBypass(leggiRegistro(gitDir));
      const quanti = c.letto ? `È il ${c.bypass}° contato in questo repo` : `Non ho potuto leggere il registro, quindi non so quanti siano`;
      console.error(`⚠️  Questo commit ha saltato i cancelli. ${quanti} (registro: ${join(gitDir, NOME_REGISTRO)}).`);
    }
    return 0;
  }

  if (cmd === "rapporto") {
    const c = contaBypass(leggiRegistro(gitDir));
    if (argv.includes("--json")) {
      console.log(JSON.stringify(c, null, 2));
      return c.letto ? 0 : 2;
    }
    if (!c.letto) {
      // ⚪ Il registro c'è ma non si legge. Stampare una fila di zeri qui sarebbe la bugia
      // rassicurante: «nessuno ha mai forzato un commit» quando la verità è «non ho guardato».
      console.log(`\n🚪 CANCELLI DEL COMMIT — ⚪ non ho potuto leggere ${join(gitDir, NOME_REGISTRO)}`);
      console.log(`   Il conto delle forzature non è zero: non c'è. Cieco, non verde.`);
      return 2;
    }
    {
      console.log(`\n🚪 CANCELLI DEL COMMIT — ${c.totale} commit visti`);
      console.log(`   controllati:      ${c.controllati}`);
      console.log(`   FORZATI:          ${c.bypass}`);
      console.log(`   non applicabili:  ${c.non_applicabili} (rebase e unioni: git non chiama i cancelli)`);
      for (const b of c.ultimi_bypass) console.log(`   · ${b.quando}  ${b.sha}  ${b.motivo}`);
    }
    return c.bypass > 0 ? 1 : 0;
  }

  console.error(`comando sconosciuto: ${cmd}`);
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(main(process.argv));
