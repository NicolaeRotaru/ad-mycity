---
titolo: Setup del monitoraggio web continuo (Ondata 3) — handoff per builder-automazioni
data: 2026-06-27 20:10
autore: AD digitale
colore: 🟡
---

# 🔌 Monitoraggio web continuo — cosa collegare (handoff builder)

> Lo **scaffold è pronto e committato**. Manca solo accendere lo **scheduler** che lancia il
> motore a cadenza. Niente chiavi nuove a pagamento: usa la lettura web che l'AD ha già (WebSearch/WebFetch).

## I pezzi (già nel repo)
- **Registro fonti:** `cervello/radar-fonti.json` — 18 fonti reali di Piacenza con `cosa_cercare`,
  `cadenza` (giornaliera/settimanale) e `scrive_in` (quale file Intelligence aggiornare).
- **Motore:** `cervello/monitora.md` — il prompt che legge il registro, controlla le fonti DOVUTE
  oggi, scrive i file `90-Memoria-AI/Intelligence/*.md` e accoda le azioni reali.
- **Faccia:** schede Intelligence del Pannello (Concorrenti, Eventi & picchi, Buchi, Leve in uscita,
  Reputazione) — leggono quei file dal vault.

## Cosa deve fare builder (una sola cosa: schedularlo)
Il motore gira **come un giro**: stesso worker Max, stesso meccanismo di `cervello/giro.*`.
Scegli UNA delle due vie:

### Via 1 — Cron/schtasks (più semplice, 0 dipendenze)
Aggiungi un job che esegue il prompt una volta al giorno (mattino presto), sullo stesso pattern di
`cervello/giro.ps1`/`giro.sh`:
```
claude -p "$(cat cervello/monitora.md)" --permission-mode acceptEdits
```
- Linux (VPS, dove gira il worker): `cron` alle 06:30 → `cervello/monitora.sh` (clona giro.sh, cambia il file letto).
- Windows: `schtasks` giornaliero → `monitora.ps1` (clona giro.ps1).
Il motore si auto-limita: di giorno fa solo le fonti "giornaliera"; le "settimanale" le fa quando
sono passati ≥7 giorni (lo capisce dalla data in cima ai file Intelligence). Nessun doppione.

### Via 2 — n8n (se vuoi orchestrare da n8n)
1. **Schedule Trigger** (cron 06:30) →
2. **HTTP Request / Execute Command** che mette in coda un lavoro "monitoraggio" nella tabella
   Supabase `lavori` (stesso payload dei "giri"): il worker Max lo prende ed esegue `monitora.md`.
   In alternativa, nodo **Execute Command** diretto col comando `claude -p` qui sopra.
3. (Opzionale) **Webhook** `N8N_WEBHOOK_URL` per lanciarlo a mano dal Pannello.

## Chiavi/ambiente
- ✅ **Nessuna chiave nuova a pagamento.** La lettura web la fa l'AD (Max) con WebSearch/WebFetch.
- Servono solo quelle che il worker ha già: `SUPABASE_URL`+`SUPABASE_SERVICE_KEY` (memoria, per scrivere il vault)
  e, se vuoi i picchi incrociati coi dati interni, `MARKETPLACE_SUPABASE_*` (sola lettura).
- Per le AZIONI reali che il monitoraggio accoda (scrivere a un giornalista/ente): restano 🔴 firma di Nicola,
  partono dalle "mani" già descritte in `cervello/collega-le-mani.md`.

## Come verificare che funziona
1. Lancia a mano: `claude -p "$(cat cervello/monitora.md)" --permission-mode acceptEdits`.
2. Controlla che i file `90-Memoria-AI/Intelligence/*.md` abbiano la data di oggi in cima.
3. Apri il Pannello → Intelligence & opportunità → le schede mostrano i dati freschi.

> 🟢 leggere/scrivere note = automatico · 🟡/🔴 le azioni reali sul mondo restano da firmare.
> Quando builder ha schedulato, l'Ondata 3 passa da "a richiesta" a "continua".
