// Menù comandi dell'AD — allineato a COMANDI.md alla radice del repo.
// Quando aggiungi un comando lì, aggiorna anche questo file.

export type Comando = { cmd: string; desc: string; evidenzia?: boolean; punti?: string[] };
export type Reparto = { nome: string; comandi: Comando[] };

export const REPARTI_COMANDI: Reparto[] = [
  {
    nome: "📅 Ogni giorno (ritmo)",
    comandi: [
      { cmd: "fai un giro", desc: "Guardo i dati reali, controllo le sentinelle, ti do un briefing." },
      { cmd: "piano del mattino", desc: "Priorità del giorno + una mossa per reparto." },
      { cmd: "report della sera", desc: "Cosa è stato fatto + numeri + cosa c'è da firmare." },
      { cmd: "review della settimana", desc: "Pagella della squadra + cosa migliorare." },
    ],
  },
  {
    nome: "📊 Numeri & soldi",
    comandi: [
      { cmd: "come stiamo?", desc: "Cruscotto: i numeri reali adesso." },
      { cmd: "report KPI", desc: "L'analista ti fa il quadro della settimana." },
      { cmd: "controlla i pagamenti", desc: "La finanza cerca anomalie e payout." },
      { cmd: "proiezione", desc: "Quanto costa e quanto rende." },
    ],
  },
  {
    nome: "🏪 Negozi",
    comandi: [
      { cmd: "porta [nome] LIVE", desc: "La squadra prepara tutto per metterlo online." },
      { cmd: "trovami negozi", desc: "Lista di botteghe da contattare + pitch pronto." },
      { cmd: "negozio in calo", desc: "Piano per recuperare un negozio che vende meno." },
      { cmd: "sblocca Garetti", desc: "Lista esatta dei passi per il primo negozio go-live." },
    ],
  },
  {
    nome: "🚀 Crescita & contenuti",
    comandi: [
      {
        cmd: "contenuti pro: [quali]",
        desc: "Pipeline Modalità Mondiale: brief → varianti → critica → produzione → QA → accodo pubblicazioni.",
        evidenzia: true,
      },
      { cmd: "modalità mondiale", desc: "Alias di «contenuti pro» — livello agenzia internazionale." },
      { cmd: "lancia una campagna [tema]", desc: "Piano completo (post, grafiche, budget) da approvare." },
      { cmd: "contenuti della settimana", desc: "Calendario + post + reel pronti." },
      { cmd: "fammi [post / volantino / QR] per [X]", desc: "Il designer/AI te lo crea." },
      { cmd: "recupera i carrelli", desc: "La CRM prepara i messaggi per riattivare i clienti." },
      { cmd: "riattiva i clienti", desc: "Win-back e clienti dormienti — messaggi pronti da firmare." },
    ],
  },
  {
    nome: "🛒 Il sito",
    comandi: [
      { cmd: "collega il marketplace", desc: "Scarico/aggiorno la copia locale del codice mycity per analizzarlo." },
      { cmd: "cambia il sito: [cosa]", desc: "Config subito, oppure codice con anteprima + tuo ok." },
      { cmd: "audit del marketplace", desc: "Check tecnico rapido: bug, rischi, frizioni principali." },
      {
        cmd: "radiografia",
        desc: "Analisi profonda di TUTTO il marketplace (13 dimensioni, ogni problema verificato).",
        evidenzia: true,
      },
      { cmd: "analizza tutto il sito", desc: "Alias di «radiografia»." },
      { cmd: "trova tutti i bug", desc: "Alias di «radiografia»." },
    ],
  },
  {
    nome: "🎨 Design & grafica",
    comandi: [
      {
        cmd: "radiografia del design",
        desc: "Analisi completa di tutto ciò che si vede: 24 punti visivi/UX, report per gravità.",
        evidenzia: true,
        punti: [
          "Aspetto visivo — Colori · Font · Spazi · Allineamento · Immagini · Icone · Coerenza",
          "Disposizione — Layout · Gerarchia · Responsive mobile",
          "Esperienza — Navigazione · CTA · Frizioni · Microcopy · Stati · Feedback",
          "Soldi — Home · Prodotto · Ricerca · Carrello · Checkout · Negozio",
          "Invisibile — Accessibilità · Velocità percepita",
        ],
      },
      { cmd: "audit completo del design", desc: "Alias di «radiografia del design»." },
      { cmd: "design: [richiesta]", desc: "Analisi grafica/UX oppure modifica (config subito, layout con anteprima)." },
      { cmd: "lavora sul design", desc: "Alias di «design: …»." },
      { cmd: "sistema [il punto]", desc: "Dopo la radiografia: correggo una cosa specifica (es. colori home)." },
    ],
  },
  {
    nome: "🧠 La macchina",
    comandi: [
      {
        cmd: "radiografia di te stesso",
        desc: "L'AD analizza sé stessa (agenti, prompt, sensori, memoria) su 12 dimensioni.",
        evidenzia: true,
      },
      { cmd: "analizzati da cima a fondo", desc: "Alias di «radiografia di te stesso»." },
      { cmd: "fatti la radiografia", desc: "Alias di «radiografia di te stesso»." },
    ],
  },
  {
    nome: "🔎 Mercato",
    comandi: [
      { cmd: "cosa fanno i concorrenti?", desc: "Intelligence sul mondo esterno." },
      { cmd: "che opportunità ci sono?", desc: "Intelligence + growth: eventi, meteo, bandi." },
    ],
  },
  {
    nome: "👥 La squadra",
    comandi: [
      { cmd: "[reparto], fai [X]", desc: "Delego a quel senior (es. «legale, scrivimi il contratto»)." },
      { cmd: "riunione su [obiettivo]", desc: "Faccio collaborare più reparti a catena." },
      { cmd: "crea un nuovo esperto di [X]", desc: "Aggiungo un nuovo senior alla squadra." },
      { cmd: "migliora [reparto]", desc: "Il prompt-engineer affina il mansionario." },
    ],
  },
  {
    nome: "⚡ Decisioni & azioni",
    comandi: [
      { cmd: "cosa devo decidere?", desc: "Ti mostro la coda delle cose da firmare." },
      { cmd: "ok [numero]", desc: "Eseguo l'azione approvata." },
      { cmd: "approva [azione]", desc: "Alias di «ok [numero]»." },
      { cmd: "collega [Telegram / Gemini / …]", desc: "Ti guido a collegare una «mano»." },
      { cmd: "che comandi ho?", desc: "Ti rimostro questo menù." },
    ],
  },
];
