"use client";

import { useEffect, useState } from "react";
import { BookOpen, Brain, FolderOpen, FolderTree, History, TrendingUp } from "lucide-react";
import MemoriaViva from "@/components/MemoriaViva";
import Documenti from "@/components/aree/Documenti";
import StoricoMemoria, { parseStoricoSub, storicoSubId } from "@/components/aree/StoricoMemoria";
import EsploraGitHub from "@/components/aree/EsploraGitHub";
import ParlaCasella from "@/components/ParlaCasella";
import { vaultToIso } from "@/lib/format";
import { pulisciTitolo } from "@/lib/azioni-attesa";
import { EVENTO_VAI, EVENTO_SUB, vaiSub, consumaSubPendente, type DettaglioVai, type DettaglioSub } from "@/lib/nav";

type Tab = "memoria-viva" | "archivio" | "storico" | "github";

type Opportunita = { titolo: string; motivo: string; impatto: string; sforzo: string };
type Briefing = { situazione: string; opportunita: Opportunita[]; azioni: { titolo: string; motivo: string; livello: string }[] };

function fa(iso: string | null): string {
  if (!iso) return "mai";
  const d = new Date(vaultToIso(iso));
  const ms = d.getTime();
  if (Number.isNaN(ms)) return "mai";
  const sec = Math.max(0, (Date.now() - ms) / 1000);
  const rel =
    sec < 90 ? "poco fa" : sec < 3600 ? `${Math.round(sec / 60)} min fa` : sec < 86400 ? `${Math.round(sec / 3600)} h fa` : `${Math.round(sec / 86400)} g fa`;
  try {
    const giorno = (x: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(x);
    const opts: Intl.DateTimeFormatOptions = { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" };
    if (giorno(d) !== giorno(new Date())) {
      opts.day = "2-digit";
      opts.month = "2-digit";
    }
    return `${rel} · ${new Intl.DateTimeFormat("it-IT", opts).format(d)}`;
  } catch {
    return rel;
  }
}

function parseMemoriaSub(sub?: string): Tab {
  if (!sub || sub === "memoria-viva" || sub === "viva" || sub === "scoperte") return "memoria-viva";
  if (sub === "archivio" || sub.startsWith("archivio/")) return "archivio";
  if (sub === "github" || sub === "esplora") return "github";
  if (sub === "storico" || sub.startsWith("storico-") || sub === "quaderni-senior") return "storico";
  return "memoria-viva";
}

export default function Memoria({ briefing, ultimoAt }: { briefing: Briefing | null; ultimoAt: string | null }) {
  const [tab, setTab] = useState<Tab>("memoria-viva");

  useEffect(() => {
    const applica = (det: { vista?: string; sub?: string } | undefined) => {
      if (det?.vista !== "memoria" || !det.sub) return;
      setTab(parseMemoriaSub(det.sub));
    };
    const pend = consumaSubPendente("memoria");
    if (pend) setTab(parseMemoriaSub(pend));
    const onSub = (e: Event) => applica((e as CustomEvent<DettaglioSub>).detail);
    const onVai = (e: Event) => applica((e as CustomEvent<DettaglioVai>).detail);
    window.addEventListener(EVENTO_SUB, onSub);
    window.addEventListener(EVENTO_VAI, onVai);
    return () => {
      window.removeEventListener(EVENTO_SUB, onSub);
      window.removeEventListener(EVENTO_VAI, onVai);
    };
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "memoria-viva", label: "Memoria viva", icon: <BrainIcon /> },
    { id: "archivio", label: "Archivio", icon: <FolderOpen size={14} /> },
    { id: "storico", label: "Storico", icon: <History size={14} /> },
    { id: "github", label: "GitHub", icon: <FolderTree size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🧠 Memoria</h2>
        <p className="t-eti mt-0.5">Tutto ciò che l&apos;AD sa, produce e conserva — viva, archivio, storico e file su GitHub.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              const sub =
                t.id === "storico"
                  ? storicoSubId("decisioni")
                  : t.id === "archivio"
                    ? "archivio"
                    : t.id;
              vaiSub("memoria", sub);
            }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "nav-tab-active bg-brand text-white shadow-card" : "nav-tab"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "memoria-viva" && (
        <div className="space-y-4">
          <MemoriaViva />
          <section className="card p-4">
            <div className="sez-head mb-4">
              <span className="sez-ico"><TrendingUp size={16} /></span>
              <div className="min-w-0">
                <span className="t-sez">Scoperte & proposte</span>
                <div className="t-eti">
                  L&apos;analisi dell&apos;ultimo giro{briefing && ultimoAt ? ` · ${fa(ultimoAt)}` : ""}
                </div>
              </div>
            </div>
            {!briefing ? (
              <div className="text-center text-black/45 py-8">
                <p className="mb-1">Nessuna analisi salvata ancora.</p>
                <p className="text-sm text-black/35">Al prossimo giro compare qui da sola.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-ink/90 leading-relaxed whitespace-pre-wrap">{briefing.situazione}</p>
                {briefing.opportunita?.length > 0 && (
                  <div>
                    <div className="t-micro mb-2">Opportunità</div>
                    <div className="space-y-2">
                      {briefing.opportunita.map((o, i) => (
                        <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3.5 hover:border-brand/30 transition">
                          <div className="text-sm font-medium">{pulisciTitolo(o.titolo)}</div>
                          <div className="text-sm text-black/60 mt-0.5">{o.motivo}</div>
                          <div className="text-xs text-black/45 mt-2 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-black/5">impatto {o.impatto}</span>
                            <span className="px-1.5 py-0.5 rounded bg-black/5">sforzo {o.sforzo}</span>
                          </div>
                          <ParlaCasella titolo={`Opportunità: ${o.titolo}`} contesto={[o.motivo, `impatto ${o.impatto}`, `sforzo ${o.sforzo}`].filter(Boolean).join(" · ")} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {briefing.azioni?.length > 0 && (
                  <div className="rounded-xl border border-brand/15 bg-brand-50/30 p-3 text-[12.5px] text-ink/80">
                    💡 Da questo giro: <b>{briefing.azioni.length}</b> azioni in <b>⚡ Azioni → Da approvare</b>.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "archivio" && <Documenti embedded />}
      {tab === "storico" && <StoricoMemoria />}
      {tab === "github" && <EsploraGitHub embedded />}
    </div>
  );
}

function BrainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    </svg>
  );
}