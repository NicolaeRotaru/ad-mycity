---
tipo: azioni-pronte-recensioni
reparto: customer-success
data: 2026-07-18 11:43
fonte: STATO.md 11:38 (0 ordini, stallo ~580h) · playbook 17/7 confermato · VP senza ordini
stato: DRY-RUN — bozze pronte, NESSUN INVIO fino a prima consegna reale
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §3)
---

# Recensioni post-consegna — aggiornamento 18/7 11:43

> **Verifica 2026-07-18 11:43.** North Star = 0. Stallo ~580h (~24,2 giorni).
> Venerdì Piacentini (17/7) NON ha generato ordini.
> **Consegne completate senza recensione: 0.** Nessun invio da fare ADESSO.

## Situazione reale (fonte STATO.md 18/7 11:38)

| Metrica | Valore |
|---|---|
| Ordini totali in DB | **1** (zombie COD annullato — NON contattare) |
| Consegne completate (`delivery_status=DELIVERED`) | **0** |
| Recensioni in DB | **0** |
| **Da sollecitare oggi** | **0** |

## Card VP scadute — da chiudere

Le card `#touch1-vp17` e `#touch2-vp17` erano gated sull'ordine della serata VP (17/7).
Il VP è passato senza ordini → gate mai scattato → **sono scadute**, non eseguibili.
Restano in AZIONI-IN-ATTESA come ❌ SCADUTE finché Nicola le chiude.

## Template pronto per la PRIMA consegna reale

Il template dal 17/7 è valido e non cambia. Quando arriva il primo ordine DELIVERED:

### Touch 1 · Feedback (+3h da consegnato) · 🔴 (richiede ok Nicola)

> Ciao [NOME]! Sono Nicola di MyCity 👋
> Ti è arrivata la spesa da **[NEGOZIO]**? Spero tutto fresco come al banco.
>
> Siamo appena nati e ogni tua parola conta. **Com'è andata?**
> 👍 Tutto bene · 😐 Così così · 👎 C'è stato un problema
>
> Se qualcosa non va, rispondi qui: lo sistemo oggi stesso.
> Grazie per aver scelto la bottega del quartiere 🧡

**Canale:** WhatsApp/telefono dal profilo ordine · backup email in-app
**Ramo 👎:** handoff immediato @supporto — NON inviare Touch 2.

### Touch 2 · Link recensione (+1 giorno, solo se 👍 o 😐) · 🔴

> Buongiorno [NOME]! Com'è andata ieri?
> Se ti va, due righe su **[NEGOZIO]** ci aiutano tantissimo 🌟
> 👉 https://mycity-marketplace.com/negozi/[SLUG-NEGOZIO]/recensione?order=[ID-ORDINE]
>
> Bastano 30 secondi: stelline + una frase vera.
> Sarebbe la **prima recensione verificata di MyCity a Piacenza** — grazie!

Sostituire: `[NOME]`, `[NEGOZIO]`, `[SLUG-NEGOZIO]`, `[ID-ORDINE]` con dati reali dall'ordine.

## Automazione futura (già in coda)

| Card | Azione | Stato |
|---|---|---|
| `#recensioni-trigger` | Attiva email Resend auto "grazie + link recensione" dopo ogni consegna | 🟡 in AZIONI-IN-ATTESA |

## Esito playbook · 18/7 11:43

- ✅ VERIFICATO: 0 consegne completate, 0 da sollecitare oggi
- ✅ SEGNALATO: `#touch1-vp17` e `#touch2-vp17` scadute (VP senza ordini)
- ✅ TEMPLATE: aggiornato URL a `mycity-marketplace.com`, variabile `[NEGOZIO]` generalizzata
- ⏳ IN CODA: `#recensioni-trigger` (automazione) — non serve firma urgente oggi
- 🙋 SERVE DA NICOLA: il primo ordine reale sblocca tutto — da `#ordine-test-pq`
