#!/usr/bin/env node
// AR-172 — l'unico centro dell'AD è aver previsto che un numero fermo restasse fermo.
//
// Il filtro anti-banalità leggeva le PAROLE: cercava «invariati», «status quo», «numeri fermi» nel
// testo dell'azione. Su 42 voci ne ha riconosciute 3. Il resto passava, perché una previsione può
// essere banale senza dirlo: basta che l'atteso sia il numero che c'era già.
//
// Il campo che mancava è uno solo — `baseline`, il valore della metrica QUANDO si apre la previsione.
// Misurato il 28/7: **42 voci su 42 non ce l'hanno.** Senza, «prevedo 0 ordini» e «prevedo che gli
// zero ordini restino zero» sono la stessa riga.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { ESCLUSA, banale, contaNelPunteggio } from "../previsione-verificabile.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

/**
 * LA SABBIERA (AR-446). Prima questi due casi lavoravano sulla memoria VERA: salvavano
 * `calibrazione.json` e `registro-fatti.json`, li riscrivevano per la prova e li rimettevano a posto
 * in un `finally`. Finché nessuno crasha funziona — ma il ripristino sta dentro il test, e uno dei
 * due file è la fonte unica della verità. Un timeout, un ctrl-c, due prove insieme, e il registro dei
 * fatti resta con dentro i dati della prova.
 *
 * Adesso il percorso è INIETTATO: `MYCITY_MEMORIA_ROOT` devia tutto l'albero della memoria — le
 * letture di `calibrazione.mjs` e le sue scritture, comprese quelle degli script che lancia a sua
 * volta — dentro una cartella temporanea. Niente `finally`, niente ripristino, niente da rompere.
 */
function sabbieraMemoria(seed = {}) {
  const dir = mkdtempSync(join(tmpdir(), "previsione-"));
  mkdirSync(join(dir, "MyCity-Vault/90-Memoria-AI/auto-coscienza"), { recursive: true });
  for (const [rel, testo] of Object.entries(seed)) writeFileSync(join(dir, rel), testo);
  return dir;
}
const REL_CAL = "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json";
const REL_FATTI = "MyCity-Vault/90-Memoria-AI/registro-fatti.json";
/** Il registro vero ma con la lista delle previsioni svuotata: la prova parte da un foglio pulito. */
const calibrazioneVuota = () => {
  const j = JSON.parse(readFileSync(join(REPO, REL_CAL), "utf8"));
  j.registro = [];
  return JSON.stringify(j, null, 2) + "\n";
};

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: atteso uguale alla baseline è banale, comunque sia scritto", () => {
  // Nessuna delle parole-spia compare: solo i numeri lo dicono.
  const voce = { azione: "spinta commerciale sui negozi", atteso: 0, baseline: 0, stato: "azzeccata", sensore_stato: "ok" };
  assert.equal(banale(voce), true);
  assert.ok(contaNelPunteggio(voce).motivi.includes(ESCLUSA.BANALE));
});

prova("una previsione vera resta vera: atteso diverso dalla baseline conta", () => {
  const voce = { atteso: 1, baseline: 0, stato: "azzeccata", sensore_stato: "ok", entro: "2099-01-01", creato: "2026-07-01", chiuso_il: "2026-07-05" };
  assert.equal(banale(voce), false);
  assert.equal(contaNelPunteggio(voce).conta, true, JSON.stringify(contaNelPunteggio(voce).motivi));
});

prova("la marcatura vecchia a mano non si butta via", () => {
  // `banale: true` è informazione vera, scritta da chi guardava. Sostituirla con «ora decido io dai
  // dati» perderebbe il giudizio umano sulle 3 voci che ce l'hanno.
  assert.equal(banale({ banale: true, atteso: 5, baseline: 0 }), true);
});

prova("senza baseline NON si indovina la banalità", () => {
  // Al buio non si dà la risposta comoda: dichiarare banale una voce che non lo è la toglierebbe dal
  // punteggio senza motivo, e dichiararla non-banale la farebbe contare senza prova. Si dice «non lo so»
  // restando fuori dal giudizio, e ci pensa l'invariante a pretendere il campo sulle voci nuove.
  assert.equal(banale({ atteso: 0 }), false, "senza baseline il giudizio di banalità non si esprime");
  assert.equal(banale({ atteso: 0, baseline: null }), false);
});

prova("il comando VERO accetta e conserva la baseline, ed avverte se è uguale all'atteso", () => {
  // Il comando gira su una sabbiera: legge di lì, scrive di lì, e la memoria vera non la sfiora.
  const sab = sabbieraMemoria({ [REL_CAL]: calibrazioneVuota() });
  const impronta = readFileSync(join(REPO, REL_CAL), "utf8");
  const bin = join(REPO, "cervello/calibrazione.mjs");
  let out = "";
  try {
    out = execFileSync("node", [bin, "prevedi", "--reparto=@prova-baseline", "--azione=prova", "--metrica=ordini", "--atteso=0", "--baseline=0", "--entro=2099-01-01", "--id=CAL-PROVA-BANALE"], { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, MYCITY_MEMORIA_ROOT: sab } });
  } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  assert.match(out, /fermo resti fermo|baseline/i, "deve avvisare che sta prevedendo lo status quo");
  const scritta = JSON.parse(readFileSync(join(sab, REL_CAL), "utf8")).registro.find((e) => e.id === "CAL-PROVA-BANALE");
  assert.ok(scritta, "la previsione dev'essere stata scritta");
  assert.equal(scritta.baseline, 0, "la baseline dev'essere finita nella voce, non solo nell'avviso");
  assert.equal(readFileSync(join(REPO, REL_CAL), "utf8"), impronta,
    "il registro VERO non deve essersi mosso: il percorso è iniettato, non calcolato (AR-446)");
  rmSync(sab, { recursive: true, force: true });
});

prova("nemmeno la previsione AUTOMATICA inventa più l'atteso", () => {
  // Il buco che il passo ⑤ ha trovato DOPO il merge: avevo sistemato `prevedi` (il comando a mano) e
  // lasciato `autoprevedi` — il generatore automatico — che apriva sempre `atteso: 1` su
  // `ordini_totali` senza sapere quanti ordini ci fossero. Se il numero vero era 1 la previsione
  // nasceva azzeccata; se era 0, «1» era un desiderio scritto come misura. Sistemare la porta a mano
  // e lasciare aperta quella automatica è il modo più sicuro di far tornare il difetto da solo.
  const impronte = [REL_CAL, REL_FATTI].map((f) => readFileSync(join(REPO, f), "utf8"));
  const bin = join(REPO, "cervello/calibrazione.mjs");

  // ① con la baseline leggibile: apre, e la porta dentro la voce. Il fatto `northstar.consegnati` lo
  // legge dalla memoria vera (leggere non sporca nessuno), perché la sabbiera non ne ha una copia.
  const uno = sabbieraMemoria({ [REL_CAL]: calibrazioneVuota() });
  execFileSync("node", [bin, "autoprevedi"], { cwd: REPO, encoding: "utf8", env: { ...process.env, MYCITY_MEMORIA_ROOT: uno } });
  const voce = JSON.parse(readFileSync(join(uno, REL_CAL), "utf8")).registro[0];
  assert.ok(voce, "con la baseline leggibile deve aprire la previsione");
  assert.equal(typeof voce.baseline, "number", "la baseline dev'essere nella voce, non solo nel messaggio");
  assert.notEqual(voce.atteso, voce.baseline, "l'atteso non può coincidere col valore di partenza");
  assert.equal(banale(voce), false);

  // ② senza il fatto: NON apre nulla, e lo dice. «Meglio nessuna che una inventata.»
  // Qui la sabbiera porta la SUA copia del registro dei fatti, mutilata: prima questa riga toglieva
  // il fatto dal registro vero e sperava nel `finally`.
  const fatti = JSON.parse(readFileSync(join(REPO, REL_FATTI), "utf8"));
  fatti.fatti = fatti.fatti.filter((x) => x.id !== "northstar.consegnati");
  const due = sabbieraMemoria({ [REL_CAL]: calibrazioneVuota(), [REL_FATTI]: JSON.stringify(fatti, null, 2) + "\n" });
  const out = execFileSync("node", [bin, "autoprevedi"], { cwd: REPO, encoding: "utf8", env: { ...process.env, MYCITY_MEMORIA_ROOT: due } });
  assert.equal(JSON.parse(readFileSync(join(due, REL_CAL), "utf8")).registro.length, 0, "senza baseline non deve aprire niente");
  assert.match(out, /nessuna previsione aperta/, "e deve dire PERCHÉ non l'ha aperta");

  // E la riga che rende questo caso una prova di AR-446 e non solo di AR-172.
  assert.deepEqual([REL_CAL, REL_FATTI].map((f) => readFileSync(join(REPO, f), "utf8")), impronte,
    "la memoria VERA non si è mossa: nemmeno il registro dei fatti, che è la fonte unica della verità");
  rmSync(uno, { recursive: true, force: true });
  rmSync(due, { recursive: true, force: true });
});

prova("il registro vero non ha baseline: è la misura che ha aperto il difetto", () => {
  const j = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json"), "utf8"));
  const storiche = j.registro.filter((e) => e.creato && String(e.creato).slice(0, 10) < "2026-07-28");
  const senza = storiche.filter((e) => e.baseline == null).length;
  assert.equal(senza, storiche.length, "lo storico non si riscrive: resta senza baseline, dichiarato");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
