---
tipo: consegna
reparto: seo
data: 2026-07-06 16:10
autore: AD (senior @seo → @tech)
stato: 🟡 comando pronto (config, reversibile) · 🔴 nessuna spesa · 🟢 template + regola-standing
oggetto: Riempi la vetrina con le parole che la gente cerca su Google — Pane Quotidiano ORA + regola per TUTTI i negozi
approvazione: Nicola 2026-07-06 «lo approvo e devi farlo con tutti i negozi» (Pannello)
---

# 🔎 Riempimento vetrine SEO — Pane Quotidiano + regola per tutti i negozi

> **La verità dei numeri (baseline STATO, sensori live gated in sessione):** oggi nel DB c'è **UN solo negozio
> reale** = **Pane Quotidiano** (contratto firmato 1/7). **Casa Linda = demo/seed → esclusa** (riempirla di testi
> SEO metterebbe un negozio finto nell'indice di Google: si fa il contrario). **Garetti = prospect non nel DB →
> niente da riempire.** Le altre botteghe (lista 27, 10 verificate) entrano **dopo il 9/7** (visita 13/7).
>
> Perciò **"farlo con tutti i negozi" oggi = 1 riempimento reale (PQ) + una regola che lo rende AUTOMATICO
> per ogni negozio nuovo**, così le 6 botteghe che entrano dal 13/7 nascono già ottimizzate. Lo sforzo pesante
> va dove c'è un negozio che può incassare (cancello di allocazione AR-006).

---

## 1) 🟡 PANE QUOTIDIANO — comando pronto (esegue via Pannello/giro autorizzato)

**Perché muove la SEO** (verificato in `marketplace/app/store/[id]/layout.tsx`): title, meta-description, Open Graph
e schema.org derivano da `store_name` + `store_description` + `store_address`. Il titolo aggiunge **" a Piacenza"**
solo se `store_address` è pieno; con `store_description` vuota esce un meta generico. Riempirli = intercettare le
ricerche reali. `store_phone` non tocca i meta (utile ai clienti, non alla SEO) → lo lascio fuori da questo giro.

**Materia prima = solo fatti verificabili** (gate onestà 🔬):
- **bio dal 1976** — fatto pubblico già usato e validato in altre azioni (A15/A16).
- **Via Calzolai 25, Piacenza** (centro storico) — indirizzo reale del negozio (ritiro ordine #16).
- prodotti bio reali dal catalogo: **pane, pesto, kefir bio** (carrello samir + ordine #16).
- ❌ **"senza glutine / dietetico" NON inserito** — linea sospesa, da confermare col titolare. Niente claim non provati.

**Ricerche intercettate** (5): *prodotti bio a Piacenza · spesa bio online Piacenza · pane bio a domicilio ·
panificio/bottega bio del centro · botteghe del centro con consegna a domicilio*.

**Esecuzione (l'esecutore conferma prima l'id + i valori attuali):**
```bash
# 1) conferma id seller PQ (c0b240c0-…) e valori correnti — il backup per riga si basa su questi
node cervello/marketplace.mjs leggi
# 2) scrivi vetrina (backup automatico in creativi/output/marketplace-backup → reversibile)
node cervello/marketplace.mjs aggiorna profiles <ID_PQ> '{
  "store_description": "Pane Quotidiano: pane e prodotti bio a Piacenza dal 1976. Fai la spesa bio online — pane, pesto e kefir bio della bottega del centro — e ricevila a casa. Consegna a domicilio in centro storico e nei quartieri di Piacenza con MyCity.",
  "store_address": "Via Calzolai 25, Piacenza"
}'
```
> I primi ~160 caratteri della descrizione (quelli che Google mostra come meta) front-caricano le parole chiave:
> *pane e prodotti bio a Piacenza · spesa bio online · bottega del centro*. Rollback = ripristinare dal backup per riga.

---

## 2) 🟢 TEMPLATE riusabile — vetrina SEO di ogni negozio

Per ogni negozio, compilare con **materia prima reale del negozio** (mai inventata):

```json
{
  "store_description": "{Nome}: {categoria/plus reale} a Piacenza{, dal ANNO se noto}. {1 frase con 2-3 parole che la gente cerca} e ricevila a casa. Consegna a domicilio in centro e nei quartieri di Piacenza con MyCity.",
  "store_address": "{Via e civico reali}, Piacenza"
}
```
Regole: ① i primi 160 caratteri contengono le 2-3 keyword di categoria+zona; ② `store_address` sempre pieno
(sblocca " a Piacenza" nel titolo); ③ zero claim non verificati (DOP, bio, senza glutine, premi) senza fonte.

**Campi che servono dal negozio (procura, non inventabili):** categoria/posizionamento, anno di fondazione se
lo comunica, eventuali certificazioni (bio/DOP) **documentate**, indirizzo reale.

---

## 3) 🟢 REGOLA-STANDING — SEO-fill = passo obbligatorio dell'onboarding

D'ora in poi ogni negozio che entra su MyCity riceve il riempimento vetrina **al go-live**, dentro l'onboarding
done-for-you (@onboarding-negozi). Così le **6 botteghe food** in arrivo dal 13/7 nascono già ottimizzate, senza
un secondo giro. Handoff: @onboarding-negozi raccoglie i campi reali → @seo compila il template → proposta 🟡
col comando pronto → firma → `marketplace.mjs aggiorna`.

**Casa Linda (demo):** esclusa in modo permanente da SEO-fill finché resta seed.

---

## ✅ Chiusura
- ✅ **FATTO (🟢):** questo doc + template + regola-standing onboarding; comando PQ pronto su fatti verificati.
- ⏳ **ACCODATO (🟡):** riempimento vetrina PQ (config, reversibile) → esegue via Pannello/giro autorizzato.
- 🙋 **SERVE DA NICOLA:** 1 conferma sulla linea "senza glutine/dietetico" di PQ (se sì → l'aggiungo alle keyword);
  per le altre botteghe la materia prima arriva in onboarding dal 13/7.
