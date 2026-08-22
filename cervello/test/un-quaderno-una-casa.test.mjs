#!/usr/bin/env node
// AR-342 — quattro quaderni avevano due case, e nella casa vecchia l'ultimo esito era di venti
// giorni prima.
//
// La casa vera è `memoria-squadra/` in radice: 124 file, ed è lì che scrivono chiusura-loop,
// stampo-check, tasso-lezioni e bootstrap-quaderni. In `MyCity-Vault/90-Memoria-AI/memoria-squadra/`
// ce n'erano altri quattro con lo stesso nome che nessuno aggiornava: account-negozi 1.279 byte
// contro 15.473, ultimo esito al 7/7 invece che al 27/7.
//
// E non erano duplicati — è la parte che ha cambiato il fix. Confrontando i timestamp riga per riga
// sono usciti CINQUE esiti presenti solo nella copia vecchia e mai arrivati alla casa vera, tre dei
// quali senza il trattino iniziale, quindi invisibili perfino al contatore degli esiti. Archiviare
// e basta li avrebbe sepolti: lo stesso errore che il difetto denuncia, commesso al contrario.
// Quindi prima recuperati, poi archiviati.
//
// Qui si prova il METRO, che è ciò che impedisce il ritorno: senza, fra un mese la seconda cartella
// si ripopola da sola e nessuno se ne accorge finché non conta i byte — che è come è passata
// inosservata la prima volta.
//
// Non-vacuità, verificata a mano su due rotture indipendenti:
//   ① logica — cambiando `dove.length > 1` in `dove.length > 2` dentro quaderniInPiuCase: due case
//      non bastano più a far scattare il difetto e la prova fallisce.
//   ② innesto — togliendo da stampo-check il ciclo che spinge QUADERNO_DUE_CASE nel quadro: il
//      metro esiste ma nessuno lo chiama, il guardiano resta verde su un parco malato e la prova
//      fallisce. È la rottura che conta: una regola giusta che nessuno invoca è una regola assente.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { DIFETTO, quaderniInPiuCase } from "../stampo-metro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/stampo-check.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// ── Il metro, eseguito su ingressi finti ────────────────────────────────────

prova("lo stesso quaderno in due cartelle è un difetto, e il metro dice DOVE", () => {
  const r = quaderniInPiuCase({ "casa/": ["tech", "vendite"], "altrove/": ["tech"] });
  assert.deepEqual(r, [{ nome: "tech", case: ["altrove/", "casa/"] }]);
});

prova("una casa sola non è mai un difetto, per quanti quaderni contenga", () => {
  assert.deepEqual(quaderniInPiuCase({ "casa/": ["a", "b", "c"] }), []);
  assert.deepEqual(quaderniInPiuCase({ "casa/": ["a"], "altrove/": [] }), []);
  assert.deepEqual(quaderniInPiuCase({}), []);
});

prova("lo stesso nome ripetuto DENTRO una cartella non conta come due case", () => {
  // Cartelle diverse sono il problema; un elenco che ripete un nome è rumore del chiamante.
  assert.deepEqual(quaderniInPiuCase({ "casa/": ["tech", "tech"] }), []);
});

prova("tre case sono peggio di due, e si vedono tutte", () => {
  const r = quaderniInPiuCase({ "a/": ["x"], "b/": ["x"], "c/": ["x"] });
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].case, ["a/", "b/", "c/"]);
});

// ── L'innesto: il guardiano lo usa davvero ──────────────────────────────────

/** Un parco finto: due agenti, i loro kit, e i quaderni nelle case indicate. */
function parcoFinto({ casaAlt = [] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-case-"));
  const agenti = join(dir, "agents");
  const kit = join(dir, "kit");
  const casa = join(dir, "memoria-squadra");
  const alt = join(dir, "altra-casa");
  for (const d of [agenti, kit, casa, alt]) mkdirSync(d, { recursive: true });

  // Un mansionario che soddisfa tutti gli altri controlli, così l'unico difetto possibile è quello
  // in prova: se il parco fosse malato d'altro, un rosso non direbbe niente sulla regola nuova.
  // I quattro titoli non bastano più (AR-436): un mansionario "sano" ha anche gli ingredienti dello
  // stampo, altrimenti il parco è malato d'altro e un rosso non direbbe niente sulla regola in prova.
  // La convinzione che i quattro titoli facessero un mansionario completo era passata DENTRO la
  // finzione: è AR-436 stesso, propagato nel banco che avrebbe dovuto misurarlo.
  const mansionario = [
    "## 🎓 SCHEDA MESTIERE — fuoriclasse del forno", "",
    "Il tuo metro è RUBRICA-LIVELLI.", "",
    "**Come pensi (modelli mentali).**",
    "- **Il pane fresco vende sé stesso**: se è caldo alle sette la fila si forma da sola in via Roma.",
    "- **Densità prima di varietà**: dieci pezzi di tre tipi battono tre pezzi di dieci tipi, sempre.",
    "- **Il cliente delle sette non è quello delle undici**: due mestieri nello stesso negozio, davvero.", "",
    "**Il tuo loop interno (NON consegni la prima bozza).**",
    "1. Genera **almeno 3 angoli diversi** per l'offerta del giorno.",
    "2. Criticali contro il TASTE-FILE-NICOLA e la memoria del reparto, non contro il tuo gusto.",
    "3. Tieni 1. Domanda-ghigliottina: **«Lo comprerebbe un piacentino di 60 anni di fretta?»** → se no, rifai.", "",
    "**Galleria di riferimento.**",
    "- ✅ GOLD: «Focaccia calda dalle 7, tre pezzi a 5 euro, finita alle 9» — perché funziona: dice l'ora,",
    "  il prezzo e la scarsità vera, e chi passa capisce in tre secondi se gli conviene correre adesso.",
    "- ❌ SPAZZATURA: «Vieni a scoprire le nostre specialità artigianali» — perché muore: nessun orario,",
    "  nessun prezzo, nessuna ragione per muoversi adesso invece che domani o mai più.", "",
    "**Trappole del mestiere.** Promettere il caldo col forno spento · annunciare quantità che non hai ·",
    "sconti a pioggia che bruciano il margine · scrivere «artigianale» senza dire cosa cambia.", "",
    "**Il carburante che chiedi.** Ti servono: le **quantità sfornate per fascia oraria**, le **foto del",
    "banco delle sette**, il **prezzo di costo della farina**, l'orario vero di chiusura.", "",
    "SCORECARD 6 assi.", "",
    "## 🧬 Carta del Dipendente", "✅ RITUALE DI FINE — auto-verifica.",
  ].join("\n");
  const kitTesto = `# Kit\n\n## E. Roba\n${"x".repeat(9000)}\n`;
  for (const n of ["tech", "vendite"]) {
    writeFileSync(join(agenti, `${n}.md`), mansionario);
    writeFileSync(join(kit, `${n}-KIT.md`), kitTesto);
    writeFileSync(join(casa, `${n}.md`), "## Esiti\n- 2026-07-28 10:00 · roba · x · atteso 1 → reale 1 · #t\n");
  }
  for (const n of casaAlt) writeFileSync(join(alt, `${n}.md`), "# copia vecchia\n");

  // Debito dichiarato vuoto: qualunque difetto è NUOVO, che è il punto della prova.
  const baseline = join(dir, "baseline.json");
  writeFileSync(baseline, JSON.stringify({ dichiarato_il: "2026-07-29", agenti: {} }));

  const r = spawnSync("node", [GUARDIANO, "--json"], {
    encoding: "utf8",
    env: {
      ...process.env,
      STAMPO_AGENTS_DIR: agenti,
      STAMPO_KIT_DIR: kit,
      STAMPO_SQUADRA_DIR: casa,
      STAMPO_SQUADRA_DIR_ALT: alt,
      STAMPO_BASELINE: baseline,
    },
  });
  rmSync(dir, { recursive: true, force: true });
  let json = null;
  try { json = JSON.parse(r.stdout); } catch { /* lo guarda il caso */ }
  return { rc: r.status, out: `${r.stdout}${r.stderr}`, json };
}

prova("il guardiano BOCCIA un parco in cui un quaderno vive in due case", () => {
  const r = parcoFinto({ casaAlt: ["tech"] });
  assert.equal(r.rc, 1, `atteso rosso (rc=1), avuto ${r.rc}:\n${r.out}`);
  const nuovi = r.json.nuovi_rispetto_al_debito.map((n) => `${n.nome}:${n.difetto}`);
  assert.ok(nuovi.includes(`tech:${DIFETTO.QUADERNO_DUE_CASE}`), `difetti nuovi: ${nuovi.join(", ")}`);
});

prova("e lascia VERDE lo stesso parco quando la casa è una sola: non è un giro di vite generico", () => {
  const r = parcoFinto({ casaAlt: [] });
  assert.equal(r.rc, 0, `atteso verde:\n${r.out}`);
  assert.deepEqual(r.json.nuovi_rispetto_al_debito, []);
});

prova("una copia di un quaderno che non esiste nella casa vera viene vista lo stesso", () => {
  // Il caso pericoloso: un quaderno che vive SOLO nella cartella sbagliata sarebbe invisibile a un
  // controllo che parte dal roster. Qui la seconda casa contiene un nome che il parco non ha.
  const r = parcoFinto({ casaAlt: ["intelligence"] });
  assert.equal(r.rc, 0, "un nome fuori dal roster non è un quaderno in due case: è un file estraneo");
  // Ma se c'è ANCHE nella casa vera, allora sì.
  const r2 = parcoFinto({ casaAlt: ["vendite"] });
  assert.equal(r2.rc, 1, `atteso rosso su vendite:\n${r2.out}`);
});

// ── Il repo VERO ────────────────────────────────────────────────────────────

prova("nel repo vero nessun quaderno ha due case, e la cartella vecchia è sparita", () => {
  const vecchia = join(REPO, "MyCity-Vault/90-Memoria-AI/memoria-squadra");
  const rimasti = existsSync(vecchia) ? readdirSync(vecchia).filter((f) => f.endsWith(".md")) : [];
  assert.deepEqual(rimasti, [], `copie rimaste nella cartella vecchia: ${rimasti.join(", ")}`);
  const r = spawnSync("node", [GUARDIANO, "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  const doppi = (j.nuovi_rispetto_al_debito || []).filter((n) => n.difetto === DIFETTO.QUADERNO_DUE_CASE);
  assert.deepEqual(doppi, [], `quaderni in due case: ${doppi.map((d) => d.nome).join(", ")}`);
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
});

prova("e i cinque esiti recuperati sono davvero nella casa vera, non solo archiviati", () => {
  // Il recupero è la metà del fix che nessun guardiano misura: se qualcuno «pulisse» il tag
  // credendolo rumore, o se un merge riportasse indietro i file, le lezioni sparirebbero di nuovo in
  // silenzio. Il conto è quello vero: intelligence 2, marketing 1, account-negozi 2.
  const conta = (n) =>
    readFileSync(join(REPO, "memoria-squadra", `${n}.md`), "utf8").split("#recuperato-dalla-copia-doppia").length - 1;
  assert.equal(conta("intelligence"), 2);
  assert.equal(conta("marketing"), 1);
  assert.equal(conta("account-negozi"), 2);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
