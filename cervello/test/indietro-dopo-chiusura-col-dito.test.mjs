// AR-403 / AR-606 — chiudere un pannello col dito non deve lasciare gradini finti in cronologia.
//
// I due difetti raccontano lo stesso guasto da due distanze. Aprire uno strato (il menù sul telefono,
// il cassetto delle conversazioni) timbra una voce di cronologia; chiuderlo con la X, col velo o con
// Esc lo toglieva solo dalla pila interna e la voce restava lì. Da lì:
//   · il primo indietro è un colpo a vuoto — consuma la voce fantasma e a video non cambia niente
//     (AR-403: «premo indietro e non succede nulla»);
//   · il marcatore stantio veniva copiato in ogni voce nuova, e allora il menù riaperto non si
//     timbrava più e l'indietro non lo chiudeva più: cambiava l'AREA sotto lasciando il pannello
//     aperto sopra (AR-606), cioè tornava il difetto che il contratto degli strati dichiara risolto.
//
// Qui la cronologia del browser è simulata come si comporta davvero (indietro sposta l'indice, un
// nuovo timbro taglia il futuro) e sopra ci girano le funzioni VERE che il Pannello usa: quelle di
// strati.ts e nav.ts. Ogni prova è un gesto di Nicola, non un pattern cercato in un file.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { cimaDellaPila, conStrato, senzaStrato, stratoDaChiudere, voceDaTimbrare, deveTornareIndietro, voceDiNavigazione } =
  await import(join(REPO, "pannello/src/lib/strati.ts"));
const { voceSubDaTimbrare } = await import(join(REPO, "pannello/src/lib/nav.ts"));

// ── la cronologia del browser, in piccolo ────────────────────────────────────
// `back()` non cancella niente: sposta indietro l'indice. Un `push` successivo taglia il futuro.
// Contarla è il modo di misurare il difetto: «quanti indietro servono per uscire da dove sei».
function cronologia(primoStato = { vista: "plancia" }) {
  const voci = [primoStato];
  let i = 0;
  return {
    get stato() {
      return voci[i];
    },
    get posizione() {
      return i;
    },
    get lunghezza() {
      return voci.length;
    },
    push(st) {
      voci.splice(i + 1);
      voci.push(st);
      i = voci.length - 1;
    },
    replace(st) {
      voci[i] = st;
    },
    back() {
      if (i > 0) i--;
      return voci[i];
    },
  };
}

// ── i gesti, scritti con le stesse tre righe che stanno nel Pannello ─────────
function apriStrato(h, nome, pila) {
  const voce = voceDaTimbrare(h.stato, nome); // useStrato, effetto
  if (voce) h.push(voce);
  return conStrato(pila, { nome, chiudi() {} });
}
/** La X, il velo, Esc: chiude e — con il fix — ritira la voce che aveva timbrato. */
function chiudiColDito(h, nome, pila) {
  const dopo = senzaStrato(pila, nome); // useStrato, cleanup
  if (deveTornareIndietro(h.stato, nome, dopo)) h.back();
  return dopo;
}
/** Il gesto indietro del telefono: il popstate centrale + l'ascoltatore degli strati. */
function gestoIndietro(h, pila) {
  const st = h.back();
  const daChiudere = stratoDaChiudere(st, cimaDellaPila(pila));
  return { stato: st, chiuso: daChiudere?.nome ?? null, pila: daChiudere ? senzaStrato(pila, daChiudere.nome) : pila };
}
const cambiaArea = (h, vista) => h.push(voceDiNavigazione(h.stato, { vista })); // page.tsx, effetto [vista]
function cambiaScheda(h, vista, sub) {
  const voce = voceSubDaTimbrare(h.stato, vista, sub); // nav.ts, vaiSub
  if (voce) h.push(voce);
}

// ── AR-403: il colpo a vuoto ─────────────────────────────────────────────────
test("apri il cassetto e lo chiudi col dito: la cronologia torna esattamente com'era", () => {
  const h = cronologia({ vista: "plancia" });
  const prima = { posizione: h.posizione, stato: h.stato };
  let pila = apriStrato(h, "conversazioni", []);
  assert.equal(h.posizione, 1, "aprire deve timbrare: senza voce, l'indietro non può chiudere");
  pila = chiudiColDito(h, "conversazioni", pila);
  assert.equal(h.posizione, prima.posizione, "chiudere col dito deve RITIRARE la voce timbrata");
  assert.deepEqual(h.stato, prima.stato, "e riportare allo stato di partenza, senza timbri appesi");
  assert.equal(pila.length, 0);
});

test("dopo apri→chiudi col dito, il primo indietro fa una cosa VERA (non un colpo a vuoto)", () => {
  // È il sintomo con cui Nicola l'ha visto: «premo indietro e non succede niente».
  const h = cronologia({ vista: "plancia" });
  cambiaArea(h, "numeri"); // c'è un passo vero alle spalle: tornare a plancia
  let pila = apriStrato(h, "menu", []);
  pila = chiudiColDito(h, "menu", pila);
  const dopo = gestoIndietro(h, pila);
  assert.equal(dopo.stato.vista, "plancia", "l'indietro deve riportare all'area precedente, non consumare un fantasma");
});

test("chiuso DAL gesto indietro: non si torna indietro due volte", () => {
  // Il gesto indietro chiude lo strato; se il cleanup facesse un altro back(), un solo tocco
  // salterebbe due passi e Nicola si ritroverebbe due schermate più in là.
  const h = cronologia({ vista: "plancia" });
  cambiaArea(h, "numeri");
  const pila = apriStrato(h, "menu", []);
  const dopo = gestoIndietro(h, pila);
  assert.equal(dopo.chiuso, "menu", "l'indietro chiude lo strato");
  assert.equal(
    deveTornareIndietro(h.stato, "menu", dopo.pila),
    false,
    "la voce corrente non porta più il marcatore: non c'è niente da ritirare",
  );
  assert.equal(h.stato.vista, "numeri", "e l'area sotto non si muove");
});

test("dal menù tocchi un'altra area: non si torna indietro, si va avanti", () => {
  // Chiusura e cambio d'area arrivano insieme (stesso commit: setVista + setNavAperta). Il ritiro
  // guarda la cronologia DOPO: c'è una voce nuova, quindi non c'è nessun fantasma da togliere —
  // altrimenti si tornerebbe sull'area da cui Nicola è appena uscito.
  const h = cronologia({ vista: "plancia" });
  let pila = apriStrato(h, "menu", []);
  pila = senzaStrato(pila, "menu"); // il menù si chiude…
  cambiaArea(h, "numeri"); // …e la nuova area timbra la sua voce
  assert.equal(deveTornareIndietro(h.stato, "menu", pila), false, "niente ritiro: si è già andati avanti");
  assert.equal(h.stato.vista, "numeri", "si resta dove Nicola ha chiesto di andare");
});

test("chiudi e riapri di scatto: la voce serve ancora, non si ritira", () => {
  const h = cronologia({ vista: "plancia" });
  let pila = apriStrato(h, "menu", []);
  pila = senzaStrato(pila, "menu");
  pila = conStrato(pila, { nome: "menu", chiudi() {} }); // riaperto prima che il ritiro parta
  assert.equal(deveTornareIndietro(h.stato, "menu", pila), false, "è di nuovo aperto: la sua voce va lasciata stare");
});

test("uno strato sepolto sotto un altro non si porta via la voce di chi è sopra", () => {
  const h = cronologia({ vista: "assistente" });
  let pila = apriStrato(h, "worker-conversazioni", []);
  pila = apriStrato(h, "menu", pila); // il menù sopra il cassetto
  const conIlMenuAncoraSopra = senzaStrato(pila, "worker-conversazioni");
  assert.equal(
    deveTornareIndietro(h.stato, "worker-conversazioni", conIlMenuAncoraSopra),
    false,
    "la voce corrente è del menù: ritirarla chiuderebbe la cosa sbagliata",
  );
});

// ── AR-606: il timbro che resta e fa sbagliare strada ────────────────────────
test("il caso grave: dopo apri→chiudi col dito→cambio area, l'indietro chiude il menù e NON cambia area", () => {
  // Questa è la sequenza che faceva tornare il difetto già dichiarato risolto: il marcatore stantio
  // veniva copiato nelle voci nuove, il menù riaperto non si timbrava e l'indietro cambiava l'area
  // lasciandolo aperto sopra.
  const h = cronologia({ vista: "plancia" });
  let pila = apriStrato(h, "menu", []);
  pila = chiudiColDito(h, "menu", pila);
  cambiaArea(h, "numeri");
  assert.equal(h.stato.strato, undefined, "la voce dell'area nuova non porta il timbro di un pannello chiuso");

  pila = apriStrato(h, "menu", pila);
  assert.equal(h.stato.strato, "menu", "riaprendolo, il menù timbra davvero la sua voce");

  const dopo = gestoIndietro(h, pila);
  assert.equal(dopo.chiuso, "menu", "l'indietro chiude il menù…");
  assert.equal(dopo.stato.vista, "numeri", "…e lascia l'area dov'era: niente salto di nascosto");
});

test("cambiando scheda il timbro di un pannello chiuso non si eredita", () => {
  const h = cronologia({ vista: "azioni", sub: "mosse" });
  let pila = apriStrato(h, "menu", []);
  pila = senzaStrato(pila, "menu");
  cambiaScheda(h, "azioni", "approvare");
  assert.equal(h.stato.strato, undefined, "una scheda nuova non è un pannello aperto");
  assert.equal(h.stato.sub, "approvare");
});

test("gli internals di Next sopravvivono allo spoglio", () => {
  // Cancellarli fa ricaricare la pagina al primo indietro: è il bug documentato in lib/nav.ts.
  const st = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: { a: 1 }, vista: "plancia", strato: "menu", overlay: "worker" };
  const v = voceDiNavigazione(st, { vista: "numeri" });
  assert.equal(v.__NA, true);
  assert.deepEqual(v.__PRIVATE_NEXTJS_INTERNALS_TREE, { a: 1 });
  assert.equal(v.vista, "numeri");
  assert.equal(v.strato, undefined, "il marcatore dello strato va tolto");
  assert.equal(v.overlay, undefined, "e anche quello del Worker: history.state sopravvive al ricaricamento");
});

test("chi vuole timbrare un marcatore lo dice, e viene servito", () => {
  const v = voceDiNavigazione({ vista: "plancia", strato: "menu" }, { overlay: "worker" });
  assert.equal(v.overlay, "worker", "l'apertura del Worker timbra il suo marcatore…");
  assert.equal(v.strato, undefined, "…e ripulisce quello vecchio: una voce dice UNA cosa sola");
});

test("stato storto o mancante: non si tocca la cronologia", () => {
  for (const st of [null, undefined, "stringa", 42]) {
    assert.equal(deveTornareIndietro(st, "menu"), false, `stato: ${JSON.stringify(st)}`);
  }
  assert.equal(deveTornareIndietro({ strato: "menu" }, ""), false, "senza nome non si decide niente");
});

// ── il cablaggio: la decisione dev'essere COLLEGATA, non solo scritta ────────
test("il ritiro è collegato dove si chiude, e lo spoglio dove si timbra", () => {
  const useStrato = readFileSync(join(REPO, "pannello/src/lib/useStrato.ts"), "utf8");
  assert.match(useStrato, /deveTornareIndietro\(/, "useStrato deve chiedere se ritirare la voce alla chiusura");
  assert.match(useStrato, /history\.back\(\)/, "…e ritirarla davvero");
  const page = readFileSync(join(REPO, "pannello/src/app/page.tsx"), "utf8");
  const spogli = page.match(/voceDiNavigazione\(/g) || [];
  assert.ok(spogli.length >= 3, `page.tsx timbra ancora voci col merge cieco (voceDiNavigazione usata ${spogli.length} volte su 3)`);
  assert.doesNotMatch(
    page,
    /pushState\(\s*\{\s*\.\.\.\(?window\.history\.state/,
    "nessun pushState deve più fondere l'intero history.state a occhi chiusi",
  );
});
