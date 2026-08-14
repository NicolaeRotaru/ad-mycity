#!/usr/bin/env node
// 🧪 AR-286 — NESSUNA MISURA DICEVA DA QUALE COMPUTER ERA STATA SCRITTA.
//
// Gli artefatti dei sensori sono nati quando esisteva un solo posto che li scriveva (il VPS). Quando
// sono comparse le sessioni cloud si è messa una guardia sulla SCRITTURA invece di un timbro sul
// DATO — il rimedio minimo per il sintomo osservato, senza chiedersi «e come facciamo a saperlo
// dopo?». Risultato: un referto scritto da una sessione che i sensori non li vede affatto e uno
// scritto dal VPS sono indistinguibili anche a posteriori, quindi non si può fare un post-mortem né
// dire da quando uno stato è falso.
//
// La nota lasciata da chi ci ha provato prima dice la cosa giusta: delle tre parti del fix, quella
// che vale davvero è la TERZA — la regola per cui un referto senza intestazione di provenienza non
// passa. Le altre due si dimenticano al prossimo file nuovo. Qui si prova quella.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "cervello/eta-referto.mjs"));
const S = await import(join(REPO, "cervello/salute.mjs"));

const SEGRETO = "sk_live_QUESTO_NON_DEVE_USCIRE_MAI";

test("il timbro dice DA DOVE viene la misura, e le tre case restano distinte", () => {
  assert.equal(M.ambienteDi({ SALUTE_CASA: "vps" }), "vps");
  assert.equal(M.ambienteDi({ CLAUDE_CODE_REMOTE: "1" }), "cloud");
  assert.equal(M.ambienteDi({}), "locale");
  assert.equal(M.ambienteDi({ MYCITY_ORIGINE: "vps", CI: "1" }), "vps", "la dichiarazione esplicita vince sulla deduzione");
});

test("nel timbro finiscono i NOMI delle chiavi, MAI i valori", () => {
  const env = { SUPABASE_URL: "https://x.supabase.co", STRIPE_SECRET_KEY: SEGRETO, VUOTA: "  " };
  const t = M.timbraReferto({ quando: "2026-08-14 10:00", scadenzaOre: 26, scrittoDa: "prova", env, chiavi: ["SUPABASE_URL", "STRIPE_SECRET_KEY", "VUOTA", "ASSENTE"] });
  assert.deepEqual(t.chiavi_presenti, ["SUPABASE_URL", "STRIPE_SECRET_KEY"], "una chiave vuota non è una chiave presente");
  assert.ok(!JSON.stringify(t).includes(SEGRETO), "un timbro che porta i valori sarebbe un segreto committato");
  assert.ok(!JSON.stringify(t).includes("supabase.co"));
});

test("il timbro porta la scadenza ACCANTO al dato e chi l'ha scritto", () => {
  const t = M.timbraReferto({ quando: "2026-08-14 10:00", scadenzaOre: 26, scrittoDa: "cervello/salute.mjs", env: {} });
  assert.equal(t.scade_dopo_ore, 26);
  assert.equal(t.scritto_da, "cervello/salute.mjs");
  assert.equal(t.quando, "2026-08-14 10:00");
});

test("il referto della VISITA nasce col suo timbro: lo costruisce il codice vero", () => {
  const visitaFinta = {
    buoni: [], rotti: [], guasti: [], nonVisti: [], risultati: [], copertura: 1,
    cronicita: { conto: {} }, precedente: { ultime: {}, storico: [] },
  };
  const doc = S.documentoSalute(visitaFinta, {
    casa: "cloud",
    modo: "rapido",
    quando: "2026-08-14 10:00",
    istante: "2026-08-14T08:00:00.000Z",
    env: { CLAUDE_CODE_REMOTE: "1", STRIPE_SECRET_KEY: SEGRETO },
  });
  assert.ok(doc.timbro, "senza timbro il referto torna anonimo, ed è il difetto");
  assert.equal(doc.timbro.ambiente, "cloud", "una visita cloud non deve poter passare per una visita del server");
  assert.equal(doc.timbro.scritto_da, "cervello/salute.mjs");
  assert.ok(doc.timbro.scade_dopo_ore > 0, "il referto deve dire da sé a che età smette di valere");
  assert.deepEqual(doc.timbro.chiavi_presenti, ["STRIPE_SECRET_KEY"]);
  assert.ok(!JSON.stringify(doc).includes(SEGRETO), "mai i valori delle chiavi dentro la memoria");
});

test("un referto SENZA timbro non compra il verde: resta ⚪", () => {
  const adesso = Date.parse("2026-08-14T10:00:00+02:00");
  const anonimo = M.etaReferto({ dato: { rotti: 0, ok: 20 }, scadenzaOre: 26, adessoMs: adesso, nome: "referto anonimo" });
  assert.equal(anonimo.stato, M.NON_VISTO);
  assert.equal(anonimo.verde, false, "«venti controlli a posto» senza timbro non dice niente su adesso");
});

test("chi legge un referto timbrato sa anche da dove veniva la misura", () => {
  const adesso = Date.parse("2026-08-14T10:00:00+02:00");
  const r = M.etaReferto({
    dato: { timbro: { quando: "2026-08-14 09:00", scade_dopo_ore: 26, ambiente: "cloud" } },
    adessoMs: adesso,
    nome: "referto",
  });
  assert.equal(r.stato, M.FRESCO);
  assert.equal(r.ambiente, "cloud", "fresco sì, ma scritto da una sessione che il VPS lo vede di riflesso");
});
