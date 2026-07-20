---
tipo: playbook-intelligence
reparto: intelligence
data: 2026-07-20 12:00
---

# Accendi intelligence — 3 passi

## Stato oggi (20/7 mezzogiorno)

- Scan completo **già fatto stamattina** (perlustrazione 20/7 + 3 file Intelligence aggiornati alle 11:35).
- **Mancava la sveglia automatica**: ora c’è l’agenda giornaliera nel giro + workflow n.41 non più stub.

## Passo 1 — Sveglia bandi (workflow n.41) 🔴

1. In n8n: importa `consegne/automazioni/n8n/workflows/41-09-intelligence-01-rss-bandi-comune.json`
2. Aggiungi variabili `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` in n8n
3. Esegui **Test workflow** (non Active): deve filtrare bandi da feed Artigiani/Unione/PiacenzaSera
4. Se il messaggio è ok → **Active** (parte alle 7:00)

## Passo 2 — Avvisi card + intelligence (workflow n.31) 🔴

1. Importa workflow n.31 (card Da approvare → Telegram)
2. Stesse chiavi Telegram del passo 1
3. Collega webhook Pannello → risolve le **64 card non inviate** oggi

## Passo 3 — Monitoraggio continuo 🟢 (già sul VPS)

- Timer `mycity-monitora` legge `cervello/monitora.md` sulle fonti **dovute oggi**
- Nuovo script `node cervello/intelligence-agenda.mjs` dice al giro quali fonti controllare (senza sprecare AI)
- Opzionale dopo: chiave **Firecrawl** sul worker per siti Comune bloccati (403)

## Cosa cambia per Nicola

- **Prima:** intelligence solo se chiedi in chat o nel giro pesante
- **Dopo:** bandi alle 7 → Telegram · agenda ogni giro · monitora leggero in background
