---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-07-31 08:35
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> **31/7 08:35 — aggiunta in cima una cosa nuova e più urgente di tutte le altre: il sito è giù da 24 ore.**
> Business ancora **invariato**: 1 ordine totale (annullato, 24/6), 0 pagati, stallo **37 giorni** — atteso,
> pausa concordata fino al 24/8-1/9.

---

## 🔴 URGENTISSIMO — il sito è giù da 24 ore

- [ ] 🔴 **`mycity-marketplace.com` risponde HTTP 503 da almeno 24 ore** (verificato in diretta stamattina). Il database è sano — è quasi certamente la migrazione Render→Vercel che avevi approvato il 20/7, partita a metà. Servono 3 controlli da 5 minuti: 1) dashboard Render — il servizio è sospeso/eliminato? 2) dashboard Vercel — c'è un progetto per il marketplace, è "Ready" o "Error"? 3) DNS del dominio — punta a Render o a Vercel? Rispondimi con cosa vedi e preparo il fix esatto.
  → Card: `#sito-503-render-vercel` · Report completo: [[consegne/devops/2026-07-31-sito-503]]

---

## 🔴 URGENTE — la cosa che resta

- [ ] 🔴 **Apri il Pannello in una finestra in incognito, senza login, e dimmi cosa vedi (30 secondi).** Se si apre senza chiederti nulla, c'è una falla di sicurezza vera (chiunque conosca l'indirizzo potrebbe dare ordini alla macchina) e va chiusa subito. Se ti chiede l'accesso, Vercel ti sta già proteggendo e non c'è nulla da fare.
  → Card: `#radiografia-serratura-pannello`

---

## 🟡 MERGE PR in attesa (solo click "Approva" — nessun rischio per il sito)

- [x] ~~Mergia PR #633~~ → GIÀ DENTRO main tramite la #634 (confermato 2026-07-30 12:00 con `git merge-base`); puoi chiuderla su GitHub senza merge quando ti capita, non urgente
- [x] ~~Chiudi PR #632~~ → superata dalla #633/#634, solo da chiudere su GitHub senza merge, non urgente
- [x] ~~Mergia PR #634~~ → GIÀ FATTA, confermato 2026-07-30 15:29 via `git merge-base --is-ancestor 82dd0525a origin/main` → sì
- [x] ~~Mergia PR #635~~ → GIÀ FATTA, confermata 2026-07-30 14:23 via `git fetch` (commit `595cf3cf0` in cima a `origin/main`, insieme alla #636 anche lei già dentro)
- [x] ~~PR #637/#638~~ → trovate già mergiate in questo passaggio (15:29, `git fetch`): lavoro interno di governo (sorvegliante del delta + chiusura loop @tech), nessuna azione tua richiesta
- [ ] 🟡 Chiudi **PR #422** su GitHub (vecchia, con conflitti — non serve più)
  → Righe #4–#6 nella tabella + card `#chiudi-pr-422` in [[AZIONI-IN-ATTESA]].

---

## 🟡 DECISIONI RAPIDE (una parola basta)

- [ ] 🟡 **Il permesso "jolly" nei permessi della macchina va tolto?** Oggi la macchina può eseguire *qualunque* programma finisca nella sua cartella `cervello/` — perché quella cartella se la scrive da sola. Ho già preparato l'elenco esplicito dei 70 programmi veri che sostituisce il jolly (`consegne/sicurezza/2026-07-29-permessi-senza-jolly.md`), pronto da incollare in `.claude/settings.json` (file che io non posso toccare da sola, apposta). Dimmi «fatto» quando l'hai incollato.
  → Card: `#permessi-senza-jolly`

- [ ] 🟡 **Telegram lo vuoi acceso o lasciamolo spento?** Nessuno te l'ha mai chiesto esplicitamente: oggi è spento e basta. Se dici «acceso» ti do l'unica riga che serve; se dici «spento» lo scrivo come tua decisione e non te lo richiedo più.
  → Card: `#sensori-spenti-senza-motivo`

---

## 🟡 ENV & INFRA (sblocchi macchina, 5 minuti ciascuno)

- [ ] 🟡 **Aggiungi `BURN_MENSILE_EUR=302` in `cervello/vps/.env`** → restart worker. Sblocca il calcolo del runway (fermo a "sconosciuto" da settimane — cassa Stripe letta, manca solo questo numero).
  → Card: `#burn-mensile-env`

- [ ] 🔴 **Ruota i 2 token GitHub trovati in chiaro nel config git del VPS.** GitHub → Settings → Developer settings → Personal access tokens → revoca quelli vecchi, crea uno nuovo se serve, aggiorna il remote.
  → Card: `#ruota-pat-github`

---

## 🟡 Da valutare quando hai un minuto (non bloccanti)

- [ ] 🔴 **Accendi la sveglia intelligence** (bandi ore 7 + Telegram) — utile per bandi *futuri*, non più per PI26 (chiuso).
  → Card: `#accendi-intelligence-sveglia`

- [ ] 🟡 **Triage cantiere difetti** — scegli fra tenerli tutti aperti, marcare i minori come "accettati", o tenerne un numero fisso alla volta (la mia raccomandazione: quest'ultima).
  → Card: `#radiografia-triage-cantiere`

> ⚠️ **Restano altre ~30 righe tecniche in coda** (fix di codice interno, PR da aprire lato AD, cure alla memoria) che non richiedono una TUA decisione — sono lavoro che porto avanti io o i senior. Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]].
