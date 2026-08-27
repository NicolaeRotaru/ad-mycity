#!/usr/bin/env node
// 🧪 UN FRENO CON PIÙ COPIE NON È UN FRENO — AR-743, dentro il metro che giudica tutte le altre prove.
//
// LA DECISIONE: «questa prova a file+pattern è soddisfatta?». È quella che chiude i difetti, che
// accredita il volano e che il guardiano usa per giudicare. Aveva QUATTRO implementazioni: la casa
// (`provaSoddisfatta` in cervello/prove-regole.mjs) più tre copie a mano, e le tre non ereditavano
// niente di ciò che la casa aveva imparato.
//
// Le due cure che restavano fuori, e cosa costano:
//
//   · AR-151 — il testo letterale. Un pattern scritto come testo, con un dollaro in mezzo, compilato
//     come regex non può mai combaciare: quel simbolo asserisce fine-stringa. Il fix nel codice c'è,
//     e la prova lo dichiara assente. Un difetto riparato che risulta aperto per sempre.
//
//   · AR-355 — il commento. Due difetti del worker risultavano CHIUSI perché la prova citava una
//     frase che nel file esisteva davvero: dentro un commento scritto da chi aveva fatto il fix.
//     C'era la descrizione della cura, non la cura. È il verde comprato, ed è il danno peggiore dei
//     due — il primo lascia aperto qualcosa di sano, il secondo chiude qualcosa di rotto.
//
// I tre chiamanti che ne restavano fuori decidono cose che Nicola legge: quali chiusure sono
// regredite, quali prove il motore sa eseguire, e come si allinea il cantiere allo scan.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

/** Esegue un rilevatore di `prove-difetti.mjs` puntato su una radice scelta. */
function eseguiProva(flag, radice) {
  const r = spawnSync("node", [join(REPO, "cervello/prove-difetti.mjs"), flag], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
    env: { ...process.env, PROVE_DIFETTI_RADICE: radice },
  });
  return { codice: r.status, detto: `${r.stdout || ""}${r.stderr || ""}`.trim() };
}
const leggi = (p) => readFileSync(join(REPO, p), "utf8");

const { provaSoddisfatta, patternTrovato } = await import(join(REPO, "cervello/prove-regole.mjs"));

// I tre che avevano la copia. Se ne nasce un quarto, il caso ⑤ qui sotto lo trova.
const CHIAMANTI = [
  "cervello/allinea-scan-cantiere.mjs",
  "cervello/cantiere-prove.mjs",
  "cervello/chiusure-audit.mjs",
];

// ── ① Le due cure che le copie non avevano ───────────────────────────────────────────────────────

test("AR-743 · il caso AR-151: un pattern che come regex non può combaciare, e nel codice c'è", () => {
  // Il pattern vero della scheda: il dollaro in mezzo asserisce fine-stringa, quindi la regex nuda
  // non trova niente. Il confronto letterale onora l'intento («nel file ci dev'essere questo»).
  const pattern = "id=eq.$id&stato=eq.in_attesa";
  const codice = 'const url = `${BASE}/ordini?id=eq.$id&stato=eq.in_attesa`;';

  assert.equal(new RegExp(pattern).test(codice), false, "la regex nuda NON trova: è il difetto");
  assert.equal(provaSoddisfatta({ pattern }, codice), true, "la casa lo trova col letterale");
});

test("AR-743 · il caso AR-355: la stessa frase in un commento NON chiude il difetto", () => {
  const pattern = "verificaFirma\\(";

  const soloCommento = ["// adesso verificaFirma( protegge il webhook", "export function paga() {}"].join("\n");
  assert.equal(provaSoddisfatta({ pattern }, soloCommento), false, "c'è la descrizione della cura, non la cura");

  const davvero = ["export function paga(req) {", "  verificaFirma(req);", "}"].join("\n");
  assert.equal(provaSoddisfatta({ pattern }, davvero), true, "e quando la cura c'è, la prova passa");
});

test("AR-743 · `presente: false` continua a valere: la casa non ha perso il verso", () => {
  const pattern = "checkout --theirs";
  assert.equal(provaSoddisfatta({ pattern, presente: false }, "git merge --no-edit"), true, "assente = soddisfatta");
  assert.equal(provaSoddisfatta({ pattern, presente: false }, "git checkout --theirs x"), false);
  // …e il default resta «presente», o ogni scheda senza il campo cambierebbe verdetto in silenzio.
  assert.equal(provaSoddisfatta({ pattern }, "git checkout --theirs x"), true);
});

// ── ② I tre chiamanti CHIEDONO alla casa invece di rifare il confronto ───────────────────────────

test("AR-743 · i tre chiamanti importano la casa, e non hanno più la loro copia", () => {
  for (const f of CHIAMANTI) {
    const s = leggi(f);
    assert.match(s, /import \{ provaSoddisfatta \} from "\.\/prove-regole\.mjs";/, `${f} deve CHIEDERE`);
    assert.doesNotMatch(s, /new RegExp\(v\.pattern\)/, `${f} non deve avere la sua copia`);
  }
});

test("AR-743 · e le loro funzioni la USANO davvero: un import mai chiamato non è una difesa", () => {
  for (const f of CHIAMANTI) {
    const s = leggi(f);
    const usi = (s.match(/provaSoddisfatta/g) || []).length;
    assert.ok(usi >= 2, `${f}: «provaSoddisfatta» compare ${usi} volta/e — una sola è solo l'import`);
  }
});

// ── ③ La rete larga: nessun QUARTO padrone può nascere di nascosto ───────────────────────────────

test("AR-743 · nessun file del cervello rifà il confronto a mano su una verifica di scheda", () => {
  // Cercato sul DATO e non sui tre nomi noti: se domani nasce un quarto chiamante, cade qui.
  const dir = join(REPO, "cervello");
  const colpevoli = [];
  for (const nome of readdirSync(dir)) {
    if (!nome.endsWith(".mjs")) continue;
    const s = readFileSync(join(dir, nome), "utf8");
    // Le righe che compilano il pattern di una VERIFICA (v.pattern / verifica.pattern) a mano.
    const righe = s.split("\n").filter((r) => /new RegExp\(\s*(v|verifica)\.pattern/.test(r) && !/^\s*(\/\/|\*)/.test(r));
    if (righe.length) colpevoli.push(`${nome}: ${righe[0].trim()}`);
  }
  assert.deepEqual(colpevoli, [], "una copia nuova della decisione: va fatta chiedere alla casa");
});

// ── ④ La casa resta l'unica a decidere, e la decisione è una sola funzione ───────────────────────

test("AR-743 · `provaSoddisfatta` passa da `patternTrovato`: una catena sola, non due strade", () => {
  // Se un giorno le due divergessero, tornerebbero due metri con lo stesso nome.
  const pattern = "// solo in un commento";
  const testo = "// solo in un commento\nconst x = 1;";
  assert.equal(patternTrovato(pattern, testo), provaSoddisfatta({ pattern }, testo),
    "la funzione di alto livello deve poggiare su quella di basso, non rifarla");
});

// ── ⑤ Il RILEVATORE che risponde «questo difetto è ancora vivo?» deve dire la verità ─────────────
//
// `prove-difetti.mjs --ar-743` è lo strumento che il cantiere interroga per sapere se il difetto c'è
// ancora. Dentro ha la sua decisione: un file «rifà a mano» il confronto e non «importa» la casa.
//
// Prima del lotto 46 questa difesa era agganciata al caso di AR-743 dentro `prove-a-due-versi`, che
// pretendeva il difetto PRESENTE — la forma giusta finché era aperto. Curandolo, quel verso è
// diventato falso per costruzione e il caso è stato ritirato: la mutazione del rilevatore è rimasta
// senza nessuno che la potesse prendere. Adesso è agganciata qui, dove il verso è quello nuovo.

test("AR-743 · lo strumento che risponde «è ancora vivo?» dice CURATO, e lo dice eseguendo", async () => {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, [join(REPO, "cervello/prove-difetti.mjs"), "--ar-743"], { encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;

  assert.match(out, /AR-743/, "lo strumento deve pronunciarsi su questo difetto");
  assert.match(out, /✅/, `il rilevatore dice ancora che il difetto c'è: ${out.trim().slice(0, 200)}`);
  assert.doesNotMatch(out, /❌ AR-743/, "se torna ❌, o il difetto è tornato o il rilevatore si è rotto");
});

// ── ⑤ Il RILEVATORE, non solo la regola (27/8, AR-840) ──────────────────────────────────────────
//
// I casi qui sopra rifanno il controllo per conto loro, sul repo vero. È coperto il DATO e non è
// coperto il RILEVATORE: la mutazione che neutralizza `--ar-743` dentro `prove-difetti.mjs` — cioè
// quello che gira nella macchina — li lasciava tutti verdi. Qui gli si dà un mondo finto e si
// guarda se vede quello che deve vedere, nei due versi.

function radiceFinta({ conCopia }) {
  const dir = mkdtempSync(join(tmpdir(), "copie-"));
  mkdirSync(join(dir, "cervello"), { recursive: true });
  writeFileSync(join(dir, "cervello/prove-regole.mjs"), "export function patternTrovato() { return true; }\n");
  const corpo = conCopia
    // rifà il confronto a mano e NON importa la casa: è il difetto
    ? 'const ok = v.presente === true && new RegExp(v.pattern).test(testo);\n'
    // chiede alla casa: è la cura
    : 'import { patternTrovato } from "./prove-regole.mjs";\nconst ok = patternTrovato(v.pattern, testo);\n';
  writeFileSync(join(dir, "cervello/sorvegliante.mjs"), corpo);
  return dir;
}

test("AR-743 · il rilevatore VEDE una copia della decisione, e non accusa chi chiede alla casa", () => {
  const conCopia = radiceFinta({ conCopia: true });
  const r1 = eseguiProva("--ar-743", conCopia);
  assert.equal(r1.codice, 1, `il rilevatore non ha visto una copia piantata apposta: ${r1.detto.slice(0, 300)}`);
  rmSync(conCopia, { recursive: true, force: true });

  // Il verso opposto, o sarebbe un rilevatore inchiodato sul rosso: chi importa la casa passa.
  const pulita = radiceFinta({ conCopia: false });
  const r2 = eseguiProva("--ar-743", pulita);
  assert.equal(r2.codice, 0, `il rilevatore accusa chi chiede alla casa: ${r2.detto.slice(0, 300)}`);
  rmSync(pulita, { recursive: true, force: true });
});
