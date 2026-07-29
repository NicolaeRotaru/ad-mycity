"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { usePanelSync } from "@/lib/panel-sync";

type Stella = { id: string; emoji: string; nome: string; descrizione: string; principale: boolean; attiva: boolean };

// ⭐ Le 3 Stelle Polari, con interruttore on/off per le secondarie.
// Il numero reale di ogni Stella, dai dati già disponibili (/api/metriche).
// Se la fonte non è collegata, resta "—" (mai numeri inventati).
function valoreStella(id: string, m: Record<string, any> | null): string {
  if (!m) return "—";
  const n = (k: string) => (m[k] === undefined || m[k] === null ? null : Number(m[k]));
  if (id === "ordini") {
    const c = n("consegne_7g") ?? n("ordini_7g");
    return c == null ? "—" : `${c} consegnati · 7g`;
  }
  if (id === "clienti") {
    const nuovi = n("nuovi_clienti_7g");
    const visite = n("visite_7g");
    const conv = n("conversione");
    const parti = [
      nuovi != null ? `${nuovi} nuovi` : null,
      visite != null ? `${visite} visite` : null,
      conv != null ? `${conv}% conv.` : null,
    ].filter(Boolean);
    return parti.length ? `${parti.join(" · ")} · 7g` : "—";
  }
  if (id === "influenza") {
    const neg = n("negozi");
    const rec = n("recensioni_totali");
    const visite = n("visite_7g");
    const parti = [
      neg != null ? `${neg} negozi` : null,
      rec != null ? `${rec} recensioni` : null,
      visite != null ? `${visite} visite/7g` : null,
    ].filter(Boolean);
    return parti.length ? parti.join(" · ") : "—";
  }
  return "—";
}

export default function StellePolari() {
  const [stelle, setStelle] = useState<Stella[]>([]);
  const [salvando, setSalvando] = useState<string | null>(null); // AR-262: quale stella sta salvando
  const [errore, setErrore] = useState<Record<string, string>>({}); // AR-262: perché non è stata salvata
  const [metriche, setMetriche] = useState<Record<string, any> | null>(null);
  const carica = useCallback(() =>
    fetch("/api/stelle", { cache: "no-store" }).then((r) => r.json()).then((d) => setStelle(d.stelle || [])).catch(() => {}), []);
  const caricaMetriche = useCallback(() =>
    fetch("/api/metriche", { cache: "no-store" }).then((r) => r.json()).then(setMetriche).catch(() => {}), []);

  const refresh = useCallback(() => { carica(); caricaMetriche(); }, [carica, caricaMetriche]);

  useEffect(() => {
    refresh();
    const id = setInterval(caricaMetriche, 60_000);
    return () => clearInterval(id);
  }, [refresh, caricaMetriche]);

  usePanelSync(["memoria", "all"], refresh);

  // AR-262 — l'interruttore tornava indietro da solo, senza dire perché. Tre cause in fila:
  //   ① `.catch(() => {})` sulla POST: l'errore spariva;
  //   ② `res.ok` non veniva mai controllato — una risposta 500 arriva col suo corpo e NON fa scattare
  //      il catch, quindi anche un rifiuto del server passava per un salvataggio riuscito;
  //   ③ subito dopo si ricaricava dal server, che riallineava allo stato vero.
  // Risultato a video: Nicola clicca, la levetta si muove, e mezzo secondo dopo torna indietro. Senza
  // una parola. Non sapeva se aveva sbagliato lui, se il click non era stato preso, o se era un guasto.
  async function toggle(s: Stella) {
    if (s.principale) return;
    if (salvando === s.id) return; // niente doppio invio sulla stessa stella
    setSalvando(s.id);
    setErrore((e) => ({ ...e, [s.id]: "" }));
    // ottimistico
    setStelle((list) => list.map((x) => (x.id === s.id ? { ...x, attiva: !x.attiva } : x)));
    try {
      const res = await fetch("/api/stelle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, attiva: !s.attiva }),
      });
      if (!res.ok) throw new Error(`il server ha risposto ${res.status}`);
      carica();
    } catch (e) {
      // Il ripristino resta (lo stato vero è del server), ma adesso è SPIEGATO.
      setErrore((prev) => ({ ...prev, [s.id]: e instanceof Error ? `Non salvato — ${e.message}` : "Non salvato — riprova" }));
      carica();
    } finally {
      setSalvando(null);
    }
  }

  if (stelle.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <Star size={15} className="text-brand shrink-0" />
        <span className="t-sez">Stelle Polari</span>
        <span className="t-eti min-w-0">la principale è sempre accesa; le altre le accendi tu</span>
      </div>
      {stelle.map((s) => (
        <div
          key={s.id}
          className={`rounded-xl border p-3 flex items-start gap-3 ${s.attiva ? "border-brand/25 bg-brand-50/20" : "border-black/[0.07] bg-paper/30"}`}
        >
          <span className="text-[18px] leading-none mt-0.5">{s.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-ink">{s.nome}</div>
            <div className="text-[12px] font-medium text-brand mt-0.5 tabular-nums">{valoreStella(s.id, metriche)}</div>
            <div className="t-eti mt-0.5">{s.descrizione}</div>
            {/* AR-262: se il salvataggio non è riuscito, la levetta torna indietro — ma adesso accanto
                c'è scritto perché, invece di lasciare Nicola a chiedersi se ha sbagliato lui. */}
            {errore[s.id] && <div className="t-eti mt-1 text-amber-600">⚠️ {errore[s.id]}</div>}
          </div>
          {s.principale ? (
            <span className="badge badge-on shrink-0">sempre attiva</span>
          ) : (
            <button
              onClick={() => toggle(s)}
              disabled={salvando === s.id}
              className={`shrink-0 inline-flex items-center h-6 w-11 rounded-full transition disabled:opacity-50 ${s.attiva ? "bg-brand" : "bg-black/15"}`}
              aria-pressed={s.attiva}
              aria-busy={salvando === s.id}
              title={salvando === s.id ? "Sto salvando…" : s.attiva ? "Spegni" : "Accendi"}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${s.attiva ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
