"use client";

import { useEffect, useState } from "react";
import { BookOpen, FolderTree, Gauge, ListChecks, Map as MapIcon, ScrollText, ShieldCheck, Target, TrendingUp } from "lucide-react";
import FattiChiave from "@/components/FattiChiave";
import MemoriaViva from "@/components/MemoriaViva";
import ScoperteProposte from "@/components/ScoperteProposte";
import Documenti from "@/components/aree/Documenti";
import EsploraGitHub from "@/components/aree/EsploraGitHub";
import GovernoAD from "@/components/GovernoAD";
import QuaderniSenior from "@/components/QuaderniSenior";
import { SezioneStato, SezioneOkr, SezionePiani } from "@/components/StatoNumeriVault";
import { EVENTO_VAI, EVENTO_SUB, vaiSub, consumaSubPendente, type DettaglioVai, type DettaglioSub } from "@/lib/nav";

type Tab = "fatti" | "memoria" | "scoperte" | "decisioni" | "quaderni-senior" | "stato" | "okr" | "piani" | "consegne" | "github";

function parseTab(sub?: string): Tab {
  if (sub === "fatti" || sub === "viva-fatti" || sub === "fatti-chiave") return "fatti";
  if (sub === "scoperte" || sub === "viva-scoperte") return "scoperte";
  if (sub === "storico-decisioni" || sub === "storico" || sub === "decisioni") return "decisioni";
  if (sub === "storico-quaderni-senior" || sub === "quaderni-senior") return "quaderni-senior";
  if (sub === "storico-stato-numeri" || sub === "stato-numeri" || sub === "stato") return "stato";
  if (sub === "okr") return "okr";
  if (sub === "piani") return "piani";
  if (sub === "github" || sub === "esplora" || sub === "archivio/github") return "github";
  if (sub === "archivio" || sub?.startsWith("archivio/")) return "consegne";
  return "memoria";
}

function subId(t: Tab): string {
  if (t === "fatti") return "viva-fatti";
  if (t === "scoperte") return "viva-scoperte";
  if (t === "decisioni") return "storico-decisioni";
  if (t === "quaderni-senior") return "storico-quaderni-senior";
  if (t === "github") return "archivio/github";
  if (t === "consegne") return "archivio";
  return t; // memoria, stato, okr, piani
}

export default function Memoria() {
  const [tab, setTab] = useState<Tab>("memoria");

  useEffect(() => {
    const applica = (det: { vista?: string; sub?: string } | undefined) => {
      if (det?.vista !== "memoria" || !det.sub) return;
      setTab(parseTab(det.sub));
    };
    const pend = consumaSubPendente("memoria");
    if (pend) setTab(parseTab(pend));
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
    { id: "fatti", label: "Fatti-chiave", icon: <ShieldCheck size={14} /> },
    { id: "memoria", label: "Memoria", icon: <ListChecks size={14} /> },
    { id: "scoperte", label: "Scoperte", icon: <TrendingUp size={14} /> },
    { id: "decisioni", label: "Decisioni", icon: <ScrollText size={14} /> },
    { id: "quaderni-senior", label: "Quaderni senior", icon: <BookOpen size={14} /> },
    { id: "stato", label: "Stato", icon: <Gauge size={14} /> },
    { id: "okr", label: "OKR", icon: <Target size={14} /> },
    { id: "piani", label: "Piani", icon: <MapIcon size={14} /> },
    { id: "consegne", label: "Consegne", icon: <BookOpen size={14} /> },
    { id: "github", label: "GitHub", icon: <FolderTree size={14} /> },
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
            type="button"
            onClick={() => {
              setTab(t.id);
              vaiSub("memoria", subId(t.id));
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

      {tab === "fatti" && <FattiChiave />}
      {tab === "memoria" && <MemoriaViva />}
      {tab === "scoperte" && <ScoperteProposte />}
      {tab === "decisioni" && <GovernoAD variant="decisioni" />}
      {tab === "quaderni-senior" && <QuaderniSenior />}
      {tab === "stato" && <SezioneStato />}
      {tab === "okr" && <SezioneOkr />}
      {tab === "piani" && <SezionePiani />}
      {tab === "consegne" && <Documenti embedded />}
      {tab === "github" && <EsploraGitHub embedded />}
    </div>
  );
}
