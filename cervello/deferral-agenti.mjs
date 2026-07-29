#!/usr/bin/env node
// 🟢 Sola lettura. Il metro dei RIMANDI fra senior: chi manda a chi, secondo i due elenchi che
// governano i 120.
//
// AR-186 — Perché esiste, e perché non è «allinea due liste».
//
// L'organigramma vive in due posti: la riga-roster di `CLAUDE.md` (la mappa leggibile per Nicola) e
// il campo `description` del mansionario (il contratto che legge il router). Nessuno dei due è
// dichiarato derivato dall'altro, quindi possono divergere in silenzio — e un rimando che esiste in
// un posto solo manda il lavoro a un senior che non lo rivendica, o lo tiene a uno che l'ha ceduto.
//
// La scheda del difetto diceva «oggi: 14 agenti divergenti». **Quel numero non era ricalcolabile**:
// nel repo non c'era niente che lo producesse, quindi non si poteva né confermare né smentire — ed è
// un numero senza fonte, la cosa che il manuale vieta. Il primo metro che ho scritto ne trovava 2, e
// tutti e due erano errori MIEI:
//
//   · cercavo `→ **nome**`, ma la forma vera nel repo è quasi sempre `(→ motivo = **nome**)` — la
//     freccia introduce il MOTIVO, il nome arriva dopo l'uguale. Con la regex stretta, `trust-safety`
//     risultava divergente mentre il rimando c'era, scritto nell'altra forma.
//   · e prendevo per rimando anche `lo **script** → **ai-video** monta`, che è prosa che descrive un
//     passaggio di mano dentro la frase, non un deferral.
//
// Morale, che vale oltre questo file: **un numero su una scheda non è un fatto, è il risultato di un
// metro.** Se il metro non sta nel repo, il numero non è riproducibile e nessuno può accorgersi che
// la realtà si è mossa. Perciò qui il metro è un comando che chiunque rilancia.
//
// Uso:
//   node cervello/deferral-agenti.mjs           -> report leggibile
//   node cervello/deferral-agenti.mjs --json    -> { divergenti, dettaglio }
//   node cervello/deferral-agenti.mjs --conta   -> stampa SOLO il numero (per il campo `misura`)
//
// Exit: 0 = i due elenchi concordano · 1 = divergono · 2 = non ho potuto misurare (cieco)

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

/**
 * I nomi a cui una riga rimanda. Pura.
 *
 * Due forme legittime, entrambe in uso nel repo:
 *   `(→ contestazione Stripe arrivata = **dispute**)`   ← freccia, motivo, uguale, nome
 *   `(→ produzione = **ai-designer**; QA = **qa-designer**)` ← più rimandi nello stesso blocco
 *
 * Si guarda SOLO dentro le parentesi che contengono una freccia: è lì che il repo scrive i rimandi.
 * Fuori dalle parentesi la freccia è prosa — `lo **script** → **ai-video** monta il video` descrive
 * un passaggio di mano dentro la frase, non una cessione di mandato, e contarlo faceva risultare
 * `ai-video` come agente che rimanda a se stesso.
 */
export function rimandiDi(testo = "") {
  const nomi = new Set();
  for (const blocco of String(testo).match(/\([^)]*→[^)]*\)/g) || []) {
    for (const m of blocco.matchAll(/\*\*([a-z0-9][a-z0-9-]{1,})\*\*/g)) nomi.add(m[1]);
  }
  return nomi;
}

/** La riga-roster di un agente in CLAUDE.md: `- 🛡️ **nome** — mandato (→ … = **altro**)`. */
export function rosterDaClaudeMd(testo = "") {
  const per = new Map();
  for (const riga of String(testo).split("\n")) {
    const m = riga.match(/^\s*[-*]\s*(?:\S+\s+)?\*\*([a-z0-9][a-z0-9-]{1,})\*\*\s*—/);
    if (!m) continue;
    const nome = m[1];
    const rimandi = rimandiDi(riga);
    rimandi.delete(nome); // un agente non rimanda a se stesso: è prosa, non un deferral
    per.set(nome, rimandi);
  }
  return per;
}

/** Il campo `description` di un mansionario, e i rimandi che dichiara. */
export function descrizioneDi(testo = "") {
  const d = String(testo).match(/^description:\s*([\s\S]*?)(?:\n[a-z_]+:|\n---)/m);
  return d ? d[1] : "";
}

/**
 * Il confronto. Pura: prende le due mappe e torna chi diverge, con la direzione.
 * Un agente che sta in un elenco e non nell'altro è divergente a sua volta: manca il contratto o
 * manca la mappa, e in entrambi i casi il router e Nicola vedono cose diverse.
 */
export function driftDeferral(roster, schede) {
  const fuori = [];
  for (const [nome, dalRoster] of roster) {
    const dallaScheda = schede.get(nome);
    if (!dallaScheda) {
      fuori.push({ nome, motivo: "nel roster di CLAUDE.md ma senza mansionario" });
      continue;
    }
    const soloRoster = [...dalRoster].filter((x) => !dallaScheda.has(x)).sort();
    const soloScheda = [...dallaScheda].filter((x) => !dalRoster.has(x)).sort();
    if (soloRoster.length || soloScheda.length) fuori.push({ nome, solo_roster: soloRoster, solo_scheda: soloScheda });
  }
  for (const nome of schede.keys()) {
    if (!roster.has(nome)) fuori.push({ nome, motivo: "ha un mansionario ma il roster di CLAUDE.md non lo nomina" });
  }
  return fuori.sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * Il verdetto rispetto al debito DICHIARATO, per NOME — mai per conteggio.
 *
 * A parità di numero, «uno allineato e uno nuovo» è un peggioramento: guardando il totale passerebbe
 * liscio. E il debito può solo accorciarsi da solo: un agente che smette di divergere non lascia il
 * posto a un altro, esce e basta.
 *
 * Nasce verde sui tredici del 29/7 perché un cancello che parte rosso su tredici viene spento entro
 * la settimana; parte verde e becca il quattordicesimo il giorno che arriva.
 */
export function nuoviRispettoAlDebito(fuori, baseline = {}) {
  const noti = new Set(Object.keys(baseline?.agenti || {}));
  return fuori.filter((d) => !noti.has(d.nome));
}

/** Chi era nel debito e adesso è allineato: da togliere dalla lista, così il tetto scende. */
export function debitoRiparato(fuori, baseline = {}) {
  const ora = new Set(fuori.map((d) => d.nome));
  return Object.keys(baseline?.agenti || {}).filter((n) => !ora.has(n)).sort();
}

function main() {
  const jsonMode = process.argv.includes("--json");
  const soloConta = process.argv.includes("--conta");
  const claudeMd = process.env.DEFERRAL_CLAUDE_MD || join(AD_ROOT, "CLAUDE.md");
  const agentsDir = process.env.DEFERRAL_AGENTS_DIR || join(AD_ROOT, ".claude/agents");
  const BASELINE = process.env.DEFERRAL_BASELINE || join(AD_ROOT, "cervello/deferral-baseline.json");

  // Cieco, non verde (AR-322): se non c'è niente da leggere non ho misurato.
  if (!existsSync(claudeMd) || !existsSync(agentsDir)) {
    console.error("⛔ DEFERRAL-AGENTI CIECO: manca CLAUDE.md o .claude/agents/");
    process.exit(2);
  }
  const roster = rosterDaClaudeMd(readFileSync(claudeMd, "utf8"));
  const schede = new Map();
  for (const f of readdirSync(agentsDir).filter((x) => x.endsWith(".md"))) {
    schede.set(basename(f, ".md"), rimandiDi(descrizioneDi(readFileSync(join(agentsDir, f), "utf8"))));
  }
  if (!roster.size || !schede.size) {
    console.error("⛔ DEFERRAL-AGENTI CIECO: roster o mansionari vuoti");
    process.exit(2);
  }

  const fuori = driftDeferral(roster, schede);

  // Il debito dichiarato. Se non è leggibile il guardiano è CIECO, non verde (AR-322): senza la
  // lista non so distinguere un disallineamento noto da uno nuovo, e dire «tutto a posto» sarebbe
  // la bugia più comoda.
  let baseline = null;
  try {
    baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
  } catch {
    console.error(`⛔ DEFERRAL-AGENTI CIECO: non riesco a leggere ${BASELINE}`);
    process.exit(2);
  }

  const nuovi = nuoviRispettoAlDebito(fuori, baseline);
  const riparati = debitoRiparato(fuori, baseline);

  if (soloConta) {
    console.log(String(fuori.length));
  } else if (jsonMode) {
    console.log(JSON.stringify({
      divergenti: fuori.length, roster: roster.size, schede: schede.size,
      debito_dichiarato_il: baseline.dichiarato_il || null, debito_dichiarato: Object.keys(baseline.agenti || {}).length,
      nuovi_rispetto_al_debito: nuovi, debito_riparato_da_togliere: riparati, dettaglio: fuori,
    }, null, 2));
  } else {
    console.log(`\n🔀 RIMANDI FRA SENIOR — ${roster.size} nel roster, ${schede.size} mansionari\n`);
    if (!fuori.length) {
      console.log("✅ I due elenchi concordano: nessun rimando esiste in un posto solo.");
    } else if (!nuovi.length) {
      console.log(`✅ Niente di nuovo. ${fuori.length} disallineamenti, tutti nel debito dichiarato il ${baseline.dichiarato_il}.`);
    } else {
      console.log(`❌ ${nuovi.length} agenti divergono e NON erano nel debito dichiarato il ${baseline.dichiarato_il}:\n`);
      for (const d of nuovi) {
        if (d.motivo) console.log(`  • ${d.nome}: ${d.motivo}`);
        else console.log(`  • ${d.nome.padEnd(22)} solo in CLAUDE.md: [${d.solo_roster.join(", ")}]  solo nella scheda: [${d.solo_scheda.join(", ")}]`);
      }
      console.log(`\nAllinea i due, oppure dichiaralo con motivo in cervello/deferral-baseline.json —`);
      console.log(`allargare quella lista è una decisione visibile, non un effetto collaterale.`);
      console.log(`Il router legge la scheda, Nicola legge CLAUDE.md, e il lavoro va dove dice il primo.`);
    }
    if (riparati.length) {
      console.log(`\n   🎉 Allineati (da togliere da deferral-baseline.json): ${riparati.join(", ")}`);
    }
  }
  process.exit(nuovi.length ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
