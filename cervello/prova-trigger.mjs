#!/usr/bin/env node
// 🎯 LA PROVA CHE LA SKILL SI ACCENDA — manda le frasi vere di Nicola a `claude -p` dentro questo
// repo e guarda se la prima mossa è aprire la skill.
//
// PERCHÉ ESISTE. La skill `cantiere` è un mansionario che si carica da solo: tutto il suo valore
// poggia sulla `description`, perché è quella — e solo quella — che decide se scatta. Fino al 29/7
// non esisteva una sola prova che scattasse sulle frasi vere: ventinove lotti di standard appesi a
// un paragrafo mai misurato. Un cancello per i fix, e nessun cancello sulla porta d'ingresso.
//
// IL METODO è quello della skill `skill-creator` (`scripts/run_eval.py`): si registra la description
// come capacità disponibile, si lancia la frase con `claude -p`, si guarda se la prima chiamata è
// la skill. Il motore però è riscritto qui, per tre cose misurate sul campo il 29/7:
//
//   ① `run_eval.py` cerca la radice del progetto salendo dalla CWD. Lanciato dalla cartella di
//      skill-creator finiva su `/root`: misurava il trigger in un repo VUOTO, senza CLAUDE.md e
//      senza le capacità rivali (il giro, la radiografia, verify). Lì le trappole sono facili e i
//      positivi partono ciechi — il numero che ne usciva non voleva dire niente.
//   ② con 5 sessioni `claude` in parallelo le sessioni muoiono: 5 lavoratori davano 1 frase giusta
//      su 5, 2 lavoratori 3 su 5, 1 lavoratore 5 su 5 — sulle STESSE frasi. Qui si va in fila.
//   ③ e soprattutto: `run_eval.py` non distingue «la skill non è scattata» da «la sessione non è
//      nemmeno partita». Le legge tutte e due come mancato. È il travestimento che questo cantiere
//      cura da trenta lotti, al contrario: un buco che si traveste da misura. Qui una sessione che
//      non parte è **cieca** (uscita 2), non un mancato.
//
// La skill VERA viene spostata da parte per la durata della misura (altrimenti il modello apre
// quella e il banco legge «non scattata» su OGNI frase giusta) e rimessa a posto sempre — a fine
// corsa, su eccezione e su Ctrl-C.
//
// 🟡 Sposta temporaneamente `.claude/skills/cantiere` e scrive un file in `.claude/commands/`; li
// ripristina sempre. Non tocca git, non committa, non scrive nel cantiere. Costa: ogni frase è una
// sessione `claude` vera.
//
// Uso:
//   node cervello/prova-trigger.mjs                     # il banco versionato, 3 giri a frase
//   node cervello/prova-trigger.mjs --giri 1            # sweep veloce mentre si lavora al testo
//   node cervello/prova-trigger.mjs --descrizione f.txt # misura una description CANDIDATA
//   node cervello/prova-trigger.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = zero mancati sulle frasi vere e zero falsi sulle trappole
//   1 = almeno un mancato o un falso: la description non è pronta
//   2 = non ho potuto misurare (CLI assente, sessioni che non partono, banco illeggibile) → cieco

import { existsSync, readFileSync, writeFileSync, mkdtempSync, mkdirSync, renameSync, rmSync, unlinkSync } from "node:fs";
import { spawnSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { AD_ROOT } from "./git-github.mjs";
import { timbroOra } from "./ora-piacenza.mjs";
import { NOME_MARCATORE_MISURA } from "./cancelli-commit.mjs"; // AR-345

const JSON_MODE = process.argv.includes("--json");
const arg = (nome, def) => {
  const i = process.argv.indexOf(nome);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
};

const SKILL_DIR = join(AD_ROOT, ".claude/skills/cantiere");
const COMANDI = join(AD_ROOT, ".claude/commands");
const BANCO = arg("--frasi", join(SKILL_DIR, "evals/frasi-di-nicola.json"));
const GIRI = Number(arg("--giri", "3"));
const DESCRIZIONE = arg("--descrizione", null);
const MODELLO = process.env.MODELLO_TRIGGER || "claude-opus-5";
const SOGLIA = 0.5; // su 3 giri decide la maggioranza

/**
 * L'impronta del banco: le frasi misurate, in ordine, con il verdetto atteso.
 *
 * Serve perché un verde parziale è indistinguibile da un verde vero. Il 29/7 `ultima-misura.json`
 * diceva «zero mancati, zero falsi» su 15 frasi mentre il banco versionato ne aveva 28: era la
 * misura delle sole trappole, e nel file sembrava la misura di tutto. L'impronta rende quella
 * differenza meccanica invece che da notare a occhio.
 */
export function improntaBanco(frasi) {
  const canone = frasi.map((f) => `${f.should_trigger ? "1" : "0"} ${f.query.trim()}`).join("");
  return createHash("sha256").update(canone).digest("hex").slice(0, 12);
}

/** Estrae la `description` dal frontmatter di una SKILL.md, su una riga sola. */
export function descrizioneDi(skillMd) {
  const righe = skillMd.split("\n");
  if (righe[0].trim() !== "---") return null;
  const fine = righe.findIndex((r, i) => i > 0 && r.trim() === "---");
  if (fine === -1) return null;
  for (let i = 1; i < fine; i++) {
    if (!righe[i].startsWith("description:")) continue;
    const valore = righe[i].slice("description:".length).trim();
    if (![">", "|", ">-", "|-"].includes(valore)) return valore.replace(/^["']|["']$/g, "");
    const cont = [];
    for (let j = i + 1; j < fine && /^(\s{2,}|\t)/.test(righe[j]); j++) cont.push(righe[j].trim());
    return cont.join(" ");
  }
  return null;
}

/**
 * Una frase, una sessione. Torna "scattata" | "non_scattata" | "cieca".
 *
 * Si classifica sulla PRIMA chiamata a uno strumento, come fa skill-creator: se la prima mossa non
 * è aprire la skill, per Nicola la skill non è servita. È un metro severo, ed è voluto — quello che
 * si vuole misurare è proprio l'istinto, non la possibilità di arrivarci al terzo passo.
 */
function unaFrase(frase, nomeFinto) {
  return new Promise((risolviGrezzo) => {
    // Cosa ha fatto INVECE di aprire la skill: è la differenza fra «mancato» e «mancato, ma è
    // partito a leggere il cantiere da solo». Senza questo il banco dice che qualcosa non va e non
    // dove — e la description finisce corretta a tentoni.
    let primo = "";
    const risolvi = (esito) => risolviGrezzo({ esito, primo });
    const env = { ...process.env };
    delete env.CLAUDECODE; // la guardia è per il terminale interattivo: da script è sicuro annidare
    const p = spawn(
      "claude",
      ["-p", frase, "--output-format", "stream-json", "--verbose", "--include-partial-messages", "--model", MODELLO],
      { cwd: AD_ROOT, env, stdio: ["ignore", "pipe", "ignore"] },
    );
    let buf = "";
    let attesa = null;
    let accumulato = "";
    let partita = false; // ho visto la sessione nascere?
    let finito = false;
    const chiudi = (esito) => {
      if (finito) return;
      finito = true;
      clearTimeout(orologio);
      try {
        p.kill("SIGKILL");
      } catch {}
      risolvi(esito);
    };
    const orologio = setTimeout(() => chiudi(partita ? "cieca" : "cieca"), 180_000);

    p.stdout.on("data", (d) => {
      buf += d;
      let taglio;
      while ((taglio = buf.indexOf("\n")) !== -1) {
        const riga = buf.slice(0, taglio).trim();
        buf = buf.slice(taglio + 1);
        if (!riga) continue;
        let e;
        try {
          e = JSON.parse(riga);
        } catch {
          continue;
        }
        if (e.type === "system" && e.subtype === "init") partita = true;
        if (e.type !== "stream_event") {
          // Se la sessione finisce senza aver mai chiamato uno strumento, la skill non è scattata.
          if (e.type === "result") chiudi(partita ? "non_scattata" : "cieca");
          continue;
        }
        const se = e.event || {};
        if (se.type === "content_block_start" && se.content_block?.type === "tool_use") {
          const nome = se.content_block.name;
          if (!primo) primo = nome;
          if (nome === "Skill" || nome === "Read") {
            attesa = nome;
            accumulato = "";
          } else {
            chiudi("non_scattata"); // ha fatto altro per prima cosa
          }
        } else if (se.type === "content_block_delta" && attesa && se.delta?.type === "input_json_delta") {
          accumulato += se.delta.partial_json || "";
          if (accumulato.includes(nomeFinto)) chiudi("scattata");
        } else if (se.type === "content_block_stop" && attesa) {
          chiudi(accumulato.includes(nomeFinto) ? "scattata" : "non_scattata");
        } else if (se.type === "message_stop" && !attesa) {
          chiudi(partita ? "non_scattata" : "cieca");
        }
      }
    });
    p.on("error", () => chiudi("cieca"));
    p.on("close", () => chiudi(partita ? "non_scattata" : "cieca"));
  });
}

function esci(codice, messaggio, extra = {}) {
  if (JSON_MODE) console.log(JSON.stringify({ ok: codice === 0, codice, messaggio, ...extra }, null, 2));
  else console.log(messaggio);
  process.exit(codice);
}

async function main() {
  if (spawnSync("claude", ["--version"], { encoding: "utf8" }).status !== 0) {
    esci(2, "prova-trigger: la CLI `claude` non risponde → non posso misurare");
  }
  if (!existsSync(BANCO)) esci(2, `prova-trigger: banco assente (${BANCO}) → non posso misurare`);
  if (!existsSync(join(SKILL_DIR, "SKILL.md"))) esci(2, "prova-trigger: la skill cantiere non è installata → non posso misurare");

  let frasi;
  try {
    // Le voci senza `query` sono le note del banco (`_cosa_e`): documentano, non si misurano.
    frasi = JSON.parse(readFileSync(BANCO, "utf8")).filter((f) => typeof f?.query === "string" && f.query.trim());
  } catch (e) {
    esci(2, `prova-trigger: banco illeggibile (${e.message}) → non posso misurare`);
  }
  if (frasi.length < 2) esci(2, "prova-trigger: meno di due frasi nel banco → non posso misurare");

  let descrizione = descrizioneDi(readFileSync(join(SKILL_DIR, "SKILL.md"), "utf8"));
  if (DESCRIZIONE) {
    if (!existsSync(DESCRIZIONE)) esci(2, `prova-trigger: descrizione candidata assente (${DESCRIZIONE}) → non posso misurare`);
    descrizione = readFileSync(DESCRIZIONE, "utf8").split("\n").map((r) => r.trim()).filter(Boolean).join(" ");
  }
  if (!descrizione) esci(2, "prova-trigger: non ho saputo leggere la description dal frontmatter → non posso misurare");

  // La cartella di lavoro sta dentro `.git/` (che non viene letta come skill) e non in /tmp: se la
  // macchina si spegne a metà, la skill spostata resta DENTRO il repo, dove la si ritrova. Rete di
  // sicurezza finale: `git checkout -- .claude/skills/cantiere` la rimette com'era sul ramo.
  const lavoro = mkdtempSync(join(AD_ROOT, ".git", "prova-trigger-"));
  const spostata = join(lavoro, "cantiere-da-parte");
  const nomeFinto = `cantiere-prova-${process.pid.toString(36)}`;
  const fileComando = join(COMANDI, `${nomeFinto}.md`);
  let daRimettere = false;
  let comandiCreata = false;

  // AR-345 — IL MARCATORE CHE DICE «SPOSTATA, NON CANCELLATA».
  // Per i ~35 minuti della misura `git status` mostra `D .claude/skills/cantiere/SKILL.md`, che è
  // indistinguibile da una cancellazione voluta. Qualunque automatismo che dica «ci sono modifiche
  // pendenti, committale» la cancellerebbe davvero — e lo stop-hook di sessione lo chiede a ogni
  // turno. Il 29/7 la difesa è stata l'attenzione di chi lavorava, e l'attenzione non si ripete.
  // Questo file è la traccia visibile; il `pre-commit` la legge e rifiuta il commit finché c'è.
  const marcatore = join(AD_ROOT, ".git", NOME_MARCATORE_MISURA);

  // Rimettere a posto la skill vera conta più di qualunque risultato: vale a fine corsa, su
  // eccezione e su Ctrl-C. Il marcatore si toglie QUI, insieme alla skill: se sparisse prima, il
  // cancello smetterebbe di proteggere una cartella ancora spostata.
  const rimetti = () => {
    if (daRimettere && existsSync(spostata) && !existsSync(SKILL_DIR)) renameSync(spostata, SKILL_DIR);
    daRimettere = false;
    try {
      if (existsSync(marcatore)) unlinkSync(marcatore);
    } catch {}
    try {
      if (existsSync(fileComando)) unlinkSync(fileComando);
      if (comandiCreata) rmSync(COMANDI, { recursive: true, force: true });
    } catch {}
  };
  process.on("exit", rimetti);
  for (const s of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(s, () => {
      rimetti();
      process.exit(130);
    });
  }

  try {
    if (!existsSync(COMANDI)) {
      mkdirSync(COMANDI, { recursive: true });
      comandiCreata = true;
    }
    writeFileSync(fileComando, `---\ndescription: |\n  ${descrizione}\n---\n\n# cantiere\n\n${descrizione}\n`);
    // AR-345 — il marcatore nasce PRIMA dello spostamento: se nascesse dopo esisterebbe una
    // finestra, corta ma vera, in cui la skill è già via e il cancello non lo sa ancora.
    writeFileSync(marcatore, `${spostata}\n`);
    renameSync(SKILL_DIR, spostata);
    daRimettere = true;

    const righe = [];
    for (const f of frasi) {
      const giri = [];
      for (let g = 0; g < GIRI; g++) giri.push(await unaFrase(f.query, nomeFinto));
      const esiti = giri.map((x) => x.esito);
      const invece = [...new Set(giri.filter((x) => x.esito === "non_scattata").map((x) => x.primo || "ha risposto a parole"))].join("/");
      const cieche = esiti.filter((x) => x === "cieca").length;
      const scatti = esiti.filter((x) => x === "scattata").length;
      const validi = esiti.length - cieche;
      const tasso = validi ? scatti / validi : 0;
      righe.push({
        query: f.query,
        should_trigger: !!f.should_trigger,
        nota: f.nota || "",
        fonte: f.fonte || "",
        invece,
        scatti,
        giri: esiti.length,
        cieche,
        tasso,
        pass: validi === 0 ? false : f.should_trigger ? tasso >= SOGLIA : tasso < SOGLIA,
      });
      if (!JSON_MODE) {
        const r = righe[righe.length - 1];
        const segno = r.cieche === r.giri ? "⚠️ " : r.pass ? "✅" : "❌";
        const coda = r.should_trigger && r.invece ? `  ← invece: ${r.invece}` : "";
        console.log(`  ${segno} [${r.should_trigger ? "vera " : "trapp"}] ${r.scatti}/${r.giri}  ${r.query.slice(0, 72)}${r.query.length > 72 ? "…" : ""}${coda}`);
      }
    }
    rimetti();

    const cieche = righe.filter((x) => x.cieche === x.giri);
    const mancati = righe.filter((x) => x.should_trigger && !x.pass && x.cieche < x.giri);
    const falsi = righe.filter((x) => !x.should_trigger && !x.pass && x.cieche < x.giri);
    const ok = mancati.length === 0 && falsi.length === 0 && cieche.length === 0;

    // La traccia della misura, accanto al banco: chi legge la PR fra un mese vede su QUALE testo è
    // stato misurato (l'impronta), non solo che «era verde».
    writeFileSync(
      join(SKILL_DIR, "evals/ultima-misura.json"),
      `${JSON.stringify(
        {
          _cosa_e: "🎯 L'ultima misura del trigger. La rifà `node cervello/prova-trigger.mjs`. Se l'impronta non è quella della description di adesso, quel verde parla di un altro testo.",
          quando: timbroOra(),
          modello: MODELLO,
          giri: GIRI,
          impronta_description: createHash("sha256").update(descrizione).digest("hex").slice(0, 12),
          impronta_banco: improntaBanco(frasi),
          frasi_vere: righe.filter((x) => x.should_trigger).length,
          trappole: righe.filter((x) => !x.should_trigger).length,
          mancati: mancati.map((x) => x.query),
          falsi: falsi.map((x) => x.query),
          mai_misurate: cieche.map((x) => x.query),
        },
        null,
        1,
      )}\n`,
    );

    if (JSON_MODE) {
      console.log(JSON.stringify({ ok, giri: GIRI, modello: MODELLO, mancati, falsi, cieche, righe }, null, 2));
    } else {
      console.log("");
      console.log(`  ${righe.length} frasi × ${GIRI} giro/i · ${MODELLO}${DESCRIZIONE ? " · description CANDIDATA" : ""}`);
      console.log(`  Mancati sulle frasi vere: ${mancati.length}`);
      console.log(`  Falsi sulle trappole:     ${falsi.length}`);
      if (cieche.length) console.log(`  Frasi mai misurate:       ${cieche.length}`);
      console.log("");
      if (cieche.length) console.log("⚠️  ALCUNE FRASI NON SONO STATE MISURATE: il verde non le copre.");
      console.log(ok ? "✅ LA SKILL SI ACCENDE DOVE DEVE, E SOLO LÌ." : "⛔ LA DESCRIPTION NON È PRONTA: sistema i punti ❌ e rimisura.");
    }
    if (cieche.length && !mancati.length && !falsi.length) process.exit(2);
    process.exit(ok ? 0 : 1);
  } finally {
    rimetti();
    rmSync(lavoro, { recursive: true, force: true });
  }
}

if (process.argv[1] && process.argv[1].endsWith("prova-trigger.mjs")) main();
