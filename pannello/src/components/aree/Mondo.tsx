"use client";

import { useEffect, useState } from "react";
import { Search, LayoutGrid } from "lucide-react";
import Intelligence from "@/components/Intelligence";
import AreaModuli from "@/components/aree/AreaModuli";
import { EVENTO_VAI, type DettaglioVai } from "@/lib/nav";

type Tab = "intelligence" | "moduli";

export default function Mondo({ metriche, aggAt }: { metriche: Record<string, any> | null; aggAt: number | null }) {
  const [tab, setTab] = useState<Tab>("intelligence");

  useEffect(() => {
    const apriDaHash = () => {
      const h = (typeof window !== "undefined" ? window.location.hash : "").replace("#", "");
      const map: Record<string, Tab> = {
        "mondo-intelligence": "intelligence",
        "mondo-moduli": "moduli",
      };
      if (map[h]) setTab(map[h]);
    };
    apriDaHash();
    window.addEventListener("hashchange", apriDaHash);
    return () => window.removeEventListener("hashchange", apriDaHash);
  }, []);

  useEffect(() => {
    const onVai = (e: Event) => {
      const det = (e as CustomEvent<DettaglioVai>).detail;
      if (det?.vista !== "mondo" || !det.sub) return;
      const valide: Tab[] = ["intelligence", "moduli"];
      if (valide.includes(det.sub as Tab)) setTab(det.sub as Tab);
    };
    window.addEventListener(EVENTO_VAI, onVai);
    return () => window.removeEventListener(EVENTO_VAI, onVai);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "intelligence", label: "Intelligence", icon: <Search size={14} /> },
    { id: "moduli", label: "Moduli", icon: <LayoutGrid size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">🌍 Mondo & rischi</h2>
          <p className="t-eti mt-0.5">Tutto ciò che ci impatta da fuori: mercato, reputazione, sicurezza, futuro.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "bg-brand text-white shadow-card" : "bg-paper/60 text-black/60 hover:bg-black/[0.05]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== INTELLIGENCE & OPPORTUNITÀ ===== */}
      {tab === "intelligence" && <Intelligence />}

      {/* ===== MODULI MONDO ===== */}
      {tab === "moduli" && <AreaModuli area="mondo" metriche={metriche} aggAt={aggAt} />}
    </div>
  );
}
