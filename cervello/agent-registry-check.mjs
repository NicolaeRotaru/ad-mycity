#!/usr/bin/env node
// Guardiano deterministico del registro agenti — confronta i file reali `.claude/agents/*.md`
// con gli elenchi umani (CLAUDE.md, COMANDI.md, AGENTI.md) e segnala il DRIFT.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge e stampa un report (+ opzionale --json).
//
// Risolve AR-007 / AR-008: il registro degli agenti è mantenuto A MANO in più file che divergono a
// ogni nuovo agente — agenti "orfani" invisibili al router principale e conteggi dichiarati incoerenti
// (es. "40 senior" contro 42 file reali). Questo guardiano rende il drift misurabile a ogni giro,
// non più affidato alla memoria umana o alla sola radiografia LLM su comando.
//
// AR-027 estensione: legge anche il campo `description` di ogni agente (il contratto che il
// Task-router usa davvero) e segnala collisioni di frasi-trigger verbatim tra coppie e deferral
// mancanti verso vicini di dominio. Complementa keyword-owner-check (solo blocco "Delega qui per").
//
// Uso:
//   node cervello/agent-registry-check.mjs           -> report leggibile
//   node cervello/agent-registry-check.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = nessun drift · 1 = drift presente (così può fare da gate in CI o nel giro)

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");

// Cartella dei mansionari operativi (fonte di verità) e i tre file "registro" mantenuti a mano.
const AGENTS_DIR = join(AD_ROOT, ".claude/agents");

/**
 * Legge un file registro relativo alla radice AD; se manca torna stringa vuota — un file
 * assente equivale a "non cita nessun agente", così il drift emerge invece di far crashare.
 * @param {string} rel
 */
function leggiTesto(rel) {
  const p = join(AD_ROOT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

/**
 * AR-024: un agente conta come "citato dal router" SOLO se compare come voce-roster a confine
 * di parola, NON come sottostringa. Il vecchio `testo.includes(nome)` era orbo: un nome corto
 * (es. "qa" dentro "quadratura") o un nome citato solo in un blocco-connettore "(→ usa **X**)"
 * mascherava l'orfano. Qui: (1) tolgo i blocchi-connettori "(→ ... )" — chi appare solo lì è un
 * deferral, non un owner nel roster; (2) match a confine di parola via RegExp sul nome esatto.
 * @param {string} testo
 * @param {string} nome
 */
function citatoNelRoster(testo, nome) {
  const soloRoster = testo.replace(/\([^)]*\)/g, "");
  const nomeEsc = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("\\b" + nomeEsc + "\\b").test(soloRoster); // AR-024: confine di parola, non sottostringa
}

/** Estrae `description:` dal frontmatter YAML di un mansionario. */
function estraiDescription(testo) {
  const m = testo.match(/^---\s*[\r\n]([\s\S]*?)[\r\n]---/);
  const fm = m ? m[1] : testo;
  const d = fm.match(/description:\s*([\s\S]*?)(?:[\r\n]\w[\w-]*:\s|$)/);
  return d ? d[1].replace(/\s+/g, " ").trim() : "";
}

/** Normalizza un frammento in frase-trigger per confronto verbatim. */
function normalizzaFraseTrigger(frag) {
  return frag
    .toLowerCase()
    .replace(/["""«»'?]/g, "")
    .replace(/[?!.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Frase-trigger valida per il confronto (evita monosillabi generici tipo "resi", "payout"). */
function fraseTriggerValida(frag) {
  const f = normalizzaFraseTrigger(frag);
  if (f.length < 4 || f.length > 80 || !/[a-zàèéìòù]/.test(f)) return null;
  const parole = f.split(" ").filter(Boolean);
  if (parole.length >= 2) return f;
  if (f.includes("/")) return f;
  if (f.length >= 10) return f;
  return null;
}

/**
 * Tokenizza le frasi-trigger dalla description intera (non solo "Delega qui per").
 * @param {string} desc
 */
function estraiFrasiTrigger(desc) {
  const senzaDeferral = desc.replace(/\([^)]*→[^)]*\)/g, " ");
  const raw = [];
  const paren = senzaDeferral.match(/\(([^)]+)\)/g) || [];
  for (const blocco of paren) {
    for (const p of blocco.slice(1, -1).split(/[\/,;]/)) raw.push(p);
  }
  const piatto = senzaDeferral.replace(/\([^)]+\)/g, " ");
  for (const p of piatto.split(/[\/,;·]|(?:\s+-\s+)/)) raw.push(p);
  const quoted = senzaDeferral.match(/[""«»"]([^""«»"]+)[""«»"]/g) || [];
  for (const q of quoted) raw.push(q.replace(/[""«»"]/g, ""));
  const out = new Set();
  for (let frag of raw) {
    frag = frag.replace(/^delega qui per\s+/i, "").replace(/^usa per\s+/i, "");
    const f = fraseTriggerValida(frag);
    if (f) out.add(f);
  }
  return [...out];
}

/** Blocchi deferral "(→ …)" nella description. */
function estraiDeferral(desc) {
  return (desc.match(/\([^)]*→[^)]*\)/g) || []).length > 0
    || /→\s*@?\*?\*?[a-z][\w-]*/i.test(desc);
}

/**
 * Collisioni description: coppie con >=2 frasi-trigger condivise verbatim + deferral assente.
 * @param {Map<string, string>} descriptions nome → description
 */
function analizzaCollisioniDescription(descriptions) {
  const triggerPerAgente = new Map();
  const descNorm = new Map();
  for (const [nome, desc] of descriptions) {
    triggerPerAgente.set(nome, estraiFrasiTrigger(desc));
    descNorm.set(nome, normalizzaFraseTrigger(desc));
  }

  const collisioniCoppie = [];
  const nomi = [...descriptions.keys()].sort();
  for (let i = 0; i < nomi.length; i++) {
    for (let j = i + 1; j < nomi.length; j++) {
      const a = nomi[i];
      const b = nomi[j];
      const condivise = triggerPerAgente
        .get(a)
        .filter((t) => descNorm.get(b).includes(t) && descNorm.get(a).includes(t))
        .sort();
      if (condivise.length >= 2) {
        collisioniCoppie.push({ a, b, condivise });
      }
    }
  }

  const deferralMancante = [];
  for (const c of collisioniCoppie) {
    for (const nome of [c.a, c.b]) {
      if (!estraiDeferral(descriptions.get(nome))) {
        deferralMancante.push({
          agente: nome,
          vicino: nome === c.a ? c.b : c.a,
          condivise: c.condivise,
        });
      }
    }
  }

  return { collisioniCoppie, deferralMancante };
}

async function main() {
  const quando = nowPiacenza();

  // 1. Nomi-agente reali = basename (senza .md) di ogni file in `.claude/agents/`.
  const agentiReali = readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();

  // 2. Contenuto dei file "registro" tenuti a mano (match a confine di parola sul roster — AR-024).
  const claude = leggiTesto("CLAUDE.md");
  const comandi = leggiTesto("COMANDI.md");
  const agentiMd = leggiTesto("MyCity-Vault/07-Agenti/AGENTI.md");

  // 3. Orfani = agenti reali con 0 occorrenze SIA in CLAUDE.md SIA in COMANDI.md:
  //    il router principale (mansionario dell'AD + menù comandi) non li vede affatto.
  const orfani = agentiReali.filter(
    (n) => !citatoNelRoster(claude, n) && !citatoNelRoster(comandi, n) // AR-024: confine di parola sul roster, non includes()
  );

  // 4. Assenti da AGENTI.md = agenti reali non citati nella mappa-organigramma leggibile del vault.
  const assentiDaAgentiMd = agentiReali.filter((n) => !agentiMd.includes(n));

  // 5. Conteggio: numero reale di file vs numero dichiarato in AGENTI.md ("N senior").
  //    Tolleranza +1: la mappa può contare anche l'AD, che NON è un file in `.claude/agents/`.
  const nReali = agentiReali.length;
  const mNum = agentiMd.match(/(\d+)\s+senior/i);
  const nDichiaratoAgentiMd = mNum ? Number(mNum[1]) : null;
  const conteggioIncoerente =
    nDichiaratoAgentiMd != null &&
    nDichiaratoAgentiMd !== nReali &&
    nDichiaratoAgentiMd !== nReali + 1;

  // 6. AR-027: collisioni description (frasi-trigger verbatim + deferral verso vicini di dominio).
  const descriptions = new Map();
  for (const nome of agentiReali) {
    const testo = readFileSync(join(AGENTS_DIR, `${nome}.md`), "utf8");
    descriptions.set(nome, estraiDescription(testo));
  }
  const { collisioniCoppie, deferralMancante } = analizzaCollisioniDescription(descriptions);
  const nCollisioni = collisioniCoppie.length + deferralMancante.length;

  // 7. Copertura KPI: ogni agente deve possiedere un KPI in OKR-Squadra (o deroga esplicita).
  const okr = leggiTesto("MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md");
  const derogheKpi = new Set(["ad"]);
  const senzaKpi = agentiReali.filter((n) => {
    if (derogheKpi.has(n)) return false;
    const re = new RegExp("\\b" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    return !re.test(okr);
  });

  const driftTotale =
    orfani.length +
    assentiDaAgentiMd.length +
    (conteggioIncoerente ? 1 : 0) +
    nCollisioni +
    senzaKpi.length;

  await stampSegnale(
    "agent-registry",
    driftTotale > 0 ? "warn" : "ok",
    `${orfani.length} orfani · ${senzaKpi.length} senza KPI OKR · ${nCollisioni} collisioni · ${quando}`
  );

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          quando,
          n_reali: nReali,
          orfani,
          assenti_da_agenti_md: assentiDaAgentiMd,
          n_dichiarato_agenti_md: nDichiaratoAgentiMd,
          conteggio_incoerente: conteggioIncoerente,
          collisioni_coppie: collisioniCoppie,
          deferral_mancante: deferralMancante,
          senza_kpi_okr: senzaKpi,
          drift_totale: driftTotale,
        },
        null,
        2
      )
    );
  } else {
    console.log(`\n🧭 AGENT REGISTRY DRIFT — ${quando}\n`);
    console.log(`Agenti reali (.claude/agents/*.md): ${nReali}`);
    if (nDichiaratoAgentiMd != null) {
      console.log(
        `Dichiarati in AGENTI.md: ${nDichiaratoAgentiMd}${conteggioIncoerente ? "  ⚠️  INCOERENTE" : "  ✅"}`
      );
    }

    if (driftTotale === 0) {
      console.log(`\n✅ nessun drift`);
    } else {
      console.log(
        `\n❌ ${orfani.length} ORFANI (0 occorrenze in CLAUDE.md e COMANDI.md — il router non li vede):`
      );
      for (const n of orfani) console.log(`  • ${n}`);

      if (assentiDaAgentiMd.length) {
        console.log(`\n⚠️  ${assentiDaAgentiMd.length} assenti dall'organigramma AGENTI.md:`);
        for (const n of assentiDaAgentiMd) console.log(`  • ${n}`);
      }

      if (conteggioIncoerente) {
        console.log(
          `\n🔢 Conteggio incoerente: AGENTI.md dichiara ${nDichiaratoAgentiMd} senior, i file reali sono ${nReali}.`
        );
      }

      if (collisioniCoppie.length) {
        console.log(
          `\n🔀 ${collisioniCoppie.length} COPPIE con ≥2 frasi-trigger condivise (description — il router non distingue):`
        );
        for (const c of collisioniCoppie) {
          console.log(`  • ${c.a} ↔ ${c.b}: ${c.condivise.map((f) => `"${f}"`).join(", ")}`);
        }
      }

      if (deferralMancante.length) {
        console.log(
          `\n↪️  ${deferralMancante.length} agenti in collisione SENZA deferral nella description:`
        );
        for (const d of deferralMancante) {
          console.log(
            `  • ${d.agente} (vicino ${d.vicino}): ${d.condivise.map((f) => `"${f}"`).join(", ")}`
          );
        }
      }

      if (senzaKpi.length) {
        console.log(
          `\n📊 ${senzaKpi.length} agenti SENZA KPI in OKR-Squadra (CLAUDE.md: ogni reparto possiede un KPI):`
        );
        for (const n of senzaKpi.slice(0, 20)) console.log(`  • ${n}`);
        if (senzaKpi.length > 20) console.log(`  … e altri ${senzaKpi.length - 20}`);
      }
    }
    console.log(`\nDrift totale: ${driftTotale}`);
  }

  process.exit(driftTotale > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("ERRORE agent-registry-check:", e.message || e);
  await stampSegnale(
    "agent-registry",
    "errore",
    `crash: ${(e.message || e).toString().slice(0, 200)}`
  );
  process.exit(1);
});
