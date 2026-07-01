import type { Tipo } from "./format";

// Catalogo CONFIG-DRIVEN dei moduli di controllo del pannello, per area.
// Aggiungere un modulo = aggiungere un oggetto qui (niente JSX).
// - stato "live": tutti i KPI arrivano da dati reali già collegati.
// - stato "parziale": alcuni KPI sono reali, il resto si accende collegando la fonte.
// - stato "placeholder": ancora tutto da collegare (mostra cosa conterrà + la fonte).
// I KPI "live"/"parziale" leggono chiavi già esposte da /api/metriche.

export type AreaModulo = "persone" | "operazioni" | "mondo";
export type ModuloKpi = { label: string; chiave?: string; tipo?: Tipo };
export type RigaLista = { titolo: string; sottotitolo?: string; meta?: string; colore?: "verde" | "giallo" | "rosso" };
export type ModuloDef = {
  area: AreaModulo;
  gruppo?: string;
  emoji: string;
  titolo: string;
  descrizione: string;
  fonte: string;
  stato: "live" | "parziale" | "placeholder";
  kpis?: ModuloKpi[];
  lista?: string; // endpoint che torna { collegato, righe: RigaLista[] } — elenco reale
  punti?: string[];
  apertaDefault?: boolean;
};

export const MODULI: ModuloDef[] = [
  // ===================== 🤝 PERSONE =====================
  {
    area: "persone", gruppo: "Chi compra e chi vende", emoji: "🏪", titolo: "Negozi & venditori",
    descrizione: "Le botteghe sulla piattaforma: quante attive, nuove entrate, e la loro salute.",
    fonte: "marketplace", stato: "live", lista: "/api/marketplace/lista?tipo=negozi",
    kpis: [
      { label: "Negozi attivi", chiave: "negozi", tipo: "n" },
      { label: "Nuovi (7g)", chiave: "nuovi_negozi_7g", tipo: "n" },
      { label: "Nuovi (30g)", chiave: "nuovi_negozi_30g", tipo: "n" },
    ],
    punti: ["Health score, churn e payout per negozio: in arrivo"],
  },
  {
    area: "persone", gruppo: "Chi compra e chi vende", emoji: "🧑", titolo: "Clienti",
    descrizione: "La base clienti: totali, attivi, nuovi e chi si sta addormentando.",
    fonte: "marketplace", stato: "live", lista: "/api/marketplace/lista?tipo=clienti",
    kpis: [
      { label: "Clienti totali", chiave: "clienti", tipo: "n" },
      { label: "Attivi (7g)", chiave: "clienti_attivi_7g", tipo: "n" },
      { label: "Nuovi (30g)", chiave: "nuovi_clienti_30g", tipo: "n" },
      { label: "Dormienti", chiave: "clienti_dormienti", tipo: "n" },
    ],
    punti: ["Segmenti, VIP (top spender) e storico per cliente: in arrivo"],
  },
  {
    area: "persone", gruppo: "Chi consegna e chi lavora", emoji: "🚴", titolo: "Rider & flotta",
    descrizione: "Chi consegna, copertura turni e costo per consegna.",
    fonte: "flotta rider / dispatch", stato: "placeholder",
    punti: ["Rider attivi e turni coperti", "Ordini per rider e costo/consegna", "Zone scoperte nei picchi"],
  },
  {
    area: "persone", gruppo: "Chi consegna e chi lavora", emoji: "👥", titolo: "Squadra (i senior AD)",
    descrizione: "I tuoi reparti digitali: ogni senior ha un ruolo e possiede un KPI. Chiamali dall'Assistente (es. «legale, scrivimi il contratto»).",
    fonte: "organigramma AD", stato: "live",
    punti: [
      "🤝 vendite — nuovi negozi · 📇 account-negozi — retention negozi",
      "📣 marketing — acquisizione · 🚀 growth — esperimenti di ricavo",
      "🔁 crm-lifecycle — carrelli & win-back · ✍️ content-social — contenuti",
      "🎨 designer — grafiche/QR · 📰 pr-stampa — stampa · 🏛️ relazioni-istituzionali — Comune/bandi",
      "🔎 intelligence — concorrenti/trend · 📊 analista — KPI",
      "💶 finanza — incassi/payout · ⚖️ legale-privacy — contratti/GDPR · 🔒 security — sicurezza",
      "🛵 operations — consegne · 🚲 rider-fleet — flotta · 🎧 supporto · 🤗 customer-success",
      "🛠️ tech — codice sito · 🧰 builder-automazioni — automazioni · ✅ qa — verifiche",
    ],
  },
  {
    area: "persone", gruppo: "Relazioni esterne", emoji: "📇", titolo: "Contatti & relazioni",
    descrizione: "La rubrica di chi conta fuori: enti, stampa, creator, fornitori.",
    fonte: "CRM relazioni", stato: "placeholder",
    punti: ["Comune, Vita in Centro, Camera di Commercio", "Giornalisti e influencer locali", "Fornitori: Stripe, Resend, hosting, tipografia"],
  },
  {
    area: "persone", gruppo: "Relazioni esterne", emoji: "🎯", titolo: "Lead & pipeline negozi",
    descrizione: "Le botteghe da acquisire e a che punto è la trattativa.",
    fonte: "vendite / CRM", stato: "placeholder",
    punti: ["Lista botteghe da contattare", "Stato trattativa (contattato → LIVE)", "Pitch e prossima azione"],
  },

  // ===================== ⚙️ OPERAZIONI =====================
  {
    area: "operazioni", gruppo: "In tempo reale", emoji: "🧾", titolo: "Ordini live",
    descrizione: "Gli ordini di oggi e quelli in corso adesso.",
    fonte: "marketplace", stato: "live", lista: "/api/marketplace/lista?tipo=ordini",
    kpis: [
      { label: "Ordini oggi", chiave: "ordini_oggi", tipo: "n" },
      { label: "Ordini (7g)", chiave: "ordini_7g", tipo: "n" },
      { label: "In corso", chiave: "consegne_in_corso", tipo: "n" },
      { label: "Annullati oggi", chiave: "annullati_oggi", tipo: "n" },
    ],
  },
  {
    area: "operazioni", gruppo: "In tempo reale", emoji: "🛵", titolo: "Consegne",
    descrizione: "Stato delle consegne: in corso, completate, tempi e problemi.",
    fonte: "marketplace + tracking", stato: "live", lista: "/api/marketplace/lista?tipo=consegne",
    kpis: [
      { label: "In corso", chiave: "consegne_in_corso", tipo: "n" },
      { label: "Completate oggi", chiave: "consegne_oggi", tipo: "n" },
      { label: "Tempo medio", chiave: "tempo_consegna_min", tipo: "durata" },
      { label: "Con problemi", chiave: "problemi", tipo: "n" },
    ],
    punti: ["Puntualità %, ritardi e mappa giri (col tracking rider): in arrivo"],
  },
  {
    area: "operazioni", gruppo: "Offerta & lavoro", emoji: "📦", titolo: "Catalogo & prodotti",
    descrizione: "Cosa è in vendita: prodotti, esauriti, categorie da coprire.",
    fonte: "catalogo", stato: "placeholder",
    punti: ["Prodotti a catalogo e esauriti", "Categorie mancanti nel cluster", "Schede da migliorare (SEO/foto)"],
  },
  {
    area: "operazioni", gruppo: "Offerta & lavoro", emoji: "📣", titolo: "Campagne",
    descrizione: "Le iniziative di marketing in corso e il calendario contenuti.",
    fonte: "marketing", stato: "placeholder",
    punti: ["Campagne attive (ads/social/CRM)", "Calendario editoriale della settimana", "Stato e risultati per campagna"],
  },
  {
    area: "operazioni", gruppo: "Offerta & lavoro", emoji: "✅", titolo: "Task & progetti",
    descrizione: "I lavori che l'AD e la squadra stanno eseguendo.",
    fonte: "memoria (lavori)", stato: "parziale",
    punti: ["Lavori del cervello (in corso/fatti)", "Task aperti per reparto", "Vai all'Assistente per assegnarne di nuovi"],
  },
  {
    area: "operazioni", gruppo: "Tempo & agenda", emoji: "📅", titolo: "Calendario & eventi",
    descrizione: "Cosa succede in città e in azienda che impatta gli ordini.",
    fonte: "Google Calendar / meteo / eventi città", stato: "placeholder",
    punti: ["Eventi e mercati a Piacenza", "Meteo (impatta le consegne)", "Scadenze interne e lanci"],
  },

  // ===================== 🌍 MONDO & RISCHI =====================
  {
    area: "mondo", gruppo: "Il mondo fuori", emoji: "🔎", titolo: "Mercato & concorrenti",
    descrizione: "Chi sono i concorrenti e come si muovono.",
    fonte: "intelligence", stato: "placeholder",
    punti: ["Concorrenti monitorati e prezzi", "Quota di mercato stimata", "Mosse e novità rilevate"],
  },
  {
    area: "mondo", gruppo: "Il mondo fuori", emoji: "🗞️", titolo: "News & rassegna stampa",
    descrizione: "Cosa si dice di noi e della città.",
    fonte: "PR / rassegna", stato: "placeholder",
    punti: ["Uscite stampa e menzioni", "Notizie locali rilevanti", "Reach earned"],
  },
  {
    area: "mondo", gruppo: "Reputazione & clienti", emoji: "⭐", titolo: "Reputazione",
    descrizione: "Come ci vedono: recensioni e sentiment.",
    fonte: "recensioni marketplace + social", stato: "live", lista: "/api/marketplace/lista?tipo=recensioni",
    kpis: [
      { label: "Recensione media", chiave: "recensione_media", tipo: "stelle" },
      { label: "Recensioni totali", chiave: "recensioni_totali", tipo: "n" },
    ],
    punti: ["Menzioni e sentiment social: in arrivo"],
  },
  {
    area: "mondo", gruppo: "Reputazione & clienti", emoji: "🎧", titolo: "Reclami & dispute",
    descrizione: "Problemi aperti con clienti e pagamenti.",
    fonte: "supporto + Stripe", stato: "parziale",
    kpis: [{ label: "Ordini con problemi", chiave: "problemi", tipo: "n" }],
    punti: ["Reclami aperti e tempo di risposta", "Chargeback / dispute Stripe"],
  },
  {
    area: "mondo", gruppo: "Protezione", emoji: "🛠️", titolo: "Codice del sito (mycity)",
    descrizione: "Il repo GitHub del marketplace: analisi, radiografia e audit del codice.",
    fonte: "GitHub NicolaeRotaru/mycity", stato: "live", lista: "/api/marketplace/codice?azione=lista",
    punti: [
      "Elenco file via /api/marketplace/codice?azione=lista",
      "Lettura file via /api/marketplace/codice?path=…",
      "Stato collegamento in /api/diagnosi → «Codice marketplace (GitHub)»",
    ],
  },
  {
    area: "mondo", gruppo: "Protezione", emoji: "🛡️", titolo: "Sicurezza & accessi",
    descrizione: "Chi può vedere cosa e lo stato di sicurezza.",
    fonte: "security / Supabase", stato: "placeholder",
    punti: ["Accessi e chiavi (chi ha cosa)", "RLS e incidenti di sicurezza", "Frodi bloccate / account sospesi"],
  },
  {
    area: "mondo", gruppo: "Protezione", emoji: "⚖️", titolo: "Legale & documenti",
    descrizione: "Contratti, privacy e scadenze.",
    fonte: "legale-privacy", stato: "placeholder",
    punti: ["Contratti firmati / negozi senza contratto", "Consensi GDPR e HACCP", "Scadenze documenti"],
  },
  {
    area: "mondo", gruppo: "Futuro", emoji: "🧪", titolo: "Esperimenti",
    descrizione: "Le scommesse di crescita in corso e i risultati.",
    fonte: "growth", stato: "placeholder",
    punti: ["Esperimenti attivi (pricing, upsell, fee)", "Uplift di ricavo per esperimento", "Prossimi test"],
  },
  {
    area: "mondo", gruppo: "Futuro", emoji: "🗺️", titolo: "Roadmap & idee",
    descrizione: "Cosa costruire dopo e il magazzino delle idee.",
    fonte: "product", stato: "placeholder",
    punti: ["Roadmap del sito/app", "Idee da valutare (backlog)", "Priorità per impatto sulla North Star"],
  },
];
