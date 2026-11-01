---
data: 2026-11-01 13:45
sessione: S4 — testata, assistente AI e accessi
richiesta: https://github.com/NicolaeRotaru/mycity/pull/275
---

# Sessione 4: testata, assistente AI e accessi — referto delle ondate 7 e 8

> **In due righe:** su 17 difetti, 6 sono chiusi nella richiesta di unione 275, col controllo del sito verde.
> Per gli altri servono soprattutto tue scelte (il modello AI entro il 30/11, due migrazioni, i modelli email): le trovi in «Cosa devi fare».

## In parole semplici
Il lavoro riguardava 15 difetti seri del sito, più due falle d'accesso arrivate dalla sesta sessione. Sono stati due giri di riparazione, a squadre di agenti, con un collaudo indipendente alla fine di ogni giro. Tutto il lavoro sta in una sola richiesta di unione, la numero 275. Il controllo completo del sito è verde.

Ne entrano sei. Si vedono le pillole e le icone della testata. Il negozio riceve la campanella quando un cliente gli scrive. L'AI non inventa più un prezzo pieno barrato. La chat non dice più «Modifiche salvate» quando il prezzo è stato rifiutato. Una delle falle d'accesso (la R14) è chiusa.

Il resto si divide così. Sei aspettano una tua decisione o un file di un'altra sessione. Tre non reggono e sono rimasti fuori dal ramo, salvati a parte.

## Cosa cambia per te
- Chi ha fatto l'accesso vede di nuovo «Ordini», «Consegne», «Admin», il cuore, i messaggi e la campanella. Prima avevano lo stesso colore dello sfondo.
- Quando un cliente scrive a un negozio, al negozio arriva una voce nella campanella del sito. Nel suo pannello c'è la voce «Messaggi».
- Esempio: Pane Quotidiano chiede all'AI di sistemare una scheda. L'AI non può più mettere un «prezzo pieno 4,50 €» barrato preso dal mercato. Lo sconto barrato lo mette solo il negoziante, a mano.
- Esempio: il negoziante chiede in chat «porta la focaccia da 3 a 5 €» (+67%). Prima la chat rispondeva «Modifiche salvate» e il prezzo restava 3 €. Adesso dice che il prezzo non è entrato e perché.
- Il modello AI che legge le foto si spegne il 30 novembre. Il cambio è pronto dietro due variabili su Vercel: dal giorno in cui le imposti passi al modello nuovo, senza un rilascio.
- Se il conto condiviso della spesa AI manca da più di un'ora, parte un allarme.

## Cosa devi fare
- **Scegli il modello che sostituisce Sonnet 4.5 entro il 30/11.** Ti consiglio `claude-sonnet-4-6`. Costa uguale: 3 $ per milione di token in entrata e 15 $ in uscita. Funziona subito su tutte le 12 funzioni. L'alternativa è `claude-sonnet-5-5`, che costa meno (2 $ e 10 $). Però rifiuta lo «strumento forzato» che usano 8 rotte, quindi servirebbe un'altra ondata di lavoro. Le variabili da impostare su Vercel sono `AI_MODELLO_VISION` e `AI_MODELLO_SMART`.
- **Applica in produzione due migrazioni.** La 131 fa valere il tetto di spesa AI per tutto il sito, non per ogni copia. La 181 fa leggere al negozio il nome dei clienti in chat.
- **Su Supabase cambia due modelli email.** Sono «Reset password», cioè la nuova password, e «Confirm signup», cioè la conferma dell'iscrizione. Vanno passati al formato con `token_hash`. Così il link della nuova password funziona anche se lo apri da un altro dispositivo, per esempio dal telefono.
- **Su Supabase attiva «Secure password change».** Completa sul server la correzione R14.
- **Decidi su «Contatta il negozio».** Lo teniamo con la campanella, o al lancio lo sostituiamo con un pulsante WhatsApp verso il negozio? Ti consiglio WhatsApp finché non ci sono email e notifiche sul telefono, perché il fornaio WhatsApp lo usa già.
- **Decidi la chiave del controllo anti-robot** (R15), insieme alla correzione che in questo giro non ha retto.

## Cosa non ho verificato
- Niente è stato provato su un telefono vero o in produzione: solo le prove automatiche e l'anteprima di Vercel.
- PostHog: è entrato un miglioramento, ma il collaudo ha trovato un residuo serio. L'indirizzo della pagina da cui arriva il visitatore, se contiene una ricerca, esce ancora intero.
- La copertura della radiografia non l'ho registrata: lo strumento scrive nella memoria che questo lavoro non poteva toccare. Le righe sono nel referto JSON.

---

## Dettagli tecnici

### Ondata 7 (run `wf_ca4402d1-e16`, 12 agenti)
| Pacchetto | Esito | Note |
|---|---|---|
| `components/Navbar.tsx` | chiuso (2 di 3) | pillole e icone chiuse; avviso al negozio parziale (email e push = `lib/email/`, S5) |
| `lib/supabase/client.ts` | fermo per una scelta | già corretti sulla base `ecb8e2c`; manca il cambio dei modelli email Supabase |
| `lib/ai/tettoSpesa.ts` | fermo per una scelta | allarme e quota per copia fatti; serve la migrazione 131 in produzione |
| `lib/analytics/posthog.tsx` | non regge | entrato il miglioramento; resta `$initial_referrer` |
| `app/messages/page.tsx` | fermo per una scelta | rotta dei nomi tolta: rompeva `tests/unit/i-nomi-dei-clienti-che-il-negozio-vede.test.ts`; serve la 181 |

Primo `npm run verify` rosso (2 prove, dalla rotta dei nomi). Dopo il revert: verde, 837 file e 7.139 prove.

### Ondata 8 (run `wf_4e7f8957-ece`, 10 agenti)
| Pacchetto | Esito | Note |
|---|---|---|
| `app/api/ai/improve-product/route.ts` | chiuso (2 di 4) | barrato e «salvate» chiusi; modello pronto dietro variabile (scelta); scheda della proposta fuori territorio (`lib/products/prontoPerLaVendita.ts`) |
| `app/layout.tsx` | fermo per una scelta | reggeva, ma la prova comune `...restano-spenti-anche-con-le-chiavi.test.ts:308` fissa la forma vecchia; tolta |
| `lib/auth/decisione-portiere.ts` | fermo per una scelta | parte in `lib/auth/` pronta; serve una riga in `middleware.ts:514-523` |
| `components/PhotoReviewUpload.tsx` | non regge | grave nato (foto HEIC da 24 MP rifiutate su Safari); ramo salvato |
| R14 | chiuso | — |
| R15 | non regge | ramo salvato; dettagli solo alla sesta sessione |

### Fuori territorio
`lib/email/` (sessione 5) · `app/orders/[id]/dispute/page.tsx` · `middleware.ts:514-523` · `lib/products/prontoPerLaVendita.ts` · `tests/unit/al-lancio-carta-abbonamento-e-codici-sconto-restano-spenti-anche-con-le-chiavi.test.ts:308` · `lib/funzioni-al-lancio.ts` (`APP_INSTALLABILE_ACCESA`) · `.claude/settings.json` di ad-mycity: lo strumento Workflow non è sorvegliato da un freno.

### Gettoni
Ondata 7: 727.088 senza letture dalla cache, 12.662.360 con. Ondata 8: 884.343 senza, 17.073.152 con. Misurati con `node cervello/conto-token.mjs --workflow <run_id>`.

### Rami salvati (non uniti)
`s4-salvato/ondata-7-app-messages-page-tsx` · `s4-salvato/ondata-8-app-layout-tsx` · `s4-salvato/ondata-8-components-photoreviewupload-tsx` · `s4-salvato/ondata-8-r15` — sul repo del sito. Ramo della richiesta: `claude/cinque-s4-testata-ai-accessi`, commit `30012e6`. `npm run verify` dell'ondata 8: verde, 846 file e 7.163 prove (primo giro rosso su 1 prova comune, sistemato togliendo il manifest).

## Correzione dopo il collaudo finale (1/11/2026 15:00)
Il collaudo finale sul ramo di integrazione aveva bocciato due cose. Le ho riparate in un solo giro, nella richiesta di unione 281: https://github.com/NicolaeRotaru/mycity/pull/281.
- **«Modifiche salvate» col prezzo rifiutato:** la scheda in chat ora dice che il prezzo non è entrato e il perché («oltre il 30%, va deciso a mano»). Le prove cadono se si toglie la correzione: regge.
- **R14, il rientro col link di recupero:** chi arriva dal link passato da `/auth/confirm` vede il modulo e salva. Il segno lo mette solo il server, firmato e legato alla sessione. Chi è dentro con la password resta senza modulo. Regge sui file vecchi; sui due file nuovi la macchina non decide e decide il ricollaudo.
- `npm run verify`: verde, 7.468 prove superate e 1 saltata.
- Toccato un file senza padrone: `lib/errors.ts`, per non tagliare il perché del rifiuto.
- Con questa correzione il cambio dei modelli email di Supabase verso `/auth/confirm` resta fra le tue azioni: non rompe più la nuova password.
