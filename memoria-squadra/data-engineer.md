---
tipo: quaderno-memoria
reparto: data-engineer
---

# 🧠 Quaderno di data-engineer
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- 2026-07-20 20:16 · PostHog chiuso — Nicola «ok è diventato verde» · atteso: confermare chiusura entrambe superfici · reale: VPS **ok** · Pannello `/api/diagnosi` **verde** 20:16 — setup US 495230 `phx_` su VPS+Vercel; residuo opzionale Render tracking · L-416 · #posthog #vercel #pannello #chiuso #esito
- 2026-07-20 20:11 · PostHog «ricontrollato Vercel» — Nicola terzo round · atteso: chiudere collegamento Pannello · reale: VPS **ok** · Pannello giallo — messaggio generico insufficiente; **PR #502** diagnosi env mancante in Radiografia · L-415 · #posthog #vercel #pannello #esito
- 2026-07-20 20:01 · PostHog redeploy Vercel — Nicola «fatto redeploy ma non funziona» · atteso: capire perché Radiografia ancora gialla · reale: VPS **ok** · Pannello `/api/diagnosi` **giallo** 20:01 — redeploy insufficiente se manca `POSTHOG_PROJECT_ID` 495230, `phc_` vs `phx_`, host EU; checklist 3 env · L-414 · #posthog #vercel #pannello #esito
- 2026-07-20 18:48 · PostHog «ancora scollegata» — Nicola screenshot Radiografia · atteso: capire quale superficie · reale: VPS **ok** (18:45) ma Pannello legge env **Vercel** — servono `POSTHOG_HOST`+`POSTHOG_PROJECT_ID` **495230**+`POSTHOG_API_KEY` + redeploy; non confondere con worker · L-411 · #posthog #vercel #pannello #sensori #esito
- 2026-07-20 18:44 · PostHog US host fix — Nicola «si è us.posthog» · atteso: chiudere 401 senza rigenerare chiave · reale: host EU→US in env VPS + restart → `posthog_api: ok`; chiave `phx_` era valida; allineare Render se serve · L-410 · #posthog #us #sensori #esito
- 2026-07-20 18:41 · PostHog «ho fatto tutto» — Nicola env ok ma sensori no · atteso: verifica live, non ripetere passi · reale: env letto (`phx_`, host europeo) ma API **401** → `posthog_api: cieco`; causa vera = account US (L-410) · L-409 · #posthog #401 #sensori #esito
- 2026-07-20 18:28 · PostHog VPS follow-up — Nicola «metterlo sul vps come n8n» · atteso: disambigua Docker vs env · reale: stesso pattern L-406 — cloud + 3 righe env worker, self-host scartato; pendente chiave `phx_` · L-404 evidenze++ · #posthog #n8n #vps #esito
- 2026-07-20 18:24 · PostHog VPS — Nicola «come inserisco posthog nel vps?» · atteso: chiarimento architettura + passi env · reale: non self-host — cloud EU; VPS chiave lettura `phx_` (non `phc_`); sensore non_configurato dal 5/7; verifica `verifica-sensori.mjs`; pendente Nicola incolla chiave · L-404 · #posthog #sensori #vps #esito
- 2026-07-19 14:20 · metabolizzazione chat allowlist MCP Supabase · atteso: lezione L-285 + aggiornamento coda #abilita-mcp-supabase-chat · reale: STATO/DECISIONI/AZIONI/LEZIONI-CHAT/apprendimento aggiornati; Nicola chiede righe esatte, pendente incolla VPS · L-285 · #mcp #allowlist
- 2026-07-14 03:31 · Sensori salute-sensori-dati — PR #377 · atteso: pipeline sensori verificata a ogni giro, errori fantasma eliminati · reale: fonti web nel giro, sentinel occhi, auto-clear su ok, 0 findings post-scan; PostHog spento = scelta Nicola non bug · L-222 · #sensori #fonti-web #esito
- 2026-07-01 · giro web · PostHog (2026-05-01): shift agent-first — MCP come interfaccia dati; CEO afferma che la maggioranza dei dashboard creati la sett. scorsa era via agenti (AI/MCP/API/wizard), trend MCP in crescita · https://posthog.com/blog/posthogs-next-chapter · lezione: eventi PostHog devono restare schema pulito e documentato perché agenti AD li interrogano; numeri citati dal blog PostHog, non verificati su istanza MyCity · #posthog #mcp #tracking
