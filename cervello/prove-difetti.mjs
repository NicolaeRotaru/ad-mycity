#!/usr/bin/env node
// 🧪 LE PROVE DEI DIFETTI APERTI — un difetto si dimostra ESEGUENDO qualcosa, non cercando una parola.
//
// PERCHÉ ESISTE (AR-564, l'asticella approvata da Nicola il 10/8: «ok asticella»).
//
// Nel cantiere 194 difetti avevano per prova un `file + pattern`: «il fix è fatto quando questa
// parola compare in questo file». Il caso vero è AR-128, «non esiste nessun sensore per le
// contestazioni carta», la cui prova era che la parola «chargeback» comparisse in un documento:
// scriverla chiudeva il difetto, e il sensore non c'era comunque. *Una ricerca di parole non può
// fallire nel modo in cui fallisce la realtà.*
//
// C'È DI PIÙ, e l'ho scoperto convertendo: **nessun difetto APERTO aveva una prova a comando** —
// zero su 220. Le 243 prove che girano appartengono tutte a difetti già chiusi. Cioè: la forma
// forte era usata solo per confermare un fix, mai per dimostrare che un difetto ESISTE. Una prova
// che nasce solo nel momento in cui diventa verde non ha mai avuto occasione di dire di no.
//
// Qui le prove nascono ROSSE, ed è il loro stato giusto: il difetto è aperto. Diventano verdi
// quando qualcuno lo ripara davvero — non quando qualcuno scrive la parola giusta da qualche parte.
//
// PERCHÉ UN FILE SOLO, e non 126 guardiani. `cervello/forma-prova.mjs` ammette solo
// `node cervello/<script>.mjs [--flag]`: niente comandi arbitrari, per non far eseguire codice
// scelto da chi scrive il difetto. Quindi ogni prova è una bandierina qui dentro — `--ar-366` — e
// la casa resta una sola. Aggiungere una conversione = aggiungere una funzione a questo elenco.
//
// ⚠️ QUESTO SCRIPT NON STA IN `cervello/test/`, apposta: `test-cervello.mjs` deve restare verde:
// misura la rete, non i buchi. Questo invece è rosso finché i buchi ci sono, e lo esegue
// `auto-fix.mjs` per decidere se un difetto si può chiudere.
//
// 🟢 Sola lettura: esegue codice in copie temporanee, non tocca niente di vivo.
//
// Uso:
//   node cervello/prove-difetti.mjs            → tutte, a voce (exit 1 se almeno una è rossa)
//   node cervello/prove-difetti.mjs --ar-366   → una sola: exit 0 riparato · 1 aperto · 2 non misurabile

import { existsSync, readFileSync, mkdtempSync, writeFileSync, chmodSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";

// La radice su cui le prove guardano. Di norma è il repo vero; la prova a due versi la punta su una
// COPIA temporanea, dove può simulare il fix senza toccare niente di vivo. Serve perché una prova che
// sa solo dire di no è inutile quanto un grep: bisogna poter dimostrare che sa anche dire di sì.
const RADICE = process.env.PROVE_DIFETTI_RADICE || AD_ROOT;

const APERTO = { riparato: false };
const RIPARATO = { riparato: true };

/** Una cartella usa-e-getta dove far girare le prove che scrivono. */
function sandbox(nome) {
  return mkdtempSync(join(tmpdir(), `prova-${nome}-`));
}

/** Esegue un altro guardiano e ne prende il verdetto: 0 = a posto. */
function eseguiGuardiano(script, args = []) {
  const r = spawnSync("node", [join(AD_ROOT, "cervello", script), ...args], { cwd: AD_ROOT, encoding: "utf8", timeout: 120_000 });
  if (r.error) return { cieco: `non ho potuto eseguire ${script}: ${r.error.message}` };
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
}

/** La prima riga utile dell'uscita di un guardiano, per raccontare il perché. */
const primaRigaUtile = (t) =>
  String(t || "")
    .split("\n")
    .map((r) => r.trim())
    .find((r) => r && !r.startsWith("🔐") && !r.startsWith("(")) || "(nessun dettaglio)";

// ═════════════════════════════════════════════════════════════════════════════
// IL TRATTO DEL GIRO — si ritaglia un pezzo VERO di giro.sh e lo si esegue con motori finti.
//
// Tredici difetti gravi avevano per prova un pattern su `cervello/giro.sh`. Sono tutti della stessa
// famiglia: «il giro chiama un guardiano e poi butta via quello che ha detto». Un pattern non lo può
// vedere — la riga cercata è quasi sempre proprio quella che il fix deve AGGIUNGERE, quindi la prova
// dice «aperto» finché non compare quel testo, e «riparato» appena qualcuno lo scrive, anche in un
// commento. Qui invece il pezzo di giro si ESEGUE: si sostituisce il guardiano vero con uno finto che
// dice quello che ci serve, e si guarda se il giro se n'è accorto.
//
// ⚠️ DUE TRAPPOLE, pagate col primo lotto (AR-571), e la difesa di ognuna sta qui dentro:
//   ① UN RITAGLIO CHE NON STA IN PIEDI. Tagliando in mezzo a un `if/else`, bash muore alla prima riga
//      di chiusura orfana. La prova non arriva mai al punto pericoloso — e siccome non ci arriva, non
//      trova niente di rotto e sembra verde. Difesa: `bash -n` sul pezzo ritagliato PRIMA di eseguirlo;
//      se non compila è ⚪, mai ✅.
//   ② IL MOTORE FINTO CHE NON VIENE MAI CHIAMATO. Se il ritaglio è sbagliato e il guardiano finto non
//      parte, la variabile resta vuota — che è esattamente il sintomo del difetto. Verde falso al
//      contrario: si accusa un difetto guardando il proprio errore. Difesa: il motore finto lascia un
//      SIGILLO quando parte. Niente sigillo = non ho misurato.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Ritaglia da giro.sh il tratto che parte dalla riga `ancora` e arriva fino a dove i blocchi aperti
 * tornano in pari (così il pezzo sta in piedi da solo), fermandosi al più tardi alla prossima tappa
 * del giro. Il fix può allungare il tratto — un `if` in più dopo la chiamata — e il ritaglio lo segue.
 */
function trattoDelGiro(righe, ancora) {
  const da = righe.findIndex((r) => r.includes(ancora));
  if (da < 0) return { errore: `non trovo più «${ancora}» in giro.sh: lo script è cambiato sotto i piedi` };
  let livello = 0;
  for (let i = da; i < righe.length; i++) {
    const t = righe[i].trim();
    if (/^(if|for|while)\b/.test(t)) livello++;
    else if (t === "fi" || t === "done") livello--;
    if (livello < 0) return { errore: "il tratto esce dal suo blocco: non ritaglio pezzi che non compilano" };
    // Fine naturale: blocchi in pari e la riga dopo apre una tappa nuova del giro (o chiude il padre).
    const dopo = (righe[i + 1] || "").trim();
    if (livello === 0 && i > da && (/^echo "\[\$\(ts\)\]/.test(dopo) || dopo === "fi" || dopo === "")) {
      return { blocco: righe.slice(da, i + 1).join("\n") };
    }
  }
  return { errore: "il tratto non si chiude prima della fine di giro.sh" };
}

/**
 * Esegue un tratto di giro.sh in una sandbox, con i guardiani sostituiti da script finti.
 *
 * `motori` = { "letargo.mjs": { stampa: "…", rc: 1 } } — ognuno lascia il suo sigillo quando parte.
 * Ritorna le variabili chieste in `leggi`, più `partiti` (quali motori finti sono stati davvero
 * eseguiti) — perché una variabile vuota vale solo se il guardiano ha parlato.
 */
function eseguiTrattoDelGiro({ nome, ancora, motori, leggi, preludio = "" }) {
  const f = join(RADICE, "cervello/giro.sh");
  if (!existsSync(f)) return { cieco: "cervello/giro.sh non c'è: non ho potuto eseguire il tratto" };
  const { blocco, errore } = trattoDelGiro(readFileSync(f, "utf8").split("\n"), ancora);
  if (errore) return { cieco: errore };

  const dove = sandbox(nome);
  const finti = join(dove, "motori");
  mkdirSync(finti, { recursive: true });
  for (const [file, { stampa, rc }] of Object.entries(motori)) {
    // Il motore finto è uno script node vero: il tratto lo chiama con `node "$SCRIPT_DIR/<file>"`,
    // esattamente come chiamerebbe il guardiano. Il sigillo dice «sono stato eseguito»: senza, una
    // variabile vuota non prova il difetto — prova solo che il ritaglio non ha funzionato.
    //
    // ⚠️ In ESM (`.mjs`) `require` NON esiste: la prima versione di questo finto lo usava, moriva
    // all'istante e usciva con un codice diverso da zero — che è ESATTAMENTE quello che la prova si
    // aspetta da un guardiano che dice no. Il tratto vedeva rc≠0, la prova vedeva la variabile vuota,
    // e avrebbe gridato «difetto!» guardando il proprio errore. L'ha spenta il sigillo, che non è mai
    // arrivato: per questo il sigillo si scrive con l'import, non col require.
    writeFileSync(
      join(finti, file),
      `import { writeFileSync } from "node:fs";\n` +
        `writeFileSync(${JSON.stringify(join(dove, `partito-${file}`))}, "1");\n` +
        `console.log(${JSON.stringify(stampa)});\nprocess.exit(${rc});\n`,
    );
  }

  // Ogni variabile esce su un FILE suo: i vincoli sono frasi lunghe e vanno a capo, quindi qualunque
  // separatore dentro un file solo prima o poi finisce dentro un valore e taglia la lettura a metà.
  const fileVar = (v) => join(dove, `var-${v}`);
  const script = join(dove, "prova.sh");
  writeFileSync(
    script,
    `#!/bin/bash\nset -u\n` +
      `ts() { echo 00:00; }\n` +
      `esito_righe() { cat >/dev/null; }\n` +               // il filtro decorativo del giro: qui non serve
      `guardiano() { node "$SCRIPT_DIR/$1"; GUARDIANO_RC=$?; return $GUARDIANO_RC; }\n` +
      `vincolo_da_rc() { [ "$2" -eq 0 ] && echo "" || echo "$3"; }\n` +
      `SCRIPT_DIR=${JSON.stringify(finti)}\nGUARDIANO_RC=0\n` +
      leggi.map((v) => `${v}=""`).join("\n") + "\n" +
      preludio + "\n" +
      `${blocco}\n` +
      leggi.map((v) => `printf '%s' "\${${v}:-}" > ${JSON.stringify(fileVar(v))}`).join("\n") + "\n",
  );
  chmodSync(script, 0o755);

  // ① Il pezzo ritagliato sta in piedi? Se non compila, non ha provato niente.
  const sintassi = spawnSync("bash", ["-n", script], { encoding: "utf8", timeout: 30_000 });
  if (sintassi.status !== 0) {
    return { cieco: `il tratto ritagliato non compila, quindi non l'ho eseguito: ${(sintassi.stderr || "").trim().split("\n")[0]}` };
  }

  const r = spawnSync("bash", [script], { encoding: "utf8", timeout: 60_000 });
  if (r.error) return { cieco: `non ho potuto eseguire il tratto: ${r.error.message}` };

  // ② I motori finti sono partiti? Senza, una variabile vuota è il MIO errore, non il difetto.
  const partiti = Object.keys(motori).filter((f2) => existsSync(join(dove, `partito-${f2}`)));
  if (partiti.length === 0) {
    const perche = (r.stderr || r.stdout || "").trim().split("\n").filter(Boolean).slice(-1)[0] || `uscita ${r.status}`;
    return { cieco: `il tratto non ha mai chiamato il guardiano, quindi non ho misurato niente (${perche.slice(0, 110)}) — cieco, non rosso` };
  }

  const vars = Object.fromEntries(
    leggi.map((v) => [v, existsSync(fileVar(v)) ? readFileSync(fileVar(v), "utf8").trim() : ""]),
  );
  return { vars, partiti, log: `${r.stdout || ""}${r.stderr || ""}` };
}

/**
 * La famiglia «il giro chiama un guardiano e butta via il verdetto»: il fix è sempre lo stesso —
 * prendere il codice d'uscita FUORI dalla pipe e trasformarlo in un vincolo che porta le parole del
 * guardiano. Qui il metro è uno solo, così le quattro prove non divergono riga per riga.
 */
function vincoloRaccolto({ nome, ancora, motore, stampa, variabile, spia, quandoVuoto, quandoFisso }) {
  const r = eseguiTrattoDelGiro({ nome, ancora, motori: { [motore]: { stampa, rc: 1 } }, leggi: [variabile] });
  if (r.cieco) return { cieco: r.cieco };
  const valore = r.vars[variabile];
  if (!valore) return { ...APERTO, detto: quandoVuoto };
  if (!valore.includes(spia)) return { ...APERTO, detto: quandoFisso(valore) };
  return { ...RIPARATO, detto: `${variabile} porta al motore quello che ha detto il guardiano («${spia}»), non una frase scritta a mano nel giro` };
}

// ═════════════════════════════════════════════════════════════════════════════
// LE PROVE
// ═════════════════════════════════════════════════════════════════════════════

const PROVE = {
  // ───────────────────────────────────────────────────────────────────────────
  // I QUATTRO VERDETTI BUTTATI VIA — stessa malattia, quattro punti del giro.
  // Il giro chiama un guardiano, il guardiano dice qualcosa, e quel qualcosa non arriva al motore.
  // Le prove vecchie cercavano il nome della variabile che il fix deve CREARE: `LETARGO_VINCOLO`
  // scritto in un commento le avrebbe rese verdi. Queste eseguono il tratto e guardano se il vincolo
  // esiste davvero e se porta le parole del guardiano.
  // ───────────────────────────────────────────────────────────────────────────
  "ar-208": {
    titolo: "Lo stop al budget è un freno, non un foglietto: il suo verdetto arriva al motore",
    // Prova vecchia: `giro.sh ~ /BUDGET_VINCOLO|…/`. Cioè: «il difetto è riparato quando in giro.sh
    // compare la parola BUDGET_VINCOLO» — la parola che il fix aggiunge. Qui il tratto si esegue con
    // una sentinella finta che dichiara lo sforo: oggi il giro la manda in una pipe con `|| true`,
    // quindi il verdetto muore lì e nessun vincolo raggiunge il motore.
    prova() {
      return vincoloRaccolto({
        nome: "ar208",
        ancora: "Sentinella budget per reparto",
        motore: "sentinella-budget.mjs",
        stampa: "⛔ STOP BUDGET: marketing ha sforato il tetto del mese",
        variabile: "BUDGET_VINCOLO",
        spia: "STOP BUDGET",
        quandoVuoto:
          "la sentinella ha dichiarato lo sforo (rc=1) e il giro non ne ha ricavato nessun vincolo: il verdetto finisce in una pipe con `|| true` e muore lì, il motore non sa che un reparto è in stop",
        quandoFisso: (v) =>
          `il vincolo del budget esiste ma non porta le parole della sentinella: al motore arriva «${v.slice(0, 70)}…», non il motivo vero dello stop`,
      });
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-392": {
    titolo: "Quando finisce la benzina, chi ordina di spegnere il superfluo viene ascoltato",
    // Prova vecchia: cercare `LETARGO_VINCOLO` in giro.sh — la variabile che non esiste ancora.
    // Qui il letargo finto dichiara il livello RISPARMIO: il fix è che quel livello diventi un
    // vincolo. Oggi la riga è `node letargo.mjs | esito_righe 3 || true`: il codice d'uscita si
    // perde nella pipe (in bash il rc di una pipe è quello dell'ULTIMO comando, cioè di `esito_righe`).
    prova() {
      return vincoloRaccolto({
        nome: "ar392",
        ancora: "Letargo (livello di degradazione)",
        motore: "letargo.mjs",
        stampa: "🛌 LIVELLO RISPARMIO: spegnere i giri notturni e i workflow pesanti",
        variabile: "LETARGO_VINCOLO",
        spia: "LIVELLO RISPARMIO",
        quandoVuoto:
          "il letargo ha dichiarato il livello RISPARMIO e il giro non ne ha ricavato nessun vincolo: il verdetto muore nella pipe, e la macchina continua a spendere come se avesse la benzina piena",
        quandoFisso: (v) =>
          `il vincolo del letargo esiste ma non porta il livello dichiarato: al motore arriva «${v.slice(0, 70)}…», quindi non sa cosa spegnere`,
      });
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-323": {
    titolo: "Il vincolo sugli esperimenti dice la causa vera, invece di ordinarne sempre uno nuovo",
    // Prova vecchia: `ESP_VINCOLO="⛔ NESSUN ESPERIMENTO APERTO` con `presente:false` — cioè «il fix è
    // fatto quando quella stringa sparisce». Cancellarla bastava, anche lasciando il giro muto.
    // Qui il guardiano finto dichiara la causa DIVERSA (esperimenti scaduti da misurare) e si
    // pretende che il vincolo la riporti: il testo lo deve produrre il guardiano, non il giro.
    prova() {
      return vincoloRaccolto({
        nome: "ar323",
        ancora: "Sweep esperimenti in scadenza",
        motore: "esperimenti-check.mjs",
        stampa: "⛔ 2 ESPERIMENTI SCADUTI DA MISURARE: chiusi senza esito, prima misura quelli",
        variabile: "ESP_VINCOLO",
        spia: "SCADUTI DA MISURARE",
        quandoVuoto:
          "il guardiano degli esperimenti ha detto no (rc=1) e nessun vincolo è arrivato al motore",
        quandoFisso: (v) =>
          `il guardiano ha detto «2 esperimenti scaduti da misurare», al motore arriva la frase fissa scritta a mano nel giro: «${v.slice(0, 80)}…». Il giro ordina di APRIRNE uno nuovo mentre il problema è che nessuno ha misurato quelli vecchi`,
      });
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-158": {
    titolo: "Il vincolo North Star riporta quello che ha misurato il guardiano, non un ordine fisso",
    // Prova vecchia: `NORTH STAR IN STALLO` con `presente:false` — di nuovo «cancella la stringa».
    // Il difetto vero: il giro ordina «SOLO azioni che avvicinano il 1° ordine» anche quando Nicola
    // ha dichiarato una fase tecnica. Il testo del vincolo è scritto a mano nel giro, quindi non può
    // cambiare quando cambia il fatto. Qui il guardiano finto dichiara la fase tecnica e si pretende
    // che il vincolo la riporti.
    prova() {
      return vincoloRaccolto({
        nome: "ar158",
        ancora: "North Star (AR-113",
        motore: "north-star-check.mjs",
        stampa: "⛔ FASE TECNICA DICHIARATA fino al 2026-08-20: ammesso lavoro macchina, ma almeno 1 azione business per giro",
        variabile: "NORTH_STAR_VINCOLO",
        spia: "FASE TECNICA DICHIARATA",
        quandoVuoto: "il guardiano North Star ha detto no (rc=1) e nessun vincolo è arrivato al motore",
        quandoFisso: (v) =>
          `il guardiano ha dichiarato la fase tecnica, al motore arriva la frase fissa del giro: «${v.slice(0, 80)}…». Il giro ordina il contrario di quello che ha deciso Nicola, e nessuno riconcilia i due comandi`,
      });
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-395": {
    titolo: "Il cancello di pubblicazione guarda lo stage mentre c'è ancora qualcosa da guardare",
    // Prova vecchia: `gate_pubblicazione [\s\S]{0,600}?commit -q -m "giro AD` con `presente:true` —
    // cercava l'ORDINE SBAGLIATO nel testo. Fragile in due modi: si sposta una riga di commento e la
    // distanza di 600 caratteri non torna più (verde senza fix), e non dice niente su cosa il cancello
    // veda davvero.
    //
    // Qui si esegue il tratto vero della pubblicazione su un repo finto, e — è il punto — si
    // FOTOGRAFA lo stage NELL'ISTANTE in cui il cancello viene chiamato. È la lezione del secondo
    // verde falso del primo lotto: un sigillo che prova solo l'ARRIVO al punto pericoloso non prova
    // la salvezza. Quello che conta è lo stato in quell'istante.
    prova() {
      const f = join(RADICE, "cervello/giro.sh");
      if (!existsSync(f)) return { cieco: "cervello/giro.sh non c'è" };
      const righe = readFileSync(f, "utf8").split("\n");
      const iApre = righe.findIndex((r) => r.includes("git diff --cached --quiet"));
      if (iApre < 0) return { cieco: "non trovo più il blocco di pubblicazione in giro.sh: lo script è cambiato sotto i piedi" };
      const iGate = righe.findIndex((r, i) => i > iApre && /gate_pubblicazione "\$SCRIPT_DIR"/.test(r));
      if (iGate < 0) return { cieco: "non trovo la chiamata al cancello di pubblicazione dopo il blocco del commit" };

      const dove = sandbox("ar395");
      const repo = join(dove, "repo");
      mkdirSync(repo, { recursive: true });
      const git = (...a) => spawnSync("git", a, { cwd: repo, encoding: "utf8" });
      git("init", "-q", "-b", "main");
      git("config", "user.email", "prova@mycity.local");
      git("config", "user.name", "prova");
      writeFileSync(join(repo, "base.md"), "riga di partenza\n");
      git("add", "-A");
      git("commit", "-qm", "base");
      // La memoria che il giro pubblicherebbe: una modifica messa NELLO STAGE, come fa il giro vero.
      mkdirSync(join(repo, "MyCity-Vault/90-Memoria-AI"), { recursive: true });
      writeFileSync(join(repo, "MyCity-Vault/90-Memoria-AI/STATO.md"), "memoria aggiornata dal giro\n");
      git("add", "-A");

      // Il cancello finto: non giudica, FOTOGRAFA. Quello che scrive è lo stage nell'istante in cui il
      // giro gli chiede il permesso — cioè l'unica cosa che dice se aveva qualcosa da controllare.
      const foto = join(dove, "stage-al-cancello.txt");
      const gate = join(dove, "gate-pubblicazione.sh");
      writeFileSync(
        gate,
        `gate_pubblicazione() {\n  git diff --cached --name-only > ${JSON.stringify(foto)} 2>&1\n  return 0\n}\n`,
      );

      // Il tratto si ferma alla chiamata del cancello — oltre c'è il push vero, che qui non deve
      // partire — quindi resta con dei blocchi aperti: si contano e si chiudono, invece di indovinare
      // quanti `fi` servono. Se il conto è sbagliato `bash -n` lo dice e la prova esce ⚪.
      const tratto = righe.slice(iApre, iGate + 1);
      let aperti = 0;
      for (const r of tratto) {
        const t = r.trim();
        if (/^(if|for|while)\b/.test(t)) aperti++;
        else if (t === "fi" || t === "done") aperti--;
      }
      const script = join(dove, "prova.sh");
      writeFileSync(
        script,
        `#!/bin/bash\nset -u\ncd ${JSON.stringify(repo)}\n` +
          `ts() { echo 00:00; }\n` +
          `SCRIPT_DIR=${JSON.stringify(dove)}\nREPO=${JSON.stringify(repo)}\nbranch=main\n` +
          `GIT_ID=(-c user.name=prova -c user.email=prova@mycity.local)\n` +
          `GIRO_HAD_CHANGES=0\nGIRO_PUSH_BLOCCATO=0\nGIRO_PUSH_OK=0\n` +
          `GIT_PUSH_TOKEN=finto\nGIT_REPO=finto/finto\n` +
          `${tratto.join("\n")}\n  :\n${"fi\n".repeat(Math.max(aperti, 0))}`,
      );
      chmodSync(script, 0o755);
      const sintassi = spawnSync("bash", ["-n", script], { encoding: "utf8", timeout: 30_000 });
      if (sintassi.status !== 0) {
        return { cieco: `il tratto ritagliato non compila, quindi non l'ho eseguito: ${(sintassi.stderr || "").trim().split("\n")[0]}` };
      }
      const r = spawnSync("bash", [script], { encoding: "utf8", timeout: 60_000 });
      if (r.error) return { cieco: `non ho potuto eseguire il tratto della pubblicazione: ${r.error.message}` };
      if (!existsSync(foto)) {
        const perche = (r.stderr || r.stdout || "").trim().split("\n").filter(Boolean).slice(-1)[0] || `uscita ${r.status}`;
        return { cieco: `il tratto non è mai arrivato a chiamare il cancello, quindi non ho misurato niente (${perche.slice(0, 110)}) — cieco, non rosso` };
      }
      const staged = readFileSync(foto, "utf8").split("\n").filter(Boolean);
      if (staged.length === 0) {
        return {
          ...APERTO,
          detto: "quando il cancello viene chiamato lo stage è VUOTO: il commit l'ha già svuotato due righe prima, quindi il controllo del perimetro non guarda niente e dice sempre di sì",
        };
      }
      return { ...RIPARATO, detto: `il cancello vede ancora ${staged.length} file nello stage quando decide (${staged[0]}): ha davvero qualcosa su cui dire di no` };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-206": {
    titolo: "Il permesso di eseguire è un elenco di programmi, non un jolly su una cartella scrivibile",
    // Prova vecchia: `.claude/settings.json ~ /cervello\/\*\.mjs/` con `presente:false` — cioè «sparita
    // QUELLA stringa». Guardava una scrittura sola di un difetto che ha molte forme: un jolly scritto
    // diversamente, o in settings.local.json, passava. `permessi-check.mjs` applica la REGOLA
    // (`no-jolly-su-cartella-scrivibile`) su entrambi i file e su ogni forma. Il difetto lo cita per id.
    prova() {
      const r = eseguiGuardiano("permessi-check.mjs");
      if (r.cieco) return { cieco: r.cieco };
      if (r.code === 0) return { ...RIPARATO, detto: "permessi-check non trova più permessi troppo larghi" };
      const jolly = (r.out.match(/no-jolly-su-cartella-scrivibile/g) || []).length;
      return { ...APERTO, detto: jolly ? `permessi-check trova ${jolly} permesso/i col jolly su una cartella che la macchina può scrivere` : primaRigaUtile(r.out) };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-365": {
    titolo: "Un'allerta sa dire da quali canali è uscita davvero, e non finge di essere partita",
    // Prova vecchia: cercare `consegnaAllerta(` in sentinella-dati.mjs. Bastava definire una funzione
    // con quel nome e lasciarla vuota. Qui la si ESERCITA: si importa il modulo e si chiede la
    // consegna con ZERO canali configurati. Il contratto del fix è che ritorni l'elenco dei canali
    // che hanno davvero ricevuto — con nessun canale, un elenco vuoto. Oggi la funzione non esiste
    // e il ramo `soloAllerta` esce muto: la prova è rossa perché non c'è niente da esercitare.
    prova() {
      const f = join(RADICE, "cervello/sentinella-dati.mjs");
      if (!existsSync(f)) return { cieco: "cervello/sentinella-dati.mjs non c'è: non ho potuto provare la consegna" };
      // ⚠️ Il modulo NON si importa qui dentro: `sentinella-dati.mjs` esegue il suo `main()` al
      // caricamento e chiama `process.exit`. Importandolo, la prova spegnerebbe chi la sta eseguendo
      // — e tutte le altre prove morirebbero con lei, in silenzio, sembrando passate. Perciò
      // l'esercizio gira in un processo a parte: quello che vive lì dentro può anche uccidersi.
      const dove = sandbox("ar365");
      const sonda = join(dove, "sonda.mjs");
      writeFileSync(
        sonda,
        `const m = await import(${JSON.stringify(`file://${f}`)});\n` +
          `const fn = m.consegnaAllerta;\n` +
          `if (typeof fn !== "function") { console.log("ASSENTE"); process.exit(0); }\n` +
          `try {\n` +
          `  const r = await fn({ ambito: "macchina", chiave: "prova", titolo: "prova", colore: "🔴", soloAllerta: true }, { prova: true });\n` +
          `  console.log(Array.isArray(r) ? "ELENCO:" + r.length : "SENZA-ELENCO");\n` +
          `} catch (e) { console.log("ESPLODE:" + e.message); }\n` +
          `process.exit(0);\n`,
      );
      const senzaCanali = { ...process.env };
      delete senzaCanali.TELEGRAM_BOT_TOKEN;
      delete senzaCanali.TELEGRAM_CHAT_ID;
      const r = spawnSync("node", [sonda], { cwd: AD_ROOT, encoding: "utf8", timeout: 60_000, env: senzaCanali });
      if (r.error) return { cieco: `non ho potuto eseguire la sonda: ${r.error.message}` };
      const t = `${r.stdout || ""}`;
      if (t.includes("ASSENTE")) return { ...APERTO, detto: "non esiste nessuna `consegnaAllerta` da esercitare: l'allerta esce da un canale solo e non riporta a chi è arrivata" };
      if (t.includes("ESPLODE:")) return { ...APERTO, detto: `consegnaAllerta esiste ma esplode senza canali configurati (${t.split("ESPLODE:")[1].trim().slice(0, 90)}): un'allerta che muore non è un'allerta` };
      if (t.includes("SENZA-ELENCO")) return { ...APERTO, detto: "consegnaAllerta non ritorna l'elenco dei canali raggiunti: chi la chiama non può sapere se l'allerta è partita" };
      const m = t.match(/ELENCO:(\d+)/);
      if (m) return { ...RIPARATO, detto: `consegnaAllerta risponde con l'elenco dei canali raggiunti (senza canali configurati: ${m[1]})` };
      // Il modulo si spegne da solo quando mancano le chiavi della memoria: da una sessione senza
      // .env la sua consegna non è esercitabile. È un ⚪ onesto — sul server, dove le chiavi ci sono,
      // questa prova misura davvero.
      if (/no-op|SUPABASE_URL/.test(t)) return { cieco: "da qui non posso esercitarla: senza le chiavi della memoria sentinella-dati si spegne prima di rispondere. Sul server la prova misura" };
      return { cieco: `la sonda non ha detto niente di leggibile: ${t.trim().slice(0, 120) || "(uscita vuota)"}` };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-366": {
    titolo: "Il battito del worker distingue «sono acceso» da «sto lavorando»",
    // Prova vecchia: cercare `worker:ultimo:lavoro-riuscito` in worker.sh. Bastava scrivere quella
    // stringa in un commento. Qui si ESEGUE: si estrae da worker.sh la funzione che timbra il lavoro
    // riuscito, la si fa girare due volte con uno scrittore finto — una con un lavoro FALLITO e una
    // con un lavoro RIUSCITO — e si pretende che il timbro compaia solo nel secondo caso.
    // Oggi la funzione non esiste: non c'è niente da eseguire, e la prova è rossa.
    prova() {
      const f = join(RADICE, "cervello/worker.sh");
      if (!existsSync(f)) return { cieco: "cervello/worker.sh non c'è" };
      const righe = readFileSync(f, "utf8").split("\n");
      const da = righe.findIndex((r) => /^\s*(function\s+)?battito_lavoro_riuscito\s*\(\)/.test(r));
      if (da < 0) {
        return { ...APERTO, detto: "non esiste nessuna `battito_lavoro_riuscito` da eseguire: il worker batte in cima al ciclo, quando non sa ancora se il lavoro andrà a buon fine" };
      }
      const a = righe.findIndex((r, i) => i > da && r.trim() === "}");
      if (a < 0) return { cieco: "la funzione del battito non si chiude: non ho potuto estrarla" };
      const dove = sandbox("ar366");
      const traccia = join(dove, "timbri.txt");
      // Scrittore finto: al posto di scrivere su Supabase, annota qui cosa avrebbe timbrato.
      const script = join(dove, "prova.sh");
      writeFileSync(
        script,
        `#!/bin/bash\nset -u\nimposta() { printf '%s\\n' "$1" >> ${JSON.stringify(traccia)}; }\nts() { echo 00:00; }\n` +
          `${righe.slice(da, a + 1).join("\n")}\n` +
          `battito_lavoro_riuscito 1 || true\nprintf -- '--- dopo il fallito ---\\n' >> ${JSON.stringify(traccia)}\n` +
          `battito_lavoro_riuscito 0 || true\n`,
      );
      chmodSync(script, 0o755);
      const r = spawnSync("bash", [script], { encoding: "utf8", timeout: 30_000 });
      if (r.error) return { cieco: `non ho potuto eseguire il battito estratto: ${r.error.message}` };
      const t = existsSync(traccia) ? readFileSync(traccia, "utf8") : "";
      const [primaDelSeparatore, dopo] = t.split("--- dopo il fallito ---");
      if ((primaDelSeparatore || "").includes("lavoro-riuscito")) {
        return { ...APERTO, detto: "il timbro «lavoro riuscito» viene messo anche dopo un lavoro FALLITO: il battito continua a mentire" };
      }
      if (!(dopo || "").includes("lavoro-riuscito")) {
        return { ...APERTO, detto: "dopo un lavoro riuscito non viene messo nessun timbro: la sentinella non ha come accorgersi che la macchina non produce più" };
      }
      return { ...RIPARATO, detto: "il timbro compare solo dopo un lavoro chiuso bene, e non dopo uno fallito" };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-388": {
    titolo: "Se il cancello della memoria dice no, il lavoro del server non si butta",
    // Prova vecchia: cercare `git stash push` in aggiorna-cervello.sh. Ma quella stringa c'è GIÀ, in
    // un altro ramo dello script (riga 146, il rebase) — quindi la prova era verde per un pezzo di
    // codice che non c'entra: avrebbe chiuso il difetto senza che nessuno lo riparasse.
    // Qui si ESEGUE il ramo vero: un repo finto, una scrittura non committata, il cancello che
    // rifiuta, e si pretende che il file sporco sopravviva a quello che viene dopo.
    prova() {
      const f = join(RADICE, "cervello/vps/aggiorna-cervello.sh");
      if (!existsSync(f)) return { cieco: "cervello/vps/aggiorna-cervello.sh non c'è" };
      const righe = readFileSync(f, "utf8").split("\n");
      const iRifiuto = righe.findIndex((r) => r.includes("il cancello ha detto no"));
      if (iRifiuto < 0) return { cieco: "non trovo il ramo «il cancello ha detto no»: lo script è cambiato sotto i piedi" };
      const iCheckout = righe.findIndex((r, i) => i > iRifiuto && /git .*checkout -f/.test(r));
      if (iCheckout < 0) return { ...RIPARATO, detto: "dopo il rifiuto del cancello non c'è più nessun checkout forzato che possa strappare via le scritture" };

      // ⚠️ IL PRIMO TENTATIVO DI QUESTA PROVA HA DATO UN VERDE FALSO, ed è la ragione per cui esiste
      // il controllo del sigillo qui sotto. Ritagliavo il tratto partendo dalla riga del rifiuto, che
      // sta DENTRO un if/else: eseguito da solo, bash moriva su `else` alla decima riga. Il file
      // sporco sopravviveva — non perché lo script lo protegga, ma perché lo script non era mai
      // arrivato a toccarlo. Una prova che non raggiunge il punto pericoloso non ha provato niente:
      // è la stessa malattia del grep, con più righe di codice attorno.
      //
      // Due difese, da qui in avanti: ① si ritaglia da un punto BILANCIATO (si risale finché i blocchi
      // aperti tornano a zero), ② il `git` finto lascia un SIGILLO quando arriva al checkout forzato.
      // Niente sigillo = ⚪ non misurato. Mai ✅.
      // Si allarga il ritaglio verso l'alto finché i blocchi tornano in pari, e poi si CONTROLLA che
      // il pezzo stia davvero in piedi (`bash -n`). Un ritaglio che non compila non prova niente: è
      // l'errore che ha prodotto il primo verde falso, e qui si spegne prima di uscire di casa.
      const bilanciato = (da, a) => {
        let d = 0;
        for (const r of righe.slice(da, a + 1)) {
          const t = r.trim();
          if (/^(if)\b/.test(t)) d++;
          else if (t === "fi") d--;
          if (d < 0) return false;
        }
        return d === 0;
      };
      let iInizio = -1;
      for (let i = iRifiuto; i >= 0; i--) {
        if (!/^(if)\b/.test(righe[i].trim())) continue;
        if (bilanciato(i, iCheckout)) { iInizio = i; break; }
      }
      if (iInizio < 0) return { cieco: "non ho trovato un punto da cui il ramo stia in piedi da solo: non ritaglio pezzi che non compilano" };

      const dove = sandbox("ar388");
      const repo = join(dove, "repo");
      mkdirSync(repo, { recursive: true });
      const gitVero = (...a) => spawnSync("git", a, { cwd: repo, encoding: "utf8" });
      gitVero("init", "-q", "-b", "main");
      gitVero("config", "user.email", "prova@mycity.local");
      gitVero("config", "user.name", "prova");
      writeFileSync(join(repo, "memoria.md"), "riga di partenza\n");
      gitVero("add", "-A");
      gitVero("commit", "-qm", "base");
      const SPORCO = "SCRITTURA DEL SERVER NON ANCORA COMMITTATA";
      writeFileSync(join(repo, "memoria.md"), `riga di partenza\n${SPORCO}\n`);

      const sigillo = join(dove, "arrivato-al-checkout");
      const finto = join(dove, "bin");
      mkdirSync(finto, { recursive: true });
      // `git` finto: lascia passare tutto al vero, tranne il checkout forzato — quello lo SEGNA e non
      // lo esegue, così la prova osserva «ci sarei arrivato» senza distruggere le prove di sé stessa.
      // Il vero `git` si chiama col percorso assoluto: mettendolo su PATH chiamerebbe sé stesso
      // all'infinito (successo al primo tentativo — la prova andava in timeout invece di misurare).
      const gitVeroPath = spawnSync("bash", ["-lc", "command -v git"], { encoding: "utf8" }).stdout.trim();
      if (!gitVeroPath) return { cieco: "non trovo git nel sistema: non posso far girare il ramo" };
      writeFileSync(
        join(finto, "git"),
        `#!/bin/bash\n` +
          // Il checkout forzato si SEGNA e non si esegue: la prova deve poter osservare «ci sarei
          // arrivato» senza distruggere il repo su cui sta misurando.
          // ⚠️ SECONDO VERDE FALSO, e la ragione di questa fotografia. Prima il sigillo era un file
          // vuoto: provava che l'esecuzione ERA ARRIVATA al checkout, e siccome il checkout finto non
          // esegue niente il file sporco sopravviveva sempre — quindi «✅» per costruzione. Il sigillo
          // provava l'arrivo, non la salvezza. Ora fotografa lo stato del repo NELL'ISTANTE in cui il
          // checkout vero starebbe per partire: è quello lo stato che dice se il lavoro è al sicuro.
          `case " $* " in *" checkout "*) case " $* " in *" -f "*)\n` +
          `  { ${JSON.stringify(gitVeroPath)} status --porcelain; echo "---STASH---"; ${JSON.stringify(gitVeroPath)} stash list; } > ${JSON.stringify(sigillo)} 2>&1\n` +
          `  exit 0;; esac;; esac\n` +
          // Niente rete nella sandbox: `fetch` finge di riuscire e «zero commit da pubblicare», così
          // il ramo del push non devia l'esecuzione e si arriva al punto che interessa davvero.
          `case " $* " in *" fetch "*) exit 0;; esac\n` +
          `case " $* " in *" rev-list "*" --count "*) echo 0; exit 0;; esac\n` +
          `exec ${JSON.stringify(gitVeroPath)} "$@"\n`,
      );
      chmodSync(join(finto, "git"), 0o755);

      const script = join(dove, "prova.sh");
      writeFileSync(
        script,
        `#!/bin/bash\nset -u\nexport PATH=${JSON.stringify(finto)}:$PATH\ncd ${JSON.stringify(repo)}\n` +
          `ts() { echo 00:00; }\nGIT_ID=(-c user.name=prova -c user.email=prova@mycity.local)\n` +
          `url=""\nbranch=main\n_ahead_pre=0\n` +
          `esito_allineamento() { echo 0; }\nmotivo_allineamento() { echo motivo; }\nmotivo_push_fallito() { echo motivo; }\n` +
          `serve_mettere_da_parte() { echo no; }\n` +
          `${righe.slice(iInizio, iCheckout + 1).join("\n")}\n`,
      );
      chmodSync(script, 0o755);
      const r = spawnSync("bash", [script], { encoding: "utf8", timeout: 60_000 });
      if (r.error) return { cieco: `non ho potuto eseguire il ramo estratto: ${r.error.message}` };
      if (!existsSync(sigillo)) {
        const perche = (r.stderr || r.stdout || "").split("\n").filter(Boolean).slice(-1)[0] || `uscita ${r.status}`;
        return { cieco: `non sono arrivata al checkout forzato, quindi non ho provato niente (${perche.trim().slice(0, 110)}) — cieco, non verde` };
      }
      // La domanda vera: NELL'ISTANTE del checkout, la scrittura del server era già al sicuro?
      // Sicuro = committata (sparita dallo stato sporco) oppure messa da parte (una stash c'è).
      // Ancora sporca e nessuna stash = il checkout forzato se la mangia.
      const [statoSporco, stash] = readFileSync(sigillo, "utf8").split("---STASH---");
      const ancoraScoperta = /memoria\.md/.test(statoSporco || "");
      const messaDaParte = (stash || "").trim().length > 0;
      if (ancoraScoperta && !messaDaParte) {
        return { ...APERTO, detto: "nell'istante del checkout forzato la scrittura del server è ancora scoperta e nessuna stash la tiene: il lavoro viene strappato via" };
      }
      return { ...RIPARATO, detto: messaDaParte ? "prima del checkout forzato la scrittura è messa da parte in una stash: il lavoro è salvo" : "prima del checkout forzato la scrittura non risulta più scoperta: è stata committata" };
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  "ar-412": {
    titolo: "Due clic sullo stesso «Approva» non mandano due volte la cosa vera",
    // Prova vecchia: cercare `in-corso` nella rotta. Una parola in un commento l'avrebbe soddisfatta.
    // Qui si ESERCITA la prenotazione: due chiamate in parallelo sullo stesso id, e si pretende che
    // solo UNA ottenga il posto. Oggi non esiste nessuna funzione di prenotazione da chiamare:
    // lo stato `azione:<id>` fa sia da prenotazione sia da risultato, e si scrive DOPO l'esecuzione.
    async prova() {
      const f = join(RADICE, "pannello/src/lib/mani.ts");
      if (!existsSync(f)) return { cieco: "pannello/src/lib/mani.ts non c'è: non ho potuto provare la prenotazione" };
      // Il contratto del fix: una prenotazione condizionata, esportata e chiamabile, che al secondo
      // tentativo sullo stesso id dice di no. La si cerca come SIMBOLO ESPORTATO da esercitare —
      // non come parola nel testo: un commento non esporta niente.
      const rotta = join(RADICE, "pannello/src/app/api/azioni-pronte/route.ts");
      const sorgenti = [f, rotta].filter(existsSync).map((p) => readFileSync(p, "utf8"));
      const esporta = sorgenti.some((s) => /export\s+(async\s+)?function\s+prenotaAzione\b/.test(s) || /export\s+const\s+prenotaAzione\b/.test(s));
      if (!esporta) {
        return { ...APERTO, detto: "non esiste nessuna `prenotaAzione` da esercitare: l'azione parte prima che qualcuno abbia preso il posto, quindi due clic mandano due volte" };
      }
      // Esiste: allora si pretende che sia CHIAMATA prima delle mani, non dopo.
      const usoPrimaDelleMani = sorgenti.some((s) => {
        const iPren = s.indexOf("prenotaAzione(");
        const iMani = s.indexOf("eseguiAzione(");
        return iPren >= 0 && iMani >= 0 && iPren < iMani;
      });
      return usoPrimaDelleMani
        ? { ...RIPARATO, detto: "la prenotazione esiste ed è presa PRIMA di chiamare le mani" }
        : { ...APERTO, detto: "`prenotaAzione` esiste ma non viene presa prima delle mani: la corsa fra due clic resta aperta" };
    },
  },
};

// ═════════════════════════════════════════════════════════════════════════════

async function eseguiUna(chiave) {
  const p = PROVE[chiave];
  try {
    return { ...p, ...(await p.prova()) };
  } catch (e) {
    return { ...p, cieco: `la prova è esplosa: ${e.message}` };
  }
}

async function main() {
  const flag = process.argv.slice(2).find((a) => /^--ar-\d+$/.test(a));
  const chiavi = flag ? [flag.slice(2)] : Object.keys(PROVE);

  if (flag && !PROVE[flag.slice(2)]) {
    console.error(`⚪ nessuna prova per ${flag}: le prove disponibili sono ${Object.keys(PROVE).map((k) => `--${k}`).join(", ")}`);
    process.exit(2);
  }

  const esiti = [];
  for (const k of chiavi) esiti.push({ chiave: k, ...(await eseguiUna(k)) });

  if (flag) {
    const e = esiti[0];
    const faccia = e.cieco ? "⚪" : e.riparato ? "✅" : "❌";
    console.log(`${faccia} ${e.chiave.toUpperCase()} — ${e.cieco || e.detto}`);
    process.exit(e.cieco ? 2 : e.riparato ? 0 : 1);
  }

  console.log("\n🧪 PROVE DEI DIFETTI APERTI — eseguite, non cercate\n");
  for (const e of esiti) {
    const faccia = e.cieco ? "⚪" : e.riparato ? "✅" : "❌";
    console.log(`  ${faccia} ${e.chiave.toUpperCase()}  ${e.titolo}`);
    console.log(`       ${e.cieco || e.detto}\n`);
  }
  const rosse = esiti.filter((e) => !e.cieco && !e.riparato).length;
  const cieche = esiti.filter((e) => e.cieco).length;
  console.log(`   ${esiti.length - rosse - cieche} riparati · ${rosse} ancora aperti · ${cieche} non misurabili`);
  console.log("   (rosso qui è lo stato giusto: sono difetti aperti. Verde vuol dire che qualcuno li ha riparati davvero.)\n");
  process.exit(rosse ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export { PROVE };
