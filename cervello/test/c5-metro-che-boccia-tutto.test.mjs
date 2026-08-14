#!/usr/bin/env node
// Corsia 5 del lotto 41 — i due modi opposti di non misurare: bocciare tutto e esentare a mano.
//
//   · AR-433 — il controllo di onestà boccia ogni report tecnico (i riferimenti a codice vengono
//     letti come numeri senza fonte), quindi chi scrive impara a scavalcarlo. Un cancello che suona
//     su tutto è un cancello spento, con l'aggravante che sembra acceso.
//   · AR-420 — il margine è una delle tre stelle polari, non lo misura nessuno, ed era tolto A MANO
//     dall'elenco dei numeri senza fonte (`k !== "margine"`): l'esenzione trasformava un buco in un
//     verde. La cura onesta non è inventare il numero, è dichiarare la stella cieca.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CERVELLO = join(REPO, "cervello");

const { mascheraRiferimenti, tipoDocumento, regolePer, RE_RIFERIMENTO_CODICE } = await import(join(CERVELLO, "onesta-check.mjs"));

function esegui(args, env = {}) {
  try {
    const out = execFileSync("node", args, { cwd: REPO, encoding: "utf8", env: { ...process.env, ...env }, timeout: 60000, stdio: ["ignore", "pipe", "pipe"] });
    return { out, code: 0 };
  } catch (e) {
    return { out: String(e.stdout || "") + String(e.stderr || ""), code: e.status ?? 1 };
  }
}

// ── AR-433 ──────────────────────────────────────────────────────────────────

test("AR-433: un riferimento a codice è LA fonte, non un numero orfano", () => {
  assert.ok(RE_RIFERIMENTO_CODICE, "il riconoscitore dei riferimenti deve esistere");
  const testo = "Il freno in cervello/giro.sh:664 non scatta, vedi AR-365 e la lezione L-2026-0730-01; la soglia è `2000000`.";
  const mascherato = mascheraRiferimenti(testo);
  assert.ok(!/664/.test(mascherato), "il numero di riga sparisce dal conto dei numeri");
  assert.ok(!/365/.test(mascherato), "la sigla di difetto sparisce dal conto dei numeri");
  assert.ok(!/2000000/.test(mascherato), "un numero dentro gli apici è codice, non un claim");
  assert.equal(mascherato.length, testo.length, "la maschera non sposta gli indici: il contesto degli altri numeri resta quello vero");
});

test("AR-433 (comando vero): un report tecnico passa, un claim di business senza fonte no", () => {
  const tecnico = esegui([
    join(CERVELLO, "onesta-check.mjs"),
    "--testo",
    "Il freno in cervello/giro.sh:664 fallisce, vedi AR-365 e L-2026-0730-01. La soglia è `2000000`.",
  ]);
  assert.equal(tecnico.code, 0, `un testo fatto di riferimenti non può essere bocciato: ${tecnico.out.slice(0, 300)}`);

  const claim = esegui([join(CERVELLO, "onesta-check.mjs"), "--testo", "Su MyCity ci sono 500 famiglie iscritte."]);
  assert.equal(claim.code, 1, "e il cancello deve restare capace di dire di NO su un numero di business orfano");
  assert.match(claim.out, /numero-senza-fonte/);
});

test("AR-433: il verdetto cambia per TIPO di documento (un audit non è un volantino)", () => {
  assert.equal(tipoDocumento("consegne/audit/2026-07-01-radiografia.md"), "audit");
  assert.equal(tipoDocumento("MyCity-Vault/90-Memoria-AI/RADIOGRAFIA-MACCHINA.md"), "audit");
  assert.equal(tipoDocumento("consegne/content/post-instagram.md"), "contenuto");
  assert.equal(regolePer("audit").numeri, false, "su un audit la regola dei numeri di business non si applica");
  assert.equal(regolePer("contenuto").numeri, true, "su un contenuto sì: è il testo che può uscire verso l'esterno");
  // Le regole dei claim restano accese su entrambi: quelle non si toccano.
  assert.equal(regolePer("audit").segnaposto, true);
  assert.equal(regolePer("audit").claim, true);
});

test("AR-433 (comando vero): una radiografia vera non annega più nei falsi positivi", () => {
  const file = "consegne/audit/2026-07-01-radiografia.md";
  const r = esegui([join(CERVELLO, "onesta-check.mjs"), file, "--json"]);
  const j = JSON.parse(r.out);
  const risultato = j.risultati[0];
  assert.equal(risultato.tipo, "audit");
  assert.equal(
    risultato.violazioni.filter((v) => v.tipo === "numero-senza-fonte").length,
    0,
    "su un audit i numeri sono riferimenti: bocciarli è il rumore che ha insegnato a scavalcare il cancello"
  );
  // Ma se lo stesso testo fosse un contenuto in uscita, la regola tornerebbe a valere.
  const comeContenuto = esegui([join(CERVELLO, "onesta-check.mjs"), "--stdin", "--contenuto", "--json"]);
  assert.ok(comeContenuto.out.length > 0, "il comando resta usabile da stdin");
});

// ── AR-420 ──────────────────────────────────────────────────────────────────

test("AR-420 (comando vero): il margine non è più esentato — è dichiarato CIECO e conta come orfano", () => {
  const r = esegui([join(CERVELLO, "north-star-check.mjs"), "--json"]);
  const j = JSON.parse(r.out);

  assert.ok(Array.isArray(j.stelle_cieche), "il guardiano deve dichiarare QUALI fari non misura nessuno");
  assert.ok(j.stelle_cieche.includes("margine"), "il margine è una delle tre stelle polari e non ha ancora una fonte");
  assert.ok(
    j.numeri_senza_fonte.includes("margine"),
    "l'esenzione a mano (k !== «margine») è tolta: un faro senza fonte è un numero orfano come gli altri"
  );
  assert.equal(j.north_star.margine.cieco, true);
  assert.ok(String(j.north_star.margine.serve).length > 20, "e deve dire COSA serve per chiudere il buco, non solo che c'è");
  assert.equal(r.code, 1, "con una stella non misurata il report non può uscire verde");
});

test("AR-420: il buco è DICHIARATO, non riempito con un numero inventato", () => {
  const r = esegui([join(CERVELLO, "north-star-check.mjs"), "--json"]);
  const j = JSON.parse(r.out);
  assert.equal(j.north_star.margine.valore, null, "nessun numero inventato: sarebbe peggio del buco");
  assert.equal(j.north_star.margine.fonte, null);

  // E la riga si vede anche a schermo, non solo nel JSON: un buco che non compare non lo chiude nessuno.
  const testo = esegui([join(CERVELLO, "north-star-check.mjs")]);
  assert.match(testo.out, /NON MISURATE/);
  assert.match(testo.out, /margine/);
});
