## Summary

Fix regressione chat «+ Nuova chat»: la conversazione precedente non riappare più da sola.

**Causa:** il fix cross-device del 18/7 sera ha reintrodotto un timer da 3 secondi che annullava il blocco manuale (`nuovaChatManualeRef`) — dopo pochi secondi o al poll ogni 8s la chat si riempiva di nuovo con l'ultima conversazione (<24h).

**Fix:**
- Rimosso il timer da 3s: «+» blocca l'auto-apri finché non scrivi o non scegli una chat dal cassetto
- Auto-apri al **primo caricamento** pagina (sync smartphone ↔ desktop) separato dal caso «nuova chat manuale»
- Dopo il caricamento: auto-apri solo se arriva un **ID conversazione nuovo** (altro dispositivo), non la stessa chat già vista

## Test plan

1. Apri Worker → premi «+» → la chat resta **vuota** (aspetta 15+ secondi, niente messaggi vecchi)
2. Scrivi un messaggio → parte una chat nuova normalmente
3. Apri il Pannello su smartphone con chat vuota → si apre l'ultima conversazione recente del desktop (sync)
4. Premi «+» sul desktop → resta vuota anche se arriva poll conversazioni
5. Scegli una chat dal cassetto → si riapre quella scelta
