import { NextRequest, NextResponse } from "next/server";
import { readVaultFile, readRepoFile, listRepoDir, leggiJsonVault } from "@/lib/vault";
import { dataDaIntestazione, giorniFra, oggiPiacenza } from "@/lib/freschezza-intelligence";
import type { RigaLista } from "@/lib/moduli";
import {
  DIMENSIONI_LEGALE,
  DIMENSIONI_SICUREZZA,
  dataBreveIt,
  eTipoModulo,
  frontmatter,
  notizieDaRss,
  righeConcorrenti,
  righeDifettiSito,
  righeDocumenti,
  righeEsperimenti,
  righeNotizie,
  righeRischi,
  vociSezione,
  type Documento,
  type Notizia,
  type TipoModulo,
} from "@/lib/moduli-memoria";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Le caselle della scheda «Mercato» che leggono la MEMORIA, non il database del sito:
//   /api/moduli/lista?tipo=concorrenti|rassegna|sicurezza|legale|esperimenti|roadmap
// Risponde come /api/marketplace/lista ({ collegato, righe }) più tre campi che la casella mostra:
//   datoDel  — la data del dato (aaaa-mm-gg), non l'ora della lettura: un radar di un mese fa
//              letto adesso resta un radar di un mese fa, e la casella deve dirlo;
//   giorni   — quanti giorni sono passati da quella data (Piacenza);
//   nota     — la frase da mostrare quando l'elenco è vuoto o la fonte non ha risposto.
// Tutto in SOLA LETTURA. Le funzioni che trasformano le fonti in righe sono in lib/moduli-memoria.

type Risposta = { collegato: boolean; righe: RigaLista[]; datoDel?: string | null; nota?: string };

const RADIOGRAFIA_SITO = "90-Memoria-AI/auto-coscienza/radiografia-marketplace.json";
const NON_LEGGO = "Non riesco a leggere la memoria in questo momento.";

/** La parte aaaa-mm-gg di una data del vault («2026-11-01 20:05» → «2026-11-01»). */
function giorno(s: unknown): string | null {
  return String(s ?? "").match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
}

/** I markdown di una cartella del repo, i più recenti per nome. */
async function documenti(cartella: string, max = 10): Promise<Documento[]> {
  const nomi = (await listRepoDir(cartella)).filter((n) => n.endsWith(".md")).sort().reverse().slice(0, max);
  return Promise.all(nomi.map(async (n) => ({ percorso: `${cartella}/${n}`, testo: await readRepoFile(`${cartella}/${n}`) })));
}

/** Un feed di Google Notizie; null se non risponde entro 5 secondi (la casella lo dice). */
async function feed(q: string): Promise<Notizia[] | null> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=it&gl=IT&ceid=IT:it`;
  try {
    const r = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PannelloMyCity/1.0)", Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!r.ok) return null;
    return notizieDaRss(await r.text(), 5);
  } catch {
    return null;
  }
}

async function concorrenti(): Promise<Risposta> {
  const md = await readVaultFile("90-Memoria-AI/Intelligence/radar-concorrenti.md");
  if (md == null) return { collegato: false, righe: [], nota: "Il radar dei concorrenti non c'è ancora: lo scrive l'intelligence dalla scheda Intelligence." };
  const righe = righeConcorrenti(md);
  return {
    collegato: true,
    righe,
    datoDel: dataDaIntestazione(md),
    nota: righe.length ? undefined : "Il radar c'è ma non ha la tabella dei concorrenti: il testo intero è nella scheda Intelligence.",
  };
}

async function rassegna(): Promise<Risposta> {
  const [noi, citta] = await Promise.all([feed('"MyCity" Piacenza'), feed("Piacenza negozi commercio")]);
  if (noi == null && citta == null) {
    const rep = await readVaultFile("90-Memoria-AI/Intelligence/reputazione.md");
    const ultimo = rep ? dataDaIntestazione(rep) : null;
    return {
      collegato: false,
      righe: [],
      datoDel: ultimo,
      nota: `Google Notizie non ha risposto.${ultimo ? ` L'ultimo controllo a mano della reputazione è del ${dataBreveIt(ultimo)}.` : ""}`,
    };
  }
  const righe = righeNotizie([
    { etichetta: "parla di MyCity", notizie: noi ?? [] },
    { etichetta: "commercio in città", notizie: citta ?? [] },
  ]);
  // La nota si vede anche sopra un elenco pieno: «nessuno parla di noi» è un dato, non un vuoto.
  let nota: string | undefined;
  if (!righe.length) nota = "Nessuna notizia trovata, né su MyCity né sul commercio in città.";
  else if (noi == null) nota = "La ricerca su MyCity non ha risposto: sotto ci sono solo le notizie della città.";
  else if (noi.length === 0) nota = "Nessuna notizia nomina MyCity: sotto ci sono quelle sul commercio in città.";
  else if (citta == null) nota = "La ricerca sulla città non ha risposto: sotto ci sono solo le notizie su MyCity.";
  return { collegato: true, righe, datoDel: oggiPiacenza(), nota };
}

async function sicurezza(): Promise<Risposta> {
  const l = await leggiJsonVault<any>(RADIOGRAFIA_SITO);
  if (!l.dati) return { collegato: false, righe: [], nota: NON_LEGGO };
  const d = righeDifettiSito(l.dati.problemi, DIMENSIONI_SICUREZZA, "accessi e permessi");
  const righe = [...d.serie, ...(d.minori ? [d.minori] : [])];
  return {
    collegato: true,
    righe,
    datoDel: giorno(l.dati.sync_scan?.aggiornato) ?? giorno(l.dati.data),
    nota: righe.length ? undefined : "Nessun difetto aperto di accessi e permessi nella radiografia del sito.",
  };
}

async function legale(): Promise<Risposta> {
  const [l, docs, reg] = await Promise.all([
    leggiJsonVault<any>(RADIOGRAFIA_SITO),
    documenti("consegne/legale"),
    leggiJsonVault<any>("05-Soldi-Rischi/REGISTRO-RISCHI.json"),
  ]);
  if (!l.dati && !reg.dati && docs.length === 0) return { collegato: false, righe: [], nota: NON_LEGGO };
  const d = l.dati ? righeDifettiSito(l.dati.problemi, DIMENSIONI_LEGALE, "privacy e testi legali") : null;
  const righe = [
    ...(d?.serie ?? []),
    ...righeDocumenti(docs),
    ...righeRischi(reg.dati?.rischi, "normativo"),
    ...(d?.minori ? [d.minori] : []),
  ];
  return {
    collegato: true,
    righe,
    datoDel: l.dati ? giorno(l.dati.sync_scan?.aggiornato) ?? giorno(l.dati.data) : giorno(reg.dati?.aggiornato),
    nota: righe.length ? undefined : "Nessun documento legale, nessun rischio normativo aperto, nessun difetto legale sul sito.",
  };
}

async function esperimenti(): Promise<Risposta> {
  const l = await leggiJsonVault<any>("90-Memoria-AI/esperimenti-crescita.json");
  if (!l.dati) return { collegato: false, righe: [], nota: "Il registro degli esperimenti non si legge in questo momento." };
  const righe = righeEsperimenti(l.dati.esperimenti);
  return {
    collegato: true,
    righe,
    datoDel: giorno(l.dati.aggiornato),
    nota: righe.length ? undefined : "Nessun esperimento di crescita in corso. Il registro è pronto: ogni esperimento nuovo si scrive lì.",
  };
}

async function roadmap(): Promise<Risposta> {
  const md = await readVaultFile("90-Memoria-AI/LAVORO-APERTO.md");
  if (md == null) return { collegato: false, righe: [], nota: NON_LEGGO };
  const righe = vociSezione(md, "lavoro sul sito");
  return {
    collegato: true,
    righe,
    datoDel: giorno(frontmatter(md, "aggiornato")),
    nota: righe.length ? undefined : "Nessun lavoro aperto sul sito nella pagina del lavoro aperto.",
  };
}

const LETTORI: Record<TipoModulo, () => Promise<Risposta>> = {
  concorrenti,
  rassegna,
  sicurezza,
  legale,
  esperimenti,
  roadmap,
};

export async function GET(req: NextRequest) {
  const tipo = (new URL(req.url).searchParams.get("tipo") || "").trim();
  if (!eTipoModulo(tipo)) return NextResponse.json({ collegato: false, righe: [], nota: "Casella sconosciuta." }, { status: 400 });
  try {
    const r = await LETTORI[tipo]();
    const giorni = r.datoDel ? giorniFra(r.datoDel, oggiPiacenza()) : null;
    return NextResponse.json({ ...r, giorni });
  } catch {
    return NextResponse.json({ collegato: false, righe: [], nota: NON_LEGGO });
  }
}
