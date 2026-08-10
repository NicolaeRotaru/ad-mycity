#!/usr/bin/env node
// 🧭 LA VERITÀ DENTRO I PIANI — quali frasi dei piani dicono una cosa che il registro-fatti smentisce.
//
// PERCHÉ ESISTE. `piani-data.mjs` (il gemello) risponde a «da quanto è fermo questo piano». È la
// domanda giusta, ma si ferma un passo prima di quella che costa soldi: **cosa dice, di falso, un
// piano fermo da 46 giorni?** Misurato il 2026-08-10, la risposta era pesante: il Piano
// Istituzionale apre dicendo che il Bando Commercio ER è «sportello APERTO fino al 21/07/2026», e
// il Piano Vendite ne fa una battuta di chiusura da usare col negoziante («lo Stato rimborsa il
// 40%, ma chiude il 21 luglio»). Quel bando è CHIUSO dal 23/6/2026 — limite di 350 domande
// raggiunto — e il fatto sta nel registro dall'11/7. Cioè: la macchina lo sapeva, e i piani
// continuavano a dire il contrario a chi li apriva.
//
// LA STESSA PAGINA SI CONTRADDICEVA DA SOLA. In fondo al Piano Istituzionale il blocco che l'AD
// rigenera a ogni giro dice, corretto, «Bando ER FESR: CHIUSO 23/6 — non citare (registro-fatti)».
// A riga 12 dello stesso file il piano dice aperto. Nessuno dei due lettori — la macchina o Nicola
// — poteva accorgersene senza leggere tutto il file: le due frasi distano 180 righe.
//
// PERCHÉ NON BASTAVA `coerenza-fatti.mjs`. Quel guardiano dà la caccia al valore VECCHIO nel
// momento in cui un fatto cambia, e poi la caccia si chiude. È giusto così — ma vale solo per i
// fatti cambiati da quando esiste il meccanismo: al 2026-08-10 girava con «cacce aperte: 0 · file
// vivi scansionati: 0», cioè leggeva zero file mentre nove piani su dieci portavano una data
// scaduta e quattro un bando morto. Questo file fa la domanda al contrario: non «dov'è finita la
// copia vecchia di ciò che ho appena cambiato», ma «cosa dicono i piani, oggi, che il registro
// smentisce» — e la fa ogni volta, non solo il giorno del cambio.
//
// DA DOVE VIENE LA VERITÀ. Mai da qui: ogni regola cita un `fatto` di `registro-fatti.json` e ne
// stampa valore e fonte. Se quel fatto sparisce dal registro la regola non tira a indovinare, si
// dichiara cieca ed esce 2. Il registro resta la casa unica (AR-102); questo è solo un lettore.
//
// COSA NON È. Non è un verificatore di verità: è una lista curata di N smentite note. Un verde qui
// dice «nessuna delle N frasi sbagliate che so riconoscere», MAI «i piani sono veri» — la
// differenza fra le due frasi è tutta la distanza fra un metro e una misura cieca.
//
// PERCHÉ AVVISA IN CIMA INVECE DI CORREGGERE IL TESTO. La tentazione era riscrivere le 45 frasi. È
// sbagliata per due motivi che si sommano. ① Quei piani sono di Nicola: il mansionario dice di
// proporre, non di riscrivere. ② Toccarli farebbe ripartire da zero il contatore del gemello, e
// nove piani «fermi da 46 giorni» diventerebbero nove piani «aggiornati oggi» — cioè la macchina si
// darebbe da sola la promozione, cancellando l'unico allarme che dice a Nicola che i piani vanno
// rivisti. Il difetto sarebbe sparito dal cruscotto restando intero nella realtà. Quindi il testo
// non si tocca: la smentita si scrive in un blocco a parte, in cima, che `corpoDelPiano()` toglie
// prima di misurare — la stessa esenzione, e per la stessa ragione, della riga della data.
//
// Uso:
//   node cervello/piani-verita.mjs             # report: quali frasi il registro smentisce
//   node cervello/piani-verita.mjs --scrivi    # scrive/aggiorna l'avviso in cima ai piani smentiti
//   node cervello/piani-verita.mjs --controlla # esce 1 se resta una frase smentita
//   node cervello/piani-verita.mjs --json      # per gli script
//
// Uscita (contratto guardiani, AR-322):
//   0 = misurato · 1 = restano frasi smentite (solo con --controlla) · 2 = non ho potuto misurare

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";

const CARTELLA = "MyCity-Vault/06-Piani";
const REGISTRO = "MyCity-Vault/90-Memoria-AI/registro-fatti.json";
const JSON_MODE = process.argv.includes("--json");
const CONTROLLA = process.argv.includes("--controlla");
const SCRIVI = process.argv.includes("--scrivi");

// ── Le smentite che so riconoscere ──────────────────────────────────────────
//
// Ogni regola è tarata sul testo REALE dei dieci piani al 2026-08-10: i pattern sono stretti
// apposta, perché un guardiano che grida al lupo su una frase giusta viene spento entro la
// settimana. `assolve` è la valvola che rende possibile la riparazione: la frase che *nomina* il
// fatto vecchio per dire che è morto («il bando è CHIUSO dal 23/6») deve poter restare nel piano
// senza far scattare la regola — altrimenti l'unico modo di far tornare il verde sarebbe cancellare
// la storia invece di correggerla. È lo stesso inciampo di `piani-data.mjs`, dove annotare che un
// piano era fermo lo faceva risultare aggiornato.

export const REGOLE = [
  {
    chiave: "bando-er-aperto",
    fatto: "bando.commercio-er.scadenza",
    titolo: "Il Bando Commercio ER è dato per aperto",
    // La data da sola NON basta, e questa regola l'ha imparato sbagliando: alla prima esecuzione
    // pescava tre righe di meteo del blocco dell'AD («Martedì 21/7 pioggia»), perché scritte `21/7`
    // e non `21/07`. Tre falsi allarmi su venti sono abbastanza per far spegnere un guardiano, che
    // è il modo in cui un controllo muore davvero. Quindi la riga deve parlare ANCHE di bandi.
    cerca: /\b21\/0?7(?:\/2026)?\b|\b21 luglio\b/i,
    esige: /bando|commercio er|sportello|fondo perduto|candidatur|sfinge|voucher|scad/i,
    assolve: /chius|scadut|non citare|non esiste più|superflua/i,
    rimedio: "Togli la finestra: il bando è chiuso dal 23/6/2026, la scadenza del 21/7 non è mai stata raggiungibile.",
  },
  {
    chiave: "pi26-aperto",
    fatto: "bando.pi26.idoneita",
    titolo: "Il voucher PI26 è dato per aperto o da inviare",
    cerca: /PI26[^\n]*\b(?:apert|invio|invia|scade|priorità alta|30\/0?7)/i,
    assolve: /chius|non idone|scadut|non citare/i,
    rimedio: "MyCity non è idonea e lo sportello non è più rilevante: la riga va tolta, non aggiornata.",
  },
  {
    chiave: "commissione-12",
    fatto: "pricing.commissione",
    titolo: "La commissione al negozio è scritta 12%",
    cerca: /\b12\s?%/,
    assolve: /era 12|prima 12|non più 12|da 12/i,
    rimedio: "La commissione decisa è il 10% sul venduto: correggi il numero e i conti che ci stanno sopra.",
  },
  {
    chiave: "faro-garetti",
    fatto: "negozio.faro",
    titolo: "Il negozio-faro è Garetti (o Casa Linda)",
    cerca: /\bGaretti\b|\bCasa Linda\b/,
    assolve: /non è (?:più )?(?:il )?(?:negozio-)?faro|mai firmato|prospect non firmato|demo esclusa/i,
    rimedio: "Il faro è Pane Quotidiano, unico negozio reale; Garetti non ha mai firmato e Casa Linda è la demo esclusa.",
  },
  {
    chiave: "istantanea-25-giugno",
    fatto: "negozio.faro",
    titolo: "Una fotografia del 25/06/2026 è presentata come «oggi»",
    // L'unica regola che non smentisce un numero ma una PAROLA: «~1 negozio, ~0 ordini» regge
    // ancora — è la lettura dal vivo del 10/8 dentro `negozio.faro` a dirlo — mentre «oggi» no, e
    // fa sembrare fresca di giornata una pagina ferma da 46 giorni.
    nota: "I numeri della frase reggono ancora al 10/8; a mentire è la parola «oggi».",
    cerca: /\b25\/0?6\/2026\b/,
    assolve: /fotografia del|istantanea del|al 25\/06\/2026, poi/i,
    rimedio: "Di' che è la fotografia del 25/6, non «oggi»: i numeri reggono, la data no.",
  },
];

// ── I pezzi puri (provati in cervello/test/piani-verita.test.mjs) ───────────

const APRE_AD = /<!--\s*🤖 AD-AGGIORNAMENTO:START/;
const CHIUDE_AD = /AD-AGGIORNAMENTO:END\s*-->/;
const APRE_DATA = /<!--\s*🗓️ AD-DATA:START/;
const CHIUDE_DATA = /AD-DATA:END\s*-->/;
const APRE_AVVISO = /<!--\s*⛔ AD-SMENTITE:START/;
const CHIUDE_AVVISO = /AD-SMENTITE:END\s*-->/;

/**
 * A chi appartiene ogni riga del piano. Serve perché il rimedio è diverso e va detto diverso:
 * una frase nel `corpo` l'ha scritta Nicola e si corregge con una PR che lui firma; una frase nel
 * blocco `ad` l'ha scritta la macchina e sparisce da sola alla prossima rigenerazione — a patto che
 * il giro giri, ed è esattamente ciò che al 10/8 non succedeva da venti giorni.
 *
 * Le righe si marcano tutte, comprese quelle dei marcatori: un blocco aperto e mai chiuso deve
 * tingere il resto del file di `ad` e non tornare di nascosto a `corpo`, altrimenti un file
 * malformato si porterebbe dietro un verdetto sbagliato sul mittente della frase.
 */
export function zonePerRiga(testo) {
  let zona = "corpo";
  return String(testo ?? "")
    .split("\n")
    .map((riga) => {
      if (APRE_AD.test(riga)) zona = "ad";
      else if (APRE_DATA.test(riga)) zona = "data";
      else if (APRE_AVVISO.test(riga)) zona = "avviso";
      const qui = zona;
      if (CHIUDE_AD.test(riga) || CHIUDE_DATA.test(riga) || CHIUDE_AVVISO.test(riga)) zona = "corpo";
      return { riga, zona: qui };
    });
}

/**
 * Le frasi di un piano che una regola smentisce, con numero di riga e zona.
 *
 * Le due zone generate — la riga della data e l'avviso stesso — non si guardano mai: citano per
 * forza le date e i valori che le regole cercano, e un guardiano che si accusa da solo produce un
 * rosso che nessuna riparazione può spegnere.
 */
export function smentiteNelTesto(testo, regole = REGOLE) {
  const righe = zonePerRiga(testo);
  const trovate = [];
  righe.forEach(({ riga, zona }, i) => {
    if (zona === "data" || zona === "avviso") return;
    for (const r of regole) {
      if (!r.cerca.test(riga)) continue;
      if (r.esige && !r.esige.test(riga)) continue; // il segnale c'è, ma parla d'altro
      if (r.assolve?.test(riga)) continue;
      trovate.push({ regola: r.chiave, riga: i + 1, zona, testo: riga.trim() });
    }
  });
  return trovate;
}

// ── L'avviso in cima al piano ───────────────────────────────────────────────

export const INIZIO_AVVISO = "<!-- ⛔ AD-SMENTITE:START";
export const FINE_AVVISO = "<!-- ⛔ AD-SMENTITE:END -->";
const bloccoAvviso = () => /<!--\s*⛔ AD-SMENTITE:START[\s\S]*?AD-SMENTITE:END\s*-->/g;

/** Il piano senza l'avviso — il testo su cui si misura, per non contare le proprie parole. */
export function senzaAvviso(testo) {
  return String(testo ?? "").replace(bloccoAvviso(), "").replace(/\n{3,}/g, "\n\n");
}

/**
 * L'avviso come lo legge Nicola aprendo il piano: quante frasi non sono più vere, quali, e cosa
 * dice invece il registro. Niente rimedi tecnici qui dentro — questo lo legge chi apre un piano,
 * non chi ripara uno script.
 */
export function avviso(colpiPerRegola, oggi) {
  const totale = colpiPerRegola.reduce((n, r) => n + r.colpi.length, 0);
  const frasi = totale === 1 ? "una frase" : `${totale} frasi`;
  const righe = [
    `${INIZIO_AVVISO} · lo riscrive \`node cervello/piani-verita.mjs --scrivi\`, non a mano -->`,
    `> ⛔ **Attenzione: ${frasi} di questo piano ${totale === 1 ? "non è più vera" : "non sono più vere"}.** Il registro dei fatti le smentisce, e il testo qui sotto è rimasto com'era. Correggerlo è una revisione del piano: la decide Nicola.`,
  ];
  for (const r of colpiPerRegola) {
    const dove = r.colpi.map((c) => c.riga).join(", ");
    const plurale = r.colpi.length === 1 ? "riga" : "righe";
    // Quando la regola non smentisce un valore ma una parola, il valore grezzo del fatto confonde
    // più di quanto spieghi: al suo posto va la frase che dice PERCHÉ quel fatto la smentisce.
    const cosa = r.nota ?? `il registro dice: ${accorcia(r.fatto_oggi.valore, 180)}`;
    righe.push(`> · **${r.titolo}** (${plurale} ${dove}) — ${cosa} *(${fonteBreve(r.fatto_oggi.fonte)})*`);
  }
  righe.push(`> *Misurato il ${oggi}. Quando il piano e il registro tornano d'accordo, questo avviso sparisce da solo.*`);
  righe.push(FINE_AVVISO);
  return righe.join("\n");
}

/**
 * Mette l'avviso sotto la riga della data (prima «da quanto è fermo», poi «cosa dice di sbagliato»),
 * o sostituisce quello già presente. Idempotente: due esecuzioni di fila lasciano lo stesso file.
 */
export function inserisciAvviso(testo, blocco) {
  const t = String(testo ?? "");
  if (bloccoAvviso().test(t)) return t.replace(bloccoAvviso(), blocco);
  const righe = t.split("\n");
  const fineData = righe.findIndex((r) => /AD-DATA:END/.test(r));
  if (fineData !== -1) {
    righe.splice(fineData + 1, 0, "", blocco);
    return righe.join("\n");
  }
  const titolo = righe.findIndex((r) => /^#\s+\S/.test(r));
  if (titolo === -1) return `${blocco}\n\n${t}`;
  righe.splice(titolo + 1, 0, "", blocco);
  return righe.join("\n");
}

/** Toglie l'avviso quando non c'è più niente da smentire. */
export function togliAvviso(testo) {
  const t = String(testo ?? "");
  if (!bloccoAvviso().test(t)) return t;
  return t.replace(bloccoAvviso(), "").replace(/\n{3,}/g, "\n\n");
}

/**
 * Il piano con l'avviso giusto in cima — o senza, se non c'è più niente da smentire.
 *
 * I numeri di riga sono la parte delicata: l'avviso li cita, e inserendolo li sposta tutti. Perciò
 * si misura due volte — una per sapere COSA scrivere, una sul file finito per sapere DOVE sono
 * finite le frasi. Il secondo giro non cambia l'altezza del blocco (dipende da quante regole hanno
 * colpito, non da quanto sono grandi i numeri), quindi la cosa si ferma qui e non oscilla: è la
 * proprietà che rende l'avviso rilanciabile a ogni giro senza che il file cambi ogni volta.
 */
export function pianoConAvviso(testo, registro, oggi) {
  const pulito = senzaAvviso(testo);
  const raggruppa = (t) => {
    const s = smentiteNelTesto(t);
    return REGOLE.map((r) => ({
      ...r,
      fatto_oggi: fattoDalRegistro(registro, r.fatto),
      colpi: s.filter((x) => x.regola === r.chiave),
    })).filter((r) => r.colpi.length);
  };

  if (!raggruppa(pulito).length) return togliAvviso(testo);

  // Primo giro: un avviso con i numeri del testo senza blocco — serve solo a dare al blocco la sua
  // altezza definitiva. Secondo giro: gli stessi conti sul file come sarà davvero.
  const provvisorio = inserisciAvviso(pulito, avviso(raggruppa(pulito), oggi));
  return inserisciAvviso(provvisorio, avviso(raggruppa(provvisorio), oggi));
}

/** Il valore e la fonte che il registro dà oggi per un fatto — o `null` se quel fatto non c'è più. */
export function fattoDalRegistro(registro, id) {
  const f = (registro?.fatti ?? []).find((x) => x.id === id);
  return f ? { id, valore: String(f.valore), fonte: String(f.fonte ?? "—") } : null;
}

/**
 * La fonte in forma corta. Tagliata al primo inciso invece che a metà parola: `accorcia` da sola
 * produceva code come «(campi stripe_details_sub…» — una parentesi aperta e mai chiusa, che è il
 * modo tipografico di dire una cosa a metà.
 */
export function fonteBreve(fonte, max = 90) {
  const t = String(fonte ?? "—").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const tagliata = t.slice(0, max);
  const inciso = tagliata.lastIndexOf(" (");
  return inciso > max / 3 ? `${tagliata.slice(0, inciso)}…` : accorcia(t, max);
}

/** Taglia una frase per il report senza far credere che finisse lì. */
export function accorcia(s, max = 96) {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

// ── Le porte impure ─────────────────────────────────────────────────────────

function leggiRegistro() {
  try {
    return JSON.parse(readFileSync(join(AD_ROOT, REGISTRO), "utf8"));
  } catch (e) {
    return { errore: e.message };
  }
}

function leggiPiani() {
  return readdirSync(join(AD_ROOT, CARTELLA))
    .filter((n) => n.endsWith(".md"))
    .filter((n) => !/^prompt/i.test(n)) // stessa regola del gemello: un prompt non è un piano
    .sort()
    .map((nome) => ({
      nome: nome.replace(/\.md$/, ""),
      path: `${CARTELLA}/${nome}`,
      testo: readFileSync(join(AD_ROOT, CARTELLA, nome), "utf8"),
    }));
}

// ── Il comando ──────────────────────────────────────────────────────────────

function main() {
  const registro = leggiRegistro();
  if (registro.errore) {
    console.error(`\n⛔ PIANI-VERITÀ CIECO: non riesco a leggere ${REGISTRO} — ${registro.errore}\n`);
    process.exit(2);
  }

  // Una regola che cita un fatto sparito non va fatta passare in silenzio: significherebbe smettere
  // di controllare qualcosa continuando a stampare un verde.
  const orfane = REGOLE.filter((r) => !fattoDalRegistro(registro, r.fatto));
  if (orfane.length) {
    console.error(`\n⛔ PIANI-VERITÀ CIECO: ${orfane.length} regole citano un fatto che non è più nel registro:`);
    for (const r of orfane) console.error(`   • ${r.chiave} → ${r.fatto}`);
    console.error(`\n   Rimedio: rimetti il fatto in ${REGISTRO}, o togli la regola da piani-verita.mjs.\n`);
    process.exit(2);
  }

  const piani = leggiPiani();
  if (!piani.length) {
    console.error(`\n⛔ PIANI-VERITÀ CIECO: nessun piano leggibile in ${CARTELLA}\n`);
    process.exit(2);
  }

  if (SCRIVI) {
    let scritti = 0;
    for (const p of piani) {
      const nuovo = pianoConAvviso(p.testo, registro, nowPiacenza());
      if (nuovo !== p.testo) {
        writeFileSync(join(AD_ROOT, p.path), nuovo);
        p.testo = nuovo;
        scritti++;
      }
    }
    if (!JSON_MODE) console.log(`\n⛔ Avviso delle smentite scritto su ${scritti} piani su ${piani.length}.`);
  }

  const esiti = piani.map((p) => ({ ...p, smentite: smentiteNelTesto(p.testo) }));
  const tutte = esiti.flatMap((p) => p.smentite.map((s) => ({ ...s, piano: p.nome })));
  const perRegola = REGOLE.map((r) => ({
    ...r,
    fatto_oggi: fattoDalRegistro(registro, r.fatto),
    colpi: tutte.filter((s) => s.regola === r.chiave),
  }));

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          esito: tutte.length ? "fuori" : "ok",
          oggi: nowPiacenza(),
          piani_letti: piani.length,
          regole: perRegola.length,
          smentite: tutte.length,
          per_regola: perRegola.map((r) => ({
            chiave: r.chiave,
            fatto: r.fatto,
            dice_il_registro: r.fatto_oggi.valore,
            fonte: r.fatto_oggi.fonte,
            rimedio: r.rimedio,
            colpi: r.colpi,
          })),
          // Il verde non è «i piani sono veri»: viaggia col suo perimetro, così chi legge il JSON
          // non può scambiare una lista curata per una verifica completa.
          perimetro: `${REGOLE.length} smentite note, cercate nel testo dei piani e nel blocco dell'AD`,
        },
        null,
        2,
      ),
    );
    process.exit(CONTROLLA && tutte.length ? 1 : 0);
  }

  console.log(`\n🧭 COSA DICONO I PIANI CHE IL REGISTRO SMENTISCE — ${piani.length} piani, oggi ${nowPiacenza()}\n`);

  if (!tutte.length) {
    console.log(`  ✅ Nessuna delle ${REGOLE.length} smentite note compare nei piani.`);
    console.log(`     (È una lista curata: vuol dire «non trovo quelle N frasi», non «i piani sono veri».)\n`);
    process.exit(0);
  }

  for (const r of perRegola.filter((x) => x.colpi.length)) {
    console.log(`  ❌ ${r.titolo} — ${r.colpi.length} frasi`);
    console.log(`     Il registro dice: ${accorcia(r.fatto_oggi.valore, 150)}`);
    console.log(`     Fonte: ${accorcia(r.fatto_oggi.fonte, 120)}`);
    if (r.nota) console.log(`     Da leggere così: ${r.nota}`);
    console.log(`     Rimedio: ${r.rimedio}`);
    for (const c of r.colpi) {
      const dove = c.zona === "ad" ? " [blocco dell'AD]" : "";
      console.log(`       · ${c.piano}:${c.riga}${dove}  ${accorcia(c.testo)}`);
    }
    console.log("");
  }

  const daNicola = tutte.filter((s) => s.zona === "corpo").length;
  const dallaMacchina = tutte.filter((s) => s.zona === "ad").length;
  console.log(`  ⚠️  ${tutte.length} frasi smentite: ${daNicola} nel testo dei piani, ${dallaMacchina} nel blocco che rigenera l'AD.`);
  if (dallaMacchina) {
    console.log(`     Quelle nel blocco dell'AD spariscono da sole appena il giro lo rigenera — se il giro gira.`);
  }
  console.log("");

  process.exit(CONTROLLA ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
