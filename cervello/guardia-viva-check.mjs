#!/usr/bin/env node
// 🧭 GUARDIANO DELLA GUARDIA — chi è costruito e non lo mette di guardia nessuno.
//
// Il difetto, misurato il 29/7 (AR-376, AR-393): `permessi-check.mjs` esce 1 con quattro violazioni
// vere — due permessi col jolly su una cartella che la macchina stessa può scrivere, il divieto di
// push diretto mancante, uno strumento che scrive su un sistema esterno concesso senza chiedere — e
// **nessun processo ricorrente lo esegue**. `non-vacuita.mjs`, il controllo nato apposta per
// smascherare le prove verdi-perché-cieche, compariva in tutto il repo solo dentro un messaggio
// («rompi il fix e pretendi il rosso: node cervello/non-vacuita.mjs»): un cartello, non un freno.
//
// Perché nessuno se n'era accorto: la bacheca dei guardiani (`censimento-guardiani.mjs`) elenca chi
// `giro.sh` esegue. Chi non è cablato da nessuna parte è invisibile per costruzione — l'elenco
// misura i cablati, quindi un guardiano mai cablato non può comparirci nemmeno come buco.
//
// Qui si misura lo scarto: **guardiani che ESISTONO** (derivati dal codice) contro **guardiani
// ESEGUITI** (derivati dagli invocatori veri), e la differenza deve essere dichiarata col perché in
// `cervello/guardiani-motivi.json`. Un guardiano non cablato senza motivo scritto è un buco, non
// uno stato — la stessa regola dei sensori spenti (AR-105/AR-108), applicata agli strumenti.
//
// In più il verdetto morto (AR-394): una variabile passata al verdetto di un cancello e mai
// riempita. Il cancello di pubblicazione ne ha una — `rc_one`, l'onestà — ed è dichiarata come
// debito col suo perché: toglierla richiede di toccare `gate-pubblicazione.sh`.
//
// 🟢 Sola lettura: legge il codice, non scrive niente e non tocca il mondo.
//
// Uso:
//   node cervello/guardia-viva-check.mjs            -> rapporto
//   node cervello/guardia-viva-check.mjs --json     -> JSON
//
// Exit (AR-322): 0 = ogni guardiano è di guardia o dice perché no · 1 = c'è un buco · 2 = cieco

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  codiceUscita,
  debitoDiGuardia,
  eGuardiano,
  fantasmi,
  invocazioniIn,
  invocazioniNegliHook,
  usiIn,
  mortiNonDichiarati,
  senzaGuardia,
  tettoSforato,
  verdettiMorti,
} from "./guardia-viva.mjs";
import { comandiDichiarati } from "./hooks-check.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.AD_REPO || join(QUI, "..");
const JSON_MODE = process.argv.includes("--json");

const REGISTRO = process.env.GUARDIANI_MOTIVI_FILE || join(REPO, "cervello/guardiani-motivi.json");
const CANCELLO = join(REPO, "cervello/gate-pubblicazione.sh");

/**
 * Dove NON si cerca chi esegue. Sono le cartelle di memoria e di consegna: lì un nome di script
 * compare dentro una frase scritta per Nicola, mai dentro un comando che gira. Includerle
 * significherebbe dichiarare «di guardia» un guardiano perché un briefing lo ha nominato — che è
 * la forma esatta del difetto (il cartello scambiato per freno).
 */
const FUORI = new Set([
  "node_modules", ".git", ".next", "dist", "build",
  "MyCity-Vault", "consegne", "creativi", "memoria-squadra", "marketplace", "auto-coscienza",
  // `.claude/worktrees/<agent>/` sono checkout completi del repo creati per isolare il lavoro di un
  // agente in parallelo: contengono una SECONDA copia di ogni file di `cervello/`, test compresi. Senza
  // questa esclusione un file dentro `.claude/worktrees/x/cervello/test/y.test.mjs` non inizia per
  // "cervello/test/" (il percorso relativo parte da `.claude/`), quindi il rilevatore lo tratta come un
  // invocatore VERO — un test annidato che dichiara di guardia un guardiano solo perché esiste due volte.
  "worktrees",
]);

/** Estensioni che possono contenere un'esecuzione. */
const ESEGUIBILI = /\.(sh|mjs|js|ts|yml|yaml|bats|service|timer|json)$/;

function elenca(dir, dentro = []) {
  let voci;
  try {
    voci = readdirSync(dir, { withFileTypes: true });
  } catch {
    return dentro;
  }
  for (const v of voci) {
    if (FUORI.has(v.name)) continue;
    const p = join(dir, v.name);
    if (v.isDirectory()) elenca(p, dentro);
    else if (v.isFile() && ESEGUIBILI.test(v.name)) dentro.push(p);
  }
  return dentro;
}

function main() {
  const cartellaGuardiani = join(REPO, "cervello");
  if (!existsSync(cartellaGuardiani)) {
    console.error("⚠️  GUARDIANO CIECO: manca la cartella cervello/ — non so chi giudicare.");
    process.exit(2);
  }

  // ① CHI ESISTE — derivato dal codice, mai da un elenco scritto a mano.
  const guardiani = [];
  for (const f of readdirSync(cartellaGuardiani)) {
    if (!f.endsWith(".mjs")) continue;
    const p = join(cartellaGuardiani, f);
    try {
      if (!statSync(p).isFile()) continue;
      if (eGuardiano(readFileSync(p, "utf8"))) guardiani.push(f);
    } catch {
      /* un file illeggibile lo segnala già il resto della macchina */
    }
  }
  if (!guardiani.length) {
    console.error("⚠️  GUARDIANO CIECO: nessun guardiano riconosciuto in cervello/ — è cambiata la forma dei file?");
    process.exit(2);
  }

  // ② CHI LI ESEGUE — derivato dagli invocatori veri (shell, workflow, timer, node).
  //
  // I test stanno FUORI da `invocati` di proposito. `permessi-check.mjs` è il caso che lo insegna:
  // `cervello/test/uscite-verso-il-mondo.test.mjs` lo esegue davvero — per verificare che non
  // scriva niente. Contarlo come «di guardia» avrebbe dichiarato protetto il perimetro dei permessi
  // sulla base di un test che dei permessi non guarda nemmeno il verdetto. Un test mette di guardia
  // solo quando qualcuno lo dichiara e lo nomina, e allora si controlla che quel file lo invochi.
  const invocati = new Set();
  const perStrumento = new Map();
  for (const p of elenca(REPO)) {
    let testo;
    try {
      testo = readFileSync(p, "utf8");
    } catch {
      continue;
    }
    const rel = relative(REPO, p);
    const eTest = rel.startsWith("cervello/test/");
    for (const nome of invocazioniIn(testo)) if (!eTest) invocati.add(nome);
    // `perStrumento` è più largo di `invocati`: serve a VERIFICARE una dichiarazione che nomina il
    // posto, e lì vale anche l'import della funzione di decisione. Vedi `usiIn` in guardia-viva.mjs.
    for (const nome of usiIn(testo)) {
      if (!perStrumento.has(nome)) perStrumento.set(nome, []);
      perStrumento.get(nome).push(rel);
    }
  }

  // ②b CHI LO ESEGUE A OGNI EVENTO — gli hook (AR-529). Un comando dentro `hooks` non è un testo
  //     che nomina uno strumento: è la posizione da cui Claude Code lo lancia, e lo lancia più
  //     spesso di qualunque timer. I comandi li estrae chi sa leggere quel file, non un secondo
  //     lettore scritto qui (due lettori della stessa struttura divergono: AR-500).
  try {
    const dati = JSON.parse(readFileSync(join(REPO, ".claude/settings.json"), "utf8"));
    for (const nome of invocazioniNegliHook(comandiDichiarati(dati?.hooks || {}))) invocati.add(nome);
  } catch {
    // Nessun settings.json leggibile: i freni agganciati non li posso contare. Non è un motivo per
    // dichiararli orfani con sicurezza, ma nemmeno per assolverli — restano come li vede il resto.
  }

  // ③ LA DIFFERENZA, dichiarata o no.
  let registro = {};
  if (existsSync(REGISTRO)) {
    try {
      registro = JSON.parse(readFileSync(REGISTRO, "utf8"));
    } catch (e) {
      console.error(`⚠️  GUARDIANO CIECO: ${REGISTRO} illeggibile (${e.message}).`);
      process.exit(2);
    }
  } else {
    console.error(`⚠️  GUARDIANO CIECO: manca ${REGISTRO} — senza i motivi dichiarati non so cosa giudicare.`);
    process.exit(2);
  }
  const motivi = registro.motivi || {};
  const buchi = senzaGuardia(guardiani, invocati, motivi, perStrumento);
  const orfaniRegistro = fantasmi(guardiani, motivi, invocati);
  const debito = debitoDiGuardia(guardiani, invocati, motivi, perStrumento);
  const tetto = tettoSforato(debito, registro.tetto_da_cablare);

  // ④ IL VERDETTO MORTO nel cancello di pubblicazione (AR-394).
  let morti = [];
  let cancelloCieco = false;
  if (existsSync(CANCELLO)) {
    morti = verdettiMorti(readFileSync(CANCELLO, "utf8"));
  } else {
    cancelloCieco = true;
  }
  const mortiAperti = mortiNonDichiarati(morti, registro.verdetti_morti_dichiarati || {});

  const rc = codiceUscita({
    cieco: cancelloCieco ? 1 : 0,
    buchi: buchi.length,
    fantasmi: orfaniRegistro.length,
    morti: mortiAperti.length,
    sforato: tetto.sforato,
  });

  const rapporto = {
    ok: rc === 0,
    guardiani: guardiani.length,
    eseguiti: guardiani.filter((g) => invocati.has(g)).length,
    senza_guardia: buchi,
    debito_da_cablare: debito,
    tetto,
    voci_fantasma: orfaniRegistro,
    verdetti_morti: morti,
    verdetti_morti_non_dichiarati: mortiAperti,
    dove: Object.fromEntries([...perStrumento].filter(([n]) => guardiani.includes(n))),
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(rapporto, null, 2));
    process.exit(rc);
  }

  console.log(`🧭 Guardia viva — ${rapporto.eseguiti}/${guardiani.length} guardiani sono eseguiti da qualcuno\n`);
  if (buchi.length) {
    console.log(`   🕳️  ${buchi.length} costruiti e mai messi di guardia:`);
    for (const b of buchi) console.log(`      · ${b.strumento} — ${b.perche}`);
    console.log("\n   Cablali in un processo ricorrente, oppure dichiara il perché in cervello/guardiani-motivi.json");
  } else {
    console.log("   ✅ ogni guardiano è eseguito da qualcuno, o dice perché no.");
  }
  if (tetto.sforato) {
    console.log(`\n   ⛔ ${tetto.quanti} strumenti dichiarati «da-cablare» contro un tetto di ${tetto.tetto}: il debito si è allargato.`);
    console.log(`      ${debito.join(", ")}`);
  } else if (debito.length) {
    console.log(`\n   ⏳ ${debito.length}/${tetto.tetto} debito dichiarato (buchi ammessi, sotto il tetto): ${debito.join(", ")}`);
    if (debito.length < tetto.tetto) console.log("      Il tetto scende: portalo a questo numero in cervello/guardiani-motivi.json.");
  }
  if (orfaniRegistro.length) {
    console.log(`\n   👻 ${orfaniRegistro.length} voci del registro parlano di strumenti che non esistono più: ${orfaniRegistro.join(", ")}`);
  }
  if (mortiAperti.length) {
    console.log(`\n   💀 ${mortiAperti.length} verdetti morti nel cancello di pubblicazione:`);
    for (const m of mortiAperti) console.log(`      · ${m.variabile} passata a ${m.funzione}() alla riga ${m.riga} e mai riempita`);
  } else if (morti.length) {
    console.log(`\n   ⚠️  ${morti.length} verdetto/i morto/i, dichiarato/i come debito col suo perché: ${morti.map((m) => m.variabile).join(", ")}`);
  }
  process.exit(rc);
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) main();
