import { NextRequest, NextResponse } from "next/server";
import { readVaultFile, readRepoFile, listRepoDir, leggiJsonVault } from "@/lib/vault";
import { dataDaIntestazione, oggiPiacenza } from "@/lib/freschezza-intelligence";
import {
  eTipoModulo,
  notizieDaRss,
  rispostaConcorrenti,
  rispostaEsperimenti,
  rispostaLegale,
  rispostaRassegna,
  rispostaRoadmap,
  rispostaSicurezza,
  type Documento,
  type Notizia,
  type RispostaModulo,
  type TipoModulo,
} from "@/lib/moduli-memoria";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Le caselle della scheda «Mercato» che leggono la MEMORIA, non il database del sito:
//   /api/moduli/lista?tipo=concorrenti|rassegna|sicurezza|legale|esperimenti|roadmap
// Risponde come /api/marketplace/lista ({ collegato, righe }) più:
//   fonti — per ogni fonte: di quando è il dato, quanti giorni fa, se è stata letta e perché no;
//   conta — quante cose ci sono davvero (58 difetti), quando le righe sono meno (8);
//   nota  — la frase da mostrare: «nessun esperimento in corso», «Google non ha risposto»…
// Qui c'è SOLO la lettura. Tutte le scelte stanno in lib/moduli-memoria.ts, dove il test le prova.
// Tutto in SOLA LETTURA.

const RADIOGRAFIA_SITO = "90-Memoria-AI/auto-coscienza/radiografia-marketplace.json";

/** I markdown di una cartella del repo, i più recenti per nome. */
async function documenti(cartella: string, max = 10): Promise<Documento[]> {
  const nomi = (await listRepoDir(cartella)).filter((n) => n.endsWith(".md")).sort().reverse().slice(0, max);
  return Promise.all(nomi.map(async (n) => ({ percorso: `${cartella}/${n}`, testo: await readRepoFile(`${cartella}/${n}`) })));
}

/** Un feed di Google Notizie; null se non risponde entro 5 secondi o non risponde con un feed. */
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

const LETTORI: Record<TipoModulo, (oggi: string) => Promise<RispostaModulo>> = {
  async concorrenti(oggi) {
    const md = await readVaultFile("90-Memoria-AI/Intelligence/radar-concorrenti.md");
    return rispostaConcorrenti(md, md ? dataDaIntestazione(md) : null, oggi);
  },
  async rassegna(oggi) {
    const [noi, citta] = await Promise.all([feed('"MyCity" Piacenza'), feed("Piacenza negozi commercio")]);
    let ultimo: string | null = null;
    if (noi == null && citta == null) {
      const rep = await readVaultFile("90-Memoria-AI/Intelligence/reputazione.md");
      ultimo = rep ? dataDaIntestazione(rep) : null;
    }
    return rispostaRassegna(noi, citta, ultimo, oggi);
  },
  async sicurezza(oggi) {
    return rispostaSicurezza(await leggiJsonVault<any>(RADIOGRAFIA_SITO), oggi);
  },
  async legale(oggi) {
    const [rad, docs, reg] = await Promise.all([
      leggiJsonVault<any>(RADIOGRAFIA_SITO),
      documenti("consegne/legale"),
      leggiJsonVault<any>("05-Soldi-Rischi/REGISTRO-RISCHI.json"),
    ]);
    return rispostaLegale(rad, docs, reg, oggi);
  },
  async esperimenti(oggi) {
    return rispostaEsperimenti(await leggiJsonVault<any>("90-Memoria-AI/esperimenti-crescita.json"), oggi);
  },
  async roadmap(oggi) {
    return rispostaRoadmap(await readVaultFile("90-Memoria-AI/LAVORO-APERTO.md"), oggi);
  },
};

export async function GET(req: NextRequest) {
  const tipo = (new URL(req.url).searchParams.get("tipo") || "").trim();
  if (!eTipoModulo(tipo)) return NextResponse.json({ collegato: false, righe: [], fonti: [], nota: "Casella sconosciuta." }, { status: 400 });
  try {
    return NextResponse.json(await LETTORI[tipo](oggiPiacenza()));
  } catch (e: unknown) {
    const perche = String((e as Error)?.message ?? e).slice(0, 120);
    return NextResponse.json({ collegato: false, righe: [], fonti: [], nota: `Non sono riuscita a leggere le fonti di questa casella (${perche}).` });
  }
}
