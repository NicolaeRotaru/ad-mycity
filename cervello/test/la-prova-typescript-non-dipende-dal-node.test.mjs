#!/usr/bin/env node
// 🧬 UNA PROVA IN TYPESCRIPT NON DEVE DIPENDERE DALLA VERSIONE DI CHI PASSA — AR-865.
//
// IL DIFETTO. Sette voci di `cervello/mutanti.json` puntano a prove `.mts`. Il piano era
// `node <file>.mts`, e regge SOLO perche' questo node e' il 22.22, che i tipi li toglie da solo. Su
// un node piu' vecchio quel comando esce ≠ 0 — e ≠ 0 e' esattamente il segnale con cui il banco
// riconosce «la prova e' diventata rossa». Quelle sette voci comprerebbero il verde qualunque cosa
// faccia la mutazione: AR-840 in un'altra veste, sulla stessa strada appena curata.
//
// ⚠️ COSA E' MISURATO E COSA NO. Su questa macchina c'e' un solo node, quindi «su un node piu'
// vecchio» non lo posso provare cambiando interprete. Lo provo SPEGNENDO la capacita' che lo salva:
// `--no-experimental-strip-types` mette questo node nella condizione di quello vecchio davanti a un
// file `.mts`. Non e' una deduzione letta nel codice: e' un comando che gira in ③ e la cui uscita
// viene controllata qui. Resta ⚪ non misurato: il comportamento di una versione di node che su
// questa macchina non esiste.
//
// Comando:  node cervello/test/la-prova-typescript-non-dipende-dal-node.test.mjs

import { test as prova } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { comeSiEsegue, spezzaComando, avvioFallito } from "../esecuzione-prova.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PROVA_MTS = "pannello/src/lib/lavoro-negozio.test.mts";

prova("① una prova .mts non si lancia con `node`: l'esecutore lo decide la specie del file", () => {
  const p = comeSiEsegue(PROVA_MTS);
  assert.equal(p.ok, true, p.perche);
  assert.equal(p.forma, "percorso-typescript");
  const passo = p.passi[0];
  assert.notEqual(passo.comando, "node", "e' tornato `node file.mts`: il piano dipende ancora dalla versione dell'interprete");
  assert.equal(passo.comando, "npx");
  assert.ok(passo.argomenti.includes("tsx"), `esecutore non dichiarato: ${passo.argomenti.join(" ")}`);
  assert.deepEqual(p.percorsi, [PROVA_MTS]);
});

prova("② lo stesso vale per .ts, .cts, .tsx — e NON per .mjs, che node esegue davvero", () => {
  for (const t of ["pannello/src/lib/x.ts", "pannello/src/lib/x.cts", "pannello/src/lib/x.tsx"]) {
    assert.equal(comeSiEsegue(t).passi[0].comando, "npx", `${t} finisce ancora a node`);
  }
  assert.equal(comeSiEsegue("cervello/test/x.test.mjs").passi[0].comando, "node");
  assert.equal(comeSiEsegue("cervello/test/x.bats").argomenti === undefined && comeSiEsegue("cervello/test/x.bats").passi[0].argomenti[0], "bats");
});

prova("③ MISURATO: senza la levatura dei tipi, `node prova.mts` esce ≠ 0 — cioe' finge un rosso", (t) => {
  const r = spawnSync(process.execPath, ["--no-experimental-strip-types", join(REPO, PROVA_MTS)], {
    cwd: REPO,
    encoding: "utf8",
  });
  const uscita = `${r.stdout || ""}${r.stderr || ""}`;
  if (/bad option|not allowed in NODE_OPTIONS|Unknown option/i.test(uscita)) {
    // ⚪ questo node non sa spegnere la levatura dei tipi: da qui non posso mettermi nei panni di
    // quello vecchio. Non e' un verde e non e' un rosso: e' che non ho misurato.
    t.skip("questo node non accetta --no-experimental-strip-types: non posso simulare l'interprete vecchio");
    return;
  }
  assert.notEqual(r.status, 0, "senza levatura dei tipi il file gira lo stesso: allora il difetto non esisteva");
  assert.match(uscita, /ERR_UNKNOWN_FILE_EXTENSION/);

  // E qui il punto vero: quell'uscita ≠ 0 il banco la leggeva come «prova diventata rossa».
  const motivo = avvioFallito({ uscita, entrata: join(REPO, PROVA_MTS) });
  assert.ok(motivo, "il banco crede ancora che sia una prova diventata rossa: e' un verde comprato");
  assert.match(motivo, /estensione non riconosciuta|non e' una prova diventata rossa/);
});

prova("④ una mutazione che rompe un import verso un file di altra specie resta un ROSSO, non un ⚪", () => {
  // La difesa di ③ dev'essere stretta: se bastasse la parola ERR_UNKNOWN_FILE_EXTENSION ovunque,
  // ogni mutazione che sporca un import diventerebbe un ⚪ regalato — cioe' la copertura sparirebbe
  // proprio dove serve. Qui l'estensione ignota e' di un ALTRO file, non di quello che ho lanciato.
  const uscita = 'TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".txt" for /repo/altro/importato.txt';
  assert.equal(avvioFallito({ uscita, entrata: "cervello/test/mia-prova.test.mjs" }), null);
});

prova("⑤ il piano che produco e' una riga che il parser stesso accetta", () => {
  const passo = comeSiEsegue(PROVA_MTS).passi[0];
  const riga = `${passo.comando} ${passo.argomenti.join(" ")}`;
  const s = spezzaComando(riga);
  assert.equal(s.ok, true, `il mio stesso piano non passa dal parser: ${s.perche} — «${riga}»`);
});

prova("⑥ le voci .mts del registro vero non finiscono piu' a `node`", () => {
  const mutanti = JSON.parse(readFileSync(join(REPO, "cervello/mutanti.json"), "utf8")).mutanti;
  const ts = mutanti.filter((m) => /\.(m|c)?tsx?$/.test(String(m.test || "").split(/\s+/).pop() || ""));
  assert.ok(ts.length > 0, "nessuna voce .mts nel registro: questo caso non guarda piu' niente");
  for (const m of ts) {
    const p = comeSiEsegue(m.test, { radiciAmmesse: [REPO] });
    assert.equal(p.ok, true, `${m.difetto}: ${p.perche}`);
    assert.notEqual(
      p.passi[0].comando === "node" && p.passi[0].argomenti.length === 1,
      true,
      `${m.difetto} gira ancora come «node ${m.test}»`,
    );
  }
});

prova("⑦ il piano scelto GIRA davvero su questa macchina — e se non gira e' ⚪, mai un finto rosso", () => {
  const passo = comeSiEsegue(PROVA_MTS).passi[0];
  const r = spawnSync(passo.comando, passo.argomenti, { cwd: REPO, encoding: "utf8", timeout: 120000 });
  const uscita = `${r.stdout || ""}${r.stderr || ""}`;
  if (r.status === 0) return; // l'esecutore c'e' e la prova gira: e' il caso buono
  const motivo = avvioFallito({ errore: r.error || null, uscita, entrata: PROVA_MTS });
  assert.ok(
    motivo,
    `l'esecutore non c'e' e nessuno se n'e' accorto: il banco leggerebbe questa uscita ≠ 0 come «prova diventata rossa».\n${uscita.slice(0, 800)}`,
  );
});
