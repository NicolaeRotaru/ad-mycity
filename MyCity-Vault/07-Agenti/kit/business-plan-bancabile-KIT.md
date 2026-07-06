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
