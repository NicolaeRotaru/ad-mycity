---
tipo: azioni-pronte-recupero-carrelli
reparto: crm-lifecycle
data: 2026-07-23 11:45
fonte: Supabase MCP live (query dirette `abandoned_carts` + `profiles` + `orders` + `coupons`)
stato: DRY-RUN — bozze pronte, NESSUN INVIO
riferimento: playbook `consegne/crm/2026-07-01-playbook-recupero-carrelli.md` · dossier precedente `consegne/crm/2026-07-20-recupero-carrelli-pronte.md` · bozze canoniche [[AZIONI-PRONTE]] A3
---

# Recupero carrelli — ri-verifica (23/7 11:45)

**Esito in una riga: nessun carrello nuovo. La situazione è IDENTICA al 20/7 — un solo cliente reale con carrello fermo (samir, €10,00), gate ancora chiuso. Le bozze email restano quelle già pronte in [[AZIONI-PRONTE]] A3, solo il tempo di attesa è aumentato.**

## Cosa è cambiato dal 20/7 (con fonte)

| Cosa | 20/7 | 23/7 | Nota |
|---|---|---|---|
| Record `abandoned_carts` | 4 | **3** | Il carrello demo "Casa Linda" (€17,80) è sparito dalla tabella — pulizia dati, non un cliente perso |
| Carrelli recuperabili reali | 1 (samir) | **1 (samir)** — invariato | Stesso carrello, stessi 3 prodotti, stesso totale €10,00 |
| Profili totali | 23 (dato dell'epoca) | **7** | Numero 20/7 era gonfiato/obsoleto; oggi coerente con STATO.md ("4 buyer") |
| Buyer registrati | 4 | **4** — invariato | 9262fa38 (autore ordine zombie) · 61bc84da · fa72dbee · samir |
| Ordini nel DB | 1 (zombie CANCELED) | **1 — stesso ordine, ancora CANCELED** | Nessun nuovo ordine da giugno |
| Ordini `DELIVERED` | 0 | **0** | Gate ancora chiuso |
| Coupon attivi | BENVENUTO10 · SPED5 | **invariati** | |

## Cliente con carrello fermo: samir — €10,00 (Pane Quotidiano)

- 1× Pesto Genovese Bio — €5,00
- 1× Kefir di latte di capra biologico — €2,95
- 1× Berchtesgadener Land kefir biologico 400g — €2,05
- **Totale: €10,00** (+ consegna)
- **Fermo da: ~875h (~36,5 giorni)**, dal 16/6 22:24 — invariato rispetto al 20/7, solo più vecchio
- `email_marketing = false` → invio possibile solo come transazionale (promemoria del suo carrello), non marketing
- Email di samir: non leggibile da REST/MCP (sta in `auth.users`, non in `profiles`) — resta da recuperare da `/admin/users` prima di un invio reale

**Le due bozze (oggetto + corpo + codice) sono già scritte e pronte, invariate, in [[AZIONI-PRONTE]] A3:**
- Touch #1 — reminder senza sconto (🟡)
- Touch #2 — con codice `BENVENUTO10` (🔴), solo se Touch #1 non converte in 24h

Altri 2 record in `abandoned_carts` (admin €7,95, Pane Quotidiano/seller €13,90) restano SKIP: non sono clienti reali.

## Gate — ancora chiuso

Stesso gate del 20/7: l'invio parte solo quando Pane Quotidiano evade davvero un ordine (`#ordine-test-pq`, ancora in coda in [[AZIONI-IN-ATTESA]]). Oggi 0 ordini `DELIVERED`, l'unico ordine nel DB è quello annullato il 3/7. Mandare la mail prima rischierebbe di far leggere a samir un carrello legato a un negozio che ancora non consegna.

## Esito

Nessuna nuova azione da accodare: A3 in [[AZIONI-PRONTE]] resta la bozza valida, aggiornata solo con la ri-verifica di oggi. Nessuna mail parte finché Nicola non firma dopo il gate.
