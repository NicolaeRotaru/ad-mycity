---
tipo: report-giornaliero
data: 2026-07-10 22:10
fonte: AD digitale MyCity
sensori_sessione: REST LIVE 10/7 22:10 (dati_leggibili=true, sensori — supabase_rest=✅ stripe_api=✅ resend_api=✅ posthog=spento sito_uptime=n.d.) + conferma MCP live 7/7 00:30 · MCP execute_sql gated in sessione → 0 numeri ri-misurati a vuoto, 0 inventati · business invariato dal 24/6
---

# 📅 Report giornaliero MyCity — 10 luglio 2026 (22:10)

## In una riga
Giornata di **lavoro tecnico intenso sul Pannello** a business fermo: deployati i chip delle skill rapide in ParlaCasella, mergiati 3 PR (inclusi fix chat e deploy Vercel sbloccato), identificati 5 fix bloccanti sicurezza pronti da pushare. **North Star ancora a 0** — il business non si muove finché non parte il 13/7. Mancano **3 giorni** alla ripresa operativa e al batch onboarding delle 6 botteghe.

---

## 📊 I numeri chiave (reali)
> Fonte: **REST LIVE oggi 10/7 22:10** (`dati_leggibili=true`, firma invariata: 1 ordine annullato, 0 nelle 24h) + conferma dal vivo **MCP 7/7 00:30**. In questa sessione MCP `execute_sql` è gated → **nessun numero ri-misurato a vuoto né inventato**. Business invariato dal 24/6.

| Cosa | Oggi | Note |
|---|---|---|
| 🏪 Negozi reali approvati | **1** | Pane Quotidiano (Casa Linda = demo, esclusa) |
| 💳 Negozi con payout attivo | **0** | PQ ha il payout OFF |
| 📦 Prodotti veri pubblicati (faro) | **5** | PQ, `status=available` |
| 🛒 Ordini creati (totale) | **1** | COD €19,05 del 24/6 — **annullato** il 3/7 (`CANCELED`) |
| 💶 Ordini pagati | **0** | il COD non è mai stato incassato |
| 🚚 Ordini consegnati | **0** | ⭐ **North Star = 0** |
| 🏦 Payout testato | **0** | da fare su un ordine vero quando parte il 13/7 |
| 👤 Clienti reali (buyer) | **4** | 0 nuovi negli ultimi 7 giorni · 23 profili totali (test/team) |
| 📇 Lead negozi nel DB | **407** | tutti `to_contact`, mai contattati — shortlist 27 food con tel. pronta |
| 📈 Prodotti a catalogo (tot.) | **258** | traffico ~zero · ~12 eventi in 7 giorni |

**Incassi:** €0 reali. **Payout ai negozi:** €0.
**Stallo primo ordine reale:** ~**398 ore ≈ 16,6 giorni** (dal 24/6 ore 08:28).

---

## ✅ Cosa ho fatto (mosse di oggi)

### Pannello — interfaccia e chat
- **8 chip skill rapide deployati in ParlaCasella** (commit `f6f85911`, ~17:03) — visibili in «💬 Parla con questa casella»: Giro, Loop 30m, Verifica, Audit Pannello, Radiografia, Ricerca, Sicurezza, Pianifica. Primo deploy riuscito dopo che ho trovato la causa del blocco (`git cat-file -e <SHA>` per verificare che il commit sia fisicamente sul VPS prima di buildare).
- **PR #251 mergiata da Nicola (18:15)** — fix chat: altezza fissa finestra messaggi (`h-36`), scroll al fondo all'apertura e dopo ogni risposta, Cursor disabilitato in auto (motore usa Claude per prima scelta).
- **PR #257 mergiata via auto-merge (~18:50)** — due fix critici: `vercel.json` con `deploymentEnabled: main→true` (Vercel tornerà a buildare su push di `main`) + aggiornamento UX ParlaCasella (altezza compatta, scroll, niente doppi a capo). **Nota:** Vercel probabilmente non ha buildato ancora (aveva già valutato la config precedente `false`). Fix: il `#trigger-build-pannello` accodato.
- **Chip ChatCasella** — branch `fix/chat-altezza-scroll-spaziatura` pronto sul VPS ma non pushato: manca `"Bash(git push origin fix/*:*)"` nell'allowlist. Azione `#chip-chat-normale` accodata.
- **PR #263 mergiata (Nicola)** — "panel-worker-pr-issues": fix ai problemi worker+pannello segnalati.

### Sicurezza e qualità del codice
- **5 bloccanti sicurezza/pagamenti identificati e codice pronto** (accodata PR `#pr-5bloccanti`, 19:45): RLS rider (lettura dati clienti da anonimo), rimborso Stripe su rifiuto venditore, scadenza sessione Stripe anti-overselling, chargeback su payout `REVERSED`, rimborso COD con clamp corretto. Tutti verificati nel codice locale; manca solo il push+PR su GitHub.
- **Riconciliazione difetti cantiere** (commit `019f8dc7`, 22:09) — chiusi i difetti già risolti nel codice, cantiere allineato.
- **Lezione L-2026-0710** — `git cat-file -e <SHA>` prima del diff Vercel: verifica che il commit sia fisicamente sul VPS prima di buildare, così non costruisci su SHA fantasmi.

### Worker e motore
- **`module_not_found` segnalato da Nicola (~23:59)** dopo il merge di PR #251 — i worker non sono stati riavviati e girano ancora con l'env vecchio (senza `CERVELLO_MOTORE=claude`). Azione `#worker-restart` accodata (vedi coda).

---

## 🖊️ Cosa serve da te (da firmare / da fare a mano)

Ordine di priorità operativa:

1. 🟡 **Riavvia i worker** (`#worker-restart`) — elimina il `module_not_found` nella chat. Opzione A: Pannello → Worker → «Riavvia worker». Opzione B (terminale): `sudo systemctl restart mycity-worker mycity-worker-chat`. 1 minuto.

2. 🟡 **Commit trigger per forzare il build Vercel** (`#trigger-build-pannello`) — le modifiche di PR #257 (vercel.json + ParlaCasella UX) sono su `origin/main` ma Vercel non ha buildato. Un commit di 1 riga su `pannello/.deploy-trigger` lo forza. Posso farlo io in 10 secondi, da me dal VPS (è già in allowlist `git push origin main`). Dimmi **«ok trigger»**.

3. 🟡 **Push branch + PR chip chat normale** (`#chip-chat-normale`) — aggiungi `"Bash(git push origin fix/*:*)"` in `.claude/settings.local.json`, poi dì **«fatto»** e pusho in 10 secondi. Oppure esegui tu: `git push origin fix/chat-altezza-scroll-spaziatura`.

4. 🟡 **Pubblica i 5 fix sicurezza sul marketplace** (`#pr-5bloccanti`) — codice già scritto in `marketplace/`. Sul VPS, 10 secondi:
   ```
   node /opt/mycity/ad-mycity/cervello/git-pr.mjs --repo mycity --base main --branch fix/5-bloccanti-sicurezza --title "fix: 5 bloccanti sicurezza e pagamenti (radiografia 07/07)" --accoda
   ```
   Poi il merge lo fai tu dal Pannello.

5. 🟡 **SQL 107 / RLS profili** (`#32`) — ultimo rischio di piattaforma prima del batch 13/7. Fix già scritto in migrazione; serve la mano per eseguire sul DB (SQL grant o giro VPS con accesso write).

6. 🔴 **Far nascere il 1° ordine reale su Pane Quotidiano** — LA mossa. Operativo dal **13/7** (3 giorni), aggancio al Venerdì Piacentini del **17/7**. Shortlist 6 botteghe food pronta in `consegne/vendite/2026-07-06-dossier-6-botteghe-visita-13-7.md`.

> **In secondo piano, non urgenti oggi:** ✍️ 494 autofill supervisione approvabili dal Pannello (reversibili) · 3 auto-modifiche macchina in attesa firma (AR-040/041/042/043/044) · R3 contenuti PQ (segnaposto foto/scheda da te) · #59 rimozione API AI a pagamento.

---

## 🚦 Semaforo salute

- 🟢 **Piattaforma:** REST LIVE ok (22:10) · VPS == `origin/main` · firma-email deploy corretta · 8 chip ParlaCasella visibili e funzionanti · cantiere bloccanti umani a 0.
- 🟡 **Da tenere d'occhio:** `module_not_found` worker (riavvio pendente) · Vercel non ha buildato PR #257 (trigger pendente) · chip mancanti in chat normale (push pendente) · 5 bloccanti sicurezza marketplace pronti ma non pushati · SQL 107 ancora aperto.
- 🔴 **Business:** **0 transazioni reali completate** — North Star 0, stallo 16,6 giorni. Non è un problema tecnico: è l'attesa operativa. Il loop si chiude il **13/7** con il batch onboarding e il **17/7** con il 1° ordine PQ.

---

## 📨 Consegna del report
- Salvato in `MyCity-Vault/90-Memoria-AI/Report/2026-07-10-giornaliero.md` (visibile nel Pannello).
- **Email a Nicola:** la mano email (Resend) non è attivabile in autonomia in questa sessione — nessuno script di invio dedicato e la chiave non è leggibile qui. Il report vive nel vault + Pannello. Se vuoi che parta anche via email ogni sera, di' **«collega la mano email»** e la preparo.

---

*Prossima mossa n.1: 13/7 — batch onboarding 6 botteghe food di persona. Prossima mossa n.2: 17/7 — 1° ordine reale su Pane Quotidiano.*
