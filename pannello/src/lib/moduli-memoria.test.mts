// Il fuso di Piacenza anche qui: senza, una prova sul cambio d'ora resterebbe verde su una macchina
// in UTC (la CI) anche se qualcuno rimette il conto con l'ora locale (collaudo del 5/11).
process.env.TZ = "Europe/Rome";
import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULI } from "./moduli.ts";
import {
  TIPI_MODULI,
  eTipoModulo,
  frontmatter,
  lavoroSitoDaFare,
  notizieDaRss,
  righeConcorrenti,
  righeDifettiSito,
  righeDocumenti,
  righeEsperimenti,
  righeNotizie,
  righeRischi,
  rispostaConcorrenti,
  rispostaEsperimenti,
  rispostaLegale,
  rispostaRassegna,
  rispostaRoadmap,
  rispostaSicurezza,
  vociSezione,
  DIMENSIONI_SICUREZZA,
} from "./moduli-memoria.ts";

// Il difetto (Nicola, 2026-11-05 06:21): sei caselle della scheda «Mercato» dicevano «da collegare»
// per una scritta fissa nel catalogo, anche dove il dato era già in memoria.
// Il collaudo dello stesso giorno ha bocciato la prima versione: questi casi vengono da lì.

const OGGI = "2026-11-05";
const letto = (dati: unknown) => ({ dati, letto: true, motivo: null });
const nonLetto = (motivo: string) => ({ dati: null, letto: false, motivo });

const SEI = {
  "Mercato & concorrenti": "concorrenti",
  "News & rassegna stampa": "rassegna",
  "Sicurezza & accessi": "sicurezza",
  "Legale & documenti": "legale",
  Esperimenti: "esperimenti",
  "Roadmap & idee": "roadmap",
} as const;

test("le sei caselle della foto non sono più «da collegare»: ognuna ha il suo elenco vero", () => {
  for (const [titolo, tipo] of Object.entries(SEI)) {
    const m = MODULI.find((x) => x.titolo === titolo);
    assert.ok(m, `manca la casella ${titolo}`);
    assert.notEqual(m.stato, "placeholder", `${titolo} dice ancora «da collegare»`);
    assert.equal(m.lista, `/api/moduli/lista?tipo=${tipo}`, `${titolo} non legge la sua fonte`);
  }
});

test("ogni tipo che la rotta sa leggere ha la sua casella, e nessuna casella chiede un tipo sconosciuto", () => {
  const chiesti = MODULI.filter((m) => m.lista?.startsWith("/api/moduli/lista")).map((m) => new URL(m.lista!, "http://x").searchParams.get("tipo") || "");
  for (const t of chiesti) assert.ok(eTipoModulo(t), `casella con tipo sconosciuto: ${t}`);
  assert.deepEqual([...chiesti].sort(), [...TIPI_MODULI].sort());
});

// ── 🔎 concorrenti: la FORMA VERA del radar del 10/10 (righe copiate e accorciate) ──
const RADAR = `# 🔍 Radar concorrenti

Aggiornato: 10 ottobre 2026 09:15 · @intelligence

## 🆕 Novità del 10/10

### Dettagli tecnici — le novità una per una, con le fonti

**① Glovo (la società italiana si chiama Foodinho): il controllo giudiziario resta.** Confidenza 85% che il controllo sia ancora in vigore.
- 18/8: parere del pm Paolo Storari.

**② Estetiste: Treatwell è il concorrente del segmento di ottobre. Non era mai stato mappato.**
- Presenza a Piacenza: almeno un centro estetico si prenota su Treatwell.

**③ Esselunga ed Everli: Piacenza è fuori dall'accordo.** È un fatto di gennaio 2026, nuovo per il radar.

**④ CompraPiacenza.it: probabilmente fermo dal 2021.** Un documento della Camera di Commercio di Piacenza descrive il progetto.

**⑤ Nessuna novità trovata — e con quale ricerca (10/10)**

| Concorrente | Esito | Ricerca usata |
|---|---|---|
| Just Eat | Nessuna novità. Solo articoli vecchi sui rider assunti come dipendenti | «Just Eat Italia novità ottobre 2026 rider negozi» |
| Uber + Delivery Hero | Nessun aggiornamento dopo metà luglio: 41,50 € per azione ([cyprus-mail.com, 16/7/2026](https://cyprus-mail.com/x)) | «Uber Delivery Hero» |
| Cortilia | Spedizione A \\| B gratis sopra 109 € | «Cortilia» |

## Controlli precedenti

**① Vecchia novità** non va letta: è di un controllo passato.
`;

test("concorrenti: le quattro novità vere in cima e in giallo; il «⑤ Nessuna novità» non è una novità", () => {
  const r = righeConcorrenti(RADAR);
  assert.deepEqual(
    r.slice(0, 4).map((x) => x.titolo),
    [
      "Glovo (la società italiana si chiama Foodinho): il controllo giudiziario resta",
      "Estetiste: Treatwell è il concorrente del segmento di ottobre. Non era mai stato mappato",
      "Esselunga ed Everli: Piacenza è fuori dall'accordo",
      "CompraPiacenza.it: probabilmente fermo dal 2021",
    ],
  );
  assert.ok(r.slice(0, 4).every((x) => x.colore === "giallo"));
  assert.ok(r[0].dettaglio?.startsWith("Confidenza 85%"));
  assert.ok(r[1].dettaglio?.startsWith("Presenza a Piacenza"), "senza testo sulla riga, il dettaglio è la prima voce sotto");
  assert.ok(!r.some((x) => /Nessuna novità trovata|Vecchia novità/.test(x.titolo)));
});

test("concorrenti: sotto le novità, la tabella dei controlli senza novità, link e «\\|» ripuliti", () => {
  const r = righeConcorrenti(RADAR).slice(4);
  assert.deepEqual(r.map((x) => x.titolo), ["Just Eat", "Uber + Delivery Hero", "Cortilia"]);
  assert.equal(r[0].colore, undefined);
  assert.ok(r[1].dettaglio?.includes("cyprus-mail.com, 16/7/2026") && !r[1].dettaglio.includes("https://"));
  assert.equal(r[2].dettaglio, "Spedizione A | B gratis sopra 109 €");
  assert.equal(r[2].colore, "giallo");
});

test("concorrenti: file salvato con a-capo Windows dà le stesse righe", () => {
  assert.deepEqual(righeConcorrenti(RADAR.replace(/\n/g, "\r\n")), righeConcorrenti(RADAR));
});

test("concorrenti: radar che non si legge = non collegato; radar senza novità né tabella = lo dice", () => {
  assert.equal(rispostaConcorrenti(null, null, OGGI).collegato, false);
  const vuoto = rispostaConcorrenti("# Radar\n\nsolo testo", "2026-10-10", OGGI);
  assert.equal(vuoto.righe.length, 0);
  assert.ok(vuoto.nota?.includes("scheda Intelligence"));
  assert.deepEqual(rispostaConcorrenti(RADAR, "2026-10-10", OGGI).fonti, [{ nome: "radar concorrenti", data: "2026-10-10", giorni: 26, letta: true, motivo: null }]);
});

// ── 🩻 sicurezza e legale: una radiografia non letta NON è «nessun difetto» ──
const PROBLEMI = [
  { dimensione: "rls-database", severita: "grave", stato: "aperto", titolo: "Una tabella si legge senza permesso" },
  { dimensione: "sicurezza-auth", severita: "bloccante", stato: "aperto", titolo: "Falla R7 negli accessi" },
  { dimensione: "sicurezza-auth", severita: "minore", stato: "aperto", titolo: "a" },
  { dimensione: "sicurezza-auth", severita: "minore", stato: "aperto", titolo: "b" },
  { dimensione: "sicurezza-auth", severita: "strana", stato: "aperto", titolo: "gravità mai vista" },
  { dimensione: "sicurezza-auth", severita: "grave", stato: "chiuso", titolo: "chiuso: fuori" },
  { dimensione: "sicurezza-auth", severita: "grave", stato: "riparato", titolo: "riparato: fuori" },
  { dimensione: "sicurezza-auth", severita: "grave", stato: "doppione", titolo: "doppione: fuori" },
  { dimensione: "privacy-legale", severita: "grave", stato: "aperto", titolo: "Il sito non dice chi c'è dietro" },
];

test("difetti: solo aperti e solo le dimensioni chieste; bloccanti prima; minori in una riga; gravità ignota a parte", () => {
  const d = righeDifettiSito(PROBLEMI, DIMENSIONI_SICUREZZA, "accessi e permessi");
  assert.deepEqual(d.conti, { bloccante: 1, grave: 1, minore: 2, altre: 1 });
  assert.deepEqual(d.serie.map((x) => x.titolo), ["Falla R7 negli accessi", "Una tabella si legge senza permesso"]);
  assert.deepEqual(d.resto.map((x) => x.titolo), ["Altri 2 difetti minori aperti: accessi e permessi", "1 difetti aperti senza gravità nota: accessi e permessi"]);
  assert.ok(d.resto[0].dettaglio?.includes("Salute sito"), "la scheda «Cervello» non esiste nel menu");
});

test("sicurezza: il numero accanto al titolo conta i difetti, non le righe", () => {
  const r = rispostaSicurezza(letto({ problemi: PROBLEMI, sync_scan: { aggiornato: "2026-11-01 20:05" } }), OGGI);
  assert.equal(r.collegato, true);
  assert.equal(r.conta, 5);
  assert.equal(r.righe.length, 4);
  assert.equal(r.fonti[0].data, "2026-11-01");
  assert.equal(r.fonti[0].giorni, 4);
});

test("sicurezza, caso A: radiografia con fonti non lette = non collegato, mai una lista parziale", () => {
  const r = rispostaSicurezza(letto({ problemi: PROBLEMI, fonti_non_lette: [{ file: "audit-x.md" }] }), OGGI);
  assert.equal(r.collegato, false);
  assert.equal(r.righe.length, 0);
  assert.ok(r.nota?.includes("Non ho letto") && r.nota.includes("Non vuol dire che non ce ne siano"));
});

test("sicurezza, caso B: forma vecchia (difetti dentro dimensioni[].findings) si conta lo stesso", () => {
  const r = rispostaSicurezza(letto({ dimensioni: [{ chiave: "sicurezza-auth", findings: [{ severita: "grave", stato: "aperto", titolo: "vecchia forma" }] }] }), OGGI);
  assert.equal(r.collegato, true);
  assert.deepEqual(r.righe.map((x) => x.titolo), ["vecchia forma"]);
});

test("sicurezza, caso C: referto che dichiara 50 problemi senza lista = illeggibile, non «nessun difetto»", () => {
  const r = rispostaSicurezza(letto({ meta: { findings: 50 } }), OGGI);
  assert.equal(r.collegato, false);
  assert.ok(!r.nota?.startsWith("Nessun difetto"));
});

test("sicurezza: file che non si legge (GitHub giù, troppo grande) = non collegato col motivo", () => {
  const r = rispostaSicurezza(nonLetto("file troppo grande"), OGGI);
  assert.equal(r.collegato, false);
  assert.equal(r.fonti[0].motivo, "file troppo grande");
});

const REGISTRO = {
  aggiornato: "2026-08-22 12:00",
  rischi: [
    { id: "N1", rischio: "Incasso per conto terzi", categoria: "normativo", gravita: "alta", stato_mitigazione: "in-corso", ultima_revisione: "2026-08-14" },
    { id: "B1", rischio: "Bus factor", categoria: "business", gravita: "alta", stato_mitigazione: "aperto" },
  ],
};
const DOCS = [
  { percorso: "consegne/legale/contratto-venditore-bozza.md", testo: "---\ndata: 2026-06-24\nstato: BOZZA — da far validare da un legale abilitato prima dell'uso\n---\n# CONTRATTO DI ADESIONE VENDITORE — MyCity\n" },
  { percorso: "consegne/legale/2026-11-01-domande-commercialista.md", testo: "---\ndata: 2026-11-01 12:05\n---\n# Le domande per il commercialista, lunedì 2/11\n" },
  { percorso: "consegne/legale/contratto-pane-quotidiano-bozza.md", testo: "---\ndata: 2026-07-01\nstato: BOZZA — da far validare da un legale abilitato prima dell'uso\n---\n# CONTRATTO DI ADESIONE VENDITORE — MyCity\n" },
];

test("legale: tre fonti, ognuna con la sua data; il numero conta i problemi (difetti + rischi)", () => {
  const r = rispostaLegale(letto({ problemi: PROBLEMI, sync_scan: { aggiornato: "2026-11-05 06:39" } }), DOCS, letto(REGISTRO), OGGI);
  assert.equal(r.collegato, true);
  assert.deepEqual(r.fonti.map((f) => [f.nome, f.data, f.letta]), [
    ["difetti del sito", "2026-11-05", true],
    ["documenti legali", null, true],
    ["registro rischi", "2026-08-22", true],
  ]);
  assert.equal(r.fonti[2].giorni, 75, "il registro è fermo al 22/08: la casella non può dire «oggi» per tutto");
  assert.equal(r.conta, 1 + 1);
  assert.equal(r.righe[0].titolo, "Il sito non dice chi c'è dietro");
  assert.equal(r.nota, undefined);
});

test("legale, caso D: radiografia non letta = lo dice, e i difetti non spariscono in silenzio", () => {
  const r = rispostaLegale(nonLetto("troppo grande"), DOCS, letto(REGISTRO), OGGI);
  assert.equal(r.collegato, true);
  assert.ok(r.nota?.includes("Non letti: difetti del sito"));
  assert.equal(r.fonti[0].letta, false);
});

test("legale, caso E: solo il registro letto e zero rischi normativi = nessuna frase sulle fonti non lette", () => {
  const r = rispostaLegale(nonLetto("github giù"), [], letto({ aggiornato: "2026-08-22", rischi: [] }), OGGI);
  assert.ok(r.nota?.includes("Non letti: difetti del sito, documenti legali"));
  assert.ok(r.nota?.includes("nessun rischio normativo aperto"));
  assert.ok(!r.nota?.includes("nessun difetto legale"), "la radiografia non è stata letta: non si può dire «nessun difetto»");
  assert.ok(!/nessun documento/i.test(r.nota ?? ""));
});

test("legale: registro rischi non letto = «non letto», mai «nessun rischio normativo aperto»", () => {
  const r = rispostaLegale(letto({ problemi: PROBLEMI }), DOCS, nonLetto("github giù"), OGGI);
  assert.ok(r.nota?.includes("Non letti: registro rischi"));
  assert.ok(!r.nota?.includes("nessun rischio"), "il registro non è stato letto: non si può dire che è vuoto");
});

test("legale: nessuna delle tre fonti letta = non collegato", () => {
  assert.equal(rispostaLegale(nonLetto("x"), [], nonLetto("y"), OGGI).collegato, false);
});

// ── 📄 documenti legali ──
test("documenti: la data in cima vale se il nome non ce l'ha; lo stato BOZZA si vede; due contratti si distinguono", () => {
  const r = righeDocumenti(DOCS);
  assert.deepEqual(r.map((x) => x.meta), ["01/11/2026", "01/07/2026", "24/06/2026"]);
  assert.ok(r[1].dettaglio?.startsWith("BOZZA — da far validare da un legale"));
  assert.ok(r[1].dettaglio?.includes("pane quotidiano") && r[2].dettaglio?.includes("contratto venditore bozza"));
  assert.equal(righeDocumenti([{ percorso: "x/senza.md", testo: "# Senza data\n" }])[0].meta, "senza data");
});

// ── ⚠️ rischi ──
test("rischi: solo la categoria chiesta, i chiusi fuori; critica e alta in rosso prima di media in giallo", () => {
  const r = righeRischi(
    [
      { rischio: "Bassa", categoria: "normativo", gravita: "bassa" },
      { rischio: "Media", categoria: "normativo", gravita: "media" },
      { rischio: "Media-alta", categoria: "normativo", gravita: "media-alta" },
      { rischio: "Critica", categoria: "normativo", gravita: "critica" },
      { rischio: "Alta", categoria: "normativo", gravita: "alta", ultima_revisione: "2026-08-14" },
      { rischio: "Altra categoria", categoria: "business", gravita: "alta" },
      { rischio: "Chiuso", categoria: "normativo", gravita: "alta", stato_mitigazione: "chiuso" },
    ],
    "normativo",
  );
  assert.deepEqual(r.map((x) => x.titolo), ["Critica", "Alta", "Media", "Media-alta", "Bassa"]);
  assert.deepEqual(r.map((x) => x.colore), ["rosso", "rosso", "giallo", "giallo", undefined]);
  assert.ok(r[1].dettaglio?.includes("rivisto il 14/08/2026"));
  assert.deepEqual(righeRischi(null, "normativo"), []);
});

// ── 🗺️ roadmap: la forma vera di LAVORO-APERTO.md, divisa in «da fare» e «fatto» ──
const LAVORO = `---
tipo: lavoro-aperto
aggiornato: 2026-11-05 07:20
---

## 1 · Cose che toccano a te
- **Non deve entrare**: è tua.

## 2 · Il mio lavoro sul sito

### Ancora da fare

- **Il piano per aprire è partito il 31/10.** Si apre con zero bloccanti.
- **Prima di accendere la carta**, quattro cose:
  - Non pagare due volte i contanti già pagati.
  - La data della fascia quando si paga dopo mezzanotte.

### Fatto di recente

- **Il prezzo nuovo è online**: hai unito la #264.

## 3 · La macchina
- Non deve entrare neanche questa.
`;

test("roadmap: solo il lavoro ANCORA DA FARE, e le sotto-voci restano invece di sparire", () => {
  const r = rispostaRoadmap(LAVORO, OGGI);
  assert.deepEqual(r.righe.map((x) => x.titolo), ["Il piano per aprire è partito il 31/10", "Prima di accendere la carta"]);
  assert.equal(r.righe[1].dettaglio, "quattro cose");
  assert.deepEqual(r.righe[1].punti, ["Non pagare due volte i contanti già pagati", "La data della fascia quando si paga dopo mezzanotte"]);
  assert.equal(r.nota, undefined);
  assert.equal(r.fonti[0].data, "2026-11-05");
});

test("roadmap: pagina senza «Ancora da fare» = mostra tutto ma DICE che c'è anche il fatto", () => {
  const senza = LAVORO.replace("### Ancora da fare\n", "").replace("### Fatto di recente\n", "");
  const { voci, separato } = lavoroSitoDaFare(senza);
  assert.equal(separato, false);
  assert.equal(voci.length, 3);
  assert.ok(rispostaRoadmap(senza, OGGI).nota?.includes("non separa il fatto dal da fare"));
});

test("roadmap: a-capo Windows non svuotano la casella; pagina illeggibile = non collegato", () => {
  assert.deepEqual(rispostaRoadmap(LAVORO.replace(/\n/g, "\r\n"), OGGI).righe, rispostaRoadmap(LAVORO, OGGI).righe);
  assert.equal(frontmatter(LAVORO.replace(/\n/g, "\r\n"), "aggiornato"), "2026-11-05 07:20");
  assert.equal(rispostaRoadmap(null, OGGI).collegato, false);
  assert.deepEqual(vociSezione(LAVORO, "sezione che non c'è"), []);
});

// ── 🧪 esperimenti ──
test("esperimenti: registro vuoto = la frase vera; registro illeggibile = non collegato", () => {
  const vuoto = rispostaEsperimenti(letto({ aggiornato: "2026-11-05 06:30", esperimenti: [] }), OGGI);
  assert.equal(vuoto.collegato, true);
  assert.ok(vuoto.nota?.startsWith("Nessun esperimento di crescita in corso"));
  const giu = rispostaEsperimenti(nonLetto("github giù"), OGGI);
  assert.equal(giu.collegato, false);
  assert.ok(!giu.nota?.startsWith("Nessun esperimento"));
});

test("esperimenti: in corso prima; senza stato ma con esito = concluso, non «in corso»", () => {
  const r = righeEsperimenti([
    { titolo: "Soglia consegna gratis a 25 €", stato: "concluso", esito: "riuscito: +12% scontrino", inizio: "2026-11-01 10:00" },
    { titolo: "Bundle colazione", stato: "in corso", ipotesi: "più scontrino", metrica: "scontrino medio" },
    { titolo: "Senza stato", esito: "fallito" },
  ]);
  assert.deepEqual(r.map((x) => x.titolo), ["Bundle colazione", "Soglia consegna gratis a 25 €", "Senza stato"]);
  assert.deepEqual(r.map((x) => x.colore), ["giallo", "verde", "rosso"]);
  assert.equal(r[2].meta, "concluso");
});

// ── 🗞️ notizie: la forma di Google Notizie ──
const RSS = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>"MyCity" Piacenza - Google News</title>
<item><title>Nasce MyCity, il mercato dei negozi di Piacenza - Libertà</title><link>https://news.google.com/rss/articles/ABC?oc=5</link><guid isPermaLink="false">ABC</guid><pubDate>Wed, 04 Nov 2026 23:30:00 GMT</pubDate><description>&lt;a href="x"&gt;y&lt;/a&gt;</description><source url="https://www.liberta.it">Libertà</source></item>
<item><title><![CDATA[Botteghe & centro: l'idea piace - Il Piacenza]]></title><link>https://news.google.com/rss/articles/DEF</link><pubDate>Mon, 02 Nov 2026 09:00:00 GMT</pubDate><source url="https://www.ilpiacenza.it">Il Piacenza</source></item>
<item><title>Terza &amp; ultima &#99999999;</title><link>javascript:alert(1)</link><pubDate>non è una data</pubDate></item>
</channel></rss>`;

test("notizie: testata tolta dal titolo, data a Roma, CDATA decodificato, link solo http, carattere fuori misura innocuo", () => {
  const n = notizieDaRss(RSS, 5)!;
  assert.equal(n.length, 3);
  assert.deepEqual(n[0], { titolo: "Nasce MyCity, il mercato dei negozi di Piacenza", fonte: "Libertà", data: "2026-11-05", link: "https://news.google.com/rss/articles/ABC?oc=5" });
  assert.equal(n[1].titolo, "Botteghe & centro: l'idea piace");
  assert.equal(n[2].titolo, "Terza & ultima &#99999999;", "un codice fuori misura non deve buttare via tutto il feed");
  assert.equal(n[2].link, undefined);
  assert.equal(n[2].data, undefined);
  assert.equal(notizieDaRss(RSS, 1)!.length, 1);
});

test("notizie: una pagina HTML (consenso, captcha) non è un feed = «non letto», non «nessuna notizia»", () => {
  assert.equal(notizieDaRss("<html><body>Prima di continuare su Google</body></html>"), null);
  assert.equal(notizieDaRss(null), null);
  assert.deepEqual(notizieDaRss("<rss><channel></channel></rss>"), []);
});

test("rassegna: le due ricerche senza doppioni; le note dicono cosa manca e cosa è vuoto", () => {
  const n = notizieDaRss(RSS, 5)!;
  const piena = rispostaRassegna(n.slice(0, 2), n, null, OGGI);
  assert.equal(piena.righe.length, 3);
  assert.equal(piena.righe[0].dettaglio, "parla di MyCity · Libertà");
  assert.equal(piena.righe[0].meta, "05/11");
  assert.equal(piena.nota, undefined);
  assert.ok(rispostaRassegna([], n, null, OGGI).nota?.startsWith("Nessuna notizia nomina MyCity"));
  assert.ok(rispostaRassegna(null, n, null, OGGI).nota?.includes("La ricerca su MyCity non ha risposto"));
  assert.ok(rispostaRassegna([], null, null, OGGI).nota?.includes("la ricerca sulla città non ha risposto"));
  const giu = rispostaRassegna(null, null, "2026-09-01", OGGI);
  assert.equal(giu.collegato, false);
  assert.ok(giu.nota?.includes("non so dire") && giu.nota.includes("01/09/2026"));
  assert.equal(righeNotizie([]).length, 0);
});

// ════════ Terzo giro (collaudo 2, 2026-11-05): «non so leggerlo» non è «nessuno» ════════
import { etichettaBadge } from "./badge-modulo.ts";

const RADAR_NUMERATO = RADAR.replace("①", "1.").replace("②", "2.").replace("③", "3.").replace("④", "4.").replace("⑤", "5.");

test("radar: novità numerate 1. 2. 3. si leggono come ①②③", () => {
  const r = righeConcorrenti(RADAR_NUMERATO);
  assert.equal(r.filter((x) => x.meta === "novità").length, 4);
  assert.equal(r[0].titolo, "Glovo (la società italiana si chiama Foodinho): il controllo giudiziario resta");
});

test("radar: sezione Novità scritta in un modo che non so leggere = lo dice, non mostra solo «nessuna novità»", () => {
  const strano = RADAR.replace(/\*\*[①②③④]\s*([^*]+)\*\*/g, "### $1");
  const r = rispostaConcorrenti(strano, "2026-10-10", OGGI);
  assert.match(String(r.nota), /non trovo un elenco numerato/i);
});

test("radar: senza sezione Novità lo dice; la tabella «Competitor» si legge come «Concorrente»", () => {
  const vecchio = RADAR.replace(/## 🆕 Novità del 10\/10[\s\S]*?(?=\| Concorrente)/, "## Controllo del 1/9\n\n").replace("| Concorrente |", "| Competitor |");
  const r = rispostaConcorrenti(vecchio, "2026-09-01", OGGI);
  assert.equal(r.righe.length, 3);
  assert.ok(r.nota?.includes("non trovo la sezione delle novità"), String(r.nota));
});

test("concorrenti: il numero accanto al titolo conta le NOVITÀ, non le righe", () => {
  assert.equal(rispostaConcorrenti(RADAR, "2026-10-10", OGGI).conta, 4);
});

test("roadmap: anche un elenco numerato si legge; testo senza voci = «non riesco a leggerle», non «nessun lavoro»", () => {
  const numerato = LAVORO.replace("- **Il piano per aprire", "1. **Il piano per aprire").replace("- **Prima di accendere", "2. **Prima di accendere");
  assert.equal(rispostaRoadmap(numerato, OGGI).righe.length, 2);
  const prosa = LAVORO.replace(/### Ancora da fare\n\n[\s\S]*?(?=### Fatto)/, "### Ancora da fare\n\nIl piano per aprire è partito, e prima della carta servono quattro cose.\n\n");
  const r = rispostaRoadmap(prosa, OGGI);
  assert.equal(r.righe.length, 0);
  assert.ok(r.nota?.includes("non riesco a leggerne le voci"), String(r.nota));
});

test("roadmap: le sotto-voci restano intere, in un elenco a parte, non tagliate dentro il dettaglio", () => {
  const lungo = LAVORO.replace("  - La data della fascia quando si paga dopo mezzanotte.", "  - La data della fascia quando si paga dopo mezzanotte.\n  - Restano tue: la cancellazione del negozio di prova, con «Trending ora» spento lo stesso giorno, e la foto del titolare col suo consenso.");
  const r = rispostaRoadmap(lungo, OGGI).righe[1];
  assert.equal(r.dettaglio, "quattro cose");
  assert.deepEqual(r.punti, [
    "Non pagare due volte i contanti già pagati",
    "La data della fascia quando si paga dopo mezzanotte",
    "Restano tue: la cancellazione del negozio di prova, con «Trending ora» spento lo stesso giorno, e la foto del titolare col suo consenso",
  ]);
});

test("esperimenti: registro senza la lista «esperimenti» = non letto, non «nessun esperimento»", () => {
  const r = rispostaEsperimenti(letto({ aggiornato: "2026-11-05", prove: [] }), OGGI);
  assert.equal(r.collegato, false);
  assert.ok(!r.nota?.startsWith("Nessun esperimento"));
});

test("legale: registro senza la lista «rischi» = non letto, mai «nessun rischio»; il numero non conta i documenti", () => {
  const r = rispostaLegale(letto({ problemi: PROBLEMI }), DOCS, letto({ aggiornato: "2026-08-22", elenco: [] }), OGGI);
  assert.equal(r.fonti[2].letta, false);
  assert.ok(r.nota?.includes("Non letti: registro rischi") && !r.nota.includes("nessun rischio"));
  const pieno = rispostaLegale(letto({ problemi: PROBLEMI }), DOCS, letto(REGISTRO), OGGI);
  assert.equal(pieno.conta, 1 + 1, "1 difetto legale + 1 rischio normativo: i 3 documenti non sono problemi");
});

test("legale: un documento che non si apre non risulta letto", () => {
  const uno = rispostaLegale(letto({ problemi: PROBLEMI }), [DOCS[0], { percorso: "consegne/legale/contratto-x-bozza.md", testo: null }], letto(REGISTRO), OGGI);
  assert.equal(uno.fonti[1].letta, true);
  assert.equal(uno.fonti[1].motivo, "1 documento su 2 non si è aperto");
  const riga = uno.righe.find((x) => x.titolo === "contratto x bozza");
  assert.equal(riga?.meta, "non letto");
  const nessuno = rispostaLegale(letto({ problemi: PROBLEMI }), [{ percorso: "a/b.md", testo: null }], letto(REGISTRO), OGGI);
  assert.equal(nessuno.fonti[1].letta, false);
});

test("numero accanto al titolo: fonte non letta = «—», mai «0»", () => {
  const base = { kpiAccesi: 0, kpiTotali: 0, statoLabel: "live" };
  assert.equal(etichettaBadge({ ...base, righe: [], collegato: false, conta: null }), "—");
  assert.equal(etichettaBadge({ ...base, righe: [], collegato: true, conta: 0 }), "0", "letto e vuoto: lo zero è vero");
  assert.equal(etichettaBadge({ ...base, righe: [1, 2, 3], collegato: true, conta: 58 }), "58");
  assert.equal(etichettaBadge({ ...base, righe: [1, 2], collegato: true, conta: null }), "2");
  assert.equal(etichettaBadge({ ...base, righe: null, collegato: true, conta: null }), "live");
  assert.equal(etichettaBadge({ righe: null, collegato: true, conta: null, kpiAccesi: 1, kpiTotali: 2, statoLabel: "live" }), "1/2");
});

// ════════ Dopo il terzo collaudo (2026-11-05): il numero non dice «0» su ciò che non ho letto ════════

test("concorrenti: novità illeggibili o sezione assente = nessun numero di novità (mai «0» falso)", () => {
  const strano = RADAR.replace(/\*\*[①②③④]\s*([^*]+)\*\*/g, "### $1");
  assert.equal(rispostaConcorrenti(strano, "2026-10-10", OGGI).conta, undefined);
  const senza = RADAR.replace(/## 🆕 Novità del 10\/10[\s\S]*?(?=\| Concorrente)/, "## Controllo\n\n");
  assert.equal(rispostaConcorrenti(senza, "2026-10-10", OGGI).conta, undefined);
});

test("roadmap: sezione del sito assente, o in prosa senza «Ancora da fare» = non letta, mai «qui sotto c'è tutto» sul vuoto", () => {
  const rinominata = LAVORO.replace("## 2 · Il mio lavoro sul sito", "## 2 · Il sito");
  const a = rispostaRoadmap(rinominata, OGGI);
  assert.equal(a.collegato, false);
  assert.match(String(a.nota), /non trovo la sezione del lavoro sul sito/i);
  const prosa = LAVORO.replace(/### Ancora da fare\n\n[\s\S]*?(?=## 3)/, "Tutto in prosa, senza elenco.\n\n");
  const b = rispostaRoadmap(prosa, OGGI);
  assert.equal(b.collegato, false);
  assert.match(String(b.nota), /non riesco a leggerne le voci/i);
});

test("roadmap: il dettaglio di una voce tiene fino a 300 caratteri (la data del primo cliente non sparisce)", () => {
  const coda = "primo cliente in contanti giovedì 5/11 sera o venerdì 6/11";
  const lungo = LAVORO.replace("Si apre con zero bloccanti.", "Ho ricontrollato sul codice tutte le 1.213 voci aperte o dette riparate. Si apre con zero bloccanti e zero gravi del lancio, carta compresa: 7 ondate su due binari, " + coda + ".");
  assert.ok(rispostaRoadmap(lungo, OGGI).righe[0].dettaglio?.includes(coda));
});

test("legale: radiografia non letta = nessun numero di problemi (i soli rischi non sono il totale)", () => {
  assert.equal(rispostaLegale(nonLetto("x"), DOCS, letto(REGISTRO), OGGI).conta, undefined);
});

test("esperimenti: «nome» vale come «titolo»; voci che non so leggere non diventano «nessun esperimento»", () => {
  const conNome = rispostaEsperimenti(letto({ esperimenti: [{ nome: "Volantino", stato: "in_corso" }] }), OGGI);
  assert.deepEqual(conNome.righe.map((x) => x.titolo), ["Volantino"]);
  const muto = rispostaEsperimenti(letto({ esperimenti: [{ stato: "in_corso" }] }), OGGI);
  assert.equal(muto.collegato, false);
  assert.ok(!muto.nota?.startsWith("Nessun esperimento"));
});

test("radar: novità in una tabella con un'altra intestazione = lo dice, non resta zero in silenzio", () => {
  const tab = RADAR.replace(/\*\*①[\s\S]*?(?=\*\*⑤)/, "| Novità | Dettaglio |\n|---|---|\n| Glovo | il controllo resta |\n\n");
  const r = rispostaConcorrenti(tab, "2026-10-10", OGGI);
  assert.match(String(r.nota), /non trovo un elenco numerato/i);
  assert.equal(r.conta, undefined);
});

test("radar: settimana senza novità scritta in prosa = nota vera, non «non riesco a leggere»", () => {
  const prosa = RADAR.replace(/\*\*①[\s\S]*?(?=\*\*⑤)/, "Nessuna novità questa settimana: nessun concorrente si è mosso a Piacenza.\n\n");
  const r = rispostaConcorrenti(prosa, "2026-10-10", OGGI);
  assert.ok(!/non riesco/i.test(String(r.nota)), String(r.nota));
  assert.match(String(r.nota), /se ci sono novità, sono nel testo intero/i);
});

test("radar: novità scritte come titoli «### ① …» si leggono come le altre", () => {
  const titoli = RADAR.replace(/\*\*([①②③④])\s*([^*]+)\*\*.*$/gm, "### $1 $2");
  const r = rispostaConcorrenti(titoli, "2026-10-10", OGGI);
  assert.equal(r.conta, 4);
  assert.equal(r.righe[0].titolo, "Glovo (la società italiana si chiama Foodinho): il controllo giudiziario resta");
});

// ════════ Il controllo di sicurezza di Supabase nella casella Sicurezza (2026-11-05, «Fai le due cose») ════════
const SUPA = {
  aggiornato: "2026-11-05 09:51",
  avvisi: [
    { nome: "rls_enabled_no_policy", titolo: "RLS Enabled No Policy", livello: "INFO", quanti: 12, esempi: ["ai_spend_daily", "email_queue"] },
    { nome: "security_definer_view", titolo: "Security Definer View", livello: "ERROR", quanti: 7, esempi: ["a", "b", "c", "d"], link: "https://supabase.com/docs/x" },
    { nome: "nome_mai_visto", titolo: "Brand New Lint", livello: "WARN", quanti: 2 },
  ],
};

test("sicurezza + Supabase: errori rossi prima degli avvisi, nomi in italiano, totale = difetti + errori e avvisi", () => {
  const r = rispostaSicurezza(letto({ problemi: PROBLEMI, sync_scan: { aggiornato: "2026-11-01 20:05" } }), OGGI, letto(SUPA));
  const supa = r.righe.filter((x) => ["errore", "avviso", "informazione"].includes(String(x.meta)));
  assert.deepEqual(supa.map((x) => x.meta), ["errore", "avviso", "informazione"]);
  assert.equal(supa[0].titolo, "Viste che girano coi permessi di chi le ha create, non di chi le legge (7)");
  assert.equal(supa[0].colore, "rosso");
  assert.equal(supa[0].link, "https://supabase.com/docs/x");
  assert.equal(supa[1].titolo, "Brand New Lint (2)", "un controllo nuovo tiene il suo titolo");
  assert.equal(r.conta, 5 + 7 + 2, "nel totale errori e avvisi, non le 12 informazioni");
  assert.deepEqual(r.fonti.map((f) => [f.nome, f.data, f.letta]), [["difetti del sito", "2026-11-01", true], ["controllo di Supabase sul database del sito", "2026-11-05", true]]);
  assert.equal(r.nota, "Il numero somma 5 difetti del sito e 9 fra errori e avvisi di Supabase, e lo stesso oggetto può essere contato più volte; le informazioni restano fuori.");
});

test("sicurezza + Supabase: controllo mai salvato o senza «avvisi» = non letto e niente totale, mai «nessun avviso»", () => {
  const mai = rispostaSicurezza(letto({ problemi: PROBLEMI }), OGGI, { dati: null, letto: true, motivo: null });
  assert.equal(mai.conta, undefined);
  assert.match(String(mai.nota), /Non letti: controllo di Supabase/);
  assert.equal(mai.fonti[1].motivo, "non ancora salvato in memoria");
  const strano = rispostaSicurezza(letto({ problemi: PROBLEMI }), OGGI, letto({ aggiornato: "2026-11-05", lints: [] }));
  assert.equal(strano.fonti[1].letta, false);
  assert.ok(!/nessun avviso/i.test(String(strano.nota)));
  const soloSupa = rispostaSicurezza(nonLetto("github giù"), OGGI, letto(SUPA));
  assert.equal(soloSupa.collegato, true);
  assert.equal(soloSupa.conta, undefined);
  assert.match(String(soloSupa.nota), /Non letti: difetti del sito/);
});

test("sicurezza + Supabase: un avviso elencato con quanti 0 vale 1, mai zero; legale senza tutte le fonti non dà numero", () => {
  const r = rispostaSicurezza(letto({ problemi: [], meta: { findings: 0 } }), OGGI, letto({ aggiornato: "2026-11-05 09:46", avvisi: [{ nome: "security_definer_view", livello: "ERROR", quanti: 0 }] }));
  assert.equal(r.conta, 1);
  assert.ok(!/nessun avviso/i.test(String(r.nota)));
  assert.equal(rispostaLegale(letto({ problemi: PROBLEMI }), DOCS, nonLetto("github giù"), OGGI).conta, undefined);
  assert.equal(rispostaLegale(letto({ problemi: PROBLEMI }), [], letto(REGISTRO), OGGI).conta, undefined);
});

test("sicurezza + Supabase: un controllo vecchio di più di 7 giorni si vede ma non entra nel numero", () => {
  const r = rispostaSicurezza(letto({ problemi: PROBLEMI }), OGGI, letto({ ...SUPA, aggiornato: "2026-10-20 10:00" }));
  assert.equal(r.conta, 5);
  assert.match(String(r.nota), /16 giorni fa: si vede ma non entra nel numero/);
  assert.ok(r.righe.some((x) => x.meta === "errore"), "le righe di Supabase restano visibili");
});

test("giorni di calendario: il cambio d'ora di ottobre e di primavera non sposta il conto", async () => {
  const { giorniTra } = await import("./moduli-memoria.ts");
  assert.equal(giorniTra("2026-11-05", "2026-10-23"), -13);
  assert.equal(giorniTra("2027-03-28", "2027-03-27"), -1);
  assert.equal(giorniTra("2027-03-27", "2027-03-28"), 1);
  assert.equal(giorniTra("2026-11-05", "2027-04-10"), 156);
  assert.equal(giorniTra("x", "2026-11-05"), null);
});

test("sicurezza + Supabase: con gli oggetti diversi contati, il totale usa quelli (62 erano 47) e la nota lo dice", () => {
  const r = rispostaSicurezza(letto({ problemi: PROBLEMI }), OGGI, letto({ ...SUPA, oggetti_distinti: 6 }));
  assert.equal(r.conta, 5 + 6);
  assert.match(String(r.nota), /6 oggetti con errori o avvisi di Supabase/);
});

test("giorni: una data impossibile non diventa un'altra; una data nel futuro non è «fresca»", async () => {
  const { giorniTra } = await import("./moduli-memoria.ts");
  assert.equal(giorniTra("2026-11-05", "2026-13-01"), null);
  assert.equal(giorniTra("2026-11-05", "2026-11-31"), null);
  const futuro = rispostaSicurezza(letto({ problemi: PROBLEMI }), OGGI, letto({ ...SUPA, aggiornato: "2026-12-01 10:00" }));
  assert.equal(futuro.fonti[1].giorni, null);
  assert.equal(futuro.conta, 5, "un controllo con la data nel futuro non entra nel numero");
});
