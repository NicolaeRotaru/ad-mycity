---
tipo: azioni-pronte-recensioni
reparto: customer-success
data: 2026-07-17 11:56
fonte: STATO.md 11:45 (invariato dal 24/6) · playbook ieri 16/7 11:11 · ordine zombie confermato
stato: DRY-RUN — bozze pronte, NESSUN INVIO fino a prima consegna reale
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §3)
riferimento: playbook `consegne/customer-success/2026-07-01-playbook-recensioni.md`
---

# Recensioni post-consegna — pacchetto pronto (17/7 11:56 · GIORNO VP)

> **Verifica 2026-07-17 11:56.** STATO.md invariato: 0 ordini consegnati, 23 clienti, stallo ~555h.
> **Consegne completate senza recensione: 0.** Nessun cliente reale da sollecitare ADESSO.
>
> ⚡ **ATTENZIONE:** OGGI è Venerdì Piacentini — presidio PQ Via Calzolai 20:00–22:30.
> La PRIMA consegna reale potrebbe arrivare stasera. I messaggi qui sotto sono caricati e pronti.

## Situazione reale (fonte STATO.md 11:45)

| Metrica | Valore | Fonte |
|---|---|---|
| Ordini totali in DB | **1** | REST 11:28 (invariato) |
| Consegne completate (`delivery_status=DELIVERED`) | **0** | stesso |
| Consegne con `delivered_at` valorizzato | **0** | stesso |
| Recensioni negozio (`store_reviews`) | **0** | stesso |
| Recensioni prodotto (`reviews`) | **0** | stesso |
| **Consegne senza recensione da sollecitare** | **0** | nessun destinatario reale oggi |

## Ordine zombie — NON contattare MAI

| Campo | Valore |
|---|---|
| order_id | `58094956-4b9b-49b4-9299-7a5c645d7cb3` |
| Negozio | Pane Quotidiano |
| Totale | €19,05 COD |
| Stato | `delivery_status=CANCELED` · annullato 3/7 15:38 · `delivered_at` null |
| Contatto | 348 642 1766 — **non** inviare messaggio post-consegna |

---

## Messaggi CARICATI per la prima consegna reale (questa notte/domani)

> Tutti gli invii sono 🔴 — richiedono ok di Nicola prima di partire.

### Touch 1 · Feedback (+3h da Consegnato) · 🔴

**Canale:** WhatsApp/telefono dal profilo ordine · backup email/in-app
**Trigger:** ordine cambia `delivery_status = DELIVERED` + `delivered_at` valorizzato
**Timing:** +3h dalla consegna (non passare la mezzanotte se consegnato tardi)

> Ciao [NOME]! Sono Nicola di MyCity 👋
> Ti è arrivata la spesa da **Pane Quotidiano**? Spero tutto fresco come al banco.
>
> Siamo appena nati e ogni tua parola conta. **Com'è andata?**
> 👍 Tutto bene · 😐 Così così · 👎 C'è stato un problema
>
> Se qualcosa non va, rispondi qui: lo sistemo oggi stesso.
> Grazie per aver scelto la bottega del quartiere 🧡

**Ramo 👎:** handoff immediato @supporto — **NON** inviare Touch 2.

### Touch 2 · Richiesta recensione (+1 giorno, solo se 👍 o 😐) · 🔴

**Trigger:** Touch 1 ricevuto + risposta ≠ 👎

> Buongiorno [NOME]! Come promesso, ecco il link per lasciare **due righe su Pane Quotidiano** 🌟
> 👉 https://mycity.piacenza.it/negozi/pane-quotidiano/recensione?order=[ID-ORDINE]
>
> Bastano 30 secondi: stelline + una frase vera.
> Sarebbe la **prima recensione verificata di MyCity a Piacenza** — grazie di cuore!

Sostituire `[NOME]`, `[ID-ORDINE]` con i dati reali dall'ordine consegnato.
Aprire il link nel browser PRIMA dell'invio per verificare che la pagina carichi.

---

## Sequenza operativa per stasera (Venerdì Piacentini)

```
Presidio PQ Via Calzolai 20:00 → ordine arriva? →
  SÌ → controlla delivery_status sul Pannello →
       DELIVERED → manda Touch 1 a +3h (ma non dopo mezzanotte) →
       se 👍/😐 → Touch 2 domani mattina →
       se 👎 → @supporto subito, no Touch 2
  NO → niente invii, update STATO domani mattina
```

---

## Cosa accodare in AZIONI-IN-ATTESA (subito)

| ID | Azione | Gate | Colore |
|---|---|---|---|
| **#touch1-vp17** | Manda Touch 1 a `[NOME cliente primo ordine]` dopo consegna VP stasera | `delivered_at` valorizzato | 🔴 |
| **#touch2-vp17** | Manda Touch 2 link recensione +1g da Touch 1 | Touch 1 ≠ 👎 | 🔴 |
| **#recensioni-trigger** | Attiva automazione Resend: email "grazie + recensione" auto dopo ogni consegna | già in coda (da accodare prima) | 🟡 |

`#touch1-vp17` e `#touch2-vp17` sono aggiunti in AZIONI-IN-ATTESA qui sotto.

---

## Esito playbook · 17/7 11:56

- ✅ FATTO: bozze Touch 1 + Touch 2 aggiornate per VP stasera
- ✅ FATTO: sequenza operativa scritta
- ⏳ ACCODATA: `#touch1-vp17` + `#touch2-vp17` in AZIONI-IN-ATTESA
- 🙋 SERVE DA NICOLA: ok a inviare Touch 1 appena arriva la prima consegna stasera
