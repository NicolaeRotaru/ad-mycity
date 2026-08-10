// AR-566 — il voto della macchina su sé stessa: chiudo almeno quanto apro?
//
// Approvato da Nicola il 10/8 («ok tasso di chiusura»), dopo il conto della radiografia della catena
// di lavoro: luglio 455 nati e 244 chiusi (0,54); agosto, in dieci giorni, 90 nati e 14 chiusi (0,16).
// La macchina trova circa tre volte più in fretta di quanto ripara, e il divario si allarga.
//
// Nicola lo aveva detto prima di me: «so già che dopo questo upgrade ti chiederò di rianalizzare e
// troverai un sacco di errori». Aveva ragione, e la causa è questo rapporto — non la bravura di chi
// cerca. Finché è sotto 1, ogni radiografia allunga la lista invece di accorciarla.
//
// Qui si esegue la funzione VERA, quella che decide se il giro si ferma.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { contaMese, verdetto, perMese, meseDi, OBIETTIVO, MINIMO_CAMPIONE } = await import(join(QUI, "..", "tasso-chiusura.mjs"));

/** n difetti nati nel mese, di cui `chiusi` chiusi nello stesso mese. */
const cantiere = (mese, nati, chiusi) =>
  Array.from({ length: nati }, (_, i) => ({
    id: `AR-${i}`,
    nato: `${mese}-0${(i % 9) + 1} 10:00`,
    stato: i < chiusi ? "chiuso" : "aperto",
    ...(i < chiusi ? { chiuso_il: `${mese}-0${(i % 9) + 1} 18:00` } : {}),
  }));

// ── Il caso che ha rotto ─────────────────────────────────────────────────────
test("il caso che ha rotto: agosto 2026 — 90 aperti e 14 chiusi è sotto obiettivo, e il giro si ferma", () => {
  const v = verdetto({ nati: 90, chiusi: 14 });
  assert.equal(v.esito, "sotto");
  assert.equal(v.tasso, 0.16);
  assert.match(v.detto, /ne apro più di quanti ne chiudo/);
});

test("nemmeno luglio passava: 455 aperti e 244 chiusi è 0,54, non 1", () => {
  const v = verdetto({ nati: 455, chiusi: 244 });
  assert.equal(v.esito, "sotto");
  assert.equal(v.tasso, 0.54);
});

// ── Quando invece va bene ────────────────────────────────────────────────────
test("chiudere quanto si apre basta: il pareggio è l'obiettivo, non il superamento", () => {
  const v = verdetto({ nati: 20, chiusi: 20 });
  assert.equal(v.esito, "ok");
  assert.equal(v.tasso, 1);
  assert.equal(OBIETTIVO, 1, "l'obiettivo dichiarato è 1: se cambia, questo test lo deve dire");
});

test("smaltire l'arretrato viene premiato: si può chiudere più di quanto si apre", () => {
  const v = verdetto({ nati: 10, chiusi: 25 });
  assert.equal(v.esito, "ok");
  assert.equal(v.tasso, 2.5);
});

// ── Il campione magro non è una bocciatura ───────────────────────────────────
test("a inizio mese con pochi difetti il verdetto è ⚪, non rosso: 1 nato e 0 chiusi non ferma niente", () => {
  const v = verdetto({ nati: 1, chiusi: 0 });
  assert.equal(v.esito, "piccolo", "senza questa regola il freno scatterebbe ogni primo del mese");
  assert.equal(v.tasso, null, "un rapporto su un campione di 1 non è un numero da mostrare");
});

test("appena il campione basta, il verdetto torna a poter essere rosso", () => {
  assert.equal(verdetto({ nati: MINIMO_CAMPIONE - 1, chiusi: 0 }).esito, "piccolo");
  assert.equal(verdetto({ nati: MINIMO_CAMPIONE, chiusi: 0 }).esito, "sotto");
});

// ── Il conto sul cantiere ────────────────────────────────────────────────────
test("conta i nati nel mese e le chiusure AVVENUTE nel mese", () => {
  assert.deepEqual(contaMese(cantiere("2026-08", 9, 3), "2026-08"), { nati: 9, chiusi: 3 });
});

test("chiudere un difetto VECCHIO conta nel mese in cui lo chiudi: è il lavoro che il voto deve premiare", () => {
  const d = [
    { id: "A", nato: "2026-07-01", stato: "chiuso", chiuso_il: "2026-08-05 09:00" }, // arretrato smaltito
    { id: "B", nato: "2026-08-02", stato: "aperto" },
  ];
  assert.deepEqual(contaMese(d, "2026-08"), { nati: 1, chiusi: 1 }, "il chiuso di luglio conta come chiusura di agosto");
  assert.deepEqual(contaMese(d, "2026-07"), { nati: 1, chiusi: 0 }, "e NON come chiusura di luglio");
});

test("un difetto senza data di nascita non viene contato al posto sbagliato", () => {
  const d = [{ id: "A", stato: "aperto" }, { id: "B", nato: "", stato: "aperto" }, { id: "C", nato: "2026-08-01", stato: "aperto" }];
  assert.deepEqual(contaMese(d, "2026-08"), { nati: 1, chiusi: 0 });
});

test("un difetto marcato chiuso ma senza data di chiusura non gonfia il numeratore", () => {
  const d = [{ id: "A", nato: "2026-08-01", stato: "chiuso" }];
  assert.deepEqual(contaMese(d, "2026-08"), { nati: 1, chiusi: 0 }, "senza `chiuso_il` non so QUANDO: non lo accredito");
});

test("il mese si legge sia da «AAAA-MM-GG HH:MM» sia da «AAAA-MM-GG», e da nient'altro", () => {
  assert.equal(meseDi("2026-08-10 23:20"), "2026-08");
  assert.equal(meseDi("2026-08-10"), "2026-08");
  assert.equal(meseDi("10/08/2026"), null, "un formato che non conosco è null, non un mese inventato");
  assert.equal(meseDi(undefined), null);
});

// ── Lo storico ───────────────────────────────────────────────────────────────
test("lo storico mette i mesi in ordine e calcola il rapporto di ognuno", () => {
  const d = [...cantiere("2026-07", 9, 6), ...cantiere("2026-08", 9, 1)];
  const s = perMese(d);
  assert.deepEqual(s.map((x) => x.mese), ["2026-07", "2026-08"]);
  assert.equal(s[0].tasso, +(6 / 9).toFixed(2));
  assert.equal(s[1].tasso, +(1 / 9).toFixed(2));
});

// ── Il cablaggio nel giro: ESEGUITO, non cercato ─────────────────────────────
//
// La regola che questo stesso lotto introduce (l'asticella, AR-564) vale prima di tutto per me:
// «il freno è agganciato al giro» non si prova cercando `CHIUSURA_VINCOLO` in giro.sh — quello
// direbbe solo che la parola c'è. Qui si ESTRAE il blocco vero da giro.sh e lo si ESEGUE, con un
// finto `tasso-chiusura.mjs` che risponde quello che serve al caso. Se il cablaggio si stacca, o se
// qualcuno cambia il codice di uscita che lo attiva, questi due casi diventano rossi.
test("cablaggio nel giro: sotto obiettivo (rc=1) il vincolo si popola e arriva al motore", async () => {
  const { esito, vincolo } = await eseguiBloccoDelGiro(1, "0.18 — apro molto piu di quanto chiudo");
  assert.equal(esito, 0, "il blocco non deve far fallire il giro: alza un vincolo, non spegne la macchina");
  assert.match(vincolo, /APRO PIÙ DI QUANTO CHIUDO/, "il vincolo hard deve essere popolato");
  assert.match(vincolo, /NON apre ricerche nuove/, "deve dire al motore cosa NON fare");
  assert.match(vincolo, /0\.18/, "deve portarsi dietro il conto vero, non solo l'ordine");
});

test("cablaggio nel giro: cieco (rc=2) NON ferma la ricerca — cieco non è verde, ma non è rosso", async () => {
  const { vincolo } = await eseguiBloccoDelGiro(2, "cantiere illeggibile");
  assert.equal(vincolo.trim(), "", "un cantiere illeggibile non deve bloccare il lavoro del giro");
});

test("cablaggio nel giro: a posto (rc=0) nessun vincolo", async () => {
  const { vincolo } = await eseguiBloccoDelGiro(0, "1.20 — chiudo piu di quanto apro");
  assert.equal(vincolo.trim(), "");
});

/** Estrae da giro.sh il blocco vero del tasso di chiusura e lo esegue con un motore finto. */
async function eseguiBloccoDelGiro(rcFinto, uscitaFinta) {
  const { readFileSync, mkdtempSync, writeFileSync, chmodSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { spawnSync } = await import("node:child_process");

  const giro = readFileSync(join(QUI, "..", "giro.sh"), "utf8").split("\n");
  const da = giro.findIndex((r) => r.includes("Tasso di chiusura (AR-566"));
  assert.ok(da > 0, "il blocco del tasso non è più in giro.sh: il cablaggio è sparito");
  const a = giro.findIndex((r, i) => i > da && r.trim() === "fi");
  assert.ok(a > da, "il blocco del tasso in giro.sh non si chiude: sintassi cambiata sotto i piedi");
  const blocco = giro.slice(da, a + 1).join("\n");

  const dove = mkdtempSync(join(tmpdir(), "giro-tasso-"));
  // Il finto motore: risponde l'uscita e il codice del caso in prova.
  writeFileSync(join(dove, "tasso-chiusura.mjs"), `console.log(${JSON.stringify(uscitaFinta)}); process.exit(${rcFinto});\n`);
  const script = join(dove, "prova.sh");
  writeFileSync(script, `#!/bin/bash\nts() { echo 00:00; }\nSCRIPT_DIR=${JSON.stringify(dove)}\nCHIUSURA_VINCOLO=""\n${blocco}\nprintf '%s' "$CHIUSURA_VINCOLO" > ${JSON.stringify(join(dove, "vincolo.txt"))}\n`);
  chmodSync(script, 0o755);
  const r = spawnSync("bash", [script], { encoding: "utf8", timeout: 30000 });
  return { esito: r.status, vincolo: readFileSync(join(dove, "vincolo.txt"), "utf8") };
}

// ── Sul cantiere VERO ────────────────────────────────────────────────────────
test("sul cantiere vero: il mese in corso è misurabile e il verdetto è uno dei tre previsti", async () => {
  const { readFileSync } = await import("node:fs");
  const c = JSON.parse(readFileSync(join(QUI, "..", "..", "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const s = perMese(c.difetti);
  assert.ok(s.length >= 2, "servono almeno due mesi di storia, altrimenti non ho misurato una tendenza");
  const luglio = s.find((x) => x.mese === "2026-07");
  assert.ok(luglio && luglio.nati > 100, `luglio deve avere i suoi difetti veri, trovati ${luglio?.nati}`);
  assert.ok(luglio.tasso < 1, `anche il mese migliore era sotto 1 (${luglio.tasso}): è il fatto che ha motivato questa regola`);
  for (const m of s) {
    const v = verdetto(m);
    assert.ok(["ok", "sotto", "piccolo"].includes(v.esito), `verdetto inatteso per ${m.mese}: ${v.esito}`);
  }
});
