"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Video, X, RefreshCw, Check, Loader2, SwitchCamera, Mic, Send } from "lucide-react";

// 📷/📹 Telecamera DENTRO la chat. Due modalità, stessa base:
//  - variante FOTO (default): modalino compatto, scatti UNA foto e si chiude.
//  - variante VIDEO LIVE (`videoLive`): overlay a schermo intero, la telecamera resta in diretta,
//    scatti quante foto vuoi e, se passati i props `chatXxx`, hai anche microfono + textarea +
//    finestra messaggi nella stessa schermata senza dover chiudere la telecamera.
// In entrambe: la foto entra nel normale flusso allegati (stesso `onScegli` della graffetta).
export default function BottoneFotoChat({
  disabled,
  iconSize,
  className,
  onScegli,
  etichetta,
  videoLive = false,
  chatMessaggi,
  chatLoading,
  chatOnInvia,
  chatOnDetta,
  chatAscoltando,
}: {
  disabled: boolean;
  iconSize: number;
  className: string;
  onScegli: (lista: FileList | null) => void;
  etichetta?: string;
  videoLive?: boolean;
  // Props opzionali per la chat embedded nel video live
  chatMessaggi?: { role: string; content: string; pending?: boolean }[];
  chatLoading?: boolean;
  chatOnInvia?: (testo: string) => void;
  chatOnDetta?: () => void;
  chatAscoltando?: boolean;
}) {
  const [aperto, setAperto] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [pronta, setPronta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [scattate, setScattate] = useState(0);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [bozza, setBozza] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const msgBottomRef = useRef<HTMLDivElement | null>(null);

  const conChat = videoLive && !!chatOnInvia;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setPronta(false);
  }, []);

  const chiudi = useCallback(() => {
    stopCamera();
    setAperto(false);
    setErrore(null);
    setSalvando(false);
    setScattate(0);
    setBozza("");
  }, [stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Scroll automatico al fondo dei messaggi
  useEffect(() => {
    if (msgBottomRef.current) {
      msgBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessaggi, chatLoading]);

  const avvia = useCallback(
    async (modo: "environment" | "user") => {
      setErrore(null);
      setPronta(false);
      stopCamera();
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setErrore("Questo browser non permette l'accesso alla telecamera.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: modo } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPronta(true);
      } catch (e: any) {
        const nome = e?.name || "";
        if (nome === "NotAllowedError") setErrore("Permesso telecamera negato. Consenti l'accesso dal browser e riprova.");
        else if (nome === "NotFoundError") setErrore("Nessuna telecamera trovata su questo dispositivo.");
        else setErrore("Non riesco ad aprire la telecamera. " + (e?.message || ""));
      }
    },
    [stopCamera]
  );

  const apri = useCallback(() => {
    if (disabled) return;
    setAperto(true);
    setScattate(0);
    void avvia(facing);
  }, [disabled, avvia, facing]);

  const cambiaCamera = useCallback(() => {
    const nuovo = facing === "environment" ? "user" : "environment";
    setFacing(nuovo);
    void avvia(nuovo);
  }, [facing, avvia]);

  const scatta = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) {
      setErrore("La telecamera non è ancora pronta. Attendi un istante e riprova.");
      return;
    }
    setSalvando(true);
    const canvas = document.createElement("canvas");
    const maxLato = 1280;
    const scala = Math.min(1, maxLato / Math.max(v.videoWidth, v.videoHeight));
    canvas.width = Math.round(v.videoWidth * scala);
    canvas.height = Math.round(v.videoHeight * scala);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setErrore("Non riesco a catturare il fotogramma.");
      setSalvando(false);
      return;
    }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErrore("Non riesco a salvare la foto. Riprova.");
          setSalvando(false);
          return;
        }
        const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const file = new File([blob], `foto-${stamp}.jpg`, { type: "image/jpeg" });
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          onScegli(dt.files);
        } catch {
          onScegli({ 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) } as unknown as FileList);
        }
        setSalvando(false);
        if (videoLive) {
          setScattate((n) => n + 1);
        } else {
          chiudi();
        }
      },
      "image/jpeg",
      0.85
    );
  }, [onScegli, chiudi, videoLive]);

  function inviaMessaggio() {
    const t = bozza.trim();
    if (!t || !chatOnInvia) return;
    chatOnInvia(t);
    setBozza("");
  }

  const Icona = videoLive ? Video : Camera;

  return (
    <>
      <button
        type="button"
        onClick={apri}
        disabled={disabled}
        className={`${className} ${disabled ? "opacity-40 pointer-events-none" : ""}`}
        aria-label={videoLive ? "Apri il video live" : "Scatta una foto"}
        title={videoLive ? "Apri la telecamera in diretta (video live)" : "Scatta una foto con la telecamera"}
      >
        <span className="inline-flex items-center gap-1.5">
          <Icona size={iconSize} />
          {etichetta ? <span>{etichetta}</span> : null}
        </span>
      </button>

      {aperto && (
        <div className="fixed inset-0 z-[100] bg-black/85 grid place-items-center p-0 sm:p-4" role="dialog" aria-modal="true">
          <div
            className={
              videoLive
                ? "w-full h-full sm:h-auto sm:max-w-5xl flex flex-col sm:rounded-2xl overflow-hidden shadow-xl"
                : "w-full max-w-lg rounded-2xl overflow-hidden shadow-xl"
            }
            style={{ background: "#111", color: "#fff" }}
          >
            {/* Testata */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <span className="text-[13px] font-semibold inline-flex items-center gap-2">
                <Icona size={16} /> {videoLive ? "Video live" : "Scatta una foto"}
                {videoLive && scattate > 0 && (
                  <span className="text-[11px] font-normal text-emerald-400">· {scattate} foto aggiunte al messaggio</span>
                )}
              </span>
              <button onClick={chiudi} className="p-1.5 rounded-lg hover:bg-black/10" aria-label="Chiudi">
                <X size={16} />
              </button>
            </div>

            {/* Corpo: affiancato su desktop (camera + chat) o in pila su mobile */}
            <div className={conChat ? "flex flex-col sm:flex-row flex-1 overflow-hidden" : "flex flex-col flex-1"}>

              {/* ── SEZIONE TELECAMERA ── */}
              <div className={conChat ? "flex flex-col sm:w-[55%]" : "flex flex-col flex-1"}>
                <div className={`relative bg-black flex items-center justify-center ${videoLive ? "flex-1 min-h-[35vh] sm:min-h-[60vh]" : "aspect-[4/3]"}`}>
                  <video ref={videoRef} playsInline muted className="w-full h-full object-contain" />
                  {!pronta && !errore && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/70 text-[13px] gap-2">
                      <Loader2 size={18} className="animate-spin" /> Apro la telecamera…
                    </div>
                  )}
                </div>

                {errore && <p className="px-4 py-2 text-[12.5px] text-red-400">{errore}</p>}

                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    onClick={scatta}
                    disabled={!pronta || salvando}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[13px] font-medium disabled:opacity-50 active:scale-95 transition"
                  >
                    {salvando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Scatta
                  </button>
                  <button
                    onClick={cambiaCamera}
                    disabled={salvando}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium active:scale-95 transition"
                    style={{ borderColor: "rgba(255,255,255,0.18)" }}
                    title="Cambia fotocamera (fronte/retro)"
                  >
                    <SwitchCamera size={15} />
                  </button>
                  <button
                    onClick={() => void avvia(facing)}
                    disabled={salvando}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium active:scale-95 transition"
                    style={{ borderColor: "rgba(255,255,255,0.18)" }}
                    title="Riavvia la telecamera"
                  >
                    <RefreshCw size={15} />
                  </button>
                  {!conChat && (
                    <button
                      onClick={chiudi}
                      className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium active:scale-95 transition"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <X size={15} /> Chiudi
                    </button>
                  )}
                </div>
              </div>

              {/* ── SEZIONE CHAT (solo quando conChat) ── */}
              {conChat && (
                <div
                  className="flex flex-col sm:w-[45%] border-t sm:border-t-0 sm:border-l"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "#1a1a1a" }}
                >
                  {/* Messaggi */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-[120px] max-h-[30vh] sm:max-h-none">
                    {(!chatMessaggi || chatMessaggi.length === 0) && (
                      <p className="text-[12px] text-white/40 text-center pt-4">Scrivi un messaggio o scatta una foto — il worker risponde qui.</p>
                    )}
                    {chatMessaggi?.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-wrap break-words ${
                            m.role === "user"
                              ? "bg-brand text-white"
                              : m.pending
                              ? "text-white/50 italic"
                              : "text-white/90"
                          }`}
                          style={m.role === "assistant" && !m.pending ? { background: "#2a2a2a" } : undefined}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-xl px-3 py-2 text-[12px] text-white/50 flex items-center gap-1.5" style={{ background: "#2a2a2a" }}>
                          <Loader2 size={12} className="animate-spin" /> Sto pensando…
                        </div>
                      </div>
                    )}
                    <div ref={msgBottomRef} />
                  </div>

                  {/* Barra di scrittura */}
                  <div className="border-t px-3 py-3 space-y-2" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                    <textarea
                      value={bozza}
                      onChange={(e) => setBozza(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          inviaMessaggio();
                        }
                      }}
                      rows={2}
                      placeholder="Scrivi al worker… (Invio = invia)"
                      className="w-full rounded-xl px-3 py-2 text-[12.5px] resize-none outline-none border"
                      style={{
                        background: "#111",
                        borderColor: "rgba(255,255,255,0.18)",
                        color: "#fff",
                      }}
                    />
                    <div className="flex items-center gap-2">
                      {chatOnDetta && (
                        <button
                          type="button"
                          onClick={chatOnDetta}
                          disabled={chatAscoltando}
                          className={`grid place-items-center min-h-[36px] min-w-[36px] rounded-xl border transition active:scale-95 ${
                            chatAscoltando
                              ? "bg-red-500 text-white border-red-500 animate-pulse"
                              : "border-white/20 text-white/60 hover:bg-white/10"
                          }`}
                          aria-label="Detta a voce"
                          title="Detta a voce"
                        >
                          <Mic size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={inviaMessaggio}
                        disabled={!bozza.trim() || chatLoading}
                        className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[13px] font-medium disabled:opacity-40 active:scale-95 transition"
                      >
                        {chatLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Invia
                      </button>
                      <button
                        onClick={chiudi}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[13px] font-medium active:scale-95 transition"
                        style={{ borderColor: "rgba(255,255,255,0.18)", color: "#aaa" }}
                      >
                        <X size={14} /> Chiudi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
