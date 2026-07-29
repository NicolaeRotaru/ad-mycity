#!/usr/bin/env node
// Lotto 33 — le prove dei difetti APPLICATI, eseguite sui guardiani veri e sul repo vero.
//
// `perimetro-derivato.test.mjs` prova il modulo su alberi finti: serve a fissare la regola. Questo
// file prova l'altra metà, che è quella che i difetti chiedevano davvero — **il punto malato chiama
// il modulo?** Un modulo giusto che nessuno usa è la forma di lavoro finito che questo cantiere ha
// già pagato più volte (AR-407: «le medicine si scrivono e non si somministrano»).
//
// Difetti coperti, per nome: AR-373, AR-377, AR-379, AR-380, AR-381, AR-382, AR-387.
// (AR-409 e AR-226 stanno in pannello-serratura.test.mjs, dove c'è la serratura.)

import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const leggi = (p) => readFileSync(join(REPO, p), "utf8");

// ⚠️ Il metro deve poter FALLIRE, anche sui casi asincroni.
// La prima stesura di questo file chiamava `fn()` senza aspettarlo: un caso `async` restituiva una
// promessa, il try/catch non ne vedeva mai il rifiuto, e il caso risultava PASSATO qualunque cosa
// asserisse. Se ne è accorta la prova di non-vacuità (rompi il fix, il test deve diventare rosso):
// quattro casi restavano verdi col fix rotto. Un metro che non può dire di no è la stessa malattia
// del lotto, un piano più in basso.
const casi = [];
const daFare = [];
const prova = (nome, fn) => {
  daFare.push(async () => {
    try {
      await fn();
      casi.push({ nome, ok: true });
    } catch (e) {
      casi.push({ nome, ok: false, err: e.message });
    }
  });
};

/** Come `guardiano`, ma con un ambiente su misura (per puntare a un finto Supabase locale). */
function guardianoConEnv(script, env, args = []) {
  try {
    return {
      rc: 0,
      out: execFileSync(process.execPath, [join(REPO, "cervello", script), ...args], {
        encoding: "utf8",
        cwd: REPO,
        stdio: "pipe",
        env: { ...process.env, ...env },
      }),
    };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

/** Esegue un guardiano vero e torna { rc, out }. Il rc conta: 2 è «cieco», non «verde». */
function guardiano(script, args = []) {
  try {
    const out = execFileSync(process.execPath, [join(REPO, "cervello", script), ...args], {
      encoding: "utf8",
      cwd: REPO,
      stdio: "pipe",
    });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

// ───────────────────────── AR-382 — le porte di pubblicazione ─────────────────────────

prova("AR-382 — il guardiano delle porte entra nella cartella del server", () => {
  const { rc, out } = guardiano("porte-check.mjs");
  assert.equal(rc, 0, `porte scoperte:\n${out}`);
  assert.match(out, /vps\/aggiorna-cervello\.sh/, "vps/ deve stare NEL perimetro, non fuori");
  // Il numero è la prova che il perimetro si è allargato davvero: prima ne vedeva 5, tutte di primo
  // livello. Se qualcuno tornasse a leggere una cartella sola, questo scende e il caso si accende.
  const trovate = Number(out.match(/(\d+) trovate/)?.[1] || 0);
  assert.ok(trovate >= 8, `solo ${trovate} porte viste: il perimetro si è ristretto di nuovo`);
});

prova("AR-382 — un push scritto in JavaScript conta come porta quanto uno scritto in shell", async () => {
  const { porteDi } = await import(join(REPO, "cervello/porte-pubblicazione.mjs"));
  // È il buco che si sarebbe aperto aggiungendo i .mjs al perimetro senza estendere la definizione:
  // una zona non guardata sarebbe diventata un VERDE, che è peggio del buco.
  assert.equal(porteDi(`execSync("git push origin main");`, "x.mjs").length, 1);
  assert.equal(porteDi(`execFileSync("git", ["push", "origin", "main"]);`, "x.mjs").length, 1);
  // …e la documentazione non è codice: un metro che accusa chi spiega la regola insegna a non spiegarla.
  assert.equal(porteDi(`// esempio: execSync("git push origin main")`, "x.mjs").length, 0);
  assert.equal(porteDi(` * execSync("git push origin main")`, "x.mjs").length, 0);
});

// ───────────────────────── AR-381 — le uscite verso il mondo ─────────────────────────

prova("AR-381 — le otto mani dei publisher sono contate come mani", () => {
  const { rc, out } = guardiano("uscite-check.mjs");
  assert.equal(rc, 0, `uscite scoperte:\n${out}`);
  for (const m of ["publishers/_comune.mjs", "publishers/facebook.mjs", "publishers/gbp.mjs"]) {
    assert.ok(out.includes(m), `${m} non è nel perimetro: pubblica e nessuno lo conta`);
  }
});

prova("AR-381 — il cancello al collo di bottiglia FERMA davvero l'invio (non solo lo nomina)", async () => {
  // Prova a RUNTIME, non una parola cercata in un file: si alza un finto mondo esterno e si conta
  // quante richieste ci arrivano. La prima stesura di questo caso leggeva il testo di `_comune.mjs`
  // e cercava «pausaAttiva()» — e restava verde anche togliendo la chiamata, perché quel testo
  // compare pure nel commento che la spiega. Se n'è accorta la prova di non-vacuità.
  const { createServer } = await import("node:http");
  let arrivate = 0;
  const mondo = createServer((_req, res) => {
    arrivate++;
    res.writeHead(200, { "content-type": "application/json" });
    res.end("{}");
  });
  await new Promise((ok) => mondo.listen(0, "127.0.0.1", ok));
  const url = `http://127.0.0.1:${mondo.address().port}/pubblica`;
  try {
    // ① In dry-run (AUTOPILOT_LIVE non impostato) non deve uscire niente.
    process.env.AUTOPILOT_LIVE = "";
    const { postJSON } = await import(`${join(REPO, "cervello/publishers/_comune.mjs")}?dry`);
    const r1 = await postJSON(url, {}, { testo: "ciao" });
    assert.equal(r1.bloccato, true, "in dry-run non deve partire niente");
    assert.equal(arrivate, 0, "è uscita una richiesta vera in dry-run");

    // ② In LIVE ma senza poter verificare la PAUSA (niente Supabase) deve restare fail-CLOSED:
    //    un cancello che si apre quando non riesce a misurare non è un cancello.
    process.env.AUTOPILOT_LIVE = "1";
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
    const { postJSON: postLive } = await import(`${join(REPO, "cervello/publishers/_comune.mjs")}?live`);
    const r2 = await postLive(url, {}, { testo: "ciao" });
    assert.equal(r2.bloccato, true, "PAUSA non verificabile deve BLOCCARE, non lasciar passare");
    assert.match(String(r2.text), /cancello/, "il rifiuto deve dire perché");
    assert.equal(arrivate, 0, "è uscita una richiesta vera col cancello chiuso");
  } finally {
    delete process.env.AUTOPILOT_LIVE;
    mondo.close();
  }
});

prova("AR-381 — ogni uscita è dichiarata: cancello, oppure esenzione col perché", () => {
  const reg = JSON.parse(leggi("cervello/uscite-reali.json"));
  const comuneVoce = reg.uscite.find((u) => u.file === "cervello/publishers/_comune.mjs");
  assert.equal(comuneVoce?.cancello, "consenso", "il collo di bottiglia deve avere il cancello");
  for (const u of reg.uscite) {
    if (u.cancello === "non-serve") assert.ok(String(u.perche || "").length >= 40, `${u.file}: esenzione senza un perché`);
  }
});

// ───────────────────────── AR-380 — il confine della firma ─────────────────────────

prova("AR-380 — il guardiano della firma legge anche gli script del server", () => {
  const { rc, out } = guardiano("firma-check.mjs");
  assert.equal(rc, 0, `confine violato:\n${out}`);
  const letti = Number(out.match(/\((\d+) script letti\)/)?.[1] || 0);
  assert.ok(letti > 120, `solo ${letti} script letti: il perimetro è tornato a una cartella sola`);
});

prova("AR-380 — una scrittura fatta con curl è una scrittura quanto una fatta con fetch", async () => {
  const { scriveImpostazioni, difettiFirma } = await import(join(REPO, "cervello/firma-riservata.mjs"));
  const conCurl = [
    'curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" \\',
    '  -H "apikey: $SUPABASE_SERVICE_KEY" \\',
    '  -d "{\\"chiave\\":\\"worker:ultimo\\"}"',
  ].join("\n");
  assert.equal(scriveImpostazioni(conCurl), true, "il curl scrive: prima era invisibile");

  // Una LETTURA seguita da una scrittura non deve contare come scrittura: era il rischio della
  // finestra fissa a sei righe, e per questo il comando si delimita col `\` di continuazione.
  const soloLettura = [
    'pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa" \\',
    '  -H "apikey: $KEY")"',
    "",
    'curl -X POST "$ALTRO_URL/rest/v1/altro" -d "{}"',
  ].join("\n");
  assert.equal(scriveImpostazioni(soloLettura), false, "una lettura non è una scrittura");

  // Una chiave costruita da variabile non è verificabile: «non lo so» non è «va bene».
  const daVariabile = `${conCurl}\nCHIAVI_SCRITTE = ["\${_chiave}"]`;
  assert.ok(
    difettiFirma(daVariabile, "x.sh").some((d) => d.difetto === "chiave_non_verificabile"),
    "una chiave da variabile va rifiutata a priori",
  );
});

prova("AR-380 — i tre script shell che scrivono in quella tabella ora dichiarano cosa toccano", () => {
  for (const f of ["cervello/worker.sh", "cervello/giro.sh", "cervello/vps/watch-main.sh"]) {
    assert.match(leggi(f), /CHIAVI_SCRITTE\s*=\s*\[/, `${f} scrive su impostazioni senza dichiarare le chiavi`);
  }
});

// ───────────────────────── AR-373 — il battito atteso ─────────────────────────

prova("AR-373 — il battito che il meta-guardiano aspettava da sempre adesso ARRIVA", async () => {
  // Anche qui a runtime. Cercare la riga nel file non basta: `if (false) await stampSegnale(…)`
  // supererebbe una ricerca di testo e non manderebbe niente. Qui si esegue davvero
  // `coerenza-fatti.mjs` contro un finto Supabase e si guarda cosa BUSSA alla porta.
  const { createServer } = await import("node:http");
  const scritte = [];
  const supabase = createServer((req, res) => {
    let corpo = "";
    req.on("data", (d) => (corpo += d));
    req.on("end", () => {
      if (req.method === "POST") scritte.push(corpo);
      res.writeHead(200, { "content-type": "application/json" });
      res.end("[]");
    });
  });
  await new Promise((ok) => supabase.listen(0, "127.0.0.1", ok));
  try {
    // ⚠️ ASINCRONO, obbligatoriamente. Con `execFileSync` il processo che ospita il finto Supabase
    // resta bloccato dentro la chiamata e non può rispondere: il figlio aspetta una risposta che
    // non arriverà mai, e il test si impianta. Non era un difetto del codice, era del metro.
    await new Promise((fine, errore) => {
      const p = spawn(process.execPath, [join(REPO, "cervello/coerenza-fatti.mjs")], {
        cwd: REPO,
        stdio: "ignore",
        env: {
          ...process.env,
          SUPABASE_URL: `http://127.0.0.1:${supabase.address().port}`,
          SUPABASE_SERVICE_KEY: "finta-per-il-test",
        },
      });
      const sveglia = setTimeout(() => {
        p.kill("SIGKILL");
        errore(new Error("coerenza-fatti.mjs non è tornato entro 30s"));
      }, 30_000);
      p.on("close", () => {
        clearTimeout(sveglia);
        fine();
      });
    });
    assert.ok(
      scritte.some((c) => c.includes("coerenza-fatti")),
      `nessun battito «coerenza-fatti» è arrivato: il meta-guardiano continuerebbe a suonare a vuoto (ricevute: ${scritte.length})`,
    );
  } finally {
    supabase.close();
  }
});

prova("AR-373 — l'elenco degli attesi è derivato dal codice, e ci trova dentro coerenza-fatti", async () => {
  const { attesiDaGiro, scriptInvocati } = await import(join(REPO, "cervello/segnali-attesi.mjs"));
  const giro = leggi("cervello/giro.sh");
  assert.ok(scriptInvocati(giro).length > 20, "il giro invoca decine di script: derivarli è il punto");
  const { attesi, nonLetti } = attesiDaGiro(giro, (n) => {
    try {
      return leggi(`cervello/${n}`);
    } catch {
      return null;
    }
  });
  assert.deepEqual(nonLetti, [], "uno script non letto non è uno script senza battiti");
  assert.ok(attesi.includes("coerenza-fatti"), "l'attesa deve essere VERA, non scritta a mano");
  assert.ok(attesi.length > 8, `derivati solo ${attesi.length}: la lista è tornata a mano`);
  // Nessun fantasma: ogni atteso è emesso da qualcuno. È la proprietà per cui il difetto esisteva.
  const emessi = new Set(attesi);
  assert.equal(emessi.size, attesi.length);
});

// ───────────────────────── AR-379 / AR-387 — i vincoli del giro ─────────────────────────

prova("AR-379/AR-387 — ogni variabile di vincolo entra nel conteggio, perché il conteggio la chiede alla shell", () => {
  const src = leggi("cervello/giro.sh");
  assert.match(src, /compgen -v[^\n]*_VINCOLO/, "l'elenco va derivato");
  assert.ok(!/for _vnome in [A-Z_ ]+; do/.test(src), "l'enumerazione a mano non deve tornare");

  // La prova che conta è comportamentale: si ESEGUE il blocco vero in una bash pulita, con due
  // vincoli accesi di cui uno che la vecchia lista NON conteneva (FIRMA).
  const script = `
    set -uo pipefail
    SENSORI_VINCOLO=""; FIRMA_VINCOLO="rosso"; PORTE_VINCOLO="rosso"; NUOVO_DI_DOMANI_VINCOLO="rosso"
    declare -A VINCOLI_ESCLUSI=()
    VINCOLI_ATTIVI=()
    for _vvar in $(compgen -v | grep -E '_VINCOLO$' | sort); do
      _vnome="\${_vvar%_VINCOLO}"
      if [ -n "\${VINCOLI_ESCLUSI[$_vnome]:-}" ]; then continue; fi
      eval "_vval=\\"\\\${\${_vvar}:-}\\""
      [ -n "$_vval" ] && VINCOLI_ATTIVI+=("$_vnome")
    done
    echo "\${#VINCOLI_ATTIVI[@]}:\${VINCOLI_ATTIVI[*]}"
  `;
  const out = execFileSync("bash", ["-c", script], { encoding: "utf8" }).trim();
  assert.equal(out, "3:FIRMA NUOVO_DI_DOMANI PORTE", `conteggio sbagliato: ${out}`);
});

prova("AR-387 — il rilevatore dei guardiani non esce più verde quando vede un allarme che non conta", async () => {
  const { codiceUscita } = await import(join(REPO, "cervello/censimento-guardiani.mjs"));
  assert.equal(codiceUscita({ nonContati: ["firma-check"] }), 1, "vederlo e non contarlo era il difetto");
  assert.equal(codiceUscita({}), 0);
});

// ───────────────────────── AR-377 — un esecutore che non è il giro ─────────────────────────

prova("AR-377 — i test del cervello li lancia anche qualcuno che non è il giro", () => {
  const dir = join(REPO, ".github", "workflows");
  assert.ok(existsSync(dir), "senza workflow non esiste nessun secondo esecutore");
  const testo = leggi(".github/workflows/test-cervello.yml");
  assert.match(testo, /node cervello\/test-cervello\.mjs/, "deve eseguire la suite, non nominarla");

  // Il punto del difetto non è «esiste un workflow»: è che scatti quando il CODICE cambia, non solo
  // quando qualcuno apre una PR. Il push diretto su main è la strada che questa macchina usa ogni
  // giorno dal VPS, ed era completamente scoperta.
  const prima = testo.slice(0, testo.indexOf("jobs:"));
  assert.match(prima, /^\s*push:/m, "deve girare sui push, non solo sulle PR");
  assert.match(prima, /cervello\/\*\*/, "un cambio nel cervello deve farlo partire");

  // …e non deve dipendere dal VPS: se girasse là dentro, erediterebbe di nuovo l'uptime del giro.
  assert.ok(!/self-hosted/.test(testo), "un guardiano che gira sulla macchina che sorveglia non sorveglia niente");
});

for (const eseguo of daFare) await eseguo();

let ko = 0;
for (const c of casi) {
  console.log(`  ${c.ok ? "ok" : "NOT ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) ko++;
}
console.log(`# pass ${casi.length - ko}\n# fail ${ko}`);
process.exit(ko ? 1 : 0);
