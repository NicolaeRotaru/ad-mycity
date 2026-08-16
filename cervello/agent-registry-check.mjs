#!/usr/bin/env node
// Guardiano deterministico del registro agenti — confronta i file reali `.claude/agents/*.md`
// con gli elenchi umani (CLAUDE.md, COMANDI.md, AGENTI.md) e segnala il DRIFT.
// 🟢 Sola lettura: NON scrive nel vault, NON fa git. Legge e stampa un report (+ opzionale --json).
//
// Risolve AR-007 / AR-008: il registro degli agenti è mantenuto A MANO in più file che divergono a
// ogni nuovo agente — agenti "orfani" invisibili al router principale e conteggi dichiarati incoerenti
// (es. "40 senior" contro 42 file reali). Questo guardiano rende il drift misurabile a ogni giro,
// non più affidato alla memoria umana o alla sola radiografia LLM su comando.
//
// AR-027 estensione: legge anche il campo `description` di ogni agente (il contratto che il
// Task-router usa davvero) e segnala collisioni di frasi-trigger verbatim tra coppie e deferral
// mancanti verso vicini di dominio. Complementa keyword-owner-check (solo blocco "Delega qui per").
//
// Uso:
//   node cervello/agent-registry-check.mjs           -> report leggibile
//   node cervello/agent-registry-check.mjs --json     -> output JSON (per gate / sentinelle)
//
// Exit: 0 = nessun drift · 1 = drift presente (così può fare da gate in CI o nel giro)

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, basename } from "node:path";
import { AD_ROOT, gitEsegui, nowPiacenza, stampSegnale } from "./git-github.mjs";
import {
  percorsiMorti,
  canaliVersoPersone,
  canaliSenzaOwner,
  capifilaMuti,
  separaDescription,
} from "./mandato-owner.mjs";
import { percorsiDaGit } from "./percorsi-git.mjs";
import { conteggiSbagliati as conteggiSbagliatiPuro, perimetroDaRepo } from "./perimetro-conteggi.mjs";

const JSON_MODE = process.argv.includes("--json");

// Cartella dei mansionari operativi (fonte di verità) e i tre file "registro" mantenuti a mano.
const AGENTS_DIR = join(AD_ROOT, ".claude/agents");

/**
 * Legge un file registro relativo alla radice AD; se manca torna stringa vuota — un file
 * assente equivale a "non cita nessun agente", così il drift emerge invece di far crashare.
 * @param {string} rel
 */
/**
 * Tutti i file tracciati dal repo. È la fonte da cui si DERIVA il perimetro dei conteggi (AR-347):
 * chiedere a git è l'unico modo di non tenere un elenco che invecchia. Se git non risponde si torna
 * vuoto e il controllo dei conteggi non gira — e questo lo dice `perimetro.length` a chi chiama,
 * invece di far passare per «nessun conteggio sbagliato» un elenco che non ho potuto leggere.
 */
function fileDelRepo() {
  try {
    // L'esecutore unico di git (AR-327): il tetto sullo stdout sta in UN posto solo. Allinearlo qui
    // a mano vorrebbe dire tenerne due, e due copie della stessa regola divergono sempre.
    return gitEsegui(["ls-files"], AD_ROOT).split("\n").filter(Boolean);
  } catch (e) {
    // NON una lista vuota: da vuota uscirebbe «zero conteggi vecchi», cioè un verde costruito su un
    // elenco che non ho potuto leggere. `null` vuol dire «non lo so», e chi chiama lo deve dire.
    return null;
  }
}

/**
 * Il tetto dichiarato per i conteggi vecchi ereditati. Assente = zero, cioè il comportamento severo:
 * un tetto che non c'è non può essere un permesso.
 */
function leggiTettoConteggi() {
  try {
    const j = JSON.parse(readFileSync(join(AD_ROOT, "cervello/tetti-lotto.json"), "utf8"));
    const n = Number(j?.conteggi_agenti_vecchi);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch (e) {
    return 0;
  }
}

function leggiTesto(rel) {
  const p = join(AD_ROOT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

/**
 * AR-024: un agente conta come "citato dal router" SOLO se compare come voce-roster a confine
 * di parola, NON come sottostringa. Il vecchio `testo.includes(nome)` era orbo: un nome corto
 * (es. "qa" dentro "quadratura") o un nome citato solo in un blocco-connettore "(→ usa **X**)"
 * mascherava l'orfano. Qui: (1) tolgo i blocchi-connettori "(→ ... )" — chi appare solo lì è un
 * deferral, non un owner nel roster; (2) match a confine di parola via RegExp sul nome esatto.
 * @param {string} testo
 * @param {string} nome
 */
function citatoNelRoster(testo, nome) {
  const soloRoster = testo.replace(/\([^)]*\)/g, "");
  const nomeEsc = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("\\b" + nomeEsc + "\\b").test(soloRoster); // AR-024: confine di parola, non sottostringa
}

/** Estrae `description:` dal frontmatter YAML di un mansionario. */
function estraiDescription(testo) {
  const m = testo.match(/^---\s*[\r\n]([\s\S]*?)[\r\n]---/);
  const fm = m ? m[1] : testo;
  const d = fm.match(/description:\s*([\s\S]*?)(?:[\r\n]\w[\w-]*:\s|$)/);
  return d ? d[1].replace(/\s+/g, " ").trim() : "";
}

/** Estrae `name:` dal frontmatter YAML di un mansionario. "" se manca. */
export function estraiName(testo) {
  const m = String(testo || "").match(/^---\s*[\r\n]([\s\S]*?)[\r\n]---/);
  const fm = m ? m[1] : "";
  const n = fm.match(/^name:\s*(.+?)\s*$/m);
  return n ? n[1].replace(/^["']|["']$/g, "").trim() : "";
}

/**
 * AR-619 — il nome DENTRO la scheda deve combaciare col nome del FILE. Il router dei subagenti
 * instrada sul campo `name` del frontmatter, ma questo guardiano confrontava solo i nomi-file con
 * gli elenchi umani: un rename interno (name ≠ filename), un `name` mancante o due schede con lo
 * stesso `name` avrebbero rotto il routing delle deleghe col guardiano ancora verde e il conteggio
 * 120=120 intatto. Pura: prende [{file, testo}] iniettabili, nessun I/O.
 */
export function analizzaNomi(schede = []) {
  const senzaName = [];
  const nomeDiverso = [];
  const perName = new Map();
  for (const { file, testo } of schede) {
    const name = estraiName(testo);
    if (!name) {
      senzaName.push(file);
      continue;
    }
    if (!perName.has(name)) perName.set(name, []);
    perName.get(name).push(file);
    if (name !== file) nomeDiverso.push({ file, name });
  }
  const nameDoppi = [...perName.entries()].filter(([, files]) => files.length > 1).map(([name, files]) => ({ name, files }));
  return { senzaName, nomeDiverso, nameDoppi, problemi: senzaName.length + nomeDiverso.length + nameDoppi.length };
}

/** Normalizza un frammento in frase-trigger per confronto verbatim. */
function normalizzaFraseTrigger(frag) {
  return frag
    .toLowerCase()
    .replace(/["""«»'?]/g, "")
    .replace(/[?!.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Frase-trigger valida per il confronto (evita monosillabi generici tipo "resi", "payout"). */
function fraseTriggerValida(frag) {
  const f = normalizzaFraseTrigger(frag);
  if (f.length < 4 || f.length > 80 || !/[a-zàèéìòù]/.test(f)) return null;
  const parole = f.split(" ").filter(Boolean);
  if (parole.length >= 2) return f;
  if (f.includes("/")) return f;
  if (f.length >= 10) return f;
  return null;
}

/**
 * Tokenizza le frasi-trigger dalla description intera (non solo "Delega qui per").
 * @param {string} desc
 */
function estraiFrasiTrigger(desc) {
  const senzaDeferral = desc.replace(/\([^)]*→[^)]*\)/g, " ");
  const raw = [];
  const paren = senzaDeferral.match(/\(([^)]+)\)/g) || [];
  for (const blocco of paren) {
    for (const p of blocco.slice(1, -1).split(/[\/,;]/)) raw.push(p);
  }
  const piatto = senzaDeferral.replace(/\([^)]+\)/g, " ");
  for (const p of piatto.split(/[\/,;·]|(?:\s+-\s+)/)) raw.push(p);
  const quoted = senzaDeferral.match(/[""«»"]([^""«»"]+)[""«»"]/g) || [];
  for (const q of quoted) raw.push(q.replace(/[""«»"]/g, ""));
  const out = new Set();
  for (let frag of raw) {
    frag = frag.replace(/^delega qui per\s+/i, "").replace(/^usa per\s+/i, "");
    const f = fraseTriggerValida(frag);
    if (f) out.add(f);
  }
  return [...out];
}

/** Blocchi deferral "(→ …)" nella description. */
function estraiDeferral(desc) {
  return (desc.match(/\([^)]*→[^)]*\)/g) || []).length > 0
    || /→\s*@?\*?\*?[a-z][\w-]*/i.test(desc);
}

/**
 * Collisioni description: coppie con >=2 frasi-trigger condivise verbatim + deferral assente.
 * @param {Map<string, string>} descriptions nome → description
 */
// Esportata (AR-679) perché una prova la possa ESEGUIRE. La cura di AR-130 — non contare come
// collisione i blocchi di rimando «(→ tema = **vicino**)» — viveva qui dentro senza nessun freno che
// potesse diventare rosso: il fix c'era, la difesa no. E il difetto che copre è quello di un guardiano
// che punisce proprio il deferral con cui il doppione si risolve, cioè che insegna a non scriverlo.
export function analizzaCollisioniDescription(descriptions) {
  const triggerPerAgente = new Map();
  const descNorm = new Map();
  for (const [nome, desc] of descriptions) {
    triggerPerAgente.set(nome, estraiFrasiTrigger(desc));
    // AR-130: il confronto guarda SOLO ciò che la scheda rivendica (mandato + domande). I blocchi di
    // rimando «(→ tema = **vicino**)» nominano per forza il tema del vicino — è il loro mestiere — e
    // contarli come collisione puniva proprio il deferral che risolve il doppione.
    const { mandato, domande } = separaDescription(desc);
    descNorm.set(nome, normalizzaFraseTrigger(`${mandato} ${domande}`));
  }

  const collisioniCoppie = [];
  const nomi = [...descriptions.keys()].sort();
  for (let i = 0; i < nomi.length; i++) {
    for (let j = i + 1; j < nomi.length; j++) {
      const a = nomi[i];
      const b = nomi[j];
      const condivise = triggerPerAgente
        .get(a)
        .filter((t) => descNorm.get(b).includes(t) && descNorm.get(a).includes(t))
        .sort();
      if (condivise.length >= 2) {
        collisioniCoppie.push({ a, b, condivise });
      }
    }
  }

  const deferralMancante = [];
  for (const c of collisioniCoppie) {
    for (const nome of [c.a, c.b]) {
      if (!estraiDeferral(descriptions.get(nome))) {
        deferralMancante.push({
          agente: nome,
          vicino: nome === c.a ? c.b : c.a,
          condivise: c.condivise,
        });
      }
    }
  }

  return { collisioniCoppie, deferralMancante };
}

async function main() {
  const quando = nowPiacenza();

  // 1. Nomi-agente reali = basename (senza .md) di ogni file in `.claude/agents/`.
  const agentiReali = readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();

  // 2. Contenuto dei file "registro" tenuti a mano (match a confine di parola sul roster — AR-024).
  const claude = leggiTesto("CLAUDE.md");
  const comandi = leggiTesto("COMANDI.md");
  const agentiMd = leggiTesto("MyCity-Vault/07-Agenti/AGENTI.md");

  // 3. Orfani = agenti reali con 0 occorrenze SIA in CLAUDE.md SIA in COMANDI.md:
  //    il router principale (mansionario dell'AD + menù comandi) non li vede affatto.
  const orfani = agentiReali.filter(
    (n) => !citatoNelRoster(claude, n) && !citatoNelRoster(comandi, n) // AR-024: confine di parola sul roster, non includes()
  );

  // 4. Assenti da AGENTI.md = agenti reali non citati nella mappa-organigramma leggibile del vault.
  const assentiDaAgentiMd = agentiReali.filter((n) => !agentiMd.includes(n));

  // 5. Conteggio: numero reale di file vs numero dichiarato in AGENTI.md ("N senior").
  //    Tolleranza +1: la mappa può contare anche l'AD, che NON è un file in `.claude/agents/`.
  const nReali = agentiReali.length;
  const mNum = agentiMd.match(/(\d+)\s+senior/i);
  const nDichiaratoAgentiMd = mNum ? Number(mNum[1]) : null;
  const conteggioIncoerente =
    nDichiaratoAgentiMd != null &&
    nDichiaratoAgentiMd !== nReali &&
    nDichiaratoAgentiMd !== nReali + 1;

  // 6. AR-027: collisioni description (frasi-trigger verbatim + deferral verso vicini di dominio).
  //    AR-619: dagli stessi file si legge anche `name:` — il campo su cui il router instrada davvero.
  const descriptions = new Map();
  const schedePerNome = [];
  for (const nome of agentiReali) {
    const testo = readFileSync(join(AGENTS_DIR, `${nome}.md`), "utf8");
    descriptions.set(nome, estraiDescription(testo));
    schedePerNome.push({ file: nome, testo });
  }
  const { collisioniCoppie, deferralMancante } = analizzaCollisioniDescription(descriptions);
  const nomi = analizzaNomi(schedePerNome); // AR-619: name ≠ filename, name mancante, name doppio
  const nCollisioni = collisioniCoppie.length + deferralMancante.length;

  // 7. Copertura KPI: ogni agente deve possiedere un KPI in OKR-Squadra (o deroga esplicita).
  const okr = leggiTesto("MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md");
  const derogheKpi = new Set(["ad"]);
  const senzaKpi = agentiReali.filter((n) => {
    if (derogheKpi.has(n)) return false;
    const re = new RegExp("\\b" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    return !re.test(okr);
  });

  // 8. AR-195 — I CONTEGGI NEI FILE CHE PILOTANO IL LAVORO. Il guardiano leggeva tre file scelti a
  //    mano (CLAUDE.md, COMANDI.md, AGENTI.md): quelli «che parlano all'AD». Ma un numero sbagliato
  //    fa più danno dentro un prompt eseguibile che dentro un elenco leggibile — l'auto-radiografia
  //    diceva ai suoi agenti «i 42 agenti in .claude/agents/» mentre erano 120, cioè partiva già con
  //    una realtà vecchia in testa. Qui il perimetro si allarga a TUTTO ciò che pilota: se un file
  //    dichiara un numero di agenti/senior diverso da quello reale, il guardiano fallisce.
  //    AR-347 — E QUELL'ELENCO ERA ANCORA UN ELENCO. Fino al 16/8 i file da guardare erano sei,
  //    scritti a mano qui dentro. Il «42» viveva ancora in due posti, entrambi fuori: `COMANDI.md`,
  //    cioè il menù che legge Nicola, e `cervello/sentinelle.md`, cioè la regola che dovrebbe
  //    accorgersi proprio di questo disallineamento. Adesso il perimetro lo DERIVA il repo
  //    (`cervello/perimetro-conteggi.mjs`): si guarda tutto ciò che può pilotare il lavoro, e la
  //    storia — briefing, decisioni, quaderni — resta esente col suo perché scritto.
  const elencoRepo = fileDelRepo();
  const perimetroCieco = elencoRepo === null;
  const perimetro = perimetroDaRepo(elencoRepo || []);
  const testiPerimetro = Object.fromEntries(perimetro.map((rel) => [rel, leggiTesto(rel)]).filter(([, t]) => t));
  const conteggiSbagliati = perimetroCieco ? [] : conteggiSbagliatiPuro(testiPerimetro, nReali);
  //    IL TETTO SUL DEBITO EREDITATO. Allargando il perimetro sono usciti in un colpo 26 conteggi
  //    vecchi che nessuno guardava da mesi: farli fallire tutti insieme renderebbe questo guardiano
  //    rosso per costruzione, e un guardiano sempre rosso si impara a saltare entro la settimana —
  //    è scritto in questa casa e ci è già costato AR-346. Quindi il debito si MISURA sotto un tetto
  //    che può solo scendere (`cervello/tetti-lotto.json`), mentre un conteggio vecchio NUOVO —
  //    cioè sopra il tetto — blocca come prima. Il tetto non si alza mai: chi lo alza sta spostando
  //    il metro invece del codice.
  const tettoConteggi = leggiTettoConteggi();
  const conteggiOltreIlTetto = Math.max(0, conteggiSbagliati.length - tettoConteggi);

  // 9. AR-349 — I PERCORSI SCRITTI DENTRO UN MANSIONARIO SONO CONFIGURAZIONE, NON PROSA.
  //    Sette schede mandavano il senior a leggere `MyCity-Vault/02-Aree/Area - Consegna.md`: quella
  //    cartella non esiste più (le Aree stanno sotto 04-Prodotto-Ops) e nessun controllo apriva i
  //    percorsi citati, perché il mansionario era trattato come testo per il modello. L'elenco dei file
  //    veri viene da `git ls-files` — misurato dal repo, non un recinto scritto a mano.
  //    AR-339 — l'elenco si chiede alla PORTA (`percorsiDaGit`), non a git direttamente: la porta
  //    mette il `-z`, quindi un nome con l'accento o con uno spazio non viene troncato a metà, e
  //    cattura lo stderr invece di stamparlo crudo (AR-643). Chi la aggira si riporta dietro
  //    entrambi i difetti — ed è successo proprio qui, in questo lotto.
  let fileTracciati = [];
  try {
    fileTracciati = percorsiDaGit(["ls-files"], { cwd: AD_ROOT });
  } catch {
    fileTracciati = []; // fuori da un clone git: il controllo si limita ai percorsi assoluti dalla radice
  }
  const perBasename = new Map();
  for (const f of fileTracciati) {
    const b = basename(f);
    if (!perBasename.has(b)) perBasename.set(b, []);
    perBasename.get(b).push(f);
  }
  const risolviPercorso = (p) => {
    if (existsSync(join(AD_ROOT, p))) return true;
    if (!fileTracciati.length) return true; // niente indice = niente verdetto (meglio muto che bugiardo)
    return (perBasename.get(basename(p)) || []).some((f) => f === p || f.endsWith("/" + p));
  };
  const percorsiRotti = percorsiMorti(
    agentiReali.map((n) => ({ nome: n, testo: readFileSync(join(AGENTS_DIR, `${n}.md`), "utf8") })),
    risolviPercorso
  );

  // 10. AR-188 / AR-585 — LA MATRICE LETTA DALL'ALTRO LATO. Il registro verificava che ogni AGENTE
  //     avesse un mandato, mai che ogni CANALE verso clienti e negozianti avesse un agente: così la
  //     consegnabilità della posta e il filo WhatsApp col negoziante non erano di nessuno, e il buco si
  //     sarebbe visto il giorno del primo invio.
  const canaliOrfani = canaliSenzaOwner(canaliVersoPersone(leggiTesto("cervello/azioni.md")), descriptions);

  // 11. AR-130 — IL GENERALISTA MUTO. Se due o più specialisti rimandano a un senior, quel senior è un
  //     capofila: deve dichiarare nella PROPRIA description dove finisce il suo confine, altrimenti chi
  //     legge solo la sua scheda crede che faccia tutto e il lavoro si ferma dal generalista.
  const generalistiMuti = capifilaMuti(agentiReali.map((n) => ({ nome: n, description: descriptions.get(n) })));

  const driftTotale =
    orfani.length +
    assentiDaAgentiMd.length +
    (conteggioIncoerente ? 1 : 0) +
    nCollisioni +
    senzaKpi.length +
    conteggiOltreIlTetto +
    nomi.problemi + // AR-619: un name incoerente rompe il routing anche con 120 file = 120 dichiarati
    percorsiRotti.length + // AR-349
    canaliOrfani.length + // AR-188 / AR-585
    generalistiMuti.length; // AR-130

  await stampSegnale(
    "agent-registry",
    driftTotale > 0 ? "warn" : "ok",
    `${orfani.length} orfani · ${senzaKpi.length} senza KPI OKR · ${nCollisioni} collisioni · ${quando}`
  );

  if (JSON_MODE) {
    console.log(
      JSON.stringify(
        {
          quando,
          n_reali: nReali,
          orfani,
          assenti_da_agenti_md: assentiDaAgentiMd,
          n_dichiarato_agenti_md: nDichiaratoAgentiMd,
          conteggio_incoerente: conteggioIncoerente,
          collisioni_coppie: collisioniCoppie,
          deferral_mancante: deferralMancante,
          senza_kpi_okr: senzaKpi,
          conteggi_sbagliati: conteggiSbagliati,
          nomi_frontmatter: nomi, // AR-619
          percorsi_morti: percorsiRotti, // AR-349
          canali_senza_owner: canaliOrfani, // AR-188 / AR-585
          generalisti_muti: generalistiMuti, // AR-130
          drift_totale: driftTotale,
        },
        null,
        2
      )
    );
  } else {
    console.log(`\n🧭 AGENT REGISTRY DRIFT — ${quando}\n`);
    console.log(`Agenti reali (.claude/agents/*.md): ${nReali}`);
    if (nDichiaratoAgentiMd != null) {
      console.log(
        `Dichiarati in AGENTI.md: ${nDichiaratoAgentiMd}${conteggioIncoerente ? "  ⚠️  INCOERENTE" : "  ✅"}`
      );
    }

    if (driftTotale === 0) {
      console.log(`\n✅ nessun drift`);
    } else {
      console.log(
        `\n❌ ${orfani.length} ORFANI (0 occorrenze in CLAUDE.md e COMANDI.md — il router non li vede):`
      );
      for (const n of orfani) console.log(`  • ${n}`);

      if (assentiDaAgentiMd.length) {
        console.log(`\n⚠️  ${assentiDaAgentiMd.length} assenti dall'organigramma AGENTI.md:`);
        for (const n of assentiDaAgentiMd) console.log(`  • ${n}`);
      }

      if (conteggioIncoerente) {
        console.log(
          `\n🔢 Conteggio incoerente: AGENTI.md dichiara ${nDichiaratoAgentiMd} senior, i file reali sono ${nReali}.`
        );
      }

      if (conteggiSbagliati.length) {
        // AR-195: qui fa più male che altrove — sono i file che PILOTANO il lavoro, non gli elenchi.
        console.log(`\n🔢 ${conteggiSbagliati.length} conteggi vecchi nei file che pilotano il lavoro (reali: ${nReali}):`);
        for (const c of conteggiSbagliati) console.log(`  • ${c.file}: dichiara ${c.dichiarato}`);
      }

      if (collisioniCoppie.length) {
        console.log(
          `\n🔀 ${collisioniCoppie.length} COPPIE con ≥2 frasi-trigger condivise (description — il router non distingue):`
        );
        for (const c of collisioniCoppie) {
          console.log(`  • ${c.a} ↔ ${c.b}: ${c.condivise.map((f) => `"${f}"`).join(", ")}`);
        }
      }

      if (deferralMancante.length) {
        console.log(
          `\n↪️  ${deferralMancante.length} agenti in collisione SENZA deferral nella description:`
        );
        for (const d of deferralMancante) {
          console.log(
            `  • ${d.agente} (vicino ${d.vicino}): ${d.condivise.map((f) => `"${f}"`).join(", ")}`
          );
        }
      }

      if (senzaKpi.length) {
        console.log(
          `\n📊 ${senzaKpi.length} agenti SENZA KPI in OKR-Squadra (CLAUDE.md: ogni reparto possiede un KPI):`
        );
        for (const n of senzaKpi.slice(0, 20)) console.log(`  • ${n}`);
        if (senzaKpi.length > 20) console.log(`  … e altri ${senzaKpi.length - 20}`);
      }

      if (percorsiRotti.length) {
        // AR-349: un percorso dentro un prompt è configurazione — se non si apre, il senior va a sbattere.
        console.log(`\n🗺️  ${percorsiRotti.length} percorsi citati nei mansionari che non esistono:`);
        for (const p of percorsiRotti) console.log(`  • ${p.agente}.md → ${p.percorso}`);
      }

      if (canaliOrfani.length) {
        // AR-188 / AR-585: la copertura letta dal lato del mondo, non dell'organigramma.
        console.log(`\n📮 ${canaliOrfani.length} canali verso clienti/negozianti senza nessun senior che li reclami:`);
        for (const c of canaliOrfani) console.log(`  • ${c.canale} (nessuna description nomina "${c.chiave}")`);
      }

      if (generalistiMuti.length) {
        // AR-130: il capofila che non dichiara il confine si tiene lavoro che è di uno specialista.
        console.log(`\n🔇 ${generalistiMuti.length} capifila senza un solo deferral nella propria description:`);
        for (const n of generalistiMuti) console.log(`  • ${n} (≥2 specialisti gli rimandano, lui non rimanda a nessuno)`);
      }

      if (nomi.problemi) {
        // AR-619: il router instrada sul `name` del frontmatter, non sul nome-file.
        console.log(`\n🪪 ${nomi.problemi} problemi sul campo \`name\` del frontmatter (il router instrada su QUELLO):`);
        for (const f of nomi.senzaName) console.log(`  • ${f}.md: name MANCANTE`);
        for (const x of nomi.nomeDiverso) console.log(`  • ${x.file}.md: name "${x.name}" ≠ nome-file — la delega andrebbe a un senior che non esiste nel registro`);
        for (const x of nomi.nameDoppi) console.log(`  • name "${x.name}" DOPPIO in: ${x.files.map((f) => `${f}.md`).join(", ")}`);
      }
    }
    console.log(`\nDrift totale: ${driftTotale}`);
  }

  process.exit(driftTotale > 0 ? 1 : 0);
}

// Il CLI parte solo se questo file è LANCIATO: un test che importa estraiName/analizzaNomi non deve
// far girare il guardiano intero né stampare segnali (malattia «programma-che-parte-importando»).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (e) => {
    console.error("ERRORE agent-registry-check:", e.message || e);
    await stampSegnale(
      "agent-registry",
      "errore",
      `crash: ${(e.message || e).toString().slice(0, 200)}`
    );
    process.exit(1);
  });
}
