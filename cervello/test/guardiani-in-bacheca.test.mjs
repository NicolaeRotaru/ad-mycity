#!/usr/bin/env node
// I guardiani in bacheca — Nicola, 29/7: «voglio avere un'idea chiara di quello che fanno e poi
// inseriscili dentro bacheca della home e tienila sempre aggiornata».
//
// Cosa può andare storto qui, in ordine di quanto farebbe danno:
//
//   ① **la bacheca promette una protezione che non c'è.** È il rischio peggiore, perché non rompe
//      niente: Nicola legge «⛔ ferma il giro» accanto a un controllo che non ferma un bel niente e
//      smette di guardare quella zona. Nella prima scrittura di questo censimento è successo due
//      volte — `onesta-check` (blocca solo con ONESTA_BLOCCA=1) e `delta-gate` (non ferma: salta la
//      parte AI) — e nessun test l'avrebbe visto, perché il codice girava benissimo.
//   ② **l'elenco si stacca dal codice.** Un guardiano nuovo che non compare, o uno tolto che resta
//      scritto. È il difetto per cui esiste tutto il resto: il numero 54 di ieri era vero al momento
//      in cui qualcuno l'aveva contato, e falso il giorno dopo.
//   ③ **il blocco si duplica in bacheca** a ogni giro, o la sua data corre anche quando non è
//      cambiato niente — e allora sta sempre in cima, sopra il registro dei fatti.
//
// I casi qui sotto rompono il fix apposta, uno per volta, per accertarsi che diventino rossi.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import {
  DESCRIZIONI,
  TITOLO_BACHECA,
  bloccoBacheca,
  censimento,
  codiceUscita,
  corpoDi,
  guardianiDiGiro,
  sostituisciBlocco,
} from "../censimento-guardiani.mjs";
import { aggiornaBacheca } from "../guardiani-check.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GIRO = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
const GATE = readFileSync(join(REPO, "cervello/gate-pubblicazione.sh"), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};
const trova = (elenco, nome) => elenco.find((g) => g.nome === nome);

// ─── ① la bacheca non deve promettere più di quello che c'è ──────────────────

prova("due caratteri di differenza: `|| true` non è un cancello, `_rc=$?` sì", () => {
  const info = 'node "$SCRIPT_DIR/tale.mjs" 2>&1 | esito_righe 4 || true';
  const gate = '_t_out="$(node "$SCRIPT_DIR/tale.mjs" 2>&1)"; _t_rc=$?';
  assert.equal(guardianiDiGiro(info)[0].esitoPreso, false);
  assert.equal(guardianiDiGiro(gate)[0].esitoPreso, true);
});

prova("catturare il TESTO non è prendere il verdetto (il caso che mi ha ingannato)", () => {
  // contesto-lezioni: `$(node …)` con `|| true` DENTRO le parentesi. La prima versione lo contava
  // fra i bloccanti perché guardava `$(node`, e la bacheca l'avrebbe dichiarato capace di fermare
  // il giro. Non ferma niente: raccoglie del testo da mettere nel prompt.
  const riga = '_MEMORIA_BLOCK="$(node "$SCRIPT_DIR/contesto-lezioni.mjs" 2>/dev/null || true)"';
  assert.equal(guardianiDiGiro(riga)[0].esitoPreso, false, "una cattura di testo non è un cancello");
  assert.equal(trova(guardianiDiGiro(GIRO), "contesto-lezioni").esitoPreso, false, "e nemmeno nel giro vero");
});

prova("un vincolo scritto ma non contato non vale «ferma il giro»", () => {
  const finto = [
    '  if ! guardiano tale-check.mjs; then',
    '    TALE_VINCOLO="$(vincolo_da_rc "tale-check" "$GUARDIANO_RC" "⛔ qualcosa")"',
    "  fi",
    "for _vnome in SENSORI ALTRO; do", // TALE non c'è: scritto e mai contato
  ].join("\n");
  const [g] = guardianiDiGiro(finto);
  assert.equal(g.vincolo, "TALE_VINCOLO");
  assert.equal(g.vincoloContato, false);
  const cens = censimento(finto, { descrizioni: { "tale-check": { famiglia: "test", cosa: "x" } } });
  assert.deepEqual(cens.elenco[0].effetti, ["non-contato"]);
  assert.equal(cens.fermano, 0, "un allarme che nessuno conta non ferma niente");

  // …e con lo stesso vincolo nell'elenco, lo stesso guardiano ferma davvero.
  const contato = finto.replace("for _vnome in SENSORI ALTRO", "for _vnome in SENSORI TALE ALTRO");
  assert.deepEqual(guardianiDiGiro(contato)[0].vincoloContato, true);
  assert.equal(censimento(contato, { descrizioni: { "tale-check": { famiglia: "test", cosa: "x" } } }).fermano, 1);
});

prova("AR-387 — nel giro VERO non resta nessun allarme che si scrive e non si conta", () => {
  // Questo caso, fino al lotto 33, ASSERIVA il difetto: pretendeva esattamente i cinque allarmi non
  // contati (firma-check, pausa-check, porte-check, sensori-spenti-check, stampo-check) e passava
  // verde finché il buco restava aperto. È la stessa forma di AR-409 — una prova che certifica il
  // buco come comportamento corretto — e va rovesciata insieme al fix, altrimenti la rete tiene in
  // vita proprio ciò che doveva prendere.
  //
  // Adesso `giro.sh` deriva l'elenco con `compgen -v | grep _VINCOLO$`: ogni vincolo dichiarato è
  // contato per costruzione, quindi la risposta giusta è ZERO. Se qualcuno tornasse a enumerare i
  // nomi a mano, qui si riaccenderebbe.
  const cens = censimento(GIRO, { testoGate: GATE });
  assert.deepEqual(cens.nonContati, [], `allarmi che non fermano niente: ${cens.nonContati.join(", ")}`);
  for (const n of ["firma-check", "porte-check", "stampo-check", "pausa-check", "sensori-spenti-check"]) {
    assert.equal(trova(cens.elenco, n).vincoloContato, true, `${n}: il suo «no» deve fermare il giro`);
  }
});

prova("AR-387 — un allarme non contato ora FA FALLIRE il rilevatore, non solo la bacheca", () => {
  // L'altra metà del difetto: il censimento MISURAVA i non contati e li scriveva in bacheca, ma li
  // teneva fuori dal proprio codice d'uscita. Un difetto raccontato bene non è un difetto chiuso.
  assert.equal(codiceUscita({ nonContati: ["porte-check"] }), 1, "un allarme che non ferma niente deve far fallire");
  assert.equal(codiceUscita({ nonContati: [] }), 0);
});

prova("blocca la pubblicazione solo chi arriva davvero al verdetto del cancello", () => {
  const cens = censimento(GIRO, { testoGate: GATE });
  for (const n of ["scan-segreti", "coerenza-fatti", "vault-sanita"]) {
    assert.equal(trova(cens.elenco, n).bloccaPubblicazione, true, `${n} blocca davvero il push`);
  }
  // `onesta-check` nel cancello condiviso non viene proprio eseguito (falsi positivi sui log
  // append-only, rinuncia scritta lì accanto): il suo posto nel verdetto resta a zero.
  assert.equal(trova(cens.elenco, "onesta-check").bloccaPubblicazione, false);

  // Il filtro serve al caso che oggi non c'è: un guardiano cablato su una variabile che il verdetto
  // non guarda. Girerebbe, fallirebbe, e non fermerebbe niente — gli allarmi non contati, di nuovo.
  const finto = [
    '  node "$dir/dentro.mjs" >/dev/null 2>&1 || rc_seg=$?',
    '  node "$dir/fuori.mjs"  >/dev/null 2>&1 || rc_scollegato=$?',
    '  if ! gate_verdetto "$rc_seg" "$rc_fat"; then',
  ].join("\n");
  const d = { dentro: { famiglia: "test", cosa: "x" }, fuori: { famiglia: "test", cosa: "y" } };
  const c2 = censimento('node "$SCRIPT_DIR/dentro.mjs" || true\nnode "$SCRIPT_DIR/fuori.mjs" || true', { descrizioni: d, testoGate: finto });
  assert.equal(trova(c2.elenco, "dentro").bloccaPubblicazione, true);
  assert.equal(trova(c2.elenco, "fuori").bloccaPubblicazione, false, "cablato ma mai guardato: non blocca");
});

prova("chi spegne il motore AI non è chi boccia il giro", () => {
  const cens = censimento(GIRO, { testoGate: GATE });
  assert.deepEqual(trova(cens.elenco, "delta-gate").effetti, ["motore"], "il delta-gate frena, non boccia");
  assert.ok(trova(cens.elenco, "freno-costi").effetti.includes("motore"), "il freno costi spegne il premium");
});

// ─── ② l'elenco non deve staccarsi dal codice ────────────────────────────────

prova("l'helper `guardiano X.mjs` viene visto quanto `node $SCRIPT_DIR/X.mjs`", () => {
  // È l'intera ragione per cui il numero era 54 invece di 65: gli undici entrati con l'helper non
  // combaciavano con la forma che si andava a cercare.
  const misto = ['node "$SCRIPT_DIR/uno.mjs" 2>&1 || true', "  if ! guardiano due.mjs --gate; then"].join("\n");
  assert.deepEqual(guardianiDiGiro(misto).map((g) => g.nome), ["due", "uno"]);
  const veri = guardianiDiGiro(GIRO).map((g) => g.nome);
  for (const n of ["stampo-check", "porte-check", "spazzata-fratelli", "tasso-lezioni"]) {
    assert.ok(veri.includes(n), `${n} passa dall'helper e deve comparire`);
  }
});

prova("IL CANCELLO: ogni guardiano che gira davvero ha una descrizione, e nessuna descrizione è orfana", () => {
  const cens = censimento(GIRO, { testoGate: GATE });
  assert.deepEqual(cens.senzaDescrizione, [], "un guardiano nuovo si descrive nel giro in cui nasce");
  assert.deepEqual(cens.fantasmi, [], "una descrizione di uno che non gira più promette protezione finta");
  assert.equal(codiceUscita(cens), 0);
});

prova("e il cancello è vero: un guardiano nuovo senza descrizione fa uscire 1", () => {
  const conNuovo = `${GIRO}\n_nuovo_out="$(node "$SCRIPT_DIR/nuovissimo-check.mjs" 2>&1)"; _nuovo_rc=$?\n`;
  const cens = censimento(conNuovo, { testoGate: GATE });
  assert.deepEqual(cens.senzaDescrizione, ["nuovissimo-check"]);
  assert.equal(codiceUscita(cens), 1, "senza questo, l'elenco invecchia in silenzio");
  // e nella direzione opposta: una descrizione rimasta di uno tolto dal giro
  const tolto = censimento(GIRO.replace(/node "\$SCRIPT_DIR\/letargo\.mjs"/g, "true #"), { testoGate: GATE });
  assert.deepEqual(tolto.fantasmi, ["letargo"]);
  assert.equal(codiceUscita(tolto), 1);
});

prova("le descrizioni sono per Nicola: niente sigle AR né nomi di file nel testo", () => {
  for (const [nome, d] of Object.entries(DESCRIZIONI)) {
    assert.ok(!/AR-\d+/.test(d.cosa), `${nome}: la sigla sta nel codice, non in bacheca`);
    assert.ok(!/\.mjs|\.json|\.sh\b/.test(d.cosa), `${nome}: niente path nel testo grosso`);
    assert.ok(d.cosa.length > 40, `${nome}: una riga troppo corta non spiega niente`);
  }
});

// ─── ③ il blocco in bacheca ──────────────────────────────────────────────────

prova("il blocco ha il formato che il Pannello sa leggere davvero", () => {
  // La regola non la riscrivo a mano: la prendo dal consumatore vero, così se cambia lì questo test
  // se ne accorge invece di continuare a convalidare un formato che non serve più a nessuno.
  const route = readFileSync(join(REPO, "pannello/src/app/api/bacheca/route.ts"), "utf8");
  const sorgente = route.match(/const RE_TITOLO = (\/.+\/);/)[1];
  const re = new RegExp(sorgente.slice(1, sorgente.lastIndexOf("/")));
  const prima = bloccoBacheca(censimento(GIRO, { testoGate: GATE }), "2026-07-29 01:30").split("\n")[0];
  const m = prima.match(re);
  assert.ok(m, `il Pannello non riconoscerebbe questo titolo: ${prima}`);
  assert.equal(m[1], TITOLO_BACHECA);
  assert.equal(m[2], "2026-07-29 01:30", "senza l'ora, in Cabina non si sa quando è apparso il dato");
});

prova("riapplicare il blocco non lascia doppioni e non tocca gli avvisi di Nicola", () => {
  const cens = censimento(GIRO, { testoGate: GATE });
  const base = ["# 📌 Bacheca", "", "## 📒 Registro dei fatti · 2026-07-24 17:10", "", "riga di Nicola", "", "---", "", "## 💰 Costi · 2026-07-23 17:26", "", "altra riga"].join("\n");
  let doc = sostituisciBlocco(base, bloccoBacheca(cens, "2026-07-29 01:30"));
  doc = sostituisciBlocco(doc, bloccoBacheca(cens, "2026-07-29 03:30"));
  doc = sostituisciBlocco(doc, bloccoBacheca(cens, "2026-07-29 05:30"));
  const quanti = doc.split("\n").filter((r) => r.startsWith(`## ${TITOLO_BACHECA} ·`)).length;
  assert.equal(quanti, 1, "tre passaggi, un blocco solo");
  assert.match(doc, /riga di Nicola/);
  assert.match(doc, /## 💰 Costi · 2026-07-23 17:26/);
  assert.match(doc, /altra riga/);
  assert.ok(doc.includes("05:30") && !doc.includes("01:30"), "resta l'ultima versione, non tutte");
});

prova("la data si muove solo se cambiano i guardiani, non quando passa il tempo", () => {
  const cens = censimento(GIRO, { testoGate: GATE });
  const doc = sostituisciBlocco("# 📌 Bacheca\n", bloccoBacheca(cens, "2026-07-29 01:30"));

  const fermo = aggiornaBacheca(doc, bloccoBacheca(cens, "2026-07-29 09:30"));
  assert.equal(fermo.cambiato, false, "stesso contenuto, ora diversa → non si riscrive");
  assert.equal(fermo.testo, doc);

  // Un guardiano NUOVO, non una seconda chiamata di uno che c'è già: quella non cambia cosa la
  // macchina sta sorvegliando, e la bacheca non deve muoversi per un dettaglio di cablaggio.
  const uguale = censimento(`${GIRO}\nnode "$SCRIPT_DIR/letargo.mjs" --ancora 2>&1 || true\n`, { testoGate: GATE });
  assert.equal(aggiornaBacheca(doc, bloccoBacheca(uguale, "2026-07-29 09:30")).cambiato, false);

  const diverso = censimento(`${GIRO}\nnode "$SCRIPT_DIR/nuovissimo-check.mjs" 2>&1 || true\n`, { testoGate: GATE });
  const mosso = aggiornaBacheca(doc, bloccoBacheca(diverso, "2026-07-29 09:30"));
  assert.equal(mosso.cambiato, true, "cambia un guardiano → la data si muove");
  assert.match(mosso.testo, /2026-07-29 09:30/);
});

prova("in bacheca finiscono tutti i guardiani, raggruppati e con il loro effetto", () => {
  const cens = censimento(GIRO, { testoGate: GATE });
  const md = bloccoBacheca(cens, "2026-07-29 01:30");
  for (const g of cens.elenco) assert.ok(md.includes(`\`${g.nome}\``), `${g.nome} manca dalla tabella`);
  assert.ok(md.includes(`**${cens.totale} controlli automatici**`), "il totale va detto in cima");
  // Non c'è più nessun allarme non contato (AR-387), quindi l'avviso non deve comparire: mostrarlo
  // sarebbe raccontare un difetto che non c'è. Ma la riga deve restare PRONTA a ricomparire — è la
  // ragione per cui il caso qui sotto la esercita su un censimento finto invece di cancellarla.
  assert.ok(!/allarmi si scrivono ma non si contano/.test(md), "nessun allarme scoperto: l'avviso non va stampato");
  assert.match(
    bloccoBacheca({ ...cens, nonContati: ["porte-check"] }, "2026-07-29 01:30"),
    /⚠️ \*\*1 allarmi si scrivono ma non si contano\.\*\*/,
    "se il difetto tornasse, la bacheca lo deve dire"
  );
  assert.ok(!/undefined/.test(md), "nessun buco nel markdown");
  assert.equal(corpoDi(md).startsWith("A ogni giro"), true);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
