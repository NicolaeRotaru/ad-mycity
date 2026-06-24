---
area: Crescita
fonte_ispirazione: Glovo
priorità: P0
effort: S
fase: MVP+1
---

# Notifiche Transazionali

> Il filo che tiene informati cliente e negozio a ogni passo. Effort piccolo, impatto enorme sulla fiducia.

## 🎯 Problema utente
- **Cliente:** voglio sapere che l'ordine è confermato, accettato, in arrivo — senza dover controllare l'app.
- **Negoziante:** voglio essere avvisato subito di un nuovo ordine, o non lo evado in tempo.

## 🏆 Come lo risolvono i grandi
- **Amazon:** email/push a ogni step (confermato, spedito, consegnato).
- **eBay:** notifiche su offerte, pagamenti, spedizioni.
- **Glovo:** push real-time ("Il tuo rider sta arrivando") + suono di nuovo ordine al negozio.

## 🧩 Funzionalità per MyCity
Notifiche automatiche legate agli stati ordine: al cliente (confermato, accettato, in consegna, consegnato) e al negozio (nuovo ordine!). Canali v1: email + (idealmente) push/SMS per il negozio.

## ✅ Requisiti minimi v1
- Email transazionali su eventi chiave dell'ordine
- Notifica forte di "nuovo ordine" al negozio (suono/push/SMS)
- Template chiari con dettagli ordine e link

## 🔗 Dipendenze
- Innescate da → [[Gestione Stato Ordine]]
- Servono anche a → [[Onboarding Venditori Self-Service]] (benvenuto/approvazione)
- Evolvono in marketing/retention → [[Promozioni e Coupon]] (P2, canale diverso!)

## 📈 Metrica di successo
% notifiche consegnate · tempo di reazione del negozio al "nuovo ordine".

## 🛠️ Note tecniche
- Provider email (es. Resend/SendGrid) + eventualmente push (FCM) / SMS (Twilio).
- Sistema a eventi: stato ordine cambia → trigger notifica.
- Tenere SEPARATE le transazionali (sempre) dal marketing (opt-in, GDPR).

#glovo #mvp #priorità/alta #crescita
