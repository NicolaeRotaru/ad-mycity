#!/usr/bin/env node
// 🧠 LA MEMORIA DELLA GUARDIA (AR-528) — quello che il sorvegliante trova non sopravvive alla sessione.
//
// PERCHÉ ESISTE. Il sorvegliante tiene un registro di tutto ciò che mi dice: quante volte, su quale
// file, e se l'ho sistemato. Quel registro vive in `_tmp_sorvegliante-battito.json`, fuori da git —
// scelta giusta (verificare non deve costare un diff, AR-464) con una conseguenza che nessuno aveva
// guardato: **muore con la copia**. Una sessione cloud nasce da un clone fresco, quindi nasce senza
// memoria di cosa la guardia aveva già trovato. Il file di salute lo dice già a chiare lettere —
// «da una sessione nuova non lo posso vedere» — e lo diceva come limite, non come difetto.
//
// L'effetto composto: la stessa voce grave può comparire venti volte in venti sessioni e restare, per
// tutti, la prima volta. Il contatore delle ripetizioni (AR-497) funziona DENTRO una sessione e si
// azzera fuori. Quindi la guardia non impara mai niente da sé stessa, e io non so quale malattia
// introduco più spesso — che è l'unica domanda da cui si capisce se sto migliorando.
//
// TRE MOMENTI, un mestiere solo: portare quello che la guardia sa oltre i confini in cui muore.
//
//   · `--apri`     (SessionStart) — cosa la sessione precedente ha lasciato aperto. È la prima cosa
//                  che leggo in una copia nuova, e senza sarebbe la sola cosa che nessuno mi dice.
//   · `--consegna` (PreCompact)   — quando il contesto sta per essere compresso, scrive cosa stavo
//                  facendo. Non è un doppione dell'intento: quello dice per COSA sono partito, questo
//                  dice a che punto ero. Lo rilegge l'apertura del turno dopo.
//   · `--chiudi`   (SessionEnd)   — archivia il battito nello storico VERSIONATO, che è l'unico posto
//                  da cui può sopravvivere a questa macchina.
//
// PERCHÉ LO STORICO È VERSIONATO, cioè perché qui rompo la regola del `_tmp_`. Quella regola dice che
// VERIFICARE non deve costare un diff, ed è giusta: una misura che sporca l'albero viene spenta. Ma
// questo non è verificare, è RICORDARE — e un ricordo che vive solo in un file temporaneo di un
// container che verrà buttato non è un ricordo, è un rumore. La distinzione è vera e la scrivo qui
// perché fra sei mesi sembrerà un'incoerenza: il battito resta fuori da git (è lo stato del turno),
// lo storico ci entra (è la memoria dell'azienda). Costo dichiarato: una riga di diff a fine sessione.
//
// COSA NON FA. Non giudica, non blocca niente, non riapre difetti. Tiene un conto e lo fa
// sopravvivere. E non pretende di essere completo: se una sessione muore male (container ucciso) il
// suo `SessionEnd` non scatta e quella sessione non entra nello storico. Un buco dichiarato, non un
// numero gonfiato — nel riassunto la voce si chiama «sessioni archiviate», mai «tutte le sessioni».
//
// Uso:
//   node cervello/memoria-guardia.mjs --apri --hook       # SessionStart
//   node cervello/memoria-guardia.mjs --consegna --hook   # PreCompact
//   node cervello/memoria-guardia.mjs --chiudi --hook     # SessionEnd
//   node cervello/memoria-guardia.mjs                     # cosa c'è nello storico
//
// Uscita: 0 sempre in forma hook · fuori: 0 = ho letto · 2 = non ho potuto misurare
//
// 🟡 Scrive DUE file: la consegna di contesto (fuori da git) e lo storico della guardia, che è
//    versionato e sta nella cartella della memoria AI — cioè casa mia (regola del vault).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BATTITO, gravi } from "./sorvegliante.mjs";
import { INTENTO, CONSEGNA } from "./intento-turno.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);

/** La memoria lunga della guardia. Versionata: vedi il perché in testa. */
export const STORICO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json";

/** Quante sessioni tengo. Oltre, il file cresce per sempre e nessuno lo apre più: una memoria che
 *  non si può leggere è un archivio, e questa deve restare una memoria. */
export const MAX_SESSIONI = 200;

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — puro.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Il riassunto di una sessione, dal suo battito.
 *
 * «mai risolte» = voci ancora vive all'ultimo scatto. È la parte che conta: le altre le ho sistemate
 * mentre lavoravo, e contarle come debito punirebbe proprio il comportamento giusto.
 */
export function riassuntoSessione(battito = null, quando = "") {
  if (!battito || typeof battito !== "object") return null;
  const viste = battito.viste || {};
  const scatto = Number(battito.scatto) || 0;
  const perClasse = {};
  const maiRisolte = [];
  for (const [chiave, v] of Object.entries(viste)) {
    const classe = chiave.split("|")[0] || "?";
    perClasse[classe] = (perClasse[classe] || 0) + 1;
    if (Number(v.scatto) === scatto && v.gravita === "grave") {
      maiRisolte.push({ classe, file: v.file, cosa: v.cosa, ripetuta: Number(v.n) || 1 });
    }
  }
  return {
    quando: quando || null,
    scatti: scatto,
    voci: Object.keys(viste).length,
    per_classe: perClasse,
    mai_risolte: maiRisolte,
  };
}

/** Lo storico aggiornato, potato in coda. Puro: la potatura è una decisione, e le decisioni si provano. */
export function aggiungiAlloStorico(storico = {}, sessione = null, max = MAX_SESSIONI) {
  const sessioni = Array.isArray(storico.sessioni) ? storico.sessioni : [];
  if (!sessione) return { ...storico, sessioni };
  const tutte = [...sessioni, sessione];
  return { ...storico, sessioni: tutte.slice(-max) };
}

/**
 * Cosa dire all'inizio di una sessione nuova.
 *
 * Tace se non c'è niente di grave rimasto: aprire ogni sessione con un riepilogo che dice «tutto a
 * posto» è il rumore che spegne i freni, e all'avvio è il rumore più costoso di tutti.
 */
export function bustaApertura(storico = {}, quante = 3) {
  const sessioni = Array.isArray(storico.sessioni) ? storico.sessioni : [];
  const ultima = sessioni[sessioni.length - 1];
  if (!ultima || !Array.isArray(ultima.mai_risolte) || !ultima.mai_risolte.length) return null;
  const righe = ultima.mai_risolte.slice(0, quante).map((v) => `❌ ${v.classe} · ${v.file} → ${v.cosa}${v.ripetuta > 1 ? `  ⟲ ripetuta ${v.ripetuta} volte` : ""}`);
  if (ultima.mai_risolte.length > quante) righe.push(`   …e altre ${ultima.mai_risolte.length - quante}`);
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: [
        `🧠 LA SESSIONE PRECEDENTE (${ultima.quando || "data ignota"}) HA LASCIATO ${ultima.mai_risolte.length} voce/i grave/i mai chiuse:`,
        ...righe,
        "   ↳ non sono ripartite da zero perché ho cambiato macchina: o le riparo, o le dichiaro esenti col perché scritto.",
      ].join("\n"),
    },
  });
}

/** La consegna di contesto: cosa stavo facendo prima che il contesto venisse compresso. */
export function consegnaDiContesto({ intento = null, battito = null, file = [] } = {}) {
  const viste = battito?.viste || {};
  const scatto = Number(battito?.scatto) || 0;
  const vive = Object.entries(viste)
    .filter(([, v]) => Number(v.scatto) === scatto && v.gravita === "grave")
    .map(([, v]) => ({ file: v.file, cosa: v.cosa }));
  return {
    quando: new Date().toISOString(),
    intento: intento?.intento || null,
    file: file.slice(0, 20),
    vive,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O
// ─────────────────────────────────────────────────────────────────────────────

function leggiJson(percorso) {
  try {
    return JSON.parse(readFileSync(join(REPO, percorso), "utf8"));
  } catch {
    return null;
  }
}

/**
 * Scrive. Torna `null` se è andata, il motivo se non è andata.
 *
 * Il motivo torna indietro e non muore nel `catch`: un archivio che non si scrive e non lo dice è
 * la malattia `fonte-troncata-letta-per-intera` nella sua forma più cattiva — il file dello storico
 * resterebbe quello di ieri, con la faccia di uno aggiornato. (Presa dalla spazzata dei fratelli su
 * queste righe, mentre le scrivevo.)
 */
function scrivi(percorso, dati, indenta = false) {
  try {
    const abs = join(REPO, percorso);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, indenta ? `${JSON.stringify(dati, null, 2)}\n` : JSON.stringify(dati));
    return null;
  } catch (e) {
    return `${percorso}: ${String(e.message).split("\n")[0]}`;
  }
}

function main() {
  const argv = process.argv.slice(2);
  const hook = argv.includes("--hook");

  if (argv.includes("--chiudi")) {
    const b = leggiJson(BATTITO);
    const sessione = riassuntoSessione(b, new Date().toISOString());
    if (!sessione) {
      // Nessun battito: in questa copia la guardia non ha mai scattato. Non è una sessione da
      // archiviare, ed è diverso da «sessione senza voci»: quella la scriverei.
      if (!hook) console.log("⚪ nessun battito in questa copia: non c'è niente da archiviare.");
      process.exit(hook ? 0 : 2);
    }
    const storico = leggiJson(STORICO) || {
      _cosa_e: "La memoria lunga del sorvegliante: una riga per sessione archiviata, con le voci che sono rimaste aperte. Il battito vive fuori da git e muore con la copia; questo no.",
      sessioni: [],
    };
    const nuovo = aggiungiAlloStorico({ ...storico, aggiornato: new Date().toISOString() }, sessione);
    const guasto = scrivi(STORICO, nuovo, true);
    if (guasto) {
      // Uscita 2, anche da hook: «non ho archiviato» non è «ho archiviato niente». A SessionEnd
      // nessuno legge il codice, ma un 0 qui sarebbe una bugia scritta apposta per fare bella figura.
      console.error(`⚪ non ho potuto archiviare la sessione — ${guasto}. Lo storico resta quello di prima, con la faccia di uno aggiornato.`);
      process.exit(2);
    }
    if (!hook) console.log(`🧠 sessione archiviata: ${sessione.voci} voci, ${sessione.mai_risolte.length} rimaste aperte.`);
    process.exit(0);
  }

  if (argv.includes("--consegna")) {
    const b = leggiJson(BATTITO);
    const file = Object.values(b?.viste || {})
      .map((v) => v.file)
      .filter(Boolean);
    scrivi(CONSEGNA, consegnaDiContesto({ intento: leggiJson(INTENTO), battito: b, file: [...new Set(file)] }));
    if (!hook) console.log("🧭 consegna di contesto scritta.");
    process.exit(0);
  }

  if (argv.includes("--apri")) {
    const busta = bustaApertura(leggiJson(STORICO) || {});
    if (hook) {
      if (busta) console.log(busta);
      process.exit(0);
    }
    console.log(busta ? JSON.parse(busta).hookSpecificOutput.additionalContext : "✅ la sessione precedente non ha lasciato voci gravi aperte.");
    process.exit(0);
  }

  const s = leggiJson(STORICO);
  if (!s) {
    console.log("⚪ nessuno storico della guardia: non è mai stata archiviata una sessione qui.");
    process.exit(2);
  }
  const sessioni = s.sessioni || [];
  console.log(`🧠 MEMORIA DELLA GUARDIA — ${sessioni.length} sessioni archiviate (non tutte: una sessione uccisa non passa da qui)`);
  const classi = {};
  for (const x of sessioni) for (const [k, n] of Object.entries(x.per_classe || {})) classi[k] = (classi[k] || 0) + n;
  for (const [k, n] of Object.entries(classi).sort((a, b) => b[1] - a[1])) console.log(`   ${String(n).padStart(4)} × ${k}`);
  const aperte = sessioni.reduce((t, x) => t + (x.mai_risolte?.length || 0), 0);
  console.log(`   ${aperte} voci gravi lasciate aperte in totale.`);
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
