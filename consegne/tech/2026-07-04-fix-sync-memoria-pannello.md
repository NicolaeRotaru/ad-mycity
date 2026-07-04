---
data: 2026-07-04 14:50
tipo: consegna-tech
tema: sync memoria → Pannello/AD
colore: 🟡 (codice/infra, firmato da Nicola)
---

# Fix: perché il Pannello/AD non leggeva i commit mergiati — e la garanzia

## Il problema (causa radice)
Il Pannello legge la memoria **dal ramo `memoria-ad`** (via GitHub API, in tempo reale),
NON da `main`. Il ramo `main` è per il **codice**; `giro.sh` allinea a `memoria-ad`
**solo il codice**, mai le cartelle di memoria (`MyCity-Vault`, `consegne`, `creativi`,
`memoria-squadra`). Quindi ogni memoria mergiata su `main` (giri, radiografie, consegne
dei senior) finiva in un ramo che nessuno legge → **invisibile all'AD**.

Esempi reali stranded: 43 file (foglio-firma 5 punti, post/checklist Pane Quotidiano,
quaderni marketing/relazioni, auto-coscienza, radiografie, workstream bonifica di #179).
Recuperati a mano su `memoria-ad`.

## Vercel (chiarimento)
Non era il problema principale. Il codice del Pannello in produzione era già allineato a
`main`; l'auto-deploy di `main` non era rotto, solo in ritardo. La memoria si legge dal
vivo da `memoria-ad`, indipendentemente dal deploy.

## La garanzia (perché non ricapita)
1. **`forward-memoria.yml`** — ad ogni push su `main` porta automaticamente su `memoria-ad`
   le NUOVE consegne del push (solo aggiunte, mai sovrascrive gli snapshot del worker).
2. **`guard-memoria.yml`** — avvisa quando un PR mette memoria su `main` (strada giusta:
   base `memoria-ad`).
3. **`pannello/vercel.json`** — `deploymentEnabled.memoria-ad = false`: stop ai build
   inutili del worker.

Questo file stesso è il collaudo: nasce su `main` e deve comparire su `memoria-ad`
portato dall'auto-forward.
