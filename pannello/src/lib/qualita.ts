// 🏆 Valutatore di qualità (Livello 2): un controllo PRIMA che un'azione esca.
// Deterministico = €0. Cattura i difetti che fanno sembrare il lavoro "amatoriale":
// segnaposti non riempiti, email incomplete, testo vuoto. (Il critico avversariale
// con AI è il livello sopra, opzionale e dentro al budget.)
export type Qualita = { voto: "ok" | "rivedere"; problemi: string[] };

// Pattern di segnaposto rimasti (da riempire prima di pubblicare/inviare).
const SEGNAPOSTI: RegExp[] = [
  /\[[^\]]{1,40}\]/, // [INSERIRE], [Garetti], [..]
  /\bINSERIRE\b/i,
  /\bTODO\b/i,
  /\bXXX+\b/,
  /lorem ipsum/i,
  /\{\{?\s*[a-z_]+\s*\}?\}/i, // {nome}, {{store}}
  /segnaposto/i,
];

export function verificaQualita(a: { titolo?: string; testo?: string; canale?: string; destinatario?: string; livello?: string }): Qualita {
  const problemi: string[] = [];
  const testo = (a.testo || "").trim();
  const titolo = (a.titolo || "").trim();
  const isEmail = /e-?mail|mail/i.test(a.canale || "");

  if (testo.length < 20) problemi.push("Testo troppo corto o assente");
  if (SEGNAPOSTI.some((re) => re.test(testo) || re.test(titolo))) {
    problemi.push("Ci sono segnaposti da riempire (es. [..], INSERIRE, {nome})");
  }
  if (isEmail && !/^\s*Oggetto\s*:/im.test(testo)) problemi.push("Email senza riga «Oggetto:»");
  if (isEmail && !(a.destinatario || "").trim()) problemi.push("Email senza destinatario");

  return { voto: problemi.length ? "rivedere" : "ok", problemi };
}
