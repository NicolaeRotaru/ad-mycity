#!/usr/bin/env node
// LA MESSA DA PARTE CHE NON TOGLIEVA L'OSTACOLO, E CHE NESSUNO RIPRENDEVA — 7.849 stash.
//
// Il 21/8 il server ha scritto da solo la sua card #149: «7.849 stash mai riprese dall'auto-sync».
// Sotto c'erano due difetti in cinque righe di `aggiorna-cervello.sh`, e insieme tenevano il server
// scollegato da GitHub per giorni:
//
//   ① il rimedio agiva sull'ostacolo sbagliato. Prima del rebase si mettevano da parte le modifiche
//      TRACCIATE, e il commento diceva testualmente «I file NON tracciati non contano: non bloccano
//      il rebase». Il server rispondeva, ogni minuto:
//         error: The following untracked working tree files would be overwritten by checkout
//      Un file non tracciato non blocca finché nessuno lo rivendica; nel momento in cui i commit in
//      arrivo AGGIUNGONO un file con quel nome, git si ferma piuttosto che sovrascrivere roba che
//      non ha mai visto.
//   ② la stash non si riprendeva mai. In tutto il repo non esisteva un solo `git stash pop`: solo
//      due `stash push` e commenti che spacciavano il non-riprenderla per prudenza. Il giro dopo
//      ritrovava l'albero pulito, credeva che il guasto fosse passato, e ricominciava. Una al minuto.
//
// PERCHÉ QUESTA PROVA PILOTA GIT VERO. Il difetto ① non è leggibile nel codice: sta in cosa fa git
// quando un commit in arrivo rivendica un nome che esiste già come file non tracciato. Su quella
// domanda si può solo chiedere a git — perciò qui si costruiscono repo veri in una cartella
// temporanea. Il difetto ② non si vede in un giro solo: si vede CONTANDO le stash dopo tre giri
// falliti di fila, che è esattamente il modo in cui si è manifestato sul server.
//
// 🟢 Sola lettura sul repo dell'AD: tutto avviene in /tmp.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
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

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/** Chiede alla funzione pura, caricandola come la carica il copione vero. */
function chiediAllaFunzione(porcelain, inArrivo) {
  const r = spawnSync(
    "bash",
    ["-c", `. "${join(REPO, "cervello/allineamento-esito.sh")}"; paths_non_tracciati_che_bloccano "$1" "$2"`, "_", porcelain, inArrivo],
    { encoding: "utf8" },
  );
  return { uscita: (r.stdout || "").trim(), rc: r.status };
}

/**
 * La finta del guasto VERO:
 * · origin/main ha un commit che AGGIUNGE `cervello/nuovo-dato.json`
 * · il server è indietro di quel commit, ha un commit suo di memoria da pubblicare,
 *   e ha `cervello/nuovo-dato.json` come file NON TRACCIATO (se lo scrive girando)
 * Il push del server sarà rifiutato (non fast-forward) e il rebase respinto dal file non tracciato:
 * è la situazione fotografata sul server il 21/8 alle 19:31.
 */
function copiaCopioni(dove) {
  mkdirSync(join(dove, "cervello", "vps"), { recursive: true });
  copyFileSync(join(REPO, "cervello/vps/aggiorna-cervello.sh"), join(dove, "cervello/vps/aggiorna-cervello.sh"));
  copyFileSync(join(REPO, "cervello/allineamento-esito.sh"), join(dove, "cervello/allineamento-esito.sh"));
  if (existsSync(join(REPO, "cervello/scritture-a-rischio.mjs"))) {
    copyFileSync(join(REPO, "cervello/scritture-a-rischio.mjs"), join(dove, "cervello/scritture-a-rischio.mjs"));
  }
}

function seminaFinta() {
  const base = mkdtempSync(join(tmpdir(), "stash-mai-riprese-"));
  const origin = join(base, "origin.git");
  const semina = join(base, "semina");
  const server = join(base, "server");

  execFileSync("git", ["init", "-q", "--bare", origin]);
  execFileSync("git", ["init", "-q", semina]);
  git(semina, "config", "user.email", "t@t");
  git(semina, "config", "user.name", "t");
  mkdirSync(join(semina, "cervello", "vps"), { recursive: true });
  mkdirSync(join(semina, "MyCity-Vault", "90-Memoria-AI"), { recursive: true });
  writeFileSync(join(semina, "cervello", "worker.sh"), "vecchio\n");
  writeFileSync(join(semina, "MyCity-Vault", "90-Memoria-AI", "STATO.md"), "base\n");
  // ⚠️ I copioni stanno ANCHE su origin/main, non solo sul server.
  // Senza, `allinea_codice_da_main` propaga la loro CANCELLAZIONE (main non ce li ha) e dal secondo
  // giro il copione non esiste più: usciva 127, «comando non trovato», e la prova sull'accumulo
  // misurava tre giri di cui due mai avvenuti. Verde per il motivo sbagliato.
  copiaCopioni(semina);
  git(semina, "add", "-A");
  git(semina, "commit", "-q", "-m", "base");
  git(semina, "push", "-q", origin, "HEAD:main");

  // main AGGIUNGE il file che sul server esiste già, non tracciato: è la collisione.
  writeFileSync(join(semina, "cervello", "nuovo-dato.json"), '{"da":"main"}\n');
  writeFileSync(join(semina, "cervello", "worker.sh"), "RIPARATO\n");
  git(semina, "add", "-A");
  git(semina, "commit", "-q", "-m", "main aggiunge un file dati");
  git(semina, "push", "-q", origin, "HEAD:main");

  execFileSync("git", ["clone", "-q", "--branch", "main", origin, server]);
  git(server, "config", "user.email", "t@t");
  git(server, "config", "user.name", "t");
  git(server, "reset", "-q", "--hard", "HEAD~1");

  // il commit di memoria che il server vuole pubblicare
  writeFileSync(join(server, "MyCity-Vault", "90-Memoria-AI", "STATO.md"), "memoria scritta dal server\n");
  git(server, "commit", "-qam", "giro AD: aggiorna memoria");

  copiaCopioni(server);
  git(server, "add", "-A");
  // I copioni ora vivono anche su origin/main, quindi qui spesso non c'è niente da committare:
  // `git commit` uscirebbe 1 su «nothing to commit» e farebbe esplodere la semina.
  git(server, "commit", "-q", "--allow-empty", "-m", "copioni");

  // 👉 il file NON TRACCIATO che i commit in arrivo rivendicano — l'ostacolo vero
  writeFileSync(join(server, "cervello", "nuovo-dato.json"), '{"da":"il server, girando"}\n');
  // ...e un file dati tracciato sporco, che è il caso che AR-469 aveva già visto
  writeFileSync(join(server, "cervello", "worker.sh"), "toccato dal server\n");

  const bin = join(base, "bin");
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, "id"), '#!/usr/bin/env bash\n[ "$1" = -un ] && { echo tester; exit 0; }\nexec /usr/bin/id "$@"\n');
  chmodSync(join(bin, "id"), 0o755);

  return { base, origin, server, bin };
}

/**
 * La seconda finta: il giro che FALLISCE COMUNQUE.
 * Server e main hanno scritto tutti e due sullo STESSO file di memoria: il rebase va in conflitto,
 * si annulla, e il push resta rifiutato. È l'altra faccia già vista sul server (19 commit fermi).
 * Serve qui perché la riparazione fa RIUSCIRE la prima finta — e su un giro riuscito non si può
 * misurare se il prestito torna indietro dopo un fallimento. Senza questa, la prova sull'accumulo
 * resterebbe verde col difetto dentro: l'ho scoperto rimettendo il difetto e vedendola passare.
 */
function seminaFintaCheFallisce() {
  const f = seminaFinta();
  // main tocca la memoria che il server ha appena cambiato → conflitto garantito al rebase
  const semina2 = mkdtempSync(join(tmpdir(), "conflitto-"));
  execFileSync("git", ["clone", "-q", "--branch", "main", f.origin, semina2]);
  git(semina2, "config", "user.email", "t@t");
  git(semina2, "config", "user.name", "t");
  writeFileSync(join(semina2, "MyCity-Vault", "90-Memoria-AI", "STATO.md"), "memoria scritta su main\n");
  git(semina2, "commit", "-qam", "main scrive la stessa memoria");
  git(semina2, "push", "-q", f.origin, "HEAD:main");
  rmSync(semina2, { recursive: true, force: true });
  return f;
}

const lancia = (server, origin, bin) =>
  spawnSync("bash", ["cervello/vps/aggiorna-cervello.sh"], {
    cwd: server,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      REPO: server,
      GIT_BRANCH: "main",
      GIT_REMOTE_URL: origin,
      GIT_PUSH_TOKEN: "finto",
      GIT_REPO: "finto/finto",
    },
  });

const quanteStash = (server) => git(server, "stash", "list").split("\n").filter((r) => r.trim()).length;

// ── ① LA PREMESSA, chiesta a git e non dedotta ───────────────────────────────
// Se questa fallisce, tutta la riparazione poggia su un'idea sbagliata: va saputo subito.
prova("un file NON tracciato che i commit in arrivo rivendicano BLOCCA il rebase", () => {
  const { base, server } = seminaFinta();
  try {
    git(server, "fetch", "origin", "main");
    // l'albero ha SOLO il file non tracciato che collide: niente tracciato sporco, così la causa è una sola
    git(server, "checkout", "--", "cervello/worker.sh");
    const r = spawnSync("git", ["rebase", "FETCH_HEAD"], { cwd: server, encoding: "utf8" });
    assert.notEqual(r.status, 0, "il rebase è passato: la premessa della riparazione non regge");
    assert.match(
      `${r.stdout}${r.stderr}`,
      /untracked working tree files would be overwritten/i,
      "il rebase è fallito per un altro motivo: la finta non riproduce il guasto del server",
    );
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

// ── ② LA FUNZIONE PURA nomina l'ostacolo, e SOLO quello ──────────────────────
prova("nomina il non tracciato rivendicato, e lascia stare quello di qualcun altro", () => {
  const porcelain = ["?? cervello/nuovo-dato.json", " M cervello/worker.sh", "?? appunti-di-nicola.txt"].join("\n");
  const inArrivo = ["cervello/nuovo-dato.json", "cervello/worker.sh"].join("\n");
  const { uscita, rc } = chiediAllaFunzione(porcelain, inArrivo);
  assert.equal(uscita, "cervello/nuovo-dato.json", `atteso il solo file rivendicato, arrivato: ${JSON.stringify(uscita)}`);
  assert.equal(rc, 0, "la funzione deve uscire 0 anche senza collisioni: col set -e del copione lo ammazzerebbe");
});

prova("senza collisioni non nomina niente e non fa fallire il chiamante", () => {
  const { uscita, rc } = chiediAllaFunzione("?? appunti-di-nicola.txt", "cervello/altro.mjs");
  assert.equal(uscita, "", "ha nominato un file che i commit in arrivo non rivendicano");
  assert.equal(rc, 0, "uscita diversa da 0 senza collisioni: col set -e ferma l'allineamento");
});

// ── ③ IL CONTO CHE HA PRODOTTO 7.849 ─────────────────────────────────────────
// È la prova che non si può scrivere guardando un giro solo. Tre giri falliti di fila: le stash NON
// devono crescere di giro in giro. Col difetto ne nasceva una a giro e nessuno la riprendeva.
prova("tre allineamenti falliti di fila NON lasciano tre stash dietro", () => {
  const { base, origin, server, bin } = seminaFintaCheFallisce();
  try {
    const conteggi = [];
    for (let giro = 1; giro <= 3; giro++) {
      // ⚠️ LA MACCHINA RISPORCA, ogni minuto: `fonti-salute.json`, `scadenzario.json` e compagnia
      // sono DATI che il server si riscrive girando. È questo che trasforma «una stash dimenticata»
      // in 7.849: senza risporcare, dal secondo giro l'albero è pulito, nessuna stash nasce, e la
      // prova resta verde col difetto dentro (misurato: 1 → 1 → 1 invece di 1 → 2 → 3).
      writeFileSync(join(server, "cervello", "worker.sh"), `il server ha girato, giro ${giro}\n`);
      lancia(server, origin, bin);
      conteggi.push(quanteStash(server));
    }
    assert.deepEqual(
      conteggi.slice(1),
      [conteggi[0], conteggi[0]],
      `le stash crescono a ogni giro: ${conteggi.join(" → ")} — è il conto che ha fatto 7.849`,
    );
    assert.ok(
      conteggi[0] <= 1,
      `un allineamento fallito ha lasciato ${conteggi[0]} stash dietro: il prestito non torna indietro`,
    );
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

// ── ④ L'OSTACOLO VIENE TOLTO DAVVERO, non solo spostato ─────────────────────
// Questa prova è nata da un buco in questa STESSA prova. Rimettendo il difetto ① — la messa da parte
// che ignora i non tracciati — le prove qui sopra restavano tutte verdi: contavano le stash, e col
// difetto ① la stash nasce e torna indietro comunque. Verde col difetto dentro: cioè niente.
//
// Qui si misura la cosa che al server serviva davvero: che il rebase PARTA. Se parte, i commit di
// main entrano nella storia del server e la pubblicazione riprende. Col difetto ① il rebase viene
// respinto dal file non tracciato e quel commit non arriva mai — che è il server fermo per giorni.
prova("dopo l'allineamento i commit di main sono entrati: il rebase è partito davvero", () => {
  const { base, origin, server, bin } = seminaFinta();
  try {
    lancia(server, origin, bin);
    assert.match(
      git(server, "log", "--oneline"),
      /main aggiunge un file dati/,
      "i commit di main NON sono entrati: il rebase è stato respinto dal file non tracciato, come sul server il 21/8",
    );
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

// ── ⑤ IL LAVORO DEL SERVER NON SI PERDE ──────────────────────────────────────
// La riparazione non deve comprare la pulizia col lavoro di qualcuno: dopo i tre giri il commit di
// memoria del server è ancora lì, e il file che si scriveva girando pure.
prova("dopo i giri falliti il commit del server e il suo file dati sono ancora lì", () => {
  const { base, origin, server, bin } = seminaFinta();
  try {
    lancia(server, origin, bin);
    lancia(server, origin, bin);
    assert.match(git(server, "log", "--oneline"), /giro AD: aggiorna memoria/, "il commit del server è sparito");
    const vivo = existsSync(join(server, "cervello", "nuovo-dato.json")) || quanteStash(server) > 0;
    assert.ok(vivo, "il file dati non tracciato è sparito senza finire in nessuna stash: è lavoro perso");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

let falliti = 0;
for (const c of casi) {
  console.log(c.ok ? `  ✓ ${c.nome}` : `  ✗ ${c.nome}\n      ${c.err}`);
  if (!c.ok) falliti++;
}
console.log(`\n${casi.length - falliti}/${casi.length} passate`);
process.exit(falliti ? 1 : 0);
