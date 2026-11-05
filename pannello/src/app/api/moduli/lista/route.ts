import { NextRequest, NextResponse } from "next/server";
import { readVaultFile, readRepoFile, readRepoFileEsito, listRepoDir, leggiJsonVault } from "@/lib/vault";
import { daEsitoJson } from "@/lib/esito-lettura";
import { marketplaceDbConnected, selectRowsEsito } from "@/lib/marketplace-db";
import {
  LIMITE_RIGHE,
  rispostaCalendario,
  rispostaCampagne,
  rispostaCatalogo,
  rispostaContatti,
  rispostaLead,
  rispostaRider,
  type EsitoSito,
} from "@/lib/moduli-operativi";
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
const MAPPA_GIORNALI = "consegne/pr-stampa/2026-08-17-lista-giornalisti.md";

/**
 * Una lettura dal database del sito, con l'esito: non collegato, non ha risposto, o le righe.
 * Le colonne sono quelle VERE delle tabelle (lette il 5/11 da information_schema): PostgREST
 * rifiuta tutta la richiesta se una colonna non esiste, e il rifiuto qui diventa «non letto».
 */
async function dalSito(tabella: string, qs: string): Promise<EsitoSito> {
  if (!marketplaceDbConnected()) return { collegato: false, ok: false, rows: [] };
  const e = await selectRowsEsito(tabella, qs);
  return { collegato: true, ok: e.ok, rows: e.rows };
}

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
    const [rad, supa] = await Promise.all([
      leggiJsonVault<any>(RADIOGRAFIA_SITO),
      leggiJsonVault<any>("90-Memoria-AI/sicurezza-supabase.json"),
    ]);
    return rispostaSicurezza(rad, oggi, supa);
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
  async rider(oggi) {
    const e = await dalSito(
      "profiles",
      `role=eq.rider&select=full_name,is_approved,approval_status,rider_is_online,rider_vehicle_type,rider_license_expires_on,rider_insurance_expires_on,rider_haccp_expires_on,created_at&order=created_at.desc&limit=${LIMITE_RIGHE}`,
    );
    return rispostaRider(e, oggi);
  },
  async catalogo(oggi) {
    const e = await dalSito("products", `select=name,price,stock,status,images,created_at&order=created_at.desc&limit=${LIMITE_RIGHE}`);
    return rispostaCatalogo(e, oggi);
  },
  async lead(oggi) {
    const [reg, leads] = await Promise.all([
      leggiJsonVault<any>("90-Memoria-AI/auto-coscienza/registro-realta.json"),
      dalSito("merchants_leads", `select=name,category,score,rating,reviews_count,outreach_status&order=score.desc.nullslast&limit=${LIMITE_RIGHE}`),
    ]);
    return rispostaLead(reg, leads, oggi);
  },
  async campagne(oggi) {
    const [reg, invii] = await Promise.all([
      leggiJsonVault<any>("90-Memoria-AI/campagne.json"),
      dalSito("outreach_events", `select=channel,sent_at,opened_at,replied_at,bounced&order=sent_at.desc.nullslast&limit=${LIMITE_RIGHE}`),
    ]);
    return rispostaCampagne(reg, invii, oggi);
  },
  async calendario(oggi) {
    const [md, scad] = await Promise.all([
      readVaultFile("90-Memoria-AI/Intelligence/eventi-picchi.md"),
      // Lo scadenzario VIVO è cervello/scadenzario.json: quello nel vault è una copia ferma al 30/7
      // (collaudo del 5/11; cervello/documenti-di-governo.mjs lo dice da sé).
      readRepoFileEsito("cervello/scadenzario.json").then((e) => daEsitoJson<any>(e)),
    ]);
    return rispostaCalendario(md, md ? dataDaIntestazione(md) : null, scad, oggi);
  },
  async contatti(oggi) {
    const md = await readRepoFile(MAPPA_GIORNALI);
    return rispostaContatti(md, MAPPA_GIORNALI.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null, oggi);
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
