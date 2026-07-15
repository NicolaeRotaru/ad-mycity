// Le SENTINELLE: regole sui dati reali del marketplace che, quando scatta un
// segnale, generano DA SOLE una "azione pronta" (con testo già preparato) da
// mettere nella corsia operativa. È l'iniziativa autonoma dell'AD: non aspetta
// che qualcuno scriva la mossa, la prepara appena vede il problema/l'occasione.
//
// Restituiscono lo stesso "formato azione" del vault, così passano per la stessa
// UI e lo stesso percorso di approvazione/esecuzione. id stabile (S-xxx) → la
// decisione si ricorda finché il segnale resta attivo.

export type AzioneSentinella = {
  id: string;
  titolo: string;
  reparto: string;
  livello: "verde" | "giallo" | "rosso";
  canale: string;
  destinatario: string;
  perche: string;
  preparato: string;
  testo: string;
};

export function azioniDaSentinelle(m: Record<string, any> | null | undefined): AzioneSentinella[] {
  if (!m || !m.connected) return [];
  const n = (k: string) => Number(m[k] || 0);
  const out: AzioneSentinella[] = [];

  if (n("problemi") > 0) {
    out.push({
      id: "S-problemi",
      titolo: `🛵 Gestisci ${n("problemi")} consegne annullate`,
      reparto: "operations",
      livello: "rosso",
      canale: "telefono / messaggio ai clienti coinvolti",
      destinatario: "",
      perche: `Ci sono ${n("problemi")} ordini con consegna annullata: vanno chiariti subito per non perdere i clienti.`,
      preparato: "🛵 operations + 🎧 supporto",
      testo:
        "1) Contatta i clienti coinvolti e spiega cosa è successo. 2) Offri rimborso o riconsegna. 3) Annota la causa per non ripeterla.",
    });
  }

  const rec = n("recensione_media");
  if (rec > 0 && rec < 3.5) {
    out.push({
      id: "S-recensioni",
      titolo: `⭐ Recensioni sotto la media (${rec}/5)`,
      reparto: "supporto",
      livello: "rosso",
      canale: "interno + risposta pubblica alle recensioni",
      destinatario: "",
      perche: `La media voti è ${rec}/5 (sotto 3.5): rischio sulla reputazione, va affrontato ora.`,
      preparato: "🎧 supporto + ✅ qa",
      testo:
        "1) Leggi le ultime recensioni negative. 2) Rispondi in pubblico con garbo + soluzione. 3) Apri una mini-indagine sulla causa (consegna? prodotto? tempi?).",
    });
  }

  if (n("ordini_oggi") === 0) {
    out.push({
      id: "S-noordini",
      titolo: "📣 Nessun ordine oggi: dai una spinta",
      reparto: "marketing",
      livello: "giallo",
      canale: "post social + push ai clienti",
      destinatario: "",
      perche: "Oggi non è ancora arrivato nessun ordine: un nudge può sbloccare la giornata.",
      preparato: "📣 marketing + ✍️ copywriter",
      testo:
        "Post/push pronto: «Oggi i negozi di Piacenza ti aspettano 🛍️ Ordina entro le 19 e ricevi a casa in giornata.» (aggiungi 1 prodotto faro).",
    });
  }

  if (n("carrelli") >= 3) {
    out.push({
      id: "S-carrelli",
      titolo: `🛒 ${n("carrelli")} carrelli abbandonati da recuperare`,
      reparto: "crm-lifecycle",
      livello: "rosso",
      canale: "email ai clienti con carrello",
      destinatario: "",
      perche: `Ci sono ${n("carrelli")} carrelli non completati: un promemoria con codice recupera ordini quasi persi.`,
      preparato: "🔁 crm-lifecycle + ✍️ copywriter",
      testo:
        "Oggetto: Hai lasciato qualcosa nel carrello 🛍️\nCompleta entro stasera e usa TORNA5 per 5€ di sconto sopra i 25€.",
    });
  }

  if (n("clienti_dormienti") >= 5) {
    out.push({
      id: "S-dormienti",
      titolo: `😴 ${n("clienti_dormienti")} clienti dormienti: win-back`,
      reparto: "crm-lifecycle",
      livello: "rosso",
      canale: "email win-back",
      destinatario: "",
      perche: `${n("clienti_dormienti")} clienti non ordinano da oltre 30 giorni: una mossa mirata può riattivarli.`,
      preparato: "🔁 crm-lifecycle",
      testo:
        "Oggetto: Ci sei mancato 💛\nUn regalo per tornare: 10% sul prossimo ordine dai negozi di Piacenza. Valido 7 giorni.",
    });
  }

  if (n("consegne_in_corso") > 0 && n("tempo_consegna_min") > 90) {
    out.push({
      id: "S-consegne-lente",
      titolo: `⏱️ Consegne lente (${n("tempo_consegna_min")} min medi)`,
      reparto: "operations",
      livello: "giallo",
      canale: "interno (rider/dispatch)",
      destinatario: "",
      perche: `Tempo medio di consegna alto (${n("tempo_consegna_min")} min): rivedi giri e copertura rider nei picchi.`,
      preparato: "🛵 operations + 🚲 rider-fleet",
      testo: "1) Controlla la copertura rider negli orari di punta. 2) Raggruppa gli ordini vicini. 3) Avvisa i clienti se serve.",
    });
  }

  if (n("negozi") < 3) {
    out.push({
      id: "S-pochinegozi",
      titolo: `🏪 Pochi negozi (${n("negozi")}): accelera l'onboarding`,
      reparto: "vendite",
      livello: "giallo",
      canale: "interno (pipeline vendite)",
      destinatario: "",
      perche: `L'offerta è ancora limitata (${n("negozi")} negozi): più botteghe = più ordini.`,
      preparato: "🤝 vendite + 🔎 intelligence",
      testo: "1) Scegli 3 botteghe ideali del cluster. 2) Manda il pitch (commissione 12%, 0 fissi). 3) Fissa l'onboarding (~20 min).",
    });
  }

  return out;
}
