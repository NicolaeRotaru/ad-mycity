#!/usr/bin/env node
// AR-288 · AR-621 · AR-622 · AR-623 · AR-407 — cinque modi di raccogliere un dato che non serve a niente.
//
// AR-288 — il voto di fine lavoro era prosa: «9/10», «cancello verde, 9 min». Non si mette in fila
//   con nessun altro, quindi non si può dire se un reparto migliora. Tutti e centoventi i mansionari
//   promettevano una scorecard, e nessuna era confrontabile.
// AR-621 — un reparto con un ESITO fresco e nessuna riga in Sala ha lavorato di nascosto: nessuno può
//   aiutarlo o riusare quello che ha fatto. Ad agosto la Sala è il monologo del direttore.
// AR-622 — la revisione fra pari esiste solo sulla carta: una richiesta in un mese e mezzo, e nessuno
//   ha risposto.
// AR-623 — il quaderno del direttore non entrava in nessuno dei due conti: né fra i 120 (non è un
//   agente) né fra i «fuori roster» (è una deroga dichiarata). Non era vuoto: era invisibile.
// AR-407 — una medicina scritta non è una medicina somministrata: la prova di chiusura guardava il
//   modulo nuovo, mai quanti chiamanti lo usano.
//
// Qui si eseguono le funzioni vere, e dove serve sui file veri della memoria.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const REPO = join(CERVELLO, "..");
const SALA = join(REPO, "MyCity-Vault/90-Memoria-AI/SALA-OPERATIVA.md");

const S = await import(join(CERVELLO, "scorecard-rubrica.mjs"));
const L = await import(join(CERVELLO, "sala-regole.mjs"));
const A = await import(join(CERVELLO, "adozione-medicine.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ─────────────────────── AR-288 · un voto confrontabile ───────────────────────

prova("AR-288: i voti veri trovati nei quaderni sono tutti prosa, e vengono respinti", () => {
  // Sono le stringhe esatte lette in memoria-squadra il 15/8. Nessuna si può aggregare.
  for (const finto of ["9/10", "8/10 chiuso in 20min", "cancello verde, rapporto leggibile 9 min", ""]) {
    assert.equal(S.leggiScorecard(finto).ok, false, `«${finto}» non doveva passare`);
  }
});

prova("AR-288: le due forme ammesse danno lo stesso voto, e i due assi bassi", () => {
  const a = S.leggiScorecard("V5 C4 A5 K5 I3 M4 E4");
  const b = S.leggiScorecard("5/4/5/5/3/4/4");
  assert.equal(a.ok, true);
  assert.deepEqual(a.voti, b.voti, "le due forme devono coincidere, o sono due metri");
  assert.equal(a.media, 4.29);
  assert.deepEqual(a.assi_bassi.map((x) => x.lettera), ["I", "C"], "il più basso per primo");
  // L'ordine in cui li scrivi non cambia il voto: un formato scomodo non viene usato.
  assert.deepEqual(S.leggiScorecard("E4 M4 I3 K5 A5 C4 V5").voti, a.voti);
});

prova("AR-288: un voto fuori scala non passa per buono", () => {
  assert.equal(S.leggiScorecard("V9 C9 A9 K9 I9 M9 E9").ok, false);
});

prova("AR-288: gli assi sono i sette della rubrica di casa, non sei inventati", () => {
  const rubrica = readFileSync(join(REPO, "MyCity-Vault/07-Agenti/RUBRICA-QUALITA.md"), "utf8");
  assert.equal(S.ASSI.length, 7, "la rubrica ne dichiara sette: la scheda del difetto ne chiedeva sei");
  for (const a of S.ASSI) {
    assert.ok(rubrica.includes(`**${a.nome}**`), `l'asse ${a.nome} non è nella rubrica: gli elenchi sono già due`);
  }
});

prova("AR-288: la mano RIFIUTA un voto in prosa, e dice come si scrive", () => {
  let uscita = 0;
  let detto = "";
  try {
    detto = execFileSync("node", [join(CERVELLO, "chiusura-loop.mjs"), "registra", "tech", "prova", "9/10", "1", "1"], {
      cwd: REPO,
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (e) {
    uscita = e.status;
    detto = `${e.stdout || ""}${e.stderr || ""}`;
  }
  assert.equal(uscita, 2, "una registrazione con voto in prosa non deve andare a buon fine");
  assert.match(detto, /non si può confrontare/);
  assert.match(detto, /V<1-5>/, "chi viene respinto deve sapere cosa scrivere");
});

prova("AR-288: la vista per reparto dice anche su quante righe è fatta la media", () => {
  const v = S.aggregaPerReparto([
    { reparto: "tech", scorecard: "V5 C5 A5 K5 I5 M5 E5" },
    { reparto: "tech", scorecard: "V3 C3 A3 K3 I3 M3 E3" },
    { reparto: "tech", scorecard: "andata benissimo" },
  ]);
  assert.equal(v[0].righe, 3);
  assert.equal(v[0].tipizzate, 2, "«media 4» su due righe di tre non è la stessa cosa che su tre di tre");
  assert.equal(v[0].media, 4);
});

// ─────────────────── AR-621 · AR-622 · il canale di squadra ───────────────────

const SALA_FINTA = [
  "- 2026-08-15 06:00 · @ad · FATTO · ho letto tutto",
  "- 2026-08-15 06:45 · @intelligence · FATTO · monitoraggio web",
  "- 2026-08-15 07:00 · @ad · RIVEDI · @finanza — guarda il margine dei 99 euro",
  "- 2026-08-15 08:00 · @ad · FATTO · chiuso il giro",
].join("\n");

prova("AR-621: chi ha un ESITO fresco e non ha scritto in Sala risulta muto", () => {
  const righe = L.righeSala(SALA_FINTA);
  assert.equal(righe.length, 4, "il formato delle righe si legge davvero");
  const muti = L.repartiMuti(righe, ["intelligence", "vendite", "tech", "ad"]);
  assert.deepEqual(muti, ["tech", "vendite"], "intelligence ha parlato, l'ad è escluso apposta");
});

prova("AR-621: il monologo si misura, non si racconta", () => {
  const v = L.concentrazioneVoci(L.righeSala(SALA_FINTA));
  assert.equal(v.dominante, "ad");
  assert.equal(v.quota, 0.75);
  assert.equal(v.voci, 2);
});

prova("AR-622: una RIVEDI senza risposta del destinatario conta come senza risposta", () => {
  const senza = L.revisioniTraPari(L.righeSala(SALA_FINTA));
  assert.equal(senza.richieste, 1);
  assert.equal(senza.senza_risposta, 1);
  // e se il destinatario si fa vivo DOPO, la richiesta risulta servita
  const con = L.revisioniTraPari(
    L.righeSala(`${SALA_FINTA}\n- 2026-08-15 09:00 · @finanza · FATTO · calcolato il margine`),
  );
  assert.equal(con.con_risposta, 1);
  assert.equal(con.senza_risposta, 0);
});

prova("AR-622: sulla Sala vera la revisione fra pari è ferma, e il numero lo dice", () => {
  assert.ok(existsSync(SALA), "senza la Sala vera questa prova non misura niente");
  const peer = L.revisioniTraPari(L.righeSala(readFileSync(SALA, "utf8")));
  assert.ok(peer.richieste >= 1, "una richiesta c'è: se sono zero il lettore delle righe è rotto");
  assert.equal(
    peer.richieste,
    peer.con_risposta + peer.senza_risposta,
    "il conto deve quadrare, o il numero in Cabina è una somma che non torna",
  );
  // Il fatto che AR-622 descrive, misurato adesso e non asserito: una prova che diventa rossa il
  // giorno in cui la squadra migliora è una prova che insegna a non migliorare.
  console.log(`      # Sala vera: ${peer.richieste} richieste di revisione · ${peer.con_risposta} con risposta`);
});

// ───────────────────── AR-623 · il quaderno del direttore ─────────────────────

// La sonda gira in SOLA LETTURA: una prova che sporca la memoria vera fa fallire il giro dopo per un
// motivo che non c'entra con quello che stava misurando.
function sonda() {
  const detto = execFileSync("node", [join(CERVELLO, "chiusura-loop.mjs"), "--sonda", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    stdio: "pipe",
    env: { ...process.env, MYCITY_MEMORIA_SOLA_LETTURA: "1" },
  });
  return JSON.parse(detto);
}

prova("AR-623: il quaderno del direttore è dentro il conto dei quaderni", () => {
  const stato = sonda();
  const ad = stato.quaderni.find((q) => q.reparto === "ad");
  assert.ok(ad, "il quaderno del direttore deve comparire nell'elenco");
  assert.ok(ad.righe_esito > 0, "e con i suoi esiti contati, non a zero");
  assert.equal(ad.deroga, true, "resta marcato per quello che è: non è uno dei 120");
  const roster = stato.quaderni.filter((q) => !q.deroga).length;
  assert.equal(stato.totale, stato.quaderni.length, "il totale deve contare tutte le righe che mostra");
  assert.ok(stato.totale > roster, "se il totale è ancora quello del solo roster, il direttore è di nuovo invisibile");
});

prova("AR-621 · AR-622: la sonda pubblica i due numeri, non li tiene per sé", () => {
  const s = sonda().sala_operativa;
  assert.ok(s && s.misurabile, "senza questo blocco il canale resta senza sensore");
  assert.equal(typeof s.reparti_muti_conteggio, "number");
  assert.equal(typeof s.peer_review.senza_risposta, "number");
  assert.ok(s.quota_voce_dominante > 0, "e la concentrazione delle voci: è il monologo, misurato");
});

// ───────────────────── AR-407 · la medicina somministrata ─────────────────────

prova("AR-407: la copertura conta i chiamanti veri, non l'esistenza del modulo", () => {
  const medicina = { id: "finta", cura: "x", usata: /usaMedicina/, sintomo: /codiceMalato/, dove: [], soglia: 1 };
  const file = [
    { nome: "a.ts", testo: "usaMedicina()" },
    { nome: "b.ts", testo: "codiceMalato()" },
    { nome: "c.ts", testo: "codiceMalato()" },
    { nome: "d.ts", testo: "niente di rilevante" },
  ];
  const c = A.coperturaMedicina(medicina, file);
  assert.equal(c.chiamanti, 1);
  assert.equal(c.scoperti, 2);
  assert.equal(c.copertura, 0.33, "un punto su tre: «modulo scritto» non è «malattia curata»");
  assert.deepEqual(c.punti_scoperti, ["b.ts", "c.ts"], "e l'elenco dei punti da convertire è il lotto dopo");
});

prova("AR-407: la soglia FRENA quando nasce un punto nuovo già malato", () => {
  const medicina = { id: "finta", cura: "x", usata: /usaMedicina/, sintomo: /codiceMalato/, dove: [], soglia: 1 };
  const sani = [{ nome: "a.ts", testo: "usaMedicina()" }];
  assert.equal(A.coperturaMedicina(medicina, sani).peggiorata, false);
  const conNuovoMalato = [...sani, { nome: "nuovo.ts", testo: "codiceMalato()" }];
  assert.equal(
    A.coperturaMedicina(medicina, conNuovoMalato).peggiorata,
    true,
    "la medicina c'era e il punto nuovo non l'ha usata: è il modo in cui i difetti tornano",
  );
});

prova("AR-407: nessun paziente non è un verde", () => {
  const medicina = { id: "finta", cura: "x", usata: /mai/, sintomo: /maiPiu/, dove: [], soglia: 1 };
  const c = A.coperturaMedicina(medicina, [{ nome: "a.ts", testo: "altro" }]);
  assert.equal(c.copertura, null, "zero su zero non è 100%: è «non ho guardato niente»");
  assert.equal(c.peggiorata, false, "e non è nemmeno un rosso: è un ⚪ da dichiarare");
});

prova("AR-407: il comando gira sul repo vero e riporta i punti scoperti", () => {
  const detto = execFileSync("node", [join(CERVELLO, "adozione-medicine.mjs"), "--json"], {
    cwd: REPO,
    encoding: "utf8",
    stdio: "pipe",
  });
  const r = JSON.parse(detto);
  assert.ok(r.medicine.length >= 5, "il registro deve avere le medicine censite");
  assert.ok(
    r.medicine.some((m) => m.chiamanti > 0),
    "se nessuna medicina ha chiamanti, il rilevatore sta guardando nel posto sbagliato",
  );
  assert.equal(typeof r.punti_scoperti_totali, "number");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
