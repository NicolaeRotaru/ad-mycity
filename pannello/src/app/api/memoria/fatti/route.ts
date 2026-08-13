import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { statoCoerenza } from "@/lib/badge-coerenza";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🧭 FONTE UNICA DELLA VERITÀ (AR-102). I fatti-chiave del business (negozio faro, date decise,
// target, strategia, policy) vivono in registro-fatti.json e SOLO lì. Qui li serviamo al Pannello
// così le schede leggono IL fatto (una casa sola) invece di ri-derivarlo dalla prosa di
// STATO/intenzioni/briefing — che vanno in ritardo e divergono. Serviamo anche il verdetto del
// guardiano (coerenza-fatti.json) per il badge «memoria coerente / N copie vecchie in giro».
// NB: qui stanno i fatti DECISI, non i numeri vivi (clienti/ordini/prodotti) — quelli restano dal DB.

type FattoRaw = { id?: string; nome?: string; valore?: string; fonte?: string; aggiornato?: string };
type Fatto = { id: string; nome: string; valore: string; fonte: string; aggiornato: string };

async function leggiJson(rel: string): Promise<any | null> {
  const raw = await readVaultFile(rel);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  const registro = await leggiJson("90-Memoria-AI/registro-fatti.json");
  if (!registro || !Array.isArray(registro.fatti)) {
    return NextResponse.json({ collegato: false, aggiornato: "", fatti: [], coerenza: null });
  }

  const fatti: Fatto[] = registro.fatti
    .filter((f: FattoRaw) => f && f.id && f.valore != null)
    .map((f: FattoRaw) => ({
      id: String(f.id),
      nome: String(f.nome || f.id),
      valore: String(f.valore),
      fonte: String(f.fonte || ""),
      aggiornato: String(f.aggiornato || ""),
    }));

  // Verdetto del guardiano di coerenza (scritto da cervello/coerenza-fatti.mjs a ogni giro).
  // AR-646 — la mappa degli esiti è ESAUSTIVA e fail-closed: sta in un modulo puro con la sua prova,
  // perché la forma di prima (`=== "incoerenze" ? … : "ok"`) faceva del verde il ramo di default, e
  // così «cieco» e «non_verificato» arrivavano a Nicola come lo scudo «Memoria coerente».
  const cf = await leggiJson("90-Memoria-AI/auto-coscienza/coerenza-fatti.json");
  const coerenza = cf
    ? {
        esito: statoCoerenza(cf.esito),
        incoerenze: Array.isArray(cf.incoerenze) ? cf.incoerenze.length : 0,
        cacce_aperte: Number(cf.cacce_aperte) || 0,
        data: String(cf.data || ""),
      }
    : null;

  return NextResponse.json({ collegato: true, aggiornato: String(registro.aggiornato || ""), fatti, coerenza });
}
