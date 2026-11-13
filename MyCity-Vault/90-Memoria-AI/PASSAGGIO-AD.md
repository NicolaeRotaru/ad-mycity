---
tipo: passaggio
data: 2026-11-13 04:40
da: session_015BmpnVpk1kywXGH5kMWQTH (la quarta chat dell'AD, arrivata a 508 mila token su un milione: regola 7)
a: session_015BmpnYWmNDPKAztZMPww6M (la quinta chat)
---

# Il passaggio dell'AD

Questo foglio serve alla quinta chat dell'AD per ripartire senza rileggere la quarta. Esempio: la quarta era a 508 mila
token su un milione, e ogni sua risposta li rileggeva tutti.

## Il punto adesso
- ✅ Fatto: stanotte sono unite tre richieste, e il sito ha l'onda 1.
  - La #949 (memoria) e la #948 (CI della macchina in 3 minuti, su Ubuntu 24.04) sono sul ramo principale.
  - Alle 04:33 Nicola ha unito la mycity#288, l'onda 1 del sito, con «Create a merge commit»: `a19ff89`.
  - Prima dell'unione l'AD ha tolto la migrazione 350 del bonifico. In un caso pagava due volte lo stesso ordine. È la scelta «a» di Nicola.
  - L'AD ha anche fissato Ubuntu 24.04 sulle prove nel browser del sito: su 26.04 Chromium non si installa.
  - Il testo per aprire l'onda 2 è pronto in `consegne/riparazioni/2026-11-12-sito-tutto/AVVIO-ONDA-2.md`.
- ⏳ In corso: due cose aspettano.
  - La terza chat fa i controlli sulla produzione dopo l'unione, e manda l'esito all'AD in una riga.
  - La #950, con la memoria di stanotte e questo foglio, è verde e aspetta Nicola.
- 👉 Tocca a Nicola, in quest'ordine:
  - Unire la #950.
  - Aprire l'onda 2: sessione nuova su ad-mycity `main`, ultracode acceso, incollare il testo d'avvio.
  - Confermare la regola sulle sessioni-cartella: in bacheca è «da confermare», ed è già scritta nel testo d'avvio.
  - Confermare due richieste fatte alla sessione `…ZCaWUi`: il piano per portare a 9 i voti del codice, e la radiografia del codice coi difetti nel registro.
  - Le scelte vecchie che restano: il difetto AR-1173, le tre esenzioni del cancello dello stop, e le due scelte della #947.
- 🕐 Da sapere: la quota settimanale è in avviso fino al 19/11 alle 10. Il tasto «Bonifico fatto» del pannello admin dà errore finché l'onda 2 non ripara la 350.

## Cosa non ho verificato
- La produzione dopo l'unione: la controlla la terza chat. Se Vercel fallisce, la versione di prima si rimette online.
- Che la regola sulle cartelle sia quella che Nicola intendeva: lui non l'ha ancora confermata.

---

## Dettagli tecnici

**Da leggere per primi:** `cervello/MANUALE-AD.md` · `cervello/sessioni-insieme.md` · `BACHECA-SESSIONI.md` ·
`LAVORO-APERTO.md` · card 237 in `AZIONI-IN-ATTESA.md` · `DECISIONI.md` dalle 03:40 in poi.

**Il ramo:** `claude/sweet-galileo-0skkay`, ripartito da `main` a `54d3605` dopo l'unione della #949. Ci sta sopra la #950.
Quando la #950 è unita, il ramo riparte da `main` (force-with-lease, solo storia già unita).

**Il sito:** main a `a19ff89`. Pubblicazione in produzione `dpl_4KcBsVJntBqWWw4TzGJwpGVAYEzC`, progetto Vercel
`prj_XvKD8R89QzA7qVyOhltfS85SH4k9`, team `team_O5b1EUNnEQWvcXSNlos567lo`. La versione di prima da rimettere online è
`dpl_EedXsADXpbHjqEmd6SM8FB6wrQs6`. Il database è `clmpyfvpvfjgeviworth`: dopo l'unione non gli manca nessuna migrazione.
Il pulsante «migrazioni a mano» non si usa, perché applica tutto ciò che manca. Il rilascio dalla CI del sito non ha le chiavi di
Vercel e si ferma prima delle migrazioni. Vercel pubblica `main` da solo (`vercel.json`). Per scrivere sul deposito del sito
serve `add_repo` con accesso «push».

**Le sessioni:**
- Terza chat `session_015BmpnZ5ufx6s554FgYbUju`: da non usare, ma Nicola le scrive. Fa i controlli sulla produzione
  (workflow `wf_e2587adc-1ab`) e scrive solo lo storico del sorvegliante sul ramo.
- Giudizio sul codice, seguito, `session_015BmpnZCaWUijDqfTAvJ4Dx`: tiene la #947, verde. Se la #950 è unita prima, il
  conflitto su bacheca e stato lo sistema lei.
- CI in 3 minuti `session_015BmpnWjSJvwxssvANzndUF`: finita, la #948 è unita. È a 36,8 $ e 761 mila token: non scriverle.
- Regista vecchia `session_015BmpnXsL6Y7tP3BhawauHw` e radiografia in sessioni `session_015BmpnVn722KGUHR5nRn23Z`: ferme.

**Il conto:** la quarta chat è costata 18,59 $ fino alle 04:37.
