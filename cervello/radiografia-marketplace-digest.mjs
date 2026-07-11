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

// 2) Normalizza: dimensioni → findings col campo `dove` (come la radiografia della macchina).
const dimensioni = (Array.isArray(raw.result) ? raw.result : []).map((d) => ({
  key: String(d.dimensione || "").trim() || "senza-nome",
  findings: (Array.isArray(d.findings) ? d.findings : []).map((f) => ({
    titolo: f.titolo || "",
    severita: f.severita || "minore",
    descrizione: f.descrizione || "",
    impatto: f.impatto || "",
    fix: f.fix || "",
    dove: f.dove || f.file || "",
  })),
}));

const tutti = dimensioni.flatMap((d) => d.findings);
const conta = (sev) => tutti.filter((f) => f.severita === sev).length;
const meta = {
  findings: tutti.length,
  bloccanti: conta("bloccante"),
  gravi: conta("grave"),
  minori: conta("minore"),
  agenti: Number(raw.agentCount) || null,
};

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
    "Digest canonico dell'ultima radiografia PROFONDA del marketplace (workflow `radiografia`, 13 dimensioni in sola lettura, ogni problema verificato). Generato da cervello/radiografia-marketplace-digest.mjs a partire dal raw in consegne/audit/. Il Pannello lo legge in Macchina → Radiografia marketplace.",
  data,
  fonte_raw: `consegne/audit/${rawName}`,
  report,
  sintesi,
  meta,
  dimensioni,
};

writeFileSync(OUT, JSON.stringify(digest, null, 2) + "\n");
console.log(
  `radiografia-marketplace.json scritto: ${data} · ${dimensioni.length} dimensioni · ${meta.findings} findings ` +
  `(${meta.bloccanti} bloccanti · ${meta.gravi} gravi · ${meta.minori} minori)${meta.agenti ? ` · ${meta.agenti} agenti` : ""}`
);
