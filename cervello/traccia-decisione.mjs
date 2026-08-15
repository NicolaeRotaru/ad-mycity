// AR-209 — QUANDO L'AUTOPILOTA PUBBLICA DAVVERO NON RESTAVA NIENTE NEL REGISTRO DELLE DECISIONI.
//
// `esegui-azione.mjs` scrive una riga in DECISIONI.md a ogni invio reale (AR-078). L'autopilota,
// che è l'altro esecutore, non scriveva niente: era nato come simulatore a secco, dove non c'era
// nulla da tracciare, e quando ha imparato a pubblicare nessuno ha adeguato la traccia — perché la
// funzione che la scrive viveva DENTRO l'altro esecutore.
//
// Due esecutori, una sola catena di custodia. La funzione che scrive la riga sta qui, in un pezzo
// condiviso, e la domanda «ogni pubblicazione vera ha lasciato la sua traccia?» diventa una
// funzione che si può eseguire (`riscontroTracce`) invece di un'abitudine di chi scrive il codice.
//
// Il formato è quello di AR-078, riga per riga: DECISIONI.md è append-only e chi legge la storia
// non deve accorgersi di quale dei due esecutori l'ha scritta.

/** Il timbro «AAAA-MM-GG HH:MM» dell'ora locale, com'è scritto in tutta la memoria. */
export function timbroMinuto(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * La riga da appendere a DECISIONI.md per un atto reale.
 * @param {{quando?:string, colore?:string, chi:string, cosa:string, azioneId?:string, esito?:string}} x
 */
export function rigaDecisione({ quando = timbroMinuto(), colore = "🟡", chi, cosa, azioneId = "", esito = "" } = {}) {
  const coda = azioneId ? ` · azione coda AZIONI-IN-ATTESA: ${azioneId}` : "";
  return `- ${quando} · ${colore} · [${chi}] · MANO ESEGUITA (LIVE): ${cosa}${coda} · ${esito || "—"}\n`;
}

/**
 * Chi ha pubblicato davvero, secondo il registro dell'autopilota.
 * Una riga conta solo se è andata in LIVE **e** è risultata inviata: una prova a secco non è un
 * atto, e contarla chiederebbe una traccia per qualcosa che non è successo.
 */
export function pubblicazioniReali(righeJsonl) {
  const out = [];
  for (const r of String(righeJsonl || "").split("\n")) {
    const t = r.trim();
    if (!t) continue;
    let v;
    try {
      v = JSON.parse(t);
    } catch {
      continue; // una riga rotta non è una pubblicazione: si salta, ma si conta più sotto
    }
    if (v.live === true && v.stato === "inviato") out.push({ id: v.id, canale: v.canale, ts: v.ts });
  }
  return out;
}

/**
 * Il riscontro: per ogni pubblicazione reale deve esistere la sua riga in DECISIONI.md.
 *
 * È il pezzo (c) del fix, e il motivo per cui il difetto era invisibile: nessun guardiano
 * verificava che a un atto corrispondesse una traccia. Un buco nella catena di custodia non si
 * vede guardando l'atto — si vede solo confrontando le due liste.
 *
 * @returns {{reali:number, con_traccia:number, senza_traccia:{id:string,ts:string}[], ok:boolean}}
 */
export function riscontroTracce(righeJsonl, decisioniTesto) {
  const reali = pubblicazioniReali(righeJsonl);
  const testo = String(decisioniTesto || "");
  const senza = reali.filter((p) => !p.id || !testo.includes(String(p.id)));
  return { reali: reali.length, con_traccia: reali.length - senza.length, senza_traccia: senza, ok: senza.length === 0 };
}

/**
 * La riga di storico da aggiungere a una voce del calendario.
 *
 * Il pezzo (b) del fix: prima l'autopilota SOVRASCRIVEVA lo stato della voce, e la storia di cosa
 * era successo spariva. Lo stato deve cambiare (altrimenti la voce si ripubblica), ma la riga
 * vecchia non si cancella: le si aggiunge accanto una riga di storico. È la regola della memoria —
 * «non riscrivere mai le righe vecchie» — applicata dove serve di più.
 */
export function conStorico(voce = {}, { quando, statoPrima, esito }) {
  const storico = Array.isArray(voce.storico) ? voce.storico : [];
  return [...storico, { quando, da: statoPrima ?? voce.stato ?? "", a: "pubblicato", esito: esito || "inviato" }];
}

// ─────────────────────────────────────────────────────────────────────────────
// Il guardiano di riscontro (pezzo (c) del fix). Gira da solo: senza di lui `riscontroTracce`
// sarebbe una funzione che nessuno chiama, cioè una difesa che somiglia a una difesa.
//
//   node cervello/traccia-decisione.mjs --riscontro
// Exit: 0 = ogni atto ha la sua traccia · 1 = almeno un atto senza traccia · 2 = non misurabile

if (import.meta.url === `file://${process.argv[1]}` && process.argv.includes("--riscontro")) {
  const { existsSync, readFileSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const QUI = dirname(fileURLToPath(import.meta.url));
  const LOG = process.env.AUTOPILOT_LOG_FILE || join(QUI, "..", "creativi", "output", "autopilot-log.jsonl");
  const DEC = process.env.AUTOPILOT_DECISIONI || join(QUI, "..", "MyCity-Vault/90-Memoria-AI/DECISIONI.md");
  if (!existsSync(LOG)) {
    console.log("⚪ nessun registro dell'autopilota da confrontare: non ho potuto misurare (cieco, non verde).");
    process.exit(2);
  }
  if (!existsSync(DEC)) {
    console.error("❌ il registro delle decisioni non esiste: qualunque atto reale è senza traccia.");
    process.exit(1);
  }
  const r = riscontroTracce(readFileSync(LOG, "utf8"), readFileSync(DEC, "utf8"));
  if (r.ok) {
    console.log(`✅ ${r.reali} pubblicazioni reali, ${r.con_traccia} con la loro riga in DECISIONI.md.`);
    process.exit(0);
  }
  console.error(`❌ ${r.senza_traccia.length} pubblicazioni reali senza traccia nel registro delle decisioni:`);
  for (const p of r.senza_traccia) console.error(`   · ${p.id} (${p.ts})`);
  process.exit(1);
}
