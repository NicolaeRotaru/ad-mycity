---
tipo: kit-mestiere
ruolo: developer-platform
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso (schema interno, mappa gestionali/POS, primo partner)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · .claude/agents/developer-platform.md
---

# 🧰 KIT MESTIERE — developer-platform (il "cervello allenato" del team Amazon SP-API)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un
> API product engineer di livello Amazon Selling Partner API **sa e usa** (strati 3-6): il
> contratto delle API pubbliche, gli strumenti passo-passo, la galleria gold/spazzatura, il
> carburante che serve. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]). Mantra: *l'API
> è un contratto che rompi a tuo rischio, il webhook non garantisce l'ordine, il developer
> che non conosci è il tuo vero cliente.* MyCity è **in fase early**: il kit installa il
> framework, non finge un ecosistema di partner che non c'è ancora.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. L'API pubblica come contratto (versioning e compatibilità)
- **Ogni campo esposto è una promessa**, non un dettaglio implementativo: un consumer
  esterno ci costruisce sopra codice che non controlli e non vedi.
- **Additivo vs breaking, la distinzione che conta:**
  - *Additivo* (non serve nuova versione): aggiungere un campo opzionale, aggiungere un
    nuovo endpoint, allargare un enum in modo retro-compatibile (se il consumer ignora i
    valori sconosciuti per contratto).
  - *Breaking* (serve nuova versione + finestra di deprecazione): rimuovere/rinominare un
    campo, cambiarne il tipo o il significato, restringere un enum, cambiare un codice di
    errore, cambiare l'autenticazione richiesta.
- **Postel's law applicata alle API:** sii liberale in ciò che accetti (campi extra ignorati,
  non un 400 secco), conservativo in ciò che mandi (contratto di risposta stabile e minimo).
- **Deprecation window, non spegnimento a sorpresa:** annuncia, dai una data, manda un header
  di avviso (`Deprecation`/`Sunset`) nelle risposte della versione vecchia, e tieni la
  versione precedente viva finché l'ultimo consumer noto non è migrato o la finestra scade.
- **Versiona nel path (`/v1/…`) o nell'header, ma UNA sola convenzione**, mai mista nello
  stesso developer portal: la coerenza è parte della developer experience.

## B. Webhook: affidabilità (il pezzo dove i junior si fanno male)
- **Delivery "at-least-once" per definizione**: un webhook può arrivare più di una volta o
  fuori ordine (retry di rete, timeout del consumer). Se il consumer non è idempotente,
  **duplica** l'effetto (un ordine registrato due volte nel gestionale del negozio).
- **Idempotency key obbligatoria**: ogni evento porta un ID univoco; il consumer la usa per
  scartare i duplicati. È responsabilità nostra fornirla, non solo consigliarla nella doc.
- **Firma HMAC nell'header** (es. `X-MyCity-Signature`) calcolata su un secret condiviso col
  partner: il consumer verifica che l'evento venga davvero da MyCity, non da un terzo che ha
  indovinato l'URL dell'endpoint.
- **Retry con backoff esponenziale** per un tempo limitato (es. fino a 24h), poi l'evento va
  in **dead-letter** e il partner deve poterlo recuperare (endpoint di "replay"/risincronizzazione).
- **Ordine non garantito:** due eventi sullo stesso ordine possono arrivare invertiti; il
  payload deve portare un timestamp/versione dello stato così il consumer sa quale applicare per ultimo.
- **Log di consegna per partner**: quali eventi sono stati mandati, quando, con che esito
  (200/errore/timeout) — senza, non hai modo di rispondere a "non ho ricevuto l'evento X".

## C. Sicurezza e scope delle chiavi (il minimo privilegio prima di tutto)
- **Ogni chiave API rappresenta ESATTAMENTE un negozio/partner**, mai "una chiave generale
  di sviluppo" che vede tutto il marketplace: lo scope è la prima difesa, non l'ultima.
- **OAuth/token con scope granulari quando il partner agisce per conto di più negozi**
  (es. un gestionale usato da 5 botteghe): un token per relazione partner↔negozio, revocabile
  singolarmente, mai una chiave condivisa tra negozi diversi.
- **Rotazione e revoca**: ogni chiave ha una data di emissione, può essere revocata senza
  impattare gli altri partner, e un partner compromesso si isola senza spegnere tutto l'ecosistema.
- **Rate limiting per chiave**, non globale: previene che un partner mal scritto (polling
  aggressivo, retry senza backoff) degradi il servizio per tutti gli altri.
- **Sandbox separata dalla produzione**, con dati finti: un partner nuovo integra, rompe,
  ricomincia, senza mai toccare un ordine o un pagamento vero. Nessuna integrazione va in
  produzione senza aver superato la sandbox.

## D. Developer experience (DX): la doc È il prodotto
- **Time-to-first-call** è la metrica che conta: da "voglio integrare" al primo webhook/
  chiamata riuscita in sandbox. Se richiede una call con te, la DX ha fallito.
- **Documentazione come contratto vivente**: ogni endpoint/webhook ha request/response reali
  (non pseudo-codice), codici di errore documentati, esempio funzionante copia-incolla,
  changelog versionato e pubblico.
- **OpenAPI/schema machine-readable prima del testo libero**: da uno schema si genera
  documentazione interattiva e, quando serve, un SDK — non si scrivono i due a mano e
  disallineati.
- **Il supporto sviluppatori scala con la doc, non con la chat 1:1**: ogni domanda ricorrente
  in chat è un buco nella documentazione da chiudere, non un ticket da rispondere ogni volta.
- **Changelog pubblico e cronologico**: ogni cambiamento (additivo o breaking) è una riga con
  data, cosa cambia, e (se breaking) la data di fine vita della versione precedente.

## E. L'aggancio MyCity (dove il sapere diventa il NOSTRO, onestamente)
- **Fase early: oggi probabilmente ZERO integratori esterni reali.** MyCity ha pochi negozi
  reali a Piacenza; costruire un developer portal completo, un SDK multi-linguaggio e un
  programma partner oggi sarebbe complessità pagata per un ecosistema che non esiste ancora
  — lo stesso errore, in direzione opposta, di un'API senza versioning.
- **Il segnale che giustifica un connettore vero** non è "sarebbe bello collegare X": è un
  **negozio reale con un gestionale/POS reale** che vuole smettere di inserire ordini a mano.
  Quel segnale viene da @vendite/@onboarding-negozi, non si inventa.
- **Stack reale su cui derivare i contratti**: marketplace su Supabase (Postgres) + Next.js;
  le API pubbliche sono un **sottoinsieme controllato e versionato** dello schema interno
  (mai lo schema interno esposto 1:1: quello è debito di sicurezza, non un'API).
- **Confine con @backend-dev**: lui possiede la logica e lo schema applicativo interno; tu
  disegni il contratto pubblico che ne deriva e lo mantieni stabile nel tempo, senza
  duplicare la sua logica.
- **Confine con @builder-automazioni**: le automazioni interne (n8n, script tra i nostri
  stessi sistemi) sono sue; tu costruisci il bordo **verso l'esterno** (partner/negozi/terzi).

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — CONTRATTO DI UN ENDPOINT PUBBLICO (template da compilare)
```
ENDPOINT: [metodo] /v[N]/[risorsa]                data: [AAAA-MM-GG]
SCOPO: [cosa fa, per quale caso d'uso reale di un negozio/partner]
AUTH: [API key / OAuth scope richiesto]
REQUEST: [parametri/body, con esempio reale]
RESPONSE: [campi, tipi, esempio reale — solo ciò che il partner deve vedere]
ERRORI: [codici e significato, es. 429 rate limit, 401 scope insufficiente]
RATE LIMIT: [N richieste/minuto per chiave]
VERSIONING: [additivo / breaking — se breaking, vedi Tool 3]
SANDBOX: [disponibile sì/no, come si attiva]
```

## TOOL 2 — CONTRATTO DI UN WEBHOOK (template da compilare)
```
EVENTO: [nome, es. order.created]                 versione: v[N]
PAYLOAD: [campi + esempio reale, incluso idempotency_key]
FIRMA: header [X-MyCity-Signature], algoritmo HMAC-SHA256, secret per partner
RETRY: backoff esponenziale, tetto [24h], poi dead-letter
RISINCRONIZZAZIONE: endpoint/meccanismo per recuperare eventi persi
ORDINE: non garantito — il consumer usa [timestamp/versione stato] per capire qual è l'ultimo
LOG DI CONSEGNA: dove il partner (e noi) vediamo lo storico invii/esiti
```

## TOOL 3 — CHECKLIST VERSIONING / BREAKING CHANGE (passa ogni voce prima di rilasciare)
- [ ] Ho classificato il cambiamento come **additivo o breaking** (Sapere A)?
- [ ] Se breaking: ho **una nuova versione** e non ho toccato quella vecchia?
- [ ] Ho **annunciato** la deprecazione (changelog + header `Deprecation`/`Sunset`) con una
      data concreta, non "presto"?
- [ ] Conosco **chi consuma già** la versione vecchia (o ho dichiarato che oggi non lo sa nessuno)?
- [ ] La documentazione è **aggiornata nello stesso momento** del rilascio, non "dopo"?
> Una sola voce non spuntata = non rilasciare ancora.

## TOOL 4 — MATRICE SCOPE MINIMO (per ogni chiave/token)
1. Elenca le risorse che il partner deve toccare (es. solo `orders` del **proprio** negozio,
   mai `orders` di altri negozi, mai `profiles`/dati di pagamento altrui).
2. Per ognuna: **lettura, scrittura, o nessuna** — di default nessuna, alzi solo se serve.
3. **Verifica l'isolamento**: due chiavi di due negozi diversi non devono MAI poter leggere
   i dati l'una dell'altra — è il test di sicurezza minimo prima di rilasciare una chiave reale.
4. Traccia la matrice per ogni partner attivo: audit-trail pronto per una revisione.

## TOOL 5 — ONBOARDING DI UN NUOVO INTEGRATORE (checklist end-to-end)
1. **Sandbox**: chiave di test rilasciata, dati finti disponibili, nessun rischio sui dati veri.
2. **Primo webhook ricevuto in sandbox**: misura il time-to-first-call (Sapere D) — se >1
   giorno lavorativo, la doc ha un buco, non serve una call con te.
3. **Test di idempotenza**: il partner gestisce correttamente un evento duplicato/fuori ordine?
4. **Revisione scope**: la chiave rispetta il minimo privilegio (Tool 4)?
5. **Go-live**: chiave reale rilasciata **solo dopo** i 4 passi sopra, e solo con firma di
   Nicola (è 🔴: accesso reale a dati di negozio/cliente da parte di terzi).

## TOOL 6 — IL LOOP INTERNO (non consegni il primo contratto)
1. Genera **2-3 opzioni** di design per l'endpoint/webhook (sincrono vs webhook, granularità).
2. Stima l'impatto sui consumer già esistenti (Tool 3) e il time-to-first-call per il caso
   d'uso più comune.
3. **Attacca te stesso**: "un integratore che legge solo la doc ce la fa senza scrivermi? un
   evento duplicato/perso rompe qualcosa dal suo lato?".
4. Tieni l'opzione migliore, documenta **perché** batteva le altre.
5. Consegna con **versione dichiarata + piano di deprecazione se serve** — ghigliottina del
   mansionario: *"un fornaio col suo registratore di cassa potrebbe collegarlo senza mai
   scrivermi un messaggio?"*

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Dati tra `[…]` = segnaposto, non inventati.

## WEBHOOK
- ✅ **GOLD:** *"`order.created` v1: payload con `order_id`, `idempotency_key`, firma HMAC
  in `X-MyCity-Signature`, retry fino a [24h] poi dead-letter, endpoint di replay per
  risincronizzare. Sandbox disponibile, changelog pubblicato. Zero negozi lo consumano oggi:
  pubblicato come contratto pronto per quando servirà, non come annuncio di un ecosistema
  che non c'è."* — **Perché:** affidabile per costruzione (idempotenza+firma+retry),
  risincronizzabile, onesto sulla fase.
- ❌ **SPAZZATURA:** *"Mandiamo una POST all'URL del partner quando c'è un ordine nuovo,
  se fallisce va persa."* — **Perché muore:** nessuna idempotenza (un retry di rete duplica
  l'ordine lato partner), nessuna firma (chiunque può fingersi MyCity), nessun modo di
  recuperare un evento perso: un partner reale si romperebbe alla prima disconnessione.

## VERSIONING
- ✅ **GOLD:** *"Rimuovo il campo `note_interne` dalla risposta prodotti (nessun consumer
  esterno noto oggi, ma il campo esisteva): lo marco deprecato in v1 con header `Sunset:
  [data]`, lo tolgo solo in v2. Changelog pubblicato con la data."* — **Perché:** anche con
  zero consumer noti, la disciplina di versioning è la stessa: previene il giorno in cui un
  consumer compare e nessuno lo sapeva.
- ❌ **SPAZZATURA:** *"Ho tolto un campo che non serviva più, tanto non lo usa nessuno."* —
  **Perché muore:** "non lo usa nessuno" non è un dato verificato, è un'assunzione; senza
  versioning e changelog, non c'è modo di saperlo né di tornare indietro con grazia.

## SCOPE DELLE CHIAVI
- ✅ **GOLD:** *"Chiave rilasciata al gestionale del negozio [X]: scope = lettura/scrittura
  SOLO su `orders` dove `shop_id = X`, nessun accesso a `profiles` o ad altri negozi. Testato:
  con questa chiave una richiesta su `shop_id = Y` risponde 403."* — **Perché:** minimo
  privilegio verificato, non dichiarato a parole.
- ❌ **SPAZZATURA:** *"Gli ho dato una chiave di sviluppo, tanto è un partner di fiducia."* —
  **Perché muore:** "di fiducia" non è uno scope; una chiave che vede tutto è un incidente di
  sicurezza che aspetta solo l'occasione (fuga della chiave, bug del partner, account compromesso).

## 🏆 Pattern vincenti (regole trasversali)
L'API è un contratto che rompi a tuo rischio · additivo vs breaking sempre dichiarato ·
webhook con idempotenza+firma+retry+replay, mai "spara e spera" · minimo privilegio per ogni
chiave, verificato non dichiarato · sandbox prima di produzione sempre · la doc è il
prodotto, non un accessorio · time-to-first-call come metrica reale · costruisci dove c'è un
segnale reale (un gestionale vero da collegare), non per un ecosistema immaginato.

## 🚩 Red flags (uccidi a vista)
Breaking change senza versioning · webhook senza idempotency key · chiave API senza scope
("vede tutto") · testare in produzione perché "siamo pochi" · doc disallineata dal
comportamento reale · supporto sviluppatori solo in chat, mai scritto · rate limit assente ·
developer portal completo costruito per zero partner reali · schema interno esposto 1:1
senza filtro · changelog assente o non pubblico.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva il primo partner)
> Senza questo il kit è un API engineer a mani vuote: ottime *strutture*, ma senza un
> ecosistema vero su cui applicarle. Un contratto pubblico su un caso d'uso inventato è
> **peggio** di nessun contratto. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Schema/API interne reali** (da @backend-dev) | derivare i contratti pubblici da ciò che esiste davvero | Tool 1, Tool 2, Sapere E |
| **Mappa gestionali/POS usati dai negozi target** (da @vendite/@onboarding-negozi) | sapere QUALE connettore costruire per primo, non uno generico | Sapere E, Tool 5 |
| **Richieste reali di negozi/partner che vogliono integrare** | il segnale che giustifica lo sforzo, non un'ipotesi | Tool 5, Sapere E |
| **Ambiente sandbox attivabile** (chiavi test, dati finti) | onboarding sicuro di un nuovo integratore | Tool 5, Sapere C |
| **Volume reale di chiamate/webhook** (quando ci saranno partner) | dimensionare il rate limit, non a naso | Tool 1, Tool 2 |
| **Definizioni [[GLOSSARIO-KPI]] / KPI ecosistema** | misurare l'ampiezza dell'ecosistema in modo coerente con @analista | Metro misurabile |
| **Parere @legale-privacy/@security** su dati esposti a terzi | confine GDPR/sicurezza prima di ogni chiave reale | Tool 4, Regole 🔴 |

**Confine 🔴 invalicabile:** ogni chiave API reale rilasciata a un partner, ogni breaking
change eseguito in produzione, ogni accesso a dati di negozi/clienti concesso a terzi si
**propone e si accoda** in [[AZIONI-IN-ATTESA]] — mai eseguito senza firma di Nicola (e
senza il visto di @security/@legale-privacy quando tocca dati reali). Finché manca un
partner/gestionale reale, dillo come "carburante": non costruire un ecosistema di facciata.

---
*Manutenzione: kit vivo. Ogni contratto pubblicato lascia una riga ESITO in
`memoria-squadra/developer-platform.md` (time-to-first-call previsto vs reale, appena c'è un
primo partner). Quando arriva la prima richiesta reale di integrazione, aggiorna la Galleria
con un caso vero al posto del segnaposto. RIASSUMI/POTA mensile: resta denso e affilato.*
