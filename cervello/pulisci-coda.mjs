#!/usr/bin/env node
// 🧹 PULISCI CODA — rimuove i job `errore` vecchi dalla coda "In coda" del Pannello.
//
// Regole di sicurezza:
//   - Non tocca mai i job tipo "proposta" o "esegui-azione" (azioni approvate da Nicola — vanno gestite a mano).
//   - Marca i job pulibili come "annullato" (rimangono nell'Archivio, non scompaiono).
//   - Default: solo job errore più vecchi di 3 giorni.
//   - Con --esegui: esegue la pulizia. Senza: solo mostra cosa farebbe (dry-run).
//
// Uso: node cervello/pulisci-coda.mjs [--esegui] [--giorni N]
// Env: SUPABASE_URL + SUPABASE_SERVICE_KEY (progetto MEMORIA).

const URL_BASE = process.env.SUPABASE_URL?.trim();
const KEY = process.env.SUPABASE_SERVICE_KEY?.trim();
const ESEGUI = process.argv.includes("--esegui");
const GIORNI = parseInt(process.argv.find((a) => a.startsWith("--giorni="))?.split("=")[1] || "3", 10);

// Tipi di job che NON vanno mai toccati (azioni approvate da Nicola)
const TIPI_PROTETTI = ["proposta", "esegui-azione"];

function headers() {
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
}

async function q(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = (await res.text()).slice(0, 300);
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  const t = await res.text();
  return t ? JSON.parse(t) : [];
}

async function main() {
  if (!URL_BASE || !KEY) {
    console.error("❌ SUPABASE_URL o SUPABASE_SERVICE_KEY mancanti nel .env");
    process.exit(1);
  }

  const soglia = new Date(Date.now() - GIORNI * 24 * 60 * 60 * 1000).toISOString();

  // Trova tutti gli errore più vecchi di N giorni
  const candidati = await q(
    `lavori?stato=eq.errore&updated_at=lt.${encodeURIComponent(soglia)}&select=id,tipo,richiesta,updated_at&order=updated_at.asc&limit=500`
  );

  const pulibili = candidati.filter((j) => !TIPI_PROTETTI.includes(j.tipo));
  const protetti = candidati.filter((j) => TIPI_PROTETTI.includes(j.tipo));

  console.log(`\n📊 Job in stato "errore" più vecchi di ${GIORNI} giorni: ${candidati.length}`);
  console.log(`   - Pulibili (giro/chat/automazioni): ${pulibili.length}`);
  console.log(`   - Protetti (azioni approvate, da gestire a mano): ${protetti.length}`);

  if (pulibili.length === 0) {
    console.log("\n✅ Niente da pulire.");
    return;
  }

  if (!ESEGUI) {
    console.log("\n⚠️  MODALITÀ DRY-RUN — nessuna modifica fatta.");
    console.log("   Per pulire davvero: node cervello/pulisci-coda.mjs --esegui");
    console.log("\nPrimi 10 da pulire:");
    pulibili.slice(0, 10).forEach((j) => {
      const primaRiga = (j.richiesta || "").split("\n")[0].slice(0, 80);
      const data = j.updated_at?.slice(0, 10);
      console.log(`   [${data}] tipo=${j.tipo} → "${primaRiga}"`);
    });
    return;
  }

  // Esegui: marca come "annullato"
  const ids = pulibili.map((j) => j.id);
  // Supabase REST: PATCH in bulk via "id=in.(id1,id2,...)"
  const idList = ids.join(",");
  await q(`lavori?id=in.(${idList})`, {
    method: "PATCH",
    body: JSON.stringify({ stato: "annullato", risultato: `[pulisci-coda] Pulito automaticamente il ${new Date().toISOString().slice(0, 10)} — errore non risolto dopo ${GIORNI}+ giorni.` }),
    headers: { Prefer: "return=minimal" },
  });

  console.log(`\n✅ Puliti ${pulibili.length} job errore → marcati "annullato" (visibili nell'Archivio).`);
  if (protetti.length > 0) {
    console.log(`⚠️  Rimangono ${protetti.length} job protetti (azioni approvate): gestiscili dal Pannello → "Riprova".`);
  }
}

main().catch((e) => {
  console.error("❌ Errore:", e.message);
  process.exit(1);
});
