// Formattazione condivisa dei valori KPI (numeri, euro, durata, stelle, %).
// Usato dal cockpit numeri (page.tsx) e dal sistema Modulo (aree).

export type Tipo = "n" | "euro" | "durata" | "stelle" | "perc";

// Ripulisce un testo per mostrarlo "a vista": toglie il grassetto markdown
// (**…**, *…*, `…`) e l'eventuale emoji di livello iniziale (🟢🟡🔴) — il colore
// viene già comunicato dal pallino/bordo, quindi nel testo è ridondante.
export function testoPulito(s: string): string {
  return (s || "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/^\s*[🟢🟡🔴⚪]\s*/u, "")
    .trim();
}

export function formatta(v: any, tipo?: Tipo): string {
  if (v === undefined || v === null) return "—";
  if (tipo === "euro") return "€ " + Number(v).toLocaleString("it-IT", { maximumFractionDigits: 2 });
  if (tipo === "durata") {
    const min = Number(v);
    if (!min) return "—";
    return min >= 60 ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}m` : `${Math.round(min)} min`;
  }
  if (tipo === "stelle") {
    const r = Number(v);
    return r > 0 ? `${r}/5` : "—";
  }
  if (tipo === "perc") return `${Number(v)}%`;
  return String(v);
}
