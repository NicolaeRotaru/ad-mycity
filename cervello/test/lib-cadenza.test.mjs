#!/usr/bin/env node
// Prova le MANI condivise delle tre cadenze (cervello/lib-cadenza.sh) facendole GIRARE DAVVERO in
// un repo finto — due processi che si contendono il lucchetto, un marcatore che sopravvive a un
// kill, un esito che finisce su disco.
//
// Copre: AR-145/AR-293 (lucchetto d'esecuzione per cadenza) · AR-317 (marcatore «sto scrivendo»,
// tolto anche se il processo viene ucciso) · AR-163/AR-313 (il codice d'uscita e la traccia) ·
// AR-164 (la traccia è leggibile dal guardiano della freschezza).
//
// Perché eseguire e non cercare un pattern: il difetto storico di monitora.sh era una subshell che
// finiva in `|| true`. Il testo `MONITORA_PUSH_OK` sarebbe stato presente nel file anche con la
// variabile intrappolata dentro la subshell — un grep avrebbe detto verde su un fix che non
// funzionava. Solo l'esecuzione distingue le due cose.
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
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

/** Un repo finto con .git/ e la cartella di auto-coscienza: quel che le funzioni si aspettano. */
function repoFinto() {
  const r = mkdtempSync(join(tmpdir(), "cadenza-"));
  mkdirSync(join(r, ".git"), { recursive: true });
  mkdirSync(join(r, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });
  return r;
}

/** Esegue uno spezzone bash con la libreria caricata e REPO/SCRIPT_DIR impostati. */
function sh(repo, corpo, { attendiRc = true } = {}) {
  const script = `set -uo pipefail
REPO="${repo}"; SCRIPT_DIR="${CERVELLO}"
ts() { date '+%Y-%m-%d %H:%M'; }
cd "$REPO"
. "${LIB}"
${corpo}`;
  try {
    return { rc: 0, out: execFileSync("bash", ["-c", script], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    if (attendiRc) return { rc: e.status, out: (e.stdout || "") + (e.stderr || "") };
    throw e;
  }
}

// ── AR-145 / AR-293 — due cadenze non possono girare insieme ─────────────────
// ⚠️ NON `async`, e non è pignoleria: questo banco lancia i casi con `fn()` secco, senza aspettarli
// (AR-694). Un caso `async` qui restituisce una promessa che nessuno raccoglie: l'asserzione girerebbe
// DOPO il conteggio, e un `1 = 2` stamperebbe «passati». Questo caso non ha niente da aspettare —
// `execFileSync` e `spawn().kill()` sono sincroni — quindi la forma giusta è quella sincrona.
prova("AR-293: la seconda cadenza dello stesso tipo NON parte", () => {
  const repo = repoFinto();
  try {
    // Primo processo: prende il lucchetto e lo tiene per un po'.
    const primo = spawn("bash", [
      "-c",
      `REPO="${repo}"; SCRIPT_DIR="${CERVELLO}"; ts(){ date '+%F %H:%M'; }; cd "$REPO"; . "${LIB}"; cadenza_lock giro && sleep 5`,
    ]);
    // Aspetta che il lucchetto sia davvero preso (il file esiste e flock è attivo).
    const fino = Date.now() + 3000;
    while (!existsSync(join(repo, ".git/MYCITY_RUN_LOCK-giro")) && Date.now() < fino) {
      execFileSync("sleep", ["0.05"]);
    }
    execFileSync("sleep", ["0.4"]);

    const secondo = sh(repo, `cadenza_lock giro; echo "ESITO=$?"`);
    primo.kill("SIGKILL");
    assert.match(secondo.out, /ESITO=1/, "il secondo giro doveva rifiutarsi di partire");
    assert.match(secondo.out, /ne sta già girando una/, "e doveva dirlo, non uscire muto");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-145: il lucchetto è PER TIPO — il mattino non blocca la sera", () => {
  const repo = repoFinto();
  try {
    const primo = spawn("bash", [
      "-c",
      `REPO="${repo}"; SCRIPT_DIR="${CERVELLO}"; ts(){ date '+%F %H:%M'; }; cd "$REPO"; . "${LIB}"; cadenza_lock ritmo-mattino && sleep 5`,
    ]);
    const fino = Date.now() + 3000;
    while (!existsSync(join(repo, ".git/MYCITY_RUN_LOCK-ritmo-mattino")) && Date.now() < fino) {
      execFileSync("sleep", ["0.05"]);
    }
    execFileSync("sleep", ["0.4"]);

    const sera = sh(repo, `cadenza_lock ritmo-sera; echo "ESITO=$?"`);
    const mattino = sh(repo, `cadenza_lock ritmo-mattino; echo "ESITO=$?"`);
    primo.kill("SIGKILL");
    assert.match(sera.out, /ESITO=0/, "la sera deve poter partire mentre gira il mattino");
    assert.match(mattino.out, /ESITO=1/, "un secondo mattino no — è AR-145 (7 rilanci in 100 minuti)");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-293: il lucchetto si libera da solo quando il processo muore", () => {
  const repo = repoFinto();
  try {
    // Un processo che prende il lucchetto e viene ucciso: non deve lasciare lucchetti orfani.
    sh(repo, `( cadenza_lock giro && kill -9 $$ ) || true`);
    execFileSync("sleep", ["0.3"]);
    const dopo = sh(repo, `cadenza_lock giro; echo "ESITO=$?"`);
    assert.match(dopo.out, /ESITO=0/, "un crash non deve bloccare le cadenze successive per sempre");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

// ── AR-317 — il marcatore «sto scrivendo» ───────────────────────────────────
prova("AR-317: mentre la cadenza scrive, l'allineamento lo sa", () => {
  const repo = repoFinto();
  try {
    const r = sh(
      repo,
      `cadenza_scrittura_inizio giro
       cadenza_scrittura_in_corso 3600 && echo "DURANTE=si" || echo "DURANTE=no"
       cadenza_scrittura_fine
       cadenza_scrittura_in_corso 3600 && echo "DOPO=si" || echo "DOPO=no"`,
    );
    assert.match(r.out, /DURANTE=si/, "durante la scrittura il marcatore deve essere visibile");
    assert.match(r.out, /DOPO=no/, "finita la scrittura il marcatore deve sparire");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-317: un marcatore VECCHIO è un residuo, non una scrittura viva", () => {
  const repo = repoFinto();
  try {
    // Un run morto ieri: se contasse, bloccherebbe gli allineamenti per sempre.
    const vecchio = Math.floor(Date.now() / 1000) - 7200;
    writeFileSync(join(repo, ".git/mycity-scrittura-in-corso"), `999 giro ${vecchio}\n`);
    const r = sh(repo, `cadenza_scrittura_in_corso 3600 && echo "VIVA=si" || echo "VIVA=no"`);
    assert.match(r.out, /VIVA=no/, "un marcatore di due ore fa non deve fermare l'allineamento");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-317: ucciso MENTRE il motore gira, il marcatore sparisce lo stesso", () => {
  // Il caso vero, non una semplificazione comoda: il watchdog manda SIGTERM durante i 45 minuti in
  // cui il motore scrive. Bash NON esegue le trap mentre un comando è in PRIMO PIANO — le tiene in
  // sospeso — quindi con il motore in foreground il marcatore sopravviveva al kill e bloccava ogni
  // allineamento fino alla scadenza della finestra di anzianità. Per questo cadenza_ai_run manda il
  // motore in background e lo aspetta con `wait`.
  const repo = repoFinto();
  try {
    const p = spawn("bash", [
      "-c",
      `REPO="${repo}"; SCRIPT_DIR="${CERVELLO}"; ts(){ date '+%F %H:%M'; }; cd "$REPO"; . "${LIB}"
       AI_CMD=(sleep)
       cadenza_scrittura_inizio giro
       cadenza_ai_run giro 30 2700 1 0`,
    ]);
    const fino = Date.now() + 5000;
    while (!existsSync(join(repo, ".git/mycity-scrittura-in-corso")) && Date.now() < fino) {
      execFileSync("sleep", ["0.05"]);
    }
    assert.ok(existsSync(join(repo, ".git/mycity-scrittura-in-corso")), "il marcatore doveva esserci");
    execFileSync("sleep", ["0.5"]); // il motore finto è partito ed è dentro `wait`
    p.kill("SIGTERM");
    execFileSync("sleep", ["1.5"]);
    assert.ok(
      !existsSync(join(repo, ".git/mycity-scrittura-in-corso")),
      "ucciso da fuori, il marcatore resta lì e blocca ogni allineamento: è il danno da evitare",
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-317: il motore non sopravvive alla cadenza che lo ha acceso", () => {
  // Togliere il marcatore lasciando la CLI viva sarebbe una bugia peggiore del difetto: diremmo
  // «ho finito di scrivere» mentre il motore continua a scrivere nel vault, e l'allineamento
  // partirebbe proprio in quel momento.
  const repo = repoFinto();
  try {
    const p = spawn("bash", [
      "-c",
      `REPO="${repo}"; SCRIPT_DIR="${CERVELLO}"; ts(){ date '+%F %H:%M'; }; cd "$REPO"; . "${LIB}"
       AI_CMD=(sleep)
       cadenza_scrittura_inizio giro
       cadenza_ai_run giro 47 2700 1 0`,
    ]);
    const fino = Date.now() + 5000;
    while (!existsSync(join(repo, ".git/mycity-scrittura-in-corso")) && Date.now() < fino) {
      execFileSync("sleep", ["0.05"]);
    }
    execFileSync("sleep", ["0.5"]);
    const vivo = () => {
      try {
        return execFileSync("pgrep", ["-f", "sleep 47"], { encoding: "utf8" }).trim().length > 0;
      } catch {
        return false;
      }
    };
    assert.ok(vivo(), "il motore finto doveva essere in corso");
    p.kill("SIGTERM");
    execFileSync("sleep", ["2"]);
    assert.ok(!vivo(), "il motore è rimasto vivo dopo la morte della cadenza: continua a scrivere nel vault");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

// ── AR-305 — il motore che si appende viene ucciso ──────────────────────────
prova("AR-305: un motore che sfora il suo tempo viene ucciso", () => {
  // «Il monitoraggio del mondo esterno non ha né un timeout né un esito»: monitora.sh lanciava
  // `"${AI_CMD[@]}" "$PROMPT"` e basta — una CLI appesa non tornava MAI, e con Type=oneshot senza
  // TimeoutStartSec nemmeno systemd la scollava. Qui il motore finto dura 6s con un budget da 2s.
  const repo = repoFinto();
  try {
    const r = sh(
      repo,
      `AI_CMD=(sleep)
       cadenza_ai_run monitora 6 2 1 0 >/dev/null 2>&1
       echo "RC=$CADENZA_AI_RC"`,
    );
    assert.match(r.out, /RC=(124|137)/, `il motore doveva essere ucciso dal timeout, rc reale: ${r.out.trim()}`);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-305: il timeout NON è scritto a mano, è derivato dal budget", () => {
  // La riga che il motore stampa dice il conto: budget → secondi per tentativo. Se un giorno
  // qualcuno rimette un numero fisso, quel conto smette di tornare.
  const repo = repoFinto();
  try {
    const r = sh(repo, `AI_CMD=(true); cadenza_ai_run monitora "prompt finto" 2700 3 30 2>&1 | head -2`);
    assert.match(r.out, /budget 2700s → 800s per tentativo × 3/, `riga di budget assente: ${r.out}`);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

// ── AR-163 / AR-313 — l'esito esce dal processo e finisce su disco ───────────
prova("AR-313: push fallito ⇒ codice 2 sullo stdout, non 0", () => {
  const repo = repoFinto();
  try {
    const r = sh(repo, `rc="$(cadenza_esito monitora 0 1 0 1 0)"; echo "RC=[$rc]"`);
    assert.match(r.out, /RC=\[2\]/, "monitora.sh usciva 0 col push fallito: era AR-313");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-163: stdout porta SOLO il numero, non le chiacchiere", () => {
  // Il chiamante fa `exit "$(cadenza_esito …)"`: una riga di log finita nel valore lo rompe. È lo
  // stesso inciampo già pagato in pubblica_memoria col «Current branch is up to date».
  const repo = repoFinto();
  try {
    const r = sh(repo, `rc="$(cadenza_esito monitora 0 1 1 1 0)"; echo "RC=[$rc]"`);
    assert.match(r.out, /RC=\[0\]/, `stdout sporco: ${JSON.stringify(r.out)}`);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-164: l'esito resta scritto, con l'ora, dove il guardiano lo legge", () => {
  const repo = repoFinto();
  try {
    sh(repo, `cadenza_esito ritmo-mattino 1 0 1 1 0 >/dev/null`);
    const p = join(repo, "MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json");
    assert.ok(existsSync(p), "senza la traccia, «non è uscita» e «è uscita male» restano indistinguibili");
    const s = JSON.parse(readFileSync(p, "utf8"));
    assert.equal(s.cadenze["ritmo-mattino"].esito, "motore-fallito");
    assert.equal(s.cadenze["ritmo-mattino"].codice, 1);
    assert.match(s.cadenze["ritmo-mattino"].quando, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "serve l'ora, non la data secca");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

prova("AR-164: due cadenze diverse convivono nello stesso registro", () => {
  const repo = repoFinto();
  try {
    sh(repo, `cadenza_esito giro 0 1 1 1 0 >/dev/null; cadenza_esito monitora 1 0 1 1 0 >/dev/null`);
    const s = JSON.parse(
      readFileSync(join(repo, "MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json"), "utf8"),
    );
    assert.ok(s.cadenze.giro && s.cadenze.monitora, "la seconda non deve cancellare la prima");
    assert.equal(s.cadenze.giro.esito, "pulito");
    assert.equal(s.cadenze.monitora.esito, "motore-fallito");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

// ── esito ────────────────────────────────────────────────────────────────────
const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati\n`);
process.exit(rotti.length ? 1 : 0);
