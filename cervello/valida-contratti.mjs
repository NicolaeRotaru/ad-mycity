#!/usr/bin/env node
// AR-043 — Validatore di CONTRATTO dei file auto-coscienza/*.json.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Verifica che i JSON di memoria-macchina
// rispettino lo schema canonico ("una sola verità" dei campi) e FALLISCE se un file ha campi
// fuori contratto o manca un campo obbligatorio.
//
// Perché (AR-043): il contratto viveva come prosa in un .md, non come schema eseguibile. Così
// auto-analisi.json poteva scrivere `supabase_marketplace/supabase_memoria` mentre il Pannello
// legge `salute_macchina.supabase` / `.stripe` → i due tile restavano sempre spenti. Questo
// validatore rende il contratto CODICE, cablabile in giro.sh come gate prima del commit.
//
// Uso:
//   node cervello/valida-contratti.mjs           -> report leggibile
//   node cervello/valida-contratti.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = tutti i file conformi · 1 = almeno una violazione di contratto

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { scriviJsonAtomico } from "./scrivi-json.mjs"; // AR-296: scrittura atomica anche qui
// AR-360 — l'enum di `genera` vive in contratto-scheda.mjs, dove un test la tiene allineata allo
// schema vero dei sotto-agenti. Qui la si PRETENDE: era dichiarata all'ingresso e mai riverificata.
import { GENERA_AMMESSI, verdettoFinding } from "./contratto-scheda.mjs";
// AR-356 · AR-567 — dove una prova non può puntare, e la differenza fra «non ancora soddisfatta» e
// «punta a un file che non esiste».
import { classificaProva, provaSuFileVolatile } from "./prove-regole.mjs";

const JSON_MODE = process.argv.includes("--json");
// AR-212 — `--correggi` rinomina gli alias vietati nel campo canonico, sul posto.
//
// Perché serve, oltre al cancello: il cancello dà al motore un VINCOLO, cioè chiede al modello di
// scrivere il nome giusto. Ma un vincolo è una richiesta, non una garanzia — e infatti misurato il
// 28/7 alle 05:59, giorni dopo aver alzato il cancello, `auto-analisi.json` aveva ancora
// `domande_bloccanti` con TRE domande dentro, una sul bando da 10.000€ in scadenza fra due giorni.
// La difesa di lettura (riportaAlias nel Pannello) le mostra a Nicola, ma il file resta sbagliato e
// il contratto resta rosso. Qui il rinominare è DETERMINISTICO: non dipende da chi scrive.
const CORREGGI = process.argv.includes("--correggi");
const DIR = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza");

// CONTRATTO: per ogni file, i campi obbligatori e i campi VIETATI (alias non canonici).
// `salute` descrive lo schema canonico del blocco salute_macchina letto dal Pannello.
export const CONTRATTO = {
  "auto-analisi.json": {
    obbligatori: ["data"],
    // AR-212 — gli alias che SPENGONO informazione nella Cabina. Il giro scriveva
    // `domande_bloccanti` mentre il Pannello legge `domande_per_nicola`: risultato, «nessuna domanda»
    // in Cabina mentre nel file ce n'erano tre, una sul bando in scadenza. Nessuno se n'è accorto
    // perché il numero mostrato era plausibile — zero domande è uno stato normale.
    // Il modello che scrive il file segue la prosa dello spec e sotto pressione sceglie sinonimi
    // plausibili: l'unico rimedio è che il contratto li VIETI, così il giro riceve un vincolo hard.
    vietati: {
      domande_bloccanti: "domande_per_nicola",
      errori_giro: "errori",
      domande: "domande_per_nicola",
      problemi: "errori",
    },
    // il blocco salute_macchina, se presente, deve usare i nomi canonici del Pannello
    salute_macchina: {
      // `sito_uptime` è entrato il 10/8, e il motivo per cui prima non c'era vale più della riga.
      //
      // Il giro lo scriveva già — «cieco da 28 giri (HTTP 503 dal 30/7, migrazione Render→Vercel
      // pianificata, non un guasto)» — e questo contratto lo BOCCIAVA come nome fuori schema. Il
      // risultato è la peggiore delle due bugie possibili: il cancello diventava rosso su ogni PR
      // aperta, e intanto l'informazione «il sito dei negozi non risponde» non arrivava lo stesso
      // in Cabina. Un contratto non è una lista di ciò che mi va bene: è la promessa che quello che
      // il giro scrive, qualcuno lo mostra. Perciò la riga qui sotto arriva INSIEME al tile nel
      // Pannello (AutoCoscienza.tsx) — e una prova tiene i due elenchi allineati, o fra un mese
      // saranno di nuovo due.
      // `sensori_ciechi_dichiarati` e `telegram_bot` sono entrati il 15/8 con la stessa identica
      // dinamica di `sito_uptime`: il giro li scriveva, il contratto li bocciava (cancello rosso su
      // OGNI PR aperta, non solo quelle che toccano questo file), e l'informazione non arrivava in
      // Cabina lo stesso. Stessa cura: la chiave entra qui INSIEME al tile in AutoCoscienza.tsx.
      canonici: [
        "supabase", "stripe", "dati_freschi", "sensori_attivi", "sito_uptime",
        "sensori_ciechi_dichiarati", "telegram_bot",
      ],
      vietati: ["supabase_marketplace", "supabase_memoria"], // AR-043: alias che spengono i tile
    },
  },
  "storico-salute.json": {
    obbligatori: ["serie"],
    // AR-579 — il tipo di visita. Il contratto in prosa ne ammetteva due (`completa|sonda`) e i
    // programmi ne scrivevano quattro: `auto-fix.mjs` marca i punti di burn-down dopo le chiusure,
    // `foto-radiografia.mjs` marca la radiografia totale. Fra la prosa e il codice comanda il codice
    // (i due valori in più sono informazione vera: un punto «auto-fix» NON è una misura di salute,
    // ha `voto_riportato: true`, e chi disegna il trend deve poterlo distinguere). Quello che NON
    // deve più succedere è il quinto valore inventato in silenzio: da qui in poi lo ferma il cancello.
    valori: [{
      campo: "serie[].tipo",
      ammessi: ["completa", "sonda", "auto-fix"],
      perche: "chi raggruppa la serie per tipo di visita perde i punti con un'etichetta che non conosce",
    }],
  },
  "cantiere-difetti.json": { obbligatori: ["difetti"] },
  // AR-213 — il contratto copriva TRE file su venticinque, e gli altri ventidue passavano in
  // silenzio (`if (!regola) continue`). È il motivo per cui AR-212 è arrivato fino alla Cabina: il
  // cancello che doveva intercettarlo non guardava quel campo, e nemmeno quel file.
  // Qui ci sono i file che il Pannello LEGGE DAVVERO — ricavati grepando pannello/src, non a memoria.
  "auto-radiografia.json": {
    obbligatori: ["data", "dimensioni"],
    // AR-579, l'altra metà: la radiografia totale si firmava `radiografia-totale` mentre il contratto
    // in prosa ammetteva solo `completa|sonda`. Stessa scelta: il valore vero entra nel contratto.
    valori: [{
      campo: "tipo",
      ammessi: ["completa", "sonda", "radiografia-totale"],
      perche: "il Pannello e il trend distinguono la visita profonda dalla sonda proprio da questo campo",
    }],
  },
  "apprendimento.json": { obbligatori: ["lezioni"], vietati: { insegnamenti: "lezioni", regole: "principi" } },
  "auto-miglioramento.json": { obbligatori: [] },
  "calibrazione.json": { obbligatori: ["registro"], vietati: { previsioni: "registro" } },
  "registro-realta.json": {
    obbligatori: ["entita"],
    vietati: { entità: "entita", soggetti: "entita" },
    // AR-577 — qui comanda il contratto, non il codice, e il motivo è il danno misurato: sette entità
    // su ventisette portavano `demo` o `escluso`, valori che il registro anti-invenzione non prevede.
    // `allocazione-check.mjs` conosceva `demo` ma NON `escluso`: i sei ristoranti che Nicola aveva
    // escluso il 18/7 («i ristoranti non sono il nostro target») rientravano nel conteggio dei negozi
    // candidabili a ogni giro. Una difesa nata contro i negozi inventati che ricontava gli scartati.
    valori: [{
      campo: "entita[].stato",
      ammessi: ["confermato", "scelta_ragionata", "da_verificare", "scartato"],
      perche: "il Pannello e il cancello di allocazione ragionano per stato: un valore fuori elenco esce da ogni filtro e da ogni conteggio",
    }],
  },
  "sensori-cecita.json": { obbligatori: ["sensori"] },
  "coerenza-fatti.json": { obbligatori: ["esito"] },
  "chiusura-loop.json": { obbligatori: [] },
  "costo-ai.json": { obbligatori: [] },
  "radiografia-marketplace.json": { obbligatori: [] },
  "watchlist-riferimenti.json": { obbligatori: [] },
};

// AR-213 — i file che il PANNELLO legge. Un file letto dalla Cabina e senza contratto dichiarato non
// è «minimale»: è una sezione che può spegnersi in silenzio al primo sinonimo. L'elenco è ricavato
// grepando pannello/src, non scritto a memoria — ed è per questo che il gate può pretenderlo.
const LETTI_DAL_PANNELLO = [
  "apprendimento.json", "auto-analisi.json", "auto-miglioramento.json", "auto-radiografia.json",
  "calibrazione.json", "cantiere-difetti.json", "chiusura-loop.json", "coerenza-fatti.json",
  "costo-ai.json", "radiografia-marketplace.json", "registro-realta.json", "sensori-cecita.json",
  "storico-salute.json", "watchlist-riferimenti.json",
];

/**
 * AR-212 — rinomina gli alias vietati nel loro campo canonico, sul posto.
 *
 * Non inventa e non sovrascrive: se il campo canonico ha già dei dati, l'alias viene lasciato stare e
 * il contratto resterà rosso — perché a quel punto NON è un rinominare, sono due liste diverse e
 * deciderlo non tocca a uno script. Il caso normale è che il canonico sia vuoto: allora il contenuto
 * si sposta e l'alias sparisce.
 */
export function correggiAlias(dati, regola) {
  const fatti = [];
  for (const [alias, canonico] of Object.entries(regola.vietati || {})) {
    if (!(alias in dati)) continue;
    const canonicoVuoto = !Array.isArray(dati[canonico]) || dati[canonico].length === 0;
    const aliasPieno = Array.isArray(dati[alias]) ? dati[alias].length > 0 : dati[alias] != null;
    if (canonicoVuoto && aliasPieno) {
      dati[canonico] = dati[alias];
      delete dati[alias];
      fatti.push(`${alias} → ${canonico}`);
    } else if (!aliasPieno) {
      delete dati[alias]; // alias vuoto: è solo rumore, si toglie
      fatti.push(`${alias} (vuoto) rimosso`);
    }
  }
  return fatti;
}

/**
 * AR-577 · AR-579 — il contratto controllava i NOMI dei campi e mai i VALORI.
 *
 * È la stessa malattia di AR-212 vista un piano sotto: lì un campo rinominato spegneva una sezione
 * della Cabina; qui un VALORE inventato esce da ogni filtro che ragiona per stato — e non spegne
 * niente, il che è peggio, perché non si vede. Il caso misurato: sei ristoranti che Nicola aveva
 * escluso il 18/7 restavano dentro al conteggio dei negozi candidabili, perché `escluso` non era
 * uno dei quattro stati che il cancello di allocazione conosce.
 *
 * Il percorso si scrive `campo` oppure `lista[].campo`: basta a coprire i contratti veri, e un
 * risolutore generico qui sarebbe codice che nessun caso esercita.
 *
 * @param {any} dati il JSON già letto
 * @param {{campo:string, ammessi:string[], perche:string}[]} regole
 * @returns {string[]} un problema per ogni valore fuori elenco, già scritto per un umano
 */
export function valoriFuoriContratto(dati, regole) {
  const problemi = [];
  for (const r of regole || []) {
    const [testa, coda] = r.campo.includes("[].") ? r.campo.split("[].") : [null, r.campo];
    const voci = testa === null
      ? [{ dove: r.campo, valore: dati?.[coda] }]
      : (Array.isArray(dati?.[testa]) ? dati[testa] : []).map((v, i) => ({
          dove: `${testa}[${i}]${v && v.nome ? ` (${v.nome})` : ""}.${coda}`,
          valore: v?.[coda],
        }));
    for (const v of voci) {
      if (v.valore === undefined) continue; // campo assente: se è obbligatorio lo dice `obbligatori`
      if (r.ammessi.includes(v.valore)) continue;
      problemi.push(
        `${v.dove} = "${v.valore}" è fuori contratto (ammessi: ${r.ammessi.join(", ")}). ${r.perche}.`,
      );
    }
  }
  return problemi;
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-360 · AR-356 · AR-567 — il contratto scende DENTRO gli elenchi
// ─────────────────────────────────────────────────────────────────────────────
//
// Fin qui il contratto guardava i nomi dei campi in cima al file e i valori di una lista sola. Le
// tre cose che gli sfuggivano vivono tutte un piano più sotto, dentro gli elementi:
//
//   AR-360 — un finding di radiografia senza `genera` non viene instradato da nessuno: né diventa
//            una lezione, né una sentinella, né un pezzo nuovo. Sparisce. Erano 163 su 286.
//   AR-356 — una prova che cita testo dentro la memoria che la macchina riscrive si smonta da sola.
//   AR-567 — una prova che punta a un file mai nato non è un piano: è un buco che sembra un piano.
//
// I TETTI, e perché ci sono. Questi tre numeri nascono grossi: un cancello che parte rosso su
// centosessantatré voci viene disattivato entro la settimana, e allora non protegge più niente. Il
// tetto è il debito ereditato dichiarato per iscritto: SCENDE quando si cura, non si alza mai. Ciò
// che nasce oggi passa comunque dal blocco duro, perché il conto non deve poter crescere.
export const TETTI_CONTRATTO = {
  // misurati sul repo il 2026-08-15, con i comandi che li ricontano a ogni giro
  findings_senza_genera: 163,
  prove_su_memoria_volatile: 11,
  prove_al_vuoto: 1,
};

/** I findings di radiografia che nessuno può instradare, con il motivo per ognuno. */
export function findingsSenzaRotta(rad) {
  const fuori = [];
  for (const dim of Array.isArray(rad?.dimensioni) ? rad.dimensioni : []) {
    for (const f of Array.isArray(dim?.findings) ? dim.findings : []) {
      const v = verdettoFinding(f);
      if (v.codice === 0) continue;
      // `genera: null` = campo mancante · `genera` valorizzato = etichetta inventata. Sono due
      // guasti con due cure: il primo è debito ereditato sotto tetto, il secondo è blocco duro.
      fuori.push({
        dimensione: dim.key || dim.nome || "?",
        titolo: f?.titolo || "(senza titolo)",
        causa: v.genera === null ? "genera-mancante" : "genera-fuori-enum",
        motivo: v.motivo,
      });
    }
  }
  return fuori;
}

/**
 * Le prove del cantiere che non possono reggere: quelle puntate alla memoria volatile e quelle al
 * vuoto. `esisteFile` è iniettato così il giudizio si può eseguire in un test senza il disco vero.
 */
export function proveInammissibili(difetti = [], esisteFile = () => true) {
  const volatili = [];
  const alVuoto = [];
  for (const d of Array.isArray(difetti) ? difetti : []) {
    const v = d?.verifica;
    if (!v || !v.file || !v.pattern) continue;
    if (provaSuFileVolatile(v)) volatili.push({ id: d.id, file: v.file });
    const classe = classificaProva({ verifica: v, fileEsiste: esisteFile(v.file) }).classe;
    if (classe === "al-vuoto") alVuoto.push({ id: d.id, file: v.file });
  }
  return { volatili, alVuoto };
}

/** Un conto sopra il suo tetto dichiarato: il messaggio che chi legge deve poter capire da solo. */
function oltreIlTetto(quanti, tetto, cosa, esempi) {
  if (quanti <= tetto) return null;
  return `${quanti} ${cosa} — il tetto dichiarato è ${tetto} e i tetti scendono, non salgono. Esempi: ${esempi.slice(0, 5).join(" · ")}`;
}

function valida(nomeFile, dati, regola) {
  const problemi = [];
  problemi.push(...valoriFuoriContratto(dati, regola.valori));

  // AR-360 — dentro i findings della radiografia.
  if (nomeFile === "auto-radiografia.json") {
    const fuori = findingsSenzaRotta(dati);
    const inventati = fuori.filter((f) => f.causa === "genera-fuori-enum");
    const mancanti = fuori.filter((f) => f.causa !== "genera-fuori-enum");
    // Un'etichetta INVENTATA è blocco duro senza tetto: oggi sono zero, e da qui in poi restano zero.
    for (const f of inventati.slice(0, 5)) {
      problemi.push(`finding «${f.titolo}» (${f.dimensione}): ${f.motivo}. Ammessi: ${GENERA_AMMESSI.join(", ")}.`);
    }
    const troppi = oltreIlTetto(
      mancanti.length,
      TETTI_CONTRATTO.findings_senza_genera,
      "findings senza `genera`: nessuno li instrada, non diventano né lezione né sentinella né pezzo nuovo (AR-360)",
      mancanti.map((f) => f.titolo),
    );
    if (troppi) problemi.push(troppi);
  }

  // AR-356 · AR-567 — dentro le prove delle schede del cantiere.
  if (nomeFile === "cantiere-difetti.json") {
    const { volatili, alVuoto } = proveInammissibili(dati.difetti, (f) => existsSync(join(AD_ROOT, f)));
    const t1 = oltreIlTetto(
      volatili.length,
      TETTI_CONTRATTO.prove_su_memoria_volatile,
      "prove puntate a file che la macchina riscrive da sola: si smontano da sole, riscrivile come {comando} (AR-356)",
      volatili.map((v) => `${v.id}→${v.file}`),
    );
    if (t1) problemi.push(t1);
    const t2 = oltreIlTetto(
      alVuoto.length,
      TETTI_CONTRATTO.prove_al_vuoto,
      "prove che puntano a un file inesistente: non è «non ancora soddisfatta», è un piano che nessun lavoro può soddisfare (AR-567)",
      alVuoto.map((v) => `${v.id}→${v.file}`),
    );
    if (t2) problemi.push(t2);
  }

  for (const req of regola.obbligatori || []) {
    if (!(req in dati)) problemi.push(`campo obbligatorio mancante: "${req}"`);
  }
  // AR-212: un alias non è un dettaglio di stile — è informazione che sparisce dalla Cabina.
  for (const [alias, canonico] of Object.entries(regola.vietati || {})) {
    if (alias in dati) {
      const n = Array.isArray(dati[alias]) ? dati[alias].length : "?";
      problemi.push(
        `"${alias}" è un alias non canonico di "${canonico}": il Pannello legge "${canonico}" e mostrerebbe ZERO invece di ${n}. Rinomina il campo.`,
      );
    }
  }
  if (regola.salute_macchina && dati.salute_macchina && typeof dati.salute_macchina === "object") {
    const sm = dati.salute_macchina;
    for (const vietato of regola.salute_macchina.vietati) {
      if (vietato in sm)
        problemi.push(`salute_macchina."${vietato}" è un alias non canonico (usa "supabase"/"stripe")`);
    }
    const chiaviCanoniche = regola.salute_macchina.canonici;
    for (const k of Object.keys(sm)) {
      if (!chiaviCanoniche.includes(k))
        problemi.push(`salute_macchina."${k}" fuori contratto (ammessi: ${chiaviCanoniche.join(", ")})`);
    }
  }
  return problemi;
}

function main() {
  const quando = nowPiacenza();
  if (!existsSync(DIR)) {
    const out = { ok: false, quando, errore: "cartella auto-coscienza mancante" };
    console.log(JSON_MODE ? JSON.stringify(out) : "❌ auto-coscienza/ non trovata");
    process.exit(1);
  }

  const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  const violazioni = [];
  const corretti = [];
  const nonDichiarati = []; // AR-213: contati e mostrati, non più invisibili
  for (const f of files) {
    const regola = CONTRATTO[f];
    if (!regola) {
      // AR-213 — un file che la Cabina LEGGE e che nessuno ha dichiarato è un buco nel cancello:
      // può cambiare nome a un campo e spegnere una sezione senza che nulla protesti. Chi invece
      // non è letto da nessuno resta fuori senza far fallire il gate — un cancello che parte rosso
      // su ventidue file verrebbe disattivato entro la settimana, e non proteggerebbe più niente.
      if (LETTI_DAL_PANNELLO.includes(f)) {
        violazioni.push({ file: f, problemi: [`letto dal Pannello ma SENZA contratto dichiarato: una sezione può spegnersi in silenzio (AR-213). Dichiaralo in CONTRATTO.`] });
      } else {
        nonDichiarati.push(f);
      }
      continue;
    }
    let dati;
    try {
      dati = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    } catch (e) {
      violazioni.push({ file: f, problemi: [`JSON non parsabile: ${String(e.message || e)}`] });
      continue;
    }
    // AR-212: se richiesto, prima si corregge — poi si valida ciò che resta.
    if (CORREGGI) {
      const rinominati = correggiAlias(dati, regola);
      if (rinominati.length) {
        scriviJsonAtomico(join(DIR, f), dati);
        corretti.push({ file: f, campi: rinominati });
      }
    }
    const problemi = valida(f, dati, regola);
    if (problemi.length) violazioni.push({ file: f, problemi });
  }

  const out = {
    ok: violazioni.length === 0,
    quando,
    file_controllati: files.filter((f) => CONTRATTO[f]).length,
    file_totali: files.length,                       // AR-213: il denominatore, che prima non c'era
    non_dichiarati: nonDichiarati,                   // AR-213: contati e mostrati, non più invisibili
    corretti,                                        // AR-212: alias rinominati sul posto da --correggi
    violazioni,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
  } else if (out.ok) {
    console.log(`✅ contratti: ${out.file_controllati}/${out.file_totali} file auto-coscienza conformi — ${quando}`);
    if (nonDichiarati.length) {
      // Non è un errore: sono file che nessuna schermata legge. Ma il numero si vede, così «22 file
      // non giudicati» smette di essere un fatto invisibile e diventa una scelta consapevole.
      console.log(`   ${nonDichiarati.length} senza contratto (nessuna schermata li legge): ${nonDichiarati.join(", ")}`);
    }
  } else {
    console.log(`❌ contratti: ${violazioni.length} file fuori contratto — ${quando}`);
    for (const v of violazioni) {
      console.log(`  · ${v.file}`);
      for (const p of v.problemi) console.log(`      - ${p}`);
    }
  }
  process.exit(out.ok ? 0 : 1);
}

// Un modulo non deve FARE cose solo perché lo importi. Senza questa guardia, importare
// valida-contratti da un test lo eseguiva: stampava il rapporto e — con --correggi fra gli argomenti
// del processo chiamante — avrebbe riscritto i file del vault. È lo stesso difetto trovato su
// calibrazione.mjs nel lotto 6: la seconda volta, quindi la regola vale in generale.
if (import.meta.url === `file://${process.argv[1]}`) main();
