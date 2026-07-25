---
tipo: consegna-di-passaggio
data: 2026-07-25 02:45
programma: intelligenza (rendere la macchina pronta al business)
stato: round 1 e 2 chiusi e verificati · round 3 da avviare
---

# 🎓 Programma intelligenza — passaggio al round 3

> **Perché questo file esiste.** Il round 3 doveva partire da un prompt che Nicola
> incollava a mano in una sessione nuova. Cioè: la macchina che sta imparando a
> ricordare si sarebbe fatta ricordare le cose da lui. Nicola l'ha fatto notare
> (chat 25/7 ~02:45) e ha ragione. Il passaggio vive qui, non in una clipboard.

## Come è nato il programma

Nicola ha chiesto: **«la macchina è pronta a gestire il business? è abbastanza
intelligente? sa ragionare correttamente?»**

Verdetto dell'analisi (24/7): sa ragionare bene sul piano tattico-tecnico — trova
la causa radice, contraddice Nicola quando lui ha torto (PR #510: ha guardato il
diff invece di fare il rollback chiesto, e la PR era innocente), rifiuta un blitz
rischioso sui 16 difetti, e ha bloccato una domanda da 10.000€ incompleta. Ma
fallisce su due assi che contano per il business:

1. **Sa imparare, non sa cambiare** — applica il 17-18% delle lezioni che scrive.
2. **Non sa prevedere le conseguenze delle proprie mosse** — 35 previsioni chiuse,
   nessun reparto affidabile, scarti spesso >90% sulle stime.

E i freni di sicurezza (🟢🟡🔴) erano staccati: 8 bloccanti aperti.

Nicola: *«voglio concentrarmi sul rendere la macchina sempre più intelligente
finché non è davvero pronta, facciamo analisi su analisi»*.
**Obiezione dell'AD, accettata:** «analisi su analisi» è la malattia, non la cura
(93 difetti trovati, 62 chiusi). Il metodo diventa **misura → cambia → riverifica**.

## Dove siamo (verificato sul VPS da Nicola, 4 controlli su 4)

| voce | oggi | pronta a |
|---|---|---|
| applica le lezioni che scrive | 18% (83/473) | ≥ 70% |
| sa prevedere le sue mosse | 0 reparti su 14 | ≥ 5, AD incluso |
| freni di sicurezza rotti | **6** (era 8) | 0 |
| quaderni vivi | 31 su 120 | ≥ 60% (72) |
| voto salute | 43/100 | ≥ 80 |

**0 voci su 5 superate.** Non è pronta, e adesso lo dice con dei numeri.

- **Round 1 — PR #534 (mergiata):** `cervello/pagella-intelligenza.mjs`. Le 5 voci
  vengono da fonti già esistenti e verificabili, mai auto-dichiarate. `--gate` esce
  1 se una voce è **peggiorata**: smaschera il fix finto.
- **Round 2 — PR #535 (mergiata):** `cervello/cantiere-prove.mjs` +
  `cervello/round2-applica.mjs` (già applicato sul VPS).

## La scoperta da cui parte il round 3

La pagella, al primo uso, ha segnato **«freni fermi a 8»** dopo che il fix del
freno budget-token era appena stato mergiato. Verificato di persona: il freno
**scatta davvero** (99.999 token stimati con soglia 1.000 → `SOGLIA SUPERATA`;
500 → nessun allarme). Non mentiva il fix: **mentiva il registro.**

Due cause, entrambe invisibili agli strumenti che c'erano:
1. AR-144 era marcato `verifica:{tipo:"umano"}` → nessun guardiano potrà mai chiuderlo.
2. AR-117 aveva la prova puntata al **file sbagliato** (cercava `token_stimati` in
   `giro.sh`, il fix è in `costo-ai.mjs`).

Per `auto-fix.mjs` «pattern assente» e «puntatore rotto» sono indistinguibili.

**Portata: 27 difetti su 30 non sono chiudibili da nessun guardiano.** E i 13
classificati `auto-sospetta` hanno **tutti la stessa età — 9 giorni**: sono nati
insieme dalla radiografia del 16/7 e nessuna delle loro prove ha mai fatto centro
neanche una volta. Non si sono rotte col tempo: **sono nate descrivendo il fix che
si voleva fare, non un controllo verificabile.** (Esempi: AR-133 cerca
`verify-marge` in `giro.sh`; AR-130 cerca una freccia unicode in un file agente.)

## Il round 3

Obiettivo: **i due freni che proteggono la firma di Nicola.**

- **AR-110** — il percorso firma→esecuzione non chiude: l'«Approva» del Pannello non
  scrive mai il marcatore che l'esecutore cerca.
- **AR-109** — l'autopilota si fida del colore 🟢🟡🔴 che l'azione si auto-dichiara.

### Primo passo obbligatorio, prima di scrivere una riga di codice

**Verificare se quei due problemi esistono ancora davvero.** Sono entrambi
classificati `auto-sospetta`, quindi la loro prova potrebbe puntare al file
sbagliato — esattamente com'era per il freno budget. Leggere il codice reale, non
il registro. Se uno dei due risultasse già risolto, è la notizia migliore possibile.

Da valutare nello stesso round: **AR-155** (test automatico del freno budget). Senza,
la verifica resta un comando da ricopiare a mano — e un comando ricopiato a mano è
già arrivato sbagliato una volta.

### La regola del ciclo (vale anche per chi lavora al round 3)

Chiudi un difetto → **rimisura** con `node cervello/pagella-intelligenza.mjs --gate`.
Se il numero non si muove, il fix era finto.

## Note pratiche imparate a caro prezzo

- La macchina sul VPS sta in **`/opt/mycity/ad-mycity`** (NON in `~/ad-mycity`).
  È scritto nei file dei servizi: leggerlo, non indovinarlo.
- La sessione cloud **non ha il permesso di `git push`** (è AR-142, ancora aperto):
  si pubblica via API GitHub. I file grandi (`cantiere-difetti.json` 141KB,
  `giro.sh` 56KB, `DECISIONI.md` 459KB, `STATO.md` 412KB) non ci passano senza
  rischiare una trascrizione corrotta — per quelli serve uno **script di
  applicazione idempotente** come `round2-applica.mjs` o
  `registra-programma-intelligenza.mjs`, che Nicola lancia sul VPS.
- **Ogni comando di verifica dato a Nicola va ESEGUITO prima di consegnarglielo.**
  Nel round 2 gliene è arrivato uno rotto proprio nello strumento che serviva a
  controllare l'AD (mancava `oggi.data`: il cambio di giorno azzerava il contatore
  prima del controllo).
- Il ramo di lavoro riparte da `main` aggiornato.

## Lezione strutturale del round 2

Lo stesso difetto è emerso in **quattro** punti diversi: quaderni fermi (89),
lezioni applicate al 18%, registro dei difetti congelato (27 su 30) — e infine
nell'AD stessa, che ha costruito due round contro «la macchina non registra ciò che
fa» senza registrare nulla di ciò che aveva fatto.

**Un lavoro 🟡 non è finito quando la PR è mergiata: è finito quando la memoria lo sa.**
