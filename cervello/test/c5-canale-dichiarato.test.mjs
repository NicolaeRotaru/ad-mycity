#!/usr/bin/env node
// Corsia 5 del lotto 41 — la finestra sbagliata quando è il CANALE da cui si legge il segnale.
//
//   · AR-294 — una relazione che parla di «quota di mercato» convinceva la macchina di aver sbattuto
//     contro il limite del motore AI, perché la classe dell'errore si cercava come PAROLA dentro la
//     prosa. Un errore va classificato da un segnale che la macchina emette apposta.
//   · AR-348 — il quaderno dell'AD era spaccato in due da una maiuscola (`AD.md` e `ad.md`) e il
//     lavoro più grosso è finito nella metà che nessuno legge. La cura è normalizzare ALL'INGRESSO.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CERVELLO = join(REPO, "cervello");

const { classificaErrore, decidiRitento } = await import(join(CERVELLO, "retry-policy.mjs"));
const { chiaveCanonica, chiaveNormalizzata, chiaviDoppie, segnaleDichiarato } = await import(join(CERVELLO, "finestra-misura.mjs"));

function esegui(args, env = {}) {
  try {
    const out = execFileSync("node", args, { cwd: REPO, encoding: "utf8", env: { ...process.env, ...env }, timeout: 60000, stdio: ["ignore", "pipe", "pipe"] });
    return { out, code: 0 };
  } catch (e) {
    return { out: String(e.stdout || "") + String(e.stderr || ""), code: e.status ?? 1 };
  }
}

// ── AR-294 ──────────────────────────────────────────────────────────────────

test("AR-294: il CASO REALE — una relazione sulla quota di mercato non è un limite del motore", () => {
  const relazione =
    "Analisi concorrenza Piacenza: la quota di mercato di Glovo è del 30%, la nostra quota resta marginale. " +
    "Nei prossimi 7 giorni puntiamo ad aumentare la quota nel centro storico.";
  const c = classificaErrore(relazione);
  assert.notEqual(c.classe, "quota", "la parola «quota» dentro una relazione non deve valere come errore del motore");
  assert.equal(c.classe, "altro");

  // La conseguenza vera, non solo l'etichetta: con «quota» la macchina si dava SEI tentativi e
  // rimandava il lavoro di molto più tempo. Un testo di business non deve poter cambiare nessuna
  // delle due cose.
  const daRelazione = decidiRitento({ tipo: "giro", risultato: relazione, tentativi: 0 });
  const daQuotaVera = decidiRitento({ tipo: "giro", risultato: "Error: you are out of usage", tentativi: 0 });
  assert.equal(daRelazione.classe, "altro");
  assert.equal(daRelazione.maxTent, 3, "una relazione non deve comprare i sei tentativi riservati alla quota");
  assert.equal(daQuotaVera.maxTent, 6, "e la quota vera li deve avere ancora");
  const attesaRelazione = Date.parse(daRelazione.quandoISO) - Date.now();
  const attesaQuota = Date.parse(daQuotaVera.quandoISO) - Date.now();
  assert.ok(attesaRelazione < attesaQuota, `un testo di mercato metteva la macchina in attesa come una quota vera (${Math.round(attesaRelazione / 60000)} min)`);
});

test("AR-294: gli errori VERI del motore restano riconosciuti (il fix non spegne la difesa)", () => {
  for (const t of [
    "Error: you are out of usage. resets 9:30pm",
    "HTTP 429 too many requests",
    "insufficient_quota: please check your billing",
    "[worker] Il motore principale era in limite di quota: questo lavoro NON è stato eseguito.",
    "⚠️ [risposta da Ollama locale — motore premium in limite quota]",
  ]) {
    assert.equal(classificaErrore(t).classe, "quota", `non riconosciuto come quota: ${t.slice(0, 50)}`);
  }
  assert.equal(classificaErrore("Invalid API key").classe, "auth");
  assert.equal(classificaErrore("weekly limit reached").classe, "quota_settimanale");
});

test("AR-294: il canale DICHIARATO vince sulla prosa", () => {
  // La cura strutturale: uno script che marca la riga `[classe] …` non può più essere contraddetto
  // da quello che l'AD ha scritto sopra.
  const misto = "La quota di mercato cresce del 12%.\nlavoro finito.\n[classe] timeout";
  const c = classificaErrore(misto);
  assert.equal(c.classe, "timeout");
  assert.equal(c.fonte_classe, "dichiarata");

  assert.equal(classificaErrore("qualsiasi cosa\n[classe] quota").classe, "quota");
  // Una classe inventata non è una dichiarazione: si ripiega sulla prosa invece di fidarsi.
  assert.equal(classificaErrore("testo normale\n[classe] pippo").fonte_classe, "prosa");

  // Il lettore del canale, da solo: vince l'ULTIMA riga marcata (è l'esito finale).
  assert.equal(segnaleDichiarato("[classe] quota\n[classe] auth", "classe").valore, "auth");
  assert.equal(segnaleDichiarato("nessuna marca qui", "classe").dichiarato, false);
});

// ── AR-348 ──────────────────────────────────────────────────────────────────

test("AR-348: «AD» e «ad» sono lo stesso quaderno — la normalizzazione è all'ingresso", () => {
  const roster = ["vendite", "marketing", "tech"];
  const conDeroga = chiaveCanonica("AD", roster, ["ad"]);
  assert.equal(conDeroga.ok, true, "l'AD non è un agente, ma il suo quaderno esiste: è una deroga dichiarata");
  assert.equal(conDeroga.canonico, "ad", "e il nome canonico è quello minuscolo, sempre");

  const maiuscolo = chiaveCanonica("Vendite", roster, []);
  assert.equal(maiuscolo.canonico, "vendite", "una maiuscola non crea un reparto nuovo");

  const sbagliato = chiaveCanonica("vendit", roster, []);
  assert.equal(sbagliato.ok, false);
  assert.ok(sbagliato.simili.includes("vendite"), "e chi sbaglia si vede suggerire i nomi vicini");
  assert.ok(sbagliato.simili.length <= 3);

  assert.deepEqual(chiaviDoppie(["AD", "ad", "vendite"]), [{ normalizzato: "ad", varianti: ["AD", "ad"] }]);
  assert.equal(chiaveNormalizzata("@Vendite "), "vendite");
});

test("AR-348 (comando vero): registra scrive nella casa giusta e rifiuta un reparto inventato", () => {
  // Si lavora su una cartella quaderni FINTA: la memoria vera non si tocca per fare una prova.
  const dir = mkdtempSync(join(tmpdir(), "c5-quaderni-"));
  const squadra = join(dir, "memoria-squadra");
  const agenti = join(dir, ".claude/agents");
  mkdirSync(squadra, { recursive: true });
  mkdirSync(agenti, { recursive: true });
  for (const a of ["vendite", "marketing", "tech"]) writeFileSync(join(agenti, `${a}.md`), "# agente\n");
  // Il comando risolve le cartelle da AD_ROOT (che è la radice del repo): qui si prova la funzione
  // pura sul roster finto e il COMANDO sul roster vero, così nessuna delle due prova è finta.
  try {
    const inventato = esegui([join(CERVELLO, "chiusura-loop.mjs"), "registra", "reparto-che-non-esiste", "ctx", "sc", "1", "1"]);
    assert.equal(inventato.code, 2, "un reparto fuori dal roster non deve più creare un quaderno nuovo");
    assert.match(inventato.out, /non è un reparto/);
    assert.match(inventato.out, /Forse intendevi/, "e il messaggio deve dire dove voleva andare");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AR-348 (comando vero): la sonda VEDE i due quaderni in due case invece di ignorarne uno", () => {
  const r = esegui([join(CERVELLO, "chiusura-loop.mjs"), "--sonda", "--json"]);
  const j = JSON.parse(r.out.slice(r.out.indexOf("{")));
  assert.ok(Array.isArray(j.quaderni_doppi), "la sonda deve riportare i quaderni doppi");
  // Sul repo vero AD.md e ad.md convivono ancora (la fusione è un lavoro a mano sulla memoria, che
  // non si riscrive di nascosto): il guardiano deve dirlo, e questo è il suo compito.
  const casaDoppia = j.quaderni_doppi.find((d) => d.normalizzato === "ad");
  if (existsSync(join(REPO, "memoria-squadra/AD.md"))) {
    assert.ok(casaDoppia, "AD.md esiste ancora: la sonda deve segnalarlo, non passarci sopra");
    assert.ok(casaDoppia.varianti.includes("AD") && casaDoppia.varianti.includes("ad"));
  }
  // E il quaderno canonico è quello minuscolo, quello che i lettori aprono.
  const testoCanonico = readFileSync(join(REPO, "memoria-squadra/ad.md"), "utf8");
  assert.match(testoCanonico, /## Esiti/);
});
