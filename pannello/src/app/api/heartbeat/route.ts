import { NextRequest, NextResponse } from "next/server";
import { getLatestBriefing, creaLavoro, memoryConnected, setImpostazione, getImpostazione } from "@/lib/store";
import { eseguiAutopilota } from "@/lib/autopilota";
import { accodaPlaybookDelGiorno } from "@/lib/playbook";
import { aiConfigurato, pensa } from "@/lib/ai";
import { tutteLeAzioni } from "@/lib/azioni-pronte";
import { verificaQualita } from "@/lib/qualita";
import { difesaBattito } from "@/lib/serratura";
import { chiusuraAtto } from "@/lib/cancello-atto";

// 📚 Auto-miglioramento: i problemi di qualità più ricorrenti, da dare in pasto al cervello.
async function lezioniRicorrenti(): Promise<string> {
  try {
    const az = await tutteLeAzioni();
    const m: Record<string, number> = {};
    for (const a of az) for (const p of verificaQualita(a).problemi) m[p] = (m[p] || 0) + 1;
    const top = Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 3);
    return top.length ? top.map(([p, n]) => `${p} (${n}x)`).join("; ") : "";
  } catch {
    return "";
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// "Aggiorna ora" / il cron giornaliero.
// IMPORTANTE: questo endpoint NON usa le API di Claude (nessun costo a token).
// Il "cervello" gira su Claude Code (piano Max) tramite cervello/giro.ps1 (programmato)
// o tramite il worker della coda lavori (cervello/worker.ps1). Qui ci limitiamo a:
//   1) se la memoria e' collegata, ACCODARE un "giro" che il cervello-Max eseguira';
//   2) restituire l'ULTIMO briefing gia' salvato in memoria, cosi' la dashboard lo mostra.
// Sicurezza cron: la difesa di questa porta è `difesaBattito` in lib/serratura.ts — la STESSA
// funzione che l'elenco delle rotte esenti dichiara accanto all'esenzione, così il motivo scritto e
// il codice non possono divergere.
//
// AR-410: prima il controllo era `if (secret && auth !== …)`, cioè esisteva solo se qualcuno aveva
// messo la chiave. Senza CRON_SECRET la porta era aperta a chiunque — e questa è l'unica porta del
// Pannello che accoda lavori all'agente sul VPS e fa partire l'autopilota senza che nessuno clicchi.
// Un cancello che si spegne togliendo una variabile non è un cancello: adesso, senza chiave, dal di
// fuori si prende un 503 «battito non configurato». Il pulsante «Aggiorna ora» continua a funzionare
// perché arriva dal Pannello stesso (same-origin), che è la strada che la serratura accetta per ogni
// altra rotta che scrive.
async function handle(req: NextRequest, accodaGiro: boolean) {
  const verdetto = difesaBattito({
    segreto: process.env.CRON_SECRET,
    header: {
      authorization: req.headers.get("authorization"),
      "sec-fetch-site": req.headers.get("sec-fetch-site"),
      origin: req.headers.get("origin"),
      host: req.headers.get("host"),
    },
  });
  if (!verdetto.ammessa) {
    return NextResponse.json({ ok: false, error: verdetto.motivo }, { status: verdetto.status });
  }

  // Com'è andata la registrazione del battito: viaggia fino alla risposta invece di sparire.
  let battito: ReturnType<typeof chiusuraAtto> = { ok: true, fallite: [], status: 200, messaggio: "" };
  let lavoroAccodato: boolean | null = null;
  let playbookAccodati: boolean | null = null;
  let pensieroSalvato: boolean | null = null;

  // 1) Chiedi al cervello-Max un nuovo giro (best-effort, solo se c'e' la memoria).
  if (accodaGiro && memoryConnected()) {
    // Il lavoro accodato è il motivo per cui esiste questo endpoint: se non nasce, dirlo. Prima
    // un catch che ingoiava faceva sparire la differenza fra «giro accodato» e «giro mai nato», e la
    // Cabina mostrava comunque il briefing vecchio come se il cervello stesse lavorando.
    lavoroAccodato = await creaLavoro(
      "Fai un GIRO DI PERLUSTRAZIONE come AD di MyCity (vedi cervello/giro.md): leggi i dati reali, " +
        "sintetizza un briefing (situazione + opportunita' + azioni 🟢🟡🔴) e SALVALO in memoria (tabella briefings) " +
        "cosi' compare nel Pannello.",
      "giro"
    ).then(
      (l) => Boolean(l),
      () => false,
    );

    // 1-bis) BATTITO GRATIS (€0, nessuna API): esegue da solo le azioni SICURE 🟢
    // ancora non decise. Se l'autopilota è spento o non c'è nulla, non fa niente.
    const auto = await eseguiAutopilota().catch(() => ({ eseguite: 0 }));

    // 1-ter) ARSENALE (€0): accoda al cervello i playbook "dovuti" oggi (dedup giornaliero).
    playbookAccodati = await accodaPlaybookDelGiorno().then(
      () => true,
      () => false,
    );

    // 1-quater) Registra il battito (per la card "Cuore" nella Cabina).
    // L'esito si guarda: un battito che non si è scritto fa apparire il cuore fermo nella Cabina, e
    // quello è il segnale su cui Nicola decide se la macchina è viva. Non lo si nasconde.
    battito = chiusuraAtto({
      scritture: [
        { nome: "ora dell'ultimo battito", ok: await setImpostazione("cuore:ultimo", new Date().toISOString()).catch(() => false) },
        { nome: "azioni eseguite dal battito", ok: await setImpostazione("cuore:eseguite", String(auto.eseguite || 0)).catch(() => false) },
      ],
      attoEseguito: true,
    });

    // 1-quinquies) PENSIERO DEL GIORNO (a pagamento ma a contagocce): solo se c'è la
    // chiave AI e il budget regge, e UNA volta al giorno (dedup). Senza chiave: €0, salta.
    if (aiConfigurato()) {
      const oggi = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
      const fattoOggi = await getImpostazione("cuore:pensiero:data").catch(() => null);
      if (fattoOggi !== oggi) {
        // Prenoto la data PRIMA di chiamare: due esecuzioni ravvicinate (cron + click)
        // non spendono due volte. Se la chiamata fallisce, oggi niente pensiero (€0).
        //
        // Stessa malattia della corsia: la prenotazione ingoiava il proprio errore, cioè se non si
        // scriveva si spendeva lo stesso — e il battito dopo rispendeva, perché la data non c'era.
        // Una prenotazione di cui non si guarda l'esito non prenota niente.
        const prenotata = await setImpostazione("cuore:pensiero:data", oggi).catch(() => false);
        if (!prenotata) return rispostaBriefing(battito, { lavoroAccodato, playbookAccodati, pensieroSalvato: false });
        // Auto-miglioramento: passa al cervello le lezioni (errori di qualità ricorrenti).
        const lezioni = await lezioniRicorrenti();
        // Anche qui l'esito si raccoglie invece di sparire: se le lezioni non si salvano, il
        // pensiero del giorno esce comunque (sono un contorno), ma il fatto non si perde.
        const lezioniSalvate = lezioni
          ? await setImpostazione("lezioni-qualita", lezioni).then(
              (ok) => ok,
              () => false,
            )
          : true;
        const pensiero = await pensa({
          prompt:
            "Sei l'AD di MyCity (marketplace negozi di Piacenza, fase 0→1). In massimo 3 righe: le 3 priorità di OGGI verso la North Star (ordini consegnati). Concreto, niente numeri inventati." +
            (lezioni ? ` Tieni presente ed EVITA questi errori ricorrenti nelle mosse: ${lezioni}.` : ""),
          maxToken: 300,
        }).catch(() => null);
        // Il pensiero è già stato PAGATO: se non si salva, non lo si può rifare oggi (la data è
        // prenotata). Farlo sparire in silenzio significa che Nicola legge quello di ieri credendo
        // sia di oggi. L'esito viaggia fino alla risposta.
        pensieroSalvato = pensiero
          ? await setImpostazione("cuore:pensiero", pensiero).then(
              (ok) => ok && lezioniSalvate,
              () => false,
            )
          : null;
      }
    }
  }

  // 2) Mostra l'ultimo briefing che il cervello-Max ha gia' salvato.
  return rispostaBriefing(battito, { lavoroAccodato, playbookAccodati, pensieroSalvato });
}

type Timbri = { lavoroAccodato: boolean | null; playbookAccodati: boolean | null; pensieroSalvato: boolean | null };

// La risposta del battito: l'ultimo briefing salvato + il verdetto su TUTTO quello che il battito
// ha provato a scrivere. Prima ogni pezzo ingoiava il proprio errore: il battito rispondeva
// sempre allo stesso modo, che il giro fosse stato accodato o mai nato.
async function rispostaBriefing(battito: ReturnType<typeof chiusuraAtto>, t: Timbri) {
  const rec = await getLatestBriefing();
  const timbro = {
    ...(battito.ok ? {} : { battito_registrato: false, avviso_battito: battito.messaggio }),
    ...(t.lavoroAccodato === false ? { giro_accodato: false } : {}),
    ...(t.playbookAccodati === false ? { playbook_accodati: false } : {}),
    ...(t.pensieroSalvato === false ? { pensiero_salvato: false } : {}),
  };
  if (!rec) {
    return NextResponse.json({
      ok: false,
      ...timbro,
      error: memoryConnected()
        ? "Il cervello sul Max non ha ancora salvato un briefing. Lancia un giro (cervello/giro.ps1) o aspetta quello programmato."
        : "Memoria non collegata: i giri non si salvano. Collega la memoria (SUPABASE_URL + SUPABASE_SERVICE_KEY) per vedere qui i briefing del cervello-Max.",
    });
  }
  return NextResponse.json({ ok: true, ...timbro, briefing: rec.data, created_at: rec.created_at });
}

// GET (cron Vercel): rilegge l'ultimo briefing e accoda un giro.
export async function GET(req: NextRequest) {
  return handle(req, true);
}
// POST (pulsante "Aggiorna ora"): idem.
export async function POST(req: NextRequest) {
  return handle(req, true);
}
