#!/usr/bin/env node
// AR-401 — «Se la rete cade, la home scrive "Nessun allarme. Tutto ok."»
//
// La Plancia fa sei letture. UNA sola sapeva dire «non lo so» (AR-233, la coda da firmare); le altre
// cinque erano scritte così:
//
//     fetch("/api/alert", { cache: "no-store" }).then((r) => r.json()).then((d) => setAlerts(d.alert || [])).catch(() => {})
//
// Tre bugie in una riga: `r.ok` non viene guardato; una 500 arriva col suo corpo JSON e non fa
// nemmeno scattare il `.catch`; e `|| []` trasforma qualunque buco in una lista vuota. A schermo, su
// un dato MAI letto: «Nessun allarme. Tutto ok.», «Nessuna mossa in agenda.», «Nessuna cosa in
// sospeso.», con i badge a 0. Nicola legge la rassicurazione e ci decide sopra.
//
// Qui NON si cerca un pattern nel sorgente: si ESEGUE la funzione vera (`leggiDato` →
// `verdettoLettura` di pannello/src/lib/verdetto-dato.ts) con una fetch finta che riproduce i casi
// veri — rete caduta, 500 col corpo, `collegato:false`, campo mancante, lista davvero vuota — e si
// controlla che solo l'ULTIMO caso possa rassicurare.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");
// I commenti CITANO il difetto («prima era `.catch(() => {})`»): se li si contasse come codice, il
// test diventerebbe rosso proprio perché il fix è documentato. Si controlla il codice, non la prosa.
const soloCodice = (f) =>
  leggi(f)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((r) => !/^\s*(\/\/|\{?\/\*)/.test(r))
    .join("\n");

const casi = [];
const prova = (nome, fn) => casi.push({ nome, fn });

const M = await import(join(REPO, "pannello/src/lib/verdetto-dato.ts"));

/** Una fetch finta: `come` descrive il guasto da riprodurre. */
function fintaFetch(come) {
  return async () => {
    if (come.lancia) throw new Error(come.lancia);
    return {
      ok: come.status ? come.status < 400 : true,
      status: come.status || 200,
      json: async () => {
        if (come.jsonRotto) throw new Error("Unexpected token < in JSON");
        return come.corpo;
      },
    };
  };
}

const comeAlert = { estrai: (c) => c.alert, cieco: M.collegatoFalso };
const TESTI = { vuoto: "Nessun allarme. Tutto ok." };

// ── il caso che ha rotto ─────────────────────────────────────────────────────
prova("il caso che ha rotto: rete caduta NON può produrre «Nessun allarme. Tutto ok.»", async () => {
  const r = await M.leggiDato("/api/alert", comeAlert, fintaFetch({ lancia: "Failed to fetch" }));
  assert.equal(r.verdetto.stato, "cieco");
  assert.equal(r.verdetto.rassicurante, false, "una lettura non avvenuta non può rassicurare");
  assert.notEqual(M.fraseVuoto(r.verdetto, TESTI), TESTI.vuoto, "la frase deve essere DIVERSA da quella del vuoto vero");
  assert.match(M.fraseVuoto(r.verdetto, TESTI), /non lo so/i);
});

prova("una 500 col suo corpo JSON non fa scattare nessun catch: va vista da `r.ok`", async () => {
  const r = await M.leggiDato("/api/alert", comeAlert, fintaFetch({ status: 500, corpo: { errore: "boom" } }));
  assert.equal(r.verdetto.stato, "cieco", "era il buco che il `.catch(() => {})` non copriva");
  assert.match(r.verdetto.motivo, /500/);
});

prova("la route che dichiara `collegato:false` è cieca, non vuota", async () => {
  // /api/alert torna `{collegato:false, alert:[]}` quando il marketplace non risponde: la lista è
  // vuota per costruzione, non perché non ci siano allarmi. Prima erano indistinguibili.
  const r = await M.leggiDato(
    "/api/alert",
    comeAlert,
    fintaFetch({ corpo: { collegato: false, alert: [], messaggio: "marketplace non collegato" } }),
  );
  assert.equal(r.verdetto.stato, "cieco");
  assert.match(r.verdetto.motivo, /marketplace non collegato/);
});

prova("il campo atteso che non arriva è un contratto rotto, non una lista vuota", async () => {
  const r = await M.leggiDato("/api/alert", comeAlert, fintaFetch({ corpo: { collegato: true } }));
  assert.equal(r.verdetto.stato, "cieco");
});

prova("una risposta illeggibile (HTML di errore al posto del JSON) è cieca", async () => {
  const r = await M.leggiDato("/api/alert", comeAlert, fintaFetch({ jsonRotto: true }));
  assert.equal(r.verdetto.stato, "cieco");
});

prova("e QUI sì: ho letto davvero e non c'era niente → si può rassicurare", async () => {
  const r = await M.leggiDato("/api/alert", comeAlert, fintaFetch({ corpo: { collegato: true, alert: [] } }));
  assert.equal(r.verdetto.stato, "vuoto");
  assert.equal(r.verdetto.rassicurante, true);
  assert.equal(M.fraseVuoto(r.verdetto, TESTI), TESTI.vuoto);
});

prova("dato vero: nessuna delle due frasi, si disegna la lista", async () => {
  const r = await M.leggiDato("/api/alert", comeAlert, fintaFetch({ corpo: { collegato: true, alert: [{ livello: "rosso", titolo: "x" }] } }));
  assert.equal(r.verdetto.stato, "ok");
  assert.equal(r.dato.length, 1);
});

prova("prima di chiedere si è ciechi, non vuoti (il primo render non deve rassicurare)", () => {
  assert.equal(M.VERDETTO_INIZIALE.stato, "cieco");
  assert.equal(M.VERDETTO_INIZIALE.rassicurante, false);
  const { verdetto } = M.verdettoLettura({ esito: M.NON_LETTO, estrai: (c) => c.alert });
  assert.equal(verdetto.stato, "cieco");
});

prova("il badge: su una lettura cieca il numero è «?», non 0", () => {
  const cieco = M.verdettoLettura({ esito: { tipo: "rete", messaggio: "giù" }, estrai: (c) => c.x }).verdetto;
  const vuoto = M.verdettoLettura({ esito: { tipo: "risposta", ok: true, status: 200 }, corpo: { x: [] }, estrai: (c) => c.x }).verdetto;
  assert.equal(M.badgeConteggio(cieco, 0).testo, "?", "uno zero su una lista mai letta è la stessa bugia, in cifre");
  assert.equal(M.badgeConteggio(cieco, 0).incerto, true);
  assert.equal(M.badgeConteggio(vuoto, 0).testo, "0");
});

prova("il semaforo al buio è grigio: non verde (bugia) e non rosso (allarme inventato)", () => {
  const cieco = M.verdettoLettura({ esito: { tipo: "risposta", ok: false, status: 503 }, estrai: (c) => c.x }).verdetto;
  assert.equal(cieco.semaforo, "grigio");
  const ok = M.verdettoLettura({ esito: { tipo: "risposta", ok: true, status: 200 }, corpo: { x: [1] }, estrai: (c) => c.x }).verdetto;
  assert.equal(ok.semaforo, "verde");
});

prova("`collegatoFalso` non è un grimaldello: `collegato:true` e le rotte che non lo usano passano", () => {
  assert.equal(M.collegatoFalso({ collegato: true, alert: [] }), null);
  assert.equal(M.collegatoFalso({ ai: true, maniEmail: false }), null, "/api/cuore non dichiara cecità con `collegato`");
  assert.match(String(M.collegatoFalso({ collegato: false })), /non è collegata/);
});

// ── il cablaggio: le sei letture della home passano TUTTE dal confine ─────────
prova("nella Plancia non è rimasta nessuna fetch che ingoia l'errore", () => {
  const src = soloCodice("pannello/src/components/aree/Plancia.tsx");
  assert.doesNotMatch(src, /\.catch\(\(\) => \{\}\)/, "il `.catch(() => {})` è la firma della malattia");
  assert.doesNotMatch(src, /fetch\("\/api\//, "le letture passano da leggiDato, non da fetch a mano");
  for (const rotta of ["/api/azioni-pronte", "/api/alert", "/api/memoria/todo", "/api/memoria/intenzioni", "/api/ritmo", "/api/consegne"]) {
    assert.ok(src.includes(`leggiDato<`) && src.includes(`"${rotta}"`), `${rotta} non passa dal confine unico`);
  }
});

prova("le tre frasi rassicuranti stanno dietro il bivio, non incondizionate", () => {
  const src = soloCodice("pannello/src/components/aree/Plancia.tsx");
  for (const frase of ["Nessun allarme. Tutto ok.", "Nessuna mossa in agenda.", "Nessuna cosa in sospeso."]) {
    const i = src.indexOf(frase);
    assert.ok(i > 0, `sparita la frase «${frase}»: il test non prova più niente`);
    const intorno = src.slice(Math.max(0, i - 260), i);
    assert.match(intorno, /fraseVuoto\(/, `«${frase}» è ancora stampata senza chiedere se il dato è stato letto`);
  }
  // AR-233 non deve regredire mentre si cura la sorella.
  assert.match(src, /codaCieca/);
  assert.ok(src.includes("codaCieca ? ("), "il pollice in su della coda dev'essere dietro un bivio");
});

prova("la Bacheca non sparisce più in silenzio quando non riesce a leggere", () => {
  const src = soloCodice("pannello/src/components/Bacheca.tsx");
  assert.doesNotMatch(src, /\.catch\(\(\) => \{\}\)/);
  assert.match(src, /if \(avvisi\.length === 0 && verdetto\.misurato\) return null/, "sparire è consentito solo dopo aver guardato");
});

prova("la decisione NON è dentro il componente: sta nel modulo che un test può eseguire", () => {
  const src = leggi("pannello/src/components/aree/Plancia.tsx");
  assert.match(src, /from "@\/lib\/verdetto-dato"/, "il componente deve IMPORTARE la decisione");
  assert.doesNotMatch(src, /export function verdettoLettura/, "e non contenerla");
  const lib = leggi("pannello/src/lib/verdetto-dato.ts");
  assert.doesNotMatch(lib, /from "react"/, "il modulo deve restare eseguibile senza React");
});

let falliti = 0;
for (const c of casi) {
  try {
    await c.fn();
    console.log(`  ok - ${c.nome}`);
  } catch (e) {
    falliti++;
    console.log(`not ok - ${c.nome}\n      ${(e.message || String(e)).split("\n")[0]}`);
  }
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
