#!/usr/bin/env node
// GENERATORE DELLE CAPACITÀ — materializza le 46 capacità ancora chiuse come SCAFFOLD reali in
// cervello/capacita/. Ogni scaffold è codice vero (sola lettura) che: registra la capacità, legge lo
// stato reale del suo cancello di sblocco, e riporta ONESTAMENTE se è pronta ad attivarsi o cosa manca.
// NON inventa dati: se il carburante non c'è, lo dice — mai un risultato finto. Le 7 già COSTRUITE
// hanno il loro script dedicato e non vengono rigenerate.
//
// Uso:  node cervello/genera-capacita.mjs         -> scrive/aggiorna i 46 file
//       node cervello/genera-capacita.mjs --check -> non scrive, dice solo quanti mancano

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CHECK = process.argv.includes("--check");
const DIR = join(dirname(fileURLToPath(import.meta.url)), "capacita");

// I 6 cancelli di realtà (coerenti con sblocco-capacita.mjs).
const GATE = {
  G1: { nome: "Prima consegna reale", metrica: "Ordini consegnati", soglia: 1, tipo: "stato", trigger: "il primo ordine chiuso end-to-end su Pane Quotidiano (mani di Nicola)" },
  G2: { nome: "Rete di botteghe", metrica: "Negozi REALI", soglia: 5, tipo: "stato", trigger: "≥5 negozi reali a bordo (onboarding dal 9/7)" },
  G2b: { nome: "Rete densa + retention", metrica: "Negozi REALI", soglia: 10, tipo: "stato", trigger: "≥10 negozi + 2 coorti con retention reale" },
  G3: { nome: "Storico ≥12 mesi", metrica: "mesi di storico", soglia: 12, tipo: "storico", trigger: "≥12 mesi di dati veri accumulati" },
  G5: { nome: "Città densa + via libera legale", metrica: "Negozi REALI", soglia: 30, tipo: "stato", trigger: "≥50% del centro sulla rete + parere legale" },
  G6: { nome: "Specie", metrica: null, soglia: null, tipo: "manuale", trigger: "Piacenza autonoma e in utile da 6 mesi" },
};

// Le 46 capacità ancora chiuse (le 7 costruite — 4,12,13,23,30,37,38 — non sono qui).
// n · nome · gate · cosa_fa (che farà quando il cancello è aperto) · fonte (dato reale che userà)
const CAP = [
  [1, "Il Gemello Digitale", "G3", "simula una mossa (e l'azienda) prima di farla", "storico ordini/decisioni + Bilancio Vivo"],
  [2, "Un mini-AD per ogni negoziante", "G2", "il negoziante scrive su WhatsApp e il suo assistente aggiorna catalogo/foto", "marketplace REST (catalogo del negozio) + WhatsApp"],
  [3, "Il Concierge di Spesa", "G2b", "una frase → carrello multi-negozio composto", "marketplace REST (prodotti di più negozi)"],
  [5, "L'Anticipo Predittivo", "G3", "domanda prevista per negozio per fascia oraria", "storico ordini per negozio/ora"],
  [6, "L'Auto-espansione dell'Organico", "G1", "prepara il 44° senior, lo prova, chiede la firma", "roster .claude/agents + keyword-owner-check"],
  [7, "Il Genoma Replicabile", "G6", "incolla il DNA sulla seconda città", "registro-realta + Blueprint (config città)"],
  [8, "I Micro-esperimenti a Bandito", "G2b", "il budget si auto-alloca su ciò che rende", "esperimenti-check + Bilancio Vivo"],
  [9, "Il Catasto Vivo della Domanda", "G2b", "mappa della domanda inespressa → chi reclutare", "ricerche/carrelli/lead marketplace REST"],
  [10, "La Camera di Negoziazione delle Botteghe", "G2b", "gli agenti negoziano bozze di bundle win-win", "cataloghi/margini dei negozi (Bilancio Vivo)"],
  [11, "La Spesa che si Riordina da Sola", "G2b", "riordino previsto, un tap del cliente per confermare", "storico ordini per cliente"],
  [14, "Il Tuo Doppio", "G1", "modella come decide Nicola per pre-ordinare la coda", "DECISIONI.md + taste-file"],
  [15, "Le Squadre-Lampo", "G1", "task-force temporanee su un evento, poi si sciolgono", "eventi-picchi + sentinelle"],
  [16, "La Macchina che Insegna", "G2", "micro-lezioni sui dati del singolo negozio", "marketplace REST (metriche del negozio)"],
  [17, "Il Prezzo Onesto Dinamico", "G2b", "prezzi che si muovono e si spiegano in chiaro", "domanda + margini (Bilancio Vivo)"],
  [18, "Il Registro Civico della Fiducia", "G2", "il badge «Verificato MyCity» come standard cittadino", "profili/recensioni marketplace REST"],
  [19, "L'Orecchio della Città", "G2", "ascolta i segnali pubblici della città (gate legale-privacy)", "fonti web (sentinella-fonti) + parere legale"],
  [20, "Il Sismografo", "G1", "segnali deboli di churn da login e attività", "attività/login clienti marketplace REST"],
  [21, "L'Almanacco", "G2", "la memoria stagionale e ricorrente della domanda", "storico ordini + eventi-picchi"],
  [22, "Il Consiglio dei Piacentini", "G2", "panel simulato di cittadini per testare le mosse (gate legale)", "profili aggregati + parere legale"],
  [24, "Il Catalogo che si Scrive da Solo", "G1", "foto dello scaffale → schede e prezzi proposti", "foto/catalogo del negozio (supervisione-negozi)"],
  [25, "Il Magazzino Diffuso", "G2b", "inventario federato tra le botteghe", "inventario marketplace REST"],
  [26, "La Staffetta", "G2b", "logistica peer-to-peer tra negozi e rider", "ordini/consegne + zone"],
  [27, "La Tesoreria di Rete", "G2b", "prevede i buchi di cassa dei negozi", "payout/incassi (Stripe + Bilancio Vivo)"],
  [28, "Il Gruppo d'Acquisto Autonomo", "G2b", "aggrega e negozia bozze d'acquisto da grande", "acquisti/fornitori dei negozi"],
  [29, "Il Dividendo del Volano", "G2b", "redistribuisce il valore creato dalla rete", "margini di rete (Bilancio Vivo)"],
  [31, "Il Passaporto del Prodotto", "G2b", "provenienza e storia verificabile di ogni prodotto", "schede prodotto marketplace REST"],
  [32, "Il Quotidiano del Commercio", "G2", "il racconto settimanale generato dai dati veri", "KPI di rete (analista) + eventi"],
  [33, "L'Angelo Custode Normativo", "G2", "HACCP/fisco/GDPR vegliati, avviso prima della multa", "scadenze/compliance dei negozi (legale)"],
  [34, "La Memoria delle Botteghe", "G2", "il sapere delle botteghe conservato per la successione", "consenso + contenuti del bottegaio"],
  [35, "La Rete di Mutuo Soccorso", "G2", "negozio in difficoltà → la rete lo solleva", "health score negozi (account-negozi)"],
  [36, "L'Evoluzione in Ombra", "G3", "varianti di sé in shadow sui dati veri", "storico giri/decisioni (banco-ai)"],
  [39, "Il Modello del Mondo", "G3", "modello vivo di Piacenza che risponde ai controfattuali", "≥12 mesi di storico multi-fonte"],
  [40, "Lo Scienziato", "G3", "motore causale: ipotesi → esperimenti → leggi locali", "storico esperimenti + coorti"],
  [41, "La Sala dei Mille Futuri", "G3", "scenari in massa contro cui ogni strategia sopravvive", "modello del mondo + storico"],
  [42, "Il Protocollo", "G5", "standard aperto con cui gli agenti esterni si collegano", "API/registro partner (infrastruttura)"],
  [43, "Il Circuito del Credito", "G5", "liquidità condivisa nella rete (gate regolamentare)", "tesoreria di rete + partner autorizzati"],
  [44, "La Mutua Algoritmica", "G5", "rischio condiviso nella rete (gate regolamentare)", "storico sinistri/rischi + partner"],
  [45, "La Produzione a Domanda", "G5", "la domanda di domani detta stasera quanto produrre", "anticipo predittivo + capacità produttive"],
  [46, "Il Sistema Nervoso Fisico", "G5", "IoT: frigo che si autodenuncia, contapersone, locker", "sensori IoT fisici"],
  [47, "Sapere senza Guardare", "G5", "apprendimento federato + privacy differenziale", "dati federati dei negozi (privacy)"],
  [48, "L'Onestà Dimostrabile", "G5", "promesse verificabili matematicamente da terzi", "log/prove crittografiche"],
  [49, "Un Agente per Ogni Cittadino", "G5", "ogni piacentino col suo agente che negozia con la rete", "identità/agenti cittadini"],
  [50, "La Macchina che fa Ricerca su Sé Stessa", "G3", "legge le novità AI e propone upgrade della propria architettura", "auto-radiografia + storico salute"],
  [51, "La Costituzione Vivente", "G6", "le 18 Leggi come codice eseguibile e auto-emendabile", "CLAUDE.md + regole (esecubili)"],
  [52, "La Pianificazione Generazionale", "G6", "strategie a orizzonte 2040 portate avanti senza dimenticare", "memoria di lungo periodo"],
  [53, "Il Compilatore d'Impresa", "G6", "descrivi un'azienda a parole e la macchina la compila", "il genoma replicabile + Protocollo"],
];

function slug(s) {
  return s.toLowerCase()
    .replace(/[àáâ]/g, "a").replace(/[èéê]/g, "e").replace(/[ìí]/g, "i").replace(/[òóô]/g, "o").replace(/[ùú]/g, "u")
    .replace(/[’'"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function scaffold(n, nome, gateId, cosaFa, fonte) {
  const g = GATE[gateId];
  const letturaGate =
    g.tipo === "stato"
      ? `  const testo = existsSync(STATO) ? readFileSync(STATO, "utf8") : "";
  const re = new RegExp("\\\\|\\\\s*${g.metrica}[^|]*\\\\|\\\\s*\\\\**([0-9]+)", "i");
  const m = testo.match(re);
  const valore = m ? Number(m[1]) : 0;
  const aperto = valore >= ${g.soglia};`
      : g.tipo === "storico"
      ? `  const now = new Date();
  const inizio = new Date("2026-06-24T00:00");
  const valore = +(((now - inizio) / (1000*60*60*24*30.44))).toFixed(1);
  const aperto = valore >= ${g.soglia};`
      : `  const valore = null;
  const aperto = false; // cancello manuale (${g.trigger})`;

  return `#!/usr/bin/env node
// Capacità #${n} — ${nome}. ${cosaFa}.
// STATO: SCAFFOLD — engine registrato e VIVO nel codice, in attesa del carburante reale.
// Cancello di sblocco: ${gateId} · ${g.nome}. Si attiva quando: ${g.trigger}.
// Fonte dati (che userà): ${fonte}.
// 🟢 Sola lettura. NON inventa dati: legge lo stato reale e dice onestamente se è pronta o cosa manca.
//
// Uso:  node cervello/capacita/${'${'}slug${'}'}.mjs [--json]
// Exit: 0 = cancello APERTO (pronta a diventare codice pieno) · 1 = in attesa del carburante

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT, nowPiacenza } from "../git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const STATO = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/STATO.md");
const META = {
  n: ${n}, nome: ${JSON.stringify(nome)}, stato: "scaffold",
  cosa_fa: ${JSON.stringify(cosaFa)}, fonte_dati: ${JSON.stringify(fonte)},
  cancello: ${JSON.stringify(gateId + " · " + g.nome)}, si_attiva_quando: ${JSON.stringify(g.trigger)},
};

function main() {
  const quando = nowPiacenza();
${letturaGate}
  const out = { ...META, quando, cancello_valore: valore, cancello_soglia: ${g.soglia === null ? "null" : g.soglia}, cancello_aperto: aperto, pronta_a_costruire: aperto };
  if (JSON_MODE) { console.log(JSON.stringify(out, null, 2)); process.exit(aperto ? 0 : 1); }
  console.log(\`#\${META.n} \${META.nome} — \` + (aperto ? "🟢 CANCELLO APERTO: pronta da costruire in codice pieno." : "🔒 in attesa"));
  console.log(\`   Cosa farà: \${META.cosa_fa}\`);
  console.log(\`   Fonte dati: \${META.fonte_dati}\`);
  console.log(\`   Cancello: \${META.cancello}\` + (${g.soglia === null ? "\"\"" : `\` (\${valore}/${g.soglia})\``}));
  if (!aperto) console.log(\`   Si attiva quando: \${META.si_attiva_quando}\`);
  process.exit(aperto ? 0 : 1);
}

main();
`;
}

// --- esecuzione ---
if (!existsSync(DIR)) { if (!CHECK) mkdirSync(DIR, { recursive: true }); }
let scritti = 0;
const indice = [];
for (const [n, nome, gate, cosaFa, fonte] of CAP) {
  const nn = String(n).padStart(2, "0");
  const fname = `cap-${nn}-${slug(nome)}.mjs`;
  indice.push({ n, nome, gate, file: `cervello/capacita/${fname}` });
  if (CHECK) continue;
  writeFileSync(join(DIR, fname), scaffold(n, nome, gate, cosaFa, fonte));
  scritti++;
}
if (!CHECK) {
  writeFileSync(join(DIR, "_indice.json"), JSON.stringify({ _cosa_e: "Indice delle 46 capacità-scaffold generate da genera-capacita.mjs", totale: indice.length, capacita: indice }, null, 2));
}
console.log(`${CHECK ? "Da generare" : "Generati"}: ${CHECK ? CAP.length : scritti} scaffold in cervello/capacita/ (+ _indice.json).`);
console.log(`Le 7 costruite (4,12,13,23,30,37,38) restano nei loro script dedicati.`);
