"use client";

import { useEffect, useMemo, useState } from "react";
import { ListTodo, Archive, Terminal } from "lucide-react";
import LavoriCervello from "@/components/LavoriCervello";
import DiagnosticaWorker from "@/components/DiagnosticaWorker";
import ComandiVPS from "@/components/ComandiVPS";
import type { LavoroBase } from "@/lib/lavori-gruppo";
import { EVENTO_SUB, vaiSub, consumaSubPendente, type DettaglioSub } from "@/lib/nav";

type Tab = "coda" | "archivio" | "risultati";

export type ConteggiLavoriUi = { coda: number; archivio: number };

type Props = {
  lavori: LavoroBase[];
  onSvuota: () => void;
  workerVivo?: boolean | null;
  adInPausa?: boolean;
  /** Conteggi reali dal DB (badge tab). Se assenti, si calcolano dalla lista (meno affidabile). */
  conteggi?: ConteggiLavoriUi;
  archivioHasMore?: boolean;
  archivioCaricati?: number;
  onCaricaAltroArchivio?: () => void;
  caricamentoArchivio?: boolean;
};

export default function Lavori({
  lavori,
  onSvuota,
  workerVivo,
  adInPausa,
  conteggi,
  archivioHasMore,
  archivioCaricati,
  onCaricaAltroArchivio,
  caricamentoArchivio,
}: Props) {
  const [tab, setTab] = useState<Tab>("coda");

  // Sincronizza la scheda col tasto INDIETRO: ogni click di scheda timbra una voce di
  // cronologia (pushState, non più hash) e il popstate centrale riemette EVENTO_SUB che
  // qui riapre la scheda precedente, non la Plancia. (contratto nav)
  useEffect(() => {
    // Al MOUNT consuma il sub parcheggiato (INDIETRO scattato prima che l'area fosse montata).
    const pend = consumaSubPendente("lavori");
    if (pend === "coda" || pend === "archivio" || pend === "risultati") setTab(pend);
    const onSub = (e: Event) => {
      const det = (e as CustomEvent<DettaglioSub>).detail;
      if (det?.vista !== "lavori" || !det.sub) return;
      if (det.sub === "coda" || det.sub === "archivio" || det.sub === "risultati") setTab(det.sub as Tab);
    };
    window.addEventListener(EVENTO_SUB, onSub);
    return () => window.removeEventListener(EVENTO_SUB, onSub);
  }, []);

  // (fix #6) I lavori falliti sono "da riapprovare": stanno nella corsia ATTIVA ("In coda"),
  // non nell'Archivio (che tiene solo i lavori completati). Così l'azione da fare è sott'occhio.
  const inCoda = (l: LavoroBase) => l.stato === "in_attesa" || l.stato === "in_corso" || l.stato === "errore";
  // Archivio = stati terminali: completati E annullati (così un lavoro annullato lascia la corsia attiva
  // ma resta consultabile, non sparisce).
  const inArchivio = (l: LavoroBase) => l.stato === "fatto" || l.stato === "annullato";
  const filtrati = useMemo(() => {
    if (tab === "coda") return lavori.filter(inCoda);
    return lavori.filter(inArchivio);
  }, [lavori, tab]);

  const nCoda = conteggi?.coda ?? lavori.filter(inCoda).length;
  const nArchivio = conteggi?.archivio ?? lavori.filter(inArchivio).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; n?: number }[] = [
    { id: "coda", label: "In coda", icon: <ListTodo size={14} />, n: nCoda },
    { id: "archivio", label: "Archivio", icon: <Archive size={14} />, n: nArchivio },
    { id: "risultati", label: "Risultati", icon: <Terminal size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">🧠 Lavori del cervello</h2>
          <p className="t-eti mt-0.5">
            Coda e storico dei compiti che l&apos;AD esegue sul tuo Max. Ogni casella è una chat: premi <b>Chat</b> e si apre qui sotto — rispondi e resti nella stessa conversazione, senza cambiare pagina.
          </p>
        </div>
        {lavori.length > 0 && (
          <button
            type="button"
            onClick={onSvuota}
            className="shrink-0 text-xs text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 inline-flex items-center gap-1 transition mt-1"
          >
            <Archive size={12} /> Svuota tutto
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              vaiSub("lavori", t.id); // voce di cronologia per la scheda (contratto nav)
            }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "nav-tab-active bg-brand text-white shadow-card" : "nav-tab"
            }`}
          >
            {t.icon}
            {t.label}
            {(t.n ?? 0) > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${tab === t.id ? "bg-white/20" : "bg-black/5 dark:bg-white/10"}`}>
                {t.n}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stato del worker + i comandi macchina (spostati QUI dentro, richiesta di Nicola). */}
      <DiagnosticaWorker />

      {/* «Risultati» = pagina a sé con l'esito dei comandi; le altre schede mostrano la coda dei lavori. */}
      {tab === "risultati" ? (
        <ComandiVPS />
      ) : (
        <>
          <LavoriCervello lavori={filtrati} onSvuota={onSvuota} embedded workerVivo={workerVivo} adInPausa={adInPausa} />
          {tab === "archivio" && archivioHasMore && onCaricaAltroArchivio && (
            <div className="flex flex-col items-center gap-1 pt-1">
              <button
                type="button"
                onClick={onCaricaAltroArchivio}
                disabled={caricamentoArchivio}
                className="text-sm font-medium text-brand hover:underline disabled:opacity-50"
              >
                {caricamentoArchivio ? "Carico altri lavori…" : "Carica altri lavori"}
              </button>
              {typeof archivioCaricati === "number" && (
                <p className="text-[11px] text-black/45 dark:text-white/45">
                  Mostrati {archivioCaricati} di {nArchivio}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
