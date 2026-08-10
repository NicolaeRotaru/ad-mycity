#!/usr/bin/env node
// 🗓️ LA DATA SUI PIANI — da quanto è fermo ogni piano, misurato da git e scritto sul piano stesso.
//
// PERCHÉ ESISTE (Nicola, 2026-08-10: «guarda tutti i piani — 1) non sono stati aggiornati
// 2) aggiungi la data con l'ultima volta in cui sono stati aggiornati»).
//
// I dieci piani in `MyCity-Vault/06-Piani/` non portavano addosso nessuna data. Per sapere se un
// piano era vivo o fermo da un mese bisognava aprire git — cioè nessuno lo sapeva, e infatti nove
// piani su dieci non erano più stati rivisti dal giorno in cui erano nati, a fine giugno.
//
// LA TRAPPOLA CHE QUESTO FILE EVITA. La domanda «quando è stato aggiornato?» ha DUE risposte
// diverse, e prendere la prima per la seconda è il modo di dire una bugia con un numero vero:
//   · il file è stato TOCCATO — il giro dell'AD rigenera in fondo a sei piani il blocco
//     `AD-AGGIORNAMENTO`, e ogni rigenerazione è un commit sul file;
//   · il PIANO è stato rivisto — cioè è cambiato il testo che ha scritto Nicola.
// Misurato il 10/8: il Piano Operativo aveva 22 commit e sembrava vivissimo; il suo testo non
// cambiava dal 25/6. Quindi qui si misura il CORPO, togliendo i blocchi che si rigenerano da soli.
//
// L'ALTRA TRAPPOLA (AR-419, `storia-git.mjs`). «Quando è cambiato questo file l'ultima volta?» è una
// domanda sulla STORIA. In un clone superficiale — la forma normale del repo dentro un cloud agent —
// il commit di innesto non ha genitori, quindi git presenta tutto il suo albero come appena
// cambiato: ogni piano risulterebbe aggiornato al giorno dell'innesto. Provato il 10/8 in questa
// sessione: prima di `git fetch --unshallow` tutti e undici i file dicevano «2026-08-09 18:20»,
// cioè il clone, non il piano. Perciò, se la storia non è intera, questo script dice **cieco** ed
// esce 2: una data sbagliata sul piano sarebbe peggio di nessuna data.
//
// Uso:
//   node cervello/piani-data.mjs              # report: da quanto è fermo ogni piano
//   node cervello/piani-data.mjs --scrivi     # scrive/aggiorna la riga della data su ogni piano
//   node cervello/piani-data.mjs --controlla  # esce 1 se una riga manca o non dice la verità
//   node cervello/piani-data.mjs --json       # per gli script
//
// Uscita (contratto guardiani, AR-322):
//   0 = misurato · 1 = una riga manca o mente (solo con --controlla) · 2 = non ho potuto misurare

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { storiaDelRepo } from "./storia-git.mjs";

const CARTELLA = "MyCity-Vault/06-Piani";
const JSON_MODE = process.argv.includes("--json");
const SCRIVI = process.argv.includes("--scrivi");
const CONTROLLA = process.argv.includes("--controlla");

// ── I pezzi puri (provati in cervello/test/piani-data.test.mjs) ──────────────

/** Il marcatore della riga di servizio: delimitato come `AD-AGGIORNAMENTO`, e per lo stesso motivo. */
export const INIZIO = "<!-- 🗓️ AD-DATA:START";
export const FINE = "<!-- 🗓️ AD-DATA:END -->";

/**
 * Il blocco che il giro rigenera da solo in fondo ai piani. Riconosciuto qui perché il suo contenuto
 * NON è il piano: se lo contassimo, sei piani su dieci risulterebbero aggiornati ieri.
 */
// Costruiti a ogni uso e non tenuti in una costante: una regex con `g` si porta dietro `lastIndex`
// fra una chiamata e l'altra, e un guardiano che risponde diverso alla seconda domanda uguale è la
// forma più silenziosa di misura cieca.
const bloccoAD = () => /<!--\s*🤖 AD-AGGIORNAMENTO:START[\s\S]*?AD-AGGIORNAMENTO:END\s*-->/g;
const bloccoData = () => /<!--\s*🗓️ AD-DATA:START[\s\S]*?AD-DATA:END\s*-->/g;

/**
 * Il testo del piano ripulito di TUTTO ciò che si riscrive da solo — il blocco dell'AD e questa
 * stessa riga di servizio.
 *
 * Togliere anche la propria riga non è un dettaglio: è ciò che rende la misura stabile. Senza,
 * scrivere la data conterebbe come «il piano è cambiato», e alla prossima esecuzione il piano
 * risulterebbe aggiornato... dall'atto di annotare che era fermo.
 *
 * Le righe vuote si normalizzano DOPO aver tolto i blocchi, e non è cosmesi: un blocco che se ne va
 * lascia dietro di sé le righe vuote che lo circondavano, e un confronto fatto sul testo grezzo le
 * conterebbe come differenza. Preso proprio così alla prima esecuzione della prova. Il prezzo è che
 * una modifica fatta di sole righe vuote non risulta un cambiamento — e infatti non lo è.
 */
export function corpoDelPiano(testo) {
  return String(testo ?? "")
    .replace(bloccoAD(), "")
    .replace(bloccoData(), "")
    .split("\n")
    .map((r) => r.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** La data scritta dentro il blocco che il giro rigenera, se quel blocco c'è. */
export function dataDellaNota(testo) {
  const m = String(testo ?? "").match(/## 🤖 Aggiornamento dell'AD — (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
  return m ? m[1] : null;
}

/** Quello che una riga di servizio già scritta dichiara — per poterla confrontare con git. */
export function dichiarato(testo) {
  const m = String(testo ?? "").match(/<!--\s*🗓️ AD-DATA (\{.*?\}) -->/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/** Giorni interi fra due istanti `AAAA-MM-GG HH:MM` (ora di Piacenza per costruzione). */
export function giorniFra(da, a) {
  const ms = new Date(`${a.replace(" ", "T")}:00`) - new Date(`${da.replace(" ", "T")}:00`);
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/**
 * La riga come la legge Nicola. Prima la data (è quello che ha chiesto), poi in una frase perché
 * quella data è quella e non un'altra — senza sigle sopra la riga tecnica (`scrittura-umana.md`).
 */
export function rigaData({ corpo, nato, nota }) {
  const nuovoDiZecca = corpo === nato;
  const prima = nuovoDiZecca
    ? `> 🗓️ **Ultimo aggiornamento: ${corpo}** — il giorno in cui questo piano è stato scritto. Da allora il testo qui sotto non è più stato rivisto.`
    : `> 🗓️ **Ultimo aggiornamento: ${corpo}** — l'ultima volta che è cambiato il testo qui sotto. Il piano è nato il ${nato}.`;
  const seconda = nota
    ? `\n> *In fondo al piano l'AD tiene una sua nota automatica: quella è più recente, è del ${nota}, e non è una revisione del piano.*`
    : "";
  const dati = JSON.stringify({ corpo, nato, nota: nota || null });
  return [
    `${INIZIO} · riga di servizio: la riscrive \`node cervello/piani-data.mjs --scrivi\`, non a mano -->`,
    prima + seconda,
    `<!-- 🗓️ AD-DATA ${dati} -->`,
    FINE,
  ].join("\n");
}

/**
 * Mette la riga subito sotto il titolo, o sostituisce quella già presente.
 *
 * Idempotente per costruzione: due esecuzioni di fila lasciano lo stesso file. È il requisito che
 * permette di rilanciarlo a ogni giro senza far crescere il piano di una riga per volta — l'errore
 * che il blocco `AD-AGGIORNAMENTO` si era già dovuto vietare a mano («rigenera, non accumulare»).
 */
export function inserisciRiga(testo, blocco) {
  const t = String(testo ?? "");
  if (bloccoData().test(t)) return t.replace(bloccoData(), blocco);
  const righe = t.split("\n");
  const i = righe.findIndex((r) => /^#\s+\S/.test(r));
  if (i === -1) return `${blocco}\n\n${t}`; // nessun titolo: la data va comunque in cima
  righe.splice(i + 1, 0, "", blocco);
  return righe.join("\n");
}

// ── Le porte impure ─────────────────────────────────────────────────────────

const git = (args) =>
  execFileSync("git", args, {
    cwd: AD_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 60_000,
    env: { ...process.env, TZ: "Europe/Rome" },
  });

/**
 * I commit che hanno toccato il file, dal più recente, con la data già in ora di Piacenza.
 *
 * `format-local` e non `format`: i commit arrivano da tre posti con fusi diversi (VPS, cloud agent,
 * CI) e il vault vuole l'ora di Piacenza. Misurato il 10/8: il commit di nascita dei sei piani porta
 * `10:34 +0000`, che a Piacenza sono le 12:34 — con `format` avremmo scritto sul piano un'ora
 * sbagliata di due, cioè proprio ciò che la regola dell'orario esiste per impedire.
 */
function commitDelFile(path) {
  const out = git(["log", "--format=%H|%ad", "--date=format-local:%Y-%m-%d %H:%M", "origin/main", "--", path]);
  return out
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((r) => {
      const [sha, data] = r.split("|");
      return { sha, data };
    });
}

/**
 * I due «no» di git davanti a `git show <sha>:<file>` — che NON vanno confusi. È la malattia
 * `fonte-troncata-letta-per-intera` (`cervello/malattie.json`), e il guardiano me l'ha contestata
 * su questa riga mentre scrivevo il file:
 *   · «lì quel file non c'era» — al commit di nascita il genitore non ce l'ha. Il vuoto è la
 *     risposta GIUSTA: è com'era il piano prima di esistere.
 *   · «non ho saputo risponderti» — timeout, oggetto illeggibile, buffer pieno. Qui il vuoto
 *     direbbe «il file era vuoto», il confronto lo leggerebbe come «il piano è cambiato in questo
 *     commit», e sul piano finirebbe una data SBAGLIATA invece che nessuna data.
 * Si distinguono dal testo dell'errore, che è l'unico posto dove git li separa: `show` esce 128 in
 * tutti e due i casi.
 */
const NON_C_ERA = /does not exist in|exists on disk, but not in|unknown revision|not a valid object|invalid object name/i;

/**
 * La decisione, separata dallo spawn e quindi provabile: davanti a un errore di git, «il file non
 * c'era» oppure «non ho potuto misurare».
 *
 * Sta fuori da `testoAl` apposta. Tenendola dentro, insieme all'`execFileSync`, l'unica prova
 * possibile sarebbe cercare una stringa nel sorgente — ed è il tipo di prova che lascia vivere
 * proprio questi difetti (stessa scelta di `cambiatoDallaNascita` in `storia-git.mjs`).
 */
export function classificaErroreGit(errore) {
  const testo = String(errore ?? "");
  if (NON_C_ERA.test(testo)) return { testo: "" };
  return { cieco: testo.split("\n").find(Boolean) || "git non ha risposto" };
}

/**
 * Il testo del file a un certo commit.
 *
 * @returns {{testo: string}|{cieco: string}} — mai una stringa nuda, così chi chiama non può
 * scambiare «vuoto» per «non misurabile» senza accorgersene.
 */
function testoAl(sha, path) {
  try {
    const testo = execFileSync("git", ["show", `${sha}:${path}`], {
      cwd: AD_ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      timeout: 60_000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { testo };
  } catch (e) {
    return classificaErroreGit(e?.stderr || e?.message || "");
  }
}

/**
 * Il commit più recente in cui è cambiato il CORPO — non il file.
 *
 * Si scende dal più recente e ci si ferma al primo che fa differenza: i commit sopra hanno toccato
 * soltanto i blocchi che si rigenerano da soli.
 */
function ultimoCambioDelCorpo(path, commit) {
  for (const c of commit) {
    const dopo = testoAl(c.sha, path);
    const prima = testoAl(`${c.sha}~1`, path);
    // Un solo commit illeggibile basta a non poter dire QUANDO: meglio nessuna data che una data
    // costruita saltando il pezzo che non si è riusciti a guardare.
    if (dopo.cieco || prima.cieco) return { cieco: dopo.cieco || prima.cieco };
    if (corpoDelPiano(dopo.testo) !== corpoDelPiano(prima.testo)) return c;
  }
  return commit[commit.length - 1] ?? null;
}

function misura() {
  const nomi = readdirSync(join(AD_ROOT, CARTELLA))
    .filter((n) => n.endsWith(".md"))
    .filter((n) => !/^prompt/i.test(n)) // stessa regola del Pannello: un prompt non è un piano
    .sort();

  const oggi = nowPiacenza();
  return nomi.map((nome) => {
    const path = `${CARTELLA}/${nome}`;
    const testo = readFileSync(join(AD_ROOT, path), "utf8");
    const commit = commitDelFile(path);
    if (!commit.length) return { nome, path, testo, cieco: "git non conosce questo file" };
    const corpo = ultimoCambioDelCorpo(path, commit);
    if (!corpo || corpo.cieco) return { nome, path, testo, cieco: corpo?.cieco || "nessun commit leggibile" };
    const nato = commit[commit.length - 1].data;
    const nota = dataDellaNota(testo);
    return {
      nome: nome.replace(/\.md$/, ""),
      path,
      testo,
      corpo: corpo.data,
      nato,
      nota,
      tocco: commit[0].data,
      commit: commit.length,
      fermoDa: giorniFra(corpo.data, oggi),
    };
  });
}

// ── Il comando ──────────────────────────────────────────────────────────────

function main() {
  const storia = storiaDelRepo(AD_ROOT);
  if (!storia.intera) {
    const msg = `la data dell'ultimo aggiornamento non si può misurare — ${storia.motivo}`;
    if (JSON_MODE) console.log(JSON.stringify({ esito: "cieco", motivo: msg }, null, 2));
    else {
      console.error(`\n⛔ PIANI-DATA CIECO: ${msg}\n`);
      console.error(`   Rimedio: \`git fetch --unshallow origin main\` e rilancia.`);
      console.error(`   Senza storia intera ogni piano risulterebbe aggiornato al giorno del clone.\n`);
    }
    process.exit(2);
  }

  const piani = misura();
  const ciechi = piani.filter((p) => p.cieco);
  if (ciechi.length === piani.length) {
    console.error(`\n⛔ PIANI-DATA CIECO: nessun piano leggibile in ${CARTELLA}\n`);
    process.exit(2);
  }
  const buoni = piani.filter((p) => !p.cieco);

  if (SCRIVI) {
    let scritti = 0;
    for (const p of buoni) {
      const nuovo = inserisciRiga(p.testo, rigaData(p));
      if (nuovo !== p.testo) {
        writeFileSync(join(AD_ROOT, p.path), nuovo);
        scritti++;
      }
    }
    if (!JSON_MODE) console.log(`\n🗓️  Riga della data scritta su ${scritti} piani su ${buoni.length}.`);
  }

  // Una riga che non dice più la verità è peggio di una riga assente: quella si vede, questa no.
  const bugie = buoni
    .map((p) => {
      const d = dichiarato(SCRIVI ? inserisciRiga(p.testo, rigaData(p)) : p.testo);
      if (!d) return { nome: p.nome, guaio: "manca la riga della data" };
      if (d.corpo !== p.corpo) return { nome: p.nome, guaio: `la riga dice ${d.corpo}, git dice ${p.corpo}` };
      if ((d.nota || null) !== (p.nota || null)) return { nome: p.nome, guaio: `la nota dell'AD è del ${p.nota || "—"}, la riga dice ${d.nota || "—"}` };
      return null;
    })
    .filter(Boolean);

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          esito: bugie.length ? "fuori" : "ok",
          oggi: nowPiacenza(),
          piani: buoni.map(({ testo, ...r }) => r),
          // Anche qui i ciechi viaggiano col verdetto: chi legge il JSON deve poter distinguere
          // «dieci piani misurati» da «dieci misurati e due che non ho potuto guardare».
          non_misurati: ciechi.map((c) => ({ nome: c.nome.replace(/\.md$/, ""), motivo: c.cieco })),
          bugie,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`\n🗓️  DA QUANTO SONO FERMI I PIANI — ${buoni.length} piani, oggi ${nowPiacenza()}\n`);
    console.log(`  ${"PIANO".padEnd(26)} ${"AGGIORNATO".padEnd(17)} FERMO DA   NOTA DELL'AD`);
    console.log(`  ${"─".repeat(76)}`);
    for (const p of [...buoni].sort((a, b) => b.fermoDa - a.fermoDa)) {
      const spia = p.fermoDa >= 30 ? "🔴" : p.fermoDa >= 14 ? "🟡" : "🟢";
      console.log(`  ${spia} ${p.nome.padEnd(24)} ${p.corpo.padEnd(17)} ${String(p.fermoDa).padStart(3)} giorni  ${p.nota || "—"}`);
    }
    const fermi = buoni.filter((p) => p.fermoDa >= 30).length;
    if (fermi) console.log(`\n  ⚠️  ${fermi} piani su ${buoni.length} non vengono rivisti da più di un mese.`);
    // I ciechi si stampano: un piano sparito dall'elenco senza dirlo è la cecità che diventa muta.
    if (ciechi.length) {
      console.log(`\n  ⚪ ${ciechi.length} piani NON misurati (restano senza data, non con una data inventata):`);
      for (const c of ciechi) console.log(`     • ${c.nome.replace(/\.md$/, "")}: ${c.cieco}`);
    }
    if (bugie.length) {
      console.log(`\n  ❌ ${bugie.length} righe da rifare (lancia --scrivi):`);
      for (const b of bugie) console.log(`     • ${b.nome}: ${b.guaio}`);
    } else {
      console.log(`\n  ✅ Ogni piano porta la sua data, e la data dice quello che dice git.`);
    }
    console.log("");
  }

  process.exit(CONTROLLA && bugie.length ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
