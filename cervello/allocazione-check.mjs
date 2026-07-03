#!/usr/bin/env node
// Guardiano deterministico dell'ALLOCAZIONE DELLO SFORZO — rende ATTIVO il cancello di allocazione (AR-006).
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge il registro-realtà + le consegne e stampa un report.
//
// Risolve AR-006: la regola "sforzo di reparto PESANTE (post/QR/reel/evento) solo su entità CONFERMATA
// nel sistema" viveva solo come prosa in CLAUDE.md e come correzione nella LETTERA-A-NICOLA (sola lettura).
// Nessun canale la misurava: un senior poteva sfornare 12+ asset intestati a una 'scelta_ragionata'
// (prospect non firmato, es. Garetti) mentre l'unica entità 'confermata' payout-ready (dal 3/7:
// Pane Quotidiano, il negozio-faro) restava a 0 asset. Questo guardiano misura lo squilibrio a OGNI giro,
// come agent-registry-check per il registro agenti: il silo diventa un numero, non più una scoperta che
// dorme in una lettera.
//
// Uso:
//   node cervello/allocazione-check.mjs           -> report leggibile
//   node cervello/allocazione-check.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = allocazione sana · 1 = silo/violazione (così può fare da gate nel giro)

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");

// Cartelle dove vivono gli ASSET PESANTI intestabili a un'entità (post, grafiche, QR, kit, pagine SEO…).
// NON includiamo consegne/audit, consegne/decisioni, consegne/finanza ecc.: non sono "sforzo di reparto
// pesante intestato a un negozio", sono documenti di sistema.
const ROOT_PESANTI = [
  "consegne/content",
  "consegne/design",
  "consegne/pr",
  "consegne/seo",
  "creativi/output",
];

// Soglia: sopra questo numero di asset pesanti su UNA entità 'scelta_ragionata' scatta la violazione.
// (Bozza-template neutra occasionale = ok; un pacchetto completo intestato = no.)
const SOGLIA_PESANTI = 3;

// Parole troppo generiche per essere un alias affidabile di un negozio (evita falsi match).
const STOPWORD_ALIAS = new Set([
  "antica", "salumeria", "casa", "bottega", "panificio", "forno", "pane", "macelleria",
  "gastronomia", "alimentari", "negozio", "azienda", "linda", "della", "delle", "dei",
]);

/** Legge un JSON del vault; se manca o è rotto torna null (il guardiano lo segnala, non crasha). */
function leggiJson(rel) {
  const p = join(AD_ROOT, rel);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** Deriva gli alias di match per un'entità: il nome intero + le parole "proprie" (≥4 char, non stopword). */
function aliasDi(nome) {
  const alias = new Set([nome]);
  for (const w of nome.split(/\s+/)) {
    const pulita = w.replace(/[^\p{L}]/gu, "");
    if (pulita.length >= 4 && !STOPWORD_ALIAS.has(pulita.toLowerCase())) alias.add(pulita);
  }
  return [...alias];
}

/** Elenca ricorsivamente i file .md/.txt/.png/.svg sotto una cartella (relativi ad AD_ROOT). */
function fileRicorsivi(relDir) {
  const abs = join(AD_ROOT, relDir);
  if (!existsSync(abs)) return [];
  const out = [];
  const stack = [abs];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile()) out.push(p);
    }
  }
  return out;
}

/** Conta quanti file pesanti "intestano" ciascuna entità (nome/alias nel path o nel testo). */
function contaAssetPerEntita(entitaNegozi) {
  // Pre-carica i file pesanti una sola volta (path + testo per i file leggibili).
  const files = [];
  for (const root of ROOT_PESANTI) {
    for (const abs of fileRicorsivi(root)) {
      const rel = abs.slice(AD_ROOT.length + 1);
      let testo = "";
      if (/\.(md|txt|json|html|csv)$/i.test(rel) && statSync(abs).size < 1_000_000) {
        try {
          testo = readFileSync(abs, "utf8");
        } catch {
          testo = "";
        }
      }
      files.push({ rel, blob: (rel + "\n" + testo).toLowerCase() });
    }
  }

  const conteggio = {};
  for (const ent of entitaNegozi) {
    const alias = aliasDi(ent.nome).map((a) => a.toLowerCase());
    const match = files.filter((f) => alias.some((a) => f.blob.includes(a)));
    conteggio[ent.nome] = { stato: ent.stato, n: match.length, esempi: match.slice(0, 4).map((m) => m.rel) };
  }
  return { conteggio, totaleFile: files.length };
}

async function main() {
  const quando = nowPiacenza();
  const registro = leggiJson("MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-realta.json");

  if (!registro || !Array.isArray(registro.entita)) {
    const msg = "registro-realta.json mancante o illeggibile: impossibile misurare l'allocazione.";
    await stampSegnale("allocazione", "errore", `${msg} · ${quando}`);
    if (JSON_MODE) console.log(JSON.stringify({ esito: "errore", quando, messaggio: msg }, null, 2));
    else console.error(`\n⚖️  ALLOCAZIONE — ${quando}\n\n❌ ${msg}`);
    process.exit(1);
  }

  // Solo i negozi VERI candidabili a produzione. Escluse le entità NON presidiabili: le demo/fixture
  // del marketplace (stato "demo") e i negozi SCARTATI (stato "scartato", es. Casa Linda dopo la
  // decisione di Nicola del 3/7 che ha eletto Pane Quotidiano a faro). Uno scartato non è né un target
  // valido né un prospect: non deve entrare nel conteggio dell'allocazione.
  const ESCLUSI = new Set(["demo", "scartato"]);
  const negozi = registro.entita.filter((e) => e.tipo === "negozio" && !ESCLUSI.has(e.stato));
  const { conteggio, totaleFile } = contaAssetPerEntita(negozi);

  const confermati = negozi.filter((e) => e.stato === "confermato");
  const nonConfermati = negozi.filter((e) => e.stato !== "confermato");

  // Violazione 1: entità NON confermata con troppi asset pesanti intestati (pacchetto completo su un prospect).
  const sovra = nonConfermati
    .map((e) => ({ nome: e.nome, stato: e.stato, n: conteggio[e.nome]?.n || 0, esempi: conteggio[e.nome]?.esempi || [] }))
    .filter((x) => x.n >= SOGLIA_PESANTI);

  // Violazione 2 (silo): esiste almeno un negozio CONFERMATO a 0 asset mentre un NON-confermato ne ha ≥ soglia.
  const confermatiAZero = confermati
    .map((e) => ({ nome: e.nome, n: conteggio[e.nome]?.n || 0 }))
    .filter((x) => x.n === 0);
  const siloAttivo = sovra.length > 0 && confermatiAZero.length > 0;

  const violazioni = sovra.length + (siloAttivo ? 1 : 0);
  const esito = violazioni > 0 ? "silo" : "sano";

  await stampSegnale(
    "allocazione",
    violazioni > 0 ? "errore" : "ok",
    violazioni > 0
      ? `silo: ${sovra.map((s) => `${s.nome} (${s.n} asset, ${s.stato})`).join("; ")} · confermati a 0: ${confermatiAZero.map((c) => c.nome).join(", ") || "nessuno"} · ${quando}`
      : `allocazione sana su ${totaleFile} asset pesanti · ${quando}`
  );

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito, quando, totaleFile, conteggio, sovra, confermatiAZero, siloAttivo }, null, 2));
    process.exit(violazioni > 0 ? 1 : 0);
  }

  console.log(`\n⚖️  ALLOCAZIONE DELLO SFORZO — ${quando}\n`);
  console.log(`Asset pesanti scansionati (${ROOT_PESANTI.join(", ")}): ${totaleFile}\n`);
  console.log("Per negozio (n asset · stato):");
  for (const e of negozi) {
    const c = conteggio[e.nome] || { n: 0, stato: e.stato };
    const bandiera = e.stato === "confermato" ? "✅" : "🟨";
    console.log(`  ${bandiera} ${e.nome} — ${c.n} asset · ${e.stato}`);
  }

  if (violazioni === 0) {
    console.log(`\n✅ Allocazione sana: nessun pacchetto pesante concentrato su un prospect non confermato.`);
  } else {
    console.log(`\n❌ SILO DI ALLOCAZIONE (AR-006) — lo sforzo pesante è sull'entità sbagliata:`);
    for (const s of sovra) {
      console.log(`  • ${s.nome} (${s.stato}) ha ${s.n} asset pesanti — dovrebbero essere solo bozze-template neutre finché non è 'confermato'.`);
      for (const ex of s.esempi) console.log(`      – ${ex}`);
    }
    if (siloAttivo) {
      console.log(`  • Intanto questi negozi CONFERMATI (payout-ready) sono a 0 asset: ${confermatiAZero.map((c) => c.nome).join(", ")}.`);
    }
    console.log(`\n→ Ripunta la produzione pesante sui negozi 'confermato'. Sui 'scelta_ragionata' solo bozze-template.`);
    console.log(`  Regola (CLAUDE.md, cancello di allocazione AR-006): asset pesanti SOLO su entità confermata nel registro-realtà.`);
  }

  process.exit(violazioni > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("ERRORE allocazione-check:", e?.message || e);
  process.exit(1);
});
