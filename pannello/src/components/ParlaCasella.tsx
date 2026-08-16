"use client";
// v4 — altezza compatta (h-36) + scroll al fondo all'apertura + spaziatura ridotta AI
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquarePlus, Send, Loader2, CheckCircle2 } from "lucide-react";
import FinestraComandiSkill, { BottoneSkill } from "@/components/FinestraComandiSkill";
import BottoneAllegatiChat from "@/components/BottoneAllegatiChat";
import BottoneFotoChat from "@/components/BottoneFotoChat";
import AnteprimaAllegatiChat from "@/components/AnteprimaAllegatiChat";
import { caricaAllegatiChat } from "@/lib/allegati-chat";
import {
  attendiEsitoLavoro,
  creaLavoroCasella,
  fondiMessaggi,
  recuperaThreadDaLavori,
  salvaConversazioneCasella,
  type ParlaMsg,
} from "@/lib/parla";
import { gestisciInvioChat, hintInvioChat } from "@/lib/chat-input";
import {
  accettaEventoBus,
  chiaveConversazione,
  fondiThreadCasella,
  stessaCasella,
  trovaConversazione,
} from "@/lib/casella-conversazione";
import { classeCampo } from "@/lib/tocco-bersaglio";
import { pianoApertura } from "@/lib/recupero-thread";
import {
  ascoltaChatUnificata,
  leggiUltimaChatUnificata,
  pubblicaChatUnificata,
} from "@/lib/chat-unificata";

// 🚀 AR-036: cache CONDIVISA della lista conversazioni tra TUTTE le istanze di ParlaCasella.
// Prima ogni casella fetchava /api/conversazioni al proprio mount → con decine di caselle per pagina
// erano decine/centinaia di richieste identiche. Ora: una sola richiesta (dedup delle chiamate in volo)
// + cache breve (10s). Il fetch parte solo quando una casella viene aperta (vedi effetto sotto).
let convCache: { at: number; data: Array<{ id?: string | number; titolo?: string; messaggi?: unknown }> } | null = null;
let convInFlight: Promise<Array<{ id?: string | number; titolo?: string; messaggi?: unknown }>> | null = null;
async function fetchConversazioniCondiviso() {
  if (convCache && Date.now() - convCache.at < 10000) return convCache.data;
  if (convInFlight) return convInFlight;
  convInFlight = fetch("/api/conversazioni", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => {
      const arr = Array.isArray(d?.conversazioni) ? d.conversazioni : [];
      convCache = { at: Date.now(), data: arr };
      return arr;
    })
    .catch(() => convCache?.data ?? [])
    .finally(() => { convInFlight = null; });
  return convInFlight;
}

// 💬 Pulsante "Parla con questa casella" — riutilizzabile su OGNI casella del Pannello.
// Chiuso di default: un click lo apre. Salva SUBITO la conversazione in Assistenza →
// Conversazioni (col messaggio di Nicola), poi manda il messaggio (col contesto della
// casella) a Claude Max nello stesso gruppo, mostra la risposta sul posto e completa il
// thread salvato. Se la pagina si chiude prima della risposta, il thread resta in lista
// e la risposta si ripesca dai lavori alla prossima apertura.
export default function ParlaCasella({
  titolo,
  contesto,
  idCasella,
}: {
  titolo: string;
  contesto?: string;
  /**
   * AR-405 — l'identità della conversazione, che NON è il testo mostrato.
   *
   * Il `titolo` arriva dai punti di innesto come testo tagliato di quello che si vede
   * (`Difetto: ${umano.titolo}`, `Domanda: ${testo.slice(0, 60)}`): quando l'AD lo riscrive — cosa
   * che fa a ogni radiografia — la chiave cambiava e la chat avuta lì spariva. Qui passa l'id
   * stabile della voce (id difetto, id azione, id lezione): il titolo resta solo intestazione.
   */
  idCasella?: string;
}) {
  const [aperto, setAperto] = useState(false);
  const [bozza, setBozza] = useState("");
  const [inviando, setInviando] = useState(false);
  const [msgs, setMsgs] = useState<ParlaMsg[]>([]);
  // AR-268: specchio sincrono del thread. Fra l'invio e la risposta possono passare minuti, e in
  // quell'attesa `msgs` cambia: chi salva deve partire da com'è ADESSO, non da com'era alla
  // partenza. Stesso pattern di `convIdRef` nell'Assistente.
  const msgsRef = useRef<ParlaMsg[]>(msgs);
  msgsRef.current = msgs;
  const [convId, setConvId] = useState<string | null>(null);
  const [salvata, setSalvata] = useState(false);
  // Onestà del salvataggio: la spunta verde vale SOLO se è finito nella memoria condivisa.
  // Se la memoria non è collegata (ripiego su localStorage), il messaggio vive solo su
  // questo dispositivo ed è volatile: va detto, non spacciato per «salvata in Conversazioni».
  const [salvataSuServer, setSalvataSuServer] = useState(false);
  const [err, setErr] = useState("");
  const [allegati, setAllegati] = useState<File[]>([]);
  // ⚡ Finestra "Skill & comandi" dentro la chat (si apre dal pulsante ⚡ accanto a Invia).
  const [skillAperte, setSkillAperte] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hintInvio, setHintInvio] = useState("Invio = invia · Maiusc+Invio = a capo");
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBottom() {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }

  // 🐛 Bug #5 (radiografia 2026-07-03): la risposta del box spariva cambiando sezione,
  // perché `msgs` è stato locale e al rimontaggio ripartiva da []. La conversazione è però
  // già salvata in Conversazioni sotto il titolo `💬 {titolo}` (thread stabile dal titolo):
  // al montaggio la ricarichiamo (server → fallback localStorage) e ripopoliamo msgs+convId,
  // così recuperiamo anche il convId reale e i salvataggi successivi fanno upsert sullo stesso thread.
  // AR-036: carica la storia della casella SOLO quando la apri (non a ogni mount di ogni casella),
  // e via la cache condivisa (una sola richiesta anche se apri più box). La maggior parte delle caselle
  // non viene mai aperta → zero fetch. Carica una volta per casella (si ritenta solo se il giro
  // precedente è stato annullato chiudendo il box a metà caricamento).
  const caricatoRef = useRef(false);
  useEffect(() => setHintInvio(hintInvioChat()), []);

  // AR-405 — la chiave del thread: presentazione + targhetta di identità. Non è più il solo testo.
  const chiaveTitolo = chiaveConversazione(idCasella, titolo);

  // Allinea con Assistente / chat fluttuante: stesso thread ovunque si apra.
  useEffect(() => {
    if (!aperto) return;
    const pub = [...msgs];
    if (inviando) {
      pub.push({ role: "assistant", content: "💭 Sto elaborando la risposta…", pending: true });
    }
    pubblicaChatUnificata({ convId, titolo: chiaveTitolo, messaggi: pub }, "casella");
  }, [aperto, convId, chiaveTitolo, msgs, inviando]);

  // AR-404 — chi ascolta il bus FONDE, non sostituisce.
  // Prima: `if (det.titolo !== chiaveTitolo) return;` e poi `setMsgs(det.messaggi)` — sostituzione
  // integrale. Bastava che l'Assistente ripubblicasse lo stesso thread più corto (lo fa a ogni
  // cambio dei suoi `messages`) perché la casella perdesse i messaggi sotto e la bolla «💭 Sto
  // elaborando la risposta…», che non esiste da nessun'altra parte e che nessuna rilettura
  // ricostruisce. Le due decisioni — «è mio?» e «come lo applico?» — stanno nel modulo condiviso,
  // dove l'Assistente le ha già (`aggiornamentoPertinente` + `fondiConservandoVivi`).
  const convIdRef = useRef<string | null>(convId);
  convIdRef.current = convId;
  useEffect(() => {
    return ascoltaChatUnificata("casella", (det) => {
      if (!accettaEventoBus({ chiaveMia: chiaveTitolo, convIdMio: convIdRef.current, evento: det })) return;
      setMsgs((cur) => fondiThreadCasella(cur, det.messaggi as ParlaMsg[]));
      if (det.convId) setConvId(det.convId);
    });
  }, [chiaveTitolo]);

  // Sync finale quando chiudi il box (altrimenti l'Assistente resta con «sto pensando» appeso).
  useEffect(() => {
    if (aperto) return;
    const pub = msgs.filter((m) => !m.pending);
    if (!pub.length && !convId) return;
    pubblicaChatUnificata({ convId, titolo: chiaveTitolo, messaggi: pub }, "casella");
  }, [aperto, convId, chiaveTitolo, msgs]);

  // AR-604 — il ripescaggio è già riuscito almeno una volta per questa casella?
  // Sta in un ref e non in uno stato perché non si disegna: serve solo a non rileggere per niente.
  const recuperoFattoRef = useRef(false);
  useEffect(() => {
    if (!aperto) return;
    let annullato = false;
    const chiave = chiaveTitolo; // AR-405: identità stabile, non il testo mostrato
    const giaAttiva = leggiUltimaChatUnificata();
    // AR-604 — LE DUE USCITE ANTICIPATE CHE SPEGNEVANO LA PROMESSA.
    // Quando l'attesa scadeva, a schermo compariva «la risposta vera verrà ripescata dai lavori alla
    // prossima apertura». Ma chiudere il box non smonta il componente, quindi `caricatoRef` restava
    // acceso e alla riapertura si usciva alla prima riga; e anche al rimontaggio vero, se la chat
    // unificata ricordava proprio questa casella, si usciva PRIMA del passo di recupero. Adesso
    // «da dove parto» e «devo ripescare» sono due domande separate, e la seconda la decide una
    // funzione pura che un test esegue: finché a schermo resta una risposta promessa e mai
    // arrivata, si ritenta a ogni apertura.
    const piano = pianoApertura({
      giaCaricato: caricatoRef.current,
      recuperoFatto: recuperoFattoRef.current,
      unificataMia: stessaCasella(giaAttiva?.titolo, chiave),
      unificataMessaggi: giaAttiva?.messaggi.length ?? 0,
      threadCorrente: msgsRef.current,
    });
    if (piano.usaUnificata && giaAttiva) {
      caricatoRef.current = true;
      setMsgs(giaAttiva.messaggi as ParlaMsg[]);
      if (giaAttiva.convId) setConvId(giaAttiva.convId);
    }
    if (!piano.leggiSalvati && !piano.recupera) return;
    (async () => {
      let salvati: ParlaMsg[] = piano.usaUnificata ? ((giaAttiva?.messaggi ?? []) as ParlaMsg[]) : [];
      let cid: string | null = piano.usaUnificata ? (giaAttiva?.convId ?? null) : null;
      // AR-405 (b) — MIGRAZIONE: se col titolo nuovo non c'è niente si cerca la conversazione col
      // vecchio titolo esatto e la si rinomina, così le chat già avute non si perdono per strada.
      let daMigrare = false;
      if (piano.leggiSalvati) {
        // 1) server (lista condivisa, cache + dedup)
        try {
          const arr = await fetchConversazioniCondiviso();
          const c = trovaConversazione(arr, idCasella, titolo);
          if (c) {
            salvati = Array.isArray(c.messaggi) ? (c.messaggi as ParlaMsg[]) : [];
            cid = c.convId;
            daMigrare = c.daMigrare;
          }
        } catch {
          /* rete instabile: passo al locale */
        }
        // 2) fallback locale (stesso formato della Cabina)
        if (!cid && salvati.length === 0) {
          try {
            const list = JSON.parse(localStorage.getItem("mycity_conversazioni") || "[]");
            const c = trovaConversazione(Array.isArray(list) ? list : [], idCasella, titolo);
            if (c) {
              salvati = Array.isArray(c.messaggi) ? (c.messaggi as ParlaMsg[]) : [];
              cid = c.convId;
              daMigrare = c.daMigrare;
            }
          } catch {
            /* localStorage non disponibile */
          }
        }
        if (annullato) return;
        caricatoRef.current = true;
        if (salvati.length || cid) {
          setMsgs(salvati);
          setConvId(cid);
        }
        if (daMigrare && salvati.length) {
          // Stesso `convId`, titolo nuovo: da qui in poi la conversazione ha un'identità e sopravvive
          // alla prossima riscrittura del testo.
          const { id } = await salvaConversazioneCasella(cid, chiave, salvati);
          if (!annullato && id) setConvId(id);
        }
      }
      if (!piano.recupera || annullato) return;
      // 3) 🩹 RECUPERO: risposta arrivata quando la pagina era chiusa → vive solo nei lavori
      //    (stesso gruppo_id, o stessa casella per i lavori nati prima del collegamento).
      //    Se il thread completo è più lungo di quello salvato, mostralo e RISALVALO in
      //    Conversazioni, così la lista dell'Assistente torna a dire la verità.
      //    Le bolle sospese non fanno parte del confronto: erano l'avviso «tempo scaduto», e
      //    lasciarle dentro farebbe sembrare il thread già lungo abbastanza.
      const completi = await recuperaThreadDaLavori(titolo, cid, salvati.filter((m) => !m.pending));
      recuperoFattoRef.current = true;
      if (!completi) return;
      if (!annullato) setMsgs((cur) => fondiMessaggi(cur, completi));
      const { id } = await salvaConversazioneCasella(cid, chiave, completi);
      if (!annullato && id) setConvId(id);
    })();
    return () => {
      annullato = true;
    };
  }, [aperto, titolo, idCasella, chiaveTitolo]);

  // Scroll al fondo quando si apre la chat (mostra gli ultimi messaggi, non l'inizio)
  useEffect(() => {
    if (aperto) requestAnimationFrame(scrollBottom);
  }, [aperto]);

  // Scroll al fondo a ogni nuovo messaggio
  useEffect(() => {
    scrollBottom();
  }, [msgs]);

  function aggiungiFile(lista: FileList | null) {
    if (!lista || lista.length === 0) {
      setErr("La foto non è arrivata — riprova o scegline un'altra.");
      return;
    }
    setErr("");
    setAllegati((prev) => [...prev, ...Array.from(lista)].slice(0, 6));
  }
  function togliAllegato(i: number) {
    setAllegati((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function invia() {
    const testo = bozza.trim();
    const daCaricare = allegati;
    if ((!testo && daCaricare.length === 0) || inviando) return;
    setErr("");
    setSalvata(false);
    setSalvataSuServer(false);
    setBozza("");
    setAllegati([]);
    const chiave = chiaveTitolo;
    const storia = msgs.filter((m) => !m.pending);
    const nomiAllegati = daCaricare.map((f) => `📎 ${f.name}`).join("  ");
    const bollaUtente = [testo, nomiAllegati].filter(Boolean).join("\n");
    const conMio: ParlaMsg[] = [...storia, { role: "user", content: bollaUtente, created_at: new Date().toISOString() }];
    setMsgs(conMio);
    setInviando(true);
    try {
      // ① Salva SUBITO la conversazione: compare in Assistente → Conversazioni col messaggio
      //    di Nicola anche se la risposta arriverà quando questa pagina non ci sarà più.
      //    (Prima si salvava solo a risposta ricevuta: un refresh nel mezzo = thread mai
      //    salvato, lavoro presente in Archivio ma conversazione assente dalla lista.)
      const salvataggio = await salvaConversazioneCasella(convId, chiave, conMio);
      const id = salvataggio.id ?? convId;
      if (id) setConvId(id);
      setSalvata(true);
      setSalvataSuServer(salvataggio.suServer);
      const gruppoUpload = id || convId || "casella";
      const bloccoAllegati = await caricaAllegatiChat(gruppoUpload, daCaricare);
      const lavoro = await creaLavoroCasella(
        titolo,
        contesto || "",
        storia,
        testo || "(nessun testo — vedi allegati)",
        id,
        bloccoAllegati,
      );
      // ③ Aspetta la risposta e completa il thread salvato.
      const esito = await attendiEsitoLavoro(lavoro.id, lavoro.tipo, lavoro.timeoutMs);
      if (esito.definitiva) {
        // AR-268 — NON RICOSTRUIRE IL THREAD DA UNO SNAPSHOT VECCHIO.
        // `conMio` è congelato al momento dell'invio, ma fra l'invio e la risposta possono passare
        // fino a cinque minuti: in quell'attesa il listener del bus può aver rimpiazzato `msgs` con
        // una versione più recente. Ripartire da `conMio` cancellava tutto ciò che era arrivato nel
        // frattempo — e `salvaConversazioneCasella` faceva una PATCH cieca che SOSTITUISCE l'intera
        // colonna `messaggi`, quindi la perdita finiva anche sul server.
        // Si riparte dallo stato CORRENTE e si fonde. La stessa difesa esiste da tempo
        // nell'Assistente («ANTI-RACE al COMMIT»): mancava solo nel percorso gemello della casella.
        // Lo stato corrente si legge dal ref (aggiornato a ogni render), non dentro l'updater di
        // `setMsgs`: un updater può essere richiamato più volte da React, e quello che serve qui è
        // un valore stabile da mandare al salvataggio.
        const risposta: ParlaMsg = { role: "assistant", content: esito.testo, created_at: new Date().toISOString() };
        const daSalvare = fondiMessaggi(msgsRef.current.filter((m) => !m.pending), [...conMio, risposta]);
        setMsgs(daSalvare);
        const idFinale = (await salvaConversazioneCasella(id, chiave, daSalvare)).id;
        if (idFinale) setConvId(idFinale);
      } else {
        // Tempo scaduto: l'avviso resta solo a schermo (pending, non salvato) — la risposta
        // vera verrà ripescata dai lavori alla prossima apertura della casella/conversazione.
        setMsgs([...conMio, { role: "assistant", content: esito.testo, pending: true }]);
      }
    } catch (e: any) {
      // 🩹 Causa-radice «messaggio sparito»: se il lavoro NON parte (memoria non collegata
      //    o DB irraggiungibile per un intoppo passeggero) non ci sarà nessuna risposta, e
      //    la conversazione è finita solo in localStorage (volatile). La route ci dà già il
      //    messaggio giusto (config vs connessione): lo mostriamo com'è, con un prefisso ⚠️,
      //    invece di far credere — con la spunta verde — che sia tutto salvato e in arrivo.
      const msg = e?.message || "Il messaggio non è partito. Riprova.";
      setErr(`⚠️ ${msg} Il testo è qui sotto: non l'ho perso.`);
      setBozza(testo);
      setAllegati(daCaricare);
    } finally {
      setInviando(false);
    }
  }

  if (!aperto) {
    return (
      <button onClick={() => setAperto(true)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
        <MessageSquarePlus size={13} /> 💬 Parla con questa casella
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-brand/15 bg-brand-50/30 p-2.5 space-y-2">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-brand uppercase tracking-wide">
        <MessageSquarePlus size={12} className="shrink-0" /> <span className="shrink-0">Parla con:</span> <span className="normal-case font-medium truncate min-w-0">{titolo}</span>
        <button onClick={() => setAperto(false)} className="ml-auto shrink-0 whitespace-nowrap t-eti hover:text-brand normal-case">chiudi</button>
      </div>

      {/* Altezza fissa uguale a ChatCasella — scroll al fondo all'apertura */}
      <div ref={scrollRef} className="scroll-soft h-36 overflow-y-auto pr-1">
        <div className="space-y-1.5">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span className={`inline-block text-[12px] leading-relaxed rounded-lg px-2.5 py-1.5 whitespace-pre-wrap break-words max-w-[92%] text-left ${m.role === "user" ? "bg-brand text-white" : "chat-bubble-assistant prose-sm dark:prose-invert max-w-none"}`}>
                {m.role === "user" ? m.content : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="my-0.5" {...props} />,
                      ul: ({node, ...props}) => <ul className="my-0.5 pl-4" {...props} />,
                      ol: ({node, ...props}) => <ol className="my-0.5 pl-4" {...props} />,
                      li: ({node, ...props}) => <li className="my-0" {...props} />,
                    }}
                  >{m.content}</ReactMarkdown>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {inviando && <p className="t-eti flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Claude Max sta rispondendo…</p>}

      {/* ⚡ Finestra Skill & comandi — si apre/chiude dentro la chat dal pulsante ⚡ */}
      <FinestraComandiSkill
        aperta={skillAperte}
        onChiudi={() => setSkillAperte(false)}
        onScegli={(cmd) => {
          setBozza(cmd);
          setSkillAperte(false);
          setTimeout(() => textareaRef.current?.focus(), 0);
        }}
      />

      <AnteprimaAllegatiChat allegati={allegati} onTogli={togliAllegato} disabilitato={inviando} />

      <textarea
        ref={textareaRef}
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        onKeyDown={(e) => gestisciInvioChat(e, invia)}
        rows={2}
        placeholder={`Scrivi alla macchina su questa casella…  (${hintInvio})`}
        className={classeCampo("input-soft w-full text-[12.5px] resize-y")}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <BottoneSkill aperta={skillAperte} onToggle={() => setSkillAperte((v) => !v)} lato={32} icona={14} />
        <BottoneAllegatiChat
          disabled={inviando || allegati.length >= 6}
          iconSize={13}
          etichetta="Allega"
          className="inline-flex items-center gap-1.5 border border-brand/30 text-brand text-[12px] font-medium px-2.5 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand/10 transition"
          onScegli={aggiungiFile}
        />
        <BottoneFotoChat
          disabled={inviando || allegati.length >= 6}
          iconSize={13}
          etichetta="Foto"
          className="inline-flex items-center gap-1.5 border border-brand/30 text-brand text-[12px] font-medium px-2.5 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand/10 transition"
          onScegli={aggiungiFile}
        />
        <button
          onClick={invia}
          disabled={inviando || (!bozza.trim() && allegati.length === 0)}
          className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition"
        >
          {inviando ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Invia a Claude Max
        </button>
        {salvata && !inviando && (
          salvataSuServer ? (
            <span className="t-eti inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={12} /> salvata in Conversazioni</span>
          ) : (
            <span className="t-eti inline-flex items-center gap-1 text-amber-600" title="La memoria condivisa non è collegata: questa chat vive solo nel browser di questo dispositivo e può sparire. Collega il database per salvarla davvero.">
              <CheckCircle2 size={12} /> salvata solo su questo dispositivo
            </span>
          )
        )}
        {err && <span className="t-eti text-red-600">{err}</span>}
      </div>
    </div>
  );
}
