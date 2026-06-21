# 📱 17 — Prodotto & UX (vista E-commerce/Product Manager)

> Sintesi azionabile. 🟢 must-have MVP · 🟡 fase cluster · 🔴 scala. Collega a [[Gestione Catalogo e Listing]] · [[Carrello e Checkout]] · [[20-Tecnologia-e-Stack]].

## Le 5 decisioni di prodotto che contano
1. **🟢 PWA mobile-first**, NON app nativa (budget piccolo + il caregiver ordina da desktop/fuori città). App nativa solo in V3 se la retention lo giustifica.
2. **🟢 Prezzo €/kg trasparente + authorize/capture sul peso reale + resoconto** stima→effettivo → risolve il nodo n.1 di Daje (prodotti a peso) e costruisce fiducia.
3. **🟢 Ordine minimo a livello di CARRELLO** (~25-30€ totali), non per bottega → rende il multi-negozio un vantaggio, non una trappola. Barra "ti mancano X€".
4. **🟢 Onboarding AI-assistito umano-nel-loop** + ordini ai negozi via WhatsApp/stampante termica.
5. **🟢 Due prodotti distinti:** (A) spesa settimanale (complessa, abituale, locale) e (B) box DOP regalo (semplice, prezzo fisso, nazionale, cassa+PR). Non confonderli nello stesso flusso.

## Il nodo carrello multi-negozio (risolverlo o si muore)
- **Peso variabile:** mostra €/kg + scelta "umana" ("per quante persone?" / "2 etti"), preautorizza stima +10-15%, cattura sul peso reale inserito dal negoziante, resoconto trasparente.
- **Slot unico D+1:** un solo giro batchato il giorno dopo, comunicato come feature ("consegniamo tutto insieme domani"). Cut-off con countdown.
- **Disponibilità:** stato 3 livelli (Disponibile / Su richiesta / Esaurito) + sostituzione pre-approvata al checkout (default anziani: "chiamami").

## Conversione (CRO grocery — benchmark: conv. 3-5%, abbandono carrello ~55-70%)
- 🟢 Nessun costo a sorpresa: consegna mostrata **prima** del checkout (causa #1 di abbandono, 48%).
- 🟢 Foto vere delle botteghe + provenienza + badge DOP = trust signal (sostituisce le recensioni in cold-start).
- 🟢 Guest checkout, Apple/Google Pay, ricerca tollerante a dialetto.

## Retention = abitudine settimanale (il prodotto È l'abitudine)
1. 🟢 **"Riordina la spesa scorsa" 1-click** (il 75% dei riacquisti grocery parte dal carrello precedente).
2. 🟢 Liste salvate ("La mia spesa").
3. 🟡 Slot fisso settimanale + abbonamento essenziali (e "spesa di mamma" per il caregiver).
4. 🟢 Reminder pre-cutoff via WhatsApp.
> Metrica nord: **% clienti con 2° ordine entro 14 giorni**.

## Onboarding catalogo AI
Foto prodotti hero → AI estrae nome/€/descrizione/categoria → review a card (~5 sec/prodotto) → bulk publish. **Accuratezza: nome ~85-95%, prezzo MAI fidarsi al 100%** (umano conferma il prezzo). Costo: ~€0,10-0,50 per onboarding di una bottega. Il valore non è l'accuratezza perfetta ma ridurre il data-entry da ore a minuti.

## Roadmap
- **MVP:** PWA, carrello multi-bottega, checkout+authorize/capture, €/kg+stima, onboarding AI-assistito 8-15 botteghe, ordini WhatsApp, box DOP, riordino 1-click.
- **V2:** slot fisso + abbonamento, recupero carrello, mini-web "1 campo peso" per negozi, Apple/Google Pay.
- **V3:** app nativa, onboarding AI self-service, espansione, raccomandazioni.

### Fonti
[Baymard – prezzo per unità](https://baymard.com/blog/price-per-unit) · [VTEX – retention grocery](https://vtex.com/en/blog/strategy/how-to-retain-online-grocery-customers/) · [Swell – checkout stats](https://www.swell.is/content/custom-checkout-statistics) · [CS-Cart – seller onboarding](https://www.cs-cart.com/blog/marketplace-seller-onboarding/)

#prodotto #ux #product-manager #priorità/alta
