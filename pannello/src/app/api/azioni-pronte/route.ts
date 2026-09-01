import { NextResponse } from "next/server";
import { getImpostazioni, setImpostazione, logAzione, memoryConnected } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, tutteLeAzioniConEsito, statoDa } from "@/lib/azioni-pronte";
import { verificaQualita } from "@/lib/qualita";
import { chiudiAzioniMergeCompletate, estraiMergePr, isCanaleGithub, prGiaMergiata } from "@/lib/github-pr-merge";
import { registraFirmaObbligatoria, revocaFirma, FirmaNonScritta } from "@/lib/firma-azione";
import { attoGiaAvviato } from "@/lib/atto-unico";
import { esitoScritture, STATUS_SCRITTURA_FALLITA } from "@/lib/esito-scrittura";
import { attoUnaVoltaSola, chiusuraAtto } from "@/lib/cancello-atto";
import { prenotaAzione, sigillaAzione, chiavePostoAzione } from "@/lib/prenotazione-atto";
import { piuRecente } from "@/lib/verdetto-dato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// "Azioni pronte" = la corsia operativa. Mosse del vault + sentinelle (lib/azioni-pronte).
// Approvare → esegue tramite le "mani" (lib/mani) e salva esito in Supabase.
//
// AR-110 — LA FIRMA DI NICOLA È UN DATO, NON UN SOTTINTESO.
// Il click «Approva» scrive `azione:<id>:firma` = "nicola AAAA-MM-GG HH:MM". È l'unico posto che
// la scrive con quel nome: l'autopilota (lib/autopilota.ts) marca "auto …", e il cancello lato
// cervello (cervello/consenso-azione.mjs::firmaPannello) accetta solo "nicola".
// Prima esisteva solo `azione:<id>` = stato, che vale sia per il clic umano sia per l'autopilota:
// l'esecutore CLI non poteva distinguerli, quindi non poteva fidarsi di nessuno dei due e ogni
// invio firmato degradava a DRY-RUN.

export async function GET() {
  // AR-233: serve sapere se la coda è stata LETTA, non solo quante card contiene.
  const { azioni: blocchi, codaLeggibile, motivoCoda } = await tutteLeAzioniConEsito();
  const { tabella, valori } = await getImpostazioni();
  // Le chiusure automatiche che non sono state salvate: la lettura le riproverà al giro dopo, ma
  // dirlo evita che la Cabina mostri come «chiusa» una card che al ricarico torna aperta.
  const chiusureNonSalvate: string[] = [];
  const conStato = await chiudiAzioniMergeCompletate(
    blocchi,
    valori,
    async (id, nota) => {
      const az = blocchi.find((b) => b.id === id);
      const c = chiusuraAtto({
        scritture: [
          { nome: "stato", ok: await setImpostazione(`azione:${id}`, "fatta") },
          { nome: "nota", ok: await setImpostazione(`azione:${id}:nota`, nota) },
        ],
        attoEseguito: false,
      });
      if (!c.ok) chiusureNonSalvate.push(id);
      if (az) {
        await logAzione({
          id,
          titolo: az.titolo,
          reparto: az.reparto,
          livello: az.livello,
          stato: "fatta",
          esito: nota,
          auto: true,
        });
      }
    }
  );
  const azioni = conStato.map((b) => ({
    ...b,
    stato: statoDa(b.stato),
    qualita: verificaQualita(b),
  }));
  return NextResponse.json({
    // AR-233: «collegato» si deduceva dal CONTEGGIO — quindi una coda vuota e una coda mai letta
    // erano indistinguibili, e la home stampava «Niente da firmare. 👍» in entrambi i casi.
    collegato: codaLeggibile,
    // AR-237 — DI QUANDO SONO QUESTI DATI. Senza, la home stampava l'ora del browser («aggiornato
    // adesso») anche su una coda che non si muove da tre giorni. `preparato` è la data che il senior
    // ha scritto sulla card in AZIONI-IN-ATTESA.md: è la data del DATO, non quella della lettura.
    dato_al: codaLeggibile ? piuRecente(azioni.map((a) => a.preparato)) : null,
    coda_leggibile: codaLeggibile,
    motivo_coda: motivoCoda,
    ...(chiusureNonSalvate.length ? { chiusure_non_salvate: chiusureNonSalvate } : {}),
    salvataggio: tabella,
    autopilota: valori["autopilota"] === "on",
    azioni,
  });
}

// Decidi. Body: { id, decisione: "approva" | "rifiuta" | "annulla" }.
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body non valido." }, { status: 400 });
  }
  const id = String(body?.id || "").trim();
  const dec = String(body?.decisione || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "Manca l'id." }, { status: 400 });

  // AR-413 — PRIMA DI TOCCARE IL MONDO, VERIFICA DI POTER REGISTRARE QUELLO CHE STAI PER FARE.
  // Questa era l'unica rotta che muta e non chiedeva mai se la memoria fosse collegata (la parola
  // `memoryConnected` non compariva proprio nel file), mentre tre rotte innocue lo chiedevano. Senza
  // memoria `getImpostazioni()` torna una mappa vuota: lo stato salvato risulta vuoto per OGNI
  // azione, la guardia «già fatta» non scatta mai, la firma non si scrive, le mani partono davvero e
  // poi la risposta diceva «riprova» — e riprovare mandava l'azione una seconda volta.
  if (!memoryConnected()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Memoria non collegata: non posso registrare questa decisione, quindi non la eseguo. Collega la memoria (SUPABASE_URL + SUPABASE_SERVICE_KEY) e riprova — non è partito niente.",
      },
      { status: 503 },
    );
  }

  const azione = (await tutteLeAzioni()).find((a) => a.id === id);

  if (dec === "rifiuta" || dec === "annulla") {
    // 🔴 BLOCCANTE (radiografia 3/7): una decisione NON deve azzerare lo stato di un'azione GIÀ ESEGUITA.
    // Prima lo faceva incondizionatamente: annulla → ri-approva ri-eseguiva le "mani" (doppio merge/email/payout).
    //
    // AR-229: il controllo esisteva già ma solo dentro `if (dec === "annulla")`, cioè era appeso al
    // NOME della decisione invece che allo stato dell'azione — l'unico fatto che conta. Quindi la
    // strada approva → RIFIUTA → approva restava aperta: il rifiuto riscriveva lo stato in
    // "rifiutata", che il ramo approva considera riapprovabile, e le mani partivano una seconda
    // volta davvero. Ora la guardia sta su TUTTE le decisioni che riscrivono lo stato.
    const { tabella: tabellaPre, valori: valoriPre } = await getImpostazioni();
    const statoPre = valoriPre[`azione:${id}`] || "";
    // AR-413: se non ho potuto LEGGERE lo stato, «vuoto» non vuol dire «mai partita». Rifiutare qui
    // significherebbe rimettere in circolo un'azione che magari è già stata eseguita.
    if (!tabellaPre) {
      return NextResponse.json(
        { ok: false, error: "Non riesco a leggere lo stato delle azioni: non decido al buio. Riprova fra poco — non è cambiato niente." },
        { status: STATUS_SCRITTURA_FALLITA },
      );
    }
    // AR-412: il posto preso è un fatto più affidabile dello stato, perché viene scritto PRIMA
    // dell'atto. Se c'è, qualcuno sta eseguendo (o ha eseguito) questa azione anche quando lo stato
    // è rimasto indietro — ed è proprio il caso in cui il rifiuto farebbe il danno peggiore.
    const postoPreso = (valoriPre[chiavePostoAzione(id)] || "").trim();
    if (attoGiaAvviato(statoPre) || postoPreso) {
      return NextResponse.json(
        { ok: false, giaEseguita: true, stato: statoDa(statoPre), error: "Azione già eseguita o in corso: non è più annullabile né rifiutabile (eviterebbe un doppio invio reale)." },
        { status: 409 },
      );
    }
    const stato = dec === "rifiuta" ? "rifiutata" : "";
    // AR-110: rifiutare/annullare TOGLIE anche la firma. Senza, un'azione approvata e poi
    // rifiutata resterebbe "firmata da Nicola" e potrebbe ancora autorizzare un invio dalla CLI.
    //
    // AR-230: le tre scritture si raccolgono TUTTE (niente `&&`, che cortocircuita e salterebbe la
    // seconda) e l'esito si guarda. Prima si rispondeva `ok:true` comunque: con Supabase giù la card
    // diceva «rifiutata», al refresh tornava da decidere e la firma restava addosso — cioè il
    // Pannello dichiarava una decisione che non esisteva da nessuna parte.
    const revocata = await revocaFirma(id);
    const salvStato = await setImpostazione(`azione:${id}`, stato);
    const salvNota = await setImpostazione(`azione:${id}:nota`, "");
    const scritture = esitoScritture([
      { nome: "stato", ok: salvStato },
      { nome: "nota", ok: salvNota },
      { nome: "revoca firma", ok: revocata },
    ]);
    if (!scritture.ok) {
      return NextResponse.json(
        { ok: false, stato, esito: "", salvataggio: false, error: scritture.errore },
        { status: STATUS_SCRITTURA_FALLITA },
      );
    }
    if (dec === "rifiuta" && azione) {
      await logAzione({ id, titolo: azione.titolo, reparto: azione.reparto, livello: azione.livello, stato: "rifiutata", esito: "", auto: false });
    }
    return NextResponse.json({ ok: true, stato, esito: "", salvataggio: true });
  }

  if (dec !== "approva") return NextResponse.json({ ok: false, error: "Decisione non valida." }, { status: 400 });
  if (!azione) return NextResponse.json({ ok: false, error: "Azione non trovata." }, { status: 404 });

  // 🔴 Idempotenza: se l'azione è GIÀ stata approvata/eseguita (stato salvato ≠ "" e ≠ "rifiutata"),
  // NON rieseguire le "mani" — un doppio clic o una ri-approvazione dopo refresh manderebbe l'azione
  // reale (email/payout/notifica) una seconda volta.
  //
  // ⚠️ Questo controllo da solo NON basta, ed è AR-412: è un «leggi lo stato, se è vuoto procedi»
  // seguito, secondi dopo, da «scrivi lo stato», con in mezzo la chiamata che manda davvero. Due
  // richieste ravvicinate leggono entrambe vuoto e partono entrambe. Serve, ma come filtro gentile:
  // la corsa vera la chiude la PRENOTAZIONE qui sotto, che sta sul dato e non sul bottone.
  const { tabella, valori: valoriPre } = await getImpostazioni();
  const statoPre = valoriPre[`azione:${id}`] || "";
  if (attoGiaAvviato(statoPre)) {
    return NextResponse.json({
      ok: true,
      stato: statoDa(statoPre),
      esito: valoriPre[`azione:${id}:nota`] || "",
      giaFatta: true,
    });
  }

  // AR-110: la firma si registra PRIMA di far partire qualsiasi cosa. Le azioni che il Pannello
  // non esegue da sé (merge PR, canali non collegati) finiscono al worker sul VPS, che ripassa dal
  // cancello di cervello/consenso-azione.mjs: quel cancello deve trovare la firma già scritta,
  // altrimenti l'azione che Nicola ha appena approvato gli arriva come "non firmata" e muore in
  // DRY-RUN. È esattamente il punto in cui il percorso firma→esecuzione si spezzava.
  //
  // AR-413(b): l'esito della firma è BLOCCANTE. Prima era `await registraFirma(id, "nicola");` col
  // booleano buttato via: con la memoria che non risponde l'azione partiva senza firma scritta.
  try {
    await registraFirmaObbligatoria(id, "nicola");
  } catch (e) {
    if (!(e instanceof FirmaNonScritta)) throw e;
    return NextResponse.json(
      { ok: false, error: `${e.message} Non è partito niente: riprova fra poco.` },
      { status: STATUS_SCRITTURA_FALLITA },
    );
  }

  // Merge PR già chiusa su GitHub → chiudi subito senza ri-accodare il worker.
  if (isCanaleGithub(azione.canale)) {
    const ref = estraiMergePr(azione.titolo, azione.testo || azione.perche || "");
    if (ref && (await prGiaMergiata(ref))) {
      const nota = `✓ PR #${ref.pr} già mergiata — tolta dalla coda`;
      // Le due scritture si raccolgono TUTTE: `&&` cortocircuita, quindi se la prima falliva la
      // seconda non partiva nemmeno e lo stato restava a metà senza che nessuno lo sapesse.
      // Qui il mondo non è stato toccato (la PR era già mergiata da altri), quindi «riprova» è il
      // consiglio giusto — ed è `chiusuraAtto` a saperlo, non questa riga.
      const chiusura = chiusuraAtto({
        scritture: [
          { nome: "stato", ok: await setImpostazione(`azione:${id}`, "fatta") },
          { nome: "nota", ok: await setImpostazione(`azione:${id}:nota`, nota) },
        ],
        attoEseguito: false,
      });
      // AR-901 — IL DIARIO SI SCRIVE DOPO, non prima. Qui `logAzione` girava PRIMA di guardare
      // `chiusura.ok`: con la memoria che non risponde, le due scritture di stato fallivano e nel
      // registro restava comunque scritto «fatta». Nicola lo legge nella cronologia, mentre la card
      // gli torna in «da decidere» al primo aggiornamento — due verità diverse sullo stesso fatto,
      // e quella scritta è la sbagliata.
      //
      // Il ramo del RIFIUTO, sessanta righe più su, ha già l'ordine giusto (AR-230): prima si
      // controlla che le scritture siano andate, poi si scrive nel registro. Questo ramo era rimasto
      // indietro — la cura era stata messa dove il difetto si era visto, non dove poteva ripetersi.
      if (!chiusura.ok) {
        return NextResponse.json(
          { ok: false, stato: "fatta", esito: nota, salvataggio: false, error: chiusura.messaggio },
          { status: chiusura.status }
        );
      }
      await logAzione({
        id,
        titolo: azione.titolo,
        reparto: azione.reparto,
        livello: azione.livello,
        stato: "fatta",
        esito: nota,
        auto: true,
      });
      return NextResponse.json({ ok: true, stato: "fatta", esito: nota, salvataggio: true });
    }
  }

  // AR-412 + AR-413 + AR-385 — L'ATTO, NELL'ORDINE CHE NON SI PUÒ INVERTIRE.
  //
  // `attoUnaVoltaSola` (lib/cancello-atto.ts) impone la sequenza: letture vive → prendo il posto →
  // atto → registro → dico com'è andata. L'ordine sta nel modulo condiviso e non qui, perché il
  // difetto non era un cancello mancante: era la SEQUENZA (atto prima, segnaposto dopo), e una
  // sequenza scritta a mano nella route si può reinvertire al primo ritocco.
  //
  // Il posto lo prende `prenotaAzione`: un INSERT nudo sulla chiave unica `azione:<id>:in-corso`.
  // È l'unica scrittura del Pannello che sa dire «c'ero prima io» — `setImpostazione` è un upsert e
  // scrive sempre. Su Vercel il pulsante, il cron e il componente sono processi diversi: nessun
  // lucchetto tenuto in memoria può vederli tutti, la corsa si chiude solo sul dato.
  const svolgimento = await attoUnaVoltaSola({
    letture: [{ nome: "lo stato salvato delle azioni", vivo: tabella }],
    prenota: () => prenotaAzione(id, "nicola"),
    atto: () => eseguiAzione({ titolo: azione.titolo, canale: azione.canale, destinatario: azione.destinatario, testo: azione.testo }),
    registra: async (esito) => [
      // Il sigillo per primo: dichiara che l'atto È avvenuto anche se le due scritture qui sotto
      // falliscono. Senza, un atto eseguito con lo stato non salvato tornerebbe eseguibile appena
      // scade la prenotazione — cioè il doppio invio con dieci minuti di ritardo.
      { nome: "sigillo dell'atto", ok: await sigillaAzione(id, esito.stato) },
      { nome: "stato", ok: await setImpostazione(`azione:${id}`, esito.stato) },
      { nome: "nota", ok: await setImpostazione(`azione:${id}:nota`, esito.dettaglio) },
    ],
  });

  if (!svolgimento.eseguito) {
    // ⚠️ AR-887 — QUI C'ERANO TRE MOTIVI, E DAL 30/8 SONO QUATTRO.
    //
    // Il commento di prima diceva «Niente è partito: la firma va tolta», ed era vero per i tre
    // motivi che c'erano allora — `cieco`, `gia-in-corso`, `prenotazione-incerta` dicono tutti
    // «NON ho toccato il mondo». Il quarto, `atto-esploso`, dice una cosa diversa: «non SO se
    // l'ho toccato». Il suo stesso messaggio a Nicola dice «NON riprovare, riprovando rischi di
    // mandarla una seconda volta» — e togliere la firma è esattamente l'invito a riprovare: la
    // card torna in «da approvare», Nicola la firma di nuovo e la mail parte due volte, a un
    // cliente vero.
    //
    // Il campo `mondoForseToccato` esisteva già, lo scriveva `cancello-atto.ts` e non lo leggeva
    // NESSUNO: una bandiera issata e mai guardata. Adesso decide.
    const forseGiaPartita = svolgimento.mondoForseToccato === true;
    const firmaTolta = forseGiaPartita ? false : await revocaFirma(id);
    return NextResponse.json(
      {
        ok: false,
        // Con `mondoForseToccato` la firma resta APPOSTA, e non è «non sono riuscito a toglierla».
        // Sono due stati diversi e vanno detti diversi, o Nicola legge un guasto dove c'è una scelta.
        firmaAncoraViva: forseGiaPartita || !firmaTolta,
        firmaTenutaApposta: forseGiaPartita,
        error: forseGiaPartita
          ? `${svolgimento.messaggio} La firma resta sull'azione APPOSTA, così nessuno la rimanda per sbaglio: quando hai controllato il canale, segnala a mano come «fatta» o «da rifare».`
          : firmaTolta
            ? svolgimento.messaggio
            : `${svolgimento.messaggio} In più non sono riuscito a togliere la firma: l'azione resta firmata anche se non è partita. Metti la pausa dal Pannello.`,
        motivo: svolgimento.motivo,
        giaInCorso: svolgimento.motivo === "gia-in-corso",
        salvataggio: false,
      },
      { status: svolgimento.status },
    );
  }

  const esito = svolgimento.risultato;
  await logAzione({ id, titolo: azione.titolo, reparto: azione.reparto, livello: azione.livello, stato: esito.stato, esito: esito.dettaglio, auto: false });
  // AR-034 + AR-413(c): se il salvataggio Supabase fallisce, ok:false → il client fa rollback invece
  // di mostrare "ok" su una card che al refresh torna vergine. Ma il messaggio NON dice più
  // «riprova»: l'azione è già partita, e riprovare la manderebbe una seconda volta. Lo decide
  // `chiusuraAtto`, che sa se il mondo è già stato toccato.
  if (!svolgimento.registrato) {
    return NextResponse.json(
      {
        ok: false,
        stato: esito.stato,
        esito: esito.dettaglio,
        salvataggio: false,
        nonRiprovare: true,
        error: svolgimento.messaggio,
      },
      { status: svolgimento.status },
    );
  }
  return NextResponse.json({ ok: true, stato: esito.stato, esito: esito.dettaglio, salvataggio: true });
}
