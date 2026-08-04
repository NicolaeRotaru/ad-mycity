---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-04 12:00
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata dopo 5 giorni ferma (era al 30/7 06:30 — violava la regola dei 2 giorni, AR-030).
> Business ancora **invariato**: 1 ordine totale (mai pagato, 24/6), 0 pagati, stallo **41 giorni**
> — pausa concordata con te fino al 24/8-1/9, non è churn.

---

## 🔴 URGENTE — il fix è pronto, manca solo la tua conferma

- [ ] 🔴 **Hai già lanciato i 3 comandi sul server per far ripartire il giro?** Il timer che scrive i briefing automatici è stato fermo 5 giorni; la causa (uno spazio sbagliato in un file) è già corretta e mergiata stamattina alle 05:23. Se non l'hai già fatto, sul server:
  ```bash
  cd /opt/mycity/ad-mycity
  git stash push -u -m "giro delle 04 bloccato dallo spazio"
  git fetch origin main && git reset --hard origin/main
  sudo systemctl start mycity-giro.service
  ```
  → Card: `#macchina-ferma-da-quattro-giorni`

---

## 🟡 MERGE PR in attesa (solo click "Approva" — nessun rischio per il sito)

- [x] ~~Mergia PR #635~~ → **GIÀ FATTO**: era mergiata dal 30/7, la checklist lo dava ancora aperto per errore (verificato ora con `git log`, corretto in [[AZIONI-IN-ATTESA]] riga #6). Nessuna azione da te.

---

## 🟡 DECISIONI TECNICHE (GitHub)

- [ ] 🔴 **Pulizia dei 447 rami vecchi su GitHub** — quasi tutti hanno già la loro PR mergiata, sono solo rumore; due vanno recuperati prima di cancellare il resto (il lavoro della #598 non è mai arrivato su main)
  → Riga #7 nella tabella di [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Come chiudere le PR: squash con riallineamento automatico, o merge normale?** Oggi il merge in squash a volte fa "morire" le altre PR aperte sulla stessa base (successo 12 volte su 200, un lavoro vero perso con la #598)
  → Riga #8 nella tabella di [[AZIONI-IN-ATTESA]]

- [ ] 🟡 Chiudi **PR #422** su GitHub (vecchia, con conflitti — non serve più)
  → Card `#chiudi-pr-422`

---

## 🟡 DECISIONI RAPIDE (una parola basta)

- [ ] 🟡 **Il permesso "jolly" nei permessi della macchina va tolto?** Oggi la macchina può eseguire *qualunque* programma finisca nella sua cartella `cervello/`. Ho già preparato l'elenco esplicito dei 70 programmi veri che sostituisce il jolly (`consegne/sicurezza/2026-07-29-permessi-senza-jolly.md`), pronto da incollare in `.claude/settings.json`. Dimmi «fatto» quando l'hai incollato.
  → Card: `#permessi-senza-jolly`

- [ ] 🟡 **I due freni nuovi (lezioni giuste all'inizio + mano fermata su un errore già noto) sono pronti ma spenti.** Servono due aggiunte in `.claude/settings.json` (istruzioni esatte nella card).
  → Card: `#prevenzione-a-monte`

- [ ] 🟡 **Telegram lo vuoi acceso o lasciamolo spento?** Oggi è spento e basta. Se dici «acceso» ti do l'unica riga che serve; se dici «spento» lo scrivo come tua decisione e non te lo richiedo più.
  → Card: `#sensori-spenti-senza-motivo`

- [ ] 🔴 **Apri il Pannello in una finestra in incognito, senza login, e dimmi cosa vedi (30 secondi).** Se si apre senza chiederti nulla, c'è una falla di sicurezza vera. Se ti chiede l'accesso, Vercel ti sta già proteggendo.
  → Card: `#radiografia-serratura-pannello`

- [ ] 🟡 **Ordine di prova su Pane Quotidiano: resta "dentro" la pausa fino a settembre, o lo fai "fuori" adesso?** Costa 3-5€ di pane, due minuti dal telefono — è l'unica cosa che dimostra che la macchina di pagamento funziona davvero. Nessuna urgenza: resta "dentro" finché non dici diversamente.
  → Card: `#ordine-test-dentro-o-fuori-dalla-pausa`

---

## 🟡 ENV & INFRA (sblocchi macchina, 5 minuti ciascuno)

- [ ] 🟡 **Aggiungi `BURN_MENSILE_EUR=302` in `cervello/vps/.env`** → restart worker. Sblocca il calcolo del runway.
  → Card: `#burn-mensile-env`

- [ ] 🔴 **Ruota i 2 token GitHub trovati in chiaro nel config git del VPS.**
  → Card: `#ruota-pat-github`

---

## 🟡 Da valutare quando hai un minuto (non bloccanti)

- [ ] 🔴 **Accendi la sveglia intelligence** (bandi ore 7 + Telegram).
  → Card: `#accendi-intelligence-sveglia`

- [ ] 🟡 **Triage cantiere difetti** — 159 aperti, 329 chiusi: scegli fra tenerli tutti aperti, marcare i minori come "accettati", o tenerne un numero fisso alla volta.
  → Card: `#radiografia-triage-cantiere`

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire lato AD, cure alla memoria) che non richiedono una TUA decisione — sono lavoro che porto avanti io o i senior. Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]].
