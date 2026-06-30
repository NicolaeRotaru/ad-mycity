"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, Loader2, CheckCircle2 } from "lucide-react";
import { chiediACasella, salvaConversazioneCasella, type ParlaMsg } from "@/lib/parla";

// 💬 Pulsante "Parla con questa casella" — riutilizzabile su OGNI casella del Pannello.
// Chiuso di default: un click lo apre. Manda il messaggio (col contesto della casella) a
// Claude Max, mostra la risposta sul posto, e salva la conversazione in Assistenza → Conversazioni.
export default function ParlaCasella({ titolo, contesto }: { titolo: string; contesto?: string }) {
  const [aperto, setAperto] = useState(false);
  const [bozza, setBozza] = useState("");
  const [inviando, setInviando] = useState(false);
  const [msgs, setMsgs] = useState<ParlaMsg[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [salvata, setSalvata] = useState(false);
  const [err, setErr] = useState("");

  async function invia() {
    const testo = bozza.trim();
    if (!testo || inviando) return;
    setErr("");
    setBozza("");
    const storia = msgs;
    const conMio: ParlaMsg[] = [...msgs, { role: "user", content: testo }];
    setMsgs(conMio);
    setInviando(true);
    try {
      const risposta = await chiediACasella(titolo, contesto || "", storia, testo);
      const completa: ParlaMsg[] = [...conMio, { role: "assistant", content: risposta }];
      setMsgs(completa);
      const id = await salvaConversazioneCasella(convId, `💬 ${titolo}`, completa);
      setConvId(id);
      setSalvata(true);
    } catch (e: any) {
      setErr(e?.message || "Non riuscito.");
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
        <MessageSquarePlus size={12} /> Parla con: <span className="normal-case font-medium truncate">{titolo}</span>
        <button onClick={() => setAperto(false)} className="ml-auto t-eti hover:text-brand normal-case">chiudi</button>
      </div>

      {msgs.length > 0 && (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span className={`inline-block text-[12px] leading-relaxed rounded-lg px-2.5 py-1.5 whitespace-pre-wrap max-w-[92%] ${m.role === "user" ? "bg-brand text-white" : "chat-bubble-assistant"}`}>
                {m.content}
              </span>
            </div>
          ))}
        </div>
      )}

      {inviando && <p className="t-eti flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Claude Max sta rispondendo…</p>}

      <textarea
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        rows={2}
        placeholder="Scrivi alla macchina su questa casella…"
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
        {salvata && !inviando && <span className="t-eti inline-flex items-center gap-1 text-green-700"><CheckCircle2 size={12} /> salvata in Conversazioni</span>}
        {err && <span className="t-eti text-red-600">{err}</span>}
      </div>
    </div>
  );
}
