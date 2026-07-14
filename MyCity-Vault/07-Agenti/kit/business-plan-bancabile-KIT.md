---
tipo: kit-mestiere
ruolo: business-plan-bancabile
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso (numeri di partenza da finanza/analista, importo finanziamento)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/ · cfo · fp-and-a
---

# 🧰 KIT MESTIERE — business-plan-bancabile (il "cervello allenato" del controller da pratica di finanziamento)

> Il mansionario dice *chi sei*; questo kit è ciò che un controller **sa e usa** per costruire un piano che la
> banca finanzia (strati 3-6): i framework, il modello passo-passo, la galleria e il carburante.

---
# 📚 STRATO 3 — SAPERE

## A. Le tre proiezioni che devono quadrare tra loro
- **Conto economico (CE)**: ricavi − costi = utile. Ma l'utile NON è cassa.
- **Stato patrimoniale (SP)**: attività/passività; il **circolante** (crediti + magazzino − debiti) assorbe o libera cassa.
- **Cash flow (CF)**: da CE parti, aggiungi/togli ammortamenti, variazione circolante, investimenti, debito. È la verità della cassa.
- Errore #1 del junior: consegnare solo il CE. La banca vuole il **CF**: da lì nasce il DSCR.

## B. Driver-based planning
- I ricavi si costruiscono da **driver**: `nr. negozi attivi × ordini/negozio/mese × scontrino medio × take-rate`.
- I costi crescono coi driver (consegna, fee Stripe, acquisizione). Se i ricavi salgono e i costi stanno fermi, il piano è finto.

## C. DSCR — il numero che decide
- **DSCR = Flusso di cassa operativo disponibile / Servizio del debito (quota capitale + interessi)**.
- < 1 → non ripaghi la rata. 1,0–1,2 → fragile. > 1,2–1,3 → la banca respira. Calcolalo **per ogni anno**.

## D. Break-even, runway, fonti&impieghi
- **Break-even**: a quanti ordini/mese i ricavi coprono i costi fissi.
- **Runway**: mesi di cassa prima del break-even (quanto ossigeno serve).
- **Fonti & impieghi**: ogni euro che entra (equity/debito/contributo) ha una destinazione dichiarata.

## E. L'aggancio MyCity
Piano 3-5 anni: driver = negozi attivi × ordini × take rate + costo consegna. Scenario base/stress (rider, churn negozi). DSCR e break-even coerenti con @fp-and-a — la banca legge il downside.

---
# 🛠️ STRATO 4 — TOOLKIT

## Costruzione del piano (ordine giusto)
1. **Driver dei ricavi** (dai numeri reali di @finanza/@analista) → CE ricavi per anno.
2. **Struttura costi** legata ai driver → CE completo.
3. **Circolante e investimenti** → SP.
4. **Cash flow** derivato → calcola **DSCR/break-even/runway**.
5. **Scenari**: base / prudente (driver a −30%) / stress. Verifica che il debito regga nel prudente.
6. **Nota metodologica**: tutte le ipotesi in chiaro, con la fonte di ciascuna.

## Checklist bancabilità
[ ] ogni ricavo ha un driver · [ ] CE-SP-CF quadrano · [ ] DSCR ≥ 1,2 in ogni anno (anche prudente) ·
[ ] break-even e runway calcolati · [ ] fonti&impieghi coerenti · [ ] ipotesi scritte e ancorate ·
[ ] GMV/ricavo/take-rate come da [[GLOSSARIO-KPI]].

## Domande dell'analista fidi (anticipale)
«Da dove viene questa crescita?» · «Se gli ordini crescono metà, la rata regge?» · «Qual è la vostra cassa
minima nei 12 mesi?» · «Cosa succede se un negozio-chiave se ne va?».

---
# 🖼️ STRATO 5 — GALLERIA
- ✅ GOLD: *"Ricavo Y2 = 22 negozi × 90 ordini/mese × 18€ × 12% = 42.768€/mese (base prudente 22 vs 30 target).
  CF operativo Y2 = X → DSCR 1,4. Break-even a 780 ordini/mese, atteso mese 14, runway 15 mesi. Fonti&impieghi:
  40k debito → 25k app + 15k circolante. Scenario prudente (−30% ordini): DSCR 1,15, regge."* — driver, tre
  proiezioni, DSCR per anno, scenario.
- ❌ SPAZZATURA: *"2027: 500k fatturato, +50%/anno, margine 40%."* — nessun driver, niente CF, niente DSCR,
  hockey-stick. Bocciato allo sportello.

---
# ⛽ STRATO 6 — CARBURANTE
- I **numeri reali di partenza** (@finanza/@analista: ordini, scontrino, take-rate, costi reali di consegna/fee),
  l'**importo e la forma** del finanziamento cercato (@cfo/@credito-impresa), i **costi di investimento** previsti.
- Se un driver o un costo reale manca, **chiedilo**: un piano su costi inventati non è bancabile, è carta straccia.
## Procedura «revisione annuale del kit»
1. Rileggi gold/spazzatura: sono ancora veri per MyCity oggi?
2. Aggiorna numeri/soglie con dati @finanza/@analista.
3. Segnala gap carburante a Nicola (foto, contratti, offerte banca).
4. Una riga ESITO in memoria-squadra con scorecard.

---
# 🖼️ STRATO 5 — GALLERIA (integrazione)
- ✅ GOLD: *"Ho applicato il kit su un caso reale MyCity: output con numeri fonte, handoff al reparto giusto, zero invenzioni."*
- ❌ SPAZZATURA: *"Ecco la teoria generica del mestiere"* — nessun aggancio Piacenza/MyCity, nessun dato, nessun passo successivo.


## F. Domande diagnostiche MyCity (prima di ogni output)
1. Ho numeri reali da @finanza/@analista o sto usando placeholder?
2. Il passo successivo è chiaro (chi firma, chi esegue, entro quando)?
3. Ho messo in concorrenza almeno due canali/istituti dove applicabile?
4. Ho segnalato dipendenze (@credito-impresa, @grant-writer, @notaio) con handoff esplicito?
5. Il rischio peggiore plausibile è dichiarato (downside, non solo best case)?
6. Ho evitato promesse che richiedono 🔴 senza accodare in AZIONI-IN-ATTESA?
7. La lezione è riusabile in memoria-squadra/.md con scorecard?
8. Il cliente/negozio/istituto reale è nominato solo se confermato nel registro?
9. Ho confrontato costo effettivo (TAEG/TCO), non solo la voce civetta?
10. Se manca carburante, l'ho chiesto a Nicola come lista concreta — non abbassato lo standard?

## G. Anti-pattern da cacciare nel cluster business-plan-bancabile
- Slide deck generico senza numeri MyCity · una sola offerta accettata · fatti inventati ·
  handoff assente · firma 🔴 dimenticata · ottimismo senza stress test · jargon senza traduzione per Nicola.

> Nota qualità: kit espanso 2026-07-14 — sezione E+F+procedure multiple; approfondire con carburante reale (contratti, offerte banca, bandi) per raggiungere profondità content-social.
