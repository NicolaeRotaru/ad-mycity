#!/usr/bin/env node
// 🎽 CHI VA IN TURNO OGGI — l'elenco dei senior che il giro mette al lavoro, preso dai DATI.
//
// PERCHÉ ESISTE (lotto corsia G — AR-187, AR-620, AR-126).
//
// ① Il motore che ogni giorno produce le mosse da firmare chiamava SEI nomi scritti a mano dentro
//    .claude/workflows/giro-operativo.js. L'organigramma è passato da 42 a 120 senior e quella riga
//    non è mai stata riaperta: 114 senior su 120 non sono mai entrati in turno. Creare un agente e
//    metterlo al lavoro erano due atti separati, e solo il primo aveva una procedura.
//
// ② Quando un senior passa il lavoro a un collega (`PASSO-A @collega` nella Sala Operativa) nessuno
//    lo raccoglie: sei passaggi su sette caduti nel vuoto, tutti verso lo stesso collega, tutti mai
//    convocati. Un passaggio non raccolto non è una dimenticanza del collega: è che **nessun motore
//    lo rimette in turno**. Qui il passaggio pendente diventa il primo motivo di convocazione.
//
// ③ Il focus di ogni motore conteneva le entità scritte a mano nel .js — un negozio scartato e un
//    ordine annullato — e nessun guardiano poteva accorgersene, perché il controllo di coerenza dei
//    fatti non guarda dentro .claude/workflows. Qui il focus si compone dal numero che il senior
//    possiede in OKR-Squadra e dai fatti vivi del registro: nessuna entità è scritta in questo file.
//
// Tutto quello che c'è qui è una funzione pura sui file veri: si può provare senza far girare il
// giro (che costa e sveglia il modello). Il workflow chiama e basta.
//
// Uso da riga di comando:
//   node cervello/turno-senior.mjs              # chi va in turno oggi e perché
//   node cervello/turno-senior.mjs --handoff    # i passaggi lasciati cadere nel vuoto
//   node cervello/turno-senior.mjs --json

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { elencoSenior, radiceRepo, ultimoEsito, percorsiSenior } from "./prompt-senior.mjs";

/** Quanti senior mette al lavoro un giro. Sei come oggi: il tetto è il costo, non l'organigramma. */
export const QUANTI_PER_GIRO = 6;
/** Oltre questo, un passaggio è archeologia: si segnala, non si convoca. */
export const GIORNI_HANDOFF_VIVO = 90;

/** Chi non è un reparto: l'umano e l'AD stessa non si mettono in turno. */
const NON_REPARTI = new Set(["nicola", "ad", "tutti", "team", "squadra"]);

const leggiSePresente = (p) => {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ① IL NUMERO CHE OGNUNO POSSIEDE — letto da OKR-Squadra, non ricopiato
// ─────────────────────────────────────────────────────────────────────────────

/**
 * I senior che possiedono un numero, dalla tabella di OKR-Squadra.md.
 * Il nome si riconosce per intero (`qa-designer` non è `qa`), quindi i nomi lunghi si provano prima.
 * @param {string} testoOkr
 * @param {string[]} senior
 * @returns {{key:string, kpi:string, target:string}[]}
 */
export function senioriDaOkr(testoOkr, senior) {
  const nomi = [...senior].sort((a, b) => b.length - a.length);
  const visti = new Set();
  const fuori = [];
  for (const riga of String(testoOkr || "").split("\n")) {
    if (!riga.trim().startsWith("|")) continue;
    const celle = riga.split("|").map((c) => c.trim());
    if (celle.length < 4) continue;
    const prima = celle[1] || "";
    if (/^-+$/.test(prima) || /^senior$/i.test(prima)) continue; // intestazione e riga di separazione
    const key = nomi.find((n) => new RegExp(`(^|[^a-z0-9-])${n}([^a-z0-9-]|$)`).test(prima));
    if (!key || visti.has(key)) continue;
    visti.add(key);
    fuori.push({ key, kpi: celle[2] || "", target: celle[3] || "" });
  }
  return fuori;
}

/**
 * I motori di soldi, letti dall'organigramma di CLAUDE.md (le sezioni «Motori di soldi & crescita»).
 *
 * Serve a non ribaltare il difetto: aprire il turno a tutti i 120 senza una quota riservata ai
 * motori significherebbe che per venti giri di fila lavorano solo i reparti fermi da sempre — e il
 * giro operativo, che è il motore dei soldi dell'azienda, smetterebbe di occuparsi di ordini e
 * negozi. Metà turno resta sui soldi, metà apre la squadra.
 *
 * La fonte è il manuale che l'AD già mantiene: nessun elenco di nomi vive in questo file.
 * @param {string} testoClaudeMd
 * @param {string[]} senior
 * @returns {string[]}
 */
export function motoriDiSoldi(testoClaudeMd, senior) {
  const fuori = [];
  let dentro = false;
  for (const riga of String(testoClaudeMd || "").split("\n")) {
    const intestazione = /^\s*\*\*/.test(riga) && /:\s*$|\)\s*:\s*$|:\*\*|\*\*\s*\(/.test(riga);
    if (intestazione) dentro = /Motori di soldi/i.test(riga);
    if (!dentro || !/^\s*[-*]\s/.test(riga)) continue;
    // Solo il PRIMO nome in grassetto: è il soggetto della voce. Gli altri della riga sono i rimandi
    // «(→ per questo usa @altro)», e prenderli faceva passare per motore di soldi mezza azienda —
    // security compariva fra i motori solo perché un motore le rimanda i webhook.
    const m = riga.match(/\*\*([a-z][a-z0-9-]+)\*\*/);
    if (m && senior.includes(m[1]) && !fuori.includes(m[1])) fuori.push(m[1]);
  }
  return fuori;
}

// ─────────────────────────────────────────────────────────────────────────────
// ② I PASSAGGI CADUTI NEL VUOTO — chi aspetta una risposta da un collega (AR-620)
// ─────────────────────────────────────────────────────────────────────────────

/** Tutte le menzioni `@qualcuno` di una riga, in minuscolo. */
const menzioni = (riga) => (riga.match(/@([A-Za-z][A-Za-z0-9_-]*)/g) || []).map((x) => x.slice(1).toLowerCase());

/**
 * I passaggi di lavoro scritti nella Sala Operativa, con chi li ha lasciati e a chi.
 * Formati veri visti nel file: `· @seo · PASSO-A · @tech — testo` e `· @frontend-dev · PASSO-A @Nicola · testo`.
 * @param {string} testoSala
 * @param {{senior:string[]}} ctx
 * @returns {{data:string, da:string, a:string, testo:string, riga:number}[]}
 */
export function handoffDellaSala(testoSala, ctx = {}) {
  const senior = ctx.senior || elencoSenior();
  const fuori = [];
  for (const [i, riga] of String(testoSala || "").split("\n").entries()) {
    if (!/PASSO-A/.test(riga)) continue;
    const data = (riga.match(/(\d{4}-\d{2}-\d{2})/) || [])[1];
    if (!data) continue;
    const [prima, dopo] = riga.split("PASSO-A");
    const da = menzioni(prima).find((m) => senior.includes(m) || NON_REPARTI.has(m)) || "";
    const testo = String(dopo || "").replace(/^[\s·—–:-]+/, "").trim();
    for (const a of new Set(menzioni(dopo))) {
      if (!senior.includes(a) || a === da) continue; // a Nicola/AD non si "passa" un turno
      fuori.push({ data, da, a, testo: testo.slice(0, 300), riga: i + 1 });
    }
  }
  return fuori;
}

/** Le righe della Sala con chi le ha scritte e quando: serve per sapere se un collega si è fatto vivo. */
export function vociDellaSala(testoSala, ctx = {}) {
  const senior = ctx.senior || elencoSenior();
  const fuori = [];
  for (const riga of String(testoSala || "").split("\n")) {
    const data = (riga.match(/(\d{4}-\d{2}-\d{2})/) || [])[1];
    if (!data) continue;
    const autore = menzioni(riga.split("PASSO-A")[0]).find((m) => senior.includes(m));
    if (autore) fuori.push({ data, autore });
  }
  return fuori;
}

/**
 * I passaggi che nessuno ha raccolto: il collega non ha più scritto niente nella Sala da quel giorno
 * in poi. È il criterio più generoso possibile verso il collega — gli basta essersi fatto vivo, non
 * serve che abbia chiuso il lavoro — ed è già abbastanza per trovarne sei su sette caduti nel vuoto.
 * @param {string} testoSala
 * @param {{senior?:string[], oggi?:string, giorniMax?:number}} ctx
 */
export function handoffPendenti(testoSala, ctx = {}) {
  const senior = ctx.senior || elencoSenior();
  const oggi = ctx.oggi || new Date().toISOString().slice(0, 10);
  const giorniMax = ctx.giorniMax ?? GIORNI_HANDOFF_VIVO;
  const tutti = handoffDellaSala(testoSala, { senior });
  const voci = vociDellaSala(testoSala, { senior });
  const pendenti = tutti.filter((h) => {
    if (giorniDa(h.data, oggi) > giorniMax) return false;
    return !voci.some((v) => v.autore === h.a && v.data >= h.data);
  });
  // Il più vecchio per primo: chi aspetta da più tempo entra in turno prima.
  return pendenti.sort((x, y) => (x.data < y.data ? -1 : x.data > y.data ? 1 : 0));
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ CHI È FERMO — l'ultima riga ESITO di ogni quaderno
// ─────────────────────────────────────────────────────────────────────────────

/** Giorni fra due date AAAA-MM-GG. Se la data manca, un numero grande: «fermo da sempre». */
export function giorniDa(data, oggi) {
  if (!data) return 99999;
  const a = Date.parse(`${data}T00:00:00Z`);
  const b = Date.parse(`${oggi}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 99999;
  return Math.round((b - a) / 86400000);
}

/**
 * L'ultimo ESITO di ogni senior: la prova che ha lavorato davvero. Un quaderno fermo è il segnale
 * che quel senior non entra mai in turno — il metro che mancava (l'organigramma era misurato in
 * anagrafica: esiste, ha un KPI, non è doppione; mai in attività).
 * @param {string} radice
 * @param {string[]} senior
 * @returns {Map<string, string|null>}
 */
export function ultimiEsitiSenior(radice = radiceRepo(), senior = elencoSenior(radice)) {
  const m = new Map();
  for (const nome of senior) {
    const p = percorsiSenior(nome, radice);
    m.set(nome, ultimoEsito(leggiSePresente(p.quaderno)));
  }
  return m;
}

/**
 * I senior che non lasciano una riga ESITO da troppo tempo: o è una posizione da chiudere, o è uno
 * che nessun motore ha mai convocato. È il metro che mancava — l'organigramma era misurato in
 * anagrafica (esiste, ha un KPI, non è doppione) e mai in attività (AR-187).
 * @param {{radice?:string, oggi?:string, giorni?:number}} opzioni
 * @returns {{key:string, ultimo:string|null, fermoDa:number|null}[]}
 */
export function senioriFermi(opzioni = {}) {
  const radice = opzioni.radice || radiceRepo();
  const oggi = opzioni.oggi || new Date().toISOString().slice(0, 10);
  const giorni = opzioni.giorni ?? 30;
  const senior = elencoSenior(radice);
  const esiti = ultimiEsitiSenior(radice, senior);
  return senior
    .map((key) => ({ key, ultimo: esiti.get(key) || null, fermoDa: esiti.get(key) ? giorniDa(esiti.get(key), oggi) : null }))
    .filter((v) => v.ultimo === null || v.fermoDa > giorni)
    .sort((a, b) => (b.fermoDa ?? 1e9) - (a.fermoDa ?? 1e9));
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ IL TURNO — chi lavora oggi, e con che focus
// ─────────────────────────────────────────────────────────────────────────────

/** Ruota una lista in base al giorno: a parità di attesa, ogni giro parte da un punto diverso. */
export function rotazioneDelGiorno(lista, oggi) {
  if (!lista.length) return [];
  const giorno = Math.max(0, Math.floor(Date.parse(`${oggi}T00:00:00Z`) / 86400000)) || 0;
  const k = giorno % lista.length;
  return [...lista.slice(k), ...lista.slice(0, k)];
}

/** Il focus di un senior in turno: il suo numero + il motivo per cui è stato chiamato oggi. */
export function focusDelTurno(voce) {
  const righe = [];
  if (voce.motivo === "passaggio-da-raccogliere" && voce.handoff) {
    righe.push(
      `RACCOGLI IL PASSAGGIO che @${voce.handoff.da} ti ha lasciato il ${voce.handoff.data} e che nessuno ha ancora preso:`,
      `«${voce.handoff.testo}»`,
      "Prima mossa: chiudilo, oppure dì in una riga perché non si può e chi deve decidere. Un passaggio lasciato cadere costa più di un lavoro fatto male."
    );
  }
  if (voce.kpi) {
    righe.push(`Il numero che possiedi (OKR-Squadra): ${voce.kpi}${voce.target ? ` — target: ${voce.target}` : ""}.`);
  } else {
    righe.push("Non possiedi ancora un numero in OKR-Squadra: proponi TU quale numero possiedi e la prima mossa che lo muove.");
  }
  if (voce.motivo === "rotazione") {
    righe.push(
      voce.fermoDa === null
        ? "Non hai mai lasciato una riga ESITO nel tuo quaderno: è il tuo primo turno."
        : `Il tuo quaderno è fermo da ${voce.fermoDa} giorni: sei in turno per rotazione, non per emergenza.`
    );
  }
  righe.push("Proponi le mosse a più alto ritorno per l'azienda ORA, fondate sui dati reali. Se un dato manca, dillo: non inventarlo.");
  return righe.join("\n");
}

/**
 * L'elenco dei senior in turno, dai dati. Ordine di priorità:
 *   ① chi l'AD convoca esplicitamente (sentinella scattata, richiesta di Nicola)
 *   ② chi ha un passaggio di un collega non ancora raccolto (AR-620)
 *   ③ i motori di soldi, a rotazione, fino a metà turno — il giro resta il motore dei ricavi
 *   ④ rotazione fra chi possiede un numero in OKR-Squadra, il più fermo per primo
 *   ⑤ riempimento con gli altri senior, il più fermo per primo (così nessuno resta fuori per sempre)
 *
 * @param {{radice?:string, oggi?:string, quanti?:number, convocati?:string[]}} opzioni
 * @returns {{turno:object[], copertura:object}}
 */
export function turnoDelGiro(opzioni = {}) {
  const radice = opzioni.radice || radiceRepo();
  const oggi = opzioni.oggi || new Date().toISOString().slice(0, 10);
  const quanti = opzioni.quanti ?? QUANTI_PER_GIRO;
  const senior = elencoSenior(radice);
  const okr = senioriDaOkr(leggiSePresente(join(radice, "MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md")), senior);
  const perOkr = new Map(okr.map((o) => [o.key, o]));
  const motori = motoriDiSoldi(leggiSePresente(join(radice, "CLAUDE.md")), senior);
  const sala = leggiSePresente(join(radice, "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md"));
  const pendenti = handoffPendenti(sala, { senior, oggi });
  const esiti = ultimiEsitiSenior(radice, senior);

  const scelti = new Map();
  const aggiungi = (key, motivo, tetto, extra = {}) => {
    if (!senior.includes(key) || scelti.has(key) || scelti.size >= Math.min(tetto, quanti)) return;
    const o = perOkr.get(key);
    const fermoDa = esiti.get(key) ? giorniDa(esiti.get(key), oggi) : null;
    const voce = { key, motivo, kpi: o?.kpi || "", target: o?.target || "", fermoDa, motore: motori.includes(key), ...extra };
    voce.focus = focusDelTurno(voce);
    scelti.set(key, voce);
  };

  for (const c of opzioni.convocati || []) aggiungi(c, "convocato", quanti);
  for (const h of pendenti) aggiungi(h.a, "passaggio-da-raccogliere", quanti, { handoff: h });

  // Il più fermo per primo; a parità, l'ordine ruota col giorno così ogni giro ne pesca altri.
  const perAttesa = (a, b) => {
    const fa = esiti.get(a) ? giorniDa(esiti.get(a), oggi) : 99999;
    const fb = esiti.get(b) ? giorniDa(esiti.get(b), oggi) : 99999;
    return fb - fa;
  };
  const inCoda = (lista) => rotazioneDelGiorno(lista, oggi).sort(perAttesa);

  // Metà turno ai motori di soldi, e dentro quella metà tre criteri diversi apposta:
  //   · il capofila dell'organigramma (il primo elencato in CLAUDE.md: è la priorità dichiarata);
  //   · uno che ruota col giorno, così in una settimana passano tutti;
  //   · il più dimenticato, che è il modo in cui un motore smette di esistere senza che nessuno lo dica.
  // Un criterio solo li avrebbe schiacciati: per attesa lavorerebbero solo i mai usati, per ordine
  // solo i primi due — ed è la stessa forma del difetto che stiamo curando, con un'altra faccia.
  const quotaMotori = Math.max(1, Math.ceil(quanti / 2));
  let motoriPresi = 0;
  const aggiungiMotore = (key, tetto) => {
    if (motoriPresi >= tetto) return;
    const prima = scelti.size;
    aggiungi(key, "motore-di-soldi", quanti);
    if (scelti.size > prima) motoriPresi++;
  };
  if (motori.length) aggiungiMotore(motori[0], quotaMotori);
  for (const k of rotazioneDelGiorno(motori, oggi)) aggiungiMotore(k, Math.max(1, quotaMotori - 1));
  for (const k of inCoda(motori)) aggiungiMotore(k, quotaMotori);

  for (const k of inCoda(okr.map((o) => o.key))) aggiungi(k, "rotazione", quanti);
  for (const k of inCoda(senior.filter((s) => !perOkr.has(s)))) aggiungi(k, "mai-in-turno", quanti);

  const turno = [...scelti.values()];
  return {
    turno,
    copertura: {
      senior: senior.length,
      perGiro: quanti,
      motoriInTurno: turno.filter((v) => v.motore).length,
      giriPerPassareTutti: quanti > 0 ? Math.ceil(senior.length / quanti) : 0,
      passaggiPendenti: pendenti.length,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith("turno-senior.mjs")) {
  const radice = radiceRepo();
  const argv = process.argv.slice(2);
  if (argv.includes("--fermi")) {
    const fermi = senioriFermi({ radice });
    if (argv.includes("--json")) console.log(JSON.stringify(fermi, null, 2));
    else {
      console.log(`🪑 ${fermi.length} senior su ${elencoSenior(radice).length} senza una riga ESITO da oltre 30 giorni:\n`);
      for (const f of fermi.slice(0, 30)) console.log(`   · @${f.key} — ${f.ultimo ? `ultimo esito ${f.ultimo} (${f.fermoDa} giorni fa)` : "mai"}`);
      if (fermi.length > 30) console.log(`   … e altri ${fermi.length - 30}`);
      console.log("\n   O è una posizione da chiudere, o è uno che nessun motore ha mai convocato.");
    }
    process.exit(0);
  }
  if (argv.includes("--handoff")) {
    const sala = leggiSePresente(join(radice, "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md"));
    const p = handoffPendenti(sala, { senior: elencoSenior(radice) });
    if (argv.includes("--json")) console.log(JSON.stringify(p, null, 2));
    else if (!p.length) console.log("✅ nessun passaggio lasciato cadere: ogni collega si è fatto vivo.");
    else {
      console.log(`⚠️ ${p.length} passaggi mai raccolti:\n`);
      for (const h of p) console.log(`   · ${h.data} · @${h.da} → @${h.a} — ${h.testo.slice(0, 90)}`);
    }
    process.exit(0);
  }
  const { turno, copertura } = turnoDelGiro({ radice });
  if (argv.includes("--json")) {
    console.log(JSON.stringify({ turno, copertura }, null, 2));
  } else {
    console.log(`🎽 in turno oggi (${turno.length} di ${copertura.senior} senior · tutti passano in ${copertura.giriPerPassareTutti} giri):\n`);
    for (const v of turno) console.log(`   · @${v.key} — ${v.motivo}${v.kpi ? ` · ${v.kpi}` : ""}`);
    if (copertura.passaggiPendenti) console.log(`\n   ⚠️ ${copertura.passaggiPendenti} passaggi fra colleghi ancora da raccogliere`);
  }
}
