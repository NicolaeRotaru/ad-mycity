import { NextResponse } from "next/server";
import { getMetriche } from "@/lib/marketplace-db";
import { readVaultFile, readRepoFile } from "@/lib/vault";
import { freschezza, oggiPiacenza, sogliaPerScheda } from "@/lib/freschezza-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Alert anomalie: regole sui dati reali del marketplace → segnali 🔴/🟡 con
// "perché" e "cosa fare". Sincrono e senza dipendenze esterne.
// `id` STABILE (S-xxx): è la stessa chiave dell'azione che la sentinella genera
// (vedi lib/sentinelle.ts), così il link "Da approvare → origine" atterra sulla casella esatta.
type Alert = { id: string; livello: "rosso" | "giallo"; titolo: string; perche: string; cosaFare: string };

// 📆 L'ALLARME CHE MANCAVA (Nicola, 2026-08-10): «la data la dovrà leggere un sentinello per
// segnalarlo alla macchina o a me». Una data mostrata sulla scheda serve solo a chi la sta
// guardando in quel momento; il guasto del 20 luglio è passato inosservato perché nessuno stava
// guardando quella scheda. Qui l'invecchiamento diventa un ALERT: compare in cima alla card, dove
// Nicola guarda comunque, senza doversi ricordare di controllare le altre schede una per una.
// Non dipende dalle chiavi del marketplace — vive nel vault, quindi si calcola sempre.
const SCHEDE_INTEL = [
  { id: "concorrenti", file: "radar-concorrenti", etichetta: "Concorrenti" },
  { id: "eventi", file: "eventi-picchi", etichetta: "Eventi & picchi" },
  { id: "buchi", file: "buchi-mercato", etichetta: "Buchi di mercato" },
  { id: "leve", file: "leve-uscita", etichetta: "Leve in uscita" },
  { id: "reputazione", file: "reputazione", etichetta: "Reputazione" },
];

async function alertIntelligenceVecchia(): Promise<Alert[]> {
  let radar: unknown = null;
  try {
    const grezzo = await readRepoFile("cervello/radar-fonti.json");
    radar = grezzo ? JSON.parse(grezzo) : null;
  } catch {
    radar = null;
  }
  const oggi = oggiPiacenza();
  const vecchie: { etichetta: string; giorni: number | null }[] = [];
  for (const s of SCHEDE_INTEL) {
    const testo = await readVaultFile(`90-Memoria-AI/Intelligence/${s.file}.md`);
    const f = freschezza(testo, sogliaPerScheda(radar, s.file), oggi);
    if (f.scaduta) vecchie.push({ etichetta: s.etichetta, giorni: f.giorni });
  }
  if (vecchie.length === 0) return [];
  const peggiore = vecchie.reduce((a, b) => ((b.giorni ?? 0) > (a.giorni ?? 0) ? b : a));
  // 🔴 quando è ferma tutta la card: non è una scheda dimenticata, è il monitoraggio che non gira.
  const tutte = vecchie.length === SCHEDE_INTEL.length;
  return [
    {
      id: "S-intel-vecchia",
      livello: tutte ? "rosso" : "giallo",
      titolo: tutte
        ? `Intelligence ferma: nessuna scheda si aggiorna da ${peggiore.giorni} giorni`
        : `${vecchie.length} analisi vecchie (${peggiore.etichetta}: ${peggiore.giorni} giorni)`,
      perche: tutte
        ? "Nessuna delle cinque analisi si sta più aggiornando: di solito vuol dire che il monitoraggio del mattino non gira (motore AI in limite o server fermo)."
        : `Queste analisi hanno superato la loro scadenza: ${vecchie.map((v) => `${v.etichetta} (${v.giorni}g)`).join(", ")}.`,
      cosaFare: tutte
        ? "Controlla il motore AI sul server: se è in limite riparte da solo, altrimenti serve rifare il collegamento. Poi «Aggiorna analisi» sulle schede."
        : "Premi «Aggiorna analisi» sulle schede vecchie, oppure aspetta il monitoraggio di domani mattina.",
    },
  ];
}

export async function GET() {
  const intel = await alertIntelligenceVecchia();
  const m = await getMetriche();
  if (!m.connected) return NextResponse.json({ collegato: false, alert: intel, metriche: m });
  const n = (k: string) => Number(m[k] || 0);
  // Le analisi vecchie vanno IN CIMA: un dato scaduto falsa la lettura di tutti gli altri.
  const alert: Alert[] = [...intel];

  if (n("problemi") > 0)
    alert.push({ id: "S-problemi", livello: "rosso", titolo: `${n("problemi")} consegne annullate`, perche: "Ci sono ordini con consegna CANCELED.", cosaFare: "Operations: verifica la causa e contatta i clienti coinvolti." });
  const rec = n("recensione_media");
  if (rec > 0 && rec < 3.5)
    alert.push({ id: "S-recensioni", livello: "rosso", titolo: `Recensioni basse (${rec}/5)`, perche: "La media voti è sotto 3.5.", cosaFare: "Supporto/QA: indaga i reclami e correggi l'esperienza." });
  if (n("ordini_oggi") === 0)
    alert.push({ id: "S-noordini", livello: "giallo", titolo: "Nessun ordine oggi", perche: "Oggi non è ancora arrivato nessun ordine.", cosaFare: "Spingi un nudge: post, recupero carrelli, promemoria clienti." });
  if (n("carrelli") >= 3)
    alert.push({ id: "S-carrelli", livello: "giallo", titolo: `${n("carrelli")} carrelli abbandonati`, perche: "Clienti che non hanno completato l'acquisto.", cosaFare: "CRM: attiva il recupero carrelli." });
  if (n("clienti_dormienti") >= 5)
    alert.push({ id: "S-dormienti", livello: "giallo", titolo: `${n("clienti_dormienti")} clienti dormienti`, perche: "Non ordinano da oltre 30 giorni.", cosaFare: "CRM: campagna win-back mirata." });
  if (n("consegne_in_corso") > 0 && n("tempo_consegna_min") > 90)
    alert.push({ id: "S-consegne-lente", livello: "giallo", titolo: `Consegne lente (${n("tempo_consegna_min")} min medi)`, perche: "Tempo medio di consegna alto.", cosaFare: "Operations: rivedi i giri e la copertura rider nei picchi." });
  if (n("negozi") < 3)
    alert.push({ id: "S-pochinegozi", livello: "giallo", titolo: `Pochi negozi (${n("negozi")})`, perche: "L'offerta è ancora limitata.", cosaFare: "Vendite: accelera l'onboarding di nuove botteghe." });

  return NextResponse.json({ collegato: true, alert, metriche: m });
}
