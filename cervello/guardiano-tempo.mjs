#!/usr/bin/env node
// Capacità #38 — IL GUARDIANO DEL TUO TEMPO. Misura in modo deterministico il CARICO DI FIRME
// di Nicola: quante azioni 🔴/🟡 aspettano la sua firma, da quanti giorni, quante ne ha chiuse.
// È il KPI della Legge "Nicola sempre più leggero": se la coda di firma cresce e invecchia, la
// macchina lo dice a chiare lettere invece di lasciare che il collo di bottiglia resti invisibile.
//
// 🟢 Sola lettura: legge la coda reale AZIONI-IN-ATTESA.md e il registro DECISIONI.md, NON scrive
// nel vault, NON fa git, NON tocca il mondo. Nessun numero inventato: tutto è contato dal testo.
//
// Uso:
//   node cervello/guardiano-tempo.mjs           -> report leggibile
//   node cervello/guardiano-tempo.mjs --json     -> output JSON (per gate / sentinelle / Pannello)
//
// Exit: 0 = coda sotto controllo · 1 = collo di bottiglia (una firma aspetta da troppo, soglia 7gg)

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { azioniDellaCoda, aspettaLaFirma } from "./coda-cabina.mjs";

const JSON_MODE = process.argv.includes("--json");
const SOGLIA_STALLO_GG = 7; // oltre questa attesa una firma è "ferma da troppo"

/** Oltre un mese del ritmo reale di Nicola, la coda è il vincolo (seconda metà di AR-569). */
export const SETTIMANE_MAX = 4;

/**
 * IL VERDETTO SULLA CODA DELLE FIRME — puro, così una prova lo può ESEGUIRE su un mondo finto.
 *
 * ⚠️ 27/8 · AR-856 — QUESTA FUNZIONE NON C'ERA, e le tre righe che la compongono vivevano dentro il
 * corpo dello script, fra una lettura di file e una stampa. Il caso di prova che difende la
 * seconda metà di AR-569 — «il volume, non solo l'età» — era scritto così:
 *
 *     if (c.totale_in_attesa > 20 && (c.piu_vecchia_gg ?? 0) <= soglia) { …asserzioni… }
 *
 * cioè misurava la coda VERA di oggi. E la coda di oggi ha la più vecchia a 44 giorni, ben oltre i
 * 7 di soglia: quel ramo non ci entra mai, le asserzioni non girano, e la mutazione che toglie il
 * volume dal verdetto (`ok: !stallo && !troppeInCoda` → `ok: !stallo`) lascia tutto verde.
 * Misurato il 27/8. È il ramo che l'ambiente non prende mai: la prova era scritta bene e parlava
 * di uno stato del mondo che qui non capita.
 *
 * La cura è quella di casa: la decisione esce, e il mondo le arriva da fuori. Adesso le due metà
 * del difetto — l'età e il volume — si possono percorrere tutt'e due, sempre.
 *
 * @param {{etaPiuVecchiaGg?: number, inAttesa?: number, ritmoSettimanale?: number}} mondo
 * @returns {{stallo: boolean, settimaneArretrato: number|null, troppeInCoda: boolean, ok: boolean}}
 */
export function verdettoCoda({ etaPiuVecchiaGg = 0, inAttesa = 0, ritmoSettimanale = 0 } = {}) {
  const stallo = etaPiuVecchiaGg > SOGLIA_STALLO_GG;
  // Con ritmo zero non si divide per zero: si dichiara che l'arretrato non è calcolabile, e resta
  // il conteggio nudo. Un `null` qui è un «non lo so», e non deve diventare un «va bene».
  const settimaneArretrato = ritmoSettimanale > 0 ? +(inAttesa / ritmoSettimanale).toFixed(1) : null;
  const troppeInCoda = settimaneArretrato != null && settimaneArretrato > SETTIMANE_MAX;
  return { stallo, settimaneArretrato, troppeInCoda, ok: !stallo && !troppeInCoda };
}

// La coda da leggere. Di norma quella vera; `GUARDIANO_TEMPO_CODA` la sposta su un file finto, così
// il freno può metterlo alla prova su una coda costruita apposta invece che sul dato vivo.
const CODA = process.env.GUARDIANO_TEMPO_CODA || join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md");
const DECISIONI = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/DECISIONI.md");

// Parsa "2026-07-06 11:11" (ora di Piacenza) in Date. now e righe usano la stessa lettura locale,
// così lo scarto (l'età) è corretto a prescindere dal fuso del server.
function parseData(s) {
  const m = s && s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
}

// Classifica lo stato di una riga della coda con priorità: chiusa > armata/gated > in attesa.
function classificaStato(stato) {
  const s = stato.toLowerCase();
  if (/✅|fatto|merged|deciso|rimandat|⛔|ritirat/.test(s)) return "chiusa";
  if (/⏸|armat|bozze pronte/.test(s)) return "armata";
  if (/in attesa/.test(s)) return "in_attesa";
  return "altro";
}

function coloreRiga(colore) {
  if (colore.includes("🔴")) return "🔴";
  if (colore.includes("🟡")) return "🟡";
  if (colore.includes("🟢")) return "🟢";
  return "?";
}

function gg(ms) {
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

async function main() {
  const quandoStr = nowPiacenza();
  const now = parseData(quandoStr) || new Date();

  if (!existsSync(CODA)) {
    const out = { ok: false, quando: quandoStr, errore: "AZIONI-IN-ATTESA.md non trovato" };
    console.log(JSON_MODE ? JSON.stringify(out) : "⚪ AZIONI-IN-ATTESA.md non trovato: non ho potuto misurare la coda");
    // AR-859 — 2 = NON HO POTUTO MISURARE. Uscire 1 qui diceva «la coda e' in stallo», che senza il
    // file non lo sa nessuno: la coda potrebbe essere vuota e perfetta.
    process.exit(2);
  }

  // --- La coda si legge COME LA LEGGE LA CABINA (AR-569) ---
  //
  // Qui c'era un parser fatto in casa che riconosceva solo le righe-tabella a 8 colonne. La coda
  // però ha due formati, e da mesi le card nuove sono blocchi `###`. Contate a mano l'11/8: 49 a
  // blocchi contro 18 righe-tabella. Questo guardiano diceva «In attesa della tua firma: 5 · ✅ Coda
  // sotto controllo» mentre nel Pannello Nicola ne vedeva 57. È il numero che serve a capire se è
  // LUI il collo di bottiglia, e il verde spegneva proprio l'allarme che doveva suonare.
  //
  // La cura non è aggiungere un secondo parser: è smettere di averne uno. `coda-cabina.mjs` carica
  // il lettore vero del Pannello (331 righe di regole su cosa è un'azione e cosa è documentazione)
  // e lo esegue. Due copie divergono al primo lotto — una regola, una casa (AR-344).
  const letta = await azioniDellaCoda(CODA);
  if (letta.cieco) {
    // ⚪ non è un verde e non è un rosso: se non ho potuto contare, non stampo un numero.
    const out = { ok: true, cieco: true, quando: quandoStr, motivo: letta.cieco };
    console.log(JSON_MODE ? JSON.stringify(out) : `⚪ Guardiano del Tuo Tempo — non ho potuto contare la coda: ${letta.cieco}`);
    process.exit(2);
  }
  const righe = letta.azioni.map((a) => ({
    num: a.numero || "",
    data: a.data,
    reparto: a.reparto,
    azione: a.azione,
    colore: coloreRiga(a.colore || ""),
    stato: aspettaLaFirma(a) ? "in_attesa" : classificaStato(a.stato || ""),
    quando: parseData(a.data),
  }));

  const inAttesa = righe.filter((r) => r.stato === "in_attesa");
  const armate = righe.filter((r) => r.stato === "armata");
  const chiuse = righe.filter((r) => r.stato === "chiusa");

  // Età di ogni firma in attesa (giorni), dalla più vecchia.
  const conEta = inAttesa
    .map((r) => ({ ...r, eta_gg: r.quando ? gg(now - r.quando) : null }))
    .sort((a, b) => (b.eta_gg ?? -1) - (a.eta_gg ?? -1));

  const rosse = inAttesa.filter((r) => r.colore === "🔴").length;
  const gialle = inAttesa.filter((r) => r.colore === "🟡").length;
  const piuVecchia = conEta[0] || null;
  const etaValide = conEta.map((r) => r.eta_gg).filter((v) => v != null);
  const etaMedia = etaValide.length
    ? Math.round(etaValide.reduce((a, b) => a + b, 0) / etaValide.length)
    : null;

  // --- Ritmo: decisioni registrate in DECISIONI negli ultimi 7 giorni ---
  // Onestà: /nicola/ conta le righe che lo CITANO (richiesta o firma), non solo le firme vere —
  // quindi l'etichetta è "ti coinvolgono", non "firmate da te", per non gonfiare il numero.
  let decisioni7gg = 0;
  let coinvolgonoNicola7gg = 0;
  if (existsSync(DECISIONI)) {
    for (const line of readFileSync(DECISIONI, "utf8").split("\n")) {
      const m = line.match(/^-\s*(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2})/);
      if (!m) continue;
      const d = parseData(m[1]);
      if (!d || gg(now - d) > 7 || d > now) continue;
      decisioni7gg++;
      if (/nicola/i.test(line)) coinvolgonoNicola7gg++;
    }
  }

  const { stallo, settimaneArretrato, troppeInCoda, ok } = verdettoCoda({
    etaPiuVecchiaGg: piuVecchia?.eta_gg ?? 0,
    inAttesa: inAttesa.length,
    ritmoSettimanale: coinvolgonoNicola7gg,
  });
  const out = {
    // Il verdetto arriva da `verdettoCoda` e NON si ricalcola qui: due lettori della stessa regola
    // divergono al primo che cambia, ed è la malattia che questo repo paga più spesso.
    ok,
    quando: quandoStr,
    fonte: "AZIONI-IN-ATTESA.md + DECISIONI.md (conteggio deterministico, nessun numero inventato)",
    coda_firma_nicola: {
      totale_in_attesa: inAttesa.length,
      rosse,
      gialle,
      piu_vecchia_gg: piuVecchia?.eta_gg ?? null,
      piu_vecchia_azione: piuVecchia ? `${piuVecchia.num ? `#${piuVecchia.num} · ` : ""}${piuVecchia.azione}` : null,
      eta_media_gg: etaMedia,
    },
    armate_gated: armate.length, // pronte ma in attesa di una condizione (scala/business), non di te
    chiuse_in_coda: chiuse.length,
    ultimi_7_giorni: { decisioni_registrate: decisioni7gg, ti_coinvolgono: coinvolgonoNicola7gg },
    soglia_stallo_gg: SOGLIA_STALLO_GG,
    stallo,
    // Quanto arretrato è la coda, misurato col ritmo reale di Nicola (non con una soglia inventata).
    settimane_di_arretrato: settimaneArretrato,
    soglia_settimane: SETTIMANE_MAX,
    troppe_in_coda: troppeInCoda,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  }

  console.log(`⏱️  Guardiano del Tuo Tempo — ${quandoStr}`);
  console.log(`   (carico di firma di Nicola, contato dai dati reali)\n`);
  console.log(`   In attesa della tua firma:  ${inAttesa.length}   (🔴 ${rosse} · 🟡 ${gialle})`);
  if (piuVecchia) {
    console.log(`   La più vecchia aspetta da:  ${piuVecchia.eta_gg} giorni`);
    console.log(`      → ${piuVecchia.colore} #${piuVecchia.num} · ${piuVecchia.azione.slice(0, 80)}`);
  }
  if (etaMedia != null) console.log(`   Attesa media della coda:    ${etaMedia} giorni`);
  console.log(`   Armate ma in attesa di una condizione (non di te): ${armate.length}`);
  console.log(`   Già chiuse (storico in coda): ${chiuse.length}`);
  console.log(`   Ultimi 7 giorni: ${decisioni7gg} decisioni nel diario, ${coinvolgonoNicola7gg} ti coinvolgono`);
  console.log("");
  if (settimaneArretrato != null) {
    console.log(`   Al tuo ritmo di questi giorni (${ritmoSettimanale} a settimana), la coda è ${settimaneArretrato} settimane di arretrato.\n`);
  } else {
    console.log(`   ⚪ Non posso dire quanto arretrato sia: nel diario non risulta nessuna decisione tua negli ultimi 7 giorni.\n`);
  }
  if (stallo) {
    console.log(`   🔴 COLLO DI BOTTIGLIA: una firma aspetta da ${piuVecchia.eta_gg} giorni (soglia ${SOGLIA_STALLO_GG}).`);
    console.log(`      Sei tu il vincolo: la macchina ha già fatto la sua parte, aspetta te.`);
  } else if (troppeInCoda) {
    console.log(`   🔴 COLLO DI BOTTIGLIA: ${inAttesa.length} firme in coda sono ${settimaneArretrato} settimane del tuo ritmo (soglia ${SETTIMANE_MAX}).`);
    console.log(`      Nessuna singola card è ferma da troppo, ma insieme sono più di quanto riesci a smaltire.`);
  } else {
    console.log(`   ✅ Coda sotto controllo: nessuna firma ferma oltre ${SOGLIA_STALLO_GG} giorni, e l'arretrato sta dentro il tuo ritmo.`);
  }
  process.exit(out.ok ? 0 : 1);
}

// Parte SOLO se lanciato come programma: importarlo per usarne una funzione non deve farlo girare
// (malattia `programma-che-parte-importando`, AR-445). La prima versione di questa riga era
// `main().catch(...)` senza guardia: importarlo eseguiva tutto — e siccome la forma non era più il
// `main();` nudo che il rilevatore cerca, la malattia era diventata INVISIBILE invece che curata.
// L'ha presa la spazzata dei fratelli, contando 70 dove il tetto ne diceva 71.
//
// Il `.catch` resta e serve: `main` è asincrona (carica il lettore della Cabina), e una promise
// rifiutata uscirebbe 0 in certe versioni di Node — cioè un verde su un guardiano esploso.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`⚪ Guardiano del Tuo Tempo — non ho potuto misurare: ${e?.message || e}`);
    process.exit(2);
  });
}
