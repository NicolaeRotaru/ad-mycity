Fai un GIRO DI PERLUSTRAZIONE come AD digitale di MyCity (segui CLAUDE.md).

Obiettivo: capire com'è messa l'azienda adesso e proporre le prossime mosse.

Passi:
1. Leggi i dati reali del marketplace (Supabase MCP, sola lettura): ordini e
   incassi degli ultimi 7 giorni, nuovi clienti, consegne in corso/in ritardo,
   carrelli abbandonati, recensioni. Se il Supabase MCP non è disponibile, dillo
   e lavora su ciò che hai, segnalando che servono i dati.
2. Controlla le SENTINELLE (`cervello/sentinelle.md`) contro i dati interni: se
   un segnale supera la soglia, agisci nei 🟢 e allerta sui 🟡/🔴.
3. Scorri il RADAR delle influenze (`cervello/radar.json`): per i fattori a
   **peso ≥ 4** fai un check live tramite l'**intelligence** sulle `fonti`
   indicate (WebSearch/WebFetch); se è cambiato qualcosa di rilevante, instradalo
   al `senior` indicato e annotalo nel briefing (opportunità/azione col `colore`
   giusto). Rispetta la `cadenza`: NON ricontrollare a ogni giro i fattori a
   cadenza "settimanale" (per non sprecare il Max) — concentrati su quelli
   "ogni-giro"/"giornaliera" e sui peso alti.
4. Delega all'analista l'analisi dei numeri e all'intelligence un rapido scan di
   opportunità esterne (solo se utile e veloce).
5. Scrivi un BRIEFING COMPLETO (in markdown) — l'obiettivo è NON perdere informazioni utili.
   Usa SEMPRE queste sezioni (ometti una sezione solo se davvero vuota, dicendo "nulla"):
   1. **Sintesi** — 3-5 righe: com'è messa l'azienda adesso e la mossa n.1.
   2. **Numeri chiave** — i 7 numeri + la **variazione rispetto al giro precedente** (▲▼ e perché).
   3. **Sentinelle scattate** — quali soglie superate, con il valore reale (o "nessuna").
   4. **Radar — novità per area** — per ogni fattore controllato in questo giro: cosa è cambiato,
      con **link alla fonte** e il `senior` che lo presidia. Raggruppa per area.
   5. **Opportunità** — ciascuna con impatto×sforzo e il PERCHÉ (da cosa nasce).
   6. **Rischi & minacce** — cosa potrebbe colpirci (interno o esterno), con probabilità/impatto.
   7. **Azioni proposte** — ognuna con colore 🟢🟡🔴, reparto e il risultato atteso.
   8. **Fatto da solo (🟢)** — artefatti prodotti in `consegne/`/`creativi/`, memoria aggiornata.
   9. **Serve da Nicola / domande aperte** — decisioni 🔴 e dubbi che bloccano.
   10. **Fonti consultate** — elenco dei link aperti in questo giro (per tracciabilità).
   11. **Gap — cosa NON ho potuto verificare** — dati/canali mancanti, da riprendere al prossimo giro.
   Regola: meglio una riga in più che un'informazione persa. Mai inventare dati: se manca, scrivilo nei Gap.
6. Salva il briefing in `MyCity-Vault/90-Memoria-AI/Briefing/` con nome data
   (AAAA-MM-GG.md) e nel frontmatter metti SEMPRE data **E ora**:
   `data: AAAA-MM-GG HH:MM` (fuso di Piacenza) — così la Cabina mostra al minuto
   quando è stato fatto il giro. Aggiorna i 7 numeri in `MyCity-Vault/90-Memoria-AI/STATO.md`
   e nel suo frontmatter scrivi `aggiornato: AAAA-MM-GG HH:MM` (con l'ora).
   Inoltre, se la **memoria** è collegata (variabili `SUPABASE_URL` +
   `SUPABASE_SERVICE_KEY`), salva nella tabella `briefings` un **digest STRUTTURATO**
   del report (è un sottoinsieme: la Sintesi → `situazione`, le Opportunità e le Azioni)
   così il **Pannello di Controllo** lo mostra nella card in alto. Il report COMPLETO
   (le 11 sezioni) resta nel file del vault, che il Pannello mostra in "Attività & briefing".
   La riga è `{ "data": { "situazione": "...", "opportunita": [...], "azioni": [...] } }`;
   ogni azione ha `livello` "verde"/"giallo"/"rosso". Esempio:
   `curl -s -X POST "$SUPABASE_URL/rest/v1/briefings" -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json" -d '{"data": { ... }}'`
   (Senza memoria collegata, salta questo passo: il briefing resta comunque nel vault.)
7. DOER MODE: ESEGUI da solo le azioni 🟢 (produci gli artefatti veri in `consegne/` o `creativi/`,
   aggiorna la memoria). Le 🟡/🔴 preparale COMPLETE e ACCODALE in
   `MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md` (non eseguirle finché Nicola non dà il via).

In cima al briefing metti un **TL;DR di 5 righe** per Nicola (cosa hai trovato + le 1-3 mosse
che consigli): è il riassunto veloce sopra il report completo, non un sostituto.
