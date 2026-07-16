"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Check, Loader2 } from "lucide-react";

// 📷 Scatta una foto DENTRO la chat e la aggiunge come allegato del messaggio.
// Gemello di BottoneAllegatiChat: stessa firma `onScegli(FileList|null)`, così si innesta
// ovunque c'è la barra della chat. La foto entra nel normale flusso allegati → il worker
// (Claude com'è adesso, via abbonamento) la GUARDA e risponde in chat. Nessuna API a consumo,
// nessuna sezione a parte: tutto dalla chat.
export default function BottoneFotoChat({
  disabled,
  iconSize,
  className,
  onScegli,
  etichetta,
}: {
  disabled: boolean;
  iconSize: number;
  className: string;
  onScegli: (lista: FileList | null) => void;
  etichetta?: string;
}) {
  const [aperto, setAperto] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [pronta, setPronta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
  }, [stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const apri = useCallback(async () => {
    if (disabled) return;
    setAperto(true);
    setErrore(null);
    setPronta(false);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErrore("Questo browser non permette l'accesso alla telecamera.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
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
  }, [disabled]);

  const scatta = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) {
      setErrore("La telecamera non è ancora pronta. Attendi un istante e riprova.");
      return;
    }
    setSalvando(true);
    const canvas = document.createElement("canvas");
    const maxLato = 1280; // foto leggera ma nitida
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
          // Fallback estremo se DataTransfer non è disponibile: costruisco un FileList-like.
          onScegli({ 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) } as unknown as FileList);
        }
        chiudi();
      },
      "image/jpeg",
      0.85
    );
  }, [onScegli, chiudi]);

  return (
    <>
      <button
        type="button"
        onClick={apri}
        disabled={disabled}
        className={`${className} ${disabled ? "opacity-40 pointer-events-none" : ""}`}
        aria-label="Scatta una foto"
        title="Scatta una foto con la telecamera"
      >
        <span className="inline-flex items-center gap-1.5">
          <Camera size={iconSize} />
          {etichetta ? <span>{etichetta}</span> : null}
        </span>
      </button>

      {aperto && (
        <div className="fixed inset-0 z-[100] bg-black/80 grid place-items-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl" style={{ background: "var(--bg-surface, #111)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-[13px] font-semibold inline-flex items-center gap-2">
                <Camera size={16} /> Scatta una foto
              </span>
              <button onClick={chiudi} className="p-1.5 rounded-lg hover:bg-black/10" aria-label="Chiudi">
                <X size={16} />
              </button>
            </div>

            <div className="relative bg-black aspect-[4/3] flex items-center justify-center">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
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
                onClick={apri}
                disabled={salvando}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium active:scale-95 transition"
                style={{ borderColor: "var(--border)" }}
                title="Riavvia la telecamera"
              >
                <RefreshCw size={15} /> Riavvia
              </button>
              <button
                onClick={chiudi}
                className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium active:scale-95 transition"
                style={{ borderColor: "var(--border)" }}
              >
                <X size={15} /> Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
