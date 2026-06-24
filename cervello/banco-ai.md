# 🤖 BANCO DELLE AI ECONOMICHE — quale AI per quale compito

> Principio: **Claude (Max, costo fisso) solo per il ragionamento**; per il lavoro ad alto volume si usa l'AI
> più economica capace. Così molte mani girano in parallelo a costo bassissimo.
> ⚠️ Prezzi e free tier cambiano: verificare al collegamento. Ogni AI richiede la sua chiave (variabile d'ambiente).

| Compito | AI consigliata (economica) | Perché | Costo indicativo | Chi la usa |
|---|---|---|---|---|
| Ragionamento, decisioni, coordinamento | **Claude (Max)** | la migliore sul difficile, costo fisso | forfait | AD + senior |
| Foto prodotto → nome/prezzo/categoria (vision) | **Gemini Flash** | ottimo su foto imperfette, structured output | ~€0,10-0,50 a negozio | designer, vendite |
| Generazione immagini (social, locandine) | **Gemini (Imagen) / Flux free** | immagini buone a basso costo | free tier / centesimi | designer, content |
| Alto volume testi (router, classificazione, bozze di massa, riassunti) | **Groq (Llama) / DeepSeek / Gemini Flash-Lite** | gratis o bassissimo, veloci | ~€0 / centesimi | crm, content, supporto, analista |
| Trascrizione audio (note vocali) | **Whisper** | accurato, cheap | molto basso | supporto, customer-success |
| Voce/audio (TTS) | **Google TTS / ElevenLabs free** | messaggi vocali | free tier | customer-success |
| Traduzione | **LLM economico / Google Translate free** | multilingua | gratis | content, supporto |
| Ricerca web | **WebSearch (nativo)** | gratis | — | intelligence, analista |

## Regola operativa per i senior e per l'AD
1. È un compito **semplice/ripetitivo/ad alto volume**? → usa un'AI economica del banco (non Claude).
2. È **ragionamento, strategia o una decisione**? → Claude.
3. Nel dubbio sul costo, scegli la più economica che fa il lavoro **abbastanza bene** e misura il risultato.

> Collegamento delle chiavi: vedi `cervello/collega-le-mani.md`. Registro completo delle mani: `cervello/azioni.md`.
