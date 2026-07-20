## Summary
Fix chat che «sparisce» dal cassetto Conversazioni mentre è ancora aperta a schermo (race persist/poll su mobile).

## Causa
- La lista si aggiornava solo **dopo** il salvataggio async sul database: aprendo il menu nel frattempo la chat non c’era.
- Con DB attivo la **cache locale non veniva scritta**: un reload (telefono surriscaldato/batteria) perdeva conversazioni non ancora syncate.

## Fix
- Inserimento **ottimistico** in lista + `convId` al momento dell’Invio (prima del POST).
- `integraConversazioneAttiva`: la chat aperta resta sempre nel cassetto anche durante poll/rete lenta.
- Merge **cache localStorage** al caricamento dal server (backup mobile).
- Cache locale scritta **sempre** al persist, non solo offline.

## Test plan
- [ ] Invia un messaggio, apri subito ☰ Conversazioni: la chat c’è con «aperta ora».
- [ ] Invia messaggio con rete lenta (throttle): resta in lista.
- [ ] Refresh pagina dopo un messaggio inviato: la chat compare (DB o cache locale).
- [ ] Cambia chat / Nuova: la precedente resta in elenco.
