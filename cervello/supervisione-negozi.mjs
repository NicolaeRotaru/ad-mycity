#!/usr/bin/env node
// 🛡️ SUPERVISIONE NEGOZI & PRODOTTI — la macchina veglia OGNI negozio e OGNI prodotto, trova i DATI
// MANCANTI e prepara il riempimento AUTOMATICO — ma sempre come PROPOSTA da firmare (mai scrive sul DB).
//
// L'IDEA (richiesta di Nicola): «voglio che la macchina supervisioni ogni negozio e i suoi prodotti e
// inserisca in automatico ogni dato mancante, chiedendomi sempre il permesso prima».
//
// Come rispetta la regola d'oro 🟢🟡🔴 e ONESTA-RULES (niente dati inventati):
//   • 🟢 SOLA LETTURA del marketplace (REST) — come sentinella-dati/allocazione-check. Scrive solo la
//        propria memoria (auto-coscienza) e il report in consegne/. Non tocca il DB del sito.
//   • Classifica OGNI campo mancante in 3 classi di SICUREZZA:
//       ① AUTOFILL  → campo descrittivo DEDUCIBILE con un valore difendibile e un PRECEDENTE reale sul
//                     sito (es. unit="pezzo", l'unico valore già usato). Genera la proposta.
//       ② PROCURA   → serve MATERIA PRIMA reale (foto, prezzo, telefono, indirizzo, orari, descrizione
//                     con voce): NON si inventa. Elenca «serve da Nicola/negozio», al massimo uno scheletro
//                     con segnaposto evidente. (regola d'oro: onestà > riempire a caso.)
//       ③ MAI       → campo SENSIBILE (legale, KYC, fiscale, IBAN/carta, Stripe, consensi, approvazione,
//                     wallet, rider): la macchina NON lo propone MAI, nemmeno se vuoto. Allowlist rigida.
//   • Le proposte AUTOFILL diventano azioni 🟡 in AZIONI-IN-ATTESA (raggruppate, con comando pronto):
//        Nicola dà l'ok → parte `node cervello/marketplace.mjs aggiorna <tabella> <id> '<json>'`
//        (che fa BACKUP di ogni riga → reversibile). NIENTE parte senza la sua firma.
//
// USO:
//   node cervello/supervisione-negozi.mjs            -> report leggibile (scansione + proposte)
//   node cervello/supervisione-negozi.mjs --json     -> output JSON (per gate/Pannello/sonde)
//   node cervello/supervisione-negozi.mjs --accoda    -> scrive il report + accoda le proposte 🟡 in
//                                                        AZIONI-IN-ATTESA.md (idempotente) e la memoria
//   node cervello/supervisione-negozi.mjs --selftest  -> test deterministico della logica (senza DB)
//
// ENV: MARKETPLACE_SUPABASE_URL + MARKETPLACE_SUPABASE_KEY (SOLA LETTURA del marketplace).
//      Assenti/ciechi → no-op onesto (nessun numero inventato), come le altre sentinelle.
//
// Exit: 0 sempre in scansione (è un motore di proposte, non un gate che blocca il giro).

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { AD_ROOT, nowPiacenza, stampSegnale } from "./git-github.mjs";

const JSON_MODE = process.argv.includes("--json");
const ACCODA = process.argv.includes("--accoda");
const SELFTEST = process.argv.includes("--selftest");

const MK_URL = process.env.MARKETPLACE_SUPABASE_URL?.trim();
const MK_KEY = process.env.MARKETPLACE_SUPABASE_KEY?.trim();

const VAULT = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI");
const STATE_PATH = join(VAULT, "auto-coscienza/supervisione-negozi.json");
const AZIONI_PATH = join(VAULT, "AZIONI-IN-ATTESA.md");

// ─────────────────────────────────────────────────────────────────────────────
// ①②③ LA SPEC DI COMPLETEZZA — la fonte di verità di "cosa deve avere un negozio/prodotto".
//   classe: "autofill" | "procura" | (i campi "mai" NON stanno qui: vivono nella BLOCKLIST sotto)
//   proposta(riga, ctx): solo per "autofill" → { valore, perche, nota? } oppure null se non deducibile.
// ─────────────────────────────────────────────────────────────────────────────

// 🔒 BLOCKLIST DI SICUREZZA (classe ③ MAI): prefissi/campi che la macchina non propone MAI di riempire,
//    nemmeno se vuoti. Sono legale/fiscale/pagamenti/identità/consensi/stato-approvazione. Difesa in
//    profondità: qualunque proposta che tocchi uno di questi viene SCARTATA (vedi proponi()).
const BLOCKLIST_PREFISSI = [
  "legal_", "business_", "kyc_", "billing_", "stripe_", "rider_", "referral_",
  "subscription_", "notif_", "approval", "approved", "rejection_", "deletion_",
];
const BLOCKLIST_ESATTI = new Set([
  "id", "role", "is_approved", "tos_accepted_at", "privacy_accepted_at",
  "data_accuracy_confirmed_at", "wallet_balance_cents", "email_marketing",
  "public_profile_enabled", "referred_by", "created_at", "search_tsv",
]);
function campoSensibile(campo) {
  if (BLOCKLIST_ESATTI.has(campo)) return true;
  return BLOCKLIST_PREFISSI.some((p) => campo.startsWith(p));
}

// Categorie di prodotti "a peso" (alimentari sfusi): per queste l'unità "pezzo" è probabile ma non certa,
// quindi la proposta resta "pezzo" (unico valore reale sul sito) MA con una NOTA che invita a valutare kg/etto.
const CATEGORIE_A_PESO = new Set([
  "Salumeria", "Frutta e Verdura", "Latticini & Formaggi", "Panificio", "Pasta fresca",
  "Dispensa & Conserve", "Dolci & Snack", "Bevande", "Alimentari", "Gastronomia",
]);

// vuoto: null/undefined, stringa vuota, array/oggetto JSON vuoti.
function eVuoto(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

// La spec dei PRODOTTI. name/price sono NOT NULL nel DB → non compaiono come gap.
const SPEC_PRODOTTI = {
  unit: {
    classe: "autofill",
    etichetta: "unità di misura",
    proposta: (p, ctx) => {
      const cat = ctx.categoriaNome?.(p.category_id);
      const aPeso = cat && CATEGORIE_A_PESO.has(cat);
      return {
        valore: "pezzo", // PRECEDENTE reale: "pezzo" è l'unico valore unit già presente sul sito.
        perche: 'proposto "pezzo": è l\'unico valore di unità già usato sul sito (precedente reale)',
        nota: aPeso ? `categoria "${cat}" a peso: valuta se è meglio kg/etto prima di confermare` : undefined,
      };
    },
  },
  condition: {
    classe: "autofill",
    etichetta: "condizione",
    proposta: () => ({
      valore: "nuovo", // PRECEDENTE reale: condition ∈ {nuovo, usato}; "nuovo" domina sul sito.
      perche: 'proposto "nuovo": è il valore prevalente reale (merce di negozio nuova)',
      nota: 'escludi prima gli articoli di seconda mano (metti "usato" a quelli): il default nuovo non vale per l\'usato',
    }),
  },
  category_id: {
    classe: "autofill",
    etichetta: "categoria",
    proposta: (p, ctx) => {
      const g = ctx.indovinaCategoria?.(p.name);
      if (!g) return null; // non deducibile con confidenza → non forzare (diventa "da procurare")
      return { valore: g.id, perche: `categoria dedotta dal nome del prodotto → "${g.nome}"` };
    },
  },
  description: { classe: "procura", etichetta: "descrizione", voce: true },
  images: { classe: "procura", etichetta: "foto prodotto", materiale: true },
  stock: { classe: "procura", etichetta: "giacenza", nota: "la disponibilità è un dato reale del negozio: non si inventa" },
};

// La spec dei NEGOZI (profiles con role=seller).
const SPEC_NEGOZI = {
  store_name: { classe: "procura", etichetta: "nome negozio", materiale: true, nota: "un nome commerciale non si inventa" },
  store_description: { classe: "procura", etichetta: "descrizione vetrina", voce: true },
  store_logo: { classe: "procura", etichetta: "logo", materiale: true },
  store_phone: { classe: "procura", etichetta: "telefono", materiale: true },
  store_address: { classe: "procura", etichetta: "indirizzo", materiale: true },
  store_hours: { classe: "procura", etichetta: "orari di apertura", materiale: true },
  city: { classe: "procura", etichetta: "città", materiale: true },
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGICA PURA (testabile senza DB): dato un dataset, produci i gap e le proposte.
// ─────────────────────────────────────────────────────────────────────────────

// Indovina la categoria dal nome prodotto: match su parola-chiave = nome categoria (o sua parola).
function costruisciIndovina(categorie) {
  // mappa parola(lowercase) → {id, nome}. Usa il nome categoria intero + le sue parole ≥4 char.
  const idx = [];
  for (const c of categorie || []) {
    const parole = new Set([c.name.toLowerCase()]);
    for (const w of c.name.toLowerCase().split(/[^\p{L}]+/u)) if (w.length >= 4) parole.add(w);
    idx.push({ id: c.id, nome: c.name, parole: [...parole] });
  }
  return (nomeProdotto) => {
    if (!nomeProdotto) return null;
    const t = nomeProdotto.toLowerCase();
    for (const c of idx) if (c.parole.some((p) => t.includes(p))) return { id: c.id, nome: c.nome };
    return null;
  };
}

// Analizza UNA riga contro una spec → { autofill:[], procura:[] } (i sensibili sono già esclusi dalla spec).
function analizzaRiga(riga, spec, ctx) {
  const autofill = [];
  const procura = [];
  for (const [campo, def] of Object.entries(spec)) {
    if (campoSensibile(campo)) continue; // difesa in profondità: mai un campo sensibile, anche se in spec
    if (!eVuoto(riga[campo])) continue; // già valorizzato → non è un gap
    if (def.classe === "autofill") {
      const p = def.proposta ? def.proposta(riga, ctx) : null;
      if (p && !eVuoto(p.valore)) autofill.push({ campo, etichetta: def.etichetta, ...p });
      else procura.push({ campo, etichetta: def.etichetta, motivo: "non deducibile con confidenza" });
    } else {
      procura.push({
        campo, etichetta: def.etichetta,
        motivo: def.voce ? "serve la voce/storia reale del negozio" : (def.nota || "serve materia prima reale"),
      });
    }
  }
  return { autofill, procura };
}

// Guardia finale prima di emettere QUALSIASI proposta di scrittura: solo campi non-sensibili.
function proponi(tabella, id, campo, valore) {
  if (campoSensibile(campo)) return null; // 🔒 non deve mai accadere; se accade, scarta.
  const json = JSON.stringify({ [campo]: valore });
  return { tabella, id, campo, valore, comando: `node cervello/marketplace.mjs aggiorna ${tabella} ${id} '${json}'` };
}

// Aggrega i gap di tutte le righe in GRUPPI-proposta (una card per (tabella, campo, valore)):
// es. «unit=pezzo su 242 prodotti». Molto meglio di 242 azioni separate.
function costruisciGruppi(righeAnalisi, tabella, nomeDi) {
  const gruppi = new Map(); // chiave: campo|valore
  for (const r of righeAnalisi) {
    for (const a of r.analisi.autofill) {
      const prop = proponi(tabella, r.id, a.campo, a.valore);
      if (!prop) continue;
      const chiave = `${a.campo}|${a.valore}`;
      if (!gruppi.has(chiave)) {
        gruppi.set(chiave, {
          tabella, campo: a.campo, etichetta: a.etichetta, valore: a.valore,
          perche: a.perche, note: new Set(), ids: [], esempi: [],
        });
      }
      const g = gruppi.get(chiave);
      g.ids.push(r.id);
      if (a.nota) g.note.add(a.nota);
      if (g.esempi.length < 5) g.esempi.push(nomeDi ? nomeDi(r) : r.id);
    }
  }
  return [...gruppi.values()].map((g) => ({ ...g, note: [...g.note], n: g.ids.length }))
    .sort((a, b) => b.n - a.n);
}

// ─────────────────────────────────────────────────────────────────────────────
// LETTURA REALE (REST, sola lettura, 3 retry) — best effort, mai numeri inventati.
// ─────────────────────────────────────────────────────────────────────────────
async function rest(path) {
  if (!MK_URL || !MK_KEY) return null;
  for (let tentativo = 0; tentativo < 3; tentativo++) {
    try {
      const res = await fetch(`${MK_URL}/rest/v1/${path}`, {
        headers: { apikey: MK_KEY, Authorization: `Bearer ${MK_KEY}` },
        cache: "no-store",
      });
      if (res.ok) return await res.json();
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 400 * (tentativo + 1)));
  }
  return null;
}

async function leggiMarketplace() {
  const categorie = (await rest("categories?select=id,name")) || [];
  // Solo i seller (i negozi). Prendo i campi della spec + identificativi.
  const negozi = (await rest(
    "profiles?role=eq.seller&select=id,store_name,store_description,store_logo,store_phone,store_address,store_hours,city,approval_status"
  )) || null;
  const prodotti = (await rest(
    "products?select=id,name,description,images,category_id,unit,condition,stock,seller_id&limit=5000"
  )) || null;
  return { categorie, negozi, prodotti };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCANSIONE (compone logica pura + dati reali)
// ─────────────────────────────────────────────────────────────────────────────
function scansiona({ categorie, negozi, prodotti }) {
  const indovinaCategoria = costruisciIndovina(categorie);
  const mappaCat = new Map((categorie || []).map((c) => [c.id, c.name]));
  const categoriaNome = (id) => mappaCat.get(id) || null;
  const ctx = { indovinaCategoria, categoriaNome };

  const negoziAnalisi = (negozi || []).map((n) => ({
    id: n.id, nome: n.store_name || n.id, approvato: n.approval_status === "approved",
    analisi: analizzaRiga(n, SPEC_NEGOZI, ctx),
  }));
  const prodottiAnalisi = (prodotti || []).map((p) => ({
    id: p.id, nome: p.name || p.id, seller_id: p.seller_id,
    analisi: analizzaRiga(p, SPEC_PRODOTTI, ctx),
  }));

  const gruppiProdotti = costruisciGruppi(prodottiAnalisi, "products", (r) => r.nome);
  const gruppiNegozi = costruisciGruppi(negoziAnalisi, "profiles", (r) => r.nome);

  // "da procurare" (materia prima reale) — raggruppato per campo, con conteggio.
  const procuraConta = {};
  for (const r of [...negoziAnalisi, ...prodottiAnalisi]) {
    for (const p of r.analisi.procura) {
      const k = `${p.etichetta}`;
      procuraConta[k] = procuraConta[k] || { etichetta: p.etichetta, motivo: p.motivo, n: 0 };
      procuraConta[k].n++;
    }
  }

  const autofillTot = [...gruppiProdotti, ...gruppiNegozi].reduce((s, g) => s + g.n, 0);
  const procuraTot = Object.values(procuraConta).reduce((s, x) => s + x.n, 0);

  return {
    conteggi: {
      negozi: (negozi || []).length, negozi_approvati: negoziAnalisi.filter((n) => n.approvato).length,
      prodotti: (prodotti || []).length,
      autofill_proposte: autofillTot, da_procurare: procuraTot,
    },
    gruppiProdotti, gruppiNegozi,
    procura: Object.values(procuraConta).sort((a, b) => b.n - a.n),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT: report markdown + memoria + (opz) accoda in AZIONI-IN-ATTESA
// ─────────────────────────────────────────────────────────────────────────────
function readJson(path, fb) { try { return JSON.parse(readFileSync(path, "utf8")); } catch { return fb; } }
function writeJson(path, data) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(data, null, 2) + "\n"); }
function oggiData(quando) { return String(quando).slice(0, 10); }

function titoloUmano(g) {
  // Titolo "come lo diresti a voce", senza codici/ID (regola scrittura-umana.md).
  const dove = g.tabella === "products" ? (g.n === 1 ? "prodotto" : "prodotti") : (g.n === 1 ? "negozio" : "negozi");
  return `Metti «${g.valore}» come ${g.etichetta} ai ${g.n} ${dove} che non ce l'hanno`;
}

function scriviReport(scan, quando) {
  const data = oggiData(quando);
  const dir = join(AD_ROOT, "consegne/supervisione");
  mkdirSync(dir, { recursive: true });
  const reportPath = join(dir, `${data}-supervisione.md`);
  const idsDir = join(dir, "ids");
  mkdirSync(idsDir, { recursive: true });

  const L = [];
  L.push(`---\ntipo: supervisione-negozi\ndata: ${quando}\n---\n`);
  L.push(`# 🛡️ Supervisione negozi & prodotti — ${quando}\n`);
  L.push(`> La macchina ha vegliato ogni negozio e ogni prodotto e ha trovato i dati mancanti. Qui sotto:`);
  L.push(`> le **proposte pronte** (riempimento automatico, in attesa del tuo ok) e ciò che **serve da te** (foto, prezzi, ecc.).`);
  L.push(`> Nessun dato è stato scritto sul sito: parte solo dopo la tua firma.\n`);
  const c = scan.conteggi;
  L.push(`**Quadro:** ${c.negozi} negozi (${c.negozi_approvati} approvati) · ${c.prodotti} prodotti · `
    + `**${c.autofill_proposte} campi** riempibili in automatico (proposti) · **${c.da_procurare}** che servono da te.\n`);

  const gruppi = [...scan.gruppiProdotti, ...scan.gruppiNegozi];
  L.push(`## ✅ Proposte pronte (riempimento automatico — aspettano il tuo ok)\n`);
  if (!gruppi.length) {
    L.push(`Nessun campo deducibile da riempire in automatico in questo giro. 🎉\n`);
  } else {
    for (const g of gruppi) {
      // scrivi la lista ID accanto al report per l'esecuzione in blocco
      const idsFile = join(idsDir, `${data}-${g.tabella}-${g.campo}-${String(g.valore).replace(/[^a-z0-9]+/gi, "_")}.json`);
      writeFileSync(idsFile, JSON.stringify(g.ids, null, 0) + "\n");
      const idsRel = idsFile.slice(AD_ROOT.length + 1);
      L.push(`### ${titoloUmano(g)}`);
      L.push(`- **Perché:** ${g.perche}.`);
      if (g.note.length) L.push(`- **Attenzione:** ${g.note.join(" · ")}.`);
      L.push(`- **Esempi:** ${g.esempi.join(", ")}${g.n > g.esempi.length ? ", …" : ""}.`);
      L.push(`- **Reversibile:** ogni riga viene salvata in backup prima della modifica.`);
      L.push(`- **Comando pronto** (dopo il tuo ok, con \`AZIONI_LIVE=1\`):`);
      L.push("```bash");
      L.push(`# ${g.n} righe · elenco ID: ${idsRel}`);
      L.push(`for id in $(node -e "console.log(require('./${idsRel}').join('\\n'))"); do \\`);
      L.push(`  AZIONI_LIVE=1 node cervello/marketplace.mjs aggiorna ${g.tabella} "$id" '${JSON.stringify({ [g.campo]: g.valore })}'; \\`);
      L.push(`done`);
      L.push("```\n");
    }
  }

  L.push(`## 🙋 Serve da te (materia prima reale — la macchina NON la inventa)\n`);
  if (!scan.procura.length) {
    L.push(`Niente da procurare: tutti i campi essenziali sono presenti. 🎉\n`);
  } else {
    L.push(`| Cosa manca | Quanti | Perché non lo riempio da solo |`);
    L.push(`|---|---|---|`);
    for (const p of scan.procura) L.push(`| ${p.etichetta} | ${p.n} | ${p.motivo} |`);
    L.push(``);
    L.push(`> Per foto/descrizioni posso preparare una **bozza con segnaposto** (poi la rifinisci) o passarle a **content-social/ai-copywriter** e **designer/ai-designer**. Dimmelo e le accodo.\n`);
  }

  L.push(`## 🔒 Cosa NON tocco mai\n`);
  L.push(`Dati legali, fiscali (P.IVA, codice fiscale), IBAN/carta, documenti KYC, account Stripe, consensi`);
  L.push(`e stato di approvazione: sono sensibili e restano **sempre e solo** in mano tua. La macchina non li propone mai.\n`);

  writeFileSync(reportPath, L.join("\n"));
  return reportPath.slice(AD_ROOT.length + 1);
}

// Accoda le proposte 🟡 in AZIONI-IN-ATTESA.md (idempotente: un blocco marcato, riscritto ogni volta).
const MARCA_INIZIO = "<!-- SUPERVISIONE-NEGOZI:INIZIO -->";
const MARCA_FINE = "<!-- SUPERVISIONE-NEGOZI:FINE -->";
function accodaAzioni(scan, quando, reportRel) {
  if (!existsSync(AZIONI_PATH)) return false;
  const gruppi = [...scan.gruppiProdotti, ...scan.gruppiNegozi];
  const righe = [MARCA_INIZIO];
  righe.push(`### 🛡️ Supervisione negozi & prodotti — proposte di riempimento (aggiornato ${quando})`);
  if (!gruppi.length) {
    righe.push(`Nessuna proposta di riempimento automatico in questo giro. Report: [[${reportRel}]].`);
  } else {
    righe.push(`Report completo con comandi pronti: \`${reportRel}\`. Tutte 🟡, reversibili (backup per riga).`);
    righe.push(``);
    righe.push(`| Azione (pronta) | Colore | Quanti | Cosa cambia | Se va bene |`);
    righe.push(`|---|---|---|---|---|`);
    for (const g of gruppi) {
      const cosaCambia = `${g.n} schede oggi incomplete mostrano ${g.etichetta} corretta ai clienti.`;
      const seVaBene = `Cataloghi più completi = ricerca/filtri migliori e più fiducia; poi passo al gruppo successivo.`;
      righe.push(`| ${titoloUmano(g)} | 🟡 | ${g.n} | ${cosaCambia} | ${seVaBene} |`);
    }
  }
  righe.push(``);
  righe.push(`> Approva scrivendo **«ok riempi [unità/condizione/…]»** oppure **«ok a tutte le proposte di supervisione»**.`);
  righe.push(MARCA_FINE);
  const blocco = righe.join("\n");

  let testo = readFileSync(AZIONI_PATH, "utf8");
  const reInizio = testo.indexOf(MARCA_INIZIO);
  if (reInizio !== -1) {
    const reFine = testo.indexOf(MARCA_FINE);
    const end = reFine !== -1 ? reFine + MARCA_FINE.length : testo.length;
    testo = testo.slice(0, reInizio) + blocco + testo.slice(end);
    writeFileSync(AZIONI_PATH, testo);
  } else {
    appendFileSync(AZIONI_PATH, `\n\n${blocco}\n`);
  }
  return true;
}

function salvaMemoria(scan, quando, reportRel) {
  const prev = readJson(STATE_PATH, {});
  writeJson(STATE_PATH, {
    _cosa_e: "🛡️ SUPERVISIONE NEGOZI & PRODOTTI: ultimo esito della veglia dati mancanti. Scritto da cervello/supervisione-negozi.mjs.",
    aggiornato: quando,
    conteggi: scan.conteggi,
    proposte: [...scan.gruppiProdotti, ...scan.gruppiNegozi].map((g) => ({
      tabella: g.tabella, campo: g.campo, valore: g.valore, n: g.n, perche: g.perche, note: g.note,
    })),
    da_procurare: scan.procura,
    report: reportRel,
    storia: [...(prev.storia || []).slice(-49), { quando, ...scan.conteggi }],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SELFTEST — verifica la logica pura senza DB (la parte critica: sicurezza + proposte).
// ─────────────────────────────────────────────────────────────────────────────
function selftest() {
  const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); };

  // fixture
  const categorie = [
    { id: "cat-sal", name: "Salumeria" }, { id: "cat-lib", name: "Libri" },
  ];
  const prodotti = [
    { id: "p1", name: "Coppa Piacentina DOP", images: [], unit: null, condition: null, category_id: "cat-sal", stock: null, description: "ottima" },
    { id: "p2", name: "Romanzo giallo", images: ["x.jpg"], unit: null, condition: "nuovo", category_id: null, stock: 3, description: null },
  ];
  const negozi = [
    { id: "s1", store_name: "Salumeria Rossi", store_description: null, store_logo: null, store_phone: null,
      store_address: "Via Roma 1", store_hours: null, city: "Piacenza", approval_status: "approved",
      // campi sensibili VUOTI: NON devono mai comparire come proposta
      legal_fiscal_code: null, business_vat_number: null, billing_iban: null, stripe_account_id: null },
  ];
  const scan = scansiona({ categorie, negozi, prodotti });

  // 1) unit=pezzo proposto su entrambi i prodotti (242-caso reale)
  const gUnit = scan.gruppiProdotti.find((g) => g.campo === "unit" && g.valore === "pezzo");
  ok(gUnit && gUnit.n === 2, "unit=pezzo dovrebbe essere proposto su 2 prodotti");
  // 2) la nota "a peso" compare (Salumeria) ma il valore resta pezzo
  ok(gUnit && gUnit.note.some((n) => /peso|kg|etto/i.test(n)), "unit su categoria a peso deve avere la nota kg/etto");
  // 3) condition=nuovo proposto solo su p1 (p2 ce l'ha già)
  const gCond = scan.gruppiProdotti.find((g) => g.campo === "condition");
  ok(gCond && gCond.n === 1 && gCond.ids[0] === "p1", "condition=nuovo solo su p1");
  // 4) category dedotta per p2 (Romanzo→? nessun match 'romanzo'; ma 'libri' no) → deve finire in procura, non forzata
  const gCat = scan.gruppiProdotti.find((g) => g.campo === "category_id");
  ok(!gCat || !gCat.ids.includes("p2") || gCat.valore === "cat-lib", "categoria: solo se dedotta con confidenza");
  // 5) 🔒 SICUREZZA: nessuna proposta tocca un campo sensibile, mai
  const tuttiCampiProposti = [...scan.gruppiProdotti, ...scan.gruppiNegozi].map((g) => g.campo);
  ok(!tuttiCampiProposti.some(campoSensibile), "NESSUNA proposta deve toccare un campo sensibile");
  ok(campoSensibile("legal_fiscal_code") && campoSensibile("billing_iban") && campoSensibile("stripe_account_id"),
    "i campi legale/IBAN/stripe devono essere riconosciuti sensibili");
  ok(!campoSensibile("unit") && !campoSensibile("store_description"), "unit/store_description NON sono sensibili");
  // 6) description (voce) e images (materiale) e store senza logo/desc/hours finiscono in "procura"
  const etich = new Set(scan.procura.map((p) => p.etichetta));
  ok(etich.has("foto prodotto") && etich.has("descrizione"), "images/description devono essere da procurare");
  ok(etich.has("logo") && etich.has("descrizione vetrina") && etich.has("orari di apertura"), "gap negozio da procurare");
  // 7) i comandi pronti usano marketplace.mjs aggiorna e JSON valido
  const prop = proponi("products", "p1", "unit", "pezzo");
  ok(prop && /marketplace\.mjs aggiorna products p1 '\{"unit":"pezzo"\}'/.test(prop.comando), "comando pronto ben formato");
  ok(proponi("profiles", "s1", "legal_fiscal_code", "X") === null, "proponi() deve rifiutare un campo sensibile");

  if (fails.length) {
    console.error(`❌ SELFTEST FALLITO (${fails.length}):`);
    for (const f of fails) console.error(`   • ${f}`);
    process.exit(1);
  }
  console.log("✅ SELFTEST OK — logica di classificazione, proposte e sicurezza verificate (7 blocchi).");
  console.log(`   unit=pezzo→${gUnit.n} · condition=nuovo→${gCond.n} · da procurare: ${scan.procura.length} tipi · 0 campi sensibili toccati.`);
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  if (SELFTEST) return selftest();
  const quando = nowPiacenza();

  if (!MK_URL || !MK_KEY) {
    const msg = "MARKETPLACE_SUPABASE_URL/KEY assenti: supervisione no-op (nessun numero inventato).";
    await stampSegnale("supervisione-negozi", "ok", `${msg} · ${quando}`);
    if (JSON_MODE) console.log(JSON.stringify({ esito: "skip", motivo: msg, quando }));
    else console.log(`⏭️  ${msg}`);
    process.exit(0);
  }

  const dati = await leggiMarketplace();
  if (dati.negozi === null && dati.prodotti === null) {
    const msg = "REST marketplace cieco ora (letture fallite): salto, non invento numeri.";
    await stampSegnale("supervisione-negozi", "warn", `${msg} · ${quando}`);
    if (JSON_MODE) console.log(JSON.stringify({ esito: "cieco", motivo: msg, quando }));
    else console.log(`⛔ ${msg}`);
    process.exit(0);
  }

  const scan = scansiona(dati);
  const reportRel = scriviReport(scan, quando);
  salvaMemoria(scan, quando, reportRel);
  let accodato = false;
  if (ACCODA) accodato = accodaAzioni(scan, quando, reportRel);

  const c = scan.conteggi;
  await stampSegnale("supervisione-negozi", "ok",
    `${c.negozi} negozi · ${c.prodotti} prodotti · ${c.autofill_proposte} campi riempibili · ${c.da_procurare} da procurare · ${quando}`);

  if (JSON_MODE) {
    console.log(JSON.stringify({ esito: "ok", quando, ...scan, report: reportRel, accodato }, null, 2));
    process.exit(0);
  }

  console.log(`\n🛡️  SUPERVISIONE NEGOZI & PRODOTTI — ${quando}\n`);
  console.log(`   ${c.negozi} negozi (${c.negozi_approvati} approvati) · ${c.prodotti} prodotti`);
  console.log(`   ✅ ${c.autofill_proposte} campi riempibili in automatico (proposti) · 🙋 ${c.da_procurare} servono da te\n`);
  for (const g of [...scan.gruppiProdotti, ...scan.gruppiNegozi]) {
    console.log(`   ✅ ${titoloUmano(g)}`);
    console.log(`      ${g.perche}${g.note.length ? " · ⚠️ " + g.note.join(" · ") : ""}`);
  }
  if (scan.procura.length) {
    console.log(`\n   🙋 Serve da te (materia prima reale):`);
    for (const p of scan.procura) console.log(`      • ${p.etichetta}: ${p.n} — ${p.motivo}`);
  }
  console.log(`\n   📄 Report: ${reportRel}${accodato ? " · proposte accodate in AZIONI-IN-ATTESA (🟡)" : ""}`);
  console.log(`   🔒 Mai toccati: legale/fiscale/IBAN/KYC/Stripe/consensi/approvazione.\n`);
  process.exit(0);
}

// Export delle funzioni pure per il test end-to-end su dati reali (non tocca il comportamento CLI).
export { scansiona, analizzaRiga, campoSensibile, proponi, costruisciIndovina, SPEC_PRODOTTI, SPEC_NEGOZI };
export { scriviReport, salvaMemoria, accodaAzioni };

// Esegui il main solo se lanciato come CLI (non quando importato da un test).
import { fileURLToPath as _f } from "node:url";
if (process.argv[1] && _f(import.meta.url) === process.argv[1]) {
  main().catch(async (e) => {
    console.error("ERRORE supervisione-negozi:", e?.message || e);
    try { await stampSegnale("supervisione-negozi", "errore", `crash: ${(e.message || e).toString().slice(0, 160)}`); } catch {}
    process.exit(1);
  });
}
