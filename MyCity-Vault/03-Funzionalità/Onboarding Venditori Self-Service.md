---
area: Venditori
fonte_ispirazione: eBay
priorità: P0
effort: M
fase: MVP+1
---

# Onboarding Venditori Self-Service

> La feature #1 dopo il primo negozio. Sblocca tutto il resto: senza più negozi non c'è marketplace.

## 🎯 Problema utente
- **Negoziante:** vuole iniziare a vendere online senza dipendere da te che inserisci tutto a mano. Oggi l'onboarding non scala.
- **Per MyCity (tu):** inserire ogni negozio manualmente è il collo di bottiglia che impedisce la crescita.

## 🏆 Come lo risolvono i grandi
- **eBay:** registrazione venditore in pochi minuti, wizard guidato, "Seller Hub" come hub unico. Frizione minima all'ingresso, verifiche progressive dopo.
- **Amazon Seller Central:** flusso a step (dati attività → fiscali → bancari → primo prodotto) con stato di completamento.
- **Glovo Partner:** form negozio + menu + zona, con onboarding assistito per i primi partner chiave.

## 🧩 Funzionalità per MyCity
Flusso self-service in cui un negozio: si registra → inserisce dati attività (nome, indirizzo, categoria, P.IVA) → carica logo/orari/zona consegna → pubblica il primo prodotto → va live. Onboarding **assistito** per i primi negozi (modello curato), poi 100% self-service.

## ✅ Requisiti minimi v1
- Form registrazione negozio (email, password, dati attività)
- Profilo negozio: nome, descrizione, indirizzo, categoria, orari, area di consegna
- Stato "bozza → in revisione → pubblicato"
- Approvazione manuale admin nella v1 (curato)
- CTA a creare il primo prodotto

## 🔗 Dipendenze
- Porta a → [[Dashboard Venditore]]
- Abilita → [[Gestione Catalogo e Listing]]
- Per i payout richiederà → [[Pagamenti e Payout Venditori]] e [[Verifica e KYC Venditori]]
- Zona consegna definita in → [[Zone di Consegna e Geolocalizzazione]]

## 📈 Metrica di successo
Tempo signup → primo prodotto live < 30 min · % negozi che completano l'onboarding.

## 🛠️ Note tecniche (alto livello)
- Multi-tenant: ogni negozio è un `seller` con i suoi prodotti e ordini.
- Stato di approvazione + ruoli (seller, admin).
- Upload immagini (logo, vetrina). Validazione P.IVA.
- Email transazionali di benvenuto/approvazione → riusa [[Notifiche Transazionali]].

#ebay #mvp #priorità/alta #venditori
