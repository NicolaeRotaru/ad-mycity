import { test } from "node:test";
import assert from "node:assert/strict";
import { verdettoCorsie, CORSIA_LAVORI, BATTITO_ADESSO_ORE } from "./memoria-ferma.ts";

// I numeri sono quelli VERI del blocco 18→20/8/2026. Sul VPS girano due worker: `all` fa i lavori
// (giro, ritmo, analisi, azioni, pubblicazione della memoria), `chat` risponde nel Pannello.
// Alle 04:46 del 18/8 la corsia `all` è morta e non è più ripartita. La corsia `chat` ha continuato
// a battere ogni minuto — e siccome la home leggeva solo `worker:ultimo` («il più recente di
// chiunque»), ha mostrato il pallino verde e la frase «il worker sta lavorando adesso» per due
// giorni e mezzo, mentre sedici lavori restavano in coda senza che nessuno li prendesse.

test("il blocco del 18/8: la chat batte adesso, i lavori sono fermi da 61 ore → NON è «sta lavorando»", () => {
  const v = verdettoCorsie({ oreCorsiaLavori: 61, oreQualsiasiCorsia: 0.01 });
  assert.equal(v.lavoraAdesso, false, "questo `true` è stato il bug: due giorni di verde su una macchina ferma");
  assert.equal(v.soloChat, true);
  assert.match(v.frase ?? "", /risponde in chat/);
  assert.match(v.frase ?? "", /2 giorni e 13 ore/, "l'età va detta a voce, non lasciata da calcolare");
});

test("macchina sana: batte la corsia dei lavori → la scorciatoia è lecita", () => {
  const v = verdettoCorsie({ oreCorsiaLavori: 0.01, oreQualsiasiCorsia: 0.01 });
  assert.deepEqual(v, { lavoraAdesso: true, soloChat: false, frase: null });
});

test("nessuno batte: non è «solo chat», è tutto fermo — decide il verdetto sull'ultimo giro", () => {
  const v = verdettoCorsie({ oreCorsiaLavori: 61, oreQualsiasiCorsia: 61 });
  assert.equal(v.lavoraAdesso, false);
  assert.equal(v.soloChat, false, "senza nessun battito non c'è una chat viva da segnalare");
  assert.equal(v.frase, null);
});

test("battito per-corsia mai scritto (worker con codice vecchio): ⚪ non è ✅", () => {
  // `worker:ultimo:all` esiste dal fix dell'11/7. Se manca, il worker lassù è più vecchio di quello:
  // non lo do per vivo, ma non invento nemmeno da quanto sarebbe fermo.
  const v = verdettoCorsie({ oreCorsiaLavori: null, oreQualsiasiCorsia: 0.01 });
  assert.equal(v.lavoraAdesso, false);
  assert.equal(v.soloChat, true);
  assert.match(v.frase ?? "", /non vedo il worker dei lavori/);
  assert.doesNotMatch(v.frase ?? "", /\d+ (ore|giorni)/, "non deve inventare un'età che non ha misurato");
});

test("il confine dei 6 minuti vale su entrambi i lati", () => {
  assert.equal(verdettoCorsie({ oreCorsiaLavori: BATTITO_ADESSO_ORE, oreQualsiasiCorsia: 0 }).lavoraAdesso, true);
  assert.equal(
    verdettoCorsie({ oreCorsiaLavori: BATTITO_ADESSO_ORE + 0.001, oreQualsiasiCorsia: 0 }).lavoraAdesso,
    false,
  );
});

test("la corsia dei lavori è `all`: è il nome della chiave che il Pannello va a leggere", () => {
  // Se questo nome cambia senza cambiare worker.sh, il Pannello legge una chiave che non esiste e
  // torna a non vedere più niente — in silenzio. Il legame va scritto, non ricordato.
  assert.equal(CORSIA_LAVORI, "all");
});
