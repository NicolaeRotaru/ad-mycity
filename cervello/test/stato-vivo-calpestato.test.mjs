#!/usr/bin/env node
// 🫀 LA MALATTIA: un ripasso periodico si crede più aggiornato di te. (lotto 29)
//
// Quattro difetti del Pannello, una forma sola: un aggiornamento che arriva da fuori (il poller,
// un evento di un'altra superficie, uno snapshot congelato) SOSTITUISCE lo stato che sta vivendo
// sotto gli occhi di Nicola, invece di fondersi con lui. La radice è la mancata distinzione fra
// dato a riposo (rileggibile) e stato transitorio (esiste solo qui, nessuna rilettura lo ricostruisce).
//
// Copre, con un caso dedicato ciascuno:
//   AR-266 · aprire «Parla con questa casella» cancellava da sotto la chat che avevi aperto
//   AR-267 · la risposta in streaming spariva ogni 8s e «Annulla invio» diventava inerte
//   AR-268 · la casella risalvava uno snapshot vecchio e accorciava il thread (anche sul server)
//   AR-269 · la chat dell'Archivio restava alla foto di quando l'avevi aperta
//
// Si esegue la logica vera dei moduli (type-stripping di Node 22), non una copia — compreso il
// `mergeThreadMsgs` reale, quello con dentro il `pulisci()` che ha causato AR-267.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { aggiornamentoPertinente, eVivo, fondiConservandoVivi, fondiLocaliSuServer, separaVivi } = await import(
  join(REPO, "pannello/src/lib/stato-vivo.ts")
);
const { mergeThreadMsgs } = await import(join(REPO, "pannello/src/lib/chat-thread-merge.ts"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── AR-266 ─────────────────────────────────────────────────────────────────────
prova("AR-266: una casella con un thread SUO non scalza la chat aperta", () => {
  // Il caso che ha rotto: l'Assistente mostra conv_A; apri «Parla con questa casella», che appena
  // carica il suo storico pubblica sul bus; il listener non filtrava e adottava conv_B.
  assert.equal(aggiornamentoPertinente("conv_A", "conv_B"), false, "un'altra conversazione non entra");
  assert.equal(aggiornamentoPertinente("conv_A", "conv_A"), true, "la stessa chat su due superfici resta allineata");
  assert.equal(aggiornamentoPertinente(null, "conv_B"), true, "se non ho niente aperto, non ho niente da perdere");
  assert.equal(aggiornamentoPertinente("conv_A", null), false, "un evento senza id non può adottare la mia chat");
});

// ── AR-267 ─────────────────────────────────────────────────────────────────────
prova("AR-267: la bolla in streaming sopravvive al giro di poll", () => {
  // `mergeThreadMsgs` comincia con `pulisci()` — filter(!pending && !prompt) — perché è nata per
  // fondere due thread SALVATI. Passandole lo stato vivo, la risposta in arrivo spariva ogni 8s.
  const aSchermo = [
    { role: "user", content: "quanti ordini?" },
    { role: "assistant", content: "💭 Sto elaborando…", pending: true },
  ];
  const dalServer = [{ role: "user", content: "quanti ordini?" }];

  // Come faceva PRIMA: il merge diretto. Questa riga documenta il difetto ed è la sua misura.
  const comeFacevaPrima = mergeThreadMsgs(aSchermo, dalServer);
  assert.equal(
    comeFacevaPrima.some((m) => m.pending),
    false,
    "il merge nudo scarta la bolla viva: è esattamente il difetto",
  );

  // Come fa ADESSO.
  const ora = fondiConservandoVivi(aSchermo, dalServer, mergeThreadMsgs);
  assert.equal(ora.some((m) => m.pending), true, "la risposta in arrivo resta a schermo");
  assert.equal(ora[ora.length - 1].pending, true, "e resta in coda, dove Nicola la sta leggendo");
});

prova("AR-267: anche la scheda «Prompt pronto» sopravvive a due giri di poll", () => {
  // Effetto a catena del difetto: `annullaInvioInCorso` cerca `messages.find(m => m.pending)` e
  // trovava -1, quindi il bottone «Annulla invio» diventava inerte proprio quando serviva.
  let stato = [
    { role: "user", content: "fammi un prompt" },
    { role: "assistant", content: "…prompt…", prompt: true },
    { role: "assistant", content: "💭 Sto elaborando…", pending: true },
  ];
  const dalServer = [{ role: "user", content: "fammi un prompt" }];
  for (let giro = 0; giro < 2; giro++) stato = fondiConservandoVivi(stato, dalServer, mergeThreadMsgs);
  assert.equal(stato.filter((m) => m.prompt).length, 1, "una scheda prompt, non zero e non due");
  assert.equal(stato.filter((m) => m.pending).length, 1, "«Annulla invio» ha ancora la sua bolla da annullare");
});

prova("AR-267: quando il server porta roba NUOVA, quella entra davvero", () => {
  // Non-vacuità: il fix non deve congelare la chat. La risposta salvata dal server deve comparire.
  const aSchermo = [{ role: "user", content: "ciao" }];
  const dalServer = [
    { role: "user", content: "ciao" },
    { role: "assistant", content: "ciao Nicola" },
  ];
  const ora = fondiConservandoVivi(aSchermo, dalServer, mergeThreadMsgs);
  assert.equal(ora.length, 2, "la risposta del server arriva a schermo");
  assert.equal(ora[1].content, "ciao Nicola");
});

// ── AR-268 ─────────────────────────────────────────────────────────────────────
prova("AR-268: una risposta in ritardo non accorcia il thread cresciuto nel frattempo", () => {
  // `conMio` è congelato all'invio; fra invio e risposta possono passare 5 minuti, e in quel tempo
  // il thread può essere cresciuto (altra scheda, bus, Assistente). Ripartire dallo snapshot
  // cancellava tutto — e la PATCH lato server SOSTITUISCE la colonna, quindi la perdita era durevole.
  const conMio = [{ role: "user", content: "domanda 1" }];
  const cresciutoNelFrattempo = [
    { role: "user", content: "domanda 1" },
    { role: "user", content: "domanda 2 (arrivata dopo)" },
  ];
  const risposta = { role: "assistant", content: "risposta 1" };

  const comeFacevaPrima = [...conMio, risposta];
  assert.equal(comeFacevaPrima.length, 2, "lo snapshot vecchio + risposta ha perso «domanda 2»");

  const ora = mergeThreadMsgs(cresciutoNelFrattempo, [...conMio, risposta]);
  assert.equal(ora.length, 3, "fondendo dallo stato corrente non si perde niente");
  assert.ok(ora.some((m) => m.content.includes("domanda 2")), "il messaggio arrivato nel frattempo è ancora lì");
  assert.ok(ora.some((m) => m.content === "risposta 1"), "e la risposta è arrivata");
});

// ── AR-269 ─────────────────────────────────────────────────────────────────────
prova("AR-269: la chat dell'Archivio si aggiorna senza duplicare", () => {
  // Il seed girava una volta sola nell'inizializzatore di useState. Il commento dichiarava il
  // congelamento come scelta («così un refresh non duplica»): cioè la de-duplicazione era stata
  // risolta spegnendo l'aggiornamento. Con la fusione si ottengono ENTRAMBE le cose.
  const aperta = [
    { role: "user", content: "com'è andata?" },
    { role: "assistant", content: "sto guardando…", pending: true },
  ];
  const lavoriAggiornati = [
    { role: "user", content: "com'è andata?" },
    { role: "assistant", content: "sono arrivati 2 ordini" },
  ];
  const dopo = fondiConservandoVivi(aperta, lavoriAggiornati, mergeThreadMsgs);
  assert.ok(dopo.some((m) => m.content === "sono arrivati 2 ordini"), "la risposta arrivata si vede senza riaprire");
  assert.equal(dopo.filter((m) => m.content === "com'è andata?").length, 1, "e la domanda non si sdoppia");

  // Due giri di seed di fila non devono moltiplicare niente.
  const ancora = fondiConservandoVivi(dopo, lavoriAggiornati, mergeThreadMsgs);
  assert.equal(ancora.filter((m) => m.content === "sono arrivati 2 ordini").length, 1);
});

// ── La regola comune, e la sua non-vacuità ────────────────────────────────────
prova("separaVivi distingue il transitorio dal dato a riposo", () => {
  const { stabili, vivi } = separaVivi([
    { role: "user", content: "a" },
    { role: "assistant", content: "b", pending: true },
    { role: "assistant", content: "c", prompt: true },
  ]);
  assert.equal(stabili.length, 1);
  assert.equal(vivi.length, 2);
  assert.equal(eVivo({ pending: true }), true);
  assert.equal(eVivo({ content: "x" }), false);
});

prova("le voci locali coprono il server finché non concorda, poi si dimenticano (AR-238 lato UI)", () => {
  // La stessa malattia sulla mappa delle risposte: `setRisposte(x.risposte)` sostituiva tutto, e la
  // risposta appena data spariva al primo ripasso.
  const locali = new Map([["q1", { risposta: "sì", at: "ora" }]]);
  const primo = fondiLocaliSuServer({}, locali, (a, b) => a?.risposta === b?.risposta);
  assert.equal(primo.fusa.q1.risposta, "sì", "il server non ce l'ha ancora: vince la locale");
  assert.deepEqual(primo.daDimenticare, [], "e la locale resta a coprire");

  const poi = fondiLocaliSuServer({ q1: { risposta: "sì", at: "prima" } }, locali, (a, b) => a?.risposta === b?.risposta);
  assert.deepEqual(poi.daDimenticare, ["q1"], "server allineato: la copia locale ha finito il suo lavoro");
});

prova("il metro sa dire di SÌ: senza transitori la fusione è quella normale", () => {
  const a = [{ role: "user", content: "x" }];
  const b = [
    { role: "user", content: "x" },
    { role: "assistant", content: "y" },
  ];
  assert.deepEqual(fondiConservandoVivi(a, b, mergeThreadMsgs), mergeThreadMsgs(a, b));
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
