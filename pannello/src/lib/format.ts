// Formattazione condivisa dei valori KPI (numeri, euro, durata, stelle, %).
// Usato dal cockpit numeri (page.tsx) e dal sistema Modulo (aree).

export type Tipo = "n" | "euro" | "durata" | "stelle" | "perc";

// Porta a testo QUALUNQUE valore arrivi dai JSON della memoria.
// I file di memoria li scrivono gli agenti, non un form: un campo dichiarato
// "stringa" può arrivare come elenco. È successo davvero il 27/07/2026 alle
// 12:14 (radiografia #558): `causa_radice` scritta come lista di «5 perché» in
// 5 difetti → `(s || "").replace` esplode → la Cabina non si carica più.
// La conversione sta QUI, a monte di ogni manipolazione di testo, perché il
// Pannello non può pretendere che il dato sia della forma giusta: deve reggere.
export function comeTesto(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  // Elenco (i «5 perché», una lista di prove): una voce per riga, niente "a,b,c".
  if (Array.isArray(v)) return v.map(comeTesto).filter(Boolean).join("\n");
  // Oggetto: meglio niente che "[object Object]" a schermo. Il contenuto
  // integrale resta comunque visibile sotto «Dettagli tecnici».
  if (typeof v === "object") return "";
  return String(v);
}

// Ripulisce un testo per mostrarlo "a vista": toglie il grassetto markdown
// (**…**, *…*, `…`) e l'eventuale emoji di livello iniziale (🟢🟡🔴) — il colore
// viene già comunicato dal pallino/bordo, quindi nel testo è ridondante.
export function testoPulito(s: unknown): string {
  return comeTesto(s)
    // Carattere di sostituzione U+FFFD («�»): mojibake da emoji corrotte a monte
    // (es. «🟢�», «✅�» in memoria). Non deve MAI arrivare a schermo → via ovunque.
    .replace(/�/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/^\s*[🟢🟡🔴⚪]\s*/u, "")
    .trim();
}

// ── Tempo: l'ora c'è SEMPRE dove la fonte la possiede ──────────────────────
// Due tipi di "data" girano nel pannello:
//  1) stringhe scritte dall'AD nel vault, già a "ora di parete" di Piacenza
//     ("AAAA-MM-GG" o "AAAA-MM-GG HH:MM") → niente conversione di fuso, solo
//     riformattazione → dataVault().
//  2) timestamp ISO veri con fuso/Z (created_at/updated_at, log) → vanno
//     convertiti e mostrati in Europe/Rome → istante().
const TZ_ROMA = "Europe/Rome";

// True se la stringa NON porta un fuso (né 'Z' né offset '±HH:MM') → è una data-vault wall-clock.
export function senzaFuso(s: string): boolean {
  const raw = (s || "").trim();
  return !!raw && !/[zZ]$/.test(raw) && !/[+-]\d{2}:?\d{2}$/.test(raw);
}

// Offset di Europe/Rome a una certa data, come "+02:00" (estate) / "+01:00" (inverno).
export function offsetRoma(d: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ_ROMA, timeZoneName: "longOffset" }).formatToParts(d);
    const v = parts.find((p) => p.type === "timeZoneName")?.value || "";
    const m = v.match(/GMT([+-])(\d{2}):?(\d{2})/);
    if (m) return `${m[1]}${m[2]}:${m[3]}`;
  } catch {
    /* runtime senza longOffset: ripiega su CET */
  }
  return "+01:00";
}

// Converte una stringa-vault (Piacenza, senza fuso) in un ISO con offset Europe/Rome corretto per quella
// data (no hardcode +02:00, sbaglierebbe d'inverno). Le stringhe che hanno già un fuso tornano invariate.
export function vaultToIso(s: string): string {
  const raw = (s || "").trim();
  if (!senzaFuso(raw)) return raw;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return raw;
  const [, y, mo, d, hh = "00", mi = "00"] = m;
  const base = Date.UTC(+y, +mo - 1, +d, +hh, +mi);
  return `${y}-${mo}-${d}T${hh}:${mi}:00${offsetRoma(new Date(base))}`;
}

/**
 * AR-414 — **QUANTO È VECCHIO QUESTO DATO**, calcolato una volta sola e per il fuso giusto.
 *
 * Tre rotte del Pannello scrivevano a mano `new Date(\`${y}-${mo}-${d}T${h}:${mi}:00+02:00\`)`. Erano
 * nate d'estate, e `+02:00` è l'ora legale: da fine ottobre a fine marzo quel calcolo sbaglia di
 * un'ora piena, sempre nella stessa direzione. **Misurato, non dedotto:** una data-vault del
 * 15 gennaio alle 12:00 vale davvero le 11:00 UTC, ma letta con `+02:00` diventa le 10:00 UTC — cioè
 * un istante più indietro, e il dato risulta **più VECCHIO di un'ora** di quanto sia. D'inverno le due
 * soglie che stanno qui sotto scattano un'ora prima del dovuto: `scan_stale` (oltre 48 ore) e
 * `dati_freschi` (sotto le 3). Un allarme che parte da solo vale un allarme ignorato.
 *
 * È la stessa malattia del badge — una superficie che dà un verdetto senza averlo misurato — solo
 * girata nella direzione pessimista. E ne erano tre perché la terza copia era stata incollata dalla
 * seconda, identica carattere per carattere.
 *
 * L'ora giusta si CALCOLA (`vaultToIso` interroga il fuso di Europe/Rome per quella data), non si
 * scrive. Qui la conoscenza sta in una funzione sola: la quarta copia non ha più motivo di nascere,
 * e la prova (`cervello/test/orologi-inchiodati-allora-legale.test.mjs`) chiude la porta a chi
 * volesse riscriverla a mano.
 *
 * @param dataStr una data-vault ("AAAA-MM-GG" o "AAAA-MM-GG HH:MM", ora di parete di Piacenza) oppure
 *   un ISO che porta già il suo fuso — in quel caso si rispetta il fuso che ha.
 * @param adesso l'istante di riferimento in millisecondi. Esplicito perché l'età di un dato si possa
 *   provare in gennaio e in luglio senza aspettare l'inverno.
 * @param oraSeManca l'ora da usare quando la data non ne porta una: mezzogiorno, così l'errore
 *   massimo è di mezza giornata in entrambe le direzioni invece di una intera in una sola.
 * @returns le ore trascorse (frazionarie), oppure `null` se la stringa non è una data — mai 0, che
 *   si leggerebbe come «appena aggiornato».
 */
export function oreDaDataVault(dataStr: unknown, adesso: number = Date.now(), oraSeManca = "12:00"): number | null {
  const raw = String(dataStr ?? "").trim();
  if (!raw) return null;
  let iso: string;
  if (senzaFuso(raw)) {
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (!m) return null;
    const [, y, mo, d, hh, mi] = m;
    const [hDef = "12", miDef = "00"] = String(oraSeManca).split(":");
    iso = vaultToIso(`${y}-${mo}-${d} ${hh ?? hDef}:${mi ?? miDef}`);
  } else {
    iso = raw;
  }
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return (adesso - t) / 3_600_000;
}

/** Giorno calendario in Europe/Rome (AAAA-MM-GG). */
export function giornoRoma(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ_ROMA }).format(d);
}

/** Tra più date-vault (Piacenza, senza fuso), restituisce la più recente — stringa grezza. */
export function dataVaultRecente(...date: (string | undefined | null)[]): string {
  let best = "";
  let bestMs = -Infinity;
  for (const raw of date) {
    const s = (raw || "").trim();
    if (!s) continue;
    const ms = new Date(vaultToIso(s)).getTime();
    if (!Number.isNaN(ms) && ms > bestMs) {
      bestMs = ms;
      best = s;
    }
  }
  return best;
}

// Vault → "GG/MM/AAAA · HH:MM" (o solo "GG/MM/AAAA" se l'ora non c'è).
export function dataVault(s: string): string {
  const raw = (s || "").trim();
  if (!raw) return "";
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return raw;
  const [, y, mo, d, hh, mi] = m;
  return hh != null ? `${d}/${mo}/${y} · ${hh}:${mi}` : `${d}/${mo}/${y}`;
}

/** Etichetta ritmo: oggi/ieri/data · ora — senza conversioni di fuso. */
export function etichettaRitmo(data: string | undefined): string {
  if (!data) return "";
  const raw = data.trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return dataVault(raw) || raw;
  const [, y, mo, d, hh, mi] = m;
  const giornoVoce = `${y}-${mo}-${d}`;
  const oggi = giornoRoma();
  const ieri = giornoRoma(new Date(Date.now() - 86_400_000));
  const ora = hh != null ? `${hh}:${mi}` : "";
  const dataIt = `${d}/${mo}/${y}`;
  if (giornoVoce === oggi) return ora ? `oggi · ${ora}` : "oggi";
  if (giornoVoce === ieri) return ora ? `ieri · ${ora}` : "ieri";
  return ora ? `${dataIt} · ${ora}` : dataIt;
}

export function ritmoEODoggi(data: string | undefined): boolean {
  if (!data) return false;
  const m = data.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return !!m && m[1] === giornoRoma();
}

// ISO reale → "GG/MM · HH:MM" in Europe/Rome (così l'ora è quella di Piacenza).
export function istante(iso: string): string {
  const raw = (iso || "").trim();
  if (!raw) return "";
  // Stringa-vault SENZA fuso? È già ora di parete di Piacenza: niente conversione, altrimenti new Date()
  // la interpreta come ora locale del runtime (UTC su Vercel) e la riproietta → sfasamento di 1-2h.
  if (senzaFuso(raw)) return dataVault(raw);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return dataVault(raw); // fallback: stringa-vault
  try {
    return new Intl.DateTimeFormat("it-IT", {
      timeZone: TZ_ROMA, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(d).replace(", ", " · ");
  } catch {
    return dataVault(raw);
  }
}

// Tempo relativo ("5 min fa") + orario esatto in Europe/Rome. Accetta ISO o data-vault.
export function faRelativo(iso: string | null | undefined): string {
  if (!iso) return "mai";
  const d = new Date(vaultToIso(iso.trim()));
  const ms = d.getTime();
  if (Number.isNaN(ms)) return "mai";
  const sec = Math.max(0, (Date.now() - ms) / 1000);
  const rel =
    sec < 90
      ? "poco fa"
      : sec < 3600
        ? `${Math.round(sec / 60)} min fa`
        : sec < 86400
          ? `${Math.round(sec / 3600)} h fa`
          : `${Math.round(sec / 86400)} g fa`;
  try {
    const giorno = (x: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ_ROMA }).format(x);
    const opts: Intl.DateTimeFormatOptions = { timeZone: TZ_ROMA, hour: "2-digit", minute: "2-digit" };
    if (giorno(d) !== giorno(new Date())) {
      opts.day = "2-digit";
      opts.month = "2-digit";
    }
    return `${rel} · ${new Intl.DateTimeFormat("it-IT", opts).format(d)}`;
  } catch {
    return rel;
  }
}

export function timbro(quando: string | number | Date | null | undefined): string {
  // null/undefined/0/"" = nessun valore → vuoto (evita di mostrare l'epoch 1970).
  if (quando == null || quando === 0 || quando === "") return "";
  const d = quando instanceof Date ? quando : new Date(quando);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("it-IT", {
      timeZone: TZ_ROMA, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(d).replace(", ", " · ");
  } catch {
    return "";
  }
}

export function formatta(v: any, tipo?: Tipo): string {
  if (v === undefined || v === null) return "—";
  if (tipo === "euro") {
    // Guardia: un valore non numerico (es. stringa vuota, "n/d") diventava "€ NaN" a
    // schermo. Meglio il trattino neutro che un finto importo rotto.
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return "€ " + n.toLocaleString("it-IT", { maximumFractionDigits: 2 });
  }
  if (tipo === "durata") {
    const min = Number(v);
    if (!min || Number.isNaN(min)) return "—";
    return min >= 60 ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}m` : `${Math.round(min)} min`;
  }
  if (tipo === "stelle") {
    const r = Number(v);
    return r > 0 ? `${r}/5` : "—";
  }
  if (tipo === "perc") {
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return `${n}%`;
  }
  return String(v);
}
