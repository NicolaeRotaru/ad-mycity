#!/usr/bin/env node
// 🗺️ REGISTRA IN MEMORIA IL PROGRAMMA INTELLIGENZA (la lista dei 13 cantieri). Idempotente.
//
// Perché esiste. Il programma vive in MyCity-Vault/90-Memoria-AI/PROGRAMMA-INTELLIGENZA.md, ma un
// lavoro 🟡 non è finito quando la PR è mergiata: è finito quando la memoria lo sa (DECISIONI +
// STATO + riga ESITO nel quaderno del reparto). Questo script scrive quelle tre tracce.
//
// Perché uno script e non un diff: DECISIONI.md (459KB) e STATO.md (412KB) sono troppo grossi per
// passare dall'API GitHub senza rischiare una trascrizione corrotta, e la sessione cloud non ha il
// permesso di git push (AR-142). Stesso schema di registra-programma-intelligenza.mjs e
// round2-applica.mjs: lo lancia Nicola sul VPS, in /opt/mycity/ad-mycity.
//
// Uso:
//   node cervello/programma-intelligenza-memoria.mjs --dry   -> dice cosa farebbe, non scrive
//   node cervello/programma-intelligenza-memoria.mjs         -> scrive
//
// Rilanciarlo due volte non fa danni: ogni pezzo controlla la propria marca prima di scrivere.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AD_ROOT } from "./git-github.mjs";

const DRY = process.argv.includes("--dry");
const V = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI");

const MARCA_DEC = "Nasce il PROGRAMMA con la lista dei cantieri";
const MARCA_STATO = "PROGRAMMA INTELLIGENZA: la lista dei 13 cantieri";
const MARCA_ESITO = "#programma-cantieri";

const DECISIONI = `- 2026-07-25 03:31 · 🟡 · [chief-of-staff/AD] · **Nasce il PROGRAMMA con la lista dei cantieri: dalla pagella (quanto siamo messi male) alla strada (cosa c'è da fare).** Origine: Nicola — «crea la lista del programma, non solo 5». Dopo 3 round esisteva il cruscotto (5 numeri, 0 superati) ma non la roadmap. **Fatto (🟢, scrittura):** \`MyCity-Vault/90-Memoria-AI/PROGRAMMA-INTELLIGENZA.md\` — **13 cantieri**, ognuno con problema+numero reale, costo per Nicola, quale voce della pagella muove (o «nessuna», dichiarato), un controllo eseguibile, dipendenze, chi lo sblocca e peso; poi 5 round ordinati (sicurezza → ciò che sblocca → crescita) con detto esplicitamente cosa gira in parallelo. **Erano 10 i cantieri chiesti: sono 13 perché verificando invece di dedurre ne sono emersi 3 nuovi.** ① **AR-155 risulta chiuso senza fix**: la sua prova cerca \`token_reali|usage\` in \`motore-ai.sh\` e fa centro su un COMMENTO e su un controllo del messaggio «usage limit» — il consumo reale non viene catturato da nessuna parte (\`token_totali: 0\`). È il contrario del round 2: lì le prove non chiudevano mai, qui una prova ha chiuso un difetto vivo. ② **Il freno del business è disarmato**: \`north-star-check.mjs --gate\` esce 0 (via libera) con uno stallo reale di 31 giorni, perché legge lo stallo da una frase di STATO.md e ne estrae «4 ore» da un pezzo di «…chiusi in 24h». Nei 7 giorni con 107 merge sul Pannello e 0 ordini ha dato luce verde ogni volta. ③ **Il voto salute non si ri-misura**: 43/100 è la media dei 12 pilastri della radiografia del 23/7 (che ha scritto un voto complessivo non valido, 0) e dal 25/7 viene riportato tale e quale; la macchina chiede una radiografia completa da 53 giri. **Correzione a una premessa:** i sensori NON sono spenti — ultima misura vera sul VPS 24/7 22:20: 8 su 8 ok (Stripe e PostHog inclusi, uptime sito e Pannello armati dal 18/7), solo Telegram non configurato. **Tre decisioni restano a Nicola** (è il metro, non lo riscrive l'AD): (a) le soglie ostaggio della pausa business — invariate o misurare i reparti attivi con ritorno automatico alla soglia piena il 1/9; (b) il denominatore delle lezioni — 473 attive e 0 mai potate rendono il 70% aritmeticamente impossibile (servirebbero 331 citazioni in 30 giorni); (c) i buchi del metro — 6 cantieri su 13 (coda firme, mani, sensori, business, soldi) non muovono nessuna voce della pagella. **Le 3 mosse che sbloccano il resto:** riparare il metro (C3+C2), smaltire la coda delle 50 firme (C7), fare un ordine vero su Pane Quotidiano (C11, ~5€ e 10 minuti). · Nicola (chat 25/7 ~03:31)
`;

const STATO = `> 🗺️ **25/7 ~03:31 — PROGRAMMA INTELLIGENZA: la lista dei 13 cantieri (non un'analisi: il piano di lavoro).** Nicola: «crea la lista del programma, non solo 5». Il cruscotto c'era (pagella 0/5), mancava la strada: ora è in [[PROGRAMMA-INTELLIGENZA]] — 13 cantieri con numero reale, costo per Nicola, voce della pagella che muovono (o «nessuna», detto apertamente), un controllo eseguibile ciascuno, dipendenze e peso; 5 round ordinati (R4 il metro · R5 i freni · R6 il flusso · R7 imparare · R8 settembre) con detto cosa gira in parallelo. **Chiesti 10, consegnati 13: 3 trovati verificando.** ① **AR-155 chiuso senza fix** — la prova fa centro su un commento, il consumo reale non è misurato (token contati oggi: 0): il contrario del round 2, qui una prova CHIUDE un difetto vivo. ② **Il freno del business è disarmato** — \`north-star-check.mjs --gate\` esce 0 con 31 giorni di stallo (legge «4h» da una frase): nei 7 giorni con 107 merge Pannello e 0 ordini ha sempre dato via libera. ③ **Il voto salute non si ri-misura** — 43 è riportato dalla radiografia del 23/7, che ha scritto un voto non valido; radiografia completa chiesta da 53 giri. **Corretta una premessa:** i sensori non sono ciechi — 8 su 8 ok al 24/7 22:20, manca solo Telegram. **Servono 3 firme di Nicola** (le soglie ostaggio della pausa · il denominatore delle lezioni · i buchi del metro) e **3 azioni sue**: un ordine vero su PQ (5€, sblocca 4 cantieri), \`BURN_MENSILE_EUR=302\` + token Telegram sul VPS, una seduta sulla coda (50 card, la più vecchia ferma da 31 giorni, dentro c'è il bando da 10.000€ che scade il 30/7). Fonte: chat 25/7 + verifiche eseguite in sessione (comandi in fondo a ogni cantiere).`;

const fatto = [];
const saltato = [];

// ① DECISIONI — append-only, mai riscrivere le righe vecchie
const pDec = join(V, "DECISIONI.md");
if (!existsSync(pDec)) saltato.push("DECISIONI.md non trovato");
else if (readFileSync(pDec, "utf8").includes(MARCA_DEC)) saltato.push("DECISIONI: già registrata");
else {
  if (!DRY) writeFileSync(pDec, readFileSync(pDec, "utf8") + "\n" + DECISIONI, "utf8");
  fatto.push("DECISIONI: 1 voce appesa (nascita del programma + i 3 difetti nuovi)");
}

// ② STATO — la voce va IN CIMA, subito dopo il frontmatter
const pSta = join(V, "STATO.md");
if (!existsSync(pSta)) saltato.push("STATO.md non trovato");
else {
  let t = readFileSync(pSta, "utf8");
  if (t.includes(MARCA_STATO)) saltato.push("STATO: già aggiornato");
  else {
    const fine = t.indexOf("---", 4);
    const dopo = t.indexOf("\n", fine) + 1;
    t = t.slice(0, dopo) + "\n" + STATO + "\n" + t.slice(dopo);
    t = t.replace(/^aggiornato: .*$/m, "aggiornato: 2026-07-25 03:31");
    if (!DRY) writeFileSync(pSta, t, "utf8");
    fatto.push("STATO: voce in cima + data aggiornata");
  }
}

// ③ ESITO nel quaderno del reparto che possiede il lavoro (AR-009). L'owner di un programma
//    multi-mese con dipendenze cross-reparto è chief-of-staff (mansionario), non @tech.
//    Passa dallo strumento ufficiale così alimenta anche la calibrazione (atteso→reale).
const pCos = join(AD_ROOT, "memoria-squadra/chief-of-staff.md");
if (existsSync(pCos) && readFileSync(pCos, "utf8").includes(MARCA_ESITO)) {
  saltato.push("ESITO @chief-of-staff: già registrato");
} else if (DRY) {
  fatto.push("ESITO @chief-of-staff: da registrare (chiusura-loop)");
} else {
  const r = spawnSync(
    process.execPath,
    [
      join(AD_ROOT, "cervello/chiusura-loop.mjs"),
      "registra",
      "chief-of-staff",
      "Programma intelligenza: dalla pagella (5 numeri) alla lista dei cantieri da fare (PROGRAMMA-INTELLIGENZA.md)",
      "8/10 — ogni cantiere ha un controllo eseguibile e provato prima di scriverlo, e verificare invece di dedurre ha trovato 3 difetti che nessuno cercava (chiusura falsa AR-155, freno north-star disarmato, voto salute riportato); meno bene: 3 decisioni sul metro restano in attesa di firma e senza quelle 3 cantieri non possono nemmeno partire",
      "10 cantieri (i 10 chiesti da Nicola)",
      "13 cantieri (3 trovati verificando) + 1 premessa corretta (i sensori non sono ciechi: 8/8 ok)",
      "#programma-cantieri",
      "#pagella",
      "#round4",
      "#esito",
    ],
    { encoding: "utf8", timeout: 60000 }
  );
  fatto.push(r.status === 0 ? "ESITO @chief-of-staff registrato (+ calibrazione)" : "ESITO @chief-of-staff: chiusura-loop ha fallito");
}

console.log(`\n🗺️  MEMORIA DEL PROGRAMMA — ${DRY ? "PROVA A SECCO" : "scritta"}\n`);
for (const x of fatto) console.log(`   ✅ ${x}`);
for (const x of saltato) console.log(`   ⏭️  ${x}`);
console.log(
  fatto.length
    ? "\n   Il programma: MyCity-Vault/90-Memoria-AI/PROGRAMMA-INTELLIGENZA.md\n   Poi rimisura:  node cervello/pagella-intelligenza.mjs --gate\n"
    : "\n   Nulla da fare.\n"
);
process.exit(0);
