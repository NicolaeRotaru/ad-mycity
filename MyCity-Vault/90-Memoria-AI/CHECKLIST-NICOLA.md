---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-12 22:43
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata dopo 2 giorni ferma (era al 10/8 11:20 — al limite della regola dei 2 giorni, AR-030).
> Business ancora **invariato**: 1 ordine totale (mai pagato, 24/6), 0 pagati, stallo **49 giorni**
> — pausa concordata con te fino al 24/8-1/9, non è churn. Riverificato dal vivo su Supabase adesso.
> Nel frattempo il VPS ha avuto un guasto di allineamento git (due giorni fermo) — risolto stasera,
> non richiede più nulla da te su questo punto specifico.

---

## 🔴 DECISIONE PIÙ VECCHIA E A PIÙ ALTO RITORNO

- [ ] 🔴 **Ordine di prova su Pane Quotidiano: resta "dentro" la pausa fino a settembre, o lo fai "fuori" adesso?** Costa 3-5€ di pane, due minuti dal telefono — è l'unica cosa che dimostra che il pagamento e la consegna funzionano davvero. Ferma da **15 giorni** senza risposta.
  → Card: `#ordine-test-dentro-o-fuori-dalla-pausa`

---

## 🟡 DECISIONI TECNICHE (GitHub)

- [ ] 🔴 **Pulizia dei 447 rami vecchi su GitHub** — quasi tutti hanno già la loro PR mergiata, sono solo rumore; due vanno recuperati prima di cancellare il resto
  → Riga #7 nella tabella di [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Come chiudere le PR: squash con riallineamento automatico, o merge normale?** Oggi il merge in squash a volte fa "morire" le altre PR aperte sulla stessa base
  → Riga #8 nella tabella di [[AZIONI-IN-ATTESA]]

- [ ] 🟡 Chiudi **PR #422** su GitHub (vecchia, con conflitti — non serve più)
  → Card `#chiudi-pr-422`

- [ ] 🔴 Mergia (se non l'hai già fatto) le PR di memoria/fix ferme: **#677, #679, #680, #681, #683** — non riverificabile da questa sessione (GitHub bloccato in chat).

---

## 🟡 DECISIONI RAPIDE (una parola basta)

- [ ] 🟡 **Il permesso "jolly" nei permessi della macchina va tolto?** Oggi la macchina può eseguire *qualunque* programma finisca nella sua cartella `cervello/`. L'elenco esplicito dei 70 programmi veri è già pronto (`consegne/sicurezza/2026-07-29-permessi-senza-jolly.md`). Dimmi «fatto» quando l'hai incollato.
  → Card: `#permessi-senza-jolly`

- [ ] 🟡 **Telegram lo vuoi acceso o lasciamolo spento?** Oggi è spento e basta.
  → Card: `#sensori-spenti-senza-motivo`

- [ ] 🔴 **Apri il Pannello in una finestra in incognito, senza login, e dimmi cosa vedi (30 secondi).** Se si apre senza chiederti nulla, c'è una falla di sicurezza vera.
  → Card: `#radiografia-serratura-pannello`

- [ ] 🟡 **Da quale piano rivedo prima?** Nove dei tuoi dieci piani hanno frasi smentite dai fatti (bando chiuso dato per aperto, negozio-faro sbagliato, commissione 12% invece di 10%). Ordine proposto: ① Piano Vendite ② Piano Istituzionale ③ Piano Editoriale.
  → Card: `#piani-da-rivedere`

- [ ] 🟡 **Due comandi da lanciare sul server** per togliere dieci avvisi in inglese che compaiono in cima alle analisi (foglio permessi in forma vecchia). Comandi pronti in `consegne/sicurezza/2026-08-10-avvisi-permessi.md`.
  → Card: `#avvisi-permessi-nelle-analisi`

---

## 🟡 ENV & INFRA (sblocchi macchina, 5 minuti ciascuno)

- [ ] 🟡 **Aggiungi `BURN_MENSILE_EUR=302` in `cervello/vps/.env`** → riavvia il worker. Sblocca il calcolo del runway.
  ```bash
  echo "BURN_MENSILE_EUR=302" >> /opt/mycity/ad-mycity/cervello/vps/.env && sudo systemctl restart mycity-worker-chat.service
  ```
  → Card: `#burn-mensile-env`

- [ ] 🔴 **Ruota i 2 token GitHub trovati in chiaro nel config git del VPS.**
  → Card: `#ruota-pat-github`

---

## 🟡 Da valutare quando hai un minuto (non bloccanti)

- [ ] 🔴 **Accendi la sveglia intelligence** (bandi ore 7 + Telegram) — playbook e PR già pronti.
  → Card: `#accendi-intelligence-sveglia`

- [ ] 🟡 **Triage cantiere difetti** — 166 aperti, 341 chiusi: scegli fra tenerli tutti aperti, marcare i minori come "accettati", o tenerne un numero fisso alla volta.
  → Card: `#radiografia-triage-cantiere`

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire lato AD, cure alla memoria) che non richiedono una TUA decisione — sono lavoro che porto avanti io o i senior. Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]].
