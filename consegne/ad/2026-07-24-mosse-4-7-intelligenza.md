---
tipo: consegna
reparto: AD
data: 2026-07-24 02:00
colore: 🟡
titolo: Mosse 4-7 per rendere la macchina più intelligente — motori pronti + cablaggio
---

# 🧠 Mosse 4-7 — recupero per tema · salute onesta · roster come numero · percezione

> Seguito dell'analisi profonda. Le prime 3 sono già sul branch (con `giro.sh` cablato). Qui le 4-7:
> **3 motori costruiti e testati** sul branch `claude/improve-machine-accuracy-a3oucg`; la Mossa 5
> (sensore percorso-acquisto + runway) è specificata perché serve input infra/tuo.

## ✅ Cosa è GIÀ sul branch (motori, testati sui dati veri)

| File (NUOVO) | Mossa | Cosa fa · numero reale trovato |
|---|---|---|
| `cervello/recupero-memoria.mjs` | **4** | recupero delle lezioni per **TEMA** (BM25, zero deps) al posto di `head-8` posizionale. Provato: query «push git branch conflitto» → lezioni git/PR giuste; «microfono Brave» → lezione microfono. La lezione giusta affiora anche se non è la più recente. |
| `cervello/salute-onesta.mjs` | **6** | la serie **voto_pieno ONESTA** + burn-down cantiere. Reale ora: voto onesto **0 / trend PIATTO** (84/90 rilevazioni ferme a 0), cantiere **+5** (cresce, non va a zero). «Sto migliorando?» ha finalmente una risposta numerica. |
| `cervello/utilizzo-senior.mjs` | **7** | il roster come **numero**: **47/120** con almeno un esito (**39%**), **73 dormienti**. Top: frontend-dev 173, devops-sre 78, builder 71. Da elenco a dato misurato. |

Tutti sola lettura, `node --check` verde, provati sui dati reali. **Provali:**
```sh
node cervello/utilizzo-senior.mjs           # roster 47/120
node cervello/salute-onesta.mjs             # metro onesto fermo a 0, cantiere +5
node cervello/recupero-memoria.mjs "il tuo compito qui"   # lezioni per tema
```

## 🙋 Cablaggio (dove agganciarli) — 🟡

- **Mossa 4** → nel **worker.sh** (chat): al posto di `head -8` di LEZIONI-CHAT.md, chiama
  `node cervello/recupero-memoria.mjs "<messaggio di Nicola>" --k 8` — così le lezioni iniettate sono le
  **rilevanti** al tuo messaggio, non le più recenti. (È il file-cuore da 1500 righe: lo applica il worker VPS.)
- **Mossa 6** → (a) `auto-fix.mjs`/sonda registra `voto_pieno` come serie-KPI (già in `storico-salute.json`,
  basta esporla); (b) una **card Pannello** «Salute onesta» che legge `salute-onesta.mjs --json`; (c) sbloccare
  l'auto-radiografia completa (oggi la sentinella la chiede 76× ma non parte — degradarla a completa-leggera schedulata).
- **Mossa 7** → una **card Pannello** «Utilizzo Senior» che legge `utilizzo-senior.mjs --json` (mostra 47/120 +
  dormienti). Poi la decisione: congelare i dormienti in una «panchina» dichiarata (nucleo ~30-40).

> Le card Pannello sono lavoro **frontend-dev** (Next.js in `pannello/`): le espongo come spec, non le
> tocco da qui (stesso motivo dei file-cuore).

## 🔧 Mossa 5 — Percezione del percorso d'acquisto + rischi esistenziali (serve input)

La più infra-coupled: non l'ho costruita alla cieca perché ha bisogno di dati che non ho. Cosa serve e cosa fa:

1. **Sensore checkout** — una sonda in `verifica-sensori.mjs` che fa GET su `/checkout` (non solo la home) e
   legge i log errori di produzione (Supabase/Vercel). Oggi `sito_uptime` è solo un GET della home: un checkout
   rotto legge «sito ok» → cieca proprio sul percorso del 1° ordine pagato. **Serve da te:** l'URL del
   marketplace + la rotta reale del checkout.
2. **Runway** — accendere `BURN_MENSILE_EUR` (oggi cieco da 230 giri sul rischio n.1). 🔴 **Serve il tuo numero**
   (il burn ~302€/m è già in `registro-fatti`, basta metterlo in env VPS).
3. **PostHog: consumalo o ritiralo** — oggi è «ok» ma nessuno legge gli eventi comportamentali: vedi i conteggi
   (4 buyer, 0 pagati) ma non **dove** i 4 si fermano. Cablare 4 conteggi funnel (visto→carrello→checkout→pagato)
   in `sentinella-dati.mjs`, oppure metterlo `non_configurato` così «ok» smette di fingere un senso assente.

Dimmi **«fai la 5»** con l'URL checkout + il burn, e la costruisco e testo come le altre.

---
*Consegna AD · branch `claude/improve-machine-accuracy-a3oucg` · motori 4/6/7 live, Mossa 5 in attesa di input (🟡).*
