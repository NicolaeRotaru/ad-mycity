#!/usr/bin/env node
// AR-278 + AR-428 — «Il token di GitHub e la chiave che apre in scrittura la memoria viaggiano
// dentro la riga di comando, dove qualsiasi processo della macchina li può leggere».
//
// IL CASO CHE HA ROTTO. In dodici punti fra giro.sh e worker.sh:
//     git fetch "https://x-access-token:${GIT_PUSH_TOKEN}@github.com/…"
//     curl -H "apikey: $SUPABASE_SERVICE_KEY" …
// Su Linux gli argomenti di un processo sono leggibili da chiunque giri sulla macchina (`ps aux`,
// /proc/PID/cmdline). E non è una chiave di sola lettura: è quella con cui si SCRIVE la tabella
// `impostazioni`, dove vive il kill-switch della pausa.
// La causa non è la disattenzione: la regola sui segreti era scritta in NEGATIVO, per casi già visti
// («non committare .env», «non stampare token»), e la riga di comando non era nell'elenco. Quello
// che non è nell'elenco non è coperto.
//
// La prova guarda dentro gli ARGOMENTI VERI con cui git e curl vengono chiamati, usando un comando
// spia al loro posto. Poi verifica che il guardiano che impedisce al dodicesimo punto di nascere
// diventi rosso davanti a una violazione nuova.

import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ok, titolo, finisci, sandbox, comandoSpia, RADICE } from "./c4-banco.mjs";

const TOKEN = "ghs_TOKENFINTOchenondeveuscire123";
const CHIAVE = "eyJCHIAVEFINTAdiservizio.chenondeveuscire.456";

// ── ① git: il token non è più nell'indirizzo, e il canale che lo sostituisce funziona ────────────
titolo("AR-278 · il token di GitHub non passa più dagli argomenti di git");

const dove = sandbox("segreti");
const spia = comandoSpia(dove, "git");
const r = spawnSync(
  "bash",
  [
    "-c",
    `. "${join(RADICE, "cervello/c4-segreti.sh")}"\n` +
      `c4_git_prepara\n` +
      `git "\${C4_GIT_OPZ[@]}" ls-remote "$(c4_git_url)" HEAD\n` +
      `git "\${C4_GIT_OPZ[@]}" fetch "$(c4_git_url)" main\n` +
      `printf '%s' "$GIT_ASKPASS" > askpass-path\n` +
      `"$GIT_ASKPASS" > askpass-risposta\n`,
  ],
  {
    cwd: dove,
    encoding: "utf8",
    env: { ...process.env, PATH: `${spia.bin}:${process.env.PATH}`, GIT_PUSH_TOKEN: TOKEN, GIT_REPO: "NicolaeRotaru/ad-mycity" },
  },
);

const argv = existsSync(spia.log) ? readFileSync(spia.log, "utf8") : "";
ok(argv.length > 0, "AR-278: ho potuto guardare dentro gli argomenti veri di git", `git non è stato chiamato.\n${r.stderr}`);
ok(
  !argv.includes(TOKEN),
  "AR-278 · IL CASO CHE HA ROTTO: il token NON compare fra gli argomenti di git (prima era dentro l'indirizzo)",
  `argomenti visti: ${argv}`,
);
ok(
  /github\.com\/NicolaeRotaru\/ad-mycity\.git/.test(argv),
  "AR-278: e l'indirizzo del repo resta quello giusto (il fix non ha rotto la destinazione)",
  argv,
);
const risposta = existsSync(join(dove, "askpass-risposta")) ? readFileSync(join(dove, "askpass-risposta"), "utf8").trim() : "";
ok(
  risposta === TOKEN,
  "AR-278: il canale che lo sostituisce funziona davvero — git chiede la password e il programma askpass gliela dà DALL'AMBIENTE",
  `askpass ha risposto «${risposta}» (atteso il token)`,
);

// ── ② curl: le intestazioni autenticate non sono più argomenti ───────────────────────────────────
titolo("AR-428 · la chiave della memoria non passa più dagli argomenti di curl");

const dove2 = sandbox("segreti-curl");
const spia2 = comandoSpia(dove2, "curl");
const r2 = spawnSync(
  "bash",
  [
    "-c",
    `. "${join(RADICE, "cervello/c4-segreti.sh")}"\n` +
      `c4_curl_prepara || { echo "PREPARA-FALLITA"; exit 3; }\n` +
      `curl -fsS "https://memoria.example/rest/v1/impostazioni?select=valore" "\${C4_CURL_AUTH[@]}"\n` +
      `printf '%s' "$C4_CURL_CFG" > cfg-path\n`,
  ],
  { cwd: dove2, encoding: "utf8", env: { ...process.env, PATH: `${spia2.bin}:${process.env.PATH}`, SUPABASE_SERVICE_KEY: CHIAVE } },
);

const argv2 = existsSync(spia2.log) ? readFileSync(spia2.log, "utf8") : "";
ok(argv2.length > 0, "AR-428: ho potuto guardare dentro gli argomenti veri di curl", `curl non è stato chiamato.\n${r2.stderr}`);
ok(
  !argv2.includes(CHIAVE),
  "AR-428 · IL CASO CHE HA ROTTO: la chiave di servizio NON compare fra gli argomenti di curl",
  `argomenti visti: ${argv2}`,
);
ok(/--config/.test(argv2), "AR-428: al suo posto c'è il rimando al file di configurazione", argv2);

const cfgPath = existsSync(join(dove2, "cfg-path")) ? readFileSync(join(dove2, "cfg-path"), "utf8") : "";
ok(cfgPath.length > 0 && existsSync(cfgPath), "AR-428: il file di configurazione esiste davvero", cfgPath);
if (cfgPath && existsSync(cfgPath)) {
  const contenuto = readFileSync(cfgPath, "utf8");
  ok(
    contenuto.includes(`apikey: ${CHIAVE}`) && contenuto.includes(`Bearer ${CHIAVE}`),
    "AR-428: e contiene le due intestazioni giuste — il canale funziona, non si è solo tolto qualcosa",
    contenuto.replace(CHIAVE, "…"),
  );
  const modo = statSync(cfgPath).mode & 0o777;
  ok(
    modo === 0o600,
    "AR-428: leggibile SOLO da noi (600). Gli argomenti invece li legge chiunque, subito, senza permessi",
    `permessi = ${modo.toString(8)}`,
  );
}

// ── ③ il guardiano che impedisce al dodicesimo punto di nascere ─────────────────────────────────
titolo("AR-278 / AR-428 · il guardiano che impedisce al prossimo punto di nascere");

function guardiano(radice) {
  const g = spawnSync("node", [join(RADICE, "cervello/c4-cancelli.mjs"), "segreti-argomenti", `--radice=${radice}`], {
    encoding: "utf8",
  });
  return { rc: g.status, out: `${g.stdout}${g.stderr}` };
}

const veroRepo = guardiano(RADICE);
ok(
  veroRepo.rc === 0,
  "AR-278/AR-428: sul repo vero il guardiano passa — i punti bonificati sono bonificati e il resto è debito DICHIARATO col perché",
  veroRepo.out,
);
ok(
  /debito dichiarato/.test(veroRepo.out),
  "e il debito che resta è scritto, non nascosto: si vede quali file aspettano ancora la stessa cura",
  veroRepo.out,
);

// Il dodicesimo punto che prova a nascere: uno script nuovo che rimette la chiave in un argomento.
const finto = sandbox("dodicesimo");
mkdirSync(join(finto, "cervello"), { recursive: true });
writeFileSync(
  join(finto, "cervello/nuovo-strumento.sh"),
  `#!/usr/bin/env bash\ncurl -fsS "$SUPABASE_URL/rest/v1/lavori" -H "apikey: $SUPABASE_SERVICE_KEY"\n`,
);
const nato = guardiano(finto);
ok(
  nato.rc === 1,
  "AR-428 · LA PROVA CHE SERVE DAVVERO: uno script NUOVO che rimette un segreto negli argomenti fa fallire il guardiano",
  nato.out,
);
ok(
  /nuovo-strumento\.sh:2/.test(nato.out),
  "e dice esattamente dove, riga per riga (chi lo legge deve poterlo riparare, non cercarlo)",
  nato.out,
);

// Un conteggio di token che finisce per «TOKEN» non è un segreto: un guardiano che grida a vuoto
// è un guardiano che poi nessuno legge.
const innocuo = sandbox("innocuo");
mkdirSync(join(innocuo, "cervello"), { recursive: true });
writeFileSync(
  join(innocuo, "cervello/conta.sh"),
  `#!/usr/bin/env bash\nnode cervello/costo-ai.mjs --tipo=giro --token="$GIRO_TOKEN" --modello=claude\n`,
);
ok(guardiano(innocuo).rc === 0, "AR-428: e non grida su «$GIRO_TOKEN», che è un CONTEGGIO di token, non una chiave");

finisci("AR-278 / AR-428 — i segreti vivono solo nell'ambiente del processo");
