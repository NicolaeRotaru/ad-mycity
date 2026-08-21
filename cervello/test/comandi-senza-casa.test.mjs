// comandi-senza-casa.test.mjs — 2026-08-21.
//
// Il difetto vero, capitato due volte: do a Nicola un comando che nomina un percorso interno al
// repo, senza dirgli da quale cartella lanciarlo. Lui è sul server, nella sua home, e il comando
// fallisce con uno stack trace di Node che non spiega niente. Successo il 4/8 e di nuovo il 21/8
// alle 16:32 — la lezione c'era già, ma era una frase e non un guardiano.
//
// Le due direzioni contano tutte e due: deve prendere il blocco senza `cd`, e NON deve strillare
// su un blocco che il `cd` ce l'ha — se no diventa rumore e si impara a ignorarlo.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { blocchi, carte, orfani, orfano } from "../comandi-senza-casa.mjs";

const AD_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const card = (titolo, blocco) => `### ${titolo}\n\ntesto\n\n\`\`\`\n${blocco}\n\`\`\`\n`;

test("prende il comando interno senza cd — il caso vero del 21/8", () => {
  const b = "cp consegne/tech/settings-con-superpowers.json .claude/settings.json\nnode cervello/plugin-acceso.mjs";
  assert.equal(orfano(b), "cp consegne/tech/settings-con-superpowers.json .claude/settings.json");
});

test("col cd nello stesso blocco sta zitto", () => {
  const b = "cd /opt/mycity/ad-mycity\nnode cervello/plugin-acceso.mjs";
  assert.equal(orfano(b), null, "un blocco corretto non deve fare rumore, o si impara a ignorarlo");
});

test("un blocco che non nomina il repo non lo riguarda", () => {
  assert.equal(orfano("git status\ngit log --oneline -3"), null);
  assert.equal(orfano("sudo systemctl restart mycity-worker"), null);
});

test("il cd vale ovunque sia nel blocco, non solo in cima", () => {
  const b = "# prima guarda\ncd /opt/mycity/ad-mycity\nnode cervello/salute.mjs";
  assert.equal(orfano(b), null);
});

test("le card chiuse sono storia e non si toccano", () => {
  const testo = card("✅ #1 — fatto", "node cervello/salute.mjs");
  assert.deepEqual(orfani(testo), []);
});

test("le card aperte invece sì, di ogni colore", () => {
  for (const colore of ["🟡", "🔴", "⚪"]) {
    const testo = card(`${colore} #9 — da fare`, "node cervello/salute.mjs");
    assert.equal(orfani(testo).length, 1, `card ${colore} non controllata`);
  }
});

test("una segnalazione per card, non una per riga", () => {
  const testo = `### 🟡 #9 — due blocchi\n\n\`\`\`\nnode cervello/uno.mjs\n\`\`\`\n\n\`\`\`\ncp consegne/due.json .\n\`\`\`\n`;
  assert.equal(orfani(testo).length, 1, "due blocchi rotti nella stessa card = un rimedio solo");
});

test("legge le card e i blocchi del file vero", () => {
  const testo = readFileSync(join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"), "utf8");
  assert.ok(carte(testo).length > 10, "non ho trovato le card: il formato del file è cambiato?");
  assert.ok(carte(testo).some((c) => blocchi(c.corpo).length > 0), "nessun blocco di comandi trovato");
});

test("sul file VERO nessuna card aperta lascia un comando senza casa", () => {
  const testo = readFileSync(join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"), "utf8");
  const trovati = orfani(testo);
  assert.deepEqual(
    trovati.map((t) => `${t.titolo} → ${t.comando}`),
    [],
    "una card dice a Nicola di lanciare un comando senza dirgli da dove: aggiungi il cd nel blocco"
  );
});
