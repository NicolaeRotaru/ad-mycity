// 🔊 La VOCE del worker — senza NESSUNA API. Usa la sintesi vocale del browser
// (Web Speech API, `speechSynthesis`): legge ad alta voce le risposte del worker.
// Gratis, offline-ish, zero chiavi. Se il browser non la supporta → non fa nulla.

export function vocePronta(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

// Sceglie una voce italiana se c'è (le voci a volte arrivano in ritardo: si richiama al bisogno).
function scegliVoceItaliana(): SpeechSynthesisVoice | null {
  try {
    const voci = window.speechSynthesis.getVoices() || [];
    return (
      voci.find((v) => /^it([-_]it)?$/i.test(v.lang)) ||
      voci.find((v) => (v.lang || "").toLowerCase().startsWith("it")) ||
      null
    );
  } catch {
    return null;
  }
}

// Ripulisce il testo per la lettura: via i simboli markdown, i link grezzi e le emoji più comuni,
// così la voce non scandisce "cancelletto", "asterisco" o URL lunghissimi.
function perLaVoce(testo: string): string {
  return String(testo || "")
    .replace(/```[\s\S]*?```/g, " (blocco di codice) ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // link/immagini markdown → solo il testo
    .replace(/https?:\/\/\S+/g, " (link) ")
    .replace(/[#*_>~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// `onFine` (opzionale) parte quando il worker ha FINITO di parlare: serve per la modalità a MANI
// LIBERE (dopo che il worker ha risposto a voce, si riapre il microfono per il tuo turno).
export function parla(testo: string, onFine?: () => void): void {
  if (!vocePronta()) {
    onFine?.();
    return;
  }
  const pulito = perLaVoce(testo);
  if (!pulito) {
    onFine?.();
    return;
  }
  try {
    window.speechSynthesis.cancel(); // interrompe una lettura precedente
    const u = new SpeechSynthesisUtterance(pulito);
    const v = scegliVoceItaliana();
    if (v) u.voice = v;
    u.lang = v?.lang || "it-IT";
    u.rate = 1;
    u.pitch = 1;
    if (onFine) {
      u.onend = () => {
        try {
          onFine();
        } catch {
          /* niente */
        }
      };
    }
    window.speechSynthesis.speak(u);
  } catch {
    /* silenzioso: se la voce non parte, non blocchiamo la chat */
    onFine?.();
  }
}

export function fermaVoce(): void {
  if (!vocePronta()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* niente */
  }
}
