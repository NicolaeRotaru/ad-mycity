## Cosa cambia
Due bug della chat segnalati insieme da Nicola con screenshot:

1. **"Nuova chat" apriva a volte due conversazioni** — una che cresce normalmente, una gemella ferma al primo messaggio con lo stesso titolo.
2. **La voce "Worker" nel menu apriva la chat sovrapposta alla pagina che si stava guardando**, non una finestra a sé come richiesto.

## Perché
1. Il primo messaggio di una chat nuova usa un id provvisorio (`sess_...`) finché il server non risponde con l'id vero. Se il poller che ricarica le conversazioni scatta prima che questa "promozione" sia completata, il segnaposto provvisorio non risulta mai nella lista fresca del server e la fusione delle liste lo rimetteva comunque a video per sempre, come una seconda chat fantasma. Ora un segnaposto che non è più la chat attiva ed è assente dalla lista del server viene scartato.
2. La voce "Worker" nel menu apre ora una vera scheda del browser (`window.open`), non più un overlay sopra la pagina corrente. La nuova scheda riconosce il parametro `?worker=1` nell'URL, pulisce l'URL e apre subito la vista Worker a schermo intero.

## Come si prova
- `npx tsc --noEmit` pulito (dentro `pannello/`)
- `node --test src/lib/chat-thread-merge.test.mts` → 4/4 verde (non toccata da questo fix, solo a riprova che non regredisce)
- Non verificato dal vivo nel browser (sessione headless, npm run dev richiederebbe un'approvazione che qui non può comparire). Da provare a mano: 1) aprire una chat nuova e mandare subito un messaggio, controllare che in "Conversazioni" resti UNA sola voce; 2) dal menu, cliccare "Worker" e controllare che si apra una scheda nuova del browser invece di sovrapporsi.
