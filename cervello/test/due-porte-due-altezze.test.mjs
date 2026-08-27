#!/usr/bin/env node
// AR-848 — «Una scheda GRAVE non poteva entrare con una parola cercata in un file, ma poteva
// uscire — cioè chiudersi — con quella stessa parola.»
//
// Il manuale di casa dice una cosa sola, e la dice con queste parole: «un difetto **grave o
// bloccante** nasce con una prova che gira». Le porte però erano due, e a due altezze diverse:
//
//   · INGRESSO  — `proveDeboliNate` (cancello-lotto.mjs): rifiuta una GRAVE nata adesso con una
//                 prova a pattern. Giusto. Ed è la porta che conta di meno, perché ferma il lavoro
//                 nuovo, che è quello che qualcuno sta guardando.
//   · USCITA    — `ammissibilitaProva` (prova-ammissibile.mjs): leggeva `["bloccante"]`. Una grave
//                 passava. Ed è la porta che conta di più, perché una chiusura è un difetto che
//                 sparisce dall'elenco: nessuno lo guarda più, per definizione.
//
// LA MISURA CHE HA DECISO (27/8, eseguita, non stimata): la scheda AR-128 — quella che il manuale
// cita per NOME come storia fondativa dell'asticella, «non esiste nessun sensore per le
// contestazioni carta», la cui prova è che la parola «chargeback» compaia in un documento — usciva
// `ammessa: true` dal cancello d'uscita. Sedici giorni dopo che la regola era stata scritta a
// partire da lei. La regola non era arrivata alla porta.
//
// E il difetto era ATTIVO, non teorico: lo stesso giorno `allinea-scan-cantiere.mjs` ha chiuso il
// reperto GRAVE «Il banco delle prove non sa cosa sia un test saltato: non lo conta e dichiara
// verde» perché `cervello/test-cervello.mjs` contiene la parola «saltati». Che la parola ci sia non
// dice niente su quanti test saltati il banco conti.
//
// I casi sono COSTRUITI e girano su schede finte: mordono anche col registro di oggi a posto. Gli
// ultimi due invece guardano il mondo vero, e sono i due che scadono da soli se qualcuno smonta.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GRAVITA_CHE_OBBLIGANO, ammissibilitaProva, provaComportamentaleObbligatoria, umanaDichiarata } from "../prova-ammissibile.mjs";
import { proveDeboliNate } from "../cancello-lotto.mjs";
import { verdettoChiusura } from "../chiusura-dichiarata.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const CE = { fileEsiste: () => true };

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: e.message }); }
};

const grep = (file = "cervello/sentinelle.md", pattern = "chargeback") => ({ file, pattern, presente: true });
const scheda = (over = {}) => ({ id: "AR-X", gravita: "grave", impatto_crescita: "medio", stato: "aperto", verifica: grep(), ...over });

// ───────────────── IL CASO CHE HA GENERATO TUTTO ─────────────────

prova("IL CASO VERO: una GRAVE a impatto medio con una prova a parola NON si chiude", () => {
  // Prima della cura questa usciva `ammessa: true`. È la forma esatta di AR-128.
  const a = ammissibilitaProva(scheda(), CE);
  assert.equal(a.ammessa, false, "una grave si chiude ancora su una parola cercata in un file");
  assert.equal(a.marca, "prova_debole_su_grave");
});

prova("il motivo nomina la gravità VERA, non «BLOCCANTE» per tutte", () => {
  // Un cancello che ferma una GRAVE dicendo «è un BLOCCANTE» mente su perché ha fermato, e chi
  // legge va a cercare una gravità che la scheda non ha.
  const a = ammissibilitaProva(scheda(), CE);
  assert.match(a.motivo, /è un GRAVE\b/, `il motivo non dice la gravità giusta: ${a.motivo}`);
  assert.ok(!/è un BLOCCANTE/.test(a.motivo), "chiama BLOCCANTE una scheda grave");
});

prova("le DUE porte danno la stessa risposta sulla stessa scheda", () => {
  // È il difetto detto per intero: non «il cancello d'uscita è largo», ma «i due cancelli non sono
  // d'accordo». Un caso che guardasse una porta sola non lo vedrebbe.
  const d = scheda({ id: "AR-DUE" });
  const ingressoRifiuta = proveDeboliNate([d], ["AR-DUE"]).length === 1;
  const uscitaRifiuta = ammissibilitaProva(d, CE).ammessa === false;
  assert.equal(ingressoRifiuta, true, "il cancello d'INGRESSO ha smesso di rifiutare una grave a pattern");
  assert.equal(uscitaRifiuta, ingressoRifiuta, "le due porte hanno di nuovo due altezze diverse");
});

// ───────────────── LA TERZA USCITA ONESTA, che il manuale concede ─────────────────

prova("una GRAVE dichiarata a verifica UMANA passa: è la seconda strada del manuale", () => {
  // La cura sbagliata di questo difetto era rifiutare tutto ciò che non esegue. Così chiedevo un
  // test a chi ha appena dichiarato che un test non esiste — e `prova_debole_su_grave`, che è «il
  // numero che deve scendere scrivendo test», si riempiva di schede su cui non c'è niente da
  // scrivere. Misurato: 53 marcate, 27 delle quali umane dichiarate.
  const a = ammissibilitaProva(scheda({ verifica: { tipo: "umano" } }), CE);
  assert.equal(a.ammessa, true, "una verifica umana dichiarata viene contata come prova debole");
  assert.equal(a.marca, null);
});

prova("le due porte sono d'accordo anche sulla verifica umana", () => {
  const d = scheda({ id: "AR-UM", verifica: { tipo: "umano" } });
  assert.deepEqual(proveDeboliNate([d], ["AR-UM"]), [], "l'ingresso rifiuta una umana dichiarata");
  assert.equal(ammissibilitaProva(d, CE).ammessa, true, "l'uscita rifiuta una umana dichiarata");
});

prova("`umanaDichiarata` legge dal contratto, quindi conosce tutt'e due le scritture vive", () => {
  assert.equal(umanaDichiarata({ tipo: "umano" }), true);
  assert.equal(umanaDichiarata({ tipo: "umana" }), true);
  assert.equal(umanaDichiarata(grep()), false, "scambia una parola cercata per una verifica umana");
  assert.equal(umanaDichiarata({ comando: "node cervello/x.mjs" }), false);
  assert.equal(umanaDichiarata(undefined), false);
});

prova("…e proprio perché passa, NESSUNA macchina la chiude al posto dell'umano", () => {
  // Il rovescio della medaglia di sopra, trovato con la lente della sicurezza sul perimetro di
  // questo stesso lotto. Ammettere la verifica umana al cancello delle prove è giusto — quello che
  // NON deve seguirne è una chiusura automatica: «umana» vuol dire «nessun guardiano potrà
  // chiuderla». Prima del 27/8 `verdettoChiusura` rispondeva `chiude: true` col motivo «chiusa da
  // una prova che si esegue», che su una verifica umana è falso due volte.
  for (const g of ["grave", "bloccante", "minore"]) {
    const v = verdettoChiusura({ id: "AR-UM", gravita: g, impatto_crescita: "medio", verifica: { tipo: "umano" } }, "risolto", { fileEsiste: () => true });
    assert.equal(v.chiude, false, `una scheda ${g} a verifica umana viene chiusa da sola`);
    assert.match(v.motivo, /dichiarata umana/, `il motivo non dice perché: ${v.motivo}`);
  }
});

prova("una prova che ESEGUE chiude ancora: il freno di sopra non è un muro", () => {
  const v = verdettoChiusura(
    { id: "AR-OK", gravita: "grave", impatto_crescita: "medio", verifica: { comando: "node cervello/test/due-porte-due-altezze.test.mjs" } },
    "risolto",
    { fileEsiste: () => true },
  );
  assert.equal(v.chiude, true, `una grave con prova a comando non si chiude più: ${v.motivo}`);
});

prova("la porta della verifica umana è STRETTA: nessuna forma storta ci entra per sbaglio", () => {
  // Lente della sicurezza sul perimetro (27/8). Ammettere `{tipo:"umano"}` apre una via d'uscita
  // dall'obbligo: se ci cadesse dentro anche una scheda malformata, chiunque scriva una `verifica`
  // sbagliata si comprerebbe l'esenzione senza saperlo — ed è il modo in cui un'esenzione onesta
  // diventa la strada comoda. Undici forme vicine, tutte rifiutate, misurate una per una.
  for (const storta of [
    undefined, null, {}, { tipo: "" }, { tipo: "qualsiasi" }, { tipo: "UMANO" },
    { tipo: " umano " }, { umano: true }, { comando: "" }, { file: "x", pattern: "" }, "umano",
  ]) {
    assert.equal(umanaDichiarata(storta), false, `è entrata per sbaglio: ${JSON.stringify(storta)}`);
    assert.equal(
      ammissibilitaProva({ id: "AR-S", gravita: "grave", impatto_crescita: "medio", verifica: storta }, CE).ammessa,
      false,
      `una GRAVE si è comprata l'esenzione con ${JSON.stringify(storta)}`,
    );
  }
});

// ───────────────── IL VERSO OPPOSTO: il cancello non è un muro ─────────────────

prova("una MINORE con una prova a parola resta ammessa", () => {
  // Vietare la parola OVUNQUE congelerebbe l'84% del cantiere (AR-444, misurato il 30/7), e un
  // cancello che nessuno può attraversare si impara ad aggirarlo al secondo giro. Se questo caso
  // diventa rosso, la cura è diventata il difetto opposto.
  const a = ammissibilitaProva(scheda({ gravita: "minore", impatto_crescita: "basso" }), CE);
  assert.equal(a.ammessa, true, "una minore non si chiude più su una parola: il cancello è un muro");
});

prova("una GRAVE con un comando che GIRA si chiude", () => {
  const a = ammissibilitaProva(scheda({ verifica: { comando: "node cervello/test/due-porte-due-altezze.test.mjs" } }), CE);
  assert.equal(a.ammessa, true, `una grave con prova a comando non passa: ${a.motivo}`);
});

prova("un BLOCCANTE con una parola resta rifiutato: nessuna regressione", () => {
  const a = ammissibilitaProva(scheda({ gravita: "bloccante" }), CE);
  assert.equal(a.ammessa, false);
  assert.match(a.motivo, /è un BLOCCANTE/);
});

prova("una scheda a cui manca la gravità resta INDECIDIBILE, non ammessa di striscio", () => {
  // AR-789/790. Il terzo esito non deve essere schiacciato dall'aver allargato la lista sopra.
  const o = provaComportamentaleObbligatoria({ impatto_crescita: "medio", verifica: grep() });
  assert.equal(o.indecidibile, true, "una gravità assente esce come un «no» invece che come un «non so»");
  assert.equal(o.obbligatoria, false);
});

// ───────────────── IL MONDO VERO: due misure che scadono da sole ─────────────────

prova("la lista delle gravità che obbligano contiene le DUE parole del manuale", () => {
  assert.deepEqual([...GRAVITA_CHE_OBBLIGANO].sort(), ["bloccante", "grave"]);
});

prova("SUL CANTIERE VERO: AR-128, la scheda da cui nasce l'asticella, non è più chiudibile su una parola", () => {
  // È la prova che tiene viva la cura, e il caso singolo più difendibile che esista in questo
  // registro: la regola è stata scritta a partire da questa scheda.
  const c = JSON.parse(readFileSync(join(RADICE, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const d = (c?.difetti ?? c).find((x) => x?.id === "AR-128");
  assert.ok(d, "AR-128 non è più nel cantiere: se è stata chiusa davvero, questo caso va riscritto, non tolto");
  if (d.stato === "chiuso" && typeof d.verifica?.comando === "string") return; // curata sul serio: passa
  const a = ammissibilitaProva(d, { fileEsiste: (f) => readFileSync(join(RADICE, f), "utf8").length >= 0 });
  assert.equal(a.ammessa, false, "AR-128 si chiude di nuovo scrivendo «chargeback» in un documento");
});

prova("il cancello d'uscita è MONTATO su chi chiude davvero, non solo scritto", () => {
  // La malattia di casa: una regola perfetta su una porta che nessuno usa. Le tre bocche che
  // scrivono `stato: "chiuso"` devono passare tutte da qui. Le righe commentate si scartano prima
  // di cercare: una riga commentata contiene ancora, lettera per lettera, ciò che si cerca.
  for (const f of ["auto-fix.mjs", "allinea-scan-cantiere.mjs", "chiusura-dichiarata.mjs"]) {
    const viva = readFileSync(join(QUI, "..", f), "utf8")
      .split("\n")
      .filter((r) => !r.trimStart().startsWith("//") && !r.trimStart().startsWith("*"))
      .join("\n");
    assert.match(viva, /ammissibilitaProva\s*\(/, `${f} non chiama il cancello d'uscita: da lì una grave si chiude ancora su una parola`);
  }
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
