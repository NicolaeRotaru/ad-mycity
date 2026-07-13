"use client";

import { useEffect, useState } from "react";
import { Store, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { dataVault } from "@/lib/format";
import ParlaCasella from "@/components/ParlaCasella";

// 🏪 RADIOGRAFIA MARKETPLACE — l'audit profondo del SITO mycity (13 dimensioni, ogni problema
// verificato), gemella della «Radiografia macchina». Legge /api/memoria/radiografia-marketplace
// (digest nel vault, allineato da cervello/radiografia-marketplace-digest.mjs).
// Niente voto inventato: il titolo dice i numeri veri (bloccanti · gravi · minori).

type Finding = { titolo?: string; severita?: string; descrizione?: string; impatto?: string; fix?: string; dove?: string };
type Dimensione = { key?: string; findings?: Finding[] };
type Dati = {
  collegato: boolean; messaggio?: string; data?: string; fonte_raw?: string; report?: string | null;
  sintesi?: string; meta?: { findings?: number; bloccanti?: number; gravi?: number; minori?: number; agenti?: number | null };
  dimensioni?: Dimensione[];
  live?: { data_scan?: string | null; scan_ore_fa?: number | null; scan_stale?: boolean };
};

const GRAV: Record<string, { cls: string; dot: string; label: string }> = {
  bloccante: { cls: "border-red-200 bg-red-50/60", dot: "bg-red-500", label: "BLOCCANTE" },
  grave: { cls: "border-amber-200 bg-amber-50/60", dot: "bg-amber-500", label: "GRAVE" },
  minore: { cls: "border-black/10 bg-paper/40", dot: "bg-black/30", label: "MINORE" },
};
const PESO: Record<string, number> = { bloccante: 0, grave: 1, minore: 2 };

const POLL_MS = 30_000;

export default function RadiografiaMarketplace() {
  const [d, setD] = useState<Dati | null>(null);
  // Le dimensioni partono CHIUSE (87 schede tutte aperte = muro di testo): si apre quella che serve.
  const [aperte, setAperte] = useState<Set<string>>(new Set());

  useEffect(() => {
    const carica = () =>
      fetch("/api/memoria/radiografia-marketplace", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => {});
    carica();
    const id = setInterval(carica, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const toggle = (k: string) =>
    setAperte((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const m = d?.meta;

  return (
    <section id="radiografia-marketplace" className="card p-4 border-brand/20 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sez-ico"><Store size={16} /></span>
          <div className="min-w-0">
            <span className="t-sez">🏪 Radiografia marketplace</span>
            <div className="t-eti">L&apos;audit profondo del sito: 13 dimensioni, ogni problema verificato. {d?.data ? `· ${dataVault(d.data)}` : ""}</div>
          </div>
        </div>
        {m?.findings != null && (
          <div className="text-right shrink-0">
            <div className="text-[26px] font-bold leading-none tabular-nums text-red-600">{m.bloccanti ?? 0}</div>
            <div className="t-eti">bloccanti</div>
          </div>
        )}
      </div>

      {!d && <p className="t-eti py-6 text-center">Caricamento…</p>}
      {d && !d.collegato && <p className="t-eti py-6 text-center">{d.messaggio}</p>}

      {d?.collegato && (
        <>
          {/* I numeri veri dell'audit (nessun voto inventato) */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200">{m?.bloccanti ?? 0} bloccanti</span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200">{m?.gravi ?? 0} gravi</span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-black/[0.04] text-black/55 ring-1 ring-black/10">{m?.minori ?? 0} minori</span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-black/[0.04] text-black/55 ring-1 ring-black/10">{m?.findings ?? 0} problemi totali{m?.agenti ? ` · ${m.agenti} agenti` : ""}</span>
          </div>

          {d.sintesi && <p className="t-corpo break-words mb-3">{d.sintesi}</p>}
          {d.live?.scan_stale && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 mb-3 text-[12px] text-amber-900/90">
              <b>Audit del sito del {d.data ? dataVault(d.data) : "—"}</b>
              {d.live.scan_ore_fa != null ? ` (${d.live.scan_ore_fa}h fa)` : ""}.
              {" "}I fix sul codice del marketplace non aggiornano da soli questa lista — serve un nuovo audit («radiografia») dopo i merge importanti.
            </div>
          )}
          {d.report && (
            <p className="t-eti mb-3 flex items-center gap-1"><FileText size={12} /> Report completo: <code className="text-brand">{d.report}</code></p>
          )}

          <div className="space-y-2">
            {(d.dimensioni || []).map((dim) => {
              const findings = (dim.findings || []).slice().sort((a, b) => (PESO[a.severita || "minore"] ?? 2) - (PESO[b.severita || "minore"] ?? 2));
              const nBlocc = findings.filter((f) => f.severita === "bloccante").length;
              const nGravi = findings.filter((f) => f.severita === "grave").length;
              const open = aperte.has(dim.key || "");
              return (
                <div key={dim.key} className="rounded-xl border border-black/[0.06] bg-paper/40 overflow-hidden">
                  <button type="button" onClick={() => toggle(dim.key || "")} className="w-full flex items-center gap-2 text-left px-3 py-2.5" aria-expanded={open}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${nBlocc ? "bg-red-500" : nGravi ? "bg-amber-500" : "bg-green-500"}`} />
                    <span className="text-[13px] font-medium flex-1 min-w-0 truncate">{dim.key}</span>
                    {nBlocc > 0 && <span className="text-[10px] px-1.5 rounded bg-red-100 text-red-700 shrink-0">{nBlocc} bloccanti</span>}
                    <span className="badge badge-off shrink-0">{findings.length}</span>
                    <span className="shrink-0" style={{ color: "var(--text-faint)" }}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                  </button>
                  {open && (
                    <div className="px-3 pb-3">
                      {findings.map((f, j) => {
                        const g = GRAV[f.severita || "minore"] || GRAV.minore;
                        return (
                          <div key={j} className={`rounded-lg border p-2.5 mt-2 ${g.cls}`}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
                              <span className="text-[10px] font-bold text-black/50">{g.label}</span>
                            </div>
                            <div className="text-[12.5px] font-medium mt-1">{f.titolo}</div>
                            {f.descrizione && <div className="text-[12px] text-black/65 mt-0.5">{f.descrizione}</div>}
                            {f.impatto && <div className="text-[12px] text-black/60 mt-1"><b>Impatto:</b> {f.impatto}</div>}
                            {f.fix && <div className="text-[12px] text-black/60 mt-0.5"><b>Fix (🟡):</b> {f.fix}</div>}
                            {f.dove && <div className="t-eti mt-0.5 font-mono break-all">{f.dove}</div>}
                            {/* Ogni problema del sito ha la SUA chat, come nella radiografia macchina */}
                            <ParlaCasella
                              titolo={`Problema sito: ${(f.titolo || "").slice(0, 60)}`}
                              contesto={[
                                dim.key && `Dimensione: ${dim.key}`,
                                f.descrizione,
                                f.impatto && `Impatto: ${f.impatto}`,
                                f.fix && `Fix proposto: ${f.fix}`,
                                f.dove && `Dove: ${f.dove}`,
                              ].filter(Boolean).join(" · ")}
                            />
                          </div>
                        );
                      })}
                      <ParlaCasella titolo={`Marketplace: ${dim.key}`} contesto={`Dimensione «${dim.key}» della radiografia marketplace del ${d.data}: ${findings.length} problemi (${nBlocc} bloccanti, ${nGravi} gravi).`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
