import { NextResponse } from "next/server";
import { cantiereSnello } from "@/lib/cantiere-snello";
import { radiografiaSnella } from "@/lib/radiografia-snella";
import { readVaultFile, readVaultFileEsito } from "@/lib/vault";
import { sanificaListe } from "@/lib/memoria-json";
import { serieSicura } from "@/lib/verdetto-dato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🩻 AUTO-RADIOGRAFIA — la macchina che analizza SÉ STESSA da cima a fondo. Qui leggiamo i digest
// che il workflow/giro scrive nel vault (cartella 90-Memoria-AI/auto-coscienza/) + la lettera a Nicola,
// e li serviamo all'area "Cervello" della Cabina. €0: solo lettura del vault. Spec: cervello/auto-radiografia.md.

const BASE = "90-Memoria-AI/auto-coscienza";

/**
 * AR-449 — LETTURA CON ESITO. Prima questa funzione tornava `null` sia per «il file non c'è» sia
 * per «non sono riuscito a leggerlo», e chi la chiamava trattava il null come lista vuota. Il
 * 2026-07-30, quando `cantiere-difetti.json` ha passato il MiB, la catena ha prodotto la bugia
 * peggiore che questa macchina possa dire: «Nessun difetto aperto 👍» con 162 difetti aperti, per
 * dodici ore. Adesso l'esito viaggia col dato: chi legge sa se sta guardando un vuoto o un buco.
 */
type Letto = { dati: any | null; letto: boolean; motivo?: string };

async function leggiJson(rel: string): Promise<Letto> {
  const esito = await readVaultFileEsito(rel);
  if (esito.stato === "assente") return { dati: null, letto: true }; // il file davvero non c'è: è un'informazione
  if (esito.stato !== "ok" || esito.testo == null) {
    return { dati: null, letto: false, motivo: dettaglioEsito(esito) };
  }
  try {
    return { dati: JSON.parse(esito.testo), letto: true };
  } catch (e: any) {
    // JSON rotto NON è un file vuoto: è un file che c'è e che non sappiamo leggere.
    return { dati: null, letto: false, motivo: `JSON non valido (${String(e?.message || e).slice(0, 120)})` };
  }
}

function dettaglioEsito(e: { stato: string; dettaglio?: string }): string {
  if (e.stato === "troppo-grande") return `file troppo grande per essere servito${e.dettaglio ? ` — ${e.dettaglio}` : ""}`;
  if (e.stato === "auth") return "GitHub ha rifiutato l'accesso (token o permessi)";
  if (e.stato === "github-giu") return "GitHub non raggiungibile";
  return e.dettaglio || e.stato;
}

// 🧹 Come per l'auto-analisi: il giro a volte scrive un voto sporco o un'intera frase in `trend`.
// Nel banner compatto della Plancia (badge shrink-0) quel testo lungo sfonda la card. Sanifichiamo
// ALLA FONTE: voto salute → intero 0-100, trend → token breve (freccia/parola), mai una frase.
function sanificaRadiografia(r: any): void {
  if (!r || typeof r !== "object") return;
  // AR-252 — le liste prima dei numeri: il ricalcolo del voto qui sotto legge `r.dimensioni`, e un
  // elemento vuoto lì dentro basta a portare via la pagina del Cervello. Normalizzate qui, alla fonte,
  // valgono per tutti i consumatori invece che a mano in ogni componente che le disegna.
  sanificaListe(r, {
    dimensioni: "nome",
    domande_per_nicola: "domanda",
    proposte_nuovi_pezzi: "cosa",
    pre_mortem: "scenario",
    benchmark_vs_migliori: "chi",
  });
  const m = String(r.voto_salute_architettura ?? "").match(/-?\d+/);
  if (m) {
    const n = Math.round(Number(m[0]));
    if (Number.isFinite(n)) r.voto_salute_architettura = Math.max(0, Math.min(100, n));
  }
  // Difesa sul baco del 2026-07-07 (voto scritto a 0 dalla completa): un voto <=0 con
  // pilastri votati è impossibile per definizione (è la loro media) → ricalcolala qui,
  // così l'header non mostra mai più "0/100" per un dato corrotto alla fonte.
  const voti = (Array.isArray(r.dimensioni) ? r.dimensioni : [])
    .map((d: any) => Number(d?.voto))
    .filter((v: number) => Number.isFinite(v) && v > 0);
  if (!(Number(r.voto_salute_architettura) > 0) && voti.length) {
    r.voto_salute_architettura = Math.round(voti.reduce((s: number, v: number) => s + v, 0) / voti.length);
  }
  if (r.trend != null) {
    const t = String(r.trend).trim();
    r.trend = t.length > 0 && t.length <= 24 && !/[.:;—]/.test(t) ? t : "";
  }
}

function oreDaDataPiacenza(dataStr: unknown): number | null {
  const m = String(dataStr ?? "").match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  const t = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`).getTime();
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / 3600000;
}

/** Numeri LIVE dal cantiere + sonda: la lista «Radiografia» è una foto dell'audit, il cantiere è il backlog vivo. */
function calcolaLive(radiografia: any, cantiere: any, cantiereLetto = true) {
  const sonda = radiografia?.sonda || {};
  const difetti = Array.isArray(cantiere?.difetti) ? cantiere.difetti : [];
  // AR-449 — se il cantiere NON è stato letto, i conteggi sono `null`, non 0. Zero è un fatto
  // («non ci sono difetti aperti»); null è l'assenza di un fatto («non lo so»). Confonderli è
  // esattamente ciò che ha fatto dire alla Cabina «Nessun difetto aperto 👍» con 162 aperti.
  const conta = (stato: string) => (cantiereLetto ? difetti.filter((d: any) => d?.stato === stato).length : null);
  const aperti = conta("aperto");
  const in_corso = conta("in-corso");
  const chiusi = conta("chiuso");
  const oreScan = oreDaDataPiacenza(radiografia?.data);
  const oreSonda = oreDaDataPiacenza(sonda.data);
  const votoSonda = typeof sonda.voto_provvisorio === "number" ? sonda.voto_provvisorio : null;
  const votoScan = Number(radiografia?.voto_salute_architettura);
  // Preferisci la sonda se è più fresca dello scan completo (tipico dopo fix mergiati).
  const usaSonda = votoSonda != null && (oreSonda ?? Infinity) <= (oreScan ?? Infinity) + 1;
  const voto = usaSonda ? votoSonda : (Number.isFinite(votoScan) ? votoScan : votoSonda);
  return {
    voto: Number.isFinite(voto) ? voto : null,
    fonte_voto: usaSonda ? "sonda" : "scan",
    data_sonda: sonda.data || null,
    data_scan: radiografia?.data || null,
    cantiere_aggiornato: cantiere?.aggiornato || null,
    aperti,
    in_corso,
    chiusi,
    da_fare: aperti == null || in_corso == null ? null : aperti + in_corso,
    cantiere_letto: cantiereLetto,
    findings_aperti: typeof radiografia?.sync_scan?.findings_aperti === "number"
      ? radiografia.sync_scan.findings_aperti
      : null,
    findings_in_corso: typeof radiografia?.sync_scan?.findings_in_corso === "number"
      ? radiografia.sync_scan.findings_in_corso
      : null,
    sync_aggiornato: radiografia?.sync_scan?.aggiornato || null,
    scan_ore_fa: oreScan != null ? Math.round(oreScan) : null,
    sonda_ore_fa: oreSonda != null ? Math.round(oreSonda) : null,
    scan_stale: oreScan != null && oreScan > 48,
  };
}

export async function GET() {
  const [radiografiaL, cantiereL, storicoL, watchlistL, lettera] = await Promise.all([
    leggiJson(`${BASE}/auto-radiografia.json`),
    leggiJson(`${BASE}/cantiere-difetti.json`),
    leggiJson(`${BASE}/storico-salute.json`),
    leggiJson(`${BASE}/watchlist-riferimenti.json`),
    readVaultFile(`${BASE}/LETTERA-A-NICOLA.md`),
  ]);
  const radiografia = radiografiaL.dati;
  const cantiere = cantiereL.dati;
  const storico = storicoL.dati;
  const watchlist = watchlistL.dati;

  sanificaRadiografia(radiografia); // voto→intero 0-100, trend→token breve (niente frasi che sfondano il banner)
  const collegato = Boolean(radiografia || cantiere);
  if (!collegato) {
    // AR-449 — due silenzi diversi, due messaggi diversi. «Non l'ho ancora fatta» è un fatto;
    // «non sono riuscito a leggerla» è un guasto, e spacciarlo per il primo manda Nicola a rilanciare
    // una radiografia che esiste già mentre il problema è altrove.
    const buchi = [radiografiaL, cantiereL].filter((x) => !x.letto);
    if (buchi.length) {
      return NextResponse.json({
        collegato: false,
        letto: false,
        messaggio: `Non sono riuscito a leggere la radiografia: ${buchi.map((b) => b.motivo).join(" · ")}. Il dato può esserci: quello che manca è la lettura.`,
      });
    }
    return NextResponse.json({
      collegato: false,
      letto: true,
      messaggio:
        "La macchina non ha ancora fatto la radiografia di sé. Lancia «radiografia di te stesso» (cervello/auto-radiografia.md) per generare il primo verdetto sulla propria architettura.",
    });
  }
  // I totali si calcolano sul cantiere INTERO, prima di snellirlo: se li leggesse dalla versione
  // ridotta, «135 chiusi» diventerebbe «40 chiusi» e la Cabina mentirebbe per troncamento.
  const live = calcolaLive(radiografia, cantiere, cantiereL.letto);

  // AR-449 — i buchi di lettura viaggiano col dato, così la scheda può dire «non l'ho letto» invece
  // di disegnare uno zero. Un file che manca DAVVERO non finisce qui: quello è un fatto, non un buco.
  const nonLetti = [
    { file: "auto-radiografia.json", ...radiografiaL },
    { file: "cantiere-difetti.json", ...cantiereL },
    { file: "storico-salute.json", ...storicoL },
    { file: "watchlist-riferimenti.json", ...watchlistL },
  ]
    .filter((x) => !x.letto)
    .map((x) => ({ file: x.file, motivo: x.motivo || "lettura fallita" }));

  // AR-250/AR-221 — si compone la risposta invece di inoltrare il file. Misurato il 28/7: il cantiere
  // intero è 607.409 byte per 271 difetti, riscaricati ogni 30 secondi sul telefono; con i soli campi
  // che la scheda disegna scende a ~106 KB. L'83% che viaggiava non veniva mostrato da nessuno.
  const cantiereRidotto = cantiereSnello(cantiere);

  // La metà più grossa, dichiarata scoperta nel lotto 20 e chiusa qui. `auto-radiografia.json` è
  // 614.805 byte e viaggiava intero: dentro, 109 findings CHIUSI pesano 338.175 byte e il componente
  // li filtra via prima di disegnarli (RadiografiaDiSe.tsx:278). Andavano e venivano per essere
  // scartati all'arrivo. Ora dei chiusi resta il conteggio — che serve — e non il contenuto.
  const radiografiaRidotta = radiografiaSnella(radiografia);
  // AR-255 — lo storico si NORMALIZZA qui, non in chi lo disegna. Lo stesso file era letto da due
  // strade con due tolleranze diverse: `salute-onesta` accettava anche l'elenco nudo in cima al file
  // (forma che si è già presentata davvero), questa lo inoltrava tale e quale. Risultato: nella
  // stessa pagina un riquadro mostrava la storia e l'altro il vuoto — e il vuoto si legge come
  // «non c'è storia». Ora la forma la decide una funzione sola, al confine dell'atto.
  return NextResponse.json({ collegato: true, live, non_letti: nonLetti, radiografia: radiografiaRidotta, cantiere: cantiereRidotto, storico: { serie: serieSicura(storico) }, watchlist, lettera });
}
