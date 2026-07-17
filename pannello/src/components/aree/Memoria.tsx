"use client";

import { useEffect, useState } from "react";
import { BookOpen, FolderOpen, FolderTree, Gauge, ListChecks, ScrollText, ShieldCheck, TrendingUp } from "lucide-react";
import FattiChiave from "@/components/FattiChiave";
import MemoriaViva from "@/components/MemoriaViva";
import ScoperteProposte from "@/components/ScoperteProposte";
import Documenti from "@/components/aree/Documenti";
import EsploraGitHub from "@/components/aree/EsploraGitHub";
import GovernoAD from "@/components/GovernoAD";
import QuaderniSenior from "@/components/QuaderniSenior";
import StatoNumeriVault from "@/components/StatoNumeriVault";
import { EVENTO_VAI, EVENTO_SUB, vaiSub, consumaSubPendente, type DettaglioVai, type DettaglioSub } from "@/lib/nav";

type Tab = "memoria-viva" | "archivio";
type VivaTab = "fatti" | "memoria" | "scoperte" | "decisioni" | "quaderni-senior" | "stato-numeri";
type ArchivioTab = "consegne" | "github";

function parseVivaSub(sub?: string): VivaTab {
  if (sub === "fatti" || sub === "viva-fatti" || sub === "fatti-chiave") return "fatti";
  if (sub === "scoperte" || sub === "viva-scoperte") return "scoperte";
  if (sub === "storico-decisioni" || sub === "storico" || sub === "decisioni") return "decisioni";
  if (sub === "storico-quaderni-senior" || sub === "quaderni-senior") return "quaderni-senior";
  if (sub === "storico-stato-numeri" || sub === "stato-numeri") return "stato-numeri";
  return "memoria";
}

function parseArchivioSub(sub?: string): ArchivioTab {
  if (sub === "github" || sub === "esplora" || sub === "archivio/github") return "github";
  return "consegne";
}

function parseMemoriaSub(sub?: string): Tab {
  if (!sub || sub === "memoria-viva" || sub === "viva" || sub === "viva-memoria" || sub === "memoria" || sub === "scoperte" || sub === "viva-scoperte") return "memoria-viva";
  if (sub === "archivio" || sub.startsWith("archivio/") || sub === "github" || sub === "esplora") return "archivio";
  // Storico fuso in memoria-viva
  if (sub === "storico" || sub.startsWith("storico-") || sub === "quaderni-senior" || sub === "decisioni" || sub === "stato-numeri") return "memoria-viva";
  return "memoria-viva";
}

function vivaSubId(v: VivaTab): string {
  if (v === "fatti") return "viva-fatti";
  if (v === "scoperte") return "viva-scoperte";
  if (v === "decisioni") return "storico-decisioni";
  if (v === "quaderni-senior") return "storico-quaderni-senior";
  if (v === "stato-numeri") return "storico-stato-numeri";
  return "memoria-viva";
}

function archivioSubId(v: ArchivioTab): string {
  return v === "github" ? "archivio/github" : "archivio";
}

export default function Memoria() {
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
  ];

  const vivaTabs: { id: VivaTab; label: string; icon: React.ReactNode }[] = [
    { id: "fatti", label: "Fatti-chiave", icon: <ShieldCheck size={14} /> },
    { id: "memoria", label: "Memoria", icon: <ListChecks size={14} /> },
    { id: "scoperte", label: "Scoperte", icon: <TrendingUp size={14} /> },
    { id: "decisioni", label: "Decisioni", icon: <ScrollText size={14} /> },
    { id: "quaderni-senior", label: "Quaderni senior", icon: <BookOpen size={14} /> },
    { id: "stato-numeri", label: "Stato & numeri", icon: <Gauge size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🧠 Memoria</h2>
        <p className="t-eti mt-0.5">Tutto ciò che l&apos;AD sa, produce e conserva.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              const sub = t.id === "archivio" ? archivioSubId(archivioTab) : vivaSubId(vivaTab);
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
            {vivaTabs.map((t) => (
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
          {vivaTab === "fatti" && <FattiChiave />}
          {vivaTab === "memoria" && <MemoriaViva />}
          {vivaTab === "scoperte" && <ScoperteProposte />}
          {vivaTab === "decisioni" && <GovernoAD variant="decisioni" />}
          {vivaTab === "quaderni-senior" && <QuaderniSenior />}
          {vivaTab === "stato-numeri" && <StatoNumeriVault />}
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
