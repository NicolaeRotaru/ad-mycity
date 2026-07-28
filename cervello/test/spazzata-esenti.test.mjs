#!/usr/bin/env node
// AR-334 — le esenzioni del registro delle malattie devono FUNZIONARE, non solo essere documentate.
//
// Il registro promette: «Se una istanza resta apposta, mettila in `esenti` con il PERCHÉ scritto».
// Chi lo faceva alla lettera restava rosso: le voci di `esenti` entravano solo in `file_noti` (servivano
// a non segnalare un file NUOVO) e dal conteggio non venivano mai sottratte. L'unica via d'uscita che
// funzionava era alzare il tetto — il gesto che il cricchetto esiste apposta per impedire.
//
// Qui si esegue lo strumento VERO su un albero finto: un'istanza reale, dichiarata esente, deve dare
// verde; un'esenzione che non corrisponde più a niente deve dare rosso (un residuo nasconde il
// prossimo caso vero).

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const STRUMENTO = join(QUI, "..", "spazzata-fratelli.mjs");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/** Albero finto: una sola malattia, `istanze` occorrenze in un file, + le esenzioni passate. */
function scenario({ istanze, esenti, baseline }) {
  const base = mkdtempSync(join(tmpdir(), "spazzata-"));
  mkdirSync(join(base, "codice"), { recursive: true });
  writeFileSync(join(base, "codice", "malato.mjs"), Array.from({ length: istanze }, (_, i) => `chiamata${i}().catch(() => {});`).join("\n") + "\n");
  const registro = join(base, "malattie.json");
  writeFileSync(
    registro,
    JSON.stringify({
      malattie: [
        {
          id: "prova",
          nome: "malattia di prova",
          pattern: "catch\\(\\(\\) => \\{\\}\\)",
          dove: ["codice"],
          estensioni: [".mjs"],
          baseline,
          esenti,
        },
      ],
    })
  );
  try {
    const out = execFileSync("node", [STRUMENTO, "--json"], {
      encoding: "utf8",
      env: { ...process.env, SPAZZATA_REPO: base, SPAZZATA_REGISTRO: registro },
      stdio: "pipe",
    });
    return { rc: 0, rep: JSON.parse(out).malattie[0], ok: JSON.parse(out).ok };
  } catch (e) {
    const testo = String(e.stdout || "{}");
    return { rc: e.status ?? 1, rep: JSON.parse(testo).malattie[0], ok: false };
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

prova("il caso che ha rotto: dichiarare l'istanza esente ora abbassa davvero il conteggio", () => {
  // 2 istanze, 1 dichiarata legittima col perché, tetto a 1 → deve tornare verde seguendo il manuale.
  const r = scenario({
    istanze: 2,
    baseline: 1,
    esenti: [{ file: "codice/malato.mjs", quale: "chiamata0", perche: "qui l'errore è davvero irrilevante" }],
  });
  assert.equal(r.rep.totale_lordo, 2, "le istanze trovate restano due");
  assert.equal(r.rep.totale, 1, "una è esente: il conteggio confrontato col tetto è 1");
  assert.equal(r.rep.cresciuta, false);
  assert.equal(r.rc, 0, "seguendo la documentazione si deve tornare verdi");
});

prova("un'esenzione senza il PERCHÉ non vale (il registro lo chiede, e ora conta)", () => {
  const r = scenario({
    istanze: 2,
    baseline: 1,
    esenti: [{ file: "codice/malato.mjs", quale: "chiamata0" }],
  });
  assert.equal(r.rep.totale, 2, "senza motivo non si sottrae niente");
  assert.equal(r.rc, 1);
});

prova("un'esenzione che non corrisponde più a niente è un residuo, e si vede", () => {
  // È il modo in cui un'esenzione diventa una bugia: il codice cambia, l'esenzione resta, e da lì in
  // poi copre il prossimo caso vero che nascerà in quel file.
  const r = scenario({
    istanze: 1,
    baseline: 1,
    esenti: [{ file: "codice/sparito.mjs", quale: "roba", perche: "motivo scritto" }],
  });
  // AR-338: il messaggio adesso porta anche il PERCHÉ dello scarto — un guardiano che dice solo «no»
  // costringe a indovinare quale delle quattro regole è scattata. L'asserzione resta esatta sulla
  // parte che identifica l'esenzione, e in più pretende che il motivo ci sia: è più stretta di
  // prima, non più larga.
  assert.equal(r.rep.esenti_orfane.length, 1);
  assert.match(r.rep.esenti_orfane[0], /^codice\/sparito\.mjs: roba/);
  assert.match(r.rep.esenti_orfane[0], /nessuna istanza in questo file/);
  assert.equal(r.rc, 1, "un residuo deve far fallire il guardiano");
});

prova("il cricchetto tiene: curare fa scendere il tetto, non lo lascia gonfio", () => {
  const r = scenario({ istanze: 0, baseline: 3, esenti: [] });
  assert.equal(r.rep.tetto_gonfiato, true);
  assert.equal(r.rc, 1);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
