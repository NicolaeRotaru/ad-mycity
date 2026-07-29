#!/usr/bin/env node
// AR-333 — la porta generica che scavalca il confine della firma.
//
// Trovata il 28/7 tirando il filo del lotto 25. `POST /api/controllo` nasce per due interruttori — la
// PAUSA e il tetto di spesa — e il commento in cima alla rotta li nomina. Ma il codice leggeva
// `{chiave, valore}` dal corpo e li passava a `setImpostazione` **senza guardare la chiave**: quella
// rotta poteva scrivere qualunque riga di `impostazioni`, compresa `azione:<id>:firma`.
//
// È lo stesso confine che il lotto 25 aveva appena sorvegliato dall'altro lato (`firma-check.mjs`
// impedisce agli script del cervello di scriversi la firma). Un confine con due porte, di cui una
// senza controllo, non è un confine: è un corridoio.
//
// Qui si esegue la decisione su chiavi finte, e poi si guarda la rotta vera.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { CHIAVI_CONTROLLO, riservata, scrivibileDaControllo } = await import(
  join(REPO, "pannello/src/lib/chiavi-scrivibili.ts")
);

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: dalla rotta di controllo si scriveva la firma di Nicola", () => {
  const v = scrivibileDaControllo("azione:AR-12:firma");
  assert.equal(v.ok, false);
  assert.match(v.motivo, /firma di Nicola/);
  assert.match(v.motivo, /firma-azione/, "e deve dire qual è la strada giusta, non solo che questa è sbarrata");
});

prova("gli interruttori veri passano: il Pannello non si rompe", () => {
  // Le due che GovernoAD manda davvero. Se una di queste fosse bloccata, il pulsante PAUSA di Nicola
  // smetterebbe di funzionare al primo deploy — e questa PR pubblica.
  for (const k of ["pausa", "tetto_spesa"]) {
    assert.equal(scrivibileDaControllo(k).ok, true, `${k} deve restare scrivibile`);
  }
});

prova("una chiave sconosciuta NON passa: fail-closed", () => {
  // È così che questa rotta è diventata una porta di servizio: tutto ciò che non era vietato passava.
  assert.equal(scrivibileDaControllo("qualunque_cosa").ok, false);
  assert.equal(scrivibileDaControllo("").ok, false);
  assert.equal(scrivibileDaControllo(null).ok, false);
  assert.equal(scrivibileDaControllo({ chiave: "pausa" }).ok, false, "un oggetto non è una chiave");
});

prova("il doppio fondo: anche se la firma finisse nella lista, resterebbe vietata", () => {
  // La lista dei permessi si può allargare per distrazione; questa regola no.
  assert.equal(riservata("azione:1:firma"), true);
  assert.equal(riservata("firma:qualcosa"), true);
  assert.equal(riservata("azione:1"), false, "lo STATO dell'azione lo scrive la macchina: non è la firma");
  const conFirmaInLista = [...CHIAVI_CONTROLLO, "azione:1:firma"];
  assert.ok(conFirmaInLista.includes("azione:1:firma"));
  assert.equal(scrivibileDaControllo("azione:1:firma").ok, false, "la lista non basta a sbloccarla");
});

prova("nessuna chiave della lista è inventata: esistono tutte nel codice", () => {
  // Alla prima stesura ne avevo messa una quinta, `modello_ai`, che compariva SOLO nel mio file.
  // Una chiave inventata in una lista di permessi è un permesso inventato.
  const dove = ["pannello/src", "cervello"];
  for (const k of CHIAVI_CONTROLLO) {
    const trovate = execFileSync(
      "bash",
      ["-c", `grep -rl '"${k}"' ${dove.join(" ")} --include='*.ts' --include='*.tsx' --include='*.mjs' 2>/dev/null | grep -v chiavi-scrivibili || true`],
      { cwd: REPO, encoding: "utf8" },
    ).trim();
    assert.ok(trovate.length > 0, `"${k}" non compare da nessuna parte fuori dalla lista: l'ho inventata`);
  }
});

// ── La rotta VERA ───────────────────────────────────────────────────────────

prova("la rotta chiede il permesso PRIMA di scrivere", () => {
  const r = readFileSync(join(REPO, "pannello/src/app/api/controllo/route.ts"), "utf8");
  const iCheck = r.indexOf("scrivibileDaControllo(chiave)");
  const iScrittura = r.indexOf("setImpostazione(String(chiave)");
  assert.ok(iCheck > 0, "la rotta deve chiamare il controllo");
  assert.ok(iCheck < iScrittura, "e chiamarlo PRIMA della scrittura, non dopo");
});

prova("ogni handler che muta sta dentro il perimetro del middleware", () => {
  // Il middleware (AR-226) copre `/api/:path*`. Un handler mutante fuori da lì — una server action,
  // una route in un altro ramo dell'app — sarebbe scoperto, e nessuno se ne accorgerebbe finché non
  // fa danni. Oggi sono zero: la prova serve per il primo che comparirà.
  const fuori = execFileSync(
    "bash",
    ["-c", "grep -rl 'export async function \\(POST\\|PUT\\|DELETE\\|PATCH\\)' pannello/src 2>/dev/null | grep -v 'app/api/' || true"],
    { cwd: REPO, encoding: "utf8" },
  ).trim();
  assert.equal(fuori, "", `handler mutanti fuori dal perimetro del middleware:\n${fuori}`);
  const actions = execFileSync("bash", ["-c", "grep -rl '\"use server\"' pannello/src 2>/dev/null || true"], { cwd: REPO, encoding: "utf8" }).trim();
  assert.equal(actions, "", `server action fuori dal perimetro:\n${actions}`);
  const mw = readFileSync(join(REPO, "pannello/src/middleware.ts"), "utf8");
  assert.match(mw, /matcher:\s*\["\/api\/:path\*"\]/, "se il perimetro cambia, questa prova va rivista insieme");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
