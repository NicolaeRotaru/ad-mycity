---
tipo: contratto-dati
data: 2026-11-27 16:10
fonte: richiesta di Nicola del 27/11/2026 ~16:00 — «SDG usa la sua tecnologia per i propri social, versione Premium; nella sua pagina venditore, dentro Servizi: Sito = il sito, Social = il piano editoriale, Analisi = l'analisi di SDG»
---

# SDG cliente Premium di se stessa — il formato dei tre lavori consegnati

SDG Agenzia è un negozio di sistema su MyCity (id `11111111-1111-1111-1111-5d9000000001`).
Diventa il primo cliente **Premium** di se stessa. Tre lavori, tre file JSON, una forma sola:

| Lavoro | File JSON (lo scrive chi lo produce) | Versione da leggere per Nicola |
| --- | --- | --- |
| Analisi del business | `consegne/sdg-premium/analisi.json` | `consegne/sdg-premium/analisi.md` |
| Piano editoriale (Gestione social) | `consegne/sdg-premium/social.json` | `consegne/sdg-premium/social.md` |
| Sito web | `consegne/sdg-premium/sito.json` | (il sito stesso, repo `SDG`) |

Il sito MyCity li mostra nelle pagine `/seller/servizi/<servizio>` quando chi entra è SDG
(`lib/agenzia/lavoro-consegnato/`). Regole che valgono per tutti e tre:

- **Solo italiano, parole semplici** (regole di `cervello/scrittura-umana.md`): Nicola le legge.
- **Mai dati inventati.** Un fatto senza fonte si scrive con `"da_confermare": true` o non si scrive.
  Le fonti sono indirizzi `https://`.
- **Mai nomi di clienti** (Tropico, Ora del Gusto, Pane Quotidiano…) come «casi» pubblici: i clienti
  restano loro. Dentro l'analisi interna si possono citare come fatti nostri.
- Date `AAAA-MM-GG`, ore `HH:MM` (fuso di Piacenza).

## analisi.json

```json
{
  "titolo": "Analisi del business di SDG Agenzia",
  "aggiornata_il": "2026-11-27T16:00:00+01:00",
  "sintesi": "5-8 frasi: dove sta SDG, cosa la distingue, la mossa numero uno.",
  "numeri_chiave": [ { "voce": "Imprese attive in provincia di Piacenza", "valore": "≈ 28.000", "fonte": "https://…" } ],
  "mercato": [ { "titolo": "Quanto vale il mercato locale", "testo": "…", "fonti": ["https://…"] } ],
  "concorrenti": [
    { "nome": "…", "tipo": "agenzia locale | freelance | nazionale | strumento fai-da-te",
      "cosa_fanno": "…", "prezzo_indicativo": "da 400 €/mese" , "punti_forti": ["…"], "punti_deboli": ["…"],
      "fonte": "https://…" }
  ],
  "swot": { "forze": ["…"], "debolezze": ["…"], "opportunita": ["…"], "minacce": ["…"] },
  "clienti_tipo": [ { "nome": "Bar e pasticcerie del centro", "bisogno": "…", "abbonamento_adatto": "base|business|premium", "perche": "…" } ],
  "prezzi": [ { "voce": "Base 300 € · Business 500 € · Premium 999 € al mese", "confronto": "…" } ],
  "presenza_online_sdg": [ { "canale": "Instagram", "stato": "c'è | non c'è | da verificare", "indirizzo": "https://… o null", "nota": "…" } ],
  "raccomandazioni": [ { "priorita": 1, "cosa": "…", "perche": "…", "quando": "entro il 15/12", "costo": "0 € | ≈ 150 € | …" } ],
  "fonti": ["https://…"]
}
```

## social.json

```json
{
  "titolo": "Piano editoriale Premium di SDG — dicembre 2026",
  "fascia": "premium",
  "mese": "2026-12",
  "aggiornato_il": "2026-11-27T16:00:00+01:00",
  "obiettivo": "1-2 frasi misurabili (es. 15 attività che chiedono la diagnosi gratuita).",
  "a_chi_parliamo": "…",
  "canali": [ { "nome": "Instagram", "account": "@… o null se da aprire", "ruolo": "…", "da_aprire": false } ],
  "pilastri": [ { "nome": "Prima e dopo", "percentuale": 30, "descrizione": "…" } ],
  "quantita": [ { "voce": "Contenuti (post, caroselli, reel)", "quanti": 20 } ],
  "calendario": [
    { "giorno": "2026-12-01", "ora": "12:30", "canale": "Instagram + Facebook", "formato": "Reel | Carosello | Post foto | Storia | Post Google | LinkedIn | TikTok | WhatsApp",
      "pilastro": "…", "titolo": "…", "testo": "la didascalia vera, pronta", "strato": "base|business|premium", "stato": "da_approvare" }
  ],
  "extra_premium": [ { "voce": "Pubblicità su Meta", "cosa": "…", "costo_fuori_canone": "≈ 150 € (budget, 🔴 col via di Nicola) o null" } ],
  "misure": [ { "kpi": "Richieste di diagnosi gratuita", "obiettivo": "15 nel mese", "come_si_misura": "…" } ],
  "regole": ["Esce solo quello che Nicola approva su Telegram", "…"]
}
```

## sito.json

```json
{
  "titolo": "Il sito di SDG Agenzia — versione Premium",
  "aggiornato_il": "2026-11-27T16:00:00+01:00",
  "stato": "da_pubblicare | online",
  "indirizzo": "https://… o null finché non è online",
  "codice": "https://github.com/NicolaeRotaru/SDG",
  "pagine": [ { "titolo": "Home", "percorso": "/", "cosa_contiene": "…" } ],
  "cosa_ha_di_premium": ["…"],
  "da_confermare": [ { "voce": "Telefono", "perche": "nel sito è vuoto" } ],
  "prossimi_passi": [ { "cosa": "Pubblicarlo su Vercel", "chi": "Nicola", "colore": "rosso" } ]
}
```
