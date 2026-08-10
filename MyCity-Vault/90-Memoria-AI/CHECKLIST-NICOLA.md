---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-10 11:20
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata dopo 6 giorni ferma (era al 4/8 12:00 — violava la regola dei 2 giorni, AR-030).
> Business ancora **invariato**: 1 ordine totale (mai pagato, 24/6), 0 pagati, stallo **47 giorni**
> — pausa concordata con te fino al 24/8-1/9, non è churn. Riverificato dal vivo su Supabase adesso.
> Due voci della checklist precedente sono già chiuse e tolte da qui: `#macchina-ferma-da-quattro-giorni`
> (✅ 4/8 12:20) e `#prevenzione-a-monte` (✅ 4/8 17:26).

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

- [ ] 🟡 **Il permesso "jolly" nei permessi della macchina va tolto?** Oggi la macchina può eseguire *qualunque* programma finisca nella sua cartella `cervello/`. L'elenco esplicito dei 70 programmi veri che sostituisce il jolly è già pronto (`consegne/sicurezza/2026-07-29-permessi-senza-jolly.md`), da incollare in `.claude/settings.json`. Dimmi «fatto» quando l'hai incollato.
  → Card: `#permessi-senza-jolly`

- [ ] 🟡 **Telegram lo vuoi acceso o lasciamolo spento?** Oggi è spento e basta. Se dici «acceso» ti do l'unica riga che serve; se dici «spento» lo scrivo come tua decisione e non te lo richiedo più.
  → Card: `#sensori-spenti-senza-motivo`

- [ ] 🔴 **Apri il Pannello in una finestra in incognito, senza login, e dimmi cosa vedi (30 secondi).** Se si apre senza chiederti nulla, c'è una falla di sicurezza vera. Se ti chiede l'accesso, Vercel ti sta già proteggendo. Non sono riuscito a verificarlo da solo in nessuna delle ultime sessioni: serve il tuo occhio.
  → Card: `#radiografia-serratura-pannello`

- [ ] 🟡 **Ordine di prova su Pane Quotidiano: resta "dentro" la pausa fino a settembre, o lo fai "fuori" adesso?** Costa 3-5€ di pane, due minuti dal telefono — è l'unica cosa che dimostra che il pagamento e la consegna funzionano davvero, non è una spinta commerciale. Nessuna urgenza: resta "dentro" finché non dici diversamente.
  → Card: `#ordine-test-dentro-o-fuori-dalla-pausa` (la stessa domanda, stesso testo di prima — non l'hai ancora risposta)

---

## 🟡 ENV & INFRA (sblocchi macchina, 5 minuti ciascuno)

- [ ] 🟡 **Aggiungi `BURN_MENSILE_EUR=302` in `cervello/vps/.env`** → riavvia il worker. Sblocca il calcolo del runway (oggi il sensore-cassa segna "sconosciuto").
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

- [ ] 🟡 **Triage cantiere difetti** — 161 aperti, 332 chiusi: scegli fra tenerli tutti aperti, marcare i minori come "accettati", o tenerne un numero fisso alla volta.
  → Card: `#radiografia-triage-cantiere`

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire lato AD, cure alla memoria) che non richiedono una TUA decisione — sono lavoro che porto avanti io o i senior. Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]].
