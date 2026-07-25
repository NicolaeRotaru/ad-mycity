#!/usr/bin/env node
// 📝 SCRIVE IN MEMORIA il round 3 del programma intelligenza (2026-07-25). Idempotente.
//
// Perché esiste come script invece che dentro il commit: la sessione cloud che ha prodotto il
// round 3 non ha il permesso di `git push`, e pubblica via API GitHub — dove DECISIONI.md (457 KB,
// append-only) non passa. Ritrascriverlo a mano per aggiungere due righe sarebbe il modo migliore
// per corrompere il registro delle decisioni. Questo script porta la stessa riga, sul posto.
//
// Non riscrive niente di esistente: DECISIONI.md è append-only e qui si appende e basta.
// Rilanciarlo due volte non duplica la riga (controlla la firma prima di scrivere).
//
// Uso:
//   node cervello/round3-memoria.mjs --dry   -> dice cosa farebbe, non tocca nulla
//   node cervello/round3-memoria.mjs         -> appende la riga in DECISIONI.md

import { existsSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const DECISIONI = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/DECISIONI.md");
const FIRMA = "Round 3 «macchina più intelligente»";

const RIGA =
  "\n- 2026-07-25 02:20 · 🟡 · [AD/tech] · **Round 3 «macchina più intelligente»: chiusi i due freni che " +
  "proteggono la firma di Nicola (AR-109, AR-110) — più un terzo difetto trovato strada facendo che rendeva " +
  "controproducente chiudere difetti.** Primo passo obbligato del round: verificare se i due difetti " +
  "esistessero ancora davvero, leggendo il codice e non il registro (nel round 2 un fix già mergiato " +
  "risultava aperto). Verdetto: **esistono entrambi**. AR-109 — `coloreMinimo()` stava in " +
  "`publishers/email.mjs` dal 16/7 col commento «l'autopilot deve usarla», e nessun file la chiamava: una " +
  "voce `{canale:\"email\", to:\"cliente@reale.it\", colore:\"verde\"}` con `AUTOPILOT_LIVE=1` partiva da " +
  "sola verso un cliente reale. AR-110 — `/api/approva` diceva al worker «eseguila con esegui-azione.mjs» " +
  "senza passargli l'`AZIONE_ID` che quel comando pretende e senza lasciare una firma verificabile: " +
  "l'azione appena approvata da Nicola degradava a DRY-RUN, oppure il worker si scriveva da solo il " +
  "marcatore che il cancello poi controllava (l'esecutore firmava se stesso). **Fatto:** ① il colore ora è " +
  "`max(colore minimo del canale, colore dichiarato)` — una voce non può auto-dichiararsi più sicura del " +
  "canale su cui viaggia, e anche il verde passa da PAUSA + allowlist; ② contratto di firma esplicito " +
  "Pannello→cervello: il clic Approva scrive `azione:<id>:firma = \"nicola <data ora>\"` in Supabase e il " +
  "cancello CLI la legge — l'autopilota del Pannello scrive «auto» e NON apre il cancello (il punto che " +
  "evita di aprire un buco invece di chiuderlo), rifiuto e annullamento la revocano. **Terzo difetto, " +
  "trovato rimisurando:** chiudere due difetti faceva crollare il voto salute da 43 a 0 e il gate della " +
  "pagella bocciava il lavoro — `auto-fix.mjs` copiava nello storico `voto_salute_architettura` da " +
  "`auto-radiografia.json`, che oggi vale 0 (è la salute pending-merge, non il voto architettura). Cioè: la " +
  "macchina puniva col voto esattamente il comportamento che il programma le chiede. Ora il voto non si " +
  "inventa e non si azzera: se non c'è una misura vera si riporta l'ultima nota, marcata come non " +
  "ri-misurata. **Misura (regola del ciclo):** freni rotti 8 → 6 «meglio», voto salute fermo a 43, " +
  "`pagella-intelligenza.mjs --gate` esce 0 (1 migliorata, 0 peggiorate). **Prove:** 3 file di test nuovi " +
  "(26 test), ognuno verificato che FALLISCA sul codice vecchio — non solo che passi sul nuovo. Verifica in " +
  "un comando: `node cervello/round3-verifica.mjs` (sola lettura, provato anche nel caso in cui deve dire " +
  "no). Nessun `cantiere-difetti.json` toccato nel branch: al merge il VPS chiude AR-109/AR-110 da solo " +
  "(`aggiorna-cervello.sh` → `auto-fix.mjs verifica --applica`). · Nicola (comando round 3)\n";

if (!existsSync(DECISIONI)) {
  console.error(`❌ DECISIONI.md non trovato: ${DECISIONI}`);
  process.exit(1);
}

if (readFileSync(DECISIONI, "utf8").includes(FIRMA)) {
  console.log("✓ Già in memoria: la riga del round 3 è in DECISIONI.md (niente da fare).");
  process.exit(0);
}

if (DRY) {
  console.log("→ Appenderebbe la riga del round 3 in MyCity-Vault/90-Memoria-AI/DECISIONI.md (append-only).");
  process.exit(0);
}

appendFileSync(DECISIONI, RIGA);
console.log("✅ Scritta in DECISIONI.md la riga del round 3 (AR-109, AR-110 + voto salute).");
console.log("   Verifica il lavoro con:  node cervello/round3-verifica.mjs");
