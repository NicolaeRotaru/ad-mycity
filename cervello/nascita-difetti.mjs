#!/usr/bin/env node
// 🧬 NASCITA DEI DIFETTI (AR-459) — «l'ho creato io» e «l'ho appena scoperto» devono essere due cose
// diverse, e contabili.
//
// PERCHÉ ESISTE. Nicola, 30/7: «ogni volta che ti chiedo di ricontrollare il lavoro trovi problemi
// che tu stesso hai creato risolvendo i difetti». È una domanda che ha una risposta numerica —
// quanti difetti nascono da un mio fix? — e quel numero non esisteva. Il cantiere aveva `origine`:
// prosa libera che dice DOVE è stato trovato («auto-radiografia 27/7», «trovato lavorando al lotto
// 6»), preziosa da leggere e impossibile da contare. Dentro quella prosa la risposta a volte c'era
// già — «se lo è inflitto da sola riparando», «una violazione che avevo appena commesso io» — ma
// sepolta in una frase, quindi invisibile a chiunque chieda «sto migliorando?».
//
// Finché non si conta, quella domanda resta un'impressione contro un'altra, e l'unico misuratore è
// il proprietario. Che è esattamente il lavoro che non deve fare lui.
//
// COSA AGGIUNGE. Tre campi accanto a `nato` (la data), senza toccare `origine` (che resta la prosa):
//   · `nato_come` — `scoperta` (c'era prima, l'ho appena visto) · `regressione` (l'ha introdotta un
//     mio fix) · `nuovo-lavoro` (nato da codice appena scritto, non da una riparazione)
//   · `nato_da`   — OBBLIGATORIO se `regressione`: il difetto/lotto/PR che l'ha causato. Una
//     regressione senza il suo autore è una confessione senza reato: non permette di risalire.
//     AMMESSO anche sulle `scoperta`, e lì porta l'altra metà della risposta: un difetto trovato
//     *verificando un fix precedente* (AR-347, AR-352: «dichiarato chiuso ma vivo») non è una
//     regressione — quel guasto c'era già — ma è comunque un costo della riparazione, ed è il modo
//     in cui il conto dei chiusi mente. Due numeri diversi, due cure diverse: la regressione si
//     previene con un freno sul delta, la chiusura incompleta con un metro scritto prima del fix.
//   · nient'altro. Un campo in più di quelli che servono diventa un campo che nessuno compila.
//
// COME È TARATO. Il debito storico si DICHIARA per NOME in `cervello/nascita-baseline.json`, e il
// guardiano fallisce quando compare un nome NUOVO senza `nato_come`. Per nome e non per conteggio:
// a parità di numero «uno compilato + uno nuovo vuoto» è un peggioramento travestito da pareggio —
// è la regola di `stampo-metro.mjs`, pagata una volta e non da ripagare.
//
// Un cancello che partisse rosso su 154 schede verrebbe spento entro la settimana. Questo parte
// verde e si accorge del primo che sporca.
//
// Uso:
//   node cervello/nascita-difetti.mjs             # guardiano: i nuovi hanno la loro nascita?
//   node cervello/nascita-difetti.mjs --conta     # il numero che interessa a Nicola, per lotto
//   node cervello/nascita-difetti.mjs --json
//   node cervello/nascita-difetti.mjs --aggiorna-baseline   # dopo aver compilato: il tetto scende
//
// Uscita (contratto guardiani, AR-322):
//   0 = ogni difetto nuovo dichiara come è nato
//   1 = un difetto nuovo non lo dichiara, o dice `regressione` senza dire da cosa
//   2 = non ho potuto misurare (cantiere illeggibile) — «cieco» NON è verde
//
// 🟢 Sola lettura, tranne `--aggiorna-baseline` che scrive solo il proprio file dei tetti.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const CANTIERE = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const BASELINE = join(QUI, "nascita-baseline.json");

/** I tre modi in cui un difetto può nascere. Tre e non di più: una scala che nessuno sa applicare
 *  produce campi compilati a caso, che è peggio di un campo vuoto — un campo vuoto almeno si vede. */
export const NASCITE = ["scoperta", "regressione", "nuovo-lavoro"];

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — funzione pura: una prova la esegue su un cantiere finto invece che su quello di oggi.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Array<object>} difetti     il cantiere da controllare
 * @param {string[]} esentati         gli ID del debito storico dichiarato (baseline)
 * @returns {{violazioni:Array<object>, scoperti:number, regressioni:Array<object>, nuovoLavoro:number, senzaNascita:string[]}}
 */
export function verificaNascite(difetti = [], esentati = []) {
  const esenti = new Set(esentati);
  const violazioni = [];
  const regressioni = [];
  const chiusureIncomplete = [];
  const senzaNascita = [];
  let scoperti = 0;
  let nuovoLavoro = 0;

  for (const d of difetti) {
    const n = d.nato_come;

    if (!n) {
      senzaNascita.push(d.id);
      // Il debito dichiarato si conta e si vede, ma non blocca: è il tetto che scende.
      if (!esenti.has(d.id)) {
        violazioni.push({
          id: d.id,
          regola: "nascita-mancante",
          motivo: "difetto nuovo senza `nato_come`: non si può sapere se l'ho creato io o l'ho appena scoperto",
          rimedio: `aggiungi "nato_come": "${NASCITE.join('" | "')}"`,
        });
      }
      continue;
    }

    if (!NASCITE.includes(n)) {
      // Un valore inventato NON è coperto dalla baseline: la baseline esenta chi non ha ancora
      // compilato, non chi ha compilato a modo suo. Altrimenti basterebbe scrivere qualsiasi cosa
      // per uscire dal conteggio — la porta che AR-338 ha già trovato aperta due volte.
      violazioni.push({
        id: d.id,
        regola: "nascita-inventata",
        motivo: `"${n}" non è una nascita: i valori sono ${NASCITE.join(", ")}`,
        rimedio: "usa uno dei tre, o lascia il campo vuoto e dichiara il debito",
      });
      continue;
    }

    if (n === "regressione") {
      if (!d.nato_da || !String(d.nato_da).trim()) {
        violazioni.push({
          id: d.id,
          regola: "regressione-senza-autore",
          motivo: "dice di essere una regressione ma non dice da cosa: non permette di risalire al fix che l'ha introdotta",
          rimedio: 'aggiungi "nato_da": "AR-xxx" oppure "lotto 33" oppure "PR #637"',
        });
        continue;
      }
      regressioni.push({ id: d.id, da: String(d.nato_da), titolo: d.titolo || "" });
    } else if (n === "scoperta") {
      scoperti++;
      // Una scoperta che nomina un fix precedente è l'altra metà del costo di riparare: quel fix
      // aveva lasciato qualcosa. Non è una regressione, e contarla come tale gonfierebbe il numero
      // che deve restare credibile — ma tacerla lo sgonfierebbe, ed è la metà che fa mentire il
      // conto dei difetti chiusi.
      if (d.nato_da && String(d.nato_da).trim()) {
        chiusureIncomplete.push({ id: d.id, da: String(d.nato_da), titolo: d.titolo || "" });
      }
    } else nuovoLavoro++;
  }

  return { violazioni, scoperti, regressioni, chiusureIncomplete, nuovoLavoro, senzaNascita };
}

/** Le regressioni raggruppate per autore: è la riga che risponde a «sto peggiorando riparando?». */
export function perAutore(regressioni = []) {
  const m = new Map();
  for (const r of regressioni) m.set(r.da, [...(m.get(r.da) || []), r.id]);
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O
// ─────────────────────────────────────────────────────────────────────────────

function leggi(p, quandoManca) {
  if (!existsSync(p)) return quandoManca;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");

  const cantiere = leggi(CANTIERE, null);
  if (!cantiere || !Array.isArray(cantiere.difetti)) {
    console.error("🧬 NASCITA CIECA — cantiere-difetti.json illeggibile o senza difetti: non ho misurato niente.");
    process.exit(2);
  }
  const base = leggi(BASELINE, { senza_nascita: [] });
  if (base === null) {
    console.error("🧬 NASCITA CIECA — nascita-baseline.json illeggibile: non so quale debito è dichiarato.");
    process.exit(2);
  }

  const esito = verificaNascite(cantiere.difetti, base.senza_nascita || []);

  if (argv.includes("--aggiorna-baseline")) {
    // Il tetto SCENDE e non risale: si scrive solo l'intersezione fra il vecchio elenco e chi è
    // ancora vuoto oggi. Chi è stato compilato esce e non può rientrare.
    const vecchi = new Set(base.senza_nascita || []);
    const ancoraVuoti = esito.senzaNascita.filter((id) => vecchi.has(id));
    base.senza_nascita = ancoraVuoti;
    base.aggiornato = new Date().toISOString().slice(0, 10);
    writeFileSync(BASELINE, JSON.stringify(base, null, 2) + "\n");
    console.log(`🧬 baseline: da ${vecchi.size} a ${ancoraVuoti.length} schede senza nascita dichiarata.`);
    process.exit(0);
  }

  const autori = perAutore(esito.regressioni);

  if (json) {
    console.log(JSON.stringify({ ...esito, per_autore: autori }, null, 2));
    process.exit(esito.violazioni.length ? 1 : 0);
  }

  if (argv.includes("--conta")) {
    console.log("\n🧬 COME NASCONO I DIFETTI DI QUESTA MACCHINA\n");
    const noti = esito.scoperti + esito.regressioni.length + esito.nuovoLavoro;
    console.log(`  🔍 scoperte      ${String(esito.scoperti).padStart(4)}   c'erano già, le ho viste`);
    console.log(`  ♻️  regressioni   ${String(esito.regressioni.length).padStart(4)}   le ho create io riparando`);
    console.log(`  🆕 nuovo lavoro  ${String(esito.nuovoLavoro).padStart(4)}   nate da codice appena scritto`);
    console.log(`  ⚪ non dichiarate ${String(esito.senzaNascita.length).padStart(3)}   debito storico (tetto che scende)`);
    console.log(
      `\n  di cui 🧹 ${esito.chiusureIncomplete.length} scoperte trovate verificando un fix precedente ` +
        "— non regressioni, ma è il modo in cui il conto dei chiusi mente",
    );
    if (noti) {
      const costo = esito.regressioni.length + esito.chiusureIncomplete.length;
      const pct = Math.round((100 * esito.regressioni.length) / noti);
      const pctCosto = Math.round((100 * costo) / noti);
      console.log(`\n  → su ${noti} difetti con la nascita dichiarata, ${pct}% me li sono inflitti riparando,`);
      console.log(`    ${pctCosto}% contando anche le riparazioni lasciate a metà.`);
      console.log("    È il numero della domanda di Nicola del 30/7. Deve scendere.");
      // Onestà obbligatoria finché il debito è grande: questa percentuale è un PAVIMENTO, non la
      // verità. Le 161 schede non dichiarate sono per la maggior parte nate dentro i lotti di
      // riparazione — cioè esattamente dove una regressione si nasconderebbe — mentre quelle
      // riempite in automatico vengono dalle radiografie, che per mestiere trovano e non rompono.
      // Un numero basso ottenuto contando solo la metà favorevole è «un buco travestito da buona
      // notizia»: la malattia che questo cantiere censisce, commessa dal proprio metro.
      if (esito.senzaNascita.length > noti * 0.2) {
        console.log(
          `\n  ⚠️  ma è un PAVIMENTO, non la verità: ${esito.senzaNascita.length} schede non dichiarano ancora,` +
            "\n     e sono in gran parte quelle nate DENTRO i lotti di riparazione — dove una regressione si" +
            "\n     nasconderebbe. Le dichiarate vengono soprattutto dalle radiografie, che trovano e non rompono." +
            "\n     La percentuale diventa vera man mano che il tetto scende; da oggi è vera per ogni difetto NUOVO.",
        );
      }
    }
    if (autori.length) {
      console.log("\n  Chi le ha generate:");
      for (const [da, ids] of autori.slice(0, 10)) console.log(`    ${String(ids.length).padStart(3)} · ${da}  (${ids.slice(0, 5).join(", ")}${ids.length > 5 ? "…" : ""})`);
    }
    console.log("");
    process.exit(0);
  }

  if (esito.violazioni.length) {
    console.log("\n🧬 NASCITA DEI DIFETTI\n");
    for (const v of esito.violazioni.slice(0, 20)) {
      console.log(`  ❌ ${v.id} — ${v.regola}`);
      console.log(`     ${v.motivo}`);
      console.log(`     → ${v.rimedio}\n`);
    }
    if (esito.violazioni.length > 20) console.log(`  …e altre ${esito.violazioni.length - 20}.\n`);
    console.log(`❌ ${esito.violazioni.length} difetto/i non dicono come sono nati.`);
    console.log("   Senza quel campo la domanda «i fix stanno creando più problemi di quanti ne chiudono?»");
    console.log("   non ha una risposta: resta un'impressione, e l'unico misuratore torna a essere Nicola.");
    process.exit(1);
  }

  const noti = esito.scoperti + esito.regressioni.length + esito.nuovoLavoro;
  console.log(
    `✅ ogni difetto nuovo dichiara come è nato — ${noti} dichiarati ` +
      `(${esito.regressioni.length} regressioni), ${esito.senzaNascita.length} di debito storico sotto il tetto.`,
  );
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
