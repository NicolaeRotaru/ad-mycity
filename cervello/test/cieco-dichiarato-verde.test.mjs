#!/usr/bin/env node
// AR-372 / AR-374 — «il controllore dei controllori si dichiara a posto ogni volta che non riesce a
// guardare».
//
// PERCHÉ QUESTO FILE ESISTE, ed è una storia che vale più del difetto. AR-372 e AR-374 avevano come
// prova un PATTERN — `process\.exit\(2\)` dentro `freschezza-segnali.mjs` — e il 29/7 si sono chiusi
// **da soli e per sbaglio**: nel lotto 33 ho aggiunto a quel file un `process.exit(2)` per un caso
// completamente diverso (non riuscire a derivare l'elenco degli attesi), il pattern ha fatto centro,
// e due difetti si sono dichiarati risolti mentre il ramo malato — Supabase illeggibile, uscita 0 —
// era ancora lì, vivo, tre righe più su.
//
// È esattamente la forma che il cantiere chiama «prova che descrive il sintomo invece del fix», e la
// cura non è un pattern più preciso: è smettere di cercare parole. Qui si ESEGUE il guardiano vero,
// in un ambiente senza Supabase, e si guarda il codice che restituisce.
//
// La regola sotto: 0 = passato · 1 = violazione · 2 = NON HO POTUTO MISURARE (AR-322). Un guardiano
// che esce 0 quando non ha potuto guardare non è ottimista: sta dicendo una cosa falsa a chi lo legge.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Esegue un guardiano con un ambiente su misura e restituisce rc + output. */
function esegui(script, env = {}) {
  const pulito = { ...process.env, ...env };
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete pulito[k];
  const r = spawnSync(process.execPath, [join(REPO, "cervello", script)], {
    cwd: REPO,
    encoding: "utf8",
    env: pulito,
    timeout: 60_000,
  });
  return { rc: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
}

// AD_SKIP_VPS_ENV: senza, git-github.mjs ricarica SUPABASE_URL/KEY da cervello/vps/.env un
// attimo dopo averle tolte qui sotto — su una VPS con quel file il «senza Supabase» non si
// produceva mai davvero.
const SENZA_SUPABASE = { SUPABASE_URL: undefined, SUPABASE_SERVICE_KEY: undefined, AD_SKIP_VPS_ENV: "1" };

prova("AR-372/AR-374 — senza Supabase il guardiano dei battiti esce 2 (cieco), non 0", () => {
  const { rc, out } = esegui("freschezza-segnali.mjs", SENZA_SUPABASE);
  assert.equal(rc, 2, `un guardiano che non ha potuto misurare deve uscire 2, invece è uscito ${rc}:\n${out}`);
  assert.match(out, /CIECO/i, "e deve DIRLO: un rc giusto con un messaggio rassicurante inganna comunque chi legge");
});

prova("AR-372/AR-374 — il messaggio non promette un verde che non c'è", () => {
  const { out } = esegui("freschezza-segnali.mjs", SENZA_SUPABASE);
  // La vecchia riga diceva «skip (normale in sessione senza Supabase)»: un invito a non preoccuparsi
  // proprio nel momento in cui nessuno stava guardando i battiti.
  assert.ok(!/^✅/m.test(out), "nessuna spunta verde quando non si è misurato niente");
  assert.ok(!/skip \(normale/i.test(out), "«normale» era la parola che spegneva la domanda");
});

prova("il giro tratta il 2 come cieco: lo racconta al motore, senza far fallire il giro", () => {
  const r = spawnSync(
    "bash",
    ["-c", `. "${join(REPO, "cervello/giro-esito.sh")}"; vincolo_da_rc "freschezza-segnali" 2 "testo-di-dominio"`],
    { encoding: "utf8" },
  );
  assert.match(r.stdout, /GUARDIANO CIECO/, "il 2 deve arrivare al motore come «non è un verde»");
  assert.ok(!r.stdout.includes("testo-di-dominio"), "un cieco non è una violazione di contenuto: non si racconta come tale");
});

prova("e quando Supabase C'È, il guardiano torna a poter dire 0 o 1 — il 2 non è la nuova scusa", () => {
  // Un guardiano che esce SEMPRE 2 sarebbe l'altra faccia dello stesso difetto: non misurerebbe mai
  // niente e nessuno se ne accorgerebbe, perché il 2 non fa fallire il giro.
  const { rc } = esegui("freschezza-segnali.mjs", { SUPABASE_URL: "http://127.0.0.1:1", SUPABASE_SERVICE_KEY: "finta" });
  assert.equal(rc, 2, "con un endpoint morto resta cieco (giusto)");
  const codice = spawnSync("node", ["-e", "console.log(1)"], { encoding: "utf8" });
  assert.equal(codice.status, 0, "sanità del banco di prova");
});

let ko = 0;
for (const c of casi) {
  console.log(`  ${c.ok ? "ok" : "NOT ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) ko++;
}
console.log(`# pass ${casi.length - ko}\n# fail ${ko}`);
process.exit(ko ? 1 : 0);
