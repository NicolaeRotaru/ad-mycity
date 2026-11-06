#!/usr/bin/env node
// 🏪 IL DIGEST TIENE IL LAVORO DELLA CASA — rifare il registro del sito non cancella quello scritto dopo il referto.
//
// LA MALATTIA. `radiografia-marketplace-digest.mjs` rifà il registro del sito partendo dall'ultimo referto
// grezzo di ogni famiglia. Per le voci che ritrovava nel grezzo, `fondiConLaCasa` teneva dalla casa solo sei
// campi (stato, nota_riparazione, chiuso_il, chiuso_da, riaperto_il, riaperto_da) e riprendeva tutto il
// resto dal grezzo. Ma la casa, dopo il referto, la scrivono le riparazioni: `riparato_il`, `riparato_da`,
// la `prova` vera che gira al posto di quella del cercatore, `riverifica_1_11`, `nota_5_11`, una gravità
// riclassificata. Misurato il 6/11 da un collaudatore sulla radiografia del design dell'11/10: un digest
// nuovo avrebbe tolto campi a 47 voci e riportato `prova` e `prova_tipo` al valore vecchio su 31. Ricontato
// qui sulla stessa casa: anche la famiglia del codice (referto del 5/11) perdeva campi su 310 voci, con la
// prova rimessa indietro su 231. Il prompt della radiografia in 12 sessioni aggirava il danno con una copia
// prima del digest e un ripristino dopo.
//
// COSA PROVA QUESTO FILE:
//   ① sulla fusione: una voce della casa con campi in più, una prova aggiornata e una gravità riclassificata
//      esce dal digest con TUTTI i suoi campi com'erano
//   ② il grezzo riempie solo i campi che la casa non ha (assenti o null); un campo svuotato a mano resta vuoto
//   ③ una voce che era «fuori dal referto» e ci ritorna perde la bandiera
//   ④ IL DIGEST VERO, lanciato su una copia in una cartella temporanea, con lo stesso referto già letto:
//      ogni voce della casa resta uguale, campo per campo — anche la `riverifica` scritta dopo
//   ⑤ il digest vero con un referto NUOVO della stessa famiglia: aggiorna solo la `riverifica`, e quella di
//      prima finisce in `riverifiche_precedenti`; la prova aggiornata dalla riparazione resta, e il digest
//      dice quanti campi del referto nuovo ha lasciato fuori
//   ⑥ sui dati VERI (sola lettura): con gli ultimi referti e la casa di oggi, nessuna voce perde o cambia
//      un campo — è la misura del collaudatore, rifatta a ogni giro
//   ⑦ il rovescio della regola: una correzione fatta SOLO nel grezzo dopo la lettura (le coperture delle
//      falle riservate del 6/11 alle 01:45), anche fatta TOGLIENDO o svuotando un campo, non entra in casa:
//      il digest la nomina, esce 1, e lo ridice finché la casa tiene il valore vecchio — collaudi del 6/11
//   ⑧ un referto NUOVO dopo le impronte non fa suonare l'avviso, e il contatore dei campi lasciati fuori
//      conta solo quello che la radiografia nuova dice di diverso dalla vecchia
//   ⑨ un referto che un giro non riesce a leggere (un JSON rotto) non perde le sue impronte
//
// NON-VACUITÀ: sul codice di prima ① ④ ⑤ ⑥ sono rossi; togliendo dal digest il passaggio del referto nuovo
// diventa rosso ⑤; togliendo l'avviso, o salvando l'impronta nuova sopra quella vecchia, diventa rosso ⑦;
// le altre rotture di ⑦ ⑧ ⑨ stanno in cervello/mutanti.json (difetto AR-1158). La risposta attesa non passa mai dalla funzione sotto esame: è la casa com'era scritta
// prima, letta dal file o dal caso.
//
// I PERCORSI. Il digest ricava il registro da dove sta il suo file: si prova da una COPIA in una cartella
// temporanea (scorciatoia 35). Il digest scrive un file solo: il caso controlla che sia quello della copia.
// (Non si guarda l'ora del registro vero: un'altra prova del banco, il-freno-non-era-sulla-strada, ci
// riscrive `sync_scan` mentre questa gira, e l'accusa sarebbe falsa — collaudo del 6/11.)

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CARTELLE_REFERTI,
  FONTI_SITO,
  chiaveProblema,
  fondiConLaCasa,
  problemiDaRaw,
  refertiDaElenco,
  ultimiPerFonte,
} from "../referti-sito.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CASA_REL = "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json";
const DESIGN = FONTI_SITO.find((f) => f.id === "design");

const uguali = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Il campo `k` della voce `v` è ancora com'era nella casa `c`? Torna la frase del danno, o null. */
function danno(c, v, k) {
  if (!(k in v)) return `«${k}» tolto`;
  if (!uguali(v[k], c[k])) return `«${k}» cambiato: ${JSON.stringify(c[k]).slice(0, 80)} → ${JSON.stringify(v[k]).slice(0, 80)}`;
  return null;
}

// ── Il caso di prova: un grezzo del design, e la casa come l'hanno lasciata le riparazioni ──────────
const GREZZO_DESIGN = {
  data: "2026-10-11",
  problemi: [
    {
      dimensione: "immagini-media",
      titolo: "La copertina del link condiviso in chat non compare",
      severita: "grave",
      dove: "app/layout.tsx:20",
      descrizione: "manca og:image",
      impatto: "chi riceve il link non vede la vetrina",
      fix: "aggiungere images al blocco openGraph",
      prova: "grep -c 'og:image' page_*.html",
      prova_tipo: "comando",
      verificato: true,
      giro: 1,
      fonte_radiografia: "radiografia 2026-10-11 · id R99",
      riverifica: { verdetto: "ancora_presente", data: "2026-10-11 10:00", prova: "grep", nota: "del referto" },
    },
    {
      dimensione: "microcopy",
      titolo: "Il bottone dice Submit in inglese",
      severita: "minore",
      dove: "components/Form.tsx:8",
      descrizione: "",
      fix: "Invia",
      causa_radice: "testo copiato dal componente di esempio",
    },
  ],
};

/** La casa dopo le riparazioni: le voci del grezzo, più tutto quello che il lavoro ci ha scritto sopra. */
function casaDopoLeRiparazioni(nuovi) {
  const [copertina, bottone] = nuovi;
  return [
    {
      ...copertina,
      stato: "riparato",
      severita: "minore",
      descrizione: "manca og:image (riscritta dalla riparazione: le pagine erano dieci, non una)",
      file: "app/layout.tsx:20 · app/(pubbliche)/*/page.tsx (dieci pagine)",
      nota_severita: "riclassificata da Nicola il 2026-11-01 09:00",
      prova: "tests/unit/minori-s08-pagine-pubbliche.test.tsx › i link condivisi hanno la copertina",
      prova_tipo: "vitest",
      riparato_il: "2026-11-05 17:40",
      riparato_da: "dieci sessioni del 5/11, S08",
      nota_riparazione: "2026-11-05 17:40 — aggiunto images all'openGraph",
      chiuso_il: "2026-11-05 23:45",
      chiuso_da: "S08",
      riverifica: { verdetto: "risolto", data: "2026-11-01 12:00", prova: "vitest", nota: "scritta dopo il referto" },
      impatto: "", // svuotato a mano, come le coperture delle falle riservate del 6/11: deve restare vuoto
      riverifica_1_11: "ancora presente il 1/11, riparato il 5/11",
      riverifiche_precedenti: [{ verdetto: "ancora_presente", data: "2026-10-20 09:00", prova: "grep", nota: "la più vecchia" }],
      nota_5_11: "collaudo pulito",
      collaudo_5_11: "pulito",
    },
    {
      // La casa non ha ancora `causa_radice` né `reparto`, e la descrizione è vuota: quelli li porta il grezzo.
      dimensione: bottone.dimensione,
      titolo: bottone.titolo,
      severita: "minore",
      file: "components/Form.tsx:8",
      descrizione: "",
      fix: "Invia",
      fonte: "design",
      stato: "aperto",
      riverifica: "ancora presente il 3/11 (scritta a mano)",
      nota_5_11: "da fare nel lotto dei minori",
    },
  ];
}

test("① una voce della casa con campi in più, la prova aggiornata e la gravità riclassificata esce dalla fusione com'era", () => {
  const nuovi = problemiDaRaw(GREZZO_DESIGN, DESIGN);
  const vecchi = casaDopoLeRiparazioni(nuovi);
  const { problemi } = fondiConLaCasa(nuovi, vecchi);
  const perChiave = new Map(problemi.map((p) => [chiaveProblema(p), p]));
  const danni = [];
  for (const c of vecchi) {
    const v = perChiave.get(chiaveProblema(c));
    assert.ok(v, `la voce «${c.titolo}» è sparita`);
    for (const k of Object.keys(c)) {
      const d = danno(c, v, k);
      if (d) danni.push(`«${c.titolo}»: ${d}`);
    }
  }
  assert.deepEqual(danni, [], `la fusione ha toccato il lavoro della casa:\n  ${danni.join("\n  ")}`);
});

test("② il grezzo riempie solo i campi che la casa non ha (assenti o null); un campo svuotato a mano resta vuoto", () => {
  const nuovi = problemiDaRaw(GREZZO_DESIGN, DESIGN);
  const vecchi = casaDopoLeRiparazioni(nuovi);
  const { problemi } = fondiConLaCasa(nuovi, vecchi);
  const bottone = problemi.find((p) => p.titolo === "Il bottone dice Submit in inglese");
  assert.equal(bottone.causa_radice, "testo copiato dal componente di esempio", "il campo che la casa non aveva non è arrivato");
  assert.equal(bottone.reparto, "Microcopy", "il reparto leggibile non è arrivato dal grezzo");
  assert.equal(bottone.nota_5_11, "da fare nel lotto dei minori");
  // Un campo vuoto in tutti e due resta vuoto, non sparisce: la scheda del Pannello lo legge.
  assert.equal(bottone.descrizione, "");
  // Un campo che la casa ha svuotato e il grezzo ha pieno: vince la casa. Riempirlo riaprirebbe una copertura.
  const copertina = problemi.find((p) => p.titolo === "La copertina del link condiviso in chat non compare");
  assert.equal(copertina.impatto, "", "il grezzo ha riempito un campo che la casa aveva svuotato apposta");
  // Null vuol dire «non ce l'ho»: lì il grezzo riempie.
  const { problemi: conNull } = fondiConLaCasa(nuovi, [{ ...vecchi[1], causa_radice: null }]);
  assert.equal(conNull.find((p) => p.titolo === bottone.titolo).causa_radice, "testo copiato dal componente di esempio");
});

test("③ una voce che era fuori dal referto e ci ritorna perde la bandiera, e tiene il resto", () => {
  const nuovi = problemiDaRaw(GREZZO_DESIGN, DESIGN);
  const [copertina] = casaDopoLeRiparazioni(nuovi);
  const { problemi, orfani } = fondiConLaCasa(nuovi, [{ ...copertina, fuori_dal_referto: true }]);
  const v = problemi.find((p) => p.titolo === copertina.titolo);
  assert.equal(orfani, 0);
  assert.ok(!("fuori_dal_referto" in v), "la voce è di nuovo nel referto ma porta ancora «fuori_dal_referto»");
  assert.equal(v.riparato_il, "2026-11-05 17:40");
});

// ── Il digest vero, su una copia ─────────────────────────────────────────────────────────────────────
/**
 * Monta una copia minima della casa in una cartella temporanea: i due file del digest, i referti dati e
 * il registro dato. Lancia il digest COME LO LANCIA CHI LO USA (`node cervello/...`) e torna il registro
 * riscritto. Il registro vero non si tocca: lo si confronta prima e dopo.
 */
function copiaDelDigest({ referti, casa }) {
  const radice = mkdtempSync(join(tmpdir(), "digest-casa-"));
  mkdirSync(join(radice, "cervello"), { recursive: true });
  for (const f of ["radiografia-marketplace-digest.mjs", "referti-sito.mjs"]) {
    copyFileSync(join(REPO, "cervello", f), join(radice, "cervello", f));
  }
  for (const c of CARTELLE_REFERTI) mkdirSync(join(radice, c), { recursive: true });
  const scrivi = (rel, contenuto) => writeFileSync(join(radice, rel), JSON.stringify(contenuto, null, 2));
  for (const [rel, contenuto] of Object.entries(referti)) scrivi(rel, contenuto);
  mkdirSync(dirname(join(radice, CASA_REL)), { recursive: true });
  scrivi(CASA_REL, { ...casa, _scritta_dalla_prova: true });
  const lancia = () => {
    const r = spawnSync(process.execPath, [join(radice, "cervello/radiografia-marketplace-digest.mjs")], {
      cwd: radice,
      encoding: "utf8",
      timeout: 30_000,
    });
    const dopo = JSON.parse(readFileSync(join(radice, CASA_REL), "utf8"));
    // La casa finta porta un segno che il digest non riscrive: se è sparito, il digest ha scritto QUI (e scrive
    // un file solo). Non si guarda l'ora del registro vero: un'altra prova del banco ci scrive mentre questa gira.
    assert.ok(!dopo._scritta_dalla_prova, `il digest non ha riscritto il registro della copia (uscita ${r.status}): ${r.stderr}`);
    scrivi(CASA_REL, { ...dopo, _scritta_dalla_prova: true });
    return { ...dopo, _uscita: r.stdout, _errori: r.stderr, _codice: r.status };
  };
  return {
    lancia,
    scrivi,
    /** Cambia il CODICE della copia (non il referto): come quando qualcuno rinomina un'area in referti-sito.mjs. */
    ritocca: (rel, da, a) => {
      const f = join(radice, rel);
      const t = readFileSync(f, "utf8");
      assert.equal(t.split(da).length, 2, `«${da}» non compare una volta sola in ${rel}`);
      writeFileSync(f, t.replace(da, a));
    },
    leggi: (rel) => JSON.parse(readFileSync(join(radice, rel), "utf8")),
    percorso: (rel) => join(radice, rel),
    smonta: () => rmSync(radice, { recursive: true, force: true }),
  };
}

/** Un digest solo, su una copia montata e smontata qui. Deve uscire 0. */
function digestSuUnaCopia(args) {
  const copia = copiaDelDigest(args);
  try {
    const dopo = copia.lancia();
    assert.equal(dopo._codice, 0, `il digest sulla copia è uscito ${dopo._codice}: ${dopo._errori}`);
    return dopo;
  } finally {
    copia.smonta();
  }
}

const RAW_DESIGN_1011 = "consegne/design/2026-10-11-radiografia-design-raw.json";

function casaConFonti(problemi, rawDesign) {
  return {
    data: "2026-11-05",
    fonti: [{ id: "design", nome: "Radiografia del design", raw: rawDesign, data: dataDi(rawDesign), findings: 2 }],
    meta: { findings: problemi.length },
    problemi,
  };
}
const dataDi = (rel) => /(\d{4}-\d{2}-\d{2})/.exec(rel)[1];

test("④ il digest vero, con lo stesso referto già letto, lascia ogni voce della casa com'era", () => {
  const vecchi = casaDopoLeRiparazioni(problemiDaRaw(GREZZO_DESIGN, DESIGN));
  const dopo = digestSuUnaCopia({
    referti: { [RAW_DESIGN_1011]: GREZZO_DESIGN },
    casa: casaConFonti(vecchi, RAW_DESIGN_1011),
  });
  const perChiave = new Map(dopo.problemi.map((p) => [chiaveProblema(p), p]));
  const danni = [];
  for (const c of vecchi) {
    const v = perChiave.get(chiaveProblema(c));
    assert.ok(v, `la voce «${c.titolo}» è sparita dal registro`);
    for (const k of Object.keys(c)) {
      const d = danno(c, v, k);
      if (d) danni.push(`«${c.titolo}»: ${d}`);
    }
  }
  assert.deepEqual(danni, [], `il digest ha toccato il lavoro della casa:\n  ${danni.join("\n  ")}`);
  assert.equal(dopo.problemi.length, vecchi.length, "il digest ha cambiato il numero delle voci");
});

test("⑤ con un referto NUOVO della stessa famiglia, il digest aggiorna solo la riverifica e tiene quella di prima", () => {
  const vecchi = casaDopoLeRiparazioni(problemiDaRaw(GREZZO_DESIGN, DESIGN));
  const rivNuova = { verdetto: "ancora_presente", data: "2026-11-20 10:00", prova: "grep -c og:image", nota: "radiografia del 20/11" };
  const grezzoNuovo = {
    ...GREZZO_DESIGN,
    data: "2026-11-20",
    problemi: [{ ...GREZZO_DESIGN.problemi[0], riverifica: rivNuova, gia_noto: true }, GREZZO_DESIGN.problemi[1]],
  };
  const dopo = digestSuUnaCopia({
    referti: {
      [RAW_DESIGN_1011]: GREZZO_DESIGN,
      "consegne/design/2026-11-20-radiografia-design-raw.json": grezzoNuovo,
    },
    casa: casaConFonti(vecchi, RAW_DESIGN_1011),
  });
  const [cop] = vecchi;
  const v = dopo.problemi.find((p) => chiaveProblema(p) === chiaveProblema(cop));
  assert.ok(v, "la voce della copertina è sparita");
  assert.deepEqual(v.riverifica, rivNuova, "la riverifica del referto nuovo non è arrivata in casa");
  assert.deepEqual(
    v.riverifiche_precedenti,
    [...cop.riverifiche_precedenti, cop.riverifica],
    "la storia delle riverifiche non è quella di prima con in coda la riverifica sostituita (persa, doppia o sovrascritta)",
  );
  // Tutto il resto della casa vince anche col referto nuovo: la riparazione non la rifà un cercatore.
  const danni = [];
  for (const k of Object.keys(cop)) {
    if (k === "riverifica" || k === "riverifiche_precedenti") continue;
    const d = danno(cop, v, k);
    if (d) danni.push(d);
  }
  assert.deepEqual(danni, [], `il referto nuovo ha scritto sopra il lavoro della casa:\n  ${danni.join("\n  ")}`);
  assert.equal(v.gia_noto, true, "il campo che la casa non aveva non è arrivato dal referto nuovo");
  // Una voce che il referto nuovo ritrova SENZA riverifica tiene quella della casa.
  const [, bottone] = vecchi;
  const b = dopo.problemi.find((p) => chiaveProblema(p) === chiaveProblema(bottone));
  assert.equal(b.riverifica, bottone.riverifica, "un referto nuovo senza riverifica ha cancellato quella della casa");
  assert.ok(!("riverifiche_precedenti" in b), "senza una riverifica nuova la storia non deve allungarsi");
  // Il prezzo della regola non è muto: gravità, descrizione, punto del codice, prova, tipo di prova e impatto
  // del referto nuovo sono diversi dalla casa e restano fuori. Il digest lo dice.
  assert.match(dopo._uscita, /6 campi del referto nuovo diversi dalla casa: tenuta la casa/, `uscita del digest: ${dopo._uscita}`);
});

// ── Sui dati veri, in sola lettura ───────────────────────────────────────────────────────────────────
test("⑥ sui dati veri: con gli ultimi referti e la casa di oggi, nessuna voce perde o cambia un campo", () => {
  const casa = JSON.parse(readFileSync(join(REPO, CASA_REL), "utf8"));
  const elenchi = CARTELLE_REFERTI.map((c) => ({ cartella: c, nomi: existsSync(join(REPO, c)) ? readdirSync(join(REPO, c)) : [] }));
  const ultimi = ultimiPerFonte(refertiDaElenco(elenchi));
  const giaLetti = new Map((Array.isArray(casa.fonti) ? casa.fonti : []).map((f) => [f?.id, f?.raw]));
  const nuovi = [];
  const refertiNuovi = [];
  for (const fonte of FONTI_SITO) {
    const u = ultimi.get(fonte.id);
    if (!u) continue;
    const p = problemiDaRaw(JSON.parse(readFileSync(join(REPO, u.file), "utf8")), fonte);
    if (p) nuovi.push(...p);
    if (giaLetti.get(fonte.id) !== u.file) refertiNuovi.push(fonte.id);
  }
  assert.ok(nuovi.length > 0, "nessun referto vero letto: il caso non misurerebbe niente");

  const { problemi } = fondiConLaCasa(nuovi, casa.problemi, { refertiNuovi });
  const dopo = new Map(problemi.map((p) => [chiaveProblema(p), p]));
  // La famiglia di una voce la dice il REFERTO che la ritrova, non la casa: in casa `fonte` è spesso testo libero.
  const famigliaNelReferto = new Map(nuovi.map((n) => [chiaveProblema(n), n.fonte]));
  const nelReferto = new Set(famigliaNelReferto.keys());
  let misurate = 0;
  const danni = [];
  for (const c of casa.problemi) {
    const k = chiaveProblema(c);
    if (!nelReferto.has(k)) continue;
    misurate += 1;
    const v = dopo.get(k);
    for (const campo of Object.keys(c)) {
      if (campo === "fuori_dal_referto") continue;
      // Un campo che la casa non aveva (null) il grezzo lo riempie: è la regola ②, non un danno.
      if (c[campo] === null || c[campo] === undefined) continue;
      // Un referto nuovo della famiglia può aggiornare la riverifica (caso ⑤): solo quella, solo lì.
      if (refertiNuovi.includes(famigliaNelReferto.get(k)) && (campo === "riverifica" || campo === "riverifiche_precedenti")) continue;
      const d = v ? danno(c, v, campo) : "voce sparita";
      if (d) danni.push(`${c.fonte} · ${campo}`);
    }
  }
  assert.ok(misurate > 0, "nessuna voce della casa sta negli ultimi referti: il caso non misurerebbe niente");
  const conto = {};
  for (const d of danni) conto[d] = (conto[d] ?? 0) + 1;
  assert.equal(danni.length, 0, `su ${misurate} voci ritrovate nei referti, ${danni.length} campi toccati: ${JSON.stringify(conto)}`);
});

// ── Il rovescio della regola: la correzione fatta solo nel grezzo ────────────────────────────────────
const MKT = FONTI_SITO.find((f) => f.id === "marketplace");
const RAW_MKT_1105 = "consegne/audit/2026-11-05-radiografia-marketplace-raw.json";
const GREZZO_MKT = {
  data: "2026-11-05",
  problemi: [{ dimensione: "api-backend", titolo: "Una rotta risponde in due forme", severita: "minore", dove: "app/api/x.ts:1", descrizione: "d", fix: "f" }],
};
// Una falla riservata APERTA, letta com'era: in casa ha esattamente il testo del grezzo.
const FALLA = {
  dimensione: "stati-ui",
  titolo: "Falla di sicurezza R7 da chiudere (accessi): i dettagli restano fuori dal deposito pubblico",
  severita: "grave",
  dove: "app/negozio/[id]/page.tsx:40",
  descrizione: "il dettaglio che non doveva uscire: il percorso e la tecnica",
  fix: "f",
  prova: "curl -s https://esempio.invalid/percorso-riservato",
  prova_tipo: "comando",
  causa_radice: "il controllo dei permessi manca sulla rotta",
  riverifica: { verdetto: "ancora_presente", data: "2026-11-05 10:00", prova: "curl", nota: "client.ts:70-98" },
};
const GREZZO_DESIGN_FALLA = { data: "2026-10-11", problemi: [FALLA, GREZZO_DESIGN.problemi[0]] };

function casaConDueFamiglie() {
  const [falla, copertina] = problemiDaRaw(GREZZO_DESIGN_FALLA, DESIGN);
  const [riparata] = casaDopoLeRiparazioni([copertina, problemiDaRaw(GREZZO_DESIGN, DESIGN)[1]]);
  return {
    data: "2026-11-05",
    // L'ordine è quello che scrive il digest: prima il codice, poi il design.
    fonti: [
      { id: "marketplace", raw: RAW_MKT_1105, data: "2026-11-05", findings: 1 },
      { id: "design", raw: RAW_DESIGN_1011, data: "2026-10-11", findings: 2 },
    ],
    problemi: [...problemiDaRaw(GREZZO_MKT, MKT), { ...falla, stato: "aperto" }, riparata],
  };
}
const rigaDi = (errori, titolo) => errori.split("\n").find((r) => r.includes(titolo.slice(0, 40))) ?? "";

test("⑦ una copertura fatta solo nel grezzo, anche togliendo o svuotando campi, il digest la nomina finché la casa tiene il valore vecchio", () => {
  const copia = copiaDelDigest({
    referti: { [RAW_MKT_1105]: GREZZO_MKT, [RAW_DESIGN_1011]: GREZZO_DESIGN_FALLA },
    casa: casaConDueFamiglie(),
  });
  try {
    // Primo digest: la casa non ha ancora le impronte. Lo dice, e le salva.
    const primo = copia.lancia();
    assert.equal(primo._codice, 0, primo._errori);
    assert.match(primo._uscita, /non aveva le impronte di questo referto/, "senza impronte da confrontare il digest deve dirlo, non tacere");
    assert.ok(primo.fonti.find((f) => f.id === "design")?.impronte, "il digest non ha salvato le impronte del referto letto");

    // La copertura, nel GREZZO soltanto, come il 6/11: un testo riscritto, una prova tolta, un campo svuotato,
    // una riverifica azzerata. Sulla voce riparata della copertina si copre anche la prova del cercatore.
    const { prova: _tolta, ...senzaProva } = FALLA;
    const coperta = "(nel referto privato)";
    const grezzoCoperto = {
      ...GREZZO_DESIGN_FALLA,
      problemi: [
        { ...senzaProva, descrizione: coperta, causa_radice: "", riverifica: null },
        { ...GREZZO_DESIGN.problemi[0], prova: coperta },
      ],
    };
    copia.scrivi(RAW_DESIGN_1011, grezzoCoperto);
    const secondo = copia.lancia();
    assert.equal(secondo._codice, 1, `il digest deve uscire 1 quando una copertura del grezzo resta fuori: ${secondo._errori}`);
    const riga = rigaDi(secondo._errori, FALLA.titolo);
    for (const campo of ["descrizione", "prova", "causa_radice", "riverifica"]) {
      assert.match(riga, new RegExp(`\\b${campo}\\b`), `la copertura di «${campo}» non è nominata: ${secondo._errori}`);
    }
    // La copertina è riparata: in casa la prova è già quella vera, non c'è niente di vecchio da togliere.
    assert.equal(rigaDi(secondo._errori, "La copertina del link"), "", `l'avviso accusa una voce riparata: ${secondo._errori}`);
    // Vince la casa: il testo vecchio è ancora lì, ed è proprio questo che l'avviso deve dire.
    const v = secondo.problemi.find((p) => p.titolo === FALLA.titolo);
    assert.equal(v.descrizione, FALLA.descrizione);
    assert.equal(v.prova, FALLA.prova);

    // Rilanciare non basta a zittirlo.
    const terzo = copia.lancia();
    assert.equal(terzo._codice, 1, "al secondo digest di fila l'avviso è sparito senza che nessuno abbia scelto");

    // La copertura va anche nel registro: la casa non tiene più i valori vecchi, l'avviso tace.
    const casa = copia.leggi(CASA_REL);
    casa.problemi = casa.problemi.map((p) => {
      if (p.titolo !== FALLA.titolo) return p;
      const { prova: _p, ...resto } = p;
      return { ...resto, descrizione: coperta, causa_radice: "", riverifica: null };
    });
    copia.scrivi(CASA_REL, casa);
    const quarto = copia.lancia();
    assert.equal(quarto._codice, 0, `con la copertura anche in casa il digest deve tornare a 0: ${quarto._errori}`);
    assert.doesNotMatch(quarto._errori, /corrette nel grezzo/);

    // Un'area rinominata nel CODICE cambia il campo `reparto` di ogni voce letta: non è una correzione del
    // grezzo, e l'avviso non deve accusarla (sarebbe un allarme che suona a ogni manutenzione).
    copia.ritocca("cervello/referti-sito.mjs", 'microcopy: "Microcopy",', 'microcopy: "Testi brevi",');
    copia.ritocca("cervello/referti-sito.mjs", '"immagini-media": "Immagini e media",', '"immagini-media": "Foto",');
    const quinto = copia.lancia();
    assert.equal(quinto._codice, 0, `un'area rinominata nel codice ha fatto suonare l'avviso: ${quinto._errori}`);
  } finally {
    copia.smonta();
  }
});

test("⑧ un referto NUOVO dopo le impronte non fa suonare l'avviso, e il contatore dice solo le novità vere", () => {
  const copia = copiaDelDigest({
    referti: { [RAW_DESIGN_1011]: GREZZO_DESIGN },
    casa: casaConFonti(casaDopoLeRiparazioni(problemiDaRaw(GREZZO_DESIGN, DESIGN)), RAW_DESIGN_1011),
  });
  try {
    assert.equal(copia.lancia()._codice, 0);
    // La radiografia del 20/11 ripete tutto uguale, tranne il rimedio della copertina. In casa il rimedio è
    // ancora quello vecchio; prova, gravità e descrizione la casa le ha cambiate dopo, e il referto nuovo le
    // ripete come il vecchio: non sono notizie.
    const nuovo = { ...GREZZO_DESIGN, data: "2026-11-20", problemi: [{ ...GREZZO_DESIGN.problemi[0], fix: "un rimedio diverso" }, GREZZO_DESIGN.problemi[1]] };
    copia.scrivi("consegne/design/2026-11-20-radiografia-design-raw.json", nuovo);
    const dopo = copia.lancia();
    assert.equal(dopo._codice, 0, `un referto nuovo ha fatto suonare l'avviso delle correzioni del grezzo: ${dopo._errori}`);
    assert.match(dopo._uscita, /referto nuovo: design/);
    assert.match(dopo._uscita, / 1 campi del referto nuovo diversi dalla casa/, `il contatore non dice la sola novità vera: ${dopo._uscita}`);
  } finally {
    copia.smonta();
  }
});

test("⑨ un referto che un giro non riesce a leggere non perde le sue impronte", () => {
  const copia = copiaDelDigest({
    referti: { [RAW_DESIGN_1011]: GREZZO_DESIGN },
    casa: casaConFonti(casaDopoLeRiparazioni(problemiDaRaw(GREZZO_DESIGN, DESIGN)), RAW_DESIGN_1011),
  });
  try {
    assert.equal(copia.lancia()._codice, 0);
    // Una copertura che lascia una virgola di troppo: il JSON non si apre.
    const percorso = copia.percorso(RAW_DESIGN_1011);
    writeFileSync(percorso, readFileSync(percorso, "utf8").replace(/\}\s*$/, ",}"));
    const giroRotto = copia.lancia();
    assert.match(giroRotto._uscita, /il referto non si e' riletto/, `il digest non dice che le impronte sono tenute: ${giroRotto._uscita}`);
    assert.ok(giroRotto.impronte_tenute?.design?.impronte, "le impronte del referto illeggibile sono andate perse");

    // Il JSON torna a posto, con la copertura del rimedio dentro: la casa ha ancora il rimedio vecchio.
    copia.scrivi(RAW_DESIGN_1011, { ...GREZZO_DESIGN, problemi: [{ ...GREZZO_DESIGN.problemi[0], fix: "(nel referto privato)" }, GREZZO_DESIGN.problemi[1]] });
    const riparato = copia.lancia();
    assert.equal(riparato._codice, 1, `dopo il JSON rotto la copertura del grezzo è passata muta: ${riparato._uscita}`);
    assert.match(riparato._errori, /La copertina del link condiviso in chat non compare» → fix$/m, riparato._errori);
    assert.ok(!riparato.impronte_tenute, "le impronte tenute restano anche dopo che il referto è tornato leggibile");
  } finally {
    copia.smonta();
  }
});
