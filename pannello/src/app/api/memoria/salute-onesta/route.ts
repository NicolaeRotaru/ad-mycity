import { NextResponse } from "next/server";
import { leggiJsonVault } from "@/lib/vault";
import { messaggioSenzaDato } from "@/lib/esito-lettura";
import { contaDifetti, eChiuso, metaDerivata } from "@/lib/cantiere-snello";
import { listaSicura } from "@/lib/memoria-json";
import { serieSicura } from "@/lib/verdetto-dato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 📈 SALUTE ONESTA — «sto migliorando nel tempo?» come RISPOSTA, non come plateau.
// Porta fedele di cervello/salute-onesta.mjs (stesso calcolo, stesse fonti): legge dal vault
// storico-salute.json (voto_pieno ONESTO, non quello creditato) + cantiere-difetti.json (burn-down)
// e serve la serie onesta all'area Cervello. €0: sola lettura del vault. Spec: cervello/salute-onesta.mjs.

const BASE = "90-Memoria-AI/auto-coscienza";

function giorno(iso: unknown): number | null {
  const t = Date.parse(String(iso || "").slice(0, 10));
  return Number.isNaN(t) ? null : t;
}

export async function GET() {
  // AR-415 — il lettore condiviso, quello che porta il MOTIVO. Con `readVaultFile` un archivio troppo
  // grande diventava `null`, e il messaggio qui sotto diceva a Nicola «ancora nessuno storico»: cioè
  // «non è mai stato fatto» al posto di «non l'ho potuto leggere». Sono due lavori diversi.
  const [sl, cl] = await Promise.all([
    leggiJsonVault<any>(`${BASE}/storico-salute.json`),
    leggiJsonVault<any>(`${BASE}/cantiere-difetti.json`),
  ]);
  const sj = sl.dati;
  const cj = cl.dati;
  if (!sj && !cj) {
    const buco = [sl, cl].find((x) => !x.letto);
    return NextResponse.json({
      collegato: false,
      ...messaggioSenzaDato(
        buco ?? sl,
        "Ancora nessuno storico di salute: la serie onesta cresce a ogni radiografia completa.",
      ),
    });
  }

  // (1) SERIE ONESTA (voto_pieno) — identica a salute-onesta.mjs
  // AR-255: la tolleranza sulle due forme del file (oggetto con `serie`, oppure elenco nudo) era
  // scritta a mano QUI e in nessun altro lettore. Adesso è una funzione sola, condivisa: due lettori
  // dello stesso file non possono più contraddirsi.
  const serie: any[] = serieSicura(sj);
  const conPieno = serie.filter((s) => s && s.voto_pieno != null);
  const ultimoPieno = conPieno.length ? Number(conPieno[conPieno.length - 1].voto_pieno) : null;
  const primoPieno = conPieno.length ? Number(conPieno[0].voto_pieno) : null;
  const ultimi = conPieno.slice(-10);
  const fermiAZero = ultimi.filter((s) => Number(s.voto_pieno) === 0).length;
  let trend = "n/d";
  if (ultimoPieno != null && primoPieno != null) {
    trend = ultimoPieno > primoPieno ? "in salita" : ultimoPieno < primoPieno ? "in discesa" : "PIATTO";
  }

  // (2) BURN-DOWN CANTIERE — identico a salute-onesta.mjs (ancorato all'ultima data del cantiere)
  // AR-253 — `Array.isArray` difende dal tipo sbagliato ma non dai buchi DENTRO la lista: un `null`
  // fra i difetti e `d.nato` due righe più sotto esplode. Stesso lettore delle altre tre letture.
  const difetti: any[] = listaSicura<any>(cj?.difetti);
  const apertiAllaData = (tMs: number) =>
    difetti.filter((d) => {
      const nato = giorno(d.nato);
      if (nato == null || nato > tMs) return false;
      const chiuso = giorno(d.chiuso_il);
      return chiuso == null || chiuso > tMs;
    }).length;
  const dateNote = difetti
    .map((d) => giorno(d.chiuso_il) || giorno(d.nato))
    .filter((x): x is number => x != null);
  const oraMs = dateNote.length ? Math.max(...dateNote) : null;
  const settimanaFaMs = oraMs != null ? oraMs - 7 * 86400000 : null;
  // AR-456 — quanti sono aperti ORA si CONTA sulla lista, non si legge dal riassunto e non si deduce
  // dalle date. Il ripiego di prima era `cj.meta.aperti`, il totale scritto nel file: il 13/8 diceva
  // 223 mentre i non chiusi erano 281. E il conteggio per data lascia fuori in silenzio ogni difetto
  // senza `nato` — un difetto senza data di nascita non è un difetto risolto.
  const conto = contaDifetti(cj?.difetti);
  const apertiOra = cl.letto ? conto.da_fare : null;
  const apertiSettimanaFa = settimanaFaMs != null ? apertiAllaData(settimanaFaMs) : null;
  // Quanti non si possono collocare nel tempo: senza `nato` non si sa se una settimana fa esistevano.
  // Vanno DICHIARATI, non ignorati — altrimenti il burn-down sembra più bello di quanto sia.
  const senzaNato = difetti.filter((d) => !eChiuso(d) && giorno(d.nato) == null).length;
  const burnDown =
    apertiOra != null && apertiSettimanaFa != null ? apertiSettimanaFa - apertiOra : null; // >0 = migliora

  // Sparkline onesto: una voce voto_pieno per giorno (l'ultima), ultime 3 settimane.
  const perGiorno = new Map<string, number>();
  for (const s of conPieno) {
    const g = String(s?.data || "").slice(0, 10);
    if (g) perGiorno.set(g, Number(s.voto_pieno));
  }
  const serieOnesta = [...perGiorno.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-21)
    .map(([data, voto]) => ({ data, voto }));

  return NextResponse.json({
    collegato: true,
    voto_onesto_ultimo: ultimoPieno,
    voto_onesto_trend: trend,
    rilevazioni_con_voto_pieno: conPieno.length,
    su_totale_snapshot: serie.length,
    ultimi10_fermi_a_zero: fermiAZero,
    cantiere_aperti_ora: apertiOra,
    cantiere_aperti_settimana_fa: apertiSettimanaFa,
    burn_down_settimana: burnDown,
    // AR-456 — il meta servito è quello DERIVATO dalla lista, non quello scritto nel file. Porta con
    // sé `scritto` e `divergenza`: se il totale del file torna a invecchiare, lo scarto è già a video.
    cantiere_meta: cj ? metaDerivata(cj) : null,
    cantiere_letto: cl.letto,
    cantiere_senza_data_nascita: senzaNato,
    serie_onesta: serieOnesta,
  });
}
