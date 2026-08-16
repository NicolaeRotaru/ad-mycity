---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-17 01:52
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata perché era ferma al 15/8 00:40 (oltre i 2 giorni della regola AR-030).
> Business ancora **invariato**: 1 ordine totale (mai pagato, 24/6), 0 pagati, stallo **54 giorni**
> — dentro la pausa concordata con te fino al 24/8-1/9, non è churn.
>
> ⚠️ **Autocorrezione in questo giro, la scrivo per onestà.** La prima stesura di questa checklist
> diceva "le card #36/#37/#38/#42 non esistono più nella coda". Era **sbagliato**. Le avevo cercate
> solo nel formato riga-di-tabella, cioè righe come `| 36 |`. Sono invece scritte come blocchi `###`.
> È un formato diverso che la Cabina legge comunque, ma che il mio grep aveva saltato. Sono tutte e
> quattro **ancora aperte**. Tutte e quattro sono accodate dal 29/7, 19 giorni senza una tua risposta.
> Le rimetto in cima, dove stavano.

---

## 🔴 IL BLOCCO VERO AL PRIMO INCASSO

- [ ] 🔴 **Fai finire a Pane Quotidiano la pratica dei pagamenti Stripe.** Oggi il negozio non può incassare: dati mai inviati, incassi disattivati, versamenti disattivati. Serve che il fornaio completi la pratica coi suoi dati (documento, azienda, conto per l'accredito).
  → Card `#62` in [[AZIONI-IN-ATTESA]]

---

## 🔴 SICUREZZA E SOLDI DEL MARKETPLACE — ferme da 19 giorni senza risposta

- [ ] 🔴 **Ripara il pulsante che venditore e rider usano per far avanzare un ordine.** Oggi dà errore sempre, per un campo cancellato a giugno che un controllo di sicurezza cerca ancora. Al primo ordine vero il negoziante non riesce ad accettarlo.
  → Card `#36` in [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Chiudi le 4 porte aperte su dati di negozi e clienti.** Liste negozi scrivibili senza login. Indirizzi clienti leggibili senza login. Venditori e rider auto-approvati alla registrazione. Dati di consegna modificabili senza login. Verificate una per una sul database vero: rischio violazione dati personali.
  → Card `#37` in [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Tappa i 5 punti dove il marketplace perde soldi da solo.** Doppia vendita dopo checkout scaduto. Coupon che si esauriscono sui tentativi e non sugli ordini. Il rider che può decidersi lo stipendio da solo. Il rider mai pagato sulla spedizione gratuita. Un reclamo che blocca il negozio per sempre.
  → Card `#38` in [[AZIONI-IN-ATTESA]]

---

## 🔴 RICHIESTE DI UNIONE (PR) DA FIRMARE — attenzione al colore

- [ ] 🔴 **NON mergiare ancora — PR #735** (CI rossa: 2/2 controlli falliti sul proprio ramo). Aspetta il verde.
  → Card `#89` in [[AZIONI-IN-ATTESA]]
- [ ] 🔴 **NON mergiare ancora — PR #741** (CI rossa: 2/2 controlli falliti sul proprio ramo).
  → Card `#106` in [[AZIONI-IN-ATTESA]]
- [ ] 🔴 **NON mergiare ancora — PR #749** (CI rossa: 2/2 controlli falliti sul proprio ramo).
  → Card `#111` in [[AZIONI-IN-ATTESA]]

> Sono le uniche 3 PR aperte oggi (confermato dal vivo con `ci-stato.mjs`). Nessuna PR è pronta da firmare in questo momento.

---

## 🟡 DECISIONI RAPIDE (una parola/un click bastano)

- [ ] 🟡 **Togli alla macchina il permesso di eseguire qualunque programma si scriva da sola** — nel foglio dei permessi ci sono due righe col jolly. L'elenco esplicito di 75 programmi veri è già pronto da incollare (`consegne/sicurezza/2026-07-29-permessi-senza-jolly.md`). Sbloccherebbe anche diversi comandi di controllo oggi bloccati in sessione chat.
  → Card `#42` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Quale definizione di "margine" è quella giusta?** Un commit del 16/8 mattina ha cambiato cosa significa `burn_down_margine` nel codice, ma il test che lo controlla dice ancora la versione vecchia — il test del cervello resta rosso finché non scegli quale dei due è quello giusto.
  → Card `#105` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Come vuoi procedere con le PR croniche rosse (#735/#741/#749)?** ① dedico una sessione a chiuderle per davvero, stesso ramo di ciascuna; ② le congelo fino a dopo la pausa negozi del 24/8-1/9.
  → Card `#109` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Va bene che la macchina resti in modalità RISPARMIO fino alla ripresa (24/8-1/9)?** Oggi spegne da sola contenuti pesanti/reel ed esperimenti non essenziali, tiene acceso ordini/consegne/firme/sicurezza.
  → Card `#113` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Il guardiano del primo ordine può imparare a riconoscere la pausa concordata?** Oggi dà sempre l'allarme rosso anche dentro la pausa che hai voluto tu. Se dici sì, preparo la modifica in branch + PR.
  → Card `#97` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Vuoi dedicare una sessione a bonificare tutti i 45 casi di un difetto tecnico nel motore del giro** (`cervello/giro.sh` nasconde alcuni errori dentro una pipe), o preferisci farli a piccoli gruppi?
  → Card `#114` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Apri il sito dal telefono** (`mycity-marketplace.com`) — il sensore lo vede spento (HTTP 503) dal 30/7, coerente con la migrazione a Vercel nota, ma nessuno l'ha mai riconfermato con un occhio umano.
  → Card `#79` in [[AZIONI-IN-ATTESA]]

---

## 🟡 Serve una mano sul VPS (le sessioni cloud non ci arrivano)

- [ ] 🟡 **Rimetti in moto le cadenze**: Piano del mattino/Report della sera fermi da 2-3 giorni, la review settimanale da 9 giorni. Serve una visita al worker sul server (o conferma se è già stato fatto).
  → Card `#77` / `#94` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Rigenera il registro delle prove del cantiere** (`cervello/cantiere-prove.mjs`) da un canale con permessi più larghi — 2 difetti aperti (AR-225, AR-346) hanno perso il comando che li verifica.
  → Card `#86` in [[AZIONI-IN-ATTESA]]

---

## 🟡 Da valutare quando hai un minuto (non bloccanti)

- [ ] 🟡 **Metti la partita IVA vera nell'informativa privacy** (oggi c'è un segnaposto) — l'unico dato che non posso dedurre da solo.
  → Card `#39` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Metti in sicurezza le anteprime del codice** (oggi usano le chiavi vere di Stripe e del database) prima che un fix ancora da approvare tocchi soldi o dati veri.
  → Card `#40` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Rimetti in funzione il comando "radiografia"** — oggi rotto in due punti, riparabile in un branch.
  → Card `#41` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Radiografia di te stessa scaduta** (oltre 5 giorni dall'ultima completa) — di' «radiografia di te stessa» quando vuoi che riparta.
  → Card `#92` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **246 correzioni tue su 311 restano senza un freno che scatta da solo** — servirebbe rilanciare `gate-veri.mjs` da un canale con permessi più larghi.
  → Card `#95` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Non so dire quante lezioni imparate abbiamo davvero applicato** (`tasso-lezioni.mjs` bloccato in sessione chat).
  → Card `#99` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Finisci di riparare i test rossi su PR #722** — non riverificato in questo giro se ancora attuale.
  → Card `#83` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Completa la mappa della macchina**: 65 skill nuove arrivate senza la loro riga di descrizione.
  → Card `#85` in [[AZIONI-IN-ATTESA]]

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire/mergiare lato AD, cure alla memoria) che non richiedono una TUA decisione. Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]] (righe-tabella + blocchi ###, entrambi i formati).
