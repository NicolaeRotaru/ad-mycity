## Summary
- Su mobile, il badge del carrello in navbar copriva l'icona: restava visibile solo il pallino giallo col numero.
- Spostato il badge fuori dall'icona (come già fatto su desktop e sulla tab bar in basso).
- Se hai prodotti nel carrello ma non sei loggato, in alto a destra compare l'icona carrello invece del solo «Accedi».

## Test plan
- [ ] Apri mycity-marketplace.com da telefono (o viewport stretta)
- [ ] Con 3 prodotti nel carrello: in alto a destra vedi icona carrello + badge, non solo il numero
- [ ] Ospite con carrello pieno: stessa icona in header; carrello vuoto: resta «Accedi»
- [ ] Tab bar in basso invariata
