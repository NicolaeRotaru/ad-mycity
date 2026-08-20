"use client";

import { useCallback, useEffect, useState } from "react";
import { Store, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { dataVault } from "@/lib/format";
import { vaiArea } from "@/lib/nav";
import ParlaCasella from "@/components/ParlaCasella";
import SchedaProblema from "@/components/cervello/SchedaProblema";
import { usePanelSync } from "@/lib/panel-sync";
import { dimensioneLeggibile } from "@/lib/radiografia-umana";

// 🏪 RADIOGRAFIA MARKETPLACE — l'audit profondo del SITO mycity (13 dimensioni, ogni problema
// verificato), gemella della «Radiografia macchina». Legge /api/memoria/radiografia-marketplace
// (digest nel vault, allineato da cervello/radiografia-marketplace-digest.mjs).
// Niente voto inventato: il titolo dice i numeri veri (bloccanti · gravi · minori).

type Finding = { titolo?: string; severita?: string; descrizione?: string; impatto?: string; fix?: string; dove?: string; nota_riparazione?: string };
type Dimensione = { key?: string; nome?: string | null; findings?: Finding[]; problemi_chiusi?: number };
type PerSeverita = { bloccante: number; grave: number; minore: number; altre: number };
type Dati = {
  collegato: boolean; messaggio?: string; data?: string; fonte_raw?: string; report?: string | null;
  sintesi?: string; meta?: { findings?: number; bloccanti?: number; gravi?: number; minori?: number; agenti?: number | null };
  dimensioni?: Dimensione[];
  // Il conto DERIVATO dalla lista (rotta → lib/radiografia-marketplace-conti). `letto: false` non è
  // uno zero: vuol dire che la lista non si è potuta leggere, e a schermo diventa ⚪, mai verde.
  conto?: { letto?: boolean; motivo?: string | null; totale?: number | null; chiusi?: number | null; aperti?: number | null; aperti_per_severita?: PerSeverita | null };
  live?: { data_scan?: string | null; scan_ore_fa?: number | null; scan_stale?: boolean; findings_aperti?: number | null; findings_letto?: boolean; findings_motivo?: string | null; sync_aggiornato?: string | null };
};

const GRAV: Record<string, { cls: string; dot: string; label: string }> = {
  bloccante: { cls: "border-red-200 bg-red-50/60", dot: "bg-red-500", label: "BLOCCANTE" },
  grave: { cls: "border-amber-200 bg-amber-50/60", dot: "bg-amber-500", label: "GRAVE" },
  minore: { cls: "border-black/10 bg-paper/40", dot: "bg-black/30", label: "MINORE" },
};
const PESO: Record<string, number> = { bloccante: 0, grave: 1, minore: 2 };

/** «1 bloccanti» fa sembrare finto un numero vero: qui il plurale segue il conto. */
function plurale(n: number, uno: string, tanti: string): string {
  return `${n} ${n === 1 ? uno : tanti}`;
}

const POLL_MS = 30_000;

export default function RadiografiaMarketplace() {
  const [d, setD] = useState<Dati | null>(null);
  const [aperte, setAperte] = useState<Set<string>>(new Set());
  const [mostraMinori, setMostraMinori] = useState(false);

  const carica = useCallback(() => {
    fetch("/api/memoria/radiografia-marketplace", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(carica, POLL_MS);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["radiografia", "memoria", "all"], carica);

  const toggle = (k: string) =>
    setAperte((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const m = d?.meta;
  // ⚪ NON È MAI UN VERDE. `letto: false` vuol dire «la lista non l'ho potuta leggere»: mostrarla
  // come zero problemi sarebbe la bugia che questa scheda esiste per non dire.
  const letto = d?.conto?.letto !== false && d?.conto?.aperti != null;
  const aperti = d?.conto?.aperti ?? 0;
  const ap = d?.conto?.aperti_per_severita ?? { bloccante: 0, grave: 0, minore: 0, altre: 0 };

  return (
    <section id="radiografia-marketplace" className="card p-4 border-brand/20 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sez-ico"><Store size={16} /></span>
          <div className="min-w-0">
            <span className="t-sez">🏪 Salute sito</span>
            <div className="t-eti">Audit del marketplace · {d?.data ? dataVault(d.data) : "—"}</div>
          </div>
        </div>
        {d?.collegato && (
          <div className="text-right shrink-0">
            <div className={`text-[26px] font-bold leading-none tabular-nums ${letto ? "text-amber-600" : "text-black/40"}`}>
              {letto ? aperti : "⚪"}
            </div>
            <div className="t-eti">{letto ? "ancora da riparare" : "non l'ho potuto contare"}</div>
          </div>
        )}
      </div>

      {!d && <p className="t-eti py-6 text-center">Caricamento…</p>}
      {d && !d.collegato && <p className="t-eti py-6 text-center">{d.messaggio}</p>}

      {d?.collegato && (
        <>
          {/* Cartolina — il semaforo guarda quello che RESTA, non quello che il referto aveva trovato.
              Il 20/8 qui usciva «12 bloccanti» in rosso mentre i bloccanti ancora aperti erano 1: i
              numeri di `meta` sono la fotografia del giorno dell'audit, prima di ogni riparazione. */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5 mb-3">
            <p className="t-corpo text-[13px] font-semibold">
              {!letto ? "⚪" : ap.bloccante > 0 ? "🔴" : ap.grave > 0 ? "🟡" : "🟢"}
              {" "}
              {letto
                ? `${plurale(ap.bloccante, "bloccante", "bloccanti")} · ${plurale(ap.grave, "grave", "gravi")} ancora aperti · referto ${d.data ? dataVault(d.data) : "—"}`
                : `Non ho potuto contare i problemi aperti · referto ${d.data ? dataVault(d.data) : "—"}`}
            </p>
            {!letto && d.conto?.motivo && <p className="t-eti mt-1">{d.conto.motivo}</p>}
            <button type="button" onClick={() => vaiArea("azioni", undefined, "approvare")} className="text-[12px] font-medium text-brand hover:underline mt-1">
              Vai a Da approvare →
            </button>
          </div>

          {/* I numeri veri (nessun voto inventato): davanti quello che RESTA, dietro il referto. */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200">{letto ? plurale(ap.bloccante, "bloccante aperto", "bloccanti aperti") : "⚪ bloccanti aperti"}</span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200">{letto ? plurale(ap.grave, "grave aperto", "gravi aperti") : "⚪ gravi aperti"}</span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-black/[0.04] text-black/55 ring-1 ring-black/10">{letto ? plurale(ap.minore, "minore aperto", "minori aperti") : "⚪ minori aperti"}</span>
            {letto && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-green-50 text-green-700 ring-1 ring-green-200">{plurale(d.conto?.chiusi ?? 0, "già riparato", "già riparati")}</span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-black/[0.04] text-black/55 ring-1 ring-black/10">
              referto {d.data ? dataVault(d.data) : "—"}: {d.conto?.totale ?? m?.findings ?? 0} trovati{m?.agenti ? ` · ${m.agenti} agenti` : ""}
            </span>
          </div>

          {d.sintesi && <p className="t-corpo break-words mb-3">{d.sintesi}</p>}
          {d.live?.scan_stale && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 mb-3 text-[12px] text-amber-900/90">
              <b>Audit del sito del {d.data ? dataVault(d.data) : "—"}</b>
              {d.live.scan_ore_fa != null ? ` (${d.live.scan_ore_fa}h fa)` : ""}.
              {" "}I difetti riparati scendono da soli da questa lista, ma i difetti NUOVI no: per trovarli serve un nuovo audit («radiografia») dopo i merge importanti.
            </div>
          )}
          {d.report && (
            <p className="t-eti mb-3 flex items-center gap-1"><FileText size={12} /> Report completo: <code className="text-brand">{d.report}</code></p>
          )}

          <button
            type="button"
            onClick={() => setMostraMinori((v) => !v)}
            className="mb-3 text-[12.5px] font-medium text-brand hover:underline"
          >
            {mostraMinori ? "Nascondi problemi minori" : (letto && ap.minore === 1 ? "Mostra anche il minore" : `Mostra anche i ${letto ? ap.minore : 0} minori`)}
          </button>

          <div className="space-y-2">
            {(d.dimensioni || []).map((dim) => {
              const findings = (dim.findings || []).slice().sort((a, b) => (PESO[a.severita || "minore"] ?? 2) - (PESO[b.severita || "minore"] ?? 2));
              const findingsVis = findings.filter((f) => mostraMinori || f.severita === "bloccante" || f.severita === "grave");
              // Una dimensione senza problemi aperti da mostrare sparisce, ma solo se non ha nulla da
              // raccontare: se qui dentro sono stati riparati dei difetti, la riga resta e lo dice.
              if (findingsVis.length === 0 && !(dim.problemi_chiusi ?? 0)) return null;
              const nBlocc = findingsVis.filter((f) => f.severita === "bloccante").length;
              const nGravi = findingsVis.filter((f) => f.severita === "grave").length;
              const open = aperte.has(dim.key || "");
              return (
                <div key={dim.key} className="rounded-xl border border-black/[0.06] bg-paper/40 overflow-hidden">
                  <button type="button" onClick={() => toggle(dim.key || "")} className="w-full flex items-center gap-2 text-left px-3 py-2.5" aria-expanded={open}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${nBlocc ? "bg-red-500" : nGravi ? "bg-amber-500" : "bg-green-500"}`} />
                    <span className="text-[13px] font-medium flex-1 min-w-0 truncate">{dim.nome || dimensioneLeggibile(dim.key || "")}</span>
                    {nBlocc > 0 && <span className="text-[10px] px-1.5 rounded bg-red-100 text-red-700 shrink-0">{plurale(nBlocc, "bloccante", "bloccanti")}</span>}
                    {/* «0 aperti» e «0 aperti, 26 riparati» non raccontano la stessa storia. */}
                    {(dim.problemi_chiusi ?? 0) > 0 && (
                      <span className="text-[10px] px-1.5 rounded bg-green-50 text-green-700 shrink-0">{plurale(dim.problemi_chiusi ?? 0, "riparato", "riparati")}</span>
                    )}
                    <span className="badge badge-off shrink-0">{findingsVis.length}</span>
                    <span className="shrink-0" style={{ color: "var(--text-faint)" }}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                  </button>
                  {open && (
                    <div className="px-3 pb-3">
                      {findingsVis.map((f, j) => {
                        const g = GRAV[f.severita || "minore"] || GRAV.minore;
                        return (
                          <SchedaProblema
                            key={j}
                            gravitaCls={g.cls}
                            gravitaDot={g.dot}
                            gravitaLabel={g.label}
                            titolo={f.titolo}
                            descrizione={f.descrizione}
                            impatto={f.impatto}
                            fix={f.fix}
                            dove={f.dove}
                            parlaId={`problema-sito:${dim.key || ""}|${f.titolo || ""}`}
                            parlaTitolo={`Problema sito: ${(f.titolo || "").slice(0, 60)}`}
                            parlaContesto={[
                              dim.key && `Area: ${dim.nome || dimensioneLeggibile(dim.key || "")}`,
                              f.descrizione,
                              f.impatto && `Impatto: ${f.impatto}`,
                              f.fix && `Fix proposto: ${f.fix}`,
                              f.dove && `Dove: ${f.dove}`,
                            ].filter(Boolean).join(" · ")}
                          />
                        );
                      })}
                      <ParlaCasella idCasella={`sito:${dim.key || ""}`} titolo={`Sito: ${dim.nome || dimensioneLeggibile(dim.key || "")}`} contesto={`Area «${dim.nome || dimensioneLeggibile(dim.key || "")}» della radiografia sito del ${d.data}: ${findings.length} problemi ancora aperti (${nBlocc} bloccanti, ${nGravi} gravi)${(dim.problemi_chiusi ?? 0) ? `, ${dim.problemi_chiusi} già riparati` : ""}.`} />
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
