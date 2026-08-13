// Osservazione a RUNTIME dei NOMI delle caselle nei «Lavori del cervello».
//
// Il difetto (Nicola, 12/8/2026, screenshot): nella lista quattro caselle si chiamavano «analisi»,
// «analisi», «playbook», «playbook». Il nome della specie, non il nome del lavoro.
//
// Perché serve guardarlo nel Pannello VERO e non basta il test di `nome-lavoro`: il nome non si
// ricava dalla lista — il poll è leggero apposta e non porta la `richiesta` (9,8 KB di media a
// riga sulle chat). Il nome lo chiede il browser a /api/lavori/nomi e lo attacca alla riga. È
// quel pezzo di catena che qui si osserva: se il Pannello NON chiedesse i nomi, o non li
// mostrasse, le card resterebbero sul ripiego generico e questa prova diventerebbe rossa.
//
// Le quattro righe finte hanno esattamente la forma del poll leggero (nessuna `richiesta`), e i
// nomi che la finta di /api/lavori/nomi restituisce NON sono ricavabili dalla riga: se compaiono
// a schermo, ci sono arrivati per quella strada e non per caso.
//
// Uso: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node cervello/test/pw-nomi-lavori.mjs [url]
// Exit: 0 = ogni casella ha il suo nome · 1 = almeno una prova rossa
import { createRequire } from "module";
import { mkdirSync } from "fs";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:3939/";
const SC = process.env.SC || "/tmp/pw";
mkdirSync(SC, { recursive: true });

const NOMI = {
  "11111111-1111-4111-8111-111111111111": "🧠 Salute bassa: il voto salute dell'architettura è 45",
  "22222222-2222-4222-8222-222222222222": "💼 Negozio fermo: 1 negozi LIVE con 0 ordini",
  "33333333-3333-4333-8333-333333333333": "🛒 Recupero carrelli abbandonati",
  "44444444-4444-4444-8444-444444444444": "⭐ Caccia recensioni",
};
const ora = "2026-08-12T09:16:00.000Z";
const riga = (id, tipo) => ({
  id,
  created_at: ora,
  updated_at: ora,
  stato: "fatto",
  tipo, // ← come arriva dal poll leggero: niente `richiesta`, niente `risultato`
  esperto: "",
  gruppo_id: null,
});
const LISTA = {
  memoria: true,
  lavori: [
    riga("11111111-1111-4111-8111-111111111111", "analisi"),
    riga("22222222-2222-4222-8222-222222222222", "analisi"),
    riga("33333333-3333-4333-8333-333333333333", "playbook"),
    riga("44444444-4444-4444-8444-444444444444", "playbook"),
  ],
  conteggi: { coda: 0, archivio: 4, per_stato: { in_attesa: 0, in_corso: 0, errore: 0, fatto: 4, annullato: 0 } },
  archivio: { offset: 0, limit: 100, totale: 4, hasMore: false },
};

const b = await chromium.launch({ headless: true });
// Schermo largo: la barra laterale resta aperta e si arriva ai Lavori con un clic, come Nicola.
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errori = [];
let chiesteVolte = 0;
p.on("console", (m) => { if (m.type() === "error") errori.push(m.text()); });
p.on("pageerror", (e) => errori.push("PAGEERROR: " + e.message));

await p.route("**/api/lavori?**", (route) =>
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(LISTA) }),
);
await p.route("**/api/lavori/nomi", async (route) => {
  chiesteVolte++;
  const ids = JSON.parse(route.request().postData() || "{}").ids || [];
  const nomi = {};
  for (const id of ids) if (NOMI[id]) nomi[id] = NOMI[id];
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, nomi }) });
});

await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(3000);
await p.getByRole("button", { name: "Lavori", exact: true }).click();
await p.waitForTimeout(4000); // in dev la prima apertura di un'area si compila al volo
await p.getByRole("button", { name: /Archivio/ }).first().click();
await p.waitForTimeout(4000);

const testo = (await p.textContent("body")) || "";
const esiti = [];
const dice = (nome, ok, extra = "") => esiti.push({ nome, ok, extra });

dice("il Pannello CHIEDE i nomi delle caselle", chiesteVolte > 0, `chiamate: ${chiesteVolte}`);
for (const [id, nome] of Object.entries(NOMI)) {
  // Il confronto è sul pezzo distintivo: la card taglia il testo lungo con line-clamp.
  const pezzo = nome.slice(0, 28);
  dice(`la casella ${id.slice(0, 4)}… si chiama «${pezzo}…»`, testo.includes(pezzo));
}
dice("nessuna casella chiamata col nome della specie", !/>analisi</.test(await p.content()) && !/>playbook</.test(await p.content()));
dice("nessun errore in console", errori.length === 0, errori.slice(0, 3).join(" | "));

await p.screenshot({ path: `${SC}/nomi-lavori.png`, fullPage: false });
const rossi = esiti.filter((e) => !e.ok);
console.log(JSON.stringify({ url, chiesteVolte, esiti, screenshot: `${SC}/nomi-lavori.png` }, null, 1));
console.log(rossi.length === 0 ? "\n✅ Ogni casella ha il suo nome." : `\n❌ ${rossi.length} prove rosse.`);
await b.close();
process.exit(rossi.length === 0 ? 0 : 1);
