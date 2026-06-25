# 🖥️ Pannello di Controllo — AD MyCity

Versione ridotta per **testare solo la chat AI**.
Niente Supabase, niente Stripe: serve una sola chiave.

## Cosa fa adesso (base "viva")
L'assistente non aspetta che gli scrivi: **lavora da solo**.
- ⏰ **Battito autonomo:** ogni ora (cron) fa un *giro di perlustrazione* —
  cerca sul web (concorrenti, trend, idee) e può analizzare il sito `mycity`
  (sola lettura) — poi ragiona e prepara un **briefing** con opportunità e
  **azioni proposte** (🟢 fa da solo · 🟡 ti avvisa · 🔴 serve la tua firma).
- 🧠 **Memoria:** salva ogni giro, così ritrovi cosa ha scoperto mentre eri via.
- ✅ **Tu approvi:** propone, non decide. Approvi le azioni dalla dashboard.
- 💬 **Chat con strumenti:** puoi sempre chiedergli qualcosa; usa ricerca web e
  analisi del sito.

Il piano completo e le regole sono in `PIANO.md` e `ARCHITETTURA.md`.

## I due database (separati — non confonderli)
- 📊 **Marketplace (dati reali):** il Supabase del sito mycity, in
  `MARKETPLACE_SUPABASE_URL` + `MARKETPLACE_SUPABASE_KEY` (sola lettura).
  L'assistente lo LEGGE per ordini/clienti/incassi (strumenti `dati_tabelle` e
  `dati_query`).
- 🧠 **Memoria:** un progetto Supabase DIVERSO, in `SUPABASE_URL` +
  `SUPABASE_SERVICE_KEY`, con la tabella `briefings`. Qui l'assistente SCRIVE.

## Obsidian (memoria del business)
Per collegare le note Obsidian (decisioni, idee, roadmap):
1. In Obsidian installa il plugin **"Obsidian Git"** e sincronizza il vault su un
   repository GitHub **privato** (es. `mycity-vault`).
2. Crea un token GitHub con accesso **Contents (read/write)** a quel repo.
3. Imposta `OBSIDIAN_REPO_OWNER`, `OBSIDIAN_REPO`, `OBSIDIAN_TOKEN` (vedi
   `.env.example`).
L'assistente potra' leggere le note (per contesto) e scriverne/aggiornarle.

## Per renderlo davvero "vivo"
1. **Memoria (Supabase):** crea il progetto memoria su supabase.com, poi una tabella:
   ```sql
   create table briefings (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz not null default now(),
     data jsonb not null
   );
   ```
   Metti `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` nelle variabili d'ambiente.

   Per la **memoria delle conversazioni** (ricordare e riprendere le chat, anche
   da un altro dispositivo) crea anche questa tabella nello stesso progetto
   memoria:
   ```sql
   create table conversazioni (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now(),
     titolo text not null default 'Conversazione',
     messaggi jsonb not null default '[]'::jsonb
   );
   ```
   Senza questa tabella le conversazioni restano salvate sul singolo dispositivo:
   funzionano comunque, ma non si sincronizzano tra dispositivi.
2. **Sveglia (cron):** è già in `vercel.json` (ogni ora). Imposta `CRON_SECRET`
   su Vercel così solo il cron può attivarlo. *(Nota: il piano gratuito di
   Vercel limita la frequenza dei cron — eventualmente passa a giornaliero.)*
3. Senza memoria/cron funziona comunque: premi **"Aggiorna ora"** per un giro.

## Avvio in locale (3 passi)
1. `npm install`
2. Copia `.env.example` in `.env.local` (il Pannello **non** usa le API Claude:
   nessuna chiave Anthropic. Il cervello gira su Claude Code / piano Max — vedi `cervello/`)
3. `npm run dev` → apri http://localhost:3000

## Online (Vercel)
Il repo e collegato a Vercel: ogni push su `main` pubblica il sito.
Il Pannello **legge e mostra** cio' che il cervello-Max salva in memoria; non genera
nulla via API. Per la memoria/chat:
1. Vercel → Project → Settings → Environment Variables
2. Aggiungi le variabili della **memoria** (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)
   e, se vuoi i dati reali, quelle del **marketplace** (`MARKETPLACE_SUPABASE_*`)
3. Fai **Redeploy**

## Riaggiungere Supabase e Stripe in futuro
Erano in `src/lib/` (supabase.ts, stripe.ts, tools.ts, runTool.ts) e
collegati nella route `src/app/api/chat/route.ts`. Sono stati rimossi
per testare l'AI in isolamento.
