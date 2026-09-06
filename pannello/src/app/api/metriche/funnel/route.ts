import { NextResponse } from "next/server";
import { marketplaceDbConnected, leggiCarrelli, selectRowsEsito } from "@/lib/marketplace-db";
import { getPostHog } from "@/lib/posthog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🫗 FUNNEL DI CONVERSIONE (Ondata 2.2) — macro-funnel a 7 giorni con i dati certi:
// Visitatori (PostHog) → Ordini avviati (DB) → Ordini pagati (DB), con il calo per
// passo. Mostra anche i carrelli abbandonati come "perdita". Il funnel granulare
// (vista prodotto, add-to-cart) vive negli eventi PostHog: si aggancia quando la
// tassonomia eventi del marketplace è confermata.
type Step = { nome: string; valore: number; conv?: number };

export async function GET() {
  const ph = await getPostHog().catch(() => ({ connected: false }) as any);
  if (!marketplaceDbConnected() && !ph?.connected) return NextResponse.json({ collegato: false, steps: [] });

  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  // 3/9/2026 — QUI STAVA LO STESSO ZERO BUGIARDO CHE ABBIAMO TOLTO DALL'ALTRA SCHERMATA.
  //
  // Questa riga chiedeva `abandoned_carts.created_at`, colonna che nel sito non esiste (la tabella
  // nasce con `last_activity`). PostgREST rifiuta la richiesta INTERA, quindi la lista tornava
  // vuota e Nicola leggeva «0 carrelli abbandonati» in grassetto. «Nessuno lascia il carrello» e
  // «non l'ho misurato» sono due notizie opposte, e la Cabina mostrava la prima avendo in mano la
  // seconda. Ora la lettura passa da `leggiCarrelli`, che sa quali colonne esistono davvero, e se
  // la lettura fallisce il numero esce `null`: la Cabina disegna «—», non uno zero.
  const [ordersR, cartsR] = await Promise.all([
    marketplaceDbConnected()
      ? selectRowsEsito("orders", `select=payment_status,created_at&created_at=gte.${since}&limit=10000`)
      : Promise.resolve({ rows: [], ok: false }),
    marketplaceDbConnected() ? leggiCarrelli() : Promise.resolve({ rows: [], ok: false, conRecupero: false }),
  ]);
  const orders = ordersR.rows;

  // Lo stesso ragionamento dei carrelli vale per gli ordini: se la lettura non e' riuscita,
  // «0 ordini pagati · 0%» e' una notizia falsa, non un dato. La revisione l'ha trovato qui
  // dentro subito dopo la prima riparazione: la malattia era la stessa, il punto un altro.
  const ordiniAvviati = ordersR.ok ? orders.filter((o) => o.payment_status !== "FAILED").length : null;
  const ordiniPagati = ordersR.ok ? orders.filter((o) => o.payment_status === "PAID").length : null;
  const visitatori = ph?.connected ? Number(ph.visitatori_7g) || 0 : null;
  // La finestra dei sette giorni si applica qui, sul campo che esiste davvero.
  const dalSecondo = Date.parse(since);
  // Un carrello recuperato non e' un carrello abbandonato: l'altra schermata lo scarta gia',
  // e due schermate che contano la stessa cosa in due modi diversi sono peggio di una sola.
  const carrelliAbbandonati = cartsR.ok
    ? cartsR.rows.filter((c: any) => {
        if (c.recovered === true) return false;
        const quando = Date.parse(c.last_activity ?? "");
        return Number.isFinite(quando) ? quando >= dalSecondo : false;
      }).length
    : null;

  const steps: Step[] = [];
  if (visitatori != null) steps.push({ nome: "Visitatori (7g)", valore: visitatori });
  if (ordiniAvviati != null) steps.push({ nome: "Ordini avviati", valore: ordiniAvviati });
  if (ordiniPagati != null) steps.push({ nome: "Ordini pagati", valore: ordiniPagati });
  // Conversione di ogni passo rispetto al precedente.
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1].valore;
    steps[i].conv = prev > 0 ? Math.round((steps[i].valore / prev) * 1000) / 10 : 0;
  }

  return NextResponse.json({
    collegato: true,
    steps,
    carrelli_abbandonati_7g: carrelliAbbandonati,
    carrelli_misurati: cartsR.ok,
    ordini_misurati: ordersR.ok,
    traffico_collegato: Boolean(ph?.connected),
    nota: visitatori == null ? "Collega PostHog per il passo Visitatori e il tasso di conversione dal traffico." : null,
  });
}
