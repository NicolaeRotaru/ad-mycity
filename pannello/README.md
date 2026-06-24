# 🖥️ Pannello di Controllo — AD MyCity

App **Next.js** (deploy su Vercel) che è la **faccia** dell'AD digitale di MyCity.
Da qui Nicola vede tutto a colpo d'occhio e approva le azioni.

Fa parte della repo **`ad-mycity`** (monorepo): il "cervello" (vault + agenti) sta nella
radice, questo pannello in `pannello/`.

## Cosa mostra
**Memoria viva dell'AD** (`MemoriaViva`)
- 🟢🟡🔴 **Coda da approvare** — azioni pronte (`AZIONI-IN-ATTESA.md`), con **Approva/Rifiuta**.
- 📋 **Attività & briefing** · 📊 **Stato & numeri** (`STATO.md` + cockpit KPI) · 🧩 **Piani** (`06-Piani/`).

**Governo dell'AD** (`GovernoAD`)
- ⚖️ **Decisioni** (`DECISIONI.md`) con bottone **“spiegami perché”**.
- 📡 **Diretta agenti** — Sala Operativa + lavori in corso (`/api/agenti-live`).
- 🌊 **Feed attività** — timeline unica diario + lavori + squadra (`/api/feed`).
- ⏻ **Controllo** — **kill-switch** (ferma/riattiva l'AD) e **budget AI** (`/api/controllo`, tabella `impostazioni`).

**Intelligence & opportunità** (`Intelligence`)
- ⚠️ **Alert anomalie** sui dati reali (`/api/alert`) · ⚔️ **Concorrenti** · 📅 **Eventi & picchi** · 📦 **Buchi di mercato** (`/api/intelligence`).

**Numeri & report** (`NumeriReport`)
- 📈 **Trend & proiezioni** (`/api/metriche/trend`) · 🧮 **Unit economics** (`/api/metriche/unit`) · 🗂️ **Report** giornaliero/settimanale (`/api/report`).

**Altro:** 🔎 **ricerca globale** nel vault, 💬 **chat** (con **dettatura vocale**) e **lavori del cervello**, 📱 **PWA** installabile sul telefono.

## Come legge/scrive
- **Memoria viva** del vault via **GitHub API** (`OBSIDIAN_*`, vedi
  `MyCity-Vault/90-Memoria-AI/Collegamento-AD.md`).
- **Comandi, approvazioni, intelligence, report** via la tabella Supabase `lavori`, eseguita da `cervello/worker.ps1`.
- **Dati marketplace** (alert, trend, unit economics) in **sola lettura** (`MARKETPLACE_SUPABASE_*`).

## Tabelle Supabase memoria usate
`briefings`, `diario`, `lavori`, `conversazioni`, e **`impostazioni`** (chiave text unique, valore text, updated_at — per kill-switch/budget). Crea `impostazioni` se vuoi usare il Controllo:
```sql
create table impostazioni (
  id uuid primary key default gen_random_uuid(),
  chiave text unique not null,
  valore text,
  updated_at timestamptz not null default now()
);
```

## Avvio in locale
```bash
cd pannello
npm install
cp .env.example .env.local   # inserisci almeno ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

## Online (Vercel)
Punta il progetto Vercel alla repo `ad-mycity` con **Root Directory = `pannello`**,
imposta le variabili d'ambiente (vedi `.env.example`) e fai redeploy.

Dettagli completi in `LEGGIMI.md`.
