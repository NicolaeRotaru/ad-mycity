Fai un GIRO DI PERLUSTRAZIONE come AD digitale di MyCity (segui CLAUDE.md).

Obiettivo: capire com'è messa l'azienda adesso e proporre le prossime mosse.

Passi:
1. Leggi i dati reali del marketplace (Supabase MCP, sola lettura): ordini e
   incassi degli ultimi 7 giorni, nuovi clienti, consegne in corso/in ritardo,
   carrelli abbandonati, recensioni. Se il Supabase MCP non è disponibile, dillo
   e lavora su ciò che hai, segnalando che servono i dati.
2. Delega all'analista l'analisi dei numeri e all'intelligence un rapido scan di
   opportunità esterne (solo se utile e veloce).
3. Sintetizza un BRIEFING: situazione (2-4 frasi) + opportunità (impatto×sforzo) +
   azioni proposte, ognuna con colore 🟢🟡🔴.
4. Salva il briefing in `MyCity-Vault/90-Memoria-AI/Briefing/` con nome data
   (AAAA-MM-GG.md). Aggiorna i 7 numeri in `MyCity-Vault/90-Memoria-AI/STATO.md`.
   Inoltre, se la **memoria** è collegata (variabili `SUPABASE_URL` +
   `SUPABASE_SERVICE_KEY`), salva il briefing STRUTTURATO anche nella tabella
   `briefings` così il **Pannello di Controllo** lo mostra in "Aggiorna ora".
   La riga è `{ "data": { "situazione": "...", "opportunita": [...], "azioni": [...] } }`;
   ogni azione ha `livello` "verde"/"giallo"/"rosso". Esempio:
   `curl -s -X POST "$SUPABASE_URL/rest/v1/briefings" -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json" -d '{"data": { ... }}'`
   (Senza memoria collegata, salta questo passo: il briefing resta comunque nel vault.)
5. DOER MODE: ESEGUI da solo le azioni 🟢 (produci gli artefatti veri in `consegne/` o `creativi/`,
   aggiorna la memoria). Le 🟡/🔴 preparale COMPLETE e ACCODALE in
   `MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md` (non eseguirle finché Nicola non dà il via).

Alla fine scrivi un riepilogo di 5 righe per Nicola: cosa hai trovato e le 1-3
mosse che consigli.
