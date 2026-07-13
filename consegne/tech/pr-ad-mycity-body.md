## Summary
Aggiunge **Grillami** e **Codice minimo** (plugin grilling + ponytail) alle skill rapide del pulsante ⚡ in tutte le chat del Pannello.

## Perché
In chat con Nicola sono attivi solo questi due plugin (gli altri 19 servono a giri, lavori interni o task backend — non alla conversazione diretta). Nicola voleva vederli nel menù Skill & comandi, non solo sapere che esistono.

## Cosa cambia
- `pannello/src/lib/comandi-data.ts`: due chip in cima a `SKILL_RAPIDE`
  - 🔥 Grillami → `grillami su ` (stress-test decisioni, una domanda alla volta)
  - ✂️ Codice minimo → `cambia il sito: ` (ponytail si attiva da solo su fix codice)

## Come provare
1. Apri il Pannello (chat principale o casella Parla)
2. Tocca ⚡ accanto a Invia
3. In «Skill rapide» compaiono i due nuovi chip in cima
4. Tocca «Grillami» → l'input si riempie con `grillami su `
5. Tocca «Codice minimo» → l'input si riempie con `cambia il sito: `
