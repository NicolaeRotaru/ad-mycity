---
data: 2026-11-25 23:30
chi: collaudatore indipendente, lente A (sicurezza), terzo collaudo
ramo: ccr-d58987f6-fnlly3 @ eae5946 (copia in /tmp/claude-0/collaudo3-n8n, niente push, n8n live non toccato)
---

# Terzo collaudo, sicurezza: la lettura delle pagine nei flussi 12 e 26

## In parole semplici
Il pezzo prende gli indirizzi che scrive l'AD, scarica le pagine e ne ricava il testo.
La parte di sicurezza regge: nessun indirizzo interno è passato, su circa 400.000 prove.
Quei casi sono indirizzi della rete della macchina, rinvii verso l'interno e credenziali dentro l'indirizzo.
Anche i tetti dei byte reggono, e sulle pagine non ci sono più punti lenti.
**Però un difetto già dichiarato corretto torna in una variante normale, e il collaudo è BOCCIATO.**
Il difetto è questo: una scritta `<!--` dentro uno script cancella in silenzio il corpo della pagina.
Basta che più in basso ci sia un commento HTML vero, come ne hanno quasi tutte le pagine.
Indirizzo, telefono e orari spariscono, e la pagina risulta comunque «letta».

## Cosa cambia per te
Per esempio, su un sito vecchio di un locale fatto così, la scheda tornerebbe con «non trovato».
È proprio il guaio che questo pezzo doveva risolvere, e nessun avviso lo segnala.

## Cosa devi fare
Decidere tu, perché questo è il terzo collaudo.
La mia raccomandazione: una riparazione piccola in `pagine-testo.js`, prima di montarlo su n8n.
Si tolgono script e stili prima dei commenti, oppure si scorre la pagina una volta sola, come fa il browser.
Il test che diventa verde quando è riparato è già pronto: è in fondo, fra i dettagli tecnici.

## Cosa non ho verificato
- Non ho provato n8n vero. Ho letto il sorgente del nodo HTTP Request V3: con queste impostazioni i rinvii non si seguono (`followRedirect: false`).
  Il passaggio da quell'impostazione ad axios con `maxRedirects = 0` lo ricordo, non l'ho letto: l'accesso a GitHub era negato.
- Non ho il flusso 12 vero: la prova che lo usa è saltata.
  Quindi non ho visto `datoPulito` né come «Leggi la ricerca» unisce i pezzi: i byte li ho ricalcolati con la regola che il codice dichiara.
- Pagine reali: non sono riuscito a scaricarle, il proxy ha risposto 403.
  Quanto spesso capiti `<!--` dentro uno script sui siti di Piacenza non l'ho misurato. Le pagine di prova le ho scritte a mano, sul modello dei siti fatti con Dreamweaver.
- I nomi DNS pubblici che puntano a indirizzi interni sono un limite già dichiarato: non li ho contati come difetto.

---
## Dettagli tecnici

**Suite:** `node --test flussi/test/*.test.mjs` → 274 test, 272 verdi, 0 rossi, 2 saltati.
Ne erano attesi 273 verdi e 1 saltato. Il secondo saltato è ambientale: il listino del 19 cerca `/tmp/claude-0/mycity` vicino alla copia.
(`node --test flussi/test/` con la sola cartella su Node 22.23 fallisce per la sintassi; con il glob va.)

### DIFETTO GRAVE (funzionale: torna il difetto 3.4 del commento, in una variante)
Input: una pagina reale fatta male, un sito vecchio con `<!--` aperto nello script e un commento vero più sotto.
```html
<html><head><title>Trattoria Da Mario</title>
<script language="JavaScript"><!--
function MM_preloadImages() { var d=document; }
</script></head>
<body><p>Via Roma 12, Piacenza</p><p>Tel. 0523 123456</p><p>Chiuso il lunedì</p>
<!-- fine tabella -->
<p>Copyright 2006</p></body></html>
```
Output vero di `htmlInTesto`: `"Titolo della pagina: Trattoria Da Mario\nTrattoria Da Mario"`.
`risposte()` dà `ok: true`: nessun avviso, e la pagina conta come letta.
Variante moderna: `<script>var a="<!--";</script><p>Telefono 0523 337635</p><!-- fine --><footer>Orari 8-20</footer>` → `""`.
Perché succede: `togli('<!--','-->')` gira prima degli script.
Così il `<!--` nello script si accoppia al primo `-->` vero più in basso, e insieme al testo se ne va anche il `</script>`.
Poi `togli('<script','</script')` non trova la chiusura e taglia fino in fondo.
La riparazione di eae5946 copre solo il caso «nessun `-->` dopo». Lo stesso input perdeva il testo anche in e00fbf8, b3a67f0 e 88f3ea5 (provato).
Test che diventa rosso: `/tmp/claude-0/collaudo3-n8n/prove/p10-rosso.test.mjs` (2 su 2 rossi su eae5946).
Gravità: grave. Capita da solo su una pagina fatta male, è silenzioso e colpisce proprio i dati che il pezzo esiste per leggere.

### Minori (servono malafede o un input fuori dal normale)
1. `indirizziIn` cresce col quadrato della lunghezza su una lunga fila di etichette con il punto, senza dominio finale.
   Misure: `a1.` ripetuto per 30 KB → 1,1 s, per 60 KB → 4,4 s; `a.it-` per 60 KB → 7,4 s.
   Lavora solo sugli appunti dell'AD, e nella prosa normale resta a 0 ms.
2. In «Ritocca l'anteprima», `RE_META` più il ciclo che accorcia di 40 caratteri crescono col quadrato su avvisi lunghi: 50 KB → 2,8 s.
   Gli avvisi veri sono corti.
3. La maschera di Meta si aggira con uno spazio invisibile: `facebook​.com/bar` arriva sull'anteprima così com'è. Serve offuscare apposta.
4. Il testo di una pagina può falsificare le righe `--- PAGINA: … ---` e `=== …`.
   Che il testo sia un dato lo dice solo una frase, non un delimitatore che la pagina non possa imitare. Serve malafede.
5. `<p title="<script">` in un attributo taglia il resto della pagina: raro.
6. Nessun tetto alla dimensione del download sul nodo HTTP: il nodo 4.2 non ha l'opzione.
   Inoltre il timeout di axios conta il silenzio della connessione, non la durata totale: un server che manda i byte a goccia supera i 15 s.
   Il codice taglia comunque a 1 milione di caratteri, ma n8n tiene in memoria tutta la risposta. Non provato su n8n.
7. L'elenco dei DNS jolly è per forza incompleto (mancano `local.gd`, `localh.st`, `rbndr.us`, `1u.ms`): rientra nel limite DNS già dichiarato.

### Le cose già corrette, rilanciate nella variante scomoda
| # | Difetto | Tornato? | Prova |
|---|---|---|---|
| 1.1 | ReDoS nella lettura delle pagine | no | `htmlInTesto`/`sottopagine`/`risposte` con 30 forme cattive da 1 e 5 MB: tutte ≤ 200 ms (`p4-tempi.mjs`) |
| 1.2 | host vero dopo la `@` | no | `a@b@`, `:@`, `\@`, tab e a capo, `%40`: tutti scartati o ricostruiti sull'host giusto (`p1-ssrf.mjs`) |
| 1.3 | nomi jolly | no (elenco) | nip.io, sslip.io, traefik.me, sliplane scartati; vedi minore 7 |
| 1.4 | tetto dei byte | no | `p8-byte.mjs`: con pagine cinesi, caratteri che JSON gonfia, `<>`, indirizzi da 390 caratteri e foto, quello che aggiunge n8n sta sempre sotto `65024-9000-elenco`. Quando gli appunti sono già fuori tetto, n8n non aggiunge niente |
| 2.1 | byte della richiesta all'AD | no | come sopra |
| 2.2 | Meta nascosto sull'anteprima | no (forme normali) | 7 forme normali nascoste (`p9-anteprima.mjs`); vedi minore 3 |
| 2.3 | rinvio sempre seguito | no | sorgente V3: `followRedirect:false`, `defaultRedirect` è falso perché `redirect` c'è. 17 header Location cattivi (`127.0.0.1`, `//officina.internal`, `/\officina.internal`, `[::1]`, `2130706433`, `\t@`, CRLF): nessun host interno esce (`p3-rinvii.mjs`). I rinvii del secondo giro non si seguono |
| 3.1 | punto lento nelle sottopagine | no | ≤ 11 ms a 5 MB |
| 3.2 | byte contati prima della pulizia | no | `byte()` conta `<>` come 3 byte; ricalcolato indipendentemente |
| 3.3 | host dopo la prima `@` | no | `hostDi` coincide con `new URL().hostname` su tutti i casi, anche `\@` |
| 3.4 | commento `<!--` non chiuso | **SÌ, in variante** | vedi difetto grave |
| 3.5 | caratteri non validi nell'host | no | fuzz di 400.000 indirizzi: su circa 8.800 accettati, 0 casi in cui `new URL(url).hostname` è diverso dall'host controllato, è un IP, ha credenziali o una porta, o è interno (`p2-fuzz.mjs`) |

SSRF sugli indirizzi: 80 casi scritti a mano (`p1-ssrf.mjs`), cioè IP decimali, ottali ed esadecimali, `[::ffff:…]`, fc00, fe80, `.internal`, nomi senza punto, punto finale, larghezza piena, `。`, credenziali e porte. Nessuno passato.
Script delle prove: `/tmp/claude-0/collaudo3-n8n/prove/` (p1…p10).

VERDETTO: **BOCCIATO**, per un solo difetto grave (3.4 torna in una variante), che è funzionale e non di SSRF. Sulla sicurezza stretta regge.
