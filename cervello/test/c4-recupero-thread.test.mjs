#!/usr/bin/env node
// LOTTO 43, CORSIA D — LE PROMESSE DEL PANNELLO, ESEGUITE INVECE CHE RILETTE.
//
// Tre difetti, una radice sola: il Pannello prometteva per iscritto una cosa che il codice non
// faceva, e la promessa viveva dentro un `useEffect` dove nessun test la poteva far girare.
//
//   ① AR-603 — «una risposta persa riappare sempre dai lavori». L'elenco che gira in continuo è
//      leggero apposta (niente domanda, niente risposta: 9,8 KB a riga ogni 8 secondi), e i lavori
//      già finiti non li rilegge nessuno. Dopo un ricaricamento della pagina si ricostruiva da
//      righe mute: ZERO messaggi. Il paracadute si apriva solo finché non serviva.
//   ② AR-604 — «la risposta vera verrà ripescata dai lavori alla prossima apertura». Chiudere il
//      box non smonta il componente, quindi il segno «ho già caricato» restava acceso; e anche al
//      rimontaggio vero si usciva prima del passo di recupero se la chat unificata ricordava quella
//      casella. Le due uscite anticipate spegnevano il ripescaggio nei casi promessi.
//   ③ AR-602 — la risposta a metà sotto il bollino «Fatto». La decisione era già stata estratta in
//      `lib/stato-card.ts` in un lotto precedente, ma il componente non la chiamava: il modulo era
//      lì, importato da nessuno. Un modulo mai chiamato somiglia moltissimo a una difesa attiva.
//
// Si lancia con: node cervello/test/c4-recupero-thread.test.mjs

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// AR-156 — i moduli del Pannello si importano fra loro senza estensione (legittimo per il bundler di
// Next, non per Node). La suite passa il risolutore con `--import`; qui lo si registra anche a mano,
// così il comando scritto sulla scheda del difetto funziona lanciato da solo. Senza, questo file non
// fallirebbe: non partirebbe proprio, che somiglia troppo a un test che non c'è.
register("./risolvi-ts.mjs", import.meta.url);

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const R = await import(join(REPO, "pannello/src/lib/recupero-thread.ts"));
const G = await import(join(REPO, "pannello/src/lib/lavori-gruppo.ts"));
const S = await import(join(REPO, "pannello/src/lib/stato-card.ts"));
const E = await import(join(REPO, "pannello/src/lib/effetti-in-updater.ts"));

const leggi = (p) => readFileSync(join(REPO, p), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === "function") throw new Error("caso asincrono: usa provaAsync");
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};
const daFare = [];
const provaAsync = (nome, fn) => daFare.push([nome, fn]);

// ── ① AR-603 · l'archivio dopo un ricaricamento ─────────────────────────────

// Com'è fatta DAVVERO una riga che arriva dall'elenco leggero: niente `richiesta`, niente
// `risultato`. Non è un finto comodo — sono esattamente le colonne di LAVORI_SELECT_LIGHT.
const RIGA_LEGGERA = {
  id: "a1",
  created_at: "2026-08-14T09:00:00.000Z",
  updated_at: "2026-08-14T09:05:00.000Z",
  stato: "fatto",
  tipo: "chat",
  gruppo_id: "g1",
};

prova("AR-603: il difetto esiste — da righe mute la conversazione esce VUOTA", () => {
  // Questo è il caso che Nicola vedeva: archivio riaperto, nessun messaggio da nessuna parte.
  const messaggi = G.messaggiDaGruppo([RIGA_LEGGERA]);
  assert.equal(messaggi.length, 0, "senza testo non c'è niente da ricostruire: è il difetto, non un dettaglio");
});

prova("AR-603: una riga finita e muta viene riconosciuta come «da rileggere»", () => {
  assert.deepEqual(R.idsDaRileggerePerThread([RIGA_LEGGERA]), ["a1"]);
});

prova("AR-603: una riga che il testo ce l'ha NON si rilegge — niente letture sprecate", () => {
  const piena = { ...RIGA_LEGGERA, richiesta: "ciao", risultato: "ecco la risposta" };
  assert.deepEqual(R.idsDaRileggerePerThread([piena]), []);
});

prova("AR-603: un lavoro ancora in corso non si rilegge per la risposta che non ha ancora", () => {
  const inCorso = { ...RIGA_LEGGERA, stato: "in_corso", richiesta: "ciao" };
  assert.deepEqual(R.idsDaRileggerePerThread([inCorso]), [], "sta ancora scrivendo: aspettare non è un difetto");
});

prova("AR-603: un annullato non si rilegge — lì una risposta NON deve esserci", () => {
  const ann = { ...RIGA_LEGGERA, stato: "annullato", richiesta: "ciao" };
  assert.deepEqual(R.idsDaRileggerePerThread([ann]), []);
  // …ma se manca pure la domanda, quella va riletta: senza, il titolo del gruppo resta anonimo.
  assert.deepEqual(R.idsDaRileggerePerThread([{ ...ann, richiesta: "" }]), ["a1"]);
});

prova("AR-603: «giro» ha la domanda scritta nel codice, ma la risposta la deve avere", () => {
  const giro = { ...RIGA_LEGGERA, tipo: "giro" };
  assert.deepEqual(R.idsDaRileggerePerThread([giro]), ["a1"], "manca il risultato: si rilegge");
  assert.deepEqual(R.idsDaRileggerePerThread([{ ...giro, risultato: "fatto il giro" }]), []);
});

prova("AR-603: lo stesso lavoro non si chiede due volte, e la richiesta non è infinita", () => {
  assert.deepEqual(R.idsDaRileggerePerThread([RIGA_LEGGERA, RIGA_LEGGERA]), ["a1"]);
  const tanti = Array.from({ length: 200 }, (_, i) => ({ ...RIGA_LEGGERA, id: `x${i}` }));
  assert.equal(R.idsDaRileggerePerThread(tanti).length, R.MAX_RILETTURE);
  assert.deepEqual(R.idsDaRileggerePerThread(null), [], "niente lavori, niente letture");
});

provaAsync("AR-603: LA CURA — dopo la rilettura la stessa conversazione esce con i suoi messaggi", async () => {
  // È il passaggio che conta: stesse righe di prima, stessa funzione di ricostruzione, e adesso i
  // messaggi ci sono. Il lettore è finto perché qui non c'è rete, ma la catena — decidi, leggi,
  // fondi, ricostruisci — è quella vera.
  let chiesto = null;
  const completi = await R.arricchisciPerThread([RIGA_LEGGERA], async (ids) => {
    chiesto = ids;
    // La richiesta è nel formato vero che il worker scrive, non in uno comodo.
    return [{
      id: "a1",
      stato: "fatto",
      richiesta: "## Casella del Pannello: Numeri\n\n## Nuovo messaggio di Nicola\nquanti negozi abbiamo?",
      risultato: "Uno: Pane Quotidiano.",
    }];
  });
  assert.deepEqual(chiesto, ["a1"], "ha chiesto proprio la riga muta");
  const messaggi = G.messaggiDaGruppo(completi);
  assert.equal(messaggi.length, 2, "domanda + risposta");
  assert.equal(messaggi[0].role, "user");
  assert.equal(messaggi[0].content, "quanti negozi abbiamo?");
  assert.equal(messaggi[1].role, "assistant");
  assert.equal(messaggi[1].content, "Uno: Pane Quotidiano.");
});

provaAsync("AR-603: se la lettura fallisce si tiene quello che c'era — mai peggio di prima", async () => {
  const uguali = await R.arricchisciPerThread([RIGA_LEGGERA], async () => {
    throw new Error("rete giù");
  });
  assert.equal(uguali.length, 1);
  assert.equal(uguali[0].id, "a1");
});

provaAsync("AR-603: senza niente da rileggere non parte nessuna lettura", async () => {
  let chiamate = 0;
  const piena = { ...RIGA_LEGGERA, richiesta: "ciao", risultato: "ecco" };
  await R.arricchisciPerThread([piena], async () => {
    chiamate++;
    return [];
  });
  assert.equal(chiamate, 0, "una lettura inutile a ogni apertura sarebbe un difetto nuovo");
});

prova("AR-603: fondendo, un dettaglio a metà non cancella quello che era già a schermo", () => {
  const conParziale = { ...RIGA_LEGGERA, richiesta: "ciao", risultato: "sto scriv" };
  const fusi = R.fondiDettagli([conParziale], [{ id: "a1", stato: "in_corso" }]);
  assert.equal(fusi[0].risultato, "sto scriv", "il fresco vince solo dove ha qualcosa da dire");
  assert.equal(fusi[0].stato, "in_corso");
});

// ── ② AR-604 · la casella che si riapre ─────────────────────────────────────

const SOSPESO = [{ role: "user", content: "domanda" }, { role: "assistant", content: "⏳ tempo scaduto…", pending: true }];
const FINITO = [{ role: "user", content: "domanda" }, { role: "assistant", content: "risposta vera" }];

prova("AR-604: riaperta dopo il tempo scaduto, il ripescaggio RIPARTE", () => {
  // Il caso esatto della promessa: il box è stato chiuso e riaperto, quindi il segno «ho già
  // caricato» è ancora acceso — prima si usciva alla prima riga e non si ripescava niente.
  const p = R.pianoApertura({
    giaCaricato: true,
    recuperoFatto: true,
    unificataMia: false,
    unificataMessaggi: 0,
    threadCorrente: SOSPESO,
  });
  assert.equal(p.recupera, true, "finché la promessa è a schermo, si ritenta");
  assert.match(p.perche, /promessa/);
});

prova("AR-604: anche con la chat unificata su QUESTA casella si ripesca lo stesso", () => {
  // Era la seconda uscita anticipata: il percorso rapido usciva prima del passo di recupero.
  const p = R.pianoApertura({
    giaCaricato: false,
    recuperoFatto: false,
    unificataMia: true,
    unificataMessaggi: 4,
    threadCorrente: FINITO,
  });
  assert.equal(p.usaUnificata, true, "da lì si parte…");
  assert.equal(p.leggiSalvati, false, "…e non serve rileggere le conversazioni salvate…");
  assert.equal(p.recupera, true, "…ma il ripescaggio si fa comunque: è la clausola che mancava");
});

prova("AR-604: prima apertura senza niente in mano: si legge il salvato E si ripesca", () => {
  const p = R.pianoApertura({
    giaCaricato: false,
    recuperoFatto: false,
    unificataMia: false,
    unificataMessaggi: 0,
    threadCorrente: [],
  });
  assert.deepEqual([p.leggiSalvati, p.usaUnificata, p.recupera], [true, false, true]);
});

prova("AR-604: già ripescato e niente in sospeso: non si rilegge per niente", () => {
  const p = R.pianoApertura({
    giaCaricato: true,
    recuperoFatto: true,
    unificataMia: false,
    unificataMessaggi: 0,
    threadCorrente: FINITO,
  });
  assert.equal(p.recupera, false, "un ripescaggio a vuoto a ogni apertura sarebbe uno spreco nuovo");
  assert.equal(p.leggiSalvati, false);
});

prova("AR-604: una chat unificata di un'ALTRA casella non viene usata", () => {
  const p = R.pianoApertura({
    giaCaricato: false,
    recuperoFatto: false,
    unificataMia: false,
    unificataMessaggi: 9,
    threadCorrente: [],
  });
  assert.equal(p.usaUnificata, false);
  assert.equal(p.leggiSalvati, true);
  // …e una unificata «mia» ma vuota non è un punto di partenza.
  assert.equal(R.pianoApertura({ giaCaricato: false, recuperoFatto: false, unificataMia: true, unificataMessaggi: 0, threadCorrente: [] }).usaUnificata, false);
});

prova("AR-604: una bolla sospesa si riconosce, una finita no", () => {
  assert.equal(R.threadHaSospeso(SOSPESO), true);
  assert.equal(R.threadHaSospeso(FINITO), false);
  assert.equal(R.threadHaSospeso(null), false);
});

// ── ③ AR-602 · la risposta vecchia sotto il bollino nuovo ───────────────────

prova("AR-602: quando il lavoro finisce, la copia a metà NON comanda più", () => {
  const vivo = { id: "a1", stato: "fatto", updated_at: "2026-08-14T09:05:00.000Z" };
  const cache = { id: "a1", stato: "in_corso", updated_at: "2026-08-14T09:00:00.000Z", richiesta: "d", risultato: "sto scriv" };
  const s = S.qualeRisposta(vivo, cache);
  assert.equal(s.risultato, "", "meglio nessun testo che il testo sbagliato sotto un bollino che dice «Fatto»");
  assert.equal(s.daRileggere, true);
  assert.equal(S.serveRileggereDettaglio(vivo, cache, false), true, "la guardia «ce l'ho già» non blocca più");
  assert.equal(S.serveRileggereDettaglio(vivo, cache, true), false, "…ma una richiesta già in volo non si duplica");
});

// ── ④ IL CABLAGGIO: il modulo è CHIAMATO, non solo scritto ──────────────────
// È la domanda ④ del secondo giro. Un modulo importato e mai chiamato somiglia moltissimo a una
// difesa attiva — ed è esattamente com'era AR-602 prima di questa corsia: la decisione esisteva in
// `stato-card.ts`, con la sua prova verde, e il componente continuava a fare di testa sua.

const CABLAGGI = [
  ["pannello/src/components/LavoriCervello.tsx", "qualeRisposta", 2],
  ["pannello/src/components/LavoriCervello.tsx", "serveRileggereDettaglio", 2],
  ["pannello/src/components/LavoriCervello.tsx", "dettaglioScaduto", 2],
  ["pannello/src/components/ParlaCasella.tsx", "pianoApertura", 2],
  ["pannello/src/lib/parla.ts", "arricchisciPerThread", 2],
  ["pannello/src/app/page.tsx", "arricchisciPerThread", 3],
];

for (const [file, simbolo, minimo] of CABLAGGI) {
  prova(`cablaggio: ${simbolo} è chiamato davvero in ${file.split("/").pop()}`, () => {
    const quante = leggi(file).split(new RegExp(`\\b${simbolo}\\b`)).length - 1;
    assert.ok(
      quante >= minimo,
      `«${simbolo}» compare ${quante} volte: con una sola c'è l'import e il resto è morto`,
    );
  });
}

prova("cablaggio AR-602: la vecchia regola «la copia vince sempre» non esiste più", () => {
  // Si guarda il CODICE, non i commenti: qui sopra il difetto è citato per spiegarlo, e una ricerca
  // ingenua confonderebbe la spiegazione con la malattia.
  const src = E.senzaCommentiNeStringhe(leggi("pannello/src/components/LavoriCervello.tsx"));
  assert.ok(
    !/d\.risultato\s*\?\?\s*lv\.risultato/.test(src),
    "è la riga esatta del difetto: il dato in cache vinceva sempre sul fresco",
  );
  assert.ok(
    !/dettagliLavori\[id\]\?\.richiesta\s*\|\|/.test(src),
    "e questa era la guardia «ce l'ho già, non lo chiedo più» che congelava la risposta",
  );
});

for (const [nome, fn] of daFare) {
  try {
    await fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
}

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
