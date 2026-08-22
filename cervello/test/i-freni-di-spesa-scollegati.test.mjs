#!/usr/bin/env node
// 🧪 I FRENI DI SPESA: dichiarati in un mansionario, e collegati al punto in cui si spende?
//
// Sette difetti, una famiglia. Tutti dicono la stessa cosa in sette modi: esisteva una regola di
// costo — un router che sceglie il modello economico, un tetto di token, un circuit-breaker, un
// gate anti-giri-a-vuoto — e nessuna di quelle regole era attaccata al punto che spende davvero.
// Un freno scritto e non collegato non è un freno: è un foglietto.
//
//   AR-082  il router costo (banco-ai) era codice morto: nessun compito ci passava
//   AR-083  il budget token era cieco: nessuno passava i token reali, la soglia non scattava mai
//   AR-084  la metabolizzazione raddoppiava il costo di ogni chat premium, senza gate di valore
//   AR-085  i rilanci erano ciechi: si riprovava 3 volte anche su quota, bruciando tentativi
//   AR-086  il delta-gate proteggeva solo `giro`, non ritmo né monitora
//   AR-087  nessun circuit-breaker: superata la soglia non si fermava né si diradava niente
//   AR-088  monitora incollava l'intero monitora.md nel prompt, contro la regola anti-prompt-enorme
//
// Le schede erano ferme al 3 luglio; il codice è stato riparato dopo, e nessun guardiano poteva
// dirlo. Qui le cure vengono ESEGUITE: i moduli puri si chiamano, e per i pezzi che vivono dentro
// gli script si guarda che lo script CHIAMI il modulo invece di decidere per conto suo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (p) => readFileSync(join(REPO, p), "utf8");

const { scegliModello } = await import(join(REPO, "cervello/banco-ai.mjs"));
const retry = await import(join(REPO, "cervello/retry-policy.mjs"));

// ── AR-082 · il router costo non è più codice morto ──────────────────────────────────────────────

test("AR-082 · il router SCEGLIE, e sceglie diverso per compiti diversi", () => {
  const volume = scegliModello("testi-volume");
  const difficile = scegliModello("ragionamento-strategico");

  assert.ok(volume && typeof volume === "object", "il router deve rispondere qualcosa di usabile");
  assert.ok(difficile && typeof difficile === "object");
  // Il punto della scheda: se rispondesse la stessa cosa a tutto, sarebbe di nuovo codice morto.
  assert.notDeepEqual(volume, difficile, "un router che dà sempre la stessa risposta non instrada niente");
});

test("AR-082 · e il worker lo CHIAMA: un router che nessuno interroga resta codice morto", () => {
  const worker = leggi("cervello/worker.sh");
  assert.match(worker, /scegliModello/, "il punto che spende deve interrogare il router");
  assert.match(worker, /banco-ai\.mjs/, "e importarlo davvero, non riscriversi la scelta in casa");
});

// ── AR-085 · i rilanci non sono più ciechi ───────────────────────────────────────────────────────

test("AR-085 · la classe dell'errore decide, e le classi hanno budget DIVERSI", () => {
  const { classificaErrore, decidiRitento, MAX_TENTATIVI_QUOTA, MAX_TENTATIVI_ALTRO } = retry;

  // ① l'errore viene CLASSIFICATO, non trattato tutto uguale: era il cuore del difetto.
  assert.equal(classificaErrore("Error: rate limit exceeded, quota esaurita").classe, "quota");
  assert.equal(classificaErrore("ECONNRESET socket hang up").classe, "altro");

  // ② e le due classi non hanno lo stesso numero di tentativi. Prima erano 3 rilanci ciechi per
  //    tutti: su quota si sbatteva contro un muro tre volte di fila bruciando la finestra.
  assert.notEqual(MAX_TENTATIVI_QUOTA, MAX_TENTATIVI_ALTRO, "budget uguali = rilanci di nuovo ciechi");

  // ③ oltre il proprio tetto si FERMA, e il motivo lo dice.
  const finita = decidiRitento({ tipo: "giro", tentativi: 99, risultato: "quota esaurita" });
  assert.equal(finita.azione, "stop");
  assert.equal(finita.classe, "quota");
  assert.match(finita.motivo, /esauriti i tentativi/);

  // ④ e sotto il tetto si ritenta col backoff: un freno sempre chiuso verrebbe tolto entro la settimana.
  const ancora = decidiRitento({ tipo: "giro", tentativi: 1, risultato: "quota esaurita" });
  assert.equal(ancora.azione, "ritenta");
  assert.ok(ancora.quandoISO, "un ritento senza QUANDO è un rilancio cieco con un altro nome");

  // ⑤ un guasto passeggero ha il suo tetto, più stretto: aspettare sei volte un socket non serve.
  assert.equal(decidiRitento({ tipo: "giro", tentativi: MAX_TENTATIVI_ALTRO + 1, risultato: "ECONNRESET" }).azione, "stop");
});

test("AR-085 · e giro.sh CHIEDE alla policy invece di riprovare per conto suo", () => {
  const giro = leggi("cervello/giro.sh");
  assert.match(giro, /retry-policy\.mjs/, "la decisione dev'essere una sola, e non dentro lo script");
  assert.match(giro, /retry-policy dice STOP/, "e lo script deve poter FERMARSI quando la policy lo dice");
});

// ── AR-083 / AR-087 · il tetto di spesa esiste, riceve numeri veri e ferma ───────────────────────

test("AR-083 · i token reali arrivano al contatore, invece di restare a zero", () => {
  const giro = leggi("cervello/giro.sh");
  // Il difetto: nessuno passava i token, quindi la soglia non poteva scattare nemmeno in teoria.
  assert.match(giro, /GIRO_TOKEN/, "il numero di token dev'essere raccolto…");
  assert.match(giro, /--token="\$GIRO_TOKEN"/, "…e PASSATO al contatore, o resta un numero che nessuno legge");
});

test("AR-087 · superata la soglia di oggi il giro premium NON parte", () => {
  const giro = leggi("cervello/giro.sh");
  assert.match(giro, /costo-ai\.mjs" --json/, "il tetto si legge da un motore, non da una frase");
  assert.match(giro, /token_per_gate/, "e il numero che decide ha un nome, quindi è ispezionabile");
  // Il cancello dev'essere sulla SICUREZZA, non aggirabile dalla scorciatoia che aggira il throttle.
  assert.match(giro, /GATE-BUDGET non bypassa GIRO_FORCE/, "la forzatura salta il throttle, mai il tetto di spesa");
});

// ── AR-086 · il gate anti-giri-a-vuoto copre anche le altre cadenze ──────────────────────────────

test("AR-086 · anche il ritmo passa dal delta-gate, non solo il giro", () => {
  const ritmo = leggi("cervello/ritmo.sh");
  assert.match(ritmo, /delta-gate\.mjs/, "era il difetto: il gate proteggeva solo `giro`");
  // …e con la clausola che è costata cara: il gate NON deve congelare il report della memoria.
  assert.match(ritmo, /Il delta-gate resta solo sul mezzogiorno/, "il perché del confine dev'essere scritto");
});

// ── AR-084 · la metabolizzazione non raddoppia più il costo in silenzio ──────────────────────────

test("AR-084 · la metabolizzazione è un lavoro di FONDO: una chat le passa davanti", () => {
  const worker = leggi("cervello/worker.sh");
  // La cura vera: non è un gate di valore, è una precedenza — la chat di Nicola non aspetta dietro
  // una metabolizzazione, e la metabolizzazione non si mangia il turno premium.
  assert.match(worker, /una chat in attesa passa SEMPRE davanti a giro\/ritmo\/metabolizza/,
    "la precedenza dev'essere dichiarata, o torna il FIFO stretto che l'aveva causata");
});

// ── AR-088 · il prompt del monitora non è più un file intero ─────────────────────────────────────

test("AR-088 · monitora passa un PUNTATORE, non tutto il file dentro il prompt", () => {
  const mon = leggi("cervello/monitora.sh");
  assert.match(mon, /NON incollare tutto monitora\.md nel prompt/, "il perché sta scritto accanto alla cura");
  assert.doesNotMatch(mon, /cat "\$SCRIPT_DIR\/monitora\.md"/, "se torna il `cat`, torna il prompt enorme");
});
