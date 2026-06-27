// Costruisce, per ogni azione "Da approvare", una SCHEDA leggibile che spiega a Nicola
// in parole semplici: chi ci lavora, con quali "mani", cosa cambia nel mondo reale e
// cosa succede dopo. Tutto derivato dai dati reali dell'azione (reparto, canale, colore):
// nessun numero o dettaglio inventato.

export type AzioneInput = {
  reparto: string;
  azione: string;
  canale: string;
  contenuto: string;
  livello: "verde" | "giallo" | "rosso" | "?";
};

export type RigaScheda = { ico: string; etichetta: string; testo: string };

// Identità dei senior: nome amichevole, mestiere in una riga, e cosa succede "se va bene".
// La chiave è il reparto (slug) che l'AD scrive nella coda.
const SENIOR: Record<string, { nome: string; ruolo: string; seguito: string }> = {
  vendite: { nome: "Vendite", ruolo: "porta e attiva i negozi sul marketplace", seguito: "il negozio accetta i termini e si va verso il go-live e il primo ordine" },
  finanza: { nome: "Finanza", ruolo: "gestisce incassi, payout ai negozi e margini", seguito: "il flusso pagamenti è pronto e il primo incasso può girare pulito" },
  "customer-success": { nome: "Customer Success", ruolo: "cura il cliente: primo ordine, feedback, recensioni", seguito: "il cliente vive un primo ordine curato e lascia una recensione (prova sociale)" },
  "crm-lifecycle": { nome: "CRM Lifecycle", ruolo: "recupera carrelli e riattiva i clienti dormienti", seguito: "i clienti tornano a ordinare e il giro ricomincia" },
  "content-social": { nome: "Content & Social", ruolo: "scrive e pubblica i contenuti (post, reel, copy)", seguito: "il contenuto esce sui canali e porta visite e iscritti alla lista" },
  marketing: { nome: "Marketing", ruolo: "porta clienti: campagne, SEO locale, acquisizione", seguito: "arriva traffico nuovo e altri iscritti/ordini" },
  "growth-monetizzazione": { nome: "Growth", ruolo: "lancia esperimenti per aumentare i ricavi", seguito: "si misura se la leva ha alzato scontrino o margine" },
  designer: { nome: "Designer", ruolo: "produce le grafiche (QR, locandine, social)", seguito: "il materiale è pronto da stampare o pubblicare" },
  "pr-stampa": { nome: "PR & Stampa", ruolo: "gestisce comunicati e giornalisti locali", seguito: "esce un articolo o una menzione: notorietà guadagnata, non pagata" },
  "relazioni-istituzionali": { nome: "Relazioni Istituzionali", ruolo: "tiene i rapporti con Comune, associazioni e bandi", seguito: "si apre una porta istituzionale (partnership, evento, bando)" },
  tech: { nome: "Tech", ruolo: "lavora sul codice del sito", seguito: "la modifica va in anteprima e, dopo il tuo ok, in produzione" },
  "frontend-dev": { nome: "Frontend", ruolo: "lavora sull'interfaccia del sito", seguito: "la schermata migliorata va in anteprima e poi live" },
  "backend-dev": { nome: "Backend", ruolo: "lavora su API, logica e database del sito", seguito: "la modifica va in anteprima e, dopo il tuo ok, in produzione" },
  "legale-privacy": { nome: "Legale & Privacy", ruolo: "prepara contratti, privacy e termini", seguito: "il documento è pronto per la firma o la validazione finale" },
  operations: { nome: "Operations", ruolo: "gestisce ordini, rider e consegne", seguito: "la consegna parte e arriva nei tempi" },
  intelligence: { nome: "Intelligence", ruolo: "studia concorrenti, trend e opportunità", seguito: "ottieni un'analisi che orienta la prossima mossa" },
  analista: { nome: "Analista", ruolo: "legge i numeri reali e i KPI", seguito: "ottieni i numeri su cui decidere senza tirare a indovinare" },
  "builder-automazioni": { nome: "Builder Automazioni", ruolo: "collega strumenti e automazioni (n8n, API, MCP)", seguito: "la «mano» resta collegata e le prossime azioni partono da sole" },
  security: { nome: "Security", ruolo: "verifica sicurezza, RLS e pagamenti", seguito: "il punto debole viene chiuso" },
  supporto: { nome: "Supporto", ruolo: "risponde a clienti e reclami", seguito: "il cliente riceve risposta e il problema si chiude" },
  qa: { nome: "QA", ruolo: "verifica che i flussi funzionino prima del live", seguito: "il flusso è validato e si può andare live in sicurezza" },
};

// Reparto può essere composito (es. "content-social→pr-stampa" o "vendite (proposta)"):
// prendi la prima parola-slug utile.
function repartoBase(r: string): string {
  const s = (r || "").toLowerCase().trim();
  const m = s.match(/[a-z]+(?:-[a-z]+)*/);
  return m ? m[0] : s;
}

// Pulisce il canale: se è solo un trattino/segnaposto vuoto, lo tratta come "non indicato".
// IMPORTANTE: non tocca i trattini DENTRO le parole (es. "go-live", "17-20").
export function canalePulito(canale: string): string {
  const c = (canale || "").trim();
  return /^[—–\-\s]*$/.test(c) ? "" : c;
}

// Dalle parole del canale ricava le "mani" reali (gli strumenti con cui si agisce).
function mani(canale: string): string {
  const c = canalePulito(canale).toLowerCase();
  const parti: string[] = [];
  if (/resend|e-?mail/.test(c)) parti.push("📧 Email (Resend)");
  if (/whatsapp|telefon/.test(c)) parti.push("📞 WhatsApp/telefono (a mano)");
  if (/\big\b|instagram|\bfb\b|facebook|social|grupp|storie?/.test(c)) parti.push("📱 Social (IG/FB, gruppi locali)");
  if (/persona/.test(c)) parti.push("🤝 Di persona");
  if (/\bn8n\b/.test(c)) parti.push("🔗 n8n (hub automazioni)");
  if (/stripe|payout|onboarding|incass/.test(c)) parti.push("💳 Stripe / pagamenti");
  if (/push|notif|in-?app/.test(c)) parti.push("🔔 Notifica in-app");
  if (/pr #|branch|deploy|merge|codice/.test(c)) parti.push("💻 Codice del sito (branch → anteprima)");
  if (/dm|email a pagine/.test(c) && !parti.some((p) => p.includes("Email"))) parti.push("✉️ DM/email a pagine locali");
  if (parti.length === 0) {
    if (/manuale/.test(c)) parti.push("✍️ A mano (per ora; poi automatizzabile)");
    else if (/decision|strateg/.test(c)) parti.push("🧭 Nessun invio: è una scelta strategica tua");
    else if (canalePulito(canale)) parti.push(canalePulito(canale));
    else parti.push("da definire al momento dell'esecuzione");
  }
  return parti.join(" · ");
}

// Cosa cambia nel mondo reale, secondo il colore (🟢🟡🔴).
function conseguenza(livello: AzioneInput["livello"]): string {
  if (livello === "rosso") return "tocca soldi, impegni o qualcosa di pubblico difficile da annullare — per questo aspetta la tua firma";
  if (livello === "giallo") return "cambia qualcosa nel mondo reale ma è recuperabile; subito dopo l'AD ti avvisa di cosa è partito";
  if (livello === "verde") return "è una mossa sicura e reversibile, nessun rischio";
  return "impatto da confermare: nel dubbio l'AD sale di livello e ti chiede";
}

// Costruisce le righe della scheda da mostrare dentro la card.
export function spiegaAzione(a: AzioneInput): RigaScheda[] {
  const base = repartoBase(a.reparto);
  const s = SENIOR[base] || { nome: a.reparto || "Un senior", ruolo: "esegue la mossa già preparata", seguito: "l'AD ti riferisce com'è andata" };
  const righe: RigaScheda[] = [
    { ico: "👤", etichetta: "Chi ci lavora", testo: `${s.nome} — ${s.ruolo}.` },
    { ico: "✋", etichetta: "Come agisce", testo: `${mani(a.canale)}.` },
    { ico: "⚙️", etichetta: "Appena approvi", testo: "l'AD mette l'azione in coda e il senior parte dal testo già pronto (qui sopra)." },
    { ico: "🎯", etichetta: "Cosa cambia", testo: `${conseguenza(a.livello)}.` },
    { ico: "➡️", etichetta: "Se va bene", testo: `${s.seguito}, e l'azione viene segnata ✅ FATTO con traccia nelle Decisioni.` },
    { ico: "🙋", etichetta: "Da sapere", testo: "le «mani» inviano davvero solo con il worker acceso e la chiave del canale collegata; altrimenti l'azione resta in coda o viene simulata — niente parte per sbaglio." },
  ];
  return righe;
}
