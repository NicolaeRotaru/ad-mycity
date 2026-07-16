"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FinestraComandiSkill, { BottoneSkill } from "@/components/FinestraComandiSkill";
import BottoneAllegatiChat from "@/components/BottoneAllegatiChat";
import BottoneFotoChat from "@/components/BottoneFotoChat";
import AnteprimaAllegatiChat from "@/components/AnteprimaAllegatiChat";
import { preparaLavoro, messaggioLavoroInCorso } from "@/lib/comandi";
import { salvaGruppoLavoroLocale, messaggiDaGruppo, type LavoroBase, type MsgChat } from "@/lib/lavori-gruppo";
import { bloccoMemoriaChat } from "@/lib/memoria-chat";
import { gestisciInvioChat, hintInvioChat } from "@/lib/chat-input";
import { emitSync } from "@/lib/panel-sync";
import { MSG_RISPOSTA_VUOTA } from "@/lib/parla";

const HEADERS = { "Content-Type": "application/json" };

// Polling ravvicinato (1,5s) finché il cervello marca il lavoro "fatto"/"errore" (o timeout).
// STREAMING (step 2): mentre il lavoro è "in_corso", il worker scrive la risposta PARZIALE nel campo
// risultato; qui la passiamo a onParziale così la chat la mostra crescere parola-per-parola.
async function attendiLavoro(
  id: string,
  tipo: string,
  timeoutMs: number,
  onParziale?: (testo: string) => void,
): Promise<string> {
  const scadenza = Date.now() + timeoutMs;
  while (Date.now() < scadenza) {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const d = await fetch("/api/lavori", { cache: "no-store" }).then((r) => r.json());
      const l = Array.isArray(d.lavori) ? d.lavori.find((x: any) => x.id === id) : null;
      if (l && (l.stato === "fatto" || l.stato === "errore")) {
        return l.risultato || (l.stato === "errore"
          ? "🔄 Non è partita al primo colpo — la trovi come «da riapprovare» nell'area Lavori: un clic e riparte."
          : MSG_RISPOSTA_VUOTA);
      }
      // risposta che sta arrivando: mostra il testo parziale.
      if (l && l.stato === "in_corso" && l.risultato && onParziale) onParziale(l.risultato);
    } catch {
      /* rete instabile: riprovo */
    }
  }
  return messaggioLavoroInCorso(tipo);
}

// 💬 La casella dell'Archivio È una chat: una finestra che si apre e si chiude SUL POSTO.
// Non salta più all'Assistente (niente disorientamento «su quale casella avevo cliccato?»).
// Semina la conversazione dai lavori del gruppo (incluse le TUE risposte già scritte) e
// permette di continuarla: ogni nuovo messaggio resta nello STESSO gruppo (gruppo_id).
export default function ChatCasella({
  gruppoId,
  lavori,
  onChiudi,
}: {
  gruppoId: string;
  lavori: LavoroBase[];
  onChiudi: () => void;
}) {
  // Semina UNA volta: la conversazione ricostruita dal gruppo (domande di Nicola + risposte dell'AD).
  // Poi la chat vive di stato locale — così un refresh dei lavori dal genitore non duplica i messaggi.
  const [msgs, setMsgs] = useState<MsgChat[]>(() => messaggiDaGruppo(lavori).filter((m) => !m.pending));
  const [bozza, setBozza] = useState("");
  const [inviando, setInviando] = useState(false);
  const [err, setErr] = useState("");
  // Testo che arriva parola-per-parola mentre Claude risponde (streaming).
  const [streamingText, setStreamingText] = useState("");
  // 📎 Foto/file scelti da Nicola, in attesa di partire col prossimo messaggio.
  const [allegati, setAllegati] = useState<File[]>([]);
  // ⚡ Finestra "Skill & comandi" dentro la chat (si apre dal pulsante ⚡ accanto ad Allega/Invia).
  const [skillAperte, setSkillAperte] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hintInvio, setHintInvio] = useState("Invio = invia · Maiusc+Invio = a capo");

  function scrollBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  // Scroll al fondo subito all'apertura (anche con storico lungo)
  useEffect(() => setHintInvio(hintInvioChat()), []);
  useEffect(() => {
    requestAnimationFrame(scrollBottom);
  }, []);

  // Scroll al fondo a ogni nuovo messaggio o testo in streaming
  useEffect(() => {
    scrollBottom();
  }, [msgs, streamingText]);

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
    setBozza("");
    setAllegati([]);
    const storia = msgs.map((m) => `${m.role === "user" ? "Nicola" : "AD"}: ${m.content}`).join("\n");
    // Nella bolla mostro il testo + i nomi degli allegati (così la conversazione resta leggibile).
    const nomiAllegati = daCaricare.map((f) => `📎 ${f.name}`).join("  ");
    const bollaUtente = [testo, nomiAllegati].filter(Boolean).join("\n");
    setMsgs((m) => [...m, { role: "user", content: bollaUtente }]);
    setInviando(true);
    try {
      // 1) Carico prima gli allegati sullo storage, poi mando al cervello solo i loro percorsi.
      let bloccoAllegati = "";
      if (daCaricare.length > 0) {
        const fd = new FormData();
        fd.append("gruppo_id", gruppoId);
        daCaricare.forEach((f) => fd.append("file", f));
        const up = await fetch("/api/allegato", { method: "POST", body: fd })
          .then((r) => r.json())
          .catch(() => null);
        if (!up?.ok) throw new Error(up?.error || "Caricamento degli allegati non riuscito.");
        const righe = (up.allegati as Array<{ nome: string; tipo: string; percorso: string }>)
          .map((a) => `@ALLEGATO nome="${a.nome}" tipo="${a.tipo}" percorso="${a.percorso}"`)
          .join("\n");
        bloccoAllegati =
          `\n\n## Allegati di Nicola\nNicola ha allegato ${up.allegati.length} file a questo messaggio ` +
          `(foto o documenti). Sono nello storage: aprili e tienine conto nella risposta.\n${righe}`;
      }
      const prep = preparaLavoro(testo || "Guarda gli allegati");
      const memoria = await bloccoMemoriaChat(gruppoId);
      const richiesta =
        (memoria ? `${memoria}\n` : "") +
        (storia ? `## Conversazione finora\n${storia}\n\n` : "") +
        `## Nuovo messaggio di Nicola\n${testo || "(nessun testo — vedi allegati)"}` +
        bloccoAllegati +
        `\n\n## Istruzioni\nRispondi all'ultimo messaggio in italiano, come in una chat: conciso e concreto. ` +
        `Se Nicola dice di aver completato un passo, aggiorna la memoria nel vault e dichiara cosa hai aggiornato. Rispetta 🟢🟡🔴.`;
      const post = await fetch("/api/lavori", {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ richiesta, tipo: prep.tipo, gruppo_id: gruppoId }),
      })
        .then((r) => r.json())
        .catch(() => null);
      if (!post?.ok || !post.lavoro) {
        throw new Error(post?.error || "Serve il database di memoria collegato (tabella 'lavori').");
      }
      // Il nuovo messaggio resta nella STESSA conversazione anche in localStorage.
      salvaGruppoLavoroLocale(post.lavoro.id, gruppoId);
      // Avvisa l'Archivio che è comparso un lavoro nuovo (contatore/stato del gruppo).
      if (typeof window !== "undefined") emitSync("lavori");
      setStreamingText("");
      const risposta = await attendiLavoro(post.lavoro.id, prep.tipo, prep.timeoutMs, (parziale) =>
        setStreamingText(parziale),
      );
      setMsgs((m) => [...m, { role: "assistant", content: risposta }]);
      setStreamingText("");
      if (typeof window !== "undefined") {
        emitSync("memoria");
        emitSync("radiografia");
        emitSync("azioni");
      }
    } catch (e: any) {
      // Non perdere il messaggio: lo lascio come bolla e spiego l'errore, con la bozza pronta a ripartire.
      setErr(e?.message || "Non riuscito.");
      setBozza(testo);
      setAllegati(daCaricare);
      setStreamingText("");
    } finally {
      setInviando(false);
    }
  }

  return (
    <div className="border-t-2 border-brand/35 bg-brand-50/50 dark:bg-brand/[0.09] px-3 pb-3 pt-0 space-y-2">
      <div className="flex items-center gap-2 -mx-3 px-3 py-2 bg-brand/[0.07] dark:bg-brand/[0.12] border-b border-brand/15 dark:border-brand/20">
        <span className="text-brand text-[11px]">💬</span>
        <span className="text-[10.5px] font-bold text-brand uppercase tracking-wider">Chat con questa casella</span>
        <button onClick={onChiudi} className="ml-auto shrink-0 whitespace-nowrap normal-case inline-flex items-center gap-1 text-black/40 dark:text-white/40 hover:text-brand transition text-[11px]">
          <X size={12} /> chiudi
        </button>
      </div>

      {/* Contenitore messaggi a altezza FISSA: nuova e vecchia chat hanno lo stesso ingombro */}
      <div ref={scrollRef} className="scroll-soft h-28 overflow-y-auto pr-1 pt-1">
        <div className="space-y-1.5">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span
                className={`inline-block text-[12.5px] leading-relaxed rounded-lg px-2.5 py-1.5 whitespace-pre-wrap break-words max-w-[92%] text-left ${
                  m.role === "user" ? "bg-brand text-white" : "chat-bubble-assistant prose-sm dark:prose-invert max-w-none"
                }`}
              >
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

          {/* Risposta in arrivo parola per parola (streaming) */}
          {inviando && streamingText && (
            <div className="text-left">
              <span className="inline-block text-[12.5px] leading-relaxed rounded-lg px-2.5 py-1.5 whitespace-pre-wrap break-words max-w-[92%] text-left chat-bubble-assistant prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="my-0.5" {...props} />,
                    ul: ({node, ...props}) => <ul className="my-0.5 pl-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="my-0.5 pl-4" {...props} />,
                    li: ({node, ...props}) => <li className="my-0" {...props} />,
                  }}
                >{streamingText}</ReactMarkdown>
                <span className="ml-0.5 animate-pulse">▍</span>
              </span>
            </div>
          )}

          {inviando && !streamingText && (
            <p className="t-eti flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Claude Max sta rispondendo…
            </p>
          )}
        </div>
      </div>

      <FinestraComandiSkill
        aperta={skillAperte}
        onChiudi={() => setSkillAperte(false)}
        onScegli={(cmd) => {
          setBozza(cmd);
          setSkillAperte(false);
          setTimeout(() => textareaRef.current?.focus(), 0);
        }}
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
        {err && <span className="t-eti text-red-600">{err}</span>}
      </div>
      <AnteprimaAllegatiChat allegati={allegati} onTogli={togliAllegato} disabilitato={inviando} />
      <textarea
        ref={textareaRef}
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        onKeyDown={(e) => gestisciInvioChat(e, invia)}
        rows={2}
        placeholder={`Rispondi qui, resti nella stessa conversazione…  (${hintInvio})`}
        className="input-soft w-full text-[12.5px] resize-y"
      />
    </div>
  );
}
