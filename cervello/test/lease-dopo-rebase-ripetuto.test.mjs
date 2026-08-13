#!/usr/bin/env node
// AR-451 — IL LEASE CHE SCAMBIAVA LA PROPRIA PUBBLICAZIONE PER IL LAVORO DI QUALCUN ALTRO.
//
// Successo 3 volte nella notte del 30/7, stesso schema ogni volta (branch fix/memoria-stato-okr-
// piani-v2, poi fix/memoria-briefing-sala-operativa, poi fix/memoria-briefing-e-menu-analisi-intel):
//
//   1. `git-pr.mjs` pubblica un ramo con un commit: il remoto ora ha X.
//   2. Nella stessa sessione si aggiunge un secondo commit sopra X, e nel frattempo `main` è andato
//      avanti (il worker scrive lì ogni pochi minuti).
//   3. `git-pr.mjs` riparte: ribasa il ramo sul nuovo `main`. Il rebase riscrive l'hash di OGNI
//      commit che sposta — X diventa X', a contenuto identico — perché l'hash di un commit include
//      il suo genitore, e il genitore è cambiato.
//   4. Il push con `--force-with-lease` (di default, senza SHA esplicito) confronta col ref remoto
//      che git ha in locale: se non risulta aggiornato, git rifiuta con "stale info".
//   5. Il ripiego chiedeva al remoto il suo SHA vero (X) e controllava se fosse ANTENATO dell'HEAD
//      locale DOPO il rebase (X'). Non lo è: X' discende dal nuovo `main`, non da X. Il controllo
//      concludeva «qualcuno ci ha lavorato» e si fermava — falso: eravamo stati noi, la corsa prima.
//
// LA PROVA GUIDA GIT VERO (stessa filosofia di rebase-che-non-parte.test.mjs): due repo veri in una
// cartella temporanea, un bare che fa da "origin" e uno che fa da copia di lavoro, perché la domanda
// — "X è antenato di X'?" — la sa rispondere solo git, non si deduce guardando il codice.
//
// 🟢 Sola lettura sul repo dell'AD: tutto avviene in /tmp.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { rebasaSuRiferimento, remotoEDavveroVecchio, esitoLeaseRifiutato } from "../git-pr.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

function zitto(fn) {
  const vero = console.log;
  console.log = () => {};
  try {
    return fn();
  } finally {
    console.log = vero;
  }
}

const temporanee = [];
function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function scrivi(cwd, percorso, testo) {
  const abs = join(cwd, percorso);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, testo, "utf8");
}

/**
 * Origin (bare) + copia di lavoro, con un ramo già "pubblicato" (spinto sul bare) — la geometria
 * esatta del secondo giro di `git-pr.mjs` su un branch che ha già una PR aperta.
 */
function scenaPubblicazioneRipetuta() {
  const origin = mkdtempSync(join(tmpdir(), "ad-lease-origin-"));
  const lavoro = mkdtempSync(join(tmpdir(), "ad-lease-lavoro-"));
  temporanee.push(origin, lavoro);
  git(["init", "-q", "--bare", "-b", "main"], origin);

  git(["init", "-q", "-b", "main"], lavoro);
  git(["config", "user.email", "prova@mycity.local"], lavoro);
  git(["config", "user.name", "Prova"], lavoro);
  git(["remote", "add", "origin", origin], lavoro);
  scrivi(lavoro, "pannello/App.tsx", "export const x = 1\n");
  git(["add", "-A"], lavoro);
  git(["commit", "-qm", "base"], lavoro);
  git(["push", "-q", "origin", "main"], lavoro);

  // Il ramo di lavoro, con UN commit, pubblicato — questo è X.
  git(["checkout", "-qb", "fix/prova"], lavoro);
  scrivi(lavoro, "pannello/Nuovo.tsx", "export const y = 1\n");
  git(["add", "-A"], lavoro);
  git(["commit", "-qm", "primo pezzo"], lavoro);
  const X = git(["rev-parse", "fix/prova"], lavoro);
  git(["push", "-q", "origin", "fix/prova:fix/prova"], lavoro);

  // `main` avanza nel frattempo (il worker), IGNARO del ramo — la stessa cosa che succede sul VPS.
  git(["checkout", "-q", "main"], lavoro);
  scrivi(lavoro, "MyCity-Vault/90-Memoria-AI/STATO.md", "scrittura del worker\n");
  git(["add", "-A"], lavoro);
  git(["commit", "-qm", "worker: scrive la memoria"], lavoro);
  git(["push", "-q", "origin", "main"], lavoro);

  // Torniamo sul ramo e aggiungiamo un secondo commit — il "continuo a lavorarci" della sessione.
  git(["checkout", "-q", "fix/prova"], lavoro);
  scrivi(lavoro, "pannello/Nuovo.tsx", "export const y = 2\n");
  git(["add", "-A"], lavoro);
  git(["commit", "-qm", "secondo pezzo"], lavoro);

  return { origin, lavoro, X };
}

prova("il rebase di un ramo già pubblicato riscrive l'hash del primo commit (il cuore del bug)", () => {
  const { lavoro, X } = scenaPubblicazioneRipetuta();
  const cfg = { cwd: lavoro };
  const info = zitto(() => rebasaSuRiferimento(cfg, "main", "fix/prova", "main"));
  assert.notEqual(info.preRebaseSha, X, "prima del rebase l'HEAD era già avanti di un commit su X");
  const dopo = git(["rev-parse", "fix/prova"], lavoro);
  assert.notEqual(dopo, info.preRebaseSha, "il rebase deve aver cambiato l'hash");
  // X non è più antenato della storia ribasata: è esattamente la premessa del bug.
  let eraAntenatoDopo = true;
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", X, "fix/prova"], { cwd: lavoro, stdio: "ignore" });
  } catch {
    eraAntenatoDopo = false;
  }
  assert.equal(eraAntenatoDopo, false, "dopo il rebase X non è più antenato — è la causa del falso allarme");
});

prova("guardando solo l'HEAD di adesso, il remoto sembra estraneo (il vecchio comportamento, sbagliato)", () => {
  const { lavoro, X } = scenaPubblicazioneRipetuta();
  const cfg = { cwd: lavoro };
  zitto(() => rebasaSuRiferimento(cfg, "main", "fix/prova", "main"));
  const shaLocaleDopo = git(["rev-parse", "fix/prova"], lavoro);
  assert.equal(remotoEDavveroVecchio(cfg, X, [shaLocaleDopo]), false, "con solo l'HEAD post-rebase, X risulta estraneo: falso allarme");
});

prova("aggiungendo l'HEAD di PRIMA del rebase tra i candidati, il remoto si riconosce come nostro", () => {
  const { lavoro, X } = scenaPubblicazioneRipetuta();
  const cfg = { cwd: lavoro };
  const info = zitto(() => rebasaSuRiferimento(cfg, "main", "fix/prova", "main"));
  const shaLocaleDopo = git(["rev-parse", "fix/prova"], lavoro);
  assert.equal(
    remotoEDavveroVecchio(cfg, X, [shaLocaleDopo, info.preRebaseSha]),
    true,
    "X è antenato di preRebaseSha: è la nostra pubblicazione precedente, non lavoro altrui"
  );
});

prova("un remoto che porta DAVVERO lavoro estraneo resta rifiutato con entrambi i candidati", () => {
  const { origin, lavoro } = scenaPubblicazioneRipetuta();
  const cfg = { cwd: lavoro };
  const info = zitto(() => rebasaSuRiferimento(cfg, "main", "fix/prova", "main"));
  const shaLocaleDopo = git(["rev-parse", "fix/prova"], lavoro);

  // Un'ALTRA sessione pubblica un commit vero, mai visto da questa copia di lavoro.
  const altra = mkdtempSync(join(tmpdir(), "ad-lease-altra-"));
  temporanee.push(altra);
  git(["clone", "-q", origin, altra], process.cwd());
  git(["config", "user.email", "altra@mycity.local"], altra);
  git(["config", "user.name", "Altra sessione"], altra);
  git(["checkout", "-q", "fix/prova"], altra);
  scrivi(altra, "pannello/Nuovo.tsx", "export const y = 999 // lavoro di un'altra sessione\n");
  git(["add", "-A"], altra);
  git(["commit", "-qm", "lavoro estraneo"], altra);
  git(["push", "-q", "origin", "fix/prova"], altra);
  const shaEstraneo = git(["rev-parse", "fix/prova"], altra);

  assert.equal(
    remotoEDavveroVecchio(cfg, shaEstraneo, [shaLocaleDopo, info.preRebaseSha]),
    false,
    "un commit mai visto da questa sessione non deve MAI passare per «solo vecchio in locale»"
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// AR-461 — IL PUNTO CHE CHIAMA, non solo la funzione.
//
// Tutto ciò che sta sopra esercita `remotoEDavveroVecchio` con i candidati passati A MANO. Bene, ma
// non basta: il fix di AR-451 è il CABLAGGIO — che il punto malato le passi anche `preRebaseSha`.
// Misurato con non-vacuita.mjs: togliendo `rebaseInfo.preRebaseSha` da quella riga, i quattro casi
// qui sopra restavano tutti VERDI. Cioè il bug che è costato quattro PR ricreate nella notte del
// 30/7 poteva tornare e nessun rosso l'avrebbe detto.
//
// Questi due casi chiamano `esitoLeaseRifiutato` — la funzione DENTRO cui vive quella riga, la
// stessa che `main()` chiama quando il lease viene rifiutato — e non le passano nessun candidato:
// se li deve trovare da sé, ed è esattamente ciò che il fix fa. `url` è il bare locale, quindi
// `ls-remote` e `fetch` sono veri: niente rete, niente token, niente finti.
// ─────────────────────────────────────────────────────────────────────────────

prova("IL CABLAGGIO: dopo un secondo rebase il ramo si riconosce come nostro e si ripubblica", () => {
  const { origin, lavoro, X } = scenaPubblicazioneRipetuta();
  const cfg = { cwd: lavoro };
  const info = zitto(() => rebasaSuRiferimento(cfg, "main", "fix/prova", "main"));

  const esito = zitto(() => esitoLeaseRifiutato(cfg, origin, "fix/prova", info));
  assert.equal(esito.shaRemoto, X, "il remoto letto deve essere la nostra pubblicazione precedente");
  assert.equal(
    esito.remotoAntenato,
    true,
    "il punto che chiama deve passare ANCHE preRebaseSha: senza, il ramo ribasato di nuovo sembra lavoro altrui e la PR viene ricreata"
  );
});

prova("IL CABLAGGIO: e con lavoro DAVVERO estraneo sul remoto, lo stesso punto si ferma", () => {
  // La metà che impedisce di «riparare» il caso qui sopra rispondendo sempre `true`: la difesa vale
  // solo se sa ancora dire di no. Un fix che passa il primo caso e perde questo ha sostituito una PR
  // ricreata con il lavoro di un'altra sessione sovrascritto — un danno peggiore di quello curato.
  const { origin, lavoro } = scenaPubblicazioneRipetuta();
  const cfg = { cwd: lavoro };
  const info = zitto(() => rebasaSuRiferimento(cfg, "main", "fix/prova", "main"));

  const altra = mkdtempSync(join(tmpdir(), "ad-lease-estranea-"));
  temporanee.push(altra);
  git(["clone", "-q", origin, altra], process.cwd());
  git(["config", "user.email", "altra@mycity.local"], altra);
  git(["config", "user.name", "Altra sessione"], altra);
  git(["checkout", "-q", "fix/prova"], altra);
  scrivi(altra, "pannello/Nuovo.tsx", "export const y = 999 // lavoro di un'altra sessione\n");
  git(["add", "-A"], altra);
  git(["commit", "-qm", "lavoro estraneo"], altra);
  git(["push", "-q", "origin", "fix/prova"], altra);

  const esito = zitto(() => esitoLeaseRifiutato(cfg, origin, "fix/prova", info));
  assert.equal(esito.remotoAntenato, false, "un commit mai visto da questa sessione non deve mai risultare «solo vecchio in locale»");
});

prova("IL CABLAGGIO: un ramo mai pubblicato non ha remoto, e non si inventa un antenato", () => {
  const { origin, lavoro } = scenaPubblicazioneRipetuta();
  const cfg = { cwd: lavoro };
  const info = zitto(() => rebasaSuRiferimento(cfg, "main", "fix/prova", "main"));
  const esito = zitto(() => esitoLeaseRifiutato(cfg, origin, "fix/mai-pubblicato", info));
  assert.equal(esito.shaRemoto, null, "quel ramo su origin non c'è");
  assert.equal(esito.remotoAntenato, false, "senza remoto non c'è niente di cui essere antenato");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
for (const dir of temporanee) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {}
}
process.exit(falliti ? 1 : 0);
