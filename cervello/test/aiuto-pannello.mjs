// aiuto-pannello.mjs — AVVIARE IL PANNELLO PER UNA PROVA, E ACCORGERSI SUBITO SE NON PARTE.
//
// LA MALATTIA CHE QUESTO FILE CURA (misurata il 2026-08-21).
// Due prove — `c2-schermo` e `c4-schermo-coda` — avviavano il Pannello con lo stesso identico
// blocco di codice, copiato in tutte e due: `spawn("npm", ["run","dev"], { stdio: "ignore" })`, poi
// un ciclo che per TRE MINUTI chiede all'indirizzo se risponde. Il processo appena nato non lo
// guardava nessuno, e la sua uscita finiva in `ignore`, cioè nel nulla.
//
// In un ambiente senza `pannello/node_modules` quel comando muore dopo mezzo secondo. Le prove non
// se ne accorgevano: continuavano a interrogare per 180 secondi un server già morto, e solo alla
// fine dicevano «il Pannello non risponde» — senza il PERCHÉ, che era stato buttato via all'inizio.
// Due prove, sei minuti di attesa cieca. È il motivo per cui l'intera suite del cervello sfondava
// il suo tetto di 300 secondi e il controllo `cervello.test` risultava 🔧 GUASTO: la macchina aveva
// smesso di poter provare sé stessa, e la causa era un'attesa su un cadavere.
//
// Due malattie del registro, insieme: «errore-ingoiato» (l'uscita del processo buttata) e
// «cadenza-copiata-a-mano» (la stessa procedura in due copie, così una cura ne salta sempre una).
// Per questo la cura sta QUI, in un posto solo, e le due prove la chiamano.
//
// COSA NON CAMBIA, ed è importante: se il Pannello non parte la prova resta ROSSA. La regola scritta
// in cima a `c2-schermo` — «⚠️ Se il Pannello non parte, questo test è ROSSO, non verde con una
// scusa» — vale ancora. Qui cambia solo QUANTO ci mette a dirlo e SE dice perché.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { ambientePannello } from "../ambiente-prova.mjs";

// I server avviati da questo processo. Servono al guinzaglio qui sotto.
const AVVIATI = new Set();

// ─────────────────────────────────────────────────────────────────────────────
// IL GUINZAGLIO — 2026-08-21, il difetto che ha avvelenato tre corse della suite.
//
// Il Pannello si avvia `detached`, così si può ammazzare tutto il suo gruppo di processi in un colpo
// solo. Ma `detached` vuol dire anche: **sopravvive a chi l'ha avviato**. Se la prova viene uccisa
// prima di arrivare al suo `after` — dal tetto di tempo del banco, da un `timeout` in CI, da un
// Ctrl-C — il server resta acceso per sempre, tiene la porta 3939 e NON risponde più.
//
// Da lì in poi ogni corsa successiva trova la porta occupata da un morto che non parla, e le prove
// dello schermo diventano rosse per un motivo che non c'entra niente con quello che dovevano
// provare. Misurato: un `next-server` delle 12:54 ancora vivo alle 15:30 al 117% di CPU, e tre
// corse della suite rosse di fila con «EADDRINUSE».
//
// Qui il server si lega a chi l'ha acceso: quando questo processo finisce — comunque finisca, uscita
// normale o segnale — il gruppo muore con lui. SIGKILL sul processo padre resta l'unico caso che
// nessun guinzaglio può coprire: per quello il banco manda prima SIGTERM e aspetta.
for (const segnale of ["exit", "SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(segnale, () => {
    for (const s of AVVIATI) spegniPannello(s);
    AVVIATI.clear();
  });
}

/** Risponde l'indirizzo? Una domanda sola, con un tetto suo. */
export async function raggiungibile(urlBase, msTetto = 4000) {
  try {
    const r = await fetch(urlBase + "/", { signal: AbortSignal.timeout(msTetto) });
    return r.ok || r.status < 500;
  } catch {
    return false;
  }
}

/**
 * Avvia il Pannello se non risponde già, e aspetta che risponda.
 *
 * Torna `{ server, gia }` — `server` è il processo da spegnere alla fine (null se ne girava già uno).
 * Se il Pannello non arriva, LANCIA un errore che dice il perché vero: il processo è morto (con le
 * sue ultime righe), oppure è vivo ma non ha aperto la porta in tempo. Sono due guasti diversi e
 * portano a due cure diverse — `npm install` contro «è solo lento».
 */
export async function avviaPannello({ radice, porta, urlBase, msTetto = 180000, esisteInPannello }) {
  if (await raggiungibile(urlBase)) return { server: null, gia: true };

  // ⛔ IL FRENO STA QUI, sul dato, non dentro la singola prova (AR-437).
  //
  // Se `pannello/node_modules` non c'è, `npm run dev` esce dopo mezzo secondo con `next: not found`
  // e da lì in poi ogni esito è una bugia: la prova diventa ROSSA per una cecità d'ambiente, cioè
  // manda a cercare un difetto che non esiste — e con un tetto a zero blocca il cancello di tutti.
  // Misurato il 22/8 su `main` pulito: `c2-schermo` e `c4-schermo-coda` rosse, sei casi su sei; con
  // `npm install --prefix pannello` verdi, sei su sei. Non erano rosse, erano cieche.
  //
  // Ogni chiamante passa da qui, quindi nessuno può accendere il Pannello con un ambiente che non
  // sa accenderlo — nemmeno una prova scritta domani che si dimenticasse il controllo a monte.
  // L'errore porta `ambienteNonPronto: true`: è il segno con cui chi chiama distingue ⚪ da ❌.
  const esiste = esisteInPannello || ((f) => existsSync(join(radice, "pannello", f)));
  const amb = ambientePannello(esiste);
  if (!amb.pronto) {
    const err = new Error(
      `non posso accendere il Pannello da qui: ${amb.motivo}.\n` +
        `   Non è un difetto del codice: è uno strumento che manca su questa macchina. Rimedio: ${amb.comando}`,
    );
    err.ambienteNonPronto = true;
    err.caso = amb.caso;
    err.comando = amb.comando;
    throw err;
  }

  // `pipe` e non `ignore`: l'uscita del processo è la diagnosi. Buttarla via è la malattia.
  const server = spawn("npm", ["run", "dev"], {
    cwd: `${radice}/pannello`,
    env: { ...process.env, PORT: String(porta) },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  let morto = null;
  const ultimeRighe = [];
  const raccogli = (b) => {
    for (const r of String(b).split("\n")) if (r.trim()) ultimeRighe.push(r.trim());
    while (ultimeRighe.length > 12) ultimeRighe.shift(); // le ultime bastano, e non allagano il TAP
  };
  AVVIATI.add(server);
  server.stdout?.on("data", raccogli);
  server.stderr?.on("data", raccogli);
  server.on("error", (e) => (morto = `non sono nemmeno riuscita a lanciare «npm run dev»: ${e.message}`));
  server.on("exit", (code, segnale) => {
    morto ||= `«npm run dev» è uscito subito (${segnale ? `segnale ${segnale}` : `codice ${code}`})`;
  });

  const scadenza = Date.now() + msTetto;
  while (Date.now() < scadenza) {
    if (morto) break; // ⬅️ la riga che mancava: non si aspetta un processo che non c'è più
    await new Promise((r) => setTimeout(r, 1000));
    if (await raggiungibile(urlBase)) return { server, gia: false };
  }

  spegniPannello(server);
  const coda = ultimeRighe.length ? `\n   ultime righe del server:\n     ${ultimeRighe.join("\n     ")}` : "";
  const consiglio =
    ultimeRighe.some((r) => /ENOENT|not found|Cannot find module|next: not found/i.test(r)) || morto
      ? `\n   Da qui manca quasi sicuramente «pannello/node_modules»: prova «npm install --prefix pannello».`
      : "";
  throw new Error(
    `il Pannello non risponde su ${urlBase}: non posso guardare, quindi non posso dire che è a posto.\n` +
      `   ${morto || `il processo è ancora vivo ma non ha aperto la porta entro ${Math.round(msTetto / 1000)}s`}${coda}${consiglio}`,
  );
}

/** Spegne il gruppo di processi del Pannello, se ne abbiamo avviato uno noi. */
export function spegniPannello(server) {
  if (!server?.pid) return;
  AVVIATI.delete(server);
  try {
    process.kill(-server.pid);
  } catch {
    try {
      server.kill();
    } catch {
      /* già morto: va bene così */
    }
  }
}
