/** Dettatura vocale in chat — Web Speech API del browser (Chrome/Edge desktop e Android). */

export type StatoDettatura = "idle" | "ascolta" | "errore";

type RecInstance = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results?: { [i: number]: { [j: number]: { transcript?: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  start: () => void;
};

function speechRecognitionCtor(): (new () => RecInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => RecInstance;
    webkitSpeechRecognition?: new () => RecInstance;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function suIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** Messaggio chiaro se il browser non può dettare (es. iPhone/Safari). */
export function avvisoDettaturaNonDisponibile(): string | null {
  const SR = speechRecognitionCtor();
  if (SR) return null;
  if (suIOS()) {
    return "Su iPhone il microfono della chat non funziona. Tocca la casella di testo e usa il microfono della tastiera Apple (accanto allo spazio).";
  }
  return "La dettatura vocale qui funziona solo su Chrome o Edge (computer o Android). Su iPhone usa il microfono della tastiera.";
}

function messaggioErrore(code: string): string {
  if (code === "not-allowed" || code === "service-not-allowed") {
    return "Microfono bloccato. Nelle impostazioni del browser o del telefono consenti l'accesso al microfono per MyCity, poi riprova.";
  }
  if (code === "no-speech") {
    return "Non ho sentito nulla — parla più forte o avvicinati al microfono e riprova.";
  }
  if (code === "network") {
    return "Serve la connessione internet per la dettatura. Controlla la rete e riprova.";
  }
  if (code === "aborted") {
    return "";
  }
  return "Dettatura interrotta. Riprova.";
}

export type AvviaDettaturaOpts = {
  onTesto: (testoDettato: string) => void;
  onStato: (s: StatoDettatura) => void;
  onAvviso: (msg: string) => void;
};

/** Avvia dettatura; ritorna false se il browser non la supporta. */
export function avviaDettatura(opts: AvviaDettaturaOpts): boolean {
  const SR = speechRecognitionCtor();
  const nonDisp = avvisoDettaturaNonDisponibile();
  if (!SR || nonDisp) {
    opts.onAvviso(nonDisp || "Dettatura non disponibile su questo browser.");
    opts.onStato("errore");
    return false;
  }

  const rec = new SR();
  rec.lang = "it-IT";
  rec.interimResults = false;
  rec.onresult = (e) => {
    const t = e.results?.[0]?.[0]?.transcript?.trim() || "";
    if (t) opts.onTesto(t);
  };
  rec.onend = () => opts.onStato("idle");
  rec.onerror = (e) => {
    const msg = messaggioErrore(e.error || "");
    if (msg) opts.onAvviso(msg);
    opts.onStato("errore");
  };
  opts.onAvviso("");
  opts.onStato("ascolta");
  try {
    rec.start();
  } catch {
    opts.onAvviso("Non riesco ad avviare il microfono. Riprova tra un secondo.");
    opts.onStato("errore");
    return false;
  }
  return true;
}
