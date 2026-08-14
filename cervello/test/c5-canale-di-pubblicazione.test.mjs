#!/usr/bin/env node
// Corsia 5 del lotto 41 — lo strumento che pubblica il lavoro.
//
//   · AR-327 — `git()` gira con `execFileSync` senza `maxBuffer`, quindi eredita il limite di 1 MB
//     di Node sullo stdout: un rebase o un diff più grosso di così muore con ENOBUFS. Lo strumento
//     si rompe PROPRIO quando il lavoro è importante, e sui giri piccoli non si vede mai.
//   · AR-328 — `gitAuthUrl` costruiva sempre l'URL col token, senza nessun ripiego su `origin`: da
//     una sessione cloud (dove il token non c'è e il clone è già autenticato) la macchina non poteva
//     consegnare il proprio risultato.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CERVELLO = join(REPO, "cervello");

const { MAX_BUFFER_GIT, gitLetto, remoteOrigin, scegliCanalePush, urlSenzaSegreti } = await import(join(CERVELLO, "git-github.mjs"));

// Un oggetto git di questo repo che supera il megabyte: è il caso che rompeva lo strumento.
const OGGETTO_GROSSO = "HEAD:MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";

// ── AR-327 ──────────────────────────────────────────────────────────────────

test("AR-327: il lettore di git regge un'uscita oltre il megabyte (prima moriva con ENOBUFS)", () => {
  // La riproduzione del difetto, eseguita: lo stesso comando con le opzioni VECCHIE muore.
  let morto = null;
  try {
    execFileSync("git", ["show", OGGETTO_GROSSO], { cwd: REPO, encoding: "utf8" });
  } catch (e) {
    morto = e;
  }
  assert.ok(morto, "senza tetto esplicito Node deve fallire su un'uscita oltre 1 MB: se non fallisce, questa prova non sta misurando niente");
  assert.match(String(morto.message || ""), /ENOBUFS|maxBuffer/i);

  // E con il lettore del cervello, invece, si legge tutto.
  const testo = gitLetto(["show", OGGETTO_GROSSO], REPO);
  assert.ok(testo && testo.length > 1_000_000, `letti ${testo ? testo.length : 0} byte: lo strumento deve reggere il lavoro grosso`);
  assert.ok(MAX_BUFFER_GIT >= 64 * 1024 * 1024, "il tetto è dichiarato una volta sola e vale per chi legge git da qui");
});

test("AR-327: un comando git che fallisce torna null, non un valore inventato", () => {
  assert.equal(gitLetto(["rev-parse", "ramo-che-non-esiste-mai"], REPO), null);
});

// ── AR-328 ──────────────────────────────────────────────────────────────────

test("AR-328: senza token si pubblica da origin, invece di non pubblicare affatto", () => {
  const cloud = scegliCanalePush({ token: "", origin: "https://github.com/NicolaeRotaru/ad-mycity", slug: "NicolaeRotaru/ad-mycity" });
  assert.equal(cloud.canale, "origin");
  assert.equal(cloud.url, "origin", "si passa a git il nome del remote, che porta con sé la propria autenticazione");
  assert.ok(cloud.provati.includes("token (assente)"), "il verdetto deve dire quali canali ha provato");

  const vps = scegliCanalePush({ token: "ghp_segreto", origin: "https://github.com/NicolaeRotaru/ad-mycity", slug: "NicolaeRotaru/ad-mycity" });
  assert.equal(vps.canale, "token", "dove il token c'è resta lui il canale: sul VPS origin è un URL nudo, senza credenziali");
  assert.match(vps.url, /x-access-token:ghp_segreto@github\.com\/NicolaeRotaru\/ad-mycity\.git/);

  const nessuno = scegliCanalePush({ token: "", origin: "", slug: "x/y" });
  assert.equal(nessuno.canale, null);
  assert.equal(nessuno.url, null, "senza nessun canale non si inventa un URL che fallirà più avanti");
  assert.match(nessuno.motivo, /token/);
  assert.match(nessuno.motivo, /origin/);
});

test("AR-328: il messaggio d'errore non stampa mai il token", () => {
  assert.equal(urlSenzaSegreti("https://x-access-token:ghp_segreto@github.com/x/y.git"), "https://***@github.com/x/y.git");
});

test("AR-328 (comando vero): senza token la configurazione del repo NON esplode più", () => {
  // Il caso della scheda, riprodotto: ambiente cloud, nessun token, remote origin presente.
  const script = `
    const g = await import(${JSON.stringify(join(CERVELLO, "git-github.mjs"))});
    const cfg = g.resolveRepoConfig("ad-mycity");
    console.log(JSON.stringify({ canale: g.gitAuthUrl({ ...cfg, token: "" }), origin: !!cfg.origin }));
  `;
  const senzaToken = { ...process.env };
  for (const k of ["GIT_PUSH_TOKEN", "GIT_TOKEN", "GITHUB_TOKEN"]) delete senzaToken[k];
  const out = execFileSync("node", ["--input-type=module", "-e", script], { cwd: REPO, encoding: "utf8", env: senzaToken, timeout: 60000 });
  const j = JSON.parse(out.trim().split("\n").pop());
  assert.equal(j.origin, true, "il remote origin va letto e portato nella configurazione");
  assert.equal(j.canale, "origin", "e senza token il canale di pubblicazione diventa origin, non un errore");
});

test("AR-328: il remote origin di questo repo si legge davvero (non è una prova su dati finti)", () => {
  const o = remoteOrigin(REPO);
  assert.ok(o && /github\.com/.test(o), `origin letto: ${urlSenzaSegreti(String(o))}`);
});
