## Summary
- Completa la rete di sincronizzazione del Pannello: ogni casella che legge dati ora ascolta `mycity:sync` e si aggiorna subito quando cambia un'azione, un difetto radiografia o un lavoro worker.
- Quando un lavoro passa a «fatto» (es. approvazione azione, giro, fix), il polling centrale propaga il refresh a tutte le aree collegate — non serve più aspettare 30–90s di polling isolato.
- Fonte unica lato browser: il vault su GitHub resta la verità; il bus collega radiografia ↔ da approvare ↔ plancia ↔ memoria ↔ lavori.

## Test plan
- [ ] Apri Radiografia macchina e Da approvare in due tab/aree visibili
- [ ] Approva un'azione legata a un difetto: il difetto sparisce dal cantiere e la card esce da Da approvare entro pochi secondi (senza refresh manuale)
- [ ] Avvia un giro dal worker: Plancia, Memoria viva e Cuore macchina si aggiornano quando il lavoro passa a fatto
- [ ] `npx tsc --noEmit` in `pannello/` → exit 0
