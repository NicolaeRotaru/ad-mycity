#!/usr/bin/env node
// 📋 DOCUMENTI DI GOVERNO — la lista sta in UN posto solo, e la copertura si misura.
//
// ─────────────────────────────────────────────────────────────────────────────
// L'ULTIMA CLAUSOLA DI AR-431
// ─────────────────────────────────────────────────────────────────────────────
// La mappa dei rischi è rimasta ferma 43 giorni con otto rischi gravi e nessuno se n'è accorto. Il
// guardiano di freschezza per i rischi adesso c'è e gira a ogni giro (`freschezza-rischi.mjs`).
//
// Ma il `fix_proposto` aveva una clausola in più, l'ultima — quella che salta sempre, perché arriva
// quando il lavoro sembra finito:
//
//   «E rendere la regola generale: ogni documento di governo (rischi, OKR, checklist, scadenzario,
//    glossario KPI) ha un guardiano di freschezza, e la lista sta in un posto solo.»
//
// Il quinto perché diceva esattamente questo: «quando qui nasce una FAMIGLIA di controlli nessuno
// passa in rassegna tutti i documenti che dovrebbero entrarci — le famiglie crescono per incidenti,
// non per copertura». Riparare il rischio-che-invecchia e non fare la rassegna vuol dire aspettare
// il prossimo incidente per scoprire il prossimo documento scoperto.
//
// Questa è la rassegna, scritta una volta. Chi resta senza guardiano non sparisce: sta nella lista
// con un'ATTESA DATATA e il perché — perché un'esenzione si discute, un'omissione no, dato che
// nessuno la vede. Quando la data passa, l'attesa torna a essere un buco.
//
// 🟢 Sola lettura. Nessun effetto all'import.

/**
 * LA LISTA. Cinque documenti, quelli nominati dalla scheda. Ogni voce dice chi lo sorveglia — o,
 * se nessuno lo sorveglia, entro quando e perché.
 */
export const DOCUMENTI = [
  {
    id: "rischi",
    documento: "MyCity-Vault/05-Soldi-Rischi/REGISTRO-RISCHI.json",
    cosa_e: "quali rischi possono affondare l'azienda, e chi li presidia",
    guardiano: "cervello/freschezza-rischi.mjs",
  },
  {
    id: "okr",
    documento: "MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md",
    cosa_e: "il KPI e il budget di ogni reparto",
    guardiano: "cervello/freschezza-okr.mjs",
  },
  {
    id: "checklist",
    documento: "MyCity-Vault/90-Memoria-AI/CHECKLIST-NICOLA.md",
    cosa_e: "le cose che tocca fare a Nicola di persona",
    guardiano: "cervello/freschezza-checklist.mjs",
  },
  {
    id: "scadenzario",
    documento: "MyCity-Vault/05-Soldi-Rischi/scadenzario.json",
    cosa_e: "tutte le scadenze: fiscali, contributive, contrattuali, bandi",
    guardiano: null,
    attesa: {
      fino: "2026-09-30",
      perche:
        "Un guardiano di freschezza qui direbbe la cosa sbagliata: lo scadenzario non invecchia perché nessuno lo tocca, invecchia quando una DATA passa senza che sia successo niente. Serve un controllo sulle scadenze scadute, non sull'ultima modifica del file — e va scritto apposta, non copiato da freschezza-rischi.",
    },
  },
  {
    id: "glossario-kpi",
    documento: "MyCity-Vault/07-Agenti/GLOSSARIO-KPI.md",
    cosa_e: "l'unica definizione condivisa di ogni numero che la macchina dice a Nicola",
    guardiano: null,
    attesa: {
      fino: "2026-09-30",
      perche:
        "Qui il pericolo non è la data vecchia: è un KPI che vive solo dentro uno script e non è mai passato dal glossario — la causa esatta di AR-282 sulla cassa. Il controllo giusto confronta i KPI scritti nel codice con quelli definiti qui, e quel confronto va costruito, non è una freschezza.",
    },
  },
];

/** Millisecondi da `AAAA-MM-GG`, NaN se non si legge. */
function msDaData(s) {
  const m = String(s ?? "").trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
}

/**
 * I documenti di governo SCOPERTI: senza guardiano e senza un'attesa valida.
 *
 * PURA: le si passa l'elenco dei guardiani che esistono davvero (derivato dal disco da chi chiama)
 * e l'istante. Un guardiano DICHIARATO ma inesistente conta come assente — dichiarare non è essere.
 *
 * @param {number} adessoMs
 * @param {Set<string>|string[]} guardianiEsistenti percorsi relativi, es. "cervello/freschezza-okr.mjs"
 * @param {Array} lista
 */
export function scoperti(adessoMs, guardianiEsistenti, lista = DOCUMENTI) {
  const esistono = guardianiEsistenti instanceof Set ? guardianiEsistenti : new Set(guardianiEsistenti || []);
  const fuori = [];
  for (const d of lista) {
    if (d.guardiano && esistono.has(d.guardiano)) continue;

    if (d.guardiano && !esistono.has(d.guardiano)) {
      fuori.push({ id: d.id, motivo: `dichiara il guardiano ${d.guardiano}, che nel repo non esiste: dichiarare non è essere` });
      continue;
    }
    const fino = msDaData(d.attesa?.fino);
    if (!Number.isFinite(fino)) {
      fuori.push({ id: d.id, motivo: "senza guardiano e senza una data entro cui averlo: non è un'attesa, è un'omissione" });
      continue;
    }
    if (!String(d.attesa?.perche || "").trim()) {
      fuori.push({ id: d.id, motivo: "l'attesa ha una data ma non il perché: un'etichetta non è una ragione" });
      continue;
    }
    if (adessoMs > fino) {
      fuori.push({ id: d.id, motivo: `l'attesa è scaduta il ${d.attesa.fino}: o nasce il guardiano, o si sposta la data con un perché nuovo` });
    }
  }
  return fuori;
}

/** Il quadro completo, per chi vuole stamparlo. PURO. */
export function copertura(adessoMs, guardianiEsistenti, lista = DOCUMENTI) {
  const buchi = scoperti(adessoMs, guardianiEsistenti, lista);
  const sorvegliati = lista.length - buchi.length;
  return {
    documenti: lista.length,
    sorvegliati,
    buchi,
    copertura_pct: lista.length ? Math.round((sorvegliati / lista.length) * 100) : null,
    ok: buchi.length === 0,
  };
}
