// La porta d'ingresso di un senior (Nicola 25/11: «alleggerire la macchina»).
// Il frontmatter `description:` è una riga corta (~150 byte) che dice QUANDO usare il senior: è
// quella che ogni sessione dell'AD carica per tutti i 120 senior. Il testo lungo di smistamento
// — «Delega qui per "…"» e i rimandi «(→ tema = **agente**)» — sta nel corpo, sotto il titolo
// TITOLO_PORTA. I guardiani che controllano i confini (mandato-owner, deferral-agenti,
// agent-registry-check, prompt-senior) leggono la porta intera con `portaDi`, così il controllo
// resta identico a prima mentre il peso caricato a ogni sessione scende.

export const TITOLO_PORTA = "## 🚪 Quando chiamarmi";

/** Il paragrafo di smistamento nel corpo del mansionario. "" se il mansionario non ce l'ha. */
export function portaDi(testo = "") {
  const t = String(testo || "");
  const i = t.indexOf(`\n${TITOLO_PORTA}`);
  if (i < 0) return "";
  const dopo = t.slice(i + 1).split("\n").slice(1);
  const righe = [];
  for (const r of dopo) {
    if (/^#{1,6}\s/.test(r) || r.trim() === "---") break;
    if (r.trim() === "" && righe.length) break;
    if (r.trim()) righe.push(r.trim());
  }
  return righe.join(" ").trim();
}
