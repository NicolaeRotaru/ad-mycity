#!/usr/bin/env node
// 🚧 AR-394 — «Il cancello comune promette quattro controlli e ne fa tre: il quarto è un parametro
// morto.»
//
// IL FATTO. `gate_verdetto` (cervello/gate-pubblicazione.sh) ha quattro posti: segreti, fatti,
// onestà, sanità. Il terzo riceveva una variabile nata a zero e mai più toccata, perché il controllo
// d'onestà non veniva eseguito affatto. Per il verdetto uno zero mai scritto e un guardiano passato
// sono identici — e la firma della funzione continuava a rassicurare chi legge molto dopo che la
// sostanza era sparita. Quando un controllo dà fastidio lo si degrada a informativo lasciandone in
// piedi la FORMA: il nome nella lista, il parametro, il commento.
//
// IL FIX HA QUATTRO CLAUSOLE, non due: ① eseguirlo davvero ② farne entrare l'esito in `rc_one`
// ③ restringere l'AMBITO alla parte viva ④ trasformare i falsi positivi noti in ESENZIONI
// DICHIARATE COL MOTIVO. Le prime tre erano già cablate; la quarta mancava — e senza la quarta il
// metro non poteva essere acceso, perché sulla parte VIVA di STATO.md segnalava 35 «numeri senza
// fonte» di cui 33 erano pezzi di data o di orario. Un cancello che boccia sempre viene spento: è
// «un metro che non può fallire» dall'altro lato.
//
// COSA PROVA QUESTO FILE, eseguendo il cancello VERO e — dalla prova ⑤ in giù — il METRO VERO
// (`onesta-check.mjs` + `onesta-ambito.mjs` copiati dal repo, non un finto che esce con l'rc voluto):
//   ① in modo BLOCCA, onestà bocciata → il cancello NON fa pubblicare (col parametro morto passava);
//   ② in modo AVVISA non blocca, ma il valore è MISURATO e detto;
//   ③ onestà pulita → si pubblica (la prova non è vacua);
//   ④ metro assente in BLOCCA = CIECO, e cieco non è verde (AR-322);
//   ⑤ LA PROVA CHIAVE — un numero di business senza fonte nella parte VIVA della memoria fa
//      diventare ROSSO il cancello;
//   ⑥ …e lo STESSO rilievo, spostato nel diario append-only, NON lo fa (né dal cancello, né dal
//      metro chiamato sul file come fa `giro.sh`);
//   ⑦ una parte viva fatta solo dei falsi positivi noti (date, orari, uno snippet di shell) passa —
//      e il metro DICE quali rilievi ha esentato e PERCHÉ;
//   ⑧ un file storico intero non è «onesto»: è NON GIUDICATO, col motivo scritto;
//   ⑨ un'esenzione senza il motivo scritto è rifiutata: il metro non parte nemmeno.
//
// NON-VACUITÀ (verificata rompendo il fix apposta):
//   · in `onesta-check.mjs`, sostituendo `if (scarta("numero-senza-fonte", …)) continue;` con
//     `if (true) continue;` — cioè esentando tutto invece dei soli falsi positivi dichiarati — la
//     prova ⑤ diventa ROSSA: il metro torna a non poter fallire;
//   · sostituendo `const daGiudicare = ambito.vivo;` con `const daGiudicare = testo;` — cioè
//     togliendo l'ambito ristretto — la prova ⑥ diventa ROSSA: la storia torna a bloccare il presente.

import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CERVELLO = join(REPO, "cervello");
const GATE = join(CERVELLO, "gate-pubblicazione.sh");

// Importato in cima e non dentro il caso: `prova()` esegue la funzione in modo SINCRONO, quindi un
// `async` lì dentro segnerebbe «ok» prima ancora che la promessa si risolva — un caso che non può
// fallire dentro la prova che cura i controlli che non possono fallire.
const { verificaEsenzioni, ESENZIONI } = await import(join(CERVELLO, "onesta-ambito.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === "function") throw new Error("un caso di prova non può essere async: prova() non lo aspetta");
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/**
 * Fa girare il cancello VERO.
 *   `onesta`      = rc del metro FINTO (usato dalle prove ①-④, dove la variabile in esame è il cablaggio)
 *   `metroVero`   = copia dal repo `onesta-check.mjs` + `onesta-ambito.mjs`: il metro giudica sul serio
 *   `stato`       = il contenuto di STATO.md, cioè il dato che sta per essere pubblicato
 *   `modo`        = blocca | avvisa · `metroAssente` = il metro non c'è
 */
function cancello({ onesta = 0, modo = "blocca", metroAssente = false, metroVero = false, stato = null } = {}) {
  const tmp = mkdtempSync(join(tmpdir(), "ar394-"));
  const dir = join(tmp, "cervello");
  const repo = join(tmp, "repo");
  const bin = join(tmp, "bin");
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(repo, "MyCity-Vault", "90-Memoria-AI", "Briefing"), { recursive: true });
  mkdirSync(bin, { recursive: true });

  // I tre guardiani storici: passano, così l'unica variabile in gioco è il quarto.
  for (const g of ["scan-segreti.mjs", "coerenza-fatti.mjs", "vault-sanita.mjs"]) {
    writeFileSync(join(dir, g), "process.exit(0);\n");
  }
  if (!metroAssente) {
    // La TESTA che classifica è sempre quella vera. Il METRO è finto (dice quello che serve al caso)
    // finché si guarda il cablaggio; da ⑤ in giù è quello vero, perché la domanda diventa un'altra:
    // non «l'rc arriva al verdetto?» ma «boccia la cosa giusta e lascia passare le altre?».
    writeFileSync(join(dir, "istante-cancello.mjs"), readFileSync(join(CERVELLO, "istante-cancello.mjs"), "utf8"));
    if (metroVero) {
      writeFileSync(join(dir, "onesta-check.mjs"), readFileSync(join(CERVELLO, "onesta-check.mjs"), "utf8"));
      writeFileSync(join(dir, "onesta-ambito.mjs"), readFileSync(join(CERVELLO, "onesta-ambito.mjs"), "utf8"));
    } else {
      writeFileSync(join(dir, "onesta-check.mjs"), `process.exit(${onesta});\n`);
    }
  }
  writeFileSync(
    join(repo, "MyCity-Vault", "90-Memoria-AI", "STATO.md"),
    stato == null ? "# Stato\n\nOrdini pagati: 3 (fonte: REST 15/8).\n" : stato,
  );

  writeFileSync(
    join(bin, "git"),
    `#!/usr/bin/env bash
case "$*" in
  *"rev-parse --abbrev-ref HEAD"*) echo main ;;
  *"diff --cached --name-only"*) echo "MyCity-Vault/90-Memoria-AI/STATO.md" ;;
esac
exit 0
`,
  );
  chmodSync(join(bin, "git"), 0o755);

  const r = spawnSync("bash", ["-c", `. '${GATE}'; gate_pubblicazione '${dir}' '${repo}' main 1`], {
    encoding: "utf8",
    timeout: 60_000,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, GATE_ONESTA: modo },
  });
  return { pubblica: r.status === 0, testo: `${r.stdout || ""}${r.stderr || ""}` };
}

/** Il metro vero, chiamato come lo chiama `giro.sh`: sul FILE, non su un pezzo di testo. */
function metroSulFile(nome, contenuto, extra = []) {
  const tmp = mkdtempSync(join(tmpdir(), "ar394f-"));
  const f = join(tmp, ...nome.split("/"));
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, contenuto);
  const r = spawnSync(process.execPath, [join(CERVELLO, "onesta-check.mjs"), f, ...extra], { encoding: "utf8", timeout: 60_000 });
  return { rc: r.status, testo: `${r.stdout || ""}${r.stderr || ""}` };
}

// ─── ①-④ · IL CABLAGGIO: il quarto posto del verdetto è riempito da una misura ────────────────

prova("① IL CASO CHE HA ROTTO: onestà bocciata e modo BLOCCA → il cancello NON fa pubblicare", () => {
  const r = cancello({ onesta: 1, modo: "blocca" });
  assert.equal(r.pubblica, false, "il quarto posto del verdetto è di nuovo uno zero muto: quattro controlli promessi, tre fatti");
  assert.match(r.testo, /onestà=/, "il verdetto deve dire il valore misurato, non nasconderlo");
});

prova("② in modo AVVISA non blocca, ma il valore è MISURATO e detto", () => {
  const r = cancello({ onesta: 1, modo: "avvisa" });
  assert.equal(r.pubblica, true, "in modo avvisa la memoria deve continuare a uscire");
  assert.match(r.testo, /GATE/, "un controllo che non blocca deve almeno dire cosa ha visto: il silenzio è il difetto");
});

prova("③ onestà pulita → si pubblica (la prova non è vacua)", () => {
  const r = cancello({ onesta: 0, modo: "blocca" });
  assert.equal(r.pubblica, true, `il cancello rifiuta anche quando è tutto a posto: ${r.testo.slice(-300)}`);
});

prova("④ il metro assente in modo BLOCCA è CIECO, e cieco non è verde", () => {
  const cieco = cancello({ metroAssente: true, modo: "blocca" });
  assert.equal(cieco.pubblica, false, "un metro che non c'è non compra il via libera (AR-322)");
  // …ma non spegne gli altri tre: in modo avvisa la memoria esce lo stesso.
  const avvisa = cancello({ metroAssente: true, modo: "avvisa" });
  assert.equal(avvisa.pubblica, true, "la difesa deve restare proporzionata: un clone parziale non deve restare muto");
});

// ─── ⑤-⑦ · IL METRO VERO: boccia la cosa giusta, e solo quella ────────────────────────────────

// Il pezzo di memoria che il giro riscrive ogni volta. Le date e gli orari ci sono perché la regola
// dell'orario di CLAUDE.md li pretende su OGNI traccia: sono il caso normale, non un caso limite.
const TESTA = "---\ntipo: stato\naggiornato: 2026-08-22 16:05\n---\n\n# I numeri chiave\n\nUltima lettura del database: il 21 agosto fra le 14:29 e le 14:31.\n";
const DIARIO = "\n> 13/8 18:20 — giro vecchio: negozi con payout attivo 12, mai ricontrollati.\n";
const NUMERO_ORFANO = "\nNegozi con payout attivo: 12.\n";

prova("⑤ LA PROVA CHIAVE: un numero senza fonte nella parte VIVA fa diventare ROSSO il cancello", () => {
  const r = cancello({ metroVero: true, modo: "blocca", stato: TESTA + NUMERO_ORFANO });
  assert.equal(
    r.pubblica,
    false,
    `una memoria con un numero di business senza fonte è uscita lo stesso: il quarto controllo non può fallire — ${r.testo.slice(-400)}`,
  );
  assert.match(r.testo, /onestà: violazioni sulla parte viva/, "e il motivo deve essere scritto, non lasciato a un rc");
});

prova("⑥ …e lo STESSO rilievo, se sta nel diario append-only, NON lo fa", () => {
  // Dal cancello: la storia non si giudica, quindi la memoria esce.
  const r = cancello({ metroVero: true, modo: "blocca", stato: TESTA + DIARIO });
  assert.equal(
    r.pubblica,
    true,
    `la storia sta bloccando il presente: per pubblicare oggi bisognerebbe riscrivere il 13 agosto — ${r.testo.slice(-400)}`,
  );
  // E dal metro chiamato sul FILE, che è come lo chiama giro.sh: stesso verdetto.
  const solaStoria = metroSulFile("MyCity-Vault/90-Memoria-AI/STATO.md", TESTA + DIARIO);
  assert.equal(solaStoria.rc, 0, `sul file il diario torna a contare: ${solaStoria.testo.slice(0, 400)}`);
  // Contro-prova nello stesso posto: il numero orfano NELLA PARTE VIVA lì viene visto eccome.
  const vivo = metroSulFile("MyCity-Vault/90-Memoria-AI/STATO.md", TESTA + NUMERO_ORFANO);
  assert.equal(vivo.rc, 1, "l'ambito ristretto non deve diventare un modo per non guardare niente");
});

prova("⑦ i falsi positivi noti passano — e il metro DICE quali ha esentato e perché", () => {
  const soloRumore = `${TESTA}\nIl freno vive in un test di shell: [ -f "$1" ] && echo ok — misurato il 24/6 alle 08:28.\n`;
  const r = cancello({ metroVero: true, modo: "blocca", stato: soloRumore });
  assert.equal(
    r.pubblica,
    true,
    `date, orari e uno snippet di shell fanno bocciare la memoria: un cancello che boccia sempre viene spento — ${r.testo.slice(-400)}`,
  );

  // L'esenzione non basta che funzioni: deve essere DICHIARATA col motivo. È la clausola che saltava.
  const j = spawnSync(process.execPath, [join(CERVELLO, "onesta-check.mjs"), "--stdin", "--json"], {
    input: soloRumore,
    encoding: "utf8",
    timeout: 60_000,
  });
  const referto = JSON.parse(j.stdout);
  const applicate = referto.risultati[0].esenzioni_applicate;
  assert.ok(applicate.length >= 2, "il referto deve elencare le esenzioni applicate, non nasconderle");
  for (const e of applicate) {
    assert.ok(e.id, "ogni esenzione ha un nome");
    assert.ok(String(e.motivo || "").length > 60, `l'esenzione «${e.id}» è muta: è il silenzio che AR-394 cura`);
  }
  assert.ok(
    applicate.some((e) => e.id === "data-di-calendario") && applicate.some((e) => e.id === "orario"),
    "i due falsi positivi che tenevano staccato il controllo devono comparire per nome",
  );
});

// ─── ⑧-⑨ · L'AMBITO e le ESENZIONI, dove si decidono ──────────────────────────────────────────

prova("⑧ un file storico non è «onesto»: è NON GIUDICATO, e il referto lo dice", () => {
  const storico = metroSulFile("MyCity-Vault/90-Memoria-AI/DECISIONI.md", "# Decisioni\n\n13/8 — sconto del 12% ai primi negozi.\n");
  assert.equal(storico.rc, 0, "una riga di agosto non è correggibile oggi: bocciarla ferma la memoria per sempre");
  assert.match(storico.testo, /non giudicato/, "e non deve dire «onesto»: verde su ciò che non ha misurato è il difetto di partenza");
  assert.match(storico.testo, /append-only/, "il motivo va scritto accanto, non lasciato al codice");
});

prova("⑨ un'esenzione senza il motivo scritto è RIFIUTATA: il metro non parte nemmeno", () => {
  assert.equal(verificaEsenzioni(), true, "le esenzioni vere devono passare il proprio controllo");
  assert.throws(
    () => verificaEsenzioni([{ id: "comoda", regola: "numero-senza-fonte", motivo: "dà fastidio" }]),
    /motivo scritto/,
    "un'esenzione muta è esattamente il rimedio che ha creato AR-394: escludere invece di restringere",
  );
  for (const e of ESENZIONI) {
    assert.ok(String(e.motivo).length >= 60, `l'esenzione «${e.id}» deve spiegarsi da sola a chi legge`);
  }
});

const attesi = casi.length;
let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${attesi - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
