---
tipo: foglio-firma
data: 2026-07-03 20:15
tema: I difetti macchina che dipendono da Nicola (dopo lo sprint di riparazione)
---

# ✍️ Foglio-firma — i punti che restano tuoi

Lo sprint ha chiuso 74 difetti su 78. Questi sono gli ultimi, e li puoi fare solo tu.
Per ognuno: **cosa serve da te** (2 minuti) e **cosa faccio io dopo**.

---

## ✅ AR-091 — Memoria in sola lettura sul canale SQL — GIÀ FATTO (3/7)
Ho aggiunto `--read-only` alla connessione `supabase-memoria` in `.mcp.json`. Il cervello non può più
fare DROP/DELETE della memoria per errore; i salvataggi veri (briefing) passano da REST, non da qui. Nessuna azione tua.

## 🔴 AR-090 — Chiavi Supabase separate a privilegio minimo
**Problema:** oggi un'unica chiave `SUPABASE_ACCESS_TOKEN` (management, `sbp_`) serve entrambi i progetti.
Buona notizia: **NON è committata** (è una variabile d'ambiente, `${SUPABASE_ACCESS_TOKEN}`), quindi il rischio immediato è basso.
**Cosa serve da te (5 min):** su Supabase → Account → Access Tokens, crea (o ruota) il token e tienilo **solo** nell'ambiente
(VPS/Vercel), mai in un file. Se vuoi il massimo, crea 2 token distinti e dimmelo: preparo `.mcp.json` con due variabili separate
(`SUPABASE_TOKEN_MARKETPLACE` sola-lettura + `SUPABASE_TOKEN_MEMORIA`). *(Non l'ho fatto io perché rinominare le variabili
prima che tu crei i token spegnerebbe l'accesso Supabase della macchina.)*
**Cosa faccio io dopo:** aggiorno `.mcp.json` alle due variabili e chiudo AR-090.

## 🟡 AR-032 — Verdetto sullo STAMPO (i 42 senior)
Il collaudo è fatto: lo STAMPO è risultato **indifferente** sui 2 motori di soldi (baseline leggermente meglio).
**Cosa serve da te (5 min):** apri `consegne/collaudo/2026-07-03-collaudo-stampo.md`, guarda i 2 deliverable per Pane Quotidiano
(il **post di lancio** e la **checklist primo-incasso**) e dimmi: **ti piacciono? quale versione?**
**Cosa faccio io dopo:** scrivo il tuo verdetto nel TASTE-FILE, chiudo AR-032 e decido se tenere/alleggerire lo STAMPO.

## ⏸ AR-040 — PostHog
Rimandato da te a **dopo il 10/7** (serve l'abbonamento). Il sensore resta in pausa (`non_configurato`), non conta come cieco.
**Cosa faccio io dopo (dopo il 10/7):** collego PostHog e aggancio la sentinella "conversione checkout −X%".

## 🟡 AR-066 — Previsioni "status-quo" nella calibrazione (minore)
Alcune previsioni sono azzeccabili a costo zero (es. "negozio già payout-ready resta live"): gonfiano l'autonomia.
**Cosa serve da te:** nulla di urgente. Posso chiuderlo io con una regola automatica (una previsione con `atteso == stato attuale`
non dà punti autonomia). **Confermi che va bene questa regola?** → la applico e chiudo.
