## Cosa
Fix chat Pannello: ordine conversazioni per ultima aperta + header più pulito.

## Perché
1. Aprendo «Conversazioni», l'ultima chat visualizzata deve salire in cima (dopo le pinnate), non restare ferma per data di creazione.
2. L'icona e la frase «Parla con l'assistente» in header erano ridondanti e poco curate.

## Modifiche
- Stato `convVistaAt` in localStorage (`mycity_conv_vista`) + `segnaVista()` ad ogni apertura chat
- `ordinaConversazioni`: pinnate → ultima vista → updated_at
- Header: icona History, rimossa frase statica; resta solo il titolo della conversazione attiva

## Come provare
1. Apri 2-3 conversazioni diverse dal cassetto
2. Riapri «Conversazioni»: l'ultima aperta deve essere subito sotto le pinnate
3. Header: niente «Parla con l'assistente», icona orologio/storico, titolo conversazione se attiva
