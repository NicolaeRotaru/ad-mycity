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
//   --ad-ref <ref>     il ramo dell'AD da cui partono i figli (predefinito: HEAD del deposito git)
//   --json             stampa l'esito anche in JSON sull'ultima riga

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
const TITOLO_RISERVATO = /^Falla di sicurezza da chiudere \((?!\s*\))([^()]+)\): i dettagli restano fuori dal deposito pubblico finché non è chiusa$/;
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
  opz["ad-ref"] = opz["ad-ref"] ?? "HEAD";
  return opz;
}

// ── Aiutanti ─────────────────────────────────────────────────────────────────────────────────
const git = (dir, args) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
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
  const testo = gitOk(opz.sito, ["show", `${opz.base}:${percorso}`]);
  const n = testo === null ? null : testo.split("\n").length - (testo.endsWith("\n") ? 1 : 0);
  righeCache.set(percorso, n);
  return n;
}
const vuoto = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const piatto = (v) => String(v ?? "").replace(/[\t\r\n]+/g, " ").trim();
function sezione(testo, titolo) {
  // le righe sotto «## <titolo>» fino alla prossima intestazione ## o #
  const righe = testo.split("\n");
  const i = righe.findIndex((r) => r.trim().toLowerCase() === `## ${titolo}`.toLowerCase());
  if (i < 0) return [];
  const fuori = [];
  for (let j = i + 1; j < righe.length; j++) {
    if (/^#{1,2}\s/.test(righe[j])) break;
    fuori.push(righe[j]);
  }
  return fuori;
}
const voci = (righe) => righe.map((r) => r.match(/^\s*-\s+`([^`]+)`/)?.[1]).filter(Boolean);
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
    for (const r of readFileSync(mappaP, "utf8").split("\n")) {
      if (!r || r.startsWith("#")) continue;
      const [f, chiTesto = ""] = r.split("\t");
      visti.add(f);
      const chi = chiTesto.split(",").map((x) => x.trim()).filter((x) => x && x !== "-");
      if (!veri.has(f)) rossi.push(`(b) la mappa nomina un file che a ${opz.base.slice(0, 12)} non esiste: ${f}`);
      if (chi.length === 0) rossi.push(`(b) senza proprietario: ${f}`);
      for (const x of chi) if (!SESSIONI.includes(x)) rossi.push(`(b) proprietario sconosciuto «${x}» per ${f}`);
      if (chi.length === 1 && chi[0] === "S12" && !soloS12Ammesso(f) && !nominatiS12.has(f)) rossi.push(`(b) solo S12, fuori dalle cartelle ammesse e non nominato nella scheda di S12: ${f}`);
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
function guardiaRamo(opz) {
  const [ramo, s] = opz.posizionali;
  if (!ramo || !SESSIONI.includes(s)) return uso("guardia-ramo <ramo> <SNN>");
  const ref = `origin/${ramo}`;
  if (gitOk(opz.git, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]) === null) {
    return chiudi("guardia-ramo", [], [`${ref} non esiste ancora`], opz);
  }
  const rossi = [], attese = [];
  const sessioniP = join(opz.cartella, "sessioni.json");
  const sess = existsSync(sessioniP) ? JSON.parse(readFileSync(sessioniP, "utf8")) : null;
  const partenza = (Array.isArray(sess?.sessioni) ? sess.sessioni : []).find((x) => x.sessione === s)?.partenza;
  if (vuoto(partenza)) rossi.push(`${s}: in sessioni.json manca la «partenza»`);
  else if (gitOk(opz.git, ["merge-base", "--is-ancestor", partenza, ref]) === null) rossi.push(`${s}: ${ref} non parte da ${partenza.slice(0, 12)}, la partenza scritta in sessioni.json`);
  // la base è l'ultimo commit dell'AD che il ramo contiene: così un ramo partito da un commit dell'AD
  // successivo alla partenza non si vede addosso i file dell'AD
  const base = (gitOk(opz.git, ["merge-base", ref, opz["ad-ref"]]) ?? "").trim() || partenza;
  if (!vuoto(base)) {
    const cambiati = (gitOk(opz.git, ["diff", "--name-only", `${base}...${ref}`]) ?? "").split("\n").filter(Boolean);
    const ammesso = `consegne/audit/${NOME_CARTELLA}/referti/${s}.json`;
    const altri = cambiati.filter((f) => f !== ammesso);
    if (altri.length) rossi.push(`${s}: il ramo cambia ${altri.length} file oltre al referto: ${altri.slice(0, 10).join(", ")}`);
    if (cambiati.length === 0) attese.push(`${s}: il ramo non ha ancora cambiato nessun file`);
  }
  return chiudi("guardia-ramo", rossi, attese, opz);
}

// ── valida-referto ───────────────────────────────────────────────────────────────────────────
function leggiTabella(p, colChiave, colGravita) {
  const m = new Map();
  if (!existsSync(p)) return null;
  for (const r of readFileSync(p, "utf8").split("\n")) {
    if (!r || r.startsWith("#")) continue;
    const c = r.split("\t");
    m.set(c[colChiave], { gravita: c[colGravita], stato: c[2], righe: c });
  }
  return m;
}
function controllaPosto(opz, posto, ctx, rossi, permessi) {
  const p = posto.trim();
  const m = p.match(/^([^\s:]+):(\d+)(?:-(\d+))?$/);
  if (!m) return rossi.push(`${ctx}: «${p}» non è percorso:riga né percorso:inizio-fine${permessi ? " né uno dei prefissi ammessi" : ""}`);
  const [, perc, a, b] = m;
  const n = righeDi(opz, perc);
  if (n === null) return rossi.push(`${ctx}: ${perc} non esiste a ${opz.base.slice(0, 12)}`);
  const ini = Number(a), fin = b === undefined ? ini : Number(b);
  if (ini < 1 || fin < ini || fin > n) rossi.push(`${ctx}: righe ${a}${b ? "-" + b : ""} fuori da ${perc} (${n} righe)`);
}
function percorsoEsiste(opz, perc) {
  return righeDi(opz, perc) !== null;
}
function validaReferto(opz) {
  const [file] = opz.posizionali;
  if (!file) return uso("valida-referto <file>");
  const rossi = [], attese = [];
  let testo, r;
  try { testo = readFileSync(file, "utf8"); r = JSON.parse(testo); } catch (e) { return chiudi("valida-referto", [`${file}: non si legge come JSON (${e.message})`], [], opz); }
  const tutteLenti = new Set(lenti(opz));
  for (const sp of SEGNAPOSTI_REFERTO) if (testo.includes(sp)) rossi.push(`segnaposto del modello rimasto: ${sp}`);
  const s = r.sessione;
  if (!SESSIONI.includes(s)) rossi.push(`«sessione» non valida: ${s}`);
  const dalNome = basename(file).match(/^(S\d\d)\.json$/)?.[1];
  if (dalNome && dalNome !== s) rossi.push(`il file si chiama ${dalNome}.json ma il referto dice ${s}`);
  if (r.base_sito !== opz.base) rossi.push(`base_sito ${r.base_sito} diversa da ${opz.base}`);
  if (!/^\d{4}-\d\d-\d\d \d\d:\d\d$/.test(r.aggiornato ?? "")) rossi.push(`«aggiornato» non è AAAA-MM-GG HH:MM: ${r.aggiornato}`);
  if (typeof r.finita !== "boolean") rossi.push("«finita» deve essere true o false");
  const finita = r.finita === true;
  for (const campo of ["difetti", "regressioni", "ricontrolli", "prove_per_la_palestra", "domande_per_nicola"]) if (!Array.isArray(r[campo])) rossi.push(`«${campo}» deve essere un elenco`);
  if (typeof r.copertura !== "object" || r.copertura === null) rossi.push("manca «copertura»");
  if (typeof r.conto !== "object" || r.conto === null) rossi.push("manca «conto»");
  const cop = r.copertura ?? {};
  for (const f of cop.file_letti_interi ?? []) if (!percorsoEsiste(opz, f)) rossi.push(`copertura.file_letti_interi: ${f} non esiste`);
  for (const x of cop.file_letti_in_parte ?? []) {
    if (!/^\d+-\d+$/.test(String(x?.righe ?? ""))) { rossi.push(`copertura.file_letti_in_parte: righe «${x?.righe}» per ${x?.file}`); continue; }
    controllaPosto(opz, `${x.file}:${x.righe}`, "copertura.file_letti_in_parte", rossi, false);
  }
  for (const x of cop.file_eseguiti ?? []) {
    if (!percorsoEsiste(opz, x?.file ?? "")) rossi.push(`copertura.file_eseguiti: ${x?.file} non esiste`);
    if (vuoto(x?.comando) || vuoto(x?.esito)) rossi.push(`copertura.file_eseguiti: ${x?.file} senza comando o esito`);
  }
  for (const x of cop.non_guardato ?? []) if (vuoto(x?.cosa) || vuoto(x?.perche)) rossi.push("copertura.non_guardato: ogni voce vuole «cosa» e «perche»");

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
    const riservato = d?.riservato === true;
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
      controllaPosto(opz, posto, ctx, rossi, true);
    }
    if (riservato) {
      if (!TITOLO_RISERVATO.test(d?.titolo ?? "") || /R\d+/.test(d?.titolo ?? "")) rossi.push(`${ctx}: il titolo di una riservata è «Falla di sicurezza da chiudere (<area>): i dettagli restano fuori dal deposito pubblico finché non è chiusa», senza numero R`);
      if (d?.file !== FILE_PRIVATO) rossi.push(`${ctx}: una riservata ha file «${FILE_PRIVATO}» e nient'altro`);
      for (const c of ["descrizione", "impatto", "fix", "causa_radice", "prova", "esito_prova", "verificato_da"]) if (d?.[c] !== PRIVATO) rossi.push(`${ctx}: in una riservata «${c}» vale «${PRIVATO}»`);
      const pu = d?.prova_tipo === "umano" ? PRIVATO : null;
      if (d?.perche_umano !== pu) rossi.push(`${ctx}: in una riservata «perche_umano» vale ${pu === null ? "null" : `«${PRIVATO}»`}`);
      if (d?.gia_noto !== null) rossi.push(`${ctx}: in una riservata «gia_noto» è null`);
      if (d?.perimetro_altrui !== null) rossi.push(`${ctx}: in una riservata «perimetro_altrui» è null`);
    } else {
      for (const c of ["titolo", "descrizione", "impatto", "fix", "causa_radice", "prova"]) if (vuoto(d?.[c])) rossi.push(`${ctx}: «${c}» vuoto`);
    }
    if (d?.perimetro_altrui != null && !SESSIONI.includes(d.perimetro_altrui)) rossi.push(`${ctx}: perimetro_altrui «${d.perimetro_altrui}» non è una sessione`);
    // l'asticella
    if (d?.severita === "grave" || d?.severita === "bloccante") {
      const umano = d?.prova_tipo === "umano" && !vuoto(d?.perche_umano);
      if (!provaAComando && !umano) (finita ? rossi : attese).push(`${ctx}: un ${d.severita} vuole una prova a comando eseguita con esito, oppure «umano» col perché`);
    }
    if (finita && (d?.verificato !== true || vuoto(d?.verificato_da))) rossi.push(`${ctx}: a referto finito ogni difetto è verificato da un altro (verificato true e verificato_da)`);
  }

  const reg = leggiTabella(join(opz.cartella, "registro-compatto.txt"), 1, 3);
  for (const g of Array.isArray(r.regressioni) ? r.regressioni : []) {
    const ctx = `regressione ${g?.chiave ?? "(senza chiave)"}`;
    if (vuoto(g?.chiave) || vuoto(g?.prova) || vuoto(g?.esito_prova)) { rossi.push(`${ctx}: servono chiave, prova ed esito_prova`); continue; }
    const v = reg?.get(g.chiave);
    if (!reg) attese.push("manca registro-compatto.txt: le regressioni non si possono controllare");
    else if (!v) rossi.push(`${ctx}: la chiave non è nel registro`);
    else if (!STATI_CHIUSI.has(v.stato)) rossi.push(`${ctx}: la voce è «${v.stato}», una regressione riguarda solo voci riparate o chiuse`);
  }

  const daRic = leggiTabella(join(opz.cartella, "da-ricontrollare.txt"), 1, 2);
  const ric = Array.isArray(r.ricontrolli) ? r.ricontrolli : [];
  if (s !== "S01" && ric.length) rossi.push(`«ricontrolli» lo compila solo S01 (${ric.length} voci in ${s})`);
  for (const k of ric) {
    const ctx = `ricontrollo ${k?.chiave ?? "(senza chiave)"}`;
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
      if (/:\d/.test(perc)) rossi.push(`${ctx}: «${perc}» porta una riga, qui vanno percorsi senza riga`);
      else if (!percorsoEsiste(opz, perc)) rossi.push(`${ctx}: ${perc} non esiste a ${opz.base.slice(0, 12)}`);
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
  return readFileSync(p, "utf8").split("\n").filter((r) => r && !r.startsWith("#")).map((r) => { const [f, chi, segno] = r.split("\t"); return { f, chi, segno }; });
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
  return chiudi("copertura-dopo", [], [], opz, { scoperti: scoperti.length });
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
  const indirizzi = files.filter((f) => /^app\/api\/(.+\/)?route\.ts$/.test(f));
  const senza = [...pagine, ...indirizzi].filter((f) => !conProva.has(f));
  console.log(`pagine: ${pagine.length} · indirizzi interni: ${indirizzi.length} · senza prova da palestra: ${senza.length}`);
  if (senza.length) console.log(senza.join("\n"));
  return chiudi("copertura-palestra", senza.length ? [`${senza.length} fra pagine e indirizzi senza nessuna prova da palestra`] : [], [], opz, { pagine: pagine.length, indirizzi: indirizzi.length, senza: senza.length });
}

// ── segnaposti ───────────────────────────────────────────────────────────────────────────────
function segnaposti(opz) {
  const rossi = [];
  const testi = [join(opz.cartella, "LEGGIMI.md"), ...SESSIONI.map((s) => join(opz.cartella, "schede", `${s}.md`))];
  let letti = 0;
  for (const p of testi) {
    if (!existsSync(p)) { rossi.push(`manca ${p.slice(opz.cartella.length + 1)}`); continue; }
    letti++;
    const t = readFileSync(p, "utf8");
    for (const sp of SEGNAPOSTI_AD) if (t.includes(sp)) rossi.push(`${p.slice(opz.cartella.length + 1)}: resta ${sp}`);
  }
  if (letti === 0) return chiudi("segnaposti", [], ["nessun testo da leggere"], opz);
  return chiudi("segnaposti", rossi, [], opz, { testi: letti });
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
