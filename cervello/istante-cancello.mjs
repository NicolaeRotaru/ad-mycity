#!/usr/bin/env node
// istante-cancello.mjs — LE DECISIONI DEI CANCELLI DEL WORKER, rese pure perché una prova le ESEGUA.
//
// La malattia che questo file cura si chiama «il cancello montato nel punto sbagliato del tempo»:
// negli script di shell i controlli esistono ma girano nell'istante sbagliato — dopo che il commit
// ha svuotato lo stage (AR-395), prima del riallineamento invece che prima dell'invio (AR-396), o
// con un parametro che nessuno legge (AR-394). **Un cancello che gira quando non serve più è
// indistinguibile da un cancello assente, e stampa verde uguale.**
//
// Perché un file a parte invece di quattro `if` dentro gli script: dentro uno script una prova può
// solo CERCARE un pattern, e un pattern non distingue «il controllo c'è» da «il controllo ferma».
// È la stessa ragione per cui esistono `esito-scrittura.mjs` e `giro-esito.sh` — qui la applichiamo
// ai tre punti che ancora decidevano a mano dentro `gate-pubblicazione.sh` e `giro.sh`.
//
// 🟢 Sola lettura: le funzioni non fanno I/O, non toccano la rete, non chiamano git. L'unica lettura
//    è quella di stdin, e vive nella CLI in fondo (stesso stile di `esito-scrittura.mjs`: JSON su
//    stdout, esito nel codice d'uscita).

import { readFileSync } from "node:fs";

// ─────────────────────────────────────────────────────────────────────────────
// ① AR-395 — LO STAGE VUOTO NON È UN PERIMETRO PULITO: È UN METRO CHE NON HA MISURATO
// ─────────────────────────────────────────────────────────────────────────────
//
// In `giro.sh` il cancello girava DOPO il `git commit`. Il commit svuota lo stage, quindi il
// controllo del perimetro leggeva un insieme vuoto e rispondeva «nessun file di codice, si passa».
// Zero significava due cose diverse — «ho guardato e va bene» e «non c'era niente da guardare» — e
// per mesi ha stampato verde nel giro, cioè nel pubblicatore più frequente dopo il worker.
//
// La regola, la stessa del contratto 0/1/2 dei guardiani in node (AR-322): un metro che non ha
// niente da misurare MENTRE del lavoro esiste è CIECO, e cieco non è verde. Se invece non c'è
// proprio nulla da pubblicare, lo stage vuoto è la verità: si passa.
//
// `staged` = i percorsi nello stage (uno per riga, come li dà `git diff --cached --name-only`).
// `lavoroInAttesa` = c'è del lavoro che dovrebbe essere lì dentro e non c'è (commit locali non
//                    pubblicati, o file di memoria modificati e non messi in staging).
//
//   verdetto: "ok"     → si può proseguire
//             "codice" → c'è del codice nello stage: NON si pubblica (AR-310/AR-044)
//             "cieco"  → lo stage è vuoto ma del lavoro c'è: il controllo non ha misurato nulla

/** Le uniche cartelle che possono viaggiare verso main. Il codice sul server si allinea DA main. */
const CARTELLE_MEMORIA = ["MyCity-Vault", "consegne", "creativi", "memoria-squadra"];

/** I percorsi dello stage che NON sono memoria (cioè: codice finito dove non deve stare). */
export function fuoriPerimetro(staged = "") {
  return String(staged || "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean)
    .filter((p) => !CARTELLE_MEMORIA.some((c) => p === c || p.startsWith(`${c}/`)));
}

export function esitoPerimetro({ staged = "", lavoroInAttesa = false } = {}) {
  const intrusi = fuoriPerimetro(staged);
  if (intrusi.length) {
    return {
      verdetto: "codice",
      puoiPubblicare: false,
      intrusi,
      motivo: `file di CODICE nello stage (${intrusi.slice(0, 5).join(", ")}) — verso main viaggia solo la memoria`,
    };
  }
  const vuoto = !String(staged || "").trim();
  if (vuoto && lavoroInAttesa) {
    return {
      verdetto: "cieco",
      puoiPubblicare: false,
      intrusi: [],
      motivo:
        "lo stage è VUOTO ma c'è lavoro non ancora pubblicato: il controllo del perimetro non ha " +
        "guardato niente. Un metro che non misura non è un verde (AR-395) — il cancello va chiamato " +
        "PRIMA del commit, non dopo",
    };
  }
  return { verdetto: "ok", puoiPubblicare: true, intrusi: [], motivo: vuoto ? "niente da pubblicare" : "solo memoria" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ② AR-394 — IL QUARTO CONTROLLO PROMESSO E MAI FATTO
// ─────────────────────────────────────────────────────────────────────────────
//
// `gate_verdetto "$rc_seg" "$rc_fat" "$rc_one" "$rc_san"`: quattro posti nel verdetto, tre riempiti.
// `rc_one` (l'onestà) veniva inizializzato a 0 e non toccato mai più, perché il guardiano non era
// eseguito. Per il verdetto uno zero mai scritto e un guardiano passato sono la stessa cosa: la
// firma della funzione continuava a promettere quattro controlli molto dopo che il quarto era
// sparito. **Un parametro accettato e mai letto è una promessa scritta.**
//
// Perché non bastava «collegarlo e basta»: `onesta-check.mjs` sul diario append-only della memoria
// interna ha falsi positivi noti (uno snippet di bash fra parentesi quadre letto come segnaposto,
// una data letta come numero senza fonte). Collegarlo com'era avrebbe bloccato la pubblicazione
// subito — cioè la memoria ferma sul server e la Cabina congelata.
//
// Le due riparazioni vanno insieme, e nessuna delle due da sola basta:
//   · l'AMBITO si restringe alla parte VIVA dei file (la storia non si giudica: non si riscrive);
//   · il MODO diventa esplicito e dichiarato — `blocca` entra nel verdetto, `avvisa` no — e in
//     entrambi i casi il valore viene MISURATO e DETTO. Non esiste più il terzo caso, quello di
//     prima: il posto nel verdetto che nessuno riempie.

/**
 * La parte VIVA di un file di memoria: quella che il giro riscrive ogni volta, e quindi l'unica su
 * cui ha senso pretendere l'onestà adesso.
 *
 * Il diario di STATO.md è append-only per contratto (come DECISIONI.md): sono righe di citazione
 * `> …` che raccontano i giri passati e che NON si riscrivono mai — la regola del vault le protegge.
 * Giudicare oggi una frase scritta a luglio significa chiedere di riscrivere la storia per poter
 * pubblicare il presente: è la ragione per cui il controllo era stato staccato invece che ristretto.
 */
export function parteViva(testo = "") {
  return String(testo || "")
    .split("\n")
    .filter((r) => !/^\s*>/.test(r))
    .join("\n");
}

/**
 * Il posto dell'onestà nel verdetto del cancello.
 *
 *   modo "blocca" → l'rc misurato entra nel verdetto: una violazione ferma la pubblicazione.
 *   modo "avvisa" → non ferma, ma il valore è misurato e la riga lo DICE, col suo perché.
 *
 * `misurato` è il campo che chiude il difetto: finché era `false` per costruzione, il cancello
 * prometteva quattro controlli e ne faceva tre.
 */
export function esitoOnesta({ rc = 0, modo = "avvisa" } = {}) {
  const n = Number.isFinite(Number(rc)) ? Number(rc) : 2;
  const blocca = String(modo) === "blocca";
  const pulito = n === 0;
  const cieco = n === 2;
  return {
    misurato: true,
    rc: n,
    modo: blocca ? "blocca" : "avvisa",
    // Ciò che il verdetto riceve davvero. In modo "avvisa" resta 0 — ma è una scelta DICHIARATA e
    // stampata, non uno zero che nessuno ha mai scritto.
    rcVerdetto: blocca ? n : 0,
    blocca: blocca && !pulito,
    frase: pulito
      ? "onestà: nessuna violazione sulla parte viva della memoria"
      : cieco
        ? `onestà: NON misurabile (rc=2) — ${blocca ? "cieco non è verde: NON pubblico" : "modo AVVISA: non blocco, ma il metro è rotto"}`
        : `onestà: violazioni sulla parte viva (rc=${n}) — ${blocca ? "NON pubblico" : "modo AVVISA: non blocco (alza GATE_ONESTA=blocca per farlo bloccare)"}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ AR-644 — L'AGGANCIO DEI CANCELLI DEL COMMIT: RIUSCITO O SOLO TENTATO?
// ─────────────────────────────────────────────────────────────────────────────
//
// `bash cervello/installa-hooks.sh >/dev/null 2>&1 || true`, in cima a giro.sh e worker.sh: se
// l'aggancio non attecchisce, i commit girano senza nessun cancello (niente scan dei segreti, niente
// perimetro) e nessuno lo dice. Scoperta e muta insieme — ed è la combinazione peggiore, perché la
// finestra silenziosa somiglia in tutto a una sessione protetta.
//
// Il difetto NON è dove sta la chiamata (l'istante è giusto: all'avvio, prima di ogni commit): è che
// l'ESITO viene buttato via. Un aggancio si dichiara riuscito solo se `core.hooksPath` punta davvero
// dove deve E il pre-commit è eseguibile: il resto è aver lanciato un comando.
export function esitoAggancioCancelli({
  rc = 0,
  hooksPath = "",
  atteso = ".githooks",
  preCommitEseguibile = true,
} = {}) {
  const n = Number(rc) || 0;
  if (n !== 0) {
    return { agganciato: false, motivo: `l'installazione dei cancelli è uscita con rc=${n}` };
  }
  const dove = String(hooksPath || "").trim().replace(/\/+$/, "");
  if (!dove) {
    return { agganciato: false, motivo: "core.hooksPath non è impostato: i commit girano senza cancelli" };
  }
  if (dove !== String(atteso).replace(/\/+$/, "")) {
    return { agganciato: false, motivo: `core.hooksPath punta a «${dove}», non a «${atteso}»` };
  }
  if (!preCommitEseguibile) {
    return { agganciato: false, motivo: "il pre-commit c'è ma non è eseguibile: git lo salta in silenzio" };
  }
  return { agganciato: true, motivo: `cancelli del commit attivi (core.hooksPath=${dove})` };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI — come la shell interroga queste decisioni
// ─────────────────────────────────────────────────────────────────────────────
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const arg = (nome, def = "") => {
    const t = process.argv.find((a) => a.startsWith(`--${nome}=`));
    return t ? t.slice(nome.length + 3) : def;
  };
  const vero = (v) => v === "1" || v === "true" || v === "si";
  const cmd = process.argv[2] || "";

  if (cmd === "perimetro") {
    // I percorsi arrivano da una VARIABILE D'AMBIENTE, non dalla riga di comando: un nome di file
    // può contenere qualunque cosa, e passarlo come argomento lo esporrebbe alla shell.
    const r = esitoPerimetro({
      staged: process.env.STAGED || "",
      lavoroInAttesa: vero(arg("lavoro-in-attesa", "0")),
    });
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.verdetto === "ok" ? 0 : r.verdetto === "codice" ? 10 : 11);
  } else if (cmd === "parte-viva") {
    // Legge il testo da stdin e stampa solo ciò che è VIVO (via il diario append-only).
    let testo = "";
    try {
      testo = readFileSync(0, "utf8");
    } catch {
      testo = "";
    }
    process.stdout.write(parteViva(testo));
  } else if (cmd === "onesta") {
    const r = esitoOnesta({ rc: arg("rc", "0"), modo: arg("modo", "avvisa") });
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.blocca ? 10 : 0);
  } else if (cmd === "aggancio") {
    const r = esitoAggancioCancelli({
      rc: arg("rc", "0"),
      hooksPath: arg("hooks-path", ""),
      atteso: arg("atteso", ".githooks"),
      preCommitEseguibile: vero(arg("pre-commit-eseguibile", "1")),
    });
    process.stdout.write(JSON.stringify(r) + "\n");
    process.exit(r.agganciato ? 0 : 10);
  } else {
    process.stderr.write("Uso: istante-cancello.mjs {perimetro|parte-viva|onesta|aggancio} [--opzioni]\n");
    process.exit(64);
  }
}
