#!/usr/bin/env node
// 📮 IL CONTATORE DEI VERDETTI MUTI — AR-474.
//
// PERCHÉ ESISTE (Nicola, 31/7 e 2/8). L'abitudine ha una scheda (AR-474: «quando finisco, scrivo il
// verdetto dove è comodo per me, non dove lo legge Nicola») e adesso ha anche due freni che la
// fermano in avanti — il cancello dello Stop e il cancello del lotto. Ma nessuno dei due risponde
// alla domanda che decide se l'abitudine è curata o solo tamponata:
//
//     «quante volte, DI FATTO, ho consegnato un lavoro il cui esito non è arrivato dove Nicola legge?»
//
// Un freno impedisce il caso nuovo. Un contatore dice se il comportamento sta scomparendo o se sto
// solo trovando il modo di aggirarlo. Senza, «l'abitudine è curata» resta un'opinione mia — che è
// esattamente la specie di affermazione che questo cantiere ha smesso di accettare.
//
// COSA MISURA — due numeri, entrambi sulla stessa domanda:
//
//   ① CONSEGNE MUTE. Cammina la storia di `main` e per ogni consegna (un commit che tocca almeno un
//      file FUORI dalle quattro cartelle di memoria, cioè lavoro che qualcuno dovrà rileggere) chiede:
//      quel commit ha aggiunto una riga di esito con `atteso … → reale …` in un quaderno? Se no, è
//      una consegna muta.
//
//   ② LA CABINA FERMA. Da quanti giorni `STATO.md` — la schermata dove Nicola legge i numeri — è più
//      vecchia dell'ultima consegna. È lo stesso difetto visto dall'altro lato: non «non ho scritto
//      l'esito», ma «ho continuato a lavorare mentre la schermata che lui guarda dice ancora ieri».
//
// IL TETTO, non lo zero. Il debito storico è grande e un contatore che parte rosso viene spento al
// secondo giro. Quindi vale la regola già usata da `tetti-lotto.json`: il numero ha un tetto che
// SCENDE e non risale mai. Aggiungerne uno è un errore; portarne via è il lavoro.
//
// DOVE ATTERRA — controllato, non dato per scontato (un contatore dell'abitudine «scrivo dove non
// legge nessuno» messo dove nessuno legge sarebbe la prossima istanza di quello che conta):
//   · `auto-coscienza/verdetti-muti.json` — il referto con i numeri;
//   · la VISITA (`salute.mjs`, organo `cervello.esiti`) → finisce nel referto che Nicola legge quando
//     chiede «controlla se funziona tutto», in `consegne/salute/AAAA-MM-GG-*.md`;
//   · il CANCELLO DEL LOTTO → la CI lo esegue su ogni PR, e diventa rosso se il debito si allarga.
// Quello che NON fa: nessuna schermata della Cabina renderizza ancora questo numero (il campo
// `ultime` di salute.json non è servito da nessuna rotta del Pannello — verificato leggendolo).
// È AR-476, aperto e dichiarato.
//
// Uso:
//   node cervello/conta-verdetti-muti.mjs                 # verdetto leggibile
//   node cervello/conta-verdetti-muti.mjs --json          # per gli script
//   node cervello/conta-verdetti-muti.mjs --giorni 60     # finestra diversa (default 30)
//   node cervello/conta-verdetti-muti.mjs --aggiorna-tetto  # abbassa il tetto al valore di adesso
//
// Uscita (contratto guardiani, AR-322): 0 = sotto il tetto · 1 = il debito si è allargato · 2 = cieco
//
// 🟡 Scrive solo dentro la memoria dell'AI (auto-coscienza/), che è sua. Non tocca git.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scriviJsonAtomico } from "./scrivi-json.mjs";
import { CARTELLE_MEMORIA, CERCA_ESITO_IN_GIT } from "./cancello-stop.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const REFERTO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/verdetti-muti.json");
const STATO = "MyCity-Vault/90-Memoria-AI/STATO.md";

const JSON_MODE = process.argv.includes("--json");
const AGGIORNA = process.argv.includes("--aggiorna-tetto");
const GIORNI = Number(process.argv[process.argv.indexOf("--giorni") + 1]) || 30;

// ─────────────────────────────────────────────────────────────────────────────
// IL CUORE — puro. Riceve una storia già letta e la giudica.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Un commit è una CONSEGNA se tocca almeno un file fuori dalle cartelle di memoria — e a stabilirlo
 * è git, con un pathspec di esclusione, non io leggendo un elenco di percorsi.
 *
 * PERCHÉ COSÌ (AR-339, la porta — il guardiano mi ha ripreso qui per la terza volta oggi). La prima
 * stesura chiedeva `git log --name-only` e classificava i percorsi a mano. Con un nome accentato git
 * li restituisce citati in ottali fra virgolette: `"MyCity-Vault/…/Funzionalit\303\240/…"`. Quel
 * percorso non comincia più per `MyCity-Vault/`, quindi un commit di sola memoria sarebbe stato
 * contato come una consegna muta — il contatore dell'onestà che si gonfia da solo.
 *
 * Chiedendo direttamente a git «i commit che toccano qualcosa FUORI da queste quattro cartelle» il
 * problema non esiste: nessun percorso attraversa il confine, quindi nessuno può essere citato male.
 * L'elenco è derivato da `CARTELLE_MEMORIA` e non ricopiato: due elenchi che devono restare uguali
 * sono due elenchi che prima o poi divergono, e allora freno e contatore misurerebbero cose diverse
 * chiamandole con lo stesso nome.
 */
export const ESCLUDI_MEMORIA = CARTELLE_MEMORIA.map((c) => `:(exclude)${c.replace(/\/$/, "")}`);

/**
 * Il worker VPS non «consegna»: fa manutenzione.
 *
 * Misurato prima di scrivere questa riga, e senza sarebbe stato un numero inutile: sui 30 giorni le
 * consegne risultavano 644 — ma 367 erano commit del worker. Due specie: i «recupero: scritture
 * pendenti» e i «Merge branch 'main' of …», cioè il worker che riallinea la propria copia col remoto.
 * Guardati col diff verso il primo genitore, quei merge portano dentro il lavoro DI ALTRI — già
 * contato al suo posto. Tenerli dentro significava contare due volte, gonfiare il denominatore e
 * consegnare a Nicola un 94% che non misurava il comportamento di nessuno.
 *
 * Il segnale è l'autore, ed è strutturale, non un elenco di titoli da tenere aggiornato a mano: il
 * worker firma con la propria identità git perché è una macchina che gira da sola. Quello che esclude
 * viene DICHIARATO nel referto (`esclusi_worker`): un taglio silenzioso si legge come «ho guardato
 * tutto».
 */
export const AUTORE_WORKER = /^AD MyCity\b/;

/**
 * Il conto sulla finestra.
 *
 * `conEsito` è l'insieme degli hash che hanno AGGIUNTO una riga di esito vera: lo calcola git con una
 * ricerca sul contenuto del diff, non io rileggendo i file — così una riga cancellata e riscritta non
 * conta due volte e un quaderno toccato per un riordino non conta affatto.
 */
export function conta(candidate = [], conEsito = new Set()) {
  const consegne = candidate.filter((c) => !AUTORE_WORKER.test(c.autore || ""));
  const mute = consegne.filter((c) => !conEsito.has(c.hash));
  return {
    commit_esaminati: candidate.length,
    esclusi_worker: candidate.length - consegne.length,
    consegne: consegne.length,
    mute: mute.length,
    tasso: consegne.length ? Math.round((mute.length / consegne.length) * 100) : 0,
    ultime_mute: mute.slice(0, 8).map((c) => ({ hash: c.hash.slice(0, 9), quando: c.quando, titolo: c.titolo })),
  };
}

/**
 * Da quanti giorni la Cabina mostra numeri più vecchi dell'ultimo lavoro consegnato.
 *
 * Non «STATO.md è vecchio» in assoluto — se nessuno lavora, è giusto che stia fermo. Il difetto è la
 * FORBICE: ho consegnato lavoro dopo, e la schermata che lui guarda non lo sa.
 */
export function cabinaFerma(statoAggiornato, ultimaConsegna) {
  // La forma si controlla PRIMA di costruire la data, e non è pedanteria: trovato dalla prova, non
  // dalla rilettura. `new Date("boh:00Z")` non torna «non valida» — torna una data del secolo scorso,
  // e la forbice diventava 9710 giorni. Cioè un campo illeggibile produceva un allarme enorme invece
  // di un onesto «non l'ho potuto leggere»: un numero inventato con la faccia di una misura.
  const FORMA = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
  if (!FORMA.test(String(statoAggiornato)) || !FORMA.test(String(ultimaConsegna))) return null;
  const a = new Date(`${statoAggiornato.replace(" ", "T")}:00Z`);
  const b = new Date(`${ultimaConsegna.replace(" ", "T")}:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const giorni = Math.floor((b - a) / 86_400_000);
  return { stato_aggiornato: statoAggiornato, ultima_consegna: ultimaConsegna, giorni_indietro: Math.max(0, giorni) };
}

/** Il verdetto: cosa dire, e se il debito si è allargato. */
export function verdetto({ conto, cabina, tetti }) {
  const righe = [];
  let rotto = false;
  const tettoMute = tetti?.consegne_mute ?? conto.mute;
  if (conto.mute > tettoMute) {
    rotto = true;
    righe.push(`❌ ${conto.mute} consegne mute contro un tetto di ${tettoMute}: il debito si è allargato, non ridotto.`);
  } else if (conto.mute < tettoMute) {
    righe.push(`⬇️  consegne mute scese da ${tettoMute} a ${conto.mute}: abbassa il tetto con --aggiorna-tetto.`);
  }
  const tettoGiorni = tetti?.cabina_ferma_giorni ?? (cabina?.giorni_indietro || 0);
  if (cabina && cabina.giorni_indietro > tettoGiorni) {
    rotto = true;
    righe.push(
      `❌ la Cabina è ferma da ${cabina.giorni_indietro} giorni rispetto all'ultima consegna (tetto ${tettoGiorni}): STATO.md dice ${cabina.stato_aggiornato}, l'ultimo lavoro è del ${cabina.ultima_consegna}.`,
    );
  }
  return { righe, rotto };
}

// ─────────────────────────────────────────────────────────────────────────────
// LO STRATO I/O
// ─────────────────────────────────────────────────────────────────────────────

const git = (args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

const SEP = "@@COMMIT@@";

// `CERCA_ESITO_IN_GIT` vive in `cancello-stop.mjs` accanto a `RIGA_ESITO` e da lì si importa: sono
// due scritture della STESSA regola (git non capisce `\d`, `\b`, `\s`), e tenerle in due file
// diverse sarebbe la divergenza che una prova qui sotto difende. Riesportata perché le prove del
// contatore la usano: un solo posto dove cambia, un solo posto dove sbagliare.
export { CERCA_ESITO_IN_GIT };

/** La storia di `main` sulla finestra, un elemento per commit, coi file che ha toccato. */
export function leggiStoria(testo = "") {
  const fuori = [];
  for (const blocco of testo.split(SEP)) {
    const righe = blocco.split("\n").filter((r) => r.length);
    if (!righe.length) continue;
    const m = /^([0-9a-f]{7,40})\|([^|]*)\|(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\|(.*)$/.exec(righe[0]);
    if (!m) continue;
    fuori.push({ hash: m[1], autore: m[2], quando: m[3], titolo: m[4].slice(0, 70) });
  }
  return fuori;
}

function ramoDaGuardare() {
  for (const r of ["origin/main", "main"]) {
    try {
      git(["rev-parse", "--verify", "--quiet", r]);
      return r;
    } catch {
      /* provo il prossimo */
    }
  }
  return null;
}

function statoAggiornato() {
  try {
    const testo = readFileSync(join(REPO, STATO), "utf8").slice(0, 4000);
    const m = /^aggiornato:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/m.exec(testo);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function main() {
  const ramo = ramoDaGuardare();
  if (!ramo) {
    console.error("⚪ CIECO: né origin/main né main esistono qui — non posso contare niente. (cieco non è verde)");
    process.exit(2);
  }

  let storia, conEsito;
  try {
    // Niente `--name-only`: il confine lo traccia git col pathspec, e cosi nessun percorso puo
    // arrivarmi citato in ottali (AR-339). Quello che torna sono gia SOLO le consegne.
    storia = leggiStoria(
      git([
        "log",
        "--first-parent",
        "--diff-merges=first-parent",
        `--format=${SEP}%H|%an|%ad|%s`,
        "--date=format:%Y-%m-%d %H:%M",
        `--since=${GIORNI} days ago`,
        ramo,
        "--",
        ".",
        ...ESCLUDI_MEMORIA,
      ]),
    );
    // Gli hash che hanno davvero AGGIUNTO una riga di esito. La cerca git nel contenuto del diff:
    // se la cercassi io rileggendo i quaderni di oggi, misurerei lo stato finale invece di chi l'ha
    // scritto — e un commit che non ha lasciato niente risulterebbe a posto grazie al lavoro di un altro.
    conEsito = new Set(
      git(["log", "--first-parent", "--format=%H", `--since=${GIORNI} days ago`, "-G", CERCA_ESITO_IN_GIT, ramo, "--", "memoria-squadra"])
        .split("\n")
        .filter(Boolean),
    );
  } catch (e) {
    console.error(`⚪ CIECO: non ho potuto leggere la storia di ${ramo} (${e.message.slice(0, 120)}).`);
    process.exit(2);
  }

  const conto = conta(storia, conEsito);
  const ultima = storia.find((c) => !AUTORE_WORKER.test(c.autore || ""));
  const cabina = cabinaFerma(statoAggiornato(), ultima?.quando);

  const precedente = existsSync(REFERTO) ? JSON.parse(readFileSync(REFERTO, "utf8")) : {};
  const tetti = precedente.tetti || null;
  const v = verdetto({ conto, cabina, tetti });

  const referto = {
    _cosa_e:
      "📮 Quante volte ho consegnato un lavoro il cui esito non è arrivato dove Nicola legge (AR-474). Il tetto SCENDE e non risale: aggiungerne uno è un errore, portarne via è il lavoro.",
    misurato: new Date().toISOString().slice(0, 16).replace("T", " "),
    finestra_giorni: GIORNI,
    ...conto,
    cabina,
    tetti: AGGIORNA
      ? {
          consegne_mute: Math.min(conto.mute, tetti?.consegne_mute ?? conto.mute),
          cabina_ferma_giorni: Math.min(cabina?.giorni_indietro ?? 0, tetti?.cabina_ferma_giorni ?? (cabina?.giorni_indietro || 0)),
        }
      : tetti || { consegne_mute: conto.mute, cabina_ferma_giorni: cabina?.giorni_indietro ?? 0 },
  };
  scriviJsonAtomico(REFERTO, referto);

  if (JSON_MODE) {
    console.log(JSON.stringify(referto, null, 2));
  } else {
    console.log("📮 VERDETTI MUTI — quante volte ho consegnato senza dire com'è andata\n");
    console.log(`   Finestra:          ultimi ${GIORNI} giorni su ${ramo} (${conto.commit_esaminati} commit con lavoro fuori dalla memoria)`);
    console.log(`   Consegne:          ${conto.consegne}   (commit con lavoro fuori dalla memoria · ${conto.esclusi_worker} manutenzioni del worker escluse e dichiarate)`);
    console.log(`   ↳ senza esito:     ${conto.mute}   (${conto.tasso}%)   tetto: ${referto.tetti.consegne_mute}`);
    if (cabina) {
      console.log(`   Cabina (STATO.md): aggiornata al ${cabina.stato_aggiornato} · ultima consegna ${cabina.ultima_consegna} → ${cabina.giorni_indietro} giorni indietro`);
    } else {
      console.log("   Cabina (STATO.md): ⚪ non ho potuto leggere la data — non la do per buona.");
    }
    if (conto.ultime_mute.length) {
      console.log("\n   Le più recenti senza esito:");
      for (const c of conto.ultime_mute) console.log(`   · ${c.quando}  ${c.hash}  ${c.titolo}`);
    }
    console.log("");
    for (const r of v.righe) console.log(`   ${r}`);
    if (!v.righe.length) console.log("   ✅ sotto il tetto su entrambi i numeri.");
    console.log(`\n   Referto: ${REFERTO}`);
  }

  if (AGGIORNA) process.exit(0);
  process.exit(v.rotto ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
