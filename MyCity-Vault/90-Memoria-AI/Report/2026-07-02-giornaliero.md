---
tipo: report-giornaliero
data: 2026-07-02 06:43
fonte: AD digitale
canale-dati: ⚠️ CHIUSO (Supabase MCP non autorizzato in questo giro; Stripe idem) — numeri NON riverificati
---

# 📊 REPORT GIORNALIERO — Giovedì 2 luglio 2026, 06:43 (Piacenza)

## In una riga
Nessun dato-live riverificabile oggi (canale Supabase/Stripe non autorizzato in questo giro): i numeri restano alla **baseline del 24/6** e vanno considerati **fermi da 6 giorni**. La cosa più urgente **non è un numero, è una firma con scadenza**: la finestra "I TRE VENERDÌ" si apre **domani 3/7** e va sbloccata **oggi**.

---

## 🔢 Numeri chiave (⚠️ baseline 24/6 — da riverificare appena si sblocca il canale dati)
| Numero | Valore | Note |
|---|---|---|
| Ordini creati | **0** | baseline 24/6 |
| Ordini pagati | **0** | baseline 24/6 |
| Incassi | **0 €** | baseline 24/6 |
| Nuovi clienti reali | **0** | baseline 24/6 |
| Negozi LIVE (approvato + payout + ≥1 prodotto vero) | **0** | 2 approvati su 17, solo 1 con payout |
| Prodotti VERI del faro pubblicati | **0** | i ~250 "available" sono seed/test, da ignorare |
| Payout testato | **0** | pipeline incassa→trattiene→paga mai girata sul vivo |

> **Perché tutti zero:** siamo pre-lancio commerciale. Il primo sabato utile era il 27/6. Non ho la conferma live di cosa sia successo tra il 27/6 e oggi perché il canale dati è chiuso. **Questo è il buco più grave del report**: senza Supabase/Stripe autorizzati sto governando alla cieca da 6 giorni.

---

## ✅ Mosse fatte (dalla memoria, ultimi giri)
- **Squadra portata a livello "pro"**: rollout dello stampo v3 su tutti i 42 senior (mansionari + kit profondi strati 3-6), con revisione indipendente. La macchina-azienda è pronta; manca il **carburante reale** (foto/interviste/dati/chiavi AI).
- **Marketing di lancio pronto a scaffale**: piano editoriale 4 settimane, 16 post, 7 flussi email/lifecycle, kit stampa, 8 reel, Content Factory (genera PNG/reel veri), Marketing Autopilot (in dry-run).
- **2 fix sito già mergiati**: checkout mobile (la tab bar copriva "Conferma ordine", PR #199) + gruppo 1 audit-design conversione (PR #200).
- **Kit "I TRE VENERDÌ" e storia-bottega Garetti** scritti e pronti alla pubblicazione.

## ⚠️ Punti di attenzione (semafori)
- 🔴 **Governance alla cieca**: canale dati (Supabase + Stripe) non autorizzato → nessun KPI reale da 6 giorni. **Va sbloccato oggi.**
- 🔴 **Stripe live o sandbox?** ancora non confermato (bloccante storico dal 24/6).
- 🟡 **Mani spente**: email (Resend), push, social publisher NON collegati → tutte le azioni marketing/CRM restano in coda, non partono.
- 🟡 **Faro (Garetti) non ancora LIVE**: senza go-live + primo ordine, i numeri restano a zero per costruzione.

---

## 🖊️ Cose da firmare (in ordine di urgenza)

### ⏰ URGENTE — scade domani 3/7
- **"I TRE VENERDÌ" (azione #7)** 🔴 — pubblicare i 3 post nelle sere dei Venerdì Piacentini (3, 10, 17 lug). È una **finestra reale che si chiude il 17/7**; per agganciare il **primo venerdì serve l'OK entro oggi** + il **link reale della lista d'attesa**. Se salta oggi, perdiamo il primo dei tre picchi.

### 🚀 Sblocco lancio (le 3 decisioni 🔴 sono in un foglio-firma da 2 minuti → `consegne/decisioni/2026-06-26-foglio-firma-lancio.md`)
1. **Termini Garetti** 🔴 (azione #1) — commissione 12%, 0€ fissi, payout a consegna. → da qui parte il primo incasso.
2. **Modalità payout-test** 🔴 (azione #2) — 1€ reale da stornare *oppure* ambiente test Stripe. → valida che i soldi arrivino al negozio.
3. **Contatti primo cliente** 🟡 (azione #3) — via libera a messaggi/telefonate concierge (testi pronti).

### 📣 Amplificazione (quando c'è il link lista d'attesa)
- **Post storia-bottega Garetti "La saracinesca"** 🔴 (azione #6) — IG+FB, serve il link reale.
- **Contatto pagine locali / organizzatori Venerdì Piacentini** 🔴 (azione #8) — ricondivisione di valore durante la finestra.

---

## 🎯 Raccomandazione dell'AD (le 3 mosse di oggi)
1. **Sblocca il canale dati** (autorizza Supabase MCP + Stripe, o dammi `SUPABASE_URL`/`SUPABASE_SERVICE_KEY`): senza, ogni report è una fotografia vecchia. È la mossa a ritorno più alto perché abilita tutte le altre.
2. **Firma il foglio-lancio da 2 minuti** (`consegne/decisioni/2026-06-26-foglio-firma-lancio.md`) + dammi il **link lista d'attesa**: sblocca sia Garetti LIVE sia i post.
3. **Decidi "I TRE VENERDÌ" oggi**: è l'unica cosa con una scadenza fisica a domani.

> Con canale dati aperto + foglio firmato, il prossimo report ha numeri veri e la prima riga smette di essere "tutti zero".

---
### 📧 Invio email a Nicola
**Non inviato**: la "mano" email (Resend) non è ancora collegata (`RESEND_API_KEY` mancante — vedi coda azioni CRM). Report consegnato qui e salvato in memoria. Al collegamento della chiave (via @builder-automazioni) questo report parte anche via email.

*Scritto dall'AD. Baseline numeri: [[STATO]] · Azioni: [[AZIONI-IN-ATTESA]] · Decisioni: [[DECISIONI]].*
