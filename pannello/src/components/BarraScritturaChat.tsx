"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Brain, FileText, Loader2, Mic, Send } from "lucide-react";
import FinestraComandiSkill, { BottoneSkill } from "@/components/FinestraComandiSkill";
import BottoneAllegatiChat from "@/components/BottoneAllegatiChat";
import AnteprimaAllegatiChat from "@/components/AnteprimaAllegatiChat";
import { gestisciInvioChat } from "@/lib/chat-input";

export type BarraScritturaChatHandle = {
  getTesto: () => string;
  setTesto: (t: string) => void;
  svuota: () => void;
};

type Props = {
  variant: "assistente" | "fluttuante";
  hintInvio: string;
  loading: boolean;
  allegati: File[];
  allegatiAvviso: string;
  avvisoVoce: string;
  ascoltando: boolean;
  /** Persiste la bozza tra chat intera e fluttuante (una sola superficie montata per volta). */
  bozzaCondivisaRef: React.MutableRefObject<string>;
  onAllegati: (lista: FileList | null) => void;
  onTogliAllegato: (i: number) => void;
  onDetta: () => void;
  onInvia: (testo: string) => void;
  onPrompt?: (testo: string) => void;
};

// ponytail: isolare lo state della bozza qui evita di ri-renderizzare tutta Home (page.tsx) a ogni keystroke.
const BarraScritturaChat = forwardRef<BarraScritturaChatHandle, Props>(function BarraScritturaChat(
  {
    variant,
    hintInvio,
    loading,
    allegati,
    allegatiAvviso,
    avvisoVoce,
    ascoltando,
    bozzaCondivisaRef,
    onAllegati,
    onTogliAllegato,
    onDetta,
    onInvia,
    onPrompt,
  },
  ref,
) {
  const [bozza, setBozza] = useState(() => bozzaCondivisaRef.current);
  const [skillAperte, setSkillAperte] = useState(false);

  useEffect(() => {
    bozzaCondivisaRef.current = bozza;
  }, [bozza, bozzaCondivisaRef]);

  useImperativeHandle(
    ref,
    () => ({
      getTesto: () => bozza,
      setTesto: (t: string) => setBozza(t),
      svuota: () => setBozza(""),
    }),
    [bozza],
  );

  function invia() {
    const t = bozza.trim();
    if (!t && allegati.length === 0) return;
    setBozza("");
    bozzaCondivisaRef.current = "";
    onInvia(t);
  }

  function prompt() {
    if (!onPrompt) return;
    const t = bozza.trim();
    if (!t) return;
    setBozza("");
    bozzaCondivisaRef.current = "";
    onPrompt(t);
  }

  const fab = variant === "fluttuante";
  const puoInviare = Boolean(bozza.trim()) || allegati.length > 0;

  return (
    <div className={`border-t space-y-2 ${fab ? "p-2.5" : "p-3"}`} style={{ borderColor: "var(--border)", background: "var(--bg-surface-2)" }}>
      <FinestraComandiSkill
        aperta={skillAperte}
        onChiudi={() => setSkillAperte(false)}
        onScegli={(cmd) => {
          setBozza(cmd);
          setSkillAperte(false);
        }}
      />
      <div className="flex items-center gap-2">
        <BottoneSkill
          aperta={skillAperte}
          onToggle={() => setSkillAperte((v) => !v)}
          lato={fab ? 40 : undefined}
          icona={fab ? 16 : undefined}
        />
        <BottoneAllegatiChat
          disabled={allegati.length >= 6}
          iconSize={fab ? 16 : 18}
          className={
            fab
              ? "min-h-[40px] min-w-[40px] grid place-items-center rounded-xl border border-black/10 text-black/55 hover:bg-black/[0.04] transition active:scale-95"
              : "min-h-[44px] min-w-[44px] grid place-items-center px-3 rounded-xl border border-black/10 text-black/55 hover:bg-black/[0.04] transition active:scale-95"
          }
          onScegli={onAllegati}
        />
        <button
          onClick={onDetta}
          disabled={ascoltando}
          className={`grid place-items-center rounded-xl border transition active:scale-95 ${
            fab ? "min-h-[40px] min-w-[40px]" : "min-h-[44px] min-w-[44px] px-3"
          } ${ascoltando ? "bg-red-500 text-white border-red-500 animate-pulse" : "border-black/10 text-black/55 hover:bg-black/[0.04]"}`}
          aria-label="Detta a voce"
          title="Detta a voce"
        >
          <Mic size={fab ? 16 : 18} />
        </button>
        {!fab && onPrompt && (
          <button
            onClick={prompt}
            disabled={!bozza.trim()}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 border border-brand/40 text-brand px-3 rounded-xl text-xs font-medium hover:bg-brand-50 active:scale-95 transition disabled:opacity-40 disabled:active:scale-100"
            aria-label="Prompt (copia per Max)"
            title="Crea un prompt pronto da incollare in Claude col tuo Max (gratis)"
          >
            <FileText size={15} /> Prompt
          </button>
        )}
        <button
          onClick={invia}
          disabled={!puoInviare || loading}
          className={
            fab
              ? "ml-auto min-h-[40px] min-w-[40px] grid place-items-center rounded-xl bg-brand text-white disabled:opacity-40 hover:bg-brand-dark active:scale-95 transition"
              : "ml-auto min-h-[44px] min-w-[44px] justify-center bg-brand text-white px-4 rounded-xl hover:bg-brand-dark active:scale-95 transition disabled:opacity-40 disabled:active:scale-100 inline-flex items-center gap-1.5"
          }
          aria-label={fab ? "Invia" : "Manda al cervello"}
          title={fab ? undefined : `Chatta con l'AD (Claude Code sul tuo Max): gratis, risponde qui — ${hintInvio}`}
        >
          {loading ? (
            <Loader2 size={fab ? 16 : 18} className="animate-spin" />
          ) : fab ? (
            <Send size={16} />
          ) : (
            <Brain size={18} />
          )}
        </button>
      </div>
      <AnteprimaAllegatiChat allegati={allegati} onTogli={onTogliAllegato} />
      {allegatiAvviso && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400 px-0.5">{allegatiAvviso}</p>
      )}
      {avvisoVoce && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400 px-0.5">{avvisoVoce}</p>
      )}
      <textarea
        value={bozza}
        onChange={(e) => setBozza(e.target.value)}
        onKeyDown={(e) => gestisciInvioChat(e, invia)}
        rows={fab ? 3 : 2}
        placeholder={
          fab
            ? `Scrivi all'AD…  (${hintInvio})`
            : `Scrivi all'AD (col tuo Max), gratis…  (${hintInvio})`
        }
        className={
          fab
            ? "input-soft w-full min-h-[78px] max-h-28 resize-y text-[13px]"
            : "input-soft w-full min-h-[56px] max-h-24 resize-y"
        }
      />
    </div>
  );
});

export default BarraScritturaChat;
