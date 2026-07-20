## Summary
- **PostHog tracking sito:** default e blueprint Render passano da host **EU** a **US** (`https://us.i.posthog.com`), allineati a VPS + Pannello (account US, project 495230).

## Perché
Eventi del marketplace andavano al server europeo mentre lettura/analytics usa account **US** — numeri e funnel non coincidono (residuo L-416).

## Come provare
1. Mergia la PR → Render fa deploy automatico su main (~5 min).
2. Su Render → Environment: se c’era **`NEXT_PUBLIC_POSTHOG_HOST`** con `.eu`, sostituisci con `https://us.i.posthog.com` (o elimina la riga: il codice usa già US).
3. Visita il sito con consenso analytics → in PostHog US vedi `$pageview` in tempo reale.
4. Radiografia Pannello resta verde; eventi sito e numeri letti dalla macchina stesso progetto.
