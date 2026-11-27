---
tipo: metodo
data: 2026-11-27 02:10
fonte: Nicola, 27/11/2026 01:30 — «dimmi come sei arrivato a questo ragionamento perché vorrei applicarlo su tutte le cose che c'entrano con MyCity»
stato: solo testo (nessun guardiano lo fa rispettare: è un modo di ragionare, non un freno)
---

# Il metodo dell'anello mancante

## In parole semplici
È il ragionamento con cui il 27/11 è nata la macchina che trova i clienti (flusso n8n «16 · Attività da visitare»).
Si prende una cosa di MyCity e la si guarda come una catena di passi, dal primo all'incasso.
Si cerca il passo che non fa nessuno. Si costruisce solo quello, coi pezzi che ci sono già.

## Cosa cambia per te
Puoi chiederlo su qualunque cosa: i clienti, i soldi, le consegne, i contenuti, i fornitori.
La risposta non è mai «facciamo tutto da capo»: è «manca questo pezzo, costa questo, si misura così».

## Cosa devi fare
Scrivimi «anello mancante su [cosa]». Per esempio «anello mancante sulle consegne» o «anello mancante sui soldi».

## Cosa non ho verificato
Il metodo è stato usato una volta sola, sui clienti. Non so ancora se funziona allo stesso modo su tutto.
Nessun programma controlla che una sessione lo segua: per ora è testo.

---

## I nove passi

**1. Chi è il cliente, davvero.** Prima di rispondere, si chiarisce la parola. «Clienti» per MyCity vuol dire le
attività che pagano, non i cittadini (registro dei fatti: `strategia.cliente-core`). Se la parola ha due
significati, si sceglie quello del registro e si dice l'altro in una riga.

**2. Cosa c'è già.** Si guarda prima di proporre: flussi n8n, programmi, pagine del sito, skill. Il 27/11 c'erano
già la scheda per l'agente (flusso 14) e il preventivo (flusso 20). Costruire un doppione è il primo spreco.

**3. La catena intera, dal primo passo all'incasso.** Si scrivono i passi in fila. Per i clienti:
trovare → scegliere → preparare → contattare → convincere → iscrivere → incassare → misurare.
Accanto a ogni passo si scrive chi lo fa oggi: una persona, un programma, nessuno.

**4. Il passo che non fa nessuno.** È lì che si costruisce. Il 27/11 era «trovare e scegliere»: l'agente
doveva sapere da solo dove andare. Un passo fatto male si migliora dopo; un passo che non fa nessuno blocca tutto
quello che viene dopo.

**5. Era già deciso?** Si cerca nel registro dei fatti. Spesso la regola c'è e manca solo chi la esegue. Il
27/11 la regola era `negozi.ingresso`: «la squadra mappa tutti i negozi di fresco entro 5 km e li mette in fila».
Scritta, mai fatta. Questa è la forma più comune del buco: **una regola senza motore.**

**6. Le cinque domande e i paletti** (`CONTESTO_BUSINESS.md`, §0 e §4). Quale abitudine cambia, per chi, se
rompe un paletto, se aggiunge fatica, se si vede in cassa in 2-4 settimane. Da qui è uscito il limite più
importante: la macchina trova, ma non scrive alle attività. Mandare messaggi a freddo è vietato dalla legge
sulla privacy, WhatsApp blocca il numero, e il negoziante si fida solo delle persone.

**7. Cosa fa la macchina, cosa resta a una persona.** Alla macchina il lavoro ripetitivo: leggere la mappa,
togliere catene e doppioni, mettere in fila, preparare il dossier. Alla persona quello che chiede fiducia:
entrare nel negozio, parlare col titolare.

**8. Come si vede in cassa.** Ogni macchina porta il suo conto. Per i clienti: proposte, visitate, sì,
iscritte, che pagano. Se il conto non si muove in 2-4 settimane, la macchina non serve, e lo si dice.

**9. La prova vera, e cosa non si è visto.** Prima di dire «fatto» si fa girare sui dati veri. Il 27/11: 1.037
attività lette sulla mappa, 655 in fila, la prima lista mandata. E si scrive sempre cosa non si è potuto
verificare: per esempio, che la mappa libera può essere vecchia.

## Il programma che trova le regole senza motore (passo 5, su tutto il registro)

Un indizio, non una prova: elenca le regole del registro che descrivono un lavoro ricorrente e che nessun
codice cita per nome. Un codice può eseguire una regola senza citarla (scorciatoie-note #12), quindi ogni voce
va guardata a mano prima di dire che manca.

```bash
node -e '
const fs=require("fs"),cp=require("child_process");
const r=JSON.parse(fs.readFileSync("MyCity-Vault/90-Memoria-AI/registro-fatti.json","utf8"));
const ric=/ogni (giorno|settimana|lunedì|mese|mattina|sera|notte|ora)|settimanal|mensil|ogni volta che|mappa|mette in fila|controlla|avvisa|parte(no)? subito/i;
for(const f of r.fatti){const v=String(f.valore??"");if(!ric.test(v))continue;
 let n=0;try{n=cp.execSync(`grep -rlF ${JSON.stringify(f.id)} cervello pannello/src ../N8N/flussi ../mycity/lib ../mycity/app --include=*.mjs --include=*.js --include=*.ts --include=*.tsx 2>/dev/null | grep -v node_modules | wc -l`,{encoding:"utf8"}).trim()|0}catch{}
 if(!n)console.log(f.id+" :: "+v.slice(0,140));}'
```

## La prima volta: i clienti (27/11/2026)

| Passo della catena | Chi lo faceva | Dopo il 27/11 |
|---|---|---|
| trovare le attività | nessuno | flusso 16, ogni lunedì, dalla mappa libera |
| sceglierle | nessuno | flusso 16: prima il fresco vicino a Pane Quotidiano |
| preparare il dossier | l'agente, a mano, una alla volta (flusso 14) | flusso 16 sulle prime 10, con «Chiedi all'AD» |
| contattare e convincere | l'agente, di persona | uguale: resta a una persona |
| iscrivere | flusso 20 | uguale |
| misurare | nessuno | tabella «Attività da visitare»: stato e conto del lunedì |

Gli anelli mancanti trovati lo stesso giorno, con lo stesso metodo, stanno in `LAVORO-APERTO.md` (27/11).
