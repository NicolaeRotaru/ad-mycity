"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight, RotateCcw, Bot } from "lucide-react";

// La corsia operativa: le mosse già pronte preparate dall'AD. Per ogni mossa:
// situazione/perché, chi l'ha preparata, l'anteprima del testo, e i bottoni
// "Approva e fai" / "Rifiuta". Quando approvi, l'azione parte dalle "mani"
// (lib/mani.ts): oggi è collegata l'EMAIL — invia davvero solo con chiave +
// interruttore attivo, altrimenti simula o resta in coda. Mai invii per sbaglio.

type Stato = "" | "rifiutata" | "fatta" | "simulata" | "coda";
type Azione = {
  id: string;
  titolo: string;
  reparto: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  canale: string;
  destinatario: string;
  perche: string;
  preparato: string;
  testo: string;
  fonte: "vault" | "sentinella";
  stato: Stato;
  esito: string;
};

const BORDO: Record<string, string> = { rosso: "border-red-200", giallo: "border-amber-200", verde: "border-green-200", "?": "border-black/[0.08]" };
const PALLINO: Record<string, string> = { rosso: "bg-red-500", giallo: "bg-amber-500", verde: "bg-green-500", "?": "bg-black/30" };
const ETICHETTA: Record<string, string> = { rosso: "🔴 serve la tua firma", giallo: "🟡 un tocco", verde: "🟢 sicura", "?": "" };

function badgeStato(s: Stato): { txt: string; cls: string } | null {
  if (s === "fatta") return { txt: "✅ Inviata", cls: "bg-green-50 text-green-700" };
  if (s === "simulata") return { txt: "🧪 Simulata (test)", cls: "bg-amber-50 text-amber-700" };
  if (s === "coda") return { txt: "⏳ In coda", cls: "bg-black/[0.05] text-black/55" };
  if (s === "rifiutata") return { txt: "✕ rifiutata", cls: "bg-black/[0.05] text-black/50" };
  return null;
}

export default function Azioni() {
  const [azioni, setAzioni] = useState<Azione[]>([]);
  const [salvataggio, setSalvataggio] = useState(false);
  const [collegato, setCollegato] = useState(true);
  const [autopilota, setAutopilota] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aperte, setAperte] = useState<Set<string>>(new Set());

  const carica = useCallback(async () => {
    const d = await fetch("/api/azioni-pronte").then((r) => r.json()).catch(() => null);
    if (d) {
      setAzioni(d.azioni || []);
      setSalvataggio(Boolean(d.salvataggio));
      setCollegato(Boolean(d.collegato));
      setAutopilota(Boolean(d.autopilota));
    } else {
      setCollegato(false);
    }
    return d;
  }, []);

  useEffect(() => {
    (async () => {
      const d = await carica();
      // Se l'autopilota è acceso, esegue da solo le 🟢 e poi ricarica.
      if (d?.autopilota) {
        await fetch("/api/azioni-pronte/autopilota", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
        await carica();
      }
      setLoading(false);
    })();
  }, [carica]);

  async function toggleAutopilota() {
    const nuovo = !autopilota;
    setAutopilota(nuovo);
    try {
      await fetch("/api/azioni-pronte/autopilota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attiva: nuovo }),
      });
      await carica();
    } catch {
      /* ignora */
    }
  }

  function patch(id: string, p: Partial<Azione>) {
    setAzioni((list) => list.map((a) => (a.id === id ? { ...a, ...p } : a)));
  }

  async function decidi(id: string, dec: "approva" | "rifiuta" | "annulla") {
    if (dec === "approva") patch(id, { stato: "coda", esito: "Invio in corso…" });
    else if (dec === "rifiuta") patch(id, { stato: "rifiutata", esito: "" });
    else patch(id, { stato: "", esito: "" });
    try {
      const r = await fetch("/api/azioni-pronte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decisione: dec }),
      }).then((x) => x.json());
      if (r && typeof r.stato === "string") patch(id, { stato: r.stato as Stato, esito: r.esito || "" });
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

  const daDecidere = azioni.filter((a) => !a.stato).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">⚡ Azioni pronte</h2>
        <p className="t-eti mt-0.5">Le mosse che l'AD ha già preparato. Le approvi con un tocco; le sicure 🟢 le farà da solo.</p>
      </div>

      {/* Come funziona l'esecuzione (le "mani") */}
      <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-3 text-[12.5px] text-ink/85 flex items-start gap-2">
        <Zap size={15} className="text-brand mt-0.5 shrink-0" />
        <span>
          Quando approvi, l'azione parte dalle «mani». Oggi è collegata l'<b>email</b>: invia <b>davvero</b> solo con la
          chiave e l'interruttore attivi; altrimenti la <b>simula</b> o resta <b>in coda</b>. <b>Mai invii per sbaglio.</b>
        </span>
      </div>

      {/* Autopilota: le azioni sicure 🟢 le fa da solo */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={toggleAutopilota}
          className={`inline-flex items-center gap-2 text-[12.5px] font-medium px-3 py-2 rounded-xl border transition ${
            autopilota ? "border-brand/40 bg-brand-50 text-brand" : "border-black/10 text-black/60 hover:bg-black/[0.04]"
          }`}
        >
          <Bot size={15} /> Autopilota azioni sicure 🟢: <b>{autopilota ? "ON" : "OFF"}</b>
        </button>
        <span className="t-eti">Quando è ON, le mosse 🟢 partono da sole e te le segno («🤖 in automatico»). Restano sicure: senza modalità live, simula.</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-black/45 text-sm py-4">
          <Loader2 size={16} className="animate-spin" /> Carico le azioni…
        </div>
      )}

      {!loading && !collegato && (
        <div className="card p-4 text-sm text-black/55">
          Le azioni le scrive l'AD in <code className="bg-black/[0.06] px-1 rounded">90-Memoria-AI/AZIONI-PRONTE.md</code>. Memoria non raggiungibile ora.
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
              const decisa = a.stato !== "";
              const open = aperte.has(a.id);
              const b = badgeStato(a.stato);
              return (
                <div key={a.id} className={`card border ${BORDO[a.livello]} p-4 ${decisa ? "opacity-80" : ""}`}>
                  {/* intestazione */}
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PALLINO[a.livello]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="t-sez leading-snug">{a.titolo}</div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        <span className="badge badge-off">{a.reparto}</span>
                        {ETICHETTA[a.livello] && <span className="t-eti">{ETICHETTA[a.livello]}</span>}
                        {a.fonte === "sentinella" && <span className="badge badge-on">🛡️ da sentinella</span>}
                      </div>
                    </div>
                    {b && <span className={`badge shrink-0 ${b.cls}`}>{b.txt}</span>}
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

                  {/* esito dopo la decisione */}
                  {decisa && a.esito && <p className="t-eti mt-2 text-ink/70">{a.esito}</p>}

                  {/* bottoni */}
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
