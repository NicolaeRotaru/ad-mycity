#!/usr/bin/env node
// La metà più grossa che il lotto 20 aveva lasciato scoperta — e l'aveva detto nel corpo della PR
// #589: «sulla stessa rotta viaggia `auto-radiografia.json`, ancora inoltrato intero. È la metà più
// grossa del problema e merita il suo lotto».
//
// Misurato il 28/7: il file è **614.805 byte**, riscaricati ogni 30 secondi insieme al cantiere.
// Dentro, i findings pesano 531.074 byte — e **109 su 170 sono chiusi** (338.175 byte) che il
// componente **filtra via prima di disegnarli** (`RadiografiaDiSe.tsx:278`). Viaggiavano per essere
// scartati all'arrivo.
//
// Non chiude un difetto del cantiere: nessuno lo copre. Chiude un residuo che avevo dichiarato io.
//
// ── Verificato, non assunto ─────────────────────────────────────────────────
//
// Su AR-250 il difetto giurava che i chiusi «non sono a video» e invece lo erano: seguirlo alla
// lettera avrebbe svuotato una sezione. Qui ho guardato il componente PRIMA, e la risposta è
// l'opposto — gli aperti si disegnano, i chiusi no. Stessa domanda, risposta diversa: è il motivo
// per cui si guarda invece di assumere.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { CAMPI_FINDING, eChiusoFinding, radiografiaSnella } = await import(join(REPO, "pannello/src/lib/radiografia-snella.ts"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};
const peso = (o) => Buffer.byteLength(JSON.stringify(o));

prova("il caso che ha rotto: i findings CHIUSI non viaggiano più", () => {
  const r = {
    dimensioni: [{
      key: "una", voto: 7, stato: "giallo", sintesi: "s",
      findings: [
        { titolo: "aperto", stato: "aperto", descrizione: "x".repeat(500) },
        { titolo: "chiuso", stato: "chiuso", descrizione: "y".repeat(3000), fix: "z".repeat(2000) },
      ],
    }],
  };
  const out = radiografiaSnella(r);
  assert.equal(out.dimensioni[0].findings.length, 1, "resta solo l'aperto: il chiuso lo scarta la scheda");
  assert.equal(out.dimensioni[0].findings[0].titolo, "aperto");
  assert.ok(peso(out) < peso(r) / 3);
});

prova("il CONTEGGIO dei chiusi resta: «0 aperti» e «0 aperti, 12 chiusi» non dicono la stessa cosa", () => {
  const r = { dimensioni: [{ key: "k", findings: [
    { titolo: "a", stato: "chiuso" }, { titolo: "b", stato: "chiuso" }, { titolo: "c", stato: "aperto" },
  ] }] };
  const out = radiografiaSnella(r);
  assert.equal(out.dimensioni[0].findings_chiusi, 2, "per dimensione");
  assert.equal(out.findings_chiusi_non_inviati, 2, "e in totale, così il taglio è dichiarato e non nascosto");
});

prova("di un finding aperto restano i campi che la scheda disegna, non tutto l'oggetto", () => {
  const f = { titolo: "t", stato: "aperto", severita: "grave", fix: "come", roba_interna: "x".repeat(900) };
  const [voce] = radiografiaSnella({ dimensioni: [{ findings: [f] }] }).dimensioni[0].findings;
  assert.equal(voce.fix, "come", "il fix è a video: resta");
  assert.equal(voce.roba_interna, undefined, "i campi che nessuno mostra non viaggiano");
  assert.ok(CAMPI_FINDING.includes("severita"));
});

prova("le chiavi di primo livello che la scheda non legge non viaggiano", () => {
  const out = radiografiaSnella({ sintesi: "resta", sync_scan: { roba: "x".repeat(400) }, inventata: "via" });
  assert.equal(out.sintesi, "resta");
  assert.equal(out.inventata, undefined);
  assert.equal(out.sync_scan, undefined, "sync_scan lo usa calcolaLive lato server, non la scheda");
});

prova("una radiografia malformata non fa saltare la schermata", () => {
  assert.equal(radiografiaSnella(null), null);
  assert.deepEqual(radiografiaSnella({}).findings_chiusi_non_inviati, 0);
  // Trovato da questa prova mentre la scrivevo: il modulo inoltrava la stringa così com'è, e il
  // componente ci fa sopra un `.map` — la schermata sarebbe sparita. Ora diventa una lista vuota.
  assert.deepEqual(radiografiaSnella({ dimensioni: "non-una-lista" }).dimensioni, []);
  assert.deepEqual(radiografiaSnella({ dimensioni: [null, { findings: null }] }).dimensioni[0].findings, []);
  assert.equal(eChiusoFinding({}), false, "senza stato non si presume chiuso: sarebbe un finding che sparisce");
});

// ── Il guadagno vero, sul file di oggi ──────────────────────────────────────

prova("sul file VERO lo sfoltimento risparmia almeno quanto pesano i chiusi che butta", () => {
  const vero = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json"), "utf8"));
  const prima = peso(vero);
  const dopo = peso(radiografiaSnella(vero));
  const risparmio = 1 - dopo / prima;

  // 29/7 — CORREZIONE. Qui c'era un pavimento fisso al 45% misurato sul file di ieri, quando 109
  // findings su 170 erano CHIUSI. Il 29/7 è atterrata una radiografia fresca: 89 findings e ZERO
  // chiusi. Lo sfoltimento butta via i chiusi — senza chiusi non c'è niente da buttare, e il
  // risparmio è sceso al 4%. Il codice non è cambiato di una riga: era il DATO a essere cambiato.
  //
  // Il test misurava i dati e li spacciava per il codice, quindi sarebbe tornato rosso a ogni
  // radiografia nuova — cioè proprio quando la macchina fa il suo lavoro. È la stessa lezione già
  // pagata in permessi-check.test.mjs: «un test che punisce chi risolve il problema è peggio di
  // nessun test, perché insegna a non risolverlo». E teneva rossa la suite CONDIVISA per tutti,
  // che è il modo in cui un cancello diventa qualcosa da aggirare (AR-346).
  //
  // La soglia resta identica dov'è misurabile. Quello che cambia è che adesso il test sa dire
  // «non c'era niente da sfoltire» invece di dire «il digest è rotto»: sono due cose diverse, e
  // confonderle è il difetto. Un ⚪ non è un ✅ — per questo lo stampa invece di tacere.
  // 4/8 — LA SECONDA METÀ DELLA STESSA CORREZIONE (AR-556). Il 29/7 la cura era binaria: zero
  // chiusi → non misurabile, un chiuso qualsiasi → pretendi il 45%. Ma il 45% era il numero del
  // file di ieri, dove i chiusi erano 109 su 170 (64%). Oggi sono 11 su 123 (9%): non c'è modo di
  // risparmiare il 45% buttando il 9% del contenuto, e il test bocciava — su main puro, quindi su
  // OGNI pull request aperta, per un dato che cambia da sé a ogni «riconcilia». Un cancello che
  // scatta per moto proprio del dato insegna a ignorare la CI: è il difetto, non la sua prova.
  //
  // La soglia adesso la dettano i dati: lo sfoltimento butta i chiusi, quindi DEVE risparmiare
  // almeno quanto pesano — qualunque sia la loro quota, oggi il 9% e domani il 64%. Il margine
  // 0.9 assorbe il rumore della serializzazione (virgole e parentesi che spariscono con l'ultimo
  // elemento), non è spazio per un fix pigro. Chi spegne il filtro dei chiusi fa crollare il
  // risparmio sotto la loro quota-byte, e questa riga diventa rossa: è la mutazione che la prova.
  const tutti = (vero.dimensioni || []).flatMap((d) => (d && d.findings) || []);
  const soloChiusi = tutti.filter((f) => eChiusoFinding(f));
  const quotaChiusi = peso(soloChiusi) / prima;

  if (!soloChiusi.length) {
    console.log(
      `      # ⚪ non misurabile oggi: ${tutti.length} findings, nessuno chiuso — niente da sfoltire ` +
        `(${prima.toLocaleString()} → ${dopo.toLocaleString()} byte, −${Math.round(risparmio * 100)}%). ` +
        `La soglia torna a valere alla prima radiografia con findings chiusi.`,
    );
    return;
  }
  // Nessun chiuso sopravvive: la proprietà che lo sfoltimento promette, controllata sul dato vero
  // e non solo sulla finta — è ciò che rende il risparmio dovuto, invece che sperato.
  const sopravvissuti = ((radiografiaSnella(vero).dimensioni || []).flatMap((d) => (d && d.findings) || [])).filter((f) => eChiusoFinding(f));
  assert.equal(sopravvissuti.length, 0, `${sopravvissuti.length} findings chiusi sono sopravvissuti allo sfoltimento`);
  assert.ok(
    risparmio >= quotaChiusi * 0.9,
    `i chiusi pesano il ${Math.round(quotaChiusi * 100)}% del file ma lo sfoltimento ha risparmiato solo il ${Math.round(risparmio * 100)}% (${prima} → ${dopo}): non li sta buttando`,
  );
  console.log(`      # ${prima.toLocaleString()} → ${dopo.toLocaleString()} byte (−${Math.round(risparmio * 100)}%, atteso ≥${Math.round(quotaChiusi * 90)}% dai ${soloChiusi.length}/${tutti.length} chiusi)`);
});

// E la guardia che il caso qui sopra non deve spegnere: su un file CHE HA chiusi, la soglia vale
// eccome. Senza questa, «condizionata» diventerebbe «disattivata» al primo che legge di fretta.
prova("con findings chiusi la soglia del 45% vale ancora, e SUONA se lo sfoltimento smette", () => {
  // Il fixture usa SOLO campi che sopravvivono allo sfoltimento (CAMPI_FINDING). È il punto: così
  // il taglio dei campi non risparmia un byte, e l'unico risparmio possibile viene dal buttare i
  // findings CHIUSI — che è la cosa che questa prova deve sorvegliare.
  //
  // Scritto la prima volta con campi grassi fuori elenco (`dettaglio`, `prova`) la prova restava
  // VERDE anche spegnendo il filtro dei chiusi: il risparmio arrivava tutto dal taglio dei campi e
  // mascherava il difetto. L'ha trovato la mutazione, non la lettura — ed è esattamente perché il
  // cantiere pretende di rompere il fix apposta invece di fidarsi del verde.
  const grasso = (stato) => ({
    stato,
    titolo: "x".repeat(200),
    descrizione: "y".repeat(2000),
    causa_radice: "z".repeat(2000),
  });
  const finto = { dimensioni: [{ nome: "d", findings: [...Array(9)].map(() => grasso("chiuso")).concat(grasso("aperto")) }] };
  const risparmio = 1 - peso(radiografiaSnella(finto)) / peso(finto);
  assert.ok(risparmio >= 0.45, `su dati con 9/10 chiusi lo sfoltimento deve tagliare ≥45%, ha tagliato ${Math.round(risparmio * 100)}%`);
});

prova("nessun finding APERTO si perde: sono quello che Nicola legge", () => {
  const vero = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json"), "utf8"));
  const apertiVeri = (vero.dimensioni || []).flatMap((d) => (d.findings || []).filter((f) => f.stato !== "chiuso"));
  const out = radiografiaSnella(vero);
  const mandati = out.dimensioni.flatMap((d) => d.findings);
  assert.equal(mandati.length, apertiVeri.length, "gli aperti non si troncano MAI");
  const titoliVeri = new Set(apertiVeri.map((f) => String(f.titolo)));
  for (const f of mandati) assert.ok(titoliVeri.has(String(f.titolo)));
});

prova("i chiusi sono davvero filtrati dalla scheda: la premessa del taglio, verificata", () => {
  // Se un giorno il componente smettesse di filtrarli, questo taglio diventerebbe una sezione vuota.
  // La premessa va provata, non ricordata — è esattamente l'errore di AR-250 al contrario.
  const src = readFileSync(join(REPO, "pannello/src/components/cervello/RadiografiaDiSe.tsx"), "utf8");
  assert.match(src, /\.findings \|\| \[\]\)\.filter\(\(f\) => \(f as Finding & \{ stato\?: string \}\)\.stato !== "chiuso"\)/,
    "la scheda deve continuare a scartare i findings chiusi: è la ragione per cui non li mandiamo");
});

prova("l'ordine conta: si conta PRIMA di sfoltire", () => {
  const src = readFileSync(join(REPO, "pannello/src/app/api/memoria/auto-radiografia/route.ts"), "utf8");
  assert.ok(src.indexOf("calcolaLive(radiografia, cantiere)") < src.indexOf("radiografiaSnella(radiografia)"),
    "invertendo, i totali si conterebbero su una radiografia già sfoltita e scenderebbero da soli");
  assert.match(src, /radiografia: radiografiaRidotta/);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
