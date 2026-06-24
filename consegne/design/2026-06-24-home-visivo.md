---
tipo: audit-visivo
data: 2026-06-24
pagina: home (https://mycity-marketplace.com/)
fonte: AD (ispezione visiva live via browser)
---

# 🎨 Audit visivo — Home (live)

> Ispezione reale della home online. Nota: i colori/font esatti vanno confermati con inspect; qui i problemi di **layout/struttura/contenuto** visibili a occhio.

## 🟠 Problemi grafici reali
1. **Carosello "Prodotti che vanno forte": prima card tagliata a sinistra e disallineata.** Il titolo della sezione è rientrato (margine sinistro), ma le card dei prodotti partono dal bordo x=0 → la prima card è tagliata e non allineata al titolo. *(corsia CODICE: padding/allineamento del carosello al contenitore)*
2. **"Flash" di caricamento (sembra rotto per un attimo).** Le immagini delle categorie e dei prodotti appaiono **dopo un istante**: prima si vedono blocchi di colore / card bianche col solo badge "NUOVO". Manca uno **skeleton/placeholder elegante** e la priorità sulle immagini above-the-fold. *(corsia CODICE: skeleton + priority/lazy corretto)*
3. **Barra annunci in alto duplicata.** "Paghi alla consegna · Consegna in 24-48h · Negozi veri di Piacenza" appare **due volte** di fila. Se è un marquee animato è ok; se è fermo, è un bug visivo. *(verifica → config/codice)*
4. **Card hero "Salumeria del Borgo": 4° prodotto tagliato.** Il prezzo è troncato a metà ("€15,") e le mini-immagini prodotto sono riquadri colorati senza foto. *(corsia CODICE: overflow/peek del mini-carosello; o immagini mancanti)*

## 🟡 Contenuti / coerenza (probabili dati di TEST, non bug di codice)
5. **Negozio "Casa Linda" (casa) mostra prodotti incoerenti**: un integratore + due libri "Le 48 leggi del potere". Sono dati seed di test → con i negozi veri sparisce.
6. **Loghi negozi incoerenti**: un negozio ha il badge logo scuro pieno, un altro l'icona chiara di fallback. *(minore)*

## Come si sistemano
I punti 1-4 sono **codice** → corsia 🛠️ (branch → anteprima Render → tuo ok). I punti 5-6 sono **contenuto/dati**
(si risolvono coi negozi reali o da admin). Da incrociare con la *radiografia del design* (in corso sul codice).
