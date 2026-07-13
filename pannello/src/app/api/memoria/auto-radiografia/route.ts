import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🩻 AUTO-RADIOGRAFIA — la macchina che analizza SÉ STESSA da cima a fondo. Qui leggiamo i digest
// che il workflow/giro scrive nel vault (cartella 90-Memoria-AI/auto-coscienza/) + la lettera a Nicola,
// e li serviamo all'area "Cervello" della Cabina. €0: solo lettura del vault. Spec: cervello/auto-radiografia.md.

const BASE = "90-Memoria-AI/auto-coscienza";

async function leggiJson(rel: string): Promise<any | null> {
  const raw = await readVaultFile(rel);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// 🧹 Come per l'auto-analisi: il giro a volte scrive un voto sporco o un'intera frase in `trend`.
// Nel banner compatto della Plancia (badge shrink-0) quel testo lungo sfonda la card. Sanifichiamo
// ALLA FONTE: voto salute → intero 0-100, trend → token breve (freccia/parola), mai una frase.
function sanificaRadiografia(r: any): void {
  if (!r || typeof r !== "object") return;
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
function calcolaLive(radiografia: any, cantiere: any) {
  const sonda = radiografia?.sonda || {};
  const difetti = Array.isArray(cantiere?.difetti) ? cantiere.difetti : [];
  const aperti = difetti.filter((d: any) => d?.stato === "aperto").length;
  const in_corso = difetti.filter((d: any) => d?.stato === "in-corso").length;
  const chiusi = difetti.filter((d: any) => d?.stato === "chiuso").length;
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
    da_fare: aperti + in_corso,
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
  const [radiografia, cantiere, storico, watchlist, lettera] = await Promise.all([
    leggiJson(`${BASE}/auto-radiografia.json`),
    leggiJson(`${BASE}/cantiere-difetti.json`),
    leggiJson(`${BASE}/storico-salute.json`),
    leggiJson(`${BASE}/watchlist-riferimenti.json`),
    readVaultFile(`${BASE}/LETTERA-A-NICOLA.md`),
  ]);

  sanificaRadiografia(radiografia); // voto→intero 0-100, trend→token breve (niente frasi che sfondano il banner)
  const collegato = Boolean(radiografia || cantiere);
  if (!collegato) {
    return NextResponse.json({
      collegato: false,
      messaggio:
        "La macchina non ha ancora fatto la radiografia di sé. Lancia «radiografia di te stesso» (cervello/auto-radiografia.md) per generare il primo verdetto sulla propria architettura.",
    });
  }
  const live = calcolaLive(radiografia, cantiere);
  return NextResponse.json({ collegato: true, live, radiografia, cantiere, storico, watchlist, lettera });
}
