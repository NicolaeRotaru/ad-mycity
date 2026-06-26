import { NextResponse } from "next/server";
import { getImpostazione, getImpostazioni, setImpostazione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, statoDa } from "@/lib/azioni-pronte";

export const runtime = "nodejs";

// Autopilota: esegue DA SOLO le azioni SICURE (🟢 verde) ancora non decise.
// - Interruttore "autopilota" salvato in Supabase (impostazioni), spento di default.
// - Stesse cinture delle mani: senza chiave/live → simula o coda. Mai invii a sorpresa.
// - Agisce solo su livello "verde" e solo su azioni non ancora decise (no doppioni).
// - Marca l'esito con "🤖 (automatico)" così si vede che l'ha fatto da solo.
// Può essere chiamato dal pannello all'apertura o, in futuro, da un cron/worker.

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Se il body indica "attiva", aggiorna l'interruttore.
  if (typeof body?.attiva === "boolean") {
    await setImpostazione("autopilota", body.attiva ? "on" : "off");
  }

  const attivo = (await getImpostazione("autopilota")) === "on";
  if (!attivo) return NextResponse.json({ ok: true, attivo: false, eseguite: 0 });

  const blocchi = await tutteLeAzioni();
  const { valori } = await getImpostazioni();
  const sicure = blocchi.filter((b) => b.livello === "verde" && statoDa(valori[`azione:${b.id}`] || "") === "");

  let eseguite = 0;
  for (const a of sicure) {
    const esito = await eseguiAzione({ titolo: a.titolo, canale: a.canale, destinatario: a.destinatario, testo: a.testo });
    await setImpostazione(`azione:${a.id}`, esito.stato);
    await setImpostazione(`azione:${a.id}:nota`, `🤖 (automatico) ${esito.dettaglio}`);
    eseguite++;
  }

  return NextResponse.json({ ok: true, attivo: true, eseguite });
}
