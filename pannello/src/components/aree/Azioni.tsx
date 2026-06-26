"use client";

import { useEffect, useState } from "react";
import { Zap, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

// La corsia operativa: le mosse già pronte preparate dall'AD. Per ogni mossa:
// situazione/perché, chi l'ha preparata, l'anteprima del testo, e i bottoni
// "Approva e fai" / "Rifiuta". MODALITÀ CODA (Tappa 1): approvare segna la
// decisione; l'azione parte davvero quando colleghiamo le "mani" (Tappa 2).

type Azione = {
  id: string;
  titolo: string;
  reparto: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  canale: string;
  perche: string;
  preparato: string;
  testo: string;
  decisione: "" | "approvata" | "rifiutata";
};

const STILE: Record<string, string> = {
  rosso: "border-red-200",
  giallo: "border-amber-200",
  verde: "border-green-200",
  "?": "border-black/[0.08]",
};
const PALLINO: Record<string, string> = {
  rosso: "bg-red-500",
  giallo: "bg-amber-500",
  verde: "bg-green-500",
  "?": "bg-black/30",
};
const ETICHETTA: Record<string, string> = {
  rosso: "🔴 serve la tua firma",
  giallo: "🟡 un tocco",
  verde: "🟢 sicura",
  "?": "",
};

export default function Azioni() {
  const [azioni, setAzioni] = useState<Azione[]>([]);
  const [salvataggio, setSalvataggio] = useState(false);
  const [collegato, setCollegato] = useState(true);
  const [loading, setLoading] = useState(true);
  const [aperte, setAperte] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/azioni-pronte")
      .then((r) => r.json())
      .then((d) => {
        setAzioni(d.azioni || []);
        setSalvataggio(Boolean(d.salvataggio));
        setCollegato(Boolean(d.collegato));
      })
      .catch(() => setCollegato(false))
      .finally(() => setLoading(false));
  }, []);

  async function decidi(id: string, dec: "approva" | "rifiuta" | "annulla") {
    const nuova = dec === "approva" ? "approvata" : dec === "rifiuta" ? "rifiutata" : "";
    setAzioni((list) => list.map((a) => (a.id === id ? { ...a, decisione: nuova } : a)));
    try {
      await fetch("/api/azioni-pronte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decisione: dec }),
      });
    } catch {
      /* alla prossima ricarica torna lo stato del server */
    }
  }

  const toggle = (id: string) =>
    setAperte((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const daDecidere = azioni.filter((a) => !a.decisione).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">⚡ Azioni pronte</h2>
        <p className="t-eti mt-0.5">Le mosse che l'AD ha già preparato. Le approvi con un tocco; le sicure 🟢 le farà da solo.</p>
      </div>

      {/* Spiegazione modalità coda (Tappa 1) */}
      <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-3 text-[12.5px] text-ink/85 flex items-start gap-2">
        <Zap size={15} className="text-brand mt-0.5 shrink-0" />
        <span>
          <b>Per ora è una prova senza rischi:</b> «Approva e fai» mette l'azione <b>in coda</b>. Partirà davvero quando
          colleghiamo le «mani» (email, notifiche, sito) — Tappa 2.
        </span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-black/45 text-sm py-4">
          <Loader2 size={16} className="animate-spin" /> Carico le azioni…
        </div>
      )}

      {!loading && !collegato && (
        <div className="card p-4 text-sm text-black/55">
          Le azioni le scrive l'AD in <code className="bg-black/[0.06] px-1 rounded">90-Memoria-AI/AZIONI-PRONTE.md</code>. Memoria non raggiungibile in questo momento.
        </div>
      )}

      {!loading && collegato && azioni.length === 0 && (
        <div className="card p-4 text-sm text-black/55">Nessuna azione pronta adesso. Quando l'AD prepara una mossa, compare qui.</div>
      )}

      {!loading && azioni.length > 0 && (
        <>
          <div className="t-eti">{daDecidere} da decidere · {azioni.length - daDecidere} già decise</div>
          <div className="space-y-2.5">
            {azioni.map((a) => {
              const decisa = a.decisione !== "";
              const open = aperte.has(a.id);
              return (
                <div key={a.id} className={`card border ${STILE[a.livello]} p-4 ${decisa ? "opacity-75" : ""}`}>
                  {/* intestazione */}
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PALLINO[a.livello]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="t-sez leading-snug">{a.titolo}</div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        <span className="badge badge-off">{a.reparto}</span>
                        {ETICHETTA[a.livello] && <span className="t-eti">{ETICHETTA[a.livello]}</span>}
                      </div>
                    </div>
                    {decisa && (
                      <span className={`badge shrink-0 ${a.decisione === "approvata" ? "bg-green-50 text-green-700" : "bg-black/[0.05] text-black/50"}`}>
                        {a.decisione === "approvata" ? "✅ in coda" : "✕ rifiutata"}
                      </span>
                    )}
                  </div>

                  {/* perché + chi + canale */}
                  <p className="t-corpo mt-2">{a.perche}</p>
                  <div className="t-eti mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {a.preparato && <span>preparato da {a.preparato}</span>}
                    {a.canale && <span>· canale: {a.canale}</span>}
                  </div>

                  {/* anteprima testo */}
                  {a.testo && (
                    <div className="mt-2.5">
                      <button onClick={() => toggle(a.id)} className="t-eti hover:text-brand inline-flex items-center gap-1 transition">
                        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Anteprima del testo
                      </button>
                      {open && (
                        <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12.5px] text-ink/85 leading-relaxed border-l-2 border-brand/20 pl-3 bg-paper/40 rounded-r-lg py-2">
                          {a.testo}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* azioni */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!decisa ? (
                      <>
                        <button
                          onClick={() => decidi(a.id, "approva")}
                          className="inline-flex items-center gap-1.5 bg-brand text-white text-[13px] font-medium px-3.5 py-2 rounded-xl shadow-card hover:bg-brand-dark active:scale-[0.98] transition"
                        >
                          <CheckCircle2 size={15} /> Approva e fai
                        </button>
                        <button
                          onClick={() => decidi(a.id, "rifiuta")}
                          className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-xl border border-black/10 text-black/60 hover:bg-black/[0.04] active:scale-[0.98] transition"
                        >
                          <XCircle size={15} /> Rifiuta
                        </button>
                      </>
                    ) : (
                      <button onClick={() => decidi(a.id, "annulla")} className="inline-flex items-center gap-1.5 t-eti hover:text-brand transition">
                        <RotateCcw size={13} /> annulla
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!salvataggio && (
            <p className="t-eti">
              ⚠️ Le decisioni non si salvano ancora: collega la memoria (tabella «impostazioni») e resteranno anche dopo il refresh e su ogni dispositivo.
            </p>
          )}
        </>
      )}
    </div>
  );
}
