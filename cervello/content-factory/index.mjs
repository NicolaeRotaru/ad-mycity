// ============================================================================
// Content Factory — index.mjs (orchestratore)
// Legge calendario-grafico.json e genera TUTTI i contenuti grafici di una
// settimana: un PNG per pilastro (storia/consiglio/weekend/prova) + 1 reel .webm.
//
// 🟢 Locale, reversibile. Output in creativi/output/social/.
//
// Uso:
//   node cervello/content-factory/index.mjs --settimana 1
//   node cervello/content-factory/index.mjs --settimana 1 --no-reel
//   node cervello/content-factory/index.mjs --settimana 1 --solo-reel
// ============================================================================

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderVoce } from "./render.mjs";
import { generaReel } from "./reel.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", ".."); // /home/user/ad-mycity
const OUT_DIR = join(ROOT, "creativi", "output", "social");
const DATA = join(__dirname, "calendario-grafico.json");

function arg(name, def = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

async function main() {
  const settimana = String(arg("--settimana", "1"));
  const noReel = process.argv.includes("--no-reel");
  const soloReel = process.argv.includes("--solo-reel");

  let cal;
  try {
    cal = JSON.parse(readFileSync(DATA, "utf8"));
  } catch (e) {
    console.error("Impossibile leggere calendario-grafico.json:", e.message);
    process.exit(1);
  }

  const voci = cal.settimane?.[settimana] || [];
  if (voci.length === 0 && !soloReel) {
    console.error(`Nessuna voce per la settimana ${settimana}.`);
    process.exit(1);
  }

  console.log(`\n🏭 Content Factory — Settimana ${settimana}`);
  console.log(`   Output: ${OUT_DIR}\n`);

  const prodotti = [];

  // ── PNG (uno per pilastro) ──────────────────────────────────────────────
  if (!soloReel) {
    // riuso un solo browser per tutta la batch (più veloce)
    const pkg = await import("/opt/node22/lib/node_modules/playwright/index.js");
    const browser = await pkg.default.chromium.launch();
    try {
      for (const voce of voci) {
        const out = join(OUT_DIR, `S${settimana}-${voce.pilastro}-${voce.formato}.png`);
        try {
          await renderVoce(voce, out, browser);
          console.log(`  ✅ PNG  ${voce.id.padEnd(18)} -> ${out}`);
          prodotti.push(out);
        } catch (e) {
          console.error(`  ❌ PNG  ${voce.id}: ${e.message}`);
        }
      }
    } finally {
      await browser.close();
    }
  }

  // ── Reel .webm ──────────────────────────────────────────────────────────
  if (!noReel) {
    const reelDef = cal.reel?.[settimana];
    if (reelDef) {
      console.log(`\n  🎬 Reel ${reelDef.id} ...`);
      const r = await generaReel(reelDef.schede, OUT_DIR, reelDef.nomeBase, { perSchedaMs: 4000 });
      if (r.ok) {
        console.log(`  ✅ REEL -> ${r.path}`);
        prodotti.push(r.path);
      } else if (r.fallback) {
        console.log(`  ⚠️  Reel video fallito (${r.errore}). Storyboard PNG:`);
        r.fallback.forEach((f) => { console.log(`     - ${f}`); prodotti.push(f); });
      } else {
        console.error(`  ❌ Reel fallito: ${r.errore}`);
      }
    } else {
      console.log(`\n  (nessun reel definito per la settimana ${settimana})`);
    }
  }

  console.log(`\n✨ Fatto: ${prodotti.length} file generati in ${OUT_DIR}\n`);
  return prodotti;
}

main().catch((e) => {
  console.error("Errore Content Factory:", e);
  process.exit(1);
});
