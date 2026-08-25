#!/usr/bin/env node
// 🧪 AR-724 — UNA CHIUSURA SENZA DATA SPARISCE DA OGNI MESE.
//
// Il conto, misurato il 23/8/2026 sul cantiere vero: **10 schede chiuse senza nessuna data**
// (AR-768…AR-779). Non appartenevano a nessun mese, quindi il voto che la macchina si dà —
// «chiudo almeno quanto apro», il numero che decide se il giro può aprire ricerche nuove — era
// calcolato su libri con quel buco dentro. `tasso-chiusura.mjs` lo diceva a ogni giro
// («REGISTRI BUCATI»), e nessuno lo riparava: un avviso senza un freno è una riga che si impara
// a saltare.
//
// LA PORTA C'ERA GIÀ. `timbraChiusura` sta in `contratto-scheda.mjs` da settimane, e la prosa
// dice che tutti devono passarci. I 10 buchi li ha fatti lo stesso — perché non li ha fatti una
// riga di codice: li ha fatti una mano, in sessione, scrivendo dentro al JSON. Un guardiano che
// avesse guardato solo il CODICE avrebbe detto verde su tutti e dieci.
//
// Da qui le due domande, che vanno fatte insieme o non valgono:
//   ④ al DATO   — c'è una scheda chiusa senza il timbro? (`timbriStorti`)
//   ⑤ al CODICE — c'è una riga che scrive «chiuso» fuori dalla porta? (`attiFuoriDallaPorta`)
//
// I casi qui sotto sono costruiti: mordono anche quando il cantiere vero è a posto. Una prova che
// legge lo stato di oggi misura la fortuna, non la regola.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  attiFuoriDallaPorta,
  senzaCommenti,
  timbraChiusura,
  timbriStorti,
  timbroValido,
} from "../contratto-scheda.mjs";
import { verdetto } from "../cantiere-integrita.mjs";

// ─────────────────────────── ④ la domanda al dato ───────────────────────────

test("una scheda chiusa senza nessuna data risulta col timbro storto", () => {
  const storti = timbriStorti([{ id: "AR-999", stato: "chiuso" }]);
  assert.equal(storti.length, 1);
  assert.equal(storti[0].id, "AR-999");
  assert.equal(storti[0].chiuso_il, null, "senza data il campo deve restare vuoto, non inventato");
});

test("la data secca, senza l'ora, è comunque un timbro storto", () => {
  const storti = timbriStorti([{ id: "AR-999", stato: "chiuso", chiuso_il: "2026-07-02" }]);
  assert.equal(storti.length, 1);
  assert.equal(storti[0].chiuso_il, "2026-07-02", "la data secca si riporta: serve a distinguerla dal nulla");
});

test("una scheda timbrata come si deve non risulta storta", () => {
  const d = timbraChiusura({ id: "AR-999" }, { quando: "2026-08-23 15:24" });
  assert.equal(d.stato, "chiuso");
  assert.equal(d.chiuso_il, "2026-08-23 15:24");
  assert.deepEqual(timbriStorti([d]), []);
});

test("una scheda APERTA non è mai un timbro storto, anche se non ha data", () => {
  assert.deepEqual(timbriStorti([{ id: "AR-999", stato: "aperto" }]), []);
});

test("la porta rifiuta una data senza l'ora invece di accettarla in silenzio", () => {
  assert.throws(() => timbraChiusura({ id: "AR-999" }, { quando: "2026-07-02" }), /senza ora/);
  assert.equal(timbroValido("2026-07-02"), false);
  assert.equal(timbroValido("2026-07-02 09:15"), true);
});

// ─────────────────────────── ⑤ la domanda al codice ───────────────────────────

const leggiFinto = (mappa) => (f) => {
  if (!(f in mappa)) throw new Error(`file finto assente: ${f}`);
  return mappa[f];
};

test("una riga che scrive «chiuso» fuori dalla porta viene accusata, col numero di riga", () => {
  const fuori = attiFuoriDallaPorta(["finto.mjs"], leggiFinto({
    "finto.mjs": ['const d = trova(id);', '', 'd.stato = "chiuso";', 'salva(d);'].join("\n"),
  }));
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].riga, 3, "il numero di riga dev'essere quello vero del file");
  assert.match(fuori[0].testo, /stato = "chiuso"/);
});

test("la stessa frase dentro un commento di riga NON è un atto", () => {
  // È il caso vero di `allinea-scan-cantiere.mjs`, che in cima SPIEGA di essere il secondo a
  // scrivere `stato: "chiuso"`. Contarlo sarebbe un rosso su una spiegazione.
  const fuori = attiFuoriDallaPorta(["finto.mjs"], leggiFinto({
    "finto.mjs": '// questo file scrive stato: "chiuso" nel cantiere\nconst x = 1;\n',
  }));
  assert.deepEqual(fuori, []);
});

test("la stessa frase dentro un commento a blocco NON è un atto, e le righe dopo restano al loro posto", () => {
  const testo = [
    "/*",
    ' * qui si spiega che stato = "chiuso" lo mette la porta',
    " */",
    "const a = 1;",
    'd.stato = "chiuso";',
  ].join("\n");
  const fuori = attiFuoriDallaPorta(["finto.mjs"], leggiFinto({ "finto.mjs": testo }));
  assert.equal(fuori.length, 1, "l'atto vero, sotto il commento, va visto");
  assert.equal(fuori[0].riga, 5, "un commento a blocco non deve spostare i numeri di riga");
});

test("senzaCommenti tiene le righe al loro posto", () => {
  const dentro = "riga1\n/* a\n b\n c */\nriga5";
  assert.equal(senzaCommenti(dentro).split("\n").length, dentro.split("\n").length);
  assert.match(senzaCommenti(dentro).split("\n")[4], /riga5/);
});

test("una riga dichiarata esente non è una violazione — sulla riga stessa o su quella sopra", () => {
  const sullaRiga = attiFuoriDallaPorta(["a.mjs"], leggiFinto({
    "a.mjs": 'd.stato = "chiuso"; // timbro-esente: script di migrazione, timbra subito dopo\n',
  }));
  assert.deepEqual(sullaRiga, [], "l'esenzione sulla riga stessa deve valere");

  const sopra = attiFuoriDallaPorta(["b.mjs"], leggiFinto({
    "b.mjs": '// timbro-esente: qui il timbro arriva dal chiamante\nd.stato = "chiuso";\n',
  }));
  assert.deepEqual(sopra, [], "l'esenzione sulla riga sopra deve valere");
});

test("un'esenzione due righe sopra NON vale: deve stare accanto all'atto", () => {
  const fuori = attiFuoriDallaPorta(["c.mjs"], leggiFinto({
    "c.mjs": "// timbro-esente: motivo lontano\nconst x = 1;\nd.stato = \"chiuso\";\n",
  }));
  assert.equal(fuori.length, 1, "un permesso scritto lontano dall'atto non è un permesso");
});

test("la porta stessa non si accusa da sola", () => {
  const finti = { "cervello/contratto-scheda.mjs": 'd.stato = "chiuso";\n' };
  assert.deepEqual(attiFuoriDallaPorta(Object.keys(finti), leggiFinto(finti)), []);
});

test("un file illeggibile non diventa un rosso inventato", () => {
  assert.deepEqual(attiFuoriDallaPorta(["non-esiste.mjs"], leggiFinto({})), []);
});

// ─────────────────────────── il verdetto ───────────────────────────

const verde = { spariti: [], doppi: [], citati: [], senzaData: [], dataSecca: [], tettoSecco: 0, attiFuori: [] };

test("senza buchi il verdetto è verde", () => {
  assert.equal(verdetto(verde).esce, 0);
});

test("una chiusura senza data fa uscire rosso", () => {
  const v = verdetto({ ...verde, senzaData: [{ id: "AR-999", chiuso_il: null }] });
  assert.equal(v.esce, 1);
  assert.equal(v.senza_data, 1);
  assert.ok(v.righe.some((r) => r.includes("AR-999")), "l'id va detto, non solo contato");
});

test("le date secche sotto il tetto sono debito dichiarato, non un rosso", () => {
  const v = verdetto({ ...verde, dataSecca: [{ id: "AR-1", chiuso_il: "2026-07-02" }], tettoSecco: 24 });
  assert.equal(v.esce, 0, "sotto il tetto non si blocca: un cancello sempre rosso si impara ad aggirarlo");
  assert.equal(v.data_secca, 1);
  assert.ok(v.righe.some((r) => r.includes("debito dichiarato")), "il debito va DETTO, non ingoiato");
});

test("una data secca oltre il tetto fa uscire rosso", () => {
  const secche = Array.from({ length: 3 }, (_, i) => ({ id: `AR-${i}`, chiuso_il: "2026-07-02" }));
  assert.equal(verdetto({ ...verde, dataSecca: secche, tettoSecco: 2 }).esce, 1);
});

test("senza un tetto misurato il verdetto dice «non ho giudicato», e non è un verde silenzioso", () => {
  const v = verdetto({ ...verde, dataSecca: [{ id: "AR-1", chiuso_il: "2026-07-02" }], tettoSecco: null });
  assert.ok(v.righe.some((r) => r.startsWith("⚪")), "un tetto che manca non è un permesso: va dichiarato");
  assert.equal(v.tetto_secco, null);
});

test("una riga fuori dalla porta fa uscire rosso", () => {
  const v = verdetto({ ...verde, attiFuori: [{ file: "x.mjs", riga: 7, testo: 'd.stato = "chiuso";' }] });
  assert.equal(v.esce, 1);
  assert.ok(v.righe.some((r) => r.includes("x.mjs:7")), "il posto va detto: un rosso senza indirizzo non si ripara");
});

test("un rosso misurato batte la cecità: non si degrada a «non ho misurato»", () => {
  const v = verdetto({ ...verde, senzaData: [{ id: "AR-999", chiuso_il: null }], cecita: ["clone superficiale"] });
  assert.equal(v.esce, 1, "una cosa che so per certo non si perde dietro una che non ho potuto vedere");
});
