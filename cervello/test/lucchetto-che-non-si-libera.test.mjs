#!/usr/bin/env node
// 🔒 IL LUCCHETTO DELLA CADENZA SI LIBERA DAVVERO QUANDO LA CADENZA MUORE.
//
// IL CASO VERO, notte del 13→14 agosto 2026. Alle 23:28 l'ultimo push del server; poi otto ore di
// silenzio. Il worker non era morto — la coda dei lavori mostra un «giro» toccato alle 06:26 con sei
// tentativi, e ogni volta lo stesso esito: «⏭️ Cadenza «giro»: ne sta già girando una (lucchetto
// .git/MYCITY_RUN_LOCK-giro) — esco senza fare nulla». Nessun giro, nessuna visita del mattino,
// nessuna memoria pubblicata: da fuori, una macchina viva che non produceva niente.
//
// LA CAUSA. `cadenza_lock()` prende il lucchetto con `flock` su fd 8, e il commento in testa a
// lib-cadenza.sh dichiarava: «Il descrittore si rilascia da solo quando il processo muore: un kill o
// un crash non lascia lucchetti orfani». È vero del processo e falso della sua DISCENDENZA. Il
// motore AI parte in background (`&`) ed eredita i descrittori aperti, fd 8 compreso: finché quel
// figlio è vivo il lucchetto resta preso, anche a padre morto da ore. Un motore appeso — una CLI che
// non termina, un timeout che non ha ucciso il nipote — basta a fermare tutte le cadenze per sempre,
// in silenzio, perché «ne sta già girando una» è una riga informativa e non un allarme.
//
// COSA PROVA QUESTO FILE. Non che il codice contenga `8>&-`: che il lucchetto sia RIPRENDIBILE dopo
// la morte del padre, con un figlio ancora vivo. È la differenza fra leggere una riga e misurare un
// comportamento — e qui conta, perché il difetto stava proprio in una riga che diceva il contrario
// di quello che il sistema faceva.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const LIB = join(REPO, "cervello/lib-cadenza.sh");

const haFlock = spawnSync("sh", ["-c", "command -v flock"], { encoding: "utf8" }).status === 0;

/**
 * Mette in scena il caso vero e torna `true` se il lucchetto è ancora preso.
 *
 * @param eredita  se true il figlio eredita fd 8 (il difetto), se false lo chiude (la cura)
 */
function lucchettoRestaPreso(eredita) {
  const dir = mkdtempSync(join(tmpdir(), "lucchetto-"));
  try {
    const lock = join(dir, "MYCITY_RUN_LOCK-giro");
    const vivo = join(dir, "figlio-vivo");
    const chiudi = eredita ? "" : "8>&- ";
    // Il padre prende il lucchetto, lancia un figlio che sopravvive, e muore.
    const padre = join(dir, "padre.sh");
    writeFileSync(
      padre,
      `#!/usr/bin/env bash
exec 8>"${lock}"
flock -n 8 || exit 9
# Il figlio vive più del padre: è il motore AI rimasto appeso. stdin/stdout/stderr vanno a
# /dev/null perché altrimenti tiene aperta la pipe di chi lancia il padre, e il test aspetterebbe
# lui invece del padre — misurando l'attesa, non il lucchetto.
${chiudi}sleep 20 </dev/null >/dev/null 2>&1 &
echo $! > "${vivo}"
exit 0
`,
      { mode: 0o755 }
    );
    execFileSync("bash", [padre], { timeout: 10_000 });
    assert.ok(existsSync(vivo), "la scena non è valida se il figlio non è nato");

    // Adesso il padre è morto. Un'altra cadenza prova a prendere lo stesso lucchetto.
    const r = spawnSync("bash", ["-c", `exec 8>"${lock}"; flock -n 8 && echo LIBERO || echo PRESO`], {
      encoding: "utf8",
      timeout: 10_000,
    });
    const preso = (r.stdout || "").includes("PRESO");
    // Ripulisco il figlio: un `sleep 30` orfano per ogni caso è esattamente il tipo di residuo
    // di cui parla questa scheda.
    try {
      const pid = execFileSync("cat", [vivo], { encoding: "utf8" }).trim();
      if (pid) process.kill(Number(pid), "SIGKILL");
    } catch {
      /* già morto */
    }
    return preso;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("il difetto è riproducibile: un figlio che eredita il descrittore tiene il lucchetto", { skip: !haFlock && "flock assente" }, () => {
  assert.equal(
    lucchettoRestaPreso(true),
    true,
    "se questa riga diventa verde il caso non è più riproducibile e la prova sotto non prova più niente"
  );
});

test("con il descrittore chiuso, il lucchetto si libera alla morte della cadenza", { skip: !haFlock && "flock assente" }, () => {
  assert.equal(
    lucchettoRestaPreso(false),
    false,
    "la cadenza morta deve lasciare il lucchetto libero, anche col motore ancora vivo: altrimenti la macchina si ferma in silenzio"
  );
});

test("il motore parte senza portarsi dietro i lucchetti", () => {
  // La riga vera, letta dal file vero: `8>&-` e `9>&-` prima della `&`. Non sostituisce le due
  // prove sopra — le accompagna, perché dice DOVE sta la cura a chi legge il rosso.
  const src = execFileSync("cat", [LIB], { encoding: "utf8" });
  const riga = src.split("\n").find((r) => r.includes('"${AI_CMD[@]}" "$prompt"'));
  assert.ok(riga, "la riga che lancia il motore non c'è più: questo test va riscritto sul codice nuovo");
  assert.match(riga, /8>&-/, "fd 8 (lucchetto di esecuzione) deve essere chiuso nel figlio");
  assert.match(riga, /9>&-/, "fd 9 (lucchetto di sync git) deve essere chiuso nel figlio");
});

// ── Un lucchetto vecchio non è «occupato»: è bloccato, e va detto ─────────────
//
// La seconda metà del guasto di stanotte: per otto ore la riga uscita era «⏭️ ne sta già girando
// una», cioè una nota informativa. Informativa vuol dire che nessuno la guarda. Un giro dura al
// massimo poco più di un'ora — oltre le due, quel lucchetto non è una cadenza viva.

/**
 * Mette un canale dei segnali FINTO dentro `dir` e torna dove finiranno i segnali.
 *
 * ⚠️ PERCHÉ ESISTE, e costa poco impararlo: fino al 16/8 queste scene puntavano `SCRIPT_DIR` alla
 * cartella `cervello/` VERA. `cadenza_lock` e `cadenza_sync_attendi` da lì prendono il modulo che
 * scrive i segnali — quello vero, con le chiavi di produzione. Risultato: ogni corsa dei test sul
 * server scriveva in Cabina «lucchetto orfano da 300 minuti rimosso da solo» e «lucchetto git
 * occupato oltre 1s», cioè i numeri finti di QUESTO file, accanto ai segnali veri della macchina.
 * Il 16/8 alle 22:20 quei due segnali mi hanno fatto dire a Nicola che la cura era scattata sul
 * campo: non era vero, era il test che si guardava allo specchio. Il lucchetto vero in quel momento
 * aveva 524 minuti, non 300 — la cifra sbagliata era l'unico indizio.
 *
 * Un test che scrive nel canale che il Pannello legge non è un test: è un guasto che si traveste da
 * prova. E il canale finto rende anche l'asserzione più forte, perché il segnale si OSSERVA.
 */
function canaleFinto(dir) {
  const segnali = join(dir, "segnali.txt");
  writeFileSync(
    join(dir, "git-github.mjs"),
    `import { appendFileSync } from "node:fs";
export async function stampSegnale(canale, stato, messaggio) {
  appendFileSync(${JSON.stringify(segnali)}, JSON.stringify({ canale, stato, messaggio }) + "\\n");
}
`
  );
  return segnali;
}

/** Prende il lucchetto e ci scrive dentro una data vecchia, poi prova a prenderlo di nuovo. */
function scenaLucchettoVecchioDi(minuti) {
  const dir = mkdtempSync(join(tmpdir(), "lucchetto-eta-"));
  try {
    const segnali = canaleFinto(dir);
    const scena = join(dir, "scena.sh");
    writeFileSync(
      scena,
      `#!/usr/bin/env bash
REPO="${dir}"; SCRIPT_DIR="${dir}"
mkdir -p "$REPO/.git"
ts() { date '+%Y-%m-%d %H:%M:%S'; }
. "${LIB}"
# un'altra cadenza tiene il lucchetto, e l'ha preso ${minuti} minuti fa
exec 7>"$REPO/.git/MYCITY_RUN_LOCK-giro"
flock -n 7 || exit 9
printf '%s %s\\n' 12345 "$(date -d '${minuti} minutes ago' '+%Y-%m-%d %H:%M:%S')" >&7
cadenza_lock giro; echo "RC=$?"
`,
      { mode: 0o755 }
    );
    const r = spawnSync("bash", [scena], { encoding: "utf8", timeout: 30_000 });
    return {
      out: `${r.stdout || ""}${r.stderr || ""}`,
      segnali: existsSync(segnali) ? readFileSync(segnali, "utf8") : "",
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const verdettoConLucchettoVecchioDi = (m) => scenaLucchettoVecchioDi(m).out;

test("un lucchetto di pochi minuti resta una nota, non un allarme", { skip: !haFlock && "flock assente" }, () => {
  const out = verdettoConLucchettoVecchioDi(5);
  assert.match(out, /ne sta già girando una/, "cinque minuti sono una cadenza viva: non si grida");
  assert.doesNotMatch(out, /BLOCCATA/, "gridare su ogni sovrapposizione insegnerebbe a ignorare il grido");
});

test("un lucchetto di ore è dichiarato orfano, e il blocco esce dalla macchina", { skip: !haFlock && "flock assente" }, () => {
  const out = verdettoConLucchettoVecchioDi(300);
  assert.match(out, /BLOCCATA/, "cinque ore non sono una cadenza viva: è un lucchetto orfano e va detto");
  assert.match(out, /300 minuti/, "e va detto DA QUANTO, altrimenti chi legge non sa se è grave");
});

// ── E POI SI ROMPE: dichiarare il guasto non è ripararlo ──────────────────────
//
// IL CASO VERO, pomeriggio del 16/8/2026. Lucchetto del giro preso alle 13:36 e mai mollato. Da lì
// in poi la macchina ha fatto tutto giusto tranne l'ultima cosa: ogni cinque minuti riconosceva
// l'orfano, lo misurava, lo dichiarava sul canale del Pannello — e usciva senza toccarlo. Sei ore e
// mezza senza un giro, senza una visita, senza una riga di memoria pubblicata, con l'allarme acceso
// per tutto il tempo. I due test qui sopra erano verdi mentre succedeva: provavano che la macchina
// SAPEVA di essere bloccata, non che sapesse ripartire. È la differenza fra un sensore e un freno.
//
// Questi due test provano il comportamento che mancava, e la coppia va letta insieme: si rompe il
// lucchetto vecchio (altrimenti la macchina resta ferma per sempre) e NON si rompe quello vivo
// (altrimenti due cadenze scrivono lo stesso vault, che è il danno da cui nasce tutto il lucchetto).

test("dopo averlo dichiarato orfano, il lucchetto lo rompe e la cadenza riparte", { skip: !haFlock && "flock assente" }, () => {
  const { out, segnali } = scenaLucchettoVecchioDi(300);
  assert.match(
    out,
    /RC=0/,
    "riconoscere l'orfano e poi uscire lascia la macchina ferma: dopo la diagnosi il lucchetto va rotto e la cadenza deve partire"
  );
  assert.match(out, /lucchetto orfano rimosso/, "e la ripartenza va detta, altrimenti sei ore di blocco spariscono dai log");
  // Il segnale deve finire nel canale FINTO. Se questa riga diventa rossa vuol dire che la scena è
  // tornata a puntare al `cervello/` vero, e allora i numeri inventati di questo file (300 minuti)
  // stanno di nuovo comparendo in Cabina come se fossero la macchina — è successo il 16/8.
  assert.match(segnali, /cadenza-giro/, "il segnale va nel canale finto del test, MAI in quello che legge il Pannello");
});

// ── L'ALTRO LUCCHETTO: quello che non gridava nemmeno ────────────────────────
//
// `flock -w 600 9 || exit 0`, la stessa riga in giro.sh, ritmo.sh e monitora.sh. Se il lucchetto git
// è occupato, la cadenza aspetta dieci minuti e poi esce senza dire niente: il turno è andato, la
// memoria non è stata pubblicata, e fuori non arriva una riga. Il lucchetto di esecuzione almeno
// urlava; questo no. Qui si prova che adesso il fatto esce.

function scenaSyncOccupato({ occupato }) {
  const dir = mkdtempSync(join(tmpdir(), "sync-lock-"));
  try {
    const segnali = canaleFinto(dir);
    const scena = join(dir, "scena.sh");
    const tieni = occupato
      ? `( exec 7>"$REPO/.git/mycity-sync.lock"; flock 7; sleep 6 ) & HOLDER=$!\nsleep 1`
      : `HOLDER=""`;
    writeFileSync(
      scena,
      `#!/usr/bin/env bash
REPO="${dir}"; SCRIPT_DIR="${dir}"
mkdir -p "$REPO/.git"
ts() { date '+%Y-%m-%d %H:%M:%S'; }
. "${LIB}"
${tieni}
exec 9>"$REPO/.git/mycity-sync.lock"
cadenza_sync_attendi giro 1; echo "RC=$?"
[ -n "$HOLDER" ] && kill -KILL "$HOLDER" 2>/dev/null
exit 0
`,
      { mode: 0o755 }
    );
    const r = spawnSync("bash", [scena], { encoding: "utf8", timeout: 30_000 });
    return {
      out: `${r.stdout || ""}${r.stderr || ""}`,
      segnali: existsSync(segnali) ? readFileSync(segnali, "utf8") : "",
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("il lucchetto git che non arriva smette di essere un silenzio", { skip: !haFlock && "flock assente" }, () => {
  const { out, segnali } = scenaSyncOccupato({ occupato: true });
  assert.match(out, /RC=1/, "se il lucchetto git non si prende, il turno non pubblica: va detto al chiamante");
  assert.match(
    out,
    /NON viene pubblicata/,
    "dieci minuti persi senza una riga sono indistinguibili da un giro andato bene: il fatto deve uscire dalla macchina"
  );
  assert.match(segnali, /sync-giro/, "e il segnale resta nel canale finto: «occupato oltre 1s» in Cabina è il test, non la macchina");
});

test("col lucchetto git libero la cadenza tira dritto senza rumore", { skip: !haFlock && "flock assente" }, () => {
  const { out } = scenaSyncOccupato({ occupato: false });
  assert.match(out, /RC=0/, "il caso normale deve restare normale");
  assert.doesNotMatch(out, /NON viene pubblicata/, "gridare quando va tutto bene insegna a ignorare il grido");
});

test("un lucchetto ancora vivo NON si rompe", { skip: !haFlock && "flock assente" }, () => {
  const { out } = scenaLucchettoVecchioDi(5);
  assert.match(
    out,
    /RC=1/,
    "cinque minuti sono una cadenza viva: rubarle il lucchetto farebbe scrivere due cadenze sullo stesso vault"
  );
  assert.doesNotMatch(out, /lucchetto orfano rimosso/, "non si rompe quello che non è orfano");
});
