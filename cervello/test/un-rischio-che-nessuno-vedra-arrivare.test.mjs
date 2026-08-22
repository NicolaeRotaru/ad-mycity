#!/usr/bin/env node
// 🧪 UN RISCHIO CON UN PROPRIETARIO E SENZA SENTINELLA È UN RISCHIO CHE NESSUNO VEDRÀ ARRIVARE.
//
// AR-148 — «AR-015 chiuso dichiarando 14/14 rischi con sentinella: in realtà 6/14 hanno il campo
// vuoto». Registrato il 3 luglio. Misurato di nuovo il 22 agosto, sette settimane dopo: identico.
// Sei vuote — N2 KYC/antiriciclaggio, N4 inquadramento rider, N5 IVA, N6 alcolici, N7 allergeni,
// B5 stagionalità. Cinque su sei sono rischi normativi.
//
// LA CAUSA, ed è quella che questa prova chiude: AR-015 fu dichiarato chiuso verificando che il
// FILE esistesse, non che le sue righe dicessero qualcosa. Nessun guardiano guardava la completezza
// semantica, quindi il registro poteva svuotarsi riga per riga restando «coerente».
//
// C'è scritto CHI risponde e non COSA deve far scattare la risposta: è un elenco di responsabili,
// non un sistema di allarme.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const { rischiSenzaSentinella } = await import(join(REPO, "cervello/coerenza-rischi.mjs"));

test("AR-148 · il caso che ha rotto: owner sì, sentinella vuota → è un buco, e si vede", () => {
  const buco = rischiSenzaSentinella([
    { id: "N2", gravita: "media", owner: "@legale-privacy", sentinella: "" },
    { id: "N4", gravita: "alta", owner: "@consulente-lavoro", sentinella: "   " },
    { id: "N1", gravita: "alta", owner: "@finanza", sentinella: "Ordine pagato senza payout" },
  ]);
  assert.deepEqual(buco.map((r) => r.id), ["N2", "N4"], "prima nessuno contava queste due");
});

test("AR-148 · un rischio ARCHIVIATO non chiede più niente: non deve tenere il guardiano rosso", () => {
  // Senza questa clausola il controllo sarebbe un rosso che non si può togliere — e un guardiano
  // sempre rosso viene spento entro la settimana, che è come non averlo.
  const v = rischiSenzaSentinella([
    { id: "X1", owner: "@tizio", sentinella: "", stato: "archiviato" },
    { id: "X2", owner: "@tizio", sentinella: "", stato: "chiuso" },
  ]);
  assert.deepEqual(v, [], "archiviato e chiuso escono dal conto");
});

test("AR-148 · un rischio SENZA owner non entra qui: lo denuncia l'altro controllo", () => {
  // Due controlli che denunciano la stessa riga producono due rossi per un problema solo, e chi
  // legge non sa quale dei due sistemare.
  assert.deepEqual(rischiSenzaSentinella([{ id: "Z", owner: "", sentinella: "" }]), []);
});

test("AR-148 · sul registro VERO: quattordici rischi, quattordici sentinelle", () => {
  // È la misura che la scheda dichiarava fatta e non era mai stata fatta.
  const reg = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json"), "utf8"));
  const rischi = reg.rischi || [];
  assert.ok(rischi.length >= 14, `il registro canonico deve avere almeno 14 rischi, ne ha ${rischi.length}`);

  const vuoti = rischiSenzaSentinella(rischi);
  assert.deepEqual(vuoti.map((r) => r.id), [], `restano senza sentinella: ${vuoti.map((r) => r.id).join(", ")}`);

  // E le sei che erano vuote devono dire qualcosa di OSSERVABILE, non una parola di riempimento:
  // una sentinella che non descrive un evento è un campo pieno e un allarme assente.
  for (const id of ["N2", "N4", "N5", "N6", "N7", "B5"]) {
    const r = rischi.find((x) => x.id === id);
    assert.ok(r, `il rischio ${id} deve esistere`);
    assert.ok(String(r.sentinella).trim().length >= 40,
      `${id}: «${r.sentinella}» è troppo corta per descrivere una condizione osservabile`);
  }
});

test("AR-148 · il guardiano VERO esce ROSSO su un registro con un buco", async () => {
  const { spawnSync } = await import("node:child_process");
  const { mkdtempSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");

  const dir = mkdtempSync(join(tmpdir(), "rischi-"));
  const canonico = join(dir, "registro.json");
  const puntatore = join(dir, "puntatore.json");
  const report = join(dir, "report.json");
  writeFileSync(puntatore, JSON.stringify({ _canonico: "MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json", rischi: [] }));

  const lancia = () =>
    spawnSync(process.execPath, [join(REPO, "cervello/coerenza-rischi.mjs"), "--json"], {
      encoding: "utf8",
      env: {
        ...process.env,
        REGISTRO_RISCHI_FILE: canonico,
        REGISTRO_RISCHI_PUNTATORE: puntatore,
        REGISTRO_RISCHI_REPORT: report,
        SUPABASE_URL: "",
        SUPABASE_SERVICE_KEY: "",
      },
    });

  // ① un registro col buco: il guardiano deve dire di NO, e dire quale riga.
  writeFileSync(canonico, JSON.stringify({ rischi: [{ id: "N9", gravita: "alta", owner: "@tizio", sentinella: "" }] }));
  const rosso = lancia();
  assert.notEqual(rosso.status, 0, "un rischio con owner e senza sentinella deve far uscire il guardiano diverso da zero");
  assert.match(`${rosso.stdout}${rosso.stderr}`, /senza_sentinella|N9/, "e deve dire QUALE, o il rosso non si diagnostica");

  // ② lo stesso registro con la sentinella scritta: verde. Un guardiano che non può diventare verde
  //    viene aggirato al secondo giro, e allora non ferma più nemmeno i rossi veri.
  writeFileSync(canonico, JSON.stringify({
    rischi: [{ id: "N9", gravita: "alta", owner: "@tizio", sentinella: "Un ordine paga senza che il payout parta entro 48 ore" }],
  }));
  assert.equal(lancia().status, 0, "col buco tappato dev'essere verde, o la prova sta misurando altro");
});
