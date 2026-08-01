---
tipo: quaderno-memoria
reparto: qa
---

# 🧠 Quaderno di qa
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-08-01 12:50 · smoke post-#19 ruoli acquisto in prod — consegne/qa/2026-07-04-smoke-ruoli-acquisto-post19.md, registrato in ritardo il 1/8 · 0 test eseguiti su 9, in 28 giorni · atteso non dichiarato allora: prima di quel lavoro nessuno registro una previsione, ed e la prima cosa che manca → reale la verifica STATICA fu fatta bene (due strati di enforcement letti riga per riga: middleware pagine e guard API) e lo script e pronto; ma dei 9 test nessuno e mai partito — i 5 anonimi bloccati dall uscita di rete del sandbox, i 4 autenticati fermi ai cookie che servono a Nicola. In piu il mirror locale del marketplace era indietro rispetto a #19, quindi nemmeno la conferma statica valeva. Lezione: uno smoke «pronto da eseguire» che nessuno lancia e indistinguibile da uno mai scritto — la parte anonima poteva girare dal VPS lo stesso giorno · #smoke #ruoli #loop-in-ritardo
- 2026-07-01 01:57 · radiografia marketplace · 46 confermati · casi E2E prioritari post-audit: checkout multi-negozio non atomico COD, stessa maglietta 2 taglie rifiutata, orari negozio chiuso solo su COD non carta, flash «carrello vuoto» · lezione: suite Playwright deve coprire i 4 bloccanti prima del live · #radiografia #e2e #checkout
- 2026-07-01 · giro web · Playwright 2026: web-first `await expect()` (auto-retry), locator `getByRole`/`getByLabel` prima di CSS/XPath, `storageState` + setup project per auth una tantum · https://qaskills.sh/blog/playwright-testing-best-practices-2026 · lezione: suite E2E checkout MyCity deve evitare `waitForTimeout` e login ripetuto; fonte blog community (non docs.playwright.dev in questo giro) · #playwright #e2e #flaky
