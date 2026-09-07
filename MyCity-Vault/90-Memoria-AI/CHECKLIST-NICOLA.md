---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-09-07 11:15
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata perché era ferma dal 5 settembre (oltre i 2 giorni della regola AR-030).
>
> Business fermo: 1 ordine, mai pagato, del 24/6. 0 pagati. Stallo **79 giorni**.
>
> Riverificato ora (sensori REST, eseguiti davvero in questo passaggio): le carte sotto restano
> confermate ancora aperte nei loro numeri di fondo (sito giù, dominio+chiavi Vercel, Pane Quotidiano
> senza incassi, main↔GitHub disallineati). Il resto dell'elenco (le card 🟡 "da valutare") non è
> stato riverificato voce per voce in questo passaggio. Se una risulta già chiusa, dimmelo e la tolgo.

---

## 🔴 IL SITO È GIÙ — dominio e chiavi Vercel

- [ ] 🔴 **Metti le due chiavi mancanti su Vercel** (una fa sì che un pagamento riuscito diventi un
  ordine registrato).
  → Card `#154`

- [ ] 🔴 **Sposta il dominio `mycity-marketplace.com` su Vercel** (punta ancora a Render).
  → Card `#155`

---

## 🔴 PANE QUOTIDIANO NON INCASSA — 29+ giorni

- [ ] 🔴 **Sblocca i pagamenti con carta di Pane Quotidiano.** Fermo da oltre un mese. Il 7/9 alle
  07:28 un cliente vero ha messo un prodotto nel carrello (€5, Pesto Genovese Bio) e non ha potuto
  completare l'acquisto: è il segnale più concreto finora di domanda reale sull'unico negozio attivo.
  → Card `#182`

- [ ] 🔴 **La scadenza che avevi fissato tu era il 29 agosto. È passata da oltre una settimana.**
  Dimmi se vuoi il conto puntuale delle quattro cose rimaste, o se hai già deciso diversamente.
  → Card `#185`

- [ ] 🔴 **Il database di produzione è indietro di 4 migrazioni** (126-129). Scegli fra accendere
  il cancello del rilascio o farle applicare a mano.
  → Card `#184`

---

## 🟡 IL RAMO DI LAVORO E GITHUB NON SI PARLANO PIÙ

- [ ] 🟡 **Il ramo main del VPS e quello di GitHub sono disallineati.** Centinaia di commit locali non
  sono mai stati spinti. Alcuni commit remoti non sono mai scaricati qui: probabilmente sono tue PR
  firmate. La distanza cresce da sola: più si aspetta, più rischioso diventa il riallineamento. Decidi
  se far intervenire ora qualcuno con accesso VPS diretto.
  → Card `#199`

- [ ] 🟡 **Il controllo che chiude bene un turno di lavoro è bloccato da giorni sullo stesso punto di
  partenza**, causa diretta della card #199.
  → Card `#200`

---

## 🔴 DECISIONI CHE SOLO TU PUOI PRENDERE

- [ ] 🔴 **Il controllo che protegge il codice avvisa ma non ferma nessuno.** Scegli fra tre strade:
  A, lascia com'è e conta i casi; B, obbligatorio ma tu puoi scavalcarlo, consigliata; C,
  obbligatorio e basta.
  → Card `#177`
- [ ] 🔴 **Otto o più richieste di unione ferme in coda**: dimmi quali mergiare e quali chiudere.
  → Card `#166`
- [ ] 🔴 **L'informativa privacy esce col nome «MyCity» e basta** — servono i dati veri del titolare.
  → Card `#165`
- [ ] 🔴 **Del database non esiste nessuna copia di sicurezza** — mancano due segreti per farla partire.
  → Card `#134`
- [ ] 🔴 **Un posto dove tenere una copia delle foto dei prodotti.**
  → Card `#162`

---

## 🟡 Un negozio finto nel database vero

- [ ] 🟡 **"Panificio Demo" è comparso nel database di produzione il 5/9 alle 6:40, origine ignota,
  zero ordini collegati.** Dimmi se lo riconosci o se posso cancellarlo.
  → Card `#196`

---

## 🟡 Decisioni rapide (una parola/un click bastano)

- [ ] 🟡 **Il pannello del negoziante ha 14 voci di menù**, e il tuo paletto dice «nessuna app
  nuova»: scegli quale delle due vale.
  → Card `#178`
- [ ] 🟡 **Il sito scrive "spedizione gratis" e poi fa pagare 3 €** — decisione di prezzo, tua.
  → Card `#175`
- [ ] 🟡 **148 difetti sono chiusi con una prova che non può diventare rossa** — servirebbe una
  sessione dedicata a ridarle un morso vero.
  → Card `#172`
- [ ] 🟡 **Un post pronto per Pane Quotidiano**: pudding vaniglia, senza promessa di consegna.
  Aspetta solo il tuo via.
  → Card `#180`

---

## 🟡 CI rossa sul repo memoria/cervello (ad-mycity)

**8 PR aperte non passano i controlli** (colpa propria del ramo che le ha portate, 0 ereditate da
`main`): `#865`, `#864`, `#860`, `#842`, `#841`, `#741`, `#735`. Non riparabili da questa sessione:
`test-cervello.mjs` resta bloccato dall'allowlist Bash (stesso buco delle card #104/#189).

---

## 🟡 Da valutare quando hai un minuto (non bloccanti)

- [ ] 🟡 **Metti la partita IVA vera nell'informativa privacy** — l'unico dato che non posso dedurre da solo.
  → Card `#39`
- [ ] 🟡 **Rimetti in funzione il comando "radiografia"** — rotto in due punti, riparabile in un branch.
  → Card `#41`
- [ ] 🟡 **246+ correzioni tue restano senza un freno che scatta da solo** — servirebbe rilanciare
  `gate-veri.mjs` da un canale con permessi più larghi.
  → Card `#95`
- [ ] 🟡 **Comunicato "I fornelli restano spenti"** per Pane Quotidiano — pronto, aspetta il via.
  → Card `#107`
- [ ] 🟡 **La riga di permesso mancante in `.claude/settings.local.json`** blocca ancora una decina
  di controlli automatici diversi (`test-cervello.mjs`, `esperimenti-check.mjs`, `sonda-volano.mjs`
  inclusi). Vuoi che venga applicata?
  → Card `#104`/`#189`/`#194`/`#195`/`#198`

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire/mergiare lato AD,
> cure alla memoria) che non richiedono una TUA decisione — in tutto **89 card 🟡/🔴 aperte** (contate
> ora con grep, non stimate). Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]].
