#!/usr/bin/env node
// 🚪 LA PORTA DEI SENIOR — l'unico modo di mettere al lavoro uno dei 120 senior.
//
// PERCHÉ ESISTE (lotto corsia G — AR-434, AR-435). I workflow che mettono al lavoro la squadra
// (.claude/workflows/*.js) non aprivano mai il mansionario dell'agente: il prompt era ricopiato a
// mano dentro lo script, tre righe di «Sei il senior @vendite, focus: …». Il risultato è che i 120
// mansionari — 2,7 MB di mestiere, la fonte di verità su chi fa cosa e COME lo fa — non arrivavano
// mai a chi lavora davvero. Il senior che proponeva le mosse del giro era un agente generico con un
// nome addosso.
//
// LA RADICE, ed è la parte che conta: non esisteva **un punto unico** da cui passa la costruzione del
// prompt di un senior, quindi ogni chiamante se lo componeva come voleva, e nessun guardiano poteva
// misurare il prompt che arriva davvero al modello — tutti misuravano il FILE sul disco (esiste la
// scheda? esiste il kit?). La macchina certificava l'INSTALLAZIONE e non l'ESECUZIONE.
//
// LA CURA non è riscrivere i due prompt sbagliati (quella è la guarigione di un punto): è che da qui
// in poi un workflow che mette al lavoro un senior **debba passare da questa porta**, e che chi non
// ci passa non superi il controllo (`violazioniPorta`, provato dal test sui workflow VERI).
//
// SECONDA MALATTIA CURATA QUI (AR-435): i workflow scrivevano il percorso del repo a mano
// (`/home/user/ad-mycity`), che è vero nella sessione cloud e falso sul VPS. `radiceRepo()` lo risolve
// a runtime con lo stesso schema di `resolveMarketplaceRepo()` in .claude/workflows/radiografia.js:
// prima l'ambiente (se punta davvero al repo), poi la risalita dalla posizione di QUESTO file — che
// vive dentro il repo e quindi non può sbagliare, ovunque sia clonato.
//
// Uso da riga di comando:
//   node cervello/prompt-senior.mjs vendite --focus="portare LIVE il prossimo negozio"
//   node cervello/prompt-senior.mjs --guardiano        # i file-pilota che non passano dalla porta
//   node cervello/prompt-senior.mjs --elenco           # i senior disponibili

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));

/** I fatti-chiave che ogni senior in turno deve avere sotto gli occhi (fonte unica: AR-102). */
export const FATTI_DEL_GIRO = ["negozio.faro", "northstar.consegnati", "ordine16.stato"];

// ─────────────────────────────────────────────────────────────────────────────
// ① DOVE SIAMO — la radice del repo, risolta a runtime e mai scritta a mano (AR-435)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Una cartella è la radice del repo dell'AD se ha le due cose che nessun'altra cartella ha:
 * il manuale operativo e la squadra. Serve a non fidarsi ciecamente di una variabile d'ambiente:
 * un AD_ROOT sbagliato è peggio di nessun AD_ROOT, perché fa leggere mansionari che non ci sono.
 * @param {string} dir
 */
export function sembraRepoAD(dir) {
  if (!dir || typeof dir !== "string") return false;
  // existsSync non lancia: nessun catch da cui uscire con un «no» che in realtà è un «non lo so».
  return existsSync(join(dir, ".claude", "agents")) && existsSync(join(dir, "CLAUDE.md"));
}

/**
 * La radice del repo dell'AD. Ordine: AD_ROOT dall'ambiente (se è davvero il repo) → risalita da
 * questo file → la cartella di lavoro. L'ultima riga è la rete di sicurezza: se nessun candidato
 * convince, vale comunque la risalita, perché questo file **sta dentro** il repo.
 * @param {Record<string,string|undefined>} env
 * @param {string} cwd
 * @returns {string}
 */
export function radiceRepo(env = process.env, cwd = process.cwd()) {
  const dalFile = resolve(QUI, "..");
  for (const c of [env?.AD_ROOT, dalFile, cwd]) {
    if (!c) continue;
    const abs = resolve(c);
    if (sembraRepoAD(abs)) return abs;
  }
  return dalFile;
}

// ─────────────────────────────────────────────────────────────────────────────
// ② CHI C'È — i senior sono i file, non un elenco scritto in un altro posto
// ─────────────────────────────────────────────────────────────────────────────

/**
 * I nomi dei senior disponibili: sono i file di `.claude/agents/`, e basta. Nessuna lista parallela
 * da tenere allineata a mano — la lista parallela è il modo in cui 114 senior su 120 sono rimasti
 * fuori dal turno per mesi (AR-187).
 * @param {string} radice
 * @returns {string[]}
 */
export function elencoSenior(radice = radiceRepo()) {
  const dir = join(radice, ".claude", "agents");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .sort();
}

/** I tre file che compongono un senior: mansionario (obbligatorio), kit, quaderno. */
export function percorsiSenior(nome, radice = radiceRepo()) {
  return {
    mansionario: join(radice, ".claude", "agents", `${nome}.md`),
    kit: join(radice, "MyCity-Vault", "07-Agenti", "kit", `${nome}-KIT.md`),
    quaderno: join(radice, "memoria-squadra", `${nome}.md`),
  };
}

/** Il testo di un file, o null se non c'è. Nessun throw: la mancanza è un dato, non un incidente. */
function leggiSePresente(percorso) {
  try {
    return readFileSync(percorso, "utf8");
  } catch {
    return null;
  }
}

/** La `description` del frontmatter: è la porta d'ingresso del senior (quella che decide il routing). */
export function descrizioneDi(testo) {
  const m = String(testo || "").match(/^description:\s*(.+)$/m);
  return m ? m[1].trim() : "";
}

/**
 * Le righe ESITO più recenti di un quaderno: la memoria corta del senior, quella che gli evita di
 * ripartire da zero. Ordinate per data vera, non per posizione nel file (i quaderni crescono da
 * entrambi i capi a seconda di chi scrive).
 * @param {string|null} testoQuaderno
 * @param {number} quanti
 * @returns {{data:string, riga:string}[]}
 */
export function esitiRecenti(testoQuaderno, quanti = 3) {
  const righe = String(testoQuaderno || "").split("\n");
  const esiti = [];
  for (const r of righe) {
    const m = r.match(/^\s*[-*]\s+(\d{4}-\d{2}-\d{2})(?:\s+\d{2}:\d{2})?\s*·\s*(.+)$/);
    if (m) esiti.push({ data: m[1], riga: m[2].trim() });
  }
  esiti.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
  return esiti.slice(0, Math.max(0, quanti));
}

/** La data dell'ultimo ESITO di un quaderno (AAAA-MM-GG), o null se il quaderno è fermo/vuoto. */
export function ultimoEsito(testoQuaderno) {
  const e = esitiRecenti(testoQuaderno, 1);
  return e.length ? e[0].data : null;
}

/**
 * Apre un senior: mansionario + kit + quaderno.
 * ⛔ Se il mansionario non c'è, si ferma: mettere al lavoro un senior senza il suo mansionario è
 * esattamente la malattia che questa porta cura. Meglio un errore rumoroso di un agente generico
 * con un nome addosso.
 * @param {string} nome
 * @param {string} radice
 */
export function leggiMansionario(nome, radice = radiceRepo()) {
  const p = percorsiSenior(nome, radice);
  const testo = leggiSePresente(p.mansionario);
  if (testo === null) {
    const vicini = elencoSenior(radice).filter((s) => s.includes(String(nome).split("-")[0])).slice(0, 5);
    throw new Error(
      `@${nome} non ha un mansionario in .claude/agents/${nome}.md — non lo metto al lavoro senza.` +
        (vicini.length ? ` Forse cercavi: ${vicini.join(", ")}.` : "")
    );
  }
  const kit = leggiSePresente(p.kit);
  const quaderno = leggiSePresente(p.quaderno);
  return {
    nome,
    percorso: p.mansionario,
    testo,
    descrizione: descrizioneDi(testo),
    kit: { percorso: p.kit, esiste: kit !== null },
    quaderno: { percorso: p.quaderno, esiste: quaderno !== null, esiti: esitiRecenti(quaderno, 3) },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ I FATTI VIVI — le entità nel prompt si CITANO dal registro, non si incollano (AR-102, AR-126)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * I fatti-chiave letti dalla loro unica casa. Il giro operativo seminava i senior con «Casa Linda» e
 * «l'ordine zombie €19,05» perché quei nomi erano scritti dentro il .js: il registro li aveva già
 * superati (negozio scartato, ordine annullato) e nessuno poteva accorgersene, perché il guardiano
 * della coerenza non guarda dentro .claude/workflows.
 * @param {string[]} ids
 * @param {string} radice
 * @returns {{id:string, nome:string, valore:string, aggiornato:string}[]}
 */
export function fattiVivi(ids = FATTI_DEL_GIRO, radice = radiceRepo()) {
  const r = leggiRegistroFatti(radice);
  // Se il registro non si è letto, la mancanza VA nel prompt: un elenco vuoto avrebbe la stessa
  // faccia di «nessun fatto da sapere», e il senior lavorerebbe a memoria credendo di essere informato.
  if (!r.ok) {
    return [{ id: "registro-non-letto", nome: "⚠️ Fatti-chiave NON letti", valore: `${r.motivo} — non dare per buono nessun valore che ricordi: chiedi o verifica`, aggiornato: "" }];
  }
  const per = new Map(r.fatti.map((f) => [f.id, f]));
  return ids
    .map((id) => per.get(id))
    .filter(Boolean)
    .map((f) => ({ id: f.id, nome: f.nome, valore: String(f.valore), aggiornato: f.aggiornato || "" }));
}

/**
 * Il registro dei fatti, letto una volta sola e con il verdetto sulla lettura attaccato.
 * Serve a non far uscire da un catch un elenco vuoto: un vuoto ha la stessa faccia di «non c'è niente
 * da sapere», ed è il modo in cui una fonte non letta diventa un verdetto intero.
 * @param {string} radice
 * @returns {{ok:boolean, motivo:string, fatti:object[]}}
 */
export function leggiRegistroFatti(radice = radiceRepo()) {
  const p = join(radice, "MyCity-Vault", "90-Memoria-AI", "registro-fatti.json");
  const grezzo = leggiSePresente(p);
  if (grezzo === null) return { ok: false, motivo: `registro dei fatti non trovato (${p})`, fatti: [] };
  try {
    const dati = JSON.parse(grezzo);
    return { ok: true, motivo: "", fatti: Array.isArray(dati.fatti) ? dati.fatti : [] };
  } catch (e) {
    return { ok: false, motivo: `registro dei fatti illeggibile: ${e.message}`, fatti: [] };
  }
}

/** I fatti vivi in forma di blocco da appendere a un prompt. Vuoto solo se non è stato chiesto nulla. */
export function bloccoFatti(fatti) {
  if (!fatti || !fatti.length) return "";
  const righe = fatti.map((f) => `- ${f.nome} → ${f.valore}${f.aggiornato ? ` (aggiornato ${f.aggiornato})` : ""}`);
  return [
    "## 📌 FATTI VIVI (fonte unica: MyCity-Vault/90-Memoria-AI/registro-fatti.json)",
    "Questi valgono più di qualunque cosa ricordi: se un tuo dato li contraddice, vincono loro.",
    ...righe,
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ LA PORTA — da un nome-reparto al prompt che riceve il modello
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Il prompt di un senior: il suo mansionario INTEGRALE, più il focus del giorno.
 *
 * Il focus si AGGIUNGE, non sostituisce: era questo il punto rotto. Un focus da una riga al posto di
 * 20 KB di mestiere costa poco in token e tanto in qualità — e il conto è già stato fatto: 21 KB di
 * mansionario sono ~5k token, il 3-10% di quello che consuma un agente che legge davvero i file. Si
 * paga il 5% per avere il senior invece di un generico col cartellino.
 *
 * Kit e quaderno non entrano interi (altri 24 KB + 9 KB a testa, e servono a metà lavoro, non prima):
 * entrano il loro percorso, l'ordine di aprirli, e le ultime lezioni del quaderno — che è la parte
 * che gli evita di rifare l'errore di ieri.
 *
 * @param {string} nome nome del reparto = nome del file in .claude/agents/
 * @param {{focus?:string, compito?:string, radice?:string, fatti?:object[], regole?:string}} opzioni
 * @returns {string}
 */
export function promptSenior(nome, opzioni = {}) {
  const radice = opzioni.radice || radiceRepo();
  const s = leggiMansionario(nome, radice);
  const focus = String(opzioni.focus || "").trim();
  const compito = String(opzioni.compito || "").trim();
  const regole = String(opzioni.regole || "").trim();
  const fatti = opzioni.fatti === undefined ? fattiVivi(FATTI_DEL_GIRO, radice) : opzioni.fatti;

  const rel = (p) => p.slice(radice.length + 1);
  const parti = [
    `Sei @${nome}, senior di MyCity. Qui sotto c'è il TUO mansionario, integrale: è chi sei e come si lavora.`,
    `Non è un riassunto e non è facoltativo — leggilo e comportati come dice, per tutto il compito.`,
    "",
    `────────── MANSIONARIO · ${rel(s.percorso)} ──────────`,
    s.testo.trim(),
    `────────── fine mansionario ──────────`,
    "",
  ];

  if (focus) {
    parti.push(
      "## 🎯 FOCUS DI OGGI",
      "Si AGGIUNGE al mansionario, non lo sostituisce: resti tu, con il tuo metodo, applicato a questo.",
      focus,
      ""
    );
  }
  if (compito) parti.push("## 📋 IL COMPITO", compito, "");

  const rituale = [`- il tuo KIT (il cervello allenato): \`${rel(s.kit.percorso)}\` — ${s.kit.esiste ? "aprilo con Read prima di produrre" : "⚠️ non esiste ancora: lavora senza, e dillo"}`];
  if (s.quaderno.esiste) {
    rituale.push(`- il tuo quaderno: \`${rel(s.quaderno.percorso)}\` — le tue ultime lezioni:`);
    if (s.quaderno.esiti.length) for (const e of s.quaderno.esiti) rituale.push(`  · ${e.data} — ${e.riga.slice(0, 240)}`);
    else rituale.push("  · (nessun ESITO ancora: sei al primo turno, lascia tu la prima riga)");
  } else {
    rituale.push(`- il tuo quaderno \`${rel(s.quaderno.percorso)}\` non esiste ancora: lo apri tu con il primo ESITO`);
  }
  parti.push("## 🧭 RITUALE D'INIZIO (Carta del Dipendente)", ...rituale, "");

  const bf = bloccoFatti(fatti);
  if (bf) parti.push(bf, "");
  if (regole) parti.push(regole, "");

  return parti.join("\n").trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ IL GUARDIANO — chi non passa dalla porta si vede
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le esenzioni: un file che resta fuori apposta scrive QUI il perché. Un'esenzione senza motivo è un
 * silenzio, ed è la cosa che questo modulo cura. Chiave: `<file>#<regola>`.
 */
export const ESENZIONI_PORTA = {};

/**
 * Le frasi che il registro dei fatti sta cacciando: valori vecchi che da qualche parte sono ancora
 * scritti. Il guardiano della coerenza (cervello/coerenza-fatti.mjs) le insegue nel vault, ma NON
 * guarda dentro .claude/workflows — ed è per questo che il giro ha continuato per mesi a seminare i
 * senior con un negozio scartato e un ordine annullato (AR-126). Qui la caccia entra anche nei
 * file-pilota, che sono prompt eseguibili: la stessa bugia, detta a chi lavora.
 * @param {string} radice
 * @returns {{id:string, pattern:string}[]}
 */
export function cacciaAperta(radice = radiceRepo()) {
  const r = leggiRegistroFatti(radice);
  // Registro illeggibile = questa regola non si può misurare. Chi chiama lo sa da `leggiRegistroFatti`
  // e lo dichiara cieco (il CLI esce 2): un elenco vuoto qui sarebbe un verde comprato.
  if (!r.ok) return [];
  const fuori = [];
  for (const f of r.fatti) {
    for (const c of f.caccia || []) {
      if (!c.chiusa && c.pattern) fuori.push({ id: f.id, pattern: String(c.pattern) });
    }
  }
  return fuori;
}

/** I percorsi assoluti scritti a mano in un testo: veri qui, falsi sul VPS (AR-435). */
export function percorsiAssoluti(testo) {
  const trovati = [];
  const righe = String(testo || "").split("\n");
  for (const [i, riga] of righe.entries()) {
    if (/^\s*\/\//.test(riga)) continue; // un commento che cita un percorso non pilota niente
    for (const m of riga.matchAll(/(?:'|"|`)((?:\/(?:home|root|opt|Users|srv|var|tmp)\/[^'"`\s]*)|(?:[A-Za-z]:\\\\?[^'"`\s]*))/g)) {
      trovati.push({ riga: i + 1, percorso: m[1] });
    }
  }
  return trovati;
}

/**
 * IL CONTRATTO DEI FILE-PILOTA. Tre regole, ognuna nata da un difetto vero.
 * @param {{nome:string, testo:string}[]} file i workflow, già letti
 * @param {{senior?:string[]}} ctx
 * @returns {{file:string, regola:string, dove:string, perche:string}[]}
 */
export function violazioniPorta(file, ctx = {}) {
  const senior = ctx.senior || elencoSenior();
  const fuori = [];
  const accusa = (nome, regola, dove, perche) => {
    if (ESENZIONI_PORTA[`${nome}#${regola}`]) return;
    fuori.push({ file: nome, regola, dove, perche });
  };

  for (const { nome, testo } of file) {
    const righe = String(testo).split("\n");
    const mette_al_lavoro = /\bagent\s*\(/.test(testo);
    const importa_la_porta = /from\s+['"][^'"]*prompt-senior\.mjs['"]/.test(testo);
    const usa_la_porta = /\bpromptSenior\s*\(/.test(testo);

    // ① PORTA UNICA (AR-434). Chi istanzia un agente costruisce un'identità: deve passare da qui,
    //    altrimenti il mansionario non arriva a chi lavora e nessuno può accorgersene.
    if (mette_al_lavoro && !(importa_la_porta && usa_la_porta)) {
      accusa(nome, "porta-unica", "file",
        "mette al lavoro un agente senza passare da cervello/prompt-senior.mjs: il mansionario non arriva a chi lavora");
    }

    // ② IDENTITÀ SCRITTA A MANO (AR-434). Un prompt letterale che si presenta come un senior è il
    //    prompt ricopiato: due parole al posto di 20 KB di mestiere.
    for (const [i, riga] of righe.entries()) {
      if (!/\bSei\b/.test(riga)) continue;
      const siPresentaSenior = /\bSei\b[^.\n]{0,40}\bsenior\b/i.test(riga);
      const repartoInterpolato = /@\$\{/.test(riga);
      const repartoLetterale = (riga.match(/@([a-z][a-z0-9-]{2,})/g) || [])
        .map((x) => x.slice(1))
        .some((x) => senior.includes(x));
      if (siPresentaSenior || repartoInterpolato || repartoLetterale) {
        accusa(nome, "identita-scritta-a-mano", `riga ${i + 1}: ${riga.trim().slice(0, 70)}`,
          "identità di reparto scritta nel prompt invece che composta dal mansionario con promptSenior()");
      }
    }

    // ③ PERCORSO A MANO (AR-435). Vero nella sessione cloud, falso sul VPS: il senior va a leggere
    //    la memoria a un indirizzo che non esiste e lavora al buio.
    for (const p of percorsiAssoluti(testo)) {
      accusa(nome, "percorso-scritto-a-mano", `riga ${p.riga}: ${p.percorso}`,
        "percorso assoluto cablato: qui esiste, sul VPS no — si risolve a runtime con radiceRepo()");
    }

    // ④ VALORE SUPERATO (AR-126). Un fatto è cambiato, il registro lo sta cacciando, e il vecchio
    //    valore è ancora qui dentro: il senior lo riceve come vero e ci lavora sopra.
    for (const c of ctx.caccia || []) {
      const dove = righe.findIndex((r) => r.includes(c.pattern));
      if (dove >= 0) {
        accusa(nome, "valore-superato", `riga ${dove + 1}: ${c.id}`,
          `il registro dei fatti ha già superato «${c.pattern.slice(0, 60)}»: qui arriva ancora al senior come vero`);
      }
    }
  }
  return fuori;
}

/** Legge i file-pilota dal disco. Separato dalla decisione apposta: la decisione si deve poter provare. */
export function leggiPiloti(cartella) {
  const dir = cartella || join(radiceRepo(), ".claude", "workflows");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(js|mjs)$/.test(f))
    .sort()
    .map((f) => ({ nome: f, testo: readFileSync(join(dir, f), "utf8") }));
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith("prompt-senior.mjs")) {
  const argv = process.argv.slice(2);
  const radice = radiceRepo();
  if (argv.includes("--elenco")) {
    const s = elencoSenior(radice);
    console.log(`${s.length} senior in .claude/agents/:\n${s.join(" · ")}`);
    process.exit(0);
  }
  if (argv.includes("--guardiano")) {
    const piloti = leggiPiloti();
    const registro = leggiRegistroFatti(radice);
    const fuori = violazioniPorta(piloti, { senior: elencoSenior(radice), caccia: cacciaAperta(radice) });
    if (argv.includes("--json")) {
      console.log(JSON.stringify({ controllati: piloti.length, registro_letto: registro.ok, violazioni: fuori }, null, 2));
    } else if (!fuori.length) {
      console.log(`✅ porta dei senior: ${piloti.length} file-pilota, tutti passano di qui.`);
    } else {
      console.log(`⛔ porta dei senior: ${fuori.length} passaggi fuori porta su ${piloti.length} file\n`);
      for (const v of fuori) console.log(`   · ${v.file} — ${v.regola} (${v.dove})\n     ${v.perche}`);
    }
    if (fuori.length) process.exit(1);
    // Il registro illeggibile non è un verde: la regola sui valori superati non si è potuta misurare.
    if (!registro.ok) {
      console.log(`⚪ la regola sui valori superati NON è stata misurata: ${registro.motivo}`);
      process.exit(2);
    }
    process.exit(0);
  }
  const nome = argv.find((a) => !a.startsWith("-"));
  if (!nome) {
    console.log("uso: node cervello/prompt-senior.mjs <reparto> [--focus=\"…\"] | --elenco | --guardiano");
    process.exit(2);
  }
  const focus = (argv.find((a) => a.startsWith("--focus=")) || "").slice("--focus=".length);
  console.log(promptSenior(nome, { focus, radice }));
}
