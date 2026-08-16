// 🎚️ SCORECARD-RUBRICA — un voto che si può confrontare, invece di prosa che sembra una misura.
//
// AR-288. Tutti e centoventi i mansionari promettono una «scorecard» a fine lavoro. Nei quaderni
// veri, quel campo è testo libero: «cancello verde, rapporto leggibile 9 min», «9/10», «8/10 chiuso
// in 20min». Nessuna di queste righe si può confrontare con un'altra, quindi non si può dire se un
// reparto sta migliorando, e il livellamento dei senior resta un giudizio a impressione.
//
// La causa di sistema, scritta nella scheda: **la macchina chiude i difetti sulla comparsa
// dell'artefatto e non sulla sua utilizzabilità a valle.** AR-009 chiedeva che la riga ESITO
// esistesse; è stata chiusa quando la riga è comparsa. Che quella riga servisse a misurare qualcuno
// nel tempo non l'ha verificato nessuno. Un dato raccolto in formato libero non è un dato: è prosa
// che sembra una misura.
//
// SCHEDA CONTRO CODICE. Il `fix_proposto` chiedeva sei assi, `A/V/C/K/S/N`. La rubrica vera
// (`MyCity-Vault/07-Agenti/RUBRICA-QUALITA.md`) ne ha SETTE, e sono questi. Fra la scheda e il
// documento di casa comanda il documento: un settimo asse scartato per far tornare una sigla sarebbe
// la stessa malattia un piano più sotto.

/** I sette criteri di «fatto bene», nell'ordine della rubrica. La lettera è la sigla nel voto. */
export const ASSI = [
  { lettera: "V", nome: "Vero", cosa: "ogni numero poggia su dati reali, con la fonte" },
  { lettera: "C", nome: "Concreto", cosa: "dice cosa, chi, quando" },
  { lettera: "A", nome: "Artefatto reale", cosa: "è il deliverable pronto all'uso, non la sua descrizione" },
  { lettera: "K", nome: "Colore giusto", cosa: "🟢🟡🔴 giusto: le azioni reali sono accodate, non eseguite di nascosto" },
  { lettera: "I", nome: "Impatto dichiarato", cosa: "l'effetto atteso su un KPI, stimato onestamente" },
  { lettera: "M", nome: "Memoria", cosa: "ha lasciato una lezione riusabile nel quaderno" },
  { lettera: "E", nome: "Efficiente", cosa: "il minimo necessario, riusa l'esistente" },
];

export const LETTERE = ASSI.map((a) => a.lettera);
export const VOTO_MIN = 1;
export const VOTO_MAX = 5;

/** La riga d'aiuto: chi viene respinto deve sapere cosa scrivere, non solo che ha sbagliato. */
export function comeSiScrive() {
  return [
    `Formato del voto: ${LETTERE.map((l) => `${l}<1-5>`).join(" ")}   (es: V5 C4 A5 K5 I3 M4 E4)`,
    "Oppure sette numeri separati da barra, nello stesso ordine: 5/4/5/5/3/4/4",
    ...ASSI.map((a) => `  ${a.lettera} = ${a.nome} — ${a.cosa}`),
  ].join("\n");
}

/**
 * Legge un voto e dice se è confrontabile.
 *
 * Due forme ammesse, entrambe compatte perché un formato scomodo non viene usato:
 *   · `V5 C4 A5 K5 I3 M4 E4` — leggibile a occhio, l'ordine non conta
 *   · `5/4/5/5/3/4/4`        — sette numeri nell'ordine della rubrica
 * Tutto il resto è prosa, e la prosa non si aggrega.
 */
export function leggiScorecard(testo) {
  const s = String(testo ?? "").trim();
  if (!s) return { ok: false, causa: "vuoto", motivo: "manca il voto: la riga ESITO non dice com'è andata" };

  const voti = {};
  const barre = s.match(/^(\d)\s*\/\s*(\d)\s*\/\s*(\d)\s*\/\s*(\d)\s*\/\s*(\d)\s*\/\s*(\d)\s*\/\s*(\d)$/);
  if (barre) {
    LETTERE.forEach((l, i) => {
      voti[l] = Number(barre[i + 1]);
    });
  } else {
    const trovate = [...s.matchAll(/\b([VCAKIME])\s*[:=]?\s*([1-5])\b/g)];
    for (const m of trovate) voti[m[1]] = Number(m[2]);
  }

  const mancanti = LETTERE.filter((l) => voti[l] === undefined);
  if (mancanti.length) {
    return {
      ok: false,
      causa: "prosa",
      mancanti,
      motivo: `voto non confrontabile: mancano gli assi ${mancanti.join(", ")}. Un voto in prosa non si può mettere in fila con quello del mese scorso.`,
    };
  }
  const fuoriScala = LETTERE.filter((l) => voti[l] < VOTO_MIN || voti[l] > VOTO_MAX);
  if (fuoriScala.length) {
    return { ok: false, causa: "fuori-scala", motivo: `voti fuori dalla scala 1-5: ${fuoriScala.join(", ")}` };
  }

  const valori = LETTERE.map((l) => voti[l]);
  const media = Math.round((valori.reduce((a, b) => a + b, 0) / valori.length) * 100) / 100;
  const ordinati = [...ASSI].sort((a, b) => voti[a.lettera] - voti[b.lettera]);
  return {
    ok: true,
    voti,
    media,
    // I due assi più bassi: è la cosa che serve a decidere su cosa far crescere un reparto.
    assi_bassi: ordinati.slice(0, 2).map((a) => ({ lettera: a.lettera, nome: a.nome, voto: voti[a.lettera] })),
    canonico: LETTERE.map((l) => `${l}${voti[l]}`).join(" "),
  };
}

/** Il voto è già scritto nella forma confrontabile? */
export function scorecardTipizzata(testo) {
  return leggiScorecard(testo).ok;
}

/**
 * La vista che il livellamento dei senior aspettava: media per reparto e i due assi più deboli.
 *
 * `righe` è un elenco `{reparto, scorecard}` — le righe ESITO già lette da chi possiede i quaderni.
 * Le righe in prosa non si buttano: si contano a parte, così «media 4,2» non nasconde che quella
 * media è fatta su tre righe su quaranta.
 */
export function aggregaPerReparto(righe = []) {
  const per = new Map();
  for (const r of righe) {
    const nome = String(r?.reparto || "?");
    if (!per.has(nome)) per.set(nome, { reparto: nome, righe: 0, tipizzate: 0, somme: {}, media: null, assi_bassi: [] });
    const acc = per.get(nome);
    acc.righe += 1;
    const v = leggiScorecard(r?.scorecard);
    if (!v.ok) continue;
    acc.tipizzate += 1;
    for (const l of LETTERE) acc.somme[l] = (acc.somme[l] || 0) + v.voti[l];
  }
  const out = [];
  for (const acc of per.values()) {
    if (acc.tipizzate > 0) {
      const medie = LETTERE.map((l) => ({ lettera: l, nome: ASSI.find((a) => a.lettera === l).nome, voto: acc.somme[l] / acc.tipizzate }));
      acc.media = Math.round((medie.reduce((s, m) => s + m.voto, 0) / medie.length) * 100) / 100;
      acc.assi_bassi = [...medie].sort((a, b) => a.voto - b.voto).slice(0, 2).map((m) => ({ ...m, voto: Math.round(m.voto * 100) / 100 }));
    }
    delete acc.somme;
    out.push(acc);
  }
  return out.sort((a, b) => a.reparto.localeCompare(b.reparto));
}
