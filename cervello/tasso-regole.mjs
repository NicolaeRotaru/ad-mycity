#!/usr/bin/env node
// 📐 QUANTE CORREZIONI DI NICOLA SONO DIVENTATE UNA REGOLA. 🟢 Sola lettura: non scrive niente.
//
// PERCHÉ ESISTE — e perché sostituisce la vecchia voce 1 della pagella.
//
// La voce 1 si chiamava «Applica le lezioni che scrive» e valeva 18%, ferma da settimane. Ma il
// codice che la calcolava (`tasso-lezioni.mjs`) misura un'altra cosa. La riga decisiva è una sola:
//
//     if (lez.id && blob.includes(lez.id)) return true;
//
// cioè: una lezione conta come «applicata» se la sua SIGLA (`L-2026-0724-527`) compare in un
// documento degli ultimi 30 giorni. Non se ha cambiato un comportamento: se qualcuno l'ha citata.
// Per arrivare alla soglia del 70% servirebbero 331 sigle citate in un mese — undici al giorno,
// tutti i giorni. È un rituale di cancelleria, e non produce niente.
//
// Misurato il 25/7 prima di decidere (le ipotesi sbagliate le ho scartate misurandole, non
// ragionandoci):
//   · allineare le finestre temporali dei due lati del rapporto → 17% invece di 18%: irrilevante,
//     perché 469 lezioni su 473 sono nate negli ultimi 30 giorni. Non c'è coda di roba vecchia.
//   · deduplicare → 473 testi, 473 distinti. Non ci sono doppioni.
//   · le correzioni di Nicola vengono applicate il DOPPIO di quelle che la macchina si scrive da
//     sola (22% contro 11%): il segnale buono c'è, ma il tetto resta la definizione.
//
// LA DOMANDA GIUSTA ce l'aveva già scritta la macchina addosso. L'aggancio di sessione la stampa a
// ogni avvio: «⛔ Errori che si RIPETONO … ripetuto 32× in 18 lezioni e mai reso un gate». Il
// fallimento vero non è «non cito le lezioni»: è «le correzioni di Nicola non diventano regole».
// Al 25/7: 204 lezioni nate da una sua correzione non sono ancora una regola.
//
// Questa misura chiede quello. Ed è PIÙ SEVERA di quella che sostituisce: vale 12% dove la vecchia
// diceva 18%. Era la condizione per proporla — cambiare il metro con cui si è misurati è
// legittimo solo se il metro nuovo non è più comodo. La firma resta di Nicola: il merge della PR.
//
// ⚠️ MA NON BASTA, e sotto ci sono i numeri che lo dimostrano: vedi ricadute(), conGate() e
// qualitaDenominatore().
//
// Non si può gonfiare scrivendo più lezioni: le lezioni nuove finiscono nel DENOMINATORE. L'unico
// modo di alzarla è chiudere alla radice ciò che Nicola ha già corretto.
//
// Uso:
//   node cervello/tasso-regole.mjs           -> report leggibile
//   node cervello/tasso-regole.mjs --json    -> JSON (per la pagella)
// Env: TASSO_REGOLE_GIORNI (default 30) = finestra sulle correzioni da considerare.
// Exit: sempre 0 — è una misura, non un cancello. Il verdetto lo dà la pagella.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { lezioniSpente } from "./misura-parziale.mjs";

const JSON_MODE = process.argv.includes("--json");
const GIORNI = Number(process.env.TASSO_REGOLE_GIORNI || 30);
const APPR = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

/** Giorni trascorsi da una data scritta in qualunque forma che contenga AAAA-MM-GG. */
export function giorniFa(testo, adesso = Date.now()) {
  const m = String(testo || "").match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return Infinity;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  return isNaN(d.getTime()) ? Infinity : Math.floor((adesso - d.getTime()) / 86400000);
}

/**
 * Una correzione è CHIUSA quando è diventata una regola permanente: promossa a principio,
 * cristallizzata in un file operativo, o già marcata `stato: "principio"`.
 * Tre campi e non uno perché la promozione è passata da forme diverse nel tempo, e una misura che
 * ne guarda una sola direbbe «non chiusa» su lavoro che invece è stato fatto.
 */
export function diventataRegola(lez) {
  if (!lez) return false;
  return Boolean(lez.promosso_il || lez.cristallizzato_in || lez.stato === "principio");
}

/**
 * Le lezioni che contano: nate da una correzione di Nicola, vive, dentro la finestra.
 *
 * 26/8 — «viva» qui era scritto a mano come `stato !== "decaduta"`, e dal 20/8 esiste anche
 * `ritirata`, che vuol dire «l'ho ritirata di proposito». Cioè una lezione nata da una correzione di
 * Nicola e poi ritirata continuava a contare nel tasso che dice quanto la macchina applica le sue
 * correzioni: il numero saliva su una regola che qualcuno aveva tolto. Adesso passa dalla porta.
 */
export function correzioniDiNicola(lezioni = [], giorni = GIORNI, adesso = Date.now()) {
  const spente = new Set(lezioniSpente({ lezioni }));
  return lezioni.filter((l) => l && l.caso_studio_nicola && !spente.has(l) && giorniFa(l.nato, adesso) <= giorni);
}

/** Il conto. Puro: il test lo prova senza toccare il disco. */
export function misura(lezioni = [], giorni = GIORNI, adesso = Date.now()) {
  const dentro = correzioniDiNicola(lezioni, giorni, adesso);
  const chiuse = dentro.filter(diventataRegola);
  const aperte = dentro.filter((l) => !diventataRegola(l));
  return {
    correzioni: dentro.length,
    diventate_regola: chiuse.length,
    tasso: dentro.length ? Math.round((chiuse.length / dentro.length) * 100) / 100 : 0,
    misurabile: dentro.length > 0,
    // Se in 30 giorni Nicola non ha dovuto correggere NIENTE, quello è l'obiettivo raggiunto, non
    // un buco nei dati. La prima versione di questa misura lo trattava come «cieco → non ok», cioè
    // teneva la voce rossa proprio quando la macchina aveva smesso di sbagliare: una metrica che
    // punisce il successo. Distinguere serve: `silenzio` = niente da correggere (bene),
    // `senza_dati` = non ci sono lezioni affatto (il tubo è rotto, e va detto).
    silenzio: dentro.length === 0 && lezioni.length > 0,
    senza_dati: lezioni.length === 0,
    aperte_ids: aperte.map((l) => l.id),
    qualita: qualitaDenominatore(dentro),
  };
}

/**
 * QUANTO CI SI PUÒ FIDARE DEL DENOMINATORE.
 *
 * `caso_studio_nicola` lo scrive la MACCHINA, istruita dalla prosa dei suoi stessi mansionari
 * («crea la lezione con caso_studio_nicola=true — vale doppio», metabolizza.md / giro.md).
 * Al 25/7 le 277 «correzioni di Nicola» in 30 giorni fanno 15 al giorno, con picchi di 84 in una
 * giornata sola (13/7), 49 e 43 in altre due: non sono correzioni ricevute da una persona, sono
 * osservazioni retrospettive generate in blocco durante le radiografie.
 *
 * Non le filtro: TUTTE dichiarano `fonte: "chat"`, comprese le 84 dello stesso giorno, quindi nei
 * dati non esiste il segnale per separarle e qualunque filtro sarebbe una supposizione travestita
 * da misura. Quello che si può fare onestamente è NON presentare il numero come pulito quando non
 * lo è: qui si misura la concentrazione, e chi legge decide quanto fidarsi.
 *
 * Si risolve a monte, e serve una scelta di Nicola: chi crea una lezione deve registrare DA DOVE
 * viene la correzione (un turno di chat vero vs un'auto-osservazione), non un flag booleano che
 * la macchina si assegna da sola.
 */
export function qualitaDenominatore(correzioni = []) {
  if (!correzioni.length) return { giorni: 0, max_in_un_giorno: 0, concentrazione: 0, sospetto: false };
  const perGiorno = {};
  for (const l of correzioni) {
    const g = String(l.nato || "").slice(0, 10) || "?";
    perGiorno[g] = (perGiorno[g] || 0) + 1;
  }
  const conteggi = Object.values(perGiorno);
  const max = Math.max(...conteggi);
  const concentrazione = Math.round((max / correzioni.length) * 100) / 100;
  return {
    giorni: conteggi.length,
    max_in_un_giorno: max,
    concentrazione,
    // Una persona non corregge venti volte in un giorno: oltre quella soglia è quasi certamente
    // un blocco generato dalla macchina, e il numero va letto come tendenza, non come livello.
    sospetto: max >= 20,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// I DUE NUMERI CHE DICONO LA VERITÀ PIÙ DI QUELLO SOPRA (misurati il 25/7, dopo che Nicola ha
// chiesto «l'hai risolto del tutto?»). Rispondere era no, e il motivo sta qui.
//
// `diventataRegola()` si fida di `promosso_il` / `cristallizzato_in`. Chi li scrive? Lo script
// `cristallizza-apprendimento.mjs`, in automatico dentro il giro, promuovendo le lezioni con
// `confidenza ≥ 0.8` ed `evidenze ≥ 3` — due campi che la macchina scrive sul PROPRIO lavoro.
// Le 277 correzioni hanno confidenza fra 0.85 e 1.00: quel filtro non filtra niente.
// E tutte e 55 le lezioni «cristallizzate» puntano allo stesso posto: `memoria-persistente`,
// cioè testo iniettato nel prompt. NESSUNA è legata a un controllo che può fallire.
//
// La parola giusta la macchina se la stampa addosso da sola a ogni avvio di sessione:
// «ripetuto 32× in 18 lezioni e mai reso un GATE». Non «mai citata», non «mai promossa».

const TAG_GENERICI = new Set(["nicola", "caso-studio", "correzione", "lezione", "ad"]);
const SOGLIA_CRONICO = 3; // un tema è cronico dopo che Nicola c'è già tornato 3 volte

/**
 * RICADUTE: quante correzioni cadono su un tema CRONICO, cioè già corretto ≥3 volte prima.
 *
 * È il numero più onesto che si possa costruire qui, perché non dipende da nessun campo che la
 * macchina si autoassegna: scende solo se Nicola smette davvero di ripetersi.
 *
 * Perché «cronico» e non «già visto almeno una volta»: quella versione dava 97%, ma era gonfiata
 * dal metodo — ogni lezione porta più tag e basta che uno sia comune (`pannello` compare 124 volte)
 * perché scatti. Misurata sul tema cronico: 84%. Verificato prima di crederci.
 *
 * L'ordine conta: si guarda cosa era già cronico PRIMA di quella correzione, non dopo.
 */
export function ricadute(lezioni = [], giorni = GIORNI, adesso = Date.now()) {
  const ordinate = correzioniDiNicola(lezioni, giorni, adesso)
    .slice()
    .sort((a, b) => String(a.nato || "").localeCompare(String(b.nato || "")));
  const visti = {};
  let croniche = 0;
  for (const l of ordinate) {
    const tag = (Array.isArray(l.tag) ? l.tag : []).filter((t) => !TAG_GENERICI.has(t));
    if (tag.some((t) => (visti[t] || 0) >= SOGLIA_CRONICO)) croniche++;
    for (const t of tag) visti[t] = (visti[t] || 0) + 1;
  }
  const cronici = Object.entries(visti).filter(([, n]) => n >= SOGLIA_CRONICO);
  return {
    correzioni: ordinate.length,
    su_tema_cronico: croniche,
    quota: ordinate.length ? Math.round((croniche / ordinate.length) * 100) / 100 : 0,
    temi_cronici: cronici.length,
    temi_totali: Object.keys(visti).length,
  };
}

/**
 * GATE: quante correzioni sono legate a un controllo che può FALLIRE.
 *
 * Una lezione lo dichiara col campo `gate` (es. "node cervello/permessi-check.mjs"): stessa forma
 * delle prove a comando del cantiere, quelle che stanotte hanno chiuso AR-142 e AR-156 da sole.
 * Un principio iniettato nel prompt è un promemoria; un gate è un impedimento.
 *
 * Al 25/7 vale 0 su 277 — e va detto così com'è: in `cervello/` ci sono dodici guardiani veri, e
 * nessuna lezione è agganciata a uno di loro. È il vuoto che questa misura serve a rendere visibile.
 */
export function conGate(lezioni = [], giorni = GIORNI, adesso = Date.now()) {
  const dentro = correzioniDiNicola(lezioni, giorni, adesso);
  const legate = dentro.filter((l) => typeof l.gate === "string" && l.gate.trim());
  return {
    correzioni: dentro.length,
    con_gate: legate.length,
    quota: dentro.length ? Math.round((legate.length / dentro.length) * 100) / 100 : 0,
  };
}

/** I temi che tornano più spesso fra le correzioni ANCORA senza regola: da lì si comincia. */
export function temiAperti(lezioni = [], giorni = GIORNI, adesso = Date.now(), quanti = 6) {
  const conta = {};
  for (const l of correzioniDiNicola(lezioni, giorni, adesso)) {
    if (diventataRegola(l)) continue;
    for (const t of Array.isArray(l.tag) ? l.tag : []) conta[t] = (conta[t] || 0) + 1;
  }
  return Object.entries(conta)
    .sort((a, b) => b[1] - a[1])
    .slice(0, quanti)
    .map(([tag, volte]) => ({ tag, volte }));
}

// ⚠️ NIENTE `process.exit()` qui dentro, e non è pignoleria: misurato il 25/7. Quando lo stdout è
// una PIPE — ed è sempre una pipe, la pagella legge questo script con spawnSync — `process.exit()`
// subito dopo un `console.log` CHIUDE il processo prima che Node abbia svuotato il buffer, e
// l'output viene troncato a 65536 byte esatti. Riproduttore: un payload da 100.000 byte ne
// consegna 65.536. Oggi il JSON pesa 6,5 KB (10% del buffer) quindi non succede — ma `aperte_ids`
// cresce con le correzioni aperte, e il giorno che si supera il tetto la pagella riceverebbe un
// JSON tagliato a metà: parse fallito, voce 1 «non misurabile». Un guasto silenzioso che sembra
// una misura. Si esce restituendo il controllo: Node svuota lo stdout e chiude da solo.
function main() {
  const quando = nowPiacenza();
  if (!existsSync(APPR)) {
    const msg = `apprendimento.json non trovato: ${APPR}`;
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: msg }));
    else console.error("❌ " + msg);
    return;
  }
  let appr = null;
  try {
    appr = JSON.parse(readFileSync(APPR, "utf8"));
  } catch (e) {
    const msg = `apprendimento.json illeggibile: ${e.message}`;
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: msg }));
    else console.error("❌ " + msg);
    return;
  }

  const lezioni = Array.isArray(appr.lezioni) ? appr.lezioni : [];
  const m = misura(lezioni, GIORNI);
  const temi = temiAperti(lezioni, GIORNI);
  const ric = ricadute(lezioni, GIORNI);
  const gate = conGate(lezioni, GIORNI);

  if (JSON_MODE) {
    console.log(
      JSON.stringify({ ok: true, quando, finestra_giorni: GIORNI, ...m, ricadute: ric, gate, temi_aperti: temi }, null, 2),
    );
    return;
  }

  console.log(`\n📐 CORREZIONI DI NICOLA DIVENTATE REGOLA — ${quando}\n`);
  if (m.senza_dati) {
    console.log(`  ⚠️ Nessuna lezione in apprendimento.json: non è silenzio, è un tubo rotto.`);
    return;
  }
  if (m.silenzio) {
    console.log(`  ✅ Nessuna correzione negli ultimi ${GIORNI} giorni: è l'obiettivo, non un buco.`);
    return;
  }
  console.log(`  ${m.diventate_regola} su ${m.correzioni} = ${Math.round(m.tasso * 100)}%   (ultimi ${GIORNI} giorni)`);
  console.log(`  restano aperte: ${m.aperte_ids.length}`);
  console.log(`\n  Ma «promossa a principio» vuol dire iniettata nel prompt, non impedita. I due numeri veri:`);
  console.log(
    `    ricadute su un tema CRONICO (già corretto ≥${SOGLIA_CRONICO} volte):  ${ric.su_tema_cronico}/${ric.correzioni} = ${Math.round(ric.quota * 100)}%` +
      `   [${ric.temi_cronici} temi cronici su ${ric.temi_totali}]`,
  );
  console.log(
    `    correzioni legate a un GATE che può fallire:                  ${gate.con_gate}/${gate.correzioni} = ${Math.round(gate.quota * 100)}%`,
  );
  if (m.qualita.sospetto) {
    console.log(
      `\n  ⚠️ DENOMINATORE POCO AFFIDABILE: ${m.qualita.max_in_un_giorno} «correzioni» in un solo giorno ` +
        `(${Math.round(m.qualita.concentrazione * 100)}% del totale, su ${m.qualita.giorni} giorni).`,
    );
    console.log(`     Nessuna persona corregge così: sono osservazioni generate in blocco e marcate`);
    console.log(`     come correzioni di Nicola. Leggi il numero come TENDENZA, non come livello.`);
  }
  if (temi.length) {
    console.log(`\n  I temi che tornano e non sono ancora una regola:`);
    for (const t of temi) console.log(`    ${String(t.volte).padStart(3)}×  ${t.tag}`);
  }
  console.log(`\n  Si alza in un modo solo: prendere una correzione e chiuderla alla radice`);
  console.log(`  (principio + gate automatico), non scrivendo altre lezioni — quelle finiscono nel denominatore.`);
  return;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
