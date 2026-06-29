"use client";

import { useEffect, useRef, useState } from "react";

// 🧠 Chat dell'AD digitale dentro l'ADMIN del marketplace (mycity-live).
//
// Stessa logica del Pannello di Controllo, una sola differenza concettuale: NON
// chiama l'API a pagamento. Scrive una riga nella coda "lavori" della MEMORIA
// (il Supabase del progetto AD, separato dal DB del marketplace); il worker sul
// VPS la esegue con il tuo abbonamento Max (`claude -p`) e riscrive il risultato.
// Qui facciamo polling finche' la risposta non e' pronta.
//
// MEMORIA DELLA CHAT: ad ogni turno mandiamo l'INTERA cronologia, non solo
// l'ultimo messaggio. Cosi' il dialogo "cosa non ho ancora fatto da X?" -> "l'ho
// iscritto" si tiene il filo e l'AD capisce il contesto.
//
// Drop-in: copia questo file in mycity-live (es. src/components/admin/ChatAD.tsx)
// e usalo in una pagina admin: `import ChatAD from "@/components/admin/ChatAD"`.

type Msg = { role: "user" | "assistant"; content: string };

const POLL_MS = 2000;       // ogni quanto chiedo se la risposta e' pronta
const TIMEOUT_MS = 180000;  // dopo quanto smetto di aspettare un lavoro (il Max puo' metterci qualche minuto)

export default function ChatAD() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const fondo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fondo.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function invia() {
    const t = input.trim();
    if (!t || loading) return;
    setInput("");
    const storia: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(storia);
    setLoading(true);

    // STRADA A (memoria della chat): allego tutta la conversazione, non solo l'ultimo
    // messaggio. Il worker passa questo testo a Claude Code, che ha gia' CLAUDE.md +
    // vault, quindi capisce il contesto e puo' aggiornare la memoria quando dici "fatto".
    const richiesta =
      "## Conversazione finora\n" +
      storia.map((m) => `${m.role === "user" ? "Nicola" : "AD"}: ${m.content}`).join("\n") +
      "\n\n## Istruzioni\nRispondi all'ultimo messaggio di Nicola in italiano, conciso e concreto. " +
      "Se Nicola comunica che ha completato un passo (es. ha iscritto un negozio), AGGIORNA la memoria nel vault " +
      "(checklist del negozio / STATO) e dichiara cosa hai aggiornato. Rispetta 🟢🟡🔴: le azioni reali 🔴 restano da firmare.";

    try {
      const res = await fetch("/api/admin/ad-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ richiesta, tipo: "chat" }),
      });
      const d = await res.json();
      if (!d.ok || !d.id) {
        setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${d.error || "Non collegato alla memoria dell'AD."}` }]);
        return;
      }
      const risposta = await attendi(d.id);
      setMessages((m) => [...m, { role: "assistant", content: risposta }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Connessione fallita." }]);
    } finally {
      setLoading(false);
    }
  }

  // Polling del singolo lavoro finche' e' "fatto"/"errore" (o scade il timeout).
  async function attendi(id: string): Promise<string> {
    const fine = Date.now() + TIMEOUT_MS;
    while (Date.now() < fine) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      try {
        const res = await fetch(`/api/admin/ad-chat?id=${id}`, { cache: "no-store" });
        const d = await res.json();
        const l = d?.lavoro;
        if (l && (l.stato === "fatto" || l.stato === "errore")) {
          return l.risultato || (l.stato === "errore" ? "⚠️ Errore nell'esecuzione." : "(risposta vuota)");
        }
      } catch {
        // rete instabile: riprovo al giro dopo
      }
    }
    return "⌛ Ci sto ancora lavorando: la risposta arrivera' a breve (il Max puo' metterci qualche minuto).";
  }

  return (
    <section className="flex flex-col h-[600px] max-h-[80vh] bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
      <header className="px-4 py-3 border-b border-black/10 flex items-center gap-2.5">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">🧠</span>
        <div>
          <div className="text-sm font-semibold">AD MyCity — chat</div>
          <div className="text-xs text-black/40">Col tuo Max, in tempo quasi reale. Nessuna API a pagamento.</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-black/40 leading-relaxed">
            Scrivimi come ti viene, per esempio:<br />
            «cosa non ho ancora fatto da [negozio]?» · «ho fatto iscrivere [negozio]» · «come stiamo?»
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap max-w-[85%] leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-black/5 text-black rounded-bl-sm"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <span className="inline-block px-3 py-2 rounded-2xl bg-black/5 text-black/50 text-sm">🧠 sto pensando…</span>
          </div>
        )}
        <div ref={fondo} />
      </div>

      <div className="p-3 border-t border-black/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              invia();
            }
          }}
          placeholder="Scrivi all'AD (col tuo Max)…"
          className="flex-1 px-3 py-2 rounded-xl border border-black/15 text-sm outline-none focus:border-indigo-400"
        />
        <button
          onClick={invia}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium disabled:opacity-40"
        >
          Invia
        </button>
      </div>
    </section>
  );
}
