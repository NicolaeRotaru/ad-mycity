#!/usr/bin/env node
// 🔒 LA MALATTIA: la guardia sta sul campanello, non sulla porta. (lotto 29)
//
// Quattro difetti del Pannello, una forma sola: la protezione contro il doppio invio è appesa a
// qualcosa che sta FUORI dall'atto — il nome della decisione, l'attributo `disabled` del bottone,
// un timer nella barra di scrittura — e ogni strada nuova verso lo stesso atto nasce senza.
// È la lezione già pagata: «cercare il fix al CONFINE della creazione, non moltiplicare i lock sui
// punti di ingresso».
//
// Copre, con un caso dedicato ciascuno:
//   AR-229 · approva → rifiuta → approva rieseguiva le mani per davvero (email/payout/merge)
//   AR-259 · un solo invio, due lavori: dopo un timeout si ritentava una scrittura già arrivata
//   AR-260 · due messaggi ravvicinati diventavano due lavori invece di uno che risponde a entrambi
//   AR-261 · dalla finestra video il tasto Invio saltava il `disabled` del bottone
//
// Si esegue la logica vera dei moduli (type-stripping di Node 22), non una copia.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { AttiInVolo, attoGiaAvviato, chiaveCreazioneChat, comeRitentareScrittura, puoInviareChat } = await import(
  join(REPO, "pannello/src/lib/atto-unico.ts")
);

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── AR-229 ─────────────────────────────────────────────────────────────────────
prova("AR-229: la strada approva → rifiuta → approva non riporta l'azione a «da fare»", () => {
  // Il percorso che ha rotto, passo per passo. La guardia esisteva ma solo dentro il ramo
  // `annulla`: era appesa al NOME della decisione invece che allo stato dell'azione.
  let stato = ""; // mai decisa
  assert.equal(attoGiaAvviato(stato), false, "① un'azione mai decisa si può approvare");
  stato = "fatta"; // approvata: le mani si sono mosse
  assert.equal(attoGiaAvviato(stato), true, "② dopo l'esecuzione l'atto è avviato");
  // ③ prima il rifiuto passava lo stesso e scriveva "rifiutata", cancellando la memoria del fatto.
  assert.equal(attoGiaAvviato(stato), true, "③ il RIFIUTO deve trovare la porta chiusa, come l'annulla");
});

prova("AR-229: «rifiutata» resta riapprovabile — ma solo se le mani non si erano mosse", () => {
  // Il caso legittimo che non va rotto: decido di no, poi ci ripenso. Qui l'azione non è mai
  // partita, quindi riapprovarla è giusto.
  assert.equal(attoGiaAvviato("rifiutata"), false);
  assert.equal(attoGiaAvviato(""), false);
  // Tutti gli altri stati sono «già avviata», compresi quelli che sembrano innocui.
  for (const s of ["fatta", "simulata", "coda", "errore", "in_corso"]) {
    assert.equal(attoGiaAvviato(s), true, `lo stato "${s}" significa che qualcosa è già partito`);
  }
});

// ── AR-259 ─────────────────────────────────────────────────────────────────────
prova("AR-259: dopo un TIMEOUT non si ritenta alla cieca — prima si verifica", () => {
  // Il caso che ha rotto: il timeout aborta il fetch lato client dopo 4s, ma la riga a Supabase è
  // arrivata. Ritentare crea il gemello, e Nicola riceve due risposte alla stessa domanda.
  assert.equal(comeRitentareScrittura("timeout"), "verifica");
  assert.equal(comeRitentareScrittura("rete"), "verifica", "una rete caduta non dice se la scrittura è passata");
});

prova("AR-259: 429 è ripetibile, un 4xx stabile no, un 5xx è ambiguo", () => {
  assert.equal(comeRitentareScrittura("rifiuto", 429), "ritenta", "rate limit: respinta PRIMA di scrivere");
  assert.equal(comeRitentareScrittura("rifiuto", 400), "stop", "malformata: ritentare non cambia niente");
  assert.equal(comeRitentareScrittura("rifiuto", 403), "stop", "RLS/permessi: idem");
  assert.equal(comeRitentareScrittura("rifiuto", 500), "verifica", "il server può aver scritto e poi essere caduto");
  assert.equal(comeRitentareScrittura("config"), "stop", "senza chiavi non c'è niente da ritentare");
});

// ── AR-260 ─────────────────────────────────────────────────────────────────────
prova("AR-260: durante la creazione il sistema non è più cieco su se stesso", () => {
  // Prima il lavoro entrava nel registro dei pendenti DOPO che la POST era tornata: nella finestra
  // di volo (quanto la rete, non gli 800 ms del blocco nella barra) un secondo messaggio non
  // trovava niente da sostituire → due lavori.
  const volo = new AttiInVolo(60_000);
  const chiave = chiaveCreazioneChat("conv_1");
  assert.equal(volo.inVolo(chiave, 1000), false, "① niente in volo");
  assert.equal(volo.inizia(chiave, 1000), true, "② il primo invio prende il posto PRIMA della POST");
  assert.equal(volo.inVolo(chiave, 1200), true, "③ il secondo invio, 200 ms dopo, LO VEDE");
  assert.equal(volo.inizia(chiave, 1200), false, "④ e non ne apre un altro in parallelo");
  volo.finisci(chiave);
  assert.equal(volo.inVolo(chiave, 1300), false, "⑤ finita la creazione, il posto è libero");
});

prova("AR-260: conversazioni diverse non si bloccano a vicenda", () => {
  const volo = new AttiInVolo(60_000);
  assert.equal(volo.inizia(chiaveCreazioneChat("conv_1"), 0), true);
  assert.equal(volo.inizia(chiaveCreazioneChat("conv_2"), 0), true, "un'altra chat deve poter partire");
  assert.equal(volo.inizia(chiaveCreazioneChat(null), 0), true, "e anche una chat nuova senza id");
  assert.equal(volo.quanti(0), 3);
});

prova("AR-260: un posto preso e mai liberato scade — un blocco eterno è peggio del doppione", () => {
  // La rete di sicurezza per il `finally` che non gira mai (tab chiusa a metà, crash del render).
  const volo = new AttiInVolo(60_000);
  const chiave = chiaveCreazioneChat("conv_1");
  volo.inizia(chiave, 0);
  assert.equal(volo.inVolo(chiave, 59_000), true, "dentro la finestra il blocco vale");
  assert.equal(volo.inVolo(chiave, 60_000), false, "scaduto: la chat non resta bloccata per sempre");
  assert.equal(volo.inizia(chiave, 60_000), true);
});

// ── AR-261 ─────────────────────────────────────────────────────────────────────
prova("AR-261: mentre l'AD risponde non si invia — da QUALSIASI superficie", () => {
  // La guardia era nel JSX (`disabled={... || chatLoading}`): il gestore del tasto Invio chiama la
  // funzione e l'attributo non lo tocca. Ora la regola sta nella funzione, quindi vale per il
  // bottone, per il tasto Invio, per la finestra video e per quella dello schermo condiviso.
  assert.equal(puoInviareChat({ testo: "ciao", chatLoading: true }), false, "l'AD sta ancora rispondendo");
  assert.equal(puoInviareChat({ testo: "ciao", chatLoading: false }), true);
  assert.equal(puoInviareChat({ testo: "   ", chatLoading: false }), false, "solo spazi non è un messaggio");
  assert.equal(puoInviareChat({ testo: "ciao", bloccato: true }), false, "doppio tap entro 800 ms");
  assert.equal(
    puoInviareChat({ testo: "ciao", destinatarioPresente: false }),
    false,
    "nessun destinatario: non si manda nel vuoto",
  );
});

// ── La prova che la prova non sia vacua ───────────────────────────────────────
prova("il metro sa dire di SÌ: il caso normale passa da tutte e quattro le guardie", () => {
  assert.equal(attoGiaAvviato(""), false);
  assert.equal(comeRitentareScrittura("rifiuto", 429), "ritenta");
  assert.equal(new AttiInVolo().inizia(chiaveCreazioneChat("x"), 0), true);
  assert.equal(puoInviareChat({ testo: "ciao" }), true);
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
