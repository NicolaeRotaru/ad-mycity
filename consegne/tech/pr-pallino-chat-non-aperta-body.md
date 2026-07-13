## Cosa
Il pallino rosso sulle conversazioni ora compare anche quando l'AD ha risposto in una chat che non hai riaperto nell'Assistente (es. hai scritto, sei andato in Plancia/Lavori, la risposta è arrivata).

## Perché
Il codice trattava come «chat aperta» qualsiasi conversazione con convId impostato — anche fuori dall'Assistente o dalla chat fluttuante. In quella situazione il pallino veniva sempre nascosto, anche se non stavi guardando quella chat.

## Come provare
1. Mergia e attendi deploy Vercel (~2–3 min).
2. Apri l'Assistente, scrivi in una chat, vai in un'altra sezione (Plancia o Lavori) senza riaprire quella chat.
3. Quando l'AD risponde, apri l'elenco Conversazioni: deve esserci il pallino rosso su quella chat.
4. Apri la chat → pallino sparisce. Resta in chat 15 secondi → non deve tornare (fix #338).
5. Chiudi l'Assistente → pallino resta spento.
