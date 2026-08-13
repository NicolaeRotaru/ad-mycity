#!/usr/bin/env node
// AR-648 — I REGISTRI DEL CERVELLO TIMBRANO CON L'ORA DI PIACENZA. Provato ESEGUENDOLI.
//
// Quindici punti in tredici script scrivevano `new Date().toISOString().slice(0,16)`: la forma
// giusta («AAAA-MM-GG HH:MM») con dentro l'ora di Greenwich. Alle 23:54 di Piacenza il referto
// diceva 21:54, e il Pannello lo mostrava come ora di casa perché è indistinguibile da un timbro
// vero. Non c'era modo di accorgersene guardando il file: bisogna guardare l'orologio.
//
// Questa prova fa esattamente quello. Esegue gli script VERI e confronta il timbro che scrivono
// con l'ora di Piacenza di adesso. E siccome Roma non è MAI su UTC — d'inverno +1, d'estate +2 —
// il confronto è sempre discriminante: se un giorno tornasse `toISOString()`, questo file diventa
// rosso lo stesso giorno, in qualunque stagione e su qualunque server.
//
// Gira due volte, TZ=UTC (il VPS) e TZ=Europe/Rome (il portatile): il timbro dev'essere lo stesso.
//
// ONESTÀ SULLA COPERTURA — 2 script su 13 sono eseguiti qui. Gli altri undici non si possono far
// girare dentro un test senza conseguenze: scrivono nel vault senza un modo per reindirizzarli
// (pota-apprendimento, pota-memoria, foto-radiografia, rapporto-radiografia, si-capisce,
// materiale-in-mano, correzione-nicola-gate), oppure chiamano un modello AI (prova-trigger), o
// escono ciechi in questo ambiente (conta-verdetti-muti). conta-blocco-mancante.mjs è escluso per
// un motivo trovato con le mani in pasta: riscrive il suo referto nel vault ANCHE con --json, e un
// test che sporca la memoria è peggio del difetto che prova (vedi difetti_nuovi del rapporto). E peso-file-cabina.mjs non è nemmeno
// riparato: il suo test lo copia da solo in una cartella temporanea, dove un import non si
// risolve — il perché sta scritto in quel file, con le due righe che servono a chiuderlo.
// Per i nove riparati ma non eseguiti qui la garanzia è indiretta: chiamano la stessa `timbroOra`
// che ora-di-piacenza.test.mjs prova a gennaio, a luglio e nei due fusi. Va detto, non nascosto:
// una copertura dichiarata a metà è una misura, una copertura finta è un difetto nuovo.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { timbroOra } from "../ora-piacenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const REPO = join(CERVELLO, "..");
const FORMA = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// Una sabbiera per gli script che sanno accettare i loro file da fuori: così la prova non
// dipende da com'è messo il vault adesso (e non lo tocca nemmeno in lettura).
const sabbia = mkdtempSync(join(tmpdir(), "registri-ora-"));
const scrivi = (nome, testo) => {
  const p = join(sabbia, nome);
  writeFileSync(p, testo);
  return p;
};
const cecitaFinta = scrivi("sensori-cecita.json", JSON.stringify({ sensori: { uno: { stato: "ok" } } }));
const motiviFinti = scrivi("sensori-motivi.json", JSON.stringify({ uno: { motivo: "decisione", nota: "finto" } }));
const codaFinta = scrivi("coda.md", "# Coda finta\n");
// `fatti` è un ARRAY (forma vera del registro): con un oggetto pausa-check muore su
// `fatti.map is not a function` invece di dichiararsi cieco — vedi difetti_nuovi del rapporto.
const registroFinto = scrivi("registro-fatti.json", JSON.stringify({ versione: 1, fatti: [] }));

// I registri che si possono eseguire senza scrivere niente: il comando, e in quale campo
// del loro JSON finisce l'ora.
const REGISTRI = [
  {
    file: "pausa-check.mjs",
    args: ["--json"],
    campo: "quando",
    env: { PAUSA_CODA_FILE: codaFinta, PAUSA_REGISTRO_FILE: registroFinto },
  },
  {
    file: "sensori-spenti-check.mjs",
    args: ["--json"],
    campo: "quando",
    env: { SENSORI_CECITA_FILE: cecitaFinta, SENSORI_MOTIVI_FILE: motiviFinti, SENSORI_CODA_FILE: codaFinta },
  },
];

/** Esegue lo script e restituisce il timbro che ha scritto. Il codice d'uscita non conta: questi
 *  guardiani escono 1 o 2 quando trovano qualcosa, ed è normale — qui si guarda l'orologio. */
function timbroScrittoDa({ file, args, campo, env }, tz) {
  let out = "";
  try {
    out = execFileSync("node", [join(CERVELLO, file), ...args], {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, ...env, TZ: tz },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    out = e.stdout || "";
  }
  const i = out.indexOf("{");
  assert.ok(i >= 0, `${file} non ha stampato JSON: non si può leggere l'ora che scrive`);
  const dati = JSON.parse(out.slice(i));
  const t = dati[campo];
  assert.ok(typeof t === "string", `${file}: campo «${campo}» assente — il referto non dice quando è stato scritto`);
  return t;
}

for (const reg of REGISTRI) {
  for (const tz of ["UTC", "Europe/Rome"]) {
    prova(`${reg.file} (TZ=${tz}) scrive l'ora di PIACENZA, non quella di Greenwich`, () => {
      const scritto = timbroScrittoDa(reg, tz);
      assert.match(scritto, FORMA, `formato sbagliato: «${scritto}»`);

      // L'ora di adesso a Piacenza, con un minuto di tolleranza per i due lati del bordo.
      const adesso = Date.now();
      const attesi = [timbroOra(new Date(adesso)), timbroOra(new Date(adesso - 60_000)), timbroOra(new Date(adesso + 60_000))];
      assert.ok(attesi.includes(scritto), `«${scritto}» non è l'ora di Piacenza (attesa ${attesi[0]})`);

      // E il controllo che rende la prova capace di bocciare: il timbro NON dev'essere l'UTC nudo,
      // cioè quello che il difetto scriveva. Roma non è mai su UTC: la differenza c'è sempre.
      const utcNudo = new Date(adesso).toISOString().slice(0, 16).replace("T", " ");
      assert.notEqual(scritto, utcNudo, `${reg.file} sta scrivendo l'ora di Greenwich (${utcNudo})`);
    });
  }
}

prova("i due fusi danno lo stesso timbro: il registro non dipende da dov'è acceso il computer", () => {
  for (const reg of REGISTRI) {
    const a = timbroScrittoDa(reg, "UTC");
    const b = timbroScrittoDa(reg, "Europe/Rome");
    const minutoDopo = timbroOra(new Date(Date.now() + 60_000));
    assert.ok(a === b || b === minutoDopo, `${reg.file}: TZ=UTC dice «${a}» e TZ=Europe/Rome dice «${b}»`);
  }
});

rmSync(sabbia, { recursive: true, force: true });

const rotti = casi.filter((c) => !c.ok);
for (const c of casi) process.stdout.write(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}\n`);
process.stdout.write(`\n${casi.length - rotti.length}/${casi.length} passati · 2 registri su 13 eseguiti davvero (gli altri 11 sono dichiarati sopra)\n`);
process.exit(rotti.length ? 1 : 0);
