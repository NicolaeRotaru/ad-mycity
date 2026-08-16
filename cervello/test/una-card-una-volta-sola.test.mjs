#!/usr/bin/env node
// AR-108 — i sensori uptime sono rimasti spenti 163 giri e nessuna card l'ha mai chiesto a Nicola.
//
// Il difetto chiede tre cose: ① la riga di attivazione dove Nicola la legge, ② «una sentinella
// one-shot: sensore non_configurato… → una card 🟡 **una volta sola, mai ripetuta**», ③ la regola di
// processo che ogni sensore nuovo nasca con la sua riga di attivazione.
//
// Il «una volta sola» non è un dettaglio di stile: è la differenza fra una domanda e un rumore. Una
// card che si riaccoda a ogni giro è una card che si impara a saltare — e allora il sensore resta
// spento lo stesso, solo con più righe in coda.
//
// Prova separata da quella di AR-105 di proposito: i due difetti condividono la radice e lo stesso
// modulo, ma una prova sola li chiuderebbe entrambi anche se uno restasse rotto (debolezza ② di
// come-riparo, pagata su AR-254).
//
// Qui si ESEGUE il guardiano su una coda finta e un registro finto.

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/sensori-spenti-check.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

/** Un mondo finto: sensori, motivi, coda. Torna le funzioni per girarci il guardiano sopra. */
function mondo({ sensori, motivi = {}, coda = "# coda finta\n" }) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-sens-"));
  const f = {
    cecita: join(dir, "cecita.json"),
    motivi: join(dir, "motivi.json"),
    coda: join(dir, "coda.md"),
  };
  writeFileSync(f.cecita, JSON.stringify({ sensori }));
  writeFileSync(f.motivi, JSON.stringify({ motivi }));
  writeFileSync(f.coda, coda);
  const env = { ...process.env, SENSORI_CECITA_FILE: f.cecita, SENSORI_MOTIVI_FILE: f.motivi, SENSORI_CODA_FILE: f.coda };
  return {
    gira: (args = []) => {
      const r = spawnSync("node", [GUARDIANO, ...args], { cwd: REPO, encoding: "utf8", env });
      return { rc: r.status ?? 1, out: `${r.stdout || ""}${r.stderr || ""}` };
    },
    coda: () => readFileSync(f.coda, "utf8"),
    pulisci: () => rmSync(dir, { recursive: true, force: true }),
  };
}

prova("il caso che ha rotto: per un sensore spento nessuna card lo chiedeva a Nicola", () => {
  // Il motivo è dichiarato `inerzia` di proposito: qui si prova che una card ESISTE, non come si
  // deduce il motivo — quella è AR-105 e ha la sua prova. Senza questa separazione, rompendo la
  // deduzione diventerebbe rossa anche questa: un fix sano accusato dal difetto accanto.
  const m = mondo({
    sensori: { sito_uptime: { stato: "non_configurato" }, db: { stato: "ok" } },
    motivi: { sito_uptime: { motivo: "inerzia" } },
  });
  try {
    const r = m.gira();
    assert.equal(r.rc, 1, "uno spento senza un perché è un buco, non uno stato");
    assert.match(r.out, /sito_uptime/);
    assert.match(r.out, /senza un perché dichiarato/);
  } finally { m.pulisci(); }
});

prova("dichiarato «decisione», il guardiano tace per sempre", () => {
  const m = mondo({
    sensori: { telegram: { stato: "non_configurato" } },
    motivi: { telegram: { motivo: "decisione", perche: "Nicola non lo usa" } },
  });
  try {
    assert.equal(m.gira().rc, 0, "una scelta di Nicola è uno stato finale, non un problema aperto");
  } finally { m.pulisci(); }
});

prova("la card si accoda UNA volta, e rigirando non se ne accoda un'altra", () => {
  // È la clausola ② e il motivo per cui esiste: una domanda ripetuta a ogni giro è una domanda che
  // si impara a saltare, e allora il sensore resta spento lo stesso — solo con più righe in coda.
  const m = mondo({
    sensori: { sito_uptime: { stato: "non_configurato" } },
    motivi: { sito_uptime: { motivo: "inerzia" } },
  });
  try {
    const primo = m.gira(["--accoda"]);
    assert.equal(primo.rc, 0, "dopo aver chiesto non resta un problema aperto: la palla è di Nicola");
    const dopo1 = m.coda();
    assert.match(dopo1, /<!-- sensori-spenti-senza-motivo -->/, "la card dev'essere stata scritta (ancora)");
    assert.match(dopo1, /^### 🟡 #\d+ — Dimmi se questi occhi/m, "col numero fisso nel titolo (formato 13/8)");
    assert.match(dopo1, /⏳ accodata \d{4}-\d{2}-\d{2}/, "e la data di nascita");
    assert.match(dopo1, /sito_uptime/, "e dire di QUALE sensore parla");

    m.gira(["--accoda"]);
    m.gira(["--accoda"]);
    const dopo3 = m.coda();
    assert.equal((dopo3.match(/^<!-- sensori-spenti-senza-motivo -->$/gm) || []).length, 1, "tre giri, una card sola");
  } finally { m.pulisci(); }
});

prova("un registro che vanta una card inesistente NON passa", () => {
  // La trappola più facile: dichiarare «gliel'ho chiesto» senza averlo chiesto. Sarebbe il silenzio
  // di prima con un'etichetta sopra — e il guardiano lo ha preso addosso a me, la prima volta.
  const m = mondo({
    sensori: { telegram: { stato: "non_configurato" } },
    motivi: { telegram: { motivo: "da-chiedere", card: "#una-card-che-non-esiste" } },
  });
  try {
    const r = m.gira();
    assert.equal(r.rc, 1);
    assert.match(r.out, /non è in coda|la domanda non esiste/);
  } finally { m.pulisci(); }
});

prova("con la card DAVVERO in coda, e col sensore NOMINATO dentro, il guardiano tace", () => {
  const m = mondo({
    sensori: { telegram: { stato: "non_configurato" } },
    motivi: { telegram: { motivo: "da-chiedere", card: "#chiesto-sul-serio" } },
    coda: "# coda\n\n<!-- chiesto-sul-serio -->\n\n### 🟡 #7 — Vuoi acceso `telegram`?\n",
  });
  try {
    assert.equal(m.gira().rc, 0);
  } finally { m.pulisci(); }
});

prova("una card che esiste ma NON nomina il sensore non è una domanda", () => {
  // Il 16/8: la card #66 era in coda dal 10/8 e chiedeva di `telegram_bot`; intanto si era spento
  // anche `mcp_supabase`. Bastava puntare quella card per dichiararlo «glielo stiamo chiedendo» —
  // ma il suo nome lì dentro non c'era. Una domanda che nessuno può leggere è silenzio con
  // un'etichetta sopra, ed è esattamente la cosa che questo guardiano esiste per impedire.
  const m = mondo({
    sensori: { telegram: { stato: "non_configurato" }, supabase: { stato: "non_configurato" } },
    motivi: {
      telegram: { motivo: "da-chiedere", card: "#chiesto-sul-serio" },
      supabase: { motivo: "da-chiedere", card: "#chiesto-sul-serio" },
    },
    coda: "# coda\n\n<!-- chiesto-sul-serio -->\n\n### 🟡 #7 — Vuoi acceso `telegram`?\n",
  });
  try {
    const r = m.gira();
    assert.equal(r.rc, 1, "il sensore non nominato deve restare un buco");
    assert.match(r.out, /supabase/);
    assert.doesNotMatch(r.out.split("spenti senza un perché")[1] || "", /telegram/, "quello nominato invece è a posto");
  } finally { m.pulisci(); }
});

prova("la card che c'è già viene RINFRESCATA, non lasciata a metà verità", () => {
  // «Una card sola» non vuol dire «una card ferma»: se si spegne un secondo sensore, la stessa card
  // deve nominarlo. Prima di questo fix si usciva subito e il guardiano restava rosso per sempre.
  // Il mondo del 16/8 in piccolo: la card c'è e nomina `telegram`; `supabase` si è spento dopo ed
  // è già dichiarato «glielo stiamo chiedendo» su QUELLA card — dove però non compare.
  const m = mondo({
    sensori: { telegram: { stato: "non_configurato" }, supabase: { stato: "non_configurato" } },
    motivi: {
      telegram: { motivo: "da-chiedere", card: "#sensori-spenti-senza-motivo" },
      supabase: { motivo: "da-chiedere", card: "#sensori-spenti-senza-motivo" },
    },
    coda: "# coda\n\n<!-- sensori-spenti-senza-motivo -->\n\n### 🟡 #7 — Dimmi se questi occhi della macchina li vuoi accesi o no · ⏳ accodata 2026-08-10 12:16\n\n**Cosa cambia:** ci sono strumenti già costruiti che non stanno guardando niente: `telegram`. Non sono rotti.\n",
  });
  try {
    assert.equal(m.gira().rc, 1, "prima del refresh la domanda su supabase non esiste");
    m.gira(["--accoda"]);
    const coda = m.coda();
    assert.equal((coda.match(/^<!-- sensori-spenti-senza-motivo -->$/gm) || []).length, 1, "sempre una card sola");
    assert.match(coda, /telegram/, "chi era già in attesa non sparisce dalla domanda");
    assert.match(coda, /supabase/, "e chi si è spento dopo ci entra");
    assert.equal(m.gira().rc, 0, "nominati tutti e due, il guardiano tace");
  } finally { m.pulisci(); }
});

prova("file mancante = CIECO (2), non verde", () => {
  const r = spawnSync("node", [GUARDIANO], {
    cwd: REPO, encoding: "utf8",
    env: { ...process.env, SENSORI_CECITA_FILE: "/tmp/non-esiste-di-sicuro.json" },
  });
  assert.equal(r.status, 2, "senza lo stato dei sensori non so giudicare: non è un verde");
  assert.match(`${r.stdout || ""}${r.stderr || ""}`, /CIECO/);
});

prova("sul mondo VERO il guardiano è verde, e la card è in coda una volta sola", () => {
  const r = spawnSync("node", [GUARDIANO], { cwd: REPO, encoding: "utf8" });
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout || ""}${r.stderr || ""}`);
  const coda = readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md"), "utf8");
  // Dal 13/8 lo slug vive nell'ancora `<!-- … -->` (il titolo porta il numero): si conta quella.
  assert.equal((coda.match(/^<!-- sensori-spenti-senza-motivo -->$/gm) || []).length, 1);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
