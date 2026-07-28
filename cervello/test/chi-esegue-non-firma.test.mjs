#!/usr/bin/env node
// AR-119 — la firma che sblocca l'invio reale vive in un posto che l'esecutore sa scrivere.
//
// Misurato il 28/7, e metà del difetto era già riparata: AR-205 (27/7) ha reso la firma un'autorità
// sola — Supabase, `azione:<id>:firma` = "nicola …", scritta solo dal clic del Pannello, con
// "auto …" rifiutato e fail-closed su rete giù. Il marcatore nel markdown non autorizza più niente.
//
// Quello che restava è il titolo del difetto: **nessuna segregazione proponente/firmatario.** La
// tabella dove vive la firma la scrive anche il cervello, con la stessa chiave di servizio con cui la
// legge (`git-github.mjs::stampSegnale`, `sentinella-dati.mjs`). Niente, a livello di permessi,
// impedisce a uno script di scriversi `azione:<id>:firma = "nicola …"` e poi rileggerlo come consenso.
// La separazione era una convenzione fra script educati, non un confine.
//
// Qui si esegue la decisione su script finti; poi si guarda il cervello vero.

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { chiaviDichiarate, codiceUscita, difettiFirma, riservataANicola, scriveImpostazioni } from "../firma-riservata.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/firma-check.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const SCRITTURA = 'await fetch(`${url}/rest/v1/impostazioni?on_conflict=chiave`, {\n  method: "POST",\n  body: JSON.stringify({ chiave: k, valore: v }),\n});';

prova("il caso che ha rotto: uno script che scrive la chiave di firma", () => {
  const finto = `export const CHIAVI_SCRITTE = ["azione:12:firma"];\n${SCRITTURA}`;
  const d = difettiFirma(finto, "cattivo.mjs");
  assert.equal(d.length, 1);
  assert.equal(d[0].difetto, "firma_scritta_dal_cervello");
});

prova("scrivere su impostazioni senza dire cosa si scrive è già un difetto", () => {
  // «Non dichiara» non è «non scrive»: è la stessa forma dell'uscita non dichiarata (AR-272).
  const d = difettiFirma(SCRITTURA, "muto.mjs");
  assert.deepEqual(d.map((x) => x.difetto), ["scrittura_non_dichiarata"]);
});

prova("chi dichiara solo chiavi innocue passa", () => {
  const finto = `export const CHIAVI_SCRITTE = ["automazione:"];\n${SCRITTURA}`;
  assert.deepEqual(difettiFirma(finto, "buono.mjs"), []);
});

prova("leggere non è scrivere: un `select=` non fa scattare niente", () => {
  const lettura = 'const r = await fetch(`${url}/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1`, { headers: h });';
  assert.equal(scriveImpostazioni(lettura), false);
  assert.deepEqual(difettiFirma(lettura, "legge.mjs"), []);
});

prova("una firma umana costruita nel codice è un difetto — ma solo se lo script può scriverla", () => {
  // Senza la seconda condizione il controllo accusava round3-memoria.mjs, che quella frase ce l'ha
  // dentro una nota di memoria che DESCRIVE il contratto: prosa in una stringa, non una scrittura.
  // Un metro che accusa chi documenta la regola insegna a non documentarla più.
  const soloProsa = 'const nota = "il clic scrive `azione:<id>:firma` = \\"nicola <data ora>\\" in Supabase";';
  assert.deepEqual(difettiFirma(soloProsa, "racconta.mjs"), []);
  const forgia = `export const CHIAVI_SCRITTE = ["automazione:"];\nconst v = { chiave: \`azione:\${id}:firma\`, valore: "nicola 2026-07-28 16:40" };\n${SCRITTURA}`;
  assert.ok(difettiFirma(forgia, "forgia.mjs").some((d) => d.difetto === "firma_forgiata"));
});

prova("quali chiavi sono di Nicola, e quali no", () => {
  assert.equal(riservataANicola("azione:AR-1:firma"), true);
  assert.equal(riservataANicola("firma:qualcosa"), true);
  assert.equal(riservataANicola("azione:AR-1"), false, "lo STATO dell'azione lo scrive la macchina: non è la firma");
  assert.equal(riservataANicola("automazione:giro"), false);
  assert.equal(riservataANicola("pausa"), false);
});

prova("la dichiarazione assente è null, non lista vuota: sono due cose diverse", () => {
  assert.equal(chiaviDichiarate("niente qui"), null);
  assert.deepEqual(chiaviDichiarate('const CHIAVI_SCRITTE = ["a:", "b:"]'), ["a:", "b:"]);
});

prova("il contratto del guardiano: 0 · 1 · 2, e il cieco vince", () => {
  assert.equal(codiceUscita({ violazioni: 0 }), 0);
  assert.equal(codiceUscita({ violazioni: 2 }), 1);
  assert.equal(codiceUscita({ cieco: 1, violazioni: 0 }), 2);
});

// ── Il guardiano VERO ───────────────────────────────────────────────────────

prova("il guardiano trova la violazione in una cartella finta", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-firma-"));
  try {
    writeFileSync(join(dir, "buono.mjs"), `export const CHIAVI_SCRITTE = ["automazione:"];\n${SCRITTURA}`);
    writeFileSync(join(dir, "cattivo.mjs"), `export const CHIAVI_SCRITTE = ["azione:1:firma"];\n${SCRITTURA}`);
    const r = spawnSync("node", [GUARDIANO], { cwd: REPO, encoding: "utf8", env: { ...process.env, FIRMA_DIR: dir } });
    assert.equal(r.status, 1);
    assert.match(`${r.stdout}${r.stderr}`, /cattivo\.mjs/);
    assert.doesNotMatch(`${r.stdout}${r.stderr}`, /buono\.mjs/, "chi dichiara chiavi innocue non va accusato");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

prova("cartella vuota = CIECO (2), non verde", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-firma-vuota-"));
  try {
    const r = spawnSync("node", [GUARDIANO], { cwd: REPO, encoding: "utf8", env: { ...process.env, FIRMA_DIR: dir } });
    assert.equal(r.status, 2, "niente da controllare non vuol dire tutto a posto");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ── Il cervello VERO ────────────────────────────────────────────────────────

prova("sul cervello vero nessuno script scrive la firma, e senza esenzioni", () => {
  const r = spawnSync("node", [GUARDIANO], { cwd: REPO, encoding: "utf8" });
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
  const guard = readFileSync(join(REPO, "cervello/firma-check.mjs"), "utf8");
  assert.match(guard, /const ESENZIONI = \{\};/,
    "il verde vale solo se non è comprato con un'esenzione: le due che c'erano dicevano il falso");
});

prova("i due che scrivono davvero su impostazioni dichiarano cosa toccano", () => {
  for (const f of ["git-github.mjs", "sentinella-dati.mjs"]) {
    const t = readFileSync(join(REPO, "cervello", f), "utf8");
    assert.equal(scriveImpostazioni(t), true, `${f} dovrebbe scrivere su impostazioni`);
    const chiavi = chiaviDichiarate(t);
    assert.ok(chiavi && chiavi.length, `${f}: scrive e non dichiara cosa`);
    assert.ok(chiavi.every((c) => !riservataANicola(c)), `${f}: dichiara una chiave di firma`);
  }
});

prova("la metà già riparata resta in piedi: la firma la legge da Supabase e rifiuta «auto»", () => {
  // Se qualcuno rimettesse in piedi la vecchia strada (il marcatore nel file che vale come firma),
  // questo lotto avrebbe messo una guardia su una porta che nel frattempo è tornata aperta.
  const c = readFileSync(join(REPO, "cervello/consenso-azione.mjs"), "utf8");
  assert.match(c, /export async function firmaPannello/);
  assert.match(c, /FIRMA_UMANA_RE\s*=\s*\/\^\\s\*nicola/, "solo «nicola» apre il cancello, «auto» no");
  const i = c.indexOf("const f = await firmaPannello(blk.id);");
  assert.ok(i > 0, "consensoInvio deve chiedere la firma del Pannello");
  const dopo = c.slice(i, i + 700);
  assert.match(dopo, /if \(!f\.firmata\)/, "e se non è firmata, si ferma lì");
});

prova("il verdetto arriva al motore del giro", () => {
  const g = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  assert.match(g, /if ! guardiano firma-check\.mjs; then/);
  const iVar = g.indexOf('FIRMA_VINCOLO=""');
  const iUso = g.indexOf('FIRMA_VINCOLO="$(vincolo_da_rc');
  assert.ok(iVar > 0 && iVar < iUso, "dichiarata prima di essere riempita (set -u)");
  assert.match(g, /## Vincolo confine della firma \(HARD[^\n]*\n\$FIRMA_VINCOLO/,
    "riempire un vincolo senza infilarlo nel prompt è il difetto di prima con un nome nuovo");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
