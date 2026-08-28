#!/usr/bin/env node
// 🕯️ AR-791 — I DUE METRI DELL'ONESTÀ DEVONO DIRE LA STESSA COSA.
//
// IL DIFETTO. Il metro dell'onestà ha due esecutori: `cervello/onesta-check.mjs` (Node, sul VPS,
// giudica la memoria che il giro pubblica) e `pannello/src/lib/onesta-check.ts` (dentro il Pannello
// su Vercel, giudica la mail che sta per partire verso un cliente vero). Portavano le stesse
// espressioni COPIATE a mano. In un lotto precedente l'ambito ristretto e le esenzioni dichiarate
// sono atterrati solo nel primo: da allora le due divergevano in silenzio — la malattia
// `una-parola-con-due-padroni`.
//
// PERCHÉ NON C'È UNA CASA SOLA (due muri misurati, non supposti):
//   ① il Pannello si costruisce su Vercel con Root Directory = `pannello` (pannello/README.md:54):
//      al build `cervello/` non esiste, quindi il Pannello non può importare da lì senza rompere il deploy;
//   ② il metro del cervello deve girare in un clone PARZIALE (solo `onesta-check.mjs` +
//      `onesta-ambito.mjs`) — lo pretende `quarto-controllo-promesso.test.mjs`, che copia esattamente
//      quei due file in una cartella temporanea: un import da `pannello/` lì non si risolve.
//
// QUINDI QUESTA PROVA È IL PERNO. Non descrive le regole: le CONFRONTA come stringhe e le ESEGUE
// sugli stessi testi. Il giorno che una delle due cambia senza l'altra, questa diventa rossa.
//
// La differenza che RESTA, ed è voluta: il profilo del canale. Sulla memoria vale «ogni numero porta
// la sua fonte»; sulla lettera al cliente vale «ogni CLAIM porta la sua fonte» — perché i marcatori
// di fonte che la regola cerca (fonte:, supabase, stripe) sono vocabolario interno e in una mail non
// ci possono stare. Non è una divergenza fra le due copie: è un parametro, e lo scelgono entrambe
// allo stesso modo (`regolePer("lettera")`).

import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const cervello = await import(join(REPO, "cervello", "onesta-check.mjs"));
const pannello = await import(join(REPO, "pannello", "src", "lib", "onesta-check.ts"));

// ─────────────────────────────────────────────────────────────────────────────
// ① LE REGOLE: stesse stringhe, stesso ordine, stessi flag
// ─────────────────────────────────────────────────────────────────────────────

test("AR-791: le due metà portano la STESSA tabella di regole, campo per campo", () => {
  const a = cervello.SORGENTI_REGOLE.map((r) => ({ ...r }));
  const b = pannello.SORGENTI_REGOLE.map((r) => ({ ...r }));
  assert.ok(a.length >= 10, `la tabella del cervello deve essere piena, invece ha ${a.length} voci`);
  assert.deepEqual(
    b,
    a,
    "una regola è cambiata da un lato solo: è esattamente il modo in cui i due metri si sono staccati la prima volta",
  );
});

test("AR-791: il profilo del canale clienti è lo stesso oggetto nei due mondi", () => {
  // ⚠️ QUESTA PROVA GUARDA L'INVARIANTE, NON LA POLITICA — ed è una correzione pagata.
  // Com'era scritta prima, questa riga diceva `assert.equal(…numeri, "solo-claim")`: cioè fissava
  // la SCELTA di allentare il metro. Il 28/8 Nicola ha scelto il contrario, e la prova è diventata
  // rossa pur essendo il codice sano. Una prova che si rompe quando cambia una decisione (e non
  // quando torna un difetto) è la malattia AR-787 — «prove verdi solo finché il difetto c'è».
  // Quello che AR-791 difende non è QUALE profilo si usa: è che i due mondi ne usino UNO SOLO.
  assert.deepEqual(pannello.regolePer("lettera"), cervello.regolePer("lettera"));
  // E i profili storici non si sono mossi: questa prova non doveva toccare la memoria né gli audit.
  assert.equal(cervello.regolePer("contenuto").numeri, true);
  assert.equal(cervello.regolePer("audit").numeri, false);
});

test("AR-791: il Pannello serve UN canale solo, e lo dice invece di far finta", () => {
  assert.throws(() => pannello.regolePer("audit"), /un canale solo/i);
});

// ─────────────────────────────────────────────────────────────────────────────
// ② IL VERDETTO: stesso testo → stessa risposta dalle due parti
// ─────────────────────────────────────────────────────────────────────────────

/** Il verdetto ridotto a ciò che DECIDE: cosa è stato bocciato e con quale esempio. */
function verdetto(esito) {
  return {
    numeri: esito.regole_applicate.numeri,
    violazioni: esito.violazioni
      .map((v) => ({ tipo: v.tipo, regola: v.regola, esempi: [...v.esempi].sort() }))
      .sort((x, y) => (x.tipo + x.regola).localeCompare(y.tipo + y.regola)),
  };
}

// Testi veri da un canale vero: sono le mail che il Pannello manda o si rifiuta di mandare.
const BANCO = [
  ["orari di apertura", "Ciao! Da sabato 21 agosto siamo aperti dalle 9:00 alle 13:00. Ti aspettiamo in bottega."],
  ["prezzo", "Il pane di grano duro costa 3,50 € al kg. Passa a ritirarlo quando vuoi."],
  ["sconto", "Solo questa settimana: sconto del 10% su tutta la gastronomia."],
  ["tempo di consegna", "La consegna arriva entro 45 minuti nel centro di Piacenza."],
  ["data ISO e ora", "Il tuo ordine è pronto: ritiro previsto 2026-08-28 alle 18:30."],
  ["claim gonfiato", "Già 500 famiglie ordinano su MyCity ogni settimana."],
  ["claim vago", "Centinaia di piacentini hanno già scelto le botteghe del centro."],
  ["numero di business orfano", "Siamo scelti da 3.000 clienti a Piacenza."],
  ["numero di business con soggetto staccato", "Abbiamo 12 negozi convenzionati in centro."],
  ["numero di business con la fonte", "Siamo scelti da 3.000 clienti (fonte: Supabase, 28/8)."],
  ["segnaposto non risolto", "Ciao [NOME], il tuo ordine è pronto."],
  ["segnaposto a graffe", "Ciao {{nome_cliente}}, ti aspettiamo."],
  ["TODO rimasto dentro", "Ciao! TODO: aggiungere l'orario di ritiro."],
  ["snippet di shell citato", 'Il controllo del worker è [ -f "$1" ] e non riguarda il tuo ordine.'],
  ["wikilink", "Trovi tutto in [[Catalogo]] della bottega."],
  ["mail pulita", "Ciao! Il tuo ordine è pronto in bottega. A presto."],
  ["mail lunga e onesta", "Buongiorno, la sua spesa è pronta. Ritiro in via Roma dalle 9 alle 13, sabato 30 agosto. Il totale è 24,80 € e può pagare in cassa. Grazie!"],
];

// 🚧 IL DEBITO MISURATO — quanti casi del banco i due metri giudicano ANCORA in modo diverso.
//
// Perché un tetto e non zero, ed è la scoperta più importante di questo lotto. La prima stesura di
// questa prova pretendeva zero e passava: ma passava perché il profilo di allora («solo-claim»)
// spegneva la regola sui numeri da tutte e due le parti, e due metri spenti non possono divergere.
// Rimesso il metro severo che Nicola ha scelto il 28/8, la divergenza è saltata fuori: il Pannello
// boccia gli orari («dalle 8:00 alle 13:00») e le date ISO, il cervello no, perché le esenzioni
// vivono in `cervello/onesta-ambito.mjs` e nel Pannello non ci sono.
//
// Quindi AR-791 NON è curato: è MISURATO. Il numero qui sotto scende e non risale mai. Il verso
// della divergenza è quello meno pericoloso — il Pannello è più severo, non più permissivo: nessuna
// bugia passa, ma una mail onesta con un orario dentro verrebbe fermata.
// I tre casi, misurati il 28/8 sul banco intero (non su un campione — un campione più piccolo ne
// aveva contati 2, e il tetto sbagliato era già scritto prima che la prova lo smentisse):
//   · «orari di apertura»  — il Pannello boccia «8:00», il cervello lo esenta
//   · «data ISO e ora»     — idem sulla data
//   · «mail lunga e onesta» — bocciano tutti e due, ma su ESEMPI diversi
const TETTO_DIVERGENZE = 3;

test("AR-791 (il perno): la divergenza fra i due metri è misurata e non cresce", () => {
  const diversi = [];
  for (const [etichetta, testo] of BANCO) {
    const dalCervello = verdetto(cervello.giudica("email", testo, "lettera"));
    const dalPannello = verdetto(pannello.giudicaLettera("email", testo));
    try {
      assert.deepEqual(dalPannello, dalCervello);
    } catch {
      diversi.push(`«${etichetta}» cervello=${JSON.stringify(dalCervello.violazioni.map((v) => v.tipo))} pannello=${JSON.stringify(dalPannello.violazioni.map((v) => v.tipo))}`);
    }
  }
  assert.ok(
    diversi.length <= TETTO_DIVERGENZE,
    `i due metri divergono su ${diversi.length} casi, il tetto è ${TETTO_DIVERGENZE} — il tetto scende e non risale:\n  ${diversi.join("\n  ")}`,
  );
  // E il tetto non può restare in piedi da solo quando il debito è finito: se un giorno le due case
  // concordano su tutto, questa riga diventa rossa e obbliga ad abbassare il tetto a zero.
  assert.ok(
    diversi.length === TETTO_DIVERGENZE,
    `la divergenza è scesa a ${diversi.length}: abbassa TETTO_DIVERGENZE a ${diversi.length} (scende e non risale mai)`,
  );
});

test("AR-791: la porta che usa mani.ts passa DAVVERO dal giudizio, non da una logica sua", () => {
  for (const [etichetta, testo] of BANCO) {
    const porta = pannello.esaminaOnesta("email", testo);
    const dentro = pannello.giudicaLettera("email", testo);
    assert.deepEqual(porta.violazioni, dentro.violazioni, `«${etichetta}»: la porta e il giudizio si sono staccati`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ IL PROFILO È GIUSTO: la prova non è vacua né in un verso né nell'altro
// ─────────────────────────────────────────────────────────────────────────────

const bocciata = (testo) => pannello.giudicaLettera("email", testo).violazioni.length > 0;

test("AR-791: il macchinario per fondare solo i claim è costruito e FUNZIONA — è acceso il giorno che Nicola lo dice", () => {
  // Nicola, 28/8: il metro sulle mail resta severo finché non ha visto le otto mail di prova.
  // La proposta però non va lasciata marcire: `numeroDaFondare` è la funzione che la esegue, e
  // senza una prova che la ESEGUA diventerebbe codice morto che nessuno si fida più di accendere.
  // Qui si prova la CAPACITÀ, non si accende la politica: il profilo vero resta `true` (caso sopra).
  const claim = ["3.000 clienti", " a Piacenza"];
  const nonClaim = [
    ["3,50 €", " al kg"],
    ["10%", " sul prossimo ordine"],
    ["8:00", " alle 13:00"],
  ];
  assert.equal(cervello.numeroDaFondare(claim[0], claim[1], "solo-claim"), true, "un numero attaccato a «clienti» è un claim e va fondato");
  for (const [raw, dopo] of nonClaim) {
    assert.equal(cervello.numeroDaFondare(raw, dopo, "solo-claim"), false, `«${raw}» non promette niente sul mondo: col profilo dei claim non va fondato`);
  }
  // E col metro severo di OGGI, gli stessi numeri vanno fondati tutti: è il costo dichiarato della
  // decisione di Nicola, non un bug. Se questa riga diventa rossa, qualcuno ha allentato il metro.
  for (const [raw, dopo] of [claim, ...nonClaim]) {
    assert.equal(cervello.numeroDaFondare(raw, dopo, true), true, `col metro severo «${raw}» vuole la sua fonte`);
  }
});

test("AR-791: e il metro resta capace di dire di NO — se passasse tutto sarebbe spento", () => {
  const devonoCadere = [
    ["claim gonfiato", "Già 500 famiglie ordinano su MyCity ogni settimana."],
    ["claim vago", "Centinaia di piacentini hanno già scelto le botteghe."],
    ["numero di business orfano", "Siamo scelti da 3.000 clienti a Piacenza."],
    ["negozi contati senza fonte", "Abbiamo 12 negozi convenzionati in centro."],
    ["segnaposto", "Ciao [NOME], il tuo ordine è pronto."],
    ["TODO", "Ciao! TODO: aggiungere l'orario."],
  ];
  for (const [etichetta, testo] of devonoCadere) {
    assert.equal(bocciata(testo), true, `«${etichetta}» deve essere bloccata prima di partire verso un cliente`);
    assert.equal(cervello.giudica("email", testo, "lettera").violazioni.length > 0, true, `«${etichetta}»: anche il cervello deve bocciarla`);
  }
});

test("AR-868: mettere il numero fra apici non lo fa sparire dal cancello sulle mail", () => {
  // Regressione di questo stesso lotto, trovata dalla radiografia del perimetro. La mascheratura
  // del codice fra apici serve su un documento interno, dove `file.mjs:12` è una fonte e non un
  // numero orfano. In una lettera a un cliente non c'è codice da proteggere: c'è solo un modo in
  // più di nascondere un numero. Misurato prima del fix: con gli apici passava, senza veniva
  // fermata — cioè bastava scrivere il numero fra apici per scavalcare il cancello.
  const conApici = "Siamo scelti da `3.000 clienti` a Piacenza.";
  const senzaApici = "Siamo scelti da 3.000 clienti a Piacenza.";
  for (const [come, testo] of [["fra apici", conApici], ["in chiaro", senzaApici]]) {
    assert.ok(cervello.giudica("email", testo, "lettera").violazioni.length > 0, `il cervello deve fermare il numero ${come}`);
    assert.ok(pannello.giudicaLettera("email", testo).violazioni.length > 0, `il Pannello deve fermare il numero ${come}`);
  }
  // E sulla memoria la mascheratura resta accesa: lì un riferimento a codice È una fonte (AR-433),
  // e toglierla farebbe suonare il cancello su ogni riga di diagnosi.
  assert.equal(
    cervello.giudica("consegne/audit/x.md", "Vedi `cervello/onesta-check.mjs:275` per il dettaglio.", "audit").violazioni.length,
    0,
    "su un audit un riferimento a codice non è un numero orfano: la mascheratura lì serve",
  );
});

test("AR-791: niente è stato allentato — memoria E lettera restano col metro severo", () => {
  // Nicola, 28/8: «tienilo severo, per ora». Lo stesso numero senza fonte cade da tutte e due le
  // parti. Il giorno che qualcuno accende la proposta senza la firma di Nicola, questa diventa rossa.
  const prezzo = "Il pane costa 3,50 € al kg.";
  assert.equal(cervello.giudica("consegne/content/post.md", prezzo, "contenuto").violazioni.length, 1, "sulla memoria un numero senza fonte cade");
  assert.equal(cervello.giudica("email", prezzo, "lettera").violazioni.length, 1, "e sulla lettera al cliente pure: il metro è severo da tutte e due le parti");
  assert.equal(cervello.regolePer("lettera").numeri, true, "il profilo della lettera è quello severo che Nicola ha scelto il 28/8");
});
