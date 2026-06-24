---
tipo: pipeline
fonte: AD digitale
---

# 🛒 MODIFICA IL MARKETPLACE PARLANDO — come funziona

> Dici all'AD cosa vuoi cambiare sul sito; lui sceglie la **corsia** giusta e lo fa. Due corsie:
> ⚡ **CONFIG** (subito, reversibile, senza deploy) · 🛠️ **CODICE** (anteprima → tuo ok → online).

## ⚡ Corsia CONFIG — subito e reversibile (NO deploy)
Per cambiare **aspetto e contenuti** già previsti dal sito: banner/logo/footer, home a blocchi, categorie,
coupon, pagine (FAQ/termini…), daily-drops, shop-of-month, sponsored.
- **Strumento:** `cervello/marketplace.mjs` (scrive su `site_settings` e tabelle del marketplace).
- **Sicurezza:** prima di scrivere **salva un backup** del valore attuale → si annulla in 1 comando.
- **Hai scelto "config subito":** applico subito i cambi reversibili e ti dico cosa ho cambiato.
- Richiede la chiave di **scrittura** del marketplace (`MARKETPLACE_SUPABASE_WRITE_KEY`); senza, gira in DRY-RUN.

## 🛠️ Corsia CODICE — anteprima → tuo ok → online (NUOVE funzioni)
Per cose nuove che non esistono nel sito (es. punti fedeltà, nuovo checkout, nuova sezione).
1. Team Engineering crea un **branch** da `main` aggiornato (⚠️ 2 sessioni stanno editando ora → branch dedicato).
2. Implementa il minimo che serve → `npm run verify` (typecheck + lint + test).
3. `git push` → **PR** → **Render genera l'anteprima automatica**.
4. Ti porto **link anteprima + diff**. Al tuo **🔴 ok** → merge su `main` → online (Render + CI).
> Il merge in produzione è **sempre** una tua firma. Mai deploy senza il tuo ok.

## 🧭 Mappa "cosa chiedi → quale corsia"
| Esempio di richiesta | Corsia |
|---|---|
| "Cambia il banner / il logo / il footer" | ⚡ CONFIG |
| "Metti in evidenza la categoria X" / "riordina la home" | ⚡ CONFIG |
| "Crea un coupon SCONTO10 / un daily-drop" | ⚡ CONFIG |
| "Aggiungi una pagina FAQ / aggiorna i termini" | ⚡ CONFIG |
| "Aggiungi i punti fedeltà" | 🛠️ CODICE |
| "Cambia il flusso di checkout / la pagina prodotto" | 🛠️ CODICE |
| "Nuova funzione che oggi non c'è" | 🛠️ CODICE |

## In pratica
Scrivi all'AD, es.: *"metti in home il bundle Tris DOP e crea il coupon BENVENUTO5"* (CONFIG, subito) oppure
*"aggiungi una sezione 'regala una spesa' al checkout"* (CODICE, ti mostro l'anteprima). Vedi anche
`cervello/marketplace.mjs` e, per il codice, il mansionario `tech` + team Engineering.
