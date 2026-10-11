// 📅 scadenze-del-cancello.mjs — le date che fanno rosso un passo del cancello, e la loro voce
// nello scadenzario.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// Dal 30/9 all'11/10 la CI è stata rossa per tutti a causa di una data scaduta in un registro che il
// giro non legge (AR-966). La cura dell'11/10: ogni data del genere ha la sua voce nello scadenzario,
// con la stessa data, così il giro avvisa tre giorni prima del rosso.
//
// Il collegamento fra la voce e la data, all'inizio, stava nell'id («attesa-…», «esenzione-…») e in una
// frase della fonte. L'ottavo collaudo ha mostrato cosa costava: una scadenza del mondo che si chiamasse
// «esenzione-imu-2027» faceva rossa la CI, un doppione con un altro nome passava, e una fonte che citava
// il file di un'altra esenzione dava un falso rosso. Adesso il collegamento è un campo, `cancello`,
// confrontato per uguaglianza. Le voci che non lo hanno sono scadenze del mondo: il loro nome è libero.
//
// Ogni data porta il suo CONFINE: l'istante in cui il passo del cancello cambia colore (un attimo prima
// è verde, un attimo dopo è rosso). Lo scadenzario deve dichiarare quell'istante, non un altro. Le due
// regole qui sotto copiano quelle dei due guardiani, e la prova c9 le confronta con i guardiani veri:
// se uno dei due cambia regola, la prova se ne accorge.
//
// 🟢 Funzioni pure. Nessun effetto all'import, nessuna lettura dal disco: chi chiama passa i dati.

// I registri, col nome breve che lo scadenzario usa nel campo `cancello.registro`:
//   · «porte»   — il registro delle porte (atti-con-porte.json), letto da porte-gemelle;
//   · «governo» — la lista dei documenti di governo (documenti-di-governo.mjs), letta dalla prova
//                 «IL PUNTO» di c9.
// Gli altri due registri con date che fermano il cancello (hook-in-attesa.json, le attese dei gate)
// non sono ancora qui: è AR-972.

/** «AAAA-MM-GG» → [anno, mese, giorno]; null se la forma non è quella. */
function giorno(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? "").trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/**
 * Le esenzioni a scadenza del registro delle porte. porte-gemelle confronta `fino_al` con la data di
 * Greenwich di oggi e dà l'esenzione per scaduta quando quella data la supera: vale per tutto il giorno
 * scritto, e il cancello diventa rosso alla mezzanotte di Greenwich del giorno dopo.
 */
export function datePorte(registro = {}) {
  return (registro.atti || []).flatMap((atto) =>
    (atto.esenti || [])
      .filter((e) => e && e.fino_al)
      .map((e) => {
        const g = giorno(e.fino_al);
        return { registro: "porte", chiave: e.file, data: String(e.fino_al), confine: g ? Date.UTC(g[0], g[1] - 1, g[2] + 1) : NaN };
      }),
  );
}

/**
 * Le attese della lista dei documenti di governo: un documento senza guardiano, con `attesa.fino`.
 * La lista lo dà per buco appena l'istante supera la mezzanotte di Greenwich di quel giorno.
 */
export function dateGoverno(documenti = []) {
  return documenti
    .filter((d) => d && !d.guardiano && d.attesa?.fino)
    .map((d) => {
      const g = giorno(d.attesa.fino);
      return { registro: "governo", chiave: d.id, data: String(d.attesa.fino), confine: g ? Date.UTC(g[0], g[1] - 1, g[2]) : NaN };
    });
}

function descrivi(d) {
  return d.registro === "porte" ? `l'esenzione di ${d.chiave} (fino al ${d.data})` : `l'attesa di «${d.chiave}» (fino al ${d.data})`;
}

/**
 * IL CONFRONTO. Ogni data del cancello vuole UNA voce aperta dello scadenzario che la rimandi
 * (`cancello: { registro, chiave }`), con `scade` all'istante del confine. Ogni voce che rimanda vuole
 * la sua data ancora viva. E gli id delle voci aperte sono unici: chi legge lo scadenzario per id ne
 * vedrebbe una sola.
 *
 * @param {{date: Array<{registro:string, chiave:string, data:string, confine:number}>, voci: Array}} ing
 * @returns {string[]} i problemi, in parole; vuoto se tutto torna.
 */
export function problemiScadenze({ date = [], voci = [] } = {}) {
  const problemi = [];
  const ids = voci.map((v) => v?.id);
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) {
    problemi.push(`due voci aperte dello scadenzario hanno lo stesso id «${id}»: chi le legge per id ne vede una sola`);
  }
  const rimandi = voci.filter((v) => v && v.cancello);
  const stessa = (v, d) => v.cancello.registro === d.registro && v.cancello.chiave === d.chiave;
  for (const d of date) {
    if (!Number.isFinite(d.confine)) {
      problemi.push(`${descrivi(d)}: la data non è nella forma AAAA-MM-GG, e non so quando il cancello diventa rosso`);
      continue;
    }
    const sue = rimandi.filter((v) => stessa(v, d));
    if (!sue.length) {
      problemi.push(`${descrivi(d)} non ha la sua voce nello scadenzario: il giorno del rosso arriva senza preavviso`);
    } else if (sue.length > 1) {
      problemi.push(`${descrivi(d)} ha ${sue.length} voci nello scadenzario (${sue.map((v) => v.id).join(", ")}): ne serve una sola, le altre avvisano per date che nessuno controlla`);
    } else if (Date.parse(sue[0].scade) !== d.confine) {
      problemi.push(`${descrivi(d)}: lo scadenzario dice ${sue[0].scade}, ma il cancello cambia colore il ${new Date(d.confine).toISOString()}`);
    }
  }
  for (const v of rimandi) {
    if (!date.some((d) => stessa(v, d))) {
      problemi.push(`«${v.id}» rimanda a una data del cancello che non c'è più (${v.cancello.registro} · ${v.cancello.chiave}): la voce va in chiuse`);
    }
  }
  return problemi;
}
