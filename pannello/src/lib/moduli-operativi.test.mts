process.env.TZ = "Europe/Rome"; // vedi moduli-memoria.test.mts
import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULI } from "./moduli.ts";
import {
  LIMITE_RIGHE,
  righeTabella,
  rispostaCalendario,
  rispostaCampagne,
  rispostaCatalogo,
  rispostaContatti,
  rispostaLead,
  rispostaRider,
} from "./moduli-operativi.ts";

// Nicola, 2026-11-05 09:44: «Fai le due cose». Le sei caselle che restavano «da collegare».
// I dati dei casi vengono dalle tabelle vere del sito (colonne lette da information_schema il 5/11)
// e dai file veri della memoria, accorciati.

const OGGI = "2026-11-05";
const sito = (rows: any[]) => ({ collegato: true, ok: true, rows });
const SITO_GIU = { collegato: true, ok: false, rows: [] };
const SITO_SCOLLEGATO = { collegato: false, ok: false, rows: [] };
const letto = (dati: unknown) => ({ dati, letto: true, motivo: null });
const nonLetto = (motivo: string) => ({ dati: null, letto: false, motivo });

test("nessuna casella del Pannello dice più «da collegare»", () => {
  assert.deepEqual(MODULI.filter((m) => m.stato === "placeholder").map((m) => m.titolo), []);
  for (const [titolo, tipo] of [
    ["Rider & flotta", "rider"], ["Contatti & relazioni", "contatti"], ["Lead & pipeline negozi", "lead"],
    ["Catalogo & prodotti", "catalogo"], ["Campagne", "campagne"], ["Calendario & eventi", "calendario"],
  ]) {
    assert.equal(MODULI.find((m) => m.titolo === titolo)?.lista, `/api/moduli/lista?tipo=${tipo}`, titolo);
  }
});

// ── 🚴 rider ──
test("rider: documento scaduto in rosso e in cima; in scadenza, senza assicurazione o da approvare in giallo; l'HACCP non è obbligatorio", () => {
  const r = rispostaRider(sito([
    { full_name: "Marco", is_approved: true, rider_is_online: true, rider_vehicle_type: "BIKE",
      rider_license_expires_on: "2027-01-01", rider_insurance_expires_on: "2027-01-01" },
    { full_name: "Luca", is_approved: false, approval_status: "pending", created_at: "2026-10-20T10:00:00Z" },
    { full_name: "Anna", is_approved: true, rider_license_expires_on: "2026-11-01", rider_insurance_expires_on: "2026-11-20", rider_haccp_expires_on: "2026-11-04" },
    { full_name: "Gino", is_approved: true, rider_license_expires_on: "2027-01-01" },
    { full_name: "Rita", is_approved: false, approval_status: "rejected", rider_vehicle_type: "EBIKE" },
  ]), OGGI);
  assert.deepEqual(r.righe.map((x) => x.titolo), ["Anna", "Gino", "Luca", "Marco", "Rita"]);
  assert.deepEqual(r.righe.map((x) => x.colore), ["rosso", "giallo", "giallo", "verde", undefined]);
  assert.ok(r.righe[0].dettaglio?.includes("patente scaduta il 01/11/2026") && r.righe[0].dettaglio.includes("attestato HACCP scaduto il 04/11/2026"));
  assert.ok(r.righe[0].dettaglio?.includes("assicurazione scade il 20/11/2026"));
  assert.equal(r.righe[1].dettaglio, "assicurazione: manca");
  assert.ok(!r.righe.some((x) => /HACCP: manca/.test(String(x.dettaglio))), "l'HACCP è facoltativo: non si chiede a nessuno");
  assert.equal(r.righe[2].meta, "da approvare");
  assert.equal(r.righe[3].meta, "online");
  assert.equal(r.righe[3].dettaglio, "mezzo: bici");
  assert.deepEqual([r.righe[4].meta, r.righe[4].dettaglio], ["respinto", "mezzo: bici elettrica"]);
  assert.equal(r.conta, 5);
});

test("rider: le date del sito in UTC diventano il giorno di Piacenza", () => {
  const r = rispostaRider(sito([{ full_name: "Notturno", is_approved: false, approval_status: "pending", created_at: "2026-11-04T23:30:00+00:00" }]), OGGI);
  assert.equal(r.righe[0].dettaglio, "iscritto il 05/11/2026");
});

test("rider: sito giù o non collegato = «non letto», mai «nessun rider»; letto e vuoto = lo dice", () => {
  for (const e of [SITO_GIU, SITO_SCOLLEGATO]) {
    const r = rispostaRider(e, OGGI);
    assert.equal(r.collegato, false);
    assert.ok(r.nota?.includes("Non vuol dire che non ce ne siano"));
    assert.equal(r.conta, undefined);
  }
  const vuoto = rispostaRider(sito([]), OGGI);
  assert.equal(vuoto.conta, 0);
  assert.equal(vuoto.nota, "Nessun rider iscritto sul sito.");
});

// ── 📦 catalogo ──
test("catalogo: esauriti e senza foto in cima, in giallo; stati in italiano; il numero conta i prodotti in vetrina", () => {
  const r = rispostaCatalogo(sito([
    { name: "Pane di grano duro", price: 4.5, stock: 12, status: "available", images: ["a.jpg"] },
    { name: "Focaccia", price: 3, stock: 0, status: "available", images: ["b.jpg"] },
    { name: "Grissini", price: 2, stock: null, status: "available", images: [] },
    { name: "Torta", price: 18, stock: 2, status: "draft", images: ["c.jpg"] },
    { name: "Crostata", price: 15, stock: 4, status: "sold_out", images: ["d.jpg"] },
    { name: "Biscotti", price: 6, stock: 9, status: "pending_approval", images: ["e.jpg"] },
  ]), OGGI);
  assert.deepEqual(r.righe.map((x) => [x.titolo, x.meta]), [
    ["Crostata", "esaurito"], ["Focaccia", "esaurito"], ["Grissini", "senza foto"],
    ["Biscotti", "in attesa di approvazione"], ["Torta", "bozza"], ["Pane di grano duro", "in vendita"],
  ]);
  assert.equal(r.righe[1].dettaglio, "€ 3,00 · 0 pezzi");
  assert.ok(r.righe[2].dettaglio?.includes("scorte illimitate"), "sul sito scorte vuote = illimitate");
  assert.equal(r.conta, 3, "in vetrina: Pane, Focaccia e Grissini; non la bozza, non quello in attesa, non il venduto");
});

test("catalogo: sito giù = «non letto»; nessun esaurito lo dice; al limite dice «i primi»", () => {
  assert.equal(rispostaCatalogo(SITO_GIU, OGGI).collegato, false);
  assert.equal(rispostaCatalogo(sito([{ name: "Pane", stock: 3, images: ["x"] }]), OGGI).nota, "Nessun prodotto esaurito.");
  const tanti = Array.from({ length: LIMITE_RIGHE }, (_, i) => ({ name: `P${i}`, stock: 1, images: ["x"] }));
  assert.match(String(rispostaCatalogo(sito(tanti), OGGI).nota), /primi/);
});

// ── 🎯 lead ──
const REALTA = {
  aggiornato: "2026-10-10 12:05",
  entita: [
    { nome: "Pane Quotidiano", tipo: "negozio", stato: "confermato", confidenza: 0.98 },
    { nome: "Antica Salumeria Garetti", tipo: "negozio", stato: "scelta_ragionata", confidenza: 0.78 },
    { nome: "Casa Linda", tipo: "negozio", stato: "scartato", confidenza: 1 },
    { nome: "Panificio Demo", tipo: "negozio", stato: "da_verificare", confidenza: 0.3 },
    { nome: "DB Memoria", tipo: "infrastruttura", stato: "confermato" },
  ],
};
const LEADS = [
  { name: "Forno Rossi", category: "panetteria", score: 80, rating: 4.6, reviews_count: 120, outreach_status: "to_contact" },
  { name: "Pane Quotidiano", category: "panetteria", score: 90, rating: 4.8, reviews_count: 40, outreach_status: "contacted" },
  { name: "Macelleria Bianchi", category: "macelleria", score: 50, rating: 0, outreach_status: "to_contact" },
];

test("lead: i negozi seguiti in cima (scartati fuori), poi il conto per stato e i migliori del sito", () => {
  const r = rispostaLead(letto(REALTA), sito(LEADS), OGGI);
  assert.deepEqual(r.righe.slice(0, 3).map((x) => [x.titolo, x.meta]), [["Pane Quotidiano", "sul sito"], ["Antica Salumeria Garetti", "scelto, da contattare"], ["Panificio Demo", "da verificare"]]);
  assert.equal(r.righe[0].colore, "verde");
  assert.deepEqual(r.righe.slice(3, 5).map((x) => x.titolo), ["2 negozi trovati dal sito: da contattare", "1 negozio trovato dal sito: contattato"]);
  assert.equal(r.righe[5].titolo, "Pane Quotidiano");
  assert.equal(r.righe[5].dettaglio, "panetteria · 4,8 su Google (40 recensioni)");
  assert.equal(r.conta, 5, "Pane Quotidiano è in tutte e due le fonti: si conta una volta");
  assert.ok(!r.righe.some((x) => x.titolo === "Casa Linda" || x.titolo === "DB Memoria"));
});

test("lead: una fonte non letta = lo dice e niente totale; registro senza «entita» = non letto", () => {
  const giu = rispostaLead(letto(REALTA), SITO_GIU, OGGI);
  assert.equal(giu.conta, undefined);
  assert.match(String(giu.nota), /Non letti: negozi trovati dal sito/);
  const strano = rispostaLead(letto({ aggiornato: "x", negozi: [] }), sito(LEADS), OGGI);
  assert.equal(strano.fonti[0].letta, false);
  assert.equal(strano.conta, undefined);
  assert.equal(rispostaLead(nonLetto("x"), SITO_GIU, OGGI).collegato, false);
});

// ── 📣 campagne ──
test("campagne: registro vuoto e nessun invio = la frase vera, numero 0", () => {
  const r = rispostaCampagne(letto({ aggiornato: "2026-11-05 09:51", campagne: [] }), sito([]), OGGI);
  assert.equal(r.conta, 0);
  assert.equal(r.nota, "Nessuna campagna nel registro; nessun messaggio inviato ai negozi da contattare.");
});

test("campagne: in corso prima; la riga dei messaggi è un riassunto, non una campagna", () => {
  const r = rispostaCampagne(
    letto({ campagne: [{ titolo: "Volantino di quartiere", stato: "conclusa" }, { titolo: "Post Instagram del sabato", canale: "Instagram", stato: "in corso", inizio: "2026-11-01 10:00" }] }),
    sito([{ sent_at: "2026-11-02T09:00:00Z", opened_at: "2026-11-02T10:00:00Z" }, { sent_at: "2026-11-03T09:00:00Z", replied_at: "2026-11-03T12:00:00Z" }, { sent_at: "2026-11-01T09:00:00Z", bounced: true }]),
    OGGI,
  );
  assert.deepEqual(r.righe.map((x) => x.titolo), ["Post Instagram del sabato", "Volantino di quartiere", "Messaggi ai negozi da contattare: 3 inviati"]);
  assert.ok(r.righe[0].dettaglio?.includes("dal 01/11/2026"));
  assert.equal(r.righe[2].dettaglio, "ultimo il 03/11/2026 · 1 aperto · 1 risposta · 1 tornato indietro");
  assert.equal(r.conta, 2);
});

test("campagne: «in corso» con la fine passata è conclusa; senza stato né date è «non indicato»; al limite dice «almeno»", () => {
  const r = rispostaCampagne(letto({ campagne: [{ titolo: "Vecchia", stato: "in corso", fine: "2026-09-30 18:00" }, { titolo: "Senza niente" }] }), sito([]), OGGI);
  assert.deepEqual(r.righe.map((x) => [x.titolo, x.meta, x.colore]), [["Vecchia", "conclusa", undefined], ["Senza niente", "non indicato", undefined]]);
  const tanti = Array.from({ length: LIMITE_RIGHE }, () => ({ sent_at: "2026-11-01T09:00:00Z" }));
  const p = rispostaCampagne(letto({ campagne: [] }), sito(tanti), OGGI);
  assert.match(p.righe[0].titolo, /almeno 1000 inviati/);
  assert.match(String(p.nota), /ultimi 1000/);
});

test("campagne: registro senza «campagne» o sito giù = non letto, mai «nessuna campagna»", () => {
  const r = rispostaCampagne(letto({ elenco: [] }), sito([]), OGGI);
  assert.equal(r.conta, undefined);
  assert.ok(!/nessuna campagna nel registro/i.test(String(r.nota)));
  assert.match(String(rispostaCampagne(letto({ campagne: [] }), SITO_GIU, OGGI).nota), /Non letti: messaggi ai negozi/);
});

// ── 📅 calendario ──
const EVENTI = `# 📅 Eventi e picchi di domanda

Aggiornato: 10 ottobre 2026 09:15

| Periodo | Cosa dicono le fonti | Fonte | Fiducia |
|---|---|---|---|
| ven 9 - dom 11/10 | Weekend «a due volti»: instabilità venerdì 9 | [fleetmagazine.com](https://x) | media |
| mer 14/10 | Nubi basse e nebbia sulla pianura \\| niente fenomeni | [3BMeteo](https://y) | bassa |
`;
const SCADENZE = {
  aggiornato: "2026-07-30 08:25",
  scadenze: [
    { titolo: "Bando chiuso", scadenza: "2026-07-30 16:00", stato: "chiusa_non_idonea" },
    { titolo: "Rinnovo dominio", scadenza: "2026-11-10 12:00", finestra_allarme_giorni: 7, stato: "aperta" },
    { titolo: "Dichiarazione", scadenza: "2026-11-01 23:59", stato: "aperta" },
    { titolo: "Assemblea", scadenza: "2027-03-01 10:00", stato: "aperta" },
  ],
};

test("calendario: scadenze aperte in cima per data (passata rossa, vicina gialla), poi il meteo con la fiducia; il controllo vecchio non entra nel numero", () => {
  const r = rispostaCalendario(EVENTI, "2026-10-10", letto(SCADENZE), OGGI);
  assert.deepEqual(r.righe.map((x) => x.titolo), ["Dichiarazione", "Rinnovo dominio", "Assemblea", "Meteo: ven 9 - dom 11/10", "Meteo: mer 14/10"]);
  assert.deepEqual(r.righe.slice(0, 3).map((x) => x.colore), ["rosso", "giallo", undefined]);
  assert.equal(r.righe[0].dettaglio, "passata da 4 giorni");
  assert.equal(r.righe[4].dettaglio, "Nubi basse e nebbia sulla pianura | niente fenomeni · fiducia: bassa");
  assert.equal(r.righe[4].meta, "meteo · controllo del 10/10");
  assert.equal(r.conta, 3, "il controllo è di 26 giorni fa: contano solo le 3 scadenze aperte");
  assert.match(String(r.nota), /26 giorni fa/);
});

// La forma VERA dello scadenzario vivo (cervello/scadenzario.json, 11/10) e delle tabelle eventi.
const SCAD_VIVO = {
  aggiornato: "2026-10-11 08:14",
  scadenze: [
    { id: "bando-rifiuti", titolo: "Bando rifiuti del Comune di Piacenza", scade: "2026-10-23T23:59:00+02:00", chi: "Nicola: manda al fornaio il messaggio" },
    { id: "glossario", titolo: "Glossario dei KPI: il controllo promesso per il 15/11", scade: "2026-11-15T01:00:00+01:00" },
  ],
  chiuse: [{ id: "vecchia", titolo: "Già fatta", scade: "2026-09-01T10:00:00+02:00" }],
};
const EVENTI_OTTOBRE = `# Eventi

Aggiornato: 3 novembre 2026 09:00

| Periodo | Cosa dicono le fonti | Fonte | Fiducia |
|---|---|---|---|
| mer 4/11 | Nebbia al mattino | x | media |

| Data | Evento | Dove | Peso per MyCity | Fonte |
|---|---|---|---|---|
| dom 8/11 | «Manufatto», mercato di chi produce a mano | piazza Duomo | medio-basso | y |
| sab 14/11 | Fiera | — | basso | z |

## Controlli precedenti

| Evento | Date | Rilevanza |
|---|---|---|
| Vecchio evento | agosto | non va letto |
`;
const EVENTI_AGOSTO = `# Eventi

| Data | Previsione |
|---|---|
| Mar 18/8 | Allerta gialla, rischio temporali |

| Evento | Date | Rilevanza |
|---|---|---|
| Festa del Cotechino | Sab-Dom 22-23/8 | Media/bassa |
`;

test("calendario: lo scadenzario VIVO (campo «scade» col fuso, chiuse a parte) e la tabella degli eventi per colonne", () => {
  const r = rispostaCalendario(EVENTI_OTTOBRE, "2026-11-03", letto(SCAD_VIVO), OGGI);
  assert.deepEqual(r.righe.map((x) => x.titolo), [
    "Bando rifiuti del Comune di Piacenza", "Glossario dei KPI: il controllo promesso per il 15/11",
    "«Manufatto», mercato di chi produce a mano", "Fiera", "Meteo: mer 4/11",
  ]);
  assert.equal(r.righe[0].meta, "23/10/2026");
  assert.equal(r.righe[0].colore, "rosso");
  assert.ok(r.righe[0].dettaglio?.includes("passata da 13 giorni") && r.righe[0].dettaglio.includes("chi: Nicola"));
  assert.equal(r.righe[1].meta, "15/11/2026");
  assert.equal(r.righe[2].dettaglio, "dom 8/11 · piazza Duomo · per MyCity: medio-basso");
  assert.equal(r.righe[3].dettaglio, "sab 14/11 · per MyCity: basso");
  assert.equal(r.conta, 2 + 3, "controllo fresco (2 giorni): scadenze più eventi e meteo");
  assert.ok(!r.righe.some((x) => x.titolo === "Vecchio evento" || x.titolo === "Già fatta"));
  const agosto = rispostaCalendario(EVENTI_AGOSTO, null, letto(SCAD_VIVO), OGGI);
  assert.deepEqual(agosto.righe.slice(2).map((x) => x.titolo), ["Festa del Cotechino", "Meteo: Mar 18/8"]);
});

test("calendario: senza tabella o scadenzario illeggibile = non letto; tutto non letto = non collegato", () => {
  const senza = rispostaCalendario("# Eventi\n\nsolo testo", "2026-10-10", letto(SCADENZE), OGGI);
  assert.equal(senza.fonti[1].letta, false);
  assert.match(String(senza.nota), /Non letti: eventi e meteo/);
  const strano = rispostaCalendario(EVENTI, "2026-10-10", letto({ elenco: [] }), OGGI);
  assert.equal(strano.fonti[0].letta, false);
  assert.ok(!/Nessuna scadenza/.test(String(strano.nota)), "scadenzario illeggibile non è «nessuna scadenza»");
  assert.equal(rispostaCalendario(null, null, nonLetto("x"), OGGI).collegato, false);
  assert.deepEqual(righeTabella("| Periodo | A |\n|---|---|\n| x | y \\| z |", "Periodo"), [["x", "y \\| z"]]);
});

// ── 📇 contatti ──
const MEDIA = `---
tipo: kit-stampa-mappa-media
---

# 📇 Mappa media locale di Piacenza — verificata 2026-08-17

## 1. Libertà (quotidiano dominante, carta + online) + Telelibertà (TV, stesso gruppo)

| Campo | Valore |
|---|---|
| Editore | Editoriale Libertà S.p.A. |
| Telefono | 0523.393939 |
| Email redazione quotidiano | redazione@liberta.it |

## 5. laliberta.info — trovato in ricerca, NON verificato

| Campo | Valore |
|---|---|
| Sito | laliberta.info |

## Strategia di sequenza (quando si manderà davvero)

Testo senza tabella.
`;

test("contatti: una testata per riga con telefono ed email; «NON verificato» in giallo; le sezioni senza tabella no", () => {
  const r = rispostaContatti(MEDIA, "2026-08-17", OGGI);
  assert.deepEqual(r.righe.map((x) => x.titolo), ["Libertà (quotidiano dominante, carta + online) + Telelibertà (TV, stesso gruppo)", "laliberta.info"]);
  assert.equal(r.righe[0].dettaglio, "0523.393939 · redazione@liberta.it");
  assert.equal(r.righe[1].colore, "giallo");
  assert.equal(r.righe[1].meta, "da verificare");
  assert.equal(r.conta, 2);
  assert.equal(r.fonti[0].giorni, 80);
  assert.match(String(r.nota), /solo i giornali/);
});

test("contatti: file che non si legge o senza testate = non letto, numero «—»", () => {
  assert.equal(rispostaContatti(null, null, OGGI).collegato, false);
  const vuoto = rispostaContatti("# Mappa\n\nniente", "2026-08-17", OGGI);
  assert.equal(vuoto.collegato, false);
  assert.equal(vuoto.conta, undefined);
});

test("campagne e sicurezza: la frase dopo «Non letti: …» comincia con la maiuscola", () => {
  const r = rispostaCampagne(letto({ campagne: [] }), SITO_GIU, OGGI);
  assert.equal(r.nota, "Non letti: messaggi ai negozi dal sito. Nessuna campagna nel registro.");
});

test("nessuna riga e una fonte non letta = «—», mai «0» (Campagne col registro vuoto e il sito giù)", () => {
  const r = rispostaCampagne(letto({ campagne: [] }), SITO_GIU, OGGI);
  assert.equal(r.collegato, false);
  const lead = rispostaLead(letto({ entita: [] }), SITO_GIU, OGGI);
  assert.equal(lead.collegato, false);
  const cal = rispostaCalendario("# niente", "2026-10-10", letto({ scadenze: [] }), OGGI);
  assert.equal(cal.collegato, false);
  const pieno = rispostaCampagne(letto({ campagne: [{ titolo: "Volantino" }] }), SITO_GIU, OGGI);
  assert.equal(pieno.collegato, true, "con righe da mostrare la casella resta accesa");
});

test("lead: lo stesso negozio scritto in due modi si conta una volta", async () => {
  const { nomeNegozio } = await import("./moduli-operativi.ts");
  assert.equal(nomeNegozio("Panetteria Del Corso"), nomeNegozio("Panetteria del Corso — Piacenza"));
  assert.equal(nomeNegozio("Caffè Città"), "caffe citta");
  const r = rispostaLead(letto({ entita: [{ nome: "Panetteria Del Corso", tipo: "negozio", stato: "scelta_ragionata" }] }), sito([{ name: "PANETTERIA DEL CORSO PIACENZA", outreach_status: "to_contact" }]), OGGI);
  assert.equal(r.conta, 1);
});

test("numero accanto al titolo: senza «conta» e con una fonte non letta è «—», mai le righe (che sono meno del vero)", async () => {
  const { etichettaBadge } = await import("./badge-modulo.ts");
  const base = { kpiAccesi: 0, kpiTotali: 0, statoLabel: "live", collegato: true, conta: null };
  assert.equal(etichettaBadge({ ...base, righe: [1, 2, 3, 4, 5, 6, 7, 8], parziale: true }), "—");
  assert.equal(etichettaBadge({ ...base, righe: [1, 2], parziale: false }), "2");
  assert.equal(etichettaBadge({ ...base, righe: [1, 2], conta: 58, parziale: true }), "58");
});

test("giorni che mancano: una data passata oltre il cambio d'ora non conta un giorno in più", async () => {
  const { giorniA } = await import("./moduli-operativi.ts");
  assert.equal(giorniA("2026-11-05", "2026-10-23"), -13);
  assert.equal(giorniA("2026-11-05", "2026-11-15"), 10);
  assert.equal(giorniA("2026-11-05", "2026-11-05"), 0);
});

test("catalogo: «sold» (il tasto «Esaurito» del negoziante) è esaurito, mai «nessun prodotto esaurito»", () => {
  const r = rispostaCatalogo(sito([{ name: "Focaccia", price: 3, stock: 6, status: "sold", images: ["a"] }, { name: "Pane", price: 2, stock: 5, status: "available", images: ["b"] }]), OGGI);
  assert.deepEqual([r.righe[0].titolo, r.righe[0].meta, r.righe[0].colore], ["Focaccia", "esaurito", "giallo"]);
  assert.notEqual(r.nota, "Nessun prodotto esaurito.");
});

test("rider: un HACCP scaduto è giallo (è facoltativo), non rosso come la patente", () => {
  const r = rispostaRider(sito([{ full_name: "Sara", is_approved: true, rider_license_expires_on: "2027-06-01", rider_insurance_expires_on: "2027-06-01", rider_haccp_expires_on: "2026-10-01" }]), OGGI);
  assert.equal(r.righe[0].colore, "giallo");
  assert.ok(r.righe[0].dettaglio?.includes("attestato HACCP scaduto il 01/10/2026"));
});

test("lead: «S.R.L.» e «dal 1961» non fanno contare due volte lo stesso negozio; l'indirizzo fra parentesi resta", async () => {
  const { nomeNegozio } = await import("./moduli-operativi.ts");
  assert.equal(nomeNegozio("PANE QUOTIDIANO S.R.L."), nomeNegozio("Pane Quotidiano"));
  assert.equal(nomeNegozio("Macelleria Callegari dal 1961"), nomeNegozio("Macelleria Callegari"));
  assert.notEqual(nomeNegozio("Macelleria (Via Scalabrini 16a)"), nomeNegozio("Macelleria"));
});

test("limite di 1000 righe: il numero accanto al titolo dice «almeno», mai le sole righe mostrate", async () => {
  const { etichettaBadge } = await import("./badge-modulo.ts");
  const tanti = Array.from({ length: LIMITE_RIGHE }, (_, i) => ({ full_name: `R${i}`, is_approved: true, rider_license_expires_on: "2027-06-01", rider_insurance_expires_on: "2027-06-01" }));
  const r = rispostaRider(sito(tanti), OGGI);
  assert.equal(r.conta, undefined);
  assert.equal(r.almeno, LIMITE_RIGHE);
  assert.equal(etichettaBadge({ righe: r.righe, collegato: true, conta: null, almeno: r.almeno, kpiAccesi: 0, kpiTotali: 0, statoLabel: "live" }), "1000+");
  const leads = Array.from({ length: LIMITE_RIGHE }, (_, i) => ({ name: `Negozio ${i}`, outreach_status: "to_contact" }));
  const l = rispostaLead(letto({ entita: [] }), sito(leads), OGGI);
  assert.equal(l.almeno, LIMITE_RIGHE);
});

test("calendario: una data del controllo che non si legge vale come vecchia; un messaggio è «inviato»", () => {
  const r = rispostaCalendario(EVENTI_OTTOBRE, null, letto(SCAD_VIVO), OGGI);
  assert.equal(r.conta, 2, "solo le scadenze: gli eventi di un controllo senza data non entrano nel numero");
  assert.match(String(r.nota), /data che non so leggere/);
  const c = rispostaCampagne(letto({ campagne: [] }), sito([{ sent_at: "2026-11-02T09:00:00Z" }]), OGGI);
  assert.equal(c.righe[0].titolo, "Messaggi ai negozi da contattare: 1 inviato");
});

test("contatti: una testata «NON verificato» resta in rubrica in giallo anche senza tabella", () => {
  const md = MEDIA.replace("| Campo | Valore |\n|---|---|\n| Sito | laliberta.info |\n", "Trovato in una ricerca, da controllare.\n");
  const r = rispostaContatti(md, "2026-08-17", OGGI);
  assert.deepEqual(r.righe.map((x) => [x.titolo, x.meta, x.colore]), [
    ["Libertà (quotidiano dominante, carta + online) + Telelibertà (TV, stesso gruppo)", "stampa", undefined],
    ["laliberta.info", "da verificare", "giallo"],
  ]);
});

test("catalogo: al limite di 1000 il numero è «almeno»; lo stato vuoto non è «in vendita»; «sold» non mostra i pezzi", () => {
  const tanti = Array.from({ length: LIMITE_RIGHE }, (_, i) => ({ name: `P${i}`, stock: 1, status: "available", images: ["x"] }));
  const r = rispostaCatalogo(sito(tanti), OGGI);
  assert.equal(r.conta, undefined);
  assert.equal(r.almeno, LIMITE_RIGHE);
  const v = rispostaCatalogo(sito([{ name: "Senza stato", stock: 3, status: null, images: ["x"] }, { name: "Venduto", stock: 5, status: "sold", images: ["y"] }]), OGGI);
  assert.equal(v.conta, 0, "sul sito si vede solo «available»");
  assert.equal(v.righe.find((x) => x.titolo === "Senza stato")?.meta, "stato non indicato");
  const ord = rispostaCatalogo(sito([{ name: "A in vendita", stock: 3, status: "available", images: ["x"] }, { name: "B senza stato", stock: 3, status: "", images: ["x"] }]), OGGI);
  assert.deepEqual(ord.righe.map((x) => x.titolo), ["B senza stato", "A in vendita"], "uno stato vuoto va sopra quelli in vendita: è da guardare");
  assert.equal(v.righe.find((x) => x.titolo === "Venduto")?.dettaglio, "segnato esaurito dal negozio");
});

test("lead: accenti, «S. R. L.» con gli spazi, «Bar 2000» e i nomi di sole parole vuote", async () => {
  const { nomeNegozio } = await import("./moduli-operativi.ts");
  assert.equal(nomeNegozio("Pâtisserie Dolce"), nomeNegozio("Patisserie Dolce"));
  assert.equal(nomeNegozio("Macelleria Callegari S. R. L."), nomeNegozio("Macelleria Callegari"));
  assert.notEqual(nomeNegozio("Bar 2000"), nomeNegozio("Bar"), "il numero di «Bar 2000» è il nome, non un anno");
  assert.equal(nomeNegozio("Il Piacenza"), "il piacenza", "un nome di sole parole vuote non sparisce");
});

test("campagne: con zero campagne e dei messaggi, la nota dice che il numero conta solo le campagne", () => {
  const r = rispostaCampagne(letto({ campagne: [] }), sito([{ sent_at: "2026-11-02T09:00:00Z" }, { sent_at: "2026-11-03T09:00:00Z" }]), OGGI);
  assert.equal(r.conta, 0);
  assert.match(String(r.nota), /Il numero conta solo le campagne del registro/);
});
