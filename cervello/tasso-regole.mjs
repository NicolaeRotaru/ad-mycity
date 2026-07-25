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
// Perché una regola conta e una citazione no: un principio entra nel contesto di OGNI sessione
// (SessionStart → contesto-lezioni.mjs). È davanti alla macchina nel momento in cui decide. Una
// sigla in un file .md non lo è.
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

/** Le lezioni che contano: nate da una correzione di Nicola, vive, dentro la finestra. */
export function correzioniDiNicola(lezioni = [], giorni = GIORNI, adesso = Date.now()) {
  return lezioni.filter(
    (l) => l && l.caso_studio_nicola && l.stato !== "decaduta" && giorniFa(l.nato, adesso) <= giorni,
  );
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
    // Quando non c'è NIENTE da misurare il tasso è 0 ma non significa «va male»: significa
    // «nessuna correzione in finestra». Chi legge deve poterlo distinguere.
    misurabile: dentro.length > 0,
    aperte_ids: aperte.map((l) => l.id),
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

function main() {
  const quando = nowPiacenza();
  if (!existsSync(APPR)) {
    const msg = `apprendimento.json non trovato: ${APPR}`;
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: msg }));
    else console.error("❌ " + msg);
    process.exit(0);
  }
  let appr = null;
  try {
    appr = JSON.parse(readFileSync(APPR, "utf8"));
  } catch (e) {
    const msg = `apprendimento.json illeggibile: ${e.message}`;
    if (JSON_MODE) console.log(JSON.stringify({ ok: false, errore: msg }));
    else console.error("❌ " + msg);
    process.exit(0);
  }

  const lezioni = Array.isArray(appr.lezioni) ? appr.lezioni : [];
  const m = misura(lezioni, GIORNI);
  const temi = temiAperti(lezioni, GIORNI);

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: true, quando, finestra_giorni: GIORNI, ...m, temi_aperti: temi }, null, 2));
    process.exit(0);
  }

  console.log(`\n📐 CORREZIONI DI NICOLA DIVENTATE REGOLA — ${quando}\n`);
  if (!m.misurabile) {
    console.log(`  Nessuna correzione negli ultimi ${GIORNI} giorni: niente da misurare.`);
    process.exit(0);
  }
  console.log(`  ${m.diventate_regola} su ${m.correzioni} = ${Math.round(m.tasso * 100)}%   (ultimi ${GIORNI} giorni)`);
  console.log(`  restano aperte: ${m.aperte_ids.length}`);
  if (temi.length) {
    console.log(`\n  I temi che tornano e non sono ancora una regola:`);
    for (const t of temi) console.log(`    ${String(t.volte).padStart(3)}×  ${t.tag}`);
  }
  console.log(`\n  Si alza in un modo solo: prendere una correzione e chiuderla alla radice`);
  console.log(`  (principio + gate automatico), non scrivendo altre lezioni — quelle finiscono nel denominatore.`);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
