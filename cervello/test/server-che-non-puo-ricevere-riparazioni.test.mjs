#!/usr/bin/env node
// IL SERVER CHE NON POTEVA PIÙ RICEVERE UNA RIPARAZIONE, E DICEVA DI AVERLA RICEVUTA.
//
// LA STORIA (22/8). Il server era fermo con 29 suoi commit mai pubblicati. La cura era su main.
// L'allineatore (`allinea_codice_da_main` in `cervello/vps/aggiorna-cervello.sh`) esiste apposta per
// questo caso: quando il push fallisce, il CODICE si allinea lo stesso, «altrimenti un server che non
// riesce a pubblicare smette anche di RICEVERE le riparazioni» — parole sue, scritte il 20/8.
//
// Solo che non ci riusciva. Il server sta su `main`, e su `main` c'è il perimetro (AR-332): il codice
// ci arriva da una PR, non da un commit a mano. Il commit dell'allineatore veniva rifiutato. La riga
// che lo fa finisce con `2>/dev/null || true`, quindi il rifiuto spariva, e subito dopo l'allineatore
// stampava «Codice allineato a origin/main». Falso.
//
// Il codice nuovo restava SPORCO nella copia di lavoro. Al giro successivo il prestito se lo portava
// via — è generale apposta, AR-347 — e tornava il copione vecchio. Chiuso il cerchio: la riparazione
// arrivava, non si posava, e nessuno lo diceva.
//
// È il quarto difetto della stessa famiglia in due giorni: *il codice dichiara che qualcuno farà una
// cosa, e quel qualcuno non esiste.* Qui il «qualcuno» era il commit.
//
// LA DEROGA, e perché è sicura. Il perimetro serve a fermare il codice che NESSUNO ha rivisto. Il
// server che si ricopia addosso main non è quel caso: quei byte una PR li ha già visti. Quindi la
// deroga passa **solo se ciò che si sta committando è identico a main**, byte per byte. Se è
// identico, per costruzione non entra niente di nuovo. Se manca il riferimento a main, si blocca.
//
// COSA PROVA QUESTO FILE — sull'hook VERO, dentro repo git usa-e-getta:
//   ① la deroga esiste: codice identico a main passa su main;
//   ② non è un buco: lo stesso file con UNA riga diversa viene fermato;
//   ③ è cieca-chiusa: senza un riferimento a main non indovina, blocca;
//   ④ l'allineatore non dichiara più successo se il commit non è atterrato.
//
// 🟢 Sola lettura sul repo dell'AD: tutto avviene in /tmp.

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

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
 * Due repo veri: un «main remoto» e un server che lo segue.
 * Non una imitazione dell'hook: si copia quello del repo, come fa già perimetro-main.test.mjs.
 */
function bancoDiProva({ conRemoto = true } = {}) {
  const base = mkdtempSync(join(tmpdir(), "mycity-riparazioni-"));
  const remoto = join(base, "remoto.git");
  const server = join(base, "server");

  const gitIn = (d) => (...a) => execFileSync("git", a, { cwd: d, encoding: "utf8", stdio: "pipe" });

  // Il «main» pubblico: contiene la versione NUOVA del copione.
  const sorgente = join(base, "sorgente");
  mkdirSync(sorgente, { recursive: true });
  const gs = gitIn(sorgente);
  gs("init", "-q", "-b", "main");
  gs("config", "user.email", "t@m.local");
  gs("config", "user.name", "t");
  mkdirSync(join(sorgente, "cervello"), { recursive: true });
  mkdirSync(join(sorgente, ".githooks"), { recursive: true });
  writeFileSync(join(sorgente, "cervello/riparazione.sh"), "VERSIONE NUOVA\n");
  // Il cancello e la regola stanno DENTRO main, come nel repo vero: è ciò che permette al caso ⑤ di
  // scaricarli e vederli entrare in vigore nello stesso lancio.
  cpSync(join(REPO, ".githooks/pre-commit"), join(sorgente, ".githooks/pre-commit"));
  cpSync(join(REPO, "cervello/gate-pubblicazione.sh"), join(sorgente, "cervello/gate-pubblicazione.sh"));
  execFileSync("chmod", ["+x", join(sorgente, ".githooks/pre-commit")]);
  gs("add", "-A");
  gs("commit", "-q", "-m", "la riparazione", "--no-verify");
  execFileSync("git", ["clone", "-q", "--bare", sorgente, remoto], { encoding: "utf8" });

  // Il server: stessa storia, ma col copione VECCHIO, e con l'hook vero installato.
  execFileSync("git", ["clone", "-q", remoto, server], { encoding: "utf8" });
  const g = gitIn(server);
  g("config", "user.email", "t@m.local");
  g("config", "user.name", "t");
  mkdirSync(join(server, ".githooks"), { recursive: true });
  mkdirSync(join(server, "MyCity-Vault"), { recursive: true });
  cpSync(join(REPO, ".githooks/pre-commit"), join(server, ".githooks/pre-commit"));
  cpSync(join(REPO, "cervello/gate-pubblicazione.sh"), join(server, "cervello/gate-pubblicazione.sh"));
  execFileSync("chmod", ["+x", join(server, ".githooks/pre-commit")]);
  g("config", "core.hooksPath", ".githooks");
  writeFileSync(join(server, "cervello/riparazione.sh"), "VERSIONE VECCHIA\n");
  writeFileSync(join(server, "MyCity-Vault/STATO.md"), "# stato\n");
  g("add", "-A");
  g("commit", "-q", "-m", "il server, indietro", "--no-verify");

  if (!conRemoto) {
    // Caso ③: nessun riferimento a main da cui copiare. Si tolgono i rami remoti e FETCH_HEAD.
    try { g("remote", "remove", "origin"); } catch { /* già assente */ }
    try { rmSync(join(server, ".git/FETCH_HEAD"), { force: true }); } catch { /* non c'era */ }
  }

  return {
    server,
    g,
    /** Mette in stage il contenuto dato per `cervello/riparazione.sh` e prova a committare su main. */
    provaACommittare(contenuto) {
      writeFileSync(join(server, "cervello/riparazione.sh"), contenuto);
      g("add", "cervello/riparazione.sh");
      try {
        const out = execFileSync("git", ["commit", "-m", "aggiorna-cervello: allinea codice a main"], {
          cwd: server, encoding: "utf8", stdio: "pipe",
        });
        return { rc: 0, out };
      } catch (e) {
        return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
      }
    },
    /** Quello che è DAVVERO finito nella storia: l'unica risposta che conta. */
    committato() {
      return execFileSync("git", ["show", "HEAD:cervello/riparazione.sh"], {
        cwd: server, encoding: "utf8", stdio: "pipe",
      });
    },
    pulisci() { rmSync(base, { recursive: true, force: true }); },
  };
}

const con = (opts, fn) => {
  const b = bancoDiProva(opts);
  try { return fn(b); } finally { b.pulisci(); }
};

// ── ① LA DEROGA ESISTE ───────────────────────────────────────────────────────
prova("il server si riallinea a main: il commit ATTERRA (non basta che non dia errore)", () =>
  con({}, (b) => {
    b.g("fetch", "origin", "main");
    const r = b.provaACommittare("VERSIONE NUOVA\n");
    assert.equal(r.rc, 0, `il commit e' stato rifiutato: ${r.out}`);
    // La domanda vera non e' «ha stampato un errore?» ma «il codice si e' posato?». Era esattamente
    // questa la differenza che il 22/8 nessuno guardava.
    assert.equal(b.committato(), "VERSIONE NUOVA\n", "il commit non ha portato il codice nuovo nella storia");
    assert.equal(
      execFileSync("git", ["status", "--porcelain"], { cwd: b.server, encoding: "utf8" }).trim(),
      "",
      "il file e' rimasto SPORCO: al prossimo giro il prestito se lo porta via e si ricomincia",
    );
  }));

// ── ② NON È UN BUCO ──────────────────────────────────────────────────────────
prova("una sola riga diversa da main e il perimetro FERMA tutto (la deroga non e' un buco)", () =>
  con({}, (b) => {
    b.g("fetch", "origin", "main");
    const r = b.provaACommittare("VERSIONE NUOVA\nriga mia di nascosto\n");
    assert.notEqual(r.rc, 0, "codice NON identico a main e' passato: il perimetro e' bucato");
    assert.match(r.out, /AR-332/, "ha bloccato, ma non con la ragione del perimetro");
    assert.equal(b.committato(), "VERSIONE VECCHIA\n", "qualcosa e' comunque atterrato nella storia");
  }));

// ── ③ CIECA-CHIUSA ───────────────────────────────────────────────────────────
prova("senza un riferimento a main non indovina: blocca (cieco non e' verde)", () =>
  con({ conRemoto: false }, (b) => {
    const r = b.provaACommittare("VERSIONE NUOVA\n");
    assert.notEqual(r.rc, 0, "senza sapere cosa c'e' su main ha lasciato passare del codice");
    assert.match(r.out, /AR-332/);
  }));

// ── ④ L'ALLINEATORE NON MENTE PIÙ ────────────────────────────────────────────
prova("l'allineatore non dichiara «Codice allineato» se il commit non e' atterrato", () => {
  const testo = readFileSync(join(REPO, "cervello/vps/aggiorna-cervello.sh"), "utf8");
  const blocco = testo.slice(testo.indexOf("allinea_codice_da_main() {"));
  const corpo = blocco.slice(0, blocco.indexOf("\n}\n") + 3);
  assert.ok(corpo.includes("commit"), "non trovo piu' il commit dentro l'allineatore: prova da riscrivere");
  // Il difetto era la coppia: il commit muto (`|| true`) e la riga di successo stampata comunque.
  // Si cerca la MECCANICA — che l'esito del commit venga guardato — non una parola in un commento.
  assert.doesNotMatch(
    corpo,
    /commit[^\n]*2>\/dev\/null \|\| true/,
    "il commit butta ancora via il proprio esito: un rifiuto e un successo restano indistinguibili",
  );
  assert.match(
    corpo,
    /if\s+.*commit|_commit_ok|commit[^\n]*;\s*then/s,
    "l'esito del commit non viene guardato da nessuno",
  );
});

// ── ⑤ IL CARDINE DELLA CARTA #153 ────────────────────────────────────────────
// Il server è fermo col copione VECCHIO e il cancello VECCHIO, e non può pullare. La domanda che
// decide se se ne esce: quando l'allineatore scarica il codice da main, il cancello che gira sul
// commit subito dopo è quello appena scaricato, o quello dell'ultimo commit?
// Se è il vecchio, il server resta bloccato per sempre e la carta #153 non può funzionare.
// Chiesto a git, non dedotto.
prova("il cancello appena scaricato vale GIÀ per il commit di quello stesso lancio", () =>
  con({}, (b) => {
    // Il server parte con un cancello che blocca TUTTO, anche la memoria: è il «vecchio».
    const cancello = join(b.server, ".githooks/pre-commit");
    writeFileSync(cancello, "#!/usr/bin/env bash\necho 'CANCELLO VECCHIO: blocco tutto' >&2\nexit 1\n");
    execFileSync("chmod", ["+x", cancello]);
    b.g("add", "-A");
    b.g("commit", "-q", "-m", "il server col cancello vecchio", "--no-verify");
    // Prova che il vecchio è davvero in vigore, altrimenti il resto non dimostra niente.
    writeFileSync(join(b.server, "MyCity-Vault/STATO.md"), "# tocco\n");
    b.g("add", "MyCity-Vault/STATO.md");
    let bloccato = false;
    try { b.g("commit", "-m", "dovrebbe essere fermato"); } catch { bloccato = true; }
    assert.ok(bloccato, "il cancello vecchio non blocca: la prova non sta misurando niente");

    // Ora il passo dell'allineatore: scarica il codice da main — cancello NUOVO compreso — e committa.
    b.g("fetch", "origin", "main");
    b.g("checkout", "FETCH_HEAD", "--", "cervello", ".githooks");
    const r = b.provaACommittare("VERSIONE NUOVA\n");
    assert.equal(r.rc, 0, `il commit non e' passato: gira ancora il cancello vecchio → ${r.out}`);
    assert.equal(b.committato(), "VERSIONE NUOVA\n", "il codice nuovo non si e' posato nella storia");
  }));

let falliti = 0;
for (const c of casi) {
  console.log(c.ok ? `  ✓ ${c.nome}` : `  ✗ ${c.nome}\n      ${c.err}`);
  if (!c.ok) falliti++;
}
console.log(`\n${casi.length - falliti}/${casi.length} passate`);
process.exit(falliti ? 1 : 0);
