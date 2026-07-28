---
titolo: Worker per i negozi — i 3 abbonamenti (listino definito da Nicola)
data: 2026-07-29 00:15
autore: AD
colore: 🟢 (memoria — nessun prezzo pubblicato, nessun soldo toccato)
fonte: Nicola — chat claude.ai «Worker subscription plans for shops», screenshot 2026-07-29 00:13
---

# Worker per i negozi — i 3 abbonamenti

> Perché questo file esiste: il listino era stato definito in una chat **claude.ai** (app desktop),
> una superficie che il worker **non legge**. Nel vault e nelle 135 conversazioni del Pannello non
> c'era una riga. Ora vive qui + in `registro-fatti.json` (`pricing.worker-negozi`,
> `pilot.worker-negozi`), così ogni senior lo trova senza doverlo richiedere a Nicola.

## Il prodotto
Non è il marketplace: è **il Worker dato in mano al negozio** — un dipendente digitale in
abbonamento. Tre livelli, ognuno contiene il precedente.

| # | Piano | Prezzo | Cosa fa |
|---|-------|--------|---------|
| 1 | **Vetrina** | **99 €/mese** | Presenza digitale gestita in automatico: Google Business curato, risposta alle recensioni, social autopilot con contenuti generati e pubblicati da template. Il piano «il negozio esiste online senza che il titolare tocchi nulla». |
| 2 | **Autopilot** | **299 €/mese** | Tutto Vetrina + la parte operativa: assistente WhatsApp per i clienti finali, richiami e loyalty automatici, **Report del Lunedì** coi numeri della settimana. Qui il Worker inizia a **portare clienti dentro** il negozio, non solo a farlo trovare. |
| 3 | **Direttore Digitale** | **699-999 €/mese** | Tutto Autopilot + cruscotto finanziario in sola lettura, watchdog bandi, analisi strategica mensile col metodo OS-file della consulenza. Di fatto un direttore marketing + controller esternalizzato, a una frazione di uno stipendio. |

- **Setup una tantum** si somma a tutti e tre (importo da definire).
- **Pilot founder:** prezzo bloccato **149 €/mese** per i primi 3 — *I Frutti della Terra*,
  *Enoteca La Canteina*, *Il Pollivendolo*.

## Come si incastra con il marketplace (da non confondere)
Sono **due listini diversi**, su due prodotti diversi:

| | Marketplace MyCity | Worker per i negozi |
|---|---|---|
| Cosa vende | vetrina + ordini + consegna | dipendente digitale in abbonamento |
| Prezzo | 10% sul venduto + **50 €/mese** (`pricing.abbonamento`) + 3 € fee consegna | **99 / 299 / 699-999 €/mese** (`pricing.worker-negozi`) |
| Ricavo | variabile, dipende dagli ordini | **ricorrente, indipendente dagli ordini** |

Il secondo è la leva che il primo oggi non ha: incassa anche con zero ordini. Con 1 solo cliente
Vetrina (99 €/m) si copre **un terzo** del burn fisso (~302 €/m); con 3 Autopilot si copre tutto
il burn e avanza. — *numeri derivati dai fatti già in registro, non una proiezione di vendita.*

## Cosa serve prima di venderlo (onesto)
1. **I 3 pilot non esistono nel registro-realtà della macchina.** *I Frutti della Terra*,
   *Enoteca La Canteina*, *Il Pollivendolo* non sono nei dati né tra i prospect fondati
   (lì ci sono Pane Quotidiano, Garetti, Frolla Couture). Prima di produrre materiale intestato
   a loro serve che tu confermi: sono negozi veri già contattati, o nomi scelti in quella chat?
2. **Le "mani" del Worker non sono collegate.** Google Business, recensioni, social autopilot e
   WhatsApp verso clienti finali sono canali di **scrittura verso il mondo reale**: oggi la
   macchina li ha spenti (`AZIONI_LIVE=0`). Vendere Vetrina significa doverli accendere — e
   ognuno resta 🔴 (firma tua) finché non decidiamo il perimetro di ciò che parte da solo.
3. **Il setup una tantum non ha un importo.** Serve, altrimenti il margine del primo mese
   non è calcolabile.

## Traccia
- `registro-fatti.json` → `pricing.worker-negozi`, `pilot.worker-negozi` (2026-07-29 00:15).
