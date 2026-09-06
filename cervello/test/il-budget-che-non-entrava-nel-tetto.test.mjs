// ⏱️ IL BUDGET CHE NON ENTRAVA NEL TETTO — AR-918.
//
// IL CASO CHE HA ROTTO, corsa 33811579021 del 3/9. Il giorno prima avevo dato al banco delle
// mutazioni un budget (AR-917) proprio perché smettesse di farsi ammazzare dall'orologio del
// cancello. La corsa dopo è morta nello stesso identico modo: `⏱️ prove non vacue — 900,3 s`,
// `exit 124`, rosso.
//
// PERCHÉ. Il budget guardava se una mutazione poteva COMINCIARE, mai quanto poteva DURARE. Con 30
// secondi di budget residuo la mutazione partiva — legittimo — e poi si prendeva il suo tetto
// pieno da 420 secondi. Il cancello, che di secondi ne aveva 900 in tutto, la ammazzava a metà.
// `quantoPosso` non torna un sì/no: torna QUANTO, e quel numero io lo buttavo via.
//
// La regola che questa prova tiene ferma: **un budget che non entra nel tetto del singolo passo non
// è un budget, è una speranza.** E la prova che lo dimostra non può essere una parola cercata in un
// file: deve far FINIRE IL TEMPO davvero mentre una mutazione gira, e guardare l'orologio.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { troncataDalBudget } from "../non-vacuita.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("chi è stata TRONCATA lo dice: non «la prova non è arrivata in fondo», che darebbe la colpa a lei", () => {
  const cieco = { verdetto: "cieco", perche: "il test non è arrivato in fondo (SIGKILL): non ha misurato niente" };
  const r = troncataDalBudget(cieco, { status: null, concesso: 1_500, tetto: 420_000, difetto: "AR-918" });
  assert.match(r.perche, /budget/, "la causa è il mio orologio, e va nominata");
  assert.match(r.perche, /AR-918/, "col comando per rilanciarla da sola");
  assert.match(r.perche, /NON l'ho misurata/, "e col verso giusto: ⚪, non «rotta»");
});

test("i tre casi che NON sono un troncamento restano com'erano", () => {
  const tetto = 420_000;
  // ① ⚪ per un altro motivo (la prova non si sa nemmeno lanciare): la colpa non è del budget.
  const altro = { verdetto: "cieco", perche: "non so come eseguire questo test: manca il file" };
  assert.deepEqual(troncataDalBudget(altro, { status: null, concesso: 0, tetto }), altro);
  // ② una corsa finita da sola col tempo pieno: nessun budget l'ha toccata.
  const ok = { verdetto: "ok", perche: "" };
  assert.deepEqual(troncataDalBudget(ok, { status: 1, concesso: 1_000, tetto }), ok);
  // ③ ammazzata dal TETTO normale, non dal budget (concesso === tetto): è il caso di sempre.
  const cieco = { verdetto: "cieco", perche: "il test non è arrivato in fondo (SIGKILL): non ha misurato niente" };
  assert.deepEqual(troncataDalBudget(cieco, { status: null, concesso: tetto, tetto }), cieco);
});

test("IL CASO CHE HA ROTTO: il banco NON sfonda il budget, nemmeno con una prova che dorme", () => {
  const casa = mkdtempSync(join(tmpdir(), "budget-nel-tetto-"));
  try {
    // Una prova che dorme molto più a lungo del tetto che le daremo: è il pezzo che prima faceva
    // sfondare tutto, perché partiva con poco budget e si prendeva comunque i suoi secondi.
    const dorme = join(casa, "dorme.mjs");
    writeFileSync(dorme, "setTimeout(() => process.exit(1), 60_000);\n");
    const bersaglio = join(casa, "bersaglio.mjs");
    writeFileSync(bersaglio, "export const VERO = 1;\n");
    writeFileSync(join(casa, "mutanti.json"), JSON.stringify({
      mutanti: [
        { difetto: "AR-918", nome: "la dormiente", file: bersaglio, cerca: "= 1", sostituisci: "= 2", test: dorme },
        { difetto: "AR-918", nome: "quella dopo", file: bersaglio, cerca: "= 1", sostituisci: "= 3", test: dorme },
      ],
    }));

    const iniziato = Date.now();
    const r = spawnSync(process.execPath, [join(REPO, "cervello/non-vacuita.mjs"), "--difetti", "AR-918", "--budget", "2500"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 120_000,
      killSignal: "SIGKILL",
      env: {
        ...process.env,
        MUTANTI_FILE: join(casa, "mutanti.json"),
        NON_VACUITA_RADICE: casa,
        NON_VACUITA_MINIMO_MS: "200",
        NON_VACUITA_TIMEOUT_MS: "60000",
      },
    });
    const durata = Date.now() - iniziato;
    const testo = `${r.stdout || ""}${r.stderr || ""}`;

    // IL CUORE. Col difetto, la dormiente si prendeva i 60 s del tetto e il banco tornava dopo
    // un minuto abbondante: qui deve tornare entro pochi secondi, perché il tempo concesso alla
    // singola mutazione è quello che RESTA del budget, non il tetto.
    assert.ok(durata < 20_000, `il banco ha sfondato il budget: ${Math.round(durata / 1000)} s per 2,5 s di budget.\n${testo.slice(-500)}`);
    assert.equal(r.status, 2, `⚪ è 2 — non ho misurato.\n${testo.slice(-500)}`);
    assert.match(testo, /budget/, "e deve dire che è stato il tempo, non la prova");
  } finally {
    rmSync(casa, { recursive: true, force: true });
  }
});
