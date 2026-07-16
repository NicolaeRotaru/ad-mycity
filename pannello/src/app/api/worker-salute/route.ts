import { NextResponse } from "next/server";
import { getImpostazione, getLavori, getLavoriByIds, getConteggiLavori, memoryConnected, setImpostazione } from "@/lib/store";
import { etaOre, oreDaQuando, raccogliSegnaliBattito } from "@/lib/battito";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Firma "quota esaurita / limite di sessione" nel risultato di un lavoro. Stesso vocabolario della
// retry-policy (cervello/retry-policy.mjs → classificaErrore): se la coda è ferma per QUESTO, la causa
// è la quota Claude, non un guasto del worker o un .env sbagliato.
const QUOTA_RE =
  /session limit|hit your (usage|session) limit|out of usage|you'?re out of usage|rate[ _-]?limit|too many requests|\b429\b|overloaded|insufficient_quota|quota|credit balance|billing/i;

// Firma "credenziali del motore scadute/mancanti" (stesso vocabolario di retry-policy.mjs →
// classificaErrore, classe 'auth'): se gli ultimi errori portano questa firma il fix è umano
// (collega-claude.sh / collega-cursor.sh), non un ritentativo — e il Pannello deve dirlo.
const AUTH_RE =
  /invalid api key|please run \/login|not logged in|not authenticated|authentication[_ ]error|oauth token (has )?(expired|revoked)|token (expired|revoked)|401 unauthorized/i;

/** Estrae l'ora di reset dal messaggio ("resets 2:30am (Europe/Rome)" → "2:30am"). */
function estraiResetHint(t: string): string | null {
  const m = String(t).match(/resets?\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
  return m ? m[1].trim() : null;
}

/** Un ISO → "GG/MM HH:MM" nell'ora di Piacenza (Europe/Rome). */
function formattaOraRoma(iso: string): string | null {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return new Date(t).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// POST { azione: "riavvia" } → chiede al worker di ricaricarsi (flag worker:riavvia in
// impostazioni; il worker lo legge a ogni ciclo, spegne il flag e fa exec di sé stesso).
// La coda non si perde: i lavori vivono in Supabase e gli in_corso vengono recuperati al riavvio.
export async function POST(req: Request) {
  if (!memoryConnected()) {
    return NextResponse.json({ ok: false, error: "Memoria Supabase non collegata." }, { status: 503 });
  }
  let body: any = {};
  try {
    body = await req.json();
  } catch {}
  if (body?.azione !== "riavvia") {
    return NextResponse.json({ ok: false, error: "Azione non valida (usa {azione:'riavvia'})." }, { status: 400 });
  }
  const salvato = await setImpostazione("worker:riavvia", "on");
  if (!salvato) {
    return NextResponse.json({ ok: false, error: "Impossibile scrivere il flag (tabella impostazioni)." }, { status: 502 });
  }
  return NextResponse.json({
    ok: true,
    messaggio:
      "Riavvio richiesto: il worker si ricarica al prossimo ciclo (pochi secondi se libero; a fine lavoro se occupato). La coda non si perde.",
  });
}

/** Diagnostica operativa coda chat — cosa vede il Pannello (stesso Supabase del worker). */
export async function GET() {
  const memoria = memoryConnected();
  const supabaseHost = process.env.SUPABASE_URL?.replace(/^https?:\/\//, "").split("/")[0] ?? null;

  if (!memoria) {
    return NextResponse.json({
      memoria: false,
      problema: "Memoria Supabase non collegata su Vercel (SUPABASE_URL + SUPABASE_SERVICE_KEY).",
      azioni: ["Vercel → Environment Variables → aggiungi SUPABASE_* del progetto MEMORIA → Redeploy"],
    });
  }

  const [segnali, pausa, pipeline, codiceRev, lavoriLight, conteggiDb, workerChatUltimo, reloadRifiutato, motoreRaw] =
    await Promise.all([
      raccogliSegnaliBattito(),
      getImpostazione("pausa").catch(() => null),
      getImpostazione("worker:pipeline").catch(() => null),
      getImpostazione("worker:codice_rev").catch(() => null),
      getLavori(80),
      getConteggiLavori(),
      getImpostazione("worker:ultimo:chat").catch(() => null),
      getImpostazione("worker:reload-rifiutato").catch(() => null),
      getImpostazione("worker:motore").catch(() => null),
    ]);

  // Motore AI attivo sul VPS (timbrato dal worker a ogni lavoro). I consigli di sblocco auth devono
  // puntare allo script del motore VERO: prima suggerivano sempre collega-cursor.sh anche col
  // motore Claude (fix parity 2026-07-16). Se il timbro manca (worker mai partito / codice vecchio)
  // si mostrano entrambe le strade.
  const motore = motoreRaw === "cursor" || motoreRaw === "claude" ? motoreRaw : null;
  const fixAuthMotore =
    motore === "cursor"
      ? "auth Cursor mancante → sudo bash /opt/mycity/ad-mycity/cervello/vps/collega-cursor.sh"
      : motore === "claude"
        ? "auth Claude mancante → sudo bash /opt/mycity/ad-mycity/cervello/vps/collega-claude.sh"
        : "auth del motore AI mancante → sudo bash cervello/vps/collega-claude.sh (motore Claude) oppure collega-cursor.sh (motore Cursor)";

  // Poll leggero: risultato per gli in_attesa (firma quota) + gli ULTIMI errori (firma auth).
  // Le credenziali scadute mandano i lavori in 'errore' SENZA ritentativo (retry-policy classe
  // 'auth'), quindi la sola scansione degli in_attesa non le vedrebbe mai.
  const attesaIds = lavoriLight.filter((l) => l.stato === "in_attesa").map((l) => l.id);
  const erroreRecentiIds = lavoriLight
    .filter((l) => l.stato === "errore")
    .slice(0, 6)
    .map((l) => l.id);
  const dettaglioIds = [...attesaIds, ...erroreRecentiIds];
  const dettaglio = dettaglioIds.length ? await getLavoriByIds(dettaglioIds) : [];
  const risultatoDettaglio = new Map(dettaglio.map((l) => [l.id, l.risultato || ""]));
  const lavori = lavoriLight.map((l) =>
    risultatoDettaglio.has(l.id) ? { ...l, risultato: risultatoDettaglio.get(l.id) } : l
  );

  const oreWorker = oreDaQuando(segnali.worker?.quando);
  const oreWorkerChat = oreDaQuando(workerChatUltimo);
  const workerVivo = oreWorker != null && oreWorker <= 0.1;
  const workerChatVivo = oreWorkerChat != null && oreWorkerChat <= 0.1;
  const adInPausa = pausa === "on";

  const conteggi = { in_attesa: 0, in_corso: 0, fatto: 0, errore: 0 };
  let attesaPiuVecchiaMin: number | null = null;
  let corsoPiuVecchioMin: number | null = null;
  let inRitentativo = 0;
  // Quota/session-limit del motore Claude: la causa vera del "worker fermo" è quasi sempre qui,
  // scritta nel risultato dei lavori in coda ("You've hit your session limit · resets 2:30am").
  // La riconosciamo con la STESSA regola della retry-policy (cervello/retry-policy.mjs) così il
  // Pannello dice la verità invece di indovinare ".env ≠ Vercel / impallato".
  let quotaInAttesa = 0;
  let authErroriRecenti = 0;
  let resetHint: string | null = null;
  let riprovaMinISO: string | null = null;
  let chatInCorso = 0;
  let chatCorsoPiuVecchioMin: number | null = null;
  const now = Date.now();

  for (const l of lavori) {
    conteggi[l.stato as keyof typeof conteggi] = (conteggi[l.stato as keyof typeof conteggi] || 0) + 1;
    // Un in_attesa con riprova_dopo nel futuro sta aspettando il ritentativo automatico:
    // NON è "coda lenta" e non deve far scattare l'allarme del worker.
    const attendeRetry =
      l.stato === "in_attesa" && typeof l.riprova_dopo === "string" && new Date(l.riprova_dopo).getTime() > now;
    if (attendeRetry) inRitentativo++;
    // Firma auth su in_attesa O sugli ultimi errori freschi (<12h): credenziali da ricollegare.
    if (AUTH_RE.test(l.risultato || "")) {
      const tAuth = new Date(l.updated_at || l.created_at).getTime();
      const fresco = !isNaN(tAuth) && now - tAuth < 12 * 60 * 60 * 1000;
      if (l.stato === "in_attesa" || (l.stato === "errore" && fresco)) authErroriRecenti++;
    }
    if (l.stato === "in_attesa") {
      if (QUOTA_RE.test(l.risultato || "")) {
        quotaInAttesa++;
        resetHint = resetHint || estraiResetHint(l.risultato || "");
      }
      if (typeof l.riprova_dopo === "string" && new Date(l.riprova_dopo).getTime() > now) {
        if (riprovaMinISO == null || new Date(l.riprova_dopo).getTime() < new Date(riprovaMinISO).getTime()) {
          riprovaMinISO = l.riprova_dopo;
        }
      }
    }
    const t = new Date(l.updated_at || l.created_at).getTime();
    if (isNaN(t)) continue;
    const min = (now - t) / 60000;
    if (l.stato === "in_attesa" && !attendeRetry) {
      if (attesaPiuVecchiaMin == null || min > attesaPiuVecchiaMin) attesaPiuVecchiaMin = min;
    }
    if (l.stato === "in_corso") {
      if (corsoPiuVecchioMin == null || min > corsoPiuVecchioMin) corsoPiuVecchioMin = min;
      if (l.tipo === "chat") {
        chatInCorso++;
        if (chatCorsoPiuVecchioMin == null || min > chatCorsoPiuVecchioMin) chatCorsoPiuVecchioMin = min;
      }
    }
  }

  // La quota è la causa dominante quando almeno metà dei lavori in coda porta la firma "session limit".
  const quotaDominante = quotaInAttesa > 0 && quotaInAttesa >= Math.ceil((conteggi.in_attesa || 0) / 2);
  const riprovaAlle = riprovaMinISO ? formattaOraRoma(riprovaMinISO) : null;

  const azioni: string[] = [];
  let problema: string | null = null;
  // true = i lavori sono quota-limited e ripartono da soli al reset (stato "in attesa", non un guasto).
  let attesaQuota = false;

  const reloadBloccato = Boolean(reloadRifiutato?.trim());
  const chatWorkerMortoConChat =
    chatInCorso > 0 && !workerChatVivo && (chatCorsoPiuVecchioMin ?? 0) > 3;

  if (adInPausa) {
    problema = "L'AD è in pausa: il worker gira ma non esegue lavori.";
    azioni.push("Pannello → Azioni → Governo → «Riattiva l'AD»");
  } else if (reloadBloccato) {
    problema =
      "Il worker sul VPS rifiuta di caricare il codice nuovo: worker.sh su disco è diverso da git (modificato fuori da una PR).";
    azioni.push(
      "VPS: cd /opt/mycity/ad-mycity && git fetch origin main && git checkout origin/main -- cervello/worker.sh"
    );
    azioni.push("Poi: sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh");
    azioni.push("Usa «Sblocca coda» + «Riavvia worker» qui sotto se la chat è ferma");
  } else if (chatWorkerMortoConChat) {
    problema = `Worker chat fermo da ${etaOre(oreWorkerChat)} con ${chatInCorso} chat bloccata «In corso».`;
    azioni.push("Usa «Sblocca coda» qui sotto, poi «Riavvia worker»");
    azioni.push("Se resta fermo: sudo systemctl restart mycity-worker-chat sul VPS");
  } else if (oreWorker == null) {
    problema = "Il worker sul VPS non ha mai inviato un battito a Supabase.";
    azioni.push("SSH sul VPS → sudo systemctl start mycity-worker");
    azioni.push("Se crasha: sudo bash /opt/mycity/ad-mycity/cervello/vps/diagnostica-completa.sh");
    azioni.push(`Quasi sempre: ${fixAuthMotore}`);
  } else if (!workerVivo) {
    problema = `Worker spento da ${etaOre(oreWorker)} — systemd potrebbe essere fermo o in crash loop.`;
    azioni.push("SSH → journalctl -u mycity-worker -n 30 --no-pager");
    azioni.push("SSH → sudo bash /opt/mycity/ad-mycity/cervello/vps/diagnostica-completa.sh");
    azioni.push(`Se NRestarts alto (crash loop auth): ${fixAuthMotore}`);
  } else if ((conteggi.in_corso ?? 0) > 0 && (corsoPiuVecchioMin ?? 0) > 10) {
    problema = `${conteggi.in_corso} lavoro/i bloccati «In corso» da oltre 10 minuti.`;
    azioni.push("Usa il pulsante «Sblocca coda» qui sotto");
    azioni.push("Oppure VPS: sudo -u mycity -H bash .../recupera-lavori-orfani.sh");
  } else if (authErroriRecenti > 0) {
    // Credenziali del motore scadute/mancanti: i lavori muoiono appena partono e NON ripartono
    // da soli (retry-policy li ferma apposta). Il fix è un comando umano sul VPS.
    problema =
      "Il motore AI rifiuta le credenziali (login/token scaduto o mancante): i lavori falliscono appena partono.";
    azioni.push(`SSH sul VPS → ${fixAuthMotore}`);
    azioni.push("Verifica: sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/test-agent.sh");
    azioni.push("Poi rilancia i lavori falliti con «Riprova» dal Pannello.");
  } else if (quotaDominante && ((inRitentativo ?? 0) > 0 || (attesaPiuVecchiaMin ?? 0) > 3)) {
    // CAUSA VERA (letta dai lavori): il motore Claude ha esaurito il limite di sessione/quota.
    // NON è un guasto e NON è ".env ≠ Vercel": la coda riparte da sola al reset. Lo diciamo con calma.
    attesaQuota = true;
    problema =
      `Il motore ${motore === "cursor" ? "Cursor" : "Claude"} ha esaurito il limite di sessione/quota della sottoscrizione. ` +
      `I ${conteggi.in_attesa} lavori in coda NON sono impallati: aspettano il reset e ripartono da soli` +
      `${riprovaAlle ? ` (prossimo ritentativo ${riprovaAlle})` : resetHint ? ` (reset ${resetHint})` : ""}.`;
    azioni.push(
      `Nessun intervento tecnico: la coda si svuota da sola al reset${resetHint ? ` (${resetHint})` : ""}.`
    );
    azioni.push(
      `Se si ripete ogni giorno, il volume di lavori supera il piano ${motore === "cursor" ? "Cursor" : "Claude"} → alza il piano oppure riduci i giri/metabolizza automatici.`
    );
    if (motore !== "cursor") {
      azioni.push("Per controllare la quota: sul VPS lancia `claude` e guarda /status (o attendi il reset indicato).");
    }
  } else if ((conteggi.in_attesa ?? 0) > 0 && (attesaPiuVecchiaMin ?? 0) > 3 && workerVivo) {
    problema = "Worker vivo ma la coda non si muove — motore AI impallato sul lavoro corrente o .env VPS ≠ Vercel.";
    azioni.push("Verifica che SUPABASE_URL sul VPS sia lo stesso host mostrato qui sotto");
    azioni.push("journalctl -u mycity-worker -f (guarda se compare «Lavoro … in_corso»)");
  } else if (pipeline === "legacy-agent-direct") {
    problema = "Worker con pipeline vecchia — i giri non pushano la memoria su main.";
    azioni.push("VPS: sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh");
  }

  return NextResponse.json({
    memoria: true,
    supabaseHost,
    workerVivo,
    workerChatVivo,
    workerUltimo: segnali.worker?.quando ?? null,
    workerChatUltimo: workerChatUltimo ?? null,
    workerUltimoFa: oreWorker != null ? etaOre(oreWorker) : "mai",
    workerChatUltimoFa: oreWorkerChat != null ? etaOre(oreWorkerChat) : "mai",
    reloadBloccato,
    adInPausa,
    pipeline: pipeline ?? null,
    codiceRev: codiceRev ?? null,
    motore,
    // Badge sotto «Stato worker»: conteggi reali dal DB (non finestra ultimi 80).
    conteggi: conteggiDb.per_stato,
    inRitentativo,
    attesaQuota,
    riprovaAlle,
    resetHint,
    attesaPiuVecchiaMin: attesaPiuVecchiaMin != null ? Math.round(attesaPiuVecchiaMin) : null,
    corsoPiuVecchioMin: corsoPiuVecchioMin != null ? Math.round(corsoPiuVecchioMin) : null,
    problema,
    azioni,
    ok: !problema && workerVivo,
  });
}
