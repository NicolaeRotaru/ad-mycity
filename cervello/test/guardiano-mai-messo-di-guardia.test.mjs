// 🧭 AR-376 / AR-393 — UNO STRUMENTO COSTRUITO E MAI MESSO DI GUARDIA È UN BUCO, NON UNO STATO.
//
// La malattia della corsia A, in una riga: **il verdetto esiste e non frena.** Due strumenti la
// mostravano nella forma più pura — `permessi-check.mjs`, che esce 1 con quattro violazioni vere, e
// `non-vacuita.mjs`, il controllo nato apposta per smascherare le prove verdi-perché-cieche. In
// tutto il repo il secondo compariva solo dentro un messaggio rivolto a chi legge («rompi il fix e
// pretendi il rosso: node cervello/non-vacuita.mjs»). Un cartello, non un freno.
//
// Perché nessuno se n'era accorto: la bacheca dei guardiani elenca chi `giro.sh` esegue, quindi un
// guardiano mai cablato è invisibile per costruzione. Qui si misura lo scarto fra chi ESISTE
// (derivato dal codice) e chi è ESEGUITO (derivato dagli invocatori veri).
//
// Questa prova è anche il cablaggio del guardiano di questa corsia: `guardia-viva-check.mjs` non
// poteva nascere nella condizione che cura.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { eGuardiano, fantasmi, guardiaDi, invocazioniIn, invocazioniNegliHook, verdettiMorti } from "../guardia-viva.mjs";
import { elenca } from "../guardia-viva-check.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CHECK = join(REPO, "cervello/guardia-viva-check.mjs");

test("sul repo VERO ogni guardiano è eseguito da qualcuno, o dice perché no", () => {
  const r = spawnSync("node", [CHECK, "--json"], { cwd: REPO, encoding: "utf8", timeout: 120_000 });
  assert.notEqual(r.status, null, "il guardiano non è nemmeno partito");
  assert.notEqual(r.status, 2, `guardiano CIECO (exit 2): non ha potuto misurare — ${r.stderr.trim()}`);
  const j = JSON.parse(r.stdout);
  assert.deepEqual(
    j.senza_guardia.map((b) => `${b.strumento} — ${b.perche}`),
    [],
    "c'è uno strumento che emette un verdetto e non lo esegue nessuno: cablalo, o dichiara il perché in cervello/guardiani-motivi.json",
  );
  assert.equal(j.tetto.sforato, false, `il debito «da-cablare» si è allargato: ${j.tetto.quanti} contro un tetto di ${j.tetto.tetto}`);
  assert.deepEqual(j.voci_fantasma, [], "il registro dei motivi tiene in vita voci di strumenti che non esistono più, o scuse già scadute");
  assert.equal(r.status, 0, "il guardiano della guardia deve uscire 0 quando non ha trovato buchi");
});

test("una chiamata da un copione del VPS conta: node \"$REPO/cervello/x.mjs\"", () => {
  // 22/8 — il rilevatore non riconosceva questa forma e ha accusato «costruito e mai messo di
  // guardia» uno strumento agganciato per davvero. Da un copione del server `REPO` è la RADICE del
  // repo, quindi in mezzo c'è `cervello/`: la forma naturale lassù era proprio quella che mancava.
  // È lo stesso errore del `:-default` raccontato accanto alla regex, ripetuto un anno dopo.
  const trovati = [...invocazioniIn('node "$REPO/cervello/conflitti-memoria.mjs" --applica --repo "$REPO"')];
  assert.ok(
    trovati.includes("conflitti-memoria.mjs"),
    `un metro che accusa chi il cablaggio ce l'ha si spegne da solo: trovati ${JSON.stringify(trovati)}`,
  );
  // e la forma senza `cervello/` in mezzo deve continuare a funzionare
  assert.ok([...invocazioniIn('node "$SCRIPT_DIR/salute.mjs"')].includes("salute.mjs"));
});

test("i due strumenti del difetto sono adesso di guardia davvero", () => {
  const r = spawnSync("node", [CHECK, "--json"], { cwd: REPO, encoding: "utf8", timeout: 120_000 });
  const j = JSON.parse(r.stdout);
  // `dove` elenca CHI li invoca, misurato sul codice: se qualcuno stacca il cablaggio, sparisce.
  for (const strumento of ["permessi-check.mjs", "non-vacuita.mjs"]) {
    const posti = j.dove[strumento] || [];
    assert.ok(posti.length > 0, `${strumento} è tornato orfano: non lo invoca più nessuno`);
  }
  // ⟲ AGGIORNATO IL 4/9 (AR-938): il cancello non lancia piu' il banco DIRETTAMENTE, lo lancia in
  // quattro corsie parallele. La catena e' diventata di due anelli, e vanno pretesi tutti e due —
  // altrimenti si puo' staccare quello in mezzo e nessuno se ne accorge. Il senso di AR-393 non
  // cambia di una virgola: la prova che le prove provino dev'essere ESEGUITA dal cancello, non
  // nominata in un messaggio. Cambia solo la strada per arrivarci.
  assert.ok(
    (j.dove["non-vacuita.mjs"] || []).includes("cervello/banco-a-corsie.mjs"),
    "AR-393, primo anello: il banco delle mutazioni dev'essere ESEGUITO dalle corsie",
  );
  assert.match(
    readFileSync(join(REPO, "cervello/cancello-lotto.mjs"), "utf8"),
    /esegui\(\s*"[^"]*",\s*"node",\s*\[\s*"cervello\/banco-a-corsie\.mjs"/,
    "AR-393, secondo anello: le corsie devono essere un PASSO del cancello, col loro codice d'uscita dentro il verdetto",
  );
  assert.ok(
    (j.dove["permessi-check.mjs"] || []).includes("cervello/test/permessi-di-guardia.test.mjs"),
    "AR-376: il verdetto dei permessi sul file vero deve essere una prova della suite",
  );
});

test("un cartello non conta come cablaggio", () => {
  // È la distinzione su cui regge tutto: negli script di casa un'invocazione vera passa da una
  // variabile di percorso o dall'helper `guardiano`; i messaggi scrivono il percorso per esteso.
  const invocazioni = invocazioniIn('  motivo: `rompi il fix — node cervello/non-vacuita.mjs`,');
  assert.equal(invocazioni.size, 0, "un nome dentro un messaggio non è un'esecuzione");
  assert.ok(invocazioniIn('node "$SCRIPT_DIR/porte-check.mjs" --json').has("porte-check.mjs"));
  assert.ok(invocazioniIn('  guardiano "stampo-check.mjs" || true').has("stampo-check.mjs"));
  assert.ok(invocazioniIn('# node "$SCRIPT_DIR/spento.mjs"').size === 0, "un'invocazione commentata non gira");
});

test("una libreria pura non viene accusata di essere un guardiano orfano", () => {
  // Senza questa distinzione `fonte-numero.mjs` e `censimento-guardiani.mjs` — che sono funzioni
  // pure importate da chi decide — finirebbero nell'elenco dei buchi, e un elenco che accusa chi
  // non c'entra si impara a ignorare come uno che tace.
  const pura = readFileSync(join(REPO, "cervello/fonte-numero.mjs"), "utf8");
  assert.equal(eGuardiano(pura), false, "una libreria senza shebang non è un guardiano da riga di comando");
  const vero = readFileSync(join(REPO, "cervello/porte-check.mjs"), "utf8");
  assert.equal(eGuardiano(vero), true, "un guardiano con shebang, contratto d'uscita e process.exit va riconosciuto");
});

test("un guardiano che nessuno esegue e nessuno dichiara è un BUCO", () => {
  // Il controllo positivo, e serve: le altre prove asseriscono che l'elenco dei buchi sia VUOTO,
  // quindi resterebbero verdi anche con un rilevatore che non trova mai niente. Qui si pretende il
  // contrario — che davanti a un orfano il verdetto sia «no».
  const orfano = guardiaDi("mai-cablato.mjs", {}, new Set(), new Map());
  assert.equal(orfano.ok, false, "un guardiano orfano e non dichiarato deve risultare un buco");
  assert.match(orfano.perche, /mai messo di guardia/);
  const eseguito = guardiaDi("mai-cablato.mjs", {}, new Set(["mai-cablato.mjs"]), new Map());
  assert.equal(eseguito.ok, true, "chi è eseguito da un processo vero non deve dichiarare niente");
});

test("dichiarare «cablato» senza che quel file lo invochi non salva nessuno", () => {
  const invocati = new Set();
  const dove = new Map([["x.mjs", ["cervello/giro.sh"]]]);
  const bugia = guardiaDi("x.mjs", { "x.mjs": { motivo: "cablato", dove: "cervello/ritmo.sh" } }, invocati, dove);
  assert.equal(bugia.ok, false, "una dichiarazione che nomina il posto sbagliato deve fallire");
  const vera = guardiaDi("x.mjs", { "x.mjs": { motivo: "cablato", dove: "cervello/giro.sh" } }, invocati, dove);
  assert.equal(vera.ok, true);
  const etichetta = guardiaDi("y.mjs", { "y.mjs": { motivo: "decisione", perche: "boh" } }, invocati, dove);
  assert.equal(etichetta.ok, false, "un motivo senza un perché scritto è un'etichetta, non una decisione");
});

test("AR-394 — il verdetto morto del cancello di pubblicazione è misurato, non dedotto", () => {
  const gate = join(REPO, "cervello/gate-pubblicazione.sh");
  assert.ok(existsSync(gate), "manca il cancello di pubblicazione: non posso misurare");
  const morti = verdettiMorti(readFileSync(gate, "utf8"));
  // ⟲ AGGIORNATO DAL LOTTO 40. Fin qui si pretendeva che il rilevatore VEDESSE `rc_one`, con la
  // motivazione scritta accanto: «toglierlo richiede di modificare quel file .sh», che era fuori
  // dal territorio di chi scrisse la prova. Quel file è stato modificato: AR-394 è riparato, la
  // variabile dell'onestà adesso viene riempita davvero, e i quattro guardiani promessi dal cancello
  // di pubblicazione sono quattro eseguiti invece di tre.
  //
  // Quindi l'asserzione si gira e diventa più stretta: quel file non deve avere NESSUN verdetto
  // morto. La domanda «il rilevatore sa ancora vedere?» non è stata persa — è il caso finto qui
  // sotto a rispondere, e lo fa meglio, perché non dipende dal fatto che un difetto vero resti
  // aperto in produzione per tenere in vita il suo metro.
  assert.deepEqual(
    morti.map((m) => m.variabile),
    [],
    "un verdetto morto NUOVO nel cancello di pubblicazione: una variabile passata a gate_verdetto e mai riempita è un guardiano promesso e non eseguito",
  );
  const finto = [
    "gate_verdetto() {",
    '  local a="${1:-0}" b="${2:-0}"',
    "}",
    "  local rc_uno=0 rc_due=0",
    '  node "$dir/x.mjs" || rc_uno=$?',
    '  if ! gate_verdetto "$rc_uno" "$rc_due"; then',
    "    return 1",
    "  fi",
  ].join("\n");
  const trovati = verdettiMorti(finto);
  assert.deepEqual(
    trovati.map((m) => m.variabile),
    ["rc_due"],
    "morta è la variabile che il verdetto legge e nessuno riempie con una misura; quella assegnata da un'esecuzione è viva",
  );
});

// ── AR-526 — «in attesa di aggancio»: il terzo stato per gli hook ─────────────
//
// Un hook non lo mette di guardia un processo del repo: lo mette una riga in `.claude/settings.json`,
// file che la macchina non può scrivere apposta. Fra «l'ho costruito» e «Nicola l'ha incollato»
// passa del tempo vero, e in quel tempo chiamarlo buco è dare rosso al comportamento giusto.
// Quello che rende questo stato una cosa diversa da un'esenzione è UNA data, e queste prove
// difendono la data.

const inAttesa = (extra = {}) => ({
  "nuovo-hook.mjs": { motivo: "in-attesa-di-aggancio", scade: "2026-08-11", perche: "va agganciato a PreToolUse a mano, il file dei freni è nel deny-list", ...extra },
});

test("un hook dichiarato in attesa, con data futura e perché scritto, è a posto", () => {
  const g = guardiaDi("nuovo-hook.mjs", inAttesa(), new Set(), new Map(), "2026-08-04");
  assert.equal(g.ok, true);
  assert.equal(g.debito, false, "non conta contro il tetto dei da-cablare: quel tetto governa i buchi SENZA data");
  assert.equal(g.attesa, true, "ma resta visibile come attesa: non sparisce nel verde");
});

test("LA REGOLA CHE CONTA: passata la data torna un buco — un'attesa senza fine è un'esenzione", () => {
  const g = guardiaDi("nuovo-hook.mjs", inAttesa(), new Set(), new Map(), "2026-08-12");
  assert.equal(g.ok, false);
  assert.match(g.perche, /2026-08-11/, "chi legge deve sapere entro quando doveva essere agganciato");
});

test("senza data non è un'attesa: è un'esenzione scritta male, e vale come se non ci fosse", () => {
  const senzaData = { "nuovo-hook.mjs": { motivo: "in-attesa-di-aggancio", perche: "prima o poi lo aggancio, quando mi ricordo" } };
  const g = guardiaDi("nuovo-hook.mjs", senzaData, new Set(), new Map(), "2026-08-04");
  assert.equal(g.ok, false);
  assert.match(g.perche, /senza una data/);
});

test("un'etichetta non basta: senza il perché scritto resta un buco", () => {
  const g = guardiaDi("nuovo-hook.mjs", inAttesa({ perche: "hook" }), new Set(), new Map(), "2026-08-04");
  assert.equal(g.ok, false);
});

test("se poi qualcuno lo esegue davvero, l'attesa non serve più: misurato batte dichiarato", () => {
  const g = guardiaDi("nuovo-hook.mjs", inAttesa(), new Set(["nuovo-hook.mjs"]), new Map(), "2026-08-12");
  assert.equal(g.ok, true, "anche con la data scaduta: essere di guardia si MISURA, non si dichiara");
  assert.equal(g.motivo, "cablato");
});

// ── AR-529 — un comando dentro `hooks` È un'esecuzione ───────────────────────
//
// Il 4/8 Nicola ha agganciato quattro freni nuovi in .claude/settings.json e questo guardiano ha
// continuato a chiamarli «costruiti e mai messi di guardia»: accusava di essere orfani quattro
// guardiani che giravano a ogni singola mossa. Le regole di RE_INVOCAZIONE rifiutano di proposito
// il semplice «node cervello/x.mjs» scritto in un testo (menzione ≠ chiamata, e va tenuto); un
// comando dentro `hooks` però non è un testo, è la posizione da cui vengono lanciati.

test("LA REGOLA CHE CONTA: un comando negli hook mette di guardia il suo guardiano", () => {
  const trovati = invocazioniNegliHook([
    { evento: "PreToolUse", comando: "node cervello/pre-scrittura.mjs --hook" },
    { evento: "SessionEnd", comando: "node cervello/memoria-guardia.mjs --chiudi --hook" },
  ]);
  assert.deepEqual([...trovati].sort(), ["memoria-guardia.mjs", "pre-scrittura.mjs"]);
});

test("il nome torna col .mjs, come tutte le altre forme", () => {
  // Senza il suffisso combaciava con niente e il rosso restava identico: il difetto sarebbe stato
  // invisibile. L'ha trovato la prova sul repo vero, non la rilettura.
  assert.ok([...invocazioniNegliHook([{ comando: "node cervello/x.mjs" }])][0].endsWith(".mjs"));
});

test("due comandi nella stessa riga contano entrambi: il SessionStart ne concatena due", () => {
  const t = invocazioniNegliHook([{ comando: "bash cervello/installa-hooks.sh >/dev/null 2>&1; node cervello/contesto-lezioni.mjs --hook" }]);
  assert.deepEqual([...t], ["contesto-lezioni.mjs"], "lo .sh non è un guardiano .mjs: non entra");
});

test("nessun hook, nessuna invocazione inventata", () => {
  assert.equal(invocazioniNegliHook([]).size, 0);
  assert.equal(invocazioniNegliHook([{ comando: "echo ciao" }]).size, 0);
  assert.equal(invocazioniNegliHook([{}]).size, 0);
});

// ── L-2026-0815-002 — la copia di lavoro di un agente non è il repo ──────────
//
// Un worktree è un ALTRO albero dello stesso repo, appeso sotto `.claude/worktrees/`. Chi scandisce
// «tutto il repo» per sapere chi esegue davvero un guardiano ci trova dentro gli stessi file una
// seconda volta, e li conta come esecutori: un guardiano risulta di guardia perché la sua copia lo
// nomina. È il difetto che questo file cura, tornato dalla porta di servizio.
//
// LA LEZIONE DAVA LA RIGA PER SCRITTA, E NON C'ERA. `L-2026-0815-002` (15/8) dichiara come proprio
// fix «la riga worktrees nell'elenco delle cartelle escluse». Andandola a cercare per registrarne la
// mutazione, in `guardia-viva-check.mjs` non esisteva — né qui né su main. La prova sotto ESEGUE
// `elenca()` su un albero finto, così non dipende dal fatto che una copia di lavoro esista oggi sul
// disco: quel test verde era verde perché la cartella era vuota, non perché la difesa ci fosse.
test("una copia di lavoro sotto .claude/worktrees non viene scandita come repo", () => {
  const base = mkdtempSync(join(tmpdir(), "guardia-viva-"));
  try {
    mkdirSync(join(base, "cervello"), { recursive: true });
    writeFileSync(join(base, "cervello", "giro.sh"), "node cervello/permessi-check.mjs\n");
    // La copia di lavoro, con dentro lo stesso file: se venisse scandita, comparirebbe due volte.
    mkdirSync(join(base, ".claude", "worktrees", "agente-x", "cervello"), { recursive: true });
    writeFileSync(join(base, ".claude", "worktrees", "agente-x", "cervello", "giro.sh"), "node cervello/permessi-check.mjs\n");

    const trovati = elenca(base).map((p) => p.replace(base, ""));
    assert.equal(trovati.length, 1, `l'albero vero ha un file solo, trovati: ${JSON.stringify(trovati)}`);
    assert.ok(
      !trovati.some((p) => p.includes("worktrees")),
      "la copia di lavoro di un agente non è il repo: contarla dichiara di guardia un guardiano che nessuno esegue",
    );
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test("AR-937: una scusa rimasta addosso a un guardiano che ORA e' agganciato e' una voce fantasma", () => {
  // IL CASO CHE HA ROTTO, 4/9. Fondendo main dentro questo ramo, `cervello/guardiani-motivi.json`
  // e' tornato a contenere la scusa «due-case.mjs e puntatori-scollegati.mjs non li esegue nessuno»
  // — scusa che questo ramo aveva TOLTO, perche' AR-797 e AR-798 li hanno agganciati al cancello per
  // davvero. Il codice li lanciava e il registro diceva il contrario: due verita' opposte sullo
  // stesso fatto, e tre prove diventate rosse sul runner.
  //
  // La causa non e' git: e' che unire due registri PER CHIAVE esprime le aggiunte e non esprime le
  // RIMOZIONI. Una cancellazione e' un fatto, e l'unione la perde in silenzio. Questa e' la prova
  // che quel fatto ha un guardiano: chi e' invocato davvero NON puo' tenersi anche la scusa.
  const registro = { "x.mjs": { motivo: "decisione", perche: "nessuno lo esegue, e va bene cosi" } };

  // ① finche' nessuno lo invoca, la scusa e' legittima: nessun fantasma.
  assert.deepEqual(fantasmi(["x.mjs"], registro, new Set()), [], "una scusa su uno strumento davvero non invocato non e' un fantasma");

  // ② appena qualcuno lo invoca DAVVERO, la scusa diventa una bugia e va nominata.
  assert.deepEqual(fantasmi(["x.mjs"], registro, new Set(["x.mjs"])), ["x.mjs"], "chi e' agganciato non puo' tenersi anche la scusa di non esserlo");

  // ③ e una scusa su uno strumento che non esiste piu' resta un fantasma, come sempre.
  assert.deepEqual(fantasmi([], registro, new Set()), ["x.mjs"], "una scusa su uno strumento sparito e' un fantasma");
});
