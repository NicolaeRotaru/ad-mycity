#!/usr/bin/env node
// 🏪 DIGEST RADIOGRAFIA MARKETPLACE — allinea i dati dell'audit profondo del sito al vault.
//
// Il workflow `radiografia` (.claude/workflows/radiografia.js) lascia il risultato grezzo in
// consegne/audit/AAAA-MM-GG-radiografia-marketplace-raw.json (13 dimensioni, ogni finding
// verificato) + il report leggibile AAAA-MM-GG-radiografia.md. Il Pannello però legge il VAULT:
// questo script prende il raw PIÙ RECENTE e scrive il digest canonico in
// MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json — stesso stile di
// auto-radiografia.json, così la pagina «Radiografia marketplace» ha una casa dati stabile.
//
// Uso: node cervello/radiografia-marketplace-digest.mjs   (🟢 sola lettura del raw + scrittura memoria AI)
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_DIR = path.join(ROOT, "consegne/audit");
const OUT = path.join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");

// 1) Trova il raw più recente (il nome inizia con la data → l'ordine alfabetico è cronologico).
const raws = readdirSync(AUDIT_DIR).filter((n) => n.endsWith("-radiografia-marketplace-raw.json")).sort();
if (raws.length === 0) {
  console.error("Nessun *-radiografia-marketplace-raw.json in consegne/audit/ — lancia prima il workflow `radiografia`.");
  process.exit(1);
}
const rawName = raws[raws.length - 1];
const data = rawName.slice(0, 10); // AAAA-MM-GG dal nome file
const raw = JSON.parse(readFileSync(path.join(AUDIT_DIR, rawName), "utf-8"));

// 2) Normalizza nella forma VIVA del referto, quella nata il 18/8/2026: l'elenco dei problemi sta
//    in `problemi[]`, uno solo, e `dimensioni[]` porta i CONTATORI. Non e' un dettaglio di gusto:
//    `cervello/radiografia-marketplace-conti.mjs` legge `problemi[]` per sapere quanti sono aperti,
//    e ogni lotto di riparazioni scrive lo stato dentro quelle voci. Finche' questo script scriveva
//    la forma vecchia (`dimensioni[].findings`), il primo digest dopo una radiografia nuova
//    cancellava lo stato di tutte le riparazioni fatte fino a quel momento. E' successo il 21/8/2026.
const REPARTI = {
  architettura: "Architettura",
  "sicurezza-auth": "Sicurezza e accessi",
  "rls-database": "Permessi sul database",
  "pagamenti-stripe": "Pagamenti",
  "privacy-legale": "Privacy e legale",
  performance: "Velocita'",
  "frontend-ux": "Interfaccia",
  accessibilita: "Accessibilita'",
  "qa-flussi": "Flussi critici",
  "api-backend": "API",
  "ai-endpoints": "Endpoint AI",
  "dati-analytics": "Dati e analitica",
  "deploy-sre": "Rilascio e affidabilita'",
};

const conta = (elenco, sev) => elenco.filter((f) => f.severita === sev).length;

const problemi = [];
const dimensioni = (Array.isArray(raw.result) ? raw.result : []).map((d) => {
  const chiave = String(d.dimensione || "").trim() || "senza-nome";
  const voci = (Array.isArray(d.findings) ? d.findings : []).map((f) => ({
    dimensione: chiave,
    reparto: REPARTI[chiave] || chiave,
    titolo: f.titolo || "",
    severita: f.severita || "minore",
    file: f.file || f.dove || "",
    descrizione: f.descrizione || "",
    impatto: f.impatto || "",
    fix: f.fix || "",
    stato: "aperto",
  }));
  problemi.push(...voci);
  return {
    chiave,
    nome: REPARTI[chiave] || chiave,
    totale: voci.length,
    bloccanti: conta(voci, "bloccante"),
    gravi: conta(voci, "grave"),
    minori: conta(voci, "minore"),
  };
});

const tutti = problemi;
const meta = {
  findings: tutti.length,
  bloccanti: conta(tutti, "bloccante"),
  gravi: conta(tutti, "grave"),
  minori: conta(tutti, "minore"),
  agenti: Number(raw.agentCount) || null,
};

// 2-bis) Il confronto con la visita precedente: si legge dal digest che sto per sostituire, cosi'
//        la serie storica non si perde a ogni radiografia nuova. Se il file non c'e', resta null.
let confrontoPrecedente = null;
if (existsSync(OUT)) {
  try {
    const vecchio = JSON.parse(readFileSync(OUT, "utf-8"));
    if (vecchio?.data && vecchio.data !== data && vecchio?.meta?.findings) {
      confrontoPrecedente = {
        data: vecchio.data,
        findings: vecchio.meta.findings,
        bloccanti: vecchio.meta.bloccanti ?? null,
        gravi: vecchio.meta.gravi ?? null,
        minori: vecchio.meta.minori ?? null,
      };
    }
  } catch { /* digest precedente illeggibile: nessun confronto, mai un numero inventato */ }
}

// 3) La sintesi: se auto-radiografia.json ha già il riassunto di QUESTO stesso audit
//    (salute_marketplace.fonte con la stessa data), riusala — una verità sola, non due.
let sintesi = raw.summary || "";
const AUTORAD = path.join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json");
if (existsSync(AUTORAD)) {
  try {
    const sm = JSON.parse(readFileSync(AUTORAD, "utf-8"))?.salute_marketplace;
    if (sm?.sintesi && String(sm?.fonte || "").includes(data)) sintesi = sm.sintesi;
  } catch { /* auto-radiografia illeggibile: resta il summary del raw */ }
}

// 4) Il report leggibile gemello, se esiste (il Pannello lo linka come fonte).
const reportName = `${data}-radiografia.md`;
const report = existsSync(path.join(AUDIT_DIR, reportName)) ? `consegne/audit/${reportName}` : null;

const digest = {
  _cosa_e:
    "Digest canonico dell'ultima radiografia PROFONDA del marketplace (workflow `radiografia`, 13 dimensioni in sola lettura, ogni problema verificato). Generato da cervello/radiografia-marketplace-digest.mjs a partire dal raw in consegne/audit/. L'elenco vivo sta in `problemi[]`: i lotti di riparazione ci scrivono dentro lo stato. `dimensioni[]` porta solo i contatori. Il Pannello lo legge in Macchina → Radiografia marketplace.",
  data,
  fonte_raw: `consegne/audit/${rawName}`,
  report,
  sintesi,
  meta,
  confronto_precedente: confrontoPrecedente,
  dimensioni,
  problemi,
};

writeFileSync(OUT, JSON.stringify(digest, null, 2) + "\n");
console.log(
  `radiografia-marketplace.json scritto: ${data} · ${dimensioni.length} dimensioni · ${meta.findings} findings ` +
  `(${meta.bloccanti} bloccanti · ${meta.gravi} gravi · ${meta.minori} minori)${meta.agenti ? ` · ${meta.agenti} agenti` : ""}` +
  `${confrontoPrecedente ? ` · prima (${confrontoPrecedente.data}): ${confrontoPrecedente.findings}` : ""}`
);
