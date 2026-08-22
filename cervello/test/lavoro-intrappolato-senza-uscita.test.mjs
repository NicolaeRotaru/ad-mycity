#!/usr/bin/env node
// AR-761 — IL LAVORO CHE NON PUÒ USCIRE, E IL DEBITO DICHIARATO CHE È STATO ESTINTO.
//
// LA STORIA. `aggiorna-cervello.sh` fa la cosa giusta a fermarsi: se i commit locali non si
// pubblicano, allinearsi li cancellerebbe. Ma da lì in poi non esisteva NESSUNA uscita automatica.
// Il server restava sulla versione vecchia e ci restava per sempre, riprovando la stessa cosa ogni
// cinque minuti — 72 volte il 16/8. Il lavoro non era perso: esisteva in una copia sola, su un
// disco, dietro un `checkout -f` che poteva cancellarla.
//
// PERCHÉ IL FIX NON ERA MAI STATO SCRITTO. Sta scritto nella scheda, ed è una frase onesta:
//   «Serve un repo finto con due storie divergenti e un remoto scrivibile: da questa sessione non ho
//    un remoto su cui provare il push del ramo di salvataggio. Debito dichiarato: il fix non si
//    scrive finché non si può provare.»
// Quel debito è estinto qui sotto. Il banco costruisce un remoto vero (`--bare`), due storie che
// divergono davvero, e guarda cosa arriva dall'altra parte.
//
// IL TETTO, che è la metà importante del fix. L'allineamento gira ogni cinque minuti: un ramo di
// salvataggio per giro farebbe 288 rami al giorno — cioè **la stessa malattia che stiamo curando**,
// un'operazione che sa rimandarsi e che nessuno ferma. Quindi un ramo al giorno, che avanza per
// fast-forward, e nemmeno quello se la punta non è cambiata.
//
// COSA PROVA QUESTO FILE:
//   ① il lavoro intrappolato ESCE: finisce su un ramo del remoto, con i commit dentro;
//   ② il tetto tiene: rilanciando senza lavoro nuovo non nasce un secondo ramo;
//   ③ lavoro nuovo dopo un salvataggio avanza lo STESSO ramo del giorno, non ne apre un altro;
//   ④ se il salvataggio non riesce, lo dice invece di tacere.
//
// 🟢 Sola lettura sul repo dell'AD: tutto avviene in /tmp.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const COPIONE = join(REPO, "cervello/vps/aggiorna-cervello.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/**
 * Il banco che la scheda diceva di non avere: un remoto VERO su cui si può spingere, e un server
 * con del lavoro che non riesce a passare su main.
 */
function bancoConRemotoVero() {
  const base = mkdtempSync(join(tmpdir(), "mycity-intrappolato-"));
  const remoto = join(base, "remoto.git");
  const server = join(base, "server");
  const semina = join(base, "semina");

  mkdirSync(semina, { recursive: true });
  const gs = (...a) => execFileSync("git", a, { cwd: semina, encoding: "utf8", stdio: "pipe" });
  gs("init", "-q", "-b", "main");
  gs("config", "user.email", "t@m.local");
  gs("config", "user.name", "t");
  writeFileSync(join(semina, "nota.md"), "principio\n");
  gs("add", "-A");
  gs("commit", "-q", "-m", "base", "--no-verify");
  execFileSync("git", ["clone", "-q", "--bare", semina, remoto], { encoding: "utf8" });

  execFileSync("git", ["clone", "-q", remoto, server], { encoding: "utf8" });
  const g = (...a) => execFileSync("git", a, { cwd: server, encoding: "utf8", stdio: "pipe" });
  g("config", "user.email", "server@m.local");
  g("config", "user.name", "server");

  return {
    base, remoto, server, g,
    /** Aggiunge del lavoro del server che (per finta) non riesce a passare su main. */
    lavoroDelServer(testo) {
      writeFileSync(join(server, "nota.md"), testo);
      g("add", "-A");
      g("commit", "-q", "-m", `lavoro del server: ${testo.trim()}`, "--no-verify");
    },
    /** Lancia SOLO le funzioni del salvataggio, prese dal copione vero. */
    salva(quanti = 1, urlFinto = null) {
      const url = urlFinto === null ? remoto : urlFinto;
      // Si estraggono le due funzioni dal copione VERO e si eseguono: così la prova misura il
      // codice che gira sul server, non una sua imitazione scritta qui dentro.
      const script = `
        set -uo pipefail
        REPO="${server}"
        branch=main
        ts() { date '+%Y-%m-%d %H:%M'; }
        cd "$REPO"
        eval "$(sed -n '/^ramo_di_salvataggio()/,/^}/p' "${COPIONE}")"
        eval "$(sed -n '/^salva_il_lavoro_intrappolato()/,/^}/p' "${COPIONE}")"
        salva_il_lavoro_intrappolato "${url}" "${quanti}"
      `;
      const r = spawnSync("bash", ["-c", script], { encoding: "utf8" });
      return { rc: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
    },
    /** I rami che esistono DAVVERO sul remoto: l'unica risposta che conta. */
    ramiSulRemoto() {
      const out = execFileSync("git", ["branch", "--format=%(refname:short)"], {
        cwd: remoto, encoding: "utf8", stdio: "pipe",
      });
      return out.split("\n").map((s) => s.trim()).filter(Boolean);
    },
    /** Cosa contiene un ramo del remoto, per verificare che il lavoro ci sia per davvero. */
    contenutoSulRemoto(ramo, file = "nota.md") {
      return execFileSync("git", ["show", `${ramo}:${file}`], {
        cwd: remoto, encoding: "utf8", stdio: "pipe",
      });
    },
    pulisci() { rmSync(base, { recursive: true, force: true }); },
  };
}

const con = (fn) => {
  const b = bancoConRemotoVero();
  try { return fn(b); } finally { b.pulisci(); }
};

// ── ① IL DEBITO ESTINTO: il lavoro esce davvero ──────────────────────────────
prova("il lavoro intrappolato finisce su un ramo del remoto, coi commit dentro", () =>
  con((b) => {
    b.lavoroDelServer("lavoro che non passa su main\n");
    const r = b.salva(1);
    assert.equal(r.rc, 0, `il salvataggio non e' riuscito: ${r.out}`);
    const rami = b.ramiSulRemoto().filter((x) => x.startsWith("vps/salvataggio-"));
    assert.equal(rami.length, 1, `atteso un ramo di salvataggio, trovati: ${JSON.stringify(b.ramiSulRemoto())}`);
    // Non basta che il ramo esista: dentro ci deve essere IL LAVORO.
    assert.equal(
      b.contenutoSulRemoto(rami[0]),
      "lavoro che non passa su main\n",
      "il ramo c'e' ma il lavoro del server non e' dentro",
    );
    assert.match(r.out, /al sicuro su GitHub/, "non lo dice a nessuno");
  }));

// ── ② IL TETTO, PEZZO ①: il nome per giorno tiene il conto dei rami a uno ────
prova("quattro giri non aprono quattro rami: il nome per giorno li tiene a uno", () =>
  con((b) => {
    b.lavoroDelServer("una volta sola\n");
    assert.equal(b.salva(1).rc, 0);
    // Il server riprova ogni cinque minuti: qui si simulano altri tre giri.
    for (let i = 0; i < 3; i++) assert.equal(b.salva(1).rc, 0, "un giro ha fallito");
    const rami = b.ramiSulRemoto().filter((x) => x.startsWith("vps/salvataggio-"));
    assert.equal(
      rami.length, 1,
      `quattro giri hanno fatto ${rami.length} rami: a questo ritmo sarebbero 288 al giorno`,
    );
  }));

// ── ②bis IL TETTO, PEZZO ②: il memo evita di ri-spingere ciò che non è cambiato ─
// ⚠️ QUESTA PROVA È NATA DA UN ERRORE MIO, e vale la pena scriverlo. La prima versione della ②
// pretendeva di misurare il memo contando i rami — ma i rami restano uno per via del NOME, non del
// memo. Togliendo il memo la prova restava verde: misurava una cosa e ne dichiarava un'altra.
// L'ha trovato la mutazione, non la lettura. Adesso il memo si misura per il suo effetto vero:
// **se la punta non è cambiata, il remoto non viene toccato affatto** — e lo si dimostra puntando
// a un remoto rotto, che farebbe fallire qualunque push davvero tentato.
prova("con la punta invariata il remoto non viene toccato (e si vede: regge anche se e' rotto)", () =>
  con((b) => {
    b.lavoroDelServer("salvato una volta\n");
    assert.equal(b.salva(1).rc, 0, "il primo salvataggio doveva riuscire");
    const rotto = join(b.base, "remoto-sparito.git");
    const r = b.salva(1, rotto);
    assert.equal(
      r.rc, 0,
      `ha provato a spingere di nuovo un lavoro identico: senza memo il server ritenta ogni cinque minuti → ${r.out}`,
    );
    assert.doesNotMatch(r.out, /restano SOLO qui/, "e' arrivato fino al push: il memo non ha fermato niente");
  }));

// ── ③ LAVORO NUOVO: avanza, non prolifera ────────────────────────────────────
prova("lavoro nuovo dopo un salvataggio AVANZA lo stesso ramo del giorno", () =>
  con((b) => {
    b.lavoroDelServer("primo\n");
    assert.equal(b.salva(1).rc, 0);
    b.lavoroDelServer("secondo\n");
    assert.equal(b.salva(2).rc, 0, "il secondo salvataggio non e' riuscito");
    const rami = b.ramiSulRemoto().filter((x) => x.startsWith("vps/salvataggio-"));
    assert.equal(rami.length, 1, `atteso ancora un ramo solo, trovati ${rami.length}`);
    assert.equal(
      b.contenutoSulRemoto(rami[0]), "secondo\n",
      "il ramo non e' avanzato: il lavoro nuovo non e' al sicuro",
    );
  }));

// ── ④ SE NON RIESCE, LO DICE ─────────────────────────────────────────────────
prova("un salvataggio che non riesce lo DICE (il silenzio toglie l'allarme e lascia il pericolo)", () =>
  con((b) => {
    b.lavoroDelServer("lavoro vero\n");
    const r = b.salva(1, join(b.base, "remoto-che-non-esiste.git"));
    assert.notEqual(r.rc, 0, "un remoto inesistente e' passato per salvataggio riuscito");
    assert.match(r.out, /restano SOLO qui/, "ha fallito in silenzio: e' il difetto, non la cura");
  }));

let falliti = 0;
for (const c of casi) {
  console.log(c.ok ? `  ✓ ${c.nome}` : `  ✗ ${c.nome}\n      ${c.err}`);
  if (!c.ok) falliti++;
}
console.log(`\n${casi.length - falliti}/${casi.length} passate`);
process.exit(falliti ? 1 : 0);
