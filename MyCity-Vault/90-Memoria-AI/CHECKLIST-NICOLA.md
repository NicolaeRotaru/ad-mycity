---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-21 06:35
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata perché era ferma al 17/8 06:20 (oltre i 2 giorni della regola AR-030).
>
> Business ancora **invariato**. 1 negozio, Pane Quotidiano. 1 ordine, mai pagato, del 24/6. 0 ordini
> pagati. Stallo North Star: **58 giorni**. Siamo dentro la pausa concordata con te, fino al 24/8-1/9
> (3 giorni residui): non è churn.
>
> L'unico numero mosso da ieri: i profili sono 8, prima erano 7. È un account cliente nuovo. Non ha
> un negozio. Non cambia il business.

---

## 🔴 IL BLOCCO VERO AL PRIMO INCASSO

- [ ] 🔴 **Fai finire a Pane Quotidiano la pratica dei pagamenti Stripe.** Oggi il negozio non può incassare: dati mai inviati, incassi disattivati, versamenti disattivati.
  → Card `#62` in [[AZIONI-IN-ATTESA]]

---

## 🔴 SICUREZZA E SOLDI DEL MARKETPLACE — ferme da 23 giorni senza risposta

- [ ] 🔴 **Ripara il pulsante che venditore e rider usano per far avanzare un ordine.** Correzione pronta in branch locale, manca solo chi la porti su GitHub.
  → Card `#36` in [[AZIONI-IN-ATTESA]]
- [ ] 🔴 **Chiudi le 4 porte aperte su dati di negozi e clienti.** Liste negozi scrivibili senza login. Indirizzi clienti leggibili senza login. Venditori e rider che si auto-approvano da soli. Dati di consegna modificabili senza login.
  → Card `#37` in [[AZIONI-IN-ATTESA]]
- [ ] 🔴 **Tappa i 5 punti dove il marketplace perde soldi da solo.** Doppia vendita dopo checkout scaduto. Coupon che si consumano sui tentativi, non sugli ordini veri. Il rider può decidersi lo stipendio da solo. La spedizione gratuita non paga mai il rider. Un reclamo blocca il negozio per sempre.
  → Card `#38` in [[AZIONI-IN-ATTESA]]

---

## 🔴 DATABASE E SITO IN PRODUZIONE

- [ ] 🔴 **Firma le 4 migrazioni database (114-117).** Senza, i rimborsi restano rotti. Restano aperte anche 3 falle sul database di produzione. Elenco completo nella PR `ad-mycity#763`.
  → Card `#125` in [[AZIONI-IN-ATTESA]] — scrivi «ok 125»
- [ ] 🔴 **Il sito è giù da 22 giorni.** Servono 3 controlli di 5 minuti sul tuo Vercel/Render. Poi arriva il fix esatto, pronto da firmare. Runbook già scritto: `consegne/devops/2026-07-31-sito-503.md`.
  → Card `#127` in [[AZIONI-IN-ATTESA]]

---

## 🟡 CAUSA A MONTE — sblocca questa e liberi altri due blocchi

- [ ] 🟡 **Correggi 5 righe nelle tue regole di permesso (VPS).** È il motivo per cui il giro fallisce da quasi due settimane; oggi impedisce ANCHE la riparazione dei difetti del cantiere e il checkup di salute programmato.
  → Card `#104` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Rimetti in moto il checkup di salute** (fermo da 3 giorni sul server) — un comando solo da root.
  → Card `#126` in [[AZIONI-IN-ATTESA]]

---

## 🔴 COMUNICAZIONE ESTERNA — pronta, aspetta materiale tuo

- [ ] 🔴 **Comunicato di lancio pronto per un giornale — mancano 2 cose che solo tu puoi dare:** la tua citazione da fondatore (proposta già scritta) e una frase vera del titolare di Pane Quotidiano col suo ok a comparire con nome e cognome.
  → Card `#118` in [[AZIONI-IN-ATTESA]]
- [ ] 🔴 **Programma punti + gift card pronto da un mese, resta spento.** Parte solo quando arrivano 5 via libera già scritti: almeno 5 negozi veri, ordini pagati, Stripe in scrittura, la % di cashback firmata da te, un parere legale sulla gift card. Nessuna azione richiesta finché quei 5 non si sbloccano.
  → Card `#116` in [[AZIONI-IN-ATTESA]] (solo per conoscenza, non blocca nulla oggi)

---

## 🔴 SICUREZZA — token in chiaro

- [ ] 🔴 **Ruota i token GitHub trovati in chiaro nel config git del VPS** — accodata dal 17/7, 35 giorni senza risposta.
  → Card `#7` in [[AZIONI-IN-ATTESA]]

---

## 🔴 RICHIESTE DI UNIONE (PR) — NON mergiare, nessuna è pronta

Tutte e 7 le PR aperte oggi hanno la CI rossa per colpa propria (confermato dal vivo con `ci-stato.mjs`, 2026-08-21 06:26): `#791`, `#761`, `#754`, `#753`, `#749`, `#741`, `#735`. Nessuna tocca il marketplace live. Aspetta il verde prima di firmare qualunque merge.

---

## 🟡 DECISIONI RAPIDE (una parola/un click bastano)

- [ ] 🟡 **Togli alla macchina il permesso di eseguire qualunque programma si scriva da sola** — l'elenco esplicito di 75 programmi veri è già pronto da incollare.
  → Card `#42` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Quale definizione di "margine" è quella giusta?** Il test del cervello resta rosso finché non scegli.
  → Card `#105` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Come vuoi procedere con le PR croniche rosse?** ① sessione dedicata a chiuderle ② le congeli fino a dopo il 24/8-1/9.
  → Card `#109` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Va bene restare in modalità SOPRAVVIVENZA fino alla ripresa (24/8-1/9)?** Oggi la macchina tiene acceso solo ordini/consegne/coda firme/sicurezza, tutto il resto spento (quota AI oltre soglia + salute macchina bassa).
  → Card `#113` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Il guardiano del primo ordine può imparare a riconoscere la pausa concordata?** Oggi dà sempre l'allarme rosso anche dentro la pausa che hai voluto tu.
  → Card `#97` in [[AZIONI-IN-ATTESA]]

---

## 🟡 Serve una mano sul VPS (le sessioni cloud non ci arrivano)

- [ ] 🟡 **Rigenera il registro delle prove del cantiere** (`cervello/cantiere-prove.mjs`) da un canale con permessi più larghi.
  → Card `#86` in [[AZIONI-IN-ATTESA]]

---

## 🟡 Da valutare quando hai un minuto (non bloccanti)

- [ ] 🟡 **Metti la partita IVA vera nell'informativa privacy** (oggi c'è un segnaposto).
  → Card `#39` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Metti in sicurezza le anteprime del codice** (oggi usano le chiavi vere di Stripe e del database).
  → Card `#40` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Rimetti in funzione il comando "radiografia"** — oggi rotto in due punti.
  → Card `#41` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **246+ correzioni tue restano senza un freno che scatta da solo** — servirebbe rilanciare `gate-veri.mjs` da un canale con permessi più larghi.
  → Card `#95` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Avvisa il fornaio del circuito welfare gratis "Piacenza Pay"** — testo già pronto da inoltrare, zero rischio per MyCity.
  → Card `#120` in [[AZIONI-IN-ATTESA]]

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire/mergiare lato AD, cure alla memoria) che non richiedono una TUA decisione. Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]] (righe-tabella + blocchi ###, entrambi i formati).
