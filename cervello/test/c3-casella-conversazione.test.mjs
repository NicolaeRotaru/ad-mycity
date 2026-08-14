#!/usr/bin/env node
// 💬 LA MALATTIA (corsia 3, lotto 41): l'identità di una conversazione e la regola con cui si
// aggiorna vivono dentro il componente — così la casella e il suo gemello (l'Assistente) ne hanno
// due versioni diverse, e vince quella sbagliata.
//
// Copre, con un caso dedicato ciascuno:
//   AR-404 · mentre la casella aspetta la risposta, l'Assistente le cancella i messaggi sotto
//   AR-405 · la chat è agganciata al TITOLO: se il testo cambia, la conversazione non si trova più
//
// Si esegue la logica vera (`lib/casella-conversazione.ts`, che dentro usa il `mergeThreadMsgs` e il
// `fondiConservandoVivi` reali) e si controlla che ParlaCasella la chiami davvero.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "pannello/src/lib/casella-conversazione.ts"));

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

// ── AR-405 · l'identità non è il testo mostrato ───────────────────────────────
prova("AR-405: l'AD riscrive il titolo del difetto e la conversazione si ritrova lo stesso", () => {
  // Il caso vero: `Difetto: ${umano.titolo}`, e a ogni radiografia il titolo viene riformulato.
  const prima = M.chiaveConversazione("AR-405", "Difetto: la chat si aggancia al titolo");
  const dopo = M.chiaveConversazione("AR-405", "Difetto: la conversazione non si trova più");
  assert.notEqual(prima, dopo, "il testo mostrato cambia — ed è giusto che cambi");
  assert.equal(M.stessaCasella(prima, dopo), true, "ma è la stessa casella: la chat si ritrova");
  assert.equal(M.idDaChiave(prima), "AR-405");
  assert.equal(M.identitaStabile(prima), true);
});

prova("AR-405: due voci col cominciamento uguale non finiscono più nello stesso thread", () => {
  // Il difetto speculare: i titoli erano tagliati a 50-60 caratteri, quindi collassavano.
  const testo = "Il worker non riparte dopo il riavvio del VPS e resta";
  const a = M.chiaveConversazione("domanda:1", `Domanda: ${testo}`);
  const b = M.chiaveConversazione("domanda:2", `Domanda: ${testo}`);
  assert.equal(M.stessaCasella(a, b), false, "stesso testo, caselle diverse: thread diversi");
});

prova("AR-405: senza id si ricade sul comportamento di prima, e lo si sa dire", () => {
  const senza = M.chiaveConversazione(undefined, "Ultimo briefing");
  assert.equal(senza, "💬 Ultimo briefing", "identica alla chiave storica: nessuna chat si perde");
  assert.equal(M.identitaStabile(senza), false, "ma non è stabile, e la funzione non lo nasconde");
});

prova("AR-405: la migrazione ripesca la chat vecchia e chiede di rinominarla", () => {
  const elenco = [
    { id: "7", titolo: "💬 Difetto: vecchio testo", messaggi: [{ role: "user", content: "ciao" }] },
    { id: "9", titolo: "💬 Altra cosa ⟨#AR-999⟩", messaggi: [] },
  ];
  const t = M.trovaConversazione(elenco, "AR-405", "Difetto: vecchio testo");
  assert.ok(t, "la chat avuta col titolo vecchio si trova ancora");
  assert.equal(t.convId, "7");
  assert.equal(t.daMigrare, true, "e va risalvata col titolo nuovo, o si perde alla prossima riscrittura");

  const elencoNuovo = [{ id: "7", titolo: "💬 Difetto: testo riscritto ⟨#AR-405⟩", messaggi: [] }];
  const t2 = M.trovaConversazione(elencoNuovo, "AR-405", "Difetto: tutt'altro testo");
  assert.equal(t2.convId, "7", "trovata per identità, col titolo completamente cambiato");
  assert.equal(t2.daMigrare, false, "e non c'è niente da migrare");
  assert.equal(M.trovaConversazione([], "AR-405", "x"), null, "elenco vuoto: nessuna invenzione");
});

prova("AR-405: ParlaCasella accetta l'identità e la usa al posto del titolo", () => {
  const src = leggi("components/ParlaCasella.tsx");
  assert.ok(/idCasella/.test(src), "la prop c'è");
  assert.ok(/chiaveConversazione\(idCasella, titolo\)/.test(src), "la chiave viene dalla regola");
  assert.ok(!/const chiaveTitolo = `💬 \$\{titolo\}`/.test(src), "e non più dal solo testo mostrato");
  assert.ok(/trovaConversazione\(/.test(src), "la ricerca sul server passa dalla regola (server e locale)");
});

prova("AR-405: i punti di innesto passano l'identità, non solo il titolo tagliato", () => {
  // Se ne restasse indietro uno, quella casella continuerebbe a perdere la chat: contarli è la prova.
  const scoperti = [];
  const files = [
    "components/AutoCoscienza.tsx",
    "components/cervello/RadiografiaDiSe.tsx",
    "components/cervello/SchedaProblema.tsx",
    "components/GovernoAD.tsx",
    "components/aree/Azioni.tsx",
    "components/Bacheca.tsx",
    "components/Intelligence.tsx",
    "components/StatoNumeriVault.tsx",
    "components/MemoriaViva.tsx",
    "components/Modulo.tsx",
    "components/QuaderniSenior.tsx",
    "components/ScoperteProposte.tsx",
    "components/DirettaContenuti.tsx",
    "components/aree/Plancia.tsx",
    "components/aree/Storico.tsx",
    "components/cervello/RadiografiaMarketplace.tsx",
  ];
  for (const f of files) {
    const src = leggi(f);
    const innesti = (src.match(/<ParlaCasella\b/g) || []).length;
    const conId = (src.match(/idCasella=/g) || []).length + (src.match(/parlaId=/g) || []).length;
    if (innesti > conId) scoperti.push(`${f} (${conId}/${innesti})`);
  }
  assert.deepEqual(scoperti, [], `caselle ancora identificate dal solo testo: ${scoperti.join(" · ")}`);
});

// ── AR-404 · l'aggiornamento che cancella i messaggi sotto ────────────────────
prova("AR-404: la bolla «sto elaborando» sopravvive a un evento del bus più corto", () => {
  const correnti = [
    { role: "user", content: "che ne pensi?" },
    { role: "assistant", content: "💭 Sto elaborando la risposta…", pending: true },
  ];
  const dallEvento = [{ role: "user", content: "che ne pensi?" }];
  const fusi = M.fondiThreadCasella(correnti, dallEvento);
  assert.ok(
    fusi.some((m) => m.pending),
    "la bolla viva esiste SOLO qui: nessuna rilettura la ricostruisce, quindi nessuno può cancellarla",
  );
  assert.ok(fusi.some((m) => m.role === "user" && m.content === "che ne pensi?"), "e il messaggio resta");
});

prova("AR-404: un evento che arriva senza messaggi non svuota il thread", () => {
  const correnti = [
    { role: "user", content: "uno" },
    { role: "assistant", content: "due" },
  ];
  const fusi = M.fondiThreadCasella(correnti, []);
  assert.equal(fusi.length, 2, "sostituire con il vuoto era esattamente il difetto");
});

prova("AR-404: un evento di un'ALTRA conversazione viene rifiutato", () => {
  const mia = M.chiaveConversazione("AR-404", "Difetto: i messaggi spariscono");
  // stessa casella, ma un thread diverso: è il caso curato sull'Assistente e mai portato qui
  assert.equal(M.accettaEventoBus({ chiaveMia: mia, convIdMio: "42", evento: { titolo: mia, convId: "77" } }), false);
  assert.equal(M.accettaEventoBus({ chiaveMia: mia, convIdMio: "42", evento: { titolo: mia, convId: null } }), false);
  assert.equal(M.accettaEventoBus({ chiaveMia: mia, convIdMio: "42", evento: { titolo: mia, convId: "42" } }), true);
  assert.equal(
    M.accettaEventoBus({ chiaveMia: mia, convIdMio: null, evento: { titolo: mia, convId: "42" } }),
    true,
    "senza una chat aperta non ho niente da perdere: accetto",
  );
  assert.equal(
    M.accettaEventoBus({ chiaveMia: mia, convIdMio: null, evento: { titolo: "💬 Un'altra ⟨#AR-999⟩", convId: "42" } }),
    false,
    "e un evento di un'altra casella non entra comunque",
  );
});

prova("AR-404: ParlaCasella fonde invece di sostituire", () => {
  const src = leggi("components/ParlaCasella.tsx");
  assert.ok(/accettaEventoBus\(/.test(src), "il doppio cancello — identità e pertinenza — è installato");
  assert.ok(/fondiThreadCasella\(/.test(src), "e l'aggiornamento si fonde");
  assert.ok(
    !/setMsgs\(det\.messaggi as ParlaMsg\[\]\)/.test(src),
    "la sostituzione integrale non deve più esistere in questo file",
  );
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
