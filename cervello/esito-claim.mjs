#!/usr/bin/env node
// 🪪 LA PRESA IN CARICO DI UN LAVORO — e cosa fare quando la conferma si perde per strada (AR-626).
//
// ─────────────────────────────────────────────────────────────────────────────
// IL FATTO
// ─────────────────────────────────────────────────────────────────────────────
// Il worker prende un lavoro con una PATCH compare-and-set: «passa a in_corso SOLO se sei ancora
// in_attesa», e con `Prefer: return=representation` la risposta contiene la riga se l'ha vinta lui.
// Risposta vuota = l'ha presa qualcun altro → si salta. Giusto, e serve: senza, due worker
// eseguivano lo stesso lavoro due volte (doppio invio reale con le azioni accese).
//
// Ma «risposta vuota» e «risposta mai arrivata» finivano nello stesso ramo. Se la PATCH va a segno
// sul server e la RISPOSTA si perde — rete che cade, timeout, proxy — il lavoro resta segnato
// `in_corso` nel database e il worker se ne va convinto di averlo perso. Nessuno lo esegue. Lo
// ripesca il recupero orfani dopo `SOGLIA_ORFANO_MIN`, che vale 60: **un'ora ferma**, e in chat
// Nicola vede una domanda che non risponde nessuno.
//
// È la stessa forma di errore che il kill-switch ha già curato dall'altra parte: esistevano due
// risposte dove ce ne volevano tre. «Non ho letto» non è «no».
//
// ─────────────────────────────────────────────────────────────────────────────
// LA CURA, e perché è sicura
// ─────────────────────────────────────────────────────────────────────────────
// Quando la risposta non arriva non si tira a indovinare e non si procede alla cieca: si RILEGGE la
// riga e si guarda se porta il nostro timbro. Due segni, ognuno sufficiente:
//   · `worker_owner` uguale al nostro identificativo (quando il database ha la colonna);
//   · `updated_at` uguale, allo stesso istante, a quello che abbiamo appena scritto noi — un valore
//     che conosciamo perché l'abbiamo generato, e che nessun altro può avere scritto per caso.
// Il confronto è sull'ISTANTE, non sul testo: PostgREST rende la data nel suo fuso, quindi
// `2026-08-15T10:00:00+02:00` e `2026-08-15T08:00:00Z` sono la stessa cosa e due stringhe diverse.
//
// In tutti gli altri casi si salta, come prima. Se la riga è tornata `in_attesa` la PATCH non è
// passata: il giro dopo la ripesca in pochi secondi, non in un'ora.
//
// 🟢 Modulo PURO: nessuna rete, nessun file, nessun orologio.
//
// Prova comportamentale: node cervello/test/presa-in-carico-senza-risposta.test.mjs

/**
 * Legge il corpo tornato da PostgREST, comunque arrivi: array, oggetto singolo, testo o niente.
 *
 * Torna DUE cose separate, e la separazione è il punto: `capito` dice se quella risposta l'abbiamo
 * saputa leggere, `riga` dice cosa c'era dentro. Un `[]` è una risposta capita benissimo che dice
 * «non l'hai presa»; una risposta a metà o un HTML di errore non è nessuna delle due, e confonderla
 * con `[]` sarebbe il difetto di partenza spostato di un piano.
 */
function leggiCorpo(corpo) {
  if (corpo == null) return { capito: false, riga: null };
  let d = corpo;
  if (typeof d === "string") {
    const t = d.trim();
    if (!t) return { capito: false, riga: null };
    try {
      d = JSON.parse(t);
    } catch {
      return { capito: false, riga: null };
    }
  }
  if (Array.isArray(d)) return { capito: true, riga: d.length ? d[0] : null };
  if (d && typeof d === "object") return { capito: true, riga: d };
  return { capito: false, riga: null };
}

/** La riga, quando c'è. */
const primaRiga = (corpo) => leggiCorpo(corpo).riga;

/** Due timbri sono lo stesso istante? (il fuso lo mette chi risponde, non chi ha scritto) */
export function stessoIstante(a, b) {
  const ta = Date.parse(String(a ?? ""));
  const tb = Date.parse(String(b ?? ""));
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return false;
  return ta === tb;
}

/**
 * LA PRIMA DECISIONE: la PATCH di presa in carico com'è andata?
 *
 *   "procedi"  → la riga è tornata: il lavoro è nostro, si esegue
 *   "salta"    → il server ha risposto «non l'hai presa tu»: è di un altro, si lascia stare
 *   "verifica" → la risposta non è arrivata o non si legge: NON si sa, e va chiesto al database
 *
 * Il terzo valore è tutto il difetto: prima non esisteva, e finiva dentro «salta».
 */
export function decidiClaim({ rc = 0, corpo = "" } = {}) {
  const { capito, riga } = leggiCorpo(corpo);
  if (riga && riga.id) return { azione: "procedi", motivo: "la riga è tornata: la presa in carico è nostra" };
  const rcNum = Number(rc);
  if (!Number.isFinite(rcNum) || rcNum !== 0) {
    return { azione: "verifica", motivo: `la chiamata di presa in carico non è arrivata a destinazione (rc=${rc}): non so se è passata` };
  }
  if (!capito) {
    return { azione: "verifica", motivo: "il server ha risposto qualcosa che non so leggere: non lo conto come «non l'hai presa»" };
  }
  return { azione: "salta", motivo: "risposta vuota dal server: il lavoro l'ha preso qualcun altro" };
}

/**
 * LA SECONDA DECISIONE: rileggendo la riga, quella presa in carico era nostra?
 *
 * `timbro` è l'`updated_at` che ABBIAMO scritto noi nella PATCH. È l'unica cosa che distingue «l'ho
 * presa io e non me l'hanno detto» da «l'ha presa un altro»: senza, l'unica scelta prudente sarebbe
 * aspettare l'ora del recupero orfani.
 */
export function esitoRilettura({ corpo = "", ioSono = "", timbro = "" } = {}) {
  const riga = primaRiga(corpo);
  if (!riga) return { azione: "salta", motivo: "non ho potuto rileggere la riga: aspetto, non tiro a indovinare" };
  const stato = String(riga.stato ?? "");
  if (stato === "in_attesa") {
    return { azione: "salta", motivo: "la riga è ancora in attesa: la presa in carico NON è passata, la ripesco al prossimo giro" };
  }
  if (stato !== "in_corso") {
    return { azione: "salta", motivo: `la riga è in stato «${stato || "?"}»: non è un lavoro da prendere` };
  }
  const owner = String(riga.worker_owner ?? "");
  if (ioSono && owner && owner === ioSono) {
    return { azione: "procedi", motivo: "la riga porta il nostro nome: la presa in carico era passata, si era persa solo la risposta" };
  }
  if (owner && ioSono && owner !== ioSono) {
    return { azione: "salta", motivo: `la riga è di un altro worker (${owner}): giù le mani` };
  }
  if (timbro && stessoIstante(riga.updated_at, timbro)) {
    return { azione: "procedi", motivo: "la riga porta il timbro che abbiamo appena scritto noi: la presa in carico era passata" };
  }
  return { azione: "salta", motivo: "la riga è in corso ma non porta né il nostro nome né il nostro timbro: non è nostra" };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI — così il worker chiede invece di decidere. Il corpo arriva su stdin, la risposta è UNA
// parola su stdout (il chiamante la cattura) e il motivo su stderr.
//   node cervello/esito-claim.mjs decidi   --rc=0
//   node cervello/esito-claim.mjs rileggi  --io=worker-1 --timbro=2026-08-15T10:00:00+02:00
// ─────────────────────────────────────────────────────────────────────────────
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const arg = (nome, def = "") => {
    const t = process.argv.find((a) => a.startsWith(`--${nome}=`));
    return t ? t.slice(nome.length + 3) : def;
  };
  const cmd = process.argv[2] || "";
  if (cmd !== "decidi" && cmd !== "rileggi") {
    process.stderr.write("Uso: esito-claim.mjs {decidi --rc=N | rileggi --io=… --timbro=…}   (il corpo arriva su stdin)\n");
    process.exit(64);
  }
  let corpo = "";
  process.stdin.setEncoding("utf8");
  for await (const pezzo of process.stdin) corpo += pezzo;
  const r =
    cmd === "decidi"
      ? decidiClaim({ rc: arg("rc", "0"), corpo })
      : esitoRilettura({ corpo, ioSono: arg("io"), timbro: arg("timbro") });
  process.stdout.write(`${r.azione}\n`);
  process.stderr.write(`${r.motivo}\n`);
}
