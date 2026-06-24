# 🖥️ Pannello di Controllo — AD MyCity

App **Next.js** (deploy su Vercel) che è la **faccia** dell'AD digitale di MyCity.
Da qui Nicola vede tutto a colpo d'occhio e approva le azioni.

Fa parte della repo **`ad-mycity`** (monorepo): il "cervello" (vault + agenti) sta nella
radice, questo pannello in `pannello/`.

## Cosa mostra
- 🟢🟡🔴 **Coda da approvare** — le azioni che l'AD/senior hanno pronto (`AZIONI-IN-ATTESA.md`).
- 📋 **Attività & briefing** — ultimi giri, Sala Operativa, decisioni.
- 📊 **Stato & numeri** — `STATO.md` + cockpit KPI (ordini, incassi, clienti…).
- 🧩 **Piani** — i piani del vault (`06-Piani/`, `PIANO.md`).
- 💬 **Chat** con l'AD e i senior, **diario**, **lavori del cervello**.

## Come legge/scrive
- **Memoria viva** del vault via **GitHub API** (`OBSIDIAN_*`, vedi
  `MyCity-Vault/90-Memoria-AI/Collegamento-AD.md`).
- **Comandi e approvazioni** via la tabella Supabase `lavori`, eseguita da `cervello/worker.ps1`.

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
