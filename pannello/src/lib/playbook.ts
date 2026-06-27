import { creaLavoro, getImpostazione, setImpostazione, memoryConnected } from "@/lib/store";

// 🗡️ I PLAYBOOK dell'arsenale: le leve "dietro le quinte" come lavori ricorrenti.
// Parte deterministica = GRATIS (decidere COSA fare e accodarlo). La scrittura vera
// (copy, analisi) la fa poi il cervello (Max gratis quando fai il giro, o l'API a contagocce).
// Ogni playbook ha: la leva, la cadenza, e il "compito" che accoda al cervello.
export type Playbook = {
  id: string;
  leva: string;
  emoji: string;
  titolo: string;
  descrizione: string;
  cadenza: "giornaliero" | "settimanale";
  livello: "verde" | "giallo" | "rosso";
  compito: string; // istruzione esatta per il cervello quando è il momento
};

export const PLAYBOOKS: Playbook[] = [
  {
    id: "recupero-carrelli", leva: "Clienti", emoji: "🛒", titolo: "Recupero carrelli abbandonati",
    descrizione: "Ogni giorno: chi ha lasciato il carrello → promemoria con codice sconto.",
    cadenza: "giornaliero", livello: "giallo",
    compito: "PLAYBOOK Recupero carrelli: leggi i carrelli abbandonati reali, prepara l'email di recupero (oggetto + corpo + codice) e accodala in AZIONI-PRONTE per ogni cliente con carrello fermo. Niente invii: solo bozze pronte.",
  },
  {
    id: "contenuto-giorno", leva: "Notorietà", emoji: "✍️", titolo: "Contenuto del giorno",
    descrizione: "Ogni giorno: un post/storia pronto sui canali locali, modellato sui vincenti.",
    cadenza: "giornaliero", livello: "rosso",
    compito: "PLAYBOOK Contenuto del giorno: produci 1 post pronto (testo + idea visual) per i canali locali, sullo stile dei vincenti del swipe file, e accodalo in AZIONI-PRONTE (🔴 pubblicazione, da firmare).",
  },
  {
    id: "recensioni", leva: "Reputazione", emoji: "⭐", titolo: "Caccia recensioni",
    descrizione: "Ogni giorno: dopo le consegne buone, chiedi la recensione al momento giusto.",
    cadenza: "giornaliero", livello: "giallo",
    compito: "PLAYBOOK Recensioni: individua le consegne completate senza recensione e prepara il messaggio post-consegna (grazie + richiesta recensione). Accoda in AZIONI-PRONTE.",
  },
  {
    id: "negozi-calo", leva: "Negozi", emoji: "📉", titolo: "Negozi in calo (anti-churn)",
    descrizione: "Ogni giorno: individua le botteghe che rallentano e prepara la riattivazione.",
    cadenza: "giornaliero", livello: "giallo",
    compito: "PLAYBOOK Anti-churn negozi: trova i negozi con ordini in calo e prepara il check-in/azione di riattivazione per ciascuno. Accoda in AZIONI-PRONTE.",
  },
  {
    id: "scout-negozi", leva: "Negozi", emoji: "🏪", titolo: "Scout nuovi negozi",
    descrizione: "Ogni settimana: 3 botteghe-target per categoria mancante + pitch pronto.",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Scout negozi: proponi 3 botteghe-target di Piacenza per le categorie mancanti nel cluster, con il pitch di onboarding pronto. Accoda in AZIONI-PRONTE.",
  },
  {
    id: "bandi-comune", leva: "Istituzioni", emoji: "🏛️", titolo: "Bandi & Comune",
    descrizione: "Ogni settimana: controlla bandi aperti e relazioni istituzionali da coltivare.",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Istituzioni: verifica bandi locali aperti (rimborsi materiali/digitale) e prepara la mail/azione verso Comune o associazioni. Accoda in AZIONI-PRONTE.",
  },
  {
    id: "stampa", leva: "Stampa", emoji: "📰", titolo: "Earned media",
    descrizione: "Ogni settimana: un angolo notiziabile + contatto giornalisti locali.",
    cadenza: "settimanale", livello: "rosso",
    compito: "PLAYBOOK Stampa: trova un angolo notiziabile della settimana e prepara comunicato + lista giornalisti locali. Accoda in AZIONI-PRONTE (🔴 invio da firmare).",
  },
  {
    id: "intelligence", leva: "Mercato", emoji: "🔎", titolo: "Radar concorrenti & opportunità",
    descrizione: "Ogni settimana: mosse dei concorrenti, eventi/meteo, 2-3 opportunità azionabili.",
    cadenza: "settimanale", livello: "verde",
    compito: "PLAYBOOK Intelligence: raccogli mosse dei concorrenti + eventi/meteo della settimana a Piacenza e proponi 2-3 opportunità azionabili con fonte. Scrivi in memoria (Intelligence).",
  },
  {
    id: "win-back", leva: "Clienti", emoji: "🔁", titolo: "Win-back dormienti",
    descrizione: "Ogni settimana: riattiva i clienti che non ordinano da un po'.",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Win-back: individua i clienti dormienti e prepara l'email di riattivazione (con incentivo entro budget). Accoda in AZIONI-PRONTE.",
  },
];

// Quali playbook vanno eseguiti oggi: i giornalieri sempre, i settimanali di lunedì.
export function playbookDaEseguire(giornoSettimana: number): Playbook[] {
  return PLAYBOOKS.filter((p) => p.cadenza === "giornaliero" || giornoSettimana === 1);
}

function oggiRoma(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date()); // AAAA-MM-GG
}
function giornoSettimanaRoma(): number {
  const g = new Date().toLocaleDateString("en-US", { timeZone: "Europe/Rome", weekday: "short" });
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g);
}

// GRATIS: accoda al cervello i playbook "dovuti" oggi, una sola volta al giorno (dedup).
export async function accodaPlaybookDelGiorno(): Promise<number> {
  if (!memoryConnected()) return 0;
  const oggi = oggiRoma();
  const due = playbookDaEseguire(giornoSettimanaRoma());
  let n = 0;
  for (const p of due) {
    const k = `pb:${p.id}:${oggi}`;
    if (await getImpostazione(k)) continue; // già accodato oggi
    const l = await creaLavoro(p.compito, "playbook").catch(() => null);
    if (!l) continue; // creazione fallita → riprova al prossimo giro (niente stato falso)
    const ora = new Date().toISOString();
    await setImpostazione(k, ora).catch(() => {}); // dedup giornaliero
    await setImpostazione(`pb:${p.id}:ultimo`, ora).catch(() => {}); // ultimo accodamento (qualsiasi giorno)
    n++;
  }
  return n;
}

// Stato per la Cabina: per ogni playbook l'ULTIMO accodamento reale (qualsiasi giorno)
// e se è di oggi. Così i settimanali non sembrano "in attesa" da martedì a domenica.
export async function statoPlaybook(): Promise<{ id: string; ultimo: string | null; oggi: boolean }[]> {
  const oggi = oggiRoma();
  const out: { id: string; ultimo: string | null; oggi: boolean }[] = [];
  for (const p of PLAYBOOKS) {
    const ultimo = await getImpostazione(`pb:${p.id}:ultimo`).catch(() => null);
    const eraOggi = ultimo
      ? new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date(ultimo)) === oggi
      : false;
    out.push({ id: p.id, ultimo, oggi: eraOggi });
  }
  return out;
}
