"use client";

import { useEffect, useState } from "react";
import { BookOpen, Brain, FolderOpen, FolderTree, History, ListChecks, TrendingUp } from "lucide-react";
import MemoriaViva from "@/components/MemoriaViva";
import ScoperteProposte from "@/components/ScoperteProposte";
import Documenti from "@/components/aree/Documenti";
import StoricoMemoria, { parseStoricoSub, storicoSubId } from "@/components/aree/StoricoMemoria";
import EsploraGitHub from "@/components/aree/EsploraGitHub";
import { vaultToIso } from "@/lib/format";
import { EVENTO_VAI, EVENTO_SUB, vaiSub, consumaSubPendente, type DettaglioVai, type DettaglioSub } from "@/lib/nav";

type Tab = "memoria-viva" | "archivio" | "storico";
type VivaTab = "memoria" | "scoperte";
type ArchivioTab = "consegne" | "github";

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

function parseVivaSub(sub?: string): VivaTab {
  if (sub === "scoperte" || sub === "viva-scoperte") return "scoperte";
  return "memoria";
}

function parseArchivioSub(sub?: string): ArchivioTab {
  if (sub === "github" || sub === "esplora" || sub === "archivio/github") return "github";
  return "consegne";
}

function parseMemoriaSub(sub?: string): Tab {
  if (!sub || sub === "memoria-viva" || sub === "viva" || sub === "viva-memoria" || sub === "memoria" || sub === "scoperte" || sub === "viva-scoperte") return "memoria-viva";
  if (sub === "archivio" || sub.startsWith("archivio/") || sub === "github" || sub === "esplora") return "archivio";
  if (sub === "storico" || sub.startsWith("storico-") || sub === "quaderni-senior") return "storico";
  return "memoria-viva";
}

function vivaSubId(v: VivaTab): string {
  return v === "scoperte" ? "scoperte" : "memoria-viva";
}

function archivioSubId(v: ArchivioTab): string {
  return v === "github" ? "archivio/github" : "archivio";
}

export default function Memoria({ briefing, ultimoAt }: { briefing: Briefing | null; ultimoAt: string | null }) {
  const [tab, setTab] = useState<Tab>("memoria-viva");
  const [vivaTab, setVivaTab] = useState<VivaTab>("memoria");
  const [archivioTab, setArchivioTab] = useState<ArchivioTab>("consegne");

  useEffect(() => {
    const applica = (det: { vista?: string; sub?: string } | undefined) => {
      if (det?.vista !== "memoria" || !det.sub) return;
      const parsed = parseMemoriaSub(det.sub);
      setTab(parsed);
      if (parsed === "memoria-viva") setVivaTab(parseVivaSub(det.sub));
      if (parsed === "archivio") setArchivioTab(parseArchivioSub(det.sub));
    };
    const pend = consumaSubPendente("memoria");
    if (pend) {
      const parsed = parseMemoriaSub(pend);
      setTab(parsed);
      if (parsed === "memoria-viva") setVivaTab(parseVivaSub(pend));
      if (parsed === "archivio") setArchivioTab(parseArchivioSub(pend));
    }
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
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🧠 Memoria</h2>
        <p className="t-eti mt-0.5">Tutto ciò che l&apos;AD sa, produce e conserva — viva, archivio e storico.</p>
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
                    ? archivioSubId("consegne")
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
          <div className="flex flex-wrap gap-1.5">
            {([
              { id: "memoria" as const, label: "Memoria", icon: <ListChecks size={14} /> },
              { id: "scoperte" as const, label: "Scoperte", icon: <TrendingUp size={14} /> },
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setVivaTab(t.id);
                  vaiSub("memoria", vivaSubId(t.id));
                }}
                className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
                  vivaTab === t.id ? "nav-tab-active bg-brand text-white shadow-card" : "nav-tab"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          {vivaTab === "memoria" && <MemoriaViva />}
          {vivaTab === "scoperte" && (
            <ScoperteProposte briefing={briefing} ultimoLabel={briefing && ultimoAt ? fa(ultimoAt) : null} />
          )}
        </div>
      )}

      {tab === "archivio" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {([
              { id: "consegne" as const, label: "Consegne", icon: <BookOpen size={14} /> },
              { id: "github" as const, label: "GitHub", icon: <FolderTree size={14} /> },
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setArchivioTab(t.id);
                  vaiSub("memoria", archivioSubId(t.id));
                }}
                className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
                  archivioTab === t.id ? "nav-tab-active bg-brand text-white shadow-card" : "nav-tab"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          {archivioTab === "consegne" && <Documenti embedded />}
          {archivioTab === "github" && <EsploraGitHub embedded />}
        </div>
      )}
      {tab === "storico" && <StoricoMemoria />}
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