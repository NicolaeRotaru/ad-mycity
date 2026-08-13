#!/usr/bin/env node
// Prova la PENNA del registro delle cadenze (cervello/registra-cadenza.mjs) ESEGUENDOLA — non
// cercando pattern nel codice.
//
// Copre: AR-629/AR-634 (il timbro segue il fuso VERO di Piacenza, non +2h fisse: la formula
// vecchia d'inverno sbagliava di un'ora, e nessun test estivo poteva accorgersene — qui gli
// istanti sono PASSATI come parametro, estate E inverno) · AR-632 (un file corrotto NON azzera
// la storia: copia .broken + recupero dal .bak; e la scrittura è atomica: un crash a metà non
// produce mai il mezzo file da cui l'azzeramento partiva).
//
// Più la PROVA RUNTIME della catena intera: lib-cadenza.sh → cadenza_registra → il modulo,
// eseguita in bash con un repo finto e il percorso del registro iniettato (CADENZA_REGISTRO).
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { timbroOra, fondiEsito, interpretaRegistro, scriviAtomico, leggiRegistroDaDisco, COSA_E } from "../registra-cadenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const MODULO = join(CERVELLO, "registra-cadenza.mjs");
const LIB = join(CERVELLO, "lib-cadenza.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/** La formula VECCHIA, riprodotta qui come pietra di paragone del difetto. */
const formulaVecchia = (q) => new Date(q.getTime() + 2 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ");

/** Esegue la CLI del modulo con env iniettato. Ritorna { rc, stderr }. */
function cli(env) {
  try {
    execFileSync("node", [MODULO], { encoding: "utf8", env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
    return { rc: 0, stderr: "" };
  } catch (e) {
    return { rc: e.status, stderr: e.stderr || "" };
  }
}

// Anche a rc 0 la CLI può parlare su stderr (registro corrotto dichiarato): catturiamolo sempre.
function cliConStderr(env) {
  const out = execFileSync(
    "bash",
    ["-c", `node "${MODULO}" 2>&1 1>/dev/null; exit 0`],
    { encoding: "utf8", env: { ...process.env, ...env } },
  );
  return out;
}

// ── AR-629 / AR-634 — il timbro segue il fuso, non l'ora legale scolpita ─────
prova("AR-629/634: d'ESTATE le due formule coincidono (per questo il difetto dormiva)", () => {
  const estate = new Date("2026-07-01T12:00:00Z");
  assert.equal(timbroOra(estate), "2026-07-01 14:00");
  assert.equal(formulaVecchia(estate), timbroOra(estate), "a luglio +2 fisso e Europe/Rome dicono lo stesso");
});

prova("AR-629/634: a DICEMBRE Piacenza è CET (+1) — la formula vecchia timbrava un'ora avanti", () => {
  const inverno = new Date("2026-12-01T12:00:00Z");
  assert.equal(timbroOra(inverno), "2026-12-01 13:00", "mezzogiorno UTC a dicembre è le 13 a Piacenza");
  assert.equal(formulaVecchia(inverno), "2026-12-01 14:00", "la pietra di paragone: il difetto era proprio questo");
  assert.notEqual(timbroOra(inverno), formulaVecchia(inverno));
});

prova("AR-629/634: il giorno del cambio d'ora (25/10/2026) il timbro scala da solo", () => {
  // Alle 03:00 locali di quella domenica l'orologio è già tornato indietro: 05:00Z = 06:00 CET.
  assert.equal(timbroOra(new Date("2026-10-25T05:00:00Z")), "2026-10-25 06:00");
  // La sera prima è ancora ora legale: 05:00Z = 07:00 CEST.
  assert.equal(timbroOra(new Date("2026-10-24T05:00:00Z")), "2026-10-24 07:00");
});

prova("AR-629/634: il formato resta «AAAA-MM-GG HH:MM» (il Pannello e i guardiani lo parsano)", () => {
  assert.match(timbroOra(new Date()), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
});

// ── il formato del registro non cambia (parità con lo script inline storico) ─
prova("parità: fondiEsito produce ESATTAMENTE l'oggetto dello script inline", () => {
  const voce = {
    tipo: "giro",
    quando: "2026-12-01 13:00",
    esito: "pulito",
    codice: 0,
    ai_rc: 0,
    push_ok: true,
    passi_ok: true,
    vincoli_attivi: 2,
    vincoli: ["coerenza", "sanita"],
  };
  const s = fondiEsito({}, voce);
  assert.deepEqual(s, {
    _cosa_e: COSA_E,
    cadenze: {
      giro: {
        quando: "2026-12-01 13:00",
        esito: "pulito",
        codice: 0,
        ai_rc: 0,
        push_ok: true,
        passi_ok: true,
        vincoli_attivi: 2,
        vincoli: ["coerenza", "sanita"],
      },
    },
    aggiornato: "2026-12-01 13:00",
  });
  // Anche l'ORDINE dei campi della voce: chi legge il file a occhio deve trovarlo uguale a ieri.
  assert.deepEqual(Object.keys(s.cadenze.giro), [
    "quando",
    "esito",
    "codice",
    "ai_rc",
    "push_ok",
    "passi_ok",
    "vincoli_attivi",
    "vincoli",
  ]);
});

prova("parità: una cadenza nuova NON cancella le righe delle altre", () => {
  const prima = fondiEsito({}, { tipo: "giro", quando: "2026-12-01 13:00", esito: "pulito", codice: 0, ai_rc: 0, push_ok: true, passi_ok: true, vincoli_attivi: 0, vincoli: [] });
  const dopo = fondiEsito(prima, { tipo: "monitora", quando: "2026-12-01 14:00", esito: "motore-fallito", codice: 1, ai_rc: 1, push_ok: true, passi_ok: true, vincoli_attivi: 0, vincoli: [] });
  assert.ok(dopo.cadenze.giro && dopo.cadenze.monitora);
  assert.equal(dopo.aggiornato, "2026-12-01 14:00");
});

// ── AR-632 — il registro non si azzera da solo ───────────────────────────────
prova("AR-632: file ASSENTE = si parte da zero senza drammi", () => {
  const r = leggiRegistroDaDisco(join(mkdtempSync(join(tmpdir(), "reg-")), "non-esiste.json"));
  assert.equal(r.stato, "assente");
  assert.deepEqual(r.dati, {});
  assert.equal(r.avvisi.length, 0, "il primo giorno non è un guasto da dichiarare");
});

prova("AR-632: file CORROTTO ≠ file assente — interpretaRegistro li distingue", () => {
  assert.equal(interpretaRegistro(null).stato, "assente");
  assert.equal(interpretaRegistro('{"cadenze":{}}').stato, "ok");
  assert.equal(interpretaRegistro('{"cadenze": {"giro"').stato, "corrotto", "il mezzo file di un crash");
  assert.equal(interpretaRegistro("[1,2]").stato, "corrotto", "un array non è il registro");
});

prova("AR-632: registro corrotto SENZA backup → copia .broken, si dichiara, non si tace", () => {
  const dir = mkdtempSync(join(tmpdir(), "reg-"));
  try {
    const p = join(dir, "esito-cadenze.json");
    writeFileSync(p, '{"cadenze": {"giro": {"quando"'); // il mezzo file di un crash
    const out = cliConStderr({
      CADENZA_REGISTRO: p,
      CADENZA_TIPO: "monitora",
      CADENZA_ESITO: "pulito",
      CADENZA_CODICE: "0",
      CADENZA_AI_RC: "0",
      CADENZA_PUSH_OK: "1",
      CADENZA_PASSI_OK: "1",
      CADENZA_VINCOLI: "0",
      CADENZA_ELENCO: "",
    });
    // La prova resta sul disco…
    const broken = readdirSync(dir).filter((f) => f.includes(".broken-"));
    assert.equal(broken.length, 1, "la copia .broken deve esistere: è la storia che non si butta");
    assert.equal(readFileSync(join(dir, broken[0]), "utf8"), '{"cadenze": {"giro": {"quando"');
    // …l'accaduto si dichiara…
    assert.match(out, /CORROTTO/i, `stderr muto su un registro corrotto: ${JSON.stringify(out)}`);
    // …e il registro nuovo è valido e porta la voce appena scritta.
    const s = JSON.parse(readFileSync(p, "utf8"));
    assert.equal(s.cadenze.monitora.esito, "pulito");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("AR-632: registro corrotto CON backup → la storia delle altre cadenze NON va persa", () => {
  const dir = mkdtempSync(join(tmpdir(), "reg-"));
  try {
    const p = join(dir, "esito-cadenze.json");
    // Il backup dell'ultima scrittura riuscita porta la storia del giro…
    writeFileSync(
      `${p}.bak`,
      JSON.stringify(fondiEsito({}, { tipo: "giro", quando: "2026-12-01 13:00", esito: "pulito", codice: 0, ai_rc: 0, push_ok: true, passi_ok: true, vincoli_attivi: 0, vincoli: [] }), null, 2),
    );
    // …e il registro principale è il mezzo file di un crash.
    writeFileSync(p, '{"_cosa_e": "Esito REALE dell');
    const r = cli({
      CADENZA_REGISTRO: p,
      CADENZA_TIPO: "ritmo-mattino",
      CADENZA_ESITO: "motore-fallito",
      CADENZA_CODICE: "1",
      CADENZA_AI_RC: "1",
      CADENZA_PUSH_OK: "1",
      CADENZA_PASSI_OK: "1",
      CADENZA_VINCOLI: "0",
      CADENZA_ELENCO: "",
    });
    assert.equal(r.rc, 0);
    const s = JSON.parse(readFileSync(p, "utf8"));
    assert.equal(s.cadenze.giro?.esito, "pulito", "la riga del giro doveva tornare dal backup: era l'azzeramento di AR-632");
    assert.equal(s.cadenze["ritmo-mattino"].esito, "motore-fallito", "e la voce nuova deve esserci comunque");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("AR-632: la scrittura è ATOMICA — un crash a metà non tocca il registro buono", () => {
  const dir = mkdtempSync(join(tmpdir(), "reg-"));
  try {
    const p = join(dir, "esito-cadenze.json");
    const buono = { cadenze: { giro: { quando: "2026-12-01 13:00" } } };
    writeFileSync(p, JSON.stringify(buono, null, 2) + "\n");
    // Il crash simulato: la scrittura si ferma a metà dei byte e il processo «muore» lì.
    const implCrash = {
      writeFileSync: (percorso, testo) => {
        writeFileSync(percorso, testo.slice(0, 12));
        throw new Error("crash simulato a metà scrittura");
      },
      renameSync,
    };
    assert.throws(() => scriviAtomico(p, { cadenze: {} }, implCrash));
    // Il registro deve essere ANCORA quello buono: il mezzo file è rimasto nel .tmp, non in p.
    assert.deepEqual(JSON.parse(readFileSync(p, "utf8")), buono, "il crash a metà ha corrotto il registro: è la scrittura diretta di prima");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("AR-632: dopo una scrittura riuscita non restano .tmp orfani e il .bak è aggiornato", () => {
  const dir = mkdtempSync(join(tmpdir(), "reg-"));
  try {
    const p = join(dir, "esito-cadenze.json");
    const r = cli({
      CADENZA_REGISTRO: p,
      CADENZA_TIPO: "giro",
      CADENZA_ESITO: "pulito",
      CADENZA_CODICE: "0",
      CADENZA_AI_RC: "0",
      CADENZA_PUSH_OK: "1",
      CADENZA_PASSI_OK: "1",
      CADENZA_VINCOLI: "0",
      CADENZA_ELENCO: "",
    });
    assert.equal(r.rc, 0);
    assert.equal(readdirSync(dir).filter((f) => f.includes(".tmp-")).length, 0, "un .tmp lasciato in giro è il prossimo file «corrotto»");
    assert.equal(JSON.parse(readFileSync(`${p}.bak`, "utf8")).cadenze.giro.esito, "pulito", "senza .bak il recupero di AR-632 non ha da dove ripartire");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── PROVA RUNTIME — lib-cadenza.sh chiama DAVVERO il modulo ──────────────────
prova("catena intera: cadenza_registra (bash) → registra-cadenza.mjs → riga su disco con l'ora giusta", () => {
  const repo = mkdtempSync(join(tmpdir(), "cadenza-sh-"));
  try {
    mkdirSync(join(repo, ".git"), { recursive: true });
    const registro = join(repo, "registro-iniettato.json");
    const script = `set -uo pipefail
REPO="${repo}"; SCRIPT_DIR="${CERVELLO}"
ts() { date '+%Y-%m-%d %H:%M'; }
cd "$REPO"
. "${LIB}"
export CADENZA_REGISTRO="${registro}"
cadenza_registra giro 0 pulito 0 1 1 2 "coerenza sanita"`;
    execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assert.ok(existsSync(registro), "la funzione bash non ha prodotto il registro: la catena è spezzata");
    const s = JSON.parse(readFileSync(registro, "utf8"));
    assert.equal(s.cadenze.giro.esito, "pulito");
    assert.equal(s.cadenze.giro.codice, 0);
    assert.deepEqual(s.cadenze.giro.vincoli, ["coerenza", "sanita"]);
    assert.equal(s._cosa_e, COSA_E, "il testo _cosa_e che il Pannello mostra deve restare quello");
    // L'ora scritta dev'essere quella di Piacenza ADESSO (tolleranza di un minuto per il bordo).
    const attesi = [timbroOra(new Date()), timbroOra(new Date(Date.now() - 60_000))];
    assert.ok(attesi.includes(s.cadenze.giro.quando), `quando=«${s.cadenze.giro.quando}» non è l'ora di Piacenza (attesa ${attesi[0]})`);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("catena intera: se il modulo fallisce, la cadenza NON muore ma il WARN dice la verità", () => {
  const repo = mkdtempSync(join(tmpdir(), "cadenza-sh-"));
  try {
    mkdirSync(join(repo, ".git"), { recursive: true });
    // CADENZA_REGISTRO che punta dentro una cartella-file: la scrittura non può riuscire.
    writeFileSync(join(repo, "muro"), "");
    const script = `set -uo pipefail
REPO="${repo}"; SCRIPT_DIR="${CERVELLO}"
ts() { date '+%Y-%m-%d %H:%M'; }
cd "$REPO"
. "${LIB}"
export CADENZA_REGISTRO="${join(repo, "muro", "registro.json")}"
cadenza_registra giro 0 pulito 0 1 1 0 ""
echo "SOPRAVVISSUTA=$?"`;
    const out = execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assert.match(out, /SOPRAVVISSUTA=0/, "la registrazione resta non-bloccante per la cadenza");
    // Il WARN vero sta su stderr: rieseguiamo catturandolo.
    const out2 = execFileSync("bash", ["-c", `{ ${script} ; } 2>&1`], { encoding: "utf8" });
    assert.match(out2, /NON registrato su disco/, `il WARN deve dire la verità, non «boh»: ${JSON.stringify(out2)}`);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

// ── esito ────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati\n`);
process.exit(rotti.length ? 1 : 0);
