#!/usr/bin/env node
// 🧪 IL SEMAFORO CHE DECIDE SE UNA COSA ESCE NEL MONDO REALE.
//
// Sei difetti, una famiglia: i freni che separano «la macchina ha preparato una cosa» da «la cosa è
// partita verso clienti, negozi o il pubblico». Registrati il 3 luglio, e nel frattempo curati tutti
// — ma le schede erano ferme a una verifica che puntava a codice cambiato da allora, quindi nessun
// guardiano poteva né chiuderle né accorgersi se tornavano.
//
//   AR-072 [BLOCCANTE] l'autopilot pubblicava da solo i 🟡 in LIVE, cioè post pubblici sul brand,
//                      contro la regola «pubblicare = 🔴» scritta in CLAUDE.md
//   AR-074             il colore era auto-dichiarato nel file-dati e scollegato dal canale vero:
//                      una voce poteva scriversi «verde» e partire verso un indirizzo reale
//   AR-075             ONESTA-RULES era prosa: nessun guardiano leggibile da una macchina sul
//                      percorso di pubblicazione
//   AR-076             i 🟡 partivano senza che Nicola ne sapesse niente
//   AR-077             «STOP automatico se un reparto brucia budget» era solo prosa
//   AR-078             la mano grezza eseguiva senza legame con l'azione approvata e senza traccia
//
// ⚠️ IL METRO. Questa non è una prova che cerca parole: fa girare l'autopilot VERO in LIVE, con le
// chiavi valorizzate, e guarda cosa succede. Se il freno cade, qualcosa parte davvero.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const AUTOPILOT = join(REPO, "cervello/autopilot.mjs");

const { coloreEffettivo } = await import(join(REPO, "cervello/autopilot.mjs"));
// `coloreMinimoPer` vive coi publisher, ed è giusto: il rischio è una proprietà del CANALE.
const { coloreMinimoPer } = await import(join(REPO, "cervello/publishers/index.mjs"));
const { consensoInvio, azioneIdUsabile } = await import(join(REPO, "cervello/consenso-azione.mjs"));

function giroLive(voci) {
  const dir = mkdtempSync(join(tmpdir(), "semaforo-"));
  const calendario = join(dir, "calendario.json");
  const coda = join(dir, "coda.md");
  writeFileSync(calendario, JSON.stringify({ voci }, null, 2));
  writeFileSync(coda, "# ⏳ AZIONI IN ATTESA (firma di Nicola)\n");
  const r = spawnSync(process.execPath, [AUTOPILOT, "giro", "--tutto"], {
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOPILOT_LIVE: "1",
      AUTOPILOT_CALENDARIO: calendario,
      AUTOPILOT_CODA: coda,
      AUTOPILOT_LOG_DIR: join(dir, "log"),
      // Chiavi valorizzate: senza i freni, questo basterebbe a far partire la pubblicazione.
      RESEND_API_KEY: "CHIAVE-FINTA-DI-TEST-NON-E-UNA-CHIAVE-VERA",
      RESEND_FROM: "MyCity <no-reply@test.invalid>",
      TELEGRAM_BOT_TOKEN: "finto",
      TELEGRAM_CHAT_ID: "12345",
      FACEBOOK_PAGE_TOKEN: "finto",
      FACEBOOK_PAGE_ID: "12345",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_KEY: "",
    },
  });
  return { out: `${r.stdout || ""}${r.stderr || ""}`, coda: existsSync(coda) ? readFileSync(coda, "utf8") : "" };
}

// ── AR-072 · il bloccante: un post pubblico non parte da solo ────────────────────────────────────

test("AR-072 · un post pubblico (🟡) in LIVE viene ACCODATO, non pubblicato", () => {
  const { out, coda } = giroLive([
    {
      id: "prova-ar072",
      data: "2026-01-01",
      canale: "facebook",
      titolo: "Post sulla pagina MyCity",
      testo: "Oggi apre una bottega nuova.",
      colore: "giallo",
      stato: "programmato",
    },
  ]);
  assert.match(out, /prova-ar072/, "la voce dev'essere stata processata, o la prova non prova niente");
  assert.match(out, /ACCODATO per firma di Nicola/, "un 🟡 in LIVE si ferma alla firma: era il bloccante");
  assert.doesNotMatch(out, /pubblicat[oa] su facebook|INVIAT[OA]/i, "niente dev'essere uscito");
  assert.match(coda, /\[AUTOPILOT\] 🔴 Pubblicare/, "e Nicola deve trovarselo in coda, o il freno è muto");
  assert.match(coda, /Perche' 🔴/, "con scritto perché: una card muta non si firma");
});

test("AR-072 · il freno non si compra dichiarandosi verde: comanda il CANALE", () => {
  const { out } = giroLive([
    {
      id: "prova-ar072b",
      data: "2026-01-01",
      canale: "facebook",
      titolo: "Post che si dichiara sicuro",
      testo: "Novità.",
      colore: "verde", // ⬅️ la bugia
      stato: "programmato",
    },
  ]);
  assert.match(out, /ACCODATO per firma di Nicola/, "il canale vale 🟡 anche se la voce si dichiara verde");
});

test("AR-073 · un colore che non si capisce vale 🔴, non «vai pure» (fail-closed sull'enum)", () => {
  const { out } = giroLive([
    { id: "prova-ar072c", data: "2026-01-01", canale: "telegram", titolo: "x", testo: "y", colore: "verdino", stato: "programmato" },
  ]);
  assert.match(out, /ACCODATO per firma di Nicola/, "fail-closed: un colore sconosciuto non è un permesso");
});

// ── AR-074 · il rischio lo dichiara il canale, non la voce ───────────────────────────────────────

test("AR-074 · il colore minimo è una proprietà del CANALE, e c'è una fonte di verità", () => {
  assert.equal(coloreMinimoPer("email", { to: "cliente@reale.it" }), "🔴", "clienti veri, consenso, irreversibile");
  assert.equal(coloreMinimoPer("facebook", {}), "🟡", "pubblico: cancellabile, mai automatico");
  assert.equal(coloreMinimoPer("telegram", {}), "🟢", "la chat dell'owner è l'unico canale interno");
  // Fail-closed anche qui: un canale che nessun publisher dichiara non è un canale sicuro.
  assert.equal(coloreMinimoPer("piccione-viaggiatore", {}), "🔴");
  // E la voce non può migliorarsi: il peggiore dei due vince sempre.
  assert.equal(coloreEffettivo({ canale: "email", to: "cliente@reale.it", colore: "verde" }), "🔴");
  assert.equal(coloreEffettivo({ canale: "telegram", colore: "rosso" }), "🔴");
});

// ── AR-076 · un 🟡 fermato lascia una traccia che Nicola può leggere ─────────────────────────────

test("AR-076 · un 🟡 non sparisce in silenzio: dice PERCHÉ si è fermato", () => {
  const { out, coda } = giroLive([
    { id: "prova-ar076", data: "2026-01-01", canale: "facebook", titolo: "Post", testo: "z", colore: "verde", stato: "programmato" },
  ]);
  // La scheda chiedeva «avvisa». La cura è arrivata dal difetto padre: il 🟡 non parte più da solo,
  // quindi non c'è niente da notificare a cose fatte — c'è una card da firmare, che è meglio.
  assert.match(out, /il canale "facebook" vale almeno/, "il motivo dev'essere scritto, non dedotto");
  assert.match(coda, /\[AUTOPILOT\] 🔴 Pubblicare/, "e finisce nella coda che Nicola guarda");
});

// ── AR-075 · l'onestà è un guardiano che può fallire, non una regola scritta ─────────────────────

test("AR-075 · un numero inventato viene FERMATO dal controllo di onestà", () => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/onesta-check.mjs"), "--testo", "Già 500 famiglie ordinano su MyCity ogni settimana."], { encoding: "utf8" });
  assert.notEqual(r.status, 0, "un numero senza fonte deve far uscire il guardiano diverso da zero");

  // E un testo onesto passa: un guardiano sempre rosso viene spento entro la settimana.
  const ok = spawnSync(process.execPath, [join(REPO, "cervello/onesta-check.mjs"), "--testo", "Vieni a scoprire le botteghe di Piacenza."], { encoding: "utf8" });
  assert.equal(ok.status, 0, `un testo senza numeri inventati deve passare (uscito ${ok.status}: ${ok.stdout || ""}${ok.stderr || ""})`);
});

test("AR-075 · è la FONTE a far passare un numero, non il numero in sé", () => {
  // Il caso qui sopra non provava questa regola: quella frase la ferma un'altra regola, e il
  // riconoscitore di fonte si poteva aprire del tutto senza che nessuno se ne accorgesse. Misurato
  // il 26/8 (AR-840). Qui la frase è scelta perché tripla SOLO la regola dei numeri senza fonte:
  // cambia una cosa sola fra i tre casi, la fonte.
  const giudica = (testo) =>
    spawnSync(process.execPath, [join(REPO, "cervello/onesta-check.mjs"), "--testo", testo], { encoding: "utf8" }).status;

  assert.notEqual(giudica("Il catalogo conta 500 prodotti."), 0, "un numero senza fonte deve essere fermato");
  assert.equal(giudica("Il catalogo conta 500 prodotti (fonte: Supabase)."), 0, "lo stesso numero con la fonte deve passare");

  // Il guardrail: un marcatore STRUTTURATO, non la parola «fonte» usata in una frase. Senza questo
  // basterebbe scrivere «da fonte affidabile» accanto a un numero inventato per farlo passare.
  assert.notEqual(
    giudica("Il catalogo conta 500 prodotti, da una fonte affidabile."),
    0,
    "la parola «fonte» in mezzo a una frase non è una fonte: sarebbe la scorciatoia per far passare tutto",
  );
});

// ── AR-077 · lo STOP di budget è un motore che gira, non una frase nel mansionario ───────────────

test("AR-077 · la sentinella del budget ESISTE, gira e dice reparto per reparto quanto si è speso", () => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/sentinella-budget.mjs"), "--dry"], { encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  assert.match(out, /budget/i, "deve produrre un referto, non silenzio");
  assert.match(out, /ads-performance|marketing/, "e nominare i reparti che hanno un budget");
  // Il punto della scheda: la soglia di STOP dev'essere un NUMERO CONFIGURABILE, non prosa.
  // Prima qui c'era `assert.match(src, /soglia_stop/)` — una parola cercata nel sorgente. Non
  // poteva fallire: la mutazione che smette di leggere la soglia lascia la parola nel commento che
  // spiega perché non la legge più. Misurato il 26/8 (AR-840).
  //
  // Adesso si guarda il COMPORTAMENTO: stessa spesa, stesso budget, due soglie diverse → due
  // verdetti diversi. Se la soglia smette di essere letta, i due verdetti diventano uguali.
  const dir = mkdtempSync(join(tmpdir(), "budget-soglia-"));
  const conSoglia = (soglia) => {
    const f = join(dir, `b-${soglia}.json`);
    writeFileSync(f, JSON.stringify({ soglia_stop: soglia, reparti: { "ads-performance": { budget: 100, speso: 50 } } }));
    const x = spawnSync(process.execPath, [join(REPO, "cervello/sentinella-budget.mjs"), "--dry", "--file", f], { encoding: "utf8" });
    return `${x.stdout || ""}${x.stderr || ""}`;
  };
  assert.match(conSoglia(0.4), /STOP/, "speso metà del budget con la soglia al 40%: lo STOP deve scattare");
  assert.doesNotMatch(conSoglia(0.9), /STOP/, "la stessa spesa con la soglia al 90% non deve fermare nessuno");
});

// ── AR-078 · la mano grezza lascia traccia e cita l'azione approvata ─────────────────────────────

test("AR-078 · chi esegue una mano deve citare l'azione firmata e scrivere in DECISIONI", () => {
  const src = readFileSync(join(REPO, "cervello/esegui-azione.mjs"), "utf8");
  assert.match(src, /AZIONE_ID/, "l'esecuzione dev'essere legata a una riga della coda approvata");
  assert.match(src, /DECISIONI\.md/, "e lasciare una traccia append-only");
  assert.match(src, /consenso-azione\.mjs/, "passando dal cancello del consenso, non a mano libera");

  // IL COMPORTAMENTO, non la forma: si esegue il cancello vero. Senza un'azione firmata e senza
  // PAUSA verificabile (niente credenziali) deve NEGARE — fail-closed, non «nel dubbio vai».
  // ⚠️ Questo caso prova il PRIMO cancello, non il secondo: senza credenziali la PAUSA non è
  // verificabile e nega prima ancora di guardare la firma. È fail-closed, ed è giusto — ma per anni
  // ha fatto sembrare provata anche la regola sulla firma, che non lo era: la mutazione che apriva
  // QUEL cancello restava verde. Misurato il 26/8 (AR-840).
  return consensoInvio({ azioneId: "", canale: "email", destinatario: "cliente@reale.it" }).then((g) => {
    assert.equal(g.live, false, "senza azione firmata il cancello nega");
    assert.ok(String(g.motivo || "").length > 0, "e dice perché: un no muto non si diagnostica");
  });
});

test("AR-078 · un invio senza azione firmata NON è agganciato a niente, e si vede da solo", () => {
  // La regola isolata da chi la usa, perché dentro `consensoInvio` non ci si arriva senza chiavi.
  // Vuoto, spazi, niente: tutti «non agganciato».
  for (const v of ["", "   ", null, undefined]) {
    assert.equal(azioneIdUsabile(v), false, `«${String(v)}» è passato per una firma`);
  }
  // E i segnaposti che gli script scrivono quando un id non c'è valgono come assenza, non come id:
  // è la strada per cui un invio finirebbe agganciato alla parola «non impostato».
  for (const v of ["(non collegato)", "non impostato", "(vuoto)"]) {
    assert.equal(azioneIdUsabile(v), false, `il segnaposto «${v}» è passato per una firma`);
  }
  // Un id vero invece passa, o il cancello sarebbe chiuso e basta — che non è un cancello.
  for (const v of ["#178", "AZ-12"]) {
    assert.equal(azioneIdUsabile(v), true, `«${v}» è un id vero e non è passato`);
  }
});
