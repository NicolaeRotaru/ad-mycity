#!/usr/bin/env node
// 👷 CHI RISPONDE DI QUESTO DIFETTO, ED ENTRO QUANDO — il guardiano che AR-432 chiedeva.
//
// ─────────────────────────────────────────────────────────────────────────────
// IL DIFETTO, in una riga: il cantiere è l'unico elenco di lavoro della macchina senza un padrone.
// ─────────────────────────────────────────────────────────────────────────────
// Misurato il 15/8/2026 sul cantiere vero: **240 schede da fare, 0 con `owner`, 0 con `scadenza`**.
// Di quelle, 51 sono ad alto impatto sulla crescita. Nel resto della macchina il responsabile esiste
// ed è preteso — `REGISTRO-RISCHI.json` ce l'ha su tutti e 14 e `coerenza-rischi.mjs` fallisce se un
// rischio ALTA ne è privo — ma il registro dei difetti no, perché è nato come diario di una
// radiografia invece che come elenco di impegni con un nome e una data.
//
// LA CAUSA DI SISTEMA (quinto perché, dalla scheda): il lavoro della macchina su sé stessa è stato
// modellato come CONOSCENZA — un elenco di verità sulla macchina — e non come ESECUZIONE. Perciò
// nessuno dei 120 senior è mai stato messo in mezzo.
//
// ⚠️ QUESTO GUARDIANO OGGI È ROSSO, E DEVE ESSERLO. La scheda avverte: «il file che esiste ma non
// fallisce mai è un cartello, non un cancello». Non ha un tetto discendente apposta — un tetto qui
// significherebbe «va bene che 51 difetti gravi non siano di nessuno, purché non diventino 52».
// Diventa verde quando le schede ad alto impatto hanno un nome e una data, non prima. Assegnarle è
// una scrittura sul cantiere: si propone con `--proponi` e la firma resta di Nicola (🟡).
//
// USO:
//   node cervello/cantiere-owner-check.mjs            → verdetto (0 verde · 1 rosso · 2 cieco)
//   node cervello/cantiere-owner-check.mjs --json     → lo stesso per le macchine
//   node cervello/cantiere-owner-check.mjs --proponi  → chi metterei su ogni scheda scoperta (non scrive)
//
// 🟢 Sola lettura. Le funzioni di giudizio sono pure ed esportate: un test le esegue senza disco.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { contaGoverno, eDaFare } from "./stati-cantiere.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ROOT = join(QUI, "..");

/** I codici d'uscita di casa: 0 misurato e verde · 1 violazione · 2 non ho potuto guardare. */
export const CODICE = { verde: 0, rosso: 1, cieco: 2 };

/**
 * Da quale reparto nasce un difetto, in base alla sua dimensione.
 *
 * Non è un'assegnazione automatica: è una PROPOSTA, perché mettere un nome su una scheda è una
 * scrittura nel registro e il registro lo firma Nicola. Serve a evitare la scusa più comoda («non
 * saprei a chi darlo»), che è il motivo per cui 240 schede non hanno un responsabile.
 *
 * Le dimensioni che non conosco NON prendono un owner a caso: tornano `null`, cioè «lo devi
 * decidere tu». Un padrone inventato è peggio di nessun padrone: sembra assegnato.
 */
export const OWNER_PER_DIMENSIONE = Object.freeze({
  "rischio-sicurezza-se": "security",
  "pannello-robustezza-sicurezza": "security",
  "efficienza-costo": "builder-automazioni",
  "memoria-costo": "builder-automazioni",
  "copertura-cieca": "qa",
  "cantiere-prove": "qa",
  "guardrail-semaforo": "qa",
  "guardiani-e-guardrail": "qa",
  "guardiani-verita": "qa",
  "calibrazione-onesta": "analista",
  "salute-sensori-dati": "data-engineer",
  "sensori-e-misure": "data-engineer",
  "sensori-e-cadenza": "data-engineer",
  "integrita-memoria": "data-engineer",
  "memoria-registro": "data-engineer",
  "memoria-e-verita": "data-engineer",
  "memoria-e-volano": "data-engineer",
  worker: "devops-sre",
  "worker-concorrenza": "devops-sre",
  "worker-vincoli-hard": "devops-sre",
  "worker-pubblicazione": "devops-sre",
  "pannello-comportamento": "frontend-dev",
  "scrittura-umana": "content-social",
  "allineamento-northstar": "product-manager",
  "chiusura-volano": "product-manager",
  processi: "chief-of-staff",
  "processi-e-cadenze": "chief-of-staff",
  "cadenza-esecuzione": "chief-of-staff",
  "strategia-costo-rischio": "corporate-strategy",
  "vettori-installati": "prompt-engineer",
  "ad-e-senior": "prompt-engineer",
});

/** Chi proporrei come responsabile di questa scheda. `null` = non lo so, lo decide un umano. */
export function ownerSuggerito(difetto) {
  const dim = String(difetto?.dimensione ?? "").trim();
  return OWNER_PER_DIMENSIONE[dim] ?? null;
}

/**
 * IL VERDETTO — puro, così un test lo può eseguire su un cantiere finto invece che su quello vero.
 *
 * Rosso quando una scheda AD ALTO IMPATTO da fare è senza responsabile, oppure ha una scadenza già
 * passata. Le altre si contano e basta: il debito si vede, ma non blocca. Cieco quando non è
 * arrivata una lista o non è arrivato l'elenco dei senior — un guardiano che non ha potuto guardare
 * non dice verde.
 *
 * @param difetti  le schede del cantiere
 * @param agentiNoti  i nomi dei senior che esistono davvero (da `.claude/agents/`)
 * @param oggiMs  la data di riferimento, passata da fuori: un giudizio che chiede l'ora all'orologio
 *                non si può ripetere due volte con lo stesso risultato.
 */
export function verdettoGoverno(difetti, { agentiNoti, oggiMs } = {}) {
  if (!Array.isArray(difetti)) {
    return { codice: CODICE.cieco, motivo: "non mi è arrivata una lista di schede: non ho potuto guardare", violazioni: [], conto: null };
  }
  if (!Array.isArray(agentiNoti) || agentiNoti.length === 0) {
    return {
      codice: CODICE.cieco,
      motivo: "non mi è arrivato l'elenco dei senior: senza quello non posso dire se un responsabile esiste",
      violazioni: [],
      conto: null,
    };
  }
  const noti = new Set(agentiNoti.map((a) => String(a).trim()));
  const conto = contaGoverno(difetti, oggiMs);
  const violazioni = [];
  const daSistemare = [];
  for (const d of difetti.filter(Boolean).filter(eDaFare)) {
    const owner = String(d?.owner ?? "").trim();
    const scadenzaMs = Date.parse(String(d?.scadenza ?? "").slice(0, 10));
    const alto = String(d?.impatto_crescita ?? "").trim() === "alto";
    const problemi = [];
    if (!owner) problemi.push("senza responsabile");
    else if (!noti.has(owner)) problemi.push(`responsabile «${owner}» non è uno dei ${noti.size} senior`);
    if (Number.isNaN(scadenzaMs)) problemi.push("senza data entro cui va chiuso");
    else if (Number.isFinite(oggiMs) && scadenzaMs < oggiMs) problemi.push("oltre la data entro cui andava chiuso");
    if (!problemi.length) continue;
    const voce = { id: String(d?.id ?? "?"), alto, problemi, proposta: ownerSuggerito(d) };
    daSistemare.push(voce);
    if (alto) violazioni.push(voce);
  }
  return {
    codice: violazioni.length ? CODICE.rosso : CODICE.verde,
    motivo: violazioni.length
      ? `${violazioni.length} difetti ad alto impatto sulla crescita non hanno un responsabile o hanno sforato la data`
      : "ogni difetto ad alto impatto ha un responsabile vivo e una data ancora buona",
    violazioni,
    da_sistemare: daSistemare,
    conto,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LA RIGA DI COMANDO — legge, giudica, stampa. Non scrive niente.
// ═══════════════════════════════════════════════════════════════════════════

/** I 120 senior che esistono davvero: i file di `.claude/agents/`, senza l'estensione. */
export function senioriSulDisco(root = ROOT) {
  const dir = join(root, ".claude", "agents");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3));
}

function main() {
  const JSON_OUT = process.argv.includes("--json");
  const PROPONI = process.argv.includes("--proponi");
  const cantierePath = join(ROOT, "MyCity-Vault", "90-Memoria-AI", "auto-coscienza", "cantiere-difetti.json");
  let difetti = null;
  try {
    difetti = JSON.parse(readFileSync(cantierePath, "utf8")).difetti;
  } catch {
    difetti = null;
  }
  const v = verdettoGoverno(difetti, { agentiNoti: senioriSulDisco(), oggiMs: Date.now() });

  if (JSON_OUT) {
    process.stdout.write(JSON.stringify(v, null, 2) + "\n");
    process.exit(v.codice);
  }

  if (v.codice === CODICE.cieco) {
    console.log("⚪ NON HO POTUTO GUARDARE CHI RISPONDE DEI DIFETTI.");
    console.log(`   ${v.motivo}`);
    console.log("   Questo non è «va tutto bene»: è che non ho guardato. Esco con 2.");
    process.exit(v.codice);
  }

  const c = v.conto;
  console.log("👷 CHI RISPONDE DEI DIFETTI DEL CANTIERE");
  console.log(`   ${c.da_fare} schede da fare · ${c.senza_owner} senza un responsabile · ${c.senza_scadenza} senza una data`);
  if (c.scaduti) console.log(`   ${c.scaduti} hanno sforato la data entro cui andavano chiuse`);
  console.log("");

  if (PROPONI) {
    console.log("🟡 CHI METTEREI SU OGNI SCHEDA SCOPERTA (proposta: non scrivo niente, la firma è di Nicola)");
    const perOwner = new Map();
    for (const x of v.da_sistemare) {
      const chi = x.proposta || "— da decidere a mano";
      if (!perOwner.has(chi)) perOwner.set(chi, []);
      perOwner.get(chi).push(x.id);
    }
    for (const [chi, ids] of [...perOwner.entries()].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`   ${chi}: ${ids.length} schede — ${ids.slice(0, 12).join(", ")}${ids.length > 12 ? "…" : ""}`);
    }
    console.log("");
  }

  if (v.codice === CODICE.rosso) {
    console.log(`❌ ${v.motivo}.`);
    for (const x of v.violazioni.slice(0, 15)) {
      console.log(`   ${x.id}: ${x.problemi.join(" · ")}${x.proposta ? ` → proporrei ${x.proposta}` : ""}`);
    }
    if (v.violazioni.length > 15) console.log(`   …e altre ${v.violazioni.length - 15}.`);
    console.log("");
    console.log("   Un elenco di lavoro senza un nome e una data non è un elenco di lavoro: è un diario.");
    console.log("   Per vedere chi metterei su ognuna: node cervello/cantiere-owner-check.mjs --proponi");
  } else {
    console.log(`✅ ${v.motivo}.`);
  }
  process.exit(v.codice);
}

if (process.argv[1] && process.argv[1].endsWith("cantiere-owner-check.mjs")) main();
