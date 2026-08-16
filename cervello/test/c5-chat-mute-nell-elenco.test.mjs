#!/usr/bin/env node
// LOTTO 44, CORSIA 5 — LE CHAT CHE SPARISCONO QUANDO L'ELENCO ARRIVA MUTO.
//
// Due difetti, una radice sola: l'elenco dei lavori gira leggero apposta (niente domanda, niente
// risposta — sulle chat sono 9,8 KB a riga, ogni otto secondi), e le due funzioni che ricostruiscono
// le conversazioni da quelle righe non dichiaravano mai di essere a corto di dati.
//
//   ① AR-715 — la chat SPARISCE dall'elenco. Il Worker aggiunge le conversazioni che vivono solo
//      nei lavori, ma prima pretende di trovare almeno un messaggio di Nicola. Dopo un
//      ricaricamento nessuna riga porta il testo, quindi non ne trova nessuno e salta il gruppo: la
//      conversazione esiste, il nome è pure noto, e dall'elenco è sparita.
//   ② AR-716 — il thread si ACCORCIA in silenzio. La fusione «salvati + ricostruiti dai lavori»
//      tornava il solo thread salvato, senza distinguere «non c'era niente in più» da «non ho
//      potuto leggere»: a schermo «0 messaggi» sotto una chat che ne ha sei.
//
// La cura sta in `pannello/src/lib/testi-elenco.ts`: il buco si dichiara, il gruppo resta, e la
// dichiarazione ha un destinatario — il precarico, che la pagina fa una volta sola fuori dal
// disegno. Qui sotto la si fa girare per davvero.
//
// Si lancia con: node cervello/test/c5-chat-mute-nell-elenco.test.mjs

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// AR-156 — i moduli del Pannello si importano fra loro senza estensione: il risolutore va
// registrato anche qui, o questo file lanciato da solo non partirebbe (che somiglia troppo a un
// test che non c'è).
register("./risolvi-ts.mjs", import.meta.url);

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const T = await import(join(REPO, "pannello/src/lib/testi-elenco.ts"));
const G = await import(join(REPO, "pannello/src/lib/lavori-gruppo.ts"));

const leggi = (p) => readFileSync(join(REPO, p), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// Com'è fatta DAVVERO una riga che arriva dall'elenco dopo un ricaricamento: niente `richiesta`,
// niente `risultato`. Non è un finto comodo — sono esattamente le colonne della select leggera.
const MUTA = {
  id: "chat-1",
  created_at: "2026-08-14T09:00:00.000Z",
  updated_at: "2026-08-14T09:00:30.000Z",
  stato: "fatto",
  tipo: "chat",
  gruppo_id: "g1",
};

// La stessa riga come arriva quando il testo c'è (lettura per id, oppure lavoro ancora in corso).
const PIENA = {
  ...MUTA,
  richiesta: "## Nuovo messaggio di Nicola\nquanti ordini abbiamo fatto ieri?",
  risultato: "Ieri quattro ordini, tutti da Pane Quotidiano.",
};

// ── ① AR-715 · la chat non sparisce dall'elenco ─────────────────────────────

prova("AR-715 IL DIFETTO: da righe mute non si ricostruisce nessun messaggio di Nicola", () => {
  const msgs = G.messaggiDaGruppo([MUTA]).filter((m) => !m.pending);
  assert.equal(msgs.length, 0, "se questo non è zero il caso non riproduce più il difetto");
  assert.ok(
    !msgs.some((m) => m.role === "user" && m.content.trim()),
    "era la condizione con cui il vecchio codice saltava il gruppo",
  );
});

prova("AR-715 LA CURA: il gruppo-chat con righe mute RESTA nell'elenco", () => {
  const e = T.esitoGruppoChat([MUTA]);
  assert.equal(e.tieni, true, "la conversazione esiste: sparire è peggio che essere incompleta");
  assert.equal(e.incompleto, true, "…e si dichiara incompleta, invece di far finta di essere vuota");
});

prova("AR-715: un gruppo con la sua chat intera resta, e non è incompleto", () => {
  const e = T.esitoGruppoChat([PIENA]);
  assert.equal(e.tieni, true);
  assert.equal(e.incompleto, false);
  assert.ok(
    e.messaggi.some((m) => m.role === "user" && m.content.includes("ordini")),
    "i messaggi ricostruiti devono esserci davvero, non solo il permesso di tenerli",
  );
});

prova("AR-715 LA MISURA DEL DANNO: il vecchio filtro scartava ESATTAMENTE le chat mute", () => {
  // Scoperto provando, non ragionando: una riga di chat che porta la sua richiesta produce SEMPRE
  // almeno la bolla di Nicola — anche quando il testo è solo un segnaposto. Quindi il vecchio
  // controllo «non trovo nessun messaggio dell'utente» era vero SOLO sulle righe mute. Dopo un
  // ricaricamento sono mute tutte: il filtro non scartava i gruppi vuoti, scartava l'intero elenco.
  const conVoce = (righe) => G.messaggiDaGruppo(righe).some((m) => m.role === "user" && m.content.trim());
  assert.equal(conVoce([PIENA]), true, "con la richiesta la voce di Nicola c'è sempre");
  assert.equal(conVoce([MUTA]), false, "senza richiesta non c'è mai");
  const conRichiestaSenzaTesto = { ...MUTA, id: "v1", stato: "annullato", richiesta: "# solo un'intestazione" };
  assert.equal(conVoce([conRichiestaSenzaTesto]), true, "anche una richiesta senza testo produce il segnaposto");
});

prova("AR-715: senza nemmeno un lavoro di chat non si mette niente nell'elenco", () => {
  assert.equal(T.esitoGruppoChat([]).tieni, false);
  assert.equal(T.esitoGruppoChat(null).tieni, false);
});

prova("AR-715: un gruppo che non è una chat non entra comunque nell'elenco delle conversazioni", () => {
  const giro = { ...MUTA, id: "giro-1", tipo: "giro" };
  assert.equal(T.esitoGruppoChat([giro]).tieni, false);
  assert.equal(T.eGruppoChat([giro]), false);
});

// ── ② AR-716 · il thread dichiara quanto è completo ─────────────────────────

const SALVATI = [
  { id: "s1", role: "user", content: "ciao" },
  { id: "s2", role: "assistant", content: "eccomi" },
];

prova("AR-716 LA CURA: con righe mute il thread si dichiara INCOMPLETO", () => {
  const t = T.threadDiLista(SALVATI, [MUTA]);
  assert.equal(t.incompleto, true, "«meno messaggi» qui vuol dire «non li ho potuti leggere»");
  assert.equal(t.messaggi.length, 2, "e intanto quello che era salvato non si perde: mai peggio di prima");
});

prova("AR-716: con le righe piene il thread è completo e cresce", () => {
  const t = T.threadDiLista(SALVATI, [PIENA]);
  assert.equal(t.incompleto, false);
  assert.ok(t.messaggi.length > 2, `i messaggi dei lavori devono entrare nel thread (sono ${t.messaggi.length})`);
});

prova("AR-716: senza nessun lavoro il thread salvato è completo — nessun falso allarme", () => {
  const t = T.threadDiLista(SALVATI, []);
  assert.equal(t.incompleto, false);
  assert.deepEqual(t.messaggi, SALVATI);
});

prova("AR-716: a schermo lo zero di un buco diventa tre puntini, non uno zero", () => {
  assert.equal(T.conteggioMessaggiDaMostrare(0, true), "…", "«0 messaggi» sarebbe un'affermazione falsa");
  assert.equal(T.conteggioMessaggiDaMostrare(0, false), "0", "una chat vuota davvero è zero, e va detto");
  assert.equal(T.conteggioMessaggiDaMostrare(3, true), "3");
  assert.equal(T.conteggioMessaggiDaMostrare(3, false), "3");
});

// ── ③ La dichiarazione ha un destinatario: il precarico ─────────────────────

prova("il precarico chiede esattamente le righe mute delle chat", () => {
  const ids = T.idsDaPrecaricareInElenco([MUTA]);
  assert.deepEqual(ids, ["chat-1"], "sono le righe che non possono ricostruire niente");
});

prova("il precarico non chiede niente quando il testo c'è già", () => {
  assert.deepEqual(T.idsDaPrecaricareInElenco([PIENA]), []);
});

prova("il precarico non chiede due volte la stessa riga — otto secondi di poll non diventano un fiume", () => {
  const gia = new Set(["chat-1"]);
  assert.deepEqual(T.idsDaPrecaricareInElenco([MUTA], {}, gia), []);
});

prova("il precarico ignora i gruppi che non sono conversazioni", () => {
  const giro = { ...MUTA, id: "giro-2", tipo: "giro", gruppo_id: "g9" };
  assert.deepEqual(T.idsDaPrecaricareInElenco([giro]), []);
});

prova("il precarico ha un tetto: non si chiede un archivio intero in un colpo", () => {
  const tante = Array.from({ length: 90 }, (_, i) => ({ ...MUTA, id: `c${i}`, gruppo_id: `g${i}` }));
  const ids = T.idsDaPrecaricareInElenco(tante);
  assert.equal(ids.length, T.MAX_PRECARICO, `chieste ${ids.length} righe in un colpo solo`);
});

prova("LA STORIA VERA: ricaricata la pagina, la chat c'è, si dichiara incompleta e chiede il suo testo", () => {
  // Tre righe di due conversazioni, come arrivano dall'elenco dopo un F5: tutte mute.
  const elenco = [
    { ...MUTA, id: "a1", gruppo_id: "conv-A" },
    { ...MUTA, id: "a2", gruppo_id: "conv-A" },
    { ...MUTA, id: "b1", gruppo_id: "conv-B" },
  ];
  const gruppi = G.raggruppaLavori(elenco, {});
  assert.equal(gruppi.length, 2, "due conversazioni, non tre");
  for (const g of gruppi) {
    const e = T.esitoGruppoChat(g.lavori);
    assert.equal(e.tieni, true, `la conversazione ${g.id} è sparita dall'elenco`);
    assert.equal(e.incompleto, true, `la conversazione ${g.id} non ha dichiarato il buco`);
  }
  assert.deepEqual(T.idsDaPrecaricareInElenco(elenco).sort(), ["a1", "a2", "b1"]);
});

// ── ④ IL CABLAGGIO: la pagina CHIAMA il modulo, non lo importa e basta ──────
// È la domanda ④ del secondo giro. Un modulo importato e mai chiamato somiglia moltissimo a una
// difesa attiva — ed è già successo in casa (AR-602).

const CABLAGGI = [
  ["pannello/src/app/page.tsx", "esitoGruppoChat", 2],
  ["pannello/src/app/page.tsx", "threadDiLista", 2],
  ["pannello/src/app/page.tsx", "idsDaPrecaricareInElenco", 2],
  ["pannello/src/app/page.tsx", "conteggioMessaggiDaMostrare", 3],
];

for (const [file, simbolo, minimo] of CABLAGGI) {
  prova(`cablaggio: ${simbolo} è chiamato davvero nella pagina`, () => {
    const quante = leggi(file).split(new RegExp(`\\b${simbolo}\\b`)).length - 1;
    assert.ok(quante >= minimo, `«${simbolo}» compare ${quante} volte: con una sola c'è l'import e il resto è morto`);
  });
}

prova("cablaggio: TUTTE le porte che riscrivono l'elenco passano dal precarico", () => {
  // Domanda ⑥ del mansionario: «quali cancelli eredita il canale nuovo?». Le porte che riscrivono
  // la lista dei lavori sono DUE — il poll e «Carica altro archivio» — e la seconda buttava via i
  // testi appena letti senza rileggerli mai più, perché le righe risultavano già chieste.
  const src = leggi("pannello/src/app/page.tsx");
  const quante = src.split(/\bprecaricaTestiDelleChat\b/).length - 1;
  assert.ok(quante >= 3, `il precarico compare ${quante} volte: serve la definizione più le DUE porte`);
  assert.ok(
    !/const conNomi: Lavoro\[\] = d\.lavori\.map\(\(l: Lavoro\) =>\s*\n\s*nomiLavoriRef\.current\[l\.id\] \?/.test(src),
    "era la riga esatta: «Carica altro» sostituiva le righe con quelle mute e perdeva i testi",
  );
});

prova("cablaggio AR-715: la vecchia regola che faceva sparire la chat non esiste più", () => {
  const src = leggi("pannello/src/app/page.tsx");
  assert.ok(
    !/if\s*\(!msgs\.some\(\(m\) => m\.role === "user" && m\.content\.trim\(\)\)\) continue;/.test(src),
    "è la riga esatta del difetto: con le righe mute saltava ogni conversazione",
  );
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
