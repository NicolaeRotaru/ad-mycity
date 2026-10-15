---
tipo: esecuzione
data: 2026-10-10 15:45
reparto: "@devops-sre (con l'AD)"
card: "#154 in AZIONI-IN-ATTESA"
firma: "«Fai la #154», Nicola, 2026-10-10"
---

# Ho messo su Vercel le otto chiavi che potevo creare io: le altre nove le copi tu

> ⚠️ **2026-10-12 17:55 — La chiave di Supabase non si prende più da qui.** La chiave «Legacy» che
> questa guida diceva di copiare non è più segreta. Va spenta, non ricopiata. La chiave di servizio
> nuova nasce con la card #203 e va su Vercel in quel momento. Qui sotto restano le altre otto chiavi.
> Anche dalla scorciatoia di Render non va ricopiato niente di Supabase.

**In due righe.** Il sito non registra ordini perché su Vercel mancano le sue chiavi. Otto le ho
create io oggi. Le altre nove le rilasciano Supabase, Stripe, Resend e Upstash, e le vede solo chi
entra nei loro pannelli.

## In parole semplici

Il sito usa delle chiavi per parlare con i servizi da cui dipende: il database, i pagamenti, la
posta. Le chiavi stanno su Vercel, fra le impostazioni del progetto del sito. Il sito ne controlla
21. Quando è passato da Render a Vercel ne sono state ricopiate solo 4.

Oggi ne ho aggiunte 8. Sono quelle che si possono creare da zero, come una password nuova, più
l'indirizzo del sito. Adesso ce ne sono 12 su 21. Le 9 che mancano le genera un servizio esterno, e
da qui non le posso leggere.

**Un esempio concreto.** Quando un cliente paga, Stripe avvisa il sito, e il sito scrive l'ordine nel
database. Per scriverlo gli serve la chiave di servizio del database. Quella chiave la genera
Supabase e la mostra solo a chi entra nel suo pannello. Senza, Stripe incassa ma l'ordine non nasce.

## Cosa cambia per te

Per ora sul sito non cambia niente. Una chiave nuova vale dalla pubblicazione successiva, e non ho
ripubblicato. Con la chiave del database ancora assente, il sito resterebbe fermo lo stesso. Basta
ripubblicare una volta sola, alla fine.

Quando ci saranno tutte, ripartono i 10 lavori automatici del sito, fermi almeno dal 30 luglio. Al primo
giro non si muovono soldi: non ci sono ordini fermi né versamenti da fare ai negozi. Partono però
delle email:

- **7 email vecchie**, scritte fra il 9 giugno e il 20 agosto. Sono un benvenuto, una guida, una
  promozione sul primo ordine e quattro messaggi «ci manchi». Arriverebbero tutte insieme, con mesi
  di ritardo.
- **3 promemoria** per carrelli lasciati a metà, il più vecchio dal 7 settembre.

La mia raccomandazione: annullare le 7 email vecchie prima della ripartenza. Sono scritte per un
momento che è passato. I 3 promemoria invece possono partire.

## Cosa devi fare

Sono nove valori da copiare, da quattro pannelli. Ci vogliono una decina di minuti. Ogni valore va
su Vercel così: progetto **mycity** → Settings → Environment Variables → Add. Scrivi il nome
esattamente come qui sotto, scegli solo l'ambiente **Production** e spunta **Sensitive**.

- **Supabase: non da qui.** La chiave di servizio la metti con la card #203: è quella nuova, che
   comincia con `sb_secret_`. Il nome su Vercel resta `SUPABASE_SERVICE_ROLE_KEY`. Non copiare mai la
   chiave «Legacy» che comincia con `eyJ`: è quella da spegnere.
- **Stripe**, tre valori. In Developers → API keys trovi la chiave segreta, che comincia con
   `sk_live_`, e quella pubblicabile, che comincia con `pk_live_`. Su Vercel si chiamano
   `STRIPE_SECRET_KEY` e `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- **Stripe, gli avvisi di pagamento.** In Developers → Webhooks apri l'indirizzo che c'è. Deve
   essere esattamente `https://www.mycity-marketplace.com/api/stripe/webhook`, con il «www». Se è un
   altro, correggilo. Poi copia la chiave che Stripe chiama «Signing secret», quella che comincia con
   `whsec_`. Su Vercel si chiama `STRIPE_WEBHOOK_SECRET`.
   Controlla anche che quell'indirizzo ascolti questi 14 avvisi: `checkout.session.completed`,
   `checkout.session.expired`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `charge.refunded`, `charge.refund.updated`,
   `charge.dispute.created`, `charge.dispute.closed`, `transfer.reversed`, `payment_intent.succeeded`,
   `payment_intent.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`.
- **Stripe, gli avvisi sui conti dei negozi.** *(Aggiunto il 2026-10-15 alle 21:45: serve solo dopo
   che hai unito la riparazione della prima ondata del sito. Prima di quella il sito non sa leggere
   questa chiave.)* Quando la banca di un negozio rifiuta un bonifico, Stripe lo dice con un avviso
   firmato con una chiave diversa dalla prima. Senza questa chiave il sito lo respinge e nessuno lo
   sa. In Developers → Webhooks premi **Add endpoint**. L'indirizzo è lo **stesso** di prima:
   `https://www.mycity-marketplace.com/api/stripe/webhook`. Scegli **«Events on Connected accounts»**
   e iscrivi `account.updated` e `payout.failed`. Poi copia il «Signing secret» di questo **nuovo**
   indirizzo: su Vercel si chiama `STRIPE_CONNECT_WEBHOOK_SECRET`. Per provarlo, dal nuovo indirizzo
   usa «Send test webhook» con `payout.failed`: deve rispondere 200. Prima in modalità di prova, poi
   in quella vera.
- **Resend**, due valori. In API Keys crea una chiave con il permesso di spedire: su Vercel è
   `RESEND_API_KEY`. In Domains controlla che `mycity-marketplace.com` risulti «Verified». Poi scegli
   il mittente, per esempio `MyCity <ordini@mycity-marketplace.com>`: su Vercel è `RESEND_FROM`.
- **Upstash**, due valori. Su console.upstash.com apri il database Redis. Se non c'è, creane uno
   gratuito in Europa. Nella parte REST API copi `UPSTASH_REDIS_REST_URL` e
   `UPSTASH_REDIS_REST_TOKEN`.
- **La casella degli allarmi.** `SUPPORT_EMAIL` è l'indirizzo dove arrivano gli allarmi del sito e i
   messaggi del modulo contatti. Metti una casella che leggi davvero.

Perché il «www» negli avvisi di Stripe conta tanto: l'indirizzo senza «www» rimanda a quello con il «www». Un
browser segue il rimando. Stripe invece no: per Stripe un rimando vale come avviso fallito. Quindi il
pagamento passerebbe, e l'ordine non arriverebbe.

**Una scorciatoia, se ce l'hai ancora.** Se riesci ad aprire il pannello di Render, il servizio del
sito ha una pagina Environment. Lì ci sono quasi tutti questi valori, perché il sito li usava fino al
30 luglio. Copia solo i nomi di questa lista, tranne quelli di Supabase: gli altri li ho già messi io, e
Vercel rifiuta un nome doppio. La chiave degli avvisi di Stripe, invece, prendila sempre da Stripe.

Poi scrivimi **«fatto 154»**. Ripubblico io il sito: stessa versione di oggi, nessun codice nuovo.
Poi controllo la sua pagina di controllo e che i lavori automatici ripartano. Se vuoi anche annullare
le email vecchie, scrivimi **«annulla le email vecchie»**: è una modifica al database, quindi aspetto
il tuo sì.

## Cosa non ho verificato

- **Se il pannello di Render esiste ancora.** Da qui non lo vedo.
- **Com'è messo Stripe.** Non so che indirizzo ha oggi il webhook, né se il conto è in modalità reale
  o di prova. Se il negozio deve incassare davvero, servono le chiavi della modalità reale.
- **Se il dominio è verificato su Resend.** Da qui non entro.
- **Se i lavori automatici sono accesi su Vercel.** Lo vedrò dopo la ripubblicazione, dalla loro
  ultima traccia nel database: oggi è ferma al 30 luglio.
- **Il database del sito è ancora indietro rispetto al codice.** È la card #191, misurata il 3
  settembre. Secondo quella misura un ordine si registra, ma l'email «ordine pronto» non parte. Chi ha
  appena comprato può anche ricevere il promemoria del carrello.
- **Le chiavi che ho creato sono passate da questa conversazione.** Su Vercel nessuno le può più
  leggere, perché le ho segnate «Sensitive». Puoi comunque cambiarle quando vuoi dal pannello: il sito
  non le usa da nessun'altra parte.

---

## Dettagli tecnici

- **Scritte su Vercel** il 2026-10-10 alle 15:43, progetto `mycity` (`prj_XvKD8R89QzA7qVyOhltfS85SH4k9`,
  team `team_O5b1EUNnEQWvcXSNlos567lo`), solo `production`, risposta `failed: []`, riletta subito dopo:
  12 variabili, `hiddenProductionEnvCount: 0`.
  - `NEXT_PUBLIC_APP_URL=https://www.mycity-marketplace.com` (encrypted). Con `www` perché
    `mycity-marketplace.com` risponde 308 → `www.mycity-marketplace.com` (`get_project_domain`).
    Render aveva il dominio senza `www` (`render.yaml` prima di `3809573`).
  - `CRON_SECRET`, `INTERNAL_API_SECRET`, `UNSUBSCRIBE_SECRET`, `MIDDLEWARE_CACHE_SECRET`: 32 byte
    casuali ciascuno, sensitive. `INTERNAL_API_SECRET` lo legge solo `/api/stripe/payout` (avvio
    manuale), nessuna chiamata dal database. Il cookie `mc_ruolo` regge solo la scorciatoia del
    catalogo: `/admin`, `/seller`, `/rider` rileggono il profilo (`middleware.ts`).
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (encrypted) + `VAPID_PRIVATE_KEY` (sensitive): coppia P-256 nuova,
    65 + 32 byte, provata con una firma e una verifica. `push_subscriptions` = 0 righe, quindi nessuna
    iscrizione si rompe. Il permesso lo chiede `components/PushNotificationOptIn.tsx` solo al clic.
  - `AI_GLOBAL_DAILY_BUDGET_EUR=20` (encrypted): il valore di `.env.example` e di `render.yaml`.
- **Le 21 chiavi** sono quelle di `app/api/health/route.ts`: `ENV_VITALI` (4) + `ENV_IMPORTANTI` (17).
  Mancano: `SUPABASE_SERVICE_ROLE_KEY` (vitale: senza, `/api/health` resta 503), `STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`,
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SUPPORT_EMAIL`.
- **Arretrato**, letto in sola lettura sul database del sito (`clmpyfvpvfjgeviworth`) alle 15:30:
  `email_queue` 7 non spedite (`winback_60d` 3, `tutorial_day2`, `welcome`, `reengagement_14d`,
  `first_order_promo`; dal 2026-06-09 al 2026-08-20; 6 già scadute; destinatari tutti `buyer`).
  `claim_pending_emails` non ha limite d'età. `list_abandoned_carts_to_recover(4)` neanche: 3 carrelli
  oggi, dal 2026-09-07. Notifiche mai spinte 397, ma `send-push` prende solo l'ultima ora. Ordini: 1
  in tutto (2026-06-24), 0 fermi a `NEW`, 0 versamenti `HELD` da rilasciare, 0 checkout aperti, 0
  cancellazioni richieste. `cron_heartbeats`: 7 lavori fermi al 2026-07-30, `expire-stale-orders` al
  2026-06-15, `external-price-alerts` e `riquadra-casse` mai partiti.
- **Webhook Stripe**: `app/api/stripe/webhook/route.ts`, 13 eventi — `checkout.session.completed`,
  `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
  `checkout.session.expired`, `payment_intent.succeeded`, `payment_intent.payment_failed`,
  `charge.refunded`, `charge.refund.updated`, `charge.dispute.created`, `charge.dispute.closed`,
  `account.updated`, `transfer.reversed`, `payout.failed`. `account.updated` e `payout.failed`
  riguardano i conti dei negozi: arrivano solo se l'indirizzo ascolta anche i conti collegati.
  Stripe e i rimandi: https://support.stripe.com/questions/webhooks-what-to-do-when-the-http-status-code-starts-with-a-three-(3xx)
- **Ripubblicazione**, con «fatto 154»: `create_deployment` con `deploymentId:
  dpl_Ez1mAY1U45UnDxjuWQQTHn5BHUq5` (commit `64f163a`, che è anche la `main` del sito oggi), target
  `production`. Prova dopo: `/api/health` → 200 e `cron_heartbeats` con data di oggi.
