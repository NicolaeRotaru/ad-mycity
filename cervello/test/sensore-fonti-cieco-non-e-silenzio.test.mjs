// ⚪ AR-860 — «nessuna fonte morta» e «non ho guardato nessuna fonte» erano lo stesso dato.
//
// LA STORIA. sentinella-fonti.mjs, quando non trova il suo radar, scrive comunque fonti-salute.json
// con {ok:false, errore} e SENZA il campo `allerta_peso_critico`. Chi lo legge (sentinella-dati,
// controllo M8) fa `Array.isArray(undefined)` → false, quindi non alza niente.
//
// Il risultato non e' un falso allarme: e' SILENZIO. Il giorno in cui il radar sparisce, nessuno sa
// piu' se le fonti web sono vive — e nessuno se ne accorge, perche' il cruscotto e' identico a
// quello di un mondo in cui va tutto bene. E' la stessa malattia del codice d'uscita (AR-859), un
// piano piu' in basso: dentro il FILE invece che nell'uscita del programma.
//
// La cura ha un precedente in casa: M6b fa esattamente questo per il sensore della cassa.

import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { valutaRegole } from "../sentinella-dati.mjs";

const QUI = import.meta.dirname;
const CERVELLO = join(QUI, "..");

let passate = 0;
const rossi = [];
function prova(nome, fn) {
  try { fn(); passate++; console.log(`# ok — ${nome}`); }
  catch (e) { rossi.push(nome); console.log(`# NON ok — ${nome}\n#    ${e.message.split("\n")[0]}`); }
}

/** Lo stato minimo: solo i campi che questi casi guardano. Il resto resta spento. */
const statoBase = { fonti_allerta_critico: null, fonti_cieco: null };
const eventiDi = (extra) => valutaRegole({ ...statoBase, ...extra }, {}) || [];
const chiavi = (ev) => ev.map((e) => e.chiave);

prova("il sensore cieco ALZA la voce invece di tacere", () => {
  const ev = eventiDi({ fonti_cieco: "radar-fonti.json non trovato o vuoto" });
  assert.ok(chiavi(ev).includes("fonti_cieco"), `nessun evento per il sensore cieco: ${chiavi(ev).join(", ") || "(niente)"}`);
});

prova("e dice il motivo, perche' «e' cieco» senza il perche' non si ripara", () => {
  const e = eventiDi({ fonti_cieco: "radar-fonti.json non trovato o vuoto" }).find((x) => x.chiave === "fonti_cieco");
  assert.match(e.prompt, /radar-fonti\.json non trovato o vuoto/, "il motivo non arriva a chi deve riparare");
  assert.match(e.prompt, /non ha guardat|nessuno le ha guardate/i, "deve dire che il silenzio non e' un via libera");
});

prova("IL CUORE: sensore cieco e sensore che ha guardato bene NON danno lo stesso cruscotto", () => {
  // E' la prova che il difetto era vero. Prima della cura questi due mondi erano indistinguibili.
  const cieco = chiavi(eventiDi({ fonti_cieco: "radar assente" }));
  const sano = chiavi(eventiDi({ fonti_cieco: null }));
  assert.notDeepEqual(cieco, sano, "cieco e sano producono ancora gli stessi eventi: il ⚪ resta invisibile");
});

prova("quando il sensore ci vede, non inventa nessun allarme", () => {
  assert.ok(!chiavi(eventiDi({ fonti_cieco: null })).includes("fonti_cieco"), "un falso allarme e' l'altro modo di rompere un sensore");
});

prova("la firma e' stabile, o la diagnosi si riaccoda a ogni giro", () => {
  // AR-114, pagata sul sensore della cassa: la firma era il conteggio, cambiava ogni volta, e la
  // stessa diagnosi si e' riaccodata 76 volte in 9 giorni.
  const a = eventiDi({ fonti_cieco: "motivo uno" }).find((x) => x.chiave === "fonti_cieco");
  const b = eventiDi({ fonti_cieco: "motivo due, scritto diverso" }).find((x) => x.chiave === "fonti_cieco");
  assert.equal(a.firma, b.firma, "la firma cambia col motivo: la stessa cecita' si riaccoda a ogni giro");
  assert.equal(a.dedupPersistente, true);
});

prova("e una fonte morta VERA continua ad allarmare come prima: non ho rotto M8", () => {
  const ev = chiavi(eventiDi({ fonti_allerta_critico: [{ id: "libertà" }] }));
  assert.ok(ev.includes("fonti_web_morte"), `M8 non scatta piu': ${ev.join(", ") || "(niente)"}`);
});

prova("UNA FONTE MORTA VERA NON e' una cecita': il referto dice ok:false anche quando ha guardato benissimo", () => {
  // Il difetto che mi sono fatto da solo scrivendo la cura, e che ha trovato il riguardo del
  // perimetro. Nel referto `ok` vale `morteCritiche.length === 0`: diventa false anche quando il
  // sensore ha contato tutte le fonti e ne ha trovate di morte. Leggendo solo `ok` il ⚪ si sarebbe
  // acceso su un ❌ VERO, e avrebbe suonato insieme a M8 per la stessa identica cosa.
  //
  // La domanda giusta non e' «hai trovato un problema?» ma «hai misurato?».
  const dir = mkdtempSync(join(tmpdir(), "fonti-morte-"));
  try {
    cpSync(CERVELLO, join(dir, "cervello"), { recursive: true });
    writeFileSync(
      join(dir, "cervello", "fonti-salute.json"),
      JSON.stringify({ ok: false, quando: "2026-08-27 19:00", fonti_totali: 12, allerta_peso_critico: [{ id: "liberta" }] }),
    );
    const r = spawnSync(process.execPath, ["-e", `
      import("./cervello/sentinella-dati.mjs").then(async (m) => {
        const s = await m.leggiStatoReale({});
        const ev = (m.valutaRegole(s, {}) || []).map((e) => e.chiave);
        console.log(JSON.stringify({ cieco: s.fonti_cieco, ev }));
      });
    `], { cwd: dir, encoding: "utf8", timeout: 120000 });
    const riga = String(r.stdout).trim().split("\n").filter((l) => l.startsWith("{")).pop();
    assert.ok(riga, `nessuna risposta: ${String(r.stderr).slice(0, 200)}`);
    const esito = JSON.parse(riga);
    assert.equal(esito.cieco, null, "ha contato 12 fonti: non e' cieco, ha solo trovato qualcosa di brutto");
    assert.ok(!esito.ev.includes("fonti_cieco"), "il ⚪ si accende su un ❌ vero");
    assert.ok(esito.ev.includes("fonti_web_morte"), "e la fonte morta vera deve continuare ad allarmare");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("IL COLLEGAMENTO, non solo la regola: un file cieco VERO accende davvero il campo", () => {
  // I casi qui sopra provano che la REGOLA reagisce. Non provano che qualcuno gliela dia, quella
  // risposta — ed e' la seconda forma di prova vuota: la regola ha sei casi, la CHIAMATA nessuno.
  // Qui il file cieco e' quello vero, scritto come lo scrive sentinella-fonti quando non trova il
  // radar, dentro una copia dell'albero cosi' il file di casa non si tocca.
  const dir = mkdtempSync(join(tmpdir(), "fonti-cieche-"));
  try {
    cpSync(CERVELLO, join(dir, "cervello"), { recursive: true });
    writeFileSync(
      join(dir, "cervello", "fonti-salute.json"),
      JSON.stringify({ ok: false, quando: "2026-08-27 19:00", errore: "radar-fonti.json non trovato o vuoto" }),
    );
    const r = spawnSync(process.execPath, ["-e", `
      import("./cervello/sentinella-dati.mjs").then(async (m) => {
        const s = await m.leggiStatoReale({});
        const ev = (m.valutaRegole(s, {}) || []).map((e) => e.chiave);
        console.log(JSON.stringify({ cieco: s.fonti_cieco, acceso: ev.includes("fonti_cieco") }));
      });
    `], { cwd: dir, encoding: "utf8", timeout: 120000 });
    const riga = String(r.stdout).trim().split("\n").filter((l) => l.startsWith("{")).pop();
    assert.ok(riga, `il collegamento non ha risposto niente: ${String(r.stderr).slice(0, 200)}`);
    const esito = JSON.parse(riga);
    assert.match(String(esito.cieco), /radar-fonti/, "il motivo non arriva dal file al campo");
    assert.equal(esito.acceso, true, "il campo si accende ma l'evento non parte: il collegamento e' rotto a meta'");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

console.log(`# ${passate}/${passate + rossi.length} passate`);
if (rossi.length) process.exit(1);
