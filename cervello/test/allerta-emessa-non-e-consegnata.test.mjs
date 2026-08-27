// 📣🫀 AR-365 e AR-366 — DUE SEGNALI CHE DICHIARANO UNA COSA SENZA CHE SIA VERA.
//
// Sono la stessa malattia detta due volte, ed e' per questo che stanno in un lotto solo:
//   · AR-365 — «allerta emessa» non e' «allerta consegnata». Il canale unico (Telegram) non e' mai
//     stato collegato: `pingTelegram` usciva muto, e la riga SUBITO DOPO scriveva «data» nello stato.
//     Da li' il dedup la considerava mandata e non riprovava. La macchina e' rimasta morta 36 ore.
//   · AR-366 — «processo vivo» non e' «macchina che lavora». Il battito sta in cima al ciclo, dove
//     non sa ancora cosa succedera': un processo su col motore AI giu' batte lo stesso, e la
//     sentinella che legge quel battito resta muta. E' il guasto piu' probabile di questa macchina,
//     e cade esattamente nel punto cieco fra le due domande che un segnale solo prova a coprire.
//
// Ogni caso qui sotto ESEGUE la decisione. Nessuna parola cercata in un file: la domanda «e' stata
// consegnata?» ha una risposta che si calcola, e una ricerca di testo non la calcola.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { esitoConsegna, vaSegnataComeData, refertoConsegna, consegnaAllerta, vivoMaNonProduce } from "../consegna-allerta.mjs";
import { valutaRegole } from "../sentinella-dati.mjs";

// ── AR-365 · la ricevuta ─────────────────────────────────────────────────────

test("AR-365 · il caso vero delle 36 ore: nessun canale configurato NON e' «consegnata»", async () => {
  const esito = await consegnaAllerta({ chiave: "worker_morto" }, [
    { nome: "telegram", manda: async () => { throw new Error("non configurato: manca il token o la chat"); } },
  ]);
  assert.equal(esito.consegnata, false);
  assert.equal(vaSegnataComeData(esito), false, "se si segnasse come data, il dedup la spegnerebbe per sempre");
});

test("AR-365 · zero canali provati non e' consegnata: e' la situazione delle 36 ore", () => {
  assert.equal(esitoConsegna([]).consegnata, false);
  assert.equal(vaSegnataComeData(esitoConsegna([])), false);
});

test("AR-365 · basta UN canale con ricevuta perche' sia consegnata", async () => {
  const esito = await consegnaAllerta({ chiave: "x" }, [
    { nome: "card", manda: async () => {} },
    { nome: "telegram", manda: async () => { throw new Error("non configurato"); } },
  ]);
  assert.equal(esito.consegnata, true);
  assert.deepEqual(esito.riusciti, ["card"]);
  assert.equal(vaSegnataComeData(esito), true);
});

test("AR-365 · i canali si provano TUTTI: un canale rotto e' un difetto da vedere, non da nascondere", async () => {
  const visti = [];
  const esito = await consegnaAllerta({ chiave: "x" }, [
    { nome: "card", manda: async () => { visti.push("card"); } },
    { nome: "telegram", manda: async () => { visti.push("telegram"); throw new Error("ha risposto 500"); } },
  ]);
  assert.deepEqual(visti, ["card", "telegram"], "non ci si ferma al primo che riesce");
  assert.equal(esito.falliti.length, 1);
  assert.match(esito.falliti[0].motivo, /500/);
});

test("AR-365 · un fallimento non e' muto: il referto dice cosa NON e' arrivato e a chi", () => {
  const esito = esitoConsegna([{ canale: "telegram", riuscito: false, motivo: "non configurato" }]);
  const t = refertoConsegna({ chiave: "worker_morto" }, esito);
  assert.match(t, /NON consegnata/);
  assert.match(t, /telegram \(non configurato\)/);
  assert.match(t, /al giro dopo si riprova/, "chi legge deve sapere che non e' persa");
});

// ── AR-366 · vivo non vuol dire che lavora ───────────────────────────────────

const SOGLIA = 90;

test("AR-366 · il caso vero: batte da poco, non chiude un lavoro da ore, e la coda e' piena", () => {
  const v = vivoMaNonProduce({ battitoMin: 1, lavoroRiuscitoMin: 300, inAttesa: 4, sogliaMin: SOGLIA });
  assert.equal(v.allerta, true, "e' il guasto che M1 per costruzione non puo' vedere");
  assert.match(v.perche, /300 min/);
});

test("AR-366 · non ha MAI chiuso un lavoro bene, con la coda piena: suona", () => {
  assert.equal(vivoMaNonProduce({ battitoMin: 2, lavoroRiuscitoMin: null, inAttesa: 3, sogliaMin: SOGLIA }).allerta, true);
});

test("AR-366 · coda vuota: NON suona. Non produrre senza lavoro da fare e' riposo, non un guasto", () => {
  const v = vivoMaNonProduce({ battitoMin: 1, lavoroRiuscitoMin: 9999, inAttesa: 0, sogliaMin: SOGLIA });
  assert.equal(v.allerta, false, "un allarme che grida su una macchina sana e' un allarme che qualcuno spegne");
});

test("AR-366 · battito vecchio: NON suona questa, suona quella del worker morto", () => {
  const v = vivoMaNonProduce({ battitoMin: 400, lavoroRiuscitoMin: 900, inAttesa: 5, sogliaMin: SOGLIA });
  assert.equal(v.allerta, false, "due allarmi per lo stesso guasto insegnano a ignorarli entrambi");
});

test("AR-366 · ha chiuso un lavoro bene di recente: non suona", () => {
  assert.equal(vivoMaNonProduce({ battitoMin: 1, lavoroRiuscitoMin: 10, inAttesa: 7, sogliaMin: SOGLIA }).allerta, false);
});

test("AR-366 · non so quando ha battuto: non suona, e lo dice", () => {
  const v = vivoMaNonProduce({ battitoMin: null, lavoroRiuscitoMin: 999, inAttesa: 5, sogliaMin: SOGLIA });
  assert.equal(v.allerta, false);
  assert.match(v.perche, /non so/);
});

// ── I DUE PEZZI SONO AGGANCIATI DOVE SERVE ───────────────────────────────────
// Le prove sopra dimostrano che le decisioni rispondono bene. Queste dimostrano che qualcuno gliele
// chiede: una funzione giusta che nessuno chiama non ha mai suonato niente, ed e' com'era prima.

test("AR-365 · la sentinella scrive «data» SOLO dietro la ricevuta", () => {
  const s = readFileSync(new URL("../sentinella-dati.mjs", import.meta.url), "utf8");
  const i = s.indexOf("if (vaSegnataComeData(esito))");
  assert.notEqual(i, -1, "senza questa guardia si torna a segnare come data un'allerta mai arrivata");
  const dopo = s.slice(i, i + 400);
  assert.match(dopo, /state\.regole\[ev\.chiave\]/, "la guardia deve stare PRIMA della scrittura, non altrove");
});

test("AR-365 · il primo canale della cascata e' quello che non puo' mancare", () => {
  const s = readFileSync(new URL("../sentinella-dati.mjs", import.meta.url), "utf8");
  const i = s.indexOf("export function canaliAllerta()");
  assert.notEqual(i, -1);
  const corpo = s.slice(i, i + 600);
  const primaCard = corpo.indexOf("AZIONI-IN-ATTESA");
  const primaTg = corpo.indexOf("telegram");
  assert.ok(primaCard !== -1 && primaCard < primaTg, "il canale che c'e' sempre deve venire prima di quello che puo' mancare");
});

test("AR-366 · il worker timbra il secondo segnale SOLO su un lavoro andato bene", () => {
  const w = readFileSync(new URL("../worker.sh", import.meta.url), "utf8");
  assert.match(w, /lavoro_riuscito\(\)/, "manca la funzione che timbra");
  assert.match(w, /\[ "\$stato" = "fatto" \] && lavoro_riuscito/, "il timbro deve stare dietro l'esito «fatto», altrimenti torna a dire «sono acceso»");
});

test("AR-366 · la sentinella legge il segnale nuovo, non solo il battito", () => {
  const s = readFileSync(new URL("../sentinella-dati.mjs", import.meta.url), "utf8");
  assert.match(s, /worker:ultimo:lavoro-riuscito/, "senza leggerlo, la regola guarderebbe un campo sempre vuoto e non suonerebbe mai");
  assert.match(s, /vivoMaNonProduce\(\{/, "la regola deve essere chiamata, non solo scritta");
});

test("AR-366 — la sentinella CHIAMA la regola: non basta che la regola sia scritta bene", () => {
  // 27/8, AR-840 — i quattro casi qui sopra provano `vivoMaNonProduce` presa da sola, e la mutazione
  // che spegne la CHIAMATA dentro `sentinella-dati.mjs` li lasciava tutti verdi. È la malattia di
  // casa vista dal lato del chiamante: una regola giusta che non suona mai perché nessuno la
  // interroga. Qui si esegue `valutaRegole` col mondo finto e si guarda se l'allarme esce davvero.
  const acceso = {
    worker_eta_min: 1,            // il cervello batte: M1 tace
    lavoro_riuscito_eta_min: 600, // e non chiude niente da dieci ore
    lavori_in_attesa: 4,          // con la coda piena: non è riposo, è un guasto
    lavori_in_corso: 0,
  };
  const eventi = valutaRegole(acceso, {}) || [];
  const suona = eventi.some((e) => e?.chiave === "worker_vivo_ma_muto");
  assert.ok(suona, "la regola è scritta e non la chiama nessuno: il cervello resterebbe muto senza che nessuno lo dica");

  // E il verso opposto, o sarebbe una prova inchiodata su un lato solo: senza niente da fare, non
  // produrre non è un guasto — è riposo, e un allarme che grida di notte lo stacca qualcuno.
  const riposo = { ...acceso, lavori_in_attesa: 0 };
  assert.ok(
    !(valutaRegole(riposo, {}) || []).some((e) => e?.chiave === "worker_vivo_ma_muto"),
    "suona su una macchina che sta solo riposando",
  );
});
