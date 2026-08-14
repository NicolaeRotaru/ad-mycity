#!/usr/bin/env node
// 🔄 LA MALATTIA (corsia 3, lotto 41): «quando mi rileggo» e «cosa dico se non ho potuto leggere»
// sono decisioni che vivono dentro il componente — quindi ogni casella ne ha una sua, la maggioranza
// sceglie «mai», e nessuna delle due si può interrogare.
//
// Copre, con un caso dedicato ciascuno:
//   AR-236 · dieci caselle non si ricaricano mai da sole, nemmeno tornandoci sopra
//   AR-263 · aprendo il quaderno di un senior con la rete che salta si vede un riquadro vuoto
//   AR-408 · al primo avvio e a ogni rilascio il Pannello si ricarica e butta via quello che scrivevi
//
// Due strati: la DECISIONE (si esegue `lib/casella-ricarica.ts` vero) e l'INSTALLAZIONE (si leggono
// i sorgenti veri delle dieci caselle e si conta che la chiamino — la lezione di AR-402).

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "pannello/src/lib/casella-ricarica.ts"));

const leggi = (p) => readFileSync(join(REPO, "pannello/src", p), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// LE DIECI CASELLE nominate dal difetto. Il conto è la prova: se domani una perde il ripasso, questo
// elenco la ritrova. Contarne una sola avrebbe chiuso AR-236 lasciandone nove ferme.
const DIECI = [
  "components/Bacheca.tsx",
  "components/aree/Documenti.tsx",
  "components/Arsenale.tsx",
  "components/Intelligence.tsx",
  "components/Autopilota.tsx",
  "components/LetteraAdCard.tsx",
  "components/NumeriReport.tsx",
  "components/StatoMacchina.tsx",
  "components/Volano.tsx",
  "components/aree/EsploraGitHub.tsx",
];

// ── AR-236 · il ripasso a tempo ───────────────────────────────────────────────
prova("AR-236: nessuna casella può dichiarare «io non ripasso»", () => {
  assert.equal(M.intervalloRipasso(), M.RIPASSO_CASELLA_MS, "senza indicazioni: un minuto");
  assert.equal(M.intervalloRipasso(0), M.RIPASSO_CASELLA_MS, "zero non vale come «mai»");
  assert.equal(M.intervalloRipasso(null), M.RIPASSO_CASELLA_MS);
  assert.equal(M.intervalloRipasso(-5), M.RIPASSO_CASELLA_MS);
  assert.ok(M.intervalloRipasso(1000) >= M.RIPASSO_MINIMO_MS, "e non si martella il server");
  assert.equal(M.intervalloRipasso(120000), 120000, "chi chiede più lento resta più lento");
});

prova("AR-236: tutte e dieci le caselle hanno il ripasso installato, non solo la prima", () => {
  const files = DIECI.map((percorso) => ({ percorso, sorgente: leggi(percorso) }));
  assert.deepEqual(M.caselleSenzaRipasso(files), [], "caselle ancora ferme al solo montaggio");
});

prova("AR-236: il censimento sa dire di no (una casella col solo usePanelSync viene trovata)", () => {
  const finta = [{ percorso: "finta.tsx", sorgente: `useEffect(() => { carica(); }, [carica]);\nusePanelSync(["all"], carica);` }];
  assert.deepEqual(M.caselleSenzaRipasso(finta), ["finta.tsx"], "altrimenti il conto sarebbe verde per costruzione");
});

// ── AR-263 · il terzo stato ───────────────────────────────────────────────────
prova("AR-263: «non ho potuto leggere» e «non c'è niente» sono due schermate diverse", () => {
  const cieca = M.cosaMostrare({ caricando: false, letto: false, vuoto: true, motivo: "il server ha risposto 500" });
  const vuota = M.cosaMostrare({ caricando: false, letto: true, vuoto: true, testoVuoto: "Quaderno non trovato." });

  assert.equal(cieca.stato, "non-letto");
  assert.equal(cieca.rassicurante, false, "una lettura fallita non rassicura mai");
  assert.ok(cieca.messaggio.includes("500"), "e dice PERCHÉ");
  assert.equal(vuota.stato, "vuoto");
  assert.equal(vuota.rassicurante, true);
  assert.notEqual(cieca.messaggio, vuota.messaggio, "le due frasi non possono coincidere: è tutto il difetto");
  assert.notEqual(cieca.messaggio.trim(), "", "e la cieca non può essere il silenzio, che è il vuoto di prima");
});

prova("AR-263: la rotellina viene prima di tutto, il dato quando c'è", () => {
  assert.equal(M.cosaMostrare({ caricando: true, letto: false, vuoto: true }).stato, "carico");
  assert.equal(M.cosaMostrare({ caricando: false, letto: true, vuoto: false }).stato, "dato");
  assert.equal(M.cosaMostrare({ caricando: false, letto: true, vuoto: false }).messaggio, "");
});

prova("AR-263: QuaderniSenior usa la regola su ENTRAMBE le letture (elenco e dettaglio)", () => {
  const src = leggi("components/QuaderniSenior.tsx");
  assert.ok(/cosaMostrare\(/.test(src), "la decisione arriva dal modulo, non dal JSX");
  assert.equal((src.match(/cosaMostrare\(/g) || []).length >= 2, true, "elenco E dettaglio, non solo uno");
  assert.ok(/catch\s*\(/.test(src), "il catch che mancava del tutto");
  assert.ok(/if \(!r\.ok\) throw/.test(src), "e `res.ok`: una 500 arriva col corpo e non fa scattare il catch");
});

// ── AR-408 · la ricarica che butta via la bozza ───────────────────────────────
prova("AR-408: al primo controllo del service worker NON si ricarica", () => {
  const d = M.decidiRicaricaPagina({ controllerPrima: false, lavoroInCorso: false });
  assert.equal(d.azione, "niente", "prima visita: non è un aggiornamento, è l'installazione");
});

prova("AR-408: con un messaggio a metà la ricarica si rimanda, non si esegue", () => {
  assert.equal(M.decidiRicaricaPagina({ controllerPrima: true, lavoroInCorso: true }).azione, "rimanda");
  assert.equal(M.decidiRicaricaPagina({ controllerPrima: true, lavoroInCorso: false }).azione, "ricarica");
});

prova("AR-408: il registro dei gesti in corso è quello che RegisterSW interroga", () => {
  M.azzeraLavoriInCorso();
  assert.equal(M.lavoroInCorso(), false);
  M.segnaLavoroInCorso("chat:assistente", true);
  assert.equal(M.lavoroInCorso(), true);
  assert.equal(M.decidiRicaricaPagina({ controllerPrima: true, lavoroInCorso: M.lavoroInCorso() }).azione, "rimanda");
  M.segnaLavoroInCorso("chat:assistente", false);
  assert.equal(M.lavoroInCorso(), false, "finito il gesto, la ricarica torna libera");
  M.azzeraLavoriInCorso();
});

prova("AR-408: la bozza ripescata non copre MAI quella che stai scrivendo adesso", () => {
  assert.equal(M.bozzaDaRipescare("vecchia", "sto scrivendo"), "sto scrivendo");
  assert.equal(M.bozzaDaRipescare("vecchia", ""), "vecchia");
  assert.equal(M.bozzaDaRipescare(null, ""), "");
  assert.notEqual(M.chiaveBozza("assistente"), M.chiaveBozza("fluttuante"), "una chiave per superficie");
});

prova("AR-408: RegisterSW e la barra di scrittura sono collegati alla regola", () => {
  const sw = leggi("components/RegisterSW.tsx");
  assert.ok(/decidiRicaricaPagina\(/.test(sw), "la decisione non è più nel gestore");
  assert.ok(/serviceWorker\.controller/.test(sw), "la guardia standard che mancava");
  assert.ok(
    sw.indexOf("serviceWorker.controller") < sw.indexOf('register("/sw.js")'),
    "e va letta PRIMA della registrazione, o la domanda non ha più risposta",
  );
  const barra = leggi("components/BarraScritturaChat.tsx");
  assert.ok(/segnaLavoroInCorso\(/.test(barra), "chi scrive dichiara il gesto in corso");
  assert.ok(/chiaveBozza\(/.test(barra) && /sessionStorage/.test(barra), "e la bozza sopravvive alla ricarica");
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
