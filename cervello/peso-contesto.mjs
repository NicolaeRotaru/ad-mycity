#!/usr/bin/env node
// AR-199 — il costo del contesto diventa un numero sorvegliato.
//
// La causa-radice del difetto, alla quinta domanda: «la macchina ha un contratto sul CONTENUTO della
// memoria e nessuno sul suo COSTO — la dimensione del contesto non è di nessuno». `vault-sanita`
// controlla che i file siano leggibili, non che siano sostenibili.
//
// Questo guardiano misura i byte dei file VIVI — quelli che il giro ha l'ordine di leggere
// (`cervello/giro.md`) e che la Cabina spedisce al browser — e fallisce quando uno **cresce** oltre
// il tetto dichiarato in `cervello/peso-contesto.json`.
//
// Il tetto SCENDE, non si alza: è la stessa regola di `malattie.json`. Dopo una potatura
// (`node cervello/pota-memoria.mjs --applica`) si rigenera con `--aggiorna` e il nuovo livello, più
// basso, diventa il nuovo massimo. Alzarlo è una decisione visibile, non un effetto collaterale.
//
// 🟢 Sola lettura.
// Uso: node cervello/peso-contesto.mjs [--json] [--aggiorna]
// Exit (AR-322): 0 = sotto i tetti · 1 = un file è cresciuto · 2 = non ho potuto misurare.

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { perimetroScoperto } from "./finestra-misura.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.PESO_REPO || join(QUI, "..");
const TETTI = process.env.PESO_TETTI || join(QUI, "peso-contesto.json");
const JSON_MODE = process.argv.includes("--json");
const AGGIORNA = process.argv.includes("--aggiorna");

// ─────────────────────────────────────────────────────────────────────────────
// AR-425 — IL PERIMETRO SI MISURA, NON SI DICHIARA
// ─────────────────────────────────────────────────────────────────────────────
// Fino a oggi l'elenco dei file da pesare e l'elenco dei tetti erano LA STESSA LISTA, scritta a
// mano: quattro file. Chi non aveva un tetto non veniva nemmeno misurato — e i file più grossi che
// il giro rilegge a ogni passata (`registro-fatti.json`, `AUTO-ANALISI.md`, i JSON che la Cabina
// spedisce al browser) non ne avevano. Il guardiano dichiarava una copertura che coincideva con la
// propria configurazione, quindi non poteva accorgersi di ciò che era fuori: stesso difetto di
// forma di AR-339 (lo scanner che dichiarava 2040 file su 2014 letti).
//
// Adesso il perimetro si DERIVA dalle due fonti che decidono davvero cosa entra nel contesto:
//   ① `cervello/giro.md` — l'ordine scritto di quali file rileggere a ogni giro;
//   ② `pannello/src/**` — ciò che la Cabina spedisce al browser.
// I tetti restano il cricchetto che scende, ma non decidono più CHI viene pesato.
const FONTI_PERIMETRO = [
  { rel: "cervello/giro.md", perche: "il giro ha l'ordine di rileggerlo a ogni passata" },
  { rel: "pannello/src", perche: "la Cabina lo spedisce al browser" },
];

/**
 * I file di memoria citati in un testo, in forma canonica (`MyCity-Vault/90-Memoria-AI/…`).
 * Pura: le si passa il testo, non il percorso — così un test la prova senza toccare il disco.
 */
export function percorsiCitati(testo) {
  const re = /(?:MyCity-Vault\/)?(90-Memoria-AI\/[A-Za-z0-9._/-]+\.(?:md|json))/g;
  const out = new Set();
  let m;
  while ((m = re.exec(String(testo ?? ""))) !== null) out.add(`MyCity-Vault/${m[1]}`);
  return [...out];
}

/** Tutti i file sotto una cartella (ricorsivo, con un tetto di sicurezza sulla profondità). */
function fileSotto(abs, ext = /\.(ts|tsx|js|jsx|mjs|md)$/) {
  const out = [];
  const stack = [abs];
  while (stack.length) {
    const dir = stack.pop();
    let voci;
    try {
      voci = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const v of voci) {
      const p = join(dir, v.name);
      if (v.isDirectory()) {
        if (v.name === "node_modules" || v.name === ".next" || v.name.startsWith(".")) continue;
        stack.push(p);
      } else if (ext.test(v.name)) out.push(p);
    }
  }
  return out;
}

/** Il perimetro vero: i file di memoria citati dalle fonti, che esistono davvero sul disco. */
function perimetroVero(repo = REPO) {
  const citati = new Set();
  const fontiLette = [];
  for (const f of FONTI_PERIMETRO) {
    const abs = join(repo, f.rel);
    if (!existsSync(abs)) continue;
    const files = statSync(abs).isDirectory() ? fileSotto(abs) : [abs];
    let visti = 0;
    for (const file of files) {
      try {
        for (const c of percorsiCitati(readFileSync(file, "utf8"))) citati.add(c);
        visti++;
      } catch {
        /* file illeggibile: non lo si può citare come letto */
      }
    }
    fontiLette.push({ fonte: f.rel, perche: f.perche, file_letti: visti });
  }
  const esistenti = [...citati].filter((rel) => existsSync(join(repo, rel))).sort();
  return { perimetro: esistenti, citati_assenti: [...citati].filter((rel) => !existsSync(join(repo, rel))).sort(), fonti: fontiLette };
}

/** Il verdetto, puro: quali file hanno superato il proprio tetto. */
export function sforamenti(misure = {}, tetti = {}) {
  const fuori = [];
  for (const [file, byte] of Object.entries(misure)) {
    const tetto = tetti[file];
    if (!Number.isFinite(tetto)) {
      fuori.push({ file, byte, tetto: null, motivo: "nessun tetto dichiarato: un file che entra nel contesto senza un massimo è la curva silenziosa che stiamo curando" });
      continue;
    }
    if (byte > tetto) fuori.push({ file, byte, tetto, motivo: `${(byte - tetto).toLocaleString("it-IT")} byte sopra il tetto` });
  }
  return fuori;
}

/** Contratto dei guardiani (AR-322): 0 · 1 · 2, e il cieco vince. */
export function codiceUscita({ cieco = 0, fuori = 0 } = {}) {
  if (cieco > 0) return 2;
  return fuori > 0 ? 1 : 0;
}

function main() {
  let tetti;
  try {
    tetti = JSON.parse(readFileSync(TETTI, "utf8"));
  } catch {
    console.error(`⛔ PESO-CONTESTO CIECO: non ho potuto leggere i tetti (${TETTI}) — non è un verde.`);
    process.exit(2);
  }

  // AR-425 — il perimetro arriva dalle FONTI, non dai tetti. Ai file citati dal giro e dalla Cabina
  // si aggiungono quelli che un tetto ce l'hanno già: un tetto dichiarato non si perde mai di vista,
  // nemmeno se la citazione sparisce da giro.md.
  const { perimetro, citati_assenti, fonti } = perimetroVero(REPO);
  const daTetti = Object.keys(tetti.tetti || {});
  const tutti = [...new Set([...perimetro, ...daTetti])].sort();

  const misure = {};
  const mancanti = [];
  for (const rel of tutti) {
    const p = join(REPO, rel);
    if (!existsSync(p)) { mancanti.push(rel); continue; }
    misure[rel] = statSync(p).size;
  }
  if (!Object.keys(misure).length) {
    console.error("⛔ PESO-CONTESTO CIECO: nessun file misurabile.");
    process.exit(2);
  }
  // Chi entra nel contesto e non ha un tetto è SCOPERTO: oggi non veniva nemmeno misurato.
  const copertura = perimetroScoperto(perimetro, daTetti);

  if (AGGIORNA) {
    const nuovo = { ...tetti, aggiornato: new Date().toISOString().slice(0, 10), tetti: { ...tetti.tetti } };
    let scesi = 0;
    for (const [f, b] of Object.entries(misure)) {
      if (!Number.isFinite(nuovo.tetti[f]) || b < nuovo.tetti[f]) { nuovo.tetti[f] = b; scesi++; }
    }
    writeFileSync(TETTI, JSON.stringify(nuovo, null, 2) + "\n");
    console.log(`📉 Tetti aggiornati: ${scesi} scesi al peso attuale. (Il tetto scende, non si alza: i file cresciuti restano fuori.)`);
    process.exit(0);
  }

  const fuori = sforamenti(misure, tetti.tetti || {});
  const totale = Object.values(misure).reduce((a, b) => a + b, 0);
  // AR-425 — un perimetro NON DERIVABILE rende cieco solo il VERDE, non il rosso.
  // Se le fonti (giro.md, pannello/src) non si trovano non so cosa altro dovrei pesare, quindi non
  // posso dire «va tutto bene»: quello sarebbe di nuovo il difetto, cioè una copertura che coincide
  // con la propria configurazione. Ma se qualcosa ha GIÀ sfondato il tetto, quel rosso l'ho visto
  // davvero e nasconderlo dietro un «non ho potuto misurare» sarebbe la bugia opposta.
  const perimetroCieco = perimetro.length === 0;
  const rc = perimetroCieco && fuori.length === 0 ? 2 : codiceUscita({ fuori: fuori.length });

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        { misure, tetti: tetti.tetti, fuori, totale, mancanti, perimetro: { fonti, misurati: perimetro.length, scoperti: copertura.scoperti, citati_assenti, copertura_pct: copertura.copertura_pct } },
        null,
        2
      )
    );
  } else {
    console.log(`\n⚖️  PESO DEL CONTESTO — ${Math.round(totale / 1024)} KB nei file che il giro rilegge a ogni passata`);
    console.log(
      perimetroCieco
        ? "   ⚪ PERIMETRO NON DERIVABILE: non ho trovato le fonti (cervello/giro.md, pannello/src). Peso solo i file già dichiarati — e questo non basta per dire «va tutto bene»."
        : `   Perimetro derivato da ${fonti.map((f) => f.fonte).join(" + ")}: ${perimetro.length} file · con un tetto ${copertura.copertura_pct ?? "n/d"}%`
    );
    for (const [f, b] of Object.entries(misure).sort((a, b) => b[1] - a[1])) {
      const t = (tetti.tetti || {})[f];
      const segno = !Number.isFinite(t) ? "❓" : b > t ? "⛔" : "✅";
      console.log(`   ${segno} ${f.replace("MyCity-Vault/90-Memoria-AI/", "")}: ${b.toLocaleString("it-IT")} B${Number.isFinite(t) ? ` (tetto ${t.toLocaleString("it-IT")})` : " — senza tetto"}`);
    }
    if (mancanti.length) console.log(`   ⚠️  dichiarati ma assenti: ${mancanti.join(", ")}`);
    // Due elenchi separati: «è cresciuto oltre il suo massimo» e «non ha mai avuto un massimo» sono
    // due problemi diversi e si riparano con due mosse diverse. Metterli insieme era il modo più
    // rapido per rendere illeggibile — e quindi ignorabile — il secondo.
    const cresciuti = fuori.filter((f) => Number.isFinite(f.tetto));
    const scoperti = fuori.filter((f) => !Number.isFinite(f.tetto));
    if (cresciuti.length) {
      console.log(`\n   ⛔ ${cresciuti.length} CRESCIUTI oltre il tetto:`);
      for (const f of cresciuti) console.log(`   • ${f.file}: ${f.motivo}`);
      console.log(`   Pota: node cervello/pota-memoria.mjs --applica · poi node cervello/peso-contesto.mjs --aggiorna`);
    }
    if (scoperti.length) {
      console.log(`\n   ❓ ${scoperti.length} SCOPERTI (nel contesto, senza nessun massimo — AR-425):`);
      for (const f of scoperti) console.log(`   • ${f.file}: ${(f.byte / 1024).toFixed(0)} KB, ${f.motivo}`);
      console.log(`   Dai loro un tetto al peso di oggi: node cervello/peso-contesto.mjs --aggiorna (poi il tetto può solo scendere).`);
    }
  }
  process.exit(rc);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
