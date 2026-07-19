## Summary

Mantiene **auto-apertura** e **sync elenco** insieme, senza il bug del «+».

**Problema:** sync elenco (poll ~8s) e auto-apertura servono scopi diversi ma devono convivere; togliere auto-apertura risolve «+» ma peggiora cross-device; tenerla senza guardie fa rientrare la chat vecchia.

**Fix:**
- «+» blocca auto-apertura **subito** (prima del salvataggio), finché la prima riga della nuova chat non è salvata
- Auto-apertura al primo caricamento (desktop ↔ telefono) invariata
- Se la stessa conversazione si aggiorna dal database (timestamp più recente = messaggio dall’altro device), si riapre anche con chat vuota — sync contenuto senza aspettare il cassetto
- Sync elenco (poll 8s + refresh cassetto) **non toccato**

## Test plan

1. Telefono: scrivi in una chat → desktop con chat vuota: entro ~8s si apre/aggiorna quella conversazione
2. Desktop: premi «+» → resta vuota 15+ secondi (poll attivo)
3. Dopo «+»: scrivi e invia → parte chat nuova, niente rientro della vecchia
4. Cassetto su entrambi i device: footer «Salvate nel database», stessa lista
5. Scegli chat dal cassetto dopo «+» → si riapre quella scelta
