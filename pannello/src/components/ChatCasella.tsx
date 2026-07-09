"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { preparaLavoro, messaggioLavoroInCorso } from "@/lib/comandi";
import { salvaGruppoLavoroLocale, messaggiDaGruppo, type LavoroBase, type MsgChat } from "@/lib/lavori-gruppo";

const HEADERS = { "Content-Type": "application/json" };

// Polling ravvicinato (2s) finché il cervello marca il lavoro "fatto"/"errore" (o timeout).
// Copia della logica di parla.ts, qui agganciata al gruppo-conversazione della casella.
async function attendiLavoro(id: string, tipo: string, timeoutMs: number): Promise<string> {
  const scadenza = Date.now() + timeoutMs;
  while (Date.now() < scadenza) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const d = await fetch("/api/lavori", { cache: "no-store" }).then((r) => r.json());
      const l = Array.isArray(d.lavori) ? d.lavori.find((x: any) => x.id === id) : null;
      if (l && (l.stato === "fatto" || l.stato === "errore")) {
        return l.risultato || (l.stato === "errore"
          ? "🔄 Non è partita al primo colpo — la trovi come «da riapprovare» nell'area Lavori: un clic e riparte."
          : "(risposta vuota)");
      }
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
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, inviando]);

  async function invia() {
    const testo = bozza.trim();
    if (!testo || inviando) return;
    setErr("");
    setBozza("");
    const storia = msgs.map((m) => `${m.role === "user" ? "Nicola" : "AD"}: ${m.content}`).join("\n");
    setMsgs((m) => [...m, { role: "user", content: testo }]);
    setInviando(true);
    try {
      const prep = preparaLavoro(testo);
      const richiesta =
        (storia ? `## Conversazione finora\n${storia}\n\n` : "") +
        `## Nuovo messaggio di Nicola\n${testo}\n\n` +
        `## Istruzioni\nRispondi all'ultimo messaggio in italiano, come in una chat: conciso e concreto. ` +
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
      if (typeof window !== "undefined") window.dispatchEvent(new Event("mycity:lavori"));
      const risposta = await attendiLavoro(post.lavoro.id, prep.tipo, prep.timeoutMs);
      setMsgs((m) => [...m, { role: "assistant", content: risposta }]);
      if (typeof window !== "undefined") window.dispatchEvent(new Event("mycity:lavori"));
    } catch (e: any) {
      // Non perdere il messaggio: lo lascio come bolla e spiego l'errore, con la bozza pronta a ripartire.
      setErr(e?.message || "Non riuscito.");
      setBozza(testo);
    } finally {
      setInviando(false);
    }
  }

  return (
    <div className="border-t border-brand/15 bg-brand-50/20 dark:bg-brand/[0.06] px-3 pb-3 pt-2.5 space-y-2">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-brand uppercase tracking-wide">
        💬 Chat con questa casella
        <button onClick={onChiudi} className="ml-auto normal-case inline-flex items-center gap-1 text-black/40 dark:text-white/40 hover:text-brand transition">
          <X size={12} /> chiudi
        </button>
      </div>

      {msgs.length > 0 && (
        <div className="scroll-soft space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span
                className={`inline-block text-[12.5px] leading-relaxed rounded-lg px-2.5 py-1.5 whitespace-pre-wrap break-words max-w-[92%] text-left ${
                  m.role === "user" ? "bg-brand text-white" : "chat-bubble-assistant prose-sm dark:prose-invert max-w-none"
                }`}
              >
                {m.role === "user" ? m.content : <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>}
              </span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}

      {inviando && (
        <p className="t-eti flex items-center gap-1">
          <Loader2 size={12} className="animate-spin" /> Claude Max sta rispondendo…
        </p>
      )}

      <textarea
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        onKeyDown={(e) => {
          // Invio = manda · Maiusc+Invio = va a capo. Guardia IME per gli accenti.
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            invia();
          }
        }}
        rows={2}
        placeholder="Rispondi qui, resti nella stessa conversazione…  (Invio = invia · Maiusc+Invio = a capo)"
        className="input-soft w-full text-[12.5px] resize-y"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={invia}
          disabled={inviando || !bozza.trim()}
          className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition"
        >
          {inviando ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Invia a Claude Max
        </button>
        {err && <span className="t-eti text-red-600">{err}</span>}
      </div>
    </div>
  );
}
