// 🫀 I CINQUE ORGANI, come li deve vedere Nicola — AR-476.
//
// PERCHÉ ESISTE. La visita (`cervello/salute.mjs`) produce un verdetto per ognuno dei cinque organi
// — worker, cervello, Cabina, senior, sensori — e li scrive in `auto-coscienza/salute.json` sotto
// `ultime`. Il Pannello, però, di quel file leggeva soltanto il voto sintetico: il dettaglio per
// organo restava in un JSON e in un referto markdown. Cioè il verdetto più ricco che la macchina
// produce su se stessa viveva dove Nicola non guarda — la stessa forma di AR-474, applicata alla
// visita invece che al lavoro consegnato.
//
// LA REGOLA DIFFICILE, ed è tutta qui: **⚪ non è mai un verde.** «Non l'ho potuto vedere da qui» e
// «l'ho provato e funziona» sono due cose diverse, e un cruscotto che le somma è peggio di nessun
// cruscotto — perché la copertura sembra piena mentre è bucata. Quindi i non-visti hanno una loro
// casella, e il conto dichiara sempre quanti sono.

export type EsitoOrgano = "ok" | "rotto" | "nonvisto" | "guasto";

export type VoceOrgano = {
  id?: string;
  organo?: string;
  titolo?: string;
  esito?: EsitoOrgano | string;
  detto?: string;
  impatto?: number;
};

export type OrganoRiassunto = {
  organo: string;
  verdi: number;
  rossi: number;
  nonVisti: number;
  /** I rossi per primi, poi i ⚪: quello che va guardato sta in cima. */
  daGuardare: VoceOrgano[];
};

const ORDINE = ["worker", "cervello", "cabina", "senior", "sensori"];

/** Un guasto del controllo NON è un rosso dell'organo: è la visita che non è partita. Conta come ⚪. */
function classe(v: VoceOrgano): "verde" | "rosso" | "nonvisto" {
  if (v.esito === "ok") return "verde";
  if (v.esito === "rotto") return "rosso";
  return "nonvisto";
}

/**
 * Le voci, comunque sia scritto il referto.
 *
 * La forma vera oggi è `{ "<casa>": { quando, controlli: [...] } }` — una casa per posto da cui la
 * macchina si visita (claude, vps). Le altre due forme sono tollerate perché questo file ha già
 * cambiato struttura una volta: leggere una sola forma significherebbe che il giorno del cambio la
 * Cabina mostra zero rossi invece di un errore, cioè un verde per assenza di dati. Mai.
 */
export function vociDaReferto(ultime: unknown): VoceOrgano[] {
  if (Array.isArray(ultime)) return ultime as VoceOrgano[];
  if (!ultime || typeof ultime !== "object") return [];
  return Object.values(ultime as Record<string, any>).flatMap((v) => {
    if (Array.isArray(v)) return v as VoceOrgano[];
    if (v && Array.isArray(v.controlli)) return v.controlli as VoceOrgano[];
    return v && typeof v === "object" && "esito" in v ? [v as VoceOrgano] : [];
  });
}

export function riassumiOrgani(ultime: unknown): OrganoRiassunto[] {
  const voci = vociDaReferto(ultime);

  const per = new Map<string, OrganoRiassunto>();
  for (const v of voci) {
    if (!v || typeof v !== "object") continue;
    const nome = String(v.organo || "altro");
    if (!per.has(nome)) per.set(nome, { organo: nome, verdi: 0, rossi: 0, nonVisti: 0, daGuardare: [] });
    const r = per.get(nome)!;
    const c = classe(v);
    if (c === "verde") r.verdi++;
    else if (c === "rosso") {
      r.rossi++;
      r.daGuardare.push(v);
    } else {
      r.nonVisti++;
      r.daGuardare.push(v);
    }
  }
  // I rossi prima dei ⚪ dentro ogni organo, e gli organi nell'ordine in cui la macchina li racconta.
  for (const r of per.values()) r.daGuardare.sort((a, b) => (classe(a) === "rosso" ? -1 : 1) - (classe(b) === "rosso" ? -1 : 1));
  return [...per.values()].sort((a, b) => {
    const ia = ORDINE.indexOf(a.organo);
    const ib = ORDINE.indexOf(b.organo);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

/** Il conto complessivo. `copertura` è la percentuale di controlli che hanno davvero misurato. */
export function contaOrgani(riassunti: OrganoRiassunto[]) {
  const verdi = riassunti.reduce((s, r) => s + r.verdi, 0);
  const rossi = riassunti.reduce((s, r) => s + r.rossi, 0);
  const nonVisti = riassunti.reduce((s, r) => s + r.nonVisti, 0);
  const totale = verdi + rossi + nonVisti;
  return { verdi, rossi, nonVisti, totale, copertura: totale ? Math.round(((verdi + rossi) / totale) * 100) : 0 };
}
