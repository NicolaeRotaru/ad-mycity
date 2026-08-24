---
tipo: checklist-personale
destinatario: Nicola
fonte: AD digitale (rigenerata da AZIONI-IN-ATTESA + STATO · AR-030)
aggiornato: 2026-08-24 13:15
---

# ✅ Cose che devo fare io (Nicola)

> Solo ciò che richiede **te**: firme, merge, materiali, decisioni umane.
> Rigenerata perché era ferma al 21/8 14:40 (oltre i 2 giorni della regola AR-030).
>
> Business ancora **fermo**. 1 ordine totale, mai pagato, del 24/6. 0 ordini pagati. Stallo **61
> giorni**. La pausa concordata con te arriva al 24/8-1/9: scade oggi/domani.
>
> 🔴 **La cosa più urgente.** Mancano 5 giorni alla data zero del 29 agosto. L'hai fissata tu il 23/8.
> Le quattro carte che sbloccano tutto restano ferme da 2-3 giorni. Sono in cima a questa lista.
>
> **Riverificato in diretta in questo giro (24/8).** Il sito pubblico risponde ancora **HTTP 503**.
> Non l'ho dedotto dal sensore: l'ho controllato ora, io stessa. Il profilo
> `nicolarotaru2000@gmail.com` (20/8) resta l'unico nuovo. Ancora nessuna tua risposta: è un tuo
> test o un cliente vero?
>
> **Novità tecnica di questo giro.** Ho trovato un canale per far girare l'equivalente dei test del
> cervello, bloccati da giorni dai permessi. Risultato: 2318 verdi, **3 rossi**. Uno è uno strumento
> costruito che nessuno esegue più. Due sono controlli di coerenza della memoria. Nessuno dei tre
> tocca il marketplace live. Restano in coda per quando il ritmo riparte.

---

## 🔴 IL SITO E' SU VERCEL, MA GLI MANCANO DUE COSE PER FUNZIONARE DAVVERO

- [ ] 🔴 **Metti le chiavi che mancano fra le variabili su Vercel.** Ne manca una senza cui **un pagamento riuscito non diventa un ordine**: il sito non riesce a scrivere quando Stripe ci avvisa che qualcuno ha pagato. Nei registri della produzione, fra il 18 e il 21 agosto, ci sono 70 errori con dentro il nome di quella chiave.
  → Card `#154` in [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Sposta il dominio su Vercel.** `mycity-marketplace.com` punta ancora all'indirizzo di Render, che non è più pagato: per questo dal 30 luglio non risponde. Il sito nuovo funziona, ma vive a un indirizzo che non conosce nessuno.
  → Card `#155` in [[AZIONI-IN-ATTESA]]

---

## 🔴 IL BLOCCO VERO AL PRIMO INCASSO

- [ ] 🔴 **Fai finire a Pane Quotidiano la pratica dei pagamenti Stripe.** Oggi il negozio non può incassare: dati mai inviati, incassi disattivati, versamenti disattivati. Serve che il fornaio completi la pratica coi suoi dati (documento, azienda, conto per l'accredito).
  → Card `#62` in [[AZIONI-IN-ATTESA]]

---

## 🔴 DAL LOTTO DI RIPARAZIONI DEL 20-21/8 — aspettano solo la tua firma

- [ ] 🔴 **Applica la migrazione 124 sul database**: senza, la vetrina dei negozi resta vuota (bollino "Verificato" mancante su 6 pagine).
  → Card `#140` in [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Fai partire il rilascio solo a controlli verdi**, non insieme a loro (3 mosse su Vercel/GitHub, tutte tue).
  → Card `#141` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Un Supabase di prova**, per i controlli che oggi si saltano da soli.
  → Card `#139` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Il server lavora ma non pubblica più niente da tre giorni.**
  → Card `#138` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Approva il fattorino dal pannello**: adesso il pulsante c'è.
  → Card `#137` in [[AZIONI-IN-ATTESA]]

- [ ] 🔴 **Del database non esiste nessuna copia**: mancano due segreti per farla partire.
  → Card `#134` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Fai valere anche domani il plugin acceso oggi** (2 righe in `.claude/settings.json`).
  → Card `#142` in [[AZIONI-IN-ATTESA]]

---

## 🟡 Rimane da capire (parziale, non bloccante)

- [ ] 🟡 **Card #38 — tre punti sui soldi non ancora verificabili da qui.** Doppia vendita dopo checkout scaduto. Rider mai pagato su spedizione gratis. Reclamo che blocca il negozio per sempre. Servirebbe leggere il codice del sito, non solo il database.
  → Card `#38` in [[AZIONI-IN-ATTESA]]

---

## 🔴 RICHIESTE DI UNIONE (PR) DA FIRMARE

Oggi nessuna è pronta.

Sul repo `ad-mycity` (memoria/cervello) ci sono **9 PR aperte, tutte rosse**: `#840`, `#804`, `#791`,
`#761`, `#754`, `#753`, `#749`, `#741`, `#735`. Di queste, **4 rossi vengono dal ramo `main`** e si
trascinano su più PR insieme: ripararli lì una volta sola ne sbloccherebbe diverse insieme. Nessuna è
mergiabile oggi.
Lo script che le ripara (`test-cervello.mjs`) resta bloccato dai permessi in questa sessione.
È lo stesso buco delle card #104/#42. Serve una sessione con permessi più larghi sul VPS per chiuderlo.

---

## 🟡 DECISIONI RAPIDE (una parola/un click bastano)

- [ ] 🟡 **Togli alla macchina il permesso di eseguire qualunque programma si scriva da sola** — nel foglio dei permessi ci sono due righe col jolly. L'elenco esplicito di 75 programmi veri è già pronto da incollare (`consegne/sicurezza/2026-07-29-permessi-senza-jolly.md`). Sbloccherebbe anche diversi comandi di controllo oggi bloccati in sessione chat.
  → Card `#42` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Quale definizione di "margine" è quella giusta?** Un commit del 16/8 mattina ha cambiato cosa significa `burn_down_margine` nel codice. Il test che lo controlla dice ancora la versione vecchia. Il test del cervello resta rosso finché non scegli quale dei due è quello giusto.
  → Card `#105` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Come vuoi procedere con le PR croniche rosse (#735/#741/#749)?** ① dedico una sessione a chiuderle per davvero, stesso ramo di ciascuna; ② le congelo fino a dopo la pausa negozi del 24/8-1/9.
  → Card `#109` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Va bene che la macchina resti in modalità RISPARMIO fino alla ripresa (24/8-1/9)?** Oggi spegne da sola contenuti pesanti/reel ed esperimenti non essenziali, tiene acceso ordini/consegne/firme/sicurezza.
  → Card `#113` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Il guardiano del primo ordine può imparare a riconoscere la pausa concordata?** Oggi dà sempre l'allarme rosso anche dentro la pausa che hai voluto tu. Se dici sì, preparo la modifica in branch + PR.
  → Card `#97` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Vuoi dedicare una sessione a bonificare tutti i 45 casi di un difetto tecnico nel motore del giro** (`cervello/giro.sh` nasconde alcuni errori dentro una pipe), o preferisci farli a piccoli gruppi?
  → Card `#114` in [[AZIONI-IN-ATTESA]]

- [ ] 🟡 **Apri il sito dal telefono** (`mycity-marketplace.com`) — il sensore lo vede spento (HTTP 503) dal 30/7, coerente con la migrazione a Vercel nota, ma nessuno l'ha mai riconfermato con un occhio umano.
  → Card `#79` in [[AZIONI-IN-ATTESA]]

---

## 🟡 Serve una mano sul VPS (le sessioni cloud non ci arrivano)

- [ ] 🟡 **Rimetti in moto le cadenze**: Piano del mattino/Report della sera fermi da 2-3 giorni, la review settimanale da 9 giorni. Serve una visita al worker sul server (o conferma se è già stato fatto).
  → Card `#77` / `#94` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Rigenera il registro delle prove del cantiere** (`cervello/cantiere-prove.mjs`) da un canale con permessi più larghi — 2 difetti aperti (AR-225, AR-346) hanno perso il comando che li verifica.
  → Card `#86` in [[AZIONI-IN-ATTESA]]

---

## 🟡 Da valutare quando hai un minuto (non bloccanti)

- [ ] 🟡 **Metti la partita IVA vera nell'informativa privacy** (oggi c'è un segnaposto) — l'unico dato che non posso dedurre da solo.
  → Card `#39` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Metti in sicurezza le anteprime del codice** (oggi usano le chiavi vere di Stripe e del database) prima che un fix ancora da approvare tocchi soldi o dati veri.
  → Card `#40` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Rimetti in funzione il comando "radiografia"** — oggi rotto in due punti, riparabile in un branch.
  → Card `#41` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Radiografia di te stessa scaduta** (oltre 5 giorni dall'ultima completa) — di' «radiografia di te stessa» quando vuoi che riparta.
  → Card `#92` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **246 correzioni tue su 311 restano senza un freno che scatta da solo** — servirebbe rilanciare `gate-veri.mjs` da un canale con permessi più larghi.
  → Card `#95` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Non so dire quante lezioni imparate abbiamo davvero applicato** (`tasso-lezioni.mjs` bloccato in sessione chat).
  → Card `#99` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Finisci di riparare i test rossi su PR #722** — non riverificato in questo giro se ancora attuale.
  → Card `#83` in [[AZIONI-IN-ATTESA]]
- [ ] 🟡 **Completa la mappa della macchina**: 65 skill nuove arrivate senza la loro riga di descrizione.
  → Card `#85` in [[AZIONI-IN-ATTESA]]

> ⚠️ **Restano altre righe tecniche in coda** (fix di codice interno, PR da aprire/mergiare lato AD, cure alla memoria) che non richiedono una TUA decisione. Elenco completo, sempre aggiornato: [[AZIONI-IN-ATTESA]] (righe-tabella + blocchi ###, entrambi i formati).
