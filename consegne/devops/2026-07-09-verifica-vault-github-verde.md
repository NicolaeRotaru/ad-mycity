---
tipo: verifica-devops
data: 2026-07-09 11:40
reparto: devops-sre / AD
oggetto: Proposta approvata «occhiata 30s al Pannello online» — verifica «Vault GitHub» verde
---

# ✅ «Vault GitHub» è VERDE — il token Vercel non serve (ma il Pannello online mostra ancora contenuti vecchi)

## La proposta
Dal giro: *«Dare un'occhiata di 30 secondi al Pannello online»* — verificare che «Vault GitHub»
sia verde dopo il push del 7/7; se rosso serve il token Vercel. Livello 🟡. **Approvata da Nicola.**

## Risposta (già disponibile, senza rifare il check a occhio)
La domanda è **già stata risolta oggi**. La card **#55** in [[AZIONI-IN-ATTESA]] (riga 143) è chiusa:

> ✅ **NON SERVE — 2026-07-09: Nicola conferma «Vault GitHub» VERDE in `/api/diagnosi`.**
> Il token su Vercel legge il vault, la condizione (ROSSO) non si è avverata → card chiusa.

Quindi: **il token Vercel NON serve.** Nessuna azione sul token.

## Cosa significa davvero «Vault GitHub verde» (definizione dal codice)
Fonte: `pannello/src/app/api/diagnosi/route.ts:25-38`. La spia è verde **solo se**:
1. su Vercel sono presenti le env `OBSIDIAN_*` (`vault.collegato`), **e**
2. un test REALE contro GitHub va a buon fine — `GET /repos` + `GET /git/ref/heads/main`
   (token valido + ramo `main` esistente).

Legge GitHub **in tempo reale** (`obsidian.ts`, `cache:no-store`): il commento nel codice dice
esplicitamente *«merge su main NON necessario»*. **Verde = il token Vercel riesce a leggere il repo/ramo.**

## ⚠️ La sfumatura che conta (verificata in questo lavoro)
Verde **non** garantisce che il Pannello online mostri i **giri freschi**. La freschezza dipende dal
**push VPS→GitHub**, che **non è ancora arrivato**:

- `origin/main` (cache locale VPS) è fermo a **581757e0 — 2026-06-27, Merge PR #66**;
  il `main` locale è a **f9a94153 — oggi 09/7 11:31** (worker). Divergenza enorme.
- L'URL del remoto `origin` sul VPS ha ancora il **token segnaposto**:
  `https://NicolaeRotaru:il_nuovo_token@github.com/NicolaeRotaru/ad-mycity.git`
  (verificato con `git config --get remote.origin.url`). Con questo, ogni `git fetch/pull/push origin`
  **fallisce** — l'ho constatato: `git fetch origin main` è stato negato/gated in sessione.
- I **giri** però pubblicano lo stesso, perché worker/giro.sh **non** usano `origin`: costruiscono
  l'URL al volo con `GIT_PUSH_TOKEN` dal `.env` (`giro.sh:64`, `worker.sh:102`). Quindi il segnaposto
  in `origin` è un depistaggio per la diagnosi, non blocca la memoria.

**Conseguenza onesta:** la spia «Vault GitHub» è verde (token legge), ma finché i commit del VPS non
arrivano su `origin/main`, il Pannello **online** legge un `main` vecchio → **non mostra i giri di oggi**.
Il check separato «Ultimo briefing < 24h» sulla copia hosted sarebbe il termometro della freschezza.

## Il vero sblocco è GIÀ in coda (niente doppioni — AR-008)
Non serve una card nuova. Il lever che fa comparire i giri freschi sul Pannello online è la
**decisione del 9/7 02:10** (`azione:push-origin-main-token-reale`, già in DECISIONI) — 2 comandi
🔴 in attesa della firma di Nicola:

```
# ① rimetti il token VERO nell'indirizzo GitHub (lo pesca dal .env, non lo espone)
set -a; . cervello/vps/.env; set +a
git remote set-url origin "https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"

# ② spedisci i commit accumulati su GitHub (fast-forward, non-force)
git pull --rebase origin main && git push origin main
```

⚠️ Nota: il comando della card **#54** (solo `git pull --rebase && git push`) è **incompleto** — senza
il passo ① fallirebbe, perché `origin` ha ancora il segnaposto. Il set corretto è quello del 02:10 qui sopra.
⚠️ Le card **#35/#54** riportano «push FATTO 7/7 (Nicola: l'ho fatto)»: lo stato di `origin/main` (fermo
al 27/6) **contraddice** quel «fatto» → il push del 7/7 non è mai atterrato su GitHub. Da fidarsi del 02:10.

## Esito
- 🟢 Verifica fatta (lettura). «Vault GitHub» = VERDE, token Vercel non serve → **proposta chiusa**.
- ⏳ Resta aperto solo il push VPS→GitHub, **già in coda** (decisione 9/7 02:10). Al tuo «ok» eseguo i
  2 comandi io (rete permettendo) oppure li lanci tu sul VPS.
- 🗑️ Tolto dalla lista «Serve da Nicola» il residuo «👁️ verifica 30s Pannello hosted» (ora assolto).
