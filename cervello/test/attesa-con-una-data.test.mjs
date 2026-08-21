#!/usr/bin/env node
// «IL FRENO È A UNA RIGA DI DISTANZA, E QUELLA RIGA LA INCOLLA NICOLA» — con una data sopra.
//
// LA STORIA (21/8). Il cancello dello Stop mi trova ad aver usato `Monitor`, che nessuna guardia
// sorveglia, e offre due strade: agganciare un freno in `.claude/settings.json`, oppure dichiarare
// lo strumento in ESENZIONI col motivo.
//
// Nessuna delle due era percorribile onestamente. `Monitor` ESEGUE UNA SHELL come `Bash`: chiamarlo
// esente sarebbe stato mettere un'etichetta su un buco — la cosa che il commento sopra ESENZIONI
// vieta con parole sue. E il file dei freni la macchina non lo può scrivere: lo dice il file stesso,
// con un `deny` su Edit e Write, perché è quello che può staccare TUTTI i freni insieme. Provato:
// l'Edit torna «File is in a directory that is denied by your permission settings».
//
// Restava la strada sbagliata — passare da un'altra porta, un `sed` da Bash — e non si prende: è la
// malattia che il registro chiama «porta-laterale-senza-i-freni-della-principale», e aggirare un
// divieto di permesso perché scomodo è esattamente ciò che i divieti esistono per impedire.
//
// La casa aveva già la risposta, un piano più giù. `guardia-viva.mjs` ha `in-attesa-di-aggancio`
// per i GUARDIANI, con la ragione scritta: fra «l'ho costruito» e «Nicola l'ha incollato» passa del
// tempo vero, e in quel tempo chiamarlo buco vuol dire dare rosso al comportamento giusto — e un
// cancello rosso per costruzione viene aggirato al secondo giro. Qui è lo stesso caso applicato agli
// STRUMENTI, con la stessa clausola che lo rende un'attesa e non un condono: **una data**.
//
// COSA PROVA QUESTO FILE, eseguendo:
//   ① un'attesa con perché e data futura vale: lo strumento non è un buco, ma NON è nemmeno esente;
//   ② scaduta la data torna a essere un buco, da solo, senza che nessuno se ne ricordi;
//   ③ senza data non è un'attesa: è un'esenzione travestita, e non vale;
//   ④ un perché di due parole non è un perché;
//   ⑤ Monitor è dichiarato lì dentro, e NON fra gli esenti: la differenza è il punto di tutto;
//   ⑥ l'attesa non regala copertura a chi non c'entra.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `mappa-copertura.mjs`, togliendo il controllo
// della data da `attesaValida` (`return true` dopo il perché) → il caso ② diventa ROSSO.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { attesaValida, coperturaDi, IN_ATTESA, ESENZIONI } = await import(join(REPO, "cervello/mappa-copertura.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const ATTESE = {
  Finto: { perche: "esegue una shell, quindi gli serve lo stesso freno di Bash: manca una riga nel file dei freni", scade: "2026-09-04" },
  SenzaData: { perche: "esegue una shell, quindi gli serve lo stesso freno di Bash: manca una riga nel file dei freni" },
  PercheCorto: { perche: "boh", scade: "2026-09-04" },
};
const SENZA_FRENI = {}; // nessun hook: qualunque strumento qui è scoperto

// ── ① e ② La data è tutto ───────────────────────────────────────────────────

prova("un'attesa con perché e data futura vale", () => {
  assert.equal(attesaValida("Finto", "2026-08-21", ATTESE), true);
});

prova("scaduta la data torna a essere un buco, da sola", () => {
  assert.equal(attesaValida("Finto", "2026-09-04", ATTESE), true, "il giorno della scadenza vale ancora");
  assert.equal(
    attesaValida("Finto", "2026-09-05", ATTESE),
    false,
    "senza questo, un'attesa è un'esenzione con una data decorativa: il debito non scade mai",
  );
});

// ── ③ e ④ Cosa NON è un'attesa ──────────────────────────────────────────────

prova("senza data non è un'attesa: è un'esenzione travestita", () => {
  assert.equal(attesaValida("SenzaData", "2026-08-21", ATTESE), false);
});

prova("e un perché di due parole non è un perché", () => {
  assert.equal(attesaValida("PercheCorto", "2026-08-21", ATTESE), false);
});

// ── Lo stato che ne esce: non è un buco, e non è nemmeno «a posto» ──────────

prova("in attesa NON è un buco, ma resta scoperto nei fatti", () => {
  const r = coperturaDi("Finto", SENZA_FRENI, { attese: ATTESE, oggi: "2026-08-21" });
  assert.equal(r.stato, "scoperto", "nessuno lo sta guardando davvero, e va detto");
  assert.equal(r.problema, false, "ma non è un buco: il freno esiste, manca una riga, ed è dichiarato entro quando");
  assert.equal(r.in_attesa, true);
  assert.equal(r.scade, "2026-09-04", "la data va portata fuori, o nessuno può accorgersi che è passata");
});

prova("e dopo la scadenza lo stesso strumento torna un buco", () => {
  const r = coperturaDi("Finto", SENZA_FRENI, { attese: ATTESE, oggi: "2026-09-05" });
  assert.equal(r.problema, true, "la data deve mordere da sola: è la differenza fra un debito e un condono");
});

// ── ⑤ e ⑥ Il caso vero ──────────────────────────────────────────────────────

prova("Monitor è dichiarato in attesa, e NON fra gli esenti", () => {
  assert.ok(IN_ATTESA.Monitor, "il caso che ha fatto nascere tutto questo va scritto, non ricordato");
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(IN_ATTESA.Monitor.scade), "un'attesa senza data non è un'attesa");
  assert.equal(
    Object.prototype.hasOwnProperty.call(ESENZIONI, "Monitor"),
    false,
    "Monitor esegue una shell: chiamarlo esente sarebbe un'etichetta su un buco",
  );
});

prova("l'attesa non regala copertura a chi non c'entra", () => {
  const r = coperturaDi("UnAltroStrumento", SENZA_FRENI, { attese: ATTESE, oggi: "2026-08-21" });
  assert.equal(r.problema, true, "chi non è dichiarato resta un buco: l'attesa vale per uno, non per tutti");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
