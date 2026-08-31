---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-31 21:05
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata perché era ferma al 28/8 (oltre i 2 giorni della regola AR-030).
>
> Business fermo: 1 ordine, mai pagato, del 24/6. 0 pagati. Stallo **68 giorni**.
>
> Due cose nuove. Il bug del catalogo vuoto è riparato (#857), ma il sito resta giù da 9 giorni:
> le tre carte qui sotto restano senza firma. E la scadenza che avevi fissato tu, il 29 agosto,
> è passata da due giorni — dimmi se vuoi che ti porti il conto puntuale delle quattro cose.

---

## 🔴 IL SITO È GIÙ DA 9 GIORNI — stessa causa, mai risolta

- [ ] 🔴 **Il server che fa lavorare la macchina è fermo.**
  → Card `#168` (9 giorni fermo)
- [ ] 🔴 **Metti le tre chiavi mancanti su Vercel** (una fa sì che un pagamento riuscito diventi un
  ordine registrato).
  → Card `#154`
- [ ] 🔴 **Sposta il dominio `mycity-marketplace.com` su Vercel** (punta ancora a Render).
  → Card `#155`

---

## 🔴 NOVITÀ — database, pagamenti e la scadenza del 29 agosto

- [ ] 🔴 **La scadenza che avevi fissato tu (29 agosto) è passata da 2 giorni** — dimmi se vuoi
  il conto puntuale delle quattro cose o se hai già deciso diversamente.
  → Card `#185`
- [ ] 🔴 **Il database di produzione è indietro di 4 migrazioni** (126-129) — scegli fra
  accendere il cancello del rilascio o farle applicare a mano.
  → Card `#184`
- [ ] 🔴 **Pane Quotidiano non incassa da 18 giorni**, e alcuni post pronti in coda promettono
  ancora "ordina, ti portiamo" — un pagamento con carta fallirebbe davanti al primo cliente.
  → Card `#182`

---

## 🔴 MIGRAZIONI DATABASE FERME (bloccano vetrina e sicurezza dati)

- [ ] 🔴 Il segreto che applica le migrazioni prima di ogni pubblicazione.
  → Card `#160`
- [ ] 🔴 Migrazione 120 — la vetrina non deve più dare l'ID interno degli ordini.
  → Card `#159`
- [ ] 🔴 Migrazione 126 — il lotto dei cento difetti riparati.
  → Card `#158`
- [ ] 🔴 Le tre chiavi di Vercel + una parola, così in produzione ci va solo ciò che ha passato i controlli.
  → Card `#161`

---

## 🔴 DECISIONI CHE SOLO TU PUOI PRENDERE

- [ ] 🔴 **Il controllo che protegge il codice avvisa ma non ferma nessuno** — scegli fra tre strade
  (A: lascia com'è e conta i casi; B: obbligatorio ma tu puoi scavalcarlo — consigliata; C: obbligatorio
  e basta).
  → Card `#177`
- [ ] 🔴 **Otto richieste di unione ferme in coda**: dimmi quali mergiare e quali chiudere.
  → Card `#166`
- [ ] 🔴 **L'informativa privacy esce col nome «MyCity» e basta** — servono i dati veri del titolare.
  → Card `#165`
- [ ] 🔴 **Del database non esiste nessuna copia di sicurezza** — mancano due segreti per farla partire.
  → Card `#134`
- [ ] 🔴 **Un posto dove tenere una copia delle foto dei prodotti.**
  → Card `#162`

---

## 🟡 Decisioni rapide (una parola/un click bastano)

- [ ] 🟡 **Il pannello del negoziante ha 14 voci di menù**, e il tuo paletto dice «nessuna app
  nuova»: scegli quale delle due vale.
  → Card `#178`
- [ ] 🟡 **Ho tolto un permesso speciale rimasto in giro, morto** — solo da confermare.
  → Card `#176`
- [ ] 🟡 **Il sito scrive "spedizione gratis" e poi fa pagare 3 €** — decisione di prezzo, tua.
  → Card `#175`
- [ ] 🟡 **148 difetti sono chiusi con una prova che non può diventare rossa** — servirebbe una
  sessione dedicata a ridarle un morso vero.
  → Card `#172`
- [ ] 🟡 **Un post pronto per Pane Quotidiano** (pudding vaniglia, senza promessa di consegna) —
  aspetta solo il tuo via.
  → Card `#180`

---

## 🟡 CI rossa sul repo memoria/cervello (ad-mycity)

7 PR aperte: 5 rosse per colpa propria (`#855`, `#842`, `#841`, `#741`, `#735`), 1 verde pronta a
firma (`#858`), 1 ancora in corso (`#860`). Non riparabili da questa sessione: `test-cervello.mjs`
resta bloccato dall'allowlist Bash (stesso buco noto delle card #104/#42).

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

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire/mergiare lato AD,
> cure alla memoria) che non richiedono una TUA decisione — in tutto **89 card 🟡/🔴 aperte** (contate
> ora con grep, non stimate). Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]].
