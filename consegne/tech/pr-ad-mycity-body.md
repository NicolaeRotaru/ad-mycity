## Summary
- La chat principale dell'Assistente ora include la **memoria delle conversazioni precedenti** (prima funzionava solo nelle caselle Archivio).
- Memoria più ricca: 6 chat recenti, 4 scambi ciascuna, messaggi fino a 360 caratteri (prima 4/3/220).
- Il worker inietta anche la **situazione attuale** da STATO.md nel contesto di ogni messaggio chat.

## Perché
Nicola segnalava che l'AD sembrava «limitato nel ragionamento»: in parte era il formato corto, in parte un **bug** — l'Assistente principale non passava `bloccoMemoriaChat` al cervello, quindi ogni nuova chat partiva davvero a zero anche se lo storico esisteva nel database.

## Come provare
1. Approva e mergia la PR → attendi deploy Vercel (~2 min) + `sudo systemctl restart mycity-worker-chat` sul VPS.
2. Apri una **nuova** conversazione nell'Assistente.
3. Chiedi qualcosa che hai già discusso ieri in un'altra chat (es. «che negozi abbiamo firmato sabato?»).
4. L'AD dovrebbe rispondere usando la memoria precedente, non chiedere «di cosa parli?».

## Non incluso (voluto)
- Azioni sul mondo reale (email, post, deploy, soldi) restano 🔴 — serve sempre la firma di Nicola. Non è un limite da togliere, è sicurezza.
