#!/usr/bin/env node
// 🖐️ MANO FERMATA — l'errore già censito non si scrive: l'azione non parte proprio.
//
// PERCHÉ ESISTE (AR-533, Nicola 4/8): «voglio qualcos'altro che ti permetta di far bene il lavoro,
// che impedisca di fare errori». Fino a oggi la macchina scopriva un errore noto UN SECONDO DOPO
// averlo scritto: il sorvegliante gira dopo ogni modifica (PostToolUse), avvisa, e la riparazione è
// un tornare indietro. Questo file sta un passo prima — l'hook PreToolUse riceve il testo che sto
// PER scrivere, e se dentro c'è una malattia già censita in cervello/malattie.json, la scrittura
// viene rifiutata con il perché davanti agli occhi. Il danno non si ripara: non si fa.
//
// COSA BLOCCA, e la taratura è tutto: SOLO le malattie censite nel registro — le forme di difetto
// che questa casa ha già pagato, scritte con pattern precisi, estensioni e percorsi propri, ed
// esenzioni motivate. Niente euristiche, niente giudizi sul merito: un freno pre-scrittura che
// sbaglia una volta su dieci viene spento in un giorno (è la regola per cui il sorvegliante stesso
// scelse di NON bloccare a metà lavoro). Qui si blocca solo ciò che è certo.
//
// COME NE ESCO quando mi ferma — due uscite legittime, scritte nel rifiuto:
//   · curo la riga PRIMA di scriverla (il caso normale);
//   · dichiaro l'esenzione in cervello/malattie.json col PERCHÉ accanto (il caso raro e motivato).
// La terza via — scriverla e basta — è quella che questo freno esiste per chiudere.
//
// LA LOGICA NON È UNA COPIA. Il riconoscimento è ESATTAMENTE il controllo ① del sorvegliante
// (`sorveglia()` importata, con le sue esenzioni, i suoi percorsi, il suo filtro dei commenti):
// due copie della stessa conoscenza divergono sempre — è la ragione per cui il registro è UNO.
//
// CABLAGGIO: hook `PreToolUse` su `Edit|Write|MultiEdit` in `.claude/settings.json`. Quel file è
// nel deny-list della macchina (giustamente): l'aggancio è 🟡 in AZIONI-IN-ATTESA, firma di Nicola.
//
// Uso:
//   node cervello/mano-fermata.mjs --hook           # per l'hook PreToolUse (stdin JSON, SEMPRE exit 0)
//   node cervello/mano-fermata.mjs --prova <file>   # cosa direbbe su un file già su disco
//   node cervello/mano-fermata.mjs --cablaggio      # i due hook della prevenzione sono cablati in
//       settings.json? è la prova che auto-fix esegue per chiudere la scheda da sola il giorno in
//       cui Nicola incolla lo snippet della card in coda.
//
// Exit (contratto guardiani, AR-322): 0 = pulito/cablato · 1 = malattia trovata (--prova) o
//   cablaggio incompleto (--cablaggio) · 2 = non ho potuto misurare. In forma --hook SEMPRE 0:
//   il rifiuto viaggia nel JSON (permissionDecision), mai nel codice d'uscita.
//
// 🟢 Sola lettura: legge il registro malattie, non scrive niente, non tocca git. In caso di
//    QUALSIASI errore interno lascia passare: un freno rotto che blocca ogni scrittura è il modo
//    più veloce di farsi spegnere — fail-open dichiarato, il sorvegliante a valle guarda comunque.

import { readFileSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { righeDiFileNuovo, sorveglia } from "./sorvegliante.mjs";
import { annota, chiudi } from "./libro-mastro.mjs";
import { contaNumeri, prossimoNumero } from "./pausa-coda.mjs";
import { CODA, testoArchivioDi } from "./coda-e-archivio.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzioni pure: un test le esegue su testi finti, un mutante le può accecare.
// ─────────────────────────────────────────────────────────────────────────────

/** Oltre questa dimensione il testo passa senza esame: un Write da megabyte esaminato riga per
 *  riga sfonderebbe il timeout dell'hook, e un freno lento viene spento come uno rumoroso. Il
 *  limite è DICHIARATO (fail-open), e a valle il sorvegliante guarda comunque lo stesso delta. */
export const TESTO_MAX = 512 * 1024;

/**
 * Le malattie censite che il testo IN ARRIVO contiene. Riusa il controllo ① del sorvegliante:
 * stesse esenzioni (SALTA_MALATTIE, fixture), stessi filtri (estensioni, percorsi, commenti).
 * Il numero di riga è relativo al testo che stavo per scrivere, non al file: è l'unico che esiste.
 */
export function giudizioScrittura({ file = "", testo = "", malattie = [] } = {}) {
  if (String(testo).length > TESTO_MAX) return [];
  const aggiunte = righeDiFileNuovo(String(testo)) || [];
  if (!aggiunte.length) return [];
  // I registri che qui non servono (mutanti, difese) restano vuoti: i loro «motivi» di cecità
  // riguardano controlli che questo freno non usa, e le voci si filtrano comunque per classe.
  const { voci } = sorveglia({ toccati: [{ file, aggiunte, contenuto: null }], malattie });
  return voci.filter((v) => v.classe === "malattia-nuova");
}

/**
 * La busta per l'hook PreToolUse: `null` = lascia scrivere (il silenzio è la risposta giusta),
 * altrimenti il JSON che RIFIUTA la scrittura con il perché e le due uscite legittime.
 */
export function bustaManoFermata(voci = [], file = "") {
  if (!voci.length) return null;
  const righe = voci.slice(0, 3).map((v) => `· riga ${v.riga} del testo nuovo — ${v.cosa}\n  perché è grave: ${v.perche}`);
  const testo =
    `🖐️ MANO FERMATA — non ho scritto su ${file}: il testo che stavo per mettere contiene ${voci.length} malattia/e già censita/e.\n` +
    righe.join("\n") +
    (voci.length > 3 ? `\n· …e altre ${voci.length - 3}.` : "") +
    `\n→ due uscite legittime: cura la riga PRIMA di scriverla, oppure dichiara l'esenzione in cervello/malattie.json col PERCHÉ scritto accanto. Scriverla uguale non è una delle due.`;
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: testo },
  });
}

/** Il testo che una chiamata Edit/Write/MultiEdit sta per aggiungere. `null` = non è una scrittura. */
export function testoInArrivo(toolInput = {}) {
  if (typeof toolInput.content === "string") return toolInput.content; // Write: il file intero
  if (typeof toolInput.new_string === "string") return toolInput.new_string; // Edit: il pezzo nuovo
  if (Array.isArray(toolInput.edits)) {
    const pezzi = toolInput.edits.map((e) => e?.new_string).filter((s) => typeof s === "string");
    return pezzi.length ? pezzi.join("\n") : null; // MultiEdit: tutti i pezzi nuovi
  }
  return null;
}

/**
 * 🔢 IL NUMERO DI UNA CARD GIÀ SPESO (25/10). Le card della coda hanno un numero fisso: Nicola
 * scrive «ok 211» e deve esserci UNA card col 211. Archiviata la #211, la coda finiva a #210 e chi
 * contava dalla coda riusava il 211. E il numero dato nel contesto è una fotografia: in un lavoro
 * sul codice `git-pr.mjs --accoda` scrive la card di merge col #212, e subito dopo l'AD scriveva la
 * sua col #212 preso dal contesto. Qui la scrittura si ferma PRIMA, qualunque sia la porta.
 *
 * Si guarda il FILE DOPO la scrittura, non le singole modifiche: si applicano le modifiche alla coda
 * di adesso e si conta quante volte compare ogni numero, prima e dopo. Il collaudo del 25/10 ha
 * bocciato il confronto modifica per modifica: un'ancora presa proprio sulla card che ha già il
 * numero lo lasciava passare, e lo spostamento di una card con MultiEdit veniva rifiutato.
 * Un numero che compare PIÙ volte di prima è speso se sta in archivio, o se dopo c'è due volte.
 * Segnare «### ✅ #211» al posto di «### 🟡 #211» lascia il conto uguale: passa.
 *
 * Torna `[{ n, perche }]`, con perche = "archivio" · "coda" (c'era già) · "doppio" (due volte nel
 * testo nuovo). Un Edit il cui testo da sostituire non c'è fallirà da solo: qui passa.
 */
export function esameNumeri({ toolInput = {}, testoCoda = "", testoArchivio = "" } = {}) {
  let dopo = String(testoCoda);
  if (typeof toolInput.content === "string") {
    dopo = toolInput.content;
  } else {
    const modifiche = Array.isArray(toolInput.edits) ? toolInput.edits : [toolInput];
    for (const m of modifiche) {
      if (typeof m?.new_string !== "string" || typeof m?.old_string !== "string") continue;
      if (!dopo.includes(m.old_string)) return [];
      dopo = m.replace_all ? dopo.split(m.old_string).join(m.new_string) : dopo.replace(m.old_string, () => m.new_string);
    }
  }
  const prima = contaNumeri(testoCoda);
  const poi = contaNumeri(dopo);
  const archivio = contaNumeri(testoArchivio);
  const esito = [];
  for (const [n, volte] of poi) {
    if (volte <= (prima.get(n) || 0)) continue;
    if (archivio.has(n)) esito.push({ n, perche: "archivio" });
    else if (volte > 1) esito.push({ n, perche: (prima.get(n) || 0) > 0 ? "coda" : "doppio" });
  }
  return esito.sort((a, b) => a.n - b.n);
}

/** I soli numeri già spesi, in ordine. */
export function numeriGiaSpesi(opzioni = {}) {
  return esameNumeri(opzioni).map((x) => x.n);
}

/** La busta che rifiuta una card col numero già speso, col motivo giusto e il numero libero davanti agli occhi. */
export function bustaNumeroSpeso(esito = [], prossimo = null) {
  if (!esito.length) return null;
  const DOVE = {
    archivio: "è già di una card chiusa, nell'archivio",
    coda: "c'è già in coda, su un'altra card",
    doppio: "compare due volte in questa stessa scrittura",
  };
  const righe = esito.map(({ n, perche }) => `· #${n} ${DOVE[perche] || "è già speso"}`);
  const doppi = esito.some((x) => x.perche === "doppio");
  const libero = prossimo ? `il primo numero libero adesso è #${prossimo}${doppi ? ` (per due card nuove: #${prossimo} e #${prossimo + 1})` : ""}` : "il numero libero non l'ho potuto calcolare";
  const testo =
    `🖐️ MANO FERMATA — non ho scritto nella coda: un numero di card sarebbe valso due card.\n` +
    righe.join("\n") +
    `\n«ok ${esito[0].n}» avrebbe avuto due risposte, e il Pannello avrebbe aperto la card sbagliata.\n` +
    `→ ${libero}: rilancia node cervello/prossima-card.mjs subito prima di ogni card nuova.`;
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: testo },
  });
}

/** Vero se i due percorsi sono lo stesso file, anche passando da un collegamento simbolico o con
 *  spazi nel nome. Per un file che non c'è ancora si confronta la cartella reale più il nome. */
function stessoFile(a, b) {
  const reale = (p) => {
    try {
      return realpathSync(p);
    } catch {
      try {
        return join(realpathSync(dirname(p)), basename(p));
      } catch {
        return p;
      }
    }
  };
  return reale(a) === reale(b);
}

/**
 * I due agganci della prevenzione a monte dentro settings.json: ci sono?
 *
 * Si legge il JSON VERO, evento per evento — non il testo con una regex. La prima stesura cercava
 * «"PreToolUse" … mano-fermata» in qualunque punto del file: sarebbe bastato il comando cablato
 * sotto l'evento SBAGLIATO (più la parola PreToolUse altrove) per un verde falso — e su questa
 * risposta si chiude AR-533 da solo. Un file malformato risponde «non cablato», che è l'esito
 * onesto: un cablaggio che non si può leggere non sta frenando nessuno.
 */
export function cablaggioPresente(testoSettings = "") {
  let hooks;
  try {
    hooks = JSON.parse(String(testoSettings))?.hooks || {};
  } catch {
    return { mano: false, scheda: false };
  }
  const comandi = (evento) =>
    (Array.isArray(hooks[evento]) ? hooks[evento] : [])
      .flatMap((v) => (Array.isArray(v?.hooks) ? v.hooks : []))
      .map((h) => String(h?.command || ""));
  return {
    mano: comandi("PreToolUse").some((c) => c.includes("mano-fermata.mjs --hook")),
    scheda: comandi("UserPromptSubmit").some((c) => c.includes("contesto-lezioni.mjs --richiesta")),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O — stdin dell'hook, registro malattie. Fail-open su tutto: vedi testa del file.
// ─────────────────────────────────────────────────────────────────────────────

function leggiMalattie() {
  try {
    return JSON.parse(readFileSync(join(QUI, "malattie.json"), "utf8")).malattie || [];
  } catch {
    return []; // registro illeggibile: senza forme da cercare non si blocca nessuno (fail-open)
  }
}

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--cablaggio")) {
    let testo = "";
    try {
      testo = readFileSync(join(REPO, ".claude", "settings.json"), "utf8");
    } catch {
      console.error("⚪ non riesco a leggere .claude/settings.json: non so se i freni siano cablati.");
      process.exit(2);
    }
    const c = cablaggioPresente(testo);
    if (c.mano && c.scheda) {
      console.log("✅ i due freni della prevenzione a monte sono cablati: mano-fermata (PreToolUse) e scheda su misura (UserPromptSubmit).");
      process.exit(0);
    }
    console.log(
      `❌ cablaggio incompleto: mano-fermata ${c.mano ? "✅" : "manca"} · scheda su misura ${c.scheda ? "✅" : "manca"} — lo snippet esatto è nella card #prevenzione-a-monte in AZIONI-IN-ATTESA.md (firma di Nicola).`,
    );
    process.exit(1);
  }

  if (argv.includes("--prova")) {
    const percorso = argv[argv.indexOf("--prova") + 1];
    if (!percorso) {
      console.error("uso: node cervello/mano-fermata.mjs --prova <file>");
      process.exit(2);
    }
    let testo = "";
    try {
      testo = readFileSync(join(REPO, percorso), "utf8");
    } catch {
      console.error(`⚪ non riesco a leggere ${percorso}`);
      process.exit(2);
    }
    const voci = giudizioScrittura({ file: percorso, testo, malattie: leggiMalattie() });
    if (!voci.length) {
      console.log(`✅ nessuna malattia censita in ${percorso}: la mano non si fermerebbe.`);
      process.exit(0);
    }
    for (const v of voci) console.log(`❌ riga ${v.riga} — ${v.cosa}`);
    process.exit(1);
  }

  // Forma hook: SEMPRE exit 0 — il rifiuto viaggia nel JSON, mai nel codice d'uscita.
  // Il libro mastro apre la riga appena so su cosa sto guardando, e la chiude su OGNI uscita: una
  // riga lasciata aperta direbbe «questa guardia è morta a metà», che qui sarebbe falso.
  let mastro = "";
  try {
    const ev = JSON.parse(await leggiStdin());
    const testo = testoInArrivo(ev?.tool_input || {});
    const assoluto = ev?.tool_input?.file_path || "";
    mastro = annota({ guardia: "mano-fermata", evento: "PreToolUse", strumento: ev?.tool_name || "", bersaglio: assoluto });
    if (testo == null || !assoluto) {
      chiudi(mastro, "ok", "nessun testo da guardare in questa scrittura");
      process.exit(0);
    }
    // La coda delle card: un numero già speso non si scrive (vedi esameNumeri). Si riconosce PRIMA
    // del controllo «fuori dalla casa»: raggiunta da un collegamento simbolico, la coda sembrerebbe fuori.
    // In un try suo: se l'archivio non si legge, il controllo dei numeri è cieco e lo dice il libro
    // mastro — ma quello delle malattie, più sotto, gira comunque.
    if (stessoFile(isAbsolute(assoluto) ? assoluto : join(REPO, assoluto), CODA)) {
      try {
        const testoCoda = readFileSync(CODA, "utf8");
        const testoArchivio = testoArchivioDi(CODA);
        const esito = esameNumeri({ toolInput: ev?.tool_input || {}, testoCoda, testoArchivio });
        if (esito.length) {
          process.stdout.write(bustaNumeroSpeso(esito, prossimoNumero(testoCoda, testoArchivio)));
          chiudi(mastro, "nega", `numero di card già speso: ${esito.map((x) => `${x.n} (${x.perche})`).join(", ")}`);
          process.exit(0);
        }
      } catch (e) {
        annota({ guardia: "mano-fermata", evento: "PreToolUse", strumento: "numeri-card", bersaglio: `cieco: ${e?.code ?? e?.message}` });
      }
    }
    const file = isAbsolute(assoluto) ? relative(REPO, assoluto) : assoluto;
    if (file.startsWith("..")) {
      chiudi(mastro, "ok", "fuori dalla casa: non è giurisdizione di questo freno");
      process.exit(0); // fuori dalla casa: non è giurisdizione di questo freno
    }
    const voci = giudizioScrittura({ file, testo, malattie: leggiMalattie() });
    const busta = bustaManoFermata(voci, file);
    if (busta) process.stdout.write(busta);
    chiudi(mastro, voci.length ? "nega" : "ok", voci.length ? voci.map((v) => v.cosa).join(" · ") : "");
  } catch {
    // Fail-open dichiarato: un freno rotto non deve murare ogni scrittura. Ma il guasto resta scritto:
    // un fail-open silenzioso è indistinguibile da un via libera, ed è la cosa che stiamo togliendo.
    chiudi(mastro, "ok", "freno in errore: fail-open dichiarato, la scrittura è passata senza giudizio");
  }
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
