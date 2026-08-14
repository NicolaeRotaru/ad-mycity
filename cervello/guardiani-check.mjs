#!/usr/bin/env node
// 🛡️ GUARDIANO DEI GUARDIANI — tiene in bacheca l'elenco vero di chi sorveglia la macchina.
//
// Nicola (29/7): «voglio avere un'idea chiara di quello che fanno e poi inseriscili dentro bacheca
// della home e tienila sempre aggiornata».
//
// Le due metà di «sempre aggiornata», e perché una sola basta a rompere tutto:
//   · **il cablaggio** (chi gira, chi ferma il giro, quale vincolo produce) → si MISURA da giro.sh
//     a ogni passaggio, quindi non può invecchiare;
//   · **cosa controlla, detto a voce** → si scrive a mano in `censimento-guardiani.mjs`, perché
//     nessun parser sa spiegare perché un controllo esiste. Questa metà PUÒ invecchiare, ed è la
//     ragione per cui il guardiano esce 1 quando un nome nuovo compare senza descrizione: la
//     descrizione si scrive nel giro in cui il guardiano nasce, non «poi».
//
// La data del blocco si muove solo se cambia il CONTENUTO. Il Pannello ordina la bacheca per data
// più recente: una riscrittura a ogni giro terrebbe questo blocco eternamente in cima, sopra il
// registro dei fatti, e produrrebbe un commit ogni due ore che non dice niente.
//
// 🟢 Sola lettura sul codice; scrive solo MyCity-Vault/90-Memoria-AI/BACHECA.md (memoria dell'AD).
// Uso: node cervello/guardiani-check.mjs [--bacheca] [--json]
// Exit (AR-322): 0 = elenco e codice combaciano · 1 = descrizione mancante o di troppo · 2 = cieco

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DESCRIZIONI,
  EFFETTI,
  TITOLO_BACHECA,
  bloccoBacheca,
  censimento,
  codiceUscita,
  corpoDi,
  sostituisciBlocco,
} from "./censimento-guardiani.mjs";
import { nowPiacenza } from "./git-github.mjs";
import { scriviTestoAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.AD_REPO || join(QUI, "..");
const GIRO = join(REPO, "cervello/giro.sh");
const CANCELLO = join(REPO, "cervello/gate-pubblicazione.sh");
const BACHECA = join(REPO, "MyCity-Vault/90-Memoria-AI/BACHECA.md");

const JSON_MODE = process.argv.includes("--json");
const SCRIVI = process.argv.includes("--bacheca");

/** Cosa questo guardiano NON prova, detto prima che qualcuno ci si appoggi troppo. */
const COSA_NON_PROVA =
  "Non prova che i guardiani FUNZIONINO: prova che l'elenco in bacheca combaci con quelli che giro.sh esegue davvero, e che ognuno abbia una descrizione. Un guardiano cablato bene e descritto bene ma che misura la cosa sbagliata, qui risulta sano.";

/**
 * Riscrive il blocco solo se il contenuto è cambiato. Torna cosa è successo, senza decidere da solo
 * che «nessuna modifica» sia un problema: quasi sempre è la risposta giusta.
 */
export function aggiornaBacheca(bacheca, blocco, { titolo = TITOLO_BACHECA } = {}) {
  const righe = bacheca.split("\n");
  const i = righe.findIndex((r) => r.startsWith(`## ${titolo} ·`));
  if (i >= 0) {
    let fine = righe.length;
    for (let j = i + 1; j < righe.length; j++) if (/^##\s+\S/.test(righe[j])) { fine = j; break; }
    const attuale = corpoDi(righe.slice(i, fine).join("\n"));
    if (attuale === corpoDi(blocco)) return { cambiato: false, testo: bacheca };
  }
  return { cambiato: true, testo: sostituisciBlocco(bacheca, blocco, titolo) };
}

function main() {
  if (!existsSync(GIRO)) {
    console.error(`⚠️  GUARDIANO CIECO: manca ${GIRO} — non posso sapere chi gira.`);
    process.exit(2);
  }
  const testoGiro = readFileSync(GIRO, "utf8");
  // Il cancello di pubblicazione è un file a parte: senza, tre guardiani di verità (segreti, fatti,
  // sanità del vault) risulterebbero «avvisano e basta» mentre bloccano davvero il push.
  const testoGate = existsSync(CANCELLO) ? readFileSync(CANCELLO, "utf8") : "";
  const cens = censimento(testoGiro, { descrizioni: DESCRIZIONI, testoGate });
  if (!cens.totale) {
    console.error("⚠️  GUARDIANO CIECO: nessun guardiano trovato in giro.sh — è cambiata la forma delle chiamate?");
    process.exit(2);
  }
  const rc = codiceUscita(cens);

  let scritto = null;
  if (SCRIVI) {
    if (!existsSync(BACHECA)) {
      console.error(`⚠️  GUARDIANO CIECO: manca ${BACHECA} — non ho dove appuntare l'elenco.`);
      process.exit(2);
    }
    // AR-378 — SI SCRIVE SEMPRE, anche quando il censimento è rosso.
    //
    // Prima si scriveva solo col verde, per non lasciare in bacheca una casella vuota al posto del
    // «cosa fa». Il rimedio era peggiore del male: senza riscrittura restava la foto di ieri, con la
    // data di ieri, che prometteva più protezione di quella che c'era — e un buco che non si vede non
    // lo sistema nessuno. Ora il blocco porta in cima la riga «TABELLA INCOMPLETA» coi nomi, quindi
    // la bacheca non può più essere vecchia E sembrare fresca. Il rosso resta rosso: `rc` non cambia.
    const esito = aggiornaBacheca(readFileSync(BACHECA, "utf8"), bloccoBacheca(cens, nowPiacenza()));
    if (esito.cambiato) scriviTestoAtomico(BACHECA, esito.testo);
    scritto = esito.cambiato;
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({ ok: rc === 0, _cosa_NON_prova: COSA_NON_PROVA, aggiornato: nowPiacenza(), bacheca_riscritta: scritto, ...cens }, null, 2));
    process.exit(rc);
  }

  console.log(`🛡️  Guardiani della macchina — ${cens.totale} girano a ogni giro, ${cens.fermano} possono fermarlo\n`);
  for (const g of cens.elenco) {
    const eti = g.mano ? "📲" : g.effetti.includes("ferma") ? "⛔" : g.effetti.includes("non-contato") ? "⚠️ " : "ℹ️ ";
    console.log(`   ${eti} ${g.nome.padEnd(26)} ${g.cosa ? g.cosa.slice(0, 88) : "❓ SENZA DESCRIZIONE"}`);
  }
  if (cens.nonContati.length) {
    console.log(`\n   ⚠️  ${cens.nonContati.length} scrivono un allarme che il giro NON conta: ${cens.nonContati.join(", ")}`);
    console.log(`      ${EFFETTI["non-contato"].replace(/\*\*/g, "")} — il giro può uscire pulito con questi rossi.`);
  }
  if (cens.senzaDescrizione.length) {
    console.log(`\n   ❓ ${cens.senzaDescrizione.length} senza descrizione: ${cens.senzaDescrizione.join(", ")}`);
    console.log("      Scrivi cosa controllano in cervello/censimento-guardiani.mjs (DESCRIZIONI) — in questo giro, non dopo.");
  }
  if (cens.fantasmi.length) {
    console.log(`\n   👻 ${cens.fantasmi.length} descritti ma non più nel giro: ${cens.fantasmi.join(", ")}`);
    console.log("      O li ricabli in giro.sh, o togli la descrizione: la bacheca non deve promettere una protezione che non c'è.");
  }
  if (scritto === true) console.log(`\n   📌 Bacheca aggiornata: ${BACHECA}`);
  else if (scritto === false) console.log("\n   📌 Bacheca già allineata — nessuna riscrittura (la data si muove solo se cambia qualcosa).");
  if (rc === 0 && !cens.fantasmi.length) console.log("\n   ✅ L'elenco in bacheca combacia con quello che gira davvero.");
  process.exit(rc);
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) main();
