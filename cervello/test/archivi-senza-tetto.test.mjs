#!/usr/bin/env node
// AR-182 · AR-254 — gli archivi senza tetto, e i tetti nell'unità sbagliata.
//
// Una malattia sola: **nessun archivio della macchina ha un tetto, e dove un tetto c'è, è nell'unità
// sbagliata.** O l'archivio si rompe (AR-254), o butta via la cosa sbagliata (AR-182).
//
//   AR-182 — il decadimento delle lezioni era per ESECUZIONE, non per giorno. Lo script è nato come
//     passo di un ciclo settimanale ed è finito in un giro che gira 9 volte al giorno: «−0,15 ogni
//     tanto» è diventato «−1,35 al giorno», e nessuno se n'è accorto perché il codice non era
//     cambiato — era cambiata la frequenza sotto i piedi.
//     Misurato il 28/7, il giorno in cui sarebbe partita: DECAY_DAYS=28 e la lezione più vecchia
//     aveva esattamente 28 giorni. 2 lezioni oltre soglia quel giorno, 17 entro il giorno dopo, 38
//     entro tre giorni; confidenza mediana 0,86 → 4 esecuzioni per scendere sotto 0,3 = **10,7 ore**.
//
//   AR-254 — apprendimento.json misurava 1.111.673 caratteri contro un tetto di lettura di 1.000.000:
//     troncato a metà stringa, JSON.parse falliva, e la scheda Apprendimento restava vuota per sempre.
//     Due scoperte facendo il fix: (a) il tetto era arbitrariamente 48.576 byte SOTTO il vincolo vero
//     di GitHub (1 MiB), cioè aggiungeva un modo di rompersi che non esisteva; (b) la stessa logica di
//     troncamento vive in DUE copie in obsidian.ts, e curarne una sola sarebbe la malattia stessa.
//
// Qui si eseguono le funzioni VERE.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const T = await import(join(REPO, "cervello/tetti-archivio.mjs"));
const V = await import(join(REPO, "cervello/lezione-viva.mjs"));

// La soglia vera del decadimento, la stessa che usa il cristallizzatore.
const SOGLIA_GIORNI = 28;
// ⏰ IL METRO DEL TEMPO È QUELLO DEL CODICE, NON UN SECONDO METRO SCRITTO QUI.
//
// Questa riga usava `Date.parse`, e per questo il file è diventato rosso l'1/9 alle 17:40 senza che
// nessuno lo toccasse. Le due letture dello stesso timbro non coincidono:
//   · `Date.parse("2026-08-04T17:40")` legge l'ora del PROCESSO — su un runner in UTC sono le 17:40
//     di Greenwich, cioè due ore più tardi delle 17:40 di Piacenza che quel timbro significa;
//   · un giorno nudo, `Date.parse("2026-08-04")`, vale mezzanotte UTC, mentre in questa casa un
//     giorno senza ora vale MEZZOGIORNO.
// Misurato su L-2026-0804-555: 27,97 giorni col metro della prova, 28,06 col metro del codice.
// Con la soglia a 28 in mezzo, la prova la dichiarava protetta e il codice la faceva decadere —
// e si accusavano a vicenda per le due ore in cui le due misure stanno a cavallo della soglia.
//
// Il difetto non era da nessuna delle due parti del confronto: era avere due orologi. Adesso ce n'è
// uno, `istante()` di tetti-archivio, lo stesso che usa `passoDovuto` per decidere.
const etaGiorni = (date) => {
  const t = date.map((d) => T.istante(d)).filter((x) => x != null);
  return t.length ? (Date.now() - Math.max(...t)) / 86400000 : Infinity;
};
const P = await import(join(REPO, "cervello/pota-apprendimento.mjs"));
const E = await import(join(REPO, "pannello/src/lib/esito-lettura.ts"));

const GIORNO = 86_400_000;
const fa = (g) => new Date(Date.now() - g * GIORNO).toISOString();

// ── AR-182: il tempo si misura in tempo ──────────────────────────────────────
prova("il caso che ha rotto: nove esecuzioni nello stesso giorno danno UN passo, non nove", () => {
  // Con la logica vecchia una lezione a 0,86 moriva in 4 esecuzioni, cioè in 10,7 ore.
  const ultimaConferma = fa(30);
  let passi = 0;
  let ultimoPasso = null;
  for (let i = 0; i < 9; i++) {
    const r = T.passoDovuto({ ultimaConferma, ultimoPasso });
    if (r.decade) {
      passi++;
      ultimoPasso = new Date().toISOString();
    }
  }
  assert.equal(passi, 1, `nove giri in un giorno devono dare UN passo, non ${passi}`);
});

prova("dopo sette giorni il passo si può ridare: il decadimento non si ferma, rallenta", () => {
  // Un decadimento che non decade mai è un archivio che non invecchia — l'altro estremo.
  const r = T.passoDovuto({ ultimaConferma: fa(30), ultimoPasso: fa(8) });
  assert.equal(r.decade, true, r.motivo);
  const no = T.passoDovuto({ ultimaConferma: fa(30), ultimoPasso: fa(3) });
  assert.equal(no.decade, false, "tre giorni dopo l'ultimo passo è troppo presto");
});

// ── AR-771: le due cose che valgono quanto una riconferma ───────────────────
//
// Il caso vero, misurato il 18/8 quando Nicola ha chiesto l'analisi della potatura: il decadimento
// guardava SOLO da quanto tempo nessuno aveva confermato la lezione. Non guardava se la lezione
// avesse prodotto un freno, né se avesse appena fermato un errore. Conseguenza sul file vero: 63
// delle 75 lezioni con un freno sarebbero morte entro 35 giorni, e con loro tutte quelle con un uso
// registrato — cioè il pezzo che segna «questa regola mi ha fermato» e il pezzo che decide chi resta
// tiravano in direzioni opposte sullo stesso archivio.

prova("una lezione il cui freno monta ancora la guardia non decade, per quanto vecchia sia", () => {
  const r = T.passoDovuto({ ultimaConferma: fa(300), ultimoPasso: fa(90), frenoVivo: true });
  assert.equal(r.decade, false, r.motivo);
  assert.match(r.motivo, /guardia/);
});

prova("…ma se il guardiano non c'è più, torna a invecchiare come tutte: l'immortalità dura quanto la guardia", () => {
  // È il motivo per cui chi chiama deve verificare che il FILE esista, non che la scheda porti
  // scritta una stringa: una stringa non monta la guardia.
  assert.equal(T.passoDovuto({ ultimaConferma: fa(300), ultimoPasso: fa(90), frenoVivo: false }).decade, true);
});

prova("un uso recente vale una riconferma: «nessuno la conferma da 28 giorni» e «mi ha fermato ieri» non stanno insieme", () => {
  const r = T.passoDovuto({ ultimaConferma: fa(300), ultimoPasso: fa(90), ultimoUso: fa(3) });
  assert.equal(r.decade, false, r.motivo);
  assert.match(r.motivo, /usata/);
});

prova("un uso VECCHIO non salva nessuno: vale la data più recente, non il fatto che un uso esista", () => {
  assert.equal(T.passoDovuto({ ultimaConferma: fa(300), ultimoPasso: fa(90), ultimoUso: fa(200) }).decade, true);
});

prova("una riconferma fresca vince su un uso vecchio, e viceversa: conta la più recente delle due", () => {
  assert.equal(T.passoDovuto({ ultimaConferma: fa(3), ultimoPasso: fa(90), ultimoUso: fa(300) }).decade, false);
  assert.equal(T.passoDovuto({ ultimaConferma: fa(300), ultimoPasso: fa(90), ultimoUso: fa(3) }).decade, false);
});

prova("sul file VERO: nessuna lezione con un freno vivo verrebbe messa in fila per morire", () => {
  // Se questo torna rosso, il conto delle lezioni protette è cambiato senza che nessuno lo dicesse.
  const j = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
  const attive = (j.lezioni || []).filter((l) => l && l.stato === "attiva");
  const conFreno = attive.filter((l) => {
    const m = (typeof l.gate === "string" ? l.gate : "").match(/([\w./-]*\/)?([\w.-]+\.(?:m?js|cjs|sh))\b/);
    return m && existsSync(join(REPO, (m[1] || "") + m[2]));
  });
  assert.ok(conFreno.length > 10, `solo ${conFreno.length} lezioni attive hanno un freno vivo: l'aggancio non morde più`);
  const fraCinqueSettimane = Date.now() + 35 * 24 * 3600 * 1000;
  const morirebbero = conFreno.filter(
    (l) => T.passoDovuto({ ultimaConferma: l.ultima_conferma || l.nato, ultimoPasso: l.decaduto_step_il, adessoMs: fraCinqueSettimane, frenoVivo: true }).decade,
  );
  assert.equal(morirebbero.length, 0, `${morirebbero.length} lezioni con un freno vivo morirebbero comunque entro 5 settimane`);
});

prova("sotto la soglia non si decade affatto", () => {
  assert.equal(T.passoDovuto({ ultimaConferma: fa(10) }).decade, false);
  assert.equal(T.passoDovuto({ ultimaConferma: fa(27.9) }).decade, false, "27,9 giorni: ancora dentro");
});

prova("una data illeggibile vale «vecchissima», non «nuova»", () => {
  // Il verso conta: se una data storta valesse «appena confermata», una lezione con il campo rotto
  // non morirebbe mai — e l'archivio crescerebbe di nascosto.
  assert.equal(T.giorniDa("boh"), Infinity);
  assert.equal(T.passoDovuto({ ultimaConferma: null }).decade, true);
});

prova("un'estinzione a blocchi ha un tetto per giro", () => {
  const t = T.tettoDecadutePerGiro(38, 5);
  assert.equal(t.ammesse, 5);
  assert.equal(t.rimandate, 33, "le eccedenti restano attive e riprovano al prossimo giro");
});

prova("il cablaggio: senza `decaduto_step_il` il passo tornerebbe a essere per esecuzione", () => {
  const src = leggi("cervello/cristallizza-apprendimento.mjs");
  assert.match(src, /passoDovuto\(\{/, "deve usare la regola condivisa");
  assert.match(src, /l\.decaduto_step_il = ora/, "senza segnare QUANDO, il passo si ripete a ogni giro");
  assert.match(src, /DECAY_OGNI_GG/);
  assert.doesNotMatch(src, /if \(giorniDa\(l\.ultima_conferma \|\| l\.nato\) > DECAY_DAYS\) \{\n\s*l\.confidenza/, "la logica vecchia, per esecuzione");
});

// AR-861 — 28/8/2026. QUI SI MISURAVA LA POPOLAZIONE DI IERI, NON LA REGOLA.
//
// La prova diceva: «in nove esecuzioni non muore nessuna lezione». Era vero il 28/7, sul file di quel
// giorno. Un mese dopo è rossa con 26 lezioni — e nessuna delle 26 ha un freno, nessuna è stata
// riconfermata o usata da luglio: stanno morendo perché è esattamente il loro mestiere. Una prova che
// vieta al decadimento di decadere non difende la memoria, la congela.
//
// Peggio: la simulazione non passava `frenoVivo` né `ultimoUso`, cioè le DUE cose che AR-771 ha
// aggiunto proprio per non buttare via le lezioni che contano. Misurava una regola più debole di
// quella vera, e nel punto in cui il difetto era già stato curato.
//
// Adesso la prova chiama la regola VERA con gli stessi argomenti del cristallizzatore, e difende
// l'invariante invece del conteggio: una lezione con un freno che monta ancora la guardia, o usata di
// recente, non muore MAI. Quante ne decadono è una misura che si stampa, non un verdetto.
prova("i due orologi sono uno solo: il metro di questa prova coincide con quello del codice", () => {
  // 🔒 IL FRENO DEL DIFETTO QUI SOPRA, e non guarda il sorgente: esegue i due metri e li confronta.
  //
  // Serve un caso DETERMINISTICO, perché il difetto vero non lo era: si vedeva solo nelle due ore in
  // cui una lezione qualunque stava a cavallo dei 28 giorni. Un difetto che compare a ore e sparisce
  // da solo non lo trova nessuno guardando il rosso: lo si trova solo pinzando le due misure.
  //
  // Il giorno NUDO è il caso che nessun fuso può salvare: `Date.parse("2026-08-04")` vale mezzanotte
  // di Greenwich per lo standard, mentre in questa casa un giorno senza ora vale MEZZOGIORNO. Fra i
  // due ci sono dodici ore su qualunque macchina, anche una regolata su Piacenza — quindi se
  // qualcuno rimette `Date.parse` in `etaGiorni`, questo caso diventa rosso ovunque, non solo in UTC.
  for (const timbro of ["2026-08-04", "2026-08-04 17:40", "2026-01-15 09:00"]) {
    const miaEta = etaGiorni([timbro]);
    const suaEta = T.giorniDa(timbro);
    assert.ok(
      Math.abs(miaEta - suaEta) < 1 / 1440,
      `sul timbro «${timbro}» questa prova misura ${miaEta.toFixed(4)} giorni e il codice ne misura ` +
      `${suaEta.toFixed(4)}: sono due orologi diversi, e la soglia dei 28 giorni sta in mezzo`,
    );
  }
  // E la data illeggibile deve valere «vecchissima» per entrambi, non «adesso» per uno dei due.
  assert.equal(etaGiorni(["non-una-data"]), Infinity);
  assert.equal(T.giorniDa("non-una-data"), Infinity);
});

prova("sul file VERO: nessuna lezione con un freno vivo o usata di recente muore", () => {
  const j = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
  const attive = (j.lezioni || []).filter((l) => l && l.stato === "attiva");
  assert.ok(attive.length > 100, "il file vero deve avere lezioni, altrimenti non provo niente");

  const protette = [];
  let decadute = 0;
  for (const l of attive) {
    const frenoVivo = V.frenoVivoDi(l, REPO);
    const ultimoUso = V.ultimoUsoDi(l);
    let passi = 0;
    let ultimo = l.decaduto_step_il || null;
    for (let i = 0; i < 9; i++) {
      if (T.passoDovuto({
        ultimaConferma: l.ultima_conferma || l.nato,
        ultimoPasso: ultimo,
        frenoVivo,
        ultimoUso,
      }).decade) {
        passi++;
        ultimo = new Date().toISOString();
      }
    }
    if (passi === 0) continue;
    decadute++;
    // Chi è protetto non deve aver fatto NEMMENO un passo: se ne fa uno, l'immortalità è finta.
    //
    // Protetto vuol dire due cose diverse, e vanno tenute diverse. Il FRENO VIVO protegge sempre,
    // senza scadenza: finché quel guardiano esiste la regola è in vigore. L'USO invece vale quanto
    // una riconferma, quindi protegge solo dentro la soglia — una lezione usata l'ultima volta a
    // luglio è vecchia come una mai riconfermata, ed è giusto che invecchi.
    const giorniDaAllora = etaGiorni([l.ultima_conferma || l.nato, ultimoUso]);
    const protetta = frenoVivo || giorniDaAllora <= SOGLIA_GIORNI;
    if (protetta) protette.push(`${l.id} (freno=${frenoVivo} · ultima traccia ${giorniDaAllora.toFixed(0)}gg fa)`);
  }

  assert.deepEqual(
    protette,
    [],
    `lezioni protette che invece decadrebbero: ${protette.join(", ")} — è il difetto che AR-771 ha curato, tornato`,
  );
  console.log(`      · in nove giri ${decadute} lezioni su ${attive.length} farebbero almeno un passo di decadimento: nessuna di loro ha un freno vivo o una traccia recente`);
});

// La controprova, senza la quale quella di sopra passa anche con un decadimento spento del tutto:
// una lezione vecchia, senza freno e mai usata, DEVE decadere. Altrimenti l'archivio può solo crescere.
prova("sul file VERO: il decadimento non è fermo — una lezione vecchia e senza freno decade", () => {
  const j = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
  const attive = (j.lezioni || []).filter((l) => l && l.stato === "attiva");
  const decadibili = attive.filter(
    (l) =>
      !V.frenoVivoDi(l, REPO) &&
      !V.ultimoUsoDi(l) &&
      T.passoDovuto({ ultimaConferma: l.ultima_conferma || l.nato, ultimoPasso: l.decaduto_step_il }).decade,
  );
  assert.ok(
    decadibili.length > 0,
    "nessuna lezione decadrebbe mai: il decadimento è fermo e l'archivio può solo crescere",
  );
});

// ── AR-254: un file strutturato non si tronca MAI ────────────────────────────
prova("il caso che ha rotto: un .json oltre il tetto NON viene troncato", () => {
  const v = E.comeServire({ percorso: "a/b/apprendimento.json", lunghezza: 1_111_673, tetto: 1_000_000 });
  assert.equal(v.azione, "troppo-grande", "troncare un JSON non lo degrada: lo distrugge");
  assert.match(v.motivo, /non si tronca/);
});

prova("un .md invece si può troncare: si perde la coda, il resto si legge", () => {
  assert.equal(E.comeServire({ percorso: "x/STATO.md", lunghezza: 2_000_000, tetto: 1_000_000 }).azione, "tronca");
});

prova("entro il tetto si serve intero, qualunque sia il tipo", () => {
  for (const p of ["x.json", "x.md"]) {
    assert.equal(E.comeServire({ percorso: p, lunghezza: 500, tetto: 1_000_000 }).azione, "intero");
  }
});

prova("il cablaggio: ENTRAMBE le copie del troncamento passano dalla stessa regola", () => {
  // Il difetto che questo cantiere insegue da dodici lotti è «il fix applicato a una copia sola».
  // In obsidian.ts la logica di lettura esiste due volte: leggiNota e readNote.
  //
  // AGGIORNATO con AR-449. Prima si contavano DUE chiamate a `comeServire`, una per copia: era il
  // modo di dire «nessuna delle due si è persa per strada». Ora le due copie non ripetono più
  // niente — attraversano `testoDaContents`, che chiama la regola una volta sola per tutti. La
  // condizione «due chiamate» diventava rossa proprio quando la duplicazione spariva davvero, cioè
  // premiava la malattia e puniva la cura. Qui si misura l'invariante vero: nessuna delle due
  // strade legge per conto proprio.
  const src = leggi("pannello/src/lib/obsidian.ts");
  const viaComune = (src.match(/testoDaContents\(/g) || []).length;
  assert.ok(viaComune >= 3, `definizione + due chiamate: attese >= 3 occorrenze di testoDaContents, trovate ${viaComune}`);
  // Nessuno dei DUE lettori decodifica per conto proprio: se lo facesse, tornerebbe ad avere una
  // strada tutta sua — ed è così che una delle due copie resta indietro. (Altrove nel file la
  // decodifica esiste per usi diversi — allegati, scritture — e non riguarda questa regola.)
  for (const nome of ["leggiNota", "readNote"]) {
    const i = src.indexOf(`export async function ${nome}(`);
    assert.ok(i > 0, `${nome} deve esistere`);
    const corpo = src.slice(i, src.indexOf("\n}\n", i));
    assert.doesNotMatch(corpo, /Buffer\.from\(/, `${nome} non deve decodificare da sé: passa da testoDaContents`);
    assert.match(corpo, /testoDaContents\(/, `${nome} deve attraversare la via comune`);
  }
  assert.doesNotMatch(src, /const MAX = 1_000_000;/, "il tetto locale ricopiato");
  // Il tetto non è più il limite di GitHub: da quando esiste la seconda strada (Blobs API) quel
  // limite non ci ferma, e tenere il tetto lì avrebbe rifiutato in casa i file appena scaricati.
  // Resta però un vincolo: dev'essere ALMENO il limite inline, mai sotto.
  const tetto = Function(`"use strict";return (${src.match(/const MAX_LETTURA = ([^;]+);/)[1]})`)();
  assert.ok(tetto >= 1_048_576, `il tetto (${tetto}) non può stare SOTTO il limite inline di GitHub`);
});

prova("«troppo-grande» è uno stato dichiarato, e pesa più di «assente»", () => {
  const src = leggi("pannello/src/lib/obsidian.ts");
  assert.match(src, /"troppo-grande"/, "serve lo stato");
  assert.match(src, /"troppo-grande": 2/, "un file che c'è ed è troppo grosso non è «assente»");
  // Sopra 1 MiB la Contents API torna content vuoto MA con size: leggerlo come «assente» sarebbe
  // dire che un file da 1,1 MB non esiste.
  //
  // AGGIORNATO con AR-449: la condizione non si cerca più come STRINGA nel sorgente — si ESEGUE la
  // decisione. Il 30/7 quella riga c'era, riconosceva il caso, e il Pannello ha mostrato lo stesso
  // «Nessun difetto aperto 👍» per dodici ore: riconoscere non basta se non porta da nessuna parte.
  // Adesso la prova chiede il comportamento: davanti a content vuoto + size, si prende la seconda
  // strada; e se manca pure quella, si DICHIARA troppo-grande. Mai «assente».
  const scelta = E.comeLeggere({ content: "", size: 1_081_370, sha: "abc" });
  assert.equal(scelta.via, "blob", "content vuoto + size valorizzato: il file c'è, va preso dall'altra strada");
  const senzaVia = E.comeLeggere({ content: "", size: 1_081_370, sha: "" });
  assert.equal(senzaVia.via, "troppo-grande", "e se non c'è seconda strada lo si dichiara, non lo si spaccia per assente");
});

prova("la Cabina DICE perché la scheda è vuota, invece di restare vuota", () => {
  const route = leggi("pannello/src/app/api/memoria/auto-coscienza/route.ts");
  assert.match(route, /apprendimento_non_leggibile/, "il motivo dev'essere nella risposta");
  assert.match(route, /leggiJsonConMotivo/);
  const ui = leggi("pannello/src/components/AutoCoscienza.tsx");
  assert.match(ui, /Archivio non leggibile/, "e va mostrato a video");
});

// ── il potatore: si pota il morto, non il vivo ───────────────────────────────
prova("il caso che ha rotto: sul file VERO l'archivio adesso rientra nel tetto", () => {
  const t = leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  assert.ok(t.length <= 1_048_576, `${t.length} caratteri: ancora sopra il tetto di lettura`);
  JSON.parse(t); // deve restare JSON valido: è tutto il difetto
});

prova("le lezioni VIVE non si potano mai, nemmeno per far entrare il file", () => {
  const finto = {
    _nota_servizio_1: "x".repeat(5000),
    _gate_2: "y".repeat(5000),
    _cosa_e: "questo si tiene: spiega il file",
    lezioni: [
      { id: "a", stato: "attiva", testo: "viva" },
      { id: "b", stato: "decaduta", testo: "morta" },
      { id: "c", stato: "principio", testo: "promossa" },
    ],
  };
  const p = P.pianoPotatura(finto, 1_000_000);
  assert.equal(p.lezioni_vive, 2, "attiva e principio restano");
  assert.equal(p.lezioni_decadute, 1);
  assert.deepEqual(
    p.nuovo.lezioni.map((l) => l.id),
    ["a", "c"],
    "solo la decaduta esce",
  );
  assert.equal(p.chiavi_servizio, 2, "_cosa_e si tiene: è la spiegazione del file, non rumore");
  assert.ok(p.nuovo._cosa_e, "…e infatti resta");
});

// ─────────────────────────────────────────────────────────────────────────────
// AR-471 — il potatore misurava un file che non esiste.
//
// Calcolava sempre `JSON.stringify(…, null, 2)`, ma apprendimento.json e' scritto a UNO spazio: su un
// file da un mega sono ~40 KB, il 4% del tetto. Il 31/7 il file reale pesava 1.008.675 byte — 40.000
// sotto il limite — e il potatore diceva «non entra, mancano 129 byte», facendo diventare rosso un
// guardiano su una misura sbagliata. Un verdetto giusto su un oggetto sbagliato resta un verdetto
// sbagliato: e' la stessa malattia del canale muto, vista dall'altro lato.
// ─────────────────────────────────────────────────────────────────────────────

prova("AR-471: l'indentazione si legge dal file, non si suppone", () => {
  assert.equal(P.indentazioneDi('{\n "a": 1\n}'), 1, "un file a uno spazio");
  assert.equal(P.indentazioneDi('{\n  "a": 1\n}'), 2, "un file a due spazi");
  assert.equal(P.indentazioneDi('{"a":1}'), 2, "compatto o illeggibile: torno al default dichiarato");
  assert.equal(P.indentazioneDi(""), 2, "niente da leggere: default, non un errore");
});

prova("AR-471: lo stesso archivio entra a uno spazio e non entra a due — la misura decide il verdetto", () => {
  const dati = { lezioni: Array.from({ length: 400 }, (_, i) => ({ id: `L-${i}`, testo: "x".repeat(120) })) };
  const a1 = P.pianoPotatura(dati, 999_999, 1);
  const a2 = P.pianoPotatura(dati, 999_999, 2);
  assert.ok(a2.dopo > a1.dopo, "due spazi pesano piu' di uno: e' esattamente la differenza che ha ingannato");
  // Il tetto scelto in mezzo ai due: qui la scelta dell'indentazione ribalta il verdetto.
  const tetto = Math.floor((a1.dopo + a2.dopo) / 2);
  assert.equal(P.pianoPotatura(dati, tetto, 1).entra, true, "col metro giusto entra");
  assert.equal(P.pianoPotatura(dati, tetto, 2).entra, false, "col metro sbagliato no");
});

prova("il potatore dice di NO quando non basta, invece di potare il vivo", () => {
  const grosso = { lezioni: Array.from({ length: 50 }, (_, i) => ({ id: `x${i}`, stato: "attiva", testo: "z".repeat(1000) })) };
  const p = P.pianoPotatura(grosso, 1000);
  assert.equal(p.entra, false);
  assert.ok(p.residuo > 0, "deve dire di quanto sfora");
  assert.equal(p.lezioni_vive, 50, "e non deve aver toccato niente di vivo");
});

prova("il potatore gira davvero e non scrive niente senza --applica", () => {
  const prima = leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  execFileSync("node", [join(REPO, "cervello/pota-apprendimento.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  assert.equal(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"), prima, "una lettura non deve scrivere");
});

prova("ciò che è stato tolto resta consultabile: la potatura non è una sparizione", () => {
  const st = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento-potato.json"));
  assert.ok(Array.isArray(st.potature) && st.potature.length > 0, "serve lo storico di cosa è stato tolto");
  const ultima = st.potature[0];
  assert.ok(ultima.byte_prima > ultima.byte_dopo, "e deve dire quanto ha recuperato");
  assert.ok(ultima.quando, "con la data");
});

// ── AR-416: il potatore adesso lo lancia il GIRO — e pota solo quando serve ──────────────────────
//
// La storia: il potatore esisteva, funzionava, e non lo chiamava nessuno («il suo nome non compare
// in nessun giro né in nessuna cadenza» — la scheda lo diceva dal 29/7). L'11/8 il muro è arrivato:
// 1.070.609 > 1.048.576, test rosso in entrambe le case, scheda Apprendimento illeggibile. La cura
// non è la potatura di oggi: è che il giro poti da solo, PRIMA del muro.

prova("AR-416: la soglia preventiva — sotto il 95% del tetto non si pota, sopra sì", () => {
  assert.equal(P.serveOra(900_000, 1_000_000), false, "al 90% non serve: scrivere ogni giro sarebbe rumore");
  assert.equal(P.serveOra(951_000, 1_000_000), true, "sopra il 95% serve: il cuscino esiste per potare PRIMA del muro");
  assert.equal(P.serveOra(1_100_000, 1_000_000), true, "oltre il muro serve comunque");
});

prova("AR-416: --se-serve sotto soglia non scrive un byte (provato sul file vero)", () => {
  const prima = leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  const storicoPrima = leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento-potato.json");
  execFileSync("node", [join(REPO, "cervello/pota-apprendimento.mjs"), "--se-serve"], {
    cwd: REPO,
    encoding: "utf8",
    env: { ...process.env, APPRENDIMENTO_TETTO: "999999999" },
  });
  assert.equal(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"), prima, "sotto soglia il file non si tocca");
  assert.equal(
    leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento-potato.json"),
    storicoPrima,
    "e lo storico non si sporca di potature vuote",
  );
});

prova("AR-416: il cablaggio — il giro lancia il potatore dopo il passo che fa crescere l'archivio", () => {
  const src = leggi("cervello/giro.sh");
  // ⚠️ Questa prova cercava la riga di comando ALLA LETTERA (`pota-apprendimento.mjs" --se-serve`).
  // Il 30/8 la riga è passata alla forma `sensore "pota-apprendimento.mjs" 3 --se-serve`, che è una
  // CURA — cattura l'esito prima di stamparlo, invece di perderlo dentro una pipe (AR-859) — e la
  // prova è diventata rossa per una riscrittura giusta. Una prova che si rompe quando il codice
  // migliora sta guardando come è scritto invece di cosa fa. Adesso cerca il NOME del programma,
  // in qualunque modo lo si chiami, e continua a difendere l'unica cosa che conta qui: l'ORDINE.
  const dove = (programma) => {
    const i = src.indexOf(programma);
    assert.ok(i > 0, `il giro deve lanciare ${programma}`);
    assert.ok(src.indexOf(programma, i + 1) < 0, `${programma} è lanciato più volte: l'ordine non è più una domanda sola`);
    return i;
  };
  const iCrist = dove("cristallizza-apprendimento.mjs");
  const iPota = dove("pota-apprendimento.mjs");
  assert.ok(iPota > iCrist, "il potatore deve girare DOPO la cristallizzazione, dov'è la crescita");
});

// ── LA COPIA, NON LA MEMORIA (4/8) ───────────────────────────────────────────
//
// Il caso vero: l'archivio sforava il tetto di 718 byte e il potatore non aveva niente da togliere
// (0 lezioni decadute su 509). Misurando il file invece di crederci: 86 dei 87 `principi`
// ripetevano parola per parola il testo della lezione con lo stesso id — 98.006 caratteri, 137
// volte lo sforamento. Si toglie il doppione e resta il riferimento: nessuna lezione si perde.
//
// ⚠️ 12/8: questo blocco viveva DOPO il `process.exit` del conteggio — non girava mai, e faceva
// sembrare coperto ciò che non lo era (la frase in fondo a test-cervello, alla lettera). Il
// conteggio ora sta all'ULTIMA riga del file, dopo ogni prova.

const { principiSenzaCopia, pianoPotatura } = await import("../pota-apprendimento.mjs");

{
  const lezioni = [
    { id: "L-1", testo: "la lezione lunga", stato: "principio" },
    { id: "L-2", testo: "un'altra lezione", stato: "attiva" },
  ];
  const principi = [
    { id: "L-1", testo: "la lezione lunga", promosso_il: "2026-07-01", reparto: "tech" },
    { id: "L-9", testo: "un principio senza lezione", promosso_il: "2026-07-02" },
    { id: "L-2", testo: "RISCRITTO dopo la promozione", promosso_il: "2026-07-03" },
  ];
  const r = principiSenzaCopia(principi, lezioni);
  assert.equal(r.quanti, 1, "solo la copia esatta si toglie");
  assert.equal(r.caratteri, "la lezione lunga".length);
  assert.deepEqual(r.principi[0], { id: "L-1", promosso_il: "2026-07-01", reparto: "tech" }, "resta il riferimento: id, data, reparto");
  assert.equal(r.principi[1].testo, "un principio senza lezione", "senza lezione corrispondente NON si tocca: il testo esiste solo lì");
  assert.equal(
    r.principi[2].testo,
    "RISCRITTO dopo la promozione",
    "un principio riscritto dopo la promozione è una versione diversa: toglierlo sarebbe perdere memoria per far entrare un file",
  );
}

{
  // La regola che questa potatura NON deve violare: le lezioni vive restano tutte.
  const dati = {
    lezioni: [{ id: "L-1", testo: "x".repeat(500), stato: "principio" }, { id: "L-2", testo: "y", stato: "attiva" }],
    principi: [{ id: "L-1", testo: "x".repeat(500), promosso_il: "2026-07-01" }],
  };
  const p = pianoPotatura(dati, 10_000_000, 1);
  assert.equal(p.principi_deduplicati, 1);
  assert.equal(p.principi_caratteri_liberati, 500);
  assert.equal(p.nuovo.lezioni.length, 2, "nessuna lezione viva è stata toccata");
  assert.equal(p.nuovo.principi[0].testo, undefined, "il principio ha perso la copia…");
  assert.equal(p.nuovo.lezioni[0].testo, "x".repeat(500), "…e il testo è ancora nella sua lezione");
  assert.ok(p.dopo < p.prima, "il file si è ridotto");
}

{
  // Il freno che tiene onesta la riduzione: se il testo NON è identico, il file non si riduce.
  const dati = {
    lezioni: [{ id: "L-1", testo: "originale", stato: "principio" }],
    principi: [{ id: "L-1", testo: "originale con un'aggiunta", promosso_il: "2026-07-01" }],
  };
  const p = pianoPotatura(dati, 10_000_000, 1);
  assert.equal(p.principi_deduplicati, 0);
  assert.equal(p.dopo, p.prima, "niente da togliere: nessun byte in meno");
}

console.log("✅ la copia dei principi si toglie, la memoria no");

let falliti = 0;
// ── IL DIARIO DENTRO L'ARCHIVIO (AR-886) ─────────────────────────────────────
// Trovato il 30/8, e il modo in cui è saltato fuori conta quanto il difetto: la prova qui sopra
// («sul file VERO l'archivio adesso rientra nel tetto») è diventata ROSSA da sola, senza che
// nessuno toccasse il potatore. Il file aveva sforato di 279 byte.
//
// La causa non era il potatore: era un DIARIO SENZA TETTO dentro un file che il tetto ce l'ha.
// `freno-scattato.mjs` scrive una riga in `lezione.usi` ogni volta che un guardiano diventa rosso,
// e la difesa contro i doppioni guarda (riferimento, minuto): due rossi dello stesso guardiano a
// due minuti di distanza sono due righe. Misurate: tre lezioni ne portavano 42 a testa, quasi tutte
// con lo stesso `ref`. In tutto 300 righe che nessuno legge.
//
// È la stessa malattia di questo file — un archivio che cresce senza tetto — un piano più in
// basso: dentro una voce, invece che dentro il file. E il potatore non poteva farci niente,
// perché pota LEZIONI e qui il peso stava dentro una lezione viva.
const F = await import(join(REPO, "cervello/freno-scattato.mjs"));

prova("AR-886: di uno stesso riferimento restano il primo uso e l'ultimo, non tutti", () => {
  const usi = [];
  for (let i = 0; i < 42; i++) usi.push({ quando: `2026-08-20 10:${String(i).padStart(2, "0")}`, ref: "freno rosso: X" });
  const dopo = F.compattaUsi(usi);
  assert.equal(dopo.length, 2, "quarantadue usi dello stesso riferimento devono restare due");
  assert.equal(dopo[0].quando, "2026-08-20 10:00", "il primo uso dice da quando ci ferma");
  assert.equal(dopo[1].quando, "2026-08-20 10:41", "l'ultimo uso dice se ci ferma ancora");
  // ⚠️ 31/8 — QUESTA RIGA CHIEDEVA IL NUMERO SBAGLIATO, e per un mese l'ha protetto.
  // Chiedeva `volte === 42` su quarantadue usi. Ma `lista[0]` resta IN LISTA: contarlo anche dentro
  // `volte` vuol dire dichiararlo due volte, e siccome si ricompatta a ogni scrittura l'errore si
  // sommava — misurato: ventuno usi veri dichiarati trentadue (AR-898).
  // Il conto vero è la SOMMA di ciò che il diario dichiara: uno per il primo, `volte` per l'ultimo.
  // Chiedere la somma invece del campo è anche più difficile da sbagliare la prossima volta: è la
  // cosa che qualcuno legge, non il modo in cui è ripartita fra due righe.
  const dichiarate = dopo.reduce((n, u) => n + (Number(u?.volte) > 0 ? Number(u.volte) : 1), 0);
  assert.equal(dichiarate, 42, "il conto vero va dichiarato, non fatto sparire — e nemmeno gonfiato");
});

prova("AR-886: riferimenti DIVERSI non si schiacciano fra loro", () => {
  // Il modo sbagliato di curare questo difetto è tenere «gli ultimi due usi» e basta: cancellerebbe
  // i riferimenti vecchi, e `tasso-lezioni` chiede proprio «c'è un uso con QUESTO riferimento?».
  const usi = [
    { quando: "2026-08-01 09:00", ref: "freno A" },
    { quando: "2026-08-02 09:00", ref: "freno B" },
    { quando: "2026-08-03 09:00", ref: "freno C" },
    { quando: "2026-08-04 09:00", ref: "freno C" },
    { quando: "2026-08-05 09:00", ref: "freno C" },
  ];
  const dopo = F.compattaUsi(usi);
  const refs = new Set(dopo.map((u) => u.ref));
  assert.deepEqual([...refs].sort(), ["freno A", "freno B", "freno C"], "un riferimento è sparito");
});

prova("AR-886: i quattro che leggono `usi` trovano ancora quello che cercano", () => {
  const usi = [];
  for (let i = 0; i < 30; i++) usi.push({ quando: `2026-08-2${i % 9} 11:00`, ref: "freno rosso: Y" });
  usi.push({ quando: "2026-07-01 08:00", ref: "un altro freno" });
  const prima = { id: "L-prova", usi };
  const dopo = { id: "L-prova", usi: F.compattaUsi(usi) };
  // ① lezione-viva vuole la data più recente: non deve cambiare.
  assert.equal(V.ultimoUsoDi(dopo), V.ultimoUsoDi(prima), "l'ultimo uso è cambiato: il decadimento userebbe una data sbagliata");
  // ② tasso-lezioni chiede «c'è un uso con questo ref?».
  for (const ref of ["freno rosso: Y", "un altro freno"])
    assert.ok(dopo.usi.some((u) => u.ref === ref), `il riferimento «${ref}» non si trova più`);
  // ③ volano-numeri guarda solo che ce ne sia almeno uno.
  assert.ok(dopo.usi.length > 0, "il diario non deve mai svuotarsi del tutto");
});

prova("AR-886: il cablaggio — il tetto si applica NELLO STESSO gesto della scrittura", () => {
  // Un diario potato «ogni tanto» torna a sforare fra una potatura e l'altra, e lo scopre il
  // potatore quando non può più farci niente: è esattamente com'è andata il 30/8.
  const dati = { lezioni: [{ id: "L-x", gate: "node cervello/finto.mjs", usi: [] }] };
  for (let i = 0; i < 20; i++) {
    F.marcatura(dati, "cervello/finto.mjs", { rc: 1, ref: "freno rosso: Z", quando: `2026-08-20 10:${String(i).padStart(2, "0")}` });
  }
  const usi = dati.lezioni[0].usi;
  if (usi.length === 0) return; // il freno non aggancia questa lezione finta: il caso non dice niente
  assert.ok(usi.length <= 2, `venti scritture hanno lasciato ${usi.length} righe: il tetto non è nel gesto della scrittura`);
});

prova("AR-886: sul file VERO nessuna lezione porta più di due usi dello stesso riferimento", () => {
  const appr = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json"));
  const grasse = [];
  for (const l of appr.lezioni || []) {
    const per = new Map();
    for (const u of l.usi || []) per.set(u?.ref ?? "", (per.get(u?.ref ?? "") ?? 0) + 1);
    for (const [ref, n] of per) if (n > 2) grasse.push(`${l.id} · «${ref}» × ${n}`);
  }
  assert.deepEqual(grasse, [], "il diario è tornato a crescere sul file vero");
});

for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
