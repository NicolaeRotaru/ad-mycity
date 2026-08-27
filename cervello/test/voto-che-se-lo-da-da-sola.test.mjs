#!/usr/bin/env node
// 🧪 IL VOTO NON SE LO DÀ DA SOLA — sei difetti, una malattia, una prova che li esegue.
//
// LA MALATTIA (famiglia «calibrazione-onesta»). La macchina calcola un punteggio che la governa —
// quanta autonomia si concede — a partire da numeri che scrive lei stessa. Sei modi diversi di fare
// la stessa cosa, tutti registrati fra il 3 e il 25 luglio:
//
//   AR-061  guadagnava autonomia anche quando i sensori che misurano il «reale» erano ciechi
//   AR-062  un esito entrava senza fonte: chi conia autonomia poteva auto-alimentarsi
//   AR-063  la sonda si certificava «il volano chiude» con previsioni ANCORA APERTE
//   AR-064  una previsione lasciata scadere non costava niente: survivorship bias sul voto
//   AR-065  autonomia «alta» concessa con tre esiti fortunati, senza confidenza statistica
//   AR-066  previsioni tautologiche («prevedo che lo zero resti zero») valevano quanto una scommessa
//   AR-096  il voto di salute saliva di +2 a ogni chiusura, solo in salita, scollegato dal reale
//
// PERCHÉ QUESTA PROVA ESISTE ADESSO. Il codice era già stato riparato — tutte e sette le cure sono
// in albero. Le SCHEDE però erano ferme a una prova del 3/7 che puntava a codice cambiato da
// allora: «da-riverificare», cioè nessun guardiano poteva né chiuderle né riaprirle. Erano difetti
// curati che nessuno poteva dichiarare curati, e nessuno poteva accorgersi se tornavano.
// Qui la cura viene ESEGUITA sui dati, non cercata come parola in un file.
//
// ⚠️ Ogni caso qui sotto ha la sua mutazione in `cervello/mutanti.json`: rompendo la cura, questa
// prova deve diventare rossa. Se resta verde non prova niente — è la regola che ha fatto nascere
// tutta questa famiglia.

import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const cal = await import(join(REPO, "cervello/calibrazione.mjs"));
const autofix = await import(join(REPO, "cervello/auto-fix.mjs"));
const prev = await import(join(REPO, "cervello/previsione-verificabile.mjs"));
const volano = await import(join(REPO, "cervello/volano-regole.mjs"));

// ── AR-065 · la confidenza, non la fortuna ───────────────────────────────────────────────────────

test("AR-065 · tre esiti azzeccati su tre NON bastano per l'autonomia alta", () => {
  const { wilsonLowerBound } = cal;
  assert.equal(typeof wilsonLowerBound, "function", "il calcolo dev'essere esportabile, o nessuno può provarlo");

  // 3 su 3 è una proporzione grezza di 1.00: prima concedeva «alta». Il lower-bound dice la verità.
  const tre = wilsonLowerBound(3, 3);
  assert.ok(tre < 0.7, `3 su 3 deve stare sotto la soglia dell'autonomia alta, vale ${tre}`);

  // Lo stesso 100% su un campione serio è un'altra cosa, ed è giusto che lo sia.
  const venti = wilsonLowerBound(20, 20);
  assert.ok(venti > tre, "più prove = più confidenza, a parità di percentuale");

  // …e la percentuale grezza non distingue i due casi: è esattamente il difetto.
  assert.equal(3 / 3, 20 / 20, "la proporzione grezza dice che sono la stessa cosa: non lo sono");
});

test("AR-065 · il campione minimo è un numero dichiarato, e il lower-bound da solo non basta", () => {
  // 7 azzeccate su 7: il lower-bound supera già la soglia dell'autonomia alta…
  const sette = cal.wilsonLowerBound(7, 7);
  assert.ok(sette >= 0.7, `7 su 7 supera la soglia col solo lower-bound (vale ${sette})`);
  // …e proprio per questo serve il SECONDO freno. Se sparisce, sette colpi fortunati bastano.
  assert.equal(cal.MIN_CAMPIONE_ALTA, 8, "sotto questo campione il tetto resta «media», qualunque sia il lower-bound");
  assert.ok(cal.MIN_CAMPIONE_ALTA > 7, "il caso qui sopra dev'essere DENTRO la zona protetta, o non prova niente");
  assert.ok(cal.MIN_PER_AUTONOMIA >= 3, "e sotto tre esiti non si concede nessuna autonomia");
});

// ── AR-062 · nessun esito senza fonte ────────────────────────────────────────────────────────────

test("AR-062 · un esito SENZA fonte non entra nel punteggio", () => {
  const { contaNelPunteggio, fonteVerificabile, ESCLUSA } = prev;

  const amm = cal.fontiAmmesse();
  assert.ok(Array.isArray(amm) && amm.length > 0, "un elenco vuoto renderebbe impossibile ogni esito");

  // Il conflitto di interesse che la scheda descrive: chi produce l'esito è chi ne beneficia in
  // autonomia. Il freno è che l'esito porti addosso da DOVE viene, e che quel «dove» sia leggibile.
  const senzaFonte = { stato: "azzeccata", atteso: 3, reale: 3, baseline: 0, metrica: "ordini" };
  assert.equal(contaNelPunteggio(senzaFonte).conta, false, "senza fonte non si conia autonomia");

  const conFonte = { ...senzaFonte, fonte: "Supabase MCP", sensore_stato: "ok" };
  assert.equal(contaNelPunteggio(conFonte).conta, true, "con una fonte che vedeva, invece, conta");

  // AR-062 — una previsione BANALE non conia autonomia. «Atteso 3 partendo da 3» è una tautologia:
  // vera comunque vada, e se contasse basterebbe prevedere che non cambi niente per farsi un voto.
  // Il caso di prima passava anche senza questo freno, perché non ne provava nessuna: qui si guarda
  // il verdetto composto, non la funzione presa da sola.
  const tautologia = { ...conFonte, atteso: 3, baseline: 3 };
  const esito = contaNelPunteggio(tautologia);
  assert.equal(esito.conta, false, "una previsione che non poteva sbagliare si è presa un punto");
  assert.ok(esito.motivi.includes(ESCLUSA.BANALE), `il motivo dev'essere «banale», non un altro: ${esito.motivi.join(", ")}`);
  assert.equal(typeof fonteVerificabile, "function", "il giudizio sulla fonte dev'essere eseguibile");
});

// ── AR-061 · un sensore che non vedeva non fa guadagnare autonomia ────────────────────────────────

test("AR-061 · un esito misurato da un sensore CIECO non conta nel punteggio", () => {
  const { contaNelPunteggio } = prev;
  const base = { stato: "azzeccata", atteso: 3, reale: 3, baseline: 0, metrica: "ordini", fonte: "Supabase MCP" };

  assert.equal(contaNelPunteggio({ ...base, sensore_stato: "cieco" }).conta, false, "il difetto in una riga");
  assert.equal(contaNelPunteggio({ ...base, sensore_stato: "ok" }).conta, true);

  // E il DEFAULT è rovesciato dalla parte giusta: uno stato che non si riconosce non è un permesso.
  // Prima si escludeva solo ciò che si sapeva riconoscere come cieco, e 41 voci chiuse su 42
  // stavano a «n/d» per caduta nel ramo umano — di cui 36 venivano dal quaderno che la macchina
  // scrive da sé. Leggere la propria memoria non è misurare la realtà.
  assert.equal(contaNelPunteggio({ ...base, sensore_stato: "sconosciuto" }).conta, false);
  assert.equal(contaNelPunteggio(base).conta, false, "nessuno stato dichiarato = non conta");

  // «n/d» resta ammesso, ed è giusto: un documento firmato è una misura, non un sensore spento.
  assert.equal(contaNelPunteggio({ ...base, fonte: "documento firmato", sensore_stato: "n/d" }).conta, true);
});

// ── AR-066 · una tautologia non è una previsione ─────────────────────────────────────────────────

test("AR-066 · «prevedo che lo zero resti zero» non entra nel punteggio", () => {
  const banale = { azione: "tengo la rotta", metrica: "ordini", atteso: 0, baseline: 0, nota: "" };
  assert.equal(cal.isPrevisioneBanale(banale, 0), true, "atteso 0 e reale 0 è una tautologia");

  const scommessa = { azione: "porto online il fornaio", metrica: "ordini", atteso: 3, baseline: 0, nota: "" };
  assert.equal(cal.isPrevisioneBanale(scommessa, 3), false, "una previsione informativa deve contare");
});

// ── AR-096 · il voto di salute non si gonfia da sé ───────────────────────────────────────────────

test("AR-096 · chiudere un difetto NON alza il voto di salute (era +2 fisso, solo in salita)", () => {
  const { votoSaluteDaRegistrare } = autofix;
  const serie = [{ voto_salute: 43 }];

  // Radiografia con una misura vera → si usa quella, chiunque abbia chiuso quanti difetti.
  assert.deepEqual(votoSaluteDaRegistrare({ voto_salute_architettura: 51 }, serie), { voto: 51, misurato: true });

  // Radiografia senza misura → NON si inventa e NON si azzera: si riporta l'ultimo noto, dicendolo.
  // Il round 3 aveva scoperto il difetto opposto: chiudere un freno FACEVA CROLLARE il voto a 0.
  assert.deepEqual(votoSaluteDaRegistrare({}, serie), { voto: 43, misurato: false });
  assert.deepEqual(votoSaluteDaRegistrare({ voto_salute_architettura: 0 }, serie), { voto: 43, misurato: false });
});

// ── AR-063 · «il volano chiude» solo con previsioni CHIUSE ───────────────────────────────────────

test("AR-063 · una previsione ancora aperta non è una prova di apprendimento", () => {
  const { previsioneValida } = volano;
  assert.equal(typeof previsioneValida, "function", "il filtro dev'essere condiviso, non rifatto a mano");

  const aperta = { id: "CAL-1", reparto: "@ad", stato: "aperta", atteso: 3, metrica: "ordini" };
  assert.equal(previsioneValida(aperta), false, "aver PREVISTO non è aver IMPARATO");

  const chiusa = { id: "CAL-2", reparto: "@ad", stato: "azzeccata", atteso: 3, reale: 3, baseline: 0, metrica: "ordini", chiuso_il: "2026-08-01" };
  assert.equal(previsioneValida(chiusa), true, "una previsione chiusa con esito è la prova buona");
});

// ── AR-064 · lasciar scadere una previsione non è gratis ─────────────────────────────────────────

test("AR-064 · una previsione scaduta senza esito resta un DEBITO, non sparisce", () => {
  const { debitoDiMisura } = cal;
  const registro = [
    { id: "A", stato: "aperta", entro: "2026-01-01", reale: null },   // dovuta: la data è passata
    { id: "B", stato: "scaduta", reale: null },                        // archiviata dall'amnistia
    { id: "C", stato: "azzeccata", entro: "2026-01-01", reale: 3 },    // misurata: nessun debito
    { id: "D", stato: "aperta", entro: "2099-01-01", reale: null },    // ancora nei tempi
  ];
  const d = debitoDiMisura(registro, "2026-06-01");
  assert.equal(d.totale, 2, "una scaduta senza reale e una dovuta sono debito, non neutro");
  assert.deepEqual(d.dovute.map((e) => e.id), ["A"]);
  assert.deepEqual(d.scadute.map((e) => e.id), ["B"]);

  // Il conto a zero deve essere possibile, o il freno sarebbe sempre acceso e verrebbe aggirato.
  assert.equal(debitoDiMisura([registro[2], registro[3]], "2026-06-01").totale, 0);
});
