#!/usr/bin/env node
// 🩺 ANCORA ROTTI? — riesegue il SINTOMO di ogni difetto aperto e dice quali si riproducono oggi.
//
// 🟢 Sola lettura sul cantiere e sul codice; scrive solo il proprio referto
// (auto-coscienza/ancora-rotti.json). Non chiude niente e non tocca le schede: il conto lo legge
// chi decide, e chi decide resta Nicola.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ
// ─────────────────────────────────────────────────────────────────────────────
//
// Nicola, 16/8: «trova il modo per sapere se i 138 difetti sono ancora rotti».
//
// Dei 210 difetti non chiusi, 138 non aspettano una riparazione: aspettano un metro. E il metro che
// mancava non è «il fix è stato scritto?» — quello si compra scrivendo una parola. È «la malattia
// si riproduce ancora?», che scende solo se la malattia guarisce davvero.
//
// La regola e i tre esiti stanno nel modulo puro `sintomo.mjs`, dove un test li può ESEGUIRE. Qui
// c'è solo il lavoro sporco: leggere il cantiere, far girare i comandi, contare, scrivere il referto.
//
// ⚪ NON È UN VERDE. Un difetto senza sintomo dichiarato, o il cui sintomo non gira, finisce in
// «non misurati» — la colonna che dice quanto di ciò che chiamiamo «difetti aperti» è in realtà
// ignoto. Nessuno lo nasconde nel totale, ed è il punto di tutto lo strumento.
//
// Uso:
//   node cervello/ancora-rotti.mjs                 referto + scrive ancora-rotti.json
//   node cervello/ancora-rotti.mjs --dry           referto, NON scrive
//   node cervello/ancora-rotti.mjs --json          esce in JSON
//   node cervello/ancora-rotti.mjs --id AR-128     misura un difetto solo
//   node cervello/ancora-rotti.mjs --conta-ignoti  stampa solo quanti restano ignoti (per il tetto)
//   node cervello/ancora-rotti.mjs --gate          exit 1 se un difetto dichiarato SANO è ancora ROTTO
//
// Env: SINTOMO_TIMEOUT_MS (default 20000) = quanto si aspetta una singola misura prima di
//      dichiararla non misurata. Un sintomo che non risponde è un buco, non un verde.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import {
  DEBOLE,
  NON_MISURATO,
  ROTTO,
  SANO,
  contaEsiti,
  forzaSintomo,
  verdettoDelDifetto,
  verdettoSintomo,
} from "./sintomo.mjs";

const ARGV = process.argv.slice(2);
const JSON_MODE = ARGV.includes("--json");
const DRY = ARGV.includes("--dry");
const GATE = ARGV.includes("--gate");
const SOLO_CONTA = ARGV.includes("--conta-ignoti");
const SOLO_ID = (() => {
  const i = ARGV.indexOf("--id");
  return i >= 0 ? ARGV[i + 1] : null;
})();

const TIMEOUT = Number(process.env.SINTOMO_TIMEOUT_MS || 20000);
const CANTIERE = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const REFERTO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/ancora-rotti.json");

/**
 * Fa girare la misura e riporta i FATTI, senza interpretarli.
 *
 * L'interpretazione è tutta in `verdettoSintomo`, e non è pigrizia: è la condizione perché un test
 * possa provare il ramo «il comando è esploso» senza dover far esplodere un comando vero.
 */
function osserva(misura) {
  try {
    const uscita = execSync(misura, {
      cwd: AD_ROOT,
      encoding: "utf8",
      timeout: TIMEOUT,
      stdio: ["ignore", "pipe", "pipe"],
      shell: "/bin/bash",
    });
    return { uscita, codice: 0, errore: null };
  } catch (e) {
    // ⚠️ Qui NON si torna zero. Un comando che esce diverso da zero può benissimo aver stampato il
    // suo numero — `grep -c` esce 1 proprio quando conta zero, cioè quando la malattia è sparita.
    // Si passano i fatti a chi decide: l'uscita che c'è, il codice, e l'errore solo se è morto
    // davvero (timeout, comando inesistente, shell che non parte).
    const uscita = e?.stdout ? String(e.stdout) : "";
    const morto = e?.killed || e?.code === "ETIMEDOUT" || e?.status === undefined;
    return {
      uscita,
      codice: typeof e?.status === "number" ? e.status : null,
      errore: morto ? `${e?.code || "morto"}: ${String(e?.message || "").slice(0, 160)}` : null,
    };
  }
}

function difettiAperti() {
  const cantiere = JSON.parse(readFileSync(CANTIERE, "utf8"));
  const aperti = (cantiere.difetti || []).filter((d) => d && d.stato !== "chiuso");
  return SOLO_ID ? aperti.filter((d) => d.id === SOLO_ID) : aperti;
}

const aperti = difettiAperti();
const righe = [];

for (const d of aperti) {
  if (!d.sintomo) {
    righe.push({
      id: d.id,
      gravita: d.gravita ?? null,
      esito: NON_MISURATO,
      valore: null,
      perche: "nessun sintomo dichiarato: nessuno sa se questo difetto sia ancora rotto",
      titolo: String(d.titolo || "").slice(0, 120),
    });
    continue;
  }
  // Un difetto può chiedere più cose (AR-216 ne chiede tre): si osserva OGNI clausola, e basta che
  // una parli perché il difetto sia rotto. La prima versione guardava solo la prima, e al primo
  // referto ha stampato un falso guarito.
  const clausole = [d.sintomo, ...(d.sintomo.altre_misure || [])];
  const osservazioni = clausole.map((c) => verdettoSintomo({ sintomo: c, ...osserva(c.misura) }));
  const v = verdettoDelDifetto(osservazioni);
  righe.push({
    id: d.id,
    gravita: d.gravita ?? null,
    esito: v.esito,
    valore: v.clausole?.find(c => c.valore !== null)?.valore ?? null,
    perche: v.perche,
    clausole: (v.clausole || []).length,
    // La forza va accanto al verdetto e non in fondo: un «guarito» contato con un grep sul codice
    // non vale quanto un «guarito» letto dal dato, e chi legge deve vederlo nella stessa riga.
    forza: forzaSintomo(d.sintomo.misura),
    misura: d.sintomo.misura,
    alla_nascita: d.sintomo.alla_nascita,
    titolo: String(d.titolo || "").slice(0, 120),
  });
}

const conto = contaEsiti(righe);
const dichiaratiSani = righe.filter((r) => r.esito === SANO);
const ancoraRotti = righe.filter((r) => r.esito === ROTTO);

if (SOLO_CONTA) {
  console.log(String(conto.non_misurati));
  process.exit(0);
}

const referto = {
  _cosa_e:
    "🩺 ANCORA ROTTI? — per ogni difetto aperto riesegue il SINTOMO (la misura che l'ha fatto nascere) e dice se la malattia si riproduce oggi. Nasce da Nicola il 2026-08-16: «trova il modo per sapere se i 138 difetti sono ancora rotti». Scritto da cervello/ancora-rotti.mjs.",
  _cosa_NON_prova:
    "Non prova che un difetto SANO sia riparato bene: prova che il suo sintomo non si riproduce. E soprattutto: «non misurato» NON è «a posto» — è un difetto di cui nessuno sa niente, e sta in una colonna sua apposta perché non si confonda con una guarigione.",
  aggiornato: nowPiacenza(),
  scritto_da: "ancora-rotti.mjs",
  aperti_esaminati: righe.length,
  conto,
  ancora_rotti: ancoraRotti.map((r) => ({ id: r.id, gravita: r.gravita, valore: r.valore, misura: r.misura })),
  guariti_da_confermare: dichiaratiSani.map((r) => ({
    id: r.id,
    gravita: r.gravita,
    valore: r.valore,
    alla_nascita: r.alla_nascita,
    misura: r.misura,
  })),
  righe,
};

if (JSON_MODE) {
  console.log(JSON.stringify(referto, null, 2));
} else {
  console.log(`🩺 ANCORA ROTTI? — ${referto.aggiornato}\n`);
  console.log(`   Difetti aperti esaminati: ${conto.totale}`);
  console.log(`   · ancora rotti (il sintomo si riproduce): ${conto.rotti}`);
  console.log(`   · guariti da confermare (non si riproduce): ${conto.sani}`);
  console.log(`   · ⚪ non misurati (nessuno sa): ${conto.non_misurati}`);
  console.log(`   Copertura della misura: ${Math.round(conto.copertura * 100)}%\n`);
  const marchio = (r) => (r.forza === DEBOLE ? " (metro debole: conta la parola, non la cosa)" : "");
  if (ancoraRotti.length) {
    console.log("   🔴 ANCORA ROTTI:");
    for (const r of ancoraRotti.slice(0, 30)) {
      console.log(`   · ${r.id} [${r.gravita}] — ${r.perche}${marchio(r)}`);
      console.log(`     ${r.titolo}`);
    }
    if (ancoraRotti.length > 30) console.log(`   … e altri ${ancoraRotti.length - 30}`);
    console.log("");
  }
  if (dichiaratiSani.length) {
    console.log("   🟢 IL SINTOMO NON SI RIPRODUCE PIÙ (da confermare a mano prima di chiudere):");
    for (const r of dichiaratiSani.slice(0, 30)) {
      console.log(`   · ${r.id} [${r.gravita}] — ${r.perche}${marchio(r)}`);
    }
    console.log("");
  }
  if (conto.non_misurati) {
    console.log(
      `   ⚪ ${conto.non_misurati} difetti su ${conto.totale} non si sono lasciati misurare: non sono verdi, sono ignoti.`,
    );
  }
}

// Il cancello guarda una cosa sola, e non è il conto: un difetto che qualcuno ha già dichiarato
// SANO nella scheda mentre il suo sintomo si riproduce ancora è una bugia che il Pannello mostra.
if (GATE) {
  const bugie = righe.filter((r) => r.esito === ROTTO && r.dichiarato_sano);
  if (bugie.length) {
    console.error(`\n❌ ${bugie.length} difetti dichiarati a posto mentre il sintomo si riproduce ancora.`);
    process.exit(1);
  }
}

if (!DRY && !JSON_MODE) {
  writeFileSync(REFERTO, JSON.stringify(referto, null, 2) + "\n");
  console.log(`\n   referto → MyCity-Vault/90-Memoria-AI/auto-coscienza/ancora-rotti.json`);
}
