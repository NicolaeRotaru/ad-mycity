#!/usr/bin/env node
// 🐉 GOKU — l'orologio e il diario del supervisore delle sessioni.
//
// PERCHÉ ESISTE. Nicola, 24/11/2026 22:12: «crea un qualcosa, che in ogni nuova sessione io ti dico
// "sei: goku", e tu ti metti a controllare/supervisionare/risolvere problemi di tutte le sessioni che
// sono state attive nell'ultima ora e continui a farlo per un'ora e quando stai per scadere mi avvisi».
//
// Il guardare e il riparare li fa la sessione, con la skill `.claude/skills/goku/SKILL.md`: servono gli
// strumenti delle sessioni (list_sessions, get_session, send_message, send_later), che un programma non
// ha. Questo file fa le tre cose meccaniche che una sessione sbaglia facilmente fra un risveglio e
// l'altro (regola ⑬ del manuale: «prima il programma»):
//   ① l'OROLOGIO: quanto manca, quando svegliarsi, quando dare l'avviso, quando chiudere;
//   ② la CATENA dei risvegli: ogni promemoria porta il suo numero di giro, e un promemoria doppio,
//      vecchio o di un turno già fermato si riconosce e non fa niente;
//   ③ il DIARIO: cosa è stato visto e fatto, sessione per sessione, e il resoconto finale.
//
// Lo stato vive in `cervello/_tmp_goku.json` (fuori da git, come tutte le misure di sessione). Se il
// contenitore riparte e il file sparisce, il promemoria porta con sé turno, inizio e scadenza: `giro`
// ricostruisce lo stato da lì e lo dice.
//
// USO
//   node cervello/goku.mjs inizia [--minuti 60] [--ogni 10] [--avviso 10] [--sessione <id>] [--forza]
//   node cervello/goku.mjs giro --turno <T> --giro <N> [--inizio <ISO> --scadenza <ISO> --ogni <M>]
//   node cervello/goku.mjs giro --manuale        (un giro chiesto da Nicola: non tocca la catena)
//   node cervello/goku.mjs segui <id> "<titolo>" [<id> "<titolo>" …]   ·   lascia <id> […]
//   node cervello/goku.mjs nota "<sessione>" "<cosa ho visto>" "<cosa ho fatto>" [risolto|tocca-a-te|in-corso|visto]
//   node cervello/goku.mjs proroga [--minuti 60]
//   node cervello/goku.mjs basta                  (Nicola ferma Goku prima della scadenza)
//   node cervello/goku.mjs fine                   (chiude il turno e scrive il resoconto)
//   node cervello/goku.mjs stato
//
// Per le prove: GOKU_ORA=<ISO> finge l'ora, GOKU_STATO e GOKU_RESOCONTI spostano i file in una
// cartella temporanea (scorciatoia 35: una prova non scrive mai nei file veri).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const MIN = 60_000;

export const FILE_STATO = process.env.GOKU_STATO || join(QUI, "_tmp_goku.json");
export const CARTELLA_RESOCONTI = process.env.GOKU_RESOCONTI || join(REPO, "MyCity-Vault/90-Memoria-AI/goku");
export const PREDEFINITI = Object.freeze({ minuti: 60, ogni: 10, avviso: 10, finestra: 60 });
export const ESITI = Object.freeze(["risolto", "tocca-a-te", "in-corso", "visto"]);

export const adesso = () => (process.env.GOKU_ORA ? new Date(process.env.GOKU_ORA) : new Date());

const fmt = (d, opt) => new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", ...opt }).format(new Date(d));
/** «23:25», ora di Piacenza. */
export const hhmm = (d) => fmt(d, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
/** «2026-11-24 23:25», ora di Piacenza: il formato delle date in memoria. */
export const dataOra = (d) => new Date(d).toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).slice(0, 16);
/** «20261124-232500»: con i secondi, così un `inizia --forza` nello stesso minuto non riusa l'id. */
export const idTurno = (d) =>
  new Date(d).toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).replace(/[-:]/g, "").replace(" ", "-");

const intero = (v, def, min, max) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};

/** Un turno nuovo. L'avviso non supera un terzo del turno: su 15 minuti arriva a 5, non a 10. */
export function nuovoTurno({ ora, minuti, ogni, avviso, sessione } = {}) {
  const t = new Date(ora ?? adesso());
  const durata = intero(minuti, PREDEFINITI.minuti, 10, 480);
  const passo = intero(ogni, PREDEFINITI.ogni, 3, 60);
  const preavviso = Math.min(intero(avviso, PREDEFINITI.avviso, 1, 60), Math.max(1, Math.floor(durata / 3)));
  return {
    versione: 1,
    turno: idTurno(t),
    sessione: sessione || null,
    inizio: t.toISOString(),
    scadenza: new Date(+t + durata * MIN).toISOString(),
    // La finestra NON scorre: parte da un'ora prima dell'inizio e resta lì. Così una sessione ferma ad
    // aspettare un clic di Nicola — che non si aggiorna più — non esce dalla sorveglianza dopo un'ora.
    finestra_da: new Date(+t - PREDEFINITI.finestra * MIN).toISOString(),
    ogni: passo,
    avviso: preavviso,
    giro_atteso: 1,
    giri: 0,
    avvisato: false,
    fermato: false,
    finito: false,
    proroghe: 0,
    seguite: [],
    note: [],
  };
}

/** Il prossimo risveglio: il primo fra «fra un passo», l'ora dell'avviso (se non ancora dato) e la scadenza. */
export function prossimoRisveglio(stato, ora = adesso()) {
  const t = +new Date(ora);
  const scad = +new Date(stato.scadenza);
  const avvisoAlle = scad - stato.avviso * MIN;
  let bersaglio = t + stato.ogni * MIN;
  if (!stato.avvisato && avvisoAlle > t) bersaglio = Math.min(bersaglio, avvisoAlle);
  bersaglio = Math.min(bersaglio, scad);
  const minuti = Math.max(1, Math.ceil((bersaglio - t) / MIN));
  return { minuti, alle: new Date(t + minuti * MIN) };
}

/** Il testo del promemoria: porta tutto quello che serve per ripartire anche se lo stato è perso. */
export function messaggioRisveglio(stato, giro) {
  return (
    `GOKU · giro ${giro} del turno ${stato.turno}. Esegui: node cervello/goku.mjs giro --turno ${stato.turno} ` +
    `--giro ${giro} --inizio ${stato.inizio} --scadenza ${stato.scadenza} --ogni ${stato.ogni} ` +
    `— poi segui la skill goku (il giro).`
  );
}

/** Pura: dato lo stato e il promemoria arrivato, che fase è. */
export function decidiGiro(stato, { turno, giro, ora = adesso(), manuale = false } = {}) {
  if (!stato) return { fase: "ignora", motivo: "non c'è nessun turno di Goku in corso" };
  if (turno && turno !== stato.turno)
    return { fase: "ignora", motivo: `promemoria del turno ${turno}, ma il turno vivo è ${stato.turno}` };
  if (stato.fermato) return { fase: "ignora", motivo: `Nicola ha fermato Goku alle ${hhmm(stato.fermato_alle)}` };
  if (stato.finito) return { fase: "ignora", motivo: `il turno è già chiuso (alle ${hhmm(stato.finito_alle)})` };
  if (!manuale && giro != null && Number(giro) !== stato.giro_atteso)
    return {
      fase: "ignora",
      motivo: `promemoria doppio o vecchio: aspettavo il giro ${stato.giro_atteso}, è arrivato il ${giro}`,
    };
  const rimasti = (+new Date(stato.scadenza) - +new Date(ora)) / MIN;
  if (rimasti <= 1) return { fase: "fine", rimasti };
  // Mezzo minuto di tolleranza: il promemoria arriva al minuto intero, a volte uno dopo.
  if (!stato.avvisato && rimasti <= stato.avviso + 0.5) return { fase: "avviso", rimasti };
  return { fase: "giro", rimasti };
}

export function leggiStato(file = FILE_STATO) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function scriviStato(stato, file = FILE_STATO) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(stato, null, 2) + "\n");
}

/** Lo stato rifatto dal promemoria, quando il file è sparito (contenitore ripartito). */
export function ricostruisci({ turno, giro, inizio, scadenza, ogni }) {
  if (!turno || !inizio || !scadenza) return null;
  const base = nuovoTurno({ ora: inizio, ogni });
  return {
    ...base,
    turno,
    scadenza: new Date(scadenza).toISOString(),
    giro_atteso: Number(giro) || 1,
    ricostruito: true,
  };
}

/** Una voce nel diario. La stessa cosa sulla stessa sessione non si ripete: si aggiorna. */
export function aggiungiNota(stato, { sessione, cosa, fatto, esito = "visto" }, ora = adesso()) {
  if (!ESITI.includes(esito)) throw new Error(`esito «${esito}» sconosciuto: usa ${ESITI.join(", ")}`);
  const chiave = (s) => String(s || "").trim().toLowerCase();
  const quando = new Date(ora).toISOString();
  const gia = stato.note.find((n) => chiave(n.sessione) === chiave(sessione) && chiave(n.cosa) === chiave(cosa));
  if (gia) {
    Object.assign(gia, { fatto: fatto || gia.fatto, esito, ultima: quando, volte: gia.volte + 1 });
    return gia;
  }
  const nota = { sessione, cosa, fatto: fatto || "", esito, prima: quando, ultima: quando, volte: 1 };
  stato.note.push(nota);
  return nota;
}

export function conti(stato) {
  const c = { risolto: 0, "tocca-a-te": 0, "in-corso": 0, visto: 0 };
  for (const n of stato.note) c[n.esito] = (c[n.esito] || 0) + 1;
  return c;
}

const cella = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

/** Il resoconto del turno, coi quattro blocchi. Le targhe (id, path) solo sotto «Dettagli tecnici». */
export function resoconto(stato, ora = adesso()) {
  const c = conti(stato);
  const problemi = c.risolto + c["tocca-a-te"] + c["in-corso"];
  const daTe = stato.note.filter((n) => n.esito === "tocca-a-te");
  const inCorso = stato.note.filter((n) => n.esito === "in-corso");
  const dalle = hhmm(stato.inizio);
  const alle = hhmm(ora);
  const righe = [
    "---",
    "tipo: resoconto-goku",
    `data: ${dataOra(ora)}`,
    `turno: ${stato.turno}`,
    `sessione: ${stato.sessione || "non indicata"}`,
    `dalle: ${dataOra(stato.inizio)}`,
    `alle: ${dataOra(ora)}`,
    `giri: ${stato.giri}`,
    "---",
    "",
    `# Goku, il turno dalle ${dalle} alle ${alle}`,
    "",
    "## In parole semplici",
    `Ho sorvegliato le sessioni attive dalle ${dalle} alle ${alle}, con ${stato.giri} giri.`,
    problemi
      ? `Ho trovato ${problemi} problemi: ${c.risolto} sistemati, ${c["tocca-a-te"]} aspettano te, ${c["in-corso"]} ancora in corso.`
      : "Non ho trovato problemi da sistemare.",
    c.visto ? `In più ho annotato ${c.visto} cose solo da tenere d'occhio.` : "",
    "",
    "## Cosa cambia per te",
    daTe.length
      ? `Ti restano ${daTe.length} cose da fare, scritte qui sotto.`
      : "Niente: quello che ho visto è sistemato, oppure era solo da guardare.",
    "",
    "## Cosa devi fare",
    ...(daTe.length ? daTe.map((n) => `- **${n.sessione}**: ${n.cosa}. ${n.fatto}`.trim()) : ["Niente."]),
    ...(inCorso.length
      ? ["", "Ancora aperte alla chiusura, da riguardare:", ...inCorso.map((n) => `- **${n.sessione}**: ${n.cosa}.`)]
      : []),
    "",
    "## Cosa non ho verificato",
    "Ho guardato quello che gli strumenti dicono di ogni sessione: lo stato, il riassunto dell'ultimo turno, la storia usata, la quota e il costo.",
    "Il lavoro dentro una sessione l'ho riletto solo dove c'era un problema.",
    "Le richieste di unione le ho guardate solo quando una sessione le nominava.",
    "",
    "---",
    "**Dettagli tecnici**",
    "",
    `Turno \`${stato.turno}\`, sessione \`${stato.sessione || "?"}\`, un giro ogni ${stato.ogni} minuti, proroghe ${stato.proroghe}.` +
      (stato.ricostruito ? " Lo stato è stato ricostruito da un promemoria: il diario di prima è perso." : ""),
    "",
  ];
  if (stato.note.length) {
    righe.push("| Sessione | Cosa ho visto | Cosa ho fatto | Esito | Prima volta | Volte |", "|---|---|---|---|---|---|");
    for (const n of stato.note)
      righe.push(
        `| ${cella(n.sessione)} | ${cella(n.cosa)} | ${cella(n.fatto)} | ${n.esito} | ${hhmm(n.prima)} | ${n.volte} |`,
      );
  } else righe.push("Diario vuoto.");
  return righe.filter((r, i, a) => !(r === "" && a[i - 1] === "")).join("\n") + "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// Le uscite: testo corto, una cosa per riga, pronto da copiare negli strumenti.
// ─────────────────────────────────────────────────────────────────────────────

/** I passi del giro. Al primo giro (e a un «guarda adesso») si scorre tutto l'elenco; dopo, la prima pagina e le seguite. */
export function passi(completo) {
  return [
    "passi del giro (skill goku):",
    completo
      ? "  1. list_sessions(mine:true, limit:30) pagina dopo pagina finché c'è has_more: l'elenco è per data di CREAZIONE, non di attività"
      : "  1. list_sessions(mine:true, limit:30) solo la prima pagina (le sessioni nuove), più get_session sulle seguite che lì non ci sono",
    "     tieni updated_at ≥ finestra; fuori te stesso e le archiviate; le nuove → node cervello/goku.mjs segui <id> \"<titolo>\"",
    "  2. per ognuna: status_bucket, needs_action, post_turn_summary; get_session su chi lavora, è bloccata o fallita (storia, quota, costo)",
    "  3. agisci secondo la tabella della skill; ogni cosa notata → node cervello/goku.mjs nota …",
    "  4. a Nicola: una riga se è tutto tranquillo, «Il punto adesso» se c'è da fare",
  ];
}

function stampaGiro(stato, giro, decisione, ora) {
  const scad = new Date(stato.scadenza);
  const out = [`🐉 GOKU · giro ${giro} · turno ${stato.turno}`, `fase: ${decisione.fase}`];
  if (decisione.fase === "ignora") {
    out.push(`motivo: ${decisione.motivo}`, "Non fare niente e non programmare altri risvegli: rispondi con una riga.");
    return out.join("\n");
  }
  const rimasti = Math.max(0, Math.round((+scad - +ora) / MIN));
  out.push(
    `adesso: ${hhmm(ora)} · scade: ${hhmm(scad)} (tra ${rimasti} min) · avviso: ${stato.avvisato ? "già dato" : `alle ${hhmm(+scad - stato.avviso * MIN)}`}`,
    `finestra: sessioni con updated_at ≥ ${stato.finestra_da} (cioè dalle ${hhmm(stato.finestra_da)})`,
  );
  const seguite = stato.seguite || [];
  if (stato.ricostruito) out.push("⚠️ stato ricostruito dal promemoria: il diario e le seguite di prima sono persi: scorri tutto l'elenco.");
  if (seguite.length) out.push(`seguite (${seguite.length}): ${seguite.map((x) => `${x.titolo} = ${x.id}`).join(" · ")}`);
  out.push(...passi(giro <= 1 || decisione.manuale || stato.ricostruito || !seguite.length));
  if (decisione.fase === "avviso")
    out.push(
      `push: Goku scade alle ${hhmm(scad)}, tra ${rimasti} minuti. Scrivi «goku ancora» per un'altra ora.`,
      "di' lo stesso in chat, con quello che resta aperto.",
    );
  if (decisione.fase === "fine") {
    out.push(
      "ultimo giro: fai i passi 1-4, poi `node cervello/goku.mjs fine`. Nessun promemoria nuovo.",
    );
  } else if (decisione.manuale) {
    out.push("giro chiesto a mano: la catena dei promemoria resta com'è, non programmare niente.");
  } else {
    const p = prossimoRisveglio(stato, ora);
    out.push(
      "  5. programma il prossimo risveglio, UNO solo, con questi due valori:",
      `prossimo risveglio → send_later delay_minutes=${p.minuti} (alle ${hhmm(p.alle)})`,
      `messaggio: ${messaggioRisveglio(stato, giro + 1)}`,
    );
  }
  return out.join("\n");
}

/** Il cuore di `giro` e del primo giro di `inizia`: decide, aggiorna lo stato, stampa. */
export function eseguiGiro(stato, { turno, giro, manuale = false, ora = adesso() } = {}) {
  const numero = manuale ? stato?.giro_atteso ?? 0 : Number(giro ?? stato?.giro_atteso);
  const decisione = decidiGiro(stato, { turno, giro: numero, ora, manuale });
  decisione.manuale = manuale;
  if (decisione.fase !== "ignora") {
    stato.giri += 1;
    if (!manuale) stato.giro_atteso = numero + 1;
    if (decisione.fase === "avviso") stato.avvisato = true;
  }
  return { stato, testo: stampaGiro(stato ?? { turno: turno ?? "?" }, numero, decisione, ora), decisione };
}

function chiudi(stato, ora, { fermato = false } = {}) {
  if (fermato) Object.assign(stato, { fermato: true, fermato_alle: new Date(ora).toISOString() });
  Object.assign(stato, { finito: true, finito_alle: new Date(ora).toISOString() });
  const c = conti(stato);
  const out = [`🐉 GOKU · turno ${stato.turno} chiuso alle ${hhmm(ora)}${fermato ? " (fermato da Nicola)" : ""}`];
  if (stato.note.length) {
    mkdirSync(CARTELLA_RESOCONTI, { recursive: true });
    const file = join(CARTELLA_RESOCONTI, `${dataOra(stato.inizio).replace(" ", "-").replace(":", "")}.md`);
    writeFileSync(file, resoconto(stato, ora));
    out.push(`resoconto: ${relative(REPO, file).startsWith("..") ? file : relative(REPO, file)}`);
  } else out.push("resoconto: nessuno, il diario è vuoto (turno tranquillo: niente da scrivere, niente PR).");
  const problemi = c.risolto + c["tocca-a-te"] + c["in-corso"];
  out.push(
    `push: Goku ha finito (${hhmm(stato.inizio)}-${hhmm(ora)}): ${stato.giri} giri, ${problemi} problemi, ` +
      `${c.risolto} sistemati, ${c["tocca-a-te"]} aspettano te.`,
    `titolo: Goku · finito alle ${hhmm(ora)}`,
  );
  return out.join("\n");
}

function argomenti(argv) {
  const pos = [];
  const opz = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) opz[k] = true;
      else {
        opz[k] = v;
        i++;
      }
    } else pos.push(a);
  }
  return { pos, opz };
}

export function main(argv = process.argv.slice(2)) {
  const { pos, opz } = argomenti(argv);
  const comando = pos.shift();
  const ora = adesso();
  let stato = leggiStato();
  const vivo = stato && !stato.finito && !stato.fermato && +new Date(stato.scadenza) > +ora;

  switch (comando) {
    case "inizia": {
      if (vivo && !opz.forza) {
        console.log(
          `C'è già un turno vivo (turno ${stato.turno}) fino alle ${hhmm(stato.scadenza)}.\n` +
            "Per allungarlo: node cervello/goku.mjs proroga · per rifarlo da capo: inizia --forza",
        );
        return 2;
      }
      stato = nuovoTurno({ ora, minuti: opz.minuti, ogni: opz.ogni, avviso: opz.avviso, sessione: opz.sessione });
      const g = eseguiGiro(stato, { turno: stato.turno, giro: 1, ora });
      scriviStato(stato);
      console.log(`titolo: Goku · fino alle ${hhmm(stato.scadenza)}\n${g.testo}`);
      return 0;
    }
    case "giro": {
      // Si ricostruisce solo quando il file manca: un turno chiuso, fermato o diverso resta com'è,
      // e il promemoria che non gli appartiene esce «ignora».
      if (!stato)
        stato = ricostruisci({ turno: opz.turno, giro: opz.giro, inizio: opz.inizio, scadenza: opz.scadenza, ogni: opz.ogni });
      const g = eseguiGiro(stato, { turno: opz.turno, giro: opz.giro, manuale: Boolean(opz.manuale), ora });
      if (g.decisione.fase !== "ignora") scriviStato(stato);
      console.log(g.testo);
      return 0;
    }
    case "nota": {
      if (!stato) return console.log("Non c'è nessun turno di Goku: prima `inizia`."), 1;
      const [sessione, cosa, fatto, esito] = pos;
      if (!sessione || !cosa) return console.log('Uso: nota "<sessione>" "<cosa ho visto>" "<cosa ho fatto>" [esito]'), 1;
      let n;
      try {
        n = aggiungiNota(stato, { sessione, cosa, fatto, esito: esito || "visto" }, ora);
      } catch (e) {
        return console.log(e.message), 1;
      }
      scriviStato(stato);
      console.log(`nota ${n.volte > 1 ? `aggiornata (vista ${n.volte} volte)` : "aggiunta"}: ${n.sessione} · ${n.esito}`);
      return 0;
    }
    case "segui":
    case "lascia": {
      if (!stato) return console.log("Non c'è nessun turno di Goku: prima `inizia`."), 1;
      stato.seguite ||= [];
      if (comando === "lascia") {
        const via = new Set(pos);
        stato.seguite = stato.seguite.filter((x) => !via.has(x.id));
      } else {
        if (!pos.length || pos.length % 2) return console.log('Uso: segui <id> "<titolo>" [<id> "<titolo>" …]'), 1;
        for (let i = 0; i < pos.length; i += 2) {
          const [id, titolo] = [pos[i], pos[i + 1]];
          const gia = stato.seguite.find((x) => x.id === id);
          if (gia) gia.titolo = titolo;
          else stato.seguite.push({ id, titolo });
        }
      }
      scriviStato(stato);
      console.log(`seguite (${stato.seguite.length}): ${stato.seguite.map((x) => x.titolo).join(" · ") || "nessuna"}`);
      return 0;
    }
    case "proroga": {
      if (!stato) return console.log("Non trovo il turno (forse il contenitore è ripartito): riparti con `inizia`."), 1;
      if (stato.fermato) return console.log("Goku è stato fermato: per ripartire usa `inizia`."), 1;
      const minuti = intero(opz.minuti, PREDEFINITI.minuti, 10, 480);
      const riapre = stato.finito || +new Date(stato.scadenza) <= +ora;
      const base = riapre ? +ora : +new Date(stato.scadenza);
      Object.assign(stato, {
        scadenza: new Date(base + minuti * MIN).toISOString(),
        avvisato: false,
        finito: false,
        proroghe: stato.proroghe + 1,
      });
      scriviStato(stato);
      const out = [`titolo: Goku · fino alle ${hhmm(stato.scadenza)}`, `scadenza nuova: ${hhmm(stato.scadenza)} (+${minuti} min)`];
      if (riapre) {
        const p = prossimoRisveglio(stato, ora);
        out.push(
          "il turno era chiuso: la catena riparte da qui.",
          `prossimo risveglio → send_later delay_minutes=${p.minuti} (alle ${hhmm(p.alle)})`,
          `messaggio: ${messaggioRisveglio(stato, stato.giro_atteso)}`,
        );
      } else out.push("il promemoria già programmato resta valido: non programmarne un altro.");
      console.log(out.join("\n"));
      return 0;
    }
    case "basta":
    case "fine": {
      if (!stato) return console.log("Non c'è nessun turno di Goku da chiudere."), 1;
      if (stato.finito) return console.log(`Il turno ${stato.turno} è già chiuso (alle ${hhmm(stato.finito_alle)}).`), 0;
      const testo = chiudi(stato, ora, { fermato: comando === "basta" });
      scriviStato(stato);
      console.log(
        testo +
          (comando === "basta" ? "\nil promemoria già programmato arriverà e non farà niente: lascialo stare." : ""),
      );
      return 0;
    }
    case "stato": {
      if (!stato) return console.log("Nessun turno di Goku."), 0;
      const c = conti(stato);
      console.log(
        [
          `🐉 GOKU · turno ${stato.turno} · ${stato.finito ? "chiuso" : vivo ? "vivo" : "scaduto"}`,
          `dalle ${hhmm(stato.inizio)} alle ${hhmm(stato.scadenza)} · giri fatti ${stato.giri} · prossimo giro atteso ${stato.giro_atteso}`,
          `seguite: ${(stato.seguite || []).length} · diario: ${stato.note.length} voci · ${c.risolto} risolte · ${c["tocca-a-te"]} a Nicola · ${c["in-corso"]} in corso · ${c.visto} viste`,
          ...stato.note.map((n) => `  - ${n.sessione}: ${n.cosa} → ${n.esito}`),
        ].join("\n"),
      );
      return 0;
    }
    default:
      console.log("Comandi: inizia · giro · segui · lascia · nota · proroga · basta · fine · stato (dettagli in testa al file).");
      return comando ? 1 : 0;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main();
