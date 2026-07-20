## Summary
Con la chat Worker a schermo intero, il menu sito (☰ in navbar) restava sotto l'overlay chat (z-40 vs z-50) e sembrava morto.

## Cosa cambia
- Quando chat grande + menu sito aperto: drawer nav e velo mobile passano sopra la chat (z-55/z-60), header resta cliccabile (z-70).
- Scegliendo una voce del menu (es. Home, Azioni) si chiude anche la chat grande — torni alla sezione scelta.

## Come provare
1. Apri Worker a schermo intero (voce «Worker» nel menu o ingrandisci dal popup).
2. Tocca ☰ accanto a «Pannello di Controllo» in alto.
3. Deve comparire il menu laterale (Home, Azioni, Lavori…) sopra la chat.
4. Scegli «Home» → menu si chiude e vedi la plancia, chat grande sparita.
5. Ctrl+F5 se il browser aveva cache vecchia.
