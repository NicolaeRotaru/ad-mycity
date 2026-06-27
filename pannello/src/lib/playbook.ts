import { creaLavoro, getImpostazione, setImpostazione, memoryConnected } from "@/lib/store";

// 🗡️ I PLAYBOOK dell'arsenale: le leve "dietro le quinte" come lavori ricorrenti.
// Parte deterministica = GRATIS (decidere COSA fare e accodarlo). La scrittura vera
// (copy, analisi) la fa poi il cervello (Max gratis quando fai il giro, o l'API a contagocce).
// Ogni playbook ha: la leva, la cadenza, e il "compito" che accoda al cervello.
export type Playbook = {
  id: string;
  forma: string; // la FORMA DI DOMINIO che serve (le 9 dell'arsenale forte)
  leva: string;
  emoji: string;
  titolo: string;
  descrizione: string;
  cadenza: "giornaliero" | "settimanale";
  livello: "verde" | "giallo" | "rosso";
  compito: string; // istruzione esatta per il cervello quando è il momento
};

// Almeno un playbook per OGNI forma di dominio (arsenale forte):
// Domanda · Offerta · Denaro · Dati · Strade · Racconto · Istituzioni · Standard · Fossato.
export const PLAYBOOKS: Playbook[] = [
  // ── A · POSSEDERE LA DOMANDA ──
  {
    id: "seo-domanda", forma: "Possedere la domanda", leva: "SEO locale", emoji: "🧭", titolo: "Essere il riflesso (SEO locale)",
    descrizione: "Intercetta le ricerche 'dove compro X a Piacenza' prima dei colossi.",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK SEO locale: trova 3-5 ricerche locali ad alto intento ('dove comprare X a Piacenza') e prepara/ottimizza pagine negozio/categoria per intercettarle (title, meta, schema.org, Google Business). Accoda in AZIONI-PRONTE.",
  },
  {
    id: "win-back", forma: "Possedere la domanda", leva: "Clienti", emoji: "🔁", titolo: "Win-back dormienti",
    descrizione: "Riattiva i clienti che non ordinano da un po'.",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Win-back: individua i clienti dormienti e prepara l'email di riattivazione (con incentivo entro budget). Accoda in AZIONI-PRONTE.",
  },
  // ── B · POSSEDERE L'OFFERTA (lock-in negozi) ──
  {
    id: "scout-negozi", forma: "Possedere l'offerta", leva: "Negozi", emoji: "🏪", titolo: "Scout nuovi negozi",
    descrizione: "3 botteghe-target per categoria mancante + pitch pronto.",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Scout negozi: proponi 3 botteghe-target di Piacenza per le categorie mancanti nel cluster, con il pitch di onboarding pronto. Accoda in AZIONI-PRONTE.",
  },
  {
    id: "negozi-calo", forma: "Possedere l'offerta", leva: "Negozi", emoji: "📉", titolo: "Negozi in calo (anti-churn)",
    descrizione: "Ogni giorno: individua le botteghe che rallentano e prepara la riattivazione.",
    cadenza: "giornaliero", livello: "giallo",
    compito: "PLAYBOOK Anti-churn negozi: trova i negozi con ordini in calo e prepara il check-in/azione di riattivazione per ciascuno. Accoda in AZIONI-PRONTE.",
  },
  // ── C · POSSEDERE IL DENARO ──
  {
    id: "recupero-carrelli", forma: "Possedere il denaro", leva: "Clienti", emoji: "🛒", titolo: "Recupero carrelli abbandonati",
    descrizione: "Ogni giorno: chi ha lasciato il carrello → promemoria con codice sconto.",
    cadenza: "giornaliero", livello: "giallo",
    compito: "PLAYBOOK Recupero carrelli: leggi i carrelli abbandonati reali, prepara l'email di recupero (oggetto + corpo + codice) e accodala in AZIONI-PRONTE per ogni cliente con carrello fermo. Niente invii: solo bozze pronte.",
  },
  {
    id: "fedelta-rete", forma: "Possedere il denaro", leva: "Fedeltà & gift card", emoji: "🎟️", titolo: "Fedeltà & gift card di rete",
    descrizione: "Punti spendibili in TUTTA la rete + gift card (cassa anticipata, lega il cliente alla rete).",
    cadenza: "settimanale", livello: "rosso",
    compito: "PLAYBOOK Fedeltà di rete: proponi/aggiorna il programma punti spendibili in tutta la rete e le gift card MyCity (incasso anticipato). Prepara meccanica + comunicazione. Accoda in AZIONI-PRONTE (🔴 tocca i soldi: firma).",
  },
  // ── D · POSSEDERE I DATI ──
  {
    id: "dati-negozi", forma: "Possedere i dati", leva: "Intelligenza ai negozi", emoji: "📊", titolo: "Report-dati ai negozi",
    descrizione: "L'insight che solo MyCity vede, consegnato/venduto ai negozi (dipendenza + entrata).",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Dati-come-servizio: per i negozi attivi prepara un mini-report con gli insight che solo MyCity ha (cosa vendono di più, quando, clienti di ritorno) da consegnare/vendere. Accoda in AZIONI-PRONTE.",
  },
  // ── E · POSSEDERE LE STRADE (capillarità fisica) ──
  {
    id: "capillarita", forma: "Possedere le strade", leva: "Capillarità fisica", emoji: "📍", titolo: "Capillarità fisica (QR/vetrofanie)",
    descrizione: "Ogni vetrina aderente diventa un cartello MyCity: QR, vetrofanie, sacchetti.",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Capillarità: per i nuovi negozi aderenti prepara il kit fisico (QR vetrina, vetrofania, sacchetti brandizzati) + i punti di presenza in città. Accoda in AZIONI-PRONTE (produzione 🟢 / stampa 🔴).",
  },
  // ── F · POSSEDERE IL RACCONTO (brand civico) ──
  {
    id: "contenuto-giorno", forma: "Possedere il racconto", leva: "Notorietà", emoji: "✍️", titolo: "Contenuto del giorno",
    descrizione: "Ogni giorno: un post/storia pronto sui canali locali, modellato sui vincenti.",
    cadenza: "giornaliero", livello: "rosso",
    compito: "PLAYBOOK Contenuto del giorno: produci 1 post pronto (testo + idea visual) per i canali locali, sullo stile dei vincenti del swipe file, e accodalo in AZIONI-PRONTE (🔴 pubblicazione, da firmare).",
  },
  {
    id: "recensioni", forma: "Possedere il racconto", leva: "Reputazione", emoji: "⭐", titolo: "Caccia recensioni",
    descrizione: "Ogni giorno: dopo le consegne buone, chiedi la recensione al momento giusto.",
    cadenza: "giornaliero", livello: "giallo",
    compito: "PLAYBOOK Recensioni: individua le consegne completate senza recensione e prepara il messaggio post-consegna (grazie + richiesta recensione). Accoda in AZIONI-PRONTE.",
  },
  {
    id: "stampa", forma: "Possedere il racconto", leva: "Stampa", emoji: "📰", titolo: "Earned media",
    descrizione: "Un angolo notiziabile + contatto giornalisti locali.",
    cadenza: "settimanale", livello: "rosso",
    compito: "PLAYBOOK Stampa: trova un angolo notiziabile della settimana e prepara comunicato + lista giornalisti locali. Accoda in AZIONI-PRONTE (🔴 invio da firmare).",
  },
  // ── G · POSSEDERE LE ISTITUZIONI ──
  {
    id: "bandi-comune", forma: "Possedere le istituzioni", leva: "Istituzioni", emoji: "🏛️", titolo: "Bandi & Comune",
    descrizione: "Bandi aperti + relazioni istituzionali da coltivare (Comune, associazioni).",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Istituzioni: verifica bandi locali aperti (rimborsi materiali/digitale) e prepara la mail/azione verso Comune o associazioni. Accoda in AZIONI-PRONTE.",
  },
  // ── H · DIVENTARE LO STANDARD ──
  {
    id: "badge-verificato", forma: "Diventare lo standard", leva: "Standard locale", emoji: "✅", titolo: "Badge «Negozio Verificato MyCity»",
    descrizione: "Il marchio di fiducia del commercio piacentino: tutti lo vogliono, tu fai le regole.",
    cadenza: "settimanale", livello: "giallo",
    compito: "PLAYBOOK Standard: definisci/assegna il badge «Negozio Verificato MyCity» (criteri di fiducia) ai negozi idonei e prepara la comunicazione che lo rende lo standard cittadino. Accoda in AZIONI-PRONTE.",
  },
  // ── I · COSTRUIRE IL FOSSATO & EFFETTO-RETE ──
  {
    id: "intelligence", forma: "Fossato & effetto-rete", leva: "Mercato", emoji: "🔎", titolo: "Radar concorrenti & opportunità",
    descrizione: "Mosse dei concorrenti, eventi/meteo, 2-3 opportunità azionabili.",
    cadenza: "settimanale", livello: "verde",
    compito: "PLAYBOOK Intelligence: raccogli mosse dei concorrenti + eventi/meteo della settimana a Piacenza e proponi 2-3 opportunità azionabili con fonte. Scrivi in memoria (Intelligence).",
  },
  {
    id: "referral-volano", forma: "Fossato & effetto-rete", leva: "Referral", emoji: "🌀", titolo: "Referral & volano",
    descrizione: "'Porta un amico' give-get: i clienti portano clienti, il volano si avvita.",
    cadenza: "settimanale", livello: "rosso",
    compito: "PLAYBOOK Referral: aziona il loop 'porta un amico' (give-get, es. 5€+5€) con anti-frode e prepara i messaggi. Accoda in AZIONI-PRONTE (🔴 incentivo: firma).",
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
