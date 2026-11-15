#!/usr/bin/env node
// ✋ PRIMA CHE ACCADA (AR-525) — l'unico freno che parla mentre la mossa è ancora annullabile.
//
// PERCHÉ ESISTE. Tutte le guardie di questa macchina arrivano DOPO. Il sorvegliante parla quando il
// file è già scritto, il cancello del lotto quando il lavoro è finito, quello dello Stop quando dico
// «ho finito». È una scelta giusta e dichiarata — un freno che ferma un Edit a metà lavoro viene
// spento in un giorno — ma lascia scoperte due cose che dopo non si riparano più:
//
//   ① LE SCRITTURE CHE NESSUNA GUARDIA VEDE. Il sorvegliante è agganciato a Edit/Write/MultiEdit e,
//      dal 3/8, ai comandi di shell (AR-502). Restano fuori gli strumenti MCP che scrivono
//      DIRETTAMENTE sul mondo: un file creato su GitHub via `create_or_update_file` o `push_files`
//      non passa né dalla guardia in tempo reale né dal `pre-commit` — cioè né dal controllo sulle
//      malattie, né da quello sui segreti, né dal perimetro di main. In una sessione remota come
//      quelle in cui lavoro adesso quello NON è il canale raro: è il canale principale.
//   ② LE MOSSE CHE SPENGONO LE GUARDIE. `git commit --no-verify` salta in un colpo i quattro cancelli
//      del pre-commit (sintassi shell, sintassi JavaScript, perimetro di main, segreti). Cancellare
//      un file che i registri dichiarano difesa toglie un freno lasciando il suo conteggio intatto —
//      il sorvegliante lo trova, ma DOPO, quando il file non c'è già più.
//
// COSA FA. Legge la mossa prima che parta e, nei casi qui sotto, chiede: `permissionDecision: "ask"`.
// Non nega mai da solo.
//
// PERCHÉ «CHIEDI» E NON «NEGA», che è la decisione di taratura di tutto il file. Un `deny` scritto da
// me è una regola che Nicola non ha firmato e che si scopre solo quando blocca qualcosa di legittimo:
// `--no-verify` È il bypass di emergenza dichiarato dal pre-commit, e togliergli la valvola vorrebbe
// dire spegnere il freno intero il giorno in cui serve davvero. `ask` invece mette la decisione dove
// deve stare — da Nicola — e costa un clic. Il potere di dire di no resta suo, quello di accorgersene
// diventa mio.
//
//   ① `git commit --no-verify`      → salta i quattro cancelli del pre-commit
//   ② cancellazione di una DIFESA   → un file che lezioni, mutazioni o hook dichiarano freno
//   ③ `git push --force` su main    → riscrive una storia che altri hanno già letto
//   ④ scrittura via strumento MCP   → non passa da nessuna guardia, né prima né dopo
//   ⑤ una squadra di agenti (Workflow) senza preventivo, col preventivo smentito dal codice, o
//      sopra il tetto del manuale (12 subagenti, 2 milioni di token) → vedi «LA SQUADRA» più sotto
//
// I comandi si leggono su Bash e su Monitor (che lancia uno script come Bash, solo che lo tiene vivo).
//
// E UNA MOSSA CHE NON CHIEDE NIENTE, ma è la ragione per cui questo file è agganciato anche allo
// strumento di delega (`Agent` oggi, `Task` nelle versioni vecchie: `STRUMENTI_DI_DELEGA`):
// quando parte un senior, qui si pianta l'ancora del suo lavoro (commit + scatto della guardia + ora).
// Senza, il cancello dei senior non avrebbe modo di sapere DA DOVE guardare — e misurerebbe come
// «lavoro del senior» tutto ciò che c'era prima, cioè la stessa malattia del perimetro largo che il
// 4/8 mi ha fatto contestare sette file scritti tre giorni prima.
//
// COSA NON FA. Non legge il contenuto di ciò che sto per scrivere (l'evento porta gli argomenti dello
// strumento, non l'effetto): non sa se quella scrittura introduca una malattia — quello resta al
// sorvegliante, dopo, dove è misurabile. Non giudica se la mossa sia giusta. Quattro forme meccaniche,
// e dove passa un «forse» qui si tace.
//
// COPERTURA DICHIARATA: i comandi li riconosce dal TESTO. Un `--no-verify` costruito a runtime, letto
// da una variabile o nascosto in uno script che chiamo, non lo vedo. Un elenco di forme già pagate,
// non una teoria della shell — è la stessa copertura dichiarata di misura-cieca.mjs.
//
// Uso:
//   node cervello/pre-scrittura.mjs --hook          # per l'hook PreToolUse: evento da stdin
//   node cervello/pre-scrittura.mjs "<comando>"     # cosa direbbe su questo comando
//
// Uscita: 0 sempre in forma hook (la decisione viaggia nel JSON, non nel codice d'uscita)
//
// 🟢 Sola lettura sul repo. L'unica scrittura è l'ancora del senior, fuori da git (`_tmp_*`).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BATTITO, difeseDelRepo } from "./sorvegliante.mjs";
import { annota, chiudi } from "./libro-mastro.mjs";
import { gitEsegui } from "./git-github.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

/** L'ancora del lavoro dei senior. Fuori da git, come tutte le misure di sessione (AR-464). */
export const ANCORA_SENIOR = "cervello/_tmp_senior-ancora.json";

/**
 * Gli strumenti che scrivono sul mondo SENZA passare da nessuna guardia di questa macchina.
 *
 * Riconosciuti per FORMA del nome, non per elenco chiuso: `mcp__<server>__<verbo>` dove il verbo dice
 * «sto scrivendo». Un elenco di nomi esatti sarebbe il perimetro dedotto di AR-347 — resterebbe
 * indietro al primo strumento nuovo, ed è proprio il caso in cui restare indietro non si vede.
 */
export const VERBI_DI_SCRITTURA = /(create|update|delete|push|write|merge|apply|deploy|remove|add)/i;

/** Riconosce uno strumento MCP dal nome, che per contratto comincia così. */
export const E_MCP = /^mcp__/;

/**
 * Gli strumenti con cui parte un senior (AR-1009).
 *
 * Oggi si chiama «Agent»: è il nome nella documentazione degli hook e nell'elenco strumenti di
 * Claude Code 2.1.310. «Task» è il nome delle versioni vecchie e resta, perché una copia ferma a una
 * versione vecchia non deve perdere l'ancora. Fino al 25/10 qui c'era un confronto con «Task» e basta:
 * l'ancora non nasceva mai, e il cancello dei senior giudicava ogni delega come «nessuna ancora».
 */
export const STRUMENTI_DI_DELEGA = new Set(["Agent", "Task"]);

/** Questa mossa fa partire un senior? */
export function parteUnSenior(strumento = "") {
  return STRUMENTI_DI_DELEGA.has(strumento);
}

/**
 * Gli strumenti che portano un comando di shell nel campo `command`. Monitor lancia uno script come
 * Bash, solo che lo tiene vivo: un `git commit --no-verify` dentro un Monitor salta gli stessi
 * cancelli. Fino al 15/11 qui c'era solo Bash, e su Monitor la guardia si apriva e taceva.
 */
export const STRUMENTI_DI_COMANDO = new Set(["Bash", "Monitor"]);

// ─────────────────────────────────────────────────────────────────────────────
// LA SQUADRA — il freno sui lanci di agenti in gruppo (regola ⑱ del manuale dell'AD, 15/11/2026).
//
// PERCHÉ. Il manuale dice: prima di lanciare una squadra si scrive il preventivo in testa allo script
// (quanti agenti, quanti token), e oltre 12 subagenti o 2 milioni di token si chiede prima a Nicola.
// Fino a qui la regola viveva nella testa di chi scriveva lo script: l'ondata del 28/10 è partita con
// 54 subagenti e 118 milioni di token riletti. Un tetto che nessuno conta non è un tetto.
//
// COSA MISURA, e cosa no:
//   · la riga del preventivo — «// Preventivo: 3 subagenti, circa 1,5 milioni di token». Se ci sono più
//     cifre (es. «3 per territorio, con 4 territori 12 subagenti») vale la PIÙ ALTA: il tetto si confronta
//     col caso peggiore dichiarato, non con quello comodo.
//   · le chiamate `agent(` scritte nello script, fuori dai commenti: sono il conto MINIMO. Se lo script
//     ne chiama più di quanti ne dichiara, il preventivo è smentito dal codice stesso, e lo dico.
//   · i moltiplicatori (`parallel`, `pipeline`, `.map`, i cicli): li nomino, perché lì il conto vero
//     dipende dai dati e da qui non lo posso sapere. Un preventivo su uno script così è una promessa
//     di chi l'ha scritto, non una misura mia — la riga nel libro mastro lo dice.
//   NON misura i token spesi davvero: quelli si contano dopo (`conto-token.mjs`).
//
// LA DECISIONE. Come tutto il file: non nego mai, chiedo. Preventivo mancante, incompleto, smentito
// dal codice o sopra il tetto → `ask`, con un messaggio che Nicola capisce senza aprire lo script.
// Altrimenti passa in silenzio e resta la riga nel libro mastro.
// ─────────────────────────────────────────────────────────────────────────────

export const TETTO_AGENTI = 12;
export const TETTO_TOKEN = 2_000_000;

/** Lo strumento che lancia una squadra intera. */
export const STRUMENTI_DI_SQUADRA = new Set(["Workflow"]);

/** «1,5» con un'unità → 1.5; «2.500.000» senza unità → 2500000. Puro. */
export function numeroItaliano(testo = "", conUnita = false) {
  const t = String(testo).trim();
  if (conUnita) return Number(t.replace(",", "."));
  return Number(t.replace(/\./g, "").replace(",", "."));
}

const UNITA = { milione: 1e6, milioni: 1e6, mln: 1e6, m: 1e6, mila: 1e3, k: 1e3 };

/**
 * La riga del preventivo, letta. Cerca solo nei commenti: una parola «Preventivo» dentro un prompt non
 * è un preventivo. Torna {trovato, riga, agenti, token}; agenti/token null se la riga non li dice.
 */
export function leggiPreventivo(script = "") {
  const righe = String(script).split("\n");
  const riga = righe.find((r) => /^\s*(\/\/|\/?\*)\s*Preventivo\s*:/i.test(r));
  if (!riga) return { trovato: false, riga: "", agenti: null, token: null };
  const testo = riga.replace(/^\s*(\/\/|\/?\*)\s*Preventivo\s*:/i, "");

  const agenti = [...testo.matchAll(/(\d+)\s*(?:sub-?)?agent[ie]?\b/gi)].map((m) => Number(m[1]));
  const token = [...testo.matchAll(/(\d[\d.,]*)\s*(milion[ei]|mln|mila|m|k)?\s*(?:di\s+)?token/gi)].map((m) => {
    const unita = (m[2] || "").toLowerCase();
    return numeroItaliano(m[1], Boolean(unita)) * (UNITA[unita] || 1);
  });
  const massimo = (xs) => (xs.filter(Number.isFinite).length ? Math.max(...xs.filter(Number.isFinite)) : null);
  return { trovato: true, riga: riga.trim(), agenti: massimo(agenti), token: massimo(token) };
}

/** Lo script senza commenti, per contare le chiamate vere e non quelle citate nel racconto. */
function senzaCommentiJs(script = "") {
  return String(script)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((r) => (/^\s*\/\//.test(r) ? "" : r))
    .join("\n");
}

/** Il conto minimo degli agenti e i punti dove il conto si moltiplica. Puro. */
export function contaAgenti(script = "") {
  const codice = senzaCommentiJs(script);
  const minimo = (codice.match(/(?<![.\w])agent\s*\(/g) || []).length;
  const moltiplicatori = [];
  if (/\bparallel\s*\(/.test(codice)) moltiplicatori.push("parallel");
  if (/\bpipeline\s*\(/.test(codice)) moltiplicatori.push("pipeline");
  if (/\.(?:flatMap|map|forEach)\s*\(/.test(codice)) moltiplicatori.push(".map");
  if (/\b(?:for|while)\s*\(/.test(codice)) moltiplicatori.push("cicli");
  return { minimo, moltiplicatori };
}

const milioni = (n) => `${(n / 1e6).toLocaleString("it-IT", { maximumFractionDigits: 2 })} milioni`;

/**
 * La decisione su una squadra. Pura.
 *
 * @param {{script?:string, origine?:string, errore?:string}} s
 * @returns {{chiedi:boolean, classe:string|null, motivo:string|null, nota:string}}
 */
export function decidiSquadra({ script = "", origine = "script", errore = "" } = {}) {
  const chiedi = (classe, motivo) => ({ chiedi: true, classe, motivo, nota: motivo });
  if (errore || !String(script).trim()) {
    return chiedi(
      "squadra-illeggibile",
      `sta per partire una squadra di agenti (${origine}), ma non riesco a leggerne lo script: ${errore || "è vuoto"}. ` +
        `Senza script non so quanti agenti partono né quanto costano. Fallo partire solo se sai già quanto spende.`,
    );
  }
  const p = leggiPreventivo(script);
  const { minimo, moltiplicatori } = contaAgenti(script);
  const molt = moltiplicatori.length
    ? ` Lo script moltiplica gli agenti (${moltiplicatori.join(", ")}): il conto vero dipende dai dati, il preventivo è una promessa di chi l'ha scritto.`
    : "";

  if (!p.trovato) {
    return chiedi(
      "squadra-senza-preventivo",
      `sta per partire una squadra di agenti (${origine}) senza preventivo. La regola del manuale vuole in testa allo script ` +
        `una riga come «// Preventivo: 3 subagenti, circa 1,5 milioni di token». Nel codice ci sono almeno ${minimo} chiamate ad agenti.${molt}`,
    );
  }
  if (p.agenti == null || p.token == null) {
    const manca = [p.agenti == null && "quanti agenti", p.token == null && "quanti token"].filter(Boolean).join(" e ");
    return chiedi(
      "preventivo-incompleto",
      `il preventivo della squadra (${origine}) non dice ${manca}: «${p.riga}». Senza quel numero non posso confrontarlo col tetto ` +
        `di ${TETTO_AGENTI} agenti e ${milioni(TETTO_TOKEN)} di token.${molt}`,
    );
  }
  if (minimo > p.agenti) {
    return chiedi(
      "preventivo-smentito",
      `il preventivo della squadra (${origine}) dice ${p.agenti} agenti, ma lo script ne chiama almeno ${minimo}: il codice smentisce ` +
        `la stima prima ancora di partire.${molt}`,
    );
  }
  const sopra = [];
  if (p.agenti > TETTO_AGENTI) sopra.push(`${p.agenti} agenti (il tetto è ${TETTO_AGENTI})`);
  if (p.token > TETTO_TOKEN) sopra.push(`${milioni(p.token)} di token (il tetto è ${milioni(TETTO_TOKEN)})`);
  if (sopra.length) {
    return chiedi(
      "squadra-oltre-tetto",
      `la squadra (${origine}) supera il tetto che il manuale fa firmare a Nicola: ${sopra.join(" e ")}. ` +
        `Preventivo: «${p.riga}».${molt}`,
    );
  }
  return {
    chiedi: false,
    classe: null,
    motivo: null,
    nota: `squadra sotto tetto (${origine}): preventivo ${p.agenti} agenti e ${milioni(p.token)} di token, almeno ${minimo} chiamate nel codice.${molt}`,
  };
}

/**
 * Lo script di un Workflow dagli argomenti dello strumento: `script` scritto lì, oppure il file di
 * `scriptPath`, oppure il workflow salvato col suo `name` in `.claude/workflows/`. Un workflow
 * incorporato nel motore non sta sul disco: lo dico come errore, non lo indovino.
 */
export function scriptDelWorkflow(toolInput = {}, { repo = REPO, cwd = repo } = {}) {
  const ti = toolInput || {};
  if (typeof ti.script === "string" && ti.script.trim()) return { script: ti.script, origine: "script scritto nella chiamata", errore: "" };
  const leggi = (percorso, origine) => {
    try {
      return { script: readFileSync(percorso, "utf8"), origine, errore: "" };
    } catch (e) {
      return { script: "", origine, errore: `il file non si apre (${e.code || e.message})` };
    }
  };
  if (typeof ti.scriptPath === "string" && ti.scriptPath.trim()) {
    const p = ti.scriptPath.startsWith("/") ? ti.scriptPath : join(cwd, ti.scriptPath);
    return leggi(p, `file ${ti.scriptPath}`);
  }
  if (typeof ti.name === "string" && ti.name.trim()) {
    const nome = ti.name.trim();
    if (!/^[\w.-]+$/.test(nome) || nome.includes("..")) return { script: "", origine: `workflow «${nome}»`, errore: "il nome non è un nome di file" };
    for (const est of [".js", ".mjs"]) {
      const p = join(repo, ".claude/workflows", nome + est);
      if (existsSync(p)) return leggi(p, `workflow salvato «${nome}»`);
    }
    return { script: "", origine: `workflow «${nome}»`, errore: "non è in .claude/workflows/ (forse è incorporato nel motore)" };
  }
  return { script: "", origine: "workflow", errore: "la chiamata non porta né script, né scriptPath, né name" };
}

/**
 * Quale ramo di questa guardia prende uno strumento — null se nessuno. È la stessa funzione con cui
 * `suMossa` smista: la mappa della copertura la chiama per sapere se, dove il filtro dell'hook sveglia
 * la guardia, la guardia fa davvero qualcosa. Un filtro che apre la porta su una stanza vuota non è
 * sorveglianza (Agent e Workflow fino al 15/11).
 */
export function ramoDi(strumento = "") {
  if (parteUnSenior(strumento)) return "delega";
  if (STRUMENTI_DI_SQUADRA.has(strumento)) return "squadra";
  if (E_MCP.test(strumento)) return "mcp";
  if (STRUMENTI_DI_COMANDO.has(strumento)) return "comando";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — puro. Riceve la mossa già letta e torna la decisione: così una prova può eseguire ogni
// caso senza avere né un repo né un evento vero.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La decisione su una mossa.
 *
 * @param {object} m
 * @param {string} m.strumento   nome dello strumento (Bash, Edit, mcp__github__push_files, …)
 * @param {string} m.comando     il testo del comando, quando lo strumento è Bash
 * @param {Map<string,string>} m.difese  percorso → perché qualcuno lo dichiara difesa
 * @returns {{chiedi:boolean, motivo:string|null, classe:string|null}}
 */
export function decidi({ strumento = "", comando = "", difese = new Map() } = {}) {
  const no = { chiedi: false, motivo: null, classe: null };

  // ④ Uno strumento MCP che scrive. Vale PRIMA degli altri perché è l'unico caso in cui, se taccio,
  //    non parlerà più nessuno: dopo non resta nemmeno un diff locale da guardare.
  if (E_MCP.test(strumento)) {
    const verbo = strumento.split("__").pop() || "";
    if (VERBI_DI_SCRITTURA.test(verbo)) {
      return {
        chiedi: true,
        classe: "scrittura-senza-guardia",
        motivo:
          `«${strumento}» scrive fuori da questa copia: non passa dal sorvegliante (che guarda solo Edit/Write e i comandi) ` +
          `né dal pre-commit (sintassi, perimetro di main, segreti). Se quel contenuto va anche committato qui, fallo da qui: ` +
          `così almeno una guardia lo vede.`,
      };
    }
    return no;
  }

  if (!comando || !STRUMENTI_DI_COMANDO.has(strumento)) return no;
  const c = String(comando);

  // ① Il bypass dei quattro cancelli del pre-commit.
  if (/\bgit\s+commit\b[^\n]*(--no-verify|(?:^|\s)-n(?:\s|$))/.test(c)) {
    return {
      chiedi: true,
      classe: "cancelli-saltati",
      motivo:
        "questo commit salta i quattro cancelli del pre-commit: sintassi shell, sintassi JavaScript, perimetro di main e segreti. " +
        "Il quarto è quello che conta: è l'unico posto dove un token vero viene fermato prima di entrare nella storia.",
    };
  }

  // ③ La storia riscritta sotto i piedi di chi l'ha già letta.
  if (/\bgit\s+push\b[^\n]*(--force\b|--force-with-lease\b|\s-f\b)/.test(c) && /\bmain\b/.test(c)) {
    return {
      chiedi: true,
      classe: "storia-riscritta",
      motivo: "un push forzato su main riscrive commit che il Pannello e le altre copie hanno già letto: quello che era vero un minuto fa smette di esistere.",
    };
  }

  // ② Una difesa cancellata. Solo su percorsi che qualcun ALTRO dichiara freno: un elenco scritto
  //    qui sarebbe il perimetro dedotto di AR-347 dentro il file che lo deve impedire.
  if (/\b(rm|git\s+rm|unlink|shred)\b/.test(c)) {
    for (const [p, perche] of difese) {
      if (!c.includes(p)) continue;
      return {
        chiedi: true,
        classe: "difesa-cancellata",
        motivo:
          `«${p}» ${perche}. Cancellandolo il conteggio dei freni resta identico e la difesa non esiste più: ` +
          `nessuno se ne accorgerà, perché non resta niente che possa diventare rosso.`,
      };
    }
  }

  return no;
}

/** La busta della decisione. `null` quando non c'è niente da chiedere: il silenzio è la norma. */
export function bustaDecisione(d = {}) {
  if (!d.chiedi) return null;
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: `✋ ${d.classe} — ${d.motivo}`,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// L'ANCORA DEL SENIOR — la parte che non chiede niente e serve al cancello dei senior.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * L'ancora aggiornata quando parte un senior.
 *
 * `aperti` conta i senior in volo: l'evento non dice QUALE senior sta finendo, quindi con più di uno
 * il perimetro è per forza condiviso — e il cancello dei senior lo dichiara invece di fingere
 * precisione. Un numero onesto e una frase onesta valgono più di un'attribuzione inventata.
 */
export function apriSenior(precedente = null, { commit = null, scatto = 0, quando = "" } = {}) {
  if (precedente && Number(precedente.aperti) > 0) {
    return { ...precedente, aperti: Number(precedente.aperti) + 1 };
  }
  return { commit, scatto, quando, aperti: 1 };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O
// ─────────────────────────────────────────────────────────────────────────────

function leggiJson(percorso, repo = REPO) {
  try {
    return JSON.parse(readFileSync(join(repo, percorso), "utf8"));
  } catch {
    return null;
  }
}

function headOra(repo = REPO) {
  try {
    // L'esecutore unico di casa (malattia «git-letto-senza-tetto»): tetto di memoria e di tempo, così
    // un hook che ha 10 secondi in tutto non resta appeso su un git lento.
    return gitEsegui(["rev-parse", "HEAD"], repo, {}, { timeout: 3000 });
  } catch {
    return null;
  }
}

/** Pianta l'ancora del senior in `repo`. Torna l'ancora scritta, o null se il disco non l'ha presa. */
export function piantaAncora(repo = REPO, quando = new Date().toISOString()) {
  const b = leggiJson(BATTITO, repo);
  const nuova = apriSenior(leggiJson(ANCORA_SENIOR, repo), { commit: headOra(repo), scatto: Number(b?.scatto) || 0, quando });
  try {
    writeFileSync(join(repo, ANCORA_SENIOR), JSON.stringify(nuova));
    return nuova;
  } catch {
    // Senza ancora il cancello dei senior guarderà un perimetro largo e lo dirà: peggiore, non falso.
    return null;
  }
}

/**
 * Una mossa letta dall'hook → la busta da stampare. È main() senza stdin e senza uscita, così una
 * prova la fa girare tutta su un repo finto.
 *
 * Il libro mastro arriva da fuori per lo stesso motivo: una prova che scrivesse nel registro vero
 * metterebbe «pre-scrittura ha visto Agent» in un turno dove non l'ha visto nessuno, e
 * mappa-copertura lo leggerebbe come copertura vera.
 */
export function suMossa(ev, { repo = REPO, difese = difeseDelRepo, mastro = { annota, chiudi } } = {}) {
  const strumento = ev?.tool_name || "";

  // Il libro mastro: da qui in poi ogni uscita chiude la sua riga. Aprirla senza chiuderla
  // significherebbe dichiarare questa guardia morta a metà, che è il difetto opposto.
  const ti = ev?.tool_input || {};
  const bersaglio = comandoDi(ti) || (STRUMENTI_DI_SQUADRA.has(strumento) ? ti.scriptPath || ti.name || "script nella chiamata" : "");
  const id = mastro.annota({ guardia: "pre-scrittura", evento: "PreToolUse", strumento, bersaglio });

  // Parte un senior: pianto l'ancora del suo lavoro e non chiedo niente.
  if (parteUnSenior(strumento)) {
    const ancora = piantaAncora(repo);
    mastro.chiudi(id, "ok", ancora ? "parte un senior: ancora piantata, niente da chiedere" : "parte un senior: ancora NON scritta sul disco");
    return { busta: null, ancora };
  }

  // Parte una squadra: leggo il preventivo e lo confronto col tetto (regola ⑱).
  if (STRUMENTI_DI_SQUADRA.has(strumento)) {
    const d = decidiSquadra(scriptDelWorkflow(ev?.tool_input, { repo, cwd: ev?.cwd || repo }));
    mastro.chiudi(id, d.chiedi ? "chiede" : "ok", d.nota);
    return { busta: bustaDecisione(d), ancora: null };
  }

  const d = decidi({ strumento, comando: comandoDi(ev?.tool_input), difese: difese() });
  mastro.chiudi(id, d.chiedi ? "chiede" : "ok", d.chiedi ? d.motivo : "");
  return { busta: bustaDecisione(d), ancora: null };
}

async function leggiStdin() {
  const pezzi = [];
  for await (const p of process.stdin) pezzi.push(p);
  return Buffer.concat(pezzi).toString("utf8");
}

/** Il testo del comando dagli argomenti dello strumento: `command` per Bash, niente per il resto. */
export function comandoDi(toolInput = {}) {
  return typeof toolInput?.command === "string" ? toolInput.command : "";
}

async function main() {
  const argv = process.argv.slice(2);
  const hook = argv.includes("--hook");

  if (!hook) {
    const comando = argv.find((a) => !a.startsWith("--")) || "";
    const d = decidi({ strumento: "Bash", comando, difese: difeseDelRepo() });
    if (!d.chiedi) {
      console.log("✅ niente da chiedere su questo comando.");
      process.exit(0);
    }
    console.log(`✋ ${d.classe}\n   ${d.motivo}`);
    process.exit(0);
  }

  let ev = null;
  try {
    ev = JSON.parse(await leggiStdin());
  } catch {
    // Nessun payload leggibile: non invento una decisione. Un freno che chiede senza aver letto la
    // mossa insegna a cliccare «sì» senza guardare, che è il modo più veloce per renderlo inutile.
    process.exit(0);
  }

  const { busta } = suMossa(ev);
  if (busta) console.log(busta);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
