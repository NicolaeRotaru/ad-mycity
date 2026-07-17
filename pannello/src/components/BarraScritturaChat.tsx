"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Brain, FileText, History, Loader2, Mic, Plus, Send, Volume2, VolumeX } from "lucide-react";
import FinestraComandiSkill, { BottoneSkill } from "@/components/FinestraComandiSkill";
import BottoneAllegatiChat from "@/components/BottoneAllegatiChat";
import BottoneFotoChat from "@/components/BottoneFotoChat";
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
  /** 🔊 Modalità live "voce del worker": legge le risposte ad alta voce (browser, nessuna API). */
  voceWorker?: boolean;
  onToggleVoce?: () => void;
  onConversazioni?: () => void;
  onNuovaChat?: () => void;
  /** Messaggi della chat da mostrare nella finestra chat del video live. */
  chatMessaggi?: { role: string; content: string; pending?: boolean }[];
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
    voceWorker,
    onToggleVoce,
    onConversazioni,
    onNuovaChat,
    chatMessaggi,
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
      <AnteprimaAllegatiChat allegati={allegati} onTogli={onTogliAllegato} />
      <div className="flex items-center gap-2 flex-wrap">
        {!fab && onConversazioni && (
          <button
            onClick={onConversazioni}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 border border-black/10 text-black/55 px-3 rounded-xl text-xs hover:bg-black/[0.04] active:scale-95 transition"
            title="Lista conversazioni"
          >
            <History size={15} /> Conv
          </button>
        )}
        {!fab && onNuovaChat && (
          <button
            onClick={onNuovaChat}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 border border-black/10 text-black/55 px-3 rounded-xl text-xs hover:bg-black/[0.04] active:scale-95 transition"
            title="Nuova chat"
          >
            <Plus size={15} /> Nuova
          </button>
        )}
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
        <BottoneFotoChat
          disabled={allegati.length >= 6}
          iconSize={fab ? 16 : 18}
          className={
            fab
              ? "min-h-[40px] min-w-[40px] grid place-items-center rounded-xl border border-black/10 text-black/55 hover:bg-black/[0.04] transition active:scale-95"
              : "min-h-[44px] min-w-[44px] grid place-items-center px-3 rounded-xl border border-black/10 text-black/55 hover:bg-black/[0.04] transition active:scale-95"
          }
          onScegli={onAllegati}
        />
        <BottoneFotoChat
          videoLive
          disabled={allegati.length >= 6}
          iconSize={fab ? 16 : 18}
          className={
            fab
              ? "min-h-[40px] min-w-[40px] grid place-items-center rounded-xl border border-black/10 text-black/55 hover:bg-black/[0.04] transition active:scale-95"
              : "min-h-[44px] min-w-[44px] grid place-items-center px-3 rounded-xl border border-black/10 text-black/55 hover:bg-black/[0.04] transition active:scale-95"
          }
          onScegli={onAllegati}
          chatMessaggi={chatMessaggi}
          chatLoading={loading}
          chatOnInvia={onInvia}
          chatOnDetta={onDetta}
          chatAscoltando={ascoltando}
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
        {onToggleVoce && (
          <button
            onClick={onToggleVoce}
            className={`grid place-items-center rounded-xl border transition active:scale-95 ${
              fab ? "min-h-[40px] min-w-[40px]" : "min-h-[44px] min-w-[44px] px-3"
            } ${voceWorker ? "bg-brand text-white border-brand" : "border-black/10 text-black/55 hover:bg-black/[0.04]"}`}
            aria-label={voceWorker ? "Voce del worker attiva" : "Attiva la voce del worker"}
            title={voceWorker ? "Live voce attiva: il worker legge le risposte ad alta voce (tocca per spegnere)" : "Live voce: fai leggere le risposte al worker (browser, nessuna API)"}
          >
            {voceWorker ? <Volume2 size={fab ? 16 : 18} /> : <VolumeX size={fab ? 16 : 18} />}
          </button>
        )}
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
          disabled={!puoInviare}
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
            ? `Scrivi al worker…  (${hintInvio})`
            : `Scrivi al worker (col tuo Max), gratis…  (${hintInvio})`
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
