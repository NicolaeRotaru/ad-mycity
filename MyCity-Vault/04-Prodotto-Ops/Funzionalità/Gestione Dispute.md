---
area: Fiducia
fonte_ispirazione: eBay
priorità: P2
effort: M
fase: Maturità
---

# Gestione Dispute

> Il tribunale del marketplace: quando cliente e negozio non sono d'accordo, serve un processo equo e tracciato.

## 🎯 Problema utente
- **Cliente:** "Il negozio non mi rimborsa, ho ragione io." Vuole un arbitro.
- **Negoziante:** "Il cliente sta abusando del reso." Vuole essere difeso.
- **Per MyCity:** dispute gestite male = cliente o negozio perso + rischio chargeback.

## 🏆 Come lo risolvono i grandi
- **eBay:** centro risoluzioni, escalation a eBay che decide, protezione acquirente/venditore.
- **Amazon:** A-to-z Guarantee claims con istruttoria.

## 🧩 Funzionalità per MyCity
Apertura disputa quando un rimborso è contestato, raccolta evidenze da entrambi i lati, decisione di MyCity (a chi va il torto), impatto su payout e reputazione. Stati e SLA della disputa.

## ✅ Requisiti minimi v1
- Apertura disputa da un caso di [[Gestione Resi e Rimborsi]] contestato
- Raccolta evidenze (foto, messaggi)
- Decisione admin + esito (rimborso/non rimborso)

## 🔗 Dipendenze
- Nasce da → [[Gestione Resi e Rimborsi]]
- Gestita in → [[Customer Support e Centro Assistenza]] e [[Dashboard Operativa]]
- Impatta → [[Reputazione Venditore]] e [[Pagamenti e Payout Venditori]]

## 📈 Metrica di successo
% dispute risolte entro SLA · tasso di chargeback · equità percepita.

## 🛠️ Note tecniche
- Caso con stati, evidenze allegate, decisione e audit trail.
- Collegamento ai chargeback del PSP.

#ebay #fiducia
