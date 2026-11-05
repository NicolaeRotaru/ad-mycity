import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULI } from "./moduli.ts";
import {
  TIPI_MODULI,
  eTipoModulo,
  frontmatter,
  notizieDaRss,
  righeConcorrenti,
  righeDifettiSito,
  righeDocumenti,
  righeEsperimenti,
  righeNotizie,
  righeRischi,
  vociSezione,
  DIMENSIONI_SICUREZZA,
} from "./moduli-memoria.ts";

// Il difetto (Nicola, 2026-11-05 06:21): sei caselle della scheda «Mercato» dicevano «da collegare»
// per una scritta fissa nel catalogo, anche dove il dato era già in memoria.

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

// ── 🔎 concorrenti: le righe vere del radar del 10/10 ──
const RADAR = `# 🔍 Radar concorrenti

Aggiornato: 10 ottobre 2026 09:15 · @intelligence

## Dettagli
| Concorrente | Esito | Ricerca usata |
|---|---|---|
| Just Eat | Nessuna novità. Solo articoli vecchi sui rider assunti come dipendenti | «Just Eat Italia novità ottobre 2026 rider negozi» |
| Uber + Delivery Hero | Nessun aggiornamento dopo metà luglio: 41,50 € per azione ([cyprus-mail.com, 16/7/2026](https://cyprus-mail.com/x)) | «Uber Delivery Hero» |
| Treatwell | Già presente a Piacenza: fa pagare una percentuale sui clienti nuovi | «Treatwell Piacenza» |

## Controlli precedenti
| Concorrente | Esito |
|---|---|
| Vecchio | non va letto |
`;

test("concorrenti: una riga per concorrente della PRIMA tabella, link ridotti al testo, giallo solo le novità", () => {
  const r = righeConcorrenti(RADAR);
  assert.deepEqual(r.map((x) => x.titolo), ["Just Eat", "Uber + Delivery Hero", "Treatwell"]);
  assert.equal(r[0].colore, undefined);
  assert.equal(r[2].colore, "giallo");
  assert.ok(r[1].dettaglio?.includes("cyprus-mail.com, 16/7/2026"));
  assert.ok(!r[1].dettaglio?.includes("https://"), "il link grezzo non deve arrivare a schermo");
});

test("concorrenti: senza radar o senza tabella, nessuna riga inventata", () => {
  assert.deepEqual(righeConcorrenti(null), []);
  assert.deepEqual(righeConcorrenti("# Radar\n\nsolo testo"), []);
});

// ── 📄 documenti legali: i due contratti hanno lo stesso titolo ──
test("documenti: il più recente in cima, e due contratti con lo stesso titolo si distinguono dal nome", () => {
  const r = righeDocumenti([
    { percorso: "consegne/legale/contratto-venditore-bozza.md", testo: "# CONTRATTO DI ADESIONE VENDITORE — MyCity\n" },
    { percorso: "consegne/legale/2026-11-01-domande-commercialista.md", testo: "# Le domande per il commercialista, lunedì 2/11\n" },
    { percorso: "consegne/legale/contratto-pane-quotidiano-bozza.md", testo: "# CONTRATTO DI ADESIONE VENDITORE — MyCity\n" },
  ]);
  assert.equal(r[0].titolo, "Le domande per il commercialista, lunedì 2/11");
  assert.equal(r[0].meta, "01/11/2026");
  const contratti = r.filter((x) => x.titolo.startsWith("CONTRATTO"));
  assert.equal(contratti.length, 2);
  assert.notEqual(contratti[0].dettaglio, contratti[1].dettaglio);
  assert.ok(contratti.some((x) => x.dettaglio?.includes("pane quotidiano")));
  assert.equal(contratti[0].meta, "senza data");
});

// ── ⚠️ rischi normativi ──
test("rischi: solo la categoria chiesta, i chiusi fuori, alta in rosso prima di media in giallo", () => {
  const r = righeRischi(
    [
      { id: "N6", rischio: "Vendita alcolici", categoria: "normativo", gravita: "bassa", stato_mitigazione: "pianificato" },
      { id: "N2", rischio: "KYC sui negozi", categoria: "normativo", gravita: "media", stato_mitigazione: "pianificato" },
      { id: "N1", rischio: "Incasso per conto terzi", categoria: "normativo", gravita: "alta", stato_mitigazione: "in-corso", ultima_revisione: "2026-08-14" },
      { id: "B1", rischio: "Bus factor", categoria: "business", gravita: "alta", stato_mitigazione: "aperto" },
      { id: "N9", rischio: "Già sistemato", categoria: "normativo", gravita: "alta", stato_mitigazione: "chiuso" },
    ],
    "normativo",
  );
  assert.deepEqual(r.map((x) => x.titolo), ["Incasso per conto terzi", "KYC sui negozi", "Vendita alcolici"]);
  assert.deepEqual(r.map((x) => x.colore), ["rosso", "giallo", undefined]);
  assert.ok(r[0].dettaglio?.includes("rivisto il 14/08/2026"));
  assert.ok(r[0].dettaglio?.includes("in corso"));
  assert.deepEqual(righeRischi(null, "normativo"), []);
});

// ── 🩻 difetti del sito ──
test("difetti: solo aperti e solo le dimensioni chieste; bloccanti prima dei gravi; i minori in una riga col numero", () => {
  const problemi = [
    { dimensione: "rls-database", severita: "grave", stato: "aperto", titolo: "Una tabella si legge senza permesso" },
    { dimensione: "sicurezza-auth", severita: "bloccante", stato: "aperto", titolo: "Falla R7 negli accessi" },
    { dimensione: "sicurezza-auth", severita: "minore", stato: "aperto", titolo: "a" },
    { dimensione: "sicurezza-auth", severita: "minore", stato: "aperto", titolo: "b" },
    { dimensione: "sicurezza-auth", severita: "grave", stato: "chiuso", titolo: "chiuso: fuori" },
    { dimensione: "sicurezza-auth", severita: "grave", stato: "riparato", titolo: "riparato: fuori" },
    { dimensione: "sicurezza-auth", severita: "grave", stato: "doppione", titolo: "doppione: fuori" },
    { dimensione: "privacy-legale", severita: "grave", stato: "aperto", titolo: "altra dimensione: fuori" },
  ];
  const d = righeDifettiSito(problemi, DIMENSIONI_SICUREZZA, "accessi e permessi");
  assert.deepEqual(d.conti, { bloccante: 1, grave: 1, minore: 2, altre: 0 });
  assert.deepEqual(d.serie.map((x) => x.titolo), ["Falla R7 negli accessi", "Una tabella si legge senza permesso"]);
  assert.deepEqual(d.serie.map((x) => x.colore), ["rosso", "giallo"]);
  assert.equal(d.minori?.titolo, "Altri 2 difetti minori aperti: accessi e permessi");
  assert.equal(righeDifettiSito([], DIMENSIONI_SICUREZZA, "x").minori, null);
});

// ── 🗺️ lavoro aperto: la forma vera di LAVORO-APERTO.md ──
const LAVORO = `---
tipo: lavoro-aperto
aggiornato: 2026-11-04 23:43
---

## 1 · Cose che toccano a te
- **Non deve entrare**: è tua.

## 2 · Il mio lavoro sul sito

- **Il registro del sito è senza doppioni** (1/11 alle 11:46). I difetti aperti veri sono 980.
- **Il freno della veloce è online**: hai unito la #265.
  - Resta aperta la 1826: è una sotto-voce, non entra.
- **Prima di accendere la carta**, quattro cose:

## 3 · La macchina
- Non deve entrare neanche questa.
`;

test("roadmap: solo le voci di primo livello della sezione del sito; il grassetto è il titolo", () => {
  const r = vociSezione(LAVORO, "lavoro sul sito");
  assert.deepEqual(r.map((x) => x.titolo), [
    "Il registro del sito è senza doppioni",
    "Il freno della veloce è online",
    "Prima di accendere la carta",
  ]);
  assert.ok(r[0].dettaglio?.startsWith("(1/11 alle 11:46)"));
  assert.ok(r[1].dettaglio?.startsWith("hai unito"));
  assert.equal(frontmatter(LAVORO, "aggiornato"), "2026-11-04 23:43");
  assert.deepEqual(vociSezione(LAVORO, "sezione che non c'è"), []);
});

// ── 🧪 esperimenti ──
test("esperimenti: registro vuoto = nessuna riga; in corso prima, esito colorato", () => {
  assert.deepEqual(righeEsperimenti([]), []);
  assert.deepEqual(righeEsperimenti(undefined), []);
  const r = righeEsperimenti([
    { titolo: "Soglia consegna gratis a 25 €", stato: "concluso", esito: "riuscito: +12% scontrino", inizio: "2026-11-01 10:00" },
    { titolo: "Bundle colazione", stato: "in corso", ipotesi: "più scontrino", metrica: "scontrino medio" },
  ]);
  assert.deepEqual(r.map((x) => x.titolo), ["Bundle colazione", "Soglia consegna gratis a 25 €"]);
  assert.deepEqual(r.map((x) => x.colore), ["giallo", "verde"]);
  assert.ok(r[1].dettaglio?.includes("dal 01/11/2026"));
});

// ── 🗞️ notizie: la forma di Google Notizie ──
const RSS = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>"MyCity" Piacenza - Google News</title>
<item><title>Nasce MyCity, il mercato dei negozi di Piacenza - Libertà</title><link>https://news.google.com/rss/articles/ABC?oc=5</link><guid isPermaLink="false">ABC</guid><pubDate>Wed, 04 Nov 2026 23:30:00 GMT</pubDate><description>&lt;a href="x"&gt;y&lt;/a&gt;</description><source url="https://www.liberta.it">Libertà</source></item>
<item><title><![CDATA[Botteghe & centro: l'idea piace - Il Piacenza]]></title><link>https://news.google.com/rss/articles/DEF</link><pubDate>Mon, 02 Nov 2026 09:00:00 GMT</pubDate><source url="https://www.ilpiacenza.it">Il Piacenza</source></item>
<item><title>Terza &amp; ultima</title><link>javascript:alert(1)</link><pubDate>non è una data</pubDate></item>
</channel></rss>`;

test("notizie: testata tolta dal titolo, data a Roma, entità e CDATA decodificati, link solo http", () => {
  const n = notizieDaRss(RSS, 5);
  assert.equal(n.length, 3);
  assert.deepEqual(n[0], { titolo: "Nasce MyCity, il mercato dei negozi di Piacenza", fonte: "Libertà", data: "2026-11-05", link: "https://news.google.com/rss/articles/ABC?oc=5" });
  assert.equal(n[1].titolo, "Botteghe & centro: l'idea piace");
  assert.equal(n[2].titolo, "Terza & ultima");
  assert.equal(n[2].link, undefined, "un link non http non deve diventare cliccabile");
  assert.equal(n[2].data, undefined);
  assert.equal(notizieDaRss(RSS, 1).length, 1);
  assert.deepEqual(notizieDaRss(null), []);
  assert.deepEqual(notizieDaRss("<html>errore</html>"), []);
});

test("notizie: la stessa notizia nelle due ricerche si mostra una volta sola", () => {
  const n = notizieDaRss(RSS, 5);
  const r = righeNotizie([
    { etichetta: "parla di MyCity", notizie: n.slice(0, 2) },
    { etichetta: "commercio in città", notizie: n },
  ]);
  assert.equal(r.length, 3);
  assert.equal(r[0].dettaglio, "parla di MyCity · Libertà");
  assert.equal(r[0].meta, "05/11");
  assert.equal(r[2].dettaglio, "commercio in città");
});
