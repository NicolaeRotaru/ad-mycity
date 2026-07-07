"use client";

import { useEffect, useState } from "react";
import { History, BookOpen } from "lucide-react";
import GovernoAD from "@/components/GovernoAD";
import ParlaCasella from "@/components/ParlaCasella";
import { Trash2 } from "lucide-react";
import { EVENTO_VAI, EVENTO_SUB, vaiSub, consumaSubPendente, type DettaglioVai, type DettaglioSub } from "@/lib/nav";

type Tab = "governo" | "diario";

type DiarioVoce = {
  id: number | string;
  at: string;
  tipo: string;
  titolo: string;
  testo: string;
};

const DIARIO_TIPO: Record<string, string> = {
  chat: "💬 Chat",
  briefing: "🔭 Giro",
  azione: "⚡ Azione",
  sistema: "⚙️ Sistema",
};

type Props = {
  diario: DiarioVoce[];
  memoria: boolean;
  onSvuotaDiario: () => void;
  fa: (iso: string) => string;
};

export default function Storico({ diario, memoria, onSvuotaDiario, fa }: Props) {
  const [tab, setTab] = useState<Tab>("governo");

  // Ripristino scheda dal tasto INDIETRO (EVENTO_SUB dal popstate centrale) e salto cross-area
  // (EVENTO_VAI): niente più window.location.hash. (contratto nav)
  useEffect(() => {
    const applica = (det: { vista?: string; sub?: string } | undefined) => {
      if (det?.vista !== "assistente" && det?.vista !== "storico") return;
      if (det.sub === "diario") setTab("diario");
      else if (det.sub === "governo") setTab("governo");
    };
    // Al MOUNT consuma il sub parcheggiato (INDIETRO scattato prima che l'area fosse montata).
    const pend = consumaSubPendente("storico");
    if (pend === "diario" || pend === "governo") setTab(pend);
    const onVai = (e: Event) => applica((e as CustomEvent<DettaglioVai>).detail);
    const onSub = (e: Event) => applica((e as CustomEvent<DettaglioSub>).detail);
    window.addEventListener(EVENTO_VAI, onVai);
    window.addEventListener(EVENTO_SUB, onSub);
    return () => {
      window.removeEventListener(EVENTO_VAI, onVai);
      window.removeEventListener(EVENTO_SUB, onSub);
    };
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "governo", label: "Governo & diretta", icon: <BookOpen size={14} /> },
    { id: "diario", label: "Diario", icon: <History size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🕘 Storico & governo</h2>
        <p className="t-eti mt-0.5">Il diario di tutto ciò che l&apos;AD ha detto e fatto, la diretta della squadra e i controlli.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              vaiSub("storico", t.id); // voce di cronologia per la scheda (contratto nav)
            }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "bg-brand text-white shadow-card" : "bg-white dark:bg-white/5 text-black/60 dark:text-white/60 ring-1 ring-black/[0.06] dark:ring-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "governo" && <GovernoAD />}

      {tab === "diario" && (
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="sez-ico">
                <History size={16} />
              </span>
              <span className="t-sez">Diario — tutto ciò che dice e fa</span>
            </div>
            {diario.length > 0 && (
              <button onClick={onSvuotaDiario} className="text-xs text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 inline-flex items-center gap-1 transition">
                <Trash2 size={12} /> Svuota
              </button>
            )}
          </div>
          <p className="t-eti mb-3">
            {memoria
              ? "💾 Salvato nel database: resta anche se aggiorni la pagina o cambi dispositivo."
              : "💾 Salvato su questo browser. Collega il database di memoria per ritrovarlo ovunque."}
          </p>
          {diario.length === 0 ? (
            <p className="text-sm text-black/40 dark:text-white/40">
              Ancora niente. Qui resta salvato ogni messaggio della chat, ogni giro e ogni azione.
            </p>
          ) : (
            <div className="scroll-soft space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {diario.map((v) => (
                <div key={v.id} className="border border-black/[0.07] dark:border-white/10 rounded-xl p-3.5 hover:border-black/10 dark:hover:border-white/15 hover:bg-paper/40 dark:hover:bg-white/[0.03] transition">
                  <div className="flex items-center gap-2 text-xs text-black/40 dark:text-white/40 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand/20 text-brand font-medium shrink-0">
                      {DIARIO_TIPO[v.tipo] || v.tipo}
                    </span>
                    <span className="font-medium text-ink/70 dark:text-white/80 truncate">{v.titolo}</span>
                    <span className="ml-auto shrink-0">{fa(v.at)}</span>
                  </div>
                  <div className="text-sm text-ink/85 dark:text-white/85 whitespace-pre-wrap leading-relaxed">{v.testo}</div>
                  <ParlaCasella titolo={`Diario: ${v.titolo}`} contesto={(v.testo || "").slice(0, 500)} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
