#!/usr/bin/env node
// Le decisioni di `cervello/istante-cancello.mjs`, ESEGUITE — più lo script vero dell'aggancio dei
// cancelli del commit (AR-644), eseguito in cloni di prova.
//
// La malattia di questa corsia è «il cancello montato nel punto sbagliato del tempo»: un controllo
// che gira quando non serve più stampa verde come uno che ha guardato. Contro una malattia così una
// prova a pattern è inutile per costruzione — trova il controllo esattamente come lo trovava prima,
// perché il controllo c'era anche prima. Quindi qui si esegue.
//
//   AR-395 → `esitoPerimetro`: lo stage vuoto mentre c'è lavoro non è «perimetro pulito», è CIECO.
//   AR-394 → `esitoOnesta` + `parteViva`: il quarto posto del verdetto viene misurato davvero, e
//            l'ambito si restringe alla parte viva della memoria (la storia non si riscrive).
//   AR-644 → `esitoAggancioCancelli` + `cervello/installa-hooks.sh`: un aggancio si dichiara riuscito
//            solo se git risponde che è riuscito, non perché il comando non ha sollevato un errore.

import { execFileSync } from "node:child_process";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

import { esitoAggancioCancelli, esitoOnesta, esitoPerimetro, fuoriPerimetro, parteViva } from "../istante-cancello.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// ─── AR-395 · il perimetro cieco ─────────────────────────────────────────────

prova("AR-395 · IL CASO CHE HA ROTTO: stage vuoto MENTRE c'è lavoro = cieco, non verde", () => {
  // È lo stato esatto in cui `giro.sh` chiamava il cancello: il `git commit` aveva appena svuotato
  // lo stage. Il controllo rispondeva «nessun file di codice, si passa» — vero, e completamente
  // privo di significato.
  const r = esitoPerimetro({ staged: "", lavoroInAttesa: true });
  assert.equal(r.verdetto, "cieco");
  assert.equal(r.puoiPubblicare, false);
  assert.match(r.motivo, /non ha guardato niente/i);
});

prova("AR-395: stage vuoto e nessun lavoro atteso → legittimo, si passa", () => {
  // La difesa non deve diventare un blocco: «non c'è niente da pubblicare» è una risposta vera.
  const r = esitoPerimetro({ staged: "", lavoroInAttesa: false });
  assert.equal(r.verdetto, "ok");
  assert.equal(r.puoiPubblicare, true);
});

prova("AR-395: memoria nello stage → si passa, e il cancello ha davvero misurato", () => {
  const r = esitoPerimetro({ staged: "MyCity-Vault/90-Memoria-AI/STATO.md\nconsegne/x.md", lavoroInAttesa: true });
  assert.equal(r.verdetto, "ok");
});

prova("AR-395/AR-310: il codice nello stage vince su tutto il resto", () => {
  const r = esitoPerimetro({ staged: "MyCity-Vault/STATO.md\ncervello/giro.sh", lavoroInAttesa: true });
  assert.equal(r.verdetto, "codice");
  assert.deepEqual(r.intrusi, ["cervello/giro.sh"]);
});

prova("AR-395: un nome che COMINCIA come una cartella di memoria non è memoria", () => {
  // `consegne-vecchie/` non è `consegne/`. Un prefisso non è un perimetro.
  assert.deepEqual(fuoriPerimetro("consegne-vecchie/x.md\nconsegne/ok.md"), ["consegne-vecchie/x.md"]);
});

// ─── AR-394 · il quarto guardiano ────────────────────────────────────────────

prova("AR-394 · IL CASO CHE HA ROTTO: il posto nel verdetto è MISURATO, non più uno zero muto", () => {
  // Prima `rc_one` nasceva 0 e non veniva toccato mai più. Per il verdetto uno zero mai scritto e un
  // guardiano passato sono identici — quattro controlli promessi, tre fatti.
  const rosso = esitoOnesta({ rc: 1, modo: "blocca" });
  assert.equal(rosso.misurato, true);
  assert.equal(rosso.rcVerdetto, 1, "in modo blocca l'rc vero deve arrivare al verdetto");
  assert.equal(rosso.blocca, true);
});

prova("AR-394: in modo AVVISA non blocca, ma il valore è misurato e la frase lo dice", () => {
  const r = esitoOnesta({ rc: 1, modo: "avvisa" });
  assert.equal(r.misurato, true);
  assert.equal(r.rc, 1, "l'rc vero non si perde");
  assert.equal(r.rcVerdetto, 0, "la scelta di non bloccare è dichiarata, non implicita");
  assert.equal(r.blocca, false);
  assert.match(r.frase, /GATE_ONESTA=blocca/, "chi legge deve sapere come alzarlo");
});

prova("AR-394/AR-322: onestà CIECA (rc=2) in modo blocca non è un verde", () => {
  const r = esitoOnesta({ rc: 2, modo: "blocca" });
  assert.equal(r.rcVerdetto, 2);
  assert.equal(r.blocca, true);
});

prova("AR-394: l'ambito è la parte VIVA — il diario append-only non si giudica", () => {
  // Il diario di STATO.md sono righe di citazione che per contratto non si riscrivono mai. È lì che
  // `onesta-check` trova i falsi positivi noti: uno snippet di bash letto come segnaposto, una data
  // letta come numero senza fonte. Giudicare la storia significa chiedere di riscriverla per poter
  // pubblicare il presente — ed è la ragione per cui il controllo era stato staccato del tutto.
  const testo = ["---", "tipo: stato", "---", "> 13/8 — nota vecchia con [ -f x ] e 24 · 13", "", "# STATO", "Ordini: 1"].join("\n");
  const viva = parteViva(testo);
  assert.ok(!viva.includes("nota vecchia"), "il diario deve sparire dall'ambito");
  assert.ok(viva.includes("Ordini: 1"), "la parte viva deve restare");
  assert.ok(viva.includes("tipo: stato"), "il frontmatter è vivo: si riscrive a ogni giro");
});

prova("AR-394: la parte viva di STATO.md vero non contiene più il diario", () => {
  // Sul file reale, non su un testo inventato: è il file che il cancello giudicherà davvero.
  const stato = readFileSync(join(CERVELLO, "..", "MyCity-Vault/90-Memoria-AI/STATO.md"), "utf8");
  const viva = parteViva(stato);
  assert.ok(viva.length > 0, "non deve restare vuota");
  assert.ok(viva.length < stato.length, "qualcosa di storico deve essere stato tolto");
  assert.ok(!/^\s*>/m.test(viva), "nessuna riga di diario può sopravvivere");
});

// ─── AR-644 · l'aggancio dei cancelli del commit ─────────────────────────────

prova("AR-644: rc 0 non basta — se core.hooksPath non è impostato, NON è agganciato", () => {
  const r = esitoAggancioCancelli({ rc: 0, hooksPath: "", atteso: ".githooks" });
  assert.equal(r.agganciato, false);
  assert.match(r.motivo, /senza cancelli/);
});

prova("AR-644: core.hooksPath che punta altrove non è un aggancio", () => {
  const r = esitoAggancioCancelli({ rc: 0, hooksPath: ".git/hooks", atteso: ".githooks" });
  assert.equal(r.agganciato, false);
});

prova("AR-644: pre-commit presente ma NON eseguibile → git lo salta in silenzio", () => {
  const r = esitoAggancioCancelli({ rc: 0, hooksPath: ".githooks", atteso: ".githooks", preCommitEseguibile: false });
  assert.equal(r.agganciato, false);
  assert.match(r.motivo, /eseguibile/);
});

prova("AR-644: tutto a posto → agganciato", () => {
  const r = esitoAggancioCancelli({ rc: 0, hooksPath: ".githooks", atteso: ".githooks", preCommitEseguibile: true });
  assert.equal(r.agganciato, true);
});

/** Un clone di prova con lo script vero dell'aggancio e i suoi due compagni. */
function cloneDiProva({ conPreCommit = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "aggancio-"));
  execFileSync("git", ["init", "-q", "-b", "main", dir], { stdio: "pipe" });
  mkdirSync(join(dir, "cervello"), { recursive: true });
  cpSync(join(CERVELLO, "installa-hooks.sh"), join(dir, "cervello/installa-hooks.sh"));
  cpSync(join(CERVELLO, "istante-cancello.mjs"), join(dir, "cervello/istante-cancello.mjs"));
  if (conPreCommit) {
    mkdirSync(join(dir, ".githooks"), { recursive: true });
    writeFileSync(join(dir, ".githooks/pre-commit"), "#!/usr/bin/env bash\nexit 0\n");
    chmodSync(join(dir, ".githooks/pre-commit"), 0o644); // lo script deve renderlo eseguibile da sé
  }
  return dir;
}

function agganci(dir) {
  try {
    const out = execFileSync("bash", ["cervello/installa-hooks.sh"], { cwd: dir, encoding: "utf8", stdio: "pipe" });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status ?? 1, out: String(e.stdout || "") + String(e.stderr || "") };
  }
}

prova("AR-644: aggancio riuscito → rc 0, e git conferma davvero core.hooksPath", () => {
  const dir = cloneDiProva();
  try {
    const r = agganci(dir);
    assert.equal(r.rc, 0, r.out);
    assert.match(r.out, /VERIFICATI/);
    const letto = execFileSync("git", ["-C", dir, "config", "--get", "core.hooksPath"], { encoding: "utf8" }).trim();
    assert.equal(letto, ".githooks", "l'effetto dev'essere vero, non solo dichiarato");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("AR-644 · IL CASO CHE HA ROTTO: senza il pre-commit la sessione partiva scoperta e MUTA", () => {
  // Un clone in cui `.githooks/` non è arrivata. Prima lo script diceva «✅ git hooks attivi» perché
  // il `git config` era riuscito, e chi lo chiamava buttava via anche quello con `>/dev/null || true`:
  // da fuori, una sessione protetta e una sessione senza cancelli erano identiche.
  const dir = cloneDiProva({ conPreCommit: false });
  try {
    const r = agganci(dir);
    assert.notEqual(r.rc, 0, "un aggancio non riuscito non può uscire 0");
    assert.match(r.out, /NON agganciati/);
    assert.match(r.out, /scan dei segreti/, "deve dire cosa si perde, non solo che è fallito");
    assert.ok(!/✅/.test(r.out), "non deve dichiararsi riuscito");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ─── esito ───────────────────────────────────────────────────────────────────
const rossi = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rossi.length}/${casi.length} verdi`);
process.exit(rossi.length ? 1 : 0);
