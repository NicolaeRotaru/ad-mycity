## Cosa cambia
Il fix di oggi (commit b6529866, PR #514) toglieva le bolle doppie solo se erano ATTACCATE una all'altra. Nicola ha riprodotto dal vivo il caso che restava scoperto: un vecchio messaggio riappare in FONDO alla chat (non subito sotto la sua prima apparizione) quando il poller ricarica le conversazioni dal server e fa il merge con quelle già a video.

## Perché
`dedupRenderMsgs` controllava solo la bolla appena prima. Ora tiene traccia (con un Set) di OGNI bolla già vista in tutta la conversazione e scarta ogni ripetizione, ovunque compaia — i messaggi "in corso" (pending) restano esclusi dal controllo per non nascondere per errore due richieste diverse in corso con lo stesso testo placeholder.

## Come si prova
- `npx tsc --noEmit` pulito (dentro `pannello/`)
- `node --test src/lib/chat-thread-merge.test.mts` → 4/4 verde
- Non verificato dal vivo nel browser (sessione headless, npm run dev richiederebbe un'approvazione che qui non può comparire)
