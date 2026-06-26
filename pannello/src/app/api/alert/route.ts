import { NextResponse } from "next/server";
import { getMetriche } from "@/lib/marketplace-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Alert anomalie: regole sui dati reali del marketplace → segnali 🔴/🟡 con
// "perché" e "cosa fare". Sincrono e senza dipendenze esterne.
type Alert = { livello: "rosso" | "giallo"; titolo: string; perche: string; cosaFare: string };

export async function GET() {
  const m = await getMetriche();
  if (!m.connected) return NextResponse.json({ collegato: false, alert: [], metriche: m });
  const n = (k: string) => Number(m[k] || 0);
  const alert: Alert[] = [];

  if (n("problemi") > 0)
    alert.push({ livello: "rosso", titolo: `${n("problemi")} consegne annullate`, perche: "Ci sono ordini con consegna CANCELED.", cosaFare: "Operations: verifica la causa e contatta i clienti coinvolti." });
  const rec = n("recensione_media");
  if (rec > 0 && rec < 3.5)
    alert.push({ livello: "rosso", titolo: `Recensioni basse (${rec}/5)`, perche: "La media voti è sotto 3.5.", cosaFare: "Supporto/QA: indaga i reclami e correggi l'esperienza." });
  if (n("ordini_oggi") === 0)
    alert.push({ livello: "giallo", titolo: "Nessun ordine oggi", perche: "Oggi non è ancora arrivato nessun ordine.", cosaFare: "Spingi un nudge: post, recupero carrelli, promemoria clienti." });
  if (n("carrelli") >= 3)
    alert.push({ livello: "giallo", titolo: `${n("carrelli")} carrelli abbandonati`, perche: "Clienti che non hanno completato l'acquisto.", cosaFare: "CRM: attiva il recupero carrelli." });
  if (n("clienti_dormienti") >= 5)
    alert.push({ livello: "giallo", titolo: `${n("clienti_dormienti")} clienti dormienti`, perche: "Non ordinano da oltre 30 giorni.", cosaFare: "CRM: campagna win-back mirata." });
  if (n("consegne_in_corso") > 0 && n("tempo_consegna_min") > 90)
    alert.push({ livello: "giallo", titolo: `Consegne lente (${n("tempo_consegna_min")} min medi)`, perche: "Tempo medio di consegna alto.", cosaFare: "Operations: rivedi i giri e la copertura rider nei picchi." });
  if (n("negozi") < 3)
    alert.push({ livello: "giallo", titolo: `Pochi negozi (${n("negozi")})`, perche: "L'offerta è ancora limitata.", cosaFare: "Vendite: accelera l'onboarding di nuove botteghe." });

  return NextResponse.json({ collegato: true, alert, metriche: m });
}
