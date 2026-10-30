#!/usr/bin/env node
// 📸 LE FOTO DELLE PAGINE VERE DEL SITO, DA UNA SESSIONE CHE IL SITO NON LO PUÒ APRIRE.
//
// PERCHÉ ESISTE. Il 29/10/2026 Nicola ha chiesto di guardare il marketplace «come lo vede il cliente».
// La rete delle sessioni cloud blocca il dominio del sito (mycity-phi.vercel.app risponde 403 al
// proxy), e anche WebFetch lo rifiuta. Il sito però si legge attraverso Vercel: lo strumento
// `web_fetch_vercel_url` restituisce l'HTML di produzione e i fogli di stile. Con quelli, Chromium
// ricostruisce qui la pagina com'è, e la fotografa. Le foto di consegne/design/2026-10-29-foto-pagine/
// sono nate così, con uno script rimasto nella cartella temporanea della sessione: questo è lo stesso
// script, messo in casa perché una sessione nuova possa rifare le foto prima e dopo ogni mossa.
//
// COSA SI VEDE E COSA NO (dillo sempre accanto alle foto):
//   · si vedono l'HTML del server, i colori e i caratteri veri (Inter e Fraunces dal pacchetto pubblico
//     @fontsource, gli stessi file dei font di produzione no: arrivano corrotti attraverso Vercel);
//   · girano solo gli script in linea di React, che inseriscono i pezzi di pagina arrivati in streaming.
//     I pacchetti JavaScript dell'app no: le parti che il browser carica dopo (file di prodotti in home,
//     barra «Aggiungi» che resta in basso, numero sul carrello) restano riquadri di caricamento;
//   · le foto dei prodotti NON si vedono: stanno su Supabase, bloccato anche lui. Al loro posto c'è un
//     riquadro grigio «FOTO (non caricabile da qui)». Le immagini di /public del sito invece sì, lette
//     dalla copia locale del codice.
//
// COME SI USA, in tre passi (da una sessione cloud con lo strumento Vercel collegato):
//   ① per ogni pagina: `web_fetch_vercel_url` su https://mycity-phi.vercel.app/<percorso>. Il risultato,
//      se è grande, finisce in un file `…/tool-results/mcp-Vercel-web_fetch_vercel_url-<n>.txt`. Poi:
//        node cervello/foto-pagine-vere.mjs estrai <file-risultato> <nome> <percorso> --cartella <dir>
//      che scrive <dir>/<nome>.html, <dir>/<nome>.txt (il testo visibile) e aggiorna <dir>/pagine.json.
//   ② una volta sola: lo stesso `web_fetch_vercel_url` sui fogli di stile che l'HTML nomina
//      (/_next/static/css/…css). Il foglio grande va estratto col suo indirizzo:
//        node cervello/foto-pagine-vere.mjs estrai-css <file-risultato> </_next/static/css/….css> --cartella <dir>
//      Il foglio piccolo, quello dei font, non serve: lo ricostruisce questo script.
//   ③ node cervello/foto-pagine-vere.mjs fotografa --cartella <dir> --uscita <dir-foto> [--sito ../mycity]
//      Scarica da npm i due pacchetti di font (la rete delle sessioni lascia passare npm) e scrive
//      <nome>--mobile.png (390×844, prima schermata), <nome>--mobile-intera.png, <nome>--desktop.png
//      (1440×900) e <nome>--desktop-intera.png, più come-sono-state-fatte.txt.
//
// 🟢 Sola lettura sul sito e sul database: legge file locali, scrive solo nella cartella d'uscita.

import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const ORIGINE = "https://mycity-phi.vercel.app";

export const SCATTI = [
  { tag: "mobile", vp: { width: 390, height: 844 }, dsf: 2, intera: false },
  { tag: "mobile-intera", vp: { width: 390, height: 844 }, dsf: 1, intera: true },
  { tag: "desktop", vp: { width: 1440, height: 900 }, dsf: 1, intera: false },
  { tag: "desktop-intera", vp: { width: 1440, height: 900 }, dsf: 1, intera: true },
];

// Le due classi-variabile dei font di produzione (next/font): il foglio originale porta solo queste e
// le @font-face, e le @font-face puntano a file che da qui arrivano corrotti.
const FONT_VARIABILI = `
.__className_178d9d{font-family:Inter,Inter Fallback}.__variable_178d9d{--font-inter:"Inter","Inter Fallback"}
.__className_253504{font-family:Fraunces,Fraunces Fallback}.__variable_253504{--font-serif:"Fraunces","Fraunces Fallback"}
@font-face{font-family:Inter Fallback;src:local("Arial");ascent-override:90.44%;descent-override:22.52%;line-gap-override:0.00%;size-adjust:107.12%}
@font-face{font-family:Fraunces Fallback;src:local("Times New Roman");ascent-override:84.71%;descent-override:22.09%;line-gap-override:0.00%;size-adjust:115.45%}
@font-face{font-family:Inter;font-style:normal;font-weight:100 900;font-display:block;src:url(/__f/inter.woff2) format("woff2")}
@font-face{font-family:Inter;font-style:normal;font-weight:100 900;font-display:block;src:url(/__f/inter-ext.woff2) format("woff2");unicode-range:u+0100-02ba,u+1e00-1eff,u+20a0-20cf}
@font-face{font-family:Fraunces;font-style:normal;font-weight:400;font-display:block;src:url(/__f/fraunces-400.woff2) format("woff2")}
@font-face{font-family:Fraunces;font-style:normal;font-weight:500 600;font-display:block;src:url(/__f/fraunces-600.woff2) format("woff2")}
@font-face{font-family:Fraunces;font-style:normal;font-weight:700;font-display:block;src:url(/__f/fraunces-700.woff2) format("woff2")}
@font-face{font-family:Fraunces;font-style:normal;font-weight:800 900;font-display:block;src:url(/__f/fraunces-800.woff2) format("woff2")}
@font-face{font-family:Fraunces;font-style:italic;font-weight:400 800;font-display:block;src:url(/__f/fraunces-italic.woff2) format("woff2")}`;

const PACCHETTI_FONT = { inter: "@fontsource-variable/inter@5.1.0", fraunces: "@fontsource/fraunces@5.1.0" };
const FILE_FONT = {
  "inter.woff2": ["inter", "files/inter-latin-wght-normal.woff2"],
  "inter-ext.woff2": ["inter", "files/inter-latin-ext-wght-normal.woff2"],
  "fraunces-400.woff2": ["fraunces", "files/fraunces-latin-400-normal.woff2"],
  "fraunces-600.woff2": ["fraunces", "files/fraunces-latin-600-normal.woff2"],
  "fraunces-700.woff2": ["fraunces", "files/fraunces-latin-700-normal.woff2"],
  "fraunces-800.woff2": ["fraunces", "files/fraunces-latin-800-normal.woff2"],
  "fraunces-italic.woff2": ["fraunces", "files/fraunces-latin-400-italic.woff2"],
};

const TIPI = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", ico: "image/x-icon", json: "application/json" };

/** Il riquadro che prende il posto di una foto che da qui non si scarica. */
export function segnaposto(lato = 400) {
  const f1 = Math.max(10, lato / 9), f2 = Math.max(8, lato / 16);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lato}" height="${lato}" viewBox="0 0 ${lato} ${lato}"><rect width="100%" height="100%" fill="#e7e2da"/><g fill="#9a9184" font-family="Arial" text-anchor="middle"><text x="50%" y="48%" font-size="${f1}">FOTO</text><text x="50%" y="62%" font-size="${f2}">(non caricabile da qui)</text></g></svg>`;
}

/** Il testo visibile di un HTML del server, una riga per pezzo, con le immagini segnate dal loro alt. */
export function testoVisibile(html) {
  let corpo = html.slice(Math.max(0, html.indexOf("<body")));
  corpo = corpo.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
  corpo = corpo.replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, "\n[IMMAGINE: $1]\n").replace(/<[^>]+>/g, "\n");
  const ent = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " " };
  corpo = corpo.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (m) => ent[m] ?? m);
  return corpo.split("\n").map((r) => r.trim()).filter(Boolean).join("\n");
}

/** Il campo `text` del risultato di web_fetch_vercel_url, com'è salvato su disco. */
export function leggiRisultatoVercel(file) {
  const grezzo = readFileSync(file, "utf8");
  const dato = JSON.parse(grezzo);
  if (typeof dato?.text !== "string") throw new Error(`${file}: non è un risultato di web_fetch_vercel_url (manca il campo text)`);
  return { testo: dato.text, stato: dato.status };
}

export function estrai(fileRisultato, nome, percorso, cartella, quando) {
  const { testo, stato } = leggiRisultatoVercel(fileRisultato);
  mkdirSync(cartella, { recursive: true });
  writeFileSync(join(cartella, `${nome}.html`), testo);
  const titolo = (/<title>(.*?)<\/title>/.exec(testo) || [])[1] || "";
  writeFileSync(
    join(cartella, `${nome}.txt`),
    `PAGINA DI PRODUZIONE ${ORIGINE}${percorso} (stato HTTP ${stato}, letta ${quando} via Vercel, solo HTML lato server: ` +
      `le sezioni caricate dal browser col JavaScript compaiono come 'caricamento')\nTITOLO: ${titolo}\n\n${testoVisibile(testo)}\n`,
  );
  const elenco = join(cartella, "pagine.json");
  const pagine = existsSync(elenco) ? JSON.parse(readFileSync(elenco, "utf8")) : {};
  pagine[nome] = percorso;
  writeFileSync(elenco, JSON.stringify(pagine, null, 2) + "\n");
  const fogli = [...new Set([...testo.matchAll(/href="(\/_next\/static\/css\/[^"?]+)/g)].map((m) => m[1]))];
  return { nome, stato, fogli };
}

/** Salva il foglio di stile grande e ricorda il suo indirizzo: gli altri fogli sono quello dei font. */
export function estraiCss(fileRisultato, percorsoCss, cartella) {
  const { testo } = leggiRisultatoVercel(fileRisultato);
  mkdirSync(cartella, { recursive: true });
  writeFileSync(join(cartella, "main.css"), testo);
  writeFileSync(join(cartella, "fogli.json"), JSON.stringify({ principale: percorsoCss.split("?")[0] }, null, 2) + "\n");
  return testo.length;
}

/** Scarica i due pacchetti di font da npm in <cartella>/font e torna dove stanno. */
export function preparaFont(cartella) {
  const dir = join(cartella, "font");
  mkdirSync(dir, { recursive: true });
  const dove = {};
  for (const [chiave, pacchetto] of Object.entries(PACCHETTI_FONT)) {
    const finale = join(dir, chiave);
    if (!existsSync(finale)) {
      const tgz = execFileSync("npm", ["pack", pacchetto, "--silent"], { cwd: dir, encoding: "utf8" }).trim().split("\n").pop();
      mkdirSync(finale, { recursive: true });
      execFileSync("tar", ["xzf", tgz, "-C", finale, "--strip-components=1"], { cwd: dir });
    }
    dove[chiave] = finale;
  }
  return dove;
}

export async function fotografa({ cartella, uscita, sito }) {
  const pagine = JSON.parse(readFileSync(join(cartella, "pagine.json"), "utf8"));
  const cssPrincipale = readFileSync(join(cartella, "main.css"), "utf8");
  const { principale } = JSON.parse(readFileSync(join(cartella, "fogli.json"), "utf8"));
  const font = preparaFont(cartella);
  const pubblica = sito ? join(sito, "public") : null;
  const { chromium } = createRequire(import.meta.url)("playwright");
  mkdirSync(uscita, { recursive: true });
  const registro = [];
  const browser = await chromium.launch();
  try {
    for (const [nome, percorso] of Object.entries(pagine)) {
      const html = readFileSync(join(cartella, `${nome}.html`), "utf8");
      for (const s of SCATTI) {
        const telefono = s.tag.startsWith("mobile");
        const ctx = await browser.newContext({ viewport: s.vp, deviceScaleFactor: s.dsf, javaScriptEnabled: true, locale: "it-IT", isMobile: telefono, hasTouch: telefono });
        const pagina = await ctx.newPage();
        let sostituite = 0;
        const cssMancanti = new Set();
        await pagina.route("**/*", async (route) => {
          const u = new URL(route.request().url());
          const tipo = route.request().resourceType();
          if (u.origin === ORIGINE && u.pathname + u.search === percorso && tipo === "document") {
            return route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: html });
          }
          if (u.pathname.startsWith("/_next/static/css/")) {
            // Il foglio grande è quello salvato; ogni altro foglio di produzione è quello dei font.
            return route.fulfill({ contentType: "text/css", body: u.pathname === principale ? cssPrincipale : FONT_VARIABILI });
          }
          if (u.pathname.startsWith("/__f/")) {
            const [chiave, rel] = FILE_FONT[u.pathname.slice(5)] || [];
            if (chiave) return route.fulfill({ contentType: "font/woff2", body: readFileSync(join(font[chiave], rel)) });
          }
          if (pubblica && u.origin === ORIGINE) {
            const f = join(pubblica, decodeURIComponent(u.pathname));
            if (f.startsWith(pubblica) && existsSync(f) && statSync(f).isFile()) {
              return route.fulfill({ contentType: TIPI[extname(f).slice(1)] || "application/octet-stream", body: readFileSync(f) });
            }
          }
          if (tipo === "image") {
            sostituite += 1;
            return route.fulfill({ contentType: "image/svg+xml", body: segnaposto(Number(u.searchParams.get("w")) || 400) });
          }
          if (tipo === "stylesheet") cssMancanti.add(u.pathname);
          return route.abort();
        });
        await pagina.goto(ORIGINE + percorso, { waitUntil: "load" }).catch((e) => registro.push(`${nome} ${s.tag} errore: ${e.message}`));
        // Se i caratteri non sono pronti la foto esce coi caratteri di riserva: si scrive, non si tace.
        await pagina.evaluate(() => document.fonts && document.fonts.ready).catch((e) => registro.push(`${nome} ${s.tag} caratteri non pronti: ${e.message}`));
        await pagina.waitForTimeout(300);
        const altezza = await pagina.evaluate(() => document.documentElement.scrollHeight);
        const file = join(uscita, `${nome}--${s.tag}.png`);
        await pagina.screenshot({ path: file, fullPage: s.intera, clip: s.intera && altezza > 7000 ? { x: 0, y: 0, width: s.vp.width, height: 7000 } : undefined });
        registro.push(`${nome} ${s.tag} altezza=${altezza}px foto-sostituite=${sostituite}${cssMancanti.size ? " css-mancanti=" + [...cssMancanti].join(",") : ""}`);
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
  writeFileSync(
    join(uscita, "come-sono-state-fatte.txt"),
    "Fotografie delle pagine vere di MyCity, fatte con cervello/foto-pagine-vere.mjs.\n" +
      "Come sono fatte: l'HTML e il CSS di produzione letti attraverso Vercel (la rete della sessione blocca il dominio), aperti in Chromium con i soli script in linea di React e senza i pacchetti JavaScript dell'app; font veri (Inter e Fraunces dal pacchetto pubblico).\n" +
      "Limiti: le foto dei prodotti non si scaricano da qui (riquadro grigio «FOTO»); le parti caricate dal browser dopo (file di prodotti, barra «Aggiungi», numero sul carrello) compaiono come riquadri di caricamento.\n" +
      "Nomi: <pagina>--mobile.png = prima schermata del telefono 390x844; --desktop.png = prima schermata del computer 1440x900; --mobile-intera.png = pagina intera.\n\nRegistro della fotografia:\n" +
      registro.join("\n") + "\n",
  );
  return registro;
}

function opzione(argv, nome) {
  const i = argv.indexOf(nome);
  return i >= 0 ? argv[i + 1] : undefined;
}

async function main(argv) {
  const [comando, ...resto] = argv;
  const cartella = resolve(opzione(resto, "--cartella") || ".");
  if (comando === "estrai") {
    const [file, nome, percorso] = resto;
    if (!file || !nome || !percorso) throw new Error("uso: estrai <file-risultato> <nome> <percorso> --cartella <dir>");
    const quando = opzione(resto, "--quando") || new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
    const r = estrai(file, nome, percorso, cartella, quando);
    console.log(`✅ ${r.nome}: HTTP ${r.stato}, fogli di stile nominati: ${r.fogli.join(", ") || "nessuno"}`);
    return 0;
  }
  if (comando === "estrai-css") {
    const [file, percorsoCss] = resto;
    if (!file || !percorsoCss?.startsWith("/_next/static/css/")) {
      throw new Error("uso: estrai-css <file-risultato> </_next/static/css/….css> --cartella <dir>");
    }
    console.log(`✅ main.css: ${estraiCss(file, percorsoCss, cartella)} caratteri`);
    return 0;
  }
  if (comando === "fotografa") {
    const uscita = resolve(opzione(resto, "--uscita") || join(cartella, "foto"));
    const sito = opzione(resto, "--sito");
    const registro = await fotografa({ cartella, uscita, sito: sito ? resolve(sito) : null });
    console.log(registro.join("\n"));
    // Una pagina che non si è caricata dà comunque una foto (bianca): non è un verde.
    const errori = registro.filter((r) => r.includes(" errore: "));
    if (errori.length) {
      console.log(`❌ ${errori.length} scatti su pagine che non si sono caricate: quelle foto non valgono`);
      return 1;
    }
    console.log(`✅ ${registro.length} foto in ${uscita}`);
    return 0;
  }
  console.log("uso: node cervello/foto-pagine-vere.mjs estrai|estrai-css|fotografa … (vedi il commento in testa al file)");
  return comando ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(
    (codice) => process.exit(codice),
    (e) => {
      console.error(`❌ ${e.message}`);
      process.exit(1);
    },
  );
}
