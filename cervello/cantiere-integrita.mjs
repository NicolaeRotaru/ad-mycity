#!/usr/bin/env node
// 🚧 IL LATO SOTTRAZIONE DEL CANTIERE — nessun difetto può sparire in silenzio.
//
// PERCHÉ ESISTE (il conto vero, misurato il 3/8):
// Il 3/7 la radiografia completa 12/12 aveva portato il cantiere a 78 difetti (commit 0398aa9d).
// Il giorno dopo, il commit afcb8d5d — «cutover ramo unico — passo 2: riversa la memoria viva
// memoria-ad → main» — lo ha riscritto a 24. **52 difetti sono spariti in un colpo solo, 48 dei
// quali erano ancora aperti**, e per un mese nessuno se n'è accorto: il blocco AR-045..AR-104
// continuava a essere CITATO nei quaderni dei senior e nei mansionari, ma nel Pannello non c'era
// più niente da aprire. Nicola l'ha visto prima della macchina («ci sono un casino di AR che non
// sono dentro il cantiere»).
//
// Il difetto NON è il cutover: è che il cantiere vive in un JSON monolitico riscritto per intero
// (AR-448), e una fusione che tiene un lato solo cancella righe senza che nessuno protesti. Tutti
// i guardiani del cantiere contano quello che C'È — nessuno chiedeva cosa NON c'è più.
//
// Cinque domande, tutte sul lato sottrazione:
//   ① un id che c'era nel ramo pubblicato è ancora qui?      (la perdita del 4/7)
//   ② due difetti hanno lo stesso id?                        (AR-447: due sessioni, un numero solo)
//   ③ un AR citato dalla macchina esiste nel cantiere?       (AR-451 e AR-503: riparati con tanto di
//                                                             PR, mai entrati nel registro)
//   ④ un difetto chiuso porta la data con l'ora?             (AR-724: 10 chiusure senza data, il 23/8,
//                                                             invisibili a ogni mese — e il voto della
//                                                             macchina era contato su quei libri)
//   ⑤ qualcuno scrive «chiuso» fuori dalla porta del timbro? (AR-724: la riga di codice che si
//                                                             riscrive il timbro per conto suo)
//
// ④ e ⑤ sono la stessa domanda fatta ai due estremi: al DATO, dove il buco l'ha fatto una mano in
// sessione, e al CODICE, dove lo farebbe una riga. Guardarne uno solo dice verde sull'altro.
//
// 🟢 Sola lettura. Exit 0 = ok · 1 = qualcosa è sparito · 2 = non ho potuto misurare.
//
// Uso: node cervello/cantiere-integrita.mjs [--json]

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { storiaDelRepo } from "./storia-git.mjs";
// AR-724 — le due domande sul TIMBRO di chiusura vivono nella casa del contratto, insieme alla
// porta che lo mette. Qui si fanno, perché è qui che il cancello del lotto guarda a ogni giro.
import { timbriStorti, attiFuoriDallaPorta } from "./contratto-scheda.mjs";

const JSON_MODE = process.argv.includes("--json");
const CANTIERE_REL = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";

/**
 * La forma canonica di un id del cantiere: `AR-` più ESATTAMENTE tre cifre.
 *
 * Perché tre e non «una o più»: `AR-9`, `AR-12`, `AR-99` compaiono nei quaderni come abbreviazioni
 * scritte a mano dei difetti a tre cifre corrispondenti, e `AR-1`/`AR-2` sono numeri di elenco
 * finiti dentro una frase. Contarli come id veri farebbe gridare al lupo a ogni giro su difetti che
 * esistono già col loro nome giusto. La forma canonica è quella che il cantiere usa davvero, e
 * questo guardiano difende quella.
 */
export const ID_CANONICO = /\bAR-\d{3}\b/g;

/** I difetti di un cantiere, qualunque sia l'involucro che li porta. */
export function difettiDi(cantiere) {
  if (!cantiere) return null;
  if (Array.isArray(cantiere)) return cantiere;
  if (Array.isArray(cantiere.difetti)) return cantiere.difetti;
  const primo = Object.values(cantiere).find((v) => Array.isArray(v));
  return Array.isArray(primo) ? primo : null;
}

/**
 * ① Gli id che c'erano PRIMA e adesso non ci sono più.
 *
 * Un difetto si chiude cambiando `stato`, non sparendo: finché resta nel file, il Pannello lo mostra
 * fra i chiusi e la sua prova può essere rieseguita. Un id che evapora è sempre una perdita, mai una
 * chiusura — ed è esattamente il modo in cui i 52 se ne sono andati.
 */
export function idsSpariti(prima, adesso) {
  const vecchi = difettiDi(prima);
  const nuovi = difettiDi(adesso);
  if (!vecchi || !nuovi) return null; // non misurato ≠ nessuna perdita
  const ci_sono = new Set(nuovi.map((d) => String(d?.id ?? "").trim()));
  return vecchi
    .map((d) => String(d?.id ?? "").trim())
    .filter((id) => id && !ci_sono.has(id));
}

/**
 * ② Gli id portati da più di un difetto (AR-447).
 *
 * Due sessioni aperte insieme leggono lo stesso «ultimo numero» e ne scrivono due: il secondo che
 * salva vince, e il cantiere si ritrova due difetti diversi sotto un id solo. Da fuori sembra che
 * uno dei due non sia mai esistito — è una sparizione anche questa, solo più difficile da vedere.
 */
export function idsDoppi(cantiere) {
  const difetti = difettiDi(cantiere);
  if (!difetti) return null;
  const visti = new Map();
  for (const d of difetti) {
    const id = String(d?.id ?? "").trim();
    if (!id) continue;
    visti.set(id, (visti.get(id) ?? 0) + 1);
  }
  return [...visti.entries()].filter(([, n]) => n > 1).map(([id, n]) => ({ id, volte: n }));
}

/**
 * I file VIVI della macchina in cui un AR citato conta come promessa.
 *
 * Esclude `cervello/test/`: lì gli id sono fixture sintetiche (numeri alti fuori scala, nati per
 * provare i guardiani stessi). È la stessa regola generale che serviva allo scanner dei segreti —
 * un perimetro per NATURA del file, non un elenco di nomi da tenere aggiornato a mano (AR-347).
 */
const CARTELLE_VIVE = ["cervello", "memoria-squadra", ".claude"];
const ESCLUSI = /^cervello\/test\//;
const ESTENSIONI = /\.(mjs|js|md|json)$/;

function fileVivi(leggiDir = readdirSync, statta = statSync) {
  const out = [];
  const scendi = (abs) => {
    let voci;
    try {
      voci = leggiDir(abs);
    } catch {
      return;
    }
    for (const v of voci) {
      if (v === "node_modules" || v === ".git") continue;
      const p = join(abs, v);
      let st;
      try {
        st = statta(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) scendi(p);
      else if (ESTENSIONI.test(v)) {
        const rel = relative(AD_ROOT, p);
        if (!ESCLUSI.test(rel)) out.push(rel);
      }
    }
  };
  for (const c of CARTELLE_VIVE) {
    const abs = join(AD_ROOT, c);
    if (existsSync(abs)) scendi(abs);
  }
  return out;
}

/**
 * ③ Gli AR che la macchina cita ma che nel cantiere non esistono.
 *
 * Il caso vero: AR-451 e AR-503 hanno un fix, un test dedicato, una voce in `mutanti.json` e — per
 * AR-451 — perfino una PR mergiata (#635). Nel cantiere non sono MAI entrati. Un difetto riparato
 * senza essere registrato non ha una data di nascita, non entra in nessun conteggio e non può
 * essere riaperto se la riparazione si smonta: è lavoro che esiste solo nella memoria di chi c'era.
 *
 * Pura: riceve l'elenco dei file e il modo di leggerli, così la prova non dipende da com'è il repo
 * oggi (un guardiano che diventa rosso perché qualcuno ha aggiunto un file non sta misurando la
 * sua regola).
 */
export function citatiNonRegistrati(cantiere, file, leggi) {
  const difetti = difettiDi(cantiere);
  if (!difetti) return null;
  const registrati = new Set(difetti.map((d) => String(d?.id ?? "").trim()));
  const trovati = new Map();
  for (const f of file) {
    let txt;
    try {
      txt = leggi(f);
    } catch {
      continue; // un file illeggibile non è una citazione mancante
    }
    for (const m of String(txt).matchAll(ID_CANONICO)) {
      const id = m[0];
      if (registrati.has(id)) continue;
      if (!trovati.has(id)) trovati.set(id, new Set());
      trovati.get(id).add(f);
    }
  }
  return [...trovati.entries()]
    .map(([id, dove]) => ({ id, dove: [...dove].sort().slice(0, 3) }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Il verdetto, separato dal modo di raccogliere i dati: così le prove possono descrivere uno stato
 * senza toccare né git né il disco.
 *
 * `cieco` non è mai un verde. Se non ho potuto leggere il cantiere di prima, la risposta onesta è
 * «non ho misurato» (exit 2), non «niente è sparito» — è il vizio che AR-473 ha già pagato una volta.
 */
export function verdetto({ spariti = null, doppi = null, citati = null, senzaData = null, dataSecca = null, tettoSecco = null, attiFuori = null, cecita = [], base = "" } = {}) {
  const righe = [];
  if (cecita.length) {
    for (const c of cecita) righe.push(`⚪ ${c}`);
  }
  if (spariti?.length) {
    righe.push(
      `❌ ${spariti.length} difetti erano nel cantiere pubblicato e adesso non ci sono più: ${spariti.slice(0, 12).join(", ")}${spariti.length > 12 ? " …" : ""}`,
    );
    righe.push(
      "   Un difetto si CHIUDE cambiando stato, non sparendo. Se è una fusione che ha tenuto un lato solo, rimetti le righe perse prima di consegnare (il 4/7 così se ne andarono 52).",
    );
  }
  if (doppi?.length) {
    righe.push(
      `❌ ${doppi.length} id portati da più di un difetto (AR-447): ${doppi.map((d) => `${d.id}×${d.volte}`).join(", ")}`,
    );
    righe.push("   Due sessioni hanno preso lo stesso numero: uno dei due difetti è invisibile. Rinumera il più recente.");
  }
  if (citati?.length) {
    righe.push(`❌ ${citati.length} AR citati dalla macchina e mai registrati nel cantiere:`);
    for (const c of citati.slice(0, 10)) righe.push(`   · ${c.id} — citato in ${c.dove.join(", ")}`);
    if (citati.length > 10) righe.push(`   · … e altri ${citati.length - 10}`);
    righe.push("   Un difetto riparato ma mai registrato non ha nascita, non entra nei conteggi e non si può riaprire.");
  }
  // ④ Due famiglie, due conseguenze diverse — e la differenza è misurabile, non di comodo.
  // Una chiusura SENZA data non appartiene a nessun mese: sparisce dai libri su cui è calcolato il
  // voto che decide se la macchina può aprire ricerche nuove. Rosso, subito.
  // Una chiusura con la DATA SECCA il suo mese ce l'ha: viola la regola dell'ora di CLAUDE.md, non
  // buca i conti. Sono 24 ereditate, e un cancello sempre rosso si impara ad aggirarlo: quindi
  // stanno sotto un tetto che scende e non risale, come `prova_debole`.
  if (senzaData?.length) {
    righe.push(`❌ ${senzaData.length} difetti CHIUSI senza nessuna data (AR-724): ${senzaData.map((s) => s.id).join(", ")}`);
    righe.push(
      "   Una chiusura senza data non appartiene a nessun mese: sparisce dal voto che decide se la macchina può aprire ricerche nuove. Timbrala con `timbraChiusura` — la data del commit che l'ha pubblicata è una fonte, non un'invenzione.",
    );
  }
  if (dataSecca?.length && tettoSecco === null) {
    righe.push(
      `⚪ ${dataSecca.length} chiusure con la data secca, e non ho un tetto misurato con cui confrontarle: non ho giudicato (cervello/tetti-lotto.json → timbro_secco).`,
    );
  } else if (dataSecca?.length > (tettoSecco ?? 0)) {
    righe.push(`❌ chiusure con la data secca: ${dataSecca.length}, oltre il tetto di ${tettoSecco} (AR-724).`);
    for (const s of dataSecca.slice(0, 10)) righe.push(`   · ${s.id} — chiuso_il: ${s.chiuso_il}`);
    if (dataSecca.length > 10) righe.push(`   · … e altre ${dataSecca.length - 10}`);
    righe.push("   La regola dell'ora vale anche sul timbro: «AAAA-MM-GG HH:MM». Il tetto scende e non risale.");
  } else if (dataSecca?.length) {
    righe.push(`🟡 ${dataSecca.length} chiusure con la data secca, sotto il tetto di ${tettoSecco}: debito dichiarato, in calo.`);
  }
  if (attiFuori?.length) {
    righe.push(`❌ ${attiFuori.length} righe scrivono «chiuso» fuori dalla porta del timbro (AR-724):`);
    for (const a of attiFuori.slice(0, 10)) righe.push(`   · ${a.file}:${a.riga} — ${a.testo}`);
    if (attiFuori.length > 10) righe.push(`   · … e altre ${attiFuori.length - 10}`);
    righe.push(
      "   Passa da `timbraChiusura` di cervello/contratto-scheda.mjs, oppure dichiara la riga esente scrivendoci accanto `timbro-esente: <perché>`.",
    );
  }
  const seccheOltre = Boolean(dataSecca?.length && tettoSecco !== null && dataSecca.length > tettoSecco);
  const rotto = Boolean(spariti?.length || doppi?.length || citati?.length || senzaData?.length || seccheOltre || attiFuori?.length);
  // Il cieco vale 2 solo se NON c'è già un rosso vero: un rosso misurato è più informativo di una
  // cecità parziale, e schiacciarlo a «non ho misurato» perderebbe l'unica cosa che so per certo.
  const esce = rotto ? 1 : cecita.length ? 2 : 0;
  if (!righe.length) {
    righe.push(
      `✅ nessun difetto sparito, nessun id doppio, nessun AR orfano, ogni chiusura col suo timbro (confronto: ${base || "—"})`,
    );
  }
  return {
    esce,
    righe,
    spariti: spariti?.length ?? null,
    doppi: doppi?.length ?? 0,
    citati: citati?.length ?? 0,
    senza_data: senzaData?.length ?? 0,
    data_secca: dataSecca?.length ?? 0,
    tetto_secco: tettoSecco,
    atti_fuori: attiFuori?.length ?? 0,
  };
}

/**
 * Il tetto delle chiusure con la data secca, dal file che tiene tutti i tetti del cancello.
 *
 * `null` vuol dire «non l'ho misurato», e nel verdetto diventa un ⚪, non un verde: un tetto che
 * manca non è un permesso. Chi lo abbassa è `cancello-lotto.mjs --aggiorna-tetti`, che scrive il
 * minimo fra il tetto e la misura di adesso — così scende e non risale.
 */
function leggiTettoSecco() {
  try {
    const t = JSON.parse(readFileSync(join(AD_ROOT, "cervello/tetti-lotto.json"), "utf8"));
    return Number.isInteger(t?.timbro_secco) ? t.timbro_secco : null;
  } catch {
    return null;
  }
}

/** Il riferimento con cui confrontarsi: l'antenato comune col ramo pubblicato, o l'ultimo commit. */
function basePerConfronto() {
  const storia = storiaDelRepo(AD_ROOT);
  if (storia.intera) {
    const mb = spawnSync("git", ["merge-base", "HEAD", "origin/main"], { cwd: AD_ROOT, encoding: "utf8" });
    if (mb.status === 0 && mb.stdout.trim()) {
      return { spec: mb.stdout.trim(), nota: "antenato comune con origin/main", pieno: true };
    }
  }
  return {
    spec: "HEAD",
    nota: `${storia.motivo} → confronto con l'ultimo commit locale: vedo solo le sparizioni non ancora committate`,
    pieno: false,
  };
}

function gitShow(spec) {
  const r = spawnSync("git", ["show", spec], { cwd: AD_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

function main() {
  const cecita = [];
  let adesso = null;
  try {
    adesso = JSON.parse(readFileSync(join(AD_ROOT, CANTIERE_REL), "utf8"));
  } catch (e) {
    const msg = `cantiere-difetti.json non leggibile (${e.message}): non ho misurato niente`;
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, cieco: true, errore: msg }, null, 2));
    else console.error(`⚪ ${msg}`);
    process.exit(2);
  }

  const base = basePerConfronto();
  if (!base.pieno) cecita.push(base.nota);

  const primaTxt = gitShow(`${base.spec}:${CANTIERE_REL}`);
  let prima = null;
  try {
    prima = primaTxt ? JSON.parse(primaTxt) : null;
  } catch {
    prima = null;
  }
  if (!prima) cecita.push("il cantiere del riferimento non è leggibile: la domanda «è sparito qualcosa?» non ha misurato");

  const spariti = prima ? idsSpariti(prima, adesso) : null;
  const doppi = idsDoppi(adesso) ?? [];
  const vivi = fileVivi();
  const leggi = (f) => readFileSync(join(AD_ROOT, f), "utf8");
  const citati = citatiNonRegistrati(adesso, vivi, leggi) ?? [];
  const storti = timbriStorti(difettiDi(adesso) ?? []);
  const senzaData = storti.filter((s) => !s.chiuso_il);
  const dataSecca = storti.filter((s) => s.chiuso_il);
  const tettoSecco = leggiTettoSecco();
  // Solo il codice che ESEGUE: nei `.md` la frase sta in una spiegazione, e nel cantiere stesso
  // `"stato": "chiuso"` compare a centinaia — sono dati, non atti.
  const attiFuori = attiFuoriDallaPorta(vivi.filter((f) => /\.(mjs|js)$/.test(f)), leggi);

  const v = verdetto({ spariti, doppi, citati, senzaData, dataSecca, tettoSecco, attiFuori, cecita, base: base.nota });

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        { ok: v.esce === 0, ora: nowPiacenza(), base: base.nota, spariti, doppi, citati, senza_data: senzaData, data_secca: dataSecca, tetto_secco: tettoSecco, atti_fuori: attiFuori },
        null,
        2,
      ),
    );
  } else {
    console.log(`\n🚧 Integrità del cantiere (lato sottrazione) — ${nowPiacenza()}`);
    for (const r of v.righe) console.log(`   ${r}`);
  }
  process.exit(v.esce);
}

if (process.argv[1] && process.argv[1].endsWith("cantiere-integrita.mjs")) main();
