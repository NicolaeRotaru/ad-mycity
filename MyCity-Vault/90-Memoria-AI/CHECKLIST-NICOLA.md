---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-07-18 16:07
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata dal giro 18/7 16:07.

---

## 🔴 URGENTE OGGI/DOMANI

- [ ] 🔴 **Registrati su restart.infocamere.it per il bando PI26** — apre DOMANI 20/7 ore 10:00 a sportello. 50% fondo perduto, max €10.000 su spese tech da maggio 2026. Prima del 20/7: ① registrazione sul portale; ② lista fatture Supabase/Vercel/Render da maggio 2026; ③ firma digitale attiva. Bozza progetto pronta in `consegne/relazioni-istituzionali/`.
  → Card: `#bandi-cciaa-2007`

- [ ] 🔴 **Pubblica "Siamo in 23"** sui gruppi Facebook locali — post pronto in `consegne/content/2026-07-18-post-del-giorno-siamo-in-23.md`. Aggiorna il numero se cambiato. Aggiungi link UTM nel primo commento.
  → Card: `#post-siamo-in-23`

- [ ] 🔴 **Ruota i token GitHub trovati in chiaro** nel config git del VPS — vai su GitHub → Settings → Personal access tokens → revoca PAT attuali e crea uno nuovo.
  → Card: `#ruota-pat-github`

---

## 🟡 QUESTA SETTIMANA — mosse critiche per il 1° ordine

- [ ] 🟡 **Fai un ordine su Pane Quotidiano** — anche piccolo (es. pane €3-5). North Star 0→1. Apri mycity-marketplace.com e ordina. 10 minuti.
  → Card: `#ordine-test-pq`

- [ ] 🟡 **Manda 3 WhatsApp a Garetti, Peretti e Amendolara** — testi pronti in `consegne/vendite/2026-07-18-whatsapp-anchor-pi26.md`. Leva: bando PI26 urgente.
  → Card: `#whatsapp-3-anchor-pi26`

- [ ] 🟡 **Senti il fornaio (Pane Quotidiano)** — tel. 0523 388601. Script: «Com'è andata venerdì? Con le piogge in arrivo potremmo provare la consegna a domicilio questa settimana». Scopo: data per il 1° ordine + prezzo tazzina.
  → Card: `#checkin-pq-postvp`

- [ ] 🟡 **Pubblica post meteo-pioggia il 20/7** — piogge previste dal 20/7. Testo pronto in `consegne/content/2026-07-18-post-meteo-pioggia.md`.
  → Card: `#post-meteo-pioggia-20lug`

---

## 🟡 PR DA MERGIARE (Dal Pannello → Azioni → Da approvare)

- [ ] 🟡 **Mergia PR #446** — fix chat cross-device (smartphone vede chat vuota invece di quella desktop)
- [ ] 🟡 **Mergia PR #443** — 5 fix UX Pannello (riapprova in header, testo umano, scroll, flash, layout shift)
- [ ] 🟡 **Apri PR #chat-4bug-ux** (4 fix UX chat: scroll apertura, textarea sticky, triplicazione) — card `#apri-pr-chat-4bug-ux`
- [ ] 🟡 **Mergia PR `fix/mcp-cieco-no-casella-errore`** — rimuovi casella "Database non disponibile" (falso allarme) — card `#apri-pr-mcp-cieco`

---

## 🟡 ENV VPS — cose da aggiungere nel terminale

- [ ] 🟡 **Aggiungi BURN_MENSILE_EUR nel .env VPS** — es. `echo "BURN_MENSILE_EUR=150" >> /opt/mycity/ad-mycity/cervello/vps/.env && sudo systemctl restart mycity-worker-chat.service`. Sblocca il calcolo runway.
  → Card: `#burn-mensile-env`

- [ ] 🟡 **Riavvia il worker** (se non già fatto dopo le 2 variabili env del 18/7) — `sudo systemctl restart mycity-worker-chat.service`
  → Card: `#riavvia-worker-env`

---

## 🟡 DECISIONI OPERATIVE

- [ ] 🟡 **Definisci zona, orario e ordine minimo per la prima consegna** — 3 parametri: raggio (es. 3 km), fasce orarie (es. 12-14 / 18-20), ordine minimo (es. €10). L'AD li imposta poi.
  → Card: `#zona-orario-consegna`

- [ ] 🟡 **Tazzina espresso PQ** — quale tra i 2 candidati (Excelsa "Stile Siciliano" ~€31 set 6 o Ginori 1735 ~€55 singola)? + prezzo di vendita. La chiedi anche in chiamata a PQ.
  → Card: `#inserisci-tazzina-pq`

---

## 📧 Welcome email ai 23 iscritti (gate: PQ pronto)

- [ ] 🟡 **Invia welcome email ai 23 iscritti** via Gmail BCC — solo dopo conferma PQ operativo. Testo: `consegne/crm/welcome-email-23.md`.
  → Card: `#welcome-email-23`

---

## 🗃️ PULIZIA GITHUB

- [ ] 🟡 **Chiudi PR #422** su GitHub senza merge (conflitti, contenuto già in PR #424)
  → Card: `#chiudi-pr-422`

---

## ⏳ IN CODA MEDIA PRIORITÀ

- [ ] 🔴 **Post kefir** — `consegne/content/2026-07-14-post-del-giorno-kefir-caldo-PQ.md`. Serve: link lista d'attesa + foto.
  → Card: `#post-kefir-estate-1407`

- [ ] 🟡 **Approva autofill 252 prodotti "condizione=nuovo"** — reversibile, backup riga per riga
- [ ] 🟡 **Approva autofill 242 prodotti "unità=pezzo"** — stesso meccanismo
- [ ] 🟡 **Push memoria volano** — 2 push + PR `feature/volano-tasso-lezioni-blob`
  → Card: `#push-volano-fix`
- [ ] 🟡 **Fix email git** — 1 riga VPS: `git -C /opt/mycity/ad-mycity config user.email "nicolaflorea50@gmail.com"`
  → Card: `#fix-git-email`
- [ ] 🟡 **Streaming worker** (chat parola-per-parola come Claude.ai) — dal ok di Nicola
  → Card: `#streaming-worker`
- [ ] 🟡 **Thinking budget VPS** — alza THINKING_BUDGET nel .env worker
  → Card: `#thinking-budget-vps`

---

> Rimosso: PR #444 ✅ mergiata · PR #436 ✅ mergiata · PR #435 ✅ mergiata · PR #433 ✅ mergiata · housekeeping già su main ✅
