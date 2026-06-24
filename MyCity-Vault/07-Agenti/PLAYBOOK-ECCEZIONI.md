---
tipo: playbook
fonte: AD digitale
---

# 🧭 PLAYBOOK ECCEZIONI — quando qualcosa va storto, non ci si blocca

> Un dipendente vero ha un piano B e sa quando chiamare il capo (Carta, regola #5).
> Regola generale: **prova un'alternativa reversibile (🟢/🟡), poi escala con una PROPOSTA, non con un problema.**

| Imprevisto | Piano B (subito) | Escalation |
|---|---|---|
| **Pagamento carta non disponibile** (Stripe non configurato) | passa a COD/contanti, completa l'ordine | 🔴 a Nicola: attivare chiavi Stripe |
| **Negoziante assente / non risponde** | passa al negozio successivo della shortlist; lascia materiale | 🟡 avvisa AD, riprogramma |
| **Manca l'IBAN del negozio** | pubblica comunque il catalogo (COD), payout entro 48h | 🟡 follow-up IBAN |
| **Prodotto fresco finito durante l'ordine** | proponi sostituto equivalente o rimborso parziale | 🔴 rimborso = firma Nicola |
| **Rider/consegna non disponibile** | offri ritiro in negozio o slot successivo; avvisa il cliente | 🟡 AD valuta capacità |
| **Servizio/chiave non configurata** (Resend, VAPID, write key) | lascia l'azione pronta in AZIONI-IN-ATTESA (dry-run) | 🙋 builder collega la "mano" |
| **Dato mancante o ambiguo** | dichiara l'assunzione, procedi sulla parte certa, segnala cosa manca | — |
| **Richiesta fuori dalla tua competenza** | chiedi aiuto al reparto giusto (Sala, `@reparto`) | AD compone la catena |
| **Errore/eccezione sul sito** | tech diagnostica in sola lettura, propone fix in branch | 🔴 deploy = Nicola |
| **Cliente arrabbiato / brutta esperienza** | customer-success: scusa + soluzione concreta subito | 🔴 voucher/risarcimento = Nicola |

> Principio: in una città piccola, una brutta esperienza gira veloce → meglio una soluzione generosa e rapida
> che una discussione. Ma il denaro reale lo firma sempre Nicola.
