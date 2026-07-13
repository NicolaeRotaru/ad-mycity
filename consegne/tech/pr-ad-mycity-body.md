## Summary
- Aggiunge `radiografia-umana.ts`: traduce titoli, aree e corpo dei problemi in italiano semplice (regola `scrittura-umana.md`).
- Nuovo componente `SchedaProblema`: titolo umano + «Perché» + «Cosa fare»; path e testo audit grezzo sotto «Dettagli tecnici» (collassato).
- Applicato a **Radiografia macchina**, **Salute sito** e **Auto-coscienza** (tab Analisi → errori).

## Esempio (finding coerenza-agenti dello screenshot)
- **Prima:** `trust-safety e fraud-risk collidono… verbatim in entrambe le description`
- **Dopo:** titolo leggibile tipo «Trust Safety e Antifrode si pestano i piedi sulle frodi…» + impatto in italiano; file `.md:3` solo aprendo Dettagli tecnici.

## Test plan
- [ ] Radiografia macchina → Archivio audit → card coerenza-agenti: titolo umano, niente path in vista
- [ ] Salute sito → stessa struttura su un bloccante
- [ ] Auto-coscienza → Analisi → errori con Dettagli tecnici
- [ ] `node --test pannello/src/lib/radiografia-umana.test.mts`
