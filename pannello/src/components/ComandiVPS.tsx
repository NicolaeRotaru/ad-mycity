"use client";

import { useCallback, useEffect, useState } from "react";
import { Terminal, Loader2, RotateCcw, Unlock, Play, Sunrise, Moon, RefreshCw } from "lucide-react";
import { faRelativo } from "@/lib/format";

// 🎛️ Comandi macchina (VPS) — dal Pannello mando alla macchina un comando e ne vedo il risultato,
// senza SSH. Solo comandi SICURI da una lista chiusa (niente shell libera): ognuno o riavvia il
// worker o mette in coda un lavoro che il worker sa già eseguire. A eseguirli è il worker sul
// server: se è acceso partono subito, altrimenti restano in coda e ripartono da soli.

type Risultato = {
  id: string; tipo: string; stato: string; richiesta: string; risultato: string;
  created_at: string; updated_at: string;
};

// Pulsanti curati, con l'endpoint e il payload giusti. "sblocca" usa l'endpoint esistente.
const PULSANTI: { id: string; label: string; icon: React.ReactNode; endpoint: string; body?: any; tono?: "brand" | "neutro" }[] = [
  { id: "giro", label: "Fai un giro", icon: <Play size={15} />, endpoint: "/api/comando-vps", body: { comando: "giro" }, tono: "brand" },
  { id: "ritmo-mattino", label: "Rigenera Piano del mattino", icon: <Sunrise size={15} />, endpoint: "/api/comando-vps", body: { comando: "ritmo-mattino" } },
  { id: "ritmo-sera", label: "Rigenera Report della sera", icon: <Moon size={15} />, endpoint: "/api/comando-vps", body: { comando: "ritmo-sera" } },
  { id: "riavvia", label: "Riavvia worker", icon: <RotateCcw size={15} />, endpoint: "/api/comando-vps", body: { comando: "riavvia" } },
  { id: "sblocca", label: "Sblocca coda", icon: <Unlock size={15} />, endpoint: "/api/lavori/recupera" },
];

const STATO_ETI: Record<string, { txt: string; cls: string }> = {
  in_attesa: { txt: "⏳ in coda", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  in_corso: { txt: "⚙️ in corso", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  fatto: { txt: "✅ fatto", cls: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" },
  // (coerente col fix #6) un fallito è "da riapprovare", non un allarme.
  errore: { txt: "🔄 da riapprovare", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
};

export default function ComandiVPS() {
  const [risultati, setRisultati] = useState<Risultato[]>([]);
  const [collegato, setCollegato] = useState<boolean>(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; testo: string } | null>(null);
  const [espanso, setEspanso] = useState<Set<string>>(new Set());

  const carica = useCallback(() => {
    fetch("/api/comando-vps", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setRisultati(d.risultati || []); setCollegato(Boolean(d.collegato)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const t = setInterval(carica, 6000);
    return () => clearInterval(t);
  }, [carica]);

  async function invia(p: (typeof PULSANTI)[number]) {
    if (busy) return;
    setBusy(p.id);
    setMsg(null);
    try {
      const r = await fetch(p.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p.body || {}),
      }).then((x) => x.json());
      if (r?.ok) {
        setMsg({ ok: true, testo: r.messaggio || "Comando inviato." });
        setTimeout(carica, 800);
      } else {
        setMsg({ ok: false, testo: r?.error || "Comando non riuscito." });
      }
    } catch {
      setMsg({ ok: false, testo: "Errore di rete." });
    } finally {
      setBusy(null);
    }
  }

  const toggle = (id: string) =>
    setEspanso((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <section className="card p-4">
      <div className="sez-head mb-1">
        <span className="sez-ico"><Terminal size={16} /></span>
        <div className="min-w-0 flex-1">
          <span className="t-sez">Comandi macchina</span>
          <p className="t-eti mt-0.5">
            Manda un comando alla macchina senza aprire il server. Li esegue il worker sul VPS:
            se è acceso partono subito, altrimenti restano in coda e ripartono da soli. Sotto vedi i risultati.
          </p>
        </div>
        <button onClick={carica} className="btn-ghost shrink-0" title="Aggiorna risultati"><RefreshCw size={14} /></button>
      </div>

      {!collegato && (
        <p className="t-eti text-amber-700 dark:text-amber-400 mt-2">
          ⚠️ Memoria non collegata: i comandi non partono finché il Pannello non vede Supabase.
        </p>
      )}

      {/* Pulsanti */}
      <div className="flex flex-wrap gap-2 mt-3">
        {PULSANTI.map((p) => (
          <button
            key={p.id}
            onClick={() => invia(p)}
            disabled={busy != null}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-xl border transition disabled:opacity-50 ${
              p.tono === "brand"
                ? "bg-brand text-white border-brand shadow-card hover:bg-brand-dark"
                : "text-black/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
            }`}
            style={p.tono === "brand" ? undefined : { borderColor: "var(--border-strong)" }}
          >
            {busy === p.id ? <Loader2 size={15} className="animate-spin" /> : p.icon}
            {p.label}
          </button>
        ))}
      </div>

      {msg && (
        <p className={`t-eti mt-2.5 ${msg.ok ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{msg.testo}</p>
      )}

      {/* Risultati */}
      <div className="mt-4">
        <div className="t-micro mb-2">Risultati recenti</div>
        {risultati.length === 0 ? (
          <p className="t-eti">Nessun comando ancora. Premine uno qui sopra: appena il worker lo esegue, l&apos;esito compare qui.</p>
        ) : (
          <div className="space-y-1.5">
            {risultati.map((r) => {
              const b = STATO_ETI[r.stato] || { txt: r.stato, cls: "bg-black/[0.05] text-black/55" };
              const aperto = espanso.has(r.id);
              const hasOut = Boolean(r.risultato && r.risultato.trim());
              return (
                <div key={r.id} className="surface-muted p-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>{r.richiesta || r.tipo}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${b.cls}`}>{b.txt}</span>
                    <span className="t-eti ml-auto shrink-0">{faRelativo(r.updated_at || r.created_at)}</span>
                  </div>
                  {hasOut && (
                    <>
                      <button onClick={() => toggle(r.id)} className="t-eti hover:text-brand transition mt-1 inline-flex items-center gap-1">
                        {aperto ? "nascondi esito" : "vedi esito"}
                      </button>
                      {aperto && (
                        <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12px] leading-relaxed border-l-2 border-brand/30 pl-3 py-1.5 max-h-72 overflow-y-auto" style={{ color: "var(--text-secondary)" }}>{r.risultato}</pre>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
