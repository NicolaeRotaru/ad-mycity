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
// LE PROVE
// ═════════════════════════════════════════════════════════════════════════════

const PROVE = {
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
