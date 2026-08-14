#!/usr/bin/env node
// 👁️‍🗨️ LA MALATTIA: un buco letto come uno zero. (AR-383, lotto 41 corsia 1)
//
// Il tetto di spesa dell'AI leggeva le impostazioni con `.catch(() => ({ valori: {} }))`. Con la
// memoria giù la mappa tornava vuota, quindi «speso» valeva 0, «restante» il tetto pieno e
// `puoSpendere()` — l'UNICO freno prima della chiamata a pagamento — diceva sempre di sì. Proprio
// nel momento in cui la macchina non sa quanto ha speso, si autorizzava a spendere tutto.
//
// Qui si esegue la funzione VERA (pannello/src/lib/ai-budget.ts) con la memoria staccata: nessuna
// rete, perché senza SUPABASE_URL lo store risponde da solo `{tabella:false, valori:{}}` — che è
// esattamente lo scenario del difetto.
//
// Copre: AR-383 (il cieco che tornava una misura, e la spesa che spariva se non si registrava).
//
// Si esegue con: node cervello/test/c1-lettura-cieca-non-e-zero.test.mjs

import { registerHooks } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SRC = join(REPO, "pannello/src");

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith("@/")) {
      const base = join(SRC, spec.slice(2));
      for (const e of [".ts", ".tsx", "/index.ts", ""]) {
        if (existsSync(base + e)) return { url: pathToFileURL(base + e).href, shortCircuit: true };
      }
    }
    try {
      return next(spec, ctx);
    } catch (errore) {
      if (errore?.code !== "ERR_MODULE_NOT_FOUND" && errore?.code !== "ERR_UNSUPPORTED_DIR_IMPORT") throw errore;
      for (const x of spec.startsWith(".") ? [".ts", ".tsx", "/index.ts"] : [".js", ".mjs"]) {
        try {
          return next(spec + x, ctx);
        } catch {
          /* provo il prossimo */
        }
      }
      throw errore;
    }
  },
});

// MEMORIA STACCATA, sul serio: è la condizione del difetto, non una simulazione.
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_KEY;

const { getBudget, puoSpendere, aggiungiSpesa, setTetto } = await import(join(REPO, "pannello/src/lib/ai-budget.ts"));
const { lettureCieche, cancelloAtto } = await import(join(REPO, "pannello/src/lib/cancello-atto.ts"));

const casi = [];
const prova = async (nome, fn) => {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── AR-383 ────────────────────────────────────────────────────────────────────
await prova("AR-383: con la memoria giù il budget si dichiara CIECO, non «zero speso»", async () => {
  const b = await getBudget();
  assert.equal(b.cieco, true, "non aver potuto leggere il conto deve risultare, invece di sembrare un conto a zero");
  assert.ok(b.motivoCieco.length > 10, "e deve dire a Nicola PERCHÉ non lo so");
});

await prova("AR-383: se non so quanto ho speso, NON spendo (fail-closed)", async () => {
  assert.equal(await puoSpendere(0.01), false, "un centesimo al buio è già un centesimo di troppo");
  assert.equal(await puoSpendere(0), false, "nemmeno la stima a zero passa: la guardia è cieca, non generosa");
  // Il punto esatto del difetto: prima qui c'era `restante = tetto pieno` e la risposta era «sì».
  const b = await getBudget();
  assert.equal(b.restante, b.tetto, "il numero mostrato resta quello di default: è proprio ciò che ingannava");
  assert.equal(await puoSpendere(b.tetto), false, "…e nonostante quel numero la risposta deve essere NO");
});

await prova("AR-383: una spesa che non si riesce a registrare torna FALSE invece di sparire", async () => {
  // Senza memoria `setImpostazione` torna false: prima l'esito veniva ignorato e quell'euro
  // spariva per sempre dal conto del mese, in silenzio.
  assert.equal(await aggiungiSpesa(1.5), false, "una spesa avvenuta e non registrata non è un successo");
  assert.equal(await aggiungiSpesa(0), true, "niente da registrare non è un fallimento");
});

await prova("AR-383: anche il tetto dice se è stato salvato", async () => {
  assert.equal(await setTetto(80), false, "senza memoria il tetto non si salva, e chi lo cambia deve saperlo");
});

await prova("AR-383: la regola è la stessa del resto della corsia (una funzione sola, non una copia)", async () => {
  // Se questa domanda vivesse in due posti, un giorno risponderebbero due cose diverse.
  assert.deepEqual(lettureCieche([{ nome: "conto", vivo: false }]), ["conto"]);
  assert.deepEqual(lettureCieche([{ nome: "conto", vivo: true }]), []);
  const v = cancelloAtto({ letture: [{ nome: "conto", vivo: false }], prenotazione: "mia" });
  assert.equal(v.procedi, false, "una lettura cieca ferma qualunque atto, non solo la spesa");
  assert.equal(v.status, 503);
});

await prova("il metro sa dire di SÌ: con il conto leggibile e sotto tetto si spende", async () => {
  // Nessuna rete: si esercita la decisione pura con le stesse condizioni del caso buono.
  const v = cancelloAtto({ letture: [{ nome: "il conto della spesa AI del mese", vivo: true }], prenotazione: "mia" });
  assert.equal(v.procedi, true, "se il freno dicesse sempre di no, non sarebbe un freno: sarebbe un muro");
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
