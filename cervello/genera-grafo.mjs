#!/usr/bin/env node
// genera-grafo.mjs — costruisce il JSON del GRAFO D'INFLUENZA (Ondata 3.6) da radar.json
// e lo scrive in pannello/public/radar-grafo.json (asset statico → la Cabina lo disegna
// ovunque, anche su Vercel dove non legge cervello/). Rilancia questo script quando cambi radar.json:
//   node cervello/genera-grafo.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const radar = JSON.parse(readFileSync(join(repo, "cervello/radar.json"), "utf-8"));
const fattori = radar.fattori || [];

// IN: aggrega per AREA (non 100 nodi) → un nodo-area con peso e i fattori di punta.
const inByArea = {};
for (const f of fattori) {
  if (f.direzione !== "IN") continue;
  const a = (inByArea[f.area] ||= { area: f.area, n: 0, pesoMax: 0, top: [] });
  a.n++;
  a.pesoMax = Math.max(a.pesoMax, f.peso || 0);
  a.top.push({ fattore: f.fattore, peso: f.peso || 0 });
}
const aree_in = Object.values(inByArea)
  .map((a) => ({ area: a.area, n: a.n, peso: a.pesoMax, top: a.top.sort((x, y) => y.peso - x.peso).slice(0, 3).map((t) => t.fattore) }))
  .sort((x, y) => y.peso - x.peso || y.n - x.n);

// OUT: le leve che MyCity spinge.
const leve_out = fattori
  .filter((f) => f.direzione === "OUT")
  .map((f) => ({ nome: f.fattore, peso: f.peso || 0, leva: f.leva_uscita || "", indiretto: f.effetto_indiretto || "", colore: f.colore || "giallo", senior: f.senior || [] }))
  .sort((x, y) => y.peso - x.peso);

// Catene indirette (2°-3° ordine).
const catene = (radar.catene_indirette || []).map((c) => ({ catena: c.catena, anelli: c.anelli, opportunita: c.opportunita, senior: c.senior || [] }));

const grafo = {
  generato: radar.aggiornato || "",
  centro: "MyCity",
  totali: { in: fattori.filter((f) => f.direzione === "IN").length, out: leve_out.length, aree_in: aree_in.length, catene: catene.length },
  aree_in,
  leve_out,
  catene,
};

const out = join(repo, "pannello/public/radar-grafo.json");
writeFileSync(out, JSON.stringify(grafo, null, 1), "utf-8");
console.log(`OK → pannello/public/radar-grafo.json · IN ${grafo.totali.in} (${aree_in.length} aree) · OUT ${leve_out.length} · catene ${catene.length}`);
