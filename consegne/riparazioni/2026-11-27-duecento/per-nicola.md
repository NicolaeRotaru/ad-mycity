---
tipo: lista per Nicola
data: 2026-11-27 02:47
campagna: i 200 risolti del 27/11
---

# Le voci dei 200 che chiedono Nicola

## In parole semplici
Qui stanno i gesti che solo tu puoi fare, nati mentre l'onda 1 ripara. La macchina non si ferma per questi: li trovi qui, e alla fermata dopo l'onda te li porto.
Per esempio: tre impostazioni su Vercel che servono perché le email dell'assistenza partano davvero.

## Cosa cambia per te
Finché non li fai, la riparazione resta a metà: il codice è pronto, manca il tuo gesto.

## Cosa devi fare
Niente adesso: te li porto alla fermata, con il passo esatto.

## Cosa non ho verificato
Che le impostazioni manchino davvero su Vercel: lo dice il riparatore, la regia non l'ha guardato.

## Le voci
- 2026-11-27 02:47 · email dell'assistenza · su Vercel, ambiente Production, servono tre impostazioni: la chiave del servizio email, il mittente e l'indirizzo dell'assistenza. Senza, la riparazione resta a metà.
- 2026-11-27 03:58 · due firme su due commit · R01 e R06 hanno rimesso com'erano delle prove comuni con un commit il cui messaggio non comincia col codice della voce. Il programma lo ferma. L'errore è della regia, che aveva scritto «nessun codice nel messaggio»: serve la tua firma per unirli.
- 2026-11-27 03:58 · come leggere tre verifiche · R01, R02 e R06 hanno la verifica rossa solo nelle prove comuni, che la regia adegua all'unione. R02 l'ha scritta «verde» con una nota, R01 e R06 «rossa». Proposta: vale la verifica fatta dopo l'unione, con le prove comuni adeguate.
- 2026-11-27 03:58 · collaudatori senza il sito · un collaudatore nato sul deposito della macchina non può scaricare il sito: il controllo dei permessi lo rifiuta. Per K01 serve il tuo clic sulla richiesta di aggiungere il deposito mycity in lettura, oppure il tuo sì ad aprire i collaudatori partendo dal sito.

## Dettagli tecnici
- R03-003 (parziale, 136d25ae su `ccr-819e0c8d-7ryjjr-m03`): `RESEND_API_KEY`, `RESEND_FROM`, `SUPPORT_EMAIL` in Vercel Production.
- Deroghe «id_nel_commit» da firmare: 7877cd5594001b75529d1f848d5856932b03969f (R01, `ccr-819e0c8d-7ryjjr-m01`), 79f5bb306c542846ba50f20e38f64bbb9fc8d672 (R06, `ccr-819e0c8d-7ryjjr-m06`). Vanno in `eccezioni_firmate` del piano dell'onda 1.
- Verifiche: valida-referto vuole `verifica.esito` «verde» a referto finito e non ha un modo per «rosso solo nelle prove comuni riportate alla base». Difetto della macchina, segnalato all'AD.
