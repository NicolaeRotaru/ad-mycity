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

test("legale: tre fonti, ognuna con la sua data; il numero conta difetti + documenti + rischi", () => {
  const r = rispostaLegale(letto({ problemi: PROBLEMI, sync_scan: { aggiornato: "2026-11-05 06:39" } }), DOCS, letto(REGISTRO), OGGI);
  assert.equal(r.collegato, true);
  assert.deepEqual(r.fonti.map((f) => [f.nome, f.data, f.letta]), [
    ["difetti del sito", "2026-11-05", true],
    ["documenti legali", null, true],
    ["registro rischi", "2026-08-22", true],
  ]);
  assert.equal(r.fonti[2].giorni, 75, "il registro è fermo al 22/08: la casella non può dire «oggi» per tutto");
  assert.equal(r.conta, 1 + 3 + 1);
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
  assert.equal(righeDocumenti([{ percorso: "x/senza.md", testo: null }])[0].meta, "senza data");
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

test("roadmap: solo il lavoro ANCORA DA FARE, e le sotto-voci entrano nel dettaglio invece di sparire", () => {
  const r = rispostaRoadmap(LAVORO, OGGI);
  assert.deepEqual(r.righe.map((x) => x.titolo), ["Il piano per aprire è partito il 31/10", "Prima di accendere la carta"]);
  assert.equal(r.righe[1].dettaglio, "quattro cose: · Non pagare due volte i contanti già pagati · La data della fascia quando si paga dopo mezzanotte");
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
