#!/usr/bin/env node
// 📦 PACCHETTI DEL LOTTO — divide i difetti aperti in pacchetti di lavoro e li mette in ondate.
//
// PERCHE' ESISTE. Il 28/8/2026 il conto era questo: 361 difetti aperti sul sito, 122 sulla macchina.
// Chi li ripara non puo' leggerli tutti: le 361 schede intere pesano ~166.000 gettoni, cioe' una
// finestra quasi piena PRIMA di aprire un file. Ma i difetti non stanno in 361 posti: 244 su 361
// stanno in file che ne portano almeno tre, e la pagina del prodotto ne porta 27 da sola.
//
// LE DUE CHIAVI SONO DIVERSE, ed e' una misura, non un'opinione:
//   • sito     → la chiave e' il FILE. Li' il file E' il territorio disgiunto che la skill cantiere
//     chiede alle corsie: i difetti ci stanno dentro a mucchi.
//   • macchina → la chiave e' la DIMENSIONE. Lassu' i file non si ammucchiano (20 difetti su 121) e
//     nemmeno la causa radice (63 gruppi da uno su 64): per file uscirebbero 72 pacchetti da uno.
//
// ⚠️ COSA HA BOCCIATO IL COLLAUDO DEL 28/8, e che qui dentro non puo' piu' succedere:
//   ① `--max abc` diventava NaN, ogni pacchetto usciva da ZERO difetti e il comando diceva verde.
//      `--max 0` era un ciclo infinito. Oggi ogni numero e' validato e un argomento storto esce 2.
//   ② Le collisioni erano cieche sulla macchina: confrontavo la CHIAVE del pacchetto con i file, e
//      li' la chiave e' una dimensione. Dichiarava sempre zero sconfinamenti. Oggi si confrontano
//      gli insiemi di file, uguale sui due registri.
//   ③ Lo stesso file spezzato in «parte 1/2/3» finiva a tre squadre diverse, e il controllo lo
//      SCARTAVA apposta. Oggi due pacchetti che condividono un file non entrano nella stessa ondata.
//   ④ La chiave di chiusura era una copia del formato invece della funzione vera: 356 chiavi su 361
//      non combaciavano. Oggi si importa `chiaveProblema` da referti-sito.mjs.
//   ⑤ Una chiave di registro cambiata di nome dava «Aperti: 0» con uscita 0. Oggi esce 2: cieco.
//   ⑥ Il JSON scriveva `prova_umana: 0` sul sito, dove quel campo non e' mai stato misurato.
//
// Uscita: 0 = pacchetti fatti · 2 = non ho potuto misurare (mai un verde). 🟢 legge e stampa.
//
// Uso:
//   node cervello/pacchetti-lotto.mjs --sito                 meta' dei difetti aperti del sito
//   node cervello/pacchetti-lotto.mjs --sito --gravi         solo bloccanti e gravi
//   node cervello/pacchetti-lotto.mjs --macchina --scrivi    la macchina, e salva il JSON
import { readFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chiaveProblema } from "./referti-sito.mjs";
import { scriviJsonAtomico } from "./scrivi-json.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARG = process.argv.slice(2);

function cieco(perche) {
  console.error(`⚪ non ho potuto misurare: ${perche}`);
  process.exit(2);
}

// ── gli argomenti: un refuso non deve MAI diventare un piano di lavoro vuoto ───────────────────
const NOTI = new Set(["--sito", "--macchina", "--gravi", "--scrivi", "--quota", "--max"]);
const VALORI = new Set();
for (let i = 0; i < ARG.length; i++) {
  const a = ARG[i];
  if (a.startsWith("--")) {
    if (!NOTI.has(a)) cieco(`non conosco l'argomento ${a}`);
    if (a === "--quota" || a === "--max") {
      if (!ARG[i + 1]) cieco(`${a} vuole un numero dopo`);
      VALORI.add(i + 1);
    }
  } else if (!VALORI.has(i)) {
    // `-macchina` con un trattino solo faceva girare il SITO senza lamentarsi: il refuso diventava
    // un piano di lavoro sul registro sbagliato, con uscita 0 (collaudo del 28/8, lente sicurezza).
    cieco(`«${a}» non è un argomento: i comandi vogliono i due trattini, per esempio --macchina`);
  }
}
if (ARG.includes("--sito") && ARG.includes("--macchina")) cieco("--sito e --macchina insieme: scegline uno");
const numero = (nome, difetto) => {
  const i = ARG.indexOf(nome);
  if (i < 0) return difetto;
  const n = Number(ARG[i + 1]);
  if (!Number.isInteger(n) || n < 1) cieco(`${nome} vuole un numero intero da 1 in su, non «${ARG[i + 1]}»`);
  return n;
};
const SITO = !ARG.includes("--macchina");
const SOLO_GRAVI = ARG.includes("--gravi");
const SCRIVI = ARG.includes("--scrivi");
const MAX_PER_PACCHETTO = numero("--max", 12);
const PER_ONDATA = 5; // .claude/skills/cantiere/SKILL.md: «Tre-cinque corsie e' la misura giusta»

// ── i due registri ─────────────────────────────────────────────────────────────────────────────
function leggi(relativo, chiave) {
  let j;
  try {
    j = JSON.parse(readFileSync(path.join(ROOT, relativo), "utf8"));
  } catch (e) {
    cieco(`non riesco a leggere ${relativo}: ${e.message}`);
  }
  if (!Array.isArray(j[chiave])) cieco(`${relativo} non ha piu' l'elenco «${chiave}»: il registro ha cambiato forma`);
  return j[chiave];
}
function apertiDelSito() {
  const tutte = leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json", "problemi");
  return tutte.filter((d) => d.stato === "aperto").map((d) => ({
    // La chiave di chiusura e' quella di casa, non una sua imitazione: cervello/referti-sito.mjs:259.
    // Chi ritocca il titolo mentre ripara scollega la chiusura, e al referto dopo il difetto torna aperto.
    chiave: chiaveProblema(d), titolo: d.titolo, gravita: d.severita, gruppo: d.dimensione,
    dove: String(d.file || ""), umano: null,
  }));
}
function apertiDellaMacchina() {
  const tutte = leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json", "difetti");
  const sospese = tutte.filter((d) => ["da-riverificare", "in-corso"].includes(d.stato)).length;
  if (sospese) console.log(`ℹ️  ${sospese} schede sono «da-riverificare» o «in-corso»: restano fuori dai pacchetti.`);
  return tutte.filter((d) => d.stato === "aperto").map((d) => ({
    chiave: d.id, titolo: d.titolo, gravita: d.gravita || "(senza gravita)",
    gruppo: d.dimensione || "(senza dimensione)", dove: [d.causa_radice, d.fix_proposto].join(" "),
    // La prova dichiarata umana non si chiude con un comando: il fix e' della squadra, il «si' e'
    // chiuso» e' di Nicola. Sta fuori dal lotto automatico, e va detto invece che nascosto.
    umano: !!(d.verifica && d.verifica.tipo === "umano"),
  }));
}

// ── i file: lo stesso file sotto tre nomi diversi e' UN file ───────────────────────────────────
const RE_FILE = /[\w./@[\]-]+\.(tsx?|jsx?|sql|json|css|mjs|js|sh|md|ya?ml|svg|bats)/g;
const TETTO_CAMPO = 20_000; // oltre, la ricerca torna indietro in modo quadratico: 104 KB = 48 secondi
let nomiNudiIgnorati = 0;
let campiTagliati = 0;
const memoria = new Map(); // lo stesso campo veniva riletto tre volte per difetto
function fileCitati(d) {
  if (memoria.has(d)) return memoria.get(d);
  let testo = String(d.dove);
  if (testo.length > TETTO_CAMPO) { testo = testo.slice(0, TETTO_CAMPO); campiTagliati++; }
  const grezzi = new Set(testo.match(RE_FILE) || []);
  const puliti = new Set();
  for (const f of grezzi) {
    const n = f.replace(ROOT + "/", "").replace(/^\.?\//, "").replace(/^marketplace\//, "");
    if (!n.includes("/")) { nomiNudiIgnorati++; continue; } // «page.tsx» nudo indirizza a decine di file
    puliti.add(n);
  }
  const esito = [...puliti];
  memoria.set(d, esito);
  return esito;
}

// ── i pacchetti ────────────────────────────────────────────────────────────────────────────────
function raggruppa(difetti) {
  if (!SITO) {
    const per = Object.create(null); // «__proto__» come dimensione faceva morire il comando
    for (const d of difetti) (per[d.gruppo] = per[d.gruppo] || []).push(d);
    return Object.entries(per).sort((a, b) => b[1].length - a[1].length);
  }
  const densita = Object.create(null);
  difetti.forEach((d) => fileCitati(d).forEach((f) => (densita[f] = (densita[f] || 0) + 1)));
  const per = Object.create(null);
  for (const d of difetti) {
    const f = fileCitati(d).sort((a, b) => densita[b] - densita[a])[0] || "(nessun file citato)";
    (per[f] = per[f] || []).push(d);
  }
  return Object.entries(per).sort((a, b) => b[1].length - a[1].length);
}
function spezza(gruppi) {
  const out = [];
  for (const [chiave, ds] of gruppi) {
    const parti = Math.ceil(ds.length / MAX_PER_PACCHETTO);
    for (let i = 0; i < parti; i++) {
      out.push({
        chiave: parti > 1 ? `${chiave} (parte ${i + 1} di ${parti})` : chiave,
        territorio: chiave,
        difetti: ds.slice(i * MAX_PER_PACCHETTO, (i + 1) * MAX_PER_PACCHETTO),
      });
    }
  }
  return out;
}

const tutti = SITO ? apertiDelSito() : apertiDellaMacchina();
// Il collaudo del 28/8 ha fatto rientrare da questa porta la bocciatura ①: con l'elenco vuoto, con
// gli stati rinominati («open» invece di «aperto») o con voci che non sono schede, il comando
// diceva «Aperti: 0» e usciva 0. Zero difetti aperti non e' MAI una buona notizia da dare in
// silenzio: o il registro ha cambiato forma, o il lavoro e' finito, e sono due cose da guardare.
if (!tutti.length) cieco(`nessuna scheda aperta nel registro ${SITO ? "del sito" : "della macchina"}: o il lavoro e' finito, o gli stati non si chiamano piu' come prima. Guardalo prima di fidarti.`);
if (tutti.some((d) => !d.titolo)) cieco("il registro contiene schede senza titolo: ha cambiato forma");
const umani = tutti.filter((d) => d.umano === true);
const GRAVI = new Set(["bloccante", "grave", "critica", "alta", "alto"]);
const lavorabili = tutti.filter((d) => d.umano !== true).filter((d) => !SOLO_GRAVI || GRAVI.has(String(d.gravita)));
const QUOTA = numero("--quota", SOLO_GRAVI ? lavorabili.length : Math.ceil(lavorabili.length / 2));

const pacchetti = spezza(raggruppa(lavorabili));
const scelti = [];
let coperti = 0;
for (const p of pacchetti) { if (coperti >= QUOTA) break; scelti.push(p); coperti += p.difetti.length; }
const fuori = pacchetti.slice(scelti.length).flatMap((p) => p.difetti);

// ── le ondate: due squadre che toccano lo stesso file non lavorano insieme ─────────────────────
scelti.forEach((p) => (p.file = new Set(p.difetti.flatMap(fileCitati).concat(SITO ? [p.territorio] : []))));
// Un pacchetto che non nomina nessun file NON e' disgiunto dagli altri: e' non misurato. Sulla
// macchina succede spesso, perche' li' il «dove» e' prosa: 10 pacchetti su 17 il 28/8. Un insieme
// vuoto non interseca mai niente, quindi passerebbe ogni controllo dicendo il falso. Ne va al
// massimo uno per ondata, e la riga sotto lo dichiara invece di contarlo come territorio pulito.
const senzaTerritorio = scelti.filter((p) => p.file.size === 0);
const ondate = [];
for (const p of scelti) {
  const ignoto = p.file.size === 0;
  let messo = false;
  for (const o of ondate) {
    if (o.length >= PER_ONDATA) continue;
    if (ignoto && o.some((q) => q.file.size === 0)) continue;
    if (o.some((q) => [...q.file].some((f) => p.file.has(f)))) continue;
    o.push(p); messo = true; break;
  }
  if (!messo) ondate.push([p]);
}
const coppieCheSiToccano = [];
for (let i = 0; i < scelti.length; i++) {
  for (let j = i + 1; j < scelti.length; j++) {
    const comuni = [...scelti[i].file].filter((f) => scelti[j].file.has(f));
    if (comuni.length) coppieCheSiToccano.push([scelti[i].chiave, scelti[j].chiave, comuni.slice(0, 2)]);
  }
}

// ── il referto ─────────────────────────────────────────────────────────────────────────────────
const conta = (ds) => {
  if (!ds.length) return "0 difetti";
  const m = {};
  ds.forEach((d) => (m[d.gravita] = (m[d.gravita] || 0) + 1));
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`).join(", ");
};
console.log(`\n📦 PACCHETTI — ${SITO ? "il sito (chiave: il file)" : "la macchina (chiave: la dimensione)"}`);
console.log(`Aperti: ${tutti.length}. ${SITO
  ? "Quanti aspettino gli occhi di Nicola qui non si misura: le schede del sito non portano il campo della prova."
  : `Con prova dichiarata umana, che chiude solo Nicola: ${umani.length}.`}`);
if (SOLO_GRAVI) console.log(`Filtro: solo bloccanti e gravi (${lavorabili.length} difetti).`);
console.log(`Quota ${QUOTA} → ${coperti} difetti in ${scelti.length} pacchetti (${conta(scelti.flatMap((p) => p.difetti))}).`);
const inGrossi = pacchetti.filter((p) => p.difetti.length >= 3).reduce((n, p) => n + p.difetti.length, 0);
console.log(`Si ammucchiano: ${inGrossi} difetti su ${lavorabili.length} finiscono in pacchetti da almeno 3.`);
console.log(`Ondate da ${PER_ONDATA} squadre: ${ondate.length}.`);
if (senzaTerritorio.length) console.log(`⚪ ${senzaTerritorio.length} pacchetti non nominano nessun file: su quelli la disgiunzione non e' misurata, e ne va uno per ondata.`);
if (campiTagliati) console.log(`ℹ️  ${campiTagliati} campi piu' lunghi di ${TETTO_CAMPO} caratteri sono stati letti solo in parte.`);
if (fuori.length) console.log(`Fuori dal lotto: ${fuori.length} difetti (${conta(fuori)}). Non spariscono: sono il lotto dopo.`);
if (coppieCheSiToccano.length) {
  console.log(`\n⚠️  ${coppieCheSiToccano.length} coppie di pacchetti condividono un file. Sono gia' state messe in ondate diverse:`);
  coppieCheSiToccano.slice(0, 8).forEach(([a, b, f]) => console.log(`   • «${a}» e «${b}» → ${f.join(", ")}`));
  if (coppieCheSiToccano.length > 8) console.log(`   • e altre ${coppieCheSiToccano.length - 8} coppie, tutte nel JSON con --scrivi`);
}
if (nomiNudiIgnorati) console.log(`ℹ️  ${nomiNudiIgnorati} riferimenti senza cartella (per esempio «page.tsx») non fanno da territorio: sono ambigui.`);
ondate.forEach((o, i) => {
  console.log(`\n── ONDATA ${i + 1} ──`);
  o.forEach((p) => {
    console.log(`  📦 ${p.chiave} — ${p.difetti.length} difetti (${conta(p.difetti)})`);
    p.difetti.forEach((d) => console.log(`      [${d.gravita}] ${String(d.titolo).slice(0, 100)}`));
  });
});
console.log(`\nLa chiusura si scrive con la chiave, non col titolo: ${SITO ? "dimensione|titolo normalizzati (referti-sito.mjs)" : "l'id della scheda"}.`);

if (SCRIVI) {
  // Il nome porta la variante: --gravi e --quota davano piani diversi con lo stesso indirizzo, e il
  // secondo cancellava il primo senza una parola (collaudo del 28/8).
  const adesso = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
  mkdirSync(path.join(ROOT, "consegne/audit"), { recursive: true });
  const variante = `${SITO ? "sito" : "macchina"}${SOLO_GRAVI ? "-gravi" : ""}-${coperti}difetti`;
  const dove = path.join(ROOT, "consegne/audit", `${adesso}-pacchetti-${variante}.json`);
  // Lo scrittore di casa, non un writeFileSync crudo: scrive atomico e non lascia mezzo file se
  // il processo muore a meta'. Il tetto degli scrittori crudi scende e non risale (AR-639).
  scriviJsonAtomico(dove, {
    _cosa_e: "I pacchetti di un lotto: una squadra per pacchetto, cinque squadre per ondata. Lo scrive cervello/pacchetti-lotto.mjs.",
    generato: new Date().toISOString().slice(0, 16).replace("T", " "),
    registro: SITO ? "sito" : "macchina",
    aperti: tutti.length,
    prova_umana: SITO ? null : umani.length,
    _prova_umana: SITO ? "non misurata: le schede del sito non hanno il campo verifica" : "schede che chiude solo Nicola",
    solo_gravi: SOLO_GRAVI, quota: QUOTA, coperti, fuori: fuori.length,
    coppie_che_si_toccano: coppieCheSiToccano,
    ondate: ondate.map((o) => o.map((p) => ({ chiave: p.chiave, difetti: p.difetti }))),
  });
  console.log(`Scritto: ${path.relative(ROOT, dove)}`);
}
