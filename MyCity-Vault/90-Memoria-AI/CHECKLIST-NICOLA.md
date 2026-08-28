---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-28 12:35
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata perché era ferma al 24/8 13:15 (oltre i 2 giorni della regola AR-030).
>
> Business ancora **fermo**. 1 ordine totale, mai pagato, del 24/6. 0 ordini pagati. Stallo **65
> giorni**. Verificato ora con query dirette sul database, non da memoria.
>
> 🔴 **La cosa più urgente, e nuova rispetto al 24/8.** Il sito pubblico è di nuovo **giù (HTTP
> 503)** — l'ho verificato in diretta io stessa, 3 tentativi. Era su il 24/8, oggi no. La causa è
> sempre la stessa: le carte qui sotto restano senza firma da 6 giorni.

---

## 🔴 IL SITO È DI NUOVO GIÙ — stessa causa del 24/8, mai risolta

- [ ] 🔴 **Metti le tre chiavi mancanti su Vercel** (una fa sì che un pagamento riuscito diventi un
  ordine registrato).
  → Card `#154` in [[AZIONI-IN-ATTESA]]
- [ ] 🔴 **Sposta il dominio `mycity-marketplace.com` su Vercel** (punta ancora a Render, non più
  pagato dal 30/7).
  → Card `#155` in [[AZIONI-IN-ATTESA]]
- [ ] 🔴 **Il server che fa lavorare la macchina è fermo** — senza, niente giro può girare da solo.
  → Card `#168` in [[AZIONI-IN-ATTESA]]

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
  e basta). Nove modifiche col controllo rosso sono entrate lo stesso in tre settimane.
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

- [ ] 🟡 **Ho tolto un permesso speciale rimasto in giro, morto** — solo da confermare.
  → Card `#176`
- [ ] 🟡 **Il sito scrive "spedizione gratis" e poi fa pagare 3 €** — decisione di prezzo, tua.
  → Card `#175`
- [ ] 🟡 **148 difetti sono chiusi con una prova che non può diventare rossa** — servirebbe una
  sessione dedicata a ridarle un morso vero.
  → Card `#172`

---

## 🟡 CI rossa sul repo memoria/cervello (ad-mycity)

6 PR aperte, **tutte rosse per colpa propria** (nessuna ereditata da main): `#853`, `#852`, `#842`,
`#841`, `#741`, `#735`. Non riparabili da questa sessione: `test-cervello.mjs` resta bloccato
dall'allowlist Bash (stesso buco noto delle card #104/#42).

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
> cure alla memoria) che non richiedono una TUA decisione — in tutto **85 card 🟡/🔴 aperte** (contate
> ora con grep, non stimate). Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]].
