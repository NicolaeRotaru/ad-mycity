// 🚦 LA PROVA DELLA LETTURA DELLA CI — «rosso» non è una risposta, «rosso di chi» sì.
//
// Il caso vero da cui nasce, misurato il 4/8 alle 19: sei PR aperte su ad-mycity, cinque rosse. Le
// cinque avevano lo STESSO guasto, e non l'aveva causato nessuna di loro — `main` era rosso dalle
// 15:08, da quando gli hook nuovi sono stati agganciati in `settings.json`. Una macchina che legge
// «rosso» e si mette a riparare avrebbe aperto cinque PR di riparazione su un guasto di qualcun
// altro: cinque lavori sbagliati, e il guasto vero ancora lì.
//
// Le righe di log qui sotto sono COPIATE dai job veri di quella sera (run 30929719614 sulla PR #680
// e run 30924098083 su main): se il filtro o l'impronta smettono di funzionare su un log vero di
// GitHub Actions, questa prova diventa rossa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  COLPA,
  codiceUscita,
  colpaDi,
  daRiparare,
  guastiEreditati,
  impronta,
  prossimaMossa,
  puoMergiare,
  righeSignificative,
  STATO,
  ultimiPerNome,
  verdetto,
} from "../ci-lettura.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

// Il log vero della PR #680 (job «prove, guardiani e typecheck»), con la coda di rumore che GitHub
// aggiunge sempre in fondo: è la ragione per cui la coda del log non si può usare come motivo.
const LOG_PR = `2026-08-04T16:35:04.4067524Z   ✅ gate delle lezioni (exit 0)
2026-08-04T16:35:04.4073495Z   ❌ verdetti senza lettore (exit 1)
2026-08-04T16:35:04.4086719Z   ❌ test del cervello (exit 1)
2026-08-04T16:35:04.4087541Z        ❌ cervello/test/guardiano-mai-messo-di-guardia.test.mjs  (15 passati)
2026-08-04T16:35:04.4085616Z         ❌ 240 consegne mute contro un tetto di 238: il debito si è allargato, non ridotto.
2026-08-04T16:35:04.4146697Z ##[error]Process completed with exit code 1.
2026-08-04T16:35:04.4298392Z Node 20 is being deprecated. This workflow is running with Node 24 by default.
2026-08-04T16:35:04.5221098Z [command]/usr/bin/git version
2026-08-04T16:35:04.6557833Z Cleaning up orphan processes
2026-08-04T16:35:04.7009135Z ##[warning]Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24.`;

// Lo stesso guasto su main, con i contatori mossi di due — è il caso che l'impronta deve appiattire.
const LOG_MAIN = `2026-08-04T15:26:04.4073495Z   ❌ test del cervello (exit 1)
2026-08-04T15:26:04.4087541Z        ❌ cervello/test/guardiano-mai-messo-di-guardia.test.mjs  (15 passati)
2026-08-04T15:26:04.4085616Z         ❌ 238 consegne mute contro un tetto di 238: il debito si è allargato, non ridotto.
2026-08-04T15:26:50.5045023Z ##[warning]Node.js 20 is deprecated.`;

test("dal log vero escono i guasti, non la coda del log", () => {
  const righe = righeSignificative(LOG_PR);
  assert.ok(
    righe.some((r) => r.includes("guardiano-mai-messo-di-guardia")),
    "il test rosso deve comparire: è il motivo per cui il job è fallito",
  );
  assert.ok(!righe.some((r) => r.includes("Cleaning up orphan processes")), "la coda del log non è un motivo");
  assert.ok(!righe.some((r) => r.includes("Node.js 20")), "l'avviso su Node 20 c'è su OGNI job: leggerlo come guasto renderebbe tutto rosso uguale");
  assert.ok(!righe.some((r) => r.includes("✅")), "le righe verdi non sono guasti");
  assert.ok(!righe.some((r) => /^\d{4}-\d{2}-\d{2}T/.test(r)), "l'ora va tolta, o due esecuzioni dello stesso guasto sembrano due guasti");
});

test("lo stesso guasto con un contatore diverso resta lo stesso guasto", () => {
  const a = impronta(righeSignificative(LOG_PR));
  const b = impronta(righeSignificative(LOG_MAIN));
  const comuni = [...a].filter((k) => b.has(k));
  assert.ok(
    comuni.some((k) => k.includes("consegne mute")),
    "«240 contro 238» e «238 contro 238» sono lo stesso debito che si muove: se contassero i numeri, ogni commit farebbe sembrare nuovo un guasto vecchio",
  );
});

test("il rosso già presente su main NON è colpa della PR", () => {
  // Il caso puro: la PR trascina esattamente i guasti di main e non ne aggiunge.
  const soloEreditati = ["❌ test del cervello (exit 1)", "❌ cervello/test/guardiano-mai-messo-di-guardia.test.mjs  (15 passati)"];
  const c = colpaDi(impronta(soloEreditati), impronta(righeSignificative(LOG_MAIN)), true);
  assert.equal(c.classe, COLPA.EREDITATA);
  const mossa = prossimaMossa({ verdetto: { stato: STATO.ROSSO }, colpa: c });
  assert.match(mossa, /NON toccare/, "la mossa giusta davanti a un guasto ereditato è non fare niente su questa PR");
});

test("il caso reale della PR #680: metà ereditato, metà suo — e si tocca solo la sua metà", () => {
  // Trovato da questa prova, non dalla rilettura: la #680 era rossa per DUE motivi diversi. Il test
  // del cervello era già rosso su main (non suo), mentre «verdetti senza lettore» l'ha acceso quel
  // giro scrivendo in memoria righe difficili da leggere (AR-478). Chiamarla «ereditata» avrebbe
  // lasciato aperto un guasto vero; chiamarla «mia» avrebbe mandato a riparare main da qui.
  const c = colpaDi(impronta(righeSignificative(LOG_PR)), impronta(righeSignificative(LOG_MAIN)), true);
  assert.equal(c.classe, COLPA.MISTA);
  assert.ok(c.nuove.some((k) => k.includes("verdetti senza lettore")), "il guasto nuovo è suo");
  assert.ok(c.gia.some((k) => k.includes("guardiano-mai-messo-di-guardia")), "quello vecchio no");
  assert.match(prossimaMossa({ verdetto: { stato: STATO.ROSSO }, colpa: c }), /solo i guasti nuovi/);
});

test("un guasto che su main non c'è è colpa mia, e si ripara qui", () => {
  const mio = impronta(["❌ cervello/test/carrello.test.mjs  (3 passati)"]);
  const c = colpaDi(mio, impronta(righeSignificative(LOG_MAIN)), true);
  assert.equal(c.classe, COLPA.MIA);
  assert.match(prossimaMossa({ verdetto: { stato: STATO.ROSSO }, colpa: c }), /correggi qui/);
});

test("se non ho letto la base, la colpa resta IGNOTA (non «mia»)", () => {
  // È il freno contro la cavolata peggiore: mandare a riparare il guasto di qualcun altro perché non
  // ho potuto guardare dove nasceva.
  const c = colpaDi(impronta(righeSignificative(LOG_PR)), new Set(), false);
  assert.equal(c.classe, COLPA.IGNOTA);
  assert.match(prossimaMossa({ verdetto: { stato: STATO.ROSSO }, colpa: c }), /a mano/);
});

test("zero controlli non è verde: è ⚪ non misurato", () => {
  const conCiSullaBase = verdetto([], true);
  assert.equal(conCiSullaBase.stato, STATO.NON_MISURATO);
  assert.match(conCiSullaBase.motivo, /non sono scattati/);
  assert.equal(puoMergiare(conCiSullaBase).ok, false, "una PR che nessun controllo ha provato non si unisce");

  // Un repo senza CI del tutto: fermare per sempre ogni merge sarebbe un cancello che si impara ad
  // aggirare. Passa, ma dichiarato non misurato — mai spacciato per verde.
  const senzaCi = verdetto([], false);
  const p = puoMergiare(senzaCi);
  assert.equal(p.ok, true);
  assert.equal(p.misurato, false);
});

test("un rosso o un controllo ancora in corso fermano il merge", () => {
  const rosso = verdetto([{ name: "prove", status: "completed", conclusion: "failure" }]);
  assert.equal(rosso.stato, STATO.ROSSO);
  assert.equal(puoMergiare(rosso).ok, false);

  const inCorso = verdetto([
    { name: "prove", status: "completed", conclusion: "success" },
    { name: "typecheck", status: "in_progress", conclusion: null },
  ]);
  assert.equal(inCorso.stato, STATO.IN_CORSO);
  assert.equal(puoMergiare(inCorso).ok, false, "unire mentre i controlli girano è unire senza sapere");

  const verde = verdetto([
    { name: "prove", status: "completed", conclusion: "success" },
    { name: "saltato", status: "completed", conclusion: "skipped" },
  ]);
  assert.equal(verde.stato, STATO.VERDE, "«saltato» e «neutro» non sono guasti");
  assert.equal(puoMergiare(verde).ok, true);
});

test("una ri-esecuzione verde cancella il rosso vecchio dello stesso controllo", () => {
  const ultimi = ultimiPerNome([
    { name: "prove", status: "completed", conclusion: "failure", started_at: "2026-08-04T15:00:00Z" },
    { name: "prove", status: "completed", conclusion: "success", started_at: "2026-08-04T16:00:00Z" },
  ]);
  assert.equal(ultimi.length, 1);
  assert.equal(verdetto(ultimi).stato, STATO.VERDE, "contarli tutti terrebbe in vita un rosso che è stato riparato");
});

test("cinque PR con lo stesso guasto ereditato sono UN lavoro, non cinque", () => {
  const gia = ["❌ test del cervello (exit #)"];
  const prs = [675, 677, 678, 679, 680].map((n) => ({
    numero: n,
    verdetto: { stato: STATO.ROSSO },
    colpa: { classe: COLPA.EREDITATA, nuove: [], gia },
  }));
  assert.equal(daRiparare(prs).length, 0, "nessuna di queste PR va toccata");
  const ereditati = guastiEreditati(prs);
  assert.equal(ereditati.length, 1);
  assert.equal(ereditati[0].pr.length, 5, "un guasto solo, trascinato da cinque PR: l'allarme deve essere uno");
});

test("il contratto d'uscita: 2 = non ho potuto misurare, e non è un verde", () => {
  assert.equal(codiceUscita({ cieco: 1, daRiparare: 0 }), 2);
  assert.equal(codiceUscita({ daRiparare: 1 }), 1);
  assert.equal(codiceUscita({ nonMisurate: 1 }), 1, "una PR mai provata è lavoro da fare");
  assert.equal(codiceUscita({}), 0);
});

test("senza token lo strumento dichiara di essere cieco (exit 2), non dice «tutto verde»", () => {
  const r = spawnSync("node", ["cervello/ci-stato.mjs", "--senza-log"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 60_000,
    env: { ...process.env, GIT_PUSH_TOKEN: "", GIT_TOKEN: "", GITHUB_TOKEN: "", HOME: process.env.HOME },
  });
  assert.equal(r.status, 2, `senza credenziali deve uscire 2 (cieco), non 0: ${r.stdout}${r.stderr}`);
  assert.match(`${r.stdout}${r.stderr}`, /CIECO/);
});

test("il freno sul merge è agganciato davvero a git-merge.mjs", () => {
  // Non basta che `puoMergiare` esista: il difetto di casa è lo strumento costruito e mai messo di
  // guardia (AR-376/AR-393). Qui si misura sul file vero che il merge lo interroghi.
  const src = spawnSync("node", ["-e", "process.stdout.write(require('fs').readFileSync('cervello/git-merge.mjs','utf8'))"], {
    cwd: REPO,
    encoding: "utf8",
  }).stdout;
  assert.match(src, /puoMergiare/, "git-merge.mjs deve chiedere il permesso alla lettura della CI prima di unire");
  assert.match(src, /ci-lettura\.mjs/, "e deve importarlo da un posto solo");
});
