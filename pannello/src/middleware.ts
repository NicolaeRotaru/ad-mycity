import { NextRequest, NextResponse } from "next/server";
import { decidiAccesso } from "@/lib/serratura";

/**
 * AR-226 — SERRATURA SULLE ROTTE CHE MUTANO STATO.
 *
 * Il difetto: 33 handler che modificano lo stato in 30 file di route, e UNO SOLO (heartbeat, con
 * CRON_SECRET) aveva un controllo in ingresso. Nessun middleware esisteva. Chiunque conoscesse
 * l'indirizzo poteva, con un semplice `curl -X POST`, spegnere la PAUSA, accendere l'autopilota e —
 * via /api/lavori — far eseguire istruzioni arbitrarie all'agente che gira sul VPS.
 *
 * ⚠️ ONESTÀ SU COSA QUESTO PROTEGGE E COSA NO.
 *
 * Senza un login, il server NON può distinguere il browser di Nicola dal browser di uno sconosciuto:
 * entrambi mandano richieste same-origin legittime. Quindi:
 *
 *   ✅ CHIUDE: le chiamate da script che non fingono gli header (il caso `curl` puro); le richieste
 *      cross-site (CSRF); le chiamate macchina senza il token condiviso.
 *   ❌ NON CHIUDE: «chiunque abbia l'indirizzo apre il Pannello e usa i pulsanti». Quella è
 *      autenticazione e va fatta a monte — Vercel → Settings → Deployment Protection → Vercel
 *      Authentication. Finché è spenta, questo file è solo il secondo battente.
 *
 * Per questo AR-226 ha `verifica: {tipo:"umano"}` e NON si chiude da solo con questo commit.
 *
 * La decisione vera vive in @/lib/serratura (funzione pura, senza import di Next): `next/server` non
 * è importabile fuori da Next, quindi una logica di sicurezza scritta qui dentro si potrebbe solo
 * rileggere, mai eseguire in un test — la stessa forma di prova debole che il 27/7 ha lasciato
 * passare 91 chiusure false. Così invece cervello/test/pannello-serratura.test.mjs la esegue davvero.
 *
 * Fail-closed: non esiste una variabile che spenga il controllo. Un cancello che si può spegnere è
 * il difetto che questa radiografia ha trovato dappertutto.
 */
export function middleware(req: NextRequest) {
  const verdetto = decidiAccesso({
    metodo: req.method,
    percorso: req.nextUrl.pathname,
    header: {
      "sec-fetch-site": req.headers.get("sec-fetch-site"),
      origin: req.headers.get("origin"),
      host: req.headers.get("host"),
      authorization: req.headers.get("authorization"),
      "x-pannello-token": req.headers.get("x-pannello-token"),
    },
    tokenAtteso: process.env.PANNELLO_TOKEN,
  });

  if (verdetto.ammessa) return NextResponse.next();
  return NextResponse.json({ ok: false, error: verdetto.motivo, dettaglio: verdetto.dettaglio }, { status: 401 });
}

export const config = {
  // Solo le API: le pagine restano servite normalmente (e la loro protezione è Vercel Authentication).
  matcher: ["/api/:path*"],
};
