"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, Check, X, RefreshCw, Mic, Video, ShoppingBag, Store } from "lucide-react";

// 🎥 Vetrina live — Organo #1 di "JARVIS di MyCity".
// Apri la telecamera, inquadri un prodotto, scatti: il cervello guarda la foto e prepara
// una BOZZA di scheda (nome, prezzo suggerito, categoria, descrizione). Tu correggi e confermi.
// SICURO: qui NON si scrive nulla nel catalogo. La scrittura reale è il passo 🔴 successivo,
// che parte solo con la firma di Nicola. I pulsanti voce/video-live sono già presenti ma
// "Presto": si accendono quando si collega il modello live (onestà: niente finto-funzionante).

type Negozio = { id: string; nome: string };

type Bozza = {
  nome: string;
  descrizione: string;
  categoria: string | null;
  prezzo_suggerito: number | null;
  prezzo_motivo: string | null;
  unita: string | null;
  note: string | null;
};

type BozzaPronta = Bozza & { foto: string; negozioId: string; negozioNome: string };

export default function VetrinaLive() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [negozi, setNegozi] = useState<Negozio[]>([]);
  const [negozioId, setNegozioId] = useState<string>("");
  const [dbCollegato, setDbCollegato] = useState<boolean | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraErr, setCameraErr] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [analizzando, setAnalizzando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [bozza, setBozza] = useState<Bozza | null>(null);
  const [pronte, setPronte] = useState<BozzaPronta[]>([]);

  // Carica la lista negozi (sola lettura).
  useEffect(() => {
    let vivo = true;
    fetch("/api/vetrina-live/negozi")
      .then((r) => r.json())
      .then((d) => {
        if (!vivo) return;
        setDbCollegato(Boolean(d?.collegato));
        setNegozi(Array.isArray(d?.negozi) ? d.negozi : []);
      })
      .catch(() => vivo && setDbCollegato(false));
    return () => {
      vivo = false;
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  // Spegni la telecamera quando si lascia la schermata (privacy + batteria).
  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraErr(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraErr("Questo browser non permette l'accesso alla telecamera.");
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
      setCameraOn(true);
    } catch (e: any) {
      const nome = e?.name || "";
      if (nome === "NotAllowedError") setCameraErr("Permesso telecamera negato. Consenti l'accesso dal browser e riprova.");
      else if (nome === "NotFoundError") setCameraErr("Nessuna telecamera trovata su questo dispositivo.");
      else setCameraErr("Non riesco ad aprire la telecamera. " + (e?.message || ""));
      setCameraOn(false);
    }
  }, []);

  const analizza = useCallback(
    async (dataUrl: string) => {
      setAnalizzando(true);
      setErrore(null);
      setBozza(null);
      try {
        const neg = negozi.find((n) => n.id === negozioId);
        const res = await fetch("/api/vetrina-live/analizza", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ immagine: dataUrl, negozio_nome: neg?.nome }),
        });
        const d = await res.json();
        if (!d?.ok) {
          setErrore(d?.error || "Analisi non riuscita.");
          return;
        }
        setBozza(d.bozza as Bozza);
      } catch (e: any) {
        setErrore(e?.message || "Errore di rete durante l'analisi.");
      } finally {
        setAnalizzando(false);
      }
    },
    [negozi, negozioId]
  );

  const scatta = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) {
      setErrore("La telecamera non è ancora pronta. Attendi un istante e riprova.");
      return;
    }
    const canvas = document.createElement("canvas");
    // Ridimensiono a max 1280px lato lungo: qualità buona, foto leggera.
    const maxLato = 1280;
    const scala = Math.min(1, maxLato / Math.max(v.videoWidth, v.videoHeight));
    canvas.width = Math.round(v.videoWidth * scala);
    canvas.height = Math.round(v.videoHeight * scala);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setErrore("Non riesco a catturare il fotogramma.");
      return;
    }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setFoto(dataUrl);
    void analizza(dataUrl);
  }, [analizza]);

  const rifaiFoto = useCallback(() => {
    setFoto(null);
    setBozza(null);
    setErrore(null);
  }, []);

  const confermaBozza = useCallback(() => {
    if (!bozza || !foto) return;
    const neg = negozi.find((n) => n.id === negozioId);
    setPronte((p) => [
      { ...bozza, foto, negozioId, negozioNome: neg?.nome || "(nessun negozio scelto)" },
      ...p,
    ]);
    setFoto(null);
    setBozza(null);
    setErrore(null);
  }, [bozza, foto, negozi, negozioId]);

  const aggiornaBozza = (campo: keyof Bozza, valore: string) => {
    setBozza((b) => {
      if (!b) return b;
      if (campo === "prezzo_suggerito") {
        const n = parseFloat(valore.replace(",", "."));
        return { ...b, prezzo_suggerito: Number.isFinite(n) ? n : null };
      }
      return { ...b, [campo]: valore } as Bozza;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🎥 Vetrina live</h2>
        <p className="t-eti mt-0.5">
          Apri la telecamera, inquadra un prodotto e scatta: l&apos;AD prepara la scheda, tu correggi e confermi.
          <span className="font-medium"> Nessuna scrittura sul catalogo</span> — la pubblicazione è un passo separato con la tua firma.
        </p>
      </div>

      {/* Barra strumenti JARVIS: voce e video-live in arrivo (onesti: disattivati finché non c'è la chiave live) */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium opacity-60 cursor-not-allowed"
          style={{ background: "var(--surface-2, rgba(0,0,0,0.04))", color: "var(--text-muted)" }}
          title="In arrivo: conversazione a voce in tempo reale (serve il modello live)"
        >
          <Mic size={14} /> Parla con JARVIS · Presto
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium opacity-60 cursor-not-allowed"
          style={{ background: "var(--surface-2, rgba(0,0,0,0.04))", color: "var(--text-muted)" }}
          title="In arrivo: l'AD guarda il video in diretta (serve il modello live)"
        >
          <Video size={14} /> Video live · Presto
        </span>
      </div>

      {/* Scelta negozio */}
      <div className="card p-4 space-y-2">
        <label className="flex items-center gap-2 text-[13px] font-medium">
          <Store size={15} /> In quale negozio carichi i prodotti?
        </label>
        {dbCollegato === false ? (
          <p className="t-eti">Database del marketplace non collegato: puoi comunque scattare e far compilare la bozza, ma senza scegliere il negozio.</p>
        ) : (
          <select
            value={negozioId}
            onChange={(e) => setNegozioId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-[13px] bg-transparent"
            style={{ borderColor: "var(--border)" }}
          >
            <option value="">— scegli un negozio —</option>
            {negozi.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Telecamera + scatto */}
      <div className="card p-4 space-y-3">
        <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-[4/3] flex items-center justify-center">
          {/* Anteprima live (nascosta se stiamo guardando una foto scattata) */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${foto ? "hidden" : "block"}`}
          />
          {foto && <img src={foto} alt="Foto scattata" className="w-full h-full object-contain" />}
          {!cameraOn && !foto && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
              <Camera size={40} />
              <span className="text-[13px]">Telecamera spenta</span>
            </div>
          )}
        </div>

        {cameraErr && <p className="text-[12.5px] text-red-500">{cameraErr}</p>}

        <div className="flex flex-wrap items-center gap-2">
          {!cameraOn ? (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[13px] font-medium shadow-card"
            >
              <Camera size={16} /> Apri telecamera
            </button>
          ) : (
            <>
              {!foto && (
                <button
                  onClick={scatta}
                  disabled={analizzando}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[13px] font-medium shadow-card disabled:opacity-60"
                >
                  <Camera size={16} /> Scatta foto
                </button>
              )}
              {foto && (
                <button
                  onClick={rifaiFoto}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-medium"
                  style={{ borderColor: "var(--border)" }}
                >
                  <RefreshCw size={16} /> Rifai foto
                </button>
              )}
              <button
                onClick={stopCamera}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium"
                style={{ borderColor: "var(--border)" }}
              >
                <CameraOff size={16} /> Spegni
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bozza in lavorazione */}
      {analizzando && (
        <div className="card p-4 flex items-center gap-2 text-[13px]">
          <Loader2 size={16} className="animate-spin" /> L&apos;AD sta guardando la foto e prepara la scheda…
        </div>
      )}

      {errore && !analizzando && <div className="card p-4 text-[13px] text-red-500">{errore}</div>}

      {bozza && !analizzando && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <ShoppingBag size={16} /> Bozza scheda prodotto <span className="t-eti font-normal">(correggi liberamente)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1 sm:col-span-2">
              <span className="t-eti">Nome</span>
              <input
                value={bozza.nome}
                onChange={(e) => aggiornaBozza("nome", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-[13px] bg-transparent"
                style={{ borderColor: "var(--border)" }}
                placeholder="Nome del prodotto"
              />
            </label>
            <label className="space-y-1">
              <span className="t-eti">Prezzo suggerito (€)</span>
              <input
                value={bozza.prezzo_suggerito ?? ""}
                onChange={(e) => aggiornaBozza("prezzo_suggerito", e.target.value)}
                inputMode="decimal"
                className="w-full rounded-lg border px-3 py-2 text-[13px] bg-transparent"
                style={{ borderColor: "var(--border)" }}
                placeholder="es. 8,90"
              />
            </label>
            <label className="space-y-1">
              <span className="t-eti">Categoria</span>
              <input
                value={bozza.categoria ?? ""}
                onChange={(e) => aggiornaBozza("categoria", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-[13px] bg-transparent"
                style={{ borderColor: "var(--border)" }}
                placeholder="es. Gastronomia"
              />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="t-eti">Descrizione</span>
              <textarea
                value={bozza.descrizione}
                onChange={(e) => aggiornaBozza("descrizione", e.target.value)}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-[13px] bg-transparent resize-y"
                style={{ borderColor: "var(--border)" }}
                placeholder="Descrizione onesta del prodotto"
              />
            </label>
            <label className="space-y-1">
              <span className="t-eti">Unità</span>
              <input
                value={bozza.unita ?? ""}
                onChange={(e) => aggiornaBozza("unita", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-[13px] bg-transparent"
                style={{ borderColor: "var(--border)" }}
                placeholder="pezzo, kg, l…"
              />
            </label>
          </div>

          {bozza.prezzo_motivo && (
            <p className="t-eti">💡 Perché quel prezzo: {bozza.prezzo_motivo} — decidi tu il prezzo finale.</p>
          )}
          {bozza.note && <p className="t-eti">📝 Da chiarire: {bozza.note}</p>}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={confermaBozza}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[13px] font-medium shadow-card"
            >
              <Check size={16} /> Conferma bozza
            </button>
            <button
              onClick={rifaiFoto}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-medium"
              style={{ borderColor: "var(--border)" }}
            >
              <X size={16} /> Scarta
            </button>
          </div>
          <p className="t-eti">
            🔴 «Conferma» tiene la bozza qui pronta. La scrittura vera nel catalogo del negozio è il passo successivo,
            che si attiva solo con la tua firma (mani di scrittura ancora spente, di proposito).
          </p>
        </div>
      )}

      {/* Bozze pronte in questa sessione */}
      {pronte.length > 0 && (
        <div className="card p-4 space-y-3">
          <div className="text-[13px] font-semibold">✅ Bozze pronte ({pronte.length}) — in attesa di firma per andare a catalogo</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pronte.map((p, i) => (
              <div key={i} className="flex gap-3 rounded-xl border p-2" style={{ borderColor: "var(--border)" }}>
                <img src={p.foto} alt={p.nome} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0 text-[12.5px]">
                  <div className="font-medium truncate">{p.nome || "(senza nome)"}</div>
                  <div className="t-eti truncate">{p.negozioNome}</div>
                  <div className="t-eti">
                    {p.prezzo_suggerito != null ? `€ ${p.prezzo_suggerito}` : "prezzo da definire"}
                    {p.categoria ? ` · ${p.categoria}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
