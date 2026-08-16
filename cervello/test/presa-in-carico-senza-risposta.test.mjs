#!/usr/bin/env node
// 🪪 AR-626 — «Se la conferma della presa in carico si perde per strada, il lavoro resta segnato in
// corso per un'ora senza che nessuno lo esegua.»
//
// IL FATTO. Il worker prende un lavoro con una PATCH compare-and-set e `return=representation`: se
// la riga torna, è sua. Se non torna, la salta — giusto, ed è la difesa contro il doppio invio. Ma
// «il server ha risposto che non è tua» e «la risposta non è arrivata» finivano nello stesso ramo.
// Quando la PATCH va a segno e la risposta si perde, nel database quel lavoro è `in_corso` e non lo
// sta eseguendo nessuno: lo ripesca il recupero orfani dopo SOGLIA_ORFANO_MIN, che vale 60. Un'ora
// di silenzio su una domanda in chat.
//
// LA CURA, e perché non riapre la porta al doppio invio: i casi diventano tre — presa · non presa ·
// non lo so — e il terzo si risolve RILEGGENDO la riga. Si riprende solo con un segno che nessun
// altro può avere per caso: il nostro `worker_owner`, oppure l'`updated_at` che abbiamo appena
// scritto noi, confrontato come ISTANTE (PostgREST rende la data nel suo fuso, quindi due stringhe
// diverse possono essere lo stesso momento).
//
// COSA PROVA:
//   ① la testa: tre risposte, non due — e «non ho letto» non è «non è mia»;
//   ② IL CASO CHE HA ROTTO, eseguito sul blocco VERO di worker.sh: la curl fallisce, la PATCH era
//      passata, e il worker esegue il lavoro invece di lasciarlo fermo un'ora;
//   ③ la porta NON si è aperta: se la riga in corso è di un altro worker, o è tornata in attesa, o
//      non si riesce a rileggerla, il lavoro si salta come prima;
//   ④ il caso normale (risposta arrivata, riga vuota) si comporta esattamente come prima.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/esito-claim.mjs`, facendo tornare
// a `decidiClaim` la vecchia risposta a due valori — `salta` invece di `verifica` quando la chiamata
// non è arrivata — il caso ② diventa ROSSO: il lavoro viene saltato e resta in corso senza nessuno.

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { decidiClaim, esitoRilettura, stessoIstante } from "../esito-claim.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKER = join(REPO, "cervello", "worker.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ═══ ① la testa: tre risposte, non due ═══════════════════════════════════════════════════════════

prova("① la riga è tornata → si procede", () => {
  assert.equal(decidiClaim({ rc: 0, corpo: '[{"id":"j1","stato":"in_corso"}]' }).azione, "procedi");
});

prova("① il server dice «non è tua» (risposta vuota, letta bene) → si salta, come prima", () => {
  assert.equal(decidiClaim({ rc: 0, corpo: "[]" }).azione, "salta");
});

prova("① IL TERZO CASO: la risposta non è arrivata → non è «non è tua», è «non lo so»", () => {
  assert.equal(decidiClaim({ rc: 7, corpo: "" }).azione, "verifica");
  assert.equal(decidiClaim({ rc: 28, corpo: "" }).azione, "verifica", "un timeout è la stessa cosa di una rete caduta");
  assert.equal(decidiClaim({ rc: 0, corpo: "<html>502 Bad Gateway" }).azione, "verifica", "una risposta illeggibile non è un no");
});

prova("① rileggendo: si riprende SOLO con un segno che nessun altro può avere", () => {
  const io = "worker-1";
  const timbro = "2026-08-15T10:00:00+02:00";
  const conNome = `[{"id":"j1","stato":"in_corso","worker_owner":"${io}","updated_at":"${timbro}"}]`;
  assert.equal(esitoRilettura({ corpo: conNome, ioSono: io, timbro }).azione, "procedi");
  // Lo stesso istante scritto in un altro fuso: è nostro lo stesso, e il confronto sul TESTO lo perderebbe.
  const altroFuso = `[{"id":"j1","stato":"in_corso","updated_at":"2026-08-15T08:00:00+00:00"}]`;
  assert.equal(esitoRilettura({ corpo: altroFuso, ioSono: io, timbro }).azione, "procedi");
  assert.equal(stessoIstante("2026-08-15T10:00:00+02:00", "2026-08-15T08:00:00Z"), true);
});

// ═══ ③ la porta al doppio invio resta chiusa ═════════════════════════════════════════════════════

prova("③ la riga in corso è di un ALTRO worker → giù le mani", () => {
  const r = esitoRilettura({
    corpo: '[{"id":"j1","stato":"in_corso","worker_owner":"worker-2","updated_at":"2026-08-15T10:00:00+02:00"}]',
    ioSono: "worker-1",
    timbro: "2026-08-15T10:00:00+02:00",
  });
  assert.equal(r.azione, "salta", "stesso istante ma nome diverso: il nome vince, o due worker eseguono lo stesso lavoro");
});

prova("③ la riga è tornata in attesa → la presa in carico non era passata: si salta e si ripesca", () => {
  const r = esitoRilettura({ corpo: '[{"id":"j1","stato":"in_attesa"}]', ioSono: "worker-1", timbro: "2026-08-15T10:00:00+02:00" });
  assert.equal(r.azione, "salta");
});

prova("③ non si riesce a rileggere → si aspetta, non si tira a indovinare", () => {
  for (const corpo of ["", "boh", "[]", null]) {
    assert.equal(esitoRilettura({ corpo, ioSono: "worker-1", timbro: "2026-08-15T10:00:00+02:00" }).azione, "salta", `corpo: ${JSON.stringify(corpo)}`);
  }
});

prova("③ in corso senza nome e con un timbro che non è il nostro → non è nostra", () => {
  const r = esitoRilettura({
    corpo: '[{"id":"j1","stato":"in_corso","updated_at":"2026-08-15T09:00:00+02:00"}]',
    ioSono: "worker-1",
    timbro: "2026-08-15T10:00:00+02:00",
  });
  assert.equal(r.azione, "salta");
});

// ═══ ② e ④ il blocco VERO di worker.sh, eseguito ═════════════════════════════════════════════════

/** Le righe vere della presa in carico, ritagliate da worker.sh e non ricopiate. */
function bloccoDelClaim() {
  const righe = readFileSync(WORKER, "utf8").split("\n");
  const da = righe.findIndex((r) => r.trimStart().startsWith("_claim_ts="));
  assert.ok(da >= 0, "la presa in carico non si trova più in worker.sh: la prova non può passare a vuoto");
  const a = righe.findIndex((r, i) => i > da && r.trim() === "fi" && righe[i - 1].includes("continue"));
  assert.ok(a > da, "non trovo la fine del blocco della presa in carico");
  return righe.slice(da, a + 1).join("\n");
}

/**
 * Esegue quel blocco con una `curl` finta.
 * `rcPatch` = com'è andata la PATCH per il worker · `riletta` = cosa risponde la rilettura.
 * Torna: il lavoro è stato eseguito (nessun `continue`) oppure saltato?
 */
function presaInCarico({ rcPatch = 0, rispostaPatch = "[]", riletta = "[]" } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "ar626-"));
  const eseguito = join(tmp, "eseguito");
  const copione = join(tmp, "prova.sh");
  writeFileSync(
    copione,
    [
      "set -u",
      "ts() { echo 00:00; }",
      `SCRIPT_DIR='${join(REPO, "cervello")}'`,
      "SUPABASE_URL=https://finto.invalido",
      "AUTH=(-H 'apikey: x')",
      "WORKER_ID=worker-1",
      "HAS_OWNER_COL=1",
      "id=j1",
      // La curl finta: la PATCH va come chiede il caso, la rilettura (GET) risponde a parte.
      "curl() {",
      '  case "$*" in',
      `    *PATCH*) printf '%s' ${JSON.stringify(rispostaPatch)}; return ${rcPatch} ;;`,
      `    *) printf '%s' ${JSON.stringify(riletta)}; return 0 ;;`,
      "  esac",
      "}",
      // `continue` fuori da un ciclo è un errore: il blocco vero vive dentro il `while` del worker.
      "for _giro in 1; do",
      bloccoDelClaim(),
      `  printf 1 > '${eseguito}'`,
      "done",
      "",
    ].join("\n"),
  );
  chmodSync(copione, 0o755);
  const r = spawnSync("bash", [copione], { encoding: "utf8", timeout: 60_000 });
  return { eseguito: existsSync(eseguito), testo: `${r.stdout || ""}${r.stderr || ""}`, status: r.status };
}

prova("② IL CASO CHE HA ROTTO: la conferma si perde ma la PATCH era passata → il lavoro parte", () => {
  const r = presaInCarico({
    rcPatch: 7, // la curl è morta: nessuna risposta
    rispostaPatch: "",
    riletta: '[{"id":"j1","stato":"in_corso","worker_owner":"worker-1","updated_at":"2026-01-01T00:00:00Z"}]',
  });
  assert.equal(r.eseguito, true, `il lavoro è rimasto fermo in corso senza nessuno che lo esegua: ${r.testo.slice(-300)}`);
});

prova("② … e la rilettura dice che è di un altro → il lavoro NON parte (niente doppio invio)", () => {
  const r = presaInCarico({
    rcPatch: 7,
    rispostaPatch: "",
    riletta: '[{"id":"j1","stato":"in_corso","worker_owner":"worker-2","updated_at":"2026-01-01T00:00:00Z"}]',
  });
  assert.equal(r.eseguito, false, "due worker stanno per eseguire lo stesso lavoro");
});

prova("④ il caso di sempre non cambia: riga tornata → si esegue · risposta vuota → si salta", () => {
  assert.equal(presaInCarico({ rcPatch: 0, rispostaPatch: '[{"id":"j1","stato":"in_corso"}]' }).eseguito, true);
  assert.equal(presaInCarico({ rcPatch: 0, rispostaPatch: "[]" }).eseguito, false);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
