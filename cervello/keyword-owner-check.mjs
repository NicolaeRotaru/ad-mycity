#!/usr/bin/env node
// AR-027 / AR-185 — Guardiano "un mandato, un solo padrone" (AR-008) sulle DESCRIPTION degli agenti.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge `.claude/agents/*.md`, estrae il mandato di
// ogni scheda (la stringa su cui il Task-router instrada davvero) e FALLISCE quando due senior
// rivendicano lo stesso mandato SENZA che nessuno dei due rimandi all'altro ("→ ...").
//
// Perché (AR-027): la deconfliction "un mandato = un owner" vive nel roster di CLAUDE.md ma NON
// nelle description. Il router instrada sulle description, quindi keyword duplicate senza deferral
// (es. marketing↔crm-lifecycle, trust-safety↔dispute) creano doppioni invisibili. Questo check
// misura il drift a ogni giro, come agent-registry-check per il registro agenti.
//
// AR-185 — COSA È CAMBIATO E PERCHÉ. Fino a qui il guardiano leggeva SOLO l'elenco fra virgolette del
// blocco «Delega qui per "…"» e buttava via il resto della scheda, cioè la frase in cui il mansionario
// dichiara di cosa risponde: «Usa per …». Con quel taglio due senior potevano contendersi il carrello
// abbandonato (crm-lifecycle ↔ cro) o l'inquadramento dei rider (public-policy ↔ consulente-lavoro) con
// il guardiano verde. In più il conflitto veniva perdonato appena ESISTEVA un deferral qualsiasi su
// quella keyword, scritto da chiunque (`deferrers.size === 0`): ora il rimando si valuta fra i DUE
// agenti in causa. La logica che decide sta in `cervello/mandato-owner.mjs` (funzioni pure, provate sui
// 120 file veri da cervello/test/mandato-senza-padrone.test.mjs); qui restano solo le mani.
//
// Uso:
//   node cervello/keyword-owner-check.mjs           -> report leggibile
//   node cervello/keyword-owner-check.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = nessun conflitto · 1 = keyword con ≥2 owner senza deferral (fa da gate nel giro)

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { analizzaMandati } from "./mandato-owner.mjs";

const JSON_MODE = process.argv.includes("--json");
const AGENTS_DIR = join(AD_ROOT, ".claude/agents");

function main() {
  const quando = nowPiacenza();
  if (!existsSync(AGENTS_DIR)) {
    const out = { ok: false, errore: "cartella agenti mancante", quando };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ .claude/agents/ non trovata");
    process.exit(1);
  }

  const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"));
  const schede = files.map((f) => ({
    nome: f.replace(/\.md$/, ""),
    testo: readFileSync(join(AGENTS_DIR, f), "utf8"),
  }));

  // AR-185: la logica che decide vive in mandato-owner.mjs (funzione pura), qui si legge e si stampa.
  const esito = analizzaMandati(schede);

  // Una riga per tema conteso, coi due contendenti: la forma che il gate del giro e la Cabina leggono.
  const conflitti = esito.conflitti.flatMap((c) =>
    c.temi.map((t) => ({ keyword: t.tema, owners: [c.a, c.b], frase_a: t.frase_a, frase_b: t.frase_b }))
  );

  const out = {
    ok: conflitti.length === 0 && esito.senza_mandato.length === 0,
    quando,
    agenti: files.length,
    frasi_mandato: esito.frasi_mandato, // se crollasse a zero, il verde sarebbe cecità e non salute
    radici_specifiche: esito.radici_specifiche,
    senza_mandato: esito.senza_mandato, // schede da cui non si estrae nessun mandato leggibile
    conflitti,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else if (out.ok) {
    console.log(
      `✅ mandato-owner: nessun doppione (${esito.frasi_mandato} frasi di mandato, ${files.length} agenti) — ${quando}`
    );
  } else {
    if (conflitti.length) {
      console.log(`❌ mandato-owner: ${conflitti.length} mandati contesi senza deferral — ${quando}`);
      for (const c of conflitti) {
        console.log(`  · [${c.keyword}] ${c.owners.join(" ↔ ")}`);
        console.log(`      «${c.frase_a}» ↔ «${c.frase_b}»`);
      }
    }
    if (esito.senza_mandato.length) {
      console.log(`⚠️  ${esito.senza_mandato.length} schede senza un mandato leggibile: ${esito.senza_mandato.join(", ")}`);
    }
  }
  process.exit(out.ok ? 0 : 1);
}

// Il CLI parte solo se questo file è LANCIATO: un test che importa il modulo non deve far girare il
// gate (AR-680, malattia `programma-che-parte-importando`).
//
// ⚠️ PERCHÉ `pathToFileURL` E NON `file://${process.argv[1]}`. Le due forme si somigliano e una delle
// due è rotta: `file://` incollato al percorso NON codifica i caratteri fuori dall'ASCII, mentre
// `import.meta.url` li codifica sempre. Basta che il repo stia sotto una cartella con un accento o
// uno spazio — e in questa casa i nomi con l'accento ci sono davvero (AR-339, 26 file nel vault) —
// perché il confronto risulti falso: il guardiano non parte, non stampa niente ed esce 0. Cioè si
// spegne **in silenzio**, che è il modo peggiore in cui un cancello può rompersi. La forma qui sotto
// è quella che `cervello/import-che-esegue.mjs` indica come canonica.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
