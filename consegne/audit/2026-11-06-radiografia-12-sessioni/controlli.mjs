#!/usr/bin/env node
// I controlli di macchina della radiografia in 12 sessioni (prompt v5, passo 3.5).
//
// Uso (dalla radice di ad-mycity):
//   node consegne/audit/2026-11-06-radiografia-12-sessioni/controlli.mjs <comando> [argomenti] [opzioni]
//
// Comandi:
//   prepara                    scrive registro-compatto.txt, da-ricontrollare.txt, mappa-file.txt
//                              e la mappa di partenza dentro ogni scheda (fra i segni mappa:inizio/fine)
//   copertura-prima            lenti, file e angoli del 5/11 hanno tutti un proprietario
//   guardia-ramo <ramo> <SNN>  il ramo figlio cambia solo consegne/audit/<cartella>/referti/SNN.json
//   valida-referto <file>      il referto rispetta il formato del 5.6 e le regole del 3.5
//   copertura-dopo [file…]     i file letti o eseguiti dai referti, contro la mappa
//   copertura-palestra [file…] ogni pagina e ogni indirizzo interno ha almeno una prova da palestra
//   segnaposti                 nel LEGGIMI e nelle schede non resta nessun segnaposto dell'AD
//
// Uscita: 0 verde · 1 rosso · 2 uso sbagliato · 3 in attesa (o niente da esaminare: mai un verde muto).
//
// Opzioni (servono al collaudo, per lavorare su copie e mai sui file veri):
//   --cartella <dir>   la cartella di lavoro (predefinita: quella di questo file)
//   --radice <dir>     la radice di ad-mycity (predefinita: tre cartelle sopra questo file)
//   --sito <dir>       la copia del sito (predefinita: $MARKETPLACE_REPO, poi <radice>/marketplace)
//   --base <sha>       il commit del sito (predefinito: BASE_SITO qui sotto)
//   --registro <file>  il registro del sito (predefinito: quello del vault)
//   --git <dir>        il deposito git dove stanno i rami figli (predefinito: la radice)
//   --ad-ref <ref>     il ramo dell'AD da cui partono i figli (predefinito: origin/<RAMO_AD>)
//   --json             stampa l'esito anche in JSON sull'ultima riga

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
// L'unico esecutore di git della casa (malattia «git-letto-senza-tetto»): il tetto di maxBuffer sta lì, una volta sola.
import { gitEsegui } from "../../../cervello/git-github.mjs";

// ── I valori veri di questa radiografia ──────────────────────────────────────────────────────
export const BASE_SITO = "db5164c52e856c0e3eab1c02197ae755fca76eb3";
export const NOME_CARTELLA = "2026-11-06-radiografia-12-sessioni";
export const RAMO_AD = "claude/serene-wright-7l023n";
export const ID_AD = "session_015BmpnX3prh5pipxFGzQEeK";

export const SESSIONI = Array.from({ length: 12 }, (_, i) => `S${String(i + 1).padStart(2, "0")}`);
export const ANGOLI_5_11 = [
  "X-soldi", "X-permessi-db-live", "X-produzione-dal-vivo", "X-sito-dal-vero", "X-regole-business",
  "X-prove-automatiche", "X-flussi-utente", "X-concorrenza", "X-privacy-ciclo", "Y-attaccante-anonimo",
  "Y-attaccante-cliente", "Y-attaccante-negozio-rider", "Y-errori-silenziosi", "Y-tempo-e-date",
  "Y-promesse-vs-codice", "Y-avvisi-e-notifiche", "Y-dati-veri-incoerenti", "Z-account-di-prova",
  "Z-database-a-163", "Z-rimborso-contanti", "Z-documenti-fiscali",
];
const STATI_CHIUSI = new Set(["riparato", "chiuso", "gia_riparato_prima"]);
const SEVERITA = new Set(["bloccante", "grave", "minore"]);
const PROVE = new Set(["comando", "lettura-codice", "umano"]);
const ESITI_RICONTROLLO = new Set(["ancora_vero", "non_piu_vero", "cambiato", "non_verificabile"]);
const CHI = new Set(["cliente", "negozio", "fattorino", "admin", "estraneo"]);
const PRIVATO = "nel referto privato";
const FILE_PRIVATO = "(nel referto privato)";
const SEGNAPOSTI_REFERTO = ["<BASE_SITO>", '"…"', '"una delle 24 lenti"', '"come lo diresti a voce"', "AAAA-MM-GG HH:MM"];
const SEGNAPOSTI_AD = ["<BASE_SITO>", "<cartella>", "<il tuo ramo>", "<id>", "<data di oggi>"];
const TITOLO_RISERVATO = /^Falla di sicurezza da chiudere \((?!\s*\))([^()]+)\): i dettagli restano fuori dal deposito pubblico finché non è chiusa\.?$/;
const SEP = " · ";

// ── Opzioni ──────────────────────────────────────────────────────────────────────────────────
const QUI = dirname(fileURLToPath(import.meta.url));
function leggiOpzioni(argv) {
  const opz = { posizionali: [], json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") opz.json = true;
    else if (a.startsWith("--")) {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) throw new Error(`manca il valore di ${a}`);
      opz[a.slice(2)] = v;
      i++;
    } else opz.posizionali.push(a);
  }
  opz.cartella = resolve(opz.cartella ?? QUI);
  opz.radice = resolve(opz.radice ?? join(QUI, "..", "..", ".."));
  opz.sito = resolve(opz.sito ?? process.env.MARKETPLACE_REPO ?? join(opz.radice, "marketplace"));
  opz.base = opz.base ?? BASE_SITO;
  opz.registro = resolve(opz.registro ?? join(opz.radice, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json"));
  opz.dimensioni = resolve(opz.dimensioni ?? join(opz.radice, "cervello/dimensioni-radiografia.json"));
  opz.git = resolve(opz.git ?? opz.radice);
  opz["ad-ref"] = opz["ad-ref"] ?? `origin/${RAMO_AD}`;
  return opz;
}

// ── Aiutanti ─────────────────────────────────────────────────────────────────────────────────
// `grezzo`: i byte esatti, senza .trim(), perché il conto delle righe di un file deve restare quello vero
const git = (dir, args) => gitEsegui(["-C", dir, ...args], undefined, {}, { grezzo: true }).toString("utf8");
function gitOk(dir, args) {
  try { return git(dir, args); } catch { return null; }
}
function lenti(opz) {
  const d = JSON.parse(readFileSync(opz.dimensioni, "utf8"));
  const l = d?.case?.marketplace?.dimensioni;
  if (!Array.isArray(l) || l.length === 0) throw new Error(`nessuna lente della casa marketplace in ${opz.dimensioni}`);
  return l;
}
function fileDelSito(opz) {
  const out = gitOk(opz.sito, ["ls-tree", "-r", "--name-only", opz.base]);
  if (out === null) throw new Error(`il commit ${opz.base} non c'è nella copia del sito ${opz.sito}`);
  return out.split("\n").filter(Boolean);
}
const righeCache = new Map();
function righeDi(opz, percorso) {
  if (righeCache.has(percorso)) return righeCache.get(percorso);
  // solo un file vero (blob): una cartella risponde anche lei a `git show` (collaudo del 6/11)
  const tipo = (gitOk(opz.sito, ["cat-file", "-t", `${opz.base}:${percorso}`]) ?? "").trim();
  if (tipo !== "blob") { righeCache.set(percorso, null); return null; }
  const testo = gitOk(opz.sito, ["show", `${opz.base}:${percorso}`]);
  const n = testo === null ? null : testo.split("\n").length - (testo.endsWith("\n") ? 1 : 0);
  righeCache.set(percorso, n);
  return n;
}
const vuoto = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const piatto = (v) => String(v ?? "").replace(/[\t\r\n]+/g, " ").trim();
function sezione(testo, titolo) {
  // le righe sotto «## <titolo>» fino alla prossima intestazione di QUALSIASI livello (anche ###):
  // una voce sotto «### Lenti che NON guardo» non conta. I commenti HTML si tolgono prima di leggere:
  // è il modo normale di spegnere una riga in markdown (collaudo del 6/11, buco 5).
  const pulito = testo.replace(/<!--[\s\S]*?-->/g, "");
  const righe = pulito.split("\n");
  const i = righe.findIndex((r) => r.trim().toLowerCase() === `## ${titolo}`.toLowerCase());
  if (i < 0) return [];
  const fuori = [];
  for (let j = i + 1; j < righe.length; j++) {
    if (/^\s*#{1,6}\s/.test(righe[j])) break;
    fuori.push(righe[j]);
  }
  return fuori;
}
// Le voci di un elenco: solo righe «- `nome`». Il testo prima dell'elenco è ammesso; dopo la prima voce,
// qualsiasi riga che non è una voce né vuota chiude l'elenco (un titoletto in grassetto «**Passate a S04:**»
// non può tenere sotto di sé lenti che contano). Un blocco di codice o una sottolineatura chiudono sempre.
// Terzo collaudo del 6/11: un titoletto PRIMA della prima voce («**Passate a S04, non le guardo:**») e una voce
// con una coda («- `x` — NON la guardo») facevano contare la lente. Ora l'elenco deve essere la prima cosa
// della sezione, e ogni voce è esattamente «- `nome`», al più con una nota fra parentesi. Il testo che
// spiega va dopo l'elenco, dove lo chiude.
const VOCE_ESATTA = /^-\s+`([^`]+)`(\s+\([^()]*\))?\s*$/;
function voci(righe) {
  const fuori = [];
  for (const r of righe) {
    if (r.trim() === "") continue;
    const m = r.match(VOCE_ESATTA);
    if (!m) break;
    fuori.push(m[1]);
  }
  return fuori;
}
function leggiScheda(opz, s) {
  const p = join(opz.cartella, "schede", `${s}.md`);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

// ── La mappa dei file: chi possiede cosa ─────────────────────────────────────────────────────
const BINARIO = /\.(png|jpe?g|gif|webp|avif|ico|svg|bmp|ttf|otf|woff2?|eot|mp3|mp4|webm|mov|pdf|zip)$/i;
export function segnoDi(p) {
  if (BINARIO.test(p)) return "binario";
  if (/^tests\//.test(p) || /^docs\/mockup\//.test(p)) return "strumento";
  if (/\.(md|txt)$/i.test(p) || /^docs\//.test(p)) return "documento";
  return "codice";
}
// I file che S12 può avere da sola senza nominarli: stories/, .storybook/, tests/, docs/mockup/, config di radice.
export const radiceConfig = (p) => !p.includes("/") && !/^(middleware|i18n|instrumentation.*|sentry\..*)\.ts$/.test(p) && !["vercel.json", "next.config.js"].includes(p);
export const soloS12Ammesso = (p) => /^(stories|\.storybook|tests|docs\/mockup)\//.test(p) || radiceConfig(p);

// Ogni regola che combacia aggiunge i suoi proprietari (unione, non la prima che vince).
const REGOLE = [
  // radice e cartelle di servizio (§3.4)
  [/^middleware\.ts$/, ["S04"]],
  [/^i18n\.ts$/, ["S10"]],
  [/^vercel\.json$/, ["S08", "S11"]],
  [/^next\.config\.js$/, ["S11", "S12"]],
  [/^(sentry\.[^/]+\.config\.ts|instrumentation[^/]*\.ts)$/, ["S08"]],
  [radiceConfig, ["S12"]], // gli altri file della radice: configurazione, README, prompt
  [/^(stories|\.storybook|tests|types|\.claude)\//, ["S12"]],
  [/^docs\/mockup\//, ["S12"]],
  [/^docs\/(unit-economics|business-plan)\.md$/, ["S02"]],
  [/^docs\/(business-plan|acquisition-plan-90d|dpa-vendors)\.md$/, ["S09"]],
  [/^docs\/(security-audit|csp-nonce-migration-plan|audit-sicurezza-performance-2026-06)\.md$/, ["S04"]],
  [/^docs\/(runbook|hosting-vercel|backup-restore|csp-nonce-migration-plan|bundle-analysis|audit-sicurezza-performance-2026-06)\.md$/, ["S11"]],
  [/^docs\/(runbook)\.md$|^docs\/crons\.json$/, ["S08"]],
  [/^docs\/(migrazioni-baseline-produzione|backup-restore)\.md$/, ["S05"]],
  [/^docs\/i18n-migration-plan\.md$/, ["S10"]],
  [/^docs\/(decisions|bundle-analysis)\.md$/, ["S12"]],
  [/^migrations\//, ["S05"]],
  [/^scripts\//, ["S05"]],
  [/^seeds\//, ["S04", "S05"]],
  [/^supabase\//, ["S05"]],
  [/^public\//, ["S11"]],
  [/^public\/(manifest\.json|sw\.js|offline\.html)$/, ["S10"]],
  [/^\.github\//, ["S11"]],
  [/^messages\//, ["S10"]],

  // tutto quello che si vede: S10
  [/^app\/(?!api\/).*\.(tsx|css|ttf)$/, ["S10"]],
  [/^app\/carattere-del-marchio\.ts$/, ["S10"]],
  [/^components\//, ["S10"]],

  // le pagine, per tema
  [/^app\/admin\//, ["S08"]],
  [/^app\/admin\/(cod-remittance|payouts|credito-del-rimborso|coupons)\//, ["S02"]],
  [/^app\/admin\/sponsored\//, ["S03"]],
  [/^app\/admin\/(disputes|delivery|orders)\//, ["S06"]],
  [/^app\/admin\/segnalazioni\//, ["S09"]],
  [/^app\/admin\/users\//, ["S04"]],
  [/^app\/seller\//, ["S07"]],
  [/^app\/seller\/earnings\//, ["S02"]],
  [/^app\/seller\/promote\//, ["S03"]],
  [/^app\/seller\/help\//, ["S09"]],
  [/^app\/rider\//, ["S07"]],
  [/^app\/rider\/earnings\//, ["S02"]],
  [/^app\/rider\/(help|onboarding)\//, ["S09"]],
  [/^app\/(sell|messages)\//, ["S07"]],
  [/^app\/profile\//, ["S06"]],
  [/^app\/profile\/(loyalty|referral)\//, ["S02"]],
  [/^app\/profile\/gift-cards\//, ["S03"]],
  [/^app\/(orders|store|stores|product|search|near|category|categorie|novita|piu-venduti|piccoli-prezzi|promozioni|shop-of-month|favorites|lists|cart|shared-cart|checkout|events|u|notifications)\//, ["S06"]],
  [/^app\/checkout\//, ["S02"]],
  [/^app\/(page|layout|loading|not-found)\.tsx$/, ["S06"]],
  [/^app\/(error|global-error)\.tsx$/, ["S08"]],
  [/^app\/regali\//, ["S03", "S06"]],
  [/^app\/(auth|sign-in|sign-up|reset-password|accetta-condizioni)\//, ["S04", "S06"]],
  [/^app\/(terms|privacy|cookies|shipping|returns|faq|about|lavora-con-noi|come-funziona|help|accessibility|contact|disiscrizione)\//, ["S09"]],
  [/^app\/status\//, ["S08", "S11"]],
  [/^app\/(sitemap|robots)\.ts$|^app\/opengraph-image\.tsx$/, ["S11"]],

  // gli indirizzi interni: S04 guarda chi può chiamarli, il tema guarda cosa fanno
  [/^app\/api\//, ["S04"]],
  [/^app\/api\/ai\//, ["S12", "S07"]],
  [/^app\/api\/admin\//, ["S08"]],
  [/^app\/api\/cron\//, ["S08"]],
  [/^app\/api\/cron\/(release-payouts|riquadra-casse)\//, ["S02"]],
  [/^app\/api\/cron\/(veloce-non-confermata|expire-stale-orders|expire-checkouts)\//, ["S06"]],
  [/^app\/api\/cron\/process-deletions\//, ["S09"]],
  [/^app\/api\/seller\//, ["S07"]],
  [/^app\/api\/seller\/subscription\//, ["S03"]],
  [/^app\/api\/(stripe|sponsored|gift-cards)\//, ["S03"]],
  [/^app\/api\/returns\//, ["S06", "S02"]],
  [/^app\/api\/account\//, ["S06", "S09"]],
  [/^app\/api\/vision\//, ["S12", "S07"]],
  [/^app\/api\/rider\//, ["S07", "S02"]],
  [/^app\/api\/kyc\//, ["S07", "S09"]],
  [/^app\/api\/chat\//, ["S07"]],
  [/^app\/api\/(segnalazioni|contact|consent)\//, ["S09"]],
  [/^app\/api\/(products|catalogo)\//, ["S06", "S07"]],
  [/^app\/api\/orders\//, ["S06", "S02"]],
  [/^app\/api\/(newsletter|unsubscribe|track)\//, ["S08", "S09"]],
  [/^app\/api\/health\//, ["S08", "S11"]],
  [/^app\/api\/support\//, ["S08", "S06"]],
  [/^app\/api\/(profili-pubblici|marketplace|geocode|consegna)\//, ["S06"]],
  [/^app\/api\/(locale|image)\//, ["S10"]],

  // lib, cartelle
  [/^lib\/ordini\//, ["S06", "S02"]],
  [/^lib\/(stripe|pagamenti|rimborsi)\//, ["S03"]],
  [/^lib\/(pagamenti|rimborsi|cassa|guadagni)\//, ["S02"]],
  [/^lib\/(queries|products|shipping-etichetta|tempo|ricerca|preferiti|liste|account|hooks)\//, ["S06"]],
  [/^lib\/queries\/controparte-della-chat\.ts$/, ["S07"]],
  [/^lib\/products\//, ["S07"]],
  [/^lib\/(analytics|push|cron|assistenza)\//, ["S08"]],
  [/^lib\/assistenza\//, ["S06"]],
  [/^lib\/email\//, ["S08"]],
  [/^lib\/email\/(templates|unsubscribe)\.ts$/, ["S09"]],
  [/^lib\/health\//, ["S08", "S11"]],
  [/^lib\/ai\//, ["S12", "S04"]],
  [/^lib\/admin\//, ["S08", "S04"]],
  [/^lib\/(auth|upload)\//, ["S04"]],
  [/^lib\/api\//, ["S04", "S12"]],
  [/^lib\/(supabase|storage)\//, ["S05", "S04"]],
  [/^lib\/db\//, ["S05"]],
  [/^lib\/(privacy|legal)\//, ["S09"]],
  [/^lib\/account\//, ["S09"]],
  [/^lib\/(ui|design|media|hooks)\//, ["S10"]],
  [/^lib\/kyc\//, ["S07", "S04"]],
  [/^lib\/(seller|rider)\//, ["S07"]],
  [/^lib\/rider\//, ["S02"]],
  [/^lib\/bg-removal\//, ["S07", "S12"]],
  [/^lib\/net\//, ["S12", "S04"]],

  // lib, file singoli
  [/^lib\/(coupons|loyalty|promotions)\.ts$/, ["S02"]],
  [/^lib\/(cart|ritiro-in-negozio)\.ts$/, ["S06", "S02"]],
  [/^lib\/funzioni-al-lancio\.ts$/, ["S04", "S03"]],
  [/^lib\/(captcha|rate-limit|safe-redirect|sanitize-html|html-escape|shopping-access|stato-interruttore)\.ts$/, ["S04"]],
  [/^lib\/indirizzo-immagine-ammesso\.ts$/, ["S04", "S10"]],
  [/^lib\/csv-sicuro\.ts$/, ["S04", "S07"]],
  [/^lib\/(db-rows|database\.types)\.ts$/, ["S05"]],
  [/^lib\/database\.types\.ts$/, ["S12"]],
  [/^lib\/(delivery|shipping|shipping-coordinate|store-hours|store-trust|category-attributes|geo|geocodifica|posizione|cart-sync|bozza-checkout|riordino|ordini-recenti|order-status|account-menu|tempo-piacenza)\.ts$/, ["S06"]],
  [/^lib\/(quando-arriva|promessa-consegna)\.ts$/, ["S06", "S09"]],
  [/^lib\/(griglia-prodotti|cms|cms-page|home-site|store-site|banner-vetrina)\.ts$/, ["S06", "S10"]],
  [/^lib\/store-customization\.ts$/, ["S07", "S10"]],
  [/^lib\/(altezza-banner|site-branding|image-url|image-resize|image-loader|immagini-base64|immagine-categoria|foto-mancante|preload-foto|format|cn|zod-i18n)\.ts$/, ["S10"]],
  [/^lib\/installabile\.ts$/, ["S10", "S11"]],
  [/^lib\/(metriche-venditore|contatto-whatsapp)\.ts$/, ["S07"]],
  [/^lib\/maggiore-eta\.ts$/, ["S07", "S09"]],
  [/^lib\/(logger|esito-scrittura|audit|audit-azioni|activity|carrelli-abbandonati|cron-health|letture-cruscotto|salute-marketplace|user-agent)\.ts$/, ["S08"]],
  [/^lib\/(errors|experiments)\.ts$/, ["S08", "S12"]],
  [/^lib\/cron-cancellazioni\.ts$/, ["S08", "S09"]],
  [/^lib\/health-env\.ts$/, ["S08", "S11"]],
  [/^lib\/(consent|promesse-pubbliche|contatti-pubblici)\.ts$/, ["S09"]],
  [/^lib\/env\.ts$/, ["S11", "S12"]],
  [/^lib\/(vista-query|stato-vista)\.ts$/, ["S12", "S06"]],
  [/^lib\/(paginazione|constants)\.ts$/, ["S12"]],

  // componenti, per tema (S10 li ha già tutti)
  [/^components\/(seller|rider)\//, ["S07"]],
  [/^components\/rider\/(RiderConnectButton)\.tsx$/, ["S03"]],
  [/^components\/rider\/CashConfirmDialog\.tsx$/, ["S02"]],
  [/^components\/admin\//, ["S08"]],
  [/^components\/checkout\//, ["S06", "S02"]],
  [/^components\/(store-sections|home|home-sections|products|orders|cart|account|hooks|cms)\//, ["S06"]],
  [/^components\/analytics\//, ["S08"]],
  [/^components\/providers\//, ["S12"]],
  [/^components\/[^/]+\.tsx$/, ["S06"]],
  [/^components\/(CookieBanner|GoogleAnalytics)\.tsx$/, ["S09"]],
  [/^components\/(Turnstile|Honeypot|PhotoReviewUpload)\.tsx$/, ["S04"]],
  [/^components\/(AIDescriptionButton|SupportChatModal|SupportChatButton|SupportProductAssistant)\.tsx$/, ["S12"]],
  [/^components\/(SupportChatModal|SupportChatButton)\.tsx$/, ["S08"]],
  [/^components\/(AIDescriptionButton|SellerApplicationForm|VendorForm|StoreMediaManager|StoreLocationPicker|StoreLocationPickerLazy|SellerShoppingBanner|ContactSellerButton)\.tsx$/, ["S07"]],
  [/^components\/(PushNotificationOptIn|ServiceWorkerRegister|PWAInstallBanner)\.tsx$/, ["S11"]],
  [/^components\/WelcomeCreditBanner\.tsx$/, ["S02"]],
];

export function proprietariDi(p) {
  const s = new Set();
  for (const [re, chi] of REGOLE) if (typeof re === "function" ? re(p) : re.test(p)) chi.forEach((x) => s.add(x));
  return [...s].sort();
}

// ── prepara ──────────────────────────────────────────────────────────────────────────────────
async function prepara(opz) {
  const { chiaveProblema } = await import(pathToFileURL(join(opz.radice, "cervello/referti-sito.mjs")).href);
  const reg = JSON.parse(readFileSync(opz.registro, "utf8"));
  const problemi = reg.problemi;
  if (!Array.isArray(problemi) || problemi.length === 0) throw new Error("il registro non ha problemi: niente da preparare");
  const riservata = (p) => /^Falla di sicurezza/.test(p.titolo ?? "");
  const compatto = ["# indice\tchiave\tstato\tgravita\tdimensione\tfile\ttitolo  (le riservate: solo chiave, stato, gravità e titolo)"];
  const daRic = ["# indice\tchiave\tgravita\tfile\ttitolo  (le voci aperte NON riservate, per S01)"];
  problemi.forEach((p, i) => {
    const chiave = chiaveProblema(p);
    if (riservata(p)) compatto.push(["-", chiave, p.stato, p.severita, "-", "-", piatto(p.titolo)].join("\t"));
    else {
      compatto.push([i, chiave, p.stato, p.severita, piatto(p.dimensione), piatto(p.file), piatto(p.titolo)].join("\t"));
      if (p.stato === "aperto") daRic.push([i, chiave, p.severita, piatto(p.file), piatto(p.titolo)].join("\t"));
    }
  });
  writeFileSync(join(opz.cartella, "registro-compatto.txt"), compatto.join("\n") + "\n");
  writeFileSync(join(opz.cartella, "da-ricontrollare.txt"), daRic.join("\n") + "\n");

  const files = fileDelSito(opz);
  const righe = [];
  const conti = { codice: 0, documento: 0, strumento: 0, binario: 0 };
  const perSessione = Object.fromEntries(SESSIONI.map((s) => [s, []]));
  const orfani = [];
  for (const f of files) {
    const chi = proprietariDi(f);
    const segno = segnoDi(f);
    conti[segno]++;
    if (chi.length === 0) orfani.push(f);
    chi.forEach((s) => perSessione[s].push(f));
    righe.push(`${f}\t${chi.join(",") || "-"}\t${segno}`);
  }
  const testa = [
    `# mappa dei file del sito a ${opz.base}: percorso<TAB>sessioni<TAB>segno`,
    `# file: ${files.length} · codice ${conti.codice} · documento ${conti.documento} · strumento ${conti.strumento} · binario ${conti.binario}`,
    `# per sessione: ${SESSIONI.map((s) => `${s} ${perSessione[s].length}`).join(" · ")}`,
    `# senza proprietario: ${orfani.length}`,
  ];
  writeFileSync(join(opz.cartella, "mappa-file.txt"), [...testa, ...righe].join("\n") + "\n");

  // la mappa di partenza dentro ogni scheda
  for (const s of SESSIONI) {
    const p = join(opz.cartella, "schede", `${s}.md`);
    if (!existsSync(p)) continue;
    const testo = readFileSync(p, "utf8");
    const a = testo.indexOf("<!-- mappa:inizio -->"), b = testo.indexOf("<!-- mappa:fine -->");
    if (a < 0 || b < a) continue;
    const gruppi = {};
    for (const f of perSessione[s]) {
      const parti = f.split("/");
      const g = parti.length > 2 ? `${parti[0]}/${parti[1]}/` : parti.length === 2 ? `${parti[0]}/` : "(radice)";
      gruppi[g] = (gruppi[g] ?? 0) + 1;
    }
    const elenco = Object.entries(gruppi).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
    const corpo = [
      "<!-- mappa:inizio -->",
      `File di partenza a \`${opz.base}\`: **${perSessione[s].length}**, per cartella:`,
      "",
      elenco.length ? elenco.map(([g, n]) => `\`${g}\` ${n}`).join(" · ") : "(nessun file: questa sessione lavora su un elenco, non su una zona)",
      "",
      `L'elenco intero: \`grep -P '\\t([^\\t]*,)?${s}(,[^\\t]*)?\\t' consegne/audit/${NOME_CARTELLA}/mappa-file.txt | cut -f1\``,
      "",
    ].join("\n");
    writeFileSync(p, testo.slice(0, a) + corpo + testo.slice(b));
  }
  console.log(`registro-compatto.txt: ${problemi.length} voci · da-ricontrollare.txt: ${daRic.length - 1} voci aperte non riservate`);
  console.log(testa.slice(1).join("\n").replace(/# /g, "mappa-file.txt: "));
  if (orfani.length) {
    console.log(`🔴 ${orfani.length} file senza proprietario:\n  ${orfani.slice(0, 50).join("\n  ")}`);
    return 1;
  }
  return 0;
}

// ── copertura-prima ──────────────────────────────────────────────────────────────────────────
function coperturaPrima(opz) {
  const rossi = [];
  const tutteLenti = lenti(opz);
  const schede = Object.fromEntries(SESSIONI.map((s) => [s, leggiScheda(opz, s)]));
  for (const s of SESSIONI) if (schede[s] === null) rossi.push(`manca la scheda ${s}`);
  // (a) ogni lente per nome nella sezione «Lenti» di almeno una scheda fra S02 e S12
  const chiLaCopre = Object.fromEntries(tutteLenti.map((l) => [l, []]));
  for (const s of SESSIONI) {
    if (!schede[s]) continue;
    for (const l of voci(sezione(schede[s], "Lenti"))) {
      if (!(l in chiLaCopre)) rossi.push(`${s}: la lente «${l}» non è una delle ${tutteLenti.length} della casa marketplace`);
      else if (s !== "S01") chiLaCopre[l].push(s);
    }
  }
  for (const [l, chi] of Object.entries(chiLaCopre)) if (chi.length === 0) rossi.push(`(a) la lente «${l}» non è in nessuna scheda fra S02 e S12`);
  // (b) la mappa contro ls-tree
  const mappaP = join(opz.cartella, "mappa-file.txt");
  const veri = new Set(fileDelSito(opz));
  if (!existsSync(mappaP)) rossi.push("(b) manca mappa-file.txt");
  else {
    const nominatiS12 = new Set(voci(sezione(schede.S12 ?? "", "File che guardo da sola")));
    const visti = new Set();
    for (const r of readFileSync(mappaP, "utf8").split(/\r?\n/)) {
      if (!r || r.startsWith("#")) continue;
      const [f, chiTesto = "", segno = ""] = r.split("\t");
      if (visti.has(f)) rossi.push(`(b) riga ripetuta nella mappa: ${f}`);
      visti.add(f);
      const chi = chiTesto.split(",").map((x) => x.trim()).filter((x) => x && x !== "-");
      if (!veri.has(f)) rossi.push(`(b) la mappa nomina un file che a ${opz.base.slice(0, 12)} non esiste: ${f}`);
      if (chi.length === 0) rossi.push(`(b) senza proprietario: ${f}`);
      if (new Set(chi).size !== chi.length) rossi.push(`(b) proprietario ripetuto per ${f}: ${chiTesto}`);
      for (const x of chi) if (!SESSIONI.includes(x)) rossi.push(`(b) proprietario sconosciuto «${x}» per ${f}`);
      const unici = [...new Set(chi)];
      // S01 non cerca difetti nuovi: un file che ha solo lei non lo guarda nessuno
      if (unici.length === 1 && unici[0] === "S01") rossi.push(`(b) solo S01, che non cerca difetti nuovi: ${f}`);
      if (unici.length === 1 && unici[0] === "S12" && !soloS12Ammesso(f) && !nominatiS12.has(f)) rossi.push(`(b) solo S12, fuori dalle cartelle ammesse e non nominato nella scheda di S12: ${f}`);
      if (veri.has(f) && segno !== segnoDi(f)) rossi.push(`(b) segno «${segno}» sbagliato per ${f}: è «${segnoDi(f)}»`);
    }
    for (const f of veri) if (!visti.has(f)) rossi.push(`(b) manca dalla mappa: ${f}`);
  }
  // (c) i 21 angoli del 5/11
  const angoli = new Set();
  for (const s of SESSIONI) if (schede[s]) for (const a of voci(sezione(schede[s], "eredita_dal_5_11"))) {
    if (!ANGOLI_5_11.includes(a)) rossi.push(`${s}: angolo sconosciuto «${a}» in eredita_dal_5_11`);
    angoli.add(a);
  }
  for (const a of ANGOLI_5_11) if (!angoli.has(a)) rossi.push(`(c) l'angolo «${a}» non è in nessuna scheda`);
  return chiudi("copertura-prima", rossi, [], opz, { lenti: tutteLenti.length, file: veri.size, angoli: ANGOLI_5_11.length });
}

// ── guardia-ramo ─────────────────────────────────────────────────────────────────────────────
// Guarda la STORIA del ramo, commit per commit, non solo la differenza netta: un file scritto e poi
// cancellato resta nella storia pubblica, e una rinomina nasconde una cancellazione (collaudo del 6/11,
// buco 2). I commit che il ramo dell'AD raggiunge non contano: così un ramo partito da un commit dell'AD
// successivo, o un ramo che riporta dentro il ramo dell'AD (anche dopo un'unione di main), si giudica giusto.
function revList(dir, args) {
  return (gitOk(dir, ["rev-list", ...args]) ?? "").split("\n").filter(Boolean);
}
function guardiaRamo(opz) {
  let [ramo, s] = opz.posizionali;
  if (!ramo || !SESSIONI.includes(s)) return uso("guardia-ramo <ramo> <SNN>");
  ramo = ramo.replace(/^origin\//, "");
  const ref = `origin/${ramo}`;
  if (gitOk(opz.git, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]) === null) {
    return chiudi("guardia-ramo", [], [`${ref} non esiste ancora`], opz);
  }
  const rossi = [], attese = [];
  const sessioniP = join(opz.cartella, "sessioni.json");
  const sess = existsSync(sessioniP) ? JSON.parse(readFileSync(sessioniP, "utf8")) : null;
  const partenza = (Array.isArray(sess?.sessioni) ? sess.sessioni : []).find((x) => x.sessione === s)?.partenza;
  if (vuoto(partenza)) return chiudi("guardia-ramo", [`${s}: in sessioni.json manca la «partenza»`], [], opz);
  if (gitOk(opz.git, ["merge-base", "--is-ancestor", partenza, ref]) === null) {
    return chiudi("guardia-ramo", [`${s}: ${ref} non parte da ${partenza.slice(0, 12)}, la partenza scritta in sessioni.json`], [], opz);
  }
  const adRef = opz["ad-ref"];
  if (gitOk(opz.git, ["rev-parse", "--verify", "--quiet", `${adRef}^{commit}`]) === null) rossi.push(`il ramo dell'AD «${adRef}» non esiste: passa --ad-ref`);
  const testaRamo = (gitOk(opz.git, ["rev-parse", ref]) ?? "").trim();
  const testaAd = (gitOk(opz.git, ["rev-parse", adRef]) ?? "").trim();
  // Un figlio ancora vuoto sta fermo su un commit della storia principale dell'AD (la catena dei primi
  // genitori): è «in attesa», anche se l'AD è andato avanti o ha unito main (terzo collaudo del 6/11).
  // Per la D5 i figli non si uniscono mai nel ramo dell'AD: un figlio con commit suoi già dentro è un errore.
  if (adRef.replace(/^origin\//, "") === ramo) rossi.push(`«--ad-ref ${adRef}» è il ramo figlio stesso: il ramo dell'AD è sbagliato`);
  const fermoSullAd = testaAd ? revList(opz.git, ["--first-parent", adRef]).includes(testaRamo) : false;
  if (testaAd && !fermoSullAd && gitOk(opz.git, ["merge-base", "--is-ancestor", ref, adRef]) !== null) rossi.push(`${ref} è già tutto dentro «${adRef}»: i rami figli non si uniscono nel ramo dell'AD (D5), i referti si portano con git checkout … -- file`);
  // del figlio sono i commit che il ramo dell'AD non raggiunge: così un'unione di main nel ramo dell'AD,
  // o un figlio partito dopo quell'unione, non mette sul conto del figlio i file di main (ricollaudo del 6/11)
  const delFiglio = revList(opz.git, [`${partenza}..${ref}`, ...(testaAd ? ["--not", adRef] : [])]);
  const toccati = new Set();
  for (const c of delFiglio) {
    const genitori = (gitOk(opz.git, ["rev-list", "--parents", "-n", "1", c]) ?? "").trim().split(/\s+/).slice(1);
    // un'unione conta solo per quello che cambia rispetto a TUTTI i genitori (le sue correzioni a mano)
    const args = genitori.length > 1 ? ["diff-tree", "-r", "--cc", "--name-only", "--no-renames", "--no-commit-id", c] : ["diff-tree", "-r", "--root", "--name-only", "--no-renames", "--no-commit-id", c];
    for (const f of (gitOk(opz.git, args) ?? "").split("\n").filter(Boolean)) if (f !== c) toccati.add(f);
  }
  const ammesso = `consegne/audit/${NOME_CARTELLA}/referti/${s}.json`;
  const altri = [...toccati].filter((f) => f !== ammesso);
  if (altri.length) rossi.push(`${s}: nella storia del ramo ci sono ${altri.length} file oltre al referto: ${altri.slice(0, 10).join(", ")}`);
  if (delFiglio.length === 0) attese.push(`${s}: il ramo non ha ancora nessun commit suo`);
  return chiudi("guardia-ramo", rossi, attese, opz, { commit_del_figlio: delFiglio.length, file_toccati: toccati.size });
}

// ── valida-referto ───────────────────────────────────────────────────────────────────────────
const CAMPI_DIFETTO = ["id", "dimensione", "titolo", "severita", "file", "descrizione", "impatto", "fix", "causa_radice", "prova", "prova_tipo", "prova_eseguita", "esito_prova", "perche_umano", "verificato", "verificato_da", "gia_noto", "perimetro_altrui", "riservato"];
const CAMPI_REGRESSIONE = ["chiave", "indice", "prova", "esito_prova"];
// trovati-ondata-1.txt (passo 6.4): una riga per difetto della prima ondata, separata da TAB:
// id, sessione, gravità, file, titolo. Le riservate: id, sessione, -, -, titolo generico «Falla di sicurezza…».
function trovatiOndata1(opz) {
  const p = join(opz.cartella, "trovati-ondata-1.txt");
  if (!existsSync(p)) return null;
  const m = new Map();
  for (const r of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!r || r.startsWith("#")) continue;
    const c = r.split("\t");
    m.set(c[0].trim(), c[c.length - 1] ?? "");
  }
  return m;
}
// Una chiave scritta due volte nello stesso oggetto: JSON.parse tiene l'ultima, ma il ramo pubblico mostra il
// testo intero, quindi anche la prima (terzo collaudo del 6/11). Un lettore minimo, solo per contare le chiavi.
export function chiaviDoppie(testo) {
  const doppie = [];
  const pila = [];
  let i = 0, attesaChiave = false;
  const leggiStringa = () => {
    let j = i + 1, fuori = "";
    while (j < testo.length && testo[j] !== '"') { if (testo[j] === "\\") { fuori += testo[j] + testo[j + 1]; j += 2; } else fuori += testo[j++]; }
    i = j + 1;
    return fuori;
  };
  while (i < testo.length) {
    const ch = testo[i];
    if (ch === "{") { pila.push(new Set()); attesaChiave = true; i++; }
    else if (ch === "[") { pila.push(null); attesaChiave = false; i++; }
    else if (ch === "}" || ch === "]") { pila.pop(); attesaChiave = false; i++; }
    else if (ch === ",") { attesaChiave = pila.at(-1) instanceof Set; i++; }
    else if (ch === '"') {
      const s = leggiStringa();
      if (attesaChiave && pila.at(-1) instanceof Set) {
        if (pila.at(-1).has(s)) doppie.push(s);
        pila.at(-1).add(s);
        attesaChiave = false;
      }
    } else i++;
  }
  return doppie;
}
function leggiTabella(p, colChiave, colGravita) {
  const m = new Map();
  if (!existsSync(p)) return null;
  for (const r of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!r || r.startsWith("#")) continue;
    const c = r.split("\t");
    m.set(c[colChiave], { gravita: c[colGravita], stato: c[2], titolo: c[c.length - 1] ?? "", righe: c });
  }
  return m;
}
function controllaPosto(opz, posto, ctx, rossi) {
  const p = posto.trim();
  const m = p.match(/^(.+):(\d+)(?:-(\d+))?$/);
  if (!m) return rossi.push(`${ctx}: «${p}» non è percorso:riga né percorso:inizio-fine né uno dei prefissi ammessi`);
  const [, perc, a, b] = m;
  const n = righeDi(opz, perc);
  if (n === null) return rossi.push(`${ctx}: ${perc} non è un file a ${opz.base.slice(0, 12)}`);
  const ini = Number(a), fin = b === undefined ? ini : Number(b);
  if (ini < 1 || fin < ini || fin > n) rossi.push(`${ctx}: righe ${a}${b ? "-" + b : ""} fuori da ${perc} (${n} righe)`);
}
function percorsoEsiste(opz, perc) {
  return righeDi(opz, perc) !== null;
}
function dataVera(t) {
  const m = String(t ?? "").match(/^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)$/);
  if (!m) return false;
  const [, aa, mm, gg, hh, mi] = m.map(Number);
  const d = new Date(Date.UTC(aa, mm - 1, gg, hh, mi));
  return d.getUTCFullYear() === aa && d.getUTCMonth() === mm - 1 && d.getUTCDate() === gg && hh <= 23 && mi <= 59;
}
function chiavi(o, fuori = []) {
  if (Array.isArray(o)) o.forEach((x) => chiavi(x, fuori));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { fuori.push(k); chiavi(v, fuori); }
  return fuori;
}
function valori(o, fuori = []) {
  if (typeof o === "string") fuori.push(o);
  else if (Array.isArray(o)) o.forEach((x) => valori(x, fuori));
  else if (o && typeof o === "object") Object.values(o).forEach((x) => valori(x, fuori));
  return fuori;
}
// Le aree ammesse nel titolo di una riservata: le 11 già usate nel registro più le 24 lenti. Un elenco chiuso,
// perché un'area libera può raccontare la falla anche in poche parole (ricollaudo del 6/11).
const AREE_DEL_REGISTRO = ["rilascio", "API", "pagamenti", "privacy", "flussi", "regole del database", "accessi", "dati", "regole d'accesso al database", "sicurezza degli accessi", "intelligenza artificiale"];
const normaArea = (a) => String(a ?? "").replace(/[\u2018\u2019\u02BC]/g, "'").replace(/[\s\u00a0]+/g, " ").trim().toLowerCase();
function validaReferto(opz) {
  const [file] = opz.posizionali;
  if (!file) return uso("valida-referto <file>");
  const rossi = [], attese = [];
  let testo, r;
  try { testo = readFileSync(file, "utf8"); r = JSON.parse(testo); } catch (e) { return chiudi("valida-referto", [`${file}: non si legge come JSON (${e.message})`], [], opz); }
  const doppie = chiaviDoppie(testo);
  if (doppie.length) rossi.push(`chiavi scritte due volte nello stesso oggetto (il ramo pubblico mostra anche la prima): ${[...new Set(doppie)].join(", ")}`);
  const tutteLenti = new Set(lenti(opz));
  // i segnaposti del modello: nel testo grezzo E nei valori già letti (un «…» scritto … si vede solo qui)
  const tuttiIValori = valori(r);
  for (const sp of SEGNAPOSTI_REFERTO) {
    const nudo = sp.startsWith('"') ? sp.slice(1, -1) : null;
    if (testo.includes(sp) || tuttiIValori.some((v) => (nudo !== null ? v === nudo : v.includes(sp)))) rossi.push(`segnaposto del modello rimasto: ${sp}`);
  }
  const s = r.sessione;
  if (!SESSIONI.includes(s)) rossi.push(`«sessione» non valida: ${s}`);
  const dalNome = basename(file).match(/^(S\d\d)\.json$/)?.[1];
  if (dalNome && dalNome !== s) rossi.push(`il file si chiama ${dalNome}.json ma il referto dice ${s}`);
  if (r.base_sito !== opz.base) rossi.push(`base_sito ${r.base_sito} diversa da ${opz.base}`);
  if (!dataVera(r.aggiornato)) rossi.push(`«aggiornato» non è una data vera AAAA-MM-GG HH:MM: ${r.aggiornato}`);
  if (typeof r.finita !== "boolean") rossi.push("«finita» deve essere true o false");
  const finita = r.finita === true;
  for (const campo of ["difetti", "regressioni", "ricontrolli", "prove_per_la_palestra", "domande_per_nicola"]) if (!Array.isArray(r[campo])) rossi.push(`«${campo}» deve essere un elenco`);
  if (typeof r.copertura !== "object" || r.copertura === null) rossi.push("manca «copertura»");
  if (typeof r.conto !== "object" || r.conto === null) rossi.push("manca «conto»");
  const cop = r.copertura ?? {};
  for (const f of cop.file_letti_interi ?? []) if (!percorsoEsiste(opz, f)) rossi.push(`copertura.file_letti_interi: ${f} non è un file a ${opz.base.slice(0, 12)}`);
  for (const x of cop.file_letti_in_parte ?? []) {
    if (!/^\d+-\d+$/.test(String(x?.righe ?? ""))) { rossi.push(`copertura.file_letti_in_parte: righe «${x?.righe}» per ${x?.file}`); continue; }
    controllaPosto(opz, `${x.file}:${x.righe}`, "copertura.file_letti_in_parte", rossi);
  }
  for (const x of cop.file_eseguiti ?? []) {
    if (!percorsoEsiste(opz, x?.file ?? "")) rossi.push(`copertura.file_eseguiti: ${x?.file} non è un file a ${opz.base.slice(0, 12)}`);
    if (vuoto(x?.comando) || vuoto(x?.esito)) rossi.push(`copertura.file_eseguiti: ${x?.file} senza comando o esito`);
  }
  for (const x of cop.non_guardato ?? []) if (vuoto(x?.cosa) || vuoto(x?.perche)) rossi.push("copertura.non_guardato: ogni voce vuole «cosa» e «perche»");
  const nCoperti = (cop.file_letti_interi ?? []).length + (cop.file_letti_in_parte ?? []).length + (cop.file_eseguiti ?? []).length;
  if (finita && nCoperti === 0) rossi.push("referto finito senza nessun file letto o eseguito: una sessione che non ha guardato niente non è finita");

  const reg = leggiTabella(join(opz.cartella, "registro-compatto.txt"), 1, 3);
  const ids = new Set();
  for (const d of Array.isArray(r.difetti) ? r.difetti : []) {
    const ctx = `difetto ${d?.id ?? "(senza id)"}`;
    if (vuoto(d?.id) || !new RegExp(`^${s}-\\d{3,}$`).test(d.id)) rossi.push(`${ctx}: l'id deve essere ${s}-NNN`);
    if (ids.has(d?.id)) rossi.push(`${ctx}: id ripetuto`);
    ids.add(d?.id);
    if (!tutteLenti.has(d?.dimensione)) rossi.push(`${ctx}: dimensione «${d?.dimensione}» non è una delle ${tutteLenti.size} lenti`);
    if (!SEVERITA.has(d?.severita)) rossi.push(`${ctx}: severita «${d?.severita}»`);
    if (!PROVE.has(d?.prova_tipo)) rossi.push(`${ctx}: prova_tipo «${d?.prova_tipo}»`);
    if (typeof d?.prova_eseguita !== "boolean") rossi.push(`${ctx}: prova_eseguita deve essere true o false`);
    if (typeof d?.riservato !== "boolean") rossi.push(`${ctx}: riservato deve essere true o false`);
    if (typeof d?.verificato !== "boolean") rossi.push(`${ctx}: verificato deve essere true o false`);
    const riservato = d?.riservato === true;
    // il titolo «Falla di sicurezza…» è il segno con cui il registro riconosce le riservate (3.1)
    if (/^\s*falla di sicurezza/i.test(d?.titolo ?? "") && !riservato) rossi.push(`${ctx}: un titolo «Falla di sicurezza…» vuole riservato: true`);
    const posti = String(d?.file ?? "").split(SEP).map((x) => x.trim()).filter(Boolean);
    if (posti.length === 0) rossi.push(`${ctx}: «file» vuoto`);
    const provaAComando = d?.prova_tipo === "comando" && d?.prova_eseguita === true && !vuoto(d?.esito_prova);
    for (const posto of posti) {
      const pre = posto.match(/^(live|vercel|produzione|stripe):(.+)$/);
      if (posto === FILE_PRIVATO) { if (!riservato) rossi.push(`${ctx}: «${FILE_PRIVATO}» solo con riservato: true`); continue; }
      if (pre) {
        const [, tipo] = pre;
        const ammesse = { live: ["S11"], vercel: ["S11"], produzione: ["S05", "S11"], stripe: ["S03"] }[tipo];
        if (!ammesse.includes(s)) rossi.push(`${ctx}: «${tipo}:» è ammesso solo in ${ammesse.join(" e ")}`);
        if (!provaAComando) rossi.push(`${ctx}: «${tipo}:» vuole prova_tipo «comando», prova_eseguita true ed esito_prova`);
        continue;
      }
      controllaPosto(opz, posto, ctx, rossi);
    }
    if (riservato) {
      // un elenco chiuso di campi: un campo in più («nota», «dettagli») porterebbe la falla in chiaro
      const extra = Object.keys(d ?? {}).filter((k) => !CAMPI_DIFETTO.includes(k));
      if (extra.length) rossi.push(`${ctx}: una riservata ha solo i campi del 5.6; in più: ${extra.join(", ")}`);
      const area = (d?.titolo ?? "").match(TITOLO_RISERVATO)?.[1];
      const areeAmmesse = new Set([...AREE_DEL_REGISTRO, ...tutteLenti].map(normaArea));
      if (!area || !areeAmmesse.has(normaArea(area))) rossi.push(`${ctx}: il titolo di una riservata è «Falla di sicurezza da chiudere (<area>): i dettagli restano fuori dal deposito pubblico finché non è chiusa», senza numero R, e l'area è una di queste: ${AREE_DEL_REGISTRO.join(", ")}, oppure il nome di una lente (l'area scritta era «${area ?? ""}»)`);
      if (d?.file !== FILE_PRIVATO) rossi.push(`${ctx}: una riservata ha file «${FILE_PRIVATO}» e nient'altro`);
      for (const c of ["descrizione", "impatto", "fix", "causa_radice", "prova", "esito_prova", "verificato_da"]) if (d?.[c] !== PRIVATO) rossi.push(`${ctx}: in una riservata «${c}» vale «${PRIVATO}»`);
      const pu = d?.prova_tipo === "umano" ? PRIVATO : null;
      if (d?.perche_umano !== pu) rossi.push(`${ctx}: in una riservata «perche_umano» vale ${pu === null ? "null" : `«${PRIVATO}»`}`);
      if (d?.gia_noto !== null) rossi.push(`${ctx}: in una riservata «gia_noto» è null`);
      if (d?.perimetro_altrui !== null) rossi.push(`${ctx}: in una riservata «perimetro_altrui» è null`);
    } else {
      for (const c of ["titolo", "descrizione", "impatto", "fix", "causa_radice", "prova"]) if (vuoto(d?.[c])) rossi.push(`${ctx}: «${c}» vuoto`);
    }
    // un difetto che rimanda a una falla riservata già nota la porterebbe in chiaro: quei dettagli vanno in chat
    if (!vuoto(d?.gia_noto)) {
      const v = reg?.get(d.gia_noto);
      const versoRiservata = /^falla di sicurezza/i.test(v?.titolo ?? "") || /\|\s*falla di sicurezza/i.test(String(d.gia_noto));
      if (versoRiservata) rossi.push(`${ctx}: «gia_noto» punta a una falla riservata: un difetto così si scrive riservato, e i dettagli vanno in chat`);
      else if (/^S\d\d-\d{3,}$/.test(String(d.gia_noto).trim())) {
        // un id della prima ondata: si cerca in trovati-ondata-1.txt, dove le riservate stanno con il titolo generico
        const t1 = trovatiOndata1(opz);
        const voce = t1?.get(String(d.gia_noto).trim());
        if (!t1) rossi.push(`${ctx}: «gia_noto» è un id della prima ondata, ma trovati-ondata-1.txt non c'è ancora`);
        else if (!voce) rossi.push(`${ctx}: «gia_noto» ${d.gia_noto} non è in trovati-ondata-1.txt`);
        else if (/^falla di sicurezza/i.test(voce)) rossi.push(`${ctx}: «gia_noto» punta a una falla riservata della prima ondata: un difetto così si scrive riservato, e i dettagli vanno in chat`);
      } else if (reg && !v) rossi.push(`${ctx}: «gia_noto» non è una chiave del registro né l'id di un difetto della prima ondata`);
    }
    if (d?.perimetro_altrui != null && !SESSIONI.includes(d.perimetro_altrui)) rossi.push(`${ctx}: perimetro_altrui «${d.perimetro_altrui}» non è una sessione`);
    // l'asticella
    if (d?.severita === "grave" || d?.severita === "bloccante") {
      const umano = d?.prova_tipo === "umano" && String(d?.perche_umano ?? "").trim().length >= 15;
      if (!provaAComando && !umano) (finita ? rossi : attese).push(`${ctx}: un ${d.severita} vuole una prova a comando eseguita con esito, oppure «umano» col perché (almeno una frase)`);
    }
    if (finita && (d?.verificato !== true || vuoto(d?.verificato_da))) rossi.push(`${ctx}: a referto finito ogni difetto è verificato da un altro (verificato true e verificato_da)`);
  }

  for (const g of Array.isArray(r.regressioni) ? r.regressioni : []) {
    const ctx = `regressione ${g?.chiave ?? "(senza chiave)"}`;
    if (vuoto(g?.chiave) || vuoto(g?.prova) || vuoto(g?.esito_prova)) { rossi.push(`${ctx}: servono chiave, prova ed esito_prova`); continue; }
    const extra = Object.keys(g).filter((k) => !CAMPI_REGRESSIONE.includes(k));
    if (extra.length) rossi.push(`${ctx}: una regressione ha solo chiave, indice, prova ed esito_prova; in più: ${extra.join(", ")}`);
    const v = reg?.get(g.chiave);
    if (!reg) { attese.push("manca registro-compatto.txt: le regressioni non si possono controllare"); continue; }
    if (!v) { rossi.push(`${ctx}: la chiave non è nel registro`); continue; }
    if (!STATI_CHIUSI.has(v.stato)) rossi.push(`${ctx}: la voce è «${v.stato}», una regressione riguarda solo voci riparate o chiuse`);
    // la regressione di una falla riservata: prova ed esito restano privati (5.5), come l'indice
    if (/^falla di sicurezza/i.test(v.titolo) || /^falla di sicurezza/i.test(String(g.chiave).split("|")[1] ?? "")) {
      if (g.prova !== PRIVATO || g.esito_prova !== PRIVATO) rossi.push(`${ctx}: è una falla riservata: «prova» ed «esito_prova» valgono «${PRIVATO}», i dettagli vanno in chat`);
      if (g.indice !== undefined && g.indice !== null) rossi.push(`${ctx}: è una falla riservata: niente «indice», basta la chiave`);
    }
  }

  // l'id di una riservata non si nomina in nessun altro campo: chi lo legge accanto a una frase
  // («S03-001: la rotta … si apre a tutti») ha la falla in chiaro (collaudo del 6/11)
  const idRiservate = (Array.isArray(r.difetti) ? r.difetti : []).filter((d) => d?.riservato === true && !vuoto(d?.id)).map((d) => d.id);
  if (idRiservate.length) {
    const fuoriDalleRiservate = { ...r, difetti: (r.difetti ?? []).filter((d) => d?.riservato !== true) };
    for (const v of [...valori(fuoriDalleRiservate), ...chiavi(fuoriDalleRiservate)]) for (const id of idRiservate) if (new RegExp(`\\b${id}\\b`, "i").test(v)) rossi.push(`l'id della riservata ${id} compare in un altro campo: «${v.slice(0, 60)}…» va tolto`);
  }

  const daRic = leggiTabella(join(opz.cartella, "da-ricontrollare.txt"), 1, 2);
  const ric = Array.isArray(r.ricontrolli) ? r.ricontrolli : [];
  if (s !== "S01" && ric.length) rossi.push(`«ricontrolli» lo compila solo S01 (${ric.length} voci in ${s})`);
  const chiaviViste = new Set();
  for (const k of ric) {
    const ctx = `ricontrollo ${k?.chiave ?? "(senza chiave)"}`;
    if (chiaviViste.has(k?.chiave)) rossi.push(`${ctx}: la stessa voce ricontrollata due volte`);
    chiaviViste.add(k?.chiave);
    if (!ESITI_RICONTROLLO.has(k?.esito)) rossi.push(`${ctx}: esito «${k?.esito}»`);
    const v = daRic?.get(k?.chiave);
    if (!daRic) { attese.push("manca da-ricontrollare.txt: i ricontrolli non si possono controllare"); continue; }
    if (!v) { rossi.push(`${ctx}: la chiave non è in da-ricontrollare.txt`); continue; }
    if (k.esito === "non_piu_vero" && (v.gravita === "grave" || v.gravita === "bloccante")) {
      const ok = k?.prova_tipo === "comando" && k?.prova_eseguita === true && !vuoto(k?.esito_prova);
      if (!ok) (finita ? rossi : attese).push(`${ctx}: chiudere un ${v.gravita} vuole una prova a comando eseguita con esito`);
    }
    if ((k.esito === "non_piu_vero" || k.esito === "cambiato") && vuoto(k?.prova)) rossi.push(`${ctx}: «${k.esito}» vuole la prova`);
  }

  for (const pv of Array.isArray(r.prove_per_la_palestra) ? r.prove_per_la_palestra : []) {
    const ctx = `prova da palestra ${pv?.id ?? "(senza id)"}`;
    for (const c of ["chi", "file", "passi", "atteso"]) if (vuoto(pv?.[c])) rossi.push(`${ctx}: «${c}» vuoto`);
    if (!vuoto(pv?.chi) && !CHI.has(pv.chi)) rossi.push(`${ctx}: chi «${pv.chi}»`);
    for (const perc of String(pv?.file ?? "").split(SEP).map((x) => x.trim()).filter(Boolean)) {
      if (/:\d+(-\d+)?$/.test(perc)) rossi.push(`${ctx}: «${perc}» porta una riga, qui vanno percorsi senza riga`);
      else if (!percorsoEsiste(opz, perc)) rossi.push(`${ctx}: ${perc} non è un file a ${opz.base.slice(0, 12)}`);
    }
  }
  return chiudi("valida-referto", rossi, [...new Set(attese)], opz, { difetti: (r.difetti ?? []).length, finita });
}

// ── copertura-dopo e copertura-palestra ─────────────────────────────────────────────────────
function referti(opz) {
  if (opz.posizionali.length) return opz.posizionali;
  const d = join(opz.cartella, "referti");
  return existsSync(d) ? readdirSync(d).filter((f) => /^S\d\d\.json$/.test(f)).map((f) => join(d, f)) : [];
}
function leggiMappa(opz) {
  const p = join(opz.cartella, "mappa-file.txt");
  if (!existsSync(p)) throw new Error("manca mappa-file.txt");
  return readFileSync(p, "utf8").split(/\r?\n/).filter((r) => r && !r.startsWith("#")).map((r) => { const [f, chi, segno] = r.split("\t"); return { f, chi, segno }; });
}
function coperturaDopo(opz) {
  const elenco = referti(opz);
  if (elenco.length === 0) return chiudi("copertura-dopo", [], ["nessun referto da leggere"], opz);
  const interi = new Set(), parte = new Set(), eseguiti = new Set();
  for (const p of elenco) {
    const c = JSON.parse(readFileSync(p, "utf8")).copertura ?? {};
    (c.file_letti_interi ?? []).forEach((f) => interi.add(f));
    (c.file_letti_in_parte ?? []).forEach((x) => parte.add(x.file));
    (c.file_eseguiti ?? []).forEach((x) => eseguiti.add(x.file));
  }
  const mappa = leggiMappa(opz);
  const conta = (seg) => mappa.filter((m) => m.segno === seg).length;
  const coperto = (f) => interi.has(f) || parte.has(f) || eseguiti.has(f);
  const scoperti = mappa.filter((m) => m.segno === "codice" && !coperto(m.f)).map((m) => `${m.f}\t${m.chi}`);
  const docScoperti = mappa.filter((m) => m.segno === "documento" && !coperto(m.f)).length;
  const strumentiEseguiti = mappa.filter((m) => m.segno === "strumento" && coperto(m.f)).length;
  console.log(`referti: ${elenco.length}`);
  console.log(`letti interi: ${interi.size} · letti in parte: ${parte.size} · eseguiti: ${eseguiti.size}`);
  console.log(`codice: ${conta("codice")} file, ${conta("codice") - scoperti.length} coperti, ${scoperti.length} scoperti`);
  console.log(`documento: ${conta("documento")} file, ${docScoperti} non letti · strumento: ${conta("strumento")} file, ${strumentiEseguiti} letti o eseguiti · binario: ${conta("binario")} file (a parte)`);
  if (scoperti.length) console.log(`file di codice che nessuno ha coperto (percorso<TAB>proprietari):\n${scoperti.join("\n")}`);
  // verde solo a copertura piena: un buco è lavoro per il terzo giro (7.4), non un verde (scorciatoia 10)
  const attese = scoperti.length ? [`${scoperti.length} file di codice su ${conta("codice")} non li ha coperti nessuno`] : [];
  return chiudi("copertura-dopo", [], attese, opz, { scoperti: scoperti.length });
}
function coperturaPalestra(opz) {
  const elenco = referti(opz);
  if (elenco.length === 0) return chiudi("copertura-palestra", [], ["nessun referto da leggere"], opz);
  const conProva = new Set();
  for (const p of elenco) for (const pv of JSON.parse(readFileSync(p, "utf8")).prove_per_la_palestra ?? []) {
    String(pv.file ?? "").split(SEP).map((x) => x.trim()).filter(Boolean).forEach((f) => conProva.add(f));
  }
  const files = fileDelSito(opz);
  const pagine = files.filter((f) => /^app\/(.+\/)?page\.tsx$/.test(f));
  // gli indirizzi interni sono tutti i route.ts di app/: i 107 di app/api più quelli dell'accesso fuori da app/api
  const indirizzi = files.filter((f) => /^app\/(.+\/)?route\.ts$/.test(f));
  const senza = [...pagine, ...indirizzi].filter((f) => !conProva.has(f));
  console.log(`pagine: ${pagine.length} · indirizzi interni: ${indirizzi.length} (di cui in app/api: ${indirizzi.filter((f) => f.startsWith("app/api/")).length}) · senza prova da palestra: ${senza.length}`);
  if (senza.length) console.log(senza.join("\n"));
  return chiudi("copertura-palestra", senza.length ? [`${senza.length} fra pagine e indirizzi senza nessuna prova da palestra`] : [], [], opz, { pagine: pagine.length, indirizzi: indirizzi.length, senza: senza.length });
}

// ── segnaposti ───────────────────────────────────────────────────────────────────────────────
function segnaposti(opz) {
  const rossi = [];
  if (!existsSync(opz.cartella)) return chiudi("segnaposti", [`la cartella ${opz.cartella} non esiste`], [], opz);
  const testi = [join(opz.cartella, "LEGGIMI.md"), ...SESSIONI.map((s) => join(opz.cartella, "schede", `${s}.md`))];
  for (const p of testi) {
    if (!existsSync(p)) { rossi.push(`manca ${p.slice(opz.cartella.length + 1)}`); continue; }
    const t = readFileSync(p, "utf8");
    for (const sp of SEGNAPOSTI_AD) if (t.includes(sp)) rossi.push(`${p.slice(opz.cartella.length + 1)}: resta ${sp}`);
    const base = t.match(/^base_sito:\s*["']?([0-9a-f]+)["']?\s*$/m)?.[1];
    if (base !== opz.base) rossi.push(`${p.slice(opz.cartella.length + 1)}: base_sito «${base ?? "assente"}» diversa da ${opz.base}`);
  }
  return chiudi("segnaposti", rossi, [], opz, { testi: testi.length });
}

// ── uscita ───────────────────────────────────────────────────────────────────────────────────
function chiudi(nome, rossi, attese, opz, extra = {}) {
  const esito = rossi.length ? "rosso" : attese.length ? "in attesa" : "verde";
  const segno = { rosso: "🔴", "in attesa": "⚪", verde: "✅" }[esito];
  for (const r of rossi) console.log(`🔴 ${r}`);
  for (const a of attese) console.log(`⚪ ${a}`);
  console.log(`${segno} ${nome}: ${esito}${rossi.length ? ` (${rossi.length} problemi)` : ""}`);
  if (opz.json) console.log(JSON.stringify({ controllo: nome, esito, rossi, attese, ...extra }));
  return rossi.length ? 1 : attese.length ? 3 : 0;
}
function uso(riga) {
  console.error(`uso: node controlli.mjs ${riga}`);
  return 2;
}

const COMANDI = {
  prepara, "copertura-prima": coperturaPrima, "guardia-ramo": guardiaRamo, "valida-referto": validaReferto,
  "copertura-dopo": coperturaDopo, "copertura-palestra": coperturaPalestra, segnaposti,
};
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [comando, ...resto] = process.argv.slice(2);
  let codice;
  try {
    const opz = leggiOpzioni(resto);
    if (!COMANDI[comando]) codice = uso(`<${Object.keys(COMANDI).join("|")}> …`);
    else codice = await COMANDI[comando](opz);
  } catch (e) {
    console.error(`🔴 ${e.message}`);
    codice = 1;
  }
  process.exit(codice);
}
